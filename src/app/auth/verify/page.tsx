export default function VerifyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
          Verification
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Email verification route is live.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          This route is reserved for the full magic-link confirmation experience in
          the UI phase.
        </p>
      </div>
    </main>
  );
}
