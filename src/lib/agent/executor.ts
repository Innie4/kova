import {
  AgentLogStep,
  NotificationStatus,
  PreferredMethod,
  RailName,
  TransferStatus,
} from "@prisma/client";
import { Prisma } from "@prisma/client";
import { ethers } from "ethers";
import { buildAttestationPayload, publishAttestation } from "@/lib/kite/attestation";
import { sendUSDCFromPassport } from "@/lib/kite/client";
import { sendRecipientSMS, sendSenderConfirmation } from "@/lib/notifications/twilio";
import { queryAllRails, scoreRoutes, selectBestRoute } from "@/lib/rails/orchestrator";
import { db } from "@/server/db";
import type {
  ExecutionResult,
  NotificationPayload,
  ParsedIntent,
  RouteExecutionReceipt,
  SerializedTransfer,
  TransferPreview,
} from "@/types/agent";
import type { RailQuote, RecipientMethod, ScoredRailQuote } from "@/types/rail";

type TransferWithRelations = Awaited<
  ReturnType<typeof db.transfer.findUnique>
> & {
  sender: {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
  };
  recipient: {
    id: string;
    name: string;
    country: string;
    phone: string;
    preferredMethod: PreferredMethod;
  };
  railQueries: Array<{
    railName: RailName;
    feeUsd: { toString(): string };
    etaMinutes: number;
    rate: { toString(): string };
    available: boolean;
    reason: string | null;
  }>;
};

type DatabaseClient = typeof db;

type AgentDependencies = {
  db: DatabaseClient;
  queryAllRails: typeof queryAllRails;
  publishAttestation: typeof publishAttestation;
  sendUSDCFromPassport: typeof sendUSDCFromPassport;
  sendRecipientSMS: typeof sendRecipientSMS;
  sendSenderConfirmation: typeof sendSenderConfirmation;
  now: () => Date;
};

export type PrepareTransferParams = {
  userId: string;
  intentResult: ParsedIntent;
  recipientId: string;
  requireConfirmationAbove: number;
  transferId?: string;
  rawText?: string;
  forceRefresh?: boolean;
};

export type ExecuteTransferParams = PrepareTransferParams & {
  skipConfirmation?: boolean;
};

const defaultDependencies: AgentDependencies = {
  db,
  queryAllRails,
  publishAttestation,
  sendUSDCFromPassport,
  sendRecipientSMS,
  sendSenderConfirmation,
  now: () => new Date(),
};

const railDisplayName: Record<RailName, string> = {
  [RailName.WISE]: "Wise",
  [RailName.KOTANI]: "Kotani Pay",
  [RailName.KITE_NATIVE]: "Kite Native",
  [RailName.MOCK]: "Simulated rail",
};

function toDecimalString(value: number) {
  return value.toFixed(6);
}

function transferMethodFromEnum(method: PreferredMethod): RecipientMethod {
  switch (method) {
    case PreferredMethod.WALLET:
      return "wallet";
    case PreferredMethod.MOBILE_MONEY:
      return "mobile_money";
    case PreferredMethod.CASH:
      return "cash";
    default:
      return "bank";
  }
}

function normalizeIntentRaw(intent: ParsedIntent, rawText?: string) {
  return (
    rawText ??
    `Send ${intent.amount} ${intent.currency} to ${intent.recipientHint ?? intent.country}`
  );
}

function serializeTransfer(transfer: {
  id: string;
  senderId: string;
  recipientId: string;
  amountUsd: { toString(): string } | number;
  feeUsd: { toString(): string } | number;
  savingsUsd: { toString(): string } | number;
  netDeliveryUsd: { toString(): string } | number;
  routeSelected: RailName | null;
  routeReason: string | null;
  status: TransferStatus;
  requiresConfirmation: boolean;
  intentRaw: string;
  kiteAttestationHash: string | null;
  kiteAttestationUrl: string | null;
  kiteTxHash: string | null;
  notificationStatus: NotificationStatus;
  createdAt: Date;
  completedAt: Date | null;
}): SerializedTransfer {
  return {
    id: transfer.id,
    senderId: transfer.senderId,
    recipientId: transfer.recipientId,
    amountUsd: Number(transfer.amountUsd.toString()),
    feeUsd: Number(transfer.feeUsd.toString()),
    savingsUsd: Number(transfer.savingsUsd.toString()),
    netDeliveryUsd: Number(transfer.netDeliveryUsd.toString()),
    routeSelected: transfer.routeSelected,
    routeReason: transfer.routeReason,
    status: transfer.status,
    requiresConfirmation: transfer.requiresConfirmation,
    intentRaw: transfer.intentRaw,
    kiteAttestationHash: transfer.kiteAttestationHash,
    kiteAttestationUrl: transfer.kiteAttestationUrl,
    kiteTxHash: transfer.kiteTxHash,
    notificationStatus: transfer.notificationStatus,
    createdAt: transfer.createdAt.toISOString(),
    completedAt: transfer.completedAt?.toISOString() ?? null,
  };
}

function buildRouteReason(
  winner: ScoredRailQuote,
  scoredRoutes: ScoredRailQuote[],
) {
  const fasterThan = scoredRoutes
    .filter((route) => route.railName !== winner.railName && route.available)
    .every((route) => winner.etaMinutes <= route.etaMinutes);
  const cheaperThan = scoredRoutes
    .filter((route) => route.railName !== winner.railName && route.available)
    .every((route) => winner.feePercent <= route.feePercent);

  if (cheaperThan && fasterThan) {
    return `${railDisplayName[winner.railName]} was selected because it is both the cheapest and fastest available option.`;
  }

  if (cheaperThan) {
    return `${railDisplayName[winner.railName]} was selected because it offered the lowest effective fee.`;
  }

  if (fasterThan) {
    return `${railDisplayName[winner.railName]} was selected because it offered the fastest delivery window.`;
  }

  return `${railDisplayName[winner.railName]} was selected because its combined fee and ETA score beat the other available rails.`;
}

function calculateSavings(allResults: RailQuote[], winner: RailQuote) {
  const availableFees = allResults
    .filter((result) => result.available)
    .map((result) => result.feeUsd);
  const benchmarkFee =
    availableFees.length > 0 ? Math.max(...availableFees) : winner.feeUsd;

  return Number(Math.max(0, benchmarkFee - winner.feeUsd).toFixed(2));
}

function deriveRecipientSettlementAddress(seed: string) {
  return new ethers.Wallet(
    ethers.keccak256(ethers.toUtf8Bytes(`kova-recipient:${seed}`)),
  ).address;
}

async function logAgentStep(
  database: DatabaseClient,
  transferId: string,
  step: AgentLogStep,
  detail: Record<string, unknown>,
) {
  await database.agentLog.create({
    data: {
      transferId,
      step,
      detail: detail as Prisma.InputJsonValue,
    },
  });
}

async function hydrateTransfer(
  database: DatabaseClient,
  transferId: string,
  userId: string,
) {
  const transfer = (await database.transfer.findUnique({
    where: {
      id: transferId,
    },
    include: {
      sender: true,
      recipient: true,
      railQueries: true,
    },
  })) as TransferWithRelations | null;

  if (!transfer || transfer.senderId !== userId) {
    throw new Error("Transfer not found for this user.");
  }

  return transfer;
}

function hydrateQuotesFromTransfer(transfer: TransferWithRelations): RailQuote[] {
  return transfer.railQueries.map((query) => ({
    railName: query.railName,
    provider: railDisplayName[query.railName],
    feeUsd: Number(query.feeUsd.toString()),
    feePercent:
      Number(transfer.amountUsd.toString()) > 0
        ? (Number(query.feeUsd.toString()) / Number(transfer.amountUsd.toString())) * 100
        : 0,
    etaMinutes: query.etaMinutes,
    rate: Number(query.rate.toString()),
    available: query.available,
    reason: query.reason ?? undefined,
    simulated: query.railName === RailName.MOCK,
    targetCurrency: "UNKNOWN",
  }));
}

async function persistRailQuotes(
  database: DatabaseClient,
  transferId: string,
  allResults: RailQuote[],
  totalQueryTimeMs: number,
) {
  await database.railQuery.deleteMany({
    where: {
      transferId,
    },
  });

  await database.railQuery.createMany({
    data: allResults.map((quote) => ({
      transferId,
      railName: quote.railName,
      feeUsd: toDecimalString(quote.feeUsd),
      etaMinutes: quote.etaMinutes,
      rate: toDecimalString(quote.rate),
      available: quote.available,
      reason: quote.reason ?? null,
      queryTimeMs: totalQueryTimeMs,
    })),
  });
}

async function ensureDraftTransfer(
  params: PrepareTransferParams,
  dependencies: AgentDependencies,
) {
  if (params.transferId) {
    return hydrateTransfer(dependencies.db, params.transferId, params.userId);
  }

  const createdTransfer = (await dependencies.db.transfer.create({
    data: {
      senderId: params.userId,
      recipientId: params.recipientId,
      amountUsd: toDecimalString(params.intentResult.amount),
      feeUsd: toDecimalString(0),
      savingsUsd: toDecimalString(0),
      netDeliveryUsd: toDecimalString(params.intentResult.amount),
      status: TransferStatus.DRAFT,
      requiresConfirmation:
        params.intentResult.amount > params.requireConfirmationAbove,
      intentRaw: normalizeIntentRaw(params.intentResult, params.rawText),
    },
    include: {
      sender: true,
      recipient: true,
      railQueries: true,
    },
  })) as TransferWithRelations;

  return createdTransfer;
}

export async function prepareTransfer(
  params: PrepareTransferParams,
  overrides: Partial<AgentDependencies> = {},
): Promise<TransferPreview> {
  const dependencies = {
    ...defaultDependencies,
    ...overrides,
  };
  const transfer = await ensureDraftTransfer(params, dependencies);
  const recipientCountry =
    params.intentResult.country !== "Unknown"
      ? params.intentResult.country
      : transfer.recipient.country;
  const recipientMethod = transferMethodFromEnum(transfer.recipient.preferredMethod);

  await logAgentStep(dependencies.db, transfer.id, AgentLogStep.INTENT_PARSED, {
    amount: params.intentResult.amount,
    currency: params.intentResult.currency,
    country: recipientCountry,
    recipientHint: params.intentResult.recipientHint,
  });

  let allResults: RailQuote[];
  let recommendedRoute: ScoredRailQuote | null;
  let totalQueryTimeMs = 0;

  if (
    params.forceRefresh ||
    transfer.railQueries.length === 0 ||
    !transfer.routeSelected
  ) {
    await logAgentStep(
      dependencies.db,
      transfer.id,
      AgentLogStep.RAIL_QUERY_STARTED,
      {
        recipientCountry,
        recipientMethod,
      },
    );

    const railSummary = await dependencies.queryAllRails(
      params.intentResult.amount,
      recipientCountry,
      recipientMethod,
      {
        transferId: transfer.id,
      },
    );

    allResults = railSummary.allResults;
    recommendedRoute = railSummary.winner;
    totalQueryTimeMs = railSummary.totalQueryTimeMs;

    await persistRailQuotes(
      dependencies.db,
      transfer.id,
      allResults,
      railSummary.totalQueryTimeMs,
    );

    await logAgentStep(
      dependencies.db,
      transfer.id,
      AgentLogStep.RAIL_QUERY_COMPLETED,
      {
        totalQueryTimeMs,
        availableRails: allResults
          .filter((quote) => quote.available)
          .map((quote) => quote.railName),
      },
    );
  } else {
    allResults = hydrateQuotesFromTransfer(transfer);
    recommendedRoute = selectBestRoute(scoreRoutes(allResults));
  }

  const routeReason = recommendedRoute
    ? buildRouteReason(recommendedRoute, scoreRoutes(allResults))
    : "No route is currently available for this transfer.";
  const feeUsd = recommendedRoute?.feeUsd ?? 0;
  const netDeliveryUsd = Number(
    Math.max(0, params.intentResult.amount - feeUsd).toFixed(2),
  );
  const savingsUsd = recommendedRoute
    ? calculateSavings(allResults, recommendedRoute)
    : 0;

  const updatedTransfer = await dependencies.db.transfer.update({
    where: {
      id: transfer.id,
    },
    data: {
      feeUsd: toDecimalString(feeUsd),
      savingsUsd: toDecimalString(savingsUsd),
      netDeliveryUsd: toDecimalString(netDeliveryUsd),
      routeSelected: recommendedRoute?.railName ?? null,
      routeReason,
      status: TransferStatus.PREVIEWED,
      requiresConfirmation:
        params.intentResult.amount > params.requireConfirmationAbove,
      railsQueried: allResults as Prisma.InputJsonValue,
    },
  });

  if (recommendedRoute) {
    await logAgentStep(dependencies.db, transfer.id, AgentLogStep.ROUTE_SCORED, {
      winner: recommendedRoute.railName,
      score: recommendedRoute.score,
      routeReason,
    });
  }

  return {
    transferId: updatedTransfer.id,
    transfer: serializeTransfer(updatedTransfer),
    allResults,
    recommendedRoute,
    totalQueryTimeMs,
    requiresConfirmation:
      params.intentResult.amount > params.requireConfirmationAbove,
  };
}

async function executeSelectedRoute(
  transfer: TransferWithRelations,
  selectedRoute: RailName,
  dependencies: AgentDependencies,
): Promise<RouteExecutionReceipt> {
  if (selectedRoute === RailName.KITE_NATIVE) {
    const settlementAddress = deriveRecipientSettlementAddress(
      `${transfer.recipient.id}:${transfer.recipient.phone}`,
    );
    const receipt = await dependencies.sendUSDCFromPassport(
      transfer.senderId,
      settlementAddress,
      transfer.amountUsd.toString(),
    );

    return {
      txHash: receipt.txHash,
      explorerUrl: receipt.explorerUrl,
      simulated: false,
      settlementAddress,
      providerReference: receipt.txHash,
    };
  }

  const reference = ethers.keccak256(
    ethers.toUtf8Bytes(
      JSON.stringify({
        transferId: transfer.id,
        route: selectedRoute,
        timestamp: dependencies.now().toISOString(),
      }),
    ),
  );

  return {
    txHash: reference,
    explorerUrl: null,
    simulated: true,
    settlementAddress: deriveRecipientSettlementAddress(
      `${selectedRoute}:${transfer.recipient.id}:${transfer.recipient.phone}`,
    ),
    providerReference: reference,
  };
}

function buildNotificationPayload(
  transfer: TransferWithRelations,
  status: TransferStatus,
): NotificationPayload {
  return {
    transferId: transfer.id,
    amountUsd: Number(transfer.amountUsd.toString()),
    senderName: transfer.sender.fullName ?? transfer.sender.email,
    recipientName: transfer.recipient.name,
    route: transfer.routeSelected,
    collectionCode: transfer.id.slice(-6).toUpperCase(),
    status,
  };
}

export async function executeTransfer(
  params: ExecuteTransferParams,
  overrides: Partial<AgentDependencies> = {},
): Promise<ExecutionResult> {
  const dependencies = {
    ...defaultDependencies,
    ...overrides,
  };
  const preview = await prepareTransfer(params, dependencies);
  const transfer = await hydrateTransfer(
    dependencies.db,
    preview.transferId,
    params.userId,
  );
  const selectedRoute = transfer.routeSelected;

  if (!selectedRoute) {
    await dependencies.db.transfer.update({
      where: {
        id: transfer.id,
      },
      data: {
        status: TransferStatus.FAILED,
      },
    });
    await logAgentStep(dependencies.db, transfer.id, AgentLogStep.ERROR, {
      reason: "No available rail was returned for this transfer.",
    });

    return {
      status: "failed",
      transferId: transfer.id,
      reason: "No payment rail is currently available.",
    };
  }

  if (
    Number(transfer.amountUsd.toString()) > params.requireConfirmationAbove &&
    !params.skipConfirmation
  ) {
    await dependencies.db.transfer.update({
      where: {
        id: transfer.id,
      },
      data: {
        status: TransferStatus.AWAITING_CONFIRMATION,
        requiresConfirmation: true,
      },
    });
    await logAgentStep(
      dependencies.db,
      transfer.id,
      AgentLogStep.CONFIRMATION_REQUIRED,
      {
        threshold: params.requireConfirmationAbove,
        amountUsd: Number(transfer.amountUsd.toString()),
      },
    );

    return {
      status: "awaiting_confirmation",
      preview: {
        transferId: transfer.id,
        route: transfer.routeSelected,
        amountUsd: Number(transfer.amountUsd.toString()),
        feeUsd: Number(transfer.feeUsd.toString()),
        netDeliveryUsd: Number(transfer.netDeliveryUsd.toString()),
        reason: transfer.routeReason,
        requiresConfirmation: true,
      },
    };
  }

  await dependencies.db.transfer.update({
    where: {
      id: transfer.id,
    },
    data: {
      status: TransferStatus.EXECUTING,
    },
  });

  const routeExecution = await executeSelectedRoute(
    transfer,
    selectedRoute,
    dependencies,
  );
  await logAgentStep(
    dependencies.db,
    transfer.id,
    AgentLogStep.TRANSFER_EXECUTED,
    {
      route: selectedRoute,
      txHash: routeExecution.txHash,
      simulated: routeExecution.simulated,
      settlementAddress: routeExecution.settlementAddress,
    },
  );

  const refreshedTransfer = await hydrateTransfer(
    dependencies.db,
    transfer.id,
    params.userId,
  );
  const attestationPayload = buildAttestationPayload(
    refreshedTransfer,
    refreshedTransfer.railQueries,
  );
  const attestation = await dependencies.publishAttestation(attestationPayload);

  await logAgentStep(
    dependencies.db,
    transfer.id,
    AgentLogStep.ATTESTATION_WRITTEN,
    {
      attestationHash: attestation.attestationHash,
      explorerUrl: attestation.explorerUrl,
      submitted: attestation.submitted,
    },
  );

  const completedAt = dependencies.now();
  const completedTransfer = (await dependencies.db.transfer.update({
    where: {
      id: transfer.id,
    },
    data: {
      status: TransferStatus.COMPLETED,
      completedAt,
      kiteAttestationHash: attestation.attestationHash,
      kiteAttestationUrl: attestation.explorerUrl,
      kiteTxHash: routeExecution.txHash,
      notificationStatus: NotificationStatus.PENDING,
    },
    include: {
      sender: true,
      recipient: true,
      railQueries: true,
    },
  })) as TransferWithRelations;

  const notificationPayload = buildNotificationPayload(
    completedTransfer,
    TransferStatus.COMPLETED,
  );
  const [recipientNotification, senderNotification] = await Promise.all([
    dependencies.sendRecipientSMS(
      completedTransfer.recipient.phone,
      notificationPayload,
      attestation.explorerUrl,
    ),
    completedTransfer.sender.phone
      ? dependencies.sendSenderConfirmation(
          completedTransfer.sender.phone,
          notificationPayload,
          attestation.explorerUrl,
        )
      : Promise.resolve({
          status: "skipped" as const,
          sid: null,
          provider: "demo" as const,
          error: null,
        }),
  ]);

  const notificationStatus =
    recipientNotification.status === "sent" ||
    senderNotification.status === "sent" ||
    recipientNotification.status === "skipped" ||
    senderNotification.status === "skipped"
      ? NotificationStatus.SENT
      : NotificationStatus.FAILED;

  await logAgentStep(
    dependencies.db,
    transfer.id,
    AgentLogStep.NOTIFICATION_SENT,
    {
      recipient: recipientNotification.status,
      sender: senderNotification.status,
    },
  );

  if (recipientNotification.error || senderNotification.error) {
    await logAgentStep(dependencies.db, transfer.id, AgentLogStep.ERROR, {
      recipientError: recipientNotification.error,
      senderError: senderNotification.error,
    });
  }

  await dependencies.db.transfer.update({
    where: {
      id: transfer.id,
    },
    data: {
      notificationStatus,
    },
  });

  await dependencies.db.wallet.updateMany({
    where: {
      userId: params.userId,
    },
    data: {
      totalSavingsUsd: {
        increment: toDecimalString(Number(completedTransfer.savingsUsd.toString())),
      },
      usdcBalance: {
        decrement: toDecimalString(
          Number(completedTransfer.amountUsd.toString()) +
            Number(completedTransfer.feeUsd.toString()),
        ),
      },
    },
  });

  return {
    status: "completed",
    transfer: serializeTransfer({
      ...completedTransfer,
      notificationStatus,
    }),
    attestationUrl: attestation.explorerUrl,
    savedAmount: Number(completedTransfer.savingsUsd.toString()),
    selectedRoute,
  };
}
