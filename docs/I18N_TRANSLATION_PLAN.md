# I18N / Content-Übersetzung — Plan & Fortschritt

**Ziel:** `/en/*` liefert echten englischen Inhalt (nicht nur die UI-Hülle),
bleibt bei neuen deutschen Inhalten automatisch synchron, und hält
Fachterminologie konsistent. Kein Live-Übersetzen zur Laufzeit, keine
externen Vendor-Kosten im Betrieb.

Status-Legende: `[ ]` offen · `[~]` in Arbeit · `[x]` fertig & verifiziert

---

## Ausgangslage (Code-Check 2026-08-30)

- `api/translate/route.ts` nutzt die MyMemory-Gratis-API: `text.slice(0, 500)`
  + ~5.000 Zeichen/Tag geteilt über **alle** Nutzer derselben Vercel-IP →
  für Fließtext praktisch tot, fällt still auf Deutsch zurück.
- `TranslateButton` hängt nur an 2 Stellen: `DiagnoseResult.tsx`,
  `ToolResult.tsx`. **Nicht** in den Studien.
- `studies/[slug]/page.tsx` liest `locale` gar nicht → `/en/studies/xyz`
  zeigt wortwörtlich deutschen Artikeltext. Betroffen: 75 Wiki-Artikel
  (`data/terpira/wiki.ts`), 20 Diagnose-Artikel (`data/terpira/diagnostics.ts`),
  Diagnose-Baum (`lib/diagnose/tree.ts`), Tool-Erklärungen (`lib/tools/*.ts`).
- Anthropic-Client existiert schon: `lib/ai/anthropic.ts` (`askClaude`,
  `ANTHROPIC_API_KEY`), bisher admin-only. Kein neuer Vendor nötig.
- **Der übersetzbare Content ist endlich und zur Build-Zeit bekannt**
  (alles Datendateien, kein User-Content) → einmal übersetzen, cachen,
  mitcommitten.

## Architektur-Entscheidung

**Claude-basiert, zur Commit-Zeit, gecacht, mit Projekt-Glossar.**

- Provider: vorhandener Anthropic-Client. DeepL wäre für Term-Konsistenz
  minimal besser (eingebautes Glossar), aber Free/Pro-Tarif seit Juli 2026
  abgekündigt (Developer/Growth ~26 $/Mon) + neuer Vendor + Billing. Claude
  + gecachter Glossar-/Styleguide-System-Prompt + Lint-Check schließt die
  Konsistenzlücke, ohne neue Abhängigkeit.
- Translation Memory: pro Quelldatei ein JSON, Key = Hash des deutschen
  Quellstrings, Wert = `{ de, en }`. Unveränderte Strings werden nie neu
  übersetzt. Neue/geänderte Strings → ein Claude-Batch-Call.
- CI-Check erzwingt Vollständigkeit: PR mit unübersetzten deutschen Strings
  wird rot.

### Drei Tracks

| Track | Inhalt | Methode |
|---|---|---|
| **A — Bulk-Content** | `wiki.ts`, `diagnostics.ts`, `tree.ts` (statische Prosa) | Pipeline + Translation Memory, feldweises Overlay bei `locale === "en"` |
| **B — Tools** | ~25 Erklärungs-Strings in `lib/tools/*.ts` — **stark interpoliert** (`` `Bei ${x} cm …` ``) | In `messages/{de,en}.json` als ICU-Templates mit Platzhaltern verschieben, einmal übersetzen, zur Laufzeit interpolieren |
| **C — Rendering & Cleanup** | Render-Pfade auf `en` verdrahten, `TranslateButton` + `api/translate` zurückbauen | — |

---

## Track A — Bulk-Content-Pipeline

### A1 — Terminologie-Fundament
- [x] `docs/i18n/glossary.json` — kuratierte DE→EN-Fachbegriffe + „nicht
      übersetzen"-Liste
- [x] `docs/i18n/styleguide.md` — Register, Anrede, Einheiten, Rechtstext-Umgang

### A2 — Pipeline-Skript `scripts/translate-content.mjs`  ✅ fertig, verifiziert
- [x] esbuild-Transpile + dynamischer Import von `wiki.ts` / `diagnostics.ts` /
      `tree.ts` (löst `@/`-Alias auf, `lucide-react`/`react` extern, Import aus
      `node_modules/.cache/sl-i18n`)
- [x] String-Extraktion über feste Feldpfade auf `TerpiraArticle` /
      `DiagnoseResult` / `DiagnoseNode` / `DiagnoseCategory` (nur Prosa)
- [x] Translation-Memory `apps/web/src/data/i18n/en.{wiki,diagnostics,diagnose-tree}.json`
      — Key = 12-Hex-Hash von `de`, Wert `{ de, en, paths }`, nach `de` sortiert
- [x] `--check` (CI, read-only): exit 1 bei unübersetztem String
- [x] `--stats` (read-only): Strings / Zeichen / übersetzt / fehlend pro Quelle
- [x] `--sync` (write): de/paths-Stubs auffrischen, vorhandene `en` erhalten
- [x] `--prune` (write): TM-Einträge weg, deren `de` nicht mehr vorkommt
- [x] `--translate` [`--only=<quelle>`] [`--pilot=<n>`] [`--dry-run`]: fehlende
      Strings gebündelt (`--batch`, Default 20) an Anthropic, System-Prompt =
      Styleguide + `glossary.json` mit `cache_control`, JSON-Output → TM,
      schreibt nach jedem Batch; Modell via `I18N_MODEL` (Default
      `claude-sonnet-5`)
- [x] npm-Scripts: `i18n:stats` `i18n:check` `i18n:sync` `i18n:prune`
      `i18n:translate` `i18n:translate:pilot`
- [x] TM-Dateien via `--sync` materialisiert + committet:
      **7.511 Strings / ~774.000 Zeichen**, alle `en: null`

### A3 — Pilot & Qualitätsprüfung
- [ ] `npm run i18n:translate:pilot` (nur `diagnostics`, 15 Strings)
      — **braucht `ANTHROPIC_API_KEY`, kostet API-Credits → Benny startet das**
- [ ] Pilot-Output in `en.diagnostics.json` gegen Glossar/Styleguide reviewen;
      Prompt/Glossar nachziehen
- [ ] Entscheidung: so weiterfahren / Prompt anpassen / doch DeepL
- [ ] Grobkostenrahmen Vollpass abschätzen (~774k Zeichen Quelle, Sonnet)

### A4 — Vollübersetzung
- [x] `npm run i18n:translate --only=tree` — 223/223
- [x] `npm run i18n:translate --only=diagnostics` — 1844/1844
- [~] `npm run i18n:translate --only=wiki` (größter Batch, in Tranchen) —
      **5180/5404**, 224 offen. Run vom 2026-08-30 lief in das Anthropic-
      Ausgabelimit (Zugang zurück ab 2026-09-01 00:00 UTC). Danach
      `npm run i18n:translate -- --only=wiki` erneut → nimmt nur die Rest-224.
      Split-Retry hat die abgelehnten Batches sauber geloggt+übersprungen,
      kein Teil-/Müll-Output in der TM.
- [ ] TM-Dateien reviewen (Stichprobe je Kategorie) + committen

### A5a — Rendering-Overlay: Artikel-Detailseite  ✅
- [x] `lib/i18n/localizeContent.ts` — `localizeArticle` / `localizeDiagnoseResult`
      (deep string-swap aus dem TM, DE-Fallback), `isArticleTranslated`,
      `localizeCategoryLabel`
- [x] `studies/[slug]/page.tsx`: `locale` aus params, Artikel + verwandte
      Artikel + `generateMetadata` lokalisiert, Kategorie-Labels lokalisiert,
      Hinweis-Banner wenn Artikel (Titel) noch nicht übersetzt
- [x] `/de` unberührt — alle Pfade guarden auf `locale === "en"`;
      typecheck / lint / build grün

### A5b — Rendering-Overlay: Listen & Chrome
- [x] `category/[slug]/page.tsx` + `StudiesListView` + `StudyListItem`:
      `locale` aus params, Artikel serverseitig via `localizeArticle`,
      Kategorie-Label + -Beschreibung lokalisiert, `generateMetadata`,
      Breadcrumb/Hero-Chrome. Client-Chrome (Suchfeld, Sort, Reset,
      Trefferzahl, Empty-State, Show-more, Schwierigkeits- + Symptomarea-
      Labels, „Min") → neuer `studiesList`-Namespace (de+en).
- [x] `studies/page.tsx` (jetzt async) + `CategoryHubGrid`: lokalisierte
      Label-/Beschreibungs-Maps, `generateMetadata`, Hero + Sub-Links.
- [x] `studies/sources/page.tsx` → neuer `sourcesPage`-Namespace (de+en);
      stale „Neuer Bereich"-Banner entfernt.
- [x] Diagnose-Flow (`DiagnoseFlow.tsx` + `DiagnoseResult.tsx`): neuer
      lean `lib/i18n/localizeDiagnoseTree.ts` (nur `en.diagnose-tree.json`,
      client-safe), Frage/Optionen/Kategorie-Label/Result overlaid,
      `TranslateButton` auf Titel/Erklärung/Begründung raus, Chrome →
      `diagnoseResult`-Namespace. `deepLocalizeStrings` gehärtet (lässt
      React-Elemente/forwardRef wie Lucide-`icon` in Ruhe).
- [x] Artikel-Detailseite (`studies/[slug]/page.tsx`): restliche Chrome →
      `article`-Namespace (via `getTranslations`).
- [x] `hreflang`/Canonical geprüft: Site-Level `alternates.languages`
      (de/en/x-default) in `app/[locale]/layout.tsx` **korrekt** und jetzt
      auch inhaltlich ehrlich. **Aber**: Unterseiten setzen kein eigenes
      `alternates` → erben `canonical` vom Layout (= Startseite). Das ist
      ein bestehender SEO-Bug über alle dynamischen Routes, nicht i18n-
      spezifisch → eigener TODO-Punkt, nicht in diesem Pass.
- [x] `WikiArticleToc` + `CommunitySignals` → `article`-Namespace (`d4d58b4`).
- [x] `WikiAskBot` (`858e17b`): Chrome → `askBot`-Namespace; auf `/en`
      wird die EN-TM per **dynamischem Import** in `ask()` über die
      Artikel-Daten gelegt (nur wenn ein EN-Nutzer fragt → nicht im
      Initial-Bundle).
- [ ] `StudyListItem`-Tags (nicht im TM) — noch DE (kurze Keywords).
- [ ] `categoryLabels` / `difficultyLabels` sauber über `messages` statt der
      kleinen Map in `localizeContent.ts` (optional; funktioniert aktuell)
- Hinweis: EN-Maps (Kategorie-Label/-Beschreibung, Symptomarea) leben in
  `localizeContent.ts`; `studiesList`/`sourcesPage`/`diagnoseResult`/
  `article` in `messages`. Bewusst gemischt — die großen TM-JSONs dürfen
  nicht in den Client-Bundle.

---

## Track B — Tools (ICU-Templates)  ✅ (Result-Card-Umfang)

Ansatz **A** gewählt: `t`-Injektion, Contract `explanation: string` bleibt.
- [x] Neuer Typ `ToolT` in `lib/tools/types.ts`; alle 5 `calculate*(inputs, t)`.
- [x] Alle `explanation`-/Ampel-/Zone-/Phase-Strings + Helfer
      (`ppfdExplanation`, `vpdExplanation`, `vpdZone`, `substratTipp`) →
      `toolResult`-Namespace (de+en) mit benannten ICU-Platzhaltern.
- [x] Die 5 Tool-Pages reichen `useTranslations('toolResult')` in `calculate*`.
- [x] `ToolResult.tsx`: `explanation` direkt gerendert, Ampel-Pills
      (Optimal/Grenzwertig/Kritisch) lokalisiert.
- [x] **Tool-Page-Chrome** (Folge-Pass, gepusht `3e81d40` `22a55e9`
      `0c7a2f2`): neuer `tool`-Namespace (de+en, 219 Keys, volle Parität) —
      `ToolLayout`/`ToolResultCard`/`SaveToGrowButton`/`ToolInput` + alle 5
      Pages (Tips, Überschriften, Input-Labels/Hints, Select-/Slider-Marks,
      Card-Titel, Interpretation/Empfehlung, Result-Labels,
      `ToolRangeBar`-Zonen). Registry-Titel/-Beschreibungen + Kategorie-
      Labels via `tool.registry.<slug>` bzw. `tool.category*`.
- [ ] Rest: ein paar kompakte DE-Einheiten (`g/Pflanze`, inline `Liter`),
      der `produktName`-Default-Seed, die `formatted`-Aufschlüsselungs-
      zeilen in `yield.ts`/`nutrients.ts` (`Phase: ×0.85 · …`).
- Snapshot-Persistenz: `ToolSnapshot.results` speichert den String in der
  beim Rechnen aktiven Sprache (wie bei der Diagnose-Persistenz) — kein
  Shape-Change, alte Snapshots bleiben lesbar.

---

## Track C — Cleanup  ✅

- [x] `TranslateButton` aus `DiagnoseResult.tsx` (A5b) + `ToolResult.tsx` (B) raus.
- [x] `components/TranslateButton.tsx`, `lib/translate.ts`,
      `app/api/translate/route.ts` gelöscht (0 Caller).
- [x] `messages/{de,en}.json` `translate.*`-Keys entfernt.
- [x] CSP / `connect-src`: mymemory war nie eingetragen (Server-Fetch),
      nichts zu tun; keine anderen Referenzen auf den alten Endpoint.

---

## Track D — Mitpflegen automatisieren  ✅ (bis auf die optionale Action)

- [x] `npm run i18n:check` als eigener CI-Step in `.github/workflows/ci.yml`
      (vor typecheck/build). Rot bei unübersetztem Content-String.
- [x] Glossar-Lint: `node scripts/translate-content.mjs --glossary-lint`
      (npm `i18n:glossary-lint`) — flaggt EN-Strings, die einen
      `doNotTranslate`-Begriff (THC, VPD, Genus-Namen …) verlieren;
      `--terms` zusätzlich die fuzzy `terms`-Map, `--strict` = exit 1.
      Als **advisory** CI-Step drin (failt nie). Erstlauf fand 31 EN-Strings
      mit klein geschriebenen Genus-Namen (pythium/fusarium/botrytis) →
      im `en.wiki.json` korrigiert.
- [x] Content-Factory-Doku (`content-factory/ARTICLE_WORKFLOW.md`): Publish-
      Stage + Definition-of-Done um „`npm run i18n:translate` + `en.*.json`
      committen, `i18n:check` grün" ergänzt.
- [ ] optional GitHub Action: bei Diff an den Content-Dateien Pipeline laufen
      lassen, Übersetzungen als Commit an den PR hängen (nicht gebaut —
      braucht `ANTHROPIC_API_KEY` als Repo-Secret + Bot-Push-Rechte; der
      manuelle Schritt in der DoD reicht vorerst).

---

## Reihenfolge

A1 ✅ → A2 ✅ → A3 ✅ → A4 (wiki 5180/5404, Rest ab 2026-09-01) →
A5a ✅ → A5b ✅ (Kern) → B ✅ (Result-Cards) → C ✅ → D ✅ (bis auf opt. Action)

**Offen (2026-08-30):**
- **224 Wiki-Strings** — API-Cap, ab 2026-09-01 00:00 UTC
  `npm run i18n:translate -- --only=wiki`, dann `i18n:check` grün.
- Per-Page-Canonical: studies-Routes, `/tools`-Hub, `/updates/[slug]`
  verdrahtet. `/diagnose`-Landing + Tool-Rechner sind `'use client'` →
  Canonical erbt vom Layout (bräuchte Server-Wrapper).
- Winzige DE-Reste: `StudyListItem`-Tags (nicht im TM, kurze Keywords),
  `produktName`-Default-Seed („Allgemein"), die `formatted`-
  Aufschlüsselungszeilen in `yield.ts`/`nutrients.ts` (`×0.85 · …`).
- Branch `benny/i18n-content-translation` (~30 Commits vor `main`) noch
  nicht als PR offen.

Sonst ist auf `/en` alles Nutzer-sichtbare übersetzt: Studies (Hub,
Kategorien, Listen, Artikel-Detail, Quellen, TOC, Signals, AskBot),
Diagnose (Landing + Flow + Result), alle 5 Tools + Hub, Chrome/Nav.

## Nicht in Scope

- Weitere Sprachen als EN (Struktur ist aber sprachneutral).
- Übersetzung des Impressums / der Datenschutzerklärung (bewusst DE-only mit
  EN-Kontakt-Hinweis, siehe `datenschutz/page.tsx`).
- TMS-Anbindung (Crowdin/Locize) — Overkill für Solo-Projekt.
