"use server";

import { db } from "@/lib/db";
import {
  watchlist,
  priceCache,
  type WatchlistItem,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { logAudit, AuditActions, AuditEntityTypes } from "@/lib/audit";
import { revalidatePath } from "next/cache";

// Extended audit actions for watchlist
const WatchlistAuditActions = {
  ...AuditActions,
  WATCHLIST_ADDED: "watchlist.added",
  WATCHLIST_REMOVED: "watchlist.removed",
  WATCHLIST_UPDATED: "watchlist.updated",
} as const;

// Extended entity types
const WatchlistEntityTypes = {
  ...AuditEntityTypes,
  WATCHLIST: "watchlist",
} as const;

export interface WatchlistResult {
  success: boolean;
  error?: string;
  item?: WatchlistItem;
}

export interface WatchlistListResult {
  success: boolean;
  error?: string;
  items?: WatchlistItemWithPrice[];
}

export interface WatchlistItemWithPrice extends WatchlistItem {
  currentPrice?: string | null;
  priceSource?: string | null;
  priceFetchedAt?: Date | null;
}

export interface AddToWatchlistData {
  symbol: string;
  notes?: string;
  alertPrice?: number;
}

export interface UpdateWatchlistData {
  notes?: string;
  alertPrice?: number | null;
}

/**
 * Add a symbol to the user's watchlist
 */
export async function addToWatchlist(
  data: AddToWatchlistData
): Promise<WatchlistResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate symbol
  const symbol = data.symbol.toUpperCase().trim();
  if (!symbol) {
    return { success: false, error: "Symbol is required" };
  }

  // Check if symbol is already in watchlist
  const existing = await db
    .select()
    .from(watchlist)
    .where(
      and(
        eq(watchlist.userId, session.user.dbId),
        eq(watchlist.symbol, symbol)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "Symbol is already in your watchlist" };
  }

  try {
    const [newItem] = await db
      .insert(watchlist)
      .values({
        userId: session.user.dbId,
        symbol,
        notes: data.notes || null,
        alertPrice: data.alertPrice?.toString() || null,
      })
      .returning();

    await logAudit(
      WatchlistAuditActions.WATCHLIST_ADDED,
      WatchlistEntityTypes.WATCHLIST,
      newItem.id,
      {
        symbol,
        notes: data.notes,
        alertPrice: data.alertPrice,
      }
    );

    revalidatePath("/watchlist");

    return { success: true, item: newItem };
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return { success: false, error: "Failed to add to watchlist" };
  }
}

/**
 * Remove a symbol from the user's watchlist
 */
export async function removeFromWatchlist(id: string): Promise<WatchlistResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership
  const [existing] = await db
    .select()
    .from(watchlist)
    .where(
      and(
        eq(watchlist.id, id),
        eq(watchlist.userId, session.user.dbId)
      )
    )
    .limit(1);

  if (!existing) {
    return { success: false, error: "Watchlist item not found" };
  }

  try {
    await db.delete(watchlist).where(eq(watchlist.id, id));

    await logAudit(
      WatchlistAuditActions.WATCHLIST_REMOVED,
      WatchlistEntityTypes.WATCHLIST,
      id,
      {
        symbol: existing.symbol,
      }
    );

    revalidatePath("/watchlist");

    return { success: true };
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return { success: false, error: "Failed to remove from watchlist" };
  }
}

/**
 * Update a watchlist item (notes, alert price)
 */
export async function updateWatchlistItem(
  id: string,
  data: UpdateWatchlistData
): Promise<WatchlistResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership
  const [existing] = await db
    .select()
    .from(watchlist)
    .where(
      and(
        eq(watchlist.id, id),
        eq(watchlist.userId, session.user.dbId)
      )
    )
    .limit(1);

  if (!existing) {
    return { success: false, error: "Watchlist item not found" };
  }

  try {
    const [updated] = await db
      .update(watchlist)
      .set({
        notes: data.notes !== undefined ? data.notes : existing.notes,
        alertPrice:
          data.alertPrice !== undefined
            ? data.alertPrice?.toString() || null
            : existing.alertPrice,
        updatedAt: new Date(),
      })
      .where(eq(watchlist.id, id))
      .returning();

    await logAudit(
      WatchlistAuditActions.WATCHLIST_UPDATED,
      WatchlistEntityTypes.WATCHLIST,
      id,
      {
        symbol: existing.symbol,
        previousNotes: existing.notes,
        newNotes: data.notes,
        previousAlertPrice: existing.alertPrice,
        newAlertPrice: data.alertPrice,
      }
    );

    revalidatePath("/watchlist");

    return { success: true, item: updated };
  } catch (error) {
    console.error("Error updating watchlist item:", error);
    return { success: false, error: "Failed to update watchlist item" };
  }
}

/**
 * Get the user's watchlist with current prices from price_cache
 */
export async function getWatchlist(): Promise<WatchlistListResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Fetch watchlist items
    const items = await db
      .select()
      .from(watchlist)
      .where(eq(watchlist.userId, session.user.dbId))
      .orderBy(desc(watchlist.createdAt));

    // Fetch prices for all symbols in watchlist
    const symbols = items.map((item) => item.symbol);

    let pricesMap: Map<string, { price: string; source: string; fetchedAt: Date }> = new Map();

    if (symbols.length > 0) {
      const prices = await db
        .select()
        .from(priceCache)
        .where(
          // Use raw SQL for IN clause with multiple symbols
          symbols.length === 1
            ? eq(priceCache.symbol, symbols[0])
            : undefined as never
        );

      // For multiple symbols, we need to query each or use a different approach
      // For now, let's fetch all prices and filter
      const allPrices = await db.select().from(priceCache);
      allPrices.forEach((p) => {
        if (symbols.includes(p.symbol)) {
          pricesMap.set(p.symbol, {
            price: p.price,
            source: p.source,
            fetchedAt: p.fetchedAt,
          });
        }
      });
    }

    // Combine watchlist items with prices
    const itemsWithPrices: WatchlistItemWithPrice[] = items.map((item) => {
      const priceData = pricesMap.get(item.symbol);
      return {
        ...item,
        currentPrice: priceData?.price || null,
        priceSource: priceData?.source || null,
        priceFetchedAt: priceData?.fetchedAt || null,
      };
    });

    return { success: true, items: itemsWithPrices };
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return { success: false, error: "Failed to fetch watchlist" };
  }
}

/**
 * Check if a symbol is in the user's watchlist
 */
export async function isInWatchlist(symbol: string): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return false;
  }

  const existing = await db
    .select({ id: watchlist.id })
    .from(watchlist)
    .where(
      and(
        eq(watchlist.userId, session.user.dbId),
        eq(watchlist.symbol, symbol.toUpperCase())
      )
    )
    .limit(1);

  return existing.length > 0;
}
