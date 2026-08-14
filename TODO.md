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

## 📐 Grow-Rechner — Folge-Recherchen (aus dem 2026-08-14-Konstanten-Abgleich)

Die fünf Rechner (`lib/tools/{vpd,nutrients,yield,ventilation,lighting}.ts`)
wurden gegen aktuelle Anbau-Literatur abgeglichen und korrigiert (VPD-Offset-
Vorzeichen-Bug, VPD-Zielbereiche, substrat-abhängige EC-Ampel, PPFD/DLI-
Schwellen). Dabei blieben einzelne Werte bewusst unverändert, weil die
Recherche dafür keine belastbare Quelle lieferte:

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

## 🔒 Security-Audit 2026-08-14 — ein Rest-Item

Vier parallele Security-Agents haben Auth/Autorisierung, Injection/Rendering,
Secrets/Datenexposure und IDOR auf Grow-Daten geprüft. Zwei konkrete Funde
(CRON_SECRET im URL-Query-String; PostgREST-Filter-Injection über den
`q`-Parameter in `/api/studies`) sind bereits gefixt. Ein Punkt blieb bewusst
unten der Aufgriffsschwelle:

- 💤 **`api/automation/engine-feedback/route.ts`** akzeptiert ein
  client-geliefertes `userId`-Feld im Event-Body, ohne es gegen die
  authentifizierte Session zu prüfen — ein eingeloggter Nutzer könnte
  Feedback-Events (`review_good`/`review_bad`/`click`) fälschlich einem
  anderen User zuordnen. Kein Datenzugriff, keine Account-Aktion betroffen —
  reines Analytics-Integritätsproblem, daher niedrige Priorität.
