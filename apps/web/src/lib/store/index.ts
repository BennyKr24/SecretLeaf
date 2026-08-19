// ────────────────────────────────────────────────────────────────────────────
// Storage Adapter — Unified persistence abstraction
//
// Design goal: swap the backend without touching a single component.
// Today: localStorage  →  Tomorrow: Supabase / IndexedDB / server-side
//
// Usage:
//   import { storage, STORAGE_KEYS } from "@/lib/store";
//   const grows = storage.get<Grow[]>(STORAGE_KEYS.GROWS) ?? [];
//   storage.set(STORAGE_KEYS.GROWS, grows);
// ────────────────────────────────────────────────────────────────────────────

// ── Adapter Interface ─────────────────────────────────────────────────────────

/**
 * Minimal storage contract. Implementations must be:
 * - SSR-safe (no crash when window is undefined)
 * - Fail-silent (never throw to callers)
 * - Type-safe via generics
 */
export interface StorageAdapter {
  /** Read and deserialize a value. Returns null when missing or unparseable. */
  get<T>(key: string): T | null;
  /** Serialize and persist a value. No-ops silently on failure. */
  set<T>(key: string, value: T): void;
  /** Remove a stored key. */
  remove(key: string): void;
  /**
   * Remove all keys that begin with `prefix`.
   * If no prefix is given, clears EVERYTHING — use with caution.
   */
  clear(prefix?: string): void;
}

// ── localStorage Implementation ───────────────────────────────────────────────

class LocalStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : null;
    } catch {
      // Corrupted JSON or SecurityError — treat as missing
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // QuotaExceededError or SecurityError — fail silently
    }
  }

  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  clear(prefix?: string): void {
    if (typeof window === "undefined") return;
    try {
      if (prefix === undefined) {
        localStorage.clear();
        return;
      }
      // Collect matching keys first to avoid mutation-during-iteration bugs
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== null && key.startsWith(prefix)) {
          toRemove.push(key);
        }
      }
      for (const key of toRemove) {
        localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
  }
}

// ── Singleton Export ───────────────────────────────────────────────────────────

/**
 * The active storage adapter singleton.
 * To switch backends: replace this with another StorageAdapter implementation.
 * All callers (`lib/grow/store`, hooks, etc.) automatically use the new backend.
 */
export const storage: StorageAdapter = new LocalStorageAdapter();

// ── Namespaced Storage Keys ────────────────────────────────────────────────────

/**
 * Central registry of all localStorage keys.
 * Versioned suffixes (`.v1`) enable future data migrations without conflicts.
 */
export const STORAGE_KEYS = {
  /** Array<Grow> — persisted grow sessions. */
  GROWS: "secretleaf.grows.v1",
  /** Array<LogEntry> — all log entries across all grows. */
  LOG_ENTRIES: "secretleaf.log.v1",
  /** string | null — ID of the currently active grow. */
  ACTIVE_GROW_ID: "secretleaf.active_grow_id.v1",
  /**
   * ToolStorageData — existing tool snapshots.
   * Key preserved for backward compatibility with `useToolState`.
   */
  TOOLS: "secretleaf.tools.v1",
  /** boolean — user dismissed the "save your grow" account nudge. */
  SAVE_GROW_BANNER_DISMISSED: "secretleaf.saveGrowBannerDismissed.v1",
} as const;

/** Derived type of all valid storage key strings. */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
