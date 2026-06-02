// ────────────────────────────────────────────────────────────────────────────
// Knowledge OS — Service layer
//
// Business logic on top of the repository (db.ts): graph traversal, JSON-LD
// (schema.org) generation for programmatic SEO, and analytics helpers.
// ────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getArticleBySlug,
  getArticleSummaryById,
  getOutgoingRelations,
} from "./db";
import type {
  KnowledgeArticle,
  KnowledgeGraph,
  KnowledgeGraphNode,
  KnowledgeRelation,
} from "./types";

// ── Knowledge graph traversal ─────────────────────────────────────────────────

export type TraverseOptions = {
  /** Maximum traversal depth (hops from the root). */
  maxDepth?: number;
  /** Maximum number of nodes to return (safety bound for large graphs). */
  maxNodes?: number;
};

/**
 * Breadth-first traversal of the knowledge graph starting from `rootSlug`.
 *
 * Returns the reachable subgraph (nodes + typed, weighted edges) so future AI
 * systems can expand RAG context, drive diagnostics, or recommend related
 * topics. Visited-set prevents cycles; node/depth bounds keep it cheap.
 */
export async function traverseGraph(
  supabase: SupabaseClient,
  rootSlug: string,
  options: TraverseOptions = {},
): Promise<KnowledgeGraph | null> {
  const maxDepth = Math.min(Math.max(options.maxDepth ?? 2, 1), 5);
  const maxNodes = Math.min(Math.max(options.maxNodes ?? 50, 1), 500);

  const root = await getArticleBySlug(supabase, rootSlug);
  if (!root) return null;

  const visited = new Set<string>([root.id]);
  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeRelation[] = [];

  let frontier: Array<{ id: string; depth: number }> = [
    { id: root.id, depth: 0 },
  ];

  while (frontier.length > 0 && nodes.length < maxNodes) {
    const next: Array<{ id: string; depth: number }> = [];

    for (const { id, depth } of frontier) {
      if (depth >= maxDepth) continue;

      const relations = await getOutgoingRelations(supabase, id);
      for (const relation of relations) {
        edges.push(relation);
        if (visited.has(relation.toArticle)) continue;
        visited.add(relation.toArticle);

        const summary = await getArticleSummaryById(
          supabase,
          relation.toArticle,
        );
        if (!summary || summary.status !== "published") continue;

        nodes.push({
          article: summary,
          relationType: relation.relationType,
          weight: relation.weight,
          depth: depth + 1,
        });
        next.push({ id: relation.toArticle, depth: depth + 1 });

        if (nodes.length >= maxNodes) break;
      }
      if (nodes.length >= maxNodes) break;
    }

    frontier = next;
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
