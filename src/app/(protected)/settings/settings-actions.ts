"use server";

import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import {
  users,
  targets,
  aims,
  shots,
  scores,
  portfolioSnapshots,
  watchlist,
  alpacaCredentials,
  auditLogs,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { logAudit, AuditActions, AuditEntityTypes } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Clear all trading data for the current user
 * Deletes: targets, aims, shots, scores, portfolio snapshots, watchlist
 * Preserves: user account, Alpaca credentials
 */
export async function clearUserData(): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = session.user.dbId;

  try {
    // Start by getting all targets for this user
    const userTargets = await db
      .select({ id: targets.id })
      .from(targets)
      .where(eq(targets.userId, userId));

    const targetIds = userTargets.map((t) => t.id);

    if (targetIds.length > 0) {
      // Get all aims for these targets
      const userAims = await db
        .select({ id: aims.id })
        .from(aims)
        .where(inArray(aims.targetId, targetIds));

      const aimIds = userAims.map((a) => a.id);

      if (aimIds.length > 0) {
        // Get all shots for these aims
        const userShots = await db
          .select({ id: shots.id })
          .from(shots)
          .where(inArray(shots.aimId, aimIds));

        const shotIds = userShots.map((s) => s.id);

        // Delete scores for these shots
        if (shotIds.length > 0) {
          await db.delete(scores).where(inArray(scores.shotId, shotIds));
        }

        // Delete shots
        await db.delete(shots).where(inArray(shots.aimId, aimIds));
      }

      // Delete aims
      await db.delete(aims).where(inArray(aims.targetId, targetIds));

      // Delete targets
      await db.delete(targets).where(eq(targets.userId, userId));
    }

    // Delete portfolio snapshots
    await db
      .delete(portfolioSnapshots)
      .where(eq(portfolioSnapshots.userId, userId));

    // Delete watchlist items
    await db.delete(watchlist).where(eq(watchlist.userId, userId));

    // Log the action
    await logAudit(
      AuditActions.USER_SETTINGS_UPDATED,
      AuditEntityTypes.USER,
      userId,
      {
        action: "clear_all_trading_data",
        targetsDeleted: targetIds.length,
      }
    );

    revalidatePath("/dashboard");
    revalidatePath("/targets");
    revalidatePath("/history");
    revalidatePath("/portfolio");
    revalidatePath("/watchlist");
    revalidatePath("/settings");

    return { success: true };
  } catch (error) {
    console.error("Error clearing user data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear data",
    };
  }
}

/**
 * Delete the current user's account and all associated data
 * This is a destructive, irreversible action
 */
export async function deleteAccount(): Promise<ActionResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = session.user.dbId;

  try {
    // Log the deletion before we delete everything (audit log will be deleted too)
    // Store the audit info in a way that persists (system log)
    console.log(
      `[Account Deletion] User ${session.user.email} (${userId}) initiated account deletion`
    );

    // First, clear all trading data using the cascade behavior
    // The database has ON DELETE CASCADE set up, but we'll be explicit

    // Get all targets
    const userTargets = await db
      .select({ id: targets.id })
      .from(targets)
      .where(eq(targets.userId, userId));

    const targetIds = userTargets.map((t) => t.id);

    if (targetIds.length > 0) {
      // Get all aims
      const userAims = await db
        .select({ id: aims.id })
        .from(aims)
        .where(inArray(aims.targetId, targetIds));

      const aimIds = userAims.map((a) => a.id);

      if (aimIds.length > 0) {
        // Get all shots
        const userShots = await db
          .select({ id: shots.id })
          .from(shots)
          .where(inArray(shots.aimId, aimIds));

        const shotIds = userShots.map((s) => s.id);

        // Delete scores
        if (shotIds.length > 0) {
          await db.delete(scores).where(inArray(scores.shotId, shotIds));
        }

        // Delete shots
        await db.delete(shots).where(inArray(shots.aimId, aimIds));
      }

      // Delete aims
      await db.delete(aims).where(inArray(aims.targetId, targetIds));

      // Delete targets
      await db.delete(targets).where(eq(targets.userId, userId));
    }

    // Delete portfolio snapshots
    await db
      .delete(portfolioSnapshots)
      .where(eq(portfolioSnapshots.userId, userId));

    // Delete watchlist
    await db.delete(watchlist).where(eq(watchlist.userId, userId));

    // Delete Alpaca credentials
    await db.delete(alpacaCredentials).where(eq(alpacaCredentials.userId, userId));

    // Delete audit logs for this user
    await db.delete(auditLogs).where(eq(auditLogs.userId, userId));

    // Finally, delete the user record
    await db.delete(users).where(eq(users.id, userId));

    console.log(
      `[Account Deletion] Successfully deleted account for user ${session.user.email}`
    );

    // Sign the user out and redirect
    await signOut({ redirectTo: "/" });

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete account",
    };
  }
}
