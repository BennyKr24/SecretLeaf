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
import { getActiveGrow } from "@/lib/grow/store";
import type { Grow } from "@/lib/grow/types";

export function useActiveGrow(): Grow | null {
  const [activeGrow, setActiveGrowState] = useState<Grow | null>(null);

  const refresh = useCallback(() => {
    setActiveGrowState(getActiveGrow());
  }, []);

  // Initial client-only read.
  useEffect(() => {
    const t = setTimeout(refresh, 0);
    return () => clearTimeout(t);
  }, [refresh]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "secretleaf.grows.v1" || e.key === "secretleaf.active_grow_id.v1") {
        refresh();
      }
    };
    const handleChanged = () => refresh();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("secretleaf:activeGrowChanged", handleChanged);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("secretleaf:activeGrowChanged", handleChanged);
    };
  }, [refresh]);

  return activeGrow;
}
