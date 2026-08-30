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
import type { TerpiraCategory } from "@/lib/terpira/types";

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
