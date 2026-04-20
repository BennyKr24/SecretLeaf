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
  CreateGrowInput,
  CreateLogEntryInput,
  GrowPlan,
  GrowPhaseId,
} from "./types";
import { generateId } from "./utils";

// ── Grow Reads ────────────────────────────────────────────────────────────────

/** Returns all stored grows. Empty array if none exist. */
export function getGrows(): Grow[] {
  return storage.get<Grow[]>(STORAGE_KEYS.GROWS) ?? [];
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
  const now = new Date().toISOString();
  const defaultPlan: GrowPlan = { phases: [], totalDays: 0, generatedAt: now };
  const existing = getGrows();

  const grow: Grow = {
    ...input,
    id: generateId(),
    plan: plan ?? defaultPlan,
    currentDay: 1, // will be recomputed at runtime via computeCurrentDay
    createdAt: now,
    updatedAt: now,
  };

  storage.set(STORAGE_KEYS.GROWS, [...existing, grow]);

  if (existing.length === 0 || input.status === "aktiv") {
    storage.set(STORAGE_KEYS.ACTIVE_GROW_ID, grow.id);
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
 * Advances the grow to the given phase.
 * Also updates `updatedAt` automatically via `updateGrow`.
 */
export function advancePhase(growId: string, phaseId: GrowPhaseId): Grow | null {
  return updateGrow(growId, { currentPhaseId: phaseId });
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
  }
}

/** Sets the active grow by ID. No-ops silently if the grow does not exist. */
export function setActiveGrow(id: string): void {
  storage.set(STORAGE_KEYS.ACTIVE_GROW_ID, id);
}

// ── Log Entry Reads ───────────────────────────────────────────────────────────

/**
 * Returns all log entries for a given grow, sorted newest-first by `date`.
 */
export function getLogEntries(growId: string): LogEntry[] {
  const all = storage.get<LogEntry[]>(STORAGE_KEYS.LOG_ENTRIES) ?? [];
  return all
    .filter((e) => e.growId === growId)
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
