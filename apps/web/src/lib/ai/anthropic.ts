import Anthropic from "@anthropic-ai/sdk";

// ────────────────────────────────────────────────────────────────────────────
// Admin-only Claude API access. Never imported by user-facing code paths —
// every caller must go through an admin-gated route (see api/admin/dashboard
// action "ai-assist") so normal users can't trigger billed API calls.
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

export async function askClaude(prompt: string, system?: string): Promise<string> {
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 4096,
    ...(system ? { system } : {}),
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (response.stop_reason === "refusal" || !textBlock) {
    throw new Error("Claude konnte auf diese Anfrage nicht antworten.");
  }
  return textBlock.text;
}
