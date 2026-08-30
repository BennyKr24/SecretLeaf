'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
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

export default function ErtragSchaetzerPage() {
  const { inputs, setInput, loaded, saveSnapshot } = useToolState({
    slug: 'ertrags-schaetzer',
    defaults: DEFAULTS,
    setupKeys: ['lampenLeistung', 'substrat', 'anbauMethode', 'erfahrung'],
  });

  const tr = useTranslations('toolResult');
  const t = useTranslations('tool');
  const output = useMemo(() => calculateYield(inputs, tr), [inputs, tr]);
  const TIPS = [t('yield.tip1'), t('yield.tip2'), t('yield.tip3'), t('yield.tip4')];

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
            <h2 className="text-base font-bold text-foreground">{t('yield.setupTitle')}</h2>
            <p className="mt-0.5 text-xs text-muted-fg">{t('yield.setupHint')}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolSelect
              label={t('yield.method')}
              value={inputs.anbauMethode}
              onChange={(v) => setInput('anbauMethode', v as 'indoor' | 'outdoor')}
              options={[
                { value: 'indoor', label: 'Indoor' },
                { value: 'outdoor', label: 'Outdoor' },
              ]}
            />
            {inputs.anbauMethode === 'indoor' && (
              <ToolSelect
                label={t('yield.experience')}
                value={inputs.erfahrung}
                onChange={(v) => setInput('erfahrung', v as TerpiraDifficulty)}
                options={[
                  { value: 'einsteiger', label: t('yield.expEinsteiger') },
                  { value: 'fortgeschritten', label: t('yield.expFortgeschritten') },
                  { value: 'profi', label: t('yield.expProfi') },
                ]}
              />
            )}
            {inputs.anbauMethode === 'outdoor' && (
              <ToolSelect
                label={t('yield.vegDuration')}
                value={inputs.vegDauer}
                onChange={(v) => setInput('vegDauer', v as YieldInputs['vegDauer'])}
                options={[
                  { value: 'kurz', label: t('yield.vegShort') },
                  { value: 'standard', label: t('yield.vegStandard') },
                  { value: 'verlaengert', label: t('yield.vegExtended') },
                ]}
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolSelect
              label={t('yield.genetics')}
              value={inputs.genetik}
              onChange={(v) => setInput('genetik', v as YieldInputs['genetik'])}
              options={[
                { value: 'feminisiert', label: t('yield.genFeminized') },
                { value: 'autoflower', label: 'Autoflower' },
                { value: 'regular', label: t('yield.genRegular') },
              ]}
            />
            <ToolSelect
              label={t('yield.substrate')}
              value={inputs.substrat}
              onChange={(v) => setInput('substrat', v as Substrat)}
              options={[
                { value: 'erde', label: t('yield.substrateSoil') },
                { value: 'coco', label: 'Coco' },
                { value: 'hydro', label: 'Hydro' },
              ]}
            />
          </div>

          <ToolInput
            label={t('yield.growArea')}
            value={inputs.flaeche}
            onChange={(v) => setInput('flaeche', v)}
            unit="m²"
            min={0.25}
            max={100}
            step={0.25}
          />

          <ToolInput
            label={t('yield.plantCount')}
            value={inputs.pflanzenAnzahl}
            onChange={(v) => setInput('pflanzenAnzahl', Math.round(v))}
            min={1}
            max={100}
            step={1}
            hint={t('yield.densityHint', { density: (inputs.pflanzenAnzahl / Math.max(0.25, inputs.flaeche)).toFixed(1) })}
          />

          {inputs.anbauMethode === 'indoor' && (
            <ToolSlider
              label={t('yield.lightPower')}
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
                label={t('yield.potSize')}
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
                {t('yield.potNote')}
              </p>
            </div>
          )}

          <ToolSelect
            label={t('yield.feedIntensity')}
            value={inputs.duengerIntensitaet}
            onChange={(v) => setInput('duengerIntensitaet', v as YieldInputs['duengerIntensitaet'])}
            options={[
              { value: 'niedrig', label: t('yield.feedLow') },
              { value: 'mittel', label: t('yield.feedMid') },
              { value: 'hoch', label: t('yield.feedHigh') },
            ]}
          />
        </div>

        {/* ── Results ─────────────────────────────────── */}
        <div className="space-y-5">
          <ToolResultCard
            title={t('yield.cardTitle')}
            interpretation={
              output.ertragProQm < 200
                ? t('yield.interpLow', { perPlant: output.ertragProPflanze })
                : output.ertragProQm < 400
                ? t('yield.interpMid')
                : t('yield.interpHigh')
            }
            recommendation={
              output.ertragProQm < 200
                ? t('yield.recLow')
                : output.ertragProQm > 600
                ? t('yield.recHigh')
                : undefined
            }
          >
            <ToolResult
              label={t('yield.labelTotal')}
              value={`${output.gesamtErtrag}`}
              unit="g"
              level={output.results[0]?.level}
              explanation={output.results[0]?.explanation}
              large
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolResult
                label={t('yield.labelPerPlant')}
                value={`${output.ertragProPflanze}`}
                unit="g/Pflanze"
              />
              <ToolResult
                label={t('yield.labelPerSqm')}
                value={`${output.ertragProQm}`}
                unit="g/m²"
              />
            </div>

            <ToolResult
              label={t('yield.labelBaseCalc')}
              value={output.results[3]?.formatted ?? '—'}
            />
            <ToolResult
              label={t('yield.labelFactors')}
              value={output.results[4]?.formatted ?? '—'}
            />
          </ToolResultCard>

          <ToolRangeBar
            label={t('yield.rangeBarLabel')}
            value={output.ertragProQm}
            min={0}
            max={800}
            unit="g/m²"
            zones={[
              { from: 0, to: 200, level: 'rot', label: t('rangeLow') },
              { from: 200, to: 400, level: 'gelb', label: t('rangeMid') },
              { from: 400, to: 600, level: 'gruen', label: t('rangeGood') },
              { from: 600, to: 800, level: 'gelb', label: t('rangeTop') },
            ]}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
