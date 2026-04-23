"use client";

// ────────────────────────────────────────────────────────────────────────────
// useAuth — Central Auth State Hook
//
// Single source of truth for user identity in the UI.
// Reads from localStorage session (set by auth/page.tsx on login).
// Subscribes to Supabase auth events for real-time login/logout reflection.
// Components never read localStorage directly — they use this hook.
// ────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { getSession, clearSession } from "@/lib/auth";
import { logoutFromSupabase } from "@/lib/auth";
import type { SessionUser, UserPlan } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuthUser = SessionUser & {
  /** Resolved plan — always present, defaults to "free". */
  plan: UserPlan;
  /** First two characters of username, uppercased — for avatar initials. */
  initials: string;
};

export type AuthState = {
  /** The resolved user, or null when logged out. */
  user: AuthUser | null;
  /** true when a user session exists. */
  isLoggedIn: boolean;
  /** true during initial hydration from localStorage. */
  isLoading: boolean;
  /** Logs out the current user and clears all session state. */
  logout: () => Promise<void>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(username: string): string {
  const parts = username.trim().split(/[\s._-]/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

function toAuthUser(user: SessionUser): AuthUser {
  return {
    ...user,
    plan: user.plan ?? "free",
    initials: getInitials(user.username),
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Central auth state hook. Reads session on mount and keeps UI in sync
 * with login/logout events (via a storage event listener for cross-tab support).
 *
 * Usage:
 * ```tsx
 * const { user, isLoggedIn, logout } = useAuth();
 * ```
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(() => {
    const session = getSession();
    setUser(session ? toAuthUser(session.user) : null);
    setIsLoading(false);
  }, []);

  // Hydrate from localStorage on mount
  useEffect(() => {
    hydrate();

    // Keep in sync across tabs (e.g. login in another tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "secretleaf.session") {
        hydrate();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [hydrate]);

  const logout = useCallback(async () => {
    try {
      await logoutFromSupabase();
    } finally {
      clearSession();
      setUser(null);
    }
  }, []);

  return {
    user,
    isLoggedIn: user !== null,
    isLoading,
    logout,
  };
}
