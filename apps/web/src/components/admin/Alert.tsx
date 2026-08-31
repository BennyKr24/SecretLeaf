"use client";

// ────────────────────────────────────────────────────────────────────────────
// Admin primitive — Alert
//
// One banner for the whole panel. Replaces the four ad-hoc notification
// patterns (auto-toast, dismissible banner, banner-with-X, result card) and
// the per-page hardcoded `border-rose-200 bg-rose-50 …` strings
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §0.3 / §2.3).
//
// Tones map to the design-system status roles (§5): error→rose, warn→amber,
// info→sky, success→primary. No raw `red-*`.
// ────────────────────────────────────────────────────────────────────────────

import { useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle, X, type LucideIcon } from "lucide-react";

export type AlertTone = "error" | "warn" | "info" | "success";

const TONES: Record<AlertTone, { wrap: string; icon: LucideIcon; iconCls: string }> = {
  error: {
    wrap: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    icon: XCircle,
    iconCls: "text-rose-500",
  },
  warn: {
    wrap: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: AlertTriangle,
    iconCls: "text-amber-500",
  },
  info: {
    wrap: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    icon: Info,
    iconCls: "text-sky-500",
  },
  success: {
    wrap: "border-primary/30 bg-primary/10 text-foreground",
    icon: CheckCircle2,
    iconCls: "text-primary",
  },
};

export function Alert({
  tone = "info",
  title,
  children,
  action,
  onDismiss,
  className = "",
}: {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  /** trailing slot, e.g. a link or button */
  action?: ReactNode;
  /** when set, renders an X that hides the alert (and calls back) */
  onDismiss?: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const cfg = TONES[tone];
  const Icon = cfg.icon;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${cfg.wrap} ${className}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${cfg.iconCls}`} strokeWidth={2} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5 text-muted-fg" : "text-inherit"}>{children}</div>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
      {onDismiss !== undefined && (
        <button
          type="button"
          aria-label="Schließen"
          onClick={() => {
            setOpen(false);
            onDismiss();
          }}
          className="flex-shrink-0 rounded-md p-0.5 opacity-70 transition hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
