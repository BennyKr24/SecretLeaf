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
* grow_logs
* grow_tasks
* grow_reminders

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
* mehrere Logs
* mehrere Aufgaben

---

Beziehung:

Grow

↓

Plants

↓

Logs

---

## Plant

Eine Pflanze gehört genau einem Grow.

---

Pflichtfelder:

* id
* grow_id
* strain
* stage
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

Vorbereitung für Monetarisierung.

---

Tabelle:

subscriptions

---

Pflichtfelder:

* user_id
* plan
* status
* current_period_end

---

Pläne:

* FREE
* PRO
* TEAM

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
