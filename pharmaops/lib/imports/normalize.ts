/**
 * Normalize raw rows + a column mapping into NormalizedImportRow[].
 *
 * Type coercion is intentionally permissive: pharmacy spreadsheets mix
 * locale formats ("1.234,56" vs "1234.56"), date formats and string spaces.
 * Strict validation lives in lib/imports/validate.ts.
 */

import { listAllFields } from "./schemas";
import { parseSpanishDate, parseSpanishNumber } from "../utils/parseLocale";
import type {
  ColumnMapping,
  ImportType,
  NormalizedImportRow,
  RawRow,
} from "@/types/imports";

export function normalizeRows(
  importType: ImportType,
  rows: RawRow[],
  mapping: ColumnMapping
): NormalizedImportRow[] {
  const fields = listAllFields(importType);
  return rows.map((row, index) => {
    const out: NormalizedImportRow = { __rowIndex: index };
    for (const field of fields) {
      const sourceColumn = mapping[field.key];
      if (!sourceColumn) {
        out[field.key] = null;
        continue;
      }
      const rawValue = row[sourceColumn];
      out[field.key] = coerce(rawValue, field.type);
    }
    return out;
  });
}

function coerce(
  raw: unknown,
  type: "string" | "number" | "date" | "boolean" | "enum"
): unknown {
  if (raw === null || raw === undefined || raw === "") return null;
  switch (type) {
    case "string":
    case "enum":
      return String(raw).trim();
    case "number":
      if (typeof raw === "number") return raw;
      return parseSpanishNumber(String(raw));
    case "date":
      if (raw instanceof Date) {
        if (Number.isNaN(raw.getTime())) return null;
        return raw.toISOString().slice(0, 10);
      }
      return parseSpanishDate(String(raw));
    case "boolean": {
      const s = String(raw).trim().toLowerCase();
      if (["true", "1", "si", "sí", "yes"].includes(s)) return true;
      if (["false", "0", "no"].includes(s)) return false;
      return null;
    }
    default:
      return raw;
  }
}
