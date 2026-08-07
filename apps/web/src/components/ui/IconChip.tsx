// ────────────────────────────────────────────────────────────────────────────
// UI Primitive — IconChip
//
// The icon-in-a-rounded-box pattern repeated ad hoc across the app (card
// headers, list rows, banners). One definition instead of copy-pasted
// Tailwind strings per section.
// ────────────────────────────────────────────────────────────────────────────

import type { LucideIcon } from "lucide-react";

export type IconChipTone = "primary" | "amber" | "rose" | "muted";
export type IconChipSize = "sm" | "md" | "lg";

const TONES: Record<IconChipTone, string> = {
  primary: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  muted: "border border-border bg-surface text-muted-fg",
};

const SIZES: Record<IconChipSize, { box: string; icon: string }> = {
  sm: { box: "h-7 w-7 rounded-lg", icon: "h-3.5 w-3.5" },
  md: { box: "h-9 w-9 rounded-xl", icon: "h-4 w-4" },
  lg: { box: "h-14 w-14 rounded-full", icon: "h-6 w-6" },
};

export function IconChip({
  icon: Icon,
  tone = "primary",
  size = "md",
  className = "",
}: {
  icon: LucideIcon;
  tone?: IconChipTone;
  size?: IconChipSize;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={`flex flex-shrink-0 items-center justify-center ${s.box} ${TONES[tone]} ${className}`}>
      <Icon className={s.icon} strokeWidth={2} />
    </span>
  );
}
