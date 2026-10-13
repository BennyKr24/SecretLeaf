'use client';

// Displays this grow's still-open recommendations (written by DiagnoseResult.tsx
// via lib/diagnose/db.ts's createRecommendation) and lets the user mark each one
// applied or dismissed — the one piece of the diagnosis → recommendation →
// outcome chain that had a write path but no UI at all. See TODO.md.

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ActionRow, BTN_GHOST, BTN_QUIET } from '@/components/grow/cockpit/ui';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import {
  getPendingRecommendations,
  recordRecommendationEvent,
  type PendingRecommendation,
} from '@/lib/diagnose/db';

type Props = {
  growId: string;
  userId: string;
};

export default function RecommendationsPanel({ growId, userId }: Props) {
  const t = useTranslations('dashboard');
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

  // Rows for the cockpit's "Als Nächstes" list (DESIGN_SYSTEM.md §24).
  return (
    <>
      {recommendations.map((rec) => (
        <ActionRow
          key={rec.id}
          label={t('recommendationLabel')}
          title={rec.diagnosisTitle ?? t('recommendationFallbackTitle')}
          text={rec.steps.length > 0 ? (
            <ul className="flex flex-col gap-0.5">
              {rec.steps.map((step, i) => (
                <li key={i} className="flex gap-2"><span aria-hidden="true">–</span><span>{step}</span></li>
              ))}
            </ul>
          ) : undefined}
          actions={(
            <>
              <button type="button" disabled={actingOn === rec.id} onClick={() => handleEvent(rec.id, 'applied')} className={BTN_GHOST}>
                {t('recommendationApplied')}
              </button>
              <button type="button" disabled={actingOn === rec.id} onClick={() => handleEvent(rec.id, 'dismissed')} className={BTN_QUIET}>
                {t('recommendationDismiss')}
              </button>
            </>
          )}
        />
      ))}
    </>
  );
}
