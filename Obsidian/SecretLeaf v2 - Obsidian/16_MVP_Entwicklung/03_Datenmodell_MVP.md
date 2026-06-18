# Datenmodell MVP

## Zweck

Dieses Dokument definiert das minimale Datenmodell für die erste Version von SecretLeaf.

Es beschreibt die Datenobjekte, deren Felder und Beziehungen.

## Grundprinzip

Das MVP speichert nur Daten, die:

- Nutzerwert erzeugen
    
- Diagnosen ermöglichen
    
- Retention erhöhen
    
- zukünftige KI verbessern
    

---

# User

## Beschreibung

Registrierter Nutzer.

## Pflichtfelder

### User ID

### E-Mail

### Passwort Hash

### Erstellungsdatum

## Optionale Felder

### Benutzername

### Profilbild

### Land

### Zeitzone

## Beziehungen

User

↓

Grow

---

# Grow

## Beschreibung

Zentrale Dateneinheit.

## Pflichtfelder

### Grow ID

### Name

### Sorte

### Medium

### Indoor / Outdoor

### Startdatum

### Status

## Optionale Felder

### Topfgröße

### Lampe

### Zeltgröße

### Notizen

## Status

### Keimung

### Sämling

### Vegetation

### Vorblüte

### Blüte

### Spülung

### Ernte

### Trocknung

### Curing

### Abgeschlossen

## Beziehungen

Grow

↓

Pflanze

↓

Bild

↓

Diagnose

↓

Tagebucheintrag

---

# Pflanze

## Beschreibung

Einzelne Pflanze innerhalb eines Grows.

## Pflichtfelder

### Pflanzen ID

### Sorte

### Alter

## Optionale Felder

### Spitzname

### Notizen

### Status

## Beziehungen

Pflanze

↓

Bild

↓

Diagnose

---

# Bild

## Beschreibung

Bild einer Pflanze.

## Pflichtfelder

### Bild ID

### Upload Datum

### Dateipfad

### Grow ID

## Optionale Felder

### Beschreibung

### Pflanzen ID

### Phase

## Beziehungen

Bild

↓

Diagnose

---

# Diagnose

## Beschreibung

Ergebnis einer KI Analyse.

## Pflichtfelder

### Diagnose ID

### Datum

### Ursache

### Wahrscheinlichkeit

### Empfehlung

## Optionale Felder

### Alternative Ursachen

### Feedback

## Beziehungen

Diagnose

↓

Bild

↓

Grow

---

# Tagebucheintrag

## Beschreibung

Chronologischer Grow Eintrag.

## Pflichtfelder

### Eintrag ID

### Datum

### Typ

### Beschreibung

## Typen

### Bewässerung

### Düngung

### Training

### Beobachtung

### Problem

### Ernte

## Beziehungen

Eintrag

↓

Grow

---

# Wissenseintrag

## Beschreibung

Artikel innerhalb des Wissenssystems.

## Pflichtfelder

### Titel

### Kategorie

### Slug

### Inhalt

## Kategorien

### Growing

### Krankheiten

### Nährstoffe

### Sorten

## Beziehungen

Wissenseintrag

↓

Knowledge Graph

---

# MVP Datenstruktur

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

Tagebucheintrag

---

# MVP Datenpriorität

## Tier S

User

Grow

Bild

Diagnose

---

## Tier A

Pflanze

Tagebucheintrag

---

## Tier B

Wissenseinträge

Benachrichtigungen

---

# Nicht Bestandteil des MVP

## Benchmarkdaten

## Prognosedaten

## AI Assistant Historie

## Premium Daten

## Affiliate Daten

## Community Daten

## Marketplace Daten

---

# KPI

## Grows pro Nutzer

## Bilder pro Grow

## Diagnosen pro Grow

## Einträge pro Grow

## Grow Abschlussrate

---

# MVP Erfolgsdefinition

Wenn ein Nutzer:

- einen Grow erstellt
    
- Bilder hochlädt
    
- Diagnosen nutzt
    
- Tagebuch führt
    

dann erzeugt SecretLeaf bereits die Datenbasis für den zukünftigen Data Moat.

# Beziehungen 
[[01_MVP_Feature_Liste]]  
  
[[02_User_Flows]]  
  
[[04_Screens_MVP]]  
  
[[05_Entwicklungsplan]]  
  
[[02_Datenbankarchitektur]]  
  
[[07_Entitaetsmodell]]  
  
[[02_Grow_Zyklus]]  
  
[[04_Diagnosedaten]]  
  
[[03_Bilddaten]]