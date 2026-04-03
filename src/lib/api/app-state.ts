import {
  NotificationPreference,
  PreferredMethod,
  RailName,
  TransferStatus,
  type RailQuery,
  type Recipient,
  type Transfer,
  type User,
  type Wallet,
} from "@prisma/client";
import {
  demoRecipients,
  demoTransfers,
  demoUser,
  formatCurrency,
  type DemoRecipient,
  type DemoRoute,
  type DemoTransfer,
  type DemoWalletActivity,
  walletActivity,
} from "@/lib/demo-data";
import { db } from "@/server/db";

type UserWithWallet = User & {
  wallet: Wallet | null;
};

type TransferWithRelations = Transfer & {
  recipient: Recipient;
  railQueries: RailQuery[];
};

type AppStateDependencies = {
  db: typeof db;
};

const defaultDependencies: AppStateDependencies = {
  db,
};

function shouldSkipDatabaseReads() {
  return (
    process.env.npm_lifecycle_event === "build" ||
    process.env.NEXT_PHASE === "phase-production-build"
  );
}

const countryCodeMap: Record<string, string> = {
  Nigeria: "NG",
  Ghana: "GH",
  Kenya: "KE",
};

const railLabelMap: Record<RailName, string> = {
  [RailName.WISE]: "Wise",
  [RailName.KOTANI]: "Kotani Pay",
  [RailName.KITE_NATIVE]: "Kite USDC",
  [RailName.MOCK]: "Reserve Demo Rail",
};

function normalizeCountryCode(country: string) {
  return countryCodeMap[country] ?? country.slice(0, 2).toUpperCase();
}

function normalizePreferredMethod(method: PreferredMethod): DemoRecipient["method"] {
  switch (method) {
    case PreferredMethod.WALLET:
      return "wallet";
    case PreferredMethod.BANK:
      return "bank";
    case PreferredMethod.MOBILE_MONEY:
      return "mobile_money";
    case PreferredMethod.CASH:
      return "cash";
    default:
      return "wallet";
  }
}

function formatEta(minutes: number) {
  if (minutes < 60) {
    return `~${minutes} min`;
  }

  const hours = Math.round((minutes / 60) * 10) / 10;
  return `~${hours} hour${hours === 1 ? "" : "s"}`;
}

function safeNumber(value: { toString(): string } | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  return Number(value.toString());
}

function buildRouteScore(amountUsd: number, feeUsd: number, etaMinutes: number) {
  const feePercent = amountUsd > 0 ? (feeUsd / amountUsd) * 100 : 0;
  if (feePercent <= 0 || etaMinutes <= 0) {
    return 0;
  }

  return Number((((1 / feePercent) * (1 / etaMinutes)) * 100).toFixed(3));
}

function mapRailQueries(
  transfer: TransferWithRelations,
): DemoRoute[] {
  if (!transfer.railQueries.length) {
    return demoTransfers[0]?.railsQueried ?? [];
  }

  return transfer.railQueries.map((query) => {
    const feeUsd = safeNumber(query.feeUsd);

    return {
      railName: query.railName,
      label: railLabelMap[query.railName],
      feeUsd,
      feePercent:
        transfer.amountUsd && safeNumber(transfer.amountUsd) > 0
          ? Number(((feeUsd / safeNumber(transfer.amountUsd)) * 100).toFixed(2))
          : 0,
      eta: formatEta(query.etaMinutes),
      etaMinutes: query.etaMinutes,
      score: buildRouteScore(
        safeNumber(transfer.amountUsd),
        feeUsd,
        query.etaMinutes,
      ),
      available: query.available,
      simulated: query.railName === RailName.MOCK,
      reason:
        query.reason ??
        `${railLabelMap[query.railName]} was returned for this transfer corridor.`,
    };
  });
}

function mapRecipient(recipient: Recipient): DemoRecipient {
  return {
    id: recipient.id,
    name: recipient.name,
    country: recipient.country,
    countryCode: normalizeCountryCode(recipient.country),
    phone: recipient.phone,
    method: normalizePreferredMethod(recipient.preferredMethod),
    relationship: recipient.isFavorite ? "Saved recipient" : "Recipient",
  };
}

function mapTransfer(transfer: TransferWithRelations): DemoTransfer {
  return {
    id: transfer.id,
    recipientId: transfer.recipientId,
    recipientName: transfer.recipient.name,
    country: transfer.recipient.country,
    countryCode: normalizeCountryCode(transfer.recipient.country),
    amountUsd: safeNumber(transfer.amountUsd),
    netDeliveryUsd: safeNumber(transfer.netDeliveryUsd),
    feeUsd: safeNumber(transfer.feeUsd),
    savedUsd: safeNumber(transfer.savingsUsd),
    route: transfer.routeSelected ?? RailName.MOCK,
    routeLabel: railLabelMap[transfer.routeSelected ?? RailName.MOCK],
    status: transfer.status,
    timestamp: transfer.createdAt.toISOString(),
    attestationHash:
      transfer.kiteAttestationHash ??
      demoTransfers[0]?.attestationHash ??
      transfer.kiteTxHash ??
      "0x0",
    attestationUrl:
      transfer.kiteAttestationUrl ??
      demoTransfers[0]?.attestationUrl ??
      "#",
    txHash: transfer.kiteTxHash ?? "pending",
    routeReason:
      transfer.routeReason ??
      `${railLabelMap[transfer.routeSelected ?? RailName.MOCK]} was selected for this transfer.`,
    railsQueried: mapRailQueries(transfer),
  };
}

async function resolveCurrentUser(
  overrides: Partial<AppStateDependencies> = {},
): Promise<UserWithWallet | null> {
  const dependencies = {
    ...defaultDependencies,
    ...overrides,
  };

  const include = {
    wallet: true,
  };

  const seededUser = await dependencies.db.user.findFirst({
    where: {
      email: demoUser.email,
    },
    include,
  });

  if (seededUser) {
    return seededUser;
  }

  return dependencies.db.user.findFirst({
    include,
  });
}

export type DashboardSnapshot = {
  user: typeof demoUser;
  recipients: DemoRecipient[];
  transfers: DemoTransfer[];
};

export type HistorySnapshot = {
  transfers: DemoTransfer[];
};

export type WalletSnapshot = {
  user: typeof demoUser;
  activities: DemoWalletActivity[];
};

export type ProfileSnapshot = {
  user: typeof demoUser & {
    notificationPreference: NotificationPreference | "SMS";
    kycStatus: string;
  };
  recipients: DemoRecipient[];
};

function buildAppUser(
  user: UserWithWallet,
  totalTransfers: number,
): DashboardSnapshot["user"] {
  return {
    ...demoUser,
    name: user.fullName ?? demoUser.name,
    email: user.email,
    phone: user.phone ?? demoUser.phone,
    country: user.country ?? demoUser.country,
    balanceUsd: safeNumber(user.wallet?.usdcBalance ?? demoUser.balanceUsd),
    totalSavedUsd: safeNumber(
      user.wallet?.totalSavingsUsd ?? demoUser.totalSavedUsd,
    ),
    last30DaySavedUsd: safeNumber(
      user.wallet?.totalSavingsUsd ?? demoUser.last30DaySavedUsd,
    ),
    passportAddress:
      user.kitePassportAddress ??
      user.wallet?.kiteAddress ??
      demoUser.passportAddress,
    passportHash: user.kitePassportHash ?? demoUser.passportHash,
    reputationScore: user.wallet?.reputationScore ?? demoUser.reputationScore,
    totalTransfers: totalTransfers || demoUser.totalTransfers,
  };
}

function getFallbackDashboardSnapshot(): DashboardSnapshot {
  return {
    user: demoUser,
    recipients: demoRecipients,
    transfers: demoTransfers,
  };
}

function getFallbackHistorySnapshot(status?: TransferStatus): HistorySnapshot {
  return {
    transfers: status
      ? demoTransfers.filter((transfer) => transfer.status === status)
      : demoTransfers,
  };
}

function getFallbackWalletSnapshot(): WalletSnapshot {
  return {
    user: demoUser,
    activities: walletActivity,
  };
}

function getFallbackProfileSnapshot(): ProfileSnapshot {
  return {
    user: {
      ...demoUser,
      notificationPreference: "SMS",
      kycStatus: "VERIFIED",
    },
    recipients: demoRecipients,
  };
}

export async function getDashboardSnapshot(
  overrides: Partial<AppStateDependencies> = {},
): Promise<DashboardSnapshot> {
  if (shouldSkipDatabaseReads()) {
    return getFallbackDashboardSnapshot();
  }

  try {
    const dependencies = {
      ...defaultDependencies,
      ...overrides,
    };
    const user = await resolveCurrentUser(dependencies);

    if (!user) {
      return getFallbackDashboardSnapshot();
    }

    const [recipients, transfers, totalTransfers] = await Promise.all([
      dependencies.db.recipient.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      }),
      dependencies.db.transfer.findMany({
        where: {
          senderId: user.id,
        },
        include: {
          recipient: true,
          railQueries: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
      dependencies.db.transfer.count({
        where: {
          senderId: user.id,
        },
      }),
    ]);

    return {
      user: buildAppUser(user, totalTransfers),
      recipients: recipients.length ? recipients.map(mapRecipient) : demoRecipients,
      transfers: transfers.length ? transfers.map(mapTransfer) : demoTransfers,
    };
  } catch {
    return getFallbackDashboardSnapshot();
  }
}

export async function getHistorySnapshot(
  params: { status?: TransferStatus } = {},
  overrides: Partial<AppStateDependencies> = {},
): Promise<HistorySnapshot> {
  if (shouldSkipDatabaseReads()) {
    return getFallbackHistorySnapshot(params.status);
  }

  try {
    const dependencies = {
      ...defaultDependencies,
      ...overrides,
    };
    const user = await resolveCurrentUser(dependencies);

    if (!user) {
      return getFallbackHistorySnapshot(params.status);
    }

    const transfers = await dependencies.db.transfer.findMany({
      where: {
        senderId: user.id,
        ...(params.status ? { status: params.status } : {}),
      },
      include: {
        recipient: true,
        railQueries: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 25,
    });

    return {
      transfers: transfers.length ? transfers.map(mapTransfer) : demoTransfers,
    };
  } catch {
    return getFallbackHistorySnapshot(params.status);
  }
}

export async function getWalletSnapshot(
  overrides: Partial<AppStateDependencies> = {},
): Promise<WalletSnapshot> {
  if (shouldSkipDatabaseReads()) {
    return getFallbackWalletSnapshot();
  }

  try {
    const dependencies = {
      ...defaultDependencies,
      ...overrides,
    };
    const user = await resolveCurrentUser(dependencies);

    if (!user) {
      return getFallbackWalletSnapshot();
    }

    const [transfers, totalTransfers] = await Promise.all([
      dependencies.db.transfer.findMany({
        where: {
          senderId: user.id,
        },
        include: {
          recipient: true,
          railQueries: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
      }),
      dependencies.db.transfer.count({
        where: {
          senderId: user.id,
        },
      }),
    ]);

    const activities: DemoWalletActivity[] = transfers.length
      ? transfers.map((transfer) => ({
          id: `wallet_${transfer.id}`,
          direction: "out",
          amountUsd: safeNumber(transfer.amountUsd) + safeNumber(transfer.feeUsd),
          label: `Transfer to ${transfer.recipient.name} via ${railLabelMap[transfer.routeSelected ?? RailName.MOCK]}`,
          timestamp: transfer.createdAt.toISOString(),
          txHash: transfer.kiteTxHash ?? "pending",
        }))
      : walletActivity;

    return {
      user: buildAppUser(user, totalTransfers),
      activities,
    };
  } catch {
    return getFallbackWalletSnapshot();
  }
}

export async function getProfileSnapshot(
  overrides: Partial<AppStateDependencies> = {},
): Promise<ProfileSnapshot> {
  if (shouldSkipDatabaseReads()) {
    return getFallbackProfileSnapshot();
  }

  try {
    const dependencies = {
      ...defaultDependencies,
      ...overrides,
    };
    const user = await resolveCurrentUser(dependencies);

    if (!user) {
      return getFallbackProfileSnapshot();
    }

    const [recipients, totalTransfers] = await Promise.all([
      dependencies.db.recipient.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      dependencies.db.transfer.count({
        where: {
          senderId: user.id,
        },
      }),
    ]);

    return {
      user: {
        ...buildAppUser(user, totalTransfers),
        notificationPreference: user.notificationPreference,
        kycStatus: user.kycStatus,
      },
      recipients: recipients.length ? recipients.map(mapRecipient) : demoRecipients,
    };
  } catch {
    return getFallbackProfileSnapshot();
  }
}

export function summarizeSavings(value: number) {
  return `You've saved ${formatCurrency(value)}`;
}
