import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageAlternates } from "@/lib/i18n/metadata";
import Client from "./Client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tool" });
  return {
    title: `${t("registry.vpd.title")} – SecretLeaf`,
    description: t("registry.vpd.desc"),
    alternates: pageAlternates("/tools/vpd", locale),
  };
}

export default function Page() {
  return <Client />;
}
