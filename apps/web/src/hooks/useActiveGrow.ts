"use client";

// ────────────────────────────────────────────────────────────────────────────
// useActiveGrow — SSR-safe reactive read of the locally active grow.
//
// Starts null (matching the server, which has no localStorage) and resolves
// the real value after mount, then stays in sync with same-tab grow changes
// (create/delete/switch, via "secretleaf:activeGrowChanged") and cross-tab
// changes (via the native "storage" event). Mirrors useAuth's pattern —
// see that hook for why the initializer must not read localStorage directly.
// ────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { getActiveGrow, getGrows } from "@/lib/grow/store";
import type { Grow } from "@/lib/grow/types";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "@/i18n/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { restoreGrowsFromSupabase } from "@/lib/grow/restore";

export function useActiveGrow(): Grow | null {
  const { user } = useAuth();
  const pathname = usePathname();
  const [activeGrow, setActiveGrowState] = useState<Grow | null>(null);

  const refresh = useCallback(() => {
    setActiveGrowState(getActiveGrow());
  }, []);

  // Initial client-only read.
  useEffect(() => {
    const t = setTimeout(refresh, 0);
    return () => clearTimeout(t);
  }, [refresh]);

  // Re-sync on every route change, as defense in depth alongside the
  // flushSync'd event listener below.
  useEffect(() => {
    const t = setTimeout(refresh, 0);
    return () => clearTimeout(t);
  }, [pathname, refresh]);

  // Logged-in users on a fresh device/browser have no local grows yet —
  // restore from Supabase (shared with useGrowState) so the nav bar doesn't
  // show "no active grow" until the user happens to visit a grow page first.
  useEffect(() => {
    if (!user) return;
    if (getGrows().length > 0) return;
    const supabase = getSupabaseBrowserClient();
    restoreGrowsFromSupabase(supabase)
      .then(() => refresh())
      .catch((err) => {
        console.error("[useActiveGrow] Supabase restore failed:", err);
      });
  }, [user, refresh]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "secretleaf.grows.v1" || e.key === "secretleaf.active_grow_id.v1") {
        refresh();
      }
    };
    // flushSync so the state commits synchronously, before the caller (e.g.
    // GrowSetupWizard's `await createGrow(); router.push(...)`) can move on
    // to a navigation that would otherwise race the update — see
    // notifyActiveGrowChanged() in lib/grow/store.ts for the dispatch side.
    const handleChanged = () => flushSync(() => refresh());
    window.addEventListener("storage", handleStorage);
    window.addEventListener("secretleaf:activeGrowChanged", handleChanged);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("secretleaf:activeGrowChanged", handleChanged);
    };
  }, [refresh]);

  return activeGrow;
}
