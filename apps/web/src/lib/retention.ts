import type { TerpiraArticle } from '@/lib/terpira/types';
import type { HistoryEntry } from '@/hooks/useReadingHistory';
import type { ReadingProgressEntry } from '@/hooks/useReadingProgress';

export type CommunitySignalKey = 'saved' | 'popular' | 'discovered';

export type CommunitySignal = {
  key: CommunitySignalKey;
  label: string;
  className: string;
};

export type TrendingTopic = {
  label: string;
  articleCount: number;
  momentum: number;
  sampleArticle: TerpiraArticle;
};

export type WeeklyDigestPayload = {
  generatedAt: string;
  emailSubject: string;
  emailPreview: string;
  newGrowStudies: TerpiraArticle[];
  importantThisWeek: TerpiraArticle[];
  trendingTopics: TrendingTopic[];
};

const SIGNAL_STYLES: Record<CommunitySignalKey, string> = {
  saved: 'border-amber-200 bg-amber-50 text-amber-700',
  popular: 'border-rose-200 bg-rose-50 text-rose-700',
  discovered: 'border-sky-200 bg-sky-50 text-sky-700',
};

function daysSince(dateString: string, now = new Date()): number {
  const diff = now.getTime() - new Date(dateString).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

function percentileRank(values: number[], value: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = sorted.findIndex((entry) => entry >= value);
  if (index === -1) return 1;
  return index / Math.max(sorted.length - 1, 1);
}

export function getArticleMomentum(article: TerpiraArticle, now = new Date()): number {
  const sourceCount = article.sourceIds?.length ?? 0;
  const freshness = Math.max(0, 28 - daysSince(article.lastUpdated, now));
  return sourceCount * 14 + freshness * 2 + article.relatedSlugs.length * 3 + article.tags.length;
}

export function getCommunitySignals(article: TerpiraArticle, allArticles: TerpiraArticle[], now = new Date()): CommunitySignal[] {
  const momentumValues = allArticles.map((entry) => getArticleMomentum(entry, now));
  const sourceValues = allArticles.map((entry) => entry.sourceIds?.length ?? 0);
  const momentum = getArticleMomentum(article, now);
  const sourceCount = article.sourceIds?.length ?? 0;
  const recentDays = daysSince(article.lastUpdated, now);

  const signals: CommunitySignal[] = [];
  const momentumRank = percentileRank(momentumValues, momentum);
  const sourceRank = percentileRank(sourceValues, sourceCount);

  if (sourceCount >= 3 && sourceRank >= 0.72) {
    signals.push({ key: 'saved', label: 'oft gespeichert', className: SIGNAL_STYLES.saved });
  }

  if (momentumRank >= 0.76) {
    signals.push({ key: 'popular', label: 'beliebt', className: SIGNAL_STYLES.popular });
  }

  if (recentDays <= 21 || (recentDays <= 35 && momentumRank >= 0.6)) {
    signals.push({ key: 'discovered', label: 'neu entdeckt', className: SIGNAL_STYLES.discovered });
  }

  return signals.slice(0, 3);
}

export function buildWeeklyDigestPayload(articles: TerpiraArticle[], now = new Date()): WeeklyDigestPayload {
  const importantThisWeek = [...articles]
    .sort((left, right) => getArticleMomentum(right, now) - getArticleMomentum(left, now))
    .slice(0, 4);

  const newGrowStudies = [...articles]
    .filter((article) => ['anbau', 'chemie', 'genetik', 'qualitaet'].includes(article.category))
    .sort((left, right) => right.lastUpdated.localeCompare(left.lastUpdated))
    .slice(0, 4);

  const topicMap = new Map<string, { articleCount: number; momentum: number; sampleArticle: TerpiraArticle }>();
  for (const article of articles) {
    const baseMomentum = getArticleMomentum(article, now);
    for (const tag of article.tags.slice(0, 4)) {
      const entry = topicMap.get(tag);
      if (!entry) {
        topicMap.set(tag, { articleCount: 1, momentum: baseMomentum, sampleArticle: article });
        continue;
      }
      entry.articleCount += 1;
      entry.momentum += baseMomentum;
      if (baseMomentum > getArticleMomentum(entry.sampleArticle, now)) {
        entry.sampleArticle = article;
      }
    }
  }

  const trendingTopics = [...topicMap.entries()]
    .map(([label, entry]) => ({ label, ...entry }))
    .filter((entry) => entry.articleCount >= 2)
    .sort((left, right) => right.momentum - left.momentum)
    .slice(0, 3);

  return {
    generatedAt: now.toISOString(),
    emailSubject: 'Dein SecretLeaf Wochenupdate',
    emailPreview: 'Neue Grow-Studien, wichtige Updates und Themen mit Momentum.',
    newGrowStudies,
    importantThisWeek,
    trendingTopics,
  };
}

function dayKey(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function previousDay(key: string): string {
  const date = new Date(`${key}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return dayKey(date);
}

export function getReadingStreak(history: HistoryEntry[], now = new Date()): number {
  const uniqueDays = new Set(history.map((entry) => dayKey(new Date(entry.readAt))));
  if (uniqueDays.size === 0) return 0;

  let cursor = dayKey(now);
  let streak = 0;

  while (uniqueDays.has(cursor)) {
    streak += 1;
    cursor = previousDay(cursor);
  }

  return streak;
}

export function getActivityScore(args: {
  history: HistoryEntry[];
  bookmarksCount: number;
  interestsCount: number;
  progressEntries: ReadingProgressEntry[];
}): number {
  const recentHistory = args.history.filter((entry) => daysSince(entry.readAt) <= 30);
  const activeProgress = args.progressEntries.filter((entry) => entry.progress >= 15 && entry.progress < 100);
  const completedReads = args.progressEntries.filter((entry) => entry.progress >= 95);

  const rawScore = recentHistory.length * 7
    + args.bookmarksCount * 4
    + args.interestsCount * 3
    + activeProgress.length * 5
    + completedReads.length * 6;

  return Math.max(0, Math.min(100, rawScore));
}

export function getContinueReadingEntries(progressEntries: ReadingProgressEntry[]): ReadingProgressEntry[] {
  return [...progressEntries]
    .filter((entry) => entry.progress >= 10 && entry.progress < 95)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 4);
}

export function getInterestMatches(args: {
  articles: TerpiraArticle[];
  preferredCategories: string[];
  excludedSlugs: Set<string>;
  lastVisit: Date | null;
}): TerpiraArticle[] {
  const filtered = args.articles.filter((article) => {
    if (args.excludedSlugs.has(article.slug)) return false;
    if (args.preferredCategories.length > 0 && !args.preferredCategories.includes(article.category)) return false;
    if (!args.lastVisit) return true;
    return new Date(article.lastUpdated) > args.lastVisit;
  });

  return filtered
    .sort((left, right) => getArticleMomentum(right) - getArticleMomentum(left))
    .slice(0, 4);
}