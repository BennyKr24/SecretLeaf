"use client";

import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { useCookieConsent } from "./CookieConsentProvider";

/**
 * Loads Plausible + Vercel Analytics/Speed Insights only after the user has
 * opted in via CookieConsentBanner. These tools don't set cookies, but we
 * gate them on consent anyway to keep the consent scope unambiguous rather
 * than relying on a "technically no cookies" carve-out.
 */
export function AnalyticsScripts() {
  const { consent } = useCookieConsent();

  if (consent !== "all") return null;

  return (
    <>
      {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
        <Script
          defer
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}
      <SpeedInsights />
      <Analytics />
    </>
  );
}
