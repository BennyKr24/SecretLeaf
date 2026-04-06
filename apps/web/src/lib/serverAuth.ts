import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

const USER_ROLES_TABLE = "user_roles";

type UserRoleRow = {
  user_id: string;
  role: UserRole;
};

function normalizeRole(value: string | null | undefined): UserRole {
  return value === "PROVIDER" ? "PROVIDER" : "CONSUMER";
}

export function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export async function getAuthenticatedUser(request: Request): Promise<{ token: string; user: User } | null> {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return { token, user: data.user };
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(USER_ROLES_TABLE)
    .select("user_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!error && data) {
    return normalizeRole((data as UserRoleRow).role);
  }

  const { data: inserted, error: insertError } = await supabase
    .from(USER_ROLES_TABLE)
    .upsert({ user_id: userId, role: "CONSUMER" }, { onConflict: "user_id" })
    .select("user_id, role")
    .single();

  if (insertError) {
    throw new Error(insertError.message || "Failed to resolve user role");
  }

  return normalizeRole((inserted as UserRoleRow).role);
}

export async function getAuthenticatedUserWithRole(
  request: Request
): Promise<{ userId: string; email: string | null; role: UserRole } | null> {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    return null;
  }

  const role = await getUserRole(auth.user.id);
  return {
    userId: auth.user.id,
    email: auth.user.email ?? null,
    role,
  };
}
