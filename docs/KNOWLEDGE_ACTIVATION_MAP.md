# Knowledge Activation Map (Phase 15)

> **North Star:** Every article helps a grower make a better decision.
>
> This document is the design record for Phase 15 — Knowledge Activation. It turns
> the Knowledge OS from a *content system* into a *decision system*. SecretLeaf
> stops being a wiki and becomes a cultivation decision platform: every article
> surfaces the tools, calculators and diagnoses that let a grower **act** on what
> they just read.

The activation layer is **data-driven, not hardcoded**. Relationships between
articles and tools live in the database (`knowledge_tools`, `knowledge_tool_tags`,
`knowledge_tool_links`) and are ranked at query time by a recommendation engine
(`knowledge_recommend_tools`). Editors curate relationships through the existing
staff write policies — no code change required.

---

## Phase A — Article analysis

Articles already live in normalized Supabase tables
(`supabase/migrations/202606020013_knowledge_os.sql`) and carry a shared
**tag taxonomy** (`knowledge_tags` / `knowledge_article_tags`) plus a
**category**. Those two signals — tags and category — are what make activation
scale: a new article is automatically matched to tools the moment it is tagged,
with zero bespoke wiring.

The actionable surfaces an article can drive:

| Surface         | Source of truth                                   |
| --------------- | ------------------------------------------------- |
| Diagnoses       | `apps/web/src/lib/diagnose/tree.ts` (decision trees) |
| Calculators     | `apps/web/src/lib/tools/registry.ts`              |
| Recommendations | `knowledge_recommend_tools` RPC (this phase)      |
| AI assistance   | `knowledge_hybrid_search` + graph context (existing) |

### Tool inventory (the registry)

Seeded into `knowledge_tools` by migration `202606020015_knowledge_activation.sql`:

| Slug                   | Kind        | Drives                                  |
| ---------------------- | ----------- | --------------------------------------- |
| `naehrstoff-rechner`   | calculator  | EC target & nutrient dosing             |
| `vpd`                  | calculator  | VPD target per growth phase             |
| `abluft-rechner`       | calculator  | Exhaust / air-exchange sizing           |
| `licht-rechner`        | calculator  | PPFD / DLI light intensity              |
| `ertrags-schaetzer`    | calculator  | Yield estimate from setup               |
| `plans`                | reference   | Structured grow / feed plans            |
| `diagnose-blaetter`    | diagnosis   | Leaf-symptom decision tree              |
| `diagnose-wachstum`    | diagnosis   | Growth / root decision tree             |
| `diagnose-klima`       | diagnosis   | Climate / environment decision tree     |
| `diagnose-schaedlinge` | diagnosis   | Pest decision tree                      |

---

## Phase B — Article → tool relationship design

Relevance is expressed through the **shared tag vocabulary**. Each tool is tagged
with the domain concepts it serves; each article is already tagged with the
concepts it covers. The overlap *is* the relationship. Two worked examples
(matching the problem statement):

```
Magnesium / nutrient-deficiency articles
  → diagnose-blaetter      (Deficiency / leaf diagnosis)   tag: naehrstoffmangel, blaetter
  → naehrstoff-rechner     (CalMag / nutrient calculator)  tag: naehrstoffe, duengung
  → naehrstoff-rechner     (pH within dosing)              tag: ph-wert
  → plans                  (Nutrient schedule)             tag: planung

Spider-mite / pest articles
  → diagnose-schaedlinge   (Pest diagnosis)                tag: schaedlinge
  → plans                  (Treatment / prevention plan)   tag: planung
```

### Article cluster → activation map

| Article cluster (example slugs)                                                                 | Tags (taxonomy)                          | Activated tools                                                        |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| Nutrients & feeding — `cannabis-substrat-und-wurzelzone`, `bewaesserung-ohne-uebergiessen`      | `naehrstoffe`, `naehrstoffmangel`, `ph-wert`, `duengung` | `naehrstoff-rechner`, `diagnose-blaetter`, `plans`        |
| Climate / VPD — `vpd-einfach-erklaert`, `vpd-und-ec-kombi-rechner-guide`                         | `klima`, `vpd`, `luftfeuchtigkeit`, `temperatur` | `vpd`, `abluft-rechner`, `diagnose-klima`                     |
| Light & canopy — `lichtstress-und-canopy-management`                                             | `licht`, `ertrag`                        | `licht-rechner`, `ertrags-schaetzer`                                  |
| Pests — `integrierte-schaedlingspraevention-grow`                                                | `schaedlinge`                            | `diagnose-schaedlinge`, `plans`                                       |
| Planning / yield — `grow-log-und-kpi-dashboard`, `how-to-grow-*-tutorial`                        | `planung`, `ertrag`                      | `ertrags-schaetzer`, `plans`                                          |

Relationships are **not** stored in code. The table above documents the *seed*;
the live mapping is whatever the `knowledge_tool_tags` rows say at query time.

---

## Phase C — Database architecture for tool linking

Migration: `supabase/migrations/202606020015_knowledge_activation.sql`
(rollback: `…_rollback.sql`). Three additions, all RLS-protected
(world-readable, staff-write), following existing knowledge-layer conventions.

1. **`knowledge_tools`** — a first-class registry of every actionable tool
   (`kind`, `slug`, `title`, `description`, `href`, `category`, `icon`,
   `is_active`, `position`). Replaces ad-hoc, per-article href strings with one
   reusable, taggable entity.
2. **`knowledge_tool_tags`** — junction linking tools to the shared
   `knowledge_tags` taxonomy with a `weight`. This is where the article↔tool
   relationship physically lives.
3. **`knowledge_tool_links.tool_id`** — a new optional FK so a curated, explicit
   link references a registry tool instead of pasting a raw href/label. Existing
   rows keep working.

> **No hardcoded links.** Application code never embeds article→tool mappings.
> It calls an RPC; the RPC reads relationships from these tables.

---

## Phase D — Recommendation engine

Function: `public.knowledge_recommend_tools(root_slug text, match_count int)`
(`STABLE`, read-only, returns active tools only).

Given an article it ranks registry tools by fusing three database-driven signals:

| Signal      | Source                                              | Weight                |
| ----------- | --------------------------------------------------- | --------------------- |
| `curated`   | `knowledge_tool_links` row with `tool_id` set       | `3.0` (hand-picked)   |
| `tag_match` | overlap of article tags ∩ tool tags                 | `Σ tag weight`        |
| `category`  | tool `category` = article category slug             | `0.5` (topical nudge) |

Scores are summed per tool, rounded, and ordered `score desc, position asc`. The
returned `reason` lists which signals fired (e.g. `curated,tag_match`) so the UI
can explain *why* a tool was suggested.

TypeScript access: `recommendTools()` in `apps/web/src/lib/knowledge/db.ts`.

---

## Phase E — Unified recommendation service

`recommendForArticle()` in `apps/web/src/lib/knowledge/service.ts` is the single
connected entry point. It fuses three subsystems into one decision surface:

```
Knowledge Graph  +  Tool Registry  +  Diagnosis System
        │                  │                  │
        └──────────────────┴──────────────────┘
                           ▼
              recommendForArticle(slug)
                           ▼
   { article, tools, diagnoses, calculators, relatedArticles }
```

- **tools / diagnoses / calculators** — ranked via `knowledge_recommend_tools`
  (diagnoses and calculators are the `kind`-filtered subsets, surfaced
  separately for the UI).
- **relatedArticles** — closest neighbours from `knowledge_graph_expand`
  (the existing graph traversal), so reading flows naturally continue.

HTTP surface: `GET /api/knowledge/recommend?slug=<slug>&tools=<n>&articles=<n>`
(public, CDN-cacheable, mirrors the existing `/api/knowledge/graph` route).

---

## Success criteria

- ✅ Tools, diagnoses and calculators are addressable from any article.
- ✅ Relationships are stored in the database, never hardcoded in code.
- ✅ Relevance is ranked, explainable, and scales to new articles via tags.
- ✅ Knowledge graph, tools and diagnoses are one connected system.

SecretLeaf is no longer a wiki. Every article now points the grower at the next
best action.
