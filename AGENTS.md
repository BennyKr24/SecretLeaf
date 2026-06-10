# AGENTS.md

# SecretLeaf Agent Operating Model

Version: 2.0

Status: Active

Owner: Product Engineering

---

# 1. Mission

SecretLeaf ist kein Blog.

SecretLeaf ist kein Tool-Verzeichnis.

SecretLeaf ist kein Dashboard.

SecretLeaf ist ein Grow Operating System.

Alle Agenten müssen Entscheidungen treffen, die SecretLeaf näher an ein professionelles Produkt bringen.

Jede Änderung muss mindestens eines dieser Ziele verbessern:

* Nutzerwert
* Produktqualität
* Konsistenz
* Skalierbarkeit
* Vertrauen
* Premium-Wirkung

---

# 2. Produktprinzipien

## 2.1 Product First

Produkte vor Content.

Workflows vor Artikeln.

Nutzerprobleme vor Features.

---

## 2.2 Simplicity Wins

Weniger ist besser.

Jede zusätzliche Komponente muss begründet werden.

Jedes zusätzliche UI-Element erhöht Komplexität.

---

## 2.3 Premium Before Feature Density

SecretLeaf soll wirken wie:

* Apple
* Linear
* Stripe
* Notion
* Vercel

Nicht wie:

* Admin Dashboard
* WordPress Seite
* Template
* KI Landing Page

Premium-Wirkung ist wichtiger als Informationsdichte.

---

## 2.4 Consistency First

Neue Komponenten dürfen bestehende Muster nicht brechen.

Ein Problem = eine Lösung.

Ein Konzept = ein Begriff.

Ein Workflow = ein Weg.

---

# 3. Agentenklassen

## Product Agent

Verantwortlich für:

* Nutzerwert
* Priorisierung
* Produktkonsistenz
* Feature-Bewertung

Frage immer:

"Löst das ein echtes Nutzerproblem?"

---

## Design Agent

Verantwortlich für:

* UX
* UI
* Informationshierarchie
* Designsystem

Frage immer:

"Würde Linear das so bauen?"

Wenn nein:

Neu entwerfen.

---

## Architecture Agent

Verantwortlich für:

* Struktur
* Skalierung
* Konsistenz
* technische Schulden

Frage immer:

"Erhöht das langfristig die Wartbarkeit?"

---

## Data Agent

Verantwortlich für:

* Supabase
* Datenmodell
* Integrität
* Performance

---

## Knowledge Agent

Verantwortlich für:

* Wiki
* Studien
* Taxonomie
* Quellenqualität

---

## Localization Agent

Verantwortlich für:

* Übersetzungen
* Fachbegriffe
* Terminologie

Google-Translate-Texte sind nicht erlaubt.

Professionelle deutsche Fachbegriffe sind Pflicht.

---

## QA Agent

Verantwortlich für:

* Tests
* Fehler
* Regressionen
* Accessibility

---

# 4. Nicht verhandelbare Designregeln

## Hero Sections

Hero Sections dürfen niemals:

* überladen sein
* mehr als zwei CTA enthalten
* mehr als ein Hauptziel haben

Der Nutzer muss innerhalb von 3 Sekunden verstehen:

* Was ist SecretLeaf?
* Warum ist es nützlich?
* Was soll ich als Nächstes tun?

---

## Produktdarstellung

Produkte vor Marketing.

Zeige immer:

* echte Workflows
* echte Daten
* echte Nutzung

Vermeide:

* Platzhalter
* generische Illustrationen
* übermäßige Icons

---

## White Space

Mehr Leerraum ist besser als mehr Inhalt.

---

## Informationsdichte

Wenn zwei Komponenten denselben Zweck erfüllen:

Eine entfernen.

---

# 5. Architekturregeln

Keine doppelte Datenhaltung.

Keine doppelte Logik.

Keine parallelen Systeme ohne dokumentierte Begründung.

Jede Architekturentscheidung muss dokumentiert werden.

ARCHITECTURE.md ist die technische Wahrheit.

---

# 6. Datenbankregeln

DATABASE.md ist die einzige Quelle für Datenmodellentscheidungen.

Keine Tabellenänderung ohne Dokumentation.

Keine Redundanz ohne Begründung.

---

# 7. Lokalisierungsregeln

LOCALIZATION.md ist verpflichtend.

Alle Texte müssen:

* natürlich klingen
* fachlich korrekt sein
* konsistente Begriffe verwenden

Verboten:

* Google-Translate-Sprache
* gemischte Begriffe
* kaputte Umlaute
* englische Fachbegriffe ohne Grund

---

# 8. Agentenablauf

## Schritt 1

Kontext erfassen

* Komponenten
* APIs
* Datenmodell
* Dokumentation

---

## Schritt 2

Analyse

Identifizieren:

* Ursache
* Risiken
* Seiteneffekte

---

## Schritt 3

Umsetzung

Kleinste sinnvolle Änderung.

Keine unnötige Komplexität.

---

## Schritt 4

Verifikation

* Typecheck
* Build
* Tests
* UX Review

---

## Schritt 5

Dokumentation

Alle relevanten Dokumente aktualisieren.

---

# 9. Qualitätsdefinition

Eine Aufgabe ist erst fertig wenn:

* Problem gelöst
* Nutzerwert verbessert
* Design konsistent
* Dokumentation aktualisiert
* keine Regressionen entstanden

---

# 10. Design Review Gate

Vor Abschluss jeder UI Änderung:

Frage:

1. Würde Apple das veröffentlichen?
2. Würde Linear das veröffentlichen?
3. Würde Stripe das veröffentlichen?
4. Würde Notion das veröffentlichen?

Wenn mindestens eine Antwort "Nein" lautet:

Iteration fortsetzen.

---

# 11. Dokumentenhierarchie

1. PRODUCT.md
2. AGENTS.md
3. DESIGN_SYSTEM.md
4. ARCHITECTURE.md
5. DATABASE.md
6. LOCALIZATION.md
7. AI_SYSTEM.md
8. WIKI_ARCHITECTURE.md
9. STANDARDS.md
10. DEPLOYMENT.md

Bei Konflikten gilt die höher priorisierte Datei.

---

# 12. Erfolgsdefinition

SecretLeaf soll wirken wie:

Ein professionelles Produkt.

Nicht wie ein Hobbyprojekt.

Nicht wie eine Content-Webseite.

Nicht wie ein KI-Prototyp.

Sondern wie das führende Grow Operating System.
