"use client";

import { useState } from "react";
import Link from "next/link";
import { LockKeyhole, MailCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KovaLogo } from "@/components/kova/logo";
import { onboardingTrustPoints } from "@/lib/demo-data";

export default function LoginPage() {
  const [email, setEmail] = useState("itoro@kova.app");
  const [loading, setLoading] = useState(false);

  async function handleMagicLink() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setLoading(false);
    toast.success("Magic link sent. Check your inbox to continue.");
    window.location.assign(`/auth/verify?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(12,130,221,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(61,196,56,0.12),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:block">
          <KovaLogo href="/" />
          <h1 className="mt-8 max-w-xl text-5xl font-semibold tracking-tight text-slate-950">
            Move money like a modern ops team, not a queue at a storefront.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Kova compares rails, settles on Kite Chain, and keeps a public audit
            trail so families and finance teams can trust every decision.
          </p>
          <div className="mt-8 grid gap-4">
            {onboardingTrustPoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 rounded-[24px] border border-white/70 bg-white/75 px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
              >
                <ShieldCheck className="size-5 text-emerald-500" />
                <span className="text-sm font-medium text-slate-700">{point}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="lg:hidden">
            <KovaLogo href="/" />
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.22em] text-[#0C82DD]">
            Kova Auth
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Send a magic link
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Sign in with the email tied to your operator wallet. We keep auth simple
            and route security stays server-side.
          </p>
          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="magic-link-email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <Input
                id="magic-link-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4"
                placeholder="operator@kova.app"
              />
            </div>
            <Button size="lg" className="h-12 w-full rounded-2xl" onClick={handleMagicLink}>
              {loading ? "Sending link..." : "Send Magic Link"}
              {loading ? <MailCheck className="size-4" /> : <LockKeyhole className="size-4" />}
            </Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Bank-level security</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Sessions stay protected by Supabase auth and middleware.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Powered by Kite Chain</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Every transfer can end in a public attestation you can share.
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Need a preview first?{" "}
            <Link href="/" className="font-semibold text-[#0C82DD]">
              Return to the landing page
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
