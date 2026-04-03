import { NETWORKS } from "gokite-aa-sdk";

const kiteNetwork = NETWORKS.kite_testnet;

export type KiteConfig = {
  network: "kite_testnet";
  chainId: number;
  rpcUrl: string;
  bundlerUrl: string;
  explorerUrl: string;
  settlementTokenAddress: string;
  settlementTokenDecimals: number;
  gaslessApiUrl: string;
  gaslessTokenAddress: string;
  x402ChallengeUrl: string;
  servicePrivateKey: string | null;
};

export function getKiteConfig(): KiteConfig {
  return {
    network: "kite_testnet",
    chainId: Number(process.env.KITE_CHAIN_ID ?? kiteNetwork.chainId),
    rpcUrl: process.env.KITE_RPC_URL ?? "https://rpc-testnet.gokite.ai/",
    bundlerUrl:
      process.env.KITE_BUNDLER_RPC_URL ??
      "https://bundler-service.staging.gokite.ai/rpc/",
    explorerUrl: process.env.KITE_EXPLORER_URL ?? "https://testnet.kitescan.ai",
    settlementTokenAddress:
      process.env.KITE_SETTLEMENT_TOKEN_ADDRESS ?? kiteNetwork.settlementToken,
    settlementTokenDecimals: Number(
      process.env.KITE_SETTLEMENT_TOKEN_DECIMALS ?? 18,
    ),
    gaslessApiUrl: process.env.KITE_GASLESS_API_URL ?? "https://gasless.gokite.ai",
    gaslessTokenAddress:
      process.env.KITE_GASLESS_TOKEN_ADDRESS ??
      "0x8E04D099b1a8Dd20E6caD4b2Ab2B405B98242ec9",
    x402ChallengeUrl:
      process.env.KITE_X402_CHALLENGE_URL ??
      "https://x402.dev.gokite.ai/api/weather?location=San%20Francisco",
    servicePrivateKey: process.env.KITE_SERVICE_PRIVATE_KEY ?? null,
  };
}

export function hasKiteSigner(): boolean {
  return Boolean(getKiteConfig().servicePrivateKey);
}

export function getKiteExplorerTxUrl(txHash: string): string {
  return `${getKiteConfig().explorerUrl}/tx/${txHash}`;
}

export function getGaslessNetworkPath(): "testnet" | "mainnet" {
  return getKiteConfig().chainId === 2366 ? "mainnet" : "testnet";
}
