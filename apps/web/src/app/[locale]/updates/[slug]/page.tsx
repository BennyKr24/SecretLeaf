import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import type { Metadata, Route } from 'next';
import { pageAlternates } from '@/lib/i18n/metadata';
import {
  getAllUpdateSlugs,
  getUpdateBySlug,
  getCategoryMetaFor,
  getBadgeClasses,
  formatUpdateDate,
} from '@/lib/updates';
import type { UpdateSection, UpdateDatenbankSection, UpdateCta } from '@/lib/updates';
import {
  UpdateViewTracker,
  UpdateCtaButton,
  UpdateNewsletterBlock,
} from './client';

// ── Static params + Metadata ──────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://secretleaf.net';

export function generateStaticParams() {
  return getAllUpdateSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const update = getUpdateBySlug(slug);
  if (!update) return { title: 'Update nicht gefunden – SecretLeaf' };

  const meta = getCategoryMetaFor(update.category);

  return {
    title: `${update.title} – SecretLeaf Updates`,
    description: update.summary,
    alternates: pageAlternates(`/updates/${slug}`, locale),
    openGraph: {
      title: update.title,
      description: update.summary,
      url: `${BASE_URL}/updates/${slug}`,
      type: 'article',
      publishedTime: update.date,
      tags: [meta.label, 'SecretLeaf', 'Grow OS'],
    },
  };
}

// ── Section renderers ─────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-primary">
      {text}
    </p>
  );
}

function Divider() {
  return <hr className="border-border" />;
}

/** Karte für einen einzelnen Unterpunkt (Neu / Verbessert / Diagnose). */
function SectionCard({ section }: { section: UpdateSection }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="text-base font-semibold text-foreground">
        {section.headline}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-fg">{section.body}</p>
      {section.items && (
        <ul className="mt-4 space-y-2">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NeuSection({ items }: { items: UpdateSection[] }) {
  return (
    <section>
      <SectionLabel text="Neu" />
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <SectionCard key={i} section={item} />
        ))}
      </div>
    </section>
  );
}

function VerbessertSection({ items }: { items: UpdateSection[] }) {
  return (
    <section>
      <SectionLabel text="Verbessert" />
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <SectionCard key={i} section={item} />
        ))}
      </div>
    </section>
  );
}

function DiagnoseSection({ items }: { items: UpdateSection[] }) {
  return (
    <section>
      <SectionLabel text="Diagnose" />
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <SectionCard key={i} section={item} />
        ))}
      </div>
    </section>
  );
}

function DatenbankSection({ section }: { section: UpdateDatenbankSection }) {
  return (
    <section>
      <SectionLabel text="Datenbank" />
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-base font-semibold text-foreground">
          {section.headline}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-fg">{section.body}</p>

        {section.counts && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(section.counts).map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-card px-4 py-3 text-center"
              >
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {typeof value === 'number' && value > 0 ? `+${value}` : value}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-muted-fg">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PerformanceSection({ items }: { items: string[] }) {
  return (
    <section>
      <SectionLabel text="Performance" />
      <div className="rounded-xl border border-border bg-surface p-5">
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FixesSection({ items }: { items: string[] }) {
  return (
    <section>
      <SectionLabel text="Korrekturen" />
      <div className="rounded-xl border border-border bg-surface p-5">
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-muted-fg">
              <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function StatsSection({ stats }: { stats: Record<string, string | number> }) {
  return (
    <section>
      <SectionLabel text="Zahlen dieses Releases" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Object.entries(stats).map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-surface p-5 text-center"
          >
            <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
            <p className="mt-1.5 text-xs leading-snug text-muted-fg">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function NextStepsSection({ items }: { items: string[] }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-fg">
        Als Nächstes
      </p>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-fg">
            <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-border" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Feature-CTA: direkt ins Produkt führen. Nur rendern wenn cta vorhanden. */
function CtaSection({ cta, slug, category }: { cta: UpdateCta; slug: string; category: string }) {
  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-primary">
        Direkt ausprobieren
      </p>
      <p className="mb-5 text-sm text-muted-fg">
        Das Feature ist live — starte jetzt.
      </p>
      <UpdateCtaButton cta={cta} slug={slug} category={category} />
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const update = getUpdateBySlug(slug);

  if (!update) notFound();

  const categoryMeta = getCategoryMetaFor(update.category);
  const badgeCls = getBadgeClasses(update.category);
  const sections = update.sections;

  // ── JSON-LD structured data (TechArticle) ────────────────────────────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: update.title,
    description: update.summary,
    datePublished: update.date,
    url: `${BASE_URL}/updates/${update.slug}`,
    keywords: [categoryMeta.label, 'SecretLeaf', 'Grow OS', 'Cannabis Anbau'].join(', '),
    publisher: {
      '@type': 'Organization',
      name: 'SecretLeaf',
      url: BASE_URL,
    },
  };

  return (
    <>
      {/* JSON-LD: von Suchmaschinen für Rich Snippets ausgewertet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Analytics: feuert update_viewed beim Seitenaufruf */}
      <UpdateViewTracker
        slug={update.slug}
        category={update.category}
        version={update.version}
        featured={update.featured}
      />
    <main className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-muted-fg">
            <Link href="/" className="hover:text-foreground">
              SecretLeaf
            </Link>
            <span>/</span>
            <Link href={'/updates' as Route} className="hover:text-foreground">
              Updates
            </Link>
            <span>/</span>
            <span className="text-foreground">{update.title}</span>
          </nav>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${badgeCls}`}
            >
              {categoryMeta.label}
            </span>
            {update.version && (
              <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-[11px] text-muted-fg">
                {update.version}
              </span>
            )}
            {update.featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Neues Update
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mt-5 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {update.title}
          </h1>

          {/* Date */}
          <time className="mt-3 block text-sm text-muted-fg">
            {formatUpdateDate(update.date)}
          </time>

          {/* Summary */}
          <p className="mt-4 text-base leading-relaxed text-muted-fg">
            {update.summary}
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <article className="mx-auto max-w-3xl space-y-8 px-5 py-10 sm:py-14">
        {/* Stats (Major Release) */}
        {update.stats && (
          <>
            <StatsSection stats={update.stats} />
            <Divider />
          </>
        )}

        {/* Neu */}
        {sections.neu && sections.neu.length > 0 && (
          <>
            <NeuSection items={sections.neu} />
            <Divider />
          </>
        )}

        {/* Verbessert */}
        {sections.verbessert && sections.verbessert.length > 0 && (
          <>
            <VerbessertSection items={sections.verbessert} />
            <Divider />
          </>
        )}

        {/* Datenbank */}
        {sections.datenbank && (
          <>
            <DatenbankSection section={sections.datenbank} />
            <Divider />
          </>
        )}

        {/* Diagnose */}
        {sections.diagnose && sections.diagnose.length > 0 && (
          <>
            <DiagnoseSection items={sections.diagnose} />
            <Divider />
          </>
        )}

        {/* Performance */}
        {sections.performance && sections.performance.length > 0 && (
          <>
            <PerformanceSection items={sections.performance} />
            <Divider />
          </>
        )}

        {/* Korrekturen */}
        {sections.fixes && sections.fixes.length > 0 && (
          <>
            <FixesSection items={sections.fixes} />
            <Divider />
          </>
        )}

        {/* Als Nächstes */}
        {sections.nextSteps && sections.nextSteps.length > 0 && (
          <NextStepsSection items={sections.nextSteps} />
        )}

        {/* Feature-CTA */}
        {update.cta && (
          <CtaSection cta={update.cta} slug={update.slug} category={update.category} />
        )}

        {/* Newsletter */}
        <UpdateNewsletterBlock />

        {/* Footer signature */}
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-fg">
            Feedback und Ideen sind willkommen.
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            SecretLeaf Team 🌿
          </p>
          <Link
            href={'/updates' as Route}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted-fg transition-colors hover:border-primary/30 hover:text-foreground"
          >
            ← Alle Updates
          </Link>
        </div>
      </article>
    </main>
    </>
  );
}
