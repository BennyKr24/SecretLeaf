// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Crossref API Adapter
// ──────────────────────────────────────────────────────────────────────────────

import type { RawStudy } from "../types";
import { CROSSREF_BASE_URL, CROSSREF_USER_AGENT } from "../config";
import { withRetry } from "../retry";
import { getCircuitBreaker, CircuitOpenError } from "../circuitBreaker";
import type { PipelineLogger } from "../logger";

type CrossrefAuthor = {
  given?: string;
  family?: string;
  affiliation?: Array<{ name?: string }>;
};

type CrossrefWorkItem = {
  title?: string[];
  DOI?: string;
  URL?: string;
  publisher?: string;
  "container-title"?: string[];
  abstract?: string;
  author?: CrossrefAuthor[];
  issued?: { "date-parts"?: number[][] };
  published?: { "date-parts"?: number[][] };
  subject?: string[];
};

type CrossrefApiResponse = {
  message?: {
    items?: CrossrefWorkItem[];
    "total-results"?: number;
  };
};

export type CrossrefFetchOptions = {
  query: string;
  fromDate: string;
  rows: number;
  maxRetries: number;
  logger: PipelineLogger;
};

function extractYear(item: CrossrefWorkItem): string {
  const dateParts =
    item.issued?.["date-parts"]?.[0] ??
    item.published?.["date-parts"]?.[0];
  const year = dateParts?.[0];
  return year ? String(year) : String(new Date().getFullYear());
}

function mapCrossrefItem(item: CrossrefWorkItem): RawStudy {
  const title = item.title?.[0] ?? "Untitled study";
  const publisher =
    item["container-title"]?.[0] ?? item.publisher ?? null;
  const year = extractYear(item);
  const doi = item.DOI ?? null;
  const url = item.URL ?? (doi ? `https://doi.org/${doi}` : null);

  const abstract = item.abstract
    ? String(item.abstract).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : null;

  const affiliations = (item.author ?? [])
    .flatMap((author) =>
      Array.isArray(author.affiliation) ? author.affiliation : [],
    )
    .map((entry) => String(entry.name ?? "").trim())
    .filter(Boolean);

  const firstAuthor = item.author?.[0]
    ? [item.author[0].given, item.author[0].family]
        .filter(Boolean)
        .join(" ")
        .trim()
    : null;

  const subjects = (item.subject ?? []).map((s) => s.trim().toLowerCase());

  return {
    title,
    doi,
    url,
    publisher,
    year,
    abstract,
    firstAuthor,
    affiliations: [...new Set(affiliations)].slice(0, 4),
    meta: { subjects, source: "crossref" },
  };
}

/**
 * Fetch studies from Crossref for a single query string.
 * Uses retry with exponential backoff.
 */
export async function fetchFromCrossref(
  options: CrossrefFetchOptions,
): Promise<{ items: RawStudy[]; totalAvailable: number }> {
  const { query, fromDate, rows, maxRetries, logger } = options;

  // Circuit breaker protects against cascading Crossref failures
  const breaker = getCircuitBreaker({
    name: "crossref",
    failureThreshold: 5,
    resetTimeoutMs: 120_000,
  });

  if (!breaker.isAvailable()) {
    logger.warn(`Circuit breaker "${breaker.name}" is open — skipping Crossref query "${query}"`);
    return { items: [], totalAvailable: 0 };
  }

  const endpoint = new URL(CROSSREF_BASE_URL);
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("rows", String(rows));
  endpoint.searchParams.set("sort", "published");
  endpoint.searchParams.set("order", "desc");
  endpoint.searchParams.set(
    "filter",
    `from-pub-date:${fromDate.slice(0, 10)},type:journal-article`,
  );

  logger.debug(`Fetching Crossref: "${query}" from ${fromDate}`, { rows });

  try {
    const { result, attempts } = await breaker.execute(() =>
      withRetry(
        async () => {
          const res = await fetch(endpoint.toString(), {
            headers: {
              "User-Agent": CROSSREF_USER_AGENT,
              Accept: "application/json",
            },
            cache: "no-store",
          });

          if (!res.ok) {
            throw new Error(`Crossref HTTP ${res.status} for query "${query}"`);
          }

          return (await res.json()) as CrossrefApiResponse;
        },
        {
          maxAttempts: maxRetries,
          label: `crossref:${query}`,
          onRetry: (attempt, error, delay) => {
            const message =
              error instanceof Error ? error.message : String(error);
            logger.warn(`Crossref retry ${attempt} for "${query}": ${message}`, {
              delay,
            });
          },
        },
      ).then((r) => r),
    );

    const items = (result.message?.items ?? []).map(mapCrossrefItem);
    const totalAvailable = result.message?.["total-results"] ?? items.length;

    logger.info(`Crossref "${query}": ${items.length} items (${attempts} attempt(s))`, {
      totalAvailable,
    });

    return { items, totalAvailable };
  } catch (error) {
    if (error instanceof CircuitOpenError) {
      logger.warn(`Circuit open for Crossref query "${query}": ${error.message}`);
      return { items: [], totalAvailable: 0 };
    }
    throw error;
  }
}
