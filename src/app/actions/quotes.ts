"use server";

import { auth } from "@/auth";
import { getAlpacaCredentials } from "@/app/actions/alpaca";
import {
  getQuote as getQuoteService,
  getQuotes as getQuotesService,
  getSnapshots as getSnapshotsService,
  Quote,
  SnapshotQuote,
} from "@/lib/quotes/service";

export interface QuoteActionResult {
  success: boolean;
  error?: string;
  quote?: Quote;
}

export interface BatchQuoteActionResult {
  success: boolean;
  error?: string;
  quotes?: Quote[];
  failed?: string[];
}

export interface SnapshotActionResult {
  success: boolean;
  error?: string;
  snapshot?: SnapshotQuote;
}

export interface BatchSnapshotActionResult {
  success: boolean;
  error?: string;
  snapshots?: SnapshotQuote[];
  failed?: string[];
}

/**
 * Get a real-time quote for a single symbol
 * Uses 30-minute caching to reduce API calls
 */
export async function getQuote(symbol: string): Promise<QuoteActionResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate symbol
  if (!symbol || typeof symbol !== "string") {
    return { success: false, error: "Symbol is required" };
  }

  const trimmedSymbol = symbol.trim().toUpperCase();
  if (trimmedSymbol.length === 0 || trimmedSymbol.length > 10) {
    return { success: false, error: "Invalid symbol format" };
  }

  // Get user's Alpaca credentials
  const credentials = await getAlpacaCredentials(session.user.dbId);
  if (!credentials) {
    return {
      success: false,
      error: "Alpaca credentials not configured. Please add your API keys in Settings.",
    };
  }

  const result = await getQuoteService(
    trimmedSymbol,
    credentials.apiKey,
    credentials.apiSecret
  );

  return result;
}

/**
 * Get real-time quotes for multiple symbols
 * Optimizes by batching API calls and using cache
 */
export async function getQuotes(
  symbols: string[]
): Promise<BatchQuoteActionResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate symbols
  if (!Array.isArray(symbols)) {
    return { success: false, error: "Symbols must be an array" };
  }

  if (symbols.length === 0) {
    return { success: true, quotes: [] };
  }

  // Limit batch size to prevent abuse
  const MAX_BATCH_SIZE = 100;
  if (symbols.length > MAX_BATCH_SIZE) {
    return {
      success: false,
      error: `Maximum ${MAX_BATCH_SIZE} symbols per request`,
    };
  }

  // Validate each symbol
  const validatedSymbols: string[] = [];
  for (const symbol of symbols) {
    if (typeof symbol !== "string") {
      continue;
    }
    const trimmed = symbol.trim().toUpperCase();
    if (trimmed.length > 0 && trimmed.length <= 10) {
      validatedSymbols.push(trimmed);
    }
  }

  if (validatedSymbols.length === 0) {
    return { success: false, error: "No valid symbols provided" };
  }

  // Get user's Alpaca credentials
  const credentials = await getAlpacaCredentials(session.user.dbId);
  if (!credentials) {
    return {
      success: false,
      error: "Alpaca credentials not configured. Please add your API keys in Settings.",
    };
  }

  const result = await getQuotesService(
    validatedSymbols,
    credentials.apiKey,
    credentials.apiSecret
  );

  return result;
}

/**
 * Get snapshot quotes for multiple symbols
 * Includes current price, previous close, change %, day high/low
 */
export async function getSnapshots(
  symbols: string[]
): Promise<BatchSnapshotActionResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate symbols
  if (!Array.isArray(symbols)) {
    return { success: false, error: "Symbols must be an array" };
  }

  if (symbols.length === 0) {
    return { success: true, snapshots: [] };
  }

  // Limit batch size to prevent abuse
  const MAX_BATCH_SIZE = 100;
  if (symbols.length > MAX_BATCH_SIZE) {
    return {
      success: false,
      error: `Maximum ${MAX_BATCH_SIZE} symbols per request`,
    };
  }

  // Validate each symbol
  const validatedSymbols: string[] = [];
  for (const symbol of symbols) {
    if (typeof symbol !== "string") {
      continue;
    }
    const trimmed = symbol.trim().toUpperCase();
    if (trimmed.length > 0 && trimmed.length <= 10) {
      validatedSymbols.push(trimmed);
    }
  }

  if (validatedSymbols.length === 0) {
    return { success: false, error: "No valid symbols provided" };
  }

  // Get user's Alpaca credentials
  const credentials = await getAlpacaCredentials(session.user.dbId);
  if (!credentials) {
    return {
      success: false,
      error: "Alpaca credentials not configured. Please add your API keys in Settings.",
    };
  }

  const result = await getSnapshotsService(
    validatedSymbols,
    credentials.apiKey,
    credentials.apiSecret
  );

  return result;
}
