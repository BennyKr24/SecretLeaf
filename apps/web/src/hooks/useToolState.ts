'use client';

import { useCallback, useRef, useState } from 'react';
import type { GrowSetup, ToolResultData, ToolSnapshot, ToolStorageData } from '@/lib/tools/types';

const STORAGE_KEY = 'secretleaf.tools.v1';
const MAX_HISTORY = 50;
const DEBOUNCE_MS = 600;

function readStorage(): ToolStorageData {
  if (typeof window === 'undefined') return { history: [], setupProfile: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ToolStorageData) : { history: [], setupProfile: {} };
  } catch {
    return { history: [], setupProfile: {} };
  }
}

function writeStorage(data: ToolStorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

type InputMap = Record<string, number | string | boolean>;

type UseToolStateOptions<T extends InputMap> = {
  slug: string;
  defaults: T;
  /** Keys from inputs that should sync to GrowSetup */
  setupKeys?: Array<keyof GrowSetup>;
};

export function useToolState<T extends InputMap>({ slug, defaults, setupKeys }: UseToolStateOptions<T>) {
  const [inputs, setInputsRaw] = useState<T>(() => {
    const storage = readStorage();
    const last = storage.history.find((s) => s.slug === slug);
    const merged = { ...defaults } as Record<string, number | string | boolean>;

    if (setupKeys) {
      const profile = storage.setupProfile;
      for (const key of setupKeys) {
        const k = key as string;
        if (k in profile && profile[k as keyof GrowSetup] !== undefined) {
          merged[k] = profile[k as keyof GrowSetup] as number | string | boolean;
        }
      }
    }

    if (last) {
      for (const [k, v] of Object.entries(last.inputs)) {
        if (k in defaults) {
          merged[k] = v;
        }
      }
    }

    return merged as T;
  });
  const [loaded] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setInput = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setInputsRaw((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Debounced auto-save
  const saveSnapshot = useCallback(
    (currentInputs: T, results: ToolResultData[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const storage = readStorage();
        const snapshot: ToolSnapshot = {
          slug,
          inputs: currentInputs as InputMap,
          results,
          savedAt: new Date().toISOString(),
        };

        // Update history (replace existing for this slug, then prepend)
        const filtered = storage.history.filter((s) => s.slug !== slug);
        storage.history = [snapshot, ...filtered].slice(0, MAX_HISTORY);

        // Sync shared setup fields
        if (setupKeys) {
          for (const key of setupKeys) {
            const k = key as string;
            if (k in currentInputs) {
              (storage.setupProfile as Record<string, unknown>)[k] = currentInputs[k];
            }
          }
        }

        writeStorage(storage);
      }, DEBOUNCE_MS);
    },
    [slug, setupKeys]
  );

  return { inputs, setInput, loaded, saveSnapshot };
}

// ── Utility functions for reading tool history ──────────────────────────────

export function getToolHistory(): ToolSnapshot[] {
  return readStorage().history;
}

export function getToolHistoryForSlug(slug: string): ToolSnapshot | undefined {
  return readStorage().history.find((s) => s.slug === slug);
}

export function getSetupProfile(): Partial<GrowSetup> {
  return readStorage().setupProfile;
}

export function getSetupCoverage(): Record<string, boolean> {
  const history = readStorage().history;
  const slugs = new Set(history.map((s) => s.slug));
  return {
    klima: slugs.has('abluft-rechner'),
    licht: slugs.has('licht-rechner'),
    naehrstoffe: slugs.has('naehrstoff-rechner'),
    ertrag: slugs.has('ertrags-schaetzer'),
  };
}
