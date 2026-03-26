#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'apps', 'web', 'src', 'data', 'terpira', 'autoSources.json');

const DAYS_BACK = Number(process.env.STUDY_LOOKBACK_DAYS ?? 120);
const LIMIT = Number(process.env.STUDY_LIMIT ?? 180);

const KEYWORDS = [
  'cannabis',
  'cannabinoid',
  'thc',
  'cbd',
  'terpene',
  'medical cannabis',
  'cannabis cultivation',
  'cannabis contaminants',
  'cannabis pharmacokinetics'
];

const JOURNAL_HINTS = [
  'nature',
  'lancet',
  'jama',
  'nejm',
  'frontiers',
  'clinical',
  'pharmacology',
  'addiction',
  'toxicology',
  'chromatography'
];

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

function scoreStudy({ title, publisher, year, abstract }) {
  const text = `${title} ${publisher} ${abstract ?? ''}`.toLowerCase();
  let score = 0;

  for (const kw of KEYWORDS) {
    if (text.includes(kw)) score += 8;
  }

  for (const jh of JOURNAL_HINTS) {
    if (String(publisher || '').toLowerCase().includes(jh)) score += 6;
  }

  const y = Number(year);
  if (!Number.isNaN(y)) {
    if (y >= new Date().getFullYear() - 1) score += 10;
    else if (y >= new Date().getFullYear() - 3) score += 5;
  }

  if (/systematic review|meta-analysis|randomized|double-blind/.test(text)) score += 14;

  return score;
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

  for (const query of KEYWORDS) {
    try {
      const items = await fetchCrossref(query, fromDate, 60);
      queryStats.push({ query, fetched: items.length });
      raw.push(...items.map(mapCrossrefItem));
    } catch (error) {
      queryStats.push({ query, fetched: 0, error: error instanceof Error ? error.message : String(error) });
    }
  }

  const dedupeBy = new Map();
  for (const item of raw) {
    const key = item.doi ? `doi:${String(item.doi).toLowerCase()}` : `title:${normalizeTitle(item.title)}`;
    if (!dedupeBy.has(key)) dedupeBy.set(key, item);
  }

  const deduped = Array.from(dedupeBy.values());

  const scored = deduped
    .filter((s) => s.url && s.title)
    .map((s) => ({
      ...s,
      relevanceScore: scoreStudy(s)
    }))
    .filter((s) => s.relevanceScore >= 18)
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
      fetchedAt: generatedAt,
      tags: ['auto', 'study-sync', 'crossref']
    };
  });

  const payload = {
    generatedAt,
    stats: {
      fetched: raw.length,
      kept: sources.length,
      deduped: deduped.length,
      lookbackDays: DAYS_BACK,
      queries: queryStats
    },
    sources
  };

  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`study sync complete: ${sources.length} studies -> ${OUT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
