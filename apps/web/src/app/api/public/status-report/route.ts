import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type RiskLevel = "green" | "yellow" | "red";

type AutomationRunRow = {
  finished_at: string;
  inserted: number;
  updated: number;
  fetched: number;
};

function eventLevelByThresholds(value: number, yellowFrom: number, redFrom: number): RiskLevel {
  if (value >= redFrom) return "red";
  if (value >= yellowFrom) return "yellow";
  return "green";
}

function freshnessLevel(hoursOld: number): RiskLevel {
  if (hoursOld > 72) return "red";
  if (hoursOld > 24) return "yellow";
  return "green";
}

function worstLevel(levels: RiskLevel[]): RiskLevel {
  if (levels.includes("red")) return "red";
  if (levels.includes("yellow")) return "yellow";
  return "green";
}

export async function GET() {
  const now = new Date();
  const generatedAt = now.toISOString();

  try {
    const supabase = getSupabaseServerClient();

    const [
      latestStudyResult,
      totalResult,
      pendingResult,
      badResult,
      last24hResult,
      latestSyncRunResult,
      syncRuns24hResult,
    ] = await Promise.all([
      supabase.from("studies").select("created_at").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("studies").select("id", { count: "exact", head: true }),
      supabase.from("studies").select("id", { count: "exact", head: true }).eq("quality_status", "pending"),
      supabase.from("studies").select("id", { count: "exact", head: true }).eq("quality_status", "bad"),
      supabase.from("studies").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from("automation_job_runs")
        .select("finished_at, inserted, updated, fetched")
        .eq("job_name", "studies-sync")
        .eq("success", true)
        .order("finished_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("automation_job_runs")
        .select("finished_at, inserted, updated, fetched")
        .eq("job_name", "studies-sync")
        .eq("success", true)
        .gte("finished_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("finished_at", { ascending: false }),
    ]);

    if (
      latestStudyResult.error ||
      totalResult.error ||
      pendingResult.error ||
      badResult.error ||
      last24hResult.error
    ) {
      return Response.json(
        {
          generatedAt,
          windowDays: 30,
          degraded: true,
          overallStatus: "yellow",
          services: {
            api: "green",
            db: "red",
          },
          events: [
            {
              key: "SYSTEM_DEGRADED",
              label: "Eingeschränkte Sicht auf Live-Daten",
              count: 1,
              level: "yellow",
              description: "Statusreport im Fallback, da DB-Metriken nicht vollständig abrufbar sind.",
              lastSeen: generatedAt,
            },
          ],
        },
        { status: 200 }
      );
    }

    const total = totalResult.count ?? 0;
    const pending = pendingResult.count ?? 0;
    const bad = badResult.count ?? 0;
    const last24hCreated = last24hResult.count ?? 0;
    const latestStudyAt = latestStudyResult.data?.created_at ?? null;
    const latestSyncRun = latestSyncRunResult.error ? null : ((latestSyncRunResult.data ?? null) as AutomationRunRow | null);
    const syncRuns24h = syncRuns24hResult.error ? [] : ((syncRuns24hResult.data ?? []) as AutomationRunRow[]);

    const importedLast24hFromRuns = syncRuns24h.reduce(
      (sum, run) => sum + Math.max(0, run.inserted + run.updated),
      0
    );
    const importedLast24h = importedLast24hFromRuns > 0 ? importedLast24hFromRuns : last24hCreated;

    const freshnessSourceIso = latestSyncRun?.finished_at ?? latestStudyAt;
    const freshnessHours = freshnessSourceIso
      ? Math.max(0, Math.floor((Date.now() - new Date(freshnessSourceIso).getTime()) / (1000 * 60 * 60)))
      : 999;

    const freshness = freshnessLevel(freshnessHours);
    const backlog = eventLevelByThresholds(pending, 40, 120);
    const badQuality = eventLevelByThresholds(bad, 5, 20);
    const syncActivity = syncRuns24h.length === 0 && last24hCreated === 0 ? "yellow" : "green";

    const events = [
      {
        key: "DATA_FRESHNESS",
        label: "Datenfrische Studienimport",
        count: freshnessHours,
        level: freshness,
        description: latestStudyAt
          ? `Letzter erfolgreicher Sync ist ${freshnessHours}h alt.`
          : "Es liegt noch kein Studieneintrag vor.",
        lastSeen: freshnessSourceIso,
      },
      {
        key: "REVIEW_BACKLOG",
        label: "Offene Studien-Reviews",
        count: pending,
        level: backlog,
        description: "Anzahl Studien mit Qualitätsstatus pending.",
        lastSeen: generatedAt,
      },
      {
        key: "QUALITY_ALERT",
        label: "Schwach bewertete Studien",
        count: bad,
        level: badQuality,
        description: "Anzahl Studien mit Qualitätsstatus bad.",
        lastSeen: generatedAt,
      },
      {
        key: "SYNC_ACTIVITY_24H",
        label: "Importaktivität letzte 24h",
        count: importedLast24h,
        level: syncActivity,
        description:
          syncRuns24h.length > 0
            ? `Erfolgreiche Sync-Runs letzte 24h: ${syncRuns24h.length}, geänderte Studien: ${importedLast24h}.`
            : `Fallback ohne Run-Telemetrie: neu erstellte Studien letzte 24h: ${last24hCreated}.`,
        lastSeen: latestSyncRun?.finished_at ?? generatedAt,
      },
      {
        key: "TOTAL_STUDIES",
        label: "Gesamtbestand Studien",
        count: total,
        level: "green" as RiskLevel,
        description: "Aktuell erfasste Studien in der Datenbank.",
        lastSeen: generatedAt,
      },
    ];

    const overallStatus = worstLevel(events.map((event) => event.level as RiskLevel));

    return Response.json({
      generatedAt,
      windowDays: 30,
      degraded: false,
      overallStatus,
      services: {
        api: "green",
        db: "green",
      },
      events,
    });
  } catch {
    return Response.json(
      {
        generatedAt,
        windowDays: 30,
        degraded: true,
        overallStatus: "red",
        services: {
          api: "red",
          db: "red",
        },
        events: [
          {
            key: "STATUS_REPORT_EXCEPTION",
            label: "Statusreport Fehler",
            count: 1,
            level: "red",
            description: "Statusreport konnte nicht berechnet werden.",
            lastSeen: generatedAt,
          },
        ],
      },
      { status: 200 }
    );
  }
}
