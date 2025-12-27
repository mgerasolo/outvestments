"use server";

import { db } from "@/lib/db";
import {
  shots,
  aims,
  targets,
  type NewShot,
  type Shot,
  type Direction,
  type TriggerType,
  type ShotType,
  type ShotState,
} from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { logAudit, AuditActions, AuditEntityTypes } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/auth/rbac";

export interface ShotFormData {
  aimId: string;
  direction: Direction;
  entryPrice: number;
  entryDate: Date;
  positionSize?: number;
  triggerType: TriggerType;
  shotType: ShotType;
}

export interface ShotResult {
  success: boolean;
  error?: string;
  shot?: Shot;
}

export interface ShotsListResult {
  success: boolean;
  error?: string;
  shots?: Shot[];
}

/**
 * Create a new shot
 */
export async function createShot(data: ShotFormData): Promise<ShotResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  if (!hasPermission(session.user.role, "CREATE_SHOT")) {
    return { success: false, error: "Insufficient permissions" };
  }

  // Validate input
  if (!data.entryPrice || data.entryPrice <= 0) {
    return { success: false, error: "Entry price must be positive" };
  }

  if (!data.entryDate) {
    return { success: false, error: "Entry date is required" };
  }

  // Verify aim ownership through target
  const [aim] = await db
    .select()
    .from(aims)
    .where(and(eq(aims.id, data.aimId), isNull(aims.deletedAt)))
    .limit(1);

  if (!aim) {
    return { success: false, error: "Aim not found" };
  }

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

  try {
    const [newShot] = await db
      .insert(shots)
      .values({
        aimId: data.aimId,
        direction: data.direction,
        entryPrice: data.entryPrice.toString(),
        entryDate: data.entryDate,
        positionSize: data.positionSize?.toString() || null,
        triggerType: data.triggerType,
        shotType: data.shotType,
        state: "pending" as ShotState,
      })
      .returning();

    await logAudit(
      AuditActions.SHOT_CREATED,
      AuditEntityTypes.SHOT,
      newShot.id,
      {
        direction: newShot.direction,
        entryPrice: newShot.entryPrice,
        entryDate: newShot.entryDate.toISOString(),
        positionSize: newShot.positionSize,
        triggerType: newShot.triggerType,
        shotType: newShot.shotType,
        aimId: data.aimId,
        symbol: aim.symbol,
      }
    );

    revalidatePath(`/targets/${aim.targetId}`);
    revalidatePath("/dashboard");

    return { success: true, shot: newShot };
  } catch (error) {
    console.error("Error creating shot:", error);
    return { success: false, error: "Failed to create shot" };
  }
}

/**
 * Update shot state
 */
export async function updateShotState(
  shotId: string,
  newState: ShotState
): Promise<ShotResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Get shot and verify ownership
  const [existingShot] = await db
    .select()
    .from(shots)
    .where(and(eq(shots.id, shotId), isNull(shots.deletedAt)))
    .limit(1);

  if (!existingShot) {
    return { success: false, error: "Shot not found" };
  }

  if (!existingShot.aimId) {
    return { success: false, error: "Shot has no associated aim" };
  }

  // Verify ownership through aim -> target
  const [aim] = await db
    .select()
    .from(aims)
    .where(and(eq(aims.id, existingShot.aimId), isNull(aims.deletedAt)))
    .limit(1);

  if (!aim) {
    return { success: false, error: "Aim not found" };
  }

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

  // Validate state transition
  const validTransitions: Record<ShotState, ShotState[]> = {
    pending: ["armed", "closed"],
    armed: ["fired", "closed"],
    fired: ["active", "closed"],
    active: ["closed"],
    closed: [],
  };

  if (!validTransitions[existingShot.state].includes(newState)) {
    return {
      success: false,
      error: `Cannot transition from ${existingShot.state} to ${newState}`,
    };
  }

  // Check permission for trading actions
  if (newState === "fired" && !hasPermission(session.user.role, "EXECUTE_TRADE")) {
    return { success: false, error: "Insufficient permissions to execute trade" };
  }

  try {
    const [updatedShot] = await db
      .update(shots)
      .set({
        state: newState,
        updatedAt: new Date(),
      })
      .where(eq(shots.id, shotId))
      .returning();

    // Log appropriate action based on state
    let action: string;
    switch (newState) {
      case "armed":
        action = AuditActions.SHOT_ARMED;
        break;
      case "fired":
        action = AuditActions.SHOT_FIRED;
        break;
      case "active":
        action = AuditActions.SHOT_ACTIVE;
        break;
      case "closed":
        action =
          existingShot.state === "pending" || existingShot.state === "armed"
            ? AuditActions.SHOT_CANCELLED
            : AuditActions.SHOT_CLOSED;
        break;
      default:
        action = AuditActions.SHOT_CREATED;
    }

    await logAudit(action, AuditEntityTypes.SHOT, shotId, {
      previousState: existingShot.state,
      newState,
      symbol: aim.symbol,
    });

    revalidatePath(`/targets/${aim.targetId}`);
    revalidatePath(`/shots/${shotId}`);
    revalidatePath("/dashboard");

    return { success: true, shot: updatedShot };
  } catch (error) {
    console.error("Error updating shot state:", error);
    return { success: false, error: "Failed to update shot state" };
  }
}

/**
 * Soft delete a shot
 */
export async function deleteShot(shotId: string): Promise<ShotResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Get shot and verify ownership
  const [existingShot] = await db
    .select()
    .from(shots)
    .where(and(eq(shots.id, shotId), isNull(shots.deletedAt)))
    .limit(1);

  if (!existingShot) {
    return { success: false, error: "Shot not found" };
  }

  if (!existingShot.aimId) {
    return { success: false, error: "Shot has no associated aim" };
  }

  // Verify ownership through aim -> target
  const [aim] = await db
    .select()
    .from(aims)
    .where(and(eq(aims.id, existingShot.aimId), isNull(aims.deletedAt)))
    .limit(1);

  if (!aim) {
    return { success: false, error: "Aim not found" };
  }

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

  // Cannot delete active or closed shots
  if (existingShot.state === "active" || existingShot.state === "closed") {
    return {
      success: false,
      error: "Cannot delete active or closed shots",
    };
  }

  try {
    const [deletedShot] = await db
      .update(shots)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(shots.id, shotId))
      .returning();

    await logAudit(AuditActions.SHOT_CANCELLED, AuditEntityTypes.SHOT, shotId, {
      previousState: existingShot.state,
      symbol: aim.symbol,
    });

    revalidatePath(`/targets/${aim.targetId}`);
    revalidatePath("/dashboard");

    return { success: true, shot: deletedShot };
  } catch (error) {
    console.error("Error deleting shot:", error);
    return { success: false, error: "Failed to delete shot" };
  }
}

/**
 * Get all shots for an aim
 */
export async function getShotsByAim(aimId: string): Promise<ShotsListResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify aim ownership
  const [aim] = await db
    .select()
    .from(aims)
    .where(and(eq(aims.id, aimId), isNull(aims.deletedAt)))
    .limit(1);

  if (!aim) {
    return { success: false, error: "Aim not found" };
  }

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

  try {
    const aimShots = await db
      .select()
      .from(shots)
      .where(and(eq(shots.aimId, aimId), isNull(shots.deletedAt)))
      .orderBy(desc(shots.createdAt));

    return { success: true, shots: aimShots };
  } catch (error) {
    console.error("Error fetching shots:", error);
    return { success: false, error: "Failed to fetch shots" };
  }
}
