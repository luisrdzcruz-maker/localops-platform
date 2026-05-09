import type { CoreModuleConfig } from "@/types/modules";
import type { PermissionKey, RoleKey } from "@/types/permissions";
import type { VerticalConfig } from "@/lib/verticals/types";
import { roles } from "./roles";

export function permissionsForRole(roleKey: RoleKey): PermissionKey[] {
  return roles.find(role => role.key === roleKey)?.permissions ?? [];
}

export function hasPermission(userPermissions: PermissionKey[], permission: PermissionKey): boolean {
  return userPermissions.includes(permission);
}

export function canAccessModule(userPermissions: PermissionKey[], module: CoreModuleConfig): boolean {
  return module.requiredPermissions.every(permission => userPermissions.includes(permission as PermissionKey));
}

export function canAccessVertical(userPermissions: PermissionKey[], vertical: VerticalConfig): boolean {
  return vertical.permissions.every(permission => userPermissions.includes(permission));
}
