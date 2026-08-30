'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolInput from '@/components/tools/ToolInput';
import ToolSlider from '@/components/tools/ToolSlider';
import ToolToggle from '@/components/tools/ToolToggle';
import { ToolResult, ToolResultCard } from '@/components/tools/ToolResult';
import ToolRangeBar from '@/components/tools/ToolRangeBar';
import { useToolState } from '@/hooks/useToolState';
import { getToolBySlug } from '@/lib/tools/registry';
import { calculateVentilation, type VentilationInputs } from '@/lib/tools/ventilation';

const meta = getToolBySlug('abluft-rechner')!;

const DEFAULTS: VentilationInputs = {
  raumLaenge: 1.2,
  raumBreite: 1.2,
  raumHoehe: 2.0,
  lichtLeistung: 400,
  akfAktiv: true,
  umgebungsTemp: 25,
  zielTemp: 26,
};

const TIPS = [
  'Kauf lieber einen Lüfter eine Stufe größer — er läuft dann leiser und hält länger.',
  'Jeder 90°-Bogen in deiner Rohrführung kostet ~10 % Volumenstrom.',
  'Mit Drehzahlregler kannst du Temperatur und Lautstärke fein abstimmen.',
  'AKF erhöht den Widerstand spürbar. +25 % ist ein realistischer Richtwert, kann aber mehr sein.',
];

export default function AbluftRechnerPage() {
  const { inputs, setInput, loaded, saveSnapshot } = useToolState({
    slug: 'abluft-rechner',
    defaults: DEFAULTS,
    setupKeys: ['raumLaenge', 'raumBreite', 'raumHoehe', 'lampenLeistung'],
  });

  const t = useTranslations('toolResult');
  const output = useMemo(() => {
    const result = calculateVentilation(inputs, t);
    return result;
  }, [inputs, t]);

  // Auto-save on every calculation
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
            <h2 className="text-base font-bold text-foreground">Dein Growraum</h2>
            <p className="mt-0.5 text-xs text-muted-fg">Alle Maße als Innenmaß in Metern eingeben.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <ToolInput
              label="Länge (m)"
              value={inputs.raumLaenge}
              onChange={(v) => setInput('raumLaenge', v)}
              unit="m"
              min={0.3}
              max={20}
              step={0.1}
              hint="Innenlänge"
            />
            <ToolInput
              label="Breite (m)"
              value={inputs.raumBreite}
              onChange={(v) => setInput('raumBreite', v)}
              unit="m"
              min={0.3}
              max={20}
              step={0.1}
            />
            <ToolInput
              label="Höhe (m)"
              value={inputs.raumHoehe}
              onChange={(v) => setInput('raumHoehe', v)}
              unit="m"
              min={0.5}
              max={5}
              step={0.1}
            />
          </div>

          <div className="border-t border-border pt-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-fg">Licht & Wärme</h3>
            <ToolSlider
              label="Lampenleistung"
              value={inputs.lichtLeistung}
              onChange={(v) => setInput('lichtLeistung', v)}
              min={0}
              max={2000}
              step={50}
              unit="W"
              marks={[
                { value: 0, label: '0W' },
                { value: 600, label: '600W' },
                { value: 1200, label: '1.200W' },
                { value: 2000, label: '2.000W' },
              ]}
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ToolSlider
                label="Außentemperatur (Zuluft)"
                value={inputs.umgebungsTemp}
                onChange={(v) => setInput('umgebungsTemp', v)}
                min={10}
                max={40}
                step={1}
                unit="°C"
              />
              <ToolSlider
                label="Zieltemperatur im Raum"
                value={inputs.zielTemp}
                onChange={(v) => setInput('zielTemp', v)}
                min={18}
                max={32}
                step={1}
                unit="°C"
              />
            </div>
          </div>

          <ToolToggle
            label="Aktivkohlefilter (AKF) vorhanden"
            checked={inputs.akfAktiv}
            onChange={(v) => setInput('akfAktiv', v)}
            hint="Erhöht den Widerstand — du brauchst ca. 25 % mehr Volumenstrom"
          />
        </div>

        {/* ── Results ─────────────────────────────────── */}
        <div className="space-y-5">
          <ToolResultCard
            title="Dein Lüfter braucht mindestens"
            interpretation={
              output.empfohlenerVolumenstrom <= 300
                ? `Für deinen ${output.raumVolumen} m³ Raum reicht ein kompakter Rohrventilator.`
                : output.empfohlenerVolumenstrom <= 700
                ? `Mittlerer Bedarf — ein guter 125er oder 150er Ventilator passt.`
                : `Hoher Bedarf — such einen EC-Lüfter mit Drehzahlregler.`
            }
            recommendation={
              output.empfohlenerVolumenstrom > 800
                ? 'Wähle einen EC-Lüfter, der auch bei 80 % Drehzahl deinen Volumenstrom schafft.'
                : `Rohrdurchmesser ${output.empfohlenerRohrDurchmesser} mm — eine Größe höher schadet nie.`
            }
          >
            <ToolResult
              label="Benötigter Volumenstrom"
              value={`${output.empfohlenerVolumenstrom}`}
              unit="m³/h"
              level={output.results[0]?.level}
              explanation={output.results[0]?.explanation}
              large
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolResult
                label="Raumvolumen"
                value={`${output.raumVolumen}`}
                unit="m³"
              />
              <ToolResult
                label="Basis-Austausch (60×/h)"
                value={`${output.basisAustausch}`}
                unit="m³/h"
              />
              <ToolResult
                label="Wärmelast (Licht)"
                value={`${output.waermeLast}`}
                unit="m³/h"
                explanation={output.results[3]?.explanation}
              />
              <ToolResult
                label="AKF-Korrektur"
                value={inputs.akfAktiv ? `+${output.akfAufschlag}` : '0'}
                unit="m³/h"
              />
            </div>

            <ToolResult
              label="Empfohlener Rohrdurchmesser"
              value={`${output.empfohlenerRohrDurchmesser}`}
              unit="mm"
              explanation={output.results[5]?.explanation}
            />
          </ToolResultCard>

          <ToolRangeBar
            label="Volumenstrom einordnen"
            value={output.empfohlenerVolumenstrom}
            min={0}
            max={1500}
            unit="m³/h"
            zones={[
              { from: 0, to: 300, level: 'gruen', label: 'Klein' },
              { from: 300, to: 700, level: 'gelb', label: 'Mittel' },
              { from: 700, to: 1500, level: 'rot', label: 'Groß' },
            ]}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
