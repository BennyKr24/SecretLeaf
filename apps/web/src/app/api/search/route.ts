import { search } from "@/lib/search/engine";
import { NextRequest } from "next/server";
import type { SearchResultKind } from "@/lib/search/engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const q = (searchParams.get("q") ?? "").trim();
  const limitRaw = parseInt(searchParams.get("limit") ?? "20", 10);
  const limit = isNaN(limitRaw) || limitRaw < 1 ? 20 : Math.min(limitRaw, 100);
  const kindsRaw = searchParams.get("kinds");

  const allowedKinds: SearchResultKind[] = ["wiki", "fertilizer", "source", "glossary"];
  const kinds = kindsRaw
    ? (kindsRaw.split(",").filter((k) => allowedKinds.includes(k as SearchResultKind)) as SearchResultKind[])
    : undefined;

  if (!q) {
    return Response.json(
      { error: "Missing query parameter 'q'" },
      { status: 400 }
    );
  }
  if (q.length > 200) {
    return Response.json(
      { error: "Query too long (max 200 chars)" },
      { status: 400 }
    );
  }

  const result = search(q, { limit, ...(kinds ? { kinds } : {}) });

  return Response.json(result, {
    headers: {
      "Cache-Control": "no-store",
      "X-Search-Duration-Ms": String(result.duration_ms),
    },
  });
}
