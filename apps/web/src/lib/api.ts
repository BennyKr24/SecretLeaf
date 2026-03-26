"use client";

import { SessionData } from "./types";
import { DEMO_OFFERS, DEMO_LISTINGS, DEMO_SESSION } from "./demoData";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  session?: SessionData | null;
};

const resolveDemoResponse = <T>(path: string, options: RequestOptions): T => {
  if (path === "/auth/login" || path === "/auth/register") {
    return DEMO_SESSION as T;
  }
  if (path === "/listings/mine") {
    return DEMO_LISTINGS as T;
  }
  if (path.startsWith("/search/offers")) {
    return { offers: DEMO_OFFERS, total: DEMO_OFFERS.length } as T;
  }
  if (path === "/listings" && options.method === "POST") {
    return {} as T;
  }
  return {} as T;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  if (DEMO_MODE) {
    return resolveDemoResponse<T>(path, options);
  }

  const requestInit: RequestInit = {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.session ? { Authorization: `Bearer ${options.session.token}` } : {})
    },
    cache: "no-store"
  };

  if (options.body !== undefined) {
    requestInit.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}${path}`, requestInit);

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({ error: "Request failed" }))) as {
      error?: string;
    };
    throw new Error(errorBody.error ?? "Request failed");
  }

  return (await response.json()) as T;
};

export const formatEuro = (cents: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
