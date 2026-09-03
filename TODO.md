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

## 📊 Admin-Panel-Überarbeitung (Stand 2026-09-03)

Voller Plan + Phasen-Checkliste: `docs/ADMIN_PANEL_OVERHAUL_PLAN.md`.
`/status`-Chronik-Split, Phase 0–3a/b/c und die vier „Hebel"
(`stripe_events`-Idempotenz, Wartungsmodus, Site-Banner, Wachstum-Funnel)
sind gebaut, verifiziert und auf Prod (Migrationen bis `202609030000`
angewendet). Live-Seiten: Lage, Finanzen, Steuerung, Nutzer, Neuigkeiten,
Betrieb, Wachstum, Pro-Codes, **Studien, Assistent**.

- ✅ **Studien + Assistent migriert** (PR #33, 2026-09-03) — auf die neuen
  Primitives, `/api/admin/dashboard` + `lib/adminApi.ts` gelöscht. Studien
  neu: entprellte Suche, `?quality=`-Deep-Link, Review-Notiz-Feld,
  Studien-Typ-Filter. Assistent-Verlauf jetzt serverseitig
  (`admin_assistant_messages`). Prod-Smoke bestanden. Detail:
  `docs/ADMIN_STUDIES_ASSISTANT_MIGRATION_PLAN.md`.
  Offener Kleinkram: `<Dropdown>` für Status/Priorität *im Edit-Modal* mit
  echter Maus gegenprüfen (möglicher z-index-Konflikt mit dem Modal, kein
  Regressions-Nachweis).

Noch offen:
- 🔍 **Mail-Modul** (`/dashboard/admin/mail`, `email_log`): PR #30 ist
  gemerged und der Mailversand läuft (siehe ✉️-Abschnitt), aber das
  Admin-Panel + `email_log`-Tabelle dafür sind noch nicht gebaut.
- 🔍 Phase 2b Rest: `email_log`/`alert_rules`-Migrationen, Cron `cost-sync` +
  `alert-check`, Consent-Records + Compliance-Seite (Phase 4).

---

## 💳 Pro-Plan / Stripe — ZURÜCKGESTELLT bis frühestens ~Feb 2027

- 🅿️ **Entscheidung 2026-08-27: bezahltes Pro kommt in den ersten ~6 Monaten
  nicht.** Zuerst wird Pro inhaltlich so ausgebaut, dass es das Geld wert ist,
  und mehr Nutzungsdaten gesammelt. Übergangsweise höchstens Free-Codes oder
  ein 1-Monats-Trial — kein Live-Checkout. Der komplette Live-Go-Live
  (Stripe-Account-Aktivierung → Produkt/Preise/Webhook/Portal im Live-Modus →
  4 Vercel-Env-Vars → Prod-Smoke-Test) bleibt hier als fertiger Runbook
  liegen, wird aber erst wieder aufgegriffen, wenn die Ausbau-Entscheidung
  gefallen ist. Blocker bei einem Anlauf am 2026-08-27: der Live-Account
  `SecretLeaf` (`acct_1U6Hp8HmbWy555oe`) ist **nicht aktiviert** (KYC:
  Unternehmensdaten, Ausweis, IBAN, Einreichung zur Prüfung) — Stripe sperrt
  den Live-Modus komplett bis dahin, das muss Benny selbst machen.
- ✅ **Trial + Codes live seit 2026-09-03** (PR #27 gemerged). `/pricing`
  läuft als Trial-/Code-State-Machine hinter `PAID_LAUNCH_ENABLED = false`
  (bezahlter Pfad geparkt, 1 Flag zum Reaktivieren). Self-serve 30-Tage-Trial
  (`/api/billing/trial`, einmalig via `trial_redeemed_at`), einlösbare Codes
  (`/api/billing/redeem`, Admin-Panel `/dashboard/admin/pro-codes` auf der
  neuen Primitives-Architektur neu gebaut), Ablauf per Read-Time-Check in
  `getUserSubscription()` ohne Cron. Migration
  `202608270000_pro_trial_and_codes.sql` lokal + Prod angewendet.

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
  gefixt: die `subscriptions`-Migration war nie gegen lokale DB *oder* Prod
  gefahren worden (nur als Datei vorhanden) — beides am 2026-08-21
  nachgeholt (`supabase db push --linked`).
- ✅ **Code-Audit auf Live-Tauglichkeit (2026-08-27): nichts zu ändern.**
  `lib/stripe.ts`, `lib/env.ts`, `api/billing/{checkout,portal,webhook}` lesen
  alles aus Env-Vars, keine test-mode-Annahmen, kein hartcodierter Key/
  Price. Entitlement ausschließlich über den Webhook
  (`checkout.session.completed`). `PRICE_*_DISPLAY` in `pricing/page.tsx`
  steht schon auf `4,99 €` / `59 €` / `4,92 €`-pro-Monat — deckt sich mit den
  geplanten Live-Preisen, d. h. Schritt 3 ist nur „Live-Prices mit exakt
  diesen Beträgen anlegen", kein Code-Change. `.env.example` ist vollständig
  und korrekt.
- ⏸️ **Für echten Go-Live fehlt nur noch, was ausschließlich manuell geht:**
  1. Im Stripe **Live-Modus** neu anlegen (Sandbox-Objekte gelten nicht):
     Produkt „SecretLeaf Pro" + zwei Preise (4,99 €/Monat, 59 €/Jahr,
     beide EUR, recurring) · Webhook-Endpoint auf
     `https://secretleaf.vercel.app/api/billing/webhook` mit den Events
     `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted` · Customer Portal aktivieren
     (Kündigen + Zahlungsmethode ändern, Business-Infos/Rechtstexte setzen)
  2. In **Vercel → Settings → Environment Variables** (Scope: Production)
     die vier Werte setzen — aktuell hat Prod **keine** `STRIPE_*`-Vars,
     d. h. `/api/billing/*` läuft dort bis dahin in 500:
     `STRIPE_SECRET_KEY` (`sk_live_…`), `STRIPE_WEBHOOK_SECRET`
     (`whsec_…` vom Live-Endpoint), `STRIPE_PRICE_ID_PRO_MONTHLY`,
     `STRIPE_PRICE_ID_PRO_YEARLY` (beide Live-`price_…`) → danach
     Production neu deployen. `NEXT_PUBLIC_SITE_URL` steht auf Prod schon
     korrekt (wird anderswo genutzt).
  3. Smoke-Test auf Prod mit echter Karte: Login → `/pricing` → Checkout →
     Zahlung → `subscriptions`-Zeile `plan=pro` → `/pricing`+`/profile`
     zeigen Pro → Customer Portal öffnet. Danach ggf. Test-Abo in Stripe
     stornieren/refunden.

---

## 📐 Grow-Rechner — Kalibrierungsaudit (2026-08-21)

Vollständige Faktenprüfung aller Rechen-Konstanten in `lib/tools/*` und
`lib/grow/phases.ts` gegen Herstellerangaben/HVAC-Normen/aktuelle
Kultivierungsliteratur. Ergebnis-Artifact (Tabellen + Quellen pro Wert) unter
`kalibrierungsaudit.html` im Scratchpad der Session. Direkt umgesetzt: Licht-
Höhenkorrektur (Formel/Kommentar-Widerspruch behoben, neu kalibriert),
Belüftungs-Rohrdurchmesser-Tabelle (war bis zu 59% über realen
Lüfter-Datenblättern), Ertrags-Ampelschwellen Indoor (400/200 → 500/300
g/m²), Sämling-PPFD (200–400 → 100–300 µmol/m²/s), Einweichwasser-Temperatur
(30°C → 20–25°C), Outdoor-Ertrag (Topfgrößen-/Vegdauer-Input statt
Erfahrungslevel) und Blütedauer (an Genetik statt Erfahrung gekoppelt,
Migration `202608210000_grow_genetik_typ.sql` lokal + Prod angewendet).
Offen:

- 💤 **`intelligence.ts` Ertragsverlust-/-gewinn-Gramm-Heuristiken** (z. B.
  "−35g bei fehlendem Log") sind produktinterne Heuristiken ohne externe
  Quelle — nicht gegen Literatur prüfbar, absichtlich nicht angefasst.

## 🌐 Übersetzung / i18n — live seit 2026-09-03 (PR #29 gemerged)

- ✅ **Fertig.** Commit-Zeit-Pipeline (`scripts/translate-content.mjs`) +
  Translation Memory + Glossar + CI-Check (`i18n:check`, blockierend) +
  Rendering-Overlay stehen; MyMemory-Runtime-Translator gelöscht. Auf `/en`
  ist alles Nutzer-sichtbare übersetzt (Studies inkl. AskBot, Diagnose, alle
  Tools + Hub, Chrome, per-Page Canonical). Der ausstehende Übersetzungslauf
  (462 fehlende Strings, durch main-Drift seit dem Branch-Cut) lief am
  2026-09-03 real gegen die Anthropic-API (24 Batches) — `i18n:check` +
  `i18n:glossary-lint` grün, `en.wiki.json`/`en.diagnostics.json`
  aktualisiert. Plan + Detailstand: `docs/I18N_TRANSLATION_PLAN.md`. Nach
  neuen DE-Artikeln: `npm run i18n:translate`.

## 🧪 Dünger-Katalog (`/database`, `/database/fertilizers`) — Restructure Phase 2/3

Phase 1 (Preis-/Shop-Schicht mit fabrizierten Daten entfernen) ist erledigt
(2026-08-19). **Aber:** die Annahme aus Phase 1, die verbleibenden 242
Produktprofile seien "real NPK/EC/pH specs, curated data", war falsch und
wurde nie geprüft — Stichproben-Verifikation (2026-08-21, siehe
`kalibrierungsaudit.html` im Scratchpad) gegen echte Herstellerdatenblätter
ergab:

- ⚠️ **Von den 1.210 tatsächlich ausgespielten Profilen sind nur 50 (4%)
  überhaupt handkuratiert** — die übrigen 1.160 werden aus 16 Marken × 12
  generischen Linien-Namen per Zeichen-Hash (`createSyntheticNpk()` in
  `buildMarketExpansionCatalog()`) erfunden, plus eine Ver­vier­fachung des
  gesamten Bestands (`buildExtendedCatalog()`) mit "Lite/Pro/Max/Elite"-
  Varianten, die vermutlich nicht existieren.
- ⚠️ **Selbst die 50 "echten" Kern-Einträge stimmten in der Stichprobe (14
  geprüft) nur zu 21% mit echten Herstellerangaben überein.** Drei Fälle
  (AN Sensi Grow/Bloom, Atami Bloombastic) empfahlen eine Dosierung 2–4×
  über der realen Herstellerangabe — bei echter Anwendung ein
  Nährstoffverbrennungs-Risiko, nicht nur ein Trivia-Fehler. Zwei Einträge
  trugen erfundene Produktnamen unter echten Marken (Fox Farm "Flower
  Kiss", BioBizz "Growth-C" statt "Bio-Grow").
- ✅ **Vom Netz genommen (2026-08-21).** `/database/fertilizers` zeigt jetzt
  einen "vorübergehend nicht verfügbar"-Hinweis, `/api/fertilizers`
  antwortet mit 503, die personalisierte Produktempfehlung mit Dosierung in
  `tools/plans` ist deaktiviert, der Katalog ist aus dem Suchindex entfernt,
  Hub- und Status-Seite verlinken nicht mehr dorthin. Dabei zusätzlich
  gefunden und mitentfernt: die "Dünger-Marktabdeckung im Zeitverlauf"-Sektion
  auf `/status` zeigte ebenfalls fiktive Coverage-Snapshots
  (`data/fertilizerCoverageHistory.json`) als wachsenden Prozentwert.
  `data/terpira/fertilizers.ts` selbst bleibt unverändert als Ausgangsbasis
  für eine spätere Neuquellung liegen. Offen bleibt nur noch die
  Grundsatzfrage, **ob/wie neu gequellt wird** (klein & handverlesen aus
  echten Herstellerdatenblättern statt 1.210 algorithmisch erzeugten
  Einträgen) — reine Entscheidung, kein Code-Fix.

Ursprüngliche Phase-2/3-Planung (jetzt abhängig von der Neuquellungs-Entscheidung):

- ⏸️ **Phase 2 — Fachdaten andocken** (nur mit verifizierten Daten sinnvoll).
  Produktprofile (NPK/EC/pH/Verdünnung) als auswählbare Presets in
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

## 🔎 SEO — per-Page Canonical (2026-08-30, PR #29 gemerged 2026-09-03)

- ✅ **Gelöst für alle relevanten Routes, live.**
  `lib/i18n/metadata.ts` `pageAlternates(path, locale)` → `{ canonical,
  languages: { de, en, "x-default" } }`. Verdrahtet in: `studies`,
  `studies/[slug]`, `category/[slug]`, `tools` + alle 6 Rechner (in
  Server-`page.tsx` + `Client.tsx` gesplittet), `diagnose`, `updates`,
  `updates/[slug]`. Vorher erbten die `'use client'`-Seiten den
  Layout-Canonical (= Startseite).
- 💤 **`studies/sources/page.tsx`** ist noch `'use client'` ohne eigene
  Metadata — niedrige Priorität (Quellenregister, kaum SEO-relevant),
  ggf. später ebenfalls in Server-Wrapper splitten.

## ✉️ Professionelle E-Mail-Templates — LIVE seit 2026-09-03

- ✅ **Erledigt.** Supabase **Send Email Hook** →
  `apps/web/src/app/api/auth/send-email/route.ts` → React-Email-Templates
  (`apps/web/src/emails/`) → Brevo Transactional API. Confirm-Signup +
  Reset-Password aktiv (DE/EN, helles Marken-Layout mit Anschrift-Footer).
  Code über PR #30 gemerged; Konto-Config (Brevo-Keys, Supabase
  Hook/Custom-SMTP/Site-URL, Vercel-Env) am 2026-09-03 eingerichtet und
  per echtem Signup gegen Prod verifiziert (Bestätigungsmail kam an).
  Vollständiger Runbook + gesetzte Werte:
  Memory `secretleaf_mail_verification_priority_2026_09_03`.
- Offene Kleinigkeiten:
  - `standardwebhooks` als direkte `apps/web`-Dep (Branch
    `benny/email-hook-dep-fix`, Commit `f344539`) noch pushen/mergen.
  - Multi-Client-Render-QA (Gmail/Apple Mail/Outlook, Dark-Mode,
    mail-tester ≥ 9) — beim ersten echten Test sah das Layout gut aus,
    aber kein systematischer Durchlauf.
  - Dashboard-Fallback-Templates (Confirm/Reset) noch auf
    Supabase-Default — greifen nur, wenn der Hook mal deaktiviert wird.
  - Security-Notification-Mails (Password changed etc.) = eigener,
    späterer TODO. Newsletter/Marketing weiter explizit out of scope.
