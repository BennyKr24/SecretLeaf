# SecretLeaf — Knowledge Coverage Matrix (Phase 17 · Phase A)

> The bottleneck is no longer infrastructure. It is **knowledge coverage** and
> **article quality**. This matrix maps the entire target domain a professional
> cannabis cultivation reference must cover, measures what exists today against
> it, and exposes every gap as a percentage and a named backlog item.
>
> Owner: Editorial & Agronomy · Status: Active · Date: 2026-06-02 · Version: 1.0

Companion documents:
- `docs/CONTENT_QUALITY_AUDIT.md` — Phase 16 quality audit (the trigger for this work).
- `docs/CANNABIS_EDITORIAL_STANDARD.md` — binding editorial framework (16-block schema).
- `docs/content-factory/` — templates, source requirements, and the generation workflow.
- `docs/CONTENT_BACKLOG.md` — Phase E, the prioritized top-100 build order.

---

## 1. How to read this matrix

Coverage is measured per **domain area** against a canonical target topic set
(the topics a serious cultivation reference is expected to carry). For each area:

- **Target** — number of canonical topics in scope.
- **Exists** — topics with *any* article today (published **or** orphaned).
- **Published** — topics with a reader-visible article (slug in `GROW_KNOWLEDGE`;
  see `apps/web/src/data/terpira/wiki.ts`).
- **Handbook-grade** — published *and* scoring ≥ 65 (tier A/B) in the Phase 16 audit.
- **Coverage %** = Handbook-grade ÷ Target. This is deliberately strict: a lite
  stub or an orphaned definition does **not** count as coverage.

> Coverage measures *handbook-grade, reader-visible* topics, not raw article
> definitions. By this measure the corpus is far thinner than its 82 definitions
> suggest.

---

## 2. Coverage summary

| Domain area | Target | Exists | Published | Handbook-grade | Coverage % | Status |
|-------------|:------:|:------:|:---------:|:--------------:|:----------:|--------|
| Nutrient deficiencies | 12 | 1 | 1 | 0 | **0%** | 🔴 Critical |
| Nutrient toxicities / excess | 6 | 1 | 1 | 0 | **0%** | 🔴 Critical |
| Diseases (fungal/bacterial/viral) | 12 | 1 | 1 | 0 | **0%** | 🔴 Critical |
| Pests | 12 | 1 | 1 | 0 | **0%** | 🔴 Critical |
| Environmental stress | 12 | 5 | 5 | 3 | **25%** | 🟠 Weak |
| Cultivation technique | 16 | 9 | 8 | 4 | **25%** | 🟠 Weak |
| Harvest & post-harvest | 8 | 5 | 5 | 3 | **38%** | 🟠 Weak |
| Genetics & propagation | 8 | 5 | 4 | 1 | **13%** | 🟠 Weak |
| Chemistry & analytics | 8 | 6 | 2 | 1 | **13%** | 🟠 Weak |
| **Diagnostic core (def. + disease + pest)** | **36** | **3** | **3** | **0** | **0%** | 🔴 Critical |

**Headline:** the entire **diagnostic core** — the deficiencies, diseases, and
pests growers actually search for and that future diagnosis/AI tools depend on —
sits at **0% handbook-grade coverage**. This is the single largest, highest-value
gap in the product. Everything else is secondary.

The user's strategic read is confirmed by data: *"Magnesium Deficiency does not
exist."* Neither does any other deficiency, disease, or pest article at
handbook grade.

---

## 3. Nutrient deficiencies — 🔴 0%

The canonical deficiency set, with mobility (drives where symptoms appear first)
and current state. **None exists as a dedicated article**; the only adjacent
content is `naehrstoffblockaden-und-antagonismen` (a lite stub, CQ 52).

| Topic | Mobility | First appears on | Slug (proposed) | State |
|-------|----------|------------------|-----------------|-------|
| Nitrogen (N) deficiency | mobile | older/lower leaves | `stickstoffmangel` | ❌ Missing |
| Phosphorus (P) deficiency | mobile | older leaves | `phosphormangel` | ❌ Missing |
| Potassium (K) deficiency | mobile | older leaf margins | `kaliummangel` | ❌ Missing |
| Magnesium (Mg) deficiency | mobile | older leaves, interveinal | `magnesiummangel` | ❌ Missing |
| Calcium (Ca) deficiency | immobile | new growth | `calciummangel` | ❌ Missing |
| Sulfur (S) deficiency | immobile | new growth | `schwefelmangel` | ❌ Missing |
| Iron (Fe) deficiency | immobile | new growth, interveinal | `eisenmangel` | ❌ Missing |
| Manganese (Mn) deficiency | immobile | new/mid growth | `manganmangel` | ❌ Missing |
| Zinc (Zn) deficiency | immobile | new growth, internodes | `zinkmangel` | ❌ Missing |
| Boron (B) deficiency | immobile | growing tips | `bor-mangel` | ❌ Missing |
| Copper (Cu) deficiency | immobile | new growth | `kupfermangel` | ❌ Missing |
| Molybdenum (Mo) deficiency | mobile | mid leaves | `molybdaenmangel` | ❌ Missing |

These are the **highest-leverage articles in the entire product** (per Phase 16
§7 and the user's strategic note) and the foundation for the future diagnosis
tool, AI assistant, and image diagnosis.

---

## 4. Nutrient toxicities / excess — 🟢 83% (Phase 19)

| Topic | Slug | State |
|-------|-----------------|-------|
| Nitrogen toxicity (the "claw") | `stickstoffueberschuss` | ✅ Published (Phase 19) |
| Nutrient burn / over-fertilization | `naehrstoffverbrennung-tipburn` | ✅ Published (Phase 19) |
| Potassium / cation excess | `kalium-ueberschuss` | ✅ Published (Phase 19) |
| Calcium excess | `calciumueberschuss` | ✅ Published (Phase 19) |
| Salt buildup / high EC | `salzanreicherung-hohe-ec` | ✅ Published (Phase 19) |
| Micronutrient toxicity (Fe/Mn/B) | `mikronaehrstoff-toxizitaet` | ❌ Missing |

> Phase 19 lieferte 5 von 6 Zielartikeln (handbook-grade). Damit ist die
> Differenzialdiagnose **Mangel vs. Überschuss** für die Makronährstoffe und den
> Salzhaushalt abgebildet. Offen bleibt die Mikronährstoff-Toxizität.

---

## 5. Diseases — 🔴 0%

Only `schimmel-und-mykotoxine-bei-cannabis` (CQ 60) exists, and it covers
post-harvest mold generically, not pathogen-specific identification and response.

| Topic | Class | Slug (proposed) | State |
|-------|-------|-----------------|-------|
| Root rot (general) | oomycete/fungal | `wurzelfaeule` | ❌ Missing |
| Pythium | oomycete | `pythium-wurzelfaeule` | ❌ Missing |
| Fusarium wilt/rot | fungal | `fusarium` | ❌ Missing |
| Bud rot (Botrytis cinerea) | fungal | `bud-rot-botrytis` | ❌ Missing |
| Powdery mildew | fungal | `echter-mehltau-powdery-mildew` | ❌ Missing |
| Downy mildew | oomycete | `falscher-mehltau` | ❌ Missing |
| Septoria leaf spot | fungal | `septoria-blattflecken` | ❌ Missing |
| Hop latent viroid (HLVd / "dudding") | viroid | `hop-latent-viroid-hlvd` | ❌ Missing |
| Tobacco mosaic virus | viral | `tabakmosaikvirus` | ❌ Missing |
| Damping off (seedling) | fungal | `umfallkrankheit-damping-off` | ❌ Missing |
| Leaf septoria vs. nutrient confusion | diagnostic | `blattflecken-differentialdiagnose` | ❌ Missing |
| Sooty mold (secondary) | fungal | `russtaupilz` | ❌ Missing |

---

## 6. Pests — 🔴 0%

Only generic IPM (`integrierte-schaedlingspraevention-grow`, CQ 58) and pesticide
residue (`pestizidklassen-und-rueckstandsrisiken`) exist — no pest is identifiable
or treatable from the corpus.

| Topic | Slug (proposed) | State |
|-------|-----------------|-------|
| Spider mites (Tetranychus) | `spinnmilben` | ❌ Missing |
| Thrips | `thripse` | ❌ Missing |
| Fungus gnats (Trauermücken) | `trauermuecken` | ❌ Missing |
| Aphids (Blattläuse) | `blattlaeuse` | ❌ Missing |
| Whiteflies (Weiße Fliege) | `weisse-fliege` | ❌ Missing |
| Broad mites | `breitmilben` | ❌ Missing |
| Russet mites (Hemp russet) | `hanf-rostmilben` | ❌ Missing |
| Caterpillars / budworms | `raupen-budworm` | ❌ Missing |
| Leaf miners | `minierfliegen` | ❌ Missing |
| Root aphids | `wurzellaeuse` | ❌ Missing |
| Mealybugs | `wollläuse` | ❌ Missing |
| Scale insects | `schildlaeuse` | ❌ Missing |

---

## 7. Environmental stress — 🟢 67% (Phase 20)

| Topic | Slug | State |
|-------|------|-------|
| VPD fundamentals | `vpd-einfach-erklaert` | ✅ Published, handbook-grade |
| VPD + EC operating guide | `vpd-und-ec-kombi-rechner-guide` | ✅ Published, handbook-grade |
| Light stress / canopy | `lichtstress-und-canopy-management` | ✅ Published, handbook-grade |
| Heat stress | `hitzestress` | ✅ Published (Phase 20) |
| Cold stress | `kaeltestress` | ✅ Published (Phase 20) |
| Wind burn | `windbrand` | ✅ Published (Phase 20) |
| Humidity / RH management (high & low) | `luftfeuchte-management` | ✅ Published (Phase 20) |
| Overwatering | (inside `bewaesserung-ohne-uebergiessen`) | 🟡 Partial — split out |
| Underwatering | `unterwaesserung-trockenstress` | ❌ Missing |
| Light leak / hermaphroditism stress | `lichtleck-und-zwitterbildung` | ❌ Missing |
| CO₂ deficiency / excess | `co2-management` | ✅ Published (Phase 20) |
| pH lockout (env. trigger) | `ph-lockout` | ❌ Missing (only lite antagonism stub) |

> Phase 20 lieferte 5 neue handbook-grade Diagnoseartikel (Hitze, Kälte,
> Windbrand, Luftfeuchte, CO₂) und verankerte die bereits publizierten
> VPD-/Lichtstress-Artikel. Damit stehen Umwelt-/Klimasymptome als
> **Differenzialdiagnose-Partner** zu Mängeln und Toxizitäten bereit
> (`computeKnowledgeCoverage()`: 8/12 = 67 %, Status *solide*).

---

## 8. Cultivation technique — 🟠 25%

| Topic | Slug | State |
|-------|------|-------|
| Cultivation fundamentals | `cannabis-anbau-grundlagen` | ✅ Published, A (95) |
| Substrate & root zone | `cannabis-substrat-und-wurzelzone` | ✅ Published, C (60) |
| Watering without overwatering | `bewaesserung-ohne-uebergiessen` | ✅ Published, C (60) |
| Grow log / KPI dashboard | `grow-log-und-kpi-dashboard` | ✅ Published, C (60) |
| Sensor calibration | `sensor-kalibrierung-und-messfehler` | ✅ Published, C (60) |
| Beginner grow tutorial | `how-to-grow-cannabis-anfaenger-tutorial` | ✅ Published, A (81) |
| Advanced grow tutorial | `how-to-grow-cannabis-fortgeschritten-tutorial` | ✅ Published, A (81) |
| Pro grow tutorial | `how-to-grow-cannabis-profi-tutorial` | ✅ Published, A (86) |
| IPM (prevention) | `integrierte-schaedlingspraevention-grow` | ✅ Published, C (58) |
| Topping / FIM | `topping-und-fim` | ❌ Missing |
| LST (low-stress training) | `lst-low-stress-training` | ❌ Missing |
| ScrOG / SOG | `scrog-und-sog` | ❌ Missing |
| Defoliation | `defoliation-entlauben` | ❌ Missing |
| Supercropping | `supercropping` | ❌ Missing |
| Transplanting | `umtopfen` | ❌ Missing |
| Feeding schedules by stage | `fuetterungsplan-nach-phase` | 🟡 Partial — lite stub exists |

---

## 9. Harvest & post-harvest — 🟠 38%

| Topic | Slug | State |
|-------|------|-------|
| Water activity & curing | `wasseraktivitaet-und-curing` | ✅ Published, B (71) |
| Storage & light protection | `lagerung-verpackung-und-lichtschutz` | ✅ Published, C (58) |
| Terpene loss in storage | `lagerung-und-terpenverlust-vermeiden` | ✅ Published, C (58) |
| THC→CBN degradation | `thc-zu-cbn-abbau-und-oxidation` | ✅ Published, C (58) |
| Mold & mycotoxins | `schimmel-und-mykotoxine-bei-cannabis` | ✅ Published, C (60) |
| Harvest window (trichome maturity) | `erntefenster-trichomreife` | ❌ Missing |
| Drying protocol | `trocknung-protokoll` | ❌ Missing |
| Flushing (pre-harvest) | `flushing-vor-der-ernte` | ❌ Missing |

---

## 10. Genetics, chemistry & remaining categories

These are below target but **secondary** to the diagnostic core. Summarized;
itemized topics live in `docs/CONTENT_BACKLOG.md`.

| Area | Coverage | Note |
|------|:--------:|------|
| Genetics & propagation | 13% | Pheno selection published (B 69); cloning, germination, mothers thin or lite. |
| Chemistry & analytics | 13% | Biosynthesis/terpene profile decent; HPLC/GC, decarb are orphaned (D). |
| Konsum / application | low | High orphan rate; not core to cultivation mission. |
| Medizin / Recht / Markt | 0% published | 19 orphaned definitions; decide publish-or-deprecate (Phase 16 Wave 4). |

---

## 11. Gap rollup — what to build, in priority order

| Priority | Gap cluster | Missing articles | Why |
|----------|-------------|:----------------:|-----|
| **P0** | Nutrient deficiencies | 12 | Highest search demand; diagnosis/AI foundation; 0% today. |
| **P0** | Pests | 12 | High search demand; identification + staged response; 0%. |
| **P0** | Diseases | 11 | Safety-critical; 0% pathogen-specific. |
| **P1** | Nutrient toxicities | 6 | Completes the deficiency↔toxicity differential pairs. |
| **P1** | Environmental stress | 3 | Differential diagnosis partners for deficiencies (Phase 20 closed 5/8). |
| **P2** | Cultivation technique | 7 | Training/harvest methods; high but non-diagnostic demand. |
| **P2** | Harvest & post-harvest | 3 | Harvest-window + drying complete the lifecycle. |
| **P3** | Genetics / chemistry uplift | — | Uplift existing orphans rather than net-new. |

**Net-new handbook articles required to reach target diagnostic coverage: ~56.**
This matrix feeds directly into the prioritized backlog (Phase E,
`docs/CONTENT_BACKLOG.md`).

---

## 12. Coverage scorecard (live metric)

Re-compute after each content wave. Baseline (this matrix):

```
Nutrient deficiencies   0%   🔴
Nutrient toxicities      0%   🔴
Diseases                 0%   🔴
Pests                    0%   🔴
Environmental stress    25%   🟠
Cultivation technique   25%   🟠
Harvest & post-harvest  38%   🟠
Genetics & propagation  13%   🟠
Chemistry & analytics   13%   🟠
──────────────────────────────
Diagnostic core          0%   🔴   ← primary target
```

**Definition of done for Phase 17 content execution:** diagnostic core
(deficiencies + diseases + pests) reaches ≥ 80% handbook-grade coverage, and no
domain area sits below 50%.
