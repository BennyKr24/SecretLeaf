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

/* ── Category descriptions ─────────────────────────────────────────────── */

const CATEGORY_DESCRIPTIONS: Partial<Record<TerpiraCategory, string>> = {
  anbau:         'Alles rund um Anbau, Pflege und Ernte – von der Keimung bis zur Trocknung.',
  genetik:       'Genetik, Züchtung und Sortenwahl für gezielte Ergebnisse.',
  chemie:        'Chemische Grundlagen, Nährstoffe und Substrate für gesundes Wachstum.',
  terpene:       'Terpenprofile, Aromen und deren Einfluss auf Wirkung und Geschmack.',
  medizin:       'Evidenzbasierte Erkenntnisse zu medizinischen Anwendungen.',
  konsumformen:  'Methoden und Formen der Anwendung im Überblick.',
  konzentrate:   'Extraktion, Verarbeitung und Qualität von Konzentraten.',
  recht:         'Rechtliche Rahmenbedingungen und Compliance-Anforderungen.',
  sicherheit:    'Sicherheitshinweise, Aufklärung und verantwortungsvoller Umgang.',
  qualitaet:     'Laboranalysen, Qualitätskontrolle und Reinheitsprüfungen.',
  markt:         'Marktüberblick, Beschaffung und aktuelle Preisentwicklungen.',
  werkzeuge:     'Praktische Rechner und Werkzeuge für den Alltag.',
};

/* ── Curated section order ─────────────────────────────────────────────── */

const HOMEPAGE_SECTIONS: TerpiraCategory[] = [
  'anbau', 'chemie', 'sicherheit', 'qualitaet', 'markt',
];

/* ── Evidence level helper ─────────────────────────────────────────────── */

function evidenceLevel(sourceCount: number): { label: string; cls: string } {
  if (sourceCount >= 5) return { label: 'Hohe Evidenz', cls: 'evidence-high border' };
  if (sourceCount >= 3) return { label: 'Mittlere Evidenz', cls: 'evidence-med border' };
  return { label: 'Basisartikel', cls: 'evidence-low border' };
}

/* ── Card components ───────────────────────────────────────────────────── */

function FeaturedCard({ article, rank }: { article: TerpiraArticle; rank: number }) {
  const sourceCount = article.sourceIds?.length ?? 0;
  const ev = evidenceLevel(sourceCount);

  return (
    <Link
      href={`/studies/${article.slug}` as Route}
      className="card-lift group relative flex flex-col justify-between rounded-2xl border border-white/10
        bg-gradient-to-br from-white/10 to-emerald-950/30 backdrop-blur-sm p-6 sm:p-7
        hover:border-emerald-400/30 hover:shadow-2xl hover:shadow-emerald-900/30"
    >
      {/* Rank + badges */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600/20 text-[11px] font-bold text-emerald-300 border border-emerald-700/40">
            {rank}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white tracking-widest uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 animate-pulse" />
            Top-Studie
          </span>
        </div>
        {sourceCount > 0 && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ev.cls}`}>
            {ev.label}
          </span>
        )}
      </div>

      {/* Icon + title */}
      <div className="flex-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-xl mb-3">
          {CATEGORY_ICONS[article.category] ?? '📄'}
        </span>
        <h3 className="text-[16px] sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors duration-200 leading-snug line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-slate-400 line-clamp-3 leading-relaxed">{article.summary}</p>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${DIFFICULTY_DOT[article.difficulty] ?? 'bg-slate-500'}`} />
          <span>{DIFFICULTY_LABEL[article.difficulty]}</span>
          <span className="text-slate-700">·</span>
          <span>{article.readMinutes} Min Lesezeit</span>
          {sourceCount > 0 && (
            <>
              <span className="text-slate-700">·</span>
              <span className="text-emerald-400 font-semibold">{sourceCount} Quellen</span>
            </>
          )}
        </div>
        <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
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
  const ev = evidenceLevel(sourceCount);
  return (
    <Link
      href={`/studies/${article.slug}` as Route}
      className="card-lift group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5
        hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-lg flex-shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
          {CATEGORY_ICONS[article.category] ?? '📄'}
        </span>
        {sourceCount > 0 && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ev.cls}`}>
            {ev.label}
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
        {sourceCount > 0 && (
          <>
            <span className="text-slate-200">·</span>
            <span className="text-emerald-600 font-semibold">{sourceCount} Quellen</span>
          </>
        )}
      </div>
    </Link>
  );
}

function CompactItem({ article, index, badge }: { article: TerpiraArticle; index: number; badge?: React.ReactNode }) {
  const sourceCount = article.sourceIds?.length ?? 0;
  return (
    <Link
      href={`/studies/${article.slug}` as Route}
      className="group flex items-center gap-4 rounded-xl border border-transparent bg-white px-5 py-3.5
        hover:border-emerald-100 hover:shadow-sm hover:bg-emerald-50/20 transition-all duration-150"
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
      {badge}
      {sourceCount > 0 && (
        <span className="hidden sm:block rounded-md bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 flex-shrink-0">
          {sourceCount}
        </span>
      )}
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

  /* Next best 3 */
  const topStudies = [...wikiArticles]
    .sort((a, b) => (b.sourceIds?.length ?? 0) - (a.sourceIds?.length ?? 0))
    .slice(3, 6);

  /* Trending diese Woche: top articles by source count as trending proxy */
  const trendingStudies = [...wikiArticles]
    .sort((a, b) => (b.sourceIds?.length ?? 0) - (a.sourceIds?.length ?? 0))
    .slice(0, 4);

  /* Beliebt im Anbau */
  const popularAnbau = [...wikiArticles]
    .filter(a => a.category === 'anbau')
    .sort((a, b) => (b.sourceIds?.length ?? 0) - (a.sourceIds?.length ?? 0))
    .slice(0, 4);

  /* Kürzlich geprüft: most recently updated */
  const recentlyReviewed = [...wikiArticles]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 4);

  /* Recently updated (for the compact section) */
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

  for (const cat of activeCategories) {
    const list = categoryArticles[cat];
    if (list) list.sort((a, b) => (b.sourceIds?.length ?? 0) - (a.sourceIds?.length ?? 0));
  }

  /* Evidence stats for trust signals */
  const highEvidenceCount = wikiArticles.filter(a => (a.sourceIds?.length ?? 0) >= 5).length;
  const latestDate = [...wikiArticles].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))[0]?.lastUpdated ?? '';

  return (
    <main className="min-h-screen">

      {/* ═══════════════════════════════════════════════════════════
          PREMIUM HERO
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#071510]">
        {/* Multi-layer glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[700px] w-[1200px] rounded-full bg-emerald-600/8 blur-[160px]" />
          <div className="absolute left-1/4 top-1/3 h-[300px] w-[500px] rounded-full bg-emerald-500/5 blur-[100px]" />
          <div className="absolute right-1/4 bottom-0 h-[200px] w-[400px] rounded-full bg-teal-600/5 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-10 text-center">

          {/* Authority eyebrow */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/40 bg-emerald-950/60 px-3 py-1 text-[11px] font-semibold text-emerald-300 tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cannabis Intelligence Platform
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold text-white leading-[1.05] tracking-tight">
            Das Wissen,<br />
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              das zählt.
            </span>
          </h1>

          <p className="mt-5 text-[17px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {articleCount} evidenzbasierte Fachartikel, belegt durch {sourceCount}+ peer-reviewed Quellen –
            die führende Wissensplattform für seriöses Cannabis-Wissen.
          </p>

          {/* Trust signal row */}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {[
              { icon: '✓', text: `${highEvidenceCount} Artikel mit hoher Evidenz` },
              { icon: '🔬', text: `${sourceCount}+ verifizierte Quellen` },
              { icon: '↻', text: `Aktualisiert ${latestDate}` },
              { icon: '🛡', text: 'Peer-reviewed' },
            ].map(item => (
              <span key={item.text} className="trust-badge">
                <span>{item.icon}</span>
                {item.text}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={"/studies" as Route}
              className="group rounded-xl bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white
                hover:bg-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-900/50
                hover:shadow-xl hover:shadow-emerald-800/40 hover:-translate-y-0.5"
            >
              Jetzt entdecken
              <svg className="inline ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href={"/search" as Route}
              className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-300
                hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
            >
              Volltextsuche
            </Link>
          </div>

          {/* Authority stats */}
          <div className="mt-14 flex flex-wrap justify-center gap-10 border-t border-white/5 pt-10">
            {[
              { value: articleCount, label: 'Fachartikel', sub: 'kuratiert & geprüft' },
              { value: `${sourceCount}+`, label: 'Quellen', sub: 'peer-reviewed' },
              { value: activeCategories.length, label: 'Themengebiete', sub: 'vollständig abgedeckt' },
              { value: highEvidenceCount, label: 'Hohe Evidenz', sub: '≥ 5 Quellen belegt' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="stat-number text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-300 tracking-wide uppercase">{stat.label}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Featured Studies (inside dark hero) ───────────────── */}
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">Top-Empfehlungen</p>
              <h2 className="mt-1 text-xl font-bold text-white tracking-tight">Die wichtigsten Studien</h2>
            </div>
            <Link href={"/studies" as Route} className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-400 transition-colors">
              Alle ansehen
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Large featured cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((article, i) => (
              <FeaturedCard key={article.slug} article={article} rank={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DAILY RETURN – Trending diese Woche
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 tracking-widest uppercase mb-2">
                🔥 Diese Woche
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Trending</h2>
              <p className="mt-1 text-sm text-slate-400">Meistgelegte Artikel – nach Evidenzstärke</p>
            </div>
            <Link href={"/studies" as Route} className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
              Alle ansehen
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trendingStudies.map((article, i) => {
              const sourceCount = article.sourceIds?.length ?? 0;
              const ev = evidenceLevel(sourceCount);
              return (
                <Link
                  key={article.slug}
                  href={`/studies/${article.slug}` as Route}
                  className="card-lift trending-glow group relative flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4
                    hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-sm">
                      {String(i + 1)}🔥
                    </span>
                    {sourceCount > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ev.cls}`}>
                        {ev.label}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[13px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="mt-auto flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{CATEGORY_ICONS[article.category]}</span>
                    <span className="line-clamp-1">{categoryLabels[article.category]}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DAILY RETURN – Beliebt im Anbau
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-emerald-950/5 to-white border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 tracking-widest uppercase mb-2">
                🌱 Beliebt im Anbau
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Top Anbau-Wissen</h2>
              <p className="mt-1 text-sm text-slate-400">Die meistgenutzten Artikel für erfolgreichen Anbau</p>
            </div>
            <Link href={"/category/anbau" as Route} className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
              Alle Anbau-Artikel
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popularAnbau.map((article) => (
              <StudyCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TOP STUDIES – Best-sourced medium cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Bestbelegt</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Weitere Top-Studien</h2>
            <p className="mt-1 text-sm text-slate-400">Artikel mit der höchsten Quellenabdeckung</p>
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
            <StudyCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DAILY RETURN – Kürzlich geprüft
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 tracking-widest uppercase mb-2">
                ✓ Kürzlich geprüft
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Neu & aktualisiert</h2>
              <p className="mt-1 text-sm text-slate-400">Zuletzt überprüfte und aktualisierte Artikel</p>
            </div>
            <Link href={"/studies" as Route} className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
              Alle ansehen
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="space-y-1.5">
            {recentlyReviewed.map((article, i) => (
              <CompactItem
                key={article.slug}
                article={article}
                index={i}
                badge={
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600 flex-shrink-0">
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    Geprüft
                  </span>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CATEGORY SECTIONS
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Themengebiete</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Nach Kategorie entdecken</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Jede Kategorie enthält kuratierte Artikel – sortiert nach Evidenzstärke und Relevanz.
            </p>
          </div>

          <div className="space-y-10">
            {HOMEPAGE_SECTIONS
              .filter(cat => (categoryArticles[cat]?.length ?? 0) > 0)
              .map(cat => {
                const articles = categoryArticles[cat] ?? [];
                const visibleArticles = articles.slice(0, 3);
                const remainingCount = Math.max(articles.length - 3, 0);

                return (
                  <div key={cat} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    {/* Section header */}
                    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-6 py-5">
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
                        <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          {articles.length} Artikel
                        </span>
                      </div>
                    </div>

                    {/* Top articles grid */}
                    <div className="grid gap-px bg-slate-100 sm:grid-cols-3">
                      {visibleArticles.map(article => {
                        const srcCount = article.sourceIds?.length ?? 0;
                        return (
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
                              {srcCount > 0 && (
                                <>
                                  <span className="text-slate-200">·</span>
                                  <span className="text-emerald-600 font-semibold">{srcCount} Quellen</span>
                                </>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {remainingCount > 0 && (
                      <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50">
                        <Link
                          href={`/category/${cat}` as Route}
                          className="group inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
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
                  className="card-lift group flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5
                    hover:border-emerald-200 hover:shadow-sm hover:shadow-emerald-50"
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
          RECENT – Compact discovery list
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-slate-100 bg-slate-50/40">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Entdecken</p>
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
            {recentStudies.map((article, i) => (
              <CompactItem key={article.slug} article={article} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          AUTHORITY SECTION – Platform credibility
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-slate-100 bg-[#071510]">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-3">
            Warum SecretLeaf?
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight max-w-2xl mx-auto">
            Mehr als ein Blog – eine wissenschaftliche Wissensplattform
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Jeder Artikel ist mit peer-reviewed Quellen belegt. Kein Hörensagen, keine Forenweisheiten –
            nur geprüftes Wissen auf dem Stand der aktuellen Forschung.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: '🔬',
                title: 'Peer-reviewed Quellen',
                text: `Jeder Artikel verweist auf ${Math.round(sourceCount / articleCount)} Quellen im Schnitt – aus JAMA, The Lancet, Nature und mehr.`,
              },
              {
                icon: '✓',
                title: 'Redaktionell geprüft',
                text: `${highEvidenceCount} Artikel mit hoher Evidenz (≥ 5 Quellen). Regelmäßige Aktualisierungen bei neuen Erkenntnissen.`,
              },
              {
                icon: '🧠',
                title: 'Strukturiertes Wissen',
                text: `${activeCategories.length} Fachkategorien, geordnet nach Thema und Evidenzstärke – für schnelle Orientierung.`,
              },
            ].map(item => (
              <div key={item.title} className="rounded-2xl border border-white/5 bg-white/5 p-6 text-left">
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href={"/studies" as Route}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-900/40"
            >
              Alle Studien ansehen
            </Link>
            <Link
              href={"/studies/sources" as Route}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-150"
            >
              Quellenregister
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
