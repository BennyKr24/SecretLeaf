import { getArticleBySlug, getArticleSources, wikiArticles } from "@/data/terpira/wiki";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return Response.json({ error: "Article not found" }, { status: 404 });
  }

  const sources = getArticleSources(article);

  const related = article.relatedSlugs
    .map((s) => wikiArticles.find((a) => a.slug === s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      category: a.category,
    }));

  return Response.json({ article, sources, related });
}
