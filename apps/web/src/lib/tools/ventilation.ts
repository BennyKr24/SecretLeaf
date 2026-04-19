import type { ToolResultData, ResultLevel } from './types';
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

const ROHR_KLASSEN = [
  { durchmesser: 100, maxFlow: 250 },
  { durchmesser: 125, maxFlow: 400 },
  { durchmesser: 150, maxFlow: 600 },
  { durchmesser: 160, maxFlow: 700 },
  { durchmesser: 200, maxFlow: 1100 },
  { durchmesser: 250, maxFlow: 1800 },
];

function getLevel(empfohlen: number, waerme: number): ResultLevel {
  // If thermal load is much higher than base, it's tight
  if (empfohlen > 1200) return 'rot';
  if (empfohlen > 800) return 'gelb';
  return 'gruen';
}

function getTempLevel(umgebung: number, ziel: number): ResultLevel {
  if (umgebung <= ziel) return 'gruen';
  if (umgebung - ziel <= 5) return 'gelb';
  return 'rot';
}

export function calculateVentilation(inputs: VentilationInputs): VentilationOutput {
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

  const level = getLevel(empfohlenerVolumenstrom, waermeLast);
  const tempLevel = getTempLevel(umgebungsTemp, zielTemp);

  const results: ToolResultData[] = [
    {
      label: 'Empfohlener Volumenstrom',
      value: empfohlenerVolumenstrom,
      formatted: `${empfohlenerVolumenstrom}`,
      unit: 'm³/h',
      level,
      explanation: level === 'gruen'
        ? 'Ausreichend dimensioniert für dein Setup.'
        : level === 'gelb'
        ? 'Knapp bemessen — eine Stufe größer wählen empfohlen.'
        : 'Hoher Bedarf — leistungsstarken Lüfter mit Drehzahlregler einsetzen.',
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
      explanation: `${lichtLeistung}W erzeugen ca. ${round(btuPerHour, 0)} BTU/h Wärmeeintrag.`,
    },
    {
      label: 'AKF-Korrektur',
      value: akfAufschlag,
      formatted: akfAktiv ? `+${akfAufschlag}` : '0',
      unit: 'm³/h',
      explanation: akfAktiv ? '+25 % Aufschlag für Aktivkohlefilter-Widerstand.' : 'Kein AKF aktiv.',
    },
    {
      label: 'Empfohlener Rohrdurchmesser',
      value: rohr.durchmesser,
      formatted: `${rohr.durchmesser}`,
      unit: 'mm',
      explanation: `Passend für bis zu ${rohr.maxFlow} m³/h.`,
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
