'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { TerpiraArticle, TerpiraDifficulty, DiagnoseArea } from '@/lib/terpira/types';
import { DIAGNOSE_AREA_LABELS, DIAGNOSE_AREA_ICONS, DIAGNOSE_AREA_ORDER } from '@/lib/terpira/categoryIcons';
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown';
import StudyListItem from './StudyListItem';

// ─── Types ──────────────────────────────────────────────────────────────────

type SortMode = 'relevanz' | 'neueste' | 'kurz' | 'lang' | 'qualitaet';

type Props = {
  /** Articles already scoped to one category by the caller (a /category/[slug] page). */
  articles: TerpiraArticle[];
  /** Human label of that category, used in empty-state copy. */
  categoryLabel: string;
  /** Show the symptom-area facet (Blätter/Wachstum & Wurzeln/Klima & Umgebung/Schädlinge) — only meaningful for "diagnose". */
  showDiagnoseAreaFacet?: boolean;
};

const DIFFICULTIES: TerpiraDifficulty[] = ['einsteiger', 'fortgeschritten', 'profi'];
const DIFFICULTY_LABELS: Record<TerpiraDifficulty, string> = {
  einsteiger: 'Einsteiger',
  fortgeschritten: 'Fortgeschritten',
  profi: 'Profi',
};

const INITIAL_VISIBLE = 12;

// ─── Search helpers ─────────────────────────────────────────────────────────

const UMLAUT: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss', Ä: 'ae', Ö: 'oe', Ü: 'ue' };
function norm(s: string): string {
  return s.toLowerCase().replace(/[äöüßÄÖÜ]/g, c => UMLAUT[c] ?? c).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function searchScore(article: TerpiraArticle, query: string): number {
  if (!query.trim()) return 1;
  const q = norm(query);
  let score = 0;
  if (norm(article.title).includes(q)) score += 10;
  if (article.tags.some(t => norm(t).includes(q))) score += 6;
  if (norm(article.summary).includes(q)) score += 4;
  if (article.keyTakeaways.some(k => norm(k).includes(q))) score += 2;
  const tokens = q.split(' ').filter(t => t.length >= 3);
  for (const t of tokens) {
    if (norm(article.title).includes(t)) score += 3;
    if (norm(article.summary).includes(t)) score += 1;
  }
  return score;
}

function searchSnippet(article: TerpiraArticle, query: string): string | null {
  const tokens = norm(query).split(' ').filter(t => t.length >= 3);
  if (tokens.length === 0) return null;
  const candidates = [
    article.summary,
    ...article.keyTakeaways,
    ...article.sections.flatMap(s => [s.heading, ...s.content]),
  ];
  for (const part of candidates) {
    if (tokens.some(t => norm(part).includes(t))) return part;
  }
  return article.summary;
}

// ─── URL <-> filter state helpers ───────────────────────────────────────────

function parseCsv(value: string | null): Set<string> {
  return new Set((value ?? '').split(',').filter(Boolean));
}
function toCsv(set: Set<string>): string {
  return [...set].join(',');
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function StudiesListView({ articles, categoryLabel, showDiagnoseAreaFacet = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [difficulties, setDifficulties] = useState<Set<TerpiraDifficulty>>(
    () => parseCsv(searchParams.get('diff')) as Set<TerpiraDifficulty>
  );
  const [tags, setTags] = useState<Set<string>>(() => parseCsv(searchParams.get('tags')));
  const [areas, setAreas] = useState<Set<DiagnoseArea>>(
    () => parseCsv(searchParams.get('areas')) as Set<DiagnoseArea>
  );
  const [sort, setSort] = useState<SortMode>((searchParams.get('sort') as SortMode) ?? 'qualitaet');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const searchRef = useRef<HTMLInputElement>(null);

  // Reset the "show more" pagination whenever the active filters change.
  // Adjusted during render (React's documented pattern for this) rather
  // than in an Effect, which would cause an extra cascading render.
  const filterKey = `${search}|${toCsv(difficulties)}|${toCsv(tags)}|${toCsv(areas)}|${sort}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(INITIAL_VISIBLE);
  }

  // Reflect filter state into the URL (shareable, bookmarkable, back-button friendly)
  // without a hard navigation. Debounced on `search` to avoid a history entry per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (difficulties.size) params.set('diff', toCsv(difficulties));
      if (tags.size) params.set('tags', toCsv(tags));
      if (areas.size) params.set('areas', toCsv(areas));
      if (sort !== 'qualitaet') params.set('sort', sort);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, search ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, difficulties, tags, areas, sort]);

  type Result = { article: TerpiraArticle; score: number; snippet: string | null };

  // Derive the top tags from all articles in this category for the tag facet
  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) {
      for (const t of a.tags) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag, count]) => ({ tag, count }));
  }, [articles]);

  // Live counts per difficulty and area, computed against the *other* active
  // filters (not itself) so a facet always shows what selecting it would add.
  const baseFiltered = useMemo(() => {
    let list = articles.filter(a => a.qualityScore === undefined || a.qualityScore >= 2);
    if (tags.size) list = list.filter(a => a.tags.some(t => tags.has(t)));
    return list;
  }, [articles, tags]);

  const difficultyCounts = useMemo(() => {
    const map: Partial<Record<TerpiraDifficulty, number>> = {};
    for (const a of baseFiltered) {
      if (areas.size && showDiagnoseAreaFacet && !(a.diagnoseAreas ?? []).some(ar => areas.has(ar))) continue;
      map[a.difficulty] = (map[a.difficulty] ?? 0) + 1;
    }
    return map;
  }, [baseFiltered, areas, showDiagnoseAreaFacet]);

  const areaCounts = useMemo(() => {
    const map: Partial<Record<DiagnoseArea, number>> = {};
    if (!showDiagnoseAreaFacet) return map;
    for (const a of baseFiltered) {
      if (difficulties.size && !difficulties.has(a.difficulty)) continue;
      for (const ar of a.diagnoseAreas ?? []) {
        map[ar] = (map[ar] ?? 0) + 1;
      }
    }
    return map;
  }, [baseFiltered, difficulties, showDiagnoseAreaFacet]);

  const filtered = useMemo((): Result[] => {
    let list = baseFiltered;
    if (difficulties.size) list = list.filter(a => difficulties.has(a.difficulty));
    if (showDiagnoseAreaFacet && areas.size) {
      list = list.filter(a => (a.diagnoseAreas ?? []).some(ar => areas.has(ar)));
    }

    if (search.trim()) {
      return list
        .map(article => ({ article, score: searchScore(article, search), snippet: searchSnippet(article, search) }))
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score);
    }

    const sorted = [...list];
    switch (sort) {
      case 'neueste': sorted.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)); break;
      case 'kurz': sorted.sort((a, b) => a.readMinutes - b.readMinutes); break;
      case 'lang': sorted.sort((a, b) => b.readMinutes - a.readMinutes); break;
      default: sorted.sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0));
    }
    return sorted.map(article => ({ article, score: 0, snippet: null }));
  }, [baseFiltered, difficulties, areas, showDiagnoseAreaFacet, search, sort]);

  const hasFilters = difficulties.size > 0 || tags.size > 0 || areas.size > 0 || search.trim() !== '';
  const visible = filtered.slice(0, visibleCount);
  const hiddenCount = Math.max(filtered.length - visible.length, 0);

  const toggleInSet = useCallback(<T,>(set: Set<T>, value: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value); else next.add(value);
    setter(next);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch('');
    setDifficulties(new Set());
    setTags(new Set());
    setAreas(new Set());
    setSort('qualitaet');
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Search + sort ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`In ${categoryLabel} suchen…`}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-8 text-[13.5px]
              text-foreground placeholder:text-muted-fg outline-none shadow-sm
              focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-[border-color,box-shadow]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground transition-[color,transform] duration-150 active:scale-90">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {!search.trim() && (
          <Dropdown value={sort} onChange={(v) => setSort(v as SortMode)}>
            <DropdownOption value="qualitaet">Nach Qualität</DropdownOption>
            <DropdownOption value="neueste">Neueste zuerst</DropdownOption>
            <DropdownOption value="kurz">Kürzeste zuerst</DropdownOption>
            <DropdownOption value="lang">Längste zuerst</DropdownOption>
          </Dropdown>
        )}

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-[13.5px] font-medium text-muted-fg
              hover:text-red-500 hover:border-red-300 shadow-sm transition-[color,border-color,transform] duration-150 active:scale-[0.97]"
          >
            Zurücksetzen
          </button>
        )}
      </div>

      {/* ── Symptom-area facet (diagnose only) ──────────────────── */}
      {showDiagnoseAreaFacet && (
        <div className="flex flex-wrap gap-1.5">
          {DIAGNOSE_AREA_ORDER.map((area) => {
            const Icon = DIAGNOSE_AREA_ICONS[area];
            const count = areaCounts[area] ?? 0;
            const active = areas.has(area);
            return (
              <button
                key={area}
                onClick={() => toggleInSet(areas, area, setAreas)}
                disabled={count === 0 && !active}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-[border-color,background-color,color,box-shadow,transform] duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${
                  active
                    ? 'border-red-400 bg-red-500 text-white shadow-sm'
                    : 'border-border bg-card text-muted-fg hover:border-red-300 hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                {DIAGNOSE_AREA_LABELS[area]}
                <span className={active ? 'text-white/80' : 'text-muted-fg'}>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Difficulty facet ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {DIFFICULTIES.map((diff) => {
          const count = difficultyCounts[diff] ?? 0;
          const active = difficulties.has(diff);
          return (
            <button
              key={diff}
              onClick={() => toggleInSet(difficulties, diff, setDifficulties)}
              disabled={count === 0 && !active}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-[border-color,background-color,color,box-shadow,transform] duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${
                active
                  ? 'border-emerald-400 bg-emerald-500 text-white shadow-sm'
                  : 'border-border bg-card text-muted-fg hover:border-emerald-300 hover:text-foreground'
              }`}
            >
              {DIFFICULTY_LABELS[diff]} <span className={active ? 'text-white/80' : 'text-muted-fg'}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* ── Tag facet ────────────────────────────────────────── */}
      {topTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topTags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => toggleInSet(tags, tag, setTags)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-[border-color,background-color,color,box-shadow,transform] duration-150 active:scale-[0.97] ${
                tags.has(tag)
                  ? 'border-sky-400 bg-sky-500 text-white shadow-sm'
                  : 'border-border bg-card text-muted-fg hover:border-sky-300 hover:text-foreground'
              }`}
            >
              {tag} <span className={tags.has(tag) ? 'text-white/80' : 'text-muted-fg'}>({count})</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Result info ──────────────────────────────────────── */}
      <div className="flex items-center justify-between text-[13px] text-muted-fg">
        <span>
          <span className="font-semibold text-foreground">{filtered.length}</span>
          {' '}Artikel{hasFilters && ' gefunden'}
        </span>
      </div>

      {/* ── Flat result list ─────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-background py-16 text-center">
          <p className="text-sm font-medium text-muted-fg">Keine Artikel gefunden.</p>
          <p className="mt-1 text-xs text-muted-fg">Passe deine Filter oder Suche an.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="divide-y divide-border">
            {visible.map(({ article, snippet }) => (
              <StudyListItem
                key={article.slug}
                article={article}
                categoryLabel={categoryLabel}
                snippet={snippet}
              />
            ))}
          </div>

          {hiddenCount > 0 && (
            <div className="border-t border-border bg-background px-4 py-3 sm:px-5">
              <button
                onClick={() => setVisibleCount(c => c + 12)}
                className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-[background-color,transform] duration-150 active:scale-[0.97]"
              >
                {hiddenCount} weitere anzeigen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
