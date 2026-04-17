'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'secretleaf.history';
const MAX_HISTORY = 20;

export type HistoryEntry = {
  slug: string;
  title: string;
  category: string;
  readAt: string; // ISO date string
};

function readHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable
  }
}

export function useReadingHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'readAt'>) => {
    setHistory(prev => {
      const filtered = prev.filter(e => e.slug !== entry.slug);
      const next = [{ ...entry, readAt: new Date().toISOString() }, ...filtered].slice(0, MAX_HISTORY);
      writeHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    writeHistory([]);
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
