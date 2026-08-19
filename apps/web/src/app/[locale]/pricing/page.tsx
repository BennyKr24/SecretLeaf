"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTAButton } from "@/components/ui/CTAButton";
import { useAuth } from "@/hooks/useAuth";
import { getSession, restoreSessionFromSupabase } from "@/lib/auth";
import { Analytics } from "@/lib/analytics";

// ── Pricing (must match the Price objects configured in the Stripe Dashboard) ──

const PRICE_MONTHLY_DISPLAY = "4,99 €";
const PRICE_YEARLY_DISPLAY = "59 €";
const PRICE_YEARLY_PER_MONTH_DISPLAY = "4,92 €";

type Interval = "monthly" | "yearly";

function FeatureRow({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-foreground/90">
      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" strokeWidth={2.5} />
      {children}
    </li>
  );
}

export default function PricingPage() {
  const t = useTranslations("pricing");
  const tCommon = useTranslations("common");
  const { user, isLoggedIn } = useAuth();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("checkout") === "cancelled";
  const succeeded = searchParams.get("checkout") === "success";

  const [interval, setInterval] = useState<Interval>("yearly");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = user?.isPro ?? false;

  // Coming back from a successful Stripe Checkout: the webhook has (or is
  // about to have) written the subscription row, but the cached session
  // still says "free" until we re-fetch — without this, isPro stays false
  // and the user sees the upsell right after paying. Track once per landing.
  const trackedSuccessRef = useRef(false);
  useEffect(() => {
    if (!succeeded || trackedSuccessRef.current) return;
    trackedSuccessRef.current = true;
    Analytics.checkoutCompleted();
    void restoreSessionFromSupabase();
  }, [succeeded]);

  const handleUpgrade = useCallback(async () => {
    if (!isLoggedIn || !user) return;

    setError(null);
    setIsRedirecting(true);
    Analytics.upgradeCtaClicked("pricing_page");
    Analytics.checkoutStarted(interval);

    try {
      const token = getSession()?.token ?? "";
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ interval }),
      });

      if (!response.ok) {
        throw new Error("Checkout request failed");
      }

      const body = (await response.json()) as { url?: string };
      if (!body.url) {
        throw new Error("No checkout URL returned");
      }

      window.location.href = body.url;
    } catch {
      setError(t("checkoutError"));
      setIsRedirecting(false);
    }
  }, [interval, isLoggedIn, user, t]);

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-4xl">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center">
          <Badge tone="pro">{t("eyebrow")}</Badge>
          <h1 className="mt-4 text-3xl font-black text-foreground sm:text-4xl">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-fg">{t("subtitle")}</p>
        </div>

        {succeeded && (
          <p className="mx-auto mt-6 max-w-md rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm font-semibold text-primary">
            {t("checkoutSuccess")}
          </p>
        )}
        {cancelled && (
          <p className="mx-auto mt-6 max-w-md rounded-xl border border-border bg-card px-4 py-3 text-center text-sm text-muted-fg">
            {t("checkoutCancelled")}
          </p>
        )}

        {/* ── Interval toggle ─────────────────────────────────────────────── */}
        <div className="mx-auto mt-10 flex w-fit items-center gap-1 rounded-full border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-150 ${
              interval === "monthly" ? "bg-primary text-white" : "text-muted-fg hover:text-foreground"
            }`}
          >
            {t("monthly")}
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-150 ${
              interval === "yearly" ? "bg-primary text-white" : "text-muted-fg hover:text-foreground"
            }`}
          >
            {t("yearly")}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                interval === "yearly" ? "bg-white/20 text-white" : "bg-primary/15 text-primary"
              }`}
            >
              {t("yearlyBadge")}
            </span>
          </button>
        </div>

        {/* ── Plan cards ───────────────────────────────────────────────────── */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Card padding="lg" className="flex flex-col">
            <h2 className="text-lg font-bold text-foreground">{t("freeTitle")}</h2>
            <p className="mt-1 text-xs text-muted-fg">{t("freeSubtitle")}</p>
            <p className="mt-5 text-3xl font-black text-foreground">0 €</p>
            <ul className="mt-6 flex-1 space-y-3">
              <FeatureRow>{t("freeFeature1")}</FeatureRow>
              <FeatureRow>{t("freeFeature2")}</FeatureRow>
              <FeatureRow>{t("freeFeature3")}</FeatureRow>
              <FeatureRow>{t("freeFeature4")}</FeatureRow>
            </ul>
          </Card>

          <Card padding="lg" className="relative flex flex-col border-primary/30 bg-primary/[0.03]">
            <Badge tone="pro" className="absolute right-5 top-5">
              PRO
            </Badge>
            <h2 className="text-lg font-bold text-foreground">{t("proTitle")}</h2>
            <p className="mt-1 text-xs text-muted-fg">{t("proSubtitle")}</p>
            <p className="mt-5 text-3xl font-black text-foreground">
              {interval === "yearly" ? PRICE_YEARLY_PER_MONTH_DISPLAY : PRICE_MONTHLY_DISPLAY}
              <span className="text-sm font-semibold text-muted-fg">{t("perMonth")}</span>
            </p>
            {interval === "yearly" && (
              <p className="mt-1 text-xs text-muted-fg">{t("billedYearly", { price: PRICE_YEARLY_DISPLAY })}</p>
            )}

            <ul className="mt-6 flex-1 space-y-3">
              <FeatureRow>{t("proFeature1")}</FeatureRow>
              <FeatureRow>{t("proFeature2")}</FeatureRow>
              <FeatureRow>{t("proFeature3")}</FeatureRow>
              <FeatureRow>{t("proFeature4")}</FeatureRow>
              <FeatureRow>{t("proFeature5")}</FeatureRow>
              <FeatureRow>{t("proFeature6")}</FeatureRow>
            </ul>

            <div className="mt-6">
              {isPro ? (
                <div className="rounded-xl border border-border bg-card px-4 py-2.5 text-center text-sm font-semibold text-foreground">
                  {t("currentPlan")}
                </div>
              ) : isLoggedIn ? (
                <CTAButton
                  variant="primary"
                  size="lg"
                  onClick={handleUpgrade}
                  disabled={isRedirecting}
                  className="w-full"
                >
                  {isRedirecting ? t("redirecting") : t("upgradeCta")}
                </CTAButton>
              ) : (
                <CTAButton variant="primary" size="lg" href="/auth" className="w-full">
                  {t("loginRequired")}
                </CTAButton>
              )}
              {error && <p className="mt-2 text-center text-xs text-rose-600 dark:text-rose-400">{error}</p>}
            </div>
          </Card>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-center text-lg font-bold text-foreground">{t("faqTitle")}</h2>
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm font-semibold text-foreground">{t("faqCancelQ")}</p>
              <p className="mt-1 text-sm text-muted-fg">{t("faqCancelA")}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t("faqDataQ")}</p>
              <p className="mt-1 text-sm text-muted-fg">{t("faqDataA")}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/dashboard" className="text-xs text-muted-fg hover:text-foreground">
            ← {tCommon("back")}
          </Link>
        </div>
      </div>
    </main>
  );
}
