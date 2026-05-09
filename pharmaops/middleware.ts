/**
 * Next.js middleware — refreshes the Supabase auth session on each request.
 *
 * In demo mode this is a no-op; real Supabase mode rotates the session
 * cookie so server components see the latest session.
 */

import type { NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response } = await refreshSupabaseSession(request);
  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2?)$).*)",
  ],
};
