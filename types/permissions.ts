export type RoleKey = "owner" | "admin" | "manager" | "staff" | "viewer" | "external";

export type PermissionKey =
  | "organization.manage"
  | "members.manage"
  | "contacts.read"
  | "contacts.write"
  | "contacts.delete"
  | "tasks.read"
  | "tasks.write"
  | "documents.read"
  | "documents.write"
  | "automations.manage"
  | "integrations.manage"
  | "billing.manage"
  | "ai.use"
  | "ai.manage_limits"
  | "reports.read"
  | "settings.manage"
  | "vertical.pharma.access"
  | "vertical.construction.access"
  | "vertical.dental.access";

export interface RoleDefinition {
  key: RoleKey;
  label: string;
  description: string;
  permissions: PermissionKey[];
}
