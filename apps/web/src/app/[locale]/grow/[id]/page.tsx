'use client';

// ────────────────────────────────────────────────────────────────────────────
// Grow OS — /grow/[id]
//
// Shows any grow in the shared grow cockpit (components/grow/cockpit). The
// active grow of a signed-in user lives on /dashboard/user, so that case
// redirects there — one grow, one surface. Guests (local grows) and grows
// opened from the history stay here.
// ────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useGrowState } from '@/hooks/useGrowState';
import { useAuth } from '@/hooks/useAuth';
import { PremiumScrollFx } from '@/components/scroll/PremiumScrollFx';
import { GrowCockpit } from '@/components/grow/cockpit/GrowCockpit';
import { BTN_PRIMARY } from '@/components/grow/cockpit/ui';
import { Sprout } from 'lucide-react';

export default function GrowPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('dashboard');
  const router = useRouter();
  const growState = useGrowState();
  const { grows, loaded, activeGrowId, setActiveGrowId } = growState;
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  const grow = loaded ? (grows.find((g) => g.id === id) ?? null) : null;
  const isActiveOfUser = Boolean(grow && isLoggedIn && grow.id === activeGrowId);

  useEffect(() => {
    if (isActiveOfUser) router.replace('/dashboard/user');
  }, [isActiveOfUser, router]);

  if (!loaded || authLoading || isActiveOfUser) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4 px-4 py-8 sm:px-6">
          <div className="h-4 w-32 rounded-app bg-card" />
          <div className="h-8 w-64 rounded-app bg-card" />
          <div className="h-48 rounded-app bg-card" />
        </div>
      </main>
    );
  }

  if (!grow) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Sprout className="h-5 w-5 text-muted-fg" strokeWidth={1.75} />
          <h1 className="text-xl font-semibold text-foreground">{t('growNotFoundTitle')}</h1>
          <p className="text-sm text-muted-fg">{t('growNotFoundSub')}</p>
          <Link href={'/start' as Route} className={BTN_PRIMARY}>
            <Sprout className="h-3.5 w-3.5" strokeWidth={2} /> {t('startGrowCTA')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <PremiumScrollFx />
      <GrowCockpit
        grow={grow}
        growState={growState}
        eyebrow={t(`growStatus.${grow.status}`)}
        onSelectGrow={(growId) => {
          setActiveGrowId(growId);
          router.push(isLoggedIn ? '/dashboard/user' : (`/grow/${growId}` as Route));
        }}
      />
    </main>
  );
}
