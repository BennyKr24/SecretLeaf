'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { createLogEntry as dbCreateLogEntry } from '@/lib/grow/db';
import { createLogEntry as storeCreateLogEntry, deleteLogEntry as storeDeleteLogEntry, getActiveGrow } from '@/lib/grow/store';
import type { ToolResultData } from '@/lib/tools/types';

type Props = {
  toolSlug: string;
  toolTitle: string;
  summary: string;
  results: ToolResultData[];
};

export default function SaveToGrowButton({ toolSlug, toolTitle, summary }: Props) {
  const { user } = useAuth();
  const [activeGrow] = useState(() => {
    if (typeof window === 'undefined') return null;
    return getActiveGrow();
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

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
      notes: `${toolTitle} in Grow gespeichert`,
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
      setError('Speichern fehlgeschlagen. Bitte erneut versuchen.');
    }
  }

  if (!hasGrow) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
        <span className="text-base">🌱</span>
        <p className="text-xs text-slate-500">
          <span className="font-semibold">Kein aktiver Grow.</span>{' '}
          <Link href="/start" className="text-emerald-600 hover:underline">
            Grow starten
          </Link>{' '}
          um Ergebnisse zu speichern.
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
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition-all hover:border-emerald-300 hover:bg-emerald-100/80 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">
            {status === 'saved' ? '✓' : status === 'saving' ? '⏳' : '💾'}
          </span>
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              {status === 'saved' ? 'Im Grow gespeichert' : 'In Grow speichern'}
            </p>
            <p className="text-xs text-emerald-600">
              {activeGrow.name} · {toolSlug} · {summary}
            </p>
          </div>
        </div>
        <span className="flex-shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
          {status === 'saved' ? 'Grow Log' : status === 'saving' ? 'Speichert...' : 'Jetzt sichern'}
        </span>
      </button>

      {status === 'saved' && (
        <Link
          href={`/grow/${activeGrow.id}/log` as Route}
          className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:underline"
        >
          Zum Grow-Log wechseln →
        </Link>
      )}

      {status === 'error' && error && (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
}
