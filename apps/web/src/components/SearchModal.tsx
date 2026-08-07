'use client';

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { Command } from 'cmdk';
import { useRouter, Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { BookOpen, Leaf, Library, Microscope, Search as SearchIcon } from 'lucide-react';
import type { SearchResult, SearchResultKind } from '@/lib/search/engine';

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconWiki() {
  return <BookOpen className="text-emerald-600 text-base h-4 w-4" strokeWidth={2} />;
}
function IconFertilizer() {
  return <Leaf className="text-amber-600 text-base h-4 w-4" strokeWidth={2} />;
}
function IconGlossary() {
  return <Library className="text-teal-600 text-base h-4 w-4" strokeWidth={2} />;
}
function IconSource() {
  return <Microscope className="text-muted-fg text-base h-4 w-4" strokeWidth={2} />;
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
//
// asChild renders the actual <Link> as the CommandItem (Radix Slot pattern) —
// keeps real <a> semantics (cmd/ctrl-click → new tab, right-click → context
// menu) while cmdk still drives keyboard highlight/selection.

function ResultItem({ result, onSelect }: { result: SearchResult; onSelect: () => void }) {
  return (
    <Command.Item
      asChild
      value={result.id}
      keywords={[result.title, result.subtitle ?? '']}
      onSelect={onSelect}
    >
      <Link
        href={result.url as Route}
        onClick={onSelect}
        className="flex items-start gap-3 px-4 py-3 rounded-xl transition-colors duration-150 data-[selected=true]:bg-emerald-50 data-[selected=true]:ring-1 data-[selected=true]:ring-emerald-300 hover:bg-background"
      >
        <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-border flex items-center justify-center">
          <KindIcon kind={result.kind} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm truncate">{result.title}</span>
            {result.badge && (
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${result.badgeColor}`}>
                {result.badge}
              </span>
            )}
            <span className="ml-auto text-xs text-muted-fg flex-shrink-0">{KIND_LABEL[result.kind]}</span>
          </div>
          <div className="text-xs text-muted-fg truncate mt-0.5">{result.subtitle}</div>
          {result.highlight && (
            <div
              className="text-xs text-foreground/80 mt-1 line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: result.highlight
                  .replace(/\*\*(.+?)\*\*/g, '<mark class="bg-yellow-100 text-yellow-900 rounded px-0.5">$1</mark>'),
              }}
            />
          )}
        </div>
      </Link>
    </Command.Item>
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
  if (topics.length === 0) return null;
  return (
    <Command.Group heading="Beliebte Themen" className="px-4 py-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-fg [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:mb-2">
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <Command.Item
            key={t.query}
            value={`trending-${t.query}`}
            onSelect={() => onSelect(t.query)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-border text-foreground/80 text-xs font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.97] data-[selected=true]:bg-emerald-100 data-[selected=true]:text-emerald-700"
          >
            <KindIcon kind={t.kind} />
            {t.label}
          </Command.Item>
        ))}
      </div>
    </Command.Group>
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
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [isPending, startTransition] = useTransition();
  const abortRef = useRef<AbortController | null>(null);

  // Trending beim Öffnen laden
  useEffect(() => {
    if (!open) return;
    fetch('/api/search/trending')
      .then(r => r.json())
      .then(d => setTrending(d.topics ?? []))
      .catch(() => {});
  }, [open]);

  // Query → API-Suche
  useEffect(() => {
    if (!query.trim()) {
      const t = setTimeout(() => {
        setResults([]);
        setTotalResults(0);
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
        } catch {
          // AbortError ignorieren
        }
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClose = useCallback(() => {
    setQuery('');
    setResults([]);
    onClose();
  }, [onClose]);

  const handleResultSelect = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleTrendingSelect = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const handleFullSearch = useCallback(() => {
    router.push(`/search?q=${encodeURIComponent(query)}` as Route);
    handleClose();
  }, [router, query, handleClose]);

  const showResults = query.trim().length > 0;

  return (
    // Radix Dialog (via Command.Dialog) supplies focus trap, Escape-to-close,
    // backdrop click-to-close, and body scroll lock for free — none of that
    // needs hand-rolling anymore. `vimBindings={false}` avoids ctrl+k being
    // claimed internally for "move up" while SearchBar's own global ctrl+k
    // listener toggles the modal itself. shouldFilter={false}: results come
    // from our own debounced API fetch, not cmdk's built-in scorer.
    <Command.Dialog
      open={open}
      onOpenChange={(v) => { if (!v) handleClose(); }}
      shouldFilter={false}
      vimBindings={false}
      label="Suche"
      overlayClassName="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-250 ease-out data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
      contentClassName="fixed left-1/2 top-[8vh] z-50 w-full max-w-2xl -translate-x-1/2 px-4 transition-[opacity,transform] duration-250 ease-out data-[state=closed]:opacity-0 data-[state=closed]:scale-96 data-[state=open]:opacity-100 data-[state=open]:scale-100"
      className="modal-surface w-full rounded-2xl shadow-2xl ring-1 ring-border overflow-hidden flex flex-col max-h-[80vh]"
    >
      {/* Eingabefeld */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <svg className="w-5 h-5 text-muted-fg flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Studien, Dünger, Begriffe… (↑↓ Navigation · Enter öffnen · Esc schließen)"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent text-foreground placeholder-muted-fg outline-none text-base"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-muted-fg transition-colors duration-150 hover:text-foreground/80 active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 border border-border rounded text-xs text-muted-fg font-mono bg-background">
          Esc
        </kbd>
      </div>

      {/* Ergebnis-Bereich */}
      <Command.List className="overflow-y-auto flex-1">
        {!showResults && <TrendingList topics={trending} onSelect={handleTrendingSelect} />}

        {showResults && (
          <>
            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
              <p className="text-xs text-muted-fg">
                {isPending
                  ? 'Suche…'
                  : results.length === 0
                  ? 'Keine Treffer'
                  : `${totalResults} Treffer · ${duration}ms`}
              </p>
              <Link
                href={`/search?q=${encodeURIComponent(query)}` as Route}
                onClick={handleClose}
                className="text-xs text-emerald-600 font-medium transition-colors duration-150 hover:text-emerald-700"
              >
                Alles anzeigen →
              </Link>
            </div>

            <div className="px-2 pb-3 space-y-0.5">
              {results.map((r) => (
                <ResultItem key={r.id} result={r} onSelect={handleResultSelect} />
              ))}
            </div>

            <Command.Empty>
              {!isPending && (
                <div className="py-10 text-center text-muted-fg">
                  <SearchIcon className="h-8 w-8 mx-auto mb-2" strokeWidth={2} />
                  <p className="text-sm font-medium">Nichts gefunden für „{query}“</p>
                  <p className="text-xs text-muted-fg mt-1">Versuche andere Schreibweise oder Englisch</p>
                  <button
                    onClick={handleFullSearch}
                    className="mt-3 inline-block text-xs text-emerald-600 transition-colors duration-150 hover:underline"
                  >
                    Vollsuche öffnen →
                  </button>
                </div>
              )}
            </Command.Empty>
          </>
        )}
      </Command.List>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-xs text-muted-fg bg-background/80">
        <span className="flex items-center gap-1">
          <kbd className="font-mono px-1 py-0.5 bg-card border border-border rounded text-[10px]">↑↓</kbd> navigieren
        </span>
        <span className="flex items-center gap-1">
          <kbd className="font-mono px-1 py-0.5 bg-card border border-border rounded text-[10px]">↵</kbd> öffnen
        </span>
        <span className="flex items-center gap-1">
          <kbd className="font-mono px-1 py-0.5 bg-card border border-border rounded text-[10px]">Esc</kbd> schließen
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          SecretLeaf Search
        </span>
      </div>
    </Command.Dialog>
  );
}
