import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { getLocale } from "next-intl/server";
import { CookieConsentProvider } from "@/components/cookie/CookieConsentProvider";
import { AnalyticsScripts } from "@/components/cookie/AnalyticsScripts";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://secretleaf.net";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "SecretLeaf – Grow Operating System für Cannabis",
  description: "Die Plattform, die dir sagt, was du bei deinem Cannabis-Grow als Nächstes tun musst — Tracking, Diagnose und Tools in einem System.",
  // Home-screen install behavior (iOS reads these; Android/Chromium reads
  // the manifest.ts display/theme_color instead). "black-translucent"
  // lets our own .pt-safe padding draw under the status bar instead of
  // iOS reserving an opaque bar for it.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SecretLeaf",
  },
};

// viewportFit: "cover" lets content extend into the notch/home-indicator
// area so env(safe-area-inset-*) (used by the sticky top nav and fixed
// bottom nav, see globals.css .pt-safe/.pb-safe) resolves to a real value
// instead of always being 0 — this matters most when the site runs
// without browser chrome (added to the home screen).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070f0b",
};

// Inline script to apply dark class before first paint to avoid flash
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t || t === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <CookieConsentProvider>
          {children}
          {/* Plausible + Vercel Analytics/Speed Insights — only load after cookie consent (see CookieConsentBanner) */}
          <AnalyticsScripts />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
