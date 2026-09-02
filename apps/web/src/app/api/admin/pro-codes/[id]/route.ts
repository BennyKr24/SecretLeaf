// ────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/pro-codes/[id] — activate/deactivate a code
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseBody } from "@/lib/admin/http";
import { withAudit } from "@/lib/admin/audit";
import { proCodePatchSchema } from "@/lib/admin/contracts";
import { PRO_CODES_TABLE } from "@/lib/billing";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Params = { id: string };

export const PATCH = adminRoute<{ id: string }, Params>(async ({ req, actor, params }) => {
  const input = await parseBody(req, proCodePatchSchema);
  const supabase = getSupabaseServerClient();

  await withAudit(
    actor,
    { resource: "pro_code", resourceId: params.id, action: "toggle", after: { active: input.active } },
    async () => {
      const { error } = await supabase.from(PRO_CODES_TABLE).update({ active: input.active }).eq("id", params.id);
      if (error) throw new Error(error.message);
    },
  );

  return { id: params.id, active: input.active };
});
