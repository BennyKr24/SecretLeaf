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
import { generateId, isUuid } from "@/lib/grow/utils";

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

// ── Legacy ID remapping ───────────────────────────────────────────────────────

/**
 * Early builds generated short non-UUID ids (e.g. "lop2k3f-ab12xy"), which the
 * Supabase `uuid` columns reject. Before uploading we rewrite any legacy id to a
 * fresh UUID while preserving grow → plant → log-entry relationships, and we
 * persist the remapped data back to localStorage so the local cache stays
 * consistent with the cloud.
 *
 * Idempotent: data that already uses UUIDs is returned unchanged.
 */
function remapLegacyIds(grows: Grow[], entries: LogEntry[]): { grows: Grow[]; entries: LogEntry[] } {
  const growIdMap = new Map<string, string>();
  const plantIdMap = new Map<string, string>();
  let changed = false;

  const remappedGrows: Grow[] = grows.map((grow) => {
    const newGrowId = isUuid(grow.id) ? grow.id : generateId();
    if (newGrowId !== grow.id) changed = true;
    growIdMap.set(grow.id, newGrowId);

    const plants = grow.plants.map((plant) => {
      const newPlantId = isUuid(plant.id) ? plant.id : generateId();
      if (newPlantId !== plant.id) changed = true;
      plantIdMap.set(plant.id, newPlantId);
      return { ...plant, id: newPlantId };
    });

    return { ...grow, id: newGrowId, plants };
  });

  const remappedEntries: LogEntry[] = entries.map((entry) => {
    const newEntryId = isUuid(entry.id) ? entry.id : generateId();
    if (newEntryId !== entry.id) changed = true;
    const newGrowId = growIdMap.get(entry.growId) ?? entry.growId;
    const newPlantId =
      entry.plantId != null ? plantIdMap.get(entry.plantId) ?? entry.plantId : entry.plantId;
    return { ...entry, id: newEntryId, growId: newGrowId, ...(newPlantId != null && { plantId: newPlantId }) };
  });

  if (changed) {
    // Persist remapped data so the local cache matches what we upload.
    storage.set(STORAGE_KEYS.GROWS, remappedGrows);
    storage.set(STORAGE_KEYS.LOG_ENTRIES, remappedEntries);
    const activeId = storage.get<string>(STORAGE_KEYS.ACTIVE_GROW_ID);
    if (activeId != null) {
      const mapped = growIdMap.get(activeId);
      if (mapped != null && mapped !== activeId) {
        storage.set(STORAGE_KEYS.ACTIVE_GROW_ID, mapped);
      }
    }
  }

  return { grows: remappedGrows, entries: remappedEntries };
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
  const localGrows = storage.get<Grow[]>(STORAGE_KEYS.GROWS) ?? [];
  const localEntries = storage.get<LogEntry[]>(STORAGE_KEYS.LOG_ENTRIES) ?? [];

  if (localGrows.length === 0) {
    localStorage.setItem(MIGRATION_FLAG, userId);
    return;
  }

  // Rewrite any legacy non-UUID ids before upload (and update the local cache).
  const { grows, entries } = remapLegacyIds(localGrows, localEntries);

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
    // Skip entries whose grow_id isn't in this batch's upserted grows (e.g.
    // orphaned local data from a deleted/already-migrated grow) instead of
    // letting one bad row's FK violation abort the entire chunk.
    const growIds = new Set(grows.map((g) => g.id));
    const validEntries = entries.filter((e) => growIds.has(e.growId));
    const orphanedEntries = entries.filter((e) => !growIds.has(e.growId));
    if (orphanedEntries.length > 0) {
      console.warn(
        `[migration] skipping ${orphanedEntries.length} log entr${orphanedEntries.length === 1 ? "y" : "ies"} with a grow_id not present in this upload batch:`,
        orphanedEntries.map((e) => ({ id: e.id, growId: e.growId })),
      );
    }

    const entryRows = validEntries.map((e) => ({
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
