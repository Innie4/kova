export default function DashboardPage() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
        Dashboard
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Protected route foundation is active.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
        This placeholder confirms middleware protection and route structure for the
        upcoming product UI.
      </p>
    </section>
  );
}
