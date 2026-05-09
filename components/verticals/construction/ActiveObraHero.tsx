"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { ConstructionExpense, ConstructionPayment, ConstructionProject } from "@/types/construction";
import { computeObraMargin, computeObraProgress } from "@/lib/construction/obraMath";
import { formatEUR, formatPercent } from "@/lib/utils/money";
import { ObraStatusBadge } from "./ObraStatusBadge";
import { MarginPill } from "./MarginPill";
import { ProgressBar } from "./ProgressBar";
import { ArrowDownToLineIcon, ArrowRightIcon, MinusIcon, PlusIcon, ReceiptIcon } from "./icons";

interface Props {
  project: ConstructionProject;
  clientName: string;
  expenses: ConstructionExpense[];
  payments: ConstructionPayment[];
  pendingTicketsForObra: number;
}

function MiniMetric({
  label,
  value,
  hint,
  tone = "default",
  trailing
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "primary" | "warning" | "risk" | "healthy";
  trailing?: ReactNode;
}) {
  const valueClass =
    tone === "primary"
      ? "text-obra-700"
      : tone === "warning"
        ? "text-rentable-pending"
        : tone === "risk"
          ? "text-rentable-risk"
          : tone === "healthy"
            ? "text-rentable-healthy"
            : "text-slate-950";
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className={`text-xl font-semibold tabular-nums leading-tight sm:text-2xl ${valueClass}`}>{value}</span>
        {trailing}
      </div>
      {hint ? <p className="mt-1 text-[11px] tabular-nums text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function ActiveObraHero({ project, clientName, expenses, payments, pendingTicketsForObra }: Props) {
  const margin = computeObraMargin(project, expenses);
  const progress = computeObraProgress(project, payments);
  const usageRatio = margin.presupuestoTotal > 0 ? margin.costToDate / margin.presupuestoTotal : 0;
  const usageTone = !margin.hasPresupuesto
    ? "primary"
    : margin.costToDate > margin.presupuestoTotal
      ? "risk"
      : usageRatio > 0.85
        ? "warning"
        : "primary";

  const marginValue = margin.hasPresupuesto ? formatPercent(margin.marginPercentActual) : "—";
  const marginTone =
    !margin.hasPresupuesto
      ? "default"
      : margin.status === "healthy"
        ? "healthy"
        : margin.status === "warning"
          ? "warning"
          : "risk";

  const marginWarn = margin.hasPresupuesto && margin.status !== "healthy";
  const overdueCobros = progress.overdue > 0;

  return (
    <section
      aria-label="Obra activa"
      className="overflow-hidden rounded-3xl border border-obra-200 bg-white shadow-card"
    >
      <div className="border-b border-obra-100 bg-obra-50/60 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-obra-700">Obra activa</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">{project.name}</h2>
            <p className="mt-0.5 truncate text-sm text-slate-600">
              {clientName}
              {project.address ? <span className="text-slate-400"> · {project.address}</span> : null}
            </p>
          </div>
          <ObraStatusBadge status={project.status} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-5 px-5 py-5 sm:grid-cols-4 sm:gap-x-5 sm:px-6 sm:py-6">
        <MiniMetric label="Presupuesto" value={formatEUR(margin.presupuestoTotal)} tone="primary" />
        <MiniMetric
          label="Gastos"
          value={formatEUR(margin.actualCost)}
          hint={margin.estimatedCost > 0 ? `${formatPercent(usageRatio)} usado` : undefined}
        />
        <MiniMetric
          label="Cobrado"
          value={formatEUR(progress.paid)}
          hint={margin.presupuestoTotal > 0 ? `${formatPercent(progress.collectedPercent)} del total` : undefined}
        />
        <MiniMetric
          label="Margen"
          value={marginValue}
          hint={margin.hasPresupuesto ? formatEUR(margin.marginAmountActual) : undefined}
          tone={marginTone}
          trailing={
            margin.hasPresupuesto ? (
              <MarginPill percent={margin.marginPercentActual} status={margin.status} hasPresupuesto />
            ) : null
          }
        />
      </dl>

      <div className="px-5 sm:px-6">
        <ProgressBar value={margin.costToDate} max={margin.presupuestoTotal} tone={usageTone} />
        <p className="mt-2 text-xs text-slate-500">
          {formatEUR(margin.costToDate)} de {formatEUR(margin.presupuestoTotal)} ·{" "}
          <span className="font-medium text-slate-600">Cada gasto cambia tu margen.</span>
        </p>
      </div>

      {(marginWarn || overdueCobros || pendingTicketsForObra > 0) ? (
        <div className="space-y-2 px-5 pt-4 sm:px-6">
          {marginWarn ? (
            <p
              className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
                margin.status === "loss"
                  ? "bg-rentable-riskBg text-rentable-risk"
                  : "bg-rentable-pendingBg text-rentable-pending"
              }`}
            >
              <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden />
              <span>
                <span className="font-semibold">No pierdas margen.</span>{" "}
                {margin.status === "loss"
                  ? `Margen actual ${formatPercent(margin.marginPercentActual)} — la obra está en pérdida con los datos de hoy.`
                  : `Margen actual ${formatPercent(margin.marginPercentActual)} — por debajo del 20% recomendado.`}
              </span>
            </p>
          ) : null}
          {overdueCobros ? (
            <p className="flex items-start gap-2 rounded-xl bg-rentable-riskBg px-3 py-2 text-xs font-medium text-rentable-risk">
              <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden />
              <span>
                <span className="font-semibold">No olvides cobrar.</span> {formatEUR(progress.overdue)} vencidos en esta obra.
              </span>
            </p>
          ) : null}
          {pendingTicketsForObra > 0 ? (
            <p className="flex items-start gap-2 rounded-xl bg-rentable-pendingBg px-3 py-2 text-xs font-medium text-rentable-pending">
              <ReceiptIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                <span className="font-semibold">{pendingTicketsForObra} tickets sugeridos para esta obra</span> esperan revisión.
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3 sm:grid-cols-4 sm:p-4">
        <Link
          href={`/verticals/construction/projects/${project.id}/expenses/new`}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-obra-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-obra-600"
        >
          <MinusIcon className="h-4 w-4" />
          Añadir gasto
        </Link>
        <Link
          href={`/verticals/construction/projects/${project.id}/payments/new`}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-obra-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-obra-600"
        >
          <ArrowDownToLineIcon className="h-4 w-4" />
          Registrar cobro
        </Link>
        <Link
          href={`/verticals/construction/projects/${project.id}/extras/new`}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-obra-200 bg-white px-3 py-2.5 text-sm font-semibold text-obra-700 transition hover:bg-obra-50"
        >
          <PlusIcon className="h-4 w-4" />
          Añadir extra
        </Link>
        <Link
          href={`/verticals/construction/projects/${project.id}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-obra-200 bg-white px-3 py-2.5 text-sm font-semibold text-obra-700 transition hover:bg-obra-50"
        >
          Ver obra
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function NoActiveObraHero() {
  return (
    <section
      aria-label="Sin obra activa"
      className="rounded-3xl border border-dashed border-obra-200 bg-white p-6 text-center shadow-card"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-obra-700">Modo cockpit</p>
      <h2 className="mt-2 text-xl font-bold text-slate-950">Aún no tienes una obra activa</h2>
      <p className="mt-1 text-sm text-slate-500">
        Crea la primera para llevar el control de presupuesto, gastos, cobros y margen desde un único panel.
      </p>
      <Link
        href="/verticals/construction/projects/new"
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-obra-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-obra-600"
      >
        <PlusIcon className="h-4 w-4" />
        Crear primera obra
      </Link>
    </section>
  );
}
