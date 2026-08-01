"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import { Stethoscope } from "lucide-react";
import { diagnoseCategories } from "@/lib/diagnose/tree";
import type { DiagnoseCategory } from "@/lib/diagnose/tree";
import { DiagnoseFlow } from "@/components/diagnose/DiagnoseFlow";

export default function DiagnosePage() {
  const t = useTranslations("diagnosePage");
  const [selected, setSelected] = useState<DiagnoseCategory | null>(null);
  const searchParams = useSearchParams();
  const growId = searchParams.get('growId') ?? undefined;
  const plantId = searchParams.get('plantId') ?? undefined;

  if (selected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-8">
          <DiagnoseFlow
            category={selected}
            onBack={() => setSelected(null)}
            growId={growId}
            plantId={plantId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <Link
            href={"/" as Route}
            className="text-sm text-muted-fg hover:text-foreground/80 transition mb-2 inline-block"
          >
            {t("backHome")}
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Stethoscope className="h-5 w-5 text-emerald-600" strokeWidth={2} />
            {t("title")}
          </h1>
          <p className="text-sm text-muted-fg">
            {t("subtitle")}
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-3">
          {diagnoseCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelected(category)}
              className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-[0.97] transition-all p-5 text-left"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <category.icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="text-sm font-semibold text-foreground leading-snug">
                {category.label}
              </span>
            </button>
          ))}
        </div>

        {/* Hint */}
        <p className="text-xs text-muted-fg text-center leading-relaxed">
          {t("footerHint")}
        </p>
      </div>
    </div>
  );
}
