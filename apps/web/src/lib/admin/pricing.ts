// ────────────────────────────────────────────────────────────────────────────
// Anthropic API pricing — $/1M tokens.
//
// Source: the `claude-api` skill's model table (cached 2026-06-24). Update
// here when prices change. Cache read ≈ 0.1× input, cache write ≈ 1.25× input.
//
// Used to estimate `ai_usage.cost_cents` for the Finanzen module
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §3.3). It's an estimate, not a billed
// figure — the real number comes from the Anthropic console.
// ────────────────────────────────────────────────────────────────────────────

type ModelPrice = { inputPerM: number; outputPerM: number };

const ANTHROPIC_PRICING: Record<string, ModelPrice> = {
  "claude-fable-5": { inputPerM: 10, outputPerM: 50 },
  "claude-mythos-5": { inputPerM: 10, outputPerM: 50 },
  "claude-opus-5": { inputPerM: 5, outputPerM: 25 },
  "claude-opus-4-8": { inputPerM: 5, outputPerM: 25 },
  "claude-opus-4-7": { inputPerM: 5, outputPerM: 25 },
  "claude-opus-4-6": { inputPerM: 5, outputPerM: 25 },
  "claude-sonnet-5": { inputPerM: 2, outputPerM: 10 },
  "claude-sonnet-4-6": { inputPerM: 3, outputPerM: 15 },
  "claude-haiku-4-5": { inputPerM: 1, outputPerM: 5 },
};

/** Assume Opus-tier when the model id isn't in the table. */
const DEFAULT_PRICE: ModelPrice = { inputPerM: 5, outputPerM: 25 };

export function anthropicCostCents(args: {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
}): number {
  const p = ANTHROPIC_PRICING[args.model] ?? DEFAULT_PRICE;
  const perM = (tokens: number) => tokens / 1_000_000;
  const usd =
    perM(args.inputTokens) * p.inputPerM +
    perM(args.outputTokens) * p.outputPerM +
    perM(args.cacheReadTokens ?? 0) * p.inputPerM * 0.1 +
    perM(args.cacheWriteTokens ?? 0) * p.inputPerM * 1.25;
  return usd * 100;
}
