// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Dynamic Configuration Loader
// ──────────────────────────────────────────────────────────────────────────────
//
// Loads algorithm configuration overrides from the `engine_config` table.
// Falls back to hardcoded defaults if the table doesn't exist or is empty.
//
// Config keys:
//   required_keywords   — Terms a study MUST contain
//   preferred_sources   — Publishers with quality boost
//   blocked_sources     — Publishers/patterns to reject
//   custom_exclusions   — Additional hard exclusion rules
//   topic_clusters      — Additional custom clusters
//   scoring_params      — Min accept score, weights, thresholds
//   cannabis_anchor     — Anchor terms for cannabis validation
// ──────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClassifyOverrides } from "./classify";
import type { ScoreOverrides } from "./score";

// ── Types ───────────────────────────────────────────────────────────────────

export type RequiredKeyword = {
  term: string;
  enabled: boolean;
};

export type PreferredSource = {
  name: string;
  quality: "high" | "mid";
  enabled: boolean;
};

export type BlockedSource = {
  name: string;
  pattern: string;
  reason: string;
};

export type CustomExclusion = {
  pattern: string;
  reason: string;
  enabled: boolean;
};

export type CustomCluster = {
  key: string;
  label: string;
  queries: string[];
  includePatterns: string[];
  enabled: boolean;
};

export type CannabisAnchorTerm = {
  term: string;
  enabled: boolean;
  wordBoundary?: boolean;
};

export type ScoringParams = {
  minAcceptScore: number;
  crossrefRowsPerQuery: number;
  fuzzyThreshold: number;
  weights: {
    topicFit: number;
    evidenceLevel: number;
    publisherQuality: number;
    freshness: number;
    editorialUtility: number;
  };
};

export type EngineConfigData = {
  required_keywords: { keywords: RequiredKeyword[] };
  preferred_sources: { sources: PreferredSource[] };
  blocked_sources: { sources: BlockedSource[] };
  custom_exclusions: { rules: CustomExclusion[] };
  topic_clusters: {
    customClusters: CustomCluster[];
  };
  scoring_params: ScoringParams;
  cannabis_anchor: { terms: CannabisAnchorTerm[] };
};

export type EngineConfigSection = keyof EngineConfigData;

// ── Table name ──────────────────────────────────────────────────────────────

const ENGINE_CONFIG_TABLE = "engine_config";

// ── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: EngineConfigData = {
  required_keywords: {
    keywords: [
      { term: "cannabis", enabled: true },
      { term: "cannabinoid", enabled: true },
      { term: "thc", enabled: true },
      { term: "cbd", enabled: true },
      { term: "terpene", enabled: true },
      { term: "endocannabinoid", enabled: true },
      { term: "marijuana", enabled: true },
    ],
  },
  preferred_sources: {
    sources: [
      { name: "Nature", quality: "high", enabled: true },
      { name: "Lancet", quality: "high", enabled: true },
      { name: "JAMA", quality: "high", enabled: true },
      { name: "NEJM", quality: "high", enabled: true },
      { name: "Cochrane", quality: "high", enabled: true },
      { name: "Frontiers", quality: "high", enabled: true },
      { name: "Springer", quality: "high", enabled: true },
      { name: "Elsevier", quality: "high", enabled: true },
      { name: "Wiley", quality: "high", enabled: true },
      { name: "Oxford", quality: "high", enabled: true },
      { name: "MDPI", quality: "mid", enabled: true },
    ],
  },
  blocked_sources: { sources: [] },
  custom_exclusions: { rules: [] },
  topic_clusters: { customClusters: [] },
  scoring_params: {
    minAcceptScore: 34,
    crossrefRowsPerQuery: 60,
    fuzzyThreshold: 0.85,
    weights: {
      topicFit: 0.38,
      evidenceLevel: 0.24,
      publisherQuality: 0.18,
      freshness: 0.08,
      editorialUtility: 0.12,
    },
  },
  cannabis_anchor: {
    terms: [
      { term: "medical cannabis", enabled: true },
      { term: "cannabis", enabled: true },
      { term: "cannabinoid", enabled: true },
      { term: "endocannabinoid", enabled: true },
      { term: "thc", enabled: true, wordBoundary: true },
      { term: "thca", enabled: true, wordBoundary: true },
      { term: "cbd", enabled: true, wordBoundary: true },
      { term: "cbda", enabled: true, wordBoundary: true },
      { term: "cbn", enabled: true, wordBoundary: true },
      { term: "cbg", enabled: true, wordBoundary: true },
      { term: "terpene", enabled: true },
      { term: "terpenoid", enabled: true },
      { term: "marijuana", enabled: true },
      { term: "hashish", enabled: true },
    ],
  },
};

// ── Loader ──────────────────────────────────────────────────────────────────

/** Whether the engine_config table exists. Cached after first check. */
let tableExistsCache: boolean | null = null;

/**
 * Check if the engine_config table is available.
 */
export async function isEngineConfigTableAvailable(
  supabase: SupabaseClient,
): Promise<boolean> {
  if (tableExistsCache !== null) return tableExistsCache;

  const { error } = await supabase
    .from(ENGINE_CONFIG_TABLE)
    .select("config_key")
    .limit(1);

  tableExistsCache = !error;
  return tableExistsCache;
}

/**
 * Reset the table-exists cache (e.g. after bootstrap).
 */
export function resetConfigCache(): void {
  tableExistsCache = null;
}

/**
 * Load a single config section from the database.
 * Returns the default if the table doesn't exist or the key is missing.
 */
export async function loadConfigSection<K extends EngineConfigSection>(
  supabase: SupabaseClient,
  key: K,
): Promise<EngineConfigData[K]> {
  const available = await isEngineConfigTableAvailable(supabase);
  if (!available) return DEFAULT_CONFIG[key];

  const { data, error } = await supabase
    .from(ENGINE_CONFIG_TABLE)
    .select("config_value")
    .eq("config_key", key)
    .maybeSingle();

  if (error || !data) return DEFAULT_CONFIG[key];
  return (data.config_value ?? DEFAULT_CONFIG[key]) as EngineConfigData[K];
}

/**
 * Load the complete engine configuration.
 * Merges DB values with defaults for any missing sections.
 */
export async function loadFullConfig(
  supabase: SupabaseClient,
): Promise<{ config: EngineConfigData; fromDatabase: boolean }> {
  const available = await isEngineConfigTableAvailable(supabase);
  if (!available) return { config: DEFAULT_CONFIG, fromDatabase: false };

  const { data, error } = await supabase
    .from(ENGINE_CONFIG_TABLE)
    .select("config_key, config_value");

  if (error || !data || data.length === 0) {
    return { config: DEFAULT_CONFIG, fromDatabase: false };
  }

  const dbConfig: Partial<EngineConfigData> = {};
  for (const row of data) {
    const key = row.config_key as EngineConfigSection;
    dbConfig[key] = row.config_value as never;
  }

  const merged: EngineConfigData = {
    required_keywords: dbConfig.required_keywords ?? DEFAULT_CONFIG.required_keywords,
    preferred_sources: dbConfig.preferred_sources ?? DEFAULT_CONFIG.preferred_sources,
    blocked_sources: dbConfig.blocked_sources ?? DEFAULT_CONFIG.blocked_sources,
    custom_exclusions: dbConfig.custom_exclusions ?? DEFAULT_CONFIG.custom_exclusions,
    topic_clusters: dbConfig.topic_clusters ?? DEFAULT_CONFIG.topic_clusters,
    scoring_params: dbConfig.scoring_params ?? DEFAULT_CONFIG.scoring_params,
    cannabis_anchor: dbConfig.cannabis_anchor ?? DEFAULT_CONFIG.cannabis_anchor,
  };

  return { config: merged, fromDatabase: true };
}

/**
 * Save a single config section to the database.
 */
export async function saveConfigSection<K extends EngineConfigSection>(
  supabase: SupabaseClient,
  key: K,
  value: EngineConfigData[K],
  userId?: string,
): Promise<{ success: boolean; error?: string }> {
  const available = await isEngineConfigTableAvailable(supabase);
  if (!available) {
    return {
      success: false,
      error: "engine_config Tabelle existiert nicht. Bitte Migration ausführen.",
    };
  }

  const { error } = await supabase
    .from(ENGINE_CONFIG_TABLE)
    .upsert(
      {
        config_key: key,
        config_value: value,
        updated_at: new Date().toISOString(),
        updated_by: userId ?? null,
      },
      { onConflict: "config_key" },
    );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Get the default config (for reset operations).
 */
export function getDefaultConfig(): EngineConfigData {
  return structuredClone(DEFAULT_CONFIG);
}

/**
 * Build a RegExp from the dynamic cannabis anchor terms.
 */
export function buildCannabisAnchorRegex(
  terms: CannabisAnchorTerm[],
): RegExp {
  const enabledTerms = terms.filter((t) => t.enabled);
  if (enabledTerms.length === 0) {
    // Fallback to hardcoded if all disabled
    return /medical cannabis|cannabis|cannabinoid|endocannabinoid|\bthc\b|\bthca\b|\bcbd\b|\bcbda\b|\bcbn\b|\bcbg\b|terpene|terpenoid|marijuana|hashish/i;
  }

  const parts = enabledTerms.map((t) => {
    const escaped = t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return t.wordBoundary ? `\\b${escaped}\\b` : escaped;
  });

  return new RegExp(parts.join("|"), "i");
}

/**
 * Build exclusion rules from custom exclusions config.
 */
export function buildCustomExclusionRules(
  rules: CustomExclusion[],
): Array<{ pattern: RegExp; reason: string }> {
  return rules
    .filter((r) => r.enabled && r.pattern.trim().length > 0)
    .map((r) => ({
      pattern: new RegExp(r.pattern, "i"),
      reason: r.reason || "custom-exclusion",
    }));
}

/**
 * Build a required-keywords test function.
 * Returns true if the text contains at least one required keyword.
 */
export function buildRequiredKeywordsTest(
  keywords: RequiredKeyword[],
): (text: string) => boolean {
  const enabled = keywords.filter((k) => k.enabled);
  if (enabled.length === 0) return () => true; // no filter if none enabled

  const patterns = enabled.map((k) => {
    const escaped = k.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escaped, "i");
  });

  return (text: string) => patterns.some((p) => p.test(text));
}

// ── Dynamic Overrides ───────────────────────────────────────────────────────

/** Cap on Crossref search queries a single custom cluster can contribute —
 * mirrors the hardcoded TOPIC_CLUSTERS' own 3-4-query shape, so a custom
 * cluster stays a narrow, well-targeted addition rather than a mass fetch. */
const MAX_CUSTOM_CLUSTER_QUERIES = 4;

export type DynamicOverrides = {
  classifyOverrides: ClassifyOverrides;
  scoreOverrides: ScoreOverrides;
  extraClusterQueries: Array<{ key: string; queries: string[] }>;
  scoringParamOverrides: {
    minAcceptScore?: number;
    crossrefRowsPerQuery?: number;
    fuzzyThreshold?: number;
  };
};

/**
 * Turn a loaded EngineConfigData into the override objects consumed by
 * classifyStudy()/scoreStudy()/fetchAllSources(). Pure, no I/O — shared by
 * pipeline.ts (fresh ingestion) and reprocess.ts (reprocessing loop) so
 * admin config applies identically to both paths instead of only to fresh
 * ingestion.
 */
export function buildDynamicOverrides(dynConfig: EngineConfigData): DynamicOverrides {
  const scoringParamOverrides: DynamicOverrides["scoringParamOverrides"] = {};
  const sp = dynConfig.scoring_params;
  if (sp) {
    if (sp.minAcceptScore != null) scoringParamOverrides.minAcceptScore = sp.minAcceptScore;
    if (sp.crossrefRowsPerQuery != null) scoringParamOverrides.crossrefRowsPerQuery = sp.crossrefRowsPerQuery;
    if (sp.fuzzyThreshold != null) scoringParamOverrides.fuzzyThreshold = sp.fuzzyThreshold;
  }

  const classifyOverrides: ClassifyOverrides = {};

  const keywords = dynConfig.required_keywords?.keywords;
  if (keywords && keywords.length > 0) {
    classifyOverrides.requiredKeywordsTest = buildRequiredKeywordsTest(keywords);
  }

  const exclusions = dynConfig.custom_exclusions?.rules;
  if (exclusions && exclusions.length > 0) {
    classifyOverrides.extraExclusions = buildCustomExclusionRules(exclusions);
  }

  // Blocked sources — reuse the exclusion mechanism (a blocked publisher
  // rejects the study outright, not just a lower score).
  const blockedSources = dynConfig.blocked_sources?.sources;
  if (blockedSources && blockedSources.length > 0) {
    const blockRules = blockedSources.map((b) => ({
      pattern: new RegExp(
        b.pattern || b.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      ),
      reason: b.reason || `blocked-source:${b.name}`,
    }));
    classifyOverrides.extraExclusions = [
      ...(classifyOverrides.extraExclusions ?? []),
      ...blockRules,
    ];
  }

  const scoreOverrides: ScoreOverrides = {};
  const preferredSources = dynConfig.preferred_sources?.sources;
  if (preferredSources && preferredSources.length > 0) {
    scoreOverrides.preferredSources = preferredSources;
  }
  if (sp?.weights) {
    scoreOverrides.weights = sp.weights;
  }

  const anchorTerms = dynConfig.cannabis_anchor?.terms;
  if (anchorTerms && anchorTerms.length > 0) {
    classifyOverrides.cannabisAnchorOverride = buildCannabisAnchorRegex(anchorTerms);
  }

  const enabledClusters = (dynConfig.topic_clusters?.customClusters ?? []).filter(
    (c) => c.enabled,
  );

  if (enabledClusters.length > 0) {
    classifyOverrides.extraClusters = enabledClusters.map((c) => ({
      key: c.key,
      include: c.includePatterns.map((p) => new RegExp(p, "i")),
    }));
  }

  const extraClusterQueries = enabledClusters
    .filter((c) => c.queries.length > 0)
    .map((c) => ({
      key: c.key,
      queries: c.queries.slice(0, MAX_CUSTOM_CLUSTER_QUERIES),
    }));

  return { classifyOverrides, scoreOverrides, extraClusterQueries, scoringParamOverrides };
}
