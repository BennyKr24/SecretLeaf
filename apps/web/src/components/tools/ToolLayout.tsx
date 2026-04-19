'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { ToolMeta, ToolCategory } from '@/lib/tools/types';
import { toolCategoryLabel, toolCategoryIcon, toolCategoryColor } from '@/lib/tools/types';
import { getToolBySlug } from '@/lib/tools/registry';
import type { ReactNode } from 'react';

type Props = {
  meta: ToolMeta;
  tips?: string[];
  relatedArticles?: Array<{ slug: string; title: string; category: string; readMinutes?: number }>;
  children: ReactNode;
};

const categoryTopBar: Record<ToolCategory, string> = {
  klima: 'bg-cyan-500',
  licht: 'bg-amber-500',
  naehrstoffe: 'bg-emerald-500',
  planung: 'bg-violet-500',
};

const categoryIconBg: Record<ToolCategory, string> = {
  klima: 'bg-cyan-50 ring-cyan-200',
  licht: 'bg-amber-50 ring-amber-200',
  naehrstoffe: 'bg-emerald-50 ring-emerald-200',
  planung: 'bg-violet-50 ring-violet-200',
};

const difficultyLabel = (d: ToolMeta['difficulty']) =>
  d === 'einsteiger' ? 'Einsteiger' : d === 'fortgeschritten' ? 'Fortgeschritten' : 'Profi';

export default function ToolLayout({ meta, tips, relatedArticles, children }: Props) {
  const relatedTools = meta.relatedToolSlugs
    .map((s) => getToolBySlug(s))
    .filter(Boolean) as ToolMeta[];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <Link
          href={'/tools' as Route}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700"
        >
          <span className="text-base leading-none">←</span> Werkzeuge
        </Link>

        {/* Header card with colored top bar */}
        <header className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className={`h-1.5 w-full ${categoryTopBar[meta.category]}`} />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl ring-1 ${categoryIconBg[meta.category]}`}>
                {meta.icon}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${toolCategoryColor[meta.category]}`}>
                    {toolCategoryIcon[meta.category]} {toolCategoryLabel[meta.category]}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                    {difficultyLabel(meta.difficulty)}
                  </span>
                </div>
                <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{meta.title}</h1>
                <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{meta.shortDescription}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        {children}

        {/* Praxis-Tipps */}
        {tips && tips.length > 0 && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-slate-900">💡 Praxistipps</h3>
            <ul className="space-y-2.5">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="mt-0.5 flex-shrink-0 font-bold text-emerald-500">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cross-tool navigation */}
        {relatedTools.length > 0 && (
          <section className="mt-8">
            <h3 className="mb-4 text-sm font-bold text-slate-900">Als nächstes berechnen</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}` as Route}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xl ring-1 ${categoryIconBg[tool.category]}`}>
                    {tool.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-emerald-700">
                      {tool.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">{tool.shortDescription}</p>
                  </div>
                  <span className="ml-auto flex-shrink-0 text-slate-300 transition-colors group-hover:text-emerald-500">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="mt-8">
            <h3 className="mb-4 text-sm font-bold text-slate-900">Verwandte Fachartikel</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/studies/${article.slug}` as Route}
                  className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{article.category}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2 transition-colors group-hover:text-emerald-700">
                    {article.title}
                  </p>
                  {article.readMinutes && (
                    <p className="mt-2 text-xs text-slate-400">{article.readMinutes} min Lesezeit</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

