import type { ToolResultData, ResultLevel, ToolT } from './types';
import { round } from './units';

// ── VPD Calculation ─────────────────────────────────────────────────────────
// SVP(T) = 0.6108 × e^(17.27×T/(T+237.3))  [kPa]  — Magnus formula
// VPD    = SVP(leafTemp) − (RH/100) × SVP(airTemp)
// leafTemp = airTemp + offset (default −2 °C für LED: Blatt läuft kühler als
// Luft, da LEDs kaum Infrarot abstrahlen. Bei HPS ist das Vorzeichen
// umgekehrt — dafür den manuellen Offset nutzen.)
//
// Phase zones (grün):
//   Sämling / Klon : 0.40 – 0.80 kPa
//   Vegetativ      : 0.80 – 1.20 kPa
//   Blüte          : 1.00 – 1.50 kPa

export type VPDPhase = 'saemling' | 'veg' | 'bluete';

export type VPDInputs = {
  lufttemperatur: number;      // °C  (15 – 35)
  luftfeuchtigkeit: number;    // %   (20 – 90)
  blattOffsetManuell: boolean; // true = use custom offset
  blattOffset: number;         // °C  (-2 to +5, used when blattOffsetManuell=true)
  phase: VPDPhase;
};

export type VPDOutput = {
  vpd: number;        // kPa (calculated with leaf temp)
  svpAir: number;     // kPa
  svpLeaf: number;    // kPa
  leafTemp: number;   // °C
  optimalMin: number; // kPa — phase lower bound
  optimalMax: number; // kPa — phase upper bound
  zone: string;       // human readable zone label
  level: ResultLevel;
  targetRH: number;   // % — rh required to hit ideal-VPD midpoint
  results: ToolResultData[];
};

/** Magnus formula — saturation vapour pressure [kPa] */
function svp(tempC: number): number {
  return 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/** Phase-specific optimal VPD range [min, max] in kPa */
const OPTIMAL_RANGES: Record<VPDPhase, [number, number]> = {
  saemling: [0.4, 0.8],
  veg:      [0.8, 1.2],
  bluete:   [1.0, 1.5],
};

export const VPD_PHASE_LABELS: Record<VPDPhase, string> = {
  saemling: 'Sämling / Klon',
  veg:      'Vegetativ',
  bluete:   'Blüte',
};

const phaseLabel = (t: ToolT, phase: VPDPhase): string =>
  t(`vpd.phase${phase.charAt(0).toUpperCase()}${phase.slice(1)}`);

function vpdLevel(vpd: number, phase: VPDPhase): ResultLevel {
  const [min, max] = OPTIMAL_RANGES[phase];
  if (vpd < 0.3)                         return 'rot';  // extreme condensation / botrytis
  if (vpd > 1.8)                         return 'rot';  // severe drought stress
  if (vpd >= min && vpd <= max)          return 'gruen';
  if (vpd >= min - 0.2 && vpd < min)    return 'gelb';
  if (vpd > max && vpd <= max + 0.3)    return 'gelb';
  return 'rot';
}

function vpdZone(vpd: number, phase: VPDPhase, t: ToolT): string {
  const [min, max] = OPTIMAL_RANGES[phase];
  const phase_ = phaseLabel(t, phase);
  if (vpd < 0.3)    return t('vpd.zoneMoldRisk');
  if (vpd < min)    return t('vpd.zoneTooHumid', { phase: phase_ });
  if (vpd <= max)   return t('vpd.zoneOptimal', { phase: phase_ });
  if (vpd <= 1.7)   return t('vpd.zoneTooDry');
  return t('vpd.zoneDroughtStress');
}

function vpdExplanation(vpd: number, phase: VPDPhase, t: ToolT): string {
  const [min, max] = OPTIMAL_RANGES[phase];
  const v = { vpd, phase: phaseLabel(t, phase), min, max };
  if (vpd < 0.3)  return t('vpd.explVeryLow', v);
  if (vpd < min)  return t('vpd.explBelow', v);
  if (vpd <= max) return t('vpd.explInRange', v);
  if (vpd <= 1.7) return t('vpd.explAbove', v);
  return t('vpd.explCritical', v);
}

export function calculateVPD(inputs: VPDInputs, t: ToolT): VPDOutput {
  const { lufttemperatur, luftfeuchtigkeit, blattOffsetManuell, blattOffset, phase } = inputs;

  const offset   = blattOffsetManuell ? blattOffset : -2;
  const leafTemp = round(lufttemperatur + offset, 1);
  const svpAir   = round(svp(lufttemperatur), 3);
  const svpLeaf  = round(svp(leafTemp), 3);
  const vpd      = round(Math.max(0, svpLeaf - (luftfeuchtigkeit / 100) * svpAir), 2);

  const [optimalMin, optimalMax] = OPTIMAL_RANGES[phase];
  const midVPD = (optimalMin + optimalMax) / 2;

  // RH target: VPD = svpLeaf − RH × svpAir  →  RH = (svpLeaf − targetVPD) / svpAir
  const targetRH = Math.min(95, Math.max(20, round(((svpLeaf - midVPD) / svpAir) * 100, 0)));

  const level = vpdLevel(vpd, phase);
  const zone  = vpdZone(vpd, phase, t);

  const results: ToolResultData[] = [
    {
      label: 'VPD (Blatttemperatur)',
      value: vpd,
      formatted: `${vpd}`,
      unit: 'kPa',
      level,
      explanation: vpdExplanation(vpd, phase, t),
    },
    {
      label: 'Empfohlene Luftfeuchte',
      value: targetRH,
      formatted: `${targetRH}`,
      unit: '%',
      explanation: t('vpd.explTargetRh', { mid: midVPD, rh: targetRH }),
    },
    {
      label: 'SVP Luft',
      value: svpAir,
      formatted: `${svpAir}`,
      unit: 'kPa',
      explanation: t('vpd.explSvpAir', { temp: lufttemperatur }),
    },
    {
      label: 'SVP Blatt',
      value: svpLeaf,
      formatted: `${svpLeaf}`,
      unit: 'kPa',
      explanation: t('vpd.explSvpLeaf', {
        temp: leafTemp,
        offset: `${offset >= 0 ? '+' : ''}${offset}`,
      }),
    },
  ];

  return { vpd, svpAir, svpLeaf, leafTemp, optimalMin, optimalMax, zone, level, targetRH, results };
}
