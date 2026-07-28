# SecretLeaf Agent Operating Model

## 1. Zweck

Dieses Dokument definiert, welche AI- und Automations-Agenten in SecretLeaf welche Aufgaben übernehmen dürfen.
Ziel ist ein kontrolliertes, nachvollziehbares und sicheres Agentensystem.

---

## 2. Agentenklassen

1. Produkt-Agenten
- Unterstützen Discovery, Priorisierung, KPI-Reviews.

2. Wissens-Agenten
- Unterstuetzen Studienaufbereitung, Taxonomie und Quellenstruktur.

3. Betriebs-Agenten
- Unterstuetzen Monitoring, Incident-Kontext und Run-Auswertungen.

4. Entwicklungs-Agenten
- Unterstuetzen Codeanalyse, Refactoring und Dokumentationskonsistenz.

---

## 3. Nicht verhandelbare Guardrails

- Kein Agent darf produktive Daten ohne expliziten freigegebenen Workflow veraendern.
- Kein Agent darf Sicherheitsmechanismen (Auth, RLS, Rollenpruefungen) umgehen.
- Jeder Agentenlauf muss in Ziel, Eingaben und Ergebnis nachvollziehbar sein.
- Kritische Entscheidungen (Schema, Abrechnung, Rollenmodell) bleiben menschlich freigegeben.

---

## 4. Rollen und Verantwortlichkeiten

Owner:
- Product Engineering

Freigabepflichtig:
- Architekturentscheidungen
- Datenbankschema-Aenderungen
- Produktive Automation mit Nutzerwirkung

Review-Pflicht:
- Security
- Accessibility
- i18n
- API-Vertragsaenderungen

---

## 5. Standardablauf fuer Agentenarbeit

1. Kontextaufnahme
- Betroffene Komponenten, APIs, Datenmodelle und Dokus erfassen.

2. Analyse
- Risiken, Abhaengigkeiten und Seiteneffekte explizit benennen.

3. Umsetzung
- Kleinste robuste Aenderung mit klarer Wirkung.

4. Verifikation
- Typecheck/Build/Smoke-Checks fuer betroffene Flaechen.

5. Dokumentation
- Architektur-/Produkt-/Betriebsdoku im gleichen PR aktualisieren.

---

## 6. Qualitaetskriterien

Ein Agentenbeitrag gilt nur als fertig, wenn:
- Nutzerwirkung klar ist
- Sicherheitsanforderungen eingehalten werden
- Monitoring/Fehlerfaelle beruecksichtigt sind
- Doku und Begriffe konsistent sind

---

## 7. Schnittstellen zu anderen Dokumenten

- Produktstrategie: PRODUCT.md
- Technische Architektur: ARCHITECTURE.md
- Betriebsprozesse: DEPLOYMENT.md
- Designsystem: DESIGN_SYSTEM.md
- Datenmodell: DATABASE.md
- Lokalisierung: LOCALIZATION.md
- KI-System: AI_SYSTEM.md
- Wiki-Struktur: WIKI_ARCHITECTURE.md
- Standards: STANDARDS.md

---

## 8. Dokument-Metadaten

Owner: Product Engineering
Status: Active
Last updated: 2026-06-01
Next review: 2026-07-01
