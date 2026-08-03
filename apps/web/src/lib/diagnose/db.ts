// ────────────────────────────────────────────────────────────────────────────
// Diagnose DB — Supabase data layer for the diagnosis → recommendation chain
//
// Only call these functions when a user session is available (diagnoses/
// recommendations RLS requires auth.uid() = user_id). Anonymous/offline users
// keep getting the local-only log entry via useGrowLog — no diagnosis chain
// row is created for them.
// ────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Confidence, DiagnoseToolLink } from "@/lib/diagnose/tree";

// ── createDiagnosis ──────────────────────────────────────────────────────────

export type CreateDiagnosisInput = {
  growId: string;
  plantId?: string | null;
  category: string;
  resultKey: string;
  confidence: Confidence;
  title: string;
  cause: string;
  reasoning: string;
};

/**
 * Inserts a diagnosis row (source='rule_tree') and returns its id.
 * `log_entry_id` is intentionally left null — the log entry is written
 * concurrently by useGrowLog and linking it here would race the insert.
 */
export async function createDiagnosis(
  supabase: SupabaseClient,
  userId: string,
  input: CreateDiagnosisInput,
): Promise<string> {
  const { data, error } = await supabase
    .from("diagnoses")
    .insert({
      grow_id: input.growId,
      plant_id: input.plantId ?? null,
      user_id: userId,
      source: "rule_tree",
      category: input.category,
      result_key: input.resultKey,
      confidence: input.confidence,
      title: input.title,
      cause: input.cause,
      reasoning: input.reasoning,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) throw error;
  return data.id;
}

// ── createRecommendation ─────────────────────────────────────────────────────

export type CreateRecommendationInput = {
  diagnosisId: string;
  growId: string;
  plantId?: string | null;
  steps: string[];
  toolLinks: DiagnoseToolLink[];
};

/** Inserts a pending recommendation (source='diagnosis') for a diagnosis. */
export async function createRecommendation(
  supabase: SupabaseClient,
  userId: string,
  input: CreateRecommendationInput,
): Promise<void> {
  const { error } = await supabase.from("recommendations").insert({
    diagnosis_id: input.diagnosisId,
    grow_id: input.growId,
    plant_id: input.plantId ?? null,
    user_id: userId,
    source: "diagnosis",
    steps: input.steps,
    tool_links: input.toolLinks,
  });

  if (error) throw error;
}

// ── getPendingRecommendations ────────────────────────────────────────────────

export type PendingRecommendation = {
  id: string;
  diagnosisId: string | null;
  steps: string[];
  toolLinks: DiagnoseToolLink[];
  priority: number;
  createdAt: string;
  /** Null for source='phase_insight' rows, which have no linked diagnosis. */
  diagnosisTitle: string | null;
  diagnosisCause: string | null;
};

type PendingRecommendationRow = {
  id: string;
  diagnosis_id: string | null;
  steps: string[] | null;
  tool_links: DiagnoseToolLink[] | null;
  priority: number;
  created_at: string;
  diagnoses: { title: string; cause: string } | null;
};

/** Fetches this grow's still-open recommendations, newest/highest-priority first. */
export async function getPendingRecommendations(
  supabase: SupabaseClient,
  growId: string,
): Promise<PendingRecommendation[]> {
  const { data, error } = await supabase
    .from("recommendations")
    .select("id, diagnosis_id, steps, tool_links, priority, created_at, diagnoses(title, cause)")
    .eq("grow_id", growId)
    .eq("status", "pending")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as PendingRecommendationRow[]).map((row) => ({
    id: row.id,
    diagnosisId: row.diagnosis_id,
    steps: row.steps ?? [],
    toolLinks: row.tool_links ?? [],
    priority: row.priority,
    createdAt: row.created_at,
    diagnosisTitle: row.diagnoses?.title ?? null,
    diagnosisCause: row.diagnoses?.cause ?? null,
  }));
}

// ── recordRecommendationEvent ────────────────────────────────────────────────

/**
 * Records what the user did with a recommendation. Never update
 * `recommendations.status` directly — `trg_recommendation_events_apply`
 * owns that and derives it from this table.
 */
export async function recordRecommendationEvent(
  supabase: SupabaseClient,
  userId: string,
  recommendationId: string,
  eventType: "applied" | "dismissed",
): Promise<void> {
  const { error } = await supabase.from("recommendation_events").insert({
    recommendation_id: recommendationId,
    user_id: userId,
    event_type: eventType,
  });

  if (error) throw error;
}
