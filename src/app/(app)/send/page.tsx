import { SendFlow } from "@/components/kova/send-flow";

export default function SendPage() {
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
      </section>
      <SendFlow />
    </div>
  );
}
