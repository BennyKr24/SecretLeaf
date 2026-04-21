"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { diagnoseCategories } from "@/lib/diagnose/tree";
import type { DiagnoseCategory } from "@/lib/diagnose/tree";
import { DiagnoseFlow } from "@/components/diagnose/DiagnoseFlow";

export default function DiagnosePage() {
  const [selected, setSelected] = useState<DiagnoseCategory | null>(null);

  if (selected) {
    return (
      <div className="min-h-screen bg-neutral-50">
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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <Link
            href={"/" as Route}
            className="text-sm text-neutral-400 hover:text-neutral-600 transition mb-2 inline-block"
          >
            ← Home
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">🩺 Diagnose</h1>
          <p className="text-sm text-neutral-500">
            Wähle einen Bereich – ich führe dich Schritt für Schritt zur Ursache.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-3">
          {diagnoseCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelected(category)}
              className="flex flex-col items-start gap-3 rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-[0.97] transition-all p-5 text-left"
            >
              <span className="text-3xl">{category.icon}</span>
              <span className="text-sm font-semibold text-neutral-800 leading-snug">
                {category.label}
              </span>
            </button>
          ))}
        </div>

        {/* Hint */}
        <p className="text-xs text-neutral-400 text-center leading-relaxed">
          Dieses Tool ersetzt keine Laboranalyse, hilft aber schnell bei der ersten Einordnung.
        </p>
      </div>
    </div>
  );
}
