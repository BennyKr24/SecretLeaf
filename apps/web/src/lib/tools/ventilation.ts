import type { ToolResultData, ResultLevel, ToolT } from './types';
import { round } from './units';

// ── Ventilation calculation ────────────────────────────────────────────────
// Based on standard indoor cultivation requirements:
// - Base air exchange: 60× room volume per hour (cannabis-specific high rate)
// - Thermal load: Watts → BTU → m³/h conversion for heat dissipation
// - AKF (activated carbon filter) adds ~25% resistance
// - Safety margin: +15% recommended

export type VentilationInputs = {
  raumLaenge: number;   // m
  raumBreite: number;   // m
  raumHoehe: number;    // m
  lichtLeistung: number; // W
  akfAktiv: boolean;
  umgebungsTemp: number; // °C
  zielTemp: number;      // °C
};

export type VentilationOutput = {
  raumVolumen: number;
  basisAustausch: number;
  waermeLast: number;
  akfAufschlag: number;
  empfohlenerVolumenstrom: number;
  empfohlenerRohrDurchmesser: number;
  results: ToolResultData[];
};

// maxFlow kalibriert an realen Rohrlüfter-Datenblättern (Systemair RVK-Serie,
// Standard- bis Hochleistungsvariante) statt an theoretischer Rohr-Kapazität
// bei hoher Luftgeschwindigkeit — die alten Werte lagen bei 250mm z. B. 59%
// über dem stärksten real erhältlichen Consumer-Lüfter dieser Größe und
// hätten bei hohem Bedarf ein zu kleines Rohr empfohlen. Recherche 2026-08-21.
const ROHR_KLASSEN = [
  { durchmesser: 100, maxFlow: 175 },
  { durchmesser: 125, maxFlow: 280 },
  { durchmesser: 150, maxFlow: 420 },
  { durchmesser: 160, maxFlow: 490 },
  { durchmesser: 200, maxFlow: 770 },
  { durchmesser: 250, maxFlow: 1150 },
];

function getLevel(empfohlen: number): ResultLevel {
  // If thermal load is much higher than base, it's tight
  if (empfohlen > 1200) return 'rot';
  if (empfohlen > 800) return 'gelb';
  return 'gruen';
}

export function calculateVentilation(inputs: VentilationInputs, t: ToolT): VentilationOutput {
  const { raumLaenge, raumBreite, raumHoehe, lichtLeistung, akfAktiv, umgebungsTemp, zielTemp } = inputs;

  const raumVolumen = round(raumLaenge * raumBreite * raumHoehe, 2);

  // Base air exchange: 60× per hour for cannabis indoor
  const basisAustausch = round(raumVolumen * 60, 0);

  // Thermal load: each watt adds ~3.41 BTU/h
  // Approximate m³/h needed to dissipate: BTU / (1.08 × ΔT in °F)
  const deltaT = Math.max(1, umgebungsTemp - zielTemp + 3); // +3°C for light heat rise
  const btuPerHour = lichtLeistung * 3.41;
  const cfmNeeded = btuPerHour / (1.08 * (deltaT * 1.8));
  const waermeLast = round(cfmNeeded * 1.699, 0); // CFM → m³/h

  const rawFlow = Math.max(basisAustausch, waermeLast);

  // AKF adds resistance → need ~25% more airflow
  const akfFaktor = akfAktiv ? 1.25 : 1.0;
  const sicherheitsFaktor = 1.15;

  const empfohlenerVolumenstrom = round(rawFlow * akfFaktor * sicherheitsFaktor, 0);
  const akfAufschlag = round(rawFlow * (akfFaktor - 1.0), 0);

  // Recommended duct diameter
  const rohr = ROHR_KLASSEN.find((r) => r.maxFlow >= empfohlenerVolumenstrom) ?? ROHR_KLASSEN[ROHR_KLASSEN.length - 1]!;

  const level = getLevel(empfohlenerVolumenstrom);

  const results: ToolResultData[] = [
    {
      label: 'Empfohlener Volumenstrom',
      value: empfohlenerVolumenstrom,
      formatted: `${empfohlenerVolumenstrom}`,
      unit: 'm³/h',
      level,
      explanation: level === 'gruen'
        ? t('ventilation.explVolGruen')
        : level === 'gelb'
        ? t('ventilation.explVolGelb')
        : t('ventilation.explVolRot'),
    },
    {
      label: 'Raumvolumen',
      value: raumVolumen,
      formatted: `${raumVolumen}`,
      unit: 'm³',
    },
    {
      label: 'Basisaustausch (60×/h)',
      value: basisAustausch,
      formatted: `${basisAustausch}`,
      unit: 'm³/h',
    },
    {
      label: 'Wärmelast (Licht)',
      value: waermeLast,
      formatted: `${waermeLast}`,
      unit: 'm³/h',
      explanation: t('ventilation.explHeatLoad', { watts: lichtLeistung, btu: round(btuPerHour, 0) }),
    },
    {
      label: 'AKF-Korrektur',
      value: akfAufschlag,
      formatted: akfAktiv ? `+${akfAufschlag}` : '0',
      unit: 'm³/h',
      explanation: akfAktiv ? t('ventilation.explAkfOn') : t('ventilation.explAkfOff'),
    },
    {
      label: 'Empfohlener Rohrdurchmesser',
      value: rohr.durchmesser,
      formatted: `${rohr.durchmesser}`,
      unit: 'mm',
      explanation: t('ventilation.explDuct', { flow: rohr.maxFlow }),
    },
  ];

  return {
    raumVolumen,
    basisAustausch,
    waermeLast,
    akfAufschlag,
    empfohlenerVolumenstrom,
    empfohlenerRohrDurchmesser: rohr.durchmesser,
    results,
  };
}
