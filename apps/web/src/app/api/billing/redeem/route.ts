// ──────────────────────────────────────────────────────────────────────────────
// Billing – Redeem a Pro code
// ──────────────────────────────────────────────────────────────────────────────
//
// POST /api/billing/redeem (Authorization: Bearer <supabase access token>)
// Body: { code: string }
//
// Admin-generated codes (see /api/admin/pro-codes) grant a fixed
// number of Pro days. Redemption is idempotent per user via the
// UNIQUE(code_id, user_id) constraint on `pro_code_redemptions`, and a slot is
// claimed with a compare-and-swap on `redemption_count` so a code cannot be
// over-redeemed under concurrency. Time stacks: redeeming while already Pro
// extends `current_period_end` from the existing end rather than from now.
// ──────────────────────────────────────────────────────────────────────────────

import { getAuthenticatedUser } from "@/lib/serverAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  SUBSCRIPTIONS_TABLE,
  PRO_CODES_TABLE,
  PRO_CODE_REDEMPTIONS_TABLE,
  normalizeCode,
} from "@/lib/billing";
import { logError, logInfo, logWarn } from "@/lib/log";

export const dynamic = "force-dynamic";

type ProCodeRow = {
  id: string;
  code: string;
  duration_days: number;
  max_redemptions: number;
  redemption_count: number;
  expires_at: string | null;
  active: boolean;
};

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    logWarn("billing.redeem.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.user.id;
  const supabase = getSupabaseServerClient();

  let body: { code?: unknown };
  try {
    body = (await request.json()) as { code?: unknown };
  } catch {
    body = {};
  }

  const code = normalizeCode(typeof body.code === "string" ? body.code : "");
  if (!code) {
    return Response.json({ error: "invalid_code" }, { status: 400 });
  }

  try {
    // ── Look up + validate the code ──────────────────────────────────────
    const { data: codeData, error: lookupError } = await supabase
      .from(PRO_CODES_TABLE)
      .select("id, code, duration_days, max_redemptions, redemption_count, expires_at, active")
      .eq("code", code)
      .maybeSingle();

    if (lookupError) {
      throw new Error(lookupError.message);
    }

    const proCode = (codeData as ProCodeRow | null) ?? null;
    if (!proCode) {
      return Response.json({ error: "invalid_code" }, { status: 400 });
    }
    if (!proCode.active) {
      return Response.json({ error: "code_inactive" }, { status: 400 });
    }
    if (proCode.expires_at && new Date(proCode.expires_at).getTime() < Date.now()) {
      return Response.json({ error: "code_expired" }, { status: 400 });
    }
    if (proCode.redemption_count >= proCode.max_redemptions) {
      return Response.json({ error: "code_exhausted" }, { status: 400 });
    }

    // ── Record the redemption (idempotent per user) ──────────────────────
    const { error: redemptionError } = await supabase
      .from(PRO_CODE_REDEMPTIONS_TABLE)
      .insert({ code_id: proCode.id, user_id: userId });

    if (redemptionError) {
      if (redemptionError.code === "23505") {
        return Response.json({ error: "already_redeemed" }, { status: 409 });
      }
      throw new Error(redemptionError.message);
    }

    // ── Atomically claim a slot (compare-and-swap on redemption_count) ───
    const { data: claimedData, error: claimError } = await supabase
      .from(PRO_CODES_TABLE)
      .update({ redemption_count: proCode.redemption_count + 1 })
      .eq("id", proCode.id)
      .eq("redemption_count", proCode.redemption_count)
      .lt("redemption_count", proCode.max_redemptions)
      .select("id")
      .maybeSingle();

    if (claimError) {
      throw new Error(claimError.message);
    }

    if (!claimedData) {
      // Race lost — another redemption took the last slot between our read
      // and this update. Roll back the redemption row we just inserted.
      await supabase
        .from(PRO_CODE_REDEMPTIONS_TABLE)
        .delete()
        .eq("code_id", proCode.id)
        .eq("user_id", userId);
      return Response.json({ error: "code_exhausted" }, { status: 400 });
    }

    // ── Grant / extend the Pro entitlement ──────────────────────────────
    const { data: subData, error: subError } = await supabase
      .from(SUBSCRIPTIONS_TABLE)
      .select("current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    if (subError) {
      throw new Error(subError.message);
    }

    const now = Date.now();
    const existingEnd = (subData as { current_period_end: string | null } | null)?.current_period_end ?? null;
    const existingEndMs = existingEnd ? new Date(existingEnd).getTime() : 0;
    const baseMs = existingEnd && existingEndMs > now ? existingEndMs : now;
    const durationDays = proCode.duration_days;
    const currentPeriodEnd = new Date(baseMs + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const { error: upsertError } = await supabase.from(SUBSCRIPTIONS_TABLE).upsert(
      {
        user_id: userId,
        plan: "pro",
        status: "active",
        source: "code",
        current_period_end: currentPeriodEnd,
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    logInfo("billing.redeem.success", { userId, codeId: proCode.id });
    return Response.json({ plan: "pro", status: "active", currentPeriodEnd, durationDays });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to redeem code";
    logError("billing.redeem.failed", { message, userId });
    return Response.json({ error: message }, { status: 500 });
  }
}
