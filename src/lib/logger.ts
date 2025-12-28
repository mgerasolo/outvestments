/**
 * Structured Logger for Outvestments
 *
 * Outputs JSON-formatted logs optimized for Loki ingestion.
 * All logs include:
 * - timestamp: ISO8601 format
 * - level: debug, info, warn, error
 * - message: human-readable message
 * - app: outvestments (for Loki label matching)
 * - context: additional structured data
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * logger.info('User logged in', { userId: 'abc123', method: 'oauth' });
 * logger.error('Database connection failed', { error: err.message, host: 'localhost' });
 * ```
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  app: string;
  environment: string;
  version: string;
  // Optional context fields
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  duration_ms?: number;
  error?: string;
  stack?: string;
  // Additional context
  [key: string]: unknown;
}

const APP_NAME = "outvestments";
const APP_VERSION = process.env.npm_package_version ?? "0.1.0";
const ENVIRONMENT = process.env.NODE_ENV ?? "development";

// Log level priority for filtering
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level from environment
const MIN_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ?? (ENVIRONMENT === "production" ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatLogEntry(level: LogLevel, message: string, context?: LogContext): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    app: APP_NAME,
    environment: ENVIRONMENT,
    version: APP_VERSION,
    ...context,
  };

  // Extract error details if present
  if (context?.error instanceof Error) {
    entry.error = context.error.message;
    entry.stack = context.error.stack;
    // Remove the Error object to avoid circular reference issues
    delete (entry as LogContext).error;
  }

  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) return;

  const logLine = formatLogEntry(level, message, context);

  switch (level) {
    case "debug":
      console.debug(logLine);
      break;
    case "info":
      console.info(logLine);
      break;
    case "warn":
      console.warn(logLine);
      break;
    case "error":
      console.error(logLine);
      break;
  }
}

/**
 * Create a child logger with preset context
 * Useful for request-scoped logging
 */
function createChildLogger(baseContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) =>
      log("debug", message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log("info", message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      log("warn", message, { ...baseContext, ...context }),
    error: (message: string, context?: LogContext) =>
      log("error", message, { ...baseContext, ...context }),
  };
}

/**
 * Timer utility for measuring operation duration
 */
function startTimer() {
  const start = Date.now();
  return () => Date.now() - start;
}

export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),

  /**
   * Log a request/response with automatic duration tracking
   */
  withTiming: async <T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> => {
    const timer = startTimer();
    try {
      const result = await fn();
      log("info", `${operation} completed`, {
        ...context,
        duration_ms: timer(),
        success: true,
      });
      return result;
    } catch (error) {
      log("error", `${operation} failed`, {
        ...context,
        duration_ms: timer(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  },

  /**
   * Create a child logger with preset context
   */
  child: createChildLogger,

  /**
   * Create a timer for manual duration tracking
   */
  timer: startTimer,
};

// Export types for consumers
export type { LogLevel, LogContext, LogEntry };

// Re-export for convenience
export { createChildLogger, startTimer };
