"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ConsentChoice = "all" | "essential";

const STORAGE_KEY = "sl-cookie-consent";

/** Set right before a withdrawal reload so GPC doesn't immediately re-hide the banner. */
const REOPEN_KEY = "sl-cookie-reopen";

/**
 * Bump when the set of tools gated behind "all" changes (e.g. a new tracker is
 * added). A stored record with a lower version is treated as no decision, so
 * the banner reappears and the user consents to the new scope.
 */
const CONSENT_VERSION = 1;

/** Re-ask for consent after this long (12 months), matching common CMP practice. */
const CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365;

interface StoredConsent {
  choice: ConsentChoice;
  /** CONSENT_VERSION at the time the choice was made */
  v: number;
  /** epoch ms when the choice was made — accountability + expiry */
  ts: number;
}

interface CookieConsentContextValue {
  /** null = no valid decision stored (never chosen, or expired / outdated) */
  consent: ConsentChoice | null;
  /** true once we've read localStorage on the client — gates the banner so it doesn't flash before we know */
  ready: boolean;
  setConsent: (choice: ConsentChoice) => void;
  /** Withdraw the stored decision and reload so already-loaded scripts are dropped. */
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue>({
  consent: null,
  ready: false,
  setConsent: () => {},
  resetConsent: () => {},
});

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}

/** Browser-level "do not sell/share" opt-out (Global Privacy Control). */
function gpcEnabled(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
  );
}

/** Reads + validates the stored record, tolerating the old bare-string format. */
function readStoredConsent(): ConsentChoice | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  // Legacy format: the value was just "all" / "essential" with no metadata.
  if (raw === "all" || raw === "essential") return raw;

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

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredConsent();
    const reopening = sessionStorage.getItem(REOPEN_KEY) === "1";
    sessionStorage.removeItem(REOPEN_KEY);

    let resolved = stored;
    // No explicit choice yet, but the browser sends GPC: honor that opt-out
    // silently instead of showing a banner the user has effectively pre-answered.
    // `reopening` means they just clicked "Cookie-Einstellungen" — show it anyway.
    if (!resolved && !reopening && gpcEnabled()) {
      resolved = "essential";
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsentState(resolved);
    setReady(true);
  }, []);

  const setConsent = (choice: ConsentChoice) => {
    const record: StoredConsent = { choice, v: CONSENT_VERSION, ts: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    setConsentState(choice);
  };

  const resetConsent = () => {
    const hadAnalytics = consent === "all";
    localStorage.removeItem(STORAGE_KEY);
    setConsentState(null);
    if (hadAnalytics) {
      // A plain re-render can't unload Plausible / Vercel scripts that already
      // ran, so reload into the pre-consent state. Flag the reload so the GPC
      // check above doesn't instantly re-hide the banner.
      if (gpcEnabled()) sessionStorage.setItem(REOPEN_KEY, "1");
      window.location.reload();
    }
  };

  return (
    <CookieConsentContext.Provider value={{ consent, ready, setConsent, resetConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
}
