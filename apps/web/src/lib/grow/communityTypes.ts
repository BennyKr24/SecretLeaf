// ────────────────────────────────────────────────────────────────────────────
// Community Grows — data model scaffold
//
// BLOCKED ON: Supabase persistence + user accounts
// Next steps:
//   1. Add `community_grows` table in Supabase migration
//   2. Enable RLS: owner can read/write, public can read published rows
//   3. Replace placeholder API with real Supabase client calls
// ────────────────────────────────────────────────────────────────────────────

export type CommunityGrowVisibility = 'public' | 'unlisted' | 'private';

/** A grow shared publicly by a user. */
export type CommunityGrowSnapshot = {
  id: string;
  ownerId: string;             // auth.users.id
  ownerDisplayName: string;
  title: string;
  description?: string;
  strain?: string;
  medium: string;              // e.g. 'erde' | 'hydro' | 'coco'
  umgebung: string;            // e.g. 'indoor' | 'outdoor'
  totalDays: number;
  harvestGrams?: number;
  rating?: number;             // 1–5
  coverPhotoId?: string;       // references GrowPhoto.id
  photoCount: number;
  visibility: CommunityGrowVisibility;
  createdAt: string;           // ISO-8601
  publishedAt?: string;        // ISO-8601
};

/** Summary card shown in community feed. */
export type CommunityGrowCard = Pick<
  CommunityGrowSnapshot,
  | 'id'
  | 'ownerDisplayName'
  | 'title'
  | 'strain'
  | 'medium'
  | 'umgebung'
  | 'totalDays'
  | 'harvestGrams'
  | 'rating'
  | 'coverPhotoId'
  | 'photoCount'
  | 'publishedAt'
>;

/** Filters for the community feed. */
export type CommunityFeedFilters = {
  medium?: string;
  umgebung?: string;
  minRating?: number;
  sortBy?: 'newest' | 'topRated' | 'highestYield';
};
