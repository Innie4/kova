import { RailName } from "@prisma/client";
import { chargeRailQuery } from "@/lib/kite/x402";
import { derivePassportOwnerWallet } from "@/lib/kite/client";
import { getKiteNativeQuote } from "@/lib/rails/kite-native";
import { getKotaniQuote } from "@/lib/rails/kotani";
import { getMockQuote } from "@/lib/rails/mock";
import { getWiseQuoteForCountry } from "@/lib/rails/wise";
import type { RailQuerySummary, RailQuote, RecipientMethod, ScoredRailQuote } from "@/types/rail";

type QueryAllRailsOptions = {
  transferId?: string;
  agentAddress?: string;
  includeMock?: boolean;
};

const DEFAULT_AGENT_ADDRESS = derivePassportOwnerWallet("rail-query-agent").address;

export function scoreRoutes(railResults: RailQuote[]): ScoredRailQuote[] {
  return railResults
    .map((quote) => {
      const availabilityWeight = quote.available ? 1 : 0;
      const safeFeePercent = quote.feePercent > 0 ? quote.feePercent : Number.POSITIVE_INFINITY;
      const safeEtaMinutes = quote.etaMinutes > 0 ? quote.etaMinutes : Number.POSITIVE_INFINITY;
      const score =
        availabilityWeight === 0
          ? 0
          : (1 / safeFeePercent) * (1 / safeEtaMinutes) * availabilityWeight;

      return {
        ...quote,
        availabilityWeight,
        score: Number.isFinite(score) ? score : 0,
      };
    })
    .sort((left, right) => right.score - left.score);
}

export function selectBestRoute(scoredRoutes: ScoredRailQuote[]): ScoredRailQuote | null {
  return scoredRoutes.find((route) => route.available) ?? null;
}

async function querySingleRail(
  railName: RailName,
  amount: number,
  recipientCountry: string,
  method: RecipientMethod,
): Promise<RailQuote> {
  switch (railName) {
    case RailName.WISE:
      return getWiseQuoteForCountry(amount, recipientCountry);
    case RailName.KOTANI:
      return getKotaniQuote(amount, recipientCountry, method);
    case RailName.KITE_NATIVE:
      return getKiteNativeQuote(amount, recipientCountry);
    case RailName.MOCK:
      return getMockQuote(amount, recipientCountry);
    default:
      throw new Error(`Unsupported rail: ${railName satisfies never}`);
  }
}

export async function queryAllRails(
  amount: number,
  recipientCountry: string,
  method: RecipientMethod,
  options: QueryAllRailsOptions = {},
): Promise<RailQuerySummary> {
  const startedAt = Date.now();
  const rails: RailName[] = [RailName.WISE, RailName.KOTANI, RailName.KITE_NATIVE];
  if (options.includeMock ?? true) {
    rails.push(RailName.MOCK);
  }

  const settled = await Promise.allSettled(
    rails.map((railName) =>
      querySingleRail(railName, amount, recipientCountry, method),
    ),
  );

  const allResults: RailQuote[] = settled.flatMap((result, index) => {
    if (result.status === "fulfilled") {
      return [result.value];
    }

    return [
      {
        railName: rails[index],
        provider: rails[index],
        feeUsd: 0,
        feePercent: 0,
        etaMinutes: 0,
        rate: 0,
        available: false,
        reason:
          result.reason instanceof Error
            ? result.reason.message
            : "Rail query failed.",
        simulated: rails[index] === RailName.MOCK,
        targetCurrency: "UNKNOWN",
      },
    ];
  });

  const agentAddress = options.agentAddress ?? DEFAULT_AGENT_ADDRESS;
  await Promise.allSettled(
    allResults.map((quote) =>
      chargeRailQuery(
        agentAddress,
        quote.railName,
        "0.001",
        options.transferId,
      ),
    ),
  );

  const scoredResults = scoreRoutes(allResults);
  const winner = selectBestRoute(scoredResults);

  return {
    winner,
    allResults,
    scoredResults,
    totalQueryTimeMs: Date.now() - startedAt,
  };
}
