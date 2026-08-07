'use client';

import type { ResultLevel } from '@/lib/tools/types';

type Props = {
  label?: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  zones: Array<{
    from: number;
    to: number;
    level: ResultLevel;
    label: string;
  }>;
};

const ZONE_BG: Record<ResultLevel, string> = {
  rot: 'bg-rose-200',
  gelb: 'bg-amber-200',
  gruen: 'bg-emerald-200',
};

export default function ToolRangeBar({ label, value, min, max, unit, zones }: Props) {
  const range = max - min;
  const clampedValue = Math.max(min, Math.min(max, value));
  const markerPercent = ((clampedValue - min) / range) * 100;

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">{label}</p>}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-background">
        {zones.map((zone) => {
          const left = ((zone.from - min) / range) * 100;
          const width = ((zone.to - zone.from) / range) * 100;
          return (
            <div
              key={`${zone.from}-${zone.to}`}
              className={`absolute top-0 h-full ${ZONE_BG[zone.level]} opacity-60`}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          );
        })}
        {/* Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-white bg-slate-900 shadow-md transition-[left] duration-300"
          style={{ left: `${markerPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-fg">
        <span>{min}{unit ? ` ${unit}` : ''}</span>
        {zones.map((zone) => (
          <span key={zone.label} className="text-center">{zone.label}</span>
        ))}
        <span>{max}{unit ? ` ${unit}` : ''}</span>
      </div>
    </div>
  );
}
