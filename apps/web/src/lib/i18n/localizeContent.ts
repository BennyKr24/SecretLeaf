// ────────────────────────────────────────────────────────────────────────────
// Content localisation overlay (Track A5 of docs/I18N_TRANSLATION_PLAN.md)
//
// The knowledge base lives in German data files. For `locale === "en"` we lay
// the committed translation memories over an article/result object: every
// German prose string that has a translation is swapped, everything else
// (slugs, ids, numbers, not-yet-translated text) is left as-is.
//
// The TMs are produced by scripts/translate-content.mjs and keyed by a hash of
// the source string; here we only need the { de -> en } direction, rebuilt
// once at module load.
// ────────────────────────────────────────────────────────────────────────────

import enWiki from "@/data/i18n/en.wiki.json";
import enDiagnostics from "@/data/i18n/en.diagnostics.json";
import enTree from "@/data/i18n/en.diagnose-tree.json";
import type { TerpiraCategory, DiagnoseArea } from "@/lib/terpira/types";

type TMEntry = { de: string; en: string | null; paths: string[] };
type TMFile = Record<string, TMEntry>;

function buildMap(...files: TMFile[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const file of files) {
    for (const entry of Object.values(file)) {
      if (entry.en && entry.en.trim()) m.set(entry.de, entry.en);
    }
  }
  return m;
}

/** Wiki + diagnostic articles share one map — identical German strings translate identically. */
const ARTICLE_EN = buildMap(enWiki as TMFile, enDiagnostics as TMFile);
const TREE_EN = buildMap(enTree as TMFile);

function deepLocalize<T>(node: T, map: Map<string, string>): T {
  if (typeof node === "string") {
    return (map.get(node) ?? node) as unknown as T;
  }
  if (Array.isArray(node)) {
    return node.map((child) => deepLocalize(child, map)) as unknown as T;
  }
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) out[key] = deepLocalize(value, map);
    return out as T;
  }
  return node;
}

const isEn = (locale: string) => locale === "en";

/** Return an EN-overlaid copy of an article (or the original for any other locale). */
export function localizeArticle<T extends object>(article: T, locale: string): T {
  return isEn(locale) ? deepLocalize(article, ARTICLE_EN) : article;
}

/** Return an EN-overlaid copy of a diagnose decision-tree result. */
export function localizeDiagnoseResult<T extends object>(result: T, locale: string): T {
  return isEn(locale) ? deepLocalize(result, TREE_EN) : result;
}

/**
 * Whether the article has been translated at all (its title is in the TM).
 * Used to show a "partly German" note while a translation run is still in
 * progress; once the full run completes every article passes.
 */
export function isArticleTranslated(article: { title: string }, locale: string): boolean {
  return !isEn(locale) || ARTICLE_EN.has(article.title);
}

const CATEGORY_LABELS_EN: Record<TerpiraCategory, string> = {
  anbau: "Growing & Harvest",
  diagnose: "Diagnosis & Troubleshooting",
  tutorials: "Tutorials & Guides",
  genetik: "Genetics & Selection",
  chemie: "Chemistry & Nutrients",
  terpene: "Terpenes & Aroma",
  medizin: "Medicine & Effects",
  konsumformen: "Use & Consumption",
  konzentrate: "Concentrates & Extracts",
  recht: "Law & Compliance",
  sicherheit: "Safety & Education",
  qualitaet: "Quality & Lab Values",
  markt: "Market & Sourcing",
  werkzeuge: "Tools & Calculators",
};

/** Localise a wiki category label, falling back to the given German label. */
export function localizeCategoryLabel(
  category: TerpiraCategory,
  deLabel: string,
  locale: string,
): string {
  return isEn(locale) ? (CATEGORY_LABELS_EN[category] ?? deLabel) : deLabel;
}

/** EN copy of `categoryLabels` from @/data/terpira/wiki, for map-shaped props. */
export function localizeCategoryLabelMap(
  deLabels: Record<string, string>,
  locale: string,
): Record<string, string> {
  if (!isEn(locale)) return deLabels;
  const out: Record<string, string> = {};
  for (const [cat, deLabel] of Object.entries(deLabels)) {
    out[cat] = CATEGORY_LABELS_EN[cat as TerpiraCategory] ?? deLabel;
  }
  return out;
}

// One-sentence category descriptions — EN mirror of CATEGORY_DESCRIPTIONS in
// @/lib/terpira/categoryIcons (kept 1:1 with the same keys).
const CATEGORY_DESCRIPTIONS_EN: Record<string, string> = {
  anbau:
    "Cultivation technique and reference: substrate, irrigation, nutrients, light and harvest in detail.",
  diagnose:
    "Symptom spotted, now find the cause — diagnose and fix deficiencies, diseases, pests and environmental stress.",
  tutorials:
    "Step-by-step guides for a whole grow — from first setup to harvest, for every experience level.",
  genetik:
    "Genetics, breeding and strain selection — for targeted results in yield and cannabinoid profile.",
  chemie:
    "Nutrients, substrates and the chemical fundamentals of healthy plant growth.",
  terpene:
    "Terpene profiles, aroma compounds and their influence on effect and flavour.",
  medizin: "Scientific findings on medical cannabis applications.",
  konsumformen: "An overview of the different consumption forms and methods of use.",
  konzentrate: "Extraction, processing and quality assessment of concentrates.",
  recht: "Legal framework, regulation and compliance.",
  sicherheit: "Safety guidance, risk assessment and responsible use.",
  qualitaet: "Lab analysis, quality control and purity testing.",
  markt: "Market analysis, sourcing and current price trends.",
  werkzeuge: "Practical calculators and everyday tools.",
};

/** Localise a category description, falling back to the given German text. */
export function localizeCategoryDescription(
  category: string,
  deText: string | undefined,
  locale: string,
): string | undefined {
  return isEn(locale) ? (CATEGORY_DESCRIPTIONS_EN[category] ?? deText) : deText;
}

/** EN copy of CATEGORY_DESCRIPTIONS, for map-shaped props (falls back per key). */
export function localizeCategoryDescriptionMap(
  deMap: Record<string, string>,
  locale: string,
): Record<string, string> {
  if (!isEn(locale)) return deMap;
  const out: Record<string, string> = {};
  for (const [cat, deText] of Object.entries(deMap)) {
    out[cat] = CATEGORY_DESCRIPTIONS_EN[cat] ?? deText;
  }
  return out;
}

// Symptom-area labels for the "diagnose" category facet — EN mirror of
// DIAGNOSE_AREA_LABELS in @/lib/terpira/categoryIcons.
const DIAGNOSE_AREA_LABELS_EN: Record<DiagnoseArea, string> = {
  blaetter: "Leaves",
  wachstum: "Growth & Roots",
  klima: "Climate & Environment",
  schaedlinge: "Pests",
};

/** Localise a symptom-area label, falling back to the given German label. */
export function localizeDiagnoseAreaLabel(
  area: DiagnoseArea,
  deLabel: string,
  locale: string,
): string {
  return isEn(locale) ? (DIAGNOSE_AREA_LABELS_EN[area] ?? deLabel) : deLabel;
}
