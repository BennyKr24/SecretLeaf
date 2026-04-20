import type { ToolResultData, ResultLevel } from './types';
import { round } from './units';

// ── VPD Calculation ─────────────────────────────────────────────────────────
// SVP(T) = 0.6108 × e^(17.27×T/(T+237.3))  [kPa]  — Magnus formula
// VPD    = SVP(leafTemp) − (RH/100) × SVP(airTemp)
// leafTemp = airTemp + offset (default +2 °C for LED grow lights)
//
// Phase zones (grün):
//   Sämling / Klon : 0.40 – 0.80 kPa
//   Vegetativ      : 0.70 – 1.00 kPa
//   Blüte          : 1.00 – 1.40 kPa

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
  veg:      [0.7, 1.0],
  bluete:   [1.0, 1.4],
};

export const VPD_PHASE_LABELS: Record<VPDPhase, string> = {
  saemling: 'Sämling / Klon',
  veg:      'Vegetativ',
  bluete:   'Blüte',
};

function vpdLevel(vpd: number, phase: VPDPhase): ResultLevel {
  const [min, max] = OPTIMAL_RANGES[phase];
  if (vpd < 0.3)                         return 'rot';  // extreme condensation / botrytis
  if (vpd > 1.8)                         return 'rot';  // severe drought stress
  if (vpd >= min && vpd <= max)          return 'gruen';
  if (vpd >= min - 0.2 && vpd < min)    return 'gelb';
  if (vpd > max && vpd <= max + 0.3)    return 'gelb';
  return 'rot';
}

function vpdZone(vpd: number, phase: VPDPhase): string {
  const [min, max] = OPTIMAL_RANGES[phase];
  if (vpd < 0.3)    return 'Extremes Schimmelrisiko';
  if (vpd < min)    return `Zu feucht für ${VPD_PHASE_LABELS[phase]}`;
  if (vpd <= max)   return `Optimal für ${VPD_PHASE_LABELS[phase]}`;
  if (vpd <= 1.7)   return 'Zu trocken — Nährstoffaufnahme eingeschränkt';
  return 'Trockenstress — Pflanze schließt Stomata';
}

function vpdExplanation(vpd: number, phase: VPDPhase): string {
  const [min, max] = OPTIMAL_RANGES[phase];
  const label = VPD_PHASE_LABELS[phase];
  if (vpd < 0.3) {
    return `VPD von ${vpd} kPa ist extrem niedrig. Schimmel- und Botrytis-Risiko kritisch hoch. Sofort Luftfeuchte senken.`;
  }
  if (vpd < min) {
    return `VPD von ${vpd} kPa liegt unter dem Optimum für ${label} (${min}–${max} kPa). Temperatur erhöhen oder Luftfeuchte senken.`;
  }
  if (vpd <= max) {
    return `VPD von ${vpd} kPa liegt im Zielbereich für ${label} (${min}–${max} kPa). Stomata offen, Transpiration und Nährstoffaufnahme optimal.`;
  }
  if (vpd <= 1.7) {
    return `VPD von ${vpd} kPa überschreitet den optimalen Bereich für ${label} (${min}–${max} kPa). Luftfeuchte erhöhen oder Temperatur senken.`;
  }
  return `VPD von ${vpd} kPa ist kritisch hoch. Die Pflanze schließt die Stomata — Wachstum und Transpiration stoppen. Klima dringend korrigieren.`;
}

export function calculateVPD(inputs: VPDInputs): VPDOutput {
  const { lufttemperatur, luftfeuchtigkeit, blattOffsetManuell, blattOffset, phase } = inputs;

  const offset   = blattOffsetManuell ? blattOffset : 2;
  const leafTemp = round(lufttemperatur + offset, 1);
  const svpAir   = round(svp(lufttemperatur), 3);
  const svpLeaf  = round(svp(leafTemp), 3);
  const vpd      = round(Math.max(0, svpLeaf - (luftfeuchtigkeit / 100) * svpAir), 2);

  const [optimalMin, optimalMax] = OPTIMAL_RANGES[phase];
  const midVPD = (optimalMin + optimalMax) / 2;

  // RH target: VPD = svpLeaf − RH × svpAir  →  RH = (svpLeaf − targetVPD) / svpAir
  const targetRH = Math.min(95, Math.max(20, round(((svpLeaf - midVPD) / svpAir) * 100, 0)));

  const level = vpdLevel(vpd, phase);
  const zone  = vpdZone(vpd, phase);

  const results: ToolResultData[] = [
    {
      label: 'VPD (Blatttemperatur)',
      value: vpd,
      formatted: `${vpd}`,
      unit: 'kPa',
      level,
      explanation: vpdExplanation(vpd, phase),
    },
    {
      label: 'Empfohlene Luftfeuchte',
      value: targetRH,
      formatted: `${targetRH}`,
      unit: '%',
      explanation: `Um den Ideal-VPD von ${midVPD} kPa zu erreichen, sollte die Luftfeuchte bei ${targetRH} % liegen.`,
    },
    {
      label: 'SVP Luft',
      value: svpAir,
      formatted: `${svpAir}`,
      unit: 'kPa',
      explanation: `Sättigungsdampfdruck bei ${lufttemperatur} °C Lufttemperatur.`,
    },
    {
      label: 'SVP Blatt',
      value: svpLeaf,
      formatted: `${svpLeaf}`,
      unit: 'kPa',
      explanation: `Sättigungsdampfdruck bei ${leafTemp} °C Blatttemperatur (+${offset} °C Offset).`,
    },
  ];

  return { vpd, svpAir, svpLeaf, leafTemp, optimalMin, optimalMax, zone, level, targetRH, results };
}
