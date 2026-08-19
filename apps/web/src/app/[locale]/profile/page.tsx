"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { getSession } from "@/lib/auth";
import { CheckCircle2 } from "lucide-react";
import { CTAButton } from "@/components/ui/CTAButton";
import { Analytics } from "@/lib/analytics";

// ── Plan helpers ──────────────────────────────────────────────────────────────

type EffectivePlan = "free" | "pro" | "team";

function effectivePlan(role: string, plan: string): EffectivePlan {
  if (role === "TEAM") return "team";
  if (plan === "pro") return "pro";
  return "free";
}

const planBadgeClass: Record<EffectivePlan, string> = {
  team: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
  pro: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
  free: "bg-border text-muted-fg",
};

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-fg mb-4">
        {label}
      </p>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  const { name, avatarUrl, saveState, updateName } = useProfile(
    user?.id,
    user?.displayName ?? user?.username ?? ""
  );

  const [nameInput, setNameInput] = useState("");
  const [touched, setTouched] = useState(false);
  const effectiveNameInput = touched ? nameInput : name;

  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/auth");
    }
  }, [isLoading, isLoggedIn, router]);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 rounded-full bg-border animate-pulse" />
      </main>
    );
  }

  if (!user) return null;

  const nameError =
    touched && effectiveNameInput.trim().length < 2 ? t("nameMin") : null;

  const handleSaveName = async () => {
    setTouched(true);
    if (effectiveNameInput.trim().length < 2) return;
    await updateName(effectiveNameInput.trim());
  };

  const handleManageSubscription = async () => {
    setPortalError(null);
    setIsOpeningPortal(true);
    try {
      const token = getSession()?.token ?? "";
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Portal request failed");
      const body = (await response.json()) as { url?: string };
      if (!body.url) throw new Error("No portal URL returned");
      window.location.href = body.url;
    } catch {
      setPortalError(t("managePortalError"));
      setIsOpeningPortal(false);
    }
  };

  const plan = effectivePlan(user.role, user.plan);

  const planLabel: Record<EffectivePlan, string> = {
    team: t("planTeam"),
    pro: t("planPro"),
    free: t("planFree"),
  };

  const saveLabel =
    saveState === "saving"
      ? t("saving")
      : saveState === "success"
        ? t("saved")
        : saveState === "error"
          ? t("saveError")
          : t("save");

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-5 py-12 space-y-5">
        {/* Page header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-fg">
            {t("subtitle")}
          </p>
        </div>

        {/* Avatar */}
        <Section label={t("avatar")}>
          <div className="flex items-center gap-5">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-emerald-500"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white select-none flex-shrink-0">
                {user.initials}
              </span>
            )}
            <div>
              <button
                disabled
                className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted-fg cursor-not-allowed"
              >
                {t("avatarUpload")}
              </button>
              <p className="mt-1.5 text-[11px] text-muted-fg">
                {t("avatarHint")}
              </p>
            </div>
          </div>
        </Section>

        {/* Name */}
        <Section label={t("name")}>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={effectiveNameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setTouched(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSaveName();
                }}
                placeholder={t("namePlaceholder")}
                className={[
                  "w-full rounded-xl border px-4 py-2.5 text-sm bg-transparent text-foreground outline-none transition-colors",
                  nameError
                    ? "border-rose-400 dark:border-rose-600 focus:ring-2 focus:ring-rose-400/20"
                    : "border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
                ].join(" ")}
              />
              {nameError && (
                <p className="mt-1.5 text-xs text-rose-500">{nameError}</p>
              )}
            </div>
            <button
              onClick={() => void handleSaveName()}
              disabled={saveState === "saving" || (touched && !!nameError)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saveState === "saving" && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {saveState === "success" && (
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
              )}
              {saveLabel}
            </button>
          </div>
        </Section>

        {/* Email */}
        <Section label={t("email")}>
          <p className="text-sm font-medium text-foreground">
            {user.email ?? user.username}
          </p>
          <p className="mt-2 text-[12px] text-muted-fg">
            {t("emailChangeSoon")}
          </p>
        </Section>

        {/* Plan */}
        <Section label={t("plan")}>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${planBadgeClass[plan]}`}
            >
              {planLabel[plan]}
            </span>
            {plan === "free" && (
              <>
                <p className="text-[12px] text-muted-fg">{t("planUpgradeHint")}</p>
                <CTAButton
                  href="/pricing"
                  variant="secondary"
                  size="sm"
                  onClick={() => Analytics.upgradeCtaClicked("profile_page")}
                >
                  {t("upgradeCta")}
                </CTAButton>
              </>
            )}
            {plan === "pro" && (
              <CTAButton
                variant="secondary"
                size="sm"
                onClick={handleManageSubscription}
                disabled={isOpeningPortal}
              >
                {isOpeningPortal ? t("managePortalLoading") : t("manageSubscriptionCta")}
              </CTAButton>
            )}
          </div>
          {portalError && (
            <p className="mt-2 text-[12px] text-rose-600 dark:text-rose-400">{portalError}</p>
          )}
        </Section>
      </div>
    </main>
  );
}
