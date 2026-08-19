'use client';

// ────────────────────────────────────────────────────────────────────────────
// Grow OS — /grow/[id]
//
// Grow session: overview, current phase, upcoming & overdue tasks (with
// complete action), quick actions and phase timeline.
//
// Layout redesigned 2026-08-07 (DESIGN_SYSTEM.md §2.4 "Calm Interfaces" /
// §12 "Visual Density"): the previous version stacked three independent
// red/amber "you're losing yield" surfaces (Daily Action banner, Grow
// Status Header, PRO paywall) in the first viewport, plus 8+ identically
// weighted bordered cards with no hierarchy. This version consolidates to
// one calm hero, one "Today" zone (the only place urgent color appears),
// a decluttered main column, and a single sidebar Insights card. All data
// hooks/calculators below are unchanged from the previous version — only
// the presentational components and their arrangement changed.
// ────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import type { Route } from 'next';
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown';
import { Card } from '@/components/ui/Card';
import { IconChip, type IconChipTone } from '@/components/ui/IconChip';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { ProgressBar, type ProgressBarTone } from '@/components/ui/ProgressBar';
import { useGrowState } from '@/hooks/useGrowState';
import { useGrowLog } from '@/hooks/useGrowLog';
import { useAuth } from '@/hooks/useAuth';
import { useAssistantPreference } from '@/hooks/useAssistantPreference';
import { getUpcomingTasks, getOverdueTasks, getTaskProgress, getPhaseForDay } from '@/lib/grow/planGenerator';
import { getPhaseRelativeDay } from '@/lib/grow/utils';
import { PHASE_ICONS, PHASE_ORDER } from '@/lib/grow/phases';
import { GROW_STATUS_LABELS } from '@/lib/grow/types';
import { TASK_CATEGORY_ICONS } from '@/lib/grow/taskIcons';
import type { GrowTask, Grow, Plant, LogEntry, HarvestData, GrowPhaseId, GrowStatus } from '@/lib/grow/types';
import SmartInsights from '@/components/SmartInsights';
import GrowKnowledgePanel from '@/components/grow/GrowKnowledgePanel';
import RecommendationsPanel from '@/components/grow/RecommendationsPanel';
import SaveGrowBanner from '@/components/grow/SaveGrowBanner';
import { PremiumScrollFx } from '@/components/scroll/PremiumScrollFx';
import { Analytics } from '@/lib/analytics';
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
import {
  Settings, Sprout, AlertTriangle, CheckCircle2, Info, Sparkles,
  TrendingUp, TrendingDown, Minus, NotebookPen, Wrench, Stethoscope,
  ArrowRight, ChevronDown, Star, Leaf, BarChart3, Pencil,
  type LucideIcon,
} from 'lucide-react';

// ── Shared section wrapper ──────────────────────────────────────────────────
// Calm by default: a plain Card + IconChip header. Colored accents are no
// longer echoed on every card — only the Today card (§ below) is allowed
// urgent color, per DESIGN_SYSTEM.md §2.4.

function Section({
  icon: Icon, tone = 'primary', title, badge, className = '', children, revealDelay,
}: {
  icon: LucideIcon;
  tone?: IconChipTone;
  title: string;
  badge?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  revealDelay?: number;
}) {
  return (
    <Card
      padding="lg"
      className={`space-y-4 ${className}`}
      data-reveal
      {...(revealDelay ? { 'data-reveal-delay': revealDelay } : {})}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconChip icon={Icon} tone={tone} />
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
        </div>
        {badge}
      </div>
      {children}
    </Card>
  );
}

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
  if (dueDay < currentDay) return 'text-rose-400 font-semibold';
  if (dueDay === currentDay) return 'text-primary font-semibold';
  return 'text-muted-fg';
}

// ── Progress ──────────────────────────────────────────────────────────────────

function GrowProgress({ grow, currentPhase }: { grow: Grow; currentPhase: Grow['plan']['phases'][number] | null | undefined }) {
  const { completed, total, percent } = getTaskProgress(grow);
  const phaseProgress = grow.plan.totalDays > 0
    ? Math.min(100, Math.round((grow.currentDay / grow.plan.totalDays) * 100))
    : 0;
  const phaseDay = currentPhase ? getPhaseRelativeDay(grow.currentDay, currentPhase) : null;

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-fg">Grow-Fortschritt</span>
          <span className="font-semibold text-foreground">
            {currentPhase && phaseDay !== null ? `${currentPhase.label}-Tag ${phaseDay} · ` : ''}
            Tag {grow.currentDay} / {grow.plan.totalDays}
          </span>
        </div>
        <ProgressBar percent={phaseProgress} />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-fg">Tasks erledigt</span>
          <span className="font-semibold text-foreground">{completed} / {total}</span>
        </div>
        <ProgressBar percent={percent} size="sm" />
      </div>
    </div>
  );
}

// ── Phase timeline ────────────────────────────────────────────────────────────

function PhaseTimeline({ grow }: { grow: Grow }) {
  // currentPhaseId is the manually-settable source of truth (see advancePhase);
  // date-derived getPhaseForDay is only a fallback for legacy/missing data.
  const currentPhase = grow.plan.phases.find((p) => p.id === grow.currentPhaseId)
    ?? getPhaseForDay(grow.plan, grow.currentDay);
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {grow.plan.phases.map((phase, idx) => {
        const isPast   = grow.currentDay > phase.endDay;
        const isActive = currentPhase?.id === phase.id;
        const PhaseIcon = PHASE_ICONS[phase.id];
        return (
          <div key={phase.id} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 ${
                isActive ? 'bg-primary text-white ring-2 ring-primary/30' :
                isPast   ? 'bg-primary/20 text-primary' :
                           'bg-surface text-muted-fg'
              }`}>
                <PhaseIcon className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
              <span className={`text-[9px] font-semibold whitespace-nowrap ${
                isActive ? 'text-primary' : isPast ? 'text-muted-fg' : 'text-muted-fg/50'
              }`}>
                {phase.label.replace('phase', '').replace('Vegetations', 'Veg').replace('Spät', 'Spät')}
              </span>
            </div>
            {idx < grow.plan.phases.length - 1 && (
              <div className={`mb-4 h-px w-4 flex-shrink-0 ${isPast ? 'bg-primary/30' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Grow Hero ─────────────────────────────────────────────────────────────────
// Merges the previous "Grow Overview" card and sidebar "Grow Status Header"
// into one calm, bigger-typography hero. Quick actions fold in here instead
// of occupying their own sidebar card.

function healthSummary(score: number): string {
  if (score >= 85) return 'Läuft rund — du bist voll auf Kurs.';
  if (score >= 70) return 'Guter Kurs. Ein paar Kleinigkeiten warten.';
  if (score >= 50) return 'Ein paar Dinge brauchen deine Aufmerksamkeit.';
  return 'Zeit für ein Update — schau kurz rein.';
}

const QUICK_LINKS: Array<{ icon: LucideIcon; label: string; href: (growId: string) => Route }> = [
  { icon: NotebookPen, label: 'Log', href: (id) => `/grow/${id}/log` as Route },
  { icon: Wrench, label: 'Tools', href: () => '/tools' as Route },
  { icon: Stethoscope, label: 'Diagnose', href: (id) => `/diagnose?growId=${id}` as Route },
];

function GrowHero({
  grow,
  currentPhase,
  percent,
  healthScore,
  healthStatus,
  advancePhase,
}: {
  grow: Grow;
  currentPhase: Grow['plan']['phases'][number] | null | undefined;
  percent: number;
  healthScore: number;
  healthStatus: GrowHealthStatus;
  advancePhase: (growId: string, phaseId: GrowPhaseId) => void;
}) {
  const statusTone: IconChipTone = healthStatus.color === 'green' ? 'primary' : healthStatus.color === 'yellow' ? 'amber' : 'rose';
  const StatusIcon = healthScore >= 85 ? Sparkles : healthScore >= 70 ? CheckCircle2 : AlertTriangle;

  const PhaseIcon = currentPhase ? PHASE_ICONS[currentPhase.id] : Leaf;

  return (
    <Card padding="lg" className="space-y-5" data-reveal>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Aktiver Grow</p>
          <h1 className="mt-1 text-3xl font-bold leading-tight text-foreground sm:text-4xl">{grow.name}</h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-fg">
            <span className="flex items-center gap-1.5" title="Wachstumsphase manuell umstellen">
              <PhaseIcon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
              <Dropdown
                variant="ghost"
                value={currentPhase?.id ?? grow.currentPhaseId}
                onChange={(v) => advancePhase(grow.id, v as GrowPhaseId)}
              >
                {grow.plan.phases.map((phase) => (
                  <DropdownOption key={phase.id} value={phase.id}>{phase.label}</DropdownOption>
                ))}
              </Dropdown>
            </span>
            <span className="text-border">·</span>
            <span>
              {currentPhase ? `Phase-Tag ${getPhaseRelativeDay(grow.currentDay, currentPhase)} · ` : ''}
              Tag {grow.currentDay} gesamt
            </span>
            <span className="text-border">·</span>
            <span>{grow.pflanzenAnzahl} {grow.pflanzenAnzahl === 1 ? 'Pflanze' : 'Pflanzen'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:flex-shrink-0">
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{percent}%</p>
            <p className="text-[11px] text-muted-fg">erledigt</p>
          </div>
          <IconChip icon={StatusIcon} tone={statusTone} size="lg" />
        </div>
      </div>

      <GrowProgress grow={grow} currentPhase={currentPhase} />
      <PhaseTimeline grow={grow} />

      <p className="text-xs text-muted-fg">{healthSummary(healthScore)}</p>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
          <Link
            key={label}
            href={href(grow.id)}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:border-primary/30 hover:bg-primary/10"
          >
            <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            {label}
          </Link>
        ))}
      </div>
    </Card>
  );
}

// ── Today card ────────────────────────────────────────────────────────────────
// The one place urgent/red color is allowed. Merges the previous Daily
// Action banner + Phase Suggestion banner + Overdue Tasks list — three
// separately-bordered surfaces that all said some version of "pay
// attention now" — into a single focused card.

const DAILY_ACTION_CONFIG: Record<
  DailyAction['level'],
  { border: string; bg: string; bar: string; tone: IconChipTone; label: string; labelText: string; cta: string; deltaTone: (positive: boolean) => BadgeTone; icon: LucideIcon }
> = {
  critical: { border: 'border-rose-500/30', bg: 'bg-rose-500/5', bar: 'from-rose-400 to-rose-600', tone: 'rose', icon: AlertTriangle, label: 'Einzige Priorität heute', labelText: 'text-rose-600 dark:text-rose-400', cta: 'bg-rose-600 text-white hover:bg-rose-700', deltaTone: (p) => (p ? 'primary' : 'rose') },
  warning:  { border: 'border-amber-500/30', bg: 'bg-amber-500/5', bar: 'from-amber-400 to-amber-600', tone: 'amber', icon: AlertTriangle, label: 'Heute nicht vergessen', labelText: 'text-amber-600 dark:text-amber-400', cta: 'bg-amber-500 text-white hover:bg-amber-600', deltaTone: (p) => (p ? 'primary' : 'rose') },
  info:     { border: 'border-primary/30', bg: 'bg-primary/5', bar: 'from-primary to-primary-dark', tone: 'primary', icon: Info, label: 'Heute aktiv bleiben', labelText: 'text-primary', cta: 'bg-primary text-white hover:bg-primary-dark', deltaTone: (p) => (p ? 'primary' : 'rose') },
  success:  { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', bar: 'from-emerald-400 to-emerald-600', tone: 'primary', icon: CheckCircle2, label: 'Tag gesichert', labelText: 'text-emerald-600 dark:text-emerald-400', cta: 'border border-emerald-500/30 bg-card text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40', deltaTone: (p) => (p ? 'primary' : 'rose') },
};

function ProInsightGate({ yieldImpact, deepInsight, isPro }: { yieldImpact?: string; deepInsight?: string; isPro: boolean }) {
  if (!isPro || (!yieldImpact && !deepInsight)) return null;
  return (
    <div className="mt-2 space-y-1">
      {yieldImpact && (
        <p className="flex items-start gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-300/90 leading-tight">
          <BarChart3 className="mt-px h-3 w-3 flex-shrink-0" strokeWidth={2} />
          {yieldImpact}
        </p>
      )}
      {deepInsight && <p className="text-[11px] text-muted-fg leading-snug italic">{deepInsight}</p>}
    </div>
  );
}

type PhaseSuggestion = {
  currentPhaseLabel: string;
  overdueDays: number;
  nextPhase: { id: GrowPhaseId; label: string };
};

function TodayCard({
  action,
  scoreDelta,
  isPro,
  overdue,
  currentDay,
  onComplete,
  phaseSuggestion,
  onAdvancePhase,
}: {
  action: DailyAction | null;
  scoreDelta?: number | null;
  isPro: boolean;
  overdue: GrowTask[];
  currentDay: number;
  onComplete: (taskId: string) => void;
  phaseSuggestion: PhaseSuggestion | null;
  onAdvancePhase: (phaseId: GrowPhaseId) => void;
}) {
  const cfg = action ? DAILY_ACTION_CONFIG[action.level] : DAILY_ACTION_CONFIG.warning;
  const Icon = action ? cfg.icon : AlertTriangle;
  const showDelta = action != null && scoreDelta != null && scoreDelta !== 0;

  return (
    <Card padding="lg" className={`relative overflow-hidden border ${cfg.border} ${cfg.bg}`} data-reveal>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${cfg.bar}`} />

      {showDelta && scoreDelta != null && (
        <Badge tone={cfg.deltaTone(scoreDelta > 0)} className="absolute right-4 top-3">
          {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} Score
        </Badge>
      )}

      {action && (
        <div className="flex items-start gap-3 pt-1">
          <IconChip icon={Icon} tone={cfg.tone} />
          <div className="min-w-0 flex-1">
            <p className={`text-[10px] font-black uppercase tracking-widest ${cfg.labelText}`}>{cfg.label}</p>
            <p className="mt-1 text-base font-bold leading-snug text-foreground">{action.message}</p>
            <p className="mt-1 text-xs leading-snug text-muted-fg">{action.subtext}</p>
            {action.consequence && (
              <p className="mt-1.5 flex items-start gap-1 text-[11px] font-semibold leading-tight text-muted-fg">
                <ArrowRight className="mt-px h-3 w-3 flex-shrink-0" strokeWidth={2} />
                {action.consequence}
              </p>
            )}
            {action.upside && (
              <p className="mt-1 flex items-start gap-1 text-[11px] font-semibold leading-tight text-primary">
                <TrendingUp className="mt-px h-3 w-3 flex-shrink-0" strokeWidth={2} />
                {action.upside}
              </p>
            )}
            <ProInsightGate
              {...(action.yieldImpact ? { yieldImpact: action.yieldImpact } : {})}
              {...(action.deepInsight ? { deepInsight: action.deepInsight } : {})}
              isPro={isPro}
            />
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-1">
            <Link
              href={action.ctaHref as Route}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-transform duration-150 active:scale-95 ${cfg.cta}`}
            >
              {action.ctaLabel}
            </Link>
            {action.recoveryGrams != null && action.recoveryGrams > 0 && (
              <p className="text-[10px] font-bold text-primary/90 whitespace-nowrap">
                +{action.recoveryGrams}g mit dieser Aktion zurückholbar
              </p>
            )}
          </div>
        </div>
      )}

      {phaseSuggestion && (
        <div className={`flex items-center justify-between gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 ${action ? 'mt-4' : ''}`}>
          <div className="flex items-center gap-3">
            <IconChip icon={ArrowRight} size="sm" />
            <p className="text-xs text-foreground">
              <span className="font-semibold">Bereit für {phaseSuggestion.nextPhase.label}</span> — {phaseSuggestion.currentPhaseLabel} war vor {phaseSuggestion.overdueDays} {phaseSuggestion.overdueDays === 1 ? 'Tag' : 'Tagen'} geplant abgeschlossen.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAdvancePhase(phaseSuggestion.nextPhase.id)}
            className="flex-shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white transition-transform duration-150 hover:bg-primary-dark active:scale-95"
          >
            {phaseSuggestion.nextPhase.label}
          </button>
        </div>
      )}

      {overdue.length > 0 && (
        <div className={`space-y-2 ${(action || phaseSuggestion) ? 'mt-4 border-t border-border/60 pt-4' : ''}`}>
          <p className="text-xs font-bold text-foreground">
            {overdue.length === 1 ? '1 überfälliger Task' : `${overdue.length} überfällige Tasks`}
          </p>
          {overdue.map((task) => (
            <TaskItem key={task.id} task={task} currentDay={currentDay} onComplete={onComplete} />
          ))}
        </div>
      )}
    </Card>
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
  const CategoryIcon = TASK_CATEGORY_ICONS[task.category];
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors duration-150 ${
      overdue ? 'border-rose-500/20 bg-rose-500/10' : 'border-border bg-card hover:border-primary/20'
    }`}>
      <button
        type="button"
        onClick={() => onComplete(task.id)}
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-[transform,border-color,background-color] duration-150 active:scale-90 ${
          overdue
            ? 'border-rose-400/60 hover:border-rose-400 hover:bg-rose-500/10'
            : 'border-border hover:border-primary/60 hover:bg-primary/10'
        }`}
        aria-label="Aufgabe erledigen"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{task.title}</p>
        {task.description !== undefined && task.description !== '' && (
          <p className="mt-0.5 text-xs text-muted-fg leading-snug">{task.description}</p>
        )}
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <CategoryIcon className="h-4 w-4 text-muted-fg" strokeWidth={2} />
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

const PLANT_STATUS_TONE: Record<PlantStatus, BadgeTone> = {
  good: "primary",
  "needs-attention": "amber",
  "no-data": "muted",
};
const PLANT_STATUS_LABEL: Record<PlantStatus, string> = {
  good: "OK",
  "needs-attention": "Prüfen",
  "no-data": "Neu",
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

// ── Performance section (inside the consolidated Insights card) ─────────────

function StatTile({ label, value, tone }: { label: string; value: string; tone: 'primary' | 'amber' | 'rose' | 'muted' }) {
  const textTone = { primary: 'text-primary', amber: 'text-amber-500 dark:text-amber-400', rose: 'text-rose-500 dark:text-rose-400', muted: 'text-muted-fg' }[tone];
  return (
    <div className="rounded-xl border border-border bg-background px-2 py-2 text-center">
      <p className={`text-base font-black ${textTone}`}>{value}</p>
      <p className="mt-0.5 text-[9px] font-semibold leading-tight text-muted-fg">{label}</p>
    </div>
  );
}

function PerformanceSection({
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
  const barTone: ProgressBarTone = usedPercent >= 80 ? 'primary' : usedPercent >= 50 ? 'amber' : 'rose';

  const TrendIcon = !trend || trend.trend === 'stable' ? Minus : trend.trend === 'up' ? TrendingUp : TrendingDown;
  const trendTone: 'primary' | 'muted' | 'rose' = !trend || trend.trend === 'stable' ? 'muted' : trend.trend === 'up' ? 'primary' : 'rose';
  const trendLabel = !trend || trend.trend === 'stable' ? 'Stabil' : trend.trend === 'up' ? `+${trend.delta}` : `${trend.delta}`;

  if (isPro) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-fg">Ertrag-Potenzial genutzt</p>
          <p className="text-sm font-bold text-foreground">{usedPercent}%</p>
        </div>
        <ProgressBar percent={usedPercent} tone={barTone} />
        <p className="text-xs leading-relaxed text-muted-fg">
          ~{yieldImpact.projectedYield}g von {yieldImpact.potentialYield}g möglich
          {yieldImpact.lossPercent > 0 && ` · ${yieldImpact.lossPercent}% Differenz`}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="Verlust-Risiko" value={yieldImpact.totalLoss > 0 ? `${yieldImpact.totalLoss}g` : '—'} tone="rose" />
          <StatTile label="Optimierung" value={`${optScore}%`} tone={optScore >= 80 ? 'primary' : optScore >= 50 ? 'amber' : 'rose'} />
          <div className="rounded-xl border border-border bg-background px-2 py-2 text-center">
            <TrendIcon className={`mx-auto h-4 w-4 ${trendTone === 'primary' ? 'text-primary' : trendTone === 'rose' ? 'text-rose-500 dark:text-rose-400' : 'text-muted-fg'}`} strokeWidth={2.5} />
            <p className="mt-0.5 text-[9px] font-semibold leading-tight text-muted-fg">{trendLabel}</p>
          </div>
        </div>
        {yieldImpact.totalGainPotential > 0 && (
          <p className="flex items-center gap-1.5 text-[11px] font-semibold leading-tight text-primary">
            <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
            +{yieldImpact.totalGainPotential}g mit dieser Aktion zurückholbar.
          </p>
        )}
      </div>
    );
  }

  // FREE — calm, honest upsell. No blur/lock/red-alarm treatment; the real
  // percentage is shown, exact grams and trend detail are the PRO value-add.
  return (
    <Link
      href={'/pricing' as Route}
      onClick={() => Analytics.upgradeCtaClicked('grow_performance_upsell')}
      className="block rounded-xl border border-border bg-background p-4 transition-colors duration-150 hover:border-primary/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{usedPercent}% deines Ertrag-Potenzials genutzt</p>
          <p className="mt-1 text-xs text-muted-fg">PRO zeigt dir genaue Zahlen, Verlustrisiko und Trend.</p>
        </div>
        <Badge tone="pro">PRO</Badge>
      </div>
      <ProgressBar percent={usedPercent} tone={barTone} className="mt-3" />
    </Link>
  );
}

// ── Consolidated sidebar Insights card ───────────────────────────────────────
// Replaces four separately-bordered sidebar boxes (Grow Status Header,
// Grow Performance Panel, Recommendations, Smart Insights) with one card.
// RecommendationsPanel/SmartInsights render `bare` (no outer card shell,
// self-contained top border only when they actually render content).

function InsightsCard({
  showPerformance,
  isPro,
  yieldImpact,
  optScore,
  trend,
  growId,
  userId,
  grow,
}: {
  showPerformance: boolean;
  isPro: boolean;
  yieldImpact: YieldImpactResult;
  optScore: number;
  trend: GrowTrend | null;
  growId: string;
  userId: string | undefined;
  grow: Grow;
}) {
  return (
    <Card padding="lg" className="space-y-5" data-reveal>
      <div className="flex items-center gap-3">
        <IconChip icon={Sparkles} />
        <h2 className="text-sm font-bold text-foreground">Insights</h2>
      </div>

      {showPerformance && (
        <PerformanceSection isPro={isPro} yieldImpact={yieldImpact} optScore={optScore} trend={trend} />
      )}

      {userId && <RecommendationsPanel growId={growId} userId={userId} bare />}

      <SmartInsights grow={grow} bare />
    </Card>
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
    <div className="flex items-stretch gap-2">
      {best && (
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5">
          <IconChip icon={CheckCircle2} tone="primary" size="sm" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Beste Pflanze</p>
            <p className="truncate text-xs font-bold text-foreground">{best.name}</p>
          </div>
        </div>
      )}
      {worst && (
        <div className="flex flex-1 flex-col gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <IconChip icon={AlertTriangle} tone="rose" size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">Braucht Pflege</p>
              <p className="truncate text-xs font-bold text-foreground">{worst.name}</p>
              {worstReason && (
                <p className="mt-0.5 text-[11px] leading-tight text-rose-500/80 dark:text-rose-400/80">{worstReason}</p>
              )}
            </div>
          </div>
          <Link
            href={`/grow/${growId}/log?plant=${worst.id}` as Route}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition-transform duration-150 hover:bg-rose-700 active:scale-[0.97]"
          >
            Jetzt pflegen <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
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
  default: "border-border bg-card hover:border-border/80",
  best:    "border-primary/40 bg-primary/10 hover:border-primary/60",
  worst:   "border-rose-500/30 bg-rose-500/10 hover:border-rose-500/50",
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
  const microInsight = getPlantMicroInsight(plantEntries);
  const microInsightClass =
    microInsight.level === 'good'     ? 'text-primary' :
    microInsight.level === 'critical' ? 'text-rose-400 font-semibold' :
                                        'text-amber-400';

  const baseClasses = isSelected
    ? "border-primary bg-primary/15 shadow-sm ring-1 ring-primary/20"
    : CARD_VARIANT_CLASSES[variant];

  return (
    <div className={`rounded-2xl border transition-colors duration-200 ${baseClasses}`}>
      {/* ── Critical alert strip ── */}
      {isCritical && !isSelected && (
        <div className="flex items-center gap-1.5 border-b border-rose-500/20 bg-rose-500/15 px-4 py-1.5">
          <AlertTriangle className="h-3 w-3 flex-shrink-0 text-rose-500 dark:text-rose-400" strokeWidth={2} />
          <span className="text-[11px] font-bold text-rose-500 dark:text-rose-400">Handlung nötig</span>
        </div>
      )}
      {/* ── Name + status ── */}
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center gap-3 px-4 pt-3 pb-2 text-left"
      >
        <IconChip icon={Sprout} size="sm" />
        {isEditing ? (
          <input
            value={draftName}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
              if (e.key === "Escape") onCancel();
            }}
            onClick={(e) => e.stopPropagation()}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm font-bold text-foreground focus:border-primary focus:outline-none"
            autoFocus
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">
            {plant.name}
          </span>
        )}
        <Badge tone={PLANT_STATUS_TONE[status]}>{PLANT_STATUS_LABEL[status]}</Badge>
      </button>

      {/* ── Micro insight ── */}
      <div className="px-4 pb-2.5">
        <p className={`text-[11px] leading-tight ${microInsightClass}`}>{microInsight.text}</p>
        {microInsight.consequence && microInsight.level !== 'good' && (
          <p className="flex items-start gap-1 text-[10px] text-muted-fg mt-0.5 leading-tight">
            <ArrowRight className="mt-px h-2.5 w-2.5 flex-shrink-0" strokeWidth={2} />
            {microInsight.consequence}
          </p>
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
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground
              placeholder:text-muted-fg/50 focus:border-primary focus:outline-none resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSaveNotes}
              className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-dark"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={onCancelNotes}
              className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-muted-fg hover:bg-surface"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : plant.notes ? (
        <div className="mx-4 mb-3 rounded-lg border border-border bg-surface px-3 py-2">
          <p className="text-[11px] text-muted-fg leading-relaxed whitespace-pre-wrap">{plant.notes}</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEditNotes(); }}
            className="mt-1 text-[10px] font-semibold text-muted-fg hover:text-primary transition-colors"
          >
            Notiz bearbeiten
          </button>
        </div>
      ) : null}

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-2.5">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={onSave}
              className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-dark"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-muted-fg hover:bg-surface"
            >
              Abbrechen
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/grow/${growId}/log?plant=${plant.id}` as Route}
              className={`rounded-lg px-3 py-1 text-xs font-bold text-white transition-transform duration-150 active:scale-[0.97] ${
                variant === "worst"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-primary hover:bg-primary-dark"
              }`}
            >
              {variant === "worst" ? "+ Log jetzt" : "+ Log"}
            </Link>
            <Link
              href={`/diagnose?growId=${growId}&plantId=${plant.id}` as Route}
              className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-muted-fg transition-colors duration-150 hover:border-primary/50 hover:text-primary"
            >
              Diagnose
            </Link>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRename(); }}
              className="ml-auto rounded-lg border border-border px-3 py-1 text-xs font-semibold text-muted-fg transition-colors duration-150 hover:bg-surface"
            >
              Umbenennen
            </button>
            {!plant.notes && !isEditingNotes && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEditNotes(); }}
                className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-muted-fg transition-colors duration-150 hover:bg-surface"
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
    if (!existing) {
      Analytics.harvestRecorded();
    }
    setEditing(false);
  }

  if (!editing && existing) {
    return (
      <Card padding="lg" className="relative overflow-hidden border-primary/30" data-reveal>
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
        <div className="flex items-center justify-between pt-1">
          <p className="flex items-center gap-2 text-sm font-bold text-primary">
            <IconChip icon={Leaf} size="sm" />
            Ernte erfasst
          </p>
          <button
            type="button"
            onClick={() => { setEditing(true); }}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Bearbeiten
          </button>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{existing.grams}g</p>
            <p className="text-[10px] uppercase tracking-wide text-primary/70">Trockengewicht</p>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`h-5 w-5 ${s <= existing.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} strokeWidth={1.5} />
            ))}
          </div>
        </div>
        {existing.notes && (
          <p className="mt-3 rounded-xl bg-primary/15 px-3 py-2 text-xs text-foreground leading-relaxed">
            {existing.notes}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card padding="lg" data-reveal>
      <p className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
        <IconChip icon={existing ? Pencil : Leaf} size="sm" />
        {existing ? 'Ernte bearbeiten' : 'Ernte erfassen'}
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
              placeholder:text-muted-fg/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
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
                className="transition-transform duration-150 [@media(hover:hover)]:hover:scale-110 active:scale-95"
              >
                <Star className={`h-7 w-7 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} strokeWidth={1.5} />
              </button>
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
              placeholder:text-muted-fg/50 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
          />
        </div>
        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!grams || parseFloat(grams) <= 0 || rating < 1}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark
              disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Ernte speichern
          </button>
          {(editing && existing) && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-background transition-colors duration-150"
            >
              Abbrechen
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ── Grow settings panel ─────────────────────────────────────────────────────

const GROW_STATUS_OPTIONS: GrowStatus[] = ['aktiv', 'pausiert', 'abgeschlossen', 'abgebrochen'];

function GrowSettingsPanel({
  grow,
  onUpdate,
  assistantEnabled,
  onSetAssistantEnabled,
}: {
  grow: Grow;
  onUpdate: (growId: string, updates: Partial<Grow>) => void;
  assistantEnabled: boolean;
  onSetAssistantEnabled: (value: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(grow.name);
  const [pflanzenAnzahl, setPflanzenAnzahl] = useState(String(grow.pflanzenAnzahl));
  const [status, setStatus] = useState<GrowStatus>(grow.status);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const parsedCount = Math.max(1, parseInt(pflanzenAnzahl, 10) || grow.pflanzenAnzahl);
    onUpdate(grow.id, {
      name: name.trim() || grow.name,
      pflanzenAnzahl: parsedCount,
      status,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="flex items-center gap-2.5 text-sm font-bold text-foreground">
          <IconChip icon={Settings} size="sm" />
          Grow-Einstellungen
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-fg transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>
      {/* Accordion via grid-template-rows (0fr↔1fr): always mounted so it can
          animate both directions and self-sizes without a magic max-height —
          DESIGN_SYSTEM.md §16, animate/RECIPES.md Accordion. */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="min-h-0">
        <div className={`space-y-4 border-t border-border px-5 py-4 transition-opacity duration-150 ${open ? 'opacity-100' : 'opacity-0'}`}>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-fg">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-fg">Pflanzenanzahl</label>
              <input
                type="number"
                min={1}
                value={pflanzenAnzahl}
                onChange={(e) => setPflanzenAnzahl(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-fg">Status</label>
              <Dropdown value={status} onChange={(v) => setStatus(v as GrowStatus)}>
                {GROW_STATUS_OPTIONS.map((s) => (
                  <DropdownOption key={s} value={s}>{GROW_STATUS_LABELS[s]}</DropdownOption>
                ))}
              </Dropdown>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-primary-dark"
          >
            {saved ? (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" strokeWidth={2} /> Gespeichert
              </span>
            ) : 'Speichern'}
          </button>
          <p className="text-[11px] text-muted-fg">
            Umgebung, Medium und Lichttyp lassen sich nach dem Start nicht mehr ändern, da davon der generierte Aufgabenplan abhängt — dafür einen neuen Grow anlegen.
          </p>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                Tipps &amp; Empfehlungen anzeigen
              </p>
              <p className="mt-0.5 text-[11px] text-muted-fg">
                Steuert Score-Karte, Statuszeile, Performance- und Wissens-Hinweise. Log, Aufgaben und Einstellungen bleiben immer nutzbar.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={assistantEnabled}
              onClick={() => onSetAssistantEnabled(!assistantEnabled)}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                assistantEnabled ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  assistantEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GrowPage({}: Props) {
  const { id } = useParams<{ id: string }>();
  const { grows, loaded, completeTask, updateGrow, advancePhase } = useGrowState();
  const { entries, currentStreak } = useGrowLog(id);
  const { user } = useAuth();
  const isPro = user?.isPro ?? false;
  const { enabled: assistantEnabled, setEnabled: setAssistantEnabled } = useAssistantPreference();

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
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-2xl animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-surface" />
          <div className="h-40 rounded-2xl bg-surface/60" />
          <div className="h-64 rounded-2xl bg-surface/60" />
        </div>
      </main>
    );
  }

  if (notFound || !grow) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="space-y-4 text-center">
          <IconChip icon={Sprout} size="lg" className="mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Grow nicht gefunden</h1>
          <p className="text-sm text-muted-fg">Dieser Grow existiert nicht oder wurde gelöscht.</p>
          <Link
            href={'/start' as Route}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            <Sprout className="h-4 w-4" strokeWidth={2} /> Neuen Grow starten
          </Link>
        </div>
      </main>
    );
  }

  const currentPhase = grow.plan.phases.find((p) => p.id === grow.currentPhaseId)
    ?? getPhaseForDay(grow.plan, grow.currentDay);
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

  const phaseSuggestion: PhaseSuggestion | null = (() => {
    if (!currentPhase || grow.status !== 'aktiv') return null;
    if (grow.currentDay <= currentPhase.endDay) return null;
    const currentIdx = PHASE_ORDER.indexOf(currentPhase.id);
    const nextPhaseId = PHASE_ORDER[currentIdx + 1];
    if (!nextPhaseId) return null;
    const nextPhase = grow.plan.phases.find(p => p.id === nextPhaseId);
    if (!nextPhase) return null;
    return {
      currentPhaseLabel: currentPhase.label,
      overdueDays: grow.currentDay - currentPhase.endDay,
      nextPhase: { id: nextPhaseId, label: nextPhase.label },
    };
  })();

  const showTodayCard = (assistantEnabled && dailyAction) || overdue.length > 0 || phaseSuggestion;

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <PremiumScrollFx />
      <div className="mx-auto max-w-6xl space-y-6">

        <GrowHero
          grow={grow}
          currentPhase={currentPhase}
          percent={percent}
          healthScore={healthScore}
          healthStatus={healthStatus}
          advancePhase={advancePhase}
        />

        <SaveGrowBanner />

        {showTodayCard && (
          <TodayCard
            action={assistantEnabled ? dailyAction : null}
            scoreDelta={scoreDelta}
            isPro={isPro}
            overdue={overdue}
            currentDay={grow.currentDay}
            onComplete={handleComplete}
            phaseSuggestion={phaseSuggestion}
            onAdvancePhase={(phaseId) => advancePhase(grow.id, phaseId)}
          />
        )}

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-2">

        <Section icon={Sprout} title={`Pflanzen (${grow.plants.length})`}>
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
        </Section>

        {/* ── Upcoming tasks ───────────────────────────── */}
        <Section
          icon={NotebookPen}
          title={upcoming.length === 0 ? 'Tasks' : `Nächste ${upcoming.length} Tasks`}
          badge={
            <Link href={`/grow/${grow.id}/log` as Route} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              Alle <ArrowRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-8 text-center">
              <Sparkles className="mx-auto h-7 w-7 text-emerald-500" strokeWidth={1.75} />
              <p className="mt-2 text-sm font-semibold text-muted-fg">Alle Tasks erledigt!</p>
              <p className="mt-1 text-xs text-muted-fg">Keine weiteren Tasks für diesen Grow geplant.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((task) => (
                <TaskItem key={task.id} task={task} currentDay={grow.currentDay} onComplete={handleComplete} />
              ))}
            </div>
          )}
        </Section>

        {/* ── Harvest Data ─────────────────────────────── */}
        {(grow.status === 'abgeschlossen' || grow.currentPhaseId === 'ernte') && (
          <HarvestSection
            grow={grow}
            onSave={(data) => updateGrow(grow.id, { harvest: data })}
          />
        )}

        </div>

        {/* ── Sidebar ───────────────────────────────────── */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:col-span-1 lg:self-start">

          {assistantEnabled && (
            <InsightsCard
              showPerformance={showPerformancePanel}
              isPro={isPro}
              yieldImpact={yieldImpact}
              optScore={optScore}
              trend={growTrend}
              growId={grow.id}
              userId={user?.id}
              grow={grow}
            />
          )}

          <GrowSettingsPanel
            grow={grow}
            onUpdate={updateGrow}
            assistantEnabled={assistantEnabled}
            onSetAssistantEnabled={setAssistantEnabled}
          />

        </div>
        </div>

        {/* ── Knowledge panel — quiet editorial footnote ──── */}
        {assistantEnabled && (
          <GrowKnowledgePanel
            grow={grow}
            entries={entries}
            healthScore={healthScore}
            currentStreak={currentStreak}
            overdueTasks={overdue.length}
            growsCount={grows.length}
          />
        )}

        {/* ── Phase description ────────────────────────── */}
        {currentPhase && (() => {
          const PhaseIcon = PHASE_ICONS[currentPhase.id];
          return (
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-5 py-4" data-reveal>
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <PhaseIcon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-fg">Aktuelle Phase</p>
              <p className="mt-0.5 font-semibold text-foreground">{currentPhase.label}</p>
              <p className="mt-1 text-sm text-muted-fg leading-relaxed">{currentPhase.description}</p>
              <p className="mt-2 text-xs text-muted-fg">
                {currentPhase.label}-Tag {getPhaseRelativeDay(grow.currentDay, currentPhase)} · noch {Math.max(0, currentPhase.endDay - grow.currentDay + 1)} Tage in dieser Phase
              </p>
            </div>
          </div>
          );
        })()}

      </div>
    </main>
  );
}
