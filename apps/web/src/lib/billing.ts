// ────────────────────────────────────────────────────────────────────────────
// Billing — shared constants + helpers for the non-Stripe entitlement paths
// ────────────────────────────────────────────────────────────────────────────
//
// Paid Pro (Stripe live mode) is deferred (see TODO.md). Until then Pro is
// granted two ways, both writing the same `subscriptions` row that
// getUserSubscription() reads:
//   • a one-time self-serve 30-day trial  → POST /api/billing/trial
//   • an admin-generated redeemable code  → POST /api/billing/redeem
//
// Kept in one module so the API routes, the admin panel and the pricing page
// agree on the trial length and on how a code string is normalized.
// ────────────────────────────────────────────────────────────────────────────

/** Length of the self-serve Pro trial, in days. */
export const TRIAL_DAYS = 30;

export const SUBSCRIPTIONS_TABLE = "subscriptions";
export const PRO_CODES_TABLE = "pro_codes";
export const PRO_CODE_REDEMPTIONS_TABLE = "pro_code_redemptions";

/**
 * Canonical form of a Pro code: uppercase, no whitespace, only A–Z/0–9 and
 * dashes. Applied on both the write side (admin create) and every read side
 * (redeem lookup) so "secretleaf-abc1 " and "SECRETLEAF-ABC1" match.
 */
export function normalizeCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
}

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I/O/0/1 — avoids read-aloud confusion

/**
 * Generates a random code like `SECRETLEAF-7K4P-Q9WM`. Not cryptographically
 * sensitive (a redeemed code only grants Pro time, and each is single-use by
 * default), but drawn from crypto.getRandomValues where available.
 */
export function generateCode(): string {
  const pick = (n: number): string => {
    const bytes = new Uint8Array(n);
    if (typeof globalThis.crypto?.getRandomValues === "function") {
      globalThis.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < n; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
  };
  return `SECRETLEAF-${pick(4)}-${pick(4)}`;
}
