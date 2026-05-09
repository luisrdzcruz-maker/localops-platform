"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ConstructionProject } from "@/types/construction";
import {
  useContactNameById,
  useExpenses,
  useExtras,
  useInvoices,
  usePayments,
  useProjects,
  useTickets
} from "@/lib/store/sessionStore";
import {
  buildProfitabilityOverview,
  calculateProjectDeviation,
  getLowMarginProjects,
  getOverBudgetProjects,
  overdueInvoicesTotal,
  pendingTicketsCount,
  rankProjectsByMargin,
  type MarginStatus,
  type ProjectProfitabilityRow
} from "@/lib/construction/obraMath";
import { formatEUR, formatPercent } from "@/lib/utils/money";
import { MetricTile } from "./MetricTile";
import { ObraStatusBadge } from "./ObraStatusBadge";
import { ProgressBar } from "./ProgressBar";
import { ChevronRightIcon } from "./icons";

type MarginBadgeKey = "saludable" | "atencion" | "riesgo" | "perdida";

const MARGIN_BADGE: Record<MarginBadgeKey, { label: string; classes: string }> = {
  saludable: { label: "Saludable", classes: "bg-rentable-healthyBg text-rentable-healthy" },
  atencion: { label: "Atención", classes: "bg-rentable-pendingBg text-rentable-pending" },
  riesgo: { label: "Riesgo", classes: "bg-orange-100 text-orange-700" },
  perdida: { label: "Pérdida", classes: "bg-rentable-riskBg text-rentable-risk" }
};

function getMarginBadgeKey(status: MarginStatus, percent: number): MarginBadgeKey {
  if (status === "healthy") return "saludable";
  if (status === "warning") return "atencion";
  return percent < 0 ? "perdida" : "riesgo";
}

const STATUS_PRIORITY: Record<ConstructionProject["status"], number> = {
  active: 0,
  waiting: 1,
  quoted: 2,
  lead: 3,
  completed: 4,
  archived: 5
};

export function ProfitabilityView() {
  const projects = useProjects();
  const expenses = useExpenses();
  const payments = usePayments();
  const invoices = useInvoices();
  const tickets = useTickets();
  const extras = useExtras();
  const contactNameById = useContactNameById();

  const overview = useMemo(
    () => buildProfitabilityOverview(projects, expenses, payments, invoices, tickets, extras, contactNameById),
    [projects, expenses, payments, invoices, tickets, extras, contactNameById]
  );

  const ranked = useMemo(() => rankProjectsByMargin(overview.rows, "asc"), [overview.rows]);
  const lowMargin = useMemo(() => getLowMarginProjects(overview.rows), [overview.rows]);
  const overBudget = useMemo(() => getOverBudgetProjects(overview.rows), [overview.rows]);

  const overdueInv = useMemo(() => overdueInvoicesTotal(invoices), [invoices]);
  const totalPendingTickets = useMemo(() => pendingTicketsCount(tickets), [tickets]);
  const overduePayments = useMemo(() => payments.filter(p => p.status === "overdue"), [payments]);

  const activeRow = useMemo(() => {
    if (overview.rows.length === 0) return null;
    return [...overview.rows].sort(
      (a, b) => (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
    )[0] ?? null;
  }, [overview.rows]);

  const { portfolioMargin, totalEffectiveBudget, totalActualCost, totalInvoiced, totalCollected, riskCount } = overview;

  const portfolioTone =
    portfolioMargin.percent >= 0.2 ? "healthy" : portfolioMargin.percent >= 0.05 ? "warning" : "risk";

  const deviationRows = useMemo(
    () =>
      overview.rows
        .filter(r => r.estimatedCost > 0 || r.actualCost > 0)
        .sort((a, b) => b.costDeviation - a.costDeviation),
    [overview.rows]
  );

  const hasAlerts =
    lowMargin.length > 0 ||
    overBudget.length > 0 ||
    overdueInv.count > 0 ||
    overduePayments.length > 0 ||
    totalPendingTickets > 0;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-obra-600">ObraRentable OS</p>
        <h1 className="text-[1.625rem] font-bold leading-tight text-slate-950 sm:text-3xl">Rentabilidad</h1>
        <p className="text-sm text-slate-500">Mide márgenes, desviaciones y trabajos en riesgo.</p>
      </header>

      {/* Summary metrics */}
      <section aria-label="Métricas de rentabilidad" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricTile
          label="Facturado"
          value={formatEUR(totalInvoiced)}
          hint={`Presup. efectivo ${formatEUR(totalEffectiveBudget)}`}
          tone="primary"
        />
        <MetricTile
          label="Coste real"
          value={formatEUR(totalActualCost)}
          hint={`Cobrado ${formatEUR(totalCollected)}`}
        />
        <MetricTile
          label="Margen estimado"
          value={formatEUR(portfolioMargin.amount)}
          hint="Presupuesto − coste real"
          tone={portfolioTone}
        />
        <MetricTile
          label="Margen %"
          value={formatPercent(portfolioMargin.percent)}
          hint={
            portfolioMargin.percent >= 0.2
              ? "Margen saludable"
              : portfolioMargin.percent >= 0.05
                ? "Revisar trabajos en riesgo"
                : "Margen crítico — revisar urgente"
          }
          tone={portfolioTone}
        />
        <MetricTile
          label="En riesgo"
          value={String(riskCount)}
          hint={riskCount === 0 ? "Todas las obras saludables" : `${riskCount} obra${riskCount !== 1 ? "s" : ""} con margen bajo o pérdida`}
          tone={riskCount === 0 ? "healthy" : riskCount <= 1 ? "warning" : "risk"}
        />
      </section>

      {/* Active job */}
      {activeRow && (
        <section className="space-y-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-slate-600">Obra activa</h2>
          <ActiveJobCard row={activeRow} />
        </section>
      )}

      {/* Risk alerts */}
      {hasAlerts && (
        <section className="space-y-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-slate-600">Alertas de rentabilidad</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {lowMargin.length > 0 && (
              <AlertRow
                tone="warning"
                label="Margen bajo"
                description={`${lowMargin.length} obra${lowMargin.length !== 1 ? "s" : ""} por debajo del 20%`}
                href="/verticals/construction/projects"
              />
            )}
            {overBudget.length > 0 && (
              <AlertRow
                tone="risk"
                label="Exceden el presupuesto"
                description={`${overBudget.length} obra${overBudget.length !== 1 ? "s" : ""} con coste real superior al efectivo`}
                href="/verticals/construction/projects"
              />
            )}
            {overduePayments.length > 0 && (
              <AlertRow
                tone="risk"
                label="Cobros vencidos"
                description={`${formatEUR(overduePayments.reduce((a, p) => a + p.amount, 0))} sin cobrar pasados de fecha`}
                href="/verticals/construction/payments"
              />
            )}
            {overdueInv.count > 0 && (
              <AlertRow
                tone="risk"
                label="Facturas vencidas"
                description={`${formatEUR(overdueInv.total)} en facturas sin cobrar`}
                href="/verticals/construction/invoices"
              />
            )}
            {totalPendingTickets > 0 && (
              <AlertRow
                tone="warning"
                label="Tickets sin revisar"
                description={`${totalPendingTickets} ticket${totalPendingTickets !== 1 ? "s" : ""} pendiente${totalPendingTickets !== 1 ? "s" : ""} de clasificar`}
                href="/verticals/construction/tickets"
              />
            )}
          </div>
        </section>
      )}

      {/* Ranking */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-slate-600">
            Ranking por rentabilidad
          </h2>
          <span className="text-[11px] text-slate-400">{ranked.length} obras · menor margen primero</span>
        </div>
        {ranked.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-700">Sin obras activas.</p>
            <p className="mt-1 text-xs text-slate-500">Crea tu primera obra para ver el ranking de rentabilidad.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ranked.map((row, i) => (
              <RankingRow key={row.projectId} row={row} rank={i + 1} />
            ))}
          </ul>
        )}
      </section>

      {/* Deviation */}
      {deviationRows.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-slate-600">
            Desviación coste estimado vs real
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Obra
                    </th>
                    <th className="hidden px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:table-cell">
                      Est.
                    </th>
                    <th className="hidden px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:table-cell">
                      Real
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Desviación
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deviationRows.map(row => (
                    <DeviationRow key={row.projectId} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Desviación positiva = coste real supera el estimado. Verde = favorable.
          </p>
        </section>
      )}
    </div>
  );
}

function ActiveJobCard({ row }: { row: ProjectProfitabilityRow }) {
  const badge = MARGIN_BADGE[getMarginBadgeKey(row.marginStatus, row.marginPercent)];
  const costRatio = row.effectiveBudget > 0 ? row.actualCost / row.effectiveBudget : 0;
  const progressTone = row.isOverBudget ? "risk" : costRatio > 0.85 ? "warning" : "primary";

  return (
    <Link
      href={`/verticals/construction/projects/${row.projectId}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-obra-300 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-950">{row.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">{row.clientName}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ObraStatusBadge status={row.status} />
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.classes}`}>
            {badge.label}
          </span>
          <ChevronRightIcon className="h-4 w-4 text-slate-400 transition group-hover:text-obra-500" />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Presup. efectivo</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">
            {formatEUR(row.effectiveBudget)}
          </dd>
          {row.approvedExtrasTotal > 0 && (
            <dd className="text-[10px] tabular-nums text-slate-400">+{formatEUR(row.approvedExtrasTotal)} extras</dd>
          )}
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Coste real</dt>
          <dd className={`mt-0.5 text-sm font-semibold tabular-nums ${row.isOverBudget ? "text-rentable-risk" : "text-slate-700"}`}>
            {formatEUR(row.actualCost)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Cobrado</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-700">
            {formatEUR(row.collectedTotal)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Margen</dt>
          <dd className={`mt-0.5 text-sm font-semibold tabular-nums ${
            row.marginStatus === "healthy"
              ? "text-rentable-healthy"
              : row.marginStatus === "warning"
                ? "text-rentable-pending"
                : "text-rentable-risk"
          }`}>
            {formatEUR(row.marginAmount)} · {formatPercent(row.marginPercent)}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <ProgressBar value={row.actualCost} max={row.effectiveBudget} tone={progressTone} />
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          <span>{formatPercent(costRatio)} del presupuesto consumido</span>
          {row.pendingTickets > 0 && (
            <span className="text-rentable-pending">{row.pendingTickets} ticket{row.pendingTickets !== 1 ? "s" : ""} pendiente{row.pendingTickets !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function RankingRow({ row, rank }: { row: ProjectProfitabilityRow; rank: number }) {
  const badge = MARGIN_BADGE[getMarginBadgeKey(row.marginStatus, row.marginPercent)];
  const costRatio = row.effectiveBudget > 0 ? row.actualCost / row.effectiveBudget : 0;
  const progressTone = row.isOverBudget ? "risk" : row.marginStatus === "healthy" ? "primary" : row.marginStatus === "warning" ? "warning" : "risk";
  const hasWarning = row.hasOverduePayment || row.hasOverdueInvoice || row.pendingTickets > 0;

  return (
    <li>
      <Link
        href={`/verticals/construction/projects/${row.projectId}`}
        className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-card transition hover:border-obra-300 sm:p-4"
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
          {rank}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{row.name}</p>
              <p className="text-xs text-slate-500">{row.clientName}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              {hasWarning && (
                <span className="inline-flex items-center rounded-full bg-rentable-pendingBg px-2 py-0.5 text-[10px] font-semibold text-rentable-pending">
                  ⚠ Alertas
                </span>
              )}
              <ObraStatusBadge status={row.status} />
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.classes}`}>
                {badge.label}
              </span>
              <ChevronRightIcon className="h-4 w-4 text-slate-400 transition group-hover:text-obra-500" />
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Presup.</dt>
              <dd className="font-semibold tabular-nums text-slate-950">{formatEUR(row.effectiveBudget)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Coste</dt>
              <dd className={`font-semibold tabular-nums ${row.isOverBudget ? "text-rentable-risk" : "text-slate-700"}`}>
                {formatEUR(row.actualCost)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Margen</dt>
              <dd className={`font-semibold tabular-nums ${
                row.marginStatus === "healthy"
                  ? "text-rentable-healthy"
                  : row.marginStatus === "warning"
                    ? "text-rentable-pending"
                    : "text-rentable-risk"
              }`}>
                {formatPercent(row.marginPercent)}
              </dd>
            </div>
          </dl>

          <ProgressBar value={row.actualCost} max={row.effectiveBudget} tone={progressTone} />
        </div>
      </Link>
    </li>
  );
}

function DeviationRow({ row }: { row: ProjectProfitabilityRow }) {
  const dev = calculateProjectDeviation(row.estimatedCost, row.actualCost);
  const deviationText = dev.favorable
    ? `−${formatEUR(Math.abs(dev.amount))}`
    : `+${formatEUR(dev.amount)}`;

  return (
    <tr className="transition hover:bg-slate-50">
      <td className="px-4 py-3">
        <Link
          href={`/verticals/construction/projects/${row.projectId}`}
          className="font-medium text-slate-950 hover:text-obra-700"
        >
          {row.name}
        </Link>
        <p className="text-[11px] text-slate-400">{row.clientName}</p>
      </td>
      <td className="hidden px-4 py-3 text-right tabular-nums text-slate-600 sm:table-cell">
        {row.estimatedCost > 0 ? formatEUR(row.estimatedCost) : <span className="text-slate-300">—</span>}
      </td>
      <td className="hidden px-4 py-3 text-right tabular-nums text-slate-600 sm:table-cell">
        {row.actualCost > 0 ? formatEUR(row.actualCost) : <span className="text-slate-300">—</span>}
      </td>
      <td className="px-4 py-3 text-right">
        {row.estimatedCost === 0 ? (
          <span className="text-xs text-slate-300">Sin est.</span>
        ) : (
          <div className="flex flex-col items-end">
            <span className={`text-sm font-semibold tabular-nums ${dev.favorable ? "text-rentable-healthy" : "text-rentable-risk"}`}>
              {deviationText}
            </span>
            {dev.percent !== 0 && (
              <span className={`text-[10px] tabular-nums ${dev.favorable ? "text-rentable-healthy" : "text-rentable-risk"}`}>
                {dev.favorable ? "−" : "+"}{formatPercent(Math.abs(dev.percent))} del est.
              </span>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

function AlertRow({
  tone,
  label,
  description,
  href
}: {
  tone: "risk" | "warning";
  label: string;
  description: string;
  href: string;
}) {
  const toneClasses = {
    risk: { bar: "border-l-rentable-risk", text: "text-rentable-risk" },
    warning: { bar: "border-l-rentable-pending", text: "text-rentable-pending" }
  }[tone];

  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-3 rounded-2xl border border-slate-200 border-l-4 ${toneClasses.bar} bg-white p-4 shadow-card transition hover:border-obra-300`}
    >
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${toneClasses.text}`}>{label}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{description}</p>
      </div>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
    </Link>
  );
}
