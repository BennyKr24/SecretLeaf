'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolSlider from '@/components/tools/ToolSlider';
import ToolToggle from '@/components/tools/ToolToggle';
import { ToolResult, ToolResultCard } from '@/components/tools/ToolResult';
import { useToolState } from '@/hooks/useToolState';
import { getToolBySlug } from '@/lib/tools/registry';
import {
  calculateVPD,
  type VPDInputs,
  type VPDPhase,
  type VPDOutput,
} from '@/lib/tools/vpd';
import SaveToGrowButton from '@/components/tools/SaveToGrowButton';
import { BarChart3 } from 'lucide-react';

const meta = getToolBySlug('vpd')!;

const DEFAULTS: VPDInputs = {
  lufttemperatur: 26,
  luftfeuchtigkeit: 60,
  blattOffsetManuell: false,
  blattOffset: -2,
  phase: 'veg',
};

const PHASE_KEY: Record<VPDPhase, string> = {
  saemling: 'phaseSaemling',
  veg: 'phaseVeg',
  bluete: 'phaseBluete',
};

// ── Zone Band ────────────────────────────────────────────────────────────────

const MAX_BAND = 2.0;

type ZoneBandProps = {
  vpd: number;
  optimalMin: number;
  optimalMax: number;
};

function ZoneBand({ vpd, optimalMin, optimalMax }: ZoneBandProps) {
  const t = useTranslations('tool');
  const clamped = Math.min(Math.max(vpd, 0), MAX_BAND);
  const pct     = (clamped / MAX_BAND) * 100;

  // Build zone segments between 0 and MAX_BAND
  const segments: Array<{ from: number; to: number; color: string }> = [
    { from: 0,            to: 0.3,         color: 'bg-rose-500' },
    { from: 0.3,          to: optimalMin,  color: 'bg-amber-400' },
    { from: optimalMin,   to: optimalMax,  color: 'bg-emerald-400' },
    { from: optimalMax,   to: optimalMax + 0.3, color: 'bg-amber-400' },
    { from: optimalMax + 0.3, to: MAX_BAND, color: 'bg-rose-500' },
  ].filter((s) => s.to > s.from);

  return (
    <div>
      <div className="relative mx-1">
        {/* Colored bar */}
        <div className="flex h-5 overflow-hidden rounded-full">
          {segments.map((seg) => (
            <div
              key={seg.from}
              className={`h-full ${seg.color}`}
              style={{ width: `${((seg.to - seg.from) / MAX_BAND) * 100}%` }}
            />
          ))}
        </div>

        {/* Needle */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pct}%` }}
        >
          <div className="h-7 w-1.5 rounded-full bg-slate-900 shadow-md ring-2 ring-white" />
        </div>
      </div>

      {/* Scale */}
      <div className="mt-2 flex justify-between px-0.5 text-[10px] font-medium text-muted-fg">
        <span>0.0</span>
        <span>0.5</span>
        <span>1.0</span>
        <span>1.5</span>
        <span>2.0 kPa</span>
      </div>

      {/* Zone legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-fg">
          <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
          {t('zoneCritical')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-fg">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
          {t('zoneBorderline')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-fg">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
          {t('zoneOptimalPhase')}
        </span>
      </div>
    </div>
  );
}

// ── Phase toggle pills ───────────────────────────────────────────────────────

const PHASES: VPDPhase[] = ['saemling', 'veg', 'bluete'];

type PhasePillsProps = {
  value: VPDPhase;
  onChange: (v: VPDPhase) => void;
};

function PhasePills({ value, onChange }: PhasePillsProps) {
  const t = useTranslations('tool');
  const tr = useTranslations('toolResult');
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground">{t('vpd.growthStage')}</p>
      <div className="flex gap-2">
        {PHASES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-[transform,border-color,background-color,color] duration-150 active:scale-[0.97] ${
              value === p
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : 'border-border bg-card text-muted-fg hover:border-emerald-200 hover:text-foreground'
            }`}
          >
            {tr(`vpd.${PHASE_KEY[p]}`)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Interpretation helper ────────────────────────────────────────────────────

type TFn = (key: string, values?: Record<string, string | number>) => string;

function getInterpretation(out: VPDOutput, phase: VPDPhase, t: TFn, tr: TFn): string {
  const { vpd, level, optimalMin, optimalMax } = out;
  if (level === 'gruen') {
    return t('vpd.interpGreen', { phase: tr(`vpd.${PHASE_KEY[phase]}`) });
  }
  if (vpd < optimalMin) {
    return t('vpd.interpBelow', {
      diff: (optimalMin - vpd).toFixed(2),
      urgency: vpd < 0.3 ? t('vpd.urgencyNow') : t('vpd.urgencySlight'),
    });
  }
  return t('vpd.interpAbove', { diff: (vpd - optimalMax).toFixed(2) });
}

function getRecommendation(out: VPDOutput, t: TFn): string | undefined {
  if (out.level === 'gruen') return undefined;
  return out.vpd < out.optimalMin
    ? t('vpd.recBelow', { rh: out.targetRH })
    : t('vpd.recAbove', { rh: out.targetRH });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function VpdPage() {
  const { inputs, setInput, loaded, saveSnapshot } = useToolState({
    slug: 'vpd',
    defaults: DEFAULTS,
  });

  const tr = useTranslations('toolResult');
  const t = useTranslations('tool');
  const output = useMemo(() => calculateVPD(inputs, tr), [inputs, tr]);
  const TIPS = [t('vpd.tip1'), t('vpd.tip2'), t('vpd.tip3'), t('vpd.tip4'), t('vpd.tip5')];

  useMemo(() => {
    if (loaded) saveSnapshot(inputs, output.results);
  }, [output, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loaded) {
    return (
      <main className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <ToolLayout meta={meta} tips={TIPS}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

        {/* ── Inputs ─────────────────────────────────── */}
        <div className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-foreground">{t('vpd.climateTitle')}</h2>
            <p className="mt-0.5 text-xs text-muted-fg">
              {t('vpd.climateHint')}
            </p>
          </div>

          <PhasePills
            value={inputs.phase}
            onChange={(v) => setInput('phase', v)}
          />

          <ToolSlider
            label={t('vpd.roomTemp')}
            value={inputs.lufttemperatur}
            onChange={(v) => setInput('lufttemperatur', v)}
            min={15}
            max={35}
            step={0.5}
            unit="°C"
            marks={[
              { value: 18, label: '18 °C' },
              { value: 25, label: '25 °C' },
              { value: 32, label: '32 °C' },
            ]}
          />

          <ToolSlider
            label={t('vpd.humidity')}
            value={inputs.luftfeuchtigkeit}
            onChange={(v) => setInput('luftfeuchtigkeit', v)}
            min={20}
            max={90}
            step={1}
            unit="%"
            marks={[
              { value: 40, label: '40 %' },
              { value: 60, label: '60 %' },
              { value: 80, label: '80 %' },
            ]}
          />

          <ToolToggle
            label={t('vpd.manualLeafTemp')}
            checked={inputs.blattOffsetManuell}
            onChange={(v) => setInput('blattOffsetManuell', v)}
            {...(!inputs.blattOffsetManuell && { hint: t('vpd.offsetHint', { temp: (inputs.lufttemperatur - 2).toFixed(1) }) })}
          />

          {inputs.blattOffsetManuell && (
            <ToolSlider
              label={t('vpd.offsetLabel')}
              value={inputs.blattOffset}
              onChange={(v) => setInput('blattOffset', v)}
              min={-3}
              max={5}
              step={0.5}
              unit="°C"
              marks={[
                { value: -2, label: '−2' },
                { value: 0, label: '0' },
                { value: 2, label: '+2' },
                { value: 4, label: '+4' },
              ]}
            />
          )}

          {/* Zone band */}
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-fg">
              {t('vpd.zoneTitle')}
            </p>
            <ZoneBand
              vpd={output.vpd}
              optimalMin={output.optimalMin}
              optimalMax={output.optimalMax}
            />
          </div>
        </div>

        {/* ── Results ────────────────────────────────── */}
        <div className="space-y-5">
          <ToolResultCard
            title={t('vpd.cardTitle')}
            interpretation={getInterpretation(output, inputs.phase, t, tr)}
            recommendation={getRecommendation(output, t)}
          >
            <ToolResult
              label={t('vpd.labelVpd')}
              value={`${output.vpd}`}
              unit="kPa"
              level={output.results[0]?.level}
              explanation={output.results[0]?.explanation}
              large
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolResult
                label={t('vpd.labelTargetRh')}
                value={`${output.targetRH}`}
                unit="% RH"
                explanation={output.results[1]?.explanation}
              />
              <ToolResult
                label={t('vpd.labelLeafTemp')}
                value={`${output.leafTemp}`}
                unit="°C"
                explanation={
                  inputs.blattOffsetManuell
                    ? t('vpd.leafExplManual', { offset: `${inputs.blattOffset >= 0 ? '+' : ''}${inputs.blattOffset}` })
                    : t('vpd.leafExplDefault')
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ToolResult
                label={t('vpd.labelSvpAir')}
                value={`${output.svpAir}`}
                unit="kPa"
                explanation={output.results[2]?.explanation}
              />
              <ToolResult
                label={t('vpd.labelSvpLeaf')}
                value={`${output.svpLeaf}`}
                unit="kPa"
                explanation={output.results[3]?.explanation}
              />
            </div>
          </ToolResultCard>

          {/* Phase reference card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
              <BarChart3 className="h-4 w-4" strokeWidth={2} /> {t('vpd.targetRangesTitle')}
            </h3>
            <div className="space-y-2">
              {(['saemling', 'veg', 'bluete'] as const).map((p) => {
                const isActive = inputs.phase === p;
                return (
                  <div
                    key={p}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                      isActive
                        ? 'bg-emerald-50 font-semibold text-emerald-700 ring-1 ring-emerald-200'
                        : 'text-muted-fg'
                    }`}
                  >
                    <span>{tr(`vpd.${PHASE_KEY[p]}`)}</span>
                    <span className="tabular-nums">
                      {p === 'saemling' ? '0.40 – 0.80' : p === 'veg' ? '0.80 – 1.20' : '1.00 – 1.50'} kPa
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Save to Grow (prep) */}
          <SaveToGrowButton
            toolSlug="vpd"
            toolTitle={t('registry.vpd.title')}
            summary={`VPD ${output.vpd} kPa — ${output.zone}`}
            results={output.results}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
