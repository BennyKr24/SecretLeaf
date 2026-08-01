"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import type { DiagnoseResult as DiagnoseResultType, Confidence } from "@/lib/diagnose/tree";
import { getActiveGrow } from "@/lib/grow/store";
import { useGrowLog } from "@/hooks/useGrowLog";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { createDiagnosis, createRecommendation } from "@/lib/diagnose/db";
import { TranslateButton } from "@/components/TranslateButton";

// ── Confidence badge ──────────────────────────────────────────────────────────

const CONFIDENCE_CONFIG: Record<
  Confidence,
  { label: string; bg: string; text: string; dot: string; barWidth: string }
> = {
  high: {
    label: "Hohe Sicherheit",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    barWidth: "w-full",
  },
  medium: {
    label: "Mittlere Sicherheit",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
    barWidth: "w-2/3",
  },
  low: {
    label: "Niedrige Sicherheit",
    bg: "bg-border border-border",
    text: "text-muted-fg",
    dot: "bg-muted-fg",
    barWidth: "w-1/3",
  },
};

type Props = {
  result: DiagnoseResultType;
  category: string;
  onReset: () => void;
};

export function DiagnoseResult({ result, category, onReset }: Props) {
  const [saved, setSaved] = useState(false);
  const activeGrow = getActiveGrow();
  const { addEntry } = useGrowLog(activeGrow?.id ?? null);
  const { user } = useAuth();
  const conf = CONFIDENCE_CONFIG[result.confidence];

  function handleAddToGrow() {
    if (!activeGrow) return;
    addEntry({
      date: new Date().toISOString(),
      data: { type: "notiz", text: `🔍 Diagnose: ${result.title}\n\n${result.logNote}` },
    });
    setSaved(true);

    // Persist the diagnosis + recommendation for logged-in users so
    // efficacy becomes queryable later. Anonymous/offline users only get
    // the local log entry above — diagnoses/recommendations RLS requires
    // a real auth.uid().
    if (user) {
      void (async () => {
        try {
          const supabase = getSupabaseBrowserClient();
          const diagnosisId = await createDiagnosis(supabase, user.id, {
            growId: activeGrow.id,
            category,
            resultKey: result.id,
            confidence: result.confidence,
            title: result.title,
            cause: result.cause,
            reasoning: result.reasoning,
          });
          await createRecommendation(supabase, user.id, {
            diagnosisId,
            growId: activeGrow.id,
            steps: result.steps,
            toolLinks: result.toolLinks,
          });
        } catch (err) {
          console.error("[diagnose] failed to persist diagnosis chain:", err);
        }
      })();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header: icon + title + confidence ── */}
      <div className="rounded-2xl bg-card border border-border shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{result.icon}</span>
            <h2 className="text-lg font-bold text-foreground leading-snug">
              <TranslateButton text={result.title} />
            </h2>
          </div>
          {/* Confidence badge */}
          <span
            className={`shrink-0 mt-0.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${conf.bg} ${conf.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
            {conf.label}
          </span>
        </div>

        {/* Confidence bar */}
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div className={`h-full rounded-full transition-all ${conf.dot} ${conf.barWidth}`} />
        </div>

        <p className="text-sm text-muted-fg leading-relaxed">
          <TranslateButton text={result.explanation} />
        </p>
      </div>

      {/* ── Why this result ── */}
      <div className="rounded-2xl bg-card border border-border shadow-sm px-5 py-4 flex gap-3">
        <span className="mt-0.5 text-base shrink-0">🧠</span>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
            Warum diese Diagnose?
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            <TranslateButton text={result.reasoning} />
          </p>
        </div>
      </div>

      {/* ── Cause ── */}
      <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
        <span className="mt-0.5 shrink-0">⚡</span>
        <span>
          <span className="font-semibold">Ursache: </span>
          {result.cause}
        </span>
      </div>

      {/* ── Solution steps ── */}
      <div className="rounded-2xl bg-card border border-border shadow-sm p-5 flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
          Nächste Schritte
        </h3>
        <ol className="flex flex-col gap-2.5">
          {result.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
              <span className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* ── Tool links ── */}
      {result.toolLinks.length > 0 && (
        <div className="rounded-2xl bg-card border border-border shadow-sm p-5 flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
            Passende Tools
          </h3>
          <div className="flex flex-col gap-2">
            {result.toolLinks.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}` as Route}
                className="flex items-center justify-between rounded-xl border border-border bg-background hover:bg-emerald-50 hover:border-emerald-200 active:scale-[0.98] transition-all px-4 py-3 text-sm font-medium text-foreground/80 group"
              >
                <span>{tool.label}</span>
                <span className="text-muted-fg group-hover:text-emerald-500 transition text-base">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col gap-3">
        {activeGrow && !saved && (
          <button
            onClick={handleAddToGrow}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition text-white font-semibold py-3 px-4 text-sm"
          >
            📋 Im Grow-Log speichern
          </button>
        )}
        {saved && (
          <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold py-3 px-4 text-sm text-center">
            ✅ Im Grow-Log gespeichert
          </div>
        )}
        {!activeGrow && (
          <p className="text-xs text-muted-fg text-center">
            Kein aktiver Grow – Ergebnis kann nicht gespeichert werden.
          </p>
        )}

        <button
          onClick={onReset}
          className="w-full rounded-xl border border-border hover:bg-background active:scale-95 transition text-foreground/80 font-medium py-3 px-4 text-sm"
        >
          🔄 Neue Diagnose starten
        </button>
      </div>
    </div>
  );
}
