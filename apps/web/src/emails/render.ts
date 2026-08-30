import * as React from "react";
import { render } from "@react-email/render";
import { ActionEmail, type ActionTemplateKey } from "./ActionEmail";
import { strings, type EmailLocale } from "./_strings";

// Supabase `email_action_type` → unser Template. Nur die Typen, die die App
// tatsächlich auslöst (signup, recovery), sind gemappt. magiclink/email_change
// sind vorbereitet; invite/reauthentication bewusst nicht (kein UI dafür — der
// Hook loggt sie und sendet nichts, siehe route.ts).
const ACTION_MAP: Record<string, ActionTemplateKey> = {
  signup: "confirmSignup",
  recovery: "resetPassword",
  magiclink: "magicLink",
  email_change: "changeEmail",
  email_change_current: "changeEmail",
  email_change_new: "changeEmail",
};

export function templateForAction(action: string): ActionTemplateKey | null {
  return ACTION_MAP[action] ?? null;
}

/** DE, sofern nicht klar EN (user_metadata.locale oder /en/-Pfad im redirect). */
export function resolveLocale(
  metadataLocale: unknown,
  redirectTo: string | undefined,
): EmailLocale {
  if (metadataLocale === "en") return "en";
  if (metadataLocale === "de") return "de";
  try {
    if (redirectTo) {
      const path = new URL(redirectTo, "https://x").pathname;
      if (/^\/en(\/|$)/.test(path)) return "en";
    }
  } catch {
    /* ignore */
  }
  return "de";
}

/**
 * Baut den Supabase-Verify-Link. Muster aus den Supabase-Docs:
 * /auth/v1/verify?token=<token_hash>&type=<action>&redirect_to=<url>
 * (der Query-Param heißt `token`, enthält aber den Hash — so dokumentiert.)
 */
export function buildActionUrl(opts: {
  siteUrl: string;
  tokenHash: string;
  action: string;
  redirectTo: string;
}): string {
  const u = new URL("/auth/v1/verify", opts.siteUrl);
  u.searchParams.set("token", opts.tokenHash);
  u.searchParams.set("type", opts.action);
  u.searchParams.set("redirect_to", opts.redirectTo);
  return u.toString();
}

export async function renderActionEmail(input: {
  templateKey: ActionTemplateKey;
  locale: EmailLocale;
  actionUrl: string;
  recipientEmail: string;
}): Promise<{ subject: string; html: string; text: string }> {
  const el = React.createElement(ActionEmail, input);
  const [html, text] = await Promise.all([
    render(el),
    render(el, { plainText: true }),
  ]);
  return {
    subject: strings[input.templateKey][input.locale].subject,
    html,
    text,
  };
}
