# SecretLeaf Database Architecture

## 1. Zweck

Dieses Dokument beschreibt das produktive Datenmodell von SecretLeaf auf Supabase/Postgres.
Es ist die Referenz fuer Tabellen, Rollen, RLS, Indizes, Constraints und Migrationsregeln.

---

## 2. Systemkontext

Primarsystem:
- Supabase Postgres als kanonische Datenquelle fuer Auth, Studien, Rollen, Grow-Daten und Automation-Telemetrie.

Migrationspfad:
- Versionierte SQL-Migrationen unter supabase/migrations.

Wichtig:
- apps/api Prisma-Schema modelliert einen Legacy-Bereich und ist nicht das kanonische Produktmodell.

---

## 3. Kernentitaeten

### 3.1 Rollen und Zugriff

Tabelle:
- public.user_roles

Schluessel:
- user_id (PK, FK auf auth.users)

Rollenstand:
- CONSUMER
- PROVIDER
- ADMIN
- TEAM

RLS-Kernregeln:
- Nutzer koennen eigene Rollen-Zuordnung lesen.
- Initiale Self-Insert-Regel fuer CONSUMER vorhanden.
- Rollenpruefungen steuern privilegierte Operationen in Studien- und Admin-Flows.

### 3.2 Studien und Wissensdaten

Tabelle:
- public.studies

Relevante Felder (Auszug):
- quality_status, reviewed_by, reviewed_at, review_note
- source_fingerprint (unique)
- doi, study_type, relevance_score, editorial_priority
- matched_topics[], flags[], fetched_at

Indexierung (Auszug):
- unique source_fingerprint
- quality_status + created_at
- relevance_score
- editorial_priority + relevance_score
- doi (partial), fetched_at
- GIN auf matched_topics und flags

RLS-Kernregeln:
- Authenticated read/insert
- Update/Delete nur fuer PROVIDER-Rolle

### 3.3 Automations-Telemetrie

Tabelle:
- public.automation_job_runs

Zweck:
- Persistente Laufhistorie fuer Cron- und Engine-Jobs

Relevante Felder:
- job_name, started_at, finished_at, success
- fetched/inserted/updated/skipped/attempts
- error_details, metadata

RLS:
- authenticated select

### 3.4 Engine-Lernsystem

Tabellen:
- public.study_feedback
- public.scoring_weights_history
- public.engine_config

Zweck:
- Feedback-Signale speichern
- Gewichtungsanpassungen auditierbar machen
- Engine-Konfiguration dynamisch steuern

RLS:
- service_role Full Access fuer kritische Steuerungstabellen
- study_feedback mit authenticated own insert/select

### 3.5 Grow Domain

Tabellen:
- public.grows
- public.plants
- public.log_entries

Zweck:
- Authentifizierte Grow-Workflows persistent speichern

RLS-Kernregeln:
- Owner-basiert ueber user_id

---

## 4. Beziehungen

Wesentliche Relationen:
- auth.users 1:1 user_roles
- studies 1:n study_feedback
- grows 1:n plants
- grows 1:n log_entries
- plants optional 1:n log_entries

---

## 5. RLS- und Security-Prinzipien

Pflichtregeln:
- Jede produktive Tabelle mit Nutzerdaten hat RLS aktiviert.
- Jede privilegierte Mutation ist rollenbasiert abgesichert.
- Security-Logik wird nicht nur im Client, sondern serverseitig durchgesetzt.

Empfehlung fuer naechste Iteration:
- Einheitliches Policy-Naming-Schema fuer alle Tabellen.
- Policy-Tests fuer kritische Rollenfaelle (CONSUMER/PROVIDER/ADMIN/TEAM).

---

## 6. Index- und Performance-Strategie

Aktuelle Staerken:
- Zielgerichtete Kompositindizes fuer Studienfilterung
- GIN-Indizes fuer Array-Suchen
- Zeitbasierte Indizes fuer Job-Historie

Naechste Optimierungen:
1. Regelmaessige Pruefung auf ungenutzte Indizes
2. Query-basierte Indexvalidierung pro Release
3. Optionales Partitionskonzept fuer sehr grosse automation_job_runs

---

## 7. Migrationsstandard

Nicht verhandelbar:
- Keine produktive Schemaaenderung ohne Migration.
- Migrationen sind idempotent oder sauber sequenziert.
- Rollforward vor Rollback; destruktive Rollbacks nur mit Impact-Analyse.

Release-Check nach Migration:
1. RLS-Verhalten validiert
2. Kritische API-Routen gesund
3. Schreibpfade fuer studies/grow/logs intakt
4. Automation-Telemetrie schreibt fehlerfrei

---

## 8. Bekannte Risiken

- Legacy-Paralleldatenmodell in apps/api kann Begriffs- und Ownership-Drift erzeugen.
- Team-Rollenzuordnung per harter E-Mail-Migration ist operativ fragil.
- Fehlende formale DB-Test-Suite fuer Policies und Constraints.

---

## 9. Dokument-Metadaten

Owner: Product Engineering
Status: Active
Last updated: 2026-06-01
Next review: 2026-07-01
