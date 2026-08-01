import { Link } from "@/i18n/navigation";
import Image from "next/image";
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
      <div className="pointer-events-none absolute -inset-12 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.16),transparent_66%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 left-16 right-16 h-20 rounded-full bg-emerald-400/15 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1310] shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/80">Grow OS</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-50">Meine Pflanze</h3>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="space-y-4">
              <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-3 sm:grid-cols-[150px_1fr]">
                <div className="relative overflow-hidden rounded-xl border border-emerald-300/20">
                  <Image
                    src="/images/hero/plant-thumbnail.png"
                    alt="Cannabis Pflanze"
                    width={700}
                    height={700}
                    className="h-full min-h-[130px] w-full object-cover"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-100">OG Kush</p>
                      <p className="text-xs text-slate-400">Blüte · Tag 42</p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-300">67%</p>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[67%] rounded-full bg-gradient-to-r from-emerald-300 to-green-500" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <p className="text-slate-500">Gesundheit</p>
                      <p className="font-semibold text-emerald-200">Sehr gut</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Bewässerung</p>
                      <p className="font-semibold text-slate-200">In 2 Tagen</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Nächste Aufgabe</p>
                      <p className="font-semibold text-amber-200">Düngen</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="mb-2 text-[11px] uppercase tracking-widest text-slate-500">Übersicht</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: "Temperatur", value: "25 C", tone: "text-emerald-200" },
                    { label: "Luftfeuchtigkeit", value: "55%", tone: "text-cyan-200" },
                    { label: "VPD", value: "0.92", tone: "text-amber-200" },
                    { label: "pH", value: "6.2", tone: "text-fuchsia-200" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.label}</p>
                      <p className={`mt-1 text-base font-semibold ${item.tone}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-[1.4fr_1fr]">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="mb-2 text-[11px] uppercase tracking-widest text-slate-500">Letzte Aktivität</p>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Bewässerung · 2.5L · pH 6.3</span>
                    <span className="text-slate-500">Heute, 08:30</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/[0.06] p-3">
                  <p className="mb-1 text-[11px] uppercase tracking-widest text-emerald-200/70">AI Diagnose</p>
                  <p className="text-sm font-semibold text-emerald-100">Pflanze stabil und gesund</p>
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

      <Image
        src="/images/hero/plant-background.png"
        alt="Cannabis Blüten"
        width={887}
        height={1774}
        className="absolute right-[-42px] top-6 h-[620px] w-[310px] object-cover opacity-90 mix-blend-screen sl-photo-leaf sl-plant-leaf--slow"
        loading="lazy"
      />
      <Image
        src="/images/hero/leaf-detail.png"
        alt="Cannabis Blatt Detail"
        width={910}
        height={1727}
        className="absolute right-[-76px] top-[170px] h-[360px] w-[190px] object-cover opacity-80 mix-blend-screen sl-photo-leaf sl-plant-leaf--fast"
        loading="lazy"
      />
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
          <p className="text-center text-xs uppercase tracking-[0.22em] text-slate-500">Vertraut von über 10.000 Growern weltweit</p>
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
                body: "Erkenne Probleme frühzeitig und erhalte priorisierte Handlungsempfehlungen.",
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
                body: "Treffe fundierte Entscheidungen auf Basis geprüfter Quellen.",
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
                Starte mit einem Setup, führe tägliche Aufgaben aus, protokolliere Events und optimiere automatisch mit Diagnose plus Studienkontext.
              </p>
              <div className="mt-6 space-y-2">
                {[
                  "Setup Wizard mit Phase, Substrat und Zielprofil",
                  "Task Board mit Priorität und Fälligkeit",
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
                  { label: "Wöchentliche Logs", value: "18k+" },
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
              Grow-Tracker, Diagnose und Tools teilen sich ein Setup und dieselben Daten — kein Wechseln zwischen Insel-Lösungen, keine doppelte Eingabe.
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
