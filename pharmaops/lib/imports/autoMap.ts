/**
 * Auto-mapping: score column→field matches by hint similarity.
 *
 * Algorithm (kept simple — pharmacy file headers are not adversarial):
 *   1. Normalise both the column name and the field hints.
 *   2. Score = highest hint substring match length / column length.
 *   3. For each canonical field, pick the best-scoring column.
 *   4. Don't reuse a column for two fields — pick by descending score.
 */

import { listAllFields } from "./schemas";
import { normalizeColumnName } from "./parser";
import type { ColumnMapping, ImportType } from "@/types/imports";

interface ScoreEntry {
  fieldKey: string;
  column: string;
  score: number;
}

export function suggestMapping(
  importType: ImportType,
  columns: string[]
): ColumnMapping {
  const fields = listAllFields(importType);
  const normalizedColumns = columns.map((c) => ({
    raw: c,
    norm: normalizeColumnName(c),
  }));

  const candidates: ScoreEntry[] = [];

  for (const field of fields) {
    const fieldHintsNorm = [
      normalizeColumnName(field.label),
      normalizeColumnName(field.key),
      ...field.hints.map((h) => normalizeColumnName(h)),
    ];
    for (const col of normalizedColumns) {
      const score = scoreMatch(col.norm, fieldHintsNorm);
      if (score > 0) {
        candidates.push({ fieldKey: field.key, column: col.raw, score });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const mapping: ColumnMapping = {};
  for (const field of fields) {
    mapping[field.key] = null;
  }
  const usedColumns = new Set<string>();
  for (const c of candidates) {
    if (mapping[c.fieldKey]) continue;
    if (usedColumns.has(c.column)) continue;
    mapping[c.fieldKey] = c.column;
    usedColumns.add(c.column);
  }
  return mapping;
}

function scoreMatch(column: string, hintsNorm: string[]): number {
  let best = 0;
  for (const hint of hintsNorm) {
    if (!hint) continue;
    if (column === hint) return 1;
    if (column.includes(hint) || hint.includes(column)) {
      const overlap = Math.min(column.length, hint.length);
      const longer = Math.max(column.length, hint.length);
      const score = overlap / longer;
      if (score > best) best = score;
    } else {
      // Tokenised partial match — average of shared word ratios.
      const colTokens = column.split(" ").filter(Boolean);
      const hintTokens = hint.split(" ").filter(Boolean);
      const shared = colTokens.filter((t) => hintTokens.includes(t)).length;
      if (shared > 0) {
        const score =
          (shared / Math.max(colTokens.length, hintTokens.length)) * 0.85;
        if (score > best) best = score;
      }
    }
  }
  return best;
}
