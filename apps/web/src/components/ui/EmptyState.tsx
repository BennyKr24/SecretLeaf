// ────────────────────────────────────────────────────────────────────────────
// UI Primitive — EmptyState
//
// Consistent empty/zero-state display for any list or data section.
// Extracted from the multiple inline versions scattered across the codebase.
// ────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type EmptyStateProps = {
  /** Emoji or icon character displayed prominently. */
  icon: string;
  /** Short headline describing the empty state. */
  title: string;
  /** Optional secondary description line. */
  description?: string;
  /** Optional CTA element (e.g. a CTAButton). */
  action?: ReactNode;
  /** Additional Tailwind classes on the wrapper. */
  className?: string;
  /** Controls how much vertical padding the component has. */
  size?: "sm" | "md" | "lg";
};

// ── Class Maps ────────────────────────────────────────────────────────────────

const SIZES = {
  sm: "py-8 px-4",
  md: "py-12 px-6",
  lg: "py-16 px-8",
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Empty state placeholder. Use whenever a list or section has no data.
 *
 * @example
 * <EmptyState
 *   icon="🌱"
 *   title="Kein aktiver Grow"
 *   description="Starte deinen ersten Grow und tracke jeden Tag."
 *   action={<CTAButton href="/start">Grow starten</CTAButton>}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
  size = "md",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center gap-4 rounded-3xl",
        "border border-dashed border-slate-200 bg-slate-50/80",
        "text-center",
        SIZES[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className="text-4xl leading-none"
        role="img"
        aria-hidden="true"
      >
        {icon}
      </span>

      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {description !== undefined && description !== "" && (
          <p className="max-w-xs text-sm text-slate-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action !== undefined && <div className="mt-1">{action}</div>}
    </div>
  );
}
