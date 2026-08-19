// ────────────────────────────────────────────────────────────────────────────
// Analytics — Plausible wrapper
//
// Wraps window.plausible for type-safe event tracking.
// No-ops silently when Plausible is not loaded (dev, no domain configured).
//
// Usage:
//   track('grow_created', { umgebung: 'indoor' })
//   track('log_entry_added', { type: 'wasser' })
//   track('tool_used', { tool: 'wiki_bot' })
// ────────────────────────────────────────────────────────────────────────────

type PlausibleProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: PlausibleProps }) => void;
  }
}

export function track(event: string, props?: PlausibleProps): void {
  if (typeof window === 'undefined') return;
  if (typeof window.plausible !== 'function') return;
  window.plausible(event, props ? { props } : undefined);
}

// ── Typed event helpers ───────────────────────────────────────────────────────

export const Analytics = {
  growCreated: (umgebung: string, medium: string) =>
    track('grow_created', { umgebung, medium }),

  logEntryAdded: (type: string) =>
    track('log_entry_added', { type }),

  toolUsed: (tool: string) =>
    track('tool_used', { tool }),

  phaseAdvanced: (from: string, to: string) =>
    track('phase_advanced', { from, to }),

  harvestRecorded: () =>
    track('harvest_recorded'),

  newsletterSignup: () =>
    track('newsletter_signup'),

  wikiArticleOpened: (slug: string) =>
    track('wiki_article_opened', { slug }),

  updateViewed: (slug: string, category: string, version: string | null, featured: boolean) =>
    track('update_viewed', { slug, category, version: version ?? 'none', featured }),

  updateCtaClicked: (slug: string, target: string, category: string) =>
    track('update_cta_clicked', { slug, target, category }),

  updateCategoryViewed: (category: string) =>
    track('update_category_viewed', { category }),

  upgradeCtaClicked: (source: string) =>
    track('upgrade_cta_clicked', { source }),

  checkoutStarted: (interval: 'monthly' | 'yearly') =>
    track('checkout_started', { interval }),

  checkoutCompleted: () =>
    track('checkout_completed'),
} as const;
