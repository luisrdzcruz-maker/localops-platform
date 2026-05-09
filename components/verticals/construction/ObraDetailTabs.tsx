"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import type {
  ConstructionExpense,
  ConstructionExpenseCategory,
  ConstructionExpenseSource,
  ConstructionExtra,
  ConstructionExtraStatus,
  ConstructionPayment,
  ConstructionProject,
  IssuedInvoice
} from "@/types/construction";
import {
  approvedExtrasTotalByProject,
  computeObraMargin,
  computeObraProgress,
  expenseTotalsByProject,
  invoiceTotalsByProject
} from "@/lib/construction/obraMath";
import { formatEUR, formatEURPrecise, formatPercent } from "@/lib/utils/money";
import { ProgressBar } from "./ProgressBar";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { ArrowDownToLineIcon, CameraIcon, FileTextIcon, MinusIcon, PlusIcon, ReceiptIcon } from "./icons";

type TabKey = "resumen" | "gastos" | "facturas" | "cobros" | "extras";

const tabs: { key: TabKey; label: string }[] = [
  { key: "resumen", label: "Resumen" },
  { key: "gastos", label: "Gastos" },
  { key: "facturas", label: "Facturas" },
  { key: "cobros", label: "Cobros" },
  { key: "extras", label: "Extras" }
];

const paymentStatusMap: Record<ConstructionPayment["status"], { label: string; classes: string }> = {
  paid: { label: "Cobrado", classes: "bg-rentable-healthyBg text-rentable-healthy" },
  pending: { label: "Pendiente", classes: "bg-rentable-pendingBg text-rentable-pending" },
  overdue: { label: "Vencido", classes: "bg-rentable-riskBg text-rentable-risk" }
};

const categoryLabels: Record<ConstructionExpenseCategory, string> = {
  material: "Material",
  labor: "Mano de obra",
  subcontract: "Subcontrata",
  tool: "Herramienta",
  transport: "Transporte",
  other: "Otro"
};

const extraStatusMap: Record<ConstructionExtraStatus, { label: string; classes: string }> = {
  proposed: { label: "Propuesto", classes: "bg-rentable-pendingBg text-rentable-pending" },
  approved: { label: "Aprobado", classes: "bg-rentable-healthyBg text-rentable-healthy" },
  rejected: { label: "Rechazado", classes: "bg-rentable-riskBg text-rentable-risk" },
  invoiced: { label: "Facturado", classes: "bg-obra-50 text-obra-700" },
  paid: { label: "Cobrado", classes: "bg-rentable-healthyBg text-rentable-healthy" }
};

const expenseStatusMap: Record<ConstructionExpense["status"], { label: string; classes: string }> = {
  confirmed: { label: "Confirmado", classes: "bg-rentable-healthyBg text-rentable-healthy" },
  pending_review: { label: "Por revisar", classes: "bg-rentable-pendingBg text-rentable-pending" },
  rejected: { label: "Rechazado", classes: "bg-rentable-riskBg text-rentable-risk" }
};

const sourceMap: Record<ConstructionExpenseSource, { label: string; icon: ReactNode }> = {
  manual: { label: "Manual", icon: <PlusIcon className="h-3 w-3" /> },
  ticket: { label: "Ticket", icon: <ReceiptIcon className="h-3 w-3" /> },
  voice: { label: "Voz", icon: <CameraIcon className="h-3 w-3" /> }
};

function formatDate(value?: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

export function ObraDetailTabs({
  project,
  payments,
  expenses,
  invoices,
  extras
}: {
  project: ConstructionProject;
  payments: ConstructionPayment[];
  expenses: ConstructionExpense[];
  invoices: IssuedInvoice[];
  extras: ConstructionExtra[];
}) {
  const [active, setActive] = useState<TabKey>("resumen");
  const margin = computeObraMargin(project, expenses);
  const progress = computeObraProgress(project, payments);
  const projectPayments = payments.filter(p => p.projectId === project.id);
  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const projectInvoices = invoices.filter(inv => inv.projectId === project.id);
  const approvedExtrasTotal = approvedExtrasTotalByProject(project.id, extras);

  let content: ReactNode = null;
  if (active === "resumen") content = <ResumenTab margin={margin} approvedExtrasTotal={approvedExtrasTotal} />;
  else if (active === "gastos") content = <GastosTab projectId={project.id} margin={margin} expenses={projectExpenses} />;
  else if (active === "facturas") content = <FacturasTab projectId={project.id} invoices={projectInvoices} />;
  else if (active === "cobros") content = <CobrosTab projectId={project.id} payments={projectPayments} progress={progress} />;
  else content = <ExtrasTab projectId={project.id} extras={extras} />;

  return (
    <section aria-label="Detalle de la obra" className="space-y-4">
      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-card">
        {tabs.map(t => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActive(t.key)}
              className={`flex-1 shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive ? "bg-obra-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{content}</div>
    </section>
  );
}

function ResumenTab({ margin, approvedExtrasTotal }: { margin: ReturnType<typeof computeObraMargin>; approvedExtrasTotal: number }) {
  const effectiveBudget = margin.presupuestoTotal + approvedExtrasTotal;
  const items: { label: string; value: string; hint?: string }[] = [
    { label: "Coste estimado total", value: formatEURPrecise(margin.estimatedCost), hint: `Material ${formatEUR(margin.estimatedMaterialCost)} · Mano de obra ${formatEUR(margin.estimatedLaborCost)}` },
    { label: "Coste real registrado", value: formatEURPrecise(margin.actualCost), hint: `Material ${formatEUR(margin.actualMaterialCost)} · Mano de obra ${formatEUR(margin.actualLaborCost)}` },
    { label: "Margen objetivo (estimado)", value: formatPercent(margin.marginPercentEstimated), hint: `${formatEUR(margin.marginAmountEstimated)} si se cumple el coste estimado` },
    { label: "Margen real proyectado", value: formatPercent(margin.marginPercentActual), hint: `${formatEUR(margin.marginAmountActual)} usando ${margin.costSource === "expenses" ? "gastos registrados" : margin.costSource === "estimate" ? "coste estimado" : "campos del proyecto"}` }
  ];
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <dl className="grid gap-4 sm:grid-cols-2">
          {items.map(item => (
            <div key={item.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</dt>
              <dd className="mt-1 text-base font-semibold tabular-nums text-slate-950">{item.value}</dd>
              {item.hint ? <p className="mt-0.5 text-xs text-slate-500">{item.hint}</p> : null}
            </div>
          ))}
        </dl>
        <div className="mt-4 rounded-xl bg-obra-50/60 p-3 text-xs text-obra-800">
          {margin.costSource === "expenses"
            ? "Margen real recalculado a partir de los gastos registrados."
            : margin.costSource === "estimate"
              ? "Sin gastos registrados todavía. Margen estimado calculado con el coste previsto."
              : "Calculado con los costes manuales del proyecto. Añade gastos para más precisión."}
        </div>
      </div>
      {approvedExtrasTotal > 0 && (
        <div className="rounded-xl border border-rentable-healthyBg bg-rentable-healthyBg/30 px-4 py-3 text-xs text-slate-700">
          <span className="font-semibold">Presupuesto efectivo con extras aprobados:</span>{" "}
          <span className="tabular-nums font-semibold text-rentable-healthy">{formatEUR(effectiveBudget)}</span>
          <span className="ml-1 text-slate-500">(base {formatEUR(margin.presupuestoTotal)} + extras {formatEUR(approvedExtrasTotal)})</span>
        </div>
      )}
    </div>
  );
}

function GastosTab({
  projectId,
  margin,
  expenses
}: {
  projectId: string;
  margin: ReturnType<typeof computeObraMargin>;
  expenses: ConstructionExpense[];
}) {
  const totals = expenseTotalsByProject(projectId, expenses);
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const usageRatio = margin.estimatedCost > 0 ? margin.actualCost / margin.estimatedCost : 0;
  const usageTone = margin.actualCost > margin.estimatedCost ? "risk" : usageRatio > 0.85 ? "warning" : "primary";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">Gastos de la obra</p>
          <p className="text-xs text-slate-500">{totals.count} gastos · {formatEUR(totals.total)} sin IVA</p>
        </div>
        <Link
          href={`/verticals/construction/projects/${projectId}/expenses/new`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-obra-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-obra-600"
        >
          <MinusIcon className="h-3.5 w-3.5" />
          Añadir gasto
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Coste actual / coste estimado</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums text-slate-950">{formatEUR(margin.actualCost)}</span>
          <span className="text-sm text-slate-500 tabular-nums">/ {formatEUR(margin.estimatedCost)}</span>
        </div>
        <div className="mt-3">
          <ProgressBar
            value={margin.actualCost}
            max={Math.max(margin.estimatedCost, margin.actualCost, 1)}
            tone={usageTone}
          />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(Object.keys(categoryLabels) as ConstructionExpenseCategory[]).map(category => (
            <div key={category} className="rounded-xl bg-slate-50 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{categoryLabels[category]}</dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{formatEUR(totals.byCategory[category])}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-slate-500">IVA acumulado: <span className="font-semibold tabular-nums text-slate-700">{formatEURPrecise(totals.vatTotal)}</span></p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-slate-700">Sin gastos registrados.</p>
          <p className="mt-1 text-xs text-slate-500">Usa “Añadir gasto” para registrar el primero.</p>
          <Link
            href={`/verticals/construction/projects/${projectId}/expenses/new`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-obra-300 hover:text-obra-700"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Añadir gasto
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-card">
          {sorted.map(expense => {
            const status = expenseStatusMap[expense.status];
            const source = sourceMap[expense.source];
            return (
              <li key={expense.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-950">{expense.description}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {categoryLabels[expense.category]}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {expense.provider ? <span>{expense.provider} · </span> : null}
                    <span>{formatDate(expense.date)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-slate-950">{formatEUR(expense.amount)}</p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-slate-500">IVA {formatEUR(expense.vatAmount)}</p>
                  <div className="mt-1.5 flex items-center justify-end gap-1.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.classes}`}>{status.label}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {source.icon}
                      {source.label}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CobrosTab({ projectId, payments, progress }: { projectId: string; payments: ConstructionPayment[]; progress: ReturnType<typeof computeObraProgress> }) {
  const sorted = [...payments].sort((a, b) => {
    const ad = a.paidAt ?? a.dueAt ?? a.createdAt;
    const bd = b.paidAt ?? b.dueAt ?? b.createdAt;
    return bd.localeCompare(ad);
  });
  const tone = progress.overdue > 0 ? "risk" : progress.collectedPercent >= 1 ? "healthy" : "primary";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">Cobros de la obra</p>
          <p className="text-xs text-slate-500">{sorted.length} cobros · {formatEUR(progress.paid + progress.pending + progress.overdue)} facturado</p>
        </div>
        <Link
          href={`/verticals/construction/projects/${projectId}/payments/new`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-obra-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-obra-600"
        >
          <ArrowDownToLineIcon className="h-3.5 w-3.5" />
          Registrar cobro
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Cobrado</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">{formatEUR(progress.paid)}</p>
            <p className="mt-0.5 text-xs text-slate-500">de {formatEUR(progress.presupuestoTotal)} presupuestados</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pendiente</p>
            <p className="mt-1 text-base font-semibold tabular-nums text-slate-700">{formatEUR(progress.pending + progress.overdue)}</p>
            {progress.overdue > 0 ? <p className="mt-0.5 text-xs font-semibold text-rentable-risk tabular-nums">Vencido {formatEUR(progress.overdue)}</p> : null}
          </div>
        </div>
        <ProgressBar value={progress.paid} max={progress.presupuestoTotal} tone={tone} className="mt-3" />
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-slate-700">Sin cobros registrados.</p>
          <p className="mt-1 text-xs text-slate-500">Registra el primer cobro cuando recibas el ingreso.</p>
          <Link
            href={`/verticals/construction/projects/${projectId}/payments/new`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-obra-300 hover:text-obra-700"
          >
            <ArrowDownToLineIcon className="h-3.5 w-3.5" />
            Registrar cobro
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-card">
          {sorted.map(p => {
            const cfg = paymentStatusMap[p.status];
            return (
              <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold tabular-nums text-slate-950">{formatEUR(p.amount)}</p>
                    {p.phase ? (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{p.phase}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.status === "paid"
                      ? `Cobrado el ${formatDate(p.paidAt)}`
                      : p.status === "overdue"
                        ? `Vencido el ${formatDate(p.dueAt)}`
                        : `Vence el ${formatDate(p.dueAt)}`}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.classes}`}>{cfg.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ExtrasTab({ projectId, extras }: { projectId: string; extras: ConstructionExtra[] }) {
  const approved = extras.filter(e => e.status === "approved" || e.status === "invoiced" || e.status === "paid");
  const proposed = extras.filter(e => e.status === "proposed");
  const approvedTotal = approved.reduce((acc, e) => acc + e.amount, 0);
  const proposedTotal = proposed.reduce((acc, e) => acc + e.amount, 0);
  const uninvoicedTotal = extras.filter(e => e.status === "approved").reduce((acc, e) => acc + e.amount, 0);

  const sorted = [...extras].sort((a, b) => {
    if (a.status === "rejected" && b.status !== "rejected") return 1;
    if (a.status !== "rejected" && b.status === "rejected") return -1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">Extras de la obra</p>
          <p className="text-xs text-slate-500">
            {extras.filter(e => e.status !== "rejected").length} extras · {formatEUR(approvedTotal)} aprobados
          </p>
        </div>
        <Link
          href={`/verticals/construction/projects/${projectId}/extras/new`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-obra-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-obra-600"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Añadir extra
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <dl className="grid grid-cols-3 gap-3">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Aprobados</dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums text-rentable-healthy">{formatEUR(approvedTotal)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Por aprobar</dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums text-rentable-pending">{formatEUR(proposedTotal)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Sin facturar</dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums text-slate-700">{formatEUR(uninvoicedTotal)}</dd>
          </div>
        </dl>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-slate-700">Sin extras en esta obra.</p>
          <p className="mt-1 text-xs text-slate-500">Añade trabajos extra fuera del presupuesto inicial.</p>
          <Link
            href={`/verticals/construction/projects/${projectId}/extras/new`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-obra-300 hover:text-obra-700"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Añadir extra
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-card">
          {sorted.map(extra => {
            const cfg = extraStatusMap[extra.status];
            return (
              <li key={extra.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-950">{extra.title}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.classes}`}>
                      {cfg.label}
                    </span>
                  </div>
                  {extra.description && (
                    <p className="mt-1 truncate text-xs text-slate-500">{extra.description}</p>
                  )}
                  {extra.notes && (
                    <p className="mt-0.5 truncate text-xs italic text-slate-400">{extra.notes}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-slate-950">{formatEUR(extra.amount)}</p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-slate-500">IVA {formatEUR(extra.vatAmount)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FacturasTab({ projectId, invoices }: { projectId: string; invoices: IssuedInvoice[] }) {
  const totals = invoiceTotalsByProject(projectId, invoices);
  const sorted = [...invoices].sort((a, b) => b.issueDate.localeCompare(a.issueDate));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">Facturas de la obra</p>
          <p className="text-xs text-slate-500">{totals.count} facturas · {formatEUR(totals.totalIssued)} facturado</p>
        </div>
        <Link
          href={`/verticals/construction/projects/${projectId}/invoices/new`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-obra-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-obra-600"
        >
          <FileTextIcon className="h-3.5 w-3.5" />
          Emitir factura
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Facturado</dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums text-slate-950">{formatEUR(totals.totalIssued)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cobrado</dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums text-rentable-healthy">{formatEUR(totals.totalPaid)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pendiente</dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums text-rentable-pending">{formatEUR(totals.totalPending)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Vencido</dt>
            <dd className={`mt-0.5 text-base font-semibold tabular-nums ${totals.totalOverdue > 0 ? "text-rentable-risk" : "text-slate-700"}`}>{formatEUR(totals.totalOverdue)}</dd>
          </div>
        </dl>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-slate-700">Aún no hay facturas para esta obra.</p>
          <p className="mt-1 text-xs text-slate-500">Emite la primera cuando termines una fase o el trabajo completo.</p>
          <Link
            href={`/verticals/construction/projects/${projectId}/invoices/new`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-obra-300 hover:text-obra-700"
          >
            <FileTextIcon className="h-3.5 w-3.5" />
            Emitir factura
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-card">
          {sorted.map(invoice => {
            const pending = Math.max(invoice.total - invoice.paidAmount, 0);
            return (
              <li key={invoice.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-950">{invoice.invoiceNumber}</p>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{invoice.concept}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Emitida {formatDate(invoice.issueDate)} ·{" "}
                    {invoice.status === "overdue" ? (
                      <span className="font-semibold text-rentable-risk">Vencida {formatDate(invoice.dueDate)}</span>
                    ) : invoice.status === "paid" ? (
                      <span>Cobrada</span>
                    ) : (
                      <span>Vence {formatDate(invoice.dueDate)}</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-slate-950">{formatEUR(invoice.total)}</p>
                  {pending > 0 && invoice.status !== "draft" && invoice.status !== "cancelled" ? (
                    <p className="mt-0.5 text-[11px] tabular-nums text-slate-500">{formatEUR(pending)} pendiente</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
