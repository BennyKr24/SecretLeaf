'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { getSetupCoverage, getToolHistory } from '@/hooks/useToolState';
import { toolRegistry } from '@/lib/tools/registry';
import { toolCategoryColor, toolCategoryIcon, toolCategoryLabel } from '@/lib/tools/types';

const COVERAGE_KEYS = [
  { key: 'klima', label: 'Klima', slug: 'abluft-rechner' },
  { key: 'licht', label: 'Licht', slug: 'licht-rechner' },
  { key: 'naehrstoffe', label: 'Nährstoffe', slug: 'naehrstoff-rechner' },
  { key: 'ertrag', label: 'Ertrag', slug: 'ertrags-schaetzer' },
] as const;

export default function ToolsHubClient() {
  const [coverage] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    return getSetupCoverage();
  });
  const [recentSlug] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const history = getToolHistory();
    return history.length > 0 ? history[0]!.slug : null;
  });

  const done = COVERAGE_KEYS.filter((c) => coverage[c.key]).length;
  const total = COVERAGE_KEYS.length;
  const percent = Math.round((done / total) * 100);

  const recentTool = recentSlug ? toolRegistry.find((t) => t.slug === recentSlug) : null;

  return (
    <div className="space-y-4">
      {/* ── Zuletzt genutzt (most prominent, shown first) ── */}
      {recentTool && (
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Weiter machen
          </p>
          <Link
            href={`/tools/${recentTool.slug}` as Route}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl ring-1 ring-slate-100">
              {recentTool.icon}
            </div>
            <div className="min-w-0">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toolCategoryColor[recentTool.category]}`}>
                {toolCategoryIcon[recentTool.category]} {toolCategoryLabel[recentTool.category]}
              </span>
              <p className="mt-0.5 text-sm font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
                {recentTool.title}
              </p>
            </div>
            <span className="ml-auto flex-shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors group-hover:bg-emerald-100">
              Weiter →
            </span>
          </Link>
        </section>
      )}

      {/* ── Grow-Check ─────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Grow-Check</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {done === 0
                ? 'Kein Bereich analysiert — starte mit dem ersten Tool.'
                : done === total
                ? 'Dein Setup ist vollständig analysiert.'
                : `${total - done} ${total - done === 1 ? 'Bereich' : 'Bereiche'} noch offen.`}
            </p>
          </div>
          <span className="text-2xl font-bold tabular-nums text-emerald-600">
            {done}<span className="text-sm font-medium text-slate-300">/{total}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 overflow-hidden rounded-full bg-slate-100" style={{ height: 8 }}>
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Coverage chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {COVERAGE_KEYS.map((c) => {
            const isDone = coverage[c.key];
            return (
              <Link
                key={c.key}
                href={`/tools/${c.slug}` as Route}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all
                  ${
                    isDone
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
              >
                {isDone ? '✓' : '○'} {c.label}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
