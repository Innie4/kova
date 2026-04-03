import {
  AgentLogStep,
  NotificationStatus,
  PreferredMethod,
  RailName,
  TransferStatus,
} from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { executeTransfer } from "@/lib/agent/executor";
import type { ParsedIntent } from "@/types/agent";
import type { RailQuerySummary } from "@/types/rail";

type TransferStore = {
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
  createdAt: Date;
  completedAt: Date | null;
};

function createDependencies() {
  const transfer: TransferStore = {
    id: "cmphase400000000000000001",
    senderId: "user-1",
    recipientId: "recipient-1",
    amountUsd: 100,
    feeUsd: 0,
    savingsUsd: 0,
    netDeliveryUsd: 100,
    routeSelected: null,
    routeReason: null,
    status: TransferStatus.DRAFT,
    requiresConfirmation: false,
    intentRaw: "Send $100 to Lagos",
    kiteAttestationHash: null,
    kiteAttestationUrl: null,
    kiteTxHash: null,
    notificationStatus: NotificationStatus.PENDING,
    createdAt: new Date("2026-04-03T10:00:00.000Z"),
    completedAt: null,
  };

  const sender = {
    id: "user-1",
    email: "sender@kova.dev",
    fullName: "Sender One",
    phone: "+2348000000001",
  };

  const recipient = {
    id: "recipient-1",
    name: "Mum",
    country: "Nigeria",
    phone: "+2348000000002",
    preferredMethod: PreferredMethod.WALLET,
  };

  const railQueries: Array<{
    id: string;
    transferId: string;
    railName: RailName;
    feeUsd: string;
    etaMinutes: number;
    rate: string;
    available: boolean;
    reason: string | null;
    queryTimeMs: number | null;
    queriedAt: Date;
  }> = [];
  const logs: Array<{ step: AgentLogStep; detail: Record<string, unknown> }> = [];

  const db = {
    transfer: {
      create: vi.fn(async ({ data }: { data: Partial<TransferStore> }) => ({
        ...transfer,
        ...data,
        sender,
        recipient,
        railQueries: [],
      })),
      findUnique: vi.fn(async () => ({
        ...transfer,
        sender,
        recipient,
        railQueries: [...railQueries],
      })),
      update: vi.fn(async ({ data }: { data: Partial<TransferStore> }) => {
        Object.assign(transfer, data);
        return {
          ...transfer,
          sender,
          recipient,
          railQueries: [...railQueries],
        };
      }),
    },
    railQuery: {
      deleteMany: vi.fn(async () => ({ count: railQueries.length })),
      createMany: vi.fn(async ({ data }: { data: Array<Record<string, unknown>> }) => {
        railQueries.splice(
          0,
          railQueries.length,
          ...data.map((item, index) => ({
            id: `rail-${index}`,
            transferId: String(item.transferId),
            railName: item.railName as RailName,
            feeUsd: String(item.feeUsd),
            etaMinutes: Number(item.etaMinutes),
            rate: String(item.rate),
            available: Boolean(item.available),
            reason: (item.reason as string | null) ?? null,
            queryTimeMs: Number(item.queryTimeMs ?? 0),
            queriedAt: new Date("2026-04-03T10:00:00.000Z"),
          })),
        );
        return { count: data.length };
      }),
    },
    agentLog: {
      create: vi.fn(
        async ({
          data,
        }: {
          data: { step: AgentLogStep; detail: Record<string, unknown> };
        }) => {
          logs.push({
            step: data.step,
            detail: data.detail,
          });
          return data;
        },
      ),
    },
    wallet: {
      updateMany: vi.fn(async () => ({ count: 1 })),
    },
  };

  const querySummary: RailQuerySummary = {
    winner: {
      railName: RailName.KITE_NATIVE,
      provider: "Kite Native",
      feeUsd: 0.4,
      feePercent: 0.4,
      etaMinutes: 3,
      rate: 1,
      available: true,
      simulated: false,
      targetCurrency: "NGN",
      score: 0.8333,
      availabilityWeight: 1,
    },
    allResults: [
      {
        railName: RailName.WISE,
        provider: "Wise Sandbox",
        feeUsd: 4.2,
        feePercent: 4.2,
        etaMinutes: 60,
        rate: 1530,
        available: true,
        simulated: false,
        targetCurrency: "NGN",
      },
      {
        railName: RailName.KITE_NATIVE,
        provider: "Kite Native",
        feeUsd: 0.4,
        feePercent: 0.4,
        etaMinutes: 3,
        rate: 1,
        available: true,
        simulated: false,
        targetCurrency: "NGN",
      },
    ],
    scoredResults: [],
    totalQueryTimeMs: 1200,
  };

  return {
    db,
    logs,
    transfer,
    queryAllRails: vi.fn(async () => querySummary),
    publishAttestation: vi.fn(async () => ({
      attestationHash:
        "0x1111111111111111111111111111111111111111111111111111111111111111",
      explorerUrl:
        "https://testnet.kitescan.ai/tx/0x1111111111111111111111111111111111111111111111111111111111111111",
      commitment:
        "0x2222222222222222222222222222222222222222222222222222222222222222",
      submitted: false,
    })),
    sendUSDCFromPassport: vi.fn(async () => ({
      txHash:
        "0x3333333333333333333333333333333333333333333333333333333333333333",
      explorerUrl:
        "https://testnet.kitescan.ai/tx/0x3333333333333333333333333333333333333333333333333333333333333333",
    })),
    sendRecipientSMS: vi.fn(async () => ({
      status: "skipped" as const,
      sid: null,
      provider: "demo" as const,
      error: null,
    })),
    sendSenderConfirmation: vi.fn(async () => ({
      status: "skipped" as const,
      sid: null,
      provider: "demo" as const,
      error: null,
    })),
    now: () => new Date("2026-04-03T10:05:00.000Z"),
  };
}

describe("agent executor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const parsedIntent: ParsedIntent = {
    amount: 100,
    currency: "USD",
    country: "Nigeria",
    recipientHint: "Mum",
  };

  it("completes transfers under the confirmation threshold", async () => {
    const deps = createDependencies();

    const result = await executeTransfer(
      {
        userId: "user-1",
        intentResult: parsedIntent,
        recipientId: "recipient-1",
        requireConfirmationAbove: 500,
        rawText: "Send $100 to Lagos",
      },
      deps as never,
    );

    expect(result.status).toBe("completed");
    expect(deps.sendUSDCFromPassport).toHaveBeenCalledOnce();
    expect(deps.publishAttestation).toHaveBeenCalledOnce();
    expect(result.status === "completed" ? result.transfer.status : null).toBe(
      TransferStatus.COMPLETED,
    );
  });

  it("returns awaiting_confirmation for large transfers", async () => {
    const deps = createDependencies();
    deps.transfer.amountUsd = 600;

    const result = await executeTransfer(
      {
        userId: "user-1",
        intentResult: {
          ...parsedIntent,
          amount: 600,
        },
        recipientId: "recipient-1",
        requireConfirmationAbove: 500,
        rawText: "Send $600 to Lagos",
      },
      deps as never,
    );

    expect(result.status).toBe("awaiting_confirmation");
    expect(deps.sendUSDCFromPassport).not.toHaveBeenCalled();
  });

  it("writes the expected agent log steps during execution", async () => {
    const deps = createDependencies();

    await executeTransfer(
      {
        userId: "user-1",
        intentResult: parsedIntent,
        recipientId: "recipient-1",
        requireConfirmationAbove: 500,
        rawText: "Send $100 to Lagos",
      },
      deps as never,
    );

    expect(deps.logs.map((entry) => entry.step)).toEqual(
      expect.arrayContaining([
        AgentLogStep.INTENT_PARSED,
        AgentLogStep.RAIL_QUERY_STARTED,
        AgentLogStep.RAIL_QUERY_COMPLETED,
        AgentLogStep.ROUTE_SCORED,
        AgentLogStep.TRANSFER_EXECUTED,
        AgentLogStep.ATTESTATION_WRITTEN,
        AgentLogStep.NOTIFICATION_SENT,
      ]),
    );
  });
});
