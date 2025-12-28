"use server";

import { auth } from "@/auth";
import { getAlpacaCredentials } from "./alpaca";
import {
  withCircuitBreaker,
  CircuitOpenError,
  CIRCUITS,
} from "@/lib/alpaca/circuit-breaker";

// Alpaca Paper Trading base URL
const ALPACA_PAPER_API = "https://paper-api.alpaca.markets";

export interface AlpacaOrder {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at: string | null;
  expired_at: string | null;
  canceled_at: string | null;
  failed_at: string | null;
  asset_id: string;
  symbol: string;
  asset_class: string;
  qty: string;
  filled_qty: string;
  filled_avg_price: string | null;
  order_type: string;
  type: string;
  side: string;
  time_in_force: string;
  limit_price: string | null;
  stop_price: string | null;
  status: string;
  extended_hours: boolean;
}

export interface TradeHistoryFilters {
  status?: "all" | "open" | "closed" | "canceled";
  side?: "all" | "buy" | "sell";
  symbol?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  limit?: number;
  page?: number;
}

export interface TradeHistoryResult {
  success: boolean;
  error?: string;
  orders?: AlpacaOrder[];
  totalCount?: number;
  hasMore?: boolean;
}

/**
 * Fetch trade history from Alpaca API
 * Supports filtering by status, side, symbol, and date range
 */
export async function getAlpacaTradeHistory(
  filters: TradeHistoryFilters = {}
): Promise<TradeHistoryResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  const alpacaCreds = await getAlpacaCredentials(session.user.dbId);
  if (!alpacaCreds) {
    return { success: false, error: "Alpaca credentials not configured" };
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();

    // Status filter - default to 'all' to get both open and closed orders
    const status = filters.status || "all";
    params.append("status", status);

    // Limit - default to 100, max 500
    const limit = Math.min(filters.limit || 100, 500);
    params.append("limit", limit.toString());

    // Date filters
    if (filters.startDate) {
      params.append("after", new Date(filters.startDate).toISOString());
    }
    if (filters.endDate) {
      params.append("until", new Date(filters.endDate).toISOString());
    }

    // Sort direction - newest first
    params.append("direction", "desc");

    const orders = await withCircuitBreaker(
      CIRCUITS.ALPACA_ORDERS,
      async () => {
        const response = await fetch(
          `${ALPACA_PAPER_API}/v2/orders?${params.toString()}`,
          {
            headers: {
              "APCA-API-KEY-ID": alpacaCreds.apiKey,
              "APCA-API-SECRET-KEY": alpacaCreds.apiSecret,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        return response.json();
      }
    );

    // Apply client-side filters that Alpaca doesn't support
    let filteredOrders = orders as AlpacaOrder[];

    // Filter by side (buy/sell)
    if (filters.side && filters.side !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) => order.side === filters.side
      );
    }

    // Filter by symbol (case-insensitive partial match)
    if (filters.symbol && filters.symbol.trim()) {
      const symbolFilter = filters.symbol.trim().toUpperCase();
      filteredOrders = filteredOrders.filter((order) =>
        order.symbol.toUpperCase().includes(symbolFilter)
      );
    }

    // Calculate pagination
    const page = filters.page || 1;
    const pageSize = 20;
    const startIndex = (page - 1) * pageSize;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

    return {
      success: true,
      orders: paginatedOrders,
      totalCount: filteredOrders.length,
      hasMore: startIndex + pageSize < filteredOrders.length,
    };
  } catch (error) {
    console.error("Error fetching Alpaca trade history:", error);

    if (error instanceof CircuitOpenError) {
      return {
        success: false,
        error: "Alpaca API is temporarily unavailable. Please try again later.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch trade history",
    };
  }
}

/**
 * Get account activities from Alpaca (fills, dividends, etc.)
 */
export async function getAlpacaActivities(
  activityTypes: string[] = ["FILL"],
  limit: number = 100
): Promise<TradeHistoryResult> {
  const session = await auth();

  if (!session?.user?.dbId) {
    return { success: false, error: "Not authenticated" };
  }

  const alpacaCreds = await getAlpacaCredentials(session.user.dbId);
  if (!alpacaCreds) {
    return { success: false, error: "Alpaca credentials not configured" };
  }

  try {
    const params = new URLSearchParams();
    params.append("activity_types", activityTypes.join(","));
    params.append("direction", "desc");
    params.append("page_size", limit.toString());

    const activities = await withCircuitBreaker(
      CIRCUITS.ALPACA_ACCOUNT,
      async () => {
        const response = await fetch(
          `${ALPACA_PAPER_API}/v2/account/activities?${params.toString()}`,
          {
            headers: {
              "APCA-API-KEY-ID": alpacaCreds.apiKey,
              "APCA-API-SECRET-KEY": alpacaCreds.apiSecret,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        return response.json();
      }
    );

    return {
      success: true,
      orders: activities,
      totalCount: activities.length,
    };
  } catch (error) {
    console.error("Error fetching Alpaca activities:", error);

    if (error instanceof CircuitOpenError) {
      return {
        success: false,
        error: "Alpaca API is temporarily unavailable. Please try again later.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch activities",
    };
  }
}
