'use client';

// Grow settings: name, plant count, status and the assistant switch.
// Opened from the "⋯" button next to the grow name — rarely used, so it
// does not take a permanent slot in the cockpit.

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';
import type { Grow, GrowStatus } from '@/lib/grow/types';
import { BTN_PRIMARY, INPUT, LABEL, PANEL } from './ui';

const GROW_STATUS_OPTIONS: GrowStatus[] = ['aktiv', 'pausiert', 'abgeschlossen', 'abgebrochen'];

export function GrowSettings({
  grow, onUpdate, assistantEnabled, onSetAssistantEnabled, onClose,
}: {
  grow: Grow;
  onUpdate: (growId: string, updates: Partial<Grow>) => void;
  assistantEnabled: boolean;
  onSetAssistantEnabled: (value: boolean) => void;
  onClose: () => void;
}) {
  const t = useTranslations('dashboard');
  const [name, setName] = useState(grow.name);
  const [count, setCount] = useState(String(grow.pflanzenAnzahl));
  const [status, setStatus] = useState<GrowStatus>(grow.status);
  const [saved, setSaved] = useState(false);

  const save = () => {
    onUpdate(grow.id, {
      name: name.trim() || grow.name,
      pflanzenAnzahl: Math.max(1, parseInt(count, 10) || grow.pflanzenAnzahl),
      status,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  return (
    <div className={PANEL}>
      <p className={`${LABEL} border-b border-border px-3.5 py-2.5`}>{t('settingsToggle')}</p>
        <div className="flex flex-col gap-3.5 px-3.5 py-3.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="grow-name" className={LABEL}>{t('settingsName')}</label>
            <input id="grow-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="grow-count" className={LABEL}>{t('settingsPlantCount')}</label>
              <input id="grow-count" type="number" inputMode="numeric" min={1} value={count} onChange={(e) => setCount(e.target.value)} className={`${INPUT} font-mono`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="grow-status" className={LABEL}>{t('settingsStatus')}</label>
              <select id="grow-status" value={status} onChange={(e) => setStatus(e.target.value as GrowStatus)} className={INPUT}>
                {GROW_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{t(`growStatus.${s}`)}</option>)}
              </select>
            </div>
          </div>
          <button type="button" onClick={save} className={BTN_PRIMARY}>
            {saved ? <><CheckCircle2 className="h-4 w-4" strokeWidth={2} /> {t('saved')}</> : t('save')}
          </button>
          <p className="text-[11px] leading-relaxed text-muted-fg">{t('settingsLockedHint')}</p>

          <div className="flex items-start justify-between gap-3 border-t border-border pt-3.5">
            <div className="min-w-0">
              <p className="text-[13px] text-foreground">{t('assistantToggle')}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-fg">{t('assistantToggleHint')}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={assistantEnabled}
              aria-label={t('assistantToggle')}
              onClick={() => onSetAssistantEnabled(!assistantEnabled)}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${assistantEnabled ? 'bg-primary' : 'bg-border'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${assistantEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
    </div>
  );
}
