import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  version: string;
  checks: {
    database: {
      status: "up" | "down";
      latencyMs?: number;
      error?: string;
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  const status: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
    checks: {
      database: {
        status: "down",
      },
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
  } catch (error) {
    status.status = "unhealthy";
    status.checks.database = {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }

  const httpStatus = status.status === "healthy" ? 200 : 503;

  return NextResponse.json(status, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
