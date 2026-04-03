import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  demoUser,
  formatCurrency,
  formatShortDate,
  type DemoTransfer,
} from "@/lib/demo-data";

export function AttestationView({ transfer }: { transfer: DemoTransfer }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(12,130,221,0.18),transparent_35%),linear-gradient(145deg,#07111f_0%,#11284f_44%,#0a1831_100%)] p-8 text-white shadow-[0_30px_90px_rgba(3,12,31,0.36)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-200">
              Proof on Kite Chain
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              {formatCurrency(transfer.netDeliveryUsd)} delivered to{" "}
              {transfer.recipientName}.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-200">
              Kova queried multiple rails, selected {transfer.routeLabel}, and wrote
              the decision trail to Kite Chain for anyone to verify.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-slate-300">Verification status</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="font-semibold">Confirmed on Kite testnet</p>
                <p className="text-sm text-slate-300">
                  Transfer hash anchored at {formatShortDate(transfer.timestamp)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Transfer attestation
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Transfer ID</p>
              <p className="mt-2 font-semibold text-slate-950">{transfer.id}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Sender</p>
              <p className="mt-2 font-semibold text-slate-950">
                {demoUser.passportAddress.slice(0, 8)}...
                {demoUser.passportAddress.slice(-4)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Attestation hash</p>
              <p className="mt-2 font-semibold text-slate-950">
                {transfer.attestationHash.slice(0, 10)}...
                {transfer.attestationHash.slice(-8)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Route chosen</p>
              <p className="mt-2 font-semibold text-slate-950">{transfer.routeLabel}</p>
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-sm text-slate-200">
            <p className="font-semibold text-white">Decision reason</p>
            <p className="mt-3 leading-6 text-slate-300">{transfer.routeReason}</p>
            <div className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
              Timestamp {formatShortDate(transfer.timestamp)}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Rails queried
          </p>
          <div className="mt-6 space-y-3">
            {transfer.railsQueried.map((route) => (
              <div
                key={`${transfer.id}-${route.label}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{route.label}</p>
                    <p className="text-sm text-slate-500">{route.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-950">
                      {formatCurrency(route.feeUsd)}
                    </p>
                    <p className="text-sm text-slate-500">{route.eta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href={transfer.attestationUrl}
              className="text-sm font-semibold text-[#0C82DD] hover:text-sky-700"
            >
              Open Kite explorer record
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between text-left">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                What is this?
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                A plain-language explanation for non-crypto recipients
              </h2>
            </div>
            <span className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
              Expand
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 text-sm leading-7 text-slate-600">
            This page is Kova&apos;s receipt. It shows which rails were checked, what
            each rail would have charged, which one won, and a Kite Chain record
            that proves the comparison happened at that moment. Even if you do not
            care about wallets or blockchains, this proof matters because it keeps
            the service honest.
          </CollapsibleContent>
        </Collapsible>
      </section>
    </div>
  );
}
