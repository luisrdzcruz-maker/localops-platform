/**
 * CSV templates per ImportType.
 *
 * These are the column layouts pharmacy users can copy into their own files
 * if they don't have an export from Unycop/Farmatic/Nixfarma. The headers
 * intentionally use Spanish labels matching the auto-mapper hints.
 */

import { buildExcelWorkbook } from "@/lib/reports/excelBuilder";
import type { ImportType } from "@/types/imports";
import { listAllFields } from "@/lib/imports/schemas";

interface TemplateOutput {
  filename: string;
  mimeType: string;
  bytes: Uint8Array;
}

export function buildTemplate(importType: ImportType): TemplateOutput | null {
  const fields = listAllFields(importType);
  if (fields.length === 0) return null;

  const headers = fields.map((f) => f.label);
  const exampleRow = fields.map((f) => exampleValue(f.type));

  const sheets = [
    {
      name: "Plantilla",
      headers,
      rows: [exampleRow],
    },
    {
      name: "Instrucciones",
      headers: ["Campo", "Obligatorio", "Tipo", "Notas"],
      rows: fields.map((f) => [
        f.label,
        // Mark required vs optional via an asterisk in Notas — we don't have
        // that flag on the descriptor here without re-reading the schema.
        "",
        f.type,
        f.sensitive ? "Posible dato personal — revisa antes de mapear." : "",
      ]),
    },
  ];

  const bytes = buildExcelWorkbook(sheets);
  return {
    filename: `pharmaops-template-${importType}.xlsx`,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    bytes,
  };
}

function exampleValue(type: string): string | number {
  switch (type) {
    case "number":
      return 0;
    case "date":
      return "2026-05-01";
    case "boolean":
      return "no";
    default:
      return "";
  }
}
