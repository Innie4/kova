import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function KovaLogo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/brand/kova-logo.png"
        alt="Kova"
        width={112}
        height={40}
        priority
      />
      <span className="hidden text-sm font-medium tracking-[0.24em] text-slate-400 lg:inline">
        Kova
      </span>
    </span>
  );

  if (!href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}
