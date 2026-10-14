'use client';

// ────────────────────────────────────────────────────────────────────────────
// Grow cockpit (DESIGN_SYSTEM.md §24) — the one view of a grow.
//
// Used by /dashboard/user (active grow + knowledge block) and /grow/[id]
// (any grow, e.g. finished ones from the history). Replaces the former
// separate grow detail page so a grow has exactly one surface.
//
// Desktop: header + two columns. Mobile: sticky tabs (Heute / Grow /
// optional Wissen) instead of one endless column.
// ────────────────────────────────────────────────────────────────────────────

import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useGrowLog } from '@/hooks/useGrowLog';
import { useAuth } from '@/hooks/useAuth';
import { useAssistantPreference } from '@/hooks/useAssistantPreference';
import type { UseGrowStateReturn } from '@/hooks/useGrowState';
import { getUpcomingTasks, getOverdueTasks, getTaskProgress, getPhaseForDay } from '@/lib/grow/planGenerator';
import { getPhaseRelativeDay } from '@/lib/grow/utils';
import { getDailyAction, getGrowHealthScore } from '@/lib/grow/intelligence';
import { TASK_CATEGORY_ICONS } from '@/lib/grow/taskIcons';
import { LOG_ENTRY_TYPE_LABELS, TRAINING_METHOD_LABELS } from '@/lib/grow/types';
import type { Grow, GrowPhaseId } from '@/lib/grow/types';
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown';
import GrowKnowledgePanel from '@/components/grow/GrowKnowledgePanel';
import SmartInsights from '@/components/SmartInsights';
import RecommendationsPanel from '@/components/grow/RecommendationsPanel';
import SaveGrowBanner from '@/components/grow/SaveGrowBanner';
import {
  Sprout, AlertTriangle, CheckCircle2, ArrowRight, NotebookPen, MoreHorizontal, X, Droplets, FlaskConical,
} from 'lucide-react';
import {
  ActionRow, BTN_GHOST, BTN_PRIMARY, Disclosure, GlossaryLabel, LABEL, PANEL, Section, ShowMoreButton, Sparkline, TEXT_LINK,
  growDayOf, timeAgo, useExpandableList, windowStart,
} from './ui';
import { PlantList, plantNeedsCheck } from './PlantList';
import { GrowAssessment } from './GrowAssessment';
import { HarvestPanel } from './HarvestPanel';
import { GrowSettings } from './GrowSettings';
import { StartChecklist } from './StartChecklist';

const METRIC_WINDOW_DAYS = 14;

type Tab = 'today' | 'grow' | 'knowledge';

export function GrowCockpit({
  grow, growState, eyebrow, headerActions, knowledge, onSelectGrow,
}: {
  /** The grow to show; null renders the "start a grow" state. */
  grow: Grow | null;
  /** The page's single useGrowState() instance (state is per hook instance). */
  growState: UseGrowStateReturn;
  /** Small caps line above the title (greeting, status …). */
  eyebrow: React.ReactNode;
  /** Extra header buttons (admin, logout). */
  headerActions?: React.ReactNode;
  /** Optional third mobile tab + block below the cockpit. */
  knowledge?: { label: string; content: React.ReactNode };
  /** Called when another grow is picked in "Meine Grows". */
  onSelectGrow: (growId: string) => void;
}) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { grows, completeTask, advancePhase, updateGrow } = growState;
  const { hasTodayEntry, entries, currentStreak } = useGrowLog(grow?.id ?? null);
  const { user } = useAuth();
  const { enabled: assistantEnabled, setEnabled: setAssistantEnabled } = useAssistantPreference();

  const overdueTasks = useMemo(() => (grow ? getOverdueTasks(grow) : []), [grow]);

  // Overdue tasks whose plan phase already ended are noise for "today"
  // (e.g. "soak seeds" on day 55). They're grouped into one quiet row
  // instead of crowding out the tasks that matter now.
  const { currentTasks, staleTasks } = useMemo(() => {
    if (!grow) return { currentTasks: [], staleTasks: [] };
    const phaseEnd = new Map(grow.plan.phases.map((p) => [p.id, p.endDay]));
    const isStale = (task: (typeof overdueTasks)[number]) => (phaseEnd.get(task.phaseId) ?? Infinity) < grow.currentDay;
    return {
      currentTasks: [...overdueTasks.filter((task) => !isStale(task)), ...getUpcomingTasks(grow, 5)],
      staleTasks: overdueTasks.filter(isStale),
    };
  }, [grow, overdueTasks]);

  const plantAlerts = useMemo(
    () => (grow ? grow.plants.filter((p) => plantNeedsCheck(entries.filter((e) => e.plantId === p.id))).length : 0),
    [grow, entries],
  );
  const alertCount = overdueTasks.length > 0 || plantAlerts > 0 ? plantAlerts + (overdueTasks.length > 0 ? 1 : 0) : 0;

  const growMetrics = useMemo(() => {
    const cutoff = windowStart(METRIC_WINDOW_DAYS);
    const ecEntries = entries.filter((e) => e.data.type === 'duenger' && e.data.ec != null);
    const phEntries = entries.filter((e) => e.data.type === 'wasser' && e.data.ph != null);
    const series = (list: typeof entries, pick: (e: (typeof entries)[number]) => number | undefined) => list
      .filter((e) => new Date(e.date).getTime() >= cutoff)
      .map(pick)
      .filter((v): v is number => v != null)
      .reverse();
    return {
      ec: ecEntries[0] ?? null,
      ecSeries: series(ecEntries, (e) => (e.data.type === 'duenger' ? e.data.ec : undefined)),
      ph: phEntries[0] ?? null,
      phSeries: series(phEntries, (e) => (e.data.type === 'wasser' ? e.data.ph : undefined)),
      lastWater: entries.find((e) => e.data.type === 'wasser') ?? null,
      entriesInWindow: entries.filter((e) => new Date(e.date).getTime() >= cutoff).length,
    };
  }, [entries]);

  // Timeline shows what the grower *did* (the header already shows phases)
  // plus the harvest window = late flower through harvest.
  const timeline = useMemo(() => {
    if (!grow || grow.plan.totalDays <= 0) return null;
    const total = grow.plan.totalDays;
    const pos = (day: number) => Math.min(100, Math.max(0, ((day - 1) / total) * 100));
    const trainings: { key: string; left: number; title: string }[] = [];
    const care: { key: string; left: number; title: string }[] = [];
    for (const e of entries) {
      const day = growDayOf(e.date, grow.startDate);
      if (e.data.type === 'training') {
        trainings.push({ key: e.id, left: pos(day), title: `${t('timelineDay', { day })} · ${TRAINING_METHOD_LABELS[e.data.methode]}` });
      } else if (e.data.type === 'wasser' || e.data.type === 'duenger') {
        care.push({ key: e.id, left: pos(day), title: `${t('timelineDay', { day })} · ${LOG_ENTRY_TYPE_LABELS[e.data.type]}` });
      }
    }
    const late = grow.plan.phases.find((p) => p.id === 'spaetbluete');
    const ernte = grow.plan.phases.find((p) => p.id === 'ernte');
    const from = late?.startDay ?? ernte?.startDay;
    const to = ernte?.endDay ?? late?.endDay;
    return {
      total,
      today: pos(grow.currentDay),
      trainings,
      care,
      harvest: from != null && to != null ? { from, to, left: pos(from), width: Math.max(1, pos(to) - pos(from)) } : null,
    };
  }, [grow, entries, t]);

  const activeGrows = useMemo(
    () => grows.filter((g) => g.status === 'aktiv' || g.id === grow?.id),
    [grows, grow?.id],
  );

  const num = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);

  // "Erledigt" is saved after a short grace period so a mis-tap on the phone
  // can be undone. Leaving the page (or ticking the next task) saves at once.
  const UNDO_MS = 5000;
  const [pendingDone, setPendingDone] = useState<{ growId: string; taskId: string; title: string } | null>(null);
  const pendingRef = useRef(pendingDone);
  const completeRef = useRef(completeTask);
  useEffect(() => { pendingRef.current = pendingDone; completeRef.current = completeTask; });
  useEffect(() => {
    if (!pendingDone) return;
    const timer = setTimeout(() => {
      completeRef.current(pendingDone.growId, pendingDone.taskId);
      setPendingDone(null);
    }, UNDO_MS);
    return () => clearTimeout(timer);
  }, [pendingDone]);
  useEffect(() => {
    const flush = () => {
      const p = pendingRef.current;
      if (p) { completeRef.current(p.growId, p.taskId); pendingRef.current = null; }
    };
    window.addEventListener('pagehide', flush);
    return () => { window.removeEventListener('pagehide', flush); flush(); };
  }, []);
  const markDone = (growId: string, taskId: string, title: string) => {
    const previous = pendingRef.current;
    if (previous) completeTask(previous.growId, previous.taskId);
    setPendingDone({ growId, taskId, title });
  };
  const notPending = (task: { id: string }) => task.id !== pendingDone?.taskId;

  const taskList = useExpandableList(currentTasks.filter(notPending), 3);
  const [staleOpen, setStaleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Mobile (< lg): the page splits into tabs instead of one endless
  // column. Desktop ignores this and shows everything side by side.
  const [mobileTab, setMobileTab] = useState<Tab>('today');
  const tabsAnchor = useRef<HTMLDivElement>(null);
  const vis = (tab: Tab) => (mobileTab === tab ? '' : 'max-lg:hidden');
  const switchTab = (tab: Tab) => {
    setMobileTab(tab);
    // If the tab bar is already stuck under the nav, jump back to its top so
    // the new tab starts at its first item instead of mid-page.
    const anchor = tabsAnchor.current;
    if (!anchor) return;
    const offset = anchor.getBoundingClientRect().top - 60;
    if (offset < 0) window.scrollTo({ top: window.scrollY + offset });
  };

  // Stored phase is the source of truth (manually switchable); the plan's
  // phase for today only drives the "switch phase" hint.
  const phase = grow
    ? grow.plan.phases.find((p) => p.id === grow.currentPhaseId) ?? getPhaseForDay(grow.plan, grow.currentDay)
    : null;
  const planPhase = grow ? getPhaseForDay(grow.plan, grow.currentDay) : null;
  const phaseLag = grow && phase && planPhase ? grow.plan.phases.indexOf(planPhase) - grow.plan.phases.indexOf(phase) : 0;
  // One phase behind: quiet hint in the header. Further behind: the switch
  // becomes the first item of "Als Nächstes" — the stale tasks pile up otherwise.
  const phaseLagRow = phaseLag >= 2;
  const phaseInRange = Boolean(grow && phase && grow.currentDay >= phase.startDay && grow.currentDay <= phase.endDay);
  const taskProgress = grow ? getTaskProgress(grow) : null;
  const healthScore = grow ? getGrowHealthScore(grow, entries) : 0;
  const rawDailyAction = grow && assistantEnabled ? getDailyAction(grow, entries) : null;
  // Skip the recommendation when it only repeats the highlighted header
  // button ("Eintrag erfassen" → same log page).
  const dailyAction = rawDailyAction && !(rawDailyAction.ctaHref === `/grow/${grow?.id}/log` && !hasTodayEntry) ? rawDailyAction : null;
  const showHarvest = Boolean(grow && (grow.status === 'abgeschlossen' || grow.currentPhaseId === 'ernte'));
  const logHref = grow ? (`/grow/${grow.id}/log` as Route) : ('/start' as Route);
  // The question every grower asks: when can I harvest? Same window as the timeline.
  const harvestLabel = grow && timeline?.harvest
    ? grow.currentDay < timeline.harvest.from
      ? t('harvestIn', { days: timeline.harvest.from - grow.currentDay })
      : grow.currentDay <= timeline.harvest.to ? t('harvestWindowNow') : null
    : null;

  const renderTask = (task: (typeof currentTasks)[number], primary: boolean, highlight: boolean) => {
    if (!grow) return null;
    const diff = task.dueDay - grow.currentDay;
    const dueLbl = diff === 0 ? t('taskDueToday') : diff === 1 ? t('taskDueTomorrow') : diff < 0 ? t('taskOverdue', { days: Math.abs(diff) }) : t('taskInDays', { days: diff });
    const CategoryIcon = TASK_CATEGORY_ICONS[task.category];
    return (
      <ActionRow
        key={task.id}
        highlight={highlight}
        title={task.title}
        text={task.description ? <span className="line-clamp-2">{task.description}</span> : undefined}
        meta={(
          <span className={`flex items-center gap-1.5 tabular-nums ${highlight ? 'text-amber-500' : diff === 0 ? 'text-foreground' : ''}`}>
            <CategoryIcon className="h-3.5 w-3.5" strokeWidth={2} /> {dueLbl}
          </span>
        )}
        actions={(
          <button type="button" onClick={() => markDone(grow.id, task.id, task.title)} className={primary ? BTN_PRIMARY : BTN_GHOST}>
            {t('taskDone')}
          </button>
        )}
      />
    );
  };

  const tabs: [Tab, string, number][] = [
    ['today', t('tabToday'), currentTasks.length],
    ['grow', t('tabGrow'), 0],
    ...(knowledge ? [['knowledge', knowledge.label, 0] as [Tab, string, number]] : []),
  ];

  return (
    <>
      {/* ── Header: grow identity, day, phase track, one action ─────────── */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 pb-5 pt-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 flex-[1_1_480px]">
              <p className={LABEL}>{eyebrow}</p>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
                <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.015em] text-foreground">
                  {grow ? grow.name : t('noActiveGrowTitle')}
                </h1>
                {grow && (
                  <button
                    type="button"
                    onClick={() => setSettingsOpen((v) => !v)}
                    aria-expanded={settingsOpen}
                    aria-label={t('settingsToggle')}
                    title={t('settingsToggle')}
                    className={`-ml-2 flex h-8 w-8 items-center justify-center self-center rounded-app transition-colors hover:bg-card hover:text-foreground ${settingsOpen ? 'bg-card text-foreground' : 'text-muted-fg'}`}
                  >
                    {settingsOpen ? <X className="h-4 w-4" strokeWidth={2} /> : <MoreHorizontal className="h-4 w-4" strokeWidth={2} />}
                  </button>
                )}
                {grow && (
                  <>
                    <span className="font-mono text-[22px] tabular-nums text-muted-fg">
                      {t('growDayProgress', { current: grow.currentDay, total: grow.plan.totalDays })}
                    </span>
                    {phase && (
                      <span title={t('phaseMenuHint')}>
                        <Dropdown
                          variant="ghost"
                          value={phase.id}
                          onChange={(v) => advancePhase(grow.id, v as GrowPhaseId)}
                          className="font-mono text-xs lg:text-[11px] uppercase tracking-[0.08em] !text-muted-fg underline decoration-dotted underline-offset-[3px] hover:!text-foreground"
                        >
                          {grow.plan.phases.map((p) => <DropdownOption key={p.id} value={p.id}>{p.label}</DropdownOption>)}
                        </Dropdown>
                      </span>
                    )}
                    {harvestLabel && <span className={`${LABEL} tabular-nums text-foreground`}>{harvestLabel}</span>}
                  </>
                )}
              </div>

              {grow && grow.plan.phases.length > 0 && (
                <div
                  className="mt-3 grid max-w-[620px] gap-[3px]"
                  style={{ gridTemplateColumns: grow.plan.phases.map((p) => `minmax(clamp(1.25rem, 8vw, 4.75rem), ${Math.max(1, p.endDay - p.startDay + 1)}fr)`).join(' ') }}
                  aria-label={phase ? `${t('growDayProgress', { current: grow.currentDay, total: grow.plan.totalDays })} · ${phase.label}` : undefined}
                >
                  {grow.plan.phases.map((p, i, all) => {
                    // Same source of truth as the phase label above (currentPhaseId), so bar and label never disagree.
                    const currentIndex = all.findIndex((x) => x.id === phase?.id);
                    const done = i < currentIndex;
                    const now = i === currentIndex;
                    const fill = now ? Math.min(100, Math.max(0, Math.round(((grow.currentDay - p.startDay + 1) / (p.endDay - p.startDay + 1)) * 100))) : 0;
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

              {grow && phaseLag === 1 && planPhase && (
                <p className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 ${LABEL}`}>
                  <span>{t('phasePlanHint', { phase: planPhase.label })}</span>
                  <button type="button" onClick={() => advancePhase(grow.id, planPhase.id)} className={TEXT_LINK}>
                    {t('phaseSwitchCta')}
                  </button>
                </p>
              )}

              {grow && phase?.description && (
                <div className="mt-3 max-w-[620px]">
                  <Disclosure label={t('phaseAbout', { phase: phase.label })}>
                    <p className="text-[13px] leading-relaxed text-muted-fg">{phase.description}</p>
                    <p className={`mt-1.5 tabular-nums ${LABEL}`}>
                      {phaseInRange
                        ? t('phaseDayRemaining', { day: getPhaseRelativeDay(grow.currentDay, phase), left: Math.max(0, phase.endDay - grow.currentDay + 1) })
                        : t('phasePlanRange', { from: phase.startDay, to: phase.endDay })}
                    </p>
                  </Disclosure>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {grow && (
                <>
                  <span className={`${LABEL} ${hasTodayEntry ? 'text-primary' : 'max-lg:hidden'}`}>
                    {hasTodayEntry ? t('dailyDone') : t('dailyMissing')}
                  </span>
                  <Link href={logHref} className={hasTodayEntry ? BTN_GHOST : BTN_PRIMARY}>
                    <NotebookPen className="h-3.5 w-3.5" strokeWidth={2.25} /> {t('logEntryCta')}
                  </Link>
                </>
              )}
              {headerActions}
            </div>
          </div>

          {grow && settingsOpen && (
            <div className="mt-4 max-w-[620px]">
              <GrowSettings
                key={grow.id}
                grow={grow}
                onUpdate={updateGrow}
                assistantEnabled={assistantEnabled}
                onSetAssistantEnabled={setAssistantEnabled}
                onClose={() => setSettingsOpen(false)}
              />
            </div>
          )}
        </div>
      </header>

      {grow && (
        <div className="mx-auto max-w-6xl px-4 pt-4 empty:hidden sm:px-6">
          <SaveGrowBanner />
        </div>
      )}

      {/* ── Mobile tab bar (sticky under the 60px nav) ─────────────────── */}
      <div ref={tabsAnchor} aria-hidden="true" className="lg:hidden" />
      <div className="sticky top-[calc(60px+env(safe-area-inset-top))] z-30 border-b border-border bg-background/95 backdrop-blur lg:hidden">
        <div role="tablist" aria-label={t('title')} className="mx-auto flex max-w-6xl gap-1 px-4 py-2 sm:px-6">
          {tabs.map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mobileTab === key}
              onClick={() => switchTab(key)}
              className={`flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-app border font-mono text-xs lg:text-[11px] uppercase tracking-[0.08em] transition-colors ${mobileTab === key ? 'border-foreground/15 bg-card text-foreground' : 'border-transparent text-muted-fg'}`}
            >
              {label}
              {count > 0 && <span className="tabular-nums text-muted-fg">· {count}</span>}
              {key === 'today' && alertCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-label={t('alertPlants', { count: alertCount })} />}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-6 sm:px-6">

        {/* ════ Cockpit ═══════════════════════════════════════════════════ */}
        <div className={`grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] ${mobileTab === 'knowledge' ? 'max-lg:hidden' : ''}`}>

          <div className="flex min-w-0 flex-col gap-6">
            {grow && taskProgress ? (
              <>
                <div className={vis('today')}>
                  <StartChecklist key={grow.id} grow={grow} entries={entries} />
                </div>

                {/* Schnell erfassen — the most frequent actions, one tap to the pre-selected form */}
                <div className={`flex flex-wrap items-center gap-1.5 ${vis('today')}`} data-reveal>
                  <span className={`${LABEL} mr-1 w-full sm:w-auto`}>{t('quickLogLabel')}</span>
                  {([
                    ['wasser', Droplets, t('quickLogWater')],
                    ['duenger', FlaskConical, t('quickLogFeed')],
                    ['notiz', NotebookPen, t('quickLogNote')],
                  ] as const).map(([type, Icon, label]) => (
                    <Link key={type} href={`/grow/${grow.id}/log?type=${type}` as Route} className={`${BTN_GHOST} flex-1 sm:flex-none`}>
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} /> {label}
                    </Link>
                  ))}
                </div>

                {/* Als Nächstes */}
                <Section
                  className={vis('today')}
                  title={t('nextUpTitle')}
                  count={currentTasks.length}
                  aside={(
                    <span className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${LABEL}`}>
                      {plantAlerts > 0 && (
                        <a href="#cockpit-plants" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.25} />
                          {t('alertPlants', { count: plantAlerts })}
                          <ArrowRight className="h-3 w-3" strokeWidth={2} />
                        </a>
                      )}
                      <span className="tabular-nums">{t('growTaskProgress', { done: taskProgress.completed, total: taskProgress.total, percent: taskProgress.percent })}</span>
                    </span>
                  )}
                >
                  <div className={PANEL}>
                    {phaseLagRow && phase && planPhase && (
                      <ActionRow
                        label={t('phaseLagLabel')}
                        title={t('phaseLagTitle', { phase: phase.label })}
                        text={t('phaseLagText', { day: grow.currentDay, phase: planPhase.label })}
                        actions={(
                          <button type="button" onClick={() => advancePhase(grow.id, planPhase.id)} className={BTN_PRIMARY}>
                            {t('phaseLagCta', { phase: planPhase.label })}
                          </button>
                        )}
                      />
                    )}
                    {dailyAction && (
                      <ActionRow
                        label={t('dailyActionLabel')}
                        highlight={dailyAction.level === 'critical'}
                        title={dailyAction.message}
                        text={(
                          <>
                            {dailyAction.subtext}
                            {user?.isPro && (dailyAction.yieldImpact || dailyAction.deepInsight) && (
                              <span className="mt-1 block text-xs">
                                {dailyAction.yieldImpact && <span className="font-mono tabular-nums">{dailyAction.yieldImpact}</span>}
                                {dailyAction.yieldImpact && dailyAction.deepInsight && ' · '}
                                {dailyAction.deepInsight}
                              </span>
                            )}
                          </>
                        )}
                        actions={<Link href={dailyAction.ctaHref as Route} className={BTN_GHOST}>{dailyAction.ctaLabel.replace(/s*→$/, '')}</Link>}
                      />
                    )}
                    {currentTasks.filter(notPending).length === 0 ? (
                      <p className="flex items-center gap-2 border-b border-border px-4 py-4 text-sm text-muted-fg last:border-b-0">
                        <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={2} /> {t('allTasksDone')}
                      </p>
                    ) : (
                      <>
                        {taskList.visible.map((task, index) => renderTask(task, index === 0 && !phaseLagRow, index === 0 && task.dueDay < grow.currentDay))}
                        <ShowMoreButton expanded={taskList.expanded} hiddenCount={taskList.hiddenCount} onToggle={taskList.toggle} t={t} />
                      </>
                    )}
                    {assistantEnabled && (
                      <>
                        <GrowKnowledgePanel
                          grow={grow}
                          entries={entries}
                          healthScore={healthScore}
                          currentStreak={currentStreak}
                          overdueTasks={overdueTasks.length}
                          growsCount={grows.length}
                        />
                        <SmartInsights grow={grow} />
                        {user && <RecommendationsPanel growId={grow.id} userId={user.id} />}
                      </>
                    )}
                    {staleTasks.filter(notPending).length > 0 && (
                      <div className="border-t border-border">
                        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                          <span className="text-[13px] text-muted-fg">{t('staleTasks', { count: staleTasks.filter(notPending).length })}</span>
                          <button type="button" onClick={() => setStaleOpen((v) => !v)} aria-expanded={staleOpen} className={TEXT_LINK}>
                            {staleOpen ? t('staleHide') : t('staleShow')}
                          </button>
                        </div>
                        {staleOpen && <div className="border-t border-border">{staleTasks.filter(notPending).map((task) => renderTask(task, false, false))}</div>}
                      </div>
                    )}
                  </div>
                </Section>

                {/* Ernte */}
                {showHarvest && (
                  <Section className={vis('today')} title={t('harvestTitle')} revealDelay={20}>
                    <HarvestPanel key={grow.id} grow={grow} onSave={(data) => updateGrow(grow.id, { harvest: data })} />
                  </Section>
                )}

                {/* Messwerte */}
                <Section className={vis('grow')} title={t('metricsTitle')} aside={<span className={LABEL}>{t('metricsWindow', { days: METRIC_WINDOW_DAYS })}</span>} revealDelay={40}>
                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-app border border-border bg-border sm:grid-cols-4">
                    {/* EC */}
                    {growMetrics.ec && growMetrics.ec.data.type === 'duenger' && growMetrics.ec.data.ec != null ? (
                      <div className="flex min-w-0 flex-col gap-2 bg-card px-4 py-3.5">
                        <GlossaryLabel terms={['EC', 'EC-Wert']}>{t('metricEc')}</GlossaryLabel>
                        <p className="font-mono text-[26px] leading-tight tabular-nums text-foreground">
                          {num(growMetrics.ec.data.ec)} <small className="text-xs text-muted-fg">mS/cm</small>
                        </p>
                        <Sparkline values={growMetrics.ecSeries} />
                        <span className={`${LABEL} tabular-nums`}>{t('metricLastValueDay', { day: growDayOf(growMetrics.ec.date, grow.startDate) })}</span>
                      </div>
                    ) : (
                      <div className="flex min-w-0 flex-col gap-2 bg-background px-4 py-3.5">
                        <div className="flex items-start justify-between gap-1.5"><GlossaryLabel terms={['EC', 'EC-Wert']}>{t('metricEc')}</GlossaryLabel><span className={LABEL}>{t('metricOptional')}</span></div>
                        <p className="text-xs leading-relaxed text-muted-fg">{t('ecInvite')}</p>
                        <Link href={logHref} className={`${TEXT_LINK} mt-auto self-start`}>{t('ecCta')}</Link>
                      </div>
                    )}

                    {/* pH */}
                    {growMetrics.ph && growMetrics.ph.data.type === 'wasser' && growMetrics.ph.data.ph != null ? (
                      <div className="flex min-w-0 flex-col gap-2 bg-card px-4 py-3.5">
                        <GlossaryLabel terms={['pH-Wert', 'pH']}>{t('metricPh')}</GlossaryLabel>
                        <p className="font-mono text-[26px] leading-tight tabular-nums text-foreground">{num(growMetrics.ph.data.ph)}</p>
                        <Sparkline values={growMetrics.phSeries} />
                        <span className={`${LABEL} tabular-nums`}>{t('metricLastValueDay', { day: growDayOf(growMetrics.ph.date, grow.startDate) })}</span>
                      </div>
                    ) : (
                      <div className="flex min-w-0 flex-col gap-2 bg-background px-4 py-3.5">
                        <div className="flex items-start justify-between gap-1.5"><GlossaryLabel terms={['pH-Wert', 'pH']}>{t('metricPh')}</GlossaryLabel><span className={LABEL}>{t('metricOptional')}</span></div>
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
                        <span className={`${LABEL} tabular-nums text-foreground`}>{t('timelineToday', { day: grow.currentDay })}</span>
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
            {grow && grow.plants.length > 0 && (
              <div id="cockpit-plants" className={`scroll-mt-32 ${vis('today')}`}>
                <Section title={t('plantsTitle')} count={grow.plants.length} revealDelay={40}>
                  <PlantList grow={grow} entries={entries} onUpdate={updateGrow} />
                </Section>
              </div>
            )}

            {grow && assistantEnabled && (
              <Section className={vis('grow')} title={t('assessmentTitle')} revealDelay={50}>
                <GrowAssessment key={grow.id} grow={grow} entries={entries} healthScore={healthScore} isPro={user?.isPro ?? false} />
              </Section>
            )}

            {activeGrows.length > 0 && (
              <Section className={vis('grow')} title={t('myGrows')} count={activeGrows.length} revealDelay={60}>
                <div className="flex flex-col gap-1">
                  {activeGrows.map((g) => {
                    const isCurrent = g.id === grow?.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => onSelectGrow(g.id)}
                        aria-current={isCurrent ? 'true' : undefined}
                        className={`flex min-h-[48px] w-full items-center justify-between rounded-app border px-2.5 py-2 text-left transition-colors ${isCurrent ? 'border-foreground/15 bg-card text-foreground' : 'border-transparent text-muted-fg hover:bg-card hover:text-foreground'}`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold">{g.name}</span>
                          <span className="block font-mono text-xs lg:text-[11px] tabular-nums">{t('growMeta', { day: g.currentDay, count: g.plants.length })}</span>
                        </span>
                      </button>
                    );
                  })}
                  <Link href={'/start' as Route} className="flex min-h-[40px] items-center rounded-app px-2.5 text-[13px] font-semibold text-muted-fg transition-colors hover:text-foreground">+ {t('newGrow')}</Link>
                  <Link href={'/grow/history' as Route} className="flex min-h-[40px] items-center rounded-app px-2.5 text-[13px] text-muted-fg transition-colors hover:text-foreground">{t('growHistory')}</Link>
                </div>
              </Section>
            )}

          </aside>
        </div>

        {knowledge && <div className={vis('knowledge')}>{knowledge.content}</div>}
      </div>

      {/* Undo for "Erledigt" (above the mobile bottom nav) */}
      {pendingDone && (
        <div role="status" className="fixed inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-app border border-foreground/15 bg-card px-4 py-3 md:bottom-6">
          <span className="min-w-0 truncate text-[13px] text-foreground">{t('taskDoneToast', { task: pendingDone.title })}</span>
          <button type="button" onClick={() => setPendingDone(null)} className={`${TEXT_LINK} flex-shrink-0`}>{t('undo')}</button>
        </div>
      )}
    </>
  );
}
