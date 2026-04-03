"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { TransferStatus } from "@prisma/client";
import { ChevronDown, ChevronUp, Download, ShieldCheck } from "lucide-react";
import { TransferStatusBadge } from "@/components/kova/status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  demoTransfers,
  formatCurrency,
  formatShortDate,
  type DemoTransfer,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const filters: Array<{ label: string; value: "ALL" | TransferStatus }> = [
  { label: "All", value: "ALL" },
  { label: "Completed", value: TransferStatus.COMPLETED },
  { label: "Pending", value: TransferStatus.PREVIEWED },
  { label: "Failed", value: TransferStatus.FAILED },
];

function buildCsv(transfers: DemoTransfer[]) {
  const rows = [
    ["Date", "Recipient", "Amount", "Fee", "Route", "Status", "Proof"],
    ...transfers.map((transfer) => [
      transfer.timestamp,
      transfer.recipientName,
      transfer.amountUsd.toFixed(2),
      transfer.feeUsd.toFixed(2),
      transfer.routeLabel,
      transfer.status,
      transfer.attestationHash,
    ]),
  ];

  return rows.map((row) => row.join(",")).join("\n");
}

export function HistoryTable({
  transfers = demoTransfers,
}: {
  transfers?: DemoTransfer[];
}) {
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | TransferStatus>(
    "ALL",
  );
  const [expandedTransferId, setExpandedTransferId] = useState<string | null>(
    transfers[0]?.id ?? null,
  );

  const visibleTransfers = useMemo(
    () =>
      transfers.filter((transfer) =>
        selectedFilter === "ALL" ? true : transfer.status === selectedFilter,
      ),
    [selectedFilter, transfers],
  );

  const csvHref = useMemo(() => {
    const csv = buildCsv(visibleTransfers);
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  }, [visibleTransfers]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setSelectedFilter(filter.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                selectedFilter === filter.value
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <a
          download="kova-transfer-history.csv"
          href={csvHref}
          className={buttonVariants({
            variant: "outline",
            className: "rounded-full px-4",
          })}
        >
          <Download className="size-4" />
          Export CSV
        </a>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Route Used</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Proof</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleTransfers.map((transfer) => {
              const expanded = expandedTransferId === transfer.id;

              return (
                <Fragment key={transfer.id}>
                  <TableRow>
                    <TableCell className="text-slate-600">
                      {formatShortDate(transfer.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-950">
                          {transfer.recipientName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {transfer.country}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-950">
                      {formatCurrency(transfer.amountUsd)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatCurrency(transfer.feeUsd)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {transfer.routeLabel}
                    </TableCell>
                    <TableCell>
                      <TransferStatusBadge status={transfer.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          href={`/attestation/${transfer.attestationHash}`}
                          className="text-sm font-medium text-[#0C82DD] hover:text-sky-700"
                        >
                          View on Kite
                        </Link>
                        <button
                          onClick={() =>
                            setExpandedTransferId(expanded ? null : transfer.id)
                          }
                          className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                        >
                          {expanded ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded ? (
                    <TableRow className="bg-slate-50/70">
                      <TableCell colSpan={7} className="p-4">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          {transfer.railsQueried.map((route) => (
                            <div
                              key={`${transfer.id}-${route.label}`}
                              className="rounded-2xl border border-slate-200 bg-white p-4"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-slate-950">
                                  {route.label}
                                </p>
                                {route.simulated ? (
                                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                                    Simulated
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-3 text-sm text-slate-600">
                                Fee {formatCurrency(route.feeUsd)} • {route.eta}
                              </p>
                              <p className="mt-2 text-xs leading-5 text-slate-500">
                                {route.reason}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                          <ShieldCheck className="size-4 text-emerald-500" />
                          {transfer.routeReason}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
