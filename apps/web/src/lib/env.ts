type RequiredEnvName = "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY" | "CRON_SECRET";

function requireEnv(name: RequiredEnvName): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseServerEnv(): { supabaseUrl: string; serviceRoleKey: string } {
  return {
    supabaseUrl: requireEnv("SUPABASE_URL"),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function getCronSecret(): string {
  return requireEnv("CRON_SECRET");
}
