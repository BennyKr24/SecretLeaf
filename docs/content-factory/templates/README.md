# Article Templates — Phase 17 Content Factory (Phase B)

> Six canonical, fill-in templates — one per article archetype. Every template is
> a strict instance of the 16-block schema in
> [`docs/CANNABIS_EDITORIAL_STANDARD.md`](../../CANNABIS_EDITORIAL_STANDARD.md) §4,
> and maps 1:1 to `KnowledgeBlockType` in
> `apps/web/src/lib/knowledge/types.ts` and `knowledge_articles.body`.
>
> **Rule:** an author starts from the matching template, fills every block, and
> consciously marks any block `N/A` with a one-line justification. Omission is a
> deliberate editorial choice, never an accident.

## The six archetypes

| # | Archetype | File | `entity_type` (schema.org) |
|---|-----------|------|----------------------------|
| 1 | Nutrient deficiency | [`nutrient-deficiency.md`](./nutrient-deficiency.md) | `MedicalCondition` |
| 2 | Nutrient toxicity / excess | [`nutrient-toxicity.md`](./nutrient-toxicity.md) | `MedicalCondition` |
| 3 | Pest | [`pest.md`](./pest.md) | `Thing` |
| 4 | Disease | [`disease.md`](./disease.md) | `MedicalCondition` |
| 5 | Environmental stress | [`environmental-stress.md`](./environmental-stress.md) | `MedicalCondition` |
| 6 | Cultivation technique | [`cultivation-technique.md`](./cultivation-technique.md) | `HowTo` |

## Shared rules (all templates)

- **Block order is fixed.** Render order = schema order = the table above.
- **Register:** mechanism-first, quantified, third person. See editorial standard
  §2. Prohibited: blog phrasing, beginner hand-holding, SEO filler, hype.
- **Units always.** pH, EC/PPM, °C, %RH, VPD (kPa), PPFD (µmol·m⁻²·s⁻¹),
  DLI (mol·m⁻²·d⁻¹). Ranges use en-dash (6.0–6.5).
- **Every quantitative claim is cited** to a `knowledge_sources` record via the
  `references` block. See [`../SOURCE_REQUIREMENTS.md`](../SOURCE_REQUIREMENTS.md).
- **Front-matter metadata** (Phase C) is mandatory and lives in
  `knowledge_articles.meta`: `evidence_level`, `confidence_score`,
  `last_review_date`, `review_horizon`, plus typed `relations` and `tool_links`.
- **Diagnostic archetypes (1–5)** must populate the full diagnostic chain
  `symptoms → causes → diagnosis → corrective_actions → preventive_measures` —
  this is what powers the future diagnosis tool, AI assistant, and image
  diagnosis. A diagnostic article with an empty `symptoms` or `diagnosis` block
  is rejected at editorial review.

## Block ↔ schema reference

| # | Block `type` | Required for archetypes |
|---|--------------|-------------------------|
| 1 | `definition` | all |
| 2 | `scientific_background` | all |
| 3 | `plant_physiology` | 1,2,3,4,5 (technique: optional) |
| 4 | `symptoms` | 1,2,3,4,5 |
| 5 | `causes` | 1,2,3,4,5 |
| 6 | `diagnosis` | 1,2,3,4,5 |
| 7 | `corrective_actions` | all |
| 8 | `preventive_measures` | all |
| 9 | `environmental_factors` | all |
| 10 | `nutrient_interactions` | 1,2,4,5 (pest/technique: where relevant) |
| 11 | `common_mistakes` | all |
| 12 | `advanced_considerations` | all |
| 13 | `related_topics` | all |
| 14 | `references` | all |
| 15 | `faq` | all |
| 16 | `expert_tips` | all |

Presentation blocks `callout`, `warning`, `expert_box` may be interleaved.
