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

## 📐 Grow-Rechner — offene Werte ohne belastbare Quelle

- 🔍 **Hydro-EC-Zielwerte in `nutrients.ts`** (`EC_THRESHOLDS.*.hydro`) sind
  1:1 von den alten Einheitswerten übernommen, nicht gegen eine eigene
  Hydro/DWC-Quelle geprüft. Gezielte Recherche zu Hydro-EC-Zielbereichen pro
  Phase nachholen, dann Tabelle ggf. anpassen.
- 🔍 **Outdoor-Ertrag `GPP_OUTDOOR` in `yield.ts`** (200/400/600 g/Pflanze) —
  Recherche zeigt extreme Bandbreite (56g bis 3600g/Pflanze je nach Quelle),
  kein Konsenswert. Sauberer Fix wäre ein zusätzlicher Topfgrößen-/
  Pflanzengrößen-Input statt eines flachen Erfahrungs-Faktors — echte
  Redesign-Frage, kein reiner Zahlendreher.
- 🔍 **VPD-Wert-Mismatch in `data/terpira/diagnostics.ts`** (268-KB-Wiki-
  Prosa) — enthält noch "veg ~0.8–1.1 kPa", während `vpd.ts` und
  `diagnose/tree.ts` jetzt korrigiert bei 0.8–1.2 kPa liegen. Textstelle in
  der großen Datei noch nicht lokalisiert/gefixt.
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

## 📚 Quellenregister (`/studies/sources`)

- 🔍 **Design nie durch die Dark-Token-Migration gelaufen.** `studies/sources/page.tsx`
  nutzt durchgehend hardcodierte helle Pastell-Hexwerte (`#fbfefc`, `#f7fbf8`,
  `#123024`, `#1f7a4f`, `#e2eee6`, `#d8e8dd` usw.) statt der Design-Tokens
  (`bg-card`, `text-foreground`, `border-border`) sowie rohe Tailwind-
  `-50`-Pastellfarben (`bg-blue-50`, `bg-emerald-50`, `bg-cyan-50`,
  `bg-rose-50`) für die Stat-Kacheln und Badges. Die App hat kein echtes
  Light-Theme (siehe [[secretleaf-ux-punchlist-2026-08-03]]) — diese Seite
  müsste als helle Karte inmitten des sonst durchgehend dunklen Designs
  auffallen. Gleiches Muster wie bei Dashboard/Tools/Grow-Seite vor deren
  Migration — selbe Fix-Richtung anwendbar.
- 🔍 **Inhalt: "Neuer Bereich"-Banner zum Schädlings-Lexikon wirkt stale.**
  Der rosa Hinweis-Kasten oben auf der Seite bewirbt das Schädlings-Lexikon
  noch als brandneu ("Jetzt verfügbar") — dürfte inzwischen etabliert sein
  und nicht mehr als Ankündigung geführt werden. Prüfen, ob der Banner weg
  kann oder durch aktuellere Inhalte ersetzt werden sollte.

## 📊 Studien-Engine (`lib/engine`)

- 🔍 **Regex-False-Positives in der Topic-Klassifizierung.**
  `TOPIC_CLUSTERS['anbau-postharvest'].include` in `lib/engine/config.ts`
  enthält bare-word-Patterns (`/thc/i`, `/cbd/i`, `/terpene/i`,
  `/terpenoid/i`) ohne Cannabis-Kontext-Anforderung — anders als die
  Anchor-Validierung in `classify.ts`, die ambige Kürzel erst akzeptiert,
  wenn zusätzlich ein eindeutiger Cannabis-Begriff im Corpus steht (siehe
  `CANNABIS_ANCHOR_AMBIGUOUS`-Kommentar). Bei der Backlog-Triage am
  2026-08-02 gegen echte Prod-Daten bestätigt: "Understanding tourists'
  travel health concern (**THC**)", "...thermo-hydro-chemical (**THC**)
  coupled reactions..." (Geologie), "...**CBD**-CdS thin films"
  (Materialwissenschaft, CBD = Chemical Bath Deposition), sowie mehrere
  Terpen-Synthase-Papers zu nicht-Cannabis-Pflanzen (Ginkgo biloba, Styrax
  officinalis u. a.). Diese Treffer fließen über `topicFit` (`+18 + hits*8`
  pro Cluster, `classify.ts` `matchTopics()`) in den Score ein, der über
  Aufnahme in den Studien-Bereich entscheidet — kein reines Tagging-Problem.
  Fix: Wortgrenzen + Nähe-Check zu einem eindeutigen Cannabis-Anker statt
  bare-word-Match. Noch nicht angegangen.

## 🔒 Security

- 💤 **`api/automation/engine-feedback/route.ts`** akzeptiert ein
  client-geliefertes `userId`-Feld im Event-Body, ohne es gegen die
  authentifizierte Session zu prüfen — ein eingeloggter Nutzer könnte
  Feedback-Events (`review_good`/`review_bad`/`click`) fälschlich einem
  anderen User zuordnen. Kein Datenzugriff, keine Account-Aktion betroffen —
  reines Analytics-Integritätsproblem, daher niedrige Priorität.
