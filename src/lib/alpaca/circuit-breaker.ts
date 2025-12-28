/**
 * Circuit Breaker for Alpaca API calls
 *
 * Implements the circuit breaker pattern to prevent cascading failures
 * when the Alpaca API is experiencing issues.
 *
 * States:
 * - CLOSED: Normal operation, requests go through
 * - OPEN: Circuit is tripped, requests fail fast
 * - HALF_OPEN: Testing if service has recovered
 */

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening circuit
  successThreshold: number; // Number of successes in half-open before closing
  timeout: number; // Time in ms before trying again (half-open)
  monitorInterval: number; // Time window in ms for failure counting
}

export interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number | null;
  lastSuccess: number | null;
  nextRetry: number | null;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5, // Open after 5 failures
  successThreshold: 2, // Close after 2 successes in half-open
  timeout: 30000, // Wait 30 seconds before retry
  monitorInterval: 60000, // Count failures within 1 minute window
};

// In-memory state (per-process)
// In production, consider using Redis for distributed state
const circuitStates = new Map<string, CircuitBreakerState>();

function getState(circuitName: string): CircuitBreakerState {
  if (!circuitStates.has(circuitName)) {
    circuitStates.set(circuitName, {
      state: CircuitState.CLOSED,
      failures: 0,
      successes: 0,
      lastFailure: null,
      lastSuccess: null,
      nextRetry: null,
    });
  }
  return circuitStates.get(circuitName)!;
}

function setState(circuitName: string, state: Partial<CircuitBreakerState>) {
  const current = getState(circuitName);
  circuitStates.set(circuitName, { ...current, ...state });
}

/**
 * Check if the circuit should allow a request
 */
export function canRequest(
  circuitName: string,
  options: Partial<CircuitBreakerOptions> = {}
): boolean {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const state = getState(circuitName);
  const now = Date.now();

  // Reset failures if outside monitoring window
  if (
    state.lastFailure &&
    now - state.lastFailure > opts.monitorInterval
  ) {
    setState(circuitName, {
      failures: 0,
      lastFailure: null,
    });
  }

  switch (state.state) {
    case CircuitState.CLOSED:
      return true;

    case CircuitState.OPEN:
      // Check if timeout has passed
      if (state.nextRetry && now >= state.nextRetry) {
        // Transition to half-open
        setState(circuitName, {
          state: CircuitState.HALF_OPEN,
          successes: 0,
        });
        return true;
      }
      return false;

    case CircuitState.HALF_OPEN:
      // Allow limited requests in half-open state
      return true;

    default:
      return true;
  }
}

/**
 * Record a successful request
 */
export function recordSuccess(
  circuitName: string,
  options: Partial<CircuitBreakerOptions> = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const state = getState(circuitName);
  const now = Date.now();

  switch (state.state) {
    case CircuitState.CLOSED:
      setState(circuitName, {
        lastSuccess: now,
        // Reset failure count on success
        failures: Math.max(0, state.failures - 1),
      });
      break;

    case CircuitState.HALF_OPEN:
      const newSuccesses = state.successes + 1;
      if (newSuccesses >= opts.successThreshold) {
        // Close the circuit
        setState(circuitName, {
          state: CircuitState.CLOSED,
          failures: 0,
          successes: 0,
          lastSuccess: now,
          nextRetry: null,
        });
        console.log(`[CircuitBreaker] ${circuitName}: Circuit CLOSED (recovered)`);
      } else {
        setState(circuitName, {
          successes: newSuccesses,
          lastSuccess: now,
        });
      }
      break;

    case CircuitState.OPEN:
      // Shouldn't happen, but handle gracefully
      setState(circuitName, { lastSuccess: now });
      break;
  }
}

/**
 * Record a failed request
 */
export function recordFailure(
  circuitName: string,
  error?: Error,
  options: Partial<CircuitBreakerOptions> = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const state = getState(circuitName);
  const now = Date.now();

  console.warn(
    `[CircuitBreaker] ${circuitName}: Failure recorded`,
    error?.message || "Unknown error"
  );

  switch (state.state) {
    case CircuitState.CLOSED:
      const newFailures = state.failures + 1;
      if (newFailures >= opts.failureThreshold) {
        // Open the circuit
        setState(circuitName, {
          state: CircuitState.OPEN,
          failures: newFailures,
          lastFailure: now,
          nextRetry: now + opts.timeout,
        });
        console.error(
          `[CircuitBreaker] ${circuitName}: Circuit OPEN (threshold reached: ${newFailures})`
        );
      } else {
        setState(circuitName, {
          failures: newFailures,
          lastFailure: now,
        });
      }
      break;

    case CircuitState.HALF_OPEN:
      // Immediately re-open on failure in half-open state
      setState(circuitName, {
        state: CircuitState.OPEN,
        failures: state.failures + 1,
        lastFailure: now,
        successes: 0,
        nextRetry: now + opts.timeout,
      });
      console.error(
        `[CircuitBreaker] ${circuitName}: Circuit OPEN (half-open test failed)`
      );
      break;

    case CircuitState.OPEN:
      setState(circuitName, {
        failures: state.failures + 1,
        lastFailure: now,
      });
      break;
  }
}

/**
 * Get the current circuit state for monitoring
 */
export function getCircuitState(circuitName: string): CircuitBreakerState {
  return { ...getState(circuitName) };
}

/**
 * Manually reset a circuit to closed state
 */
export function resetCircuit(circuitName: string): void {
  setState(circuitName, {
    state: CircuitState.CLOSED,
    failures: 0,
    successes: 0,
    lastFailure: null,
    lastSuccess: null,
    nextRetry: null,
  });
  console.log(`[CircuitBreaker] ${circuitName}: Circuit manually reset`);
}

/**
 * Error thrown when circuit is open
 */
export class CircuitOpenError extends Error {
  constructor(
    public circuitName: string,
    public nextRetry: number | null
  ) {
    super(
      `Circuit breaker '${circuitName}' is OPEN. ` +
        (nextRetry
          ? `Retry after ${new Date(nextRetry).toISOString()}`
          : "Retry later.")
    );
    this.name = "CircuitOpenError";
  }
}

/**
 * Wrapper function to execute an async operation with circuit breaker protection
 */
export async function withCircuitBreaker<T>(
  circuitName: string,
  operation: () => Promise<T>,
  options: Partial<CircuitBreakerOptions> = {}
): Promise<T> {
  // Check if circuit allows request
  if (!canRequest(circuitName, options)) {
    const state = getState(circuitName);
    throw new CircuitOpenError(circuitName, state.nextRetry);
  }

  try {
    const result = await operation();
    recordSuccess(circuitName, options);
    return result;
  } catch (error) {
    recordFailure(circuitName, error instanceof Error ? error : undefined, options);
    throw error;
  }
}

// Circuit names for consistent usage
export const CIRCUITS = {
  ALPACA_TRADING: "alpaca:trading",
  ALPACA_ACCOUNT: "alpaca:account",
  ALPACA_MARKET_DATA: "alpaca:market-data",
  ALPACA_ORDERS: "alpaca:orders",
} as const;
