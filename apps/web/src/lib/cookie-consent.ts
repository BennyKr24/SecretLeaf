// ────────────────────────────────────────────────────────────────────────────
// Cookie-consent storage — framework-agnostic core
//
// Single source of truth for how the visitor's analytics decision is read from
// and written to localStorage. Deliberately free of React so it can also be
// consulted from non-React entry points that run before the app mounts — most
// importantly the browser Sentry bootstrap in `sentry.client.config.ts`, which
// must not initialise without consent.
// ────────────────────────────────────────────────────────────────────────────

export type ConsentChoice = "all" | "essential";

/** localStorage key holding the JSON consent record. */
export const CONSENT_STORAGE_KEY = "sl-cookie-consent";

/**
 * sessionStorage flag: set right before a withdrawal reload so a GPC signal
 * doesn't immediately re-hide the banner the user just re-opened.
 */
export const CONSENT_REOPEN_KEY = "sl-cookie-reopen";

/**
 * Bump whenever the set of tools gated behind "Alle akzeptieren" changes.
 * A stored record with a different version counts as "no decision", so the
 * banner reappears and the visitor consents to the new scope.
 *
 *   v1 — Plausible + Vercel Analytics / Speed Insights
 *   v2 — + Sentry (browser error monitoring & on-error session replay)
 */
export const CONSENT_VERSION = 2;

/** Re-ask for consent after this long (12 months), matching common CMP practice. */
export const CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365;

export interface StoredConsent {
  choice: ConsentChoice;
  /** CONSENT_VERSION at the time the choice was made */
  v: number;
  /** epoch ms when the choice was made — accountability (Art. 7 GDPR) + expiry */
  ts: number;
}

/** Browser-level "do not sell/share" opt-out (Global Privacy Control). */
export function gpcEnabled(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
  );
}

/**
 * Reads + validates the stored record, tolerating the old bare-string format.
 * Returns null when there is no valid, current, unexpired decision. Safe to
 * call anywhere — returns null if `window` / localStorage is unavailable.
 */
export function readStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  // Legacy format (pre-versioning): the value was a bare "all" / "essential".
  // A bare "essential" is already the privacy-safe state — keep honoring it so
  // we don't re-nag someone who opted out. A bare "all" predates Sentry
  // entering the consent scope (CONSENT_VERSION 2), so it can't stand in for a
  // v2 decision — treat it as "no decision" and re-ask.
  if (raw === "essential") return "essential";
  if (raw === "all") return null;

  let parsed: StoredConsent;
  try {
    parsed = JSON.parse(raw) as StoredConsent;
  } catch {
    return null;
  }

  if (parsed.choice !== "all" && parsed.choice !== "essential") return null;
  if (parsed.v !== CONSENT_VERSION) return null;
  if (typeof parsed.ts !== "number" || Date.now() - parsed.ts > CONSENT_MAX_AGE_MS) return null;

  return parsed.choice;
}

/** Persists a fresh consent record stamped with the current version + time. */
export function writeStoredConsent(choice: ConsentChoice): void {
  const record: StoredConsent = { choice, v: CONSENT_VERSION, ts: Date.now() };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable (private mode / disabled) — banner will just re-ask */
  }
}

/** Removes the stored decision (withdrawal). */
export function clearStoredConsent(): void {
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
