"use server";

import { db } from "@/lib/db";
import { symbols } from "@/lib/db/schema";
import { and, eq, ilike, or, sql, inArray } from "drizzle-orm";
import type { MarketType } from "@/lib/db/schema";

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange: string | null;
  marketType: MarketType;
  currency: string | null;
  logoUrl: string | null;
}

/**
 * Search for symbols by query string
 * Searches both symbol and company name
 * Returns up to 20 results, prioritizing exact and prefix matches
 */
export async function searchSymbols(
  query: string,
  markets: MarketType[] = ["stock", "etf"]
): Promise<SymbolSearchResult[]> {
  if (!query || query.length < 1) {
    return [];
  }

  const searchTerm = `%${query}%`;
  const prefixTerm = `${query}%`;

  const results = await db
    .select({
      symbol: symbols.symbol,
      name: symbols.name,
      exchange: symbols.exchange,
      marketType: symbols.marketType,
      currency: symbols.currency,
      logoUrl: symbols.logoUrl,
    })
    .from(symbols)
    .where(
      and(
        inArray(symbols.marketType, markets),
        eq(symbols.isActive, true),
        or(ilike(symbols.symbol, searchTerm), ilike(symbols.name, searchTerm))
      )
    )
    .orderBy(
      // Prioritize: exact match > prefix match > contains match
      sql`CASE
        WHEN LOWER(${symbols.symbol}) = LOWER(${query}) THEN 0
        WHEN LOWER(${symbols.symbol}) LIKE LOWER(${prefixTerm}) THEN 1
        WHEN LOWER(${symbols.name}) LIKE LOWER(${prefixTerm}) THEN 2
        ELSE 3
      END`,
      symbols.symbol
    )
    .limit(20);

  return results;
}

/**
 * Get a single symbol by its ticker
 */
export async function getSymbol(symbol: string): Promise<SymbolSearchResult | null> {
  const result = await db
    .select({
      symbol: symbols.symbol,
      name: symbols.name,
      exchange: symbols.exchange,
      marketType: symbols.marketType,
      currency: symbols.currency,
      logoUrl: symbols.logoUrl,
    })
    .from(symbols)
    .where(and(eq(symbols.symbol, symbol.toUpperCase()), eq(symbols.isActive, true)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get multiple symbols by their tickers
 */
export async function getSymbols(symbolList: string[]): Promise<SymbolSearchResult[]> {
  if (symbolList.length === 0) return [];

  const upperSymbols = symbolList.map((s) => s.toUpperCase());

  return db
    .select({
      symbol: symbols.symbol,
      name: symbols.name,
      exchange: symbols.exchange,
      marketType: symbols.marketType,
      currency: symbols.currency,
      logoUrl: symbols.logoUrl,
    })
    .from(symbols)
    .where(and(inArray(symbols.symbol, upperSymbols), eq(symbols.isActive, true)));
}

/**
 * Fetch and cache logo for a symbol (lazy-load from Finnhub)
 * Returns the logo URL if found, null otherwise
 */
export async function fetchSymbolLogo(symbolTicker: string): Promise<string | null> {
  const upperSymbol = symbolTicker.toUpperCase();

  // Check if we already have the logo
  const existing = await db
    .select({ logoUrl: symbols.logoUrl })
    .from(symbols)
    .where(eq(symbols.symbol, upperSymbol))
    .limit(1);

  if (existing[0]?.logoUrl) {
    return existing[0].logoUrl;
  }

  // Fetch from Finnhub
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.warn("[fetchSymbolLogo] FINNHUB_API_KEY not set");
    return null;
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${upperSymbol}&token=${apiKey}`
    );

    if (!response.ok) {
      return null;
    }

    const profile = await response.json();

    if (profile?.logo) {
      // Cache the logo in the database
      await db
        .update(symbols)
        .set({
          logoUrl: profile.logo,
          finnhubIndustry: profile.finnhubIndustry || null,
        })
        .where(eq(symbols.symbol, upperSymbol));

      return profile.logo;
    }

    return null;
  } catch (error) {
    console.error(`[fetchSymbolLogo] Error fetching logo for ${upperSymbol}:`, error);
    return null;
  }
}

/**
 * Get logos for multiple symbols (batch fetch)
 * Returns a map of symbol -> logoUrl
 */
export async function fetchSymbolLogos(
  symbolTickers: string[]
): Promise<Record<string, string | null>> {
  if (symbolTickers.length === 0) return {};

  const upperSymbols = symbolTickers.map((s) => s.toUpperCase());
  const result: Record<string, string | null> = {};

  // First, get any existing logos from DB
  const existing = await db
    .select({ symbol: symbols.symbol, logoUrl: symbols.logoUrl })
    .from(symbols)
    .where(inArray(symbols.symbol, upperSymbols));

  const missingLogos: string[] = [];
  for (const row of existing) {
    if (row.logoUrl) {
      result[row.symbol] = row.logoUrl;
    } else {
      missingLogos.push(row.symbol);
    }
  }

  // Fetch missing logos from Finnhub (with rate limiting)
  const apiKey = process.env.FINNHUB_API_KEY;
  if (apiKey && missingLogos.length > 0) {
    // Limit to first 10 to avoid rate limiting issues
    const toFetch = missingLogos.slice(0, 10);

    for (const sym of toFetch) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${apiKey}`
        );

        if (response.ok) {
          const profile = await response.json();
          if (profile?.logo) {
            result[sym] = profile.logo;
            // Cache it
            await db
              .update(symbols)
              .set({
                logoUrl: profile.logo,
                finnhubIndustry: profile.finnhubIndustry || null,
              })
              .where(eq(symbols.symbol, sym));
          }
        }

        // Small delay to respect rate limits
        await new Promise((r) => setTimeout(r, 100));
      } catch {
        result[sym] = null;
      }
    }
  }

  // Fill in nulls for any symbols we didn't get
  for (const sym of upperSymbols) {
    if (!(sym in result)) {
      result[sym] = null;
    }
  }

  return result;
}

/**
 * Get count of symbols by market type
 */
export async function getSymbolStats(): Promise<{
  total: number;
  stocks: number;
  etfs: number;
  withLogos: number;
}> {
  const stats = await db
    .select({
      marketType: symbols.marketType,
      count: sql<number>`count(*)::int`,
      withLogos: sql<number>`count(${symbols.logoUrl})::int`,
    })
    .from(symbols)
    .where(eq(symbols.isActive, true))
    .groupBy(symbols.marketType);

  const result = {
    total: 0,
    stocks: 0,
    etfs: 0,
    withLogos: 0,
  };

  for (const row of stats) {
    result.total += row.count;
    result.withLogos += row.withLogos;
    if (row.marketType === "stock") result.stocks = row.count;
    if (row.marketType === "etf") result.etfs = row.count;
  }

  return result;
}
