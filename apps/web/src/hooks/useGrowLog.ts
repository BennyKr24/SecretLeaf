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
} from "@/lib/grow/types";
import {
  getLogEntries,
  createLogEntry as storeCreateLogEntry,
  deleteLogEntry as storeDeleteLogEntry,
  updateLogEntry as storeUpdateLogEntry,
} from "@/lib/grow/store";

// ── Hook ──────────────────────────────────────────────────────────────────────

export type UseGrowLogReturn = {
  /** All log entries for this grow, sorted newest-first. */
  entries: LogEntry[];
  /** True once the initial localStorage read has completed. */
  loaded: boolean;

  /**
   * Adds a new log entry for the current grow.
   * `growId` and `createdAt` are injected automatically.
   * Returns the created entry, or null if `growId` is not set.
   */
  addEntry: (input: Omit<CreateLogEntryInput, "growId">) => LogEntry | null;

  /**
   * Updates mutable fields of an existing log entry.
   * Returns the updated entry or null if not found.
   */
  updateEntry: (id: string, updates: Partial<Pick<LogEntry, "date" | "notes" | "data">>) => LogEntry | null;

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
    (input: Omit<CreateLogEntryInput, "growId">): LogEntry | null => {
      if (!growId) return null;
      const entry = storeCreateLogEntry({ ...input, growId });
      refresh();
      return entry;
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
    (id: string, updates: Partial<Pick<LogEntry, "date" | "notes" | "data">>): LogEntry | null => {
      const result = storeUpdateLogEntry(id, updates);
      refresh();
      return result;
    },
    [refresh]
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
