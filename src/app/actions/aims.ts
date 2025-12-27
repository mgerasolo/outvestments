"use server";

import { db } from "@/lib/db";
import { aims, targets, type NewAim, type Aim } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { logAudit, AuditActions, AuditEntityTypes } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/auth/rbac";

export interface AimFormData {
  targetId: string;
  symbol: string;
  targetPriceRealistic: number;
  targetPriceReach?: number;
  targetDate: Date;
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
