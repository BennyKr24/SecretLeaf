// ─────────────────────────────────────────────────────────────────────────────
// Knowledge Coverage KPI (Phase 18 – North-Star-Metrik)
// ─────────────────────────────────────────────────────────────────────────────
// Misst den Wissensabdeckungsgrad pro Wissensdomäne statt reiner Artikelanzahl.
// Grundlage ist die Coverage Matrix (docs/KNOWLEDGE_COVERAGE_MATRIX.md):
//   Coverage% = (handbook-grade Artikel einer Domäne) / (Zieldatensatz der Domäne)
//
// "handbook-grade" = veröffentlicht (in wikiArticles, d. h. in der GROW_KNOWLEDGE-
// Allowlist) UND qualityScore >= 4.
//
// Der diagnostische Kern (Mängel + Krankheiten + Schädlinge) ist die wichtigste
// Teilmetrik, weil er den Wert der Diagnose-, Rechner- und AI-Infrastruktur
// freischaltet.
// ─────────────────────────────────────────────────────────────────────────────

import { wikiArticles } from "@/data/terpira/wiki";
import { TerpiraArticle } from "@/lib/terpira/types";

/** Schwelle, ab der ein veröffentlichter Artikel als "handbook-grade" zählt. */
export const HANDBOOK_GRADE_THRESHOLD = 4;

export type KnowledgeDomainId =
  | "nutrient-deficiencies"
  | "toxicities"
  | "diseases"
  | "pests"
  | "environmental-stress"
  | "cultivation-technique"
  | "harvest-postharvest"
  | "genetics-propagation"
  | "chemistry-analytics";

export type CoverageStatus = "kritisch" | "im-aufbau" | "solide" | "stark";

export type KnowledgeDomain = {
  id: KnowledgeDomainId;
  label: string;
  /** Zieldatensatz laut Coverage Matrix (Anzahl handbook-grade Artikel). */
  target: number;
  /** Kanonische Slugs, die dieser Domäne zugeordnet sind. */
  canonicalSlugs: string[];
  /** Teil des diagnostischen Kerns (Mängel + Krankheiten + Schädlinge)? */
  diagnosticCore: boolean;
};

// Domänenkatalog & Zielwerte aus docs/KNOWLEDGE_COVERAGE_MATRIX.md (§Targets).
// canonicalSlugs verankern bereits produzierte/erwartete Kernartikel je Domäne.
export const KNOWLEDGE_DOMAINS: KnowledgeDomain[] = [
  {
    id: "nutrient-deficiencies",
    label: "Nährstoffmängel",
    target: 12,
    canonicalSlugs: [
      "magnesiummangel",
      "stickstoffmangel",
      "calciummangel",
      "kaliummangel",
      "eisenmangel",
    ],
    diagnosticCore: true,
  },
  {
    id: "toxicities",
    label: "Toxizitäten / Überschüsse",
    target: 6,
    canonicalSlugs: [
      "stickstoffueberschuss",
      "kalium-ueberschuss",
      "calciumueberschuss",
      "salzanreicherung-hohe-ec",
      "naehrstoffverbrennung-tipburn",
    ],
    diagnosticCore: false,
  },
  {
    id: "diseases",
    label: "Krankheiten",
    target: 12,
    canonicalSlugs: [
      "bud-rot-botrytis",
      "echter-mehltau-powdery-mildew",
      "wurzelfaeule",
    ],
    diagnosticCore: true,
  },
  {
    id: "pests",
    label: "Schädlinge",
    target: 12,
    canonicalSlugs: ["spinnmilben", "thripse", "trauermuecken"],
    diagnosticCore: true,
  },
  {
    id: "environmental-stress",
    label: "Umwelt- & Klimastress",
    target: 12,
    canonicalSlugs: [
      "vpd-einfach-erklaert",
      "vpd-und-ec-kombi-rechner-guide",
      "lichtstress-und-canopy-management",
      "hitzestress",
      "kaeltestress",
      "windbrand",
      "luftfeuchte-management",
      "co2-management",
    ],
    diagnosticCore: false,
  },
  {
    id: "cultivation-technique",
    label: "Anbautechnik",
    target: 16,
    canonicalSlugs: ["cannabis-anbau-grundlagen", "bewaesserung-ohne-uebergiessen"],
    diagnosticCore: false,
  },
  {
    id: "harvest-postharvest",
    label: "Ernte & Nachernte",
    target: 8,
    canonicalSlugs: ["wasseraktivitaet-und-curing"],
    diagnosticCore: false,
  },
  {
    id: "genetics-propagation",
    label: "Genetik & Vermehrung",
    target: 8,
    canonicalSlugs: [],
    diagnosticCore: false,
  },
  {
    id: "chemistry-analytics",
    label: "Chemie & Analytik",
    target: 8,
    canonicalSlugs: [],
    diagnosticCore: false,
  },
];

export type DomainCoverage = {
  id: KnowledgeDomainId;
  label: string;
  target: number;
  diagnosticCore: boolean;
  /** Anzahl veröffentlichter kanonischer Slugs der Domäne. */
  published: number;
  /** Davon handbook-grade (qualityScore >= Schwelle). */
  handbookGrade: number;
  /** Abdeckung in Prozent (handbookGrade / target, gedeckelt bei 100). */
  coveragePct: number;
  status: CoverageStatus;
  /** Kanonische Slugs, die noch nicht handbook-grade veröffentlicht sind. */
  missingSlugs: string[];
};

export type KnowledgeCoverageReport = {
  domains: DomainCoverage[];
  /** Diagnostischer Kern (Mängel + Krankheiten + Schädlinge) als Aggregat. */
  diagnosticCore: {
    target: number;
    handbookGrade: number;
    coveragePct: number;
    status: CoverageStatus;
  };
  /** Gesamtabdeckung über alle Domänen (gewichtet nach Zielwerten). */
  overall: {
    target: number;
    handbookGrade: number;
    coveragePct: number;
  };
};

const toStatus = (pct: number): CoverageStatus => {
  if (pct < 25) return "kritisch";
  if (pct < 50) return "im-aufbau";
  if (pct < 80) return "solide";
  return "stark";
};

const isHandbookGrade = (article: TerpiraArticle): boolean =>
  (article.qualityScore ?? 0) >= HANDBOOK_GRADE_THRESHOLD;

/**
 * Berechnet den Knowledge-Coverage-Report aus den veröffentlichten Artikeln.
 * Optional kann eine alternative Artikelliste übergeben werden (z. B. für Tests
 * oder What-if-Szenarien); Standard ist der kuratierte wikiArticles-Export.
 */
export const computeKnowledgeCoverage = (
  articles: TerpiraArticle[] = wikiArticles
): KnowledgeCoverageReport => {
  const bySlug = new Map<string, TerpiraArticle>();
  for (const article of articles) {
    bySlug.set(article.slug, article);
  }

  const domains: DomainCoverage[] = KNOWLEDGE_DOMAINS.map((domain) => {
    let published = 0;
    let handbookGrade = 0;
    const missingSlugs: string[] = [];

    for (const slug of domain.canonicalSlugs) {
      const article = bySlug.get(slug);
      if (article) {
        published += 1;
        if (isHandbookGrade(article)) {
          handbookGrade += 1;
        } else {
          missingSlugs.push(slug);
        }
      } else {
        missingSlugs.push(slug);
      }
    }

    const coveragePct =
      domain.target > 0
        ? Math.min(100, Math.round((handbookGrade / domain.target) * 100))
        : 0;

    return {
      id: domain.id,
      label: domain.label,
      target: domain.target,
      diagnosticCore: domain.diagnosticCore,
      published,
      handbookGrade,
      coveragePct,
      status: toStatus(coveragePct),
      missingSlugs,
    };
  });

  const coreDomains = domains.filter((d) => d.diagnosticCore);
  const coreTarget = coreDomains.reduce((sum, d) => sum + d.target, 0);
  const coreHandbook = coreDomains.reduce((sum, d) => sum + d.handbookGrade, 0);
  const corePct =
    coreTarget > 0 ? Math.min(100, Math.round((coreHandbook / coreTarget) * 100)) : 0;

  const overallTarget = domains.reduce((sum, d) => sum + d.target, 0);
  const overallHandbook = domains.reduce((sum, d) => sum + d.handbookGrade, 0);
  const overallPct =
    overallTarget > 0
      ? Math.min(100, Math.round((overallHandbook / overallTarget) * 100))
      : 0;

  return {
    domains,
    diagnosticCore: {
      target: coreTarget,
      handbookGrade: coreHandbook,
      coveragePct: corePct,
      status: toStatus(corePct),
    },
    overall: {
      target: overallTarget,
      handbookGrade: overallHandbook,
      coveragePct: overallPct,
    },
  };
};

/** Bequemer Zugriff auf den aktuellen Coverage-Report. */
export const knowledgeCoverageReport = (): KnowledgeCoverageReport =>
  computeKnowledgeCoverage();
