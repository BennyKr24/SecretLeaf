"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import type { DiagnoseResult as DiagnoseResultType, Confidence } from "@/lib/diagnose/tree";
import { getActiveGrow } from "@/lib/grow/store";
import { useGrowLog } from "@/hooks/useGrowLog";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { createDiagnosis, createRecommendation } from "@/lib/diagnose/db";
import { getDiagnoseKnowledgeContext } from "@/lib/diagnose/knowledge";
import { Brain, Zap, ClipboardList, CheckCircle2, RotateCcw } from "lucide-react";

// ── Confidence badge ──────────────────────────────────────────────────────────

const CONFIDENCE_CONFIG: Record<
  Confidence,
  { bg: string; text: string; dot: string; barWidth: string }
> = {
  high: {
    bg: "bg-primary/15 border-primary/40",
    text: "text-primary",
    dot: "bg-primary",
    barWidth: "w-full",
  },
  medium: {
    bg: "bg-background border-border",
    text: "text-foreground",
    dot: "bg-primary/70",
    barWidth: "w-2/3",
  },
  low: {
    bg: "bg-border border-border",
    text: "text-muted-fg",
    dot: "bg-muted-fg",
    barWidth: "w-1/3",
  },
};

const CONFIDENCE_LABEL_KEY: Record<Confidence, string> = {
  high: "confidenceHigh",
  medium: "confidenceMedium",
  low: "confidenceLow",
};

type Props = {
  result: DiagnoseResultType;
  category: string;
  onReset: () => void;
  growId?: string | undefined;
  plantId?: string | undefined;
};

export function DiagnoseResult({ result, category, onReset, growId, plantId }: Props) {
  const t = useTranslations("diagnoseResult");
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const activeGrow = getActiveGrow();
  const resolvedGrowId = growId ?? activeGrow?.id;
  const { addEntry } = useGrowLog(resolvedGrowId ?? null);
  const conf = CONFIDENCE_CONFIG[result.confidence];
  const knowledge = getDiagnoseKnowledgeContext(result.id);
  const relatedArticles = knowledge.matches.slice(0, 3);

  function handleAddToGrow() {
    if (!resolvedGrowId || saved) return;
    const articleSummary = relatedArticles.map((match) => match.article.title).join(", ");
    // addEntry already handles the local write, Supabase sync, rollback on
    // failure, and telemetry (see useGrowLog) — no need to duplicate that here.
    addEntry({
      ...(plantId ? { plantId } : {}),
      date: new Date().toISOString(),
      data: {
        type: "notiz",
        text: `🔍 Diagnose: ${result.title}\nConfidence: ${knowledge.confidenceScore}/100\nEvidenz: ${knowledge.evidenceLevel}\nVerknüpfte Studien: ${articleSummary || "keine"}\n\n${result.logNote}`,
      },
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
            growId: resolvedGrowId,
            ...(plantId ? { plantId } : {}),
            category,
            resultKey: result.id,
            confidence: result.confidence,
            title: result.title,
            cause: result.cause,
            reasoning: result.reasoning,
          });
          await createRecommendation(supabase, user.id, {
            diagnosisId,
            growId: resolvedGrowId,
            ...(plantId ? { plantId } : {}),
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
            {result.dotColor ? (
              <span className={`h-5 w-5 shrink-0 rounded-full ${result.dotColor}`} />
            ) : result.icon ? (
              <result.icon className="h-7 w-7 shrink-0 text-foreground/80" strokeWidth={2} />
            ) : null}
            <h2 className="text-lg font-bold text-foreground leading-snug">
              {result.title}
            </h2>
          </div>
          {/* Confidence badge */}
          <span
            className={`shrink-0 mt-0.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${conf.bg} ${conf.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
            {t(CONFIDENCE_LABEL_KEY[result.confidence])}
          </span>
        </div>

        {/* Confidence bar */}
        <div className="h-1 rounded-full bg-background overflow-hidden">
          <div className={`h-full rounded-full transition-[width,background-color] duration-200 ${conf.dot} ${conf.barWidth}`} />
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-muted-fg">
          <span className="rounded-full border border-border bg-background px-2.5 py-1">
            {t("confidenceScore", { score: knowledge.confidenceScore })}
          </span>
          <span className="rounded-full border border-border bg-background px-2.5 py-1">
            {t("evidence", { level: knowledge.evidenceLevel })}
          </span>
        </div>

        <p className="text-sm text-muted-fg leading-relaxed">{result.explanation}</p>
      </div>

      {/* ── Why this result ── */}
      <div className="rounded-2xl bg-card border border-border shadow-sm px-5 py-4 flex gap-3">
        <Brain className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
            {t("whyThis")}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">{result.reasoning}</p>
        </div>
      </div>

      {/* ── Cause ── */}
      <div className="flex items-start gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
        <span>
          <span className="font-semibold">{t("cause")}</span>
          {result.cause}
        </span>
      </div>

      {/* ── Solution steps ── */}
      <div className="rounded-2xl bg-card border border-border shadow-sm p-5 flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
          {t("nextSteps")}
        </h3>
        <ol className="flex flex-col gap-2.5">
          {result.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-foreground">
              <span className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
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
            {t("matchingTools")}
          </h3>
          <div className="flex flex-col gap-2">
            {result.toolLinks.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}` as Route}
                className="flex items-center justify-between rounded-xl border border-border bg-background hover:bg-primary/10 hover:border-primary/40 active:scale-[0.98] transition-[transform,background-color,border-color] duration-150 px-4 py-3 text-sm font-medium text-foreground group"
              >
                <span>{tool.label}</span>
                <span className="text-muted-fg group-hover:text-primary transition text-base">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div className="rounded-2xl bg-card border border-border shadow-sm p-5 flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
            {t("relatedKnowledge")}
          </h3>
          <div className="flex flex-col gap-2">
            {relatedArticles.map((match) => (
              <Link
                key={match.article.slug}
                href={`/studies/${match.article.slug}` as Route}
                className="rounded-xl border border-border bg-background px-4 py-3 transition hover:bg-primary/10 hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{match.article.title}</p>
                  <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold text-muted-fg">
                    {match.evidenceLevel} · {match.confidenceScore}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-fg">{match.reason}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col gap-3">
        {resolvedGrowId && !saved && (
          <button
            onClick={handleAddToGrow}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark active:scale-95 transition text-white font-semibold py-3 px-4 text-sm"
          >
            <ClipboardList className="h-4 w-4" strokeWidth={2} /> {t("saveToLog")}
          </button>
        )}
        {saved && (
          <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/15 border border-primary/35 text-primary font-semibold py-3 px-4 text-sm text-center">
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} /> {t("savedToLog")}
          </div>
        )}
        {!resolvedGrowId && (
          <p className="text-xs text-muted-fg text-center">
            {t("noActiveGrow")}
          </p>
        )}

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-border hover:bg-background active:scale-95 transition text-muted-fg font-medium py-3 px-4 text-sm"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} /> {t("startNew")}
        </button>
      </div>
    </div>
  );
}
