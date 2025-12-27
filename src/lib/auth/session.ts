import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { hasPermission, hasRole, type UserRole } from "./rbac";

/**
 * Get the current authenticated session
 * Redirects to login if not authenticated
 */
export async function getSession() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Get the current session or null (no redirect)
 */
export async function getSessionOptional() {
  return await auth();
}

/**
 * Require a specific role to access a resource
 * Redirects to dashboard with an error if unauthorized
 */
export async function requireRole(requiredRole: UserRole) {
  const session = await getSession();
  const userRole = (session.user.role ?? "viewer") as UserRole;

  if (!hasRole(userRole, requiredRole)) {
    redirect("/dashboard?error=unauthorized");
  }

  return session;
}

/**
 * Require a specific permission to perform an action
 * Returns the session if authorized, throws otherwise
 */
export async function requirePermission(
  permission: Parameters<typeof hasPermission>[1]
) {
  const session = await getSession();
  const userRole = (session.user.role ?? "viewer") as UserRole;

  if (!hasPermission(userRole, permission)) {
    throw new Error(`Unauthorized: Missing permission ${permission}`);
  }

  return session;
}

/**
 * Get the database user ID from the session
 */
export async function getDbUserId(): Promise<string> {
  const session = await getSession();

  if (!session.user.dbId) {
    throw new Error("User not synced to database");
  }

  return session.user.dbId;
}

/**
 * Get the database user ID or null
 */
export async function getDbUserIdOptional(): Promise<string | null> {
  const session = await getSessionOptional();
  return session?.user?.dbId ?? null;
}
