// ────────────────────────────────────────────────────────────────────────────
// Admin API — shared request/response contracts
//
// One source of truth for the shapes exchanged between the admin client and
// `app/api/admin/<resource>/route.ts` handlers. Replaces the per-page inline
// type declarations of the old `/api/admin/dashboard` mega-route
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §2.2 / §5).
//
// zod schemas are the runtime gate; the exported TS types are `z.infer` of
// those schemas so the two can never drift.
// ────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// ── Pagination ──────────────────────────────────────────────────────────────

/** Query params every list endpoint accepts. Parsed from the URL search
 *  params, so everything arrives as a string and is coerced here. */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(200).optional(),
  sortBy: z.string().max(64).optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

/** Envelope every list endpoint returns. */
export type AdminListResponse<T> = {
  rows: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function buildListResponse<T>(
  rows: T[],
  total: number,
  query: Pick<ListQuery, "page" | "limit">,
): AdminListResponse<T> {
  return {
    rows,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

// ── Errors ──────────────────────────────────────────────────────────────────

export type AdminErrorBody = { error: string; issues?: unknown };

// ── Lage / Briefing ─────────────────────────────────────────────────────────

export type BriefingRun = {
  jobName: string;
  label: string;
  scheduleLabel: string;
  lastRun: {
    success: boolean;
    finishedAt: string;
    durationSeconds: number | null;
    error: string | null;
  } | null;
  /** no successful run within 1.5× the schedule interval */
  stale: boolean;
};

export type BriefingAttention = {
  severity: "error" | "warn" | "info";
  text: string;
  href: string;
};

export type AdminBriefing = {
  generatedAt: string;
  money: {
    /** true once the Stripe webhook/API is wired (Phase 2); until then the
     *  figures below are derived from the `subscriptions` table only */
    stripeConnected: boolean;
    activePro: number;
    trialing: number;
    pastDue: number;
    canceled30d: number;
    /** estimate: activePro × monthly price — not real billed revenue yet */
    estimatedMrrCents: number;
  };
  people: {
    totalUsers: number;
    newUsers24h: number;
    newUsers7d: number;
    activeGrows: number;
    /** share (0–1) of last-7d new users that have created ≥1 grow */
    activation7d: number;
    logEntries24h: number;
  };
  content: {
    pendingReview: number;
    newStudies24h: number;
    totalStudies: number;
    feedbackEvents7d: number;
  };
  runs: BriefingRun[];
  attention: BriefingAttention[];
};

// ── Betrieb / Ops ───────────────────────────────────────────────────────────

export type OpsLastRun = {
  success: boolean;
  startedAt: string | null;
  finishedAt: string;
  durationSeconds: number | null;
  error: string | null;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  metadata: Record<string, unknown> | null;
};

export type OpsJob = {
  jobName: string;
  path: string;
  label: string;
  description: string;
  schedule: string;
  scheduleLabel: string;
  nextRunIso: string | null;
  lastRun: OpsLastRun | null;
  /** 0–1 over the last 30 days, null if no runs */
  successRate30d: number | null;
  avgDurationSeconds: number | null;
  runs30d: number;
  stale: boolean;
};

export type OpsErrorMemory = {
  jobName: string;
  fingerprint: string;
  failCount: number;
  lastError: string | null;
  firstFailedAt: string;
  lastFailedAt: string;
  nextRetryAt: string | null;
};

export type OpsIntegration = {
  key: string;
  label: string;
  configured: boolean;
  note: string;
};

export type OpsRecentRun = {
  jobName: string;
  success: boolean;
  finishedAt: string;
  durationSeconds: number | null;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  error: string | null;
};

export type AdminOps = {
  generatedAt: string;
  jobs: OpsJob[];
  errorMemory: OpsErrorMemory[];
  integrations: OpsIntegration[];
  recentRuns: OpsRecentRun[];
};

export const opsRunSchema = z.object({
  /** the job's `jobName` from the cron registry */
  job: z.string().min(1).max(64),
  dryRun: z.boolean().optional(),
  lookbackDays: z.coerce.number().int().min(1).max(90).optional(),
  maxProcessed: z.coerce.number().int().min(1).max(1000).optional(),
  batchSize: z.coerce.number().int().min(1).max(200).optional(),
});

export type OpsRunInput = z.infer<typeof opsRunSchema>;

// ── Audit ───────────────────────────────────────────────────────────────────

export const auditListQuerySchema = listQuerySchema.extend({
  resource: z.string().max(64).optional(),
  actorId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type AuditListQuery = z.infer<typeof auditListQuerySchema>;

export type AuditEntry = {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  resource: string;
  resourceId: string | null;
  action: string;
  before: unknown;
  after: unknown;
  parentId: string | null;
  createdAt: string;
};
