/**
 * Documents domain — facturas, tickets, albaranes y documentos para gestoría.
 *
 * MVP scope: PharmaOps records the *metadata* of a document (filename, size,
 * supplier, status). The actual file blob is NOT persisted — the demo runs
 * fully in-memory and there is no storage backend. Comments and copy in the
 * UI must reflect this so users do not assume OCR or invoice automation.
 */

import type { PharmacyId } from "./pharmacy";

export type DocumentId = string;

export type DocumentType =
  | "factura_proveedor"
  | "ticket_gasto"
  | "albaran"
  | "documento_gestoria";

export const DOCUMENT_TYPES: DocumentType[] = [
  "factura_proveedor",
  "ticket_gasto",
  "albaran",
  "documento_gestoria",
];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  factura_proveedor: "Factura proveedor",
  ticket_gasto: "Ticket gasto",
  albaran: "Albarán",
  documento_gestoria: "Documento gestoría",
};

export type DocumentStatus =
  | "pendiente_revisar"
  | "revisado"
  | "asociado_gasto"
  | "listo_gestoria";

export const DOCUMENT_STATUSES: DocumentStatus[] = [
  "pendiente_revisar",
  "revisado",
  "asociado_gasto",
  "listo_gestoria",
];

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  pendiente_revisar: "Pendiente de revisar",
  revisado: "Revisado",
  asociado_gasto: "Asociado a gasto",
  listo_gestoria: "Listo para gestoría",
};

/** Where the document came into PharmaOps. */
export type DocumentSource =
  | "subida_manual"
  | "camara_movil"
  | "email"
  | "demo_seed";

export const DOCUMENT_SOURCE_LABELS: Record<DocumentSource, string> = {
  subida_manual: "Subida manual",
  camara_movil: "Cámara móvil",
  email: "Email",
  demo_seed: "Datos demo",
};

export interface DocumentRecord {
  id: DocumentId;
  pharmacyId: PharmacyId;
  date: string;
  type: DocumentType;
  supplierName: string | null;
  category: string | null;
  status: DocumentStatus;
  /** Estimated invoice/ticket amount when known. null until reviewed. */
  estimatedAmount: number | null;
  source: DocumentSource;
  /** Original filename of the uploaded file. */
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  notes: string | null;
  createdAt: string;
}
