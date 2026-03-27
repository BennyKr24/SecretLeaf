#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'apps', 'web', 'src', 'data', 'terpira', 'autoSources.json');

const DAYS_BACK = Number(process.env.STUDY_LOOKBACK_DAYS ?? 45);
const LIMIT = Number(process.env.STUDY_LIMIT ?? 120);

const TOPIC_CLUSTERS = [
  {
    key: 'medizin-evidenz',
    queries: ['medical cannabis', 'cannabinoid pain', 'cbd anxiety', 'cannabis sleep'],
    include: [/pain/i, /anxiety/i, /sleep/i, /clinical/i, /patient/i, /therapy/i, /efficacy/i, /medical cannabis/i, /cannabinoid/i],
  },
  {
    key: 'pharmakologie',
    queries: ['cannabis pharmacokinetics', 'cannabinoid pharmacology', 'thc cbd interactions'],
    include: [/pharmacokinetic/i, /pharmacology/i, /bioavailability/i, /drug interaction/i, /metabolism/i, /dose/i, /oral mucosal/i],
  },
  {
    key: 'qualitaet-labor',
    queries: ['cannabis laboratory', 'cannabis contaminants', 'cannabis heavy metals', 'cannabis pesticides'],
    include: [/laboratory/i, /analytical/i, /chromatography/i, /contaminant/i, /microbiology/i, /heavy metal/i, /pesticide/i, /toxicol/i],
  },
  {
    key: 'anbau-postharvest',
    queries: ['cannabis cultivation', 'cannabis curing', 'cannabis postharvest', 'cannabis terpene profile'],
    include: [/cultivation/i, /postharvest/i, /curing/i, /flower yield/i, /terpene/i, /cannabinoid composition/i, /breeding/i],
  },
  {
    key: 'markt-regulierung',
    queries: ['cannabis regulation', 'cannabis market', 'medical cannabis policy'],
    include: [/regulation/i, /policy/i, /market/i, /dispensar/i, /legalization/i, /public health/i, /retail/i],
  },
];

const HIGH_QUALITY_PUBLISHER_HINTS = [
  'nature',
  'lancet',
  'jama',
  'nejm',
  'cochrane',
  'addiction',
  'journal of analytical toxicology',
  'clinical pharmacology',
  'pain',
  'british journal of pharmacology',
  'journal of psychopharmacology',
  'regulatory toxicology and pharmacology',
  'drug and alcohol dependence',
  'medical cannabis and cannabinoids',
  'cannabis and cannabinoid research',
  'frontiers',
];

const MID_QUALITY_PUBLISHER_HINTS = [
  'journal',
  'pharmscitech',
  'toxicology',
  'pharmacology',
  'research',
  'review',
  'international journal',
];

const HARD_EXCLUSIONS = [
  { pattern: /corrigendum|erratum/i, reason: 'erratum-corrigendum' },
  { pattern: /canine|dog\b|dogs\b|feline|cat\b|cats\b/i, reason: 'non-human-veterinary' },
  { pattern: /laying hens|broiler|poultry|hens\b|hen\b/i, reason: 'poultry-feed' },
  { pattern: /marine organism|marine pollution|aquatic|fish\b|shrimp\b/i, reason: 'marine-topic' },
  { pattern: /hempseed meal|egg quality|dairy cow|ruminant/i, reason: 'agriculture-feed' },
  { pattern: /industrial hemp breeding lines/i, reason: 'industrial-hemp-low-fit' },
  { pattern: /nigella sativa/i, reason: 'non-cannabis-sativa' },
];

const SOFT_SIGNALS = [
  { pattern: /systematic review|meta-analysis/i, score: 26, flag: 'high-evidence' },
  { pattern: /randomized|double-blind|placebo/i, score: 20, flag: 'controlled-study' },
  { pattern: /clinical trial/i, score: 8, flag: 'trial' },
  { pattern: /case report/i, score: -20, flag: 'case-report' },
  { pattern: /pilot trial|pilot study/i, score: -8, flag: 'pilot' },
  { pattern: /protocol\b/i, score: -18, flag: 'protocol' },
  { pattern: /commentary|letter to the editor|editorial/i, score: -22, flag: 'low-evidence-format' },
  { pattern: /survey|cross-sectional/i, score: -6, flag: 'observational' },
];

const CANNABIS_ANCHOR = /medical cannabis|cannabis|cannabinoid|endocannabinoid|\bthc\b|\bcbd\b|\bcbn\b|\bcbg\b|terpene|marijuana|hashish/i;

function countAnchorMatches(text) {
  const matches = text.match(new RegExp(CANNABIS_ANCHOR.source, 'gi'));
  return matches?.length ?? 0;
}

function slugify(input) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 70);
}

function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function normalizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function detectHardExclusion(text) {
  for (const rule of HARD_EXCLUSIONS) {
    if (rule.pattern.test(text)) return rule.reason;
  }
  return null;
}

function collectSoftSignals(text) {
  const flags = [];
  let scoreDelta = 0;

  for (const signal of SOFT_SIGNALS) {
    if (signal.pattern.test(text)) {
      scoreDelta += signal.score;
      flags.push(signal.flag);
    }
  }

  return { flags, scoreDelta };
}

function classifyStudyType(text) {
  if (/meta-analysis/i.test(text)) return 'meta-analysis';
  if (/systematic review/i.test(text)) return 'systematic-review';
  if (/randomized|double-blind|placebo/i.test(text)) return 'controlled-study';
  if (/clinical trial/i.test(text)) return 'clinical-trial';
  if (/protocol\b/i.test(text)) return 'protocol';
  if (/case report/i.test(text)) return 'case-report';
  if (/analytical|chromatography|laboratory|contaminant|microbiology/i.test(text)) return 'laboratory-study';
  if (/cohort|cross-sectional|survey|observational/i.test(text)) return 'observational-study';
  return 'general-study';
}

function scoreEvidenceLevel(studyType) {
  switch (studyType) {
    case 'meta-analysis':
      return 100;
    case 'systematic-review':
      return 94;
    case 'controlled-study':
      return 88;
    case 'clinical-trial':
      return 82;
    case 'laboratory-study':
      return 78;
    case 'observational-study':
      return 62;
    case 'protocol':
      return 36;
    case 'case-report':
      return 28;
    default:
      return 56;
  }
}

function scorePublisherQuality(publisher) {
  const normalized = String(publisher || '').toLowerCase();

  if (HIGH_QUALITY_PUBLISHER_HINTS.some((hint) => normalized.includes(hint))) {
    return 90;
  }
  if (MID_QUALITY_PUBLISHER_HINTS.some((hint) => normalized.includes(hint))) {
    return 68;
  }
  return 54;
}

function scoreFreshness(year) {
  const currentYear = new Date().getFullYear();
  const numericYear = Number(year);

  if (!Number.isFinite(numericYear)) return 42;
  const age = currentYear - numericYear;
  if (age <= 0) return 100;
  if (age === 1) return 88;
  if (age === 2) return 76;
  if (age <= 4) return 64;
  return 48;
}

function matchTopics(text) {
  const matchedTopics = [];
  let topicFit = 0;

  for (const cluster of TOPIC_CLUSTERS) {
    const hits = cluster.include.filter((pattern) => pattern.test(text)).length;
    if (hits > 0) {
      matchedTopics.push(cluster.key);
      topicFit += 18 + hits * 8;
    }
  }

  if (/cannabis|cannabinoid|thc|cbd/i.test(text)) {
    topicFit += 14;
  }
  if (/quality|labor|contaminant|microbiology|pharmacokinetic|clinical|cultivation|regulation/i.test(text)) {
    topicFit += 10;
  }

  return {
    matchedTopics,
    topicFit: clamp(topicFit, 0, 100),
  };
}

function scoreEditorialUtility(text, matchedTopics) {
  let score = 30;

  if (matchedTopics.length >= 2) score += 20;
  if (/patient|clinical|laboratory|quality|safety|contaminant|cultivation/i.test(text)) score += 18;
  if (/public health|market|policy/i.test(text)) score += 8;
  if (/animal feed|poultry|marine/i.test(text)) score -= 35;

  return clamp(score, 0, 100);
}

function deriveEditorialPriority(finalScore, studyType) {
  if (finalScore >= 82 && !['protocol', 'case-report'].includes(studyType)) return 'high';
  if (finalScore >= 62) return 'medium';
  return 'low';
}

function scoreStudy({ title, publisher, year, abstract }) {
  const text = `${title} ${publisher} ${abstract ?? ''}`.toLowerCase();
  const titleText = `${title}`.toLowerCase();
  const exclusionReason = detectHardExclusion(text);

  if (exclusionReason) {
    return { keep: false, exclusionReason };
  }

  if (!CANNABIS_ANCHOR.test(text)) {
    return { keep: false, exclusionReason: 'no-cannabis-anchor' };
  }

  const titleHasAnchor = CANNABIS_ANCHOR.test(titleText);
  const anchorCount = countAnchorMatches(text);

  if (!titleHasAnchor && anchorCount < 2) {
    return { keep: false, exclusionReason: 'weak-cannabis-anchor' };
  }

  const studyType = classifyStudyType(text);

  if (!titleHasAnchor && studyType === 'general-study') {
    return { keep: false, exclusionReason: 'generic-title-without-cannabis' };
  }

  const evidenceLevel = scoreEvidenceLevel(studyType);
  const publisherQuality = scorePublisherQuality(publisher);
  const freshness = scoreFreshness(year);
  const { matchedTopics, topicFit } = matchTopics(text);
  const editorialUtility = scoreEditorialUtility(text, matchedTopics);
  const { flags, scoreDelta } = collectSoftSignals(text);

  let finalScore =
    topicFit * 0.38 +
    evidenceLevel * 0.24 +
    publisherQuality * 0.18 +
    freshness * 0.08 +
    editorialUtility * 0.12 +
    scoreDelta;

  if (matchedTopics.length === 0) {
    finalScore -= 20;
    flags.push('no-topic-match');
  }

  if (/hemp\b/i.test(text) && !/cannabis|cannabinoid|thc|cbd/i.test(text)) {
    finalScore -= 18;
    flags.push('hemp-low-fit');
  }

  finalScore = clamp(Math.round(finalScore), 0, 100);
  const editorialPriority = deriveEditorialPriority(finalScore, studyType);
  const keep = finalScore >= 34 && matchedTopics.length > 0 && !flags.includes('low-evidence-format');

  return {
    keep,
    relevanceScore: finalScore,
    evidenceLevel,
    publisherQuality,
    topicFit,
    freshness,
    studyType,
    matchedTopics,
    editorialPriority,
    flags: Array.from(new Set(flags)).sort(),
    exclusionReason: keep ? null : 'score-below-threshold',
  };
}

async function fetchCrossref(query, fromDateIso, rows = 100) {
  const endpoint = new URL('https://api.crossref.org/works');
  endpoint.searchParams.set('query', query);
  endpoint.searchParams.set('rows', String(rows));
  endpoint.searchParams.set('sort', 'published');
  endpoint.searchParams.set('order', 'desc');
  endpoint.searchParams.set('filter', `from-pub-date:${fromDateIso.slice(0, 10)},type:journal-article`);

  const res = await fetch(endpoint, {
    headers: {
      'User-Agent': 'SecretLeaf/1.0 (study-sync; mailto:research@secretleaf.local)'
    }
  });

  if (!res.ok) {
    throw new Error(`Crossref request failed for query "${query}": ${res.status}`);
  }

  const data = await res.json();
  return data?.message?.items ?? [];
}

function extractYear(item) {
  const dateParts = item?.issued?.['date-parts']?.[0];
  return dateParts?.[0] ? String(dateParts[0]) : String(new Date().getFullYear());
}

function mapCrossrefItem(item) {
  const title = item?.title?.[0] ?? 'Untitled study';
  const publisher = item?.['container-title']?.[0] ?? item?.publisher ?? 'Unknown publisher';
  const year = extractYear(item);
  const doi = item?.DOI ?? null;
  const url = item?.URL ?? (doi ? `https://doi.org/${doi}` : null);
  const abstract = item?.abstract ? String(item.abstract).replace(/<[^>]+>/g, ' ') : null;

  return {
    title,
    publisher,
    year,
    doi,
    url,
    abstract
  };
}

async function main() {
  const fromDate = daysAgoIso(DAYS_BACK);
  const raw = [];
  const queryStats = [];

  for (const cluster of TOPIC_CLUSTERS) {
    for (const query of cluster.queries) {
      try {
        const items = await fetchCrossref(query, fromDate, 60);
        queryStats.push({ cluster: cluster.key, query, fetched: items.length });
        raw.push(...items.map(mapCrossrefItem));
      } catch (error) {
        queryStats.push({
          cluster: cluster.key,
          query,
          fetched: 0,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  const dedupeBy = new Map();
  for (const item of raw) {
    const key = item.doi ? `doi:${String(item.doi).toLowerCase()}` : `title:${normalizeTitle(item.title)}`;
    if (!dedupeBy.has(key)) dedupeBy.set(key, item);
  }

  const deduped = Array.from(dedupeBy.values());
  const excluded = [];

  const scored = deduped
    .filter((study) => study.url && study.title)
    .map((study) => {
      const scoring = scoreStudy(study);
      if (!scoring.keep) {
        excluded.push({ title: study.title, reason: scoring.exclusionReason ?? 'excluded' });
      }
      return {
        ...study,
        ...scoring,
      };
    })
    .filter((study) => study.keep)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, LIMIT);

  const generatedAt = new Date().toISOString();

  const sources = scored.map((study) => {
    const idBase = study.doi ? study.doi.replace(/\//g, '-') : slugify(`${study.publisher}-${study.title}-${study.year}`);
    return {
      id: `auto-${slugify(idBase)}`,
      title: study.title,
      publisher: study.publisher,
      year: study.year,
      url: study.url,
      doi: study.doi ?? undefined,
      relevanceScore: study.relevanceScore,
      evidenceLevel: study.evidenceLevel,
      publisherQuality: study.publisherQuality,
      topicFit: study.topicFit,
      studyType: study.studyType,
      editorialPriority: study.editorialPriority,
      matchedTopics: study.matchedTopics,
      flags: study.flags,
      fetchedAt: generatedAt,
      tags: ['auto', 'study-sync', 'crossref', ...study.matchedTopics]
    };
  });

  const payload = {
    generatedAt,
    stats: {
      fetched: raw.length,
      kept: sources.length,
      deduped: deduped.length,
      excluded: excluded.length,
      lookbackDays: DAYS_BACK,
      queries: queryStats
    },
    exclusionsPreview: excluded.slice(0, 25),
    sources
  };

  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`study sync complete: ${sources.length} studies -> ${OUT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
