// ──────────────────────────────────────────────────────────────────────────────
// Billing – Create Checkout Session
// ──────────────────────────────────────────────────────────────────────────────
//
// POST /api/billing/checkout (Authorization: Bearer <supabase access token>)
// Body: { interval: "monthly" | "yearly" }
//
// Creates a Stripe Checkout Session for the Pro subscription and returns its
// URL. The client redirects the browser there. Entitlement is granted later,
// server-side, by the webhook handler on checkout.session.completed — never
// optimistically here.
// ──────────────────────────────────────────────────────────────────────────────

import { getAuthenticatedUser } from "@/lib/serverAuth";
import { getStripeClient } from "@/lib/stripe";
import { getStripeServerEnv } from "@/lib/env";
import { logError, logWarn } from "@/lib/log";

export const dynamic = "force-dynamic";

type CheckoutBody = {
  interval?: "monthly" | "yearly";
};

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    logWarn("billing.checkout.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    body = {};
  }
  const interval = body.interval === "yearly" ? "yearly" : "monthly";

  try {
    const { priceIdMonthly, priceIdYearly, siteUrl } = getStripeServerEnv();
    const priceId = interval === "yearly" ? priceIdYearly : priceIdMonthly;
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // Ties the session back to the Supabase user in the webhook handler —
      // no local customer/subscription lookup table needed.
      client_reference_id: auth.user.id,
      ...(auth.user.email ? { customer_email: auth.user.email } : {}),
      success_url: `${siteUrl}/pricing?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return Response.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    logError("billing.checkout.failed", { message, userId: auth.user.id });
    return Response.json({ error: message }, { status: 500 });
  }
}
