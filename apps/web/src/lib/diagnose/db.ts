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
