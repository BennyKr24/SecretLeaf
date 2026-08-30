import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import type { Route } from "next";
import { categoryLabels, getArticleBySlug, getArticleSources, wikiArticles } from "@/data/terpira/wiki";
import { localizeArticle, localizeCategoryLabel, isArticleTranslated } from "@/lib/i18n/localizeContent";
import { pageAlternates } from "@/lib/i18n/metadata";
import WikiReadingProgress from "@/components/WikiReadingProgress";
import WikiAskBot from "@/components/WikiAskBot";
import WikiArticleToc from "@/components/WikiArticleToc";
import HistoryTracker from "@/components/HistoryTracker";
import BookmarkButton from "@/components/BookmarkButton";
import CommunitySignals from '@/components/CommunitySignals';
import { WikiArticleOpenTracker } from './client';
import { Microscope, CheckCircle2, AlertTriangle, Bot, Square } from 'lucide-react';

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "article" });
  const found = getArticleBySlug(slug);
  if (!found) return { title: t("notFound") };
  const article = localizeArticle(found, locale);
  return {
    title: `${article.title} – ${t("metaTitleSuffix")}`,
    description: article.summary,
    alternates: pageAlternates(`/studies/${slug}`, locale),
  };
}

const DIFFICULTY_META = {
  einsteiger:      { label: "Einsteiger",      color: "text-blue-700 dark:text-blue-400",   bg: "bg-blue-100 dark:bg-blue-950/40" },
  fortgeschritten: { label: "Fortgeschritten", color: "text-amber-700 dark:text-amber-400",  bg: "bg-amber-100 dark:bg-amber-950/40" },
  profi:           { label: "Profi",           color: "text-purple-700", bg: "bg-purple-100" },
} as const;

export default async function WikiArticlePage({ params }: PageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "article" });
  const found = getArticleBySlug(slug);

  if (!found) notFound();

  const article = localizeArticle(found, locale);
  const showPartialNote = !isArticleTranslated(found, locale);

  const relatedArticles = article.relatedSlugs
    .map((s) => wikiArticles.find((e) => e.slug === s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .map((e) => localizeArticle(e, locale));

  const articleSources = getArticleSources(article);
  const simpleExplainers = article.simpleExplainers ?? [
    { title: t("explainerShort"), text: article.keyTakeaways[0] ?? t("explainerShortText") },
    { title: t("explainerWhy"), text: article.keyTakeaways[1] ?? t("explainerWhyText") },
  ];

  const diff = DIFFICULTY_META[article.difficulty];

  return (
    <>
      {/* ── Reading Progress Bar ─────────────────────────────── */}
      <WikiReadingProgress
        slug={article.slug}
        title={article.title}
        category={article.category}
        readMinutes={article.readMinutes}
      />
      <WikiArticleOpenTracker slug={article.slug} />
      {/* ── History Tracker (client-side, silent) ────────────── */}
      <HistoryTracker slug={article.slug} title={article.title} category={article.category} />

      <main className="min-h-screen bg-card">
        <article className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">

          {showPartialNote && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-300">
              {t("notTranslated")}
            </div>
          )}

          {/* ── Breadcrumb & Header ──────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card/90 p-6 sm:p-8 shadow-sm">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-muted-fg mb-5">
              <Link href={"/studies" as Route} className="hover:text-emerald-700 dark:text-emerald-400 font-medium transition-colors">{t("breadcrumbStudies")}</Link>
              <span className="text-muted-fg">/</span>
              <span className="text-muted-fg">{localizeCategoryLabel(article.category, categoryLabels[article.category], locale)}</span>
              <span className="text-muted-fg">/</span>
              <span className="text-foreground font-medium truncate">{article.title}</span>
            </nav>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {localizeCategoryLabel(article.category, categoryLabels[article.category], locale)}
              </span>
              {diff && (
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${diff.color} ${diff.bg}`}>
                  {diff.label}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground/80">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("readMinutes", { count: article.readMinutes })}
              </span>
              {articleSources.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 dark:bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                  <Microscope className="h-3 w-3" strokeWidth={2} /> {t("sourceCount", { count: articleSources.length })}
                </span>
              )}
              <span className="text-xs text-muted-fg">{t("updated", { date: article.lastUpdated })}</span>
              {/* Bookmark button */}
              <BookmarkButton slug={article.slug} size="md" className="ml-auto" />
            </div>

            <div className="mt-3">
              <CommunitySignals article={article} allArticles={wikiArticles} />
            </div>

            {/* Titel */}
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              {article.title}
            </h1>
            <p className="mt-3 text-base text-foreground/80 leading-relaxed">{article.summary}</p>

            {/* Quick Facts */}
            {article.quickFacts.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {article.quickFacts.map((fact) => (
                  <div key={fact.label} className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-fg font-medium">{fact.label}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{fact.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Key Takeaways */}
            <div className="mt-5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">{t("keyPoints")}</h2>
              <ul className="mt-2 space-y-1.5">
                {article.keyTakeaways.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-emerald-900">
                    <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5 h-4 w-4" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnungen */}
            {article.warnings && article.warnings.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" strokeWidth={2} /> {t("note")}
                </h2>
                <ul className="mt-2 space-y-1 pl-4 text-sm text-amber-900">
                  {article.warnings.map((w) => (
                    <li key={w} className="list-disc">{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Hauptinhalt + Sidebar ────────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

            {/* Hauptinhalt */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              {/* Abschnitte */}
              <div className="space-y-10">
                {article.sections.map((section, idx) => (
                  <section
                    id={`section-${idx + 1}`}
                    key={section.heading}
                    className="scroll-mt-24 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-xs font-bold
                        text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-xl font-bold text-foreground">{section.heading}</h3>
                    </div>

                    <div className="space-y-3 text-base leading-7 text-foreground/80 pl-10">
                      {section.content.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </div>

                    {section.checklist && section.checklist.length > 0 && (
                      <div className="ml-10 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 p-4">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" strokeWidth={2} /> {t("checklist")}
                        </p>
                        <ul className="space-y-1.5">
                          {section.checklist.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-emerald-900">
                              <Square className="flex-shrink-0 mt-0.5 h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">

              {/* Aktives Inhaltsverzeichnis */}
              <WikiArticleToc sections={article.sections} />

              {/* Erklärt-Boxen */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h2 className="text-sm font-bold text-foreground mb-3">{t("simplyExplained")}</h2>
                <div className="space-y-3">
                  {simpleExplainers.map((box) => (
                    <div key={box.title} className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{box.title}</p>
                      <p className="mt-1 text-xs text-foreground/80 leading-5">{box.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glossar */}
              {article.glossary && article.glossary.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-3">{t("glossary")}</h3>
                  <div className="space-y-2">
                    {article.glossary.map((item) => (
                      <div key={item.term} className="rounded-lg border border-border bg-background p-3">
                        <p className="text-xs font-bold text-foreground">{item.term}</p>
                        <p className="mt-0.5 text-xs text-muted-fg leading-5">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                {article.downloads && article.downloads.length > 0 && (
                  <div className="rounded-2xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50 dark:bg-cyan-950/30 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-cyan-900 mb-3">{t("downloads")}</h3>
                    <div className="space-y-2">
                      {article.downloads.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          download
                          className="block rounded-lg border border-cyan-200 dark:border-cyan-900/40 bg-card px-3 py-2 hover:border-cyan-300 hover:bg-cyan-100 dark:bg-cyan-950/40"
                        >
                          <p className="text-sm font-semibold text-cyan-900">{item.title}</p>
                          <p className="text-xs text-cyan-700 dark:text-cyan-400">{item.kind}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {/* Wiki-Bot Hinweis */}
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 p-4">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1 flex items-center gap-1"><Bot className="h-3.5 w-3.5" strokeWidth={2} /> {t("assistant")}</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {t("assistantHint")}
                </p>
              </div>

              {/* Quellen-Hinweis */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-xs font-semibold text-foreground/80 mb-1 flex items-center gap-1"><Microscope className="h-3.5 w-3.5" strokeWidth={2} /> {t("sources")}</p>
                <p className="text-xs text-muted-fg">
                  {t("sourcesHint")}{' '}
                  <Link href={"/studies/sources" as Route} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold">
                    {t("sourceRegister")}
                  </Link>.
                </p>
              </div>
            </aside>
          </div>

          {/* ── FAQ ─────────────────────────────────────────────── */}
          {article.faq && article.faq.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-5">{t("faq")}</h2>
              <div className="space-y-2">
                {article.faq.map((item) => (
                  <details key={item.question}
                    className="group rounded-xl border border-border bg-background overflow-hidden">
                    <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-sm font-semibold text-foreground
                      hover:bg-background transition-colors list-none">
                      {item.question}
                      <svg className="w-4 h-4 text-muted-fg flex-shrink-0 transition-transform group-open:rotate-180"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="border-t border-border px-4 py-3 text-sm leading-6 text-foreground/80">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* ── Quellen ─────────────────────────────────────────── */}
          {articleSources.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h2 className="text-2xl font-bold text-foreground">{t("sources")}</h2>
                <Link href={"/studies/sources" as Route}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors">
                  {t("fullRegister")}
                </Link>
              </div>
              <ol className="space-y-3">
                {articleSources.map((source, idx) => (
                  <li key={source.id} className="flex gap-3 rounded-xl border border-border bg-background p-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-border text-xs font-bold
                      text-muted-fg flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{source.title}</p>
                      <p className="text-xs text-muted-fg mt-0.5">{source.publisher} · {source.year}</p>
                      {source.doi && (
                        <p className="text-xs text-muted-fg mt-0.5">DOI: {source.doi}</p>
                      )}
                    </div>
                    <a href={source.url} target="_blank" rel="noreferrer"
                      className="flex-shrink-0 self-start rounded-lg border border-border bg-card
                        px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:border-emerald-300
                        hover:bg-emerald-50 dark:bg-emerald-950/30 transition-[border-color,background-color] duration-150">
                      {t("open")}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* ── Verwandte Artikel ────────────────────────────────── */}
          {relatedArticles.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-5">{t("relatedArticles")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedArticles.map((entry) => (
                  <Link
                    key={entry.slug}
                      href={`/studies/${entry.slug}` as Route}
                    className="rounded-xl border border-border bg-background p-4
                      hover:border-emerald-300 hover:bg-emerald-50 dark:bg-emerald-950/30 transition-[border-color,background-color] duration-150 group"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">
                      {localizeCategoryLabel(entry.category, categoryLabels[entry.category], locale)}
                    </p>
                    <p className="text-sm font-bold text-foreground group-hover:text-emerald-800 dark:text-emerald-400 transition-colors">
                      {entry.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-fg line-clamp-2">{entry.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Disclaimer ────────────────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-background px-6 py-4 text-xs text-muted-fg shadow-sm">
            <strong className="text-foreground/80">{t("editorialNoteLabel")}</strong> {t("editorialNoteText")}
          </div>
        </article>
      </main>

      {/* ── Wiki-Bot (global) ─────────────────────────────────── */}
      <WikiAskBot />
    </>
  );
}
