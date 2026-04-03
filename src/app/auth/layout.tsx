import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Authentication",
  description:
    "Access Kova with a magic-link sign-in flow designed for remittance operators and demo reviewers.",
  path: "/auth/login",
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
