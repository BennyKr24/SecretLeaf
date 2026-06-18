'use client';

import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { Analytics } from '@/lib/analytics';

// ── Category Filter Link ──────────────────────────────────────────────────────
// Ersetzt einfache <Link>-Komponenten im Kategorie-Filter der Updates-Listenseite.
// Feuert update_category_viewed wenn eine spezifische Kategorie ausgewählt wird.

type CategoryFilterLinkProps = {
  href: string;
  category: string; // Leerer String = "Alle" — kein Analytics-Event
  isActive: boolean;
  children: React.ReactNode;
};

export function CategoryFilterLink({
  href,
  category,
  isActive,
  children,
}: CategoryFilterLinkProps) {
  const handleClick = () => {
    if (category) {
      Analytics.updateCategoryViewed(category);
    }
  };

  return (
    <Link
      href={href as Route}
      onClick={handleClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        isActive
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-muted-fg hover:border-primary/30 hover:text-foreground'
      }`}
    >
      {children}
    </Link>
  );
}
