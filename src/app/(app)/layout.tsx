import type { Metadata } from "next";
import { AppShell } from "@/components/kova/app-shell";
import { isDemoModeEnabled } from "@/lib/demo-mode";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Workspace",
  description:
    "Operate Kova from the authenticated dashboard, including transfer execution, wallet visibility, and profile controls.",
  path: "/dashboard",
});

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell demoMode={isDemoModeEnabled()}>{children}</AppShell>;
}
