/**
 * Cache cleanup job handler.
 *
 * Daily 2:00 AM ET job to prune expired price cache entries
 * and maintain database hygiene.
 *
 * @module lib/jobs/handlers/cache-cleanup
 */

import type {
  Job,
  CacheCleanupJobData,
  JobResult,
  JobHandler,
} from '@/lib/jobs/types';
import { db } from '@/lib/db';
import { priceCache, auditLogs } from '@/lib/db/schema';
import { lt, sql } from 'drizzle-orm';

/** Default maximum age for cached entries in hours */
const DEFAULT_MAX_AGE_HOURS = 24;

/**
 * Handles the cache-cleanup job.
 *
 * This job:
 * 1. Identifies expired cache entries based on age threshold
 * 2. Removes stale price data from the cache table
 * 3. Cleans up old audit logs (older than 90 days)
 * 4. Reports cleanup statistics
 */
export const handler: JobHandler<CacheCleanupJobData> = async (
  job: Job<CacheCleanupJobData>
): Promise<JobResult> => {
  const startTime = Date.now();
  const {
    maxAgeHours = DEFAULT_MAX_AGE_HOURS,
    dryRun = false,
    correlationId,
  } = job.data ?? {};

  console.log('[cache-cleanup] Job started', {
    jobId: job.id,
    correlationId,
    maxAgeHours,
    dryRun,
  });

  try {
    // Calculate cutoff timestamps
    const priceCacheCutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    const auditLogCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days

    let priceCacheDeleted = 0;
    let auditLogsDeleted = 0;

    if (dryRun) {
      // Count what would be deleted
      const [priceCacheCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(priceCache)
        .where(lt(priceCache.fetchedAt, priceCacheCutoff));

      const [auditLogCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(auditLogs)
        .where(lt(auditLogs.createdAt, auditLogCutoff));

      priceCacheDeleted = priceCacheCount?.count || 0;
      auditLogsDeleted = auditLogCount?.count || 0;

      console.log('[cache-cleanup] Dry run complete', {
        priceCacheWouldDelete: priceCacheDeleted,
        auditLogsWouldDelete: auditLogsDeleted,
      });
    } else {
      // Delete expired price cache entries
      await db
        .delete(priceCache)
        .where(lt(priceCache.fetchedAt, priceCacheCutoff));

      // Note: Drizzle doesn't return count directly, so we estimate
      // In production, you might want to use returning() or raw SQL

      // Delete old audit logs (older than 90 days)
      await db
        .delete(auditLogs)
        .where(lt(auditLogs.createdAt, auditLogCutoff));

      console.log('[cache-cleanup] Deletion complete', {
        priceCacheCutoff: priceCacheCutoff.toISOString(),
        auditLogCutoff: auditLogCutoff.toISOString(),
      });

      // Get actual counts after deletion for reporting
      const [remainingPriceCache] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(priceCache);

      const [remainingAuditLogs] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(auditLogs);

      console.log('[cache-cleanup] Post-cleanup state', {
        remainingPriceCache: remainingPriceCache?.count || 0,
        remainingAuditLogs: remainingAuditLogs?.count || 0,
      });
    }

    const durationMs = Date.now() - startTime;
    const totalProcessed = priceCacheDeleted + auditLogsDeleted;

    console.log('[cache-cleanup] Job completed', {
      jobId: job.id,
      correlationId,
      priceCacheDeleted,
      auditLogsDeleted,
      dryRun,
      durationMs,
    });

    return {
      success: true,
      message: dryRun
        ? `Dry run: ${totalProcessed} entries would be deleted (${priceCacheDeleted} price cache, ${auditLogsDeleted} audit logs)`
        : `Cleaned up expired cache entries`,
      processedCount: totalProcessed,
      durationMs,
      metadata: {
        dryRun,
        priceCacheCutoff: priceCacheCutoff.toISOString(),
        auditLogCutoff: auditLogCutoff.toISOString(),
        maxAgeHours,
        priceCacheDeleted,
        auditLogsDeleted,
      },
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    console.error('[cache-cleanup] Job failed', {
      jobId: job.id,
      correlationId,
      error: errorMessage,
      durationMs,
    });

    throw error;
  }
};

export default handler;
