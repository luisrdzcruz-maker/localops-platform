/**
 * LocalOps core types — shared concepts across verticals (pharma, construction, dental).
 * PharmaOps reuses Workspace + UserProfile + Role + AuditLog + Permission so the
 * concepts can later be promoted into a shared LocalOps core package.
 */

export type WorkspaceId = string;
export type UserId = string;
export type AuditLogId = string;

/** A LocalOps workspace. In PharmaOps, this is a Pharmacy. */
export interface Workspace {
  id: WorkspaceId;
  name: string;
  vertical: VerticalKey;
  createdAt: string;
  updatedAt: string;
}

export type VerticalKey = "pharma" | "construction" | "dental";

export interface UserProfile {
  id: UserId;
  fullName: string;
  email: string;
  createdAt: string;
}

/** Roles available across LocalOps verticals. Each vertical uses a subset. */
export type WorkspaceRole = "owner" | "manager" | "staff" | "accountant";

export const WORKSPACE_ROLES: WorkspaceRole[] = [
  "owner",
  "manager",
  "staff",
  "accountant",
];

export interface WorkspaceMembership {
  id: string;
  workspaceId: WorkspaceId;
  userId: UserId;
  role: WorkspaceRole;
  createdAt: string;
}

/**
 * Permission keys used by the role-based UI guard. Add new keys as features
 * grow. Permission resolution lives in lib/security/permissions.ts.
 */
export type PermissionKey =
  | "workspace.read"
  | "workspace.manage"
  | "users.manage"
  | "imports.read"
  | "imports.write"
  | "suppliers.read"
  | "suppliers.write"
  | "finance.read"
  | "finance.write"
  | "reports.read"
  | "reports.generate"
  | "tasks.read"
  | "tasks.write"
  | "settings.read"
  | "settings.write"
  | "integrations.read"
  | "integrations.configure"
  | "audit.read";

export interface AuditLogEntry {
  id: AuditLogId;
  workspaceId: WorkspaceId;
  userId: UserId | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
