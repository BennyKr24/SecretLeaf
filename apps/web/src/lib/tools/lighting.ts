import type { ToolResultData, ResultLevel } from './types';
import { round } from './units';

// ── PPFD & DLI calculation ─────────────────────────────────────────────────
// PPF (µmol/s) = Watt × Efficacy (µmol/J)
// PPFD = PPF / Area × Height correction
// DLI = PPFD × 3600 × Photoperiod / 1,000,000

export type LightingInputs = {
  lampenLeistung: number;   // W
  effizienz: number;        // µmol/J (1.0 – 3.5)
  reflektorVerlust: number; // % (0 – 40)
  aufhaengHoehe: number;    // cm (15 – 150)
  flaeche: number;          // m²
  photoperiode: number;     // h/Tag (12 – 24)
  phase: 'veg' | 'bluete';
};

export type LightingOutput = {
  ppf: number;
  nutzbarePPF: number;
  ppfd: number;
  dli: number;
  results: ToolResultData[];
};

// Simple height correction factor (inverse-square approximation for panel LEDs)
function heightFactor(heightCm: number): number {
  // Coefficient 1.0 (was 0.6, which the comment here never actually matched —
  // the old formula gave 0.82/0.63 at 60/100cm against a claimed 0.78/0.55).
  // Recalibrated 2026-08-21 against published PPFD-vs-height charts for large
  // LED panels (e.g. HLG600 Rspec), which show closer to 30-45% of near-field
  // intensity remaining at 90-100cm — the old formula was too optimistic.
  // At this coefficient: 30cm≈0.92, 60cm≈0.74, 100cm≈0.50.
  const h = heightCm / 100;
  return Math.max(0.2, 1.0 / (1 + 1.0 * h * h));
}

function ppfdLevel(ppfd: number, phase: 'veg' | 'bluete'): ResultLevel {
  if (phase === 'veg') {
    if (ppfd >= 400 && ppfd <= 600) return 'gruen';
    if (ppfd >= 250 && ppfd < 400) return 'gelb';
    if (ppfd > 600 && ppfd <= 800) return 'gelb';
    return 'rot';
  }
  // Blüte
  if (ppfd >= 600 && ppfd <= 1000) return 'gruen';
  if (ppfd >= 400 && ppfd < 600) return 'gelb';
  if (ppfd > 1000 && ppfd <= 1300) return 'gelb';
  return 'rot';
}

function ppfdExplanation(ppfd: number, phase: 'veg' | 'bluete'): string {
  const ziel = phase === 'veg' ? '400–600 µmol/m²/s' : '600–1.000 µmol/m²/s';
  if (ppfd < (phase === 'veg' ? 250 : 400)) {
    return `Deutlich unter dem Zielbereich (${ziel}). Lampe näher positionieren oder stärkeres Modell einsetzen.`;
  }
  if (ppfd > (phase === 'veg' ? 800 : 1300)) {
    return `Über dem empfohlenen Bereich (${ziel}). Lichtstress wahrscheinlich — Abstand erhöhen oder dimmen.`;
  }
  return `Im empfohlenen Bereich für ${phase === 'veg' ? 'vegetative Phase' : 'Blütephase'} (${ziel}).`;
}

// DLI-Zielbereiche (mol/m²/Tag) nach Phase — Resource Innovation Institute u. a.
function dliLevel(dli: number, phase: 'veg' | 'bluete'): ResultLevel {
  if (phase === 'veg') {
    if (dli >= 20 && dli <= 40) return 'gruen';
    if (dli >= 15 && dli < 20) return 'gelb';
    if (dli > 40 && dli <= 50) return 'gelb';
    return 'rot';
  }
  // Blüte
  if (dli >= 25 && dli <= 50) return 'gruen';
  if (dli >= 20 && dli < 25) return 'gelb';
  if (dli > 50 && dli <= 60) return 'gelb';
  return 'rot';
}

export function calculateLighting(inputs: LightingInputs): LightingOutput {
  const { lampenLeistung, effizienz, reflektorVerlust, aufhaengHoehe, flaeche, photoperiode, phase } = inputs;

  const ppf = round(lampenLeistung * effizienz, 1);
  const nutzbarePPF = round(ppf * (1 - reflektorVerlust / 100), 1);
  const hFactor = heightFactor(aufhaengHoehe);
  const ppfd = round((nutzbarePPF / Math.max(0.25, flaeche)) * hFactor, 0);
  const dli = round((ppfd * 3600 * photoperiode) / 1_000_000, 1);

  const level = ppfdLevel(ppfd, phase);

  const results: ToolResultData[] = [
    {
      label: 'PPFD (geschätzt)',
      value: ppfd,
      formatted: `${ppfd}`,
      unit: 'µmol/m²/s',
      level,
      explanation: ppfdExplanation(ppfd, phase),
    },
    {
      label: 'Tageslichtintegral (DLI)',
      value: dli,
      formatted: `${dli}`,
      unit: 'mol/m²/d',
      level: dliLevel(dli, phase),
      explanation: dli < 20 ? 'Niedrig — eher für Keimlinge/Klone geeignet.' : dli > 55 ? 'Sehr hoch — CO2-Supplementierung empfohlen.' : 'Guter Bereich für aktives Wachstum.',
    },
    {
      label: 'Gesamt-PPF',
      value: ppf,
      formatted: `${ppf}`,
      unit: 'µmol/s',
      explanation: `Bei ${effizienz} µmol/J Effizienz.`,
    },
    {
      label: 'Nutzbare PPF',
      value: nutzbarePPF,
      formatted: `${nutzbarePPF}`,
      unit: 'µmol/s',
      explanation: `Nach ${reflektorVerlust}% Reflektorverlust.`,
    },
    {
      label: 'Höhenkorrekturfaktor',
      value: round(hFactor, 2),
      formatted: `${round(hFactor * 100, 0)}%`,
      explanation: `Bei ${aufhaengHoehe} cm Aufhänghöhe erreichen ca. ${round(hFactor * 100, 0)}% des Lichts die Pflanzenfläche.`,
    },
  ];

  return { ppf, nutzbarePPF, ppfd, dli, results };
}
