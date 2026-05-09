/**
 * Adapter registry — single source of truth for the integrations centre and
 * the import detection flow.
 *
 * Order matters: more specific adapters (Unycop / Farmatic / Nixfarma) come
 * before the generic fallback so detect() finds them first.
 */

import { farmaticAdapter } from "./farmatic/adapter";
import { genericAdapter } from "./generic/adapter";
import { nixfarmaAdapter } from "./nixfarma/adapter";
import { unycopAdapter } from "./unycop/adapter";
import type { DetectedImportType, ImportedFileMetadata } from "@/types/imports";
import type { PharmacySystemAdapter } from "@/types/integrations";

export const ADAPTERS: PharmacySystemAdapter[] = [
  unycopAdapter,
  farmaticAdapter,
  nixfarmaAdapter,
  genericAdapter,
];

export function getAdapterById(id: string): PharmacySystemAdapter | null {
  return ADAPTERS.find((a) => a.id === id) ?? null;
}

export interface AdapterDetection {
  adapter: PharmacySystemAdapter;
  detection: DetectedImportType;
}

/**
 * Run every adapter against the file metadata + headers and return the
 * highest-confidence detection. Falls back to the generic adapter if no
 * adapter recognises the file.
 */
export async function detectAdapter(
  metadata: ImportedFileMetadata,
  headers: string[]
): Promise<AdapterDetection> {
  let best: AdapterDetection | null = null;
  for (const adapter of ADAPTERS) {
    const detection = await adapter.detectFileType(metadata, headers);
    if (!detection) continue;
    if (!best || detection.confidence > best.detection.confidence) {
      best = { adapter, detection };
    }
  }
  if (best) return best;
  // Always return something — generic falls back even when uncertain.
  const fallback = await genericAdapter.detectFileType(metadata, headers);
  return {
    adapter: genericAdapter,
    detection:
      fallback ?? {
        importType: "generic",
        sourceSystem: "generic",
        confidence: 0,
        reasoning: "Sin detección — selecciona el tipo manualmente.",
      },
  };
}
