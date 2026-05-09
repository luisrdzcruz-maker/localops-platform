"use client";

import { useMemo } from "react";
import type { ConstructionProject } from "@/types/construction";
import { useProjects } from "@/lib/store/sessionStore";
import { QuickActionTile } from "./QuickActionTile";
import {
  BarChart2Icon,
  CameraIcon,
  FileTextIcon,
  PackageIcon,
  PlusIcon,
  ReceiptIcon,
  WalletIcon
} from "./icons";

const STATUS_PRIORITY: Record<ConstructionProject["status"], number> = {
  active: 0,
  waiting: 1,
  quoted: 2,
  lead: 3,
  completed: 4,
  archived: 5
};

function pickActiveProject(projects: ConstructionProject[]): ConstructionProject | null {
  if (projects.length === 0) return null;
  return (
    [...projects].sort(
      (a, b) => (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
    )[0] ?? null
  );
}

export function ActionsView() {
  const projects = useProjects();
  const active = useMemo(() => pickActiveProject(projects), [projects]);

  const expenseHref = active
    ? `/verticals/construction/projects/${active.id}/expenses/new`
    : "/verticals/construction/projects";
  const expenseDescription = active
    ? `Obra activa: ${active.name}.`
    : "Elige un trabajo para añadir el gasto.";

  const paymentHref = active
    ? `/verticals/construction/projects/${active.id}/payments/new`
    : "/verticals/construction/projects";
  const paymentDescription = active
    ? `Obra activa: ${active.name}.`
    : "Elige primero un trabajo para registrar el cobro.";

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-obra-600">ObraRentable OS</p>
        <h1 className="mt-1 text-[1.625rem] font-bold leading-tight text-slate-950 sm:text-3xl">
          ¿Qué quieres hacer ahora?
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Acciones rápidas para llevar trabajos, facturas, gastos y cobros al día.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <QuickActionTile
          href="/verticals/construction/projects/new"
          icon={<PlusIcon className="h-5 w-5" />}
          label="Nuevo trabajo"
          description="Crea una obra o trabajo nuevo."
        />
        <QuickActionTile
          href={expenseHref}
          icon={<ReceiptIcon className="h-5 w-5" />}
          label="Añadir gasto"
          description={expenseDescription}
        />
        <QuickActionTile
          href="/verticals/construction/invoices/new"
          icon={<FileTextIcon className="h-5 w-5" />}
          label="Emitir factura"
          description="Crea una factura para un cliente."
        />
        <QuickActionTile
          href={paymentHref}
          icon={<WalletIcon className="h-5 w-5" />}
          label="Registrar cobro"
          description="Marca anticipos, pagos parciales o cobros finales."
        />
        <QuickActionTile
          href="/verticals/construction/tickets"
          icon={<CameraIcon className="h-5 w-5" />}
          label="Revisar tickets"
          description="Convierte tickets pendientes en gastos."
        />
        <QuickActionTile
          href="/verticals/construction/reports"
          icon={<BarChart2Icon className="h-5 w-5" />}
          label="Ver report mensual"
          description="Revisa IVA, margen y documentos para gestoría."
        />
        <QuickActionTile
          href="/verticals/construction/export"
          icon={<PackageIcon className="h-5 w-5" />}
          label="Enviar al gestor"
          description="Prepara el resumen mensual para tu gestor."
        />
      </div>
    </div>
  );
}
