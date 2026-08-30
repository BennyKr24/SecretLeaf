import type { ToolResultData, ResultLevel, Substrat, ToolT } from './types';
import type { TerpiraDifficulty } from '@/lib/terpira/types';
import { round } from './units';

// ── Yield estimation ───────────────────────────────────────────────────────
// Rough estimation based on g/Watt (indoor) or g/Topfvolumen (outdoor).
// Correction factors for genetics, substrate, nutrients, density.

export type VegDauer = 'kurz' | 'standard' | 'verlaengert';

export type YieldInputs = {
  flaeche: number;          // m²
  anbauMethode: 'indoor' | 'outdoor';
  erfahrung: TerpiraDifficulty;
  genetik: 'autoflower' | 'feminisiert' | 'regular';
  lichtLeistung: number;    // W (indoor only)
  topfgroesseLiter: number; // L (outdoor only)
  vegDauer: VegDauer;       // outdoor only
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

// g Trockenertrag pro Liter Topfvolumen (outdoor). Ersetzt 2026-08-21 den
// alten, an das Erfahrungslevel gekoppelten GPP_OUTDOOR — Topfgröße/
// Wurzelraum ist laut Recherche der dominante Einzelfaktor für Outdoor-
// Ertrag, nicht die Erfahrung des Growers. Kalibriert an der Faustregel
// "~1 oz (28g) Trockenertrag pro Gallone Topfvolumen" (~3,785 L/Gallone →
// ~3,7 g/L), Quellen streuen zwischen 56g und 3.600g/Pflanze insgesamt, das
// hier ist ein Mittelwert, kein Extremwert.
const GPP_OUTDOOR_PRO_LITER = 3.7;

// Oberhalb sehr großer Topfgrößen (>80L, außerhalb der recherchierten
// Spanne) wird zusätzliches Volumen nur noch zur Hälfte angerechnet — Licht/
// Blattfläche werden hier eher zum limitierenden Faktor als der Wurzelraum.
function effectiveTopfLiter(liter: number): number {
  const l = Math.max(1, liter);
  return l <= 80 ? l : 80 + (l - 80) * 0.5;
}

// Vegetationsdauer vor der Blüte bestimmt die Pflanzengröße bei
// Blühbeginn — zweitwichtigster Outdoor-Ertragsfaktor nach der Topfgröße.
const VEGDAUER_FAKTOR: Record<VegDauer, number> = {
  kurz: 0.7,        // < 4 Wochen
  standard: 1.0,     // 4–8 Wochen
  verlaengert: 1.3,  // > 8 Wochen
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
    // Schwellen 2026-08-21 angehoben (waren 400/200): aktuelle LED-Benchmarks
    // setzen "solide" bei ≥500 g/m², "sehr gut" bei 600-800 g/m² — 400 war
    // nach heutigem Stand nur noch Mittelklasse, nicht "gut".
    if (ertragProQm >= 500) return 'gruen';
    if (ertragProQm >= 300) return 'gelb';
    return 'rot';
  }
  if (ertragProQm >= 300) return 'gruen';
  if (ertragProQm >= 150) return 'gelb';
  return 'rot';
}

export function calculateYield(inputs: YieldInputs, t: ToolT): YieldOutput {
  const { flaeche, anbauMethode, erfahrung, genetik, lichtLeistung, topfgroesseLiter, vegDauer, pflanzenAnzahl, substrat, duengerIntensitaet } = inputs;

  const genFaktor = GENETIK_FAKTOR[genetik];
  const subFaktor = SUBSTRAT_FAKTOR[substrat];
  const dunFaktor = DUENGER_FAKTOR[duengerIntensitaet];
  const denFaktor = densityFactor(pflanzenAnzahl, flaeche);
  const vegFaktor = anbauMethode === 'outdoor' ? VEGDAUER_FAKTOR[vegDauer] : 1;

  let basisErtrag: number;
  if (anbauMethode === 'indoor') {
    basisErtrag = lichtLeistung * GPW[erfahrung];
  } else {
    basisErtrag = pflanzenAnzahl * effectiveTopfLiter(topfgroesseLiter) * GPP_OUTDOOR_PRO_LITER * vegFaktor;
  }

  const gesamtErtrag = round(basisErtrag * genFaktor * subFaktor * dunFaktor * denFaktor, 0);
  const ertragProPflanze = round(gesamtErtrag / Math.max(1, pflanzenAnzahl), 0);
  const ertragProQm = round(gesamtErtrag / Math.max(0.25, flaeche), 0);

  const level = yieldLevel(ertragProQm, anbauMethode);

  const erfahrungLabel = erfahrung === 'einsteiger' ? 'Einsteiger' : erfahrung === 'fortgeschritten' ? 'Fortgeschritten' : 'Profi';
  const vegDauerLabel = vegDauer === 'kurz' ? 'kurz' : vegDauer === 'verlaengert' ? 'verlängert' : 'standard';

  const results: ToolResultData[] = [
    {
      label: 'Geschätzter Gesamtertrag',
      value: gesamtErtrag,
      formatted: `${gesamtErtrag}`,
      unit: 'g',
      level,
      explanation: t('yield.explTotal'),
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
        : `${pflanzenAnzahl} Pflanzen × ${topfgroesseLiter}L × ${GPP_OUTDOOR_PRO_LITER} g/L × Vegdauer ${vegDauerLabel} (×${VEGDAUER_FAKTOR[vegDauer]})`,
    },
    {
      label: 'Korrekturfaktoren',
      value: round(genFaktor * subFaktor * dunFaktor * denFaktor, 2),
      formatted: `Genetik: ×${genFaktor}  ·  Substrat: ×${subFaktor}  ·  Dünger: ×${dunFaktor}  ·  Dichte: ×${round(denFaktor, 2)}`,
    },
  ];

  return { gesamtErtrag, ertragProPflanze, ertragProQm, results };
}
