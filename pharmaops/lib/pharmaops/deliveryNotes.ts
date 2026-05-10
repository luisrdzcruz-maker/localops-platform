/**
 * Delivery-notes read models. Pure functions over the in-memory store so a
 * future Supabase wiring can swap them for SQL aggregates without touching
 * UI code.
 */

import type { DeliveryNote } from "@/types/delivery-notes";

export interface DeliveryNoteMetrics {
  total: number;
  /** Albaranes still pending review. */
  pending: number;
  /** Albaranes whose review surfaced one or more issues. */
  withIssues: number;
  /** Albaranes waiting for the matching supplier invoice. */
  awaitingInvoice: number;
  /** Albaranes already matched to a supplier invoice. */
  matchedToInvoice: number;
  /** Closed albaranes (workflow finished). */
  closed: number;
  /** Sum of estimatedAmount for albaranes that still have no matched invoice. */
  estimatedAmountPendingInvoice: number;
}

export function computeDeliveryNoteMetrics(
  notes: DeliveryNote[]
): DeliveryNoteMetrics {
  let pending = 0;
  let withIssues = 0;
  let awaitingInvoice = 0;
  let matchedToInvoice = 0;
  let closed = 0;
  let estimatedAmountPendingInvoice = 0;

  for (const n of notes) {
    switch (n.status) {
      case "pendiente_revision":
        pending += 1;
        break;
      case "con_incidencias":
        withIssues += 1;
        break;
      case "pendiente_factura":
        awaitingInvoice += 1;
        break;
      case "revisado":
        // "revisado" without a linked invoice is still effectively awaiting.
        if (!n.relatedInvoiceNumber) awaitingInvoice += 1;
        break;
      case "asociado_factura":
        matchedToInvoice += 1;
        break;
      case "cerrado":
        closed += 1;
        break;
    }
    if (!n.relatedInvoiceNumber && typeof n.estimatedAmount === "number") {
      estimatedAmountPendingInvoice += n.estimatedAmount;
    }
  }

  return {
    total: notes.length,
    pending,
    withIssues,
    awaitingInvoice,
    matchedToInvoice,
    closed,
    estimatedAmountPendingInvoice:
      Math.round(estimatedAmountPendingInvoice * 100) / 100,
  };
}
