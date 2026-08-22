'use client';

import { useCallback, useState } from 'react';
import { Sprout, Stethoscope, Microscope, BookOpen, Dna, type LucideIcon } from 'lucide-react';

const STORAGE_KEY = 'secretleaf.interests';

export type Interest = 'grow' | 'medizin' | 'labor' | 'anfaenger' | 'fortgeschritten';

export const INTEREST_META: Record<Interest, { label: string; icon: LucideIcon; categories: string[] }> = {
  grow: {
    label: 'Grow',
    icon: Sprout,
    categories: ['anbau', 'diagnose', 'tutorials', 'chemie', 'genetik', 'werkzeuge'],
  },
  medizin: {
    label: 'Medizin',
    icon: Stethoscope,
    categories: ['medizin', 'terpene', 'qualitaet', 'sicherheit'],
  },
  labor: {
    label: 'Labor',
    icon: Microscope,
    categories: ['qualitaet', 'chemie', 'konzentrate', 'terpene'],
  },
  anfaenger: {
    label: 'Anfänger',
    icon: BookOpen,
    categories: ['sicherheit', 'anbau', 'tutorials', 'diagnose', 'recht', 'konsumformen'],
  },
  fortgeschritten: {
    label: 'Fortgeschritten',
    icon: Dna,
    categories: ['genetik', 'konzentrate', 'chemie', 'markt'],
  },
};

function readInterests(): Interest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Interest[]) : [];
  } catch {
    return [];
  }
}

function writeInterests(interests: Interest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(interests));
  } catch {
    // storage full or unavailable
  }
}

export function useInterests() {
  const [interests, setInterests] = useState<Interest[]>(() => readInterests());
  const [loaded] = useState(() => typeof window !== 'undefined');

  const toggle = useCallback((interest: Interest) => {
    setInterests(prev => {
      const next = prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest];
      writeInterests(next);
      return next;
    });
  }, []);

  const isActive = useCallback(
    (interest: Interest) => interests.includes(interest),
    [interests],
  );

  /**
   * Returns preferred categories derived from selected interests, in the order
   * interests were toggled (first-selected interest has highest priority).
   * Duplicate categories across interests are deduplicated while preserving
   * first-occurrence order, so the resulting feed prioritizes the user's
   * primary interest area.
   */
  const preferredCategories: string[] = [...new Set(interests.flatMap(i => INTEREST_META[i].categories))];

  return { interests, toggle, isActive, preferredCategories, loaded };
}
