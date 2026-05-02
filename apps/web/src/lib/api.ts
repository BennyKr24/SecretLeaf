"use client";

import { SessionData } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  session?: SessionData | null;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
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
