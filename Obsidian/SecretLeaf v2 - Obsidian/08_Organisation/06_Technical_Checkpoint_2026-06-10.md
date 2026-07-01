# Technical Checkpoint – 10.06.2026

---

tags: #technik #audit #checkpoint #known-issues
status: Aktiv
verknüpft: [[02_Datenbankarchitektur]] [[04_API_Architektur]] [[02_Daten_Risiken]] [[05_Entscheidungslog]]

---

## Zweck

Dieses Dokument verankert die Ergebnisse des vollständigen Code-Audits vom 10.06.2026 dauerhaft im Vault. Es ist der Brückenkopf zwischen dem strategischen/konzeptionellen Vault (geplante Architektur) und dem **tatsächlichen Implementierungsstand** des Repos ("SecretLeaf Code - Stand 10.6").

**Diese Inhalte sind jetzt vollständig in den Vault gespiegelt** und liegen übersichtlich gebündelt unter `07_Technik/Checkpoint_2026-06-10/`:
- [[00_Uebersicht]] – Gesamtüberblick (Mirror von `00_FINAL_CHECKPOINT_REPORT.md`)
- [[01_Architektur]] – Ist-Architektur
- [[02_Datenmodell]] – Ist-Datenmodell (Supabase, alle Tabellen/RLS/Trigger)
- [[03_Datenfluesse]] – End-to-End-Datenflüsse
- [[04_Issues]] – alle Findings
- [[05_Decision_Log]] – DL-01 bis DL-09
- [[06_Technical_Debt_Register]] – TD-01 bis TD-30
- [[07_Data_Moat_Audit]] – Data-Moat-Status

Dieser Vault-Ordner ist ab sofort die primäre, eigenständige Referenz ("Hauptordner") für den Audit-Stand. Die Original-Dateien bleiben zusätzlich im Repo unter `CHECKPOINT_2026-06-10/` (inkl. `AUDIT_CREATE_GROW_BUG.md` – Detailanalyse Create-Grow-Bug) als Quelle erhalten, sind für die tägliche Arbeit aber nicht mehr nötig — alles Relevante steht jetzt hier im Vault, vernetzt mit Wikilinks.

## Wichtigste Abweichung: Plan vs. Realität

Der Vault beschreibt ein Datenmodell mit `users/profiles, grows, plants, images, diagnoses, journal_entries, harvests` (siehe [[05_Supabase_Datenmodell]]) sowie eine API-Architektur mit klaren Bereichen (User/Grow/Bild/Diagnose/Wissens/KI-API).

**Im Code existiert dieses Modell teilweise** (`grows`, `plants`, `log_entries` in Supabase), **aber zusätzlich**:
- ein zweites, unabhängiges Backend (`apps/api`, Fastify+Prisma+SQLite, Marketplace-Domäne mit User/Listing/Purchase) — im Vault nicht dokumentiert, vermutlich Altlast eines früheren Produktpivots.
- Bild-Upload (`images`), Diagnosen-Persistenz (`diagnoses`) und Community-Features sind **nur als TypeScript-Typen vorhanden, ohne Backend** (TD-17/TD-18, TD-19 für KI-Diagnose = HTTP 501 Stub).
- Ein zusätzliches "Knowledge OS" (15+ Tabellen für Wiki/Studies/Wissensgraph mit pgvector, FTS, Automations) existiert produktiv, ist im strategischen Vault unter [[00_Knowledge_Graph]] / [[01_Cannabis_Wissenssystem]] konzeptionell angelegt, aber dessen technische Implementierung war hier nicht dokumentiert.

## Kritischster Befund: Grow-Daten werden nicht gespeichert (TD-01/TD-02)

Der zentrale Datenfluss "Grow erstellen → Grow Tagebuch → Ernte" (siehe [[02_Grow_Zyklus]], [[02_Datenbankarchitektur]]) ist **für jeden eingeloggten User in der Cloud-Persistenz unterbrochen**:

- Ursache: `lib/grow/utils.ts::generateId()` erzeugt IDs im Format `"<timestamp>-<random>"`, aber die Supabase-Spalten `grows.id`, `plants.id`, `log_entries.id` sind vom Typ `uuid` mit `default gen_random_uuid()`.
- Jeder Insert mit dieser ID schlägt mit Postgres-Fehler `22P02 invalid input syntax for type uuid` fehl.
- Das Frontend macht ein optimistisches UI-Update, rollt es nach dem Fehler aber wieder zurück → für den User sieht es so aus, als würde "Create Grow" einfach nichts tun.
- **Konsequenz für den Data Moat**: Die in [[06_Data_Moat_Strategie]] und [[01_Datenstrategie]] beschriebene zentrale Sammlung von Grow-Verläufen findet aktuell **nicht statt**. Daten existieren nur lokal im Browser (localStorage) der jeweiligen User.

Vollständige Herleitung: `AUDIT_CREATE_GROW_BUG.md` und `CHECKPOINT_2026-06-10/03_DATENFLUESSE.md` (Abschnitt "Grow erstellen").

**Es wurde noch kein Fix umgesetzt** — dies ist reine Dokumentation des Ist-Zustands gemäß Auftrag.

## Weitere zentrale Findings (Kurzreferenz)

| TD/DL-ID | Thema | Priorität | Bezug im Vault |
|---|---|---|---|
| TD-01/02, DL-01 | Grow/Plant/LogEntry-IDs sind keine UUIDs → Cloud-Insert schlägt fehl | Kritisch | [[02_Datenbankarchitektur]], [[06_Data_Moat_Strategie]] |
| TD-03/04/05, DL-02 | Zwei unabhängige Backends/Auth-Systeme (Fastify-Marketplace vs. Next.js/Supabase) | Hoch | [[01_Systemarchitektur]], [[04_API_Architektur]] |
| TD-06/07, DL-03 | Redundante Automation-/Sync-Pipelines für Studies & Fertilizer-Preise | Mittel | [[01_Cannabis_Wissenssystem]] |
| TD-08/09/14, DL-04/05 | RLS-Lücken (ADMIN/TEAM, Config-Tabellen) + nicht-portable Migration | Hoch | [[02_Datenbankarchitektur]] |
| TD-10/12, DL-06 | Fehlende Indizes auf Grow-Tabellen / verlorener Index nach Partitionierung | Mittel | [[02_Datenbankarchitektur]] |
| TD-17/18/19, DL-08 | Foto-Upload, Community-Grows, KI-Bilddiagnose nur als Stubs | Mittel (Produktentscheidung) | [[03_Bilddaten]], [[04_KI_Diagnose]] |
| TD-20, DL-07 | Sentry/Monitoring inaktiv — Fehler wie TD-01 bleiben unsichtbar | Hoch | — |
| TD-22 | Newsletter-Signup nicht persistiert | Niedrig | [[05_Aktivierungssystem]] |
| TD-28/29, DL-09 | Diagnose-Flow umgeht Sync & Analytics | Mittel | [[04_KI_Diagnose]], [[04_Diagnosedaten]] |
| TD-30 | Status der Vercel-Env-Variablen (API Keys) unbekannt | Hoch | [[06_KI_Integration]] |

## Offene Fragen (an Founder/Team)

- Ist `apps/api` (Fastify-Marketplace) noch produktiv im Einsatz oder kann er archiviert werden? → betrifft [[01_Produktentscheidungen]]
- Sind die 16 Supabase-Migrationen vollständig auf der Live-Instanz angewendet (insb. Migration 10 mit hartkodiertem User)?
- Welche API-Keys (OpenAI, SerpAPI, Plausible, Sentry-DSN) sind in Vercel tatsächlich gesetzt? (TD-30)

## Empfohlene nächste Schritte

1. TD-01/TD-02 beheben (Voraussetzung für jeglichen Data-Moat-Fortschritt) — separater Fix-Plan nach Freigabe.
2. Sentry reaktivieren (TD-20), damit zukünftige Bugs dieser Art nicht wieder monatelang unbemerkt bleiben.
3. Strategische Entscheidung zu `apps/api`/Marketplace treffen (DL-02) und in [[01_Produktentscheidungen]] festhalten.

## Verknüpfte Dokumente

[[02_Datenbankarchitektur]]
[[04_API_Architektur]]
[[02_Daten_Risiken]]
[[05_Entscheidungslog]]
[[06_Data_Moat_Strategie]]
[[01_Datenstrategie]]

## Änderungsverlauf

### V1 (10.06.2026)
Erstversion — Ergebnis des vollständigen Repository-Audits "SecretLeaf v2 - Full Repository Audit & Checkpoint Mode".

### V1.1 (10.06.2026)
Vollständige Detaildokumente (00–07) aus `CHECKPOINT_2026-06-10/` als eigene Notizen nach `07_Technik/Checkpoint_2026-06-10/` gespiegelt und mit Wikilinks vernetzt. Vault ist jetzt der primäre Hauptordner für den Audit-Stand.
