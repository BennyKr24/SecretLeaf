"use client";

import { SessionData } from "./types";
import { getSupabaseBrowserClient } from "./supabaseBrowser";

const SESSION_KEY = "secretleaf.session";

type SupabaseAuthInput = {
  email: string;
  password: string;
};

type CurrentUserResponse = {
  user: {
    id: string;
    email: string | null;
    role: "CONSUMER" | "PROVIDER" | "ADMIN";
  };
};

const usernameFromEmail = (email: string) => {
  const [left] = email.split("@");
  return left && left.trim().length > 0 ? left.trim() : "user";
};

const toSessionData = (params: {
  accessToken: string;
  userId: string;
  email?: string | null | undefined;
  role: "CONSUMER" | "PROVIDER" | "ADMIN";
}): SessionData => ({
  token: params.accessToken,
  user: {
    id: params.userId,
    username: params.email ? usernameFromEmail(params.email) : "user",
    role: params.role,
  },
});

const fetchRoleFromApi = async (accessToken: string): Promise<"CONSUMER" | "PROVIDER" | "ADMIN"> => {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return "CONSUMER";
  }

  const body = (await response.json()) as CurrentUserResponse;
  if (body.user?.role === "ADMIN") return "ADMIN";
  return body.user?.role === "PROVIDER" ? "PROVIDER" : "CONSUMER";
};

export const getSession = (): SessionData | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const saveSession = (session: SessionData) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const registerWithSupabase = async (input: SupabaseAuthInput): Promise<SessionData | null> => {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw new Error(error.message || "Registrierung fehlgeschlagen");
  }

  const accessToken = data.session?.access_token;
  const user = data.user;
  if (!accessToken || !user) {
    // Email confirmation flow: no active session yet.
    return null;
  }

  const role = await fetchRoleFromApi(accessToken);

  const session = toSessionData({
    accessToken,
    userId: user.id,
    email: user.email,
    role,
  });
  saveSession(session);
  return session;
};

export const loginWithSupabase = async (input: SupabaseAuthInput): Promise<SessionData> => {
  const supabase = getSupabaseBrowserClient();

  // Clear any stale session before attempting login
  await supabase.auth.signOut().catch(() => {});

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.session || !data.user) {
    throw new Error(error?.message || "Login fehlgeschlagen");
  }

  const role = await fetchRoleFromApi(data.session.access_token);

  const session = toSessionData({
    accessToken: data.session.access_token,
    userId: data.user.id,
    email: data.user.email,
    role,
  });
  saveSession(session);
  return session;
};

export const restoreSessionFromSupabase = async (): Promise<SessionData | null> => {
  const existing = getSession();
  if (existing) {
    return existing;
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session || !data.session.user) {
    return null;
  }

  const role = await fetchRoleFromApi(data.session.access_token);

  const session = toSessionData({
    accessToken: data.session.access_token,
    userId: data.session.user.id,
    email: data.session.user.email,
    role,
  });
  saveSession(session);
  return session;
};

export const logoutFromSupabase = async () => {
  try {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  } finally {
    clearSession();
  }
};
