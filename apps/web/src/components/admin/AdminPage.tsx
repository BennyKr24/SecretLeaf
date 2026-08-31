// ────────────────────────────────────────────────────────────────────────────
// Admin primitive — AdminPage
//
// The page shell every admin route renders into: breadcrumb + icon title +
// optional description + optional action slot, then content. Replaces the
// hand-rolled header each of the 7 pages currently re-implements
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §0.3 / §2.3).
//
// Hook-free so it works from both server and client pages.
// ────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { IconChip, type IconChipTone } from "@/components/ui/IconChip";

export function AdminPage({
  title,
  icon,
  iconTone = "primary",
  description,
  breadcrumb = "Admin",
  actions,
  children,
}: {
  title: string;
  icon: LucideIcon;
  iconTone?: IconChipTone;
  description?: ReactNode;
  /** left crumb before the title; the title is the trailing crumb */
  breadcrumb?: string;
  /** right-aligned action slot in the header (buttons, links) */
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-medium text-muted-fg">
          {breadcrumb} <span className="px-1 opacity-50">/</span>{" "}
          <span className="text-foreground">{title}</span>
        </p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <IconChip icon={icon} tone={iconTone} size="md" />
            <div>
              <h1 className="text-xl font-bold leading-tight text-foreground">{title}</h1>
              {description && (
                <p className="mt-0.5 max-w-2xl text-sm text-muted-fg">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </header>
      {children}
    </div>
  );
}

/** Full-width loading placeholder for the content area. */
export function AdminPageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-background" />
      ))}
    </div>
  );
}
