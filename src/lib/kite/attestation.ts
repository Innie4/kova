import type { RailQuery, Transfer } from "@prisma/client";
import { ethers } from "ethers";
import { getAttestationByHash, writeAttestation } from "@/lib/kite/client";

export type AttestationPayload = {
  transfer_id: string;
  rails_queried: Array<{
    rail_name: string;
    fee_usd: string;
    eta_minutes: number;
    available: boolean;
    rate: string;
    reason: string | null;
  }>;
  rates_seen: Record<string, string>;
  route_selected: string | null;
  reason: string;
  timestamp: string;
  transfer_hash: string;
};

export function buildAttestationPayload(
  transfer: Pick<Transfer, "id" | "routeSelected" | "routeReason" | "amountUsd" | "feeUsd">,
  railQueries: Array<
    Pick<RailQuery, "railName" | "feeUsd" | "etaMinutes" | "available" | "rate" | "reason">
  >,
): AttestationPayload {
  const timestamp = new Date().toISOString();
  const rails = railQueries.map((query) => ({
    rail_name: query.railName,
    fee_usd: query.feeUsd.toString(),
    eta_minutes: query.etaMinutes,
    available: query.available,
    rate: query.rate.toString(),
    reason: query.reason,
  }));

  const transfer_hash = ethers.keccak256(
    ethers.toUtf8Bytes(
      JSON.stringify({
        transferId: transfer.id,
        amountUsd: transfer.amountUsd.toString(),
        feeUsd: transfer.feeUsd.toString(),
        routeSelected: transfer.routeSelected,
        timestamp,
      }),
    ),
  );

  return {
    transfer_id: transfer.id,
    rails_queried: rails,
    rates_seen: Object.fromEntries(
      rails.map((rail) => [rail.rail_name, rail.rate]),
    ),
    route_selected: transfer.routeSelected,
    reason:
      transfer.routeReason ??
      "Route selected based on the lowest effective fee and the fastest available delivery window.",
    timestamp,
    transfer_hash,
  };
}

export async function publishAttestation(payload: AttestationPayload) {
  return writeAttestation(payload.transfer_id, payload);
}

export async function getAttestationByHashFromChain(attestationHash: string) {
  return getAttestationByHash<AttestationPayload>(attestationHash);
}
