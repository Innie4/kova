export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f7fbff_0%,_#eef6ff_100%)] px-6 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0C82DD]">
          Kova Auth
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Sign in foundation is ready.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Supabase auth plumbing and route protection are now in place. The full
          magic-link UI lands in the dedicated frontend phase.
        </p>
      </div>
    </main>
  );
}
