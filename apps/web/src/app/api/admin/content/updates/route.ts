// ────────────────────────────────────────────────────────────────────────────
// GET  /api/admin/content/updates  — all updates (incl. unpublished)
// POST /api/admin/content/updates  — create one
//
// Neuigkeiten-Editor (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §4.5). The `updates`
// table is the source of truth for /updates and the /status "Neuigkeiten"
// block.
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseBody, AdminHttpError } from "@/lib/admin/http";
import { withAudit } from "@/lib/admin/audit";
import { updateCreateSchema, type AdminUpdatesResponse, type AdminUpdate } from "@/lib/admin/contracts";
import { getCategoryMeta } from "@/lib/updates";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  version: string | null;
  date: string;
  title: string;
  summary: string;
  category: string;
  featured: boolean;
  published: boolean;
  sections: Record<string, unknown> | null;
  banner: boolean;
  banner_starts_at: string | null;
  banner_ends_at: string | null;
  updated_at: string;
};

const mapRow = (r: Row): AdminUpdate => ({
  id: r.id,
  slug: r.slug,
  version: r.version,
  date: typeof r.date === "string" ? r.date.slice(0, 10) : r.date,
  title: r.title,
  summary: r.summary,
  category: r.category,
  featured: r.featured,
  published: r.published,
  hasSections: !!r.sections && Object.keys(r.sections).length > 0,
  banner: r.banner,
  bannerStartsAt: r.banner_starts_at,
  bannerEndsAt: r.banner_ends_at,
  updatedAt: r.updated_at,
});

export const GET = adminRoute(async (): Promise<AdminUpdatesResponse> => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("updates")
    .select(
      "id, slug, version, date, title, summary, category, featured, published, sections, banner, banner_starts_at, banner_ends_at, updated_at",
    )
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);

  return {
    updates: ((data ?? []) as Row[]).map(mapRow),
    categories: Object.keys(getCategoryMeta()),
  };
});

export const POST = adminRoute(async ({ req, actor }) => {
  const input = await parseBody(req, updateCreateSchema);
  const supabase = getSupabaseServerClient();

  // "featured" is single-slot: clear the others first.
  if (input.featured) {
    await supabase.from("updates").update({ featured: false }).eq("featured", true);
  }

  const row = await withAudit(
    actor,
    { resource: "update", resourceId: input.slug, action: "create", after: { ...input } },
    async () => {
      const { data, error } = await supabase
        .from("updates")
        .insert({
          slug: input.slug,
          title: input.title,
          summary: input.summary,
          category: input.category,
          date: input.date,
          version: input.version ?? null,
          featured: input.featured ?? false,
          published: input.published ?? true,
          banner: input.banner ?? false,
          banner_starts_at: input.bannerStartsAt ?? null,
          banner_ends_at: input.bannerEndsAt ?? null,
          created_by: actor.userId,
        })
        .select("id")
        .single();
      if (error) {
        if (error.code === "23505") throw new AdminHttpError(409, `Slug „${input.slug}" existiert schon.`);
        throw new Error(error.message);
      }
      return data as { id: string };
    },
  );

  return { id: row.id };
});
