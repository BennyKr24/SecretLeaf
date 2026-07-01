import { NextResponse } from 'next/server';
import { z } from 'zod';

const LOOPS_CONTACTS_URL = 'https://app.loops.so/api/v1/contacts/create';

const schema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
});

export function GET() {
  return NextResponse.json({
    provider: 'loops',
    configured: Boolean(process.env.LOOPS_API_KEY),
    environment: process.env.NODE_ENV,
  });
}

async function subscribeWithLoops(email: string) {
  const apiKey = process.env.LOOPS_API_KEY;
  if (!apiKey) {
    return { configured: false as const };
  }

  const response = await fetch(LOOPS_CONTACTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const providerMessage = await response.text().catch(() => '');
    throw new Error(`Loops signup failed: ${response.status} ${providerMessage}`.trim());
  }

  return { configured: true as const };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Ungültige Eingabe' },
      { status: 422 },
    );
  }

  const { email } = parsed.data;

  try {
    const result = await subscribeWithLoops(email);

    if (!result.configured) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Newsletter ist aktuell nicht konfiguriert.' },
          { status: 503 },
        );
      }

      console.info('[Newsletter] Provider not configured; accepted local dry-run signup.');
    }
  } catch (error) {
    console.error('[Newsletter] Signup failed:', error);
    return NextResponse.json(
      { error: 'Newsletter-Anmeldung fehlgeschlagen. Bitte versuche es später erneut.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
