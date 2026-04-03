import { AgentLogStep } from "@prisma/client";
import { payRailQuery } from "@/lib/kite/client";
import { db } from "@/server/db";

export async function chargeRailQuery(
  agentAddress: string,
  railName: string,
  amount: string | number | bigint,
  transferId?: string,
) {
  try {
    const result = await payRailQuery(agentAddress, amount);
    const challenge = JSON.parse(JSON.stringify(result.challenge));

    await db.agentLog.create({
      data: {
        transferId,
        step: AgentLogStep.RAIL_QUERY_COMPLETED,
        detail: {
          type: "x402_payment",
          railName,
          agentAddress,
          amount: String(amount),
          txHash: result.txHash,
          submitted: result.submitted,
          challenge,
        },
      },
    });

    return result;
  } catch (error) {
    await db.agentLog.create({
      data: {
        transferId,
        step: AgentLogStep.ERROR,
        detail: {
          type: "x402_payment_error",
          railName,
          agentAddress,
          amount: String(amount),
          message: error instanceof Error ? error.message : "Unknown x402 payment error",
        },
      },
    });

    return null;
  }
}
