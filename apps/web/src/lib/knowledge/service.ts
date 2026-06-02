// ────────────────────────────────────────────────────────────────────────────
// Knowledge OS — Service layer
//
// Business logic on top of the repository (db.ts): graph traversal, JSON-LD
// (schema.org) generation for programmatic SEO, and analytics helpers.
// ────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import { getArticleBySlug } from "./db";
import type {
  KnowledgeArticle,
  KnowledgeArticleSummary,
  KnowledgeDifficulty,
  KnowledgeGraph,
  KnowledgeGraphNode,
  KnowledgeRelation,
  KnowledgeRelationType,
  KnowledgeStatus,
} from "./types";

// ── Knowledge graph traversal ─────────────────────────────────────────────────

export type TraverseOptions = {
  /** Maximum traversal depth (hops from the root). */
  maxDepth?: number;
  /** Maximum number of nodes to return (safety bound for large graphs). */
  maxNodes?: number;
  /** Maximum edges followed per node (weight-ordered top-K; supernode guard). */
  perNodeLimit?: number;
};

/** Row shape returned by the `knowledge_graph_expand` SQL function. */
type GraphExpandRow = {
  from_article: string;
  to_article: string;
  relation_type: KnowledgeRelationType;
  weight: number | string;
  depth: number;
  to_slug: string;
  to_title: string;
  to_summary: string | null;
  to_category_id: string | null;
  to_difficulty: KnowledgeDifficulty;
  to_status: KnowledgeStatus;
  to_read_minutes: number | null;
  to_language: string;
  to_published_at: string | null;
  to_updated_at: string;
};

/**
 * Breadth-first traversal of the knowledge graph starting from `rootSlug`.
 *
 * GR-1 remediation: the traversal runs entirely inside Postgres via the
 * `knowledge_graph_expand` recursive-CTE function — a single round-trip instead
 * of the previous per-node + per-neighbor N+1. The function is weight-pruned
 * (top-K per node), cycle-safe, and returns only published targets.
 */
export async function traverseGraph(
  supabase: SupabaseClient,
  rootSlug: string,
  options: TraverseOptions = {},
): Promise<KnowledgeGraph | null> {
  const maxDepth = Math.min(Math.max(options.maxDepth ?? 2, 1), 6);
  const maxNodes = Math.min(Math.max(options.maxNodes ?? 50, 1), 500);
  const perNodeLimit = Math.min(Math.max(options.perNodeLimit ?? 25, 1), 100);

  const root = await getArticleBySlug(supabase, rootSlug);
  if (!root) return null;

  const { data, error } = await supabase.rpc("knowledge_graph_expand", {
    root_slug: rootSlug,
    max_depth: maxDepth,
    max_nodes: maxNodes,
    per_node_limit: perNodeLimit,
  });
  if (error) throw error;

  const rows = (data as GraphExpandRow[] | null) ?? [];
  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeRelation[] = [];

  for (const row of rows) {
    const summary: KnowledgeArticleSummary = {
      id: row.to_article,
      slug: row.to_slug,
      title: row.to_title,
      summary: row.to_summary,
      categoryId: row.to_category_id,
      difficulty: row.to_difficulty,
      status: row.to_status,
      readMinutes: row.to_read_minutes,
      qualityScore: null,
      language: row.to_language,
      publishedAt: row.to_published_at,
      updatedAt: row.to_updated_at,
    };
    const weight = Number(row.weight);
    nodes.push({
      article: summary,
      relationType: row.relation_type,
      weight,
      depth: row.depth,
    });
    edges.push({
      id: `${row.from_article}:${row.to_article}:${row.relation_type}`,
      fromArticle: row.from_article,
      toArticle: row.to_article,
      relationType: row.relation_type,
      weight,
      note: null,
    });
  }

  return { root, nodes, edges };
}

// ── Programmatic SEO: schema.org JSON-LD (Phase 10) ───────────────────────────

/**
 * Builds the Article + FAQ + Breadcrumb JSON-LD graph for an article so SEO
 * pages can be generated programmatically from database rows.
 */
export function buildArticleJsonLd(
  article: KnowledgeArticle,
  options: { siteUrl: string; categoryName?: string; categorySlug?: string },
): Record<string, unknown> {
  const url =
    article.canonicalUrl ?? `${options.siteUrl}/studies/${article.slug}`;

  const graph: Array<Record<string, unknown>> = [
    {
      "@type": article.entityType ?? "Article",
      "@id": `${url}#article`,
      headline: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.summary ?? undefined,
      inLanguage: article.language,
      datePublished: article.publishedAt ?? undefined,
      dateModified: article.updatedAt,
      keywords: article.tags.map((t) => t.name).join(", ") || undefined,
      url,
      citation: article.references.map((ref) => ({
        "@type": "CreativeWork",
        name: ref.title,
        ...(ref.url ? { url: ref.url } : {}),
        ...(ref.doi ? { identifier: ref.doi } : {}),
      })),
    },
  ];

  if (article.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: article.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  const breadcrumbItems: Array<Record<string, unknown>> = [
    { "@type": "ListItem", position: 1, name: "Home", item: options.siteUrl },
    {
      "@type": "ListItem",
      position: 2,
      name: "Studien",
      item: `${options.siteUrl}/studies`,
    },
  ];
  if (options.categoryName && options.categorySlug) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: options.categoryName,
      item: `${options.siteUrl}/category/${options.categorySlug}`,
    });
  }
  breadcrumbItems.push({
    "@type": "ListItem",
    position: breadcrumbItems.length + 1,
    name: article.title,
    item: url,
  });

  graph.push({
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: breadcrumbItems,
  });

  return { "@context": "https://schema.org", "@graph": graph };
}
