import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerEnv } from "@/lib/env";

let adminClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (adminClient) {
    return adminClient;
  }

  const { supabaseUrl, serviceRoleKey } = getSupabaseServerEnv();

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}
