import { ArrowDownLeft, ArrowUpRight, QrCode, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoUser, formatCurrency, formatShortDate, walletActivity } from "@/lib/demo-data";

export default function WalletPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <Card className="rounded-[30px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="px-6 pt-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
              USDC balance
            </p>
            <CardTitle className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
              {formatCurrency(demoUser.balanceUsd)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(145deg,#07111f_0%,#11284f_44%,#0a1831_100%)] p-5 text-white">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-300">
                Deposit address
              </p>
              <p className="mt-3 font-semibold">{demoUser.passportAddress}</p>
              <div className="mt-5 flex h-40 items-center justify-center rounded-[24px] border border-dashed border-white/15 bg-white/5">
                <div className="text-center">
                  <QrCode className="mx-auto size-10 text-sky-300" />
                  <p className="mt-3 text-sm text-slate-300">
                    QR placeholder for Kite deposit
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="px-6 pt-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
              Agent Passport
            </p>
            <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Reputation and throughput
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Address</p>
              <p className="mt-2 font-semibold text-slate-950">
                {demoUser.passportAddress.slice(0, 8)}...
                {demoUser.passportAddress.slice(-4)}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Reputation score</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {demoUser.reputationScore}/100
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total transfers</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {demoUser.totalTransfers}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total fees saved</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600">
                {formatCurrency(demoUser.totalSavedUsd)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[30px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <CardHeader className="px-6 pt-6">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
            Wallet activity
          </p>
          <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            All USDC in and out
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-6 pb-6">
          {walletActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-full bg-white">
                  {activity.direction === "in" ? (
                    <ArrowDownLeft className="size-5 text-emerald-500" />
                  ) : (
                    <ArrowUpRight className="size-5 text-[#0C82DD]" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{activity.label}</p>
                  <p className="text-sm text-slate-500">
                    {formatShortDate(activity.timestamp)}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-slate-950">
                {activity.direction === "in" ? "+" : "-"}
                {formatCurrency(activity.amountUsd)}
              </p>
            </div>
          ))}
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-4" />
              Every completed transfer updates the wallet summary and can be linked back to a Kite attestation.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
