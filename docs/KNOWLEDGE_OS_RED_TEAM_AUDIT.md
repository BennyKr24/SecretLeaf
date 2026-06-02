# SecretLeaf — Knowledge OS Red Team Audit (Phase 13)

> Adversarial, senior-staff-level audit of the Knowledge Operating System.
> The working assumption is that **the implementation is flawed** and must be
> proven survivable — not the other way around.
>
> Owner: Staff Engineering (Red Team) · Status: Active · Date: 2026-06-02
>
> Scope under test — the system must survive:
> - 1,000,000 monthly growers
> - 100,000 articles
> - 1,000,000+ graph relations
> - AI retrieval (RAG) workloads
> - recommendation engines
> - analytics workloads
> - future marketplace integrations
>
> Artifacts reviewed: `supabase/migrations/202606020013_knowledge_os.sql`,
> `apps/web/src/lib/knowledge/{db,service,types}.ts`,
> `apps/web/src/app/api/knowledge/**`, `supabase/seed/*`,
> `docs/KNOWLEDGE_OS_REPORT.md`, `docs/KNOWLEDGE_SYSTEM_AUDIT.md`.

---

## 0. How to read this document

Every issue is scored on four axes:

- **Severity** — blast radius if it fails (Critical / High / Medium / Low).
- **Impact** — what concretely breaks.
- **Probability** — likelihood of hitting it at the target scale
  (Certain / High / Medium / Low).
- **Recommended fix** — the corrective action.
- **Effort** — implementation cost (S = <1 day, M = 1–3 days,
  L = 1–2 weeks, XL = >2 weeks / cross-cutting).

Issue IDs are stable (`DB-1`, `GR-2`, …) so they can be tracked in follow-up PRs.

A consolidated severity table and a final 0–100 score are at the end.

---

## 1. Database

**What breaks first:** `knowledge_events`. It is an unpartitioned, append-only,
triple-indexed `bigint` table with no retention and no working roll-up job. At
1M growers it is the highest-volume object in the system, and it will degrade
(autovacuum pressure, index bloat, planner regressions) long before the article
corpus does.

### DB-1 — `knowledge_events` is unpartitioned and unbounded
- **Severity:** Critical
- **Impact:** At the target scale this table reaches 10⁸–10⁹ rows. A single
  heap + three B-tree indexes (`article_id`, `event_type`, `user_id`, each with
  `created_at`) means every insert touches four structures. Autovacuum cannot
  keep up, index bloat balloons, range scans for analytics walk hundreds of
  millions of rows, and any backfill/DELETE locks the hot ingest path. Retention
  by `DELETE` is impossible without massive bloat.
- **Probability:** Certain
- **Recommended fix:** Range-partition by `created_at` (monthly) via
  `pg_partman`, or move the event store to a TimescaleDB hypertable. Add a
  retention policy (drop/detach old partitions — O(1) vs. mass DELETE). Consider
  shipping raw events to an append-only columnar sink (e.g. object storage +
  ClickHouse/BigQuery) and keeping only recent partitions hot in Postgres.
- **Effort:** L

### DB-2 — No roll-up / aggregation job actually exists
- **Severity:** High
- **Impact:** `knowledge_metrics` is described as "maintained by a scheduled job"
  but no job ships. Every analytics read therefore aggregates raw
  `knowledge_events` live, which is exactly the query that gets slower as the
  table grows. Recommendations and "popular articles" will run full scans.
- **Probability:** High
- **Recommended fix:** Implement incremental aggregation — TimescaleDB
  continuous aggregates, or a `pg_cron` job that upserts `knowledge_metrics`
  from the latest partition watermark. Read metrics, never raw events, in
  product paths.
- **Effort:** M

### DB-3 — `search_tsv` indexes title + summary only, not the body
- **Severity:** High
- **Impact:** The generated `tsvector` covers `title` (weight A) and `summary`
  (weight B). The actual article content lives in `body jsonb` and is **never
  indexed for FTS**. Keyword search silently misses the majority of the text —
  a correctness/quality defect, not just a performance one.
- **Probability:** Certain
- **Recommended fix:** Extract plain text from the typed `body` blocks (a stored
  generated column over a `jsonb_to_tsvector`, or a maintained `body_text`
  column) and include it at weight C/D. Re-index.
- **Effort:** M

### DB-4 — Single hardcoded `'german'` FTS configuration
- **Severity:** High
- **Impact:** `knowledge_articles.language` exists and defaults to `'de'`, but
  the `tsvector` and every `textSearch(..., { config: 'german' })` call are
  hardcoded to German. English/Polish/Spanish content gets German stemming and
  stopwords → wrong results. Multilingual is a stated requirement and is not
  met.
- **Probability:** High (the moment a second language is added)
- **Recommended fix:** Per-language FTS: store a `regconfig` derived from
  `language`, build the `tsvector` with the matching config (generated column
  using a CASE or an immutable mapper function), and pass the right config at
  query time. Partial GIN indexes per language if needed.
- **Effort:** M

### DB-5 — OFFSET pagination allowed up to 100,000
- **Severity:** Medium
- **Impact:** `listArticles` uses `range(offset, …)` and the API permits
  `offset` up to 100,000. Postgres OFFSET scans and discards all preceding rows,
  so deep pages are O(offset). With 100k articles this is a cheap DoS vector and
  a slow path.
- **Probability:** Medium
- **Recommended fix:** Keyset / cursor pagination (`WHERE (published_at, id) <
  (:cursor)` ordered by the same tuple). Cap practical offset hard.
- **Effort:** S

### DB-6 — RLS predicate calls `is_knowledge_staff()` per qualifying row
- **Severity:** Medium
- **Impact:** `knowledge_articles_read` uses `status = 'published' OR
  is_knowledge_staff()`. The function is `STABLE` so Postgres can cache it within
  a statement, but the `user_roles` subquery still runs for staff reads and the
  OR prevents an index-only path in some plans. Across every knowledge table the
  same function is the write gate. At high read concurrency this is measurable
  overhead and a single function in every hot policy.
- **Probability:** Medium
- **Recommended fix:** Mark the helper `STABLE` (already) and wrap the
  `auth.uid()` lookup in `(select auth.uid())` to force one evaluation per
  statement (documented Supabase RLS optimization). Ensure `user_roles(user_id,
  role)` is indexed. Consider a JWT claim for role to avoid the table hit
  entirely.
- **Effort:** S

### DB-7 — `body jsonb` has no structural constraint
- **Severity:** Low
- **Impact:** Block typing is enforced only in TypeScript. The DB accepts any
  JSON, so a bad writer, a future service, or a manual fix can store malformed
  blocks that crash the renderer or the AI chunker.
- **Probability:** Medium
- **Recommended fix:** A `CHECK` validating top-level shape, or a JSON Schema
  validation trigger, or move blocks to a typed `knowledge_blocks` child table
  (see CM-1).
- **Effort:** M

---

## 2. Knowledge graph

**Can this realistically support millions of relations?** The *storage* model
can — typed, directed, weighted edges with `(from, type)` and `(to, type)`
indexes are correct and cheap. The *traversal* implementation cannot. It is the
single worst scaling defect in the system.

### GR-1 — Graph traversal is an application-layer N+1 (Critical)
- **Severity:** Critical
- **Impact:** `traverseGraph()` (service.ts) walks the graph in Node, not in
  Postgres. For every frontier node it issues `getOutgoingRelations` (one
  round-trip), then for **each** resulting edge issues a separate
  `getArticleSummaryById` (one round-trip per neighbor). With `maxNodes` up to
  500 and depth up to 5, a single graph request can fan out into **hundreds of
  sequential PostgREST round-trips**. Latency is dominated by network RTT × node
  count; p95 will be seconds, and concurrent requests will exhaust the
  connection pool. This is the opposite of "AI-ready retrieval."
- **Probability:** Certain
- **Recommended fix:** Push traversal into the database. Either a `WITH
  RECURSIVE` CTE (bounded by depth, with a `cycle` clause and a visited array)
  exposed as an RPC (`select … from knowledge_graph_expand(root, depth, limit)`),
  or adopt Apache AGE / a materialized adjacency for hot neighborhoods. Return
  nodes + edges in **one** query. The app-side BFS should be deleted.
- **Effort:** M

### GR-2 — Edges emitted without dedup / published filter
- **Severity:** Medium
- **Impact:** `traverseGraph` pushes every relation into `edges` before checking
  visited/published, so the response can contain edges pointing to unpublished or
  already-visited nodes, and duplicate edges across BFS layers. Consumers
  (and AI context builders) must defensively dedup.
- **Probability:** High
- **Recommended fix:** Filter edges to published, deduplicate
  `(from,to,type)`, and join publication status inside the recursive query
  (fixed naturally by GR-1).
- **Effort:** S

### GR-3 — No supernode / fan-out protection
- **Severity:** Medium
- **Impact:** With 1M+ relations some hub articles (e.g. "pH", "Nutrient
  Lockout") will accumulate thousands of edges. Traversal expands all of them;
  weight is read but never used to prune. One hot node blows the `maxNodes`
  budget with low-value edges.
- **Probability:** Medium
- **Recommended fix:** Weight-ordered, top-K-per-node expansion in the recursive
  query (`order by weight desc limit k` per hop), plus a degree cap. Use `weight`
  as the pruning signal it was designed to be.
- **Effort:** S

### GR-4 — No inverse-relation integrity
- **Severity:** Low
- **Impact:** The enum models paired relations (`causes`/`caused_by`,
  `parent`/`child`, `symptom_of`/`treats`) but nothing enforces or auto-creates
  the inverse edge. The graph can become semantically asymmetric, which degrades
  diagnostic/AI traversal that assumes bidirectionality.
- **Probability:** Medium
- **Recommended fix:** A trigger to maintain inverse edges, or a documented
  convention + a nightly consistency check. Alternatively treat the graph as
  undirected-with-type at query time.
- **Effort:** S

---

## 3. Search

**Will search become a bottleneck?** Yes — first on **quality**, then on
**capability**. The FTS baseline is structurally incomplete (body not indexed,
single language, no ranking) and the advertised "vector search readiness" is not
actually queryable at scale because the ANN index is missing.

### SR-1 — Embeddings have no ANN index (Critical for AI search)
- **Severity:** Critical
- **Impact:** `knowledge_embeddings.embedding vector(1536)` is created, but **no
  `ivfflat` or `hnsw` index** is built. Any cosine/`<=>` query is a sequential
  scan over every chunk of every article. At 100k articles × N chunks this is
  hundreds of thousands to millions of vectors scanned per query — semantic
  search and RAG retrieval are effectively non-functional at scale despite being
  the headline AI feature.
- **Probability:** Certain
- **Recommended fix:** Add an HNSW index (`vector_cosine_ops`) once content is
  backfilled; size `ivfflat` lists or HNSW `m/ef_construction` for the corpus.
  Gate on extension availability as the migration already does for the table.
- **Effort:** S (plus backfill)

### SR-2 — No relevance ranking applied
- **Severity:** High
- **Impact:** `searchArticles` filters with `textSearch` but never orders by
  `ts_rank`/`ts_rank_cd`; results come back in physical/arbitrary order, and
  `total` is reported as `results.length` (the page size, not the real count).
  Ranking quality is effectively random within the matched set.
- **Probability:** Certain
- **Recommended fix:** Order by weighted `ts_rank_cd(search_tsv, query)`;
  return a real `count` via a windowed `count(*) over ()` or a separate count.
  Layer hybrid scoring (FTS + vector cosine) once SR-1 lands.
- **Effort:** S

### SR-3 — Vector model/dimension is hardcoded
- **Severity:** Medium
- **Impact:** `vector(1536)` locks the system to a 1536-dim model (OpenAI
  `text-embedding-3-small`/ada). Switching to a better/cheaper model with a
  different dimension requires a schema migration and full re-embed, and there is
  no `model`/`model_version` column to support safe dual-write migration.
- **Probability:** Medium
- **Recommended fix:** Add `model text` + `dim int` columns (and/or a separate
  table per model), or use `halfvec`/multiple vector columns. Make the dimension
  a deployment decision, and record provenance per row to allow re-embedding.
- **Effort:** M

### SR-4 — No typo tolerance / fuzzy matching
- **Severity:** Low
- **Impact:** No `pg_trgm` similarity for misspellings, partial slugs, or
  autocomplete. Cannabis/agronomy terms are easily mistyped; pure `tsvector`
  matching returns nothing for near-misses.
- **Probability:** Medium
- **Recommended fix:** Add a `gin_trgm_ops` index on title and a trigram
  fallback / `similarity()` ranking for autosuggest.
- **Effort:** S

---

## 4. Analytics

**What happens after 100 million events?** With the current design: table and
index bloat, autovacuum falling behind, slow aggregations, and an expensive,
lock-prone retention story. See DB-1 / DB-2 — they are the analytics story and
are the system's second-most-serious scaling risk after graph traversal.

### AN-1 — No retention strategy
- **Severity:** High
- **Impact:** Events accumulate forever. Storage grows linearly and unbounded;
  there is no TTL, no cold tiering, no partition drop. Cost and operational risk
  grow without limit.
- **Probability:** Certain
- **Recommended fix:** Partition by time (DB-1) and detach/drop partitions on a
  retention window (e.g. 90 days hot in Postgres, raw history in cheap columnar
  storage).
- **Effort:** M (depends on DB-1)

### AN-2 — Ingestion path is a synchronous single-row insert
- **Severity:** Medium
- **Impact:** `recordEvent` does one `INSERT` per event through PostgREST, on a
  `force-dynamic` route. High-frequency events (`scroll_depth`) will hammer the
  primary and the connection pool at 1M growers. No batching, no queue, no
  backpressure.
- **Probability:** High
- **Recommended fix:** Client-side batching + a bulk insert endpoint, or an edge
  queue (e.g. write to a log/stream, drain in batches). Sample high-frequency
  event types.
- **Effort:** M

### AN-3 — Unbounded `session_id` / high-cardinality user index
- **Severity:** Low
- **Impact:** `session_id text` is unvalidated free text, and the
  `(user_id, created_at)` index on a mostly-anonymous, high-cardinality column is
  large and rarely selective for product reads.
- **Probability:** Medium
- **Recommended fix:** Constrain `session_id` length/format; reconsider the
  per-user index in favor of partition-local indexes and pre-aggregated
  per-user metrics.
- **Effort:** S

---

## 5. API layer

**Can this survive production traffic?** Not as written. Two structural issues
dominate: **everything is `force-dynamic` (no caching)** and the **graph route
inherits the N+1**. Published knowledge is the most cacheable content imaginable,
yet every request hits the database.

### API-1 — All routes are `force-dynamic`; no caching layer
- **Severity:** Critical
- **Impact:** `/api/knowledge`, `/api/knowledge/graph`, and the pages are
  `export const dynamic = "force-dynamic"`. With 1M monthly growers reading a
  near-static published corpus, every read is a cache miss to Postgres. No ISR,
  no CDN/`s-maxage`, no `stale-while-revalidate`. This is the most expensive
  possible way to serve immutable content and will not survive a traffic spike.
- **Probability:** Certain
- **Recommended fix:** Cache aggressively: ISR / `generateStaticParams` for
  article and category pages, `Cache-Control: s-maxage … stale-while-revalidate`
  on the public GET routes, and tag-based revalidation on publish. Reserve
  dynamic rendering for personalized/staff paths only.
- **Effort:** M

### API-2 — List endpoint over-fetches the full `body`
- **Severity:** High
- **Impact:** `listArticles` and `searchArticles` select `ARTICLE_SUMMARY_COLUMNS`
  which **includes `body jsonb`**. Index/list and search responses drag the
  entire article body for every row — large payloads, wasted bandwidth, and heap
  reads of TOASTed jsonb on a hot path that only needs title/summary.
- **Probability:** Certain
- **Recommended fix:** Split summary columns from the body; never select `body`
  for list/search. (The mapper `mapSummary` already ignores it — the column is
  pure waste.)
- **Effort:** S

### API-3 — Category filter adds an extra round-trip
- **Severity:** Low
- **Impact:** Filtering by category does a separate `knowledge_categories`
  lookup before the main query (two round-trips). Minor, but multiplied across
  traffic and avoidable.
- **Probability:** Medium
- **Recommended fix:** Join on category slug in one query (PostgREST embedded
  filter or an RPC), or cache the slug→id map.
- **Effort:** S

### API-4 — Edge compatibility unverified
- **Severity:** Low
- **Impact:** Routes use the server Supabase client and `force-dynamic`; none
  declare `runtime = "edge"`. Global growers will see origin-region latency.
  Edge readiness (a stated concern) is unproven.
- **Probability:** Medium
- **Recommended fix:** Confirm the data client runs on the edge runtime or front
  reads with a CDN (ties into API-1); measure cross-region latency.
- **Effort:** M

---

## 6. Content model

**Will future content operations become painful?** Moderately. The typed-block
`jsonb` body is flexible and good for AI chunking, but it trades away DB-level
integrity and makes block-level querying/versioning coarse.

### CM-1 — Body integrity lives only in TypeScript
- **Severity:** Medium
- **Impact:** See DB-7. No schema enforcement, no block-level addressing, no
  partial updates — a single-character edit rewrites the whole body and a whole
  version row.
- **Probability:** Medium
- **Recommended fix:** Either validate the block array (CHECK/trigger/JSON
  Schema) or normalize into a `knowledge_blocks` child table for block-level
  querying and targeted re-chunking.
- **Effort:** M

### CM-2 — Versioning is full-body copies with no automation or diff
- **Severity:** Medium
- **Impact:** `knowledge_versions` stores a full `body` copy per version and is
  not written by any trigger — versioning depends on the app remembering to do
  it. At scale this is large duplicated jsonb and an easy correctness gap (missed
  versions).
- **Probability:** Medium
- **Recommended fix:** Auto-snapshot on publish via trigger; store diffs or
  compress; or adopt an event-sourced edit log. Add a retention/compaction
  policy for old versions.
- **Effort:** M

### CM-3 — No editorial workflow enforcement
- **Severity:** Low
- **Impact:** `status` and `knowledge_reviews` exist but nothing enforces
  transitions (draft → in_review → published requires an approved review).
  Anyone with staff write can publish unreviewed content.
- **Probability:** Medium
- **Recommended fix:** A state-transition trigger/policy requiring an `approved`
  review before `published`, plus an audit trail.
- **Effort:** M

---

## 7. AI readiness

**Can an AI assistant actually use this efficiently?** Conceptually yes — typed
graph edges (`causes`/`symptom_of`/`treats`) plus chunked embeddings is the right
substrate. **Operationally, no, not yet**: the vector index is missing (SR-1),
graph retrieval is N+1 (GR-1), chunking is undefined, and there is no hybrid
query. The "AI-ready" claim is aspirational until these land.

### AI-1 — Retrieval primitives are not queryable at scale
- **Severity:** Critical
- **Impact:** RAG needs (a) fast ANN over embeddings and (b) fast graph
  expansion. Both are currently slow paths (SR-1 missing ANN index; GR-1
  app-side BFS). An assistant doing per-turn retrieval over this would see
  multi-second latencies and pool exhaustion.
- **Probability:** Certain
- **Recommended fix:** Land SR-1 (HNSW) and GR-1 (recursive RPC), then expose a
  single hybrid retrieval RPC: vector top-K → graph-expand neighbors → rerank.
- **Effort:** L (covered by SR-1 + GR-1 + glue)

### AI-2 — Chunking strategy is undefined / unversioned
- **Severity:** High
- **Impact:** `knowledge_embeddings` has `chunk_index` + `content` but no token
  counts, no overlap, no `model`/`model_version`, no `language`, no link back to
  the source block. There is no defined chunker. Re-embedding, evaluating
  retrieval quality, or mixing models is unsafe.
- **Probability:** High
- **Recommended fix:** Define a deterministic, block-aware chunker (token-bounded
  with overlap), and record `model`, `model_version`, `token_count`, `language`,
  and source-block reference per chunk (pairs with SR-3).
- **Effort:** M

### AI-3 — No embedding freshness / backfill pipeline
- **Severity:** Medium
- **Impact:** Nothing keeps embeddings in sync with edits. A published edit
  silently leaves stale vectors; there is no job, queue, or dirty-flag.
- **Probability:** High
- **Recommended fix:** A `needs_embedding` flag or outbox on article
  insert/update + a worker that (re)chunks and embeds. Invalidate on publish.
- **Effort:** M

---

## 8. Design decisions — challenged

| Decision (as built) | Challenge | Superior alternative |
|---|---|---|
| **App-layer BFS** for graph traversal | Per-node network round-trips; the worst hot path in the system | `WITH RECURSIVE` RPC / Apache AGE; one query, weight-pruned, published-filtered |
| **`force-dynamic` everywhere** | Treats immutable published content as uncacheable | ISR + CDN `s-maxage`/SWR + tag revalidation on publish |
| **Single `'german'` FTS config** | Breaks the moment a 2nd language exists; ignores `language` column | Per-language `regconfig`-driven tsvector + query config |
| **FTS over title+summary only** | Silently un-searchable body | Generated `body_text` tsvector at weight C/D |
| **`vector(1536)` table, no ANN index** | "Vector-ready" but every query is a seq scan; model locked | HNSW index + `model`/`dim` provenance columns |
| **Unpartitioned `knowledge_events`** | Dies under retention + autovacuum at 10⁸ rows | Time-partitioned (pg_partman) or TimescaleDB + continuous aggregates + retention |
| **`body jsonb`, TS-only typing** | No DB integrity; coarse versioning | CHECK/JSON-Schema validation, or normalized `knowledge_blocks` |
| **Full-body version copies, manual** | Storage blow-up + missed versions | Trigger-driven snapshots, diffed/compressed |
| **Synchronous single-row event insert** | Pool pressure from high-frequency events | Client batching / bulk endpoint / edge queue + sampling |
| **`OFFSET` pagination to 100k** | O(offset) deep pages, cheap DoS | Keyset/cursor pagination |
| **Metrics "by scheduled job" (absent)** | Live aggregation of the biggest table | Incremental roll-up via continuous aggregate / pg_cron |

What the design got **right** (worth preserving): normalized core schema with
sensible FKs and `on delete` semantics; a typed/weighted/directed relation model
with correct `(from,type)`/`(to,type)` indexes and a self-loop CHECK; RLS that
defaults to published-only public reads with a staff write gate; graceful
pgvector fallback; generated `updated_at` triggers; idempotent seed + rollback.
The **bones are good** — the failures are in operationalization at scale.

---

## 9. Consolidated issue register

| ID | Area | Issue | Severity | Probability | Effort |
|----|------|-------|----------|-------------|--------|
| GR-1 | Graph | App-layer N+1 traversal | Critical | Certain | M |
| SR-1 | Search | No ANN index on embeddings | Critical | Certain | S |
| API-1 | API | `force-dynamic`, no caching | Critical | Certain | M |
| DB-1 | DB | Unpartitioned/unbounded events | Critical | Certain | L |
| AI-1 | AI | Retrieval primitives not scale-queryable | Critical | Certain | L |
| DB-2 | DB | No working roll-up job | High | High | M |
| DB-3 | DB | Body excluded from FTS | High | Certain | M |
| DB-4 | DB | Single hardcoded FTS language | High | High | M |
| SR-2 | Search | No relevance ranking / fake total | High | Certain | S |
| AN-1 | Analytics | No retention strategy | High | Certain | M |
| AN-2 | Analytics | Synchronous single-row ingest | Medium | High | M |
| API-2 | API | List/search over-fetch `body` | High | Certain | S |
| AI-2 | AI | Chunking undefined/unversioned | High | High | M |
| AI-3 | AI | No embedding freshness pipeline | Medium | High | M |
| GR-2 | Graph | Edges not deduped/filtered | Medium | High | S |
| GR-3 | Graph | No supernode fan-out guard | Medium | Medium | S |
| SR-3 | Search | Hardcoded vector dim/model | Medium | Medium | M |
| DB-5 | DB | OFFSET pagination to 100k | Medium | Medium | S |
| DB-6 | DB | RLS function per-row cost | Medium | Medium | S |
| CM-1 | Content | Body integrity TS-only | Medium | Medium | M |
| CM-2 | Content | Manual full-body versioning | Medium | Medium | M |
| API-3 | API | Extra round-trip on category | Low | Medium | S |
| API-4 | API | Edge compatibility unverified | Low | Medium | M |
| DB-7 | DB | No body structural constraint | Low | Medium | M |
| GR-4 | Graph | No inverse-relation integrity | Low | Medium | S |
| SR-4 | Search | No fuzzy/typo tolerance | Low | Medium | S |
| AN-3 | Analytics | Unbounded session id / heavy index | Low | Medium | S |
| CM-3 | Content | No workflow enforcement | Low | Medium | M |

**Totals:** 5 Critical · 6 High · 8 Medium · 9 Low.

### Recommended remediation order (highest leverage first)
1. **API-1** (caching) — biggest cost/availability win, lowest risk.
2. **SR-1 + SR-2** (ANN index + ranking) — makes search/AI actually work.
3. **GR-1 (+GR-2, GR-3)** — recursive RPC; removes the worst latency path.
4. **DB-1 + DB-2 + AN-1** — partition events, roll-ups, retention.
5. **DB-3 + DB-4** — body-in-FTS + per-language search.
6. **AI-2 + AI-3 + SR-3** — chunking contract + freshness + model provenance.
7. **API-2** and the remaining Medium/Low items.

---

## 10. Verdict

### Score: **58 / 100**

A genuinely well-structured **foundation** that is **not yet production-grade for
the stated scale**. The relational core, the typed graph model, the RLS posture,
and the migration tooling are above-average staff-level work — this is not a toy
schema. But the system is scored on whether it survives 1M growers, 100k
articles, 1M+ relations, and live AI retrieval, and against that bar it has
**five Critical defects that each independently break a headline capability**:

- graph traversal is an N+1 that melts under concurrency (GR-1),
- "vector search" has no vector index and is a sequential scan (SR-1),
- the entire read path is uncacheable `force-dynamic` (API-1),
- the event store is unpartitioned and will not survive retention (DB-1),
- and therefore the AI retrieval story is aspirational, not operational (AI-1).

None of these are architectural dead-ends; they are missing operational layers
on top of a sound model. That is why the score is a 58 and not a 30 — the
redesign cost is low and the bones are reusable.

### Would I approve this architecture for a venture-backed company?

**Not as-is — conditional approval.** I would **block** a production launch at the
target scale, but I would **fund the team and the direction**. The schema and
data model are a credible Series-A-grade foundation; the gaps are a well-bounded,
~2–4 week remediation (caching, ANN index + ranking, recursive graph RPC, event
partitioning + roll-ups, body/multilingual FTS) rather than a rewrite.

**Approval is contingent on closing all five Critical issues and the High-severity
search/analytics items before any scale claim is made.** Ship the caching and
search/graph fixes first — they are the difference between a convincing demo and
a system that survives its own success. Until then, the honest status is
**"strong foundation, not yet production-ready."**
