"use client";

import { useEffect, type ReactNode } from "react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
};

/**
 * Bottom sheet primitive — slide-up panel anchored to the bottom of the
 * viewport, dismissible via backdrop tap or Escape. Same recipe as
 * WikiAskBot.tsx's panel (translate-y-full → translate-y-0 on
 * --ease-drawer, .modal-surface material, always-mounted + class-toggled
 * so it actually animates instead of relying on the unused
 * tailwindcss-animate plugin).
 */
export function Sheet({ open, onClose, label, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${
        open ? "opacity-100" : "invisible pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal
      aria-label={label}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`modal-surface pb-safe relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border shadow-2xl transition-transform duration-500 [transition-timing-function:var(--ease-drawer)] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
