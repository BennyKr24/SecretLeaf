import Link from "next/link";
import type { Route } from "next";
import { wikiArticles, sourceRegister, categoryLabels } from "@/data/terpira/wiki";
import type { TerpiraArticle, TerpiraCategory } from "@/lib/terpira/types";

/* ── Icon & style maps ─────────────────────────────────────────────────── */

const CATEGORY_ICONS: Record<string, string> = {
  anbau: '🌱', genetik: '🧬', chemie: '⚗️', terpene: '🌺',
  medizin: '🩺', konsumformen: '💨', konzentrate: '💎', recht: '⚖️',
  sicherheit: '🛡️', qualitaet: '🔬', markt: '📊', werkzeuge: '🛠️',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  einsteiger: 'Einsteiger',
  fortgeschritten: 'Fortgeschritten',
  profi: 'Profi',
};

const DIFFICULTY_DOT: Record<string, string> = {
  einsteiger: 'bg-blue-400',
  fortgeschritten: 'bg-amber-400',
  profi: 'bg-purple-400',
};

/* ── Category descriptions for section headers ─────────────────────────── */

const CATEGORY_DESCRIPTIONS: Partial<Record<TerpiraCategory, string>> = {
  anbau:         'Alles rund um Anbau, Pflege und Ernte – von der Keimung bis zur Trocknung.',
  genetik:       'Genetik, Züchtung und Sortenwahl für gezielte Ergebnisse.',
  chemie:        'Nährstoffe, Substrate und chemische Grundlagen für gesundes Wachstum.',
  terpene:       'Terpenprofile, Aromen und deren Einfluss auf Wirkung und Geschmack.',
  medizin:       'Evidenzbasierte Erkenntnisse zu medizinischen Anwendungen.',
  konsumformen:  'Methoden und Formen der Anwendung im Überblick.',
  konzentrate:   'Extraktion, Verarbeitung und Qualität von Konzentraten.',
  recht:         'Rechtliche Rahmenbedingungen und Compliance-Anforderungen.',
  sicherheit:    'Sicherheitsaspekte, Umgebungsfaktoren und Schutzmaßnahmen.',
  qualitaet:     'Laboranalysen, Qualitätskontrolle und Reinheitsprüfungen.',
  markt:         'Marktüberblick, Beschaffung und aktuelle Preisentwicklungen.',
  werkzeuge:     'Praktische Rechner und Werkzeuge für den Alltag.',
};

/* ── Curated section order ─────────────────────────────────────────────── */

const HOMEPAGE_SECTIONS: TerpiraCategory[] = [
  'anbau', 'chemie', 'sicherheit', 'qualitaet', 'markt',
];

/* ── Card components ───────────────────────────────────────────────────── */

function FeaturedCard({ article }: { article: TerpiraArticle }) {
  const sourceCount = article.sourceIds?.length ?? 0;
  return (
    <Link
      href={`/studies/${article.slug}` as Route}
      className="group relative flex flex-col justify-between rounded-2xl border border-emerald-200/60
        bg-gradient-to-br from-white to-emerald-50/40 p-6 sm:p-8
        hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/40 transition-all duration-300"
    >
      {/* Badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white tracking-wide uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
          Empfohlen
        </span>
        {sourceCount > 0 && (
          <span className="rounded-full bg-white border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            {sourceCount} Quellen
          </span>
        )}
      </div>

      {/* Content */}
      <div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-100 text-xl mb-3 shadow-sm">
          {CATEGORY_ICONS[article.category] ?? '📄'}
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 line-clamp-3 leading-relaxed">{article.summary}</p>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${DIFFICULTY_DOT[article.difficulty] ?? 'bg-slate-300'}`} />
          <span>{DIFFICULTY_LABEL[article.difficulty]}</span>
          <span className="text-slate-200">·</span>
          <span>{article.readMinutes} Min Lesezeit</span>
        </div>
        <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
          Lesen
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function StudyCard({ article }: { article: TerpiraArticle }) {
  const sourceCount = article.sourceIds?.length ?? 0;
  return (
    <Link
      href={`/studies/${article.slug}` as Route}
      className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5
        hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-lg flex-shrink-0">
          {CATEGORY_ICONS[article.category] ?? '📄'}
        </span>
        {sourceCount > 0 && (
          <span className="rounded-md bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            {sourceCount} Quellen
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">{article.summary}</p>
      </div>
      <div className="mt-auto flex items-center gap-2 text-xs text-slate-400 pt-1 border-t border-slate-50">
        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${DIFFICULTY_DOT[article.difficulty] ?? 'bg-slate-300'}`} />
        <span>{DIFFICULTY_LABEL[article.difficulty]}</span>
        <span className="text-slate-200">·</span>
        <span>{article.readMinutes} Min</span>
      </div>
    </Link>
  );
}

function CompactItem({ article, index }: { article: TerpiraArticle; index: number }) {
  return (
    <Link
      href={`/studies/${article.slug}` as Route}
      className="group flex items-center gap-4 rounded-xl border border-transparent bg-white px-5 py-3.5
        hover:border-slate-200 hover:shadow-sm transition-all duration-150"
    >
      <span className="w-5 text-center text-xs font-bold text-slate-300 flex-shrink-0 tabular-nums">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="text-base flex-shrink-0">{CATEGORY_ICONS[article.category] ?? '📄'}</span>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {article.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{categoryLabels[article.category]}</p>
      </div>
      <span className="hidden sm:block text-[11px] text-slate-300 flex-shrink-0 font-mono">{article.lastUpdated}</span>
      <svg className="w-3.5 h-3.5 text-slate-200 group-hover:text-emerald-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default async function LandingPage() {
  const articleCount = wikiArticles.length;
  const sourceCount = sourceRegister.length;

  /* Featured: top 3 studies by source count */
  const featured = [...wikiArticles]
    .sort((a, b) => (b.sourceIds?.length ?? 0) - (a.sourceIds?.length ?? 0))
    .slice(0, 3);

  /* Secondary top: next 3 best-sourced */
  const topStudies = [...wikiArticles]
    .sort((a, b) => (b.sourceIds?.length ?? 0) - (a.sourceIds?.length ?? 0))
    .slice(3, 6);

  /* Recently updated */
  const recentStudies = [...wikiArticles]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 5);

  /* Articles grouped by category */
  const categoryCounts: Record<string, number> = {};
  const categoryArticles: Record<string, TerpiraArticle[]> = {};
  for (const a of wikiArticles) {
    categoryCounts[a.category] = (categoryCounts[a.category] ?? 0) + 1;
    const list = categoryArticles[a.category] ?? [];
    list.push(a);
    categoryArticles[a.category] = list;
  }

  const activeCategories = (Object.keys(categoryLabels) as TerpiraCategory[])
    .filter(c => categoryCounts[c]);

  /* Sort articles within each category by source count */
  for (const cat of activeCategories) {
    const list = categoryArticles[cat];
    if (list) list.sort((a, b) => (b.sourceIds?.length ?? 0) - (a.sourceIds?.length ?? 0));
  }

  return (
    <main className="min-h-screen">

      {/* ═══════════════════════════════════════════════════════════
          HERO – Featured studies as the primary entry point
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0b1f13]">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[1000px] rounded-full bg-emerald-600/10 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-10 text-center">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/50 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300 tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Kuratierte Wissensplattform
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight">
            Cannabis-Wissen,<br />
            <span className="text-emerald-400">evidenzbasiert.</span>
          </h1>

          <p className="mt-5 text-[17px] text-slate-400 max-w-xl mx-auto leading-relaxed">
            {articleCount} Fachartikel, gestützt auf {sourceCount} peer-reviewed Quellen –
            verständlich aufbereitet und thematisch kuratiert.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={"/studies" as Route}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors duration-150 shadow-lg shadow-emerald-900/40"
            >
              Alle Studien entdecken
            </Link>
            <Link
              href={"/search" as Route}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-150"
            >
              Volltextsuche
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 border-t border-white/5 pt-8">
            {[
              { value: articleCount, label: 'Artikel' },
              { value: sourceCount, label: 'Quellen' },
              { value: activeCategories.length, label: 'Themengebiete' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-0.5 text-xs text-slate-500 tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Featured Studies (inside hero) ────────────────────── */}
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-4">
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Wichtigste Studien</p>
            <h2 className="mt-1 text-xl font-bold text-white tracking-tight">Unsere Empfehlungen</h2>
          </div>

          {/* Large featured cards – visual hierarchy: LARGE */}
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((article) => (
              <FeaturedCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TOP STUDIES – Next best, medium cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">Bestbelegt</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Weitere Top-Studien</h2>
          </div>
          <Link href={"/studies" as Route} className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
            Alle ansehen
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Medium cards – visual hierarchy: MEDIUM */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topStudies.map((article) => (
            <StudyCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CATEGORY SECTIONS – Each category as its own section
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-slate-100 bg-slate-50/40">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Themengebiete</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Nach Kategorie entdecken</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Wähle ein Themengebiet und entdecke die wichtigsten Artikel – sortiert nach Evidenzstärke.
            </p>
          </div>

          {/* Curated sections (5 main categories shown on homepage) */}
          <div className="space-y-10">
            {HOMEPAGE_SECTIONS
              .filter(cat => (categoryArticles[cat]?.length ?? 0) > 0)
              .map(cat => {
                const articles = categoryArticles[cat] ?? [];
                const visibleArticles = articles.slice(0, 3);
                const remainingCount = Math.max(articles.length - 3, 0);

                return (
                  <div key={cat} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    {/* Section header */}
                    <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-100 text-xl shadow-sm">
                          {CATEGORY_ICONS[cat] ?? '📄'}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-slate-900">{categoryLabels[cat]}</h3>
                          {CATEGORY_DESCRIPTIONS[cat] && (
                            <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{CATEGORY_DESCRIPTIONS[cat]}</p>
                          )}
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                          {articles.length} Artikel
                        </span>
                      </div>
                    </div>

                    {/* Top articles for this category */}
                    <div className="grid gap-px bg-slate-100 sm:grid-cols-3">
                      {visibleArticles.map(article => (
                        <Link
                          key={article.slug}
                          href={`/studies/${article.slug}` as Route}
                          className="group flex flex-col gap-2 bg-white p-5
                            hover:bg-emerald-50/30 transition-colors duration-150"
                        >
                          <h4 className="text-[13px] font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                            {article.title}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{article.summary}</p>
                          <div className="mt-auto flex items-center gap-2 text-[11px] text-slate-400 pt-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${DIFFICULTY_DOT[article.difficulty] ?? 'bg-slate-300'}`} />
                            <span>{DIFFICULTY_LABEL[article.difficulty]}</span>
                            {(article.sourceIds?.length ?? 0) > 0 && (
                              <>
                                <span className="text-slate-200">·</span>
                                <span className="text-emerald-600 font-medium">{article.sourceIds?.length} Quellen</span>
                              </>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Show more link */}
                    {remainingCount > 0 && (
                      <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50">
                        <Link
                          href={`/category/${cat}` as Route}
                          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          {remainingCount} weitere Artikel anzeigen
                          <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* All categories grid */}
          <div className="mt-12">
            <h3 className="mb-5 text-lg font-bold text-slate-900">Alle Themengebiete</h3>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {activeCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat}` as Route}
                  className="group flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5
                    hover:border-emerald-200 hover:shadow-sm hover:shadow-emerald-50 transition-all duration-150"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-lg flex-shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                    {CATEGORY_ICONS[cat] ?? '📄'}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      {categoryLabels[cat]}
                    </h4>
                    <p className="text-xs text-slate-400">{categoryCounts[cat]} Artikel</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-200 group-hover:text-emerald-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          RECENT – Discover newest content (compact list)
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Neu & aktualisiert</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Zuletzt aktualisiert</h2>
            </div>
            <Link href={"/studies" as Route} className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
              Alle ansehen
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Small compact list – visual hierarchy: SMALL */}
          <div className="space-y-1.5">
            {recentStudies.map((article, i) => (
              <CompactItem key={article.slug} article={article} index={i} />
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
