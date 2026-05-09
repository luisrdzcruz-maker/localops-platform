"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { IssuedInvoiceStatus } from "@/types/construction";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { MoneyField } from "@/components/ui/MoneyField";
import { formatEUR, formatPercent } from "@/lib/utils/money";
import {
  useContacts,
  useInvoices,
  useObraStoreActions,
  useProjects
} from "@/lib/store/sessionStore";
import { invoiceStatusLabels } from "../InvoiceStatusBadge";
import { SubmittedCard } from "./SubmittedCard";

const statusOrder: IssuedInvoiceStatus[] = ["draft", "issued", "sent", "paid", "overdue", "cancelled"];

interface FormState {
  projectId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  concept: string;
  subtotal: string;
  vatRate: string;
  status: IssuedInvoiceStatus;
  notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function suggestNextInvoiceNumber(existing: string[], year: number): string {
  const prefix = `INV-${year}-`;
  let max = 0;
  for (const number of existing) {
    if (!number.startsWith(prefix)) continue;
    const n = parseInt(number.slice(prefix.length), 10);
    if (Number.isFinite(n)) max = Math.max(max, n);
  }
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

function toNumber(value: string): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

interface SubmittedSummary {
  invoiceNumber: string;
  total: number;
  status: IssuedInvoiceStatus;
  projectId: string;
}

export function InvoiceForm({ defaultProjectId }: { defaultProjectId?: string }) {
  const router = useRouter();
  const projects = useProjects();
  const contacts = useContacts();
  const invoices = useInvoices();
  const { createInvoice } = useObraStoreActions();

  const issuedAt = today();
  const initialState: FormState = useMemo(
    () => ({
      projectId: defaultProjectId ?? "",
      invoiceNumber: suggestNextInvoiceNumber(
        invoices.map(i => i.invoiceNumber),
        new Date().getFullYear()
      ),
      issueDate: issuedAt,
      dueDate: addDays(issuedAt, 30),
      concept: "",
      subtotal: "",
      vatRate: "21",
      status: "draft",
      notes: ""
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [state, setState] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState<SubmittedSummary | null>(null);

  useEffect(() => {
    if (!state.dueDate && state.issueDate) {
      setState(prev => ({ ...prev, dueDate: addDays(prev.issueDate, 30) }));
    }
  }, [state.issueDate, state.dueDate]);

  const project = useMemo(() => projects.find(p => p.id === state.projectId), [projects, state.projectId]);
  const contact = useMemo(() => contacts.find(c => c.id === project?.contactId), [contacts, project]);
  const clientName = contact?.name ?? "—";

  const subtotal = toNumber(state.subtotal);
  const vatRate = toNumber(state.vatRate) / 100;
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;
  const pending = state.status === "paid" ? 0 : total;

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  if (submitted) {
    return (
      <SubmittedCard
        title="Factura registrada en sesión"
        description={`${submitted.invoiceNumber} · ${formatEUR(submitted.total)} · ${invoiceStatusLabels[submitted.status]}`}
        primaryHref="/verticals/construction/invoices"
        primaryLabel="Ver facturas"
        secondaryHref={`/verticals/construction/projects/${submitted.projectId}`}
        secondaryLabel="Ir a la obra"
        details={
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Total</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{formatEUR(submitted.total)}</dd>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">Estado</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-700">{invoiceStatusLabels[submitted.status]}</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-medium uppercase tracking-wide text-slate-500">Número</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-700">{submitted.invoiceNumber}</dd>
            </div>
          </dl>
        }
      />
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project || !contact) return;
    const created = createInvoice({
      projectId: project.id,
      contactId: contact.id,
      invoiceNumber: state.invoiceNumber,
      issueDate: state.issueDate,
      dueDate: state.dueDate,
      status: state.status,
      concept: state.concept,
      subtotal,
      vatRate,
      notes: state.notes || undefined
    });
    setSubmitted({
      invoiceNumber: created.invoiceNumber,
      total: created.total,
      status: created.status,
      projectId: created.projectId
    });
    router.refresh();
  };

  const canSubmit =
    state.projectId !== "" &&
    state.invoiceNumber.trim() !== "" &&
    state.issueDate !== "" &&
    state.dueDate !== "" &&
    state.concept.trim() !== "" &&
    subtotal > 0;

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
        <h2 className="text-base font-semibold text-slate-950">Datos de la factura</h2>

        <Field label="Obra / trabajo" htmlFor="projectId" required>
          <Select
            id="projectId"
            required
            value={state.projectId}
            onChange={e => handleChange("projectId", e.target.value)}
          >
            <option value="" disabled>Selecciona la obra</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Cliente" hint={project ? "Cliente asociado a la obra seleccionada." : "Selecciona una obra para cargar el cliente."}>
          <Input value={clientName} disabled readOnly />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Número de factura" htmlFor="invoiceNumber" required>
            <Input
              id="invoiceNumber"
              required
              value={state.invoiceNumber}
              onChange={e => handleChange("invoiceNumber", e.target.value)}
              placeholder="INV-2026-009"
            />
          </Field>
          <Field label="Estado" htmlFor="status" required>
            <Select
              id="status"
              required
              value={state.status}
              onChange={e => handleChange("status", e.target.value as IssuedInvoiceStatus)}
            >
              {statusOrder.map(s => (
                <option key={s} value={s}>{invoiceStatusLabels[s]}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha de emisión" htmlFor="issueDate" required>
            <Input
              id="issueDate"
              type="date"
              required
              value={state.issueDate}
              onChange={e => handleChange("issueDate", e.target.value)}
            />
          </Field>
          <Field label="Fecha de vencimiento" htmlFor="dueDate" required hint="Por defecto 30 días después de la emisión.">
            <Input
              id="dueDate"
              type="date"
              required
              value={state.dueDate}
              onChange={e => handleChange("dueDate", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Concepto" htmlFor="concept" required>
          <Input
            id="concept"
            required
            value={state.concept}
            onChange={e => handleChange("concept", e.target.value)}
            placeholder="Avance 50% · Fontanería e instalación"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Base imponible" htmlFor="subtotal" required>
            <MoneyField
              id="subtotal"
              required
              value={state.subtotal}
              onChange={e => handleChange("subtotal", e.target.value)}
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

        <Field label="Notas" htmlFor="notes">
          <Textarea
            id="notes"
            rows={3}
            value={state.notes}
            onChange={e => handleChange("notes", e.target.value)}
            placeholder="Detalles internos, referencia, condiciones…"
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
            Emitir factura
          </button>
        </div>
      </div>

      <aside className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Resumen</p>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Base imponible</dt>
              <dd className="font-semibold tabular-nums text-slate-950">{formatEUR(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">IVA ({formatPercent(vatRate)})</dt>
              <dd className="font-medium tabular-nums text-slate-700">{formatEUR(vatAmount)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Total factura</dt>
              <dd className="text-lg font-semibold tabular-nums text-slate-950">{formatEUR(total)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Pendiente de cobro</dt>
              <dd className={`font-semibold tabular-nums ${pending > 0 ? "text-rentable-pending" : "text-rentable-healthy"}`}>{formatEUR(pending)}</dd>
            </div>
          </dl>
        </div>

        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Sin PDF real ni envío automático en este MVP. Datos solo en esta sesión.
        </p>
      </aside>
    </form>
  );
}
