"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ConsentChoice = "all" | "essential";

const STORAGE_KEY = "sl-cookie-consent";

interface CookieConsentContextValue {
  /** null = no decision stored yet (or not read from localStorage yet) */
  consent: ConsentChoice | null;
  /** true once we've read localStorage on the client — gates the banner so it doesn't flash before we know */
  ready: boolean;
  setConsent: (choice: ConsentChoice) => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue>({
  consent: null,
  ready: false,
  setConsent: () => {},
});

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "all" || stored === "essential") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConsentState(stored);
    }
    setReady(true);
  }, []);

  const setConsent = (choice: ConsentChoice) => {
    localStorage.setItem(STORAGE_KEY, choice);
    setConsentState(choice);
  };

  return (
    <CookieConsentContext.Provider value={{ consent, ready, setConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
}
