import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { getProfileSnapshot } from "@/lib/api/app-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createPageMetadata } from "@/lib/metadata";

function formatNotificationPreference(value: string) {
  switch (value) {
    case "SMS":
      return "SMS";
    case "WHATSAPP":
      return "WhatsApp";
    case "BOTH":
      return "Both";
    default:
      return "None";
  }
}

export const metadata: Metadata = createPageMetadata({
  title: "Profile",
  description:
    "Manage operator details, notification preferences, saved recipients, and KYC status in Kova.",
  path: "/profile",
});

export default async function ProfilePage() {
  noStore();
  const snapshot = await getProfileSnapshot();
  const { recipients, user } = snapshot;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-[30px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <CardHeader className="px-6 pt-6">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
            Profile
          </p>
          <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Operator settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Full name</label>
            <Input
              defaultValue={user.name}
              className="rounded-2xl border-slate-200 bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <Input
              defaultValue={user.phone}
              className="rounded-2xl border-slate-200 bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Notification preferences
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {["SMS", "WhatsApp", "Both"].map((option) => (
                <div
                  key={option}
                  className={`rounded-2xl border px-4 py-3 text-center text-sm font-medium ${
                    option ===
                    formatNotificationPreference(
                      String(user.notificationPreference),
                    )
                      ? "border-sky-200 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">KYC status</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-800">
              {user.kycStatus}
            </p>
          </div>
          <Button size="lg" className="h-11 rounded-2xl px-5">
            Save changes
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="rounded-[30px] border border-white/70 bg-white/85 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardHeader className="px-6 pt-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
              Saved recipients
            </p>
            <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Manage payout destinations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-950">{recipient.name}</p>
                  <p className="text-sm text-slate-500">
                    {recipient.country} • {recipient.method.replace("_", " ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-full px-4">
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-full px-4 text-rose-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-rose-200 bg-[linear-gradient(180deg,#fff7f7_0%,#fff1f1_100%)] shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <CardContent className="px-6 py-6">
            <p className="text-sm uppercase tracking-[0.22em] text-rose-500">
              Danger zone
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Delete account
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              This removes the user profile, saved recipients, and KYC records
              from the app experience. On-chain attestations remain public as
              historical proofs.
            </p>
            <Button variant="destructive" className="mt-5 rounded-2xl px-5">
              Delete account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
