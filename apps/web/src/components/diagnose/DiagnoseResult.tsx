"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import type { DiagnoseResult as DiagnoseResultType, Confidence } from "@/lib/diagnose/tree";
import { getActiveGrow, createLogEntry, deleteLogEntry } from "@/lib/grow/store";
import { createLogEntry as dbCreateLogEntry } from "@/lib/grow/db";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { captureGrowError } from "@/lib/grow/telemetry";
import { TranslateButton } from "@/components/TranslateButton";
import { getDiagnoseKnowledgeContext } from "@/lib/diagnose/knowledge";

// ── Confidence badge ──────────────────────────────────────────────────────────

const CONFIDENCE_CONFIG: Record<
  Confidence,
  { label: string; bg: string; text: string; dot: string; barWidth: string }
> = {
  high: {
    label: "Hohe Sicherheit",
    bg: "bg-primary/15 border-primary/40",
    text: "text-primary",
    dot: "bg-primary",
    barWidth: "w-full",
  },
  medium: {
    label: "Mittlere Sicherheit",
    bg: "bg-background border-border",
    text: "text-foreground",
    dot: "bg-primary/70",
    barWidth: "w-2/3",
  },
  low: {
    label: "Niedrige Sicherheit",
    bg: "bg-background border-border",
    text: "text-muted-fg",
    dot: "bg-muted-fg",
    barWidth: "w-1/3",
  },
};

type Props = {
  result: DiagnoseResultType;
  onReset: () => void;
  growId?: string | undefined;
  plantId?: string | undefined;
};

export function DiagnoseResult({ result, onReset, growId, plantId }: Props) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const activeGrow = getActiveGrow();
  const conf = CONFIDENCE_CONFIG[result.confidence];
  const knowledge = getDiagnoseKnowledgeContext(result.id);
  const relatedArticles = knowledge.matches.slice(0, 3);

  const resolvedGrowId = growId ?? activeGrow?.id;

  async function handleAddToGrow() {
    if (!resolvedGrowId || saving || saved) return;
    setSaving(true);
    const articleSummary = relatedArticles.map((match) => match.article.title).join(", ");
    const entry = createLogEntry({
      growId: resolvedGrowId,
      ...(plantId ? { plantId } : {}),
      date: new Date().toISOString(),
      data: {
        type: "notiz",
        text: `🔍 Diagnose: ${result.title}\nConfidence: ${knowledge.confidenceScore}/100\nEvidenz: ${knowledge.evidenceLevel}\nVerknüpfte Studien: ${articleSummary || "keine"}\n\n${result.logNote}`,
      },
    });
    try {
      if (user) {
        const supabase = getSupabaseBrowserClient();
        await dbCreateLogEntry(supabase, user.id, entry);
      }
      setSaved(true);
    } catch (err) {
      console.error("[diagnose] Save to grow failed:", err);
      captureGrowError("addLogEntry", { userId: user?.id ?? "", growId: resolvedGrowId, entryId: entry.id }, err);
      deleteLogEntry(entry.id);
    } finally {
      setSaving(false);
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
        <div className="h-1 rounded-full bg-background overflow-hidden">
          <div className={`h-full rounded-full transition-all ${conf.dot} ${conf.barWidth}`} />
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-muted-fg">
          <span className="rounded-full border border-border bg-background px-2.5 py-1">
            Confidence: {knowledge.confidenceScore}/100
          </span>
          <span className="rounded-full border border-border bg-background px-2.5 py-1">
            Evidenz: {knowledge.evidenceLevel}
          </span>
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
          <p className="text-sm text-muted-fg leading-relaxed">
            <TranslateButton text={result.reasoning} />
          </p>
        </div>
      </div>

      {/* ── Cause ── */}
      <div className="flex items-start gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
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
            Passende Tools
          </h3>
          <div className="flex flex-col gap-2">
            {result.toolLinks.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}` as Route}
                className="flex items-center justify-between rounded-xl border border-border bg-background hover:bg-primary/10 hover:border-primary/40 active:scale-[0.98] transition-all px-4 py-3 text-sm font-medium text-foreground group"
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
            Passendes Wissen
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
            className="w-full rounded-xl bg-primary hover:bg-primary-dark active:scale-95 transition text-white font-semibold py-3 px-4 text-sm"
          >
            📋 Im Grow-Log speichern
          </button>
        )}
        {saved && (
          <div className="w-full rounded-xl bg-primary/15 border border-primary/35 text-primary font-semibold py-3 px-4 text-sm text-center">
            ✅ Im Grow-Log gespeichert
          </div>
        )}
        {!resolvedGrowId && (
          <p className="text-xs text-muted-fg text-center">
            Kein aktiver Grow – Ergebnis kann nicht gespeichert werden.
          </p>
        )}

        <button
          onClick={onReset}
          className="w-full rounded-xl border border-border hover:bg-background active:scale-95 transition text-muted-fg font-medium py-3 px-4 text-sm"
        >
          🔄 Neue Diagnose starten
        </button>
      </div>
    </div>
  );
}
