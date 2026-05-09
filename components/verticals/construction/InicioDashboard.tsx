"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ConstructionProject } from "@/types/construction";
import { demoOrganization } from "@/lib/mock/core";
import {
  useContactNameById,
  useExpenses,
  useInvoices,
  usePayments,
  useProjects,
  useTickets
} from "@/lib/store/sessionStore";
import { computeObraMargin, overdueInvoicesTotal, pendingTicketsCount } from "@/lib/construction/obraMath";
import { formatEUR, formatPercent } from "@/lib/utils/money";
import { MetricTile } from "./MetricTile";
import { QuickActionTile } from "./QuickActionTile";
import { AlertCard } from "./AlertCard";
import { ObraCard } from "./ObraCard";
import { ActiveObraHero, NoActiveObraHero } from "./ActiveObraHero";
import { DemoResetCard } from "./DemoResetCard";
import {
  AlertCircleIcon,
  ArrowDownToLineIcon,
  ArrowRightIcon,
  BarChart2Icon,
  CameraIcon,
  FileTextIcon,
  PackageIcon,
  PlusIcon,
  ReceiptIcon,
  TrendingUpIcon
} from "./icons";

const activeStatuses = new Set(["lead", "quoted", "active", "waiting"]);

const statusPriority: Record<ConstructionProject["status"], number> = {
  active: 0,
  waiting: 1,
  quoted: 2,
  lead: 3,
  completed: 4,
  archived: 5
};

function pickActiveObra(projects: ConstructionProject[]): ConstructionProject | null {
  if (projects.length === 0) return null;
  const sorted = [...projects].sort((a, b) => {
    const sa = statusPriority[a.status] ?? 99;
    const sb = statusPriority[b.status] ?? 99;
    if (sa !== sb) return sa - sb;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
  return sorted[0] ?? null;
}

export function InicioDashboard() {
  const projects = useProjects();
  const expenses = useExpenses();
  const payments = usePayments();
  const tickets = useTickets();
  const invoices = useInvoices();
  const contactNameById = useContactNameById();

  const activeObra = useMemo(() => pickActiveObra(projects), [projects]);

  const facturado = payments.reduce((acc, p) => acc + p.amount, 0);
  const cobrado = payments.filter(p => p.status === "paid").reduce((acc, p) => acc + p.amount, 0);
  const pendiente = payments.filter(p => p.status !== "paid").reduce((acc, p) => acc + p.amount, 0);
  const overduePayments = payments.filter(p => p.status === "overdue");
  const overdueAmount = overduePayments.reduce((acc, p) => acc + p.amount, 0);

  const gastos = projects.reduce(
    (acc, p) => acc + computeObraMargin(p, expenses).actualCost,
    0
  );

  const aggregatedPresupuesto = projects.reduce((acc, p) => acc + (p.presupuestoTotal ?? p.budget ?? 0), 0);
  const aggregatedCost = projects.reduce((acc, p) => acc + computeObraMargin(p, expenses).costToDate, 0);
  const aggregatedMarginPercent = aggregatedPresupuesto > 0 ? (aggregatedPresupuesto - aggregatedCost) / aggregatedPresupuesto : 0;
  const ticketsPending = pendingTicketsCount(tickets);
  const overdueInvoices = overdueInvoicesTotal(invoices);

  const otherActiveProjects = useMemo(
    () => projects.filter(p => activeStatuses.has(p.status) && p.id !== activeObra?.id).slice(0, 3),
    [projects, activeObra]
  );

  const pendingTicketsForActive = useMemo(() => {
    if (!activeObra) return 0;
    return tickets.filter(
      t => t.status === "pending_review" && (t.projectId === activeObra.id || t.suggestedProjectId === activeObra.id)
    ).length;
  }, [tickets, activeObra]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-obra-600">ObraRentable OS</p>
        <h1 className="mt-1 text-[1.625rem] font-bold leading-tight text-slate-950 sm:text-3xl">Hola, {demoOrganization.name}</h1>
        <p className="mt-1.5 text-sm text-slate-500">Controla tu obra actual.</p>
      </header>

      {activeObra ? (
        <ActiveObraHero
          project={activeObra}
          clientName={contactNameById[activeObra.contactId] ?? "Sin cliente"}
          expenses={expenses}
          payments={payments}
          pendingTicketsForObra={pendingTicketsForActive}
        />
      ) : (
        <NoActiveObraHero />
      )}

      <section aria-label="Avisos del negocio" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AlertCard
          tone={overduePayments.length > 0 ? "risk" : "neutral"}
          icon={<AlertCircleIcon className="h-5 w-5" />}
          label="Cobros vencidos"
          count={overduePayments.length}
          description={overduePayments.length > 0 ? `${formatEUR(overdueAmount)} sin cobrar pasados de fecha` : "Todo al día"}
          href="/verticals/construction/payments"
          ctaLabel="Revisar"
        />
        <AlertCard
          tone={overdueInvoices.count > 0 ? "risk" : "neutral"}
          icon={<FileTextIcon className="h-5 w-5" />}
          label="Facturas vencidas"
          count={overdueInvoices.count}
          description={overdueInvoices.count > 0 ? `${formatEUR(overdueInvoices.total)} en facturas pasadas de fecha` : "Todo al día"}
          href="/verticals/construction/invoices"
          ctaLabel="Revisar"
        />
        <AlertCard
          tone={ticketsPending > 0 ? "warning" : "neutral"}
          icon={<ReceiptIcon className="h-5 w-5" />}
          label="Tickets pendientes"
          count={ticketsPending}
          description={ticketsPending > 0 ? "Sin clasificar o sin obra asignada" : "Sin tickets por revisar"}
          href="/verticals/construction/tickets"
          ctaLabel="Clasificar"
        />
      </section>

      <section aria-label="Resumen del negocio" className="space-y-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-slate-600">Resumen del negocio</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricTile label="Facturado" value={formatEUR(facturado)} hint={`Cobrado ${formatEUR(cobrado)}`} tone="primary" />
          <MetricTile label="Gastos" value={formatEUR(gastos)} hint="Coste real acumulado" />
          <MetricTile label="Pendiente de cobro" value={formatEUR(pendiente)} hint={`Vencido ${formatEUR(overdueAmount)}`} tone={overdueAmount > 0 ? "risk" : "neutral"} />
          <MetricTile
            label="Margen estimado"
            value={formatPercent(aggregatedMarginPercent)}
            hint={`${formatEUR(aggregatedPresupuesto - aggregatedCost)} sobre ${formatEUR(aggregatedPresupuesto)}`}
            tone={aggregatedMarginPercent >= 0.2 ? "healthy" : aggregatedMarginPercent >= 0.05 ? "warning" : "risk"}
          />
        </div>
      </section>

      {otherActiveProjects.length > 0 ? (
        <section aria-label="Otras obras" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-slate-600">Otras obras</h2>
            <Link
              href="/verticals/construction/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-obra-700 hover:text-obra-800"
            >
              Ver todas
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {otherActiveProjects.map(project => (
              <ObraCard
                key={project.id}
                project={project}
                clientName={contactNameById[project.contactId] ?? "Sin cliente"}
                payments={payments}
                expenses={expenses}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-label="Acciones rápidas" className="space-y-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-slate-600">Más acciones</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <QuickActionTile
            href="/verticals/construction/projects/new"
            icon={<PlusIcon className="h-5 w-5" />}
            label="Nueva obra"
            description="Cliente, dirección y presupuesto"
          />
          <QuickActionTile
            href="/verticals/construction/invoices/new"
            icon={<FileTextIcon className="h-5 w-5" />}
            label="Emitir factura"
            description="Factura a un cliente"
          />
          <QuickActionTile
            href="/verticals/construction/payments"
            icon={<ArrowDownToLineIcon className="h-5 w-5" />}
            label="Cobros pendientes"
            description="Revisa lo que queda por cobrar"
          />
          <QuickActionTile
            href="/verticals/construction/tickets"
            icon={<CameraIcon className="h-5 w-5" />}
            label="Tickets pendientes"
            description="Captura por foto: próximamente"
          />
          <QuickActionTile
            href="/verticals/construction/reports"
            icon={<BarChart2Icon className="h-5 w-5" />}
            label="Report mensual"
            description="Resumen para la gestoría"
          />
          <QuickActionTile
            href="/verticals/construction/export"
            icon={<PackageIcon className="h-5 w-5" />}
            label="Gestor"
            description="Prepara el mes para exportar"
          />
          <QuickActionTile
            href="/verticals/construction/profitability"
            icon={<TrendingUpIcon className="h-5 w-5" />}
            label="Rentabilidad"
            description="Márgenes y obras en riesgo"
          />
        </div>
      </section>

      <DemoResetCard />
    </div>
  );
}
