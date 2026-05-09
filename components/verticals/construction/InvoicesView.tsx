"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { IssuedInvoiceStatus } from "@/types/construction";
import { useContactNameById, useInvoices, useProjects } from "@/lib/store/sessionStore";
import { invoiceTotalsAll } from "@/lib/construction/obraMath";
import { formatEUR } from "@/lib/utils/money";
import { InvoiceCard } from "./InvoiceCard";
import { MetricTile } from "./MetricTile";
import { PlusIcon } from "./icons";

type FilterKey = "all" | "draft" | "sent" | "paid" | "overdue";

const filterLabels: Record<FilterKey, string> = {
  all: "Todas",
  draft: "Borradores",
  sent: "Enviadas",
  paid: "Cobradas",
  overdue: "Vencidas"
};

const filterMatches: Record<FilterKey, (status: IssuedInvoiceStatus) => boolean> = {
  all: () => true,
  draft: status => status === "draft",
  sent: status => status === "issued" || status === "sent",
  paid: status => status === "paid",
  overdue: status => status === "overdue"
};

export function InvoicesView() {
  const invoices = useInvoices();
  const projects = useProjects();
  const contactNameById = useContactNameById();
  const [filter, setFilter] = useState<FilterKey>("all");

  const projectsById = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
  const totals = useMemo(() => invoiceTotalsAll(invoices), [invoices]);

  const counts = useMemo(() => {
    const acc: Record<FilterKey, number> = { all: invoices.length, draft: 0, sent: 0, paid: 0, overdue: 0 };
    for (const inv of invoices) {
      if (inv.status === "draft") acc.draft += 1;
      else if (inv.status === "issued" || inv.status === "sent") acc.sent += 1;
      else if (inv.status === "paid") acc.paid += 1;
      else if (inv.status === "overdue") acc.overdue += 1;
    }
    return acc;
  }, [invoices]);

  const filtered = useMemo(() => {
    const match = filterMatches[filter];
    return [...invoices]
      .filter(inv => match(inv.status))
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  }, [invoices, filter]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-obra-600">ObraRentable OS</p>
          <h1 className="mt-1 text-[1.625rem] font-bold leading-tight text-slate-950 sm:text-3xl">Facturas</h1>
          <p className="mt-1.5 text-sm text-slate-500">Facturas emitidas a clientes en esta sesión.</p>
        </div>
        <Link
          href="/verticals/construction/invoices/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-obra-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-obra-600"
        >
          <PlusIcon className="h-4 w-4" />
          Nueva factura
        </Link>
      </header>

      <section aria-label="Resumen de facturas" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile label="Facturado" value={formatEUR(totals.totalIssued)} hint={`${totals.count} facturas`} tone="primary" />
        <MetricTile
          label="Pendiente"
          value={formatEUR(totals.totalPending)}
          hint={`${counts.sent + counts.overdue} facturas sin cobrar`}
          tone={totals.totalPending > 0 ? "warning" : "neutral"}
        />
        <MetricTile
          label="Vencido"
          value={formatEUR(totals.totalOverdue)}
          hint={`${counts.overdue} ${counts.overdue === 1 ? "factura vencida" : "facturas vencidas"}`}
          tone={totals.totalOverdue > 0 ? "risk" : "neutral"}
        />
        <MetricTile label="IVA repercutido" value={formatEUR(totals.vatTotal)} hint={`Cobrado ${formatEUR(totals.vatCollected)}`} />
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {(Object.keys(filterLabels) as FilterKey[]).map(key => {
          const isActive = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={isActive}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-obra-500 bg-obra-500 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-obra-300 hover:text-obra-700"
              }`}
            >
              {filterLabels[key]}
              <span className={`tabular-nums text-[10px] font-medium ${isActive ? "text-white/80" : "text-slate-400"}`}>{counts[key]}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-700">No hay facturas en este filtro.</p>
          <p className="mt-1 text-xs text-slate-500">Cambia de filtro o emite una nueva.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(invoice => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              clientName={contactNameById[invoice.contactId] ?? "Sin cliente"}
              project={projectsById.get(invoice.projectId)}
            />
          ))}
        </div>
      )}

      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        Facturas mock — sin PDF real, sin envío automático y sin presentación fiscal. Tu gestor sigue siendo responsable de la facturación oficial.
      </p>
    </div>
  );
}
