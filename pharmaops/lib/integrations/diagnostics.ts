/**
 * Adapter diagnostics derived from import batches in the demo store.
 *
 * The integrations centre uses these to show "last success" / "last failure"
 * timestamps next to each adapter card. When a real Supabase wiring lands,
 * the same shape will be produced by querying import_batches grouped by
 * source_system.
 */

import type { ImportBatch } from "@/types/imports";
import type { AdapterDiagnostics, PharmacySystemAdapter } from "@/types/integrations";

export function buildDiagnostics(
  adapter: PharmacySystemAdapter,
  batches: ImportBatch[]
): AdapterDiagnostics {
  const owned = batches.filter((b) => b.sourceSystem === adapter.sourceSystem);
  const successes = owned.filter((b) => b.status === "confirmed");
  const failures = owned.filter(
    (b) => b.status === "failed" || b.errorRowCount > 0
  );

  const notes: string[] = [];
  if (owned.length === 0) {
    notes.push("Aún no se ha procesado ningún fichero con este adaptador.");
  } else {
    notes.push(`${owned.length} lote(s) procesados.`);
    const totalErrors = owned.reduce((acc, b) => acc + b.errorRowCount, 0);
    if (totalErrors > 0) {
      notes.push(`${totalErrors} filas con error a lo largo del histórico.`);
    }
  }
  if (adapter.status === "planned") {
    notes.push(
      "Adaptador planificado — la integración real requiere validación con el proveedor IT."
    );
  }
  if (adapter.status === "file_based_only") {
    notes.push(
      "Solo importación por fichero. La conexión directa a la base de datos del sistema no está implementada."
    );
  }

  return {
    adapterId: adapter.id,
    status: adapter.status,
    lastSuccessAt:
      successes.length > 0
        ? successes
            .map((b) => b.createdAt)
            .sort()
            .at(-1) ?? null
        : null,
    lastFailureAt:
      failures.length > 0
        ? failures
            .map((b) => b.createdAt)
            .sort()
            .at(-1) ?? null
        : null,
    notes,
  };
}
