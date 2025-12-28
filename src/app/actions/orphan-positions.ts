"use server";

import { db } from "@/lib/db";
import { shots, aims, targets, type ShotState } from "@/lib/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { logAudit, AuditActions, AuditEntityTypes } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/auth/rbac";
import { getAlpacaCredentials, type AlpacaPosition } from "./alpaca";
import {
  withCircuitBreaker,
  CircuitOpenError,
  CIRCUITS,
} from "@/lib/alpaca/circuit-breaker";

const ALPACA_PAPER_API = "https://paper-api.alpaca.markets";

export interface OrphanPosition {
  symbol: string;
  qty: string;
  avgEntryPrice: string;
  marketValue: string;
  currentPrice: string;
  unrealizedPL: string;
  unrealizedPLPercent: string;
  side: string;
}

export interface OrphanPositionsResult {
  success: boolean;
  error?: string;
  orphanPositions?: OrphanPosition[];
  trackedSymbols?: string[];
}

/**
 * Detect orphan positions - positions in Alpaca that aren't tracked in Outvestments
 * Compares Alpaca positions with active Shots
 */
export async function detectOrphanPositions(): Promise<OrphanPositionsResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  const alpacaCreds = await getAlpacaCredentials(session.user.dbId);
  if (!alpacaCreds) {
    return { success: false, error: "Alpaca credentials not configured" };
  }

  try {
    // Fetch positions from Alpaca
    const positions = await withCircuitBreaker<AlpacaPosition[]>(
      CIRCUITS.ALPACA_ACCOUNT,
      async () => {
        const response = await fetch(`${ALPACA_PAPER_API}/v2/positions`, {
          headers: {
            "APCA-API-KEY-ID": alpacaCreds.apiKey,
            "APCA-API-SECRET-KEY": alpacaCreds.apiSecret,
          },
        });
        if (!response.ok) {
          throw new Error(`Positions fetch failed: ${response.status}`);
        }
        return response.json();
      }
    );

    if (!positions || positions.length === 0) {
      return { success: true, orphanPositions: [], trackedSymbols: [] };
    }

    // Get all symbols from Alpaca positions
    const alpacaSymbols = positions.map((p) => p.symbol);

    // Get all active shots for the user with their aim symbols
    // Active shots are in states: active, fired, partially_closed
    const activeStates: ShotState[] = ["active", "fired", "partially_closed"];

    // Join shots -> aims -> targets to get symbols for active shots owned by user
    const trackedShots = await db
      .select({
        symbol: aims.symbol,
      })
      .from(shots)
      .innerJoin(aims, eq(shots.aimId, aims.id))
      .innerJoin(targets, eq(aims.targetId, targets.id))
      .where(
        and(
          eq(targets.userId, session.user.dbId),
          isNull(shots.deletedAt),
          isNull(aims.deletedAt),
          isNull(targets.deletedAt),
          inArray(shots.state, activeStates)
        )
      );

    // Get unique tracked symbols
    const trackedSymbols = [...new Set(trackedShots.map((s) => s.symbol))];

    // Find orphan positions (in Alpaca but not tracked)
    const orphanPositions: OrphanPosition[] = positions
      .filter((position) => !trackedSymbols.includes(position.symbol))
      .map((position) => ({
        symbol: position.symbol,
        qty: position.qty,
        avgEntryPrice: position.avg_entry_price,
        marketValue: position.market_value,
        currentPrice: position.current_price,
        unrealizedPL: position.unrealized_pl,
        unrealizedPLPercent: position.unrealized_plpc,
        side: position.side,
      }));

    return {
      success: true,
      orphanPositions,
      trackedSymbols,
    };
  } catch (error) {
    console.error("Error detecting orphan positions:", error);

    if (error instanceof CircuitOpenError) {
      return {
        success: false,
        error: "Alpaca API is temporarily unavailable. Please try again later.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to detect orphan positions",
    };
  }
}

export interface AdoptPositionData {
  symbol: string;
  quantity: number;
  avgEntryPrice: number;
  thesis: string;
  targetType: "growth" | "value" | "momentum" | "dividend" | "speculative";
  targetPriceRealistic: number;
  targetPriceReach?: number;
  targetDate: Date;
  stopLossPrice?: number;
}

export interface AdoptPositionResult {
  success: boolean;
  error?: string;
  targetId?: string;
  aimId?: string;
  shotId?: string;
}

/**
 * Adopt an orphan position by creating Target, Aim, and Shot
 * Pre-fills with position data from Alpaca
 */
export async function adoptOrphanPosition(
  data: AdoptPositionData
): Promise<AdoptPositionResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  if (!hasPermission(session.user.role, "CREATE_TARGET")) {
    return { success: false, error: "Insufficient permissions" };
  }

  // Validate input
  if (!data.symbol || data.symbol.trim().length < 1) {
    return { success: false, error: "Symbol is required" };
  }

  if (!data.thesis || data.thesis.trim().length < 10) {
    return { success: false, error: "Thesis must be at least 10 characters" };
  }

  if (!data.targetPriceRealistic || data.targetPriceRealistic <= 0) {
    return { success: false, error: "Target price must be positive" };
  }

  if (!data.targetDate) {
    return { success: false, error: "Target date is required" };
  }

  if (data.quantity <= 0) {
    return { success: false, error: "Quantity must be positive" };
  }

  if (data.avgEntryPrice <= 0) {
    return { success: false, error: "Entry price must be positive" };
  }

  try {
    // Create Target
    const [newTarget] = await db
      .insert(targets)
      .values({
        userId: session.user.dbId,
        thesis: data.thesis.trim(),
        targetType: data.targetType,
        status: "active",
      })
      .returning();

    // Create Aim
    const [newAim] = await db
      .insert(aims)
      .values({
        targetId: newTarget.id,
        symbol: data.symbol.trim().toUpperCase(),
        targetPriceRealistic: data.targetPriceRealistic.toString(),
        targetPriceReach: data.targetPriceReach?.toString() || null,
        targetDate: data.targetDate,
        stopLossPrice: data.stopLossPrice?.toString() || null,
      })
      .returning();

    // Create Shot as active (since we already have the position)
    const [newShot] = await db
      .insert(shots)
      .values({
        aimId: newAim.id,
        direction: "buy", // Adopted positions are long positions
        entryPrice: data.avgEntryPrice.toString(),
        entryDate: new Date(), // Use current date as we don't know actual entry date
        positionSize: data.quantity.toString(),
        triggerType: "market",
        shotType: "stock",
        state: "active", // Position already exists, so it's active
        fillPrice: data.avgEntryPrice.toString(),
        filledQty: data.quantity.toString(),
        fillTimestamp: new Date(),
        alpacaStatus: "filled",
        stopLossPrice: data.stopLossPrice?.toString() || null,
      })
      .returning();

    // Log audit entries
    await logAudit(
      AuditActions.TARGET_CREATED,
      AuditEntityTypes.TARGET,
      newTarget.id,
      {
        thesis: newTarget.thesis.substring(0, 100),
        targetType: newTarget.targetType,
        source: "orphan_adoption",
        adoptedSymbol: data.symbol,
      }
    );

    await logAudit(
      AuditActions.AIM_CREATED,
      AuditEntityTypes.AIM,
      newAim.id,
      {
        symbol: newAim.symbol,
        targetPriceRealistic: newAim.targetPriceRealistic,
        parentTargetId: newTarget.id,
        source: "orphan_adoption",
      }
    );

    await logAudit(
      AuditActions.SHOT_CREATED,
      AuditEntityTypes.SHOT,
      newShot.id,
      {
        symbol: data.symbol,
        direction: "buy",
        entryPrice: data.avgEntryPrice,
        positionSize: data.quantity,
        state: "active",
        source: "orphan_adoption",
        aimId: newAim.id,
      }
    );

    // Revalidate paths
    revalidatePath("/portfolio");
    revalidatePath("/dashboard");
    revalidatePath("/targets");
    revalidatePath(`/targets/${newTarget.id}`);

    return {
      success: true,
      targetId: newTarget.id,
      aimId: newAim.id,
      shotId: newShot.id,
    };
  } catch (error) {
    console.error("Error adopting orphan position:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to adopt position",
    };
  }
}
