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
  bluete: "Blüte",
  alle: "Alle Stadien"
};

export const riskClass: Record<RiskLevel, string> = {
  niedrig: "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
  mittel: "border-cyan-200 dark:border-cyan-900/40 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400",
  hoch: "border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
  kritisch: "border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400"
};