// ────────────────────────────────────────────────────────────────────────────
// Grow DB — Supabase data layer
//
// Parallel cloud path. Does NOT replace localStorage or existing hooks.
// Only call these functions when a user session is available.
// ────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Grow, LogEntry, LogEntryData, Plant } from "@/lib/grow/types";

// ── Row type returned from Supabase ──────────────────────────────────────────

export type GrowRow = {
  id: string;
  user_id: string;
  name: string;
  umgebung: string;
  medium: string;
  licht_typ: string;
  licht_leistung: number | null;
  erfahrung: string;
  pflanzen_anzahl: number;
  flaeche: number | null;
  start_date: string;
  current_phase_id: string;
  status: string;
  notes: string | null;
  plan: Grow["plan"];
  harvest: Grow["harvest"] | null;
  created_at: string;
  updated_at: string;
  plants: Plant[];
};

export type PlantRow = {
  id: string;
  grow_id: string;
  user_id: string;
  name: string;
  notes: string | null;
  created_at: string;
};

function rowToPlant(row: PlantRow): Plant {
  return {
    id: row.id,
    name: row.name,
    ...(row.notes !== null && { notes: row.notes }),
    createdAt: row.created_at,
  };
}

async function syncPlants(
  supabase: SupabaseClient,
  userId: string,
  growId: string,
  plants: Plant[],
): Promise<void> {
  if (plants.length === 0) return;

  const rows = plants.map((plant) => ({
    id: plant.id,
    grow_id: growId,
    user_id: userId,
    name: plant.name,
    notes: plant.notes ?? null,
    created_at: plant.createdAt,
  }));

  const { error } = await supabase.from("plants").upsert(rows, { onConflict: "id" });
  if (error) throw error;
};

// ── createGrow ────────────────────────────────────────────────────────────────

/**
 * Inserts a new grow for the authenticated user.
 * Returns the created row, or throws on error.
 */
export async function createGrow(
  supabase: SupabaseClient,
  userId: string,
  grow: Grow,
): Promise<GrowRow> {
  const { data, error } = await supabase
    .from("grows")
    .insert({
      id: grow.id,
      user_id: userId,
      name: grow.name,
      umgebung: grow.umgebung,
      medium: grow.medium,
      licht_typ: grow.lichtTyp,
      licht_leistung: grow.lichtLeistung ?? null,
      erfahrung: grow.erfahrung,
      pflanzen_anzahl: grow.pflanzenAnzahl,
      flaeche: grow.flaeche ?? null,
      start_date: grow.startDate,
      current_phase_id: grow.currentPhaseId,
      status: grow.status,
      notes: grow.notes ?? null,
      plan: grow.plan,
      harvest: grow.harvest ?? null,
    })
    .select()
    .single<GrowRow>();

  if (error) throw error;
  await syncPlants(supabase, userId, grow.id, grow.plants);
  return {
    ...data,
    plants: grow.plants,
  };
}

// ── getGrows ──────────────────────────────────────────────────────────────────

/**
 * Fetches all grows for the authenticated user, newest first.
 * Returns an empty array when none exist.
 */
export async function getGrows(supabase: SupabaseClient): Promise<GrowRow[]> {
  const [{ data: grows, error: growsError }, { data: plants, error: plantsError }] = await Promise.all([
    supabase
      .from("grows")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Omit<GrowRow, "plants">[]>(),
    supabase
      .from("plants")
      .select("*")
      .returns<PlantRow[]>(),
  ]);

  if (growsError) throw growsError;
  if (plantsError) throw plantsError;

  const plantsByGrowId = new Map<string, Plant[]>();
  for (const plant of plants ?? []) {
    const existing = plantsByGrowId.get(plant.grow_id) ?? [];
    plantsByGrowId.set(plant.grow_id, [...existing, rowToPlant(plant)]);
  }

  return (grows ?? []).map((grow) => ({
    ...grow,
    plants: plantsByGrowId.get(grow.id) ?? [],
  }));
}

// ── updateGrow ────────────────────────────────────────────────────────────────

/**
 * Updates mutable fields of an existing grow.
 * Automatically refreshes updated_at server-side via the DB trigger.
 */
export async function updateGrow(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  updates: Partial<Omit<Grow, "id" | "createdAt">>,
): Promise<void> {
  // Map camelCase Grow fields to snake_case columns
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined)          payload.name             = updates.name;
  if (updates.umgebung !== undefined)      payload.umgebung         = updates.umgebung;
  if (updates.medium !== undefined)        payload.medium           = updates.medium;
  if (updates.lichtTyp !== undefined)      payload.licht_typ        = updates.lichtTyp;
  if (updates.lichtLeistung !== undefined) payload.licht_leistung   = updates.lichtLeistung;
  if (updates.erfahrung !== undefined)     payload.erfahrung        = updates.erfahrung;
  if (updates.pflanzenAnzahl !== undefined) payload.pflanzen_anzahl = updates.pflanzenAnzahl;
  if (updates.flaeche !== undefined)       payload.flaeche          = updates.flaeche;
  if (updates.startDate !== undefined)     payload.start_date       = updates.startDate;
  if (updates.currentPhaseId !== undefined) payload.current_phase_id = updates.currentPhaseId;
  if (updates.status !== undefined)        payload.status           = updates.status;
  if (updates.notes !== undefined)         payload.notes            = updates.notes ?? null;
  if (updates.plan !== undefined)          payload.plan             = updates.plan;
  if (updates.harvest !== undefined)       payload.harvest          = updates.harvest ?? null;

  const { error } = await supabase.from("grows").update(payload).eq("id", id);
  if (error) throw error;

  if (updates.plants !== undefined) {
    await syncPlants(supabase, userId, id, updates.plants);
  }
}

// ── deleteGrow ────────────────────────────────────────────────────────────────

/**
 * Deletes a grow by id.
 * Cascades to plants and log_entries via DB foreign keys.
 */
export async function deleteGrow(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("grows").delete().eq("id", id);
  if (error) throw error;
}

// ── Log Entry Types ───────────────────────────────────────────────────────────

type LogEntryRow = {
  id: string;
  grow_id: string;
  user_id: string;
  plant_id: string | null;
  entry_type: string;
  data: LogEntryData;
  notes: string | null;
  logged_at: string;
  created_at: string;
};

function rowToLogEntry(row: LogEntryRow): LogEntry {
  return {
    id: row.id,
    growId: row.grow_id,
    ...(row.plant_id !== null && { plantId: row.plant_id }),
    date: row.logged_at,
    data: row.data,
    ...(row.notes !== null && { notes: row.notes }),
    createdAt: row.created_at,
  };
}

// ── createLogEntry ────────────────────────────────────────────────────────────

export async function createLogEntry(
  supabase: SupabaseClient,
  userId: string,
  entry: LogEntry,
): Promise<void> {
  const { error } = await supabase.from("log_entries").insert({
    id: entry.id,
    grow_id: entry.growId,
    user_id: userId,
    plant_id: entry.plantId ?? null,
    entry_type: (entry.data as LogEntryData).type,
    data: entry.data,
    notes: entry.notes ?? null,
    logged_at: entry.date,
    created_at: entry.createdAt,
  });
  if (error) throw error;
}

// ── getLogEntries ─────────────────────────────────────────────────────────────

/**
 * Fetches all log entries for a grow, sorted newest-first.
 */
export async function getLogEntries(
  supabase: SupabaseClient,
  growId: string,
): Promise<LogEntry[]> {
  const { data, error } = await supabase
    .from("log_entries")
    .select("*")
    .eq("grow_id", growId)
    .order("logged_at", { ascending: false })
    .returns<LogEntryRow[]>();

  if (error) throw error;
  return (data ?? []).map(rowToLogEntry);
}

// ── updateLogEntry ────────────────────────────────────────────────────────────

export async function updateLogEntry(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Pick<LogEntry, "date" | "notes" | "data" | "plantId">>,
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.date !== undefined)    payload.logged_at   = updates.date;
  if (updates.notes !== undefined)   payload.notes       = updates.notes ?? null;
  if (updates.plantId !== undefined) payload.plant_id    = updates.plantId ?? null;
  if (updates.data !== undefined) {
    payload.data        = updates.data;
    payload.entry_type  = (updates.data as LogEntryData).type;
  }

  const { error } = await supabase.from("log_entries").update(payload).eq("id", id);
  if (error) throw error;
}

// ── deleteLogEntry ────────────────────────────────────────────────────────────

export async function deleteLogEntry(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("log_entries").delete().eq("id", id);
  if (error) throw error;
}
