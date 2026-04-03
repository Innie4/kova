import type { Metadata } from "next";
import { AppShell } from "@/components/kova/app-shell";
import { getDashboardSnapshot } from "@/lib/api/app-state";
import { isDemoModeEnabled } from "@/lib/demo-mode";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Workspace",
  description:
    "Operate Kova from the authenticated dashboard, including transfer execution, wallet visibility, and profile controls.",
  path: "/dashboard",
});

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const snapshot = await getDashboardSnapshot();

  return (
    <AppShell demoMode={isDemoModeEnabled()} user={snapshot.user}>
      {children}
    </AppShell>
  );
}
