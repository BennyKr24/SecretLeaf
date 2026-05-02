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
  einsteiger:     { pill: 'text-blue-600 bg-blue-50 border-blue-100',    dot: 'bg-blue-400' },
  fortgeschritten:{ pill: 'text-amber-600 bg-amber-50 border-amber-100', dot: 'bg-amber-400' },
  profi:          { pill: 'text-purple-600 bg-purple-50 border-purple-100', dot: 'bg-purple-400' },
};

const DIFFICULTY_LABEL: Record<TerpiraDifficulty, string> = {
  einsteiger: 'Einsteiger',
  fortgeschritten: 'Fortgeschritten',
  profi: 'Profi',
};

/** Maps qualityScore 1–5 to a visual indicator */
function QualityDots({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`Qualität ${score}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= score ? 'bg-emerald-500' : 'bg-border'
          }`}
        />
      ))}
    </span>
  );
}

type Props = {
  article: TerpiraArticle;
  categoryLabel: string;
  snippet?: string | null;
};

export default function StudyListItem({ article, snippet }: Props) {
  const diff = DIFFICULTY_STYLE[article.difficulty];
  const qualityScore = article.qualityScore ?? 0;
  // Show growValue if available, otherwise fall back to search snippet or summary
  const insight = article.growValue ?? snippet ?? article.summary;
  // Show at most 4 tags
  const visibleTags = article.tags.slice(0, 4);

  return (
    <Link
      href={`/studies/${article.slug}` as Route}
      className="group flex items-start gap-4 rounded-xl border border-transparent bg-card px-5 py-4
        hover:border-emerald-200 hover:bg-emerald-50/10 hover:shadow-sm transition-all duration-150"
    >
      {/* Icon */}
      <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg
        border border-border bg-background group-hover:bg-emerald-50 group-hover:border-emerald-200
        transition-colors duration-150 text-base">
        {CATEGORY_ICONS[article.category] ?? '📄'}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="text-[13.5px] font-semibold text-foreground group-hover:text-emerald-700
          transition-colors leading-snug line-clamp-1">
          {article.title}
        </h3>

        {/* Grow insight — the practical value for the grower */}
        {insight && (
          <p className="mt-1 text-xs text-muted-fg leading-relaxed line-clamp-2">
            {article.growValue ? (
              <span className="font-medium text-emerald-600 mr-1">→</span>
            ) : null}
            {insight}
          </p>
        )}

        {/* Tags */}
        {visibleTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border bg-background px-1.5 py-0.5
                  text-[10px] font-medium text-muted-fg"
              >
                {tag}
              </span>
            ))}
            {article.tags.length > 4 && (
              <span className="rounded-md border border-border bg-background px-1.5 py-0.5
                text-[10px] font-medium text-muted-fg">
                +{article.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="hidden sm:flex flex-shrink-0 flex-col items-end gap-1.5 pt-0.5">
        {qualityScore > 0 && <QualityDots score={qualityScore} />}
        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium ${diff.pill}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} />
          {DIFFICULTY_LABEL[article.difficulty]}
        </span>
        <span className="text-[10px] text-muted-fg tabular-nums">{article.readMinutes} Min</span>
      </div>

      {/* Arrow */}
      <svg className="mt-1 w-3.5 h-3.5 flex-shrink-0 text-border group-hover:text-emerald-400 transition-colors"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

