import { RailName } from "@prisma/client";
import { getCurrencyForCountry } from "@/lib/rails/shared";
import type { RailQuote } from "@/types/rail";

export async function getKiteNativeQuote(
  amount: number,
  recipientCountry?: string,
): Promise<RailQuote> {
  return {
    railName: RailName.KITE_NATIVE,
    provider: "Kite Native USDC",
    feeUsd: Number((amount * 0.004).toFixed(2)),
    feePercent: 0.4,
    etaMinutes: 3,
    rate: 1,
    available: true,
    simulated: false,
    targetCurrency: recipientCountry
      ? (getCurrencyForCountry(recipientCountry) ?? "USD")
      : "USD",
  };
}
