// ────────────────────────────────────────────────────────────────────────────
// Grow Intelligence Engine — Phase 5
//
// Rule-based analytics layer. No AI calls, no backend.
// Works purely with existing grow/plant/log data.
//
// Exports:
//   getGrowHealthScore   → 0–100 composite score
//   getGrowPriorities    → sorted list of critical / warning / info flags
//   getDailyAction       → single most important action for today
//   getGrowHealthStatus  → score → {label, text, color}
//   getPlantMicroInsight → per-plant status sentence + severity level
// ────────────────────────────────────────────────────────────────────────────

import type { Grow, LogEntry } from './types';
import { getOverdueTasks, getTaskProgress } from './planGenerator';

// ── Public types ──────────────────────────────────────────────────────────────

export type PriorityLevel = 'critical' | 'warning' | 'info';

export type Priority = {
  level: PriorityLevel;
  title: string;
  action: string;
  /** What happens if user ignores this. */
  consequence?: string;
  /** What the user gains by acting. */
  upside?: string;
  /** PRO: Quantified yield effect (e.g. "-12g to -18g"). */
  yieldImpact?: string;
  /** PRO: Scientific/mechanistic explanation. */
  deepInsight?: string;
  /** PRO: Estimated gram loss if this issue is ignored. */
  yieldLossGrams?: number;
  /** PRO: Estimated gram gain if this issue is fixed. */
  yieldGainGrams?: number;
  plantId?: string;
};

export type DailyActionLevel = 'critical' | 'warning' | 'info' | 'success';

export type DailyAction = {
  message: string;
  subtext: string;
  /** Short "why this matters / risk" line. */
  consequence?: string;
  /** What the user gains by acting now. */
  upside?: string;
  /** PRO: Quantified yield impact (e.g. "-12g to -18g"). */
  yieldImpact?: string;
  /** PRO: Scientific/mechanistic explanation. */
  deepInsight?: string;
  /** Grams recoverable by taking this action. Always visible. */
  recoveryGrams?: number;
  ctaLabel: string;
  ctaHref: string;
  level: DailyActionLevel;
};

export type PlantMicroInsight = {
  text: string;
  level: 'good' | 'warning' | 'critical';
  /** Short outcome risk shown under the status text. */
  consequence?: string;
  /** Positive gain when conditions are good. */
  upside?: string;
  /** PRO: Quantified yield impact. */
  yieldImpact?: string;
  /** PRO: Scientific/mechanistic explanation. */
  deepInsight?: string;
};

export type GrowHealthStatus = {
  label: string;
  text: string;
  /** Yield / outcome framing tied to this score band. */
  yieldLabel: string;
  /** What the user can achieve by improving/maintaining. */
  upsideLabel: string;
  color: 'green' | 'yellow' | 'red';
};

/** PRO: Aggregated yield impact across all active priorities. */
export type YieldImpactResult = {
  totalLoss: number;
  totalGainPotential: number;
  /** Estimated max yield if all issues were fixed. */
  potentialYield: number;
  /** Estimated current yield after losses. */
  currentEstimate: number;
  /** totalLoss / potentialYield × 100, rounded. */
  lossPercent: number;
  /** Simplified weekly loss rate: totalLoss / 2. */
  weeklyLossRate: number;
  /** Projected final yield at current trajectory (= currentEstimate). */
  projectedYield: number;
};

/** PRO: Score trend between sessions. */
export type GrowTrend = {
  trend: 'up' | 'down' | 'stable';
  delta: number;
};

// ── Internal helpers ──────────────────────────────────────────────────────────

function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
}

/**
 * Absolute plant health score (0–100).
 * Start at 100; penalise recency gaps and missing/stale watering.
 */
function scorePlantHealth(plantEntries: LogEntry[]): number {
  if (plantEntries.length === 0) return 40; // unknown but not critical

  const sorted = [...plantEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const sinceNewest = daysSince(sorted[0]!.date);

  let score = 100;

  // Recency penalty
  if (sinceNewest > 7) score -= 40;
  else if (sinceNewest > 5) score -= 25;
  else if (sinceNewest > 3) score -= 15;
  else if (sinceNewest > 1) score -= 5;

  // Watering gap penalty
  const lastWater = sorted.find((e) => e.data.type === 'wasser');
  if (!lastWater) {
    score -= 20; // never watered
  } else {
    const gap = daysSince(lastWater.date);
    if (gap > 5) score -= 30;
    else if (gap > 3) score -= 15;
    else if (gap > 1) score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Returns the current log streak in consecutive days.
 * A gap of more than 1 day breaks the streak.
 */
function getLogStreak(entries: LogEntry[]): number {
  if (entries.length === 0) return 0;

  // Unique calendar days, newest first
  const uniqueDays = [
    ...new Set(entries.map((e) => e.date.slice(0, 10))),
  ].sort((a, b) => b.localeCompare(a));

  if (uniqueDays.length === 0) return 0;

  // Streak must include today or yesterday to be active
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const a = new Date(uniqueDays[i]!);
    const b = new Date(uniqueDays[i + 1]!);
    const diff = Math.round((a.getTime() - b.getTime()) / 86_400_000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// ── Public: Grow Health Score ─────────────────────────────────────────────────

/**
 * Composite grow health score (0–100).
 *
 * Weights:
 *   50 pts — average plant health score
 *   20 pts — task completion ratio
 *   10 pts — recent activity bonus
 *   10 pts — consistency streak bonus
 *   up to −30 pts — overdue task penalty
 */
export function getGrowHealthScore(grow: Grow, entries: LogEntry[]): number {
  // 1. Plant health (0–50)
  const plantScores = grow.plants.map((p) =>
    scorePlantHealth(entries.filter((e) => e.plantId === p.id)),
  );
  const avgPlant =
    plantScores.length > 0
      ? plantScores.reduce((a, b) => a + b, 0) / plantScores.length
      : 50;

  // 2. Task completion (0–20)
  const { completed, total } = getTaskProgress(grow);
  const taskScore = total > 0 ? Math.round((completed / total) * 100) : 100;

  // 3. Overdue task penalty (up to −30)
  const overduePenalty = Math.min(getOverdueTasks(grow).length * 8, 30);

  // 4. Recent activity bonus (0–10)
  const allEntries = entries
    .filter((e) => !e.plantId || grow.plants.some((p) => p.id === e.plantId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let activityBonus = 0;
  if (allEntries.length > 0) {
    const since = daysSince(allEntries[0]!.date);
    if (since === 0) activityBonus = 10;
    else if (since <= 1) activityBonus = 7;
    else if (since <= 3) activityBonus = 3;
  }

  // 5. Streak bonus (0–10)
  const streak = getLogStreak(allEntries);
  const streakBonus =
    streak >= 7 ? 10 :
    streak >= 5 ? 7 :
    streak >= 3 ? 5 :
    streak >= 2 ? 2 : 0;

  const raw =
    avgPlant * 0.5 +
    taskScore * 0.2 +
    activityBonus +
    streakBonus -
    overduePenalty;

  return Math.max(0, Math.min(100, Math.round(raw)));
}

// ── Public: Grow Priorities ───────────────────────────────────────────────────

/**
 * Returns a sorted list of issues and tips, most critical first.
 */
export function getGrowPriorities(grow: Grow, entries: LogEntry[]): Priority[] {
  const priorities: Priority[] = [];

  // CRITICAL: no logs at all
  if (entries.length === 0) {
    priorities.push({
      level: 'critical',
      title: 'Noch kein Log-Eintrag vorhanden',
      action: 'Füge deinen ersten Eintrag hinzu',
      consequence: 'Ohne Dokumentation kein Lerneffekt — Ernte unkontrollierbar.',
      upside: 'Regelmäßiges Dokumentieren ist der wichtigste Faktor für bessere Ernten.',
      yieldImpact: '−20–40% geringerer Ertrag ohne Datenbasis',
      deepInsight: 'Grow-Dokumentation schafft Rückkopplungsschleifen: Fehler werden erkannt, bevor sie zu Ertragsverlusten führen.',
      yieldLossGrams: 35,
      yieldGainGrams: 40,
    });
    return priorities;
  }

  // CRITICAL: no watering in > 3 days for any plant
  for (const plant of grow.plants) {
    const pe = entries
      .filter((e) => e.plantId === plant.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastWater = pe.find((e) => e.data.type === 'wasser');

    if (lastWater) {
      const days = daysSince(lastWater.date);
      if (days > 3) {
        priorities.push({
          level: 'critical',
          title: `${plant.name} gießen — ${days} Tage überfällig`,
          action: `Kein Wasser seit ${days} Tagen. Sofort handeln.`,
          consequence: 'Trockenstress gefährdet den Ertrag — jeder weitere Tag kostet Gramm.',
          upside: 'Rechtzeitiges Gießen erhält Blütendichte und Trichomproduktion.',
          yieldImpact: `−6g bis −18g Ernteverlust pro weiteren Tag`,
          deepInsight: 'Trockenstress aktiviert ABA-Signalkaskaden, die Stomata schließen, die Photosyntheserate reduzieren und die Zellexpansion stoppen.',
          yieldLossGrams: 14,
          yieldGainGrams: 18,
          plantId: plant.id,
        });
      } else if (days === 3) {
        priorities.push({
          level: 'warning',
          title: `${plant.name} braucht bald Wasser`,
          action: 'Bewässerung steht an — nicht warten.',
          consequence: 'Suboptimales Wachstum wenn verzögert.',
          upside: 'Jetzt gießen hält optimalen Wachstumsrhythmus aufrecht.',
          yieldImpact: '−3g bis −8g bei Verzögerung',
          deepInsight: 'Im optimalen Wasserpotenzialbereich (-0,1 bis -0,3 MPa) läuft der Nährstofftransport maximal effizient.',
          yieldLossGrams: 5,
          yieldGainGrams: 8,
          plantId: plant.id,
        });
      }
    } else if (pe.length >= 3) {
      // Multiple entries but never a watering log
      priorities.push({
        level: 'warning',
        title: `${plant.name} — Wasser-Log fehlt`,
        action: 'Ersten Bewässerungs-Eintrag hinzufügen.',
        consequence: 'Ohne Bewässerungsdaten keine Optimierung möglich.',
        upside: 'Mit Bewässerungshistorie wird Timing messbar und verbesserbar.',
        plantId: plant.id,
      });
    }
  }

  // CRITICAL: any plant with > 5 day activity gap
  for (const plant of grow.plants) {
    const pe = entries
      .filter((e) => e.plantId === plant.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (pe.length > 0) {
      const since = daysSince(pe[0]!.date);
      if (since > 5) {
        const alreadyFlagged = priorities.some(
          (p) => p.plantId === plant.id && p.level === 'critical',
        );
        if (!alreadyFlagged) {
          priorities.push({
            level: 'critical',
            title: `${plant.name} vernachlässigt — ${since} Tage ohne Eintrag`,
            action: 'Sofort prüfen und dokumentieren.',
            consequence: 'Pflanzenstress unbemerkt — Ertrag und Qualität gefährdet.',
            upside: 'Früherkennung von Problemen kann Ertragseinbußen vollständig verhindern.',
            yieldImpact: '−15–25% Ertragsverlust bei über 5 Tagen Vernachlässigung',
            deepInsight: 'Cannabis entwickelt Stresssymptome oft über 24–48h still — frühe Intervention ist 10× effektiver als späte Korrektur.',
            yieldLossGrams: 20,
            yieldGainGrams: 22,
            plantId: plant.id,
          });
        }
      }
    }
  }

  // WARNING: phase overdue
  const currentPhase = grow.plan.phases.find((p) => p.id === grow.currentPhaseId);
  if (currentPhase && grow.currentDay > currentPhase.endDay && grow.status === 'aktiv') {
    const days = grow.currentDay - currentPhase.endDay;
    priorities.push({
      level: 'warning',
      title: `Phase überfällig — ${days} ${days === 1 ? 'Tag' : 'Tage'} hinter Plan`,
      action: 'Nächste Phase jetzt einleiten.',
      consequence: 'Phasenverzögerung reduziert Terpene und Gesamtqualität.',
      upside: 'Phasenwechsel jetzt sichert optimale Entwicklungsbedingungen für die Blüte.',
      yieldImpact: '−5–12% Terpenreduktion pro Woche Verzögerung',
      deepInsight: 'Die Photoperiode steuert Blütenhormone wie FT (Flowering Locus T) — Verzögerung verschiebt das Terpensynthese­fenster.',
      yieldLossGrams: 8,
      yieldGainGrams: 10,
    });
  }

  // WARNING: overdue tasks
  const overdue = getOverdueTasks(grow);
  if (overdue.length > 0) {
    const label = overdue.length === 1 ? overdue[0]!.title : `${overdue.length} Aufgaben`;
    priorities.push({
      level: 'warning',
      title: `${label} — nicht erledigt`,
      action: 'Überfällige Aufgabe jetzt erledigen.',
      consequence: 'Übersprungene Aufgaben verschlechtern die Wachstumseffizienz.',
      upside: 'Aufgaben erledigen verbessert den Wert sofort.',
      yieldLossGrams: 5,
      yieldGainGrams: 7,
    });
  }

  // WARNING: grow-level log gap > 3 days
  const allSorted = entries
    .filter((e) => !e.plantId || grow.plants.some((p) => p.id === e.plantId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (allSorted.length > 0) {
    const since = daysSince(allSorted[0]!.date);
    if (since === 2) {
      priorities.push({
        level: 'warning',
        title: 'Seit gestern kein Eintrag — dein Rhythmus bricht ab',
        action: 'Heute eintragen, bevor du Ertrag verlierst.',
        consequence: 'Dein Grow war gestern ohne Kontrolle — Verluste sind wahrscheinlich.',
        upside: 'Heute eintragen stellt den Schutz wieder her.',
        yieldLossGrams: 3,
        yieldGainGrams: 5,
      });
    } else if (since === 3) {
      priorities.push({
        level: 'warning',
        title: `${since} Tage kein Eintrag — dein Schutz ist weg`,
        action: 'Jetzt eintragen — jeder weitere Tag kostet dich Ertrag.',
        consequence: `Dein Grow war ${since} Tage ohne Kontrolle. Du verlierst wieder Ertrag.`,
        upside: 'Heute handeln = weiteren Verlust stoppen.',
        yieldLossGrams: 5,
        yieldGainGrams: 7,
      });
    } else if (since > 3 && since <= 5) {
      priorities.push({
        level: 'warning',
        title: `Du verlierst seit ${since} Tagen Ertrag`,
        action: 'Jetzt eintragen — jeder weitere Tag kostet dich Ertrag.',
        consequence: `Ohne Eingriff heute: weiterer Ertragsverlust morgen.`,
        upside: 'Noch umkehrbar — wenn du jetzt handelst.',
        yieldLossGrams: 8,
        yieldGainGrams: 10,
      });
    }
  }

  // INFO: active streak with tiered messaging
  const streak = getLogStreak(allSorted);
  if (streak >= 14) {
    priorities.push({
      level: 'info',
      title: `${streak} Tage Ertrag geschützt`,
      action: 'Heute eintragen — halte den Schutz aufrecht.',
      consequence: `Ohne heutigen Eintrag bricht dein ${streak}-Tage-Schutz weg.`,
      upside: 'Morgen siehst du, ob deine Maßnahme wirkt.',
    });
  } else if (streak >= 7) {
    priorities.push({
      level: 'info',
      title: `${streak} Tage Ertrag geschützt`,
      action: 'Heute eintragen.',
      consequence: `Ohne heutigen Eintrag bricht dein ${streak}-Tage-Schutz weg.`,
      upside: 'Morgen entscheidet sich, ob dein Grow stabil bleibt.',
    });
  } else if (streak >= 3) {
    priorities.push({
      level: 'info',
      title: `${streak} Tage im Rhythmus — Ertrag wird täglich geschützt`,
      action: 'Heute eintragen.',
      consequence: `Wenn du heute nicht einträgst, bricht dein ${streak}-Tage-Schutz weg.`,
      upside: 'Morgen entscheidet sich, ob dein Grow stabil bleibt.',
    });
  }

  // INFO: phase-specific optimisation tip (only when no critical/warning)
  const hasProblem = priorities.some(
    (p) => p.level === 'critical' || p.level === 'warning',
  );
  if (!hasProblem) {
    const PHASE_TIPS: Partial<Record<string, { title: string; action: string; consequence: string; upside: string }>> = {
      veg:        { title: 'VPD optimieren für maximales Wachstum',  action: 'VPD-Rechner öffnen',  consequence: 'Optimale Bedingungen für starkes Wachstum.',           upside: 'Optimaler VPD kann Wachstum spürbar steigern.' },
      bluete:     { title: 'EC und pH regelmäßig messen',            action: 'Düngung eintragen',   consequence: 'Stabile Nährstoffe sichern maximalen Blütenansatz.',   upside: 'Stabiler EC ermöglicht volle Blütenentfaltung.' },
      spaetbluete:{ title: 'Trichomentwicklung beobachten',          action: 'Notiz hinzufügen',    consequence: 'Richtiger Erntezeitpunkt erhöht Potenz deutlich.',     upside: 'Perfekter Erntezeitpunkt maximiert Wirkung und Aroma.' },
      ernte:      { title: 'Optimalen Erntezeitpunkt prüfen',        action: 'Ernte planen',        consequence: 'Zu früh oder zu spät geerntet kostet Qualität.',       upside: 'Optimale Ernte bringt die beste Qualität aus diesem Grow.' },
    };
    const tip = PHASE_TIPS[grow.currentPhaseId];
    if (tip) priorities.push({ level: 'info', ...tip });
  }

  // Sort: critical → warning → info
  const ORDER: Record<PriorityLevel, number> = { critical: 0, warning: 1, info: 2 };
  return priorities.sort((a, b) => ORDER[a.level] - ORDER[b.level]);
}

// ── Public: Daily Action ──────────────────────────────────────────────────────

/**
 * Derives the single most important action for today.
 * Derives from the top priority; falls back to a success state.
 */
export function getDailyAction(grow: Grow, entries: LogEntry[]): DailyAction {
  const priorities = getGrowPriorities(grow, entries);
  const top = priorities[0];

  const allSorted2 = entries
    .filter((e) => !e.plantId || grow.plants.some((p) => p.id === e.plantId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const streak = getLogStreak(allSorted2);

  if (!top) {
    if (streak >= 14) {
      return {
        message: `${streak} Tage Ertrag geschützt`,
        subtext: 'Du hast verhindert, dass dein Grow Ertrag verliert.',
        consequence: `Ohne heutigen Eintrag bricht dein ${streak}-Tage-Schutz weg.`,
        upside: 'Morgen siehst du, ob deine Maßnahme wirkt.',
        ctaLabel: 'Heute eintragen →',
        ctaHref: `/grow/${grow.id}/log`,
        level: 'success',
      };
    }
    if (streak >= 7) {
      return {
        message: `${streak} Tage Ertrag geschützt`,
        subtext: 'Du hast verhindert, dass dein Grow Ertrag verliert.',
        consequence: `Ohne heutigen Eintrag bricht dein ${streak}-Tage-Schutz weg.`,
        upside: 'Morgen entscheidet sich, ob dein Grow stabil bleibt.',
        ctaLabel: 'Heute eintragen →',
        ctaHref: `/grow/${grow.id}/log`,
        level: 'success',
      };
    }
    if (streak >= 3) {
      return {
        message: `${streak} Tage Ertrag geschützt`,
        subtext: 'Du hast verhindert, dass dein Grow Ertrag verliert.',
        consequence: `Wenn du heute nicht einträgst, bricht dein ${streak}-Tage-Schutz weg.`,
        upside: 'Morgen entscheidet sich, ob dein Grow stabil bleibt.',
        ctaLabel: 'Heute eintragen →',
        ctaHref: `/grow/${grow.id}/log`,
        level: 'success',
      };
    }
    return {
      message: 'Wenn du heute nur eine Sache tust — dokumentiere deinen Grow',
      subtext: 'Kein Eintrag bedeutet Ertragsverlust.',
      consequence: 'Jeder weitere Tag ohne Eintrag kostet dich Ertrag.',
      upside: 'Ein Eintrag heute verhindert morgen den Verlust.',
      ctaLabel: 'Jetzt eintragen →',
      ctaHref: `/grow/${grow.id}/log`,
      level: 'info',
    };
  }

  if (top.level === 'critical') {
    const base = {
      message: top.title,
      subtext: top.action,
      ctaLabel: top.plantId ? 'Jetzt gießen →' : 'Sofort handeln →',
      ctaHref: top.plantId
        ? `/grow/${grow.id}/log?plant=${top.plantId}`
        : `/grow/${grow.id}/log`,
      level: 'critical' as const,
    };
    const withC  = top.consequence    ? { ...base,  consequence:    top.consequence }    : base;
    const withU  = top.upside         ? { ...withC, upside:         top.upside }         : withC;
    const withY  = top.yieldImpact    ? { ...withU, yieldImpact:    top.yieldImpact }    : withU;
    const withR  = top.yieldGainGrams ? { ...withY, recoveryGrams:  top.yieldGainGrams } : withY;
    return         top.deepInsight    ? { ...withR, deepInsight:    top.deepInsight }    : withR;
  }

  if (top.level === 'warning') {
    const base = {
      message: top.title,
      subtext: top.action,
      ctaLabel: top.plantId ? 'Jetzt pflegen →' : 'Jetzt handeln →',
      ctaHref: top.plantId
        ? `/grow/${grow.id}/log?plant=${top.plantId}`
        : `/grow/${grow.id}/log`,
      level: 'warning' as const,
    };
    const withC  = top.consequence    ? { ...base,  consequence:    top.consequence }    : base;
    const withU  = top.upside         ? { ...withC, upside:         top.upside }         : withC;
    const withY  = top.yieldImpact    ? { ...withU, yieldImpact:    top.yieldImpact }    : withU;
    const withR  = top.yieldGainGrams ? { ...withY, recoveryGrams:  top.yieldGainGrams } : withY;
    return         top.deepInsight    ? { ...withR, deepInsight:    top.deepInsight }    : withR;
  }

  const base = {
    message: top.title,
    subtext: top.action,
    ctaLabel: 'Heute eintragen →',
    ctaHref: `/grow/${grow.id}/log`,
    level: 'info' as const,
  };
  const withC  = top.consequence    ? { ...base,  consequence:    top.consequence }    : base;
  const withU  = top.upside         ? { ...withC, upside:         top.upside }         : withC;
  const withY  = top.yieldImpact    ? { ...withU, yieldImpact:    top.yieldImpact }    : withU;
  const withR  = top.yieldGainGrams ? { ...withY, recoveryGrams:  top.yieldGainGrams } : withY;
  return         top.deepInsight    ? { ...withR, deepInsight:    top.deepInsight }    : withR;
}

// ── Public: Score → Status Label ──────────────────────────────────────────────

export function getGrowHealthStatus(score: number): GrowHealthStatus {
  if (score >= 80) {
    return {
      label: 'Auf Kurs',
      text: 'Du bist heute auf Kurs.',
      yieldLabel: 'Ertrag gesichert',
      upsideLabel: 'Jeden Tag so — maximale Ernte erreichbar.',
      color: 'green',
    };
  }
  if (score >= 50) {
    return {
      label: 'In Gefahr',
      text: 'Du riskierst Ertragsverlust — jetzt handeln.',
      yieldLabel: 'Ertrag in Gefahr',
      upsideLabel: 'Eine Aktion heute rettet morgen den Ertrag.',
      color: 'yellow',
    };
  }
  return {
    label: 'Ertrag verloren',
    text: 'Du verlierst Ertrag — sofort eingreifen.',
    yieldLabel: 'Ertrag geht verloren',
    upsideLabel: 'Noch umkehrbar — aber jede Stunde zählt.',
    color: 'red',
  };
}

// ── Public: Plant Micro Insight ───────────────────────────────────────────────

/**
 * Returns a one-liner status sentence for a plant + severity level.
 * Used under each plant card.
 */
export function getPlantMicroInsight(plantEntries: LogEntry[]): PlantMicroInsight {
  if (plantEntries.length === 0) {
    return { text: 'Noch kein Eintrag', level: 'warning', consequence: 'Zustand unbekannt.' };
  }

  const sorted = [...plantEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const lastWater = sorted.find((e) => e.data.type === 'wasser');

  if (lastWater) {
    const days = daysSince(lastWater.date);
    if (days === 0)  return { text: 'Heute bewässert ✓',                  level: 'good',     consequence: 'Optimale Bedingungen aufrechterhalten.',  upside: 'Blütendichte und Trichomproduktion auf Maximum.' };
    if (days === 1)  return { text: 'Gestern bewässert',                   level: 'good',     consequence: 'Optimale Bedingungen aufrechterhalten.',  upside: 'Optimaler Rhythmus für starkes Wachstum.' };
    if (days <= 2)   return { text: `Bewässert vor ${days} Tagen`,         level: 'good',     consequence: 'Weiter regelmäßig gießen.',               upside: 'Weiter so für gleichmäßiges Wachstum.' };
    if (days <= 4)   return { text: `Seit ${days} Tagen nicht bewässert`,  level: 'warning',  consequence: 'Trockenstress verlangsamt Wachstum.' };
    return           { text: `${days} Tage kein Wasser — kritisch!`,       level: 'critical', consequence: 'Ertragsverlust wahrscheinlich.' };
  }

  // No watering log at all
  const sinceLog = daysSince(sorted[0]!.date);
  if (sinceLog === 0) return { text: 'Heute eingetragen',              level: 'good',     consequence: 'Optimale Bedingungen aufrechterhalten.',  upside: 'Dokumentation verbessert nächste Ernte.' };
  if (sinceLog === 1) return { text: 'Letzter Eintrag gestern',        level: 'good',     consequence: 'Weiter regelmäßig dokumentieren.',        upside: 'Guter Rhythmus — Streak aufbauen.' };
  if (sinceLog <= 3)  return { text: `Kein Eintrag seit ${sinceLog} Tagen`, level: 'warning',  consequence: 'Zu selten dokumentiert.' };
  return              { text: `Lange ohne Pflege — ${sinceLog} Tage`,   level: 'critical', consequence: 'Qualitätsverlust und Ertragsgefährdung.' };
}

// ── Public: Potential Yield ────────────────────────────────────────────────

/**
 * Estimates the maximum achievable yield for this grow in grams.
 * Based on plant count and current phase.
 * Kept deliberately simple: 30g per plant baseline, graded by phase.
 */
export function getPotentialYield(grow: Grow): number {
  const base = grow.plants.length * 30;
  const phase = grow.currentPhaseId;
  const multiplier =
    phase === 'ernte'       ? 1.0 :
    phase === 'spaetbluete' ? 1.0 :
    phase === 'bluete'      ? 0.9 :
    phase === 'veg'         ? 0.8 :
    /* keim/anzucht */        0.7;
  return Math.round(base * multiplier);
}

// ── Public: Total Yield Impact ────────────────────────────────────────────────

/**
 * PRO: Sum of all numeric yield loss/gain estimates across active priorities.
 * Pass getPotentialYield(grow) as the second argument to compute lossPercent.
 */
export function getTotalYieldImpact(priorities: Priority[], potentialYield: number): YieldImpactResult {
  let totalLoss = 0;
  let totalGainPotential = 0;
  for (const p of priorities) {
    if (p.yieldLossGrams)  totalLoss         += p.yieldLossGrams;
    if (p.yieldGainGrams)  totalGainPotential += p.yieldGainGrams;
  }
  const currentEstimate = Math.max(0, potentialYield - totalLoss);
  const lossPercent = potentialYield > 0
    ? Math.round((totalLoss / potentialYield) * 100)
    : 0;
  const weeklyLossRate = Math.max(2, Math.round(totalLoss / 1.5));
  const projectedYield = currentEstimate;
  return { totalLoss, totalGainPotential, potentialYield, currentEstimate, lossPercent, weeklyLossRate, projectedYield };
}

// ── Public: Optimization Score ────────────────────────────────────────────────

/**
 * PRO: "How much of this plant's potential is actually being used."
 * Starts at 100; penalises for each active critical/warning priority.
 * Distinct from getGrowHealthScore (which weighs task completion, streaks, etc.)
 */
export function getOptimizationScore(grow: Grow, entries: LogEntry[]): number {
  const priorities = getGrowPriorities(grow, entries);
  let score = 100;
  for (const p of priorities) {
    if      (p.level === 'critical') score -= 28;
    else if (p.level === 'warning')  score -= 12;
    // info items don't reduce optimization score
  }
  return Math.max(0, score);
}

// ── Public: Trend ─────────────────────────────────────────────────────────────

/**
 * Computes trend between a previously stored score and the current one.
 * A delta of ±2 is considered "stable" to avoid noise.
 */
export function computeTrend(previousScore: number, currentScore: number): GrowTrend {
  const delta = currentScore - previousScore;
  const trend =
    delta > 2  ? 'up' :
    delta < -2 ? 'down' :
                 'stable';
  return { trend, delta };
}
