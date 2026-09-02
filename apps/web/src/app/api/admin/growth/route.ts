// ────────────────────────────────────────────────────────────────────────────
// GET /api/admin/growth — signup funnel + Free→Pro conversion trend
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §4.3)
//
// Independent per-stage counts, not a strict SQL funnel join — a user with a
// log_entries row necessarily has a grows row (FK), so the stages are already
// monotonic by construction. Retention cohorts and cancellation reasons need
// data this schema doesn't capture yet (no cancellation_reason column, no
// per-period activity rollup) — deliberately out of scope for this pass.
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute } from "@/lib/admin/http";
import type { AdminGrowth, GrowthFunnelStage, GrowthMonth } from "@/lib/admin/contracts";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const MONTHS_BACK = 6;

const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

function lastMonths(n: number): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))));
  }
  return out;
}

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

export const GET = adminRoute(async (): Promise<AdminGrowth> => {
  const supabase = getSupabaseServerClient();

  const [usersRes, growsRes, logsRes, subsRes] = await Promise.all([
    supabase.from("admin_users_v").select("id, email_confirmed, plan, sub_status, created_at"),
    supabase.from("grows").select("user_id"),
    supabase.from("log_entries").select("user_id"),
    supabase.from("subscriptions").select("plan, created_at").eq("plan", "pro"),
  ]);

  type UserRow = { id: string; email_confirmed: boolean; plan: string; sub_status: string | null; created_at: string };
  const users = (usersRes.data ?? []) as UserRow[];
  const growUsers = new Set(((growsRes.data ?? []) as Array<{ user_id: string }>).map((r) => r.user_id));
  const logUsers = new Set(((logsRes.data ?? []) as Array<{ user_id: string }>).map((r) => r.user_id));
  const proSubs = (subsRes.data ?? []) as Array<{ plan: string; created_at: string }>;

  // ── Funnel ────────────────────────────────────────────────────────────────
  const totalUsers = users.length;
  const confirmedUsers = users.filter((u) => u.email_confirmed).length;
  const grewUsers = users.filter((u) => growUsers.has(u.id)).length;
  const loggedUsers = users.filter((u) => logUsers.has(u.id)).length;
  const proUsers = users.filter((u) => u.plan === "pro" && u.sub_status === "active").length;

  const stageDefs = [
    { key: "signup", label: "Registriert", users: totalUsers },
    { key: "confirmed", label: "E-Mail bestätigt", users: confirmedUsers },
    { key: "grow", label: "Erster Grow", users: grewUsers },
    { key: "log", label: "Erster Log-Eintrag", users: loggedUsers },
    { key: "pro", label: "Pro", users: proUsers },
  ];

  const funnel: GrowthFunnelStage[] = stageDefs.map((s, i) => ({
    key: s.key,
    label: s.label,
    users: s.users,
    pctOfTotal: pct(s.users, totalUsers),
    pctOfPrevious: i === 0 ? null : pct(s.users, stageDefs[i - 1]!.users),
  }));

  const activationPct = pct(loggedUsers, totalUsers);

  // ── Monthly Free→Pro conversion trend ───────────────────────────────────
  const months = lastMonths(MONTHS_BACK);
  const bucket = new Map<string, { newSignups: number; newPro: number }>();
  for (const m of months) bucket.set(m, { newSignups: 0, newPro: 0 });

  for (const u of users) {
    const m = u.created_at.slice(0, 7);
    const b = bucket.get(m);
    if (b) b.newSignups += 1;
  }
  for (const s of proSubs) {
    const m = s.created_at.slice(0, 7);
    const b = bucket.get(m);
    if (b) b.newPro += 1;
  }

  const monthRows: GrowthMonth[] = months.map((m) => {
    const b = bucket.get(m)!;
    return { month: m, newSignups: b.newSignups, newPro: b.newPro, conversionPct: pct(b.newPro, b.newSignups) };
  });

  return {
    generatedAt: new Date().toISOString(),
    funnel,
    activationPct,
    months: monthRows,
  };
});
