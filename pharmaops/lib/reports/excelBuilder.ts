/**
 * Tiny Excel/CSV builder on top of SheetJS (xlsx).
 *
 * Each report definition produces one or more sheets (label + headers + rows).
 * The builder serialises to .xlsx (workbook) or .csv (single sheet flattened).
 */

import * as XLSX from "xlsx";

export interface SheetSpec {
  name: string;
  headers: string[];
  rows: Array<Array<string | number | null>>;
}

export function buildExcelWorkbook(sheets: SheetSpec[]): Uint8Array {
  const workbook = XLSX.utils.book_new();
  for (const spec of sheets) {
    const aoa: Array<Array<string | number | null>> = [
      spec.headers,
      ...spec.rows,
    ];
    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    // Set sensible column widths based on header text length.
    sheet["!cols"] = spec.headers.map((h) => ({ wch: Math.min(40, Math.max(12, h.length + 4)) }));
    XLSX.utils.book_append_sheet(
      workbook,
      sheet,
      spec.name.slice(0, 31) || "Hoja1"
    );
  }
  const buf = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return new Uint8Array(buf);
}

export function buildCsv(sheet: SheetSpec): Uint8Array {
  const aoa: Array<Array<string | number | null>> = [sheet.headers, ...sheet.rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  // FS = ";" for Spanish-locale Excel compatibility.
  const csv = XLSX.utils.sheet_to_csv(ws, { FS: ";" });
  return new TextEncoder().encode("﻿" + csv); // BOM for Excel UTF-8.
}
