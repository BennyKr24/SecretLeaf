"use client";

// ────────────────────────────────────────────────────────────────────────────
// useAssistantPreference — global on/off switch for proactive insight panels
// (e.g. SmartInsights "Nächste Schritte"). Persisted in localStorage so
// experienced users can permanently hide the nudges without losing the
// underlying analysis functions, which stay available on-demand elsewhere.
//
// Starts `true` on both server and first client render to avoid the
// SSR/client hydration mismatch that hit useAuth/useActiveGrow before —
// the real stored value is synced in after mount.
// ────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "secretleaf.assistantPanelEnabled";
const EVENT_NAME = "secretleaf:assistantPreferenceChanged";

function readPreference(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return true;
  return raw === "true";
}

export function useAssistantPreference(): {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
} {
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    setEnabledState(readPreference());
    const onChange = () => setEnabledState(readPreference());
    window.addEventListener(EVENT_NAME, onChange);
    return () => window.removeEventListener(EVENT_NAME, onChange);
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value));
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return { enabled, setEnabled };
}
