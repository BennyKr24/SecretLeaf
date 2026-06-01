# SecretLeaf Localization Standard

## 1. Zweck

Dieses Dokument definiert die verbindlichen Lokalisierungsregeln fuer SecretLeaf.
Schwerpunkt ist professionelle deutsche Fachsprache im Cannabis-Kontext sowie konsistente de/en-Qualitaet.

---

## 2. Sprachstrategie

Unterstuetzte Sprachen:
- Deutsch (de) als fachliche Leitvariante
- Englisch (en) als gleichwertige Produktsprache

Leitprinzip:
- Nicht woertlich uebersetzen, sondern fachlich korrekt und produkttauglich formulieren.

---

## 3. Terminologie-Guardrails (Deutsch)

Bevorzugte Fachbegriffe:
- Naehrstoffgabe statt Feeding
- Bluetephase statt Flower Stage
- Keimung statt Germination
- Wachstumsphase statt Vegetative Stage (wenn Kontext Phase)
- Ernte statt Harvest (in Fliesstexten)

Regel:
- Ein Begriff pro Konzept. Keine Synonymmischung innerhalb desselben Flows.

---

## 4. Qualitaetskriterien

Nicht erlaubt:
- Sichtbare maschinelle Uebersetzungsartefakte
- Englische Restbegriffe in deutschen Kernflows ohne Notwendigkeit
- Kaputte Umlaute oder Zeichensatzfehler
- Uneinheitliche Ansprache innerhalb eines Screens

Pflicht:
- Fachsprache muss fuer Grower sofort plausibel sein
- CTA-Texte als klare Verben
- Fehlermeldungen mit konkreter Handlungsanweisung

---

## 5. Technische Regeln

- Keine neuen hartcodierten User-Strings im Komponenten-Code.
- Strings liegen in den Message-Dateien pro Locale.
- Keys werden stabil gehalten; keine semantischen Duplikate.
- Neue Strings immer de und en gemeinsam liefern.

---

## 6. Review-Workflow

Pflicht-Check vor Merge:
1. Fachbegriff korrekt?
2. Tonalitaet konsistent?
3. de/en beide gepflegt?
4. Layout robust bei laengeren deutschen Strings?
5. Sonderzeichen korrekt dargestellt?

---

## 7. SEO- und Lesbarkeitsaspekte

- Title/Description pro Locale natuerlich formulieren
- Keine Keyword-Stopfung
- Fachbegriffe konsistent in Headings und UI

---

## 8. Bekannte Risiken

- Historische String-Reste mit inkonsistenter Begriffswahl
- Domain-Mischsprache in Diagnose/Tools
- Fehlende zentrale Glossar-Durchsetzung

Massnahme:
- Terminologie-Glossar bei jedem Release gegen neue Strings pruefen.

---

## 9. Dokument-Metadaten

Owner: Product Engineering
Status: Active
Last updated: 2026-06-01
Next review: 2026-07-01
