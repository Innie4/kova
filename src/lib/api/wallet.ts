import { getKiteConfig } from "@/lib/config/kite";
import { getUSDCBalance } from "@/lib/kite/client";
import { registerPassport } from "@/lib/kite/passport";
import { db } from "@/server/db";

type WalletDependencies = {
  db: typeof db;
  getUSDCBalance: typeof getUSDCBalance;
  registerPassport: typeof registerPassport;
};

const defaultDependencies: WalletDependencies = {
  db,
  getUSDCBalance,
  registerPassport,
};

async function ensureWalletRecord(
  userId: string,
  overrides: Partial<WalletDependencies> = {},
) {
  const dependencies = {
    ...defaultDependencies,
    ...overrides,
  };
  const user = await dependencies.db.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      wallet: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  let kiteAddress = user.kitePassportAddress;
  if (!kiteAddress) {
    const passport = await dependencies.registerPassport(userId);
    kiteAddress = passport.walletAddress;
  }

  const balance = await dependencies.getUSDCBalance(kiteAddress);
  const wallet =
    user.wallet ??
    (await dependencies.db.wallet.create({
      data: {
        userId,
        kiteAddress,
        depositAddress: kiteAddress,
        usdcBalance: balance,
      },
    }));

  if (!user.wallet) {
    return {
      wallet,
      kiteAddress,
      balance,
    };
  }

  const updatedWallet = await dependencies.db.wallet.update({
    where: {
      id: wallet.id,
    },
    data: {
      kiteAddress,
      depositAddress: wallet.depositAddress ?? kiteAddress,
      usdcBalance: balance,
    },
  });

  return {
    wallet: updatedWallet,
    kiteAddress,
    balance,
  };
}

export async function generateDepositAddress(
  userId: string,
  overrides: Partial<WalletDependencies> = {},
) {
  const result = await ensureWalletRecord(userId, overrides);
  const config = getKiteConfig();

  return {
    userId,
    address: result.wallet.depositAddress ?? result.kiteAddress,
    kiteAddress: result.kiteAddress,
    tokenSymbol: "USDC",
    tokenAddress: config.settlementTokenAddress,
    network: config.network,
  };
}

export async function getWalletBalanceSnapshot(
  params: { userId?: string; address?: string },
  overrides: Partial<WalletDependencies> = {},
) {
  const dependencies = {
    ...defaultDependencies,
    ...overrides,
  };

  let address = params.address ?? null;

  if (params.userId) {
    const ensured = await ensureWalletRecord(params.userId, dependencies);
    address = ensured.kiteAddress;
  }

  if (!address) {
    throw new Error("A userId or address is required to fetch wallet balance.");
  }

  const balance = await dependencies.getUSDCBalance(address);

  return {
    address,
    balance,
    tokenSymbol: "USDC",
    network: getKiteConfig().network,
  };
}
