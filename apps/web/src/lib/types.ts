export type UserRole = "CONSUMER" | "PROVIDER";

export type SessionUser = {
  id: string;
  username: string;
  role: UserRole;
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

