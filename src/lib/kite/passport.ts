import { TransferStatus } from "@prisma/client";
import { createAgentPassport, writeAttestation } from "@/lib/kite/client";
import { db } from "@/server/db";

export async function registerPassport(userId: string, userAddress?: string) {
  const passport = await createAgentPassport(userId, userAddress);
  const anchor = await writeAttestation(`passport:${userId}`, {
    type: "passport_registration",
    userId,
    ownerAddress: passport.ownerAddress,
    walletAddress: passport.walletAddress,
    passportHash: passport.passportHash,
    timestamp: new Date().toISOString(),
  });

  await db.user.update({
    where: { id: userId },
    data: {
      kitePassportAddress: passport.walletAddress,
      kitePassportHash: anchor.attestationHash,
    },
  });

  return {
    ...passport,
    anchor,
  };
}

export async function getPassportReputation(address: string) {
  const user = await db.user.findFirst({
    where: {
      kitePassportAddress: address,
    },
    include: {
      sentTransfers: {
        where: {
          status: TransferStatus.COMPLETED,
        },
        select: {
          savingsUsd: true,
        },
      },
    },
  });

  if (!user) {
    return {
      address,
      score: 0,
      successfulTransfers: 0,
      totalSavingsUsd: 0,
    };
  }

  const successfulTransfers = user.sentTransfers.length;
  const totalSavingsUsd = user.sentTransfers.reduce(
    (sum, transfer) => sum + Number(transfer.savingsUsd),
    0,
  );
  const score = Math.min(
    100,
    45 + successfulTransfers * 8 + Math.min(25, Math.floor(totalSavingsUsd)),
  );

  return {
    address,
    score,
    successfulTransfers,
    totalSavingsUsd,
  };
}
