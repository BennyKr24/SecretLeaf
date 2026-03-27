import { sourceRegister, wikiArticles } from "@/data/terpira/wiki";
import type { TerpiraSource } from "@/lib/terpira/types";
import { normalize, tokenize } from "@/lib/search/engine";

export type StudyRankingMode = "smart" | "fresh" | "quality";

export type StudySearchItem = {
  id: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
  doi?: string;
  sourceType?: "manual" | "auto";
  tags: string[];
  linkedArticles: string[];
  score: number;
  scoreBreakdown: {
    queryMatch: number;
    quality: number;
    freshness: number;
    priorRelevance: number;
  };
};

export type StudySearchResponse = {
  query: string;
  mode: StudyRankingMode;
  total: number;
  durationMs: number;
  items: StudySearchItem[];
  generatedAt: string;
};

type ScoredStudy = StudySearchItem & { _rawScore: number };

const HIGH_QUALITY_PUBLISHERS = [
  /nature/i,
  /lancet/i,
  /jama/i,
  /cochrane/i,
  /nejm/i,
  /oxford/i,
  /wiley/i,
  /springer/i,
  /elsevier/i,
  /clinical/i,
  /pharmacology/i,
  /world health organization/i,
  /who/i,
  /euda|emcdda/i,
  /unodc/i,
  /ema|bfarm|swissmedic|ages/i,
];

const MID_QUALITY_PUBLISHERS = [
  /journal/i,
  /review/i,
  /research/i,
  /sciences?/i,
  /mdpi/i,
];

function parseYear(value: string | undefined): number {
  if (!value) return 0;
  const year = Number.parseInt(value, 10);
  return Number.isFinite(year) ? year : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function qualityScore(source: TerpiraSource): number {
  const publisher = source.publisher ?? "";

  if (HIGH_QUALITY_PUBLISHERS.some((rx) => rx.test(publisher))) {
    return 95;
  }
  if (MID_QUALITY_PUBLISHERS.some((rx) => rx.test(publisher))) {
    return 72;
  }
  return source.sourceType === "manual" ? 70 : 55;
}

function freshnessScore(source: TerpiraSource): number {
  const currentYear = new Date().getFullYear();
  const year = parseYear(source.year);

  if (!year) return 40;

  const age = currentYear - year;
  if (age <= 0) return 100;
  if (age === 1) return 88;
  if (age === 2) return 76;
  if (age <= 4) return 64;
  if (age <= 6) return 52;
  return 40;
}

function priorRelevanceScore(source: TerpiraSource): number {
  if (typeof source.relevanceScore === "number") {
    return clamp(source.relevanceScore, 0, 100);
  }
  return source.sourceType === "manual" ? 78 : 58;
}

function queryMatchScore(source: TerpiraSource, queryTokens: string[], linkedArticles: string[]): number {
  if (queryTokens.length === 0) return 55;

  const corpus = [
    source.title,
    source.publisher,
    source.tags?.join(" ") ?? "",
    linkedArticles.join(" "),
    source.doi ?? "",
  ].join(" ");

  const docTokens = tokenize(corpus);
  if (docTokens.length === 0) return 0;

  let hitScore = 0;

  for (const qToken of queryTokens) {
    let best = 0;
    for (const dToken of docTokens) {
      if (dToken === qToken) {
        best = 100;
        break;
      }
      if (dToken.startsWith(qToken)) {
        best = Math.max(best, 78);
      } else if (dToken.includes(qToken)) {
        best = Math.max(best, 52);
      }
    }
    hitScore += best;
  }

  return clamp(hitScore / queryTokens.length, 0, 100);
}

function collectLinkedArticles(sourceId: string): string[] {
  const linked = wikiArticles
    .filter((article) => (article.sourceIds ?? []).includes(sourceId))
    .map((article) => article.slug);

  return linked;
}

export function searchStudies(
  query: string,
  opts?: {
    limit?: number;
    mode?: StudyRankingMode;
    includeAuto?: boolean;
    includeManual?: boolean;
  }
): StudySearchResponse {
  const started = Date.now();

  const mode = opts?.mode ?? "smart";
  const limit = clamp(opts?.limit ?? 20, 1, 100);
  const includeAuto = opts?.includeAuto ?? true;
  const includeManual = opts?.includeManual ?? true;

  const normalizedQuery = normalize(query);
  const queryTokens = tokenize(normalizedQuery);

  const pool = sourceRegister.filter((source) => {
    if (!includeAuto && source.sourceType === "auto") return false;
    if (!includeManual && source.sourceType === "manual") return false;
    return true;
  });

  const scored: ScoredStudy[] = [];

  for (const source of pool) {
    const linkedArticles = collectLinkedArticles(source.id);
    const queryMatch = queryMatchScore(source, queryTokens, linkedArticles);
    const quality = qualityScore(source);
    const freshness = freshnessScore(source);
    const priorRelevance = priorRelevanceScore(source);

    let raw =
      queryMatch * 0.4 +
      quality * 0.25 +
      freshness * 0.2 +
      priorRelevance * 0.15;

    // Mode-specific boosts
    if (mode === "fresh") raw += freshness * 0.2;
    if (mode === "quality") raw += quality * 0.2;

    // Additional bonus for sources already wired into wiki articles.
    if (linkedArticles.length > 0) {
      raw += Math.min(10, linkedArticles.length * 2);
    }

    // If query exists, keep only relevant-ish candidates.
    if (queryTokens.length > 0 && queryMatch < 20) continue;

    scored.push({
      id: source.id,
      title: source.title,
      publisher: source.publisher,
      year: source.year,
      url: source.url,
      ...(source.doi ? { doi: source.doi } : {}),
      ...(source.sourceType ? { sourceType: source.sourceType } : {}),
      tags: source.tags ?? [],
      linkedArticles,
      score: clamp(Math.round(raw), 0, 100),
      scoreBreakdown: {
        queryMatch: Math.round(queryMatch),
        quality: Math.round(quality),
        freshness: Math.round(freshness),
        priorRelevance: Math.round(priorRelevance),
      },
      _rawScore: raw,
    });
  }

  scored.sort((a, b) => b._rawScore - a._rawScore);

  return {
    query,
    mode,
    total: scored.length,
    durationMs: Date.now() - started,
    items: scored.slice(0, limit).map(({ _rawScore, ...rest }) => rest),
    generatedAt: new Date().toISOString(),
  };
}
