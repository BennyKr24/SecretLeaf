// ────────────────────────────────────────────────────────────────────────────
// Sentry — Client-side error tracking
//
// Setup:
//   1. npm install @sentry/nextjs
//   2. Set NEXT_PUBLIC_SENTRY_DSN in .env.local / Vercel env vars
//   3. Uncomment the Sentry.init() call below
//
// Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
// ────────────────────────────────────────────────────────────────────────────

// import * as Sentry from '@sentry/nextjs';
//
// Sentry.init({
//   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//   environment: process.env.NODE_ENV,
//
//   // Adjust this value in production, or use tracesSampler for greater control
//   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
//
//   // Replay only on errors in production (privacy-friendly)
//   replaysOnErrorSampleRate: 1.0,
//   replaysSessionSampleRate: 0,
//
//   integrations: [
//     Sentry.replayIntegration({
//       maskAllText: true,
//       blockAllMedia: true,
//     }),
//   ],
// });

export {};
