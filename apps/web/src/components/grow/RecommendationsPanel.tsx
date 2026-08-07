'use client';

// Displays this grow's still-open recommendations (written by DiagnoseResult.tsx
// via lib/diagnose/db.ts's createRecommendation) and lets the user mark each one
// applied or dismissed — the one piece of the diagnosis → recommendation →
// outcome chain that had a write path but no UI at all. See TODO.md.

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, X, Sparkles } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import {
  getPendingRecommendations,
  recordRecommendationEvent,
  type PendingRecommendation,
} from '@/lib/diagnose/db';

type Props = {
  growId: string;
  userId: string;
  /** Render without its own card shell — for nesting inside a parent card
      (e.g. the grow dashboard's consolidated sidebar Insights card). */
  bare?: boolean;
};

export default function RecommendationsPanel({ growId, userId, bare = false }: Props) {
  const [recommendations, setRecommendations] = useState<PendingRecommendation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const rows = await getPendingRecommendations(supabase, growId);
        if (!cancelled) setRecommendations(rows);
      } catch (err) {
        console.error('[recommendations] failed to load:', err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [growId]);

  const handleEvent = useCallback(
    (recommendationId: string, eventType: 'applied' | 'dismissed') => {
      setActingOn(recommendationId);
      const previous = recommendations;
      // Optimistic removal — this is the terminal action for a pending
      // recommendation, there's nothing to show it as "applied" as here.
      setRecommendations((current) => current.filter((r) => r.id !== recommendationId));

      void (async () => {
        try {
          const supabase = getSupabaseBrowserClient();
          await recordRecommendationEvent(supabase, userId, recommendationId, eventType);
        } catch (err) {
          console.error('[recommendations] failed to record event, rolling back:', err);
          setRecommendations(previous);
        } finally {
          setActingOn(null);
        }
      })();
    },
    [recommendations, userId],
  );

  if (!loaded || recommendations.length === 0) return null;

  return (
    <section className={bare ? 'border-t border-border pt-5' : 'rounded-2xl border border-border bg-card p-5 shadow-sm'}>
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" strokeWidth={2} />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Offene Empfehlungen</p>
          <h2 className="text-sm font-bold text-foreground">
            {recommendations.length === 1 ? '1 Empfehlung wartet' : `${recommendations.length} Empfehlungen warten`}
          </h2>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {recommendations.map((rec) => (
          <div key={rec.id} className="rounded-xl border border-border bg-background p-4">
            {rec.diagnosisTitle && (
              <p className="text-sm font-bold text-foreground">{rec.diagnosisTitle}</p>
            )}
            {rec.steps.length > 0 && (
              <ul className="mt-2 space-y-1">
                {rec.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-muted-fg">
                    <span className="text-primary">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={actingOn === rec.id}
                onClick={() => handleEvent(rec.id, 'applied')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-dark active:scale-[0.97] disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                Angewendet
              </button>
              <button
                type="button"
                disabled={actingOn === rec.id}
                onClick={() => handleEvent(rec.id, 'dismissed')}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-fg transition hover:border-rose-500/30 hover:text-rose-500 active:scale-[0.97] disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.25} />
                Verwerfen
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
