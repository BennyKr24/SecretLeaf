'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Gerade eben';
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
  const weeks = Math.floor(days / 7);
  return `vor ${weeks} ${weeks === 1 ? 'Woche' : 'Wochen'}`;
}

const INTEREST_ORDER = Object.keys(INTEREST_META) as Interest[];

function SectionHeader({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: number | string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-bold tracking-tight text-slate-900 sm:text-lg">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
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
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="max-w-sm text-sm text-slate-500">{text}</p>
      {action}
    </div>
  );
}

function MetricCard({ icon, label, value, tone = 'default' }: { icon: string; label: string; value: number | string; tone?: 'default' | 'accent' }) {
  return (
    <div className={`rounded-3xl border px-4 py-4 shadow-sm backdrop-blur ${tone === 'accent' ? 'border-emerald-200 bg-emerald-50/70' : 'border-white/60 bg-white/80'}`}>
      <span className="text-lg">{icon}</span>
      <p className="mt-2 text-2xl font-bold leading-none text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

function ArticleCard({ article, variant = 'default' }: { article: TerpiraArticle; variant?: 'compact' | 'default' }) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/studies/${article.slug}`}
        className="group flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-all duration-150 hover:border-emerald-200 hover:bg-emerald-50/40"
      >
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-[13px] font-semibold text-slate-800 transition-colors group-hover:text-emerald-700">
            {article.title}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {categoryLabels[article.category]} · {article.readMinutes} Min.
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
      className="group flex flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-150 hover:border-emerald-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="inline-block rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          {categoryLabels[article.category]}
        </span>
        <BookmarkButton slug={article.slug} size="sm" className="flex-shrink-0" />
      </div>
      <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700">
        {article.title}
      </h3>
      <p className="mt-2 line-clamp-2 flex-1 text-xs text-slate-500">{article.summary}</p>
      <div className="mt-3">
        <CommunitySignals article={article} allArticles={wikiArticles} compact />
      </div>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
        <span>{article.readMinutes} Min. Lesezeit</span>
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
  const href = sectionId ? `/studies/${article.slug}#${sectionId}` : `/studies/${article.slug}`;

  return (
    <a
      href={href}
      className="group flex min-w-[280px] snap-start flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-150 hover:border-emerald-200 hover:shadow-md sm:min-w-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Fortsetzen</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700">
            {article.title}
          </h3>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          {progress}%
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{categoryLabels[article.category]} · zuletzt {timeAgo(updatedAt)}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>{sectionId ? `Weiter bei ${sectionId.replace('-', ' ')}` : 'Direkt weiterlesen'}</span>
        <span className="font-semibold text-emerald-600">Öffnen →</span>
      </div>
    </a>
  );
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [lastVisit, setLastVisit] = useState<Date | null>(null);

  const { bookmarks } = useBookmarks();
  const { history, clearHistory } = useReadingHistory();
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
    const raw = localStorage.getItem('secretleaf.last_visit');
    if (raw) setLastVisit(new Date(raw));
    localStorage.setItem('secretleaf.last_visit', new Date().toISOString());
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
    if (hour < 12) return 'Guten Morgen';
    if (hour < 17) return 'Guten Tag';
    return 'Guten Abend';
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f8f5]">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-6 w-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-slate-500">Lade…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4f8f5_0%,#fbfcfb_32%,#ffffff_100%)]">
      <section className="relative overflow-hidden border-b border-emerald-100/60 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_38%),linear-gradient(135deg,#0f2e1f_0%,#174b34_46%,#f4f8f5_100%)] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-5%] top-[-10%] h-52 w-52 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute right-[-5%] top-12 h-44 w-44 rounded-full bg-teal-200/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-5 sm:pb-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-200">Retention Hub</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {greeting()}{session ? `, ${session.user.username}` : ''}
              </h1>
              <p className="mt-3 text-sm leading-6 text-emerald-50/85 sm:text-base">
                Dein persönlicher Wochenrückblick mit neuen Grow-Studien, passenden Inhalten und klaren Wiedereinstiegen in begonnene Artikel.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                  🔥 {readingStreak > 0 ? `${readingStreak} Tage Serie` : 'Serie starten'}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                  ⚡ Aktivität {activityScore}/100
                </span>
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                  ✉︎ Digest bereit für E-Mail
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[340px]">
              <MetricCard icon="🔖" label="Gespeichert" value={bookmarks.length} />
              <MetricCard icon="📖" label="Gelesen" value={history.length} />
              <MetricCard icon="🔥" label="Serie" value={readingStreak} tone="accent" />
              <MetricCard icon="⚡" label="Aktivität" value={activityScore} tone="accent" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {session?.user.role === 'ADMIN' && (
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/15"
              >
                ⚙ Admin
              </Link>
            )}
            <button
              type="button"
              onClick={() => void (async () => { await logoutFromSupabase(); router.push('/'); })()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/15"
            >
              Abmelden
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-5 sm:py-8">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/85 p-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
          <SectionHeader
            title="Smart Notifications"
            subtitle="Was seit deinem letzten Besuch passiert ist und was zu deinen Interessen passt"
            badge={newSinceLastVisit.length + interestMatches.length}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-emerald-100 bg-[linear-gradient(180deg,rgba(236,253,245,0.9),rgba(255,255,255,0.95))] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Seit letztem Besuch neu</p>
                  <p className="mt-1 text-sm text-slate-600">Frische Inhalte, damit sich dein nächster Besuch sofort lohnt.</p>
                </div>
                <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">{newSinceLastVisit.length}</span>
              </div>
              {newSinceLastVisit.length === 0 ? (
                <EmptyState icon="🛰" text="Seit deinem letzten Besuch gab es noch keine neuen Updates. Der Wochen-Digest hält dich trotzdem auf Kurs." />
              ) : (
                <div className="space-y-3">
                  {newSinceLastVisit.map((article) => (
                    <ArticleCard key={article.slug} article={article} variant="compact" />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-sky-100 bg-[linear-gradient(180deg,rgba(240,249,255,0.9),rgba(255,255,255,0.95))] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Passend zu deinen Interessen</p>
                  <p className="mt-1 text-sm text-slate-600">Neue Inhalte in deinen Themenfeldern, priorisiert nach Momentum.</p>
                </div>
                <span className="rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-bold text-white">{interestMatches.length}</span>
              </div>
              {interestMatches.length === 0 ? (
                <EmptyState
                  icon="🎯"
                  text={interests.length === 0
                    ? 'Wähle Interessen aus, damit wir passende Benachrichtigungen hervorheben können.'
                    : 'Gerade gibt es nichts Neues in deinen Interessen. Der Digest zeigt dir trotzdem relevante Themen mit Momentum.'}
                  action={interests.length === 0 ? (
                    <Link href="/dashboard/onboarding" className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-500">
                      Interessen wählen
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

        <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:p-6">
          <SectionHeader
            title="Weekly Digest"
            subtitle="Modular aufgebaut, damit dieselbe Struktur später direkt per E-Mail versendet werden kann"
            badge={digest.generatedAt.slice(0, 10)}
          />

          <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2 lg:grid lg:grid-cols-[1.15fr_1.15fr_0.9fr] lg:overflow-visible">
            <div className="min-w-[290px] snap-start rounded-3xl border border-emerald-100 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(255,255,255,1))] p-4 lg:min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Neue Grow Studien</p>
              <div className="mt-3 space-y-3">
                {digest.newGrowStudies.map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="compact" />
                ))}
              </div>
            </div>

            <div className="min-w-[290px] snap-start rounded-3xl border border-amber-100 bg-[linear-gradient(180deg,rgba(255,251,235,0.95),rgba(255,255,255,1))] p-4 lg:min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Wichtig diese Woche</p>
              <div className="mt-3 space-y-3">
                {digest.importantThisWeek.map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="compact" />
                ))}
              </div>
            </div>

            <div className="min-w-[290px] snap-start rounded-3xl border border-rose-100 bg-[linear-gradient(180deg,rgba(255,241,242,0.95),rgba(255,255,255,1))] p-4 lg:min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Trending Themen</p>
              <div className="mt-3 space-y-3">
                {digest.trendingTopics.map((topic) => (
                  <Link
                    key={topic.label}
                    href={`/studies/${topic.sampleArticle.slug}`}
                    className="block rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm transition-all duration-150 hover:border-rose-200 hover:bg-rose-50/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{topic.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{topic.articleCount} relevante Artikel</p>
                      </div>
                      <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        +{topic.momentum}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs text-slate-600">Startpunkt: {topic.sampleArticle.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:p-6">
          <SectionHeader
            title="Continue Reading"
            subtitle="Begonnene Artikel direkt an der letzten sinnvollen Stelle wieder aufnehmen"
            badge={continueReading.length}
          />
          {continueReading.length === 0 ? (
            <EmptyState
              icon="📍"
              text="Sobald du einen Artikel teilweise liest, erscheint hier dein Wiedereinstieg mit Fortschritt und Abschnittsanker."
              action={
                <Link href="/studies" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-500">
                  Studien entdecken
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
          <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:p-6">
            <SectionHeader title="Gespeicherte Studien" subtitle="Schneller Zugriff auf deine Merkliste" badge={bookmarkedArticles.length} />
            {bookmarkedArticles.length === 0 ? (
              <EmptyState
                icon="🔖"
                text="Du hast noch keine Studien gespeichert. Entdecke Inhalte und baue dir deine persönliche Wissensliste auf."
                action={
                  <Link href="/studies" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-500">
                    Studien entdecken
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

          <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:p-6">
            <SectionHeader title="Streak & Aktivität" subtitle="Dein Rhythmus entscheidet, wie relevant die Startseite wird" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Lese-Serie</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{readingStreak}</p>
                <p className="mt-1 text-sm text-slate-600">{readingStreak === 1 ? 'Tag in Folge' : 'Tage in Folge'}</p>
              </div>
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Aktivitätsscore</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{activityScore}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${activityScore}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Kürzlich angesehen</p>
              {historyArticles.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Noch keine Lesehistorie vorhanden.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {historyArticles.map((article) => {
                    const entry = history.find((item) => item.slug === article.slug);
                    return (
                      <Link
                        key={article.slug}
                        href={`/studies/${article.slug}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white bg-white px-4 py-3 text-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 font-semibold text-slate-800">{article.title}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{categoryLabels[article.category]} · {entry ? timeAgo(entry.readAt) : ''}</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600">Öffnen</span>
                      </Link>
                    );
                  })}
                </div>
              )}
              {history.length > 0 && (
                <div className="mt-4 flex justify-end">
                  {confirmClearHistory ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Verlauf wirklich löschen?</span>
                      <button
                        type="button"
                        onClick={() => { clearHistory(); setConfirmClearHistory(false); }}
                        className="font-bold text-red-600 transition-colors hover:text-red-700"
                      >
                        Ja, löschen
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClearHistory(false)}
                        className="text-slate-400 transition-colors hover:text-slate-600"
                      >
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClearHistory(true)}
                      className="text-xs text-slate-400 transition-colors hover:text-red-500"
                    >
                      Verlauf löschen
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:p-6">
          <SectionHeader title="Empfohlen für dich" subtitle="Personalisiert nach Interessen, Verlauf und bereits gespeicherten Artikeln" badge={recommendedArticles.length} />
          {recommendedArticles.length === 0 && interests.length === 0 ? (
            <EmptyState
              icon="✨"
              text="Wähle deine Interessen, damit wir neue Inhalte priorisieren und smarter benachrichtigen können."
              action={
                <Link href="/dashboard/onboarding" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-500">
                  Interessen wählen
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
          <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:p-6">
            <SectionHeader title="Meine Interessen" subtitle="Diese Auswahl steuert Empfehlungen, Notifications und spätere E-Mail-Digests" />
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
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
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
                ✓ Personalisierung aktiv — {interests.length} {interests.length === 1 ? 'Interesse' : 'Interessen'} ausgewählt
              </p>
            )}
          </section>

          <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:p-6">
            <SectionHeader title="Schnellzugriff" subtitle="Deine wichtigsten Wege auf kleineren Screens sofort erreichbar" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/studies' as Route, icon: '📚', label: 'Alle Studien' },
                { href: '/database' as Route, icon: '🗄', label: 'Datenbank' },
                { href: '/tools' as Route, icon: '🛠', label: 'Tools' },
                { href: '/status' as Route, icon: '🟢', label: 'Status' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col items-center gap-2 rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-5 text-center transition-all duration-150 hover:border-emerald-200 hover:bg-emerald-50/40"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[13px] font-semibold text-slate-700 transition-colors group-hover:text-emerald-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}