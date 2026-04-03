import { GokiteAASDK } from "gokite-aa-sdk";
import { Contract, JsonRpcProvider, Signature, Wallet, ethers } from "ethers";
import {
  getGaslessNetworkPath,
  getKiteConfig,
  getKiteExplorerTxUrl,
  hasKiteSigner,
} from "@/lib/config/kite";
import type {
  AttestationLookupResult,
  AttestationWriteResult,
  GaslessSupportedToken,
  GaslessSupportedTokensResponse,
  GaslessTransferInput,
  KitePassport,
  KiteTransferReceipt,
  X402ChallengeResponse,
  X402PaymentResult,
} from "@/types/kite";

const erc20Abi = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function decimals() view returns (uint8)",
] as const;

const gaslessTransferTypes: Record<
  string,
  Array<{ name: string; type: string }>
> = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
};

let provider: JsonRpcProvider | null = null;
let sdk: GokiteAASDK | null = null;

function normalizePrivateKey(seed: string): string {
  const digest = ethers.keccak256(ethers.toUtf8Bytes(seed));
  return digest;
}

function getServiceWallet(): Wallet | null {
  const config = getKiteConfig();
  if (!config.servicePrivateKey) {
    return null;
  }

  return new Wallet(config.servicePrivateKey, getKiteProvider());
}

function getRequiredServiceWallet(): Wallet {
  const wallet = getServiceWallet();
  if (!wallet) {
    throw new Error(
      "KITE_SERVICE_PRIVATE_KEY is required for signed Kite transactions.",
    );
  }

  return wallet;
}

function getSettlementTokenContract(address: string, signerOrProvider?: Wallet | JsonRpcProvider) {
  return new Contract(
    address,
    erc20Abi,
    signerOrProvider ?? getKiteProvider(),
  );
}

function parseAmountToUnits(
  amount: string | number | bigint,
  decimals: number,
): bigint {
  if (typeof amount === "bigint") {
    return amount;
  }

  return ethers.parseUnits(String(amount), decimals);
}

export function getKiteProvider(): JsonRpcProvider {
  if (!provider) {
    provider = new JsonRpcProvider(getKiteConfig().rpcUrl);
  }

  return provider;
}

export function getKiteSdk(): GokiteAASDK {
  if (!sdk) {
    const config = getKiteConfig();
    sdk = new GokiteAASDK(config.network, config.rpcUrl, config.bundlerUrl);
  }

  return sdk;
}

export function derivePassportOwnerWallet(userId: string): Wallet {
  const config = getKiteConfig();
  const seed = config.servicePrivateKey
    ? `${config.servicePrivateKey}:${userId}`
    : `kova-demo:${userId}`;

  return new Wallet(normalizePrivateKey(seed));
}

export async function createAgentPassport(
  userId: string,
  ownerAddress?: string,
): Promise<KitePassport> {
  const owner = ownerAddress ?? derivePassportOwnerWallet(userId).address;
  const kiteSdk = getKiteSdk();
  const walletAddress = kiteSdk.getAccountAddress(owner);
  const [network, blockNumber, deployed] = await Promise.all([
    getKiteProvider().getNetwork(),
    getKiteProvider().getBlockNumber(),
    kiteSdk.isAccountDeloyed(walletAddress).catch(() => false),
  ]);

  const passportHash = ethers.keccak256(
    ethers.toUtf8Bytes(
      JSON.stringify({
        userId,
        ownerAddress: owner,
        walletAddress,
        chainId: Number(network.chainId),
      }),
    ),
  );

  return {
    ownerAddress: owner,
    walletAddress,
    passportHash,
    deployed,
    chainId: Number(network.chainId),
    blockNumber,
  };
}

export async function getUSDCBalance(address: string): Promise<string> {
  const config = getKiteConfig();
  const contract = getSettlementTokenContract(config.settlementTokenAddress);
  const [rawBalance, decimals] = await Promise.all([
    contract.balanceOf(address) as Promise<bigint>,
    contract.decimals().catch(() => config.settlementTokenDecimals) as Promise<number>,
  ]);

  return ethers.formatUnits(rawBalance, decimals);
}

export async function sendUSDC(
  from: string,
  to: string,
  amount: string | number | bigint,
): Promise<KiteTransferReceipt> {
  const config = getKiteConfig();
  const signer = getRequiredServiceWallet();

  if (signer.address.toLowerCase() !== from.toLowerCase()) {
    throw new Error(
      "The configured Kite service signer does not control the requested sender address.",
    );
  }

  const contract = getSettlementTokenContract(config.settlementTokenAddress, signer);
  const decimals =
    ((await contract.decimals().catch(
      () => config.settlementTokenDecimals,
    )) as number) ?? config.settlementTokenDecimals;
  const value = parseAmountToUnits(amount, decimals);
  const tx = await contract.transfer(to, value);
  await tx.wait();

  return {
    txHash: tx.hash,
    explorerUrl: getKiteExplorerTxUrl(tx.hash),
  };
}

export async function sendUSDCFromPassport(
  userId: string,
  to: string,
  amount: string | number | bigint,
): Promise<KiteTransferReceipt> {
  const config = getKiteConfig();
  const ownerWallet = derivePassportOwnerWallet(userId).connect(getKiteProvider());
  const kiteSdk = getKiteSdk();
  const signFunction = async (userOpHash: string) =>
    ownerWallet.signMessage(ethers.getBytes(userOpHash));
  const transferInterface = ethers.Interface.from([
    "function transfer(address to, uint256 amount)",
  ]);
  const value = parseAmountToUnits(amount, config.settlementTokenDecimals);
  const result = await kiteSdk.sendUserOperationAndWait(
    ownerWallet.address,
    {
      target: config.settlementTokenAddress,
      value: BigInt(0),
      callData: transferInterface.encodeFunctionData("transfer", [to, value]),
    },
    signFunction,
  );

  if (result.status.status !== "success" || !result.status.transactionHash) {
    throw new Error(
      result.status.reason ?? "Kite passport transfer did not complete successfully.",
    );
  }

  return {
    txHash: result.status.transactionHash,
    explorerUrl: getKiteExplorerTxUrl(result.status.transactionHash),
  };
}

export async function fetchX402PaymentChallenge(): Promise<X402ChallengeResponse> {
  const response = await fetch(getKiteConfig().x402ChallengeUrl, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  const payload = (await response.json()) as X402ChallengeResponse;
  if (!payload.accepts?.length) {
    throw new Error("Kite x402 challenge response did not include payment requirements.");
  }

  return payload;
}

export async function payRailQuery(
  agentAddress: string,
  amount: string | number | bigint,
): Promise<X402PaymentResult> {
  const challenge = await fetchX402PaymentChallenge();
  const paymentTarget = challenge.accepts[0];

  if (!hasKiteSigner()) {
    const txHash = ethers.keccak256(
      ethers.toUtf8Bytes(
        JSON.stringify({
          agentAddress,
          amount: String(amount),
          challenge: paymentTarget,
        }),
      ),
    );

    return {
      txHash,
      submitted: false,
      explorerUrl: null,
      challenge: paymentTarget,
    };
  }

  const signer = getRequiredServiceWallet();
  const contract = getSettlementTokenContract(paymentTarget.asset, signer);
  const decimals =
    ((await contract.decimals().catch(() => 18)) as number) ?? 18;
  const value = parseAmountToUnits(amount, decimals);
  const tx = await contract.transfer(paymentTarget.payTo, value);
  await tx.wait();

  return {
    txHash: tx.hash,
    submitted: true,
    explorerUrl: getKiteExplorerTxUrl(tx.hash),
    challenge: paymentTarget,
  };
}

export async function fetchSupportedGaslessTokens(): Promise<GaslessSupportedTokensResponse> {
  const response = await fetch(`${getKiteConfig().gaslessApiUrl}/supported_tokens`, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load Kite gasless supported tokens: ${response.status}`);
  }

  return (await response.json()) as GaslessSupportedTokensResponse;
}

function selectGaslessToken(
  payload: GaslessSupportedTokensResponse,
  requestedTokenAddress?: string,
): GaslessSupportedToken {
  const networkTokens =
    getGaslessNetworkPath() === "mainnet" ? payload.mainnet : payload.testnet;
  const config = getKiteConfig();
  const tokenAddress =
    requestedTokenAddress ?? config.gaslessTokenAddress;

  const token =
    networkTokens.find(
      ({ address }) => address.toLowerCase() === tokenAddress.toLowerCase(),
    ) ?? networkTokens[0];

  if (!token) {
    throw new Error("No supported Kite gasless token is available for the current network.");
  }

  return token;
}

export async function executeGaslessTransaction(
  transfer: GaslessTransferInput,
): Promise<KiteTransferReceipt> {
  const wallet = getRequiredServiceWallet();
  const tokens = await fetchSupportedGaslessTokens();
  const token = selectGaslessToken(tokens, transfer.tokenAddress);
  const providerInstance = getKiteProvider();
  const latestBlock = await providerInstance.getBlock("latest");
  if (!latestBlock) {
    throw new Error("Unable to read the latest Kite testnet block.");
  }

  const validAfter = BigInt(latestBlock.timestamp + 1);
  const validBefore =
    validAfter + BigInt(transfer.validForSeconds ?? 120);
  const nonce = ethers.hexlify(ethers.randomBytes(32));
  const amount = parseAmountToUnits(transfer.amount, token.decimals);
  const from = transfer.from ?? wallet.address;

  if (from.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(
      "The configured Kite service signer does not control the requested gasless sender address.",
    );
  }

  const signature = await wallet.signTypedData(
    {
      name: token.eip712_name,
      version: token.eip712_version,
      chainId: getKiteConfig().chainId,
      verifyingContract: token.address,
    },
    gaslessTransferTypes,
    {
      from,
      to: transfer.to,
      value: amount,
      validAfter,
      validBefore,
      nonce,
    },
  );

  const splitSignature = Signature.from(signature);
  const response = await fetch(
    `${getKiteConfig().gaslessApiUrl}/${getGaslessNetworkPath()}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: transfer.to,
        value: amount.toString(),
        validAfter: validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce,
        v: splitSignature.v,
        r: splitSignature.r,
        s: splitSignature.s,
      }),
    },
  );

  const payload = (await response.json()) as { txHash?: string; error?: string };
  if (!response.ok || !payload.txHash) {
    throw new Error(payload.error ?? "Kite gasless relay request failed.");
  }

  return {
    txHash: payload.txHash,
    explorerUrl: getKiteExplorerTxUrl(payload.txHash),
  };
}

export async function writeAttestation(
  transferId: string,
  payload: Record<string, unknown>,
): Promise<AttestationWriteResult> {
  const serialized = JSON.stringify({
    transferId,
    ...payload,
  });
  const commitment = ethers.keccak256(ethers.toUtf8Bytes(serialized));

  if (!hasKiteSigner()) {
    return {
      attestationHash: commitment,
      explorerUrl: null,
      commitment,
      submitted: false,
    };
  }

  const signer = getRequiredServiceWallet();
  const tx = await signer.sendTransaction({
    to: signer.address,
    data: ethers.hexlify(ethers.toUtf8Bytes(serialized)),
  });
  await tx.wait();

  return {
    attestationHash: tx.hash,
    explorerUrl: getKiteExplorerTxUrl(tx.hash),
    commitment,
    submitted: true,
  };
}

export async function getAttestationByHash<TPayload = Record<string, unknown>>(
  attestationHash: string,
): Promise<AttestationLookupResult<TPayload> | null> {
  const tx = await getKiteProvider().getTransaction(attestationHash);
  if (!tx) {
    return null;
  }

  let payload: TPayload | null = null;
  let commitment: string | null = null;
  if (tx.data && tx.data !== "0x") {
    try {
      const raw = ethers.toUtf8String(tx.data);
      payload = JSON.parse(raw) as TPayload;
      commitment = ethers.keccak256(ethers.toUtf8Bytes(raw));
    } catch {
      payload = null;
      commitment = null;
    }
  }

  return {
    attestationHash,
    explorerUrl: getKiteExplorerTxUrl(attestationHash),
    from: tx.from,
    to: tx.to,
    blockNumber: tx.blockNumber,
    payload,
    commitment,
  };
}
