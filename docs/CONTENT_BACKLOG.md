# Prioritized Content Backlog — Phase 17 Content Factory (Phase E)

> The build order. 100 articles ranked by a transparent priority score that fuses
> the four signals in the mission brief: **search demand**, **diagnosis
> importance**, **AI training value**, and **tool integration value**. Feed this
> top-to-bottom through the [generation workflow](./content-factory/ARTICLE_WORKFLOW.md)
> using the matching [template](./content-factory/templates/).
>
> Owner: Editorial & Agronomy · Status: Active · Date: 2026-06-02 · Version: 1.0

Companion: [`KNOWLEDGE_COVERAGE_MATRIX.md`](./KNOWLEDGE_COVERAGE_MATRIX.md)
· [`CONTENT_QUALITY_AUDIT.md`](./CONTENT_QUALITY_AUDIT.md)
· [`content-factory/`](./content-factory/)

---

## 1. Scoring model

```
priority = 0.35 × search_demand
         + 0.30 × diagnosis_importance
         + 0.20 × ai_training_value
         + 0.15 × tool_integration_value      (each factor 1–5) → normalized to /100
```

| Factor | Weight | What it rewards |
|--------|:------:|-----------------|
| Search demand | 35% | How often growers actually search the topic. |
| Diagnosis importance | 30% | Value to the diagnosis tool / decision support. |
| AI training value | 20% | Quality of structured signal for the AI assistant & image diagnosis. |
| Tool integration value | 15% | Linkage to calculators/diagnosis tools (`knowledge_tool_links`). |

Demand-weighting reflects that this is a user-facing reference; diagnosis weight
encodes the strategic insight that the **diagnostic core is the product's biggest
lever**. Ties break toward net-new articles over uplifts.

## 2. Composition

- **100 articles**: 81 net-new, 19 uplifts/rewrites of existing thin content.
- **By archetype:** Deficiency 12 · Toxicity 8 · Pest 14 · Disease 16 ·
  Environmental 15 · Technique 28 · Harvest 7.
- The top 40 are dominated by the **diagnostic core** (deficiencies, pests,
  diseases, plus the symptom-troubleshooter hub) — exactly the 0%-coverage gap
  from the [coverage matrix](./KNOWLEDGE_COVERAGE_MATRIX.md).

---

## 3. Build waves

Run in waves; recompute the coverage scorecard and Phase 16 quality metrics after
each before starting the next.

| Wave | Theme | Items | Exit criterion |
|:----:|-------|:-----:|----------------|
| **1** | Diagnostic core — deficiencies, pests, diseases + symptom hub | #1–~40 | Diagnostic-core coverage ≥ 80% handbook-grade. |
| **2** | Differentials — toxicities & environmental stress | next ~23 | Every deficiency has its toxicity + stress look-alike partner. |
| **3** | Technique & harvest (new) | next ~21 | Lifecycle (training → harvest → dry/cure) fully covered. |
| **4** | Uplifts & secondary chemistry/genetics | remainder | No published article below tier B; orphans resolved. |

**Batch rule:** author differential sets together (a deficiency with its toxicity;
look-alike pests; a stress with the deficiency it mimics) so `diagnosis` blocks
cross-link cleanly (see workflow §8).

---

## 4. Ranked backlog (top 100)

| # | Slug | Archetype | Type | Demand | Diag | AI | Tool | Priority |
|---|------|-----------|------|:------:|:----:|:--:|:----:|:--------:|
| 1 | `magnesiummangel` | Deficiency | New | 5 | 5 | 5 | 5 | **100** |
| 2 | `stickstoffmangel` | Deficiency | New | 5 | 5 | 5 | 5 | **100** |
| 3 | `calciummangel` | Deficiency | New | 5 | 5 | 5 | 5 | **100** |
| 4 | `ph-lockout` | Toxicity | New | 5 | 5 | 5 | 5 | **100** |
| 5 | `spinnmilben` | Pest | New | 5 | 5 | 5 | 5 | **100** |
| 6 | `thripse` | Pest | New | 5 | 5 | 5 | 5 | **100** |
| 7 | `bud-rot-botrytis` | Disease | New | 5 | 5 | 5 | 5 | **100** |
| 8 | `echter-mehltau-powdery-mildew` | Disease | New | 5 | 5 | 5 | 5 | **100** |
| 9 | `hitzestress` | Env | New | 5 | 5 | 5 | 5 | **100** |
| 10 | `blattsymptom-troubleshooter` | Disease | New | 5 | 5 | 5 | 5 | **100** |
| 11 | `kaliummangel` | Deficiency | New | 5 | 5 | 5 | 4 | **97** |
| 12 | `trauermuecken` | Pest | New | 5 | 5 | 4 | 5 | **96** |
| 13 | `wurzelfaeule` | Disease | New | 5 | 5 | 4 | 5 | **96** |
| 14 | `ueberwaesserung-staunaesse` | Env | New | 5 | 5 | 4 | 5 | **96** |
| 15 | `ph-management-coco-erde-hydro` | Technique | New | 5 | 5 | 4 | 5 | **96** |
| 16 | `eisenmangel` | Deficiency | New | 5 | 5 | 4 | 4 | **93** |
| 17 | `stickstoffueberschuss` | Toxicity | New | 4 | 5 | 5 | 5 | **93** |
| 18 | `hop-latent-viroid-hlvd` | Disease | New | 4 | 5 | 5 | 4 | **90** |
| 19 | `erntefenster-trichomreife` | Harvest | New | 5 | 4 | 4 | 5 | **90** |
| 20 | `fuetterungsplan-nach-phase` | Technique | Uplift | 5 | 4 | 4 | 5 | **90** |
| 21 | `naehrstoffbedarf-cannabis-lebenszyklus` | Technique | Uplift | 5 | 4 | 4 | 5 | **90** |
| 22 | `naehrstoffverbrennung-tipburn` | Toxicity | New | 4 | 5 | 4 | 5 | **89** |
| 23 | `blattlaeuse` | Pest | New | 4 | 5 | 4 | 5 | **89** |
| 24 | `weisse-fliege` | Pest | New | 4 | 5 | 4 | 5 | **89** |
| 25 | `wurzelgesundheit-diagnose` | Disease | New | 4 | 5 | 4 | 5 | **89** |
| 26 | `ec-und-runoff-interpretation` | Toxicity | New | 4 | 5 | 4 | 5 | **89** |
| 27 | `naehrstoffblockaden-und-antagonismen` | Toxicity | Uplift | 4 | 5 | 4 | 5 | **89** |
| 28 | `stressmarker-frueh-erkennen` | Env | Uplift | 4 | 5 | 4 | 5 | **89** |
| 29 | `trocknung-protokoll` | Harvest | New | 5 | 4 | 4 | 4 | **87** |
| 30 | `trichom-reifegrad-bilddiagnose` | Harvest | New | 4 | 4 | 5 | 5 | **87** |
| 31 | `bewaesserung-ohne-uebergiessen` | Technique | Uplift | 5 | 4 | 4 | 4 | **87** |
| 32 | `phosphormangel` | Deficiency | New | 4 | 5 | 4 | 4 | **86** |
| 33 | `hanf-rostmilben` | Pest | New | 4 | 5 | 4 | 4 | **86** |
| 34 | `pythium-wurzelfaeule` | Disease | New | 4 | 5 | 4 | 4 | **86** |
| 35 | `fusarium` | Disease | New | 4 | 5 | 4 | 4 | **86** |
| 36 | `luftfeuchte-management` | Env | New | 4 | 4 | 4 | 5 | **83** |
| 37 | `dli-und-photoperiode` | Env | New | 4 | 4 | 4 | 5 | **83** |
| 38 | `vpd-nach-wachstumsphase` | Env | New | 4 | 4 | 4 | 5 | **83** |
| 39 | `calmag-supplementierung` | Technique | New | 4 | 4 | 4 | 5 | **83** |
| 40 | `lichtstress-und-canopy-management` | Env | Uplift | 4 | 4 | 4 | 5 | **83** |
| 41 | `salzanreicherung-hohe-ec` | Toxicity | New | 3 | 5 | 4 | 5 | **82** |
| 42 | `blattflecken-differentialdiagnose` | Disease | New | 3 | 5 | 4 | 5 | **82** |
| 43 | `topping-und-fim` | Technique | New | 5 | 3 | 4 | 4 | **81** |
| 44 | `lst-low-stress-training` | Technique | New | 5 | 3 | 4 | 4 | **81** |
| 45 | `kaeltestress` | Env | New | 4 | 4 | 4 | 4 | **80** |
| 46 | `unterwaesserung-trockenstress` | Env | New | 4 | 4 | 4 | 4 | **80** |
| 47 | `lichtleck-und-zwitterbildung` | Env | New | 4 | 4 | 4 | 4 | **80** |
| 48 | `wasserqualitaet-und-aufbereitung` | Technique | New | 4 | 4 | 4 | 4 | **80** |
| 49 | `samenkeimung-troubleshooting` | Technique | New | 4 | 4 | 4 | 4 | **80** |
| 50 | `cannabis-substrat-und-wurzelzone` | Technique | Uplift | 4 | 4 | 4 | 4 | **80** |
| 51 | `schimmel-und-mykotoxine-bei-cannabis` | Disease | Uplift | 4 | 4 | 4 | 4 | **80** |
| 52 | `integrierte-schaedlingspraevention-grow` | Pest | Uplift | 4 | 4 | 4 | 4 | **80** |
| 53 | `breitmilben` | Pest | New | 3 | 5 | 4 | 4 | **79** |
| 54 | `keimung-und-anzucht` | Technique | New | 5 | 3 | 4 | 3 | **78** |
| 55 | `nachttemperatur-und-schimmelrisiko` | Env | New | 4 | 4 | 3 | 4 | **76** |
| 56 | `lichtspektrum-und-bluete` | Env | New | 4 | 3 | 4 | 4 | **74** |
| 57 | `schwefelmangel` | Deficiency | New | 3 | 4 | 4 | 4 | **73** |
| 58 | `zinkmangel` | Deficiency | New | 3 | 4 | 4 | 4 | **73** |
| 59 | `falscher-mehltau` | Disease | New | 3 | 4 | 4 | 4 | **73** |
| 60 | `septoria-blattflecken` | Disease | New | 3 | 4 | 4 | 4 | **73** |
| 61 | `beneficial-insects-biocontrol` | Pest | New | 3 | 4 | 4 | 4 | **73** |
| 62 | `quarantaene-neuer-genetik` | Disease | New | 3 | 4 | 4 | 4 | **73** |
| 63 | `sensor-kalibrierung-und-messfehler` | Technique | Uplift | 3 | 4 | 3 | 5 | **72** |
| 64 | `klonen-und-stecklinge` | Technique | New | 4 | 3 | 4 | 3 | **71** |
| 65 | `scrog-und-sog` | Technique | New | 4 | 3 | 3 | 4 | **70** |
| 66 | `grow-log-und-kpi-dashboard` | Technique | Uplift | 3 | 3 | 4 | 5 | **70** |
| 67 | `substrat-vergleich-coco-erde-hydro` | Technique | Uplift | 4 | 3 | 3 | 4 | **70** |
| 68 | `manganmangel` | Deficiency | New | 3 | 4 | 3 | 4 | **69** |
| 69 | `raupen-budworm` | Pest | New | 3 | 4 | 3 | 4 | **69** |
| 70 | `wurzellaeuse` | Pest | New | 3 | 4 | 3 | 4 | **69** |
| 71 | `umfallkrankheit-damping-off` | Disease | New | 3 | 4 | 3 | 4 | **69** |
| 72 | `windbrand` | Env | New | 3 | 4 | 3 | 4 | **69** |
| 73 | `wurzelzone-temperatur-management` | Env | New | 3 | 4 | 3 | 4 | **69** |
| 74 | `co2-management` | Env | New | 3 | 3 | 4 | 4 | **67** |
| 75 | `defoliation-entlauben` | Technique | New | 4 | 3 | 3 | 3 | **67** |
| 76 | `umtopfen` | Technique | New | 4 | 3 | 3 | 3 | **67** |
| 77 | `flushing-vor-der-ernte` | Harvest | New | 4 | 3 | 3 | 3 | **67** |
| 78 | `autoflower-spezifische-pflege` | Technique | New | 4 | 3 | 3 | 3 | **67** |
| 79 | `cannabinoid-biosynthese-verstehen` | Technique | Uplift | 3 | 3 | 4 | 3 | **64** |
| 80 | `silizium-und-pflanzenstabilitaet` | Technique | New | 3 | 3 | 3 | 4 | **63** |
| 81 | `bor-mangel` | Deficiency | New | 2 | 4 | 3 | 4 | **62** |
| 82 | `mikronaehrstoff-toxizitaet` | Toxicity | New | 2 | 4 | 3 | 4 | **62** |
| 83 | `kalium-ueberschuss` | Toxicity | New | 2 | 4 | 3 | 4 | **62** |
| 84 | `feminisiert-vs-regular-vs-autoflower` | Technique | Uplift | 4 | 2 | 3 | 3 | **61** |
| 85 | `indoor-outdoor-anbau-vergleich` | Technique | Uplift | 4 | 2 | 3 | 3 | **61** |
| 86 | `erntehygiene-und-handling` | Harvest | New | 3 | 3 | 3 | 3 | **60** |
| 87 | `mutterpflanzen-und-clone-hygiene` | Technique | Uplift | 3 | 3 | 3 | 3 | **60** |
| 88 | `thc-zu-cbn-abbau-und-oxidation` | Harvest | Uplift | 3 | 3 | 3 | 3 | **60** |
| 89 | `lagerung-und-terpenverlust-vermeiden` | Harvest | Uplift | 3 | 3 | 3 | 3 | **60** |
| 90 | `kupfermangel` | Deficiency | New | 2 | 3 | 3 | 4 | **56** |
| 91 | `molybdaenmangel` | Deficiency | New | 2 | 3 | 3 | 4 | **56** |
| 92 | `supercropping` | Technique | New | 3 | 2 | 3 | 3 | **54** |
| 93 | `sea-of-green-ertragsoptimierung` | Technique | New | 3 | 2 | 3 | 3 | **54** |
| 94 | `mainlining-manifolding` | Technique | New | 3 | 2 | 3 | 3 | **54** |
| 95 | `decarboxylierung-grundlagen-und-fehler` | Technique | Uplift | 3 | 2 | 3 | 3 | **54** |
| 96 | `minierfliegen` | Pest | New | 2 | 3 | 3 | 3 | **53** |
| 97 | `wolllaeuse` | Pest | New | 2 | 3 | 3 | 3 | **53** |
| 98 | `schildlaeuse` | Pest | New | 2 | 3 | 3 | 3 | **53** |
| 99 | `tabakmosaikvirus` | Disease | New | 2 | 3 | 3 | 3 | **53** |
| 100 | `russtaupilz` | Disease | New | 2 | 3 | 3 | 3 | **53** |


---

## 5. Notes

- **Slugs are proposed** (German, kebab-case) to match existing conventions in
  `apps/web/src/data/terpira/wiki.ts`; finalize at draft time.
- **Type = Uplift** means an existing definition is rewritten to handbook grade
  (Phase 16 found most existing articles cheaper to rewrite than to patch), not
  lightly edited.
- Scores are relative prioritization signals, not absolute traffic estimates;
  refine factor values as real `knowledge_events` search analytics accumulate.
- Publishing into the legacy wiki additionally requires adding the slug to the
  `GROW_KNOWLEDGE` allowlist (see workflow §6 / Stage 5).
