'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { TerpiraArticle, TerpiraDifficulty } from '@/lib/terpira/types';

const CATEGORY_ICONS: Record<string, string> = {
  anbau: '🌱', genetik: '🧬', chemie: '⚗️', terpene: '🌺',
  medizin: '🩺', konsumformen: '💨', konzentrate: '💎', recht: '⚖️',
  sicherheit: '🛡️', qualitaet: '🔬', markt: '📊', werkzeuge: '🛠️',
};

const DIFFICULTY_STYLE: Record<TerpiraDifficulty, { pill: string; dot: string }> = {
  einsteiger:     { pill: 'text-blue-600 bg-blue-50 border-blue-100',   dot: 'bg-blue-400' },
  fortgeschritten:{ pill: 'text-amber-600 bg-amber-50 border-amber-100', dot: 'bg-amber-400' },
  profi:          { pill: 'text-purple-600 bg-purple-50 border-purple-100', dot: 'bg-purple-400' },
};

const DIFFICULTY_LABEL: Record<TerpiraDifficulty, string> = {
  einsteiger: 'Einsteiger',
  fortgeschritten: 'Fortgeschritten',
  profi: 'Profi',
};

type Props = {
  article: TerpiraArticle;
  categoryLabel: string;
  snippet?: string | null;
};

export default function StudyListItem({ article, categoryLabel, snippet }: Props) {
  const sourceCount = article.sourceIds?.length ?? 0;
  const diff = DIFFICULTY_STYLE[article.difficulty];

  return (
    <Link
      href={`/studies/${article.slug}` as Route}
      className="group flex items-center gap-4 rounded-xl border border-transparent bg-white px-5 py-4
        hover:border-slate-200 hover:shadow-sm transition-all duration-150"
    >
      {/* Icon container */}
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50
        group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors duration-150 text-base flex-shrink-0">
        {CATEGORY_ICONS[article.category] ?? '📄'}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[13.5px] font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-1">
          {article.title}
        </h3>
        <p className="mt-0.5 text-xs text-slate-400 line-clamp-1 leading-relaxed">
          {snippet ?? article.summary}
        </p>
      </div>

      {/* Meta */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${diff.pill}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} />
          {DIFFICULTY_LABEL[article.difficulty]}
        </span>
        <span className="text-xs text-slate-300 tabular-nums">{article.readMinutes} Min</span>
        {sourceCount > 0 && (
          <span className="rounded-md bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            {sourceCount}
          </span>
        )}
      </div>

      {/* Arrow */}
      <svg className="w-3.5 h-3.5 text-slate-200 group-hover:text-emerald-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
