/**
 * Delivery notes (albaranes) domain.
 *
 * Pharmacies receive deliveries from distributors *before* the matching
 * invoice arrives. The albarán is the paper/digital slip the carrier hands
 * over with each delivery — it lists what was delivered and is the document
 * the team checks while unpacking boxes. Days or weeks later the supplier
 * sends the invoice that should match one or more albaranes.
 *
 * PharmaOps MVP scope:
 *   - Register albaranes manually so the team has a running log.
 *   - Track their status (pending review, reviewed, with issues, ...).
 *   - Track the reconciliation status with the supplier invoice.
 *   - Optionally capture the lines actually received and any incidencias.
 *
 * Out of scope for MVP:
 *   - Mutating official stock (PharmaOps never writes back to Unycop /
 *     Farmatic / Nixfarma).
 *   - Auto-reconciliation against invoices. The UI exposes a safe
 *     "Conciliar con factura" placeholder only.
 *   - Patient or prescription data of any kind.
 */

import type { PharmacyId } from "./pharmacy";

export type DeliveryNoteId = string;
export type DeliveryNoteLineId = string;

/* -------------------------------- Statuses -------------------------------- */

export type DeliveryNoteStatus =
  | "pendiente_revision"
  | "revisado"
  | "con_incidencias"
  | "pendiente_factura"
  | "asociado_factura"
  | "cerrado";

export const DELIVERY_NOTE_STATUSES: DeliveryNoteStatus[] = [
  "pendiente_revision",
  "revisado",
  "con_incidencias",
  "pendiente_factura",
  "asociado_factura",
  "cerrado",
];

export const DELIVERY_NOTE_STATUS_LABELS: Record<DeliveryNoteStatus, string> = {
  pendiente_revision: "Pendiente de revisión",
  revisado: "Revisado",
  con_incidencias: "Con incidencias",
  pendiente_factura: "Pendiente de factura",
  asociado_factura: "Asociado a factura",
  cerrado: "Cerrado",
};

/** Status reflecting the relationship with the matching supplier invoice. */
export type DeliveryNoteReconciliationStatus =
  | "sin_factura"
  | "pendiente_conciliar"
  | "cuadra"
  | "diferencias_menores"
  | "diferencias_importantes";

export const DELIVERY_NOTE_RECONCILIATION_STATUSES: DeliveryNoteReconciliationStatus[] = [
  "sin_factura",
  "pendiente_conciliar",
  "cuadra",
  "diferencias_menores",
  "diferencias_importantes",
];

export const DELIVERY_NOTE_RECONCILIATION_LABELS: Record<
  DeliveryNoteReconciliationStatus,
  string
> = {
  sin_factura: "Sin factura",
  pendiente_conciliar: "Pendiente de conciliar",
  cuadra: "Cuadra",
  diferencias_menores: "Diferencias menores",
  diferencias_importantes: "Diferencias importantes",
};

/* --------------------------------- Issues --------------------------------- */

export type DeliveryNoteIssueType =
  | "falta_producto"
  | "cantidad_incorrecta"
  | "producto_danado"
  | "caducidad_corta"
  | "precio_dudoso"
  | "sustitucion"
  | "otro";

export const DELIVERY_NOTE_ISSUE_TYPES: DeliveryNoteIssueType[] = [
  "falta_producto",
  "cantidad_incorrecta",
  "producto_danado",
  "caducidad_corta",
  "precio_dudoso",
  "sustitucion",
  "otro",
];

export const DELIVERY_NOTE_ISSUE_LABELS: Record<DeliveryNoteIssueType, string> = {
  falta_producto: "Falta producto",
  cantidad_incorrecta: "Cantidad incorrecta",
  producto_danado: "Producto dañado",
  caducidad_corta: "Caducidad corta",
  precio_dudoso: "Precio dudoso",
  sustitucion: "Sustitución",
  otro: "Otro",
};

/* --------------------------------- Entities ------------------------------- */

export interface DeliveryNote {
  id: DeliveryNoteId;
  pharmacyId: PharmacyId;
  supplierName: string;
  deliveryNoteNumber: string;
  /** Date the goods were delivered (ISO yyyy-MM-dd). */
  deliveryDate: string;
  /** When the albarán was registered into PharmaOps (ISO timestamp). */
  registeredAt: string;
  status: DeliveryNoteStatus;
  reconciliationStatus: DeliveryNoteReconciliationStatus;
  /** Total estimated by the pharmacy when the invoice has not yet arrived. */
  estimatedAmount: number | null;
  /** Number of boxes / parcels received with this delivery note. */
  packageCount: number | null;
  /** Linked invoice number when reconciled. null while no invoice is matched. */
  relatedInvoiceNumber: string | null;
  notes: string | null;
  /**
   * Optional pointer to the DocumentRecord that uploaded the original PDF/photo
   * of the albarán. null if the albarán was registered without an attachment.
   */
  sourceDocumentId: string | null;
}

export interface DeliveryNoteLine {
  id: DeliveryNoteLineId;
  deliveryNoteId: DeliveryNoteId;
  productCode: string | null;
  cnCode: string | null;
  productName: string;
  /** Quantity originally ordered, if the team has that info handy. */
  orderedQuantity: number | null;
  receivedQuantity: number;
  /** Quantity actually accepted (received minus damaged / wrong / returns). */
  acceptedQuantity: number | null;
  issueType: DeliveryNoteIssueType | null;
  notes: string | null;
}
