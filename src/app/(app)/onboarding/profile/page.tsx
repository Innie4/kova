import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-styles";
import { Input } from "@/components/ui/input";
import { OnboardingStep } from "@/components/kova/onboarding-step";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Onboarding Profile",
  description:
    "Capture your basic operator profile details before KYC and wallet activation in Kova.",
  path: "/onboarding/profile",
});

export default function OnboardingProfilePage() {
  return (
    <OnboardingStep
      step={1}
      total={3}
      eyebrow="Onboarding"
      title="Set up your operator profile"
      description="Add the basic details Kova needs before your first transfer. This is the quick profile capture before KYC and wallet funding."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <Input defaultValue="Itoro A." className="h-12 rounded-2xl border-slate-200 bg-slate-50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Phone number</label>
          <Input defaultValue="+234 801 234 5678" className="h-12 rounded-2xl border-slate-200 bg-slate-50" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Country of residence</label>
          <Input defaultValue="Nigeria" className="h-12 rounded-2xl border-slate-200 bg-slate-50" />
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        <Link
          href="/onboarding/kyc"
          className={buttonVariants({
            size: "lg",
            className: "h-11 rounded-2xl px-5",
          })}
        >
          Continue to KYC
        </Link>
      </div>
    </OnboardingStep>
  );
}
