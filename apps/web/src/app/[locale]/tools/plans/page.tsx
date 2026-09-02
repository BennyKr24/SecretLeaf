import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageAlternates } from "@/lib/i18n/metadata";
import Client from "./Client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "toolsPage" });
  return {
    title: `${t("plansTitle")} – SecretLeaf`,
    description: t("plansDesc"),
    alternates: pageAlternates("/tools/plans", locale),
  };
}

export default function Page() {
  return <Client />;
}
