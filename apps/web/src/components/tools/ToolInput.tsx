'use client';

import { useTranslations } from 'next-intl';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  warning?: string;
};

export default function ToolInput({ label, value, onChange, unit, min, max, step = 1, hint, warning }: Props) {
  const t = useTranslations('tool');
  const isInvalid = warning != null;

  return (
    <div className="space-y-1.5">
      <label className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-fg">{label}</span>
        {unit && <span className="text-xs text-muted-fg">{unit}</span>}
      </label>
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => onChange(Math.max(min ?? -Infinity, value - step))}
          className="flex h-10 w-10 items-center justify-center rounded-l-xl border border-r-0 border-border bg-background text-foreground/80 hover:bg-card transition-[transform,background-color] duration-150 active:scale-90 text-lg font-medium"
          aria-label={t('decrease')}
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          min={min}
          max={max}
          step={step}
          className={`h-10 w-full border-y text-center text-sm font-semibold text-foreground outline-none transition-[border-color,box-shadow]
            ${isInvalid ? 'border-rose-300 ring-2 ring-rose-200' : 'border-border focus:ring-2 focus:ring-emerald-200'}
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max ?? Infinity, value + step))}
          className="flex h-10 w-10 items-center justify-center rounded-r-xl border border-l-0 border-border bg-background text-foreground/80 hover:bg-card transition-[transform,background-color] duration-150 active:scale-90 text-lg font-medium"
          aria-label={t('increase')}
        >
          +
        </button>
      </div>
      {warning && <p className="text-xs font-medium text-rose-600">{warning}</p>}
      {!warning && hint && <p className="text-xs text-muted-fg">{hint}</p>}
    </div>
  );
}
