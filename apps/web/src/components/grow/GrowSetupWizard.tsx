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
import {
  Home, Sun, Leaf, Sprout, Package, Droplet, Lightbulb, Zap, Aperture,
  Sparkles, TreePine, MapPin, Layers, Target, Check, CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

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
      <h2 className="mt-1 text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-fg">{subtitle}</p>
    </div>
  );
}

type OptionCardProps = {
  label: string;
  description?: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
};

function OptionCard({ label, description, icon: Icon, selected, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-[transform,border-color,background-color,box-shadow] duration-150 active:scale-[0.97] ${
        selected
          ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
          : 'border-border bg-card hover:border-emerald-200 hover:bg-emerald-50/30'
      }`}
    >
      <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
        selected ? 'bg-emerald-100 text-emerald-700' : 'bg-background text-foreground/70'
      }`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${selected ? 'text-emerald-800' : 'text-foreground'}`}>
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-fg leading-snug">{description}</p>
        )}
      </div>
      {selected && (
        <span className="ml-auto flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-3 w-3" strokeWidth={3} />
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
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < step ? 'bg-emerald-500' : i === step - 1 ? 'bg-emerald-300' : 'bg-border'
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
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-lg font-bold text-foreground/80 transition hover:border-emerald-300 hover:text-emerald-700 active:scale-90 disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-[2.5rem] text-center text-2xl font-bold text-foreground tabular-nums">
        {value}
      </span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-lg font-bold text-foreground/80 transition hover:border-emerald-300 hover:text-emerald-700 active:scale-90 disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

// ── Step 1: Name + Umgebung ───────────────────────────────────────────────────

const UMGEBUNG_META: Record<GrowUmgebung, { icon: LucideIcon; desc: string }> = {
  indoor:     { icon: Home, desc: 'Zelt, Growroom oder ähnliches' },
  outdoor:    { icon: Sun, desc: 'Garten, Balkon oder Feld' },
  greenhouse: { icon: Leaf, desc: 'Gewächshaus oder Folientunnel' },
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
        <label htmlFor="grow-name" className="mb-1.5 block text-sm font-semibold text-foreground/80">
          Grow Name
        </label>
        <input
          id="grow-name"
          type="text"
          maxLength={48}
          placeholder="z.B. Balkon Sommer 2026"
          value={data.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground placeholder-muted-fg outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <p className="mb-3 text-sm font-semibold text-foreground/80">Wo wird angebaut?</p>
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
        className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.97] disabled:opacity-40"
      >
        Weiter →
      </button>
    </div>
  );
}

// ── Step 2: Medium + Licht ────────────────────────────────────────────────────

const MEDIUM_META: Record<GrowMedium, { icon: LucideIcon; desc: string }> = {
  erde:  { icon: Sprout, desc: 'Klassisch, fehlerverzeihend' },
  coco:  { icon: Package, desc: 'Schnelleres Wachstum, mehr Kontrolle' },
  hydro: { icon: Droplet, desc: 'Maximales Potenzial, höherer Aufwand' },
};

const LICHT_META: Record<LichtTyp, { icon: LucideIcon; desc: string }> = {
  led:   { icon: Lightbulb, desc: 'Effizient, wenig Wärme' },
  hps:   { icon: Zap, desc: 'Bewährt, intensiv' },
  cmh:   { icon: Aperture, desc: 'Vollspektrum, Hybrid' },
  cfl:   { icon: Sparkles, desc: 'Günstig, für Keimlinge' },
  sonne: { icon: Sun, desc: 'Natürlich, kostenlos' },
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

      <p className="mb-3 text-sm font-semibold text-foreground/80">Substrat</p>
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

      <p className="mb-3 text-sm font-semibold text-foreground/80">Lichtquelle</p>
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
          className="flex-1 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground/80 transition hover:border-emerald-300 active:scale-[0.97]"
        >
          ← Zurück
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-[2] rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.97]"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Erfahrung + Pflanzen ──────────────────────────────────────────────

const ERFAHRUNG_META: Record<Erfahrung, { icon: LucideIcon; desc: string }> = {
  einsteiger:     { icon: Sprout, desc: 'Erster oder zweiter Grow' },
  fortgeschritten:{ icon: Leaf, desc: 'Du hast bereits einige Grows abgeschlossen' },
  profi:          { icon: TreePine, desc: 'Optimierter Grow, maximaler Output' },
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

      <p className="mb-3 text-sm font-semibold text-foreground/80">Dein Erfahrungslevel</p>
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

      <div className="rounded-xl border border-border bg-card px-5 py-4">
        <p className="mb-3 text-sm font-semibold text-foreground/80">Anzahl Pflanzen</p>
        <div className="flex items-center gap-4">
          <Counter
            value={data.pflanzenAnzahl}
            onChange={(v) => update('pflanzenAnzahl', v)}
            min={1}
            max={20}
          />
          <p className="text-sm text-muted-fg">
            {data.pflanzenAnzahl === 1 ? '1 Pflanze' : `${data.pflanzenAnzahl} Pflanzen`}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground/80 transition hover:border-emerald-300 active:scale-[0.97]"
        >
          ← Zurück
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-[2] rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.97]"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Summary + Submit ──────────────────────────────────────────────────

type SummaryRowProps = { label: string; value: string; icon: LucideIcon };

function SummaryRow({ label, value, icon: Icon }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-muted-fg">
        <Icon className="h-4 w-4" strokeWidth={2} />
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
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
      <div className="mb-6 divide-y divide-border rounded-2xl border border-border bg-background px-5">
        <SummaryRow label="Grow Name" value={data.name} icon={Sprout} />
        <SummaryRow label="Umgebung"  value={GROW_UMGEBUNG_LABELS[data.umgebung]} icon={MapPin} />
        <SummaryRow label="Substrat"  value={GROW_MEDIUM_LABELS[data.medium]}     icon={Layers} />
        <SummaryRow label="Licht"     value={LICHT_TYP_LABELS[data.lichtTyp]}     icon={Lightbulb} />
        <SummaryRow label="Level"     value={ERFAHRUNG_LABELS[data.erfahrung]}    icon={Target} />
        <SummaryRow label="Pflanzen"  value={`${data.pflanzenAnzahl}`}            icon={Leaf} />
      </div>

      {/* What happens next */}
      <div className="mb-6 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Was als nächstes passiert:</p>
        <ul className="mt-1.5 space-y-1 text-xs text-emerald-600 dark:text-emerald-400">
          <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} /> Grow-Plan mit Phasen wird generiert</li>
          <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} /> Tägliche Tasks für dein Level werden zugewiesen</li>
          <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} /> Du wirst direkt zu deinem Grow weitergeleitet</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={onBack}
          className="flex-1 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground/80 transition hover:border-emerald-300 active:scale-[0.97] disabled:opacity-40"
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
            <span className="flex items-center justify-center gap-2">
              <Sprout className="h-4 w-4" strokeWidth={2} /> Grow erstellen →
            </span>
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

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const grow = await createGrow({
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
    } catch (err) {
      console.error("[grows] Grow setup failed:", err);
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
