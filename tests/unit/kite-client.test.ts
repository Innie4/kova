import { ethers } from "ethers";
import { describe, expect, it } from "vitest";
import {
  createAgentPassport,
  fetchSupportedGaslessTokens,
  writeAttestation,
} from "@/lib/kite/client";

describe("kite client", () => {
  it("createAgentPassport returns a valid Ethereum address format", async () => {
    const passport = await createAgentPassport("phase2-user");

    expect(ethers.isAddress(passport.walletAddress)).toBe(true);
    expect(ethers.isAddress(passport.ownerAddress)).toBe(true);
    expect(passport.passportHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(passport.chainId).toBe(2368);
  }, 15000);

  it("writeAttestation with a mock payload returns a non-empty hash", async () => {
    const result = await writeAttestation("transfer-demo", {
      kind: "unit-test",
      amount: 150,
      route: "KITE_NATIVE",
    });

    expect(result.attestationHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(result.commitment).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });

  it("loads the live Kite gasless token list", async () => {
    const payload = await fetchSupportedGaslessTokens();

    expect(payload.testnet.length).toBeGreaterThan(0);
    expect(payload.testnet[0].address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  }, 15000);
});
