import * as Sentry from "@sentry/nextjs";

// Server-side error monitoring for our own application. No access to the
// visitor's device and no client identifiers — runs on our legitimate
// interest in a stable, secure service (Art. 6 Abs. 1 lit. f DSGVO).
Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
});

export {};
