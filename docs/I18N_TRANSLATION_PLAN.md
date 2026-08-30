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
- [ ] `category/[slug]/page.tsx` + `StudiesListView`: Titel/Summary in Listen
      lokalisieren, `locale` durchreichen, Kategorie-Label
- [ ] `studies/page.tsx` + `CategoryHubGrid`: dito
- [ ] `studies/sources/page.tsx`, Diagnose-Ergebnis-Komponente (`DiagnoseResult.tsx`)
- [ ] Hartkodierte Studien-Chrome-Strings („Kernpunkte", „Quellen",
      „Verwandte Artikel", „Min", „Häufige Fragen" …) nach `messages/{de,en}.json`
- [ ] `categoryLabels` / `difficultyLabels` sauber über `messages` statt der
      kleinen Map in `localizeContent.ts`
- [ ] `hreflang`/Canonical prüfen — jetzt ehrlich zweisprachig

---

## Track B — Tools (ICU-Templates)

- [ ] Erklärungs-Strings in `lib/tools/{lighting,nutrients,ventilation,vpd,yield}.ts`
      inventarisieren (inkl. Helfer `ppfdExplanation`, `vpdExplanation`)
- [ ] Jede Erklärung in `messages/de.json` unter `toolResult.*` als
      ICU-Message mit benannten Platzhaltern (`{hoehe}`, `{pct}`, …)
- [ ] Tool-Funktionen geben `{ key, values }` statt fertigem String zurück
      (oder `t()` im Component-Layer, wo `explanation` gerendert wird)
- [ ] `messages/en.json`: dieselben Keys übersetzt (Glossar beachten:
      VPD, PPFD, EC, DLI bleiben; „Aufhänghöhe" → „mounting height" etc.)
- [ ] `ToolResult.tsx`: `TranslateButton` entfernen, `explanation` direkt rendern
- [ ] Kalibrierungs-/Ampel-Texte („Guter Bereich für aktives Wachstum.")
      mit abdecken

---

## Track C — Cleanup

- [ ] `TranslateButton` aus `DiagnoseResult.tsx` + `ToolResult.tsx` entfernen
- [ ] `components/TranslateButton.tsx` löschen (oder auf dünnen
      Claude-Fallback für echte Laufzeit-nur-Strings reduzieren — nur falls
      nach A/B noch welche übrig sind)
- [ ] `lib/translate.ts` + `api/translate/route.ts` löschen (kein Caller mehr)
      bzw. auf `askClaude` + Cache umstellen
- [ ] `messages/{de,en}.json` `translate.*`-Keys aufräumen
- [ ] CSP / `connect-src`: `api.mymemory.translated.net` war nie drin — nichts
      zu tun; nur prüfen, dass nichts anderes auf den alten Endpoint zeigt

---

## Track D — Mitpflegen automatisieren

- [ ] `npm run i18n:check` in die CI-Lint-Stufe hängen (PR #23 fügt gerade
      Lint-in-CI hinzu — dort andocken)
- [ ] Glossar-Lint: EN-String, der einen Glossarbegriff abweichend übersetzt
      → Warnung (einfache Wortliste, kein NLP)
- [ ] `docs/CONTENT_BACKLOG.md` / Content-Factory-Doku: Hinweis „nach dem
      Mergen neuer DE-Artikel `npm run i18n:translate` laufen lassen"
- [ ] optional GitHub Action: bei Diff an den Content-Dateien Pipeline laufen
      lassen, Übersetzungen als Commit an den PR hängen

---

## Reihenfolge

A1 → A2 → **A3 (Pilot, Benny startet)** → A4 → B → A5 → C → D

## Nicht in Scope

- Weitere Sprachen als EN (Struktur ist aber sprachneutral).
- Übersetzung des Impressums / der Datenschutzerklärung (bewusst DE-only mit
  EN-Kontakt-Hinweis, siehe `datenschutz/page.tsx`).
- TMS-Anbindung (Crowdin/Locize) — Overkill für Solo-Projekt.
