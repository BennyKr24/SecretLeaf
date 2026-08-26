// ──────────────────────────────────────────────────────────────────────────────
// Billing – Self-serve Pro trial
// ──────────────────────────────────────────────────────────────────────────────
//
// POST /api/billing/trial (Authorization: Bearer <supabase access token>)
//
// One-time, self-serve 30-day Pro trial. Writes the same `subscriptions` row
// that getUserSubscription() reads — status "trialing" with a future
// `current_period_end`, so it expires on its own with NO cron. `source` is
// "trial" and `trial_redeemed_at` is stamped so the trial can never be taken
// twice, even after it has lapsed.
// ──────────────────────────────────────────────────────────────────────────────

import { getAuthenticatedUser } from "@/lib/serverAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { TRIAL_DAYS, SUBSCRIPTIONS_TABLE } from "@/lib/billing";
import { logError, logInfo, logWarn } from "@/lib/log";

export const dynamic = "force-dynamic";

type ExistingSubRow = {
  status: string;
  current_period_end: string | null;
  trial_redeemed_at: string | null;
};

const ENTITLED_STATUSES = ["active", "trialing"];

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    logWarn("billing.trial.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.user.id;
  const supabase = getSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from(SUBSCRIPTIONS_TABLE)
      .select("status, current_period_end, trial_redeemed_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    const existing = (data as ExistingSubRow | null) ?? null;

    if (existing) {
      if (existing.trial_redeemed_at != null) {
        return Response.json({ error: "trial_already_used" }, { status: 409 });
      }

      const notExpired =
        existing.current_period_end == null ||
        new Date(existing.current_period_end).getTime() > Date.now();

      if (ENTITLED_STATUSES.includes(existing.status) && notExpired) {
        return Response.json({ error: "already_pro" }, { status: 409 });
      }
    }

    const now = new Date();
    const currentPeriodEnd = new Date(
      now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    const { error: upsertError } = await supabase.from(SUBSCRIPTIONS_TABLE).upsert(
      {
        user_id: userId,
        plan: "pro",
        status: "trialing",
        source: "trial",
        current_period_end: currentPeriodEnd,
        trial_redeemed_at: now.toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    logInfo("billing.trial.activated", { userId });
    return Response.json({ plan: "pro", status: "trialing", currentPeriodEnd });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to activate trial";
    logError("billing.trial.failed", { message, userId });
    return Response.json({ error: message }, { status: 500 });
  }
}
