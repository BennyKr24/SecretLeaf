import { search, autocomplete } from "@/lib/search/engine";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const prefix = (searchParams.get("q") ?? "").trim();

  if (!prefix || prefix.length < 2) {
    return Response.json({ suggestions: [] });
  }
  if (prefix.length > 100) {
    return Response.json({ suggestions: [] });
  }

  // Autocomplete auf Titel-Ebene
  const suggestions = autocomplete(prefix, 8);

  // Auch Top-3 Direkttreffer fürs Dropdown
  const topResults = search(prefix, { limit: 5, minScore: 15 } as Parameters<typeof search>[1]);

  return Response.json({
    prefix,
    suggestions,
    topResults: topResults.results.slice(0, 5),
  });
}
