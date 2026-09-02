// ────────────────────────────────────────────────────────────────────────────
// GET  /api/admin/pro-codes  — list codes (newest first)
// POST /api/admin/pro-codes  — generate one
//
// Admin-facing half of the trial/code entitlement path (PR #27 backend,
// docs/ADMIN_PANEL_OVERHAUL_PLAN.md). Redeeming happens client-side via
// POST /api/billing/redeem — this route only manages the codes themselves.
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseBody } from "@/lib/admin/http";
import { withAudit } from "@/lib/admin/audit";
import type { AdminProCodesResponse, ProCode } from "@/lib/admin/contracts";
import { proCodeCreateSchema } from "@/lib/admin/contracts";
import { PRO_CODES_TABLE, generateCode } from "@/lib/billing";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  code: string;
  duration_days: number;
  max_redemptions: number;
  redemption_count: number;
  note: string | null;
  expires_at: string | null;
  active: boolean;
  created_at: string;
};

const mapRow = (r: Row): ProCode => ({
  id: r.id,
  code: r.code,
  durationDays: r.duration_days,
  maxRedemptions: r.max_redemptions,
  redemptionCount: r.redemption_count,
  note: r.note,
  expiresAt: r.expires_at,
  active: r.active,
  createdAt: r.created_at,
});

export const GET = adminRoute(async (): Promise<AdminProCodesResponse> => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(PRO_CODES_TABLE)
    .select("id, code, duration_days, max_redemptions, redemption_count, note, expires_at, active, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);

  return { codes: ((data ?? []) as Row[]).map(mapRow) };
});

export const POST = adminRoute(async ({ req, actor }) => {
  const input = await parseBody(req, proCodeCreateSchema);
  const supabase = getSupabaseServerClient();

  const created = await withAudit(
    actor,
    {
      resource: "pro_code",
      action: "create",
      after: { durationDays: input.durationDays, maxRedemptions: input.maxRedemptions ?? 1, note: input.note ?? null },
    },
    async () => {
      // Collision on the random code is astronomically unlikely but retried
      // defensively — a unique-violation here is the only expected error.
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const { data, error } = await supabase
          .from(PRO_CODES_TABLE)
          .insert({
            code: generateCode(),
            duration_days: input.durationDays,
            max_redemptions: input.maxRedemptions ?? 1,
            note: input.note ?? null,
            expires_at: input.expiresAt ?? null,
            created_by: actor.userId,
          })
          .select("id, code, duration_days, max_redemptions, redemption_count, note, expires_at, active, created_at")
          .single();
        if (!error) return mapRow(data as Row);
        if (error.code !== "23505") throw new Error(error.message);
      }
      throw new Error("Konnte keinen eindeutigen Code generieren");
    },
  );

  return { code: created };
});
