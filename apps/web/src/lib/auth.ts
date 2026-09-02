"use client";

import { PlanSource, SessionData, UserPlan, UserRole } from "./types";
import { getSupabaseBrowserClient } from "./supabaseBrowser";

const SESSION_KEY = "secretleaf.session";

type SupabaseAuthInput = {
  email: string;
  password: string;
  /** UI-Sprache — landet in user_metadata, damit der Send-Email-Hook die
   *  Bestätigungs-/Reset-Mail in der richtigen Sprache rendert. */
  locale?: "de" | "en";
};

type CurrentUserResponse = {
  user: {
    id: string;
    email: string | null;
    role: UserRole;
    plan: UserPlan;
    planSource?: PlanSource;
    trialRedeemed?: boolean;
    currentPeriodEnd?: string | null;
  };
};

/** Server-authoritative account fields refreshed from /api/auth/me on every login/restore. */
type AuthUserFields = {
  role: UserRole;
  plan: UserPlan;
  planSource: PlanSource;
  trialRedeemed: boolean;
  currentPeriodEnd: string | null;
};

const usernameFromEmail = (email: string) => {
  const [left] = email.split("@");
  return left && left.trim().length > 0 ? left.trim() : "user";
};

const toSessionData = (params: {
  accessToken: string;
  userId: string;
  email?: string | null | undefined;
} & AuthUserFields): SessionData => ({
  token: params.accessToken,
  user: {
    id: params.userId,
    username: params.email ? usernameFromEmail(params.email) : "user",
    ...(params.email ? { email: params.email } : {}),
    role: params.role,
    plan: params.plan,
    planSource: params.planSource,
    trialRedeemed: params.trialRedeemed,
    currentPeriodEnd: params.currentPeriodEnd,
  },
});

const FALLBACK_AUTH_FIELDS: AuthUserFields = {
  role: "CONSUMER",
  plan: "free",
  planSource: "stripe",
  trialRedeemed: false,
  currentPeriodEnd: null,
};

/** Fetches server-authoritative role + plan (+ entitlement source) for the current user in one call. */
const fetchUserFromApi = async (accessToken: string): Promise<AuthUserFields> => {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return FALLBACK_AUTH_FIELDS;
  }

  const body = (await response.json()) as CurrentUserResponse;
  const role = body.user?.role;
  const normalizedRole: UserRole =
    role === "ADMIN" ? "ADMIN" : role === "PROVIDER" ? "PROVIDER" : "CONSUMER";
  const plan = body.user?.plan;
  const normalizedPlan: UserPlan = plan === "pro" || plan === "team" ? plan : "free";
  const rawSource = body.user?.planSource;
  const planSource: PlanSource =
    rawSource === "trial" || rawSource === "code" ? rawSource : "stripe";

  return {
    role: normalizedRole,
    plan: normalizedPlan,
    planSource,
    trialRedeemed: body.user?.trialRedeemed === true,
    currentPeriodEnd: body.user?.currentPeriodEnd ?? null,
  };
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
  // Native "storage" events don't fire in the tab that made the change, so
  // same-tab listeners (e.g. useAuth) need this to notice login/logout.
  window.dispatchEvent(new Event("secretleaf:authChanged"));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("secretleaf:authChanged"));
};

export const registerWithSupabase = async (input: SupabaseAuthInput): Promise<SessionData | null> => {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    ...(input.locale ? { options: { data: { locale: input.locale } } } : {}),
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

  const authFields = await fetchUserFromApi(accessToken);

  const session = toSessionData({
    accessToken,
    userId: user.id,
    email: user.email,
    ...authFields,
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

  const authFields = await fetchUserFromApi(data.session.access_token);

  const session = toSessionData({
    accessToken: data.session.access_token,
    userId: data.user.id,
    email: data.user.email,
    ...authFields,
  });
  saveSession(session);
  return session;
};

export const restoreSessionFromSupabase = async (): Promise<SessionData | null> => {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session || !data.session.user) {
    // Supabase has no live session. The cached custom session (if any) is stale:
    // treating it as authenticated would let RLS-protected writes (grows, plants,
    // log entries) run without a JWT, so `auth.uid()` is NULL and Postgres rejects
    // every insert with 42501 — silently losing user data. Clear it and force a
    // fresh login so UI auth state always matches the real Supabase session.
    clearSession();
    return null;
  }

  // Always refresh role + plan from API to keep them in sync
  const authFields = await fetchUserFromApi(data.session.access_token);

  const session = toSessionData({
    accessToken: data.session.access_token,
    userId: data.session.user.id,
    email: data.session.user.email,
    ...authFields,
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
