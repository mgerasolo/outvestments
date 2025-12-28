"use server";

import { db } from "@/lib/db";
import { targets, type NewTarget, type Target, type TargetType, type TargetStatus } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { logAudit, AuditActions, AuditEntityTypes } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/auth/rbac";

export interface TargetFormData {
  thesis: string;
  targetType: TargetType;
  catalyst?: string;
  tags?: string[];
  // Trading discipline fields
  confidenceLevel?: number;
  risks?: string;
  exitTriggers?: string;
}

export interface TargetResult {
  success: boolean;
  error?: string;
  target?: Target;
}

export interface TargetsListResult {
  success: boolean;
  error?: string;
  targets?: Target[];
}

/**
 * Create a new target
 */
export async function createTarget(data: TargetFormData): Promise<TargetResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  if (!hasPermission(session.user.role, "CREATE_TARGET")) {
    return { success: false, error: "Insufficient permissions" };
  }

  // Validate input
  if (!data.thesis || data.thesis.trim().length < 10) {
    return { success: false, error: "Thesis must be at least 10 characters" };
  }

  if (!data.targetType) {
    return { success: false, error: "Target type is required" };
  }

  try {
    const [newTarget] = await db
      .insert(targets)
      .values({
        userId: session.user.dbId,
        thesis: data.thesis.trim(),
        targetType: data.targetType,
        catalyst: data.catalyst?.trim() || null,
        tags: data.tags || [],
        status: "active" as TargetStatus,
        // Trading discipline fields
        confidenceLevel: data.confidenceLevel?.toString() || null,
        risks: data.risks?.trim() || null,
        exitTriggers: data.exitTriggers?.trim() || null,
      })
      .returning();

    await logAudit(
      AuditActions.TARGET_CREATED,
      AuditEntityTypes.TARGET,
      newTarget.id,
      {
        thesis: newTarget.thesis.substring(0, 100),
        targetType: newTarget.targetType,
        catalyst: newTarget.catalyst,
        tags: newTarget.tags,
        confidenceLevel: newTarget.confidenceLevel,
      }
    );

    revalidatePath("/targets");
    revalidatePath("/dashboard");

    return { success: true, target: newTarget };
  } catch (error) {
    console.error("Error creating target:", error);
    return { success: false, error: "Failed to create target" };
  }
}

/**
 * Update an existing target
 */
export async function updateTarget(
  targetId: string,
  data: Partial<TargetFormData>
): Promise<TargetResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Verify ownership
    const existing = await db
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

    if (existing.length === 0) {
      return { success: false, error: "Target not found" };
    }

    const updateData: Partial<NewTarget> = {
      updatedAt: new Date(),
    };

    if (data.thesis !== undefined) {
      if (data.thesis.trim().length < 10) {
        return { success: false, error: "Thesis must be at least 10 characters" };
      }
      updateData.thesis = data.thesis.trim();
    }

    if (data.targetType !== undefined) {
      updateData.targetType = data.targetType;
    }

    if (data.catalyst !== undefined) {
      updateData.catalyst = data.catalyst.trim() || null;
    }

    if (data.tags !== undefined) {
      updateData.tags = data.tags;
    }

    // Trading discipline fields
    if (data.confidenceLevel !== undefined) {
      updateData.confidenceLevel = data.confidenceLevel?.toString() || null;
    }

    if (data.risks !== undefined) {
      updateData.risks = data.risks?.trim() || null;
    }

    if (data.exitTriggers !== undefined) {
      updateData.exitTriggers = data.exitTriggers?.trim() || null;
    }

    const [updatedTarget] = await db
      .update(targets)
      .set(updateData)
      .where(eq(targets.id, targetId))
      .returning();

    await logAudit(
      AuditActions.TARGET_UPDATED,
      AuditEntityTypes.TARGET,
      targetId,
      {
        changes: data,
        previousThesis: existing[0].thesis.substring(0, 100),
      }
    );

    revalidatePath("/targets");
    revalidatePath(`/targets/${targetId}`);
    revalidatePath("/dashboard");

    return { success: true, target: updatedTarget };
  } catch (error) {
    console.error("Error updating target:", error);
    return { success: false, error: "Failed to update target" };
  }
}

/**
 * Soft delete a target (sets deletedAt)
 */
export async function deleteTarget(targetId: string): Promise<TargetResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Verify ownership
    const existing = await db
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

    if (existing.length === 0) {
      return { success: false, error: "Target not found" };
    }

    const [deletedTarget] = await db
      .update(targets)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(targets.id, targetId))
      .returning();

    await logAudit(
      AuditActions.TARGET_DELETED,
      AuditEntityTypes.TARGET,
      targetId,
      {
        thesis: existing[0].thesis.substring(0, 100),
      }
    );

    revalidatePath("/targets");
    revalidatePath("/dashboard");

    return { success: true, target: deletedTarget };
  } catch (error) {
    console.error("Error deleting target:", error);
    return { success: false, error: "Failed to delete target" };
  }
}

/**
 * Archive a target
 */
export async function archiveTarget(targetId: string): Promise<TargetResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Verify ownership
    const existing = await db
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

    if (existing.length === 0) {
      return { success: false, error: "Target not found" };
    }

    const [archivedTarget] = await db
      .update(targets)
      .set({
        status: "archived" as TargetStatus,
        updatedAt: new Date(),
      })
      .where(eq(targets.id, targetId))
      .returning();

    await logAudit(
      AuditActions.TARGET_ARCHIVED,
      AuditEntityTypes.TARGET,
      targetId,
      {
        thesis: existing[0].thesis.substring(0, 100),
        previousStatus: existing[0].status,
      }
    );

    revalidatePath("/targets");
    revalidatePath(`/targets/${targetId}`);
    revalidatePath("/dashboard");

    return { success: true, target: archivedTarget };
  } catch (error) {
    console.error("Error archiving target:", error);
    return { success: false, error: "Failed to archive target" };
  }
}

/**
 * Get all targets for the current user
 */
export async function getTargets(
  status?: TargetStatus,
  includeArchived = false
): Promise<TargetsListResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const conditions = [
      eq(targets.userId, session.user.dbId),
      isNull(targets.deletedAt),
    ];

    if (status) {
      conditions.push(eq(targets.status, status));
    } else if (!includeArchived) {
      // By default, exclude archived targets
      conditions.push(eq(targets.status, "active"));
    }

    const userTargets = await db
      .select()
      .from(targets)
      .where(and(...conditions))
      .orderBy(desc(targets.createdAt));

    return { success: true, targets: userTargets };
  } catch (error) {
    console.error("Error fetching targets:", error);
    return { success: false, error: "Failed to fetch targets" };
  }
}

/**
 * Get a single target by ID
 */
export async function getTarget(targetId: string): Promise<TargetResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
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

    return { success: true, target };
  } catch (error) {
    console.error("Error fetching target:", error);
    return { success: false, error: "Failed to fetch target" };
  }
}
