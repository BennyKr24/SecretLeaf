// ────────────────────────────────────────────────────────────────────────────
// PATCH  /api/admin/content/studies/[id] — edit / review a study
// DELETE /api/admin/content/studies/[id] — remove a study
//
// Ported from POST /api/admin/dashboard `case "study-update" | "study-delete"`.
// Every mutation writes one admin_audit_log row via withAudit().
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseBody, AdminHttpError } from "@/lib/admin/http";
import { withAudit, diffFields } from "@/lib/admin/audit";
import { studyUpdateSchema } from "@/lib/admin/contracts";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const STUDIES_TABLE = "studies";
type Params = { id: string };

export const PATCH = adminRoute<{ study: unknown }, Params>(async ({ req, actor, params }) => {
  const input = await parseBody(req, studyUpdateSchema);
  const supabase = getSupabaseServerClient();

  const payload: Record<string, unknown> = {};
  if (input.qualityStatus !== undefined) payload.quality_status = input.qualityStatus;
  if (input.editorialPriority !== undefined) payload.editorial_priority = input.editorialPriority;
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.tags !== undefined) payload.tags = input.tags;
  if (input.reviewNote !== undefined) payload.review_note = input.reviewNote;
  if (input.qualityStatus !== undefined) {
    payload.reviewed_at = new Date().toISOString();
    payload.reviewed_by = actor.userId;
  }

  const { data: before, error: beforeErr } = await supabase
    .from(STUDIES_TABLE)
    .select("*")
    .eq("id", params.id)
    .single();
  if (beforeErr || !before) throw new AdminHttpError(404, "Studie nicht gefunden");

  const study = await withAudit(
    actor,
    {
      resource: "study",
      resourceId: params.id,
      action: input.qualityStatus !== undefined ? "review" : "edit",
      ...diffFields(before as Record<string, unknown>, { ...(before as Record<string, unknown>), ...payload }),
    },
    async () => {
      const { data, error } = await supabase
        .from(STUDIES_TABLE)
        .update(payload)
        .eq("id", params.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  );

  return { study };
});

export const DELETE = adminRoute<{ deleted: true }, Params>(async ({ actor, params }) => {
  const supabase = getSupabaseServerClient();

  const { data: before } = await supabase.from(STUDIES_TABLE).select("*").eq("id", params.id).single();

  await withAudit(
    actor,
    { resource: "study", resourceId: params.id, action: "delete", before: before ?? null },
    async () => {
      const { error } = await supabase.from(STUDIES_TABLE).delete().eq("id", params.id);
      if (error) throw new Error(error.message);
    },
  );

  return { deleted: true };
});
