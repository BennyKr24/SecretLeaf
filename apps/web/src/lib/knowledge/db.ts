// ────────────────────────────────────────────────────────────────────────────
// Knowledge OS — Supabase data-access layer (repository)
//
// Pure data access over the knowledge_* tables. No business logic lives here;
// composition and graph traversal happen in service.ts. Follows the same
// conventions as lib/grow/db.ts (explicit row types + mappers).
//
// All functions take a SupabaseClient so they work with either the server
// (service-role) client or a request-scoped client.
// ────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  KnowledgeArticle,
  KnowledgeArticleSummary,
  KnowledgeCategory,
  KnowledgeEventInput,
  KnowledgeFaq,
  KnowledgeReference,
  KnowledgeRelation,
  KnowledgeRelationType,
  KnowledgeTag,
  KnowledgeToolLink,
} from "./types";

// ── Row types (snake_case, as returned by Supabase) ───────────────────────────

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: KnowledgeArticle["body"] | null;
  category_id: string | null;
  difficulty: KnowledgeArticle["difficulty"];
  status: KnowledgeArticle["status"];
  read_minutes: number | null;
  quality_score: number | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  entity_type: string | null;
  meta: Record<string, unknown> | null;
  language: string;
  published_at: string | null;
  updated_at: string;
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  position: number;
};

type TagRow = { id: string; slug: string; name: string; kind: string };

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  position: number;
};

type RelationRow = {
  id: string;
  from_article: string;
  to_article: string;
  relation_type: KnowledgeRelationType;
  weight: number;
  note: string | null;
};

type ToolLinkRow = {
  id: string;
  tool_kind: KnowledgeToolLink["toolKind"];
  tool_slug: string;
  label: string;
  href: string;
  position: number;
};

type ReferenceRow = {
  id: string;
  source_id: string;
  context: string | null;
  knowledge_sources: {
    title: string;
    publisher: string | null;
    year: string | null;
    url: string | null;
    doi: string | null;
  } | null;
};

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapSummary(row: ArticleRow): KnowledgeArticleSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    categoryId: row.category_id,
    difficulty: row.difficulty,
    status: row.status,
    readMinutes: row.read_minutes,
    qualityScore: row.quality_score,
    language: row.language,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

function mapCategory(row: CategoryRow): KnowledgeCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    icon: row.icon,
    parentId: row.parent_id,
    position: row.position,
  };
}

function mapTag(row: TagRow): KnowledgeTag {
  return { id: row.id, slug: row.slug, name: row.name, kind: row.kind };
}

function mapFaq(row: FaqRow): KnowledgeFaq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    position: row.position,
  };
}

export function mapRelation(row: RelationRow): KnowledgeRelation {
  return {
    id: row.id,
    fromArticle: row.from_article,
    toArticle: row.to_article,
    relationType: row.relation_type,
    weight: Number(row.weight),
    note: row.note,
  };
}

function mapToolLink(row: ToolLinkRow): KnowledgeToolLink {
  return {
    id: row.id,
    toolKind: row.tool_kind,
    toolSlug: row.tool_slug,
    label: row.label,
    href: row.href,
    position: row.position,
  };
}

function mapReference(row: ReferenceRow): KnowledgeReference {
  return {
    id: row.id,
    sourceId: row.source_id,
    title: row.knowledge_sources?.title ?? "",
    publisher: row.knowledge_sources?.publisher ?? null,
    year: row.knowledge_sources?.year ?? null,
    url: row.knowledge_sources?.url ?? null,
    doi: row.knowledge_sources?.doi ?? null,
    context: row.context,
  };
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function listCategories(
  supabase: SupabaseClient,
): Promise<KnowledgeCategory[]> {
  const { data, error } = await supabase
    .from("knowledge_categories")
    .select("id, slug, name, description, icon, parent_id, position")
    .order("position", { ascending: true });

  if (error) throw error;
  return (data as unknown as CategoryRow[]).map(mapCategory);
}

// ── Article listing ───────────────────────────────────────────────────────────

export type ListArticlesOptions = {
  categorySlug?: string | undefined;
  status?: KnowledgeArticle["status"] | undefined;
  language?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
};

export async function listArticles(
  supabase: SupabaseClient,
  options: ListArticlesOptions = {},
): Promise<KnowledgeArticleSummary[]> {
  const limit = Math.min(Math.max(options.limit ?? 25, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);

  let query = supabase
    .from("knowledge_articles")
    .select(ARTICLE_SUMMARY_COLUMNS)
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  query = query.eq("status", options.status ?? "published");
  if (options.language) query = query.eq("language", options.language);

  if (options.categorySlug) {
    const { data: cat } = await supabase
      .from("knowledge_categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .maybeSingle<{ id: string }>();
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as ArticleRow[]).map(mapSummary);
}

const ARTICLE_SUMMARY_COLUMNS =
  "id, slug, title, summary, body, category_id, difficulty, status, " +
  "read_minutes, quality_score, seo_title, seo_description, canonical_url, " +
  "entity_type, meta, language, published_at, updated_at";

// ── Single article (composed) ─────────────────────────────────────────────────

export async function getArticleBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<KnowledgeArticle | null> {
  const { data: article, error } = await supabase
    .from("knowledge_articles")
    .select(ARTICLE_SUMMARY_COLUMNS)
    .eq("slug", slug)
    .maybeSingle<ArticleRow>();

  if (error) throw error;
  if (!article) return null;

  const [tags, faqs, references, toolLinks] = await Promise.all([
    getArticleTags(supabase, article.id),
    getArticleFaqs(supabase, article.id),
    getArticleReferences(supabase, article.id),
    getArticleToolLinks(supabase, article.id),
  ]);

  return {
    ...mapSummary(article),
    body: Array.isArray(article.body) ? article.body : [],
    seoTitle: article.seo_title,
    seoDescription: article.seo_description,
    canonicalUrl: article.canonical_url,
    entityType: article.entity_type,
    meta: article.meta ?? {},
    tags,
    faqs,
    references,
    toolLinks,
  };
}

export async function getArticleSummaryById(
  supabase: SupabaseClient,
  id: string,
): Promise<KnowledgeArticleSummary | null> {
  const { data, error } = await supabase
    .from("knowledge_articles")
    .select(ARTICLE_SUMMARY_COLUMNS)
    .eq("id", id)
    .maybeSingle<ArticleRow>();
  if (error) throw error;
  return data ? mapSummary(data) : null;
}

// ── Article children ──────────────────────────────────────────────────────────

async function getArticleTags(
  supabase: SupabaseClient,
  articleId: string,
): Promise<KnowledgeTag[]> {
  const { data, error } = await supabase
    .from("knowledge_article_tags")
    .select("knowledge_tags(id, slug, name, kind)")
    .eq("article_id", articleId);
  if (error) throw error;
  return (data as unknown as Array<{ knowledge_tags: TagRow | null }>)
    .map((r) => r.knowledge_tags)
    .filter((t): t is TagRow => Boolean(t))
    .map(mapTag);
}

async function getArticleFaqs(
  supabase: SupabaseClient,
  articleId: string,
): Promise<KnowledgeFaq[]> {
  const { data, error } = await supabase
    .from("knowledge_faqs")
    .select("id, question, answer, position")
    .eq("article_id", articleId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data as unknown as FaqRow[]).map(mapFaq);
}

async function getArticleReferences(
  supabase: SupabaseClient,
  articleId: string,
): Promise<KnowledgeReference[]> {
  const { data, error } = await supabase
    .from("knowledge_references")
    .select(
      "id, source_id, context, knowledge_sources(title, publisher, year, url, doi)",
    )
    .eq("article_id", articleId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data as unknown as ReferenceRow[]).map(mapReference);
}

async function getArticleToolLinks(
  supabase: SupabaseClient,
  articleId: string,
): Promise<KnowledgeToolLink[]> {
  const { data, error } = await supabase
    .from("knowledge_tool_links")
    .select("id, tool_kind, tool_slug, label, href, position")
    .eq("article_id", articleId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data as unknown as ToolLinkRow[]).map(mapToolLink);
}

// ── Knowledge graph ───────────────────────────────────────────────────────────

/** Outgoing typed relations from an article (one hop). */
export async function getOutgoingRelations(
  supabase: SupabaseClient,
  articleId: string,
): Promise<KnowledgeRelation[]> {
  const { data, error } = await supabase
    .from("knowledge_relations")
    .select("id, from_article, to_article, relation_type, weight, note")
    .eq("from_article", articleId)
    .order("weight", { ascending: false });
  if (error) throw error;
  return (data as unknown as RelationRow[]).map(mapRelation);
}

// ── Ranked / hybrid search (SR-1, SR-2, AI-1) ─────────────────────────────────

/** Row shape returned by the `knowledge_hybrid_search` SQL function. */
type HybridSearchRow = {
  article_id: string;
  slug: string;
  title: string;
  summary: string | null;
  category_id: string | null;
  difficulty: KnowledgeArticle["difficulty"];
  status: KnowledgeArticle["status"];
  read_minutes: number | null;
  quality_score: number | null;
  language: string;
  published_at: string | null;
  updated_at: string;
  score: number | string;
};

function mapHybridRow(row: HybridSearchRow): KnowledgeArticleSummary {
  return {
    id: row.article_id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    categoryId: row.category_id,
    difficulty: row.difficulty,
    status: row.status,
    readMinutes: row.read_minutes,
    qualityScore: row.quality_score,
    language: row.language,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Full-text search over the body-inclusive, language-aware `search_tsv`, ranked
 * by `ts_rank_cd` inside Postgres (SR-2). Backed by the `knowledge_hybrid_search`
 * RPC; when `queryEmbedding` is supplied it fuses FTS with HNSW vector search
 * via reciprocal rank fusion (SR-1 / AI-1).
 */
export async function searchArticles(
  supabase: SupabaseClient,
  term: string,
  limit = 20,
  options: { language?: string; queryEmbedding?: number[] } = {},
): Promise<KnowledgeArticleSummary[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const args: Record<string, unknown> = {
    query_text: trimmed,
    match_count: Math.min(Math.max(limit, 1), 100),
    lang: options.language ?? "de",
  };
  if (options.queryEmbedding) args.query_embedding = options.queryEmbedding;

  const { data, error } = await supabase.rpc("knowledge_hybrid_search", args);
  if (error) throw error;
  return ((data as HybridSearchRow[] | null) ?? []).map(mapHybridRow);
}

/** Row shape returned by the `knowledge_match_embeddings` SQL function. */
type EmbeddingMatchRow = {
  article_id: string;
  chunk_index: number;
  content: string;
  similarity: number;
  slug: string;
  title: string;
};

export type KnowledgeEmbeddingMatch = {
  articleId: string;
  chunkIndex: number;
  content: string;
  similarity: number;
  slug: string;
  title: string;
};

/**
 * Pure vector (cosine) nearest-neighbour search over chunk embeddings, served by
 * the HNSW index (SR-1). Returns the matching chunks of published articles.
 */
export async function matchEmbeddings(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  matchCount = 10,
  minSimilarity = 0,
): Promise<KnowledgeEmbeddingMatch[]> {
  const { data, error } = await supabase.rpc("knowledge_match_embeddings", {
    query_embedding: queryEmbedding,
    match_count: Math.min(Math.max(matchCount, 1), 100),
    min_similarity: minSimilarity,
  });
  if (error) throw error;
  return ((data as EmbeddingMatchRow[] | null) ?? []).map((r) => ({
    articleId: r.article_id,
    chunkIndex: r.chunk_index,
    content: r.content,
    similarity: Number(r.similarity),
    slug: r.slug,
    title: r.title,
  }));
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function recordEvent(
  supabase: SupabaseClient,
  event: KnowledgeEventInput,
): Promise<void> {
  const { error } = await supabase.from("knowledge_events").insert({
    event_type: event.eventType,
    article_id: event.articleId ?? null,
    user_id: event.userId ?? null,
    session_id: event.sessionId ?? null,
    value: event.value ?? null,
    query: event.query ?? null,
    target_slug: event.targetSlug ?? null,
    meta: event.meta ?? {},
  });
  if (error) throw error;
}
