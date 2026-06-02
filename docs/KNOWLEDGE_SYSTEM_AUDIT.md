# SecretLeaf — Knowledge System Audit (Phase 0)

> Deep system audit of the current knowledge / wiki surface, performed as the
> foundation for the migration to a Cannabis Knowledge Operating System.
>
> Owner: Product Engineering · Status: Active · Audited: 2026-06-02

---

## 1. Scope of the audit

This audit covers every layer that participates in delivering knowledge to the
user today:

- Routes & page architecture
- Components & layouts
- Data flow & content structure
- API usage
- Supabase usage
- Search architecture
- SEO implementation
- Analytics implementation

The goal is to establish an honest baseline before rebuilding the knowledge
layer as a normalized, AI-ready platform.

---

## 2. Current architecture map

### 2.1 Routes (App Router, `apps/web/src/app/[locale]`)

| Route | Purpose | Content source |
|-------|---------|----------------|
| `/studies` | Knowledge hub / article index | `data/terpira/wiki.ts` (hardcoded) |
| `/studies/[slug]` | Article detail page | `getArticleBySlug()` over hardcoded array |
| `/studies/deficiencies`, `/studies/pests`, `/studies/sources` | Curated sub-indexes | hardcoded arrays |
| `/category/[slug]` | Category listing | `wikiArticles.filter(...)` in memory |
| `/search` | Universal search | `lib/search/engine.ts` over hardcoded arrays |
| `/database/fertilizers` | Fertilizer catalog | `data/terpira/fertilizers.ts` (hardcoded) |
| `/diagnose`, `/tools`, `/grow` | Product surfaces | mixed (grow uses Supabase) |

### 2.2 Content store

- **Primary content:** `apps/web/src/data/terpira/wiki.ts` — **~4,900 lines** of
  TypeScript containing `wikiArticles: TerpiraArticle[]`, the `sourceRegister`,
  and category/difficulty label maps.
- **Context mapping:** `data/terpira/wikiContextMapping.ts` — **~2,200 lines** of
  rule-based grow-state → article triggers.
- **Fertilizers:** `data/terpira/fertilizers.ts` — **~1,450 lines**.
- The article model lives in `lib/terpira/types.ts` (`TerpiraArticle`,
  `TerpiraSection`, `TerpiraSource`, `TerpiraFaqItem`, …).

### 2.3 Data flow

```
data/terpira/wiki.ts  ──import──▶  page.tsx (RSC)  ──▶  HTML
                      ──import──▶  lib/search/engine.ts (in-memory index)
                      ──import──▶  category/[slug]/page.tsx (Array.filter)
```

All knowledge is **compiled into the JS bundle**. There is no runtime content
store, no editorial workflow, and no separation between content and code.

### 2.4 Supabase usage

Supabase **is** used in the product, but **not for knowledge**:

- `studies` table — user-submitted study records with a quality workflow
  (`quality_status`, review columns) and RLS (`202604050001`, `202604050002`).
- `grows`, `plants`, `log_entries` — grow journal (`202605010011`).
- `user_roles`, automation, engine config tables.

Knowledge articles, categories, tags, relations, FAQs, and references have **no
database representation** today.

### 2.5 Search architecture

- `lib/search/engine.ts` (v2): synonym expansion, intent detection, phrase-match
  and position bonuses, all-token-must-match completeness bonus.
- Index is built **in-memory on every request** from the hardcoded arrays.
- `/api/search/route.ts` wraps the engine.
- **No** full-text index, **no** vector/semantic search, **no** typo tolerance
  beyond synonyms, **no** ranking signals from real usage.

### 2.6 SEO implementation

- Per-route `generateMetadata()` sets `title` + `description` only.
- **No** structured data (`application/ld+json`): no Article, FAQ, Breadcrumb,
  or Entity schema anywhere in the tree (grep: 0 hits).
- **No** `sitemap.ts` / `robots.ts`.
- `generateStaticParams()` exists for categories but article params are derived
  from the hardcoded array, so SEO scale is bounded by the bundle.

### 2.7 Analytics implementation

- `lib/analytics.ts` — thin Plausible wrapper with typed helpers
  (`wikiArticleOpened(slug)`, `toolUsed`, …).
- Events are **fire-and-forget to Plausible**; nothing is persisted in Supabase.
- No scroll depth, reading completion, internal-link, graph-traversal, search-
  query, or tool-launch events are stored for later modelling.

---

## 3. Strengths

1. **Strong editorial seed.** The hardcoded corpus is already rich: structured
   sections, key takeaways, quick facts, FAQs, glossaries, a curated
   `sourceRegister`, difficulty levels, and `relatedSlugs`.
2. **A real article model already exists** (`TerpiraArticle`) — it maps cleanly
   onto a normalized schema, which de-risks migration.
3. **Tool-bridge intent is established** via `wikiContextMapping.ts` (grow-state
   → article triggers) — the relation layer can be formalized from it.
4. **Supabase + RLS conventions are mature** (`tg_set_updated_at`, owner
   policies, role-gated writes) and reusable for knowledge tables.
5. **Search engine quality** — relevance heuristics are thoughtful and provide a
   good keyword baseline to extend with FTS/vector.

---

## 4. Weaknesses

1. **Content is code.** Every edit requires a deploy. Non-engineers cannot
   author. No drafts, no review state, no versioning, no audit trail.
2. **No normalization.** Tags, categories, sources, and relations are embedded
   in each article object; there is no shared, queryable representation.
3. **Bundle bloat.** ~8,500 lines of content compiled into the client/runtime
   bundle; this grows linearly and unsustainably toward the 100k-article target.
4. **No graph.** `relatedSlugs` is a flat, untyped, manually-maintained string
   list — not a traversable, weighted, typed relation graph.
5. **No analytics persistence.** Behavioural data needed for recommendations and
   ranking is sent to Plausible and lost.
6. **No structured SEO.** Missing schema.org markup caps rich-result eligibility
   and entity understanding.
7. **No AI substrate.** No embeddings, no chunking, no retrieval surface for RAG.

---

## 5. Bottlenecks

- **Authoring throughput** is gated by engineering + deploy cycle.
- **Search relevance** cannot improve without persisted query/click data.
- **Build time & bundle size** scale with content count.
- **Cross-linking** is O(manual) and drifts as the corpus grows.

---

## 6. Technical debt

- Domain naming collision: knowledge articles live under the `studies` route and
  `terpira` namespace, while a separate `studies` **table** stores something
  different (user-submitted studies). This dual meaning is confusing.
- `TerpiraArticle` mixes presentation (`readMinutes`, label maps) with content.
- `relatedSlugs` requires bidirectional manual maintenance.
- Search re-indexes from scratch per request.

---

## 7. Scalability risks

| Risk | Trigger | Impact |
|------|---------|--------|
| Bundle size explosion | corpus > a few hundred articles | build/runtime failure |
| Manual relation rot | corpus growth | broken/incoherent graph |
| Search latency & relevance decay | corpus growth, no FTS | poor UX |
| No multi-author concurrency | editorial scaling | content bottleneck |
| SEO ceiling | no programmatic schema/sitemap | capped organic growth |
| AI readiness gap | RAG/diagnostics initiatives | rework, missed strategy |

---

## 8. Missing systems

- Normalized knowledge database (articles, categories, tags, relations, …).
- Knowledge graph (typed, weighted, traversable relations).
- Editorial workflow (draft/review/publish, versions, contributors).
- Persisted analytics / event store.
- Vector / semantic search & RAG retrieval surface.
- Programmatic SEO (schema.org + sitemap generation).
- Tool-integration relation layer (article ↔ diagnostics/calculators).

---

## 9. Migration opportunities

1. **Lift the existing corpus into Supabase** with a deterministic script — the
   `TerpiraArticle` shape maps directly onto the new tables (low-risk, automated).
2. **Derive the initial graph** from `relatedSlugs` + `wikiContextMapping.ts`
   triggers, then enrich.
3. **Promote `sourceRegister`** into `knowledge_sources` / `knowledge_references`.
4. **Replace in-memory search** with Postgres FTS first, then `pgvector`.
5. **Persist analytics** into an event table to seed the recommendation engine.
6. **Generate SEO** programmatically from DB rows once content is in Supabase.

---

## 10. Conclusion

The current system is a well-curated but **code-bound static wiki**. The content
quality and existing models are strong assets, but the architecture cannot reach
100,000+ articles, cannot power AI, and cannot collect the behavioural data the
strategy depends on. The migration path is low-risk because the existing models
map cleanly onto a normalized schema. The remaining phases of this initiative
build that schema, the graph, the editorial standard, the data-access layer, and
the migration tooling.
