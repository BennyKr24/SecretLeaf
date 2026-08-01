/**
 * updates.ts
 *
 * Typen, Datenzugriff und Badge-Klassen für das SecretLeaf Updates-System.
 * Quelle der Wahrheit: apps/web/src/data/updates.json
 */

import updatesJson from '@/data/updates.json';

// ── Types ─────────────────────────────────────────────────────────────────────

export type UpdateSection = {
  headline: string;
  body: string;
  items?: string[];
};

export type UpdateDatenbankSection = {
  headline: string;
  body: string;
  counts?: Record<string, number | string>;
};

export type UpdateSections = {
  neu?: UpdateSection[];
  verbessert?: UpdateSection[];
  datenbank?: UpdateDatenbankSection;
  diagnose?: UpdateSection[];
  performance?: string[];
  fixes?: string[];
  nextSteps?: string[];
};

export type UpdateCta = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

export type UpdateEntry = {
  slug: string;
  version: string | null;
  date: string;
  title: string;
  summary: string;
  category: string;
  featured: boolean;
  sections: UpdateSections;
  stats?: Record<string, string | number>;
  cta?: UpdateCta;
};

export type CategoryMeta = {
  label: string;
  color: string;
};

export type UpdatesData = {
  categoryMeta: Record<string, CategoryMeta>;
  updates: UpdateEntry[];
};

// ── Badge color map ───────────────────────────────────────────────────────────
// Tailwind-Klassen müssen hier stehen (nicht im JSON) damit Purging korrekt funktioniert.
// Neue Farben hier ergänzen; JSON referenziert nur den Schlüssel.

export const BADGE_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  violet:  'bg-violet-500/10  text-violet-400  border-violet-500/20',
  blue:    'bg-blue-500/10    text-blue-400    border-blue-500/20',
  cyan:    'bg-cyan-500/10    text-cyan-400    border-cyan-500/20',
  amber:   'bg-amber-500/10   text-amber-400   border-amber-500/20',
  rose:    'bg-rose-500/10    text-rose-400    border-rose-500/20',
  orange:  'bg-orange-500/10  text-orange-400  border-orange-500/20',
  default: 'bg-white/5        text-white/50    border-white/10',
};

// ── Data access ───────────────────────────────────────────────────────────────

const data = updatesJson as UpdatesData;

/** Alle Updates, neueste zuerst. */
export function getAllUpdates(): UpdateEntry[] {
  return [...data.updates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

/** Ein Update anhand seines Slugs. */
export function getUpdateBySlug(slug: string): UpdateEntry | undefined {
  return data.updates.find((u) => u.slug === slug);
}

/** Das als featured markierte Update (maximal eines). */
export function getFeaturedUpdate(): UpdateEntry | undefined {
  return data.updates.find((u) => u.featured);
}

/** Updates gefiltert nach Kategorie, neueste zuerst. */
export function getUpdatesByCategory(category: string): UpdateEntry[] {
  return getAllUpdates().filter((u) => u.category === category);
}

/** Alle Kategorie-Metadaten aus dem JSON. */
export function getCategoryMeta(): Record<string, CategoryMeta> {
  return data.categoryMeta;
}

/** Kategorie-Metadaten für eine einzelne Kategorie, mit Fallback. */
export function getCategoryMetaFor(category: string): CategoryMeta {
  return data.categoryMeta[category] ?? { label: category, color: 'default' };
}

const BADGE_FALLBACK = 'bg-white/5 text-white/50 border-white/10';

/** Badge-Klassen für eine Kategorie. */
export function getBadgeClasses(category: string): string {
  const meta = getCategoryMetaFor(category);
  return BADGE_COLORS[meta.color] ?? BADGE_FALLBACK;
}

/** Slugs aller Updates — für generateStaticParams. */
export function getAllUpdateSlugs(): string[] {
  return data.updates.map((u) => u.slug);
}

/** Alle vorhandenen Kategorien (unique, aus den Daten abgeleitet). */
export function getAvailableCategories(): string[] {
  return [...new Set(getAllUpdates().map((u) => u.category))];
}

/** Datum im deutschen Langformat: "1. Juni 2026". */
export function formatUpdateDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
