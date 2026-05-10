/**
 * Documents read models — derived counts for the dashboard summary card and
 * the documents page header. Pure functions, easy to swap for Supabase later.
 */

import type { DocumentRecord } from "@/types/documents";
import type { InvoiceExtractionProposal } from "@/lib/ocr/types";

export interface DocumentMetrics {
  total: number;
  pendingReview: number;
  invoicesPendingReview: number;
  readyForAccountant: number;
  extractionsPendingReview: number;
}

export function computeDocumentMetrics(
  documents: DocumentRecord[],
  extractions: InvoiceExtractionProposal[] = []
): DocumentMetrics {
  return {
    total: documents.length,
    pendingReview: documents.filter((d) => d.status === "pendiente_revisar")
      .length,
    invoicesPendingReview: documents.filter(
      (d) =>
        d.type === "factura_proveedor" && d.status === "pendiente_revisar"
    ).length,
    readyForAccountant: documents.filter(
      (d) => d.status === "listo_gestoria"
    ).length,
    extractionsPendingReview: extractions.filter(
      (e) => e.status === "needs_review" || e.status === "processing"
    ).length,
  };
}
