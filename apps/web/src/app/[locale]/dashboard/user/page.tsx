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
import { PremiumScrollFx } from '@/components/scroll/PremiumScrollFx';
import { useGrowState } from '@/hooks/useGrowState';
import { GrowCockpit } from '@/components/grow/cockpit/GrowCockpit';
import {
  BTN_QUIET, Invite, LABEL, PANEL, Section, ShowMoreButton, TEXT_LINK, timeAgo, useExpandableList,
} from '@/components/grow/cockpit/ui';
import { CheckCircle2, LogOut, Settings } from 'lucide-react';

const INTEREST_ORDER = Object.keys(INTEREST_META) as Interest[];

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

export default function UserDashboardPage() {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmClearHistoryVisible, setConfirmClearHistoryVisible] = useState(false);
  const [lastVisit, setLastVisit] = useState<Date | null>(null);

  const { bookmarks } = useBookmarks();
  const { history, clearHistory } = useReadingHistory();
  const growState = useGrowState();

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
          <svg className="h-6 w-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
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
      <PremiumScrollFx />
      <GrowCockpit
        grow={growState.activeGrow}
        growState={growState}
        onSelectGrow={growState.setActiveGrowId}
        eyebrow={<>{greeting()}{session && <>, <span className="text-foreground">{session.user.username}</span></>}</>}
        headerActions={(
          <>
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
          </>
        )}
        knowledge={{
          label: t('knowledgeTitle'),
          content: (
            <div className="flex flex-col gap-6 border-t border-border pt-8 max-lg:gap-0 max-lg:border-0 max-lg:pt-0">
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
                            right={<span className="flex-shrink-0 font-mono text-xs lg:text-[11px] tabular-nums text-muted-fg">{entry.progress}%</span>}
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
                          return <ArticleRow key={article.slug} article={article} right={<span className="flex-shrink-0 font-mono text-xs lg:text-[11px] tabular-nums text-muted-fg">{entry ? timeAgo(entry.readAt, t) : ''}</span>} />;
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
                          <span className="flex-shrink-0 font-mono text-xs lg:text-[11px] tabular-nums text-muted-fg">+{topic.momentum}</span>
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
          ),
        }}
      />
    </main>
  );
}
