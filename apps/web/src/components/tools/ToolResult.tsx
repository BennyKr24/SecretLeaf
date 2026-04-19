'use client';

import { useEffect, useRef, useState } from 'react';
import type { ResultLevel } from '@/lib/tools/types';
import { resultLevelClass } from '@/lib/tools/types';

type ToolResultProps = {
  label: string;
  value: string;
  unit?: string;
  level?: ResultLevel;
  explanation?: string;
  large?: boolean;
};

const levelText: Record<ResultLevel, string> = {
  gruen: 'text-emerald-700',
  gelb: 'text-amber-700',
  rot: 'text-rose-700',
};

export function ToolResult({ label, value, unit, level, explanation, large }: ToolResultProps) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 300);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <div className={flash ? 'tool-pop' : undefined}>
        <div className="flex flex-wrap items-baseline gap-2">
          <span
            className={`font-bold tabular-nums tracking-tight text-slate-900 ${
              large ? 'text-5xl sm:text-6xl' : 'text-2xl'
            }`}
          >
            {value}
          </span>
          {unit && (
            <span className={`font-medium text-slate-500 ${large ? 'text-xl' : 'text-sm'}`}>
              {unit}
            </span>
          )}
        </div>
        {level && (
          <div className="mt-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${resultLevelClass[level]}`}>
              {level === 'gruen' ? '✓ Optimal' : level === 'gelb' ? '⚠ Grenzwertig' : '✗ Kritisch'}
            </span>
          </div>
        )}
      </div>
      {explanation && (
        <p
          className={`text-sm leading-relaxed ${
            large
              ? `font-medium ${level ? levelText[level] : 'text-slate-600'}`
              : 'text-slate-500'
          }`}
        >
          {explanation}
        </p>
      )}
    </div>
  );
}

type ToolResultCardProps = {
  title?: string;
  children: React.ReactNode;
  /** Shown in the footer: "Das bedeutet: ..." */
  interpretation?: string;
  /** Shown in the footer: direct action recommendation */
  recommendation?: string;
};

export function ToolResultCard({ title, children, interpretation, recommendation }: ToolResultCardProps) {
  const hasFooter = interpretation || recommendation;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {title && (
        <div className="border-b border-slate-100 px-5 py-3.5">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>
      )}
      <div className="space-y-5 p-5">{children}</div>
      {hasFooter && (
        <div className="border-t border-emerald-100 bg-emerald-50 px-5 py-4 space-y-1.5">
          {interpretation && (
            <p className="text-sm text-emerald-900">
              <span className="font-semibold">Das bedeutet: </span>
              {interpretation}
            </p>
          )}
          {recommendation && (
            <p className="text-sm font-medium text-emerald-800">
              <span className="mr-1 opacity-50">→</span>
              {recommendation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

