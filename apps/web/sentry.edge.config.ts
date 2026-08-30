import * as Sentry from "@sentry/nextjs";

// Edge-runtime error monitoring for our own application. Same basis as the
// server config: our legitimate interest in a stable, secure service
// (Art. 6 Abs. 1 lit. f DSGVO), no visitor-device access.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
});

export {};
