'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { TerpiraArticle, TerpiraCategory, TerpiraDifficulty } from '@/lib/terpira/types';
import StudyListItem from './StudyListItem';

// ─── Types ──────────────────────────────────────────────────────────────────

type SortMode = 'relevanz' | 'neueste' | 'kurz' | 'lang';

type Props = {
  articles: TerpiraArticle[];
  categoryLabels: Record<string, string>;
  /** Preset category filter (for category pages) */
  initialCategory?: TerpiraCategory;
  /** Hide category filter (for category pages) */
  hideCategoryFilter?: boolean;
  /** Page size for pagination */
  pageSize?: number;
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
  pageSize = 15,
}: Props) {
  const [category, setCategory] = useState<TerpiraCategory | 'alle'>(initialCategory ?? 'alle');
  const [difficulty, setDifficulty] = useState<TerpiraDifficulty | 'alle'>('alle');
  const [sort, setSort] = useState<SortMode>('relevanz');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [category, difficulty, sort, search]);

  type Result = { article: TerpiraArticle; score: number; snippet: string | null };

  const filtered = useMemo((): Result[] => {
    let list = [...articles];

    if (category !== 'alle') list = list.filter(a => a.category === category);
    if (difficulty !== 'alle') list = list.filter(a => a.difficulty === difficulty);

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
      default: list.sort((a, b) =>
        ORDERED_CATEGORIES.indexOf(a.category) - ORDERED_CATEGORIES.indexOf(b.category)
      );
    }

    return list.map(article => ({ article, score: 0, snippet: null }));
  }, [articles, category, difficulty, sort, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of articles) map[a.category] = (map[a.category] ?? 0) + 1;
    return map;
  }, [articles]);

  const hasFilters = category !== 'alle' || difficulty !== 'alle' || search.trim() !== '';

  return (
    <div className="space-y-6">
      {/* ── Filter bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Artikel suchen…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-[13.5px]
              text-slate-900 placeholder:text-slate-400 outline-none shadow-sm
              focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
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
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13.5px] text-slate-700
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
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13.5px] text-slate-700
            outline-none shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 cursor-pointer transition-all"
        >
          <option value="alle">Alle Level</option>
          <option value="einsteiger">Einsteiger</option>
          <option value="fortgeschritten">Fortgeschritten</option>
          <option value="profi">Profi</option>
        </select>

        {/* Sort */}
        {!search.trim() && (
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortMode)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13.5px] text-slate-700
              outline-none shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 cursor-pointer transition-all"
          >
            <option value="relevanz">Relevanz</option>
            <option value="neueste">Neueste zuerst</option>
            <option value="kurz">Kürzeste zuerst</option>
            <option value="lang">Längste zuerst</option>
          </select>
        )}

        {hasFilters && (
          <button
            onClick={() => { setCategory(initialCategory ?? 'alle'); setDifficulty('alle'); setSearch(''); setSort('relevanz'); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13.5px] font-medium text-slate-400
              hover:text-red-500 hover:border-red-200 shadow-sm transition-all"
          >
            Zurücksetzen
          </button>
        )}
      </div>

      {/* ── Result info ──────────────────────────────────────── */}
      <div className="flex items-center justify-between text-[13px] text-slate-400">
        <span>
          <span className="font-semibold text-slate-700">{filtered.length}</span>
          {' '}Artikel{hasFilters && ' gefunden'}
        </span>
        {totalPages > 1 && (
          <span className="text-slate-300">Seite {page} / {totalPages}</span>
        )}
      </div>

      {/* ── List ────────────────────────────────────────────── */}
      {paginated.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-100 bg-slate-50/50 py-16 text-center">
          <p className="text-sm font-medium text-slate-500">Keine Artikel gefunden.</p>
          <p className="mt-1 text-xs text-slate-400">Passe deine Filter oder Suche an.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden divide-y divide-slate-100">
          {paginated.map(({ article, snippet }) => (
            <StudyListItem
              key={article.slug}
              article={article}
              categoryLabel={categoryLabels[article.category] ?? article.category}
              snippet={snippet}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-600 disabled:opacity-30 hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-lg w-9 h-9 text-[13px] font-medium transition-all ${
                  p === page
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                {p}
              </button>
            );
          })}
          {totalPages > 7 && <span className="text-sm text-slate-300 px-1">…</span>}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-600 disabled:opacity-30 hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm"
          >
            Weiter
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
