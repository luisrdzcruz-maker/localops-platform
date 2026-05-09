"use server";

import { revalidatePath } from "next/cache";
import { confirmImport } from "./confirmImport";
import type {
  ColumnMapping,
  ImportType,
  NormalizedImportRow,
  RawRow,
  SourceSystem,
} from "@/types/imports";

export interface ConfirmImportPayload {
  importType: ImportType;
  sourceSystem: SourceSystem;
  filename: string;
  mapping: ColumnMapping;
  rows: RawRow[];
  normalizedRows: NormalizedImportRow[];
  validIndexes: number[];
  metadata?: Record<string, unknown>;
}

export interface ConfirmImportActionResult {
  ok: true;
  batchId: string;
  appliedCount: number;
}

export async function confirmImportAction(
  payload: ConfirmImportPayload
): Promise<ConfirmImportActionResult> {
  const result = confirmImport({
    importType: payload.importType,
    sourceSystem: payload.sourceSystem,
    filename: payload.filename,
    mapping: payload.mapping,
    rows: payload.rows,
    normalizedRows: payload.normalizedRows,
    validIndexes: new Set(payload.validIndexes),
    metadata: payload.metadata,
  });

  revalidatePath("/", "layout");

  return {
    ok: true,
    batchId: result.batch.id,
    appliedCount: result.appliedCount,
  };
}
