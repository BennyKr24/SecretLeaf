# Source-Dossier: Blüte (Cultivation Technique, mit diagnostischen Elementen)

Stage: 1 — Research · Datum: 2026-08-21 · Archetyp: Cultivation Technique (HowTo),
Hybridcharakter analog Sämling/Veg — Nährstoffsperre, Ca/Mg-Mangel und
Hermaphroditismus-Früherkennung sind diagnostische Elemente innerhalb eines
sonst prozeduralen Artikels.

Zitierformat: `B#` für neu recherchierte Quellen dieses Dossiers.

**Bereits an anderer Stelle in dieser Session recherchiert und NICHT Teil
dieses Dossiers** (siehe TODO.md "Grow-Rechner — Kalibrierungsaudit
2026-08-21" und die Blütedauer-Redesign-Arbeit): VPD-Zielwert Blüte
(1,0–1,5 kPa, `lib/tools/vpd.ts`), PPFD-Zielbereich Blüte (600–1000
µmol/m²/s, `lib/tools/lighting.ts`), EC-Zielwerte Blüte (`nutrients.ts`:
Erde 2.0/2.4, Coco 2.8/3.2, Hydro 2.2/2.8 mS/cm), Blütedauer (jetzt
genetikabhängig: Indica 42/Hybrid 49/Sativa 70 Tage Kernblüte + 14 Tage
Spätblüte), Stretch-Mechanismus (2–3× Höhenwachstum, sortenabhängig,
ausführlich im Veg-Dossier behandelt). Dieses Dossier fokussiert
ausschließlich auf: Nährstoffumstellung N→P/K, pH-Drift-Mechanismus,
Defoliation-Detailtechnik, Stützstäbe/Trellis, Lichtdichtigkeit/
Hermaphroditismus, Blüte-spezifische Fehlerbilder, Autoflower-Nuancen,
PPFD-Progression innerhalb der Blüte.

## Ziel-Slug-Entscheidung

Kein einzelnes Backlog-Item deckt die ganze Phase ab. `fuetterungsplan-nach-phase`
(#20, Prio 90) kommt der Nährstoffseite am nächsten, deckt aber nicht
Defoliation/Support/Lichtdichtigkeit ab; `lichtspektrum-und-bluete` (#56)
ist enger auf Spektrum fokussiert; `defoliation-entlauben` (#75) ist ein
eigener, phasenübergreifender Deep-Dive. `docs/CONTENT_BACKLOG.md` §5
benennt explizit die Lücke "ein Blüte-Phasen-Tutorial (Lichtumstellung,
Stretch-Phase, Nährstoffwechsel N→P/K)" — konsistent mit der bei Veg
getroffenen Entscheidung trägt dieses Dossier einen neuen, eigenständigen
Phasen-Slug: **`bluetephase-ernaehrung-und-pflege`**. `fuetterungsplan-nach-phase`,
`lichtspektrum-und-bluete`, `defoliation-entlauben` und das bereits
existierende `bud-rot-botrytis` (bestätigt vorhanden in `wiki.ts`, nicht
neu behandelt) werden als `related_topics` referenziert statt dupliziert.

---

## Claim → Source Map

| # | Claim | Wert | Quelle(n) | Evidence-Level | Cannabis-spezifisch? |
|---|-------|------|-----------|:---:|---|
| 1 | Praxis-Konsens-NPK: früh/mittel Blüte ca. 1-3-2, späte Blüte weiter N-reduziert Richtung 0-3-3; graduelle Umstellung über die ersten 2–3 Wochen statt abruptem Wechsel | 1-3-2 → 0-3-3 | B1–B6 (mehrere konsistente Guides) | **1** | Ja |
| 2 | **Kontrollierte Studie (DWC, Gelato-Klone, 100 Einheiten, central-composite Design, ≥5 Wiederholungen/Behandlung):** optimale Konzentration für maximalen Ertrag (144 g/Pflanze) liegt bei N 194 mg/L, P 59 mg/L; **Kalium zeigte im getesteten Bereich 60–340 mg/L KEINE Ertragswirkung** — kommerzielle Empfehlungen von 300–400 mg/L K werden als "wahrscheinlich exzessiv" eingeordnet; keine Cannabinoid-Wirkung durch NPK-Variation gefunden | N 194 mg/L, P 59 mg/L optimal; K ohne Effekt | B8 (*Frontiers in Plant Science*, 2021) | **3–4** (rigoroses kontrolliertes Design) | Ja — Gelato, drogentypnahe Sorte |
| 3 | **Kontrollierte Studie (Growth-Chamber, Utah State University, Hemp-Kultivar 'Trump', n=2 Wiederholungen):** Root-Zone-P bei 25/50/75 mg/L getestet — **kein signifikanter Unterschied in Ertrag oder Cannabinoid-Konzentration** zwischen den Stufen (Ertrag konstant bei 649 ± 41,5 g/m²); Leachate-P stieg dagegen 12-fach bei nur 3-facher Erhöhung des P-Inputs (28→75→~160 mg/L) — überschüssiges P wird schlicht ausgewaschen, nicht genutzt | 25 mg/L bereits ausreichend | B9 (*Frontiers in Plant Science*, PMC9724152) | **3** | Industriehanf/CBD-Kultivar, nicht Drug-Type — Extrapolation |
| 4 | **Industrie-finanzierte kontrollierte Studie (2 Kultivare, 3–4 Wiederholungen):** PK-Zusatzprodukt ("Bulk") erhöhte Blütengewicht/Pflanze (statistisch signifikant bei einem von zwei Kultivaren), **aber keine statistischen Unterschiede bei THC-% oder Gesamtterpenen** zwischen behandelt/unbehandelt | Ertrag ja (1 von 2 Sorten), Potenz/Terpene nein | B7 (RxGreenTechnologies-Herstellerstudie) | **2–3** (kontrolliert, aber Hersteller-finanziert, potenzieller Interessenkonflikt) | Ja |
| 5 | **Zentraler Konflikt:** Die drei kontrollierten Studien (B7, B8, B9) widersprechen dem verbreiteten "hoher P + hoher K = mehr Ertrag UND Potenz"-Marketing von Bloom-Boostern — moderate P-Werte (~25–60 mg/L) sind bereits ausreichend, K zeigt in einer Studie gar keinen Ertragseffekt, und keine der drei Studien fand eine Cannabinoid-Steigerung durch mehr P/K | — | B7, B8, B9 im Vergleich | **3** (Konsens der stärkeren Quellen) | Ja |
| 6 | Calcium-/Magnesiumbedarf steigt in der Blüte an (Protein-/Energiestoffwechsel, Mg erhöht P-Mobilität); Ca-Mangel kann Knospenbildung verlangsamen, verdrehte/kleinere Blüten verursachen; hochdosierte P/K-Blütedünger können Ca/Mg-Aufnahme hemmen, besonders früh in der Blüte (Woche 3–6) | — | B11–B14 (mehrere konsistente Quellen) | **1** | Ja |
| 7 | Ca-Mangel-Symptomatik: rostfarbene, unregelmäßige Flecken auf jungen Blättern, Blattränder rollen sich, keine Vergilbung/grüne Adern bleiben erhalten (Unterscheidung zu Mg-Mangel); Ursache oft nicht reiner Nährstoffmangel, sondern falscher pH, hohe EC, Überwässerung oder Wurzelschaden, die Ca-Transport blockieren | — | B40 (mehrere konsistente Quellen) | **1** | Ja |
| 8 | pH-Drift-Mechanismus Woche 1: Stretch-bedingt steigt der Wasserverbrauch sprunghaft an; Ziel-pH 5,8–6,3 je nach Medium; empfohlene Gegenmaßnahme ist bis zu 15–20 % Runoff beim Gießen, um Salzaufbau und Wurzelzonen-pH-Drift zu vermeiden; in Coco: kleine Gaben ohne Runoff in den ersten 1–2 Tagen zum Aufbau der Substrat-EC, danach höhere Runoff-EC gezielt anstreben, um den Stretch zu bremsen | 5,8–6,3 | B15 (mehrere konsistente Quellen, u.a. Athena — seriöse, wissenschaftlich orientierte Nährstoffmarke) | **1** | Ja |
| 9 | Defoliation-Timing (differenzierter als die bereits bestätigte 20-30%-Regel): zwei Hauptfenster — kurz vor/in den ersten 2 Wochen 12/12 (untere, nicht-produktive Triebe entfernen, Energie nach oben lenken) und Woche 3–4 (große, blütenlichtblockierende Fächerblätter). **Nicht während des aktiven Stretch (Tag 1–21) defoliieren.** | — | B16–B20 (mehrere konsistente Quellen) | **1** | Ja |
| 10 | **"Schedule 2.0"/aggressive Spätblüte-Defoliation — differenzierter Befund als der bisherige TODO-Vermerk nahelegt:** Mid-Flower-Defoliation an Tag 21–25 wird von mehreren Quellen als "mit Forschungsrückhalt" bezeichnet (Bezug meist auf Nebulas informelles Grow-Journal-Experiment, keine peer-reviewte Studie gefunden — als Praxis-Konsens, nicht als Studie zu behandeln). Schwere Defoliation in Woche 6–7 wird dagegen von mehreren Quellen explizit **abgeraten** ("nicht dasselbe wie Mid-Flower-Defoliation"), da die Pflanze die Blattmasse für die finale Reifung braucht und sie nicht mehr ersetzen kann. Nach Tag 25–28 nur noch sanitäre Entfernung (gelbe/tote/schimmlige Blätter) | Grenze Tag 25–28 | B21–B24 (mehrere konsistente, teils widersprüchliche Quellen) | **1** | Ja |
| 11 | Stützsysteme werden nötig, sobald Blüten sichtbar schwer genug werden, um Äste abzuknicken — typischerweise ab Woche 4–5; Trellis-Netting wird idealerweise bereits spät-vegetativ/früh-blühend installiert (vor dem Stretch), zweite Netzlage 8–12 Zoll über der ersten während der Blüte für zusätzliche Stützung schwerer Kolas | Woche 4-6 Installation, Woche 4-5 Bedarf | B25–B29 (mehrere konsistente Quellen) | **1** | Ja |
| 12 | Lichtdichtigkeit/Hermaphroditismus-Risiko: verbreiteter Grower-Konsens sieht bereits geringe Lichteinstrahlung während der Dunkelphase als Stressauslöser für Zwitterbildung ("Bananen") | — | B30 (breiter, aber unbelegter Konsens) | **1**, unbestätigt durch kontrollierte Daten | Ja |
| 13 | **Beobachtungsstudie (n=403 Pflanzen, Indoor-Anbau):** Distanz zur Raumtür als Proxy für Dunkelphasen-Lichtexposition zeigte **keinen praktisch relevanten Zusammenhang** mit Hermaphroditismus-Rate (R²=0,0162 — Modell erklärt nur 1,6 % der Varianz, p=0,00197 statistisch signifikant, aber Effektgröße vernachlässigbar). Autoren selbst räumen ein, dass die tatsächlichen Lichtintensitäten in der Studie vermutlich zu niedrig waren, um "very-low-fluence"-Reaktionen sauber zu testen — **kein belastbarer Schwellenwert ableitbar**, aber auch keine Bestätigung, dass jede minimale Lichteinstrahlung zwangsläufig zu Zwittern führt | R²=0,016 | B32 (*SURG Journal*, University of Guelph) | **2** (Beobachtungsstudie, kein kontrolliertes Design) | Ja |
| 14 | **Einordnung des Konflikts #12/#13:** Der verbreitete "jeder Lichtspalt = Hermie"-Konsens ist durch die einzige auffindbare Studie zu diesem Thema **nicht bestätigt**, aber auch nicht widerlegt (Studiendesign zu schwach für eine klare Antwort). Praktische Konsequenz für den Artikel: die Vorsichtsmaßnahme (Raum abdunkeln) bleibt sinnvoll, da der potenzielle Schaden (verlorene Ernte durch Samenbildung) hoch und die Kosten der Prävention niedrig sind — aber die Behauptung sollte nicht als wissenschaftlich bewiesen dargestellt werden | — | B30 vs. B32 | **1–2** | Ja |
| 15 | Nährstoffsperre (Lockout) bei hoher EC in der Blüte: Symptome ähneln Mangelerscheinungen (Vergilbung, Blattrand-Verbrennung, gebogene Ränder, gestauchtes Wachstum, reduzierte Blütenentwicklung); Ursache ist Salzansammlung in der Wurzelzone, die Nährstoffaufnahme trotz ausreichender/überschüssiger Düngung blockiert; Diagnose über Runoff-pH (außerhalb 6.0–6.8 Erde/5.5–6.5 Hydro) und Runoff-EC | — | B33–B36 (mehrere konsistente Quellen) | **1** | Ja |
| 16 | **Kontrollierte Studie (Hemp-Kultivar 'Queen Dream', vertikale Anbausysteme, n=3 Wiederholungen ×3 Durchläufe):** PPFD 200/400/600 µmol/m²/s über 35 Tage Blüte getestet — CBDAS-Genexpression und Gesamt-CBD steigen linear im gesamten Bereich, +36,88 % Gesamt-CBD bei 600 vs. 200 µmol/m²/s, CBD-Ertrag/Pflanze +248 % von 200→400; Autoren vermuten weiteren Nutzen oberhalb 600 unerforscht | +36,88% CBD bei 600 vs 200 | B37 (peer-reviewed, PMC12583074) | **3** | Hemp-Kultivar, nicht Drug-Type — Extrapolation, aber Richtung konsistent mit dem bereits verifizierten 600–1000-µmol-Zielbereich |
| 17 | Autoflower-Blüte: Übergang genetisch fixiert, nicht photoperiodenausgelöst — Lichtzyklus kann während der gesamten Autoflower-Lebensspanne unverändert bleiben (18/6 als verbreiteter Standard, 20/4 und 24/0 ebenfalls gängig); keine Notwendigkeit einer Lichtumstellung wie bei photoperiodischen Pflanzen | — | B38 (mehrere konsistente Quellen) | **1** | Ja |
| 18 | Rust-Spot/Ca-Mangel-Erscheinungen speziell auf jungen Blüte-Blättern werden oft mit Kaliummangel oder generellem "Blüte-Stress" verwechselt — korrekte Differenzierung erfordert pH-/EC-Runoff-Check vor Nährstoffkorrektur, da viele Ca-Symptome Wurzelzonen- statt Dosierungsprobleme sind (siehe Claim 7) | — | B40 | **1** | Ja |

---

## Quellenregister

**B1–B6 — Level 1, mehrere konsistente Quellen.** NPK-Blüte-Richtwerte:
cannabis.net, "NPK Ratios for Growing Weed",
https://cannabis.net/blog/how-to/do-you-know-your-npk-ratios-for-growing-weed-best-ratio-of-nitrogen-potassium-and-phosphorus-fo ;
Zamnesia, "NPK: Best Ratio", https://www.zamnesia.com/us/grow-weed/308-npk-ratios ;
Hey Abby, "Cannabis Nutrients Explained", https://heyabby.com/blogs/articles/cannabis-nutrients-explained ;
HowToGrowMarijuana, "Best NPK Ratio for Each Growth Stage",
https://howtogrowmarijuana.com/npk-fertilizer-ratio/ ; Veriheal, "Best
Cannabis Fertilizer Guide", https://www.veriheal.com/blog/npk-ratios-for-cannabis-fertalizers-understanding-the-balance/ ;
Autoseeds, "Cannabis NPK ratios explained", https://www.autoseeds.com/cannabis-npk-ratios-explained/ ;
Azarius, "Cannabis Nutrients NPK Guide", https://www.azarius.com/wiki/cultivation/cannabis/cannabis-nutrients-npk-guide ;
Thunderbird Disco, "How Often to Fertilize Flowering Marijuana Plants",
https://www.thunderbirddisco.com/blog/how-often-to-fertilize-flowering-marijuana ;
MSNL Seeds, "Cannabis NPK: Best Ratio", https://www.msnlseeds.com/blog/cannabis-npk-the-best-ratio-for-each-stage/
**Für Artikel:** Praxis-Richtwert 1-3-2→0-3-3, graduelle Umstellung (Block 5, 10).

**B7 — Level 2–3, kontrollierte Herstellerstudie (Interessenkonflikt
beachten).** RX Green Technologies, "Bulk PK Booster Cannabis Research
Study", https://www.rxgreentechnologies.com/rxgt_trials/bulk-trial/
**Für Artikel:** Ertrag ja, Potenz/Terpene nein — zentraler Beleg für die
Ertrag-vs-Qualität-Unterscheidung bei PK-Zusätzen (Block 6).

**B8 — Peer-reviewed, Level 3–4 (central-composite-Design, kontrolliert,
≥5 Wiederholungen, 100 Einheiten).** "Optimisation of Nitrogen,
Phosphorus, and Potassium for Soilless Production of Cannabis sativa in
the Flowering Stage Using Response Surface Analysis". *Frontiers in Plant
Science*, 2021. https://pmc.ncbi.nlm.nih.gov/articles/PMC8635921/
**Für Artikel:** Kern-Gegenbeleg zum P/K-Bloom-Booster-Narrativ — K ohne
Ertragswirkung im getesteten Bereich, moderates P optimal (Block 6,
zentraler Konflikt).

**B9 — Peer-reviewed, Level 3 (kontrollierte Growth-Chamber-Studie, Utah
State University, n=2).** "Sustainable Cannabis Nutrition: Elevated
root-zone phosphorus significantly increases leachate P and does not
improve yield or quality". *Frontiers in Plant Science*, 2022.
https://pmc.ncbi.nlm.nih.gov/articles/PMC9724152/
**Für Artikel:** Bestätigt B8 unabhängig — höheres P wird nur ausgewaschen,
nicht genutzt (Block 6).

**B10 — Level 1, Diskussionsforum.** Rollitup, "Bloom boosters: BS or
Necessity?", https://www.rollitup.org/t/bloom-boosters-bs-or-necessity.1022555/
**Für Artikel:** Praxis-Meinungsspektrum als Kontrastfolie zu B7–B9.

**B11–B14 — Level 1, mehrere konsistente Quellen.** Ca/Mg-Bedarf Blüte:
Herb.co, "Fix Calcium & Magnesium Deficiency",
https://herb.co/guides/how-to-fix-calcium-magnesium-deficiency-in-cannabis-plants ;
Greenhouse Grower, "A Physiological Approach to Nutrition in Flowering
Cannabis", https://www.greenhousegrower.com/production/a-physiological-approach-to-nutrition-in-flowering-cannabis/ ;
MJ Seeds Canada, "Understanding Flowering Cal Mag Deficiency",
https://www.mjseedscanada.ca/understanding-flowering-cal-mag-deficiency/ ;
RQS, "Cal-Mag for Cannabis", https://www.royalqueenseeds.com/us/blog-cal-mag-for-cannabis-all-you-need-to-know-n1530
**Für Artikel:** Ca/Mg-Bedarfsanstieg, Interaktion mit hoher P/K-Düngung
(Block 6).

**B15 — Level 1, mehrere konsistente Quellen, darunter eine
wissenschaftlich orientierte Nährstoffmarke.** Athena Agriculture,
"Cannabis Flowering Stage: Buds, VPD & Harvest",
https://www.athenaag.com/blog/cannabis-flowering-stage ; Grow Sensor,
"Cannabis Flowering Stage Week by Week",
https://growsensor.co/post/cannabis-flowering-stage-week-by-week-expert-guide ;
SEED BANK, "The Flowering Stretch",
https://www.seedbank.com/the-flowering-stretch-managing-explosive-growth-in-week-1-3/ ;
Alchimia, "pH and Cannabis", https://www.alchimiaweb.com/blogen/ph-marijuana/
**Für Artikel:** pH-Drift-Mechanismus Woche 1, Runoff-Strategie (Block 8).

**B16–B20 — Level 1, mehrere konsistente Quellen.** Defoliation-Timing:
Biology Insights, "When to Trim Fan Leaves",
https://biologyinsights.com/when-to-trim-fan-leaves-on-weed-plants/ ;
Vivosun, "Defoliation During Vegetative and Flowering Stage",
https://vivosun.com/growing_guide/defoliation-during-the-vegetative-stage/ ;
GrowWeedEasy, "Defoliation Deep Dive",
https://www.growweedeasy.com/nebulas-flowering-stage-defoliation-tutorial ;
BudTrainer, "How to Defoliate Cannabis",
https://www.budtrainer.com/blogs/learn/defoliating ; 2FastBuds, "The
Importance of Cannabis Fan Leaves", https://2fast4buds.com/news/the-importance-of-cannabis-fan-leaves
**Für Artikel:** Zwei-Fenster-Modell, Stretch-Sperrzeit (Block 5, 9).

**B21–B24 — Level 1, mehrere konsistente, teils divergierende Quellen.**
Späte Defoliation: Hypno Seeds, "When to Defoliate Weed",
https://hypnoseeds.com/the-blog/when-to-defoliate-weed/ ; Grow Sensor,
"Expert Guide to Cannabis Defoliation",
https://www.growsensor.co/post/how-to-defoliate-cannabis-for-bigger-yields-expert-guide ;
GrowWeedEasy, "Nebula's Defoliation Experiment" (informelles
Grow-Journal, keine Studie),
https://www.growweedeasy.com/nebulas-cannabis-defoliation-experiment-side-by-side-grow-journal ;
Seeds Genetics Co, "Strategic Defoliation Techniques",
https://seedsgenetics.us/blog/strategic-defoliation-techniques-during-cannabis-flowering/ ;
Sativa University, "Defoliation in Cannabis",
https://sativauniversity.com/learn/defoliation-in-cannabis/
**Für Artikel:** "Schedule 2.0"-Einordnung, Tag-25–28-Grenze (Block 5, 9,
11 — wichtiger Präzisierungspunkt ggü. dem bisherigen TODO-Vermerk).

**B25–B29 — Level 1, mehrere konsistente Quellen.** Stützsysteme: Sensi
Seeds, "Cannabis Trellis: How to Stake Plants",
https://sensiseeds.com/en/blog/cannabis-trellis-and-plant-support-indoor-and-outdoor-guide/ ;
Kannabia, "Taming Green Monsters",
https://www.kannabia.com/blog/taming-green-monsters-trellising-staking-techniques-protect-cannabis-plants-from-gravity ;
Weedmaps, "What is Trellising?", https://weedmaps.com/learn/the-plant/trellising ;
RQS, "The Art of Cannabis Trellising",
https://www.royalqueenseeds.com/blog-the-art-of-cannabis-trellising-n908 ;
454bags, "Canopy Control with Trellis Netting",
https://454bags.com/blogs/grow-room-education/canopy-control-with-trellis-netting
**Für Artikel:** Stützsystem-Vergleich, Installations-Timing (Block 5, 8).

**B30 — Level 1, breiter unbelegter Konsens.** Hey Abby, "Why You Should
Prevent Light Leaks", https://heyabby.com/blogs/articles/preventing-light-leaks-in-grow-tents ;
StratCann, "Debunking the Light Leak Myth",
https://stratcann.com/insight/growing-cannabis-debunking-the-light-leak-myth/ ;
Perfect Gardens, "Why Your Cannabis Plants Freak Out from a Crack of
Light", https://www.perfectgardens.com/blogs/news/why-your-cannabis-plants-freak-out-from-just-a-crack-of-light
**Für Artikel:** Praxis-Konsens als Ausgangspunkt, dann relativiert durch
B32 (Block 11, 12).

**B32 — Beobachtungsstudie, Level 2.** "Investigating the Effects of Dark
Period Light Exposure on Sex Expression In Female *Cannabis sativa*".
*SURG Journal*, University of Guelph.
https://journal.lib.uoguelph.ca/index.php/surg/article/view/7697
**Für Artikel:** Wichtigste Einzelquelle dieses Dossiers — relativiert den
Lichtleck-Hermaphroditismus-Konsens, ohne ihn zu widerlegen (Block 11, 12
— zentraler Konflikt, ehrlich als "Studie zu schwach für klare Antwort"
kennzeichnen, NICHT als "Lichtlecks sind harmlos" fehlinterpretieren).

**B33–B36 — Level 1, mehrere konsistente Quellen.** Nährstoffsperre:
Atami, "Nutrient Lockout Cannabis Guide", https://atami.com/en-zaf/blog/cultivation/nutrient-lockout-cannabis-guide ;
Athena Agriculture, "Cannabis Nutrient Lockout",
https://www.athenaag.com/blog/cannabis-nutrient-lockout ; Atlas
Scientific, "How To Fix And Prevent Nutrient Lockout",
https://atlas-scientific.com/blog/nutrient-lockout/ ; RQS, "How to
Prevent and Treat Nutrient Lockout",
https://www.royalqueenseeds.com/us/blog-how-do-you-prevent-and-treat-nutrient-lockout-in-cannabis-n665
**Für Artikel:** Lockout-Symptomatik, Diagnose über Runoff (Block 7, 15).

**B37 — Peer-reviewed, Level 3 (kontrolliert, n=3×3 Durchläufe).** "High
light intensity enhances cannabinoid biosynthesis through concerted gene
expression in hemp (*Cannabis sativa*) flowers".
https://pmc.ncbi.nlm.nih.gov/articles/PMC12583074/
**Für Artikel:** Bestätigt und untermauert den bereits verifizierten
PPFD-Zielbereich mit einem konkreten Wirkmechanismus (Block 2, 6).

**B38 — Level 1, mehrere konsistente Quellen.** Autoflower-Blüte: ILGM,
"Autoflower Light Schedule", https://ilgm.com/resources/guides/autoflower-light-schedule ;
2FastBuds, "Best Light Schedule for Autoflowers",
https://2fast4buds.com/news/best-light-schedule-for-autoflowers ;
CannaConnection, "Best Light Cycle for Autoflowering",
https://www.cannaconnection.com/blog/1103-how-much-light-autoflowering-plants
**Für Artikel:** Photoperioden-Unabhängigkeit, praktische Konsequenz
(Block 12).

**B40 — Level 1, mehrere konsistente Quellen.** Ca-Mangel-Symptomatik:
Zamnesia, "Prevent & Fix Cannabis Calcium Deficiency",
https://www.zamnesia.com/us/grow-weed/524-prevent-fix-cannabis-calcium-deficiency ;
GrowWeedEasy, "How to Fix Calcium Deficiency",
https://www.growweedeasy.com/cannabis-plant-problems/calcium-deficiency ;
Grow With Jane, "Calcium Deficiency and Toxicity",
https://growithjane.com/cannabis-calcium-deficiency-and-toxicity/
**Für Artikel:** Rust-Spot-Symptomatik, Abgrenzung zu Mg-Mangel, häufige
Fehldiagnose-Ursachen (Block 7, 18).

*(Hinweis: ein biorxiv-Preprint zu "Night-time Disruption" wurde
identifiziert, aber wegen HTTP-429-Rate-Limit nicht erfolgreich
abgerufen — nicht als Quelle verwendet, um keine ungeprüften Zahlen zu
zitieren.)*

---

## Themenübersicht: Der P/K-Bloom-Booster-Konflikt (Kernstück dieses Dossiers)

Analog zum Topping-Konflikt im Veg-Dossier gibt es hier eine **überraschend
konsistente Gegenevidenz zu einem weit verbreiteten Marketing-Narrativ**:

| Studie | Kultivar | Getestet | Ergebnis |
|---|---|---|---|
| B8 (2021, DWC) | Gelato (Drug-Type-nah) | N 70–290, P 20–100, K 60–340 mg/L | Optimum N 194/P 59 mg/L; **K ohne Ertragswirkung im ganzen Bereich**; keine Cannabinoid-Wirkung |
| B9 (2022, Growth Chamber) | 'Trump' (CBD-Hemp) | P 25/50/75 mg/L | **Kein Unterschied** in Ertrag/Cannabinoiden — 25 mg/L bereits ausreichend, Rest wird ausgewaschen |
| B7 (Herstellerstudie) | Chem Brulee, Quattro Kush | PK-Zusatzprodukt vs. Kontrolle | Ertrag ja (1 von 2 Sorten), **THC/Terpene unverändert** |

**Einordnung für den Artikel:** Drei unabhängige kontrollierte
Untersuchungen — trotz unterschiedlicher Kultivare, Methoden und
Geldgeber — kommen zum selben Kernschluss: Ertrag lässt sich mit
moderater P-Düngung erreichen, zusätzliches P/K über ein moderates Maß
hinaus verbessert weder Ertrag noch Potenz/Terpene messbar. Das steht im
Spannungsverhältnis zum kommerziellen "mehr Bloom-Booster = mehr
Ertrag+Potenz"-Narrativ. Für den Artikel heißt das: die bereits im
Nährstoff-Rechner hinterlegten EC-Zielwerte sind der verlässlichere
Hebel als teure Zusatzprodukte — sollte klar, aber ohne
Herstellerbashing kommuniziert werden.

---

## Offene Konflikte / dünne Evidenzlage

1. **P/K-Bloom-Booster-Konflikt** (siehe Themenübersicht oben) — gut
   belegt, sollte im Artikel prominent, aber differenziert dargestellt
   werden (B7 zeigt immerhin einen Ertragseffekt bei einer Sorte, auch
   wenn nicht bei Potenz).
2. **Lichtdichtigkeit/Hermaphroditismus** — der verbreitete Praxis-Konsens
   (B30) ist durch die einzige auffindbare Studie (B32) weder bestätigt
   noch widerlegt; Studiendesign zu schwach (Beobachtungsstudie, zu
   niedrige tatsächliche Lichtintensitäten). **Im Artikel als "Vorsicht
   bleibt sinnvoll, aber nicht wissenschaftlich streng bewiesen"
   behandeln** — nicht als "Mythos entlarvt" fehldarstellen, das wäre
   eine Überinterpretation der schwachen Studienlage.
3. **"Schedule 2.0"/aggressive Spätblüte-Defoliation** — differenzierter
   als der bisherige TODO-Vermerk: Mid-Flower-Defoliation (Tag 21–25) hat
   breiten Praxis-Rückhalt (aber keine peer-reviewte Studie gefunden,
   nur ein informelles Grow-Journal-Experiment als meistzitierte
   "Quelle"); echte Spätblüte-Defoliation (Woche 6–7) wird dagegen von
   mehreren Quellen aktiv abgeraten. Die bestehende App-Task-Formulierung
   ("Woche 3", 20-30%) liegt im unproblematischen, gut gestützten
   Fenster — kein Korrekturbedarf, aber der Artikel sollte die Tag-25–28-
   Grenze als zusätzliche Präzisierung liefern.
4. **B7 (Bulk-PK-Studie) ist herstellerfinanziert** — Ergebnis (Ertrag ja,
   Potenz nein) wird durch die beiden unabhängigen akademischen Studien
   (B8, B9) gestützt, mindert aber nicht das grundsätzliche
   Interessenkonflikt-Risiko; im Artikel transparent als
   Industriestudie kennzeichnen.
5. **PPFD-Cannabinoid-Studie (B37) ist Hemp-Kultivar, nicht Drug-Type** —
   wie bei den Kalibrierungsaudit-Funden zu VPD/PPFD bereits Muster:
   robuste Studienlage existiert fast ausschließlich für Industriehanf,
   Übertragung auf Freizeitsorten ist eine Extrapolation, wenn auch mit
   konsistenter Richtung.

---

## Abgleich mit aktuellem App-Text (`phases.ts`, Stand 2026-08-21)

| App-Task | Aktueller Text | Abgleich mit Recherche |
|---|---|---|
| Licht auf 12/12 (Tag 0) | "Blüteeinleitung für photoperiodische Pflanzen. Lichtdichtigkeit des Grow-Raums prüfen!" | **Vorsichtsmaßnahme bestätigt sinnvoll**, aber die implizite Kausalität (Lichtleck→Hermie) ist wissenschaftlich schwächer belegt, als der Praxis-Konsens suggeriert (siehe Konflikt #2). Kein Korrekturbedarf am Task selbst — die Vorsicht bleibt richtig, auch wenn die Beweislage dünn ist. |
| Nährstoffe umstellen (Tag 3) | "Weniger Stickstoff (N), mehr Phosphor (P) und Kalium (K). EC langsam auf Zielwert steigern." | **Richtung bestätigt**, aber die Kalium-Komponente ist durch B8 nuanciert — K trägt laut der stärksten verfügbaren Studie im getesteten Bereich nicht zum Ertrag bei. Kein Fehler im knappen App-Text, aber der Artikel kann hier eine differenziertere, evidenzbasierte Einordnung liefern, die die App bewusst nicht leistet. |
| pH-Drift Woche 1 (Tag 7) | "Erhöhter Wasserverbrauch kann den Substrat-pH verschieben. Ablauf-EC täglich messen." | **Bestätigt und mechanistisch untermauert** (Stretch-bedingter Wasserverbrauchsanstieg, siehe Block 8). Kein Korrekturbedarf. |
| Defoliation Woche 3 (Tag 21) | "Große, das Blütenlicht blockierende Blätter entfernen. Nur 20–30 % der Blattmasse entnehmen." | **Bestätigt, liegt im gut gestützten Zeitfenster** (Tag 21–25 laut B21–B24). Kein Korrekturbedarf. |
| Stützstäbe Woche 5 (Tag 35) | "Schwere Blütenstände abstützen damit Äste nicht brechen. Jo-Jo-Seile oder Bambusstäbe nutzen." | **Bestätigt**, deckt sich mit dem recherchierten Bedarfsfenster (Woche 4–5, B25–B29). Ergänzungspotenzial: Trellis-Netting als dritte Methode neben Jo-Jo/Bambus, idealerweise schon vor dem Stretch installiert statt erst in Woche 5 reagiert. |

**Fazit:** Wie bei den Vorgänger-Phasen sind die App-Texte durchgängig
bestätigt, kein Korrekturkandidat wie beim LST-Timing im Veg-Dossier.
Der Mehrwert liegt in der Nährstoff-Nuance (P/K-Bloom-Booster-Konflikt),
der ehrlichen Relativierung des Lichtleck-Hermaphroditismus-Narrativs und
der genaueren Defoliation-/Support-Zeitfenster-Differenzierung.

---

## Geschätzte Kennzahlen für später

**Quellenzahl:** 18 Claim-Einträge, gestützt auf **~45 eigenständige neue
Quellen** (B1–B40, mehrere Sammelverweise) — im Rahmen der bisherigen
Dossier-Tiefe (Keimung 18, Sämling 22, Veg ~50).

**Evidence-Level-Spektrum:** 1–4. **Vier kontrollierte/beobachtende
Cannabis-relevante Studien** (B7 industriefinanziert, B8/B9 akademisch
rigoros, B37 akademisch, B32 Beobachtungsstudie) — zweitstärkste
Studienlage der Reihe nach Veg, mit dem zusätzlichen Wert, dass B8/B9
einem verbreiteten Marketing-Narrativ widersprechen statt es zu
bestätigen.

**Confidence-Score-Schätzung** (Formel aus SOURCE_REQUIREMENTS.md §4):
- Evidence-Stärke: mean-Level ≈ 1,3/5 (viele Level-1-Praxiskonsens-Claims
  neben den vier stärkeren Studien) → 0,40 × (1,3/5) ≈ **0,10**.
- Source-Adequacy: ~45 Quellen von 3 geforderten → gedeckelt bei 1,0;
  breite Streuung → 0,20 × 1,0 = **0,20**.
- Consistency: solide Übereinstimmung bei den meisten Themen, aber zwei
  benannte, substanzielle Konflikte (P/K-Booster-Narrativ,
  Lichtleck-Hermaphroditismus-Beweislage) → geschätzt ~0,7 → 0,20 × 0,7 =
  **0,14**.
- Freshness: alle Quellen aktuell (2021–2026) → 1,0 → 0,20 × 1,0 =
  **0,20**.
- **Geschätzte Gesamt-Confidence: ≈ 0,64.**

Das liegt **über der Publikationsschwelle für Cultivation-Technique-
Artikel** (min. 0,60, min. 3 Quellen, min. Top-Evidence-Level 2 — hier
mit B8/B9/B37 klar auf Level 3 erfüllt). Anders als beim Veg-Dossier gibt
es **keinen App-Text-Korrekturkandidaten**, aber zwei Stellen, an denen
der Artikel verbreiteten Konsens wissenschaftlich einordnen sollte, statt
ihn unkritisch zu übernehmen (P/K-Booster-Wirksamkeit,
Lichtleck-Hermaphroditismus-Beweislage) — beide sollten in Stage 2 (Draft)
mit der gebotenen Vorsicht behandelt werden: relativieren, nicht
widerlegen.
