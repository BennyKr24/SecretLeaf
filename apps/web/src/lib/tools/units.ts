// ── Unit conversion utilities ────────────────────────────────────────────────
// Pure functions, no state, no React.

export function mToFt(m: number): number {
  return m * 3.28084;
}

export function ftToM(ft: number): number {
  return ft / 3.28084;
}

export function sqmToSqft(sqm: number): number {
  return sqm * 10.7639;
}

export function sqftToSqm(sqft: number): number {
  return sqft / 10.7639;
}

export function cubicMToFt(m3: number): number {
  return m3 * 35.3147;
}

export function celsiusToF(c: number): number {
  return c * 1.8 + 32;
}

export function fToCelsius(f: number): number {
  return (f - 32) / 1.8;
}

export function literToGallon(l: number): number {
  return l * 0.264172;
}

export function gallonToLiter(gal: number): number {
  return gal / 0.264172;
}

export function wattToBtu(w: number): number {
  return w * 3.41214;
}

/** Round to n decimal places */
export function round(value: number, decimals: number = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Format number with German locale */
export function fmt(value: number, decimals: number = 0): string {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Clamp value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
