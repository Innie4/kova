import { TransferStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusClasses: Record<TransferStatus, string> = {
  [TransferStatus.DRAFT]:
    "border-slate-200 bg-slate-100 text-slate-700",
  [TransferStatus.PREVIEWED]:
    "border-amber-200 bg-amber-50 text-amber-700",
  [TransferStatus.AWAITING_CONFIRMATION]:
    "border-orange-200 bg-orange-50 text-orange-700",
  [TransferStatus.EXECUTING]:
    "border-sky-200 bg-sky-50 text-sky-700",
  [TransferStatus.COMPLETED]:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  [TransferStatus.FAILED]:
    "border-rose-200 bg-rose-50 text-rose-700",
};

export function TransferStatusBadge({
  status,
  className,
}: {
  status: TransferStatus;
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
