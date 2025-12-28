#!/usr/bin/env npx tsx
/**
 * Background job worker script.
 *
 * This script starts the pg-boss job scheduler and runs it continuously.
 * It handles graceful shutdown on SIGINT and SIGTERM signals.
 *
 * Usage:
 *   npx tsx scripts/worker.ts
 *
 * Or with npm script:
 *   npm run worker
 *
 * Environment variables:
 *   DATABASE_URL - PostgreSQL connection string (required)
 *   ENCRYPTION_KEY - Key for decrypting Alpaca credentials (for EOD snapshots)
 *   ALPACA_BASE_URL - Alpaca API base URL (defaults to paper trading)
 *
 * @module scripts/worker
 */

import { initializeScheduler, shutdownScheduler } from '../src/lib/jobs';

/** Track if shutdown is in progress */
let isShuttingDown = false;

/**
 * Gracefully shuts down the worker.
 */
async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    console.log(`[worker] Already shutting down, ignoring ${signal}`);
    return;
  }

  isShuttingDown = true;
  console.log(`[worker] Received ${signal}, initiating graceful shutdown...`);

  try {
    await shutdownScheduler();
    console.log('[worker] Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('[worker] Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Main entry point for the worker.
 */
async function main(): Promise<void> {
  console.log('[worker] Starting background job worker...');
  console.log('[worker] Node version:', process.version);
  console.log('[worker] PID:', process.pid);

  // Validate required environment variables
  if (!process.env.DATABASE_URL) {
    console.error('[worker] ERROR: DATABASE_URL environment variable is required');
    process.exit(1);
  }

  // Register signal handlers for graceful shutdown
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('[worker] Uncaught exception:', error);
    gracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    console.error('[worker] Unhandled rejection:', reason);
    gracefulShutdown('unhandledRejection');
  });

  try {
    // Initialize the scheduler (starts pg-boss, registers handlers, schedules jobs)
    await initializeScheduler();
    console.log('[worker] Worker is now running and processing jobs');
    console.log('[worker] Press Ctrl+C to stop');

    // Keep the process alive
    // pg-boss will handle job polling internally
  } catch (error) {
    console.error('[worker] Failed to start worker:', error);
    process.exit(1);
  }
}

// Run the worker
main();
