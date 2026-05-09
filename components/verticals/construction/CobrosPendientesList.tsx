"use client";

import Link from "next/link";
import type { ConstructionPayment, ConstructionProject } from "@/types/construction";
import { useObraStoreActions } from "@/lib/store/sessionStore";
import { formatEUR } from "@/lib/utils/money";
import { ArrowRightIcon, ChevronRightIcon } from "./icons";

const statusMap: Record<ConstructionPayment["status"], { label: string; classes: string; barClasses: string }> = {
  paid: { label: "Cobrado", classes: "bg-rentable-healthyBg text-rentable-healthy", barClasses: "border-l-rentable-healthy" },
  pending: { label: "Pendiente", classes: "bg-rentable-pendingBg text-rentable-pending", barClasses: "border-l-rentable-pending" },
  overdue: { label: "Vencido", classes: "bg-rentable-riskBg text-rentable-risk", barClasses: "border-l-rentable-risk" }
};

function formatDate(value?: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

interface ProjectGroup {
  project: ConstructionProject;
  clientName: string;
  payments: ConstructionPayment[];
  total: number;
  overdueTotal: number;
}

export function CobrosPendientesList({
  payments,
  projects,
  contactNameById
}: {
  payments: ConstructionPayment[];
  projects: ConstructionProject[];
  contactNameById: Record<string, string>;
}) {
  const { markPaymentPaid } = useObraStoreActions();
  const pending = payments.filter(p => p.status !== "paid");
  const projectsById = new Map(projects.map(p => [p.id, p]));

  const groups: ProjectGroup[] = [];
  for (const payment of pending) {
    const project = projectsById.get(payment.projectId);
    if (!project) continue;
    let group = groups.find(g => g.project.id === project.id);
    if (!group) {
      group = {
        project,
        clientName: contactNameById[project.contactId] ?? "Sin cliente",
        payments: [],
        total: 0,
        overdueTotal: 0
      };
      groups.push(group);
    }
    group.payments.push(payment);
    group.total += payment.amount;
    if (payment.status === "overdue") group.overdueTotal += payment.amount;
  }

  groups.sort((a, b) => b.overdueTotal - a.overdueTotal || b.total - a.total);
  for (const group of groups) {
    group.payments.sort((a, b) => {
      if (a.status !== b.status) return a.status === "overdue" ? -1 : 1;
      const ad = a.dueAt ?? a.createdAt;
      const bd = b.dueAt ?? b.createdAt;
      return ad.localeCompare(bd);
    });
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-medium text-slate-700">No hay cobros pendientes.</p>
        <p className="mt-1 text-xs text-slate-500">Todos tus cobros están al día.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(group => (
        <article key={group.project.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{group.project.name}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{group.clientName}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-right">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Pendiente</p>
                <p className="text-sm font-semibold tabular-nums text-slate-950">{formatEUR(group.total)}</p>
                {group.overdueTotal > 0 ? (
                  <p className="text-[11px] font-semibold tabular-nums text-rentable-risk">Vencido {formatEUR(group.overdueTotal)}</p>
                ) : null}
              </div>
              <Link
                href={`/verticals/construction/projects/${group.project.id}`}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-obra-300 hover:text-obra-700"
              >
                Ver obra
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
          </header>

          <ul>
            {group.payments.map(payment => {
              const status = statusMap[payment.status];
              return (
                <li
                  key={payment.id}
                  className={`flex flex-wrap items-center justify-between gap-3 border-l-4 ${status.barClasses} bg-white px-4 py-3 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-slate-100`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold tabular-nums text-slate-950">{formatEUR(payment.amount)}</p>
                      {payment.phase ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{payment.phase}</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {payment.status === "overdue"
                        ? <>Vencido el <span className="font-semibold text-rentable-risk">{formatDate(payment.dueAt)}</span></>
                        : <>Vence el <span className="font-medium text-slate-700">{formatDate(payment.dueAt)}</span></>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${status.classes}`}>{status.label}</span>
                    <button
                      type="button"
                      onClick={() => markPaymentPaid(payment.id)}
                      className="inline-flex items-center rounded-xl bg-obra-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-obra-600 active:scale-95"
                    >
                      Marcar cobrado
                    </button>
                    <Link
                      href={`/verticals/construction/projects/${group.project.id}`}
                      aria-label={`Ver obra ${group.project.name}`}
                      className="text-slate-400 transition hover:text-obra-500"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </div>
  );
}
