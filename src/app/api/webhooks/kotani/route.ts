import { NextResponse } from "next/server";
import { processProviderWebhookRequest } from "@/lib/api/webhooks";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const signature =
      request.headers.get("x-kotani-signature") ??
      request.headers.get("x-webhook-signature");
    const result = await processProviderWebhookRequest(
      "kotani",
      rawBody,
      signature,
      payload,
    );

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Kotani webhook failed.",
      },
      { status: 500 },
    );
  }
}
