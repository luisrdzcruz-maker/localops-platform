"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { MoneyField } from "@/components/ui/MoneyField";
import { computeObraProgress } from "@/lib/construction/obraMath";
import { formatEUR, formatPercent } from "@/lib/utils/money";
import { useObraStoreActions, usePaymentsByProject, useProject } from "@/lib/store/sessionStore";
import { ProgressBar } from "../ProgressBar";
import { SubmittedCard } from "./SubmittedCard";

const phases = [
  "Anticipo / señal",
  "Inicio de obra",
  "Avance 25%",
  "Avance 50%",
  "Avance 75%",
  "Final de obra",
  "Otro"
] as const;

type Phase = (typeof phases)[number];

const methods = [
  { value: "transfer", label: "Transferencia" },
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "bizum", label: "Bizum" },
  { value: "other", label: "Otro" }
] as const;

type Method = (typeof methods)[number]["value"];

interface FormState {
  phase: Phase;
  amount: string;
  paidAt: string;
  method: Method;
  notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const initialState: FormState = {
  phase: phases[0],
  amount: "",
  paidAt: today(),
  method: "transfer",
  notes: ""
};

function toNumber(value: string): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

interface SubmittedSummary {
  phase: Phase;
  amount: number;
  paidAt: string;
  method: Method;
}

export function PaymentForm({ projectId }: { projectId: string }) {
  const project = useProject(projectId);
  const projectPayments = usePaymentsByProject(projectId);
  const { createPayment } = useObraStoreActions();
  const [state, setState] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState<SubmittedSummary | null>(null);

  if (!project) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-card">
        <p className="text-sm font-medium text-slate-700">Obra no encontrada en esta sesión.</p>
      </div>
    );
  }

  const baseProgress = computeObraProgress(project, projectPayments);
  const amount = toNumber(state.amount);
  const newPaid = baseProgress.paid + amount;
  const newRemaining = Math.max(baseProgress.presupuestoTotal - newPaid, 0);
  const newCollectedRatio = baseProgress.presupuestoTotal > 0 ? Math.min(newPaid / baseProgress.presupuestoTotal, 1) : 0;
  const wouldExceed = baseProgress.presupuestoTotal > 0 && newPaid > baseProgress.presupuestoTotal;

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  if (submitted) {
    const methodLabel = methods.find(m => m.value === submitted.method)?.label ?? submitted.method;
    return (
      <SubmittedCard
        title="Cobro registrado en sesión"
        description={`${formatEUR(submitted.amount)} · ${submitted.phase} · ${methodLabel}`}
        primaryHref={`/verticals/construction/projects/${project.id}`}
        primaryLabel="Volver a la obra"
        secondaryHref={`/verticals/construction/projects/${project.id}/payments/new`}
        secondaryLabel="Registrar otro cobro"
        details={
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Importe</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{formatEUR(submitted.amount)}</dd>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Fecha</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-700">{submitted.paidAt}</dd>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Fase</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-700">{submitted.phase}</dd>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Método</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-700">{methodLabel}</dd>
            </div>
          </dl>
        }
      />
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createPayment({
      projectId: project.id,
      amount,
      phase: state.phase,
      method: state.method,
      paidAt: state.paidAt,
      notes: state.notes || undefined
    });
    setSubmitted({
      phase: state.phase,
      amount,
      paidAt: state.paidAt,
      method: state.method
    });
    setState(initialState);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
        <div className="rounded-xl bg-obra-50/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-obra-700">Obra asignada</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-950">{project.name}</p>
          <p className="text-xs text-slate-500">Presupuesto {formatEUR(baseProgress.presupuestoTotal)}</p>
        </div>

        <Field label="Fase" htmlFor="phase" required>
          <Select
            id="phase"
            required
            value={state.phase}
            onChange={e => handleChange("phase", e.target.value as Phase)}
          >
            {phases.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Importe" htmlFor="amount" required>
            <MoneyField
              id="amount"
              required
              value={state.amount}
              onChange={e => handleChange("amount", e.target.value)}
              placeholder="0,00"
            />
          </Field>
          <Field label="Fecha del cobro" htmlFor="paidAt" required>
            <Input
              id="paidAt"
              type="date"
              required
              value={state.paidAt}
              onChange={e => handleChange("paidAt", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Método de cobro" htmlFor="method" required>
          <Select
            id="method"
            required
            value={state.method}
            onChange={e => handleChange("method", e.target.value as Method)}
          >
            {methods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>
        </Field>

        <Field label="Observaciones" htmlFor="notes">
          <Textarea
            id="notes"
            rows={3}
            value={state.notes}
            onChange={e => handleChange("notes", e.target.value)}
            placeholder="Referencia bancaria, número de factura…"
          />
        </Field>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setState(initialState)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="rounded-xl bg-obra-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-obra-600"
          >
            Registrar cobro
          </button>
        </div>
      </div>

      <aside className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resumen de cobros</p>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Presupuesto</dt>
              <dd className="font-semibold tabular-nums text-slate-950">{formatEUR(baseProgress.presupuestoTotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ya cobrado</dt>
              <dd className="font-medium tabular-nums text-slate-700">{formatEUR(baseProgress.paid)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Nuevo cobro</dt>
              <dd className="font-semibold tabular-nums text-obra-700">{formatEUR(amount)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Pendiente tras el cobro</dt>
              <dd className="text-right">
                <div className="font-semibold tabular-nums text-slate-950">{formatEUR(newRemaining)}</div>
                <div className="mt-0.5 text-[11px] font-medium tabular-nums text-slate-500">{formatPercent(newCollectedRatio)} cobrado</div>
              </dd>
            </div>
          </dl>

          <ProgressBar
            value={newPaid}
            max={Math.max(baseProgress.presupuestoTotal, newPaid, 1)}
            tone={wouldExceed ? "warning" : newCollectedRatio >= 1 ? "healthy" : "primary"}
            className="mt-3"
          />

          {wouldExceed ? (
            <div className="mt-4 rounded-xl bg-rentable-pendingBg p-3 text-xs font-medium text-rentable-pending">
              Este cobro supera el presupuesto. Considera registrar el excedente como un extra.
            </div>
          ) : null}
        </div>

        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Cálculo en vivo. Datos solo en esta sesión.
        </p>
      </aside>
    </form>
  );
}
