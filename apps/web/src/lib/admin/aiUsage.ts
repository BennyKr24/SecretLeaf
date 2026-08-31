// ────────────────────────────────────────────────────────────────────────────
// AI usage — write path
//
// Every Claude API call records one `ai_usage` row with a cost estimate
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §3.3). Fire-and-forget: a failed insert
// is logged and swallowed, never bubbles up to the caller.
// ────────────────────────────────────────────────────────────────────────────

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { logError } from "@/lib/log";
import { anthropicCostCents } from "@/lib/admin/pricing";

export const AI_USAGE_TABLE = "ai_usage";

/** Shape of the `usage` object on an Anthropic Messages response. */
export type AnthropicUsage = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
};

export async function recordAiUsage(args: {
  model: string;
  feature: string;
  usage: AnthropicUsage | null | undefined;
  actorId?: string | null;
}): Promise<void> {
  try {
    const u = args.usage ?? {};
    const inputTokens = u.input_tokens ?? 0;
    const outputTokens = u.output_tokens ?? 0;
    const cacheReadTokens = u.cache_read_input_tokens ?? 0;
    const cacheWriteTokens = u.cache_creation_input_tokens ?? 0;

    const costCents = anthropicCostCents({
      model: args.model,
      inputTokens,
      outputTokens,
      cacheReadTokens,
      cacheWriteTokens,
    });

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from(AI_USAGE_TABLE).insert({
      model: args.model,
      feature: args.feature,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cache_read_tokens: cacheReadTokens,
      cache_write_tokens: cacheWriteTokens,
      cost_cents: costCents,
      actor_id: args.actorId ?? null,
    });
    if (error) {
      logError("admin.ai_usage.write_failed", { feature: args.feature, error: error.message });
    }
  } catch (err) {
    logError("admin.ai_usage.write_threw", {
      feature: args.feature,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
