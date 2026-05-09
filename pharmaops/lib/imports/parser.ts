/**
 * Spreadsheet parser — XLSX and CSV → { columns, rows }.
 *
 * Runs in the browser as well as on the server (xlsx/SheetJS supports both).
 * For UX: keep parsing on the client side so the user gets instant preview
 * without uploading the file. Server only sees the parsed JSON when the
 * user confirms.
 */

import * as XLSX from "xlsx";
import type {
  AdapterParseResult,
  FileExtension,
  ImportType,
  ImportedFileMetadata,
  RawRow,
  SourceSystem,
} from "@/types/imports";

interface ParseOptions {
  importType?: ImportType;
  sourceSystem?: SourceSystem;
  /** How many rows to keep in the preview (UI). Defaults to 25. */
  previewSize?: number;
}

export async function parseSpreadsheet(
  file: File | Blob | ArrayBuffer,
  metadata: ImportedFileMetadata,
  options: ParseOptions = {}
): Promise<AdapterParseResult> {
  const buffer = await asArrayBuffer(file);
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("El fichero no contiene hojas legibles.");
  }
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`La hoja "${sheetName}" está vacía.`);
  }
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, {
    defval: null,
    raw: true,
  });

  // XLSX returns objects keyed by header. Header order is recoverable from
  // sheet ref + the JSON keys order on the first row.
  const columns = inferColumns(sheet, rows);

  const previewSize = options.previewSize ?? 25;
  const previewRows = rows.slice(0, previewSize);

  return {
    importType: options.importType ?? "generic",
    sourceSystem: options.sourceSystem ?? "generic",
    columns,
    rows,
    previewRows,
  };
}

function inferColumns(sheet: XLSX.WorkSheet, rows: RawRow[]): string[] {
  // Best effort: read row 1 directly using the sheet's range, fallback to keys
  // of the first parsed row.
  const ref = sheet["!ref"];
  if (!ref) return rows[0] ? Object.keys(rows[0]) : [];
  const range = XLSX.utils.decode_range(ref);
  const cols: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: range.s.r, c });
    const cell = sheet[addr];
    if (cell && cell.v !== undefined && cell.v !== null) {
      cols.push(String(cell.v));
    }
  }
  if (cols.length > 0) return cols;
  return rows[0] ? Object.keys(rows[0]) : [];
}

async function asArrayBuffer(
  file: File | Blob | ArrayBuffer
): Promise<ArrayBuffer> {
  if (file instanceof ArrayBuffer) return file;
  return await file.arrayBuffer();
}

export function deriveFileMetadata(file: File): ImportedFileMetadata {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase() as FileExtension;
  const safeExt: FileExtension =
    ext === "csv" || ext === "xlsx" || ext === "xls" ? ext : "csv";
  return {
    filename: file.name,
    extension: safeExt,
    byteSize: file.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy: null,
  };
}

/**
 * Stable string normalisation used by the auto-mapper. Lowercases, strips
 * accents, collapses whitespace and removes punctuation so "Nº Factura"
 * matches "n_factura" matches "Numero Factura".
 */
export function normalizeColumnName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
