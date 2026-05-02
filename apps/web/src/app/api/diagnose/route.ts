// ────────────────────────────────────────────────────────────────────────────
// AI Plant Diagnose — API route scaffold
//
// BLOCKED ON: OpenAI API key + Stripe (rate-limit / paywall)
// Next steps:
//   1. `npm install openai`
//   2. Add OPENAI_API_KEY to Vercel env vars
//   3. (Optional) Add Stripe metered billing before enabling in production
//   4. Replace the TODO block below with real OpenAI Vision API call
//   5. Add rate limiting (e.g. 5 free diagnoses per user per day via Supabase)
// ────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';

export type DiagnoseInput = {
  /** Base64-encoded image (JPEG/WEBP, max 4 MB) */
  imageBase64: string;
  /** Optional context to improve diagnosis accuracy */
  context?: {
    growDay?: number;
    medium?: string;
    phaseId?: string;
    recentLogs?: string[];
  };
};

export type DiagnoseResult = {
  diagnosis: string;         // Short label, e.g. "Stickstoffmangel"
  confidence: 'high' | 'medium' | 'low';
  description: string;       // 2–3 sentence explanation
  recommendations: string[]; // Actionable steps
  severity: 'low' | 'medium' | 'high' | 'critical';
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: Request) {
  // TODO: Implement when OpenAI key + billing is ready
  //
  // const { imageBase64, context } = await req.json() as DiagnoseInput;
  //
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const response = await openai.chat.completions.create({
  //   model: 'gpt-4o',
  //   messages: [
  //     { role: 'system', content: DIAGNOSE_SYSTEM_PROMPT },
  //     {
  //       role: 'user',
  //       content: [
  //         { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
  //         { type: 'text', text: buildContextPrompt(context) },
  //       ],
  //     },
  //   ],
  //   response_format: { type: 'json_object' },
  // });
  // const result = JSON.parse(response.choices[0]!.message.content!) as DiagnoseResult;
  // return NextResponse.json(result);

  return NextResponse.json(
    { error: 'AI Diagnose ist noch nicht verfügbar.' },
    { status: 501 },
  );
}
