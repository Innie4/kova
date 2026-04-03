import { describe, expect, it } from "vitest";
import { IntentParseError, parseTransferIntent } from "@/lib/agent/intent-parser";

describe("intent parser", () => {
  it("parses Send $200 to Lagos as a Nigerian transfer", () => {
    const result = parseTransferIntent("Send $200 to Lagos");

    expect(result).toMatchObject({
      amount: 200,
      currency: "USD",
      country: "Nigeria",
    });
  });

  it("parses Transfer £150 to Mum with GBP currency", () => {
    const result = parseTransferIntent("Transfer £150 to Mum");

    expect(result).toMatchObject({
      amount: 150,
      currency: "GBP",
    });
    expect(result.recipientHint).toBe("Mum");
  });

  it("infers Nigeria from a +234 phone number", () => {
    const result = parseTransferIntent("Send 200 to +2348012345678");

    expect(result).toMatchObject({
      amount: 200,
      currency: "USD",
      country: "Nigeria",
      recipientHint: "+2348012345678",
    });
  });

  it("throws a structured error when amount is missing", () => {
    expect(() => parseTransferIntent("Send money to Lagos")).toThrowError(
      IntentParseError,
    );
  });
});
