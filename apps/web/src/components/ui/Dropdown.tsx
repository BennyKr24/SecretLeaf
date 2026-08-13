'use client';

// Drop-in replacement for the old hand-built dropdown, now backed by
// base-ui's Select primitive (focus trap, keyboard nav, positioning,
// dismissal) instead of hand-rolled refs/listeners. External API
// (value/onChange/variant/className/triggerClassName + DropdownOption
// value/children) is unchanged on purpose — every existing call-site
// keeps working without edits. See TODO.md history for the migration.

import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Select } from '@base-ui/react/select';
import { ChevronDown } from 'lucide-react';

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
  // base-ui's <Select.Value> only shows a real label when it knows the
  // value→label mapping up front (its `items` prop) — it doesn't reach into
  // mounted <Select.Item> children to read their rendered content. Since
  // DropdownOption's children ARE the label (plain text, text+count,
  // icon+text — whatever the caller passes), derive `items` from them here
  // so the closed trigger shows the right thing without every call-site
  // having to declare its options twice.
  const items = Children.toArray(children)
    .filter((child): child is ReactElement<{ value: string; children?: ReactNode }> => isValidElement(child))
    .map((child) => ({ value: child.props.value, label: child.props.children }));

  return (
    <Select.Root items={items} value={value} onValueChange={(v) => { if (v != null) onChange(v); }}>
      <Select.Trigger
        className={
          triggerClassName ??
          (variant === 'ghost'
            ? `flex cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent font-medium text-foreground outline-none transition-colors hover:text-primary focus:ring-1 focus:ring-primary/40 ${className}`
            : `flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-left text-sm font-medium text-foreground outline-none transition-[border-color,box-shadow] hover:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/30 ${className}`)
        }
      >
        <Select.Value className="truncate" />
        {variant === 'default' && (
          <Select.Icon className="flex-shrink-0 transition-transform duration-150 data-[popup-open]:rotate-180">
            <ChevronDown className="h-4 w-4 text-muted-fg" strokeWidth={2} />
          </Select.Icon>
        )}
      </Select.Trigger>
      <Select.Portal>
        {/* Origin-aware scale/fade per DESIGN_SYSTEM.md §15.5/§15.6: never
            scale(0), always scale from the trigger it's anchored to (top,
            since it always opens below). Translucent glass material
            (apple-design §12) with a "materialize" entrance — blur radius
            animates together with scale/opacity so it reads as a real
            surface arriving, not a flat fade. base-ui handles mount/unmount
            timing itself via data-starting-style/data-ending-style, so no
            manual visibility bookkeeping is needed here. */}
        <Select.Positioner side="bottom" align="start" sideOffset={6} alignItemWithTrigger={false} className="z-30">
          <Select.Popup
            className="min-w-[var(--anchor-width)] w-max origin-top rounded-xl border border-border bg-card/80 backdrop-blur-xl backdrop-saturate-150 p-1 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)] transition-[opacity,transform,filter] duration-200 ease-out data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:blur-sm data-[ending-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:blur-sm"
          >
            <Select.List className="max-h-64 overflow-auto">
              {children}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

type DropdownOptionProps = {
  value: string;
  children: ReactNode;
};

export function DropdownOption({ value, children }: DropdownOptionProps) {
  return (
    <Select.Item
      value={value}
      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-background data-[selected]:bg-emerald-500/15 data-[selected]:font-semibold data-[selected]:text-emerald-600 dark:data-[selected]:text-emerald-400"
    >
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  );
}
