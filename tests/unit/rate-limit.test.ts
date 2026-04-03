import { applyRateLimit } from "@/lib/api/rate-limit";

describe("applyRateLimit", () => {
  it("blocks requests that exceed the configured limit", () => {
    const request = new Request("http://localhost:3000/api/trpc/viewer", {
      headers: {
        "user-agent": "vitest-agent",
        "x-forwarded-for": "127.0.0.1",
      },
    });

    const first = applyRateLimit(request, {
      namespace: "rate-limit-block-test",
      limit: 2,
      windowMs: 60_000,
    });
    const second = applyRateLimit(request, {
      namespace: "rate-limit-block-test",
      limit: 2,
      windowMs: 60_000,
    });
    const third = applyRateLimit(request, {
      namespace: "rate-limit-block-test",
      limit: 2,
      windowMs: 60_000,
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets the window after expiration", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-03T10:00:00.000Z"));

    const request = new Request("http://localhost:3000/api/trpc/viewer", {
      headers: {
        "user-agent": "vitest-agent-2",
        "x-forwarded-for": "127.0.0.2",
      },
    });

    const blocked = applyRateLimit(request, {
      namespace: "rate-limit-reset-test",
      limit: 1,
      windowMs: 1_000,
    });
    const firstOverflow = applyRateLimit(request, {
      namespace: "rate-limit-reset-test",
      limit: 1,
      windowMs: 1_000,
    });

    vi.advanceTimersByTime(1_500);

    const reset = applyRateLimit(request, {
      namespace: "rate-limit-reset-test",
      limit: 1,
      windowMs: 1_000,
    });

    expect(blocked.allowed).toBe(true);
    expect(firstOverflow.allowed).toBe(false);
    expect(reset.allowed).toBe(true);

    vi.useRealTimers();
  });
});
