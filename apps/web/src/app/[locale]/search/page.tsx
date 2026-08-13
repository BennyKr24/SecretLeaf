'use client';

import { Suspense, useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import type { SearchResponse, SearchResult, SearchResultKind } from '@/lib/search/engine';
import { BookOpen, Leaf, BookMarked, Microscope, Search, Database, Wrench, type LucideIcon } from 'lucide-react';

const KIND_ICON: Record<SearchResultKind, LucideIcon> = {
  wiki: BookOpen,
  fertilizer: Leaf,
  glossary: BookMarked,
  source: Microscope,
};

const KIND_LABEL: Record<SearchResultKind, string> = {
  wiki: 'Studien',
  fertilizer: 'Dünger',
  glossary: 'Glossar',
  source: 'Quelle',
};

const KIND_COLOR: Record<SearchResultKind, string> = {
  wiki: 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40',
  fertilizer: 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40',
  glossary: 'text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/40',
  source: 'text-foreground/80 bg-background border-border',
};

function HighlightedText({ text }: { text: string }) {
  const html = text.replace(
    /\*\*(.+?)\*\*/g,
    '<mark class="bg-yellow-100 dark:bg-yellow-950/40 text-yellow-900 rounded px-0.5 not-italic">$1</mark>'
  );
  return (
    <span
      className="text-sm text-foreground/80"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ResultCard({ result }: { result: SearchResult }) {
  const KindIcon = KIND_ICON[result.kind];
  return (
    <Link
      href={result.url as Route}
      className="group block bg-card rounded-xl border border-border hover:border-emerald-300 hover:shadow-md transition-[border-color,box-shadow] duration-200 p-5"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
          <KindIcon className="h-4.5 w-4.5 text-emerald-600" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground group-hover:text-emerald-700 dark:text-emerald-400 transition-colors">
              {result.title}
            </h3>
            {result.badge && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${result.badgeColor} border-transparent`}>
                {result.badge}
              </span>
            )}
            <span className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${KIND_COLOR[result.kind]}`}>
              <KindIcon className="h-3 w-3" strokeWidth={2} /> {KIND_LABEL[result.kind]}
            </span>
          </div>
          <p className="text-xs text-muted-fg mb-2">{result.subtitle}</p>
          {result.highlight ? (
            <HighlightedText text={result.highlight} />
          ) : (
            <p className="text-sm text-foreground/80 line-clamp-2">{result.description}</p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {result.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-background text-foreground/80 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-fg font-mono flex-shrink-0 mt-1">
          {result.score}
        </div>
      </div>
    </Link>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') ?? '';
  const initialKind = searchParams.get('kind') as SearchResultKind | 'all' ?? 'all';

  const [query, setQuery] = useState(initialQ);
  const [activeKind, setActiveKind] = useState<SearchResultKind | 'all'>(initialKind);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = useCallback((q: string, kind: SearchResultKind | 'all') => {
    if (!q.trim()) { setData(null); setHasSearched(false); return; }
    const kindsParam = kind !== 'all' ? `&kinds=${kind}` : '';
    startTransition(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=30${kindsParam}`);
        const json: SearchResponse = await res.json();
        setData(json);
        setHasSearched(true);
      } catch { /* noop */ }
    });
  }, []);

  // Initial search
  useEffect(() => {
    if (!initialQ) return;
    const t = setTimeout(() => {
      doSearch(initialQ, initialKind);
    }, 0);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = query.trim()
      ? `/search?q=${encodeURIComponent(query)}${activeKind !== 'all' ? `&kind=${activeKind}` : ''}`
      : '/search';
    router.replace(url as Route, { scroll: false });
    doSearch(query, activeKind);
  };

  const handleKindChange = (kind: SearchResultKind | 'all') => {
    setActiveKind(kind);
    if (query.trim()) doSearch(query, kind);
  };

  const kinds: Array<SearchResultKind | 'all'> = ['all', 'wiki', 'fertilizer', 'glossary', 'source'];
  const kindFilterLabel: Record<string, string> = {
    all: 'Alle', wiki: 'Studien', fertilizer: 'Dünger',
    glossary: 'Glossar', source: 'Quellen',
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero / Suchleiste */}
      <div className="bg-gradient-to-br from-[#0f2419] via-[#1a3a26] to-[#0f2419] px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            SecretLeaf · Volltextsuche
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Intelligente Suche
          </h1>
          <p className="text-slate-400 mb-8">
            Studien, über 50 Dünger, Glossarbegriffe und Fachquellen – alles durchsuchbar.
          </p>

          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-5 py-3 gap-3 focus-within:bg-white/15 focus-within:border-emerald-400/50 transition-colors duration-150">
              <svg className="w-5 h-5 text-muted-fg flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="PPFD, EC, Haschisch, VPD, BioBizz…"
                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-lg"
                autoFocus
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setData(null); setHasSearched(false); }}
                  className="text-muted-fg hover:text-slate-300 transition active:scale-90"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                className="flex-shrink-0 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition active:scale-[0.97]"
              >
                Suchen
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Filter-Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {kinds.map((k) => {
            const count = k === 'all' ? data?.totalResults : (data?.facets.byKind[k as SearchResultKind] ?? 0);
            const KindIcon = k === 'all' ? null : KIND_ICON[k];
            return (
              <button
                key={k}
                onClick={() => handleKindChange(k)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-[transform,background-color,border-color,color] duration-150 active:scale-[0.97] ${
                  activeKind === k
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-card text-foreground/80 border-border hover:border-emerald-300'
                }`}
              >
                {KindIcon && <KindIcon className="h-3.5 w-3.5" strokeWidth={2} />}
                {kindFilterLabel[k]}
                {data && count !== undefined && (
                  <span className={`ml-2 text-xs ${activeKind === k ? 'text-emerald-200' : 'text-muted-fg'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status-Bar */}
        {data && hasSearched && (
          <div className="flex items-center justify-between mb-4 text-sm text-muted-fg">
            <span>
              {isPending
                ? 'Suche läuft…'
                : data.isEmpty
                ? 'Keine Ergebnisse'
                : `${data.totalResults} Ergebnisse für „${data.query}“ · ${data.duration_ms} ms`}
            </span>
            <Link href={"/studies" as Route} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
              → Studienübersicht
            </Link>
          </div>
        )}

        {/* Ergebnisse */}
        {isPending && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-muted-fg">
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Suche läuft…</span>
            </div>
          </div>
        )}

        {!isPending && data && !data.isEmpty && (
          <div className="space-y-3">
            {data.results.map((r) => (
              <ResultCard key={r.id} result={r} />
            ))}
          </div>
        )}

        {!isPending && data?.isEmpty && (
          <div className="text-center py-16">
            <Search className="mx-auto mb-3 h-9 w-9 text-muted-fg" strokeWidth={1.5} />
            <h2 className="text-xl font-bold text-foreground mb-2">Keine Treffer gefunden</h2>
            <p className="text-muted-fg mb-4">Für „{data.query}“ gibt es keine Ergebnisse.</p>
            {data.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="text-sm text-muted-fg">Meintest du vielleicht:</span>
                {data.suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); doSearch(s, activeKind); }}
                    className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm hover:bg-emerald-200 dark:hover:bg-emerald-950/60 transition active:scale-[0.97]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tag-Facets */}
        {data && !data.isEmpty && data.facets.byTag.length > 0 && (
          <div className="mt-8 bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground/80 mb-3">Verwandte Themen</h3>
            <div className="flex flex-wrap gap-2">
              {data.facets.byTag.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); doSearch(tag, 'all'); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-background hover:bg-emerald-100 dark:bg-emerald-950/40 text-foreground/80 hover:text-emerald-700 dark:text-emerald-400 rounded-lg text-sm transition active:scale-[0.97]"
                >
                  {tag}
                  <span className="text-xs text-muted-fg">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Leer-Zustand */}
        {!hasSearched && !isPending && (
          <div className="text-center py-12">
            <p className="text-muted-fg text-base mb-6">
              Durchsuche Fachartikel, Datenbankeinträge, Werkzeuge und wissenschaftliche Quellen.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, label: 'Studien', href: '/studies', count: '13' },
                { icon: Database, label: 'Datenbank', href: '/database', count: '1+' },
                { icon: Wrench, label: 'Werkzeuge', href: '/tools', count: '1+' },
                { icon: Microscope, label: 'Quellen', href: '/studies/sources', count: '41' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  className="bg-card border border-border hover:border-emerald-300 rounded-xl p-4 text-center transition-[border-color,box-shadow] duration-200 hover:shadow-sm"
                >
                  <item.icon className="mx-auto mb-1 h-6 w-6 text-emerald-600" strokeWidth={1.75} />
                  <div className="text-sm font-medium text-foreground/80">{item.label}</div>
                  <div className="text-xs text-muted-fg mt-1">{item.count}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
