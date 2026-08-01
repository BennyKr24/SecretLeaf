'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { TerpiraArticle, TerpiraCategory, TerpiraDifficulty } from '@/lib/terpira/types';

// ─── Typen & Konfiguration ───────────────────────────────────────────────────

type Props = {
  articles: TerpiraArticle[];
  categoryLabels: Record<string, string>;
  difficultyLabels: Record<string, string>;
  totalSources: number;
};

type SortMode = 'relevanz' | 'neueste' | 'kurz' | 'lang';
type SearchResult = { article: TerpiraArticle; score: number; snippet: string | null };

const BOOKMARKS_KEY = 'secretleaf:wiki:bookmarks';
const RECENT_KEY = 'secretleaf:wiki:recent';
const PROGRESS_KEY = 'secretleaf:wiki:progress';

const DIFFICULTY_META: Record<TerpiraDifficulty, { label: string; color: string; bg: string; ring: string }> = {
  einsteiger:    { label: 'Einsteiger',    color: 'text-blue-700',   bg: 'bg-blue-100',   ring: 'ring-blue-300' },
  fortgeschritten: { label: 'Fortgeschritten', color: 'text-amber-700', bg: 'bg-amber-100', ring: 'ring-amber-300' },
  profi:         { label: 'Profi',         color: 'text-purple-700', bg: 'bg-purple-100', ring: 'ring-purple-300' },
};

const CATEGORY_ICONS: Record<string, string> = {
  anbau: '🌱', genetik: '🧬', chemie: '⚗️', terpene: '🌺',
  medizin: '🩺', konsumformen: '💨', konzentrate: '💎', recht: '⚖️',
  sicherheit: '🛡️', qualitaet: '🔬', markt: '📊', werkzeuge: '🛠️',
};

const ORDERED_CATEGORIES: TerpiraCategory[] = [
  'anbau', 'genetik', 'chemie', 'terpene',
  'konsumformen', 'konzentrate', 'qualitaet',
  'sicherheit', 'medizin', 'recht', 'markt', 'werkzeuge',
];

function evidenceMeta(sourceCount: number) {
  if (sourceCount >= 5) {
    return {
      label: 'Hohe Evidenz',
      cls: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }
  if (sourceCount >= 3) {
    return {
      label: 'Mittlere Evidenz',
      cls: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    };
  }
  if (sourceCount >= 1) {
    return {
      label: 'Grundlagenartikel',
      cls: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }
  return {
    label: 'Redaktionell',
    cls: 'border-border bg-border text-foreground/80',
  };
}

// ─── Mini-Suche (client-side, kein API) ──────────────────────────────────────

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
  // Token-Teilmatch
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
    const np = norm(part);
    if (tokens.some(t => np.includes(t))) {
      return part;
    }
  }

  return article.summary;
}

// ─── Artikel-Karte ────────────────────────────────────────────────────────────

function ArticleCard({ article, categoryLabel, isNew, isBookmarked, onToggleBookmark, onOpen, snippet, progressPct }: {
  article: TerpiraArticle;
  categoryLabel: string;
  isNew: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (slug: string) => void;
  onOpen: (slug: string) => void;
  snippet?: string | null;
  progressPct: number;
}) {
  const diff = DIFFICULTY_META[article.difficulty];
  const sourceCount = article.sourceIds?.length ?? 0;
  const evidence = evidenceMeta(sourceCount);

  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-card
      shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 overflow-hidden">
      {/* Kategorie-Farbleiste */}
      <div className="h-1 w-full bg-gradient-to-r from-primary to-emerald-400" />

      <div className="flex-1 flex flex-col p-5">
        {/* Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{CATEGORY_ICONS[article.category] ?? '📄'}</span>
            <span className="text-xs font-medium text-muted-fg">{categoryLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={isBookmarked ? 'Aus Merkliste entfernen' : 'Zur Merkliste hinzufügen'}
              onClick={() => onToggleBookmark(article.slug)}
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-all
                ${isBookmarked
                  ? 'border-amber-300 bg-amber-100 text-amber-700'
                  : 'border-border bg-card text-muted-fg hover:border-amber-200 hover:text-amber-600'
                }`}
            >
              {isBookmarked ? '★' : '☆'}
            </button>
            {isNew && (
              <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Neu
              </span>
            )}
            {diff && (
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${diff.color} ${diff.bg}`}>
                {diff.label}
              </span>
            )}
          </div>
        </div>

        {/* Titel & Summary */}
        <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-muted-fg line-clamp-2 flex-1">
          {article.summary}
        </p>

        {snippet && (
          <p className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-2 text-xs text-emerald-900 line-clamp-2">
            Treffer: {snippet}
          </p>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map(tag => (
              <span key={tag} className="rounded-md bg-border px-2 py-0.5 text-xs text-foreground/80">
                {tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="rounded-md bg-border px-2 py-0.5 text-xs text-muted-fg">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Key Takeaways */}
        <ul className="mt-3 space-y-1">
          {article.keyTakeaways.slice(0, 2).map(kp => (
            <li key={kp} className="flex items-start gap-1.5 text-xs text-foreground/80">
              <span className="text-emerald-500 flex-shrink-0 mt-0.5 font-bold">•</span>
              <span className="line-clamp-1">{kp}</span>
            </li>
          ))}
        </ul>

        {progressPct > 0 && (
          <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-2">
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
              <span>Lesefortschritt</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-emerald-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3 bg-background/50">
        <div className="flex items-center gap-3 text-xs text-muted-fg">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {article.readMinutes} Min
          </span>
          {article.sourceIds && article.sourceIds.length > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {article.sourceIds.length} Quellen
            </span>
          )}
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${evidence.cls}`}>
            {evidence.label}
          </span>
        </div>
        <Link
          href={`/studies/${article.slug}` as Route}
          onClick={() => onOpen(article.slug)}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5
            text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          {progressPct >= 10 && progressPct < 100 ? 'Weiterlesen' : 'Lesen'}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

// ─── WikiHubClient ────────────────────────────────────────────────────────────

export default function WikiHubClient({ articles, categoryLabels, totalSources }: Props) {
  const [activeCategory, setActiveCategory] = useState<TerpiraCategory | 'alle'>('alle');
  const [activeDifficulty, setActiveDifficulty] = useState<TerpiraDifficulty | 'alle'>('alle');
  const [freshOnly, setFreshOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>('relevanz');
  const [localSearch, setLocalSearch] = useState('');
  // Start empty (matches SSR) and load the real localStorage-backed values
  // after mount — reading them in the useState initializer would make the
  // first client render diverge from the server-rendered HTML.
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [progressBySlug, setProgressBySlug] = useState<Record<string, number>>({});

  // Deliberate mount-only sync from localStorage (client-only source) to
  // avoid a hydration mismatch — see comment on the initializers above.
  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks) as string[]);
    } catch {
      // ignore
    }
    try {
      const storedRecent = localStorage.getItem(RECENT_KEY);
      if (storedRecent) setRecent(JSON.parse(storedRecent) as string[]);
    } catch {
      // ignore
    }
    try {
      const storedProgress = localStorage.getItem(PROGRESS_KEY);
      if (storedProgress) setProgressBySlug(JSON.parse(storedProgress) as Record<string, number>);
    } catch {
      // ignore
    }
  }, []);
  const searchRef = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  function persist(key: string, value: string[]) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function toggleBookmark(slug: string) {
    setBookmarks(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [slug, ...prev].slice(0, 60);
      persist(BOOKMARKS_KEY, next);
      return next;
    });
  }

  function markOpened(slug: string) {
    setRecent(prev => {
      const next = [slug, ...prev.filter(s => s !== slug)].slice(0, 20);
      persist(RECENT_KEY, next);
      return next;
    });
  }

  // Strg+F or / opens local search
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if ((e.ctrlKey && e.key === 'f') || e.key === '/') {
        if (document.activeElement === searchRef.current) return;
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Aktuelle Datum für "Neu"-Badge (letzte 30 Tage)
  const recentThreshold = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  }, []);

  const weeklyThreshold = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }, []);

  // Gefilterte + sortierte Artikel
  const filtered = useMemo((): SearchResult[] => {
    let list = [...articles];

    // Kategorie-Filter
    if (activeCategory !== 'alle') {
      list = list.filter(a => a.category === activeCategory);
    }

    // Schwierigkeits-Filter
    if (activeDifficulty !== 'alle') {
      list = list.filter(a => a.difficulty === activeDifficulty);
    }

    if (freshOnly) {
      list = list.filter(a => a.lastUpdated >= weeklyThreshold);
    }

    // Suche
    if (localSearch.trim()) {
      return list
        .map(article => ({
          article,
          score: searchScore(article, localSearch),
          snippet: searchSnippet(article, localSearch),
        }))
        .filter(({ score }) => score > 0)
        .sort((x, y) => y.score - x.score);
    }

    {
      // Sortierung
      switch (sort) {
        case 'neueste':
          list.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
          break;
        case 'kurz':
          list.sort((a, b) => a.readMinutes - b.readMinutes);
          break;
        case 'lang':
          list.sort((a, b) => b.readMinutes - a.readMinutes);
          break;
        default:
          // Standard: nach Kategorie-Reihenfolge
          list.sort((a, b) =>
            ORDERED_CATEGORIES.indexOf(a.category as TerpiraCategory) -
            ORDERED_CATEGORIES.indexOf(b.category as TerpiraCategory)
          );
      }
    }

    return list.map(article => ({ article, score: 0, snippet: null }));
  }, [articles, activeCategory, activeDifficulty, freshOnly, sort, localSearch, weeklyThreshold]);

  const hasFilters = activeCategory !== 'alle' || activeDifficulty !== 'alle' || freshOnly || localSearch.trim() !== '';

  function resetFilters() {
    setActiveCategory('alle');
    setActiveDifficulty('alle');
    setFreshOnly(false);
    setLocalSearch('');
    setSort('relevanz');
  }

  // Counts pro Kategorie
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of articles) {
      map[a.category] = (map[a.category] ?? 0) + 1;
    }
    return map;
  }, [articles]);

  const bookmarkedArticles = useMemo(
    () => bookmarks.map(slug => articles.find(a => a.slug === slug)).filter((a): a is TerpiraArticle => Boolean(a)),
    [bookmarks, articles]
  );

  const recentArticles = useMemo(
    () => recent.map(slug => articles.find(a => a.slug === slug)).filter((a): a is TerpiraArticle => Boolean(a)),
    [recent, articles]
  );

  const noResultSuggestions = useMemo(() => {
    if (filtered.length > 0 || !localSearch.trim()) return [] as string[];
    const q = norm(localSearch);
    const categoryHints = Object.entries(categoryLabels)
      .map(([, label]) => label)
      .filter(label => norm(label).includes(q) || q.includes(norm(label).split(' ')[0] ?? ''));
    const tagHints = articles
      .flatMap(a => a.tags)
      .filter((tag, idx, arr) => arr.indexOf(tag) === idx)
      .filter(tag => norm(tag).includes(q) || q.includes(norm(tag)));
    const baseline = ['VPD', 'COA', 'Terpene', 'Sicherheit', 'Recht'];
    return [...categoryHints, ...tagHints, ...baseline].slice(0, 6);
  }, [filtered.length, localSearch, categoryLabels, articles]);

  // Stats
  const totalMinutes = articles.reduce((s, a) => s + a.readMinutes, 0);
  const einsteiger = articles.filter(a => a.difficulty === 'einsteiger').length;
  const profi = articles.filter(a => a.difficulty === 'profi').length;

  return (
    <div className="space-y-8">
      {/* ── Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Artikel', value: articles.length, sub: 'verfügbar', accent: false },
          { label: 'Kategorien', value: ORDERED_CATEGORIES.filter(c => categoryCounts[c]).length, sub: 'Gebiete', accent: false },
          { label: 'Quellen', value: totalSources, sub: 'peer-reviewed', accent: true, cls: 'border-cyan-200 bg-cyan-50/60' },
          { label: 'Lesezeit', value: `${totalMinutes}m`, sub: 'gesamt', accent: false },
          { label: 'Einsteiger', value: einsteiger, sub: 'Artikel', accent: false, cls: 'border-blue-200 bg-blue-50/40' },
          { label: 'Profi', value: profi, sub: 'Artikel', accent: false, cls: 'border-purple-200 bg-purple-50/40' },
        ].map(stat => (
          <div key={stat.label}
            className={`rounded-2xl border p-4 shadow-sm ${stat.cls ?? 'border-border bg-card'}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-fg">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Suchzeile ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="Wiki durchsuchen… (/ oder Strg+F)"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-10 text-sm
              text-foreground placeholder:text-muted-fg outline-none
              focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all shadow-sm"
          />
          {localSearch && (
            <button onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground/80">
              ✕
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        {!localSearch.trim() && (
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortMode)}
            className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground
              outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 shadow-sm cursor-pointer"
          >
            <option value="relevanz">Standard</option>
            <option value="neueste">Neueste zuerst</option>
            <option value="kurz">Kurze zuerst</option>
            <option value="lang">Lange zuerst</option>
          </select>
        )}

        {hasFilters && (
          <button onClick={resetFilters}
            className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm
              text-foreground/80 hover:text-red-600 hover:border-red-200 transition-all shadow-sm">
            Zurücksetzen
          </button>
        )}
      </div>

      {/* ── Schnellfilter ─────────────────────────────────────── */}
      {/* ── Persönliche Bereiche ───────────────────────────────── */}
      {(recentArticles.length > 0 || bookmarkedArticles.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {recentArticles.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">Zuletzt gelesen</p>
              <div className="mt-2 space-y-2">
                {recentArticles.slice(0, 4).map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/studies/${entry.slug}` as Route}
                    className="block rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground/80 hover:border-emerald-200 hover:text-emerald-700 transition-all"
                  >
                    {entry.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {bookmarkedArticles.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Merkliste</p>
              <div className="mt-2 space-y-2">
                {bookmarkedArticles.slice(0, 4).map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/studies/${entry.slug}` as Route}
                    className="block rounded-lg border border-amber-100 bg-card px-3 py-2 text-sm text-foreground/80 hover:border-amber-300 hover:text-amber-800 transition-all"
                  >
                    {entry.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Kategorie-Tabs ───────────────────────────────────────── */}
      <div ref={tabsRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <CategoryTab
          label="Alle"
          icon="🌿"
          count={articles.length}
          active={activeCategory === 'alle'}
          onClick={() => setActiveCategory('alle')}
        />
        {ORDERED_CATEGORIES.filter(c => categoryCounts[c]).map(cat => (
          <CategoryTab
            key={cat}
            label={categoryLabels[cat] ?? cat}
            icon={CATEGORY_ICONS[cat] ?? '📄'}
            count={categoryCounts[cat] ?? 0}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat as TerpiraCategory)}
          />
        ))}
      </div>

      {/* ── Schwierigkeits-Filter ────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-fg uppercase tracking-wide">Level:</span>
        {(['alle', 'einsteiger', 'fortgeschritten', 'profi'] as const).map(diff => {
          const meta = diff !== 'alle' ? DIFFICULTY_META[diff] : null;
          const isActive = activeDifficulty === diff;
          return (
            <button
              key={diff}
              onClick={() => setActiveDifficulty(diff)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all
                ${isActive
                  ? `ring-2 ${meta ? `${meta.bg} ${meta.color} ${meta.ring}` : 'ring-border bg-border text-foreground'}`
                  : 'bg-border text-foreground/80 hover:bg-border'
                }`}
            >
              {diff === 'alle' ? 'Alle Level'
                : diff === 'einsteiger' ? 'Einsteiger'
                : diff === 'fortgeschritten' ? 'Fortgeschritten'
                : 'Profi'}
            </button>
          );
        })}
        <button
          onClick={() => setFreshOnly(v => !v)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            freshOnly
              ? 'ring-2 ring-emerald-300 bg-emerald-100 text-emerald-800'
              : 'bg-border text-foreground/80 hover:bg-border'
          }`}
        >
          Neu 7 Tage
        </button>
      </div>

      {/* ── Ergebnis-Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-fg">
          <span className="font-semibold text-foreground">{filtered.length}</span>
          {' '}von {articles.length} Artikeln
          {hasFilters && ' (gefiltert)'}
        </p>
        {localSearch.trim() && (
          <p className="text-xs text-emerald-600 font-medium">
            Suche: „{localSearch}“
          </p>
        )}
        {!localSearch.trim() && freshOnly && (
          <p className="text-xs text-emerald-600 font-medium">
            Schnellfilter aktiv: Neu seit 7 Tagen
          </p>
        )}
      </div>

      {/* ── Artikel-Grid ─────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          onReset={resetFilters}
          query={localSearch}
          suggestions={noResultSuggestions}
          onSelectSuggestion={setLocalSearch}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ article, snippet }) => (
            <ArticleCard
              key={article.slug}
              article={article}
              categoryLabel={categoryLabels[article.category] ?? article.category}
              isNew={article.lastUpdated >= recentThreshold}
              isBookmarked={bookmarks.includes(article.slug)}
              onToggleBookmark={toggleBookmark}
              onOpen={markOpened}
              snippet={snippet}
              progressPct={progressBySlug[article.slug] ?? 0}
            />
          ))}
        </div>
      )}

      {/* ── Quick-Links-Footer ───────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold text-foreground/80">Mehr entdecken</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href={"/studies/sources" as Route}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border
              bg-background px-3 py-2 text-sm text-foreground/80 hover:border-emerald-300
              hover:bg-emerald-50 hover:text-emerald-800 transition-all">
            🔬 {totalSources} Wissenschaftliche Quellen
          </Link>
          <Link href={"/database/fertilizers" as Route}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border
              bg-background px-3 py-2 text-sm text-foreground/80 hover:border-amber-300
              hover:bg-amber-50 hover:text-amber-800 transition-all">
            🌿 Dünger-Katalog
          </Link>
          <Link href={"/search" as Route}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border
              bg-background px-3 py-2 text-sm text-foreground/80 hover:border-cyan-300
              hover:bg-cyan-50 hover:text-cyan-800 transition-all">
            🔍 Volltext-Suche
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-fg">
          Redaktioneller Hinweis: Inhalte dienen der Aufklärung und ersetzen keine medizinische, rechtliche oder regulatorische Beratung.
        </p>
      </div>
    </div>
  );
}

// ─── Kategorie-Tab ────────────────────────────────────────────────────────────

function CategoryTab({ label, icon, count, active, onClick }: {
  label: string; icon: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 flex-shrink-0 rounded-xl px-3 py-2 text-sm
        font-medium transition-all duration-150
        ${active
          ? 'bg-primary text-white shadow-md shadow-emerald-900/20'
          : 'bg-card border border-border text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 shadow-sm'
        }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
      <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
        active ? 'bg-card/20 text-white' : 'bg-border text-muted-fg'
      }`}>
        {count}
      </span>
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onReset, query, suggestions, onSelectSuggestion }: {
  onReset: () => void;
  query: string;
  suggestions: string[];
  onSelectSuggestion: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-background py-16 text-center">
      <div className="text-4xl mb-3">🔍</div>
      <p className="font-semibold text-foreground/80">Keine Artikel gefunden</p>
      <p className="mt-1 text-sm text-muted-fg">
        Für „{query || 'deine Suche'}“ gab es keine Treffer. Probiere andere Begriffe oder eine Kategorie.
      </p>

      {suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2 px-6">
          {suggestions.map((hint) => (
            <button
              key={hint}
              onClick={() => onSelectSuggestion(hint)}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      <button onClick={onReset}
        className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition">
        Filter zurücksetzen
      </button>
    </div>
  );
}
