import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { getLocale } from "next-intl/server";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "SecretLeaf – Cannabis Intelligence Platform",
  description: "Die führende Wissensplattform für evidenzbasiertes Cannabis-Wissen.",
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
        {/* Plausible Analytics — set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to activate */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
