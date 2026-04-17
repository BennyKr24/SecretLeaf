'use client';

import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { INTEREST_META, type Interest } from '@/hooks/useInterests';
import Link from 'next/link';

const INTEREST_ORDER = Object.keys(INTEREST_META) as Interest[];

const ONBOARDING_KEY = 'secretleaf.onboarding_done';
const INTERESTS_KEY = 'secretleaf.interests';

function getSafeRedirect(target: string | null): Route {
  if (!target || !target.startsWith('/')) {
    return '/dashboard/user';
  }

  return target as Route;
}

function OnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Interest[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (interest: Interest) => {
    setSelected(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest],
    );
  };

  const handleContinue = () => {
    setSaving(true);
    try {
      localStorage.setItem(INTERESTS_KEY, JSON.stringify(selected));
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // storage unavailable — continue anyway
    }
    const next = getSafeRedirect(searchParams.get('next'));
    router.push(next);
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // ignore
    }
    router.push('/dashboard/user');
  };

  return (
    <main className="min-h-screen bg-[#f8fafb] flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-base transition-transform group-hover:scale-110">🌿</span>
            <span className="text-[15px] font-bold text-slate-900 tracking-tight">SecretLeaf</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-2xl mb-4">
            ✦
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Was interessiert dich?
          </h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Wähle deine Themen — wir personalisieren deine Inhalte und Empfehlungen entsprechend.
          </p>
        </div>

        {/* Interest grid */}
        <div className="grid grid-cols-1 gap-2.5 mb-8">
          {INTEREST_ORDER.map(interest => {
            const meta = INTEREST_META[interest];
            const active = selected.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggle(interest)}
                className={`flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-150 select-none
                  ${active
                    ? 'border-emerald-400 bg-emerald-50 shadow-sm ring-1 ring-emerald-300/60'
                    : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
                  }`}
              >
                <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl transition-all duration-150
                  ${active ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  {meta.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] font-bold transition-colors ${active ? 'text-emerald-800' : 'text-slate-800'}`}>
                    {meta.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {meta.categories.slice(0, 3).join(' · ')}
                  </p>
                </div>
                <div className={`flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-150
                  ${active
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-slate-300 bg-white'
                  }`}
                >
                  {active && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={saving}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Speichern…
            </>
          ) : selected.length === 0
            ? 'Überspringen & loslegen'
            : `${selected.length} ${selected.length === 1 ? 'Interesse' : 'Interessen'} speichern & loslegen`
          }
        </button>

        <p className="mt-4 text-center text-xs text-slate-400">
          Du kannst deine Interessen jederzeit in deinem Dashboard anpassen.
          {selected.length === 0 && (
            <> · <button type="button" onClick={handleSkip} className="text-slate-500 underline-offset-2 hover:underline">
              Überspringen
            </button></>
          )}
        </p>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  );
}
