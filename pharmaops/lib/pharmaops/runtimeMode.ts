/**
 * Runtime mode helper.
 *
 * PharmaOps can run in two clearly separated modes:
 *
 * - `"demo"`             — in-memory deterministic data. No external services.
 *                          What every Vercel preview / public demo runs in.
 *
 * - `"production_stub"`  — the same UI, but real persistence + integrations are
 *                          expected. The current MVP does NOT yet connect them;
 *                          write paths should fall back to safe, read-only
 *                          messages until services are wired.
 *
 * The mode is derived from env vars at call time. Order:
 *   1. `NEXT_PUBLIC_APP_MODE` if it explicitly matches `production_stub`.
 *   2. Legacy `NEXT_PUBLIC_PHARMAOPS_DEMO_MODE=false` (kept for compat).
 *   3. Default to `"demo"`.
 *
 * Never throws. If env is misconfigured or services are missing in production
 * mode, callers should still degrade to safe messaging rather than crash.
 */

export type RuntimeMode = "demo" | "production_stub";

const PRODUCTION_STUB_VALUES = new Set(["production_stub", "production"]);

/**
 * Read the configured mode. Safe on both server and client (only reads
 * NEXT_PUBLIC_* variables on the client).
 */
export function getRuntimeMode(): RuntimeMode {
  const explicit = (process.env.NEXT_PUBLIC_APP_MODE ?? "").trim().toLowerCase();
  if (PRODUCTION_STUB_VALUES.has(explicit)) return "production_stub";

  // Legacy flag: NEXT_PUBLIC_PHARMAOPS_DEMO_MODE=false → production_stub.
  const legacy = (process.env.NEXT_PUBLIC_PHARMAOPS_DEMO_MODE ?? "true")
    .trim()
    .toLowerCase();
  if (legacy === "false") return "production_stub";

  return "demo";
}

export function isDemoMode(): boolean {
  return getRuntimeMode() === "demo";
}

/**
 * UI-facing Spanish labels. Centralised so banners, pills and docs stay aligned.
 */
export const RUNTIME_MODE_LABELS: Record<RuntimeMode, string> = {
  demo: "Modo demo",
  production_stub: "Modo producción (servicios no conectados)",
};

export const RUNTIME_MODE_DESCRIPTIONS: Record<RuntimeMode, string> = {
  demo:
    "Estás viendo datos ficticios deterministas. Nada sale de tu equipo y no se llama a ningún servicio externo.",
  production_stub:
    "La aplicación está configurada para producción, pero los servicios externos (Supabase, almacenamiento, OCR) todavía no están conectados. Las escrituras se bloquean con un mensaje seguro.",
};
