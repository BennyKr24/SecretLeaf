"use client";

import { useTranslations } from "next-intl";
import { useCookieConsent } from "./CookieConsentProvider";

/**
 * Footer entry point for withdrawing / changing the cookie decision. Styled to
 * match the sibling footer links. Hidden until the provider has read
 * localStorage so it never renders in a state it can't act on.
 */
export function CookieSettingsButton() {
  const { ready, resetConsent } = useCookieConsent();
  const t = useTranslations("footer");

  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={resetConsent}
      className="cursor-pointer border-0 bg-transparent p-0 [font:inherit] text-left text-muted-fg hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
    >
      {t("cookieSettings")}
    </button>
  );
}
