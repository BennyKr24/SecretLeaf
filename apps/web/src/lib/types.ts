export type UserRole = "CONSUMER" | "PROVIDER" | "ADMIN" | "TEAM";

export type UserPlan = "free" | "pro" | "team";

export type PlanSource = "stripe" | "trial" | "code";

export type SessionUser = {
  id: string;
  username: string;
  /** Email address — stored since login, used on profile page */
  email?: string;
  role: UserRole;
  /** Subscription tier — defaults to "free" when not set */
  plan?: UserPlan;
  /** How the Pro entitlement was granted — "stripe" (paid), "trial", "code". */
  planSource?: PlanSource;
  /** Whether the one-time self-serve Pro trial has ever been activated. */
  trialRedeemed?: boolean;
  /** ISO end of the current entitled period (trial / code / paid cycle), if any. */
  currentPeriodEnd?: string | null;
};

/** Profile data stored in localStorage per user — keyed by userId */
export type UserProfile = {
  userId: string;
  name: string;
  avatarUrl?: string;
};

export type SessionData = {
  token: string;
  user: SessionUser;
};

export type PriceTier = {
  qty: number;
  pricePerUnit: number;
};

export type Offer = {
  id: string;
  title: string;
  description?: string;
  quantityAvailable: number;
  unit: string;
  provider: string;
  priceTiers: PriceTier[];
  cheapestPrice: number;
  locationZone: string;
};

export type PublicListing = {
  id: string;
  title: string;
  description?: string | null;
  locationZone: string;
  quantityAvailable: number;
  unit: string;
  provider: string;
  cheapestPrice: number;
  updatedAt: string;
};

export type PublicOverview = {
  generatedAt: string;
  degraded?: boolean;
  stats: {
    activeListings: number;
    providers: number;
    privacyMode: string;
    totalStudies?: number;
    goodStudies?: number;
    studyCoveragePercent?: number;
    latestStudyAt?: string | null;
  };
  featuredListings: PublicListing[];
};

export type PublicListingsResponse = {
  degraded?: boolean;
  total: number;
  filters: {
    locationZone: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    limit: number;
  };
  listings: PublicListing[];
};

export type ServiceHealth = {
  status?: string;
  privacyMode?: string;
};

export type RiskLevel = "green" | "yellow" | "red";

export type StatusEvent = {
  key: string;
  label: string;
  count: number;
  level: RiskLevel;
  description: string;
  lastSeen: string | null;
};

export type PublicStatusReport = {
  generatedAt: string;
  windowDays: number;
  degraded: boolean;
  overallStatus: RiskLevel;
  services: {
    api: RiskLevel;
    db: RiskLevel;
  };
  events: StatusEvent[];
};

export type StudyRecord = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  tags: string[];
  qualityStatus: "good" | "pending" | "bad";
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string | null;
};

export type CreateStudyInput = {
  title: string;
  description?: string;
  source?: string;
  tags?: string[];
};

export type StudiesPagination = {
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
};

export type StudiesListResponse = {
  studies: StudyRecord[];
  total: number;
  pagination: StudiesPagination;
};

