import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KovaLogo } from "@/components/kova/logo";
import { routeMatrix, transferMilestones } from "@/lib/demo-data";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(12,130,221,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(61,196,56,0.14),transparent_20%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-6 py-8 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between rounded-full border border-white/70 bg-white/80 px-5 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <KovaLogo href="/" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="rounded-full px-5" render={<Link href="/auth/login" />}>
              Sign in
            </Button>
            <Button className="rounded-full px-5" render={<Link href="/dashboard" />}>
              Open demo
            </Button>
          </div>
        </header>

        <section className="grid gap-8 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              <Sparkles className="size-3.5" />
              Autonomous remittance agent
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Kova finds the best rail, moves the money, and proves why.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Built for real families and real operators. Type a transfer the way you
              naturally speak, let Kova compare rails in parallel, and share the Kite
              Chain proof trail afterward.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="h-12 rounded-full px-6" render={<Link href="/auth/login" />}>
                Start with magic link
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-6"
                render={<Link href="/attestation/0x4da0b8f714ce5f8d7f39d090be5eefb39f745c3d5cfaafb5878b05f3c0e357ca" />}
              >
                View sample proof
              </Button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {transferMilestones.map((milestone) => (
                <div
                  key={milestone.label}
                  className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                >
                  <p className="text-sm text-slate-500">{milestone.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">
                    {milestone.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-16 hidden h-40 w-40 rounded-full bg-sky-200/40 blur-3xl lg:block" />
            <div className="absolute -bottom-8 right-0 hidden h-40 w-40 rounded-full bg-emerald-200/50 blur-3xl lg:block" />
            <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-[linear-gradient(145deg,#07111f_0%,#11284f_44%,#0a1831_100%)] p-6 text-white shadow-[0_30px_90px_rgba(3,12,31,0.34)]">
              <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                  Agent feed
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    "Intent parsed: Send $150 to Nigeria",
                    "Wise quote received",
                    "Kotani quote received",
                    "Kite native quote received",
                    "Best route selected: Kite USDC",
                  ].map((event, index) => (
                    <div
                      key={event}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100"
                    >
                      <span className="mr-3 font-mono text-xs text-sky-300">
                        0{index + 1}
                      </span>
                      {event}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {routeMatrix.map((route) => (
                  <div
                    key={route.railName}
                    className="grid grid-cols-[1.3fr_0.9fr_0.9fr] items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  >
                    <div className="font-semibold">{route.label}</div>
                    <div className="text-slate-300">${route.feeUsd.toFixed(2)}</div>
                    <div className="text-right text-slate-300">{route.eta}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[28px] border border-emerald-300/20 bg-emerald-400/10 p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-5 text-emerald-300" />
                  <div>
                    <p className="font-semibold text-white">
                      Proof layer included by default
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Every transfer decision is written to Kite Chain as an attestation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
