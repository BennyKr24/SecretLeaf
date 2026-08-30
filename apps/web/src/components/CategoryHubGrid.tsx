import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import type { TerpiraArticle, TerpiraCategory } from '@/lib/terpira/types';
import { CATEGORY_ICONS, CATEGORY_ACCENT, CATEGORY_DESCRIPTIONS } from '@/lib/terpira/categoryIcons';
import { FileText } from 'lucide-react';

// Same order used by the category dropdown/filters elsewhere, kept in sync
// manually — the three cultivation-adjacent categories (anbau/diagnose/
// tutorials) lead since they're the highest-traffic, most content-dense areas.
const ORDERED_CATEGORIES: TerpiraCategory[] = [
  'anbau', 'diagnose', 'tutorials', 'genetik', 'chemie', 'terpene',
  'konsumformen', 'konzentrate', 'qualitaet',
  'sicherheit', 'medizin', 'recht', 'markt', 'werkzeuge',
];

type Props = {
  articles: TerpiraArticle[];
  categoryLabels: Record<string, string>;
  /** Optional locale-specific descriptions; falls back to the German CATEGORY_DESCRIPTIONS. */
  categoryDescriptions?: Record<string, string>;
  locale?: string;
};

export default function CategoryHubGrid({ articles, categoryLabels, categoryDescriptions, locale }: Props) {
  const descriptions = categoryDescriptions ?? CATEGORY_DESCRIPTIONS;
  const articleWord = locale === "en" ? "articles" : "Artikel";
  const counts = new Map<string, number>();
  for (const a of articles) counts.set(a.category, (counts.get(a.category) ?? 0) + 1);

  const categories = ORDERED_CATEGORIES.filter((cat) => categoryLabels[cat]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => {
        const count = counts.get(cat) ?? 0;
        const Icon = CATEGORY_ICONS[cat] ?? FileText;
        const accent = CATEGORY_ACCENT[cat] ?? 'text-muted-fg';
        const description = descriptions[cat];
        const empty = count === 0;

        return (
          <Link
            key={cat}
            href={(empty ? '#' : `/category/${cat}`) as Route}
            aria-disabled={empty}
            tabIndex={empty ? -1 : undefined}
            className={`group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-150 ${
              empty
                ? 'pointer-events-none opacity-50'
                : 'hover:border-emerald-300 hover:shadow-md active:scale-[0.99]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-background border border-border ${accent}`}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-fg">
                {count} {articleWord}
              </span>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                {categoryLabels[cat] ?? cat}
              </h3>
              {description && (
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-fg line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
