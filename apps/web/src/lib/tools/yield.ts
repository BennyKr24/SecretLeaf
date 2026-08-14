import type { ToolResultData, ResultLevel, Substrat } from './types';
import type { TerpiraDifficulty } from '@/lib/terpira/types';
import { round } from './units';

// ── Yield estimation ───────────────────────────────────────────────────────
// Rough estimation based on g/Watt (indoor) or g/plant (outdoor).
// Correction factors for genetics, substrate, nutrients, density.

export type YieldInputs = {
  flaeche: number;          // m²
  anbauMethode: 'indoor' | 'outdoor';
  erfahrung: TerpiraDifficulty;
  genetik: 'autoflower' | 'feminisiert' | 'regular';
  lichtLeistung: number;    // W (indoor only)
  pflanzenAnzahl: number;
  substrat: Substrat;
  duengerIntensitaet: 'niedrig' | 'mittel' | 'hoch';
};

export type YieldOutput = {
  gesamtErtrag: number;
  ertragProPflanze: number;
  ertragProQm: number;
  results: ToolResultData[];
};

// g/Watt by experience level (indoor)
const GPW: Record<TerpiraDifficulty, number> = {
  einsteiger: 0.5,
  fortgeschritten: 0.75,
  profi: 1.1,
};

// g/plant outdoor by experience level
const GPP_OUTDOOR: Record<TerpiraDifficulty, number> = {
  einsteiger: 200,
  fortgeschritten: 400,
  profi: 600,
};

const GENETIK_FAKTOR: Record<YieldInputs['genetik'], number> = {
  autoflower: 0.7,
  feminisiert: 1.0,
  regular: 0.85,
};

const SUBSTRAT_FAKTOR: Record<Substrat, number> = {
  erde: 0.9,
  coco: 1.05,
  hydro: 1.15,
};

const DUENGER_FAKTOR: Record<YieldInputs['duengerIntensitaet'], number> = {
  niedrig: 0.8,
  mittel: 1.0,
  hoch: 1.1,
};

function densityFactor(pflanzen: number, flaeche: number): number {
  const density = pflanzen / Math.max(0.25, flaeche);
  // Optimal: 4-9 plants/m², diminishing returns above 16
  if (density <= 9) return 1.0;
  if (density <= 16) return 0.95;
  return 0.85;
}

function yieldLevel(ertragProQm: number, methode: 'indoor' | 'outdoor'): ResultLevel {
  if (methode === 'indoor') {
    if (ertragProQm >= 400) return 'gruen';
    if (ertragProQm >= 200) return 'gelb';
    return 'rot';
  }
  if (ertragProQm >= 300) return 'gruen';
  if (ertragProQm >= 150) return 'gelb';
  return 'rot';
}

export function calculateYield(inputs: YieldInputs): YieldOutput {
  const { flaeche, anbauMethode, erfahrung, genetik, lichtLeistung, pflanzenAnzahl, substrat, duengerIntensitaet } = inputs;

  const genFaktor = GENETIK_FAKTOR[genetik];
  const subFaktor = SUBSTRAT_FAKTOR[substrat];
  const dunFaktor = DUENGER_FAKTOR[duengerIntensitaet];
  const denFaktor = densityFactor(pflanzenAnzahl, flaeche);

  let basisErtrag: number;
  if (anbauMethode === 'indoor') {
    basisErtrag = lichtLeistung * GPW[erfahrung];
  } else {
    basisErtrag = pflanzenAnzahl * GPP_OUTDOOR[erfahrung];
  }

  const gesamtErtrag = round(basisErtrag * genFaktor * subFaktor * dunFaktor * denFaktor, 0);
  const ertragProPflanze = round(gesamtErtrag / Math.max(1, pflanzenAnzahl), 0);
  const ertragProQm = round(gesamtErtrag / Math.max(0.25, flaeche), 0);

  const level = yieldLevel(ertragProQm, anbauMethode);

  const erfahrungLabel = erfahrung === 'einsteiger' ? 'Einsteiger' : erfahrung === 'fortgeschritten' ? 'Fortgeschritten' : 'Profi';

  const results: ToolResultData[] = [
    {
      label: 'Geschätzter Gesamtertrag',
      value: gesamtErtrag,
      formatted: `${gesamtErtrag}`,
      unit: 'g',
      level,
      explanation: 'Reale Erträge variieren ±30 %. Diese Schätzung ist ein Orientierungswert.',
    },
    {
      label: 'Pro Pflanze',
      value: ertragProPflanze,
      formatted: `${ertragProPflanze}`,
      unit: 'g/Pflanze',
    },
    {
      label: 'Pro Quadratmeter',
      value: ertragProQm,
      formatted: `${ertragProQm}`,
      unit: 'g/m²',
    },
    {
      label: 'Basiskalkulation',
      value: round(basisErtrag, 0),
      formatted: anbauMethode === 'indoor'
        ? `${lichtLeistung}W × ${GPW[erfahrung]} g/W (${erfahrungLabel})`
        : `${pflanzenAnzahl} Pflanzen × ${GPP_OUTDOOR[erfahrung]} g (${erfahrungLabel})`,
    },
    {
      label: 'Korrekturfaktoren',
      value: round(genFaktor * subFaktor * dunFaktor * denFaktor, 2),
      formatted: `Genetik: ×${genFaktor}  ·  Substrat: ×${subFaktor}  ·  Dünger: ×${dunFaktor}  ·  Dichte: ×${round(denFaktor, 2)}`,
    },
  ];

  return { gesamtErtrag, ertragProPflanze, ertragProQm, results };
}
