import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/wallet", () => ({
  getWalletBalanceSnapshot: vi.fn(async () => ({
    address: "0x1234000000000000000000000000000000005678",
    balance: "42.500000",
    tokenSymbol: "USDC",
    network: "kite_testnet",
  })),
}));

describe("wallet balance route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the expected balance payload format", async () => {
    const { GET } = await import("@/app/api/wallet/balance/route");
    const response = await GET(
      new Request("http://localhost/api/wallet/balance?address=0x1234"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      address: "0x1234000000000000000000000000000000005678",
      balance: "42.500000",
      tokenSymbol: "USDC",
      network: "kite_testnet",
    });
  });
});
