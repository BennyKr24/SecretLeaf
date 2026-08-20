# 🛠️ Engineering TODO

Konkrete, code-nahe Folgeaufgaben, die über mehrere Sessions hinweg entdeckt
wurden — gefundene Bugs, halb verdrahtete Features, verschobene
Entscheidungen. Das ist **nicht** die Produkt-Roadmap (siehe `ROADMAP.md`) und
**nicht** der Content-Backlog (siehe `docs/CONTENT_BACKLOG.md`), sondern die
"geht nicht mehr verloren"-Liste für Engineering-Arbeit.

> Wenn du etwas aufgreifst: Punkt erledigen, dann aus dieser Datei löschen —
> Git-Historie und Commit-Message sind der Nachweis, was gemacht wurde. Diese
> Datei soll immer nur den aktuellen Stand zeigen, kein Changelog werden.

**Status-Legende:** 🔧 gefixt, braucht noch Verifikation · 🔍 neu gefunden,
noch nicht untersucht · ⏸️ blockiert auf Entscheidung/Check, kein Code nötig
· 💤 niedrige Priorität, kein Bug

---

## 💳 Pro-Plan / Stripe — Live-Modus fehlt noch (Stand 2026-08-19)

- ✅ **Test-Modus vollständig eingerichtet und Ende-zu-Ende verifiziert.**
  Stripe Sandbox-Account (`SecretLeaf Sandbox`, `acct_1U6HpRH5zm2C1ryD`):
  Produkt "SecretLeaf Pro" (`prod_V6UsY1toNoD36j`) mit zwei Preisen
  (4,99 €/Monat `price_1U6HsqH5zm2C1ryDGfauWbZr`, 59 €/Jahr
  `price_1U6HsqH5zm2C1ryDmCUPIt4N`), Webhook-Endpoint →
  `https://secretleaf.vercel.app/api/billing/webhook` (3 Events), Customer
  Portal aktiviert (Kündigen + Zahlungsmethode ändern). Alle vier
  `STRIPE_*`-Werte stehen in `apps/web/.env.local`. Kompletter Testlauf lokal
  durchgespielt: Login → `/pricing` → echte Checkout Session → Testkarte
  `4242 4242 4242 4242` bezahlt → `subscriptions`-Zeile mit `plan=pro`
  landet korrekt → `/pricing` und `/profile` zeigen Pro → Customer Portal
  öffnet echte Stripe-Seite mit Abo/Rechnung/Kündigen-Option. Dabei nebenbei
  gefixt: die lokale `subscriptions`-Migration war nie gegen die lokale DB
  gefahren worden (nur als Datei vorhanden) — jetzt angewendet.
- ⏸️ **Für echten Go-Live fehlt nur noch, was ausschließlich manuell geht:**
  1. Dieselbe Produkt-/Preis-/Webhook-/Portal-Konfiguration im Stripe
     **Live-Modus** wiederholen (Sandbox-Werte gelten nur für Tests)
  2. Die vier Live-`STRIPE_*`-Werte (Secret Key, Webhook Secret, beide
     Price-IDs) in **Vercel → Settings → Environment Variables** eintragen —
     `.env.local` gilt nur lokal
  3. Preis in `apps/web/src/app/[locale]/pricing/page.tsx`
     (`PRICE_*_DISPLAY`-Konstanten) einmal gegen die Live-Preise gegenchecken

---

## 🖼️ Bilder-Nachprüfung (Pests + Deficiencies, 2026-08-19)

- ⏸️ **Nochmal kritisch über die Fotos in beiden Lexika drüberschauen.**
  Heute alle Bilder in `studies/pests` (16 Arten) und `studies/deficiencies`
  (7 Mangelbilder) neu besorgt/geprüft, dabei mehrfach falsch zugeordnete
  Bilder erst im zweiten/dritten Anlauf gefunden (Erdfloh-Eier statt Käfer,
  falsche Pflanze bei Gallmücken, Diagramm statt Foto bei Schildläusen,
  unklare Milben-Fotos). Mit frischem Blick nochmal alle durchgehen, ob noch
  was Falsches/Unklares übersehen wurde. Siehe `apps/web/public/terpira/
  pests/ATTRIBUTION.md` und `.../deficiencies/ATTRIBUTION.md` für die
  aktuelle Quellenliste.

## 📐 Grow-Rechner — offene Werte ohne belastbare Quelle

- ⏸️ **Outdoor-Ertrag `GPP_OUTDOOR` in `yield.ts`** (200/400/600 g/Pflanze) —
  Recherche (2026-08-20) bestätigt: echte Redesign-Frage, kein Zahlendreher.
  Dominanter Einzelfaktor laut mehreren Quellen ist Topfgröße/Wurzelraum
  (Faustregel ~25 g Trockenertrag/Gallone bis ~10 gal, danach abnehmender
  Grenzertrag), zweitwichtigster Faktor die Vegetationsdauer vor der Blüte.
  Vorschlag: `GPP_OUTDOOR` durch Topfgrößen-Input (Lookup-Tabelle statt
  linearer Formel, da die Kurve ab ~10 gal abflacht) ersetzen, Vegdauer als
  zweiten Modifikator (×0.7 kurz / ×1.0 standard / ×1.3 verlängert)
  ergänzen; bestehende Genetik-/Substrat-/Dünger-Faktoren multiplikativ
  draufrechnen. Braucht UI-Entscheidung (neuer Input im Rechner), daher
  nicht selbstständig umgesetzt.
- 💤 **`intelligence.ts` Ertragsverlust-/-gewinn-Gramm-Heuristiken** (z. B.
  "−35g bei fehlendem Log") und **`phases.ts` Phasen-Dauern** sind
  produktinterne Heuristiken ohne externe Quelle bzw. stark sorten-/setup-
  abhängig — nicht gegen Literatur prüfbar, absichtlich nicht angefasst.

## 🌐 Übersetzung / i18n

- ⏸️ **Englisch-Übersetzer (`TranslateButton` → `/api/translate` → MyMemory)
  ist für den echten Content ungeeignet, bräuchte einen anderen Anbieter.**
  Root Cause gefunden (2026-08-15): `apps/web/src/app/api/translate/route.ts`
  nutzt die kostenlose MyMemory-API mit harten Limits — 500 Zeichen pro
  Request (`text.slice(0, 500)`) und ~5.000 Zeichen/Tag/IP, geteilt über
  **alle** Nutzer, die von derselben Vercel-Server-IP übersetzen. Studien-
  Artikel sind oft mehrere tausend Zeichen lang, das Tageslimit ist damit
  praktisch sofort aufgebraucht — deckt sich mit dem Nutzer-Report "geht bei
  Studien nicht, eigentlich überall nicht". Betroffen: `TranslateButton.tsx`
  (überall verwendet, nicht nur Studien) + `lib/translate.ts`. Fix braucht
  eine Entscheidung für einen echten Übersetzungs-Backend (z. B. DeepL-API,
  oder über den bereits integrierten Anthropic-Client aus dem Admin-AI-
  Assist-Feature laufen lassen, oder Studien-Content einmalig statisch
  vorübersetzen statt live on-demand) — daher noch kein Code-Fix, erstmal
  Anbieter-Entscheidung nötig.

## 🧪 Dünger-Katalog (`/database`, `/database/fertilizers`) — Restructure Phase 2/3

Phase 1 (Preis-/Shop-Schicht mit fabrizierten Daten entfernen) ist erledigt
(2026-08-19) — siehe Audit-Artifact und `duenger_katalog_audit.html` im
Scratchpad der Session. Offen:

- ⏸️ **Phase 2 — Fachdaten andocken.** 242 Produktprofile (NPK/EC/pH/
  Verdünnung aus `data/terpira/fertilizers.ts`) als auswählbare Presets in
  `tools/naehrstoff-rechner` integrieren. Restliche Katalog-Ansicht zur
  reinen Nachschlagetabelle ohne Preise umbauen, im Wissenssystem verankert
  (analog "Sortendatenbank"/"Extraktdatenbank" aus
  `02_Produkt/01_Produktübersicht.md`). `/database`-Hub-Framing
  "Produkt-Katalog" auflösen; Nav-Eintrag in `components/MoreSheet.tsx:94`
  entsprechend anpassen/umbenennen.
- ⏸️ **Phase 3 — Entscheidung, nicht Code.** Ob später eine echte
  Preis-Pipeline (SerpAPI + produktiver Vercel-Cron statt dem aktuell
  lokalen `crontab`-Setup, siehe TD-07 im Technical Debt Register) gebaut
  wird, ist eine eigene Infra-/Budget-Entscheidung, losgelöst von Phase 1/2.
  `scripts/sync-fertilizer-prices.mjs` bleibt als möglicher Ausgangspunkt
  liegen.

## 📚 Quellenregister (`/studies/sources`)

- 🔍 **Inhalt: "Neuer Bereich"-Banner zum Schädlings-Lexikon wirkt stale.**
  Der rosa Hinweis-Kasten oben auf der Seite bewirbt das Schädlings-Lexikon
  noch als brandneu ("Jetzt verfügbar") — dürfte inzwischen etabliert sein
  und nicht mehr als Ankündigung geführt werden. Prüfen, ob der Banner weg
  kann oder durch aktuellere Inhalte ersetzt werden sollte.

## 📱 Mobile UX (nach dem Nav/PWA-Umbau vom 2026-08-16)

- 💤 **`SearchBar.tsx`s Such-Pill hat `min-w-[200px]`, unabhängig vom
  Viewport.** Auf sehr schmalen Phones (320–360px) kann das zusammen mit
  Logo + UserMenu/ThemeToggle/LanguageSwitcher in der 60px-Topnav eng
  werden. Noch nicht als echtes Problem beobachtet (kein Overflow in den
  SSR-Checks), nur als Risiko erkannt — Fix wäre ein kompaktes Icon-only
  `SearchBar` unterhalb von `sm`, analog zum Diagnose-Kategorien-Pattern.
- 💤 **`.tool-slider`-Thumb (Range-Input, `globals.css`) bleibt bei 20px** —
  unter der 44px-Touch-Empfehlung. Nicht angefasst, weil native
  `<input type="range">`-Thumbs sich nicht wie Buttons per Padding
  vergrößern lassen, ohne Track/Thumb-Proportion (6px Track) neu zu
  gestalten — eher eine Redesign- als eine Ein-Zeilen-Frage.
- 💤 **`studies/pests/page.tsx`-Lightbox bewusst nicht auf Bottom-Sheet
  umgestellt** (anders als die übrigen Dialoge) — ist ein Bildbetrachter,
  kein Formular; zentriert/fade-scale bleibt dort die bessere UX als ein
  Sheet. Kein offener Bug, nur Doku, warum diese eine Stelle vom sonst
  einheitlichen Modal→Sheet-Muster abweicht.
