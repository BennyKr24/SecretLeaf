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
  gefixt: die `subscriptions`-Migration war nie gegen lokale DB *oder* Prod
  gefahren worden (nur als Datei vorhanden) — beides am 2026-08-21
  nachgeholt (`supabase db push --linked`).
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

- 💤 **PPFD-Untergrenze Blüte in `lighting.ts`** (aktuell 600) liegt am
  unteren Rand des 2026er-Konsens (mehrere Quellen nennen eher 700–900 ohne
  CO2-Anreicherung) — optionale Anhebung auf 700, kein Fehler.
- 💤 **Trocknung/Curing-Parameter in `phases.ts`** (18–21°C/50–60% RH, festes
  10–15-Min.-Burping über 2–4 Wochen) sind nicht falsch, aber aktuelle Praxis
  tendiert zu 55–65% RH und gestaffeltem Burping (täglich → alle 2–3 Tage)
  für bessere Terpenerhaltung — optionales Update, kein Bug.
- 💤 **Genetik-Faktor `regular: 0.85` in `yield.ts`** ist irreführend
  benannt — bildet vermutlich implizit Männchen-Ausfall im Bestand ab, ohne
  das im Code zu benennen. Kein Zahlenfehler, Kommentar würde helfen.
- 💤 **`intelligence.ts` Ertragsverlust-/-gewinn-Gramm-Heuristiken** (z. B.
  "−35g bei fehlendem Log") sind produktinterne Heuristiken ohne externe
  Quelle — nicht gegen Literatur prüfbar, absichtlich nicht angefasst.

## 🌐 Übersetzung / i18n

- 🔧 **Englisch-Übersetzer wird dauerhaft neu gebaut — Plan + Fortschritt in
  `docs/I18N_TRANSLATION_PLAN.md`.** Kurz: MyMemory (`api/translate` →
  500 Zeichen/Request, ~5.000/Tag/IP geteilt) raus; statt Live-Übersetzung
  eine Commit-Zeit-Pipeline (`scripts/translate-content.mjs`) über den
  vorhandenen Anthropic-Client, mit Translation Memory + Glossar
  (`docs/i18n/`) + CI-Check. Deckt Wiki (75), Diagnostics (20),
  Diagnose-Baum und — separat als ICU-Templates — die Tool-Erklärungen ab.
  Nächster Schritt: Pilot-Lauf `npm run i18n:translate:pilot` (braucht
  `ANTHROPIC_API_KEY`, kostet Credits), dann Review. Details/Subtasks im
  Plan-Doc.

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

## 📚 Quellenregister (`/studies/sources`)

- 🔍 **Inhalt: "Neuer Bereich"-Banner zum Schädlings-Lexikon wirkt stale.**
  Der rosa Hinweis-Kasten oben auf der Seite bewirbt das Schädlings-Lexikon
  noch als brandneu ("Jetzt verfügbar") — dürfte inzwischen etabliert sein
  und nicht mehr als Ankündigung geführt werden. Prüfen, ob der Banner weg
  kann oder durch aktuellere Inhalte ersetzt werden sollte.

## 🗂️ Studies-Kategorisierung — `anbau` überladen, Plan steht (2026-08-22)

- ⏸️ **Plan fertig, noch nicht umgesetzt — Entscheidung steht aus.** Voller
  Plan mit Datenbasis, Cluster-Aufschlüsselung, Optionsvergleich und
  Migrationsaufwand: `docs/CONTENT_CATEGORY_RESTRUCTURE_PLAN.md`.
  Kurzfassung: **54 von 97 live sichtbaren Artikeln (56 %) liegen in
  `anbau`**, davon 33 (61 % von `anbau`) inhaltlich reine Diagnose-Artikel
  (Mangel/Überschuss/Krankheit/Schädling/Umweltstress) statt Technik/
  Tutorial — zwei komplett unterschiedliche Nutzerintentionen in einer
  Kategorie. Das bestehende `/diagnose`-Tool (`lib/diagnose/tree.ts`)
  gruppiert genau diesen Themenbereich schon symptomgetrieben (Blätter ·
  Wachstum & Wurzeln · Klima & Umgebung · Schädlinge) — Empfehlung im Plan
  ist, dieses bereits bewährte Muster für eine neue `diagnose`-Kategorie
  wiederzuverwenden statt eine zweite, konkurrierende Taxonomie zu
  erfinden. Dringlich vor der nächsten Content-Factory-Welle (12 weitere
  Mängel + 12 Krankheiten + 12 Schädlinge laut Backlog), sonst wächst die
  Schieflage weiter, bevor migriert wird.

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
