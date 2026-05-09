"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { MoneyField } from "@/components/ui/MoneyField";
import { formatEUR, formatPercent } from "@/lib/utils/money";
import { marginStatus } from "@/lib/construction/obraMath";
import { useContacts, useObraStoreActions } from "@/lib/store/sessionStore";
import { MarginPill } from "../MarginPill";

const obraTypes = [
  "Reforma integral",
  "Baño",
  "Cocina",
  "Pintura",
  "Albañilería",
  "Instalación eléctrica",
  "Fontanería",
  "Otro"
];

const NEW_CLIENT = "__new__";

interface FormState {
  contactId: string;
  newClientName: string;
  name: string;
  address: string;
  obraType: string;
  presupuestoTotal: string;
  presupuestoVatRate: string;
  estimatedMaterialCost: string;
  estimatedLaborCost: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const initialState: FormState = {
  contactId: "",
  newClientName: "",
  name: "",
  address: "",
  obraType: obraTypes[0],
  presupuestoTotal: "",
  presupuestoVatRate: "21",
  estimatedMaterialCost: "",
  estimatedLaborCost: "",
  startDate: "",
  endDate: "",
  notes: ""
};

function toNumber(value: string): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ProjectForm() {
  const router = useRouter();
  const allContacts = useContacts();
  const clientContacts = useMemo(
    () => allContacts.filter(c => c.type === "client" || c.type === "lead"),
    [allContacts]
  );
  const { createContact, createProject } = useObraStoreActions();
  const [state, setState] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);

  const presupuesto = toNumber(state.presupuestoTotal);
  const materialCost = toNumber(state.estimatedMaterialCost);
  const laborCost = toNumber(state.estimatedLaborCost);
  const totalCost = materialCost + laborCost;
  const marginAmount = presupuesto - totalCost;
  const marginPercent = presupuesto > 0 ? marginAmount / presupuesto : 0;
  const status = marginStatus(marginPercent);
  const showMargin = presupuesto > 0;
  const lowMargin = showMargin && status !== "healthy";

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const clientName = useMemo(() => {
    if (state.contactId === NEW_CLIENT) return state.newClientName.trim();
    return clientContacts.find(c => c.id === state.contactId)?.name ?? "";
  }, [clientContacts, state.contactId, state.newClientName]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    let contactId = state.contactId;
    if (contactId === NEW_CLIENT) {
      const trimmed = state.newClientName.trim();
      if (!trimmed) {
        setSubmitting(false);
        return;
      }
      const created = createContact({ name: trimmed, type: "client" });
      contactId = created.id;
    }

    const vatRate = toNumber(state.presupuestoVatRate);
    const project = createProject({
      contactId,
      name: state.name,
      address: state.address || undefined,
      obraType: state.obraType,
      presupuestoTotal: presupuesto,
      presupuestoVatRate: vatRate > 0 ? vatRate / 100 : undefined,
      estimatedMaterialCost: materialCost,
      estimatedLaborCost: laborCost,
      startDate: state.startDate || undefined,
      endDate: state.endDate || undefined,
      notes: state.notes || undefined
    });

    router.push(`/verticals/construction/projects/${project.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
        <h2 className="text-base font-semibold text-slate-950">Datos de la obra</h2>

        <Field label="Cliente" htmlFor="contactId" required>
          <Select
            id="contactId"
            required
            value={state.contactId}
            onChange={e => handleChange("contactId", e.target.value)}
          >
            <option value="" disabled>Selecciona un cliente</option>
            {clientContacts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value={NEW_CLIENT}>+ Nuevo cliente…</option>
          </Select>
        </Field>

        {state.contactId === NEW_CLIENT ? (
          <Field label="Nombre del cliente nuevo" htmlFor="newClientName" required>
            <Input
              id="newClientName"
              required
              value={state.newClientName}
              onChange={e => handleChange("newClientName", e.target.value)}
              placeholder="Ej. Comunidad de propietarios Alameda 14"
            />
          </Field>
        ) : null}

        <Field label="Nombre de la obra" htmlFor="name" required>
          <Input
            id="name"
            required
            value={state.name}
            onChange={e => handleChange("name", e.target.value)}
            placeholder="Reforma baño principal"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Dirección" htmlFor="address">
            <Input
              id="address"
              value={state.address}
              onChange={e => handleChange("address", e.target.value)}
              placeholder="Calle, número, ciudad"
            />
          </Field>

          <Field label="Tipo de obra" htmlFor="obraType">
            <Select
              id="obraType"
              value={state.obraType}
              onChange={e => handleChange("obraType", e.target.value)}
            >
              {obraTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Presupuesto total" htmlFor="presupuestoTotal" hint="Importe acordado con el cliente, sin IVA" required>
            <MoneyField
              id="presupuestoTotal"
              required
              value={state.presupuestoTotal}
              onChange={e => handleChange("presupuestoTotal", e.target.value)}
              placeholder="0,00"
            />
          </Field>
          <Field label="IVA presupuesto" htmlFor="presupuestoVatRate" hint="Por defecto 21%">
            <MoneyField
              id="presupuestoVatRate"
              suffix="%"
              max={100}
              value={state.presupuestoVatRate}
              onChange={e => handleChange("presupuestoVatRate", e.target.value)}
              placeholder="21"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Coste material estimado" htmlFor="estimatedMaterialCost">
            <MoneyField
              id="estimatedMaterialCost"
              value={state.estimatedMaterialCost}
              onChange={e => handleChange("estimatedMaterialCost", e.target.value)}
              placeholder="0,00"
            />
          </Field>
          <Field label="Coste mano de obra estimado" htmlFor="estimatedLaborCost">
            <MoneyField
              id="estimatedLaborCost"
              value={state.estimatedLaborCost}
              onChange={e => handleChange("estimatedLaborCost", e.target.value)}
              placeholder="0,00"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha inicio" htmlFor="startDate">
            <Input
              id="startDate"
              type="date"
              value={state.startDate}
              onChange={e => handleChange("startDate", e.target.value)}
            />
          </Field>
          <Field label="Fecha fin (opcional)" htmlFor="endDate">
            <Input
              id="endDate"
              type="date"
              value={state.endDate}
              onChange={e => handleChange("endDate", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Notas" htmlFor="notes">
          <Textarea
            id="notes"
            rows={3}
            value={state.notes}
            onChange={e => handleChange("notes", e.target.value)}
            placeholder="Detalles, materiales especiales, condiciones de pago…"
          />
        </Field>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setState(initialState)}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:opacity-60"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-obra-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-obra-600 disabled:opacity-60"
          >
            {submitting ? "Creando…" : "Crear obra"}
          </button>
        </div>
      </div>

      <aside className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vista previa</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{state.name || "Nueva obra"}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{clientName || "Sin cliente"}{state.address ? ` · ${state.address}` : ""}</p>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Presupuesto</dt>
              <dd className="font-semibold tabular-nums text-slate-950">{formatEUR(presupuesto)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Coste estimado</dt>
              <dd className="font-semibold tabular-nums text-slate-700">{formatEUR(totalCost)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Margen estimado</dt>
              <dd className="text-right">
                <div className="font-semibold tabular-nums text-slate-950">{formatEUR(marginAmount)}</div>
                <div className="mt-1">
                  <MarginPill percent={marginPercent} status={status} hasPresupuesto={showMargin} />
                </div>
              </dd>
            </div>
          </dl>

          {lowMargin ? (
            <div className="mt-4 rounded-xl bg-rentable-pendingBg p-3 text-xs font-medium text-rentable-pending">
              Margen por debajo del 20%. Revisa coste estimado o sube el presupuesto.
            </div>
          ) : null}
          {status === "loss" && showMargin ? (
            <div className="mt-2 rounded-xl bg-rentable-riskBg p-3 text-xs font-medium text-rentable-risk">
              Esta obra entraría en pérdida con los datos actuales.
            </div>
          ) : null}
          {showMargin ? (
            <p className="mt-3 text-[11px] text-slate-500">
              Tras crearla irás directamente al detalle de la obra.
            </p>
          ) : null}
        </div>

        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Vista previa en vivo. Datos solo en esta sesión.
        </p>
      </aside>
    </form>
  );
}
