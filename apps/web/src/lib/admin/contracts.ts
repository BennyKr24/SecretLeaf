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
