// ────────────────────────────────────────────────────────────────────────────
// Grow OS — Pure Helper Utilities
// No side effects, no external imports.
// ────────────────────────────────────────────────────────────────────────────

import type { GrowPhase } from "./types";

// ── ID Generation ─────────────────────────────────────────────────────────────

/**
 * Generates a short, collision-resistant ID for client-side use.
 * Format: `<base36-timestamp>-<base36-random>` e.g. "lop2k3f-ab12xy"
 *
 * Upgrade path: swap for `crypto.randomUUID()` or server-generated UUIDs
 * when migrating to a backend.
 */
export function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
}

// ── Day Computation ───────────────────────────────────────────────────────────

/**
 * Returns the current grow day (1-indexed).
 * Day 1 = the start date. Minimum is always 1 (never negative).
 *
 * @param startDate ISO date string of when the grow was started.
 */
export function computeCurrentDay(startDate: string): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - start.getTime();
  return Math.max(1, Math.floor(diffMs / 86_400_000) + 1);
}

// ── Phase Lookup ──────────────────────────────────────────────────────────────

/**
 * Returns the phase that contains the given grow day.
 * Falls back to the last phase if the day exceeds the plan duration.
 * Returns null only if phases array is empty.
 */
export function getPhaseForDay(phases: GrowPhase[], day: number): GrowPhase | null {
  if (phases.length === 0) return null;
  const match = phases.find((p) => day >= p.startDay && day <= p.endDay);
  // After the last phase's endDay, show the final phase (e.g. "Ernte")
  return match ?? phases[phases.length - 1] ?? null;
}

// ── Date Formatting ───────────────────────────────────────────────────────────

/**
 * Returns a human-readable relative time string in German.
 * e.g. "Gerade eben", "vor 3 Min.", "vor 2 Std.", "vor 5 Tagen"
 */
export function timeAgoDE(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `vor ${days} ${days === 1 ? "Tag" : "Tagen"}`;
  const weeks = Math.floor(days / 7);
  return `vor ${weeks} ${weeks === 1 ? "Woche" : "Wochen"}`;
}

/**
 * Formats an ISO date string as a short German locale date.
 * e.g. "20.04.2026"
 */
export function formatDateDE(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── Progress ──────────────────────────────────────────────────────────────────

/**
 * Returns the grow progress as a percentage (0–100), capped at 100.
 */
export function computeGrowProgress(currentDay: number, totalDays: number): number {
  if (totalDays <= 0) return 0;
  return Math.min(100, Math.round((currentDay / totalDays) * 100));
}
