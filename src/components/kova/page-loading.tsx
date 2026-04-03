import { Skeleton } from "@/components/ui/skeleton";

export function MarketingPageLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(12,130,221,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(61,196,56,0.14),transparent_20%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-6 py-8 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl space-y-8">
        <Skeleton className="h-16 rounded-full" />
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Skeleton className="h-10 w-48 rounded-full" />
            <Skeleton className="h-20 w-full max-w-4xl rounded-[32px]" />
            <Skeleton className="h-24 w-full max-w-2xl rounded-[32px]" />
            <div className="grid gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-[28px]" />
              ))}
            </div>
          </div>
          <Skeleton className="min-h-[520px] rounded-[36px]" />
        </div>
      </div>
    </main>
  );
}

export function DashboardPageLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr_0.8fr]">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        >
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="mt-4 h-10 w-3/4 rounded-2xl" />
          <div className="mt-6 space-y-4">
            {[...Array(3)].map((__, rowIndex) => (
              <Skeleton key={rowIndex} className="h-24 rounded-[24px]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AppSectionLoading({
  cards = 3,
}: {
  cards?: number;
}) {
  return (
    <div className="space-y-4">
      {[...Array(cards)].map((_, index) => (
        <div
          key={index}
          className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        >
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="mt-4 h-10 w-2/3 rounded-2xl" />
          <Skeleton className="mt-6 h-28 rounded-[24px]" />
        </div>
      ))}
    </div>
  );
}

export function AuthPageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(12,130,221,0.14),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-6 py-12">
      <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
        <Skeleton className="h-12 w-36 rounded-2xl" />
        <Skeleton className="mt-8 h-14 w-14 rounded-full" />
        <Skeleton className="mt-6 h-10 w-3/4 rounded-2xl" />
        <Skeleton className="mt-4 h-20 rounded-[24px]" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}

export function AttestationPageLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(12,130,221,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(61,196,56,0.14),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-6 py-8 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-32 rounded-[32px]" />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-[420px] rounded-[32px]" />
          <Skeleton className="h-[420px] rounded-[32px]" />
        </div>
      </div>
    </main>
  );
}
