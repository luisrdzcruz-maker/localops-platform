"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  useContactNameById,
  useExpenses,
  useInvoices,
  usePayments,
  useProjects,
  useTickets
} from "@/lib/store/sessionStore";
import {
  buildMonthlyFinancialReport,
  MARGIN_HEALTHY_THRESHOLD,
  MARGIN_WARNING_THRESHOLD
} from "@/lib/construction/obraMath";
import { formatEUR, formatPercent } from "@/lib/utils/money";
import { getCurrentDemoMonth, formatDemoMonthLabel } from "@/lib/utils/dates";
import { MetricTile } from "./MetricTile";
import { ChevronRightIcon } from "./icons";

const DEMO_MONTH = getCurrentDemoMonth();
const DEMO_MONTH_LABEL = formatDemoMonthLabel();

const marginTone = (pct: number) =>
  pct >= MARGIN_HEALTHY_THRESHOLD ? "healthy" : pct >= MARGIN_WARNING_THRESHOLD ? "warning" : "risk";

const marginTextClass: Record<"healthy" | "warning" | "loss", string> = {
  healthy: "text-rentable-healthy",
  warning: "text-rentable-pending",
  loss: "text-rentable-risk"
};

export function ReportsView() {
  const projects = useProjects();
  const expenses = useExpenses();
  const payments = usePayments();
  const tickets = useTickets();
  const invoices = useInvoices();
  const contactNameById = useContactNameById();

  const report = useMemo(
    () => buildMonthlyFinancialReport(DEMO_MONTH, projects, expenses, payments, tickets, invoices, contactNameById),
    [projects, expenses, payments, tickets, invoices, contactNameById]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-obra-600">ObraRentable OS</p>
          <h1 className="mt-1 text-[1.625rem] font-bold leading-tight text-slate-950 sm:text-3xl">Informes</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Resumen mensual para entender tu negocio y preparar la gestoría.
          </p>
        </div>
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-card">
          {DEMO_MONTH_LABEL}
        </div>
      </header>

      {/* Summary metrics */}
      <section aria-label="Resumen del mes">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-slate-600">Resumen del mes</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <MetricTile
            label="Facturado"
            value={formatEUR(report.facturado)}
            hint="Facturas emitidas en mayo"
            tone="primary"
          />
          <MetricTile
            label="Cobrado"
            value={formatEUR(report.cobrado)}
            hint={`de ${formatEUR(report.facturado)} facturado`}
            tone={report.cobrado >= report.facturado && report.facturado > 0 ? "healthy" : "neutral"}
          />
          <MetricTile
            label="Gastos"
            value={formatEUR(report.gastos)}
            hint="Gastos confirmados en mayo"
          />
          <MetricTile
            label="IVA estimado"
            value={formatEUR(report.vat.due)}
            hint="Repercutido − soportado"
            tone={report.vat.due > 0 ? "warning" : "neutral"}
          />
          <MetricTile
            label="Margen bruto"
            value={formatPercent(report.margin.percent)}
            hint={formatEUR(report.margin.amount)}
            tone={marginTone(report.margin.percent)}
          />
          <MetricTile
            label="Pendiente de cobro"
            value={formatEUR(report.pendienteDeCobro.total)}
            hint={`${report.pendienteDeCobro.count} factura${report.pendienteDeCobro.count !== 1 ? "s" : ""} pendiente${report.pendienteDeCobro.count !== 1 ? "s" : ""}`}
            tone={report.pendienteDeCobro.total > 0 ? "warning" : "neutral"}
          />
        </div>
      </section>

      {/* VAT summary */}
      <section
        aria-label="Resumen IVA"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-4"
      >
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Resumen IVA orientativo</h2>
          <p className="mt-0.5 text-xs text-slate-500">Solo facturas y gastos registrados en esta sesión.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">IVA repercutido</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-slate-950">{formatEUR(report.vat.collected)}</p>
            <p className="mt-0.5 text-xs text-slate-400">Facturas cobradas</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">IVA soportado</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-slate-950">{formatEUR(report.vat.paid)}</p>
            <p className="mt-0.5 text-xs text-slate-400">Gastos confirmados</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">IVA a pagar</p>
            <p className={`mt-1 text-xl font-semibold tabular-nums ${report.vat.due > 0 ? "text-rentable-pending" : "text-slate-950"}`}>
              {formatEUR(report.vat.due)}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">Estimado orientativo</p>
          </div>
        </div>
        <p className="border-t border-slate-100 pt-3 text-[11px] text-slate-400">
          Resumen orientativo. Tu gestor debe validar la información fiscal. No sustituye a la presentación oficial de impuestos.
        </p>
      </section>

      {/* Job profitability */}
      <section aria-label="Rentabilidad por obra">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-slate-600">Rentabilidad por obra</h2>
          <Link
            href="/verticals/construction/projects"
            className="inline-flex items-center gap-1 text-xs font-semibold text-obra-700 hover:text-obra-800"
          >
            Ver todas
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
        {report.projectSummaries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">Sin obras activas.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="divide-y divide-slate-100">
              {report.projectSummaries.map(summary => (
                <Link
                  key={summary.projectId}
                  href={`/verticals/construction/projects/${summary.projectId}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{summary.name}</p>
                    <p className="text-xs text-slate-500">
                      {summary.clientName} · {formatEUR(summary.budget)} ppto · {formatEUR(summary.expenses)} gastos
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-semibold tabular-nums ${marginTextClass[summary.marginStatus]}`}>
                      {formatPercent(summary.marginPercent)}
                    </p>
                    <p className="text-xs text-slate-500">{formatEUR(summary.marginAmount)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Admin warnings */}
      {report.warnings.length > 0 && (
        <section aria-label="Avisos para la gestoría">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-slate-600">Avisos</h2>
          <div className="space-y-2">
            {report.warnings.map(warning => (
              <Link
                key={warning.type}
                href={warning.href}
                className={`flex items-center justify-between gap-3 rounded-xl border border-l-4 bg-white p-4 shadow-card transition hover:border-obra-300 ${
                  warning.tone === "risk"
                    ? "border-slate-200 border-l-rentable-risk"
                    : "border-slate-200 border-l-rentable-pending"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{warning.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{warning.description}</p>
                  {warning.amount !== undefined && (
                    <p className={`mt-0.5 text-xs font-semibold tabular-nums ${warning.tone === "risk" ? "text-rentable-risk" : "text-rentable-pending"}`}>
                      {formatEUR(warning.amount)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`text-xl font-semibold tabular-nums ${warning.tone === "risk" ? "text-rentable-risk" : "text-rentable-pending"}`}>
                    {warning.count}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Accountant checklist */}
      <section
        aria-label="Checklist para la gestoría"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
      >
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Checklist para la gestoría</h2>
        <ul className="space-y-3">
          {report.checklist.map(item => (
            <li key={item.id} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                  item.done
                    ? "border-rentable-healthy bg-rentable-healthyBg text-rentable-healthy"
                    : "border-slate-200 bg-white text-slate-300"
                }`}
              >
                {item.done ? "✓" : "○"}
              </span>
              <span className={`text-sm ${item.done ? "text-slate-700" : "text-slate-400"}`}>{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-end">
        <Link
          href="/verticals/construction/export"
          className="inline-flex items-center gap-1 text-xs font-semibold text-obra-700 hover:text-obra-800"
        >
          Preparar para el gestor
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>

      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        Report mock — sin exportación PDF, sin presentación fiscal y sin integración con gestoría. Resumen orientativo únicamente.
      </p>
    </div>
  );
}
