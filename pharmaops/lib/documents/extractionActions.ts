"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  getDocumentExtraction,
  saveDocumentExtraction,
  updateDocumentExtractionStatus,
} from "@/lib/demo/store";
import { getDemoState } from "@/lib/demo/store";
import { extractInvoiceWithFallback, resolveOcrProvider } from "@/lib/ocr/provider";
import type {
  ExtractionStatus,
  InvoiceExtractionProposal,
  OcrProviderId,
} from "@/lib/ocr/types";

const idSchema = z.object({ documentId: z.string().min(1) });
const statusSchema = z.object({
  documentId: z.string().min(1),
  status: z.enum([
    "not_started",
    "processing",
    "needs_review",
    "failed",
    "confirmed",
  ]),
});

export interface ExtractActionResult {
  ok: true;
  proposal: InvoiceExtractionProposal;
  provider: OcrProviderId;
  fellBackToMock: boolean;
  reason: string;
}

/**
 * Run OCR extraction for a single document.
 *
 * Behaviour:
 *   - Resolves the OCR provider via OCR_PROVIDER env (with mock fallback).
 *   - In current MVP intake we only have metadata, not file bytes — so the
 *     mock provider runs even when OCR_PROVIDER=azure, with a clear "fell
 *     back to mock" reason and a warning baked into the proposal.
 *   - Persists the proposal to the demo store and revalidates the
 *     /documents and /dashboard routes.
 *   - Never creates an Expense / PurchaseInvoice. Confirmation of the
 *     proposal into finance is a future slice.
 */
export async function extractDocumentInvoiceAction(
  input: unknown
): Promise<ExtractActionResult> {
  const { documentId } = idSchema.parse(input);
  const state = getDemoState();
  const document = state.documents.find((d) => d.id === documentId);
  if (!document) {
    throw new Error(`Documento no encontrado: ${documentId}`);
  }

  const { proposal, resolution } = await extractInvoiceWithFallback({
    documentId,
    fileName: document.fileName ?? undefined,
    mimeType: document.mimeType ?? undefined,
    demoMetadata: {
      supplierName: document.supplierName,
      date: document.date,
      estimatedAmount: document.estimatedAmount,
      type: document.type,
      category: document.category,
    },
  });

  saveDocumentExtraction(proposal);
  revalidatePath("/documents");
  revalidatePath("/dashboard");

  return {
    ok: true,
    proposal,
    provider: proposal.provider,
    fellBackToMock: resolution.fellBackToMock,
    reason: resolution.reason,
  };
}

/**
 * Light status mutation — used by the review panel to mark a proposal as
 * confirmed / failed without creating finance records.
 */
export async function setExtractionStatusAction(
  input: unknown
): Promise<{ ok: true; status: ExtractionStatus }> {
  const { documentId, status } = statusSchema.parse(input);
  if (!getDocumentExtraction(documentId)) {
    throw new Error(`Sin extracción guardada para el documento ${documentId}`);
  }
  updateDocumentExtractionStatus(documentId, status);
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { ok: true, status };
}

/**
 * Lightweight metadata helper for the UI: which provider would run, and is
 * it currently configured. Used for the "Demo OCR" / "Azure" badge before
 * the user clicks "Extraer datos".
 */
export async function getOcrProviderInfoAction(): Promise<{
  id: OcrProviderId;
  name: string;
  configured: boolean;
  reason: string;
}> {
  const r = resolveOcrProvider();
  return {
    id: r.provider.id,
    name: r.provider.name,
    configured: r.provider.isConfigured(),
    reason: r.reason,
  };
}
