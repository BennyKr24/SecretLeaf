# SecretLeaf — Cannabis Editorial Standard (Phase 3)

> The binding editorial framework for the SecretLeaf Knowledge Operating System.
> Every article in `knowledge_articles` must conform to this standard before it
> reaches `status = 'published'`.
>
> Owner: Editorial & Agronomy · Status: Active · Version: 1.0

---

## 1. Editorial mission

SecretLeaf knowledge is a **professional cultivation reference**, not a blog.
The reader is a serious cultivator, technician, or clinician who needs accurate,
actionable, evidence-anchored horticultural information. The register sits at the
intersection of:

- peer-reviewed horticultural literature,
- agricultural extension publications, and
- scientific cultivation guides.

If a sentence would not survive in an agronomy textbook or an extension bulletin,
it does not belong in a SecretLeaf article.

---

## 2. Voice & register

**Write like horticultural literature.**

- Precise, declarative, third person. State mechanisms, not opinions.
- Quantify wherever possible (ranges, units, thresholds): pH, EC/PPM, °C, %RH,
  VPD (kPa), PPFD (µmol·m⁻²·s⁻¹), DLI (mol·m⁻²·d⁻¹).
- Use correct domain terminology: cultivar (not "strain" in technical context),
  substrate, rhizosphere, cation exchange, antagonism, chlorosis, necrosis,
  interveinal, abaxial/adaxial, transpiration, stomatal conductance.
- Prefer SI units; provide common-practice equivalents in parentheses when useful.
- Maintain terminology consistency with `LOCALIZATION.md` (DE/EN parity).

### Prohibited

- ❌ Beginner hand-holding ("Don't worry, this is easy!").
- ❌ Generic blog phrasing ("In this article, we'll explore…").
- ❌ SEO filler, keyword stuffing, repetition for length.
- ❌ Vague claims ("some growers say", "it's known that") without a mechanism or
  source.
- ❌ Hype, marketing language, or anthropomorphizing the plant.
- ❌ Unsupported medical or legal advice.

### Required

- ✅ Mechanistic explanation (the *why* at the physiological/chemical level).
- ✅ Concrete, measurable corrective and preventive actions.
- ✅ Explicit uncertainty when evidence is weak ("evidence is limited / mixed").
- ✅ Citations for quantitative claims, drawn from `knowledge_sources`.

---

## 3. Evidence policy

- Every quantitative or clinical claim must be traceable to a record in
  `knowledge_sources` via `knowledge_references`.
- Source quality is ranked by `evidence_level` (1–5):
  - **5** systematic review / meta-analysis
  - **4** randomized controlled trial / authoritative standard (ISO, AOAC, ASTM)
  - **3** controlled experimental study
  - **2** observational / field study
  - **1** expert consensus / extension guidance
- When sources conflict, present the weight of evidence and state the conflict.
- Prefer primary literature and standards bodies over secondary commentary.

---

## 4. Canonical article structure (Phase 4)

Every article body is an ordered list of typed blocks (`knowledge_articles.body`,
block `type` from the `KnowledgeBlockType` union). The full template:

| # | Block `type` | Purpose |
|---|--------------|---------|
| 1 | `definition` | One-paragraph precise definition of the topic/entity. |
| 2 | `scientific_background` | Underlying chemistry/biology and relevant literature. |
| 3 | `plant_physiology` | How the plant's physiology is involved. |
| 4 | `symptoms` | Observable, staged signs (where applicable). |
| 5 | `causes` | Ranked causal factors with mechanisms. |
| 6 | `diagnosis` | Differential diagnosis & measurement procedure. |
| 7 | `corrective_actions` | Specific, measurable interventions. |
| 8 | `preventive_measures` | Protocols that prevent recurrence. |
| 9 | `environmental_factors` | VPD, temperature, RH, light, airflow influences. |
| 10 | `nutrient_interactions` | Antagonisms, synergisms, lockout dynamics. |
| 11 | `common_mistakes` | Frequent operator errors and misdiagnoses. |
| 12 | `advanced_considerations` | Edge cases, high-control environments, research frontier. |
| 13 | `related_topics` | Graph cross-links (maps to `knowledge_relations`). |
| 14 | `references` | Cited sources (maps to `knowledge_references`). |
| 15 | `faq` | Structured Q&A (maps to `knowledge_faqs`, drives FAQ schema). |
| 16 | `expert_tips` | High-signal practitioner guidance. |

Presentation blocks `callout`, `warning`, and `expert_box` may be interleaved.

**Not every block is mandatory for every topic** (a terpene-chemistry article has
no `symptoms`), but the editor must consciously include or omit each — the
template is the default skeleton, and omission is a deliberate editorial choice.

---

## 5. Style mechanics

- **Headings:** noun phrases, sentence case, no questions as section headings
  (questions belong in `faq`).
- **Lists:** parallel structure; lead with the action verb or the parameter.
- **Numbers:** always with units; ranges use en-dash (6.0–6.5).
- **Tables:** prefer tables for thresholds, comparisons, and dosing.
- **Cultivar names:** italicized where the platform supports it.
- **Abbreviations:** expand on first use (VPD, vapor pressure deficit).

---

## 6. Worked example — "Magnesium Deficiency"

A conforming article reads, in part:

> **Definition.** Magnesium deficiency is a physiological disorder caused by
> insufficient Mg²⁺ availability to the plant, impairing chlorophyll synthesis
> and photoassimilate transport.
>
> **Plant physiology.** Magnesium is the central coordinating ion of the
> chlorophyll porphyrin ring and an essential cofactor for RuBisCO activation.
> Because Mg²⁺ is phloem-mobile, deficiency presents first on older, lower
> foliage as the plant remobilizes the ion toward active sinks.
>
> **Symptoms.** Interveinal chlorosis on lower leaves progressing acropetally;
> veins remain green; advanced cases show marginal necrosis and upward leaf curl.
>
> **Causes.** (1) Low substrate Mg; (2) cation antagonism — excess K⁺, Ca²⁺, or
> NH₄⁺ suppressing Mg²⁺ uptake; (3) root-zone pH outside 6.0–6.5 (soil) or
> 5.5–6.2 (hydro/coco) inducing lockout; (4) low transpiration limiting mass flow.

This register — mechanism-first, quantified, source-anchored — is the bar.

---

## 7. Graph & tool linkage obligations

Editorially, every article must:

1. Declare its **typed relations** (`knowledge_relations`) — not just generic
   "related", but `causes`, `symptom_of`, `treats`, `antagonist_of`,
   `synergist_of`, `interacts_with` where the science supports it. The Magnesium
   Deficiency node, for example, links: `caused_by → pH Lockout`,
   `antagonist_of → Potassium`, `synergist_of → Calcium (CalMag)`,
   `treats ← CalMag Supplementation`, `interacts_with → Coco Substrate`.
2. Declare relevant **tool links** (`knowledge_tool_links`): deficiency
   diagnosis, nutrient calculator, pH calculator, VPD calculator, as applicable.

---

## 8. Review workflow

Draft → in_review → published, enforced via `knowledge_status` and recorded in
`knowledge_reviews` / `knowledge_versions`:

1. **Agronomic review** — factual accuracy, mechanism correctness, safety.
2. **Source review** — every quantitative claim cited; evidence level adequate.
3. **Language review** — register, terminology, DE/EN parity.
4. **Linkage review** — relations and tool links present and correct.

An article may only be `published` after all four reviews record `approved`.

---

## 9. Governance

- Quarterly terminology audit against `LOCALIZATION.md`.
- Stale-content flagging: articles past their review horizon are re-queued.
- Quality scoring (`knowledge_articles.quality_score`) is a function of source
  strength, structural completeness, and review status, and feeds ranking.
