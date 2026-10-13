"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ActionRow, BTN_GHOST, TEXT_LINK } from "@/components/grow/cockpit/ui";
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

function getContextAction(rule: ReturnType<typeof resolveActiveRule>, growId: string): { href: Route; label: "knowledgeActionLog" | "knowledgeActionWater" | "knowledgeActionOpen" | "knowledgeActionTools" | "knowledgeActionTransition" } {
  if (!rule) {
    return { href: `/grow/${growId}/log` as Route, label: "knowledgeActionLog" };
  }

  switch (rule.trigger.type) {
    case "water_gap_days":
      return { href: `/grow/${growId}/log?type=wasser` as Route, label: "knowledgeActionWater" };
    case "last_log_type":
      return { href: `/grow/${growId}/log?type=${rule.trigger.logType}` as Route, label: "knowledgeActionOpen" };
    case "health_score_below":
    case "health_score_above":
      return { href: "/tools" as Route, label: "knowledgeActionTools" };
    case "phase_ending_soon":
    case "harvest_phase_active":
      return { href: `/grow/${growId}/log?type=notiz` as Route, label: "knowledgeActionTransition" };
    default:
      return { href: `/grow/${growId}/log` as Route, label: "knowledgeActionLog" };
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
  const t = useTranslations("dashboard");
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

  // One row in the cockpit's "Als Nächstes" list (DESIGN_SYSTEM.md §24).
  return (
    <ActionRow
      label={t("knowledgeContextTitle")}
      title={article.title}
      text={<>{relationMatch?.reason ?? activeRule.reason} {t("knowledgeGoalInline", { goal: relationMatch?.expectedBenefit ?? activeRule.goal })}</>}
      meta={(
        <Link href={`/studies/${article.slug}` as Route} onClick={() => rememberArticle(article.slug)} className={TEXT_LINK}>
          {t("insightWhy")}
        </Link>
      )}
      actions={(
        <Link href={action.href} onClick={() => rememberArticle(article.slug)} className={BTN_GHOST}>
          {t(action.label)}
        </Link>
      )}
      onDismiss={() => rememberArticle(article.slug)}
      dismissLabel={t("knowledgeHideLater")}
    />
  );
}
