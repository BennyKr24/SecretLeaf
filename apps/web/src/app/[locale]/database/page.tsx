import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { Route } from "next";
import { fertilizerCatalog } from "@/data/terpira/fertilizers";
import {
  Flower2,
  Sprout,
  Leaf,
  Euro,
  Star,
  Droplets,
  Rocket,
  Bug,
  FlaskConical,
  Microscope,
  RefreshCw,
  Check,
  Ruler,
  type LucideIcon,
} from "lucide-react";

// — Server-side catalogue stats —
const total = fertilizerCatalog.length;
const brandCount = new Set(fertilizerCatalog.map((f) => f.brand)).size;
const flowerCount = fertilizerCatalog.filter((f) => f.phase.includes("flower")).length;
const vegCount = fertilizerCatalog.filter((f) => f.phase.includes("veg")).length;
const organicCount = fertilizerCatalog.filter(
  (f) => f.base === "organic" || f.base === "bio-organic"
).length;
const budgetCount = fertilizerCatalog.filter((f) => f.cost === "budget").length;
const premiumCount = fertilizerCatalog.filter((f) => f.cost === "premium").length;

const QUICK_FILTER_CLS =
  "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 hover:border-emerald-300";

const QUICK_FILTERS: Array<{
  label: string;
  icon: LucideIcon;
  href: string;
  count: number | null;
  cls: string;
}> = [
  {
    label: "Blüte",
    icon: Flower2,
    href: "/database/fertilizers?phase=flower",
    count: flowerCount,
    cls: QUICK_FILTER_CLS,
  },
  {
    label: "Grow / Veg",
    icon: Sprout,
    href: "/database/fertilizers?phase=veg",
    count: vegCount,
    cls: QUICK_FILTER_CLS,
  },
  {
    label: "Organisch",
    icon: Leaf,
    href: "/database/fertilizers?useCase=soil-organic",
    count: organicCount,
    cls: QUICK_FILTER_CLS,
  },
  {
    label: "Budget",
    icon: Euro,
    href: "/database/fertilizers?cost=budget",
    count: budgetCount,
    cls: QUICK_FILTER_CLS,
  },
  {
    label: "Premium",
    icon: Star,
    href: "/database/fertilizers?cost=premium",
    count: premiumCount,
    cls: QUICK_FILTER_CLS,
  },
  {
    label: "Hydro & Coco",
    icon: Droplets,
    href: "/database/fertilizers?useCase=hydro-performance",
    count: null,
    cls: QUICK_FILTER_CLS,
  },
  {
    label: "Max. Ertrag",
    icon: Rocket,
    href: "/database/fertilizers?useCase=max-yield",
    count: null,
    cls: QUICK_FILTER_CLS,
  },
];

const USE_CASES: Array<{
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
  accentCls: string;
  labelCls: string;
}> = [
  {
    icon: Droplets,
    title: "Hydro & Coco",
    desc: "Mineraldünger für präzise EC-Steuerung im Wasser- und Coco-Anbau.",
    href: "/database/fertilizers?useCase=hydro-performance",
    accentCls: "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/30 hover:border-emerald-300",
    labelCls: "text-emerald-700 dark:text-emerald-400",
  },
  {
    icon: Leaf,
    title: "Erde & Bio",
    desc: "Organische und bio-organische Linien für lebendige Böden und sanfte Ernährung.",
    href: "/database/fertilizers?useCase=soil-organic",
    accentCls: "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/30 hover:border-emerald-300",
    labelCls: "text-emerald-700 dark:text-emerald-400",
  },
  {
    icon: Euro,
    title: "Budget-freundlich",
    desc: "Günstige Produkte mit guter Abdeckung – ideal für den Einstieg.",
    href: "/database/fertilizers?cost=budget",
    accentCls: "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/30 hover:border-emerald-300",
    labelCls: "text-emerald-700 dark:text-emerald-400",
  },
  {
    icon: Rocket,
    title: "Maximaler Ertrag",
    desc: "Hochleistungs-Dünger mit besonders hohem Ertragspotenzial.",
    href: "/database/fertilizers?useCase=max-yield",
    accentCls: "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/30 hover:border-emerald-300",
    labelCls: "text-emerald-700 dark:text-emerald-400",
  },
  {
    icon: Flower2,
    title: "Blüte optimiert",
    desc: "PK-starke Blütedünger und Bloom-Booster für die Reifephase.",
    href: "/database/fertilizers?phase=flower",
    accentCls: "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/30 hover:border-emerald-300",
    labelCls: "text-emerald-700 dark:text-emerald-400",
  },
  {
    icon: Star,
    title: "Premium Systeme",
    desc: "Die besten Markensysteme ohne Kompromisse – CANNA, Athena, AN und mehr.",
    href: "/database/fertilizers?cost=premium",
    accentCls: "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/30 hover:border-emerald-300",
    labelCls: "text-emerald-700 dark:text-emerald-400",
  },
];

const LEXICONS: Array<{
  icon: LucideIcon;
  label: string;
  desc: string;
  href: string;
  accentCls: string;
  labelCls: string;
}> = [
  {
    icon: Bug,
    label: "Schädlinge",
    desc: "Symptome, Monitoring und Gegenmaßnahmen.",
    href: "/studies/pests",
    accentCls: "border-rose-100 dark:border-rose-900/40 hover:border-rose-300 hover:bg-rose-50 dark:bg-rose-950/30 dark:hover:bg-rose-950/30",
    labelCls: "text-rose-700 dark:text-rose-400",
  },
  {
    icon: FlaskConical,
    label: "Nährstoffmängel",
    desc: "Diagnose und Korrektur nach Symptom.",
    href: "/studies/deficiencies",
    accentCls: "border-sky-100 dark:border-sky-900/40 hover:border-sky-300 hover:bg-sky-50 dark:bg-sky-950/30 dark:hover:bg-sky-950/30",
    labelCls: "text-sky-700 dark:text-sky-400",
  },
  {
    icon: Microscope,
    label: "Quellenregister",
    desc: "Wissenschaftliche Quellen nach Publisher & Typ.",
    href: "/studies/sources",
    accentCls: "border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/30",
    labelCls: "text-emerald-700 dark:text-emerald-400",
  },
];

export default function DatabaseHubPage() {
  return (
    <main className="min-h-screen bg-card">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-800 px-6 pb-14 pt-12 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[10%] top-1/2 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-emerald-400/12 blur-[110px]" />
        </div>

        <Image
          src="/images/hero/database-dropper.png"
          alt=""
          width={862}
          height={1824}
          className="pointer-events-none absolute right-[-24px] top-[-20px] hidden h-[440px] w-[208px] object-cover opacity-90 mix-blend-screen sl-photo-leaf sl-plant-leaf--slow xl:block"
          aria-hidden="true"
          loading="lazy"
        />

        <div className="relative mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Produkt-Katalog
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
            Alle Dünger.{" "}
            <span className="text-emerald-400">Auf einen Blick.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            {total} Produkte von {brandCount} Marken – mit NPK-Werten, EC-Bereichen,
            Anwendungsphasen und Live-Preisvergleich.
          </p>

          {/* Stats strip */}
          <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-white/10 pt-6">
            {[
              { n: total, label: "Produkte" },
              { n: brandCount, label: "Marken" },
              { n: flowerCount, label: "Blüte-Dünger" },
              { n: organicCount, label: "Organisch" },
              { n: budgetCount, label: "Budget-Produkte" },
            ].map(({ n, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold tabular-nums">{n}</p>
                <p className="mt-0.5 text-xs text-muted-fg">{label}</p>
              </div>
            ))}
          </div>

          {/* Primary CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={"/database/fertilizers" as Route}
              className="rounded-xl bg-emerald-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400"
            >
              Katalog durchsuchen →
            </Link>
            <Link
              href={"/tools" as Route}
              className="rounded-xl border border-white/20 px-7 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Zu den Rechner-Tools
            </Link>
          </div>
        </div>
      </section>

      {/* ── Schnellstart-Chips ─────────────────────────────────────── */}
      <section className="border-b border-border bg-card px-6 py-7">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-fg">
            Schnelleinstieg
          </p>
          <p className="mt-1 text-sm text-muted-fg">
            Ein Klick – Katalog öffnet mit passendem Filter voreingestellt.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {QUICK_FILTERS.map((f) => (
              <Link
                key={f.href}
                href={f.href as Route}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${f.cls}`}
              >
                <f.icon className="h-4 w-4" strokeWidth={2} />
                {f.label}
                {f.count != null && (
                  <span className="rounded-full bg-card/70 px-1.5 py-0.5 text-xs tabular-nums">
                    {f.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use-Case-Karten ────────────────────────────────────────── */}
      <section className="bg-background px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-fg">
            Was passt zu dir?
          </p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">
            Starte mit einem Profil
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((uc) => (
              <Link
                key={uc.href}
                href={uc.href as Route}
                className={`group flex flex-col rounded-2xl border p-5 transition-[border-color,background-color,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-md ${uc.accentCls}`}
              >
                <uc.icon className="h-6 w-6 text-foreground/80" strokeWidth={2} />
                <h3 className="mt-3 text-base font-bold text-foreground">{uc.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-fg">{uc.desc}</p>
                <span className={`mt-4 text-xs font-semibold group-hover:underline ${uc.labelCls}`}>
                  Produkte anzeigen →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fachregister ──────────────────────────────────────────── */}
      <section className="border-t border-border bg-card px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-fg">
            Fachregister
          </p>
          <h2 className="mt-2 text-xl font-bold text-foreground/80">Lexika & Quellen</h2>
          <p className="mt-1 text-sm text-muted-fg">
            Eigenständige Nachschlagewerke – unabhängig vom Produkt-Katalog.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {LEXICONS.map((lex) => (
              <Link
                key={lex.href}
                href={lex.href as Route}
                className={`group flex items-start gap-4 rounded-2xl border bg-card p-4 transition-colors ${lex.accentCls}`}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                  <lex.icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${lex.labelCls}`}>{lex.label}</p>
                  <p className="mt-0.5 text-xs text-muted-fg">{lex.desc}</p>
                  <span className={`mt-2 inline-block text-xs font-semibold group-hover:underline ${lex.labelCls}`}>
                    Öffnen →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5">
            <Link
              href={"/studies" as Route}
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-emerald-700 dark:text-emerald-400"
            >
              Zur vollständigen Studiensammlung →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust / Kontext ───────────────────────────────────────── */}
      <section className="border-t border-border bg-background px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { icon: RefreshCw, text: "Preise täglich aktualisiert" },
              { icon: Check, text: "Redaktionell geprüfte Daten" },
              { icon: Ruler, text: "NPK + EC + PPFD je Produkt" },
              { icon: Microscope, text: "Wissenschaftlich fundiert" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-muted-fg">
                <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
