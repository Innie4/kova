import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function OnboardingStep({
  step,
  total,
  eyebrow,
  title,
  description,
  children,
}: {
  step: number;
  total: number;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-4xl rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        <div className="min-w-[180px]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Progress</span>
            <span>
              {step}/{total}
            </span>
          </div>
          <Progress
            value={(step / total) * 100}
            className={cn("mt-3 h-2 bg-slate-100")}
          />
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
