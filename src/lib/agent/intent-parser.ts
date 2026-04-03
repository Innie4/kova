import type { IntentParseField, ParsedIntent } from "@/types/agent";

const countryAliases: Record<string, string> = {
  nigeria: "Nigeria",
  lagos: "Nigeria",
  abuja: "Nigeria",
  kano: "Nigeria",
  ghana: "Ghana",
  accra: "Ghana",
  kenya: "Kenya",
  nairobi: "Kenya",
  uganda: "Uganda",
  kampala: "Uganda",
  tanzania: "Tanzania",
  dar: "Tanzania",
  rwanda: "Rwanda",
  kigali: "Rwanda",
  zambia: "Zambia",
  lusaka: "Zambia",
  cameroon: "Cameroon",
  douala: "Cameroon",
  yaounde: "Cameroon",
  "south africa": "South Africa",
  johannesburg: "South Africa",
  cape: "South Africa",
};

const phonePrefixToCountry: Array<[RegExp, string]> = [
  [/^\+234/, "Nigeria"],
  [/^\+233/, "Ghana"],
  [/^\+254/, "Kenya"],
  [/^\+256/, "Uganda"],
  [/^\+255/, "Tanzania"],
  [/^\+250/, "Rwanda"],
  [/^\+260/, "Zambia"],
  [/^\+237/, "Cameroon"],
  [/^\+27/, "South Africa"],
];

const currencyByToken: Record<string, string> = {
  "$": "USD",
  usd: "USD",
  dollar: "USD",
  dollars: "USD",
  "£": "GBP",
  gbp: "GBP",
  pound: "GBP",
  pounds: "GBP",
  "€": "EUR",
  eur: "EUR",
  euro: "EUR",
  euros: "EUR",
  ngn: "NGN",
  naira: "NGN",
  kes: "KES",
  ksh: "KES",
  shillings: "KES",
  ghs: "GHS",
  cedis: "GHS",
};

export class IntentParseError extends Error {
  readonly code = "INTENT_PARSE_FAILED";
  readonly field: IntentParseField;
  readonly rawText: string;

  constructor(field: IntentParseField, rawText: string, message: string) {
    super(message);
    this.name = "IntentParseError";
    this.field = field;
    this.rawText = rawText;
  }
}

function normalizeAmount(candidate: string): number {
  const amount = Number(candidate.replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  return amount;
}

function parseAmountAndCurrency(rawText: string): Pick<ParsedIntent, "amount" | "currency"> {
  const symbolMatch = rawText.match(/([$£€])\s?(\d+(?:[.,]\d{1,2})?)/i);
  if (symbolMatch) {
    return {
      amount: normalizeAmount(symbolMatch[2]),
      currency: currencyByToken[symbolMatch[1]] ?? "USD",
    };
  }

  const codeBeforeAmountMatch = rawText.match(
    /\b(usd|gbp|eur|ngn|kes|ghs)\s?(\d+(?:[.,]\d{1,2})?)\b/i,
  );
  if (codeBeforeAmountMatch) {
    return {
      amount: normalizeAmount(codeBeforeAmountMatch[2]),
      currency:
        currencyByToken[codeBeforeAmountMatch[1].toLowerCase()] ?? "USD",
    };
  }

  const amountBeforeCodeMatch = rawText.match(
    /(\d+(?:[.,]\d{1,2})?)\s?(usd|dollars?|gbp|pounds?|eur|euros?|ngn|naira|kes|ksh|ghs|cedis)\b/i,
  );
  if (amountBeforeCodeMatch) {
    return {
      amount: normalizeAmount(amountBeforeCodeMatch[1]),
      currency:
        currencyByToken[amountBeforeCodeMatch[2].toLowerCase()] ?? "USD",
    };
  }

  const numberMatch = rawText.match(/\b(\d+(?:[.,]\d{1,2})?)\b/);
  if (numberMatch) {
    return {
      amount: normalizeAmount(numberMatch[1]),
      currency: "USD",
    };
  }

  throw new IntentParseError(
    "amount",
    rawText,
    "Kova could not find a transfer amount in that request.",
  );
}

function resolveCountryFromPhone(rawText: string): string | null {
  const phoneMatch = rawText.match(/(\+\d{7,15})/);
  if (!phoneMatch) {
    return null;
  }

  return (
    phonePrefixToCountry.find(([pattern]) => pattern.test(phoneMatch[1]))?.[1] ??
    null
  );
}

function parseCountry(rawText: string): string {
  const lower = rawText.toLowerCase();
  const phoneCountry = resolveCountryFromPhone(rawText);
  if (phoneCountry) {
    return phoneCountry;
  }

  const matchedAlias = Object.keys(countryAliases).find((alias) =>
    lower.includes(alias),
  );

  return matchedAlias ? countryAliases[matchedAlias] : "Unknown";
}

function parseRecipientHint(rawText: string, country: string): string | null {
  const phoneMatch = rawText.match(/(\+\d{7,15})/);
  if (phoneMatch) {
    return phoneMatch[1];
  }

  const toMatch = rawText.match(/\bto\b\s+(.+)$/i);
  if (!toMatch) {
    return null;
  }

  let hint = toMatch[1]
    .replace(/[.?!]/g, "")
    .replace(/\bvia\b.*$/i, "")
    .replace(/\bin\s+[a-z\s]+$/i, (value) => {
      const normalized = value.replace(/\bin\s+/i, "").trim().toLowerCase();
      return countryAliases[normalized] || normalized === country.toLowerCase()
        ? ""
        : value;
    })
    .trim();

  if (country !== "Unknown") {
    hint = hint.replace(new RegExp(`\\b${country}\\b`, "i"), "").trim();
  }

  const aliasToken = Object.keys(countryAliases).find((alias) =>
    hint.toLowerCase().endsWith(alias),
  );
  if (aliasToken) {
    hint = hint.slice(0, -aliasToken.length).trim();
  }

  return hint.length > 0 ? hint : null;
}

export function parseTransferIntent(rawText: string): ParsedIntent {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new IntentParseError(
      "amount",
      rawText,
      "Kova needs a transfer instruction before it can parse anything.",
    );
  }

  const { amount, currency } = parseAmountAndCurrency(trimmed);
  const country = parseCountry(trimmed);
  const recipientHint = parseRecipientHint(trimmed, country);

  return {
    amount,
    currency,
    country,
    recipientHint,
  };
}
