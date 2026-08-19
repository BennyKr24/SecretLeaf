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
import { getSession, clearSession, restoreSessionFromSupabase } from "@/lib/auth";
import { logoutFromSupabase } from "@/lib/auth";
import type { SessionUser, UserPlan } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { needsMigration, runMigration } from "@/lib/grow/migration";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuthUser = SessionUser & {
  /** Resolved plan — always present, defaults to "free". */
  plan: UserPlan;
  /**
   * True for pro/team plans or TEAM role — the single source of truth for
   * Pro-gated UI. Compute it once here rather than re-deriving
   * `plan === "pro" || ...` ad hoc at each call site (that drifted once
   * already: the grow page checked `role === "TEAM"` too, the pricing page
   * didn't, so a TEAM-role user saw the free upsell on /pricing).
   */
  isPro: boolean;
  /** Display name from profile, or username fallback. */
  displayName: string;
  /** First two characters of displayName, uppercased — for avatar initials. */
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

function getInitials(name: string): string {
  const parts = name.trim().split(/[\s._-]/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/** Read display name from localStorage profile, or null if not set. */
function readProfileName(userId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`secretleaf.profile.${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: string };
    return parsed.name ?? null;
  } catch {
    return null;
  }
}

function toAuthUser(user: SessionUser): AuthUser {
  const displayName = readProfileName(user.id) ?? user.username;
  const plan = user.plan ?? "free";
  return {
    ...user,
    plan,
    isPro: plan === "pro" || plan === "team" || user.role === "TEAM",
    displayName,
    initials: getInitials(displayName),
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
  // Start as logged-out/loading unconditionally — matches what the server
  // renders (no access to localStorage there). Reading the real session in
  // the useState initializer instead would make the client's first render
  // diverge from the SSR output (localStorage IS available synchronously on
  // the client, even before hydration commits), which is exactly what
  // caused the "Anmelden" vs "Dashboard" hydration-mismatch warning. The
  // real session is only read after mount, in the effect below.
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(() => {
    const session = getSession();
    setUser(session ? toAuthUser(session.user) : null);
    setIsLoading(false);
  }, []);

  // Initial client-only read of the real session.
  useEffect(() => {
    const t = setTimeout(hydrate, 0);
    return () => clearTimeout(t);
  }, [hydrate]);

  // Keep auth state in sync across tabs and profile updates
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "secretleaf.session") {
        hydrate();
      }
    };
    // Re-hydrate when profile name changes (same tab, via useProfile)
    const handleProfileUpdate = () => hydrate();
    // Re-hydrate on same-tab login/logout (saveSession/clearSession) — the
    // native "storage" event above only fires in *other* tabs, so without
    // this, a NavigationBar mounted before login stays stuck showing
    // logged-out state after a same-tab login until a full page reload.
    const handleAuthChanged = () => hydrate();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("secretleaf:profileUpdated", handleProfileUpdate);
    window.addEventListener("secretleaf:authChanged", handleAuthChanged);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("secretleaf:profileUpdated", handleProfileUpdate);
      window.removeEventListener("secretleaf:authChanged", handleAuthChanged);
    };
  }, [hydrate]);

  // Validate the cached session against the LIVE Supabase session.
  //
  // The cached `secretleaf.session` token can outlive the actual Supabase auth
  // session (e.g. after the access token expires and refresh fails). If we kept
  // trusting it, the "authenticated" data path would run without a JWT and every
  // RLS-protected write would be rejected (Postgres 42501) — silently losing the
  // user's grows. Reconciling here guarantees `user` reflects a real Supabase
  // session, and the `onAuthStateChange` subscription keeps it correct at runtime.
  useEffect(() => {
    let active = true;

    const reconcile = () =>
      restoreSessionFromSupabase()
        .then((session) => {
          if (!active) return;
          setUser(session ? toAuthUser(session.user) : null);
        })
        .catch(() => {
          // Network/API hiccup: leave the optimistic cached user in place rather
          // than logging the user out on a transient failure.
        });

    void reconcile();

    const supabase = getSupabaseBrowserClient();
    const { data: authSub } = supabase.auth.onAuthStateChange((event, sbSession) => {
      if (!active) return;
      if (event === "SIGNED_OUT" || !sbSession) {
        clearSession();
        setUser(null);
      } else {
        // SIGNED_IN / TOKEN_REFRESHED / USER_UPDATED: re-derive from the live
        // Supabase session (which also rewrites the cached custom session).
        void reconcile();
      }
    });

    return () => {
      active = false;
      authSub.subscription.unsubscribe();
    };
  }, []);

  // Trigger one-time localStorage → Supabase migration when user logs in
  useEffect(() => {
    const session = getSession();
    if (!session) return;
    const userId = session.user.id;
    if (!needsMigration(userId)) return;
    const supabase = getSupabaseBrowserClient();
    // fire-and-forget — must not block rendering or auth state
    void runMigration(userId, supabase);
  }, [user?.id]);

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
