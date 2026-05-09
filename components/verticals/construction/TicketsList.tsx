"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ConstructionProject, ConstructionTicket } from "@/types/construction";
import { useObraStoreActions, useProjects, useTickets } from "@/lib/store/sessionStore";
import { formatEUR } from "@/lib/utils/money";
import { ReceiptIcon } from "./icons";

type FilterKey = "pending" | "linked" | "rejected" | "all";

const filterLabels: Record<FilterKey, string> = {
  pending: "Por revisar",
  linked: "Asignados",
  rejected: "Rechazados",
  all: "Todos"
};

const statusMap: Record<ConstructionTicket["status"], { label: string; classes: string }> = {
  pending_review: { label: "Por revisar", classes: "bg-rentable-pendingBg text-rentable-pending" },
  linked: { label: "Asignado", classes: "bg-rentable-healthyBg text-rentable-healthy" },
  rejected: { label: "Rechazado", classes: "bg-rentable-riskBg text-rentable-risk" }
};

function formatDate(value?: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

function TicketThumbnail({ hue = 220 }: { hue?: number }) {
  const bg = `linear-gradient(135deg, hsl(${hue}, 60%, 92%) 0%, hsl(${(hue + 30) % 360}, 50%, 80%) 100%)`;
  return (
    <div
      aria-hidden
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-slate-500 ring-1 ring-inset ring-white/40"
      style={{ background: bg }}
    >
      <ReceiptIcon className="h-7 w-7" />
    </div>
  );
}

export function TicketsList() {
  const tickets = useTickets();
  const projects = useProjects();
  const { updateTicketStatus } = useObraStoreActions();

  const [filter, setFilter] = useState<FilterKey>("pending");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const projectsById = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);

  const counts: Record<FilterKey, number> = useMemo(() => {
    const acc: Record<FilterKey, number> = { pending: 0, linked: 0, rejected: 0, all: tickets.length };
    for (const t of tickets) {
      if (t.status === "pending_review") acc.pending += 1;
      else if (t.status === "linked") acc.linked += 1;
      else acc.rejected += 1;
    }
    return acc;
  }, [tickets]);

  const filtered = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => b.date.localeCompare(a.date));
    if (filter === "all") return sorted;
    if (filter === "pending") return sorted.filter(t => t.status === "pending_review");
    if (filter === "linked") return sorted.filter(t => t.status === "linked");
    return sorted.filter(t => t.status === "rejected");
  }, [tickets, filter]);

  const selectableIds = filtered.filter(t => t.status === "pending_review").map(t => t.id);
  const selectedIds = selectableIds.filter(id => selected[id]);
  const selectedCount = selectedIds.length;

  const toggleSelected = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const clearSelection = () => setSelected({});

  const assignTicket = (ticket: ConstructionTicket, project?: ConstructionProject) => {
    const targetProjectId = project?.id ?? ticket.suggestedProjectId;
    if (!targetProjectId) return;
    updateTicketStatus(ticket.id, "linked", targetProjectId);
    setSelected(prev => {
      const next = { ...prev };
      delete next[ticket.id];
      return next;
    });
  };

  const rejectTicket = (ticket: ConstructionTicket) => {
    updateTicketStatus(ticket.id, "rejected");
    setSelected(prev => {
      const next = { ...prev };
      delete next[ticket.id];
      return next;
    });
  };

  const bulkAssignSuggested = () => {
    for (const id of selectedIds) {
      const ticket = tickets.find(t => t.id === id);
      if (!ticket) continue;
      const target = ticket.suggestedProjectId;
      if (!target) continue;
      updateTicketStatus(ticket.id, "linked", target);
    }
    clearSelection();
  };

  const selectedWithSuggestion = selectedIds.filter(id => {
    const t = tickets.find(x => x.id === id);
    return t?.suggestedProjectId;
  }).length;

  return (
    <div className="space-y-4 pb-20">
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
          <p className="text-sm font-medium text-slate-700">No hay tickets en este filtro.</p>
          <p className="mt-1 text-xs text-slate-500">Cambia de filtro o sube nuevos tickets cuando llegue la captura por foto.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map(ticket => {
            const status = statusMap[ticket.status];
            const isSelectable = ticket.status === "pending_review";
            const isSelected = !!selected[ticket.id];
            const linkedProject = ticket.projectId ? projectsById.get(ticket.projectId) : undefined;
            const suggestedProject = ticket.suggestedProjectId ? projectsById.get(ticket.suggestedProjectId) : undefined;
            const lowConfidence = ticket.extractedFields?.amount?.confidence !== undefined && ticket.extractedFields.amount.confidence < 0.75;

            return (
              <li
                key={ticket.id}
                className={`flex flex-wrap items-start gap-3 rounded-2xl border bg-white p-3 shadow-card transition sm:flex-nowrap ${
                  isSelected ? "border-obra-400 ring-2 ring-obra-100" : "border-slate-200"
                }`}
              >
                {isSelectable ? (
                  <label className="flex h-14 items-center pl-1 pr-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(ticket.id)}
                      aria-label={`Seleccionar ticket de ${ticket.provider ?? "proveedor desconocido"}`}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-obra-500 focus:ring-obra-500"
                    />
                  </label>
                ) : (
                  <div className="h-14 w-2" aria-hidden />
                )}

                <TicketThumbnail hue={ticket.thumbnailHue} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-950">{ticket.provider ?? "Proveedor sin identificar"}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.classes}`}>{status.label}</span>
                    {lowConfidence ? (
                      <span className="inline-flex items-center rounded-full bg-rentable-pendingBg px-2 py-0.5 text-[11px] font-semibold text-rentable-pending">
                        Baja confianza
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(ticket.date)}</p>
                  <div className="mt-1.5 text-xs text-slate-500">
                    {linkedProject ? (
                      <Link href={`/verticals/construction/projects/${linkedProject.id}`} className="font-medium text-obra-700 hover:underline">
                        Asignado a {linkedProject.name}
                      </Link>
                    ) : suggestedProject ? (
                      <span>
                        Obra sugerida: <Link href={`/verticals/construction/projects/${suggestedProject.id}`} className="font-medium text-obra-700 hover:underline">{suggestedProject.name}</Link>
                      </span>
                    ) : (
                      <span className="italic text-slate-400">Sin obra sugerida</span>
                    )}
                  </div>
                  {ticket.notes ? <p className="mt-1 text-xs text-slate-500">{ticket.notes}</p> : null}
                </div>

                <div className="flex w-full flex-col items-end gap-1 sm:w-auto">
                  <p className="text-sm font-semibold tabular-nums text-slate-950">{formatEUR(ticket.amount)}</p>
                  <p className="text-[11px] tabular-nums text-slate-500">IVA {formatEUR(ticket.vatAmount)}</p>
                  {isSelectable ? (
                    <div className="mt-1 flex items-center gap-1.5">
                      <Link
                        href={`/verticals/construction/tickets/${ticket.id}/review`}
                        className="rounded-lg bg-obra-500 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-obra-600"
                      >
                        Revisar
                      </Link>
                      <button
                        type="button"
                        onClick={() => assignTicket(ticket, suggestedProject)}
                        disabled={!suggestedProject}
                        className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                          suggestedProject
                            ? "border border-slate-200 bg-white text-slate-700 hover:border-obra-300 hover:text-obra-700"
                            : "cursor-not-allowed bg-slate-100 text-slate-400"
                        }`}
                        title={suggestedProject ? `Asignar a ${suggestedProject.name}` : "Sin obra sugerida"}
                      >
                        Asignar
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectTicket(ticket)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-rentable-risk hover:text-rentable-risk"
                      >
                        Rechazar
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selectedCount > 0 ? (
        <div className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-3xl rounded-2xl border border-obra-200 bg-white p-3 shadow-lg lg:bottom-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {selectedCount} {selectedCount === 1 ? "ticket seleccionado" : "tickets seleccionados"}
              </p>
              {selectedCount !== selectedWithSuggestion ? (
                <p className="text-[11px] text-slate-500">
                  {selectedCount - selectedWithSuggestion} sin obra sugerida — esos no se asignarán automáticamente.
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={bulkAssignSuggested}
                disabled={selectedWithSuggestion === 0}
                className={`rounded-xl px-3 py-2 text-xs font-semibold text-white transition ${
                  selectedWithSuggestion === 0 ? "cursor-not-allowed bg-obra-500/40" : "bg-obra-500 hover:bg-obra-600"
                }`}
              >
                Marcar como asignados
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
