import axios from "axios";
import { RailName } from "@prisma/client";
import { getCurrencyForCountry, normalizeCountry, normalizeMethod } from "@/lib/rails/shared";
import type { RailQuote, RecipientMethod } from "@/types/rail";

type KotaniRateResponse =
  | {
      rate?: number | string;
      data?: {
        rate?: number | string;
      };
    }
  | number;

type CorridorConfig = {
  methods: Partial<Record<RecipientMethod, { feePercent: number; etaMinutes: number }>>;
};

const KOTANI_TIMEOUT_MS = 5000;
const KOTANI_BASE_URL =
  process.env.KOTANI_API_URL ?? "https://sandbox-api.kotanipay.io/api/v3";

const corridorConfig: Record<string, CorridorConfig> = {
  kenya: {
    methods: {
      mobile_money: { feePercent: 1.5, etaMinutes: 8 },
    },
  },
  ghana: {
    methods: {
      mobile_money: { feePercent: 1.5, etaMinutes: 10 },
      bank: { feePercent: 1.8, etaMinutes: 35 },
    },
  },
  uganda: {
    methods: {
      mobile_money: { feePercent: 2.5, etaMinutes: 12 },
      bank: { feePercent: 2.8, etaMinutes: 40 },
    },
  },
  tanzania: {
    methods: {
      mobile_money: { feePercent: 3.0, etaMinutes: 12 },
      bank: { feePercent: 3.2, etaMinutes: 45 },
    },
  },
  rwanda: {
    methods: {
      mobile_money: { feePercent: 2.5, etaMinutes: 11 },
      bank: { feePercent: 2.7, etaMinutes: 35 },
    },
  },
  zambia: {
    methods: {
      mobile_money: { feePercent: 2.0, etaMinutes: 11 },
      bank: { feePercent: 2.0, etaMinutes: 30 },
    },
  },
  "south africa": {
    methods: {
      bank: { feePercent: 2.0, etaMinutes: 20 },
    },
  },
  southafrica: {
    methods: {
      bank: { feePercent: 2.0, etaMinutes: 20 },
    },
  },
  cameroon: {
    methods: {
      mobile_money: { feePercent: 3.5, etaMinutes: 15 },
      bank: { feePercent: 3.8, etaMinutes: 45 },
    },
  },
  "ivory coast": {
    methods: {
      mobile_money: { feePercent: 4.0, etaMinutes: 18 },
      bank: { feePercent: 4.1, etaMinutes: 50 },
    },
  },
};

function extractRate(payload: KotaniRateResponse): number | null {
  if (typeof payload === "number") {
    return payload;
  }

  const candidate = payload.rate ?? payload.data?.rate;
  if (candidate === undefined || candidate === null) {
    return null;
  }

  const rate = Number(candidate);
  return Number.isFinite(rate) ? rate : null;
}

export async function getKotaniQuote(
  amount: number,
  recipientCountry: string,
  method: RecipientMethod,
): Promise<RailQuote> {
  const countryKey = normalizeCountry(recipientCountry);
  const targetCurrency = getCurrencyForCountry(recipientCountry);
  const corridor = corridorConfig[countryKey];
  const normalizedMethod = normalizeMethod(method);

  if (!targetCurrency || !corridor) {
    return {
      railName: RailName.KOTANI,
      provider: "Kotani Pay",
      feeUsd: 0,
      feePercent: 0,
      etaMinutes: 0,
      rate: 0,
      available: false,
      reason: `Kotani corridor not configured for ${recipientCountry}.`,
      simulated: false,
      targetCurrency: targetCurrency ?? "UNKNOWN",
    };
  }

  const corridorMethod = corridor.methods[normalizedMethod];
  if (!corridorMethod) {
    return {
      railName: RailName.KOTANI,
      provider: "Kotani Pay",
      feeUsd: 0,
      feePercent: 0,
      etaMinutes: 0,
      rate: 0,
      available: false,
      reason: `Kotani does not support ${normalizedMethod} for ${recipientCountry}.`,
      simulated: false,
      targetCurrency,
    };
  }

  if (!process.env.KOTANI_API_KEY) {
    return {
      railName: RailName.KOTANI,
      provider: "Kotani Pay",
      feeUsd: 0,
      feePercent: 0,
      etaMinutes: 0,
      rate: 0,
      available: false,
      reason: "KOTANI_API_KEY is not configured.",
      simulated: false,
      targetCurrency,
    };
  }

  try {
    const response = await axios.get<KotaniRateResponse>(
      `${KOTANI_BASE_URL}/rate/USDT/${targetCurrency}`,
      {
        timeout: KOTANI_TIMEOUT_MS,
        headers: {
          Authorization: `Bearer ${process.env.KOTANI_API_KEY}`,
        },
      },
    );

    const rate = extractRate(response.data);
    if (!rate) {
      return {
        railName: RailName.KOTANI,
        provider: "Kotani Pay",
        feeUsd: 0,
        feePercent: 0,
        etaMinutes: 0,
        rate: 0,
        available: false,
        reason: "Kotani rate response did not include a usable exchange rate.",
        simulated: false,
        targetCurrency,
        raw: response.data,
      };
    }

    const feeUsd = Number((amount * (corridorMethod.feePercent / 100)).toFixed(2));

    return {
      railName: RailName.KOTANI,
      provider: "Kotani Pay",
      feeUsd,
      feePercent: corridorMethod.feePercent,
      etaMinutes: corridorMethod.etaMinutes,
      rate,
      available: true,
      simulated: false,
      targetCurrency,
      raw: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
      return {
        railName: RailName.KOTANI,
        provider: "Kotani Pay",
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
      railName: RailName.KOTANI,
      provider: "Kotani Pay",
      feeUsd: 0,
      feePercent: 0,
      etaMinutes: 0,
      rate: 0,
      available: false,
      reason:
        error instanceof Error ? error.message : "Kotani quote request failed.",
      simulated: false,
      targetCurrency,
    };
  }
}
