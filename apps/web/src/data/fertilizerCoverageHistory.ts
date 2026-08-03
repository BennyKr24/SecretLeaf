export type CoverageSnapshot = {
  date: string;
  coverage: number;
  coveredProducts: number;
  marketEstimate: number;
  note: string;
};

// Modellbasierte Verlaufspunkte für transparente Produktkommunikation.
export const fertilizerCoverageHistory: CoverageSnapshot[] = [
  {
    date: "2026-03-22",
    coverage: 3.1,
    coveredProducts: 13,
    marketEstimate: 420,
    note: "Projektstart mit initialem Kernkatalog"
  },
  {
    date: "2026-03-24",
    coverage: 14.8,
    coveredProducts: 62,
    marketEstimate: 420,
    note: "Erweiterung auf erste bekannte Markenlinien"
  },
  {
    date: "2026-03-25",
    coverage: 47.1,
    coveredProducts: 198,
    marketEstimate: 420,
    note: "Skalierung auf Variantenkatalog"
  },
  {
    date: "2026-03-26T18:00:00.000Z",
    coverage: 71,
    coveredProducts: 298,
    marketEstimate: 420,
    note: "Größeres Marktmodell integriert"
  },
  {
    date: "2026-03-26T22:45:00.000Z",
    coverage: 82.4,
    coveredProducts: 346,
    marketEstimate: 420,
    note: "80%-Ziel überschritten"
  }
];
