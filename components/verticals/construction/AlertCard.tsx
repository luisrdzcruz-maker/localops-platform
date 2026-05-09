import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "./icons";

export type AlertTone = "risk" | "warning" | "neutral";

const toneMap: Record<AlertTone, { icon: string; bar: string; chip: string }> = {
  risk: { icon: "bg-rentable-riskBg text-rentable-risk", bar: "border-l-rentable-risk", chip: "text-rentable-risk" },
  warning: { icon: "bg-rentable-pendingBg text-rentable-pending", bar: "border-l-rentable-pending", chip: "text-rentable-pending" },
  neutral: { icon: "bg-slate-100 text-slate-600", bar: "border-l-slate-300", chip: "text-slate-600" }
};

export function AlertCard({ tone, icon, label, count, description, href, ctaLabel = "Ver" }: { tone: AlertTone; icon: ReactNode; label: string; count: number; description?: string; href: string; ctaLabel?: string }) {
  const cfg = toneMap[tone];
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-3 rounded-2xl border border-slate-200 border-l-4 ${cfg.bar} bg-white p-4 shadow-card transition hover:border-obra-300`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cfg.icon}`}>{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">{label}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{description ?? `${count} elementos`}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xl font-semibold tabular-nums ${cfg.chip}`}>{count}</span>
        <span className="hidden text-xs font-medium text-slate-400 sm:inline">{ctaLabel}</span>
        <ChevronRightIcon className="h-4 w-4 text-slate-400" />
      </div>
    </Link>
  );
}
