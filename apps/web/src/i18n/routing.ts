import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "en"],
  defaultLocale: "de",
  // "always" uses redirects (not rewrites) for locale routing.
  // This works correctly in both dev (Turbopack) and production.
  // Note: German URLs will be /de/xxx in dev; production canonical URLs
  // remain unchanged because next-intl handles this at the SEO layer.
  localePrefix: "always",
});
