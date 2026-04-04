import { wikiArticles, sourceRegister } from "@/data/terpira/wiki";

export const dynamic = "force-dynamic";

export async function GET() {
  const autoSources = sourceRegister.filter((s) => s.sourceType === "auto").length;

  return Response.json({
    articles: wikiArticles.map((a) => ({
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      category: a.category,
      difficulty: a.difficulty,
      readMinutes: a.readMinutes,
      lastUpdated: a.lastUpdated,
      tags: a.tags,
      keyTakeaways: a.keyTakeaways,
      sourceIds: a.sourceIds ?? [],
      relatedSlugs: a.relatedSlugs,
    })),
    stats: {
      totalArticles: wikiArticles.length,
      totalSources: sourceRegister.length,
      autoSources,
      totalReadMinutes: wikiArticles.reduce((sum, a) => sum + a.readMinutes, 0),
    },
  });
}
