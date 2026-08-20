// ────────────────────────────────────────────────────────────────────────────
// Grow OS — Plan Generator
//
// Pure function: takes grow setup → returns a fully structured GrowPlan.
// No side effects, no storage access. Deterministic output.
// ────────────────────────────────────────────────────────────────────────────

import type { Grow, GrowPlan, GrowPhase, GrowPhaseId, CreateGrowInput } from "./types";
import {
  getPhaseDurations,
  buildPhaseTasks,
  PHASE_LABELS,
  PHASE_DESCRIPTIONS,
  PHASE_ORDER,
} from "./phases";

// ── Plan Generation ───────────────────────────────────────────────────────────

/**
 * Generates a complete, structured GrowPlan from a grow's setup parameters.
 *
 * Each phase receives:
 * - Absolute startDay / endDay (grow-day indexed, starts at 1)
 * - Pre-built task list appropriate to experience level
 *
 * @param input Subset of CreateGrowInput needed for the calculation.
 * @returns     A fully populated GrowPlan ready to be stored on a Grow.
 */
export function generateGrowPlan(
  input: Pick<CreateGrowInput, "umgebung" | "medium" | "erfahrung" | "genetikTyp">
): GrowPlan {
  const durations = getPhaseDurations(input.umgebung, input.medium, input.genetikTyp);

  let currentDay = 1;

  const phases: GrowPhase[] = PHASE_ORDER.map((phaseId) => {
    const duration = durations[phaseId] ?? 7;
    const startDay = currentDay;
    const endDay = currentDay + duration - 1;
    const tasks = buildPhaseTasks(phaseId, startDay, input.erfahrung);

    currentDay += duration;

    return {
      id: phaseId,
      label: PHASE_LABELS[phaseId],
      description: PHASE_DESCRIPTIONS[phaseId],
      startDay,
      endDay,
      tasks,
    };
  });

  return {
    phases,
    totalDays: currentDay - 1,
    generatedAt: new Date().toISOString(),
  };
}

// ── Plan Query Utilities ──────────────────────────────────────────────────────

/**
 * Returns the GrowPhase that contains the given grow day.
 * Falls back to the last phase if the day exceeds the plan's totalDays.
 * Returns null only when the plan has no phases.
 */
export function getPhaseForDay(plan: GrowPlan, day: number): GrowPhase | null {
  if (plan.phases.length === 0) return null;
  const match = plan.phases.find((p) => day >= p.startDay && day <= p.endDay);
  return match ?? plan.phases[plan.phases.length - 1] ?? null;
}

/**
 * Returns upcoming incomplete tasks, sorted by dueDay ascending.
 * "Upcoming" = dueDay >= currentDay.
 *
 * @param grow  The grow (needs `currentDay` and `plan`).
 * @param limit Maximum number of tasks to return (default 5).
 */
export function getUpcomingTasks(
  grow: Pick<Grow, "currentDay" | "plan">,
  limit = 5
): Grow["plan"]["phases"][number]["tasks"] {
  return grow.plan.phases
    .flatMap((p) => p.tasks)
    .filter((t) => !t.completed && t.dueDay >= grow.currentDay)
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, limit);
}

/**
 * Returns tasks that are overdue: dueDay has passed and they are not completed.
 */
export function getOverdueTasks(
  grow: Pick<Grow, "currentDay" | "plan">
): Grow["plan"]["phases"][number]["tasks"] {
  return grow.plan.phases
    .flatMap((p) => p.tasks)
    .filter((t) => !t.completed && t.dueDay < grow.currentDay)
    .sort((a, b) => a.dueDay - b.dueDay);
}

// ── Phase Override ─────────────────────────────────────────────────────────

export type PhaseOverrideResult = {
  currentPhaseId: GrowPhaseId;
  plan: GrowPlan;
};

/**
 * Re-anchors the plan so `targetPhaseId` starts on `grow.currentDay`
 * ("today" becomes phase day 1) — used for manual phase overrides (e.g. an
 * autoflower or feminized plant that already flowered ahead of the
 * generated schedule) and for the "ready for next phase" shortcut, so both
 * paths behave identically.
 *
 * Each phase from the target onward keeps its original *duration* but
 * shifts sequentially from the new anchor. Phases skipped over (between the
 * old and new current phase) have their incomplete tasks dropped — they no
 * longer apply — while completed tasks stay as history everywhere. Phases
 * before the old current phase are untouched.
 *
 * `grow.currentDay` must already be live (via `computeCurrentDay`) — this
 * function trusts the value it's given rather than recomputing it, so
 * callers reading from a stale store must recompute before calling.
 */
export function computePhaseOverride(
  grow: Pick<Grow, "currentPhaseId" | "currentDay" | "erfahrung" | "plan">,
  targetPhaseId: GrowPhaseId
): PhaseOverrideResult | null {
  const targetPhase = grow.plan.phases.find((p) => p.id === targetPhaseId);
  if (!targetPhase) return null;

  const oldIndex = PHASE_ORDER.indexOf(grow.currentPhaseId);
  const targetIndex = PHASE_ORDER.indexOf(targetPhaseId);
  const skippedIds = new Set<GrowPhaseId>(
    targetIndex > oldIndex ? PHASE_ORDER.slice(oldIndex, targetIndex) : []
  );

  let reachedTarget = false;
  let cursor = grow.currentDay;

  const updatedPhases: GrowPhase[] = grow.plan.phases.map((phase) => {
    if (!reachedTarget && phase.id !== targetPhaseId) {
      if (skippedIds.has(phase.id)) {
        return { ...phase, tasks: phase.tasks.filter((t) => t.completed) };
      }
      return phase;
    }

    const duration = phase.endDay - phase.startDay;
    const newStartDay = reachedTarget ? cursor : grow.currentDay;
    const newEndDay = newStartDay + duration;
    const completedTasks = phase.tasks.filter((t) => t.completed);
    const freshTasks = buildPhaseTasks(phase.id, newStartDay, grow.erfahrung);

    cursor = newEndDay + 1;
    reachedTarget = true;

    return { ...phase, startDay: newStartDay, endDay: newEndDay, tasks: [...completedTasks, ...freshTasks] };
  });

  const totalDays = updatedPhases[updatedPhases.length - 1]?.endDay ?? grow.plan.totalDays;

  return {
    currentPhaseId: targetPhaseId,
    plan: { ...grow.plan, phases: updatedPhases, totalDays },
  };
}

/**
 * Returns the count of completed tasks and total tasks for a grow.
 */
export function getTaskProgress(grow: Pick<Grow, "plan">): {
  completed: number;
  total: number;
  percent: number;
} {
  const all = grow.plan.phases.flatMap((p) => p.tasks);
  const completed = all.filter((t) => t.completed).length;
  const total = all.length;
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
