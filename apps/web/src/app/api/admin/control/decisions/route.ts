// ────────────────────────────────────────────────────────────────────────────
// POST  /api/admin/control/decisions  — add an open decision
// PATCH /api/admin/control/decisions  — set status / record the decision
//
// Decision log (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §5).
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseBody, AdminHttpError } from "@/lib/admin/http";
import { withAudit } from "@/lib/admin/audit";
import { decisionCreateSchema, decisionPatchSchema } from "@/lib/admin/contracts";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export const POST = adminRoute(async ({ req, actor }) => {
  const input = await parseBody(req, decisionCreateSchema);
  const supabase = getSupabaseServerClient();

  const row = await withAudit(
    actor,
    { resource: "decision", action: "create", after: { title: input.title } },
    async () => {
      const { data, error } = await supabase
        .from("decision_log")
        .insert({ title: input.title, context: input.context ?? null, created_by: actor.userId })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return data as { id: string };
    },
  );

  return { id: row.id };
});

export const PATCH = adminRoute(async ({ req, actor }) => {
  const input = await parseBody(req, decisionPatchSchema);
  if (input.status === undefined && input.decision === undefined) {
    throw new AdminHttpError(400, "Nichts zu ändern");
  }
  const supabase = getSupabaseServerClient();

  const patch: Record<string, unknown> = {};
  if (input.status !== undefined) {
    patch.status = input.status;
    patch.decided_at = input.status === "decided" ? new Date().toISOString() : null;
  }
  if (input.decision !== undefined) patch.decision = input.decision;

  await withAudit(
    actor,
    { resource: "decision", resourceId: input.id, action: "update", after: patch },
    async () => {
      const { error } = await supabase.from("decision_log").update(patch).eq("id", input.id);
      if (error) throw new Error(error.message);
    },
  );

  return { id: input.id };
});
