// ────────────────────────────────────────────────────────────────────────────
// Sentry — Server-side / Edge error tracking
//
// Same setup as sentry.client.config.ts:
//   1. npm install @sentry/nextjs
//   2. Set SENTRY_DSN (server-side, no NEXT_PUBLIC_ prefix) in env vars
//   3. Uncomment the Sentry.init() call below
// ────────────────────────────────────────────────────────────────────────────

// import * as Sentry from '@sentry/nextjs';
//
// Sentry.init({
//   dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
//   environment: process.env.NODE_ENV,
//   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
// });

export {};
