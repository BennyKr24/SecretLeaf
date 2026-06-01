'use client';

// ────────────────────────────────────────────────────────────────────────────
// Grow OS — /grow/[id]
//
// Grow session: overview, current phase, upcoming & overdue tasks (with
// complete action), quick actions and phase timeline.
// ────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Route } from 'next';
import { useGrowState } from '@/hooks/useGrowState';
import { useGrowLog } from '@/hooks/useGrowLog';
import { useAuth } from '@/hooks/useAuth';
import { getUpcomingTasks, getOverdueTasks, getTaskProgress, getPhaseForDay } from '@/lib/grow/planGenerator';
import { PHASE_ICONS, PHASE_ORDER } from '@/lib/grow/phases';
import { TASK_CATEGORY_ICONS } from '@/lib/grow/types';
import type { GrowTask, Grow, Plant, LogEntry, HarvestData } from '@/lib/grow/types';
import SmartInsights from '@/components/SmartInsights';
import {
  getGrowHealthScore,
  getDailyAction,
  getGrowHealthStatus,
  getPlantMicroInsight,
  getGrowPriorities,
  getTotalYieldImpact,
  getOptimizationScore,
  getPotentialYield,
  computeTrend,
} from '@/lib/grow/intelligence';
import type { DailyAction, GrowHealthStatus, GrowTrend, YieldImpactResult } from '@/lib/grow/intelligence';

// ── Helpers ───────────────────────────────────────────────────────────────────

type Props = Record<string, never>;

function dayLabel(dueDay: number, currentDay: number): string {
  const diff = dueDay - currentDay;
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Morgen';
  if (diff < 0) return `${Math.abs(diff)}d überfällig`;
  return `in ${diff}d`;
}

function dayLabelClass(dueDay: number, currentDay: number): string {
  if (dueDay < currentDay) return 'text-rose-600 font-semibold';
  if (dueDay === currentDay) return 'text-emerald-700 font-semibold';
  return 'text-slate-400';
}

// ── Progress bars ─────────────────────────────────────────────────────────────

function GrowProgressBar({ grow }: { grow: Grow }) {
  const { completed, total, percent } = getTaskProgress(grow);
  const phaseProgress = grow.plan.totalDays > 0
    ? Math.min(100, Math.round((grow.currentDay / grow.plan.totalDays) * 100))
    : 0;

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-slate-500">Grow-Fortschritt</span>
          <span className="font-semibold text-slate-700">Tag {grow.currentDay} / {grow.plan.totalDays}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${phaseProgress}%` }} />
        </div>
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-slate-500">Tasks erledigt</span>
          <span className="font-semibold text-slate-700">{completed} / {total}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-teal-400 transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── Phase timeline ────────────────────────────────────────────────────────────

function PhaseTimeline({ grow }: { grow: Grow }) {
  const currentPhase = getPhaseForDay(grow.plan, grow.currentDay);
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {grow.plan.phases.map((phase, idx) => {
        const isPast   = grow.currentDay > phase.endDay;
        const isActive = currentPhase?.id === phase.id;
        return (
          <div key={phase.id} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
                isActive ? 'bg-emerald-500 text-white ring-2 ring-emerald-200' :
                isPast   ? 'bg-emerald-100 text-emerald-700' :
                           'bg-slate-100 text-slate-400'
              }`}>
                {PHASE_ICONS[phase.id]}
              </div>
              <span className={`text-[9px] font-semibold whitespace-nowrap ${
                isActive ? 'text-emerald-700' : isPast ? 'text-slate-400' : 'text-slate-300'
              }`}>
                {phase.label.replace('phase', '').replace('Vegetations', 'Veg').replace('Spät', 'Spät')}
              </span>
            </div>
            {idx < grow.plan.phases.length - 1 && (
              <div className={`mb-4 h-px w-4 flex-shrink-0 ${isPast ? 'bg-emerald-200' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Task item ─────────────────────────────────────────────────────────────────

type TaskItemProps = {
  task: GrowTask;
  currentDay: number;
  onComplete: (taskId: string) => void;
};

function TaskItem({ task, currentDay, onComplete }: TaskItemProps) {
  const overdue = task.dueDay < currentDay;
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-all ${
      overdue ? 'border-rose-100 bg-rose-50/40' : 'border-slate-100 bg-white hover:border-emerald-100'
    }`}>
      <button
        type="button"
        onClick={() => onComplete(task.id)}
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          overdue
            ? 'border-rose-300 hover:border-rose-500 hover:bg-rose-50'
            : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'
        }`}
        aria-label="Aufgabe erledigen"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{task.title}</p>
        {task.description !== undefined && task.description !== '' && (
          <p className="mt-0.5 text-xs text-slate-500 leading-snug">{task.description}</p>
        )}
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <span className="text-base">{TASK_CATEGORY_ICONS[task.category]}</span>
        <span className={`text-[10px] ${dayLabelClass(task.dueDay, currentDay)}`}>
          {dayLabel(task.dueDay, currentDay)}
        </span>
      </div>
    </div>
  );
}

// ── Plant Status ─────────────────────────────────────────────────────────────

type PlantStatus = "good" | "needs-attention" | "no-data";

function computePlantStatus(plantEntries: LogEntry[]): PlantStatus {
  if (plantEntries.length === 0) return "no-data";
  const newest = plantEntries[0];
  const days = Math.floor((Date.now() - new Date(newest!.date).getTime()) / 86_400_000);
  return days <= 3 ? "good" : "needs-attention";
}

// getMicroInsight replaced by getPlantMicroInsight from intelligence.ts

function getWorstReason(plantEntries: LogEntry[]): string {
  if (plantEntries.length === 0) return "Kein Eintrag vorhanden";
  const lastWater = plantEntries.find((e) => e.data.type === "wasser");
  if (lastWater) {
    const days = Math.floor((Date.now() - new Date(lastWater.date).getTime()) / 86_400_000);
    if (days <= 1) return "Gestern bewässert";
    return `Seit ${days} Tagen nicht gegossen`;
  }
  const newest = plantEntries[0]!;
  const days = Math.floor((Date.now() - new Date(newest.date).getTime()) / 86_400_000);
  if (days === 0) return "Heute eingetragen, nie gegossen";
  return `Letzte Pflege vor ${days} Tagen`;
}

const PLANT_STATUS_CONFIG: Record<PlantStatus, { label: string; classes: string }> = {
  good:              { label: "OK",     classes: "bg-emerald-100 text-emerald-700" },
  "needs-attention": { label: "Prüfen", classes: "bg-amber-100 text-amber-700"    },
  "no-data":         { label: "Neu",    classes: "bg-slate-100 text-slate-500"     },
};

/** True when a plant has no log in > 3 days OR no watering in > 3 days. */
function isPlantCritical(plantEntries: LogEntry[]): boolean {
  if (plantEntries.length === 0) return false; // no-data is handled separately
  const newest = plantEntries[0]!;
  const sinceLog = Math.floor((Date.now() - new Date(newest.date).getTime()) / 86_400_000);
  if (sinceLog > 3) return true;
  const lastWater = plantEntries.find((e) => e.data.type === "wasser");
  if (lastWater) {
    const sinceWater = Math.floor((Date.now() - new Date(lastWater.date).getTime()) / 86_400_000);
    if (sinceWater > 3) return true;
  }
  return false;
}

// ── Grow Performance Panel ───────────────────────────────────────────────────

/**
/**
 * PRO: Emotional yield performance panel.
 * Shows potential vs current, loss %, visual progress bar, and trend.
 * FREE: Shows vague % with blurred detail + hard paywall CTA.
 */
function GrowPerformancePanel({
  isPro,
  yieldImpact,
  optScore,
  trend,
}: {
  isPro: boolean;
  yieldImpact: YieldImpactResult;
  optScore: number;
  trend: GrowTrend | null;
}) {
  const usedPercent = yieldImpact.potentialYield > 0
    ? Math.round((yieldImpact.currentEstimate / yieldImpact.potentialYield) * 100)
    : 100;

  const barColor =
    usedPercent >= 80 ? 'bg-emerald-500' :
    usedPercent >= 50 ? 'bg-amber-500'   : 'bg-rose-500';

  const lossMessage =
    yieldImpact.lossPercent >= 40
      ? 'Du verlierst gerade fast die Hälfte deines möglichen Ertrags.'
      : yieldImpact.lossPercent >= 20
        ? 'Dein Grow arbeitet gerade unter seinem Potenzial — das ist noch korrigierbar.'
        : yieldImpact.lossPercent > 0
          ? 'Du verlierst gerade Ertrag — kleine Korrekturen reichen.'
          : 'Dein Grow läuft nahe am vollen Potenzial.';

  const trendIcon  = !trend || trend.trend === 'stable' ? '→' : trend.trend === 'up' ? '↑' : '↓';
  const trendColor = !trend || trend.trend === 'stable' ? 'text-slate-400' : trend.trend === 'up' ? 'text-emerald-500' : 'text-rose-500';
  const trendLabel =
    !trend || trend.trend === 'stable'
      ? 'Stabil'
      : trend.trend === 'up'
        ? `+${trend.delta} gewonnen`
        : `${trend.delta} verloren`;

  if (isPro) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 shadow-sm space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">📊 Ertrag-Performance</p>
          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">PRO</span>
        </div>

        {/* Entry message — always visible before numbers */}
        <p className="text-sm font-black text-rose-700 leading-snug">
          {yieldImpact.totalLoss > 0
            ? lossMessage
            : 'Dein Grow läuft nahe am vollen Potenzial.'}
        </p>

        {/* Weekly loss rate */}
        {yieldImpact.weeklyLossRate > 0 && (
          <p className="text-[11px] font-bold text-rose-600 leading-tight">
            ⚠ Du verlierst gerade ~{yieldImpact.weeklyLossRate}g pro Woche.
          </p>
        )}

        {/* Projected yield vs Potential */}
        <div className="rounded-xl border border-white bg-white/80 px-3 py-2.5 shadow-sm space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Wenn nichts geändert wird</p>
              <p className="text-lg font-black text-slate-900 leading-tight mt-0.5">
                ~{yieldImpact.projectedYield}g
                <span className="text-sm font-semibold text-slate-400"> statt {yieldImpact.potentialYield}g möglich</span>
              </p>
            </div>
            {yieldImpact.lossPercent > 0 && (
              <p className="text-sm font-black text-rose-600">−{yieldImpact.lossPercent}%</p>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">{usedPercent}% des Potenzials genutzt</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-rose-100 bg-white px-2 py-2 text-center shadow-sm">
            <p className="text-base font-black text-rose-600">{yieldImpact.totalLoss > 0 ? `−${yieldImpact.totalLoss}g` : '—'}</p>
            <p className="text-[9px] font-semibold text-rose-400 mt-0.5 leading-tight">Verlust-Risiko</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white px-2 py-2 text-center shadow-sm">
            <p className={`text-base font-black ${optScore >= 80 ? 'text-emerald-600' : optScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{optScore}%</p>
            <p className="text-[9px] font-semibold text-slate-400 mt-0.5 leading-tight">Optimierung</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-2 py-2 text-center shadow-sm">
            <p className={`text-base font-black ${trendColor}`}>{trendIcon}</p>
            <p className={`text-[9px] font-semibold mt-0.5 leading-tight ${trendColor}`}>{trendLabel}</p>
          </div>
        </div>

        {/* Momentum sentence */}
        {trend && trend.trend !== 'stable' && (
          <p className={`text-[11px] font-semibold leading-tight ${trend.trend === 'up' ? 'text-emerald-700' : 'text-rose-600'}`}>
            {trend.trend === 'up'
              ? `↑ Du hast deinen Grow seit dem letzten Besuch um +${trend.delta} Punkte verbessert.`
              : `↓ Dein Grow hat ${Math.abs(trend.delta)} Punkte verloren — jetzt gegensteuern.`}
          </p>
        )}

        {/* Recovery upside */}
        {yieldImpact.totalGainPotential > 0 && (
          <p className="text-[11px] text-emerald-700 font-semibold leading-tight">
            ↑ +{yieldImpact.totalGainPotential}g mit dieser Aktion zurückholbar.
          </p>
        )}
      </div>
    );
  }

  // FREE — real % shown, exact grams blurred
  return (
    <Link href={'/pricing' as Route} className="block">
      <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 shadow-sm">

        {/* Header visible to all */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">📊 Ertrag-Performance</p>
        </div>

        {/* Entry message — always visible before numbers */}
        <p className="text-sm font-black text-rose-700 mb-3">
          {yieldImpact.lossPercent >= 20
            ? 'Du verlierst gerade spürbar Ertrag.'
            : 'Dein Grow läuft unter seinem Potenzial.'}
        </p>

        {/* Weekly loss visible, gram projection locked */}
        {yieldImpact.weeklyLossRate > 0 && (
          <p className="text-[11px] font-bold text-rose-600 mb-2 leading-tight">
            ⚠ Du verlierst gerade ~{yieldImpact.weeklyLossRate}g pro Woche.
          </p>
        )}

        {/* Progress bar with real %, projection locked */}
        <div className="rounded-xl border border-white bg-white/80 px-3 py-2.5 shadow-sm space-y-2 mb-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{usedPercent}% des Potenzials genutzt</p>
            </div>
            {yieldImpact.lossPercent > 0 && (
              <p className="text-xs font-black text-rose-600">−{yieldImpact.lossPercent}% Verlustrisiko</p>
            )}
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${usedPercent}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-rose-500 font-bold">🔒 Genaue Ertragszahlen nur für PRO sichtbar</p>
          </div>
        </div>

        {/* Blurred stats — real values, hidden */}
        <div className="grid grid-cols-3 gap-2 blur-[4px] select-none pointer-events-none mb-3">
          <div className="rounded-xl border border-rose-100 bg-white px-2 py-2 text-center">
            <p className="text-base font-black text-rose-600">{yieldImpact.totalLoss > 0 ? `−${yieldImpact.totalLoss}g` : '—'}</p>
            <p className="text-[9px] font-semibold text-rose-400 mt-0.5">Verlust-Risiko</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white px-2 py-2 text-center">
            <p className="text-base font-black text-amber-600">{optScore}%</p>
            <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Optimierung</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-2 py-2 text-center">
            <p className={`text-base font-black ${trendColor}`}>{trendIcon}</p>
            <p className={`text-[9px] font-semibold mt-0.5 ${trendColor}`}>{trendLabel}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-100/60 px-3 py-2.5">
          <p className="text-xs font-bold text-amber-900 leading-snug">Du siehst nur einen Teil — PRO zeigt dir, was du noch verlierst.</p>
          <span className="flex-shrink-0 rounded-full bg-amber-500 px-3 py-1.5 text-[10px] font-black text-white shadow-sm">🌟 PRO</span>
        </div>
      </div>
    </Link>
  );
}

// ── PRO Insight Gate ─────────────────────────────────────────────────────────

/**
 * Blurred teaser shown to FREE users in place of PRO intelligence data.
 * Clicking opens the profile page where plan upgrade will live.
 */
function ProInsightGate({
  yieldImpact,
  deepInsight,
  isPro,
}: {
  yieldImpact?: string;
  deepInsight?: string;
  isPro: boolean;
}) {
  if (!yieldImpact && !deepInsight) return null;

  if (isPro) {
    return (
      <div className="mt-2 space-y-1">
        {yieldImpact && (
          <p className="text-[11px] font-bold text-amber-300/90 leading-tight">
            📊 {yieldImpact}
          </p>
        )}
        {deepInsight && (
          <p className="text-[11px] text-white/70 leading-snug italic">
            🔬 {deepInsight}
          </p>
        )}
      </div>
    );
  }

  // FREE users — hide, panel handles conversion
  return null;
}

// ── Daily Action Card ────────────────────────────────────────────────────────

const DAILY_ACTION_CONFIG: Record<
  DailyAction['level'],
  { bg: string; border: string; icon: string; label: string; subtext: string; cta: string }
> = {
  critical: {
    bg:     'bg-rose-600',
    border: 'border-rose-700',
    icon:   '🚨',
    label:  'EINZIGE PRIORITÄT HEUTE',
    subtext:'text-rose-100',
    cta:    'bg-white text-rose-700 hover:bg-rose-50 shadow-sm',
  },
  warning: {
    bg:     'bg-amber-500',
    border: 'border-amber-600',
    icon:   '⚠️',
    label:  'HEUTE NICHT VERGESSEN',
    subtext:'text-amber-100',
    cta:    'bg-white text-amber-700 hover:bg-amber-50 shadow-sm',
  },
  info: {
    bg:     'bg-primary',
    border: 'border-primary-dark',
    icon:   '💡',
    label:  'HEUTE AKTIV BLEIBEN',
    subtext:'text-emerald-100',
    cta:    'bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm',
  },
  success: {
    bg:     'bg-emerald-700',
    border: 'border-emerald-800',
    icon:   '✓',
    label:  'TAG GESICHERT',
    subtext:'text-emerald-200',
    cta:    'bg-white/20 border border-white/30 text-white hover:bg-white/30',
  },
};

function DailyActionCard({
  action,
  scoreDelta,
  isPro,
}: {
  action: DailyAction;
  scoreDelta?: number | null;
  isPro: boolean;
}) {
  const cfg = DAILY_ACTION_CONFIG[action.level];
  const showDelta = scoreDelta != null && scoreDelta !== 0;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${cfg.bg} ${cfg.border} px-5 py-4 shadow-md`}>
      {/* Score delta badge */}
      {showDelta && scoreDelta != null && scoreDelta !== 0 && (
        <span
          className={`absolute right-4 top-3 animate-bounce rounded-full px-2.5 py-0.5 text-xs font-black shadow-md
            ${scoreDelta > 0 ? 'bg-white text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
        >
          {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} Score
        </span>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${cfg.subtext}`}>
            {cfg.icon} {cfg.label}
          </p>
          <p className="text-base font-black leading-snug text-white">{action.message}</p>
          <p className={`mt-1 text-xs leading-snug ${cfg.subtext}`}>{action.subtext}</p>
          {action.consequence && (
            <p className={`mt-1.5 text-[11px] font-semibold leading-tight opacity-90 ${cfg.subtext}`}>
              → {action.consequence}
            </p>
          )}
          {action.upside && (
            <p className="mt-1 text-[11px] font-semibold leading-tight text-emerald-100/90">
              ↑ {action.upside}
            </p>
          )}
          <ProInsightGate
            {...(action.yieldImpact ? { yieldImpact: action.yieldImpact } : {})}
            {...(action.deepInsight ? { deepInsight: action.deepInsight } : {})}
            isPro={isPro}
          />
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <Link
            href={action.ctaHref as Route}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-95 ${cfg.cta}`}
          >
            {action.ctaLabel}
          </Link>
          {action.recoveryGrams != null && action.recoveryGrams > 0 && (
            <p className="text-[10px] font-bold text-emerald-300/90 whitespace-nowrap">
              +{action.recoveryGrams}g mit dieser Aktion zurückholbar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Grow Status Header ────────────────────────────────────────────────────────

function scoreToIcon(score: number): string {
  if (score >= 85) return '🌟';
  if (score >= 70) return '✅';
  if (score >= 50) return '⚠️';
  return '🔴';
}

function scoreToMomentum(score: number, prevScore?: number): string {
  if (prevScore != null) {
    const delta = score - prevScore;
    if (delta >= 5)   return `Du hast deinen Grow um +${delta} Punkte verbessert.`;
    if (delta <= -10) return `Dein Grow hat ${Math.abs(delta)} Punkte verloren — du hast Fortschritt verloren.`;
    if (delta <= -5)  return `Dein Grow hat ${Math.abs(delta)} Punkte verloren — jetzt gegensteuern.`;
  }
  if (score >= 85) return 'Du bist heute auf Kurs — alles unter Kontrolle.';
  if (score >= 70) return 'Du bist in Gefahr — Potenzial wird täglich verschenkt.';
  if (score >= 50) return 'Du verlierst Ertrag — ein Eingriff stoppt das heute.';
  return 'Kritisch — jeder Tag ohne Aktion kostet dich Ertrag.';
}

function GrowStatusHeader({
  score,
  status,
  prevScore,
}: {
  score: number;
  status: GrowHealthStatus;
  prevScore?: number;
}) {
  const colors = {
    green:  { ring: 'ring-emerald-200 border-emerald-200', bg: 'bg-emerald-50',  text: 'text-emerald-700', score: 'text-emerald-600' },
    yellow: { ring: 'ring-amber-200 border-amber-200',     bg: 'bg-amber-50',    text: 'text-amber-700',   score: 'text-amber-600'   },
    red:    { ring: 'ring-rose-200 border-rose-200',       bg: 'bg-rose-50',     text: 'text-rose-700',    score: 'text-rose-600'    },
  }[status.color];

  const momentum = scoreToMomentum(score, prevScore);

  return (
    <div className={`flex items-center gap-4 rounded-2xl border px-4 py-3 ring-1 ${colors.bg} ${colors.ring}`}>
      <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ring-2 bg-white ${colors.ring}`}>
        <span className="text-2xl leading-none">{scoreToIcon(score)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-black leading-snug ${colors.text}`}>{momentum}</p>
        <p className={`text-xs opacity-80 mt-0.5 ${colors.text}`}>{status.text}</p>
        <p className={`text-[10px] font-bold uppercase tracking-wider opacity-60 mt-0.5 ${colors.text}`}>
          {status.yieldLabel}
        </p>
        <p className={`text-[10px] font-semibold opacity-70 mt-0.5 ${colors.text}`}>
          ↑ {status.upsideLabel}
        </p>
      </div>
    </div>
  );
}

// ── Plant Scoring ─────────────────────────────────────────────────────────────

/**
 * Higher score = healthier plant.
 * - +10 for any entry in the last 24h
 * - +5  for any entry in the last 3 days
 * - -3  for each day since last watering (capped at 21)
 * - 0   base when no data
 */
function scorePlant(plantEntries: LogEntry[]): number {
  if (plantEntries.length === 0) return 0;
  const newest = plantEntries[0]!;
  const sinceNewest = Math.floor((Date.now() - new Date(newest.date).getTime()) / 86_400_000);
  let score = 5;
  if (sinceNewest === 0) score += 10;
  else if (sinceNewest <= 3) score += 5;

  const lastWater = plantEntries.find((e) => e.data.type === "wasser");
  if (lastWater) {
    const gap = Math.floor((Date.now() - new Date(lastWater.date).getTime()) / 86_400_000);
    score -= Math.min(gap * 3, 21);
  } else {
    score -= 10; // never watered
  }
  return score;
}

type PlantWithScore = { id: string; name: string; score: number };

function computePlantComparison(
  plants: Plant[],
  entriesById: Map<string, LogEntry[]>,
): { best: PlantWithScore | null; worst: PlantWithScore | null } {
  if (plants.length < 2) return { best: null, worst: null };
  const scored: PlantWithScore[] = plants.map((p) => ({
    id: p.id,
    name: p.name,
    score: scorePlant(entriesById.get(p.id) ?? []),
  }));
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const best  = sorted[0] ?? null;
  const worst = sorted[sorted.length - 1] ?? null;
  // Only surface worst if it's meaningfully behind best
  if (best && worst && best.id === worst.id) return { best, worst: null };
  if (best && worst && best.score - worst.score < 3) return { best: null, worst: null };
  return { best, worst };
}

// ── Plant Comparison Bar ──────────────────────────────────────────────────────

function PlantComparisonBar({
  best,
  worst,
  growId,
  worstEntries,
}: {
  best: PlantWithScore | null;
  worst: PlantWithScore | null;
  growId: string;
  worstEntries: LogEntry[];
}) {
  if (!best && !worst) return null;
  const worstReason = worst ? getWorstReason(worstEntries) : null;
  return (
    <div className="mb-3 flex items-stretch gap-2">
      {best && (
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <span className="text-base leading-none">🟢</span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Beste Pflanze</p>
            <p className="truncate text-xs font-bold text-emerald-800">{best.name}</p>
          </div>
        </div>
      )}
      {worst && (
        <div className="flex flex-1 flex-col gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <span className="text-base leading-none">🔴</span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Braucht Pflege</p>
              <p className="truncate text-xs font-bold text-rose-800">{worst.name}</p>
              {worstReason && (
                <p className="mt-0.5 text-[11px] leading-tight text-rose-500">{worstReason}</p>
              )}
            </div>
          </div>
          <Link
            href={`/grow/${growId}/log?plant=${worst.id}` as Route}
            className="flex items-center justify-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700 active:scale-[0.97]"
          >
            Jetzt pflegen →
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Plant Card ────────────────────────────────────────────────────────────────

type PlantVariant = "default" | "best" | "worst";

type PlantCardProps = {
  plant: Plant;
  growId: string;
  plantEntries: LogEntry[];
  isSelected: boolean;
  isEditing: boolean;
  draftName: string;
  isEditingNotes: boolean;
  draftNotes: string;
  variant?: PlantVariant;
  isCritical?: boolean;
  onSelect: () => void;
  onDraftChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onRename: () => void;
  onDraftNotesChange: (v: string) => void;
  onSaveNotes: () => void;
  onEditNotes: () => void;
  onCancelNotes: () => void;
};

const CARD_VARIANT_CLASSES: Record<PlantVariant, string> = {
  default: "border-slate-200 bg-white hover:border-slate-300",
  best:    "border-emerald-300 bg-emerald-50/40 hover:border-emerald-400",
  worst:   "border-rose-300 bg-rose-50/40 hover:border-rose-400",
};

function PlantCard({
  plant,
  growId,
  plantEntries,
  isSelected,
  isEditing,
  draftName,
  isEditingNotes,
  draftNotes,
  variant = "default",
  isCritical = false,
  onSelect,
  onDraftChange,
  onSave,
  onCancel,
  onRename,
  onDraftNotesChange,
  onSaveNotes,
  onEditNotes,
  onCancelNotes,
}: PlantCardProps) {
  const status = computePlantStatus(plantEntries);
  const { label: statusLabel, classes: statusClasses } = PLANT_STATUS_CONFIG[status];
  const microInsight = getPlantMicroInsight(plantEntries);
  const microInsightClass =
    microInsight.level === 'good'     ? 'text-emerald-600' :
    microInsight.level === 'critical' ? 'text-rose-600 font-semibold' :
                                        'text-amber-600';

  const baseClasses = isSelected
    ? "border-emerald-400 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-200"
    : CARD_VARIANT_CLASSES[variant];

  return (
    <div className={`rounded-2xl border transition-all ${baseClasses}`}>
      {/* ── Critical alert strip ── */}
      {isCritical && !isSelected && (
        <div className="flex items-center gap-1.5 border-b border-rose-200 bg-rose-100 px-4 py-1.5">
          <span className="text-[11px]">&#x26A0;&#xFE0F;</span>
          <span className="text-[11px] font-bold text-rose-700">Handlung nötig</span>
        </div>
      )}
      {/* ── Name + status ── */}
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center gap-3 px-4 pt-3 pb-2 text-left"
      >
        <span className="text-xl leading-none">🌿</span>
        {isEditing ? (
          <input
            value={draftName}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
              if (e.key === "Escape") onCancel();
            }}
            onClick={(e) => e.stopPropagation()}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-bold text-slate-800 focus:border-emerald-400 focus:outline-none"
            autoFocus
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">
            {plant.name}
          </span>
        )}
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClasses}`}>
          {statusLabel}
        </span>
      </button>

      {/* ── Micro insight ── */}
      <div className="px-4 pb-2.5">
        <p className={`text-[11px] leading-tight ${microInsightClass}`}>{microInsight.text}</p>
        {microInsight.consequence && microInsight.level !== 'good' && (
          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">→ {microInsight.consequence}</p>
        )}
      </div>

      {/* ── Plant Notes ── */}
      {isEditingNotes ? (
        <div className="mx-4 mb-3 space-y-2">
          <textarea
            value={draftNotes}
            onChange={(e) => onDraftNotesChange(e.target.value)}
            placeholder="Notiz zur Pflanze…"
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700
              placeholder:text-slate-300 focus:border-emerald-400 focus:outline-none resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSaveNotes}
              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={onCancelNotes}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : plant.notes ? (
        <div className="mx-4 mb-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
          <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">{plant.notes}</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEditNotes(); }}
            className="mt-1 text-[10px] font-semibold text-slate-400 hover:text-emerald-600 transition-colors"
          >
            Notiz bearbeiten
          </button>
        </div>
      ) : null}

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-2.5">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={onSave}
              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50"
            >
              Abbrechen
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/grow/${growId}/log?plant=${plant.id}` as Route}
              className={`rounded-lg px-3 py-1 text-xs font-bold text-white transition active:scale-[0.97] ${
                variant === "worst"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {variant === "worst" ? "+ Log jetzt" : "+ Log"}
            </Link>
            <Link
              href={'/diagnose' as Route}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-600"
            >
              Diagnose
            </Link>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRename(); }}
              className="ml-auto rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-50"
            >
              Umbenennen
            </button>
            {!plant.notes && !isEditingNotes && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEditNotes(); }}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-50"
              >
                + Notiz
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Harvest Section ───────────────────────────────────────────────────────────

function HarvestSection({ grow, onSave }: { grow: Grow; onSave: (data: HarvestData) => void }) {
  const existing = grow.harvest;
  const [editing, setEditing] = useState(false);
  const [grams, setGrams] = useState(String(existing?.grams ?? ''));
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [notes, setNotes] = useState(existing?.notes ?? '');

  function handleSave() {
    const g = parseFloat(grams);
    if (!g || g <= 0 || rating < 1) return;
    onSave({
      grams: g,
      rating,
      notes: notes.trim() || undefined,
      recordedAt: new Date().toISOString(),
    } as HarvestData);
    setEditing(false);
  }

  if (!editing && existing) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-emerald-700">🌿 Ernte erfasst</p>
          <button
            type="button"
            onClick={() => { setEditing(true); }}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            Bearbeiten
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-700">{existing.grams}g</p>
            <p className="text-[10px] uppercase tracking-wide text-emerald-600">Trockengewicht</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`text-xl ${s <= existing.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
            ))}
          </div>
        </div>
        {existing.notes && (
          <p className="mt-3 rounded-xl bg-emerald-100/60 px-3 py-2 text-xs text-emerald-800 leading-relaxed">
            {existing.notes}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-bold text-foreground mb-4">
        {existing ? '✏️ Ernte bearbeiten' : '🌿 Ernte erfassen'}
      </p>
      <div className="space-y-4">
        {/* Grams */}
        <div>
          <label className="block text-xs font-semibold text-muted-fg mb-1">Trockengewicht (g)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={grams}
            onChange={e => setGrams(e.target.value)}
            placeholder="z.B. 45.5"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground
              placeholder:text-slate-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        {/* Rating */}
        <div>
          <label className="block text-xs font-semibold text-muted-fg mb-1.5">Bewertung</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className={`text-2xl transition-transform hover:scale-110 ${s <= rating ? 'text-amber-400' : 'text-slate-200'}`}
              >★</button>
            ))}
          </div>
        </div>
        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-muted-fg mb-1">Notizen (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Geschmack, Potenz-Einschätzung, was anders machen…"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground
              placeholder:text-slate-300 focus:border-emerald-400 focus:outline-none resize-none"
          />
        </div>
        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!grams || parseFloat(grams) <= 0 || rating < 1}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark
              disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Ernte speichern
          </button>
          {(editing && existing) && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-background transition"
            >
              Abbrechen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GrowPage({}: Props) {
  const { id } = useParams<{ id: string }>();
  const { grows, loaded, completeTask, updateGrow, advancePhase } = useGrowState();
  const { entries } = useGrowLog(id);
  const { user } = useAuth();
  const isPro = user?.plan === 'pro' || user?.plan === 'team' || user?.role === 'TEAM';

  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [draftPlantName, setDraftPlantName] = useState("");
  const [editingPlantNotesId, setEditingPlantNotesId] = useState<string | null>(null);
  const [draftPlantNotes, setDraftPlantNotes] = useState("");
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);
  const prevEntriesLen = useRef<number | null>(null);
  const prevScoreRef = useRef<number | null>(null);

  const grow = loaded ? (grows.find((g) => g.id === id) ?? null) : null;
  const notFound = loaded && grow === null;

  const handleComplete = useCallback((taskId: string) => {
    if (!grow) return;
    completeTask(grow.id, taskId);
  }, [grow, completeTask]);

  const effectiveSelectedPlantId = useMemo(() => {
    if (!grow || grow.plants.length === 0) return null;
    if (selectedPlantId && grow.plants.some((p) => p.id === selectedPlantId)) {
      return selectedPlantId;
    }
    return grow.plants[0]?.id ?? null;
  }, [grow, selectedPlantId]);

  const healthScoreForEffects = grow ? getGrowHealthScore(grow, entries) : 0;
  const optScoreForEffects = grow ? getOptimizationScore(grow, entries) : 0;

  useEffect(() => {
    if (!grow) return;
    const newLen = entries.length;
    if (prevEntriesLen.current !== null && newLen > prevEntriesLen.current) {
      const prev = prevScoreRef.current;
      if (prev !== null) {
        setScoreDelta(healthScoreForEffects - prev);
      }
    }
    prevEntriesLen.current = newLen;
    prevScoreRef.current = healthScoreForEffects;
  }, [grow, entries.length, healthScoreForEffects]);

  const growTrend = useMemo<GrowTrend | null>(() => {
    if (!grow || typeof window === 'undefined') return null;
    const key = `secretleaf.optscore.${grow.id}`;
    const stored = localStorage.getItem(key);
    if (stored === null) return null;
    const prev = Number(stored);
    if (Number.isNaN(prev) || prev === optScoreForEffects) return null;
    return computeTrend(prev, optScoreForEffects);
  }, [grow, optScoreForEffects]);

  useEffect(() => {
    if (!grow) return;
    const key = `secretleaf.optscore.${grow.id}`;
    localStorage.setItem(key, String(optScoreForEffects));
  }, [grow, optScoreForEffects]);

  const startRenamePlant = useCallback((plantId: string, currentName: string) => {
    setEditingPlantId(plantId);
    setDraftPlantName(currentName);
  }, []);

  const cancelRenamePlant = useCallback(() => {
    setEditingPlantId(null);
    setDraftPlantName("");
  }, []);

  const savePlantName = useCallback((plantId: string) => {
    if (!grow) return;
    const nextName = draftPlantName.trim();
    if (nextName.length < 1) return;

    updateGrow(grow.id, {
      plants: grow.plants.map((plant) =>
        plant.id === plantId ? { ...plant, name: nextName } : plant
      ),
    });
    setEditingPlantId(null);
    setDraftPlantName("");
  }, [grow, draftPlantName, updateGrow]);

  const startEditPlantNotes = useCallback((plantId: string, currentNotes: string) => {
    setEditingPlantNotesId(plantId);
    setDraftPlantNotes(currentNotes);
  }, []);

  const cancelEditPlantNotes = useCallback(() => {
    setEditingPlantNotesId(null);
    setDraftPlantNotes("");
  }, []);

  const savePlantNotes = useCallback((plantId: string) => {
    if (!grow) return;
    const trimmed = draftPlantNotes.trim();
    updateGrow(grow.id, {
      plants: grow.plants.map((plant) => {
        if (plant.id !== plantId) return plant;
        if (trimmed) return { ...plant, notes: trimmed };
        const rest = { ...plant };
        delete (rest as { notes?: string }).notes;
        return rest;
      }),
    });
    setEditingPlantNotesId(null);
    setDraftPlantNotes("");
  }, [grow, draftPlantNotes, updateGrow]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
        <div className="mx-auto max-w-2xl animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-40 rounded-2xl bg-slate-100" />
          <div className="h-64 rounded-2xl bg-slate-100" />
        </div>
      </main>
    );
  }

  if (notFound || !grow) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="space-y-4 text-center">
          <span className="text-5xl">🌿</span>
          <h1 className="text-xl font-bold text-slate-900">Grow nicht gefunden</h1>
          <p className="text-sm text-slate-500">Dieser Grow existiert nicht oder wurde gelöscht.</p>
          <Link
            href={'/start' as Route}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            🌱 Neuen Grow starten
          </Link>
        </div>
      </main>
    );
  }

  const currentPhase = getPhaseForDay(grow.plan, grow.currentDay);
  const upcoming     = getUpcomingTasks(grow, 5);
  const overdue      = getOverdueTasks(grow);
  const { percent }  = getTaskProgress(grow);

  // Intelligence layer
  const healthScore  = healthScoreForEffects;
  const healthStatus = getGrowHealthStatus(healthScore);
  const dailyAction  = getDailyAction(grow, entries);
  const priorities   = getGrowPriorities(grow, entries);
  const yieldImpact  = getTotalYieldImpact(priorities, getPotentialYield(grow));
  const optScore     = optScoreForEffects;

  const showPerformancePanel = entries.length >= 3 || healthScore < 70;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-5">

        {/* ── Daily Action Card ────────────────────────── */}
        <DailyActionCard action={dailyAction} scoreDelta={scoreDelta} isPro={isPro} />

        {/* ── Grow Overview ───────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-400" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Aktiver Grow</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">{grow.name}</h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <span>{currentPhase ? PHASE_ICONS[currentPhase.id] : '🌿'}</span>
                    <span className="font-medium text-slate-700">{currentPhase?.label ?? '—'}</span>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>Tag {grow.currentDay}</span>
                  <span className="text-slate-300">·</span>
                  <span>{grow.pflanzenAnzahl} {grow.pflanzenAnzahl === 1 ? 'Pflanze' : 'Pflanzen'}</span>
                </div>
              </div>
              <div className="flex-shrink-0 rounded-xl bg-emerald-50 px-3 py-1.5 text-center">
                <span className="block text-lg font-black text-emerald-700">{percent}%</span>
                <span className="text-[10px] font-medium text-emerald-600">erledigt</span>
              </div>
            </div>
            <div className="mt-4"><GrowProgressBar grow={grow} /></div>
            <div className="mt-4"><PhaseTimeline grow={grow} /></div>

          </div>
        </div>

        {/* ── Phase Suggestion ─────────────────────────── */}
        {(() => {
          if (!currentPhase || grow.status !== 'aktiv') return null;
          if (grow.currentDay <= currentPhase.endDay) return null;
          const currentIdx = PHASE_ORDER.indexOf(currentPhase.id);
          const nextPhaseId = PHASE_ORDER[currentIdx + 1];
          if (!nextPhaseId) return null;
          const nextPhase = grow.plan.phases.find(p => p.id === nextPhaseId);
          if (!nextPhase) return null;
          const overdueDays = grow.currentDay - currentPhase.endDay;
          return (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/60 p-4 flex items-center justify-between gap-3 shadow-sm">
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  👉 Bereit für die nächste Phase
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {currentPhase.label} war vor {overdueDays} {overdueDays === 1 ? 'Tag' : 'Tagen'} geplant abgeschlossen zu sein.
                </p>
              </div>
              <button
                type="button"
                onClick={() => advancePhase(grow.id, nextPhaseId)}
                className="flex-shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white
                  hover:bg-emerald-700 transition active:scale-95"
              >
                → {nextPhase.label}
              </button>
            </div>
          );
        })()}
        {/* ── Grow Status Header ───────────────────────── */}
        <GrowStatusHeader score={healthScore} status={healthStatus} />

        {/* ── Performance Panel ────────────────────────── */}
        {showPerformancePanel && (
          <GrowPerformancePanel
            isPro={isPro}
            yieldImpact={yieldImpact}
            optScore={optScore}
            trend={growTrend}
          />
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-slate-900">
            Pflanzen ({grow.plants.length})
          </h2>
          {(() => {
            const entriesById = new Map(
              grow.plants.map((p) => [p.id, entries.filter((e) => e.plantId === p.id)])
            );
            const { best, worst } = computePlantComparison(grow.plants, entriesById);
            return (
              <>
                <PlantComparisonBar
                  best={best}
                  worst={worst}
                  growId={grow.id}
                  worstEntries={worst ? (entriesById.get(worst.id) ?? []) : []}
                />
                <div className="space-y-3">
                  {grow.plants.map((plant) => {
                    const plantEntries = entriesById.get(plant.id) ?? [];
                    const variant: PlantVariant =
                      best?.id === plant.id ? "best" :
                      worst?.id === plant.id ? "worst" : "default";
                    return (
                      <PlantCard
                        key={plant.id}
                        plant={plant}
                        growId={grow.id}
                        plantEntries={plantEntries}
                        isSelected={effectiveSelectedPlantId === plant.id}
                        isEditing={editingPlantId === plant.id}
                        draftName={draftPlantName}
                        isEditingNotes={editingPlantNotesId === plant.id}
                        draftNotes={draftPlantNotes}
                        variant={variant}
                        isCritical={isPlantCritical(plantEntries)}
                        onSelect={() => setSelectedPlantId(plant.id)}
                        onDraftChange={setDraftPlantName}
                        onSave={() => savePlantName(plant.id)}
                        onCancel={cancelRenamePlant}
                        onRename={() => startRenamePlant(plant.id, plant.name)}
                        onDraftNotesChange={setDraftPlantNotes}
                        onSaveNotes={() => savePlantNotes(plant.id)}
                        onEditNotes={() => startEditPlantNotes(plant.id, plant.notes ?? "")}
                        onCancelNotes={cancelEditPlantNotes}
                      />
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>

        {/* ── Overdue tasks ────────────────────────────── */}
        {overdue.length > 0 && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-rose-700">
              <span>⚠️</span>
              {overdue.length === 1 ? '1 überfälliger Task' : `${overdue.length} überfällige Tasks`}
            </h2>
            <div className="space-y-2">
              {overdue.map((task) => (
                <TaskItem key={task.id} task={task} currentDay={grow.currentDay} onComplete={handleComplete} />
              ))}
            </div>
          </div>
        )}

        {/* ── Upcoming tasks ───────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {upcoming.length === 0 ? 'Tasks' : `Nächste ${upcoming.length} Tasks`}
            </h2>
            <Link href={`/grow/${grow.id}/log` as Route} className="text-xs font-semibold text-emerald-600 hover:underline">
              Alle →
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
              <span className="text-3xl">✨</span>
              <p className="mt-2 text-sm font-semibold text-slate-600">Alle Tasks erledigt!</p>
              <p className="mt-1 text-xs text-slate-400">Keine weiteren Tasks für diesen Grow geplant.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((task) => (
                <TaskItem key={task.id} task={task} currentDay={grow.currentDay} onComplete={handleComplete} />
              ))}
            </div>
          )}
        </div>

        {/* ── Quick Actions ────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Schnellzugriff</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link
              href={`/grow/${grow.id}/log` as Route}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-2 py-3 text-center transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              <span className="text-2xl">📓</span>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">Log hinzufügen</span>
            </Link>
            <Link
              href={'/tools' as Route}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-2 py-3 text-center transition hover:border-cyan-200 hover:bg-cyan-50"
            >
              <span className="text-2xl">🧪</span>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">Tools öffnen</span>
            </Link>
            <Link
              href={'/diagnose' as Route}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-2 py-3 text-center transition hover:border-violet-200 hover:bg-violet-50"
            >
              <span className="text-2xl">🩺</span>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">Diagnose</span>
            </Link>
          </div>
        </div>

        {/* ── Smart Insights ───────────────────────────── */}
        <SmartInsights grow={grow} />

        {/* ── Harvest Data ─────────────────────────────── */}
        {(grow.status === 'abgeschlossen' || grow.currentPhaseId === 'ernte') && (
          <HarvestSection
            grow={grow}
            onSave={(data) => updateGrow(grow.id, { harvest: data })}
          />
        )}

        {/* ── Phase description ────────────────────────── */}
        {currentPhase && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-5 py-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Aktuelle Phase</p>
            <p className="mt-1 font-semibold text-slate-800">
              {PHASE_ICONS[currentPhase.id]} {currentPhase.label}
            </p>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">{currentPhase.description}</p>
            <p className="mt-2 text-xs text-slate-400">
              Tag {currentPhase.startDay}–{currentPhase.endDay} · noch {Math.max(0, currentPhase.endDay - grow.currentDay + 1)} Tage
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
