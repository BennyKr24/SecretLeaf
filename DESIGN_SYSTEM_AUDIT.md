# Design System Audit

Audit-Snapshot: 2026-06-01

Hinweis 2026-07-01: Historischer Design-Audit-Snapshot. Aktuelle Produkt-/Betriebswahrheit steht in README.md und ARCHITECTURE.md.

Referenz:

- DESIGN_SYSTEM.md

## Ergebnis

Die Produktsprache ist inzwischen klarer und hochwertiger, aber die zentrale Grow-UI weicht noch sichtbar vom Design System ab.

## Direkt behobener Verstoß

### Diagnose Result

Status: Teilweise behoben

- Harte Amber- und Slate-Statusflächen wurden auf ruhigere semantische Flächen zurückgeführt.
- Confidence-Visualisierung ist jetzt konsistenter mit dem restlichen Produkt.

## Größte verbleibende Verstöße

### 1. Grow Overview wirkt noch zu dashboard-artig

Schweregrad: Hoch

Beobachtung:

- Viele Abschnitte in `grow/[id]` arbeiten noch mit harten Farb-Utilities und starkem Status-Coloring.
- Die Seite ist funktional, aber visuell dichter und lauter als in DESIGN_SYSTEM.md gefordert.

Widerspruch zu DESIGN_SYSTEM:

- verletzt `Product First`
- verletzt `Premium Before Density`
- verletzt `Calm Interfaces`

### 2. Grow Log bleibt farblich heterogen

Schweregrad: Hoch

Beobachtung:

- `grow/[id]/log` nutzt weiterhin viele direkte Emerald-, Rose- und Slate-Signale.
- Die Seite ist effektiv, aber eher Operations-Dashboard als Premium-Produktoberfläche.

### 3. Diagnose ist ruhiger, aber noch nicht vollständig tokenisiert

Schweregrad: Mittel

Beobachtung:

- Der Kern ist verbessert.
- Einzelne Komponenten arbeiten weiter mit statuslastigen visuellen Mustern statt mit einer vollständig semantischen Tokenlogik.

## Bewertung nach Kernroute

### Grow Overview

Bewertung: 58/100

- Stark im Produktnutzen
- zu viele direkte Utility-Farben
- zu hohe Informationsdichte

### Grow Log

Bewertung: 62/100

- guter Workflow
- klare Logik
- visuell noch zu template-nah

### Diagnose

Bewertung: 74/100

- deutlich ruhiger als zuvor
- Explainability gut sichtbar
- noch nicht vollständig systemisch vereinheitlicht

### Studies / Search / Status

Bewertung: 72/100

- Terminologie deutlich besser
- in diesem Lauf nicht erneut tief re-auditiert

## Nächste direkte Schritte

1. Grow Overview komplett auf semantische Tokens umstellen.
2. Grow Log Farb- und Badge-System vereinheitlichen.
3. Statusfarben nur dort einsetzen, wo sie echte Priorität und nicht reine Dekoration markieren.# Design System Audit

Audit-Snapshot: 2026-06-01

## Referenz

Abgleich gegen `DESIGN_SYSTEM.md`.

## Fokus dieses Audits

Zentral sichtbare Produktpfade mit hoher Relevanz:

- Grow Overview
- Grow Log
- Diagnose Result
- Smart Insights
- Grow Knowledge Panel

## Direkt behobene Verstöße

### Diagnose Result beruhigt und stärker tokenbasiert

Betroffener Pfad:

- `apps/web/src/components/diagnose/DiagnoseResult.tsx`

Vorher:

- harte Amber- und Slate-Statusfarben in Confidence-States und Ursachenbox

Jetzt:

- ruhigere, semantischere Flächen über `bg-background`, `border-border`, `text-foreground`, `text-muted-fg`
- nur noch begrenzter Primärakzent statt mehrerer konkurrierender Statusfarben

Wirkung:

- bessere Einhaltung von `Calm Interfaces`
- weniger visuelles Chaos im Diagnose-Endzustand

## Größte verbleibende Verstöße

### Hoch: Grow Overview ist weiterhin stark light-theme- und hardcode-lastig

Betroffener Pfad:

- `apps/web/src/app/[locale]/grow/[id]/page.tsx`

Befund:

- viele direkte `slate`, `emerald`, `rose`, `amber`, `violet` Klassen
- viele Einzelzustände mit visueller Sonderbehandlung
- dadurch inkonsistente Distanz zum semantischen Token-System

Konsequenz:

- Die wichtigste Produktfläche wirkt uneinheitlicher als die bereits migrierten Core-Komponenten.

### Hoch: Grow Log ist funktional stark, visuell aber noch nicht durchgängig systematisch

Betroffener Pfad:

- `apps/web/src/app/[locale]/grow/[id]/log/page.tsx`

Befund:

- Success-, Reward- und Insight-States nutzen weiterhin viele harte Farbcodes.
- Die Fläche priorisiert Wirkung, aber nicht konsequent Systemkonsistenz.

### Mittel: Grow-Flächen sind dichter und lauter als die Produktphilosophie erlaubt

Betroffene Pfade:

- `apps/web/src/app/[locale]/grow/[id]/page.tsx`
- `apps/web/src/app/[locale]/grow/[id]/log/page.tsx`

Befund:

- sehr viele Statuskarten, Emojis, Highlight-Flächen und konkurrierende Farbstufen
- kollidiert teilweise mit `Premium Before Density` und `Calm Interfaces`

## Bereits gut ausgerichtet

- `apps/web/src/components/SmartInsights.tsx`
- `apps/web/src/components/grow/GrowKnowledgePanel.tsx`
- `apps/web/src/components/diagnose/DiagnoseResult.tsx`

Diese Flächen wirken inzwischen näher am Produktkern:

- klare Hierarchie
- semantischere Farbverwendung
- gute Kopplung von Handlung und Kontext

## Priorisierte Folgeschritte

1. Vollständige Token-Migration von `grow/[id]`.
2. Zweite Token-Migration von `grow/[id]/log`.
3. Danach Reduktion von Dichte und Statuslärm auf beiden Flächen.