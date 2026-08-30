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

export default function NaehrstoffRechnerPage() {
  const { inputs, setInput, loaded, saveSnapshot } = useToolState({
    slug: 'naehrstoff-rechner',
    defaults: DEFAULTS,
    setupKeys: ['substrat'],
  });

  const tr = useTranslations('toolResult');
  const t = useTranslations('tool');
  const output = useMemo(() => calculateNutrients(inputs, tr), [inputs, tr]);
  const TIPS = [t('nutrients.tip1'), t('nutrients.tip2'), t('nutrients.tip3'), t('nutrients.tip4')];

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
            <h2 className="text-base font-bold text-foreground">{t('nutrients.solutionTitle')}</h2>
            <p className="mt-0.5 text-xs text-muted-fg">{t('nutrients.solutionHint')}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolSlider
              label={t('nutrients.sourceEc')}
              value={inputs.ausgangsEC}
              onChange={(v) => setInput('ausgangsEC', v)}
              min={0}
              max={1.5}
              step={0.1}
              unit="mS/cm"
            />
            <ToolSlider
              label={t('nutrients.targetEc')}
              value={inputs.zielEC}
              onChange={(v) => setInput('zielEC', v)}
              min={0.5}
              max={3.5}
              step={0.1}
              unit="mS/cm"
              marks={[
                { value: 0.5, label: '0.5' },
                { value: 1.4, label: t('nutrients.markVeg') },
                { value: 2.2, label: t('nutrients.markFlower') },
                { value: 3.5, label: '3.5' },
              ]}
            />
          </div>

          <ToolInput
            label={t('nutrients.waterAmount')}
            value={inputs.wassermenge}
            onChange={(v) => setInput('wassermenge', v)}
            unit={t('nutrients.waterUnit')}
            min={1}
            max={500}
            step={1}
            hint={t('nutrients.waterHint')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolSelect
              label={t('nutrients.phase')}
              value={inputs.phase}
              onChange={(v) => setInput('phase', v as NutrientInputs['phase'])}
              options={[
                { value: 'veg', label: t('nutrients.phaseVeg') },
                { value: 'uebergang', label: t('nutrients.phaseTransition') },
                { value: 'bluete', label: t('nutrients.phaseFlower') },
              ]}
            />
            <ToolSelect
              label={t('nutrients.substrate')}
              value={inputs.substrat}
              onChange={(v) => setInput('substrat', v as Substrat)}
              options={[
                { value: 'erde', label: t('nutrients.substrateSoil') },
                { value: 'coco', label: 'Coco' },
                { value: 'hydro', label: 'Hydro' },
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ToolInput
              label={t('nutrients.baseDosage')}
              value={inputs.dosierungBasis}
              onChange={(v) => setInput('dosierungBasis', v)}
              unit={t('nutrients.baseDosageUnit')}
              min={0.5}
              max={10}
              step={0.5}
              hint={t('nutrients.baseDosageHint')}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-fg">{t('nutrients.productName')}</label>
              <input
                type="text"
                value={inputs.produktName}
                onChange={(e) => setInput('produktName', e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground outline-none
                  transition-[border-color,box-shadow] hover:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                placeholder={t('nutrients.productPlaceholder')}
              />
              <p className="text-xs text-muted-fg">{t('nutrients.productHelp')}</p>
            </div>
          </div>
        </div>

        {/* ── Results ─────────────────────────────────── */}
        <div className="space-y-5">
          <ToolResultCard
            title={t('nutrients.cardTitle')}
            interpretation={
              output.ecDifferenz < 0.3
                ? t('nutrients.interpLowEc')
                : output.dosierungProLiter < 1
                ? t('nutrients.interpLowDose')
                : t('nutrients.interpNormal', { liters: inputs.wassermenge, ec: inputs.zielEC })
            }
            recommendation={
              output.dosierungProLiter > 5
                ? t('nutrients.recSplit')
                : output.ecDifferenz < 0.3
                ? t('nutrients.recDrain')
                : undefined
            }
          >
            <ToolResult
              label={t('nutrients.labelDosage')}
              value={`${output.dosierungProLiter}`}
              unit="ml/L"
              level={output.results[0]?.level}
              explanation={output.results[0]?.explanation}
              large
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolResult
                label={t('nutrients.labelTotal')}
                value={`${output.gesamtDosierung}`}
                unit="ml"
                explanation={output.results[1]?.explanation}
              />
              <ToolResult
                label={t('nutrients.labelEcDiff')}
                value={`${output.ecDifferenz}`}
                unit="mS/cm"
              />
            </div>

            <ToolResult
              label={t('nutrients.labelFactors')}
              value={output.results[3]?.formatted ?? '—'}
            />
          </ToolResultCard>

          <ToolRangeBar
            label={t('nutrients.rangeBarLabel')}
            value={inputs.zielEC}
            min={0}
            max={4}
            unit="mS/cm"
            zones={[
              { from: 0, to: 0.8, level: 'gelb', label: t('nutrients.rangeSeedlings') },
              { from: 0.8, to: 1.8, level: 'gruen', label: t('nutrients.markVeg') },
              { from: 1.8, to: 2.5, level: 'gruen', label: t('nutrients.markFlower') },
              { from: 2.5, to: 4.0, level: 'rot', label: t('rangeHigh') },
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
