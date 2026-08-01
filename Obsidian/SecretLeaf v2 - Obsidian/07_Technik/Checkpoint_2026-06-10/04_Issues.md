---
tags: [technik, audit, checkpoint, issues]
status: Aktiv
verknüpft: ["[[00_Uebersicht]]", "[[06_Technical_Debt_Register]]", "[[02_Daten_Risiken]]"]
---

# Issue Discovery — SecretLeaf (Stand 10.06.2026)

> Teil des Checkpoints [[00_Uebersicht]]. Reine Dokumentation, keine Fixes. Vollständige Tabelle inkl. Aufwand/Priorität siehe [[06_Technical_Debt_Register]] (TD-IDs referenziert).

## Datenbankfehler / Datenverlust
- **TD-01/TD-02**: UUID-Format-Mismatch zwischen client-generierten IDs (`generateId()`) und `uuid`-Spalten in `grows`/`plants`/`log_entries` → alle Schreibvorgänge eingeloggter User (Create Grow, Plant-Erstellung, Migration) scheitern an Postgres 22P02, Rollback in der UI. **Root Cause des "Create Grow funktioniert nicht"-Problems.**
- **TD-16**: `public.studies` Basistabelle fehlt in den Migrationen — Schema nicht vollständig rekonstruierbar.

## Architekturprobleme
- **TD-03/TD-04**: Zwei unabhängige Backends (Fastify/SQLite Marketplace vs. Next.js/Supabase Knowledge-Plattform) mit eigenen Datenmodellen und Auth-Systemen — vermutlich Pivot-Altlast, Marketplace scheint vom Frontend ungenutzt.
- **TD-05**: Namensgleiche, aber inhaltlich unterschiedliche `/public/*`-Endpunkte in beiden Backends.
- **TD-06/TD-07**: Redundante Automation-Pipelines (3x Study-Sync, 2x Fertilizer-Preis-Quellen).

## Sicherheitsprobleme (RLS)
- **TD-08**: `studies` UPDATE/DELETE-Policies berücksichtigen nur `PROVIDER`, nicht `ADMIN`/`TEAM`.
- **TD-09**: `scoring_weights_history`/`engine_config` ohne `authenticated`-Policy — Admin-UI mit User-Session bekommt stillschweigend leere Resultate.
- **TD-13**: `knowledge_popular` Materialized View ohne RLS, potenzielles Datenleck.
- **TD-25/TD-26**: `api/knowledge/events` und `api/translate` ohne Auth/Rate-Limit.

## Skalierungsprobleme
- **TD-10**: Fehlende Indizes auf `user_id`/`grow_id` in den Grow-Tabellen trotz RLS-Filterung darauf.
- **TD-12**: Verlorener `user_id`-Index nach `knowledge_events`-Partitionierung.

## Inkonsistenzen
- **TD-11**: `automation_error_memory.updated_at` ohne Update-Trigger.
- **TD-14**: Hartkodierte User-Datenmigration in Migration 10 (bricht in neuen Umgebungen ab).
- **TD-15**: `knowledge_tools.category` ohne FK-Absicherung.
- **TD-23**: `normalizeRole()` kann `TEAM` nie liefern — toter Codepfad trotz Typ-Unterstützung.
- **TD-24**: Inkonsistente Rollenprüfung zwischen `studies` POST (jeder User) und PATCH (nur PROVIDER).
- **TD-28/TD-29**: Diagnose-Notizen bypassen den regulären Sync-Pfad und werden nicht analytisch getrackt, obwohl ein passender Eventtyp existiert.

## Broken / unvollständige Flows
- **TD-17**: Foto-Upload — nur Typen, kein Backend.
- **TD-18**: Community-Grows — nur Typen, kein Backend.
- **TD-19**: KI-Bilddiagnose — Stub, HTTP 501.
- **TD-22**: Newsletter-Signup — nur `console.log`, keine Persistenz.

## Totes / inaktives Code
- **TD-20**: Sentry vollständig auskommentiert — Fehler nur in `console.error`.
- **TD-21**: Plausible-Analytics-Status nicht verifiziert (abhängig von Env-Variable + Script-Injection).

## Technical Debt (CI/CD)
- **TD-27**: CI nur Typecheck+Build, kein Test-/Lint-Gate.

## Offene Fragen (siehe auch [[06_Technical_Debt_Register]] "Fehlende Informationen")
- Sind alle 16 Migrationen auf der Live-Supabase-Instanz angewendet?
- Existiert/läuft `apps/api` (Fastify-Marketplace) noch produktiv?
- Wurde `knowledge_popular` je refreshed (pg_cron verfügbar)?
- Tatsächliche Vercel-Env-Variablen-Konfiguration (Supabase-Keys, `CRON_SECRET`, `SERPAPI_KEY`, `OPENAI_API_KEY`)?

## Verknüpfte Dokumente

[[00_Uebersicht]]
[[06_Technical_Debt_Register]]
[[05_Decision_Log]]
[[02_Daten_Risiken]]
