import type { RecipientMethod } from "@/types/rail";

const countryCurrencyMap: Record<string, string> = {
  nigeria: "NGN",
  kenya: "KES",
  ghana: "GHS",
  uganda: "UGX",
  tanzania: "TZS",
  rwanda: "RWF",
  zambia: "ZMW",
  southafrica: "ZAR",
  "south africa": "ZAR",
  cameroon: "XAF",
  "ivory coast": "XOF",
  "cote d'ivoire": "XOF",
  senegal: "XOF",
};

export function normalizeCountry(country: string): string {
  return country.trim().toLowerCase();
}

export function getCurrencyForCountry(country: string): string | null {
  return countryCurrencyMap[normalizeCountry(country)] ?? null;
}

export function normalizeMethod(method: string): RecipientMethod {
  if (method === "mobile_money" || method === "wallet" || method === "cash") {
    return method;
  }

  return "bank";
}

export function minutesFromNow(isoTimestamp?: string | null): number {
  if (!isoTimestamp) {
    return 60;
  }

  const target = new Date(isoTimestamp).getTime();
  if (Number.isNaN(target)) {
    return 60;
  }

  return Math.max(1, Math.round((target - Date.now()) / 60000));
}

export function timeoutReason() {
  return {
    available: false,
    reason: "timeout",
  } as const;
}
