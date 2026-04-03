import {
  AgentLogStep,
  KycStatus,
  KycDocumentStatus,
  KycDocumentType,
  NotificationPreference,
  NotificationStatus,
  PreferredMethod,
  PrismaClient,
  RailName,
  TransferStatus,
} from "@prisma/client";
import {
  demoRecipients,
  demoTransfers,
  demoUser,
  routeMatrix,
  walletActivity,
} from "../src/lib/demo-data";

const prisma = new PrismaClient();

function toPreferredMethod(value: (typeof demoRecipients)[number]["method"]) {
  switch (value) {
    case "wallet":
      return PreferredMethod.WALLET;
    case "bank":
      return PreferredMethod.BANK;
    case "mobile_money":
      return PreferredMethod.MOBILE_MONEY;
    case "cash":
      return PreferredMethod.CASH;
    default:
      return PreferredMethod.WALLET;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required to seed the database. Set it before running `pnpm db:seed`.",
    );
  }

  await prisma.agentLog.deleteMany();
  await prisma.railQuery.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.kycDocument.deleteMany();
  await prisma.recipient.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email: demoUser.email,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: demoUser.email,
      fullName: demoUser.name,
      phone: demoUser.phone,
      country: demoUser.country,
      kitePassportAddress: demoUser.passportAddress,
      kitePassportHash: demoUser.passportHash,
      notificationPreference: NotificationPreference.SMS,
      demoModeEnabled: true,
      kycStatus: KycStatus.VERIFIED,
    },
  });

  await prisma.wallet.create({
    data: {
      userId: user.id,
      kiteAddress: demoUser.passportAddress,
      depositAddress: demoUser.passportAddress,
      usdcBalance: demoUser.balanceUsd,
      reputationScore: demoUser.reputationScore,
      totalSavingsUsd: demoUser.totalSavedUsd,
    },
  });

  const recipients = await Promise.all(
    demoRecipients.map((recipient) =>
      prisma.recipient.create({
        data: {
          userId: user.id,
          name: recipient.name,
          country: recipient.country,
          phone: recipient.phone,
          preferredMethod: toPreferredMethod(recipient.method),
          isFavorite: true,
          mobileNetwork:
            recipient.method === "mobile_money" ? "Demo Network" : null,
        },
      }),
    ),
  );

  await prisma.kycDocument.create({
    data: {
      userId: user.id,
      documentType: KycDocumentType.PASSPORT,
      frontPath: "seed/kyc/front-passport.png",
      backPath: "seed/kyc/back-passport.png",
      metadataHash:
        "0x6a88022da30338c607ffb2a17a4c9cc67eb0ac55b883c5f714ee26cb79fe5f8d",
      attestationHash: demoTransfers[0]?.attestationHash,
      status: KycDocumentStatus.VERIFIED,
    },
  });

  for (let index = 0; index < demoTransfers.length; index += 1) {
    const transfer = demoTransfers[index]!;
    const recipient = recipients.find(
      (entry) => entry.name === transfer.recipientName,
    );

    if (!recipient) {
      throw new Error(`Recipient ${transfer.recipientName} is missing from the seed data.`);
    }

    const createdTransfer = await prisma.transfer.create({
      data: {
        senderId: user.id,
        recipientId: recipient.id,
        amountUsd: transfer.amountUsd,
        feeUsd: transfer.feeUsd,
        savingsUsd: transfer.savedUsd,
        netDeliveryUsd: transfer.netDeliveryUsd,
        routeSelected: transfer.route,
        routeReason: transfer.routeReason,
        status: transfer.status,
        requiresConfirmation: transfer.amountUsd > 500,
        intentRaw: `Send $${transfer.amountUsd} to ${transfer.country}`,
        kiteAttestationHash:
          transfer.status === TransferStatus.COMPLETED
            ? transfer.attestationHash
            : null,
        kiteAttestationUrl:
          transfer.status === TransferStatus.COMPLETED
            ? transfer.attestationUrl
            : null,
        kiteTxHash: transfer.txHash,
        notificationStatus:
          transfer.status === TransferStatus.COMPLETED
            ? NotificationStatus.SENT
            : NotificationStatus.PENDING,
        railsQueried: routeMatrix,
        createdAt: new Date(transfer.timestamp),
        completedAt:
          transfer.status === TransferStatus.COMPLETED
            ? new Date(transfer.timestamp)
            : null,
      },
    });

    await prisma.railQuery.createMany({
      data: routeMatrix.map((route) => ({
        transferId: createdTransfer.id,
        railName: route.railName,
        feeUsd: route.feeUsd,
        etaMinutes: route.etaMinutes,
        rate: Number((1 - route.feePercent / 100).toFixed(6)),
        available: route.available,
        reason: route.reason,
        queryTimeMs: 200 + index * 25,
        queriedAt: new Date(transfer.timestamp),
      })),
    });

    await prisma.agentLog.createMany({
      data: [
        {
          transferId: createdTransfer.id,
          step: AgentLogStep.INTENT_PARSED,
          detail: {
            rawText: `Send $${transfer.amountUsd} to ${transfer.country}`,
          },
          createdAt: new Date(transfer.timestamp),
        },
        {
          transferId: createdTransfer.id,
          step: AgentLogStep.RAIL_QUERY_COMPLETED,
          detail: {
            railsQueried: routeMatrix.map((route) => route.label),
          },
          createdAt: new Date(transfer.timestamp),
        },
        {
          transferId: createdTransfer.id,
          step: AgentLogStep.ROUTE_SCORED,
          detail: {
            selectedRoute: transfer.route,
            reason: transfer.routeReason,
          },
          createdAt: new Date(transfer.timestamp),
        },
        {
          transferId: createdTransfer.id,
          step:
            transfer.status === TransferStatus.FAILED
              ? AgentLogStep.ERROR
              : AgentLogStep.TRANSFER_EXECUTED,
          detail:
            transfer.status === TransferStatus.FAILED
              ? { message: "Seeded sandbox timeout example." }
              : { txHash: transfer.txHash, route: transfer.route },
          createdAt: new Date(transfer.timestamp),
        },
      ],
    });
  }

  console.log(
    `Seeded ${recipients.length} recipients, ${demoTransfers.length} transfers, and ${walletActivity.length} wallet events for ${demoUser.email}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
