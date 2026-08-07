// ────────────────────────────────────────────────────────────────────────────
// Grow OS — Task/Log-Entry Icons
//
// Split out from types.ts (which is deliberately dependency-free) since
// these need lucide-react. Previously emoji strings — real icons for
// consistency with the rest of the app's UI (DESIGN_SYSTEM.md).
// ────────────────────────────────────────────────────────────────────────────

import { Droplets, FlaskConical, Scissors, Search, Leaf, ClipboardList, NotebookPen, Ruler, type LucideIcon } from "lucide-react";
import type { TaskCategory, LogEntryType } from "./types";

export const TASK_CATEGORY_ICONS: Record<TaskCategory, LucideIcon> = {
  bewaesserung: Droplets,
  duengung: FlaskConical,
  training: Scissors,
  kontrolle: Search,
  ernte: Leaf,
  allgemein: ClipboardList,
};

export const LOG_ENTRY_TYPE_ICONS: Record<LogEntryType, LucideIcon> = {
  wasser: Droplets,
  duenger: FlaskConical,
  training: Scissors,
  notiz: NotebookPen,
  tool_result: Ruler,
};
