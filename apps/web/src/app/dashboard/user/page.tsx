'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { restoreSessionFromSupabase, logoutFromSupabase } from '@/lib/auth';
import type { SessionData } from '@/lib/types';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { useInterests, INTEREST_META, type Interest } from '@/hooks/useInterests';
import { wikiArticles, categoryLabels } from '@/data/terpira/wiki';
import type { TerpiraArticle } from '@/lib/terpira/types';
import BookmarkButton from '@/components/BookmarkButton';

/* ── Helpers ────────────────────────────────────────────────────── */

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
const ALL_INTERESTS = INTEREST_ORDER;

/* ── Small reusable UI atoms ────────────────────────────────────── */

function SectionHeader({ title, badge }: { title: string; badge?: number }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">{title}</h2>
      {badge !== undefined && badge > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-100 px-1.5 text-[11px] font-bold text-emerald-700">
          {badge}
        </span>
      )}
    </div>
  );
}

function EmptyState({ icon, text, action }: { icon: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="text-sm text-slate-500 max-w-xs">{text}</p>
      {action}
    </div>
  );
}

function ArticleCard({ article, variant = 'default' }: { article: TerpiraArticle; variant?: 'compact' | 'default' }) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/studies/${article.slug}`}
        className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-150 group"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {article.title}
          </p>
          <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
            {categoryLabels[article.category]} · {article.readMinutes} Min.
          </p>
        </div>
        <BookmarkButton slug={article.slug} size="sm" className="flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100" />
      </Link>
    );
  }

  return (
    <Link
      href={`/studies/${article.slug}`}
      className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 hover:border-emerald-200 hover:shadow-sm transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="inline-block rounded-lg bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
          {categoryLabels[article.category]}
        </span>
        <BookmarkButton slug={article.slug} size="sm" className="flex-shrink-0" />
      </div>
      <h3 className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
        {article.title}
      </h3>
      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 flex-1">{article.summary}</p>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
        <span>{article.readMinutes} Min. Lesezeit</span>
        <span>·</span>
        <span className="capitalize">{article.difficulty}</span>
      </div>
    </Link>
  );
}

/* ── Main page ──────────────────────────────────────────────────── */

export default function UserDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);

  const { bookmarks } = useBookmarks();
  const { history, clearHistory } = useReadingHistory();
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

  // Track last visit for "new since last visit" feature
  const [lastVisit, setLastVisit] = useState<Date | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('secretleaf.last_visit');
    if (raw) setLastVisit(new Date(raw));
    localStorage.setItem('secretleaf.last_visit', new Date().toISOString());
  }, []);

  /* ── Derived data ─────────────────────────────────────────────── */

  const bookmarkedArticles = bookmarks
    .map(slug => wikiArticles.find(a => a.slug === slug))
    .filter((a): a is TerpiraArticle => Boolean(a));

  const historyArticles = history
    .map(entry => wikiArticles.find(a => a.slug === entry.slug))
    .filter((a): a is TerpiraArticle => Boolean(a))
    .slice(0, 6);

  // Recommendations: articles from preferred categories, not already bookmarked or in recent history
  const recentHistorySlugs = new Set(history.slice(0, 5).map(h => h.slug));
  const bookmarkSlugs = new Set(bookmarks);
  const recommendedArticles = (
    preferredCategories.length > 0
      ? preferredCategories
          .flatMap(cat => wikiArticles.filter(a => a.category === cat))
      : wikiArticles
  )
    .filter(a => !bookmarkSlugs.has(a.slug) && !recentHistorySlugs.has(a.slug))
    .slice(0, 6);

  // "New since last visit" — articles updated after lastVisit
  const newSinceLastVisit = lastVisit
    ? wikiArticles
        .filter(a => new Date(a.lastUpdated) > lastVisit)
        .slice(0, 4)
    : [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 17) return 'Guten Tag';
    return 'Guten Abend';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-6 h-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-slate-500">Lade…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafb]">
      {/* ── Top header ────────────────────────────────────────── */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Mein Bereich</p>
            <h1 className="mt-0.5 text-xl font-bold text-slate-900 tracking-tight">
              {greeting()}{session ? `, ${session.user.username}` : ''}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {session?.user.role === 'ADMIN' && (
              <Link
                href="/dashboard/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                ⚙ Admin
              </Link>
            )}
            <button
              type="button"
              onClick={() => void (async () => { await logoutFromSupabase(); router.push('/'); })()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-150"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-8 space-y-10">

        {/* ── Stats strip ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Gespeichert', value: bookmarks.length, icon: '🔖' },
            { label: 'Gelesen', value: history.length, icon: '📖' },
            { label: 'Interessen', value: interests.length, icon: '✦' },
            { label: 'Empfehlungen', value: recommendedArticles.length, icon: '✨' },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-100 bg-white px-4 py-4 flex flex-col gap-1"
            >
              <span className="text-lg">{stat.icon}</span>
              <p className="text-xl font-bold text-slate-900 leading-none">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── New since last visit ─────────────────────────────── */}
        {newSinceLastVisit.length > 0 && (
          <section>
            <SectionHeader
              title="Neu seit deinem letzten Besuch"
              badge={newSinceLastVisit.length}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              {newSinceLastVisit.map(article => (
                <ArticleCard key={article.slug} article={article} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {/* ── Saved studies ────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <SectionHeader title="Gespeicherte Studien" badge={bookmarkedArticles.length} />
            {bookmarkedArticles.length > 0 && (
              <Link href="/studies" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Alle Studien →
              </Link>
            )}
          </div>
          {bookmarkedArticles.length === 0 ? (
            <EmptyState
              icon="🔖"
              text="Du hast noch keine Studien gespeichert. Entdecke unsere Wissensdatenbank und speichere Artikel für später."
              action={
                <Link
                  href="/studies"
                  className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  Studien entdecken
                </Link>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarkedArticles.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </section>

        {/* ── Reading history ──────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <SectionHeader title="Kürzlich angesehen" badge={historyArticles.length} />
            {history.length > 0 && (
              confirmClearHistory ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Verlauf wirklich löschen?</span>
                  <button
                    type="button"
                    onClick={() => { clearHistory(); setConfirmClearHistory(false); }}
                    className="font-bold text-red-600 hover:text-red-700 transition-colors"
                  >
                    Ja, löschen
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearHistory(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClearHistory(true)}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  Verlauf löschen
                </button>
              )
            )}
          </div>
          {historyArticles.length === 0 ? (
            <EmptyState
              icon="📖"
              text="Du hast noch keine Artikel gelesen. Dein Leserverlauf erscheint hier automatisch."
              action={
                <Link
                  href="/studies"
                  className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  Jetzt lesen
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {historyArticles.map(article => {
                const entry = history.find(h => h.slug === article.slug);
                return (
                  <Link
                    key={article.slug}
                    href={`/studies/${article.slug}`}
                    className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-150 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {article.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {categoryLabels[article.category as keyof typeof categoryLabels]} · {entry ? timeAgo(entry.readAt) : ''}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Recommended ─────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <SectionHeader title="Empfohlen für dich" />
            {interests.length === 0 && interestsLoaded && (
              <Link
                href="/dashboard/onboarding"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Interessen festlegen →
              </Link>
            )}
          </div>
          {recommendedArticles.length === 0 && interests.length === 0 ? (
            <EmptyState
              icon="✨"
              text="Wähle deine Interessen, damit wir Inhalte für dich personalisieren können."
              action={
                <Link
                  href="/dashboard/onboarding"
                  className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  Interessen wählen
                </Link>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedArticles.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </section>

        {/* ── Interests editor ────────────────────────────────── */}
        <section>
          <SectionHeader title="Meine Interessen" />
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <p className="text-xs text-slate-500 mb-4">
              Wähle deine Interessen – die Homepage und Empfehlungen werden danach sortiert.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_INTERESTS.map(interest => {
                const meta = INTEREST_META[interest];
                const active = isActive(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold
                      transition-all duration-150 select-none
                      ${active
                        ? 'border-emerald-300 bg-emerald-600 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                    {active && (
                      <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            {interests.length > 0 && (
              <p className="mt-3 text-[11px] text-emerald-600">
                ✓ Personalisierung aktiv — {interests.length} {interests.length === 1 ? 'Interesse' : 'Interessen'} ausgewählt
              </p>
            )}
          </div>
        </section>

        {/* ── Quick links ─────────────────────────────────────── */}
        <section>
          <SectionHeader title="Schnellzugriff" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/studies', icon: '📚', label: 'Alle Studien' },
              { href: '/database', icon: '🗄', label: 'Datenbank' },
              { href: '/tools', icon: '🛠', label: 'Tools' },
              { href: '/status', icon: '🟢', label: 'Status' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-5 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-150 text-center group"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[13px] font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
