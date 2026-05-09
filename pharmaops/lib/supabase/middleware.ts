/**
 * Supabase auth middleware helper.
 *
 * Used from middleware.ts at the project root to refresh the auth session
 * cookie on each request. Returns null in demo mode (the route-level guards
 * fall back to the demo session).
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieSetItem = { name: string; value: string; options: CookieOptions };
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";
import type { Database } from "./types";

export async function refreshSupabaseSession(
  request: NextRequest
): Promise<{ response: NextResponse; user: { id: string; email?: string | null } | null }> {
  const env = getSupabaseEnv();
  let response = NextResponse.next({ request });
  if (!env) {
    return { response, user: null };
  }

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieSetItem[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    response,
    user: user ? { id: user.id, email: user.email } : null,
  };
}
