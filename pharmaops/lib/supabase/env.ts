/**
 * Supabase environment helpers.
 *
 * The MVP runs in *demo mode* by default. Demo mode means: no Supabase calls,
 * all data lives in the in-memory store under lib/demo/. Real Supabase wiring
 * is opt-in via NEXT_PUBLIC_PHARMAOPS_DEMO_MODE=false plus the standard
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY pair.
 *
 * Treat env reads here as the single source of truth. Other modules should
 * call isDemoMode() / getSupabaseEnv() rather than inspecting process.env
 * directly so we keep behavior consistent across server + client.
 */

export interface SupabaseEnv {
  url: string;
  anonKey: string;
  serviceRoleKey: string | null;
}

/** Read-only flag describing whether the app is in mock/in-memory mode. */
export function isDemoMode(): boolean {
  // Default: demo mode when the flag is missing or set to anything other
  // than the explicit literal "false". Conservative on purpose — accidentally
  // enabling Supabase against a real project would be worse than leaving the
  // app in demo mode.
  const raw = process.env.NEXT_PUBLIC_PHARMAOPS_DEMO_MODE;
  if (raw === undefined || raw === null || raw === "") return true;
  return raw.toLowerCase() !== "false";
}

/**
 * Returns the Supabase env vars when both URL and anon key are present.
 * Returns null when the app is in demo mode or the values are missing —
 * callers must handle that case (typically: fall back to the demo store).
 */
export function getSupabaseEnv(): SupabaseEnv | null {
  if (isDemoMode()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return {
    url,
    anonKey,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? null,
  };
}

/**
 * Same as getSupabaseEnv() but throws when the env is missing. Use this in
 * server-only code paths that have already verified !isDemoMode().
 */
export function requireSupabaseEnv(): SupabaseEnv {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "PharmaOps Supabase env is missing. Set NEXT_PUBLIC_PHARMAOPS_DEMO_MODE=false " +
        "and provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "before calling Supabase-backed code paths."
    );
  }
  return env;
}
