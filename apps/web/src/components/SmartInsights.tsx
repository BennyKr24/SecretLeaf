'use client';

// ────────────────────────────────────────────────────────────────────────────
// SmartInsights — phase-aware recommendations in the grow cockpit
//
// Shows the top prioritised insights based on the current grow phase + medium.
// Each insight has a one-click action (log or tool), optional task linkage,
// and a completion loop that replaces handled insights with the next best.
// ────────────────────────────────────────────────────────────────────────────

import { useMemo, useState, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import type { Grow } from '@/lib/grow/types';
import { getRecommendationsForGrow } from '@/lib/grow/insights';
import type { GrowInsight, InsightPriority } from '@/lib/grow/insights';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { createPhaseInsightRecommendation, recordRecommendationEvent } from '@/lib/diagnose/db';
import { useTranslations } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';
import { ActionRow, BTN_GHOST, TEXT_LINK } from '@/components/grow/cockpit/ui';

// 2 = high, 1 = medium, 0 = low — matches recommendations.priority (smallint).
const PRIORITY_RANK: Record<InsightPriority, number> = { high: 2, medium: 1, low: 0 };

/**
 * Persists that the user acted on a phase-insight card, so it becomes
 * queryable for the outcome chain (previously this was purely client-side).
 * Fire-and-forget — this is supplementary telemetry, not core UX, so a
 * failure here shouldn't block or roll back the (already-instant) local
 * completion loop.
 */
function persistPhaseInsightEvent(
  userId: string,
  growId: string,
  insight: GrowInsight,
  eventType: 'applied' | 'dismissed',
): void {
  void (async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const recommendationId = await createPhaseInsightRecommendation(supabase, userId, {
        growId,
        steps: [insight.reason],
        priority: PRIORITY_RANK[insight.priority],
      });
      await recordRecommendationEvent(supabase, userId, recommendationId, eventType);
    } catch (err) {
      console.error('[smart-insights] failed to persist phase-insight event:', err);
    }
  })();
}

// ── Rows for the cockpit's "Als Nächstes" list (DESIGN_SYSTEM.md §24) ─────
// Amber only for high priority; one quiet action, the study as "Warum?".

const ACTION_LABEL_KEY: Record<string, string> = {
  wasser: 'insightActionWater',
  duenger: 'insightActionFeed',
  notiz: 'insightActionNote',
  training: 'insightActionTraining',
  tool_result: 'insightActionTool',
};

function InsightRow({
  insight,
  growId,
  userId,
  onDone,
}: {
  insight: GrowInsight;
  growId: string;
  userId: string | undefined;
  onDone: (slug: string) => void;
}) {
  const t = useTranslations('dashboard');
  const [done, setDone] = useState(false);
  const { article, action, relatedTask, reason, evidenceLevel, confidenceScore, expectedBenefit } = insight;

  const handleAction = useCallback(() => {
    setDone(true);
    if (userId) persistPhaseInsightEvent(userId, growId, insight, 'applied');
    setTimeout(() => onDone(article.slug), 1600);
  }, [article.slug, growId, insight, onDone, userId]);

  const handleDismiss = useCallback(() => {
    if (userId) persistPhaseInsightEvent(userId, growId, insight, 'dismissed');
    onDone(article.slug);
  }, [article.slug, growId, insight, onDone, userId]);

  const actionHref: string = action.type === 'log'
    ? `/grow/${growId}/log?type=${action.logType}`
    : action.href;
  const actionLabel = t(action.type === 'log' ? (ACTION_LABEL_KEY[action.logType] ?? 'insightActionGeneric') : 'insightActionTool');

  return (
    <ActionRow
      label={t(`insightPriority.${insight.priority}`)}
      title={article.growValue}
      text={<>{reason}{expectedBenefit && <> {t('insightBenefit', { benefit: expectedBenefit })}</>}</>}
      meta={(
        <>
          <span className="tabular-nums">{t('insightEvidence', { level: t(`evidenceLevel.${evidenceLevel}`), score: confidenceScore })}</span>
          {relatedTask && <span>· {t('insightFulfils', { task: relatedTask.title })}</span>}
          <span>·</span>
          <Link href={`/studies/${article.slug}` as Route} className={TEXT_LINK}>{t('insightWhy')}</Link>
        </>
      )}
      actions={done ? (
        <span className="flex items-center gap-1.5 text-xs text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} /> {t('insightDone')}
        </span>
      ) : (
        <Link href={actionHref as Route} onClick={handleAction} className={BTN_GHOST}>{actionLabel}</Link>
      )}
      onDismiss={done ? undefined : handleDismiss}
      dismissLabel={t('insightDismiss')}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/** Renders up to `max` recommendation rows (or nothing). Visibility of the
 *  whole feature is controlled by the assistant preference in the cockpit. */
export default function SmartInsights({ grow, max = 2 }: { grow: Grow; max?: number }) {
  const { user } = useAuth();

  // Resolved pool — sorted by priority+score
  const pool = useMemo(() => getRecommendationsForGrow(grow, 6), [grow]);

  // Track dismissed/handled slugs (completion loop)
  const [handledSlugs, setHandledSlugs] = useState<Set<string>>(new Set());

  const handleDone = useCallback((slug: string) => {
    setHandledSlugs((prev) => new Set([...prev, slug]));
  }, []);

  const visible = pool.filter((i) => !handledSlugs.has(i.article.slug)).slice(0, max);

  return (
    <>
      {visible.map((insight) => (
        <InsightRow
          key={insight.article.slug}
          insight={insight}
          growId={grow.id}
          userId={user?.id}
          onDone={handleDone}
        />
      ))}
    </>
  );
}
