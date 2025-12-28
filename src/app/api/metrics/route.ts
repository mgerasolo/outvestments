import { NextResponse } from "next/server";
import {
  exportMetrics,
  updateSystemMetrics,
  setGauge,
  METRICS,
} from "@/lib/metrics";
import { db } from "@/lib/db";
import { targets, aims, shots, users } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { getCircuitState, CIRCUITS, CircuitState } from "@/lib/alpaca/circuit-breaker";

/**
 * Prometheus metrics endpoint
 *
 * Returns metrics in Prometheus text exposition format.
 * Configure Prometheus to scrape this endpoint:
 *
 * ```yaml
 * scrape_configs:
 *   - job_name: 'outvestments'
 *     static_configs:
 *       - targets: ['10.0.0.31:3155']
 *     metrics_path: '/api/metrics'
 * ```
 */
export async function GET() {
  try {
    // Update system metrics before export
    updateSystemMetrics();

    // Update circuit breaker state metrics
    const circuits = [
      { name: "trading", state: getCircuitState(CIRCUITS.ALPACA_TRADING) },
      { name: "account", state: getCircuitState(CIRCUITS.ALPACA_ACCOUNT) },
      { name: "orders", state: getCircuitState(CIRCUITS.ALPACA_ORDERS) },
    ];

    for (const circuit of circuits) {
      // 0 = CLOSED (healthy), 1 = HALF_OPEN (recovering), 2 = OPEN (failing)
      const stateValue =
        circuit.state.state === CircuitState.CLOSED
          ? 0
          : circuit.state.state === CircuitState.HALF_OPEN
            ? 1
            : 2;
      setGauge(METRICS.ALPACA_CIRCUIT_STATE, stateValue, { circuit: circuit.name });
    }

    // Update business metrics from database
    // These queries are lightweight count queries
    try {
      const [targetCount, aimCount, shotCount, userCount] = await Promise.all([
        db.select({ count: count() }).from(targets),
        db.select({ count: count() }).from(aims),
        db.select({ count: count() }).from(shots),
        db.select({ count: count() }).from(users),
      ]);

      setGauge(METRICS.TARGETS_TOTAL, targetCount[0]?.count ?? 0);
      setGauge(METRICS.AIMS_TOTAL, aimCount[0]?.count ?? 0);
      setGauge(METRICS.SHOTS_TOTAL, shotCount[0]?.count ?? 0);
      setGauge(METRICS.ACTIVE_USERS, userCount[0]?.count ?? 0);

      // Count active positions (shots with state 'active')
      const activePositions = await db
        .select({ count: count() })
        .from(shots)
        .where(eq(shots.state, "active"));
      setGauge(METRICS.POSITIONS_TOTAL, activePositions[0]?.count ?? 0);
    } catch {
      // Database metrics failed - metrics endpoint should still work
      // The absence of these metrics will indicate DB issues
    }

    // Export all metrics
    const metricsText = exportMetrics();

    return new NextResponse(metricsText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    // Even if something fails, return empty metrics rather than error
    console.error("Metrics export error:", error);
    return new NextResponse("# Metrics export failed\n", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}
