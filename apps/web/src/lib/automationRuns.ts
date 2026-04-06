import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const AUTOMATION_RUNS_TABLE = "automation_job_runs";

export type AutomationRunInput = {
  jobName: string;
  startedAt: string;
  finishedAt: string;
  success: boolean;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  attempts?: number;
  sourceGeneratedAt?: string | null;
  errorDetails?: string | null;
  metadata?: Record<string, unknown>;
};

export async function recordAutomationRun(input: AutomationRunInput): Promise<void> {
  const supabase = getSupabaseServerClient();
  const payload = {
    job_name: input.jobName,
    started_at: input.startedAt,
    finished_at: input.finishedAt,
    success: input.success,
    fetched: input.fetched,
    inserted: input.inserted,
    updated: input.updated,
    skipped: input.skipped,
    attempts: input.attempts ?? 1,
    source_generated_at: input.sourceGeneratedAt ?? null,
    error_details: input.errorDetails ?? null,
    metadata: input.metadata ?? {},
  };

  const { error } = await supabase.from(AUTOMATION_RUNS_TABLE).insert(payload);
  if (error) {
    throw new Error(error.message);
  }
}
