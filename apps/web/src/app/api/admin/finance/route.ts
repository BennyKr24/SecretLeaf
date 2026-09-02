// ────────────────────────────────────────────────────────────────────────────
// GET  /api/admin/finance   — revenue + costs + burn (plan §4.2 / §3.3)
// POST /api/admin/finance   — add/replace a manual monthly cost entry
//
// Revenue: subscription counts always; live Stripe MtD gross/fees/net when
// STRIPE_SECRET_KEY is set. Costs: cost_entries + a synthetic "anthropic"
// series rolled up from ai_usage.
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseBody } from "@/lib/admin/http";
import { withAudit } from "@/lib/admin/audit";
import type { AdminFinance, FinanceCostMonth } from "@/lib/admin/contracts";
import { financeCostSchema } from "@/lib/admin/contracts";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { logError } from "@/lib/log";

export const dynamic = "force-dynamic";

const PRO_MONTHLY_CENTS = 499;
const MONTHS_BACK = 6;

const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
const firstOfMonthUtc = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

function lastMonths(n: number): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))));
  }
  return out;
}

async function liveStripeMtd(): Promise<{ gross: number; fees: number; net: number } | null> {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  try {
    const { getStripeClient } = await import("@/lib/stripe");
    const stripe = getStripeClient();
    const start = Math.floor(firstOfMonthUtc(new Date()).getTime() / 1000);

    let gross = 0;
    let fees = 0;
    for await (const tx of stripe.balanceTransactions.list({ created: { gte: start }, limit: 100 })) {
      if (tx.type === "charge" || tx.type === "payment") {
        gross += tx.amount;
        fees += tx.fee;
      } else if (tx.type === "refund" || tx.type === "payment_refund") {
        gross += tx.amount; // negative
      }
    }
    return { gross, fees, net: gross - fees };
  } catch (err) {
    logError("admin.finance.stripe_failed", { error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export const GET = adminRoute(async (): Promise<AdminFinance> => {
  const supabase = getSupabaseServerClient();
  const months = lastMonths(MONTHS_BACK);
  const rangeStart = `${months[0]}-01`;
  const thisMonth = months[months.length - 1] as string;
  const day30Ago = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [subsRes, costRes, aiRes, stripeMtd, stripeEventsRes] = await Promise.all([
    supabase.from("subscriptions").select("plan, status, created_at"),
    supabase
      .from("cost_entries")
      .select("service, period_month, amount_cents")
      .gte("period_month", rangeStart),
    supabase.from("ai_usage").select("cost_cents, created_at").gte("created_at", `${rangeStart}T00:00:00Z`),
    liveStripeMtd(),
    supabase
      .from("stripe_events")
      .select("id, type, received_at, processed, error")
      .order("received_at", { ascending: false })
      .limit(50),
  ]);

  // ── Revenue ─────────────────────────────────────────────────────────────
  const subs = (subsRes.data ?? []) as Array<{ plan: string; status: string; created_at: string }>;
  const activePro = subs.filter((s) => s.plan === "pro" && s.status === "active").length;
  const trialing = subs.filter((s) => s.status === "trialing").length;
  const pastDue = subs.filter((s) => s.status === "past_due").length;
  const canceled30d = subs.filter((s) => s.status === "canceled" && s.created_at >= day30Ago).length;

  // ── Costs by month ─────────────────────────────────────────────────────
  const byMonth: Record<string, FinanceCostMonth> = {};
  for (const m of months) byMonth[m] = { month: m, byService: {}, totalCents: 0 };

  for (const row of (costRes.data ?? []) as Array<{ service: string; period_month: string; amount_cents: number }>) {
    const m = row.period_month.slice(0, 7);
    const bucket = byMonth[m];
    if (!bucket) continue;
    bucket.byService[row.service] = (bucket.byService[row.service] ?? 0) + row.amount_cents;
    bucket.totalCents += row.amount_cents;
  }

  let aiUsageMtdCents = 0;
  let aiCallsMtd = 0;
  for (const row of (aiRes.data ?? []) as Array<{ cost_cents: number | string; created_at: string }>) {
    const m = row.created_at.slice(0, 7);
    const cents = Math.round(Number(row.cost_cents));
    const bucket = byMonth[m];
    if (bucket) {
      bucket.byService.anthropic = (bucket.byService.anthropic ?? 0) + cents;
      bucket.totalCents += cents;
    }
    if (m === thisMonth) {
      aiUsageMtdCents += cents;
      aiCallsMtd += 1;
    }
  }

  const currentMonthCents = byMonth[thisMonth]?.totalCents ?? 0;
  const estimatedMrrCents = activePro * PRO_MONTHLY_CENTS;
  const netRevenueMtd = stripeMtd ? stripeMtd.net : estimatedMrrCents;
  const burnMtdCents = currentMonthCents - netRevenueMtd;

  // ── Stripe webhook health ──────────────────────────────────────────────
  const stripeEvents = (stripeEventsRes.data ?? []) as Array<{
    id: string;
    type: string;
    received_at: string;
    processed: boolean;
    error: string | null;
  }>;
  const lastEvent = stripeEvents[0];
  const stripeHealth = {
    lastEventAt: lastEvent?.received_at ?? null,
    lastEventType: lastEvent?.type ?? null,
    unprocessedCount: stripeEvents.filter((e) => !e.processed).length,
    recentErrors: stripeEvents
      .filter((e) => e.error)
      .slice(0, 10)
      .map((e) => ({ id: e.id, type: e.type, receivedAt: e.received_at, error: e.error as string })),
  };

  return {
    generatedAt: new Date().toISOString(),
    revenue: {
      stripeConnected: stripeMtd != null,
      activePro,
      trialing,
      pastDue,
      canceled30d,
      estimatedMrrCents,
      grossMtdCents: stripeMtd ? stripeMtd.gross : null,
      feesMtdCents: stripeMtd ? stripeMtd.fees : null,
      netMtdCents: stripeMtd ? stripeMtd.net : null,
    },
    costs: {
      months: months.map((m) => byMonth[m] as FinanceCostMonth),
      currentMonthCents,
      aiUsageMtdCents,
      aiCallsMtd,
    },
    burnMtdCents,
    stripeHealth,
  };
});

export const POST = adminRoute(async ({ req, actor }) => {
  const input = await parseBody(req, financeCostSchema);
  const supabase = getSupabaseServerClient();
  const periodMonth = `${input.periodMonth}-01`;

  const result = await withAudit(
    actor,
    {
      resource: "finance.cost",
      resourceId: `${input.service}:${input.periodMonth}`,
      action: "upsert",
      after: { service: input.service, periodMonth: input.periodMonth, amountCents: input.amountCents, note: input.note ?? null },
    },
    async () => {
      const { error } = await supabase.from("cost_entries").upsert(
        {
          service: input.service,
          period_month: periodMonth,
          amount_cents: input.amountCents,
          source: "manual",
          note: input.note ?? null,
          created_by: actor.userId,
        },
        { onConflict: "service,period_month,source" },
      );
      if (error) throw new Error(error.message);
      return { ok: true };
    },
  );

  return result;
});
