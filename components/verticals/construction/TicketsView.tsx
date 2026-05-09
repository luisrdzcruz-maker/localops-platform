"use client";

import { useTickets } from "@/lib/store/sessionStore";
import { pendingTicketsCount } from "@/lib/construction/obraMath";
import { formatEUR } from "@/lib/utils/money";
import { CameraIcon } from "./icons";
import { MetricTile } from "./MetricTile";
import { TicketsList } from "./TicketsList";

export function TicketsView() {
  const tickets = useTickets();

  const pending = tickets.filter(t => t.status === "pending_review");
  const linked = tickets.filter(t => t.status === "linked");
  const totalPending = pending.reduce((acc, t) => acc + t.amount, 0);
  const totalLinked = linked.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-obra-600">ObraRentable OS</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Tickets pendientes</h1>
        <p className="mt-1 text-sm text-slate-500">Tickets sin clasificar o sin obra asignada. Revísalos cuando llegue un albarán o foto de gasto.</p>
      </header>

      <section aria-label="Resumen de tickets" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile label="Por revisar" value={String(pendingTicketsCount(tickets))} hint={`${formatEUR(totalPending)} sin clasificar`} tone="warning" />
        <MetricTile label="Asignados" value={String(linked.length)} hint={`${formatEUR(totalLinked)} ya en obras`} tone="primary" />
        <MetricTile label="Total tickets" value={String(tickets.length)} hint="Capturados en mock" />
        <MetricTile label="Importe total" value={formatEUR(totalPending + totalLinked)} hint="Sin contar rechazados" tone="neutral" />
      </section>

      <div className="rounded-2xl border border-obra-100 bg-obra-50/60 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-obra-700 ring-1 ring-inset ring-obra-200">
            <CameraIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-950">Captura por foto y voz</p>
            <p className="mt-0.5 text-xs text-slate-700">
              La extracción automática de proveedor, fecha e importe por OCR/IA llegará en una fase futura con créditos. Mientras tanto, los tickets se revisan a mano y los datos extraídos son simulados.
            </p>
          </div>
        </div>
      </div>

      <TicketsList />

      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        Tickets mock — sin OCR real ni subida de archivos. Asignar/rechazar persiste solo en esta sesión.
      </p>
    </div>
  );
}
