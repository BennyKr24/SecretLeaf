// Dünner Adapter für Brevos Transactional-API. Kein SDK — ein fetch.
// Ein Wechsel zu Resend/SES wäre das Ersetzen dieser einen Funktion.
// Doku: https://developers.brevo.com/reference/sendtransacemail

import { getEmailEnv } from "@/lib/env";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export type SendResult = { ok: true; messageId?: string } | { ok: false; status: number; body: string };

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const env = getEmailEnv();

  const res = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": env.brevoApiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: env.from, name: env.fromName },
      replyTo: { email: env.replyTo },
      to: [{ email: input.to }],
      subject: input.subject,
      htmlContent: input.html,
      textContent: input.text,
    }),
    // Der Supabase-Hook hat ein enges Zeitbudget — nicht ewig hängen bleiben.
    signal: AbortSignal.timeout(10_000),
  });

  if (res.ok) {
    const data = (await res.json().catch(() => ({}))) as { messageId?: string };
    return data.messageId ? { ok: true, messageId: data.messageId } : { ok: true };
  }
  const body = await res.text().catch(() => "");
  return { ok: false, status: res.status, body: body.slice(0, 500) };
}
