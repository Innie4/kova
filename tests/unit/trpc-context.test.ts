import { describe, expect, it, vi } from "vitest";
import { createTRPCContext } from "@/server/trpc";

describe("tRPC context", () => {
  it("returns the expected context shape", async () => {
    const getSession = vi.fn().mockResolvedValue({
      data: { session: null },
    });

    const context = await createTRPCContext({
      headers: new Headers({
        "x-kova-test": "phase-1",
      }),
      supabaseClient: {
        auth: {
          getSession,
        },
      },
    });

    expect(context.db).toBeDefined();
    expect(context.headers.get("x-kova-test")).toBe("phase-1");
    expect(context.supabase).not.toBeNull();
    expect(context.session).toBeNull();
    expect(getSession).toHaveBeenCalledTimes(1);
  });
});
