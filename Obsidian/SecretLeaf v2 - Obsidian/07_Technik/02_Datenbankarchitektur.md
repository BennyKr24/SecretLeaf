# Datenbankarchitektur

## Zweck

Dieses Dokument definiert die zentrale Datenstruktur von SecretLeaf.

Es beschreibt, welche Kernobjekte existieren, wie diese miteinander verbunden sind und wie daraus langfristig der Data Moat entsteht.

## Zusammenfassung

Die Datenbank von SecretLeaf ist nicht um Artikel oder Inhalte herum aufgebaut.

Sie ist um Grow-Zyklen aufgebaut.

Der Grow-Zyklus ist die wichtigste Dateneinheit des gesamten Systems.

Alle weiteren Daten werden direkt oder indirekt mit Grow-Zyklen verknüpft.

## Strategische Bedeutung

Die Datenbank bildet die Grundlage für:

- Grow Tagebuch
    
- Dashboard
    
- Diagnosen
    
- Empfehlungen
    
- KI
    
- Benchmarks
    
- Monetarisierung
    

## Kernobjekte

### User

Repräsentiert einen Nutzer.

Eigenschaften:

- User ID
    
- Account
    
- Einstellungen
    
- Abonnements
    

## Grow

Wichtigste Dateneinheit.

Eigenschaften:

- Grow ID
    
- Startdatum
    
- Status
    
- Medium
    
- Umgebung
    

Ein User kann mehrere Grows besitzen.

## Pflanze

Gehört zu einem Grow.

Eigenschaften:

- Pflanzen ID
    
- Sorte
    
- Alter
    
- Status
    

Ein Grow kann mehrere Pflanzen enthalten.

## Tagebucheintrag

Dokumentation eines Ereignisses.

Beispiele:

- Gießen
    
- Düngen
    
- Training
    
- Beobachtung
    

## Bild

Bild einer Pflanze.

Eigenschaften:

- Bild ID
    
- Uploaddatum
    
- Kategorie
    
- Grow Referenz
    

## Diagnose

Diagnose eines Problems.

Eigenschaften:

- Diagnose ID
    
- Symptome
    
- Ursache
    
- Wahrscheinlichkeit
    
- Empfehlung
    

## Ernte

Abschluss eines Grow-Zyklus.

Eigenschaften:

- Gewicht
    
- Qualität
    
- Dauer
    
- Bewertung
    

## Objektbeziehungen

User

↓

Grow

↓

Pflanze

↓

Bild

↓

Diagnose

↓

Ernte

## Erweiterte Objekte

### Sorte

### Terpen

### Cannabinoid

### Krankheit

### Symptom

### Nährstoff

### Maßnahme

Diese Objekte werden zusätzlich im Knowledge Graph gespeichert.

## Datenebenen

### Nutzerdaten

Accountbezogene Informationen.

### Growdaten

Historische Grow-Dokumentation.

### Diagnosedaten

Probleme und Lösungen.

### Wissensdaten

Knowledge Graph.

### Analysedaten

Benchmarks und KI-Daten.

## Datenprinzipien

### Ein Objekt besitzt eine ID

### Daten werden nicht dupliziert

### Historie bleibt erhalten

### Beziehungen sind explizit

### Daten müssen KI-fähig sein

## Langfristige Architektur

User

↓

Grow

↓

Pflanze

↓

Bild

↓

Diagnose

↓

Ernte

↓

Benchmark

↓

KI Training

## Data Moat Verbindung

Jeder abgeschlossene Grow erweitert:

- Diagnosedaten
    
- Bilddaten
    
- Benchmarkdaten
    
- Wissensdaten
    

Dadurch verbessert sich das gesamte System.

## Risiken

- Schlechte Datenqualität
    
- Daten-Duplikate
    
- Fehlende Beziehungen
    
- Inkonsistente Strukturen
    

## ✅ Persistence-Recovery (Stand 01.07.2026)

Der am 10.06.2026 dokumentierte UUID-/Persistenzfehler ist seit [[Checkpoint_2026-07-01_Persistence_Recovery]] geschlossen. Eingeloggte Nutzer schreiben Grows, Plants und Log-Einträge produktiv nach Supabase; RLS basiert auf `auth.uid() = user_id`. Der authentifizierte Flow schreibt zuerst serverseitig und navigiert erst danach.

Historische Details: [[06_Technical_Checkpoint_2026-06-10]], `CHECKPOINT_2026-06-10/02_DATENMODELL.md` (Anomalie DB-10), `AUDIT_CREATE_GROW_BUG.md`. Aktueller Abschluss: [[Checkpoint_2026-07-01_Persistence_Recovery]].

Zusätzlich existiert produktiv ein umfangreiches "Knowledge OS" (Wiki/Studies/Wissensgraph mit pgvector, FTS, Automations, ~15 Tabellen), das in diesem Dokument noch nicht im Detail erfasst war — siehe `CHECKPOINT_2026-06-10/02_DATENMODELL.md`.

## Verknüpfte Dokumente

[[01_Systemarchitektur]]
[[03_KI_Architektur]]
[[04_API_Architektur]]
  
[[07_Entitaetsmodell]]
[[00_Knowledge_Graph]]
  
[[02_Grow_Zyklus]]
[[04_Diagnosedaten]] 
[[03_Bilddaten]]
[[05_Erntedaten]]
[[06_Technical_Checkpoint_2026-06-10]]
[[Checkpoint_2026-07-01_Persistence_Recovery]]

## Änderungsverlauf

### V1

Erstversion

### V1.1 (10.06.2026)

Hinweis auf kritischen UUID-Bug (TD-01/TD-02) und Knowledge-OS-Erweiterung ergänzt, siehe [[06_Technical_Checkpoint_2026-06-10]].

### V1.2 (01.07.2026)

Persistence-Recovery dokumentiert: TD-01/TD-02 ist geschlossen, Supabase ist wieder produktive Grow-OS-Datenquelle.