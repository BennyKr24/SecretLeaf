"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTAButton } from "@/components/ui/CTAButton";
import { useAuth } from "@/hooks/useAuth";
import { getSession, restoreSessionFromSupabase } from "@/lib/auth";
import { Analytics, track } from "@/lib/analytics";

// ── Paid launch flag ─────────────────────────────────────────────────────────
// Paid Pro (Stripe Checkout) is deferred. While this is `false` the page hides
// the interval toggle, the € price numbers and the Stripe "Jetzt upgraden" CTA,
// and offers Pro as a self-serve 30-day trial + redeemable codes instead. All
// the paid code below is kept intact and reachable — flip this to `true` and the
// page renders exactly as the paid version did.
const PAID_LAUNCH_ENABLED: boolean = false;

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

// ── Redeem-code field ────────────────────────────────────────────────────────
// Self-contained: owns its input + request state so a parent re-render (trial
// button toggling `disabled`, etc.) never wipes what the user is typing. On a
// 200 it refreshes the session so `useAuth` reflects the new period.
function RedeemCodeField({ label, collapsible = false }: { label: string; collapsible?: boolean }) {
  const t = useTranslations("pricing");
  const [open, setOpen] = useState(!collapsible);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const messageForError = (key: string): string => {
    switch (key) {
      case "invalid_code":
        return t("redeemErrorInvalid");
      case "code_inactive":
        return t("redeemErrorInactive");
      case "code_expired":
        return t("redeemErrorExpired");
      case "code_exhausted":
        return t("redeemErrorExhausted");
      case "already_redeemed":
        return t("redeemErrorAlreadyRedeemed");
      default:
        return t("redeemErrorGeneric");
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || busy) return;

    setBusy(true);
    setError(null);
    setDone(null);

    try {
      const token = getSession()?.token ?? "";
      const response = await fetch("/api/billing/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: trimmed }),
      });

      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (response.ok) {
        track("code_redeemed");
        await restoreSessionFromSupabase();
        setCode("");
        setDone(t("redeemSuccess"));
        return;
      }

      setError(messageForError(typeof body.error === "string" ? body.error : "generic"));
    } catch {
      setError(t("redeemErrorGeneric"));
    } finally {
      setBusy(false);
    }
  };

  if (collapsible && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-center text-xs font-semibold text-muted-fg hover:text-foreground"
      >
        {label}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <span className="block text-xs font-semibold text-muted-fg">{label}</span>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("redeemPlaceholder")}
          className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
        <CTAButton type="submit" variant="secondary" size="md" disabled={busy || !code.trim()}>
          {busy ? t("redeemSubmitting") : t("redeemSubmit")}
        </CTAButton>
      </div>
      {done && <p className="text-xs font-semibold text-primary">{done}</p>}
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </form>
  );
}

export default function PricingPage() {
  const t = useTranslations("pricing");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { user, isLoggedIn } = useAuth();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("checkout") === "cancelled";
  const succeeded = searchParams.get("checkout") === "success";

  const [interval, setInterval] = useState<Interval>("yearly");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Self-serve trial state
  const [trialBusy, setTrialBusy] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);
  const [trialSuccess, setTrialSuccess] = useState<string | null>(null);
  // Set when the trial endpoint reports 409 trial_already_used — flips the card
  // to the "trial already used" treatment without waiting for a session refresh.
  const [trialUsedOverride, setTrialUsedOverride] = useState(false);

  const isPro = user?.isPro ?? false;
  const planSource = user?.planSource;
  const trialRedeemed = (user?.trialRedeemed ?? false) || trialUsedOverride;

  const periodEndLabel = (() => {
    if (!user?.currentPeriodEnd) return null;
    const d = new Date(user.currentPeriodEnd);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  })();

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

  const handleStartTrial = useCallback(async () => {
    if (!isLoggedIn || !user || trialBusy) return;

    setTrialBusy(true);
    setTrialError(null);
    setTrialSuccess(null);

    try {
      const token = getSession()?.token ?? "";
      const response = await fetch("/api/billing/trial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (response.ok) {
        track("trial_started");
        await restoreSessionFromSupabase();
        setTrialSuccess(t("trialSuccess"));
        return;
      }

      if (response.status === 409 && body.error === "trial_already_used") {
        setTrialUsedOverride(true);
        return;
      }

      if (response.status === 409 && body.error === "already_pro") {
        await restoreSessionFromSupabase();
        return;
      }

      setTrialError(t("trialErrorGeneric"));
    } catch {
      setTrialError(t("trialErrorGeneric"));
    } finally {
      setTrialBusy(false);
    }
  }, [isLoggedIn, user, trialBusy, t]);

  // ── Pro-card action area — state machine ───────────────────────────────────
  // not logged in ............ CTA → /auth
  // isPro + source "stripe" .. "Dein aktueller Plan"
  // isPro + source "trial" ... "Pro-Trial aktiv" + expiry + redeem ("verlängern")
  // isPro + source "code" .... "Pro aktiv bis {date}" + redeem ("verlängern")
  // !isPro + trialRedeemed ... muted "Trial bereits genutzt" + redeem
  // !isPro + trial available . CTA "30 Tage testen" + collapsible "Ich habe einen Code"
  function renderProAction() {
    if (!isLoggedIn || !user) {
      return (
        <CTAButton variant="primary" size="lg" href="/auth" className="w-full">
          {t("trialLoginCta")}
        </CTAButton>
      );
    }

    if (isPro && planSource === "stripe") {
      return (
        <div className="rounded-xl border border-border bg-card px-4 py-2.5 text-center text-sm font-semibold text-foreground">
          {t("currentPlan")}
        </div>
      );
    }

    if (isPro && planSource === "trial") {
      return (
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center">
            <Badge tone="pro">{t("trialActiveBadge")}</Badge>
            {periodEndLabel && (
              <p className="text-xs text-muted-fg">{t("trialExpiresLine", { date: periodEndLabel })}</p>
            )}
          </div>
          <RedeemCodeField label={t("redeemExtendLabel")} />
        </div>
      );
    }

    if (isPro && planSource === "code") {
      return (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card px-4 py-2.5 text-center text-sm font-semibold text-foreground">
            {periodEndLabel ? t("codeActiveLine", { date: periodEndLabel }) : t("currentPlan")}
          </div>
          <RedeemCodeField label={t("redeemExtendLabel")} />
        </div>
      );
    }

    if (trialRedeemed) {
      return (
        <div className="space-y-3">
          <p className="rounded-xl border border-border bg-card px-4 py-2.5 text-center text-sm text-muted-fg">
            {t("trialUsedNote")}
          </p>
          <RedeemCodeField label={t("redeemLabel")} />
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <CTAButton
          variant="primary"
          size="lg"
          onClick={handleStartTrial}
          disabled={trialBusy}
          className="w-full"
        >
          {trialBusy ? t("trialStarting") : t("trialCta")}
        </CTAButton>
        {trialSuccess && <p className="text-center text-xs font-semibold text-primary">{trialSuccess}</p>}
        {trialError && (
          <p className="text-center text-xs text-rose-600 dark:text-rose-400">{trialError}</p>
        )}
        <RedeemCodeField label={t("haveCodeToggle")} collapsible />
      </div>
    );
  }

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

        {/* ── Interval toggle (paid launch only) ──────────────────────────── */}
        {PAID_LAUNCH_ENABLED && (
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
        )}

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

            {PAID_LAUNCH_ENABLED ? (
              <>
                <p className="mt-5 text-3xl font-black text-foreground">
                  {interval === "yearly" ? PRICE_YEARLY_PER_MONTH_DISPLAY : PRICE_MONTHLY_DISPLAY}
                  <span className="text-sm font-semibold text-muted-fg">{t("perMonth")}</span>
                </p>
                {interval === "yearly" && (
                  <p className="mt-1 text-xs text-muted-fg">
                    {t("billedYearly", { price: PRICE_YEARLY_DISPLAY })}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mt-5 text-3xl font-black text-foreground">{t("trialPriceHeadline")}</p>
                <p className="mt-1 text-xs text-muted-fg">{t("trialPriceNote")}</p>
              </>
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
              {PAID_LAUNCH_ENABLED ? (
                <>
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
                  {error && (
                    <p className="mt-2 text-center text-xs text-rose-600 dark:text-rose-400">{error}</p>
                  )}
                </>
              ) : (
                renderProAction()
              )}
            </div>
          </Card>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-center text-lg font-bold text-foreground">{t("faqTitle")}</h2>
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm font-semibold text-foreground">{t("faqAfterTrialQ")}</p>
              <p className="mt-1 text-sm text-muted-fg">{t("faqAfterTrialA")}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t("faqCodeSourceQ")}</p>
              <p className="mt-1 text-sm text-muted-fg">{t("faqCodeSourceA")}</p>
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
