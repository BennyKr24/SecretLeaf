'use client';

// Plants panel of the grow cockpit. Rows stay one line each; a row expands
// to the per-plant tools (log, diagnosis, rename, notes) that used to live
// in the big plant cards of the old /grow/[id] page.

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronDown, NotebookPen, Stethoscope } from 'lucide-react';
import type { Grow, LogEntry, Plant } from '@/lib/grow/types';
import { getPlantMicroInsight } from '@/lib/grow/intelligence';
import { displayPlantName } from '@/lib/grow/utils';
import { BTN_GHOST, BTN_PRIMARY, BTN_QUIET, INPUT, LABEL, PANEL, daysSince, timeAgo } from './ui';

/** True when a plant needs attention: no log > 3 days or no watering > 3 days. */
export function plantNeedsCheck(plantEntries: LogEntry[]): boolean {
  if (plantEntries.length === 0) return false;
  if (daysSince(plantEntries[0]!.date) > 3) return true;
  const lastWater = plantEntries.find((e) => e.data.type === 'wasser');
  return lastWater ? daysSince(lastWater.date) > 3 : false;
}

/** Higher = better cared for: recent entries count up, days since watering count down. */
function scorePlant(plantEntries: LogEntry[]): number {
  if (plantEntries.length === 0) return 0;
  const sinceNewest = daysSince(plantEntries[0]!.date);
  let score = 5;
  if (sinceNewest === 0) score += 10;
  else if (sinceNewest <= 3) score += 5;
  const lastWater = plantEntries.find((e) => e.data.type === 'wasser');
  score -= lastWater ? Math.min(daysSince(lastWater.date) * 3, 21) : 10;
  return score;
}

/** Best and weakest plant — only when they differ meaningfully. */
function comparePlants(plants: Plant[], entriesById: Map<string, LogEntry[]>): { bestId: string | null; worstId: string | null } {
  if (plants.length < 2) return { bestId: null, worstId: null };
  const sorted = plants
    .map((p) => ({ id: p.id, score: scorePlant(entriesById.get(p.id) ?? []) }))
    .sort((a, b) => b.score - a.score);
  const best = sorted[0]!;
  const worst = sorted[sorted.length - 1]!;
  if (best.score - worst.score < 3) return { bestId: null, worstId: null };
  return { bestId: best.id, worstId: worst.id };
}

export function PlantList({
  grow, entries, onUpdate,
}: {
  grow: Grow;
  entries: LogEntry[];
  onUpdate: (growId: string, updates: Partial<Grow>) => void;
}) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; field: 'name' | 'notes' } | null>(null);
  const [draft, setDraft] = useState('');

  const entriesById = new Map(grow.plants.map((p) => [p.id, entries.filter((e) => e.plantId === p.id)]));
  const { bestId, worstId } = comparePlants(grow.plants, entriesById);

  const startEdit = (plant: Plant, field: 'name' | 'notes') => {
    setEditing({ id: plant.id, field });
    setDraft(field === 'name' ? displayPlantName(plant.name, locale) : plant.notes ?? '');
  };
  const cancelEdit = () => { setEditing(null); setDraft(''); };
  const saveEdit = () => {
    if (!editing) return;
    const value = draft.trim();
    if (editing.field === 'name' && !value) return;
    onUpdate(grow.id, {
      plants: grow.plants.map((plant) => {
        if (plant.id !== editing.id) return plant;
        if (editing.field === 'name') return { ...plant, name: value };
        if (value) return { ...plant, notes: value };
        const rest = { ...plant };
        delete (rest as { notes?: string }).notes;
        return rest;
      }),
    });
    cancelEdit();
  };

  return (
    <div className={`${PANEL} overflow-hidden`}>
      {grow.plants.map((plant) => {
        const plantEntries = entriesById.get(plant.id) ?? [];
        const needsCheck = plantNeedsCheck(plantEntries);
        const newest = plantEntries[0];
        const open = openId === plant.id;
        const insight = getPlantMicroInsight(plantEntries);
        const tag = plant.id === bestId ? t('plantBest') : plant.id === worstId ? t('plantWorst') : null;
        const isEditingName = editing?.id === plant.id && editing.field === 'name';
        const isEditingNotes = editing?.id === plant.id && editing.field === 'notes';
        return (
          <div key={plant.id} className="border-b border-border last:border-b-0">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : plant.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-2 px-3.5 py-[11px] text-left transition-colors hover:bg-background"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] text-foreground">{displayPlantName(plant.name, locale)}</span>
                <span className="block font-mono text-xs lg:text-[11px] tabular-nums text-muted-fg">
                  {newest ? timeAgo(newest.date, t) : t('plantNoEntry')}
                  {tag && <> · {tag}</>}
                </span>
              </span>
              <span className="flex flex-shrink-0 items-center gap-2">
                <span className={`${LABEL} ${needsCheck ? 'text-amber-500' : newest ? 'text-primary' : ''}`}>
                  {needsCheck ? t('plantCheck') : newest ? t('plantOk') : t('plantNew')}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-fg transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
              </span>
            </button>

            {open && (
              <div className="flex flex-col gap-3 border-t border-border bg-background/40 px-3.5 py-3">
                {plantEntries.length > 0 && <p className="text-xs leading-relaxed text-muted-fg">{insight.text}</p>}

                {isEditingName && (
                  <div className="flex flex-col gap-2">
                    <label className={LABEL} htmlFor={`plant-name-${plant.id}`}>{t('plantNameLabel')}</label>
                    <input
                      id={`plant-name-${plant.id}`}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      className={INPUT}
                      autoFocus
                    />
                  </div>
                )}

                {isEditingNotes ? (
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t('plantNotePlaceholder')}
                    rows={3}
                    className={`${INPUT} resize-none text-xs`}
                    autoFocus
                  />
                ) : plant.notes ? (
                  <p className="whitespace-pre-wrap rounded-[3px] border border-border px-2.5 py-2 text-xs leading-relaxed text-muted-fg">{plant.notes}</p>
                ) : null}

                {editing?.id === plant.id ? (
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" onClick={saveEdit} className={BTN_PRIMARY}>{t('save')}</button>
                    <button type="button" onClick={cancelEdit} className={BTN_QUIET}>{t('cancel')}</button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    <Link href={`/grow/${grow.id}/log?plant=${plant.id}` as Route} className={BTN_GHOST}>
                      <NotebookPen className="h-3.5 w-3.5" strokeWidth={2} /> {t('plantLog')}
                    </Link>
                    <Link href={`/diagnose?growId=${grow.id}&plantId=${plant.id}` as Route} className={BTN_QUIET}>
                      <Stethoscope className="h-3.5 w-3.5" strokeWidth={2} /> {t('diagnoseLink')}
                    </Link>
                    <button type="button" onClick={() => startEdit(plant, 'name')} className={BTN_QUIET}>{t('plantRename')}</button>
                    <button type="button" onClick={() => startEdit(plant, 'notes')} className={BTN_QUIET}>
                      {plant.notes ? t('plantNoteEdit') : t('plantNoteAdd')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
