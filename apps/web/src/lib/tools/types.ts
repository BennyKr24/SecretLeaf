import type { TerpiraDifficulty } from "@/lib/terpira/types";
import { Thermometer, Lightbulb, FlaskConical, Ruler, type LucideIcon } from "lucide-react";

// ── Tool Categories ─────────────────────────────────────────────────────────

export type ToolCategory = "klima" | "licht" | "naehrstoffe" | "planung";

export const toolCategoryLabel: Record<ToolCategory, string> = {
  klima: "Klima",
  licht: "Licht",
  naehrstoffe: "Nährstoffe",
  planung: "Planung",
};

export const toolCategoryIcon: Record<ToolCategory, LucideIcon> = {
  klima: Thermometer,
  licht: Lightbulb,
  naehrstoffe: FlaskConical,
  planung: Ruler,
};

export const toolCategoryColor: Record<ToolCategory, string> = {
  klima: "border-cyan-200 bg-cyan-50 text-cyan-700",
  licht: "border-amber-200 bg-amber-50 text-amber-700",
  naehrstoffe: "border-emerald-200 bg-emerald-50 text-emerald-700",
  planung: "border-violet-200 bg-violet-50 text-violet-700",
};

export const toolCategoryAccent: Record<ToolCategory, string> = {
  klima: "text-cyan-700",
  licht: "text-amber-700",
  naehrstoffe: "text-emerald-700",
  planung: "text-violet-700",
};

export const toolCategoryHover: Record<ToolCategory, string> = {
  klima: "hover:border-cyan-300 hover:bg-cyan-50",
  licht: "hover:border-amber-300 hover:bg-amber-50",
  naehrstoffe: "hover:border-emerald-300 hover:bg-emerald-50",
  planung: "hover:border-violet-300 hover:bg-violet-50",
};

// ── Tool Metadata ───────────────────────────────────────────────────────────

export type ToolMeta = {
  slug: string;
  title: string;
  shortDescription: string;
  category: ToolCategory;
  icon: LucideIcon;
  difficulty: TerpiraDifficulty;
  relatedArticleSlugs: string[];
  relatedToolSlugs: string[];
  coverageKey: CoverageKey;
};

// ── Tool Results ────────────────────────────────────────────────────────────

/**
 * Minimal translator signature the pure calc functions accept so their
 * `explanation` / ampel strings come from the `toolResult` message namespace
 * instead of being hardcoded German. Pass `useTranslations("toolResult")`
 * from the (client) tool page. Structurally compatible with next-intl's `t`.
 */
export type ToolT = (key: string, values?: Record<string, string | number>) => string;

export type ResultLevel = "gruen" | "gelb" | "rot";

export const resultLevelClass: Record<ResultLevel, string> = {
  gruen: "border-emerald-200 bg-emerald-50 text-emerald-700",
  gelb: "border-amber-200 bg-amber-50 text-amber-700",
  rot: "border-rose-200 bg-rose-50 text-rose-700",
};

export const resultLevelLabel: Record<ResultLevel, string> = {
  gruen: "Optimal",
  gelb: "Grenzwertig",
  rot: "Kritisch",
};

export type ToolResultData = {
  label: string;
  value: number;
  formatted: string;
  unit?: string;
  level?: ResultLevel;
  explanation?: string;
};

// ── Grow Setup (shared across tools) ────────────────────────────────────────

export type Substrat = "erde" | "coco" | "hydro";

export const substratLabel: Record<Substrat, string> = {
  erde: "Erde",
  coco: "Coco",
  hydro: "Hydro",
};

export type GrowSetup = {
  raumLaenge: number;
  raumBreite: number;
  raumHoehe: number;
  substrat: Substrat;
  lampenLeistung: number;
  anbauMethode: "indoor" | "outdoor";
  erfahrung: TerpiraDifficulty;
};

// ── Coverage / Grow-Check ───────────────────────────────────────────────────

export type CoverageKey = "klima" | "licht" | "naehrstoffe" | "ertrag";

export type SetupCoverage = Record<CoverageKey, boolean>;

// ── Storage types ───────────────────────────────────────────────────────────

export type ToolSnapshot = {
  slug: string;
  inputs: Record<string, number | string | boolean>;
  results: ToolResultData[];
  savedAt: string;
};

export type ToolStorageData = {
  history: ToolSnapshot[];
  setupProfile: Partial<GrowSetup>;
};
