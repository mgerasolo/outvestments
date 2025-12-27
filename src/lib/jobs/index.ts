/**
 * Background job processing module.
 *
 * This module provides pg-boss based background job processing
 * for the Outvestments application.
 *
 * @example
 * ```typescript
 * import { initializeScheduler, shutdownScheduler } from '@/lib/jobs';
 *
 * // Start the scheduler (typically in app initialization)
 * await initializeScheduler();
 *
 * // Stop the scheduler (typically in app shutdown)
 * await shutdownScheduler();
 * ```
 *
 * @example
 * ```typescript
 * import { enqueueScoreRefresh, enqueueCacheCleanup } from '@/lib/jobs';
 *
 * // Manually trigger jobs
 * await enqueueScoreRefresh({ forceRefresh: true });
 * await enqueueCacheCleanup({ dryRun: true });
 * ```
 *
 * @module lib/jobs
 */

// Core exports
export { getBoss, startBoss, stopBoss, DEFAULT_QUEUE_OPTIONS } from './boss';
export {
  initializeScheduler,
  shutdownScheduler,
  enqueueScoreRefresh,
  enqueueEodSnapshot,
  enqueueCacheCleanup,
} from './scheduler';

// Type exports
export type {
  JobData,
  ScoreRefreshJobData,
  EodSnapshotJobData,
  CacheCleanupJobData,
  JobResult,
  JobHandler,
  JobName,
  Job,
  ScheduleOptions,
} from './types';

export { JOB_NAMES, JOB_SCHEDULES } from './types';

// Handler exports (for testing or direct use)
export {
  scoreRefreshHandler,
  eodSnapshotHandler,
  cacheCleanupHandler,
} from './handlers';
