import type { ToolResultData, ResultLevel, Substrat } from './types';
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

function ecLevel(ziel: number, phase: NutrientInputs['phase']): ResultLevel {
  if (phase === 'veg') {
    if (ziel <= 1.6) return 'gruen';
    if (ziel <= 2.0) return 'gelb';
    return 'rot';
  }
  if (phase === 'uebergang') {
    if (ziel <= 1.8) return 'gruen';
    if (ziel <= 2.2) return 'gelb';
    return 'rot';
  }
  // Blüte
  if (ziel <= 2.2) return 'gruen';
  if (ziel <= 2.8) return 'gelb';
  return 'rot';
}

function substratTipp(substrat: Substrat): string {
  switch (substrat) {
    case 'coco': return 'Coco: 10–20 % Drain-Rate einplanen, um Salzaufbau zu vermeiden.';
    case 'hydro': return 'Hydro: Nährlösung alle 5–7 Tage komplett wechseln.';
    case 'erde': return 'Erde: Organische Pufferung kann EC-Spitzen abfangen.';
  }
}

export function calculateNutrients(inputs: NutrientInputs): NutrientOutput {
  const { ausgangsEC, zielEC, wassermenge, phase, substrat, dosierungBasis, produktName } = inputs;

  const ecDifferenz = round(Math.max(0, zielEC - ausgangsEC), 2);
  const phaseFactor = PHASE_FACTOR[phase];
  const substratFactor = SUBSTRAT_FACTOR[substrat];

  // Dosage: scale linearly from base dosage at EC 1.0
  const dosierungProLiter = round(dosierungBasis * ecDifferenz * phaseFactor * substratFactor, 2);
  const gesamtDosierung = round(dosierungProLiter * wassermenge, 1);

  const level = ecLevel(zielEC, phase);
  const phaseLabel = phase === 'veg' ? 'vegetative Phase' : phase === 'bluete' ? 'Blütephase' : 'Übergangsphase';

  const results: ToolResultData[] = [
    {
      label: 'Empfohlene Dosierung',
      value: dosierungProLiter,
      formatted: `${dosierungProLiter}`,
      unit: 'ml/L',
      level,
      explanation: `Für ${produktName} bei Ziel-EC ${zielEC} mS/cm in ${phaseLabel}.`,
    },
    {
      label: 'Gesamtmenge',
      value: gesamtDosierung,
      formatted: `${gesamtDosierung}`,
      unit: 'ml',
      explanation: `Für ${wassermenge} Liter Nährlösung.`,
    },
    {
      label: 'EC-Differenz',
      value: ecDifferenz,
      formatted: `${ecDifferenz}`,
      unit: 'mS/cm',
      explanation: `Ausgangswasser: ${ausgangsEC} mS/cm → Ziel: ${zielEC} mS/cm.`,
    },
    {
      label: 'Korrekturfaktoren',
      value: round(phaseFactor * substratFactor, 2),
      formatted: `Phase: ×${phaseFactor}  ·  Substrat: ×${substratFactor}`,
    },
    {
      label: 'Substrat-Tipp',
      value: 0,
      formatted: substratTipp(substrat),
    },
  ];

  return { ecDifferenz, dosierungProLiter, gesamtDosierung, results };
}
