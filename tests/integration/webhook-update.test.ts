import {
  NotificationStatus,
  RailName,
  TransferStatus,
} from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { applyTransferWebhookUpdate } from "@/lib/api/webhooks";

describe("webhook status updates", () => {
  it("updates transfer status and sends notifications for a completed transfer", async () => {
    const state = {
      id: "trf_webhook_1",
      status: TransferStatus.EXECUTING,
      kiteAttestationUrl: "https://testnet.kitescan.ai/tx/0xabc",
      routeSelected: RailName.WISE,
      amountUsd: {
        toString: () => "100.000000",
      },
      sender: {
        email: "sender@kova.app",
        fullName: "Sender Demo",
        phone: "+2348000000001",
      },
      recipient: {
        name: "Recipient Demo",
        phone: "+2348000000002",
      },
      notificationStatus: NotificationStatus.PENDING,
      completedAt: null as Date | null,
    };

    const db = {
      transfer: {
        update: vi.fn(async ({ data }: { data: Partial<typeof state> }) => {
          Object.assign(state, data);
          return state;
        }),
      },
      agentLog: {
        create: vi.fn(async () => null),
      },
    };
    const sendRecipientSMS = vi.fn(async () => ({
      status: "sent" as const,
      sid: "SM123",
      provider: "twilio" as const,
      error: null,
    }));
    const sendSenderConfirmation = vi.fn(async () => ({
      status: "sent" as const,
      sid: "SM124",
      provider: "twilio" as const,
      error: null,
    }));

    const result = await applyTransferWebhookUpdate(
      {
        provider: "wise",
        transferId: "trf_webhook_1",
        externalStatus: "completed",
        payload: {
          transferId: "trf_webhook_1",
          status: "completed",
        },
      },
      {
        db: db as never,
        now: () => new Date("2026-04-03T12:00:00.000Z"),
        sendRecipientSMS,
        sendSenderConfirmation,
      },
    );

    expect(result.status).toBe(TransferStatus.COMPLETED);
    expect(state.completedAt?.toISOString()).toBe("2026-04-03T12:00:00.000Z");
    expect(sendRecipientSMS).toHaveBeenCalledOnce();
    expect(sendSenderConfirmation).toHaveBeenCalledOnce();
  });
});
