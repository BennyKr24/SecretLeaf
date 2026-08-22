# Studies-Kategorisierung — Restructure-Plan (2026-08-22)

> **Status: Planungsdokument. Nichts hiervon ist implementiert.** Folgt aus
> dem TODO-Eintrag "🗂️ Studies-Kategorisierung" in `TODO.md`. Auf
> ausdrücklichen Wunsch nur geplant, nicht umgesetzt — Entscheidung liegt
> beim Nutzer.

---

## 1. Datenbasis (real ausgezählt, nicht geschätzt)

Aus dem live gefilterten `wikiArticles`-Export (`apps/web/src/data/terpira/wiki.ts`,
nach `GROW_KNOWLEDGE`-Allowlist — das, was Nutzer tatsächlich sehen):

| Kategorie | Anzahl | Anteil |
|---|---:|---:|
| **anbau** | **54** | **56 %** |
| sicherheit | 6 | 6 % |
| konsumformen | 6 | 6 % |
| konzentrate | 6 | 6 % |
| genetik | 6 | 6 % |
| qualitaet | 5 | 5 % |
| terpene | 5 | 5 % |
| chemie | 5 | 5 % |
| werkzeuge | 4 | 4 % |
| medizin, recht, markt | 0 | 0 % |
| **Gesamt** | **97** | |

`anbau` ist mehr als eine Größenordnung größer als jede andere Kategorie —
keine graduelle Schieflage, sondern eine strukturelle.

## 2. Kernbefund: `anbau` ist mehrheitlich Diagnose, nicht Technik

Alle 54 `anbau`-Artikel einzeln durchgegangen und nach tatsächlichem
Inhaltstyp gebündelt (nicht nach `difficulty` oder Titel-Vibe):

| Cluster | Anzahl | Beispiele |
|---|---:|---|
| **Diagnose — Mangel** | 6 | `magnesiummangel`, `stickstoffmangel`, `calciummangel`, `kaliummangel`, `eisenmangel`, `phosphormangel` |
| **Diagnose — Überschuss/Toxizität** | 4 | `stickstoffueberschuss`, `kalium-ueberschuss`, `calciumueberschuss`, `naehrstoffverbrennung-tipburn` |
| **Diagnose — Krankheiten** | 5 | `bud-rot-botrytis`, `echter-mehltau-powdery-mildew`, `wurzelfaeule`, `fusarium`, `hop-latent-viroid-hlvd` |
| **Diagnose — Schädlinge** | 6 | `spinnmilben`, `thripse`, `trauermuecken`, `blattlaeuse`, `weisse-fliege`, `hanf-rostmilben` |
| **Diagnose — Umweltstress** | 8 | `hitzestress`, `kaeltestress`, `windbrand`, `luftfeuchte-management`, `co2-management`, `ph-lockout`, `ueberwaesserung-staunaesse`, `salzanreicherung-hohe-ec` |
| **Diagnose — Werkzeuge/generisch** | 4 | `blattsymptom-troubleshooter`, `stressmarker-frueh-erkennen`, `wurzelgesundheit-diagnose`, `ec-und-runoff-interpretation` |
| **Diagnose gesamt** | **33** | **61 % von `anbau`, 34 % von allen 97 Artikeln** |
| Anbau-Grundlagen/Technik | 7 | `cannabis-anbau-grundlagen`, `cannabis-substrat-und-wurzelzone`, `bewaesserung-ohne-uebergiessen`, `substrat-vergleich-coco-erde-hydro`, `dli-und-photoperiode`, `vpd-nach-wachstumsphase`, `ph-management-coco-erde-hydro` |
| Technik (aktiv/Methode) | 5 | `lichtstress-und-canopy-management`, `integrierte-schaedlingspraevention-grow`, `calmag-supplementierung`, `naehrstoffblockaden-und-antagonismen`, `naehrstoffbedarf-cannabis-lebenszyklus` |
| Phasen-Tutorials & How-To-Grow | 6 | `how-to-grow-cannabis-{anfaenger,fortgeschritten,profi}-tutorial`, `bluetephase-ernaehrung-und-pflege`, `outdoor-anbau-fuer-einsteiger`, `indoor-outdoor-anbau-vergleich` |
| Ernte & Nachernte | 3 | `trocknung-protokoll`, `erntefenster-trichomreife`, `trichom-reifegrad-bilddiagnose` |

**Der eigentliche Befund ist nicht "`anbau` ist zu groß", sondern "`anbau`
vermischt zwei komplett unterschiedliche Nutzerintentionen":** jemand mit
einem akuten Pflanzenproblem sucht anders (symptomgetrieben, dringend) als
jemand, der vorausschauend plant (Technik/Tutorial, kein Zeitdruck). Eine
flache Kategorie-Liste bedient keinen der beiden gut.

## 3. Wichtiger Kontext: Es gibt schon ein bewährtes Muster dafür

`apps/web/src/app/[locale]/diagnose/` ist ein **eigenständiges,
interaktives Diagnose-Tool** (Entscheidungsbaum, `lib/diagnose/tree.ts`),
komplett getrennt von `/studies`. Es gruppiert seine vier Einstiegspunkte
**nicht** nach technischer Ursachen-Taxonomie (Mangel/Toxizität/Krankheit/
Schädling/Stress), sondern **symptomgetrieben, aus Nutzersicht**:

```
Blätter · Wachstum & Wurzeln · Klima & Umgebung · Schädlinge
```

Das ist bereits die richtige Antwort auf "wie sortiere ich Diagnose-Content
nutzerfreundlich" — nur eben fürs interaktive Tool, nicht für die
`/studies`-Artikelbibliothek. Eine neue Kategorie für dieselben Artikel
sollte **dieses bestehende Muster wiederverwenden statt eine zweite,
konkurrierende Taxonomie zu erfinden** (sonst lernt ein Nutzer zwei
verschiedene Sortierlogiken für dasselbe Themenfeld).

Zusätzlicher Fund dabei: Es gibt laut `docs/TODO.md` bereits eine Referenz
auf ein "Diagnose-Kategorien-Pattern" als UI-Vorbild für andere
Redesigns — das Muster ist im Produkt also schon als wiederverwendbar
etabliert, nicht nur zufällig vorhanden.

## 4. Optionen

**Option A — Nur UI-Filter, `TerpiraCategory` bleibt unverändert.**
`anbau` bleibt eine Kategorie, aber `/category/anbau` bekommt eine zweite
Filterebene (Tabs/Pills) mit den vier `/diagnose`-Gruppen plus einer
fünften "Technik & Tutorials"-Gruppe. Geringster Eingriff: keine
Datenmodell-Änderung, kein neuer Kategorie-Slug, keine URL-Änderungen.
Nachteil: Der Coverage-Matrix-Blickwinkel (Diagnose als eigener, klar
gewichteter Bereich) bleibt in den Daten unsichtbar — `getArticlesByCategory("anbau")`
liefert weiterhin alles vermischt.

**Option B — Neue Top-Level-Kategorie `diagnose` in `TerpiraCategory`.**
Alle 33 Diagnose-Artikel wandern in eine neue Kategorie, intern mit
derselben Blätter/Wachstum & Wurzeln/Klima & Umgebung/Schädlinge-Gruppierung
wie das `/diagnose`-Tool. `anbau` schrumpft auf 21 Artikel (Grundlagen,
Technik, Tutorials, Ernte) — passt dann größenordnungsmäßig zu den
anderen Kategorien. Sauberste Lösung strukturell, aber echte
Migrationsarbeit: `TerpiraCategory`-Union, `categoryLabels`,
`CATEGORY_DESCRIPTIONS`, `CATEGORY_ICONS`, `defaultSourceIdsByCategory`
(alle in `wiki.ts`/`categoryIcons.ts`) plus jeder betroffene
`category:`-Wert an 33 Artikel-Objekten.

**Option C — Hybrid (Empfehlung, siehe unten).**
Option B umsetzen, aber **Ernte & Nachernte in `anbau` belassen** (nur 3
Artikel, eigene Kategorie wäre zu klein) und **Diagnose-Werkzeuge/
generische Troubleshooter** (`blattsymptom-troubleshooter`,
`stressmarker-frueh-erkennen`, `wurzelgesundheit-diagnose`,
`ec-und-runoff-interpretation`) explizit in `diagnose` einsortieren, weil
sie funktional Einstiegspunkte in genau diesen Denkprozess sind, nicht
Lehrbuch-Grundlagen.

## 5. Empfehlung

**Option C.** Ergebnis: `anbau` (21 Artikel: Grundlagen, Technik,
Tutorials, Ernte) und `diagnose` (33 Artikel, intern nach dem
`/diagnose`-Tool-Muster gruppiert) — beide noch die größten Kategorien im
System, aber in einer Größenordnung, die eine Kategorie-Seite tatsächlich
browsbar macht, und mit einer Trennlinie, die der wirklichen
Nutzerintention entspricht statt einer beliebigen Content-Type-Grenze.

**Wichtig für die Zukunft:** Der Content-Backlog (`docs/CONTENT_BACKLOG.md`)
sieht allein für den "Diagnostic Core" noch **12 weitere Mängel + 12
Krankheiten + 12 Schädlinge** vor (`docs/KNOWLEDGE_COVERAGE_MATRIX.md`).
Ohne diese Restrukturierung würden praktisch alle davon in `anbau` landen
und die Schieflage von 56 % auf über 70 % treiben. **Diese Entscheidung
lohnt sich, bevor die nächste Content-Factory-Welle startet, nicht
danach** — sonst muss dieselbe Migration später mit noch mehr Artikeln
wiederholt werden.

## 6. Was technisch angefasst werden müsste (Aufwandsschätzung, nicht umgesetzt)

- `apps/web/src/lib/terpira/types.ts` — `TerpiraCategory`-Union um
  `"diagnose"` erweitern.
- `apps/web/src/data/terpira/wiki.ts` — `categoryLabels`,
  `defaultSourceIdsByCategory`, `CATEGORY_ICONS`-Import-Stelle;
  `category:`-Feld an ~30 Artikel-Objekten in `wiki.ts` + `diagnostics.ts`
  ändern (mechanisch, aber viele Einzelstellen).
- `apps/web/src/app/[locale]/category/[slug]/page.tsx` —
  `CATEGORY_DESCRIPTIONS` um `diagnose` ergänzen; optional die
  Blätter/Wachstum/Klima/Schädlinge-Untergruppierung als Filter einbauen
  (Wiederverwendung von `diagnoseCategories` aus `lib/diagnose/tree.ts`
  wäre naheliegend, auch wenn die Datenstrukturen nicht 1:1 kompatibel
  sind). **Hinweis:** Diese Seite hat aktuell ohnehin einen unabhängigen,
  vorbestehenden Bug (`params` nicht awaited, 404) — der müsste bei jeder
  Änderung an dieser Datei mit gefixt werden, sonst bleibt die neue
  Kategorie-Seite unerreichbar.
- Überall, wo Kategorien in Navigation/Menüs/Filtern hartcodiert
  aufgelistet werden (noch nicht durchsucht — Teil der eigentlichen
  Umsetzung, nicht dieser Planung).
- `docs/KNOWLEDGE_COVERAGE_MATRIX.md` — Struktur schon fast passend
  (führt Diagnose-Domänen bereits separat), müsste nur an die neue
  `TerpiraCategory`-Realität angeglichen werden statt nur konzeptionell
  getrennt zu sein.
- **Kein URL-Bruch für einzelne Artikel:** `/studies/[slug]` ist nicht
  kategorie-namespaced, nur `/category/[slug]` ändert sich für die 33
  wandernden Artikel. Kein SEO-Risiko für bestehende Artikel-Links.

## 7. Offene Fragen für die Entscheidung

1. Neuer Kategorie-Name: `diagnose` (deckt sich mit dem Tool-Namen) oder
   z. B. `probleme`/`diagnostik`? Empfehlung: `diagnose`, exakt wegen der
   Konsistenz mit dem bestehenden Tool.
2. Soll die neue Kategorie-Seite die Blätter/Wachstum & Wurzeln/Klima &
   Umgebung/Schädlinge-Gruppierung wirklich 1:1 vom `/diagnose`-Tool
   übernehmen, oder reicht vorerst eine flache Liste (Migration jetzt,
   UI-Feinschliff später als separater Task)?
3. Migration in einem Rutsch oder gestaffelt (z. B. erst die 33
   bestehenden Diagnose-Artikel, `anbau`-Grundlagen/Technik/Tutorials erst
   mal unverändert lassen)?
