# 💡 SecretLeaf — Ideas

> Hier landen Gedanken bevor sie Aufgaben werden. Kein Filter.

🔥 Will ich bauen · 🌱 Interessant · 🧪 Experiment · 💀 Verworfen · ✅ Gebaut

---

## Übersicht

| Status | Idee | Bereich |
|--------|------|---------|
| 🔥 | AI-Diagnose (Pro) | AI |
| 🔥 | Stripe + Pro-Tier | Monetarisierung |
| 🔥 | Community Grows | Community |
| 🌱 | Auto-Phasen-Erkennung | Grow |
| 🌱 | Harvest Predictor | Grow |
| 🌱 | Plant Notes UI | Grow |
| 🌱 | Grow-Fotos | Grow |
| 🌱 | Grow History View | Grow |
| 🌱 | Harvest-Daten strukturiert | Grow |
| 🌱 | Strain-Integration | Grow + Wissen |
| 🌱 | Phasen-Wechsel-Vorschlag | Grow |
| 🌱 | Sentry Error-Tracking | Tech |
| 🌱 | Analytics | Tech |
| 🌱 | Newsletter Backend | Tech |
| 🌱 | Push Notifications | UX |
| 🌱 | Log-Export | UX |
| 🌱 | Lifetime-Deal | Monetarisierung |
| 🌱 | Affiliate-Links | Monetarisierung |
| 🧪 | Auto-Nährstoff-Anpassung | AI |
| 🧪 | Public Grow Profiles | Community |
| 🧪 | Tool-Ergebnisse in Plant-View | Grow |
| 🌱 | Dark Mode (sauber) | UX |
| 🧪 | Onboarding Tour | UX |
| 🧪 | Fastify API produktiv | Tech |
| 🔥 | i18n / Englisch (next-intl) | Internationalisierung |
| 🌱 | AI Translation Layer | Internationalisierung |
| ✅ | Plant Scoring + Comparison | Grow |
| ✅ | Streak + Milestone-Badges | Retention |
| ✅ | Multi-Plant pro Grow | Grow |

---

## 🤖 AI

- 🔥 **AI-Diagnose (Pro)** — Freitext-Symptom → GPT-4 → `diagnoseResults`. Zugänglicher als Tree. `Voraus: Stripe`
- 🌱 **Auto-Phasen-Erkennung** — `currentDay > endDay` → Toast mit Wechsel-Vorschlag. ~3h, Daten vorhanden.
- 🌱 **Harvest Predictor** — `currentDay` vs `endDay` → "Ernte in ~X Tagen" im Dashboard. Nur Mathe + UI.
- 🧪 **Auto-Nährstoff-Anpassung** — Log-Verlauf → GPT schlägt pH/EC-Anpassung vor. `Voraus: Supabase`

## 🌱 Grow Features

- 🌱 **Plant Notes UI** — `Plant.notes` ist im Typ vorhanden. Nur Textarea in PlantCard fehlt. ~1h.
- 🌱 **Grow-Fotos** — Upload pro Log-Eintrag oder Plant → visuelles Wachstums-Tracking. `Voraus: Supabase Storage`
- 🌱 **Harvest-Daten strukturiert** — Gramm, Strain, Bewertung nach Ernte. Basis für Grow-Vergleiche.
- 🌱 **Grow History View** — Abgeschlossene Grows als Timeline. Daten sind im Store, Ansicht fehlt.
- 🌱 **Phasen-Wechsel-Vorschlag** — Phase überschritten → Nutzer wird gefragt. Tasks aktualisieren sich.
- 🌱 **Strain-Integration** — Genetik aus Studies-Hub → Grow-Wizard → Plan-Parameter auto-anpassen.
- 🧪 **Tool-Ergebnisse in Plant-View** — Kalkulation direkt in Pflanzenkarte, nicht nur als Log-Notiz.

## 👥 Community

- 🔥 **Community Grows** — Anon-Aggregation: "90% mit Coco haben Tag 14 bewässert." `Voraus: Supabase`
- 🧪 **Public Grow Profiles** — `/grow/public/<shareId>` read-only. Opt-in Sharing.

## 💰 Monetarisierung

- 🔥 **Stripe + Pro-Tier** — Feature-Lock + Checkout. Ohne Einnahmen: Hobby. Pro-Kandidaten: AI-Diagnose, Community, Fotos.
- 🌱 **Lifetime-Deal** — Einmalzahlung statt Abo. Einfacherer Checkout für die Zielgruppe.
- 🌱 **Affiliate-Links** — Tool-Links mit Tracking. Passiv, kein Abo nötig.

## 📱 UX & Retention

- 🌱 **Push Notifications** — Service Worker. "Pflanze X 3 Tage nicht bewässert." Hoher Aufwand für den Wert.
- 🌱 **Log-Export** — CSV oder PDF aller Einträge eines Grows.
- 🌱 **Dark Mode** — Tailwind `dark:` Präfix vorhanden, aber sauber umsetzen bedeutet mehr als CSS. Details unten.
- 🧪 **Onboarding Tour** — Erster Grow: Schritt-Erklärung. Erst bei mehr Nutzern sinnvoll.

## � Dark Mode

> Tailwind `dark:` ist da — aber "sauber" bedeutet mehr als ein paar CSS-Klassen.

### Was "sauber" heißt

❌ Nicht: einfach `dark:` vor alle Farben klatschen → inkonsistentes Ergebnis, Flash beim Laden, Hydration-Fehler  
✅ Sondern: System-Präferenz respektieren, kein FOUC, persistiert, kein Flackern beim SSR

---

### Technischer Plan

**1. `next-themes` einbinden** — die Standardlösung für Next.js, löst SSR-Hydration-Problem automatisch:

```bash
npm install next-themes
```

**2. Provider in `layout.tsx` wrappen:**

```tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

`suppressHydrationWarning` auf `<html>` verhindert den Hydration-Mismatch.  
`attribute="class"` → Tailwind `dark:` funktioniert sofort.

**3. `tailwind.config.ts` auf `darkMode: 'class'` setzen** (falls noch nicht):

```ts
export default {
  darkMode: 'class',
  // ...
}
```

**4. Theme Toggle Komponente:**

```tsx
'use client'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

**5. CSS-Variablen statt Hardcoded-Farben** — für konsistentes Dark Mode über alle Komponenten:

```css
/* globals.css */
:root {
  --bg: #ffffff;
  --fg: #0a0a0a;
  --card: #f4f4f5;
  --border: #e4e4e7;
}

.dark {
  --bg: #0a0a0a;
  --fg: #fafafa;
  --card: #18181b;
  --border: #27272a;
}
```

Dann in Tailwind-Klassen via `bg-[var(--bg)]` oder eigene Tokens in `tailwind.config.ts`.

---

### Aufwand-Schätzung

| Schritt | Aufwand |
|---------|---------|
| `next-themes` Setup + Provider | ~30min |
| `tailwind.config.ts` + CSS-Variablen definieren | ~1h |
| Alle Komponenten auf `dark:` Klassen prüfen/ergänzen | ~4–6h |
| Toggle UI bauen + in Header einbauen | ~1h |
| **Gesamt** | **~6–8h** |

---

### Was man nicht tun sollte

- ❌ `localStorage` direkt im `useEffect` für Theme-Init → FOUC (Flash of Unstyled Content)
- ❌ `dark:` nur auf manche Komponenten anwenden → inkonsistentes Design
- ❌ `useTheme()` in Server Components → crasht (muss `'use client'` sein)

---

## �🌐 Internationalisierung

> Sprache ist kein Feature — sondern Growth-Multiplikator. Internationale Reichweite, mehr SEO, mehr Retention.

### Warum überhaupt?

Die Plattform ist aktuell 100% Deutsch. Das limitiert die Reichweite auf DACH.
Englisch erschließt: UK, US, NL, Skandinavien, internationale Cannabis-Community.

---

### Strategie: 3 Content-Typen

| Typ | Inhalt | Übersetzung |
|-----|--------|-------------|
| **A) Static UI** | Buttons, Labels, Fehlermeldungen | JSON-Dateien (`messages/en.json`) — 1x manuell, dann wartbar |
| **B) Structured Content** | Tasks, Phasen-Namen, Diagnose-Texte | Kontrollierte Übersetzung — Qualität wichtig |
| **C) Dynamic Content** | User-Logs, Freitext-Eingaben | AI on-demand (OpenAI API, gecached) |

❌ Nicht: komplette Seiten automatisch blind übersetzen  
❌ Nicht: Fachbegriffe ohne Kontrolle übertragen

---

### Schritt-für-Schritt Plan

**1. `next-intl` integrieren** — beste Wahl für Next.js App Router, SSR-kompatibel, sauber skalierbar.

```bash
npm install next-intl
```

**2. Routing umbauen** — App-Struktur auf `/[locale]/` umstellen:

```
/app
  /[locale]
    /page.tsx
    /grow
    /tools
    /diagnose
    ...

/messages
  de.json   ← bestehende Texte auslagern
  en.json   ← englische Übersetzungen
```

**3. UI-Texte auslagern** — alle hardcodierten Strings in `de.json` → `useTranslations()` Hook:

```tsx
const t = useTranslations('grow');
// statt: "Eintrag speichern"
// jetzt: t('save_entry')
```

**4. Language Switch bauen** — oben rechts 🌐 DE / EN:
- Auswahl in `localStorage` merken
- Fallback: Browser-Sprache (`navigator.language`)
- Nicht versteckt — prominent im Header

**5. AI Translation Layer** — für dynamischen Content (Diagnose-Texte, Tool-Ergebnisse, Logs):

```ts
// lib/translate.ts
async function translateText(text: string, targetLang: 'en' | 'de'): Promise<string> {
  // 1. Cache prüfen (localStorage / später DB)
  // 2. OpenAI API call
  // 3. Ergebnis cachen
}
```

**6. Cache-System** — nicht jeden Request übersetzen:
- Phase 1: `localStorage` Cache (Schlüssel: `hash(text)+lang`)
- Phase 2: Supabase-Tabelle `translation_cache` (nach Storage-Migration)

---

### Aufwand-Schätzung

| Schritt | Aufwand | Voraussetzung |
|---------|---------|---------------|
| next-intl Setup + Routing | ~4h | — |
| UI Texte auslagern (Static UI) | ~6–8h | Routing fertig |
| Language Switch | ~2h | Routing fertig |
| Structured Content (Diagnose, Tasks) | ~4h | JSON-Struktur klar |
| AI Translation Layer | ~4h | OpenAI API Key |
| Cache-System | ~2h | AI Layer fertig |
| **Gesamt** | **~22–24h** | |

---

### i18n-Einträge in IDEAS

- 🔥 **i18n Setup (next-intl)** — Routing `/[locale]`, `messages/en.json` + `messages/de.json`. Pflicht-Basis für alles andere. ~4h.
- 🌱 **AI Translation Layer** — `lib/translate.ts` mit OpenAI-Call + Cache. Für Diagnose-Texte, Tool-Ergebnisse, User-Logs. `Voraus: OpenAI API Key`
- 🌱 **Language Switch UI** — 🌐 DE/EN Header-Button. localStorage + Browser-Fallback. ~2h.
- 🌱 **Structured Content Translations** — Tasks, Phasen, Diagnose-Ergebnisse kontrolliert übersetzen (kein Auto-Translate). ~4h.
- 🌱 **Translation Cache (Supabase)** — Übersetzte Texte in DB cachen statt localStorage. `Voraus: Supabase Storage`

---

## 🛠️ Tech

- 🌱 **Sentry** — 5min Setup, würde sofort echte User-Fehler zeigen. Kein guter Grund warum noch nicht.
- 🌱 **Analytics** — Plausible ($9/mo, privacy-first) oder Posthog (Free Tier, Session Recordings). Ohne: alle Prios blind.
- 🌱 **Newsletter Backend** — `NewsletterSignup.tsx` schreibt in localStorage. Resend/Loops.so ~2h.
- 🧪 **Fastify API produktiv** — Konfiguriert aber wertlos ohne Supabase-Storage für Grows.

---

## 💀 Verworfen

<!-- - 💀 **Idee** — Grund -->

---

## ✅ Umgesetzt

- ✅ **Plant Scoring + Comparison** — Scoring via Log-Frequenz + Bewässerungslücken. `apps/web/src/lib/grow/`
- ✅ **Streak + Milestone-Badges** — 3/7/14/21/30 Tage. `useGrowLog.ts`, RetentionBanner
- ✅ **Multi-Plant pro Grow** — `Plant[]`, rename, Log-Zuordnung. `store.ts`, `types.ts`
