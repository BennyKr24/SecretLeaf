'use client';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  marks?: Array<{ value: number; label: string }>;
};

export default function ToolSlider({ label, value, onChange, min, max, step = 1, unit, marks }: Props) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 tabular-nums">
          {value}{unit ? ` ${unit}` : ''}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="tool-slider w-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${percent}%, #e2e8f0 ${percent}%, #e2e8f0 100%)`,
          }}
        />
      </div>
      {marks && marks.length > 0 && (
        <div className="relative flex justify-between px-0.5">
          {marks.map((m) => (
            <span key={m.value} className="text-[10px] text-slate-400">{m.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
