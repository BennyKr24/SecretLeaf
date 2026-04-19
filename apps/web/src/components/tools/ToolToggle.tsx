'use client';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
};

export default function ToolToggle({ label, checked, onChange, hint }: Props) {
  return (
    <div className="space-y-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-all hover:border-emerald-300"
      >
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-150 ${
            checked ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-150 mt-0.5 ${
              checked ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </span>
      </button>
      {hint && <p className="text-xs text-slate-400 pl-1">{hint}</p>}
    </div>
  );
}
