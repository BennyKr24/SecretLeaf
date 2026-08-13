// ────────────────────────────────────────────────────────────────────────────
// Grow OS — Supabase → localStorage restore
//
// Shared by useGrowState (grow pages) and useActiveGrow (NavigationBar) so
// a returning user on a new device sees their grows regardless of which
// hook mounts first. Idempotent — concurrent callers on the same page share
// one in-flight fetch instead of double-hitting Supabase.
// ────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Grow } from "@/lib/grow/types";
import { getGrows as dbGetGrows } from "@/lib/grow/db";
import { rowToGrow } from "@/lib/grow/rowToGrow";
import { storage, STORAGE_KEYS } from "@/lib/store";
import { getActiveGrowId, setActiveGrow } from "@/lib/grow/store";

let inFlight: Promise<Grow[]> | null = null;

/**
 * Fetches all grows for the authenticated user from Supabase and caches
 * them to localStorage. If no active grow is set locally yet (fresh
 * device), defaults to the most recently created grow.
 */
export async function restoreGrowsFromSupabase(supabase: SupabaseClient): Promise<Grow[]> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const rows = await dbGetGrows(supabase);
    const grows = rows.map(rowToGrow);
    storage.set(STORAGE_KEYS.GROWS, grows);

    if (grows.length === 0) {
      storage.remove(STORAGE_KEYS.ACTIVE_GROW_ID);
    } else if (!getActiveGrowId()) {
      const first = grows[0];
      if (first) setActiveGrow(first.id);
    }

    return grows;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}
