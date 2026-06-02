# Template — Pest

> Archetype 3 of 6. 16-block schema. `entity_type: Thing`.
> Use for: spider mites, thrips, fungus gnats, aphids, whiteflies, broad/russet
> mites, caterpillars, leaf miners, root aphids, mealybugs, scale.
>
> The `plant_physiology` block is reframed as **pest biology & life cycle** — the
> mechanism that makes the diagnostic and treatment chain work.

---

## Front matter

```yaml
slug: {{pest}}                            # e.g. spinnmilben
title: "{{Pest}} an Cannabis erkennen und bekämpfen"
summary: "{{One sentence: the pest, the damage it causes, the decisive control.}}"
category: anbau
difficulty: intermediate
entity_type: Thing
language: de
meta:
  evidence_level: {{1-5}}
  confidence_score: {{0.0-1.0}}
  last_review_date: {{YYYY-MM-DD}}
  review_horizon_months: 12
relations:
  - { type: causes,        to: {{damage-symptom-node}} }
  - { type: interacts_with, to: integrierte-schaedlingspraevention-grow }
  - { type: see_also,      to: {{look-alike-pest}} }
tool_links:
  - { kind: diagnosis, slug: pest-diagnosis }
  - { kind: reference, slug: ipm-protocol }
```

---

## 1. `definition`
The pest (common + Latin name), what it feeds on, and the headline crop impact.

## 2. `scientific_background`
Taxonomy, host range, and why cannabis is susceptible. Conditions that favor
outbreaks (temperature/RH ranges — quantify).

## 3. `plant_physiology` → **Pest biology & life cycle**
Life-cycle stages, generation time at given temperatures, reproduction rate, and
where each stage lives on the plant (abaxial leaf surface, substrate, stems).
This drives detection timing and treatment intervals.

## 4. `symptoms`
Damage signs **and** direct pest signs, staged. Specify: stippling, webbing,
silvering, honeydew, sooty mold, leaf distortion; plus how to see the pest
(loupe magnification, sticky-trap counts, scouting locations). A
"early vs. heavy infestation" table is preferred.

## 5. `causes`
Introduction vectors (clones, new plants, pets, soil, open intake), and
conditions that let a small population explode.

## 6. `diagnosis`
Identification procedure separating this pest from look-alikes (e.g. spider mites
vs. broad mites vs. russet mites; thrips vs. nutrient stippling). Magnification,
trap thresholds, and a decision rule for action threshold. **Feeds the pest
diagnosis tool.**

## 7. `corrective_actions`
Staged IPM response: cultural → mechanical/biological → targeted treatment, with
re-treatment intervals tied to the life cycle. Note pre-harvest intervals and
residue limits; reference `pestizidklassen-und-rueckstandsrisiken`.

## 8. `preventive_measures`
Quarantine of new genetics, intake filtering, sticky-trap monitoring cadence,
sanitation, environmental control, beneficial insects.

## 9. `environmental_factors`
Temperature/RH/airflow ranges that accelerate or suppress the pest. Quantify the
window growers should hold to slow reproduction.

## 10. `nutrient_interactions`
Where relevant: plant stress/excess nitrogen increasing susceptibility; otherwise
mark `N/A — pest pressure is not nutrient-mediated`.

## 11. `common_mistakes`
Single-spray "one and done" (ignoring egg stages/life cycle), treating only the
adaxial surface, no quarantine, no monitoring, rotating nothing (resistance).

## 12. `advanced_considerations`
Miticide/insecticide resistance management and rotation, biological control
agent selection, flowering-stage treatment constraints, sealed-room dynamics.

## 13. `related_topics`
→ look-alike pests, IPM article, residue/pesticide article, diagnosis tool.

## 14. `references`
Cited per source requirements (extension/IPM literature, peer-reviewed entomology).

## 15. `faq`
3–6 mechanistic Q&A (e.g. "Can I treat in flower?", "Why did they come back?").

## 16. `expert_tips`
The single monitoring or rotation practice that reliably prevents escalation.
