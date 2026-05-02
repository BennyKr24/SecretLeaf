'use client';

// ────────────────────────────────────────────────────────────────────────────
// Error Tracking — Sentry wrapper
//
// Gracefully no-ops when Sentry package is not installed.
// Once `@sentry/nextjs` is installed, import Sentry here and route calls to it.
//
// Usage:
//   reportError(error, { context: 'grow_page', growId: id })
// ────────────────────────────────────────────────────────────────────────────

type ErrorContext = Record<string, string | number | boolean | undefined>;

export function reportError(error: unknown, context?: ErrorContext): void {
  // Log to console in all environments for debugging
  console.error('[SecretLeaf Error]', error, context);

  // Once @sentry/nextjs is installed, replace with:
  // import * as Sentry from '@sentry/nextjs';
  // Sentry.withScope((scope) => {
  //   if (context) scope.setExtras(context);
  //   Sentry.captureException(error);
  // });
}
