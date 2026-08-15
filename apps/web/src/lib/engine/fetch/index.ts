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

/** Run every query for one cluster against Crossref, tagging + logging as it goes. */
async function fetchCluster(
  cluster: { key: string; queries: string[] },
  config: PipelineConfig,
  fromDate: string,
  logger: PipelineLogger,
  allItems: RawStudy[],
  queryStats: FetchResult["queryStats"],
): Promise<number> {
  let errors = 0;
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
      const message = error instanceof Error ? error.message : String(error);
      errors++;
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
  return errors;
}

/**
 * Multi-source fetch orchestrator.
 * Iterates over all topic clusters and fetches from each configured adapter.
 *
 * @param extraClusters - Admin-defined custom clusters (engine_config
 *   `topic_clusters.customClusters`) with their own narrow search queries,
 *   fetched in addition to the hardcoded TOPIC_CLUSTERS.
 */
export async function fetchAllSources(
  config: PipelineConfig,
  logger: PipelineLogger,
  extraClusters?: Array<{ key: string; queries: string[] }>,
): Promise<FetchResult> {
  const fromDate = daysAgoIso(config.lookbackDays);
  const allItems: RawStudy[] = [];
  const queryStats: FetchResult["queryStats"] = [];
  let totalErrors = 0;

  logger.info("Fetch layer starting", {
    lookbackDays: config.lookbackDays,
    clusters: TOPIC_CLUSTERS.length,
    extraClusters: extraClusters?.length ?? 0,
    fromDate: fromDate.slice(0, 10),
  });

  for (const cluster of TOPIC_CLUSTERS) {
    totalErrors += await fetchCluster(cluster, config, fromDate, logger, allItems, queryStats);
  }

  for (const cluster of extraClusters ?? []) {
    totalErrors += await fetchCluster(cluster, config, fromDate, logger, allItems, queryStats);
  }

  logger.info("Fetch layer complete", {
    totalFetched: allItems.length,
    totalQueries: queryStats.length,
    totalErrors,
  });

  return { items: allItems, queryStats, totalErrors };
}
