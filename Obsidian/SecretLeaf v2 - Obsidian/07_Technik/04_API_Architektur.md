# API Architektur

## Zweck

Dieses Dokument definiert die Kommunikationsstruktur zwischen Frontend, Backend, Datenbank, KI-Systemen und externen Diensten.

## Zusammenfassung

Die API ist das Nervensystem von SecretLeaf.

Sie verbindet:

- Nutzeroberflächen
    
- Datenbank
    
- Knowledge Graph
    
- KI-Systeme
    
- externe Integrationen
    

zu einem gemeinsamen System.

## Strategische Bedeutung

Eine saubere API ermöglicht:

- schnelle Entwicklung
    
- Wiederverwendbarkeit
    
- Skalierbarkeit
    
- KI-Integration
    

## Architektur

Frontend

↓

API Layer

↓

Backend Services

↓

Datenbank

↓

Knowledge Graph

↓

KI Layer

## Hauptbereiche

### User API

Aufgaben:

- Login
    
- Registrierung
    
- Einstellungen
    

### Grow API

Aufgaben:

- Grow erstellen
    
- Grow bearbeiten
    
- Grow Historie
    

### Bild API

Aufgaben:

- Upload
    
- Speicherung
    
- Analyse
    

### Diagnose API

Aufgaben:

- Diagnose anfordern
    
- Diagnose speichern
    
- Feedback
    

### Wissens API

Aufgaben:

- Entitäten
    
- Knowledge Graph
    
- Suchfunktionen
    

### KI API

Aufgaben:

- Empfehlungen
    
- Prognosen
    
- Assistent
    

## API Prinzipien

### API First

### Wiederverwendbarkeit

### Versionierung

### Sicherheit

### Skalierbarkeit

## Langfristige Nutzung

Die API soll später genutzt werden für:

- Web App
    
- Mobile App
    
- KI Assistent
    
- Partner Integrationen
    

## Risiken

- Zu komplexe Endpunkte
    
- Schlechte Dokumentation
    
- Fehlende Versionierung
    

## ⚠️ Ist-Zustand (Stand 10.06.2026)

Im Code existieren **zwei unabhängige Backends**: Das hier beschriebene API-Layer entspricht `apps/web/src/app/api/*` (Next.js Route Handlers, Supabase). Zusätzlich gibt es `apps/api` (Fastify + Prisma + SQLite, eigenes JWT-Auth, "Marketplace"-Domäne mit User/Listing/Purchase), das vom Web-Frontend offenbar ungenutzt ist und in dieser Architektur nicht vorgesehen war. Strategische Entscheidung nötig (siehe [[01_Produktentscheidungen]]).

Die "Grow API" (Grow erstellen/bearbeiten) ist seit dem Persistence-Recovery vom 01.07.2026 produktiv funktionsfähig: Grows, Plants und Log-Einträge persistieren über Supabase/RLS und wurden per Reload-, Logout/Login- und Second-Device-Test bestätigt — siehe [[Checkpoint_2026-07-01_Persistence_Recovery]]. Die "Bild API" und Teile der "Diagnose API" (Persistenz/Feedback) sind weiterhin nicht vollständig implementiert (Stubs bzw. zukünftige Produktentscheidung).

## Verknüpfte Dokumente

[[01_Systemarchitektur]]
[[02_Datenbankarchitektur]]
[[03_KI_Architektur]]
  
[[02_Grow_Tagebuch]]
[[03_Grow_Dashboard]]
[[04_KI_Diagnose]]
  
[[06_AI_Assistant_Spec]]
[[06_Technical_Checkpoint_2026-06-10]]
[[Checkpoint_2026-07-01_Persistence_Recovery]]

## Änderungsverlauf

### V1

Erstversion

### V1.1 (10.06.2026)

Ist-Zustand zu zwei parallelen Backends und Stub-Status der Bild-/Diagnose-API ergänzt, siehe [[06_Technical_Checkpoint_2026-06-10]].

### V1.2 (01.07.2026)

Grow-API-Status nach Persistence-Recovery aktualisiert. Der alte Hinweis auf den nicht funktionsfähigen Grow-Create-Pfad ist durch den Checkpoint vom 01.07.2026 überholt.