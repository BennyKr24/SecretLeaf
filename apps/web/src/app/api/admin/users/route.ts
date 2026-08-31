// ────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users
//
// Server-side filter / sort / paginate over the admin_users_v view (fixes
// the old bug where search only saw the current 25-row page). Real total.
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §4.4)
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseQuery } from "@/lib/admin/http";
import {
  adminUsersQuerySchema,
  buildListResponse,
  type AdminListResponse,
  type AdminUserRow,
} from "@/lib/admin/contracts";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const VIEW = "admin_users_v";
const SORTABLE = new Set(["created_at", "last_sign_in_at", "email"]);

type ViewRow = {
  id: string;
  email: string | null;
  role: AdminUserRow["role"];
  banned: boolean;
  plan: AdminUserRow["plan"];
  sub_status: string | null;
  current_period_end: string | null;
  email_confirmed: boolean;
  provider: string;
  created_at: string;
  last_sign_in_at: string | null;
};

export const GET = adminRoute(async ({ url }): Promise<AdminListResponse<AdminUserRow>> => {
  const q = parseQuery(url, adminUsersQuerySchema);
  const supabase = getSupabaseServerClient();

  const sortBy = q.sortBy && SORTABLE.has(q.sortBy) ? q.sortBy : "created_at";
  const from = (q.page - 1) * q.limit;

  let query = supabase.from(VIEW).select("*", { count: "exact" });
  if (q.search) query = query.ilike("email", `%${q.search}%`);
  if (q.role) query = query.eq("role", q.role);
  if (q.plan) query = query.eq("plan", q.plan);
  query = query.order(sortBy, { ascending: q.sortDir === "asc" }).range(from, from + q.limit - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const rows: AdminUserRow[] = ((data ?? []) as ViewRow[]).map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role,
    banned: r.banned,
    plan: r.plan,
    subStatus: r.sub_status,
    currentPeriodEnd: r.current_period_end,
    emailConfirmed: r.email_confirmed,
    provider: r.provider,
    createdAt: r.created_at,
    lastSignInAt: r.last_sign_in_at,
  }));

  return buildListResponse(rows, count ?? rows.length, q);
});
