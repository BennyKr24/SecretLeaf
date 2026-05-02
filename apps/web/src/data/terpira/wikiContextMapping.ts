// ────────────────────────────────────────────────────────────────────────────
// Wiki Trigger System — Grow-Zustand → Wiki-Artikel
//
// Regel-basiertes System zur kontextgenauen Artikeleinblendung.
// Kein AI, keine Backend-Calls.
//
// Regeln haben: Trigger · Priorität · Timing · Frequenz · Intensität
//
// Display-Logik:
//   - Nur die höchste Priorität wird gleichzeitig angezeigt
//   - Kein Artikel wird innerhalb von 48h wiederholt
//   - Bereits gesehene Artikel können optional ausgeblendet werden
//
// Verwendung:
//   resolveActiveRule(context) → WikiContextRule | undefined
// ────────────────────────────────────────────────────────────────────────────

// ── Typen ─────────────────────────────────────────────────────────────────────

export type WikiTrigger =
  | { type: 'no_entries' }
  | { type: 'log_gap_days'; min: number; max?: number }
  | { type: 'water_gap_days'; min: number; max?: number }
  | { type: 'phase_ending_soon'; daysLeft: number }
  | { type: 'harvest_phase_active' }
  | { type: 'health_score_below'; threshold: number }
  | { type: 'health_score_above'; threshold: number }
  | { type: 'streak_min'; days: number }
  | { type: 'last_log_type'; logType: 'wasser' | 'duenger' | 'training' | 'notiz' }
  | { type: 'overdue_tasks'; min: number }
  | { type: 'first_run' };

/** Wo der Artikel in der UI erscheint */
export type WikiPlacement =
  | 'daily_action_card'   // Tägliche Hauptkarte oben
  | 'banner'              // Quer-Banner über dem Content
  | 'phase_card'          // Phasen-Transition-Karte
  | 'post_log_card'       // Direkt nach einem Log-Eintrag
  | 'health_card'         // Neben der Health-Score-Anzeige
  | 'tooltip';            // Kleiner kontextsensitiver Hinweis

/** Wann ein Artikel erstmals eingeblendet wird */
export type WikiTiming =
  | 'immediate'           // Sofort beim Aufrufen der Seite
  | 'after_action'        // Direkt nach einer Nutzeraktion (z.B. Log-Eintrag)
  | 'on_phase_enter'      // Beim Eintreten in eine neue Phase
  | 'next_visit';         // Erst beim nächsten Seitenbesuch nach Trigger

/** Wie häufig ein Artikel für denselben Trigger erscheinen darf */
export type WikiFrequency =
  | 'once'                // Genau einmal, auch wenn Trigger weiter aktiv
  | 'daily'               // Einmal pro Tag, solange Trigger aktiv
  | 'on_change'           // Nur wenn sich der Zustand verändert hat
  | 'every_48h';          // Höchstens alle 48 Stunden

/**
 * Wie stark die Situation ist.
 * Gleicher Triggertyp kann mehrere Stufen haben (z.B. Wasser 3d = medium, 5d = critical).
 */
export type WikiIntensity = 'low' | 'medium' | 'high' | 'critical';

export type WikiContextRule = {
  /** Eindeutige ID für Tracking und Deduplizierung */
  id: string;
  /** Lesbare Beschreibung der Situation (intern / Debug) */
  situation: string;
  /** Auslösender Zustand */
  trigger: WikiTrigger;
  /** Intensität dieser Situation — steuert auch Darstellungsstärke */
  intensity: WikiIntensity;
  /** Gesamtpriorität im System — nur höchste Priorität wird gleichzeitig gezeigt */
  priority: WikiIntensity;
  /** Slug des primär anzuzeigenden Artikels */
  articleSlug: string;
  /** Fallback-Artikel, wenn primärer bereits gesehen wurde */
  fallbackSlug?: string;
  /** Wo in der UI der Hinweis erscheint */
  placement: WikiPlacement;
  /** Wann der Artikel eingeblendet wird */
  timing: WikiTiming;
  /** Wie oft für denselben Trigger */
  frequency: WikiFrequency;
  /** Warum dieser Artikel genau jetzt relevant ist (für UI-Copy) */
  reason: string;
  /** Messbares Ziel dieser Einblendung */
  goal: string;
};

// ── State-Übergänge ───────────────────────────────────────────────────────────
//
// Log-Lücke:       Tag 1 → info  | Tag 2 → medium  | Tag 3–4 → high  | Tag 5+ → critical
// Wasser-Lücke:    Tag 2 → low   | Tag 3 → medium  | Tag 4 → high   | Tag 5+ → critical
// Health-Score:    ≥ 60 → ok     | 40–59 → medium  | < 40 → critical
// Überfällige:     1–2 → low     | 3+ → medium     | 5+ → high
// Streak:          3d → low      | 7d → medium     | 14d → high
//
// ─────────────────────────────────────────────────────────────────────────────

export const WIKI_CONTEXT_RULES: WikiContextRule[] = [

  // ── Kein Eintrag: Onboarding ──────────────────────────────────────────────
  {
    id: 'onboarding_no_entries',
    situation: 'Noch kein Log-Eintrag — Grow ist neu angelegt',
    trigger: { type: 'no_entries' },
    intensity: 'critical',
    priority: 'critical',
    articleSlug: 'how-to-grow-cannabis-anfaenger-tutorial',
    fallbackSlug: 'cannabis-anbau-grundlagen',
    placement: 'daily_action_card',
    timing: 'immediate',
    frequency: 'daily',
    reason: 'Ohne ersten Eintrag kein Lerneffekt — der Grow läuft unkontrolliert.',
    goal: 'Ersten Log-Eintrag auslösen, Onboarding-Drop verringern',
  },

  // ── Erster Run ────────────────────────────────────────────────────────────
  {
    id: 'first_run_tutorial',
    situation: 'Erster Grow-Run des Nutzers',
    trigger: { type: 'first_run' },
    intensity: 'high',
    priority: 'high',
    articleSlug: 'cannabis-anbau-grundlagen',
    fallbackSlug: 'vpd-einfach-erklaert',
    placement: 'banner',
    timing: 'immediate',
    frequency: 'once',
    reason: 'Grundlagenwissen im ersten Run entscheidet über Erfolg oder Abbruch.',
    goal: 'Ersten Run begleiten, Churn durch Überforderung verhindern',
  },

  // ── Log-Lücke: 1 Tag ─────────────────────────────────────────────────────
  {
    id: 'log_gap_1_day',
    situation: 'Heute noch kein Eintrag — Serie in Gefahr',
    trigger: { type: 'log_gap_days', min: 1, max: 1 },
    intensity: 'low',
    priority: 'low',
    articleSlug: 'grow-log-und-kpi-dashboard',
    placement: 'tooltip',
    timing: 'immediate',
    frequency: 'daily',
    reason: 'Ein Tag ohne Eintrag ist der häufigste Einstieg in eine Lücke.',
    goal: 'Tages-Serie aufrechterhalten',
  },

  // ── Log-Lücke: 2–3 Tage ──────────────────────────────────────────────────
  {
    id: 'log_gap_2_3_days',
    situation: '2–3 Tage kein Eintrag — Rhythmus bricht ab',
    trigger: { type: 'log_gap_days', min: 2, max: 3 },
    intensity: 'medium',
    priority: 'medium',
    articleSlug: 'grow-log-und-kpi-dashboard',
    placement: 'daily_action_card',
    timing: 'immediate',
    frequency: 'daily',
    reason: 'Nach 3 Tagen ohne Log ist Stresserkennung faktisch ausgeschaltet.',
    goal: 'Re-engagement, Tages-Serie wiederherstellen',
  },

  // ── Log-Lücke: 4–6 Tage (kritisch) ───────────────────────────────────────
  {
    id: 'log_gap_4_6_days',
    situation: '4–6 Tage kein Eintrag — Grow läuft blind',
    trigger: { type: 'log_gap_days', min: 4, max: 6 },
    intensity: 'high',
    priority: 'high',
    articleSlug: 'stressmarker-frueh-erkennen',
    fallbackSlug: 'grow-log-und-kpi-dashboard',
    placement: 'banner',
    timing: 'immediate',
    frequency: 'every_48h',
    reason: 'Stresssymptome entwickeln sich still — ohne Log ist Intervention unmöglich.',
    goal: 'Ertragsverlust durch blinden Grow verhindern',
  },

  // ── Wasser: 3–4 Tage ─────────────────────────────────────────────────────
  {
    id: 'water_gap_medium',
    situation: 'Letzte Bewässerung 3–4 Tage her',
    trigger: { type: 'water_gap_days', min: 3, max: 4 },
    intensity: 'medium',
    priority: 'medium',
    articleSlug: 'bewaesserung-ohne-uebergiessen',
    placement: 'tooltip',
    timing: 'immediate',
    frequency: 'every_48h',
    reason: 'Trockenstress setzt ab Tag 3 ein und reduziert die Nährstoffaufnahme messbar.',
    goal: 'Gießen anstoßen, Trockenstress verhindern',
  },

  // ── Wasser: 5+ Tage (kritisch) ────────────────────────────────────────────
  {
    id: 'water_gap_critical',
    situation: 'Bewässerung seit 5+ Tagen ausgeblieben',
    trigger: { type: 'water_gap_days', min: 5 },
    intensity: 'critical',
    priority: 'critical',
    articleSlug: 'bewaesserung-ohne-uebergiessen',
    fallbackSlug: 'cannabis-substrat-und-wurzelzone',
    placement: 'daily_action_card',
    timing: 'immediate',
    frequency: 'daily',
    reason: 'Ab Tag 5 ohne Wasser droht irreversibler Schaden: Wurzelschäden und Ertragsverlust.',
    goal: 'Soforthandlung auslösen, Pflanzenverlust verhindern',
  },

  // ── Phasenübergang in ≤ 3 Tagen ───────────────────────────────────────────
  {
    id: 'phase_transition_soon',
    situation: 'Aktuelle Phase endet in ≤ 3 Tagen',
    trigger: { type: 'phase_ending_soon', daysLeft: 3 },
    intensity: 'high',
    priority: 'high',
    articleSlug: 'naehrstoffbedarf-cannabis-lebenszyklus',
    fallbackSlug: 'vpd-einfach-erklaert',
    placement: 'phase_card',
    timing: 'on_phase_enter',
    frequency: 'once',
    reason: 'Phasenwechsel erfordert andere Nährstoffprofile — zu späte Umstellung kostet Qualität.',
    goal: 'Phasenwechsel vorbereiten, Qualitätsverlust vermeiden',
  },

  // ── Erntephase aktiv ──────────────────────────────────────────────────────
  {
    id: 'harvest_phase_curing',
    situation: 'Grow ist in der Erntephase',
    trigger: { type: 'harvest_phase_active' },
    intensity: 'high',
    priority: 'high',
    articleSlug: 'wasseraktivitaet-und-curing',
    fallbackSlug: 'lagerung-verpackung-und-lichtschutz',
    placement: 'phase_card',
    timing: 'on_phase_enter',
    frequency: 'once',
    reason: 'Die ersten 72h nach der Ernte entscheiden über Terpenprofil und Haltbarkeit.',
    goal: 'Curing und Lagerung korrekt starten, Post-Harvest-Verluste minimieren',
  },

  // ── Health Score: 40–59 ───────────────────────────────────────────────────
  {
    id: 'health_score_low',
    situation: 'Grow-Score zwischen 40 und 59',
    trigger: { type: 'health_score_below', threshold: 60 },
    intensity: 'medium',
    priority: 'medium',
    articleSlug: 'sensor-kalibrierung-und-messfehler',
    fallbackSlug: 'vpd-einfach-erklaert',
    placement: 'health_card',
    timing: 'next_visit',
    frequency: 'every_48h',
    reason: 'Score unter 60 zeigt messbare Ineffizienz — Ursache ist meist ein unkontrollierter Parameter.',
    goal: 'Konkrete Ursache identifizieren, Score anheben',
  },

  // ── Health Score: < 40 (kritisch) ─────────────────────────────────────────
  {
    id: 'health_score_critical',
    situation: 'Grow-Score unter 40 — Ertrag ernsthaft gefährdet',
    trigger: { type: 'health_score_below', threshold: 40 },
    intensity: 'critical',
    priority: 'critical',
    articleSlug: 'stressmarker-frueh-erkennen',
    fallbackSlug: 'cannabis-anbau-grundlagen',
    placement: 'banner',
    timing: 'immediate',
    frequency: 'daily',
    reason: 'Score unter 40 korreliert mit 20–40% Ertragsverlust ohne Intervention.',
    goal: 'Trendumkehr anstoßen, Ertragsschäden begrenzen',
  },

  // ── Dünger eingetragen ────────────────────────────────────────────────────
  {
    id: 'post_log_fertilizer',
    situation: 'Nutzer hat gerade Dünger eingetragen',
    trigger: { type: 'last_log_type', logType: 'duenger' },
    intensity: 'low',
    priority: 'low',
    articleSlug: 'naehrstoffblockaden-und-antagonismen',
    fallbackSlug: 'naehrstoffbedarf-cannabis-lebenszyklus',
    placement: 'post_log_card',
    timing: 'after_action',
    frequency: 'every_48h',
    reason: 'Direkt nach dem Düngen ist das Bewusstsein für Nährstoffinteraktionen am höchsten.',
    goal: 'Blockaden und Überdüngungsfehler reduzieren',
  },

  // ── Training eingetragen ──────────────────────────────────────────────────
  {
    id: 'post_log_training',
    situation: 'Nutzer hat Training eingetragen',
    trigger: { type: 'last_log_type', logType: 'training' },
    intensity: 'low',
    priority: 'low',
    articleSlug: 'lichtstress-und-canopy-management',
    placement: 'post_log_card',
    timing: 'after_action',
    frequency: 'every_48h',
    reason: 'Trainingswissen direkt nach der Aktion verankert sich am stärksten.',
    goal: 'Canopy-Fehler nach Training reduzieren',
  },

  // ── 3+ überfällige Aufgaben ───────────────────────────────────────────────
  {
    id: 'overdue_tasks_many',
    situation: 'Mindestens 3 Aufgaben überfällig',
    trigger: { type: 'overdue_tasks', min: 3 },
    intensity: 'medium',
    priority: 'medium',
    articleSlug: 'integrierte-schaedlingspraevention-grow',
    fallbackSlug: 'naehrstoffbedarf-cannabis-lebenszyklus',
    placement: 'banner',
    timing: 'immediate',
    frequency: 'daily',
    reason: 'Überfällige Aufgaben sind meist Prävention — jeder verpasste Tag erhöht das Risiko.',
    goal: 'Task-Completion-Rate erhöhen, Dringlichkeit vermitteln',
  },

  // ── Streak 7+ Tage ────────────────────────────────────────────────────────
  {
    id: 'streak_7_days_deepen',
    situation: 'Nutzer dokumentiert seit 7+ Tagen täglich',
    trigger: { type: 'streak_min', days: 7 },
    intensity: 'low',
    priority: 'low',
    articleSlug: 'vpd-und-ec-kombi-rechner-guide',
    fallbackSlug: 'grow-log-und-kpi-dashboard',
    placement: 'daily_action_card',
    timing: 'next_visit',
    frequency: 'once',
    reason: 'Nutzer mit 7-Tage-Streak ist bereit für komplexeres Wissen — Momentum nutzen.',
    goal: 'Lerntiefe steigern, Engagement vertiefen',
  },
];

// ── Priorität-Rangfolge ────────────────────────────────────────────────────────

const INTENSITY_RANK: Record<WikiIntensity, number> = {
  critical: 4,
  high:     3,
  medium:   2,
  low:      1,
};

// ── Evaluierungs-Kontext ──────────────────────────────────────────────────────

export type WikiEvalContext = {
  /** Tage seit letztem Log-Eintrag (beliebiger Typ) */
  logGapDays: number;
  /** Tage seit letzter Bewässerung */
  waterGapDays: number;
  /** Aktueller Grow-Health-Score (0–100) */
  healthScore: number;
  /** Aktueller Log-Streak in Tagen */
  streakDays: number;
  /** Anzahl überfälliger Aufgaben */
  overdueTasks: number;
  /** Tage bis Ende der aktuellen Phase */
  daysUntilPhaseEnd: number;
  /** Ob Erntephase aktiv ist */
  isHarvestPhase: boolean;
  /** Ob Nutzer noch keine Einträge hat */
  hasNoEntries: boolean;
  /** Ob dies der erste Run des Nutzers ist */
  isFirstRun: boolean;
  /** Typ des zuletzt erstellten Log-Eintrags */
  lastLogType?: 'wasser' | 'duenger' | 'training' | 'notiz';
  /** Slugs von Artikeln, die der Nutzer bereits gesehen hat */
  seenArticleSlugs: string[];
  /** Slugs von Artikeln, die in den letzten 48h gezeigt wurden */
  recentlyShownSlugs: string[];
};

// ── Kernfunktion: aktive Regel auflösen ───────────────────────────────────────

/**
 * Wertet alle Regeln gegen den aktuellen Kontext aus.
 * Gibt die Regel mit der höchsten Priorität zurück, die:
 *   - getriggert ist
 *   - nicht zu häufig gezeigt wurde
 *   - einen noch nicht gesehenen Artikel liefert
 *
 * Display-Regeln:
 *   - Nur 1 Regel gleichzeitig aktiv (höchste Priorität gewinnt)
 *   - Kein Artikel innerhalb von 48h wiederholen
 *   - Gesehene Artikel auf Fallback ausweichen
 */
export function resolveActiveRule(
  ctx: WikiEvalContext,
): (WikiContextRule & { resolvedSlug: string }) | undefined {

  const matched = WIKI_CONTEXT_RULES
    .filter((rule) => isTriggered(rule.trigger, ctx))
    .sort((a, b) => INTENSITY_RANK[b.priority] - INTENSITY_RANK[a.priority]);

  for (const rule of matched) {
    const slug = pickSlug(rule, ctx);
    if (!slug) continue; // alle Artikel für diese Regel bereits gesehen
    if (ctx.recentlyShownSlugs.includes(slug)) continue; // 48h-Sperre
    return { ...rule, resolvedSlug: slug };
  }

  return undefined;
}

// ── Interne Hilfsfunktionen ───────────────────────────────────────────────────

function isTriggered(trigger: WikiTrigger, ctx: WikiEvalContext): boolean {
  switch (trigger.type) {
    case 'no_entries':
      return ctx.hasNoEntries;
    case 'first_run':
      return ctx.isFirstRun && !ctx.hasNoEntries;
    case 'log_gap_days':
      return ctx.logGapDays >= trigger.min && (trigger.max === undefined || ctx.logGapDays <= trigger.max);
    case 'water_gap_days':
      return ctx.waterGapDays >= trigger.min && (trigger.max === undefined || ctx.waterGapDays <= trigger.max);
    case 'phase_ending_soon':
      return ctx.daysUntilPhaseEnd <= trigger.daysLeft && !ctx.isHarvestPhase;
    case 'harvest_phase_active':
      return ctx.isHarvestPhase;
    case 'health_score_below':
      return ctx.healthScore < trigger.threshold;
    case 'health_score_above':
      return ctx.healthScore >= trigger.threshold;
    case 'streak_min':
      return ctx.streakDays >= trigger.days;
    case 'last_log_type':
      return ctx.lastLogType === trigger.logType;
    case 'overdue_tasks':
      return ctx.overdueTasks >= trigger.min;
    default:
      return false;
  }
}

function pickSlug(rule: WikiContextRule, ctx: WikiEvalContext): string | undefined {
  if (!ctx.seenArticleSlugs.includes(rule.articleSlug)) return rule.articleSlug;
  if (rule.fallbackSlug && !ctx.seenArticleSlugs.includes(rule.fallbackSlug)) return rule.fallbackSlug;
  return undefined;
}

// ── Hilfsfunktionen für spezifische Abfragen ─────────────────────────────────

/**
 * Gibt alle getriggerten Regeln für einen Placement-Typ zurück.
 * Nützlich wenn mehrere Placements gleichzeitig befüllt werden sollen.
 */
export function getRulesForPlacement(
  placement: WikiPlacement,
  ctx: WikiEvalContext,
): (WikiContextRule & { resolvedSlug: string })[] {
  return WIKI_CONTEXT_RULES
    .filter((rule) => rule.placement === placement && isTriggered(rule.trigger, ctx))
    .sort((a, b) => INTENSITY_RANK[b.priority] - INTENSITY_RANK[a.priority])
    .flatMap((rule) => {
      const slug = pickSlug(rule, ctx);
      return slug && !ctx.recentlyShownSlugs.includes(slug)
        ? [{ ...rule, resolvedSlug: slug }]
        : [];
    });
}

// ────────────────────────────────────────────────────────────────────────────
// Action Feedback Loop
//
// Jede Loop definiert:
//   trigger      → wann aktiv
//   articleSlug  → welcher Artikel zuerst gezeigt wird
//   action       → konkrete Handlung, die der Nutzer tun soll
//   detection    → wie das System die erledigte Aktion erkennt
//   feedbackText → Rückmeldung unmittelbar nach der Aktion
//   impactType   → was sich im System ändert (Score, Streak, Phase, Status)
//   nextStep     → nächster Artikel / nächste Empfehlung nach Abschluss
// ────────────────────────────────────────────────────────────────────────────

export type FeedbackLoopDetection =
  | { type: 'log_entry_today' }                          // Irgendein Log-Eintrag heute
  | { type: 'log_type_today'; logType: 'wasser' | 'duenger' | 'training' | 'notiz' }
  | { type: 'log_gap_resolved'; maxDays: number }        // Lücke geschlossen (letzter Eintrag ≤ maxDays)
  | { type: 'score_increased'; byAtLeast: number }       // Score um Mindestbetrag gestiegen
  | { type: 'score_above'; threshold: number }           // Score jetzt über Schwelle
  | { type: 'phase_changed' }                            // Phase gewechselt
  | { type: 'streak_reached'; days: number }             // Streak erreicht
  | { type: 'task_completed'; taskId?: string }          // Aufgabe erledigt
  | { type: 'harvest_logged' };                          // Ernte-Eintrag vorhanden

export type FeedbackImpactType =
  | 'score_up'        // Health Score steigt sichtbar
  | 'streak_saved'    // Tages-Serie bleibt erhalten oder startet neu
  | 'loss_prevented'  // Nachgewiesener Ertragsverlust verhindert
  | 'phase_ready'     // Pflanze bereit für nächste Phase
  | 'quality_secured' // Terpenprofil / Lagerqualität gesichert
  | 'knowledge_added';// Wissen verankert, kein messbarer Score-Effekt

export type WikiFeedbackLoop = {
  /** Muss einer existierenden WikiContextRule.id entsprechen */
  ruleId: string;
  /** Artikel, der vor der Aktion gezeigt wird */
  articleSlug: string;
  /** Konkrete Handlung, zu der der Artikel auffordert */
  action: string;
  /** Wie das System die Handlung erkennt */
  detection: FeedbackLoopDetection;
  /** Text unmittelbar nach erkannter Aktion (max. 1 Satz) */
  feedbackText: string;
  /** Was sich im System ändert */
  impactType: FeedbackImpactType;
  /** Nächster Artikel / nächste Empfehlung nach erledigter Aktion */
  nextStep: string;
};

// ── 10 Feedback Loops ────────────────────────────────────────────────────────

export const WIKI_FEEDBACK_LOOPS: WikiFeedbackLoop[] = [

  // 1. Kein Eintrag → ersten Log-Eintrag machen
  {
    ruleId: 'onboarding_no_entries',
    articleSlug: 'how-to-grow-cannabis-anfaenger-tutorial',
    action: 'Ersten Eintrag hinzufügen — Wasser, Dünger oder Beobachtung',
    detection: { type: 'log_entry_today' },
    feedbackText: 'Dein Grow läuft jetzt nicht mehr blind — ab heute erkennst du Probleme, bevor sie Ertrag kosten.',
    impactType: 'score_up',
    nextStep: 'cannabis-anbau-grundlagen',
  },

  // 2. Log-Lücke 2–3 Tage → heute eintragen
  {
    ruleId: 'log_gap_2_3_days',
    articleSlug: 'grow-log-und-kpi-dashboard',
    action: 'Heute eintragen — Wasser, Dünger oder kurze Beobachtung genügt',
    detection: { type: 'log_entry_today' },
    feedbackText: 'Deine Kontrolle ist zurück — in den nächsten 24 Stunden wirst du sehen, ob deine Pflanze auf Kurs ist.',
    impactType: 'streak_saved',
    nextStep: 'stressmarker-frueh-erkennen',
  },

  // 3. Log-Lücke 4–6 Tage → Rückkehr + Stresscheck
  {
    ruleId: 'log_gap_4_6_days',
    articleSlug: 'stressmarker-frueh-erkennen',
    action: 'Pflanze prüfen und Beobachtung eintragen — besonders Blattbild und Farbe',
    detection: { type: 'log_gap_resolved', maxDays: 1 },
    feedbackText: 'Du hast den blinden Fleck geschlossen — jetzt kannst du wieder eingreifen, bevor etwas kippt.',
    impactType: 'loss_prevented',
    nextStep: 'grow-log-und-kpi-dashboard',
  },

  // 4. Wasser überfällig (mittel) → gießen und eintragen
  {
    ruleId: 'water_gap_medium',
    articleSlug: 'bewaesserung-ohne-uebergiessen',
    action: 'Pflanze jetzt gießen und Wasser-Eintrag anlegen',
    detection: { type: 'log_type_today', logType: 'wasser' },
    feedbackText: 'Trockenstress gestoppt — deine Pflanze nimmt jetzt wieder Nährstoffe auf.',
    impactType: 'loss_prevented',
    nextStep: 'cannabis-substrat-und-wurzelzone',
  },

  // 5. Wasser kritisch (5+ Tage) → sofort gießen
  {
    ruleId: 'water_gap_critical',
    articleSlug: 'bewaesserung-ohne-uebergiessen',
    action: 'Sofort gießen und Eintrag hinzufügen — Substrat prüfen',
    detection: { type: 'log_type_today', logType: 'wasser' },
    feedbackText: 'Du hast drohende Wurzelschäden verhindert — beobachte die nächsten 48 Stunden, ob Erholung einsetzt.',
    impactType: 'loss_prevented',
    nextStep: 'stressmarker-frueh-erkennen',
  },

  // 6. Phasenübergang → Nährstoffprofil anpassen + eintragen
  {
    ruleId: 'phase_transition_soon',
    articleSlug: 'naehrstoffbedarf-cannabis-lebenszyklus',
    action: 'Nährstoffprofil für die neue Phase anpassen und Änderung eintragen',
    detection: { type: 'phase_changed' },
    feedbackText: 'Deine Pflanze bekommt ab jetzt das richtige Profil für diese Phase — zu späte Umstellung hätte Blüte und Terpene gekürzt.',
    impactType: 'phase_ready',
    nextStep: 'vpd-einfach-erklaert',
  },

  // 7. Erntephase → Curing starten und eintragen
  {
    ruleId: 'harvest_phase_curing',
    articleSlug: 'wasseraktivitaet-und-curing',
    action: 'Ernte eintragen und Curing-Bedingungen (Temp, RH) festhalten',
    detection: { type: 'harvest_logged' },
    feedbackText: 'Du schützt jetzt aktiv das Terpenprofil deiner Ernte — Temperaturen über 22°C in den nächsten Wochen würden das Profil unwiderruflich verändern.',
    impactType: 'quality_secured',
    nextStep: 'lagerung-verpackung-und-lichtschutz',
  },

  // 8. Health Score kritisch → heute eintragen und Score erholen
  {
    ruleId: 'health_score_critical',
    articleSlug: 'stressmarker-frueh-erkennen',
    action: 'Pflanzen prüfen, Befund oder Maßnahme eintragen',
    detection: { type: 'score_increased', byAtLeast: 5 },
    feedbackText: 'Dein Eingriff ist dokumentiert — wenn du jetzt täglich einträgst, siehst du in 3 Tagen, ob die Pflanze reagiert hat.',
    impactType: 'score_up',
    nextStep: 'grow-log-und-kpi-dashboard',
  },

  // 9. Dünger eingetragen → Blockaden kennen
  {
    ruleId: 'post_log_fertilizer',
    articleSlug: 'naehrstoffblockaden-und-antagonismen',
    action: 'Artikel lesen und pH-Wert beim nächsten Gießen prüfen',
    detection: { type: 'log_type_today', logType: 'wasser' },
    feedbackText: 'pH-Check beim Gießen verhindert, dass dein Dünger wirkungslos bleibt — der häufigste Grund für Mängelerscheinungen trotz regelmäßiger Düngung.',
    impactType: 'knowledge_added',
    nextStep: 'naehrstoffbedarf-cannabis-lebenszyklus',
  },

  // 10. Streak 7 Tage → nächstes Level freischalten
  {
    ruleId: 'streak_7_days_deepen',
    articleSlug: 'vpd-und-ec-kombi-rechner-guide',
    action: 'VPD und EC heute zusammen messen und beide Werte eintragen',
    detection: { type: 'streak_reached', days: 10 },
    feedbackText: '10 Tage eigene Messdaten — du entscheidest jetzt auf Basis deines Grows, nicht auf Basis allgemeiner Empfehlungen.',
    impactType: 'score_up',
    nextStep: 'sensor-kalibrierung-und-messfehler',
  },
];

// ── Feedback-Loop-Auflösung ───────────────────────────────────────────────────

/**
 * Prüft, ob die Erkennungsbedingung eines Loops erfüllt ist.
 * Gibt true zurück wenn die Aktion als erledigt gilt.
 */
export function isLoopCompleted(
  loop: WikiFeedbackLoop,
  ctx: WikiEvalContext & {
    todayLogTypes: Array<'wasser' | 'duenger' | 'training' | 'notiz'>;
    previousScore: number;
    phaseChangedToday: boolean;
    harvestLoggedToday: boolean;
  },
): boolean {
  const d = loop.detection;
  switch (d.type) {
    case 'log_entry_today':
      return ctx.logGapDays === 0;
    case 'log_type_today':
      return ctx.todayLogTypes.includes(d.logType);
    case 'log_gap_resolved':
      return ctx.logGapDays <= d.maxDays;
    case 'score_increased':
      return ctx.healthScore - ctx.previousScore >= d.byAtLeast;
    case 'score_above':
      return ctx.healthScore >= d.threshold;
    case 'phase_changed':
      return ctx.phaseChangedToday;
    case 'streak_reached':
      return ctx.streakDays >= d.days;
    case 'task_completed':
      return ctx.overdueTasks === 0;
    case 'harvest_logged':
      return ctx.harvestLoggedToday;
    default:
      return false;
  }
}

/**
 * Gibt den aktiven Feedback-Loop für eine gegebene Regel-ID zurück.
 * undefined wenn kein Loop für diese Regel definiert ist.
 */
export function getFeedbackLoop(ruleId: string): WikiFeedbackLoop | undefined {
  return WIKI_FEEDBACK_LOOPS.find((l) => l.ruleId === ruleId);
}

// ────────────────────────────────────────────────────────────────────────────
// Momentum System
//
// Berechnet den Richtungs-Zustand eines Grows aus Verhaltens-Signalen.
// Keine Rohdaten im UI — nur Richtung und Gefühl.
//
// Momentum wird berechnet aus:
//   - Score-Veränderung seit letztem Besuch
//   - Aktivem Streak
//   - Gelösten Problemen (Lücken geschlossen, Tasks erledigt)
//   - Offenen kritischen Triggern
//
// Verwendung:
//   computeMomentum(ctx)  → GrowMomentum
//   getMomentumCopy(m)    → { headline, subtext, placement }
// ────────────────────────────────────────────────────────────────────────────

export type MomentumState =
  | 'improving'   // Grow entwickelt sich messbar positiv
  | 'stable'      // Kein Trend in eine Richtung
  | 'declining'   // Signale zeigen Verlust von Kontrolle
  | 'critical';   // Aktiver Schaden läuft gerade

export type GrowMomentum = {
  state: MomentumState;
  /** Score-Punkte seit letztem Besuch — intern, nicht im UI */
  scoreDelta: number;
  /** Einzelne Signale die zur Bewertung beigetragen haben */
  signals: MomentumSignal[];
};

export type MomentumSignal =
  | 'streak_active'
  | 'streak_broken'
  | 'log_gap_resolved'
  | 'log_gap_growing'
  | 'water_overdue'
  | 'score_up'
  | 'score_down'
  | 'task_resolved'
  | 'critical_rule_active'
  | 'harvest_phase';

/** UI-Text für einen Momentum-Zustand — nie Zahlen, nur Richtung */
export type MomentumCopy = {
  /** Primärzeil, kurz — für Header und Daily Flow */
  headline: string;
  /** Erklärende Folgezeile — für nach Aktionen und Detailansicht */
  subtext: string;
  /** Empfohlene Platzierung im UI */
  placement: ('header' | 'post_action' | 'daily_flow')[];
};

// ── Momentum-Texte pro Zustand ────────────────────────────────────────────────
//
// Je 3 Varianten pro Zustand — System rotiert, damit Texte nicht
// nach kurzer Zeit auswendig gelernt und ignoriert werden.

export const MOMENTUM_COPY: Record<MomentumState, MomentumCopy[]> = {

  improving: [
    {
      headline: 'Du baust dir einen Vorsprung auf.',
      subtext: 'Deine Pflanze entwickelt sich in die richtige Richtung — das ist das Ergebnis deiner letzten Einträge.',
      placement: ['header', 'post_action', 'daily_flow'],
    },
    {
      headline: 'Dein Grow gewinnt an Stabilität.',
      subtext: 'Jeder Tag mit Eintrag macht Probleme früher sichtbar — du bist jetzt im Vorteil.',
      placement: ['header', 'daily_flow'],
    },
    {
      headline: 'Du hast die Kontrolle — und nutzt sie.',
      subtext: 'Deine letzte Aktion hat Wirkung gezeigt. Bleib dran.',
      placement: ['post_action'],
    },
  ],

  stable: [
    {
      headline: 'Dein Grow ist auf Kurs.',
      subtext: 'Kein akuter Eingriff nötig — heute dokumentieren reicht.',
      placement: ['header', 'daily_flow'],
    },
    {
      headline: 'Alles läuft, nichts brennt.',
      subtext: 'Nutze den ruhigen Tag für eine Beobachtung, die du sonst übersiehst.',
      placement: ['header', 'daily_flow'],
    },
    {
      headline: 'Dein Grow hält die Linie.',
      subtext: 'Gleichmäßige Dokumentation ist das, was stabile Ergebnisse macht.',
      placement: ['post_action', 'daily_flow'],
    },
  ],

  declining: [
    {
      headline: 'Du verlierst gerade Kontrolle.',
      subtext: 'Es gibt noch keine Schäden — aber die Lücken wachsen. Heute eintragen stoppt den Trend.',
      placement: ['header', 'daily_flow'],
    },
    {
      headline: 'Dein Grow läuft ohne dich.',
      subtext: 'Ohne Dokumentation siehst du erst Probleme, wenn sie schon Ertrag gekostet haben.',
      placement: ['header', 'post_action'],
    },
    {
      headline: 'Dein Vorsprung schmilzt.',
      subtext: 'Jeder Tag ohne Eintrag macht Eingreifen aufwändiger — heute ist der richtige Moment.',
      placement: ['daily_flow'],
    },
  ],

  critical: [
    {
      headline: 'Dein Grow braucht jetzt deine Aufmerksamkeit.',
      subtext: 'Etwas läuft aktiv falsch — eine Aktion heute verhindert Verluste, die sich nicht mehr aufholen lassen.',
      placement: ['header', 'daily_flow'],
    },
    {
      headline: 'Jetzt eingreifen — nicht morgen.',
      subtext: 'Der Schaden ist noch umkehrbar. Aber die Zeit dafür läuft.',
      placement: ['header', 'post_action'],
    },
    {
      headline: 'Du verlierst gerade Ertrag.',
      subtext: 'Was jetzt passiert, zeigt sich erst zur Ernte — handle heute.',
      placement: ['header', 'daily_flow'],
    },
  ],
};

// ── Eingabe-Kontext für Momentum ──────────────────────────────────────────────

export type MomentumContext = {
  /** Score jetzt */
  currentScore: number;
  /** Score beim letzten Besuch (0 wenn unbekannt) */
  previousScore: number;
  /** Aktiver Streak in Tagen */
  streakDays: number;
  /** Tage seit letztem Log-Eintrag */
  logGapDays: number;
  /** Tage seit letzter Bewässerung */
  waterGapDays: number;
  /** Anzahl überfälliger Tasks */
  overdueTasks: number;
  /** Ob ein critical-Trigger aktiv ist */
  hasCriticalTrigger: boolean;
  /** Ob heute eine Aktion erledigt wurde */
  actionCompletedToday: boolean;
  /** Ob Erntephase aktiv */
  isHarvestPhase: boolean;
};

// ── Momentum berechnen ────────────────────────────────────────────────────────

/**
 * Berechnet den Momentum-Zustand aus dem aktuellen Kontext.
 * Die Signale sind additiv — mehrere schlechte Signale zusammen
 * können den Zustand stärker absenken als eines allein.
 */
export function computeMomentum(ctx: MomentumContext): GrowMomentum {
  const signals: MomentumSignal[] = [];
  let score = 0; // positiv = improving, negativ = declining

  // ── Positive Signale ──────────────────────────────────────────────────────

  if (ctx.streakDays >= 3) {
    signals.push('streak_active');
    score += ctx.streakDays >= 7 ? 3 : 1;
  }

  if (ctx.currentScore - ctx.previousScore >= 5) {
    signals.push('score_up');
    score += 2;
  }

  if (ctx.actionCompletedToday) {
    signals.push('log_gap_resolved');
    score += 2;
  }

  if (ctx.overdueTasks === 0 && ctx.logGapDays === 0) {
    signals.push('task_resolved');
    score += 1;
  }

  // ── Negative Signale ──────────────────────────────────────────────────────

  if (ctx.logGapDays >= 2 && ctx.logGapDays <= 3) {
    signals.push('log_gap_growing');
    score -= 2;
  }

  if (ctx.logGapDays >= 4) {
    signals.push('log_gap_growing');
    score -= 4;
  }

  if (ctx.streakDays === 0 && ctx.logGapDays >= 2) {
    signals.push('streak_broken');
    score -= 1;
  }

  if (ctx.waterGapDays >= 3) {
    signals.push('water_overdue');
    score -= ctx.waterGapDays >= 5 ? 4 : 2;
  }

  if (ctx.currentScore - ctx.previousScore <= -5) {
    signals.push('score_down');
    score -= 2;
  }

  if (ctx.hasCriticalTrigger) {
    signals.push('critical_rule_active');
    score -= 3;
  }

  if (ctx.isHarvestPhase) {
    signals.push('harvest_phase');
    // Erntephase ist neutral — weder positiv noch negativ als Signal
  }

  // ── State-Auflösung ───────────────────────────────────────────────────────

  let state: MomentumState;

  if (ctx.hasCriticalTrigger && ctx.waterGapDays >= 5) {
    state = 'critical';
  } else if (ctx.hasCriticalTrigger || ctx.logGapDays >= 4) {
    state = 'critical';
  } else if (score >= 3) {
    state = 'improving';
  } else if (score >= 0) {
    state = 'stable';
  } else if (score >= -3) {
    state = 'declining';
  } else {
    state = 'critical';
  }

  return {
    state,
    scoreDelta: ctx.currentScore - ctx.previousScore,
    signals,
  };
}

// ── Momentum-Text abrufen ─────────────────────────────────────────────────────

/**
 * Gibt einen passenden Text-Block für den Momentum-Zustand zurück.
 * Rotiert basierend auf dem Wochentag, damit Texte nicht immer gleich sind.
 */
export function getMomentumCopy(
  momentum: GrowMomentum,
  placement: 'header' | 'post_action' | 'daily_flow' = 'header',
): MomentumCopy {
  const variants = MOMENTUM_COPY[momentum.state].filter((c) =>
    c.placement.includes(placement),
  );
  if (variants.length === 0) return MOMENTUM_COPY[momentum.state][0]!;

  // Rotation über Wochentag — konsistent innerhalb eines Tages
  const dayIndex = new Date().getDay();
  return variants[dayIndex % variants.length]!;
}

/**
 * Gibt alle Placements zurück, für die Momentum-Text verfügbar ist.
 */
export function getMomentumPlacements(state: MomentumState): ('header' | 'post_action' | 'daily_flow')[] {
  return [...new Set(MOMENTUM_COPY[state].flatMap((c) => c.placement))];
}

// ────────────────────────────────────────────────────────────────────────────
// Direction System
//
// Ergänzt den Momentum-Zustand um eine Richtungsaussage:
//   up   → Grow entwickelt sich aktiv positiv
//   down → Grow verliert aktiv Stabilität
//   flat → Kein erkennbarer Trend
//
// Direction kombiniert sich mit MomentumState zu einer kombinierten Aussage.
// Keine Zahlen in der UI — nur Richtung und Gefühl.
//
// Verwendung:
//   computeDirection(ctx)                     → MomentumDirection
//   getDirectionCopy(direction, momentum)     → DirectionCopy
// ────────────────────────────────────────────────────────────────────────────

export type MomentumDirection = 'up' | 'down' | 'flat';

export type DirectionCopy = {
  /** Symbol für UI (kein Score, nur Richtung) */
  indicator: '↑' | '↓' | '→';
  /** Kombinierter Text aus Momentum + Richtung (keine Zahlen) */
  headline: string;
  /** Kurze Erklärung was sich verändert */
  subtext: string;
};

// ── Richtungs-Texte: 4 Zustände × 3 Richtungen ───────────────────────────────

export const DIRECTION_COPY: Record<MomentumState, Record<MomentumDirection, DirectionCopy>> = {

  improving: {
    up: {
      indicator: '↑',
      headline: 'Dein Grow verbessert sich sichtbar.',
      subtext: 'Deine letzten Einträge zeigen Wirkung — der Trend zeigt nach oben.',
    },
    flat: {
      indicator: '→',
      headline: 'Dein Grow entwickelt sich gut.',
      subtext: 'Kein Rückschritt, kein Druck — bleib im Rhythmus.',
    },
    down: {
      indicator: '↓',
      headline: 'Du hast Fortschritt gemacht, aber der Schwung bricht ab.',
      subtext: 'Das Positive hält, aber neue Lücken bremsen den Trend.',
    },
  },

  stable: {
    up: {
      indicator: '↑',
      headline: 'Dein Grow stabilisiert sich weiter.',
      subtext: 'Kein Problem aktiv — du gewinnst Spielraum.',
    },
    flat: {
      indicator: '→',
      headline: 'Dein Grow bleibt stabil.',
      subtext: 'Weder Verlust noch Gewinn — heute dokumentieren hält das so.',
    },
    down: {
      indicator: '↓',
      headline: 'Dein Grow ist stabil, aber zeigt erste Schwächen.',
      subtext: 'Noch kein akuter Schaden — aber die Richtung verändert sich.',
    },
  },

  declining: {
    up: {
      indicator: '↑',
      headline: 'Du wendest den Trend.',
      subtext: 'Die Lage war kritischer — deine letzte Aktion hat die Richtung umgekehrt.',
    },
    flat: {
      indicator: '→',
      headline: 'Dein Grow verliert Kontrolle — aber noch nicht weiter.',
      subtext: 'Kein neuer Schaden, aber auch keine Erholung. Heute eingreifen.',
    },
    down: {
      indicator: '↓',
      headline: 'Dein Grow verliert weiter an Stabilität.',
      subtext: 'Jeder Tag ohne Eingriff macht das Umkehren aufwändiger.',
    },
  },

  critical: {
    up: {
      indicator: '↑',
      headline: 'Du stoppst gerade den Schaden.',
      subtext: 'Die Lage war ernst — aber deine letzte Aktion zeigt erste Wirkung.',
    },
    flat: {
      indicator: '→',
      headline: 'Dein Grow braucht jetzt Eingriff.',
      subtext: 'Kein aktiver Rückschritt mehr — aber ohne Handlung bleibt nichts erhalten.',
    },
    down: {
      indicator: '↓',
      headline: 'Dein Grow verliert gerade Ertrag.',
      subtext: 'Was jetzt passiert, lässt sich zur Ernte nicht mehr ausgleichen.',
    },
  },
};

// ── Direction berechnen ───────────────────────────────────────────────────────

export type DirectionContext = {
  /** Score jetzt */
  currentScore: number;
  /** Score beim letzten Besuch */
  previousScore: number;
  /** Lücken seit letztem Besuch (0 = keine neue Lücke) */
  newGapDays: number;
  /** Anzahl heute gelöster Probleme (Lücke geschlossen, Task erledigt etc.) */
  resolvedToday: number;
  /** Anzahl neu aufgetretener Probleme seit letztem Besuch */
  newProblems: number;
};

/**
 * Berechnet die Richtung basierend auf Score-Delta und Problemveränderungen.
 * Gibt 'up', 'down' oder 'flat' zurück — keine Zahlen im Output.
 */
export function computeDirection(ctx: DirectionContext): MomentumDirection {
  let signal = 0;

  // Score-Entwicklung
  const delta = ctx.currentScore - ctx.previousScore;
  if (delta >= 5) signal += 2;
  else if (delta >= 2) signal += 1;
  else if (delta <= -5) signal -= 2;
  else if (delta <= -2) signal -= 1;

  // Probleme gelöst vs. neu entstanden
  signal += ctx.resolvedToday;
  signal -= ctx.newProblems;

  // Neue Lücke ist ein klarer Abwärtshandlungen
  if (ctx.newGapDays >= 2) signal -= 2;
  else if (ctx.newGapDays === 1) signal -= 1;

  if (signal >= 2) return 'up';
  if (signal <= -2) return 'down';
  return 'flat';
}

// ── Kombinierte Ausgabe ───────────────────────────────────────────────────────

/**
 * Gibt den kombinierten Richtungs-Text zurück.
 * Momentum-Zustand bestimmt die emotionale Ebene,
 * Direction bestimmt die Bewegungsrichtung.
 */
export function getDirectionCopy(
  direction: MomentumDirection,
  momentum: GrowMomentum,
): DirectionCopy {
  return DIRECTION_COPY[momentum.state][direction];
}

/**
 * Vollständige kombinierte Ausgabe: Momentum + Direction in einem Aufruf.
 * Verwendung im Header, Daily Flow und nach Aktionen.
 */
export function resolveGrowDirection(
  mCtx: MomentumContext,
  dCtx: DirectionContext,
): {
  momentum: GrowMomentum;
  direction: MomentumDirection;
  copy: DirectionCopy;
} {
  const momentum = computeMomentum(mCtx);
  const direction = computeDirection(dCtx);
  const copy = getDirectionCopy(direction, momentum);
  return { momentum, direction, copy };
}

// ────────────────────────────────────────────────────────────────────────────
// Identity System
//
// Bildet die Entwicklung des Nutzers als Grower ab.
// Kein Gamification — nur nachgewiesenes Verhalten.
//
// Level drücken aus, WAS der Nutzer tut, nicht wie viele Tage er dabei ist:
//   beginner    → lernt, wie der Grow reagiert — noch kein Rhythmus
//   progressing → dokumentiert regelmäßig, erkennt erste Muster
//   controlling → greift aktiv ein, bevor Probleme Ertrag kosten
//   expert      → trifft bewusste Entscheidungen, versteht Ursache→Wirkung
//
// Verwendung:
//   computeIdentityLevel(ctx)          → GrowIdentity
//   getIdentityCopy(identity)          → IdentityCopy
//   getCombinedCopy(identity, momentum) → string (situativer Zustandstext)
// ────────────────────────────────────────────────────────────────────────────

export type IdentityLevel =
  | 'beginner'      // Lernt, wie der Grow reagiert
  | 'progressing'   // Dokumentiert regelmäßig, erkennt erste Muster
  | 'controlling'   // Greift aktiv ein, bevor Schaden entsteht
  | 'expert';       // Trifft bewusste Entscheidungen, Ergebnisse sind reproduzierbar

export type IdentitySignal =
  | 'first_entry'           // Erster Eintrag
  | 'streak_3'              // 3 Tage hintereinander
  | 'streak_7'              // 7 Tage hintereinander
  | 'streak_14'             // 14 Tage hintereinander
  | 'problem_resolved'      // Kritisches Problem eigenständig gelöst
  | 'early_intervention'    // Eingegriffen bevor Schaden entstand
  | 'phase_completed'       // Eine Phase abgeschlossen
  | 'multi_phase_completed' // 3+ Phasen abgeschlossen
  | 'second_run'            // Zweiter Grow gestartet
  | 'consistent_watering'   // 14 Tage kein Wasser-Gap > 3d
  | 'score_stable'          // Score ≥ 60 über ≥ 7 Tage
  | 'score_high'            // Score ≥ 80 erreicht
  | 'harvest_documented'    // Ernte vollständig dokumentiert
  | 'cause_effect_linked';  // Ursache-Wirkung explizit verknüpft

export type GrowIdentity = {
  level: IdentityLevel;
  signals: IdentitySignal[];
};

// ── Identity-Texte ────────────────────────────────────────────────────────────
//
// Was du als Grower gerade tust — keine Belohnungen, keine Punkte.

export type IdentityCopy = {
  /** Was du als Grower gerade tust */
  identity: string;
  /** Was das konkret bedeutet */
  meaning: string;
  /** Was als nächstes das Verhalten verändert */
  next: string;
};

export const IDENTITY_COPY: Record<IdentityLevel, IdentityCopy> = {

  beginner: {
    identity: 'Du lernst, wie dein Grow reagiert.',
    meaning: 'Noch kein stabiler Rhythmus — aber das ist der richtige Ausgangspunkt.',
    next: 'Dokumentiere drei Tage hintereinander. Das reicht, um erste Muster zu erkennen.',
  },

  progressing: {
    identity: 'Du dokumentierst regelmäßig und erkennst erste Muster.',
    meaning: 'Du weißt, wann gegossen wird, wie die Pflanze reagiert, was Stress auslöst.',
    next: 'Der nächste Schritt: nicht nur beobachten — eingreifen, bevor ein Problem Schaden anrichtet.',
  },

  controlling: {
    identity: 'Du greifst aktiv ein, bevor Probleme Ertrag kosten.',
    meaning: 'Dein Grow läuft nicht zufällig gut. Du hast Kontrolle — und du nutzt sie.',
    next: 'Kontrolle wird erst stabil, wenn sie sich wiederholt. Das zeigt sich im nächsten Run.',
  },

  expert: {
    identity: 'Du triffst bewusste Entscheidungen und verstehst Ursache und Wirkung.',
    meaning: 'Deine Ergebnisse sind reproduzierbar — weil du weißt, was sie verursacht.',
    next: 'Dein Wissen wird mit jedem Run präziser. Halte fest, was du beim nächsten anders machst.',
  },
};

// ── Kombinierte Copy: Identity × Momentum ─────────────────────────────────────
//
// Der "gefühlte Zustand" — kombiniert, wer du bist, mit dem was gerade passiert.
// Das ist der Text, der in der UI sichtbar wird.

export const COMBINED_COPY: Record<IdentityLevel, Record<MomentumState, string>> = {

  beginner: {
    improving: 'Du machst Fortschritte — bleib dran.',
    stable:    'Du hältst den Rhythmus. Das ist der Anfang von Kontrolle.',
    declining: 'Dein Grow braucht jetzt Aufmerksamkeit. Schau, was fehlt.',
    critical:  'Du bist noch am Anfang — aber du kannst das jetzt noch retten.',
  },

  progressing: {
    improving: 'Du erkennst Muster und dein Grow verbessert sich.',
    stable:    'Du hältst Stabilität — das ist mehr als die meisten erreichen.',
    declining: 'Du verlierst gerade Boden. Was hat sich in den letzten Tagen verändert?',
    critical:  'Dein Grow ist in einer kritischen Phase. Jetzt ist Eingreifen wichtiger als Dokumentieren.',
  },

  controlling: {
    improving: 'Du hast deinen Grow im Griff und verbesserst ihn weiter.',
    stable:    'Stabil und kontrolliert — das ist kein Zufall mehr.',
    declining: 'Du hast Kontrolle — aber verlierst sie gerade. Jetzt handeln, bevor Schaden entsteht.',
    critical:  'Kritische Lage, aber du hast alle Werkzeuge, um sie zu lösen. Was hat das ausgelöst?',
  },

  expert: {
    improving: 'Du verbesserst einen Grow, den du bereits verstehst.',
    stable:    'Reproduzierbare Stabilität — das ist der Kern von System-Anbau.',
    declining: 'Auch erfahrene Grower verlieren Kontrolle. Der Unterschied: du erkennst es früh.',
    critical:  'Kritische Phase trotz Erfahrung — das hat einen Grund. Geh die letzten Einträge durch.',
  },
};

// ── Identity-Kontext ──────────────────────────────────────────────────────────

export type IdentityContext = {
  /** Gesamtanzahl Log-Einträge */
  totalEntries: number;
  /** Aktueller Streak in Tagen */
  streakDays: number;
  /** Längster jemals erreichter Streak */
  maxStreakEver: number;
  /** Anzahl kritischer Probleme die eigenständig gelöst wurden */
  resolvedCriticalIssues: number;
  /** Aktionen bei denen eingegriffen wurde bevor Schaden entstand */
  earlyInterventions: number;
  /** Anzahl abgeschlossener Phasen gesamt */
  completedPhases: number;
  /** Anzahl abgeschlossener Runs */
  completedRuns: number;
  /** Tage mit Score ≥ 60 in Folge */
  stableScoreDays: number;
  /** Maximal erreichter Score */
  peakScore: number;
  /** Ernte vollständig dokumentiert */
  harvestDocumented: boolean;
  /** Kein Wasser-Gap > 3d in den letzten 14 Tagen */
  consistentWatering: boolean;
  /** Hat explizit Ursache mit Wirkung verknüpft (z.B. Mangel erkannt + dokumentiert) */
  causeEffectLearned: boolean;
};

// ── Identity berechnen ────────────────────────────────────────────────────────
//
// Level-Logik fragt: Was tut dieser Nutzer TATSÄCHLICH?
//
//   expert      → trifft bewusste Entscheidungen, Ergebnisse reproduzierbar
//                 Nachweis: completedRuns ≥ 2 + (causeEffectLearned ODER stableScoreDays ≥ 7)
//                           + (earlyInterventions ≥ 2 ODER resolvedCriticalIssues ≥ 2)
//
//   controlling → greift aktiv ein bevor Schaden entsteht
//                 Nachweis: (earlyInterventions ≥ 1 ODER resolvedCriticalIssues ≥ 1)
//                           + stabiler Rhythmus + completedPhases ≥ 1
//
//   progressing → dokumentiert regelmäßig, erkennt Muster
//                 Nachweis: consistentWatering ODER maxStreakEver ≥ 7
//                           ODER (streakDays ≥ 3 UND totalEntries ≥ 6)
//
//   beginner    → alles andere

export function computeIdentityLevel(ctx: IdentityContext): GrowIdentity {
  const signals: IdentitySignal[] = [];

  if (ctx.totalEntries >= 1) signals.push('first_entry');
  if (ctx.streakDays >= 3 || ctx.maxStreakEver >= 3) signals.push('streak_3');
  if (ctx.streakDays >= 7 || ctx.maxStreakEver >= 7) signals.push('streak_7');
  if (ctx.maxStreakEver >= 14) signals.push('streak_14');
  if (ctx.resolvedCriticalIssues >= 1) signals.push('problem_resolved');
  if (ctx.earlyInterventions >= 1) signals.push('early_intervention');
  if (ctx.completedPhases >= 1) signals.push('phase_completed');
  if (ctx.completedPhases >= 3) signals.push('multi_phase_completed');
  if (ctx.completedRuns >= 2) signals.push('second_run');
  if (ctx.consistentWatering) signals.push('consistent_watering');
  if (ctx.stableScoreDays >= 7) signals.push('score_stable');
  if (ctx.peakScore >= 80) signals.push('score_high');
  if (ctx.harvestDocumented) signals.push('harvest_documented');
  if (ctx.causeEffectLearned) signals.push('cause_effect_linked');

  let level: IdentityLevel = 'beginner';

  if (
    ctx.completedRuns >= 2 &&
    (ctx.causeEffectLearned || ctx.stableScoreDays >= 7) &&
    (ctx.earlyInterventions >= 2 || ctx.resolvedCriticalIssues >= 2)
  ) {
    level = 'expert';
  } else if (
    (ctx.earlyInterventions >= 1 || ctx.resolvedCriticalIssues >= 1) &&
    (ctx.consistentWatering || ctx.streakDays >= 7 || ctx.maxStreakEver >= 7) &&
    ctx.completedPhases >= 1
  ) {
    level = 'controlling';
  } else if (
    ctx.consistentWatering ||
    ctx.maxStreakEver >= 7 ||
    (ctx.streakDays >= 3 && ctx.totalEntries >= 6)
  ) {
    level = 'progressing';
  }

  return { level, signals };
}

// ── Ausgabe-Funktionen ────────────────────────────────────────────────────────

/** Gibt den statischen Identity-Text zurück. */
export function getIdentityCopy(identity: GrowIdentity): IdentityCopy {
  return IDENTITY_COPY[identity.level];
}

/**
 * Gibt den situativen Zustandstext zurück — Identity + Momentum kombiniert.
 * Das ist der Text, der in der UI primär sichtbar wird.
 */
export function getCombinedCopy(
  identity: GrowIdentity,
  momentum: GrowMomentum,
): string {
  return COMBINED_COPY[identity.level][momentum.state];
}

// ────────────────────────────────────────────────────────────────────────────
// Progression System
//
// Macht Entwicklung sichtbar — nicht als Punktestand, sondern als
// beobachtbare Veränderung im Verhalten über Zeit.
//
// Drei Dimensionen:
//   1. Identity-Level-Veränderung   → Level-Up Moment / Level-Down Warnung
//   2. Momentum-Veränderung         → stabilisiert / verbessert / fällt ab
//   3. Stagnation                   → kein Fortschritt trotz Aktivität
//
// Verwendung:
//   computeProgression(previous, current)  → ProgressionResult
//   resolveFullGrowState(iCtx, mCtx, dCtx) → vollständiger Zustand
// ────────────────────────────────────────────────────────────────────────────

export type ProgressionChange =
  | 'level_up'           // Identity-Level gestiegen
  | 'level_down'         // Identity-Level gefallen
  | 'momentum_improving' // Momentum verbessert (ohne Level-Änderung)
  | 'momentum_declining' // Momentum verschlechtert
  | 'stabilizing'        // Aus declining/critical in stable gewechselt
  | 'stagnating';        // Kein Fortschritt über Zeit

/** Snapshot des Zustands zu einem bestimmten Zeitpunkt */
export type ProgressionSnapshot = {
  identityLevel: IdentityLevel;
  momentumState: MomentumState;
  direction: MomentumDirection;
  /** ISO-Datum */
  recordedAt: string;
};

/** Level-Wechsel-Moment — einmalig, wird einmal gezeigt und dann als gesehen markiert */
export type LevelChangeMoment = {
  type: 'up' | 'down';
  from: IdentityLevel;
  to: IdentityLevel;
  /** Die Nachricht die dem Nutzer gezeigt wird */
  message: string;
};

export type ProgressionResult = {
  change: ProgressionChange | null;
  /** Der Text der dem Nutzer gezeigt wird */
  copy: string;
  /** Gesetzt wenn ein Level-Wechsel stattgefunden hat */
  levelMoment?: LevelChangeMoment;
};

// ── Level-Change-Texte ────────────────────────────────────────────────────────
//
// Level-Up: klar, einmalig, nicht übertrieben
// Level-Down: keine Bestrafung — klares Signal, was zu tun ist

const LEVEL_UP_MESSAGES: Record<IdentityLevel, string> = {
  beginner:    '', // Kann nicht zum beginner aufsteigen
  progressing: 'Du hast einen Rhythmus — und der macht den Unterschied.',
  controlling: 'Du hast jetzt Kontrolle über deinen Grow.',
  expert:      'Du arbeitest jetzt wie ein erfahrener Grower.',
};

const LEVEL_DOWN_MESSAGES: Record<IdentityLevel, string> = {
  expert:      '', // Kann nicht zu expert absteigen
  controlling: 'Du verlierst gerade die Kontrolle. Was ist in den letzten Tagen passiert?',
  progressing: 'Dein Rhythmus bricht gerade ab. Drei Einträge hintereinander wenden das.',
  beginner:    'Kein Fortschritt verloren — aber Konsequenz ist jetzt wichtiger als Qualität.',
};

// ── Momentum-Veränderungs-Texte ───────────────────────────────────────────────

const PROGRESSION_COPY: Record<ProgressionChange, string> = {
  level_up:           '', // → über levelMoment
  level_down:         '', // → über levelMoment
  momentum_improving: 'Du wirst konsistenter.',
  momentum_declining: 'Du verlierst gerade an Stabilität.',
  stabilizing:        'Du stabilisierst deinen Grow.',
  stagnating:         'Dein Grow stagniert — ein neuer Impuls hilft jetzt mehr als Geduld.',
};

// ── Progression berechnen ─────────────────────────────────────────────────────

const LEVEL_ORDER: IdentityLevel[] = ['beginner', 'progressing', 'controlling', 'expert'];
const MOMENTUM_ORDER: MomentumState[] = ['critical', 'declining', 'stable', 'improving'];

/**
 * Vergleicht zwei Snapshots und gibt zurück was sich verändert hat.
 * Priorität: Level-Änderung > Momentum-Änderung > Stagnation.
 */
export function computeProgression(
  previous: ProgressionSnapshot,
  current: ProgressionSnapshot,
): ProgressionResult {
  const prevLevelIdx = LEVEL_ORDER.indexOf(previous.identityLevel);
  const currLevelIdx = LEVEL_ORDER.indexOf(current.identityLevel);

  // 1. Identity-Level gestiegen
  if (currLevelIdx > prevLevelIdx) {
    const moment: LevelChangeMoment = {
      type: 'up',
      from: previous.identityLevel,
      to: current.identityLevel,
      message: LEVEL_UP_MESSAGES[current.identityLevel],
    };
    return { change: 'level_up', copy: moment.message, levelMoment: moment };
  }

  // 2. Identity-Level gefallen
  if (currLevelIdx < prevLevelIdx) {
    const moment: LevelChangeMoment = {
      type: 'down',
      from: previous.identityLevel,
      to: current.identityLevel,
      message: LEVEL_DOWN_MESSAGES[current.identityLevel],
    };
    return { change: 'level_down', copy: moment.message, levelMoment: moment };
  }

  // 3. Gleiche Ebene — Momentum verändert?
  const prevMIdx = MOMENTUM_ORDER.indexOf(previous.momentumState);
  const currMIdx = MOMENTUM_ORDER.indexOf(current.momentumState);

  if (currMIdx > prevMIdx) {
    const change: ProgressionChange =
      current.momentumState === 'stable' ? 'stabilizing' : 'momentum_improving';
    return { change, copy: PROGRESSION_COPY[change] };
  }

  if (currMIdx < prevMIdx) {
    return {
      change: 'momentum_declining',
      copy: PROGRESSION_COPY['momentum_declining'],
    };
  }

  // 4. Keine Veränderung im Momentum — Stagnation?
  if (current.direction === 'flat' && previous.direction === 'flat') {
    return { change: 'stagnating', copy: PROGRESSION_COPY['stagnating'] };
  }

  return { change: null, copy: '' };
}

// ── Vollständiger Grow-Zustand ────────────────────────────────────────────────

/**
 * Berechnet den vollständigen Zustand in einem einzigen Aufruf:
 * Identity + Momentum + Direction + Combined Copy.
 *
 * Das ist der Haupt-Einstiegspunkt für die UI.
 */
export function resolveFullGrowState(
  iCtx: IdentityContext,
  mCtx: MomentumContext,
  dCtx: DirectionContext,
): {
  identity: GrowIdentity;
  momentum: GrowMomentum;
  direction: MomentumDirection;
  /** Statischer Identity-Text (wer du bist) */
  identityCopy: IdentityCopy;
  /** Situativer Zustandstext (Identity × Momentum) */
  combinedCopy: string;
} {
  const identity = computeIdentityLevel(iCtx);
  const { momentum, direction } = resolveGrowDirection(mCtx, dCtx);
  const identityCopy = IDENTITY_COPY[identity.level];
  const combinedCopy = getCombinedCopy(identity, momentum);
  return { identity, momentum, direction, identityCopy, combinedCopy };
}

// ────────────────────────────────────────────────────────────────────────────
// Narrative System
//
// Bringt alle Systeme in einen einzigen, lesbaren Output.
//
// Priorität (absteigend):
//   1. Level-Up/Down Moment   → einmalig, überschreibt alles andere
//   2. Critical-State         → Krisenmodus / Coaching
//   3. Normal                 → Identity × Direction (12 Hauptzustände)
//
// Output:
//   headline     — max 10 Wörter — was gerade passiert
//   subline      — max 18 Wörter — warum das so ist / was das bedeutet
//   action       — optionaler CTA — was jetzt zu tun ist
//   changeMessage— nur bei Level-Wechsel oder kritischer Veränderung
//   nextCheck    — "In 24h siehst du, ob dein Eingriff wirkt."
//
// Verwendung:
//   getGrowNarrative(ctx)  → GrowNarrative
// ────────────────────────────────────────────────────────────────────────────

export type GrowNarrativeInput = {
  iCtx: IdentityContext;
  mCtx: MomentumContext;
  dCtx: DirectionContext;
  /** Wenn vorhanden: Progression zwischen letztem und aktuellem Snapshot */
  previousSnapshot?: ProgressionSnapshot;
};

export type GrowNarrative = {
  /** Max 10 Wörter — was gerade passiert */
  headline: string;
  /** Max 18 Wörter — warum / was das bedeutet */
  subline: string;
  /** Optionaler CTA */
  action?: string;
  /** Nur bei Veränderung (Level-Wechsel, kritischer Einbruch) */
  changeMessage?: string;
  /** Wann der nächste Check sinnvoll ist */
  nextCheck?: string;
};

// ── 12 Hauptzustände: Identity × Direction ───────────────────────────────────
//
// Jede Kombination ist einzigartig — kein Text wiederholt sich.
// Direction = was sich gerade verändert (up / flat / down)
// Identity  = wer du als Grower bist

type NarrativeKey = `${IdentityLevel}:${MomentumDirection}`;

type NarrativeEntry = {
  headline: string;
  subline: string;
  action?: string;
  nextCheck?: string;
};

const NARRATIVE_MAP: Record<NarrativeKey, NarrativeEntry> = {

  // ── Beginner ────────────────────────────────────────────────────────────────

  'beginner:up': {
    headline: 'Dein Grow läuft besser als gestern.',
    subline: 'Du dokumentierst — und das zeigt bereits Wirkung.',
    action: 'Trag heute ein, was du anders gemacht hast.',
    nextCheck: 'In 2–3 Tagen siehst du, ob der Trend hält.',
  },

  'beginner:flat': {
    headline: 'Dein Grow ist stabil — noch kein klarer Trend.',
    subline: 'Das ist kein Problem. Konsistenz kommt vor Fortschritt.',
    action: 'Dokumentiere die nächsten drei Tage durch.',
    nextCheck: 'Nach drei Einträgen zeigt sich, wohin es geht.',
  },

  'beginner:down': {
    headline: 'Dein Grow verliert Boden.',
    subline: 'Noch kein Rhythmus — und das fällt jetzt auf. Ein Eintrag reicht, um zu starten.',
    action: 'Trag ein, was du heute siehst — ohne alles erklären zu müssen.',
    nextCheck: 'In 24h weißt du, ob sich das stabilisiert.',
  },

  // ── Progressing ─────────────────────────────────────────────────────────────

  'progressing:up': {
    headline: 'Du wirst konsistenter.',
    subline: 'Dein Rhythmus zeigt Wirkung — die Pflanze reagiert stabiler.',
    action: 'Halte fest, was du diese Woche anders machst.',
    nextCheck: 'In 3 Tagen siehst du, ob der Score weiter steigt.',
  },

  'progressing:flat': {
    headline: 'Dein Grow läuft stabil.',
    subline: 'Du hältst den Rhythmus. Das ist mehr als Zufall.',
    action: 'Wenn etwas auffällt — jetzt dokumentieren, nicht warten.',
    nextCheck: 'Nach 5 Tagen wird klar, ob das eine Plateau-Phase ist.',
  },

  'progressing:down': {
    headline: 'Dein Grow verliert Stabilität.',
    subline: 'Du erkennst bereits Muster — jetzt siehst du eines, das du stoppen kannst.',
    action: 'Was hat sich in den letzten 3 Tagen verändert?',
    nextCheck: 'In 24h siehst du, ob dein Eingriff wirkt.',
  },

  // ── Controlling ─────────────────────────────────────────────────────────────

  'controlling:up': {
    headline: 'Du verbesserst einen Grow, den du kontrollierst.',
    subline: 'Kein Zufall — du hast eingegriffen, und es zeigt Wirkung.',
    action: 'Dokumentiere, was den Unterschied gemacht hat.',
    nextCheck: 'In 3 Tagen bestätigt sich, ob das reproduzierbar ist.',
  },

  'controlling:flat': {
    headline: 'Stabil und kontrolliert.',
    subline: 'Du hältst was du aufgebaut hast. Das ist die Grundlage für Wiederholbarkeit.',
    nextCheck: 'Beim nächsten Eingriff siehst du, wie gut du dein Fenster kennst.',
  },

  'controlling:down': {
    headline: 'Du verlierst gerade Kontrolle.',
    subline: 'Du hast die Werkzeuge — jetzt ist der Moment, sie zu nutzen.',
    action: 'Was hat das ausgelöst? Trag es ein, bevor du eingreifst.',
    nextCheck: 'In 24h siehst du, ob dein Eingriff wirkt.',
  },

  // ── Expert ──────────────────────────────────────────────────────────────────

  'expert:up': {
    headline: 'Du verbesserst was du bereits verstehst.',
    subline: 'Dein System funktioniert — und du optimierst es bewusst.',
    action: 'Halte den Grund für den Anstieg fest. Das ist dein nächster Wissensblock.',
    nextCheck: 'In 5 Tagen weißt du, ob das auf den nächsten Run übertragbar ist.',
  },

  'expert:flat': {
    headline: 'Reproduzierbare Stabilität.',
    subline: 'Das ist kein Glück mehr — das ist Methode.',
    nextCheck: 'Beim nächsten Run bestätigt sich, ob diese Phase replizierbar ist.',
  },

  'expert:down': {
    headline: 'Auch mit Erfahrung gibt es Rückschritte.',
    subline: 'Du erkennst es früh — das ist der Unterschied zu allen anderen.',
    action: 'Geh die letzten 5 Einträge durch. Was hat sich verändert?',
    nextCheck: 'In 24–48h siehst du, ob die Gegenmassnahme greift.',
  },
};

// ── Kritische Zustände (höchste Priorität nach Level-Wechsel) ─────────────────

type CriticalEntry = NarrativeEntry & { changeMessage: string };

const CRITICAL_NARRATIVES: Record<IdentityLevel, CriticalEntry> = {

  beginner: {
    headline: 'Dein Grow ist in einer kritischen Phase.',
    subline: 'Du bist noch am Anfang — aber das kannst du jetzt noch retten.',
    action: 'Trag ein, was du heute siehst. Das ist der erste Schritt.',
    changeMessage: 'Kritische Lage. Ein Eintrag jetzt ist mehr wert als zehn in drei Tagen.',
    nextCheck: 'In 24h siehst du, ob der Eingriff Wirkung zeigt.',
  },

  progressing: {
    headline: 'Kritische Phase — jetzt Eingreifen.',
    subline: 'Du erkennst Muster — dieser hier braucht sofort Aufmerksamkeit.',
    action: 'Was fehlt: Wasser, Licht, Nährstoffe? Trag es ein und handle.',
    changeMessage: 'Kritische Lage. Jetzt eingreifen ist wichtiger als dokumentieren.',
    nextCheck: 'In 24h siehst du die Wirkung.',
  },

  controlling: {
    headline: 'Kritische Lage — du hast alle Mittel dagegen.',
    subline: 'Du hast bereits Probleme gelöst. Was hat das hier ausgelöst?',
    action: 'Identifiziere die Ursache. Du kennst das Muster.',
    changeMessage: 'Kritische Phase. Aber du hast das Werkzeug — nutze es jetzt.',
    nextCheck: 'In 24h siehst du, ob dein Eingriff wirkt.',
  },

  expert: {
    headline: 'Kritische Phase trotz Erfahrung — das hat einen Grund.',
    subline: 'Geh zurück zu den letzten Einträgen. Die Antwort liegt bereits dort.',
    action: 'Ursache vor Lösung. Was hat sich in den letzten 5 Tagen verändert?',
    changeMessage: 'Kritische Lage. Deine Erfahrung ist jetzt dein größter Vorteil.',
    nextCheck: 'In 24–48h zeigt sich, ob die Ursache gefunden wurde.',
  },
};

// ── Level-Wechsel-Narratives ──────────────────────────────────────────────────

const LEVEL_UP_NARRATIVES: Record<IdentityLevel, Omit<GrowNarrative, 'nextCheck'>> = {
  beginner: {
    // Kein Aufstieg nach beginner möglich
    headline: '',
    subline: '',
  },
  progressing: {
    headline: 'Du hast einen Rhythmus entwickelt.',
    subline: 'Drei Tage hintereinander sind mehr als eine Zahl — das ist Gewohnheit.',
    changeMessage: 'Du dokumentierst regelmäßig. Das ist der Unterschied, der alles andere möglich macht.',
  },
  controlling: {
    headline: 'Du hast Kontrolle über deinen Grow.',
    subline: 'Du hast eingegriffen bevor Schaden entstanden ist — das ist Kontrolle.',
    changeMessage: 'Du erkennst Probleme früh und löst sie. Das ist kein Glück mehr.',
  },
  expert: {
    headline: 'Du arbeitest jetzt wie ein erfahrener Grower.',
    subline: 'Deine Ergebnisse sind reproduzierbar — du verstehst was sie verursacht.',
    changeMessage: 'Zwei Runs, klare Ursache-Wirkung-Zusammenhänge. Du hast ein System.',
  },
};

const LEVEL_DOWN_NARRATIVES: Record<IdentityLevel, Omit<GrowNarrative, 'nextCheck'>> = {
  expert: {
    // Kein Abstieg zu expert möglich
    headline: '',
    subline: '',
  },
  controlling: {
    headline: 'Du verlierst gerade Kontrolle.',
    subline: 'Das passiert — aber du erkennst es. Das ist bereits der erste Schritt zurück.',
    changeMessage: 'Level zurückgefallen. Was hat den Rhythmus unterbrochen?',
    action: 'Trag heute ein, was passiert ist.',
  },
  progressing: {
    headline: 'Dein Rhythmus bricht gerade ab.',
    subline: 'Keine Strafe — aber drei Einträge hintereinander wenden das.',
    changeMessage: 'Level zurückgefallen. Konsequenz jetzt ist wichtiger als Qualität.',
    action: 'Einfach eintragen — ohne alles erklären zu müssen.',
  },
  beginner: {
    headline: 'Kein Fortschritt verloren — nur Konsistenz.',
    subline: 'Du weißt wie du angefangen hast. Das macht den Neustart einfacher.',
    changeMessage: 'Level zurückgefallen. Aber du hast das Wissen — nicht die Gewohnheit.',
    action: 'Ein Eintrag heute ist genug.',
  },
};

// ── Haupt-Funktion ────────────────────────────────────────────────────────────

/**
 * Zentraler Einstiegspunkt für die UI-Narrative.
 *
 * Gibt genau einen Output zurück — kontextabhängig, nicht wiederholend.
 *
 * Priorität:
 *   1. Level-Up/Down Moment (einmalig)
 *   2. Critical-State (Krisenmodus / Coaching)
 *   3. Normal: Identity × Direction (12 Hauptzustände)
 */
export function getGrowNarrative(ctx: GrowNarrativeInput): GrowNarrative {
  const identity = computeIdentityLevel(ctx.iCtx);
  const { momentum, direction } = resolveGrowDirection(ctx.mCtx, ctx.dCtx);

  // ── 1. Level-Wechsel hat höchste Priorität ─────────────────────────────────
  if (ctx.previousSnapshot) {
    const currentSnapshot: ProgressionSnapshot = {
      identityLevel: identity.level,
      momentumState: momentum.state,
      direction,
      recordedAt: new Date().toISOString(),
    };
    const progression = computeProgression(ctx.previousSnapshot, currentSnapshot);

    if (progression.change === 'level_up' && progression.levelMoment) {
      const base = LEVEL_UP_NARRATIVES[progression.levelMoment.to];
      return {
        ...base,
        nextCheck: 'Dein nächster Eintrag zeigt, ob das der neue Normalzustand ist.',
      };
    }

    if (progression.change === 'level_down' && progression.levelMoment) {
      const base = LEVEL_DOWN_NARRATIVES[progression.levelMoment.to];
      return {
        ...base,
        nextCheck: 'In 3 Tagen siehst du, ob sich der Trend umkehrt.',
      };
    }
  }

  // ── 2. Critical-State ──────────────────────────────────────────────────────
  if (momentum.state === 'critical') {
    const entry = CRITICAL_NARRATIVES[identity.level];
    return {
      headline: entry.headline,
      subline: entry.subline,
      ...(entry.action !== undefined && { action: entry.action }),
      changeMessage: entry.changeMessage,
      ...(entry.nextCheck !== undefined && { nextCheck: entry.nextCheck }),
    };
  }

  // ── 3. Normal: Identity × Direction ──────────────────────────────────────
  const key: NarrativeKey = `${identity.level}:${direction}`;
  const entry = NARRATIVE_MAP[key];
  return {
    headline: entry.headline,
    subline: entry.subline,
    ...(entry.action !== undefined && { action: entry.action }),
    ...(entry.nextCheck !== undefined && { nextCheck: entry.nextCheck }),
  };
}

/*
 * ── Beispiel-Outputs für alle 12 Hauptzustände ─────────────────────────────
 *
 * beginner:up
 *   headline: "Dein Grow läuft besser als gestern."
 *   subline:  "Du dokumentierst — und das zeigt bereits Wirkung."
 *   action:   "Trag heute ein, was du anders gemacht hast."
 *
 * beginner:flat
 *   headline: "Dein Grow ist stabil — noch kein klarer Trend."
 *   subline:  "Das ist kein Problem. Konsistenz kommt vor Fortschritt."
 *   action:   "Dokumentiere die nächsten drei Tage durch."
 *
 * beginner:down
 *   headline: "Dein Grow verliert Boden."
 *   subline:  "Noch kein Rhythmus — und das fällt jetzt auf."
 *   action:   "Trag ein, was du heute siehst."
 *
 * progressing:up
 *   headline: "Du wirst konsistenter."
 *   subline:  "Dein Rhythmus zeigt Wirkung — die Pflanze reagiert stabiler."
 *
 * progressing:flat
 *   headline: "Dein Grow läuft stabil."
 *   subline:  "Du hältst den Rhythmus. Das ist mehr als Zufall."
 *
 * progressing:down
 *   headline: "Dein Grow verliert Stabilität."
 *   subline:  "Du erkennst bereits Muster — jetzt siehst du eines, das du stoppen kannst."
 *   action:   "Was hat sich in den letzten 3 Tagen verändert?"
 *   nextCheck:"In 24h siehst du, ob dein Eingriff wirkt."
 *
 * controlling:up
 *   headline: "Du verbesserst einen Grow, den du kontrollierst."
 *   subline:  "Kein Zufall — du hast eingegriffen, und es zeigt Wirkung."
 *
 * controlling:flat
 *   headline: "Stabil und kontrolliert."
 *   subline:  "Du hältst was du aufgebaut hast."
 *
 * controlling:down
 *   headline: "Du verlierst gerade Kontrolle."
 *   subline:  "Du hast die Werkzeuge — jetzt ist der Moment, sie zu nutzen."
 *   action:   "Was hat das ausgelöst?"
 *   nextCheck:"In 24h siehst du, ob dein Eingriff wirkt."
 *
 * expert:up
 *   headline: "Du verbesserst was du bereits verstehst."
 *   subline:  "Dein System funktioniert — und du optimierst es bewusst."
 *
 * expert:flat
 *   headline: "Reproduzierbare Stabilität."
 *   subline:  "Das ist kein Glück mehr — das ist Methode."
 *
 * expert:down
 *   headline: "Auch mit Erfahrung gibt es Rückschritte."
 *   subline:  "Du erkennst es früh — das ist der Unterschied zu allen anderen."
 *   action:   "Geh die letzten 5 Einträge durch."
 *   nextCheck:"In 24–48h siehst du, ob die Gegenmassnahme greift."
 */

// ────────────────────────────────────────────────────────────────────────────
// Narrative Display System
//
// Regelt: Wann, wo und wie oft eine Narrative angezeigt wird.
//
// Placements:
//   daily_card   → Tägliche Hauptkarte (Dashboard) — einmal täglich
//   header       → Kleiner Kontext-Header im Grow-Bereich
//   banner       → Vollbreites Banner für Veränderungen + Critical
//   log_screen   → Eingebettet im Log-Flow nach einem Eintrag
//   after_action → Direkt nach einer Nutzer-Aktion
//   moment       → Fullscreen (Level-Wechsel, Critical resolved)
//
// Prioritäten (absteigend):
//   moment   → Level-Up / Level-Down
//   critical → momentum.state === 'critical'
//   change   → Progression-Veränderung erkannt
//   normal   → Regulärer Zustand
//
// Cooldown:
//   once             → einmalig (Level-Up/Down)
//   once_per_day     → max 1× pro Tag
//   once_per_session → max 1× bis App-Neuladen
// ────────────────────────────────────────────────────────────────────────────

export type NarrativePlacement =
  | 'daily_card'
  | 'header'
  | 'banner'
  | 'log_screen'
  | 'after_action'
  | 'moment';

export type NarrativePriority =
  | 'moment'
  | 'critical'
  | 'change'
  | 'normal';

export type NarrativeFrequency =
  | 'once'
  | 'once_per_day'
  | 'once_per_session';

export type NarrativeAction = {
  label: string;
  /** Intent wird vom UI-Consumer umgesetzt */
  intent: string;
};

export type NarrativeDisplay = {
  placement: NarrativePlacement;
  priority: NarrativePriority;
  frequency: NarrativeFrequency;
  dismissible: boolean;
  primaryAction?: NarrativeAction;
  secondaryAction?: NarrativeAction;
};

// ── Placement-Regeln ──────────────────────────────────────────────────────────

type PlacementRule = {
  placement: NarrativePlacement;
  priority: NarrativePriority;
  frequency: NarrativeFrequency;
  dismissible: boolean;
  condition: (narrative: GrowNarrative, change: ProgressionChange | null) => boolean;
};

const PLACEMENT_RULES: PlacementRule[] = [
  // Level-Up / Level-Down → einmaliger Fullscreen-Moment
  {
    placement: 'moment',
    priority: 'moment',
    frequency: 'once',
    dismissible: false,
    condition: (_n, change) => change === 'level_up' || change === 'level_down',
  },
  // Critical → Banner (dominant, 1× pro 24h)
  {
    placement: 'banner',
    priority: 'critical',
    frequency: 'once_per_day',
    dismissible: false,
    condition: (_n, change) => change !== 'level_up' && change !== 'level_down',
    // wird nur nach Prioritätsprüfung im critical-State erreicht
  },
  // Declining / Stagnating → Banner nach Aktion
  {
    placement: 'after_action',
    priority: 'change',
    frequency: 'once_per_session',
    dismissible: true,
    condition: (_n, change) =>
      change === 'stabilizing' ||
      change === 'momentum_declining' ||
      change === 'stagnating',
  },
  // Improving → Log Screen
  {
    placement: 'log_screen',
    priority: 'change',
    frequency: 'once_per_session',
    dismissible: true,
    condition: (_n, change) => change === 'momentum_improving',
  },
  // Normal → Daily Card
  {
    placement: 'daily_card',
    priority: 'normal',
    frequency: 'once_per_day',
    dismissible: true,
    condition: (_n, change) => change === null,
  },
  // Normal → Log Screen Fallback
  {
    placement: 'log_screen',
    priority: 'normal',
    frequency: 'once_per_session',
    dismissible: true,
    condition: () => true,
  },
];

// ── Action-Bindung ─────────────────────────────────────────────────────────────

type ActionBinding = {
  condition: (n: GrowNarrative, change: ProgressionChange | null) => boolean;
  primaryAction: NarrativeAction;
  secondaryAction?: NarrativeAction;
};

const ACTION_BINDINGS: ActionBinding[] = [
  {
    condition: (_n, change) => change === 'level_up',
    primaryAction: { label: 'Weiter dokumentieren', intent: 'open_log' },
    secondaryAction: { label: 'Was hat sich geändert?', intent: 'open_progress' },
  },
  {
    condition: (_n, change) => change === 'level_down',
    primaryAction: { label: 'Jetzt eintragen', intent: 'open_log' },
    secondaryAction: { label: 'Was ist passiert?', intent: 'open_history' },
  },
  {
    condition: (_n, change) => change === null && _n.headline.toLowerCase().includes('kritisch'),
    primaryAction: { label: 'Jetzt eingreifen', intent: 'open_log_urgent' },
    secondaryAction: { label: 'Was fehlt?', intent: 'open_checklist' },
  },
  {
    condition: (_n, change) => change === 'momentum_declining',
    primaryAction: { label: 'Eintragen was sich verändert hat', intent: 'open_log' },
  },
  {
    condition: (_n, change) => change === 'stagnating',
    primaryAction: { label: 'Neue Impulse holen', intent: 'open_wiki' },
    secondaryAction: { label: 'Eintragen', intent: 'open_log' },
  },
  {
    condition: (_n, change) =>
      change === 'momentum_improving' || change === 'stabilizing',
    primaryAction: { label: 'Was wirkt — festhalten', intent: 'open_log' },
  },
  // Fallback
  {
    condition: () => true,
    primaryAction: { label: 'Eintragen', intent: 'open_log' },
  },
];

// ── Cooldown ──────────────────────────────────────────────────────────────────

export type NarrativeCooldownRecord = {
  /** Narrative-Key z.B. "moment:level_up:controlling" */
  key: string;
  /** ISO-Zeitstempel der letzten Anzeige */
  lastShownAt: string;
  /** True wenn als einmaliges Event gesehen markiert */
  seenOnce: boolean;
};

/**
 * Gibt true zurück wenn die Narrative angezeigt werden darf.
 *
 * - once             → false sobald seenOnce = true
 * - once_per_day     → false wenn lastShownAt am selben Kalendertag
 * - once_per_session → false wenn lastShownAt gleiche Session (sessionId als Schlüssel)
 */
export function isCooldownClear(
  record: NarrativeCooldownRecord | undefined,
  frequency: NarrativeFrequency,
  sessionId: string,
): boolean {
  if (!record) return true;
  if (frequency === 'once') return !record.seenOnce;
  if (frequency === 'once_per_day') {
    const today = new Date().toISOString().slice(0, 10);
    return record.lastShownAt.slice(0, 10) !== today;
  }
  if (frequency === 'once_per_session') {
    // sessionId wird als suffix im key gespeichert
    return !record.key.endsWith(`__${sessionId}`);
  }
  return true;
}

/**
 * Erstellt einen neuen Cooldown-Eintrag direkt nach der Anzeige.
 */
export function recordNarrativeShown(
  key: string,
  frequency: NarrativeFrequency,
  sessionId: string,
): NarrativeCooldownRecord {
  const storedKey = frequency === 'once_per_session' ? `${key}__${sessionId}` : key;
  return {
    key: storedKey,
    lastShownAt: new Date().toISOString(),
    seenOnce: frequency === 'once',
  };
}

// ── Haupt-Auflöser ────────────────────────────────────────────────────────────

export type ResolvedNarrativeDisplay = {
  narrative: GrowNarrative;
  display: NarrativeDisplay;
  cooldownKey: string;
};

/**
 * Zentraler Einstiegspunkt für die UI.
 *
 * Gibt null zurück wenn kein Placement aktiv ist (alle Cooldowns greifen).
 *
 * Prioritätskaskade:
 *   1. moment   (Level-Up/Down — once)
 *   2. critical (Critical-State — once_per_day)
 *   3. change   (Progression-Veränderung — once_per_session)
 *   4. normal   (Regulärer Zustand — once_per_day / once_per_session)
 */
export function resolveNarrativeDisplay(
  ctx: GrowNarrativeInput,
  cooldowns: NarrativeCooldownRecord[],
  sessionId: string,
): ResolvedNarrativeDisplay | null {
  const narrative = getGrowNarrative(ctx);

  // Progression ableiten
  let change: ProgressionChange | null = null;
  if (ctx.previousSnapshot) {
    const identity = computeIdentityLevel(ctx.iCtx);
    const { momentum, direction } = resolveGrowDirection(ctx.mCtx, ctx.dCtx);
    const current: ProgressionSnapshot = {
      identityLevel: identity.level,
      momentumState: momentum.state,
      direction,
      recordedAt: new Date().toISOString(),
    };
    change = computeProgression(ctx.previousSnapshot, current).change;
  }

  // Critical nur über eigenen Pfad (nicht über change-Logik)
  const { momentum: currentMomentum } = resolveGrowDirection(ctx.mCtx, ctx.dCtx);
  const isCritical = currentMomentum.state === 'critical' &&
    change !== 'level_up' && change !== 'level_down';

  // Passende Placement-Regel finden
  const priorityOrder: NarrativePriority[] = ['moment', 'critical', 'change', 'normal'];

  for (const targetPriority of priorityOrder) {
    // Critical-Shortcut
    if (targetPriority === 'critical' && !isCritical) continue;

    const rule = PLACEMENT_RULES.find(
      (r) => r.priority === targetPriority && r.condition(narrative, change),
    );
    if (!rule) continue;

    const cooldownKey = `${targetPriority}:${narrative.headline.slice(0, 24).replace(/\s/g, '_')}`;
    const cooldownRecord = cooldowns.find((c) =>
      c.key === cooldownKey || c.key.startsWith(`${cooldownKey}__`),
    );

    if (!isCooldownClear(cooldownRecord, rule.frequency, sessionId)) continue;

    // Action binden
    const binding = ACTION_BINDINGS.find((b) => b.condition(narrative, change));
    const primaryAction = binding?.primaryAction ?? { label: 'Eintragen', intent: 'open_log' };
    const secondaryAction = binding?.secondaryAction;

    return {
      narrative,
      cooldownKey,
      display: {
        placement: rule.placement,
        priority: rule.priority,
        frequency: rule.frequency,
        dismissible: rule.dismissible,
        primaryAction,
        ...(secondaryAction !== undefined && { secondaryAction }),
      },
    };
  }

  return null;
}




