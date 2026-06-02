# Template — Cultivation Technique

> Archetype 6 of 6. 16-block schema, adapted for procedural content.
> `entity_type: HowTo`. Use for: topping/FIM, LST, ScrOG/SOG, defoliation,
> supercropping, transplanting, cloning, germination, drying, flushing,
> harvest-window determination, feeding schedules.
>
> Technique articles are **procedural, not diagnostic**: blocks 4–6
> (`symptoms`/`causes`/`diagnosis`) are repurposed as
> **goal / method / outcome-evaluation**, and must be consciously mapped.

---

## Front matter

```yaml
slug: {{technique}}                       # e.g. lst-low-stress-training
title: "{{Technique}}: Methode, Timing, Wirkung"
summary: "{{One sentence: the technique, its purpose, the expected gain.}}"
category: anbau
difficulty: intermediate                  # set by technique complexity
entity_type: HowTo
language: de
meta:
  evidence_level: {{1-5}}
  confidence_score: {{0.0-1.0}}
  last_review_date: {{YYYY-MM-DD}}
  review_horizon_months: 18                # techniques age slower than diagnostics
relations:
  - { type: prerequisite,  to: cannabis-anbau-grundlagen }
  - { type: see_also,      to: {{related-technique}} }
tool_links:
  - { kind: reference, slug: grow-log }
```

---

## 1. `definition`
What the technique is and the cultivation goal it serves (yield, canopy
uniformity, height control, quality).

## 2. `scientific_background`
The horticultural principle it exploits (apical dominance, auxin distribution,
light penetration, source–sink balance). Cite where evidence exists; flag where
practice outpaces literature.

## 3. `plant_physiology`
Plant response to the intervention (hormonal redistribution, lateral growth,
wound healing) and the time course.

## 4. `symptoms` → **Goal & indications**
When to use the technique: plant stage, structure, and objective. When *not* to
use it (contraindications, autoflowers, late flower).

## 5. `causes` → **Method (step-by-step)**
The procedure as ordered, measurable steps: timing (node count / day), tools,
cut/bend points, and quantities. A numbered protocol with thresholds.

## 6. `diagnosis` → **Outcome evaluation**
How to judge success and recovery: expected response window, what a good vs. poor
result looks like, and how to log it (`grow-log` integration).

## 7. `corrective_actions`
Recovery and remediation if the technique stresses the plant (overtraining,
broken branch, slow recovery) — with target recovery conditions.

## 8. `preventive_measures`
How to apply the technique without setback: sanitation of tools, stress
budgeting, stage limits, spacing between interventions.

## 9. `environmental_factors`
Post-intervention environment to support recovery (VPD/RH/temperature),
light adjustments.

## 10. `nutrient_interactions`
Feeding adjustments around the intervention (e.g. reduced N during recovery), or
`N/A — not nutrient-mediated`.

## 11. `common_mistakes`
Wrong timing/stage, overtraining, dirty tools, stacking too many stressors,
applying to unsuitable genetics.

## 12. `advanced_considerations`
Combining techniques, commercial-scale application, cultivar-specific response,
research frontier.

## 13. `related_topics`
→ prerequisite fundamentals, complementary techniques, grow-log tool.

## 14. `references`
Cited per source requirements; explicitly mark practitioner-consensus claims
(evidence level 1) where peer-reviewed data is thin.

## 15. `faq`
3–6 practical Q&A ("At which node?", "How long until recovery?").

## 16. `expert_tips`
The single timing or technique detail that separates a clean result from setback.
