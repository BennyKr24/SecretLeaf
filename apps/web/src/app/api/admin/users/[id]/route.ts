// ────────────────────────────────────────────────────────────────────────────
// GET    /api/admin/users/[id]  — detail drawer (view row + product activity)
// PATCH  /api/admin/users/[id]  — role / ban / grant-or-revoke Pro
// DELETE /api/admin/users/[id]  — delete the account
//
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §4.4). Every mutation is withAudit()-wrapped
// and guards the acting admin against locking/deleting themselves.
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseBody, AdminHttpError } from "@/lib/admin/http";
import { withAudit, recordAuditEntry, diffFields } from "@/lib/admin/audit";
import { adminUserPatchSchema, type AdminUserDetail } from "@/lib/admin/contracts";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Params = { id: string };

async function viewRow(id: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("admin_users_v").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Record<string, unknown> | null;
}

export const GET = adminRoute<AdminUserDetail, Params>(async ({ params }) => {
  const supabase = getSupabaseServerClient();
  const row = await viewRow(params.id);
  if (!row) throw new AdminHttpError(404, "Nutzer nicht gefunden");

  const [growsRes, logsRes, lastLogRes, lastDiagRes] = await Promise.all([
    supabase.from("grows").select("id", { count: "exact", head: true }).eq("user_id", params.id),
    supabase.from("log_entries").select("id", { count: "exact", head: true }).eq("user_id", params.id),
    supabase
      .from("log_entries")
      .select("logged_at")
      .eq("user_id", params.id)
      .order("logged_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("diagnoses")
      .select("created_at")
      .eq("user_id", params.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    id: row.id as string,
    email: (row.email as string) ?? null,
    role: row.role as AdminUserDetail["role"],
    banned: row.banned as boolean,
    plan: row.plan as AdminUserDetail["plan"],
    subStatus: (row.sub_status as string) ?? null,
    currentPeriodEnd: (row.current_period_end as string) ?? null,
    emailConfirmed: row.email_confirmed as boolean,
    provider: row.provider as string,
    createdAt: row.created_at as string,
    lastSignInAt: (row.last_sign_in_at as string) ?? null,
    stripeCustomerId: (row.stripe_customer_id as string) ?? null,
    grows: growsRes.count ?? 0,
    logEntries: logsRes.count ?? 0,
    lastLogAt: (lastLogRes.data as { logged_at?: string } | null)?.logged_at ?? null,
    lastDiagnosisAt: (lastDiagRes.data as { created_at?: string } | null)?.created_at ?? null,
  };
});

export const PATCH = adminRoute<{ id: string }, Params>(async ({ req, actor, params }) => {
  const input = await parseBody(req, adminUserPatchSchema);
  const supabase = getSupabaseServerClient();
  const self = params.id === actor.userId;

  const before = await viewRow(params.id);
  if (!before) throw new AdminHttpError(404, "Nutzer nicht gefunden");

  if (self && input.role !== undefined && input.role !== "ADMIN") {
    throw new AdminHttpError(400, "Du kannst deine eigene Admin-Rolle nicht entfernen.");
  }
  if (self && input.banned === true) {
    throw new AdminHttpError(400, "Du kannst dich nicht selbst sperren.");
  }

  const afterState: Record<string, unknown> = {};

  if (input.role !== undefined || input.banned !== undefined) {
    const patch: Record<string, unknown> = { user_id: params.id };
    if (input.role !== undefined) {
      patch.role = input.role;
      afterState.role = input.role;
    }
    if (input.banned !== undefined) {
      patch.banned = input.banned;
      afterState.banned = input.banned;
    }
    const { error } = await supabase.from("user_roles").upsert(patch, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
  }

  if (input.grantPro !== undefined) {
    if (input.grantPro) {
      // `source` left to its column default — the subscriptions_source_check
      // constraint only allows stripe/trial/code, and this is a comp grant.
      const { error } = await supabase.from("subscriptions").upsert(
        { user_id: params.id, plan: "pro", status: "active" },
        { onConflict: "user_id" },
      );
      if (error) throw new Error(error.message);
      afterState.plan = "pro";
    } else {
      const { error } = await supabase
        .from("subscriptions")
        .update({ plan: "free", status: "canceled" })
        .eq("user_id", params.id);
      if (error) throw new Error(error.message);
      afterState.plan = "free";
    }
  }

  await recordAuditEntry(actor, {
    resource: "user",
    resourceId: params.id,
    action: "update",
    ...diffFields(
      { role: before.role, banned: before.banned, plan: before.plan },
      {
        role: afterState.role ?? before.role,
        banned: afterState.banned ?? before.banned,
        plan: afterState.plan ?? before.plan,
      },
    ),
  });

  return { id: params.id };
});

export const DELETE = adminRoute<{ id: string }, Params>(async ({ actor, params }) => {
  if (params.id === actor.userId) {
    throw new AdminHttpError(400, "Du kannst deinen eigenen Account nicht löschen.");
  }
  const supabase = getSupabaseServerClient();

  await withAudit(
    actor,
    { resource: "user", resourceId: params.id, action: "delete" },
    async () => {
      await supabase.from("user_roles").delete().eq("user_id", params.id);
      const { error } = await supabase.auth.admin.deleteUser(params.id);
      if (error) throw new Error(error.message);
    },
  );

  return { id: params.id, deleted: true };
});
