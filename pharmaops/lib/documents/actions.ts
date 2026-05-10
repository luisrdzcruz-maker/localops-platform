"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { appendDocument, updateDocumentStatus } from "@/lib/demo/store";
import { DEMO_PHARMACY } from "@/lib/demo/session";
import {
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  type DocumentRecord,
  type DocumentSource,
} from "@/types/documents";

/**
 * Server Action contract for new documents.
 *
 * IMPORTANT: this MVP intentionally does not accept the file blob — only
 * its metadata. The actual file stays on the user's device. We do not run
 * OCR, do not call any external APIs, and do not store anything to disk.
 */
const createSchema = z.object({
  type: z.enum(DOCUMENT_TYPES as unknown as [string, ...string[]]),
  source: z.enum(["subida_manual", "camara_movil"]),
  fileName: z.string().min(1, "Falta el nombre del fichero").max(256),
  fileSize: z.number().int().nonnegative().max(20 * 1024 * 1024),
  mimeType: z.string().max(128),
  supplierName: z.string().max(120).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export interface CreateDocumentResult {
  ok: true;
  id: string;
}

export async function addDocumentAction(
  input: unknown
): Promise<CreateDocumentResult> {
  const parsed = createSchema.parse(input);
  const now = new Date().toISOString();
  const doc: DocumentRecord = {
    id: `doc-manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    pharmacyId: DEMO_PHARMACY.id,
    date: now.slice(0, 10),
    type: parsed.type as DocumentRecord["type"],
    supplierName: parsed.supplierName ?? null,
    category: null,
    status: "pendiente_revisar",
    estimatedAmount: null,
    source: parsed.source as DocumentSource,
    fileName: parsed.fileName,
    fileSize: parsed.fileSize,
    mimeType: parsed.mimeType,
    notes: parsed.notes ?? null,
    createdAt: now,
  };
  appendDocument(doc);
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { ok: true, id: doc.id };
}

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(DOCUMENT_STATUSES as unknown as [string, ...string[]]),
});

export async function updateDocumentStatusAction(
  input: unknown
): Promise<{ ok: true }> {
  const parsed = statusSchema.parse(input);
  updateDocumentStatus(
    parsed.id,
    parsed.status as DocumentRecord["status"]
  );
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { ok: true };
}
