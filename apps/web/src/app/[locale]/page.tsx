import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import { wikiArticles, sourceRegister } from "@/data/terpira/wiki";
import type { TerpiraArticle } from "@/lib/terpira/types";
import { CTAButton } from "@/components/ui/CTAButton";
import { PremiumScrollFx } from "@/components/scroll/PremiumScrollFx";
import { CATEGORY_ICONS } from "@/lib/terpira/categoryIcons";
import { FileText } from "lucide-react";

/* ─── Minimal helpers kept for the studies section at the bottom ─── */

type EvidenceLabels = { high: string; med: string; foundational: string };

function evidenceLevel(n: number, labels: EvidenceLabels): { label: string; cls: string } {
  if (n >= 5) return { label: labels.high, cls: "evidence-high border" };
  if (n >= 3) return { label: labels.med, cls: "evidence-med border" };
  return { label: labels.foundational, cls: "evidence-low border" };
}

function StudyCard({ article, evidenceLabels }: { article: TerpiraArticle; evidenceLabels: EvidenceLabels }) {
  const n = article.sourceIds?.length ?? 0;
  const ev = evidenceLevel(n, evidenceLabels);
  const CategoryIcon = CATEGORY_ICONS[article.category] ?? FileText;
  return (
    <Link
      href={`/studies/${article.slug}` as Route}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5
        shadow-[0_20px_45px_rgba(0,0,0,0.32)] transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-500/[0.06]"
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-emerald-300">
          <CategoryIcon className="h-4 w-4" strokeWidth={2} />
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

// One dominant photo, one minimal floating status chip. The previous version
// crammed a header row + stat grid + progress bar + activity feed + AI-banner
// into one card — competing with itself. Apple/Linear heroes show ONE thing
// generously; everything else here was cut, not hidden (DESIGN_SYSTEM.md
// §2.2 Simplicity Wins / §12 Visual Density — this card was violating both).
function HeroPlantVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[480px]" data-parallax="0.12">
      <div className="pointer-events-none absolute -inset-16 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.22),transparent_65%)] blur-3xl" />

      <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
        <Image
          src="/images/hero/plant-thumbnail.png"
          alt="OG Kush Blüte, Nahaufnahme"
          fill
          sizes="(min-width: 1024px) 480px, 90vw"
          className="object-cover"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />
      </div>

      {/* One minimal floating glass chip (DESIGN_SYSTEM.md §16) instead of a
          dense stat grid — scales from the trigger-less "arrives as a real
          surface" read, not a UI panel. */}
      <div className="glass-surface absolute -bottom-7 left-6 right-6 flex items-center justify-between gap-4 rounded-2xl border border-white/10 px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:right-auto sm:w-[300px]">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-emerald-300/80">OG Kush · Tag 42</p>
          <p className="mt-0.5 text-2xl font-bold text-white">
            67<span className="text-base font-medium text-slate-400">% bis Ernte</span>
          </p>
        </div>
        <span className="flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.6)]" aria-hidden="true" />
      </div>
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
    .slice(0, 3);

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

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-10">
            <div className="order-1 lg:order-2" data-parallax="0.14" data-reveal data-reveal-delay="30">
              <HeroPlantVisual />
            </div>

            <div className="order-2 max-w-[470px] space-y-7 lg:order-1" data-reveal>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                {t("eyebrow")}
              </span>

              {/* text-[..px] breakpoints are arbitrary values — they don't pull the
                  fontSize scale's letterSpacing, so each needs its own tracking
                  (DESIGN_SYSTEM.md §6). Uses the full 72–96px hero range the doc
                  already specifies, instead of stopping at 78px on every screen. */}
              <h1 className="text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-6xl sm:tracking-[-0.03em] lg:text-[88px] lg:tracking-[-0.04em] xl:text-[96px]">
                Grow smarter.
                <br />
                <span className="bg-gradient-to-r from-emerald-300 to-green-500 bg-clip-text text-transparent">Not harder.</span>
              </h1>

              <p className="max-w-[460px] text-lg leading-relaxed text-slate-400 sm:text-xl">{t("heroSub")}</p>

              <div className="flex flex-wrap gap-3">
                <CTAButton href="/start" size="lg" variant="primary" className="shadow-xl shadow-emerald-950/50 transition-transform duration-200 hover:-translate-y-0.5">
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
          <p className="text-center text-xs uppercase tracking-[0.22em] text-slate-500">Basierend auf geprüften Quellen</p>

          {/* Only claims we can actually back with real, computed numbers —
              no user/review counts or press mentions until those exist. */}
          <div className="mt-5 grid grid-cols-1 gap-3 text-center text-sm text-slate-400 sm:grid-cols-3">
            {[
              `${articleCount} Fachartikel`,
              `${sourceCount}+ wiss. Quellen`,
              "Kostenlos nutzbar",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 transition-colors hover:border-emerald-400/30 hover:bg-emerald-500/[0.06]">
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
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.35)] transition-[transform,border-color,background-color] duration-200 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-emerald-500/[0.07]"
              >
                <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-400/10 blur-2xl" />
                <span className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-emerald-200">
                  {item.badge}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-300">
                  Öffnen
                  <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
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
            <Link href={"/studies" as Route} className="hidden text-sm font-semibold text-slate-300 transition-colors hover:text-emerald-300 sm:inline-flex">
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
                  { label: "Fachartikel", value: `${articleCount}` },
                  { label: "Validierte Quellen", value: `${sourceCount}+` },
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
