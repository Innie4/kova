"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CircleDollarSign,
  CreditCard,
  History,
  LayoutDashboard,
  Menu,
  Presentation,
  ShieldCheck,
  UserCircle2,
  Wallet2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { DashboardSnapshot } from "@/lib/api/app-state";
import { formatCurrency } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { KovaLogo } from "@/components/kova/logo";

const navigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/send",
    label: "Send Money",
    icon: CircleDollarSign,
  },
  {
    href: "/history",
    label: "History",
    icon: History,
  },
  {
    href: "/wallet",
    label: "Wallet",
    icon: Wallet2,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserCircle2,
  },
];

function NavigationList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-2">
      {navigation.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
              active
                ? "bg-white text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.18)]"
                : "text-slate-300 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className={cn("size-4", active ? "text-[#0C82DD]" : "text-slate-400 group-hover:text-white")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
  demoMode,
  user,
}: {
  pathname: string;
  onNavigate?: () => void;
  demoMode?: boolean;
  user: DashboardSnapshot["user"];
}) {
  return (
    <div className="flex h-full flex-col rounded-[28px] bg-[linear-gradient(180deg,#0f274e_0%,#081527_100%)] p-5 text-white shadow-[0_24px_80px_rgba(2,12,27,0.35)]">
      <div className="flex items-center justify-between">
        <KovaLogo href="/dashboard" className="brightness-[1.04]" />
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
          Live agent
        </div>
      </div>

      <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
          Current wallet
        </p>
        <p className="mt-3 text-3xl font-semibold">{formatCurrency(user.balanceUsd)}</p>
        <p className="mt-2 text-sm text-slate-300">
          Passport reputation {user.reputationScore}/100
        </p>
        {demoMode ? (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-emerald-200">
            <Presentation className="size-3.5" />
            Demo mode active
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex-1">
        <p className="mb-3 px-4 text-[11px] uppercase tracking-[0.22em] text-slate-500">
          Workspace
        </p>
        <NavigationList pathname={pathname} onNavigate={onNavigate} />
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-4 text-emerald-300" />
          <span>Attest every route decision on Kite Chain.</span>
        </div>
        <Button
          variant="ghost"
          className="mt-4 w-full justify-start rounded-xl bg-white/5 px-3 py-5 text-slate-200 hover:bg-white/10 hover:text-white"
        >
          <CreditCard className="size-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  demoMode = false,
  user,
}: {
  children: React.ReactNode;
  demoMode?: boolean;
  user: DashboardSnapshot["user"];
}) {
  const pathname = usePathname() ?? "/dashboard";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(12,130,221,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(61,196,56,0.12),transparent_24%),linear-gradient(180deg,#f7f9fc_0%,#eff4fb_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 p-4 lg:grid-cols-[290px_minmax(0,1fr)] lg:p-6">
        <aside className="hidden lg:block">
          <SidebarContent pathname={pathname} demoMode={demoMode} user={user} />
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <header className="flex items-center justify-between rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center gap-3 lg:hidden">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button variant="outline" size="icon-sm" />
                  }
                >
                  <Menu className="size-4" />
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="border-none bg-transparent p-2 shadow-none"
                  showCloseButton={false}
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Kova navigation</SheetTitle>
                  </SheetHeader>
                  <SidebarContent
                    pathname={pathname}
                    demoMode={demoMode}
                    user={user}
                  />
                </SheetContent>
              </Sheet>
              <KovaLogo href="/dashboard" />
            </div>

            <div className="hidden lg:block">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Autonomous remittance agent
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Every transfer gets the best route and a public proof trail.
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 sm:block">
                Balance {formatCurrency(user.balanceUsd)}
              </div>
              <button className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700">
                <Bell className="size-4" />
              </button>
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2">
                <Avatar className="size-9 rounded-full bg-[linear-gradient(135deg,#0C82DD,#3DC438)] p-[1px]">
                  <AvatarFallback className="bg-slate-950 text-sm font-semibold text-white">
                    {user.name
                      .split(" ")
                      .map((value) => value[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-950">{user.name}</p>
                  <p className="text-xs text-slate-500">Kova operator</p>
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
