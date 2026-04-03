export type KitePassport = {
  ownerAddress: string;
  walletAddress: string;
  passportHash: string;
  deployed: boolean;
  chainId: number;
  blockNumber: number;
};

export type KiteTransferReceipt = {
  txHash: string;
  explorerUrl: string;
};

export type X402PaymentRequirement = {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  merchantName: string;
  outputSchema?: unknown;
};

export type X402ChallengeResponse = {
  error: string;
  accepts: X402PaymentRequirement[];
  x402Version: number;
};

export type X402PaymentResult = {
  txHash: string;
  submitted: boolean;
  explorerUrl: string | null;
  challenge: X402PaymentRequirement;
};

export type GaslessSupportedToken = {
  address: string;
  balance_threshold: string;
  decimals: number;
  eip712_name: string;
  eip712_version: string;
  minimum_transfer_amount: string;
  name: string;
  symbol: string;
};

export type GaslessSupportedTokensResponse = {
  mainnet: GaslessSupportedToken[];
  testnet: GaslessSupportedToken[];
};

export type GaslessTransferInput = {
  from?: string;
  to: string;
  amount: string | number | bigint;
  tokenAddress?: string;
  validForSeconds?: number;
};

export type AttestationWriteResult = {
  attestationHash: string;
  explorerUrl: string | null;
  commitment: string;
  submitted: boolean;
};

export type AttestationLookupResult<TPayload = unknown> = {
  attestationHash: string;
  explorerUrl: string;
  from: string;
  to: string | null;
  blockNumber: number | null;
  payload: TPayload | null;
  commitment: string | null;
};
