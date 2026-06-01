# SecretLeaf Design System

## 1. Zweck

Dieses Dokument definiert die verbindlichen Design-System-Regeln fuer SecretLeaf.
Es sichert Konsistenz, Lesbarkeit, Geschwindigkeit in der Umsetzung und Markenwiedererkennung.

Scope:
- Foundations (Farbe, Typografie, Spacing, Grid, Motion)
- Komponentenprinzipien
- Accessibility- und i18n-Regeln
- Governance fuer Aenderungen

---

## 2. Design-Prinzipien

1. Klarheit vor Dekoration
- Jede Flaeche muss den naechsten Schritt sichtbar machen.

2. Ein Screen, eine primaere Handlung
- Keine konkurrierenden Haupt-CTAs.

3. Operative Lesbarkeit
- Informationen fuer Grow-Entscheidungen muessen in Sekunden erfassbar sein.

4. Konsistenz ueber Domains
- Grow, Studies, Diagnose und Admin sprechen dieselbe visuelle Sprache.

5. Semantische Tokens statt Ad-hoc-Styling
- Keine direkten Hex-Farben in Komponenten-Logik.

---

## 3. Brand und Tonalitaet

Markencharakter:
- Praezise
- Vertrauenswuerdig
- Ruhig, aber handlungsorientiert

UI-Stimme:
- Kurz, eindeutig, ohne Marketingfloskeln
- Aktionen als Verben formulieren
- Status immer explizit benennen

---

## 4. Foundations

### 4.1 Farbsystem

Regel:
- Farben ueber semantische Rollen, nicht ueber Zufallseinsatz.

Core Tokens (Beispiel):
- color.bg.default: #0f1412
- color.bg.surface: #161d1a
- color.bg.elevated: #1e2824
- color.text.primary: #ecf3ef
- color.text.muted: #a7b8af
- color.border.default: #2f3d37
- color.action.primary: #6bbf59
- color.action.primaryHover: #7ccd68
- color.state.success: #4fbf8f
- color.state.warning: #e0b24f
- color.state.error: #d96868
- color.state.info: #63a6e0

Kontrastanforderung:
- Mindestkontrast fuer Text: WCAG AA

### 4.2 Typografie

Rollen:
- Display: grosse Headlines
- Heading: Abschnittsueberschriften
- Body: Standardtext
- Label: Form/Meta/Badges
- Mono: Datenwerte und technische Marker

Empfohlene Groessen:
- Display: 36/44
- H1: 30/38
- H2: 24/32
- H3: 20/28
- Body: 16/24
- Small: 14/20
- Caption: 12/16

Regeln:
- Maximal zwei Schriftfamilien
- Zeilenlaenge fuer Fliesstext ideal 60-80 Zeichen
- Keine vollstaendig grossgeschriebenen laengeren CTA-Texte

### 4.3 Spacing und Layout

Spacing Scale:
- 4, 8, 12, 16, 24, 32, 48, 64

Layout-Regeln:
- Konsistente vertikale Rhythmen
- Genug Luft zwischen Gruppen mit unterschiedlicher Funktion
- Keine ungeplanten Mischabstaende

Grid:
- Desktop: 12 Spalten
- Tablet: 8 Spalten
- Mobile: 4 Spalten

### 4.4 Radius, Border, Shadow

Radius:
- xs: 4
- sm: 8
- md: 12
- lg: 16
- xl: 24

Border:
- Standard: 1px solid color.border.default
- Focus: 2px mit klarer Kontrastfarbe

Shadow (sparsam):
- Nur fuer Layer-Hierarchie, nicht als Deko-Muster

### 4.5 Motion

Leitlinie:
- Motion erklaert Strukturveraenderung oder Feedback.

Dauer:
- Fast: 120ms
- Base: 180ms
- Slow: 260ms

Easing:
- Standard: ease-out
- Entry: cubic-bezier(0.2, 0.8, 0.2, 1)

Reduzierte Bewegung:
- Respect prefers-reduced-motion; keine kritische Information nur ueber Animation.

---

## 5. Interaktionsmuster

### 5.1 CTA-Hierarchie

- Primary: genau eine pro Screen
- Secondary: ergaenzende Aktionen
- Tertiary: low-emphasis links/inline actions

### 5.2 Feedback-Zustaende

Pflichtzustaende fuer interaktive Komponenten:
- default
- hover
- focus-visible
- active
- loading
- disabled
- error (wo relevant)

### 5.3 Formulare

Regeln:
- Labels immer sichtbar (keine Placeholder-only Loesung)
- Hilfstexte direkt am Feld
- Fehlertexte konkret und loesungsorientiert
- Primar-Action erst aktivierbar bei validen Pflichtfeldern

---

## 6. Komponentenrichtlinien

### 6.1 Core-Komponenten

Diese Komponenten muessen systemkonform bleiben:
- Button
- Input/Textarea/Select
- Card
- Badge/Tag
- Modal/Sheet
- Toast/Alert
- Table/List
- Navigation (Top, Side, Bottom je Breakpoint)

### 6.2 Komponenten-Checkliste

Vor Merge:
1. Nutzt semantische Tokens
2. Hat alle Pflichtzustaende
3. Erfuellt Keyboard-Navigation
4. Hat Screenreader-taugliche Labels
5. Verwendet i18n-Strings statt Hardcoding

---

## 7. Accessibility

Pflichtstandards:
- WCAG AA als Minimum
- Sichtbarer Focus fuer Tastaturnutzung
- Semantische HTML-Struktur
- Aria nur bei Bedarf, nicht als Ersatz fuer korrektes Markup
- Fehler und Erfolg nicht nur ueber Farbe kommunizieren

QA-Mindestumfang:
- Keyboard-only Durchgang
- Screenreader Spot-Check in Kernflows
- Kontrastpruefung fuer neue Farbtoken

---

## 8. Internationalisierung im UI

Regeln:
- Alle User-Strings ueber i18n-Schicht
- Textlaenge de/en bei Layout mitdenken
- Keine feste Pixelbreite fuer zentrale Buttons/Labels
- Datums-, Zahlen- und Waehrungsformat lokalisiert darstellen

---

## 9. Responsive Verhalten

Breakpoints (Richtwerte):
- sm: >= 480
- md: >= 768
- lg: >= 1024
- xl: >= 1280

Regeln:
- Mobile first
- Informationsdichte auf kleinen Screens reduzieren, nicht nur verkleinern
- Kritische Aktionen im Daumenbereich erreichbar halten

---

## 10. Design-System Governance

Aenderungsprozess:
1. Problem und Nutzen beschreiben
2. Betroffene Tokens/Komponenten benennen
3. Auswirkungen auf bestehende Screens pruefen
4. Dokumentation im gleichen PR aktualisieren

Review-Gates:
- Product Review (Nutzerwirkung)
- UX Review (Konsistenz)
- Engineering Review (Umsetzbarkeit)
- Accessibility Review (AA-Konformitaet)

No-Go:
- Neue Stilinsel ohne Systembezug
- Harte Farbwerte in Feature-Komponenten
- Ad-hoc-Breakpoints ohne Begruendung

---

## 11. Implementierungs-Hinweise

Empfohlen:
- Token-Quelle zentral halten
- Komponenten in klaren Layern pflegen (primitive, composite, domain)
- Storybook oder gleichwertige Vorschau fuer visuelle Regressionen nutzen

Definition of Done fuer neue UI:
- Funktional korrekt
- Visuell systemkonform
- i18n-konform
- Accessibility geprueft
- Dokumentiert

---

## 12. Dokument-Metadaten

Owner: Product Engineering
Status: Active
Last updated: 2026-06-01
Next review: 2026-07-01
