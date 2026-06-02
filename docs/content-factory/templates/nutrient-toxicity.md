# Template — Nutrient Toxicity / Excess

> Archetype 2 of 6. 16-block schema. `entity_type: MedicalCondition`.
> Use for: nitrogen toxicity, nutrient burn / tip-burn, K/cation excess, salt
> buildup (high EC), micronutrient toxicity, pH-lockout (excess side).
>
> The toxicity article is the **differential partner** of its deficiency article —
> author the pair together so the diagnosis tool can separate "too little" from
> "too much".

---

## Front matter

```yaml
slug: {{nutrient}}ueberschuss            # or naehrstoffverbrennung-tipburn
title: "{{Nutrient}}überschuss / -toxizität bei Cannabis"
summary: "{{One sentence: the excess condition, hallmark sign, core trigger.}}"
category: anbau
difficulty: intermediate
entity_type: MedicalCondition
language: de
meta:
  evidence_level: {{1-5}}
  confidence_score: {{0.0-1.0}}
  last_review_date: {{YYYY-MM-DD}}
  review_horizon_months: 12
relations:
  - { type: antagonist_of, to: {{induced-deficiency}} }   # excess of X locks out Y
  - { type: caused_by,     to: high-ec }
  - { type: see_also,      to: {{matching-deficiency}} }
tool_links:
  - { kind: diagnosis,  slug: deficiency-diagnosis }
  - { kind: calculator, slug: nutrient-calculator }
  - { kind: calculator, slug: ec-calculator }
```

---

## 1. `definition`
Excess {{nutrient}} (or total salt load) as a physiological disorder; the
hallmark sign and the dominant trigger (over-feeding, high EC, antagonistic
lockout).

## 2. `scientific_background`
Toxicity thresholds and the osmotic/ionic mechanism. Distinguish *direct* ion
toxicity from *indirect* damage (osmotic stress, antagonism-induced secondary
deficiency). Quantify EC/PPM danger zones by stage.

## 3. `plant_physiology`
Osmotic gradient at the root, ion accumulation, and the downstream physiological
failure (e.g. tip burn from salt accumulation at leaf margins via transpiration).

## 4. `symptoms`
Staged signs: e.g. dark/clawing leaves (N tox), burnt/crispy margins (salt),
glossy/clawed foliage. Specify position and progression; contrast explicitly with
the *deficiency* presentation of the same nutrient.

## 5. `causes`
Ranked: over-fertilization, high cumulative EC, infrequent runoff/flush,
antagonistic dosing, pH driving over-availability, low water uptake concentrating
salts.

## 6. `diagnosis`
Runoff/slurry EC + pH measurement and thresholds; how to separate toxicity from
deficiency, light burn, and pathogens. Decision rule for "flush vs. dilute vs.
re-balance". **Feeds the diagnosis tool.**

## 7. `corrective_actions`
Sequenced: reduce feed strength to target EC, flush with pH-corrected water to a
target runoff EC, restore balanced feed at reduced rate, re-measure interval.
State recovery expectations.

## 8. `preventive_measures`
EC ramping by stage, runoff-EC monitoring, periodic clear-water flush cadence,
substrate-appropriate feeding.

## 9. `environmental_factors`
Transpiration, VPD, and temperature effects on salt concentration and uptake.
High VPD + high EC compounds margin burn — quantify.

## 10. `nutrient_interactions`
Which deficiency this excess induces (antagonism map). Lockout dynamics and
cation balance.

## 11. `common_mistakes`
"More is better" feeding, ignoring cumulative EC, flushing with uncorrected-pH
water, mistaking salt burn for a deficiency and adding more nutrient.

## 12. `advanced_considerations`
Substrate buffering differences (coco vs. soil vs. hydro), fertigation
frequency, late-flower EC tapering, cultivar salt sensitivity.

## 13. `related_topics`
→ matching deficiency article, pH lockout, EC/VPD calculators, substrate article.

## 14. `references`
Cited per source requirements.

## 15. `faq`
3–6 mechanistic Q&A.

## 16. `expert_tips`
The single runoff-EC threshold/check that prevents this in practice.
