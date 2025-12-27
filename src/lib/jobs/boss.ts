/**
 * pg-boss instance configuration for background job processing.
 *
 * This module provides a singleton pg-boss instance configured with:
 * - Queue-level retry settings (3 attempts with exponential backoff)
 * - Monitoring for job state changes
 *
 * Note: Job retention is configured at the queue level via schedule options.
 *
 * @module lib/jobs/boss
 */

import { PgBoss } from 'pg-boss';

/** Singleton pg-boss instance */
let bossInstance: PgBoss | null = null;

/**
 * pg-boss configuration options derived from architecture requirements.
 */
interface BossConfig {
  /** PostgreSQL connection string */
  connectionString: string;
  /** Monitor interval in seconds */
  monitorIntervalSeconds: number;
}

/**
 * Default configuration for pg-boss.
 * Uses DATABASE_URL from environment for PostgreSQL connection.
 */
const defaultConfig: BossConfig = {
  connectionString: process.env.DATABASE_URL ?? '',
  monitorIntervalSeconds: 30,
};

/**
 * Creates a new pg-boss instance with the specified configuration.
 *
 * @param config - Configuration options (uses defaults if not provided)
 * @returns Configured pg-boss instance
 * @throws Error if DATABASE_URL is not set
 */
function createBossInstance(config: Partial<BossConfig> = {}): PgBoss {
  const mergedConfig = { ...defaultConfig, ...config };

  if (!mergedConfig.connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is required for pg-boss'
    );
  }

  return new PgBoss({
    connectionString: mergedConfig.connectionString,
    monitorIntervalSeconds: mergedConfig.monitorIntervalSeconds,
  });
}

/**
 * Returns the singleton pg-boss instance.
 * Creates the instance on first call.
 *
 * @returns The pg-boss singleton instance
 * @throws Error if DATABASE_URL is not configured
 */
export function getBoss(): PgBoss {
  if (!bossInstance) {
    bossInstance = createBossInstance();
  }
  return bossInstance;
}

/**
 * Starts the pg-boss instance if not already running.
 * Must be called before scheduling or processing jobs.
 *
 * @returns Promise that resolves when pg-boss is started
 */
export async function startBoss(): Promise<PgBoss> {
  const boss = getBoss();

  boss.on('error', (error: Error) => {
    console.error('[pg-boss] Error:', error.message);
  });

  await boss.start();
  console.log('[pg-boss] Started successfully');

  return boss;
}

/**
 * Gracefully stops the pg-boss instance.
 * Should be called during application shutdown.
 *
 * @returns Promise that resolves when pg-boss is stopped
 */
export async function stopBoss(): Promise<void> {
  if (bossInstance) {
    await bossInstance.stop({ graceful: true });
    console.log('[pg-boss] Stopped gracefully');
    bossInstance = null;
  }
}

/**
 * Default queue options for jobs.
 * Applied when scheduling jobs to ensure consistent behavior.
 */
export const DEFAULT_QUEUE_OPTIONS = {
  /** Seconds to retain completed jobs (30 days) */
  retentionSeconds: 30 * 24 * 60 * 60,
  /** Seconds after which completed jobs are archived (1 day) */
  deleteAfterSeconds: 86400,
  /** Maximum retry attempts for failed jobs */
  retryLimit: 3,
  /** Use exponential backoff for retries */
  retryBackoff: true,
} as const;

export default getBoss;
