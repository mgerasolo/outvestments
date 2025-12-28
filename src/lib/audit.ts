import { auth } from "@/auth";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { headers } from "next/headers";

// Audit log entry type matching the database schema
export interface AuditLogEntry {
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  payload: Record<string, unknown>;
}

/**
 * Get client metadata for audit logging (IP, user agent)
 * Used for compliance and security monitoring
 */
async function getClientMetadata(): Promise<{
  ipAddress?: string;
  userAgent?: string;
}> {
  try {
    const headersList = await headers();
    return {
      ipAddress:
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headersList.get("x-real-ip") ||
        undefined,
      userAgent: headersList.get("user-agent") || undefined,
    };
  } catch {
    // Headers may not be available in some contexts
    return {};
  }
}

/**
 * Creates an audit log entry for financial actions
 * Persists to database for compliance (1-year retention per NFR5)
 *
 * @param action - The action being performed (use AuditActions constants)
 * @param entityType - Type of entity being acted upon (target, aim, shot, etc.)
 * @param entityId - UUID of the entity (optional for non-entity actions)
 * @param payload - Additional context data (changes made, previous values, etc.)
 */
export async function logAudit(
  action: string,
  entityType: string,
  entityId: string | null = null,
  payload: Record<string, unknown> = {}
): Promise<void> {
  const session = await auth();

  if (!session?.user?.dbId) {
    // Log warning but don't fail - user might not be synced yet
    console.warn("[Audit] No database user ID, skipping audit log for:", action);
    return;
  }

  try {
    const metadata = await getClientMetadata();

    // Enrich payload with client metadata
    const enrichedPayload = {
      ...payload,
      _metadata: {
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        timestamp: new Date().toISOString(),
        sessionUserId: session.user.id, // Authentik sub
        userEmail: session.user.email,
        userRole: session.user.role,
      },
    };

    await db.insert(auditLogs).values({
      userId: session.user.dbId,
      action,
      entityType,
      entityId,
      payload: enrichedPayload,
    });
  } catch (error) {
    // Log error but don't throw - audit failures shouldn't break the app
    console.error("[Audit] Failed to write audit log:", error, {
      action,
      entityType,
      entityId,
    });
  }
}

/**
 * Create audit log without requiring authentication context
 * Used for system-level actions or when user ID is known directly
 */
export async function logAuditSystem(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string | null = null,
  payload: Record<string, unknown> = {}
): Promise<void> {
  try {
    const metadata = await getClientMetadata();

    const enrichedPayload = {
      ...payload,
      _metadata: {
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        timestamp: new Date().toISOString(),
        source: "system",
      },
    };

    await db.insert(auditLogs).values({
      userId,
      action,
      entityType,
      entityId,
      payload: enrichedPayload,
    });
  } catch (error) {
    console.error("[Audit] Failed to write system audit log:", error, {
      action,
      entityType,
      entityId,
    });
  }
}

// Common audit actions
export const AuditActions = {
  // Target actions
  TARGET_CREATED: "target.created",
  TARGET_UPDATED: "target.updated",
  TARGET_DELETED: "target.deleted",
  TARGET_ARCHIVED: "target.archived",
  TARGET_RESTORED: "target.restored",

  // Aim actions
  AIM_CREATED: "aim.created",
  AIM_UPDATED: "aim.updated",
  AIM_DELETED: "aim.deleted",

  // Shot actions
  SHOT_CREATED: "shot.created",
  SHOT_ARMED: "shot.armed",
  SHOT_FIRED: "shot.fired",
  SHOT_ACTIVE: "shot.active",
  SHOT_CLOSED: "shot.closed",
  SHOT_CANCELLED: "shot.cancelled",
  SHOT_PARTIAL_CLOSED: "shot.partial_closed",
  SHOT_SPLIT: "shot.split",

  // Alpaca actions
  ALPACA_CREDENTIALS_SAVED: "alpaca.credentials.saved",
  ALPACA_CREDENTIALS_UPDATED: "alpaca.credentials.updated",
  ALPACA_CREDENTIALS_DELETED: "alpaca.credentials.deleted",
  ALPACA_CONNECTION_TESTED: "alpaca.connection.tested",
  ALPACA_ORDER_PLACED: "alpaca.order.placed",
  ALPACA_ORDER_FILLED: "alpaca.order.filled",
  ALPACA_ORDER_CANCELLED: "alpaca.order.cancelled",

  // User actions
  USER_SETTINGS_UPDATED: "user.settings.updated",
  USER_LOGGED_IN: "user.logged_in",
  USER_LOGGED_OUT: "user.logged_out",

  // System actions
  PRICE_FETCHED: "system.price.fetched",
  SCORE_CALCULATED: "system.score.calculated",
  BACKFILL_STARTED: "system.backfill.started",
  BACKFILL_COMPLETED: "system.backfill.completed",
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];

// Entity types for categorization
export const AuditEntityTypes = {
  TARGET: "target",
  AIM: "aim",
  SHOT: "shot",
  SCORE: "score",
  USER: "user",
  ALPACA: "alpaca",
  SYSTEM: "system",
} as const;

export type AuditEntityType =
  (typeof AuditEntityTypes)[keyof typeof AuditEntityTypes];
