"use server";

import { db } from "@/lib/db";
import { aims, targets, shots, type NewAim, type Aim } from "@/lib/db/schema";
import { eq, and, isNull, desc, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { logAudit, AuditActions, AuditEntityTypes } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/auth/rbac";
import {
  closeAim as closeAimService,
  rolloverAim as rolloverAimService,
  getExpiringAims,
  type AimWithExpiryInfo,
  type ExpiringAimsResult,
} from "@/lib/aim-lifecycle";
import { calculateAndStoreAimScore } from "./scoring";

export interface AimFormData {
  targetId: string;
  symbol: string;
  targetPriceRealistic: number;
  targetPriceReach?: number;
  targetDate: Date;
  // Trading discipline fields
  stopLossPrice?: number;
  takeProfitPrice?: number;
  exitConditions?: string;
}

export interface AimResult {
  success: boolean;
  error?: string;
  aim?: Aim;
}

export interface AimsListResult {
  success: boolean;
  error?: string;
  aims?: Aim[];
}

/**
 * Create a new aim
 */
export async function createAim(data: AimFormData): Promise<AimResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  if (!hasPermission(session.user.role, "CREATE_AIM")) {
    return { success: false, error: "Insufficient permissions" };
  }

  // Validate input
  if (!data.symbol || data.symbol.trim().length < 1) {
    return { success: false, error: "Symbol is required" };
  }

  if (!data.targetPriceRealistic || data.targetPriceRealistic <= 0) {
    return { success: false, error: "Realistic target price must be positive" };
  }

  if (data.targetPriceReach && data.targetPriceReach <= 0) {
    return { success: false, error: "Reach target price must be positive" };
  }

  if (!data.targetDate) {
    return { success: false, error: "Target date is required" };
  }

  // Verify target ownership
  const [target] = await db
    .select()
    .from(targets)
    .where(
      and(
        eq(targets.id, data.targetId),
        eq(targets.userId, session.user.dbId),
        isNull(targets.deletedAt)
      )
    )
    .limit(1);

  if (!target) {
    return { success: false, error: "Target not found" };
  }

  try {
    const [newAim] = await db
      .insert(aims)
      .values({
        targetId: data.targetId,
        symbol: data.symbol.trim().toUpperCase(),
        targetPriceRealistic: data.targetPriceRealistic.toString(),
        targetPriceReach: data.targetPriceReach?.toString() || null,
        targetDate: data.targetDate,
        // Trading discipline fields
        stopLossPrice: data.stopLossPrice?.toString() || null,
        takeProfitPrice: data.takeProfitPrice?.toString() || null,
        exitConditions: data.exitConditions?.trim() || null,
      })
      .returning();

    await logAudit(
      AuditActions.AIM_CREATED,
      AuditEntityTypes.AIM,
      newAim.id,
      {
        symbol: newAim.symbol,
        targetPriceRealistic: newAim.targetPriceRealistic,
        targetPriceReach: newAim.targetPriceReach,
        targetDate: newAim.targetDate.toISOString(),
        parentTargetId: data.targetId,
        stopLossPrice: newAim.stopLossPrice,
        takeProfitPrice: newAim.takeProfitPrice,
      }
    );

    revalidatePath(`/targets/${data.targetId}`);
    revalidatePath("/dashboard");

    return { success: true, aim: newAim };
  } catch (error) {
    console.error("Error creating aim:", error);
    return { success: false, error: "Failed to create aim" };
  }
}

/**
 * Update an existing aim
 */
export async function updateAim(
  aimId: string,
  data: Partial<Omit<AimFormData, "targetId">>
): Promise<AimResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get aim and verify target ownership
    const [existingAim] = await db
      .select()
      .from(aims)
      .where(and(eq(aims.id, aimId), isNull(aims.deletedAt)))
      .limit(1);

    if (!existingAim) {
      return { success: false, error: "Aim not found" };
    }

    // Verify target ownership
    const [target] = await db
      .select()
      .from(targets)
      .where(
        and(
          eq(targets.id, existingAim.targetId),
          eq(targets.userId, session.user.dbId),
          isNull(targets.deletedAt)
        )
      )
      .limit(1);

    if (!target) {
      return { success: false, error: "Target not found" };
    }

    const updateData: Partial<NewAim> = {
      updatedAt: new Date(),
    };

    if (data.symbol !== undefined) {
      updateData.symbol = data.symbol.trim().toUpperCase();
    }

    if (data.targetPriceRealistic !== undefined) {
      if (data.targetPriceRealistic <= 0) {
        return { success: false, error: "Realistic target price must be positive" };
      }
      updateData.targetPriceRealistic = data.targetPriceRealistic.toString();
    }

    if (data.targetPriceReach !== undefined) {
      updateData.targetPriceReach = data.targetPriceReach
        ? data.targetPriceReach.toString()
        : null;
    }

    if (data.targetDate !== undefined) {
      updateData.targetDate = data.targetDate;
    }

    // Trading discipline fields
    if (data.stopLossPrice !== undefined) {
      updateData.stopLossPrice = data.stopLossPrice?.toString() || null;
    }

    if (data.takeProfitPrice !== undefined) {
      updateData.takeProfitPrice = data.takeProfitPrice?.toString() || null;
    }

    if (data.exitConditions !== undefined) {
      updateData.exitConditions = data.exitConditions?.trim() || null;
    }

    const [updatedAim] = await db
      .update(aims)
      .set(updateData)
      .where(eq(aims.id, aimId))
      .returning();

    await logAudit(
      AuditActions.AIM_UPDATED,
      AuditEntityTypes.AIM,
      aimId,
      {
        changes: data,
        previousSymbol: existingAim.symbol,
      }
    );

    revalidatePath(`/targets/${existingAim.targetId}`);
    revalidatePath(`/aims/${aimId}`);
    revalidatePath("/dashboard");

    return { success: true, aim: updatedAim };
  } catch (error) {
    console.error("Error updating aim:", error);
    return { success: false, error: "Failed to update aim" };
  }
}

/**
 * Soft delete an aim
 */
export async function deleteAim(aimId: string): Promise<AimResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get aim and verify target ownership
    const [existingAim] = await db
      .select()
      .from(aims)
      .where(and(eq(aims.id, aimId), isNull(aims.deletedAt)))
      .limit(1);

    if (!existingAim) {
      return { success: false, error: "Aim not found" };
    }

    // Verify target ownership
    const [target] = await db
      .select()
      .from(targets)
      .where(
        and(
          eq(targets.id, existingAim.targetId),
          eq(targets.userId, session.user.dbId),
          isNull(targets.deletedAt)
        )
      )
      .limit(1);

    if (!target) {
      return { success: false, error: "Target not found" };
    }

    const [deletedAim] = await db
      .update(aims)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(aims.id, aimId))
      .returning();

    await logAudit(
      AuditActions.AIM_DELETED,
      AuditEntityTypes.AIM,
      aimId,
      {
        symbol: existingAim.symbol,
        parentTargetId: existingAim.targetId,
      }
    );

    revalidatePath(`/targets/${existingAim.targetId}`);
    revalidatePath("/dashboard");

    return { success: true, aim: deletedAim };
  } catch (error) {
    console.error("Error deleting aim:", error);
    return { success: false, error: "Failed to delete aim" };
  }
}

/**
 * Get all aims for a target
 */
export async function getAimsByTarget(targetId: string): Promise<AimsListResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Verify target ownership
    const [target] = await db
      .select()
      .from(targets)
      .where(
        and(
          eq(targets.id, targetId),
          eq(targets.userId, session.user.dbId),
          isNull(targets.deletedAt)
        )
      )
      .limit(1);

    if (!target) {
      return { success: false, error: "Target not found" };
    }

    const targetAims = await db
      .select()
      .from(aims)
      .where(and(eq(aims.targetId, targetId), isNull(aims.deletedAt)))
      .orderBy(desc(aims.createdAt));

    return { success: true, aims: targetAims };
  } catch (error) {
    console.error("Error fetching aims:", error);
    return { success: false, error: "Failed to fetch aims" };
  }
}

/**
 * Get a single aim by ID
 */
export async function getAim(aimId: string): Promise<AimResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const [aim] = await db
      .select()
      .from(aims)
      .where(and(eq(aims.id, aimId), isNull(aims.deletedAt)))
      .limit(1);

    if (!aim) {
      return { success: false, error: "Aim not found" };
    }

    // Verify target ownership
    const [target] = await db
      .select()
      .from(targets)
      .where(
        and(
          eq(targets.id, aim.targetId),
          eq(targets.userId, session.user.dbId),
          isNull(targets.deletedAt)
        )
      )
      .limit(1);

    if (!target) {
      return { success: false, error: "Target not found" };
    }

    return { success: true, aim };
  } catch (error) {
    console.error("Error fetching aim:", error);
    return { success: false, error: "Failed to fetch aim" };
  }
}

// ============================================================================
// Aim Lifecycle Actions
// ============================================================================

export interface ExpiringAimsActionResult {
  success: boolean;
  error?: string;
  data?: ExpiringAimsResult;
}

/**
 * Get all expiring and expired aims for the current user
 */
export async function getUserExpiringAims(): Promise<ExpiringAimsActionResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const data = await getExpiringAims(session.user.dbId);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching expiring aims:", error);
    return { success: false, error: "Failed to fetch expiring aims" };
  }
}

/**
 * Close an aim (mark as closed, no further action needed)
 */
export async function closeAimAction(
  aimId: string,
  reason: "manual" | "hit" | "liquidated" = "manual"
): Promise<AimResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Verify ownership
    const [existingAim] = await db
      .select()
      .from(aims)
      .where(and(eq(aims.id, aimId), isNull(aims.deletedAt)))
      .limit(1);

    if (!existingAim) {
      return { success: false, error: "Aim not found" };
    }

    const [target] = await db
      .select()
      .from(targets)
      .where(
        and(
          eq(targets.id, existingAim.targetId),
          eq(targets.userId, session.user.dbId),
          isNull(targets.deletedAt)
        )
      )
      .limit(1);

    if (!target) {
      return { success: false, error: "Target not found" };
    }

    // Check for active shots
    const activeShots = await db
      .select()
      .from(shots)
      .where(
        and(
          eq(shots.aimId, aimId),
          eq(shots.state, "active"),
          isNull(shots.deletedAt)
        )
      );

    if (activeShots.length > 0 && reason !== "liquidated") {
      return {
        success: false,
        error: `Cannot close aim with ${activeShots.length} active shot(s). Liquidate or close shots first.`,
      };
    }

    const closedAim = await closeAimService(aimId, reason);

    if (!closedAim) {
      return { success: false, error: "Failed to close aim" };
    }

    await logAudit(
      AuditActions.AIM_UPDATED,
      AuditEntityTypes.AIM,
      aimId,
      {
        action: "closed",
        reason,
        previousStatus: existingAim.status,
      }
    );

    revalidatePath(`/targets/${existingAim.targetId}`);
    revalidatePath(`/targets/${existingAim.targetId}/aims/${aimId}`);
    revalidatePath("/dashboard");

    // Calculate and store aim score (cascades to target and user scores)
    try {
      await calculateAndStoreAimScore(aimId);
    } catch (scoreError) {
      console.error("Error calculating aim score:", scoreError);
      // Don't fail the close operation if scoring fails
    }

    return { success: true, aim: closedAim };
  } catch (error) {
    console.error("Error closing aim:", error);
    return { success: false, error: "Failed to close aim" };
  }
}

/**
 * Rollover an aim to a new target date
 */
export async function rolloverAimAction(
  aimId: string,
  newTargetDate: Date,
  newTargetPrice?: number
): Promise<AimResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  if (!newTargetDate || new Date(newTargetDate) <= new Date()) {
    return { success: false, error: "New target date must be in the future" };
  }

  try {
    // Verify ownership
    const [existingAim] = await db
      .select()
      .from(aims)
      .where(and(eq(aims.id, aimId), isNull(aims.deletedAt)))
      .limit(1);

    if (!existingAim) {
      return { success: false, error: "Aim not found" };
    }

    const [target] = await db
      .select()
      .from(targets)
      .where(
        and(
          eq(targets.id, existingAim.targetId),
          eq(targets.userId, session.user.dbId),
          isNull(targets.deletedAt)
        )
      )
      .limit(1);

    if (!target) {
      return { success: false, error: "Target not found" };
    }

    const newAim = await rolloverAimService(aimId, newTargetDate, newTargetPrice);

    if (!newAim) {
      return { success: false, error: "Failed to rollover aim" };
    }

    await logAudit(
      AuditActions.AIM_CREATED,
      AuditEntityTypes.AIM,
      newAim.id,
      {
        action: "rollover",
        rolledFromId: aimId,
        originalSymbol: existingAim.symbol,
        originalTargetDate: existingAim.targetDate.toISOString(),
        newTargetDate: newTargetDate.toISOString(),
        newTargetPrice,
      }
    );

    revalidatePath(`/targets/${existingAim.targetId}`);
    revalidatePath("/dashboard");

    return { success: true, aim: newAim };
  } catch (error) {
    console.error("Error rolling over aim:", error);
    return { success: false, error: "Failed to rollover aim" };
  }
}

/**
 * Liquidate an aim - close all active shots and mark aim as closed
 */
export async function liquidateAimAction(aimId: string): Promise<AimResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Verify ownership
    const [existingAim] = await db
      .select()
      .from(aims)
      .where(and(eq(aims.id, aimId), isNull(aims.deletedAt)))
      .limit(1);

    if (!existingAim) {
      return { success: false, error: "Aim not found" };
    }

    const [target] = await db
      .select()
      .from(targets)
      .where(
        and(
          eq(targets.id, existingAim.targetId),
          eq(targets.userId, session.user.dbId),
          isNull(targets.deletedAt)
        )
      )
      .limit(1);

    if (!target) {
      return { success: false, error: "Target not found" };
    }

    // Get all active shots for this aim
    const activeShots = await db
      .select()
      .from(shots)
      .where(
        and(
          eq(shots.aimId, aimId),
          eq(shots.state, "active"),
          isNull(shots.deletedAt)
        )
      );

    // TODO: In production, this should trigger Alpaca API calls to close positions
    // For now, we just mark shots as closed in the database
    if (activeShots.length > 0) {
      const shotIds = activeShots.map((s) => s.id);
      await db
        .update(shots)
        .set({
          state: "closed",
          updatedAt: new Date(),
        })
        .where(inArray(shots.id, shotIds));
    }

    // Close the aim as liquidated
    const closedAim = await closeAimService(aimId, "liquidated");

    if (!closedAim) {
      return { success: false, error: "Failed to liquidate aim" };
    }

    await logAudit(
      AuditActions.AIM_UPDATED,
      AuditEntityTypes.AIM,
      aimId,
      {
        action: "liquidated",
        shotsClosed: activeShots.length,
        previousStatus: existingAim.status,
      }
    );

    revalidatePath(`/targets/${existingAim.targetId}`);
    revalidatePath(`/targets/${existingAim.targetId}/aims/${aimId}`);
    revalidatePath("/dashboard");

    return { success: true, aim: closedAim };
  } catch (error) {
    console.error("Error liquidating aim:", error);
    return { success: false, error: "Failed to liquidate aim" };
  }
}
