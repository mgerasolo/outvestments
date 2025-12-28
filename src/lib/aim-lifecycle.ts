/**
 * Aim Lifecycle Management
 *
 * Handles aim expiry detection, status transitions, and lifecycle actions
 * (close, rollover, liquidate).
 */

import { db } from "@/lib/db";
import { aims, shots, type Aim, type AimStatus } from "@/lib/db/schema";
import { eq, and, isNull, lt, gte, inArray } from "drizzle-orm";

// Constants
const EXPIRING_THRESHOLD_DAYS = 7; // Aims are "expiring" within 7 days of target

export interface AimWithExpiryInfo extends Aim {
  daysUntilExpiry: number;
  isExpiring: boolean;
  isExpired: boolean;
  hasActiveShots: boolean;
}

export interface ExpiringAimsResult {
  expiring: AimWithExpiryInfo[]; // Within threshold but not expired
  expired: AimWithExpiryInfo[]; // Past target date
}

/**
 * Calculate days until an aim expires (negative if already expired)
 */
export function calculateDaysUntilExpiry(targetDate: Date): number {
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determine if an aim is in "expiring" state (within threshold)
 */
export function isAimExpiring(targetDate: Date): boolean {
  const days = calculateDaysUntilExpiry(targetDate);
  return days >= 0 && days <= EXPIRING_THRESHOLD_DAYS;
}

/**
 * Determine if an aim is expired (past target date)
 */
export function isAimExpired(targetDate: Date): boolean {
  return calculateDaysUntilExpiry(targetDate) < 0;
}

/**
 * Get the computed status for an aim based on target date
 * This is used for display and doesn't modify the database
 */
export function getComputedAimStatus(aim: Aim): AimStatus {
  // If already in a terminal state, return as-is
  if (["closed", "hit", "rolled_over"].includes(aim.status)) {
    return aim.status;
  }

  const daysUntil = calculateDaysUntilExpiry(aim.targetDate);

  if (daysUntil < 0) {
    return "expired";
  } else if (daysUntil <= EXPIRING_THRESHOLD_DAYS) {
    return "expiring";
  }

  return "active";
}

/**
 * Enrich an aim with expiry information
 */
export function enrichAimWithExpiryInfo(
  aim: Aim,
  activeShots: boolean = false
): AimWithExpiryInfo {
  const daysUntilExpiry = calculateDaysUntilExpiry(aim.targetDate);

  return {
    ...aim,
    daysUntilExpiry,
    isExpiring: daysUntilExpiry >= 0 && daysUntilExpiry <= EXPIRING_THRESHOLD_DAYS,
    isExpired: daysUntilExpiry < 0,
    hasActiveShots: activeShots,
  };
}

/**
 * Get all expiring and expired aims for a user
 */
export async function getExpiringAims(userId: string): Promise<ExpiringAimsResult> {
  const now = new Date();
  const expiryThresholdDate = new Date();
  expiryThresholdDate.setDate(expiryThresholdDate.getDate() + EXPIRING_THRESHOLD_DAYS);

  // Get all active aims that are expiring or expired
  // We need to join through targets to filter by userId
  const userAims = await db.query.aims.findMany({
    where: and(
      isNull(aims.deletedAt),
      inArray(aims.status, ["active", "expiring", "expired"])
    ),
    with: {
      target: true,
      shots: true,
    },
  });

  // Filter to user's aims and enrich with expiry info
  const userFilteredAims = userAims.filter(
    (aim) => aim.target?.userId === userId
  );

  const expiring: AimWithExpiryInfo[] = [];
  const expired: AimWithExpiryInfo[] = [];

  for (const aim of userFilteredAims) {
    const hasActiveShots = aim.shots?.some(
      (s: { state: string; deletedAt: Date | null }) => s.state === "active" && !s.deletedAt
    ) ?? false;

    const enriched = enrichAimWithExpiryInfo(aim, hasActiveShots);

    if (enriched.isExpired) {
      expired.push(enriched);
    } else if (enriched.isExpiring) {
      expiring.push(enriched);
    }
  }

  // Sort by urgency (most urgent first)
  expiring.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  expired.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  return { expiring, expired };
}

/**
 * Update aim statuses based on current date
 * Run this periodically (e.g., hourly or daily) to keep statuses current
 */
export async function updateAimStatuses(): Promise<{
  updated: number;
  errors: string[];
}> {
  const now = new Date();
  const expiryThresholdDate = new Date();
  expiryThresholdDate.setDate(expiryThresholdDate.getDate() + EXPIRING_THRESHOLD_DAYS);

  let updated = 0;
  const errors: string[] = [];

  try {
    // Mark aims as expired (past target date, currently active or expiring)
    const expiredResult = await db
      .update(aims)
      .set({
        status: "expired",
        updatedAt: now,
      })
      .where(
        and(
          isNull(aims.deletedAt),
          inArray(aims.status, ["active", "expiring"]),
          lt(aims.targetDate, now)
        )
      );

    // Mark aims as expiring (within threshold, currently active)
    const expiringResult = await db
      .update(aims)
      .set({
        status: "expiring",
        updatedAt: now,
      })
      .where(
        and(
          isNull(aims.deletedAt),
          eq(aims.status, "active"),
          gte(aims.targetDate, now),
          lt(aims.targetDate, expiryThresholdDate)
        )
      );

    // Note: Drizzle doesn't directly return count for updates,
    // so we log that updates were attempted
    console.log("[AimLifecycle] Status update completed");
    updated = 1; // Indicate success
  } catch (error) {
    console.error("[AimLifecycle] Error updating statuses:", error);
    errors.push(error instanceof Error ? error.message : "Unknown error");
  }

  return { updated, errors };
}

/**
 * Close an aim manually
 */
export async function closeAim(
  aimId: string,
  reason: "manual" | "hit" | "liquidated" = "manual"
): Promise<Aim | null> {
  const now = new Date();

  const [updatedAim] = await db
    .update(aims)
    .set({
      status: reason === "hit" ? "hit" : "closed",
      closedAt: now,
      closedReason: reason,
      updatedAt: now,
    })
    .where(and(eq(aims.id, aimId), isNull(aims.deletedAt)))
    .returning();

  return updatedAim || null;
}

/**
 * Rollover an aim to a new target date
 * Creates a new aim with updated date, links to original
 */
export async function rolloverAim(
  aimId: string,
  newTargetDate: Date,
  newTargetPrice?: number
): Promise<Aim | null> {
  const now = new Date();

  // Get the original aim
  const [originalAim] = await db
    .select()
    .from(aims)
    .where(and(eq(aims.id, aimId), isNull(aims.deletedAt)))
    .limit(1);

  if (!originalAim) {
    return null;
  }

  // Mark the original as rolled over
  await db
    .update(aims)
    .set({
      status: "rolled_over",
      closedAt: now,
      closedReason: "rolled_over",
      updatedAt: now,
    })
    .where(eq(aims.id, aimId));

  // Create the new aim
  const [newAim] = await db
    .insert(aims)
    .values({
      targetId: originalAim.targetId,
      symbol: originalAim.symbol,
      targetPriceRealistic: newTargetPrice?.toString() || originalAim.targetPriceRealistic,
      targetPriceReach: originalAim.targetPriceReach,
      targetDate: newTargetDate,
      status: "active",
      rolledFromId: originalAim.id,
    })
    .returning();

  return newAim || null;
}

/**
 * Get aim status display info for UI
 */
export function getAimStatusDisplay(aim: Aim): {
  label: string;
  color: string;
  description: string;
} {
  const computedStatus = getComputedAimStatus(aim);
  const daysUntil = calculateDaysUntilExpiry(aim.targetDate);

  switch (computedStatus) {
    case "active":
      return {
        label: "Active",
        color: "green",
        description: `${daysUntil} days remaining`,
      };
    case "expiring":
      return {
        label: "Expiring Soon",
        color: "yellow",
        description: daysUntil === 0 ? "Expires today" : `${daysUntil} day${daysUntil > 1 ? "s" : ""} left`,
      };
    case "expired":
      return {
        label: "Expired",
        color: "red",
        description: `Expired ${Math.abs(daysUntil)} day${Math.abs(daysUntil) > 1 ? "s" : ""} ago`,
      };
    case "closed":
      return {
        label: "Closed",
        color: "gray",
        description: aim.closedReason || "Manually closed",
      };
    case "hit":
      return {
        label: "Target Hit",
        color: "green",
        description: "Price target reached",
      };
    case "rolled_over":
      return {
        label: "Rolled Over",
        color: "blue",
        description: "Extended to new date",
      };
    default:
      return {
        label: computedStatus,
        color: "gray",
        description: "",
      };
  }
}
