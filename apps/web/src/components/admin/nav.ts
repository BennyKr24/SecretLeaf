// ────────────────────────────────────────────────────────────────────────────
// Admin navigation — registry
//
// Single source for the admin sidebar. A new admin page is one entry here,
// not an edit to AdminShell (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §2.1).
//
// `status: "planned"` entries are part of the target IA but not built yet —
// they are excluded from `ADMIN_NAV` (the render list) and only kept for
// reference until their phase lands.
//
// `ADMIN_BASE` is flipped from "/dashboard/admin" to "/admin" in Phase 1
// (decision §6.1); every href is built from it so that is a one-line change.
// ────────────────────────────────────────────────────────────────────────────

import {
  Radar,
  Bot,
  Users,
  Microscope,
  CalendarClock,
  ScrollText,
  Mail,
  Megaphone,
  Languages,
  Sprout,
  SlidersHorizontal,
  ShieldCheck,
  Euro,
  type LucideIcon,
} from "lucide-react";

export const ADMIN_BASE = "/dashboard/admin";

export type AdminNavStatus = "live" | "planned";

export type AdminNavGroup =
  | "Lage"
  | "Geld"
  | "Menschen"
  | "Inhalte"
  | "Maschine"
  | "Sonstiges";

export type AdminNavItem = {
  group: AdminNavGroup;
  /** path segment appended to ADMIN_BASE ("" = the overview root) */
  segment: string;
  label: string;
  icon: LucideIcon;
  /** match the pathname exactly instead of by prefix */
  exact?: boolean;
  status: AdminNavStatus;
  /** plan phase that introduces this entry (for planned items) */
  phase?: 1 | 2 | 3 | 4;
};

export const ADMIN_NAV_REGISTRY: AdminNavItem[] = [
  // ── Lage ────────────────────────────────────────────────────────────────
  { group: "Lage", segment: "", label: "Lage", icon: Radar, exact: true, status: "live" },

  // ── Geld ────────────────────────────────────────────────────────────────
  { group: "Geld", segment: "finance", label: "Finanzen", icon: Euro, status: "live" },
  { group: "Geld", segment: "growth", label: "Wachstum", icon: Sprout, status: "live" },

  // ── Menschen ────────────────────────────────────────────────────────────
  { group: "Menschen", segment: "users", label: "Nutzer", icon: Users, status: "live" },
  { group: "Menschen", segment: "mail", label: "Zustellung / Mail", icon: Mail, status: "planned", phase: 2 },

  // ── Inhalte ─────────────────────────────────────────────────────────────
  { group: "Inhalte", segment: "studies", label: "Studien", icon: Microscope, status: "live" },
  { group: "Inhalte", segment: "content", label: "Content & Wissen", icon: Languages, status: "planned", phase: 3 },
  { group: "Inhalte", segment: "changelog", label: "Neuigkeiten", icon: Megaphone, status: "live" },

  // ── Maschine ────────────────────────────────────────────────────────────
  { group: "Maschine", segment: "ops", label: "Betrieb", icon: CalendarClock, status: "live" },
  { group: "Maschine", segment: "control", label: "Steuerung", icon: SlidersHorizontal, status: "live" },
  { group: "Maschine", segment: "audit", label: "Audit-Log", icon: ScrollText, status: "planned", phase: 2 },

  // ── Sonstiges ───────────────────────────────────────────────────────────
  { group: "Sonstiges", segment: "compliance", label: "Compliance", icon: ShieldCheck, status: "planned", phase: 4 },
  { group: "Sonstiges", segment: "assistant", label: "Assistent", icon: Bot, status: "live" },
];

/** Order groups render in. */
export const ADMIN_NAV_GROUP_ORDER: AdminNavGroup[] = [
  "Lage",
  "Geld",
  "Menschen",
  "Inhalte",
  "Maschine",
  "Sonstiges",
];

export type AdminNavEntry = AdminNavItem & { href: string };

export type AdminNavGroupBlock = { group: AdminNavGroup; items: AdminNavEntry[] };

const toHref = (segment: string): string => (segment ? `${ADMIN_BASE}/${segment}` : ADMIN_BASE);

/** Live entries only, grouped and ordered for the sidebar. */
export const ADMIN_NAV: AdminNavGroupBlock[] = ADMIN_NAV_GROUP_ORDER.map((group) => ({
  group,
  items: ADMIN_NAV_REGISTRY.filter((item) => item.group === group && item.status === "live").map(
    (item) => ({ ...item, href: toHref(item.segment) }),
  ),
})).filter((block) => block.items.length > 0);

/** Resolve the active entry for a given pathname (prefix match, longest wins). */
export function activeAdminEntry(pathname: string): AdminNavEntry | undefined {
  const all = ADMIN_NAV.flatMap((b) => b.items);
  const exact = all.find((i) => i.exact && pathname === i.href);
  if (exact) return exact;
  return all
    .filter((i) => !i.exact && pathname.startsWith(i.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
