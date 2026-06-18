# Knowledge Graph V2

## Zweck

Dieses Dokument definiert die langfristige Wissens- und Datenarchitektur von SecretLeaf.

Der Knowledge Graph bildet das zentrale Nervensystem der Plattform.

Er verbindet:

- Nutzer
    
- Grow-Daten
    
- Wissen
    
- Diagnosen
    
- Empfehlungen
    
- KI
    

zu einem gemeinsamen System.

## Grundprinzip

SecretLeaf speichert nicht primär Artikel.

SecretLeaf speichert Entitäten und Beziehungen.

Nicht:

Artikel → Artikel

Sondern:

Entität → Beziehung → Entität

## Architekturübersicht

Cannabis

├── Growing

├── Sorten

├── Krankheiten

├── Nährstoffe

├── Cannabinoide

├── Terpene

├── Extrakte

├── Grow-Techniken

├── Diagnosen

├── Benchmarks

└── Grow-Daten

## Entitätstypen

### Nutzer

Beispiele:

- Grower
    
- Premium Nutzer
    

---

### Grow

Beispiele:

- Grow Zyklus
    
- Aktiver Grow
    

---

### Pflanze

Beispiele:

- Pflanze A
    
- Pflanze B
    

---

### Sorte

Beispiele:

- White Widow
    
- Gelato
    
- Blue Dream
    

---

### Krankheit

Beispiele:

- Mehltau
    
- Wurzelfäule
    

---

### Symptom

Beispiele:

- Gelbe Blätter
    
- Braune Flecken
    

---

### Nährstoff

Beispiele:

- Stickstoff
    
- Calcium
    
- Magnesium
    

---

### Cannabinoid

Beispiele:

- THC
    
- CBD
    
- CBG
    

---

### Terpen

Beispiele:

- Myrcen
    
- Limonen
    
- Caryophyllen
    

---

### Grow Technik

Beispiele:

- Topping
    
- LST
    
- SCROG
    

---

### Extrakt

Beispiele:

- Hash
    
- Rosin
    
- BHO
    

---

### Maßnahme

Beispiele:

- CalMag
    
- pH Anpassung
    
- Defoliation
    

---

### Diagnose

Beispiele:

- Calcium Mangel
    
- Lichtstress
    

---

### Ernte

Beispiele:

- Grow Ergebnis
    

## Hauptbeziehungen

### enthält

Sorte

↓

enthält

↓

Terpen

---

Sorte

↓

enthält

↓

Cannabinoid

### verursacht

Krankheit

↓

verursacht

↓

Symptom

---

Nährstoffmangel

↓

verursacht

↓

Symptom

### behandelt

Maßnahme

↓

behandelt

↓

Krankheit

### verbessert

Maßnahme

↓

verbessert

↓

Ergebnis

### nutzt

Grow

↓

nutzt

↓

Sorte

### erzeugt

Grow

↓

erzeugt

↓

Ernte

### dokumentiert

Nutzer

↓

dokumentiert

↓

Grow

## Grow Layer

Nutzer

↓

Grow

↓

Pflanze

↓

Tagebucheintrag

↓

Bild

↓

Diagnose

↓

Ernte

Dies ist der wichtigste Datenpfad des gesamten Systems.

## Diagnose Layer

Symptom

↓

führt zu

↓

Diagnose

↓

empfiehlt

↓

Maßnahme

↓

verbessert

↓

Ergebnis

## Sorten Layer

Sorte

↓

enthält

↓

Terpen

---

Sorte

↓

enthält

↓

Cannabinoid

---

Sorte

↓

tritt häufig auf mit

↓

Krankheit

---

Sorte

↓

liefert

↓

Benchmarkdaten

## Nährstoff Layer

Nährstoff

↓

Mangel verursacht

↓

Symptom

---

Nährstoff

↓

Überschuss verursacht

↓

Symptom

---

Symptom

↓

führt zu

↓

Diagnose

---

Diagnose

↓

empfiehlt

↓

Maßnahme

## KI Layer

Grow Daten

↓

Knowledge Graph

↓

Diagnose Engine

↓

Recommendation Engine

↓

Prognose Engine

↓

Grow Assistant

## SEO Layer

Knowledge Graph

↓

Entitäten

↓

Landingpages

↓

Traffic

↓

Registrierung

↓

Grow

↓

MAG

## Data Moat Layer

Grow

↓

Daten

↓

Diagnosen

↓

Feedback

↓

Bessere KI

↓

Bessere Ergebnisse

↓

Mehr Grower

↓

Mehr Daten

## Priorität der Entitäten

### Tier S

Grow

Pflanze

Diagnose

Symptom

Krankheit

Sorte

---

### Tier A

Nährstoff

Terpen

Cannabinoid

Grow Technik

Ernte

---

### Tier B

Extrakte

Equipment

Breeder

Marken

## Langfristige Vision

Langfristig soll jede Cannabis-relevante Entität innerhalb von SecretLeaf mit allen relevanten Entitäten verknüpft sein.

Dadurch entsteht:

- Wissenssystem
    
- Diagnosesystem
    
- Empfehlungssystem
    
- SEO-System
    
- KI-System
    

auf einer gemeinsamen Datenbasis.

## Zentrale Erkenntnis

Der Knowledge Graph ist nicht Teil von SecretLeaf.

Der Knowledge Graph IST SecretLeaf.

---

## POC: Knowledge Graph MVP

### Problem
Cannabis-Wissen ist fragmentiert. Keine Plattform verbindet Entitäten (Sorten, Krankheiten, Nährstoffe) strukturiert.

### Lösung
Relationaler Knowledge Graph in Supabase als Fundament für Diagnosen, SEO und KI.

### MVP des POC
- 50 Krankheiten + 20 Nährstoffe + 200 Sorten
- Beziehungen: Krankheit → Symptom, Nährstoff → Mangelsymptom, Sorte → Terpen

### Tech Stack
PostgreSQL (Supabase) mit JSONB + separate Relation-Tabellen

### Datenmodell (vereinfacht)
```sql
entities (id, type, name, slug, data JSONB)
relations (from_id, to_id, relation_type, weight)
```

### Risiken
- Datenqualität bei manueller Befüllung
- Initialer Aufwand für Dateneingabe

### Aufwand
2 Wochen für Schema und erste 100 Entitäten

### Nächste Schritte
- [ ] Schema in Supabase anlegen
- [ ] 20 Krankheiten mit Symptomen befüllen
- [ ] 20 Sorten mit Terpenen befüllen
- [ ] Knowledge Graph API Endpoint bauen
