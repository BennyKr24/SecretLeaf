export type UserRole = "CONSUMER" | "PROVIDER" | "BOTH" | "ADMIN" | "TEAM";

export type PriceTierInput = {
  minUnits: number;
  unitPriceCents: number;
};

export type ListingVisibility = "ACTIVE" | "PAUSED";
