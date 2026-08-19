// ──────────────────────────────────────────────────────────────────────────────
// Billing – Stripe Webhook
// ──────────────────────────────────────────────────────────────────────────────
//
// POST /api/billing/webhook (Stripe-Signature header, raw body)
//
// This is the ONLY place entitlement ever changes. The checkout route never
// grants Pro directly — it just starts a Checkout Session; Stripe calls back
// here once payment actually succeeds. Register this URL in the Stripe
// Dashboard (or `stripe listen --forward-to` locally) with these events:
//   checkout.session.completed, customer.subscription.updated,
//   customer.subscription.deleted
// ──────────────────────────────────────────────────────────────────────────────

import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { getStripeServerEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { logError, logInfo, logWarn } from "@/lib/log";

export const dynamic = "force-dynamic";

const SUBSCRIPTIONS_TABLE = "subscriptions";

async function upsertFromSubscription(
  userId: string,
  customerId: string,
  subscription: Stripe.Subscription
) {
  const supabase = getSupabaseServerClient();
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  const { error } = await supabase.from(SUBSCRIPTIONS_TABLE).upsert(
    {
      user_id: userId,
      plan: "pro",
      status: subscription.status,
      current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(`Failed to upsert subscription: ${error.message}`);
  }
}

async function updateByCustomerId(customerId: string, subscription: Stripe.Subscription) {
  const supabase = getSupabaseServerClient();
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  const { error } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .update({
      status: subscription.status,
      current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
      stripe_subscription_id: subscription.id,
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const { webhookSecret } = getStripeServerEnv();
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature";
    logWarn("billing.webhook.invalid_signature", { message });
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (!userId || !customerId || !subscriptionId) {
          logWarn("billing.webhook.checkout_completed.missing_refs", {
            hasUserId: !!userId,
            hasCustomerId: !!customerId,
            hasSubscriptionId: !!subscriptionId,
          });
          break;
        }

        const stripe = getStripeClient();
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertFromSubscription(userId, customerId, subscription);
        logInfo("billing.webhook.checkout_completed", { userId });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        await updateByCustomerId(customerId, subscription);
        logInfo("billing.webhook.subscription_synced", { customerId, status: subscription.status });
        break;
      }

      default:
        // Unhandled event types are expected — Stripe sends far more than we subscribe to.
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handling failed";
    logError("billing.webhook.handler_failed", { message, eventType: event.type });
    // 500 tells Stripe to retry — safe here since our writes are upserts/updates.
    return Response.json({ error: message }, { status: 500 });
  }
}
