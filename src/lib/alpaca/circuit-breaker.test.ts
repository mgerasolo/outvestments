import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  CircuitState,
  canRequest,
  recordSuccess,
  recordFailure,
  getCircuitState,
  resetCircuit,
  withCircuitBreaker,
  CircuitOpenError,
} from "./circuit-breaker";

// Test circuit name to avoid conflicts
const TEST_CIRCUIT = "test:circuit";

describe("Circuit Breaker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
    resetCircuit(TEST_CIRCUIT);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("starts in CLOSED state", () => {
      const state = getCircuitState(TEST_CIRCUIT);
      expect(state.state).toBe(CircuitState.CLOSED);
      expect(state.failures).toBe(0);
      expect(state.successes).toBe(0);
    });

    it("allows requests in CLOSED state", () => {
      expect(canRequest(TEST_CIRCUIT)).toBe(true);
    });
  });

  describe("failure recording", () => {
    it("increments failure count", () => {
      recordFailure(TEST_CIRCUIT);
      expect(getCircuitState(TEST_CIRCUIT).failures).toBe(1);

      recordFailure(TEST_CIRCUIT);
      expect(getCircuitState(TEST_CIRCUIT).failures).toBe(2);
    });

    it("opens circuit after threshold failures", () => {
      const options = { failureThreshold: 3 };

      recordFailure(TEST_CIRCUIT, undefined, options);
      expect(getCircuitState(TEST_CIRCUIT).state).toBe(CircuitState.CLOSED);

      recordFailure(TEST_CIRCUIT, undefined, options);
      expect(getCircuitState(TEST_CIRCUIT).state).toBe(CircuitState.CLOSED);

      recordFailure(TEST_CIRCUIT, undefined, options);
      expect(getCircuitState(TEST_CIRCUIT).state).toBe(CircuitState.OPEN);
    });

    it("denies requests when circuit is OPEN", () => {
      const options = { failureThreshold: 2 };

      recordFailure(TEST_CIRCUIT, undefined, options);
      recordFailure(TEST_CIRCUIT, undefined, options);

      expect(getCircuitState(TEST_CIRCUIT).state).toBe(CircuitState.OPEN);
      expect(canRequest(TEST_CIRCUIT)).toBe(false);
    });
  });

  describe("success recording", () => {
    it("decrements failure count on success", () => {
      recordFailure(TEST_CIRCUIT);
      recordFailure(TEST_CIRCUIT);
      expect(getCircuitState(TEST_CIRCUIT).failures).toBe(2);

      recordSuccess(TEST_CIRCUIT);
      expect(getCircuitState(TEST_CIRCUIT).failures).toBe(1);
    });

    it("does not go below zero failures", () => {
      recordSuccess(TEST_CIRCUIT);
      expect(getCircuitState(TEST_CIRCUIT).failures).toBe(0);
    });
  });

  describe("HALF_OPEN state", () => {
    it("transitions to HALF_OPEN after timeout", () => {
      const options = { failureThreshold: 2, timeout: 30000 };

      recordFailure(TEST_CIRCUIT, undefined, options);
      recordFailure(TEST_CIRCUIT, undefined, options);
      expect(getCircuitState(TEST_CIRCUIT).state).toBe(CircuitState.OPEN);
      expect(canRequest(TEST_CIRCUIT, options)).toBe(false);

      // Advance time past timeout
      vi.advanceTimersByTime(31000);

      expect(canRequest(TEST_CIRCUIT, options)).toBe(true);
      expect(getCircuitState(TEST_CIRCUIT).state).toBe(CircuitState.HALF_OPEN);
    });

    it("closes circuit after success threshold in HALF_OPEN", () => {
      const options = { failureThreshold: 2, timeout: 30000, successThreshold: 2 };

      // Open the circuit
      recordFailure(TEST_CIRCUIT, undefined, options);
      recordFailure(TEST_CIRCUIT, undefined, options);

      // Wait for timeout
      vi.advanceTimersByTime(31000);
      canRequest(TEST_CIRCUIT, options); // This triggers transition to HALF_OPEN

      // Record successes
      recordSuccess(TEST_CIRCUIT, options);
      expect(getCircuitState(TEST_CIRCUIT).state).toBe(CircuitState.HALF_OPEN);

      recordSuccess(TEST_CIRCUIT, options);
      expect(getCircuitState(TEST_CIRCUIT).state).toBe(CircuitState.CLOSED);
    });

    it("re-opens circuit on failure in HALF_OPEN", () => {
      const options = { failureThreshold: 2, timeout: 30000 };

      // Open the circuit
      recordFailure(TEST_CIRCUIT, undefined, options);
      recordFailure(TEST_CIRCUIT, undefined, options);

      // Wait for timeout and transition to HALF_OPEN
      vi.advanceTimersByTime(31000);
      canRequest(TEST_CIRCUIT, options);
      expect(getCircuitState(TEST_CIRCUIT).state).toBe(CircuitState.HALF_OPEN);

      // Fail in HALF_OPEN - should immediately re-open
      recordFailure(TEST_CIRCUIT, undefined, options);
      expect(getCircuitState(TEST_CIRCUIT).state).toBe(CircuitState.OPEN);
    });
  });

  describe("monitoring window", () => {
    it("resets failures outside monitoring window", () => {
      const options = { monitorInterval: 60000 };

      recordFailure(TEST_CIRCUIT, undefined, options);
      recordFailure(TEST_CIRCUIT, undefined, options);
      expect(getCircuitState(TEST_CIRCUIT).failures).toBe(2);

      // Advance past monitoring window
      vi.advanceTimersByTime(61000);

      // This should reset failures
      canRequest(TEST_CIRCUIT, options);
      expect(getCircuitState(TEST_CIRCUIT).failures).toBe(0);
    });
  });

  describe("resetCircuit", () => {
    it("resets circuit to initial CLOSED state", () => {
      const options = { failureThreshold: 2 };

      recordFailure(TEST_CIRCUIT, undefined, options);
      recordFailure(TEST_CIRCUIT, undefined, options);
      expect(getCircuitState(TEST_CIRCUIT).state).toBe(CircuitState.OPEN);

      resetCircuit(TEST_CIRCUIT);

      const state = getCircuitState(TEST_CIRCUIT);
      expect(state.state).toBe(CircuitState.CLOSED);
      expect(state.failures).toBe(0);
      expect(state.successes).toBe(0);
    });
  });

  describe("withCircuitBreaker wrapper", () => {
    it("executes operation and records success", async () => {
      const operation = vi.fn().mockResolvedValue("result");

      const result = await withCircuitBreaker(TEST_CIRCUIT, operation);

      expect(result).toBe("result");
      expect(operation).toHaveBeenCalledTimes(1);
      expect(getCircuitState(TEST_CIRCUIT).lastSuccess).toBeTruthy();
    });

    it("records failure on operation error", async () => {
      const error = new Error("Test error");
      const operation = vi.fn().mockRejectedValue(error);

      await expect(withCircuitBreaker(TEST_CIRCUIT, operation)).rejects.toThrow("Test error");

      expect(getCircuitState(TEST_CIRCUIT).failures).toBe(1);
    });

    it("throws CircuitOpenError when circuit is open", async () => {
      const options = { failureThreshold: 2 };

      // Open the circuit
      recordFailure(TEST_CIRCUIT, undefined, options);
      recordFailure(TEST_CIRCUIT, undefined, options);

      const operation = vi.fn().mockResolvedValue("result");

      await expect(
        withCircuitBreaker(TEST_CIRCUIT, operation, options)
      ).rejects.toThrow(CircuitOpenError);

      expect(operation).not.toHaveBeenCalled();
    });
  });

  describe("CircuitOpenError", () => {
    it("includes circuit name and retry time in message", () => {
      const nextRetry = Date.now() + 30000;
      const error = new CircuitOpenError("test", nextRetry);

      expect(error.message).toContain("test");
      expect(error.message).toContain("is OPEN");
      expect(error.circuitName).toBe("test");
      expect(error.nextRetry).toBe(nextRetry);
    });
  });
});
