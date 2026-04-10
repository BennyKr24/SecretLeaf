import Link from "next/link";
import type { Route } from "next";
import { wikiArticles, sourceRegister, categoryLabels } from "@/data/terpira/wiki";
import type { TerpiraCategory } from "@/lib/terpira/types";

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

export default async function LandingPage() {
  const articleCount = wikiArticles.length;
  const sourceCount = sourceRegister.length;

  const topStudies = [...wikiArticles]
    .sort((a, b) => (b.sourceIds?.length ?? 0) - (a.sourceIds?.length ?? 0))
    .slice(0, 6);

  const newStudies = [...wikiArticles]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 6);

  const categoryCounts: Record<string, number> = {};
  for (const a of wikiArticles) categoryCounts[a.category] = (categoryCounts[a.category] ?? 0) + 1;
  const activeCategories = (Object.keys(categoryLabels) as TerpiraCategory[])
    .filter(c => categoryCounts[c]);

  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0b1f13]">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-emerald-600/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 py-24 text-center">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/50 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300 tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Studies · Database · Tools
          </span>

          <h1 className="mt-5 text-5xl sm:text-6xl font-bold text-white leading-[1.08] tracking-tight">
            Wissen,<br />
            <span className="text-emerald-400">das wirkt.</span>
          </h1>

          <p className="mt-5 text-[17px] text-slate-400 max-w-xl mx-auto leading-relaxed">
            {articleCount} evidenzbasierte Artikel und {sourceCount} peer-reviewed Quellen –
            zu Anbau, Chemie, Medizin, Recht und mehr.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={"/studies" as Route}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors duration-150 shadow-lg shadow-emerald-900/40"
            >
              Alle Studies ansehen
            </Link>
            <Link
              href={"/search" as Route}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-150"
            >
              Volltextsuche
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 border-t border-white/5 pt-8">
            {[
              { value: articleCount, label: 'Artikel' },
              { value: sourceCount, label: 'Quellen' },
              { value: activeCategories.length, label: 'Kategorien' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-0.5 text-xs text-slate-500 tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Studies ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">Bestbelegt</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Top Studies</h2>
          </div>
          <Link href={"/studies" as Route} className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
            Alle ansehen
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topStudies.map((article) => (
            <Link
              key={article.slug}
              href={`/studies/${article.slug}` as Route}
              className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5
                hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-lg flex-shrink-0">
                  {CATEGORY_ICONS[article.category] ?? '📄'}
                </span>
                {(article.sourceIds?.length ?? 0) > 0 && (
                  <span className="rounded-md bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    {article.sourceIds!.length} Quellen
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
          ))}
        </div>
      </section>

      {/* ── New Articles ──────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-slate-50/60">
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

          <div className="space-y-1.5">
            {newStudies.map((article, i) => (
              <Link
                key={article.slug}
                href={`/studies/${article.slug}` as Route}
                className="group flex items-center gap-4 rounded-xl border border-transparent bg-white px-5 py-3.5
                  hover:border-slate-200 hover:shadow-sm transition-all duration-150"
              >
                <span className="w-5 text-center text-xs font-bold text-slate-300 flex-shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-base flex-shrink-0">{CATEGORY_ICONS[article.category] ?? '📄'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{categoryLabels[article.category]}</p>
                </div>
                <span className="text-[11px] text-slate-300 flex-shrink-0 font-mono">{article.lastUpdated}</span>
                <svg className="w-3.5 h-3.5 text-slate-200 group-hover:text-emerald-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────── */}
      <section className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-7">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Themengebiete</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Kategorien</h2>
          </div>

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
                  <h3 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                    {categoryLabels[cat]}
                  </h3>
                  <p className="text-xs text-slate-400">{categoryCounts[cat]} Artikel</p>
                </div>
                <svg className="w-4 h-4 text-slate-200 group-hover:text-emerald-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
