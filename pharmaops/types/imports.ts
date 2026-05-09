/**
 * Import pipeline types.
 *
 * Pipeline contract:
 *   1. Upload file        → ImportedFileMetadata
 *   2. Detect file type   → DetectedImportType
 *   3. Preview rows       → AdapterParseResult.previewRows
 *   4. Map columns        → ColumnMapping (per ImportType)
 *   5. Validate rows      → ImportValidationResult
 *   6. Confirm import     → ImportBatch + ImportRow[]
 *   7. Normalize          → business-table inserts (purchases / sales / etc.)
 *
 * Adapters (lib/integrations/...) implement detect/parse/normalize/validate.
 * Never insert raw rows directly into business tables — always go through
 * NormalizedImportRow first.
 */

import type { PharmacyId } from "./pharmacy";
import type { UserId } from "./localops";

export type ImportBatchId = string;
export type ImportRowId = string;
export type MappingTemplateId = string;

/** Internal canonical import categories. */
export type ImportType =
  | "purchase_invoices"
  | "purchase_invoice_lines"
  | "sales_summary"
  | "stock_snapshot"
  | "suppliers"
  | "expenses"
  | "accounting_movements"
  | "unycop_export"
  | "generic";

export const IMPORT_TYPES: ImportType[] = [
  "purchase_invoices",
  "purchase_invoice_lines",
  "sales_summary",
  "stock_snapshot",
  "suppliers",
  "expenses",
  "accounting_movements",
  "unycop_export",
  "generic",
];

export const IMPORT_TYPE_LABELS: Record<ImportType, string> = {
  purchase_invoices: "Facturas de compra",
  purchase_invoice_lines: "Líneas de factura de compra",
  sales_summary: "Resumen de ventas",
  stock_snapshot: "Inventario / stock",
  suppliers: "Proveedores",
  expenses: "Gastos",
  accounting_movements: "Movimientos contables",
  unycop_export: "Exportación Unycop",
  generic: "Genérico (otro)",
};

export type SourceSystem =
  | "unycop"
  | "farmatic"
  | "nixfarma"
  | "generic"
  | "manual";

export const SOURCE_SYSTEM_LABELS: Record<SourceSystem, string> = {
  unycop: "Unycop",
  farmatic: "Farmatic",
  nixfarma: "Nixfarma",
  generic: "Excel/CSV genérico",
  manual: "Carga manual",
};

export type FileExtension = "csv" | "xlsx" | "xls";

export interface ImportedFileMetadata {
  filename: string;
  extension: FileExtension;
  byteSize: number;
  uploadedAt: string;
  uploadedBy: UserId | null;
}

export interface DetectedImportType {
  importType: ImportType;
  sourceSystem: SourceSystem;
  /** 0..1 confidence — adapters use this to recommend a default. */
  confidence: number;
  reasoning: string;
}

/** Free-form row keyed by column name as it appears in the source file. */
export type RawRow = Record<string, unknown>;

export interface AdapterParseInput {
  file: File | Blob | ArrayBuffer;
  metadata: ImportedFileMetadata;
}

export interface AdapterParseResult {
  importType: ImportType;
  sourceSystem: SourceSystem;
  /** Original column headers in the order they appear in the file. */
  columns: string[];
  /** All rows parsed. The UI only previews the first N. */
  rows: RawRow[];
  /** Subset of rows used for the preview UI (typically first 25). */
  previewRows: RawRow[];
}

/**
 * Mapping from a destination canonical field key (e.g. "invoiceNumber") to a
 * source column name in the file (e.g. "Nº Factura"). null means unmapped.
 */
export type ColumnMapping = Record<string, string | null>;

export interface MappingTemplate {
  id: MappingTemplateId;
  pharmacyId: PharmacyId;
  sourceSystem: SourceSystem;
  importType: ImportType;
  name: string;
  mapping: ColumnMapping;
  createdAt: string;
  updatedAt: string;
}

/** Required + optional canonical fields for a given ImportType. */
export interface ImportTypeSchema {
  importType: ImportType;
  required: ImportFieldDescriptor[];
  optional: ImportFieldDescriptor[];
}

export interface ImportFieldDescriptor {
  key: string;
  label: string;
  /** Loose hint used to score auto-mapping candidates. */
  hints: string[];
  type: "string" | "number" | "date" | "boolean" | "enum";
  enumValues?: string[];
  /** Marks fields that may carry patient data — UI must offer to exclude. */
  sensitive?: boolean;
}

/** A row after column mapping + type coercion (still pre-validation). */
export type NormalizedImportRow = Record<string, unknown> & {
  /** Index in the original file — used for error reporting. */
  __rowIndex: number;
};

export type ValidationSeverity = "error" | "warning";

export interface ImportRowValidationIssue {
  rowIndex: number;
  field: string | null;
  severity: ValidationSeverity;
  code: string;
  message: string;
}

export interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  issues: ImportRowValidationIssue[];
}

export type ImportBatchStatus =
  | "uploaded"
  | "detected"
  | "mapping"
  | "validated"
  | "confirmed"
  | "failed";

export const IMPORT_BATCH_STATUS_LABELS: Record<ImportBatchStatus, string> = {
  uploaded: "Subido",
  detected: "Detectado",
  mapping: "Mapeando",
  validated: "Validado",
  confirmed: "Confirmado",
  failed: "Con errores",
};

export interface ImportBatch {
  id: ImportBatchId;
  pharmacyId: PharmacyId;
  userId: UserId | null;
  sourceSystem: SourceSystem;
  importType: ImportType;
  originalFilename: string;
  status: ImportBatchStatus;
  rowCount: number;
  validRowCount: number;
  errorRowCount: number;
  warningRowCount: number;
  mapping: ColumnMapping;
  /** Free-form metadata: detected confidence, adapter id, parser warnings. */
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ImportRow {
  id: ImportRowId;
  batchId: ImportBatchId;
  rowIndex: number;
  rawData: RawRow;
  normalizedData: NormalizedImportRow | null;
  validationStatus: "valid" | "warning" | "error" | "pending";
  validationErrors: ImportRowValidationIssue[];
  createdAt: string;
}
