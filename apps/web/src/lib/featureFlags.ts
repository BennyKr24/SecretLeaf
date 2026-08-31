// ────────────────────────────────────────────────────────────────────────────
// Feature flags — runtime on/off switches (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §5)
//
// Server-side only. `isFeatureEnabled(key)` reads the `feature_flags` table
// with a short in-process cache; a missing row (or an unreachable DB) falls
// back to the code default below, so a flag check never breaks a request.
// Toggled from the Steuerung admin page.
// ────────────────────────────────────────────────────────────────────────────

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { logError } from "@/lib/log";

export const FEATURE_FLAGS_TABLE = "feature_flags";

export type FeatureFlagKey =
  | "ai_assistant"
  | "newsletter"
  | "translate_button"
  | "fertilizer_catalog"
  | "maintenance_mode";

export const FEATURE_FLAG_DEFAULTS: Record<
  FeatureFlagKey,
  { enabled: boolean; description: string }
> = {
  ai_assistant: { enabled: true, description: "Admin-KI-Assistent (billed Claude calls) freigeschaltet" },
  newsletter: { enabled: true, description: "Newsletter-Anmeldung (Loops) aktiv" },
  translate_button: { enabled: true, description: "Übersetzen-Button auf Inhalten sichtbar" },
  fertilizer_catalog: { enabled: false, description: "Dünger-Katalog öffentlich (aktuell offline)" },
  maintenance_mode: { enabled: false, description: "Wartungsmodus — App für Nicht-Admins gesperrt (noch nicht verdrahtet)" },
};

export type FeatureFlag = {
  key: string;
  enabled: boolean;
  description: string;
  updatedAt: string | null;
  /** true when the value is the code default (no DB row) */
  isDefault: boolean;
};

const CACHE_TTL_MS = 30_000;
let cache: { at: number; rows: Map<string, { enabled: boolean; description: string | null; updatedAt: string }> } | null =
  null;

async function loadFlags() {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.rows;
  const rows = new Map<string, { enabled: boolean; description: string | null; updatedAt: string }>();
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from(FEATURE_FLAGS_TABLE)
      .select("key, enabled, description, updated_at");
    if (error) {
      logError("featureFlags.load_failed", { error: error.message });
    } else {
      for (const r of (data ?? []) as Array<{ key: string; enabled: boolean; description: string | null; updated_at: string }>) {
        rows.set(r.key, { enabled: r.enabled, description: r.description, updatedAt: r.updated_at });
      }
    }
  } catch (err) {
    logError("featureFlags.load_threw", { error: err instanceof Error ? err.message : String(err) });
  }
  cache = { at: Date.now(), rows };
  return rows;
}

/** Invalidate the cache after a toggle so the change is visible immediately. */
export function resetFeatureFlagCache() {
  cache = null;
}

export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  const rows = await loadFlags();
  const row = rows.get(key);
  if (row) return row.enabled;
  return FEATURE_FLAG_DEFAULTS[key]?.enabled ?? false;
}

/** Full list for the admin UI — DB rows merged over the code defaults. */
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  const rows = await loadFlags();
  const keys = new Set<string>([...Object.keys(FEATURE_FLAG_DEFAULTS), ...rows.keys()]);
  return [...keys].sort().map((key) => {
    const row = rows.get(key);
    const def = FEATURE_FLAG_DEFAULTS[key as FeatureFlagKey];
    return {
      key,
      enabled: row ? row.enabled : (def?.enabled ?? false),
      description: row?.description ?? def?.description ?? "",
      updatedAt: row?.updatedAt ?? null,
      isDefault: !row,
    };
  });
}
