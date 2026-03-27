#!/usr/bin/env node
/**
 * studies_fetch.mjs
 *
 * Automated scientific study ingestion pipeline for SecretLeaf.
 * Fetches cannabis-related studies from PubMed, Semantic Scholar, and CrossRef,
 * applies filtering and scoring, generates AI-style summaries, and writes outputs
 * to data/autoStudies.json and data/study-sync-report.md.
 *
 * Usage:
 *   node scripts/studies_fetch.mjs
 *
 * Environment variables (all optional):
 *   STUDY_LOOKBACK_HOURS   Hours to look back for new studies (default: 48)
 *   STUDY_MAX_RESULTS      Max results per keyword per source (default: 50)
 *   PUBMED_API_KEY         NCBI API key (increases rate limit from 3 to 10 req/s)
 *   SEMANTIC_SCHOLAR_KEY   Semantic Scholar API key (increases rate limit)
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const AUTO_STUDIES_PATH = path.join(DATA_DIR, 'autoStudies.json');
const REPORT_PATH = path.join(DATA_DIR, 'study-sync-report.md');

// ── Configuration ──────────────────────────────────────────────────────────────

const LOOKBACK_HOURS = Number(process.env.STUDY_LOOKBACK_HOURS ?? 48);
const MAX_RESULTS = Number(process.env.STUDY_MAX_RESULTS ?? 50);
const PUBMED_API_KEY = process.env.PUBMED_API_KEY ?? '';
const SEMANTIC_API_KEY = process.env.SEMANTIC_SCHOLAR_KEY ?? '';

const KEYWORDS = ['cannabis', 'THC', 'CBD', 'terpenes', 'endocannabinoid'];

const QUALITY_JOURNALS = new Set([
  'nature', 'lancet', 'jama', 'nejm', 'bmj', 'science',
  'frontiers', 'clinical', 'pharmacology', 'neuroscience',
  'addiction', 'toxicology', 'journal of cannabis', 'cannabis and cannabinoid',
  'british journal', 'european journal', 'american journal',
]);

const CATEGORY_RULES = [
  { category: 'medical', patterns: ['clinical', 'therapeutic', 'treatment', 'patient', 'disease', 'pain', 'anxiety', 'depression', 'epilepsy', 'nausea', 'pharmacokinetics', 'pharmacology', 'analgesic', 'anti-inflammatory', 'antipsychotic'] },
  { category: 'chemistry', patterns: ['terpene', 'cannabinoid', 'thc', 'cbd', 'cbg', 'cbn', 'chemical', 'extraction', 'synthesis', 'chromatography', 'spectrometry', 'metabolite', 'contaminant', 'pesticide'] },
  { category: 'regulation', patterns: ['regulation', 'policy', 'law', 'legal', 'legislation', 'decriminalisation', 'decriminalization', 'schedule', 'drug policy', 'public health', 'epidemiology'] },
  { category: 'cultivation', patterns: ['cultivation', 'grow', 'harvest', 'yield', 'strain', 'genetics', 'breeding', 'soil', 'greenhouse', 'outdoor', 'indoor', 'light', 'fertilizer', 'agronomic'] },
];

// ── Utilities ──────────────────────────────────────────────────────────────────

function log(message) {
  console.log(`[studies-fetch] ${message}`);
}

function warn(message) {
  console.warn(`[studies-fetch:warn] ${message}`);
}

function daysAgoDate(hours) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
}

function normalizeText(text) {
  return String(text ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function stripHtml(text) {
  return String(text ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Retry a fetch with exponential backoff. */
async function fetchWithRetry(url, options = {}, retries = 3, baseDelayMs = 1000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(20_000) });
      if (res.status === 429) {
        const waitMs = baseDelayMs * Math.pow(2, attempt);
        warn(`Rate-limited (429) – waiting ${waitMs}ms before retry ${attempt + 1}/${retries}`);
        await sleep(waitMs);
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      const waitMs = baseDelayMs * Math.pow(2, attempt);
      warn(`Request failed (attempt ${attempt + 1}/${retries}): ${err.message}. Retrying in ${waitMs}ms…`);
      await sleep(waitMs);
    }
  }
  throw new Error(`All ${retries + 1} attempts failed for ${url}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Scoring ────────────────────────────────────────────────────────────────────

/**
 * Compute a relevance score (0–100) based on keyword density in the combined
 * title + abstract text.
 */
function computeRelevanceScore(title, abstract) {
  const text = normalizeText(`${title} ${abstract}`);
  let score = 0;

  for (const kw of KEYWORDS) {
    const kwLower = kw.toLowerCase();
    const regex = new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const matches = (text.match(regex) ?? []).length;
    score += matches * 8;
  }

  // Bonus for high-value study designs
  if (/systematic review|meta-analysis/.test(text)) score += 20;
  if (/randomized|randomised|double.blind|placebo.controlled/.test(text)) score += 12;
  if (/clinical trial/.test(text)) score += 8;

  return Math.min(score, 100);
}

/**
 * Compute a quality score (0–10) based on journal reputation, citation count,
 * and study type.
 */
function computeQualityScore(journal, citationCount, studyType) {
  let score = 0;

  // Journal reputation (up to 4 points)
  const journalLower = normalizeText(journal);
  let journalScore = 1; // baseline
  for (const hint of QUALITY_JOURNALS) {
    if (journalLower.includes(hint)) {
      journalScore = 3;
      break;
    }
  }
  if (/nature|lancet|nejm|jama|bmj/.test(journalLower)) journalScore = 4;
  score += journalScore;

  // Citation count (up to 3 points)
  const citations = Number(citationCount ?? 0);
  if (citations >= 100) score += 3;
  else if (citations >= 20) score += 2;
  else if (citations >= 5) score += 1;

  // Study type (up to 3 points)
  const typeLower = normalizeText(studyType);
  if (/meta.analysis/.test(typeLower)) score += 3;
  else if (/systematic review|review/.test(typeLower)) score += 2.5;
  else if (/randomized|randomised|double.blind/.test(typeLower)) score += 2;
  else if (/clinical trial|cohort/.test(typeLower)) score += 1.5;
  else score += 1;

  return Math.min(Math.round(score * 10) / 10, 10);
}

/**
 * Infer category from title + abstract text.
 */
function inferCategory(title, abstract) {
  const text = normalizeText(`${title} ${abstract}`);
  for (const rule of CATEGORY_RULES) {
    for (const pattern of rule.patterns) {
      if (text.includes(pattern)) return rule.category;
    }
  }
  return 'medical'; // safe default
}

/**
 * Generates a concise structured summary from abstract text.
 * Uses heuristic sentence extraction rather than an external AI service to
 * keep the pipeline self-contained and free of external API dependencies.
 */
function generateSummary(title, abstract, category) {
  const cleaned = stripHtml(abstract);
  if (!cleaned) {
    return `Study on ${category} aspects of cannabis. No abstract available for detailed summarization.`;
  }

  // Extract up to 2 most informative sentences (prefer those containing result keywords)
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) ?? [cleaned];
  const resultKeywords = /result|show|found|demonstrate|conclude|suggest|indicate|reveal|evidence|significant|efficacy|effect/i;
  const ranked = sentences
    .map((s) => ({ text: s.trim(), score: resultKeywords.test(s) ? 1 : 0 }))
    .sort((a, b) => b.score - a.score);

  const excerpt = ranked
    .slice(0, 2)
    .map((s) => s.text)
    .join(' ')
    .slice(0, 320);

  return `[${category.charAt(0).toUpperCase() + category.slice(1)}] ${excerpt}${excerpt.length >= 320 ? '…' : ''}`;
}

// ── Data normalisation ────────────────────────────────────────────────────────

/**
 * @typedef {Object} NormalisedStudy
 * @property {string} title
 * @property {string|null} doi
 * @property {string} abstract
 * @property {string[]} authors
 * @property {string} journal
 * @property {number} year
 * @property {string} source
 * @property {string} studyType
 * @property {number} citationCount
 */

// ── PubMed API ─────────────────────────────────────────────────────────────────

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * Search PubMed and return up to `maxResults` article IDs for `query`
 * published in the last `lookbackHours` hours.
 */
async function pubmedSearch(query, lookbackHours, maxResults) {
  const minDate = new Date();
  minDate.setHours(minDate.getHours() - lookbackHours);
  const minDateStr = minDate.toISOString().slice(0, 10).replace(/-/g, '/');

  const params = new URLSearchParams({
    db: 'pubmed',
    term: `"${query}"[tiab] AND "${minDateStr}"[PDAT] : "${new Date().getFullYear() + 1}"[PDAT]`,
    retmax: String(maxResults),
    retmode: 'json',
    sort: 'pub+date',
  });
  if (PUBMED_API_KEY) params.set('api_key', PUBMED_API_KEY);

  const res = await fetchWithRetry(`${PUBMED_BASE}/esearch.fcgi?${params}`);
  if (!res.ok) throw new Error(`PubMed search failed: ${res.status}`);
  const data = await res.json();
  return data?.esearchresult?.idlist ?? [];
}

/**
 * Fetch article details for a list of PubMed IDs.
 * Returns normalised study objects.
 */
async function pubmedFetch(ids) {
  if (ids.length === 0) return [];

  const params = new URLSearchParams({
    db: 'pubmed',
    id: ids.join(','),
    retmode: 'json',
    rettype: 'abstract',
  });
  if (PUBMED_API_KEY) params.set('api_key', PUBMED_API_KEY);

  const res = await fetchWithRetry(`${PUBMED_BASE}/efetch.fcgi?${params}`);
  if (!res.ok) throw new Error(`PubMed fetch failed: ${res.status}`);
  const data = await res.json();

  const articles = data?.PubmedArticleSet?.PubmedArticle ?? [];
  return articles.map((article) => {
    const medline = article?.MedlineCitation;
    const articleData = medline?.Article ?? {};
    const journal = articleData?.Journal?.Title ?? articleData?.Journal?.ISOAbbreviation ?? 'Unknown Journal';
    const titleRaw = articleData?.ArticleTitle;
    const title = typeof titleRaw === 'string' ? titleRaw : (titleRaw?.['#text'] ?? 'Untitled');

    // Abstract
    const abstractRaw = articleData?.Abstract?.AbstractText;
    let abstract = '';
    if (typeof abstractRaw === 'string') abstract = abstractRaw;
    else if (Array.isArray(abstractRaw)) abstract = abstractRaw.map((a) => (typeof a === 'string' ? a : (a?.['#text'] ?? ''))).join(' ');
    else if (abstractRaw?.['#text']) abstract = abstractRaw['#text'];

    // Authors
    const authorList = articleData?.AuthorList?.Author ?? [];
    const authors = (Array.isArray(authorList) ? authorList : [authorList])
      .map((a) => [a?.LastName, a?.ForeName].filter(Boolean).join(' '))
      .filter(Boolean);

    // Year
    const yearRaw = medline?.DateCompleted?.Year ?? articleData?.Journal?.JournalIssue?.PubDate?.Year ?? String(new Date().getFullYear());
    const year = Number(String(yearRaw).slice(0, 4)) || new Date().getFullYear();

    // DOI
    const idList = article?.PubmedData?.ArticleIdList?.ArticleId ?? [];
    const doiEntry = (Array.isArray(idList) ? idList : [idList]).find((i) => i?.['@IdType'] === 'doi');
    const doi = doiEntry?.['#text'] ?? null;

    // Publication type
    const pubTypes = articleData?.PublicationTypeList?.PublicationType ?? [];
    const studyType = (Array.isArray(pubTypes) ? pubTypes : [pubTypes])
      .map((p) => (typeof p === 'string' ? p : (p?.['#text'] ?? '')))
      .join(', ');

    return { title, doi, abstract: stripHtml(abstract), authors, journal, year, source: 'pubmed', studyType, citationCount: 0 };
  });
}

/**
 * Fetch cannabis-related studies published in the last `lookbackHours` hours
 * from PubMed for all keywords.
 */
async function fetchFromPubMed(lookbackHours, maxPerKeyword) {
  const results = [];
  for (const keyword of KEYWORDS) {
    try {
      log(`PubMed: searching for "${keyword}"…`);
      const ids = await pubmedSearch(keyword, lookbackHours, maxPerKeyword);
      log(`PubMed: found ${ids.length} IDs for "${keyword}"`);
      if (ids.length > 0) {
        await sleep(400); // respect rate limit (3 req/s without key)
        const articles = await pubmedFetch(ids);
        results.push(...articles);
      }
      await sleep(400);
    } catch (err) {
      warn(`PubMed failed for "${keyword}": ${err.message}`);
    }
  }
  return results;
}

// ── Semantic Scholar API ───────────────────────────────────────────────────────

const SEMANTIC_BASE = 'https://api.semanticscholar.org/graph/v1';

/**
 * Search Semantic Scholar for papers matching `query` published after `minDate`.
 */
async function fetchFromSemanticScholar(lookbackHours, maxPerKeyword) {
  const minDate = daysAgoDate(lookbackHours);
  const minYear = minDate.getFullYear();
  const results = [];
  const headers = { 'User-Agent': 'SecretLeaf/1.0 (mailto:research@secretleaf.local)' };
  if (SEMANTIC_API_KEY) headers['x-api-key'] = SEMANTIC_API_KEY;

  for (const keyword of KEYWORDS) {
    try {
      log(`Semantic Scholar: searching for "${keyword}"…`);
      const params = new URLSearchParams({
        query: keyword,
        fields: 'title,abstract,authors,year,externalIds,citationCount,publicationTypes,journal',
        limit: String(maxPerKeyword),
        publicationDateOrYear: `${minYear}-`,
      });
      const res = await fetchWithRetry(`${SEMANTIC_BASE}/paper/search?${params}`, { headers });
      if (!res.ok) {
        warn(`Semantic Scholar returned ${res.status} for "${keyword}"`);
        continue;
      }
      const data = await res.json();
      const papers = data?.data ?? [];
      log(`Semantic Scholar: found ${papers.length} papers for "${keyword}"`);

      for (const paper of papers) {
        const doi = paper?.externalIds?.DOI ?? null;
        const authors = (paper?.authors ?? []).map((a) => a.name).filter(Boolean);
        const pubTypes = paper?.publicationTypes ?? [];
        const journal = paper?.journal?.name ?? 'Unknown Journal';
        const studyType = pubTypes.join(', ');
        results.push({
          title: paper.title ?? 'Untitled',
          doi,
          abstract: stripHtml(paper.abstract ?? ''),
          authors,
          journal,
          year: Number(paper.year) || new Date().getFullYear(),
          source: 'semantic',
          studyType,
          citationCount: Number(paper.citationCount ?? 0),
        });
      }
      await sleep(1000); // Semantic Scholar: 1 req/s without key
    } catch (err) {
      warn(`Semantic Scholar failed for "${keyword}": ${err.message}`);
    }
  }
  return results;
}

// ── CrossRef API ───────────────────────────────────────────────────────────────

/**
 * Fetch recent journal articles from CrossRef matching `query`.
 */
async function fetchFromCrossRef(lookbackHours, maxPerKeyword) {
  const fromDate = daysAgoDate(lookbackHours).toISOString().slice(0, 10);
  const results = [];

  for (const keyword of KEYWORDS) {
    try {
      log(`CrossRef: searching for "${keyword}"…`);
      const params = new URLSearchParams({
        query: keyword,
        rows: String(maxPerKeyword),
        sort: 'published',
        order: 'desc',
        filter: `from-pub-date:${fromDate},type:journal-article`,
      });
      const res = await fetchWithRetry(`https://api.crossref.org/works?${params}`, {
        headers: { 'User-Agent': 'SecretLeaf/1.0 (study-sync; mailto:research@secretleaf.local)' },
      });
      if (!res.ok) {
        warn(`CrossRef returned ${res.status} for "${keyword}"`);
        continue;
      }
      const data = await res.json();
      const items = data?.message?.items ?? [];
      log(`CrossRef: found ${items.length} items for "${keyword}"`);

      for (const item of items) {
        const title = item?.title?.[0] ?? 'Untitled';
        const journal = item?.['container-title']?.[0] ?? item?.publisher ?? 'Unknown Journal';
        const doi = item?.DOI ?? null;
        const abstract = stripHtml(item?.abstract ?? '');
        const dateParts = item?.issued?.['date-parts']?.[0];
        const year = dateParts?.[0] ? Number(dateParts[0]) : new Date().getFullYear();
        const authorList = (item?.author ?? []).map((a) => [a.given, a.family].filter(Boolean).join(' ')).filter(Boolean);
        const pubTypes = item?.type ?? '';

        results.push({
          title,
          doi,
          abstract,
          authors: authorList,
          journal,
          year,
          source: 'crossref',
          studyType: pubTypes,
          citationCount: 0,
        });
      }
      await sleep(200); // CrossRef is generous, but let's be polite
    } catch (err) {
      warn(`CrossRef failed for "${keyword}": ${err.message}`);
    }
  }
  return results;
}

// ── Filtering ─────────────────────────────────────────────────────────────────

const RELEVANCE_THRESHOLD = 16;
const QUALITY_THRESHOLD = 3.0;

/**
 * Filter studies: must have DOI, non-empty abstract, and pass relevance/quality thresholds.
 */
function filterStudies(studies) {
  return studies.filter((s) => {
    if (!s.doi) return false;
    if (!s.abstract || s.abstract.trim().length < 50) return false;
    if (!s.title || s.title.trim().length < 5) return false;

    const relevance = computeRelevanceScore(s.title, s.abstract);
    const quality = computeQualityScore(s.journal, s.citationCount, s.studyType);

    return relevance >= RELEVANCE_THRESHOLD && quality >= QUALITY_THRESHOLD;
  });
}

// ── Deduplication ─────────────────────────────────────────────────────────────

/**
 * Deduplicate studies by DOI (case-insensitive). Prefer entries with more
 * complete data (higher citationCount or longer abstract).
 */
function deduplicateStudies(studies) {
  const byDoi = new Map();
  for (const study of studies) {
    const key = study.doi.toLowerCase();
    const existing = byDoi.get(key);
    if (!existing) {
      byDoi.set(key, study);
    } else {
      // Keep the entry with higher citation count or longer abstract
      if (
        study.citationCount > existing.citationCount ||
        (study.citationCount === existing.citationCount && study.abstract.length > existing.abstract.length)
      ) {
        byDoi.set(key, study);
      }
    }
  }
  return Array.from(byDoi.values());
}

// ── Output types ───────────────────────────────────────────────────────────────

/**
 * @typedef {Object} EnrichedStudy
 * @property {string} title
 * @property {string} doi
 * @property {string} summary
 * @property {string} category
 * @property {number} qualityScore
 * @property {number} relevanceScore
 * @property {string} journal
 * @property {number} year
 * @property {string} source
 * @property {string[]} authors
 * @property {number} citationCount
 * @property {boolean} flaggedForReview
 */

// ── Report generation ─────────────────────────────────────────────────────────

function buildReport(enriched, stats) {
  const top10 = [...enriched]
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 10);
  const flagged = enriched.filter((s) => s.flaggedForReview);
  const now = new Date().toISOString();

  const lines = [
    '# Study Sync Report',
    '',
    `Generated: ${now}`,
    '',
    '## Pipeline Summary',
    '',
    `| Metric | Value |`,
    `|---|---|`,
    `| Total fetched (raw) | ${stats.fetched} |`,
    `| After deduplication | ${stats.deduped} |`,
    `| After filtering | ${stats.filtered} |`,
    `| Saved to dataset | ${stats.kept} |`,
    `| Lookback window (hours) | ${LOOKBACK_HOURS} |`,
    `| Sources | PubMed, Semantic Scholar, CrossRef |`,
    '',
    '## Top 10 Studies by Quality Score',
    '',
    '| # | Score | Year | Journal | Title | DOI |',
    '|---|---:|---:|---|---|---|',
  ];

  for (let i = 0; i < top10.length; i++) {
    const s = top10[i];
    const doiLink = `https://doi.org/${s.doi}`;
    lines.push(`| ${i + 1} | ${s.qualityScore.toFixed(1)} | ${s.year} | ${s.journal.slice(0, 40)} | ${s.title.slice(0, 70)} | [link](${doiLink}) |`);
  }

  lines.push('', '## Studies Flagged for Manual Review', '');
  if (flagged.length === 0) {
    lines.push('_No studies flagged for manual review._');
  } else {
    lines.push('| Title | DOI | Flag reason |', '|---|---|---|');
    for (const s of flagged) {
      lines.push(`| ${s.title.slice(0, 70)} | ${s.doi} | Low quality score (< 5.0) |`);
    }
  }

  lines.push('', '## Review Checklist', '');
  lines.push(
    '- [ ] Verify at least 5 DOI links manually',
    '- [ ] Spot-check journal quality and relevance',
    '- [ ] Assign studies to wiki `sourceId` fields where appropriate',
    '- [ ] Merge only after editorial review',
  );

  return lines.join('\n') + '\n';
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  log(`Starting study fetch (lookback: ${LOOKBACK_HOURS}h, max per keyword: ${MAX_RESULTS})`);

  // Ensure output directory exists
  mkdirSync(DATA_DIR, { recursive: true });

  // Fetch from all three sources
  const [pubmedRaw, semanticRaw, crossrefRaw] = await Promise.all([
    fetchFromPubMed(LOOKBACK_HOURS, MAX_RESULTS).catch((err) => { warn(`PubMed source failed entirely: ${err.message}`); return []; }),
    fetchFromSemanticScholar(LOOKBACK_HOURS, MAX_RESULTS).catch((err) => { warn(`Semantic Scholar source failed entirely: ${err.message}`); return []; }),
    fetchFromCrossRef(LOOKBACK_HOURS, MAX_RESULTS).catch((err) => { warn(`CrossRef source failed entirely: ${err.message}`); return []; }),
  ]);

  const raw = [...pubmedRaw, ...semanticRaw, ...crossrefRaw];
  log(`Raw results: ${raw.length} (PubMed: ${pubmedRaw.length}, Semantic Scholar: ${semanticRaw.length}, CrossRef: ${crossrefRaw.length})`);

  // Filter before deduplicate to reject entries without DOI/abstract early
  const withDoi = raw.filter((s) => s.doi && s.abstract && s.title);
  const deduped = deduplicateStudies(withDoi);
  log(`After deduplication: ${deduped.length}`);

  // Apply filtering
  const filtered = filterStudies(deduped);
  log(`After filtering: ${filtered.length}`);

  // Enrich: compute scores, category, summary
  /** @type {EnrichedStudy[]} */
  const enriched = filtered.map((s) => {
    const qualityScore = computeQualityScore(s.journal, s.citationCount, s.studyType);
    const relevanceScore = computeRelevanceScore(s.title, s.abstract);
    const category = inferCategory(s.title, s.abstract);
    const summary = generateSummary(s.title, s.abstract, category);
    return {
      title: s.title,
      doi: s.doi,
      summary,
      category,
      qualityScore,
      relevanceScore,
      journal: s.journal,
      year: s.year,
      source: s.source,
      authors: s.authors,
      citationCount: s.citationCount,
      flaggedForReview: qualityScore < 5.0,
    };
  });

  // Sort by quality score descending
  enriched.sort((a, b) => b.qualityScore - a.qualityScore);

  const stats = {
    fetched: raw.length,
    deduped: deduped.length,
    filtered: filtered.length,
    kept: enriched.length,
    sources: {
      pubmed: pubmedRaw.length,
      semantic: semanticRaw.length,
      crossref: crossrefRaw.length,
    },
    generatedAt: new Date().toISOString(),
  };

  // Write autoStudies.json
  const autoStudiesPayload = {
    generatedAt: stats.generatedAt,
    stats,
    studies: enriched.map(({ title, doi, summary, category, qualityScore, relevanceScore, year, journal, source, authors, citationCount }) => ({
      title,
      doi,
      summary,
      category,
      qualityScore,
      relevanceScore,
      year,
      journal,
      source,
      authors,
      citationCount,
    })),
  };
  writeFileSync(AUTO_STUDIES_PATH, JSON.stringify(autoStudiesPayload, null, 2) + '\n', 'utf8');
  log(`Wrote ${enriched.length} studies → ${AUTO_STUDIES_PATH}`);

  // Write study-sync-report.md
  const report = buildReport(enriched, stats);
  writeFileSync(REPORT_PATH, report, 'utf8');
  log(`Wrote report → ${REPORT_PATH}`);

  // Summary
  log(`Done. ${enriched.length} studies saved (${enriched.filter((s) => s.flaggedForReview).length} flagged for review).`);
}

main().catch((err) => {
  console.error(`[studies-fetch:fatal] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
