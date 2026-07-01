// ────────────────────────────────────────────────────────────────────────────
// Next.js Instrumentation — Sentry initialization hook
//
// This file is the standard Next.js 15+ way to initialize Sentry.
// It runs once on server startup and in edge runtimes.
//
// Setup:
//   1. npm install @sentry/nextjs
//   2. Set env vars (NEXT_PUBLIC_SENTRY_DSN, SENTRY_DSN)
//   3. Uncomment the import below
// ────────────────────────────────────────────────────────────────────────────

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
