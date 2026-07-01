# REPORT: Update-System P0-Implementation
**Stand:** 1. Juni 2026  
**Status:** ✅ Abgeschlossen — Typecheck clean, Build 108/108

---

## 1. Umgesetzte Maßnahmen

### P0-A — Feature-CTA-System

**Ziel:** Jedes Update kann Nutzer direkt zu einem relevanten Feature führen.

**Änderungen:**

| Datei | Art |
|---|---|
| `src/lib/updates.ts` | `UpdateCta`-Type + optionales `cta`-Feld in `UpdateEntry` |
| `src/data/updates.json` | CTAs für alle 4 bestehenden Updates |
| `[slug]/page.tsx` | `CtaSection`-Renderer (rendert nur wenn `cta` vorhanden) |
| `[slug]/client.tsx` | `UpdateCtaButton` — Client Component mit Analytics-Tracking |

**Schema-Erweiterung:**
```ts
export type UpdateCta = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};
```

**Verhalten:**
- `variant: "primary"` → grüner Primär-Button (`bg-primary`)
- `variant: "secondary"` → transparenter Border-Button
- Kein CTA im JSON → kein Rendering (null-safe, kein conditionals nötig)
- Klick trackt `update_cta_clicked` mit `{ slug, target: href, category }`

**CTAs in updates.json:**
| Slug | Label | Href | Variant |
|---|---|---|---|
| `diagnose-grow-kontext` | Diagnose jetzt starten | `/diagnose` | primary |
| `grow-os-log-system` | Grow OS öffnen | `/start` | primary |
| `schaedlingslexikon-v2` | Schädlingslexikon öffnen | `/studies/pests` | secondary |
| `volltext-suche-duenger-katalog` | Suche ausprobieren | `/search` | secondary |

---

### P0-B — Newsletter-Integration

**Ziel:** Update-Abonnements an dem Moment, wo Nutzer-Interesse am höchsten ist.

**Änderungen:**

| Datei | Art |
|---|---|
| `[slug]/client.tsx` | `UpdateNewsletterBlock` — dark-theme-konforme Komponente |
| `[slug]/page.tsx` | Integration nach `NextStepsSection`, vor Footer |

**Technische Details:**
- Verwendet denselben `/api/newsletter`-Endpunkt wie die bestehende `NewsletterSignup`-Komponente
- Feuert `Analytics.newsletterSignup()` bei Erfolg (konsistent mit bestehendem Tracking)
- 3 Status: `idle` → `loading` → `success` / `error`
- Success-State ersetzt das Formular — kein Re-Submit möglich
- Dark-theme-konform: `bg-card`, `border-border`, `text-muted-fg`
- Dezent positioniert: kein Modal, keine Overlay, natürlicher Content-Flow

---

### P0-C — Analytics-Events

**Ziel:** Vollständige Messbarkeit aller Update-Interaktionen.

**Änderungen:**

| Datei | Art |
|---|---|
| `src/lib/analytics.ts` | 3 neue Events im `Analytics`-Objekt |
| `[slug]/client.tsx` | `UpdateViewTracker` — unsichtbarer `useEffect`-Wrapper |
| `[slug]/page.tsx` | `UpdateViewTracker` eingebunden |
| `updates/client.tsx` | `CategoryFilterLink` — trackt Kategorie-Klicks |
| `updates/page.tsx` | `CategoryFilterLink` statt einfacher `<Link>` |

**Neue Events:**

```ts
Analytics.updateViewed(slug, category, version, featured)
// → 'update_viewed' mit { slug, category, version, featured }

Analytics.updateCtaClicked(slug, target, category)
// → 'update_cta_clicked' mit { slug, target, category }

Analytics.updateCategoryViewed(category)
// → 'update_category_viewed' mit { category }
```

**Architektur-Entscheidung:**  
Detail-Seiten sind Server Components — direktes `useEffect` nicht möglich. `UpdateViewTracker` ist eine minimale `'use client'`-Komponente ohne eigenes UI, die ausschließlich das Analytics-Event feuert. Kein unnötiges Client-Bundle-Gewicht.

**Parameter-Übersicht:**

| Event | `slug` | `category` | `version` | `featured` | `target` |
|---|---|---|---|---|---|
| `update_viewed` | ✅ | ✅ | ✅ (`"none"` wenn null) | ✅ | — |
| `update_cta_clicked` | ✅ | ✅ | — | — | ✅ |
| `update_category_viewed` | — | ✅ | — | — | — |

---

### P0-D — JSON-LD Structured Data

**Ziel:** Rich Snippets in Google Search, bessere Crawl-Tiefe.

**Änderungen:**

| Datei | Art |
|---|---|
| `[slug]/page.tsx` | `<script type="application/ld+json">` inline im JSX-Root |

**Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "...",
  "description": "...",
  "datePublished": "2026-06-01",
  "url": "https://secretleaf.de/updates/...",
  "keywords": "Diagnose, SecretLeaf, Grow OS, Cannabis Anbau",
  "publisher": {
    "@type": "Organization",
    "name": "SecretLeaf",
    "url": "https://secretleaf.de"
  }
}
```

**Technische Details:**
- Vollständig dynamisch — alle Felder aus `UpdateEntry` generiert
- `keywords` kombiniert `categoryMeta.label` + feste SEO-Terme
- `dangerouslySetInnerHTML` ist hier korrekt und notwendig (Standard-Pattern für JSON-LD in Next.js)
- `TechArticle` gewählt statt `Article` — semantisch präziser für Software-Release-Notes
- Rendert im `<>` Fragment-Wrapper gemeinsam mit `UpdateViewTracker` vor `<main>`

---

## 2. Neue Dateien

| Datei | Inhalt |
|---|---|
| `[locale]/updates/[slug]/client.tsx` | `UpdateViewTracker`, `UpdateCtaButton`, `UpdateNewsletterBlock` |
| `[locale]/updates/client.tsx` | `CategoryFilterLink` |

**Warum eigene Client-Dateien statt bestehende umschreiben:**  
Next.js App Router erfordert explizite `'use client'`-Boundaries. Eine Mischung aus Server- und Client-Logik in einer Datei erzeugt entweder Fehler oder wandelt die gesamte Seite in eine Client Component um — was SEO und Performance kostet. Die Trennung in `page.tsx` (Server) + `client.tsx` (Client) ist das idiomatische Pattern.

---

## 3. Betroffene Dateien (Gesamt)

| Datei | Änderungstyp |
|---|---|
| `src/lib/updates.ts` | Erweitert: `UpdateCta` type, `cta` in `UpdateEntry` |
| `src/lib/analytics.ts` | Erweitert: 3 neue Events |
| `src/data/updates.json` | Erweitert: `cta`-Felder für alle 4 Updates |
| `[locale]/updates/page.tsx` | Angepasst: `CategoryFilterLink` statt `<Link>` |
| `[locale]/updates/[slug]/page.tsx` | Erweitert: JSON-LD, Tracker, CTA-Section, Newsletter |
| `[locale]/updates/[slug]/client.tsx` | Neu erstellt |
| `[locale]/updates/client.tsx` | Neu erstellt |

---

## 4. Validierung

```
npm run typecheck   ✅  0 Fehler
npm run build       ✅  108/108 Routen
                    ✅  ✓ Compiled successfully
                    ✅  ƒ /[locale]/updates
                    ✅  ƒ /[locale]/updates/[slug]
```

---

## 5. Offene Risiken

### R1 — JSON-LD ohne Testing-Validierung
Das TechArticle-Schema wurde nach Google-Spezifikation implementiert, aber nicht gegen den [Rich Results Test](https://search.google.com/test/rich-results) validiert. Ein Deployment ohne vorherigen Test könnte unerwartete Schema-Fehler in der Search Console erzeugen.

**Empfehlung:** Nach dem nächsten Deployment die URL in den Rich Results Test eingeben.

### R2 — `UpdateViewTracker` feuert auch bei SSR-Prefetch
Next.js kann Seiten prefetchen — `useEffect` feuert nur clientseitig, aber aggressive Prefetch-Strategien könnten bei manchen Nutzern mehrfache `update_viewed`-Events erzeugen wenn die Komponente unmountet und remountet wird.

**Empfehlung:** Akzeptabel für jetzt. Bei Bedarf: sessionStorage-Deduplication (`if (!sessionStorage.getItem(slug)) { track(); sessionStorage.setItem(slug, '1'); }`).

### R3 — Newsletter-Endpunkt ohne Rate-Limiting sichtbar
`/api/newsletter` ist öffentlich erreichbar. Da der Block jetzt auf jeder Update-Detailseite erscheint, erhöht sich die Angriffsfläche für E-Mail-Flooding minimal. Bereits in der bestehenden `NewsletterSignup`-Komponente vorhanden — kein neues Risiko, aber zu beachten.

**Empfehlung:** Prüfen ob `/api/newsletter/route.ts` bereits Rate-Limiting enthält. Falls nicht: bei P1 ergänzen.

### R4 — `CategoryFilterLink` rendert `<a>` statt `<Link>` bei Analytics-Klick
`CategoryFilterLink` wrапpt `next/link` korrekt, aber der `onClick`-Handler führt den Analytics-Call synchron vor der Navigation aus. Bei sehr langsamer Verbindung könnte der Event verloren gehen.

**Empfehlung:** Akzeptabel — Plausible-Events sind fire-and-forget. Kein Datenverlust der UX beeinträchtigt.

---

## 6. P1-Maßnahmen (empfohlen als nächste Iteration)

### P1-A — "What's New" Indikator in Navigation
Letztes gesehenes Update in localStorage — grüner Dot in `NavigationBar` wenn neueres Update vorhanden.
- **Dateien:** `NavigationBar.tsx` + neuer `useLastSeenUpdate`-Hook
- **Aufwand:** ~2h
- **Impact:** Wiederkehrende Nutzer-Reaktivierung über bekannte Nav-Elemente

### P1-B — hreflang-Alternates in `generateMetadata`
```ts
alternates: {
  canonical: `${BASE_URL}/de/updates/${slug}`,
  languages: { 'de': '...', 'en': '...' }
}
```
- **Dateien:** `[slug]/page.tsx`
- **Aufwand:** 15 Minuten
- **Impact:** Korrekte bilinguale Google-Indexierung

### P1-C — Premium-Flag im Schema
`premium?: boolean` + `upgradeHref?: string` in `UpdateEntry` → Upgrade-Banner auf Premium-Feature-Updates.
- **Dateien:** `updates.ts`, `[slug]/page.tsx`, `updates.json`
- **Aufwand:** ~1h
- **Impact:** Direktes Monetarisierungspotenzial über Updates

### P1-D — Rate-Limiting für `/api/newsletter`
Prüfen und ggf. ergänzen: IP-basiertes Rate-Limiting (max. 3 Versuche / 15 min).
- **Dateien:** `app/api/newsletter/route.ts`
- **Aufwand:** ~1h
- **Impact:** Schutz vor E-Mail-Flooding

### P1-E — `sessionStorage`-Deduplication für `UpdateViewTracker`
Verhindert mehrfache `update_viewed`-Events bei Hot-Reload oder Remounts.
- **Dateien:** `[slug]/client.tsx`
- **Aufwand:** 15 Minuten
- **Impact:** Sauberere Analytics-Daten
