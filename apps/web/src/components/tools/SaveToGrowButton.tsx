'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { createLogEntry as dbCreateLogEntry } from '@/lib/grow/db';
import { createLogEntry as storeCreateLogEntry, deleteLogEntry as storeDeleteLogEntry, getActiveGrow } from '@/lib/grow/store';
import type { Grow } from '@/lib/grow/types';
import type { ToolResultData } from '@/lib/tools/types';
import { Sprout, CheckCircle2, Loader2, Save } from 'lucide-react';

type Props = {
  toolSlug: string;
  /** Localised tool name, snapshotted into the grow-log entry. */
  toolTitle: string;
  summary: string;
  results: ToolResultData[];
};

export default function SaveToGrowButton({ toolSlug, toolTitle, summary }: Props) {
  const t = useTranslations('tool');
  const { user } = useAuth();
  // Start null (matches SSR) and read the real value after mount — reading
  // localStorage in the useState initializer would make the first client
  // render diverge from the server-rendered HTML and trigger a hydration
  // mismatch for anyone with an active grow already saved.
  const [activeGrow, setActiveGrow] = useState<Grow | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Deliberate mount-only sync from localStorage (client-only source) to
    // avoid a hydration mismatch — see comment on the initializer above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveGrow(getActiveGrow());
  }, []);

  const hasGrow = activeGrow !== null;

  async function handleSave(): Promise<void> {
    if (!activeGrow || status === 'saving' || status === 'saved') return;

    setStatus('saving');
    setError(null);

    const entry = storeCreateLogEntry({
      growId: activeGrow.id,
      date: new Date().toISOString(),
      data: {
        type: 'tool_result',
        toolSlug,
        toolTitle,
        summary,
      },
      notes: t('savedNote', { tool: toolTitle }),
    });

    try {
      if (user) {
        const supabase = getSupabaseBrowserClient();
        await dbCreateLogEntry(supabase, user.id, entry);
      }

      setStatus('saved');
    } catch (saveError) {
      console.error('[tools] Save to grow failed:', saveError);
      storeDeleteLogEntry(entry.id);
      setStatus('error');
      setError(t('saveError'));
    }
  }

  if (!hasGrow) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3">
        <Sprout className="h-4 w-4 flex-shrink-0 text-emerald-600" strokeWidth={2} />
        <p className="text-xs text-muted-fg">
          <span className="font-semibold">{t('noActiveGrow')}</span>{' '}
          <Link href="/start" className="text-emerald-600 hover:underline">
            {t('startGrow')}
          </Link>{' '}
          {t('toSaveResults')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={status === 'saving' || status === 'saved'}
        onClick={() => {
          void handleSave();
        }}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition-[transform,border-color,background-color,opacity] duration-150 hover:border-emerald-300 hover:bg-emerald-100/80 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
            {status === 'saved' ? (
              <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            ) : status === 'saving' ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <Save className="h-4 w-4" strokeWidth={2} />
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              {status === 'saved' ? t('savedToGrow') : t('saveToGrow')}
            </p>
            <p className="text-xs text-emerald-600">
              {activeGrow.name} · {toolSlug} · {summary}
            </p>
          </div>
        </div>
        <span className="flex-shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
          {status === 'saved' ? t('growLog') : status === 'saving' ? t('saving') : t('saveNow')}
        </span>
      </button>

      {status === 'saved' && (
        <Link
          href={`/grow/${activeGrow.id}/log` as Route}
          className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:underline"
        >
          {t('switchToLog')}
        </Link>
      )}

      {status === 'error' && error && (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
}
