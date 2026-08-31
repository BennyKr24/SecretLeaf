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
  Home,
  Bot,
  Users,
  Microscope,
  Settings,
  Dna,
  BarChart3,
  CalendarClock,
  ScrollText,
  CreditCard,
  Mail,
  Megaphone,
  Languages,
  Sprout,
  ToggleLeft,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export const ADMIN_BASE = "/dashboard/admin";

export type AdminNavStatus = "live" | "planned";

export type AdminNavGroup =
  | "Betrieb"
  | "Nutzer & Umsatz"
  | "Inhalte"
  | "Produkt"
  | "Engine"
  | "System";

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
  // ── Betrieb ──────────────────────────────────────────────────────────────
  { group: "Betrieb", segment: "", label: "Lage", icon: Home, exact: true, status: "live" },
  { group: "Betrieb", segment: "automation", label: "Automatisierung", icon: CalendarClock, status: "planned", phase: 2 },
  { group: "Betrieb", segment: "audit", label: "Audit-Log", icon: ScrollText, status: "planned", phase: 2 },

  // ── Nutzer & Umsatz ─────────────────────────────────────────────────────
  { group: "Nutzer & Umsatz", segment: "users", label: "Benutzer", icon: Users, status: "live" },
  { group: "Nutzer & Umsatz", segment: "billing", label: "Abonnements", icon: CreditCard, status: "planned", phase: 2 },
  { group: "Nutzer & Umsatz", segment: "email", label: "E-Mail", icon: Mail, status: "planned", phase: 4 },

  // ── Inhalte ─────────────────────────────────────────────────────────────
  { group: "Inhalte", segment: "studies", label: "Studien", icon: Microscope, status: "live" },
  { group: "Inhalte", segment: "changelog", label: "Neuigkeiten & Changelog", icon: Megaphone, status: "planned", phase: 2 },
  { group: "Inhalte", segment: "i18n", label: "Übersetzungen", icon: Languages, status: "planned", phase: 4 },

  // ── Produkt ─────────────────────────────────────────────────────────────
  { group: "Produkt", segment: "analytics", label: "Auswertungen", icon: BarChart3, status: "live" },
  { group: "Produkt", segment: "product", label: "Grows & Diagnosen", icon: Sprout, status: "planned", phase: 3 },

  // ── Engine ──────────────────────────────────────────────────────────────
  { group: "Engine", segment: "engine", label: "Pipeline-Engine", icon: Settings, status: "live" },
  { group: "Engine", segment: "algorithm", label: "Algorithmus", icon: Dna, status: "live" },

  // ── System ──────────────────────────────────────────────────────────────
  { group: "System", segment: "assistant", label: "Assistent", icon: Bot, status: "live" },
  { group: "System", segment: "config", label: "Feature-Flags & Config", icon: ToggleLeft, status: "planned", phase: 4 },
  { group: "System", segment: "consent", label: "Datenschutz & Consent", icon: ShieldCheck, status: "planned", phase: 4 },
];

/** Order groups render in. */
export const ADMIN_NAV_GROUP_ORDER: AdminNavGroup[] = [
  "Betrieb",
  "Nutzer & Umsatz",
  "Inhalte",
  "Produkt",
  "Engine",
  "System",
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
