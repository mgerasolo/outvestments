"use server";

import { db } from "@/lib/db";
import {
  shots,
  aims,
  targets,
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
import { getAlpacaCredentials } from "./alpaca";
import {
  withCircuitBreaker,
  CircuitOpenError,
  CIRCUITS,
} from "@/lib/alpaca/circuit-breaker";

// Alpaca Paper Trading base URL
const ALPACA_PAPER_API = "https://paper-api.alpaca.markets";

interface AlpacaOrder {
  id: string;
  status: string;
  symbol: string;
  qty: string;
  filled_qty: string;
  side: string;
  type: string;
  limit_price: string | null;
  filled_avg_price: string | null;
  filled_at: string | null;
  created_at: string;
}

interface FireShotResult {
  success: boolean;
  error?: string;
  orderId?: string;
  orderStatus?: string;
}

export interface ShotFormData {
  aimId: string;
  direction: Direction;
  entryPrice: number;
  entryDate: Date;
  positionSize?: number;
  triggerType: TriggerType;
  shotType: ShotType;
  // Trading discipline field
  stopLossPrice?: number;
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
        stopLossPrice: data.stopLossPrice?.toString() || null,
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
        stopLossPrice: newShot.stopLossPrice,
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
    active: ["closed", "partially_closed"],
    partially_closed: ["closed"],
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

/**
 * Execute a trade by submitting an order to Alpaca
 * This transitions a shot from "armed" to "fired" state
 */
export async function fireShot(shotId: string): Promise<FireShotResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  if (!hasPermission(session.user.role, "EXECUTE_TRADE")) {
    return { success: false, error: "Insufficient permissions to execute trade" };
  }

  // Get shot and verify it's in armed state
  const [existingShot] = await db
    .select()
    .from(shots)
    .where(and(eq(shots.id, shotId), isNull(shots.deletedAt)))
    .limit(1);

  if (!existingShot) {
    return { success: false, error: "Shot not found" };
  }

  if (existingShot.state !== "armed") {
    return {
      success: false,
      error: `Cannot fire shot in ${existingShot.state} state. Must be armed first.`,
    };
  }

  if (!existingShot.aimId) {
    return { success: false, error: "Shot has no associated aim" };
  }

  // Get aim for symbol
  const [aim] = await db
    .select()
    .from(aims)
    .where(and(eq(aims.id, existingShot.aimId), isNull(aims.deletedAt)))
    .limit(1);

  if (!aim) {
    return { success: false, error: "Aim not found" };
  }

  // Verify ownership through target
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

  // Get Alpaca credentials
  const alpacaCreds = await getAlpacaCredentials(session.user.dbId);
  if (!alpacaCreds) {
    return {
      success: false,
      error: "Alpaca credentials not configured. Please set up your API keys in Settings.",
    };
  }

  // Calculate quantity - if no position size, default to 1 share
  const qty = existingShot.positionSize
    ? Math.floor(Number(existingShot.positionSize))
    : 1;

  if (qty < 1) {
    return { success: false, error: "Position size must be at least 1 share" };
  }

  // Build order payload
  const orderPayload: Record<string, string | number> = {
    symbol: aim.symbol,
    qty: qty,
    side: existingShot.direction, // "buy" or "sell"
    type: existingShot.triggerType, // "market" or "limit"
    time_in_force: "day", // Day orders for paper trading
  };

  // Add limit price for limit orders
  if (existingShot.triggerType === "limit") {
    orderPayload.limit_price = Number(existingShot.entryPrice);
  }

  try {
    // Submit order to Alpaca with circuit breaker protection
    const order = await withCircuitBreaker<AlpacaOrder>(
      CIRCUITS.ALPACA_ORDERS,
      async () => {
        const response = await fetch(`${ALPACA_PAPER_API}/v2/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "APCA-API-KEY-ID": alpacaCreds.apiKey,
            "APCA-API-SECRET-KEY": alpacaCreds.apiSecret,
          },
          body: JSON.stringify(orderPayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || `Alpaca API error: ${response.status}`;
          throw new Error(errorMessage);
        }

        return response.json();
      }
    ).catch(async (error) => {
      // Handle circuit breaker open state
      if (error instanceof CircuitOpenError) {
        await logAudit(AuditActions.SHOT_FIRED, AuditEntityTypes.SHOT, shotId, {
          success: false,
          error: "Alpaca API temporarily unavailable (circuit open)",
          symbol: aim.symbol,
          circuitState: "OPEN",
        });
        throw error;
      }

      // Log other errors
      await logAudit(AuditActions.SHOT_FIRED, AuditEntityTypes.SHOT, shotId, {
        success: false,
        error: error.message,
        symbol: aim.symbol,
        orderPayload,
      });
      throw error;
    });

    // Update shot with order details
    const [updatedShot] = await db
      .update(shots)
      .set({
        state: "fired",
        alpacaOrderId: order.id,
        alpacaStatus: order.status,
        fillPrice: order.filled_avg_price || null,
        filledQty: order.filled_qty || null,
        fillTimestamp: order.filled_at ? new Date(order.filled_at) : null,
        updatedAt: new Date(),
      })
      .where(eq(shots.id, shotId))
      .returning();

    await logAudit(AuditActions.SHOT_FIRED, AuditEntityTypes.SHOT, shotId, {
      success: true,
      alpacaOrderId: order.id,
      alpacaStatus: order.status,
      symbol: aim.symbol,
      direction: existingShot.direction,
      qty,
      type: existingShot.triggerType,
      limitPrice: existingShot.triggerType === "limit" ? existingShot.entryPrice : null,
    });

    revalidatePath(`/targets/${aim.targetId}`);
    revalidatePath(`/targets/${aim.targetId}/aims/${aim.id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      orderId: order.id,
      orderStatus: order.status,
    };
  } catch (error) {
    console.error("Error firing shot:", error);

    // Handle circuit breaker error with user-friendly message
    if (error instanceof CircuitOpenError) {
      return {
        success: false,
        error: "Alpaca API is temporarily unavailable. Please try again in a few moments.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit order",
    };
  }
}

/**
 * Cancel an Alpaca order for a fired shot
 * This will cancel the order on Alpaca and transition the shot to closed
 */
export async function cancelAlpacaOrder(shotId: string): Promise<ShotResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Get shot
  const [existingShot] = await db
    .select()
    .from(shots)
    .where(and(eq(shots.id, shotId), isNull(shots.deletedAt)))
    .limit(1);

  if (!existingShot) {
    return { success: false, error: "Shot not found" };
  }

  if (existingShot.state !== "fired") {
    return {
      success: false,
      error: `Cannot cancel shot in ${existingShot.state} state. Only fired shots can be cancelled.`,
    };
  }

  if (!existingShot.alpacaOrderId) {
    return { success: false, error: "Shot has no Alpaca order" };
  }

  if (!existingShot.aimId) {
    return { success: false, error: "Shot has no associated aim" };
  }

  // Get aim for verification
  const [aim] = await db
    .select()
    .from(aims)
    .where(and(eq(aims.id, existingShot.aimId), isNull(aims.deletedAt)))
    .limit(1);

  if (!aim) {
    return { success: false, error: "Aim not found" };
  }

  // Verify ownership
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

  // Get Alpaca credentials
  const alpacaCreds = await getAlpacaCredentials(session.user.dbId);
  if (!alpacaCreds) {
    return { success: false, error: "Alpaca credentials not configured" };
  }

  try {
    // Cancel order on Alpaca
    await withCircuitBreaker(
      CIRCUITS.ALPACA_ORDERS,
      async () => {
        const response = await fetch(
          `${ALPACA_PAPER_API}/v2/orders/${existingShot.alpacaOrderId}`,
          {
            method: "DELETE",
            headers: {
              "APCA-API-KEY-ID": alpacaCreds.apiKey,
              "APCA-API-SECRET-KEY": alpacaCreds.apiSecret,
            },
          }
        );

        // 204 = success, 404 = already cancelled/filled, 422 = order not cancelable
        if (!response.ok && response.status !== 204 && response.status !== 404) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Alpaca API error: ${response.status}`);
        }

        return { cancelled: true };
      }
    );

    // Update shot to closed state
    const [updatedShot] = await db
      .update(shots)
      .set({
        state: "closed",
        alpacaStatus: "canceled",
        updatedAt: new Date(),
      })
      .where(eq(shots.id, shotId))
      .returning();

    await logAudit(AuditActions.SHOT_CANCELLED, AuditEntityTypes.SHOT, shotId, {
      previousState: existingShot.state,
      alpacaOrderId: existingShot.alpacaOrderId,
      symbol: aim.symbol,
    });

    revalidatePath(`/targets/${aim.targetId}`);
    revalidatePath(`/targets/${aim.targetId}/aims/${aim.id}`);
    revalidatePath("/dashboard");

    return { success: true, shot: updatedShot };
  } catch (error) {
    console.error("Error cancelling Alpaca order:", error);

    if (error instanceof CircuitOpenError) {
      return {
        success: false,
        error: "Alpaca API is temporarily unavailable. Please try again later.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order",
    };
  }
}

/**
 * Sync order status from Alpaca
 * Call this to update fill status for pending orders
 */
export async function syncShotOrderStatus(shotId: string): Promise<ShotResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Get shot
  const [existingShot] = await db
    .select()
    .from(shots)
    .where(and(eq(shots.id, shotId), isNull(shots.deletedAt)))
    .limit(1);

  if (!existingShot) {
    return { success: false, error: "Shot not found" };
  }

  if (!existingShot.alpacaOrderId) {
    return { success: false, error: "Shot has no Alpaca order" };
  }

  if (!existingShot.aimId) {
    return { success: false, error: "Shot has no associated aim" };
  }

  // Get aim for verification
  const [aim] = await db
    .select()
    .from(aims)
    .where(and(eq(aims.id, existingShot.aimId), isNull(aims.deletedAt)))
    .limit(1);

  if (!aim) {
    return { success: false, error: "Aim not found" };
  }

  // Verify ownership
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

  // Get Alpaca credentials
  const alpacaCreds = await getAlpacaCredentials(session.user.dbId);
  if (!alpacaCreds) {
    return { success: false, error: "Alpaca credentials not configured" };
  }

  try {
    // Fetch order status from Alpaca with circuit breaker protection
    const order = await withCircuitBreaker<AlpacaOrder>(
      CIRCUITS.ALPACA_ORDERS,
      async () => {
        const response = await fetch(
          `${ALPACA_PAPER_API}/v2/orders/${existingShot.alpacaOrderId}`,
          {
            headers: {
              "APCA-API-KEY-ID": alpacaCreds.apiKey,
              "APCA-API-SECRET-KEY": alpacaCreds.apiSecret,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Alpaca API error: ${response.status}`);
        }

        return response.json();
      }
    );

    // Determine new state based on Alpaca status
    let newState: ShotState = existingShot.state;
    if (order.status === "filled") {
      newState = "active"; // Order filled, position is now active
    } else if (order.status === "canceled" || order.status === "expired") {
      newState = "closed"; // Order was canceled/expired
    }

    // Update shot with latest order details
    const [updatedShot] = await db
      .update(shots)
      .set({
        state: newState,
        alpacaStatus: order.status,
        fillPrice: order.filled_avg_price || existingShot.fillPrice,
        filledQty: order.filled_qty || existingShot.filledQty,
        fillTimestamp: order.filled_at
          ? new Date(order.filled_at)
          : existingShot.fillTimestamp,
        updatedAt: new Date(),
      })
      .where(eq(shots.id, shotId))
      .returning();

    // Log state change if applicable
    if (newState !== existingShot.state) {
      const action =
        newState === "active"
          ? AuditActions.SHOT_ACTIVE
          : AuditActions.SHOT_CLOSED;

      await logAudit(action, AuditEntityTypes.SHOT, shotId, {
        previousState: existingShot.state,
        newState,
        alpacaStatus: order.status,
        fillPrice: order.filled_avg_price,
        filledQty: order.filled_qty,
        symbol: aim.symbol,
      });
    }

    revalidatePath(`/targets/${aim.targetId}`);
    revalidatePath(`/targets/${aim.targetId}/aims/${aim.id}`);
    revalidatePath("/dashboard");

    return { success: true, shot: updatedShot };
  } catch (error) {
    console.error("Error syncing order status:", error);

    // Handle circuit breaker error with user-friendly message
    if (error instanceof CircuitOpenError) {
      return {
        success: false,
        error: "Alpaca API is temporarily unavailable. Please try again later.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync order status",
    };
  }
}

// ============================================================================
// Partial Close / Lot Splitting Functions
// ============================================================================

export interface ClosePositionData {
  shotId: string;
  quantity: number;
  exitPrice?: number; // Optional - if not provided, will use market order
}

export interface ClosePositionResult {
  success: boolean;
  error?: string;
  closedShot?: Shot;
  remainderShot?: Shot; // New shot created for remaining position
  orderId?: string;
  realizedPL?: number;
}

/**
 * Helper to verify shot ownership and get related entities
 */
async function verifyShotOwnership(
  shotId: string,
  userId: string
): Promise<{
  shot: Shot;
  aim: typeof aims.$inferSelect;
  target: typeof targets.$inferSelect;
} | null> {
  const [existingShot] = await db
    .select()
    .from(shots)
    .where(and(eq(shots.id, shotId), isNull(shots.deletedAt)))
    .limit(1);

  if (!existingShot || !existingShot.aimId) {
    return null;
  }

  const [aim] = await db
    .select()
    .from(aims)
    .where(and(eq(aims.id, existingShot.aimId), isNull(aims.deletedAt)))
    .limit(1);

  if (!aim) {
    return null;
  }

  const [target] = await db
    .select()
    .from(targets)
    .where(
      and(
        eq(targets.id, aim.targetId),
        eq(targets.userId, userId),
        isNull(targets.deletedAt)
      )
    )
    .limit(1);

  if (!target) {
    return null;
  }

  return { shot: existingShot, aim, target };
}

/**
 * Close a partial position - sells some shares and keeps others
 * Creates a new "remainder" shot for the remaining position
 */
export async function closePartialPosition(
  data: ClosePositionData
): Promise<ClosePositionResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  if (!hasPermission(session.user.role, "EXECUTE_TRADE")) {
    return { success: false, error: "Insufficient permissions to close position" };
  }

  // Verify ownership
  const ownership = await verifyShotOwnership(data.shotId, session.user.dbId);
  if (!ownership) {
    return { success: false, error: "Shot not found or access denied" };
  }

  const { shot, aim, target } = ownership;

  // Validate state - must be active to close
  if (shot.state !== "active") {
    return {
      success: false,
      error: `Cannot close shot in ${shot.state} state. Must be active.`,
    };
  }

  // Get the current position size
  const currentQty = shot.filledQty
    ? Number(shot.filledQty)
    : shot.positionSize
      ? Number(shot.positionSize)
      : 0;

  if (currentQty <= 0) {
    return { success: false, error: "No position to close" };
  }

  if (data.quantity <= 0) {
    return { success: false, error: "Quantity must be positive" };
  }

  if (data.quantity > currentQty) {
    return {
      success: false,
      error: `Cannot close ${data.quantity} shares. Only ${currentQty} available.`,
    };
  }

  // Determine if this is a partial or full close
  const isPartialClose = data.quantity < currentQty;
  const remainingQty = currentQty - data.quantity;

  // Get Alpaca credentials
  const alpacaCreds = await getAlpacaCredentials(session.user.dbId);
  if (!alpacaCreds) {
    return {
      success: false,
      error: "Alpaca credentials not configured. Please set up your API keys in Settings.",
    };
  }

  // Build close order - opposite direction
  const closeDirection = shot.direction === "buy" ? "sell" : "buy";
  const orderPayload: Record<string, string | number> = {
    symbol: aim.symbol,
    qty: data.quantity,
    side: closeDirection,
    type: data.exitPrice ? "limit" : "market",
    time_in_force: "day",
  };

  if (data.exitPrice) {
    orderPayload.limit_price = data.exitPrice;
  }

  try {
    // Submit close order to Alpaca
    const order = await withCircuitBreaker<AlpacaOrder>(
      CIRCUITS.ALPACA_ORDERS,
      async () => {
        const response = await fetch(`${ALPACA_PAPER_API}/v2/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "APCA-API-KEY-ID": alpacaCreds.apiKey,
            "APCA-API-SECRET-KEY": alpacaCreds.apiSecret,
          },
          body: JSON.stringify(orderPayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Alpaca API error: ${response.status}`);
        }

        return response.json();
      }
    );

    // Calculate realized P&L
    const entryPrice = shot.fillPrice
      ? Number(shot.fillPrice)
      : Number(shot.entryPrice);
    const exitPrice = order.filled_avg_price
      ? Number(order.filled_avg_price)
      : data.exitPrice || entryPrice;
    const realizedPL =
      shot.direction === "buy"
        ? (exitPrice - entryPrice) * data.quantity
        : (entryPrice - exitPrice) * data.quantity;

    let remainderShot: Shot | undefined;

    if (isPartialClose) {
      // Create a new shot for the remaining position
      const [newRemainderShot] = await db
        .insert(shots)
        .values({
          aimId: shot.aimId,
          direction: shot.direction,
          entryPrice: shot.entryPrice,
          entryDate: shot.entryDate,
          positionSize: remainingQty.toString(),
          triggerType: shot.triggerType,
          shotType: shot.shotType,
          state: "active",
          stopLossPrice: shot.stopLossPrice,
          alpacaOrderId: shot.alpacaOrderId, // Keep original order reference
          fillPrice: shot.fillPrice,
          fillTimestamp: shot.fillTimestamp,
          filledQty: remainingQty.toString(),
          alpacaStatus: shot.alpacaStatus,
          parentShotId: shot.id, // Reference to original shot
        })
        .returning();

      remainderShot = newRemainderShot;

      // Log the split
      await logAudit(AuditActions.SHOT_SPLIT, AuditEntityTypes.SHOT, shot.id, {
        originalQty: currentQty,
        closedQty: data.quantity,
        remainingQty,
        remainderShotId: newRemainderShot.id,
        symbol: aim.symbol,
      });

      // Update original shot to partially_closed
      const [updatedShot] = await db
        .update(shots)
        .set({
          state: "partially_closed",
          exitPrice: exitPrice.toString(),
          exitDate: new Date(),
          closedQuantity: data.quantity.toString(),
          realizedPL: realizedPL.toString(),
          alpacaCloseOrderId: order.id,
          updatedAt: new Date(),
        })
        .where(eq(shots.id, shot.id))
        .returning();

      await logAudit(
        AuditActions.SHOT_PARTIAL_CLOSED,
        AuditEntityTypes.SHOT,
        shot.id,
        {
          closedQty: data.quantity,
          remainingQty,
          exitPrice,
          realizedPL,
          alpacaCloseOrderId: order.id,
          symbol: aim.symbol,
          remainderShotId: newRemainderShot.id,
        }
      );

      revalidatePath(`/targets/${target.id}`);
      revalidatePath(`/targets/${target.id}/aims/${aim.id}`);
      revalidatePath("/dashboard");

      return {
        success: true,
        closedShot: updatedShot,
        remainderShot: newRemainderShot,
        orderId: order.id,
        realizedPL,
      };
    } else {
      // Full close - no remainder
      const [updatedShot] = await db
        .update(shots)
        .set({
          state: "closed",
          exitPrice: exitPrice.toString(),
          exitDate: new Date(),
          closedQuantity: data.quantity.toString(),
          realizedPL: realizedPL.toString(),
          alpacaCloseOrderId: order.id,
          updatedAt: new Date(),
        })
        .where(eq(shots.id, shot.id))
        .returning();

      await logAudit(AuditActions.SHOT_CLOSED, AuditEntityTypes.SHOT, shot.id, {
        closedQty: data.quantity,
        exitPrice,
        realizedPL,
        alpacaCloseOrderId: order.id,
        symbol: aim.symbol,
      });

      revalidatePath(`/targets/${target.id}`);
      revalidatePath(`/targets/${target.id}/aims/${aim.id}`);
      revalidatePath("/dashboard");

      return {
        success: true,
        closedShot: updatedShot,
        orderId: order.id,
        realizedPL,
      };
    }
  } catch (error) {
    console.error("Error closing position:", error);

    if (error instanceof CircuitOpenError) {
      return {
        success: false,
        error: "Alpaca API is temporarily unavailable. Please try again later.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to close position",
    };
  }
}

/**
 * Close full position - convenience wrapper that closes all shares
 */
export async function closeFullPosition(
  shotId: string,
  exitPrice?: number
): Promise<ClosePositionResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Get the shot to determine quantity
  const ownership = await verifyShotOwnership(shotId, session.user.dbId);
  if (!ownership) {
    return { success: false, error: "Shot not found or access denied" };
  }

  const { shot } = ownership;
  const currentQty = shot.filledQty
    ? Number(shot.filledQty)
    : shot.positionSize
      ? Number(shot.positionSize)
      : 0;

  if (currentQty <= 0) {
    return { success: false, error: "No position to close" };
  }

  return closePartialPosition({
    shotId,
    quantity: currentQty,
    exitPrice,
  });
}

/**
 * Get position details for a shot including lot information
 */
export async function getShotPositionDetails(shotId: string): Promise<{
  success: boolean;
  error?: string;
  shot?: Shot;
  currentQuantity?: number;
  averageEntryPrice?: number;
  childShots?: Shot[];
}> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  const ownership = await verifyShotOwnership(shotId, session.user.dbId);
  if (!ownership) {
    return { success: false, error: "Shot not found or access denied" };
  }

  const { shot } = ownership;

  // Get any child shots (from previous partial closes)
  const childShots = await db
    .select()
    .from(shots)
    .where(and(eq(shots.parentShotId, shotId), isNull(shots.deletedAt)))
    .orderBy(desc(shots.createdAt));

  const currentQty = shot.filledQty
    ? Number(shot.filledQty)
    : shot.positionSize
      ? Number(shot.positionSize)
      : 0;

  const avgEntryPrice = shot.fillPrice
    ? Number(shot.fillPrice)
    : Number(shot.entryPrice);

  return {
    success: true,
    shot,
    currentQuantity: currentQty,
    averageEntryPrice: avgEntryPrice,
    childShots,
  };
}
