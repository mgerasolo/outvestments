import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { desc, eq, and, gte, lte, like, sql } from "drizzle-orm";
import { isAdmin } from "@/lib/auth/rbac";

/**
 * GET /api/admin/audit-logs
 * Admin-only endpoint to query audit logs
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 50, max: 100)
 * - action: Filter by action type
 * - entityType: Filter by entity type
 * - userId: Filter by user ID
 * - from: Start date (ISO string)
 * - to: End date (ISO string)
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.role || !isAdmin(session.user.role)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;

  // Parse query parameters
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
  const action = searchParams.get("action");
  const entityType = searchParams.get("entityType");
  const userId = searchParams.get("userId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const offset = (page - 1) * limit;

  // Build filter conditions
  const conditions = [];

  if (action) {
    conditions.push(like(auditLogs.action, `%${action}%`));
  }

  if (entityType) {
    conditions.push(eq(auditLogs.entityType, entityType));
  }

  if (userId) {
    conditions.push(eq(auditLogs.userId, userId));
  }

  if (from) {
    conditions.push(gte(auditLogs.createdAt, new Date(from)));
  }

  if (to) {
    conditions.push(lte(auditLogs.createdAt, new Date(to)));
  }

  try {
    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = countResult?.count ?? 0;

    // Fetch audit logs with user info
    const logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        payload: auditLogs.payload,
        createdAt: auditLogs.createdAt,
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
        },
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: logs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + logs.length < totalCount,
      },
    });
  } catch (error) {
    console.error("[Admin] Failed to fetch audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
