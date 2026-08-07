// ────────────────────────────────────────────────────────────────────────────
// Grow OS — Phase Definitions & Task Templates
//
// Pure data & logic layer — no side effects, no storage calls.
// Source of truth for grow phase structure, durations, and task templates.
// ────────────────────────────────────────────────────────────────────────────

import type {
  GrowPhaseId,
  GrowTask,
  GrowMedium,
  Erfahrung,
  GrowUmgebung,
  TaskCategory,
} from "./types";
import { Egg, Sprout, Leaf, Flower2, Gem, Scissors, type LucideIcon } from "lucide-react";

// ── Phase Metadata ────────────────────────────────────────────────────────────

export const PHASE_LABELS: Record<GrowPhaseId, string> = {
  keimung: "Keimung",
  saemling: "Sämling",
  veg: "Vegetationsphase",
  bluete: "Blüte",
  spaetbluete: "Spätblüte",
  ernte: "Ernte",
};

export const PHASE_DESCRIPTIONS: Record<GrowPhaseId, string> = {
  keimung: "Die Samen keimen aus und entwickeln erste Wurzeln.",
  saemling: "Die Pflanze entwickelt ihre ersten echten Blätter.",
  veg: "Starkes vegetatives Wachstum — Struktur und Volumen aufbauen.",
  bluete: "Blütenbildung — Nährstoffbedarf und Lichtzyklus ändern sich.",
  spaetbluete: "Reifung der Blüten — Nährstoffzufuhr reduzieren und ausspülen.",
  ernte: "Ernte, Trocknung und Curing.",
};

export const PHASE_ICONS: Record<GrowPhaseId, LucideIcon> = {
  keimung: Egg,
  saemling: Sprout,
  veg: Leaf,
  bluete: Flower2,
  spaetbluete: Gem,
  ernte: Scissors,
};

/** Ordered list of all phases from start to harvest. */
export const PHASE_ORDER: GrowPhaseId[] = [
  "keimung",
  "saemling",
  "veg",
  "bluete",
  "spaetbluete",
  "ernte",
];

// ── Phase Duration Configuration ──────────────────────────────────────────────

export type PhaseDurations = Record<GrowPhaseId, number>;

/**
 * Returns the duration (in days) for each phase based on the grow's setup.
 *
 * Rules:
 * - Outdoor: vegetative phase is season-driven (~8 weeks)
 * - Hydro: vegetative phase is faster (~3 weeks)
 * - Profi: longer bloom for heavier maturation (9 weeks vs. standard 7)
 * - Ernte: always 1 day (a marker, not a duration)
 */
export function getPhaseDurations(
  umgebung: GrowUmgebung,
  medium: GrowMedium,
  erfahrung: Erfahrung
): PhaseDurations {
  const isOutdoor = umgebung === "outdoor";
  const isHydro = medium === "hydro";
  const isProfi = erfahrung === "profi";

  return {
    keimung: 7,
    saemling: 14,
    veg: isOutdoor ? 56 : isHydro ? 21 : 28,
    bluete: isProfi ? 63 : 49,
    spaetbluete: 14,
    ernte: 1,
  };
}

// ── Task Factory Helper ────────────────────────────────────────────────────────

/** Shorthand constructor for GrowTask objects. */
function t(
  id: string,
  phaseId: GrowPhaseId,
  title: string,
  description: string,
  dueDay: number,
  category: TaskCategory
): GrowTask {
  return { id, phaseId, title, description, dueDay, completed: false, category };
}

// ── Task Templates per Phase ──────────────────────────────────────────────────

/**
 * Generates the task list for a given phase.
 * All `dueDay` values are absolute grow days (relative to grow start).
 *
 * @param phaseId   The phase to generate tasks for.
 * @param startDay  The absolute day the phase begins (1-indexed).
 * @param erfahrung Grower experience level — controls optional advanced tasks.
 */
export function buildPhaseTasks(
  phaseId: GrowPhaseId,
  startDay: number,
  erfahrung: Erfahrung
): GrowTask[] {
  /** Shorthand: absolute day = startDay + offset */
  const d = (offset: number) => startDay + offset;

  switch (phaseId) {
    case "keimung":
      return [
        t(
          `keim-soak-${startDay}`,
          "keimung",
          "Samen einweichen (12–24 h)",
          "In 30 °C warmem Wasser einlegen. Wenn der Samen aufplatzt oder sinkt — bereit zum Keimen.",
          d(0),
          "allgemein"
        ),
        t(
          `keim-paper-${startDay}`,
          "keimung",
          "Papiertuch-Methode",
          "Feuchtes Küchenpapier, 24–28 °C, dunkel und warm halten. Täglich auf Wurzelbildung prüfen.",
          d(1),
          "allgemein"
        ),
        t(
          `keim-plant-${startDay}`,
          "keimung",
          "Keimling einpflanzen",
          "Sobald die Wurzel 1–2 cm lang ist, vorsichtig mit einer Pinzette einsetzen. Wurzelspitze nach unten.",
          d(3),
          "allgemein"
        ),
      ];

    case "saemling":
      return [
        t(
          `sae-light-${startDay}`,
          "saemling",
          "Licht auf 18/6 einstellen",
          "18 h Licht, 6 h Dunkel. Schwache Intensität für zarte Sämlinge (200–400 µmol/m²/s).",
          d(0),
          "kontrolle"
        ),
        t(
          `sae-humidity-${startDay}`,
          "saemling",
          "Luftfeuchtigkeit prüfen",
          "Optimal: 60–70 % RH. Feuchtigkeitsglocke für die ersten Tage nutzen.",
          d(1),
          "kontrolle"
        ),
        t(
          `sae-water-${startDay}`,
          "saemling",
          "Erstes Gießen",
          "Nur rund um den Stamm gießen (nicht von oben besprühen). Wurzeln folgen der Feuchtigkeit.",
          d(2),
          "bewaesserung"
        ),
        t(
          `sae-dome-${startDay}`,
          "saemling",
          "Feuchtigkeitsglocke entfernen",
          "Nach den ersten echten Blättern — Pflanze braucht Luftzirkulation um Stängel zu stärken.",
          d(7),
          "kontrolle"
        ),
      ];

    case "veg": {
      const tasks: GrowTask[] = [
        t(
          `veg-check-${startDay}`,
          "veg",
          "pH und EC prüfen",
          "pH 6.0–6.5 (Erde) oder 5.8–6.2 (Coco/Hydro). EC als Einsteiger bei 0.8–1.2 starten.",
          d(0),
          "kontrolle"
        ),
        t(
          `veg-water-${startDay}`,
          "veg",
          "Bewässerung",
          "Finger-Test: erst gießen wenn die oberen 2–3 cm Substrat trocken sind.",
          d(2),
          "bewaesserung"
        ),
        t(
          `veg-feed-${startDay}`,
          "veg",
          "Erste Nährstoffgabe",
          "Stickstoff-betonte Nährlösung einleiten. Niedrig beginnen (halbe Dosierung), schrittweise steigern.",
          d(3),
          "duengung"
        ),
        t(
          `veg-canopy-${startDay}`,
          "veg",
          "Kronendach kontrollieren",
          "Gleichmäßige Höhe sicherstellen. Überdominante Äste nach außen biegen.",
          d(14),
          "kontrolle"
        ),
      ];

      // Advanced tasks for experienced growers
      if (erfahrung !== "einsteiger") {
        tasks.push(
          t(
            `veg-lst-${startDay}`,
            "veg",
            "LST beginnen",
            "Seitentriebe vorsichtig mit Bindedraht nach außen biegen. Ziel: flaches, gleichmäßiges Kronendach.",
            d(7),
            "training"
          )
        );
      }

      if (erfahrung === "profi") {
        tasks.push(
          t(
            `veg-topping-${startDay}`,
            "veg",
            "Topping (Woche 3)",
            "Den Haupttrieb zwischen dem 4.–6. Knotenpunkt kappen. Erzeugt zwei gleichwertige Hauptäste.",
            d(21),
            "training"
          )
        );
      }

      return tasks;
    }

    case "bluete":
      return [
        t(
          `bl-switch-${startDay}`,
          "bluete",
          "Licht auf 12/12 umstellen",
          "Blüteeinleitung für photoperiodische Pflanzen. Lichtdichtigkeit des Grow-Raums prüfen!",
          d(0),
          "kontrolle"
        ),
        t(
          `bl-nutrients-${startDay}`,
          "bluete",
          "Nährstoffe auf Blütephase umstellen",
          "Weniger Stickstoff (N), mehr Phosphor (P) und Kalium (K). EC langsam auf Zielwert steigern.",
          d(3),
          "duengung"
        ),
        t(
          `bl-ph-${startDay}`,
          "bluete",
          "pH-Drift in Woche 1 überwachen",
          "Erhöhter Wasserverbrauch kann den Substrat-pH verschieben. Ablauf-EC täglich messen.",
          d(7),
          "kontrolle"
        ),
        t(
          `bl-defoliation-${startDay}`,
          "bluete",
          "Defoliation (Woche 3)",
          "Große, das Blütenlicht blockierende Blätter entfernen. Nur 20–30 % der Blattmasse entnehmen.",
          d(21),
          "training"
        ),
        t(
          `bl-support-${startDay}`,
          "bluete",
          "Stützstäbe einsetzen (Woche 5)",
          "Schwere Blütenstände abstützen damit Äste nicht brechen. Jo-Jo-Seile oder Bambusstäbe nutzen.",
          d(35),
          "allgemein"
        ),
      ];

    case "spaetbluete":
      return [
        t(
          `sp-flush-${startDay}`,
          "spaetbluete",
          "Ausspülen beginnen",
          "Letzte 1–2 Wochen nur pH-korrigiertes klares Wasser (6.0–6.5). Ablauf-EC täglich überwachen.",
          d(0),
          "bewaesserung"
        ),
        t(
          `sp-leaves-${startDay}`,
          "spaetbluete",
          "Blättervergilbung beobachten",
          "Natürliches Ausbleichen und Stickstoff-Abbau während des Ausspülens ist normal und erwünscht.",
          d(5),
          "kontrolle"
        ),
        t(
          `sp-trichome-${startDay}`,
          "spaetbluete",
          "Trichome täglich unter Lupe prüfen",
          "60–100x Lupe: Milchig = nahezu reif. Bernstein = maximale Reife. Klar = noch zu früh.",
          d(7),
          "kontrolle"
        ),
      ];

    case "ernte":
      return [
        t(
          `ernte-harvest-${startDay}`,
          "ernte",
          "Ernte durchführen",
          "Morgens ernten, bevor das Licht angeht. Pflanzen gründlich abschneiden und entblättern.",
          d(0),
          "ernte"
        ),
        t(
          `ernte-dry-${startDay}`,
          "ernte",
          "Trocknung einrichten",
          "18–21 °C, 50–60 % RH, kein direktes Licht, gute Luftzirkulation. Knospen locker aufhängen.",
          d(0),
          "ernte"
        ),
        t(
          `ernte-cure-${startDay}`,
          "ernte",
          "Curing starten (nach 7–14 Tagen Trocknung)",
          "In luftdichte Gläser füllen. Täglich 10–15 Min. öffnen (Burpen) für 2–4 Wochen.",
          d(7),
          "ernte"
        ),
      ];

    default:
      return [];
  }
}
