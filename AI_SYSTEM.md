# SecretLeaf AI and Automation System

## 1. Zweck

Dieses Dokument beschreibt das KI- und Automationssystem von SecretLeaf inklusive Studien-Engine, Diagnose-Unterstuetzung und Betriebsmechanik.

---

## 2. Systemgrenzen

Enthaelt:
- Studien-Ingestion und Scoring
- Adaptive Gewichtungen
- Diagnoseunterstuetzung
- Automationsrouten und Health-Signale

Enthaelt nicht:
- Allgemeine Produkt-UI-Regeln (siehe DESIGN_SYSTEM.md)
- Gesamtarchitekturdetails ausserhalb KI/Automation (siehe ARCHITECTURE.md)

---

## 3. Kernbausteine

### 3.1 Studien-Engine

Pfad:
- apps/web/src/lib/engine

Funktion:
- Quellen abrufen
- Inhalte normalisieren
- Relevanz/Qualitaet bewerten
- Studien in Supabase persistieren

Konfigurierbarkeit:
- Dynamische Konfiguration ueber public.engine_config

### 3.2 Automationsrouten

Pfad:
- apps/web/src/app/api/automation/*

Kernjobs:
- study-refresh
- studies-sync
- engine-sync
- engine-health
- engine-adapt
- engine-reprocess
- cleanup

Schutz:
- CRON_SECRET fuer geschuetzte Ausfuehrung

### 3.3 Telemetrie und Lernen

Tabellen:
- automation_job_runs
- study_feedback
- scoring_weights_history

Nutzen:
- Betriebslage sichtbar machen
- Feedback in Systemverbesserung ueberfuehren
- Adaptive Entscheidungen auditierbar halten

---

## 4. Diagnose-System

Pfad:
- apps/web/src/lib/diagnose/tree.ts
- apps/web/src/components/diagnose/*

Rolle:
- Entscheidungsunterstuetzung im Grow-Alltag

Produktanforderung:
- Diagnose-Ergebnisse muessen in operative Flows (Log/Plan) ueberfuehrbar sein.

---

## 5. Qualitaets- und Sicherheitsregeln

Nicht verhandelbar:
- Keine Black-Box-Entscheidung ohne erklaerbaren Kontext
- Keine privilegierte Aktion ohne serverseitige Rollenpruefung
- Jeder Automationslauf muss auditierbar sein
- Fehlerfaelle muessen als explizite Statussignale sichtbar sein

---

## 6. Reifegradbewertung

Aktuelle Staerken:
- Deterministische Pipeline statt reiner Wrapper-Logik
- Datenpersistenz und Run-Telemetrie vorhanden
- Konfigurierbares Engine-Verhalten

Aktuelle Luecken:
- Observability-Endausbau noch nicht vollstaendig
- Produktseitige Value-Kommunikation der KI noch ausbaufaehig
- Formale Qualitaetsmetriken fuer Modell-/Scoring-Drift fehlen

---

## 7. Naechste Optimierungen

1. KPI-Set fuer AI-Qualitaet definieren (Precision, Freshness, Utility)
2. Alerting bei Drift und Run-Ausfaellen verschaerfen
3. Diagnose-to-Action-Loop weiter automatisieren
4. Explainability-Elemente im UI ausbauen

---

## 8. Dokument-Metadaten

Owner: Product Engineering
Status: Active
Last updated: 2026-06-01
Next review: 2026-07-01
