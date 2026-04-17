import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Route } from "next";
import { categoryLabels, difficultyLabels, getArticleBySlug, getArticleSources, wikiArticles } from "@/data/terpira/wiki";
import WikiReadingProgress from "@/components/WikiReadingProgress";
import WikiAskBot from "@/components/WikiAskBot";
import WikiArticleToc from "@/components/WikiArticleToc";
import HistoryTracker from "@/components/HistoryTracker";
import BookmarkButton from "@/components/BookmarkButton";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Nicht gefunden – SecretLeaf Wiki" };
  return {
    title: `${article.title} – SecretLeaf Wiki`,
    description: article.summary,
  };
}

const DIFFICULTY_META = {
  einsteiger:      { label: "Einsteiger",      color: "text-blue-700",   bg: "bg-blue-100" },
  fortgeschritten: { label: "Fortgeschritten", color: "text-amber-700",  bg: "bg-amber-100" },
  profi:           { label: "Profi",           color: "text-purple-700", bg: "bg-purple-100" },
} as const;

export default async function WikiArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  const relatedArticles = article.relatedSlugs
    .map((s) => wikiArticles.find((e) => e.slug === s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const articleSources = getArticleSources(article);
  const simpleExplainers = article.simpleExplainers ?? [
    { title: "Kurz erklärt", text: article.keyTakeaways[0] ?? "Dieser Artikel fasst das Thema kompakt und evidenzbasiert zusammen." },
    { title: "Warum relevant?", text: article.keyTakeaways[1] ?? "Die Inhalte unterstützen konsistente Entscheidungen zu Qualität und Risiko." },
  ];

  const diff = DIFFICULTY_META[article.difficulty];

  return (
    <>
      {/* ── Reading Progress Bar ─────────────────────────────── */}
      <WikiReadingProgress slug={article.slug} />
      {/* ── History Tracker (client-side, silent) ────────────── */}
      <HistoryTracker slug={article.slug} title={article.title} category={article.category} />

      <main className="min-h-screen bg-white">
        <article className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">

          {/* ── Breadcrumb & Header ──────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 sm:p-8 shadow-sm">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-5">
              <Link href={"/studies" as Route} className="hover:text-emerald-700 font-medium transition-colors">Wiki</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500">{categoryLabels[article.category]}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-medium truncate">{article.title}</span>
            </nav>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {categoryLabels[article.category]}
              </span>
              {diff && (
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${diff.color} ${diff.bg}`}>
                  {diff.label}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {article.readMinutes} Min
              </span>
              {articleSources.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                  🔬 {articleSources.length} Quellen
                </span>
              )}
              <span className="text-xs text-slate-400">Aktualisiert: {article.lastUpdated}</span>
              {/* Bookmark button */}
              <BookmarkButton slug={article.slug} size="md" className="ml-auto" />
            </div>

            {/* Titel */}
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              {article.title}
            </h1>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">{article.summary}</p>

            {/* Quick Facts */}
            {article.quickFacts.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {article.quickFacts.map((fact) => (
                  <div key={fact.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">{fact.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{fact.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Key Takeaways */}
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Kernpunkte</h2>
              <ul className="mt-2 space-y-1.5">
                {article.keyTakeaways.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-emerald-900">
                    <span className="text-emerald-500 flex-shrink-0 font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnungen */}
            {article.warnings && article.warnings.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-1.5">
                  ⚠️ Hinweis
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              {/* Abschnitte */}
              <div className="space-y-10">
                {article.sections.map((section, idx) => (
                  <section
                    id={`section-${idx + 1}`}
                    key={section.heading}
                    className="scroll-mt-24 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-xs font-bold
                        text-emerald-700 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">{section.heading}</h3>
                    </div>

                    <div className="space-y-3 text-base leading-7 text-slate-700 pl-10">
                      {section.content.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </div>

                    {section.checklist && section.checklist.length > 0 && (
                      <div className="ml-10 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                          ✅ Checkliste
                        </p>
                        <ul className="space-y-1.5">
                          {section.checklist.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-emerald-900">
                              <span className="flex-shrink-0 mt-0.5 text-emerald-500">□</span>
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
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-800 mb-3">Einfach erklärt</h2>
                <div className="space-y-3">
                  {simpleExplainers.map((box) => (
                    <div key={box.title} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-emerald-700">{box.title}</p>
                      <p className="mt-1 text-xs text-slate-600 leading-5">{box.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glossar */}
              {article.glossary && article.glossary.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Glossar</h3>
                  <div className="space-y-2">
                    {article.glossary.map((item) => (
                      <div key={item.term} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-800">{item.term}</p>
                        <p className="mt-0.5 text-xs text-slate-500 leading-5">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                {article.downloads && article.downloads.length > 0 && (
                  <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-cyan-900 mb-3">Downloads</h3>
                    <div className="space-y-2">
                      {article.downloads.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          download
                          className="block rounded-lg border border-cyan-200 bg-white px-3 py-2 hover:border-cyan-300 hover:bg-cyan-100"
                        >
                          <p className="text-sm font-semibold text-cyan-900">{item.title}</p>
                          <p className="text-xs text-cyan-700">{item.kind}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {/* Wiki-Bot Hinweis */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-800 mb-1">🤖 Wiki-Bot</p>
                <p className="text-xs text-emerald-700">
                  Fragen zu diesem Thema? Der Wiki-Bot fasst Inhalte zusammen und verlinkt
                  relevante Artikel. Unten rechts öffnen.
                </p>
              </div>

              {/* Quellen-Hinweis */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-700 mb-1">🔬 Quellen</p>
                <p className="text-xs text-slate-500">
                  Referenzen stehen unten im Artikel oder im{' '}
                  <Link href={"/studies/sources" as Route} className="text-emerald-600 hover:text-emerald-700 font-semibold">
                    Quellenregister
                  </Link>.
                </p>
              </div>
            </aside>
          </div>

          {/* ── FAQ ─────────────────────────────────────────────── */}
          {article.faq && article.faq.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-5">Häufige Fragen</h2>
              <div className="space-y-2">
                {article.faq.map((item) => (
                  <details key={item.question}
                    className="group rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                    <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-sm font-semibold text-slate-800
                      hover:bg-slate-100 transition-colors list-none">
                      {item.question}
                      <svg className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="border-t border-slate-200 px-4 py-3 text-sm leading-6 text-slate-600">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* ── Quellen ─────────────────────────────────────────── */}
          {articleSources.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h2 className="text-2xl font-bold text-slate-900">Quellen</h2>
                <Link href={"/studies/sources" as Route}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  → Gesamtregister
                </Link>
              </div>
              <ol className="space-y-3">
                {articleSources.map((source, idx) => (
                  <li key={source.id} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-xs font-bold
                      text-slate-500 flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{source.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{source.publisher} · {source.year}</p>
                      {source.doi && (
                        <p className="text-xs text-slate-400 mt-0.5">DOI: {source.doi}</p>
                      )}
                    </div>
                    <a href={source.url} target="_blank" rel="noreferrer"
                      className="flex-shrink-0 self-start rounded-lg border border-slate-200 bg-white
                        px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:border-emerald-300
                        hover:bg-emerald-50 transition-all">
                      Öffnen ↗
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* ── Verwandte Artikel ────────────────────────────────── */}
          {relatedArticles.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-5">Verwandte Artikel</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedArticles.map((entry) => (
                  <Link
                    key={entry.slug}
                      href={`/studies/${entry.slug}` as Route}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4
                      hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">
                      {categoryLabels[entry.category]}
                    </p>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {entry.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{entry.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Disclaimer ────────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-xs text-slate-500 shadow-sm">
            <strong className="text-slate-600">Redaktioneller Hinweis:</strong> Die Inhalte dienen der Wissensvermittlung
            und Aufklärung. Regionale Rechtslage, medizinische Fragen und regulatorische Anforderungen
            müssen stets separat durch Fachpersonal geprüft werden.
          </div>
        </article>
      </main>

      {/* ── Wiki-Bot (global) ─────────────────────────────────── */}
      <WikiAskBot />
    </>
  );
}
