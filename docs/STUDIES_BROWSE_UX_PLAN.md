# Studies-Seite: Browse/Filter-UX-Plan (2026-08-22)

> **Status: Planungsdokument, nichts implementiert.** Der Header von
> `/studies` bleibt unverändert (der ist laut Nutzer bereits gut). Dieser
> Plan behandelt ausschließlich den Bereich darunter —
> `StudiesListView.tsx` und wie `/studies` bzw. `/category/[slug]` ihn
> nutzen.

---

## 1. Warum das jetzt ein echtes Problem ist

`StudiesListView` gruppiert Ergebnisse **immer nach Kategorie**, jede
Kategorie als eigene Card mit Header + bis zu 6 sichtbaren Zeilen +
"Mehr anzeigen". Auf `/studies` (ungefiltert) bedeutet das: **bis zu 14
gestapelte Kategorie-Cards untereinander**, bei aktuell 97 Artikeln — vor
der heutigen Kategorien-Restrukturierung wären es sogar 14 Cards mit einer
davon (`anbau`) allein 54 Zeilen gewesen. Selbst jetzt, nach dem
Diagnose/Tutorials-Split: `diagnose` hat 33 Artikel, `anbau` 15 — beide
sprengen den 6er-Vorschau-Rahmen deutlich, das Scrollen bis zu den
kleineren Kategorien (`werkzeuge`: 4, `markt`: 0) wird lang.

Zusätzlicher, unabhängig davon bestehender Befund: Die Filter (`category`,
`difficulty`, `sort`, `search`, `activeTag`) leben nur in React-`useState`,
**nicht in der URL**. Ein gefilterter Zustand ist nicht teilbar, nicht
bookmarkbar, und der Zurück-Button des Browsers springt nicht zwischen
Filterzuständen — bei einer wachsenden Bibliothek ein wachsendes Problem,
unabhängig vom Layout.

## 2. Recherche: Wie andere große Content-Bibliotheken das lösen

Kurz recherchiert (siehe Quellen unten), drei wiederkehrende Prinzipien:

1. **Mehrere parallele Navigationswege statt eines einzigen.** Große
   Wissensdatenbanken funktionieren am besten mit Suche, Kategorie-Browsing,
   Hub-Seiten und Verlinkung *gleichzeitig* — nicht mit einem einzigen,
   immer gleichen Listen-Widget für jeden Einstiegspunkt.
2. **Facetten statt (nur) verschachtelter Gruppen.** Bei inhaltsreichen
   Seiten sind Facetten (Kategorie, Schwierigkeit, Tags — kombinierbar,
   mit Ergebniszahl pro Option, leicht entfernbar) der Standard für
   "viele Artikel durchsuchbar machen" — SecretLeaf hat technisch bereits
   fast alle Zutaten dafür (Category-, Difficulty-, Tag-Filter existieren
   einzeln), nutzt sie aber nicht als kombinierbare Facetten mit
   Live-Zählung, sondern als separate Dropdowns plus eine erzwungene
   Gruppierung obendrüber.
3. **"Jede Seite ist Seite eins" + Hub-Seiten für Übersicht.** Bei großen
   Bibliotheken braucht die Übersichtsseite selbst Struktur (Breadcrumbs,
   Kategorie-Hubs), damit Nutzer, die direkt landen, sich orientieren
   können, statt eine lange Liste von allem zu sehen.

Für rein technische Doku-Tools (Stripe Docs, GitBook, Notion) ist eine
**persistente Sidebar mit Baumstruktur** das dominante Muster. Das passt
aber schlecht zu SecretLeaf: Das Produkt ist mobile-first (Bottom-Nav,
PWA-Umbau vom 16.08.), konsumentenorientiert wie eine Gesundheits-/
Ratgeber-Seite, nicht ein Entwickler-Referenzwerk — näher an Healthline/
WebMD-artigen Artikel-Bibliotheken als an Docs-Tools. Dort dominieren
**Kategorie-Hub-Seiten mit Karten-Raster + Top-Suche + Filter-Chips**,
keine Sidebar.

## 3. Für SecretLeaf abgewogene Optionen

**Option A — Nur die Gruppierung entschärfen.** `sectionLimit` senken,
Kategorien standardmäßig eingeklappt (Accordion) statt aufgeklappt.
Geringster Eingriff, behebt aber nicht das Grundproblem: Auf `/studies`
sieht man weiterhin zuerst 14 Kategorienamen statt eine echte Übersicht,
und gefiltert wird immer noch nicht als kombinierbare Facette.

**Option B — Echte Facetten-Suche, flache Ergebnisliste.**
Kategorie/Schwierigkeit/Tags werden zu kombinierbaren Facetten mit
Live-Zählung (`("Diagnose" · 33)`, `("Einsteiger" · 12)` etc.), Ergebnisse
als **eine flache, ggf. paginierte Liste/Grid** statt nach Kategorie
gruppiert. Sehr gut für gezielte Suche, aber ohne Hub-Ebene fehlt die
Orientierung für jemanden, der einfach nur "was gibt's hier" browsen will.

**Option C — Hub-Seite + Facetten-Drilldown (Empfehlung).**
Zwei-Ebenen-Modell, das die bereits funktionierenden
`/category/[slug]`-Seiten (heute Morgen erst gefixt) als echte zweite
Ebene nutzt statt sie nur als Umleitung mit gleicher Komponente zu
behandeln:

- **`/studies` wird eine Übersichts-/Hub-Seite.** Oben der bestehende
  Header (bleibt unverändert). Darunter: ein **Kategorie-Karten-Raster**
  (14 Karten: Icon, Label, Artikelanzahl, `CATEGORY_DESCRIPTIONS`-Text —
  alles existiert schon aus der heutigen Kategorien-Arbeit, nur noch nicht
  als Kartenraster gerendert), plus eine **globale Schnellsuche** direkt
  darunter/darüber für "ich weiß genau, wonach ich suche"-Fälle, die
  direkt zu Ergebnissen über alle Kategorien hinweg springt. Kein
  automatisches Alle-97-Artikel-Dump mehr auf der Startseite.
- **`/category/[slug]` wird die eigentliche Browse-/Facetten-Seite.**
  Hier macht Gruppierung nach Kategorie keinen Sinn mehr (man ist ja
  schon in einer) — stattdessen: Schwierigkeit + Tags als echte,
  kombinierbare Facetten-Chips mit Live-Zählung, Ergebnisse als **ein
  flaches Grid/Liste**, keine verschachtelten Cards mehr.
- **Sonderfall `diagnose` (33 Artikel, wächst laut Backlog auf ~58):**
  Zusätzliche Facette "Symptombereich", die exakt die vier Gruppen aus
  dem bereits bestehenden `/diagnose`-Tool wiederverwendet (Blätter ·
  Wachstum & Wurzeln · Klima & Umgebung · Schädlinge) — dieselbe
  Empfehlung wie im Kategorien-Restructure-Plan von heute, hier als
  UI-Facette statt als eigene Route umgesetzt.
- **Filter → URL-Query-Params.** `?category=diagnose&difficulty=einsteiger&tag=…`
  synchronisiert, damit gefilterte Ansichten teilbar/bookmarkbar werden
  und der Zurück-Button funktioniert — behebt das in Abschnitt 1 genannte,
  unabhängige Problem gleich mit.

## 4. Warum Option C und nicht B

Reine Facetten-Suche (B) optimiert für "ich weiß, was ich suche". Eine
Hub-Ebene (C) optimiert zusätzlich für "ich weiß es noch nicht, zeig mir
die Landkarte" — und genau das fehlt aktuell auf `/studies` am meisten,
weil dort sofort in den Weiter-lesen-Modus gesprungen wird, ohne
Überblick. Die zusätzliche Hub-Ebene ist wenig Mehraufwand, weil
`categoryLabels`, `CATEGORY_ICONS`, `CATEGORY_DESCRIPTIONS` und die
Artikelzahlen pro Kategorie schon aus der heutigen Kategorien-Arbeit
existieren — es fehlt nur die Kartenraster-Darstellung selbst.

## 5. Konkrete Umsetzungsschritte (Aufwandsschätzung, nicht implementiert)

- **Neue Komponente `CategoryHubGrid`** (o. ä.) für `/studies`: Karten aus
  `categoryLabels` + `CATEGORY_ICONS` + `CATEGORY_ACCENT` +
  `CATEGORY_DESCRIPTIONS` (Letztere aktuell nur in
  `category/[slug]/page.tsx` definiert — müsste an einen gemeinsamen Ort
  wandern, z. B. `lib/terpira/categoryIcons.ts`, damit beide Seiten
  darauf zugreifen können) + Live-Artikelzahl pro Kategorie.
- **`StudiesListView.tsx` entkoppeln:** Die kategoriegruppierte Darstellung
  (aktuell der einzige Modus) wird zum Modus für `/studies`s
  Ergebnisliste bei aktiver Suche/Filter *über* Kategorien hinweg
  (kompakter, ohne Gruppen-Cards); `/category/[slug]` bekommt einen neuen,
  flachen Facetten-Modus ohne Kategorie-Gruppierung (macht dort ohnehin
  keinen Sinn) mit Schwierigkeit + Tags als klickbare Facetten-Chips samt
  Live-Zählung.
- **URL-Sync für Filter:** `useSearchParams`/`router.replace` statt reinem
  `useState` für `category`, `difficulty`, `search`, `activeTag` — Next.js
  App-Router-Standardmuster, keine neue Abhängigkeit nötig.
- **Diagnose-Symptombereich-Facette:** Neues, kleines Mapping
  Artikel-Slug → Symptombereich (Blätter/Wachstum & Wurzeln/Klima &
  Umgebung/Schädlinge), entweder als zusätzliches optionales Feld an den
  33 Diagnose-Artikeln oder als eigenständige Lookup-Tabelle, die die
  bereits vorhandene Tag-Struktur nutzt, wo möglich, statt Daten doppelt
  zu pflegen.
- **`studies/page.tsx`:** Hero bleibt exakt wie er ist (Nutzer-Feedback:
  "sieht top aus"); nur der Abschnitt darunter wird von `<StudiesListView
  articles={wikiArticles} … />` zu `<CategoryHubGrid …>` +
  optional weiterhin eine kompakte globale Suche.

## 6. Langfristige Tragfähigkeit

Mit dem heutigen Kategorien-Split (`anbau` 15, `diagnose` 33, `tutorials`
6) und dem geplanten Wachstum aus `docs/CONTENT_BACKLOG.md`
(`diagnose` → ~58, `anbau` → ~23, `tutorials` → ~11) bleibt Option C
tragfähig, **weil die Hub-Ebene nicht mit der Artikelzahl mitwächst** —
14 Kategorie-Karten bleiben 14 Karten, ob eine Kategorie 6 oder 58
Artikel enthält. Das eigentliche Wachstum verlagert sich auf die
Facetten-Zahlen innerhalb von `/category/[slug]`, wo es durch Filterung
statt durch mehr Scrollen abgefangen wird. Das ist genau das
Future-Proofing-Prinzip, das auch der heutigen Kategorien-Entscheidung
zugrunde lag.

## 7. Offene Fragen für die Umsetzungsentscheidung

1. Globale Suche auf `/studies`: eigenes, kompaktes Suchfeld direkt im
   Hub, oder reicht der Sprung zur bestehenden Sitesuche (Search-Modal,
   laut Memory bereits überarbeitet)? Doppelte Suchimplementierungen
   sollten vermieden werden.
2. Diagnose-Symptombereich-Facette: als eigenes Datenfeld an den
   Artikeln pflegen, oder aus vorhandenen Tags heuristisch ableiten (mehr
   Automatik, weniger Pflegeaufwand, aber unschärfer)?
3. Reihenfolge der 14 Kategorie-Karten im Hub: nach Artikelzahl (aktuell
   dominant: diagnose, anbau), nach vermuteter Nutzerhäufigkeit, oder
   alphabetisch? Empfehlung: dieselbe `ORDERED_CATEGORIES`-Reihenfolge
   wie heute schon für Konsistenz mit Dropdown/Filter.

---

**Quellen (Recherche):**
- [Knowledge Base Architecture: A Complete 2026 Guide](https://www.bolddesk.com/blogs/knowledge-base-architecture)
- [Self-Service Knowledge Base Design: 2026 IA Playbook](https://www.digitalapplied.com/blog/self-service-knowledge-base-design-2026-information-architecture-playbook)
- [Document360 — Knowledge Base Information Architecture Best Practices](https://document360.com/blog/knowledge-base-information-architecture/)
- [Fact-Finder — Faceted search: 9 best practices](https://www.fact-finder.com/blog/faceted-search/)
- [UXtweak — Filter vs. Facet](https://blog.uxtweak.com/filter-vs-facet/)
- [Ahrefs — Faceted Navigation: Definition, Examples & SEO Best Practices](https://ahrefs.com/blog/faceted-navigation/)
