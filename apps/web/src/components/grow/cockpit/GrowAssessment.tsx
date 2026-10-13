'use client';

// "Einschätzung": health score and yield performance, restyled for the
// cockpit (§24). Shown only with enough log entries to be meaningful —
// below that it invites instead of showing estimates without a data basis
// (§24.5). Recommendations live in "Als Nächstes".

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import type { Grow, LogEntry } from '@/lib/grow/types';
import {
  computeTrend,
  getGrowPriorities,
  getOptimizationScore,
  getPotentialYield,
  getTotalYieldImpact,
} from '@/lib/grow/intelligence';
import type { GrowTrend } from '@/lib/grow/intelligence';
import { Analytics } from '@/lib/analytics';
import { Invite, LABEL, MetricCell, PANEL, TEXT_LINK } from './ui';

/** Entries needed before health and yield figures mean anything. */
export const ASSESSMENT_MIN_ENTRIES = 3;

function healthKey(score: number): 'healthGreat' | 'healthGood' | 'healthFair' | 'healthLow' {
  if (score >= 85) return 'healthGreat';
  if (score >= 70) return 'healthGood';
  if (score >= 50) return 'healthFair';
  return 'healthLow';
}

export function GrowAssessment({
  grow, entries, healthScore, isPro,
}: {
  grow: Grow;
  entries: LogEntry[];
  healthScore: number;
  isPro: boolean;
}) {
  const t = useTranslations('dashboard');

  // Score change caused by a new log entry during this visit.
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);
  const prev = useRef<{ len: number; score: number } | null>(null);
  useEffect(() => {
    const last = prev.current;
    if (last && entries.length > last.len) setScoreDelta(healthScore - last.score);
    prev.current = { len: entries.length, score: healthScore };
  }, [entries.length, healthScore]);

  const optScore = getOptimizationScore(grow, entries);
  const yieldImpact = getTotalYieldImpact(getGrowPriorities(grow, entries), getPotentialYield(grow));

  // Trend of the optimisation score since the previous visit.
  const trendKey = `secretleaf.optscore.${grow.id}`;
  const trend = useMemo<GrowTrend | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(trendKey);
    if (stored === null) return null;
    const before = Number(stored);
    if (Number.isNaN(before) || before === optScore) return null;
    return computeTrend(before, optScore);
  }, [trendKey, optScore]);
  useEffect(() => {
    localStorage.setItem(trendKey, String(optScore));
  }, [trendKey, optScore]);

  const enoughData = entries.length >= ASSESSMENT_MIN_ENTRIES;
  const usedPercent = yieldImpact.potentialYield > 0
    ? Math.round((yieldImpact.currentEstimate / yieldImpact.potentialYield) * 100)
    : 100;
  const trendLabel = !trend || trend.trend === 'stable' ? t('trendStable') : trend.trend === 'up' ? `+${trend.delta}` : `${trend.delta}`;

  if (!enoughData) {
    return (
      <div className={PANEL}>
        <Invite
          text={t('assessmentInvite', { count: ASSESSMENT_MIN_ENTRIES - entries.length })}
          action={<Link href={`/grow/${grow.id}/log` as Route} className={TEXT_LINK}>{t('logEntryCta')}</Link>}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className={`${PANEL} flex flex-col gap-1.5 px-4 py-3.5`}>
        <div className="flex items-baseline justify-between gap-2">
          <span className={LABEL}>{t('healthLabel')}</span>
          {scoreDelta != null && scoreDelta !== 0 && (
            <span className={`${LABEL} tabular-nums`}>{t('healthDelta', { delta: scoreDelta > 0 ? `+${scoreDelta}` : String(scoreDelta) })}</span>
          )}
        </div>
        <p className="font-mono text-[26px] leading-tight tabular-nums text-foreground">
          {healthScore}<small className="text-xs text-muted-fg">/100</small>
        </p>
        <p className="text-xs leading-relaxed text-muted-fg">{t(healthKey(healthScore))}</p>
      </div>

      {isPro ? (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-app border border-border bg-border">
          <MetricCell label={t('yieldUsed')} value={`${usedPercent}%`} hint={t('yieldProjection', { projected: yieldImpact.projectedYield, potential: yieldImpact.potentialYield })} />
          <MetricCell label={t('yieldRisk')} value={yieldImpact.totalLoss > 0 ? `${yieldImpact.totalLoss} g` : '—'} muted={yieldImpact.totalLoss <= 0} />
          <MetricCell label={t('optimizationLabel')} value={`${optScore}%`} hint={t('trendHint', { trend: trendLabel })} />
          <MetricCell label={t('yieldRecoverable')} value={yieldImpact.totalGainPotential > 0 ? `+${yieldImpact.totalGainPotential} g` : '—'} muted={yieldImpact.totalGainPotential <= 0} />
        </div>
      ) : (
        <Link
          href={'/pricing' as Route}
          onClick={() => Analytics.upgradeCtaClicked('grow_performance_upsell')}
          className={`${PANEL} flex flex-col gap-2 px-4 py-3.5 transition-colors hover:border-foreground/15`}
        >
          <span className="flex items-baseline justify-between gap-2">
            <span className={LABEL}>{t('yieldUsed')}</span>
            <span className={`${LABEL} text-foreground`}>PRO</span>
          </span>
          <span className="font-mono text-[22px] leading-tight tabular-nums text-foreground">{usedPercent}%</span>
          <span className="text-xs leading-relaxed text-muted-fg">{t('yieldProHint')}</span>
        </Link>
      )}
    </div>
  );
}
