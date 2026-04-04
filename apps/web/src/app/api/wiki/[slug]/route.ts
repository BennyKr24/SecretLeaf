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
  TerpiraSource,
} from "@/lib/terpira/types";
import type { NextRequest } from "next/server";

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

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const dbArticle = await prisma.wikiArticle.findUnique({
    where: { slug },
    include: {
      articleSources: {
        include: { source: true },
      },
    },
  });

  if (!dbArticle) {
    return Response.json({ error: "Article not found" }, { status: 404 });
  }

  let content: ContentJson = {};
  try {
    content = JSON.parse(dbArticle.content) as ContentJson;
  } catch {
    // fall back to empty content
  }

  const article: TerpiraArticle = {
    slug: dbArticle.slug,
    title: dbArticle.title,
    summary: dbArticle.summary,
    category: dbArticle.category as TerpiraCategory,
    difficulty: content.difficulty ?? "einsteiger",
    readMinutes: content.readMinutes ?? 5,
    lastUpdated:
      dbArticle.publishedAt?.toISOString().slice(0, 10) ??
      dbArticle.updatedAt.toISOString().slice(0, 10),
    tags: content.tags ?? [],
    keyTakeaways: content.keyTakeaways ?? [],
    quickFacts: content.quickFacts ?? [],
    sections: content.sections ?? [],
    warnings: content.warnings,
    simpleExplainers: content.simpleExplainers,
    faq: content.faq,
    glossary: content.glossary,
    sourceIds: dbArticle.articleSources.map((as) => as.sourceId),
    relatedSlugs: content.relatedSlugs ?? [],
  };

  const sources: TerpiraSource[] = dbArticle.articleSources.map(({ source: s }) => ({
    id: s.id,
    title: s.title,
    publisher: s.publisher ?? "",
    year: s.year?.toString() ?? "",
    url: s.url ?? "",
    doi: s.doi ?? undefined,
  }));

  // Fetch related articles by slug
  const related = await Promise.all(
    (content.relatedSlugs ?? []).map((relSlug) =>
      prisma.wikiArticle.findUnique({
        where: { slug: relSlug },
        select: { slug: true, title: true, summary: true, category: true },
      })
    )
  ).then((results) =>
    results
      .filter((a): a is NonNullable<typeof a> => Boolean(a))
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        summary: a.summary,
        category: a.category as TerpiraCategory,
      }))
  );

  return Response.json({ article, sources, related });
}

