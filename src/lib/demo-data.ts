import { RailName, TransferStatus } from "@prisma/client";

export type DemoRecipient = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  phone: string;
  method: "wallet" | "bank" | "mobile_money" | "cash";
  relationship: string;
};

export type DemoRoute = {
  railName: RailName;
  label: string;
  feeUsd: number;
  feePercent: number;
  eta: string;
  etaMinutes: number;
  score: number;
  available: boolean;
  simulated?: boolean;
  reason: string;
};

export type DemoTransfer = {
  id: string;
  recipientId: string;
  recipientName: string;
  country: string;
  countryCode: string;
  amountUsd: number;
  netDeliveryUsd: number;
  feeUsd: number;
  savedUsd: number;
  route: RailName;
  routeLabel: string;
  status: TransferStatus;
  timestamp: string;
  attestationHash: string;
  attestationUrl: string;
  txHash: string;
  routeReason: string;
  railsQueried: DemoRoute[];
};

export type DemoWalletActivity = {
  id: string;
  direction: "in" | "out";
  amountUsd: number;
  label: string;
  timestamp: string;
  txHash: string;
};

export const demoUser = {
  name: "Itoro A.",
  email: "itoro@kova.app",
  phone: "+234 801 234 5678",
  country: "Nigeria",
  balanceUsd: 1000,
  totalSavedUsd: 47.3,
  last30DaySavedUsd: 18.4,
  passportAddress: "0x7E71A6dC8A68d86F5b4e993A0dA5a6714aC98510",
  passportHash:
    "0x912be2f28a4fd2bbd6371d4a5b7ee8f2ca0a8f439de4aeaa42c2289d87c0483f",
  reputationScore: 94,
  totalTransfers: 18,
};

export const demoRecipients: DemoRecipient[] = [
  {
    id: "recipient-mum",
    name: "Mum",
    country: "Nigeria",
    countryCode: "NG",
    phone: "+234 800 111 0091",
    method: "wallet",
    relationship: "Family",
  },
  {
    id: "recipient-ama",
    name: "Ama Mensah",
    country: "Ghana",
    countryCode: "GH",
    phone: "+233 540 222 551",
    method: "mobile_money",
    relationship: "Sibling",
  },
  {
    id: "recipient-daniel",
    name: "Daniel Otieno",
    country: "Kenya",
    countryCode: "KE",
    phone: "+254 711 004 919",
    method: "mobile_money",
    relationship: "Supplier",
  },
];

export const routeMatrix: DemoRoute[] = [
  {
    railName: RailName.WISE,
    label: "Wise",
    feeUsd: 4.2,
    feePercent: 2.8,
    eta: "~1 hour",
    etaMinutes: 60,
    score: 0.006,
    available: true,
    reason: "Good FX rate, but slower than the native route.",
  },
  {
    railName: RailName.KOTANI,
    label: "Kotani Pay",
    feeUsd: 2.1,
    feePercent: 1.4,
    eta: "~8 minutes",
    etaMinutes: 8,
    score: 0.089,
    available: true,
    reason: "Fast mobile money corridor for African off-ramp.",
  },
  {
    railName: RailName.KITE_NATIVE,
    label: "Kite USDC",
    feeUsd: 0.6,
    feePercent: 0.4,
    eta: "~3 minutes",
    etaMinutes: 3,
    score: 0.833,
    available: true,
    reason: "Lowest fee and fastest settlement across the available rails.",
  },
  {
    railName: RailName.MOCK,
    label: "Reserve Demo Rail",
    feeUsd: 3.75,
    feePercent: 2.5,
    eta: "~30 minutes",
    etaMinutes: 30,
    score: 0.013,
    available: true,
    simulated: true,
    reason: "Deterministic fallback when a sandbox payout path is unavailable.",
  },
];

export const demoTransfers: DemoTransfer[] = [
  {
    id: "trf_20260403_001",
    recipientId: "recipient-mum",
    recipientName: "Mum",
    country: "Nigeria",
    countryCode: "NG",
    amountUsd: 150,
    netDeliveryUsd: 149.4,
    feeUsd: 0.6,
    savedUsd: 9.6,
    route: RailName.KITE_NATIVE,
    routeLabel: "Kite USDC",
    status: TransferStatus.COMPLETED,
    timestamp: "2026-04-03T09:12:00.000Z",
    attestationHash:
      "0x4da0b8f714ce5f8d7f39d090be5eefb39f745c3d5cfaafb5878b05f3c0e357ca",
    attestationUrl:
      "https://testnet.kitescan.ai/tx/0x4da0b8f714ce5f8d7f39d090be5eefb39f745c3d5cfaafb5878b05f3c0e357ca",
    txHash:
      "0x7bdb47f6e5ef4a797d2fdf9f6a2430d3647d8c8108be6e55ad1bd6d3fceab145",
    routeReason:
      "Kite USDC was selected because it delivered the strongest combined fee and speed score.",
    railsQueried: routeMatrix,
  },
  {
    id: "trf_20260402_011",
    recipientId: "recipient-ama",
    recipientName: "Ama Mensah",
    country: "Ghana",
    countryCode: "GH",
    amountUsd: 220,
    netDeliveryUsd: 217.9,
    feeUsd: 2.1,
    savedUsd: 6.4,
    route: RailName.KOTANI,
    routeLabel: "Kotani Pay",
    status: TransferStatus.COMPLETED,
    timestamp: "2026-04-02T17:45:00.000Z",
    attestationHash:
      "0x7e3fb5a29ea3d74afbd58c57443f143e33796d97ef6e0a6c4ca3ce56437dfaab",
    attestationUrl:
      "https://testnet.kitescan.ai/tx/0x7e3fb5a29ea3d74afbd58c57443f143e33796d97ef6e0a6c4ca3ce56437dfaab",
    txHash:
      "0xfa1268164a92da36b6455d4539bf8074ac65d8fe1559fd958456b9d2d6999982",
    routeReason:
      "Kotani Pay won because the target corridor favored mobile money over bank delivery.",
    railsQueried: routeMatrix,
  },
  {
    id: "trf_20260401_004",
    recipientId: "recipient-daniel",
    recipientName: "Daniel Otieno",
    country: "Kenya",
    countryCode: "KE",
    amountUsd: 95,
    netDeliveryUsd: 94.4,
    feeUsd: 0.6,
    savedUsd: 4.2,
    route: RailName.KITE_NATIVE,
    routeLabel: "Kite USDC",
    status: TransferStatus.COMPLETED,
    timestamp: "2026-04-01T11:15:00.000Z",
    attestationHash:
      "0x0ecc2f15bd8c72745323a173bb1025206739c0c0c72d6613f190da7be1d89903",
    attestationUrl:
      "https://testnet.kitescan.ai/tx/0x0ecc2f15bd8c72745323a173bb1025206739c0c0c72d6613f190da7be1d89903",
    txHash:
      "0x88f8ef5c76c6ac2f4bf34e0f2428e0e4df6a8cc47c9df1f0efffe2ae9236a80b",
    routeReason:
      "Kite USDC remained cheapest even after corridor-specific provider fees were included.",
    railsQueried: routeMatrix,
  },
  {
    id: "trf_20260330_002",
    recipientId: "recipient-mum",
    recipientName: "Mum",
    country: "Nigeria",
    countryCode: "NG",
    amountUsd: 400,
    netDeliveryUsd: 395.8,
    feeUsd: 4.2,
    savedUsd: 0,
    route: RailName.WISE,
    routeLabel: "Wise",
    status: TransferStatus.PREVIEWED,
    timestamp: "2026-03-30T08:20:00.000Z",
    attestationHash:
      "0x51be7f450d4ca2a76ca60ff8de17466eb17fb51c37f3451a03b64535d9cc6241",
    attestationUrl:
      "https://testnet.kitescan.ai/tx/0x51be7f450d4ca2a76ca60ff8de17466eb17fb51c37f3451a03b64535d9cc6241",
    txHash:
      "0x3b0f99e4b4158b78edabb8b7a5220aa70b8544df7effcd5faee3df7ad6392b62",
    routeReason:
      "Awaiting payout confirmation after the route preview was accepted.",
    railsQueried: routeMatrix,
  },
  {
    id: "trf_20260326_009",
    recipientId: "recipient-ama",
    recipientName: "Ama Mensah",
    country: "Ghana",
    countryCode: "GH",
    amountUsd: 180,
    netDeliveryUsd: 175.5,
    feeUsd: 4.5,
    savedUsd: 0,
    route: RailName.MOCK,
    routeLabel: "Reserve Demo Rail",
    status: TransferStatus.FAILED,
    timestamp: "2026-03-26T13:50:00.000Z",
    attestationHash:
      "0x29de7ed524f1d49c5fe30832f0f5c81a1e9dfe954601b6ce940f1dc618c2b54d",
    attestationUrl:
      "https://testnet.kitescan.ai/tx/0x29de7ed524f1d49c5fe30832f0f5c81a1e9dfe954601b6ce940f1dc618c2b54d",
    txHash:
      "0x75eac221830a825e2fa740e102310bdfc7e363f5fd5e738b0f667b1e5d6cc53d",
    routeReason:
      "Sandbox payout endpoint timed out, so the fallback rail was recorded and surfaced.",
    railsQueried: routeMatrix,
  },
];

export const walletActivity: DemoWalletActivity[] = [
  {
    id: "wallet_in_1",
    direction: "in",
    amountUsd: 500,
    label: "USDC deposit from Base",
    timestamp: "2026-04-02T10:24:00.000Z",
    txHash:
      "0xf19ee23b98399231f8a865697693d0261fdfc2ea95a9afcbfb3158cfd28d1dc8",
  },
  {
    id: "wallet_out_1",
    direction: "out",
    amountUsd: 150.6,
    label: "Transfer to Mum via Kite USDC",
    timestamp: "2026-04-03T09:12:00.000Z",
    txHash:
      "0x7bdb47f6e5ef4a797d2fdf9f6a2430d3647d8c8108be6e55ad1bd6d3fceab145",
  },
  {
    id: "wallet_out_2",
    direction: "out",
    amountUsd: 95.6,
    label: "Transfer to Daniel via Kite USDC",
    timestamp: "2026-04-01T11:15:00.000Z",
    txHash:
      "0x88f8ef5c76c6ac2f4bf34e0f2428e0e4df6a8cc47c9df1f0efffe2ae9236a80b",
  },
];

export const onboardingTrustPoints = [
  "Bank-level security",
  "Powered by Kite Chain",
  "Route proofs written on-chain",
];

export const sendExamples = [
  "Send $200 to Lagos",
  "Transfer 150 dollars to Mum in Nigeria",
  "Send 200 to +2348012345678",
];

export const agentExecutionSteps = [
  "Intent parsed",
  "Rails queried (x402 payments made)",
  "Best route selected",
  "Executing transfer",
  "Writing to Kite chain",
  "Notifying recipient",
];

export const transferMilestones = [
  {
    label: "Total saved",
    value: "$47.30",
  },
  {
    label: "Passport reputation",
    value: "94 / 100",
  },
  {
    label: "Average delivery",
    value: "6 min",
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getDemoTransferByHash(hash: string) {
  return demoTransfers.find(
    (transfer) => transfer.attestationHash.toLowerCase() === hash.toLowerCase(),
  );
}
