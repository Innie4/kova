import type { Metadata } from "next";
import { Suspense } from "react";
import { AppSectionLoading } from "@/components/kova/page-loading";
import { SendFlow } from "@/components/kova/send-flow";
import { resolveDemoMode } from "@/lib/demo-mode";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Send Money",
  description:
    "Parse a transfer request, compare rails, confirm high-value payouts, and watch Kova execute the route.",
  path: "/send",
});

export default function SendPage({
  searchParams,
}: {
  searchParams?: {
    demo?: string | string[];
  };
}) {
  const demoMode = resolveDemoMode(searchParams?.demo);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
          Send money
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
          Tell Kova what to send and let the agent do the routing.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          The flow below mirrors the product demo path: parse intent, pick a
          recipient, compare rails, execute, and open the resulting Kite attestation.
        </p>
        {demoMode ? (
          <div className="mt-5 rounded-[24px] border border-sky-200 bg-sky-50 px-5 py-4 text-sm leading-6 text-sky-800">
            Demo mode is guiding the flow with 2-second pauses so judges can watch
            each rail query, route decision, and Kite proof step without rushing.
          </div>
        ) : null}
      </section>
      <Suspense fallback={<AppSectionLoading cards={2} />}>
        <SendFlow demoMode={demoMode} />
      </Suspense>
    </div>
  );
}
