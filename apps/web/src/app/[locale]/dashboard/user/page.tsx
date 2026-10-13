'use client';

import { Link, useRouter } from '@/i18n/navigation';
import type { Route } from 'next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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
import { PremiumScrollFx } from '@/components/scroll/PremiumScrollFx';
import { useGrowState } from '@/hooks/useGrowState';
import { useGrowLog } from '@/hooks/useGrowLog';
import { getUpcomingTasks, getOverdueTasks, getTaskProgress, getPhaseForDay } from '@/lib/grow/planGenerator';
import { TASK_CATEGORY_ICONS } from '@/lib/grow/taskIcons';
import { LOG_ENTRY_TYPE_LABELS, TRAINING_METHOD_LABELS } from '@/lib/grow/types';
import {
  Sprout, AlertTriangle, CheckCircle2, Wrench, Stethoscope, Library, Database, Activity,
  Settings, LogOut, ChevronDown, ChevronUp, ArrowRight, NotebookPen,
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

/** Absolute grow day (1-indexed) of an ISO date, relative to the grow start. */
function growDayOf(isoDate: string, startDate: string): number {
  return Math.floor((new Date(isoDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1;
}

/** Epoch ms of the start of the trailing `days` window. */
function windowStart(days: number): number {
  return Date.now() - days * 86_400_000;
}

const INTEREST_ORDER = Object.keys(INTEREST_META) as Interest[];
const METRIC_WINDOW_DAYS = 14;

// ── App-surface primitives (DESIGN_SYSTEM.md §24) ───────────────────────
// 6px radius, 1px lines instead of shadows, JetBrains Mono for values and
// small caps labels. Primary green only for one action per area and for
// "ok" status; amber only for real priority.

const LABEL = 'font-mono text-[11px] uppercase tracking-[0.08em] text-muted-fg';
const PANEL = 'rounded-app border border-border bg-card';
const BTN_BASE = 'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-app px-3.5 text-[13px] transition active:scale-[0.97] motion-reduce:transform-none';
const BTN_PRIMARY = `${BTN_BASE} bg-primary font-bold text-white hover:bg-primary-dark`;
const BTN_GHOST = `${BTN_BASE} border border-foreground/15 font-semibold text-foreground hover:bg-background`;
const BTN_QUIET = `${BTN_BASE} font-semibold text-muted-fg hover:text-foreground`;
const TEXT_LINK = 'font-mono text-[11px] uppercase tracking-[0.08em] text-foreground underline underline-offset-[3px] transition-colors hover:text-primary';

function Section({
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
  const headingClass = 'font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-foreground';
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
function Invite({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2.5 p-4">
      <p className="w-full rounded-[3px] border border-dashed border-foreground/15 p-2.5 text-xs leading-relaxed text-muted-fg">{text}</p>
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

function ArticleRow({ article, right }: { article: TerpiraArticle; right?: React.ReactNode }) {
  const t = useTranslations('dashboard');
  return (
    <Link
      href={`/studies/${article.slug}` as Route}
      className="group flex items-center gap-3 border-b border-border px-4 py-2.5 transition-colors last:border-b-0 hover:bg-background"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-foreground group-hover:text-primary">{article.title}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-fg">
          {categoryLabels[article.category]} · <span className="font-mono tabular-nums">{article.readMinutes}</span> {t('minReadTime')}
        </p>
      </div>
      {right ?? <BookmarkButton slug={article.slug} size="sm" className="flex-shrink-0" />}
    </Link>
  );
}

/** Minimal trend line for a metric cell. Rendered only with ≥2 real values. */
function Sparkline({ values }: { values: number[] }) {
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
  const locale = useLocale();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmClearHistoryVisible, setConfirmClearHistoryVisible] = useState(false);
  const [lastVisit, setLastVisit] = useState<Date | null>(null);

  const { bookmarks } = useBookmarks();
  const { history, clearHistory } = useReadingHistory();
  const { grows, activeGrow, setActiveGrowId, completeTask, advancePhase } = useGrowState();
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

  // ── Grow cockpit data (read-only views over existing grow state/log) ──
  const overdueTasks = useMemo(() => (activeGrow ? getOverdueTasks(activeGrow) : []), [activeGrow]);

  // Overdue tasks whose plan phase already ended are noise for "today"
  // (e.g. "soak seeds" on day 55). They're grouped into one quiet row
  // instead of crowding out the tasks that matter now.
  const { currentTasks, staleTasks } = useMemo(() => {
    if (!activeGrow) return { currentTasks: [], staleTasks: [] };
    const phaseEnd = new Map(activeGrow.plan.phases.map((p) => [p.id, p.endDay]));
    const isStale = (task: (typeof overdueTasks)[number]) => (phaseEnd.get(task.phaseId) ?? Infinity) < activeGrow.currentDay;
    return {
      currentTasks: [...overdueTasks.filter((task) => !isStale(task)), ...getUpcomingTasks(activeGrow, 3)],
      staleTasks: overdueTasks.filter(isStale),
    };
  }, [activeGrow, overdueTasks]);

  const growMetrics = useMemo(() => {
    const cutoff = windowStart(METRIC_WINDOW_DAYS);
    const inWindow = growEntries.filter((e) => new Date(e.date).getTime() >= cutoff);
    const ecEntries = growEntries.filter((e) => e.data.type === 'duenger' && e.data.ec != null);
    const phEntries = growEntries.filter((e) => e.data.type === 'wasser' && e.data.ph != null);
    const series = (list: typeof growEntries, pick: (e: (typeof growEntries)[number]) => number | undefined) => list
      .filter((e) => new Date(e.date).getTime() >= cutoff)
      .map(pick)
      .filter((v): v is number => v != null)
      .reverse();
    return {
      ec: ecEntries[0] ?? null,
      ecSeries: series(ecEntries, (e) => (e.data.type === 'duenger' ? e.data.ec : undefined)),
      ph: phEntries[0] ?? null,
      phSeries: series(phEntries, (e) => (e.data.type === 'wasser' ? e.data.ph : undefined)),
      lastWater: growEntries.find((e) => e.data.type === 'wasser') ?? null,
      entriesInWindow: inWindow.length,
    };
  }, [growEntries]);

  // Timeline shows what the grower *did* (the header already shows phases)
  // plus the harvest window = late flower through harvest.
  const timeline = useMemo(() => {
    if (!activeGrow || activeGrow.plan.totalDays <= 0) return null;
    const total = activeGrow.plan.totalDays;
    const pos = (day: number) => Math.min(100, Math.max(0, ((day - 1) / total) * 100));
    const trainings: { key: string; left: number; title: string }[] = [];
    const care: { key: string; left: number; title: string }[] = [];
    for (const e of growEntries) {
      const day = growDayOf(e.date, activeGrow.startDate);
      if (e.data.type === 'training') {
        trainings.push({ key: e.id, left: pos(day), title: `${t('timelineDay', { day })} · ${TRAINING_METHOD_LABELS[e.data.methode]}` });
      } else if (e.data.type === 'wasser' || e.data.type === 'duenger') {
        care.push({ key: e.id, left: pos(day), title: `${t('timelineDay', { day })} · ${LOG_ENTRY_TYPE_LABELS[e.data.type]}` });
      }
    }
    const late = activeGrow.plan.phases.find((p) => p.id === 'spaetbluete');
    const ernte = activeGrow.plan.phases.find((p) => p.id === 'ernte');
    const from = late?.startDay ?? ernte?.startDay;
    const to = ernte?.endDay ?? late?.endDay;
    return {
      total,
      today: pos(activeGrow.currentDay),
      trainings,
      care,
      harvest: from != null && to != null ? { from, to, left: pos(from), width: Math.max(1, pos(to) - pos(from)) } : null,
    };
  }, [activeGrow, growEntries, t]);

  const activeGrows = useMemo(
    () => grows.filter((g) => g.status === 'aktiv' || g.id === activeGrow?.id),
    [grows, activeGrow?.id],
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const num = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);

  const taskList = useExpandableList(currentTasks, 3);
  const [staleOpen, setStaleOpen] = useState(false);
  // Mobile (< lg): the page splits into three tabs instead of one endless
  // column. Desktop ignores this and shows everything side by side.
  const [mobileTab, setMobileTab] = useState<'today' | 'grow' | 'knowledge'>('today');
  const tabsAnchor = useRef<HTMLDivElement>(null);
  const vis = (tab: typeof mobileTab) => (mobileTab === tab ? '' : 'max-lg:hidden');
  const switchTab = (tab: typeof mobileTab) => {
    setMobileTab(tab);
    // If the tab bar is already stuck under the nav, jump back to its top so
    // the new tab starts at its first item instead of mid-page.
    const anchor = tabsAnchor.current;
    if (!anchor) return;
    const offset = anchor.getBoundingClientRect().top - 60;
    if (offset < 0) window.scrollTo({ top: window.scrollY + offset });
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
          <svg className="h-6 w-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-muted-fg">{t('loading')}</p>
        </div>
      </main>
    );
  }

  const phase = activeGrow
    ? activeGrow.plan.phases.find((p) => p.id === activeGrow.currentPhaseId) ?? getPhaseForDay(activeGrow.plan, activeGrow.currentDay)
    : null;
  // Phase the plan expects for today — when the stored phase lags behind it,
  // offer the existing "advance phase" shortcut instead of piling up overdue tasks.
  const planPhase = activeGrow ? getPhaseForDay(activeGrow.plan, activeGrow.currentDay) : null;
  const phaseLagging = Boolean(
    activeGrow && phase && planPhase && planPhase.id !== phase.id
    && activeGrow.plan.phases.indexOf(planPhase) > activeGrow.plan.phases.indexOf(phase),
  );
  const taskProgress = activeGrow ? getTaskProgress(activeGrow) : null;
  const logHref = activeGrow ? (`/grow/${activeGrow.id}/log` as Route) : ('/start' as Route);

  const renderTask = (task: (typeof currentTasks)[number], primary: boolean, highlight: boolean) => {
    if (!activeGrow) return null;
    const diff = task.dueDay - activeGrow.currentDay;
    const dueLbl = diff === 0 ? t('taskDueToday') : diff === 1 ? t('taskDueTomorrow') : diff < 0 ? t('taskOverdue', { days: Math.abs(diff) }) : t('taskInDays', { days: diff });
    const CategoryIcon = TASK_CATEGORY_ICONS[task.category];
    return (
      <article key={task.id} className="grid grid-cols-[3px_minmax(0,1fr)] gap-x-4 border-b border-border py-4 pr-4 last:border-b-0 sm:grid-cols-[3px_minmax(0,1fr)_auto]">
        <span className={`rounded-r-[2px] ${highlight ? 'bg-amber-500' : 'bg-foreground/15'}`} />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-foreground">{task.title}</p>
          {task.description && <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-muted-fg">{task.description}</p>}
          <p className={`mt-2 flex items-center gap-1.5 ${LABEL} ${highlight ? 'text-amber-500' : diff === 0 ? 'text-foreground' : ''}`}>
            <CategoryIcon className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="tabular-nums">{dueLbl}</span>
          </p>
        </div>
        <div className="col-start-2 mt-3 flex gap-1.5 sm:col-start-3 sm:mt-0 sm:self-center">
          <button type="button" onClick={() => completeTask(activeGrow.id, task.id)} className={primary ? BTN_PRIMARY : BTN_GHOST}>
            {t('taskDone')}
          </button>
        </div>
      </article>
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <PremiumScrollFx />

      {/* ── Header: grow identity, day, phase track, one action ─────────── */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 pb-5 pt-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 flex-[1_1_480px]">
              <p className={LABEL}>
                {greeting()}{session && <>, <span className="text-foreground">{session.user.username}</span></>}
              </p>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
                <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.015em] text-foreground">
                  {activeGrow ? activeGrow.name : t('noActiveGrowTitle')}
                </h1>
                {activeGrow && (
                  <>
                    <span className="font-mono text-[22px] tabular-nums text-muted-fg">
                      {t('growDayProgress', { current: activeGrow.currentDay, total: activeGrow.plan.totalDays })}
                    </span>
                    {phase && <span className={LABEL}>{phase.label}</span>}
                  </>
                )}
              </div>

              {activeGrow && activeGrow.plan.phases.length > 0 && (
                <div
                  className="mt-3 grid max-w-[620px] gap-[3px]"
                  style={{ gridTemplateColumns: activeGrow.plan.phases.map((p) => `minmax(clamp(1.25rem, 8vw, 4.75rem), ${Math.max(1, p.endDay - p.startDay + 1)}fr)`).join(' ') }}
                  aria-label={phase ? `${t('growDayProgress', { current: activeGrow.currentDay, total: activeGrow.plan.totalDays })} · ${phase.label}` : undefined}
                >
                  {activeGrow.plan.phases.map((p, i, all) => {
                    // Same source of truth as the phase label above (currentPhaseId), so bar and label never disagree.
                    const currentIndex = all.findIndex((x) => x.id === phase?.id);
                    const done = i < currentIndex;
                    const now = i === currentIndex;
                    const fill = now ? Math.min(100, Math.max(0, Math.round(((activeGrow.currentDay - p.startDay + 1) / (p.endDay - p.startDay + 1)) * 100))) : 0;
                    return (
                      <div key={p.id} className="flex min-w-0 flex-col gap-[5px]">
                        <div
                          className={`h-[3px] rounded-[2px] ${done ? 'bg-primary-dark' : 'bg-border'}`}
                          style={now ? { background: `linear-gradient(90deg, rgb(var(--primary-rgb)) 0 ${fill}%, rgb(var(--line-rgb)) ${fill}% 100%)` } : undefined}
                        />
                        <span title={p.label} className={`truncate font-mono text-[10px] max-sm:hidden uppercase tracking-[0.08em] ${now ? 'text-foreground' : 'text-muted-fg'}`}>{p.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeGrow && phaseLagging && planPhase && (
                <p className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 ${LABEL}`}>
                  <span>{t('phasePlanHint', { phase: planPhase.label })}</span>
                  <button type="button" onClick={() => advancePhase(activeGrow.id, planPhase.id)} className={TEXT_LINK}>
                    {t('phaseSwitchCta')}
                  </button>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeGrow && (
                <>
                  <span className={`${LABEL} ${hasTodayEntry ? 'text-primary' : 'max-lg:hidden'}`}>
                    {hasTodayEntry ? t('dailyDone') : t('dailyMissing')}
                  </span>
                  <Link href={logHref} className={hasTodayEntry ? BTN_GHOST : BTN_PRIMARY}>
                    <NotebookPen className="h-3.5 w-3.5" strokeWidth={2.25} /> {t('logEntryCta')}
                  </Link>
                </>
              )}
              {session?.user.role === 'ADMIN' && (
                <Link href="/dashboard/admin" className={BTN_QUIET}>
                  <Settings className="h-3.5 w-3.5" strokeWidth={2} /> {t('adminLink')}
                </Link>
              )}
              <button
                type="button"
                onClick={() => void (async () => { await logoutFromSupabase(); router.push('/'); })()}
                className={`${BTN_QUIET} hover:text-rose-500 max-lg:hidden`}
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={2} /> {t('logoutBtn')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile tab bar (sticky under the 60px nav) ─────────────────── */}
      <div ref={tabsAnchor} aria-hidden="true" className="lg:hidden" />
      <div className="sticky top-[calc(60px+env(safe-area-inset-top))] z-30 border-b border-border bg-background/95 backdrop-blur lg:hidden">
        <div role="tablist" aria-label={t('title')} className="mx-auto flex max-w-6xl gap-1 px-4 py-2 sm:px-6">
          {([
            ['today', t('tabToday'), currentTasks.length],
            ['grow', t('tabGrow'), 0],
            ['knowledge', t('knowledgeTitle'), 0],
          ] as const).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mobileTab === key}
              onClick={() => switchTab(key)}
              className={`flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-app border font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${mobileTab === key ? 'border-foreground/15 bg-card text-foreground' : 'border-transparent text-muted-fg'}`}
            >
              {label}
              {count > 0 && <span className="tabular-nums text-muted-fg">· {count}</span>}
              {key === 'today' && alertCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-label={t('alertPlants', { count: alertCount })} />}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-6 sm:px-6">

        {/* ════ Cockpit: everything about the active grow ═══════════════ */}
        <div className={`grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] ${mobileTab === 'knowledge' ? 'max-lg:hidden' : ''}`}>

          <div className="flex min-w-0 flex-col gap-6">
            {activeGrow && taskProgress ? (
              <>
                {/* Als Nächstes */}
                <Section
                  className={vis('today')}
                  title={t('nextUpTitle')}
                  count={currentTasks.length}
                  aside={(
                    <span className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${LABEL}`}>
                      {alertCount > 0 && (
                        <Link href={`/grow/${activeGrow.id}` as Route} className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.25} />
                          {t('alertPlants', { count: alertCount })}
                          <ArrowRight className="h-3 w-3" strokeWidth={2} />
                        </Link>
                      )}
                      <span className="tabular-nums">{t('growTaskProgress', { done: taskProgress.completed, total: taskProgress.total, percent: taskProgress.percent })}</span>
                    </span>
                  )}
                >
                  <div className={PANEL}>
                    {currentTasks.length === 0 ? (
                      <p className="flex items-center gap-2 border-b border-border px-4 py-4 text-sm text-muted-fg last:border-b-0">
                        <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={2} /> {t('allTasksDone')}
                      </p>
                    ) : (
                      <>
                        {taskList.visible.map((task, index) => renderTask(task, index === 0, index === 0 && task.dueDay < activeGrow.currentDay))}
                        <ShowMoreButton expanded={taskList.expanded} hiddenCount={taskList.hiddenCount} onToggle={taskList.toggle} t={t} />
                      </>
                    )}
                    {staleTasks.length > 0 && (
                      <div className="border-t border-border">
                        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                          <span className="text-[13px] text-muted-fg">{t('staleTasks', { count: staleTasks.length })}</span>
                          <button type="button" onClick={() => setStaleOpen((v) => !v)} aria-expanded={staleOpen} className={TEXT_LINK}>
                            {staleOpen ? t('staleHide') : t('staleShow')}
                          </button>
                        </div>
                        {staleOpen && <div className="border-t border-border">{staleTasks.map((task) => renderTask(task, false, false))}</div>}
                      </div>
                    )}
                  </div>
                </Section>

                {/* Messwerte */}
                <Section className={vis('grow')} title={t('metricsTitle')} aside={<span className={LABEL}>{t('metricsWindow', { days: METRIC_WINDOW_DAYS })}</span>} revealDelay={40}>
                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-app border border-border bg-border sm:grid-cols-4">
                    {/* EC */}
                    {growMetrics.ec && growMetrics.ec.data.type === 'duenger' && growMetrics.ec.data.ec != null ? (
                      <div className="flex min-w-0 flex-col gap-2 bg-card px-4 py-3.5">
                        <span className={LABEL}>{t('metricEc')}</span>
                        <p className="font-mono text-[26px] leading-tight tabular-nums text-foreground">
                          {num(growMetrics.ec.data.ec)} <small className="text-xs text-muted-fg">mS/cm</small>
                        </p>
                        <Sparkline values={growMetrics.ecSeries} />
                        <span className={`${LABEL} tabular-nums`}>{t('metricLastValueDay', { day: growDayOf(growMetrics.ec.date, activeGrow.startDate) })}</span>
                      </div>
                    ) : (
                      <div className="flex min-w-0 flex-col gap-2 bg-background px-4 py-3.5">
                        <div className="flex items-center justify-between gap-1.5"><span className={LABEL}>{t('metricEc')}</span><span className={LABEL}>{t('metricOptional')}</span></div>
                        <p className="text-xs leading-relaxed text-muted-fg">{t('ecInvite')}</p>
                        <Link href={logHref} className={`${TEXT_LINK} mt-auto self-start`}>{t('ecCta')}</Link>
                      </div>
                    )}

                    {/* pH */}
                    {growMetrics.ph && growMetrics.ph.data.type === 'wasser' && growMetrics.ph.data.ph != null ? (
                      <div className="flex min-w-0 flex-col gap-2 bg-card px-4 py-3.5">
                        <span className={LABEL}>{t('metricPh')}</span>
                        <p className="font-mono text-[26px] leading-tight tabular-nums text-foreground">{num(growMetrics.ph.data.ph)}</p>
                        <Sparkline values={growMetrics.phSeries} />
                        <span className={`${LABEL} tabular-nums`}>{t('metricLastValueDay', { day: growDayOf(growMetrics.ph.date, activeGrow.startDate) })}</span>
                      </div>
                    ) : (
                      <div className="flex min-w-0 flex-col gap-2 bg-background px-4 py-3.5">
                        <div className="flex items-center justify-between gap-1.5"><span className={LABEL}>{t('metricPh')}</span><span className={LABEL}>{t('metricOptional')}</span></div>
                        <p className="text-xs leading-relaxed text-muted-fg">{t('phInvite')}</p>
                        <Link href={logHref} className={`${TEXT_LINK} mt-auto self-start`}>{t('phCta')}</Link>
                      </div>
                    )}

                    {/* Letztes Gießen */}
                    <div className="flex min-w-0 flex-col gap-2 bg-card px-4 py-3.5">
                      <span className={LABEL}>{t('metricWatering')}</span>
                      {growMetrics.lastWater ? (
                        <>
                          <p className="font-mono text-[20px] leading-tight tabular-nums text-foreground">{timeAgo(growMetrics.lastWater.date, t)}</p>
                          {growMetrics.lastWater.data.type === 'wasser' && growMetrics.lastWater.data.mengeLiter != null && (
                            <span className={`${LABEL} tabular-nums`}>{num(growMetrics.lastWater.data.mengeLiter)} L</span>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-xs leading-relaxed text-muted-fg">{t('wateringNone')}</p>
                          <Link href={logHref} className={`${TEXT_LINK} mt-auto self-start`}>{t('wateringCta')}</Link>
                        </>
                      )}
                    </div>

                    {/* Einträge */}
                    <div className="flex min-w-0 flex-col gap-2 bg-card px-4 py-3.5">
                      <span className={LABEL}>{t('metricEntries')}</span>
                      <p className="font-mono text-[26px] leading-tight tabular-nums text-foreground">{growMetrics.entriesInWindow}</p>
                      <span className={LABEL}>{t('metricsWindow', { days: METRIC_WINDOW_DAYS })}</span>
                    </div>
                  </div>
                </Section>

                {/* Verlauf */}
                {timeline && (
                  <Section className={vis('grow')} title={t('timelineTitle')} aside={<span className={LABEL}>{t('timelineSub')}</span>} revealDelay={80}>
                    <div className={`${PANEL} flex flex-col gap-3 px-4 pb-3.5 pt-[18px]`}>
                      <div className="relative h-7">
                        <div className="absolute inset-x-0 top-[13px] h-px bg-foreground/15" />
                        <div className="absolute left-0 top-3 h-[3px] rounded-[2px] bg-primary" style={{ width: `${timeline.today}%` }} />
                        {timeline.harvest && (
                          <div
                            className="absolute top-2 h-3 rounded-[3px] border border-primary-dark bg-primary-deep"
                            style={{ left: `${timeline.harvest.left}%`, width: `${timeline.harvest.width}%` }}
                            title={t('timelineHarvest', { from: timeline.harvest.from, to: timeline.harvest.to })}
                          />
                        )}
                        {timeline.care.map((ev) => (
                          <span key={ev.key} className="absolute top-[10px] h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-muted-fg" style={{ left: `${ev.left}%` }} title={ev.title} />
                        ))}
                        {timeline.trainings.map((ev) => (
                          <span key={ev.key} className="absolute top-2 h-[11px] w-[11px] -translate-x-1/2 rounded-full border-[1.5px] border-foreground bg-background" style={{ left: `${ev.left}%` }} title={ev.title} />
                        ))}
                        <span className="absolute top-0 h-7 w-px bg-foreground" style={{ left: `${timeline.today}%` }} />
                      </div>
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className={`${LABEL} tabular-nums max-sm:hidden`}>{t('timelineDay', { day: 1 })}</span>
                        <span className={`${LABEL} tabular-nums text-foreground`}>{t('timelineToday', { day: activeGrow.currentDay })}</span>
                        {timeline.harvest && <span className={`${LABEL} tabular-nums`}>{t('timelineHarvest', { from: timeline.harvest.from, to: timeline.harvest.to })}</span>}
                        <span className={`${LABEL} tabular-nums max-sm:hidden`}>{t('timelineDay', { day: timeline.total })}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 border-t border-border pt-2.5 text-xs text-muted-fg">
                        <span className="flex items-center gap-1.5"><i className="h-[7px] w-[7px] rounded-full border-[1.5px] border-foreground bg-background" />{t('legendAction')}</span>
                        <span className="flex items-center gap-1.5"><i className="h-[7px] w-[7px] rounded-full bg-muted-fg" />{t('legendCare')}</span>
                        {timeline.harvest && <span className="flex items-center gap-1.5"><i className="h-[7px] w-3 rounded-[2px] border border-primary-dark bg-primary-deep" />{t('legendHarvest')}</span>}
                      </div>
                    </div>
                  </Section>
                )}
              </>
            ) : (
              <section className={`flex flex-col items-start gap-3 rounded-app border border-dashed border-foreground/15 p-6 ${vis('today')}`} data-reveal>
                <Sprout className="h-5 w-5 text-muted-fg" strokeWidth={1.75} />
                <div>
                  <h2 className="text-base font-semibold text-foreground">{t('noActiveGrowTitle')}</h2>
                  <p className="mt-1 text-sm text-muted-fg">{t('noActiveGrowSub')}</p>
                </div>
                <Link href={'/start' as Route} className={BTN_PRIMARY}>
                  <Sprout className="h-3.5 w-3.5" strokeWidth={2} /> {t('startGrowCTA')}
                </Link>
              </section>
            )}
          </div>

          {/* Side column — grow-related only */}
          <aside className="flex min-w-0 flex-col gap-6">
            {activeGrow && activeGrow.plants.length > 0 && (
              <Section className={vis('today')} title={t('plantsTitle')} count={activeGrow.plants.length} revealDelay={40}>
                <div className={`${PANEL} overflow-hidden`}>
                  {activeGrow.plants.map((plant) => {
                    const plantEntries = growEntries.filter((e) => e.plantId === plant.id);
                    const needsCheck = dashboardPlantAlert(plantEntries);
                    const newest = plantEntries[0];
                    return (
                      <Link
                        key={plant.id}
                        href={`/grow/${activeGrow.id}` as Route}
                        className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-[11px] transition-colors last:border-b-0 hover:bg-background"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] text-foreground">{plant.name}</span>
                          {newest && <span className="block font-mono text-[11px] tabular-nums text-muted-fg">{timeAgo(newest.date, t)}</span>}
                        </span>
                        <span className={`${LABEL} flex-shrink-0 ${needsCheck ? 'text-amber-500' : newest ? 'text-primary' : ''}`}>
                          {needsCheck ? t('plantCheck') : newest ? t('plantOk') : t('plantNoEntry')}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </Section>
            )}

            {activeGrows.length > 0 && (
              <Section className={vis('grow')} title={t('myGrows')} count={activeGrows.length} revealDelay={60}>
                <div className="flex flex-col gap-1">
                  {activeGrows.map((g) => {
                    const isCurrent = g.id === activeGrow?.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setActiveGrowId(g.id)}
                        aria-current={isCurrent ? 'true' : undefined}
                        className={`flex min-h-[48px] w-full items-center justify-between rounded-app border px-2.5 py-2 text-left transition-colors ${isCurrent ? 'border-foreground/15 bg-card text-foreground' : 'border-transparent text-muted-fg hover:bg-card hover:text-foreground'}`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold">{g.name}</span>
                          <span className="block font-mono text-[11px] tabular-nums">{t('growMeta', { day: g.currentDay, count: g.plants.length })}</span>
                        </span>
                      </button>
                    );
                  })}
                  <Link href={'/start' as Route} className="flex min-h-[40px] items-center rounded-app px-2.5 text-[13px] font-semibold text-muted-fg transition-colors hover:text-foreground">+ {t('newGrow')}</Link>
                </div>
              </Section>
            )}

            <Section className={vis('grow')} title={t('quickAccessTitle')} revealDelay={80}>
              <nav className="flex flex-col gap-px">
                {[
                  { href: '/studies' as Route, icon: Library, label: t('allStudies') },
                  { href: '/database' as Route, icon: Database, label: t('database') },
                  { href: '/tools' as Route, icon: Wrench, label: t('tools') },
                  { href: '/diagnose' as Route, icon: Stethoscope, label: t('diagnoseLink') },
                  { href: '/status' as Route, icon: Activity, label: t('status') },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="group flex min-h-[40px] items-center gap-2.5 rounded-app px-2.5 text-[13px] text-muted-fg transition-colors hover:bg-card hover:text-foreground">
                    <item.icon className="h-4 w-4" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Section>
          </aside>
        </div>

        {/* ════ Wissen: reading, recommendations, updates ════════════════ */}
        <div className={`flex flex-col gap-6 border-t border-border pt-8 max-lg:gap-0 max-lg:border-0 max-lg:pt-0 ${vis('knowledge')}`}>
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-foreground max-lg:hidden">{t('knowledgeTitle')}</h2>

          <div className="gap-6 lg:columns-2 xl:columns-3 lg:[&>*]:mb-6 [&>*]:break-inside-avoid">
            <Section collapsible title={t('continueReadingTitle')} count={continueReading.length}>
              <div className={PANEL}>
                {continueReading.length === 0 ? (
                  <Invite text={t('noProgressYet')} action={<Link href="/studies" className={TEXT_LINK}>{t('discoverStudies')}</Link>} />
                ) : (
                  <>
                    {continueList.visible.map(({ article, entry }) => (
                      <ArticleRow
                        key={article.slug}
                        article={article}
                        right={<span className="flex-shrink-0 font-mono text-[11px] tabular-nums text-muted-fg">{entry.progress}%</span>}
                      />
                    ))}
                    <ShowMoreButton expanded={continueList.expanded} hiddenCount={continueList.hiddenCount} onToggle={continueList.toggle} t={t} />
                  </>
                )}
              </div>
            </Section>

            <Section collapsible defaultOpen={false} title={t('streakActivityTitle')} revealDelay={40}>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-app border border-border bg-border">
                {[
                  { label: t('readingStreakLabel'), value: readingStreak, hint: readingStreak > 0 ? t('streakBadge', { count: readingStreak }) : t('streakStartHint') },
                  { label: t('activityScoreLabel'), value: activityScore, suffix: '/100' },
                  { label: t('metricSaved'), value: bookmarks.length },
                  { label: t('metricRead'), value: history.length },
                ].map((m) => (
                  <div key={m.label} className="flex min-w-0 flex-col gap-1.5 bg-card px-3.5 py-3">
                    <span className={`${LABEL} truncate`}>{m.label}</span>
                    <p className={`font-mono text-[24px] leading-tight tabular-nums ${m.value === 0 ? 'text-muted-fg' : 'text-foreground'}`}>
                      {m.value}{m.suffix && <small className="text-xs text-muted-fg">{m.suffix}</small>}
                    </p>
                    {m.hint && <span className="text-[11px] leading-snug text-muted-fg">{m.hint}</span>}
                  </div>
                ))}
              </div>
              <div className={PANEL}>
                <p className={`${LABEL} px-4 pb-1 pt-3`}>{t('recentlyViewed')}</p>
                {historyArticles.length === 0 ? (
                  <p className="px-4 pb-3 text-xs text-muted-fg">{t('noReadHistory')}</p>
                ) : (
                  <>
                    {historyList.visible.map((article) => {
                      const entry = history.find((item) => item.slug === article.slug);
                      return <ArticleRow key={article.slug} article={article} right={<span className="flex-shrink-0 font-mono text-[11px] tabular-nums text-muted-fg">{entry ? timeAgo(entry.readAt, t) : ''}</span>} />;
                    })}
                    <ShowMoreButton expanded={historyList.expanded} hiddenCount={historyList.hiddenCount} onToggle={historyList.toggle} t={t} />
                  </>
                )}
                {history.length > 0 && (
                  <div className="flex justify-end border-t border-border px-4 py-2">
                    {confirmClearHistoryVisible ? (
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-muted-fg">{t('confirmClearHistory')}</span>
                        <button type="button" onClick={() => { clearHistory(); setConfirmClearHistoryVisible(false); }} className="font-bold text-rose-500 hover:text-rose-400">{t('confirmYes')}</button>
                        <button type="button" onClick={() => setConfirmClearHistoryVisible(false)} className="text-muted-fg hover:text-foreground">{t('confirmCancel')}</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setConfirmClearHistoryVisible(true)} className="text-[11px] text-muted-fg hover:text-rose-500">{t('clearHistory')}</button>
                    )}
                  </div>
                )}
              </div>
            </Section>

            <Section collapsible defaultOpen={false} title={t('smartNotificationsTitle')} count={newSinceLastVisit.length + interestMatches.length} revealDelay={80}>
              <div className={PANEL}>
                <div className="flex items-center justify-between px-4 pb-1 pt-3">
                  <span className={LABEL}>{t('newSinceLastVisit')}</span>
                  <span className={`${LABEL} tabular-nums`}>{newSinceLastVisit.length}</span>
                </div>
                {newSinceLastVisit.length === 0 ? (
                  <p className="px-4 pb-3 text-xs text-muted-fg">{t('noNewUpdates')}</p>
                ) : (
                  newSinceLastVisit.slice(0, 2).map((article) => <ArticleRow key={article.slug} article={article} />)
                )}
                <div className="flex items-center justify-between border-t border-border px-4 pb-1 pt-3">
                  <span className={LABEL}>{t('fitsYourInterests')}</span>
                  <span className={`${LABEL} tabular-nums`}>{interestMatches.length}</span>
                </div>
                {interestMatches.length === 0 ? (
                  <Invite
                    text={interests.length === 0 ? t('noInterestsYet') : t('noInterestMatch')}
                    action={interests.length === 0 ? <Link href="/dashboard/onboarding" className={TEXT_LINK}>{t('chooseInterests')}</Link> : undefined}
                  />
                ) : (
                  interestMatches.slice(0, 2).map((article) => <ArticleRow key={article.slug} article={article} />)
                )}
              </div>
            </Section>

            <Section collapsible defaultOpen={false} title={t('recommendedTitle')} count={recommendedArticles.length} revealDelay={120}>
              <div className={PANEL}>
                {recommendedArticles.length === 0 && interests.length === 0 ? (
                  <Invite text={t('noRecommendedYet')} action={<Link href="/dashboard/onboarding" className={TEXT_LINK}>{t('chooseInterests')}</Link>} />
                ) : (
                  <>
                    {recommendedList.visible.map((article) => <ArticleRow key={article.slug} article={article} />)}
                    <ShowMoreButton expanded={recommendedList.expanded} hiddenCount={recommendedList.hiddenCount} onToggle={recommendedList.toggle} t={t} />
                  </>
                )}
              </div>
            </Section>

            <Section collapsible defaultOpen={false} title={t('savedStudiesTitle')} count={bookmarkedArticles.length} revealDelay={160}>
              <div className={PANEL}>
                {bookmarkedArticles.length === 0 ? (
                  <Invite text={t('noBookmarksYet')} action={<Link href="/studies" className={TEXT_LINK}>{t('discoverStudies')}</Link>} />
                ) : (
                  <>
                    {savedList.visible.map((article) => <ArticleRow key={article.slug} article={article} />)}
                    <ShowMoreButton expanded={savedList.expanded} hiddenCount={savedList.hiddenCount} onToggle={savedList.toggle} t={t} />
                  </>
                )}
              </div>
            </Section>

            <Section collapsible defaultOpen={false} title={t('weeklyDigestTitle')} revealDelay={200}>
              <div className={PANEL}>
                <div className="flex gap-1 border-b border-border p-1.5">
                  {([
                    ['new', t('newGrowStudies')],
                    ['important', t('importantThisWeek')],
                    ['trending', t('trendingTopics')],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDigestTab(key)}
                      aria-pressed={digestTab === key}
                      className={`flex-1 rounded-[4px] px-2 py-1.5 text-[11.5px] font-semibold transition-colors ${digestTab === key ? 'bg-background text-foreground' : 'text-muted-fg hover:text-foreground'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {digestTab === 'new' && digest.newGrowStudies.slice(0, 3).map((article) => <ArticleRow key={article.slug} article={article} />)}
                {digestTab === 'important' && digest.importantThisWeek.slice(0, 3).map((article) => <ArticleRow key={article.slug} article={article} />)}
                {digestTab === 'trending' && digest.trendingTopics.slice(0, 3).map((topic) => (
                  <Link key={topic.label} href={`/studies/${topic.sampleArticle.slug}` as Route} className="group block border-b border-border px-4 py-2.5 transition-colors last:border-b-0 hover:bg-background">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold text-foreground group-hover:text-primary">{topic.label}</p>
                      <span className="flex-shrink-0 font-mono text-[11px] tabular-nums text-muted-fg">+{topic.momentum}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-fg">{t('relevantArticles', { count: topic.articleCount })}</p>
                  </Link>
                ))}
              </div>
            </Section>

            <Section collapsible defaultOpen={false} title={t('myInterestsTitle')} revealDelay={240}>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_ORDER.map((interest) => {
                  const meta = INTEREST_META[interest];
                  const active = isActive(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1 rounded-[4px] border px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${active ? 'border-primary/50 text-foreground' : 'border-border text-muted-fg hover:border-foreground/15 hover:text-foreground'}`}
                    >
                      <meta.icon className={`h-3 w-3 ${active ? 'text-primary' : ''}`} strokeWidth={2} />
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
              {interestsLoaded && interests.length > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-muted-fg">
                  <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-primary" strokeWidth={2} /> {t('personalizationActive', { count: interests.length })}
                </p>
              )}
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}
