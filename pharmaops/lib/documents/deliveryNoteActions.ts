"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { appendDeliveryNote, updateDeliveryNoteStatus } from "@/lib/demo/store";
import { DEMO_PHARMACY } from "@/lib/demo/session";
import {
  DELIVERY_NOTE_STATUSES,
  type DeliveryNote,
  type DeliveryNoteStatus,
} from "@/types/delivery-notes";

const registerSchema = z.object({
  supplierName: z.string().min(2, "Proveedor obligatorio").max(120),
  deliveryNoteNumber: z
    .string()
    .min(1, "Número de albarán obligatorio")
    .max(60),
  deliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha en formato AAAA-MM-DD"),
  status: z.enum(
    DELIVERY_NOTE_STATUSES as unknown as [
      DeliveryNoteStatus,
      ...DeliveryNoteStatus[]
    ]
  ),
  estimatedAmount: z
    .number({ invalid_type_error: "Importe inválido" })
    .nonnegative()
    .max(1_000_000)
    .nullable()
    .optional(),
  packageCount: z
    .number({ invalid_type_error: "Bultos inválidos" })
    .int()
    .min(0)
    .max(999)
    .nullable()
    .optional(),
  notes: z.string().max(500).nullable().optional(),
  sourceDocumentId: z.string().min(1).max(128).nullable().optional(),
});

export interface RegisterDeliveryNoteResult {
  ok: true;
  id: string;
}

/**
 * Append a manually-registered albarán to the demo store. No external calls,
 * no file uploads. Reconciliation status starts at "pendiente_conciliar"
 * unless the operator picked the "cerrado" status, which implies the
 * workflow is complete.
 */
export async function registerDeliveryNoteAction(
  input: unknown
): Promise<RegisterDeliveryNoteResult> {
  const parsed = registerSchema.parse(input);
  const now = new Date().toISOString();
  const status = parsed.status as DeliveryNoteStatus;

  const note: DeliveryNote = {
    id: `alb-manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    pharmacyId: DEMO_PHARMACY.id,
    supplierName: parsed.supplierName.trim(),
    deliveryNoteNumber: parsed.deliveryNoteNumber.trim(),
    deliveryDate: parsed.deliveryDate,
    registeredAt: now,
    status,
    reconciliationStatus:
      status === "cerrado" ? "cuadra" : "pendiente_conciliar",
    estimatedAmount: parsed.estimatedAmount ?? null,
    packageCount: parsed.packageCount ?? null,
    relatedInvoiceNumber: null,
    notes: parsed.notes?.trim() || null,
    sourceDocumentId: parsed.sourceDocumentId ?? null,
  };

  appendDeliveryNote(note);
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { ok: true, id: note.id };
}

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(
    DELIVERY_NOTE_STATUSES as unknown as [
      DeliveryNoteStatus,
      ...DeliveryNoteStatus[]
    ]
  ),
});

export async function updateDeliveryNoteStatusAction(
  input: unknown
): Promise<{ ok: true }> {
  const parsed = statusSchema.parse(input);
  updateDeliveryNoteStatus(parsed.id, parsed.status as DeliveryNoteStatus);
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { ok: true };
}
