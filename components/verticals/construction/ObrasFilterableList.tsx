"use client";

import { useMemo, useState } from "react";
import type { ConstructionProjectStatus } from "@/types/construction";
import { useContactNameById, useExpenses, usePayments, useProjects } from "@/lib/store/sessionStore";
import { ObraCard } from "./ObraCard";

type FilterKey = "all" | "active" | "completed";

const filterLabels: Record<FilterKey, string> = {
  all: "Todas",
  active: "Activas",
  completed: "Finalizadas"
};

const activeStatuses: ReadonlySet<ConstructionProjectStatus> = new Set(["lead", "quoted", "active", "waiting"]);
const completedStatuses: ReadonlySet<ConstructionProjectStatus> = new Set(["completed", "archived"]);

export function ObrasFilterableList() {
  const projects = useProjects();
  const payments = usePayments();
  const expenses = useExpenses();
  const contactNameById = useContactNameById();
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => ({
    all: projects.length,
    active: projects.filter(p => activeStatuses.has(p.status)).length,
    completed: projects.filter(p => completedStatuses.has(p.status)).length
  }), [projects]);

  const filtered = useMemo(() => {
    if (filter === "all") return projects;
    if (filter === "active") return projects.filter(p => activeStatuses.has(p.status));
    return projects.filter(p => completedStatuses.has(p.status));
  }, [projects, filter]);

  return (
    <div className="space-y-4">
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
          <p className="text-sm font-medium text-slate-700">No hay obras en este filtro.</p>
          <p className="mt-1 text-xs text-slate-500">Cambia de filtro o crea una obra nueva.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map(project => (
            <ObraCard
              key={project.id}
              project={project}
              clientName={contactNameById[project.contactId] ?? "Sin cliente"}
              payments={payments}
              expenses={expenses}
            />
          ))}
        </div>
      )}
    </div>
  );
}
