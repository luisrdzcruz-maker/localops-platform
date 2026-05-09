"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ConstructionExpenseCategory } from "@/types/construction";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { MoneyField } from "@/components/ui/MoneyField";
import { Select } from "@/components/ui/Select";
import { formatEUR } from "@/lib/utils/money";
import {
  useObraStoreActions,
  useProjects,
  useTicket
} from "@/lib/store/sessionStore";
import { ChevronRightIcon, ReceiptIcon } from "./icons";

const CATEGORY_OPTIONS: { value: ConstructionExpenseCategory; label: string }[] = [
  { value: "material", label: "Material" },
  { value: "labor", label: "Mano de obra" },
  { value: "subcontract", label: "Subcontrata" },
  { value: "tool", label: "Herramienta / equipo" },
  { value: "transport", label: "Transporte / combustible" },
  { value: "other", label: "Otro" }
];

function toNumber(v: string): number {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function deriveVatRate(amount: number, vatAmount: number): number {
  if (!amount) return 0.21;
  const rate = vatAmount / amount;
  return Number.isFinite(rate) ? rate : 0.21;
}

interface FormState {
  projectId: string;
  provider: string;
  description: string;
  date: string;
  amount: string;
  vatRatePct: string;
  category: ConstructionExpenseCategory;
}

type ReviewPhase =
  | { type: "not_found" }
  | { type: "already_linked" }
  | { type: "rejected" }
  | { type: "form"; form: FormState }
  | { type: "converted"; expenseId: string; projectId: string; total: number }
  | { type: "rejected_now" };

export function TicketReviewView({ ticketId }: { ticketId: string }) {
  const ticket = useTicket(ticketId);
  const projects = useProjects();
  const { convertTicketToExpense, updateTicketStatus } = useObraStoreActions();
  const router = useRouter();

  const projectsById = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);

  const initialForm = useMemo<FormState>(() => {
    if (!ticket) return { projectId: "", provider: "", description: "", date: "", amount: "", vatRatePct: "21", category: "material" };
    const ef = ticket.extractedFields;
    const rawAmount = ef?.amount?.value ?? ticket.amount;
    const rawVatAmount = ef?.vatAmount?.value ?? ticket.vatAmount;
    const vatRatePct = Math.round(deriveVatRate(rawAmount, rawVatAmount) * 100);
    return {
      projectId: ticket.suggestedProjectId ?? ticket.projectId ?? "",
      provider: ef?.provider?.value ?? ticket.provider ?? "",
      description: ticket.provider ? `Compra en ${ticket.provider}` : "Gasto de ticket",
      date: ef?.date?.value ?? ticket.date,
      amount: rawAmount > 0 ? String(rawAmount) : "",
      vatRatePct: String(vatRatePct > 0 ? vatRatePct : 21),
      category: "material"
    };
  }, [ticket]);

  const [phase, setPhase] = useState<ReviewPhase>(() => {
    if (!ticket) return { type: "not_found" };
    if (ticket.status === "linked") return { type: "already_linked" };
    if (ticket.status === "rejected") return { type: "rejected" };
    return { type: "form", form: initialForm };
  });

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    if (phase.type !== "form") return;
    setPhase({ type: "form", form: { ...phase.form, [key]: value } });
  };

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase.type !== "form") return;
    const f = phase.form;
    const amount = toNumber(f.amount);
    const vatRate = toNumber(f.vatRatePct) / 100;
    const expense = convertTicketToExpense(ticketId, {
      projectId: f.projectId,
      category: f.category,
      description: f.description,
      amount,
      vatRate,
      date: f.date,
      provider: f.provider || undefined
    });
    if (!expense) return;
    router.refresh();
    setPhase({ type: "converted", expenseId: expense.id, projectId: expense.projectId, total: expense.total });
  };

  const handleReject = () => {
    updateTicketStatus(ticketId, "rejected");
    router.refresh();
    setPhase({ type: "rejected_now" });
  };

  if (phase.type === "not_found") {
    return (
      <div className="space-y-5">
        <Breadcrumb />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-slate-700">Ticket no encontrado.</p>
          <p className="mt-1 text-xs text-slate-500">Puede que haya expirado la sesión o el ID sea incorrecto.</p>
          <Link href="/verticals/construction/tickets" className="mt-4 inline-flex items-center rounded-xl bg-obra-500 px-4 py-2 text-sm font-semibold text-white hover:bg-obra-600">
            Volver a tickets
          </Link>
        </div>
      </div>
    );
  }

  if (phase.type === "already_linked") {
    const project = ticket?.projectId ? projectsById.get(ticket.projectId) : undefined;
    return (
      <div className="space-y-5">
        <Breadcrumb />
        <div className="rounded-2xl border border-rentable-healthyBg bg-rentable-healthyBg/20 p-6">
          <p className="text-sm font-semibold text-rentable-healthy">Este ticket ya fue convertido en gasto.</p>
          {project && (
            <p className="mt-1 text-xs text-slate-500">
              Asignado a{" "}
              <Link href={`/verticals/construction/projects/${project.id}`} className="font-medium text-obra-700 hover:underline">
                {project.name}
              </Link>
            </p>
          )}
          <Link href="/verticals/construction/tickets" className="mt-4 inline-flex items-center text-sm font-semibold text-obra-700 hover:underline">
            ← Volver a tickets
          </Link>
        </div>
      </div>
    );
  }

  if (phase.type === "rejected" || phase.type === "rejected_now") {
    return (
      <div className="space-y-5">
        <Breadcrumb />
        <div className="rounded-2xl border border-rentable-riskBg bg-rentable-riskBg/20 p-6">
          <p className="text-sm font-semibold text-rentable-risk">
            {phase.type === "rejected_now" ? "Ticket rechazado." : "Este ticket ya fue rechazado."}
          </p>
          <p className="mt-1 text-xs text-slate-500">No se ha registrado ningún gasto.</p>
          <Link href="/verticals/construction/tickets" className="mt-4 inline-flex items-center text-sm font-semibold text-obra-700 hover:underline">
            ← Volver a tickets
          </Link>
        </div>
      </div>
    );
  }

  if (phase.type === "converted") {
    const project = projectsById.get(phase.projectId);
    return (
      <div className="space-y-5">
        <Breadcrumb />
        <div className="rounded-2xl border border-rentable-healthyBg bg-white p-6 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rentable-healthy">Gasto registrado</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Ticket convertido en gasto</h2>
          <p className="mt-1 text-sm text-slate-500">
            {formatEUR(phase.total)} registrados correctamente en esta sesión.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project && (
              <Link
                href={`/verticals/construction/projects/${project.id}`}
                className="rounded-xl bg-obra-500 px-4 py-2 text-sm font-semibold text-white hover:bg-obra-600"
              >
                Ir a la obra
              </Link>
            )}
            <Link
              href="/verticals/construction/tickets"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              Volver a tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // phase.type === "form"
  const f = phase.form;
  const amount = toNumber(f.amount);
  const vatRate = toNumber(f.vatRatePct) / 100;
  const vatAmount = amount * vatRate;
  const total = amount + vatAmount;
  const canSubmit = f.projectId !== "" && f.description.trim() !== "" && amount > 0;
  const ef = ticket?.extractedFields;

  const lowConfidence = (ef?.amount?.confidence ?? 1) < 0.75 || (ef?.vatAmount?.confidence ?? 1) < 0.75;

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <Breadcrumb />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-obra-600">ObraRentable OS</p>
          <h1 className="mt-1 text-[1.625rem] font-bold leading-tight text-slate-950 sm:text-3xl">Revisar ticket</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Confirma los datos extraídos y conviértelo en un gasto registrado.
          </p>
        </div>
      </header>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <span className="font-semibold">OCR/IA simulado en este MVP.</span>{" "}
        Los datos han sido pre-rellenados desde los campos extraídos del ticket. Revisa y corrige antes de guardar.
        {lowConfidence && (
          <span className="ml-1 font-semibold text-amber-900">⚠ Algunos valores tienen baja confianza — verifica el importe.</span>
        )}
      </div>

      <form onSubmit={handleConvert} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
          <div className="flex items-center gap-3">
            <TicketThumb hue={ticket?.thumbnailHue} />
            <div>
              <p className="text-sm font-semibold text-slate-950">{ticket?.provider ?? "Proveedor sin identificar"}</p>
              <p className="text-xs text-slate-500">{ticket?.date}</p>
            </div>
          </div>

          <h2 className="text-base font-semibold text-slate-950">Datos del gasto</h2>

          <Field label="Obra" htmlFor="projectId" required>
            <Select
              id="projectId"
              required
              value={f.projectId}
              onChange={e => handleChange("projectId", e.target.value)}
            >
              <option value="">Selecciona una obra…</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Proveedor" htmlFor="provider">
            <Input
              id="provider"
              value={f.provider}
              onChange={e => handleChange("provider", e.target.value)}
              placeholder="Nombre del proveedor"
            />
          </Field>

          <Field label="Descripción" htmlFor="description" required>
            <Input
              id="description"
              required
              value={f.description}
              onChange={e => handleChange("description", e.target.value)}
              placeholder="¿Qué se compró o pagó?"
            />
          </Field>

          <Field label="Categoría" htmlFor="category" required>
            <Select
              id="category"
              required
              value={f.category}
              onChange={e => handleChange("category", e.target.value as ConstructionExpenseCategory)}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha" htmlFor="date" required>
              <Input
                id="date"
                type="date"
                required
                value={f.date}
                onChange={e => handleChange("date", e.target.value)}
              />
            </Field>
            <Field label="Importe sin IVA" htmlFor="amount" required>
              <MoneyField
                id="amount"
                required
                value={f.amount}
                onChange={e => handleChange("amount", e.target.value)}
                placeholder="0,00"
              />
            </Field>
          </div>

          <Field label="IVA" htmlFor="vatRatePct" hint="Porcentaje, por defecto 21%">
            <MoneyField
              id="vatRatePct"
              suffix="%"
              max={100}
              value={f.vatRatePct}
              onChange={e => handleChange("vatRatePct", e.target.value)}
              placeholder="21"
            />
          </Field>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleReject}
              className="rounded-xl border border-rentable-risk/30 bg-white px-4 py-2 text-sm font-semibold text-rentable-risk transition hover:bg-rentable-riskBg"
            >
              Rechazar ticket
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-obra-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-obra-600 disabled:opacity-60"
            >
              Convertir en gasto
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
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">IVA ({f.vatRatePct}%)</dt>
                <dd className="font-medium tabular-nums text-slate-700">{formatEUR(vatAmount)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Total gasto</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-950">{formatEUR(total)}</dd>
              </div>
            </dl>
          </div>
          {ef && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Datos originales del ticket</p>
              <dl className="mt-2 space-y-1 text-xs text-slate-600">
                {ef.provider && <div className="flex justify-between"><dt>Proveedor</dt><dd className="font-medium">{ef.provider.value} <span className="text-slate-400">({Math.round(ef.provider.confidence * 100)}%)</span></dd></div>}
                {ef.date && <div className="flex justify-between"><dt>Fecha</dt><dd className="font-medium">{ef.date.value} <span className="text-slate-400">({Math.round(ef.date.confidence * 100)}%)</span></dd></div>}
                {ef.amount && <div className="flex justify-between"><dt>Importe</dt><dd className={`font-medium tabular-nums ${ef.amount.confidence < 0.75 ? "text-amber-700" : ""}`}>{formatEUR(ef.amount.value)} <span className="text-slate-400">({Math.round(ef.amount.confidence * 100)}%)</span></dd></div>}
                {ef.vatAmount && <div className="flex justify-between"><dt>IVA</dt><dd className={`font-medium tabular-nums ${ef.vatAmount.confidence < 0.75 ? "text-amber-700" : ""}`}>{formatEUR(ef.vatAmount.value)} <span className="text-slate-400">({Math.round(ef.vatAmount.confidence * 100)}%)</span></dd></div>}
              </dl>
            </div>
          )}
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Sin factura automática en este MVP. Datos solo en esta sesión.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Breadcrumb() {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs font-medium text-slate-500">
      <Link href="/verticals/construction/tickets" className="hover:text-obra-700">Tickets</Link>
      <ChevronRightIcon className="h-3.5 w-3.5" />
      <span className="text-slate-700">Revisar ticket</span>
    </nav>
  );
}

function TicketThumb({ hue = 220 }: { hue?: number }) {
  const bg = `linear-gradient(135deg, hsl(${hue}, 60%, 92%) 0%, hsl(${(hue + 30) % 360}, 50%, 80%) 100%)`;
  return (
    <div
      aria-hidden
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-slate-500 ring-1 ring-inset ring-white/40"
      style={{ background: bg }}
    >
      <ReceiptIcon className="h-6 w-6" />
    </div>
  );
}
