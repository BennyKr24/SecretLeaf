type RequiredEnvName =
  | "SUPABASE_URL"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "CRON_SECRET"
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET"
  | "STRIPE_PRICE_ID_PRO_MONTHLY"
  | "STRIPE_PRICE_ID_PRO_YEARLY"
  | "NEXT_PUBLIC_SITE_URL"
  | "BREVO_API_KEY"
  | "SEND_EMAIL_HOOK_SECRET"
  | "EMAIL_FROM"
  | "EMAIL_REPLY_TO";

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

export function getStripeServerEnv(): {
  secretKey: string;
  webhookSecret: string;
  priceIdMonthly: string;
  priceIdYearly: string;
  siteUrl: string;
} {
  return {
    secretKey: requireEnv("STRIPE_SECRET_KEY"),
    webhookSecret: requireEnv("STRIPE_WEBHOOK_SECRET"),
    priceIdMonthly: requireEnv("STRIPE_PRICE_ID_PRO_MONTHLY"),
    priceIdYearly: requireEnv("STRIPE_PRICE_ID_PRO_YEARLY"),
    siteUrl: requireEnv("NEXT_PUBLIC_SITE_URL"),
  };
}

export function getEmailEnv(): {
  brevoApiKey: string;
  hookSecret: string;
  from: string;
  fromName: string;
  replyTo: string;
} {
  return {
    brevoApiKey: requireEnv("BREVO_API_KEY"),
    hookSecret: requireEnv("SEND_EMAIL_HOOK_SECRET"),
    from: requireEnv("EMAIL_FROM"),
    fromName: process.env.EMAIL_FROM_NAME?.trim() || "SecretLeaf",
    replyTo: requireEnv("EMAIL_REPLY_TO"),
  };
}
