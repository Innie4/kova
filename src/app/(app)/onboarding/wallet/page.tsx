import type { Metadata } from "next";
import Link from "next/link";
import { QrCode, Wallet2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-styles";
import { OnboardingStep } from "@/components/kova/onboarding-step";
import { demoUser, formatCurrency } from "@/lib/demo-data";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Onboarding Wallet",
  description:
    "Review your generated Kite passport wallet, funding address, and the final onboarding step in Kova.",
  path: "/onboarding/wallet",
});

export default function OnboardingWalletPage() {
  return (
    <OnboardingStep
      step={3}
      total={3}
      eyebrow="Onboarding"
      title="Your Kite wallet is ready"
      description="Fund the generated passport wallet with USDC and return here to continue into the product dashboard."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(145deg,#07111f_0%,#11284f_44%,#0a1831_100%)] p-6 text-white">
          <div className="flex items-center gap-3">
            <Wallet2 className="size-5 text-sky-300" />
            <p className="text-sm uppercase tracking-[0.22em] text-slate-300">
              Agent Passport
            </p>
          </div>
          <p className="mt-4 text-lg font-semibold">{demoUser.passportAddress}</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            This passport wallet will fund native Kite transfers, x402 rail queries,
            and attestation publishing.
          </p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
            Fund your wallet
          </p>
          <div className="mt-5 flex h-44 items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white">
            <div className="text-center">
              <QrCode className="mx-auto size-10 text-[#0C82DD]" />
              <p className="mt-3 text-sm text-slate-500">
                QR placeholder for the deposit address
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm text-slate-600">
            Demo wallet balance after funding: {formatCurrency(1000)}
          </p>
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        <Link
          href="/onboarding/kyc"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "h-11 rounded-2xl px-5",
          })}
        >
          Back
        </Link>
        <Link
          href="/dashboard"
          className={buttonVariants({
            size: "lg",
            className: "h-11 rounded-2xl px-5",
          })}
        >
          I&apos;ve funded my wallet
        </Link>
      </div>
    </OnboardingStep>
  );
}
