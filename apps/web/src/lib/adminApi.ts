"use client";

import type { SessionData } from "@/lib/types";

const ADMIN_API = "/api/admin/dashboard";

export async function adminApi<T = unknown>(
  session: SessionData,
  action: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(ADMIN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify({ action, ...params }),
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new Error("Nicht eingeloggt. Bitte erneut anmelden.");
  }
  if (response.status === 403) {
    throw new Error("Kein Admin-Zugang. Zugriff verweigert.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}
