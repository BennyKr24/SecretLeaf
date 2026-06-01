import Link from "next/link";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import { wikiArticles, sourceRegister } from "@/data/terpira/wiki";
import type { TerpiraArticle } from "@/lib/terpira/types";
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
    <div className="relative mx-auto w-full max-w-[940px]">
      <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.24),transparent_66%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 left-10 right-10 h-16 rounded-full bg-emerald-400/25 blur-2xl" />
      <div
        className="relative overflow-hidden rounded-[30px] border border-emerald-300/25 bg-[#08110f]/85 p-3 shadow-[0_26px_100px_rgba(0,0,0,0.62)] backdrop-blur-xl"
        style={{ transform: "perspective(1800px) rotateX(6deg) rotateY(-8deg)", transformOrigin: "center" }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[30px] ring-1 ring-white/10" />
        <div className="pointer-events-none absolute -left-24 top-[-1px] h-px w-[180%] rotate-[4deg] bg-gradient-to-r from-transparent via-emerald-200/35 to-transparent" />
        <div className="rounded-2xl border border-white/10 bg-[#0a1512] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/80">Grow OS</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-100">Meine Grows</h3>
            </div>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
              AI Diagnose aktiv
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                <span>OG Kush</span>
                <span className="text-emerald-300">Bluete - Tag 42</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[67%] rounded-full bg-gradient-to-r from-emerald-400 to-lime-300" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-2 text-emerald-200">Gesundheit: sehr gut</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300">Bewaesserung: in 2 Tagen</div>
                <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-2 text-amber-200">Naechste Aufgabe: Duengen</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">AI Diagnose</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">Keine kritischen Signale</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">VPD und pH innerhalb Zielbereich. Leichter N-Bedarf in 48h moeglich.</p>
              <button
                type="button"
                className="mt-3 rounded-lg border border-emerald-300/40 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
              >
                Details anzeigen
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Temperatur", value: "25 C", line: "from-emerald-300 to-green-500" },
              { label: "Luftfeuchte", value: "55%", line: "from-cyan-300 to-blue-500" },
              { label: "VPD", value: "0.92", line: "from-amber-300 to-yellow-500" },
              { label: "pH", value: "6.2", line: "from-fuchsia-300 to-purple-500" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{item.value}</p>
                <div className={`mt-2 h-1 rounded-full bg-gradient-to-r ${item.line}`} />
              </div>
            ))}
          </div>
        </div>
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
    .slice(0, 6);

  const evidenceLabels: EvidenceLabels = {
    high: tStudies("evidenceHigh"),
    med: tStudies("evidenceMed"),
    foundational: tStudies("evidenceFoundational"),
  };

  return (
    <main className="min-h-screen bg-[#030807] text-slate-100">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-44 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-emerald-500/12 blur-[150px]" />
          <div className="absolute -top-14 right-[-120px] h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute -bottom-20 right-0 h-[280px] w-[460px] rounded-full bg-teal-500/8 blur-[110px]" />
          <div className="absolute -left-16 bottom-6 h-[320px] w-[240px] rotate-[-12deg] rounded-[70%_30%_65%_35%/38%_60%_40%_62%] border border-emerald-300/12 bg-gradient-to-br from-emerald-400/12 to-transparent blur-[1px]" />
          <div className="absolute -right-20 top-8 h-[420px] w-[300px] rotate-[14deg] rounded-[74%_26%_46%_54%/42%_58%_42%_58%] border border-emerald-300/15 bg-gradient-to-br from-emerald-300/15 to-transparent blur-[1px]" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:26px_26px]" />
          <div className="absolute inset-x-0 top-[72px] h-px bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-10">
            <div className="order-1 lg:order-2">
              <ProductDashboardMock />
            </div>

            <div className="order-2 space-y-6 lg:order-1">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                {t("eyebrow")}
              </span>

              <h1 className="text-4xl font-semibold leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-[64px]">
                Grow smarter.
                <br />
                <span className="bg-gradient-to-r from-emerald-300 to-green-500 bg-clip-text text-transparent">Not harder.</span>
              </h1>

              <p className="max-w-md text-base leading-relaxed text-slate-400 sm:text-lg">{t("heroSub")}</p>

              <div className="flex flex-wrap gap-3">
                <CTAButton href="/start" size="lg" variant="primary" className="shadow-xl shadow-emerald-950/50 transition hover:-translate-y-0.5">
                  {t("ctaStart")}
                </CTAButton>
                <CTAButton href="/tools" size="lg" variant="ghost" className="border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10">
                  {t("ctaTools")}
                </CTAButton>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 sm:max-w-[420px] sm:grid-cols-4">
                {[
                  { icon: "🌱", title: "Grow-Tracker", sub: "Alles im Blick" },
                  { icon: "🩺", title: "AI Diagnose", sub: "Probleme erkennen" },
                  { icon: "🧮", title: "Profi-Tools", sub: "Besser entscheiden" },
                  { icon: "📚", title: "Wissen", sub: "Fundiert growen" },
                ].map((item) => (
                  <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-2">
                    <p className="text-sm">{item.icon}</p>
                    <p className="mt-1 font-semibold text-slate-200">{item.title}</p>
                    <p className="text-[11px] text-slate-500">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 sm:max-w-[420px] sm:grid-cols-4">
                <span className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-2">{articleCount} Artikel</span>
                <span className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-2">{sourceCount}+ Quellen</span>
                <span className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-2">Live Diagnose</span>
                <span className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-2">Taeglich aktualisiert</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <div className="flex -space-x-2">
                  {["A", "K", "M", "R"].map((ch) => (
                    <span key={ch} className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/10 text-xs font-semibold text-emerald-200">
                      {ch}
                    </span>
                  ))}
                </div>
                <span className="text-amber-300">★★★★★</span>
                <span className="text-slate-400">4,9/5 aus 1.200+ Bewertungen</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-[#040b09]">
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

      <section className="border-b border-white/5 bg-[#030807]">
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

      <section className="bg-[#060f0d]">
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

      <section className="border-y border-white/5 bg-[#040a08]">
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

      <section className="bg-[#030807]">
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
