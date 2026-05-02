import { NextResponse } from 'next/server';
import { z } from 'zod';

// ────────────────────────────────────────────────────────────────────────────
// POST /api/newsletter
//
// Receives an email address and adds it to a mailing list.
//
// Current implementation: logs the signup + returns success.
//
// To connect to a real email provider, replace the TODO block:
//
//   Resend (recommended):
//     const resend = new Resend(process.env.RESEND_API_KEY);
//     await resend.contacts.create({
//       email,
//       audienceId: process.env.RESEND_AUDIENCE_ID!,
//     });
//
//   Loops.so:
//     await fetch('https://app.loops.so/api/v1/contacts/create', {
//       method: 'POST',
//       headers: { Authorization: `Bearer ${process.env.LOOPS_API_KEY}` },
//       body: JSON.stringify({ email }),
//     });
// ────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
});

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

  // TODO: Replace this block with your email provider
  // For now: log the signup server-side
  console.log('[Newsletter] New signup:', email);

  return NextResponse.json({ ok: true });
}
