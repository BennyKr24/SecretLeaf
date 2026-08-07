'use client';

import { useMemo } from 'react';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolInput from '@/components/tools/ToolInput';
import ToolSlider from '@/components/tools/ToolSlider';
import ToolSelect from '@/components/tools/ToolSelect';
import { ToolResult, ToolResultCard } from '@/components/tools/ToolResult';
import ToolRangeBar from '@/components/tools/ToolRangeBar';
import { useToolState } from '@/hooks/useToolState';
import { getToolBySlug } from '@/lib/tools/registry';
import { calculateNutrients, type NutrientInputs } from '@/lib/tools/nutrients';
import type { Substrat } from '@/lib/tools/types';

const meta = getToolBySlug('naehrstoff-rechner')!;

const DEFAULTS: NutrientInputs = {
  ausgangsEC: 0.3,
  zielEC: 1.4,
  wassermenge: 10,
  phase: 'veg',
  substrat: 'coco',
  dosierungBasis: 2.0,
  produktName: 'Allgemein',
};

const TIPS = [
  'Kalibriere dein EC-Meter regelmäßig — ein Fehler von ±0.3 macht bei Pflanzen einen Unterschied.',
  'Bei Coco immer CalMag hinzufügen — Coco bindet Kalzium und Magnesium aktiv.',
  'Drain-EC deutlich über Input-EC (>+0.5)? Dann mit klarem Wasser spülen.',
  'Hohe Temperaturen → Pflanzen trinken mehr als sie fressen → EC im Substrat steigt.',
];

export default function NaehrstoffRechnerPage() {
  const { inputs, setInput, loaded, saveSnapshot } = useToolState({
    slug: 'naehrstoff-rechner',
    defaults: DEFAULTS,
    setupKeys: ['substrat'],
  });

  const output = useMemo(() => calculateNutrients(inputs), [inputs]);

  useMemo(() => {
    if (loaded) saveSnapshot(inputs, output.results);
  }, [output, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded) {
    return (
      <main className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="h-8 w-48 rounded skeleton" />
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <ToolLayout meta={meta} tips={TIPS}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* ── Inputs ──────────────────────────────────── */}
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-foreground">Deine Nährlösung</h2>
            <p className="mt-0.5 text-xs text-muted-fg">Basisdosierung steht auf dem Produkt — oder nutze 2.0 ml/L als Startwert.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolSlider
              label="Ausgangs-EC (Wasser)"
              value={inputs.ausgangsEC}
              onChange={(v) => setInput('ausgangsEC', v)}
              min={0}
              max={1.5}
              step={0.1}
              unit="mS/cm"
            />
            <ToolSlider
              label="Ziel-EC"
              value={inputs.zielEC}
              onChange={(v) => setInput('zielEC', v)}
              min={0.5}
              max={3.5}
              step={0.1}
              unit="mS/cm"
              marks={[
                { value: 0.5, label: '0.5' },
                { value: 1.4, label: 'Veg' },
                { value: 2.2, label: 'Blüte' },
                { value: 3.5, label: '3.5' },
              ]}
            />
          </div>

          <ToolInput
            label="Wassermenge"
            value={inputs.wassermenge}
            onChange={(v) => setInput('wassermenge', v)}
            unit="Liter"
            min={1}
            max={500}
            step={1}
            hint="Gesamtvolumen der Nährlösung"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolSelect
              label="Phase"
              value={inputs.phase}
              onChange={(v) => setInput('phase', v as NutrientInputs['phase'])}
              options={[
                { value: 'veg', label: 'Vegetativ' },
                { value: 'uebergang', label: 'Übergang' },
                { value: 'bluete', label: 'Blüte' },
              ]}
            />
            <ToolSelect
              label="Substrat"
              value={inputs.substrat}
              onChange={(v) => setInput('substrat', v as Substrat)}
              options={[
                { value: 'erde', label: 'Erde' },
                { value: 'coco', label: 'Coco' },
                { value: 'hydro', label: 'Hydro' },
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolInput
              label="Basisdosierung"
              value={inputs.dosierungBasis}
              onChange={(v) => setInput('dosierungBasis', v)}
              unit="ml/L bei EC 1.0"
              min={0.5}
              max={10}
              step={0.5}
              hint="Herstellerangabe oder Erfahrungswert"
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-fg">Produktname</label>
              <input
                type="text"
                value={inputs.produktName}
                onChange={(e) => setInput('produktName', e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground outline-none
                  transition-[border-color,box-shadow] hover:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                placeholder="z. B. BioBizz, Canna …"
              />
              <p className="text-xs text-muted-fg">Für eigene Zuordnung</p>
            </div>
          </div>
        </div>

        {/* ── Results ─────────────────────────────────── */}
        <div className="space-y-5">
          <ToolResultCard
            title="Du gibst pro Liter"
            interpretation={
              output.ecDifferenz < 0.3
                ? 'Dein Leitungswasser hat schon viel Mineralien — wenig Dünger nötig.'
                : output.dosierungProLiter < 1
                ? `Sehr geringe Dosis. Starte damit und erhöhe schrittweise.`
                : `Für ${inputs.wassermenge} L Nährlösung auf EC ${inputs.zielEC} mS/cm.`
            }
            recommendation={
              output.dosierungProLiter > 5
                ? 'Teile die Gabe in zwei Teile auf und prüfe den pH nach jedem Schritt.'
                : output.ecDifferenz < 0.3
                ? 'Messe die Drain-EC regelmäßig — Salzaufbau ist hier wahrscheinlicher.'
                : undefined
            }
          >
            <ToolResult
              label="Empfohlene Dosierung"
              value={`${output.dosierungProLiter}`}
              unit="ml/L"
              level={output.results[0]?.level}
              explanation={output.results[0]?.explanation}
              large
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolResult
                label="Gesamtmenge"
                value={`${output.gesamtDosierung}`}
                unit="ml"
                explanation={output.results[1]?.explanation}
              />
              <ToolResult
                label="EC-Differenz"
                value={`${output.ecDifferenz}`}
                unit="mS/cm"
              />
            </div>

            <ToolResult
              label="Korrekturfaktoren"
              value={output.results[3]?.formatted ?? '—'}
            />
          </ToolResultCard>

          <ToolRangeBar
            label="Ziel-EC einordnen"
            value={inputs.zielEC}
            min={0}
            max={4}
            unit="mS/cm"
            zones={[
              { from: 0, to: 0.8, level: 'gelb', label: 'Keimlinge' },
              { from: 0.8, to: 1.8, level: 'gruen', label: 'Veg' },
              { from: 1.8, to: 2.5, level: 'gruen', label: 'Blüte' },
              { from: 2.5, to: 4.0, level: 'rot', label: 'Hoch' },
            ]}
          />

          {/* Substrate tip */}
          {output.results[4] && (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
              <p className="text-sm font-medium text-cyan-900">{output.results[4].formatted}</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
