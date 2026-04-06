import { NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type StudyRow = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  created_at: string | null;
};

export async function GET(req: NextRequest) {
  const locationZone = req.nextUrl.searchParams.get("locationZone");
  const minPriceRaw = req.nextUrl.searchParams.get("minPrice");
  const maxPriceRaw = req.nextUrl.searchParams.get("maxPrice");
  const limitRaw = Number.parseInt(req.nextUrl.searchParams.get("limit") ?? "12", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 24) : 12;

  const minPrice = minPriceRaw ? Number(minPriceRaw) : null;
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : null;

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("studies")
      .select("id, title, description, source, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return Response.json(
        {
          degraded: true,
          total: 0,
          filters: {
            locationZone: locationZone ?? null,
            minPrice,
            maxPrice,
            limit,
          },
          listings: [],
        },
        { status: 200 }
      );
    }

    const listings = ((data ?? []) as StudyRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      locationZone: "global",
      quantityAvailable: 1,
      unit: "Studie",
      provider: row.source ?? "unbekannt",
      cheapestPrice: 0,
      updatedAt: row.created_at ?? new Date().toISOString(),
    }));

    return Response.json({
      degraded: false,
      total: listings.length,
      filters: {
        locationZone: locationZone ?? null,
        minPrice,
        maxPrice,
        limit,
      },
      listings,
    });
  } catch {
    return Response.json(
      {
        degraded: true,
        total: 0,
        filters: {
          locationZone: locationZone ?? null,
          minPrice,
          maxPrice,
          limit,
        },
        listings: [],
      },
      { status: 200 }
    );
  }
}
