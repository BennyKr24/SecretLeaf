import Anthropic from "@anthropic-ai/sdk";
import { recordAiUsage } from "@/lib/admin/aiUsage";

const MODEL = "claude-opus-5";

// ────────────────────────────────────────────────────────────────────────────
// Admin-only Claude API access. Never imported by user-facing code paths —
// every caller must go through an admin-gated route (see
// api/admin/assistant) so normal users can't trigger billed API calls.
// ────────────────────────────────────────────────────────────────────────────

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY ist nicht gesetzt. In Vercel/​.env.local als Environment-Variable hinterlegen, um die Claude-Integration zu aktivieren."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function askClaude(
  prompt: string,
  system?: string,
  opts?: { feature?: string; actorId?: string | null },
): Promise<string> {
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    ...(system ? { system } : {}),
    messages: [{ role: "user", content: prompt }],
  });

  // Cost tracking for the Finanzen module — fire-and-forget.
  void recordAiUsage({
    model: MODEL,
    feature: opts?.feature ?? "admin-assistant",
    usage: response.usage,
    actorId: opts?.actorId ?? null,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (response.stop_reason === "refusal" || !textBlock) {
    throw new Error("Claude konnte auf diese Anfrage nicht antworten.");
  }
  return textBlock.text;
}
