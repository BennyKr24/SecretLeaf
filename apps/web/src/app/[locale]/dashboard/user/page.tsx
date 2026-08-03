'use client';

import { Link, useRouter } from '@/i18n/navigation';
import type { Route } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { restoreSessionFromSupabase, logoutFromSupabase } from '@/lib/auth';
import type { SessionData } from '@/lib/types';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useInterests, INTEREST_META, type Interest } from '@/hooks/useInterests';
import { wikiArticles, categoryLabels } from '@/data/terpira/wiki';
import type { TerpiraArticle } from '@/lib/terpira/types';
import {
  buildWeeklyDigestPayload,
  getActivityScore,
  getContinueReadingEntries,
  getInterestMatches,
  getReadingStreak,
} from '@/lib/retention';
import BookmarkButton from '@/components/BookmarkButton';
import CommunitySignals from '@/components/CommunitySignals';
import { useGrowState } from '@/hooks/useGrowState';
import { useGrowLog } from '@/hooks/useGrowLog';
import { getUpcomingTasks, getOverdueTasks, getTaskProgress, getPhaseForDay } from '@/lib/grow/planGenerator';
import { PHASE_ICONS } from '@/lib/grow/phases';
import { TASK_CATEGORY_ICONS } from '@/lib/grow/types';

/** True when a plant needs attention: no log > 3 days or no watering > 3 days. */
function dashboardPlantAlert(plantEntries: { date: string; data: { type: string } }[]): boolean {
  if (plantEntries.length === 0) return false;
  const newest = plantEntries[0]!;
  const sinceLog = Math.floor((Date.now() - new Date(newest.date).getTime()) / 86_400_000);
  if (sinceLog > 3) return true;
  const lastWater = plantEntries.find((e) => e.data.type === "wasser");
  if (lastWater) {
    const sinceWater = Math.floor((Date.now() - new Date(lastWater.date).getTime()) / 86_400_000);
    if (sinceWater > 3) return true;
  }
  return false;
}

type TFn = ReturnType<typeof useTranslations>;

function timeAgo(isoDate: string, t: TFn): string {
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

const INTEREST_ORDER = Object.keys(INTEREST_META) as Interest[];

function SectionHeader({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: number | string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-bold tracking-tight text-foreground sm:text-lg">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted-fg sm:text-sm">{subtitle}</p>}
      </div>
      {badge !== undefined && badge !== 0 && badge !== '0' && (
        <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700">
          {badge}
        </span>
      )}
    </div>
  );
}

function EmptyState({ icon, text, action }: { icon: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-background/80 px-6 py-10 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="max-w-sm text-sm text-muted-fg">{text}</p>
      {action}
    </div>
  );
}

function MetricCard({ icon, label, value, tone = 'default' }: { icon: string; label: string; value: number | string; tone?: 'default' | 'accent' }) {
  return (
    <div className={`rounded-3xl border px-4 py-4 shadow-sm backdrop-blur ${tone === 'accent' ? 'border-emerald-200 bg-emerald-50/70' : 'border-border bg-card/80'}`}>
      <span className="text-lg">{icon}</span>
      <p className="mt-2 text-2xl font-bold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-fg">{label}</p>
    </div>
  );
}

function ArticleCard({ article, variant = 'default' }: { article: TerpiraArticle; variant?: 'compact' | 'default' }) {
  const t = useTranslations('dashboard');
  if (variant === 'compact') {
    return (
      <Link
        href={`/studies/${article.slug}`}
        className="group flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm transition-all duration-150 hover:border-emerald-200 hover:bg-emerald-50/40"
      >
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-[13px] font-semibold text-foreground transition-colors group-hover:text-emerald-700">
            {article.title}
          </p>
          <p className="mt-0.5 text-xs text-muted-fg">
            {categoryLabels[article.category]} · {article.readMinutes} {t('minReadTime')}
          </p>
          <div className="mt-2">
            <CommunitySignals article={article} allArticles={wikiArticles} limit={2} compact />
          </div>
        </div>
        <BookmarkButton slug={article.slug} size="sm" className="flex-shrink-0" />
      </Link>
    );
  }

  return (
    <Link
      href={`/studies/${article.slug}`}
      className="group flex flex-col rounded-3xl border border-border bg-card p-5 shadow-sm transition-all duration-150 hover:border-emerald-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="inline-block rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          {categoryLabels[article.category]}
        </span>
        <BookmarkButton slug={article.slug} size="sm" className="flex-shrink-0" />
      </div>
      <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-foreground transition-colors group-hover:text-emerald-700">
        {article.title}
      </h3>
      <p className="mt-2 line-clamp-2 flex-1 text-xs text-muted-fg">{article.summary}</p>
      <div className="mt-3">
        <CommunitySignals article={article} allArticles={wikiArticles} compact />
      </div>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-fg">
        <span>{article.readMinutes} {t('minReadTime')}</span>
        <span>·</span>
        <span className="capitalize">{article.difficulty}</span>
      </div>
    </Link>
  );
}

function ContinueReadingCard({ article, progress, updatedAt, sectionId }: {
  article: TerpiraArticle;
  progress: number;
  updatedAt: string;
  sectionId?: string;
}) {
  const t = useTranslations('dashboard');
  const href = sectionId ? `/studies/${article.slug}#${sectionId}` : `/studies/${article.slug}`;

  return (
    <a
      href={href}
      className="group flex min-w-[280px] snap-start flex-col rounded-3xl border border-border bg-card p-5 shadow-sm transition-all duration-150 hover:border-emerald-200 hover:shadow-md sm:min-w-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">{t('continueLabel')}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-emerald-700">
            {article.title}
          </h3>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          {progress}%
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-fg">{categoryLabels[article.category]} · {t('lastRead', { time: timeAgo(updatedAt, t) })}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-fg">
        <span>{sectionId ? t('resumeAt', { section: sectionId.replace('-', ' ') }) : t('readDirectly')}</span>
        <span className="font-semibold text-emerald-600">{t('openBtn')}</span>
      </div>
    </a>
  );
}

export default function UserDashboardPage() {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmClearHistoryVisible, setConfirmClearHistoryVisible] = useState(false);
  const [lastVisit, setLastVisit] = useState<Date | null>(null);

  const { bookmarks } = useBookmarks();
  const { history, clearHistory } = useReadingHistory();
  const { activeGrow } = useGrowState();
  const { hasTodayEntry, entries: growEntries } = useGrowLog(activeGrow?.id ?? null);

  // Compute how many plants need attention
  const alertCount = useMemo(() => {
    if (!activeGrow) return 0;
    const overdueTasks = getOverdueTasks(activeGrow).length;
    const plantAlerts = activeGrow.plants.filter((p) => {
      const pe = growEntries.filter((e) => e.plantId === p.id);
      return dashboardPlantAlert(pe);
    }).length;
    return overdueTasks > 0 || plantAlerts > 0 ? plantAlerts + (overdueTasks > 0 ? 1 : 0) : 0;
  }, [activeGrow, growEntries]);

  const { progressEntries } = useReadingProgress();
  const { interests, toggle: toggleInterest, isActive, loaded: interestsLoaded, preferredCategories } = useInterests();

  useEffect(() => {
    void (async () => {
      const restored = await restoreSessionFromSupabase();
      if (!restored) {
        router.replace('/auth?next=/dashboard/user');
        return;
      }
      setSession(restored);
      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = setTimeout(() => {
      const raw = localStorage.getItem('secretleaf.last_visit');
      if (raw) setLastVisit(new Date(raw));
      localStorage.setItem('secretleaf.last_visit', new Date().toISOString());
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const digest = useMemo(() => buildWeeklyDigestPayload(wikiArticles), []);

  const bookmarkedArticles = useMemo(
    () => bookmarks
      .map((slug) => wikiArticles.find((article) => article.slug === slug))
      .filter((article): article is TerpiraArticle => Boolean(article)),
    [bookmarks],
  );

  const historyArticles = useMemo(
    () => history
      .map((entry) => wikiArticles.find((article) => article.slug === entry.slug))
      .filter((article): article is TerpiraArticle => Boolean(article))
      .slice(0, 6),
    [history],
  );

  const recentHistorySlugs = useMemo(() => new Set(history.slice(0, 5).map((entry) => entry.slug)), [history]);
  const bookmarkSlugs = useMemo(() => new Set(bookmarks), [bookmarks]);

  const recommendedArticles = useMemo(
    () => (preferredCategories.length > 0
      ? preferredCategories.flatMap((category) => wikiArticles.filter((article) => article.category === category))
      : wikiArticles)
      .filter((article) => !bookmarkSlugs.has(article.slug) && !recentHistorySlugs.has(article.slug))
      .slice(0, 6),
    [bookmarkSlugs, preferredCategories, recentHistorySlugs],
  );

  const newSinceLastVisit = useMemo(
    () => (lastVisit
      ? wikiArticles.filter((article) => new Date(article.lastUpdated) > lastVisit).slice(0, 4)
      : []),
    [lastVisit],
  );

  const interestMatches = useMemo(
    () => getInterestMatches({
      articles: wikiArticles,
      preferredCategories,
      excludedSlugs: new Set([...bookmarks, ...history.slice(0, 8).map((entry) => entry.slug)]),
      lastVisit,
    }),
    [bookmarks, history, lastVisit, preferredCategories],
  );

  const continueReading = useMemo(
    () => getContinueReadingEntries(progressEntries)
      .map((entry) => {
        const article = wikiArticles.find((candidate) => candidate.slug === entry.slug);
        return article ? { article, entry } : null;
      })
      .filter((item): item is { article: TerpiraArticle; entry: (typeof progressEntries)[number] } => Boolean(item)),
    [progressEntries],
  );

  const readingStreak = useMemo(() => getReadingStreak(history), [history]);
  const activityScore = useMemo(
    () => getActivityScore({
      history,
      bookmarksCount: bookmarks.length,
      interestsCount: interests.length,
      progressEntries,
    }),
    [bookmarks.length, history, interests.length, progressEntries],
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-6 w-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-muted-fg">{t('loading')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-emerald-100/60 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_38%),linear-gradient(135deg,#0f2e1f_0%,#174b34_46%,#f4f8f5_100%)] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-5%] top-[-10%] h-52 w-52 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute right-[-5%] top-12 h-44 w-44 rounded-full bg-teal-200/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-5 sm:pb-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-200">{t('growOsEyebrow')}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {greeting()}{session ? `, ${session.user.username}` : ''}
              </h1>
              <p className="mt-3 text-sm leading-6 text-emerald-50/85 sm:text-base">
                {t('heroBannerSub')}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                  🔥 {readingStreak > 0 ? t('streakBadge', { count: readingStreak }) : t('streakStart')}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                  ⚡ {t('activityBadge', { score: activityScore })}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                  ✉︎ {t('digestBadge')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[340px]">
              <MetricCard icon="🔖" label={t('metricSaved')} value={bookmarks.length} />
              <MetricCard icon="📖" label={t('metricRead')} value={history.length} />
              <MetricCard icon="🔥" label={t('metricStreak')} value={readingStreak} tone="accent" />
              <MetricCard icon="⚡" label={t('metricActivity')} value={activityScore} tone="accent" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {session?.user.role === 'ADMIN' && (
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/15"
              >
                ⚙ {t('adminLink')}
              </Link>
            )}
            <button
              type="button"
              onClick={() => void (async () => { await logoutFromSupabase(); router.push('/'); })()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/15"
            >
              {t('logoutBtn')}
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">

        {/* ═══════════════════ PRIMARY — Grow + Benachrichtigungen nebeneinander ═══════════════════ */}
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="space-y-5">
        {/* ── Grow Alert Banner ── */}
        {activeGrow && alertCount > 0 && (
          <a
            href={`/grow/${activeGrow.id}`}
            className="flex items-center gap-3 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 transition hover:bg-rose-100 active:scale-[0.99]"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm text-white">🚨</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-rose-800">
                {t('alertPlants', { count: alertCount })}
              </p>
              <p className="text-[11px] text-rose-500">{t('alertGotoGrow')}</p>
            </div>
            <svg className="h-4 w-4 flex-shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
        {activeGrow ? (
          <section className="rounded-[28px] border border-emerald-200 bg-card p-4 shadow-[0_8px_40px_-8px_rgba(5,150,105,0.18)] ring-1 ring-emerald-100 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">{t('activeGrowEyebrow')}</p>
                <h2 className="mt-1 text-lg font-bold text-foreground">{activeGrow.name}</h2>
              </div>
              <Link
                href={`/grow/${activeGrow.id}` as Route}
                className="flex-shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                {t('openBtn')}
              </Link>
            </div>

            {/* Grow meta */}
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {(() => {
                const phase = activeGrow.plan.phases.find((p) => p.id === activeGrow.currentPhaseId)
                  ?? getPhaseForDay(activeGrow.plan, activeGrow.currentDay);
                const { completed, total, percent } = getTaskProgress(activeGrow);
                const phaseProgress = activeGrow.plan.totalDays > 0
                  ? Math.min(100, Math.round((activeGrow.currentDay / activeGrow.plan.totalDays) * 100))
                  : 0;
                return (
                  <>
                    <span className="flex items-center gap-1 text-foreground/80">
                      {phase ? PHASE_ICONS[phase.id] : '🌿'}
                      <span className="font-medium">{phase?.label ?? '—'}</span>
                    </span>
                    <span className="text-muted-fg">·</span>
                    <span className="text-muted-fg">{t('growDayProgress', { current: activeGrow.currentDay, total: activeGrow.plan.totalDays })}</span>
                    <span className="text-muted-fg">·</span>
                    <span className="text-muted-fg">{t('growTaskProgress', { done: completed, total, percent })}</span>
                    <div className="mt-2 w-full">
                      <div className="h-1.5 overflow-hidden rounded-full bg-border">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${phaseProgress}%` }} />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Overdue warning */}
            {(() => {
              const overdue = getOverdueTasks(activeGrow);
              if (overdue.length === 0) return null;
              return (
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2">
                  <span>⚠️</span>
                  <p className="text-xs font-semibold text-rose-700">
                    {t('overdueTasks', { count: overdue.length })} — {t('overdueNow')}
                  </p>
                </div>
              );
            })()}

            {/* Next tasks */}
            {(() => {
              const tasks = getUpcomingTasks(activeGrow, 3);
              if (tasks.length === 0) return (
                <p className="rounded-xl border border-dashed border-border py-4 text-center text-xs text-muted-fg">{t('allTasksDone')}</p>
              );
              return (
                <div className="space-y-2">
                  {tasks.map((task) => {
                    const diff = task.dueDay - activeGrow.currentDay;
                    const dueLbl = diff === 0
                      ? t('taskDueToday')
                      : diff === 1
                        ? t('taskDueTomorrow')
                        : diff < 0
                          ? t('taskOverdue', { days: Math.abs(diff) })
                          : t('taskInDays', { days: diff });
                    return (
                      <div key={task.id} className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5">
                        <span className="text-base flex-shrink-0">{TASK_CATEGORY_ICONS[task.category]}</span>
                        <p className="flex-1 text-sm font-medium text-foreground">{task.title}</p>
                        <span className={`flex-shrink-0 text-[10px] font-semibold ${
                          diff < 0 ? 'text-rose-600' : diff === 0 ? 'text-emerald-700' : 'text-muted-fg'
                        }`}>{dueLbl}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Daily Status */}
            <div className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 ${
              hasTodayEntry
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-amber-200 bg-amber-50'
            }`}>
              <span className="text-base">{hasTodayEntry ? '✅' : '⏰'}</span>
              <p className={`text-sm font-semibold ${
                hasTodayEntry ? 'text-emerald-800' : 'text-amber-800'
              }`}>
                {hasTodayEntry ? t('dailyDone') : t('dailyMissing')}
              </p>
              {!hasTodayEntry && (
                <span className="ml-auto text-[11px] font-bold text-amber-600">{t('dailyLogNow')}</span>
              )}
            </div>

            {/* Primary CTA */}
            <div className="mt-5">
              <Link
                href={`/grow/${activeGrow.id}` as Route}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-900/20 transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                <span className="text-base">📓</span>
                {t('todayLogCTA')}
                <svg className="ml-auto h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Secondary actions */}
            <div className="mt-2 flex gap-2">
              <Link
                href={'/tools' as Route}
                className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-center text-xs font-semibold text-muted-fg transition hover:border-cyan-200 hover:text-cyan-700"
              >
                {t('toolsLink')}
              </Link>
              <Link
                href={'/diagnose' as Route}
                className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-center text-xs font-semibold text-muted-fg transition hover:border-violet-200 hover:text-violet-700"
              >
                {t('diagnoseLink')}
              </Link>
            </div>
          </section>
        ) : (
          <section className="rounded-[28px] border border-dashed border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 text-center">
            <span className="text-3xl">🌱</span>
            <h2 className="mt-2 text-base font-bold text-foreground">{t('noActiveGrowTitle')}</h2>
            <p className="mt-1 text-sm text-muted-fg">{t('noActiveGrowSub')}</p>
            <Link
              href={'/start' as Route}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
            >
              🌱 {t('startGrowCTA')}
            </Link>
          </section>
        )}
        </div>{/* /grow column */}

        <section className="rounded-[28px] border border-border bg-card/85 p-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
          <SectionHeader
            title={t('smartNotificationsTitle')}
            subtitle={t('smartNotificationsSub')}
            badge={newSinceLastVisit.length + interestMatches.length}
          />
          <div className="grid gap-4">
            <div className="rounded-3xl border border-emerald-100 dark:border-emerald-900/40 bg-[linear-gradient(180deg,rgba(236,253,245,0.9),rgba(255,255,255,0.95))] dark:bg-[linear-gradient(180deg,rgba(6,78,59,0.35),rgba(15,17,23,0.6))] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{t('newSinceLastVisit')}</p>
                  <p className="mt-1 text-sm text-foreground/80">{t('newSinceLastVisitSub')}</p>
                </div>
                <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">{newSinceLastVisit.length}</span>
              </div>
              {newSinceLastVisit.length === 0 ? (
                <EmptyState icon="🛰" text={t('noNewUpdates')} />
              ) : (
                <div className="space-y-3">
                  {newSinceLastVisit.map((article) => (
                    <ArticleCard key={article.slug} article={article} variant="compact" />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-sky-100 dark:border-sky-900/40 bg-[linear-gradient(180deg,rgba(240,249,255,0.9),rgba(255,255,255,0.95))] dark:bg-[linear-gradient(180deg,rgba(12,74,110,0.35),rgba(15,17,23,0.6))] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">{t('fitsYourInterests')}</p>
                  <p className="mt-1 text-sm text-foreground/80">{t('fitsYourInterestsSub')}</p>
                </div>
                <span className="rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-bold text-white">{interestMatches.length}</span>
              </div>
              {interestMatches.length === 0 ? (
                <EmptyState
                  icon="🎯"
                  text={interests.length === 0 ? t('noInterestsYet') : t('noInterestMatch')}
                  action={interests.length === 0 ? (
                    <Link href="/dashboard/onboarding" className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-500">
                      {t('chooseInterests')}
                    </Link>
                  ) : undefined}
                />
              ) : (
                <div className="space-y-3">
                  {interestMatches.map((article) => (
                    <ArticleCard key={article.slug} article={article} variant="compact" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        </div>{/* /primary grid */}

        {/* ═══════════════════ SECONDARY — Wissensbasis ═══════════════════ */}
        <div className="mt-12 space-y-8 border-t border-border pt-10">
          <div className="flex items-center gap-3">
            <p className="flex-shrink-0 text-[11px] font-bold uppercase tracking-widest text-muted-fg">📚 {t('knowledgeBaseEyebrow')}</p>
            <div className="h-px flex-1 bg-border" />
          </div>

        <section className="rounded-[28px] border border-border bg-card/90 p-4 shadow-sm sm:p-6">
          <SectionHeader
            title={t('weeklyDigestTitle')}
            subtitle={t('weeklyDigestSub')}
            badge={digest.generatedAt.slice(0, 10)}
          />

          <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2 lg:grid lg:grid-cols-[1.15fr_1.15fr_0.9fr] lg:overflow-visible">
            <div className="min-w-[290px] snap-start rounded-3xl border border-emerald-100 dark:border-emerald-900/40 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(255,255,255,1))] dark:bg-[linear-gradient(180deg,rgba(6,78,59,0.35),rgba(15,17,23,0.6))] p-4 lg:min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{t('newGrowStudies')}</p>
              <div className="mt-3 space-y-3">
                {digest.newGrowStudies.map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="compact" />
                ))}
              </div>
            </div>

            <div className="min-w-[290px] snap-start rounded-3xl border border-amber-100 dark:border-amber-900/40 bg-[linear-gradient(180deg,rgba(255,251,235,0.95),rgba(255,255,255,1))] dark:bg-[linear-gradient(180deg,rgba(69,26,3,0.35),rgba(15,17,23,0.6))] p-4 lg:min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">{t('importantThisWeek')}</p>
              <div className="mt-3 space-y-3">
                {digest.importantThisWeek.map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="compact" />
                ))}
              </div>
            </div>

            <div className="min-w-[290px] snap-start rounded-3xl border border-rose-100 dark:border-rose-900/40 bg-[linear-gradient(180deg,rgba(255,241,242,0.95),rgba(255,255,255,1))] dark:bg-[linear-gradient(180deg,rgba(76,5,25,0.35),rgba(15,17,23,0.6))] p-4 lg:min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">{t('trendingTopics')}</p>
              <div className="mt-3 space-y-3">
                {digest.trendingTopics.map((topic) => (
                  <Link
                    key={topic.label}
                    href={`/studies/${topic.sampleArticle.slug}`}
                    className="block rounded-2xl border border-border bg-card/80 p-4 shadow-sm transition-all duration-150 hover:border-rose-200 hover:bg-rose-50/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">{topic.label}</p>
                        <p className="mt-1 text-xs text-muted-fg">{t('relevantArticles', { count: topic.articleCount })}</p>
                      </div>
                      <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        +{topic.momentum}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs text-foreground/80">{t('trendingStartpoint', { title: topic.sampleArticle.title })}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-card/90 p-4 shadow-sm sm:p-6">
          <SectionHeader
            title={t('continueReadingTitle')}
            subtitle={t('continueReadingSub')}
            badge={continueReading.length}
          />
          {continueReading.length === 0 ? (
            <EmptyState
              icon="📍"
              text={t('noProgressYet')}
              action={
                <Link href="/studies" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-500">
                  {t('discoverStudies')}
                </Link>
              }
            />
          ) : (
            <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2 lg:grid lg:grid-cols-2 lg:overflow-visible">
              {continueReading.map(({ article, entry }) => (
                <ContinueReadingCard
                  key={article.slug}
                  article={article}
                  progress={entry.progress}
                  updatedAt={entry.updatedAt}
                  {...(entry.lastSectionId ? { sectionId: entry.lastSectionId } : {})}
                />
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
          <section className="rounded-[28px] border border-border bg-card/90 p-4 shadow-sm sm:p-6">
            <SectionHeader title={t('savedStudiesTitle')} subtitle={t('savedStudiesSub')} badge={bookmarkedArticles.length} />
            {bookmarkedArticles.length === 0 ? (
              <EmptyState
                icon="🔖"
                text={t('noBookmarksYet')}
                action={
                  <Link href="/studies" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-500">
                    {t('discoverStudies')}
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {bookmarkedArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-border bg-card/90 p-4 shadow-sm sm:p-6">
            <SectionHeader title={t('streakActivityTitle')} subtitle={t('streakActivitySub')} />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{t('readingStreakLabel')}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{readingStreak}</p>
                <p className="mt-1 text-sm text-foreground/80">{readingStreak === 1 ? t('dayInRow') : t('daysInRow')}</p>
              </div>
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{t('activityScoreLabel')}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{activityScore}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-card/80">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${activityScore}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-border bg-background/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-fg">{t('recentlyViewed')}</p>
              {historyArticles.length === 0 ? (
                <p className="mt-3 text-sm text-muted-fg">{t('noReadHistory')}</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {historyArticles.map((article) => {
                    const entry = history.find((item) => item.slug === article.slug);
                    return (
                      <Link
                        key={article.slug}
                        href={`/studies/${article.slug}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 font-semibold text-foreground">{article.title}</p>
                          <p className="mt-0.5 text-xs text-muted-fg">{categoryLabels[article.category]} · {entry ? timeAgo(entry.readAt, t) : ''}</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600">{t('openLink')}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
              {history.length > 0 && (
                <div className="mt-4 flex justify-end">
                  {confirmClearHistoryVisible ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-fg">{t('confirmClearHistory')}</span>
                      <button
                        type="button"
                        onClick={() => { clearHistory(); setConfirmClearHistoryVisible(false); }}
                        className="font-bold text-red-600 transition-colors hover:text-red-700"
                      >
                        {t('confirmYes')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClearHistoryVisible(false)}
                        className="text-muted-fg transition-colors hover:text-foreground/80"
                      >
                        {t('confirmCancel')}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClearHistoryVisible(true)}
                      className="text-xs text-muted-fg transition-colors hover:text-red-500"
                    >
                      {t('clearHistory')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="rounded-[28px] border border-border bg-card/90 p-4 shadow-sm sm:p-6">
          <SectionHeader title={t('recommendedTitle')} subtitle={t('recommendedSub')} badge={recommendedArticles.length} />
          {recommendedArticles.length === 0 && interests.length === 0 ? (
            <EmptyState
              icon="✨"
              text={t('noRecommendedYet')}
              action={
                <Link href="/dashboard/onboarding" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-500">
                  {t('chooseInterests')}
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recommendedArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-border bg-card/90 p-4 shadow-sm sm:p-6">
            <SectionHeader title={t('myInterestsTitle')} subtitle={t('myInterestsSub')} />
            <div className="flex flex-wrap gap-2">
              {INTEREST_ORDER.map((interest) => {
                const meta = INTEREST_META[interest];
                const active = isActive(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-150 ${active
                      ? 'border-emerald-300 bg-emerald-600 text-white shadow-sm'
                      : 'border-border bg-background text-foreground/80 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
            {interestsLoaded && interests.length > 0 && (
              <p className="mt-3 text-[11px] text-emerald-600">
                ✓ {t('personalizationActive', { count: interests.length })}
              </p>
            )}
          </section>

          <section className="rounded-[28px] border border-border bg-card/90 p-4 shadow-sm sm:p-6">
            <SectionHeader title={t('quickAccessTitle')} subtitle={t('quickAccessSub')} />
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/studies' as Route, icon: '📚', label: t('allStudies') },
                { href: '/database' as Route, icon: '🗄', label: t('database') },
                { href: '/tools' as Route, icon: '🛠', label: t('tools') },
                { href: '/status' as Route, icon: '🟢', label: t('status') },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col items-center gap-2 rounded-3xl border border-border bg-background/70 px-4 py-5 text-center transition-all duration-150 hover:border-emerald-200 hover:bg-emerald-50/40"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[13px] font-semibold text-foreground/80 transition-colors group-hover:text-emerald-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
        </div>{/* /secondary */}
      </div>
    </main>
  );
}