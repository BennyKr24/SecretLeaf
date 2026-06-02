# Template — Environmental Stress

> Archetype 5 of 6. 16-block schema. `entity_type: MedicalCondition`.
> Use for: heat stress, cold stress, wind burn, light stress/burn, humidity/RH
> problems, over/underwatering, light leak, CO₂ issues, pH lockout.
>
> Environmental stresses are the **most common deficiency look-alikes** — the
> `diagnosis` block must explicitly separate "stress" from "deficiency/pathogen".

---

## Front matter

```yaml
slug: {{stress}}                          # e.g. hitzestress
title: "{{Stress}} bei Cannabis: Ursachen, Diagnose, Abhilfe"
summary: "{{One sentence: the stressor, the parameter out of range, the impact.}}"
category: anbau                           # or werkzeuge for climate/measurement
difficulty: intermediate
entity_type: MedicalCondition
language: de
meta:
  evidence_level: {{1-5}}
  confidence_score: {{0.0-1.0}}
  last_review_date: {{YYYY-MM-DD}}
  review_horizon_months: 12
relations:
  - { type: caused_by,     to: {{out-of-range-parameter}} }
  - { type: see_also,      to: {{deficiency-it-mimics}} }
  - { type: interacts_with, to: vpd-einfach-erklaert }
tool_links:
  - { kind: calculator, slug: vpd-calculator }
  - { kind: diagnosis,  slug: deficiency-diagnosis }
```

---

## 1. `definition`
The stress condition, the environmental parameter out of range, and the headline
physiological impact.

## 2. `scientific_background`
The tolerance envelope (quantified: °C, %RH, VPD kPa, PPFD, DLI) and what happens
biochemically beyond it (e.g. enzyme denaturation, stomatal closure,
photoinhibition).

## 3. `plant_physiology`
Mechanism: transpiration, stomatal conductance, photosynthetic response, and how
the out-of-range parameter cascades into the visible symptom.

## 4. `symptoms`
Staged, observable signs and **the tell that distinguishes stress from
deficiency** (e.g. heat → upward leaf taco/cupping near the canopy top vs. mobile
deficiency → lower-leaf chlorosis). Specify canopy position and timing
(morning/evening, lights-on duration).

## 5. `causes`
Ranked drivers: equipment (light height/intensity, heater/AC, fans), ambient
conditions, VPD mismanagement, watering practice, room sealing.

## 6. `diagnosis`
Measurement procedure (where and when to measure leaf-surface temp, canopy RH,
VPD, PPFD) and decision thresholds. Differential vs. deficiency, pathogen, and
pest. **Feeds the diagnosis tool.**

## 7. `corrective_actions`
Sequenced parameter correction with target ranges and the order to adjust
(stabilize the driving parameter first). Note that damaged tissue does not heal.

## 8. `preventive_measures`
Set-points by growth stage, sensor placement and calibration, automation/alerts,
canopy and airflow management.

## 9. `environmental_factors`
The full interacting set (temp × RH × VPD × light) and how they compound. Provide
a target table by stage.

## 10. `nutrient_interactions`
How the stress alters uptake (e.g. low transpiration → Ca/Mg deficiency; heat →
increased water demand) and induces secondary deficiencies. Mark `N/A` only if
truly none.

## 11. `common_mistakes`
Chasing a "deficiency" that is actually stress, adjusting multiple parameters at
once, ignoring leaf-surface temperature vs. air temperature, sensor placement
errors.

## 12. `advanced_considerations`
Sealed-room dynamics, CO₂-enriched higher-light/-temperature envelopes, VPD by
stage, light-intensity ramping, DLI targets.

## 13. `related_topics`
→ the deficiency it mimics, VPD article, sensor calibration, VPD/diagnosis tools.

## 14. `references`
Cited per source requirements (plant physiology / controlled-environment ag).

## 15. `faq`
3–6 mechanistic Q&A ("Is it heat or a deficiency?", "Will it recover?").

## 16. `expert_tips`
The single measurement (e.g. leaf-surface temp, canopy VPD) that catches this early.
