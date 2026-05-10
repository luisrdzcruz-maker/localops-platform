"use client";

import { Plus, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { registerDeliveryNoteAction } from "@/lib/documents/deliveryNoteActions";
import {
  DELIVERY_NOTE_STATUSES,
  DELIVERY_NOTE_STATUS_LABELS,
  type DeliveryNoteStatus,
} from "@/types/delivery-notes";

/** Local form shape — kept in component state, not posted as FormData. */
interface FormShape {
  supplierName: string;
  deliveryNoteNumber: string;
  deliveryDate: string;
  status: DeliveryNoteStatus;
  estimatedAmount: string;
  packageCount: string;
  notes: string;
}

const TODAY_ISO = (): string => new Date().toISOString().slice(0, 10);

function emptyForm(): FormShape {
  return {
    supplierName: "",
    deliveryNoteNumber: "",
    deliveryDate: TODAY_ISO(),
    status: "pendiente_revision",
    estimatedAmount: "",
    packageCount: "",
    notes: "",
  };
}

/**
 * Inline form for registering an albarán manually. Toggles open/closed
 * locally so the section stays compact when nothing is being entered.
 *
 * Submits via the `registerDeliveryNoteAction` Server Action. No external
 * services are called.
 */
export function RegisterDeliveryNoteForm() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<FormShape>(emptyForm);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  const update = (patch: Partial<FormShape>) => {
    setForm((f) => ({ ...f, ...patch }));
  };

  const reset = () => {
    setForm(emptyForm());
    setError(null);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsedAmount =
      form.estimatedAmount.trim() === ""
        ? null
        : Number(form.estimatedAmount.replace(",", "."));
    const parsedPackages =
      form.packageCount.trim() === "" ? null : Number(form.packageCount);

    if (parsedAmount !== null && Number.isNaN(parsedAmount)) {
      setError("Importe estimado no es un número válido.");
      return;
    }
    if (parsedPackages !== null && !Number.isFinite(parsedPackages)) {
      setError("Número de bultos no es válido.");
      return;
    }

    startTransition(async () => {
      try {
        await registerDeliveryNoteAction({
          supplierName: form.supplierName,
          deliveryNoteNumber: form.deliveryNoteNumber,
          deliveryDate: form.deliveryDate,
          status: form.status,
          estimatedAmount: parsedAmount,
          packageCount: parsedPackages,
          notes: form.notes.trim() === "" ? null : form.notes,
        });
        reset();
        setOpen(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No hemos podido guardar el albarán.";
        setError(message);
      }
    });
  };

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="primary"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Registrar albarán
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-xl border border-ink-200 bg-white p-4 shadow-card"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink-900">
          Registrar albarán
        </h3>
        <button
          type="button"
          aria-label="Cerrar"
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-700"
          onClick={() => {
            setOpen(false);
            reset();
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="alb-supplier">Proveedor</Label>
          <Input
            id="alb-supplier"
            required
            maxLength={120}
            value={form.supplierName}
            onChange={(e) => update({ supplierName: e.target.value })}
            placeholder="Ej. Cooperativa Farmacéutica Demo"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="alb-number">Nº albarán</Label>
          <Input
            id="alb-number"
            required
            maxLength={60}
            value={form.deliveryNoteNumber}
            onChange={(e) => update({ deliveryNoteNumber: e.target.value })}
            placeholder="Ej. ALB-2026-04219"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="alb-date">Fecha de entrega</Label>
          <Input
            id="alb-date"
            type="date"
            required
            value={form.deliveryDate}
            onChange={(e) => update({ deliveryDate: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="alb-status">Estado</Label>
          <Select
            id="alb-status"
            value={form.status}
            onChange={(e) => update({ status: e.target.value as DeliveryNoteStatus })}
          >
            {DELIVERY_NOTE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {DELIVERY_NOTE_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="alb-amount">Importe estimado (€)</Label>
          <Input
            id="alb-amount"
            inputMode="decimal"
            value={form.estimatedAmount}
            onChange={(e) => update({ estimatedAmount: e.target.value })}
            placeholder="Opcional"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="alb-packages">Bultos</Label>
          <Input
            id="alb-packages"
            inputMode="numeric"
            value={form.packageCount}
            onChange={(e) => update({ packageCount: e.target.value })}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="alb-notes">Observaciones</Label>
        <Textarea
          id="alb-notes"
          maxLength={500}
          value={form.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Opcional. Incidencias detectadas, referencias afectadas, etc."
        />
      </div>

      {error ? (
        <p className="text-xs text-status-danger">{error}</p>
      ) : null}

      <p className="text-[11px] leading-relaxed text-ink-500">
        El albarán queda guardado en el almacén demo de PharmaOps. No se
        modifica el stock oficial de tu sistema de farmacia ni se sube ningún
        fichero a un servicio externo.
      </p>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? "Guardando…" : "Guardar albarán"}
        </Button>
      </div>
    </form>
  );
}
