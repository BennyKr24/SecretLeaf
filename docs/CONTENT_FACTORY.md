# SecretLeaf — Content Factory (Phase 17)

> **The bottleneck is no longer infrastructure. It is knowledge coverage and
> article quality.** Phase 17 does not write articles — it builds the **system**
> that produces hundreds of expert-level articles without quality degradation.
>
> Owner: Product Engineering · Editorial & Agronomy · Status: Active ·
> Date: 2026-06-02 · Version: 1.0

---

## 1. Why this phase exists

Phase 16 (`docs/CONTENT_QUALITY_AUDIT.md`) inverted the assumed problem. The
technical foundation is strong; the content is the weak point:

| Area | Score |
|------|:-----:|
| Data | 9/10 |
| Architecture | 8.5/10 |
| AI foundation | 8.5/10 |
| Diagnosis foundation | 8/10 |
| **Content quality** | **5/10** |
| **Content coverage** | **4/10** |
| Market potential | 9/10 |

Concretely: 82 article definitions, only 37 published, mean quality 49.5/100,
51% tier-D, and — the decisive finding — the **diagnostic core (deficiencies,
diseases, pests) sits at 0% handbook-grade coverage**. *"Magnesium Deficiency
does not exist."* Those 30–50 diagnostic articles create more user value than 500
more generic wiki pages.

The strategic response is not to hand-write articles one by one. It is to
**industrialize article production**: a coverage map, canonical templates, source
discipline, and a repeatable pipeline so quality is structural, not heroic.

---

## 2. The five phases

| Phase | Deliverable | Purpose |
|-------|-------------|---------|
| **A** | [`KNOWLEDGE_COVERAGE_MATRIX.md`](./KNOWLEDGE_COVERAGE_MATRIX.md) | Map the whole target domain; expose every gap as a % and a named item. |
| **B** | [`content-factory/templates/`](./content-factory/templates/) | Six canonical archetype templates, each a strict 16-block instance. |
| **C** | [`content-factory/SOURCE_REQUIREMENTS.md`](./content-factory/SOURCE_REQUIREMENTS.md) | Mandatory evidence level, references, confidence score, review date. |
| **D** | [`content-factory/ARTICLE_WORKFLOW.md`](./content-factory/ARTICLE_WORKFLOW.md) | Research → Draft → Fact Check → Editorial Review → Publish. |
| **E** | [`CONTENT_BACKLOG.md`](./CONTENT_BACKLOG.md) | Top-100 prioritized build order (demand × diagnosis × AI × tool). |

Grounding documents:
- [`CANNABIS_EDITORIAL_STANDARD.md`](./CANNABIS_EDITORIAL_STANDARD.md) — the binding
  register and 16-block schema every template instantiates.
- [`CONTENT_QUALITY_AUDIT.md`](./CONTENT_QUALITY_AUDIT.md) — Phase 16, the trigger.

---

## 3. The six article archetypes

Each maps to one template and to `KnowledgeBlockType` in
`apps/web/src/lib/knowledge/types.ts`:

1. **Nutrient deficiency** — `MedicalCondition`
2. **Nutrient toxicity / excess** — `MedicalCondition`
3. **Pest** — `Thing`
4. **Disease** — `MedicalCondition`
5. **Environmental stress** — `MedicalCondition`
6. **Cultivation technique** — `HowTo`

Archetypes 1–5 are **diagnostic**: they must carry the full
`symptoms → causes → diagnosis → corrective_actions → preventive_measures` chain.
That chain is the substrate for the future diagnosis tool, AI assistant, and
image diagnosis — so it is the part the factory protects most.

---

## 4. How an article flows through the factory

```
Backlog item (E) ─▶ pick archetype template (B) ─▶ assemble sources to spec (C)
        │
        ▼
   Research ─▶ Draft ─▶ Fact Check ─▶ Editorial Review (×4) ─▶ Publish   (D)
        │                                                          │
        └────────────── recompute Coverage Matrix (A) ◀────────────┘
```

Fact-check and the four editorial reviews are **human-gated**; Research and Draft
may be AI-accelerated. This is the precise mechanism that lets volume scale
without quality regression.

---

## 5. No new infrastructure

Per the Phase 16/17 mandate, this phase adds **no database, search, or
infrastructure changes**. Every field it relies on already exists:
`knowledge_articles.body` (typed blocks), `knowledge_sources.evidence_level`,
`knowledge_references`, `knowledge_relations`, `knowledge_reviews`,
`knowledge_versions`, and `knowledge_articles.meta` (jsonb) for
`confidence_score` / `last_review_date`. The factory is process and content
design over the existing Knowledge OS.

---

## 6. Success criterion

> SecretLeaf can systematically create hundreds of expert-level articles without
> quality degradation.

Operationalized:
- Diagnostic-core coverage ≥ 80% handbook-grade (from 0%).
- No domain area below 50% coverage.
- Every published article ≥ tier B (CQ ≥ 65) with `confidence_score` above its
  archetype gate.
- The pipeline, not individual effort, guarantees the above — repeatably.

**Next action:** execute `CONTENT_BACKLOG.md` Wave 1 (diagnostic core) through the
workflow. That is content production, deliberately out of scope for this phase,
which delivers only the system.
