import type { Route } from "next";
import type { Metadata } from "next";
import { categoryLabels, wikiArticles, sourceRegister } from "@/data/terpira/wiki";
import { CATEGORY_DESCRIPTIONS } from "@/lib/terpira/categoryIcons";
import {
  localizeCategoryLabelMap,
  localizeCategoryDescriptionMap,
} from "@/lib/i18n/localizeContent";
import CategoryHubGrid from "@/components/CategoryHubGrid";
import OpenSearchButton from "@/components/OpenSearchButton";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Microscope, Bug, FlaskConical } from "lucide-react";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? {
        title: "Studies – SecretLeaf",
        description:
          "Science-based content on cultivation, terpenes, medicine, law and quality.",
      }
    : {
        title: "Studien – SecretLeaf",
        description:
          "Wissenschaftlich fundierte Inhalte zu Anbau, Terpenen, Medizin, Recht und Qualität.",
      };
}

export default async function StudiesPage({ params }: PageProps) {
  const { locale } = await params;
  const en = locale === "en";
  const labels = localizeCategoryLabelMap(categoryLabels, locale);
  const descriptions = localizeCategoryDescriptionMap(CATEGORY_DESCRIPTIONS, locale);

  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10 bg-brand-hero">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-full w-1/2 bg-emerald-600/5 blur-[80px]" />
          <div className="absolute right-[8%] top-1/2 h-[320px] w-[320px] -translate-y-1/2 rounded-full bg-emerald-500/12 blur-[100px]" />
        </div>

        <Image
          src="/images/hero/studies-trichomes.png"
          alt=""
          width={1006}
          height={1564}
          className="pointer-events-none absolute right-[-20px] top-[-30px] hidden h-[380px] w-[244px] object-cover opacity-85 mix-blend-screen sl-photo-leaf sl-plant-leaf--fast lg:block"
          aria-hidden="true"
          loading="lazy"
        />

        <div className="relative mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
                {en ? "Knowledge platform" : "Wissensplattform"}
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {en ? "Studies" : "Studien"}
              </h1>
              <p className="mt-2 max-w-xl text-[14px] text-slate-400 leading-relaxed">
                {en
                  ? `Science-based articles on cultivation, chemistry, medicine, law and more — backed by ${sourceRegister.length} peer-reviewed references.`
                  : `Wissenschaftlich fundierte Artikel zu Anbau, Chemie, Medizin, Recht und mehr – gestützt auf ${sourceRegister.length} peer-reviewed Fachquellen.`}
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-5 sm:gap-8 flex-shrink-0">
              {[
                { value: wikiArticles.length, label: en ? "Articles" : "Artikel" },
                { value: sourceRegister.length, label: en ? "Sources" : "Quellen" },
              ].map(s => (
                <div key={s.label} className="text-right">
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-links */}
          <div className="mt-6 flex flex-wrap gap-2">
            <OpenSearchButton
              label={en ? "Search articles" : "Artikel durchsuchen"}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10
                px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 transition-colors duration-150"
            />
            <Link href={"/studies/sources" as Route}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5
                px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors duration-150">
              <Microscope className="h-3.5 w-3.5" strokeWidth={2} /> {en ? "Source register" : "Quellenregister"}
            </Link>
            <Link href={"/studies/pests" as Route}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5
                px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors duration-150">
              <Bug className="h-3.5 w-3.5" strokeWidth={2} /> {en ? "Pest lexicon" : "Schädlings-Lexikon"}
            </Link>
            <Link href={"/studies/deficiencies" as Route}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5
                px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors duration-150">
              <FlaskConical className="h-3.5 w-3.5" strokeWidth={2} /> {en ? "Nutrient deficiencies" : "Nährstoffmängel"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category hub ─────────────────────────────────────── */}
      <section className="px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">{en ? "Fields" : "Fachgebiete"}</h2>
            <p className="mt-1 text-sm text-muted-fg">
              {en
                ? "Pick a field to browse and filter by topic."
                : "Wähle ein Fachgebiet, um gezielt zu stöbern und zu filtern."}
            </p>
          </div>
          <CategoryHubGrid
            articles={wikiArticles}
            categoryLabels={labels}
            categoryDescriptions={descriptions}
            locale={locale}
          />
        </div>
      </section>

    </main>
  );
}
