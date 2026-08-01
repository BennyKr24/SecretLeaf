'use client';

// ────────────────────────────────────────────────────────────────────────────
// Grow OS — /grow/history
//
// Timeline of all completed, paused and aborted grows.
// Shows duration, plant count, harvest data (if saved) and basic stats.
// ────────────────────────────────────────────────────────────────────────────

import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { useGrowState } from '@/hooks/useGrowState';
import type { Grow } from '@/lib/grow/types';
import { GROW_STATUS_LABELS, GROW_UMGEBUNG_LABELS, GROW_MEDIUM_LABELS } from '@/lib/grow/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function growDuration(grow: Grow): number {
  const start = new Date(grow.startDate).getTime();
  const end = grow.updatedAt ? new Date(grow.updatedAt).getTime() : Date.now();
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

const STATUS_STYLES: Record<string, string> = {
  abgeschlossen: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  pausiert:      'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  abgebrochen:   'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
};

// ── History Card ──────────────────────────────────────────────────────────────

function GrowHistoryCard({ grow }: { grow: Grow }) {
  const duration = growDuration(grow);
  const harvest = (grow as Grow & { harvest?: { grams: number; rating: number; notes?: string } }).harvest;
  const statusStyle = STATUS_STYLES[grow.status] ?? 'bg-border text-foreground/80';

  return (
    <article className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-base font-bold text-foreground leading-snug">{grow.name}</h2>
          <p className="text-xs text-muted-fg mt-0.5">
            Gestartet {formatDate(grow.startDate)}
          </p>
        </div>
        <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle}`}>
          {GROW_STATUS_LABELS[grow.status]}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-background border border-border px-3 py-2 text-center">
          <p className="text-lg font-bold text-foreground">{duration}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-fg">Tage</p>
        </div>
        <div className="rounded-xl bg-background border border-border px-3 py-2 text-center">
          <p className="text-lg font-bold text-foreground">{grow.plants.length}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-fg">Pflanzen</p>
        </div>
        <div className="rounded-xl bg-background border border-border px-3 py-2 text-center">
          {harvest ? (
            <>
              <p className="text-lg font-bold text-emerald-600">{harvest.grams}g</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-fg">Ernte</p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-muted-fg">—</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-fg">Ernte</p>
            </>
          )}
        </div>
      </div>

      {/* Setup tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="rounded-full bg-border px-2.5 py-1 text-[11px] font-medium text-foreground/80">
          {GROW_UMGEBUNG_LABELS[grow.umgebung]}
        </span>
        <span className="rounded-full bg-border px-2.5 py-1 text-[11px] font-medium text-foreground/80">
          {GROW_MEDIUM_LABELS[grow.medium]}
        </span>
        {grow.lichtLeistung && (
          <span className="rounded-full bg-border px-2.5 py-1 text-[11px] font-medium text-foreground/80">
            {grow.lichtLeistung}W
          </span>
        )}
      </div>

      {/* Harvest notes */}
      {harvest?.notes && (
        <p className="mb-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
          {harvest.notes}
        </p>
      )}

      {/* Harvest rating */}
      {harvest && (
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map(star => (
            <span key={star} className={`text-lg leading-none ${star <= harvest.rating ? 'text-amber-400' : 'text-border'}`}>
              ★
            </span>
          ))}
        </div>
      )}

      {/* Link */}
      <Link
        href={`/grow/${grow.id}` as Route}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5
          text-xs font-semibold text-foreground hover:bg-background transition-colors"
      >
        Details ansehen →
      </Link>
    </article>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyHistory() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
      <p className="text-4xl mb-3">🌿</p>
      <p className="font-semibold text-foreground">Noch keine abgeschlossenen Grows</p>
      <p className="mt-1 text-sm text-muted-fg max-w-xs mx-auto">
        Sobald du einen Grow als &quot;Abgeschlossen&quot; markierst, erscheint er hier mit allen Stats.
      </p>
      <Link
        href={'/grow' as Route}
        className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition"
      >
        Zu meinen Grows
      </Link>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GrowHistoryPage() {
  const { grows, loaded } = useGrowState();

  const finished = grows.filter(
    (g) => g.status === 'abgeschlossen' || g.status === 'pausiert' || g.status === 'abgebrochen'
  );
  const completed = grows.filter((g) => g.status === 'abgeschlossen');
  const totalHarvest = completed.reduce((acc, g) => {
    const h = (g as Grow & { harvest?: { grams: number } }).harvest;
    return acc + (h?.grams ?? 0);
  }, 0);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="skeleton h-8 w-64 rounded" />
          <div className="skeleton h-40 rounded-2xl" />
          <div className="skeleton h-40 rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* ── Header ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-brand-hero">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-full w-1/2 bg-emerald-600/5 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-5 py-10">
          <Link href={'/grow' as Route} className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            ← Grows
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Grow-Verlauf</h1>
          <p className="mt-1 text-sm text-slate-400">
            Alle abgeschlossenen, pausierten und abgebrochenen Grows im Überblick.
          </p>
          {/* Summary stats */}
          {finished.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-4">
              <div>
                <p className="text-xl font-bold text-white">{finished.length}</p>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">Grows</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">{completed.length}</p>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">Abgeschlossen</p>
              </div>
              {totalHarvest > 0 && (
                <div>
                  <p className="text-xl font-bold text-emerald-400">{totalHarvest}g</p>
                  <p className="text-[11px] uppercase tracking-widest text-slate-400">Gesamternte</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── List ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 py-8">
        {finished.length === 0 ? (
          <EmptyHistory />
        ) : (
          <div className="space-y-4">
            {finished
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((grow) => (
                <GrowHistoryCard key={grow.id} grow={grow} />
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
