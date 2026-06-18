---
tags: [technik, audit, checkpoint]
status: Aktiv
verknüpft: ["[[06_Technical_Checkpoint_2026-06-10]]", "[[01_Architektur]]", "[[02_Datenmodell]]", "[[03_Datenfluesse]]", "[[04_Issues]]", "[[05_Decision_Log]]", "[[06_Technical_Debt_Register]]", "[[07_Data_Moat_Audit]]"]
---

# SecretLeaf — Final Checkpoint Report (Stand 10.06.2026)

Dieser Report fasst den vollständigen technischen + produktbezogenen Checkpoint zusammen. Detaildokumente in diesem Ordner:
- [[01_Architektur]] — Systemübersicht/Architektur
- [[02_Datenmodell]] — vollständiges Datenmodell (alle Supabase-Tabellen, RLS, Trigger, Views, Funktionen)
- [[03_Datenfluesse]] — End-to-End-Datenflüsse (Registrierung, Login, Grow/Plant/Log/Diagnose/AI/Automations)
- [[04_Issues]] — alle gefundenen Probleme nach Kategorie
- [[05_Decision_Log]] — pro Befund: Problem/Ursache/Auswirkung/Lösung/Aufwand/Risiko
- [[06_Technical_Debt_Register]] — TD-01 bis TD-30 mit Priorität/Risiko/Aufwand/Status
- [[07_Data_Moat_Audit]] — Datensammlung heute, Lücken, Anforderungen für Similarity/Recommendation/Prediction/Outcome Engines
- `AUDIT_CREATE_GROW_BUG.md` (Repo-Root, vorheriger Audit) — Detailanalyse des Create-Grow-Bugs

Übergeordneter Anker im Vault: [[06_Technical_Checkpoint_2026-06-10]] (in `08_Organisation`).

**Kein Code wurde verändert.** Alles unten ist Dokumentation des Ist-Zustands.

---

## 1. Systemübersicht
SecretLeaf ist ein Monorepo (npm workspaces, v1.4.0) mit zwei funktional getrennten Backends:
- `apps/web`: Next.js 16/React 19 App (de/en, next-intl), Supabase als Hauptdatenbank — Cannabis-Wissensplattform mit Grow-Tagebuch, Diagnose-Wizard, Wiki/Studies, Tools/Rechnern, Admin-Dashboard.
- `apps/api`: eigenständiger Fastify+Prisma+SQLite Marketplace (Listings/Purchases), eigenes JWT-Auth, vom Web-Frontend offenbar ungenutzt.

## 2. Architekturübersicht (Kurzfassung)
Siehe [[01_Architektur]]. Wichtigste Punkte:
- Zwei unabhängige Backends/Auth-Systeme (TD-03/TD-04).
- Grow-System: localStorage-first mit optionalem Supabase-Cloud-Sync (Optimistic UI + Rollback).
- 7 Vercel-Cron-Jobs für Studies-Pipeline (3 davon redundant, TD-06).
- Kein KI-Feature live (Diagnose-KI ist Stub).
- Sentry/Error-Tracking inaktiv (TD-20).

## 3. Datenmodellübersicht (Kurzfassung)
Siehe [[02_Datenmodell]]. 16 Migrationen, ~25 Tabellen. Kernbereiche:
- `user_roles` (CONSUMER/PROVIDER/ADMIN/TEAM, RLS)
- `studies` + Engine-Erweiterungen (Basistabelle fehlt im Repo, TD-16)
- `grows`/`plants`/`log_entries` (uuid-PKs, RLS `auth.uid()=user_id`, fehlende Indizes TD-10)
- `automation_job_runs`, `study_feedback`, `scoring_weights_history`, `engine_config`, `automation_error_memory`
- Knowledge OS (`knowledge_*`, 15+ Tabellen, Graph/FTS/Embeddings/Tools, partitionierte Events)

## 4. Kritische Fehler
| Bug | Beschreibung | Quelle |
|---|---|---|
| **Create Grow / Datenverlust (TD-01/TD-02)** | `generateId()` erzeugt Nicht-UUID-IDs für `grows`/`plants`/`log_entries` und die Erst-Migration → Postgres 22P02 → Rollback. Eingeloggte User verlieren alle Cloud-Schreibvorgänge für Grows/Plants/Harvest. | `lib/grow/utils.ts`, `lib/grow/db.ts`, `lib/grow/store.ts`, `lib/grow/migration.ts` |

Dies ist der **einzige als "kritisch + Datenverlust für alle eingeloggten User" eingestufte Fehler**. Alle übrigen Findings sind Hoch/Mittel/Niedrig (siehe [[06_Technical_Debt_Register]]).

## 5. Sicherheitsprobleme
- TD-08: `studies` UPDATE/DELETE-RLS ignoriert ADMIN/TEAM.
- TD-09: `scoring_weights_history`/`engine_config` ohne `authenticated`-Policy.
- TD-13: `knowledge_popular` Materialized View ohne RLS.
- TD-25/TD-26: `api/knowledge/events`, `api/translate` ohne Auth/Rate-Limit.
- TD-14: hartkodierte User-Datenmigration in Migration 10 (Reproduzierbarkeits-/Sicherheitsrisiko für CI/Dev).

## 6. Datenverlust-Risiken
- TD-01/TD-02 (kritisch, s.o.)
- TD-22: Newsletter-Signups gehen verloren (nur `console.log`)
- DL-09: Diagnose-Notizen bypassen Sync, gleiches UUID-Risiko bei späterer Migration
- TD-20: Fehler ohne Sentry unsichtbar — Datenverlust-Bugs bleiben lange unentdeckt (wie dieser hier, vermutlich seit Einführung der Grow-Tabellen am 01.05.2026)

## 7. Data-Moat-Risiken
Siehe [[07_Data_Moat_Audit]]. Zentraler Befund: Solange TD-01 besteht, sammelt SecretLeaf **keine zentral auswertbaren longitudinalen Grow-/Harvest-Daten** — die Grundlage für Similarity-, Recommendation-, Prediction- und Outcome-Engines fehlt fast vollständig. Diagnose-Nutzung wird zusätzlich gar nicht getrackt (DL-09).

## 8. Fehlende Dokumentation
- `public.studies` Basistabelle (Schema) ist nicht im Repo (TD-16) — sollte als eigene Baseline-Migration oder Schema-Dump nachgereicht werden.
- Tatsächliche Vercel-Env-Konfiguration (Supabase-Keys, `CRON_SECRET`, `SERPAPI_KEY`, ggf. `OPENAI_API_KEY`) — siehe `AUDIT_CREATE_GROW_BUG.md`.
- Status der Live-Migrationen (welche der 16 Migrationen + beide Rollback-Varianten sind tatsächlich angewendet).
- Deployment-Status von `apps/api` (noch live? Domain?).

## 9. Empfohlene Reihenfolge der Fixes (nur Empfehlung, nicht umgesetzt)
1. **TD-01/TD-02** — `generateId()` → `crypto.randomUUID()` + Migrationsstrategie für Bestandsdaten (Kritisch, ~0,5–1 PT). Voraussetzung für alles Data-Moat-Bezogene.
2. **TD-20** — Sentry reaktivieren (Hoch, ~0,5–1 PT) — verhindert, dass zukünftige Bugs dieser Art unentdeckt bleiben.
3. **TD-08/TD-09/TD-14** — RLS-Lücken + nicht-portable Migration 10 (Hoch, je ~0,5 PT) — wichtig für Admin-Funktionen und Dev/Staging-Reproduzierbarkeit.
4. **TD-10** — fehlende Indizes auf Grow-Tabellen (Mittel, ~0,5 PT) — vor weiterem Nutzerwachstum.
5. **DL-09 / TD-28/TD-29** — Diagnose-Flow an Sync/Analytics anbinden (Mittel, ~0,5–1 PT) — wichtig für Data Moat.
6. **TD-03/TD-04/TD-05/TD-06/TD-07** — strategische Konsolidierung (Marketplace-Backend, Sync-Pipelines, Preisquellen) — Produktentscheidung, danach 2–5 PT.
7. Restliche Mittel/Niedrig-Posten gemäß [[06_Technical_Debt_Register]].

## 10. Geschätzte Gesamtaufwände (grobe Summe aus Technical Debt Register)
- Kritisch: ~0,5–1 PT (TD-01/02)
- Hoch: ~4–8 PT (TD-03/04, TD-08, TD-09, TD-14, TD-20, TD-30-Recherche)
- Mittel: ~6–10 PT (TD-06, TD-10, TD-12, TD-13, TD-19, TD-21, TD-23, TD-25, TD-27, TD-28, TD-29)
- Niedrig: ~2–4 PT (TD-07, TD-11, TD-15, TD-16, TD-22, TD-24, TD-26)
- Feature-Stubs (Produktentscheidung, nicht Bugfix): TD-17/18/19 je 3–10 PT

**Gesamt (ohne Feature-Stubs)**: grob **12–23 Personentage** für die vollständige Bereinigung aller dokumentierten Findings, wobei TD-01/02 mit Abstand die höchste Priorität für den Data Moat hat.

---

## Status der 8-Phasen-Mission
| Phase | Status |
|---|---|
| 1 — System- & Datenmodell-Audit | ✅ erledigt ([[01_Architektur]], [[02_Datenmodell]]) |
| 2 — Data Flow Mapping | ✅ erledigt ([[03_Datenfluesse]]) |
| 3 — Issue Discovery | ✅ erledigt ([[04_Issues]]) |
| 4 — Obsidian-Vault-Update | ✅ dieser Ordner + [[06_Technical_Checkpoint_2026-06-10]] |
| 5 — Decision Log | ✅ erledigt ([[05_Decision_Log]]) |
| 6 — Technical Debt Register | ✅ erledigt ([[06_Technical_Debt_Register]]) |
| 7 — Data Moat Audit | ✅ erledigt ([[07_Data_Moat_Audit]]) |
| 8 — Final Checkpoint Report | ✅ dieses Dokument |

**Wichtig**: Es wurde noch **kein separater Fix-Plan** erstellt (gemäß Vorgabe — der ist erst nach vollständiger Analyse zulässig). Abschnitt 9 oben ist eine *Reihenfolge-Empfehlung als Teil dieses Reports*, kein detaillierter Umsetzungsplan.
