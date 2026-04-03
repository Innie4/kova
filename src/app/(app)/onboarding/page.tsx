import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Onboarding",
  description:
    "Complete the three-step Kova onboarding flow for profile setup, KYC, and wallet funding.",
  path: "/onboarding",
});

export default function OnboardingPage() {
  redirect("/onboarding/profile");
}
