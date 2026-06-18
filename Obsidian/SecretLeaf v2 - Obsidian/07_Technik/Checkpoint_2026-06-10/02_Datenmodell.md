---
tags: [technik, audit, checkpoint, datenmodell, supabase]
status: Aktiv
verknüpft: ["[[00_Uebersicht]]", "[[02_Datenbankarchitektur]]", "[[07_Entitaetsmodell]]"]
---

# SecretLeaf — Datenmodell (vollständig, Stand 10.06.2026)

> Teil des Checkpoints [[00_Uebersicht]]. Vergleich mit dem strategischen Plan: [[02_Datenbankarchitektur]], [[07_Entitaetsmodell]].

Quelle: alle 16 Dateien unter `supabase/migrations/` (chronologisch `202604050001` bis `202606020015`, inkl. Rollback-Varianten) sowie `supabase/seed/knowledge_seed.sql` / `knowledge_rollback.sql`.

> **Wichtig**: `public.studies` wird in keiner der gelesenen Migrationen `CREATE TABLE`-erstellt. Die Tabelle muss aus einer Basis-Migration stammen, die nicht im Repo liegt (oder direkt im Supabase Dashboard angelegt wurde). Die Basisspalten (`id`, `tags`, `title`, `source`, …) sind daher **nicht aus dem Repo rekonstruierbar** — siehe Anomalie #1 unten.

---

## Tabellen (finaler Stand nach allen Migrationen)

### `public.user_roles`
| Spalte | Typ | Default | Nullable |
|---|---|---|---|
| user_id | uuid | — | PK, NOT NULL |
| role | text | `'CONSUMER'` | NOT NULL |
| created_at | timestamptz | now() | NOT NULL |
| updated_at | timestamptz | now() | NOT NULL |

- PK `user_id`; FK `user_id → auth.users(id)` ON DELETE CASCADE
- CHECK `role in ('CONSUMER','PROVIDER','ADMIN','TEAM')` (final, nach 3 Migrationsänderungen: 1 → 8 → 10)
- Trigger `trg_user_roles_updated_at` (BEFORE UPDATE → `tg_set_updated_at`)
- RLS: `user_roles_select_own` (SELECT, eigener Datensatz), `user_roles_insert_own_consumer` (INSERT, nur `role='CONSUMER'`). **Kein UPDATE/DELETE Policy** — Rollenvergabe (ADMIN/TEAM) nur via Service-Role.
- Migration 10 enthält einen hartkodierten `DO $$`-Block, der `gimber.l@web.de` die Rolle `TEAM` zuweist — **schlägt fehl, wenn dieser User nicht existiert** (nicht portabel auf neue Umgebungen).

### `public.studies` (Basistabelle nicht im Repo, nur Erweiterungen bekannt)
Spalten aus Migration 2 (`202604050002`):
| Spalte | Typ | Default | Nullable |
|---|---|---|---|
| quality_status | text | `'pending'` | NOT NULL, CHECK in ('good','pending','bad') |
| reviewed_by | uuid | — | FK → auth.users(id) |
| reviewed_at | timestamptz | — | nullable |
| review_note | text | — | nullable |
| source_fingerprint | text | — | nullable |

Spalten aus Migration 6 (`202604100006`):
`doi, study_type, evidence_level (int), publisher_quality (int), topic_fit (int), relevance_score (int), editorial_priority (CHECK high|medium|low), matched_topics (text[] default '{}'), flags (text[] default '{}'), first_author, abstract_snippet, origin_label, affiliation_hints (text[]), review_summary (text[]), fetched_at`

Indizes: `studies_source_fingerprint_uidx` (UNIQUE, dedupliziert in Migration 4), `studies_quality_status_created_at_idx`, `studies_reviewed_by_idx`, `studies_relevance_score_idx`, `studies_editorial_priority_idx`, `studies_study_type_idx`, `studies_doi_idx` (partial), `studies_fetched_at_idx`, `studies_matched_topics_gin_idx`, `studies_flags_gin_idx`.

RLS (final, Migration 3 "rls_hardening"):
- `studies_select_authenticated` (SELECT, `using(true)`)
- `studies_insert_authenticated` (INSERT, `with check(true)`)
- `studies_update_provider_only` / `studies_delete_provider_only` (nur `role='PROVIDER'`)

> **Anomalie**: Die UPDATE/DELETE-Policies prüfen ausschließlich `role='PROVIDER'`. Nach Einführung von `ADMIN` (Mig 8) und `TEAM` (Mig 10) wurden diese Policies **nie aktualisiert** — ADMIN/TEAM-User können `studies` über RLS (Session-Client) nicht ändern/löschen, nur via Service-Role.

### `public.automation_job_runs` (Migration 5)
`id (uuid PK), job_name, started_at, finished_at, success (bool), fetched/inserted/updated/skipped (int, default 0), attempts (default 1), source_generated_at, error_details, metadata (jsonb '{}'), created_at`
- Indizes: `(job_name, finished_at desc)`, `(success, finished_at desc)`
- RLS: nur `automation_job_runs_select_authenticated` (SELECT `using(true)`) — **kein INSERT/UPDATE Policy**, Schreibzugriff nur via Service-Role.

### `public.study_feedback` (Migration 7)
`id (uuid PK), study_id (FK → studies, ON DELETE CASCADE), event_type (CHECK: view|click|review_good|review_bad|review_skip|search_hit), user_id (FK → auth.users, ON DELETE SET NULL), metadata (jsonb), created_at`
- Indizes auf `study_id`, `event_type`, `created_at`, `(study_id, event_type)`
- RLS: `service_role_full_access` (ALL), `authenticated_can_insert_own` (INSERT `user_id=auth.uid()`), `authenticated_can_read_own` (SELECT `user_id=auth.uid()`). Kein UPDATE/DELETE für User — append-only.

### `public.scoring_weights_history` (Migration 7)
`id (uuid PK), weights (jsonb), reason, based_on_studies (int default 0), computed_at, created_at`
- Index `(computed_at desc)`
- RLS: **nur `service_role_full_access`** — für `authenticated` komplett unzugänglich (auch ADMIN via PostgREST blockiert).

### `public.engine_config` (Migration 9)
`id (uuid PK), config_key (text UNIQUE), config_value (jsonb '{}'), updated_at, updated_by (FK → auth.users, SET NULL)`
- RLS: **nur `service_role_full_access`** — gleiches Problem wie oben: ein Admin-UI, das mit User-Session liest, bekäme leere Resultate.
- Seed (ON CONFLICT DO NOTHING): `required_keywords`, `preferred_sources`, `blocked_sources`, `custom_exclusions`, `topic_clusters`, `scoring_params` (inkl. `minAcceptScore: 34`, Gewichte topicFit 0.38 / evidenceLevel 0.24 / publisherQuality 0.18 / freshness 0.08 / editorialUtility 0.12), `cannabis_anchor`.

### `public.grows` (Migration 11) — **zentrale Grow-Tabelle**
```sql
create table public.grows (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  umgebung        text not null default 'indoor',
  medium          text not null default 'erde',
  licht_typ       text not null default 'led',
  licht_leistung  int,
  erfahrung       text not null default 'einsteiger',
  pflanzen_anzahl int not null default 1,
  flaeche         numeric,
  start_date      date not null,
  current_phase_id text not null default 'keimung',
  status          text not null default 'aktiv',
  notes           text,
  plan            jsonb not null default '{}',
  harvest         jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
```
- `id uuid default gen_random_uuid()` ⇒ **Postgres erwartet eine echte UUID beim Insert** (siehe [[03_Datenfluesse]] / [[04_Issues]] — Root-Cause-Bug)
- **Kein Index auf `user_id`**, obwohl RLS exakt darauf filtert
- **Keine CHECK-Constraints** auf `umgebung/medium/licht_typ/erfahrung/current_phase_id/status` (App-seitige Enums, DB-seitig Freitext)
- Trigger `trg_grows_updated_at`
- RLS: `grows_owner` (FOR ALL, `auth.uid() = user_id`)

### `public.plants` (Migration 11)
`id (uuid PK default gen_random_uuid()), grow_id (FK → grows, CASCADE), user_id (FK → auth.users, CASCADE), name, notes, created_at`
- **Keine Indizes** auf `grow_id`/`user_id`, kein `updated_at`
- RLS: `plants_owner` (FOR ALL, `auth.uid() = user_id`)

### `public.log_entries` (Migration 11)
`id (uuid PK default gen_random_uuid()), grow_id (FK → grows, CASCADE), user_id (FK → auth.users, CASCADE), plant_id (FK → plants, SET NULL, nullable), entry_type (text, kein CHECK), data (jsonb NOT NULL), notes, logged_at (timestamptz default now()), created_at`
- Index `log_entries_grow_id_logged_at (grow_id, logged_at desc)`
- RLS: `log_entries_owner` (FOR ALL, `auth.uid() = user_id`)

### `public.automation_error_memory` (Migration 12)
`id (uuid PK), job_name, fingerprint, fail_count (default 1), last_error, metadata (jsonb), first_failed_at, last_failed_at, next_retry_at (NOT NULL, kein Default), created_at, updated_at (default now(), aber **kein Trigger** — kann veralten)`
- UNIQUE `(job_name, fingerprint)`; Indizes `(job_name, next_retry_at)`, `(job_name, fail_count desc)`
- RLS: `service_role` ALL, `authenticated` nur SELECT

---

## Knowledge OS (Migrationen 13–15) — separates Subsystem

### Enums (Migration 13)
- `knowledge_status`: draft | in_review | published | archived
- `knowledge_difficulty`: foundational | intermediate | advanced | expert
- `knowledge_relation_type`: related | parent | child | prerequisite | causes | caused_by | symptom_of | treats | interacts_with | antagonist_of | synergist_of | measured_by | see_also
- `knowledge_media_kind`: image | diagram | chart | video | document
- `knowledge_tool_kind`: diagnosis | calculator | simulator | reference | external
- `knowledge_review_status`: approved | changes_requested | rejected | pending

### Tabellen
| Tabelle | Zweck | Wichtige Constraints/Indizes | RLS |
|---|---|---|---|
| `knowledge_categories` | Kategoriebaum | UNIQUE slug, self-FK `parent_id`, Index `(parent_id)` | read: alle; write: Staff (`is_knowledge_staff()`) |
| `knowledge_contributors` | Autoren/Reviewer | FK `user_id → auth.users` SET NULL | read: alle; write: Staff |
| `knowledge_articles` | Kernartikel | UNIQUE slug, FK category/author, generierte Spalte `search_tsv` (FTS, Mig14 erweitert um Body-Text + sprachabhängig via `knowledge_regconfig`), GIN-Index + Trigram-Index auf `title` (Mig14) | read: `status='published' OR is_knowledge_staff()`; write: Staff |
| `knowledge_faqs` | FAQ je Artikel | FK article CASCADE, Index `(article_id, position)` | read: alle; write: Staff |
| `knowledge_tags` | Schlagworte | UNIQUE slug, `kind` (Freitext) | read: alle; write: Staff |
| `knowledge_article_tags` | Artikel↔Tag (Junction) | composite PK | read: alle; write: Staff |
| `knowledge_sources` | Quellen/Literatur | UNIQUE `external_id` | read: alle; write: Staff |
| `knowledge_references` | Artikel↔Quelle (Junction) | UNIQUE `(article_id, source_id)` | read: alle; write: Staff |
| `knowledge_relations` | Knowledge-Graph-Kanten | UNIQUE `(from,to,type)`, CHECK `from<>to`, Index `(from_article, weight desc)` (Mig14) | read: alle; write: Staff |
| `knowledge_versions` | Versionsverlauf | UNIQUE `(article_id, version)` | **nur Staff** (kein Public-Read) |
| `knowledge_reviews` | Redaktions-Reviews | FK article/version/reviewer | nur Staff |
| `knowledge_media` | Bilder/Diagramme | FK article (nullable, CASCADE) | read: alle; write: Staff |
| `knowledge_tool_links` | Artikel→Tool-Links | UNIQUE `(article_id, tool_slug)`, +`tool_id` FK (Mig15) | read: alle; write: Staff |
| `knowledge_events` | Analytics-Events | **partitioniert ab Mig14** (RANGE auf `created_at`, monatliche Partitionen + Default-Partition, composite PK `(id,created_at)`) | INSERT: alle (auch anon); SELECT: nur Staff |
| `knowledge_metrics` | Aggregierte Artikel-Metriken | PK `article_id`, befüllt durch `knowledge_refresh_metrics()` | nur Staff |
| `knowledge_embeddings` | Vektor-Embeddings (pgvector, Fallback jsonb) | UNIQUE `(article_id, chunk_index)`, HNSW-Index falls `vector` | nur Staff |
| `knowledge_tools` (Mig15) | Tool-Katalog (10 geseedet) | UNIQUE slug, `category` als Freitext **ohne FK** zu `knowledge_categories.slug` | read: alle; write: Staff |
| `knowledge_tool_tags` (Mig15) | Tool↔Tag mit Gewicht | composite PK, 24 Seed-Mappings, 15 Seed-Tags | read: alle; write: Staff |

### Materialized View `knowledge_popular` (Migration 14)
7-Tage-View-Counts pro Artikel, **`WITH NO DATA`** erstellt — muss vor erstem Read per `REFRESH MATERIALIZED VIEW CONCURRENTLY` befüllt werden (sonst Fehler/leer). **Keine RLS** möglich für Materialized Views — potenzielles Datenleck der Staff-only `knowledge_events`-Daten, falls per PostgREST exponiert.

### Funktionen
- `tg_set_updated_at()` — generischer BEFORE-UPDATE-Trigger (genutzt von user_roles, grows, knowledge_categories/contributors/articles/sources/tools)
- `is_knowledge_staff()` — `role in ('PROVIDER','TEAM','ADMIN')`, Basis aller Knowledge-Write-Policies (CONSUMER ausgeschlossen)
- `knowledge_body_text(jsonb)`, `knowledge_regconfig(text)` — Helfer für FTS
- `knowledge_graph_expand(root_slug, max_depth, max_nodes, per_node_limit)` — BFS über `knowledge_relations`, nur `published`
- `knowledge_match_embeddings(...)`, `knowledge_hybrid_search(...)` — Vektor/FTS-Suche (pgvector-abhängig)
- `knowledge_events_ensure_partition(ts)`, `knowledge_events_drop_old(keep_months=6)` — Partitionsverwaltung
- `knowledge_refresh_metrics(since='30 days')` — Aggregation in `knowledge_metrics`
- `knowledge_recommend_tools(root_slug, match_count=12)` — Tool-Empfehlungen (curated/tag_match/cat_match)

### pg_cron Jobs (Migration 14, optional/guarded)
- `knowledge_metrics_rollup` — stündlich → `knowledge_refresh_metrics()`
- `knowledge_events_maintenance` — täglich 03:15 → Partition anlegen, alte Partitionen löschen, `knowledge_popular` refreshen

### Rollback-Dateien
- `202606020014_knowledge_os_remediation_rollback.sql` — macht Mig14 rückgängig (Partitionierung, Hybrid-Search, Embeddings-Spalten, search_tsv, Cron-Jobs). Stellt `knowledge_events_user_idx` wieder her (das die Vorwärtsmigration NICHT neu angelegt hat — asymmetrisch).
- `202606020015_knowledge_activation_rollback.sql` — entfernt `knowledge_tools`, `knowledge_tool_tags`, `tool_id`-Spalte; behält die 15 Seed-Tags bewusst.
- Keine Evidenz im Repo, ob diese Rollbacks je ausgeführt wurden.

---

## Schema-Evolution (Kurzfassung)
1. `studies`: pre-existing, erweitert in Mig 2 (Quality/Review/Fingerprint) und Mig 6 (Engine-Spalten), dedupliziert in Mig 4.
2. `user_roles.role` CHECK: CONSUMER/PROVIDER → +ADMIN (Mig8) → +TEAM (Mig10, mit hartkodiertem User-Update).
3. `studies`/`user_roles` RLS: Mig3 "rls_hardening" — Policies idempotent neu erstellt + neue DELETE-Policy.
4. `knowledge_articles.search_tsv`: komplett ersetzt in Mig14 (Body-Text + sprachabhängig).
5. `knowledge_embeddings`: +5 Provenienz-Spalten, optional HNSW-Index (Mig14).
6. `knowledge_events`: heap → partitionierte Tabelle (Mig14), `user_idx` dabei verloren.
7. `knowledge_tool_links`: +`tool_id` FK (Mig15).
8. Mig15: neue Tabellen `knowledge_tools`, `knowledge_tool_tags` + Seeds.

---

## Anomalien (Datenmodell-Ebene) — Querverweis ins Technical Debt Register

| # | Anomalie | Tabelle(n) |
|---|---|---|
| DB-1 | `studies` Basistabelle nicht im Migrationsverlauf vorhanden — Schema nicht vollständig rekonstruierbar | studies |
| DB-2 | `studies_update/delete_provider_only` Policies ignorieren ADMIN/TEAM | studies |
| DB-3 | `scoring_weights_history`, `engine_config` ohne `authenticated`-Policy — Admin-UI mit User-Session bekommt leere Resultate | scoring_weights_history, engine_config |
| DB-4 | Keine Indizes auf `grows.user_id`, `plants.user_id/grow_id`, `log_entries.user_id` trotz RLS-Filterung darauf | grows, plants, log_entries |
| DB-5 | `automation_error_memory.updated_at` ohne Trigger → kann veralten | automation_error_memory |
| DB-6 | `knowledge_events`-Partitionierung verliert `user_idx` (Mig14), Rollback stellt ihn inkonsistent wieder her | knowledge_events |
| DB-7 | `knowledge_popular` Materialized View ohne RLS, `WITH NO DATA` — potenzielles Leck + leerer Read bis Refresh | knowledge_popular |
| DB-8 | Mig10 enthält hartkodierten User-Datenmigrations-Block (`gimber.l@web.de`) — bricht Migration in neuen Umgebungen | user_roles |
| DB-9 | `knowledge_tools.category` ohne FK zu `knowledge_categories.slug` — stille Inkonsistenz möglich | knowledge_tools |
| DB-10 | **`grows`/`plants`/`log_entries.id` sind `uuid` mit `gen_random_uuid()` Default, aber Frontend generiert eigene Nicht-UUID-IDs (`generateId()`) und sendet diese explizit beim Insert** → `invalid input syntax for type uuid` (siehe `AUDIT_CREATE_GROW_BUG.md`, Root Cause des Create-Grow-Bugs) | grows, plants, log_entries |

## Verknüpfte Dokumente

[[00_Uebersicht]]
[[01_Architektur]]
[[03_Datenfluesse]]
[[02_Datenbankarchitektur]]
[[07_Entitaetsmodell]]
