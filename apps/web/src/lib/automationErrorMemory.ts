import { getSupabaseServerClient } from "@/lib/supabaseServer";

const AUTOMATION_ERROR_MEMORY_TABLE = "automation_error_memory";
const DEFAULT_MIN_DELAY_MINUTES = 60;
const MAX_DELAY_HOURS = 72;

export type ErrorMemoryContext = {
  jobName: string;
  fingerprint: string;
  errorMessage: string;
  metadata?: Record<string, unknown>;
};

function getMinDelayMinutes(): number {
  const raw = Number.parseInt(process.env.AUTOMATION_ERROR_MEMORY_MIN_DELAY_MINUTES ?? "", 10);
  if (!Number.isFinite(raw)) return DEFAULT_MIN_DELAY_MINUTES;
  return Math.min(Math.max(raw, 5), 24 * 60);
}

function computeBackoffHours(nextFailCount: number): number {
  // 1, 2, 4, 8, 16, 32, 64, 72, 72, ...
  const exponential = 2 ** Math.max(0, nextFailCount - 1);
  return Math.min(exponential, MAX_DELAY_HOURS);
}

function createNextRetryAt(nextFailCount: number): string {
  const minDelayMinutes = getMinDelayMinutes();
  const delayMinutes = Math.max(minDelayMinutes, computeBackoffHours(nextFailCount) * 60);
  return new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
}

export async function getBlockedFingerprints(jobName: string, nowIso = new Date().toISOString()): Promise<Set<string>> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(AUTOMATION_ERROR_MEMORY_TABLE)
    .select("fingerprint")
    .eq("job_name", jobName)
    .gt("next_retry_at", nowIso)
    .limit(10_000);

  if (error) {
    throw new Error(error.message);
  }

  const blocked = new Set<string>();
  for (const row of data ?? []) {
    if (typeof row.fingerprint === "string" && row.fingerprint.length > 0) {
      blocked.add(row.fingerprint);
    }
  }

  return blocked;
}

export async function rememberAutomationError(context: ErrorMemoryContext): Promise<void> {
  const supabase = getSupabaseServerClient();

  const { data: existing, error: existingError } = await supabase
    .from(AUTOMATION_ERROR_MEMORY_TABLE)
    .select("id, fail_count, first_failed_at")
    .eq("job_name", context.jobName)
    .eq("fingerprint", context.fingerprint)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const nextFailCount = (typeof existing?.fail_count === "number" ? existing.fail_count : 0) + 1;
  const nowIso = new Date().toISOString();

  const payload = {
    job_name: context.jobName,
    fingerprint: context.fingerprint,
    fail_count: nextFailCount,
    last_error: context.errorMessage.slice(0, 2000),
    metadata: context.metadata ?? {},
    first_failed_at:
      typeof existing?.first_failed_at === "string" && existing.first_failed_at.length > 0
        ? existing.first_failed_at
        : nowIso,
    last_failed_at: nowIso,
    next_retry_at: createNextRetryAt(nextFailCount),
    updated_at: nowIso,
  };

  const { error } = await supabase
    .from(AUTOMATION_ERROR_MEMORY_TABLE)
    .upsert(payload, { onConflict: "job_name,fingerprint" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function clearAutomationErrorMemory(jobName: string, fingerprint: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from(AUTOMATION_ERROR_MEMORY_TABLE)
    .delete()
    .eq("job_name", jobName)
    .eq("fingerprint", fingerprint);

  if (error) {
    throw new Error(error.message);
  }
}
