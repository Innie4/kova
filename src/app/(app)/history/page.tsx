import { HistoryTable } from "@/components/kova/history-table";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
          Transfer history
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
          Every route comparison stays reviewable.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Filter by lifecycle state, inspect the rails queried for each transfer,
          and export the current view for operations or demo use.
        </p>
      </section>
      <HistoryTable />
    </div>
  );
}
