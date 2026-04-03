import type { RailName } from "@prisma/client";

export type RecipientMethod = "wallet" | "bank" | "mobile_money" | "cash";

export type RailQuote = {
  railName: RailName;
  provider: string;
  feeUsd: number;
  feePercent: number;
  etaMinutes: number;
  rate: number;
  available: boolean;
  reason?: string;
  simulated: boolean;
  targetCurrency: string;
  raw?: unknown;
};

export type ScoredRailQuote = RailQuote & {
  score: number;
  availabilityWeight: number;
};

export type RailQuerySummary = {
  winner: ScoredRailQuote | null;
  allResults: RailQuote[];
  scoredResults: ScoredRailQuote[];
  totalQueryTimeMs: number;
};
