export type RiskLevel = "niedrig" | "mittel" | "hoch" | "kritisch";
export type GrowArea = "indoor" | "outdoor" | "beides";
export type PlantStage = "keimling" | "veg" | "bluete" | "alle";

export const riskLabel: Record<RiskLevel, string> = {
  niedrig: "Niedrig",
  mittel: "Mittel",
  hoch: "Hoch",
  kritisch: "Kritisch"
};

export const areaLabel: Record<GrowArea, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  beides: "Indoor + Outdoor"
};

export const stageLabel: Record<PlantStage, string> = {
  keimling: "Keimling",
  veg: "Veg",
  bluete: "Bluete",
  alle: "Alle Stadien"
};

export const riskClass: Record<RiskLevel, string> = {
  niedrig: "border-emerald-200 bg-emerald-50 text-emerald-700",
  mittel: "border-cyan-200 bg-cyan-50 text-cyan-700",
  hoch: "border-amber-200 bg-amber-50 text-amber-700",
  kritisch: "border-rose-200 bg-rose-50 text-rose-700"
};