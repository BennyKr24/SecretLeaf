"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { wikiArticles } from "@/data/terpira/wiki";
import { resolveActiveRule, type WikiEvalContext } from "@/data/terpira/wikiContextMapping";
import type { Grow, LogEntry } from "@/lib/grow/types";
import { getContextRuleKnowledge } from "@/lib/knowledge/graph";

type Props = {
  grow: Grow;
  entries: LogEntry[];
  healthScore: number;
  currentStreak: number;
  overdueTasks: number;
  growsCount: number;
};

type WikiMemoryState = {
  seen: string[];
  shown: Array<{ slug: string; shownAt: string }>;
};

const EMPTY_MEMORY: WikiMemoryState = { seen: [], shown: [] };
const RECENT_WINDOW_MS = 48 * 60 * 60 * 1000;

function daysSince(iso: string | undefined): number {
  if (!iso) return 999;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

function getMemoryKey(growId: string): string {
  return `secretleaf.wiki-context.${growId}`;
}

function loadMemory(growId: string): WikiMemoryState {
  if (typeof window === "undefined") return EMPTY_MEMORY;

  try {
    const raw = window.localStorage.getItem(getMemoryKey(growId));
    if (!raw) return EMPTY_MEMORY;

    const parsed = JSON.parse(raw) as Partial<WikiMemoryState>;
    const shown = (parsed.shown ?? []).filter((entry): entry is { slug: string; shownAt: string } => {
      if (!entry || typeof entry.slug !== "string" || typeof entry.shownAt !== "string") {
        return false;
      }
      return Date.now() - new Date(entry.shownAt).getTime() <= RECENT_WINDOW_MS;
    });

    return {
      seen: Array.isArray(parsed.seen) ? parsed.seen.filter((slug): slug is string => typeof slug === "string") : [],
      shown,
    };
  } catch {
    return EMPTY_MEMORY;
  }
}

function persistMemory(growId: string, memory: WikiMemoryState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getMemoryKey(growId), JSON.stringify(memory));
}

function getContextAction(rule: ReturnType<typeof resolveActiveRule>, growId: string): { href: Route; label: string } {
  if (!rule) {
    return { href: `/grow/${growId}/log` as Route, label: "Log öffnen" };
  }

  switch (rule.trigger.type) {
    case "water_gap_days":
      return { href: `/grow/${growId}/log?type=wasser` as Route, label: "Bewässerung eintragen" };
    case "last_log_type":
      return { href: `/grow/${growId}/log?type=${rule.trigger.logType}` as Route, label: "Aktion öffnen" };
    case "health_score_below":
    case "health_score_above":
      return { href: "/tools" as Route, label: "Tools öffnen" };
    case "phase_ending_soon":
    case "harvest_phase_active":
      return { href: `/grow/${growId}/log?type=notiz` as Route, label: "Übergang dokumentieren" };
    default:
      return { href: `/grow/${growId}/log` as Route, label: "Log öffnen" };
  }
}

export default function GrowKnowledgePanel({
  grow,
  entries,
  healthScore,
  currentStreak,
  overdueTasks,
  growsCount,
}: Props) {
  const [memoryVersion, setMemoryVersion] = useState(0);

  const memory = useMemo(
    () => {
      if (memoryVersion < 0) return EMPTY_MEMORY;
      return loadMemory(grow.id);
    },
    [grow.id, memoryVersion],
  );

  const currentPhase = useMemo(
    () => grow.plan.phases.find((phase) => phase.id === grow.currentPhaseId),
    [grow.currentPhaseId, grow.plan.phases],
  );

  const context = useMemo<WikiEvalContext>(() => {
    const latestLog = entries[0];
    const latestWater = entries.find((entry) => entry.data.type === "wasser");
    const lastLogType = latestLog?.data.type;
    const baseContext = {
      logGapDays: daysSince(latestLog?.date),
      waterGapDays: daysSince(latestWater?.date),
      healthScore,
      streakDays: currentStreak,
      overdueTasks,
      daysUntilPhaseEnd: Math.max(0, (currentPhase?.endDay ?? grow.currentDay) - grow.currentDay),
      isHarvestPhase: grow.currentPhaseId === "ernte",
      hasNoEntries: entries.length === 0,
      isFirstRun: growsCount <= 1,
      seenArticleSlugs: memory.seen,
      recentlyShownSlugs: memory.shown.map((entry) => entry.slug),
    };

    if (
      lastLogType === "wasser" ||
      lastLogType === "duenger" ||
      lastLogType === "training" ||
      lastLogType === "notiz"
    ) {
      return { ...baseContext, lastLogType };
    }

    return baseContext;
  }, [currentPhase?.endDay, currentStreak, entries, grow.currentDay, grow.currentPhaseId, growsCount, healthScore, memory.seen, memory.shown, overdueTasks]);

  const activeRule = useMemo(() => resolveActiveRule(context), [context]);
  const relationMatch = useMemo(() => {
    if (!activeRule) return null;
    return getContextRuleKnowledge(activeRule.id, 1, memory.seen)[0] ?? null;
  }, [activeRule, memory.seen]);
  const article = useMemo(
    () => relationMatch?.article ?? wikiArticles.find((entry) => entry.slug === activeRule?.resolvedSlug) ?? null,
    [activeRule, relationMatch],
  );

  const action = useMemo(() => getContextAction(activeRule, grow.id), [activeRule, grow.id]);

  function rememberArticle(slug: string): void {
    const next: WikiMemoryState = {
      seen: memory.seen.includes(slug) ? memory.seen : [...memory.seen, slug],
      shown: [
        ...memory.shown.filter((entry) => entry.slug !== slug),
        { slug, shownAt: new Date().toISOString() },
      ],
    };

    persistMemory(grow.id, next);
    setMemoryVersion((current) => current + 1);
  }

  if (!activeRule || !article) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Wissen im Grow-Kontext</p>
          <h2 className="mt-1 text-lg font-bold text-foreground">{article.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-fg">{article.growValue ?? article.summary}</p>
        </div>
        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
          {activeRule.priority}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-fg">Warum jetzt?</p>
          <p className="mt-1 text-sm text-foreground">{relationMatch?.reason ?? activeRule.reason}</p>
        </div>
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-fg">Ziel</p>
          <p className="mt-1 text-sm text-foreground">{relationMatch?.expectedBenefit ?? activeRule.goal}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={action.href}
          onClick={() => rememberArticle(article.slug)}
          className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          {action.label}
        </Link>
        <Link
          href={`/studies/${article.slug}` as Route}
          onClick={() => rememberArticle(article.slug)}
          className="inline-flex items-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-card"
        >
          Studie öffnen
        </Link>
        <button
          type="button"
          onClick={() => rememberArticle(article.slug)}
          className="inline-flex items-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-muted-fg transition hover:text-foreground"
        >
          Später ausblenden
        </button>
      </div>
    </div>
  );
}