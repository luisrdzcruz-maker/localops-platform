"use client";

import Link from "next/link";
import {
  useContact,
  useExpensesByProject,
  useExtrasByProject,
  useInvoicesByProject,
  usePaymentsByProject,
  useProject
} from "@/lib/store/sessionStore";
import { computeObraMargin, computeObraProgress } from "@/lib/construction/obraMath";
import { formatEUR, formatPercent } from "@/lib/utils/money";
import { ObraDetailHeader } from "./ObraDetailHeader";
import { ObraDetailTabs } from "./ObraDetailTabs";
import { MetricTile } from "./MetricTile";
import { MarginPill } from "./MarginPill";
import { ProgressBar } from "./ProgressBar";

export function ObraDetailClient({ projectId }: { projectId: string }) {
  const project = useProject(projectId);
  const expenses = useExpensesByProject(projectId);
  const payments = usePaymentsByProject(projectId);
  const invoices = useInvoicesByProject(projectId);
  const extras = useExtrasByProject(projectId);
  const contact = useContact(project?.contactId);

  if (!project) {
    return (
      <div className="space-y-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-obra-600">ObraRentable OS</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Obra no encontrada</h1>
          <p className="mt-1 text-sm text-slate-500">Esta obra no existe en la sesión actual.</p>
        </header>
        <Link
          href="/verticals/construction/projects"
          className="inline-flex items-center gap-1.5 rounded-xl bg-obra-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-obra-600"
        >
          Volver a obras
        </Link>
      </div>
    );
  }

  const margin = computeObraMargin(project, expenses);
  const progress = computeObraProgress(project, payments);
  const pendingCost = Math.max(margin.estimatedCost - margin.actualCost, 0);
  const usageRatio = margin.presupuestoTotal > 0 ? margin.costToDate / margin.presupuestoTotal : 0;
  const usageTone = !margin.hasPresupuesto
    ? "primary"
    : margin.costToDate > margin.presupuestoTotal
      ? "risk"
      : usageRatio > 0.85
        ? "warning"
        : "primary";

  return (
    <div className="space-y-5">
      <ObraDetailHeader project={project} clientName={contact?.name ?? "Sin cliente"} />

      <section aria-label="Resumen financiero" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricTile
          label="Presupuesto"
          value={formatEUR(margin.presupuestoTotal)}
          hint={project.presupuestoVatRate ? `IVA ${formatPercent(project.presupuestoVatRate)}` : undefined}
          tone="primary"
        />
        <MetricTile label="Gasto actual" value={formatEUR(margin.actualCost)} hint={`de ${formatEUR(margin.estimatedCost)} estimado`} />
        <MetricTile label="Coste pendiente" value={formatEUR(pendingCost)} hint="Estimado − ya gastado" />
        <MetricTile
          label="Margen estimado"
          value={formatPercent(margin.marginPercentActual)}
          hint={formatEUR(margin.marginAmountActual)}
          tone={margin.status === "healthy" ? "healthy" : margin.status === "warning" ? "warning" : "risk"}
          trailing={<MarginPill percent={margin.marginPercentActual} status={margin.status} hasPresupuesto={margin.hasPresupuesto} />}
        />
        <MetricTile
          label="Pendiente de cobro"
          value={formatEUR(progress.pending + progress.overdue)}
          hint={progress.overdue > 0 ? `Vencido ${formatEUR(progress.overdue)}` : `Cobrado ${formatEUR(progress.paid)}`}
          tone={progress.overdue > 0 ? "risk" : "neutral"}
        />
      </section>

      <section aria-label="Uso del presupuesto" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-slate-700">Uso del presupuesto</p>
          <p className="text-xs font-medium tabular-nums text-slate-500">
            {formatEUR(margin.costToDate)} / {formatEUR(margin.presupuestoTotal)} ({formatPercent(usageRatio)})
          </p>
        </div>
        <ProgressBar value={margin.costToDate} max={margin.presupuestoTotal} tone={usageTone} className="mt-3" />
        <p className="mt-2 text-xs text-slate-500">
          {margin.costSource === "expenses"
            ? "Calculado con gastos registrados."
            : margin.costSource === "estimate"
              ? "Calculado con coste estimado mientras no haya gastos reales."
              : "Calculado con costes manuales del proyecto."}
        </p>
      </section>

      <ObraDetailTabs project={project} payments={payments} expenses={expenses} invoices={invoices} extras={extras} />
    </div>
  );
}
