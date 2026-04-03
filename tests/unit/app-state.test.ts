import { NotificationPreference, RailName, TransferStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  getDashboardSnapshot,
  getHistorySnapshot,
  getWalletSnapshot,
} from "@/lib/api/app-state";
import { demoTransfers, demoUser, walletActivity } from "@/lib/demo-data";

function createMockDb() {
  return {
    user: {
      findFirst: vi.fn(),
    },
    recipient: {
      findMany: vi.fn(),
    },
    transfer: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  };
}

describe("app state snapshots", () => {
  it("maps dashboard data from the database when records are available", async () => {
    const mockDb = createMockDb();
    const user = {
      id: "user_1",
      email: "itoro@kova.app",
      fullName: "Itoro A.",
      phone: "+2348012345678",
      country: "Nigeria",
      kitePassportAddress: "0x1234567890abcdef1234567890abcdef12345678",
      kitePassportHash: "0xpassporthash",
      kycStatus: "VERIFIED",
      notificationPreference: NotificationPreference.BOTH,
      createdAt: new Date("2026-04-03T09:00:00.000Z"),
      updatedAt: new Date("2026-04-03T09:00:00.000Z"),
      demoModeEnabled: false,
      wallet: {
        id: "wallet_1",
        userId: "user_1",
        kiteAddress: "0x1234567890abcdef1234567890abcdef12345678",
        depositAddress: "0x1234567890abcdef1234567890abcdef12345678",
        usdcBalance: 1245.5,
        reputationScore: 97,
        totalSavingsUsd: 83.4,
        createdAt: new Date("2026-04-03T09:00:00.000Z"),
        updatedAt: new Date("2026-04-03T09:00:00.000Z"),
      },
    };

    mockDb.user.findFirst.mockResolvedValueOnce(user).mockResolvedValueOnce(user);
    mockDb.recipient.findMany.mockResolvedValueOnce([
      {
        id: "recipient_1",
        userId: "user_1",
        name: "Mum",
        country: "Nigeria",
        phone: "+2348001110091",
        preferredMethod: "MOBILE_MONEY",
        bankName: null,
        bankAccountHint: null,
        mobileNetwork: "MTN",
        isFavorite: true,
        createdAt: new Date("2026-04-03T09:00:00.000Z"),
        updatedAt: new Date("2026-04-03T09:00:00.000Z"),
      },
    ]);
    mockDb.transfer.findMany.mockResolvedValueOnce([
      {
        id: "transfer_1",
        senderId: "user_1",
        recipientId: "recipient_1",
        amountUsd: 150,
        feeUsd: 0.6,
        savingsUsd: 9.6,
        netDeliveryUsd: 149.4,
        routeSelected: RailName.KITE_NATIVE,
        routeReason: "Kite USDC was the lowest fee route.",
        status: TransferStatus.COMPLETED,
        requiresConfirmation: false,
        intentRaw: "Send $150 to Nigeria",
        kiteAttestationHash: "0xattestation",
        kiteAttestationUrl: "https://kitescan.example/tx/0xattestation",
        kiteTxHash: "0xtxhash",
        notificationStatus: "SENT",
        railsQueried: null,
        createdAt: new Date("2026-04-03T09:12:00.000Z"),
        completedAt: new Date("2026-04-03T09:15:00.000Z"),
        recipient: {
          id: "recipient_1",
          userId: "user_1",
          name: "Mum",
          country: "Nigeria",
          phone: "+2348001110091",
          preferredMethod: "MOBILE_MONEY",
          bankName: null,
          bankAccountHint: null,
          mobileNetwork: "MTN",
          isFavorite: true,
          createdAt: new Date("2026-04-03T09:00:00.000Z"),
          updatedAt: new Date("2026-04-03T09:00:00.000Z"),
        },
        railQueries: [
          {
            id: "rail_1",
            transferId: "transfer_1",
            railName: RailName.KITE_NATIVE,
            feeUsd: 0.6,
            etaMinutes: 3,
            rate: 1,
            available: true,
            reason: "Fastest and cheapest",
            queryTimeMs: 240,
            queriedAt: new Date("2026-04-03T09:11:00.000Z"),
          },
        ],
      },
    ]);
    mockDb.transfer.count.mockResolvedValueOnce(12);

    const snapshot = await getDashboardSnapshot({
      db: mockDb as never,
    });

    expect(snapshot.user.balanceUsd).toBe(1245.5);
    expect(snapshot.user.reputationScore).toBe(97);
    expect(snapshot.user.totalTransfers).toBe(12);
    expect(snapshot.recipients[0]).toMatchObject({
      name: "Mum",
      countryCode: "NG",
      method: "mobile_money",
    });
    expect(snapshot.transfers[0]).toMatchObject({
      route: RailName.KITE_NATIVE,
      routeLabel: "Kite USDC",
      attestationHash: "0xattestation",
      savedUsd: 9.6,
    });
  });

  it("filters fallback history data by status when the database is unavailable", async () => {
    const mockDb = {
      user: {
        findFirst: vi.fn(async () => {
          throw new Error("database unavailable");
        }),
      },
    };

    const snapshot = await getHistorySnapshot(
      { status: TransferStatus.FAILED },
      { db: mockDb as never },
    );

    expect(snapshot.transfers).toEqual(
      demoTransfers.filter((transfer) => transfer.status === TransferStatus.FAILED),
    );
  });

  it("derives wallet activity from transfers and falls back cleanly when no records exist", async () => {
    const mockDb = createMockDb();
    const user = {
      id: "user_2",
      email: demoUser.email,
      fullName: demoUser.name,
      phone: demoUser.phone,
      country: demoUser.country,
      kitePassportAddress: demoUser.passportAddress,
      kitePassportHash: demoUser.passportHash,
      kycStatus: "VERIFIED",
      notificationPreference: NotificationPreference.SMS,
      createdAt: new Date("2026-04-03T09:00:00.000Z"),
      updatedAt: new Date("2026-04-03T09:00:00.000Z"),
      demoModeEnabled: false,
      wallet: {
        id: "wallet_2",
        userId: "user_2",
        kiteAddress: demoUser.passportAddress,
        depositAddress: demoUser.passportAddress,
        usdcBalance: 1000,
        reputationScore: demoUser.reputationScore,
        totalSavingsUsd: demoUser.totalSavedUsd,
        createdAt: new Date("2026-04-03T09:00:00.000Z"),
        updatedAt: new Date("2026-04-03T09:00:00.000Z"),
      },
    };

    mockDb.user.findFirst.mockResolvedValueOnce(user).mockResolvedValueOnce(user);
    mockDb.transfer.findMany.mockResolvedValueOnce([
      {
        id: "transfer_wallet_1",
        senderId: "user_2",
        recipientId: "recipient_wallet_1",
        amountUsd: 200,
        feeUsd: 2,
        savingsUsd: 5,
        netDeliveryUsd: 198,
        routeSelected: RailName.KOTANI,
        routeReason: "Best corridor route",
        status: TransferStatus.COMPLETED,
        requiresConfirmation: false,
        intentRaw: "Send $200 to Ghana",
        kiteAttestationHash: "0xwalletattestation",
        kiteAttestationUrl: "https://kitescan.example/tx/0xwalletattestation",
        kiteTxHash: "0xwallettx",
        notificationStatus: "SENT",
        railsQueried: null,
        createdAt: new Date("2026-04-03T08:00:00.000Z"),
        completedAt: new Date("2026-04-03T08:08:00.000Z"),
        recipient: {
          id: "recipient_wallet_1",
          userId: "user_2",
          name: "Ama Mensah",
          country: "Ghana",
          phone: "+233540222551",
          preferredMethod: "MOBILE_MONEY",
          bankName: null,
          bankAccountHint: null,
          mobileNetwork: "MTN",
          isFavorite: false,
          createdAt: new Date("2026-04-03T07:55:00.000Z"),
          updatedAt: new Date("2026-04-03T07:55:00.000Z"),
        },
        railQueries: [],
      },
    ]);
    mockDb.transfer.count.mockResolvedValueOnce(18);

    const snapshot = await getWalletSnapshot({
      db: mockDb as never,
    });

    expect(snapshot.user.totalTransfers).toBe(18);
    expect(snapshot.activities[0]).toMatchObject({
      direction: "out",
      amountUsd: 202,
      label: "Transfer to Ama Mensah via Kotani Pay",
    });

    mockDb.user.findFirst.mockRejectedValueOnce(new Error("offline"));
    const fallback = await getWalletSnapshot({
      db: mockDb as never,
    });

    expect(fallback.activities).toEqual(walletActivity);
  });
});
