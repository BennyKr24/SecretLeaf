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

// ── Nutzer ──────────────────────────────────────────────────────────────────

export type AdminUserRole = "CONSUMER" | "PROVIDER" | "ADMIN";
export type AdminUserPlan = "free" | "pro" | "team";

export type AdminUserRow = {
  id: string;
  email: string | null;
  role: AdminUserRole;
  banned: boolean;
  plan: AdminUserPlan;
  subStatus: string | null;
  currentPeriodEnd: string | null;
  emailConfirmed: boolean;
  provider: string;
  createdAt: string;
  lastSignInAt: string | null;
};

export type AdminUserDetail = AdminUserRow & {
  stripeCustomerId: string | null;
  grows: number;
  logEntries: number;
  lastLogAt: string | null;
  lastDiagnosisAt: string | null;
};

export const adminUsersQuerySchema = listQuerySchema.extend({
  role: z.enum(["CONSUMER", "PROVIDER", "ADMIN"]).optional(),
  plan: z.enum(["free", "pro", "team"]).optional(),
});

export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;

export const adminUserPatchSchema = z
  .object({
    role: z.enum(["CONSUMER", "PROVIDER", "ADMIN"]).optional(),
    banned: z.boolean().optional(),
    /** true = grant Pro, false = revoke to free */
    grantPro: z.boolean().optional(),
  })
  .refine((v) => v.role !== undefined || v.banned !== undefined || v.grantPro !== undefined, {
    message: "Nichts zu ändern",
  });

// ── Neuigkeiten / Updates ───────────────────────────────────────────────────

export type AdminUpdate = {
  id: string;
  slug: string;
  version: string | null;
  date: string;
  title: string;
  summary: string;
  category: string;
  featured: boolean;
  published: boolean;
  /** true when the row carries rich `sections` content (JSON import) */
  hasSections: boolean;
  /** also shown as the site-wide banner (subject to the window below) */
  banner: boolean;
  bannerStartsAt: string | null;
  bannerEndsAt: string | null;
  updatedAt: string;
};

export type AdminUpdatesResponse = {
  updates: AdminUpdate[];
  categories: string[];
};

export const updateCreateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "nur Kleinbuchstaben, Ziffern und Bindestriche"),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(1000),
  category: z.string().min(1).max(40),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  version: z.string().max(40).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  banner: z.boolean().optional(),
  bannerStartsAt: z.string().datetime().nullable().optional(),
  bannerEndsAt: z.string().datetime().nullable().optional(),
});

export type UpdateCreateInput = z.infer<typeof updateCreateSchema>;

export const updatePatchSchema = updateCreateSchema.partial();

// ── Steuerung ───────────────────────────────────────────────────────────────

export type ControlFlag = {
  key: string;
  enabled: boolean;
  description: string;
  updatedAt: string | null;
  /** true when the value is the code default (no DB row yet) */
  isDefault: boolean;
};

export type DecisionStatus = "open" | "decided" | "dropped";

export type DecisionEntry = {
  id: string;
  title: string;
  status: DecisionStatus;
  context: string | null;
  decision: string | null;
  decidedAt: string | null;
  createdAt: string;
};

export type AdminControl = {
  generatedAt: string;
  flags: ControlFlag[];
  decisions: DecisionEntry[];
};

export const flagPatchSchema = z.object({
  key: z.string().min(1).max(64),
  enabled: z.boolean(),
  /** when provided, replaces the flag's message text (e.g. the maintenance-mode banner copy) */
  description: z.string().max(500).optional(),
});

export const decisionCreateSchema = z.object({
  title: z.string().min(1).max(200),
  context: z.string().max(4000).optional(),
});

export const decisionPatchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "decided", "dropped"]).optional(),
  decision: z.string().max(4000).optional(),
});

// ── Finanzen ────────────────────────────────────────────────────────────────

export type FinanceCostMonth = {
  /** "YYYY-MM" */
  month: string;
  /** cents per service, incl. synthetic "anthropic" from ai_usage */
  byService: Record<string, number>;
  totalCents: number;
};

export type AdminFinance = {
  generatedAt: string;
  revenue: {
    /** true once live Stripe figures below are populated */
    stripeConnected: boolean;
    activePro: number;
    trialing: number;
    pastDue: number;
    canceled30d: number;
    /** estimate: activePro × monthly price */
    estimatedMrrCents: number;
    /** live Stripe, current calendar month — null when not connected */
    grossMtdCents: number | null;
    feesMtdCents: number | null;
    netMtdCents: number | null;
  };
  costs: {
    /** last 6 months, oldest → newest */
    months: FinanceCostMonth[];
    currentMonthCents: number;
    aiUsageMtdCents: number;
    aiCallsMtd: number;
  };
  /** current-month costs minus current-month net revenue (or est. MRR) */
  burnMtdCents: number;
  stripeHealth: {
    lastEventAt: string | null;
    lastEventType: string | null;
    unprocessedCount: number;
    recentErrors: Array<{ id: string; type: string; receivedAt: string; error: string }>;
  };
};

export const financeCostSchema = z.object({
  service: z.string().min(1).max(40),
  /** "YYYY-MM" */
  periodMonth: z.string().regex(/^\d{4}-\d{2}$/),
  amountCents: z.coerce.number().int().min(0).max(100_000_00),
  note: z.string().max(280).optional(),
});

export type FinanceCostInput = z.infer<typeof financeCostSchema>;

// ── Wachstum ────────────────────────────────────────────────────────────────

export type GrowthFunnelStage = {
  key: string;
  label: string;
  users: number;
  /** % of the first stage (total signups) */
  pctOfTotal: number;
  /** % of the previous stage — null for the first stage */
  pctOfPrevious: number | null;
};

export type GrowthMonth = {
  /** "YYYY-MM" */
  month: string;
  newSignups: number;
  newPro: number;
  /** newPro / newSignups for that month, 0 when newSignups is 0 */
  conversionPct: number;
};

export type AdminGrowth = {
  generatedAt: string;
  funnel: GrowthFunnelStage[];
  activationPct: number;
  /** last 6 months, oldest → newest */
  months: GrowthMonth[];
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

// ── Pro-Codes ───────────────────────────────────────────────────────────────

export type ProCode = {
  id: string;
  code: string;
  durationDays: number;
  maxRedemptions: number;
  redemptionCount: number;
  note: string | null;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
};

export type AdminProCodesResponse = {
  codes: ProCode[];
};

export const proCodeCreateSchema = z.object({
  durationDays: z.coerce.number().int().min(1).max(3650),
  maxRedemptions: z.coerce.number().int().min(1).max(10_000).optional(),
  note: z.string().max(280).optional(),
  expiresAt: z.string().datetime().optional(),
});

export const proCodePatchSchema = z.object({
  active: z.boolean(),
});

// ── Content / Studien ───────────────────────────────────────────────────────

/** One row of the studies moderation queue. Mirrors STUDIES_SELECT in
 *  app/api/admin/content/studies/route.ts. Legacy DBs without the engine
 *  columns get them back as null (see normalizeLegacyStudyRow). */
export type StudyRow = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  tags: string[];
  quality_status: string;
  relevance_score: number | null;
  study_type: string | null;
  editorial_priority: string | null;
  matched_topics: string[] | null;
  flags: string[] | null;
  first_author: string | null;
  origin_label: string | null;
  created_at: string | null;
  fetched_at: string | null;
  doi: string | null;
};

export type AdminStudiesResponse = {
  studies: StudyRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** GET /api/admin/content/studies query. All filters optional; unknown
 *  sortBy is clamped server-side to a safe column. */
export const adminStudiesQuerySchema = listQuerySchema.extend({
  quality: z.enum(["all", "pending", "good", "bad"]).optional(),
  priority: z.enum(["all", "high", "medium", "low"]).optional(),
  studyType: z.string().max(64).optional(),
  source: z.string().trim().max(200).optional(),
  minScore: z.coerce.number().optional(),
  maxScore: z.coerce.number().optional(),
  dateFrom: z.string().max(40).optional(),
  dateTo: z.string().max(40).optional(),
});

export type AdminStudiesQuery = z.infer<typeof adminStudiesQuerySchema>;

/** PATCH /api/admin/content/studies/[id] body. At least one field required. */
export const studyUpdateSchema = z
  .object({
    qualityStatus: z.enum(["pending", "good", "bad"]).optional(),
    editorialPriority: z.enum(["high", "medium", "low"]).optional(),
    title: z.string().trim().max(500).optional(),
    description: z.string().max(20_000).optional(),
    tags: z.array(z.string().trim().max(80)).max(50).optional(),
    reviewNote: z.string().max(4_000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Keine Felder zum Aktualisieren" });

export type StudyUpdateInput = z.infer<typeof studyUpdateSchema>;

// ── Assistent ───────────────────────────────────────────────────────────────

export type AssistantMessage = {
  id: string;
  prompt: string;
  reply: string;
  createdAt: string;
};

export type AdminAssistantResponse = {
  messages: AssistantMessage[];
};

export const assistantAskSchema = z.object({
  prompt: z.string().trim().min(1).max(8_000),
});

export type AssistantAskInput = z.infer<typeof assistantAskSchema>;
