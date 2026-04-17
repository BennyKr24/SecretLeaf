'use client';

import type { TerpiraArticle } from '@/lib/terpira/types';
import { getCommunitySignals } from '@/lib/retention';

type Props = {
  article: TerpiraArticle;
  allArticles: TerpiraArticle[];
  limit?: number;
  compact?: boolean;
};

export default function CommunitySignals({ article, allArticles, limit = 3, compact = false }: Props) {
  const signals = getCommunitySignals(article, allArticles).slice(0, limit);

  if (signals.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {signals.map((signal) => (
        <span
          key={signal.key}
          className={`inline-flex items-center rounded-full border font-semibold ${signal.className} ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'}`}
        >
          {signal.label}
        </span>
      ))}
    </div>
  );
}