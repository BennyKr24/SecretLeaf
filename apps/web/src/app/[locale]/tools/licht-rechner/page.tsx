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

export default function LichtRechnerPage() {
  const { inputs, setInput, loaded, saveSnapshot } = useToolState({
    slug: 'licht-rechner',
    defaults: DEFAULTS,
    setupKeys: ['lampenLeistung'],
  });

  const tr = useTranslations('toolResult');
  const t = useTranslations('tool');
  const output = useMemo(() => calculateLighting(inputs, tr), [inputs, tr]);
  const TIPS = [t('lighting.tip1'), t('lighting.tip2'), t('lighting.tip3'), t('lighting.tip4')];

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
            <h2 className="text-base font-bold text-foreground">{t('lighting.situationTitle')}</h2>
            <p className="mt-0.5 text-xs text-muted-fg">{t('lighting.situationHint')}</p>
          </div>

          <ToolSlider
            label={t('lighting.lampPower')}
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
            label={t('lighting.ledEfficiency')}
            value={inputs.effizienz}
            onChange={(v) => setInput('effizienz', v)}
            min={1.0}
            max={3.5}
            step={0.1}
            unit="µmol/J"
            marks={[
              { value: 1.0, label: 'HPS' },
              { value: 2.0, label: t('lighting.markLedAvg') },
              { value: 3.0, label: t('lighting.markTopLed') },
            ]}
          />

          <ToolSlider
            label={t('lighting.reflectorLoss')}
            value={inputs.reflektorVerlust}
            onChange={(v) => setInput('reflektorVerlust', v)}
            min={0}
            max={40}
            step={5}
            unit="%"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolInput
              label={t('lighting.mountHeight')}
              value={inputs.aufhaengHoehe}
              onChange={(v) => setInput('aufhaengHoehe', v)}
              unit="cm"
              min={15}
              max={150}
              step={5}
              hint={t('lighting.mountHeightHint')}
            />
            <ToolInput
              label={t('lighting.growArea')}
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
              label={t('lighting.photoperiod')}
              value={inputs.photoperiode}
              onChange={(v) => setInput('photoperiode', v)}
              min={12}
              max={24}
              step={1}
              unit="h/Tag"
              marks={[
                { value: 12, label: t('lighting.markPhotoperiodFlower') },
                { value: 18, label: t('lighting.markPhotoperiodVeg') },
                { value: 24, label: '24h' },
              ]}
            />
            <ToolSelect
              label={t('lighting.phase')}
              value={inputs.phase}
              onChange={(v) => setInput('phase', v as 'veg' | 'bluete')}
              options={[
                { value: 'veg', label: t('phaseVeg') },
                { value: 'bluete', label: t('phaseBluete') },
              ]}
            />
          </div>
        </div>

        {/* ── Results ─────────────────────────────────── */}
        <div className="space-y-5">
          <ToolResultCard
            title={t('lighting.cardTitle')}
            interpretation={
              output.ppfd < 250
                ? t('lighting.interpVeryLow')
                : output.ppfd < 400
                ? t('lighting.interpLow')
                : output.ppfd <= 700
                ? t('lighting.interpVeg', { dli: output.dli })
                : output.ppfd <= 1000
                ? t('lighting.interpFlower', { dli: output.dli })
                : t('lighting.interpVeryHigh')
            }
            recommendation={
              output.ppfd < 250
                ? t('lighting.recLow')
                : output.ppfd > 1200
                ? t('lighting.recHigh')
                : undefined
            }
          >
            <ToolResult
              label={t('lighting.labelPpfd')}
              value={`${output.ppfd}`}
              unit="µmol/m²/s"
              level={output.results[0]?.level}
              explanation={output.results[0]?.explanation}
              large
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolResult
                label={t('lighting.labelDli')}
                value={`${output.dli}`}
                unit="mol/m²/d"
                explanation={output.results[1]?.explanation}
              />
              <ToolResult
                label={t('lighting.labelTotalPpf')}
                value={`${output.ppf}`}
                unit="µmol/s"
              />
              <ToolResult
                label={t('lighting.labelUsablePpf')}
                value={`${output.nutzbarePPF}`}
                unit="µmol/s"
              />
              <ToolResult
                label={t('lighting.labelHeightFactor')}
                value={output.results[4]?.formatted ?? '—'}
              />
            </div>
          </ToolResultCard>

          <ToolRangeBar
            label={t('lighting.rangeBarLabel')}
            value={output.ppfd}
            min={0}
            max={1500}
            unit="µmol/m²/s"
            zones={[
              { from: 0, to: 250, level: 'rot', label: t('rangeLow') },
              { from: 250, to: 600, level: 'gelb', label: t('rangeMid') },
              { from: 600, to: 1000, level: 'gruen', label: t('rangeOptimal') },
              { from: 1000, to: 1500, level: 'gelb', label: t('rangeHigh') },
            ]}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
