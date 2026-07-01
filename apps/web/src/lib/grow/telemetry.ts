// ────────────────────────────────────────────────────────────────────────────
// Grow Telemetry — structured error reporting to Sentry
//
// Central helper for all Supabase write failures in the Grow OS.
// Adds structured context (operation, userId, growId, supabase error code)
// so errors in Sentry are immediately actionable.
//
// Usage:
//   } catch (err) {
//     captureGrowError("createGrow", { userId, growId: grow.id }, err);
//     // ... rollback
//   }
// ────────────────────────────────────────────────────────────────────────────

import * as Sentry from "@sentry/nextjs";

export type GrowErrorContext = {
  /** Supabase auth user ID */
  userId?: string;
  /** Grow UUID (when available) */
  growId?: string | undefined;
  /** Log Entry UUID (when available) */
  entryId?: string | undefined;
  /** Any additional key-value pairs for debugging */
  [key: string]: unknown;
};

/**
 * Captures a Grow OS error to Sentry with structured context.
 * Always re-throws — the caller is responsible for rollback/fallback.
 *
 * @param operation  Short identifier, e.g. "createGrow", "addLogEntry"
 * @param context    Structured context for Sentry: userId, growId, etc.
 * @param error      The caught error
 */
export function captureGrowError(
  operation: string,
  context: GrowErrorContext,
  error: unknown,
): void {
  // Extract Supabase-specific fields if available
  const supabaseCode =
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
      ? (error as { code: string }).code
      : undefined;

  const supabaseMessage =
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
      ? (error as { message: string }).message
      : undefined;

  Sentry.withScope((scope) => {
    // Tag for fast filtering in Sentry dashboard
    scope.setTag("grow.operation", operation);
    if (supabaseCode) scope.setTag("supabase.error_code", supabaseCode);

    // Identify the user in Sentry (no PII beyond the UUID)
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }

    // Structured extra context for the Sentry issue detail view
    scope.setExtras({
      operation,
      growId: context.growId ?? null,
      entryId: context.entryId ?? null,
      supabaseCode: supabaseCode ?? null,
      supabaseMessage: supabaseMessage ?? null,
      ...context,
    });

    Sentry.captureException(error);
  });
}
