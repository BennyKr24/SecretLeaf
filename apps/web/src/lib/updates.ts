/**
 * updates.ts
 *
 * Typen, Datenzugriff und Badge-Klassen für das SecretLeaf Updates-System.
 *
 * Quelle der Wahrheit ist die `updates`-Tabelle (bearbeitbar unter
 * /dashboard/admin/changelog). `src/data/updates.json` bleibt als
 * Build-/Fallback-Datenquelle, falls die DB leer oder nicht erreichbar ist
 * (z. B. während `next build` ohne DB-Zugriff).
 */

import updatesJson from '@/data/updates.json';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

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

type UpdatesJsonShape = {
  categoryMeta: Record<string, CategoryMeta>;
  updates: UpdateEntry[];
};

// ── Badge color map ───────────────────────────────────────────────────────────
// Tailwind-Klassen müssen hier stehen (nicht in der DB) damit Purging funktioniert.

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

const BADGE_FALLBACK = 'bg-white/5 text-white/50 border-white/10';

// ── Category meta (config, nicht in der DB) ───────────────────────────────────

const json = updatesJson as UpdatesJsonShape;

export function getCategoryMeta(): Record<string, CategoryMeta> {
  return json.categoryMeta;
}

export function getCategoryMetaFor(category: string): CategoryMeta {
  return json.categoryMeta[category] ?? { label: category, color: 'default' };
}

export function getBadgeClasses(category: string): string {
  const meta = getCategoryMetaFor(category);
  return BADGE_COLORS[meta.color] ?? BADGE_FALLBACK;
}

export function formatUpdateDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Data access ──────────────────────────────────────────────────────────────

type UpdateRow = {
  slug: string;
  version: string | null;
  date: string;
  title: string;
  summary: string;
  category: string;
  featured: boolean;
  sections: UpdateSections | null;
  stats: Record<string, string | number> | null;
  cta: UpdateCta | null;
};

const mapRow = (r: UpdateRow): UpdateEntry => ({
  slug: r.slug,
  version: r.version,
  date: typeof r.date === 'string' ? r.date.slice(0, 10) : r.date,
  title: r.title,
  summary: r.summary,
  category: r.category,
  featured: r.featured,
  sections: r.sections ?? {},
  ...(r.stats ? { stats: r.stats } : {}),
  ...(r.cta ? { cta: r.cta } : {}),
});

const jsonUpdates = (): UpdateEntry[] =>
  [...json.updates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

/** All published updates, newest first. DB-backed, JSON fallback. */
export async function getAllUpdates(): Promise<UpdateEntry[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('updates')
      .select('slug, version, date, title, summary, category, featured, sections, stats, cta')
      .eq('published', true)
      .order('date', { ascending: false });
    if (error || !data || data.length === 0) return jsonUpdates();
    return (data as UpdateRow[]).map(mapRow);
  } catch {
    return jsonUpdates();
  }
}

export type SiteBannerEntry = {
  slug: string;
  title: string;
  summary: string;
  cta: UpdateCta | null;
};

/** The currently active site-wide banner (`banner = true`, published, inside
 *  its time window), or null. DB-only — no JSON fallback, since the banner
 *  is a live "right now" signal, not changelog content that needs to survive
 *  a DB outage. */
export async function getActiveBanner(): Promise<SiteBannerEntry | null> {
  try {
    const supabase = getSupabaseServerClient();
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('updates')
      .select('slug, title, summary, cta')
      .eq('banner', true)
      .eq('published', true)
      .or(`banner_starts_at.is.null,banner_starts_at.lte.${nowIso}`)
      .or(`banner_ends_at.is.null,banner_ends_at.gte.${nowIso}`)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return { slug: data.slug, title: data.title, summary: data.summary, cta: data.cta ?? null };
  } catch {
    return null;
  }
}

export async function getUpdateBySlug(slug: string): Promise<UpdateEntry | undefined> {
  const all = await getAllUpdates();
  return all.find((u) => u.slug === slug);
}

export async function getFeaturedUpdate(): Promise<UpdateEntry | undefined> {
  const all = await getAllUpdates();
  return all.find((u) => u.featured);
}

export async function getUpdatesByCategory(category: string): Promise<UpdateEntry[]> {
  const all = await getAllUpdates();
  return all.filter((u) => u.category === category);
}

export async function getAvailableCategories(): Promise<string[]> {
  const all = await getAllUpdates();
  return [...new Set(all.map((u) => u.category))];
}

/** Slugs for generateStaticParams — JSON only, so the build never needs the DB.
 *  New DB-only slugs render on demand (`dynamicParams = true`). */
export function getAllUpdateSlugs(): string[] {
  return json.updates.map((u) => u.slug);
}
