import { getCronSecret } from "@/lib/env";
import { logError, logWarn } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

function isCronAuthorized(req: Request, configuredSecret: string): boolean {
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization");
  const bearerToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const legacyKey =
    req.headers.get("x-cron-key") ??
    new URL(req.url).searchParams.get("x-cron-key");
  return (bearerToken ?? legacyKey) === configuredSecret;
}

type RunRow = {
  id: string;
  job_name: string;
  started_at: string;
  finished_at: string;
  success: boolean;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  attempts: number;
  source_generated_at: string | null;
  error_details: string | null;
  metadata: Record<string, unknown> | null;
};

function hoursSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Number(((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60)).toFixed(1)));
}

export async function GET(req: Request) {
  let configuredSecret: string;
  try {
    configuredSecret = getCronSecret();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing CRON secret";
    logError("automation.health.misconfigured", { message });
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  if (!isCronAuthorized(req, configuredSecret)) {
    logWarn("automation.health.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("automation_job_runs")
      .select("id, job_name, started_at, finished_at, success, fetched, inserted, updated, skipped, attempts, source_generated_at, error_details, metadata")
      .order("finished_at", { ascending: false })
      .limit(30);

    if (error) {
      const relationMissing = error.message.toLowerCase().includes("automation_job_runs");
      if (relationMissing) {
        const { count, error: countError } = await supabase
          .from("studies")
          .select("id", { count: "exact", head: true });

        if (countError) {
          return Response.json({ ok: false, error: countError.message }, { status: 500 });
        }

        return Response.json({
          ok: true,
          warning: "automation_job_runs table is missing; apply migration 202604060005_automation_runs.sql",
          now: new Date().toISOString(),
          jobs: {
            studiesSync: {
              lastRunAt: null,
              lastRunSuccess: null,
              insertedLastRun: 0,
              updatedLastRun: 0,
              fetchedLastRun: 0,
              freshnessHours: null,
            },
            studyRefresh: {
              lastRunAt: null,
              lastRunSuccess: null,
              freshnessHours: null,
            },
          },
          fallback: {
            studiesCount: count ?? 0,
          },
          recentRuns: [],
        });
      }

      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    const runs = (data ?? []) as RunRow[];
    const byJob: Record<string, RunRow[]> = {};
    for (const run of runs) {
      const bucket = byJob[run.job_name] ?? [];
      bucket.push(run);
      byJob[run.job_name] = bucket;
    }

    const getLatest = (job: string): RunRow | null => (byJob[job] ?? [])[0] ?? null;
    const latestSync = getLatest("studies-sync");
    const latestRefresh = getLatest("study-refresh");

    const latestSuccessSync = (byJob["studies-sync"] ?? []).find((run) => run.success) ?? null;
    const latestErrorSync = (byJob["studies-sync"] ?? []).find((run) => !run.success) ?? null;

    return Response.json({
      ok: true,
      now: new Date().toISOString(),
      jobs: {
        studiesSync: {
          lastRunAt: latestSync?.finished_at ?? null,
          lastRunSuccess: latestSync?.success ?? null,
          lastSuccessAt: latestSuccessSync?.finished_at ?? null,
          lastErrorAt: latestErrorSync?.finished_at ?? null,
          lastError: latestErrorSync?.error_details ?? null,
          insertedLastRun: latestSync?.inserted ?? 0,
          updatedLastRun: latestSync?.updated ?? 0,
          fetchedLastRun: latestSync?.fetched ?? 0,
          sourceGeneratedAt: latestSync?.source_generated_at ?? null,
          freshnessHours: hoursSince(latestSync?.finished_at ?? null),
          sourceFreshnessHours: hoursSince(latestSync?.source_generated_at ?? null),
        },
        studyRefresh: {
          lastRunAt: latestRefresh?.finished_at ?? null,
          lastRunSuccess: latestRefresh?.success ?? null,
          freshnessHours: hoursSince(latestRefresh?.finished_at ?? null),
        },
      },
      recentRuns: runs.slice(0, 12),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Automation health check failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
