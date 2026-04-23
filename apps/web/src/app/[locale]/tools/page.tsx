import Link from "next/link";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import { toolRegistry } from "@/lib/tools/registry";
import {
  toolCategoryLabel,
  toolCategoryIcon,
  toolCategoryColor,
  toolCategoryAccent,
  type ToolCategory,
} from "@/lib/tools/types";
import ToolsHubClient from "@/components/tools/ToolsHubClient";

const FEATURED_SLUGS = ["vpd", "licht-rechner", "naehrstoff-rechner"];

const CATEGORIES: ToolCategory[] = ["klima", "licht", "naehrstoffe", "planung"];

const CATEGORY_DESCRIPTIONS: Record<ToolCategory, string> = {
  klima: "Berechne VPD, Luftbedarf und Rohrdurchmesser — damit Temperatur, VPD und Luftfeuchte auf jede Phase abgestimmt sind.",
  licht: "Finde die optimale Lichtintensität (PPFD) und das tägliche Lichtintegral (DLI).",
  naehrstoffe: "Berechne EC-Ziel und Dosierung – für jede Phase und jedes Substrat.",
  planung: "Schätze deinen Ertrag realistisch ein, bevor du mit dem Grow beginnst.",
};

const categoryTopBar: Record<ToolCategory, string> = {
  klima: "from-cyan-400 to-cyan-600",
  licht: "from-amber-400 to-amber-600",
  naehrstoffe: "from-emerald-400 to-emerald-600",
  planung: "from-violet-400 to-violet-600",
};

const categoryIconBg: Record<ToolCategory, string> = {
  klima: "bg-cyan-50 ring-1 ring-cyan-200",
  licht: "bg-amber-50 ring-1 ring-amber-200",
  naehrstoffe: "bg-emerald-50 ring-1 ring-emerald-200",
  planung: "bg-violet-50 ring-1 ring-violet-200",
};

export default async function ToolsHubPage() {
  const t = await getTranslations('toolsPage');
  const featuredTools = FEATURED_SLUGS.map((slug) =>
    toolRegistry.find((tool) => tool.slug === slug)
  ).filter(Boolean);

  return (
    <main className="min-h-screen">
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
            {t('eyebrow')}
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
            {t('headline')}
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-500 dark:text-slate-400">
            {t('subline')}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#featured"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t('ctaFeatured')}
            </a>
            <a
              href="#alle-tools"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
            >
              {t('ctaAll')}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">

        {/* ── Grow-Check + Zuletzt genutzt (client) ─────── */}
        <ToolsHubClient />

        {/* ── FEATURED TOOLS ────────────────────────────── */}
        <section id="featured">
          <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-slate-100">{t('featuredTitle')}</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {featuredTools.map(
              (tool) =>
                tool && (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}` as Route}
                    className="tool-card-lift group relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-6 shadow-sm"
                  >
                    {/* Category top accent */}
                    <div
                      className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${categoryTopBar[tool.category]}`}
                    />
                    <div className="relative pt-1">
                      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${categoryIconBg[tool.category]}`}>
                        {tool.icon}
                      </div>
                      <span className={`block text-xs font-semibold ${toolCategoryAccent[tool.category]}`}>
                        {toolCategoryLabel[tool.category]}
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors group-hover:text-emerald-700">
                        {tool.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {tool.shortDescription}
                      </p>
                      <p className="mt-4 text-xs font-semibold text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                        {t('calculateBtn')}
                      </p>
                    </div>
                  </Link>
                )
            )}
          </div>
        </section>

        {/* ── ALLE TOOLS BY CATEGORY ────────────────────── */}
        <div id="alle-tools" className="space-y-8">
          {CATEGORIES.map((cat) => {
            const tools = toolRegistry.filter((t) => t.category === cat);
            if (tools.length === 0) return null;
            return (
              <section key={cat} className="border-t border-slate-100 pt-8">
                <div className="mb-5">
                  <h2 className={`flex items-center gap-2 text-base font-bold ${toolCategoryAccent[cat]}`}>
                    {toolCategoryIcon[cat]} {toolCategoryLabel[cat]}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{CATEGORY_DESCRIPTIONS[cat]}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}` as Route}
                      className="tool-card-lift group rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg ${categoryIconBg[cat]}`}>
                          {tool.icon}
                        </div>
                        <span className="rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                          {tool.difficulty === "einsteiger"
                            ? "Einsteiger"
                            : tool.difficulty === "fortgeschritten"
                            ? "Fortg."
                            : "Profi"}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
                        {tool.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">{tool.shortDescription}</p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── WEITERE WERKZEUGE ─────────────────────────── */}
        <section className="border-t border-slate-100 pt-8">
          <h2 className="mb-5 text-sm font-bold text-slate-900">Weitere Werkzeuge</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href={"/tools/plans" as Route}
              className="tool-card-lift rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-emerald-700">Planung</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Düngerpläne</h2>
              <p className="mt-2 text-sm text-slate-500">
                Fertige Düngerpläne, filterbar nach Setup, Budget und Ziel.
              </p>
            </Link>
            <Link
              href={"/search" as Route}
              className="tool-card-lift rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-cyan-700">Recherche</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Globale Suche</h2>
              <p className="mt-2 text-sm text-slate-500">
                Schneller Zugriff auf Fachartikel, Quellen und Datenbankeinträge.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
