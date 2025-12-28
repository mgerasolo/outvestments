import { describe, it, expect } from "vitest";
import {
  hasRole,
  isAdmin,
  isPowerUser,
  canTrade,
  isViewerOnly,
  hasPermission,
  getRolePermissions,
  getSessionTimeout,
  type UserRole,
} from "./rbac";

describe("hasRole", () => {
  it("returns true when user role equals required role", () => {
    expect(hasRole("admin", "admin")).toBe(true);
    expect(hasRole("user", "user")).toBe(true);
  });

  it("returns true when user role is higher than required", () => {
    expect(hasRole("admin", "user")).toBe(true);
    expect(hasRole("power_user", "user")).toBe(true);
    expect(hasRole("user", "viewer")).toBe(true);
  });

  it("returns false when user role is lower than required", () => {
    expect(hasRole("viewer", "user")).toBe(false);
    expect(hasRole("user", "power_user")).toBe(false);
    expect(hasRole("user", "admin")).toBe(false);
  });

  it("handles the full hierarchy correctly", () => {
    const roles: UserRole[] = ["viewer", "user", "power_user", "admin"];

    // Admin should have access to all levels
    roles.forEach(role => {
      expect(hasRole("admin", role)).toBe(true);
    });

    // Viewer should only have viewer access
    expect(hasRole("viewer", "viewer")).toBe(true);
    expect(hasRole("viewer", "user")).toBe(false);
  });
});

describe("isAdmin", () => {
  it("returns true only for admin role", () => {
    expect(isAdmin("admin")).toBe(true);
    expect(isAdmin("power_user")).toBe(false);
    expect(isAdmin("user")).toBe(false);
    expect(isAdmin("viewer")).toBe(false);
  });
});

describe("isPowerUser", () => {
  it("returns true for power_user and admin", () => {
    expect(isPowerUser("admin")).toBe(true);
    expect(isPowerUser("power_user")).toBe(true);
  });

  it("returns false for user and viewer", () => {
    expect(isPowerUser("user")).toBe(false);
    expect(isPowerUser("viewer")).toBe(false);
  });
});

describe("canTrade", () => {
  it("returns true for user and above", () => {
    expect(canTrade("admin")).toBe(true);
    expect(canTrade("power_user")).toBe(true);
    expect(canTrade("user")).toBe(true);
  });

  it("returns false for viewer", () => {
    expect(canTrade("viewer")).toBe(false);
  });
});

describe("isViewerOnly", () => {
  it("returns true only for viewer role", () => {
    expect(isViewerOnly("viewer")).toBe(true);
    expect(isViewerOnly("user")).toBe(false);
    expect(isViewerOnly("power_user")).toBe(false);
    expect(isViewerOnly("admin")).toBe(false);
  });
});

describe("hasPermission", () => {
  it("checks target permissions correctly", () => {
    expect(hasPermission("viewer", "VIEW_TARGET")).toBe(true);
    expect(hasPermission("viewer", "CREATE_TARGET")).toBe(false);
    expect(hasPermission("user", "CREATE_TARGET")).toBe(true);
    expect(hasPermission("admin", "CREATE_TARGET")).toBe(true);
  });

  it("checks admin-only permissions correctly", () => {
    expect(hasPermission("admin", "VIEW_ALL_USERS")).toBe(true);
    expect(hasPermission("power_user", "VIEW_ALL_USERS")).toBe(false);
    expect(hasPermission("admin", "EDIT_USER_ROLES")).toBe(true);
    expect(hasPermission("user", "EDIT_USER_ROLES")).toBe(false);
  });

  it("checks trading permissions correctly", () => {
    expect(hasPermission("user", "EXECUTE_TRADE")).toBe(true);
    expect(hasPermission("viewer", "EXECUTE_TRADE")).toBe(false);
  });

  it("checks backfill permission for power users", () => {
    expect(hasPermission("power_user", "BACKFILL_TRADES")).toBe(true);
    expect(hasPermission("admin", "BACKFILL_TRADES")).toBe(true);
    expect(hasPermission("user", "BACKFILL_TRADES")).toBe(false);
  });
});

describe("getRolePermissions", () => {
  it("returns correct permissions for viewer", () => {
    const permissions = getRolePermissions("viewer");
    expect(permissions).toContain("VIEW_TARGET");
    expect(permissions).toContain("VIEW_AIM");
    expect(permissions).toContain("VIEW_SHOT");
    expect(permissions).not.toContain("CREATE_TARGET");
    expect(permissions).not.toContain("EXECUTE_TRADE");
  });

  it("returns correct permissions for user", () => {
    const permissions = getRolePermissions("user");
    expect(permissions).toContain("VIEW_TARGET");
    expect(permissions).toContain("CREATE_TARGET");
    expect(permissions).toContain("EXECUTE_TRADE");
    expect(permissions).not.toContain("VIEW_ALL_USERS");
  });

  it("returns all permissions for admin", () => {
    const permissions = getRolePermissions("admin");
    expect(permissions).toContain("VIEW_TARGET");
    expect(permissions).toContain("CREATE_TARGET");
    expect(permissions).toContain("VIEW_ALL_USERS");
    expect(permissions).toContain("EDIT_USER_ROLES");
    expect(permissions).toContain("VIEW_AUDIT_LOGS");
  });
});

describe("getSessionTimeout", () => {
  it("returns 24 hours for admin", () => {
    expect(getSessionTimeout("admin")).toBe(24 * 60 * 60);
  });

  it("returns 8 hours for power_user", () => {
    expect(getSessionTimeout("power_user")).toBe(8 * 60 * 60);
  });

  it("returns 1 hour for user and viewer", () => {
    expect(getSessionTimeout("user")).toBe(60 * 60);
    expect(getSessionTimeout("viewer")).toBe(60 * 60);
  });
});
