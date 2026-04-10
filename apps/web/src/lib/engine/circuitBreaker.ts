// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Circuit Breaker
// ──────────────────────────────────────────────────────────────────────────────
//
// Protects external API calls (Crossref etc.) from cascading failures.
//
// States:
//   CLOSED   → normal operation, requests pass through
//   OPEN     → all requests fail-fast (skip external call)
//   HALF-OPEN → one probe request allowed; success → CLOSED, failure → OPEN
//
// Transition rules:
//   CLOSED: after `failureThreshold` consecutive failures → OPEN
//   OPEN:   after `resetTimeoutMs` elapsed → HALF-OPEN
//   HALF-OPEN: success → CLOSED, failure → OPEN (reset timer)
//
// State is held in-memory (per serverless invocation). For cross-invocation
// persistence, use the optional Supabase integration.
// ──────────────────────────────────────────────────────────────────────────────

import type { CircuitState } from "./types";

export type CircuitBreakerOptions = {
  /** Name for logging / identification. */
  name: string;
  /** Consecutive failures before opening the circuit. Default: 5. */
  failureThreshold?: number;
  /** Time in ms to wait before probing again. Default: 60_000 (1 min). */
  resetTimeoutMs?: number;
};

export class CircuitBreaker {
  readonly name: string;

  private state: CircuitState = "closed";
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(options: CircuitBreakerOptions) {
    this.name = options.name;
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 60_000;
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Execute a function through the circuit breaker.
   * Throws `CircuitOpenError` if the circuit is open and the timeout hasn't elapsed.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (this.shouldProbe()) {
        this.state = "half-open";
      } else {
        throw new CircuitOpenError(this.name, this.timeUntilProbe());
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Check if the circuit allows requests.
   * Use this for non-throwing "should I even try?" checks.
   */
  isAvailable(): boolean {
    if (this.state === "closed") return true;
    if (this.state === "half-open") return true;
    return this.shouldProbe();
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  /** Force circuit reset (e.g., after manual fix). */
  reset(): void {
    this.state = "closed";
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  getSnapshot(): {
    name: string;
    state: CircuitState;
    failureCount: number;
    lastFailureTime: number;
    timeUntilProbeMs: number;
  } {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      timeUntilProbeMs: this.state === "open" ? this.timeUntilProbe() : 0,
    };
  }

  // ── Internal ────────────────────────────────────────────────────────────

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = "closed";
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "open";
    }
  }

  private shouldProbe(): boolean {
    return Date.now() - this.lastFailureTime >= this.resetTimeoutMs;
  }

  private timeUntilProbe(): number {
    const elapsed = Date.now() - this.lastFailureTime;
    return Math.max(0, this.resetTimeoutMs - elapsed);
  }
}

// ── Error ───────────────────────────────────────────────────────────────────

export class CircuitOpenError extends Error {
  constructor(
    public readonly circuitName: string,
    public readonly retryAfterMs: number,
  ) {
    super(
      `Circuit breaker "${circuitName}" is open. Retry in ${Math.round(retryAfterMs / 1000)}s.`,
    );
    this.name = "CircuitOpenError";
  }
}

// ── Singleton Registry ──────────────────────────────────────────────────────

/**
 * Global circuit breaker registry.
 * Use this to share breakers across modules within the same server invocation.
 */
const registry = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(options: CircuitBreakerOptions): CircuitBreaker {
  const existing = registry.get(options.name);
  if (existing) return existing;

  const breaker = new CircuitBreaker(options);
  registry.set(options.name, breaker);
  return breaker;
}

export function getAllCircuitBreakers(): Map<string, CircuitBreaker> {
  return registry;
}
