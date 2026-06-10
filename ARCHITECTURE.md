# ARCHITECTURE.md

# SecretLeaf System Architecture

Version: 2.0

Status: Active

Owner: Product Engineering

---

# 1. Purpose

Dieses Dokument definiert die Zielarchitektur von SecretLeaf.

Es beschreibt:

* Produktarchitektur
* Systemarchitektur
* Datenflüsse
* Verantwortlichkeiten
* Skalierungsstrategie

ARCHITECTURE.md ist die technische Wahrheit des Systems.

---

# 2. Mission

SecretLeaf ist ein Grow Operating System.

Alle Systeme existieren, um den Grow Workflow zu unterstützen.

Nicht umgekehrt.

---

# 3. Product Architecture

SecretLeaf besteht aus vier Kernbereichen.

## Grow OS

Kernprodukt.

Verantwortlich für:

* Grows
* Pflanzen
* Aufgaben
* Dokumentation
* Fortschritt

---

## Knowledge System

Verantwortlich für:

* Wiki
* Studien
* Evidenz
* Suchfunktionen

---

## AI System

Verantwortlich für:

* Diagnose
* Empfehlungen
* Copilot
* Wissensextraktion

---

## Platform System

Verantwortlich für:

* Nutzer
* Rollen
* Abonnements
* Analytics
* Automationen

---

# 4. System Hierarchy

Priorität:

1. Grow OS

2. AI

3. Knowledge

4. Platform

---

Jede neue Funktion muss mindestens eine dieser Ebenen stärken.

---

# 5. Architecture Principles

## Single Source of Truth

Keine doppelte Datenhaltung.

---

## Product First

Architektur dient dem Produkt.

---

## Scalability First

Lösungen müssen langfristig skalierbar sein.

---

## Simplicity First

Komplexität wird aktiv reduziert.

---

## Documentation First

Architekturänderungen müssen dokumentiert werden.

---

# 6. Core Systems

## Frontend

Technologie:

Next.js

Verantwortung:

* UI
* Nutzerinteraktion
* Dashboards
* Routing

---

## Backend

Technologie:

Route Handler + Server Services

Verantwortung:

* Geschäftslogik
* Sicherheit
* Datenzugriff

---

## Database

Technologie:

Supabase PostgreSQL

Verantwortung:

* Persistenz
* Rollen
* Datenmodell

---

## Automation

Verantwortung:

* Studien
* Jobs
* Synchronisation

---

# 7. Domain Architecture

## Identity Domain

* Nutzer
* Rollen
* Teams

---

## Grow Domain

* Grows
* Pflanzen
* Logs
* Aufgaben

---

## Knowledge Domain

* Wiki
* Studien
* Taxonomie

---

## AI Domain

* Diagnose
* Empfehlungen
* Feedback

---

## Platform Domain

* Analytics
* Billing
* Notifications

---

# 8. Grow OS Architecture

Zentrale User Journey:

Grow

↓

Pflanzen

↓

Logs

↓

Analyse

↓

Diagnose

↓

Empfehlung

↓

Verbesserung

---

Der Grow Workflow ist der wichtigste Datenfluss im System.

---

# 9. Knowledge Architecture

Knowledge besteht aus:

* Wiki
* Studien
* Taxonomie
* Knowledge Graph

---

Wissen darf niemals isoliert sein.

Jeder Inhalt soll mit dem Grow Workflow verbunden werden.

---

# 10. AI Architecture

AI unterstützt:

* Diagnose
* Empfehlungen
* Wissenszugriff

---

AI trifft keine autonomen Entscheidungen.

AI liefert:

* Kontext
* Wahrscheinlichkeit
* Handlungsempfehlungen

---

# 11. Automation Architecture

Automationen sind produktunterstützend.

Nicht produktbestimmend.

---

Kernaufgaben:

* Studienaktualisierung
* Qualitätsbewertung
* Datenpflege
* Monitoring

---

# 12. Data Flow

User

↓

Frontend

↓

Backend

↓

Supabase

↓

Business Logic

↓

Response

---

Keine Client-seitige Sicherheitslogik.

---

# 13. Security Architecture

Pflicht:

* RLS
* Server Validation
* Rollenprüfung

---

Nicht erlaubt:

* Sicherheitslogik nur im Frontend

---

# 14. Knowledge Graph Strategy

Langfristig werden Wissensdaten als Graph modelliert.

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

↓

Empfehlungen

---

Ziel:

Zusammenhänge sichtbar machen.

---

# 15. AI Copilot Architecture

Langfristiges Ziel:

Persönlicher Grow Copilot.

---

Nutzer fragt:

"Was sollte ich heute tun?"

---

System nutzt:

* Grow Daten
* Logs
* Diagnosen
* Studien

---

Erzeugt:

* Prioritäten
* Empfehlungen
* Warnungen

---

# 16. Analytics Architecture

Alle wichtigen Nutzeraktionen werden erfasst.

---

Beispiele:

* Grow erstellt
* Diagnose gestartet
* Studie gelesen
* Aufgabe abgeschlossen

---

Ziel:

Produktentscheidungen datenbasiert treffen.

---

# 17. Billing Architecture

Zukünftige Architektur.

---

Pläne:

* Free
* Pro
* Team

---

Billing ist von Produktlogik getrennt.

---

# 18. Deployment Architecture

Umgebungen:

* Development
* Preview
* Production

---

Deployment muss reproduzierbar sein.

---

# 19. Legacy Strategy

Legacy-Systeme werden schrittweise entfernt.

---

Nicht erlaubt:

Parallele Produktarchitekturen ohne Dokumentation.

---

Jede Legacy-Komponente benötigt:

* Zweck
* Migrationsplan
* Enddatum

---

## Verbindliche Legacy-Entscheidung: apps/api (Fastify + Prisma)

Zweck:

* kurzfristige lokale Kompatibilität für alte Integrationen
* Referenz für frühere API-Strukturen

Migrationsplan:

1. Keine neuen Features im Legacy-Pfad
2. Alle neuen Produktfunktionen ausschließlich in `apps/web` Route Handlern
3. Legacy-Endpunkte schrittweise auf Next.js Route Handler migrieren oder abschalten
4. Entfernen von Prisma/SQLite-Abhängigkeiten nach Abschluss der Migration

Enddatum:

* Ziel: 2026-09-30 (vollständige Deaktivierung von `apps/api` im Produktpfad)

Risikoregel:

* Solange `apps/api` existiert, darf es kein Source-of-Truth für produktive Daten sein.
* Supabase PostgreSQL bleibt die einzige produktive Datenquelle.

---

# 20. Architecture Decision Rules

Vor jeder Architekturentscheidung fragen:

1. Vereinfacht es das System?
2. Verbessert es die Skalierbarkeit?
3. Verbessert es die Wartbarkeit?
4. Unterstützt es den Grow Workflow?

Wenn mindestens eine Antwort "Nein" ist:

Lösung überarbeiten.

---

# 21. Long-Term Target Architecture

SecretLeaf soll langfristig bestehen aus:

Grow OS

*

Knowledge Graph

*

AI Copilot

*

Automation Layer

*

Platform Layer

---

Nicht aus einer Sammlung einzelner Tools.

---

# 22. Final Rule

Jede technische Entscheidung muss den Produktkern stärken.

Der Produktkern ist:

Grow → Dokumentation → Diagnose → Empfehlung → Verbesserung

Wenn eine Änderung diesen Kreislauf nicht stärkt, sollte sie hinterfragt werden.
