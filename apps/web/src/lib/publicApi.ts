import { PublicOverview, PublicStatusReport, ServiceHealth } from "./types";
import { headers } from "next/headers";

const FALLBACK_API_URL =
  process.env.NEXT_PUBLIC_STATUS_API_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const getApiBaseUrl = async (): Promise<string> => {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    if (host) {
      return `${proto}://${host}`;
    }
  } catch {
    // Fall through to env-based fallback.
  }

  return FALLBACK_API_URL;
};

export const getPublicOverview = async (): Promise<PublicOverview | null> => {
  try {
    const apiBaseUrl = await getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/public/overview`, {
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

export const getApiHealth = async (): Promise<ServiceHealth | null> => {
  try {
    const apiBaseUrl = await getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/health`, {
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
    const apiBaseUrl = await getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/public/status-report`, {
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
