import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import {
  ArrowRight,
  Copy,
  Presentation,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { TransferStatusBadge } from "@/components/kova/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-styles";
import { getDashboardSnapshot } from "@/lib/api/app-state";
import {
  demoHighlights,
  formatCurrency,
  formatShortDate,
} from "@/lib/demo-data";
import { resolveDemoMode } from "@/lib/demo-mode";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Dashboard",
  description:
    "View your Kova balance, recent transfers, savings summary, and the latest attestation-backed activity.",
  path: "/dashboard",
});

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: {
    demo?: string | string[];
  };
}) {
  noStore();
  const demoMode = resolveDemoMode(searchParams?.demo);
  const snapshot = await getDashboardSnapshot();
  const { recipients, transfers, user } = snapshot;

  return (
    <div className="space-y-6">
      {demoMode ? (
        <section className="rounded-[30px] border border-sky-200 bg-[linear-gradient(135deg,#eff8ff_0%,#e8fff1_100%)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                <Presentation className="size-3.5" />
                Demo Mode
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                The 90-second judge walkthrough is ready.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Kova will guide the seeded transfer from funded wallet to public
                Kite proof with presentation-friendly pacing and the latest
                savings story.
              </p>
            </div>
            <Link
              href="/send?demo=1"
              className={buttonVariants({
                size: "lg",
                className: "h-12 rounded-2xl px-6",
              })}
            >
              Start guided demo
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {demoHighlights.map((highlight) => (
              <div
                key={highlight.label}
                className="rounded-[24px] border border-white/70 bg-white/80 p-4"
              >
                <p className="text-sm text-slate-500">{highlight.label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {highlight.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr_0.8fr]">
        <Card className="rounded-[30px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="px-6 pt-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
              Quick send
            </p>
            <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Start with natural language.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6">
            <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(140deg,#07111f_0%,#102546_48%,#0a1831_100%)] p-5 text-white">
              <p className="text-sm text-slate-300">Intent field</p>
              <p className="mt-3 text-2xl font-semibold">Send $150 to Nigeria</p>
              <p className="mt-2 text-sm text-slate-300">
                Kova parses the instruction, compares live rails, and keeps the
                proof.
              </p>
            </div>
            <Link
              href={demoMode ? "/send?demo=1" : "/send"}
              className={buttonVariants({
                size: "lg",
                className: "h-12 w-full rounded-2xl",
              })}
            >
              Send Money
              <ArrowRight className="size-4" />
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Recent recipients
              </p>
              <div className="mt-3 space-y-3">
                {recipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {recipient.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {recipient.country} • {recipient.phone}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {recipient.method.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="px-6 pt-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
              Transfer feed
            </p>
            <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Last 5 transfers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {transfer.countryCode}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-950">
                      {formatCurrency(transfer.amountUsd)} to{" "}
                      {transfer.recipientName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatShortDate(transfer.timestamp)} • Saved{" "}
                      {formatCurrency(transfer.savedUsd)}
                    </p>
                  </div>
                  <TransferStatusBadge status={transfer.status} />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">{transfer.routeReason}</p>
                  <Link
                    href={`/attestation/${transfer.attestationHash}`}
                    className="text-sm font-semibold text-[#0C82DD] hover:text-sky-700"
                  >
                    View attestation
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[30px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <CardHeader className="px-6 pt-6">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
                Wallet summary
              </p>
              <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {formatCurrency(user.balanceUsd)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <Link
                href="/wallet"
                className={buttonVariants({
                  size: "lg",
                  className: "h-11 w-full rounded-2xl",
                })}
              >
                Add Funds
              </Link>
              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">Total savings</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-800">
                  You&apos;ve saved {formatCurrency(user.totalSavedUsd)}
                </p>
                <p className="mt-2 text-sm text-emerald-700">
                  Across the seeded demo transfers versus traditional remittance
                  services.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Agent Passport</p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {user.passportAddress.slice(0, 8)}...
                      {user.passportAddress.slice(-4)}
                    </p>
                  </div>
                  <button className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900">
                    <Copy className="size-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border border-white/70 bg-[linear-gradient(145deg,#07111f_0%,#102546_44%,#0a1831_100%)] text-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
            <CardContent className="px-6 py-6">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-sky-300" />
                <p className="text-sm uppercase tracking-[0.22em] text-slate-300">
                  Agent trust signal
                </p>
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                Every route decision is explainable.
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Kova keeps the savings math, queried rails, and selected route
                available in a public attestation for judges, operators, and
                recipients.
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm text-emerald-300">
                <ShieldCheck className="size-4" />
                Reputation {user.reputationScore}/100
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
