/**
 * Symbol Sync Script
 *
 * Syncs stock and ETF symbols from Finnhub to local database.
 * Designed to run once per day via cron job or manual trigger.
 *
 * Usage:
 *   npx tsx src/lib/finnhub/sync-symbols.ts
 *
 * Features:
 * - Fetches all US stock symbols from Finnhub
 * - Identifies ETFs vs stocks by type field
 * - Optionally fetches company profiles for logos (slow, ~3hrs for full sync)
 * - Upserts to local database
 * - Marks delisted symbols as inactive
 */

import { db } from "@/lib/db";
import { symbols, type MarketType } from "@/lib/db/schema";
import { sql, inArray, and, eq, notInArray } from "drizzle-orm";
import { FinnhubClient, type FinnhubSymbol } from "./client";

interface SyncOptions {
  /** Fetch company profiles for logos (slow) */
  fetchProfiles?: boolean;
  /** Limit number of symbols to sync (for testing) */
  limit?: number;
  /** Only sync symbols that don't have logos yet */
  onlyMissingLogos?: boolean;
}

function classifyMarketType(finnhubSymbol: FinnhubSymbol): MarketType | null {
  const type = finnhubSymbol.type?.toLowerCase() || "";

  // ETF types
  if (type.includes("etf") || type.includes("etp")) {
    return "etf";
  }

  // Common stock types
  if (
    type === "common stock" ||
    type === "common" ||
    type === "equity" ||
    type === "" // Default to stock if no type
  ) {
    return "stock";
  }

  // ADR, GDR are also stocks
  if (type.includes("adr") || type.includes("gdr") || type.includes("depositary")) {
    return "stock";
  }

  // REIT is classified as stock
  if (type.includes("reit")) {
    return "stock";
  }

  // Skip other types (warrants, units, preferred, etc.)
  // These can be added later if needed
  if (
    type.includes("warrant") ||
    type.includes("unit") ||
    type.includes("preferred") ||
    type.includes("right")
  ) {
    return null;
  }

  // Default to stock for unknown types
  return "stock";
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function syncSymbols(options: SyncOptions = {}): Promise<{
  total: number;
  stocks: number;
  etfs: number;
  skipped: number;
  errors: number;
}> {
  const { fetchProfiles = false, limit, onlyMissingLogos = false } = options;

  console.log("[Symbol Sync] Starting sync from Finnhub...");
  console.log(`[Symbol Sync] Options: fetchProfiles=${fetchProfiles}, limit=${limit || "none"}`);

  const client = new FinnhubClient();
  const stats = { total: 0, stocks: 0, etfs: 0, skipped: 0, errors: 0 };

  // Fetch all US symbols
  console.log("[Symbol Sync] Fetching US symbols from Finnhub...");
  const allSymbols = await client.getSymbols("US");
  console.log(`[Symbol Sync] Received ${allSymbols.length} symbols from Finnhub`);

  // Filter and classify symbols
  const symbolsToSync: Array<{
    symbol: string;
    name: string;
    exchange: string | null;
    marketType: MarketType;
    currency: string;
  }> = [];

  for (const s of allSymbols) {
    // Skip symbols without a name
    if (!s.description) {
      stats.skipped++;
      continue;
    }

    // Skip symbols that are too short or look invalid
    if (!s.symbol || s.symbol.length > 10) {
      stats.skipped++;
      continue;
    }

    // Classify the symbol
    const marketType = classifyMarketType(s);
    if (!marketType) {
      stats.skipped++;
      continue;
    }

    symbolsToSync.push({
      symbol: s.symbol,
      name: s.description,
      exchange: s.mic || null,
      marketType,
      currency: s.currency || "USD",
    });

    if (marketType === "stock") stats.stocks++;
    if (marketType === "etf") stats.etfs++;
  }

  console.log(
    `[Symbol Sync] Classified ${symbolsToSync.length} symbols (${stats.stocks} stocks, ${stats.etfs} ETFs, ${stats.skipped} skipped)`
  );

  // Apply limit if specified
  let symbolsToProcess = symbolsToSync;
  if (limit) {
    symbolsToProcess = symbolsToSync.slice(0, limit);
    console.log(`[Symbol Sync] Limited to ${symbolsToProcess.length} symbols`);
  }

  stats.total = symbolsToProcess.length;

  // Batch upsert symbols
  console.log("[Symbol Sync] Upserting symbols to database...");
  const batches = chunk(symbolsToProcess, 500);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`[Symbol Sync] Processing batch ${i + 1}/${batches.length} (${batch.length} symbols)...`);

    try {
      await db
        .insert(symbols)
        .values(
          batch.map((s) => ({
            symbol: s.symbol,
            name: s.name,
            exchange: s.exchange,
            marketType: s.marketType,
            currency: s.currency,
            isActive: true,
            lastSyncedAt: new Date(),
          }))
        )
        .onConflictDoUpdate({
          target: symbols.symbol,
          set: {
            name: sql`excluded.name`,
            exchange: sql`excluded.exchange`,
            marketType: sql`excluded.market_type`,
            currency: sql`excluded.currency`,
            isActive: sql`true`,
            lastSyncedAt: sql`now()`,
          },
        });
    } catch (error) {
      console.error(`[Symbol Sync] Error upserting batch ${i + 1}:`, error);
      stats.errors++;
    }
  }

  // Fetch profiles for logos if requested
  if (fetchProfiles) {
    console.log("[Symbol Sync] Fetching company profiles for logos...");

    let symbolsForProfiles = symbolsToProcess;

    if (onlyMissingLogos) {
      // Only fetch profiles for symbols without logos
      const existingWithLogos = await db
        .select({ symbol: symbols.symbol })
        .from(symbols)
        .where(
          and(
            inArray(
              symbols.symbol,
              symbolsToProcess.map((s) => s.symbol)
            ),
            sql`${symbols.logoUrl} IS NOT NULL`
          )
        );

      const symbolsWithLogos = new Set(existingWithLogos.map((s) => s.symbol));
      symbolsForProfiles = symbolsToProcess.filter((s) => !symbolsWithLogos.has(s.symbol));
      console.log(`[Symbol Sync] Fetching profiles for ${symbolsForProfiles.length} symbols without logos`);
    }

    let profileCount = 0;
    for (const s of symbolsForProfiles) {
      try {
        const profile = await client.getProfile(s.symbol);

        if (profile && profile.logo) {
          await db
            .update(symbols)
            .set({
              logoUrl: profile.logo,
              finnhubIndustry: profile.finnhubIndustry,
            })
            .where(eq(symbols.symbol, s.symbol));

          profileCount++;
        }

        // Log progress every 100 symbols
        if (profileCount % 100 === 0) {
          console.log(`[Symbol Sync] Fetched ${profileCount} profiles...`);
        }
      } catch (error) {
        // Don't fail the whole sync if one profile fails
        console.error(`[Symbol Sync] Error fetching profile for ${s.symbol}:`, error);
      }
    }

    console.log(`[Symbol Sync] Fetched ${profileCount} company profiles`);
  }

  // Mark symbols not in sync as inactive (delisted)
  console.log("[Symbol Sync] Marking delisted symbols as inactive...");
  const syncedSymbolIds = symbolsToProcess.map((s) => s.symbol);

  if (syncedSymbolIds.length > 0) {
    // Only mark as inactive if we synced a reasonable number of symbols
    // This prevents accidentally marking everything inactive if the API fails
    if (syncedSymbolIds.length > 1000) {
      await db
        .update(symbols)
        .set({ isActive: false })
        .where(
          and(notInArray(symbols.symbol, syncedSymbolIds), eq(symbols.isActive, true))
        );
    }
  }

  console.log("[Symbol Sync] Sync complete!");
  console.log(`[Symbol Sync] Stats: ${JSON.stringify(stats)}`);

  return stats;
}

// Run if called directly
if (require.main === module || process.argv[1]?.includes("sync-symbols")) {
  const fetchProfiles = process.argv.includes("--profiles");
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : undefined;

  syncSymbols({ fetchProfiles, limit })
    .then((stats) => {
      console.log("Sync completed:", stats);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Sync failed:", error);
      process.exit(1);
    });
}
