/**
 * Job scheduler for registering and managing background jobs.
 *
 * This module handles:
 * - Registering job handlers with pg-boss
 * - Scheduling recurring jobs with cron expressions
 * - Graceful startup and shutdown
 *
 * @module lib/jobs/scheduler
 */

import { PgBoss } from 'pg-boss';
import { startBoss, stopBoss, getBoss, DEFAULT_QUEUE_OPTIONS } from './boss';
import {
  JOB_NAMES,
  JOB_SCHEDULES,
  type Job,
  type ScheduleOptions,
  type ScoreRefreshJobData,
  type EodSnapshotJobData,
  type CacheCleanupJobData,
  type PriceAlertJobData,
  type PhantomTrackJobData,
} from './types';
import {
  scoreRefreshHandler,
  eodSnapshotHandler,
  cacheCleanupHandler,
  priceAlertHandler,
  phantomTrackHandler,
} from './handlers';

/**
 * Job registration configuration.
 */
interface JobRegistration {
  /** Job name identifier */
  name: string;
  /** Handler function for processing jobs */
  handler: (job: Job<unknown>) => Promise<unknown>;
  /** Optional cron schedule for recurring jobs */
  schedule?: string;
  /** Optional schedule options */
  options?: ScheduleOptions;
}

/**
 * All registered jobs with their configurations.
 */
const jobRegistrations: JobRegistration[] = [
  {
    name: JOB_NAMES.SCORE_REFRESH,
    handler: scoreRefreshHandler as (job: Job<unknown>) => Promise<unknown>,
    schedule: JOB_SCHEDULES.SCORE_REFRESH,
    options: {
      tz: 'America/New_York',
      ...DEFAULT_QUEUE_OPTIONS,
    },
  },
  {
    name: JOB_NAMES.EOD_SNAPSHOT,
    handler: eodSnapshotHandler as (job: Job<unknown>) => Promise<unknown>,
    schedule: JOB_SCHEDULES.EOD_SNAPSHOT,
    options: {
      tz: 'America/New_York',
      ...DEFAULT_QUEUE_OPTIONS,
    },
  },
  {
    name: JOB_NAMES.CACHE_CLEANUP,
    handler: cacheCleanupHandler as (job: Job<unknown>) => Promise<unknown>,
    schedule: JOB_SCHEDULES.CACHE_CLEANUP,
    options: {
      tz: 'America/New_York',
      ...DEFAULT_QUEUE_OPTIONS,
    },
  },
  {
    name: JOB_NAMES.PRICE_ALERT,
    handler: priceAlertHandler as (job: Job<unknown>) => Promise<unknown>,
    schedule: JOB_SCHEDULES.PRICE_ALERT,
    options: {
      tz: 'America/New_York',
      ...DEFAULT_QUEUE_OPTIONS,
    },
  },
  {
    name: JOB_NAMES.PHANTOM_TRACK,
    handler: phantomTrackHandler as (job: Job<unknown>) => Promise<unknown>,
    schedule: JOB_SCHEDULES.PHANTOM_TRACK,
    options: {
      tz: 'America/New_York',
      ...DEFAULT_QUEUE_OPTIONS,
    },
  },
];

/**
 * Creates all required queues in pg-boss.
 * Must be called before registering handlers or scheduling jobs.
 *
 * @param boss - The pg-boss instance
 */
async function createQueues(boss: PgBoss): Promise<void> {
  for (const registration of jobRegistrations) {
    try {
      await boss.createQueue(registration.name);
      console.log(`[scheduler] Created queue: ${registration.name}`);
    } catch (error) {
      // Queue might already exist - that's fine
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log(`[scheduler] Queue already exists: ${registration.name}`);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Registers all job handlers with pg-boss.
 *
 * @param boss - The pg-boss instance
 */
async function registerHandlers(boss: PgBoss): Promise<void> {
  for (const registration of jobRegistrations) {
    // pg-boss work handler receives an array of jobs
    await boss.work(registration.name, async (jobs) => {
      // Process each job in the batch
      for (const job of jobs) {
        await registration.handler(job as Job<unknown>);
      }
    });
    console.log(`[scheduler] Registered handler for job: ${registration.name}`);
  }
}

/**
 * Schedules all recurring jobs using cron expressions.
 *
 * @param boss - The pg-boss instance
 */
async function scheduleRecurringJobs(boss: PgBoss): Promise<void> {
  for (const registration of jobRegistrations) {
    if (registration.schedule) {
      await boss.schedule(
        registration.name,
        registration.schedule,
        {},
        registration.options
      );
      console.log(
        `[scheduler] Scheduled job: ${registration.name} with cron: ${registration.schedule}`
      );
    }
  }
}

/**
 * Initializes the job scheduler.
 *
 * Starts pg-boss, registers handlers, and schedules recurring jobs.
 *
 * @returns Promise that resolves when scheduler is fully initialized
 */
export async function initializeScheduler(): Promise<PgBoss> {
  console.log('[scheduler] Initializing...');

  const boss = await startBoss();

  // Create queues first (required in pg-boss v12+)
  await createQueues(boss);

  // Then register handlers and schedule jobs
  await registerHandlers(boss);
  await scheduleRecurringJobs(boss);

  console.log('[scheduler] Initialization complete');

  return boss;
}

/**
 * Gracefully shuts down the job scheduler.
 *
 * @returns Promise that resolves when scheduler is stopped
 */
export async function shutdownScheduler(): Promise<void> {
  console.log('[scheduler] Shutting down...');
  await stopBoss();
  console.log('[scheduler] Shutdown complete');
}

/**
 * Manually enqueues a score refresh job.
 *
 * @param data - Optional job data
 * @returns Promise resolving to the job ID
 */
export async function enqueueScoreRefresh(
  data: ScoreRefreshJobData = {}
): Promise<string | null> {
  const boss = getBoss();
  const jobId = await boss.send(
    JOB_NAMES.SCORE_REFRESH,
    {
      ...data,
      createdAt: new Date().toISOString(),
    },
    DEFAULT_QUEUE_OPTIONS
  );
  console.log(`[scheduler] Enqueued ${JOB_NAMES.SCORE_REFRESH} job: ${jobId}`);
  return jobId;
}

/**
 * Manually enqueues an EOD snapshot job.
 *
 * @param data - Optional job data
 * @returns Promise resolving to the job ID
 */
export async function enqueueEodSnapshot(
  data: EodSnapshotJobData = {}
): Promise<string | null> {
  const boss = getBoss();
  const jobId = await boss.send(
    JOB_NAMES.EOD_SNAPSHOT,
    {
      ...data,
      createdAt: new Date().toISOString(),
    },
    DEFAULT_QUEUE_OPTIONS
  );
  console.log(`[scheduler] Enqueued ${JOB_NAMES.EOD_SNAPSHOT} job: ${jobId}`);
  return jobId;
}

/**
 * Manually enqueues a cache cleanup job.
 *
 * @param data - Optional job data
 * @returns Promise resolving to the job ID
 */
export async function enqueueCacheCleanup(
  data: CacheCleanupJobData = {}
): Promise<string | null> {
  const boss = getBoss();
  const jobId = await boss.send(
    JOB_NAMES.CACHE_CLEANUP,
    {
      ...data,
      createdAt: new Date().toISOString(),
    },
    DEFAULT_QUEUE_OPTIONS
  );
  console.log(`[scheduler] Enqueued ${JOB_NAMES.CACHE_CLEANUP} job: ${jobId}`);
  return jobId;
}

/**
 * Manually enqueues a price alert check job.
 *
 * @param data - Optional job data
 * @returns Promise resolving to the job ID
 */
export async function enqueuePriceAlert(
  data: PriceAlertJobData = {}
): Promise<string | null> {
  const boss = getBoss();
  const jobId = await boss.send(
    JOB_NAMES.PRICE_ALERT,
    {
      ...data,
      createdAt: new Date().toISOString(),
    },
    DEFAULT_QUEUE_OPTIONS
  );
  console.log(`[scheduler] Enqueued ${JOB_NAMES.PRICE_ALERT} job: ${jobId}`);
  return jobId;
}

/**
 * Manually enqueues a phantom position tracking job.
 *
 * @param data - Optional job data
 * @returns Promise resolving to the job ID
 */
export async function enqueuePhantomTrack(
  data: PhantomTrackJobData = {}
): Promise<string | null> {
  const boss = getBoss();
  const jobId = await boss.send(
    JOB_NAMES.PHANTOM_TRACK,
    {
      ...data,
      createdAt: new Date().toISOString(),
    },
    DEFAULT_QUEUE_OPTIONS
  );
  console.log(`[scheduler] Enqueued ${JOB_NAMES.PHANTOM_TRACK} job: ${jobId}`);
  return jobId;
}

export default initializeScheduler;
