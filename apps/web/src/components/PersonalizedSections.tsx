'use client';

import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { useInterests } from '@/hooks/useInterests';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import type { TerpiraArticle, TerpiraCategory } from '@/lib/terpira/types';
import { categoryLabels } from '@/data/terpira/wiki';
import BookmarkButton from './BookmarkButton';

const CATEGORY_ICONS: Record<string, string> = {
  anbau: '🌱', genetik: '🧬', chemie: '⚗️', terpene: '🌺',
  medizin: '🩺', konsumformen: '💨', konzentrate: '💎', recht: '⚖️',
  sicherheit: '🛡️', qualitaet: '🔬', markt: '📊', werkzeuge: '🛠️',
};

const DIFFICULTY_DOT: Record<string, string> = {
  einsteiger: 'bg-blue-400',
  fortgeschritten: 'bg-amber-400',
  profi: 'bg-purple-400',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  einsteiger: 'Einsteiger',
  fortgeschritten: 'Fortgeschritten',
  profi: 'Profi',
};

function evidenceLevel(sourceCount: number): { label: string; cls: string } {
  if (sourceCount >= 5) return { label: 'Hohe Evidenz', cls: 'evidence-high border' };
  if (sourceCount >= 3) return { label: 'Mittlere Evidenz', cls: 'evidence-med border' };
  return { label: 'Grundlagenartikel', cls: 'evidence-low border' };
}

/* ── Mini card ─────────────────────────────────────────────────────────── */

function MiniCard({ article }: { article: TerpiraArticle }) {
  const sourceCount = article.sourceIds?.length ?? 0;
  const ev = evidenceLevel(sourceCount);
  return (
    <div className="relative">
      <Link
        href={`/studies/${article.slug}` as Route}
        className="card-lift group flex flex-col gap-2 rounded-xl border border-border bg-card p-4
          hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50"
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border text-base flex-shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
            {CATEGORY_ICONS[article.category] ?? '📄'}
          </span>
          {sourceCount > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${ev.cls}`}>
              {ev.label}
            </span>
          )}
        </div>
        <h3 className="text-[12.5px] font-semibold text-foreground group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        <div className="mt-auto flex items-center gap-1.5 text-[11px] text-muted-fg pt-1 border-t border-border">
          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${DIFFICULTY_DOT[article.difficulty] ?? 'bg-border'}`} />
          <span>{DIFFICULTY_LABEL[article.difficulty]}</span>
          <span className="text-border">·</span>
          <span>{article.readMinutes} Min</span>
        </div>
      </Link>
      <div className="absolute top-3 right-3">
        <BookmarkButton slug={article.slug} size="sm" />
      </div>
    </div>
  );
}

/* ── Saved Studies Panel ───────────────────────────────────────────────── */

function SavedStudiesPanel({ allArticles }: { allArticles: TerpiraArticle[] }) {
  const { bookmarks } = useBookmarks();
  const saved = allArticles.filter(a => bookmarks.includes(a.slug));

  if (saved.length === 0) return null;

  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 tracking-widest uppercase mb-2">
              🔖 Meine Sammlung
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Gespeicherte Studien</h2>
          </div>
          <span className="text-xs text-muted-fg">{saved.length} gespeichert</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {saved.slice(0, 8).map(article => (
            <MiniCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Reading History Panel ─────────────────────────────────────────────── */

function ReadingHistoryPanel({ allArticles }: { allArticles: TerpiraArticle[] }) {
  const { history } = useReadingHistory();
  if (history.length === 0) return null;

  const articles = history
    .slice(0, 4)
    .map(h => allArticles.find(a => a.slug === h.slug))
    .filter((a): a is TerpiraArticle => Boolean(a));

  if (articles.length === 0) return null;

  return (
    <section className="border-b border-border bg-background/40">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-border border border-border px-2.5 py-0.5 text-[10px] font-bold text-foreground/80 tracking-widest uppercase mb-2">
              📖 Weiterlesen
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Zuletzt gelesen</h2>
          </div>
        </div>
        <div className="space-y-1.5">
          {articles.map((article, i) => {
            const sourceCount = article.sourceIds?.length ?? 0;
            return (
              <Link
                key={article.slug}
                href={`/studies/${article.slug}` as Route}
                className="group flex items-center gap-4 rounded-xl border border-transparent bg-card px-5 py-3.5
                  hover:border-emerald-100 hover:shadow-sm hover:bg-emerald-50/20 transition-all duration-150"
              >
                <span className="w-5 text-center text-xs font-bold text-muted-fg flex-shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-base flex-shrink-0">{CATEGORY_ICONS[article.category] ?? '📄'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-fg line-clamp-1 mt-0.5">{categoryLabels[article.category]}</p>
                </div>
                {sourceCount > 0 && (
                  <span className="hidden sm:inline-flex items-center flex-shrink-0 rounded-md bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600">
                    {sourceCount}
                  </span>
                )}
                <BookmarkButton slug={article.slug} size="sm" />
                <svg className="w-3.5 h-3.5 text-border group-hover:text-emerald-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Personalized Category Sections ───────────────────────────────────── */

function PersonalizedCategorySections({ categoryArticles, allCategories }: {
  categoryArticles: Record<string, TerpiraArticle[]>;
  allCategories: TerpiraCategory[];
}) {
  const { preferredCategories, loaded } = useInterests();

  // Sort categories: preferred ones first, then rest
  const orderedCategories = loaded && preferredCategories.length > 0
    ? [
        ...preferredCategories.filter(c => allCategories.includes(c as TerpiraCategory)),
        ...allCategories.filter(c => !preferredCategories.includes(c)),
      ] as TerpiraCategory[]
    : allCategories;

  const sectionsToShow = orderedCategories
    .filter(cat => (categoryArticles[cat]?.length ?? 0) > 0)
    .slice(0, 5);

  if (sectionsToShow.length === 0) return null;

  return (
    <>
      {loaded && preferredCategories.length > 0 && (
        <div className="mx-auto max-w-6xl px-5 pt-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            ✦ Für dich zusammengestellt – basierend auf deinen Interessen
          </div>
        </div>
      )}
      <div className="mx-auto max-w-6xl px-5 pb-8 space-y-6 mt-6">
        {sectionsToShow.map(cat => {
          const articles = (categoryArticles[cat] ?? []).slice(0, 4);
          return (
            <div key={cat} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="border-b border-border bg-gradient-to-r from-background/80 to-card px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border text-base shadow-sm">
                    {CATEGORY_ICONS[cat] ?? '📄'}
                  </span>
                  <h3 className="text-sm font-bold text-foreground">{categoryLabels[cat]}</h3>
                  <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    {categoryArticles[cat]?.length ?? 0} Artikel
                  </span>
                </div>
                <Link
                  href={`/category/${cat}` as Route}
                  className="group flex items-center gap-1 text-xs font-medium text-muted-fg hover:text-emerald-600 transition-colors"
                >
                  Alle
                  <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
                {articles.map(article => {
                  const srcCount = article.sourceIds?.length ?? 0;
                  return (
                    <div key={article.slug} className="relative bg-card group">
                      <Link
                        href={`/studies/${article.slug}` as Route}
                        className="flex flex-col gap-1.5 p-4 h-full hover:bg-emerald-50/30 transition-colors duration-150"
                      >
                        <h4 className="text-[12.5px] font-semibold text-foreground group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h4>
                        <div className="mt-auto flex items-center gap-1.5 text-[11px] text-muted-fg pt-1.5 border-t border-border">
                          <span className={`h-1.5 w-1.5 rounded-full ${DIFFICULTY_DOT[article.difficulty] ?? 'bg-border'}`} />
                          <span>{DIFFICULTY_LABEL[article.difficulty]}</span>
                          {srcCount > 0 && (
                            <>
                              <span className="text-border">·</span>
                              <span className="text-emerald-600 font-semibold">{srcCount}×</span>
                            </>
                          )}
                        </div>
                      </Link>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <BookmarkButton slug={article.slug} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── Recommended Studies (based on interests) ─────────────────────────── */

function RecommendedStudies({ allArticles }: { allArticles: TerpiraArticle[] }) {
  const { preferredCategories, loaded } = useInterests();
  const { bookmarks } = useBookmarks();

  if (!loaded || preferredCategories.length === 0) return null;

  const recommended = allArticles
    .filter(a => preferredCategories.includes(a.category) && !bookmarks.includes(a.slug))
    .sort((a, b) => (b.sourceIds?.length ?? 0) - (a.sourceIds?.length ?? 0))
    .slice(0, 4);

  if (recommended.length === 0) return null;

  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 tracking-widest uppercase mb-2">
            ✦ Empfohlen für dich
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Passend zu deinen Interessen</h2>
          <p className="mt-1 text-sm text-muted-fg">Artikel, die zu deiner Auswahl passen – noch nicht gelesen</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map(article => (
            <MiniCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Exports ───────────────────────────────────────────────────────────── */

export { SavedStudiesPanel, ReadingHistoryPanel, PersonalizedCategorySections, RecommendedStudies };
