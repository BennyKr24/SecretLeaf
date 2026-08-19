"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CTAButton } from "@/components/ui/CTAButton";
import { useCookieConsent } from "./CookieConsentProvider";

export function CookieConsentBanner() {
  const { consent, ready, setConsent } = useCookieConsent();
  const t = useTranslations("cookieConsent");

  if (!ready || consent !== null) return null;

  return (
    <div
      role="region"
      aria-label={t("ariaLabel")}
      className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] md:bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-relaxed text-foreground/90">
          {t("message")}{" "}
          <Link
            href="/datenschutz"
            className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            {t("learnMore")}
          </Link>
        </p>
        <div className="flex flex-shrink-0 items-center gap-2">
          <CTAButton variant="secondary" size="sm" onClick={() => setConsent("essential")}>
            {t("essentialOnly")}
          </CTAButton>
          <CTAButton variant="primary" size="sm" onClick={() => setConsent("all")}>
            {t("acceptAll")}
          </CTAButton>
        </div>
      </div>
    </div>
  );
}
