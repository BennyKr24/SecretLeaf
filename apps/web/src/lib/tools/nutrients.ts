import type { ToolResultData, ResultLevel, Substrat, ToolT } from './types';
import { round } from './units';

// ── Nutrient / EC calculator ───────────────────────────────────────────────
// Calculates recommended dosage based on target EC, water EC, phase and substrate.

export type NutrientInputs = {
  ausgangsEC: number;     // mS/cm (0.0 – 1.5)
  zielEC: number;         // mS/cm (0.5 – 3.5)
  wassermenge: number;     // Liter
  phase: 'veg' | 'bluete' | 'uebergang';
  substrat: Substrat;
  /** ml per liter at EC 1.0 (from dilution ratio or generic) */
  dosierungBasis: number;
  produktName: string;
};

export type NutrientOutput = {
  ecDifferenz: number;
  dosierungProLiter: number;
  gesamtDosierung: number;
  results: ToolResultData[];
};

const PHASE_FACTOR: Record<NutrientInputs['phase'], number> = {
  veg: 0.85,
  uebergang: 0.92,
  bluete: 1.0,
};

const SUBSTRAT_FACTOR: Record<Substrat, number> = {
  erde: 0.9,
  coco: 1.0,
  hydro: 1.05,
};

// EC-Zielbereiche sind mediumabhängig: Coco hat keine Puffer-Kapazität und
// verträgt/braucht spürbar höhere EC als Erde, die Salzspitzen abpuffert.
// Hydro (aktive Systeme mit Wurzelbelüftung, z. B. DWC) hat aus demselben
// Grund keinen Puffer und toleriert wegen der Sauerstoffversorgung am
// Wurzelballen tendenziell sogar höhere EC als Coco, nicht niedriger —
// Werte 2026-08-20 recherchiert (Lucas-Formula-/DWC-Feedchart-Konsens,
// kein peer-reviewter Beleg) und von den zuvor 1:1 kopierten Erde-Werten
// angehoben; Blüte war schon zuvor eigenständig kalibriert.
const EC_THRESHOLDS: Record<NutrientInputs['phase'], Record<Substrat, { gruen: number; gelb: number }>> = {
  veg: {
    erde:  { gruen: 1.6, gelb: 2.0 },
    coco:  { gruen: 2.0, gelb: 2.4 },
    hydro: { gruen: 1.8, gelb: 2.2 },
  },
  uebergang: {
    erde:  { gruen: 1.8, gelb: 2.2 },
    coco:  { gruen: 2.2, gelb: 2.6 },
    hydro: { gruen: 2.0, gelb: 2.4 },
  },
  bluete: {
    erde:  { gruen: 2.0, gelb: 2.4 },
    coco:  { gruen: 2.8, gelb: 3.2 },
    hydro: { gruen: 2.2, gelb: 2.8 },
  },
};

function ecLevel(ziel: number, phase: NutrientInputs['phase'], substrat: Substrat): ResultLevel {
  const { gruen, gelb } = EC_THRESHOLDS[phase][substrat];
  if (ziel <= gruen) return 'gruen';
  if (ziel <= gelb) return 'gelb';
  return 'rot';
}

function substratTipp(substrat: Substrat, t: ToolT): string {
  switch (substrat) {
    case 'coco': return t('nutrients.tipCoco');
    case 'hydro': return t('nutrients.tipHydro');
    case 'erde': return t('nutrients.tipErde');
  }
}

export function calculateNutrients(inputs: NutrientInputs, t: ToolT): NutrientOutput {
  const { ausgangsEC, zielEC, wassermenge, phase, substrat, dosierungBasis, produktName } = inputs;

  const ecDifferenz = round(Math.max(0, zielEC - ausgangsEC), 2);
  const phaseFactor = PHASE_FACTOR[phase];
  const substratFactor = SUBSTRAT_FACTOR[substrat];

  // Dosage: scale linearly from base dosage at EC 1.0
  const dosierungProLiter = round(dosierungBasis * ecDifferenz * phaseFactor * substratFactor, 2);
  const gesamtDosierung = round(dosierungProLiter * wassermenge, 1);

  const level = ecLevel(zielEC, phase, substrat);
  const phaseLabel =
    phase === 'veg'
      ? t('nutrients.phaseVeg')
      : phase === 'bluete'
        ? t('nutrients.phaseBluete')
        : t('nutrients.phaseUebergang');
  const productLabel = produktName === 'Allgemein' ? t('nutrients.productGeneric') : produktName;

  const results: ToolResultData[] = [
    {
      label: 'Empfohlene Dosierung',
      value: dosierungProLiter,
      formatted: `${dosierungProLiter}`,
      unit: 'ml/L',
      level,
      explanation: t('nutrients.explDosage', { product: productLabel, ec: zielEC, phase: phaseLabel }),
    },
    {
      label: 'Gesamtmenge',
      value: gesamtDosierung,
      formatted: `${gesamtDosierung}`,
      unit: 'ml',
      explanation: t('nutrients.explTotal', { liters: wassermenge }),
    },
    {
      label: 'EC-Differenz',
      value: ecDifferenz,
      formatted: `${ecDifferenz}`,
      unit: 'mS/cm',
      explanation: t('nutrients.explEcDiff', { from: ausgangsEC, to: zielEC }),
    },
    {
      label: 'Korrekturfaktoren',
      value: round(phaseFactor * substratFactor, 2),
      formatted: `${t('nutrients.fPhase')}: ×${phaseFactor}  ·  ${t('nutrients.fSubstrate')}: ×${substratFactor}`,
    },
    {
      label: 'Substrat-Tipp',
      value: 0,
      formatted: substratTipp(substrat, t),
    },
  ];

  return { ecDifferenz, dosierungProLiter, gesamtDosierung, results };
}
