'use client';

// ────────────────────────────────────────────────────────────────────────────
// SmartInsights — Phase-aware action system for the grow page
//
// Shows 2–3 prioritised insights based on the current grow phase + medium.
// Each insight has a one-click action (log or tool), optional task linkage,
// and a completion loop that replaces handled insights with the next best.
// ────────────────────────────────────────────────────────────────────────────

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { Grow } from '@/lib/grow/types';
import { getRecommendationsForGrow } from '@/lib/grow/insights';
import type { GrowInsight, InsightPriority } from '@/lib/grow/insights';

// ── Priority config ───────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<InsightPriority, {
  label: string;
  dot: string;
  badge: string;
  border: string;
}> = {
  high:   { label: "Dringend",     dot: "bg-rose-500",    badge: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400",     border: "border-rose-200 dark:border-rose-900/40" },
  medium: { label: "Empfohlen",    dot: "bg-amber-400",   badge: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",   border: "border-amber-200 dark:border-amber-900/40" },
  low:    { label: "Lernwert",     dot: "bg-border",   badge: "bg-border text-muted-fg",   border: "border-border" },
};

const ACTION_LABEL: Record<string, string> = {
  wasser:    "💧 Jetzt gießen",
  duenger:   "🧪 Düngung eintragen",
  notiz:     "📝 Notiz eintragen",
  training:  "✂️ Training eintragen",
  tool_result: "📐 Tool öffnen",
};

// ── Single insight card ───────────────────────────────────────────────────────

function InsightCard({
  insight,
  growId,
  onDone,
}: {
  insight: GrowInsight;
  growId: string;
  onDone: (slug: string) => void;
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const cfg = PRIORITY_CONFIG[insight.priority];
  const { article, action, relatedTask } = insight;

  const handleAction = useCallback(() => {
    setShowFeedback(true);
    setTimeout(() => onDone(article.slug), 1600);
  }, [article.slug, onDone]);

  // Build action href
  const actionHref: string = action.type === "log"
    ? `/grow/${growId}/log?type=${action.logType}`
    : action.href;

  const actionLabel: string = action.type === "log"
    ? (ACTION_LABEL[action.logType] ?? "Jetzt handeln")
    : "🔧 Tool öffnen";

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-card transition-all duration-300 ${cfg.border}`}>
      {/* Priority strip */}
      <div className={`flex items-center gap-2 border-b px-4 py-2 ${cfg.border}`}>
        <span className={`h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.badge}`}>
          {cfg.label}
        </span>
        {relatedTask && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-emerald-600">
            <span>✓</span>
            <span className="max-w-[120px] truncate">erfüllt: {relatedTask.title}</span>
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-[13px] font-medium leading-snug text-foreground">
          {article.growValue}
        </p>

        {/* Tags */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-background px-2 py-0.5 text-[10px] text-muted-fg ring-1 ring-border"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions row */}
        <div className="mt-3 flex items-center gap-2">
          <Link
            href={actionHref as Route}
            onClick={handleAction}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all active:scale-[0.97] ${
              insight.priority === "high"
                ? "bg-rose-600 hover:bg-rose-700"
                : insight.priority === "medium"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-slate-600 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600"
            }`}
          >
            {actionLabel}
          </Link>
          <Link
            href={`/wiki/${article.slug}` as Route}
            className="text-[11px] font-semibold text-muted-fg hover:text-foreground hover:underline"
          >
            Details →
          </Link>
          <button
            type="button"
            onClick={() => onDone(article.slug)}
            className="ml-auto text-[11px] text-muted-fg hover:text-foreground"
            aria-label="Insight verwerfen"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Feedback overlay */}
      <div className={`absolute inset-0 flex items-center justify-center bg-emerald-500 transition-all duration-300 ${
        showFeedback ? "opacity-100" : "pointer-events-none opacity-0"
      }`}>
        <p className="text-sm font-bold text-white">Guter Zug — das verbessert deinen Grow ✓</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  grow: Grow;
};

export default function SmartInsights({ grow }: Props) {
  // Resolved pool — sorted by priority+score
  const pool = useMemo(() => getRecommendationsForGrow(grow, 6), [grow]);

  // Track dismissed/handled slugs (completion loop)
  const [handledSlugs, setHandledSlugs] = useState<Set<string>>(new Set());

  const handleDone = useCallback((slug: string) => {
    setHandledSlugs((prev) => new Set([...prev, slug]));
  }, []);

  // Active insights: first 3 not yet handled
  const visible = pool.filter((i) => !handledSlugs.has(i.article.slug)).slice(0, 3);

  if (visible.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-base leading-none">⚡</span>
        <h2 className="text-sm font-bold text-foreground">Nächste Schritte</h2>
        <span className="ml-auto rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
          {visible.length} offen
        </span>
      </div>

      <div className="space-y-3">
        {visible.map((insight) => (
          <InsightCard
            key={insight.article.slug}
            insight={insight}
            growId={grow.id}
            onDone={handleDone}
          />
        ))}
      </div>
    </div>
  );
}
