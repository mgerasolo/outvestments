import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getCircuitState, CIRCUITS, CircuitState } from "@/lib/alpaca/circuit-breaker";
import { logger } from "@/lib/logger";

interface ServiceCheck {
  status: "up" | "down" | "degraded";
  latencyMs?: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: ServiceCheck;
    alpaca?: ServiceCheck;
    memory?: ServiceCheck;
  };
}

// Track when the process started
const startTime = Date.now();

/**
 * Check Alpaca API connectivity via circuit breaker state
 * We don't make an actual API call to avoid rate limiting - we use circuit breaker state
 */
function checkAlpacaCircuitBreaker(): ServiceCheck {
  const tradingState = getCircuitState(CIRCUITS.ALPACA_TRADING);
  const accountState = getCircuitState(CIRCUITS.ALPACA_ACCOUNT);
  const ordersState = getCircuitState(CIRCUITS.ALPACA_ORDERS);

  // Aggregate circuit breaker states
  const circuits = [
    { name: "trading", state: tradingState },
    { name: "account", state: accountState },
    { name: "orders", state: ordersState },
  ];

  const openCircuits = circuits.filter((c) => c.state.state === CircuitState.OPEN);
  const halfOpenCircuits = circuits.filter((c) => c.state.state === CircuitState.HALF_OPEN);

  if (openCircuits.length > 0) {
    return {
      status: "down",
      details: {
        openCircuits: openCircuits.map((c) => c.name),
        message: "Circuit breaker is open due to recent failures",
      },
    };
  }

  if (halfOpenCircuits.length > 0) {
    return {
      status: "degraded",
      details: {
        halfOpenCircuits: halfOpenCircuits.map((c) => c.name),
        message: "Service is recovering from failures",
      },
    };
  }

  return {
    status: "up",
    details: {
      circuits: circuits.map((c) => ({
        name: c.name,
        state: c.state.state,
        failures: c.state.failures,
      })),
    },
  };
}

/**
 * Check memory usage
 */
function checkMemory(): ServiceCheck {
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const rssMB = Math.round(memUsage.rss / 1024 / 1024);

  // Warn if heap usage is above 80%
  const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

  return {
    status: heapPercent > 90 ? "degraded" : heapPercent > 95 ? "down" : "up",
    details: {
      heapUsedMB,
      heapTotalMB,
      heapPercent: Math.round(heapPercent),
      rssMB,
    },
  };
}

export async function GET() {
  const requestStart = Date.now();

  const status: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      database: { status: "down" },
    },
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbLatency = Date.now() - dbStart;

    status.checks.database = {
      status: "up",
      latencyMs: dbLatency,
    };

    // Warn if database is slow (>500ms)
    if (dbLatency > 500) {
      status.checks.database.status = "degraded";
      status.checks.database.details = { warning: "High latency" };
    }
  } catch (error) {
    status.status = "unhealthy";
    status.checks.database = {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown database error",
    };

    logger.error("Health check: Database connection failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Check Alpaca circuit breaker state
  status.checks.alpaca = checkAlpacaCircuitBreaker();
  if (status.checks.alpaca.status === "down") {
    // Alpaca down = degraded (not critical for health check pass)
    if (status.status === "healthy") {
      status.status = "degraded";
    }
  }

  // Check memory
  status.checks.memory = checkMemory();
  if (status.checks.memory.status === "down") {
    status.status = "unhealthy";
  } else if (status.checks.memory.status === "degraded" && status.status === "healthy") {
    status.status = "degraded";
  }

  const httpStatus = status.status === "unhealthy" ? 503 : 200;
  const totalLatency = Date.now() - requestStart;

  // Log health check results for monitoring
  if (status.status !== "healthy") {
    logger.warn("Health check: Degraded or unhealthy", {
      status: status.status,
      checks: status.checks,
      latencyMs: totalLatency,
    });
  }

  return NextResponse.json(status, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Response-Time": `${totalLatency}ms`,
    },
  });
}
