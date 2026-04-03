import { Badge } from "@/components/ui/badge";
import type { AppTransferStatus } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const statusClasses: Record<AppTransferStatus, string> = {
  DRAFT:
    "border-slate-200 bg-slate-100 text-slate-700",
  PREVIEWED:
    "border-amber-200 bg-amber-50 text-amber-700",
  AWAITING_CONFIRMATION:
    "border-orange-200 bg-orange-50 text-orange-700",
  EXECUTING:
    "border-sky-200 bg-sky-50 text-sky-700",
  COMPLETED:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  FAILED:
    "border-rose-200 bg-rose-50 text-rose-700",
};

export function TransferStatusBadge({
  status,
  className,
}: {
  status: AppTransferStatus;
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        statusClasses[status],
        className,
      )}
    >
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
