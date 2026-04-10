import { NextRequest } from "next/server";
import { searchStudies, type StudyRankingMode } from "@/lib/search/studyAlgorithms";

export const dynamic = "force-dynamic";

function toBool(value: string | null, defaultValue: boolean): boolean {
  if (value == null) return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const q = (searchParams.get("q") ?? "").trim();
  const limitRaw = Number.parseInt(searchParams.get("limit") ?? "20", 10);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 100)) : 20;

  const modeRaw = (searchParams.get("mode") ?? "smart").trim().toLowerCase();
  const mode: StudyRankingMode =
    modeRaw === "fresh" || modeRaw === "quality" ? modeRaw : "smart";

  const includeAuto = toBool(searchParams.get("includeAuto"), true);
  const includeManual = toBool(searchParams.get("includeManual"), true);

  if (q.length > 200) {
    return Response.json({ error: "Query too long (max 200 chars)" }, { status: 400 });
  }

  if (!includeAuto && !includeManual) {
    return Response.json(
      { error: "At least one source type must be enabled." },
      { status: 400 }
    );
  }

  try {
    const response = searchStudies(q, {
      limit,
      mode,
      includeAuto,
      includeManual,
    });

    return Response.json(response, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=1800",
        "X-Study-Search-Duration-Ms": String(response.durationMs),
        "X-Study-Mode": mode,
      },
    });
  } catch {
    return Response.json(
      { error: "Study search failed", results: [], total: 0, durationMs: 0 },
      { status: 500 },
    );
  }
}
