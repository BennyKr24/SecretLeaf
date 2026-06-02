# Template — Disease

> Archetype 4 of 6. 16-block schema. `entity_type: MedicalCondition`.
> Use for: root rot, Pythium, Fusarium, bud rot (Botrytis), powdery mildew,
> downy mildew, septoria, hop latent viroid, damping off, etc.
>
> `plant_physiology` is reframed as **pathogen biology & infection cycle**.

---

## Front matter

```yaml
slug: {{disease}}                         # e.g. bud-rot-botrytis
title: "{{Disease}} bei Cannabis: Erkennen, Behandeln, Vorbeugen"
summary: "{{One sentence: pathogen, tissue attacked, decisive control lever.}}"
category: anbau                           # or sicherheit for post-harvest safety
difficulty: advanced
entity_type: MedicalCondition
language: de
meta:
  evidence_level: {{1-5}}
  confidence_score: {{0.0-1.0}}
  last_review_date: {{YYYY-MM-DD}}
  review_horizon_months: 12
relations:
  - { type: caused_by,     to: {{environmental-trigger}} }   # e.g. high RH
  - { type: symptom_of,    from: {{visible-symptom-node}} }
  - { type: interacts_with, to: vpd-einfach-erklaert }
  - { type: see_also,      to: {{look-alike-disease}} }
tool_links:
  - { kind: diagnosis,  slug: disease-diagnosis }
  - { kind: calculator, slug: vpd-calculator }
```

---

## 1. `definition`
The disease, the pathogen (common + scientific name), pathogen class
(fungal/oomycete/bacterial/viral/viroid), and the tissue/stage it attacks.

## 2. `scientific_background`
Pathogen biology, host range, and the environmental envelope that enables
infection (RH, temperature, leaf wetness duration, VPD). Quantify the risk window.

## 3. `plant_physiology` → **Pathogen biology & infection cycle**
Infection cycle: inoculum source → germination/penetration → colonization →
sporulation/spread. Latency period and how the plant's tissue physiology is
hijacked or destroyed.

## 4. `symptoms`
Staged, observable signs by tissue (root, stem, leaf, bud). Specify color,
texture, lesion morphology, and progression. Distinguish early (treatable) from
advanced (unsalvageable). Note where post-harvest/consumer safety is implicated.

## 5. `causes`
Ranked: environmental trigger (high RH / low VPD / poor airflow / overwatering),
inoculum introduction, dense canopy/microclimate, wounding, substrate
contamination.

## 6. `diagnosis`
Differential procedure vs. look-alikes (nutrient symptoms, other pathogens, pest
damage). Field cues, magnification, and when lab confirmation (e.g. HLVd testing)
is warranted. Decision rule for "treat vs. cull". **Feeds the disease diagnosis
tool.**

## 7. `corrective_actions`
Staged response: isolate/remove affected tissue or plants, correct the driving
environment (VPD/RH/airflow targets), targeted treatment where viable, sanitation.
State explicitly when culling is the only safe option (e.g. HLVd, advanced bud rot).

## 8. `preventive_measures`
Environmental control set-points (RH/VPD/airflow by stage), canopy management,
sanitation, quarantine and pathogen testing of incoming genetics, substrate
hygiene.

## 9. `environmental_factors`
The quantified RH/VPD/temperature/leaf-wetness envelope that drives infection,
and the target operating window that suppresses it.

## 10. `nutrient_interactions`
Where relevant: silicon/calcium and tissue resistance, over-N and soft growth
susceptibility; otherwise mark `N/A`.

## 11. `common_mistakes`
Treating symptoms while ignoring the environmental driver, late detection,
inadequate sanitation, keeping infected mothers, no quarantine/testing.

## 12. `advanced_considerations`
Sealed-room microclimate control, fungicide resistance and rotation, biological
controls, post-harvest safety and mycotoxin risk, viroid eradication realities.

## 13. `related_topics`
→ look-alike diseases, VPD article, mold/mycotoxin article, diagnosis + VPD tools.

## 14. `references`
Cited per source requirements (plant pathology / extension literature).

## 15. `faq`
3–6 mechanistic Q&A ("Can I save the plant?", "Is the rest of the crop safe?").

## 16. `expert_tips`
The single environmental set-point or sanitation practice that prevents it.
