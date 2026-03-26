import { PublicListingsResponse, PublicOverview, PublicStatusReport, ServiceHealth } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const getPublicOverview = async (): Promise<PublicOverview | null> => {
  try {
    const response = await fetch(`${API_URL}/public/overview`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PublicOverview;
  } catch {
    return null;
  }
};

type PublicListingFilter = {
  locationZone?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
};

export const getPublicListings = async (filters: PublicListingFilter): Promise<PublicListingsResponse | null> => {
  try {
    const params = new URLSearchParams();

    if (filters.locationZone) params.set("locationZone", filters.locationZone);
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters.limit !== undefined) params.set("limit", String(filters.limit));

    const response = await fetch(`${API_URL}/public/listings?${params.toString()}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PublicListingsResponse;
  } catch {
    return null;
  }
};

export const getApiHealth = async (): Promise<ServiceHealth | null> => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ServiceHealth;
  } catch {
    return null;
  }
};

export const getPublicStatusReport = async (): Promise<PublicStatusReport | null> => {
  try {
    const response = await fetch(`${API_URL}/public/status-report`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PublicStatusReport;
  } catch {
    return null;
  }
};
