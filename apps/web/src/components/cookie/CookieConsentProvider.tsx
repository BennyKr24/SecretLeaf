"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  CONSENT_REOPEN_KEY,
  clearStoredConsent,
  gpcEnabled,
  readStoredConsent,
  writeStoredConsent,
  type ConsentChoice,
} from "@/lib/cookie-consent";
import { initClientSentry } from "@/lib/analytics-runtime";

export type { ConsentChoice };

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

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredConsent();
    const reopening = sessionStorage.getItem(CONSENT_REOPEN_KEY) === "1";
    sessionStorage.removeItem(CONSENT_REOPEN_KEY);

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
    writeStoredConsent(choice);
    setConsentState(choice);
    // Boot the consent-gated Sentry SDK right away so error diagnostics work
    // this session too — <Script>-based tools (Plausible / Vercel) mount on the
    // re-render, Sentry needs an explicit kick.
    if (choice === "all") void initClientSentry();
  };

  const resetConsent = () => {
    const hadAnalytics = consent === "all";
    clearStoredConsent();
    setConsentState(null);
    if (hadAnalytics) {
      // A plain re-render can't unload Plausible / Vercel / Sentry code that
      // already ran, so reload into the pre-consent state. Flag the reload so
      // the GPC check above doesn't instantly re-hide the banner.
      if (gpcEnabled()) sessionStorage.setItem(CONSENT_REOPEN_KEY, "1");
      window.location.reload();
    }
  };

  return (
    <CookieConsentContext.Provider value={{ consent, ready, setConsent, resetConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
}
