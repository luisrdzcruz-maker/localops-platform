"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { MoneyField } from "@/components/ui/MoneyField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { computeObraMargin, marginStatus } from "@/lib/construction/obraMath";
import { formatEUR, formatPercent } from "@/lib/utils/money";
import { useExpensesByProject, useObraStoreActions, useProject } from "@/lib/store/sessionStore";
import { MarginPill } from "../MarginPill";
import { CameraIcon, MoreHorizontalIcon, PlusIcon } from "../icons";
import { SubmittedCard } from "./SubmittedCard";

type Mode = "manual" | "foto" | "voz";
type Category = "material" | "labor" | "subcontract" | "tool" | "transport" | "other";

const categoryLabels: Record<Category, string> = {
  material: "Material",
  labor: "Mano de obra",
  subcontract: "Subcontrata",
  tool: "Herramienta",
  transport: "Transporte",
  other: "Otro"
};

interface FormState {
  category: Category;
  supplier: string;
  description: string;
  amount: string;
  vatRate: string;
  incurredAt: string;
  notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const initialState: FormState = {
  category: "material",
  supplier: "",
  description: "",
  amount: "",
  vatRate: "21",
  incurredAt: today(),
  notes: ""
};

function toNumber(value: string): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

interface SubmittedSummary {
  category: Category;
  supplier?: string;
  amount: number;
  date: string;
}

export function ExpenseForm({ projectId }: { projectId: string }) {
  const project = useProject(projectId);
  const projectExpenses = useExpensesByProject(projectId);
  const { createExpense } = useObraStoreActions();
  const [mode, setMode] = useState<Mode>("manual");
  const [state, setState] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState<SubmittedSummary | null>(null);

  if (!project) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-card">
        <p className="text-sm font-medium text-slate-700">Obra no encontrada en esta sesión.</p>
      </div>
    );
  }

  const baseMargin = computeObraMargin(project, projectExpenses);
  const amount = toNumber(state.amount);
  const vatRate = toNumber(state.vatRate) / 100;
  const vatAmount = amount * vatRate;
  const newCostToDate = baseMargin.costToDate + amount;
  const newMarginAmount = baseMargin.presupuestoTotal - newCostToDate;
  const newMarginPercent = baseMargin.presupuestoTotal > 0 ? newMarginAmount / baseMargin.presupuestoTotal : 0;
  const newStatus = marginStatus(newMarginPercent);
  const marginDelta = newMarginPercent - baseMargin.marginPercentActual;

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  if (submitted) {
    return (
      <SubmittedCard
        title="Gasto registrado en sesión"
        description={`${formatEUR(submitted.amount)} en ${categoryLabels[submitted.category]} para ${project.name}.`}
        primaryHref={`/verticals/construction/projects/${project.id}`}
        primaryLabel="Volver a la obra"
        secondaryHref={`/verticals/construction/projects/${project.id}/expenses/new`}
        secondaryLabel="Añadir otro gasto"
        details={
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Importe</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{formatEUR(submitted.amount)}</dd>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Proveedor</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-700">{submitted.supplier || "—"}</dd>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Categoría</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-700">{categoryLabels[submitted.category]}</dd>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Fecha</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-700">{submitted.date}</dd>
            </div>
          </dl>
        }
      />
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createExpense({
      projectId: project.id,
      category: state.category,
      provider: state.supplier || undefined,
      description: state.description,
      amount,
      vatRate,
      date: state.incurredAt,
      source: "manual",
      notes: state.notes || undefined
    });
    setSubmitted({
      category: state.category,
      supplier: state.supplier || undefined,
      amount,
      date: state.incurredAt
    });
    setState(initialState);
  };

  return (
    <div className="space-y-4">
      <SegmentedControl<Mode>
        value={mode}
        onChange={setMode}
        ariaLabel="Modo de captura"
        options={[
          { value: "manual", label: "Manual", icon: <PlusIcon className="h-4 w-4" /> },
          { value: "foto", label: "Foto", icon: <CameraIcon className="h-4 w-4" /> },
          { value: "voz", label: "Voz", icon: <MoreHorizontalIcon className="h-4 w-4" /> }
        ]}
      />

      {mode !== "manual" ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-card">
          <p className="text-sm font-semibold text-slate-700">{mode === "foto" ? "Captura por foto" : "Dictado por voz"}</p>
          <p className="mt-1 text-xs text-slate-500">Disponible más adelante con créditos IA.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
            <div className="rounded-xl bg-obra-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-obra-700">Obra asignada</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-950">{project.name}</p>
              <p className="text-xs text-slate-500">Presupuesto {formatEUR(baseMargin.presupuestoTotal)}</p>
            </div>

            <Field label="Categoría" htmlFor="category" required>
              <Select
                id="category"
                required
                value={state.category}
                onChange={e => handleChange("category", e.target.value as Category)}
              >
                {(Object.keys(categoryLabels) as Category[]).map(c => (
                  <option key={c} value={c}>{categoryLabels[c]}</option>
                ))}
              </Select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Proveedor" htmlFor="supplier">
                <Input
                  id="supplier"
                  value={state.supplier}
                  onChange={e => handleChange("supplier", e.target.value)}
                  placeholder="Leroy Merlín, Bricomart…"
                />
              </Field>
              <Field label="Fecha" htmlFor="incurredAt" required>
                <Input
                  id="incurredAt"
                  type="date"
                  required
                  value={state.incurredAt}
                  onChange={e => handleChange("incurredAt", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Descripción" htmlFor="description" required>
              <Input
                id="description"
                required
                value={state.description}
                onChange={e => handleChange("description", e.target.value)}
                placeholder="Cemento cola y rejilla"
              />
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

            <Field label="Observaciones" htmlFor="notes">
              <Textarea
                id="notes"
                rows={3}
                value={state.notes}
                onChange={e => handleChange("notes", e.target.value)}
                placeholder="Albarán, detalle…"
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
                Registrar gasto
              </button>
            </div>
          </div>

          <aside className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resumen del gasto</p>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex items-baseline justify-between">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Gasto total</dt>
                  <dd className="font-semibold tabular-nums text-slate-950">{formatEUR(amount)}</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">IVA ({formatPercent(vatRate)})</dt>
                  <dd className="font-medium tabular-nums text-slate-700">{formatEUR(vatAmount)}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Coste acumulado</dt>
                  <dd className="font-semibold tabular-nums text-slate-950">{formatEUR(newCostToDate)}</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Margen tras el gasto</dt>
                  <dd className="text-right">
                    <div className="font-semibold tabular-nums text-slate-950">{formatEUR(newMarginAmount)}</div>
                    <div className="mt-1 flex items-center justify-end gap-1.5">
                      <MarginPill percent={newMarginPercent} status={newStatus} hasPresupuesto={baseMargin.hasPresupuesto} />
                      {amount > 0 && baseMargin.hasPresupuesto ? (
                        <span className="text-[11px] font-medium tabular-nums text-slate-500">{formatPercent(marginDelta)}</span>
                      ) : null}
                    </div>
                  </dd>
                </div>
              </dl>

              {amount > 0 && baseMargin.hasPresupuesto && newStatus !== "healthy" ? (
                <div className={`mt-4 rounded-xl p-3 text-xs font-medium ${newStatus === "loss" ? "bg-rentable-riskBg text-rentable-risk" : "bg-rentable-pendingBg text-rentable-pending"}`}>
                  {newStatus === "loss"
                    ? "Tras este gasto la obra entra en pérdida."
                    : "Tras este gasto el margen baja del 20%."}
                </div>
              ) : null}
            </div>

            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Cálculo en vivo. Datos solo en esta sesión.
            </p>
          </aside>
        </form>
      )}
    </div>
  );
}
