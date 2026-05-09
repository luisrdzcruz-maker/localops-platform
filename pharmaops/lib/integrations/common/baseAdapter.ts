/**
 * Base adapter helpers — shared between generic / Unycop / Farmatic / Nixfarma
 * adapters so each one only declares its differences.
 */

import { parseSpreadsheet } from "@/lib/imports/parser";
import { suggestMapping } from "@/lib/imports/autoMap";
import { normalizeRows } from "@/lib/imports/normalize";
import { validateRows } from "@/lib/imports/validate";
import type {
  AdapterParseInput,
  AdapterParseResult,
  ImportType,
  ImportValidationResult,
  NormalizedImportRow,
  RawRow,
} from "@/types/imports";
import type { PharmacySystemAdapter } from "@/types/integrations";

export interface AdapterDefinition
  extends Omit<
    PharmacySystemAdapter,
    | "parseFile"
    | "normalizeRows"
    | "validateRows"
    | "detectFileType"
  > {
  /**
   * Filename / header-based detection. Each adapter owns the logic that
   * recognises files belonging to its source system.
   */
  detect(
    metadata: { filename: string; extension: string },
    headers: string[]
  ):
    | {
        importType: ImportType;
        confidence: number;
        reasoning: string;
      }
    | null;
}

export function buildAdapter(def: AdapterDefinition): PharmacySystemAdapter {
  return {
    id: def.id,
    name: def.name,
    sourceSystem: def.sourceSystem,
    status: def.status,
    capabilities: def.capabilities,
    tagline: def.tagline,
    disclaimer: def.disclaimer,

    async detectFileType(metadata, headers) {
      const detection = def.detect(
        { filename: metadata.filename, extension: metadata.extension },
        headers
      );
      if (!detection) return null;
      return {
        importType: detection.importType,
        sourceSystem: def.sourceSystem,
        confidence: detection.confidence,
        reasoning: detection.reasoning,
      };
    },

    async parseFile(input: AdapterParseInput): Promise<AdapterParseResult> {
      return parseSpreadsheet(input.file, input.metadata, {
        sourceSystem: def.sourceSystem,
      });
    },

    async normalizeRows(
      rows: RawRow[],
      importType: ImportType,
      mapping: Record<string, string | null> | null
    ): Promise<NormalizedImportRow[]> {
      const finalMapping = mapping ?? suggestMapping(importType, columnsOf(rows));
      return normalizeRows(importType, rows, finalMapping);
    },

    async validateRows(
      rows: NormalizedImportRow[],
      importType: ImportType
    ): Promise<ImportValidationResult> {
      return validateRows(importType, rows);
    },
  };
}

function columnsOf(rows: RawRow[]): string[] {
  if (rows.length === 0) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of rows) {
    for (const k of Object.keys(row)) {
      if (!seen.has(k)) {
        seen.add(k);
        out.push(k);
      }
    }
  }
  return out;
}
