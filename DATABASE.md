# DATABASE.md

# SecretLeaf Database Architecture

Version: 2.0

Status: Active

Owner: Product Engineering

Primary Database: Supabase PostgreSQL

---

# 1. Purpose

Dieses Dokument definiert das kanonische Datenmodell von SecretLeaf.

Es ist die einzige verbindliche Quelle für:

* Datenmodell
* Tabellen
* Beziehungen
* Rollen
* RLS
* Constraints
* Migrationen
* Datenqualitätsregeln

---

# 2. Core Principle

Die Datenbank dient dem Produkt.

Nicht umgekehrt.

Das Datenmodell muss:

* einfach
* nachvollziehbar
* skalierbar
* wartbar

sein.

---

# 3. Single Source of Truth

Supabase PostgreSQL ist die einzige produktive Datenquelle.

---

Nicht erlaubt:

* doppelte Datenhaltung
* konkurrierende Systeme
* parallele Wahrheiten

---

Ausnahmen müssen dokumentiert werden.

---

# 4. Domain Architecture

SecretLeaf wird in fachliche Domänen unterteilt.

---

## Identity Domain

Verantwortlich für:

* Nutzer
* Rollen
* Teams
* Berechtigungen

---

Tabellen:

* auth.users
* public.user_roles
* public.teams
* public.team_members

---

## Grow OS Domain

Verantwortlich für:

* Grows
* Pflanzen
* Aktivitäten
* Aufgaben
* Erinnerungen

---

Tabellen:

* grows
* plants
* log_entries

Hinweis:

* Tasks liegen aktuell im JSONB-Plan eines Grows (`grows.plan`).
* Separate Tabellen fuer `grow_tasks` und `grow_reminders` sind Zielarchitektur, aber nicht aktueller Produktionsstand.

---

## Knowledge Domain

Verantwortlich für:

* Wiki
* Studien
* Taxonomie
* Wissensgraph

---

Tabellen:

* studies
* wiki_entries
* wiki_relationships
* categories
* tags

---

## AI Domain

Verantwortlich für:

* Diagnosen
* Empfehlungen
* AI Feedback
* AI Historie

---

Tabellen:

* diagnoses
* recommendations
* ai_feedback
* ai_runs

---

## Platform Domain

Verantwortlich für:

* Analytics
* Abonnements
* Benachrichtigungen
* Automationen

---

Tabellen:

* subscriptions
* notifications
* events
* automation_job_runs

---

# 5. Identity Model

## Users

Referenz:

auth.users

---

Jeder Nutzer besitzt:

* id
* email
* created_at

---

## Roles

Tabelle:

user_roles

---

Erlaubte Rollen:

* CONSUMER
* PROVIDER
* ADMIN
* TEAM

---

Keine Freitext-Rollen.

---

# 6. Grow Model

## Grow

Ein Grow ist die oberste Einheit.

---

Ein Grow besitzt:

* mehrere Pflanzen
* mehrere Log-Eintraege (`log_entries`)
* einen JSONB-Plan mit Phasen und Aufgaben

---

Beziehung:

Grow

↓

Plants

↓

Log Entries

---

## Plant

Eine Pflanze gehört genau einem Grow.

---

Pflichtfelder:

* id
* grow_id
* user_id
* name
* created_at

---

## Log Entry

Dokumentiert Ereignisse.

---

Beispiele:

* Bewässerung
* Nährstoffgabe
* Training
* Diagnose
* Foto

Produktive Tabelle:

* `log_entries`

Pflichtfelder:

* id
* grow_id
* user_id
* entry_type
* data
* logged_at
* created_at

RLS:

* Nutzer duerfen nur Eintraege zu eigenen Grows lesen/schreiben.
* Supabase `auth.uid()` ist die einzige Autoritaet fuer RLS-geschuetzte Writes.

---

# 7. Knowledge Model

Alle Wissensdaten sind strukturierte Entitäten.

---

Keine unstrukturierten Artikel.

---

## Wiki Entry

Pflichtfelder:

* id
* title
* slug
* type
* summary
* category
* updated_at

---

## Study

Pflichtfelder:

* title
* doi
* source
* quality_status
* study_type
* evidence_level

---

# 8. Knowledge Graph

Langfristig besitzt SecretLeaf einen Wissensgraphen.

---

Jeder Eintrag muss Beziehungen besitzen.

---

Beispiel:

Calcium

↓

Calciummangel

↓

Symptome

↓

Diagnose

↓

Studien

---

Tabelle:

wiki_relationships

---

# 9. Diagnosis Model

Diagnosen sind eigene Entitäten.

---

Diagnose enthält:

* Symptome
* Ursachen
* Wahrscheinlichkeit
* Empfehlungen

---

Diagnosen dürfen nicht nur Textblöcke sein.

---

# 10. Recommendation Model

Empfehlungen müssen nachvollziehbar sein.

---

Jede Empfehlung speichert:

* Quelle
* Zeitpunkt
* Auslöser
* Nutzerfeedback

---

# 11. Analytics Model

Analytics sind Pflicht.

---

Tabelle:

events

---

Pflichtfelder:

* event_name
* user_id
* created_at
* metadata

---

Beispiele:

* grow_created
* diagnosis_opened
* study_viewed
* task_completed

---

# 12. Subscription Model

Live seit 2026-08-19 (Migration `20260819200137_subscriptions.sql`).
Trial + Codes ergänzt 2026-08-27 (`202608270000_pro_trial_and_codes.sql`).

---

Tabellen:

* subscriptions
* pro_codes
* pro_code_redemptions

---

**subscriptions** — eine Zeile pro Nutzer. Fehlende Zeile = free.

Pflichtfelder: user_id, plan, status, current_period_end.

Zusätzlich:

* stripe_customer_id, stripe_subscription_id — Zuordnung von Stripe-Webhook-Events
* source — `stripe` | `trial` | `code`: wie das Entitlement erteilt wurde
* trial_redeemed_at — gesetzt beim ersten Aktivieren des Self-Serve-Trials;
  blockiert einen zweiten Trial unabhängig vom aktuellen status

Pläne (lowercase — deckungsgleich mit dem UserPlan-TS-Type in apps/web): free, pro, team.

**Entitlement-Check** (`getUserSubscription()` in `apps/web/src/lib/serverAuth.ts`):
status ∈ {`active`, `trialing`} **und** `current_period_end` in der Zukunft
(oder NULL) → Pro. Dadurch laufen Trial und Code-Grants beim Lesen ab, ohne
Cron; eine gesunde Stripe-`active`-Subscription trägt immer ein zukünftiges
Periodenende, zahlende Nutzer sind also nicht betroffen.

---

**pro_codes** — Admin-generierte Zugangscodes (Panel: `/dashboard/admin/codes`).
Felder: code (normalisiert, unique), duration_days, max_redemptions,
redemption_count, note, expires_at (nullable), active, created_by, created_at.
Nur Service-Role (Admin-API hinter `requireAdmin`) liest/schreibt — kein RLS-Policy.

**pro_code_redemptions** — Ledger, eine Zeile pro (code_id, user_id); das
unique-Constraint ist zugleich der Concurrency-Guard. Einlösen verlängert
`subscriptions.current_period_end` um `duration_days` (source=`code`,
status=`active`). RLS: Nutzer liest seine eigenen Redemptions.

---

# 13. Notification Model

Benachrichtigungen sind eigene Entitäten.

---

Nicht als freie JSON-Daten speichern.

---

Tabelle:

notifications

---

# 14. Automation Model

Tabelle:

automation_job_runs

---

Speichert:

* Laufzeit
* Erfolg
* Fehler
* Metadaten

---

Zweck:

Auditierbarkeit.

---

# 15. Data Integrity Rules

Pflicht:

* Primary Keys
* Foreign Keys
* Constraints

---

Nicht erlaubt:

* verwaiste Datensätze
* ungültige Referenzen
* UI-Auth-Zustand ohne echte Supabase-Session als Schreibberechtigung
* lokale Phantom-Daten im authentifizierten Pfad vor erfolgreichem Server-Write

---

# 16. Naming Convention

Tabellen:

snake_case

Plural.

---

Beispiele:

* grows
* plants
* studies

---

Spalten:

snake_case

---

IDs:

UUID

---

# 17. Row Level Security

Pflicht für alle produktiven Tabellen.

---

Regeln:

Nutzer sehen nur eigene Daten.

---

Privilegierte Operationen:

rollenbasiert.

---

Keine Sicherheitslogik ausschließlich im Frontend.

---

# 18. Index Strategy

Indizes nur für reale Queries.

---

Vermeiden:

* unnötige Indizes
* doppelte Indizes

---

Regelmäßige Prüfung:

* Nutzung
* Performance
* Kosten

---

# 19. Migration Strategy

Jede Schemaänderung benötigt:

Migration.

---

Nicht erlaubt:

Manuelle Produktionsänderungen.

---

Migrationen müssen:

* reproduzierbar
* nachvollziehbar
* versioniert

sein.

---

# 20. Data Quality Rules

Jeder Datensatz muss:

* valide
* vollständig
* konsistent

sein.

---

Fehlende Pflichtfelder sind nicht erlaubt.

---

# 21. Backup Strategy

Regelmäßige Backups.

---

Wiederherstellung muss getestet werden.

---

Backups gelten nicht als erfolgreich, wenn keine Recovery geprüft wurde.

---

# 22. Performance Principles

Optimierung nach Messung.

---

Keine frühzeitige Komplexität.

---

Einfachste funktionierende Lösung bevorzugen.

---

# 23. Future Domains

Geplante Erweiterungen:

* Achievements
* Grow Benchmarks
* Team Collaboration
* Marketplace Integrationen
* AI Memory
* Knowledge Graph Expansion

---

# 24. Forbidden Patterns

Verboten:

* doppelte Datenhaltung
* konkurrierende Datenquellen
* unstrukturierte JSON-Sammlungen
* fehlende Foreign Keys
* fehlende RLS
* manuelle Produktionsänderungen
* zweite Auth-Wahrheit neben der Supabase Session

---

# 25. Architecture Relationship

DATABASE.md ist die Wahrheit für:

* Tabellen
* Beziehungen
* Datenmodell

ARCHITECTURE.md beschreibt Systeme.

DATABASE.md beschreibt Daten.

---

# 26. Final Rule

Jede neue Tabelle muss eine Frage beantworten:

Welches Nutzerproblem löst sie?

Wenn die Antwort unklar ist:

Die Tabelle wird nicht erstellt.

---

# 27. Document Metadata

Owner: Product Engineering
Status: Active
Last updated: 2026-07-01
Next review: 2026-08-01
