import { prisma } from "@/lib/prisma";
import type { TerpiraSource } from "@/lib/terpira/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbSources = await prisma.wikiSource.findMany({
    orderBy: { createdAt: "asc" },
  });

  const sources: TerpiraSource[] = dbSources.map((s) => ({
    id: s.id,
    title: s.title,
    publisher: s.publisher ?? "",
    year: s.year?.toString() ?? "",
    url: s.url ?? "",
    doi: s.doi ?? undefined,
  }));

  return Response.json({
    sources,
    total: sources.length,
    autoCount: 0,
  });
}

