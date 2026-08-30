import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { Route } from "next";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageAlternates } from "@/lib/i18n/metadata";
import { toolRegistry } from "@/lib/tools/registry";
import {
  toolCategoryIcon,
  toolCategoryAccent,
  type ToolCategory,
} from "@/lib/tools/types";
import ToolsHubClient from "@/components/tools/ToolsHubClient";

const FEATURED_SLUGS = ["vpd", "licht-rechner", "naehrstoff-rechner"];

const CATEGORIES: ToolCategory[] = ["klima", "licht", "naehrstoffe", "planung"];

const capCat = (c: string) => c.charAt(0).toUpperCase() + c.slice(1);

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

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === "en";
  return {
    title: en ? "Grow Tools – SecretLeaf" : "Grow-Tools – SecretLeaf",
    description: en
      ? "Precision calculators for light, climate and nutrients — based on real cultivation values."
      : "Präzisionswerkzeuge für Licht, Klima und Nährstoffe — basierend auf echten Anbauwerten.",
    alternates: pageAlternates("/tools", locale),
  };
}

const DIFF_KEY: Record<string, string> = {
  einsteiger: "diffEinsteiger",
  fortgeschritten: "diffFortShort",
  profi: "diffProfi",
};

export default async function ToolsHubPage() {
  const t = await getTranslations('toolsPage');
  const tt = await getTranslations('tool');
  const catLabel = (c: string) => tt(`category${capCat(c)}`);
  const catDesc = (c: string) => tt(`categoryDesc${capCat(c)}`);
  const toolTitle = (slug: string) => tt(`registry.${slug}.title`);
  const toolDesc = (slug: string) => tt(`registry.${slug}.desc`);
  const featuredTools = FEATURED_SLUGS.map((slug) =>
    toolRegistry.find((tool) => tool.slug === slug)
  ).filter(Boolean);

  return (
    <main className="min-h-screen">
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10 bg-brand-hero px-4 py-16 sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[6%] top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-emerald-500/14 blur-[110px]" />
        </div>

        <Image
          src="/images/hero/tools-meter.png"
          alt=""
          width={887}
          height={1774}
          className="pointer-events-none absolute right-[-30px] top-[-40px] hidden h-[560px] w-[280px] object-cover opacity-90 mix-blend-screen sl-photo-leaf sl-plant-leaf--slow lg:block"
          aria-hidden="true"
          loading="lazy"
        />

        <div className="relative mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            {t('eyebrow')}
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            {t('headline')}
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-400">
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
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-emerald-300/40 hover:text-emerald-300"
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
          <h2 className="mb-5 text-lg font-bold text-foreground">{t('featuredTitle')}</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {featuredTools.map(
              (tool) =>
                tool && (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}` as Route}
                    className="tool-card-lift group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    {/* Category top accent */}
                    <div
                      className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${categoryTopBar[tool.category]}`}
                    />
                    <div className="relative pt-1">
                      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${categoryIconBg[tool.category]} ${toolCategoryAccent[tool.category]}`}>
                        <tool.icon className="h-6 w-6" strokeWidth={2} />
                      </div>
                      <span className={`block text-xs font-semibold ${toolCategoryAccent[tool.category]}`}>
                        {catLabel(tool.category)}
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-foreground transition-colors group-hover:text-emerald-700">
                        {toolTitle(tool.slug)}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-fg">
                        {toolDesc(tool.slug)}
                      </p>
                      {/* Always visible on touch (no hover to reveal it) —
                          reveal-on-hover only kicks in where hover exists. */}
                      <p className="mt-4 text-xs font-semibold text-emerald-600 opacity-100 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
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
            const CatIcon = toolCategoryIcon[cat];
            return (
              <section key={cat} className="border-t border-border pt-8">
                <div className="mb-5">
                  <h2 className={`flex items-center gap-2 text-base font-bold ${toolCategoryAccent[cat]}`}>
                    <CatIcon className="h-4 w-4" strokeWidth={2} /> {catLabel(cat)}
                  </h2>
                  <p className="mt-1 text-sm text-muted-fg">{catDesc(cat)}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}` as Route}
                      className="tool-card-lift group rounded-2xl border border-border bg-card p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${categoryIconBg[cat]} ${toolCategoryAccent[cat]}`}>
                          <tool.icon className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-fg">
                          {tt(DIFF_KEY[tool.difficulty] ?? "diffProfi")}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-bold text-foreground transition-colors group-hover:text-emerald-700">
                        {toolTitle(tool.slug)}
                      </h3>
                      <p className="mt-1 text-sm text-muted-fg">{toolDesc(tool.slug)}</p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── WEITERE WERKZEUGE ─────────────────────────── */}
        <section className="border-t border-border pt-8">
          <h2 className="mb-5 text-sm font-bold text-foreground">{t('moreTools')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href={"/tools/plans" as Route}
              className="tool-card-lift rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-emerald-700">{t('plansEyebrow')}</p>
              <h2 className="mt-1 text-xl font-bold text-foreground">{t('plansTitle')}</h2>
              <p className="mt-2 text-sm text-muted-fg">
                {t('plansDesc')}
              </p>
            </Link>
            <Link
              href={"/search" as Route}
              className="tool-card-lift rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-cyan-700">{t('searchEyebrow')}</p>
              <h2 className="mt-1 text-xl font-bold text-foreground">{t('searchTitle')}</h2>
              <p className="mt-2 text-sm text-muted-fg">
                {t('searchDesc')}
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
