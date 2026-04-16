// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Fetch Layer Orchestrator
// ──────────────────────────────────────────────────────────────────────────────
//
// Fetches from all configured sources (Crossref + PubMed) and returns a unified
// list of RawStudy items.
//
// Sources:
//   - Crossref     – broad academic coverage, date-filtered by cluster queries
//   - PubMed/NCBI  – cultivation-focused clusters only (richer abstract data)
// ──────────────────────────────────────────────────────────────────────────────

import type { RawStudy } from "../types";
import type { PipelineConfig } from "../types";
import { TOPIC_CLUSTERS } from "../config";
import type { PipelineLogger } from "../logger";
import { fetchFromCrossref } from "./crossref";
import { fetchFromPubMed } from "./pubmed";

export type FetchResult = {
  items: RawStudy[];
  queryStats: Array<{
    source: string;
    cluster: string;
    query: string;
    fetched: number;
    error: string | null;
  }>;
  totalErrors: number;
};

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/**
 * Clusters that benefit most from PubMed's cultivation/lab coverage.
 * PubMed is only queried for these to limit API usage and stay focused.
 */
const PUBMED_ENABLED_CLUSTERS = new Set([
  "anbau-postharvest",
  "qualitaet-labor",
  "pharmakologie",
]);

/**
 * Multi-source fetch orchestrator.
 * Iterates over all topic clusters and fetches from each configured adapter.
 * Crossref runs for all clusters; PubMed runs for cultivation/lab clusters only.
 */
export async function fetchAllSources(
  config: PipelineConfig,
  logger: PipelineLogger,
): Promise<FetchResult> {
  const fromDate = daysAgoIso(config.lookbackDays);
  const allItems: RawStudy[] = [];
  const queryStats: FetchResult["queryStats"] = [];
  let totalErrors = 0;

  logger.info("Fetch layer starting", {
    lookbackDays: config.lookbackDays,
    clusters: TOPIC_CLUSTERS.length,
    fromDate: fromDate.slice(0, 10),
    sources: ["crossref", "pubmed"],
  });

  for (const cluster of TOPIC_CLUSTERS) {
    for (const query of cluster.queries) {
      // ── Crossref ────────────────────────────────────────────────────
      try {
        const { items } = await fetchFromCrossref({
          query,
          fromDate,
          rows: config.crossrefRowsPerQuery,
          maxRetries: config.maxFetchRetries,
          logger,
        });

        for (const item of items) {
          (item.meta as Record<string, unknown>).cluster = cluster.key;
        }

        allItems.push(...items);
        queryStats.push({
          source: "crossref",
          cluster: cluster.key,
          query,
          fetched: items.length,
          error: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        totalErrors++;
        logger.error(`Crossref fetch failed for cluster "${cluster.key}" query "${query}"`, {
          error: message,
        });
        queryStats.push({
          source: "crossref",
          cluster: cluster.key,
          query,
          fetched: 0,
          error: message,
        });
      }

      // ── PubMed (cultivation/lab clusters only) ───────────────────
      if (PUBMED_ENABLED_CLUSTERS.has(cluster.key)) {
        try {
          const { items } = await fetchFromPubMed({
            query,
            fromDate,
            rows: Math.min(config.crossrefRowsPerQuery, 100),
            maxRetries: config.maxFetchRetries,
            logger,
          });

          for (const item of items) {
            (item.meta as Record<string, unknown>).cluster = cluster.key;
          }

          allItems.push(...items);
          queryStats.push({
            source: "pubmed",
            cluster: cluster.key,
            query,
            fetched: items.length,
            error: null,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          totalErrors++;
          logger.error(`PubMed fetch failed for cluster "${cluster.key}" query "${query}"`, {
            error: message,
          });
          queryStats.push({
            source: "pubmed",
            cluster: cluster.key,
            query,
            fetched: 0,
            error: message,
          });
        }
      }
    }
  }

  logger.info("Fetch layer complete", {
    totalFetched: allItems.length,
    totalQueries: queryStats.length,
    totalErrors,
    crossref: queryStats.filter((s) => s.source === "crossref").reduce((n, s) => n + s.fetched, 0),
    pubmed: queryStats.filter((s) => s.source === "pubmed").reduce((n, s) => n + s.fetched, 0),
  });

  return { items: allItems, queryStats, totalErrors };
}

