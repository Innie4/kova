import { afterEach, describe, expect, it, vi } from "vitest";

describe("webhook routes", () => {
  afterEach(() => {
    delete process.env.WISE_WEBHOOK_SECRET;
    delete process.env.KOTANI_WEBHOOK_SECRET;
    vi.resetModules();
  });

  it("rejects a bad Wise signature", async () => {
    process.env.WISE_WEBHOOK_SECRET = "wise-secret";
    const { POST } = await import("@/app/api/webhooks/wise/route");

    const response = await POST(
      new Request("http://localhost/api/webhooks/wise", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-wise-signature": "sha256=deadbeef",
        },
        body: JSON.stringify({
          transferId: "trf_test",
          status: "completed",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "Invalid webhook signature.",
    });
  });

  it("rejects a bad Kotani signature", async () => {
    process.env.KOTANI_WEBHOOK_SECRET = "kotani-secret";
    const { POST } = await import("@/app/api/webhooks/kotani/route");

    const response = await POST(
      new Request("http://localhost/api/webhooks/kotani", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-kotani-signature": "sha256=deadbeef",
        },
        body: JSON.stringify({
          transferId: "trf_test",
          status: "completed",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "Invalid webhook signature.",
    });
  });
});
