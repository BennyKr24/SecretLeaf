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
- [ ] **Migrations-Fehler live beobachtet:** `[migration] log_entries upsert
      failed (chunk): insert or update on table "log_entries" violates
      foreign key constraint "log_entries_grow_id_fkey"` in
      `lib/grow/migration.ts:185`, aufgetreten beim erneuten Laden eines
      Test-Accounts (2026-08-04). Vermutlich versucht der lokal→Supabase-
      Upload-Pfad, Log-Einträge für einen `grow_id` hochzuladen, dessen
      Grow-Zeile serverseitig (noch) nicht existiert — möglicherweise
      derselbe Symptombereich wie der Punkt oben. Nicht tief untersucht, da
      außerhalb des Scopes der Grow-Seiten-Neugestaltung; noch nicht
      reproduziert mit einem sauberen Test-Account.
- [ ] **React-Warnung beim Grow-Erstellen:** "Cannot update a component
      (`NavigationBar`) while rendering a different component
      (`GrowSetupWizard`)" — `hooks/useActiveGrow.ts:21`s `refresh()` ruft
      `setActiveGrowState` synchron aus `notifyActiveGrowChanged` /
      `lib/grow/store.ts`s `setActiveGrow()` auf, ausgelöst während
      `GrowSetupWizard`s `handleSubmit` rendert. Live beobachtet
      (2026-08-04) beim Erstellen eines frischen Test-Grows, funktional
      unauffällig (Grow wurde trotzdem korrekt erstellt), aber ein
      echtes `setState-in-render`-Muster, das früher oder später
      Render-Reihenfolge-Bugs verursachen kann. Nicht behoben, da
      außerhalb des Scopes der Grow-Seiten-Neugestaltung.

## Design/Motion-System Rollout

- [ ] **Emoji-als-Icon-Sweep — Rest-27-Dateien nicht einzeln nachverifiziert.**
      Root-Cause-Fix für "sieht immer noch billig/KI-generiert aus"
      (2026-08-06/07): Emoji als funktionale UI-Icons + unveränderte
      Tailwind-Stock-Farbpalette (`green-500`/`slate-400`) identifiziert und
      projektweit auf Lucide-Icons + neue Jade/Gold-Palette umgestellt
      (`globals.css`, `tailwind.config.ts`, `DESIGN_SYSTEM.md` §5). Nach dem
      Sweep (eigene Fixes + mehrere Background-Agent-Durchläufe) fand ein
      abschließendes `grep` nach Emoji projektweit noch **27 Dateien** mit
      Treffern. Die meisten davon wurden als legitim triagiert (Prosa in
      JSON-Changelogs, Code-Kommentare, bewusst beibehaltene
      Sprachflaggen-/Farb-Punkt-Fälle) oder direkt gefixt
      (`layout.tsx`-Footer, `onboarding/page.tsx`, `intelligence.ts`,
      `LocaleBanner.tsx`), aber die volle 27-Datei-Liste wurde nicht
      einzeln nachgeprüft — es können noch einzelne echte
      Emoji-als-Icon-Stellen übrig sein. Erneut grep'en (ripgrep mit
      `-P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2190}-\x{21FF}]'` über
      `apps/web/src`) und Rest triagieren — Prosa/Kommentare/bewusste
      Sprachflaggen ignorieren, nur echte Icon-Ersatz-Stellen fixen.
- [ ] **`Dropdown.tsx` → `base-ui` Swap, zurückgestellt.** Der Kowalski-Skill
      `pick-ui-library` empfiehlt base-ui für Dropdowns statt Marke-Eigenbau.
      Beim Motion-Rollout (2026-08-07) bewusst nicht gemacht — 42 Call-Sites
      über 14 Dateien, echter Architektur-Eingriff statt CSS-Fix. Der
      Hand-Bau ist inzwischen voll regelkonform (Glass-Material,
      Materialize-Animation, Origin-aware), also kein Bug, nur ein
      "könnte man" für mehr eingebaute A11y/Focus-Management.

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

- [ ] **KI-Bild-Diagnose-Route ist ein 501-Stub.**
      `apps/web/src/app/api/diagnose/route.ts` — blockiert auf einen
      OpenAI-Key + Billing-Entscheidung. Unabhängig vom Regelbaum-Diagnosepfad,
      dessen komplette Diagnosis→Recommendation→Outcome-Kette (inkl.
      Health-Snapshot-Cronjob) seit 2026-08-04 fertig und live ist.
- [ ] **`ANTHROPIC_API_KEY` — lokal gesetzt (`.env.local`), Vercel unbestätigt.**
      Admin-KI-Assistent (`dashboard/admin/assistant`) ist live getestet und
      funktioniert lokal (echter API-Call bestätigt, 2026-08-04). Fehlender
      Sidebar-Link dabei gefunden und gefixt (`540586c`). Noch zu prüfen: ob
      der Key auch in den Vercel-Projekteinstellungen gesetzt ist, sonst
      bleibt die Produktions-Version inert.
- [ ] **Vercel-Deploy-Status unbestätigt.** Nutzer meldete, ein Deploy wirkte
      hängengeblieben im "Production"-Status (2026-08-03), obwohl im
      Vercel-Dashboard ein aktueller Build zu sehen war; wurde nicht bis zum
      Ende geklärt, ob er bei Building/Queued/gebaut-aber-nicht-promoted
      hing, bevor wir weitergemacht haben. Lohnt sich zu prüfen, ob die
      letzten Pushes auf `main` wirklich live sind.
