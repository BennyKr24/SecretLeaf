// ────────────────────────────────────────────────────────────────────────────
// Grow OS — localStorage → Supabase one-time migration
//
// Runs once per user after login.
// Uses upsert throughout — safe to retry, no duplicates on repeated runs.
// Never modifies or deletes localStorage data.
// ────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import { storage, STORAGE_KEYS } from "@/lib/store";
import type { Grow, LogEntry } from "@/lib/grow/types";

const MIGRATION_FLAG = "secretleaf.migrated.v1";
const CHUNK_SIZE = 200;

// ── needsMigration ────────────────────────────────────────────────────────────

/**
 * Returns true when there is local grow data that has not yet been
 * uploaded for the given user.
 */
export function needsMigration(userId: string): boolean {
  if (typeof window === "undefined") return false;
  const grows = storage.get<Grow[]>(STORAGE_KEYS.GROWS) ?? [];
  if (grows.length === 0) return false;
  return localStorage.getItem(MIGRATION_FLAG) !== userId;
}

// ── runMigration ──────────────────────────────────────────────────────────────

/**
 * Uploads all localStorage grows, plants, and log entries to Supabase.
 * Idempotent — safe to call multiple times.
 * Sets a flag on completion to prevent re-runs for the same user.
 *
 * Call fire-and-forget (do NOT await in the render path).
 */
export async function runMigration(
  userId: string,
  supabase: SupabaseClient,
): Promise<void> {
  const grows = storage.get<Grow[]>(STORAGE_KEYS.GROWS) ?? [];
  const entries = storage.get<LogEntry[]>(STORAGE_KEYS.LOG_ENTRIES) ?? [];

  if (grows.length === 0) {
    localStorage.setItem(MIGRATION_FLAG, userId);
    return;
  }

  // ── 1. Upsert grows ─────────────────────────────────────────────────────────
  const growRows = grows.map((g) => ({
    id: g.id,
    user_id: userId,
    name: g.name,
    umgebung: g.umgebung,
    medium: g.medium,
    licht_typ: g.lichtTyp,
    licht_leistung: g.lichtLeistung ?? null,
    erfahrung: g.erfahrung,
    pflanzen_anzahl: g.pflanzenAnzahl,
    flaeche: g.flaeche ?? null,
    start_date: g.startDate,
    current_phase_id: g.currentPhaseId,
    status: g.status,
    notes: g.notes ?? null,
    plan: g.plan,
    harvest: g.harvest ?? null,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  }));

  const { error: growsError } = await supabase
    .from("grows")
    .upsert(growRows, { onConflict: "id" });

  if (growsError) {
    console.error("[migration] grows upsert failed:", growsError.message);
    return; // abort — retry on next login
  }

  // ── 2. Upsert plants ─────────────────────────────────────────────────────────
  const plantRows = grows.flatMap((g) =>
    g.plants.map((p) => ({
      id: p.id,
      grow_id: g.id,
      user_id: userId,
      name: p.name,
      notes: p.notes ?? null,
      created_at: p.createdAt,
    })),
  );

  if (plantRows.length > 0) {
    const { error: plantsError } = await supabase
      .from("plants")
      .upsert(plantRows, { onConflict: "id" });

    if (plantsError) {
      console.error("[migration] plants upsert failed:", plantsError.message);
      return; // abort — retry on next login
    }
  }

  // ── 3. Upsert log entries (chunked) ──────────────────────────────────────────
  if (entries.length > 0) {
    const entryRows = entries.map((e) => ({
      id: e.id,
      grow_id: e.growId,
      user_id: userId,
      plant_id: e.plantId ?? null,
      entry_type: e.data.type,
      data: e.data,
      notes: e.notes ?? null,
      logged_at: e.date,
      created_at: e.date,
    }));

    for (let i = 0; i < entryRows.length; i += CHUNK_SIZE) {
      const chunk = entryRows.slice(i, i + CHUNK_SIZE);
      const { error: entriesError } = await supabase
        .from("log_entries")
        .upsert(chunk, { onConflict: "id" });

      if (entriesError) {
        console.error("[migration] log_entries upsert failed (chunk):", entriesError.message);
        return; // abort — retry on next login, upserted chunks are safe to re-send
      }
    }
  }

  // ── 4. Mark complete ──────────────────────────────────────────────────────────
  localStorage.setItem(MIGRATION_FLAG, userId);
  console.info("[migration] localStorage → Supabase complete");
}
