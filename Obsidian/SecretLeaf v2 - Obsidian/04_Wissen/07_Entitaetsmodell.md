# Entitätsmodell

## Zweck

Dieses Dokument definiert die zentralen Entitäten von SecretLeaf.

Jede Entität beschreibt:

- Felder
- Beziehungen
- SEO-Daten
- KI-Daten
- Benchmark-Daten

---

# Sorte

## Beschreibung

Cannabis-Genetik.

## Felder

### Basisdaten

- Name
- Breeder
- Typ
- Herkunft
- Genetik

### Wachstumsdaten

- Blütezeit
- Höhe
- Ertrag
- Schwierigkeit

### Chemische Daten

- THC
- CBD
- CBG

## Beziehungen

- Terpene
- Cannabinoide
- Krankheiten
- Grow-Techniken
- Benchmarks
- Extrakte

## SEO

Eigene Landingpage

## KI

Empfehlungen

## Benchmark

Ertrag

Blütezeit

Erfolgsquote

---

# Krankheit

## Beschreibung

Problem oder Erkrankung einer Pflanze.

## Felder

- Name
- Kategorie
- Schweregrad
- Beschreibung

## Beziehungen

- Symptome
- Ursachen
- Maßnahmen
- Prävention
- Diagnosen

## SEO

Eigene Landingpage

## KI

Diagnosemodell

## Benchmark

Häufigkeit

Erfolgsquote

---

# Symptom

## Beschreibung

Sichtbare Auffälligkeit.

## Felder

- Name
- Beschreibung
- Kategorie

## Beziehungen

- Krankheiten
- Nährstoffprobleme
- Diagnosen

## SEO

Landingpage

## KI

Diagnose Input

---

# Nährstoff

## Beschreibung

Makro- oder Mikronährstoff.

## Felder

- Name
- Kategorie
- Funktion

## Beziehungen

- Mangel
- Überschuss
- Symptome
- Maßnahmen

## SEO

Landingpage

## KI

Diagnosemodell

## Benchmark

Häufigkeit

---

# Terpen

## Beschreibung

Aromastoff einer Sorte.

## Felder

- Name
- Aroma
- Beschreibung

## Beziehungen

- Sorten
- Extrakte
- Cannabinoide

## SEO

Landingpage

## KI

Empfehlungen

---

# Cannabinoid

## Beschreibung

Aktiver Pflanzenstoff.

## Felder

- Name
- Typ
- Beschreibung

## Beziehungen

- Sorten
- Terpene
- Extrakte

## SEO

Landingpage

---

# Grow-Technik

## Beschreibung

Anbaumethode.

## Felder

- Name
- Schwierigkeit
- Beschreibung

## Beziehungen

- Sorten
- Benchmarks
- Maßnahmen

## Beispiele

- LST
- Topping
- SCROG
- Mainlining

---

# Extrakt

## Beschreibung

Cannabis-Konzentrat.

## Felder

- Name
- Kategorie
- Methode

## Beziehungen

- Sorten
- Terpene
- Cannabinoide

## Beispiele

- Hash
- Rosin
- BHO

---

# Grow

## Beschreibung

Zentrale Dateneinheit von SecretLeaf.

## Felder

- Grow ID
- Startdatum
- Enddatum
- Status
- Medium

## Beziehungen

- Nutzer
- Pflanzen
- Bilder
- Diagnosen
- Ernte

## KI

Empfehlungen

Prognosen

---

# Pflanze

## Beschreibung

Einzelne Pflanze innerhalb eines Grows.

## Felder

- Pflanzen ID
- Sorte
- Alter
- Status

## Beziehungen

- Grow
- Bilder
- Diagnosen

---

# Bild

## Beschreibung

Bild einer Pflanze.

## Felder

- Bild ID
- Datum
- Kategorie

## Beziehungen

- Grow
- Pflanze
- Diagnose

## KI

Bildanalyse

---

# Diagnose

## Beschreibung

Ergebnis einer Analyse.

## Felder

- Diagnose ID
- Ursache
- Wahrscheinlichkeit

## Beziehungen

- Symptom
- Krankheit
- Maßnahme

## KI

Diagnose Engine

---

# Maßnahme

## Beschreibung

Empfohlene Handlung.

## Felder

- Name
- Beschreibung

## Beziehungen

- Diagnose
- Krankheit
- Nährstoff

## Beispiele

- CalMag geben
- pH korrigieren
- Defolieren

---

# Ernte

## Beschreibung

Abschluss eines Grow-Zyklus.

## Felder

- Gewicht
- Qualität
- Datum

# Beziehungen

[[00_Knowledge_Graph]]
[[02_Datenbankarchitektur]]
[[03_KI_Architektur]]
[[05_Sorten]]
[[03_Krankheiten]]
[[04_Nährstoffe]]

## KI

Prognosemodell

---

# Priorität

## Tier S

- Grow
- Pflanze
- Diagnose
- Krankheit
- Symptom
- Sorte

## Tier A

- Nährstoff
- Terpen
- Cannabinoid
- Ernte
- Grow-Technik

## Tier B

- Extrakt
- Maßnahme