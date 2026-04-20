"use client";

// ────────────────────────────────────────────────────────────────────────────
// Grow OS — useGrowState Hook
//
// Reactive state layer for the Grow system.
// Wraps lib/grow/store (CRUD) + lib/grow/planGenerator (business logic).
// Components never touch the store or storage directly.
// ────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import type { Grow, CreateGrowInput, GrowPhaseId } from "@/lib/grow/types";
import {
  getGrows,
  getActiveGrow,
  getActiveGrowId,
  createGrow as storeCreateGrow,
  updateGrow as storeUpdateGrow,
  deleteGrow as storeDeleteGrow,
  setActiveGrow as storeSetActiveGrow,
  completeTask as storeCompleteTask,
  advancePhase as storeAdvancePhase,
} from "@/lib/grow/store";
import { generateGrowPlan } from "@/lib/grow/planGenerator";
import { computeCurrentDay } from "@/lib/grow/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Injects a live-computed `currentDay` into a grow (not persisted). */
function withLiveDay(grow: Grow): Grow {
  return { ...grow, currentDay: computeCurrentDay(grow.startDate) };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export type UseGrowStateReturn = {
  /** All stored grows, with `currentDay` computed at load time. */
  grows: Grow[];
  /** The currently active grow, or null if none exists. */
  activeGrow: Grow | null;
  /** Convenience shorthand for `activeGrow?.id`. */
  activeGrowId: string | null;
  /** True once the initial localStorage read has completed (SSR-safe). */
  loaded: boolean;

  /**
   * Creates a new grow, auto-generates its plan, persists it, and
   * sets it as the active grow if it is the first or its status is "aktiv".
   * Returns the newly created Grow.
   */
  createGrow: (input: CreateGrowInput) => Grow;

  /**
   * Updates fields on an existing grow.
   * `id` and `createdAt` cannot be changed.
   * Returns the updated Grow or null if not found.
   */
  updateGrow: (id: string, updates: Partial<Omit<Grow, "id" | "createdAt">>) => Grow | null;

  /** Deletes a grow and all its log entries. */
  deleteGrow: (id: string) => void;

  /** Changes the active grow. */
  setActiveGrowId: (id: string) => void;

  /** Marks a task as completed in the active grow's plan. */
  completeTask: (growId: string, taskId: string) => void;

  /** Advances a grow to the specified phase. */
  advancePhase: (growId: string, phaseId: GrowPhaseId) => void;

  /** Manually re-syncs state from storage (useful after external writes). */
  refresh: () => void;
};

export function useGrowState(): UseGrowStateReturn {
  const [grows, setGrows] = useState<Grow[]>([]);
  const [activeGrow, setActiveGrow] = useState<Grow | null>(null);
  const [loaded, setLoaded] = useState(false);

  // ── Read from storage ───────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    const allGrows = getGrows().map(withLiveDay);
    setGrows(allGrows);

    const active = getActiveGrow();
    setActiveGrow(active !== null ? withLiveDay(active) : null);
  }, []);

  useEffect(() => {
    refresh();
    setLoaded(true);
  }, [refresh]);

  // ── Write actions ───────────────────────────────────────────────────────────
  const createGrow = useCallback(
    (input: CreateGrowInput): Grow => {
      const plan = generateGrowPlan(input);
      const grow = storeCreateGrow(input, plan);
      refresh();
      return grow;
    },
    [refresh]
  );

  const updateGrow = useCallback(
    (id: string, updates: Partial<Omit<Grow, "id" | "createdAt">>): Grow | null => {
      const result = storeUpdateGrow(id, updates);
      refresh();
      return result;
    },
    [refresh]
  );

  const deleteGrow = useCallback(
    (id: string): void => {
      storeDeleteGrow(id);
      refresh();
    },
    [refresh]
  );

  const setActiveGrowId = useCallback(
    (id: string): void => {
      storeSetActiveGrow(id);
      refresh();
    },
    [refresh]
  );

  const completeTask = useCallback(
    (growId: string, taskId: string): void => {
      storeCompleteTask(growId, taskId);
      refresh();
    },
    [refresh]
  );

  const advancePhase = useCallback(
    (growId: string, phaseId: GrowPhaseId): void => {
      storeAdvancePhase(growId, phaseId);
      refresh();
    },
    [refresh]
  );

  return {
    grows,
    activeGrow,
    activeGrowId: getActiveGrowId(),
    loaded,
    createGrow,
    updateGrow,
    deleteGrow,
    setActiveGrowId,
    completeTask,
    advancePhase,
    refresh,
  };
}
