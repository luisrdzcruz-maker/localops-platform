import { formatPercent } from "@/lib/utils/money";
import type { MarginStatus } from "@/lib/construction/obraMath";

const toneMap: Record<MarginStatus, string> = {
  healthy: "bg-rentable-healthyBg text-rentable-healthy",
  warning: "bg-rentable-pendingBg text-rentable-pending",
  loss: "bg-rentable-riskBg text-rentable-risk"
};

export function MarginPill({ percent, status, hasPresupuesto = true }: { percent: number; status: MarginStatus; hasPresupuesto?: boolean }) {
  if (!hasPresupuesto) {
    return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Sin presupuesto</span>;
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${toneMap[status]}`}>{formatPercent(percent)}</span>;
}
