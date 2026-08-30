import { Link } from '@/i18n/navigation';
import type { Metadata, Route } from 'next';
import { pageAlternates } from '@/lib/i18n/metadata';
import {
  getAllUpdates,
  getCategoryMeta,
  getAvailableCategories,
  getBadgeClasses,
  getCategoryMetaFor,
  formatUpdateDate,
} from '@/lib/updates';
import type { UpdateEntry } from '@/lib/updates';
import { CategoryFilterLink } from './client';
import { Leaf } from 'lucide-react';

// ── Metadata ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://secretleaf.net';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  const description = en
    ? 'All SecretLeaf updates: new features, improvements and database expansions for the Grow OS.'
    : 'Alle SecretLeaf Updates: neue Features, Verbesserungen und Datenbank-Erweiterungen für das Grow OS.';
  return {
    title: 'Updates – SecretLeaf',
    description,
    alternates: pageAlternates('/updates', locale),
    openGraph: {
      title: 'Updates – SecretLeaf',
      description,
      url: `${BASE_URL}/updates`,
      type: 'website',
    },
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const meta = getCategoryMetaFor(category);
  const cls = getBadgeClasses(category);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {meta.label}
    </span>
  );
}

function VersionBadge({ version }: { version: string }) {
  return (
    <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-[11px] text-muted-fg">
      {version}
    </span>
  );
}

/** Kompakte Karte für reguläre Updates in der Grid-Ansicht. */
function UpdateCard({ update }: { update: UpdateEntry }) {
  const sectionCount =
    (update.sections.neu?.length ?? 0) +
    (update.sections.verbessert?.length ?? 0) +
    (update.sections.datenbank ? 1 : 0) +
    (update.sections.diagnose?.length ?? 0);

  return (
    <Link
      href={`/updates/${update.slug}` as Route}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-[border-color,background-color] duration-200 hover:border-primary/30 hover:bg-surface"
    >
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={update.category} />
        {update.version && <VersionBadge version={update.version} />}
        <time className="ml-auto text-[11px] text-muted-fg">
          {formatUpdateDate(update.date)}
        </time>
      </div>

      {/* Title */}
      <h2 className="text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
        {update.title}
      </h2>

      {/* Summary */}
      <p className="line-clamp-2 text-sm leading-relaxed text-muted-fg">
        {update.summary}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        {sectionCount > 0 && (
          <span className="text-[11px] text-muted-fg">
            {sectionCount} {sectionCount === 1 ? 'Abschnitt' : 'Abschnitte'}
          </span>
        )}
        <span className="ml-auto text-xs font-medium text-primary">
          Lesen →
        </span>
      </div>
    </Link>
  );
}

/** Große Featured-Karte mit Inhalts-Vorschau. */
function FeaturedCard({ update }: { update: UpdateEntry }) {
  const previewSection =
    update.sections.neu?.[0] ?? update.sections.verbessert?.[0] ?? update.sections.diagnose?.[0];

  return (
    <Link
      href={`/updates/${update.slug}` as Route}
      className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-primary/20 bg-card p-7 transition-[border-color,background-color] duration-200 hover:border-primary/40 hover:bg-surface sm:p-8"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Neues Update
        </span>
        <CategoryBadge category={update.category} />
        {update.version && <VersionBadge version={update.version} />}
        <time className="ml-auto text-[11px] text-muted-fg">
          {formatUpdateDate(update.date)}
        </time>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
        {update.title}
      </h2>

      {/* Summary */}
      <p className="max-w-2xl text-sm leading-relaxed text-muted-fg">
        {update.summary}
      </p>

      {/* Content preview */}
      {previewSection && (
        <div className="rounded-xl border border-border bg-surface/60 p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">
            {update.sections.neu ? 'Neu' : update.sections.verbessert ? 'Verbessert' : 'Diagnose'}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {previewSection.headline}
          </p>
          {previewSection.items && (
            <ul className="mt-2.5 space-y-1.5">
              {previewSection.items.slice(0, 3).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-fg">
                  <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-1 text-sm font-semibold text-primary">
        Vollständiges Update lesen →
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const allUpdates = getAllUpdates();
  const categoryMeta = getCategoryMeta();
  const availableCategories = getAvailableCategories();

  const filteredUpdates = category
    ? allUpdates.filter((u) => u.category === category)
    : allUpdates;

  const featuredUpdate = filteredUpdates.find((u) => u.featured);
  const regularUpdates = filteredUpdates.filter((u) => !u.featured);

  return (
    <main className="min-h-screen bg-background">
      {/* ── Header ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
            SecretLeaf
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Updates
          </h1>
          <p className="mt-2 max-w-xl text-base text-muted-fg">
            Neue Features, Verbesserungen und Datenbank-Erweiterungen — alles,
            was sich beim Grow OS verbessert hat.
          </p>

          {/* Category filter */}
          <div className="mt-7 flex flex-wrap gap-2">
            <CategoryFilterLink
              href="/updates"
              category=""
              isActive={!category}
            >
              Alle{' '}
              <span className="ml-1 text-[11px] tabular-nums opacity-60">
                {allUpdates.length}
              </span>
            </CategoryFilterLink>

            {availableCategories.map((cat) => {
              const meta = categoryMeta[cat] ?? { label: cat };
              const isActive = category === cat;
              const count = allUpdates.filter((u) => u.category === cat).length;
              return (
                <CategoryFilterLink
                  key={cat}
                  href={`/updates?category=${cat}`}
                  category={cat}
                  isActive={isActive}
                >
                  {meta.label}{' '}
                  <span className="ml-1 text-[11px] tabular-nums opacity-60">
                    {count}
                  </span>
                </CategoryFilterLink>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
        {filteredUpdates.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <Leaf className="h-6 w-6 text-muted-fg" strokeWidth={1.5} />
            <p className="text-base font-semibold text-foreground">
              Keine Updates in dieser Kategorie
            </p>
            <p className="text-sm text-muted-fg">
              Probiere einen anderen Filter oder sieh dir alle Updates an.
            </p>
            <Link
              href="/updates"
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              Alle Updates →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {featuredUpdate && <FeaturedCard update={featuredUpdate} />}

            {regularUpdates.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {regularUpdates.map((update) => (
                  <UpdateCard key={update.slug} update={update} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
