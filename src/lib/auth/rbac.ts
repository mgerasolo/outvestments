/**
 * Role-based access control utilities
 */

export type UserRole = "admin" | "power_user" | "user" | "viewer";

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY: UserRole[] = ["viewer", "user", "power_user", "admin"];

/**
 * Check if a user role has at least the required role level
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredRoleIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userRoleIndex >= requiredRoleIndex;
}

/**
 * Check if user is an admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

/**
 * Check if user is a power user or higher
 */
export function isPowerUser(role: UserRole): boolean {
  return hasRole(role, "power_user");
}

/**
 * Check if user can perform trading actions
 */
export function canTrade(role: UserRole): boolean {
  return hasRole(role, "user");
}

/**
 * Check if user can only view (no actions)
 */
export function isViewerOnly(role: UserRole): boolean {
  return role === "viewer";
}

/**
 * Permission definitions for various actions
 */
export const PERMISSIONS = {
  // Target permissions
  CREATE_TARGET: ["user", "power_user", "admin"] as UserRole[],
  EDIT_TARGET: ["user", "power_user", "admin"] as UserRole[],
  DELETE_TARGET: ["user", "power_user", "admin"] as UserRole[],
  VIEW_TARGET: ["viewer", "user", "power_user", "admin"] as UserRole[],

  // Aim permissions
  CREATE_AIM: ["user", "power_user", "admin"] as UserRole[],
  EDIT_AIM: ["user", "power_user", "admin"] as UserRole[],
  DELETE_AIM: ["user", "power_user", "admin"] as UserRole[],
  VIEW_AIM: ["viewer", "user", "power_user", "admin"] as UserRole[],

  // Shot permissions
  CREATE_SHOT: ["user", "power_user", "admin"] as UserRole[],
  EXECUTE_TRADE: ["user", "power_user", "admin"] as UserRole[],
  CLOSE_POSITION: ["user", "power_user", "admin"] as UserRole[],
  VIEW_SHOT: ["viewer", "user", "power_user", "admin"] as UserRole[],

  // Admin permissions
  VIEW_ALL_USERS: ["admin"] as UserRole[],
  EDIT_USER_ROLES: ["admin"] as UserRole[],
  VIEW_AUDIT_LOGS: ["admin"] as UserRole[],
  BACKFILL_TRADES: ["power_user", "admin"] as UserRole[],

  // Settings permissions
  EDIT_OWN_SETTINGS: ["user", "power_user", "admin"] as UserRole[],
  CONFIGURE_ALPACA: ["user", "power_user", "admin"] as UserRole[],
} as const;

type PermissionKey = keyof typeof PERMISSIONS;

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userRole: UserRole,
  permission: PermissionKey
): boolean {
  return PERMISSIONS[permission].includes(userRole);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): PermissionKey[] {
  return (Object.keys(PERMISSIONS) as PermissionKey[]).filter((permission) =>
    PERMISSIONS[permission].includes(role)
  );
}

/**
 * Extended session timeout for power users (in seconds)
 */
export function getSessionTimeout(role: UserRole): number {
  switch (role) {
    case "admin":
      return 24 * 60 * 60; // 24 hours
    case "power_user":
      return 8 * 60 * 60; // 8 hours
    default:
      return 60 * 60; // 1 hour
  }
}
