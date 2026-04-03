"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { KovaLogo } from "@/components/kova/logo";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email");
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCooldown((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [cooldown]);

  function handleResend() {
    setCooldown(60);
    toast.success("A fresh magic link is on its way.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(12,130,221,0.14),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-6 py-12">
      <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
        <KovaLogo href="/" />
        <div className="mt-8 flex size-16 items-center justify-center rounded-full bg-sky-100 text-[#0C82DD]">
          <MailCheck className="size-8" />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.22em] text-[#0C82DD]">
          Check your inbox
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Your sign-in link is on the way.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Open the magic link to continue into Kova. If it does not arrive, you can
          resend after the cooldown expires.
        </p>
        {email ? (
          <p className="mt-3 text-sm font-medium text-slate-700">
            Sending to {email}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            className="h-11 rounded-2xl px-5"
            disabled={cooldown > 0}
            onClick={handleResend}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
          </Button>
          <Link
            href="/auth/login"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "h-11 rounded-2xl px-5",
            })}
          >
            Use another email
          </Link>
        </div>
      </div>
    </main>
  );
}
