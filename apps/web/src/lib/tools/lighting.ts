import type { ToolResultData, ResultLevel, ToolT } from './types';
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

// Blüte-Schwellen recherchiert/neu kalibriert 2026-08-27 (Konsens 2023–2026,
// growithjane, Thrive Agritech, WeedInsight u. a.): OHNE CO2-Anreicherung
// liegt der nutzbare Bereich bei 600–900 µmol/m²/s, das Optimum bei 700–900;
// oberhalb ~900–1000 ohne CO2 Lichtsättigung/Bleaching, deutlich >1000 sinkt
// die Photosyntheserate. Der Rechner hat keinen CO2-Input → ohne CO2 ist die
// richtige Default-Annahme. (Vorher war der grüne Bereich 600–1000, was den
// CO2-losen Fall zu optimistisch bewertete.)
function ppfdLevel(ppfd: number, phase: 'veg' | 'bluete'): ResultLevel {
  if (phase === 'veg') {
    if (ppfd >= 400 && ppfd <= 600) return 'gruen';
    if (ppfd >= 250 && ppfd < 400) return 'gelb';
    if (ppfd > 600 && ppfd <= 800) return 'gelb';
    return 'rot';
  }
  // Blüte (ohne CO2)
  if (ppfd >= 700 && ppfd <= 900) return 'gruen';
  if (ppfd >= 550 && ppfd < 700) return 'gelb';
  if (ppfd > 900 && ppfd <= 1050) return 'gelb';
  return 'rot';
}

function ppfdExplanation(ppfd: number, phase: 'veg' | 'bluete', t: ToolT): string {
  const target = phase === 'veg' ? '400–600 µmol/m²/s' : '700–900 µmol/m²/s';
  if (ppfd < (phase === 'veg' ? 250 : 550)) {
    return t('lighting.explPpfdLow', { target });
  }
  if (ppfd > (phase === 'veg' ? 800 : 1050)) {
    return t('lighting.explPpfdHigh', { target });
  }
  return t('lighting.explPpfdOk', {
    phase: phase === 'veg' ? t('lighting.phaseVeg') : t('lighting.phaseBluete'),
    target,
  });
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

export function calculateLighting(inputs: LightingInputs, t: ToolT): LightingOutput {
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
      explanation: ppfdExplanation(ppfd, phase, t),
    },
    {
      label: 'Tageslichtintegral (DLI)',
      value: dli,
      formatted: `${dli}`,
      unit: 'mol/m²/d',
      level: dliLevel(dli, phase),
      explanation: dli < 20 ? t('lighting.explDliLow') : dli > 55 ? t('lighting.explDliHigh') : t('lighting.explDliOk'),
    },
    {
      label: 'Gesamt-PPF',
      value: ppf,
      formatted: `${ppf}`,
      unit: 'µmol/s',
      explanation: t('lighting.explTotalPpf', { eff: effizienz }),
    },
    {
      label: 'Nutzbare PPF',
      value: nutzbarePPF,
      formatted: `${nutzbarePPF}`,
      unit: 'µmol/s',
      explanation: t('lighting.explUsablePpf', { loss: reflektorVerlust }),
    },
    {
      label: 'Höhenkorrekturfaktor',
      value: round(hFactor, 2),
      formatted: `${round(hFactor * 100, 0)}%`,
      explanation: t('lighting.explHeightFactor', {
        height: aufhaengHoehe,
        pct: round(hFactor * 100, 0),
      }),
    },
  ];

  return { ppf, nutzbarePPF, ppfd, dli, results };
}
