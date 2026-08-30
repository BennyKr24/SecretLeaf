import * as Sentry from "@sentry/nextjs";
import { readStoredConsent } from "./src/lib/cookie-consent";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

/**
 * Boot the browser Sentry SDK. Idempotent.
 *
 * Called on module load *only* when the visitor has already consented to
 * analytics-scope tools ("Alle akzeptieren"), and again from the cookie-consent
 * provider the moment consent is granted mid-session. Browser error monitoring
 * and the on-error session replay both process personal data, so neither may
 * run before consent (Art. 6 Abs. 1 lit. a DSGVO, § 25 TDDDG). Withdrawal
 * triggers a reload (see CookieConsentProvider), which drops the SDK again.
 */
export function initSentry(): void {
  if (!dsn || Sentry.getClient()) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // Never attach IP / cookies / headers automatically.
    sendDefaultPii: false,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    // Session Replay: only on error, with maximum privacy — no rolling capture.
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}

if (readStoredConsent() === "all") {
  initSentry();
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
