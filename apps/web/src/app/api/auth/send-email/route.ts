// ──────────────────────────────────────────────────────────────────────────────
// Supabase Auth — "Send Email" Hook
// ──────────────────────────────────────────────────────────────────────────────
//
// POST /api/auth/send-email   (standardwebhooks-Signatur, raw body)
//
// Ist der Hook im Supabase-Dashboard aktiv, versendet Supabase KEINE Mails mehr
// selbst — dieser Endpoint rendert die React-Email-Templates locale-aware und
// verschickt über Brevo. Fällt der Endpoint aus, im Dashboard 1-Klick
// deaktivieren → Supabase fällt auf die eingebauten Templates + Custom SMTP
// zurück (deshalb Custom SMTP trotzdem einrichten).
//
// Konfiguration: docs/EMAIL_TEMPLATES_PLAN.md §4.
// ──────────────────────────────────────────────────────────────────────────────

import { Webhook } from "standardwebhooks";
import { getEmailEnv } from "@/lib/env";
import { logError, logInfo, logWarn } from "@/lib/log";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import {
  buildActionUrl,
  renderActionEmail,
  resolveLocale,
  templateForAction,
} from "@/emails/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HookPayload = {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown> | null;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to?: string;
    email_action_type: string;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
};

export async function POST(request: Request): Promise<Response> {
  const { hookSecret } = getEmailEnv();
  const raw = await request.text();

  // standardwebhooks erwartet den base64-Secret ohne den Supabase-Prefix.
  const secret = hookSecret.replace(/^v1,whsec_/, "");
  let payload: HookPayload;
  try {
    payload = new Webhook(secret).verify(raw, {
      "webhook-id": request.headers.get("webhook-id") ?? "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": request.headers.get("webhook-signature") ?? "",
    }) as HookPayload;
  } catch (err) {
    logWarn("auth.send_email.bad_signature", {
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  const { user, email_data } = payload;
  const action = email_data.email_action_type;
  const templateKey = templateForAction(action);

  // Typen, die die App nicht auslöst (invite, reauthentication, …): loggen,
  // aber 200 zurückgeben, damit Supabase nicht endlos retryt. Wenn diese Flows
  // je aktiviert werden, gehören eigene Templates dazu.
  if (!templateKey) {
    logWarn("auth.send_email.unmapped_action", { action });
    return Response.json({}, { status: 200 });
  }

  const redirectTo = email_data.redirect_to || email_data.site_url;
  const locale = resolveLocale(user.user_metadata?.locale, redirectTo);
  const actionUrl = buildActionUrl({
    siteUrl: email_data.site_url,
    tokenHash: email_data.token_hash,
    action,
    redirectTo,
  });

  try {
    const { subject, html, text } = await renderActionEmail({
      templateKey,
      locale,
      actionUrl,
      recipientEmail: user.email,
    });

    const result = await sendTransactionalEmail({ to: user.email, subject, html, text });
    if (!result.ok) {
      logError("auth.send_email.provider_error", {
        action,
        status: result.status,
        body: result.body,
      });
      return Response.json({ error: "send failed" }, { status: 500 });
    }

    logInfo("auth.send_email.sent", { action, locale, messageId: result.messageId });
    return Response.json({}, { status: 200 });
  } catch (err) {
    logError("auth.send_email.exception", {
      action,
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}

export function GET(): Response {
  return Response.json({ error: "method not allowed" }, { status: 405 });
}
