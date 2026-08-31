// ────────────────────────────────────────────────────────────────────────────
// Admin audit — write path
//
// Every mutating admin action records one row in `admin_audit_log`
// (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §2.4). Use `withAudit()` to wrap a
// mutation so the log entry and a field-level diff are produced automatically;
// use `recordAuditEntry()` directly for the parent row of a bulk action.
//
// A failure to write the audit row must NOT fail the underlying action — it
// is logged and swallowed. Losing an audit line is bad; rolling back a
// completed user-facing mutation because the log write hiccuped is worse.
// ────────────────────────────────────────────────────────────────────────────

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { logError } from "@/lib/log";

export const ADMIN_AUDIT_TABLE = "admin_audit_log";

export type AuditActor = { userId: string; email: string | null };

export type AuditInput = {
  resource: string;
  /** id of the affected row, or null for collection-level actions. */
  resourceId?: string | null;
  action: string;
  before?: unknown;
  after?: unknown;
  /** links this row to a parent bulk-action row. */
  parentId?: string | null;
};

/** Shallow field-level diff: keys whose JSON value changed, with old/new. */
export function diffFields(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
): { before: Record<string, unknown>; after: Record<string, unknown> } {
  const b = before ?? {};
  const a = after ?? {};
  const keys = new Set([...Object.keys(b), ...Object.keys(a)]);
  const changedBefore: Record<string, unknown> = {};
  const changedAfter: Record<string, unknown> = {};
  for (const key of keys) {
    if (JSON.stringify(b[key]) !== JSON.stringify(a[key])) {
      changedBefore[key] = b[key];
      changedAfter[key] = a[key];
    }
  }
  return { before: changedBefore, after: changedAfter };
}

/**
 * Insert one audit row. Returns the new row id (for use as a bulk parent),
 * or null if the write failed.
 */
export async function recordAuditEntry(
  actor: AuditActor,
  input: AuditInput,
): Promise<string | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from(ADMIN_AUDIT_TABLE)
      .insert({
        actor_id: actor.userId,
        actor_email: actor.email,
        resource: input.resource,
        resource_id: input.resourceId ?? null,
        action: input.action,
        before: input.before ?? null,
        after: input.after ?? null,
        parent_id: input.parentId ?? null,
      })
      .select("id")
      .single();

    if (error) {
      logError("admin.audit.write_failed", { resource: input.resource, action: input.action, error: error.message });
      return null;
    }
    return (data as { id: string }).id;
  } catch (err) {
    logError("admin.audit.write_threw", {
      resource: input.resource,
      action: input.action,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Run a mutation and then record an audit row for it. Put the before/after
 * snapshots (or a `diffFields()` result) on `input`. The audit write never
 * throws — a failed log does not roll back the mutation.
 */
export async function withAudit<T>(
  actor: AuditActor,
  input: AuditInput,
  mutate: () => Promise<T>,
): Promise<T> {
  const result = await mutate();
  await recordAuditEntry(actor, input);
  return result;
}
