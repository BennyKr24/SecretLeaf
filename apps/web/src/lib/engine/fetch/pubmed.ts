// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – PubMed / NCBI E-utilities Adapter
// ──────────────────────────────────────────────────────────────────────────────
//
// Fetches peer-reviewed studies from PubMed via the NCBI Entrez E-utilities:
//   1. esearch  – retrieves a list of PMIDs matching the query + date filter
//   2. efetch   – retrieves full MEDLINE text records for those PMIDs
//
// MEDLINE text is parsed with simple field-tag detection (no XML library needed).
//
// Rate limits: NCBI allows 3 req/s unauthenticated, 10 req/s with an API key.
// The adapter respects this by serialising requests and using a 400 ms pause
// between esearch and efetch calls when no API key is configured.
// ──────────────────────────────────────────────────────────────────────────────

import type { RawStudy } from "../types";
import { withRetry } from "../retry";
import { getCircuitBreaker, CircuitOpenError } from "../circuitBreaker";
import type { PipelineLogger } from "../logger";

// ── Constants ────────────────────────────────────────────────────────────────

const ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const EFETCH_URL  = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";
const TOOL        = "SecretLeafStudyEngine";
const EMAIL       = process.env.NCBI_CONTACT_EMAIL ?? "research@secretleaf.de";
/** Max PMIDs to fetch abstracts for in one efetch request. */
const EFETCH_BATCH = 40;

// ── Types ────────────────────────────────────────────────────────────────────

type ESearchResponse = {
  esearchresult?: {
    idlist?: string[];
    count?: string;
    ERROR?: string;
  };
};

export type PubMedFetchOptions = {
  query: string;
  fromDate: string;   // ISO date string, e.g. "2024-01-15T00:00:00.000Z"
  rows: number;
  maxRetries: number;
  logger: PipelineLogger;
};

// ── MEDLINE text parser ──────────────────────────────────────────────────────

/**
 * Parse MEDLINE-format plain text into RawStudy objects.
 *
 * The MEDLINE format uses two-letter (plus padding) tags followed by a dash
 * and a value. Continuation lines are indented (start with spaces). Records
 * are separated by blank lines followed by a new PMID tag.
 *
 * Tags used:
 *   PMID  – PubMed ID
 *   TI    – Title
 *   AB    – Abstract
 *   AU    – Author (repeating)
 *   AD    – Affiliation (repeating)
 *   DP    – Date of Publication
 *   JT    – Journal Title (full)
 *   AID   – Article Identifier (DOI entry looks like "10.xxx/yyy [doi]")
 */
function parseMedline(text: string): RawStudy[] {
  const results: RawStudy[] = [];

  // Split records on blank line followed by PMID
  const records = text.split(/\n{2,}(?=PMID)/);

  for (const record of records) {
    if (!record.trim()) continue;

    const fields: Record<string, string[]> = {};
    let currentTag = "";

    for (const line of record.split("\n")) {
      if (!line.trim()) continue;

      // Continuation line: starts with spaces
      if (/^ {6}/.test(line) && currentTag) {
        const last = fields[currentTag];
        if (last && last.length > 0) {
          last[last.length - 1] += " " + line.trim();
        }
        continue;
      }

      // Tag line: "TAG - value"
      const match = /^([A-Z]{2,4})\s*-\s+(.*)$/.exec(line);
      if (match) {
        currentTag = match[1]!;
        if (!fields[currentTag]) fields[currentTag] = [];
        fields[currentTag]!.push(match[2]!.trim());
      }
    }

    // Extract fields
    const pmid     = fields["PMID"]?.[0]?.trim() ?? null;
    const title    = fields["TI"]?.[0]?.replace(/\s+/g, " ").trim() ?? null;
    const abstract = fields["AB"]?.join(" ").replace(/\s+/g, " ").trim() ?? null;
    const authors  = (fields["AU"] ?? []).map((a) => a.trim());
    const journal  = fields["JT"]?.[0]?.trim() ?? fields["TA"]?.[0]?.trim() ?? null;
    const dateRaw  = fields["DP"]?.[0]?.trim() ?? null;
    const aidsRaw  = fields["AID"] ?? [];
    const affiliations = (fields["AD"] ?? []).map((a) => a.trim()).filter(Boolean);

    if (!title || title.length < 5) continue;

    // Derive year from DP field (e.g. "2024 Jan", "2024", "2024/01/15")
    const yearMatch = /\b(19|20)\d{2}\b/.exec(dateRaw ?? "");
    const year = yearMatch ? yearMatch[0] : String(new Date().getFullYear());

    // Extract DOI from AID entries like "10.xxxx/xxxx [doi]"
    let doi: string | null = null;
    for (const aid of aidsRaw) {
      const doiMatch = /^(10\.\S+)\s+\[doi\]/i.exec(aid.trim());
      if (doiMatch) {
        doi = doiMatch[1]!.toLowerCase();
        break;
      }
    }

    const url = doi
      ? `https://doi.org/${doi}`
      : pmid
        ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        : null;

    const firstAuthor = authors[0] ?? null;

    results.push({
      title,
      doi,
      url,
      publisher: journal,
      year,
      abstract: abstract && abstract.length > 0 ? abstract : null,
      firstAuthor,
      affiliations: [...new Set(affiliations)].slice(0, 4),
      meta: { pmid, source: "pubmed" },
    });
  }

  return results;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Build base URLSearchParams shared by all E-utilities requests. */
function baseParams(): URLSearchParams {
  const p = new URLSearchParams();
  p.set("tool", TOOL);
  p.set("email", EMAIL);
  const apiKey = process.env.NCBI_API_KEY;
  if (apiKey) p.set("api_key", apiKey);
  return p;
}

/** Convert an ISO date string to the NCBI E-utilities YYYY/MM/DD format. */
function toNCBIDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, "/");
}

// ── Main fetch function ──────────────────────────────────────────────────────

/**
 * Fetch studies from PubMed for a single query string.
 *
 * @param options.query    - PubMed search term
 * @param options.fromDate - ISO date string; studies published on/after this date
 * @param options.rows     - Maximum number of results to return
 */
export async function fetchFromPubMed(
  options: PubMedFetchOptions,
): Promise<{ items: RawStudy[]; totalAvailable: number }> {
  const { query, fromDate, rows, maxRetries, logger } = options;

  const breaker = getCircuitBreaker({
    name: "pubmed",
    failureThreshold: 5,
    resetTimeoutMs: 120_000,
  });

  if (!breaker.isAvailable()) {
    logger.warn(`Circuit breaker "pubmed" is open — skipping PubMed query "${query}"`);
    return { items: [], totalAvailable: 0 };
  }

  // Format date as YYYY/MM/DD for NCBI mindate parameter
  const mindate = toNCBIDate(fromDate);

  try {
    // ── Step 1: esearch ───────────────────────────────────────────────────────
    const searchParams = baseParams();
    // Sanitize square brackets in the query to avoid malformed NCBI search syntax.
    const sanitizedQuery = query.replace(/[\[\]]/g, "");
    searchParams.set("db", "pubmed");
    searchParams.set("term", `${sanitizedQuery}[Title/Abstract]`);
    searchParams.set("mindate", mindate);
    searchParams.set("datetype", "edat");
    searchParams.set("retmax", String(Math.min(rows, 200)));
    searchParams.set("retmode", "json");
    searchParams.set("sort", "pub_date");

    const searchUrl = `${ESEARCH_URL}?${searchParams.toString()}`;
    logger.debug(`PubMed esearch: "${sanitizedQuery}" from ${mindate}`, { rows });

    const { result: searchResult, attempts: searchAttempts } = await breaker.execute(() =>
      withRetry(
        async () => {
          const res = await fetch(searchUrl, {
            headers: { Accept: "application/json" },
            cache: "no-store",
          });
          if (!res.ok) throw new Error(`PubMed esearch HTTP ${res.status}`);
          return (await res.json()) as ESearchResponse;
        },
        {
          maxAttempts: maxRetries,
          label: `pubmed-esearch:${query}`,
          onRetry: (attempt, error, delay) => {
            logger.warn(
              `PubMed esearch retry ${attempt} for "${query}": ${error instanceof Error ? error.message : String(error)}`,
              { delay },
            );
          },
        },
      ),
    );

    if (searchResult.esearchresult?.ERROR) {
      throw new Error(`PubMed esearch error: ${searchResult.esearchresult.ERROR}`);
    }

    const pmids = searchResult.esearchresult?.idlist ?? [];
    const totalAvailable = Number(searchResult.esearchresult?.count ?? pmids.length);

    logger.info(
      `PubMed esearch "${query}": ${pmids.length} IDs found (total: ${totalAvailable}, attempts: ${searchAttempts})`,
    );

    if (pmids.length === 0) {
      return { items: [], totalAvailable: 0 };
    }

    // ── Step 2: efetch in batches ────────────────────────────────────────────
    const allItems: RawStudy[] = [];

    for (let i = 0; i < pmids.length; i += EFETCH_BATCH) {
      const batch = pmids.slice(i, i + EFETCH_BATCH);

      // Respect NCBI rate limit: pause between requests
      if (i > 0) await sleep(400);

      const fetchParams = baseParams();
      fetchParams.set("db", "pubmed");
      fetchParams.set("id", batch.join(","));
      fetchParams.set("rettype", "medline");
      fetchParams.set("retmode", "text");

      const fetchUrl = `${EFETCH_URL}?${fetchParams.toString()}`;

      const { result: medlineText } = await breaker.execute(() =>
        withRetry(
          async () => {
            const res = await fetch(fetchUrl, {
              headers: { Accept: "text/plain" },
              cache: "no-store",
            });
            if (!res.ok) throw new Error(`PubMed efetch HTTP ${res.status}`);
            return await res.text();
          },
          {
            maxAttempts: maxRetries,
            label: `pubmed-efetch:batch-${i}`,
            onRetry: (attempt, error, delay) => {
              logger.warn(
                `PubMed efetch retry ${attempt} for batch ${i}: ${error instanceof Error ? error.message : String(error)}`,
                { delay },
              );
            },
          },
        ),
      );

      const parsed = parseMedline(medlineText);
      for (const item of parsed) {
        (item.meta as Record<string, unknown>).source = "pubmed";
      }
      allItems.push(...parsed);

      logger.debug(`PubMed efetch batch ${i / EFETCH_BATCH + 1}: ${parsed.length} parsed`);
    }

    logger.info(`PubMed "${query}": ${allItems.length} studies parsed`);
    return { items: allItems, totalAvailable };
  } catch (error) {
    if (error instanceof CircuitOpenError) {
      logger.warn(`Circuit open for PubMed query "${query}": ${error.message}`);
      return { items: [], totalAvailable: 0 };
    }
    throw error;
  }
}
