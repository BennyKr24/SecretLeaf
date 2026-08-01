// ────────────────────────────────────────────────────────────────────────────
// Grow OS — Pure Helper Utilities
// No side effects, no external imports.
// ────────────────────────────────────────────────────────────────────────────

import type { GrowPhase } from "./types";

// ── ID Generation ─────────────────────────────────────────────────────────────

/** RFC 4122 v4 UUID matcher (used to detect legacy non-UUID ids during migration). */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Returns true when `value` is a valid RFC 4122 v4 UUID. */
export function isUuid(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

/**
 * Generates an RFC 4122 v4 UUID.
 *
 * Supabase grow tables (`grows`, `plants`, `log_entries`) use `uuid` primary
 * keys, so client-generated ids MUST be valid UUIDs — otherwise every insert
 * fails with `invalid input syntax for type uuid` and data is silently lost.
 *
 * Prefers the native `crypto.randomUUID()`; falls back to a `getRandomValues`
 * implementation for older runtimes / insecure contexts.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Set version (4) and variant (10xx) bits per RFC 4122.
    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;
    let hex = "";
    for (let i = 0; i < 16; i++) {
      hex += bytes[i]!.toString(16).padStart(2, "0");
      if (i === 3 || i === 5 || i === 7 || i === 9) hex += "-";
    }
    return hex;
  }

  // Last-resort fallback (no crypto available — should never happen in browsers).
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
