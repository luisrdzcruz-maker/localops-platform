import Link from "next/link";
import type { ConstructionExpense, ConstructionPayment, ConstructionProject } from "@/types/construction";
import { computeObraMargin, computeObraProgress } from "@/lib/construction/obraMath";
import { formatEUR } from "@/lib/utils/money";
import { ObraStatusBadge } from "./ObraStatusBadge";
import { MarginPill } from "./MarginPill";
import { ProgressBar } from "./ProgressBar";
import { ChevronRightIcon } from "./icons";

export function ObraCard({
  project,
  clientName,
  payments,
  expenses
}: {
  project: ConstructionProject;
  clientName: string;
  payments: ConstructionPayment[];
  expenses?: ConstructionExpense[];
}) {
  const margin = computeObraMargin(project, expenses);
  const progress = computeObraProgress(project, payments);
  const usageTone = !margin.hasPresupuesto
    ? "primary"
    : margin.costToDate > margin.presupuestoTotal
      ? "risk"
      : margin.costToDate / margin.presupuestoTotal > 0.85
        ? "warning"
        : "primary";

  return (
    <Link
      href={`/verticals/construction/projects/${project.id}`}
      className={`group block rounded-2xl border bg-white p-4 shadow-card transition hover:border-obra-300 hover:shadow-md ${project.status === "active" ? "border-l-4 border-slate-200 border-l-obra-400" : "border-slate-200"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-950">{project.name}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{clientName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ObraStatusBadge status={project.status} />
          <ChevronRightIcon className="h-4 w-4 text-slate-400 transition group-hover:text-obra-500" />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Presupuesto</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">{formatEUR(margin.presupuestoTotal)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Gasto actual</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-700">{formatEUR(margin.actualCost)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Cobrado</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-700">{formatEUR(progress.paid)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-3">
        <ProgressBar value={margin.costToDate} max={margin.presupuestoTotal} tone={usageTone} className="flex-1" />
        <MarginPill percent={margin.marginPercentActual} status={margin.status} hasPresupuesto={margin.hasPresupuesto} />
      </div>
    </Link>
  );
}
