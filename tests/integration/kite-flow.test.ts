import { describe, expect, it } from "vitest";
import { createAgentPassport, payRailQuery, writeAttestation } from "@/lib/kite/client";

describe("kite integration flow", () => {
  it("create passport -> pay query -> write attestation completes against live testnet services", async () => {
    const passport = await createAgentPassport("integration-phase2-user");
    const payment = await payRailQuery(passport.walletAddress, "0.001");
    const attestation = await writeAttestation("integration-transfer", {
      kind: "integration",
      passportHash: passport.passportHash,
      paymentHash: payment.txHash,
      timestamp: new Date().toISOString(),
    });

    expect(passport.walletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(payment.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(attestation.attestationHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  }, 20000);
});
