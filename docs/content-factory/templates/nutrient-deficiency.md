# Template — Nutrient Deficiency

> Archetype 1 of 6. Instance of the 16-block schema (editorial standard §4).
> `entity_type: MedicalCondition`. Use for: N, P, K, Ca, Mg, S, Fe, Mn, Zn, B,
> Cu, Mo deficiencies. Worked reference: "Magnesium Deficiency" (standard §6).
>
> Replace every `{{placeholder}}`. Keep block order. Mark a block `N/A — <reason>`
> only when genuinely inapplicable.

---

## Front matter (→ `knowledge_articles` + `meta`)

```yaml
slug: {{nutrient}}mangel                 # e.g. magnesiummangel
title: "{{Nutrient}}mangel bei Cannabis"
summary: "{{One sentence: the disorder, where it shows, the core cause.}}"
category: anbau
difficulty: intermediate                  # foundational|intermediate|advanced|expert
entity_type: MedicalCondition
language: de
meta:
  evidence_level: {{1-5}}                 # weakest supporting source acceptable
  confidence_score: {{0.0-1.0}}           # see SOURCE_REQUIREMENTS.md
  last_review_date: {{YYYY-MM-DD}}
  review_horizon_months: 12
relations:                                 # → knowledge_relations
  - { type: caused_by,     to: ph-lockout }
  - { type: antagonist_of, to: {{competing-cation}} }
  - { type: symptom_of,    from: {{symptom-node}} }
  - { type: treated_by,    from: {{supplement-node}} }
tool_links:                                # → knowledge_tool_links
  - { kind: diagnosis,  slug: deficiency-diagnosis }
  - { kind: calculator, slug: nutrient-calculator }
  - { kind: calculator, slug: ph-calculator }
```

---

## 1. `definition`
One precise paragraph: {{nutrient}} deficiency as a physiological disorder caused
by insufficient {{ion}} availability, and the primary process it impairs
(e.g. chlorophyll synthesis, cell-wall formation, enzyme activation).

## 2. `scientific_background`
The ion's role in plant biochemistry. Quantify typical tissue sufficiency ranges
(% dry mass or ppm). State mobility (phloem-mobile vs. immobile) — this dictates
*where* symptoms appear first and is the key differential lever.

## 3. `plant_physiology`
Mechanism at cell/tissue level: uptake pathway (mass flow / diffusion), transport,
remobilization. Explain *why* the symptom pattern follows from the physiology
(e.g. mobile ion → older leaves first; immobile → new growth first).

## 4. `symptoms`
Staged, observable signs, earliest → advanced. Specify: leaf position
(lower/upper, older/new), pattern (interveinal chlorosis, marginal necrosis,
mottling), color progression, and growth effects. Use abaxial/adaxial,
acropetal/basipetal correctly. A table by stage is preferred.

## 5. `causes`
Ranked causal factors with mechanism, e.g.:
1. Low substrate {{nutrient}} supply.
2. Cation/anion antagonism (name the competing ions).
3. Root-zone pH outside the uptake window — give ranges (soil vs. coco/hydro).
4. Low transpiration limiting mass flow.
5. Root-zone temperature / oxygen limits.

## 6. `diagnosis`
Differential procedure: how to distinguish this deficiency from look-alikes
(other deficiencies, toxicity, pH lockout, pathogens, light stress). Specify the
measurements (runoff/slurry pH + EC, tissue test) and decision thresholds.
**This block feeds the diagnosis tool — be explicit and rule-based.**

## 7. `corrective_actions`
Specific, measurable interventions, sequenced. Correct pH first if lockout;
then targeted supplementation with dose ranges and re-check interval. State the
expected recovery timeline and that necrotic tissue does not recover.

## 8. `preventive_measures`
Protocols preventing recurrence: base-nutrient balance, pH discipline, EC
targets by stage, substrate buffering, monitoring cadence.

## 9. `environmental_factors`
How VPD, temperature, RH, and transpiration rate modulate uptake and symptom
expression. Quantify.

## 10. `nutrient_interactions`
Antagonisms and synergisms (e.g. K⁺/Ca²⁺/Mg²⁺ competition; CalMag synergy).
A small interaction matrix is ideal. Note lockout dynamics.

## 11. `common_mistakes`
Frequent misdiagnoses and operator errors (e.g. adding more nutrient into a
lockout, mistaking pH lockout for true deficiency, over-correcting into toxicity).

## 12. `advanced_considerations`
Edge cases: cultivar-specific susceptibility, high-frequency fertigation,
living-soil vs. mineral, tissue-test interpretation, late-flower nuances.

## 13. `related_topics`
Typed cross-links → the antagonist nutrient, the matching toxicity article,
pH lockout, the relevant substrate article, the diagnosis tool.

## 14. `references`
Every quantitative claim cited to `knowledge_sources`. Minimum evidence bar per
[`../SOURCE_REQUIREMENTS.md`](../SOURCE_REQUIREMENTS.md).

## 15. `faq`
3–6 structured Q&A (drives FAQ schema). Real grower questions, mechanistic
answers — never marketing.

## 16. `expert_tips`
High-signal practitioner guidance: the one threshold or check that prevents this
deficiency in practice.
