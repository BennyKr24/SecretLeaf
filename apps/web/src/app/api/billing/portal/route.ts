// ──────────────────────────────────────────────────────────────────────────────
// Billing – Create Customer Portal Session
// ──────────────────────────────────────────────────────────────────────────────
//
// POST /api/billing/portal (Authorization: Bearer <supabase access token>)
//
// Lets a Pro/Team user manage their subscription (cancel, update payment
// method, view invoices) via Stripe's hosted portal instead of needing us to
// do it manually. Requires the Customer Portal to be configured once in the
// Stripe Dashboard (Settings -> Billing -> Customer portal) — see TODO.md.
// ──────────────────────────────────────────────────────────────────────────────

import { getAuthenticatedUser } from "@/lib/serverAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getStripeClient } from "@/lib/stripe";
import { getStripeServerEnv } from "@/lib/env";
import { logError, logWarn } from "@/lib/log";

export const dynamic = "force-dynamic";

const SUBSCRIPTIONS_TABLE = "subscriptions";

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    logWarn("billing.portal.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from(SUBSCRIPTIONS_TABLE)
      .select("stripe_customer_id")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    const customerId = (data as { stripe_customer_id: string | null } | null)?.stripe_customer_id;
    if (error || !customerId) {
      return Response.json({ error: "No subscription to manage" }, { status: 404 });
    }

    const { siteUrl } = getStripeServerEnv();
    const stripe = getStripeClient();

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/profile`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create portal session";
    logError("billing.portal.failed", { message, userId: auth.user.id });
    return Response.json({ error: message }, { status: 500 });
  }
}
