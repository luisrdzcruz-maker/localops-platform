import type { PermissionKey, RoleDefinition } from "@/types/permissions";

const allPermissions: PermissionKey[] = [
  "organization.manage", "members.manage", "contacts.read", "contacts.write", "contacts.delete", "tasks.read", "tasks.write", "documents.read", "documents.write", "automations.manage", "integrations.manage", "billing.manage", "ai.use", "ai.manage_limits", "reports.read", "settings.manage", "vertical.pharma.access", "vertical.construction.access", "vertical.dental.access"
];

export const roles: RoleDefinition[] = [
  { key: "owner", label: "Owner", description: "Full control over organization, billing and data.", permissions: allPermissions },
  { key: "admin", label: "Admin", description: "Manage users, modules and most operations.", permissions: allPermissions.filter(p => p !== "billing.manage") },
  { key: "manager", label: "Manager", description: "Manage daily operations and reports.", permissions: ["contacts.read", "contacts.write", "tasks.read", "tasks.write", "documents.read", "documents.write", "ai.use", "reports.read", "vertical.pharma.access", "vertical.construction.access", "vertical.dental.access"] },
  { key: "staff", label: "Staff", description: "Use assigned operational workflows.", permissions: ["contacts.read", "tasks.read", "tasks.write", "documents.read", "ai.use"] },
  { key: "viewer", label: "Viewer", description: "Read-only access.", permissions: ["contacts.read", "tasks.read", "documents.read", "reports.read"] },
  { key: "external", label: "External", description: "Limited collaborator access.", permissions: ["tasks.read", "documents.read"] }
];
