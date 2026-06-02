# Article Generation Workflow — Phase 17 Content Factory (Phase D)

> The repeatable pipeline that turns a backlog item into a published,
> handbook-grade article **without quality degradation at scale**. Five stages,
> each with an owner, inputs, outputs, and an explicit exit gate. Stages map to
> the existing editorial state machine (`knowledge_status`,
> `knowledge_reviews`, `knowledge_versions`).
>
> Owner: Editorial & Agronomy · Status: Active · Date: 2026-06-02 · Version: 1.0

Companion: [`templates/`](./templates/) · [`SOURCE_REQUIREMENTS.md`](./SOURCE_REQUIREMENTS.md)
· [`../KNOWLEDGE_COVERAGE_MATRIX.md`](../KNOWLEDGE_COVERAGE_MATRIX.md)
· [`../CONTENT_BACKLOG.md`](../CONTENT_BACKLOG.md)

---

## 1. Pipeline overview

```
 Backlog item (Phase E)
        │
        ▼
 ┌─────────────┐   ┌─────────┐   ┌────────────┐   ┌──────────────────┐   ┌─────────┐
 │ 1. RESEARCH │ → │ 2. DRAFT │ → │ 3. FACT    │ → │ 4. EDITORIAL     │ → │ 5.      │
 │             │   │          │   │    CHECK   │   │    REVIEW        │   │ PUBLISH │
 └─────────────┘   └─────────┘   └────────────┘   └──────────────────┘   └─────────┘
        │               │              │                   │                   │
   source dossier   draft (status   verified claims    4 sign-offs        published +
   + evidence map    = draft)        + confidence       (status =          relations +
                                     score              in_review)         tool links
```

Each stage has a **hard exit gate**. Work cannot advance until the gate passes;
failures route back one stage with notes.

---

## 2. Stage 1 — Research

**Owner:** Agronomy researcher (or research agent).
**Input:** backlog item (topic, archetype, target slug, priority).
**Do:**
- Assemble a **source dossier**: ≥ the archetype's required sources
  (`SOURCE_REQUIREMENTS.md` §3), each ranked by `evidence_level`.
- Build a **claim → source map** for every quantitative threshold the article
  will assert (ranges, doses, set-points).
- Flag where only general-horticulture (non-cannabis) evidence exists.

**Exit gate:** source count and evidence levels meet the archetype minimum; every
planned numeric claim has a candidate source. Otherwise the topic is parked
(insufficient evidence) rather than written on speculation.

---

## 3. Stage 2 — Draft

**Owner:** Author (or drafting agent).
**Input:** approved source dossier + the matching archetype template.
**Do:**
- Start from the correct template in [`templates/`](./templates/). Fill **every**
  one of the 16 blocks; mark any block `N/A — <reason>`.
- Write in the editorial register (mechanism-first, quantified, third person).
  No blog phrasing, hand-holding, SEO filler, or hype.
- Populate diagnostic chains in full for archetypes 1–5
  (`symptoms → causes → diagnosis → corrective_actions → preventive_measures`).
- Add inline citations as you assert numbers — never retrofit.
- Draft `relations` (typed) and `tool_links`.

**Output:** article record `status = draft`, version 1 in `knowledge_versions`.
**Exit gate:** template structurally complete; no placeholder text; no uncited
numeric claim; relations + tool links present.

---

## 4. Stage 3 — Fact check

**Owner:** Second agronomist / reviewer (not the author).
**Do:**
- Verify every numeric claim against its cited source; correct or remove
  unsupported numbers.
- Assign per-source `evidence_level`; set article `meta.evidence_level` = weakest
  load-bearing level.
- Compute `meta.confidence_score` (`SOURCE_REQUIREMENTS.md` §4).
- Confirm conflicts between sources are stated in-body.

**Exit gate:** `confidence_score` meets the archetype publication gate; zero
uncited or contradicted claims. Below gate → back to Research/Draft.

---

## 5. Stage 4 — Editorial review (four sign-offs)

**Owner:** Editorial lead, coordinating the four standard reviews (editorial
standard §8). Article moves to `status = in_review`; each review recorded in
`knowledge_reviews`.

1. **Agronomic review** — factual accuracy, mechanism correctness, safety.
2. **Source review** — every quantitative claim cited; evidence level adequate.
3. **Language review** — register, terminology, DE/EN parity (`LOCALIZATION.md`).
4. **Linkage review** — typed `relations` and `tool_links` present and correct.

**Exit gate:** all four reviews record `approved` in `knowledge_reviews`. Any
`changes_requested` routes back with notes.

---

## 6. Stage 5 — Publish

**Owner:** Editorial lead.
**Do:**
- Set `status = published`, `published_at`, `last_review_date`, and
  `review_horizon_months`.
- Compute `quality_score` (structural completeness × source strength × review
  status) and verify it clears the handbook-grade bar (≥ 65, per Phase 16).
- Activate the article in the user-visible set. **Note:** the legacy wiki
  (`apps/web/src/data/terpira/wiki.ts`) only surfaces slugs present in the
  `GROW_KNOWLEDGE` allowlist — publishing there additionally requires adding the
  slug with `growValue`/`qualityScore`/`growCategory`.
- Register the article in the **Knowledge Coverage Matrix**; recompute the
  affected area's coverage %.

**Exit gate:** article live, graph/tool links resolve, coverage metric updated.

---

## 7. Roles & throughput

| Stage | Primary role | Can be AI-assisted? | Human gate |
|-------|--------------|---------------------|-----------|
| Research | Researcher | Yes (retrieval) | Source adequacy sign-off |
| Draft | Author | Yes (template fill) | — |
| Fact check | Reviewer #2 | Partially | **Mandatory human** |
| Editorial review | Editorial lead + 3 reviewers | No | **Mandatory human ×4** |
| Publish | Editorial lead | No | Final human |

AI may accelerate Research and Draft; **fact check and editorial review are
human-gated** so scale never trades against accuracy. This is the mechanism that
satisfies the Phase 17 success criterion: *hundreds of expert-level articles
without quality degradation.*

---

## 8. Batch operating model

- Author **differential pairs/sets together** (e.g. a deficiency with its
  toxicity, look-alike pests, a stress with the deficiency it mimics) so the
  `diagnosis` blocks cross-reference cleanly.
- Run the backlog in priority waves (`CONTENT_BACKLOG.md`): diagnostic core first.
- After each wave, recompute the Coverage Matrix scorecard and the Phase 16
  quality metrics; do not start the next wave until the current one is published
  and measured.

---

## 9. Definition of done (per article)

- [ ] All 16 blocks filled or consciously `N/A`.
- [ ] Diagnostic chain complete (archetypes 1–5).
- [ ] Source & confidence gates met (`SOURCE_REQUIREMENTS.md`).
- [ ] Four editorial reviews `approved`.
- [ ] Typed relations + tool links resolve.
- [ ] `quality_score` ≥ 65; published and coverage metric updated.
