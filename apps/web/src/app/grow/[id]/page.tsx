'use client';

// ────────────────────────────────────────────────────────────────────────────
// Grow OS — /grow/[id]
//
// Grow session: overview, current phase, upcoming & overdue tasks (with
// complete action), quick actions and phase timeline.
// ────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Route } from 'next';
import { useGrowState } from '@/hooks/useGrowState';
import { useGrowLog } from '@/hooks/useGrowLog';
import { getUpcomingTasks, getOverdueTasks, getTaskProgress, getPhaseForDay } from '@/lib/grow/planGenerator';
import { PHASE_ICONS } from '@/lib/grow/phases';
import { TASK_CATEGORY_ICONS } from '@/lib/grow/types';
import type { GrowTask, Grow, Plant, LogEntry } from '@/lib/grow/types';

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
        aria-label="Task erledigen"
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

function getMicroInsight(plantEntries: LogEntry[]): string {
  if (plantEntries.length === 0) return "Noch kein Eintrag";
  const lastWater = plantEntries.find((e) => e.data.type === "wasser");
  if (lastWater) {
    const days = Math.floor((Date.now() - new Date(lastWater.date).getTime()) / 86_400_000);
    if (days === 0) return "Heute bewässert";
    if (days === 1) return "Gestern bewässert";
    return `Seit ${days} Tagen nicht bewässert`;
  }
  const newest = plantEntries[0]!;
  const days = Math.floor((Date.now() - new Date(newest.date).getTime()) / 86_400_000);
  if (days === 0) return "Heute eingetragen";
  if (days === 1) return "Letzter Eintrag gestern";
  return `Letzter Eintrag vor ${days} Tagen`;
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
  variant?: PlantVariant;
  isCritical?: boolean;
  onSelect: () => void;
  onDraftChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onRename: () => void;
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
  variant = "default",
  isCritical = false,
  onSelect,
  onDraftChange,
  onSave,
  onCancel,
  onRename,
}: PlantCardProps) {
  const status = computePlantStatus(plantEntries);
  const { label: statusLabel, classes: statusClasses } = PLANT_STATUS_CONFIG[status];
  const insight = getMicroInsight(plantEntries);

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
      <p className="px-4 pb-2.5 text-[11px] text-slate-400 leading-tight">{insight}</p>

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
          </>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GrowPage(_props: Props) {
  const { id } = useParams<{ id: string }>();
  const { grows, loaded, completeTask, updateGrow } = useGrowState();
  const { entries } = useGrowLog(id);

  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [draftPlantName, setDraftPlantName] = useState("");

  const grow = loaded ? (grows.find((g) => g.id === id) ?? null) : null;
  const notFound = loaded && grow === null;

  const handleComplete = useCallback((taskId: string) => {
    if (!grow) return;
    completeTask(grow.id, taskId);
  }, [grow, completeTask]);

  useEffect(() => {
    if (!grow || grow.plants.length === 0) {
      setSelectedPlantId(null);
      return;
    }
    if (!selectedPlantId || !grow.plants.some((p) => p.id === selectedPlantId)) {
      setSelectedPlantId(grow.plants[0]?.id ?? null);
    }
  }, [grow, selectedPlantId]);

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

  // Grow health: stable if no overdue tasks, and majority of plants have recent logs
  const criticalPlantCount = grow.plants.filter((p) => {
    const pe = entries.filter((e) => e.plantId === p.id);
    if (pe.length === 0) return false;
    return Math.floor((Date.now() - new Date(pe[0]!.date).getTime()) / 86_400_000) > 3;
  }).length;
  const growHealthStable = overdue.length === 0 && criticalPlantCount === 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-5">

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
            <div className={`mt-4 flex items-center gap-2 rounded-xl border px-3 py-2 ${
              growHealthStable
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-amber-200 bg-amber-50'
            }`}>
              <span className="text-base leading-none">{growHealthStable ? '📈' : '⚠️'}</span>
              <p className={`text-xs font-semibold ${growHealthStable ? 'text-emerald-700' : 'text-amber-700'}`}>
                {growHealthStable ? 'Dein Grow läuft stabil' : 'Mehr Aufmerksamkeit nötig'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Plants ───────────────────────────────────── */}
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
                        isSelected={selectedPlantId === plant.id}
                        isEditing={editingPlantId === plant.id}
                        draftName={draftPlantName}
                        variant={variant}
                        isCritical={isPlantCritical(plantEntries)}
                        onSelect={() => setSelectedPlantId(plant.id)}
                        onDraftChange={setDraftPlantName}
                        onSave={() => savePlantName(plant.id)}
                        onCancel={cancelRenamePlant}
                        onRename={() => startRenamePlant(plant.id, plant.name)}
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
