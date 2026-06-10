# WIKI_ARCHITECTURE.md

# SecretLeaf Knowledge Architecture

Version: 2.0

Status: Active

Owner: Product & Knowledge

---

# 1. Mission

Die Wissensplattform von SecretLeaf soll die vertrauenswürdigste Wissensquelle für datenbasierten Cannabis-Anbau werden.

Ziel:

Nicht möglichst viele Artikel.

Sondern:

Die schnellste Verbindung zwischen Wissen und Handlung.

---

# 2. Core Principle

Wissen existiert nicht isoliert.

Jeder Wissenseintrag muss mindestens eines der folgenden Ziele unterstützen:

* Verstehen
* Entscheiden
* Handeln
* Optimieren

---

# 3. Knowledge Model

Alle Inhalte gehören zu einem definierten Datentyp.

Freie Artikel ohne Struktur sind nicht erlaubt.

---

# 4. Content Types

## Plant

Pflanzenbezogene Einträge.

Beispiele:

* Cannabis
* Autoflower
* Photoperiodisch

---

## Growth Stage

Phasen.

Beispiele:

* Keimung
* Sämling
* Wachstumsphase
* Blütephase
* Ernte
* Trocknung
* Fermentation

---

## Nutrient

Nährstoffe.

Beispiele:

* Stickstoff
* Phosphor
* Kalium
* Calcium
* Magnesium

---

## Deficiency

Mangelbilder.

Beispiele:

* Stickstoffmangel
* Calciummangel

---

## Toxicity

Überversorgung.

---

## Disease

Krankheiten.

---

## Pest

Schädlinge.

---

## Environment

Umweltparameter.

Beispiele:

* Temperatur
* Luftfeuchtigkeit
* VPD
* CO₂

---

## Technique

Methoden.

Beispiele:

* LST
* HST
* SCROG
* SOG

---

## Equipment

Ausrüstung.

---

## Study

Studien.

---

## Tool

Rechner.

---

## Diagnosis Pattern

Diagnosewissen.

---

# 5. Taxonomy Hierarchy

Level 1

Knowledge Domain

↓

Level 2

Content Type

↓

Level 3

Entity

↓

Level 4

Related Knowledge

---

Beispiel

Nährstoffe

↓

Mangel

↓

Calciummangel

↓

pH

↓

Calcium

↓

Braune Flecken

↓

Diagnose

---

# 6. Required Fields

Jeder Wissenseintrag benötigt:

* id
* title
* slug
* type
* category
* summary
* difficulty
* updated_at

---

# 7. Scientific Layer

Zusätzliche Felder:

* evidence_level
* source_count
* confidence_score
* reviewed_at

---

# 8. Knowledge Relationships

Pflicht.

Jeder Eintrag muss Beziehungen besitzen.

---

Beispiel

Calciummangel

verknüpft mit:

* Calcium
* pH
* Braune Flecken
* Diagnose
* Studien
* Blütephase

---

# 9. Grow OS Integration

Wissensseiten dürfen niemals isoliert sein.

---

Jeder Eintrag muss prüfen:

Gibt es Verbindungen zu:

* Grow
* Diagnose
* Tool
* Studie
* Aufgabe

---

# 10. Study Architecture

Jede Studie besitzt:

* Titel
* DOI
* Autoren
* Jahr
* Abstract
* Evidenzgrad
* Zusammenfassung

---

Zusätzlich:

Praktische Interpretation.

---

Nicht:

Nur wissenschaftliche Daten.

---

Sondern:

"Was bedeutet das für Grower?"

---

# 11. Diagnosis Integration

Jedes Problem muss verknüpft werden mit:

* Ursachen
* Symptomen
* Lösungen
* Studien
* Tools

---

# 12. Search Architecture

Suche muss unterstützen:

* Synonyme
* Fachbegriffe
* Fehlerschreibweisen
* deutsche Begriffe
* englische Begriffe

---

Beispiel:

CalMag

findet:

* Calcium
* Magnesium
* Calciummangel

---

# 13. Recommendation Engine

Jeder Eintrag erhält:

Verwandte Themen

Pflicht.

---

Mindestens:

* 5 ähnliche Einträge

---

# 14. Knowledge Graph

Langfristiges Ziel:

Alle Inhalte als Wissensgraph.

Nicht als Artikelsammlung.

---

Jeder Inhalt besitzt Beziehungen.

---

# 15. AI Integration

AI darf Inhalte nutzen für:

* Diagnose
* Empfehlungen
* Wissensabfragen
* Grow-Beratung

---

AI darf keine Wissensinseln erzeugen.

---

# 16. Quality Standards

Ein Eintrag gilt erst als fertig wenn:

* Fachlich korrekt
* Verknüpft
* Suchbar
* Verständlich
* Lokalisiert

---

# 17. Forbidden Patterns

Verboten:

* Unstrukturierte Artikel
* Wissensduplikate
* Isolierte Inhalte
* Kategorien ohne Beziehungen

---

# 18. Success Metrics

Messen:

* Sucherfolg
* Klicktiefe
* Verknüpfungsrate
* Diagnose-Nutzung
* Grow-Integration

---

# 19. Long-Term Vision

SecretLeaf wird kein Artikelarchiv.

SecretLeaf wird ein Wissensnetzwerk.

Jede Information soll:

* gefunden
* verstanden
* angewendet

werden können.

---

# 20. Final Rule

Wenn ein Inhalt nicht mit dem Grow Workflow verbunden werden kann:

Warum existiert dieser Inhalt überhaupt?

Wissen ohne Handlung erzeugt keinen Produktwert.
