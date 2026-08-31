"use client";

// ────────────────────────────────────────────────────────────────────────────
// Admin API — typed client
//
// Replaces `adminApi(session, action, params)` (one POST to
// /api/admin/dashboard with an `action` discriminator) with a plain fetch
// against the REST-ish resource routes under /api/admin/*
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §2.2 / §5).
//
//   adminFetch<AdminOverview>(session, "overview")                 → GET
//   adminFetch<Result>(session, "users", { method: "PATCH", json }) → body
// ────────────────────────────────────────────────────────────────────────────

import type { SessionData } from "@/lib/types";

export type AdminFetchInit = Omit<RequestInit, "body"> & {
  /** JSON body; also flips the default method to POST */
  json?: unknown;
  body?: BodyInit | null;
};

export async function adminFetch<T>(
  session: SessionData,
  path: string,
  init: AdminFetchInit = {},
): Promise<T> {
  const { json, headers, method, body, ...rest } = init;

  const resolvedBody: BodyInit | null | undefined =
    json !== undefined ? JSON.stringify(json) : body;

  const requestInit: RequestInit = {
    ...rest,
    method: method ?? (json !== undefined ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
      ...headers,
    },
    cache: "no-store",
  };
  if (resolvedBody !== undefined) requestInit.body = resolvedBody;

  const res = await fetch(`/api/admin/${path}`, requestInit);

  if (res.status === 401) throw new Error("Nicht eingeloggt. Bitte erneut anmelden.");
  if (res.status === 403) throw new Error("Kein Admin-Zugang. Zugriff verweigert.");
  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errBody.error ?? `HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}
