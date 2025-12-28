/**
 * Real-time quotes service with 30-minute caching
 *
 * Fetches stock quotes from Alpaca Market Data API and caches them
 * in the price_cache table to reduce API calls.
 */

import { db } from "@/lib/db";
import { priceCache } from "@/lib/db/schema";
import { eq, inArray, lt } from "drizzle-orm";
import {
  withCircuitBreaker,
  CircuitOpenError,
  CIRCUITS,
} from "@/lib/alpaca/circuit-breaker";

// Alpaca Data API base URL
const ALPACA_DATA_API = "https://data.alpaca.markets";

// Cache TTL: 30 minutes in milliseconds
const CACHE_TTL_MS = 30 * 60 * 1000; // 1800000ms

// Source identifier for cached prices
const CACHE_SOURCE = "alpaca";

export interface Quote {
  symbol: string;
  price: number;
  timestamp: Date;
  cached: boolean;
}

export interface SnapshotQuote {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  timestamp: Date;
  cached: boolean;
}

export interface SnapshotResult {
  success: boolean;
  error?: string;
  snapshot?: SnapshotQuote;
}

export interface BatchSnapshotResult {
  success: boolean;
  error?: string;
  snapshots?: SnapshotQuote[];
  failed?: string[];
}

export interface QuoteResult {
  success: boolean;
  error?: string;
  quote?: Quote;
}

export interface BatchQuoteResult {
  success: boolean;
  error?: string;
  quotes?: Quote[];
  failed?: string[]; // Symbols that failed to fetch
}

// Alpaca latest trade response structure
interface AlpacaTradeResponse {
  trade: {
    t: string; // timestamp
    x: string; // exchange
    p: number; // price
    s: number; // size
    c: string[]; // conditions
    i: number; // trade ID
    z: string; // tape
  };
  symbol: string;
}

// Alpaca multi-symbol trades response
interface AlpacaMultiTradesResponse {
  trades: {
    [symbol: string]: {
      t: string;
      x: string;
      p: number;
      s: number;
      c: string[];
      i: number;
      z: string;
    };
  };
}

/**
 * Check if a cached price is still valid (within TTL)
 */
function isCacheValid(fetchedAt: Date): boolean {
  const now = Date.now();
  const cachedAt = fetchedAt.getTime();
  return now - cachedAt < CACHE_TTL_MS;
}

/**
 * Fetch a single quote from Alpaca API
 */
async function fetchQuoteFromAlpaca(
  symbol: string,
  apiKey: string,
  apiSecret: string
): Promise<{ price: number; timestamp: Date }> {
  const response = await fetch(
    `${ALPACA_DATA_API}/v2/stocks/${encodeURIComponent(symbol)}/trades/latest`,
    {
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": apiSecret,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Alpaca API error for ${symbol}: ${response.status} - ${errorText}`
    );
  }

  const data: AlpacaTradeResponse = await response.json();
  return {
    price: data.trade.p,
    timestamp: new Date(data.trade.t),
  };
}

/**
 * Fetch multiple quotes from Alpaca API in a single request
 */
async function fetchQuotesFromAlpaca(
  symbols: string[],
  apiKey: string,
  apiSecret: string
): Promise<Map<string, { price: number; timestamp: Date }>> {
  const symbolsParam = symbols.map(encodeURIComponent).join(",");
  const response = await fetch(
    `${ALPACA_DATA_API}/v2/stocks/trades/latest?symbols=${symbolsParam}`,
    {
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": apiSecret,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Alpaca API error: ${response.status} - ${errorText}`);
  }

  const data: AlpacaMultiTradesResponse = await response.json();
  const results = new Map<string, { price: number; timestamp: Date }>();

  for (const [symbol, trade] of Object.entries(data.trades)) {
    results.set(symbol, {
      price: trade.p,
      timestamp: new Date(trade.t),
    });
  }

  return results;
}

/**
 * Update the price cache with a new quote
 */
async function updateCache(symbol: string, price: number): Promise<void> {
  await db
    .insert(priceCache)
    .values({
      symbol: symbol.toUpperCase(),
      price: price.toString(),
      fetchedAt: new Date(),
      source: CACHE_SOURCE,
    })
    .onConflictDoUpdate({
      target: priceCache.symbol,
      set: {
        price: price.toString(),
        fetchedAt: new Date(),
        source: CACHE_SOURCE,
      },
    });
}

/**
 * Get a single quote for a symbol
 * Checks cache first, fetches from Alpaca if stale or missing
 */
export async function getQuote(
  symbol: string,
  apiKey: string,
  apiSecret: string
): Promise<QuoteResult> {
  const normalizedSymbol = symbol.toUpperCase().trim();

  try {
    // Check cache first
    const cached = await db
      .select()
      .from(priceCache)
      .where(eq(priceCache.symbol, normalizedSymbol))
      .limit(1);

    if (cached.length > 0 && isCacheValid(cached[0].fetchedAt)) {
      return {
        success: true,
        quote: {
          symbol: normalizedSymbol,
          price: parseFloat(cached[0].price),
          timestamp: cached[0].fetchedAt,
          cached: true,
        },
      };
    }

    // Fetch fresh quote from Alpaca with circuit breaker
    const { price, timestamp } = await withCircuitBreaker(
      CIRCUITS.ALPACA_MARKET_DATA,
      async () => fetchQuoteFromAlpaca(normalizedSymbol, apiKey, apiSecret)
    );

    // Update cache
    await updateCache(normalizedSymbol, price);

    return {
      success: true,
      quote: {
        symbol: normalizedSymbol,
        price,
        timestamp,
        cached: false,
      },
    };
  } catch (error) {
    console.error(`Error getting quote for ${normalizedSymbol}:`, error);

    if (error instanceof CircuitOpenError) {
      return {
        success: false,
        error:
          "Market data service is temporarily unavailable. Please try again later.",
      };
    }

    // If API fails, try to return stale cache as fallback
    try {
      const staleCache = await db
        .select()
        .from(priceCache)
        .where(eq(priceCache.symbol, normalizedSymbol))
        .limit(1);

      if (staleCache.length > 0) {
        return {
          success: true,
          quote: {
            symbol: normalizedSymbol,
            price: parseFloat(staleCache[0].price),
            timestamp: staleCache[0].fetchedAt,
            cached: true, // Stale but available
          },
        };
      }
    } catch {
      // Ignore cache fallback errors
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch quote",
    };
  }
}

/**
 * Get quotes for multiple symbols
 * Optimizes by batching API calls for symbols not in cache
 */
export async function getQuotes(
  symbols: string[],
  apiKey: string,
  apiSecret: string
): Promise<BatchQuoteResult> {
  if (symbols.length === 0) {
    return { success: true, quotes: [] };
  }

  const normalizedSymbols = [
    ...new Set(symbols.map((s) => s.toUpperCase().trim())),
  ];
  const quotes: Quote[] = [];
  const symbolsToFetch: string[] = [];
  const failed: string[] = [];

  try {
    // Check cache for all symbols
    const cached = await db
      .select()
      .from(priceCache)
      .where(inArray(priceCache.symbol, normalizedSymbols));

    const cacheMap = new Map(cached.map((c) => [c.symbol, c]));

    // Separate cached (valid) from needs-fetch
    for (const symbol of normalizedSymbols) {
      const cachedEntry = cacheMap.get(symbol);
      if (cachedEntry && isCacheValid(cachedEntry.fetchedAt)) {
        quotes.push({
          symbol,
          price: parseFloat(cachedEntry.price),
          timestamp: cachedEntry.fetchedAt,
          cached: true,
        });
      } else {
        symbolsToFetch.push(symbol);
      }
    }

    // Fetch missing/stale symbols from Alpaca
    if (symbolsToFetch.length > 0) {
      try {
        const freshQuotes = await withCircuitBreaker(
          CIRCUITS.ALPACA_MARKET_DATA,
          async () => fetchQuotesFromAlpaca(symbolsToFetch, apiKey, apiSecret)
        );

        // Process fetched quotes and update cache
        for (const symbol of symbolsToFetch) {
          const data = freshQuotes.get(symbol);
          if (data) {
            quotes.push({
              symbol,
              price: data.price,
              timestamp: data.timestamp,
              cached: false,
            });
            // Update cache (don't await to speed up response)
            updateCache(symbol, data.price).catch((err) =>
              console.error(`Failed to cache ${symbol}:`, err)
            );
          } else {
            // Symbol not returned by API (might be invalid)
            failed.push(symbol);
          }
        }
      } catch (error) {
        console.error("Error fetching batch quotes:", error);

        if (error instanceof CircuitOpenError) {
          // Add all symbols to failed if circuit is open
          failed.push(...symbolsToFetch);
        } else {
          // Try to use stale cache for failed symbols
          for (const symbol of symbolsToFetch) {
            const staleEntry = cacheMap.get(symbol);
            if (staleEntry) {
              quotes.push({
                symbol,
                price: parseFloat(staleEntry.price),
                timestamp: staleEntry.fetchedAt,
                cached: true,
              });
            } else {
              failed.push(symbol);
            }
          }
        }
      }
    }

    return {
      success: true,
      quotes,
      failed: failed.length > 0 ? failed : undefined,
    };
  } catch (error) {
    console.error("Error getting batch quotes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch quotes",
    };
  }
}

/**
 * Get cache status for debugging/monitoring
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  validEntries: number;
  staleEntries: number;
}> {
  const allEntries = await db.select().from(priceCache);

  let validEntries = 0;
  let staleEntries = 0;

  for (const entry of allEntries) {
    if (isCacheValid(entry.fetchedAt)) {
      validEntries++;
    } else {
      staleEntries++;
    }
  }

  return {
    totalEntries: allEntries.length,
    validEntries,
    staleEntries,
  };
}

/**
 * Invalidate cache for specific symbols
 * Useful when you know prices have changed (e.g., after a trade)
 */
export async function invalidateCache(symbols: string[]): Promise<void> {
  const normalizedSymbols = symbols.map((s) => s.toUpperCase().trim());

  await db
    .delete(priceCache)
    .where(inArray(priceCache.symbol, normalizedSymbols));
}

/**
 * Purge stale cache entries
 * Can be called periodically to clean up the database
 */
export async function purgeStaleCache(): Promise<number> {
  const cutoff = new Date(Date.now() - CACHE_TTL_MS * 2); // Double TTL for purge threshold

  const result = await db
    .delete(priceCache)
    .where(lt(priceCache.fetchedAt, cutoff))
    .returning({ symbol: priceCache.symbol });

  return result.length;
}

// ============================================================================
// Snapshot API - Rich quote data with change %, day high/low
// ============================================================================

// Alpaca snapshot response structure
interface AlpacaSnapshotResponse {
  latestTrade: {
    t: string; // timestamp
    x: string; // exchange
    p: number; // price
    s: number; // size
    c: string[]; // conditions
    i: number; // trade ID
    z: string; // tape
  };
  latestQuote: {
    t: string;
    ax: string;
    ap: number; // ask price
    as: number; // ask size
    bx: string;
    bp: number; // bid price
    bs: number; // bid size
    c: string[];
    z: string;
  };
  minuteBar: {
    t: string;
    o: number; // open
    h: number; // high
    l: number; // low
    c: number; // close
    v: number; // volume
    n: number; // trade count
    vw: number; // vwap
  } | null;
  dailyBar: {
    t: string;
    o: number; // open
    h: number; // high
    l: number; // low
    c: number; // close
    v: number; // volume
    n: number; // trade count
    vw: number; // vwap
  } | null;
  prevDailyBar: {
    t: string;
    o: number;
    h: number;
    l: number;
    c: number; // previous close
    v: number;
    n: number;
    vw: number;
  } | null;
}

// Alpaca multi-symbol snapshot response
interface AlpacaMultiSnapshotResponse {
  [symbol: string]: AlpacaSnapshotResponse;
}

/**
 * Fetch snapshot data for multiple symbols from Alpaca API
 * Returns current price, previous close, day high/low, volume
 */
async function fetchSnapshotsFromAlpaca(
  symbols: string[],
  apiKey: string,
  apiSecret: string
): Promise<Map<string, SnapshotQuote>> {
  const symbolsParam = symbols.map(encodeURIComponent).join(",");
  const response = await fetch(
    `${ALPACA_DATA_API}/v2/stocks/snapshots?symbols=${symbolsParam}`,
    {
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": apiSecret,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Alpaca API error: ${response.status} - ${errorText}`);
  }

  const data: AlpacaMultiSnapshotResponse = await response.json();
  const results = new Map<string, SnapshotQuote>();

  for (const [symbol, snapshot] of Object.entries(data)) {
    const currentPrice = snapshot.latestTrade?.p || 0;
    const previousClose = snapshot.prevDailyBar?.c || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    results.set(symbol, {
      symbol,
      price: currentPrice,
      previousClose,
      change,
      changePercent,
      dayHigh: snapshot.dailyBar?.h || currentPrice,
      dayLow: snapshot.dailyBar?.l || currentPrice,
      volume: snapshot.dailyBar?.v || 0,
      timestamp: new Date(snapshot.latestTrade?.t || Date.now()),
      cached: false,
    });
  }

  return results;
}

/**
 * Get snapshot quotes for multiple symbols
 * Includes current price, previous close, change %, day high/low
 */
export async function getSnapshots(
  symbols: string[],
  apiKey: string,
  apiSecret: string
): Promise<BatchSnapshotResult> {
  if (symbols.length === 0) {
    return { success: true, snapshots: [] };
  }

  const normalizedSymbols = [
    ...new Set(symbols.map((s) => s.toUpperCase().trim())),
  ];
  const snapshots: SnapshotQuote[] = [];
  const failed: string[] = [];

  try {
    // Fetch snapshots from Alpaca with circuit breaker
    const fetchedSnapshots = await withCircuitBreaker(
      CIRCUITS.ALPACA_MARKET_DATA,
      async () => fetchSnapshotsFromAlpaca(normalizedSymbols, apiKey, apiSecret)
    );

    // Process results
    for (const symbol of normalizedSymbols) {
      const snapshot = fetchedSnapshots.get(symbol);
      if (snapshot) {
        snapshots.push(snapshot);
        // Update price cache with latest price
        updateCache(symbol, snapshot.price).catch((err) =>
          console.error(`Failed to cache ${symbol}:`, err)
        );
      } else {
        failed.push(symbol);
      }
    }

    return {
      success: true,
      snapshots,
      failed: failed.length > 0 ? failed : undefined,
    };
  } catch (error) {
    console.error("Error getting snapshots:", error);

    if (error instanceof CircuitOpenError) {
      return {
        success: false,
        error: "Market data service is temporarily unavailable. Please try again later.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch snapshots",
    };
  }
}
