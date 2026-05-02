// ────────────────────────────────────────────────────────────────────────────
// UI Primitive — Card
//
// Standard content surface. Use as a consistent wrapper for all card-like
// containers in the product.
// ────────────────────────────────────────────────────────────────────────────

import type { ComponentPropsWithoutRef, ReactNode } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardVariant = "default" | "flat" | "inset";

type CardProps = ComponentPropsWithoutRef<"div"> & {
  /**
   * When true, adds hover styles to signal interactivity.
   * Does NOT convert the card into an anchor — use a Link inside for navigation.
   */
  interactive?: boolean;
  padding?: CardPadding;
  /** Visual variant of the card background/border treatment. */
  variant?: CardVariant;
};

// ── Class Maps ────────────────────────────────────────────────────────────────

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-7",
};

const VARIANTS: Record<CardVariant, string> = {
  default: "border border-border bg-card shadow-sm",
  flat: "border border-border bg-background",
  inset: "border border-border bg-background shadow-inner",
};

const INTERACTIVE =
  "cursor-pointer transition-all duration-150 hover:border-emerald-400 hover:shadow-md";

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Base card container.
 *
 * @example
 * <Card padding="md" interactive>
 *   <Link href="/grow/1">Active Grow</Link>
 * </Card>
 */
export function Card({
  interactive = false,
  padding = "md",
  variant = "default",
  className = "",
  children,
  ...rest
}: CardProps) {
  const cls = [
    "rounded-2xl",
    VARIANTS[variant],
    PADDING[padding],
    interactive ? INTERACTIVE : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

// ── Card Section ──────────────────────────────────────────────────────────────

/**
 * A horizontal divider section within a Card.
 * Use to group content inside a card without extra padding.
 */
export function CardSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-t border-slate-100 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}
