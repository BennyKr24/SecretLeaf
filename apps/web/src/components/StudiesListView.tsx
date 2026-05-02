'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { TerpiraArticle, TerpiraCategory, TerpiraDifficulty } from '@/lib/terpira/types';
import StudyListItem from './StudyListItem';

// ─── Types ──────────────────────────────────────────────────────────────────

type SortMode = 'relevanz' | 'neueste' | 'kurz' | 'lang' | 'qualitaet';

type Props = {
  articles: TerpiraArticle[];
  categoryLabels: Record<string, string>;
  /** Preset category filter (for category pages) */
  initialCategory?: TerpiraCategory;
  /** Hide category filter (for category pages) */
  hideCategoryFilter?: boolean;
  /** Preset tag filter */
  initialTag?: string;
  /** Visible items per category section before "Mehr anzeigen" */
  sectionLimit?: number;
};

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

// ─── Category order ────────────────────────────────────────────────────────

const ORDERED_CATEGORIES: TerpiraCategory[] = [
  'anbau', 'genetik', 'chemie', 'terpene',
  'konsumformen', 'konzentrate', 'qualitaet',
  'sicherheit', 'medizin', 'recht', 'markt', 'werkzeuge',
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function StudiesListView({
  articles,
  categoryLabels,
  initialCategory,
  hideCategoryFilter = false,
  initialTag,
  sectionLimit = 6,
}: Props) {
  const [category, setCategory] = useState<TerpiraCategory | 'alle'>(initialCategory ?? 'alle');
  const [difficulty, setDifficulty] = useState<TerpiraDifficulty | 'alle'>('alle');
  const [sort, setSort] = useState<SortMode>('qualitaet');
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string>(initialTag ?? '');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setExpandedSections({});
  }, [category, difficulty, sort, search, activeTag]);

  type Result = { article: TerpiraArticle; score: number; snippet: string | null };

  // Derive the top tags from all articles for the tag cloud
  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) {
      for (const t of a.tags) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [articles]);

  const filtered = useMemo((): Result[] => {
    let list = [...articles];

    // Hide articles that have a qualityScore defined but below the minimum threshold
    list = list.filter(a => a.qualityScore === undefined || a.qualityScore >= 2);

    if (category !== 'alle') list = list.filter(a => a.category === category);
    if (difficulty !== 'alle') list = list.filter(a => a.difficulty === difficulty);
    if (activeTag) list = list.filter(a => a.tags.some(t => t.toLowerCase() === activeTag.toLowerCase()));

    if (search.trim()) {
      return list
        .map(article => ({ article, score: searchScore(article, search), snippet: searchSnippet(article, search) }))
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score);
    }

    switch (sort) {
      case 'neueste': list.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)); break;
      case 'kurz': list.sort((a, b) => a.readMinutes - b.readMinutes); break;
      case 'lang': list.sort((a, b) => b.readMinutes - a.readMinutes); break;
      case 'qualitaet': list.sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0)); break;
      default: list.sort((a, b) =>
        ORDERED_CATEGORIES.indexOf(a.category) - ORDERED_CATEGORIES.indexOf(b.category)
      );
    }

    return list.map(article => ({ article, score: 0, snippet: null }));
  }, [articles, category, difficulty, sort, search, activeTag]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of articles) map[a.category] = (map[a.category] ?? 0) + 1;
    return map;
  }, [articles]);

  const groupedResults = useMemo(() => {
    const grouped = new Map<TerpiraCategory, Result[]>();

    for (const result of filtered) {
      const cat = result.article.category;
      const list = grouped.get(cat) ?? [];
      list.push(result);
      grouped.set(cat, list);
    }

    return ORDERED_CATEGORIES
      .filter((cat) => (grouped.get(cat)?.length ?? 0) > 0)
      .map((cat) => ({
        category: cat,
        label: categoryLabels[cat] ?? cat,
        items: grouped.get(cat) ?? [],
      }));
  }, [filtered, categoryLabels]);

  const hasFilters = category !== 'alle' || difficulty !== 'alle' || search.trim() !== '' || activeTag !== '';
  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Filter bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Artikel suchen…"
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-8 text-[13.5px]
              text-foreground placeholder:text-muted-fg outline-none shadow-sm
              focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category */}
        {!hideCategoryFilter && (
          <select
            value={category}
            onChange={e => setCategory(e.target.value as TerpiraCategory | 'alle')}
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-[13.5px] text-foreground
              outline-none shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 cursor-pointer transition-all"
          >
            <option value="alle">Alle Kategorien</option>
            {ORDERED_CATEGORIES.filter(c => categoryCounts[c]).map(cat => (
              <option key={cat} value={cat}>{categoryLabels[cat] ?? cat} ({categoryCounts[cat]})</option>
            ))}
          </select>
        )}

        {/* Difficulty */}
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value as TerpiraDifficulty | 'alle')}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-[13.5px] text-foreground
            outline-none shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 cursor-pointer transition-all"
        >
          <option value="alle">Alle Schwierigkeitsstufen</option>
          <option value="einsteiger">Einsteiger</option>
          <option value="fortgeschritten">Fortgeschritten</option>
          <option value="profi">Profi</option>
        </select>

        {/* Sort */}
        {!search.trim() && (
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortMode)}
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-[13.5px] text-foreground
              outline-none shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 cursor-pointer transition-all"
          >
            <option value="relevanz">Relevanz</option>
            <option value="neueste">Neueste zuerst</option>
            <option value="kurz">Kürzeste zuerst</option>
            <option value="lang">Längste zuerst</option>
            <option value="qualitaet">Nach Qualität</option>
          </select>
        )}

        {hasFilters && (
          <button
            onClick={() => {
              setCategory(initialCategory ?? 'alle');
              setDifficulty('alle');
              setSearch('');
              setSort('qualitaet');
              setActiveTag(initialTag ?? '');
            }}
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-[13.5px] font-medium text-muted-fg
              hover:text-red-500 hover:border-red-300 shadow-sm transition-all"
          >
            Zurücksetzen
          </button>
        )}
      </div>

      {/* ── Tag cloud ────────────────────────────────────────── */}
      {topTags.length > 0 && !search.trim() && (
        <div className="flex flex-wrap gap-1.5">
          {topTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                activeTag === tag
                  ? 'border-emerald-400 bg-emerald-500 text-white shadow-sm'
                  : 'border-border bg-card text-muted-fg hover:border-emerald-300 hover:text-foreground'
              }`}
            >
              {tag}
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
        <span className="text-muted-fg">{groupedResults.length} Kategorien</span>
      </div>

      {/* ── Grouped sections ─────────────────────────────────── */}
      {groupedResults.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-background py-16 text-center">
          <p className="text-sm font-medium text-muted-fg">Keine Artikel gefunden.</p>
          <p className="mt-1 text-xs text-muted-fg">Passe deine Filter oder Suche an.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedResults.map((group) => {
            const isExpanded = Boolean(expandedSections[group.category]);
            const visibleItems = isExpanded ? group.items : group.items.slice(0, sectionLimit);
            const hiddenCount = Math.max(group.items.length - visibleItems.length, 0);

            return (
              <section key={group.category} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <header className="border-b border-border bg-background px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-fg">
                      {group.items.length} Artikel
                    </span>
                  </div>
                </header>

                <div className="divide-y divide-border">
                  {visibleItems.map(({ article, snippet }) => (
                    <StudyListItem
                      key={article.slug}
                      article={article}
                      categoryLabel={categoryLabels[article.category] ?? article.category}
                      snippet={snippet}
                    />
                  ))}
                </div>

                {group.items.length > sectionLimit && (
                  <div className="border-t border-border bg-card px-4 py-3 sm:px-5">
                    <button
                      onClick={() => toggleSection(group.category)}
                      className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      {isExpanded ? 'Weniger anzeigen' : `${hiddenCount} weitere anzeigen`}
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
