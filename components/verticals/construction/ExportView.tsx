"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AccountantExportPackage } from "@/lib/construction/obraMath";
import {
  useContactNameById,
  useExpenses,
  useInvoices,
  usePayments,
  useProjects,
  useTickets
} from "@/lib/store/sessionStore";
import {
  buildAccountantExportPackage,
  buildMonthlyFinancialReport,
  MARGIN_HEALTHY_THRESHOLD
} from "@/lib/construction/obraMath";
import { formatEUR, formatPercent } from "@/lib/utils/money";
import { getCurrentDemoMonth, formatDemoMonthLabel } from "@/lib/utils/dates";
import { MetricTile } from "./MetricTile";
import { ChevronRightIcon, ClipboardCopyIcon, MailIcon, PackageIcon } from "./icons";

const DEMO_MONTH = getCurrentDemoMonth();
const DEMO_MONTH_LABEL = formatDemoMonthLabel();

const STATUS_CONFIG = {
  ready: {
    label: "Listo para exportar",
    bg: "bg-rentable-healthyBg",
    text: "text-rentable-healthy",
    borderL: "border-l-rentable-healthy"
  },
  missing_items: {
    label: "Faltan documentos",
    bg: "bg-rentable-riskBg",
    text: "text-rentable-risk",
    borderL: "border-l-rentable-risk"
  },
  review_recommended: {
    label: "Revisión recomendada",
    bg: "bg-rentable-pendingBg",
    text: "text-rentable-pending",
    borderL: "border-l-rentable-pending"
  }
} as const;

function buildSummaryText(pkg: AccountantExportPackage): string {
  const lines = [
    `ObraRentable OS — Resumen ${pkg.monthLabel}`,
    `Estado: ${pkg.statusLabel}`,
    "",
    "RESUMEN FINANCIERO",
    `Facturas emitidas: ${pkg.metrics.invoicesIssued}`,
    `Gastos registrados: ${pkg.metrics.expensesRegistered}`,
    `Tickets pendientes: ${pkg.metrics.ticketsPending}`,
    `Cobros pendientes: ${pkg.metrics.paymentsPending}`,
    `IVA estimado: ${formatEUR(pkg.metrics.vatEstimated)}`,
    `Margen estimado: ${formatPercent(pkg.metrics.marginEstimated)}`,
    "",
    "DOCUMENTOS INCLUIDOS",
    ...pkg.documents.map(d => `${d.included ? "✓" : "○"} ${d.label}: ${d.count}`)
  ];
  if (pkg.warnings.length > 0) {
    lines.push("", "AVISOS");
    lines.push(...pkg.warnings.map(w => `⚠ ${w.label}: ${w.description}`));
  }
  lines.push(
    "",
    "Resumen orientativo. Tu gestor debe validar la información fiscal.",
    "Generado con ObraRentable OS."
  );
  return lines.join("\n");
}

export function ExportView() {
  const projects = useProjects();
  const expenses = useExpenses();
  const payments = usePayments();
  const tickets = useTickets();
  const invoices = useInvoices();
  const contactNameById = useContactNameById();
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () => buildMonthlyFinancialReport(DEMO_MONTH, projects, expenses, payments, tickets, invoices, contactNameById),
    [projects, expenses, payments, tickets, invoices, contactNameById]
  );

  const pkg = useMemo(
    () => buildAccountantExportPackage(report, DEMO_MONTH_LABEL, expenses, payments, tickets, invoices),
    [report, expenses, payments, tickets, invoices]
  );

  const statusCfg = STATUS_CONFIG[pkg.status];

  async function handleCopySummary() {
    const text = buildSummaryText(pkg);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard unavailable in this context
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-obra-600">ObraRentable OS</p>
        <h1 className="mt-1 text-[1.625rem] font-bold leading-tight text-slate-950 sm:text-3xl">Gestor</h1>
        <p className="mt-1.5 text-sm text-slate-500">Prepara el mes para tu gestoría en minutos.</p>
      </header>

      {/* Month + readiness card */}
      <section
        aria-label="Estado de exportación"
        className={`rounded-2xl border border-l-4 bg-white p-5 shadow-card ${statusCfg.borderL} border-slate-200`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Mes de referencia</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{DEMO_MONTH_LABEL}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
            {statusCfg.label}
          </span>
        </div>
        {pkg.missingItems.length > 0 && (
          <ul className="mt-4 space-y-1">
            {pkg.missingItems.slice(0, 3).map((item, i) => (
              <li key={i} className="text-xs text-slate-500">· {item}</li>
            ))}
            {pkg.missingItems.length > 3 && (
              <li className="text-xs text-slate-400">+{pkg.missingItems.length - 3} más</li>
            )}
          </ul>
        )}
      </section>

      {/* Summary metrics */}
      <section aria-label="Métricas del mes">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-slate-600">Resumen del mes</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <MetricTile
            label="Facturas emitidas"
            value={String(pkg.metrics.invoicesIssued)}
            hint="No borrador ni anuladas"
            tone="primary"
          />
          <MetricTile
            label="Gastos registrados"
            value={String(pkg.metrics.expensesRegistered)}
            hint="Confirmados"
          />
          <MetricTile
            label="Tickets pendientes"
            value={String(pkg.metrics.ticketsPending)}
            hint="Sin clasificar"
            tone={pkg.metrics.ticketsPending > 0 ? "warning" : "neutral"}
          />
          <MetricTile
            label="Cobros pendientes"
            value={String(pkg.metrics.paymentsPending)}
            hint="Pendientes o vencidos"
            tone={pkg.metrics.paymentsPending > 0 ? "warning" : "neutral"}
          />
          <MetricTile
            label="IVA estimado"
            value={formatEUR(pkg.metrics.vatEstimated)}
            hint="Orientativo para el gestor"
            tone={pkg.metrics.vatEstimated > 0 ? "warning" : "neutral"}
          />
          <MetricTile
            label="Margen estimado"
            value={formatPercent(pkg.metrics.marginEstimated)}
            hint="Sobre facturado mensual"
            tone={
              pkg.metrics.marginEstimated >= MARGIN_HEALTHY_THRESHOLD
                ? "healthy"
                : pkg.metrics.marginEstimated >= 0.05
                  ? "warning"
                  : "risk"
            }
          />
        </div>
      </section>

      {/* Export checklist */}
      <section
        aria-label="Checklist de exportación"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
      >
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Checklist de exportación</h2>
        <ul className="space-y-3">
          {pkg.checklist.map(item => (
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

      {/* Warnings before export */}
      {pkg.warnings.length > 0 && (
        <section aria-label="Avisos antes de exportar">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-slate-600">
            Avisos antes de exportar
          </h2>
          <div className="space-y-2">
            {pkg.warnings.map(warning => (
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
                    <p
                      className={`mt-0.5 text-xs font-semibold tabular-nums ${warning.tone === "risk" ? "text-rentable-risk" : "text-rentable-pending"}`}
                    >
                      {formatEUR(warning.amount)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`text-xl font-semibold tabular-nums ${warning.tone === "risk" ? "text-rentable-risk" : "text-rentable-pending"}`}
                  >
                    {warning.count}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Documents included */}
      <section
        aria-label="Documentos incluidos"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
      >
        <h2 className="mb-1 text-sm font-semibold text-slate-900">Documentos incluidos</h2>
        <p className="mb-4 text-xs text-slate-400">Lo que se incluiría en el paquete para el gestor.</p>
        <ul className="divide-y divide-slate-100">
          {pkg.documents.map(doc => (
            <li key={doc.id} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <span className={`text-[11px] font-bold ${doc.included ? "text-rentable-healthy" : "text-slate-300"}`}>
                  {doc.included ? "✓" : "○"}
                </span>
                <span className={`text-sm ${doc.included ? "text-slate-700" : "text-slate-400"}`}>{doc.label}</span>
              </div>
              <span className="tabular-nums text-sm font-semibold text-slate-500">{doc.count}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTAs */}
      <section aria-label="Exportar">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-slate-600">Exportar</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400"
          >
            <PackageIcon className="h-4 w-4" />
            Exportar ZIP
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400"
          >
            <MailIcon className="h-4 w-4" />
            Enviar por email
          </button>
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-obra-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-obra-600 active:scale-95"
          >
            <ClipboardCopyIcon className="h-4 w-4" />
            {copied ? "¡Copiado!" : "Copiar resumen"}
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Exportación simulada en el MVP. No se genera un ZIP real todavía. Tu gestor debe validar la información fiscal.
        </p>
      </section>

      {/* Link to reports */}
      <div className="flex justify-end">
        <Link
          href="/verticals/construction/reports"
          className="inline-flex items-center gap-1 text-xs font-semibold text-obra-700 hover:text-obra-800"
        >
          Ver report mensual completo
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>

      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        Gestor mock — sin exportación ZIP real, sin envío de email y sin integración con gestoría. Resumen orientativo únicamente.
      </p>
    </div>
  );
}
