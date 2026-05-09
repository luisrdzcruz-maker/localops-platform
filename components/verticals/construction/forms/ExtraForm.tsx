"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ConstructionExtraStatus } from "@/types/construction";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { MoneyField } from "@/components/ui/MoneyField";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatEUR, formatPercent } from "@/lib/utils/money";
import { useObraStoreActions } from "@/lib/store/sessionStore";
import { SubmittedCard } from "./SubmittedCard";

const STATUS_OPTIONS: { value: ConstructionExtraStatus; label: string }[] = [
  { value: "proposed", label: "Propuesto — pendiente de aprobación" },
  { value: "approved", label: "Aprobado por el cliente" },
  { value: "rejected", label: "Rechazado" },
  { value: "invoiced", label: "Facturado" },
  { value: "paid", label: "Cobrado" }
];

const STATUS_LABELS: Record<ConstructionExtraStatus, string> = {
  proposed: "Propuesto",
  approved: "Aprobado",
  rejected: "Rechazado",
  invoiced: "Facturado",
  paid: "Cobrado"
};

interface FormState {
  title: string;
  description: string;
  amount: string;
  vatRate: string;
  status: ConstructionExtraStatus;
  notes: string;
}

interface SubmittedSummary {
  title: string;
  total: number;
  status: ConstructionExtraStatus;
  projectId: string;
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ExtraForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { createExtra } = useObraStoreActions();

  const initialState: FormState = useMemo(
    () => ({ title: "", description: "", amount: "", vatRate: "21", status: "proposed", notes: "" }),
    []
  );

  const [state, setState] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState<SubmittedSummary | null>(null);

  const amount = toNumber(state.amount);
  const vatRate = toNumber(state.vatRate) / 100;
  const vatAmount = amount * vatRate;
  const total = amount + vatAmount;

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState(prev => ({ ...prev, [key]: value }));

  const canSubmit = projectId !== "" && state.title.trim() !== "" && amount > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = createExtra({
      projectId,
      title: state.title,
      description: state.description || undefined,
      amount,
      vatRate,
      status: state.status,
      notes: state.notes || undefined
    });
    setSubmitted({ title: created.title, total: created.total, status: created.status, projectId: created.projectId });
    router.refresh();
  };

  if (submitted) {
    return (
      <SubmittedCard
        title="Extra registrado en sesión"
        description={`${submitted.title} · ${formatEUR(submitted.total)} · ${STATUS_LABELS[submitted.status]}`}
        primaryHref={`/verticals/construction/projects/${submitted.projectId}`}
        primaryLabel="Ir a la obra"
        secondaryHref={`/verticals/construction/projects/${submitted.projectId}/extras/new`}
        secondaryLabel="Añadir otro"
        details={
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Importe sin IVA</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{formatEUR(amount)}</dd>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Total con IVA</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{formatEUR(submitted.total)}</dd>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Estado</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-700">{STATUS_LABELS[submitted.status]}</dd>
            </div>
          </dl>
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
        <h2 className="text-base font-semibold text-slate-950">Datos del extra</h2>

        <Field label="Título del extra" htmlFor="title" required>
          <Input
            id="title"
            required
            value={state.title}
            onChange={e => handleChange("title", e.target.value)}
            placeholder="Cambio de instalación eléctrica, iluminación LED…"
          />
        </Field>

        <Field label="Descripción" htmlFor="description">
          <Textarea
            id="description"
            rows={2}
            value={state.description}
            onChange={e => handleChange("description", e.target.value)}
            placeholder="Detalla qué trabajo adicional se ha acordado con el cliente…"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Importe sin IVA" htmlFor="amount" required>
            <MoneyField
              id="amount"
              required
              value={state.amount}
              onChange={e => handleChange("amount", e.target.value)}
              placeholder="0,00"
            />
          </Field>
          <Field label="IVA" htmlFor="vatRate" hint="Por defecto 21%">
            <MoneyField
              id="vatRate"
              suffix="%"
              max={100}
              value={state.vatRate}
              onChange={e => handleChange("vatRate", e.target.value)}
              placeholder="21"
            />
          </Field>
        </div>

        <Field label="Estado" htmlFor="status" required hint="¿El cliente ha aprobado este trabajo extra?">
          <Select
            id="status"
            required
            value={state.status}
            onChange={e => handleChange("status", e.target.value as ConstructionExtraStatus)}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </Field>

        <Field label="Notas" htmlFor="notes">
          <Textarea
            id="notes"
            rows={2}
            value={state.notes}
            onChange={e => handleChange("notes", e.target.value)}
            placeholder="Referencia, condiciones de cobro, acuerdo verbal…"
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
            disabled={!canSubmit}
            className="rounded-xl bg-obra-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-obra-600 disabled:opacity-60"
          >
            Guardar extra
          </button>
        </div>
      </div>

      <aside className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Resumen</p>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Base imponible</dt>
              <dd className="font-semibold tabular-nums text-slate-950">{formatEUR(amount)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">IVA ({formatPercent(vatRate)})</dt>
              <dd className="font-medium tabular-nums text-slate-700">{formatEUR(vatAmount)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Total extra</dt>
              <dd className="text-lg font-semibold tabular-nums text-slate-950">{formatEUR(total)}</dd>
            </div>
          </dl>
        </div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Sin factura automática en este MVP. Datos solo en esta sesión.
        </p>
      </aside>
    </form>
  );
}
