// ────────────────────────────────────────────────────────────────────────────
// Health-snapshot + diagnosis-outcome cron logic
//
// Two jobs run back to back by the same cron (api/automation/health-snapshot):
//
// 1. runHealthSnapshotJob — computes today's health score for every grow
//    (reusing the same getGrowHealthScore the grow detail page already shows)
//    and writes a plant_health_snapshots row, trigger_source='daily_cron'.
//
// 2. runDiagnosisOutcomeJob — for every still-open diagnosis, checks whether
//    it's due for its 3-day or 7-day auto reading (per the schema's own
//    documented design in 202607280016_diagnosis_outcome_chain.sql) and, if
//    so, writes a diagnosis_outcomes row comparing the health score at
//    diagnosis time to the current one. The 7-day reading also resolves the
//    diagnosis (sets resolved_at), matching the schema comment that resolved_at
//    is "set by the outcome job once this diagnosis reaches a terminal
//    outcome measurement."
// ────────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import { getGrows, getLogEntries } from "@/lib/grow/db";
import { rowToGrow } from "@/lib/grow/rowToGrow";
import { getGrowHealthScore } from "@/lib/grow/intelligence";

// ── Health snapshots ──────────────────────────────────────────────────────────

export type HealthSnapshotResult = {
  growsProcessed: number;
  snapshotsWritten: number;
  errors: number;
};

export async function runHealthSnapshotJob(supabase: SupabaseClient): Promise<HealthSnapshotResult> {
  const growRows = await getGrows(supabase);
  let snapshotsWritten = 0;
  let errors = 0;

  for (const row of growRows) {
    try {
      const grow = rowToGrow(row);
      const entries = await getLogEntries(supabase, grow.id);
      const healthScore = getGrowHealthScore(grow, entries);

      const { error } = await supabase.from("plant_health_snapshots").insert({
        grow_id: grow.id,
        plant_id: null,
        user_id: row.user_id,
        health_score: healthScore,
        score_breakdown: {},
        trigger_source: "daily_cron",
      });
      if (error) throw error;
      snapshotsWritten += 1;
    } catch (err) {
      errors += 1;
      console.error(`[health-snapshot] failed for grow ${row.id}:`, err);
    }
  }

  return { growsProcessed: growRows.length, snapshotsWritten, errors };
}

// ── Diagnosis outcomes ────────────────────────────────────────────────────────

export type OutcomeJobResult = {
  diagnosesEvaluated: number;
  outcomesWritten: number;
  diagnosesResolved: number;
  errors: number;
};

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
// score_delta at or beyond this magnitude counts as a real change, not noise.
const IMPROVEMENT_THRESHOLD = 5;

type OpenDiagnosisRow = { id: string; grow_id: string; user_id: string; diagnosed_at: string };

function determineOutcomeStatus(
  before: number | null,
  after: number | null,
): "improved" | "worsened" | "unchanged" | "unknown" {
  if (before === null || after === null) return "unknown";
  const delta = after - before;
  if (delta >= IMPROVEMENT_THRESHOLD) return "improved";
  if (delta <= -IMPROVEMENT_THRESHOLD) return "worsened";
  return "unchanged";
}

export async function runDiagnosisOutcomeJob(supabase: SupabaseClient): Promise<OutcomeJobResult> {
  const { data: openDiagnoses, error: diagnosesError } = await supabase
    .from("diagnoses")
    .select("id, grow_id, user_id, diagnosed_at")
    .is("resolved_at", null)
    .returns<OpenDiagnosisRow[]>();

  if (diagnosesError) throw diagnosesError;

  let outcomesWritten = 0;
  let diagnosesResolved = 0;
  let errors = 0;

  for (const diagnosis of openDiagnoses ?? []) {
    try {
      const ageMs = Date.now() - new Date(diagnosis.diagnosed_at).getTime();

      const { data: existingOutcomes, error: outcomesError } = await supabase
        .from("diagnosis_outcomes")
        .select("id")
        .eq("diagnosis_id", diagnosis.id)
        .eq("method", "auto_health_score");
      if (outcomesError) throw outcomesError;

      const measurementCount = existingOutcomes?.length ?? 0;

      // 0 measurements -> eligible for the 3-day checkpoint.
      // 1 measurement  -> eligible for the 7-day terminal checkpoint.
      // 2+ measurements -> already fully measured, should already be resolved.
      const dueFor3Day = measurementCount === 0 && ageMs >= THREE_DAYS_MS;
      const dueFor7Day = measurementCount === 1 && ageMs >= SEVEN_DAYS_MS;
      if (!dueFor3Day && !dueFor7Day) continue;

      const { data: beforeRows, error: beforeError } = await supabase
        .from("plant_health_snapshots")
        .select("health_score")
        .eq("grow_id", diagnosis.grow_id)
        .lte("computed_at", diagnosis.diagnosed_at)
        .order("computed_at", { ascending: false })
        .limit(1)
        .returns<{ health_score: number }[]>();
      if (beforeError) throw beforeError;

      const { data: afterRows, error: afterError } = await supabase
        .from("plant_health_snapshots")
        .select("health_score")
        .eq("grow_id", diagnosis.grow_id)
        .order("computed_at", { ascending: false })
        .limit(1)
        .returns<{ health_score: number }[]>();
      if (afterError) throw afterError;

      const healthScoreBefore = beforeRows?.[0]?.health_score ?? null;
      const healthScoreAfter = afterRows?.[0]?.health_score ?? null;
      const scoreDelta =
        healthScoreBefore !== null && healthScoreAfter !== null ? healthScoreAfter - healthScoreBefore : null;

      const { count: concurrentOpen, error: concurrentError } = await supabase
        .from("diagnoses")
        .select("id", { count: "exact", head: true })
        .eq("grow_id", diagnosis.grow_id)
        .is("resolved_at", null)
        .neq("id", diagnosis.id);
      if (concurrentError) throw concurrentError;

      const { data: linkedRecommendation } = await supabase
        .from("recommendations")
        .select("id")
        .eq("diagnosis_id", diagnosis.id)
        .limit(1)
        .maybeSingle<{ id: string }>();

      const { error: insertError } = await supabase.from("diagnosis_outcomes").insert({
        diagnosis_id: diagnosis.id,
        recommendation_id: linkedRecommendation?.id ?? null,
        user_id: diagnosis.user_id,
        method: "auto_health_score",
        outcome_status: determineOutcomeStatus(healthScoreBefore, healthScoreAfter),
        health_score_before: healthScoreBefore,
        health_score_after: healthScoreAfter,
        score_delta: scoreDelta,
        concurrent_open_diagnoses: concurrentOpen ?? 0,
      });
      if (insertError) throw insertError;
      outcomesWritten += 1;

      if (dueFor7Day) {
        const { error: resolveError } = await supabase
          .from("diagnoses")
          .update({ resolved_at: new Date().toISOString() })
          .eq("id", diagnosis.id);
        if (resolveError) throw resolveError;
        diagnosesResolved += 1;
      }
    } catch (err) {
      errors += 1;
      console.error(`[diagnosis-outcome] failed for diagnosis ${diagnosis.id}:`, err);
    }
  }

  return {
    diagnosesEvaluated: (openDiagnoses ?? []).length,
    outcomesWritten,
    diagnosesResolved,
    errors,
  };
}
