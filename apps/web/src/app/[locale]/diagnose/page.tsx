"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import { diagnoseCategories } from "@/lib/diagnose/tree";
import type { DiagnoseCategory } from "@/lib/diagnose/tree";
import { DiagnoseFlow } from "@/components/diagnose/DiagnoseFlow";

export default function DiagnosePage() {
  const t = useTranslations("diagnosePage");
  const [selected, setSelected] = useState<DiagnoseCategory | null>(null);

  if (selected) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-slate-950">
        <div className="max-w-lg mx-auto px-4 py-8">
          <DiagnoseFlow
            category={selected}
            onBack={() => setSelected(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-950">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <Link
            href={"/" as Route}
            className="text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition mb-2 inline-block"
          >
            {t("backHome")}
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-slate-100">🩺 {t("title")}</h1>
          <p className="text-sm text-neutral-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-3">
          {diagnoseCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelected(category)}
              className="flex flex-col items-start gap-3 rounded-2xl border border-neutral-200 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-[0.97] transition-all p-5 text-left"
            >
              <span className="text-3xl">{category.icon}</span>
              <span className="text-sm font-semibold text-neutral-800 dark:text-slate-100 leading-snug">
                {category.label}
              </span>
            </button>
          ))}
        </div>

        {/* Hint */}
        <p className="text-xs text-neutral-400 dark:text-slate-500 text-center leading-relaxed">
          {t("footerHint")}
        </p>
      </div>
    </div>
  );
}
