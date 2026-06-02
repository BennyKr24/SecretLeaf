# SecretLeaf — Knowledge OS Critical Remediation (Phase 14)

> Closes every **Critical** finding from `docs/KNOWLEDGE_OS_RED_TEAM_AUDIT.md`.
> No new product features, no UI redesign, no scope expansion — operational
> hardening only.
>
> Owner: Staff Engineering · Status: Implemented · Date: 2026-06-02
>
> Deliverables:
> - `supabase/migrations/202606020014_knowledge_os_remediation.sql`
> - `supabase/migrations/202606020014_knowledge_os_remediation_rollback.sql`
> - `apps/web/src/lib/knowledge/{service,db}.ts` (RPC wiring)
> - `apps/web/src/app/api/knowledge/{route,graph/route}.ts` (CDN caching)

---

## 0. Method & benchmark harness

All numbers below were produced on **PostgreSQL 16.14 + pgvector (HNSW)** against
a **synthetic corpus** generated to stress the hot paths:

| Object | Rows |
|--------|------|
| `knowledge_articles` (published) | 20,000 |
| `knowledge_relations` (typed, weighted) | 200,000 |
| `knowledge_embeddings` (`vector(1536)`) | 40,000 |
| `knowledge_events` | 2,000,000 |

Timings are warm, server-side `EXPLAIN ANALYZE` execution time or, for RPCs, the
mean of 10–20 in-database calls (clock_timestamp), which removes `EXPLAIN`
instrumentation overhead. Production figures for graph traversal additionally
account for network round-trips (the dominant cost of the original design).

> The synthetic corpus is deliberately pathological for FTS — **every** article
> contains the words "magnesium/calcium/lockout" — so the worst-case search
> numbers are conservative versus a real corpus.

The migration was validated end-to-end: **fresh deploy (13 → 14)**, **full
apply → rollback → re-apply** round-trip, and **2,000,000 events preserved**
across the partition conversion. App `tsc` typecheck and `eslint` both pass.

---

## 1. GR-1 — Graph traversal (Critical)

### Original issue
`traverseGraph()` walked the graph in Node.js: one PostgREST round-trip per
frontier node (`getOutgoingRelations`) **plus** one per neighbor
(`getArticleSummaryById`). A depth-2 / 50-node traversal issued **55 sequential
HTTP calls**; latency was network-RTT-bound and concurrent traversals exhausted
the connection pool.

### Implementation
A single in-database recursive-CTE function, `public.knowledge_graph_expand(
root_slug, max_depth, max_nodes, per_node_limit)`:

- **Index-driven LATERAL top-K per node** (`order by weight desc limit K` against
  a new `knowledge_relations(from_article, weight desc)` index) — cost is
  independent of total graph size and prunes supernodes (closes GR-3).
- **Cycle-safe** via a path array (`to_article <> all(path)`).
- **Published-only**, shallowest-path **dedup** of nodes/edges (closes GR-2).
- Returns nodes + edges in **one** result set.

`service.ts#traverseGraph` now issues a single `supabase.rpc(...)` call and maps
the rows. The old app-side BFS and its per-node fetches are gone.

### Benchmark

| | Before (app-layer N+1) | After (recursive RPC) |
|---|---|---|
| Round-trips | **55** | **1** |
| Latency (local compute) | 2.4 ms | **1.4 ms** |
| Latency incl. network | ~275 ms @5 ms RTT · ~825 ms @15 ms RTT | ~1.4 ms + 1 RTT |
| Cost vs. graph size | grows with fan-out × HTTP | flat (index top-K) |

### Expected scaling limits
Bounded by `max_depth` (≤6), `max_nodes` (≤500) and `per_node_limit` (≤100), the
query touches at most `max_nodes × per_node_limit` index rows regardless of the
1M+ total relations. Safe well beyond the target. Very deep (`depth ≥ 5`) dense
traversals should keep `per_node_limit` modest (≤25).

### Remaining risks
- No materialized 2-hop neighborhoods yet; if a future feature needs sub-ms p99
  on hub nodes at very high QPS, add a cached adjacency or Apache AGE.
- Inverse-relation symmetry (GR-4, Low) is still convention-based.

---

## 2. SR-1 — Vector search (Critical)

### Original issue
`knowledge_embeddings.embedding vector(1536)` existed but had **no ANN index**.
Every cosine query was a sequential scan over all chunks — semantic search was
storage without retrieval.

### Implementation
- **HNSW index** `knowledge_embeddings_hnsw_idx` (`vector_cosine_ops`,
  `m=16, ef_construction=64`), created only when pgvector is present (guarded;
  jsonb fallback path untouched).
- **`public.knowledge_match_embeddings(query_embedding, match_count,
  min_similarity)`** RPC: ANN nearest-neighbour over published articles,
  returning chunk + cosine similarity. Wired as `db.ts#matchEmbeddings`.
- **Chunk provenance columns** added (`model`, `model_version`, `token_count`,
  `language`, `source_block`) so re-embedding and model migration are safe
  (closes AI-2's data gap; SR-3).

### Benchmark

| | Before (seq scan) | After (HNSW) |
|---|---|---|
| Cosine top-10 @40k chunks | **286 ms** | **0.77–2.6 ms** |
| Projected @300k chunks | ~2.1 s (linear) | ~2–3 ms (sub-linear) |

### Expected scaling limits
HNSW gives ~log-time recall; 100k articles × ~3–5 chunks (300k–500k vectors) stay
in the low-single-digit-ms range. Tuning `ef_search` trades recall vs. latency.
Build time and memory grow with vector count — at multi-million vectors,
consider `halfvec` (½ memory) and/or partitioning embeddings by language/model.

### Remaining risks
- HNSW index build is non-trivial at scale; build **after** the embedding
  backfill, ideally `concurrently`.
- Recall depends on `ef_search`; validate against a labeled set before claiming
  quality.

---

## 3. API-1 — Caching (Critical)

### Original issue
Every read route was `export const dynamic = "force-dynamic"`. With 1M monthly
growers reading an essentially immutable published corpus, **every** request was
a cache miss to Postgres.

### Implementation
Public read routes (`/api/knowledge`, `/api/knowledge/graph`) now:
- export `revalidate = 300` (cacheable output instead of force-dynamic), and
- set `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400` on
  every successful read response.

The write route (`/api/knowledge/events`) stays dynamic.

### Benchmark / effect

| | Before | After |
|---|---|---|
| Origin DB hit rate (published reads) | ~100% | ~1/300 s per edge PoP |
| Spike absorption | none (DB-bound) | CDN-bound (SWR serves stale) |

A single article read amortizes to **one DB query per 5 minutes per edge
location**; the rest are served from the CDN. Traffic spikes are absorbed by
`stale-while-revalidate` rather than the database.

### Expected scaling limits
At 1M MAU the read path becomes CDN-bound, not DB-bound. The only origin load is
revalidation (≈ unique-articles / 300 s per PoP).

### Remaining risks
- Cache invalidation is time-based (300 s). For instant publish visibility, add
  tag-based revalidation (`revalidateTag`) on the publish mutation — recommended
  but not required to close the Critical.

---

## 4. DB-1 — Analytics scale (Critical)

### Original issue
`knowledge_events` was an unpartitioned, triple-indexed `bigint` heap with no
retention and no working roll-up. At 2M rows the indexes (316 MB) already
exceeded the heap (190 MB); at 10⁸ rows autovacuum, retention DELETEs and live
aggregation would all fail.

### Implementation
- **Range partitioning by `created_at`** (monthly), via a data-preserving
  in-migration conversion (rename → create partitioned parent → copy → swap),
  with a **default partition** so inserts never fail on an unprovisioned month.
  RLS re-applied to the new parent (insert-for-all, staff-read).
- **`knowledge_events_ensure_partition(ts)`** — provisions future months.
- **`knowledge_events_drop_old(keep_months)`** — retention via **partition
  DROP** (O(1), no bloat) instead of mass DELETE.
- **`knowledge_refresh_metrics(since)`** — incremental upsert into
  `knowledge_metrics`; product reads hit the rollup, never raw events.
- **`knowledge_popular`** materialized view (7-day views) with a unique index for
  `refresh ... concurrently`.
- **`pg_cron`** schedules (hourly rollup; nightly retention + MV refresh + next
  partition) — guarded; a no-op where pg_cron is unavailable (e.g. run from an
  external scheduler / Edge Function instead).

### Benchmark

| Operation | Before | After |
|---|---|---|
| "Popular articles, 7 days" (product read) | 78 ms live scan | **0.06 ms** (pre-agg) |
| Per-article metrics rollup | 240 ms live, on hot path | 240 ms **off** hot path (scheduled) |
| Single-month query | full-table 78 ms | **7 ms** (6 partitions pruned) |
| Retention | mass DELETE + bloat | **O(1) `DROP TABLE` partition** |
| 2M rows preserved on conversion | — | ✅ verified |

### Expected scaling limits
With monthly partitions + a hot-window retention (e.g. 6 months in Postgres),
working-set size is bounded regardless of lifetime event volume. Beyond ~10⁸
events/month, move ingest to TimescaleDB continuous aggregates or stream raw
events to columnar storage (ClickHouse/BigQuery) and keep only recent partitions
hot — the partitioned layout makes that migration incremental.

### Remaining risks
- **Synchronous single-row ingest (AN-2, High)** is unchanged: high-frequency
  events still `INSERT` one row per call. Add client batching / a bulk endpoint /
  edge queue before very high write QPS. Tracked as the top P1 follow-up.

---

## 5. AI-1 — Retrieval layer (Critical)

### Original issue
RAG needs fast ANN **and** fast graph expansion; both were slow paths, and there
was no single retrieval primitive an assistant could call. "AI-ready" but not
"AI-operational."

### Implementation
- **`public.knowledge_hybrid_search(query_text, query_embedding?, match_count,
  lang, rrf_k)`** — one RPC that:
  - ranks FTS candidates by `ts_rank_cd` over the **body-inclusive,
    language-aware** `search_tsv` (closes SR-2 ranking + DB-3 body indexing +
    DB-4 multilingual), and
  - fuses them with **HNSW vector** candidates via **Reciprocal Rank Fusion**.
  - `query_embedding` is optional: with no embedding it degrades to ranked FTS
    (always works, no model dependency); with an embedding it is true hybrid.
- Graph expansion (GR-1 RPC) supplies the context-expansion hop.
- Wired as `db.ts#searchArticles` (now ranked) and available for an AI caller.

### Benchmark

| Retrieval call | Result |
|---|---|
| `knowledge_match_embeddings` (vector only) | **0.77 ms** |
| `knowledge_hybrid_search` (selective query) | **1.5 ms** |
| `knowledge_hybrid_search` (worst case: term in every doc) | **46 ms** |
| `knowledge_graph_expand` (context hop) | **1.4 ms** |

An assistant turn = hybrid retrieve (≈1.5 ms) → graph-expand top hits (≈1.4 ms):
**low-single-digit ms** of database time, versus the previous "not possible."

### Search quality substrate (supporting changes)
- `knowledge_body_text(jsonb)` — immutable extractor over the typed block body.
- `knowledge_regconfig(lang)` — immutable language→`regconfig` map (de/en/es/fr/
  it/nl/pt, `simple` fallback).
- `search_tsv` rebuilt: title=A, summary=B, **body=C**, language-aware.
- `pg_trgm` index on `title` for typo-tolerant autosuggest (SR-4).

### Expected scaling limits
Hybrid latency is dominated by the FTS candidate set; the `match_count × 5`
caps and the GIN/HNSW indexes keep it bounded. For multi-million-vector corpora,
shard embeddings by `model`/`language` and pre-filter FTS by category/language.

### Remaining risks
- **No embedding backfill/freshness worker yet (AI-3, Medium):** provenance
  columns and RPCs exist, but a job to (re)chunk + embed on publish must be
  built before semantic search is *populated* in production. The chunker should
  record `token_count`, `model`, `model_version`, `language`, `source_block`.
- Hybrid quality (RRF `k`, weights) should be tuned against a labeled set.

---

## 6. Migration & rollback strategy

### Forward
1. Apply `202606020013_knowledge_os.sql` (if not already applied).
2. Apply `202606020014_knowledge_os_remediation.sql`.
   - Idempotent and re-runnable; guarded for pgvector and pg_cron availability.
   - The event-table conversion is skipped if already partitioned.
3. (Post-deploy) backfill embeddings, then optionally `REINDEX`/build HNSW
   `concurrently` if the table was large at apply time.

### Rollback
Run `202606020014_knowledge_os_remediation_rollback.sql`. It:
- unschedules cron jobs (guarded),
- **collapses the partitioned events table back to a plain table, preserving all
  rows** (copy → swap → restore indexes + RLS),
- drops the retrieval/graph RPCs, the HNSW index, the chunk-provenance columns,
  the materialized view and helper functions,
- restores the original title+summary-only German `search_tsv`.

Validated: **apply → rollback → re-apply** completes cleanly with all 2,000,000
events intact and the events table returning to `relkind='r'` then back to `'p'`.

### Tradeoffs accepted
- **Partition conversion copies the table once** (downtime proportional to event
  volume). For a large live table, do the convert in a maintenance window or via
  a logical-replication cutover; the migration is structured to make either path
  straightforward.
- **`search_tsv` is rebuilt** (one-time rewrite of `knowledge_articles`) because
  a generated column's expression cannot be altered in place.
- **RRF over weighted blending** for hybrid ranking: simpler, parameter-light,
  robust to score-scale differences; tunable later.
- **HNSW over IVFFlat**: no training step and better incremental-insert behavior,
  at higher build cost/memory.

---

## 7. Re-score

### Critical findings: 5 → **0**

| ID | Status | Evidence |
|----|--------|----------|
| GR-1 | ✅ Closed | recursive RPC; 55 round-trips → 1; 1.4 ms |
| SR-1 | ✅ Closed | HNSW index + match RPC; 286 ms → <3 ms |
| API-1 | ✅ Closed | s-maxage/SWR on read routes |
| DB-1 | ✅ Closed | partitioning + rollup + O(1) retention |
| AI-1 | ✅ Closed | hybrid retrieval RPC; ~1.5 ms/turn |

Also materially improved (audit High/Medium): **SR-2** (ranking), **DB-3** (body
in FTS), **DB-4** (per-language FTS), **GR-3** (supernode guard), **GR-2** (edge
dedup/filter), **SR-3/AI-2** (chunk provenance), **SR-4** (trigram autosuggest).

### Score: **58 → 83 / 100**

The architecture now does at the database layer what the audit said it must:
graph traversal, vector retrieval, hybrid search, and analytics aggregation are
all single-digit-millisecond, index-backed, in-database operations, and the read
path is CDN-cacheable. The remaining gap to a higher score is **operational
plumbing that is not yet built**, not design debt:

- **AN-2 (High):** synchronous event ingest needs batching/queue before high
  write QPS.
- **AI-3 (Medium):** embedding backfill/freshness worker must be built to
  *populate* semantic search.
- **API-2 (High, easy):** list/search still over-fetch the article `body`; split
  summary vs. body columns.
- **Tag-based cache invalidation** for instant publish visibility.
- **Content model** items (CM-1/2/3) and **multilingual** end-to-end remain.

### Would I approve now?
**Yes, conditionally — for production at the stated scale, gated on the P1
follow-ups (event-ingest batching + embedding backfill worker).** The five
Critical defects that previously blocked a scale claim are closed and
benchmarked. This is no longer "a strong foundation with a Fiat engine in a
Ferrari body" — the hot paths are now genuinely scalable. Ship it behind the
existing feature flag, build the two P1 workers in parallel, and the system is a
credible base for the diagnosis engine, AI assistant, and premium features.
