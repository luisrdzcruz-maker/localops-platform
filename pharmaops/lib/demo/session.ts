/**
 * Demo session helper.
 *
 * In demo mode there is no real auth — we hand back a fixed pharmacy +
 * user so the shell renders sensibly. When real Supabase auth lands, the
 * shell will fall through to the Supabase session and use this only as a
 * fallback for unauthenticated previews.
 */

import { isDemoMode } from "@/lib/supabase/env";
import type { Pharmacy, PharmacyMember } from "@/types/pharmacy";
import type { UserProfile, WorkspaceRole } from "@/types/localops";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_PHARMACY_ID = "00000000-0000-0000-0000-0000000000aa";

export const DEMO_USER: UserProfile = {
  id: DEMO_USER_ID,
  fullName: "Owner Demo",
  email: "owner@pharmaops.test",
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const DEMO_PHARMACY: Pharmacy = {
  id: DEMO_PHARMACY_ID,
  name:
    process.env.NEXT_PUBLIC_PHARMAOPS_DEFAULT_PHARMACY_NAME ??
    "Farmacia Demo Centro",
  taxId: "B00000000",
  address: "Calle Mayor 1",
  province: "Madrid",
  autonomousCommunity: "Comunidad de Madrid",
  accountantEmail: "gestoria@pharmaops.test",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const DEMO_ROLE: WorkspaceRole = "owner";

export const DEMO_MEMBERSHIP: PharmacyMember = {
  id: "00000000-0000-0000-0000-0000000000ab",
  pharmacyId: DEMO_PHARMACY.id,
  userId: DEMO_USER.id,
  role: DEMO_ROLE,
  createdAt: "2026-01-01T00:00:00.000Z",
};

export interface ResolvedSession {
  user: UserProfile;
  pharmacy: Pharmacy;
  role: WorkspaceRole;
  isDemo: boolean;
}

/**
 * Resolve the current session.
 * MVP: always returns the demo session. Real auth wiring will replace this
 * to consult Supabase first and only fall through to demo when isDemoMode().
 */
export function resolveDemoSession(): ResolvedSession {
  return {
    user: DEMO_USER,
    pharmacy: DEMO_PHARMACY,
    role: DEMO_ROLE,
    isDemo: isDemoMode(),
  };
}

/** Convenience helper for the topbar avatar. */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}
