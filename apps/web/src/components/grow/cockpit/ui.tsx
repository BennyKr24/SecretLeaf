'use client';

// ── App-surface primitives (DESIGN_SYSTEM.md §24) ───────────────────────
// 6px radius, 1px lines instead of shadows, JetBrains Mono for values and
// small caps labels. Primary green only for one action per area and for
// "ok" status; amber only for real priority.

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { Route } from 'next';
import { Link } from '@/i18n/navigation';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export type TFn = ReturnType<typeof useTranslations>;

export const LABEL = 'font-mono text-xs lg:text-[11px] uppercase tracking-[0.08em] text-muted-fg';
export const PANEL = 'rounded-app border border-border bg-card';
const BTN_BASE = 'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-app px-3.5 text-[13px] transition active:scale-[0.97] motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-40';
export const BTN_PRIMARY = `${BTN_BASE} bg-primary font-bold text-white hover:bg-primary-dark`;
export const BTN_GHOST = `${BTN_BASE} border border-foreground/15 font-semibold text-foreground hover:bg-background`;
export const BTN_QUIET = `${BTN_BASE} font-semibold text-muted-fg hover:text-foreground`;
export const TEXT_LINK = 'font-mono text-xs lg:text-[11px] uppercase tracking-[0.08em] text-foreground underline underline-offset-[3px] transition-colors hover:text-primary';
export const INPUT = 'w-full rounded-app border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-fg/60 focus:border-foreground/30 focus:outline-none';

export const DAY_MS = 86_400_000;

export function timeAgo(isoDate: string, t: TFn): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t('timeJustNow');
  if (minutes < 60) return t('timeMinutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('timeHoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t(days === 1 ? 'timeDayAgo' : 'timeDaysAgo', { count: days });
  const weeks = Math.floor(days / 7);
  return t(weeks === 1 ? 'timeWeekAgo' : 'timeWeeksAgo', { count: weeks });
}

/** Absolute grow day (1-indexed) of an ISO date, relative to the grow start. */
export function growDayOf(isoDate: string, startDate: string): number {
  return Math.floor((new Date(isoDate).getTime() - new Date(startDate).getTime()) / DAY_MS) + 1;
}

/** Epoch ms of the start of the trailing `days` window. */
export function windowStart(days: number): number {
  return Date.now() - days * DAY_MS;
}

/** Whole days since an ISO date. */
export function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / DAY_MS);
}

export function Section({
  title, count, aside, children, revealDelay = 0, className = '', collapsible = false, defaultOpen = true,
}: {
  title: string;
  count?: number;
  aside?: React.ReactNode;
  children: React.ReactNode;
  revealDelay?: number;
  className?: string;
  /** Below lg the heading becomes a toggle and the body collapses (desktop always open). */
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const collapsed = collapsible && !open;
  const heading = (
    <>
      {title}
      {count !== undefined && count > 0 && <span className="tabular-nums text-muted-fg"> · {count}</span>}
    </>
  );
  const headingClass = 'font-mono text-xs lg:text-[11px] font-medium uppercase tracking-[0.08em] text-foreground';
  return (
    <section
      className={`flex flex-col gap-2.5 ${collapsible ? 'max-lg:gap-0 max-lg:border-b max-lg:border-border' : ''} ${className}`}
      data-reveal
      data-reveal-delay={revealDelay}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        {collapsible ? (
          <>
            <h2 className={`${headingClass} max-lg:hidden`}>{heading}</h2>
            <h2 className="w-full lg:hidden">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className={`flex min-h-[48px] w-full items-center justify-between gap-2 text-left ${headingClass}`}
              >
                <span>{heading}</span>
                <ChevronDown className={`h-4 w-4 text-muted-fg transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
              </button>
            </h2>
          </>
        ) : (
          <h2 className={headingClass}>{heading}</h2>
        )}
        {aside && <div className={collapsed ? 'max-lg:hidden' : ''}>{aside}</div>}
      </div>
      <div className={`flex flex-col gap-2.5 ${collapsed ? 'max-lg:hidden' : ''} ${collapsible ? 'max-lg:pb-4' : ''}`}>{children}</div>
    </section>
  );
}

/** Empty state as an invitation with a concrete benefit (§24.5), not a blank box. */
export function Invite({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2.5 p-4">
      <p className="w-full rounded-[3px] border border-dashed border-foreground/15 p-2.5 text-xs leading-relaxed text-muted-fg">{text}</p>
      {action}
    </div>
  );
}

export function ShowMoreButton({ expanded, hiddenCount, onToggle, t }: { expanded: boolean; hiddenCount: number; onToggle: () => void; t: TFn }) {
  if (hiddenCount <= 0 && !expanded) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center justify-center gap-1 border-t border-border py-2 ${LABEL} transition-colors hover:text-foreground`}
    >
      {expanded ? (
        <>{t('showLess')} <ChevronUp className="h-3 w-3" /></>
      ) : (
        <><span className="tabular-nums">+{hiddenCount}</span> {t('showMore')} <ChevronDown className="h-3 w-3" /></>
      )}
    </button>
  );
}

/** Minimal trend line for a metric cell. Rendered only with ≥2 real values. */
export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 200},${38 - ((v - min) / span) * 32}`)
    .join(' ');
  return (
    <svg className="block h-11 w-full text-foreground" viewBox="0 0 200 44" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** One value cell in a 1px-gap metric grid. */
export function MetricCell({ label, value, hint, muted = false }: { label: string; value: React.ReactNode; hint?: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 bg-card px-3.5 py-3">
      <span className={`${LABEL} truncate`}>{label}</span>
      <p className={`font-mono text-[22px] leading-tight tabular-nums ${muted ? 'text-muted-fg' : 'text-foreground'}`}>{value}</p>
      {hint && <span className="text-[11px] leading-snug text-muted-fg">{hint}</span>}
    </div>
  );
}

/** Caps a list to `max` items and reports how many are hidden; expand shows all. */
export function useExpandableList<T>(items: T[], max: number) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, max);
  const hiddenCount = Math.max(0, items.length - max);
  return { visible, hiddenCount, expanded, toggle: () => setExpanded((v) => !v) };
}

/** Disclosure that collapses on every breakpoint (settings, phase details). */
export function Disclosure({ label, children, defaultOpen = false }: { label: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={`inline-flex items-center gap-1 ${LABEL} transition-colors hover:text-foreground`}>
        {label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

/**
 * One row of the "Als Nächstes" list (tasks, recommendations, phase switch).
 * Every "do this" item in the cockpit uses this shape — one list, one look.
 */
export function ActionRow({
  label, title, text, meta, actions, onDismiss, dismissLabel, highlight = false,
}: {
  label?: React.ReactNode;
  title: React.ReactNode;
  text?: React.ReactNode | undefined;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  onDismiss?: (() => void) | undefined;
  dismissLabel?: string | undefined;
  /** Amber edge — only for real priority (§24.4). */
  highlight?: boolean;
}) {
  return (
    <article className="grid grid-cols-[3px_minmax(0,1fr)] gap-x-4 border-b border-border py-4 pr-4 last:border-b-0 sm:grid-cols-[3px_minmax(0,1fr)_auto]">
      <span className={`rounded-r-[2px] ${highlight ? 'bg-amber-500' : 'bg-foreground/15'}`} />
      <div className="min-w-0">
        {(label || onDismiss) && (
          <div className="mb-1 flex items-center justify-between gap-2">
            {label ? <p className={`${LABEL} ${highlight ? 'text-amber-500' : ''}`}>{label}</p> : <span />}
            {onDismiss && (
              <button type="button" onClick={onDismiss} aria-label={dismissLabel} className="-my-1.5 -mr-1.5 flex h-7 w-7 items-center justify-center text-muted-fg transition-colors hover:text-foreground sm:hidden">
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        )}
        <div className="text-[15px] font-semibold text-foreground">{title}</div>
        {text && <div className="mt-0.5 text-[13px] leading-relaxed text-muted-fg">{text}</div>}
        {meta && <div className={`mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 ${LABEL}`}>{meta}</div>}
      </div>
      {(actions || onDismiss) && (
        <div className="col-start-2 mt-3 flex flex-wrap items-center gap-1.5 sm:col-start-3 sm:mt-0 sm:self-center">
          {actions}
          {onDismiss && (
            <button type="button" onClick={onDismiss} aria-label={dismissLabel} className="hidden h-10 w-8 items-center justify-center text-muted-fg transition-colors hover:text-foreground sm:flex">
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      )}
    </article>
  );
}

type GlossaryHit = { term: string; definition: string; slug: string };
const glossaryCache = new Map<string, Promise<GlossaryHit | null>>();

/**
 * A label that explains itself on tap, with the definition from the wiki
 * glossary (/api/glossary — same text as in the articles, loaded on demand).
 */
export function GlossaryLabel({ terms, children }: { terms: string[]; children: React.ReactNode }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [hit, setHit] = useState<GlossaryHit | null | undefined>(undefined);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (!next || hit !== undefined) return;
    const key = `${locale}:${terms.join('|')}`;
    let request = glossaryCache.get(key);
    if (!request) {
      const query = new URLSearchParams([...terms.map((term) => ['term', term]), ['locale', locale]]);
      request = fetch(`/api/glossary?${query}`).then((r) => (r.ok ? r.json() as Promise<GlossaryHit> : null)).catch(() => null);
      glossaryCache.set(key, request);
    }
    void request.then(setHit);
  };

  return (
    <span className="flex min-w-0 flex-col gap-1.5">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        title={t('glossaryHint')}
        className={`${LABEL} self-start underline decoration-dotted underline-offset-[3px] transition-colors hover:text-foreground`}
      >
        {children}
      </button>
      {open && (
        <span className="text-xs leading-relaxed text-muted-fg">
          {hit === undefined ? t('loading') : hit === null ? t('glossaryMissing') : (
            <>
              {hit.definition}{' '}
              <Link href={`/studies/${hit.slug}` as Route} className="text-foreground underline underline-offset-2 hover:text-primary">{t('glossaryMore')}</Link>
            </>
          )}
        </span>
      )}
    </span>
  );
}
