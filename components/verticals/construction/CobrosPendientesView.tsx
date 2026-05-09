"use client";

import { useContactNameById, usePayments, useProjects } from "@/lib/store/sessionStore";
import { formatEUR } from "@/lib/utils/money";
import { CobrosPendientesList } from "./CobrosPendientesList";
import { MetricTile } from "./MetricTile";

export function CobrosPendientesView() {
  const payments = usePayments();
  const projects = useProjects();
  const contactNameById = useContactNameById();

  const pending = payments.filter(p => p.status === "pending");
  const overdue = payments.filter(p => p.status === "overdue");
  const totalPending = pending.reduce((acc, p) => acc + p.amount, 0);
  const totalOverdue = overdue.reduce((acc, p) => acc + p.amount, 0);
  const totalAtRisk = totalPending + totalOverdue;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-obra-600">ObraRentable OS</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Cobros pendientes</h1>
        <p className="mt-1 text-sm text-slate-500">Cobros sin recibir en todas tus obras, ordenados por urgencia.</p>
      </header>

      <section aria-label="Resumen de cobros" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricTile
          label="Total pendiente"
          value={formatEUR(totalAtRisk)}
          hint={`${pending.length + overdue.length} cobros`}
          tone={totalOverdue > 0 ? "risk" : "primary"}
        />
        <MetricTile
          label="Vencido"
          value={formatEUR(totalOverdue)}
          hint={`${overdue.length} cobros vencidos`}
          tone={totalOverdue > 0 ? "risk" : "neutral"}
        />
        <MetricTile
          label="Pendiente al día"
          value={formatEUR(totalPending)}
          hint={`${pending.length} próximos vencimientos`}
          tone="warning"
        />
      </section>

      <CobrosPendientesList payments={payments} projects={projects} contactNameById={contactNameById} />

      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        Cobros mock — sin envío real de recordatorios. Email y WhatsApp llegarán cuando se conecten integraciones.
      </p>
    </div>
  );
}
