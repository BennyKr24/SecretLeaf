// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Retry with Exponential Backoff
// ──────────────────────────────────────────────────────────────────────────────

export type RetryOptions = {
  /** Maximum number of attempts (including the first). */
  maxAttempts: number;
  /** Base delay in milliseconds (doubled each retry). */
  baseDelayMs?: number;
  /** Maximum delay cap in milliseconds. */
  maxDelayMs?: number;
  /** Optional label for logging. */
  label?: string;
  /** Called on each retry before waiting. */
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
};

const DEFAULT_BASE_DELAY = 1_000;
const DEFAULT_MAX_DELAY = 30_000;

/**
 * Executes `fn` with retry and exponential backoff.
 * Jitter is added to avoid thundering-herd on parallel retries.
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions,
): Promise<{ result: T; attempts: number }> {
  const maxAttempts = Math.max(1, Math.min(options.maxAttempts, 10));
  const baseDelay = options.baseDelayMs ?? DEFAULT_BASE_DELAY;
  const maxDelay = options.maxDelayMs ?? DEFAULT_MAX_DELAY;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn(attempt);
      return { result, attempts: attempt };
    } catch (error) {
      lastError = error;

      if (attempt >= maxAttempts) break;

      // Exponential backoff with jitter: delay = base * 2^(attempt-1) * (0.5..1.5)
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = 0.5 + Math.random();
      const delay = Math.min(Math.round(exponentialDelay * jitter), maxDelay);

      options.onRetry?.(attempt, error, delay);

      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
