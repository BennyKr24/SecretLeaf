# DESIGN_SYSTEM.md

# SecretLeaf Design System

Version: 2.2

Status: Active

Owner: Product & Design

Letztes Update: 2026-08-07 — Materials & Depth (§16) und größenabhängige Typografie (§6) ergänzt, auf Basis aller 9 installierten Kowalski-Skills (`.claude/skills/`)

---

# 1. Purpose

Dieses Dokument definiert die visuelle Identität, UX-Prinzipien und Produktdarstellung von SecretLeaf.

Ziel:

Jede Seite soll wirken wie ein professionelles Softwareprodukt.

Nicht wie:

* ein Blog
* ein Dashboard-Template
* eine Tool-Sammlung
* ein KI-Projekt
* eine Cannabis-Webseite

Sondern wie:

* Apple
* Linear
* Stripe
* Notion
* Vercel

---

# 2. Design Philosophy

## 2.1 Product First

Das Produkt steht immer im Mittelpunkt.

Nicht Marketing.

Nicht Deko.

Nicht Features.

Nutzer sollen das Produkt sehen.

Nicht darüber lesen.

---

## 2.2 Simplicity Wins

Weniger gewinnt.

Jedes zusätzliche Element benötigt eine Rechtfertigung.

Wenn ein Element entfernt werden kann, ohne den Kernnutzen zu verlieren:

Entfernen.

---

## 2.3 Premium Before Density

Premium-Wirkung ist wichtiger als Informationsmenge.

Lieber:

* 5 perfekte Elemente

als:

* 20 durchschnittliche Elemente

---

## 2.4 Calm Interfaces

Interfaces sollen ruhig wirken.

Vermeiden:

* visuelles Chaos
* aggressive Farben
* übermäßige Animationen
* unnötige Icons

---

# 3. Brand Positioning

SecretLeaf ist:

"Das Grow Operating System"

SecretLeaf ist nicht:

* Wikipedia für Cannabis
* Grow Blog
* Tool Verzeichnis
* Rechner Sammlung

Alle Designs müssen dieses Selbstverständnis unterstützen.

---

# 4. Visual Identity

## Stil

Modern.

Premium.

Minimalistisch.

Technologisch.

Vertrauenswürdig.

---

## Referenzen

Primär:

* Apple
* Linear
* Stripe

Sekundär:

* Arc Browser
* Notion
* Vercel

---

## Verbotene Referenzen

Nicht orientieren an:

* Admin Templates
* Bootstrap Dashboards
* Themeforest Layouts
* KI Landing Pages
* Crypto Websites

---

# 5. Color System

Überarbeitet 2026-08-07. Die vorherigen Werte waren Tailwinds unveränderter Standard `green-500`/`slate-400` — die mit Abstand häufigste "KI-generierte Dark-SaaS"-Kombination, ohne eigene Markenentscheidung dahinter. Diese Palette schiebt Primary zu einem tieferen, eigenständigeren Jade-/Waldgrün, wärmt Hintergrund/Fläche mit einem grünen statt kalten Unterton, und ergänzt einen gedeckten Messing-/Gold-Sekundärakzent für Premium-Momente.

Quelle der Wahrheit: CSS Custom Properties in `apps/web/src/app/globals.css` (`:root`, `.dark`), gespiegelt in `apps/web/tailwind.config.ts`.

## Background

Primary (`--bg`):
#070F0B

Fläche (`--surface`):
#0C1712

---

## Brand Green

Primary (`--primary`):
#1FA971

Dark/Hover (`--primary-dark`):
#16875A

Deep-Tint (`--primary-deep`):
#0F3226

---

## Gold-Akzent (neu)

Für Premium-Momente (PRO-Badges, Bewertungen, Highlights) — sparsam einsetzen, Primary-Grün bleibt dominant.

Primary (`--accent-gold`):
#C9A15A

Dark (`--accent-gold-dark`):
#A8813F

---

## Text

Primary (`--text`):
#F3F6F2

Muted (`--muted`):
#8FA396

---

## Status

Erfolg: Primary-Grün (`--primary`)

Warnung: Tailwind `amber-500`

Fehler: Tailwind `rose-500`

Info: Tailwind `sky-400`

Status-Farben bleiben bewusst Tailwind-Standard — das sind erwartete, "unsichtbare" Semantik-Farben. Nur der Marken-Akzent (Primary/Gold) muss sich von Template-Defaults abheben.

---

# 6. Typography

## Font

Display (Headlines):
Space Grotesk

Body:
Manrope

Fallback:
System UI

Beide über `next/font/google` geladen (`apps/web/src/app/layout.tsx`), keine Fremd-Requests. Das ist eine bewusste Marken-Entscheidung — nicht durch System-Fonts ersetzen.

---

## Hero Heading

72px–96px

Weight:
700–800

Max 2 Zeilen.

---

## Section Heading

36px–48px

Weight:
700

---

## Body

16px–18px

Line Height:
1.6

---

## Tracking & Leading sind größenabhängig (fest)

Nie ein fixer `letter-spacing`-Wert für alle Größen. Große Headlines brauchen negatives Tracking (Buchstaben wirken bei großer Schrift sonst zu weit auseinander), Fließtext bleibt bei ~0 (leicht positiv nur bei sehr kleinen Caps-Labels).

Quelle der Wahrheit: die `fontSize`-Skala in `apps/web/tailwind.config.ts` — jede Tailwind-Textgröße (`text-base` bis `text-7xl`) trägt ihr eigenes `lineHeight`/`letterSpacing`-Paar. Jede Komponente, die eine dieser Klassen nutzt, bekommt die Werte automatisch. Der globale `h1..h6`-Fallback in `globals.css` (`letter-spacing: -0.01em; line-height: 1.3;`) greift nur, wenn keine explizite Textgrößen-Klasse gesetzt ist.

| Größe | Tracking | Leading |
| --- | --- | --- |
| `text-base` / `text-lg` (Body) | `0` | `1.6` |
| `text-xl` – `text-2xl` (Card-Titel) | `-0.005em` bis `-0.01em` | `1.4`–`1.5` |
| `text-3xl` – `text-4xl` (Section-Headings) | `-0.015em` bis `-0.02em` | `1.2`–`1.3` |
| `text-5xl` – `text-6xl` (große Headlines) | `-0.025em` bis `-0.03em` | `1.05`–`1.1` |
| `text-7xl` / Hero (`text-[78px]` o.ä.) | `-0.035em` | `1.02` |

Arbitrary-Value-Größen (`text-[78px]`) ziehen die Skala nicht automatisch — dort `tracking-[...]`/`leading-[...]` explizit nach obiger Tabelle setzen.

Kleine Caps-Labels (`text-[10px]`–`text-xs`, uppercase Badges/Eyebrows) dürfen weiterhin `tracking-wide`/`tracking-wider`/`tracking-widest` nutzen — das ist die eine Stelle, an der positives Tracking richtig ist.

Hierarchie entsteht aus Gewicht + Größe + Leading zusammen, nicht aus Größe allein. Emphase über Gewicht, nicht nur über mehr Fläche.

---

# 7. White Space Rules

Mehr Weißraum.

Mehr Ruhe.

Mehr Fokus.

---

Minimum Section Padding:

120px

---

Card Padding:

24px–32px

---

Hero Padding:

160px+

---

# 8. Layout Principles

## Desktop

Content Max Width:

1400px

---

Hero Layout

40 % Text

60 % Produkt

---

Produkt immer größer als Marketingtext.

---

# 9. Hero Section Rules

Hero Sections sind die wichtigste Komponente.

---

Maximal:

* 1 Headline
* 1 Subheadline
* 2 CTA Buttons
* 1 Haupt-Mockup

---

Nicht erlaubt:

* 10 Karten
* Statistikwände
* Toolübersichten
* Featuregalerien

---

Hero Ziel:

Innerhalb von 3 Sekunden beantworten:

1. Was ist SecretLeaf?
2. Warum brauche ich es?
3. Was mache ich als Nächstes?

---

# 10. Product Mockup Rules

Produkt-Mockups sind keine Wireframes.

Produkt-Mockups sind keine Illustrationen.

Produkt-Mockups sind keine Platzhalter.

---

Sie müssen zeigen:

* echte Pflanzen
* echte Daten
* echte Diagnosen
* echte Workflows
* echten Nutzen

---

Verboten:

* leere States
* generische Symbole
* Dummy Inhalte
* Beispieltexte

---

# 11. Product Presentation Philosophy

Produkte verkaufen Ergebnisse.

Nicht Interfaces.

---

Deshalb zeigen wir:

* Pflanzen
* Fortschritt
* Aufgaben
* Diagnosen
* Erkenntnisse

Nicht:

* Menüs
* Navigationen
* technische Einstellungen

---

# 12. Visual Density Rules

Wenn zwei Elemente denselben Zweck erfüllen:

Eines entfernen.

---

Wenn eine Information nicht kritisch ist:

Ausblenden.

---

Wenn ein Bereich überladen wirkt:

Reduzieren.

---

Fokus schlägt Informationsmenge.

---

# 13. Cards

Cards sind sekundär.

Nicht das Hauptelement.

---

Cards:

* Radius 20–24px
* dezente Border
* subtile Schatten
* dunkle Flächen

---

Keine übertriebenen Glows.

Keine Neon-Effekte.

---

# 14. Buttons

Primary:

Brand Green

---

Secondary:

Ghost

---

Nur eine Primary Action pro Bereich.

---

# 15. Motion & Animation System

Fest. Gilt für immer, für jede Komponente, jeden Agenten.

Referenz-Skills (installiert, vor jeder Animations-Arbeit konsultieren):

`.claude/skills/apple-design`, `.claude/skills/emil-design-eng`, `.claude/skills/review-animations`

---

## 15.1 Grundregel

Animation ist Funktion, nicht Dekoration.

Jede Animation braucht einen von diesen Zwecken:

* räumliche Kontinuität (kommt von rechts, geht nach rechts)
* Statusänderung sichtbar machen
* Feedback auf eine Aktion
* verhindert einen abrupten Sprung

Kein Zweck → keine Animation. "Sieht cool aus" ist kein Zweck.

---

## 15.2 Häufigkeit entscheidet

Mehrmals pro Minute genutzt (Shortcuts, Command Palette, Toggles, Tastatur-Aktionen):

Keine Animation. Niemals.

Gelegentlich genutzt (Modals, Drawer, Toasts, Dropdowns):

Standard-Animation nach 15.3.

Selten / einmalig (Onboarding, Erfolgsmeldung, leerer Zustand):

Darf Delight zeigen.

---

## 15.3 Timing (fest)

Button Press Feedback: 100–160ms

Tooltips, kleine Popover: 125–200ms

Dropdowns, Selects: 150–250ms

Modals, Drawer: 200–500ms

Regel: Standard-UI-Animationen bleiben unter 300ms. Schneller wirkt reaktionsfähiger — auch wenn die reale Ladezeit gleich bleibt.

---

## 15.4 Easing (fest)

Element kommt rein/geht raus: `ease-out`

Element bewegt/morpht auf dem Screen: `ease-in-out`

Hover, Farbwechsel: `ease`

Dauerbewegung (Progress Bar, Marquee): `linear`

`ease-in` ist verboten für UI-Elemente. Es verzögert den Start — genau den Moment, den der Nutzer am genauesten beobachtet — und wirkt dadurch träge.

Custom Curves statt CSS-Standardkurven verwenden:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
```

---

## 15.5 Feedback (fest)

Feedback beginnt bei pointer-down, nicht bei release. Kein Warten auf `click`.

Jedes klickbare Element: `transform: scale(0.97)` auf `:active`, 100–160ms `ease-out`.

Kein Element erscheint aus `scale(0)`. Nichts in der echten Welt taucht aus dem Nichts auf. Start immer `scale(0.95)` + `opacity: 0`.

---

## 15.6 Herkunft & Ursprung

Popover, Menü, Sheet skaliert vom Trigger aus (`transform-origin` auf die Trigger-Position setzen), nicht vom Zentrum.

Ausnahme: Modals. Modals bleiben zentriert — sie gehören keinem Trigger.

Enter und Exit folgen demselben Pfad. Was von rechts hereinkommt, verschwindet nach rechts. Nie rein von rechts, raus nach unten.

---

## 15.7 Springs — nur bei Gesten

Springs ausschließlich für Drag, Swipe, Sheet, alles, das der Nutzer anfassen und mitten in der Bewegung umkehren kann.

Default: kritisch gedämpft, kein Überschwingen (`damping 1.0`, `response 0.3–0.4`).

Bounce (`damping ~0.8`) nur, wenn die Geste selbst Schwung hatte (Flick, Wurf, Swipe-Release). Niemals Bounce bei Fade-ins, Menüs oder Ladezuständen — das wirkt falsch.

Bei Unterbrechung: immer vom aktuellen sichtbaren Wert aus neu animieren, nie vom Zielwert neu starten. Das verhindert einen sichtbaren Sprung.

---

## 15.8 Performance

Nur `transform` und `opacity` animieren — laufen auf der GPU, ohne Layout/Paint.

Niemals `width`, `height`, `padding`, `margin` animieren.

`transition: all` ist verboten. Immer die exakte Property benennen, z. B. `transition: transform 200ms ease-out`.

---

## 15.9 Reduced Motion — Pflicht

`prefers-reduced-motion: reduce` muss auf jeder animierten Komponente greifen: Slide/Spring/Parallax wird zu einer reinen Opacity-Überblendung, kein Overshoot, keine Bewegung im Raum.

```css
@media (prefers-reduced-motion: reduce) {
  .element { transition: opacity 200ms ease; transform: none !important; }
}
```

---

## 15.10 Verboten

* Bounce außerhalb von Gesten-Interaktionen (15.7)
* Spin, außer als Loading-Indikator
* `ease-in` auf UI-Elementen
* `scale(0)` als Start- oder Endzustand
* Animation auf Tastatur-ausgelösten Aktionen
* `transition: all`
* Animationsdauer über 300ms auf Standard-UI (Modals/Drawer ausgenommen, siehe 15.3)
* aggressive, physikalisch unplausible Bewegungen

---

# 16. Materials & Depth

Fest. Gilt für jede schwebende Fläche (Nav, Dropdown, Popover, Menü, Modal, Sheet).

Referenz: apple-design §12, installiert in `.claude/skills/apple-design`.

---

## 16.1 Zwei Materialien, klar getrennt

**Glass (`.glass-surface` in globals.css)** — für alles, das an einem Trigger hängt und Kontext behalten soll: Nav-Leiste, Dropdown, Popover, Kontextmenü, Tooltip. Halbtransparent (~72% Deckkraft), `backdrop-filter: blur(20px) saturate(150%)`. Der Inhalt dahinter muss sichtbar durchscheinen — das ist der ganze Punkt. Eine Fläche mit 95 % Deckkraft ist kein Glass-Material, egal wie viel `backdrop-blur` draufliegt.

**Modal (`.modal-surface` in globals.css)** — für alles, das den Nutzer aus dem Fluss holt und volle Aufmerksamkeit will: Dialog, Bestätigung, Lightbox. Blickdicht, zentriert, kein Trigger-Bezug. Fokus kommt vom dimmenden Scrim im Hintergrund (`bg-black/60` o.ä. + `backdrop-blur-sm` auf dem Scrim, nicht auf dem Modal selbst), nicht von Transparenz der Fläche.

**Nie zwei Glass-Flächen übereinanderstapeln** — die Lesbarkeit bricht zusammen (apple-design §12).

---

## 16.2 Ursprung & Bewegung

Glass-Flächen skalieren aus ihrem Trigger (`transform-origin` an der Trigger-Position, siehe §15.6). Modals bleiben zentriert (`transform-origin: center`) — sie gehören keinem Trigger.

"Materialize" statt nur faden: bei Glass-Flächen animiert `filter: blur()` zusammen mit `scale`/`opacity` (Start `blur-sm`, Ziel `blur-none`), damit die Fläche wirkt, als würde sie als echtes Material ankommen, nicht nur einblenden.

---

## 16.3 Vibrancy

Text auf Glass-Flächen braucht mehr Kontrast als auf blickdichtem Hintergrund — der wechselnde Untergrund frisst Lesbarkeit. Kein reines `text-muted-fg` auf Glass; etwas kräftiger, notfalls `font-medium` statt `font-normal`. Farbe/Akzente auf eine solide Fläche legen, nicht auf die durchscheinende.

---

## 16.4 Verboten

* Ein Dropdown/Popover mit `bg-card` ohne Opacity-Modifier und ohne `backdrop-filter` (blickdicht getarnt als Glass)
* Ein Modal mit `backdrop-filter` auf der Fläche selbst statt auf dem Scrim
* Zwei gestapelte Glass-Flächen
* Ein Popover mit `transform-origin: center` (Ausnahme: Modals)

---

## 16.5 Component Recipes

Fertige, geprüfte Implementierungen für die Standardfälle (Button-Press, Dropdown, Tooltip, Modal, Drawer, Toast, Accordion, Stagger, Hold-to-Confirm, Tab-Indikator, Scroll-Reveal, Drag-to-Dismiss) liegen in `.claude/skills/animate/RECIPES.md`. Bei jeder neuen Komponente dort zuerst nachschlagen, statt aus dem Nichts zu bauen.

---

# 17. Landing Page Rules

Landing Pages verkaufen das Produkt.

---

Reihenfolge:

Hero

↓

Trust

↓

Produktvorteile

↓

Features

↓

CTA

---

Nicht:

Features zuerst.

---

# 18. Dashboard Rules

Dashboard = Arbeitsfläche.

Nicht Marketing.

---

Zeige:

* relevante Daten
* nächste Schritte
* Prioritäten

---

Verstecke:

* unnötige Informationen
* seltene Aktionen

---

# 19. Mobile Rules

Mobile First.

---

Dashboard Inhalte priorisieren.

---

Hero Mockup vor langen Textblöcken.

---

Buttons immer Daumenbereich beachten.

---

# 20. Localization Rules

Texte müssen:

* natürlich wirken
* fachlich korrekt sein
* konsistent sein

---

Verboten:

* Google Translate Stil
* gemischte Sprache
* kaputte Umlaute

---

# 21. Apple Test

Vor jeder Veröffentlichung fragen:

Würde Apple das veröffentlichen?

---

# 22. Linear Test

Wirkt die Seite wie Linear?

Wenn nein:

Überarbeiten.

---

# 23. Stripe Test

Ist die Seite vertrauenswürdig genug für Zahlungsdaten?

Wenn nein:

Überarbeiten.

---

# 24. Final Rule

Jede Designentscheidung muss eine dieser Eigenschaften verbessern:

* Klarheit
* Fokus
* Vertrauen
* Produktverständnis
* Premium-Wirkung

Wenn nicht:

Nicht umsetzen.
