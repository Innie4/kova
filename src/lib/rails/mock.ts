import { RailName } from "@prisma/client";
import { getCurrencyForCountry } from "@/lib/rails/shared";
import type { RailQuote } from "@/types/rail";

export async function getMockQuote(
  amount: number,
  recipientCountry: string,
): Promise<RailQuote> {
  return {
    railName: RailName.MOCK,
    provider: "Simulated fallback rail",
    feeUsd: Number((amount * 0.025).toFixed(2)),
    feePercent: 2.5,
    etaMinutes: 30,
    rate: 1,
    available: true,
    reason: "[SIMULATED]",
    simulated: true,
    targetCurrency: getCurrencyForCountry(recipientCountry) ?? "USD",
  };
}
