'use client';

import { useCallback, useEffect, useState } from 'react';

export const READING_PROGRESS_KEY = 'secretleaf.reading_progress';

export type ReadingProgressEntry = {
  slug: string;
  progress: number;
  updatedAt: string;
  lastSectionId?: string;
  title?: string;
  category?: string;
  readMinutes?: number;
};

type ReadingProgressMap = Record<string, ReadingProgressEntry>;

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function readProgress(): ReadingProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(READING_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as ReadingProgressMap) : {};
  } catch {
    return {};
  }
}

function writeProgress(entries: ReadingProgressMap): void {
  try {
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage failures.
  }
}

export function useReadingProgress() {
  const [progressMap, setProgressMap] = useState<ReadingProgressMap>(() => readProgress());

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === READING_PROGRESS_KEY) {
        setProgressMap(readProgress());
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const updateProgress = useCallback((entry: Omit<ReadingProgressEntry, 'updatedAt' | 'progress'> & { progress: number }) => {
    setProgressMap((previous) => {
      const normalizedProgress = clampProgress(entry.progress);
      if (normalizedProgress < 3 && !entry.lastSectionId && !previous[entry.slug]) {
        return previous;
      }

      const nextEntry: ReadingProgressEntry = {
        ...previous[entry.slug],
        ...entry,
        progress: normalizedProgress,
        updatedAt: new Date().toISOString(),
      };

      const next = {
        ...previous,
        [entry.slug]: nextEntry,
      };

      writeProgress(next);
      return next;
    });
  }, []);

  const getProgress = useCallback((slug: string) => progressMap[slug], [progressMap]);

  const clearProgress = useCallback(() => {
    writeProgress({});
    setProgressMap({});
  }, []);

  return {
    progressMap,
    progressEntries: Object.values(progressMap),
    updateProgress,
    getProgress,
    clearProgress,
  };
}