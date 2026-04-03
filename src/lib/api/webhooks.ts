import {
  AgentLogStep,
  NotificationStatus,
  Prisma,
  TransferStatus,
} from "@prisma/client";
import { createHmac, timingSafeEqual } from "node:crypto";
import { sendRecipientSMS, sendSenderConfirmation } from "@/lib/notifications/twilio";
import { db } from "@/server/db";
import type { NotificationPayload } from "@/types/agent";

type ProviderName = "wise" | "kotani";

type TransferLike = {
  id: string;
  status: TransferStatus;
  sender: {
    email: string;
    fullName: string | null;
    phone: string | null;
  };
  recipient: {
    name: string;
    phone: string;
  };
  routeSelected: import("@prisma/client").RailName | null;
  amountUsd: { toString(): string };
};

type WebhookDependencies = {
  db: typeof db;
  now: () => Date;
  sendRecipientSMS: typeof sendRecipientSMS;
  sendSenderConfirmation: typeof sendSenderConfirmation;
};

const defaultDependencies: WebhookDependencies = {
  db,
  now: () => new Date(),
  sendRecipientSMS,
  sendSenderConfirmation,
};

function normalizeSignature(signature: string) {
  return signature.startsWith("sha256=") ? signature.slice(7) : signature;
}

export function signWebhookPayload(rawBody: string, secret: string) {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string | null | undefined,
) {
  if (!secret) {
    return false;
  }

  if (!signature) {
    return false;
  }

  const expected = Buffer.from(signWebhookPayload(rawBody, secret), "hex");
  const received = Buffer.from(normalizeSignature(signature), "hex");

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export function mapProviderStatusToTransferStatus(status: string): TransferStatus {
  const normalized = status.trim().toLowerCase();

  if (["completed", "complete", "paid", "success", "successful", "settled"].includes(normalized)) {
    return TransferStatus.COMPLETED;
  }

  if (["failed", "cancelled", "canceled", "error", "rejected"].includes(normalized)) {
    return TransferStatus.FAILED;
  }

  if (["processing", "pending", "queued", "in_progress"].includes(normalized)) {
    return TransferStatus.EXECUTING;
  }

  return TransferStatus.PREVIEWED;
}

function buildNotificationPayload(transfer: TransferLike): NotificationPayload {
  return {
    transferId: transfer.id,
    amountUsd: Number(transfer.amountUsd.toString()),
    senderName: transfer.sender.fullName ?? transfer.sender.email,
    recipientName: transfer.recipient.name,
    route: transfer.routeSelected,
    collectionCode: transfer.id.slice(-6).toUpperCase(),
    status: transfer.status,
  };
}

function getProviderSecret(provider: ProviderName) {
  return provider === "wise"
    ? process.env.WISE_WEBHOOK_SECRET ?? null
    : process.env.KOTANI_WEBHOOK_SECRET ?? null;
}

export async function applyTransferWebhookUpdate(
  params: {
    provider: ProviderName;
    transferId: string;
    externalStatus: string;
    payload: Record<string, unknown>;
  },
  overrides: Partial<WebhookDependencies> = {},
) {
  const dependencies = {
    ...defaultDependencies,
    ...overrides,
  };
  const nextStatus = mapProviderStatusToTransferStatus(params.externalStatus);
  const transfer = await dependencies.db.transfer.update({
    where: {
      id: params.transferId,
    },
    data: {
      status: nextStatus,
      completedAt:
        nextStatus === TransferStatus.COMPLETED ? dependencies.now() : undefined,
    },
    include: {
      sender: true,
      recipient: true,
    },
  });

  await dependencies.db.agentLog.create({
    data: {
      transferId: params.transferId,
      step:
        nextStatus === TransferStatus.FAILED
          ? AgentLogStep.ERROR
          : AgentLogStep.TRANSFER_EXECUTED,
      detail: {
        provider: params.provider,
        externalStatus: params.externalStatus,
        payload: params.payload,
      } as Prisma.InputJsonValue,
    },
  });

  if (nextStatus === TransferStatus.COMPLETED) {
    const notificationPayload = buildNotificationPayload(transfer);
    const [recipientNotification, senderNotification] = await Promise.all([
      dependencies.sendRecipientSMS(
        transfer.recipient.phone,
        notificationPayload,
        transfer.kiteAttestationUrl,
      ),
      transfer.sender.phone
        ? dependencies.sendSenderConfirmation(
            transfer.sender.phone,
            notificationPayload,
            transfer.kiteAttestationUrl,
          )
        : Promise.resolve({
            status: "skipped" as const,
            sid: null,
            provider: "demo" as const,
            error: null,
          }),
    ]);

    await dependencies.db.transfer.update({
      where: {
        id: params.transferId,
      },
      data: {
        notificationStatus:
          recipientNotification.status === "failed" &&
          senderNotification.status === "failed"
            ? NotificationStatus.FAILED
            : NotificationStatus.SENT,
      },
    });
  }

  return transfer;
}

export async function processProviderWebhookRequest(
  provider: ProviderName,
  rawBody: string,
  signature: string | null,
  payload: Record<string, unknown>,
  overrides: Partial<WebhookDependencies> = {},
) {
  const secret = getProviderSecret(provider);
  const isDevelopmentBypass =
    (process.env.NODE_ENV === "development" || process.env.DEMO_MODE === "true") &&
    !secret;

  if (!isDevelopmentBypass && !verifyWebhookSignature(rawBody, signature, secret)) {
    return {
      ok: false as const,
      status: 401,
      error: "Invalid webhook signature.",
    };
  }

  const transferId =
    typeof payload.transferId === "string"
      ? payload.transferId
      : typeof payload.id === "string"
        ? payload.id
        : null;
  const externalStatus =
    typeof payload.status === "string"
      ? payload.status
      : typeof payload.event === "string"
        ? payload.event
        : null;

  if (!transferId || !externalStatus) {
    return {
      ok: false as const,
      status: 400,
      error: "Webhook payload must include transferId and status.",
    };
  }

  const transfer = await applyTransferWebhookUpdate(
    {
      provider,
      transferId,
      externalStatus,
      payload,
    },
    overrides,
  );

  return {
    ok: true as const,
    status: 200,
    transferId: transfer.id,
    transferStatus: transfer.status,
  };
}
