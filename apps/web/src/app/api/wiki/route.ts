import { prisma } from "@/lib/prisma";
import type {
  TerpiraArticle,
  TerpiraCategory,
  TerpiraDifficulty,
  TerpiraQuickFact,
  TerpiraSection,
  TerpiraSimpleExplainer,
  TerpiraFaqItem,
  TerpiraGlossaryItem,
} from "@/lib/terpira/types";

export const dynamic = "force-dynamic";

/** Shape of the JSON stored in WikiArticle.content */
type ContentJson = {
  difficulty?: TerpiraDifficulty;
  readMinutes?: number;
  tags?: string[];
  keyTakeaways?: string[];
  quickFacts?: TerpiraQuickFact[];
  sections?: TerpiraSection[];
  warnings?: string[];
  simpleExplainers?: TerpiraSimpleExplainer[];
  faq?: TerpiraFaqItem[];
  glossary?: TerpiraGlossaryItem[];
  relatedSlugs?: string[];
};

export async function GET() {
  const [articles, totalSources, autoSources] = await Promise.all([
    prisma.wikiArticle.findMany({
      include: { articleSources: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.wikiSource.count(),
    // Auto-generated articles (from the studies pipeline) have slugs that start with "auto"
    prisma.wikiArticle.count({ where: { slug: { startsWith: "auto" } } }),
  ]);

  const mappedArticles: TerpiraArticle[] = articles.map((a) => {
    let content: ContentJson = {};
    try {
      content = JSON.parse(a.content) as ContentJson;
    } catch {
      // silently fall back to empty content
    }

    return {
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      category: a.category as TerpiraCategory,
      difficulty: content.difficulty ?? "einsteiger",
      readMinutes: content.readMinutes ?? 5,
      lastUpdated:
        a.publishedAt?.toISOString().slice(0, 10) ??
        a.updatedAt.toISOString().slice(0, 10),
      tags: content.tags ?? [],
      keyTakeaways: content.keyTakeaways ?? [],
      quickFacts: content.quickFacts ?? [],
      sections: content.sections ?? [],
      warnings: content.warnings,
      simpleExplainers: content.simpleExplainers,
      faq: content.faq,
      glossary: content.glossary,
      sourceIds: a.articleSources.map((as) => as.sourceId),
      relatedSlugs: content.relatedSlugs ?? [],
    };
  });

  return Response.json({
    articles: mappedArticles,
    stats: {
      totalArticles: articles.length,
      totalSources,
      autoSources,
      totalReadMinutes: mappedArticles.reduce((sum, a) => sum + a.readMinutes, 0),
    },
  });
}

