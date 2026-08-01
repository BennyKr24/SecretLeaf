"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("language");

  const toggle = () => {
    const nextLocale = locale === "de" ? "en" : "de";
    localStorage.setItem("preferred-locale", nextLocale);
    startTransition(() => {
      // next-intl handles locale prefix automatically
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={t("switchTo")}
      aria-label={t("switchTo")}
      className="flex items-center gap-0.5 h-8 rounded-lg border border-border bg-transparent px-2 text-[12px] font-semibold text-muted-fg hover:bg-background hover:text-foreground transition-colors duration-150 disabled:opacity-50"
    >
      <span className={locale === "de" ? "text-emerald-600 dark:text-emerald-400" : ""}>{t("de")}</span>
      <span className="mx-0.5 text-muted-fg">/</span>
      <span className={locale === "en" ? "text-emerald-600 dark:text-emerald-400" : ""}>{t("en")}</span>
    </button>
  );
}
