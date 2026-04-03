import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-styles";
import { OnboardingStep } from "@/components/kova/onboarding-step";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Onboarding KYC",
  description:
    "Upload identity documents for the Kova onboarding flow and prepare the account for verified transfers.",
  path: "/onboarding/kyc",
});

export default function OnboardingKycPage() {
  return (
    <OnboardingStep
      step={2}
      total={3}
      eyebrow="Onboarding"
      title="Upload your KYC documents"
      description="For the MVP demo, uploaded documents are auto-approved, but the interface still reflects the full trust flow."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {["Passport", "National ID", "Driver's License"].map((type) => (
          <div
            key={type}
            className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm font-medium text-slate-700"
          >
            {type}
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {["Front of ID", "Back of ID"].map((label) => (
          <div
            key={label}
            className="flex min-h-[180px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500"
          >
            Upload {label}
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
        <div className="flex items-center gap-3">
          <LockKeyhole className="size-4" />
          Your data is encrypted and never sold.
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        <Link
          href="/onboarding/profile"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "h-11 rounded-2xl px-5",
          })}
        >
          Back
        </Link>
        <Link
          href="/onboarding/wallet"
          className={buttonVariants({
            size: "lg",
            className: "h-11 rounded-2xl px-5",
          })}
        >
          Continue to wallet
        </Link>
      </div>
    </OnboardingStep>
  );
}
