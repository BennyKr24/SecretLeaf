'use client';

import { INTEREST_META, useInterests, type Interest } from '@/hooks/useInterests';

const INTERESTS = Object.keys(INTEREST_META) as Interest[];

export default function InterestSelector() {
  const { isActive, toggle, loaded } = useInterests();

  if (!loaded) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
        Deine Interessen wählen
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {INTERESTS.map((interest) => {
          const meta = INTEREST_META[interest];
          const active = isActive(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggle(interest)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold
                transition-all duration-150 select-none
                ${active
                  ? 'border-emerald-400/50 bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'border-white/15 bg-white/8 text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-900/30 hover:text-white'
                }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              {active && (
                <svg className="w-3 h-3 ml-0.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      {INTERESTS.some(i => isActive(i)) && (
        <p className="text-[11px] text-emerald-500/70 mt-1">
          ✓ Homepage wird nach deinen Interessen sortiert
        </p>
      )}
    </div>
  );
}
