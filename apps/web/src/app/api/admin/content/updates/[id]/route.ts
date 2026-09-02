// ────────────────────────────────────────────────────────────────────────────
// PATCH  /api/admin/content/updates/[id]  — edit core fields / toggle flags
// DELETE /api/admin/content/updates/[id]
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseBody, AdminHttpError } from "@/lib/admin/http";
import { withAudit } from "@/lib/admin/audit";
import { updatePatchSchema } from "@/lib/admin/contracts";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Params = { id: string };

export const PATCH = adminRoute<{ id: string }, Params>(async ({ req, actor, params }) => {
  const input = await parseBody(req, updatePatchSchema);
  const supabase = getSupabaseServerClient();

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.summary !== undefined) patch.summary = input.summary;
  if (input.category !== undefined) patch.category = input.category;
  if (input.date !== undefined) patch.date = input.date;
  if (input.version !== undefined) patch.version = input.version || null;
  if (input.slug !== undefined) patch.slug = input.slug;
  if (input.published !== undefined) patch.published = input.published;
  if (input.featured !== undefined) patch.featured = input.featured;
  if (input.banner !== undefined) patch.banner = input.banner;
  if (input.bannerStartsAt !== undefined) patch.banner_starts_at = input.bannerStartsAt;
  if (input.bannerEndsAt !== undefined) patch.banner_ends_at = input.bannerEndsAt;

  if (Object.keys(patch).length === 0) throw new AdminHttpError(400, "Nichts zu ändern");

  if (input.featured === true) {
    await supabase.from("updates").update({ featured: false }).eq("featured", true).neq("id", params.id);
  }

  await withAudit(
    actor,
    { resource: "update", resourceId: params.id, action: "update", after: patch },
    async () => {
      const { error } = await supabase.from("updates").update(patch).eq("id", params.id);
      if (error) {
        if (error.code === "23505") throw new AdminHttpError(409, "Slug existiert schon.");
        throw new Error(error.message);
      }
    },
  );

  return { id: params.id };
});

export const DELETE = adminRoute<{ id: string }, Params>(async ({ actor, params }) => {
  const supabase = getSupabaseServerClient();
  await withAudit(
    actor,
    { resource: "update", resourceId: params.id, action: "delete" },
    async () => {
      const { error } = await supabase.from("updates").delete().eq("id", params.id);
      if (error) throw new Error(error.message);
    },
  );
  return { id: params.id, deleted: true };
});
