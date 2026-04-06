import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type StudyPreviewRow = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  created_at: string | null;
};

type AutomationRunRow = {
  finished_at: string;
};

function pct(value: number): number {
  return Number(value.toFixed(1));
}

export async function GET() {
  const generatedAt = new Date().toISOString();

  try {
    const supabase = getSupabaseServerClient();

    const [
      totalStudiesResult,
      goodStudiesResult,
      pendingStudiesResult,
      providerCountResult,
      latestStudiesResult,
      latestSyncRunResult,
    ] = await Promise.all([
      supabase.from("studies").select("id", { count: "exact", head: true }),
      supabase.from("studies").select("id", { count: "exact", head: true }).eq("quality_status", "good"),
      supabase.from("studies").select("id", { count: "exact", head: true }).eq("quality_status", "pending"),
      supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "PROVIDER"),
      supabase
        .from("studies")
        .select("id, title, description, source, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("automation_job_runs")
        .select("finished_at")
        .eq("job_name", "studies-sync")
        .eq("success", true)
        .order("finished_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (
      totalStudiesResult.error ||
      goodStudiesResult.error ||
      pendingStudiesResult.error ||
      providerCountResult.error ||
      latestStudiesResult.error
    ) {
      return Response.json(
        {
          generatedAt,
          degraded: true,
          stats: {
            activeListings: 0,
            providers: 0,
            privacyMode: "minimal-logging",
            totalStudies: 0,
            goodStudies: 0,
            pendingStudies: 0,
            studyCoveragePercent: 0,
            latestStudyAt: null,
          },
          featuredListings: [],
        },
        { status: 200 }
      );
    }

    const totalStudies = totalStudiesResult.count ?? 0;
    const goodStudies = goodStudiesResult.count ?? 0;
    const pendingStudies = pendingStudiesResult.count ?? 0;
    const providerCount = providerCountResult.count ?? 0;
    const studyCoveragePercent = totalStudies > 0 ? pct((goodStudies / totalStudies) * 100) : 0;

    const latestRows = (latestStudiesResult.data ?? []) as StudyPreviewRow[];
    const latestSyncRun = latestSyncRunResult.error ? null : ((latestSyncRunResult.data ?? null) as AutomationRunRow | null);
    const latestStudyAt = latestSyncRun?.finished_at ?? latestRows[0]?.created_at ?? null;

    return Response.json({
      generatedAt,
      degraded: false,
      stats: {
        activeListings: totalStudies,
        providers: providerCount,
        privacyMode: "minimal-logging",
        totalStudies,
        goodStudies,
        pendingStudies,
        studyCoveragePercent,
        latestStudyAt,
      },
      featuredListings: latestRows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        locationZone: "global",
        quantityAvailable: 1,
        unit: "Studie",
        provider: row.source ?? "unbekannt",
        cheapestPrice: 0,
        updatedAt: row.created_at ?? generatedAt,
      })),
    });
  } catch {
    return Response.json(
      {
        generatedAt,
        degraded: true,
        stats: {
          activeListings: 0,
          providers: 0,
          privacyMode: "minimal-logging",
          totalStudies: 0,
          goodStudies: 0,
          pendingStudies: 0,
          studyCoveragePercent: 0,
          latestStudyAt: null,
        },
        featuredListings: [],
      },
      { status: 200 }
    );
  }
}
