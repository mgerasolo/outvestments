"use client";

import { useSession } from "next-auth/react";
import {
  hasPermission,
  hasRole,
  isAdmin,
  isPowerUser,
  canTrade,
  type UserRole,
} from "@/lib/auth/rbac";

/**
 * Hook for checking user permissions in React components
 */
export function usePermissions() {
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "viewer") as UserRole;

  return {
    role,
    isAuthenticated: !!session?.user,
    isAdmin: isAdmin(role),
    isPowerUser: isPowerUser(role),
    canTrade: canTrade(role),
    hasRole: (requiredRole: UserRole) => hasRole(role, requiredRole),
    hasPermission: (permission: Parameters<typeof hasPermission>[1]) =>
      hasPermission(role, permission),
  };
}
