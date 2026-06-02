# Phase 18 – Content Production Engine

> **Wissen → Handlung.** Phase 18 ist kein weiteres Planungsdokument, sondern die
> tatsächliche Produktion der ersten Elite-Diagnoseartikel und die Einführung der
> **Knowledge Coverage KPI** als neuer North-Star-Metrik für das Wissenssystem.

## 1. Ausgangslage (Ende Phase 17)

Die Phasen 0–17 haben die komplette Plattform-Infrastruktur geliefert: Knowledge
OS, Knowledge Graph, Hybrid Search, Embeddings, Recommendation Engine, Analytics,
Tool Registry, Diagnose-Verknüpfungen, Content Audit und Content Factory.

Der Engpass ist nicht mehr Engineering, sondern **Content**:

| Bereich        | Score (Phase 16) |
| -------------- | ---------------- |
| Tech Stack     | ≈ 83 / 100       |
| Content Quality| ≈ 49 / 100       |

Der größte Hebel ist jetzt, die Top-Themen aus dem Backlog in hochwertige
Diagnose- und Entscheidungsartikel zu verwandeln. Erst dann entfaltet die
Infrastruktur ihren Wert.

## 2. Ziel von Phase 18

Die ersten **Elite-Artikel tatsächlich erzeugen** — nach dem 16-Block-Schema des
[Cannabis Editorial Standard](./CANNABIS_EDITORIAL_STANDARD.md) und den
Archetyp-Vorlagen in `docs/content-factory/templates/`.

Jeder Artikel hat hohen Such-, Diagnose-, AI- und Tool-Wert: mechanismus-first,
quantifiziert (pH, EC, °C, %RH, VPD, PPFD), ohne Blog-Filler.

## 3. Produzierte Artikel (Wave 1–3)

Alle elf Artikel liegen in
[`apps/web/src/data/terpira/diagnostics.ts`](../apps/web/src/data/terpira/diagnostics.ts)
und werden über die `GROW_KNOWLEDGE`-Allowlist in `wiki.ts` veröffentlicht
(`qualityScore` 4–5 → handbook-grade).

### Wave 1 – Nährstoffmängel
| Slug              | Titel                         | Leitsymptom |
| ----------------- | ----------------------------- | ----------- |
| `magnesiummangel` | Magnesiummangel                | Interveinale Chlorose, alte Blätter |
| `stickstoffmangel`| Stickstoffmangel               | Gleichmäßiges Vergilben, alte Blätter |
| `calciummangel`   | Calciummangel                  | Verkrüppelte, fleckige junge Triebe |
| `kaliummangel`    | Kaliummangel                   | Verbrannte Ränder, alte Blätter |
| `eisenmangel`     | Eisenmangel                    | Neongelbe junge Blätter, grüne Adern |

### Wave 2 – Schädlinge
| Slug            | Titel          | Leitsymptom |
| --------------- | -------------- | ----------- |
| `spinnmilben`   | Spinnmilben    | Stippling oben + Gespinst unten |
| `thripse`       | Thripse        | Silbrige Streifen + schwarze Kotpunkte |
| `trauermuecken` | Trauermücken   | Schwarze Mücken über nassem Substrat |

### Wave 3 – Krankheiten
| Slug                            | Titel              | Leitsymptom |
| ------------------------------- | ------------------ | ----------- |
| `bud-rot-botrytis`              | Bud Rot (Botrytis) | Welkes Einzelblättchen in der Knospe |
| `echter-mehltau-powdery-mildew` | Echter Mehltau     | Weißer, abwischbarer Belag auf Blättern |
| `wurzelfaeule`                  | Wurzelfäule (Pythium) | Welk trotz nassem Substrat |

### Wave 4 – Toxizitäten / Überschüsse (Phase 19)
| Slug                           | Titel                          | Leitsymptom |
| ------------------------------ | ------------------------------ | ----------- |
| `stickstoffueberschuss`        | Stickstoffüberschuss           | Dunkelgrüne, klauenförmige Blätter (The Claw) |
| `kalium-ueberschuss`           | Kaliumüberschuss               | Mg-/Ca-Mangelbild trotz Dosierung |
| `calciumueberschuss`           | Calciumüberschuss              | Mg-Mangelbild + steigender pH bei hartem Wasser |
| `salzanreicherung-hohe-ec`     | Salzstress / hohe EC           | Welke trotz Feuchte + verbrannte Blattränder |
| `naehrstoffverbrennung-tipburn`| Überdüngung / Nutrient Burn    | Braune, verbrannte Blattspitzen |

Jeder Artikel folgt der 16-Block-Struktur (Definition, wissenschaftlicher
Hintergrund, Physiologie/Biologie, Symptome nach Schweregrad, Ursachen nach
Häufigkeit, regelbasierter Diagnose-Entscheidungsbaum, Korrektur-/Sofortmaßnahmen,
Vorbeugung, Umwelt-/Nährstoffwechselwirkungen, häufige Fehler, fortgeschrittene
Überlegungen) plus `keyTakeaways`, `quickFacts`, `warnings`, `faq`, `glossary`,
belegte `sourceIds` und Cross-Links (`relatedSlugs`).

## 4. Veröffentlichungsmechanik

1. Artikel + neue Quellen leben in `apps/web/src/data/terpira/diagnostics.ts`.
2. `wiki.ts` importiert sie und mergt:
   - `diagnosticSources` in das Quellen-Register (`sourceById`),
   - `diagnosticArticles` in den `wikiArticles`-Concat,
   - `DIAGNOSTIC_GROW_KNOWLEDGE` in die `GROW_KNOWLEDGE`-Allowlist.
3. Ein Artikel ist **nur** publiziert, wenn sein Slug in `GROW_KNOWLEDGE` steht.

## 5. Validierung

- `npx tsc -p tsconfig.json --noEmit` → grün
- `npx eslint .` → grün
- Alle 16 Slugs (11 aus Phase 18 + 5 aus Phase 19) erscheinen in `wikiArticles`
  und werden als handbook-grade gezählt.

## 6. Knowledge Coverage KPI

Siehe [`KNOWLEDGE_COVERAGE_KPI.md`](./KNOWLEDGE_COVERAGE_KPI.md). Diese Metrik
ersetzt die reine Artikelanzahl als North Star und macht Fortschritt pro Domäne
und für den diagnostischen Kern wöchentlich sichtbar.

## 7. Nächste Wellen (Backlog)

Phase 18 ist ein **wiederholbarer Produktionslauf**, kein Einmalprojekt. Phase 19
hat die Domäne **Toxizitäten / Überschüsse** auf 83 % gehoben (Differenzialdiagnose
Mangel vs. Überschuss). Folgende Wellen füllen die noch kritischen Domänen
(Umwelt- & Klimastress, weitere Krankheiten/Schädlinge, Mikronährstoff-Toxizität)
bis zum Zielkorridor: diagnostischer Kern ≥ 80 %, keine Domäne unter 50 %.
