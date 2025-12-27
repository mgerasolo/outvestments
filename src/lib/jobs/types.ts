/**
 * Type definitions for pg-boss job handlers.
 *
 * @module lib/jobs/types
 */

/**
 * Generic job data interface.
 * Extended by specific job types.
 */
export interface JobData {
  /** Optional correlation ID for tracing */
  correlationId?: string;
  /** Timestamp when the job was created */
  createdAt?: string;
}

/**
 * Score refresh job data.
 * Used for hourly recalculation of open position scores.
 */
export interface ScoreRefreshJobData extends JobData {
  /** Optional specific position IDs to refresh (all if empty) */
  positionIds?: string[];
  /** Force refresh even if recently updated */
  forceRefresh?: boolean;
}

/**
 * End-of-day snapshot job data.
 * Used for daily 4:30 PM ET portfolio state capture.
 */
export interface EodSnapshotJobData extends JobData {
  /** The trading date for the snapshot (YYYY-MM-DD) */
  tradingDate?: string;
  /** Optional specific portfolio IDs (all if empty) */
  portfolioIds?: string[];
}

/**
 * Cache cleanup job data.
 * Used for daily 2:00 AM cache pruning.
 */
export interface CacheCleanupJobData extends JobData {
  /** Maximum age in hours for cached entries */
  maxAgeHours?: number;
  /** Dry run mode - log what would be deleted without actually deleting */
  dryRun?: boolean;
}

/**
 * Job result interface for successful completions.
 */
export interface JobResult {
  /** Whether the job completed successfully */
  success: boolean;
  /** Human-readable message about the result */
  message: string;
  /** Number of items processed */
  processedCount?: number;
  /** Duration in milliseconds */
  durationMs?: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * pg-boss Job interface matching the library's Job type.
 */
export interface Job<T = object> {
  /** Unique job identifier */
  id: string;
  /** Job queue name */
  name: string;
  /** Job payload data */
  data: T;
  /** Seconds until job expires */
  expireInSeconds: number;
  /** Abort signal for cancellation */
  signal: AbortSignal;
}

/**
 * Job handler function type.
 * Receives job data and returns a result.
 */
export type JobHandler<T extends JobData = JobData> = (
  job: Job<T>
) => Promise<JobResult>;

/**
 * Job names as const for type safety.
 */
export const JOB_NAMES = {
  SCORE_REFRESH: 'score-refresh',
  EOD_SNAPSHOT: 'eod-snapshot',
  CACHE_CLEANUP: 'cache-cleanup',
} as const;

/**
 * Union type of all job names.
 */
export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];

/**
 * Cron expressions for scheduled jobs.
 */
export const JOB_SCHEDULES = {
  /** Every hour at minute 0 */
  SCORE_REFRESH: '0 * * * *',
  /** 4:30 PM ET daily (21:30 UTC during EST, 20:30 UTC during EDT) */
  EOD_SNAPSHOT: '30 21 * * 1-5',
  /** 2:00 AM ET daily (07:00 UTC during EST, 06:00 UTC during EDT) */
  CACHE_CLEANUP: '0 7 * * *',
} as const;

/**
 * Schedule options for recurring jobs.
 */
export interface ScheduleOptions {
  /** Timezone for cron expression */
  tz?: string;
  /** Optional key for schedule identification */
  key?: string;
  /** Seconds to retain completed jobs */
  retentionSeconds?: number;
  /** Seconds after completion to delete job */
  deleteAfterSeconds?: number;
  /** Maximum retry attempts */
  retryLimit?: number;
  /** Use exponential backoff for retries */
  retryBackoff?: boolean;
}
