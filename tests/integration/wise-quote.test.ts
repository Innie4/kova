import { describe, expect, it } from "vitest";
import { getWiseQuote } from "@/lib/rails/wise";

describe("wise sandbox integration", () => {
  it("returns a valid quote structure from the real Wise sandbox API", async () => {
    const result = await getWiseQuote("USD", "KES", 100);

    expect(result.railName).toBe("WISE");
    expect(result.provider).toContain("Wise");
    expect(result.targetCurrency).toBe("KES");
    expect(result.rate).toBeGreaterThan(0);
    expect(result.feeUsd).toBeGreaterThanOrEqual(0);
    expect(result.etaMinutes).toBeGreaterThanOrEqual(1);
  }, 15000);
});
