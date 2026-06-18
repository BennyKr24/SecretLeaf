# 04_Screens_MVP

## Zweck

Dieses Dokument definiert sämtliche Screens der ersten SecretLeaf MVP Version.

Es beschreibt:

- Navigation
    
- Seitenstruktur
    
- Komponenten
    
- Aktionen
    
- Daten
    
- Nutzerziele
    

Dieses Dokument dient als Grundlage für:

- UI Design
    
- UX Design
    
- Frontend Entwicklung
    
- Backend Entwicklung
    

---

# MVP Navigation

## Hauptnavigation

```text
Dashboard

Meine Grows

Diagnose

Wissen

Profil
```

---

# Screen 1

# Dashboard

## Ziel

Der Nutzer soll innerhalb von 5 Sekunden verstehen:

- Wie geht es meinen Pflanzen?
    
- Gibt es Risiken?
    
- Was muss ich tun?
    
- Was hat sich verändert?
    

---

## Aufbau

### Header

Anzeige:

```text
Hallo Benjamin 👋

Aktive Grows: 2

Offene Aufgaben: 3
```

---

### Grow Übersicht

Karte pro Grow:

```text
Gelato Grow

Tag 43

Vegetation

Letztes Update:
vor 2 Tagen
```

Button:

```text
Grow öffnen
```

---

### Aufgaben

Beispiele:

```text
Bild hochladen

Grow aktualisieren

Diagnose prüfen
```

---

### Empfehlungen

Beispiele:

```text
Neues Bild hochladen

Wachstum dokumentieren

Diagnose erneut durchführen
```

---

### Letzte Aktivitäten

Timeline:

```text
Bild hochgeladen

Diagnose erstellt

Eintrag erstellt
```

---

## Aktionen

```text
Grow erstellen

Grow öffnen

Bild hochladen
```

---

# Screen 2

# Grow Übersicht

## Ziel

Zentrale Seite eines einzelnen Grows.

---

## Header

```text
Gelato

Tag 43

Vegetation
```

---

## Statistiken

```text
Alter

Anzahl Bilder

Diagnosen

Einträge
```

---

## Schnellaktionen

Buttons:

```text
Bild hochladen

Diagnose starten

Eintrag erstellen
```

---

## Timeline

Chronologische Darstellung:

```text
03.06

Bild hochgeladen

----------

01.06

Gedüngt

----------

29.05

Getoppt
```

---

## Tabs

### Übersicht

### Timeline

### Bilder

### Diagnosen

---

# Screen 3

# Grow erstellen

## Ziel

Neuen Grow in weniger als 60 Sekunden anlegen.

---

## Felder

### Name

Pflicht

---

### Sorte

Pflicht

---

### Medium

Pflicht

Optionen:

```text
Erde

Coco

Hydro
```

---

### Indoor / Outdoor

Pflicht

---

### Startdatum

Pflicht

---

### Notizen

Optional

---

## Buttons

```text
Abbrechen

Grow erstellen
```

---

# Screen 4

# Bild Upload

## Ziel

Ein Bild schnell dokumentieren.

---

## Upload

```text
Datei auswählen

Kamera

Drag & Drop
```

---

## Zusatzfelder

### Beschreibung

Optional

### Pflanze

Optional

### Phase

Optional

---

## Buttons

```text
Speichern

Diagnose starten
```

---

# Screen 5

# Diagnose

## Ziel

Sofortiger Mehrwert.

---

## Eingabe

### Bild

### Symptome

Optional

---

## Ausgabe

### Wahrscheinlichste Ursache

```text
Calcium-Mangel

87 %
```

---

### Alternative Ursachen

```text
pH Problem

52 %
```

---

### Empfehlung

```text
CalMag erhöhen

pH prüfen
```

---

### Nächste Schritte

```text
Bild in 3 Tagen erneut hochladen
```

---

# Screen 6

# Wissenssystem

## Ziel

SEO Traffic aktivieren.

---

## Kategorien

```text
Growing

Krankheiten

Nährstoffe

Sorten
```

---

## Suche

Globale Suche.

---

## Artikelseite

Aufbau:

```text
Titel

Beschreibung

Symptome

Lösungen

Prävention

Verwandte Artikel
```

---

# Screen 7

# Meine Grows

## Ziel

Alle Grows verwalten.

---

## Listenansicht

```text
Gelato

Tag 43

Vegetation
```

---

## Filter

```text
Aktiv

Abgeschlossen

Archiviert
```

---

## Aktionen

```text
Bearbeiten

Archivieren

Löschen
```

---

# Screen 8

# Profil

## Ziel

Kontoverwaltung.

---

## Bereiche

### Account

### Passwort

### Einstellungen

### Benachrichtigungen

---

# MVP Navigation Flow

```text
Dashboard

↓

Grow

↓

Bild Upload

↓

Diagnose

↓

Timeline

↓

Dashboard
```

---

# Kritische MVP Journey

```text
Registrierung

↓

Grow erstellen

↓

Bild hochladen

↓

Diagnose

↓

Timeline

↓

Dashboard

↓

Wiederkommen
```

---

# Nicht Bestandteil von MVP V1

```text
AI Assistant

Benchmarking

Prognosen

Premium

Marketplace

Community

Chat

Social Features

Mobile App
```

# Verknüpfte Dokumente
[[01_MVP_Feature_Liste]]  
  
[[02_User_Flows]]  
  
[[03_Datenmodell_MVP]]  
  
[[05_Entwicklungsplan]]  
  
[[01_Grow_Tagebuch_Spec]]  
  
[[02_Dashboard_Spec]]  
  
[[03_Diagnose_Spec]]  
  
[[01_UX_Prinzipien]]  
  
[[02_UI_Prinzipien]]