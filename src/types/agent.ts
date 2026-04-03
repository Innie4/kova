import type {
  AgentLogStep,
  NotificationStatus,
  RailName,
  TransferStatus,
} from "@prisma/client";
import type { RailQuote, ScoredRailQuote } from "@/types/rail";

export type IntentParseField = "amount" | "country" | "recipient";

export type ParsedIntent = {
  amount: number;
  currency: string;
  country: string;
  recipientHint: string | null;
};

export type SerializedTransfer = {
  id: string;
  senderId: string;
  recipientId: string;
  amountUsd: number;
  feeUsd: number;
  savingsUsd: number;
  netDeliveryUsd: number;
  routeSelected: RailName | null;
  routeReason: string | null;
  status: TransferStatus;
  requiresConfirmation: boolean;
  intentRaw: string;
  kiteAttestationHash: string | null;
  kiteAttestationUrl: string | null;
  kiteTxHash: string | null;
  notificationStatus: NotificationStatus;
  createdAt: string;
  completedAt: string | null;
};

export type TransferPreview = {
  transferId: string;
  transfer: SerializedTransfer;
  allResults: RailQuote[];
  recommendedRoute: ScoredRailQuote | null;
  totalQueryTimeMs: number;
  requiresConfirmation: boolean;
};

export type TransferExecutionPreview = {
  transferId: string;
  route: RailName | null;
  amountUsd: number;
  feeUsd: number;
  netDeliveryUsd: number;
  reason: string | null;
  requiresConfirmation: boolean;
};

export type RouteExecutionReceipt = {
  txHash: string;
  explorerUrl: string | null;
  simulated: boolean;
  settlementAddress: string;
  providerReference: string;
};

export type ExecutionCompletedResult = {
  status: "completed";
  transfer: SerializedTransfer;
  attestationUrl: string | null;
  savedAmount: number;
  selectedRoute: RailName | null;
};

export type ExecutionAwaitingConfirmationResult = {
  status: "awaiting_confirmation";
  preview: TransferExecutionPreview;
};

export type ExecutionFailedResult = {
  status: "failed";
  transferId: string;
  reason: string;
};

export type ExecutionResult =
  | ExecutionCompletedResult
  | ExecutionAwaitingConfirmationResult
  | ExecutionFailedResult;

export type NotificationPayload = {
  transferId: string;
  amountUsd: number;
  senderName: string;
  recipientName: string;
  route: RailName | null;
  collectionCode: string;
  status: TransferStatus;
};

export type NotificationDeliveryResult = {
  status: "sent" | "failed" | "skipped";
  sid: string | null;
  provider: "twilio" | "demo";
  error: string | null;
};

export type AgentLogRecord = {
  step: AgentLogStep;
  detail: Record<string, unknown>;
};
