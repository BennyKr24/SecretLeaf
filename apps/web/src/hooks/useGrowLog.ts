"use client";

// ────────────────────────────────────────────────────────────────────────────
// Grow OS — useGrowLog Hook
//
// Reactive state layer for grow log entries.
// Scoped to a single grow by growId. Components never call the store directly.
// ────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import type {
  LogEntry,
  LogEntryType,
  CreateLogEntryInput,
  TaskCategory,
} from "@/lib/grow/types";
import {
  getLogEntries,
  getGrowById,
  createLogEntry as storeCreateLogEntry,
  deleteLogEntry as storeDeleteLogEntry,
  updateLogEntry as storeUpdateLogEntry,
  completeTask as storeCompleteTask,
} from "@/lib/grow/store";

// ── Log → Task mapping ────────────────────────────────────────────────────────

/**
 * Maps a log entry type to the task category it can auto-complete.
 * Only types with a direct task equivalent are listed.
 */
const LOG_TYPE_TO_TASK_CATEGORY: Partial<Record<LogEntryType, TaskCategory>> = {
  wasser: "bewaesserung",
  duenger: "duengung",
  training: "training",
};

/**
 * Finds and completes the nearest open task of the matching category.
 * Only acts if a task is due today or overdue (within a ±3 day window).
 * Returns the completed task ID, or null if none matched.
 */
function autoCompleteTask(growId: string, logType: LogEntryType): string | null {
  const category = LOG_TYPE_TO_TASK_CATEGORY[logType];
  if (!category) return null;

  const grow = getGrowById(growId);
  if (!grow) return null;

  const today = grow.currentDay;
  const WINDOW = 3; // days: today - WINDOW to today

  // All incomplete tasks of matching category within the window, closest first
  const candidate = grow.plan.phases
    .flatMap((p) => p.tasks)
    .filter(
      (t) =>
        !t.completed &&
        t.category === category &&
        t.dueDay >= today - WINDOW &&
        t.dueDay <= today
    )
    .sort((a, b) => Math.abs(a.dueDay - today) - Math.abs(b.dueDay - today))[0];

  if (!candidate) return null;

  storeCompleteTask(growId, candidate.id);
  return candidate.id;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export type UseGrowLogReturn = {
  /** All log entries for this grow, sorted newest-first. */
  entries: LogEntry[];
  /** True once the initial localStorage read has completed. */
  loaded: boolean;

  /**
   * Adds a new log entry for the current grow.
   * `growId` and `createdAt` are injected automatically.
   * Also auto-completes the nearest matching open task (if any).
   * Returns an object with the created entry and the completed task ID (or null).
   */
  addEntry: (input: Omit<CreateLogEntryInput, "growId">) => { entry: LogEntry; completedTaskId: string | null } | null;

  /**
   * Updates mutable fields of an existing log entry.
   * Returns the updated entry or null if not found.
   */
  updateEntry: (id: string, updates: Partial<Pick<LogEntry, "date" | "notes" | "data" | "plantId">>) => LogEntry | null;

  /**
   * Deletes a log entry by ID.
   */
  deleteEntry: (id: string) => void;

  /** True if there is at least one log entry for today. */
  hasTodayEntry: boolean;

  /** Manually re-syncs from storage. */
  refresh: () => void;

  /** Returns entries filtered by type. */
  entriesByType: (type: LogEntryType) => LogEntry[];

  /**
   * Returns entries filtered by plant scope.
   * - `null` => all entries
   * - `""` => whole-grow entries only (without plantId)
   * - `"<plantId>"` => entries for a specific plant
   */
  entriesByPlant: (plantId: string | null) => LogEntry[];

  /**
   * Returns the number of consecutive days that have at least one log entry.
   * Used for streak display.
   */
  currentStreak: number;
};

// ── Streak Calculation ────────────────────────────────────────────────────────

/**
 * Counts consecutive logged days ending today (or yesterday).
 * A "day" counts if there is at least one log entry on that calendar date.
 */
function computeStreak(entries: LogEntry[]): number {
  if (entries.length === 0) return 0;

  // Build a Set of logged calendar dates (YYYY-MM-DD in local time)
  const loggedDays = new Set(
    entries.map((e) => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  // Walk backwards from today
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    if (loggedDays.has(key)) {
      streak++;
    } else if (i > 0) {
      // Broken chain — stop. Allow today to be empty (streak from yesterday counts)
      break;
    }
  }

  return streak;
}

// ── Main Hook ─────────────────────────────────────────────────────────────────

export function useGrowLog(growId: string | null): UseGrowLogReturn {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    if (!growId) {
      setEntries([]);
      return;
    }
    setEntries(getLogEntries(growId));
  }, [growId]);

  useEffect(() => {
    refresh();
    setLoaded(true);
  }, [refresh]);

  const addEntry = useCallback(
    (input: Omit<CreateLogEntryInput, "growId">): { entry: LogEntry; completedTaskId: string | null } | null => {
      if (!growId) return null;
      const entry = storeCreateLogEntry({ ...input, growId });
      // Auto-complete the nearest matching open task
      const completedTaskId = autoCompleteTask(growId, input.data.type as LogEntryType);
      refresh();
      return { entry, completedTaskId };
    },
    [growId, refresh]
  );

  const deleteEntry = useCallback(
    (id: string): void => {
      storeDeleteLogEntry(id);
      refresh();
    },
    [refresh]
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<Pick<LogEntry, "date" | "notes" | "data" | "plantId">>): LogEntry | null => {
      const result = storeUpdateLogEntry(id, updates);
      refresh();
      return result;
    },
    [refresh]
  );

  const entriesByPlant = useCallback(
    (plantId: string | null): LogEntry[] => {
      if (plantId === null) return entries;
      if (plantId === "") return entries.filter((e) => e.plantId === undefined);
      return entries.filter((e) => e.plantId === plantId);
    },
    [entries]
  );

  const entriesByType = useCallback(
    (type: LogEntryType): LogEntry[] => {
      return entries.filter((e) => e.data.type === type);
    },
    [entries]
  );

  return {
    entries,
    loaded,
    addEntry,
    deleteEntry,
    updateEntry,
    refresh,
    entriesByType,
    entriesByPlant,
    currentStreak: computeStreak(entries),
    hasTodayEntry: entries.some((e) => {
      const d = new Date(e.date);
      const t = new Date();
      return (
        d.getFullYear() === t.getFullYear() &&
        d.getMonth() === t.getMonth() &&
        d.getDate() === t.getDate()
      );
    }),
  };
}
