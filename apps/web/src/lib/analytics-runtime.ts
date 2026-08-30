"use client";

// ────────────────────────────────────────────────────────────────────────────
// Analytics runtime seam
//
// Lets the cookie-consent provider boot consent-gated, non-<Script> tooling
// (currently: the browser Sentry SDK) the moment the visitor opts in, without
// waiting for a page reload. Keeps the one awkward "reach a repo-root config
// file from inside src/" import in a single place.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Boot the browser Sentry SDK after the visitor has consented to
 * analytics-scope tools ("Alle akzeptieren"). Idempotent — safe to call on
 * every "all" transition; the underlying init no-ops once a client exists.
 */
export async function initClientSentry(): Promise<void> {
  try {
    const mod = await import("../../sentry.client.config");
    mod.initSentry();
  } catch {
    /* Sentry not configured (no DSN) or bundle unavailable — nothing to do */
  }
}
