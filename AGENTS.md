# AGENTS.md

# SecretLeaf Agent Operating Model

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

# 10.1 Motion Gate

Gilt zusätzlich für jede Änderung, die Animation, Transition, Gesten, schwebende Flächen (Nav/Dropdown/Modal/Popover) oder Typografie-Größen betrifft.

Motion-Regeln stehen fest in DESIGN_SYSTEM.md, Abschnitt 15. Material-Regeln (Glass vs. Modal) in Abschnitt 16. Größenabhängige Tracking/Leading-Regeln in Abschnitt 6. Nicht neu erfinden.

Vor Implementierung: Skill `.claude/skills/apple-design` oder `.claude/skills/emil-design-eng` konsultieren; für fertige Bausteine `.claude/skills/animate/RECIPES.md`.

Vor Abschluss: Skill `.claude/skills/review-animations` auf den Diff anwenden. Kein Merge bei offenen Findings gegen Abschnitt 15.10 (Verboten) oder 16.4 (Verboten).

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
# 11.5 Obsidian Vault Authority

Der Ordner:

```text
/Obsidian
```

ist Teil des offiziellen SecretLeaf-Wissenssystems und muss von allen Agenten berücksichtigt werden.

Der Obsidian Vault enthält:

* Vision
* Mission
* Produktstrategie
* Data-Moat-Strategie
* Knowledge-Graph-Strategie
* AI-Strategie
* Datenstrategie
* Produktentscheidungen
* Roadmaps
* Architekturkonzepte
* langfristige Produktziele

Insbesondere gilt der dokumentierte Stand vom 16.06.2026 als strategische Referenz.

---

## Strategische Wahrheit

Der Code beschreibt den aktuellen Implementierungsstand.

Der Obsidian Vault beschreibt die langfristige Produkt- und Unternehmensstrategie.

Bei Widersprüchen zwischen:

* Code
* Dokumentation
* Produktverhalten

muss die Abweichung identifiziert und dokumentiert werden.

Agenten dürfen keine stillschweigenden Architektur- oder Produktentscheidungen treffen, die der dokumentierten Strategie widersprechen.

---

## Pflichtprüfung vor größeren Änderungen

Vor Änderungen an:

* Grow System
* Datenmodell
* Supabase
* Authentifizierung
* Analytics
* Automations
* AI-Systemen
* Knowledge Graph
* Recommendation Engine
* Prediction Engine
* Outcome Engine

müssen relevante Dokumente im Obsidian Vault geprüft werden.

Insbesondere:

* Vision
* Datenstrategie
* Data Moat Strategie
* Produkt-Roadmap
* Grow System
* Knowledge Graph
* AI Architektur

sind zu berücksichtigen.

---

## Alignment Check

Vor jeder größeren Implementierung prüfen:

1. Unterstützt die Änderung Monthly Active Growers (MAG)?
2. Unterstützt die Änderung die Erfassung von Grow-Daten?
3. Unterstützt die Änderung den langfristigen Data Moat?
4. Unterstützt die Änderung Situation → Decision → Outcome?
5. Unterstützt die Änderung spätere Similarity-, Recommendation- oder Prediction-Systeme?

Wenn die Antwort überwiegend "Nein" lautet, muss die Änderung kritisch hinterfragt werden.

---

## Vault Synchronisation

Wichtige Erkenntnisse dürfen nicht ausschließlich im Code verbleiben.

Wenn neue Erkenntnisse entstehen bezüglich:

* Architektur
* Datenmodell
* Data Moat
* Analytics
* AI-Systemen
* Produktstrategie
* Skalierung
* Sicherheit

müssen relevante Dokumente im Obsidian Vault aktualisiert werden.

Mindestens zu aktualisieren:

* Entscheidungsdokumente
* Architekturdokumente
* Datenmodell-Dokumente
* Data-Moat-Dokumente

---

## Repository + Vault Review

Bei Audits, Refactorings und größeren Features sollen Agenten sowohl:

* den aktuellen Code
* als auch den Obsidian Vault

berücksichtigen.

Die Bewertung darf nicht ausschließlich auf Basis des aktuellen Implementierungsstands erfolgen.

Agenten sollen regelmäßig prüfen:

* Passt die Implementierung zur Vision?
* Passt die Implementierung zur Produktstrategie?
* Passt die Implementierung zur Data-Moat-Strategie?
* Passt die Implementierung zum langfristigen Ziel eines Cannabis Grow Operating Systems?

Erkannte Abweichungen müssen dokumentiert werden.

# 12. Erfolgsdefinition

SecretLeaf soll wirken wie:

Ein professionelles Produkt.

Nicht wie ein Hobbyprojekt.

Nicht wie eine Content-Webseite.

Nicht wie ein KI-Prototyp.

Sondern wie das führende Grow Operating System.
