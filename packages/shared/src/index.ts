export type UserRole = "CONSUMER" | "PROVIDER" | "BOTH";

export type PriceTierInput = {
  minUnits: number;
  unitPriceCents: number;
};

export type ListingVisibility = "ACTIVE" | "PAUSED";
