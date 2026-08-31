// ────────────────────────────────────────────────────────────────────────────
// GET   /api/admin/control  — feature flags + decision log
// PATCH /api/admin/control  — toggle one feature flag
//
// Steuerung module (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §4.8 / §5).
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseBody } from "@/lib/admin/http";
import { withAudit, diffFields } from "@/lib/admin/audit";
import type { AdminControl, DecisionEntry } from "@/lib/admin/contracts";
import { flagPatchSchema } from "@/lib/admin/contracts";
import {
  FEATURE_FLAGS_TABLE,
  getAllFeatureFlags,
  resetFeatureFlagCache,
} from "@/lib/featureFlags";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type DecisionRow = {
  id: string;
  title: string;
  status: DecisionEntry["status"];
  context: string | null;
  decision: string | null;
  decided_at: string | null;
  created_at: string;
};

const mapDecision = (r: DecisionRow): DecisionEntry => ({
  id: r.id,
  title: r.title,
  status: r.status,
  context: r.context,
  decision: r.decision,
  decidedAt: r.decided_at,
  createdAt: r.created_at,
});

export const GET = adminRoute(async (): Promise<AdminControl> => {
  const supabase = getSupabaseServerClient();
  const [flags, decisionsRes] = await Promise.all([
    getAllFeatureFlags(),
    supabase
      .from("decision_log")
      .select("id, title, status, context, decision, decided_at, created_at")
      .order("created_at", { ascending: false }),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    flags,
    decisions: ((decisionsRes.data ?? []) as DecisionRow[]).map(mapDecision),
  };
});

export const PATCH = adminRoute(async ({ req, actor }) => {
  const input = await parseBody(req, flagPatchSchema);
  const supabase = getSupabaseServerClient();

  const flags = await getAllFeatureFlags();
  const before = flags.find((f) => f.key === input.key);

  await withAudit(
    actor,
    {
      resource: "feature_flag",
      resourceId: input.key,
      action: "toggle",
      ...diffFields({ enabled: before?.enabled }, { enabled: input.enabled }),
    },
    async () => {
      const { error } = await supabase.from(FEATURE_FLAGS_TABLE).upsert(
        {
          key: input.key,
          enabled: input.enabled,
          description: before?.description ?? null,
          updated_by: actor.userId,
        },
        { onConflict: "key" },
      );
      if (error) throw new Error(error.message);
    },
  );

  resetFeatureFlagCache();
  return { key: input.key, enabled: input.enabled };
});
