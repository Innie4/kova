import { RailName } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kiteNativeModule from "@/lib/rails/kite-native";
import * as kotaniModule from "@/lib/rails/kotani";
import * as mockModule from "@/lib/rails/mock";
import * as orchestratorModule from "@/lib/rails/orchestrator";
import * as wiseModule from "@/lib/rails/wise";
import * as x402Module from "@/lib/kite/x402";
import type { RailQuote } from "@/types/rail";

function createQuote(overrides: Partial<RailQuote>): RailQuote {
  return {
    railName: RailName.MOCK,
    provider: "test",
    feeUsd: 1,
    feePercent: 1,
    etaMinutes: 10,
    rate: 1,
    available: true,
    simulated: false,
    targetCurrency: "USD",
    ...overrides,
  };
}

describe("rail orchestrator", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("queryAllRails calls all 3+ rails and returns results within 8 seconds", async () => {
    vi.spyOn(wiseModule, "getWiseQuoteForCountry").mockResolvedValue(
      createQuote({ railName: RailName.WISE, provider: "Wise", feePercent: 2 }),
    );
    vi.spyOn(kotaniModule, "getKotaniQuote").mockResolvedValue(
      createQuote({ railName: RailName.KOTANI, provider: "Kotani", feePercent: 1.5 }),
    );
    vi.spyOn(kiteNativeModule, "getKiteNativeQuote").mockResolvedValue(
      createQuote({ railName: RailName.KITE_NATIVE, provider: "Kite", feePercent: 0.4 }),
    );
    vi.spyOn(mockModule, "getMockQuote").mockResolvedValue(
      createQuote({ railName: RailName.MOCK, provider: "Mock", simulated: true, feePercent: 2.5 }),
    );
    vi.spyOn(x402Module, "chargeRailQuery").mockResolvedValue(null);

    const result = await orchestratorModule.queryAllRails(100, "Kenya", "mobile_money");

    expect(result.allResults).toHaveLength(4);
    expect(result.totalQueryTimeMs).toBeLessThan(8000);
    expect(x402Module.chargeRailQuery).toHaveBeenCalledTimes(4);
  });

  it("scoreRoutes correctly ranks routes", () => {
    const scored = orchestratorModule.scoreRoutes([
      createQuote({ railName: RailName.WISE, feePercent: 2.8, etaMinutes: 60 }),
      createQuote({ railName: RailName.KOTANI, feePercent: 1.4, etaMinutes: 8 }),
      createQuote({ railName: RailName.KITE_NATIVE, feePercent: 0.4, etaMinutes: 3 }),
    ]);

    expect(scored[0]?.railName).toBe(RailName.KITE_NATIVE);
    expect(scored[1]?.railName).toBe(RailName.KOTANI);
    expect(scored[2]?.railName).toBe(RailName.WISE);
  });

  it("selectBestRoute returns the highest scored available route", () => {
    const winner = orchestratorModule.selectBestRoute([
      { ...createQuote({ railName: RailName.WISE, available: false }), score: 0, availabilityWeight: 0 },
      { ...createQuote({ railName: RailName.KITE_NATIVE, feePercent: 0.4 }), score: 0.83, availabilityWeight: 1 },
      { ...createQuote({ railName: RailName.KOTANI, feePercent: 1.5 }), score: 0.12, availabilityWeight: 1 },
    ]);

    expect(winner?.railName).toBe(RailName.KITE_NATIVE);
  });

  it("handles one failed rail gracefully while returning the others", async () => {
    vi.spyOn(wiseModule, "getWiseQuoteForCountry").mockRejectedValue(new Error("Wise down"));
    vi.spyOn(kotaniModule, "getKotaniQuote").mockResolvedValue(
      createQuote({ railName: RailName.KOTANI, provider: "Kotani", feePercent: 1.5 }),
    );
    vi.spyOn(kiteNativeModule, "getKiteNativeQuote").mockResolvedValue(
      createQuote({ railName: RailName.KITE_NATIVE, provider: "Kite", feePercent: 0.4 }),
    );
    vi.spyOn(mockModule, "getMockQuote").mockResolvedValue(
      createQuote({ railName: RailName.MOCK, provider: "Mock", simulated: true, feePercent: 2.5 }),
    );
    vi.spyOn(x402Module, "chargeRailQuery").mockResolvedValue(null);

    const result = await orchestratorModule.queryAllRails(100, "Kenya", "mobile_money");

    expect(result.allResults).toHaveLength(4);
    expect(result.allResults.some((quote) => quote.railName === RailName.WISE && quote.available === false)).toBe(true);
    expect(result.winner?.railName).toBe(RailName.KITE_NATIVE);
  });
});
