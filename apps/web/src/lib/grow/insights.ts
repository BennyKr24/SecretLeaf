// ────────────────────────────────────────────────────────────────────────────
// Grow Insights Engine
//
// Connects live grow context (phase, medium, environment, pending tasks)
// with the curated knowledge base to surface actionable insights.
// Each insight has a priority, an action type, and optional task linkage.
// ────────────────────────────────────────────────────────────────────────────

import { wikiArticles } from "@/data/terpira/wiki";
import type { TerpiraArticle } from "@/lib/terpira/types";
import type { Grow, GrowPhaseId, GrowMedium, GrowTask, LogEntryType } from "@/lib/grow/types";
import { getGrowRecommendationKnowledge, getToolHrefForStudy, type KnowledgeEvidenceLevel } from "@/lib/knowledge/graph";

// ── Public: Insight priority ──────────────────────────────────────────────────

/** high = critical grow issue · medium = optimization · low = educational */
export type InsightPriority = "high" | "medium" | "low";

/** What the "Apply now" button links to. */
export type InsightAction =
  | { type: "log"; logType: LogEntryType }
  | { type: "link"; href: string };

/** A fully resolved insight ready for rendering. */
export type GrowInsight = {
  article: TerpiraArticle;
  priority: InsightPriority;
  action: InsightAction;
  reason: string;
  evidenceLevel: KnowledgeEvidenceLevel;
  confidenceScore: number;
  expectedBenefit?: string | undefined;
  /** If set, completing the action fulfils this task. */
  relatedTask?: GrowTask | undefined;
};

// ── Phase → relevant slugs (pinned recommendations) ──────────────────────────

const PHASE_SLUG_BOOSTS: Partial<Record<GrowPhaseId, string[]>> = {
  keimung: [
    "bewaesserung-ohne-uebergiessen",
    "cannabis-substrat-und-wurzelzone",
    "how-to-grow-cannabis-anfaenger-tutorial",
  ],
  saemling: [
    "vpd-einfach-erklaert",
    "bewaesserung-ohne-uebergiessen",
    "sensor-kalibrierung-und-messfehler",
  ],
  veg: [
    "vpd-einfach-erklaert",
    "lichtstress-und-canopy-management",
    "naehrstoffblockaden-und-antagonismen",
    "stressmarker-frueh-erkennen",
  ],
  bluete: [
    "vpd-und-ec-kombi-rechner-guide",
    "naehrstoffbedarf-cannabis-lebenszyklus",
    "integrierte-schaedlingspraevention-grow",
    "schimmel-und-mykotoxine-bei-cannabis",
  ],
  spaetbluete: [
    "wasseraktivitaet-und-curing",
    "schimmel-und-mykotoxine-bei-cannabis",
    "terpene-und-wirkprofil",
  ],
  ernte: [
    "wasseraktivitaet-und-curing",
    "lagerung-verpackung-und-lichtschutz",
    "thc-zu-cbn-abbau-und-oxidation",
  ],
};

// ── Medium → slug boosts ──────────────────────────────────────────────────────

const MEDIUM_SLUG_BOOSTS: Record<GrowMedium, string[]> = {
  coco:  ["substrat-vergleich-coco-erde-hydro", "vpd-und-ec-kombi-rechner-guide"],
  erde:  ["cannabis-substrat-und-wurzelzone", "bewaesserung-ohne-uebergiessen"],
  hydro: ["substrat-vergleich-coco-erde-hydro", "sensor-kalibrierung-und-messfehler"],
};

// ── Slug → priority (critical issues are high, optimizations medium) ──────────

const SLUG_PRIORITY: Partial<Record<string, InsightPriority>> = {
  // high — skipping these costs yield
  "schimmel-und-mykotoxine-bei-cannabis": "high",
  "bewaesserung-ohne-uebergiessen":       "high",
  "naehrstoffblockaden-und-antagonismen": "high",
  "stressmarker-frueh-erkennen":          "high",
  "wasseraktivitaet-und-curing":          "high",
  // medium — optimizations with clear upside
  "vpd-einfach-erklaert":                 "medium",
  "vpd-und-ec-kombi-rechner-guide":       "medium",
  "lichtstress-und-canopy-management":    "medium",
  "naehrstoffbedarf-cannabis-lebenszyklus": "medium",
  "sensor-kalibrierung-und-messfehler":   "medium",
  "cannabis-substrat-und-wurzelzone":     "medium",
  "integrierte-schaedlingspraevention-grow": "medium",
  "lagerung-verpackung-und-lichtschutz": "medium",
  "thc-zu-cbn-abbau-und-oxidation":       "medium",
  "mutterpflanzen-und-clone-hygiene":     "medium",
};

// ── Slug → action mapping ─────────────────────────────────────────────────────
// Maps each insight slug to the action a user should take immediately.

const SLUG_ACTION: Partial<Record<string, InsightAction>> = {
  "bewaesserung-ohne-uebergiessen":       { type: "log", logType: "wasser" },
  "cannabis-substrat-und-wurzelzone":     { type: "log", logType: "wasser" },
  "naehrstoffblockaden-und-antagonismen": { type: "log", logType: "duenger" },
  "naehrstoffbedarf-cannabis-lebenszyklus": { type: "log", logType: "duenger" },
  "stressmarker-frueh-erkennen":          { type: "log", logType: "notiz" },
  "integrierte-schaedlingspraevention-grow": { type: "log", logType: "notiz" },
  "mutterpflanzen-und-clone-hygiene":     { type: "log", logType: "notiz" },
  "lichtstress-und-canopy-management":    { type: "link", href: "/tools" },
  "vpd-einfach-erklaert":                 { type: "link", href: "/tools" },
  "vpd-und-ec-kombi-rechner-guide":       { type: "link", href: "/tools" },
  "sensor-kalibrierung-und-messfehler":   { type: "link", href: "/tools" },
  "wasseraktivitaet-und-curing":          { type: "log", logType: "notiz" },
  "schimmel-und-mykotoxine-bei-cannabis": { type: "log", logType: "notiz" },
};

// ── Task category → slug match (for task-insight linkage) ─────────────────────

const TASK_CATEGORY_SLUG_MATCH: Partial<Record<string, string[]>> = {
  bewaesserung: ["bewaesserung-ohne-uebergiessen", "cannabis-substrat-und-wurzelzone"],
  duengung:     ["naehrstoffblockaden-und-antagonismen", "naehrstoffbedarf-cannabis-lebenszyklus"],
  training:     ["stressmarker-frueh-erkennen", "lichtstress-und-canopy-management"],
  kontrolle:    ["integrierte-schaedlingspraevention-grow", "sensor-kalibrierung-und-messfehler"],
};

// ── Log type → slug boosts (for log-triggered recommendations) ───────────────

const LOG_TYPE_SLUG_BOOSTS: Partial<Record<LogEntryType, string[]>> = {
  wasser:   ["bewaesserung-ohne-uebergiessen", "cannabis-substrat-und-wurzelzone"],
  duenger:  ["naehrstoffblockaden-und-antagonismen", "naehrstoffbedarf-cannabis-lebenszyklus"],
  training: ["stressmarker-frueh-erkennen", "integrierte-schaedlingspraevention-grow", "mutterpflanzen-und-clone-hygiene"],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveAction(slug: string): InsightAction {
  const toolHref = getToolHrefForStudy(slug);
  if (toolHref) {
    return { type: "link", href: toolHref };
  }

  const mapped = SLUG_ACTION[slug];
  if (!mapped) return { type: "link", href: `/studies/${slug}` };
  if (mapped.type === "log") {
    return { type: "log", logType: mapped.logType };
  }
  return mapped;
}

function resolvePriority(slug: string): InsightPriority {
  return SLUG_PRIORITY[slug] ?? "low";
}

/**
 * Finds the first pending (non-completed) task whose category matches the
 * given insight slug, used to surface task linkage in the UI.
 */
function findRelatedTask(slug: string, tasks: GrowTask[]): GrowTask | undefined {
  for (const [category, slugs] of Object.entries(TASK_CATEGORY_SLUG_MATCH)) {
    if (slugs?.includes(slug)) {
      return tasks.find((t) => !t.completed && t.category === category);
    }
  }
  return undefined;
}

// ── Core recommendation engine ────────────────────────────────────────────────

/**
 * Returns 3–5 resolved grow insights for the current grow session.
 *
 * Scoring:
 * - Base: qualityScore (1–5)
 * - +10 if slug is pinned for the current phase
 * - +5  if slug is boosted by the current growing medium
 * - High-priority insights float to the top via a +8 boost
 *
 * Each insight includes: article, priority, action, optional relatedTask.
 */
export function getRecommendationsForGrow(grow: Grow, limit = 5): GrowInsight[] {
  const allTasks = grow.plan.phases.flatMap((p) => p.tasks);
  const pendingTasks = allTasks.filter((task) => !task.completed);
  const recentLogType = pendingTasks[0]?.category === "bewaesserung"
    ? "wasser"
    : pendingTasks[0]?.category === "duengung"
    ? "duenger"
    : pendingTasks[0]?.category === "training"
    ? "training"
    : undefined;

  const matches = getGrowRecommendationKnowledge({
    phaseId: grow.currentPhaseId,
    medium: grow.medium,
    pendingTasks,
    recentLogType,
    limit,
  });

  if (matches.length > 0) {
    return matches.map((match) => ({
      article: match.article,
      priority: match.priority,
      action: resolveAction(match.article.slug),
      reason: match.reason,
      evidenceLevel: match.evidenceLevel,
      confidenceScore: match.confidenceScore,
      expectedBenefit: match.expectedBenefit,
      relatedTask: findRelatedTask(match.article.slug, allTasks),
    }));
  }

  const phaseBoosts = new Set(PHASE_SLUG_BOOSTS[grow.currentPhaseId] ?? []);
  const mediumBoosts = new Set(MEDIUM_SLUG_BOOSTS[grow.medium] ?? []);

  const scored = wikiArticles
    .filter((a) => Boolean(a.growValue))
    .map((a) => {
      const priority = resolvePriority(a.slug);
      let score = a.qualityScore ?? 0;
      if (phaseBoosts.has(a.slug)) score += 10;
      if (mediumBoosts.has(a.slug)) score += 5;
      if (priority === "high") score += 8;
      if (priority === "medium") score += 3;
      return { article: a, score, priority };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ article, priority }) => ({
    article,
    priority,
    action: resolveAction(article.slug),
    reason: article.growValue ?? article.summary,
    evidenceLevel: (article.qualityScore ?? 0) >= 5 ? "high" : (article.qualityScore ?? 0) >= 4 ? "medium" : "low",
    confidenceScore: Math.max((article.qualityScore ?? 3) * 18, 54),
    expectedBenefit: article.growValue,
    relatedTask: findRelatedTask(article.slug, allTasks),
  }));
}

/**
 * Returns 1–2 resolved insights relevant to a just-saved log entry type.
 * Used for log-triggered inline cards (Part 5).
 */
export function getInsightsForLogType(type: LogEntryType, limit = 2): GrowInsight[] {
  const relationBacked = getGrowRecommendationKnowledge({
    phaseId: "veg",
    medium: "erde",
    pendingTasks: [],
    recentLogType: type,
    limit,
  });

  if (relationBacked.length > 0) {
    return relationBacked.map((match) => ({
      article: match.article,
      priority: match.priority,
      action: resolveAction(match.article.slug),
      reason: match.reason,
      evidenceLevel: match.evidenceLevel,
      confidenceScore: match.confidenceScore,
      expectedBenefit: match.expectedBenefit,
    }));
  }

  const boostedSlugs = LOG_TYPE_SLUG_BOOSTS[type];
  if (!boostedSlugs || boostedSlugs.length === 0) return [];

  const results: GrowInsight[] = [];
  for (const slug of boostedSlugs) {
    const article = wikiArticles.find((a) => a.slug === slug);
    if (article) {
      results.push({
        article,
        priority: resolvePriority(slug),
        action: resolveAction(slug),
        reason: article.growValue ?? article.summary,
        evidenceLevel: (article.qualityScore ?? 0) >= 5 ? "high" : (article.qualityScore ?? 0) >= 4 ? "medium" : "low",
        confidenceScore: Math.max((article.qualityScore ?? 3) * 18, 54),
        expectedBenefit: article.growValue,
      });
    }
    if (results.length >= limit) break;
  }
  return results;
}
