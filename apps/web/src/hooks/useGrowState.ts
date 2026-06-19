"use client";

// ────────────────────────────────────────────────────────────────────────────
// Grow OS — useGrowState Hook
//
// Reactive state layer for the Grow system.
// Wraps lib/grow/store (CRUD) + lib/grow/planGenerator (business logic).
// Components never touch the store or storage directly.
//
// Supabase path (Step 4):
//   - Logged-in users: optimistic UI → Supabase write → localStorage cache sync
//   - Anonymous users: unchanged localStorage path
// ────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import type { Grow, CreateGrowInput, GrowPhaseId } from "@/lib/grow/types";
import type { GrowUmgebung, GrowMedium, LichtTyp, Erfahrung, GrowStatus } from "@/lib/grow/types";
import {
  getGrows,
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
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import {
  createGrow as dbCreateGrow,
  updateGrow as dbUpdateGrow,
  deleteGrow as dbDeleteGrow,
  getGrows as dbGetGrows,
  type GrowRow,
} from "@/lib/grow/db";
import { Analytics } from "@/lib/analytics";
import { storage, STORAGE_KEYS } from "@/lib/store";
import { captureGrowError } from "@/lib/grow/telemetry";

// ── Supabase row → Grow mapper ────────────────────────────────────────────────

function rowToGrow(row: GrowRow): Grow {
  return {
    id: row.id,
    name: row.name,
    umgebung: row.umgebung as GrowUmgebung,
    medium: row.medium as GrowMedium,
    lichtTyp: row.licht_typ as LichtTyp,
    ...(row.licht_leistung !== null && { lichtLeistung: row.licht_leistung }),
    erfahrung: row.erfahrung as Erfahrung,
    pflanzenAnzahl: row.pflanzen_anzahl,
    plants: row.plants,
    ...(row.flaeche !== null && { flaeche: row.flaeche }),
    startDate: row.start_date,
    currentPhaseId: row.current_phase_id as GrowPhaseId,
    currentDay: computeCurrentDay(row.start_date),
    status: row.status as GrowStatus,
    plan: row.plan,
    ...(row.notes !== null && { notes: row.notes }),
    ...(row.harvest != null && { harvest: row.harvest }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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
  /** True once the initial load has completed (SSR-safe). */
  loaded: boolean;

  /**
   * Creates a new grow, auto-generates its plan, persists it, and
   * sets it as the active grow if it is the first or its status is "aktiv".
   * Returns the newly created Grow.
   */
  createGrow: (input: CreateGrowInput) => Promise<Grow>;

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
  const { user } = useAuth();
  const [grows, setGrows] = useState<Grow[]>([]);
  const [loaded, setLoaded] = useState(false);

  // ── Local-state refresh (localStorage path) ─────────────────────────────────
  const refresh = useCallback(() => {
    setGrows(getGrows().map(withLiveDay));
  }, []);

  // ── Initial load ────────────────────────────────────────────────────────────
  //
  // Logged-in users → fetch from Supabase, fall back to localStorage on error.
  // Anonymous users → localStorage only (unchanged behavior).
  //
  useEffect(() => {
    if (!user) {
      // Anonymous: use localStorage as before
      const t = setTimeout(() => {
        refresh();
        setLoaded(true);
      }, 0);
      return () => clearTimeout(t);
    }

    // Logged-in: load from Supabase
    const supabase = getSupabaseBrowserClient();
    dbGetGrows(supabase)
      .then((rows) => {
        const loadedGrows = rows.map(rowToGrow);
        setGrows(loadedGrows);
        // On a new device localStorage has no active grow ID.
        // Default to the most recently created grow so the dashboard isn't blank.
        if (loadedGrows.length > 0 && !getActiveGrowId()) {
          const first = loadedGrows[0];
          if (first) storeSetActiveGrow(first.id);
        }
        setLoaded(true);
      })
      .catch((err) => {
        console.error("[grows] Supabase load failed, falling back to localStorage:", err);
        captureGrowError("loadGrows", { userId: user.id }, err);
        refresh();
        setLoaded(true);
      });
  // Re-run when user logs in or out
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Write actions ───────────────────────────────────────────────────────────
  //
  // Pattern for logged-in users:
  //   1. Optimistic: update local React state immediately
  //   2. Supabase write (awaited inside async IIFE)
  //   3. On success: sync localStorage as cache
  //   4. On error: rollback React state, console.error
  //
  // Anonymous users fall through to the plain localStorage path.

  const createGrow = useCallback(
    async (input: CreateGrowInput): Promise<Grow> => {
      const plan = generateGrowPlan(input);
      // Build the grow object via store (generates id, timestamps, plants)
      const grow = storeCreateGrow(input, plan);
      const growWithDay = withLiveDay(grow);

      if (!user) {
        // Anonymous: localStorage only (unchanged behaviour)
        refresh();
        return grow;
      }

      // Optimistic: add to React state immediately
      setGrows((prev) => [growWithDay, ...prev]);

      const supabase = getSupabaseBrowserClient();
      try {
        await dbCreateGrow(supabase, user.id, grow);
        // Success: sync localStorage cache from current state
        setGrows((current) => {
          storage.set(STORAGE_KEYS.GROWS, current.map((g) =>
            g.id === grow.id ? grow : g
          ));
          return current;
        });
      } catch (err) {
        console.error("[grows] createGrow Supabase failed, rolling back:", err);
        captureGrowError("createGrow", { userId: user.id, growId: grow.id }, err);
        storeDeleteGrow(grow.id);
        // Rollback: remove optimistic entry from state only
        setGrows((prev) => prev.filter((g) => g.id !== grow.id));
        throw err;
      }

      return grow;
    },
    [user, refresh]
  );

  const updateGrow = useCallback(
    (id: string, updates: Partial<Omit<Grow, "id" | "createdAt">>): Grow | null => {
      if (!user) {
        // Anonymous: localStorage only
        const result = storeUpdateGrow(id, updates);
        refresh();
        return result;
      }

      // Optimistic: find previous state for rollback
      const prev = grows.find((g) => g.id === id) ?? null;
      const updated = prev ? withLiveDay({ ...prev, ...updates, updatedAt: new Date().toISOString() }) : null;
      if (updated) {
        setGrows((all) => all.map((g) => (g.id === id ? updated : g)));
      }

      const supabase = getSupabaseBrowserClient();
      void (async () => {
        try {
          await dbUpdateGrow(supabase, user.id, id, updates);
          // Success: sync localStorage cache from current state
          setGrows((current) => {
            storage.set(STORAGE_KEYS.GROWS, current.map((g) =>
              // strip runtime-only currentDay before persisting
              g.id === id ? { ...g, currentDay: 0 } : g
            ));
            return current;
          });
        } catch (err) {
          console.error("[grows] updateGrow Supabase failed, rolling back:", err);
          captureGrowError("updateGrow", { userId: user.id, growId: id }, err);
          if (prev) setGrows((all) => all.map((g) => (g.id === id ? prev : g)));
        }
      })();

      return updated;
    },
    [user, grows, refresh]
  );

  const deleteGrow = useCallback(
    (id: string): void => {
      if (!user) {
        // Anonymous: localStorage only
        storeDeleteGrow(id);
        refresh();
        return;
      }

      // Optimistic: snapshot for rollback
      const snapshot = grows.find((g) => g.id === id) ?? null;
      setGrows((prev) => prev.filter((g) => g.id !== id));

      const supabase = getSupabaseBrowserClient();
      void (async () => {
        try {
          await dbDeleteGrow(supabase, id);
          // Success: sync localStorage cache from current state
          setGrows((current) => {
            storage.set(STORAGE_KEYS.GROWS, current);
            return current;
          });
        } catch (err) {
          console.error("[grows] deleteGrow Supabase failed, rolling back:", err);
          captureGrowError("deleteGrow", { userId: user.id, growId: id }, err);
          if (snapshot) setGrows((prev) => [snapshot, ...prev]);
        }
      })();
    },
    [user, grows, refresh]
  );

  const setActiveGrowId = useCallback(
    (id: string): void => {
      // Active-grow pointer is UI-only state — localStorage is fine for both paths
      storeSetActiveGrow(id);
      refresh();
    },
    [refresh]
  );

  const completeTask = useCallback(
    (growId: string, taskId: string): void => {
      if (!user) {
        storeCompleteTask(growId, taskId);
        refresh();
        return;
      }

      const prev = grows.find((g) => g.id === growId) ?? null;
      if (!prev) return;

      const now = new Date().toISOString();
      const updatedPlan = {
        ...prev.plan,
        phases: prev.plan.phases.map((p) => ({
          ...p,
          tasks: p.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: true, completedAt: now } : t
          ),
        })),
      };
      const optimistic = withLiveDay({ ...prev, plan: updatedPlan, updatedAt: now });

      // Optimistic state update
      setGrows((all) => all.map((g) => (g.id === growId ? optimistic : g)));

      const supabase = getSupabaseBrowserClient();
      void (async () => {
        try {
          await dbUpdateGrow(supabase, user.id, growId, { plan: updatedPlan });
          // Success: sync localStorage cache from current state
          setGrows((current) => {
            storage.set(STORAGE_KEYS.GROWS, current);
            return current;
          });
        } catch (err) {
          console.error("[grows] completeTask Supabase failed, rolling back:", err);
          captureGrowError("completeTask", { userId: user.id, growId, taskId }, err);
          setGrows((all) => all.map((g) => (g.id === growId ? prev : g)));
        }
      })();
    },
    [user, grows, refresh]
  );

  const advancePhase = useCallback(
    (growId: string, phaseId: GrowPhaseId): void => {
      if (!user) {
        const localGrow = grows.find((g) => g.id === growId) ?? null;
        if (localGrow && localGrow.currentPhaseId !== phaseId) {
          Analytics.phaseAdvanced(localGrow.currentPhaseId, phaseId);
        }
        storeAdvancePhase(growId, phaseId);
        refresh();
        return;
      }

      const prev = grows.find((g) => g.id === growId) ?? null;
      if (!prev) return;
      if (prev.currentPhaseId !== phaseId) {
        Analytics.phaseAdvanced(prev.currentPhaseId, phaseId);
      }

      const now = new Date().toISOString();
      const optimistic = withLiveDay({ ...prev, currentPhaseId: phaseId, updatedAt: now });

      // Optimistic state update
      setGrows((all) => all.map((g) => (g.id === growId ? optimistic : g)));

      const supabase = getSupabaseBrowserClient();
      void (async () => {
        try {
          await dbUpdateGrow(supabase, user.id, growId, { currentPhaseId: phaseId });
          // Success: sync localStorage cache from current state
          setGrows((current) => {
            storage.set(STORAGE_KEYS.GROWS, current);
            return current;
          });
        } catch (err) {
          console.error("[grows] advancePhase Supabase failed, rolling back:", err);
          captureGrowError("advancePhase", { userId: user.id, growId, newPhaseId: phaseId }, err);
          setGrows((all) => all.map((g) => (g.id === growId ? prev : g)));
        }
      })();
    },
    [user, grows, refresh]
  );

  // Derive activeGrow from the current grows list + the persisted active ID.
  // This ensures correctness for all cases:
  //   - Anonymous users: grows come from localStorage via refresh()
  //   - Logged-in, same device: grows from Supabase, active ID from localStorage
  //   - Logged-in, new device: grows from Supabase, active ID just set above
  //   - After createGrow: storeCreateGrow() sets ACTIVE_GROW_ID, next render picks it up
  const activeId = getActiveGrowId();
  const derivedActiveGrow = activeId ? (grows.find((g) => g.id === activeId) ?? null) : null;

  return {
    grows,
    activeGrow: derivedActiveGrow,
    activeGrowId: activeId,
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
