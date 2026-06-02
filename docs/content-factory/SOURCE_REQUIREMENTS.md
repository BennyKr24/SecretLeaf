# Source & Evidence Requirements — Phase 17 Content Factory (Phase C)

> Every future article must be **traceable, scored, and dated**. This document
> defines the four mandatory evidence fields, where they live in the schema, how
> to compute them, and the minimum bar an article must clear before it can be
> published.
>
> Owner: Editorial & Agronomy · Status: Active · Date: 2026-06-02 · Version: 1.0

Companion: [`templates/`](./templates/) · [`ARTICLE_WORKFLOW.md`](./ARTICLE_WORKFLOW.md)
· [`../CANNABIS_EDITORIAL_STANDARD.md`](../CANNABIS_EDITORIAL_STANDARD.md) §3.

---

## 1. The four mandatory fields

Every article carries these four signals. No article reaches `status = published`
without all four populated.

| Field | Where it lives | Type | Purpose |
|-------|----------------|------|---------|
| `evidence_level` | per source: `knowledge_sources.evidence_level`; per article: `meta.evidence_level` (the **weakest** source backing a load-bearing claim) | int 1–5 | Strength of the underlying evidence. |
| Source references | `knowledge_references` (article ↔ source junction) + the `references` block | rows | Every quantitative/clinical claim is cited. |
| `confidence_score` | `meta.confidence_score` | float 0.00–1.00 | Composite trust signal (formula §4). |
| `last_review_date` | `meta.last_review_date` (+ `meta.review_horizon_months`) | date | Freshness / staleness gate. |

> These reuse existing schema. `knowledge_sources.evidence_level` already exists
> (migration `202606020013`); article-level fields live in
> `knowledge_articles.meta` (jsonb). **No new database architecture is required** —
> consistent with the Phase 16/17 mandate.

---

## 2. Evidence levels (1–5)

Mirrors the editorial standard §3. Rank the **source**, then the article inherits
the weakest level among its load-bearing claims.

| Level | Source class |
|:-----:|--------------|
| **5** | Systematic review / meta-analysis. |
| **4** | RCT / authoritative standard (ISO, AOAC, ASTM). |
| **3** | Controlled experimental study. |
| **2** | Observational / field study. |
| **1** | Expert consensus / extension guidance. |

Rules:
- Prefer primary literature and standards bodies over secondary commentary.
- When sources conflict, present the weight of evidence and state the conflict
  in the `references` context and the article body.
- **Cannabis-specific data is often thin.** Where a claim rests on general
  horticulture/plant-pathology literature extrapolated to cannabis, mark it
  level 1–2 and say so explicitly — never imply false certainty.

---

## 3. Source reference requirements

- **Minimum 3 distinct sources** per handbook-grade article; diagnostic
  archetypes (deficiency, toxicity, pest, disease, environmental) require
  **≥ 4**, with at least one at evidence level ≥ 3.
- **No category-default `sourceIds`.** Every article cites its own sources. (The
  Phase 16 audit penalized articles relying on category-default fallbacks.)
- Every numeric range, threshold, dose, or clinical claim has an inline citation
  mapped to a `knowledge_sources` row via `knowledge_references` (with `context`).
- Each source record requires: `title`, `publisher`, `year`, and `url` **or**
  `doi`. A source without a locator is not admissible.
- Reuse existing source records (`external_id`) before creating new ones to keep
  the register de-duplicated.

---

## 4. Confidence score (0.00–1.00)

A composite, reproducible trust signal stored in `meta.confidence_score`. It is
**distinct** from `quality_score` (structural/editorial completeness) and from the
grow-signal `qualityScore` in the legacy `GROW_KNOWLEDGE` map.

```
confidence_score =
    0.40 × (mean source evidence_level ÷ 5)      # evidence strength
  + 0.20 × source_adequacy                       # ≥ required source count & diversity → 1.0
  + 0.20 × consistency                           # sources agree (1.0) … conflict (0.3)
  + 0.20 × freshness                             # within review horizon (1.0) → 0 when 2× overdue
```

- `source_adequacy` = min(1, sources_present ÷ sources_required), with a 0.1
  penalty if all sources share one publisher.
- `consistency` = editor-assigned: 1.0 agreement · 0.6 minor gaps · 0.3 active
  conflict (and the conflict must be stated in-body).
- `freshness` decays linearly from 1.0 at review date to 0 at twice the horizon.

**Publication gates by archetype:**

| Archetype | Min confidence | Min sources | Min top evidence level |
|-----------|:--------------:|:-----------:|:----------------------:|
| Deficiency / Toxicity / Disease / Pest / Env. stress | **0.70** | 4 | 3 |
| Cultivation technique | 0.60 | 3 | 2 (1 allowed if marked consensus) |

Articles below gate stay `in_review`. Confidence is surfaced for editorial
prioritization, not necessarily to end users.

---

## 5. Review date & freshness

- `last_review_date` is set on every publish and every substantive revision.
- `review_horizon_months`: **12** for diagnostic archetypes (science and product
  tooling move), **18** for techniques.
- An article past `last_review_date + review_horizon` is **stale**: it is flagged,
  its `freshness` term decays (lowering `confidence_score`), and it is re-queued
  for source review per editorial standard §9.
- Staleness never silently demotes published content; it raises a review task.

---

## 6. Author checklist (per article)

- [ ] ≥ 3 sources (≥ 4 for diagnostic archetypes), each with `url` or `doi`.
- [ ] Every numeric/clinical claim has an inline citation with `context`.
- [ ] No category-default `sourceIds`.
- [ ] `meta.evidence_level` = weakest load-bearing source level.
- [ ] `meta.confidence_score` computed (§4) and meets the archetype gate.
- [ ] Conflicts between sources stated in-body.
- [ ] `meta.last_review_date` + `review_horizon_months` set.
- [ ] Extrapolated (non-cannabis-specific) claims explicitly flagged.
