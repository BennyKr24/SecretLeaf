import Link from "next/link";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import { wikiArticles, sourceRegister } from "@/data/terpira/wiki";
import type { TerpiraArticle } from "@/lib/terpira/types";
import { toolRegistry } from "@/lib/tools/registry";
import { CTAButton } from "@/components/ui/CTAButton";


/* ─── Minimal helpers kept for the studies section at the bottom ─── */

const CATEGORY_ICONS: Record<string, string> = {
  anbau: "🌱", genetik: "🧬", chemie: "⚗️", terpene: "🌺",
  medizin: "🩺", konsumformen: "💨", konzentrate: "💎", recht: "⚖️",
  sicherheit: "🛡️", qualitaet: "🔬", markt: "📊", werkzeuge: "🛠️",
};

type EvidenceLabels = { high: string; med: string; foundational: string };

function evidenceLevel(n: number, labels: EvidenceLabels): { label: string; cls: string } {
  if (n >= 5) return { label: labels.high, cls: "evidence-high border" };
  if (n >= 3) return { label: labels.med, cls: "evidence-med border" };
  return { label: labels.foundational, cls: "evidence-low border" };
}

function StudyCard({ article, evidenceLabels }: { article: TerpiraArticle; evidenceLabels: EvidenceLabels }) {
  const n = article.sourceIds?.length ?? 0;
  const ev = evidenceLevel(n, evidenceLabels);
  return (
    <Link
      href={`/studies/${article.slug}` as Route}
      className="group flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5
        hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-50 dark:hover:shadow-emerald-950 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-lg flex-shrink-0">
          {CATEGORY_ICONS[article.category] ?? "📄"}
        </span>
        {n > 0 && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ev.cls}`}>
            {ev.label}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
          {article.title}
        </h3>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">{article.summary}</p>
      </div>
      <div className="mt-auto flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-50 dark:border-slate-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
        <span>{article.readMinutes} Min</span>
        {n > 0 && <><span className="text-slate-200 dark:text-slate-600">·</span><span className="text-emerald-600 dark:text-emerald-400 font-semibold">{n} Quellen</span></>}
      </div>
    </Link>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */

export default async function LandingPage() {
  const t = await getTranslations("home");
  const tStudies = await getTranslations("studies");

  const articleCount = wikiArticles.length;
  const sourceCount = sourceRegister.length;

  const topStudies = [...wikiArticles]
    .sort((a, b) => (b.sourceIds?.length ?? 0) - (a.sourceIds?.length ?? 0))
    .slice(0, 6);

  const previewTools = toolRegistry.slice(0, 4);

  const evidenceLabels: EvidenceLabels = {
    high: tStudies("evidenceHigh"),
    med: tStudies("evidenceMed"),
    foundational: tStudies("evidenceFoundational"),
  };

  return (
    <main className="min-h-screen">

      {/* ════════════════════════════════════════════════════════
          HERO — Split layout: headline left, action cards right
          ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#071510]">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/3 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[160px]" />
          <div className="absolute right-0 top-1/2 h-[400px] w-[600px] rounded-full bg-teal-700/6 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">

            {/* ── LEFT: Headline + CTA ────────────────────────── */}
            <div className="flex flex-col gap-6">

              {/* Eyebrow */}
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-950/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t("eyebrow")}
              </span>

              {/* Main headline */}
              <h1 className="text-[40px] font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[56px]">
                Grow smarter.
                <br />
                <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  Not harder.
                </span>
              </h1>

              {/* Subline */}
              <p className="max-w-lg text-[17px] leading-relaxed text-slate-400">
                {t("heroSub")}
              </p>

              {/* Primary CTA */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <CTAButton href="/start" size="lg" variant="primary" className="shadow-lg shadow-emerald-900/40 hover:-translate-y-0.5 hover:shadow-xl">
                  🌱 {t("ctaStart")} →
                </CTAButton>
                <CTAButton href="/tools" size="lg" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10">
                  {t("ctaTools")}
                </CTAButton>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
                {[
                  `${articleCount} ${t("trustArticles")}`,
                  `${sourceCount}+ ${t("trustSources")}`,
                  t("trustFree"),
                  t("trustUpdated"),
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-[12px] text-slate-500">
                    <span className="text-emerald-500">✓</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* ── RIGHT: 3 Action Cards ────────────────────────── */}
            <div className="flex flex-col gap-3 lg:w-[320px]">

              {/* Card 1 — Grow starten */}
              <Link
                href={"/start" as Route}
                className="group relative flex flex-col gap-3 rounded-2xl border border-emerald-700/30
                  bg-emerald-950/50 p-5 backdrop-blur-sm
                  hover:border-emerald-500/50 hover:bg-emerald-950/70 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-xl border border-emerald-600/20">
                    🌱
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    <span className="h-1 w-1 rounded-full bg-emerald-200 animate-pulse" />
                    {t("coreBadge")}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-white group-hover:text-emerald-200 transition-colors">
                    {t("card1Title")}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {t("card1Sub")}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:gap-2 transition-all">
                  {t("card1CTA")}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>

              {/* Card 2 — Tools */}
              <Link
                href={"/tools" as Route}
                className="group flex flex-col gap-3 rounded-2xl border border-white/8
                  bg-white/5 p-5 backdrop-blur-sm
                  hover:border-white/15 hover:bg-white/8 transition-all duration-200"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl border border-white/10">
                  🧪
                </span>
                <div>
                  <p className="font-bold text-white group-hover:text-slate-200 transition-colors">
                    {t("card2Title")}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("card2Sub")}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-slate-300 group-hover:gap-2 transition-all">
                  {t("card2CTA")}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>

              {/* Card 3 — Diagnose */}
              <Link
                href={"/diagnose" as Route}
                className="group flex flex-col gap-3 rounded-2xl border border-white/8
                  bg-white/5 p-5 backdrop-blur-sm
                  hover:border-white/15 hover:bg-white/8 transition-all duration-200"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl border border-white/10">
                  🩺
                </span>
                <div>
                  <p className="font-bold text-white group-hover:text-slate-200 transition-colors">
                    {t("card3AltTitle")}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("card3Sub")}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-slate-300 group-hover:gap-2 transition-all">
                  {t("card3CTA")}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          L-02  VALUE BLOCK — 3 Produktversprechen
          ════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">{t("whyEyebrow")}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
              {t("whyTitle")}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "🌱",
                title: t("why1Title"),
                text: t("why1Text"),
                accent: "emerald",
              },
              {
                icon: "🧮",
                title: t("why2Title"),
                text: t("why2Text"),
                accent: "blue",
              },
              {
                icon: "🩺",
                title: t("why3Title"),
                text: t("why3Text"),
                accent: "violet",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-2xl shadow-sm">
                  {item.icon}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-snug">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          L-02  TOOLS PREVIEW
          ════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">{t("toolsEyebrow")}</p>
              <h2 className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
                {t("toolsTitle")}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                {t("toolsSub")}
              </p>
            </div>
            <CTAButton href="/tools" variant="secondary" size="sm" className="flex-shrink-0 hidden sm:inline-flex">
              {t("toolsCTA")}
            </CTAButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {previewTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}` as Route}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm
                  hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:border-emerald-100 dark:group-hover:border-emerald-800 transition-colors">
                    {tool.icon}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-full px-2 py-0.5 capitalize">
                    {tool.category}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors text-[15px]">
                    {tool.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tool.shortDescription}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:gap-1.5 transition-all mt-auto">
                  {t("toolsOpenBtn")}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-5 sm:hidden">
            <CTAButton href="/tools" variant="secondary" className="w-full justify-center">
              {t("toolsShowAll")}
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          L-02  GROW FLOW — 3 Schritte
          ════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">{t("howEyebrow")}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
              {t("howTitle")}
            </h2>
          </div>

          <div className="relative grid gap-6 sm:grid-cols-3">
            {/* Connector line (desktop) */}
            <div
              className="absolute left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] top-[2rem] hidden h-px bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 dark:from-emerald-900 dark:via-emerald-700 dark:to-emerald-900 sm:block"
              aria-hidden="true"
            />

            {[
              {
                step: "01",
                icon: "⚙️",
                title: t("step1Title"),
                text: t("step1Text"),
                color: "bg-emerald-600",
              },
              {
                step: "02",
                icon: "📋",
                title: t("step2Title"),
                text: t("step2Text"),
                color: "bg-emerald-600",
              },
              {
                step: "03",
                icon: "📓",
                title: t("step3Title"),
                text: t("step3Text"),
                color: "bg-emerald-600",
              },
            ].map((s) => (
              <div key={s.step} className="relative flex flex-col items-center gap-4 text-center">
                {/* Step circle */}
                <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full ${s.color} shadow-lg shadow-emerald-900/20`}>
                  <span className="text-2xl">{s.icon}</span>
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-[10px] font-black text-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-800">
                    {s.step.slice(-1)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{s.title}</p>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px] mx-auto">
                    {s.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <CTAButton href="/start" variant="primary" size="lg" className="shadow-sm">
              🌱 {t("ctaGetStarted")}
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          L-04  CONTENT — Studien (SEO, nicht dominant)
          ════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50/40 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t("studiesEyebrow")}</p>
              <h2 className="mt-1 text-lg font-bold text-slate-700 dark:text-slate-300">
                {articleCount} {t("studiesCount")}
              </h2>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                {t("studiesSub", { count: sourceCount })}
              </p>
            </div>
            <Link
              href={"/studies" as Route}
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {t("studiesAllLink")}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topStudies.map((article) => (
              <StudyCard key={article.slug} article={article} evidenceLabels={evidenceLabels} />
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <CTAButton href="/studies" variant="ghost" size="sm" className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400">
              {t("studiesCTA", { count: articleCount })}
            </CTAButton>
          </div>
        </div>
      </section>

    </main>
  );
}
