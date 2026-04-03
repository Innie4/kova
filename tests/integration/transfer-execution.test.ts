import { PreferredMethod, RailName, TransferStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { executeTransfer } from "@/lib/agent/executor";
import { parseTransferIntent } from "@/lib/agent/intent-parser";

describe("transfer execution integration", () => {
  it("runs the full flow and returns an attested completion", async () => {
    const logs: string[] = [];
    const mutableTransfer = {
      id: "cmphase4integration000000000001",
      senderId: "user-int",
      recipientId: "recipient-int",
      amountUsd: 150,
      feeUsd: 0,
      savingsUsd: 0,
      netDeliveryUsd: 150,
      routeSelected: null as RailName | null,
      routeReason: null as string | null,
      status: TransferStatus.DRAFT,
      requiresConfirmation: false,
      intentRaw: "Send $150 to Nigeria",
      kiteAttestationHash: null as string | null,
      kiteAttestationUrl: null as string | null,
      kiteTxHash: null as string | null,
      notificationStatus: "PENDING",
      createdAt: new Date("2026-04-03T11:00:00.000Z"),
      completedAt: null as Date | null,
    };

    const storedRailQueries: Array<{
      railName: RailName;
      feeUsd: string;
      etaMinutes: number;
      rate: string;
      available: boolean;
      reason: string | null;
    }> = [];

    const db = {
      transfer: {
        create: async () => ({
          ...mutableTransfer,
          sender: {
            id: "user-int",
            email: "sender@kova.dev",
            fullName: "Sender Int",
            phone: "+2348000000003",
          },
          recipient: {
            id: "recipient-int",
            name: "Dad",
            country: "Nigeria",
            phone: "+2348000000004",
            preferredMethod: PreferredMethod.WALLET,
          },
          railQueries: [],
        }),
        findUnique: async () => ({
          ...mutableTransfer,
          sender: {
            id: "user-int",
            email: "sender@kova.dev",
            fullName: "Sender Int",
            phone: "+2348000000003",
          },
          recipient: {
            id: "recipient-int",
            name: "Dad",
            country: "Nigeria",
            phone: "+2348000000004",
            preferredMethod: PreferredMethod.WALLET,
          },
          railQueries: storedRailQueries.map((query) => ({
            ...query,
            feeUsd: { toString: () => query.feeUsd },
            rate: { toString: () => query.rate },
          })),
        }),
        update: async ({ data }: { data: Record<string, unknown> }) => {
          Object.assign(mutableTransfer, data);
          return {
            ...mutableTransfer,
            sender: {
              id: "user-int",
              email: "sender@kova.dev",
              fullName: "Sender Int",
              phone: "+2348000000003",
            },
            recipient: {
              id: "recipient-int",
              name: "Dad",
              country: "Nigeria",
              phone: "+2348000000004",
              preferredMethod: PreferredMethod.WALLET,
            },
            railQueries: storedRailQueries.map((query) => ({
              ...query,
              feeUsd: { toString: () => query.feeUsd },
              rate: { toString: () => query.rate },
            })),
          };
        },
      },
      railQuery: {
        deleteMany: async () => ({ count: storedRailQueries.length }),
        createMany: async ({ data }: { data: Array<Record<string, unknown>> }) => {
          storedRailQueries.splice(
            0,
            storedRailQueries.length,
            ...data.map((item) => ({
              railName: item.railName as RailName,
              feeUsd: String(item.feeUsd),
              etaMinutes: Number(item.etaMinutes),
              rate: String(item.rate),
              available: Boolean(item.available),
              reason: (item.reason as string | null) ?? null,
            })),
          );
          return { count: data.length };
        },
      },
      agentLog: {
        create: async ({ data }: { data: { step: string } }) => {
          logs.push(data.step);
          return data;
        },
      },
      wallet: {
        updateMany: async () => ({ count: 1 }),
      },
    };

    const result = await executeTransfer(
      {
        userId: "user-int",
        intentResult: parseTransferIntent("Send $150 to Nigeria"),
        recipientId: "recipient-int",
        requireConfirmationAbove: 500,
        rawText: "Send $150 to Nigeria",
      },
      {
        db: db as never,
        queryAllRails: async () => ({
          winner: {
            railName: RailName.KITE_NATIVE,
            provider: "Kite Native",
            feeUsd: 0.6,
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
              railName: RailName.KITE_NATIVE,
              provider: "Kite Native",
              feeUsd: 0.6,
              feePercent: 0.4,
              etaMinutes: 3,
              rate: 1,
              available: true,
              simulated: false,
              targetCurrency: "NGN",
            },
          ],
          scoredResults: [],
          totalQueryTimeMs: 800,
        }),
        sendUSDCFromPassport: async () => ({
          txHash:
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          explorerUrl:
            "https://testnet.kitescan.ai/tx/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        }),
        publishAttestation: async () => ({
          attestationHash:
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          explorerUrl:
            "https://testnet.kitescan.ai/tx/0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          commitment:
            "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
          submitted: false,
        }),
        sendRecipientSMS: async () => ({
          status: "skipped" as const,
          sid: null,
          provider: "demo" as const,
          error: null,
        }),
        sendSenderConfirmation: async () => ({
          status: "skipped" as const,
          sid: null,
          provider: "demo" as const,
          error: null,
        }),
        now: () => new Date("2026-04-03T11:00:05.000Z"),
      },
    );

    expect(result.status).toBe("completed");
    expect(result.status === "completed" ? result.attestationUrl : null).toMatch(
      /testnet\.kitescan\.ai/,
    );
    expect(logs).toContain("ATTESTATION_WRITTEN");
    expect(logs).toContain("NOTIFICATION_SENT");
  });
});
