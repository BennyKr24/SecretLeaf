// ────────────────────────────────────────────────────────────────────────────
// Grow OS — Core Type Definitions
// All domain types for the Grow System. No external dependencies.
// ────────────────────────────────────────────────────────────────────────────

// ── Grow Environment ─────────────────────────────────────────────────────────

export type GrowUmgebung = "indoor" | "outdoor" | "greenhouse";

export const GROW_UMGEBUNG_LABELS: Record<GrowUmgebung, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  greenhouse: "Gewächshaus",
};

// ── Grow Medium ───────────────────────────────────────────────────────────────

export type GrowMedium = "erde" | "coco" | "hydro";

export const GROW_MEDIUM_LABELS: Record<GrowMedium, string> = {
  erde: "Erde",
  coco: "Coco",
  hydro: "Hydro",
};

// ── Experience Level ──────────────────────────────────────────────────────────

export type Erfahrung = "einsteiger" | "fortgeschritten" | "profi";

export const ERFAHRUNG_LABELS: Record<Erfahrung, string> = {
  einsteiger: "Einsteiger",
  fortgeschritten: "Fortgeschritten",
  profi: "Profi",
};

// ── Light Type ────────────────────────────────────────────────────────────────

export type LichtTyp = "led" | "hps" | "cmh" | "cfl" | "sonne";

export const LICHT_TYP_LABELS: Record<LichtTyp, string> = {
  led: "LED",
  hps: "HPS / HID",
  cmh: "CMH / LEC",
  cfl: "CFL / T5",
  sonne: "Sonne (Outdoor)",
};

// ── Grow Phase ────────────────────────────────────────────────────────────────

/** ASCII-safe phase identifiers (avoids URL/key encoding issues). */
export type GrowPhaseId =
  | "keimung"
  | "saemling"
  | "veg"
  | "bluete"
  | "spaetbluete"
  | "ernte";

// ── Task Category ─────────────────────────────────────────────────────────────

export type TaskCategory =
  | "bewaesserung"
  | "duengung"
  | "training"
  | "kontrolle"
  | "ernte"
  | "allgemein";

export const TASK_CATEGORY_ICONS: Record<TaskCategory, string> = {
  bewaesserung: "💧",
  duengung: "🧪",
  training: "✂️",
  kontrolle: "🔍",
  ernte: "🌿",
  allgemein: "📋",
};

// ── Grow Task ─────────────────────────────────────────────────────────────────

export type GrowTask = {
  id: string;
  phaseId: GrowPhaseId;
  title: string;
  description?: string;
  /** Absolute grow day (1-indexed) when this task is due. */
  dueDay: number;
  completed: boolean;
  /** ISO string — set when task is marked complete. */
  completedAt?: string;
  category: TaskCategory;
};

// ── Grow Phase (plan entry) ───────────────────────────────────────────────────

export type GrowPhase = {
  id: GrowPhaseId;
  label: string;
  description: string;
  /** Absolute grow day this phase begins (1-indexed). */
  startDay: number;
  /** Absolute grow day this phase ends (inclusive). */
  endDay: number;
  tasks: GrowTask[];
};

// ── Grow Plan ─────────────────────────────────────────────────────────────────

export type GrowPlan = {
  phases: GrowPhase[];
  /** Total planned duration of the grow in days. */
  totalDays: number;
  generatedAt: string; // ISO string
};

// ── Harvest Data ──────────────────────────────────────────────────────────────

export type HarvestData = {
  /** Total yield in grams (dry weight). */
  grams: number;
  /** User rating 1–5. */
  rating: number;
  /** Optional free-text note. */
  notes?: string;
  /** ISO string — when harvest data was recorded. */
  recordedAt: string;
};

// ── Grow Status ───────────────────────────────────────────────────────────────

export type GrowStatus = "aktiv" | "abgeschlossen" | "pausiert" | "abgebrochen";

export const GROW_STATUS_LABELS: Record<GrowStatus, string> = {
  aktiv: "Aktiv",
  abgeschlossen: "Abgeschlossen",
  pausiert: "Pausiert",
  abgebrochen: "Abgebrochen",
};

// ── Plant (Entity within a Grow) ────────────────────────────────────────────

export type Plant = {
  id: string;
  name: string;
  notes?: string;
  createdAt: string; // ISO string
};

// ── Grow (Core Entity) ────────────────────────────────────────────────────────

export type Grow = {
  id: string;
  name: string;
  umgebung: GrowUmgebung;
  medium: GrowMedium;
  lichtTyp: LichtTyp;
  /** Lamp wattage in Watts. */
  lichtLeistung?: number;
  erfahrung: Erfahrung;
  pflanzenAnzahl: number;
  plants: Plant[];
  /** Grow canopy area in m². */
  flaeche?: number;
  /** ISO string — the date the grow was officially started. */
  startDate: string;
  /** The phase the grow is currently in. Updated manually or by the system. */
  currentPhaseId: GrowPhaseId;
  /**
   * Computed grow day (1-indexed). Derived at runtime from startDate.
   * NOT persisted — always recalculated on load.
   */
  currentDay: number;
  status: GrowStatus;
  plan: GrowPlan;
  notes?: string;
  /** Harvest data — recorded when grow is completed. */
  harvest?: HarvestData;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

// ── Log Entry Payloads ────────────────────────────────────────────────────────

export type TrainingMethod =
  | "lst"
  | "hst"
  | "topping"
  | "fimming"
  | "defoliation"
  | "scrog"
  | "sog";

export const TRAINING_METHOD_LABELS: Record<TrainingMethod, string> = {
  lst: "LST (Low Stress Training)",
  hst: "HST (High Stress Training)",
  topping: "Topping",
  fimming: "Fimming",
  defoliation: "Defoliation",
  scrog: "SCROG",
  sog: "SOG",
};

/** Water/irrigation log payload. */
export type WaterEntry = {
  type: "wasser";
  mengeLiter?: number;
  ph?: number;
};

/** Nutrient feeding log payload. */
export type FeedEntry = {
  type: "duenger";
  ec?: number;
  produkt?: string;
  mengeLiter?: number;
};

/** Training action log payload. */
export type TrainingEntry = {
  type: "training";
  methode: TrainingMethod;
};

/** Free-text note payload. */
export type NoteEntry = {
  type: "notiz";
  text: string;
};

/** Saved tool result payload — links a tool calculation to the grow log. */
export type ToolResultEntry = {
  type: "tool_result";
  toolSlug: string;
  toolTitle: string;
  /** Short human-readable summary of the result (e.g. "EC: 1.4 mS/cm"). */
  summary: string;
};

/** Discriminated union of all log entry payloads. Use `data.type` to narrow. */
export type LogEntryData =
  | WaterEntry
  | FeedEntry
  | TrainingEntry
  | NoteEntry
  | ToolResultEntry;

/** Derived union of all log entry type strings. */
export type LogEntryType = LogEntryData["type"];

export const LOG_ENTRY_TYPE_LABELS: Record<LogEntryType, string> = {
  wasser: "Bewässerung",
  duenger: "Düngung",
  training: "Training",
  notiz: "Notiz",
  tool_result: "Tool-Ergebnis",
};

export const LOG_ENTRY_TYPE_ICONS: Record<LogEntryType, string> = {
  wasser: "💧",
  duenger: "🧪",
  training: "✂️",
  notiz: "📝",
  tool_result: "📐",
};

// ── Log Entry (Core Entity) ───────────────────────────────────────────────────

export type LogEntry = {
  id: string;
  growId: string;
  /** Optional plant relation. Omitted = whole-grow entry. */
  plantId?: string;
  /** ISO string — when the action occurred (user-provided, may differ from createdAt). */
  date: string;
  data: LogEntryData;
  /** Optional extra free-text annotation for any entry type. */
  notes?: string;
  createdAt: string; // ISO string
};

// ── Input Types for Create Operations ────────────────────────────────────────

/**
 * Input to create a new Grow.
 * `id`, `plan`, `currentDay`, `createdAt`, `updatedAt` are auto-generated.
 */
export type CreateGrowInput = Omit<
  Grow,
  "id" | "plan" | "currentDay" | "createdAt" | "updatedAt" | "plants"
> & {
  /** Optional: if omitted, defaults are generated from `pflanzenAnzahl`. */
  plants?: Plant[];
};

/**
 * Input to create a new LogEntry.
 * `id` and `createdAt` are auto-generated.
 */
export type CreateLogEntryInput = Omit<LogEntry, "id" | "createdAt">;
