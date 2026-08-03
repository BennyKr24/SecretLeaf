// ────────────────────────────────────────────────────────────────────────────
// Grow OS — Grow & Log CRUD Store
//
// Pure CRUD layer — no business logic, no UI concerns.
// All state changes go through this module.
// ────────────────────────────────────────────────────────────────────────────

import { storage, STORAGE_KEYS } from "@/lib/store";
import type {
  Grow,
  LogEntry,
  Plant,
  CreateGrowInput,
  CreateLogEntryInput,
  GrowPlan,
  GrowPhaseId,
} from "./types";
import { generateId, computeCurrentDay } from "./utils";
import { computePhaseOverride } from "./planGenerator";

/**
 * Notifies same-tab listeners (e.g. useActiveGrow) that the active grow
 * pointer changed. The native "storage" event only fires in *other* tabs,
 * so callers that mutate ACTIVE_GROW_ID need this for same-tab reactivity.
 */
function notifyActiveGrowChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("secretleaf:activeGrowChanged"));
}

function createDefaultPlants(count: number): Plant[] {
  const now = new Date().toISOString();
  return Array.from({ length: Math.max(1, count) }, (_, index) => ({
    id: generateId(),
    name: `Plant ${index + 1}`,
    createdAt: now,
  }));
}

function normalizeGrow(grow: Grow): Grow {
  const safeCount = Math.max(1, grow.pflanzenAnzahl || 1);
  const hasPlants = Array.isArray(grow.plants) && grow.plants.length > 0;
  return {
    ...grow,
    pflanzenAnzahl: safeCount,
    plants: hasPlants ? grow.plants : createDefaultPlants(safeCount),
  };
}

// ── Grow Reads ────────────────────────────────────────────────────────────────

/** Returns all stored grows. Empty array if none exist. */
export function getGrows(): Grow[] {
  const grows = storage.get<Grow[]>(STORAGE_KEYS.GROWS) ?? [];
  let changed = false;
  const normalized = grows.map((grow) => {
    const missingPlants = !Array.isArray(grow.plants) || grow.plants.length === 0;
    const invalidCount = !Number.isFinite(grow.pflanzenAnzahl) || grow.pflanzenAnzahl < 1;
    if (missingPlants || invalidCount) changed = true;
    return normalizeGrow(grow);
  });

  // Stabilize legacy data once so plant IDs remain consistent across refreshes.
  if (changed) {
    storage.set(STORAGE_KEYS.GROWS, normalized);
  }

  return normalized;
}

/** Returns a single grow by ID, or null if not found. */
export function getGrowById(id: string): Grow | null {
  return getGrows().find((g) => g.id === id) ?? null;
}

/** Returns the ID of the currently active grow, or null if none is set. */
export function getActiveGrowId(): string | null {
  return storage.get<string>(STORAGE_KEYS.ACTIVE_GROW_ID);
}

/** Returns the currently active Grow entity, or null. */
export function getActiveGrow(): Grow | null {
  const id = getActiveGrowId();
  if (!id) return null;
  return getGrowById(id);
}

// ── Grow Writes ───────────────────────────────────────────────────────────────

/** Builds a new Grow object without persisting it. */
export function buildGrow(input: CreateGrowInput, plan?: GrowPlan): Grow {
  const now = new Date().toISOString();
  const defaultPlan: GrowPlan = { phases: [], totalDays: 0, generatedAt: now };
  const plants = input.plants?.length
    ? input.plants
    : createDefaultPlants(input.pflanzenAnzahl);

  return {
    ...input,
    plants,
    id: generateId(),
    plan: plan ?? defaultPlan,
    currentDay: 1, // will be recomputed at runtime via computeCurrentDay
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates and persists a new Grow.
 *
 * - `id`, `currentDay`, `createdAt`, `updatedAt` are auto-generated.
 * - Pass a pre-generated `plan` from `planGenerator` (recommended).
 *   Falls back to an empty plan if omitted.
 * - Automatically sets the new grow as active if:
 *   a) It is the very first grow, OR
 *   b) Its status is "aktiv".
 */
export function createGrow(input: CreateGrowInput, plan?: GrowPlan): Grow {
  const existing = getGrows();
  const grow = buildGrow(input, plan);

  storage.set(STORAGE_KEYS.GROWS, [...existing, grow]);

  if (existing.length === 0 || input.status === "aktiv") {
    storage.set(STORAGE_KEYS.ACTIVE_GROW_ID, grow.id);
    notifyActiveGrowChanged();
  }

  return grow;
}

/**
 * Updates fields of an existing grow.
 * `id` and `createdAt` are immutable.
 * `updatedAt` is always refreshed automatically.
 *
 * Returns the updated Grow, or null if not found.
 */
export function updateGrow(
  id: string,
  updates: Partial<Omit<Grow, "id" | "createdAt">>
): Grow | null {
  const grows = getGrows();
  const index = grows.findIndex((g) => g.id === id);
  if (index < 0) return null;

  const existing = grows[index];
  if (!existing) return null;

  const updated: Grow = {
    ...existing,
    ...updates,
    id: existing.id, // guard against accidental id override
    createdAt: existing.createdAt, // guard immutability
    updatedAt: new Date().toISOString(),
  };

  const next = [...grows];
  next[index] = updated;
  storage.set(STORAGE_KEYS.GROWS, next);
  return updated;
}

/**
 * Marks a task as completed within a grow's plan.
 * Returns the updated Grow, or null if grow or task is not found.
 */
export function completeTask(growId: string, taskId: string): Grow | null {
  const grow = getGrowById(growId);
  if (!grow) return null;

  const now = new Date().toISOString();
  const updatedPhases = grow.plan.phases.map((phase) => ({
    ...phase,
    tasks: phase.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: true, completedAt: now } : task
    ),
  }));

  return updateGrow(growId, { plan: { ...grow.plan, phases: updatedPhases } });
}

/**
 * Switches the grow to the given phase — used both for the "Bereit für
 * nächste Phase" button and manual overrides (e.g. an autoflower or
 * feminized plant that already flowered ahead of the generated schedule).
 * See `computePhaseOverride` in planGenerator.ts for the re-anchoring logic
 * (shared with the Supabase-backed path in useGrowState.ts).
 *
 * `getGrowById` returns the raw stored `currentDay` (only set at creation,
 * never persisted live) — recompute it here before anchoring, otherwise
 * every override would anchor to day 1 regardless of the grow's real age.
 */
export function advancePhase(growId: string, targetPhaseId: GrowPhaseId): Grow | null {
  const grow = getGrowById(growId);
  if (!grow) return null;

  const result = computePhaseOverride(
    { ...grow, currentDay: computeCurrentDay(grow.startDate) },
    targetPhaseId
  );
  if (!result) return null;

  return updateGrow(growId, result);
}

/**
 * Deletes a grow and all of its associated log entries.
 * If the deleted grow was the active one, switches to the next available
 * "aktiv" grow, then any grow, then null.
 */
export function deleteGrow(id: string): void {
  const remaining = getGrows().filter((g) => g.id !== id);
  storage.set(STORAGE_KEYS.GROWS, remaining);

  // Cascade-delete log entries for this grow
  const allEntries = storage.get<LogEntry[]>(STORAGE_KEYS.LOG_ENTRIES) ?? [];
  storage.set(
    STORAGE_KEYS.LOG_ENTRIES,
    allEntries.filter((e) => e.growId !== id)
  );

  // Update active grow pointer if needed
  if (getActiveGrowId() === id) {
    const next =
      remaining.find((g) => g.status === "aktiv") ?? remaining[0] ?? null;
    storage.set(STORAGE_KEYS.ACTIVE_GROW_ID, next?.id ?? null);
    notifyActiveGrowChanged();
  }
}

/** Sets the active grow by ID. No-ops silently if the grow does not exist. */
export function setActiveGrow(id: string): void {
  storage.set(STORAGE_KEYS.ACTIVE_GROW_ID, id);
  notifyActiveGrowChanged();
}

// ── Log Entry Reads ───────────────────────────────────────────────────────────

/**
 * Returns all log entries for a given grow, sorted newest-first by `date`.
 */
export function getLogEntries(growId: string, plantId?: string): LogEntry[] {
  const all = storage.get<LogEntry[]>(STORAGE_KEYS.LOG_ENTRIES) ?? [];
  return all
    .filter((e) => {
      if (e.growId !== growId) return false;
      if (plantId === undefined) return true;
      if (plantId === "") return e.plantId === undefined;
      return e.plantId === plantId;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ── Log Entry Writes ──────────────────────────────────────────────────────────

/**
 * Creates and persists a new log entry.
 * `id` and `createdAt` are auto-generated.
 */
export function createLogEntry(input: CreateLogEntryInput): LogEntry {
  const entry: LogEntry = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const all = storage.get<LogEntry[]>(STORAGE_KEYS.LOG_ENTRIES) ?? [];
  storage.set(STORAGE_KEYS.LOG_ENTRIES, [...all, entry]);
  return entry;
}

/**
 * Updates mutable fields (date, notes, data) of an existing log entry.
 * `id`, `growId`, and `createdAt` are immutable.
 * Returns the updated entry, or null if not found.
 */
export function updateLogEntry(
  id: string,
  updates: Partial<Pick<LogEntry, "date" | "notes" | "data" | "plantId">>
): LogEntry | null {
  const all = storage.get<LogEntry[]>(STORAGE_KEYS.LOG_ENTRIES) ?? [];
  const idx = all.findIndex((e) => e.id === id);
  if (idx < 0) return null;

  const existing = all[idx];
  if (!existing) return null;

  const updated: LogEntry = {
    ...existing,
    ...updates,
    id: existing.id,
    growId: existing.growId,
    createdAt: existing.createdAt,
  };

  const next = [...all];
  next[idx] = updated;
  storage.set(STORAGE_KEYS.LOG_ENTRIES, next);
  return updated;
}

/**
 * Deletes a single log entry by ID.
 * No-ops if the entry does not exist.
 */
export function deleteLogEntry(id: string): void {
  const all = storage.get<LogEntry[]>(STORAGE_KEYS.LOG_ENTRIES) ?? [];
  storage.set(
    STORAGE_KEYS.LOG_ENTRIES,
    all.filter((e) => e.id !== id)
  );
}
