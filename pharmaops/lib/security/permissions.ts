/**
 * Permission map per role.
 *
 * Used by role-aware UI guards. The owner sees everything; staff are limited
 * to the dashboard + imports (read-only for finance / reports). Accountant
 * is finance/reports-focused and cannot configure integrations.
 *
 * RLS in Supabase enforces tenant isolation. This module enforces role
 * granularity above that.
 */

import type { PermissionKey, WorkspaceRole } from "@/types/localops";

const PERMISSIONS_BY_ROLE: Record<WorkspaceRole, PermissionKey[]> = {
  owner: [
    "workspace.read",
    "workspace.manage",
    "users.manage",
    "imports.read",
    "imports.write",
    "suppliers.read",
    "suppliers.write",
    "finance.read",
    "finance.write",
    "reports.read",
    "reports.generate",
    "tasks.read",
    "tasks.write",
    "settings.read",
    "settings.write",
    "integrations.read",
    "integrations.configure",
    "audit.read",
  ],
  manager: [
    "workspace.read",
    "imports.read",
    "imports.write",
    "suppliers.read",
    "suppliers.write",
    "finance.read",
    "finance.write",
    "reports.read",
    "reports.generate",
    "tasks.read",
    "tasks.write",
    "settings.read",
    "integrations.read",
    "audit.read",
  ],
  staff: [
    "workspace.read",
    "imports.read",
    "imports.write",
    "suppliers.read",
    "tasks.read",
    "tasks.write",
  ],
  accountant: [
    "workspace.read",
    "suppliers.read",
    "finance.read",
    "reports.read",
    "reports.generate",
    "tasks.read",
    "audit.read",
  ],
};

export function can(role: WorkspaceRole, key: PermissionKey): boolean {
  return PERMISSIONS_BY_ROLE[role]?.includes(key) ?? false;
}

export function permissionsFor(role: WorkspaceRole): PermissionKey[] {
  return [...(PERMISSIONS_BY_ROLE[role] ?? [])];
}
