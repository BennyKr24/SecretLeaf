// ────────────────────────────────────────────────────────────────────────────
// Knowledge OS — Domain types
//
// Mirrors the normalized schema in
//   supabase/migrations/202606020013_knowledge_os.sql
//
// These are the canonical runtime shapes used by the repository (db.ts) and the
// service layer (service.ts). They intentionally model content as data, not code.
// ────────────────────────────────────────────────────────────────────────────

export type KnowledgeStatus = "draft" | "in_review" | "published" | "archived";

export type KnowledgeDifficulty =
  | "foundational"
  | "intermediate"
  | "advanced"
  | "expert";

export type KnowledgeRelationType =
  | "related"
  | "parent"
  | "child"
  | "prerequisite"
  | "causes"
  | "caused_by"
  | "symptom_of"
  | "treats"
  | "interacts_with"
  | "antagonist_of"
  | "synergist_of"
  | "measured_by"
  | "see_also";

export type KnowledgeToolKind =
  | "diagnosis"
  | "calculator"
  | "simulator"
  | "reference"
  | "external";

/**
 * Canonical block types for the professional article template (Phase 4).
 * Stored in `knowledge_articles.body` as an ordered JSON array.
 */
export type KnowledgeBlockType =
  | "definition"
  | "scientific_background"
  | "plant_physiology"
  | "symptoms"
  | "causes"
  | "diagnosis"
  | "corrective_actions"
  | "preventive_measures"
  | "environmental_factors"
  | "nutrient_interactions"
  | "common_mistakes"
  | "advanced_considerations"
  | "related_topics"
  | "references"
  | "faq"
  | "expert_tips"
  | "callout"
  | "warning"
  | "expert_box";

export type KnowledgeBlock = {
  type: KnowledgeBlockType;
  heading?: string;
  content?: string[];
  checklist?: string[];
  meta?: Record<string, unknown>;
};

export type KnowledgeCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  parentId: string | null;
  position: number;
};

export type KnowledgeTag = {
  id: string;
  slug: string;
  name: string;
  kind: string;
};

export type KnowledgeFaq = {
  id: string;
  question: string;
  answer: string;
  position: number;
};

export type KnowledgeReference = {
  id: string;
  sourceId: string;
  title: string;
  publisher: string | null;
  year: string | null;
  url: string | null;
  doi: string | null;
  context: string | null;
};

export type KnowledgeToolLink = {
  id: string;
  toolKind: KnowledgeToolKind;
  toolSlug: string;
  label: string;
  href: string;
  position: number;
};

export type KnowledgeRelation = {
  id: string;
  fromArticle: string;
  toArticle: string;
  relationType: KnowledgeRelationType;
  weight: number;
  note: string | null;
};

export type KnowledgeArticleSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  categoryId: string | null;
  difficulty: KnowledgeDifficulty;
  status: KnowledgeStatus;
  readMinutes: number | null;
  qualityScore: number | null;
  language: string;
  publishedAt: string | null;
  updatedAt: string;
};

export type KnowledgeArticle = KnowledgeArticleSummary & {
  body: KnowledgeBlock[];
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  entityType: string | null;
  meta: Record<string, unknown>;
  tags: KnowledgeTag[];
  faqs: KnowledgeFaq[];
  references: KnowledgeReference[];
  toolLinks: KnowledgeToolLink[];
};

/** A node + the typed edge that connected it during a graph traversal. */
export type KnowledgeGraphNode = {
  article: KnowledgeArticleSummary;
  relationType: KnowledgeRelationType;
  weight: number;
  depth: number;
};

export type KnowledgeGraph = {
  root: KnowledgeArticleSummary;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeRelation[];
};

/** Analytics event names persisted to `knowledge_events`. */
export type KnowledgeEventType =
  | "view"
  | "scroll_depth"
  | "read_complete"
  | "link_click"
  | "search_query"
  | "diagnostic_launch"
  | "calculator_launch"
  | "graph_traverse";

export type KnowledgeEventInput = {
  eventType: KnowledgeEventType;
  articleId?: string | null | undefined;
  userId?: string | null | undefined;
  sessionId?: string | null | undefined;
  value?: number | null | undefined;
  query?: string | null | undefined;
  targetSlug?: string | null | undefined;
  meta?: Record<string, unknown> | undefined;
};
