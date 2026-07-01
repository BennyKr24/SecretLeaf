---
tags: [technik, audit, checkpoint, technical-debt]
status: Aktiv
verknüpft: ["[[00_Uebersicht]]", "[[04_Issues]]", "[[05_Decision_Log]]"]
---

# Technical Debt Register — SecretLeaf (Stand 10.06.2026)

> Teil des Checkpoints [[00_Uebersicht]].

Format: ID | Kategorie | Priorität | Risiko | Aufwand | Status | Beschreibung | Betroffene Dateien/Tabellen

Prioritäten: Kritisch / Hoch / Mittel / Niedrig. Status: `offen` (alle Einträge — **nichts wurde gefixt**, reine Dokumentation gemäß Auftrag).

| ID | Kategorie | Priorität | Risiko | Aufwand | Status | Beschreibung |
|---|---|---|---|---|---|---|
| TD-01 | Data Loss / DB | **Kritisch** | Alle Grows/Plants/LogEntries (offline-Pfad) eingeloggter User werden nie in Supabase persistiert | 0,5–1 PT | offen | `generateId()` (`lib/grow/utils.ts`) erzeugt Nicht-UUID-IDs, die als `uuid`-Spalten (`grows.id`, `plants.id`, `log_entries.id`) inserted werden → Postgres-Fehler 22P02, Optimistic-Update wird zurückgerollt. Betrifft `lib/grow/store.ts`, `lib/grow/db.ts`, `lib/grow/migration.ts`, `hooks/useGrowState.ts`. Bereits dokumentiert in `AUDIT_CREATE_GROW_BUG.md`. |
| TD-02 | Data Loss | **Kritisch** | Erst-Migration localStorage→Supabase schlägt vollständig fehl | im TD-01 enthalten | offen | `lib/grow/migration.ts::runMigration()` — gleicher UUID-Bug, betrifft alle drei Tabellen beim ersten Login. |
| TD-03 | Architektur | Hoch | Zwei unabhängige Backends (Fastify/SQLite "Marketplace" vs. Next.js/Supabase "Knowledge/Studies") ohne gemeinsames Datenmodell, vermutlich Pivot-Altlast | 2–5 PT (Entscheidung + ggf. Removal) | offen | `apps/api/*` komplett vs. `apps/web/src/app/api/*`. Marketplace-API scheint vom Frontend nicht genutzt zu werden. |
| TD-04 | Architektur | Hoch | Zwei unabhängige Auth-Systeme (Supabase Auth vs. Fastify-JWT) | siehe TD-03 | offen | Keine Cross-Referenz zwischen `auth.users`/`user_roles` und Prisma `User`. |
| TD-05 | Architektur / Naming | Mittel | `api/public/listings`, `api/public/overview`, `api/public/status-report` (Next.js) reimplementieren Namen der Fastify-`/public/*`-Routen mit komplett anderen Daten (Studies statt Listings) | 1–2 PT (Umbenennung/Konsolidierung) | offen | Verwirrungsgefahr für neue Entwickler, zwei "Status Report"-Implementierungen mit unterschiedlichen Datenquellen. |
| TD-06 | Automation / Redundanz | Mittel | Drei überlappende Study-Sync-Pipelines (`engine-sync`, `studies-sync`, `study-refresh`) plus dupliziertes Scoring in `scripts/sync-wiki-studies.mjs` | 2–3 PT | offen | Mehrfacher Wartungsaufwand, Risiko inkonsistenter Daten. |
| TD-07 | Automation / Redundanz | Niedrig | Zwei parallele Fertilizer-Preisquellen (`generate-fertilizer-prices.mjs` algorithmisch vs. `sync-fertilizer-prices.mjs` via SerpAPI) | 0,5 PT | offen | Unklar, welche Quelle produktiv genutzt wird. |
| TD-08 | RLS / Security | Hoch | `studies_update_provider_only` / `studies_delete_provider_only` prüfen nur `role='PROVIDER'`, ADMIN/TEAM können `studies` per User-Session nicht ändern (RLS blockt) | 0,5 PT | offen | `supabase/migrations/202604050001_roles_and_rls.sql` (+ rls_hardening). |
| TD-09 | RLS / Security | Mittel | `scoring_weights_history`, `engine_config` haben keine `authenticated`-Policy — Admin-UI mit User-Session erhält stillschweigend leere Resultate statt Fehler | 0,5 PT | offen | Migrationen 7, 9. |
| TD-10 | Performance | Mittel | Keine Indizes auf `grows.user_id`, `plants.user_id/grow_id`, `log_entries.user_id`, obwohl RLS exakt darauf filtert | 0,5 PT (Migration) | offen | `202605010011_grow_tables.sql`. |
| TD-11 | Datenintegrität | Niedrig | `automation_error_memory.updated_at` hat Default `now()`, aber keinen Update-Trigger | 0,25 PT | offen | `202606010012_automation_error_memory.sql`. |
| TD-12 | Datenintegrität | Mittel | `knowledge_events`-Partitionierung (Mig14) verliert `knowledge_events_user_idx`, nicht in neuen Partitionen neu angelegt; Rollback stellt es asymmetrisch wieder her | 0,5 PT | offen | `202606020014_knowledge_os_remediation.sql` (+rollback). |
| TD-13 | Security | Mittel | `knowledge_popular` Materialized View ohne RLS, `WITH NO DATA` — potenzielles Datenleck staff-only Daten + leerer Read bis Refresh | 0,5–1 PT | offen | Migration 14. |
| TD-14 | Migrations-Hygiene | Hoch | Migration 10 enthält hartkodierten `DO $$`-Block, der einer spezifischen E-Mail (`gimber.l@web.de`) die Rolle `TEAM` zuweist — **Migration schlägt fehl/bricht ab**, wenn dieser User in einer Umgebung nicht existiert (z. B. frisches Dev/Staging) | 0,5 PT | offen | `202604230010_team_role.sql`. |
| TD-15 | Datenintegrität | Niedrig | `knowledge_tools.category` ist Freitext ohne FK zu `knowledge_categories.slug` — Tippfehler brechen `cat_match`-Empfehlungssignal still | 0,5 PT | offen | Migration 15. |
| TD-16 | Datenmodell | Niedrig | `public.studies` Basistabelle nicht in den vorhandenen Migrationen — Schema nicht vollständig aus dem Repo rekonstruierbar | 0,5 PT (Schema-Dump nachreichen) | offen | fehlende Basis-Migration. |
| TD-17 | Feature-Stub | Mittel (Produktentscheidung) | Foto-Upload für Grows komplett fehlend (nur Typen, kein Storage/UI/API) | 5–10 PT | offen | `lib/grow/photoTypes.ts`. |
| TD-18 | Feature-Stub | Mittel (Produktentscheidung) | Community-Grows komplett fehlend (nur Typen, kein Backend) | 5–10 PT | offen | `lib/grow/communityTypes.ts`. |
| TD-19 | Feature-Stub | Mittel (Produktentscheidung) | KI-Bilddiagnose (`api/diagnose`) vollständig deaktiviert (501), blockiert auf OpenAI-Key + Billing | 3–8 PT | offen | `app/api/diagnose/route.ts`. |
| TD-20 | Monitoring | Hoch | Sentry vollständig auskommentiert/inaktiv über `instrumentation.ts`, `sentry.client/server.config.ts`, `lib/errorTracking.ts` — Fehler landen nur in `console.error`, gehen in Produktion verloren | 0,5–1 PT (Reaktivierung) | offen | siehe genannte Dateien. |
| TD-21 | Monitoring / Analytics | Mittel | Plausible-Tracking-Aufrufe (`Analytics.*`) sind im Code verteilt, aber nur aktiv, wenn `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` gesetzt UND das Plausible-Script tatsächlich lädt — Status nicht verifiziert | 0,25 PT (Verifikation) | offen | `lib/analytics.ts`, `app/layout.tsx`. |
| TD-22 | Stub | Niedrig | Newsletter-Signup (`api/newsletter`) loggt nur in Konsole, keine Persistenz/Versand — Anmeldungen gehen verloren | 1–2 PT | offen | `app/api/newsletter/route.ts`. |
| TD-23 | Auth | Mittel | `lib/serverAuth.ts::normalizeRole()` kann `"TEAM"` nie zurückgeben, obwohl Typ-System und Client-Code (`fetchRoleFromApi`) dafür Branches enthalten — toter/inkonsistenter Codepfad | 0,25 PT | offen | `lib/serverAuth.ts`, `lib/auth.ts`, `lib/types.ts`. |
| TD-24 | API-Konsistenz | Niedrig | `api/studies` POST erlaubt jedem authentifizierten User das Anlegen von Studies, `PATCH` ist auf `PROVIDER` beschränkt — inkonsistente Rollenprüfung | 0,25 PT | offen | `app/api/studies/route.ts`, `app/api/studies/[id]/route.ts`. |
| TD-25 | Security | Mittel | `api/knowledge/events` ohne Auth/Rate-Limit, verlässt sich vollständig auf RLS — Spam-/Flood-Risiko | 0,5–1 PT | offen | `app/api/knowledge/events/route.ts`. |
| TD-26 | Security | Niedrig | `api/translate` ohne Auth/Rate-Limit, proxyt MyMemory-API (geteiltes IP-Kontingent 5k Zeichen/Tag) | 0,5 PT | offen | `app/api/translate/route.ts`. |
| TD-27 | CI/CD | Mittel | CI (`ci.yml`) führt nur Typecheck + Build aus, kein Test- oder Lint-Gate | 0,5–1 PT | offen | `.github/workflows/ci.yml`. |
| TD-28 | Datenfluss | Mittel | Diagnose-Notizen (`DiagnoseResult.tsx`) bypassen `useGrowLog`/Supabase und schreiben direkt über `lib/grow/store.ts` — für eingeloggte User nicht sofort gesynct | 0,5 PT | offen | `components/diagnose/DiagnoseResult.tsx`. |
| TD-29 | Analytics-Lücke | Mittel | Diagnose-Nutzung wird nicht als `knowledge_events`-Event (`diagnostic_launch`) getrackt, obwohl der Eventtyp existiert | 0,5 PT | offen | Diagnose-Flow ↔ `api/knowledge/events`. |
| TD-30 | Env/Secrets | Hoch | `.env`/`.env.local` nicht im Repo (erwartet) — Status der tatsächlichen Vercel-Env-Werte (Supabase URL/Keys, `CRON_SECRET`, `SERPAPI_KEY`, `OPENAI_API_KEY` etc.) unbekannt, siehe `AUDIT_CREATE_GROW_BUG.md` "Fehlende Informationen" | n/a (Recherche) | offen | Vercel-Projekteinstellungen (außerhalb Repo-Zugriff). |

---

## Fehlende Informationen (nicht aus dem Repo ableitbar)
- Tatsächliche Werte/Vorhandensein der Env-Variablen in Vercel (Production/Preview/Dev)
- Ob die Supabase-Migrationen 1–15 auf der Live-Instanz vollständig angewendet wurden (insb. Migration 10 mit hartkodiertem User)
- Ob `knowledge_popular` jemals refreshed wurde (pg_cron-Verfügbarkeit auf der Live-Instanz)
- Ob die Knowledge-OS-Rollback-Migrationen (14/15) je ausgeführt wurden
- Tatsächlicher Browser-/Supabase-Fehler-Log beim "Create Grow"-Versuch eines eingeloggten Users (zur Bestätigung von TD-01)
- Ob `apps/api` (Fastify-Marketplace) überhaupt noch deployed/erreichbar ist

## Verknüpfte Dokumente

[[00_Uebersicht]]
[[04_Issues]]
[[05_Decision_Log]]
