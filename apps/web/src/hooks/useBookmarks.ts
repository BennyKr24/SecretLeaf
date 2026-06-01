'use client';

import { useCallback, useState } from 'react';

const STORAGE_KEY = 'secretleaf.bookmarks';

function readBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeBookmarks(slugs: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // storage full or unavailable
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => readBookmarks());

  const toggle = useCallback((slug: string) => {
    setBookmarks(prev => {
      const next = prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [slug, ...prev];
      writeBookmarks(next);
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (slug: string) => bookmarks.includes(slug),
    [bookmarks],
  );

  return { bookmarks, toggle, isBookmarked };
}
