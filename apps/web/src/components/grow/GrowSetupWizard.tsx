'use client';

// ────────────────────────────────────────────────────────────────────────────
// Grow OS — GrowSetupWizard
//
// 4-step wizard: Name + Umgebung → Medium + Licht → Erfahrung + Pflanzen
// → Summary + Erstellen.
//
// On submit: createGrow() via useGrowState → redirect to /grow/[id].
// No backend, no account required.
// ────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useGrowState } from '@/hooks/useGrowState';
import { Analytics } from '@/lib/analytics';
import type {
  GrowUmgebung,
  GrowMedium,
  LichtTyp,
  Erfahrung,
} from '@/lib/grow/types';
import {
  GROW_UMGEBUNG_LABELS,
  GROW_MEDIUM_LABELS,
  LICHT_TYP_LABELS,
  ERFAHRUNG_LABELS,
} from '@/lib/grow/types';

// ── Wizard State ──────────────────────────────────────────────────────────────

type WizardData = {
  name: string;
  umgebung: GrowUmgebung;
  medium: GrowMedium;
  lichtTyp: LichtTyp;
  erfahrung: Erfahrung;
  pflanzenAnzahl: number;
};

const DEFAULTS: WizardData = {
  name: '',
  umgebung: 'indoor',
  medium: 'erde',
  lichtTyp: 'led',
  erfahrung: 'einsteiger',
  pflanzenAnzahl: 2,
};

// ── Generic helpers ───────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

type StepHeaderProps = {
  step: number;
  title: string;
  subtitle: string;
};

function StepHeader({ step, title, subtitle }: StepHeaderProps) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
        Schritt {step} von {TOTAL_STEPS}
      </p>
      <h2 className="mt-1 text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

type OptionCardProps = {
  label: string;
  description?: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
};

function OptionCard({ label, description, icon, selected, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
        selected
          ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
          : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
      }`}
    >
      <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xl ${
        selected ? 'bg-emerald-100' : 'bg-slate-50'
      }`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${selected ? 'text-emerald-800' : 'text-slate-800'}`}>
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500 leading-snug">{description}</p>
        )}
      </div>
      {selected && (
        <span className="ml-auto flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-black">
          ✓
        </span>
      )}
    </button>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8 flex gap-1.5">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            i < step ? 'bg-emerald-500' : i === step - 1 ? 'bg-emerald-300' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

// ── Counter input ─────────────────────────────────────────────────────────────

type CounterProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
};

function Counter({ value, onChange, min = 1, max = 20 }: CounterProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-[2.5rem] text-center text-2xl font-bold text-slate-900 tabular-nums">
        {value}
      </span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

// ── Step 1: Name + Umgebung ───────────────────────────────────────────────────

const UMGEBUNG_META: Record<GrowUmgebung, { icon: string; desc: string }> = {
  indoor:     { icon: '🏠', desc: 'Zelt, Growroom oder ähnliches' },
  outdoor:    { icon: '☀️', desc: 'Garten, Balkon oder Feld' },
  greenhouse: { icon: '🌿', desc: 'Gewächshaus oder Folientunnel' },
};

type Step1Props = {
  data: WizardData;
  update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void;
  onNext: () => void;
};

function Step1({ data, update, onNext }: Step1Props) {
  const canAdvance = data.name.trim().length >= 2;
  return (
    <div>
      <StepHeader
        step={1}
        title="Wie heißt dein Grow?"
        subtitle="Gib ihm einen Namen — du erkennst ihn später sofort."
      />

      <div className="mb-6">
        <label htmlFor="grow-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Grow Name
        </label>
        <input
          id="grow-name"
          type="text"
          maxLength={48}
          placeholder="z.B. Balkon Sommer 2026"
          value={data.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <p className="mb-3 text-sm font-semibold text-slate-700">Wo wird angebaut?</p>
      <div className="space-y-2">
        {(Object.keys(UMGEBUNG_META) as GrowUmgebung[]).map((u) => (
          <OptionCard
            key={u}
            label={GROW_UMGEBUNG_LABELS[u]}
            description={UMGEBUNG_META[u].desc}
            icon={UMGEBUNG_META[u].icon}
            selected={data.umgebung === u}
            onSelect={() => update('umgebung', u)}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={!canAdvance}
        onClick={onNext}
        className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40"
      >
        Weiter →
      </button>
    </div>
  );
}

// ── Step 2: Medium + Licht ────────────────────────────────────────────────────

const MEDIUM_META: Record<GrowMedium, { icon: string; desc: string }> = {
  erde:  { icon: '🪴', desc: 'Klassisch, fehlerverzeihend' },
  coco:  { icon: '🥥', desc: 'Schnelleres Wachstum, mehr Kontrolle' },
  hydro: { icon: '💧', desc: 'Maximales Potenzial, höherer Aufwand' },
};

const LICHT_META: Record<LichtTyp, { icon: string; desc: string }> = {
  led:   { icon: '💡', desc: 'Effizient, wenig Wärme' },
  hps:   { icon: '🔆', desc: 'Bewährt, intensiv' },
  cmh:   { icon: '🌕', desc: 'Vollspektrum, Hybrid' },
  cfl:   { icon: '💫', desc: 'Günstig, für Keimlinge' },
  sonne: { icon: '☀️', desc: 'Natürlich, kostenlos' },
};

type Step2Props = {
  data: WizardData;
  update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void;
  onNext: () => void;
  onBack: () => void;
};

function Step2({ data, update, onNext, onBack }: Step2Props) {
  // Outdoor → show only Sonne
  const availableLicht: LichtTyp[] = data.umgebung === 'outdoor'
    ? ['sonne']
    : ['led', 'hps', 'cmh', 'cfl'];

  return (
    <div>
      <StepHeader
        step={2}
        title="Medium & Licht"
        subtitle="Diese Werte bestimmen den Grow-Plan und die Task-Häufigkeit."
      />

      <p className="mb-3 text-sm font-semibold text-slate-700">Substrat</p>
      <div className="mb-5 space-y-2">
        {(Object.keys(MEDIUM_META) as GrowMedium[]).map((m) => (
          <OptionCard
            key={m}
            label={GROW_MEDIUM_LABELS[m]}
            description={MEDIUM_META[m].desc}
            icon={MEDIUM_META[m].icon}
            selected={data.medium === m}
            onSelect={() => update('medium', m)}
          />
        ))}
      </div>

      <p className="mb-3 text-sm font-semibold text-slate-700">Lichtquelle</p>
      <div className="space-y-2">
        {availableLicht.map((l) => (
          <OptionCard
            key={l}
            label={LICHT_TYP_LABELS[l]}
            description={LICHT_META[l].desc}
            icon={LICHT_META[l].icon}
            selected={data.lichtTyp === l}
            onSelect={() => update('lichtTyp', l)}
          />
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-emerald-300"
        >
          ← Zurück
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-[2] rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Erfahrung + Pflanzen ──────────────────────────────────────────────

const ERFAHRUNG_META: Record<Erfahrung, { icon: string; desc: string }> = {
  einsteiger:     { icon: '🌱', desc: 'Erster oder zweiter Grow' },
  fortgeschritten:{ icon: '🌿', desc: 'Du hast bereits einige Grows abgeschlossen' },
  profi:          { icon: '🌲', desc: 'Optimierter Grow, maximaler Output' },
};

type Step3Props = {
  data: WizardData;
  update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void;
  onNext: () => void;
  onBack: () => void;
};

function Step3({ data, update, onNext, onBack }: Step3Props) {
  return (
    <div>
      <StepHeader
        step={3}
        title="Erfahrung & Pflanzen"
        subtitle="Dein Level bestimmt die Komplexität des Grow-Plans."
      />

      <p className="mb-3 text-sm font-semibold text-slate-700">Dein Erfahrungslevel</p>
      <div className="mb-6 space-y-2">
        {(Object.keys(ERFAHRUNG_META) as Erfahrung[]).map((e) => (
          <OptionCard
            key={e}
            label={ERFAHRUNG_LABELS[e]}
            description={ERFAHRUNG_META[e].desc}
            icon={ERFAHRUNG_META[e].icon}
            selected={data.erfahrung === e}
            onSelect={() => update('erfahrung', e)}
          />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
        <p className="mb-3 text-sm font-semibold text-slate-700">Anzahl Pflanzen</p>
        <div className="flex items-center gap-4">
          <Counter
            value={data.pflanzenAnzahl}
            onChange={(v) => update('pflanzenAnzahl', v)}
            min={1}
            max={20}
          />
          <p className="text-sm text-slate-500">
            {data.pflanzenAnzahl === 1 ? '1 Pflanze' : `${data.pflanzenAnzahl} Pflanzen`}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-emerald-300"
        >
          ← Zurück
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-[2] rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Summary + Submit ──────────────────────────────────────────────────

type SummaryRowProps = { label: string; value: string; icon: string };

function SummaryRow({ label, value, icon }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        <span className="text-base">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}

type Step4Props = {
  data: WizardData;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
};

function Step4({ data, onBack, onSubmit, submitting }: Step4Props) {
  return (
    <div>
      <StepHeader
        step={4}
        title="Alles bereit!"
        subtitle="Sieh dir dein Setup an — danach generieren wir automatisch deinen Grow-Plan."
      />

      {/* Summary card */}
      <div className="mb-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50 px-5">
        <SummaryRow label="Grow Name" value={data.name} icon="🌱" />
        <SummaryRow label="Umgebung"  value={GROW_UMGEBUNG_LABELS[data.umgebung]} icon="📍" />
        <SummaryRow label="Substrat"  value={GROW_MEDIUM_LABELS[data.medium]}     icon="🪴" />
        <SummaryRow label="Licht"     value={LICHT_TYP_LABELS[data.lichtTyp]}     icon="💡" />
        <SummaryRow label="Level"     value={ERFAHRUNG_LABELS[data.erfahrung]}    icon="🎯" />
        <SummaryRow label="Pflanzen"  value={`${data.pflanzenAnzahl}`}            icon="🌿" />
      </div>

      {/* What happens next */}
      <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
        <p className="text-xs font-semibold text-emerald-700">Was als nächstes passiert:</p>
        <ul className="mt-1.5 space-y-1 text-xs text-emerald-600">
          <li>✓ Grow-Plan mit Phasen wird generiert</li>
          <li>✓ Tägliche Tasks für dein Level werden zugewiesen</li>
          <li>✓ Du wirst direkt zu deinem Grow weitergeleitet</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={onBack}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-emerald-300 disabled:opacity-40"
        >
          ← Zurück
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onSubmit}
          className="flex-[2] rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Plan wird erstellt…
            </span>
          ) : (
            '🌱 Grow erstellen →'
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

export default function GrowSetupWizard() {
  const router = useRouter();
  const { createGrow } = useGrowState();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(DEFAULTS);
  const [submitting, setSubmitting] = useState(false);

  const update = useCallback(<K extends keyof WizardData>(k: K, v: WizardData[K]) => {
    setData((prev) => ({ ...prev, [k]: v }));
  }, []);

  // Auto-set lichtTyp to 'sonne' when switching to outdoor
  const updateUmgebung = useCallback((u: GrowUmgebung) => {
    setData((prev) => ({
      ...prev,
      umgebung: u,
      lichtTyp: u === 'outdoor' ? 'sonne' : prev.lichtTyp === 'sonne' ? 'led' : prev.lichtTyp,
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    setSubmitting(true);
    try {
      const grow = createGrow({
        name: data.name.trim(),
        umgebung: data.umgebung,
        medium: data.medium,
        lichtTyp: data.lichtTyp,
        erfahrung: data.erfahrung,
        pflanzenAnzahl: data.pflanzenAnzahl,
        startDate: new Date().toISOString(),
        currentPhaseId: 'keimung',
        status: 'aktiv',
      });
      Analytics.growCreated(data.umgebung, data.medium);
      router.push(`/grow/${grow.id}`);
    } catch {
      setSubmitting(false);
    }
  }, [data, createGrow, router]);

  return (
    <div className="w-full max-w-md">
      <ProgressBar step={step} />

      {step === 1 && (
        <Step1
          data={data}
          update={(k, v) => k === 'umgebung' ? updateUmgebung(v as GrowUmgebung) : update(k, v)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2
          data={data}
          update={update}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3
          data={data}
          update={update}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <Step4
          data={data}
          onBack={() => setStep(3)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}
