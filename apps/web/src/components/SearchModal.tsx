'use client';

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import type { Route } from 'next';
import type { SearchResult, SearchResultKind } from '@/lib/search/engine';

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconWiki() {
  return <span className="text-emerald-600 text-base">📚</span>;
}
function IconFertilizer() {
  return <span className="text-amber-600 text-base">🌿</span>;
}
function IconGlossary() {
  return <span className="text-teal-600 text-base">📖</span>;
}
function IconSource() {
  return <span className="text-slate-500 text-base">🔬</span>;
}
function KindIcon({ kind }: { kind: SearchResultKind }) {
  if (kind === 'wiki') return <IconWiki />;
  if (kind === 'fertilizer') return <IconFertilizer />;
  if (kind === 'glossary') return <IconGlossary />;
  return <IconSource />;
}

const KIND_LABEL: Record<SearchResultKind, string> = {
  wiki: 'Studien',
  fertilizer: 'Dünger',
  glossary: 'Glossar',
  source: 'Quelle',
};

// ─── Result-Eintrag ───────────────────────────────────────────────────────────

function ResultItem({
  result,
  selected,
  onSelect,
}: {
  result: SearchResult;
  selected: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (selected && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [selected]);

  return (
    <Link
      ref={ref}
      href={result.url as Route}
      onClick={onSelect}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-colors group ${
        selected
          ? 'bg-emerald-50 ring-1 ring-emerald-300'
          : 'hover:bg-slate-50'
      }`}
    >
      <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
        <KindIcon kind={result.kind} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900 text-sm truncate">{result.title}</span>
          {result.badge && (
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${result.badgeColor}`}>
              {result.badge}
            </span>
          )}
          <span className="ml-auto text-xs text-slate-400 flex-shrink-0">{KIND_LABEL[result.kind]}</span>
        </div>
        <div className="text-xs text-slate-500 truncate mt-0.5">{result.subtitle}</div>
        {result.highlight && (
          <div
            className="text-xs text-slate-600 mt-1 line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: result.highlight
                .replace(/\*\*(.+?)\*\*/g, '<mark class="bg-yellow-100 text-yellow-900 rounded px-0.5">$1</mark>'),
            }}
          />
        )}
      </div>
    </Link>
  );
}

// ─── Trending ─────────────────────────────────────────────────────────────────

type TrendingTopic = { label: string; query: string; kind: SearchResultKind };

function TrendingList({
  topics,
  onSelect,
}: {
  topics: TrendingTopic[];
  onSelect: (q: string) => void;
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Beliebte Themen</p>
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <button
            key={t.query}
            onClick={() => onSelect(t.query)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 text-xs font-medium transition-colors"
          >
            <KindIcon kind={t.kind} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SearchModal ──────────────────────────────────────────────────────────────

export type SearchModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Trending beim Öffnen laden
  useEffect(() => {
    if (!open) return;
    fetch('/api/search/trending')
      .then(r => r.json())
      .then(d => setTrending(d.topics ?? []))
      .catch(() => {});
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  // Query → API-Suche
  useEffect(() => {
    if (!query.trim()) {
      const t = setTimeout(() => {
        setResults([]);
        setTotalResults(0);
        setSelectedIndex(-1);
      }, 0);
      return () => clearTimeout(t);
    }

    // Debounce 200ms
    const timer = setTimeout(() => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      startTransition(async () => {
        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(query)}&limit=15`,
            { signal: abortRef.current!.signal }
          );
          if (!res.ok) return;
          const data = await res.json();
          setResults(data.results ?? []);
          setTotalResults(data.totalResults ?? 0);
          setDuration(data.duration_ms ?? 0);
          setSelectedIndex(-1);
        } catch {
          // AbortError ignorieren
        }
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Tastatur-Navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = selectedIndex >= 0 ? results[selectedIndex] : results[0];
        if (target) {
          router.push(target.url as Route);
          onClose();
        } else if (query.trim()) {
          router.push(`/search?q=${encodeURIComponent(query)}` as Route);
          onClose();
        }
      }
    },
    [results, selectedIndex, router, onClose, query]
  );

  const handleClose = useCallback(() => {
    setQuery('');
    setResults([]);
    onClose();
  }, [onClose]);

  const handleTrendingSelect = useCallback((q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  }, []);

  // Backdrop-Click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  }, [handleClose]);

  if (!open) return null;

  const showResults = query.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4"
      aria-modal="true"
      role="dialog"
      aria-label="Suche"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Eingabefeld */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Studien, Dünger, Begriffe… (↑↓ Navigation · Enter öffnen · Esc schließen)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-base"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="text-slate-400 hover:text-slate-600 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 border border-slate-200 rounded text-xs text-slate-500 font-mono bg-slate-50">
            Esc
          </kbd>
        </div>

        {/* Ergebnis-Bereich */}
        <div className="overflow-y-auto flex-1">
          {!showResults && (
            <TrendingList topics={trending} onSelect={handleTrendingSelect} />
          )}

          {showResults && (
            <>
              {/* Header */}
              {query.trim().length > 0 && (
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    {isPending
                      ? 'Suche…'
                      : results.length === 0
                      ? 'Keine Treffer'
                      : `${totalResults} Treffer · ${duration}ms`}
                  </p>
                  {query.trim() && (
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}` as Route}
                      onClick={handleClose}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Alles anzeigen →
                    </Link>
                  )}
                </div>
              )}

              {/* Treffer */}
              <div className="px-2 pb-3 space-y-0.5">
                {results.map((r, i) => (
                  <ResultItem
                    key={r.id}
                    result={r}
                    selected={i === selectedIndex}
                    onSelect={handleClose}
                  />
                ))}

                {results.length === 0 && !isPending && (
                  <div className="py-10 text-center text-slate-500">
                    <p className="text-2xl mb-2">🔍</p>
                    <p className="text-sm font-medium">Nichts gefunden für „{query}“</p>
                    <p className="text-xs text-slate-400 mt-1">Versuche andere Schreibweise oder Englisch</p>
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}` as Route}
                      onClick={handleClose}
                      className="mt-3 inline-block text-xs text-emerald-600 hover:underline"
                    >
                      Vollsuche öffnen →
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-2 flex items-center gap-4 text-xs text-slate-400 bg-slate-50/80">
          <span className="flex items-center gap-1">
            <kbd className="font-mono px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑↓</kbd> navigieren
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↵</kbd> öffnen
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Esc</kbd> schließen
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            SecretLeaf Search
          </span>
        </div>
      </div>
    </div>
  );
}
