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
import { calculateYield, type YieldInputs } from '@/lib/tools/yield';
import type { Substrat } from '@/lib/tools/types';
import type { TerpiraDifficulty } from '@/lib/terpira/types';

const meta = getToolBySlug('ertrags-schaetzer')!;

const DEFAULTS: YieldInputs = {
  flaeche: 1.0,
  anbauMethode: 'indoor',
  erfahrung: 'einsteiger',
  genetik: 'feminisiert',
  lichtLeistung: 400,
  topfgroesseLiter: 20,
  vegDauer: 'standard',
  pflanzenAnzahl: 4,
  substrat: 'erde',
  duengerIntensitaet: 'mittel',
};

const TIPS = [
  'Diese Schätzung schwankt in der Praxis um ±30 % — nimm sie als Planungsbasis, nicht als Versprechen.',
  'Indoor-Ziel: 0.5 g/W für Einsteiger ist realistisch. 1 g/W und mehr braucht optimale Bedingungen.',
  'Autoflower: kürzerer Zyklus, aber weniger Kontrolle über den Zeitpunkt der Blüteeinleitung.',
  'Hydro lohnt sich erst, wenn du EC, pH und Temperatur zuverlässig im Griff hast.',
];

export default function ErtragSchaetzerPage() {
  const { inputs, setInput, loaded, saveSnapshot } = useToolState({
    slug: 'ertrags-schaetzer',
    defaults: DEFAULTS,
    setupKeys: ['lampenLeistung', 'substrat', 'anbauMethode', 'erfahrung'],
  });

  const output = useMemo(() => calculateYield(inputs), [inputs]);

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
            <h2 className="text-base font-bold text-foreground">Dein Grow-Setup</h2>
            <p className="mt-0.5 text-xs text-muted-fg">Je genauer deine Angaben, desto besser die Prognose.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolSelect
              label="Anbaumethode"
              value={inputs.anbauMethode}
              onChange={(v) => setInput('anbauMethode', v as 'indoor' | 'outdoor')}
              options={[
                { value: 'indoor', label: 'Indoor' },
                { value: 'outdoor', label: 'Outdoor' },
              ]}
            />
            {inputs.anbauMethode === 'indoor' && (
              <ToolSelect
                label="Erfahrung"
                value={inputs.erfahrung}
                onChange={(v) => setInput('erfahrung', v as TerpiraDifficulty)}
                options={[
                  { value: 'einsteiger', label: 'Einsteiger' },
                  { value: 'fortgeschritten', label: 'Fortgeschritten' },
                  { value: 'profi', label: 'Profi' },
                ]}
              />
            )}
            {inputs.anbauMethode === 'outdoor' && (
              <ToolSelect
                label="Vegetationsdauer vor der Blüte"
                value={inputs.vegDauer}
                onChange={(v) => setInput('vegDauer', v as YieldInputs['vegDauer'])}
                options={[
                  { value: 'kurz', label: 'Kurz (< 4 Wochen)' },
                  { value: 'standard', label: 'Standard (4–8 Wochen)' },
                  { value: 'verlaengert', label: 'Verlängert (> 8 Wochen)' },
                ]}
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolSelect
              label="Genetik"
              value={inputs.genetik}
              onChange={(v) => setInput('genetik', v as YieldInputs['genetik'])}
              options={[
                { value: 'feminisiert', label: 'Feminisiert' },
                { value: 'autoflower', label: 'Autoflower' },
                { value: 'regular', label: 'Regulär' },
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

          <ToolInput
            label="Anbaufläche"
            value={inputs.flaeche}
            onChange={(v) => setInput('flaeche', v)}
            unit="m²"
            min={0.25}
            max={100}
            step={0.25}
          />

          <ToolInput
            label="Pflanzenanzahl"
            value={inputs.pflanzenAnzahl}
            onChange={(v) => setInput('pflanzenAnzahl', Math.round(v))}
            min={1}
            max={100}
            step={1}
            hint={`Dichte: ${(inputs.pflanzenAnzahl / Math.max(0.25, inputs.flaeche)).toFixed(1)} Pflanzen/m²`}
          />

          {inputs.anbauMethode === 'indoor' && (
            <ToolSlider
              label="Lichtleistung"
              value={inputs.lichtLeistung}
              onChange={(v) => setInput('lichtLeistung', v)}
              min={100}
              max={2000}
              step={50}
              unit="W"
              marks={[
                { value: 100, label: '100W' },
                { value: 600, label: '600W' },
                { value: 1200, label: '1.200W' },
                { value: 2000, label: '2.000W' },
              ]}
            />
          )}

          {inputs.anbauMethode === 'outdoor' && (
            <div>
              <ToolSlider
                label="Topfgröße pro Pflanze"
                value={inputs.topfgroesseLiter}
                onChange={(v) => setInput('topfgroesseLiter', v)}
                min={5}
                max={120}
                step={5}
                unit="L"
                marks={[
                  { value: 5, label: '5L' },
                  { value: 20, label: '20L' },
                  { value: 50, label: '50L' },
                  { value: 120, label: '120L' },
                ]}
              />
              <p className="mt-1.5 text-xs text-muted-fg">
                Wurzelraum ist der wichtigste Einzelfaktor für Outdoor-Ertrag — größerer Topf schlägt Erfahrung.
              </p>
            </div>
          )}

          <ToolSelect
            label="Dünger-Intensität"
            value={inputs.duengerIntensitaet}
            onChange={(v) => setInput('duengerIntensitaet', v as YieldInputs['duengerIntensitaet'])}
            options={[
              { value: 'niedrig', label: 'Niedrig (organisch/minimal)' },
              { value: 'mittel', label: 'Mittel (Standard-Dosierung)' },
              { value: 'hoch', label: 'Hoch (optimiert)' },
            ]}
          />
        </div>

        {/* ── Results ─────────────────────────────────── */}
        <div className="space-y-5">
          <ToolResultCard
            title="Dein geschätzter Ertrag"
            interpretation={
              output.ertragProQm < 200
                ? `${output.ertragProPflanze} g/Pflanze ist ein typischer Einsteiger-Wert. Sehr viel Potenzial nach oben.`
                : output.ertragProQm < 400
                ? `Solider Wert. Bessere Veg-Phase und optimierte Nährstoffe können ihn deutlich steigern.`
                : `Starke Prognose. Du brauchst hier präzise Kontrolle über Licht, Klima und Nährstoffe.`
            }
            recommendation={
              output.ertragProQm < 200
                ? 'Prüfe zuerst Licht und Nährstoffe — das bringt am meisten.'
                : output.ertragProQm > 600
                ? 'Diese Zahl ist unter Idealbedingungen möglich — plane mit 60–70 % als sicherem Wert.'
                : undefined
            }
          >
            <ToolResult
              label="Geschätzter Gesamtertrag"
              value={`${output.gesamtErtrag}`}
              unit="g"
              level={output.results[0]?.level}
              explanation={output.results[0]?.explanation}
              large
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolResult
                label="Pro Pflanze"
                value={`${output.ertragProPflanze}`}
                unit="g/Pflanze"
              />
              <ToolResult
                label="Pro Quadratmeter"
                value={`${output.ertragProQm}`}
                unit="g/m²"
              />
            </div>

            <ToolResult
              label="Basiskalkulation"
              value={output.results[3]?.formatted ?? '—'}
            />
            <ToolResult
              label="Korrekturfaktoren"
              value={output.results[4]?.formatted ?? '—'}
            />
          </ToolResultCard>

          <ToolRangeBar
            label="Ertrag/m² einordnen"
            value={output.ertragProQm}
            min={0}
            max={800}
            unit="g/m²"
            zones={[
              { from: 0, to: 200, level: 'rot', label: 'Niedrig' },
              { from: 200, to: 400, level: 'gelb', label: 'Mittel' },
              { from: 400, to: 600, level: 'gruen', label: 'Gut' },
              { from: 600, to: 800, level: 'gelb', label: 'Top' },
            ]}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
