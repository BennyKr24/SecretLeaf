'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getActiveGrow } from '@/lib/grow/store';
import type { ToolResultData } from '@/lib/tools/types';

type Props = {
  toolSlug: string;
  toolTitle: string;
  summary: string;
  results: ToolResultData[];
};

/**
 * T-04 — "Save to Grow" button (structure only).
 *
 * Reads the active grow from localStorage on mount.
 * - No active grow → disabled with hint to start a grow first.
 * - Active grow found → enabled; actual save logic arrives in Phase 6.
 */
export default function SaveToGrowButton({ toolSlug, summary }: Props) {
  // Start null (matches SSR) and read the real value after mount — reading
  // localStorage in the useState initializer would make the first client
  // render diverge from the server-rendered HTML and trigger a hydration
  // mismatch for anyone with an active grow already saved.
  const [activeGrowName, setActiveGrowName] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Deliberate mount-only sync from localStorage (client-only source) to
    // avoid a hydration mismatch — see comment on the initializer above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveGrowName(getActiveGrow()?.name ?? null);
  }, []);

  const hasGrow = activeGrowName !== null;

  if (!hasGrow) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3">
        <span className="text-base">🌱</span>
        <p className="text-xs text-muted-fg">
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
    <button
      type="button"
      disabled
      title="Speichern wird in Phase 6 (Grow Log) implementiert"
      onClick={() => setChecked(true)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left opacity-70 transition-all hover:opacity-80 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-base">{checked ? '✓' : '💾'}</span>
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            In Grow speichern
          </p>
          <p className="text-xs text-emerald-600">
            {activeGrowName} · {toolSlug} · {summary}
          </p>
        </div>
      </div>
      <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
        Phase 6
      </span>
    </button>
  );
}
