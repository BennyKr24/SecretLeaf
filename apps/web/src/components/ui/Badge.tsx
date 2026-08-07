// ────────────────────────────────────────────────────────────────────────────
// UI Primitive — Badge
//
// Small colored status/priority pill. Repeated ad hoc (plant status, task
// priority, score deltas, PRO marker) — one definition instead of a
// hand-rolled `rounded-full px-2 py-0.5 text-[10px] font-bold` per site.
// ────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from "react";

export type BadgeTone = "primary" | "amber" | "rose" | "muted" | "pro";

const TONES: Record<BadgeTone, string> = {
  primary: "bg-primary/15 text-primary",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  muted: "border border-border bg-surface text-muted-fg",
  pro: "border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function Badge({
  tone = "muted",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
