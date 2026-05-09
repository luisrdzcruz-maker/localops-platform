import type { ReactNode } from "react";

export type MetricTileTone = "neutral" | "healthy" | "warning" | "risk" | "primary";

const toneMap: Record<MetricTileTone, string> = {
  neutral: "text-slate-950",
  healthy: "text-rentable-healthy",
  warning: "text-rentable-pending",
  risk: "text-rentable-risk",
  primary: "text-obra-700"
};

export function MetricTile({
  label,
  value,
  hint,
  tone = "neutral",
  trailing
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: MetricTileTone;
  trailing?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        {trailing}
      </div>
      <p className={`mt-2 text-2xl font-semibold tabular-nums leading-tight sm:text-[1.625rem] ${toneMap[tone]}`}>{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
