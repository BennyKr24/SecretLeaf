import Link from "next/link";
import type { Route } from "next";
import { fertilizerCatalog } from "@/data/terpira/fertilizers";

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

const QUICK_FILTERS = [
  {
    label: "Blüte",
    icon: "🌸",
    href: "/database/fertilizers?phase=flower",
    count: flowerCount,
    cls: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300",
  },
  {
    label: "Grow / Veg",
    icon: "🌱",
    href: "/database/fertilizers?phase=veg",
    count: vegCount,
    cls: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300",
  },
  {
    label: "Organisch",
    icon: "🍃",
    href: "/database/fertilizers?useCase=soil-organic",
    count: organicCount,
    cls: "border-lime-200 bg-lime-50 text-lime-700 hover:bg-lime-100 hover:border-lime-300",
  },
  {
    label: "Budget",
    icon: "💶",
    href: "/database/fertilizers?cost=budget",
    count: budgetCount,
    cls: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300",
  },
  {
    label: "Premium",
    icon: "⭐",
    href: "/database/fertilizers?cost=premium",
    count: premiumCount,
    cls: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:border-violet-300",
  },
  {
    label: "Hydro & Coco",
    icon: "💧",
    href: "/database/fertilizers?useCase=hydro-performance",
    count: null,
    cls: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 hover:border-cyan-300",
  },
  {
    label: "Max. Ertrag",
    icon: "🚀",
    href: "/database/fertilizers?useCase=max-yield",
    count: null,
    cls: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300",
  },
] as const;

const USE_CASES = [
  {
    icon: "💧",
    title: "Hydro & Coco",
    desc: "Mineraldünger für präzise EC-Steuerung im Wasser- und Coco-Anbau.",
    href: "/database/fertilizers?useCase=hydro-performance",
    accentCls: "border-cyan-100 bg-cyan-50/60 hover:border-cyan-300",
    labelCls: "text-cyan-700",
  },
  {
    icon: "🌿",
    title: "Erde & Bio",
    desc: "Organische und bio-organische Linien für lebendige Böden und sanfte Ernährung.",
    href: "/database/fertilizers?useCase=soil-organic",
    accentCls: "border-lime-100 bg-lime-50/60 hover:border-lime-300",
    labelCls: "text-lime-700",
  },
  {
    icon: "💶",
    title: "Budget-freundlich",
    desc: "Günstige Produkte mit guter Abdeckung – ideal für den Einstieg.",
    href: "/database/fertilizers?cost=budget",
    accentCls: "border-amber-100 bg-amber-50/60 hover:border-amber-300",
    labelCls: "text-amber-700",
  },
  {
    icon: "🚀",
    title: "Maximaler Ertrag",
    desc: "Hochleistungs-Dünger mit besonders hohem Ertragspotenzial.",
    href: "/database/fertilizers?useCase=max-yield",
    accentCls: "border-orange-100 bg-orange-50/60 hover:border-orange-300",
    labelCls: "text-orange-700",
  },
  {
    icon: "🌸",
    title: "Blüte optimiert",
    desc: "PK-starke Blütedünger und Bloom-Booster für die Reifephase.",
    href: "/database/fertilizers?phase=flower",
    accentCls: "border-rose-100 bg-rose-50/60 hover:border-rose-300",
    labelCls: "text-rose-700",
  },
  {
    icon: "⭐",
    title: "Premium Systeme",
    desc: "Die besten Markensysteme ohne Kompromisse – CANNA, Athena, AN und mehr.",
    href: "/database/fertilizers?cost=premium",
    accentCls: "border-violet-100 bg-violet-50/60 hover:border-violet-300",
    labelCls: "text-violet-700",
  },
] as const;

const LEXICONS = [
  {
    icon: "🐛",
    label: "Schädlinge",
    desc: "Symptome, Monitoring und Gegenmaßnahmen.",
    href: "/studies/pests",
    accentCls: "border-rose-100 hover:border-rose-300 hover:bg-rose-50",
    labelCls: "text-rose-700",
  },
  {
    icon: "🧪",
    label: "Nährstoffmängel",
    desc: "Diagnose und Korrektur nach Symptom.",
    href: "/studies/deficiencies",
    accentCls: "border-sky-100 hover:border-sky-300 hover:bg-sky-50",
    labelCls: "text-sky-700",
  },
  {
    icon: "🔬",
    label: "Quellenregister",
    desc: "Wissenschaftliche Quellen nach Publisher & Typ.",
    href: "/studies/sources",
    accentCls: "border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50",
    labelCls: "text-emerald-700",
  },
] as const;

export default function DatabaseHubPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-800 px-6 pb-14 pt-12 text-white">
        <div className="mx-auto max-w-5xl">
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
                <p className="mt-0.5 text-xs text-slate-400">{label}</p>
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
      <section className="border-b border-slate-100 bg-white px-6 py-7">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Schnelleinstieg
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Ein Klick – Katalog öffnet mit passendem Filter voreingestellt.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {QUICK_FILTERS.map((f) => (
              <Link
                key={f.href}
                href={f.href as Route}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${f.cls}`}
              >
                <span>{f.icon}</span>
                {f.label}
                {f.count != null && (
                  <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-xs tabular-nums">
                    {f.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use-Case-Karten ────────────────────────────────────────── */}
      <section className="bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Was passt zu dir?
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Starte mit einem Profil
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((uc) => (
              <Link
                key={uc.href}
                href={uc.href as Route}
                className={`group flex flex-col rounded-2xl border p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${uc.accentCls}`}
              >
                <span className="text-2xl">{uc.icon}</span>
                <h3 className="mt-3 text-base font-bold text-slate-900">{uc.title}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-500">{uc.desc}</p>
                <span className={`mt-4 text-xs font-semibold group-hover:underline ${uc.labelCls}`}>
                  Produkte anzeigen →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fachregister ──────────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-white px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Fachregister
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-700">Lexika & Quellen</h2>
          <p className="mt-1 text-sm text-slate-500">
            Eigenständige Nachschlagewerke – unabhängig vom Produkt-Katalog.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {LEXICONS.map((lex) => (
              <Link
                key={lex.href}
                href={lex.href as Route}
                className={`group flex items-start gap-4 rounded-2xl border bg-white p-4 transition-colors ${lex.accentCls}`}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-lg">
                  {lex.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${lex.labelCls}`}>{lex.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{lex.desc}</p>
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700"
            >
              Zur vollständigen Studiensammlung →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust / Kontext ───────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { icon: "🔄", text: "Preise täglich aktualisiert" },
              { icon: "✓", text: "Redaktionell geprüfte Daten" },
              { icon: "📐", text: "NPK + EC + PPFD je Produkt" },
              { icon: "🔬", text: "Wissenschaftlich fundiert" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-emerald-600">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
