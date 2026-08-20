// ────────────────────────────────────────────────────────────────────────────
// Supabase row → Grow mapper
//
// Extracted from useGrowState.ts so server-only code (cron routes) can reuse
// the exact same mapping without importing a "use client" hook file.
// ────────────────────────────────────────────────────────────────────────────

import type { Grow, GrowPhaseId, GrowUmgebung, GrowMedium, LichtTyp, Erfahrung, GenetikTyp, GrowStatus } from "@/lib/grow/types";
import type { GrowRow } from "@/lib/grow/db";
import { computeCurrentDay } from "@/lib/grow/utils";

export function rowToGrow(row: GrowRow): Grow {
  return {
    id: row.id,
    name: row.name,
    umgebung: row.umgebung as GrowUmgebung,
    medium: row.medium as GrowMedium,
    lichtTyp: row.licht_typ as LichtTyp,
    ...(row.licht_leistung !== null && { lichtLeistung: row.licht_leistung }),
    erfahrung: row.erfahrung as Erfahrung,
    ...(row.genetik_typ !== null && { genetikTyp: row.genetik_typ as GenetikTyp }),
    pflanzenAnzahl: row.pflanzen_anzahl,
    plants: row.plants,
    ...(row.flaeche !== null && { flaeche: row.flaeche }),
    startDate: row.start_date,
    currentPhaseId: row.current_phase_id as GrowPhaseId,
    currentDay: computeCurrentDay(row.start_date),
    status: row.status as GrowStatus,
    plan: row.plan,
    ...(row.notes !== null && { notes: row.notes }),
    ...(row.harvest != null && { harvest: row.harvest }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
