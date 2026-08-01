import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { NavigationBar } from "@/components/NavigationBar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LocaleBanner } from "@/components/LocaleBanner";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://secretleaf.de";

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
    title: "SecretLeaf – Cannabis Intelligence Platform",
    description:
      locale === "en"
        ? "The leading knowledge platform for evidence-based cannabis cultivation."
        : "Die führende Wissensplattform für evidenzbasiertes Cannabis-Wissen.",
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
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-sm">
                  🌿
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
