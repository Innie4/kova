import Image from "next/image";

const phases = [
  {
    title: "Phase 0",
    description: "Bootstrap, planning docs, branding, and the initial build scaffold.",
    status: "In progress",
  },
  {
    title: "Phase 1",
    description: "Prisma, Supabase auth, and the tRPC foundation for protected workflows.",
    status: "Queued",
  },
  {
    title: "Phase 2",
    description: "Kite AA, x402 charging, attestations, and gasless transfer plumbing.",
    status: "Queued",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(12,130,221,0.18),_transparent_38%),linear-gradient(180deg,_#f7fbff_0%,_#eef6ff_100%)] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex items-center justify-between rounded-full border border-white/60 bg-white/70 px-5 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/kova-logo.png"
              alt="Kova logo"
              width={118}
              height={42}
              priority
            />
            <span className="hidden text-sm text-slate-500 sm:inline">
              Autonomous remittance agent on Kite Chain
            </span>
          </div>
          <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">
            Bootstrap mode
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="mb-5 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Kova build in progress
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Borderless transfers, agent-first routing, and proof on Kite Chain.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              This repository is being built from the PRD as a production-minded MVP for
              autonomous remittance. The product name is <strong>Kova</strong>, and the
              original RemitAgent specification is being implemented under this brand.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-full bg-[#0C82DD] px-5 py-3 text-white">
                PLAN.md ready
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-700">
                PROGRESS.md ready
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">North star</p>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-4xl font-semibold">$59B</p>
                <p className="mt-1 text-sm text-slate-300">
                  Annual remittance fees the product is designed to reduce.
                </p>
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <p className="text-4xl font-semibold">&lt; 8s</p>
                <p className="mt-1 text-sm text-slate-300">
                  Target decision window for parallel rail discovery and scoring.
                </p>
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <p className="text-4xl font-semibold">3+</p>
                <p className="mt-1 text-sm text-slate-300">
                  Live rails queried in parallel per transfer, with on-chain evidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {phases.map((phase) => (
            <article
              key={phase.title}
              className="rounded-[1.5rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-950">{phase.title}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {phase.status}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{phase.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
                Phase 0 deliverables
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>Project scaffolded with Next.js 14, pnpm, Tailwind, and shadcn/ui.</li>
                <li>Planning docs map the data model, API surface, and phased execution.</li>
                <li>Kova branding is established early so later UI work lands on the right rails.</li>
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">Reference blend</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Mercury-style dashboard structure, Linear-like execution detail, Ramp-level
                savings hierarchy, and Stripe/Wise trust cues will guide the full UI build.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
