import axios from "axios";
import { RailName } from "@prisma/client";
import { getCurrencyForCountry, minutesFromNow } from "@/lib/rails/shared";
import type { RailQuote } from "@/types/rail";

type WiseQuoteResponse = {
  rate?: number;
  targetCurrency?: string;
  sourceCurrency?: string;
  paymentOptions?: Array<{
    disabled?: boolean;
    disabledReason?: {
      message?: string;
    };
    estimatedDelivery?: string;
    feePercentage?: number;
    fee?: {
      total?: number;
    };
    targetAmount?: number;
  }>;
};

const WISE_TIMEOUT_MS = 5000;
const WISE_BASE_URL = process.env.WISE_API_URL ?? "https://api.wise-sandbox.com";

function selectBestPaymentOption(payload: WiseQuoteResponse) {
  if (!payload.paymentOptions?.length) {
    return null;
  }

  const enabled = payload.paymentOptions.filter((option) => !option.disabled);
  const candidates = enabled.length > 0 ? enabled : payload.paymentOptions;

  return [...candidates].sort((left, right) => {
    const leftFee = left.fee?.total ?? Number.POSITIVE_INFINITY;
    const rightFee = right.fee?.total ?? Number.POSITIVE_INFINITY;
    return leftFee - rightFee;
  })[0];
}

export async function getWiseQuote(
  sourceCurrency: string,
  targetCurrency: string,
  amount: number,
): Promise<RailQuote> {
  try {
    const response = await axios.post<WiseQuoteResponse>(
      `${WISE_BASE_URL}/v3/quotes`,
      {
        sourceCurrency,
        targetCurrency,
        sourceAmount: amount,
      },
      {
        timeout: WISE_TIMEOUT_MS,
        headers: process.env.WISE_SANDBOX_API_KEY
          ? {
              Authorization: `Bearer ${process.env.WISE_SANDBOX_API_KEY}`,
            }
          : undefined,
      },
    );

    const payload = response.data;
    const option = selectBestPaymentOption(payload);
    const feeUsd = option?.fee?.total ?? 0;
    const feePercent = option?.feePercentage
      ? option.feePercentage * 100
      : amount > 0
        ? (feeUsd / amount) * 100
        : 0;

    return {
      railName: RailName.WISE,
      provider: "Wise Sandbox",
      feeUsd,
      feePercent,
      etaMinutes: minutesFromNow(option?.estimatedDelivery),
      rate: payload.rate ?? 0,
      available: !option?.disabled,
      reason: option?.disabledReason?.message,
      simulated: false,
      targetCurrency,
      raw: payload,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
      return {
        railName: RailName.WISE,
        provider: "Wise Sandbox",
        feeUsd: 0,
        feePercent: 0,
        etaMinutes: 0,
        rate: 0,
        available: false,
        reason: "timeout",
        simulated: false,
        targetCurrency,
      };
    }

    return {
      railName: RailName.WISE,
      provider: "Wise Sandbox",
      feeUsd: 0,
      feePercent: 0,
      etaMinutes: 0,
      rate: 0,
      available: false,
      reason:
        error instanceof Error ? error.message : "Wise quote request failed.",
      simulated: false,
      targetCurrency,
    };
  }
}

export async function getWiseQuoteForCountry(
  amount: number,
  recipientCountry: string,
): Promise<RailQuote> {
  const targetCurrency = getCurrencyForCountry(recipientCountry);

  if (!targetCurrency) {
    return {
      railName: RailName.WISE,
      provider: "Wise Sandbox",
      feeUsd: 0,
      feePercent: 0,
      etaMinutes: 0,
      rate: 0,
      available: false,
      reason: `Unsupported target country for Wise quote: ${recipientCountry}`,
      simulated: false,
      targetCurrency: "UNKNOWN",
    };
  }

  return getWiseQuote("USD", targetCurrency, amount);
}
