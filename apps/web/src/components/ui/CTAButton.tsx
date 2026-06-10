"use client";

// ────────────────────────────────────────────────────────────────────────────
// UI Primitive — CTAButton
//
// Polymorphic button: renders as <Link> when `href` is provided,
// otherwise as <button>. Covers all action surfaces in the product.
// ────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import type { Route } from "next";
import type { ButtonHTMLAttributes, ReactNode } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CTAButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type CTAButtonSize = "sm" | "md" | "lg";

// ── Class Maps ────────────────────────────────────────────────────────────────

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl " +
  "transition-all duration-150 select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS: Record<CTAButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-white shadow-sm hover:bg-[var(--primary-dark)] active:scale-[0.98]",
  secondary:
    "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm " +
    "hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-400 active:scale-[0.98]",
  ghost:
    "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 active:bg-slate-200 dark:active:bg-slate-700",
  danger:
    "border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 shadow-sm " +
    "hover:bg-rose-100 dark:hover:bg-rose-900 hover:border-rose-300 active:scale-[0.98]",
};

const SIZES: Record<CTAButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-3 text-[15px]",
};

// ── Prop Variants (button vs. link) ───────────────────────────────────────────

type SharedProps = {
  variant?: CTAButtonVariant;
  size?: CTAButtonSize;
  children: ReactNode;
  className?: string;
};

type AsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type AsLink = SharedProps & {
  href: Route;
  target?: string;
  rel?: string;
  onClick?: () => void;
  type?: never;
  disabled?: never;
};

export type CTAButtonProps = AsButton | AsLink;

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standardised call-to-action button.
 *
 * - Pass `href` → renders as Next.js `<Link>` (no full page reload)
 * - No `href` → renders as `<button>` with full HTML button props
 *
 * @example
 * <CTAButton variant="primary" size="lg" href="/start">Grow starten →</CTAButton>
 * <CTAButton variant="secondary" onClick={handleSave}>Speichern</CTAButton>
 */
export function CTAButton({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...rest
}: CTAButtonProps) {
  const cls = [BASE, VARIANTS[variant], SIZES[size], className]
    .filter(Boolean)
    .join(" ");

  if ("href" in rest && rest.href !== undefined) {
    const { href, target, rel, onClick } = rest as AsLink;
    return (
      <Link
        href={href}
        className={cls}
        {...(target !== undefined && { target })}
        {...(rel !== undefined && { rel })}
        {...(onClick !== undefined && { onClick })}
      >
        {children}
      </Link>
    );
  }

  const { ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={cls} {...buttonRest}>
      {children}
    </button>
  );
}
