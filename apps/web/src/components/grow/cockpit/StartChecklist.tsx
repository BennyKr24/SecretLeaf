'use client';

// First steps *in the app* for a new grow (first entry, plant names, first
// measurement) plus the existing beginner tutorial for the growing basics —
// the wiki already covers how to grow, so nothing is duplicated here.
// Disappears once everything is done or when dismissed (per grow, per device).

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import type { Grow, LogEntry } from '@/lib/grow/types';
import { isDefaultPlantName } from '@/lib/grow/utils';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { LABEL, PANEL, TEXT_LINK } from './ui';

const BASICS_SLUG = 'how-to-grow-cannabis-anfaenger-tutorial';

const dismissKey = (growId: string) => `secretleaf.startChecklist.dismissed.${growId}`;

function readDismissed(growId: string): boolean {
  try { return localStorage.getItem(dismissKey(growId)) === '1'; } catch { return false; }
}

export function StartChecklist({ grow, entries }: { grow: Grow; entries: LogEntry[] }) {
  const t = useTranslations('dashboard');
  const { history } = useReadingHistory();
  const [dismissed, setDismissed] = useState(() => (typeof window === 'undefined' ? true : readDismissed(grow.id)));

  const items: { key: string; label: string; done: boolean; optional?: boolean; href: string }[] = [
    { key: 'entry', label: t('startFirstEntry'), done: entries.length > 0, href: `/grow/${grow.id}/log` },
    { key: 'plants', label: t('startNamePlants'), done: grow.plants.every((p) => !isDefaultPlantName(p.name)), href: '#cockpit-plants' },
    {
      key: 'measure',
      label: t('startFirstMeasurement'),
      optional: true,
      done: entries.some((e) => (e.data.type === 'wasser' && e.data.ph != null) || (e.data.type === 'duenger' && e.data.ec != null)),
      href: `/grow/${grow.id}/log?type=wasser`,
    },
    { key: 'basics', label: t('startReadBasics'), done: history.some((h) => h.slug === BASICS_SLUG), href: `/studies/${BASICS_SLUG}` },
  ];

  const doneCount = items.filter((i) => i.done).length;
  if (grow.erfahrung === 'profi' || dismissed || doneCount === items.length) return null;

  const dismiss = () => {
    try { localStorage.setItem(dismissKey(grow.id), '1'); } catch { /* private mode — hide for this visit only */ }
    setDismissed(true);
  };

  return (
    <section className={`${PANEL} flex flex-col`} data-reveal aria-label={t('startTitle')}>
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <span className={LABEL}>
          {t('startTitle')} <span className="tabular-nums">· {doneCount}/{items.length}</span>
        </span>
        <button type="button" onClick={dismiss} aria-label={t('startDismiss')} title={t('startDismiss')} className="-mr-1.5 flex h-7 w-7 items-center justify-center text-muted-fg transition-colors hover:text-foreground">
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
      <ol className="flex flex-col">
        {items.map((item, index) => (
          <li key={item.key} className="flex min-h-[44px] items-center gap-3 border-b border-border px-4 py-2 last:border-b-0">
            <span
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[10px] tabular-nums ${item.done ? 'border-primary bg-primary text-white' : 'border-foreground/20 text-muted-fg'}`}
              aria-hidden="true"
            >
              {item.done ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
            </span>
            <span className={`min-w-0 flex-1 text-[13px] ${item.done ? 'text-muted-fg line-through' : 'text-foreground'}`}>
              {item.label}
              {item.optional && <span className="text-muted-fg"> · {t('metricOptional')}</span>}
            </span>
            {!item.done && (
              item.href.startsWith('#')
                ? <a href={item.href} className={TEXT_LINK}>{t('startGo')}</a>
                : <Link href={item.href as Route} className={TEXT_LINK}>{t('startGo')}</Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
