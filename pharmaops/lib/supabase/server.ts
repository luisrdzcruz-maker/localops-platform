/**
 * Supabase server client (Server Components, Route Handlers, Server Actions).
 *
 * Demo mode returns null. Real mode wires cookies through next/headers so
 * Supabase Auth sessions follow the request.
 */

import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieSetItem = { name: string; value: string; options: CookieOptions };
import { getSupabaseEnv } from "./env";
import type { Database } from "./types";

export async function getServerSupabase(): Promise<ReturnType<
  typeof createServerClient<Database>
> | null> {
  const env = getSupabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieSetItem[]) {
        // Server Components can't mutate cookies. Route Handlers and Server
        // Actions should swallow this and instead rely on middleware to
        // refresh the session cookie. We catch the throw to avoid breaking
        // those read-only call sites.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          /* ignored — read-only context */
        }
      },
    },
  });
}
