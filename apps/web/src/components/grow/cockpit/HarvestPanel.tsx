'use client';

// Harvest record (dry weight, rating, notes). Shown in the harvest phase
// and for finished grows.

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import type { Grow, HarvestData } from '@/lib/grow/types';
import { Analytics } from '@/lib/analytics';
import { BTN_PRIMARY, BTN_QUIET, INPUT, LABEL, PANEL, TEXT_LINK } from './ui';

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const t = useTranslations('dashboard');
  return (
    <div className="flex gap-1" role={onChange ? 'radiogroup' : undefined} aria-label={t('harvestRating')}>
      {[1, 2, 3, 4, 5].map((s) => {
        const icon = <Star className={`h-5 w-5 ${s <= value ? 'fill-foreground text-foreground' : 'text-foreground/20'}`} strokeWidth={1.5} />;
        return onChange ? (
          <button key={s} type="button" role="radio" aria-checked={s === value} aria-label={String(s)} onClick={() => onChange(s)} className="flex h-10 w-9 items-center justify-center">
            {icon}
          </button>
        ) : <span key={s}>{icon}</span>;
      })}
    </div>
  );
}

export function HarvestPanel({ grow, onSave }: { grow: Grow; onSave: (data: HarvestData) => void }) {
  const t = useTranslations('dashboard');
  const existing = grow.harvest;
  const [editing, setEditing] = useState(false);
  const [grams, setGrams] = useState(String(existing?.grams ?? ''));
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const valid = parseFloat(grams) > 0 && rating >= 1;

  const save = () => {
    if (!valid) return;
    onSave({
      grams: parseFloat(grams),
      rating,
      notes: notes.trim() || undefined,
      recordedAt: new Date().toISOString(),
    } as HarvestData);
    if (!existing) Analytics.harvestRecorded();
    setEditing(false);
  };

  if (existing && !editing) {
    return (
      <div className={`${PANEL} flex flex-col gap-3 px-4 py-3.5`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className={LABEL}>{t('harvestDryWeight')}</span>
            <p className="font-mono text-[26px] leading-tight tabular-nums text-foreground">{existing.grams} <small className="text-xs text-muted-fg">g</small></p>
          </div>
          <button type="button" onClick={() => setEditing(true)} className={TEXT_LINK}>{t('edit')}</button>
        </div>
        <Stars value={existing.rating} />
        {existing.notes && <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-fg">{existing.notes}</p>}
      </div>
    );
  }

  return (
    <div className={`${PANEL} flex flex-col gap-3.5 px-4 py-3.5`}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="harvest-grams" className={LABEL}>{t('harvestDryWeight')} (g)</label>
        <input id="harvest-grams" type="number" inputMode="decimal" min="0" step="0.1" value={grams} onChange={(e) => setGrams(e.target.value)} placeholder="45.5" className={`${INPUT} font-mono`} />
      </div>
      <div className="flex flex-col gap-1">
        <span className={LABEL}>{t('harvestRating')}</span>
        <Stars value={rating} onChange={setRating} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="harvest-notes" className={LABEL}>{t('harvestNotes')}</label>
        <textarea id="harvest-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder={t('harvestNotesPlaceholder')} className={`${INPUT} resize-none`} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={save} disabled={!valid} className={BTN_PRIMARY}>{t('harvestSave')}</button>
        {existing && <button type="button" onClick={() => setEditing(false)} className={BTN_QUIET}>{t('cancel')}</button>}
      </div>
    </div>
  );
}
