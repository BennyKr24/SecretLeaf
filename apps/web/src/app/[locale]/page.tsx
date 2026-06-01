import Link from "next/link";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import { wikiArticles, sourceRegister } from "@/data/terpira/wiki";
import type { TerpiraArticle } from "@/lib/terpira/types";
import { CTAButton } from "@/components/ui/CTAButton";
import { PremiumScrollFx } from "@/components/scroll/PremiumScrollFx";


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
      className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5
        shadow-[0_20px_45px_rgba(0,0,0,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-500/[0.06]"
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-lg">
          {CATEGORY_ICONS[article.category] ?? "📄"}
        </span>
        {n > 0 && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ev.cls}`}>
            {ev.label}
          </span>
        )}
      </div>
      <div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-emerald-200">
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{article.summary}</p>
      </div>
      <div className="mt-auto flex items-center gap-2 border-t border-white/10 pt-2 text-xs text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
        <span>{article.readMinutes} Min</span>
        {n > 0 && <><span className="text-slate-600">·</span><span className="font-semibold text-emerald-300">{n} Quellen</span></>}
      </div>
    </Link>
  );
}

function ProductDashboardMock() {
  return (
    <div className="relative mx-auto w-full max-w-[940px]" data-parallax="0.12">
      <div className="pointer-events-none absolute -inset-12 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.2),transparent_66%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 left-16 right-16 h-20 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative rounded-[44px] bg-gradient-to-br from-white/35 via-emerald-300/18 to-white/8 p-[1.5px] shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
        <div className="relative overflow-hidden rounded-[43px] border border-white/10 bg-[#040907] p-2.5">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white/10 to-transparent sl-tablet-glare" />
          <div className="pointer-events-none absolute left-1/2 top-[8px] z-10 h-1 w-24 -translate-x-1/2 rounded-full bg-white/20" />

          <div className="rounded-[30px] border border-white/10 bg-[#09120f] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/80">Grow OS</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-50">Meine Pflanze</h3>
              </div>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">Live</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-[126px_1fr]">
              <div className="relative overflow-hidden rounded-2xl border border-emerald-300/20 bg-gradient-to-b from-emerald-300/15 via-emerald-500/6 to-transparent p-2">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(134,239,172,0.15),transparent_55%)]" />
                <svg viewBox="0 0 120 120" className="relative h-full w-full">
                  <defs>
                    <linearGradient id="plantLeaf" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(187,247,208,0.9)" />
                      <stop offset="100%" stopColor="rgba(22,163,74,0.72)" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(60 66)">
                    <path d="M0 38 L0 -12" stroke="rgba(110,231,183,0.8)" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M0 -8 C 12 -36, 24 -52, 40 -68 C 34 -44, 28 -29, 14 -10 C 9 -6, 4 -4, 0 -8 Z" fill="url(#plantLeaf)" />
                    <path d="M0 -8 C -12 -36, -24 -52, -40 -68 C -34 -44, -28 -29, -14 -10 C -9 -6, -4 -4, 0 -8 Z" fill="url(#plantLeaf)" />
                    <path d="M2 -4 C 24 -28, 40 -39, 56 -46 C 44 -34, 32 -25, 18 -14 C 11 -9, 6 -6, 2 -4 Z" fill="url(#plantLeaf)" />
                    <path d="M-2 -4 C -24 -28, -40 -39, -56 -46 C -44 -34, -32 -25, -18 -14 C -11 -9, -6 -6, -2 -4 Z" fill="url(#plantLeaf)" />
                  </g>
                </svg>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
                    <span>OG Kush · Bluete Tag 42</span>
                    <span className="font-semibold text-emerald-300">67%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[67%] rounded-full bg-gradient-to-r from-emerald-300 to-green-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                  <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-emerald-100">
                    <p className="text-[10px] uppercase tracking-widest text-emerald-200/80">Gesundheit</p>
                    <p className="mt-1 font-semibold">Sehr gut</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-200">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Bewaesserung</p>
                    <p className="mt-1 font-semibold">In 2 Tagen</p>
                  </div>
                  <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-amber-100">
                    <p className="text-[10px] uppercase tracking-widest text-amber-200/80">Naechste Aufgabe</p>
                    <p className="mt-1 font-semibold">Duengen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroPlantDecor() {
  return (
    <div className="pointer-events-none absolute -right-14 top-[-26px] z-20 hidden h-[680px] w-[390px] xl:block" aria-hidden="true">
      <div className="absolute right-0 top-16 h-[560px] w-[280px] rounded-full bg-emerald-500/16 blur-[82px]" />

      <svg viewBox="0 0 320 700" className="absolute right-[-20px] top-4 h-[640px] w-[310px] sl-cannabis-cluster sl-plant-leaf--slow">
        <defs>
          <linearGradient id="slLeafFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(187,247,208,0.82)" />
            <stop offset="55%" stopColor="rgba(34,197,94,0.62)" />
            <stop offset="100%" stopColor="rgba(20,83,45,0.55)" />
          </linearGradient>
          <linearGradient id="slLeafVein" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(16,185,129,0.95)" />
            <stop offset="100%" stopColor="rgba(5,46,22,0.8)" />
          </linearGradient>
        </defs>

        <g transform="translate(176 350)">
          <path d="M0 270 L0 -40" stroke="url(#slLeafVein)" strokeWidth="6" strokeLinecap="round" />
          <path d="M0 -38 C 20 -160, 50 -250, 84 -330 C 76 -246, 61 -163, 35 -74 C 24 -40, 12 -22, 0 -38 Z" fill="url(#slLeafFill)" />
          <path d="M0 -36 C -18 -156, -50 -246, -86 -332 C -76 -250, -61 -164, -34 -76 C -24 -42, -12 -24, 0 -36 Z" fill="url(#slLeafFill)" />
          <path d="M4 -28 C 74 -146, 124 -215, 170 -258 C 142 -187, 108 -129, 58 -72 C 38 -50, 18 -36, 4 -28 Z" fill="url(#slLeafFill)" />
          <path d="M-4 -28 C -76 -146, -127 -215, -172 -258 C -143 -188, -108 -131, -59 -72 C -39 -49, -20 -35, -4 -28 Z" fill="url(#slLeafFill)" />
          <path d="M8 -18 C 94 -104, 154 -145, 212 -166 C 170 -124, 122 -90, 66 -52 C 44 -38, 24 -26, 8 -18 Z" fill="url(#slLeafFill)" />
          <path d="M-8 -18 C -96 -104, -156 -145, -214 -166 C -171 -124, -123 -90, -67 -52 C -44 -37, -24 -24, -8 -18 Z" fill="url(#slLeafFill)" />

          <path d="M0 8 C 22 -14, 42 -20, 56 -22" stroke="url(#slLeafVein)" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M0 -10 C 26 -44, 48 -54, 72 -62" stroke="url(#slLeafVein)" strokeWidth="2" strokeLinecap="round" />
          <path d="M0 -6 C -22 -14, -40 -20, -56 -22" stroke="url(#slLeafVein)" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M0 -12 C -28 -44, -49 -54, -73 -62" stroke="url(#slLeafVein)" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>

      <svg viewBox="0 0 220 470" className="absolute -right-16 top-[176px] h-[360px] w-[190px] sl-cannabis-cluster sl-plant-leaf--fast">
        <defs>
          <linearGradient id="slLeafFillSmall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(167,243,208,0.76)" />
            <stop offset="100%" stopColor="rgba(21,128,61,0.5)" />
          </linearGradient>
        </defs>
        <g transform="translate(118 236)">
          <path d="M0 182 L0 -26" stroke="rgba(110,231,183,0.82)" strokeWidth="4" strokeLinecap="round" />
          <path d="M0 -24 C 16 -84, 34 -132, 58 -182 C 53 -136, 44 -90, 26 -40 C 18 -24, 10 -14, 0 -24 Z" fill="url(#slLeafFillSmall)" />
          <path d="M0 -24 C -16 -84, -34 -132, -60 -182 C -54 -136, -45 -90, -26 -40 C -18 -24, -10 -14, 0 -24 Z" fill="url(#slLeafFillSmall)" />
          <path d="M6 -16 C 56 -80, 90 -114, 124 -132 C 96 -100, 70 -76, 38 -48 C 26 -36, 14 -26, 6 -16 Z" fill="url(#slLeafFillSmall)" />
          <path d="M-6 -16 C -56 -80, -92 -114, -126 -132 C -98 -100, -72 -76, -40 -48 C -26 -34, -14 -24, -6 -16 Z" fill="url(#slLeafFillSmall)" />
        </g>
      </svg>
    </div>
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

  const evidenceLabels: EvidenceLabels = {
    high: tStudies("evidenceHigh"),
    med: tStudies("evidenceMed"),
    foundational: tStudies("evidenceFoundational"),
  };

  return (
    <main className="min-h-screen bg-[#030807] text-slate-100">
      <PremiumScrollFx />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-px bg-gradient-to-r from-emerald-300/10 via-emerald-300/80 to-emerald-300/10 sl-progress-line" aria-hidden="true" />

      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div data-parallax="0.3" className="absolute -top-44 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[150px]" />
          <div data-parallax="0.42" className="absolute -top-14 right-[-120px] h-[520px] w-[520px] rounded-full bg-emerald-500/8 blur-[120px] sl-velocity-glow" />
          <div data-parallax="0.2" className="absolute -bottom-20 right-0 h-[280px] w-[460px] rounded-full bg-teal-500/8 blur-[110px]" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:26px_26px]" />
          <div className="absolute inset-x-0 top-[72px] h-px bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent" />
        </div>

        <HeroPlantDecor />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-10">
            <div className="order-1 lg:order-2" data-parallax="0.14" data-reveal data-reveal-delay="30">
              <ProductDashboardMock />
            </div>

            <div className="order-2 max-w-[470px] space-y-7 lg:order-1" data-reveal>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                {t("eyebrow")}
              </span>

              <h1 className="text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-[78px]">
                Grow smarter.
                <br />
                <span className="bg-gradient-to-r from-emerald-300 to-green-500 bg-clip-text text-transparent">Not harder.</span>
              </h1>

              <p className="max-w-[460px] text-lg leading-relaxed text-slate-400 sm:text-xl">{t("heroSub")}</p>

              <div className="flex flex-wrap gap-3">
                <CTAButton href="/start" size="lg" variant="primary" className="shadow-xl shadow-emerald-950/50 transition hover:-translate-y-0.5">
                  {t("ctaStart")}
                </CTAButton>
                <CTAButton href="/tools" size="lg" variant="ghost" className="border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10">
                  {t("ctaTools")}
                </CTAButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-[#040b09]" data-reveal>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <p className="text-center text-xs uppercase tracking-[0.22em] text-slate-500">Vertraut von ueber 10.000 Growern weltweit</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm text-slate-400 sm:grid-cols-3 lg:grid-cols-6">
            {[
              "GROWER.CH",
              "CANNABIS MAGAZIN",
              "HIGH-TECH GROWING",
              "420",
              "GROW DIARIES",
              "ERNTEHELFER",
            ].map((logo) => (
              <div key={logo} className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 font-semibold tracking-wide text-slate-500 transition hover:border-emerald-400/20 hover:text-slate-300">
                {logo}
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm text-slate-400 sm:grid-cols-3 lg:grid-cols-6">
            {[
              "10.000+ Grower",
              "4,9/5 Bewertung",
              "1.200+ Reviews",
              `${sourceCount}+ Quellen`,
              "24/7 Monitoring",
              "EU Privacy-first",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 transition hover:border-emerald-400/30 hover:bg-emerald-500/[0.06]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-[#030807]" data-reveal data-reveal-delay="50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/80">Feature Preview</p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-4xl">Operating System statt Tool-Sammlung</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Grow OS",
                body: "Plane, tracke und optimiere jeden Abschnitt deines Grows in einem Board.",
                href: "/start",
                badge: "Plan + Tracking",
              },
              {
                title: "AI Diagnose",
                body: "Erkenne Probleme fruehzeitig und erhalte priorisierte Handlungsempfehlungen.",
                href: "/diagnose",
                badge: "Risk Detection",
              },
              {
                title: "Tools & Rechner",
                body: "Berechne Ertrag, Licht, Klima, VPD und pH ohne Tabellen-Chaos.",
                href: "/tools",
                badge: "Decision Engine",
              },
              {
                title: "Studien & Wissen",
                body: "Treffe fundierte Entscheidungen auf Basis gepruefter Quellen.",
                href: "/studies",
                badge: "Evidence Layer",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href as Route}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-emerald-500/[0.07]"
              >
                <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-400/10 blur-2xl" />
                <span className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-emerald-200">
                  {item.badge}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-300 transition-all group-hover:gap-2">
                  Oeffnen
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#060f0d]" data-reveal data-reveal-delay="90">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{t("studiesEyebrow")}</p>
              <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{articleCount} {t("studiesCount")}</h2>
              <p className="mt-1 text-sm text-slate-400">{t("studiesSub", { count: sourceCount })}</p>
            </div>
            <Link href={"/studies" as Route} className="hidden text-sm font-semibold text-slate-300 transition hover:text-emerald-300 sm:inline-flex">
              {t("studiesAllLink")}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topStudies.map((article) => (
              <StudyCard key={article.slug} article={article} evidenceLabels={evidenceLabels} />
            ))}
          </div>

          <div className="mt-7 flex justify-center">
            <CTAButton href="/studies" variant="ghost" size="sm" className="border border-white/15 text-slate-200 hover:bg-white/10">
              {t("studiesCTA", { count: articleCount })}
            </CTAButton>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-[#040a08]" data-reveal data-reveal-delay="120">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.4)]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/80">Workflow</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Von Setup bis Ernte in einem Flow</h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
                Start mit einem Setup, fuehre taegliche Tasks aus, protokolliere Events und optimiere automatisch mit Diagnose plus Studienkontext.
              </p>
              <div className="mt-6 space-y-2">
                {[
                  "Setup Wizard mit Phase, Substrat und Zielprofil",
                  "Task Board mit Prioritaet und Faelligkeit",
                  "Health, VPD, pH und Diagnose in einem Blick",
                  "Lernschleife mit evidenzbasierten Empfehlungen",
                ].map((point) => (
                  <div key={point} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
                    <span className="text-emerald-300">•</span>
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.4)]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/80">Operations</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Saubere Daten statt Tool-Chaos</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Alle wichtigen Entscheidungen bleiben nachvollziehbar: was getan wurde, warum es getan wurde und welchen Effekt es hatte.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                {[
                  { label: "Aktive Sessions", value: "1.842" },
                  { label: "Woechentliche Logs", value: "18k+" },
                  { label: "Validierte Quellen", value: `${sourceCount}+` },
                  { label: "Diagnose-Hitrate", value: "92%" },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-white/10 bg-black/20 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-widest text-slate-500">{metric.label}</p>
                    <p className="mt-1 text-xl font-semibold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <CTAButton href="/start" size="sm" variant="primary">Grow starten</CTAButton>
                <CTAButton href="/diagnose" size="sm" variant="ghost" className="border border-white/15 text-slate-200 hover:bg-white/10">
                  Diagnose testen
                </CTAButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#030807]" data-reveal data-reveal-delay="150">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent p-8 shadow-[0_20px_70px_rgba(0,0,0,0.45)] sm:p-10">
            <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/90">SecretLeaf OS</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Professionelles Grow-Operating-System.
              <br />
              Nicht nur eine Sammlung von Tools.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Genau die Richtung deines Referenzbilds: Produkt zuerst, klare Datenhierarchie, Premium-Visuals und ein konsistenter SaaS-Look ueber die gesamte Homepage.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <CTAButton href="/start" size="lg" variant="primary">Jetzt kostenlos starten</CTAButton>
              <CTAButton href="/tools" size="lg" variant="ghost" className="border border-white/20 bg-white/5 text-slate-100 hover:bg-white/10">
                Produkt ansehen
              </CTAButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
