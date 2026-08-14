import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { NavigationBar } from "@/components/NavigationBar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LocaleBanner } from "@/components/LocaleBanner";
import { routing } from "@/i18n/routing";
import { Leaf } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://secretleaf.net";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const canonicalUrl = locale === "de" ? BASE_URL : `${BASE_URL}/en`;

  return {
    title:
      locale === "en"
        ? "SecretLeaf – Grow Operating System for Cannabis"
        : "SecretLeaf – Grow Operating System für Cannabis",
    description:
      locale === "en"
        ? "The platform that tells you what to do next in your cannabis grow — tracking, diagnosis and tools in one system."
        : "Die Plattform, die dir sagt, was du bei deinem Cannabis-Grow als Nächstes tun musst — Tracking, Diagnose und Tools in einem System.",
    alternates: {
      canonical: canonicalUrl,
      languages: {
        de: BASE_URL,
        en: `${BASE_URL}/en`,
        "x-default": BASE_URL,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "de" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        {/* Language onboarding banner (client component, renders nothing for non-EN browsers) */}
        <LocaleBanner />

        <NavigationBar />
        {children}

        {/* Footer */}
        <footer className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-5 py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Leaf className="h-4 w-4" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">SecretLeaf</p>
                  <p className="text-[11px] text-muted-fg">{t("tagline")}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted-fg">
                <Link href="/studies" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {t("studies")}
                </Link>
                <Link href="/database" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {t("catalog")}
                </Link>
                <Link href="/tools" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {t("tools")}
                </Link>
                <Link href="/studies/sources" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  {t("sources")}
                </Link>
              </div>
              <p className="text-[11px] text-muted-fg">
                © {new Date().getFullYear()} SecretLeaf · {t("rights")}
              </p>
            </div>
          </div>
        </footer>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
