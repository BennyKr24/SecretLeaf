'use client';

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
  const isInvalid = warning != null;

  return (
    <div className="space-y-1.5">
      <label className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </label>
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => onChange(Math.max(min ?? -Infinity, value - step))}
          className="flex h-10 w-10 items-center justify-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors text-lg font-medium"
          aria-label="Verringern"
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
          className={`h-10 w-full border-y text-center text-sm font-semibold text-slate-900 outline-none transition-all
            ${isInvalid ? 'border-rose-300 ring-2 ring-rose-200' : 'border-slate-200 focus:ring-2 focus:ring-emerald-200'}
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max ?? Infinity, value + step))}
          className="flex h-10 w-10 items-center justify-center rounded-r-xl border border-l-0 border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors text-lg font-medium"
          aria-label="Erhöhen"
        >
          +
        </button>
      </div>
      {warning && <p className="text-xs font-medium text-rose-600">{warning}</p>}
      {!warning && hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
