import twilio from "twilio";
import type {
  NotificationDeliveryResult,
  NotificationPayload,
} from "@/types/agent";

function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

function isTwilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER,
  );
}

function createTwilioClient() {
  if (!isTwilioConfigured()) {
    return null;
  }

  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );
}

function formatAmount(amountUsd: number) {
  return `$${amountUsd.toFixed(2)}`;
}

function buildRecipientMessage(
  details: NotificationPayload,
  trackUrl?: string | null,
) {
  return `Kova: ${formatAmount(details.amountUsd)} is on its way from ${details.senderName}. Collection: ${details.collectionCode}. Track: ${trackUrl ?? "available in-app"}`;
}

function buildSenderMessage(
  details: NotificationPayload,
  attestationUrl?: string | null,
) {
  return `Kova: ${formatAmount(details.amountUsd)} to ${details.recipientName} is in progress on ${details.route ?? "the selected rail"}. Proof: ${attestationUrl ?? "available in-app"}`;
}

async function dispatchSMS(
  to: string,
  body: string,
): Promise<NotificationDeliveryResult> {
  if (isDemoMode() || !isTwilioConfigured()) {
    console.info(`[Kova demo SMS] ${to}: ${body}`);
    return {
      status: "skipped",
      sid: null,
      provider: "demo",
      error: null,
    };
  }

  const client = createTwilioClient();
  if (!client || !process.env.TWILIO_PHONE_NUMBER) {
    return {
      status: "failed",
      sid: null,
      provider: "twilio",
      error: "Twilio is not configured.",
    };
  }

  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    return {
      status: "sent",
      sid: message.sid,
      provider: "twilio",
      error: null,
    };
  } catch (error) {
    return {
      status: "failed",
      sid: null,
      provider: "twilio",
      error: error instanceof Error ? error.message : "Twilio request failed.",
    };
  }
}

export async function sendRecipientSMS(
  phone: string,
  transferDetails: NotificationPayload,
  trackUrl?: string | null,
) {
  return dispatchSMS(phone, buildRecipientMessage(transferDetails, trackUrl));
}

export async function sendSenderConfirmation(
  phone: string,
  transferDetails: NotificationPayload,
  attestationUrl?: string | null,
) {
  return dispatchSMS(phone, buildSenderMessage(transferDetails, attestationUrl));
}
