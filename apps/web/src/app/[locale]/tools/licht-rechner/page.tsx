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
import { calculateLighting, type LightingInputs } from '@/lib/tools/lighting';

const meta = getToolBySlug('licht-rechner')!;

const DEFAULTS: LightingInputs = {
  lampenLeistung: 300,
  effizienz: 2.5,
  reflektorVerlust: 10,
  aufhaengHoehe: 40,
  flaeche: 1.0,
  photoperiode: 18,
  phase: 'veg',
};

const TIPS = [
  'Mess die PPFD mit einem PAR-Meter — Berechnungen sind immer Schätzwerte.',
  'Über 1.000 µmol/m²/s lohnt sich CO₂-Supplementierung fast immer.',
  'DLI über 45 mol/m²/d ohne CO₂ führt meist zu Lichtstress statt mehr Ertrag.',
  'Moderne Top-LEDs erreichen 2.8–3.2 µmol/J. Standard-LEDs liegen bei 2.0–2.5 µmol/J.',
];

export default function LichtRechnerPage() {
  const { inputs, setInput, loaded, saveSnapshot } = useToolState({
    slug: 'licht-rechner',
    defaults: DEFAULTS,
    setupKeys: ['lampenLeistung'],
  });

  const output = useMemo(() => calculateLighting(inputs), [inputs]);

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
            <h2 className="text-base font-bold text-foreground">Deine Lichtsituation</h2>
            <p className="mt-0.5 text-xs text-muted-fg">Passe die Werte an dein Setup an — die Ergebnisse ändern sich sofort.</p>
          </div>

          <ToolSlider
            label="Lampenleistung"
            value={inputs.lampenLeistung}
            onChange={(v) => setInput('lampenLeistung', v)}
            min={50}
            max={1500}
            step={10}
            unit="W"
            marks={[
              { value: 50, label: '50W' },
              { value: 400, label: '400W' },
              { value: 1000, label: '1.000W' },
              { value: 1500, label: '1.500W' },
            ]}
          />

          <ToolSlider
            label="LED-Effizienz"
            value={inputs.effizienz}
            onChange={(v) => setInput('effizienz', v)}
            min={1.0}
            max={3.5}
            step={0.1}
            unit="µmol/J"
            marks={[
              { value: 1.0, label: 'HPS' },
              { value: 2.0, label: 'LED Ø' },
              { value: 3.0, label: 'Top LED' },
            ]}
          />

          <ToolSlider
            label="Reflektorverlust"
            value={inputs.reflektorVerlust}
            onChange={(v) => setInput('reflektorVerlust', v)}
            min={0}
            max={40}
            step={5}
            unit="%"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolInput
              label="Aufhänghöhe"
              value={inputs.aufhaengHoehe}
              onChange={(v) => setInput('aufhaengHoehe', v)}
              unit="cm"
              min={15}
              max={150}
              step={5}
              hint="Abstand Lampe → Pflanzenspitze"
            />
            <ToolInput
              label="Anbaufläche"
              value={inputs.flaeche}
              onChange={(v) => setInput('flaeche', v)}
              unit="m²"
              min={0.25}
              max={20}
              step={0.25}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolSlider
              label="Photoperiode"
              value={inputs.photoperiode}
              onChange={(v) => setInput('photoperiode', v)}
              min={12}
              max={24}
              step={1}
              unit="h/Tag"
              marks={[
                { value: 12, label: '12h (Blüte)' },
                { value: 18, label: '18h (Veg)' },
                { value: 24, label: '24h' },
              ]}
            />
            <ToolSelect
              label="Phase"
              value={inputs.phase}
              onChange={(v) => setInput('phase', v as 'veg' | 'bluete')}
              options={[
                { value: 'veg', label: 'Vegetativ' },
                { value: 'bluete', label: 'Blüte' },
              ]}
            />
          </div>
        </div>

        {/* ── Results ─────────────────────────────────── */}
        <div className="space-y-5">
          <ToolResultCard
            title="Deine Pflanzen erhalten"
            interpretation={
              output.ppfd < 250
                ? 'Zu wenig Licht — Pflanzen wachsen sehr langsam.'
                : output.ppfd < 400
                ? 'Ausreichend für Keimlinge und Klone, aber unter dem Veg-Optimum.'
                : output.ppfd <= 700
                ? `Guter Bereich für die vegetative Phase. DLI: ${output.dli} mol/m²/d.`
                : output.ppfd <= 1000
                ? `Optimal für die Blüte. DLI: ${output.dli} mol/m²/d — super.`
                : 'Sehr intensive Beleuchtung — CO₂ und präzise Temperaturkontrolle nötig.'
            }
            recommendation={
              output.ppfd < 250
                ? 'Hänge die Lampe tiefer oder verwende ein stärkeres Leuchtmittel.'
                : output.ppfd > 1200
                ? 'Erhöhe den Lampenabstand oder ergänze CO₂ auf 1.000–1.200 ppm.'
                : undefined
            }
          >
            <ToolResult
              label="PPFD (geschätzt)"
              value={`${output.ppfd}`}
              unit="µmol/m²/s"
              level={output.results[0]?.level}
              explanation={output.results[0]?.explanation}
              large
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolResult
                label="DLI"
                value={`${output.dli}`}
                unit="mol/m²/d"
                explanation={output.results[1]?.explanation}
              />
              <ToolResult
                label="Gesamt-PPF"
                value={`${output.ppf}`}
                unit="µmol/s"
              />
              <ToolResult
                label="Nutzbare PPF"
                value={`${output.nutzbarePPF}`}
                unit="µmol/s"
              />
              <ToolResult
                label="Höhenkorrektor"
                value={output.results[4]?.formatted ?? '—'}
              />
            </div>
          </ToolResultCard>

          <ToolRangeBar
            label="PPFD einordnen"
            value={output.ppfd}
            min={0}
            max={1500}
            unit="µmol/m²/s"
            zones={[
              { from: 0, to: 250, level: 'rot', label: 'Niedrig' },
              { from: 250, to: 600, level: 'gelb', label: 'Mittel' },
              { from: 600, to: 1000, level: 'gruen', label: 'Optimal' },
              { from: 1000, to: 1500, level: 'gelb', label: 'Hoch' },
            ]}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
