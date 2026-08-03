# Engineering TODO

Konkrete, code-nahe Folgeaufgaben, die über mehrere Sessions hinweg entdeckt
wurden — gefundene Bugs, halb verdrahtete Features, verschobene
Entscheidungen. Das ist **nicht** die Produkt-Roadmap (siehe `ROADMAP.md`) und
**nicht** der Content-Backlog (siehe `docs/CONTENT_BACKLOG.md`), sondern die
"geht nicht mehr verloren"-Liste für Engineering-Arbeit.

Wenn du etwas aufgreifst: Punkt erledigen, dann aus dieser Datei löschen —
Git-Historie und Commit-Message sind der Nachweis, was gemacht wurde. Diese
Datei soll immer nur den aktuellen Stand zeigen, kein Changelog werden.

---

## Diagnosis → Recommendation → Outcome Chain

Das Schema (`diagnoses`, `recommendations`, `recommendation_events`,
`plant_health_snapshots`, `diagnosis_outcomes`) ist live und für den
Regelbaum-Diagnosepfad verdrahtet. Zwei Teile der Kette fehlen noch:

- [ ] **`lib/grow/insights.ts`-Phasen-Empfehlungen werden nicht persistiert.**
      Nur clientseitig/im Speicher aus `wikiArticles` berechnet.
      `source='phase_insight'` existiert im Check-Constraint des Schemas,
      aber nichts schreibt diese Zeile jemals.
- [ ] **`plant_health_snapshots` / `diagnosis_outcomes`-Cronjob existiert noch
      nicht.** In Migrations-Kommentaren als zukünftiger Job referenziert
      (`trigger_source in ('daily_cron','on_log_entry')`), nach demselben
      Muster wie das bestehende `automation_job_runs`/Engine-Health-Telemetry.
      Nötig, bevor "hat diese Empfehlung wirklich geholfen" überhaupt
      beantwortbar wird.
- [ ] **KI-Bild-Diagnose-Route ist ein 501-Stub.**
      `apps/web/src/app/api/diagnose/route.ts` — blockiert auf einen
      OpenAI-Key + Billing-Entscheidung, unabhängig vom Regelbaum-Pfad oben.

## Grow-Feature

- [ ] **Grows laden nach Login nicht von Supabase zurück.** Der aktive Grow
      wird ausschließlich aus `localStorage` bestimmt
      (`lib/grow/store.ts`s `getActiveGrow()`). Ein eingeloggter Nutzer auf
      einem neuen Browser/Gerät sieht "kein aktiver Grow", obwohl der Grow
      längst nach Supabase synchronisiert wurde — es gibt einen Upload-Pfad
      (lokal → Supabase, über `lib/grow/migration.ts`), aber keinen
      Download-Pfad (Supabase → lokal) für eine zurückkehrende Session.
      `lib/grow/db.ts` hat bereits `getGrows(supabase)`, aber nichts ruft das
      auf, um den lokalen State beim Login zu befüllen.

## Studien-/Content-Engine

- [ ] **Echter Regex-False-Positive-Bug im Produktiv-Klassifizierer.**
      `TOPIC_CLUSTERS['anbau-postharvest'].include` in `lib/engine/config.ts`
      hat Bare-Word-Patterns `/thc/i`, `/cbd/i`, `/terpene/i`, `/terpenoid/i`
      ohne jede Cannabis-Kontext-Anforderung. Bestätigte False Positives aus
      echten Produktivdaten: "tourists' travel health concern (**THC**)",
      "thermo-hydro-chemical (**THC**)" (Geologie), "**CBD**-CdS thin films"
      (Materialwissenschaft), Terpen-Synthase-Paper zu fachfremden Pflanzen
      (Ginkgo, Styrax, Aquilaria, Abrus). Braucht einen
      Wortgrenzen-+Cannabis-Kontext-Fix.
- [ ] **Tote Config im Admin-Algorithmus-UI** (`dashboard/admin/algorithm`) —
      wird als live-editierbar dargestellt, tut aber nichts:
  - `preferred_sources` / `blocked_sources` — von `configLoader.ts` geladen,
    aber nie in `score.ts` gelesen (Publisher-Qualität nutzt weiterhin die
    hardcodierten `HIGH_QUALITY_PUBLISHERS`/`MID_QUALITY_PUBLISHERS`-Listen)
  - `scoring_params.weights` — wird in `pipeline.ts` in `dynConfig` geladen,
    aber nie an `scoreStudy()` übergeben (nutzt immer die hardcodierte
    `SCORE_WEIGHTS`-Konstante)
  - `topic_clusters.overrides` — nur additive `customClusters` funktionieren
    tatsächlich; `classify.ts`s `matchTopics()` iteriert immer über die
    hardcodierten `TOPIC_CLUSTERS`, unabhängig von Overrides
  - `engine-adapt`-Cron (wöchentlich, montags) berechnet adaptive
    Scoring-Gewichte und schreibt sie in `scoring_weights_history`, aber
    `loadLatestWeights()` wird nirgends aufgerufen — ein kompletter
    Read-Write-Loop ohne Konsumenten, aktuell reine verschwendete
    Cron-Zyklen.

  Pro Punkt entscheiden: richtig verdrahten oder rausschmeißen — und dann
  darf das Admin-UI nicht mehr so tun, als würde es funktionieren.

## Content

- [ ] **~58 weitere B2B-lastige Stellen im Wiki** (`Charge`/`Chargen`/
      `Lieferkette`/`Sperrlogik`/`Audit`) beim Grep während des
      PGR-Artikel-Rewrites gefunden. Gleiche Größenordnung wie der
      Wave-1-4-Content-Qualitäts-Durchlauf — aktuelle Liste vor Start neu
      herleiten mit
      `grep 'Charge\b\|Chargen\b\|Lieferkette\|Sperrlogik\|operativen Ablauf\|Audit\b' apps/web/src/data/terpira/wiki.ts`
      (Inhalt kann sich seitdem verschoben haben).

## Kosmetisch / niedrige Priorität

- [ ] `apps/web/src/middleware.ts` → umbenennen zu `proxy.ts` gemäß Next 16s
      neuer Konvention (funktioniert heute noch, druckt nur bei jedem
      Dev-Server-Start eine Deprecation-Warnung).

## Blockiert auf eine Entscheidung, nicht auf Code

- [ ] **`ANTHROPIC_API_KEY` nicht gesetzt.** Das Admin-KI-Assistent-Feature
      (`dashboard/admin/assistant`, `/api/admin/dashboard`
      `ai-assist`-Action) ist fertig gebaut, schlägt aber mit einer klaren
      deutschen Fehlermeldung fehl, bis diese Env-Var in Vercel + `.env.local`
      gesetzt ist. Echte API-Kosten — Entscheidung liegt beim Nutzer, nicht
      eigenmächtig setzen.
- [ ] **Vercel-Deploy-Status unbestätigt.** Nutzer meldete, ein Deploy wirkte
      hängengeblieben im "Production"-Status (2026-08-03), obwohl im
      Vercel-Dashboard ein aktueller Build zu sehen war; wurde nicht bis zum
      Ende geklärt, ob er bei Building/Queued/gebaut-aber-nicht-promoted
      hing, bevor wir weitergemacht haben. Lohnt sich zu prüfen, ob die
      letzten Pushes auf `main` wirklich live sind.
