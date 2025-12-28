"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { portfolioSnapshots } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAlpacaCredentials } from "./alpaca";
import {
  withCircuitBreaker,
  CircuitOpenError,
  CIRCUITS,
} from "@/lib/alpaca/circuit-breaker";

// Alpaca Paper Trading base URL
const ALPACA_PAPER_API = "https://paper-api.alpaca.markets";

export interface AccountEquityResult {
  success: boolean;
  error?: string;
  equity?: number;
  cash?: number;
  buyingPower?: number;
}

/**
 * Get account equity from Alpaca for position sizing calculations
 * Returns the account's current equity value
 */
export async function getAccountEquity(): Promise<AccountEquityResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  const alpacaCreds = await getAlpacaCredentials(session.user.dbId);
  if (!alpacaCreds) {
    return { success: false, error: "Alpaca credentials not configured" };
  }

  try {
    const account = await withCircuitBreaker(
      CIRCUITS.ALPACA_ACCOUNT,
      async () => {
        const response = await fetch(`${ALPACA_PAPER_API}/v2/account`, {
          headers: {
            "APCA-API-KEY-ID": alpacaCreds.apiKey,
            "APCA-API-SECRET-KEY": alpacaCreds.apiSecret,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        return response.json();
      }
    );

    return {
      success: true,
      equity: parseFloat(account.equity),
      cash: parseFloat(account.cash),
      buyingPower: parseFloat(account.buying_power),
    };
  } catch (error) {
    console.error("Error fetching account equity:", error);

    if (error instanceof CircuitOpenError) {
      return {
        success: false,
        error: "Alpaca API is temporarily unavailable. Please try again later.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch account",
    };
  }
}

export interface PortfolioHistoryResult {
  success: boolean;
  error?: string;
  data?: Array<{
    date: Date;
    value: number;
    cash: number;
    positions: number;
  }>;
}

/**
 * Get portfolio history from snapshots for charting
 */
export async function getPortfolioHistory(
  days: number = 30
): Promise<PortfolioHistoryResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const snapshots = await db
      .select({
        tradingDate: portfolioSnapshots.tradingDate,
        portfolioValue: portfolioSnapshots.portfolioValue,
        cash: portfolioSnapshots.cash,
      })
      .from(portfolioSnapshots)
      .where(eq(portfolioSnapshots.userId, session.user.dbId))
      .orderBy(desc(portfolioSnapshots.tradingDate))
      .limit(days);

    // Reverse to get chronological order
    const chronological = snapshots.reverse();

    const data = chronological.map((s) => {
      const total = parseFloat(s.portfolioValue);
      const cash = parseFloat(s.cash);
      return {
        date: s.tradingDate,
        value: total,
        cash,
        positions: total - cash,
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching portfolio history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch history",
    };
  }
}
