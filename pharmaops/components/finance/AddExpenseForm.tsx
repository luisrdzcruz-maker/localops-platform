"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { addExpenseAction } from "@/lib/finance/actions";
import {
  ACCOUNTING_CATEGORIES,
  ACCOUNTING_CATEGORY_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  type AccountingCategory,
  type PaymentStatus,
} from "@/types/finance";

const today = () => new Date().toISOString().slice(0, 10);

export function AddExpenseForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [date, setDate] = useState(today());
  const [vendor, setVendor] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AccountingCategory>("other");
  const [net, setNet] = useState<string>("");
  const [vat, setVat] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("transfer");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [notes, setNotes] = useState("");

  function reset() {
    setDate(today());
    setVendor("");
    setDescription("");
    setCategory("other");
    setNet("");
    setVat("");
    setPaymentMethod("transfer");
    setPaymentStatus("paid");
    setNotes("");
    setError(null);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const netNum = Number(net);
    const vatNum = Number(vat);
    if (!Number.isFinite(netNum) || !Number.isFinite(vatNum)) {
      setError("Importes no válidos.");
      return;
    }
    startTransition(async () => {
      try {
        await addExpenseAction({
          date,
          vendor,
          description,
          category,
          netAmount: netNum,
          vatAmount: vatNum,
          grossAmount: Math.round((netNum + vatNum) * 100) / 100,
          paymentMethod,
          paymentStatus,
          notes: notes || null,
        });
        setSuccess("Gasto añadido. Las cifras se han actualizado.");
        reset();
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar.");
      }
    });
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-2">
        {success ? (
          <Alert tone="ok" title="Gasto añadido">
            {success}
          </Alert>
        ) : null}
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Añadir gasto manual
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 rounded-xl border border-ink-200 bg-white p-4 md:grid-cols-2"
    >
      <div className="md:col-span-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-ink-900">Nuevo gasto</h4>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
        >
          Cancelar
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">Fecha</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="vendor">Emisor / proveedor</Label>
        <Input
          id="vendor"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          required
        />
      </div>

      <div className="md:col-span-2 flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Categoría</Label>
        <Select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as AccountingCategory)}
        >
          {ACCOUNTING_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {ACCOUNTING_CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="paymentStatus">Estado pago</Label>
        <Select
          id="paymentStatus"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="net">Base imponible (€)</Label>
        <Input
          id="net"
          inputMode="decimal"
          value={net}
          onChange={(e) => setNet(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="vat">IVA (€)</Label>
        <Input
          id="vat"
          inputMode="decimal"
          value={vat}
          onChange={(e) => setVat(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="paymentMethod">Forma de pago</Label>
        <Select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="transfer">Transferencia</option>
          <option value="card">Tarjeta</option>
          <option value="cash">Efectivo</option>
          <option value="financing">Financiación</option>
          <option value="other">Otro</option>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error ? (
        <div className="md:col-span-2">
          <Alert tone="danger" title="Error">
            {error}
          </Alert>
        </div>
      ) : null}

      <div className="md:col-span-2 flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Guardar gasto"}
        </Button>
      </div>
    </form>
  );
}
