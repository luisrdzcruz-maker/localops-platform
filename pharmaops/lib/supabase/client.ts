/**
 * Supabase browser client.
 *
 * Returns null in demo mode so callers can route to the in-memory store
 * without try/catching missing env. Always check the return value.
 */

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";
import type { Database } from "./types";

let cachedClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getBrowserSupabase(): ReturnType<
  typeof createBrowserClient<Database>
> | null {
  if (cachedClient) return cachedClient;
  const env = getSupabaseEnv();
  if (!env) return null;
  cachedClient = createBrowserClient<Database>(env.url, env.anonKey);
  return cachedClient;
}
