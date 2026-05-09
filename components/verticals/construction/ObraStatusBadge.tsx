import type { ConstructionProjectStatus } from "@/types/construction";

const statusMap: Record<ConstructionProjectStatus, { label: string; classes: string }> = {
  lead: { label: "Lead", classes: "bg-slate-100 text-slate-600" },
  quoted: { label: "Presupuestada", classes: "bg-obra-100 text-obra-700" },
  active: { label: "En curso", classes: "bg-obra-500 text-white" },
  waiting: { label: "En espera", classes: "bg-rentable-pendingBg text-rentable-pending" },
  completed: { label: "Finalizada", classes: "bg-rentable-healthyBg text-rentable-healthy" },
  archived: { label: "Archivada", classes: "bg-slate-100 text-slate-500" }
};

export function ObraStatusBadge({ status }: { status: ConstructionProjectStatus }) {
  const cfg = statusMap[status];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.classes}`}>{cfg.label}</span>;
}
