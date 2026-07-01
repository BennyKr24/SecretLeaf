# REPORT: Update-System Audit
**Stand:** 1. Juni 2026  
**Version des Systems:** 1.0 (initial release)  
**Scope:** `apps/web/src/data/updates.json`, `apps/web/src/lib/updates.ts`, `[locale]/updates/page.tsx`, `[locale]/updates/[slug]/page.tsx`

---

## 1. Aktuelle Architektur

### Datenebene

| Datei | Rolle | Status |
|---|---|---|
| `src/data/updates.json` | Single source of truth, editorieller Inhalt | ✅ vorhanden |
| `src/lib/updates.ts` | Typen, Datenzugriff, Badge-Klassen | ✅ vorhanden |
| `src/data/changelog.json` | Auto-generiert aus Git-Commits, nur für `/status` | ✅ getrennt |

### Routing

| Route | Typ | Rendering |
|---|---|---|
| `/[locale]/updates` | Liste + Kategorie-Filter | Server Component, `ƒ` dynamic |
| `/[locale]/updates/[slug]` | Detail-Seite | Server Component, `ƒ` dynamic |

### Datenfluss

```
updates.json
  → getAllUpdates() / getUpdateBySlug()
    → [locale]/updates/page.tsx (Liste)
    → [locale]/updates/[slug]/page.tsx (Detail)
      → generateStaticParams() für statische Vorgenerierung
```

### Sections-Modell (aktuell)

```
sections:
  neu[]          — neue Features (headline + body + items)
  verbessert[]   — Verbesserungen (headline + body + items)
  datenbank      — DB-Erweiterungen mit counts-Grid
  diagnose[]     — Diagnose-spezifisch (headline + body + items)
  performance[]  — flat string list
  fixes[]        — flat string list
  nextSteps[]    — plain text, keine Links
stats{}          — Zahlen-Grid für Major Releases
```

### Was funktioniert

- Typsicheres Datenmodell mit `exactOptionalPropertyTypes` — vollständig kompatibel
- `categoryMeta` im JSON — neue Kategorien ohne Codeänderungen
- SEO-Grundlage: `canonical`, `openGraph`, `publishedTime`
- Kategorie-Filter via URL-Parameter — indexierbar
- Breadcrumb-Navigation
- Tailwind-Purging korrekt gelöst (`BADGE_COLORS` im Code, nicht im JSON)
- Build: 108/108 Routen, kein TypeScript-Fehler

---

## 2. Auditbefunde nach Dimension

---

### 2.1 Growth

#### Kritisch

**[RISK-G1] Kein Rückweg ins Produkt nach Update-Lektüre**  
Nach dem Lesen einer Detailseite gibt es ausschließlich einen Link zurück zur Update-Liste. Kein einziger CTA verweist auf das beschriebene Feature. Ein Nutzer, der das Diagnose-Update liest, hat keine direkte Verbindung zu `/diagnose`. Der Aktivierungspfad endet auf der Update-Seite.

**[RISK-G2] `nextSteps[]` ist plain text — keine verlinkten Aktionen**  
Die `nextSteps`-Section enthält freien Text wie `"Diagnose-Verlauf pro Pflanze in der Grow-Übersicht"`. Es gibt kein `href`-Feld, keinen CTA-Button. Der Nutzer kann die genannten Schritte nicht direkt ausführen.

**[RISK-G3] Updates sind navigationsseitig vollständig isoliert**  
`/updates` ist nicht in der `NavigationBar` verlinkt. Kein bestehender Nutzer findet die Seite ohne direkten Link. Kein "What's New"-Badge in Nav oder Dashboard.

#### Mittel

**[RISK-G4] Kein "Neu seit deinem letzten Besuch"-Indikator**  
Es gibt keinen Mechanismus (localStorage, Cookie), der einem wiederkehrenden Nutzer zeigt, welche Updates seit dem letzten Besuch erschienen sind. Der i18n-Key `noNewUpdates` in `de.json` deutet auf eine geplante, aber nicht implementierte Funktion hin.

**[RISK-G5] Featured-Karte hat keinen Feature-CTA**  
Die große Featured-Karte auf der Listenseite ist rein redaktionell. Kein Button "Jetzt ausprobieren". Kein direkter Einstieg in das beworbene Feature.

---

### 2.2 Retention

#### Kritisch

**[RISK-R1] `NewsletterSignup`-Komponente ist nicht eingebunden**  
Eine funktionierende `NewsletterSignup`-Komponente (`/api/newsletter`, Analytics-Event `newsletter_signup`) existiert im System — ist aber auf keiner der Updates-Seiten eingebunden. Der offensichtlichste Moment für eine Newsletter-Anmeldung ("Bleib auf dem Laufenden") wird nicht genutzt.

**[RISK-R2] Keine Analytics-Events für Updates**  
Das `Analytics`-Objekt in `lib/analytics.ts` hat Events für `growCreated`, `logEntryAdded`, `newsletterSignup`, `wikiArticleOpened` — aber kein `update_viewed`, kein `update_cta_clicked`, kein `update_category_filtered`. Jede Frage wie "Welche Updates werden gelesen?" oder "Welche Kategorie konvertiert?" ist derzeit unbeantwortbar.

#### Mittel

**[RISK-R3] Kein In-App-Benachrichtigungssystem vorbereitet**  
Es gibt keine Datenbasis für "Nutzer X hat Update Y noch nicht gesehen". Kein `seenAt`-Feld in der Nutzer-Datenbank, kein localStorage-Tracking der letzten gesehenen Slug-ID.

**[RISK-R4] Kein Update-Feed als RSS oder Atom**  
Ein RSS-Feed unter `/updates/feed.xml` würde nicht nur Nutzer-Subscriptions ermöglichen, sondern auch SEO-Aggregatoren und externe Tools versorgen. Nicht vorhanden.

---

### 2.3 SEO

#### Kritisch

**[RISK-S1] Kein strukturiertes Daten-Schema (JSON-LD)**  
Die Detailseite setzt `openGraph.type: 'article'` und `publishedTime` — aber kein `<script type="application/ld+json">` mit `Article`- oder `TechArticle`-Schema. Google kann die Seiten nicht als strukturierte Release-Notes interpretieren. Kein Potenzial für Rich Snippets.

**[RISK-S2] Keine hreflang-Alternates**  
Das Routing ist unter `[locale]` — also `/de/updates/...` und `/en/updates/...`. Die `generateMetadata`-Funktion setzt nur eine kanonische URL ohne `alternates.languages`. Bilinguale SEO-Signale fehlen vollständig.

#### Mittel

**[RISK-S3] Keine eingehenden internen Links von anderen Seiten**  
Keine Seite im Produkt verlinkt auf `/updates`. Weder `/diagnose`, `/tools`, noch die Startseite oder das Dashboard. Das SEO-Signal für Crawl-Tiefe und interne Relevanz ist minimal.

**[RISK-S4] Updates-Seite fehlt in der Sitemap**  
Unklar, ob `/updates` und `/updates/[slug]` in einer `sitemap.xml` erfasst sind. `generateStaticParams` allein reicht für indexierbare Sitemap-Einträge nicht aus.

**[RISK-S5] Kein Open Graph Image pro Update**  
Alle Updates-Seiten teilen dasselbe generische OG-Image (sofern eines existiert). Feature-spezifische Bilder würden Social-Shares deutlich performanter machen.

---

### 2.4 Datengewinn

#### Kritisch

**[RISK-D1] Keine Messung von Update-Reads**  
Kein Plausible-Event beim Aufruf einer Detailseite. Da die Seiten Server Components sind, ist eine einfache clientseitige Implementierung via `useEffect` + `Analytics.track` nicht direkt möglich — erfordert einen `'use client'`-Wrapper oder eine separate Tracking-Komponente.

**[RISK-D2] Keine CTA-Klick-Messung**  
Selbst wenn CTAs existierten, gibt es kein Event dafür. Ohne `update_cta_clicked` mit `{ slug, target }` ist die Conversion vom Update-Lesen zur Feature-Nutzung nicht messbar.

#### Mittel

**[RISK-D3] Keine Kategorie-Interessen-Auswertung**  
`getAvailableCategories()` liefert die Kategorien — aber welche Kategorie-Filterklicks am häufigsten passieren, ist nicht erfasst. Wäre trivial mit `Analytics.track('update_category_filtered', { category })`.

---

### 2.5 Monetarisierung

#### Kritisch

**[RISK-M1] Kein `premium`-Flag auf Sections oder im Datenmodell**  
Das `UpdateEntry`-Schema hat kein `premium: boolean`-Feld und keine Section-Level-Markierung. Es gibt keine Möglichkeit, ein Update als "Premium Feature" zu kennzeichnen und einen Upgrade-CTA anzuzeigen.

**[RISK-M2] Kein Upgrade-CTA auf der Updates-Seite**  
Keine der Seiten hat einen Bezug zu `/upgrade` oder einem Abo-Modell. Selbst ein einfaches Banner "Einige Features sind Teil von SecretLeaf Pro" fehlt.

#### Mittel

**[RISK-M3] Keine Differenzierung zwischen Free-/Pro-Updates**  
Im aktuellen Modell haben alle Updates denselben Status. Für ein Freemium-Modell ist eine Trennung zwischen öffentlichen und Pro-exklusiven Updates essenziell.

---

### 2.6 Enterprise-Readiness

#### Kritisch

**[RISK-E1] Kein Mehrsprachigkeits-Support im Datenmodell**  
`UpdateEntry` hat `title: string`, `summary: string` — keine Locale-Varianten. Bei 500+ Updates und zwei Sprachen wäre die Datenmenge in einem einzigen JSON erheblich. Das Schema ist aktuell nicht i18n-fähig.

**[RISK-E2] Keine Paginierung der Listen-Seite**  
Bei 500+ Updates wird die Listen-Seite ohne Paginierung oder virtuelles Scrolling zu einer langen Seite mit O(n) Render-Kosten. Der aktuelle Grid-Ansatz rendert alle Entries in einer Anfrage.

#### Mittel

**[RISK-E3] Kein Author-Feld im Schema**  
`UpdateEntry` hat kein `author`-Feld. Bei Team-Wachstum oder externen Autoren fehlt die Möglichkeit, Einträge zu einer Person zuzuordnen.

**[RISK-E4] Keine automatische Brücke zwischen changelog.json und updates.json**  
`changelog.json` wird durch `scripts/generate-changelog.mjs` aus Git-Commits generiert. Es gibt keine Automatisierung, die relevante Einträge als Draft in `updates.json` überführt. Der redaktionelle Prozess ist vollständig manuell.

**[RISK-E5] Keine Versionierung des Datenschemas**  
Das JSON hat kein `schemaVersion`-Feld. Bei Schemamigration (z.B. neuer Section-Typ) ist keine rückwärtskompatible Verarbeitung möglich.

---

## 3. Risiko-Matrix

| ID | Dimension | Schwere | Aufwand | Auswirkung bei Nichtbeheben |
|---|---|---|---|---|
| RISK-G1 | Growth | Hoch | Mittel | Kein Aktivierungspfad vom Update ins Produkt |
| RISK-R1 | Retention | Hoch | Niedrig | Newsletter-Opportunity komplett verschenkt |
| RISK-R2 | Retention | Hoch | Niedrig | Kein datenbasiertes Update-Reporting möglich |
| RISK-S1 | SEO | Hoch | Niedrig | Keine Rich Snippets, schwächeres Crawling |
| RISK-M1 | Monetarisierung | Hoch | Mittel | Monetarisierungspotenzial von Updates = null |
| RISK-G2 | Growth | Mittel | Mittel | nextSteps ohne Handlungskonsequenz |
| RISK-G3 | Growth | Mittel | Niedrig | Updates sind für bestehende Nutzer unsichtbar |
| RISK-S2 | SEO | Mittel | Niedrig | Bilinguale Indexierung unvollständig |
| RISK-D1 | Datengewinn | Mittel | Mittel | Update-Performance nicht messbar |
| RISK-E1 | Enterprise | Mittel | Hoch | System nicht skalierbar für DE+EN Content |
| RISK-E2 | Enterprise | Mittel | Mittel | Seitenperformance degradiert bei Wachstum |
| RISK-E4 | Enterprise | Niedrig | Hoch | Kein halbautomatischer Workflow möglich |

---

## 4. Verbesserungsvorschläge mit Priorität

---

### P0 — Blockiert Grundfunktion oder verschenkt klare Conversion

---

#### P0-A: Feature-CTAs auf der Detailseite

**Problem:** RISK-G1, RISK-G2  
**Lösung:** `UpdateEntry`-Schema um optionale `cta`-Felder erweitern:

```json
{
  "cta": {
    "label": "Diagnose jetzt starten",
    "href": "/diagnose"
  }
}
```

Rendering: Prominenter Button am Ende des Hauptinhalts, vor dem Footer. Zusätzlich im `nextSteps`-Array ein optionales `{ "text": "...", "href": "..." }`-Format statt plain strings.

**Aufwand:** Klein (Schema + 1 Renderer-Komponente)  
**Erwarteter Impact:** Direkter Aktivierungspfad Update → Feature

---

#### P0-B: `NewsletterSignup` in Updates einbinden

**Problem:** RISK-R1  
**Lösung:** `NewsletterSignup`-Komponente am Ende jeder Detailseite einbinden — nach dem Footer-Signature-Block. Optionaler: Minimale Inline-Variante der Komponente mit Kontext (`"Erhalte Updates direkt in dein Postfach"`).

**Aufwand:** Trivial (1 Import + 1 Komponente einfügen)  
**Erwarteter Impact:** Newsletter-Anmeldungen an dem Moment, wo Nutzer-Interesse am höchsten ist

---

#### P0-C: Analytics-Events für das Update-System

**Problem:** RISK-R2, RISK-D1, RISK-D2  
**Lösung:** `Analytics`-Objekt in `lib/analytics.ts` erweitern:

```ts
updateViewed: (slug: string, category: string) =>
  track('update_viewed', { slug, category }),

updateCtaClicked: (slug: string, target: string) =>
  track('update_cta_clicked', { slug, target }),

updateCategoryFiltered: (category: string) =>
  track('update_category_filtered', { category }),
```

Da Detail-Seiten Server Components sind: Tracking-Client-Wrapper-Komponente (`UpdateViewTracker`) mit `useEffect` ohne eigenes UI.

**Aufwand:** Klein  
**Erwarteter Impact:** Vollständige Messbarkeit aller Update-Interaktionen

---

#### P0-D: JSON-LD structured data (Article-Schema)

**Problem:** RISK-S1  
**Lösung:** Auf der Detailseite ein `<script type="application/ld+json">` mit folgendem Schema:

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "...",
  "description": "...",
  "datePublished": "2026-06-01",
  "publisher": {
    "@type": "Organization",
    "name": "SecretLeaf",
    "url": "https://secretleaf.de"
  }
}
```

Implementierung als Server Component im `<head>` via `generateMetadata` (Next.js unterstützt `other.script` nicht direkt) oder als inline `<script>` im Page-Body.

**Aufwand:** Klein  
**Erwarteter Impact:** Rich Snippets in Google, bessere Indexierungstiefe

---

### P1 — Wichtig für Wachstum und Qualität, kein unmittelbarer Blocker

---

#### P1-A: "What's New" — Indikator in Navigation + Dashboard

**Problem:** RISK-G3, RISK-G4  
**Lösung:**
1. Letztes Update-Datum in localStorage speichern
2. `NavigationBar` zeigt grünen Dot neben einem "Neu"-Link wenn `neuestesUpdateDatum > lastSeenDate`
3. Dashboard-Karte "Neues Update verfügbar" mit Link zur Featured-Seite

Das Datum des neuesten Updates kommt aus `getAllUpdates()[0].date` — kein API-Call nötig.

**Aufwand:** Mittel  
**Erwarteter Impact:** Wiederkehrende Nutzer-Reaktivierung über bekannte Navigation

---

#### P1-B: hreflang-Alternates in Metadata

**Problem:** RISK-S2  
**Lösung:** In `generateMetadata` der Detailseite:

```ts
alternates: {
  canonical: `${BASE_URL}/de/updates/${slug}`,
  languages: {
    'de': `${BASE_URL}/de/updates/${slug}`,
    'en': `${BASE_URL}/en/updates/${slug}`,
  }
}
```

**Aufwand:** Trivial  
**Erwarteter Impact:** Korrekte bilinguale Indexierung

---

#### P1-C: Premium-Flag im Datenmodell

**Problem:** RISK-M1, RISK-M2, RISK-M3  
**Lösung:** `UpdateEntry`-Schema erweitern:

```ts
export type UpdateEntry = {
  // ...existing fields...
  premium?: boolean;           // markiert das Update als Pro-Feature
  upgradeHref?: string;        // z.B. "/upgrade"
};
```

Rendering: Wenn `premium: true`, erscheint ein Upgrade-Banner oberhalb des Inhalts. Badge `"Pro Feature"` neben dem Kategorie-Badge.

**Aufwand:** Klein (Schema + 1 Renderer-Komponente)  
**Erwarteter Impact:** Direkte Monetarisierungsanbindung ohne eigenes System

---

#### P1-D: Paginierung / Endless Load für die Listenseite

**Problem:** RISK-E2  
**Lösung:** Ab ~20 Einträgen: Erste 12 rendern, "Weitere laden"-Button als Client Component mit `useState`. Alternativ: Cursor-basiertes URL-Paging (`?page=2`). Der zweite Ansatz ist SEO-freundlicher.

**Aufwand:** Mittel  
**Erwarteter Impact:** Performance-Stabilität bei 100+ / 500+ Updates

---

#### P1-E: Interne Verlinkung von Feature-Seiten auf relevante Updates

**Problem:** RISK-S3  
**Lösung:** `UpdateEntry` um ein optionales `relatedFeatureSlug`-Feld erweitern. Auf `/diagnose`, `/tools` oder `/grow/[id]` erscheint ein "Zuletzt aktualisiert"-Link der auf das neueste Update dieser Kategorie verweist.

Alternativ: Manueller "Zuletzt aktualisiert am [Datum]"-Link auf Feature-Seiten.

**Aufwand:** Mittel  
**Erwarteter Impact:** SEO-Crawl-Tiefe + Glaubwürdigkeit durch transparente Entwicklungshistorie

---

### P2 — Langfristige Skalierbarkeit und Enterprise-Readiness

---

#### P2-A: i18n-fähiges Datenmodell

**Problem:** RISK-E1  
**Lösung:** Schema-Variante mit Locale-Blöcken:

```json
{
  "slug": "diagnose-grow-kontext",
  "date": "2026-06-01",
  "category": "diagnose",
  "featured": true,
  "de": {
    "title": "...",
    "summary": "...",
    "sections": {}
  },
  "en": {
    "title": "...",
    "summary": "...",
    "sections": {}
  }
}
```

`getUpdateBySlug(slug, locale)` würde den korrekten Block zurückgeben. Migration der bestehenden 4 Einträge wäre einmalig.

**Aufwand:** Mittel-Hoch (Breaking Change im Schema, Migration aller vorhandenen Einträge)  
**Empfehlung:** Erst umsetzen wenn englischer Content konkret geplant ist

---

#### P2-B: RSS/Atom-Feed

**Problem:** RISK-R4  
**Lösung:** API-Route `app/api/updates/feed/route.ts` oder statisch generierte `feed.xml` über `generateStaticParams`. Gibt Atom-XML zurück, gebaut aus `getAllUpdates()`.

**Aufwand:** Klein-Mittel  
**Erwarteter Impact:** Passive Retention über externe Feed-Reader, Aggregatoren, SEO-Syndication

---

#### P2-C: `schemaVersion` und Schema-Migration

**Problem:** RISK-E5  
**Lösung:** `updates.json` um Top-Level-Feld erweitern:

```json
{
  "schemaVersion": 1,
  ...
}
```

`updates.ts` prüft bei Import auf kompatible Version. Neue Section-Typen erhalten inkrementierte Version. Breaking Changes lösen eine Migrationswarnung aus.

**Aufwand:** Klein  
**Empfehlung:** Beim nächsten Schema-Breaking-Change einführen

---

#### P2-D: Halbautomatische Changelog-zu-Update-Pipeline

**Problem:** RISK-E4  
**Lösung:** Skript `scripts/draft-update-from-changelog.mjs`, das:
1. `changelog.json` auf neue Einträge seit letztem publizierten Update prüft
2. Commit-Messages nach Kategorien clustert (Feature / Fix / Performance)
3. Einen Draft-Eintrag für `updates.json` generiert (unvollständig, zur manuellen Fertigstellung)

Kein vollautomatischer Release — redaktionelle Qualität bleibt Pflicht.

**Aufwand:** Mittel  
**Erwarteter Impact:** Zeiteinsparung bei häufigen Releases

---

#### P2-E: `author`-Feld + Team-Attribution

**Problem:** RISK-E3  
**Lösung:**

```ts
export type UpdateEntry = {
  // ...
  author?: string; // z.B. "Benny" oder "SecretLeaf Team"
};
```

Rendering: Kleiner Avatar/Name im Header der Detailseite. Erhöht persönliche Nähe und Glaubwürdigkeit.

**Aufwand:** Trivial  
**Empfehlung:** Bei Team-Wachstum ergänzen

---

## 5. Priorisierte Roadmap

### Phase 1 — Sofortmaßnahmen (< 1 Tag Aufwand)

| Priorität | Task | Dateien |
|---|---|---|
| P0-B | `NewsletterSignup` auf Detailseite einbinden | `[slug]/page.tsx` |
| P0-C | Analytics-Events (`update_viewed`, `update_cta_clicked`) | `lib/analytics.ts` + Tracking-Wrapper |
| P0-D | JSON-LD TechArticle-Schema auf Detailseite | `[slug]/page.tsx` |
| P1-B | hreflang-Alternates in `generateMetadata` | `[slug]/page.tsx` |

### Phase 2 — Nächster Sprint (< 3 Tage Aufwand)

| Priorität | Task | Dateien |
|---|---|---|
| P0-A | `cta`-Feld im Schema + CTA-Renderer | `updates.json` Schema + `updates.ts` + `[slug]/page.tsx` |
| P1-C | `premium`-Flag + Upgrade-Banner | `updates.ts` + `[slug]/page.tsx` + `updates.json` |
| P1-A | "What's New"-Dot in Navigation | `NavigationBar.tsx` + localStorage-Hook |

### Phase 3 — Mittelfristig (< 1 Woche Aufwand)

| Priorität | Task | Dateien |
|---|---|---|
| P1-D | Paginierung der Listenseite | `updates/page.tsx` |
| P1-E | Interne Verlinkung Feature → Update | `diagnose/page.tsx`, `tools/...` |
| P2-B | RSS/Atom-Feed | `app/api/updates/feed/route.ts` |

### Phase 4 — Langfristig (> 1 Woche Aufwand)

| Priorität | Task | Dateien |
|---|---|---|
| P2-A | i18n-fähiges Datenmodell | Breaking schema change — separates Migrations-Skript erforderlich |
| P2-D | Changelog-zu-Update-Pipeline | `scripts/draft-update-from-changelog.mjs` |
| P2-C | `schemaVersion` einführen | `updates.json` + `updates.ts` |

---

## 6. Architektonische Bewertung

### Stärken des aktuellen Systems

- **Null-Abhängigkeit zur Datenbank.** Updates sind statische JSON-Daten — kein Supabase-Query, kein Caching-Problem, kein Latency-Risk.
- **Vollständig typsicher.** Alle Sections sind optional typisiert. Neue Section-Typen brechen keine bestehenden Einträge.
- **Editoriell entkoppelt.** `changelog.json` (automatisch) und `updates.json` (redaktionell) bleiben getrennt. Das ist die korrekte Architekturentscheidung.
- **Kategorie-System ist selbsterweiternd.** Neues Kategorie = ein JSON-Eintrag, null Codeänderungen.
- **SEO-Grundlage solide.** Kanonische URLs, OG-Typ `article`, `publishedTime` — alles gesetzt.

### Engpässe bei Skalierung

1. **JSON als Dateiformat hat eine praktische Grenze** bei komplexem Mehrsprachen-Content. Ab ~100 bilingualen Updates empfiehlt sich eine MDX-basierte Struktur (eine Datei pro Update, Frontmatter + Markdown-Body) oder eine CMS-Anbindung (Contentlayer, Sanity).
2. **Server-Component-Constraint begrenzt clientseitiges Tracking.** Alle Seiten sind Server Components. Analytics-Tracking erfordert entweder einen unsichtbaren Client-Wrapper oder eine Umstellung einzelner Seiten auf `'use client'`.
3. **`getAllUpdates()` lädt immer alle Einträge.** Bei 500+ Einträgen ist das für Server-Side-Rendering akzeptabel (Build-Time-Kosten, keine DB-Abfrage) — für den Client aber ineffizient wenn je clientseitig gerendert wird.

### Systemreife

| Dimension | Score | Begründung |
|---|---|---|
| Technische Qualität | 9/10 | Typsicher, skalierbar, build-validiert |
| SEO-Readiness | 5/10 | Grundlagen vorhanden, JSON-LD und hreflang fehlen |
| Growth-Readiness | 2/10 | Keine CTAs, keine Nav-Einbindung |
| Retention-Readiness | 3/10 | Newsletter nicht eingebunden, kein Tracking |
| Monetarisierungs-Readiness | 1/10 | Kein Schema-Support, kein CTA |
| Enterprise-Readiness | 5/10 | Kein i18n, keine Paginierung, kein Feed |
| **Gesamt** | **4/10** | Solides technisches Fundament, aber als Produkt-Asset noch nicht aktiviert |

---

## 7. Fazit

Das Update-System ist technisch sauber und zukunftsfähig gebaut. Das Datenmodell, die Typsicherheit und die Architekturentscheidungen (JSON-Trennung, categoryMeta-Erweiterbarkeit, BADGE_COLORS im Code) sind korrekt.

Das System ist jedoch derzeit ein **technisches Asset ohne Produktverbindung.** Es publiziert Inhalte — aber aktiviert keine Nutzer, reaktiviert keine bestehenden Nutzer, ist für neue Nutzer nicht auffindbar, und erzeugt keinen Upgrade-Druck.

Die drei dringlichsten Maßnahmen:

1. **Newsletter einbinden** (1 Import, trivial) — sofortiger Retention-Gewinn
2. **Analytics-Events** (30 Minuten Aufwand) — Messbarkeit sicherstellen bevor Content wächst
3. **Feature-CTAs** (Schema-Erweiterung + Renderer) — Aktivierungspfad vom Update ins Produkt schließen

Alles andere kann nach diesen drei Schritten priorisiert werden.
