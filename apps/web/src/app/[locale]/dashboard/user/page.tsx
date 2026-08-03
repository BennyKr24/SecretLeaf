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
import { useGrowState } from '@/hooks/useGrowState';
import { useGrowLog } from '@/hooks/useGrowLog';
import { getUpcomingTasks, getOverdueTasks, getTaskProgress, getPhaseForDay } from '@/lib/grow/planGenerator';
import { PHASE_ICONS } from '@/lib/grow/phases';
import { TASK_CATEGORY_ICONS } from '@/lib/grow/types';
import {
  Bookmark, BookOpen, Flame, Zap, Sprout, AlertTriangle, CheckCircle2, Clock,
  NotebookPen, Wrench, Stethoscope, Target, Library, Database, Activity,
  Sparkles, Settings, LogOut, ChevronDown, ChevronUp, ArrowRight, Bell, Mail,
  TrendingUp, History, type LucideIcon,
} from 'lucide-react';

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

// ── Shared tile primitives ──────────────────────────────────────────────
// Every tile on this dashboard uses the same restrained card language as
// the rest of the product (StudyListItem, AuthBenefits): bg-card/border-border
// tokens, a small icon badge, rounded-xl — not the ad-hoc pastel gradients
// this page used to have.

function TileIcon({ icon: Icon, accent }: { icon: LucideIcon; accent: string }) {
  return (
    <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background ${accent}`}>
      <Icon className="h-4 w-4" strokeWidth={2} />
    </span>
  );
}

function Tile({
  icon, accent = 'text-emerald-600', title, subtitle, badge, className = '', bodyClassName = '', children,
}: {
  icon: LucideIcon;
  accent?: string;
  title: string;
  subtitle?: string;
  badge?: number | string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`flex flex-col rounded-xl border border-border bg-card p-4 sm:p-5 ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <TileIcon icon={icon} accent={accent} />
          <div className="min-w-0">
            <h2 className="text-[13px] font-bold leading-snug text-foreground sm:text-sm">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[11px] text-muted-fg sm:text-xs">{subtitle}</p>}
          </div>
        </div>
        {badge !== undefined && badge !== 0 && badge !== '0' && (
          <span className="flex-shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
            {badge}
          </span>
        )}
      </div>
      <div className={`flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

function TileEmpty({ icon: Icon, text, action }: { icon: LucideIcon; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-lg border border-dashed border-border px-4 py-6 text-center">
      <Icon className="h-5 w-5 text-muted-fg" strokeWidth={1.75} />
      <p className="max-w-[26ch] text-xs text-muted-fg">{text}</p>
      {action}
    </div>
  );
}

function ShowMoreButton({ expanded, hiddenCount, onToggle, t }: { expanded: boolean; hiddenCount: number; onToggle: () => void; t: TFn }) {
  if (hiddenCount <= 0 && !expanded) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold text-muted-fg transition-colors hover:text-emerald-600"
    >
      {expanded ? (
        <>{t('showLess')} <ChevronUp className="h-3 w-3" /></>
      ) : (
        <>+{hiddenCount} {t('showMore')} <ChevronDown className="h-3 w-3" /></>
      )}
    </button>
  );
}

function ArticleRow({ article, right }: { article: TerpiraArticle; right?: React.ReactNode }) {
  const t = useTranslations('dashboard');
  return (
    <Link
      href={`/studies/${article.slug}` as Route}
      className="group -mx-2 flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-background"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-semibold text-foreground group-hover:text-emerald-600">{article.title}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-fg">
          {categoryLabels[article.category]} · {article.readMinutes} {t('minReadTime')}
        </p>
      </div>
      {right ?? <BookmarkButton slug={article.slug} size="sm" className="flex-shrink-0" />}
    </Link>
  );
}

/** Caps a list to `max` items and reports how many are hidden; expand shows all. */
function useExpandableList<T>(items: T[], max: number) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, max);
  const hiddenCount = Math.max(0, items.length - max);
  return { visible, hiddenCount, expanded, toggle: () => setExpanded((v) => !v) };
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
    const timer = setTimeout(() => {
      const raw = localStorage.getItem('secretleaf.last_visit');
      if (raw) setLastVisit(new Date(raw));
      localStorage.setItem('secretleaf.last_visit', new Date().toISOString());
    }, 0);
    return () => clearTimeout(timer);
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

  const savedList = useExpandableList(bookmarkedArticles, 3);
  const recommendedList = useExpandableList(recommendedArticles, 3);
  const continueList = useExpandableList(continueReading, 3);
  const historyList = useExpandableList(historyArticles, 3);
  const [digestTab, setDigestTab] = useState<'new' | 'important' | 'trending'>('new');

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
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {greeting()}{session ? `, ${session.user.username}` : ''}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground/80">
                  <Flame className="h-3 w-3 text-amber-500" strokeWidth={2.5} /> {readingStreak > 0 ? t('streakBadge', { count: readingStreak }) : t('streakStart')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground/80">
                  <Zap className="h-3 w-3 text-emerald-500" strokeWidth={2.5} /> {t('activityBadge', { score: activityScore })}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground/80">
                  <Bookmark className="h-3 w-3 text-sky-500" strokeWidth={2.5} /> {bookmarks.length} {t('metricSaved')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground/80">
                  <BookOpen className="h-3 w-3 text-violet-500" strokeWidth={2.5} /> {history.length} {t('metricRead')}
                </span>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
              {session?.user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:border-emerald-500/30 hover:text-emerald-600"
                >
                  <Settings className="h-3.5 w-3.5" strokeWidth={2} /> {t('adminLink')}
                </Link>
              )}
              <button
                type="button"
                onClick={() => void (async () => { await logoutFromSupabase(); router.push('/'); })()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:border-rose-500/30 hover:text-rose-500"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={2} /> {t('logoutBtn')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-5">

        {/* ── Grow alert banner (only when something needs attention) ── */}
        {activeGrow && alertCount > 0 && (
          <Link
            href={`/grow/${activeGrow.id}` as Route}
            className="mb-4 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 transition hover:bg-rose-500/15"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-500" strokeWidth={2.25} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-rose-500">{t('alertPlants', { count: alertCount })}</p>
              <p className="text-[11px] text-rose-500/70">{t('alertGotoGrow')}</p>
            </div>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-rose-500/60" strokeWidth={2.5} />
          </Link>
        )}

        {/* ── Tile grid: everything at a glance, no full-page scroll sections ── */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {/* Grow status — the primary daily-use tile, spans 2 columns */}
          {activeGrow ? (
            <section className="flex flex-col rounded-xl border border-emerald-500/25 bg-card p-4 sm:p-5 md:col-span-2">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <TileIcon icon={Sprout} accent="text-emerald-600" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{t('activeGrowEyebrow')}</p>
                    <h2 className="text-sm font-bold text-foreground">{activeGrow.name}</h2>
                  </div>
                </div>
                <Link
                  href={`/grow/${activeGrow.id}` as Route}
                  className="flex-shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-500/20"
                >
                  {t('openBtn')}
                </Link>
              </div>

              {(() => {
                const phase = activeGrow.plan.phases.find((p) => p.id === activeGrow.currentPhaseId)
                  ?? getPhaseForDay(activeGrow.plan, activeGrow.currentDay);
                const { completed, total, percent } = getTaskProgress(activeGrow);
                const phaseProgress = activeGrow.plan.totalDays > 0
                  ? Math.min(100, Math.round((activeGrow.currentDay / activeGrow.plan.totalDays) * 100))
                  : 0;
                return (
                  <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="flex items-center gap-1 text-foreground/80">
                      {phase ? PHASE_ICONS[phase.id] : '🌿'}
                      <span className="font-medium">{phase?.label ?? '—'}</span>
                    </span>
                    <span className="text-muted-fg">·</span>
                    <span className="text-muted-fg">{t('growDayProgress', { current: activeGrow.currentDay, total: activeGrow.plan.totalDays })}</span>
                    <span className="text-muted-fg">·</span>
                    <span className="text-muted-fg">{t('growTaskProgress', { done: completed, total, percent })}</span>
                    <div className="mt-1.5 w-full">
                      <div className="h-1.5 overflow-hidden rounded-full bg-border">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${phaseProgress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  {(() => {
                    const overdue = getOverdueTasks(activeGrow);
                    const tasks = getUpcomingTasks(activeGrow, 2);
                    return (
                      <div className="space-y-1.5">
                        {overdue.length > 0 && (
                          <div className="flex items-center gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-2.5 py-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-rose-500" strokeWidth={2.25} />
                            <p className="text-[11px] font-semibold text-rose-500">{t('overdueTasks', { count: overdue.length })}</p>
                          </div>
                        )}
                        {tasks.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-border py-3 text-center text-[11px] text-muted-fg">{t('allTasksDone')}</p>
                        ) : (
                          tasks.map((task) => {
                            const diff = task.dueDay - activeGrow.currentDay;
                            const dueLbl = diff === 0 ? t('taskDueToday') : diff === 1 ? t('taskDueTomorrow') : diff < 0 ? t('taskOverdue', { days: Math.abs(diff) }) : t('taskInDays', { days: diff });
                            return (
                              <div key={task.id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
                                <span className="flex-shrink-0 text-sm">{TASK_CATEGORY_ICONS[task.category]}</span>
                                <p className="flex-1 truncate text-[12px] font-medium text-foreground">{task.title}</p>
                                <span className={`flex-shrink-0 text-[10px] font-semibold ${diff < 0 ? 'text-rose-500' : diff === 0 ? 'text-emerald-600' : 'text-muted-fg'}`}>{dueLbl}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="flex flex-col gap-2">
                  <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${hasTodayEntry ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-amber-500/25 bg-amber-500/10'}`}>
                    {hasTodayEntry ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" strokeWidth={2.25} /> : <Clock className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" strokeWidth={2.25} />}
                    <p className={`text-[11px] font-semibold ${hasTodayEntry ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {hasTodayEntry ? t('dailyDone') : t('dailyMissing')}
                    </p>
                  </div>
                  <Link
                    href={`/grow/${activeGrow.id}` as Route}
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-[0.98]"
                  >
                    <NotebookPen className="h-3.5 w-3.5" strokeWidth={2.25} />
                    {t('todayLogCTA')}
                  </Link>
                  <div className="flex gap-2">
                    <Link href={'/tools' as Route} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] font-semibold text-muted-fg transition hover:border-cyan-500/30 hover:text-cyan-500">
                      <Wrench className="h-3 w-3" strokeWidth={2} /> {t('tools')}
                    </Link>
                    <Link href={'/diagnose' as Route} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] font-semibold text-muted-fg transition hover:border-violet-500/30 hover:text-violet-500">
                      <Stethoscope className="h-3 w-3" strokeWidth={2} /> {t('diagnoseLink')}
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-500/30 bg-card p-5 text-center md:col-span-2">
              <Sprout className="h-6 w-6 text-emerald-600" strokeWidth={1.75} />
              <h2 className="mt-2 text-sm font-bold text-foreground">{t('noActiveGrowTitle')}</h2>
              <p className="mt-1 text-xs text-muted-fg">{t('noActiveGrowSub')}</p>
              <Link href={'/start' as Route} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500">
                <Sprout className="h-3.5 w-3.5" strokeWidth={2} /> {t('startGrowCTA')}
              </Link>
            </section>
          )}

          {/* Reading stats — streak, activity, recently viewed */}
          <Tile icon={TrendingUp} accent="text-amber-500" title={t('streakActivityTitle')} subtitle={t('streakActivitySub')}>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">{t('readingStreakLabel')}</p>
                <p className="mt-1 text-xl font-bold text-foreground">{readingStreak}</p>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">{t('activityScoreLabel')}</p>
                <p className="mt-1 text-xl font-bold text-foreground">{activityScore}</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-fg">{t('recentlyViewed')}</p>
              {historyArticles.length === 0 ? (
                <p className="text-xs text-muted-fg">{t('noReadHistory')}</p>
              ) : (
                <div className="-mt-1">
                  {historyList.visible.map((article) => {
                    const entry = history.find((item) => item.slug === article.slug);
                    return <ArticleRow key={article.slug} article={article} right={<span className="flex-shrink-0 text-[10px] text-muted-fg">{entry ? timeAgo(entry.readAt, t) : ''}</span>} />;
                  })}
                  <ShowMoreButton expanded={historyList.expanded} hiddenCount={historyList.hiddenCount} onToggle={historyList.toggle} t={t} />
                </div>
              )}
              {history.length > 0 && (
                <div className="mt-2 flex justify-end">
                  {confirmClearHistoryVisible ? (
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-muted-fg">{t('confirmClearHistory')}</span>
                      <button type="button" onClick={() => { clearHistory(); setConfirmClearHistoryVisible(false); }} className="font-bold text-rose-500 hover:text-rose-400">{t('confirmYes')}</button>
                      <button type="button" onClick={() => setConfirmClearHistoryVisible(false)} className="text-muted-fg hover:text-foreground/80">{t('confirmCancel')}</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setConfirmClearHistoryVisible(true)} className="text-[11px] text-muted-fg hover:text-rose-500">{t('clearHistory')}</button>
                  )}
                </div>
              )}
            </div>
          </Tile>

          {/* Notifications — new since last visit + interest matches */}
          <Tile icon={Bell} accent="text-sky-500" title={t('smartNotificationsTitle')} subtitle={t('smartNotificationsSub')} badge={newSinceLastVisit.length + interestMatches.length}>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">{t('newSinceLastVisit')}</p>
                  <span className="text-[10px] font-bold text-muted-fg">{newSinceLastVisit.length}</span>
                </div>
                {newSinceLastVisit.length === 0 ? (
                  <p className="text-xs text-muted-fg">{t('noNewUpdates')}</p>
                ) : (
                  newSinceLastVisit.slice(0, 2).map((article) => <ArticleRow key={article.slug} article={article} />)
                )}
              </div>
              <div className="border-t border-border pt-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-600">{t('fitsYourInterests')}</p>
                  <span className="text-[10px] font-bold text-muted-fg">{interestMatches.length}</span>
                </div>
                {interestMatches.length === 0 ? (
                  <TileEmpty
                    icon={Target}
                    text={interests.length === 0 ? t('noInterestsYet') : t('noInterestMatch')}
                    action={interests.length === 0 ? (
                      <Link href="/dashboard/onboarding" className="rounded-lg bg-sky-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-sky-500">{t('chooseInterests')}</Link>
                    ) : undefined}
                  />
                ) : (
                  interestMatches.slice(0, 2).map((article) => <ArticleRow key={article.slug} article={article} />)
                )}
              </div>
            </div>
          </Tile>

          {/* Continue reading */}
          <Tile icon={History} accent="text-violet-500" title={t('continueReadingTitle')} subtitle={t('continueReadingSub')} badge={continueReading.length}>
            {continueReading.length === 0 ? (
              <TileEmpty
                icon={History}
                text={t('noProgressYet')}
                action={<Link href="/studies" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500">{t('discoverStudies')}</Link>}
              />
            ) : (
              <div>
                {continueList.visible.map(({ article, entry }) => (
                  <ArticleRow
                    key={article.slug}
                    article={article}
                    right={<span className="flex-shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">{entry.progress}%</span>}
                  />
                ))}
                <ShowMoreButton expanded={continueList.expanded} hiddenCount={continueList.hiddenCount} onToggle={continueList.toggle} t={t} />
              </div>
            )}
          </Tile>

          {/* Saved studies */}
          <Tile icon={Bookmark} accent="text-sky-500" title={t('savedStudiesTitle')} subtitle={t('savedStudiesSub')} badge={bookmarkedArticles.length}>
            {bookmarkedArticles.length === 0 ? (
              <TileEmpty
                icon={Bookmark}
                text={t('noBookmarksYet')}
                action={<Link href="/studies" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500">{t('discoverStudies')}</Link>}
              />
            ) : (
              <div>
                {savedList.visible.map((article) => <ArticleRow key={article.slug} article={article} />)}
                <ShowMoreButton expanded={savedList.expanded} hiddenCount={savedList.hiddenCount} onToggle={savedList.toggle} t={t} />
              </div>
            )}
          </Tile>

          {/* Recommended */}
          <Tile icon={Sparkles} accent="text-fuchsia-500" title={t('recommendedTitle')} subtitle={t('recommendedSub')} badge={recommendedArticles.length}>
            {recommendedArticles.length === 0 && interests.length === 0 ? (
              <TileEmpty
                icon={Sparkles}
                text={t('noRecommendedYet')}
                action={<Link href="/dashboard/onboarding" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500">{t('chooseInterests')}</Link>}
              />
            ) : (
              <div>
                {recommendedList.visible.map((article) => <ArticleRow key={article.slug} article={article} />)}
                <ShowMoreButton expanded={recommendedList.expanded} hiddenCount={recommendedList.hiddenCount} onToggle={recommendedList.toggle} t={t} />
              </div>
            )}
          </Tile>

          {/* Weekly digest — tabbed instead of 3 stacked columns */}
          <Tile icon={Mail} accent="text-rose-500" title={t('weeklyDigestTitle')} subtitle={t('weeklyDigestSub')}>
            <div className="mb-2 flex gap-1 rounded-lg border border-border bg-background p-0.5">
              {([
                ['new', t('newGrowStudies')],
                ['important', t('importantThisWeek')],
                ['trending', t('trendingTopics')],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDigestTab(key)}
                  className={`flex-1 rounded-md px-2 py-1 text-[10.5px] font-semibold transition-colors ${digestTab === key ? 'bg-card text-emerald-600 shadow-sm' : 'text-muted-fg hover:text-foreground/80'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {digestTab === 'new' && (
              <div>{digest.newGrowStudies.slice(0, 3).map((article) => <ArticleRow key={article.slug} article={article} />)}</div>
            )}
            {digestTab === 'important' && (
              <div>{digest.importantThisWeek.slice(0, 3).map((article) => <ArticleRow key={article.slug} article={article} />)}</div>
            )}
            {digestTab === 'trending' && (
              <div className="space-y-2">
                {digest.trendingTopics.slice(0, 3).map((topic) => (
                  <Link key={topic.label} href={`/studies/${topic.sampleArticle.slug}` as Route} className="block rounded-lg border border-border bg-background px-3 py-2 transition hover:border-rose-500/30">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-bold text-foreground">{topic.label}</p>
                      <span className="flex-shrink-0 rounded-full border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold text-rose-500">+{topic.momentum}</span>
                    </div>
                    <p className="mt-0.5 text-[10.5px] text-muted-fg">{t('relevantArticles', { count: topic.articleCount })}</p>
                  </Link>
                ))}
              </div>
            )}
          </Tile>

          {/* Interests + quick access, combined into one small tile */}
          <Tile icon={Target} accent="text-teal-500" title={t('myInterestsTitle')} subtitle={t('myInterestsSub')}>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_ORDER.map((interest) => {
                const meta = INTEREST_META[interest];
                const active = isActive(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${active ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600' : 'border-border bg-background text-foreground/70 hover:border-emerald-500/30 hover:text-emerald-600'}`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
            {interestsLoaded && interests.length > 0 && (
              <p className="mt-2 text-[10.5px] text-emerald-600">✓ {t('personalizationActive', { count: interests.length })}</p>
            )}

            <div className="mt-3 border-t border-border pt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-fg">{t('quickAccessTitle')}</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { href: '/studies' as Route, icon: Library, label: t('allStudies') },
                  { href: '/database' as Route, icon: Database, label: t('database') },
                  { href: '/tools' as Route, icon: Wrench, label: t('tools') },
                  { href: '/status' as Route, icon: Activity, label: t('status') },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="group flex flex-col items-center gap-1 rounded-lg border border-border bg-background px-1 py-2.5 text-center transition-colors hover:border-emerald-500/30">
                    <item.icon className="h-4 w-4 text-muted-fg transition-colors group-hover:text-emerald-600" strokeWidth={1.75} />
                    <span className="text-[9.5px] font-semibold leading-tight text-foreground/70 group-hover:text-emerald-600">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </Tile>

        </div>
      </div>
    </main>
  );
}
