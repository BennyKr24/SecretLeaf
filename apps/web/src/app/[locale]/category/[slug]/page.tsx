import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { categoryLabels, wikiArticles } from "@/data/terpira/wiki";
import StudiesListView from "@/components/StudiesListView";
import type { TerpiraCategory } from "@/lib/terpira/types";
import { CATEGORY_ICONS } from "@/lib/terpira/categoryIcons";
import { FileText } from "lucide-react";

const CATEGORY_DESCRIPTIONS: Partial<Record<TerpiraCategory, string>> = {
  anbau:         'Alles zu Anbau, Pflege und Ernte – von der Keimung bis zur Trocknung und zum Curing.',
  genetik:       'Genetik, Züchtung und Sortenwahl – für gezielte Ergebnisse bei Ertrag und Wirkstoffprofil.',
  chemie:        'Nährstoffe, Substrate und chemische Grundlagen für gesundes Pflanzenwachstum.',
  terpene:       'Terpenprofile, Aromastoffe und deren Einfluss auf Wirkung und Geschmack.',
  medizin:       'Wissenschaftliche Erkenntnisse zu medizinischen Cannabis-Anwendungen.',
  konsumformen:  'Verschiedene Konsumformen und Anwendungsmethoden im Überblick.',
  konzentrate:   'Extraktion, Verarbeitung und Qualitätsbewertung von Konzentraten.',
  recht:         'Rechtliche Rahmenbedingungen, Regulierung und Compliance.',
  sicherheit:    'Sicherheitshinweise, Risikobewertung und verantwortungsvoller Umgang.',
  qualitaet:     'Laboranalysen, Qualitätskontrolle und Reinheitsprüfungen.',
  markt:         'Marktanalysen, Beschaffung und aktuelle Preisentwicklungen.',
  werkzeuge:     'Praktische Rechner, Kalkulatoren und Werkzeuge für den Alltag.',
};

const validCategories = Object.keys(categoryLabels) as TerpiraCategory[];

export function generateStaticParams() {
  return validCategories.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const label = categoryLabels[params.slug as TerpiraCategory];
  if (!label) return { title: "Kategorie – SecretLeaf" };
  return {
    title: `${label} – Studien – SecretLeaf`,
    description: CATEGORY_DESCRIPTIONS[params.slug as TerpiraCategory] ?? `Alle Fachartikel zum Thema ${label} auf SecretLeaf.`,
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = params.slug as TerpiraCategory;
  if (!validCategories.includes(cat)) notFound();

  const label = categoryLabels[cat];
  const CategoryIcon = CATEGORY_ICONS[cat] ?? FileText;
  const description = CATEGORY_DESCRIPTIONS[cat];
  const articles = wikiArticles.filter(a => a.category === cat);

  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-brand-hero">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-full w-1/3 bg-emerald-600/5 blur-[60px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4">
            <Link href={"/" as Route} className="text-[13px] text-muted-fg hover:text-white transition-colors">
              Home
            </Link>
            <svg className="w-3.5 h-3.5 text-foreground/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link href={"/studies" as Route} className="text-[13px] text-muted-fg hover:text-white transition-colors">
              Studien
            </Link>
            <svg className="w-3.5 h-3.5 text-foreground/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[13px] text-slate-300">{label}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-300 flex-shrink-0">
              <CategoryIcon className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Fachgebiet</p>
              <h1 className="mt-0.5 text-3xl font-bold text-white tracking-tight">{label}</h1>
              {description && (
                <p className="mt-1.5 text-sm text-muted-fg leading-relaxed max-w-xl">{description}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {articles.length} Artikel
            </span>
          </div>
        </div>
      </section>

      {/* ── List ──────────────────────────────────────────────── */}
      <section className="px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <StudiesListView
            articles={articles}
            categoryLabels={categoryLabels}
            initialCategory={cat}
            hideCategoryFilter
          />
        </div>
      </section>

    </main>
  );
}
