'use client';

// Native <select> can't have its open-state option list restyled with CSS —
// browsers render that popup natively (plain white/gray, OS-controlled hover),
// which looks out of place against this app's dark theme. This is a drop-in
// replacement with the same value/onChange/option shape, styled entirely with
// our own tokens.

import { createContext, useContext, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type DropdownContextValue = {
  value: string;
  select: (value: string) => void;
  registerLabel: (value: string, label: ReactNode) => void;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

type DropdownProps = {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  /** 'default' looks like a normal input; 'ghost' looks like clickable inline text (no border/bg/chevron-box). */
  variant?: 'default' | 'ghost';
  triggerClassName?: string;
};

export function Dropdown({ value, onChange, children, className = '', variant = 'default', triggerClassName }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState<Record<string, ReactNode>>({});
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const registerLabel = (optValue: string, label: ReactNode) => {
    setLabels((prev) => (prev[optValue] === label ? prev : { ...prev, [optValue]: label }));
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <DropdownContext.Provider value={{ value, select: (v) => { onChange(v); setOpen(false); }, registerLabel }}>
      <div ref={rootRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          onKeyDown={handleTriggerKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={
            triggerClassName ??
            (variant === 'ghost'
              ? 'flex cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent font-medium text-foreground outline-none transition-colors hover:text-primary focus:ring-1 focus:ring-primary/40'
              : 'flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-left text-sm font-medium text-foreground outline-none transition-[border-color,box-shadow] hover:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/30')
          }
        >
          <span className="truncate">{labels[value] ?? value}</span>
          {variant === 'default' && (
            <ChevronDown className={`h-4 w-4 flex-shrink-0 text-muted-fg transition-transform duration-150 ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
          )}
        </button>
        {/* Always mounted (not conditionally rendered) so DropdownOption children
            register their label for the closed trigger on first paint, instead
            of only after the popup has been opened once. Origin-aware scale/fade
            per DESIGN_SYSTEM.md §15.5/§15.6: never scale(0), always scale from
            the trigger it's anchored to (top, since it always opens below).
            Translucent glass material (apple-design §12) with a "materialize"
            entrance — blur radius animates together with scale/opacity so it
            reads as a real surface arriving, not a flat fade.
            `invisible` still snaps the exit instantly (removes from the a11y
            tree/tab order) — the enter direction, the one users actually watch,
            is what animates. */}
        <div
          role="listbox"
          className={`absolute z-30 mt-1.5 max-h-64 w-full min-w-max origin-top overflow-auto rounded-xl border border-border bg-card/80 backdrop-blur-xl backdrop-saturate-150 p-1 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)] transition-[opacity,transform,filter] duration-200 ease-out ${
            open ? 'opacity-100 scale-100 blur-none' : 'pointer-events-none invisible opacity-0 scale-95 blur-sm'
          }`}
        >
          {children}
        </div>
      </div>
    </DropdownContext.Provider>
  );
}

type DropdownOptionProps = {
  value: string;
  children: ReactNode;
};

export function DropdownOption({ value: optValue, children }: DropdownOptionProps) {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('DropdownOption must be used inside <Dropdown>');
  const { value, select, registerLabel } = ctx;

  // Deliberately excludes `children` from deps: JSX with more than one
  // interpolated expression (e.g. `{label} ({count})`) compiles to a new
  // array on every render, which would defeat registerLabel's reference-
  // equality check and cause an infinite update loop. Registering once per
  // value on mount is enough since these labels don't change after mount.
  useEffect(() => {
    registerLabel(optValue, children);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optValue]);

  const active = value === optValue;

  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={() => select(optValue)}
      className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        active ? 'bg-emerald-500/15 font-semibold text-emerald-600 dark:text-emerald-400' : 'text-foreground hover:bg-background'
      }`}
    >
      {children}
    </button>
  );
}
