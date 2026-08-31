// ────────────────────────────────────────────────────────────────────────────
// GET /api/admin/briefing
//
// The Lage / Morgen-Briefing in one call: Geld, Menschen, Content-Puls,
// die Cron-Läufe der letzten 24 h, und "was braucht heute eine Entscheidung"
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §4.1).
//
// Phase 1: alle Zahlen aus der DB. Echter Stripe-Umsatz + Kosten/Runway
// kommen in Phase 2 (money.stripeConnected = false bis dahin).
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute } from "@/lib/admin/http";
import type { AdminBriefing, BriefingRun, BriefingAttention } from "@/lib/admin/contracts";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { AUTOMATION_RUNS_TABLE } from "@/lib/automationRuns";
import { CRON_JOBS, cronIntervalMs } from "@/components/admin/cronRegistry";

export const dynamic = "force-dynamic";

const STUDIES_TABLE = "studies";
const ADMIN_ROOT = "/dashboard/admin";

/** Estimated monthly Pro price in cents — used only for the MRR *estimate*
 *  until real Stripe revenue is wired (Phase 2). Matches the pricing page. */
const PRO_MONTHLY_CENTS = 499;
const REVIEW_QUEUE_ALERT_AT = 15;

const DAY = 24 * 60 * 60 * 1000;
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

type SupabaseServer = ReturnType<typeof getSupabaseServerClient>;

/** One pass over the auth user list — returns total plus new-user counts for
 *  24 h / 7 d and the set of user ids created in the last 7 d. */
async function scanUsers(supabase: SupabaseServer) {
  const since24h = iso(DAY);
  const since7d = iso(7 * DAY);
  let total = 0;
  let new24h = 0;
  let new7d = 0;
  const newIds7d = new Set<string>();

  for (let page = 1; page <= 25; page++) {
    const { data } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    const users = data?.users ?? [];
    total += users.length;
    for (const u of users) {
      const created = u.created_at ?? "";
      if (created >= since7d) {
        new7d++;
        newIds7d.add(u.id);
        if (created >= since24h) new24h++;
      }
    }
    if (users.length < 200) break;
  }
  return { total, new24h, new7d, newIds7d };
}

export const GET = adminRoute(async (): Promise<AdminBriefing> => {
  const supabase = getSupabaseServerClient();

  const [
    users,
    subsRes,
    grows7dRes,
    activeGrowsRes,
    logs24hRes,
    pendingRes,
    newStudies24hRes,
    totalStudiesRes,
    feedback7dRes,
    runsRes,
  ] = await Promise.all([
    scanUsers(supabase),
    supabase.from("subscriptions").select("plan, status, created_at"),
    supabase.from("grows").select("user_id, created_at").gte("created_at", iso(7 * DAY)),
    supabase.from("grows").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("log_entries").select("id", { count: "exact", head: true }).gte("logged_at", iso(DAY)),
    supabase.from(STUDIES_TABLE).select("id", { count: "exact", head: true }).eq("quality_status", "pending"),
    supabase.from(STUDIES_TABLE).select("id", { count: "exact", head: true }).gte("created_at", iso(DAY)),
    supabase.from(STUDIES_TABLE).select("id", { count: "exact", head: true }),
    supabase.from("study_feedback").select("id", { count: "exact", head: true }).gte("created_at", iso(7 * DAY)),
    supabase
      .from(AUTOMATION_RUNS_TABLE)
      .select("job_name, success, started_at, finished_at, error_details")
      .gte("finished_at", iso(7 * DAY))
      .order("finished_at", { ascending: false }),
  ]);

  // ── Geld (aus subscriptions) ─────────────────────────────────────────────
  const subs = (subsRes.data ?? []) as Array<{ plan: string; status: string; created_at: string }>;
  const activePro = subs.filter((s) => s.plan === "pro" && s.status === "active").length;
  const trialing = subs.filter((s) => s.status === "trialing").length;
  const pastDue = subs.filter((s) => s.status === "past_due").length;
  const canceled30d = subs.filter((s) => s.status === "canceled" && s.created_at >= iso(30 * DAY)).length;

  // ── Menschen ─────────────────────────────────────────────────────────────
  const grows7d = (grows7dRes.data ?? []) as Array<{ user_id: string; created_at: string }>;
  const activatedNew = new Set(
    grows7d.map((g) => g.user_id).filter((id) => users.newIds7d.has(id)),
  );
  const activation7d = users.new7d > 0 ? activatedNew.size / users.new7d : 0;

  // ── Läufe der letzten 24 h + stale-Check über 7 Tage ─────────────────────
  const runRows = (runsRes.data ?? []) as Array<{
    job_name: string;
    success: boolean;
    started_at: string | null;
    finished_at: string;
    error_details: string | null;
  }>;
  const runs: BriefingRun[] = CRON_JOBS.filter((j) => j.jobName).map((job) => {
    const jobRuns = runRows.filter((r) => r.job_name === job.jobName);
    const last = jobRuns[0] ?? null;
    const lastSuccess = jobRuns.find((r) => r.success) ?? null;
    const intervalMs = cronIntervalMs(job.schedule);
    const stale =
      !lastSuccess || Date.now() - new Date(lastSuccess.finished_at).getTime() > intervalMs * 1.5;

    return {
      jobName: job.jobName as string,
      label: job.label,
      scheduleLabel: job.scheduleLabel,
      lastRun: last
        ? {
            success: last.success,
            finishedAt: last.finished_at,
            durationSeconds:
              last.started_at != null
                ? Math.max(
                    0,
                    Math.round(
                      (new Date(last.finished_at).getTime() - new Date(last.started_at).getTime()) / 1000,
                    ),
                  )
                : null,
            error: last.error_details,
          }
        : null,
      stale,
    };
  });

  // ── Was braucht Aufmerksamkeit ──────────────────────────────────────────
  const attention: BriefingAttention[] = [];
  const neverRan = runs.filter((r) => r.lastRun == null);
  const staleWithHistory = runs.filter((r) => r.lastRun != null && r.stale);

  // A job that has *never* run here is far more likely "automation isn't
  // wired on this environment" than "seven things broke" — one calm line.
  if (neverRan.length > 0 && neverRan.length === runs.length) {
    attention.push({
      severity: "info",
      text: `Automatisierung hat auf dieser Umgebung noch nie gelaufen (${neverRan.length} Jobs).`,
      href: `${ADMIN_ROOT}/engine`,
    });
  } else {
    for (const r of neverRan) {
      attention.push({
        severity: "warn",
        text: `Cron „${r.label}" hat noch nie gelaufen.`,
        href: `${ADMIN_ROOT}/engine`,
      });
    }
  }
  for (const r of staleWithHistory) {
    attention.push({
      severity: "error",
      text: `Cron „${r.label}" hat zu lange nicht erfolgreich abgeschlossen.`,
      href: `${ADMIN_ROOT}/engine`,
    });
  }
  for (const r of runs) {
    if (!r.stale && r.lastRun && !r.lastRun.success) {
      attention.push({
        severity: "warn",
        text: `Letzter Lauf von „${r.label}" ist fehlgeschlagen.`,
        href: `${ADMIN_ROOT}/engine`,
      });
    }
  }
  if (pastDue > 0) {
    attention.push({
      severity: "warn",
      text: `${pastDue} Abo${pastDue === 1 ? "" : "s"} mit offener Zahlung (past_due).`,
      href: `${ADMIN_ROOT}/users`,
    });
  }
  const pendingReview = pendingRes.count ?? 0;
  if (pendingReview >= REVIEW_QUEUE_ALERT_AT) {
    attention.push({
      severity: "info",
      text: `${pendingReview} Studien in der Review-Queue.`,
      href: `${ADMIN_ROOT}/studies?filter=pending`,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    money: {
      stripeConnected: false,
      activePro,
      trialing,
      pastDue,
      canceled30d,
      estimatedMrrCents: activePro * PRO_MONTHLY_CENTS,
    },
    people: {
      totalUsers: users.total,
      newUsers24h: users.new24h,
      newUsers7d: users.new7d,
      activeGrows: activeGrowsRes.count ?? 0,
      activation7d,
      logEntries24h: logs24hRes.count ?? 0,
    },
    content: {
      pendingReview,
      newStudies24h: newStudies24hRes.count ?? 0,
      totalStudies: totalStudiesRes.count ?? 0,
      feedbackEvents7d: feedback7dRes.count ?? 0,
    },
    runs,
    attention,
  };
});
