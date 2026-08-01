---
tags: [technik, audit, checkpoint, decision-log]
status: Aktiv
verknüpft: ["[[00_Uebersicht]]", "[[05_Entscheidungslog]]", "[[06_Technical_Debt_Register]]"]
---

# Decision Log — SecretLeaf Findings (Stand 10.06.2026)

> Teil des Checkpoints [[00_Uebersicht]]. Für jeden größeren Befund: Problem, Ursache, Auswirkung, betroffene Dateien, Priorität, empfohlene Lösung, Aufwand, Risiko. Kein Fix wurde durchgeführt. Strategisches Pendant: [[05_Entscheidungslog]].

---

### DL-01 — Create Grow / Grow-Daten werden nicht in Supabase gespeichert (TD-01/TD-02)
- **Problem**: Eingeloggte User verlieren neu erstellte Grows/Plants/LogEntries (Offline-Pfad) sowie die komplette Erst-Migration.
- **Ursache**: `lib/grow/utils.ts::generateId()` erzeugt `"<base36-ts>-<base36-rand>"`, kein UUID. `grows.id`/`plants.id`/`log_entries.id` sind Postgres `uuid` (`default gen_random_uuid()`). Insert mit Nicht-UUID-String → Fehler 22P02 → Rollback in `useGrowState.ts`.
- **Auswirkung**: Datenverlust für jeden eingeloggten User, "Data Moat" für Grow-Daten praktisch leer (alle Cloud-Inserts scheitern).
- **Betroffene Dateien**: `lib/grow/utils.ts`, `lib/grow/store.ts`, `lib/grow/db.ts`, `lib/grow/migration.ts`, `hooks/useGrowState.ts`.
- **Priorität**: Kritisch.
- **Empfohlene Lösung** (NICHT umgesetzt): `generateId()` durch `crypto.randomUUID()` ersetzen (Option A); zusätzlich defensive Validierung/Logging in `lib/grow/db.ts` (Option B).
- **Aufwand**: ~0,5–1 PT (inkl. Test der Migration für Bestandsuser mit bereits ungültigen IDs — ggf. Re-ID-Strategie nötig).
- **Risiko**: Bestehende localStorage-Daten mit alten IDs müssten beim Wechsel auf UUIDs neu gemappt werden, sonst funktioniert die Migration für Altbestände weiterhin nicht.

---

### DL-02 — Zwei unabhängige Backends ohne gemeinsames Datenmodell (TD-03/TD-04/TD-05)
- **Problem**: `apps/api` (Fastify/Prisma/SQLite, Marketplace-Domäne) und `apps/web/api/*` (Next.js/Supabase, Knowledge/Studies-Domäne) sind komplett getrennt; `apps/web` nutzt `apps/api` nur über `lib/api.ts`.
- **Ursache**: Vermuteter Produktpivot von P2P-Marktplatz zu Cannabis-Wissensplattform; alte Marketplace-Infrastruktur wurde nicht entfernt.
- **Auswirkung**: Doppelte Wartung, Verwirrung durch namensgleiche `/public/*`-Endpunkte mit unterschiedlichen Daten, unklar ob Fastify-Backend noch deployed ist.
- **Betroffene Dateien**: `apps/api/**`, `apps/web/src/app/api/public/**`, `apps/web/src/lib/api.ts`.
- **Priorität**: Hoch (strategische Entscheidung nötig).
- **Empfohlene Lösung**: Produktentscheidung — Marketplace entfernen/archivieren oder reaktivieren; bei Beibehaltung Endpunkte umbenennen, um Namenskollision zu vermeiden.
- **Aufwand**: 2–5 PT je nach Entscheidung.
- **Risiko**: Entfernen ohne Prüfung könnte aktive (aber ungenutzte) Deployments brechen; Beibehalten bindet weiter Wartungsressourcen.

---

### DL-03 — Redundante Automation-/Sync-Pipelines (TD-06/TD-07)
- **Problem**: `engine-sync`, `studies-sync`, `study-refresh` überlappen sich funktional; `scripts/sync-wiki-studies.mjs` dupliziert `lib/engine/config.ts`. Zwei Fertilizer-Preisquellen.
- **Ursache**: Iterative Weiterentwicklung ohne Konsolidierung alter Pipelines.
- **Auswirkung**: Höherer Wartungsaufwand, Risiko widersprüchlicher `studies`-Daten/Quality-Scores.
- **Betroffene Dateien**: `app/api/automation/{engine-sync,studies-sync,study-refresh}/route.ts`, `lib/engine/config.ts`, `scripts/sync-wiki-studies.mjs`, `scripts/{generate-fertilizer-prices,sync-fertilizer-prices}.mjs`.
- **Priorität**: Mittel.
- **Empfohlene Lösung**: Pipeline-Inventur, eine kanonische Pipeline behalten, Legacy-Routen deaktivieren/dokumentieren.
- **Aufwand**: 2–3 PT.
- **Risiko**: Cron-Abhängigkeiten (Vercel + GH Actions) müssen synchron angepasst werden.

---

### DL-04 — RLS-Lücken für ADMIN/TEAM und Admin-Config-Tabellen (TD-08/TD-09)
- **Problem**: `studies` UPDATE/DELETE-Policies erlauben nur `PROVIDER`; `scoring_weights_history`/`engine_config` haben keine `authenticated`-Policy.
- **Ursache**: RLS-Policies wurden bei Einführung neuer Rollen (ADMIN Mig8, TEAM Mig10) nicht nachgezogen.
- **Auswirkung**: Admin-Funktionen über User-Session schlagen still fehl (leere Resultate statt Fehler) — schwer zu debuggen.
- **Betroffene Dateien**: Migrationen 1/3/7/9 (`supabase/migrations/`).
- **Priorität**: Hoch.
- **Empfohlene Lösung**: Neue Migration, die Policies um `ADMIN`/`TEAM` erweitert bzw. `authenticated`-Policies für Config-Tabellen ergänzt (ggf. weiterhin lese-only für Nicht-Service-Role).
- **Aufwand**: ~0,5–1 PT.
- **Risiko**: Gering, additive RLS-Änderung.

---

### DL-05 — Migration 10 enthält hartkodierte User-Datenmigration (TD-14)
- **Problem**: `202604230010_team_role.sql` weist per `DO $$`-Block der E-Mail `gimber.l@web.de` die Rolle `TEAM` zu — bricht ab, wenn der User nicht existiert.
- **Ursache**: Schema- und Datenmigration in einer Datei vermischt, environment-spezifisch.
- **Auswirkung**: Migration ist nicht auf neue/leere Datenbanken (Dev/Staging/CI) anwendbar — blockiert Reproduzierbarkeit des Setups.
- **Betroffene Dateien**: `supabase/migrations/202604230010_team_role.sql`.
- **Priorität**: Hoch (für Dev/Staging-Reproduzierbarkeit).
- **Empfohlene Lösung**: Datenmigration in separates, optionales Seed-Skript auslagern; Schema-Migration auf reine `CHECK`-Constraint-Änderung reduzieren.
- **Aufwand**: 0,5 PT.
- **Risiko**: Gering.

---

### DL-06 — Fehlende Indizes auf Grow-Tabellen (TD-10)
- **Problem**: `grows.user_id`, `plants.user_id/grow_id`, `log_entries.user_id` ohne Index, RLS filtert aber genau darauf.
- **Ursache**: Migration 11 fokussierte auf Funktionalität, nicht Performance.
- **Auswirkung**: Sequential Scans bei wachsender Nutzerzahl, langsame RLS-gefilterte Queries.
- **Betroffene Dateien**: `supabase/migrations/202605010011_grow_tables.sql`.
- **Priorität**: Mittel (wird mit Nutzerwachstum kritisch).
- **Empfohlene Lösung**: Neue Migration mit `CREATE INDEX` auf den genannten Spalten.
- **Aufwand**: 0,5 PT.
- **Risiko**: Gering, additive Indizes (kurze Schreibsperre bei großen Tabellen, aktuell vermutlich klein).

---

### DL-07 — Inaktives Monitoring (Sentry) und ungetrackte Fehler (TD-20)
- **Problem**: Sentry-Integration vollständig auskommentiert; `lib/errorTracking.ts` loggt nur in Konsole.
- **Ursache**: Setup begonnen, nie abgeschlossen (Kommentare verweisen auf Installationsschritte).
- **Auswirkung**: Produktionsfehler (inkl. der Supabase-Insert-Fehler aus DL-01) sind ohne manuelles Server-Log-Monitoring unsichtbar.
- **Betroffene Dateien**: `instrumentation.ts`, `sentry.client.config.ts`, `sentry.server.config.ts`, `lib/errorTracking.ts`.
- **Priorität**: Hoch.
- **Empfohlene Lösung**: `@sentry/nextjs` installieren, DSN konfigurieren, Konfigurationsdateien aktivieren.
- **Aufwand**: 0,5–1 PT.
- **Risiko**: Gering, additiv.

---

### DL-08 — Feature-Stubs ohne Backend (Fotos, Community, KI-Diagnose) (TD-17/TD-18/TD-19)
- **Problem**: Drei größere geplante Features existieren nur als TypeScript-Typen/Platzhalter ohne funktionierende Implementierung.
- **Ursache**: Phasenweise Entwicklung, explizit als "BLOCKED ON ..." markiert (Storage-Bucket, Community-Tabellen, OpenAI-Key+Billing).
- **Auswirkung**: Produktroadmap-Items, kein akuter Bug, aber relevant für Data-Moat-Strategie (siehe [[07_Data_Moat_Audit]]).
- **Betroffene Dateien**: `lib/grow/photoTypes.ts`, `lib/grow/communityTypes.ts`, `app/api/diagnose/route.ts`.
- **Priorität**: Mittel (Produktentscheidung, keine Dringlichkeit).
- **Empfohlene Lösung**: Roadmap-Priorisierung; technische Voraussetzungen (Storage-Bucket-RLS, `community_grows`-Tabelle, OpenAI-Vertrag) klären.
- **Aufwand**: 5–10 PT je Feature.
- **Risiko**: n/a (noch nicht begonnen).

---

### DL-09 — Diagnose-Flow bypasst Sync & Analytics (TD-28/TD-29)
- **Problem**: `DiagnoseResult.tsx` schreibt LogEntries direkt über `lib/grow/store.ts` (localStorage), ohne `useGrowLog`/Supabase-Sync, und Diagnose-Nutzung wird nicht als `knowledge_events`-Event erfasst.
- **Ursache**: Diagnose-Feature wurde isoliert entwickelt, nicht an die zentralen Hooks/Analytics angebunden.
- **Auswirkung**: Datenverlust-Risiko (gleicher UUID-Bug bei späterer Migration) + fehlende Nutzungsdaten für Produktentscheidungen/Data Moat.
- **Betroffene Dateien**: `components/diagnose/DiagnoseResult.tsx`, `hooks/useGrowLog.ts`, `app/api/knowledge/events/route.ts`.
- **Priorität**: Mittel.
- **Empfohlene Lösung**: Diagnose-Speicherung über `useGrowLog.addEntry()` umleiten; `Analytics`/`knowledge_events`-Call mit `diagnostic_launch` ergänzen.
- **Aufwand**: 0,5–1 PT.
- **Risiko**: Gering.

## Verknüpfte Dokumente

[[00_Uebersicht]]
[[04_Issues]]
[[06_Technical_Debt_Register]]
[[05_Entscheidungslog]]
