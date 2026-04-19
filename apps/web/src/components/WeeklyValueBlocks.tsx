'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { TerpiraArticle } from '@/lib/terpira/types';
import { categoryLabels } from '@/data/terpira/wiki';
import BookmarkButton from './BookmarkButton';

type SectionDef = {
  id: string;
  eyebrow: string;
  eyebrowColor: string;
  title: string;
  subtitle: string;
  articles: TerpiraArticle[];
  linkLabel?: string;
  linkHref?: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  anbau: '🌱', genetik: '🧬', chemie: '⚗️', terpene: '🌺',
  medizin: '🩺', konsumformen: '💨', konzentrate: '💎', recht: '⚖️',
  sicherheit: '🛡️', qualitaet: '🔬', markt: '📊', werkzeuge: '🛠️',
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

function WeeklyCard({ article, rank }: { article: TerpiraArticle; rank: number }) {
  const sourceCount = article.sourceIds?.length ?? 0;
  const ev = evidenceLevel(sourceCount);

  return (
    <div className="relative group">
      <Link
        href={`/studies/${article.slug}` as Route}
        className="card-lift flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-4
          hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50"
      >
        {/* Rank */}
        <div className="flex items-center justify-between">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
            {rank}
          </span>
          {sourceCount > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ev.cls}`}>
              {ev.label}
            </span>
          )}
        </div>

        {/* Icon + title */}
        <div>
          <span className="text-xl mb-1.5 block">{CATEGORY_ICONS[article.category] ?? '📄'}</span>
          <h3 className="text-[13px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">{article.summary}</p>
        </div>

        {/* Meta */}
        <div className="mt-auto flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-50">
          <span className="line-clamp-1 flex-1">{categoryLabels[article.category]}</span>
          <span className="flex-shrink-0">{article.readMinutes} Min</span>
        </div>
      </Link>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <BookmarkButton slug={article.slug} size="sm" />
      </div>
    </div>
  );
}

type Props = {
  wichtigArticles: TerpiraArticle[];     // Diese Woche wichtig
  growArticles: TerpiraArticle[];        // Neue Grow-Erkenntnisse
  trendsArticles: TerpiraArticle[];      // Trends im Cannabis-Anbau
  meistGelesenArticles: TerpiraArticle[]; // Social proof: meist gelesen
};

export default function WeeklyValueBlocks({
  wichtigArticles,
  growArticles,
  trendsArticles,
  meistGelesenArticles,
}: Props) {
  const sections: SectionDef[] = [
    {
      id: 'wichtig',
      eyebrow: '📌 Diese Woche wichtig',
      eyebrowColor: 'bg-red-50 border-red-200 text-red-700',
      title: 'Wichtigste Artikel der Woche',
      subtitle: 'Die relevantesten Beiträge – nach wissenschaftlicher Abdeckung',
      articles: wichtigArticles,
      linkLabel: 'Alle Studien',
      linkHref: '/studies',
    },
    {
      id: 'grow',
      eyebrow: '🌱 Grow-Wissen',
      eyebrowColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      title: 'Aktuelle Grow-Erkenntnisse',
      subtitle: 'Neues Wissen für bessere Ergebnisse beim Cannabis-Anbau',
      articles: growArticles,
      linkLabel: 'Alle Anbau-Artikel',
      linkHref: '/category/anbau',
    },
    {
      id: 'trends',
      eyebrow: '📈 Markt & Entwicklung',
      eyebrowColor: 'bg-blue-50 border-blue-200 text-blue-700',
      title: 'Trends im Cannabis-Bereich',
      subtitle: 'Technologie, Genetik und Methoden im Überblick',
      articles: trendsArticles,
      linkLabel: 'Markt & Beschaffung',
      linkHref: '/category/markt',
    },
  ];

  return (
    <>
      {/* ── Weekly sections ───────────────────────────── */}
      {sections.map(section => section.articles.length > 0 && (
        <section key={section.id} className="border-b border-slate-100 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase mb-2 ${section.eyebrowColor}`}>
                  {section.eyebrow}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{section.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{section.subtitle}</p>
              </div>
              {section.linkHref && (
                <Link href={section.linkHref as Route} className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                  {section.linkLabel}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {section.articles.map((article, i) => (
                <WeeklyCard key={article.slug} article={article} rank={i + 1} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── Social proof: meist gelesen ───────────────── */}
      {meistGelesenArticles.length > 0 && (
        <section className="border-b border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 tracking-widest uppercase mb-2">
                👥 Community-Favoriten
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Beliebt bei Growern</h2>
              <p className="mt-1 text-sm text-slate-400">Die meistgelesenen Artikel der Community</p>
            </div>
            <div className="space-y-1.5">
              {meistGelesenArticles.slice(0, 5).map((article, i) => {
                const sourceCount = article.sourceIds?.length ?? 0;
                return (
                  <div key={article.slug} className="relative">
                    <Link
                      href={`/studies/${article.slug}` as Route}
                      className="group flex items-center gap-4 rounded-xl border border-transparent bg-white px-5 py-3.5
                        hover:border-emerald-100 hover:shadow-sm hover:bg-emerald-50/20 transition-all duration-150"
                    >
                      <span className="w-6 text-center text-xs font-bold text-slate-300 flex-shrink-0 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-sm flex-shrink-0">
                        {CATEGORY_ICONS[article.category] ?? '📄'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {article.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{categoryLabels[article.category]}</p>
                      </div>
                      {/* Social proof badges */}
                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          🔥 Beliebt
                        </span>
                        {sourceCount > 0 && (
                          <span className="rounded-md bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            {sourceCount}
                          </span>
                        )}
                      </div>
                      <svg className="w-3.5 h-3.5 text-slate-200 group-hover:text-emerald-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <div className="absolute top-1/2 -translate-y-1/2 right-10">
                      <BookmarkButton slug={article.slug} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
