// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Fetch Layer Orchestrator
// ──────────────────────────────────────────────────────────────────────────────
//
// Fetches from all configured sources (currently Crossref, extensible to
// PubMed, Semantic Scholar, etc.) and returns a unified list of RawStudy items.
// ──────────────────────────────────────────────────────────────────────────────

import type { RawStudy } from "../types";
import type { PipelineConfig } from "../types";
import { TOPIC_CLUSTERS } from "../config";
import type { PipelineLogger } from "../logger";
import { fetchFromCrossref } from "./crossref";

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
 * Multi-source fetch orchestrator.
 * Iterates over all topic clusters and fetches from each configured adapter.
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
  });

  for (const cluster of TOPIC_CLUSTERS) {
    for (const query of cluster.queries) {
      try {
        const { items } = await fetchFromCrossref({
          query,
          fromDate,
          rows: config.crossrefRowsPerQuery,
          maxRetries: config.maxFetchRetries,
          logger,
        });

        // Tag each item with the cluster it came from
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
        const message =
          error instanceof Error ? error.message : String(error);
        totalErrors++;
        logger.error(`Fetch failed for cluster "${cluster.key}" query "${query}"`, {
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
    }
  }

  logger.info("Fetch layer complete", {
    totalFetched: allItems.length,
    totalQueries: queryStats.length,
    totalErrors,
  });

  return { items: allItems, queryStats, totalErrors };
}
