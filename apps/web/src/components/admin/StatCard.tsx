// ────────────────────────────────────────────────────────────────────────────
// Admin primitive — StatCard + KpiRow
//
// One KPI tile, built on <Card> + <IconChip>. Replaces the bespoke
// `MetricCard`, the overview's local `StatCard`, and the hand-rolled stat
// rows on the users/studies pages (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §2.3).
//
// KpiRow lays 3–5 of these out — single column on mobile, per the research
// note "3–5 kritische Kennzahlen, einspaltig nach Priorität" (§1.2).
// ────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { IconChip, type IconChipTone } from "@/components/ui/IconChip";

export type StatTrend = {
  /** already-formatted delta, e.g. "+12" or "-3 %" */
  label: string;
  dir: "up" | "down" | "flat";
  /** true when "up" is bad (e.g. failed runs) — flips the colour */
  invert?: boolean;
};

export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  hint,
  trend,
  href,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  tone?: IconChipTone;
  hint?: ReactNode;
  trend?: StatTrend;
  /** kept for callers that render the card inside their own <Link> */
  href?: string;
}) {
  const good =
    trend && trend.dir !== "flat" && (trend.invert ? trend.dir === "down" : trend.dir === "up");
  const bad =
    trend && trend.dir !== "flat" && (trend.invert ? trend.dir === "up" : trend.dir === "down");
  const TrendIcon = trend?.dir === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <Card padding="sm" className="flex flex-col gap-3" data-href={href}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-fg">{label}</p>
        {icon && <IconChip icon={icon} tone={tone} size="sm" />}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold leading-none text-foreground">{value}</span>
        {trend && trend.dir !== "flat" && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              good ? "text-primary" : bad ? "text-rose-500" : "text-muted-fg"
            }`}
          >
            <TrendIcon className="h-3 w-3" strokeWidth={2.5} />
            {trend.label}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-fg">{hint}</p>}
    </Card>
  );
}

export function KpiRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {children}
    </div>
  );
}
