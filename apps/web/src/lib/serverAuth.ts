import type { User } from "@supabase/supabase-js";
import type { UserPlan, UserRole } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

const USER_ROLES_TABLE = "user_roles";
const SUBSCRIPTIONS_TABLE = "subscriptions";
const ENTITLED_STATUSES = new Set(["active", "trialing"]);

type UserRoleRow = {
  user_id: string;
  role: UserRole;
};

type SubscriptionRow = {
  plan: UserPlan;
  status: string;
  current_period_end: string | null;
  source: "stripe" | "trial" | "code" | null;
  trial_redeemed_at: string | null;
};

export type UserSubscription = {
  plan: UserPlan;
  /** Where the current entitlement came from. "stripe" also when there is no row. */
  source: "stripe" | "trial" | "code";
  /** Whether the user has ever activated the one-time self-serve trial. */
  trialRedeemed: boolean;
  /** ISO end of the current entitled period, if any (trial / code / paid-cycle end). */
  currentPeriodEnd: string | null;
};

const FREE_SUBSCRIPTION: UserSubscription = {
  plan: "free",
  source: "stripe",
  trialRedeemed: false,
  currentPeriodEnd: null,
};

function normalizeRole(value: string | null | undefined): UserRole {
  if (value === "ADMIN") return "ADMIN";
  if (value === "TEAM") return "TEAM";
  if (value === "PROVIDER") return "PROVIDER";
  return "CONSUMER";
}

export function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export async function getAuthenticatedUser(request: Request): Promise<{ token: string; user: User } | null> {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return { token, user: data.user };
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(USER_ROLES_TABLE)
    .select("user_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!error && data) {
    return normalizeRole((data as UserRoleRow).role);
  }

  const { data: inserted, error: insertError } = await supabase
    .from(USER_ROLES_TABLE)
    .upsert({ user_id: userId, role: "CONSUMER" }, { onConflict: "user_id" })
    .select("user_id, role")
    .single();

  if (insertError) {
    throw new Error(insertError.message || "Failed to resolve user role");
  }

  return normalizeRole((inserted as UserRoleRow).role);
}

/**
 * Resolves the user's effective subscription from `subscriptions`. Absence of
 * a row (never checked out / trialed) resolves to free — there is no
 * upsert-on-missing here, unlike getUserRole, because most users will never
 * have a subscriptions row.
 *
 * An entitled status ("active" | "trialing") only grants Pro while
 * `current_period_end` is still in the future (or null). This is what makes
 * self-serve trials and redeemed codes expire with NO cron — a healthy Stripe
 * `active` sub always carries a future period end, so paid users are
 * unaffected. `trialRedeemed` is reported independently of the current status
 * so the pricing page can hide the trial CTA even after a trial has lapsed.
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .select("plan, status, current_period_end, source, trial_redeemed_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return FREE_SUBSCRIPTION;
  }

  const row = data as SubscriptionRow;
  const notExpired =
    row.current_period_end == null || new Date(row.current_period_end).getTime() > Date.now();
  const entitled = ENTITLED_STATUSES.has(row.status) && notExpired;

  return {
    plan: entitled ? row.plan : "free",
    source: row.source ?? "stripe",
    trialRedeemed: row.trial_redeemed_at != null,
    currentPeriodEnd: row.current_period_end,
  };
}

/** Back-compat thin wrapper: just the effective plan. */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  return (await getUserSubscription(userId)).plan;
}

export async function getAuthenticatedUserWithRole(
  request: Request
): Promise<{
  userId: string;
  email: string | null;
  role: UserRole;
  plan: UserPlan;
  planSource: "stripe" | "trial" | "code";
  trialRedeemed: boolean;
  currentPeriodEnd: string | null;
} | null> {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    return null;
  }

  const [role, subscription] = await Promise.all([
    getUserRole(auth.user.id),
    getUserSubscription(auth.user.id),
  ]);

  return {
    userId: auth.user.id,
    email: auth.user.email ?? null,
    role,
    plan: subscription.plan,
    planSource: subscription.source,
    trialRedeemed: subscription.trialRedeemed,
    currentPeriodEnd: subscription.currentPeriodEnd,
  };
}

/**
 * Require ADMIN role. Returns authenticated admin user or a 401/403 Response.
 */
export async function requireAdmin(
  request: Request,
): Promise<{ userId: string; email: string | null; role: "ADMIN" } | Response> {
  const user = await getAuthenticatedUserWithRole(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }
  return { userId: user.userId, email: user.email, role: "ADMIN" };
}
