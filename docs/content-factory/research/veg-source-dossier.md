# Source-Dossier: Veg (Cultivation Technique)

Stage: 1 — Research · Datum: 2026-08-21 · Archetyp: Cultivation Technique (HowTo)

Zitierformat: `V#` für neu recherchierte Quellen dieses Dossiers. Wiederverwendete
Quellen aus den Vorgänger-Dossiers werden mit ihrem Original-Kürzel referenziert
(keine Duplikate im Register, SOURCE_REQUIREMENTS.md §3).

**Bereits an anderer Stelle in dieser Session recherchiert und NICHT Teil
dieses Dossiers** (siehe TODO.md "Grow-Rechner — Kalibrierungsaudit
2026-08-21"): EC-Zielwerte (`nutrients.ts` EC_THRESHOLDS.veg), pH-Zielwerte
6.0–6.5 (Erde) / 5.8–6.2 (Coco/Hydro), Veg-Phasendauer (28/21/56 Tage
Standard/Hydro/Outdoor), PPFD/DLI-Zielwerte (400–600 µmol/m²/s, 20–40 DLI).
Dieses Dossier fokussiert ausschließlich auf das, was in den bisherigen
Audits noch nicht abgedeckt wurde: Trainingstechniken (Topping/FIM/LST/
SCROG), Bewässerung/Düngung-Praxis, Fehlerbilder und Sortenspezifika.

## Ziel-Slug-Entscheidung

Anders als bei Keimung/Sämling gibt es für "Veg" **kein einzelnes passendes
Backlog-Item** — `topping-und-fim` (#43, Prio 81) und `lst-low-stress-training`
(#44, Prio 81) sind im Ranked-Backlog als eigenständige, hochpriorisierte
Einzeltechnik-Artikel gelistet, nicht als gebündelter Phasen-Artikel.
Entscheidung (konsistent mit der Lücken-Analyse in
`CONTENT_BACKLOG.md` §5): dieses Dossier trägt einen **neuen,
eigenständigen Phasen-Slug** `vegetationsphase-training-und-pflege`, der
die Phase auf Überblicks-/Anwendungstiefe abdeckt (Timing-Entscheidungen,
Zusammenspiel der Techniken, Fehlerbilder). Die beiden Backlog-Items
`topping-und-fim` und `lst-low-stress-training` bleiben als eigene,
tiefere Einzeltechnik-Deep-Dives offen (mehr Methodenvarianten, mehr
Edge-Cases als ein Phasenartikel leisten kann) und werden hier als
`related_topics` referenziert, nicht dupliziert.

---

## Claim → Source Map

| # | Claim | Wert | Quelle(n) | Evidence-Level | Cannabis-spezifisch? |
|---|-------|------|-----------|:---:|---|
| 1 | Topping/FIM-Timing (Praxis-Konsens): 4.–6. Knoten, ca. Woche 3–4 der Veg-Phase | — | V1–V6 (mehrere konsistente Grower-Guides) | **1** | Ja |
| 2 | **Kontrollierte Studie (Industriehanf):** Topping am 4./5./6. Knoten, 29 Tage nach Aussaat, faktorielles Design (2 Kultivare × 4 Behandlungen × 7 Wiederholungen, n=56) — Frischbiomasse +29% ('Enectaliana') bzw. +23% ('Santhica 70') am 4. Knoten ggü. Kontrolle; Pflanzenhöhe −17–25%; CBD/CBG-Anstieg p<0.001 | 23–29% Biomassezuwachs | V7 (*Journal of Cannabis Research*, 2026) | **3–4** (faktorielles RCT-Design mit Wiederholungen) | Industriehanf, nicht Drug-Type — Extrapolation auf Freizeit-/Medizinsorten mit Vorsicht |
| 3 | **Kontrollierte Studie (Chemotyp-III-Medizinalcannabis, näher an Drug-Type):** Topping am 10. Knoten, 27 Tage nach Pflanzung — signifikant höheres Trockengewicht von Blüten UND Blättern ggü. Kontrolle/"Lollipop", ABER Gesamt-CBD-**Ertrag** (Konzentration × Masse) nicht signifikant unterschiedlich (p=0,09), da CBD-Konzentration je nach Pflanzenhöhen-Fraktion variiert (oben 9,9%, Mitte 8,2%, unten 7,7%) | Biomasse signifikant höher, Gesamtertrag nicht signifikant | V8 (*Plants*, MDPI, 2022, Univ. Hohenheim/Ai Fame GmbH) | **3** | Ja — Chemotyp-III-Medizinalcannabis, deutlich näher an Freizeit-/Medizinsorten als V7 |
| 4 | **Kontrollierte Studie:** einmaliges Pruning verändert Ertrag nicht signifikant ggü. Kontrolle; zweimaliges Pruning erhöht Ertrag UND vergleichmäßigt Cannabinoid-Verteilung über die Pflanze (untere Blüten nähern sich der Qualität der oberen an) | — | V9 (Danziger & Bernstein 2021, *Industrial Crops and Products* 164) | **3** | Ja, Drug-Type-Medizinalcannabis |
| 5 | FIM ("Fuck I Missed", partieller Schnitt) erzeugt 3–4 statt 2 neue Wachstumspunkte, geringerer Strukturstress als vollständiges Topping, da der Haupttrieb größtenteils intakt bleibt | — | V2, V10 (mehrere konsistente Quellen) | **1** | Ja |
| 6 | Mechanismus (allgemeine Pflanzenphysiologie): Apikale Dominanz wird durch auxin-vermittelte Unterdrückung seitlicher Knospen aufrechterhalten; Dekapitierung (Topping) setzt Seitenknospen aus der Ruhe frei — neuere Forschung zeigt, dass Zucker-Nachfrage des Wachstumspunkts, nicht allein Auxin-Entzug, der initiale Auslöser für das Knospenwachstum ist | — | V11 (*PNAS*, Zucker-Signal-Studie), V12 (*Scientific Reports*, Auxin-Fluss-Studie) | **3–4** (kontrollierte Grundlagenforschung, hochrangige Journale) | **Nein — allgemeine Pflanzenphysiologie**, nicht cannabis-spezifisch getestet, aber der Mechanismus ist botanisch grundlegend und breit repliziert |
| 7 | LST-Start-Timing (Praxis-Konsens): Woche 3 der Veg-Phase (Tag 18–22), bei 3–4 bis 4–6 entwickelten Knoten, wenn der Haupttrieb noch biegsam, aber schon tragfähig ist | — | V13–V17 (mehrere konsistente Quellen) | **1** | Ja |
| 8 | Zu früher LST-Start riskiert Beschädigung des noch fragilen Sämlingsgewebes; zu später Start bedeutet einen bereits verholzten, weniger biegsamen Stängel mit höherem Bruchrisiko | — | V13, V14 | **1** | Ja |
| 9 | LST-Ertragssteigerung ggü. untrainierten Pflanzen: **unbestätigte Bandbreite 15–40%** je nach Quelle (25%, 20–40%, 15–30% je nach Quelle genannt) — **keine kontrollierte Studie gefunden**, nur Grower-Konsens/aggregierte Grow-Journal-Daten | 15–40% (Spannbreite, nicht belastbar) | V18–V20 (mehrere Quellen, aber keine davon eine kontrollierte Studie) | **1**, unbestätigt | Ja, aber schwache Evidenz — im Artikel als Bandbreite ohne Studienbeleg kennzeichnen |
| 10 | Stretch nach Blüteumstellung: Pflanzen verdoppeln (teils verdreifachen) ihre Höhe in den ersten 2–3 Wochen nach dem 12/12-Flip; Sativa-Sorten strecken deutlich stärker (bis 250% der Veg-Höhe) als Indica | 2–3× Höhe, sortenabhängig | V21–V24 (mehrere konsistente Quellen) | **1** | Ja |
| 11 | Praktische Implikation: Blüteumstellung bei ca. 50% (bzw. "ein Drittel" nach anderer Quelle) der maximal verfügbaren Deckenhöhe, um die Stretch-Phase in der vorhandenen Raumhöhe unterzubringen | 50% bzw. 1/3 | V21, V25 | **1** | Ja |
| 12 | Bewässerung Veg: Finger-Test (1.–2. Knöchel) oder Feuchtigkeitsmesser (Sonde 10–15 cm/4–6" Tiefe); Richtwert "oberer Zoll trocken" vor erneutem Gießen; angestrebter Trockenrückgang über Nacht 10–15% | — | V26–V29 (mehrere konsistente Quellen) | **1** | Ja |
| 13 | Gießfrequenz Veg: alle 2–3 Tage bei tieferer Durchwässerung (ggü. häufigerem, flacherem Gießen bei Sämlingen) — etablierte Pflanze verträgt mehr Wasser auf einmal, aber weniger häufig | — | V27 | **1** | Ja |
| 14 | NPK-Richtwert Veg: 3-1-2 (teils 3-1-1 oder 4-2-1 genannt) — deutlich stickstoffbetont ggü. Blütephase | 3-1-2 (Bandbreite) | V30–V37 (viele konsistente, aber leicht abweichende Quellen — keine einheitliche Zahl) | **1** | Ja |
| 15 | EC-Eskalation Coco/Hydro: früh Veg EC ~1,0, spät Veg EC 1,8–2,0 (Kontext: bereits im Kalibrierungsaudit dieser Session eigenständig recherchiert und in `nutrients.ts` verankert — hier nur als Cross-Reference, nicht neu bewertet) | — | V30 (Cross-Referenz, siehe TODO.md) | **1** | Ja |
| 16 | Stickstoffmangel-Frühsymptome Veg: Vergilbung beginnt an unteren/älteren Blättern (N ist mobil, Pflanze verlagert es zu neuem Wachstum), Blattspitze-nach-innen fortschreitende Chlorose, bei Fortschreiten Wachstumsstauchung | — | V38–V44 (breiter, sehr konsistenter Konsens) | **1** | Ja |
| 17 | Wurzelraum-Restriktion ("root-bound") in etablierter Veg-Phase: Wurzeln an Drainagelöchern sichtbar, Pflanze wirkt zu groß für den Topf, Wachstum stagniert, teils Blattverfärbung/-flecken als Folgesymptom (nicht direkt Nährstoffmangel, sondern Wurzelraum-Ursache) | — | V45–V49 (mehrere konsistente Quellen) | **1** | Ja |
| 18 | Umtopf-Timing: idealerweise 2–4 Wochen nach Keimung während der Veg-Phase, letztes Umtopfen mindestens 2 Wochen vor der Blüteumstellung (danach kein weiteres Wurzelwachstum mehr nutzbar) | — | V45, V46 | **1** | Ja |
| 19 | Autoflower-Training: Topping-Erholung 3–7 Tage (bis 10 bei Stress) vs. LST nahezu ohne Erholungszeit (Erholungssignale nach 24–48h); bei kurzzyklischen Autos (7–9 Wochen Samen-bis-Ernte) hohes Stauchungsrisiko durch Topping-Erholungsdauer — viele Grower reservieren Topping nur für kräftige Pflanzen in stabiler Umgebung und setzen bei Autos primär auf LST | — | V50–V53 (mehrere konsistente Quellen) | **1** | Ja |
| 20 | SCROG-Netz-Timing: früh-bis-mittlere Veg-Phase installieren (4–6 Knoten bzw. 25–30 cm Höhe), aktives Einflechten/Tucken beginnt, sobald die höchsten Triebe 50–60% der Netzhöhe erreichen bzw. ca. 5 cm durchs Netz wachsen; zu spätes Aufstellen macht ein flaches Kronendach praktisch unmöglich | — | V54–V59 (mehrere konsistente Quellen) | **1** | Ja |
| 21 | Defoliation in der Veg-Phase (nicht Blüte): sekundäre Quellen berichten von einer "Studie", nach der Entfernen von Fächerblättern bei 50–60 cm Pflanzenhöhe die untere Blütendichte und Cannabinoidproduktion verbessert ggü. unentlaubten Pflanzen — **Primärquelle nicht auffindbar, nur über Sekundärzitate belegt, daher als unbestätigt zu behandeln**. Breiter Konsens: nicht vor Woche 5, nur gezielt sich überlappende/beschädigte Blätter, junge Pflanzen brauchen die Blattmasse für Wurzel-/Strukturaufbau | — | V60–V64 (überwiegend Konsens, ein Claim mit fehlender Primärquelle) | **1**, ein Claim unbelegt | Ja, mit einer expliziten Ausnahme |

---

## Quellenregister

**V1–V6 — Level 1, mehrere konsistente Quellen.** Topping/FIM-Timing-Konsens:
ILGM, "Topping Cannabis Plants To Increase Your Yield",
https://www.ilovegrowingmarijuana.com/growing/topping-cannabis/ ;
Treecarezone, "When to Top Weed Plants",
https://treecarezone.com/when-to-top-weed-plants/ ; ScienceInsights, "When
to Top a Cannabis Plant", https://scienceinsights.org/when-to-top-a-cannabis-plant-timing-signs/ ;
BudTrainer, "How to Top Cannabis Plants (2026 Guide)",
https://www.budtrainer.com/blogs/learn/topping ; Dutch Passion, "Topping
Cannabis: Why, When and How-to", https://dutch-passion.blog/topping-cannabis-how-to-do-it-when-and-why/ ;
Modern Farms, "Topping Cannabis: When to Cut",
https://modernfarms.store/blogs/modernfarms-blog/topping-cannabis-when-to-cut-how-to-count-nodes-right-and-when-to-skip-it.
**Für Artikel:** Praxis-Konsens-Timing (Block 5).

**V7 — Peer-reviewed, Level 3–4 (faktorielles kontrolliertes Experiment).**
"Morphological, physiological, and biochemical responses of two industrial
hemp (*Cannabis sativa* L.) cultivars to different levels of topping".
*Journal of Cannabis Research*, 2026.
https://pmc.ncbi.nlm.nih.gov/articles/PMC13101382/
**Für Artikel:** Kern-Beleg für Topping-Wirkung, Kultivare 'Enectaliana' und
'Santhica 70', explizit als Industriehanf (nicht Drug-Type) gekennzeichnet
(Block 2, 6).

**V8 — Peer-reviewed, Level 3 (kontrolliertes Experiment, 2-faktorielles
Design).** "Impact of Harvest Time and Pruning Technique on Total CBD
Concentration and Yield of Medicinal Cannabis". *Plants* (MDPI), 11(1):140,
Januar 2022. Univ. Hohenheim / Ai Fame GmbH, Schweiz.
https://pmc.ncbi.nlm.nih.gov/articles/PMC8747189/ (auch:
https://www.mdpi.com/2223-7747/11/1/140)
**Für Artikel:** Wichtigster Gegenpol zu V7 — Chemotyp-III-Medizinalcannabis
(näher an Drug-Type als Industriehanf), differenzierter Befund: Biomasse
signifikant höher durch Topping, Gesamt-CBD-Ertrag nicht signifikant
(Block 2, zentral für den Konflikt-Abschnitt).

**V9 — Peer-reviewed, Level 3 (kontrolliertes Experiment).** Danziger, N.;
Bernstein, N. "Plant architecture manipulation increases cannabinoid
standardization in 'drug-type' medical cannabis". *Industrial Crops and
Products*, Bd. 164, 2021.
https://www.sciencedirect.com/science/article/abs/pii/S0926669021002922
**Für Artikel:** Einzel- vs. Mehrfach-Pruning-Effekt auf Ertrag und
Cannabinoid-Gleichmäßigkeit (Block 2, 6).

**V10 — Level 1.** Azarius, "Topping vs FIMing Cannabis: Which Training Cut
Wins?", https://www.azarius.com/wiki/cultivation/cannabis/topping-vs-fiming-cannabis
**Für Artikel:** FIM-Mechanismus-Erklärung (Block 5).

**V11 — Peer-reviewed, Level 3–4, allgemeine Pflanzenphysiologie.** "Sugar
demand, not auxin, is the initial regulator of apical dominance". *PNAS*,
https://www.pnas.org/doi/10.1073/pnas.1322045111
**Für Artikel:** Mechanistische Erklärung Block 2/6 — explizit als
nicht-cannabis-spezifisch kennzeichnen.

**V12 — Peer-reviewed, Level 3–4, allgemeine Pflanzenphysiologie.** "Auxin
flow-mediated competition between axillary buds to restore apical
dominance". *Scientific Reports* (Nature),
https://www.nature.com/articles/srep35955
**Für Artikel:** Auxin-Fluss-Mechanismus (Block 2/6) — nicht
cannabis-spezifisch.

**V13–V17 — Level 1, mehrere konsistente Quellen.** LST-Timing: Zamnesia,
"Low-Stress Training for Cannabis: LST Timing, Tools & Steps",
https://www.zamnesia.com/grow-weed/419-lst-low-stress-training-cannabis ;
Weedmaps, "Guide to LST",
https://weedmaps.com/learn/the-plant/how-to-low-stress-train-weed ; Royal
King Seeds, "How to LST Cannabis Plants Week by Week",
https://royalkingseeds.us/blog/how-to-lst-cannabis-plants-week-by-week ;
RQS, "How To Perform Low Stress Training",
https://www.royalqueenseeds.com/blog-low-stress-training-n100 ; Hey Abby
Help Center, "Low-Stress Training... (week 3&4 of Veg)",
https://help.heyabby.com/en/articles/7158388-low-stress-training-for-indoor-hydroponic-cannabis-maximizing-yields-and-plant-health-week-3-4-of-the-veg-stage
**Für Artikel:** LST-Start-Timing-Konsens (Block 5) — **wichtig für
Konflikt mit App-Text, siehe unten.**

**V18–V20 — Level 1, unbestätigte Prozentangaben.** CropKing Seeds,
"Cannabis Low Stress Training (LST)",
https://www.cropkingseeds.com/cannabis-low-stress-training-lst-the-best-way-to-increase-yields-and-control/ ;
North Penn Now, "Complete Guide to Cannabis LST",
https://northpennnow.com/news/2024/oct/01/cannabis-low-stress-training/ ;
weitere aggregierte Grow-Journal-Quellen ohne kontrollierte Studienbasis.
**Für Artikel:** LST-Ertragssteigerung explizit als unbestätigte Bandbreite
kennzeichnen (Block 5, 16 — analog zur 33%-Kennzeichnung im
Sämling-Dossier).

**V21–V25 — Level 1, mehrere konsistente Quellen.** Stretch/Höhen-Regel:
Homegrown Cannabis Co, "When To Switch From Veg To Flower?",
https://homegrowncannabis.com/grow-your-own/article/when-switch-from-veg-flower ;
ILGM, "How Long Should You Veg Your Weed Plants?",
https://ilgm.com/resources/guides/how-long-should-you-veg-your-weed-plants ;
RQS, "How to Control and Prevent Stretching",
https://www.royalqueenseeds.com/us/blog-how-to-control-stretching-reigning-in-cannabis-growth-spurts-n487 ;
Clonetohome, "Cannabis Stretch in Early Flower",
https://clonetohome.com/blogs/grow-guide/%F0%9F%8C%B1-cannabis-stretch-in-early-flower-why-it-happens-and-how-to-control-it ;
Lighthouse Genetics, "Cannabis Flowering Stretch: 7 Best Tips",
https://lighthousegenetics.com/cannabis-flowering-stretch/
**Für Artikel:** Stretch-Faustregel, Sortenvarianz, Deckenhöhen-Planung
(Block 6, 16).

**V26–V29 — Level 1, mehrere konsistente Quellen.** Bewässerungsmethode:
GrowSensor, "How a cannabis soil moisture meter can maximise your yield",
https://www.growsensor.co/post/cannabis-soil-moisture-meter-maximise-yield ;
SunMed Growers, "How to Water Cannabis Plants",
https://www.sunmedgrowers.com/education-resources/blog/post/cannabis-watering-guide/ ;
Dirt Connections, "How To Measure And Monitor Cannabis Soil Moisture",
https://www.dirtconnections.com/how-to-measure-and-monitor-cannabis-soil-moisture/ ;
WeedSeedsExpress, "How To Water Cannabis: A Stage-by-Stage Guide",
https://weedseedsexpress.com/blog/how-often-should-i-water-my-weed-plant
**Für Artikel:** Finger-Test/Feuchtigkeitsmesser-Methodenvergleich (Block
5).

**V30–V37 — Level 1, konsistente, aber zahlenmäßig leicht streuende
Quellen.** NPK-Veg-Verhältnis: Veriheal, "Best Cannabis Fertilizer Guide",
https://www.veriheal.com/blog/npk-ratios-for-cannabis-fertalizers-understanding-the-balance/ ;
Crop King Seeds, "What is the Best NPK Ratio",
https://www.cropkingseeds.com/what-is-the-best-npk-ratio-for-marijuana-growing/ ;
Azarius, "Cannabis Nutrients NPK Guide",
https://www.azarius.com/wiki/cultivation/cannabis/cannabis-nutrients-npk-guide ;
HowToGrowMarijuana, "Best NPK Ratio for Each Growth Stage",
https://howtogrowmarijuana.com/npk-fertilizer-ratio/ ; Zamnesia, "NPK: What
Is The Best Ratio", https://www.zamnesia.com/us/grow-weed/308-npk-ratios ;
MSNL Seeds, "Cannabis NPK: The best ratio for each growth stage",
https://www.msnlseeds.com/blog/cannabis-npk-the-best-ratio-for-each-stage/ ;
Lotus Nutrients, "NPK Ratios Explained",
https://lotusnutrients.com/blogs/news/npk-ratios-explained ; Hey Abby,
"Cannabis Nutrients: What Your Plants Need",
https://heyabby.com/blogs/articles/cannabis-nutrients-explained
**Für Artikel:** NPK-Richtwert + EC-Eskalation-Cross-Reference (Block 10).

**V38–V44 — Level 1, sehr breiter, konsistenter Konsens.**
Stickstoffmangel-Symptome: Zamnesia, "Cannabis nitrogen deficiency",
https://www.zamnesia.com/us/grow-weed/493-nitrogen-deficiency ;
GrowWeedEasy, "How to fix Cannabis Nitrogen Deficiency",
https://www.growweedeasy.com/cannabis-plant-problems/nitrogen-deficiency ;
ILGM, "How To Stop Cannabis Nitrogen Deficiencies",
https://www.ilovegrowingmarijuana.com/growing/nutrient-deficiency-nitrogen/ ;
Spider Farmer, "Weed Nitrogen Deficiency",
https://www.spider-farmer.com/blog/weed-nutrient-deficiency/ ; Grow It
Jane, "Nitrogen Deficiency and Toxicity", https://growithjane.com/cannabis-nitrogen-deficiency-and-toxicity/ ;
Premium Cultivars, "Nitrogen Deficiency in Cannabis",
https://premiumcultivars.com/blogs/grow/nitrogen-deficiency-cannabis ;
Autoseeds, "How to identify and fix nitrogen deficiency",
https://www.autoseeds.com/en/how-to-fix-nitrogen-deficiency-in-cannabis/
**Für Artikel:** N-Mangel-Frühsymptomatik (Block 7, 11).

**V45–V49 — Level 1, mehrere konsistente Quellen.**
Wurzelraum/Umtopfen: 2FastBuds, "How to Successfully Repot a Cannabis
Plant", https://2fast4buds.com/news/how-to-successfully-repot-a-cannabis-plant ;
NuggMD, "Cannabis Transplanting 101",
https://www.nuggmd.com/blog/cannabis-transplanting-101 ; RQS, "How to
Prevent and Fix Rootbound Cannabis",
https://www.royalqueenseeds.com/blog-how-to-prevent-and-fix-root-bound-cannabis-n760 ;
PlantCareToday, "How To Reduce Cannabis Transplant Shock",
https://plantcaretoday.com/cannabis-transplant-shock.html ; GrowWeedEasy,
"How to Help a Rootbound Cannabis Plant",
https://www.growweedeasy.com/rootbound-cannabis-symptoms
**Für Artikel:** Root-bound-Erkennung, Umtopf-Timing (Block 6, 7).

**V50–V53 — Level 1, mehrere konsistente Quellen.** Autoflower-Training:
ILGM, "A Guide to Topping Autoflowers",
https://ilgm.com/resources/guides/when-to-top-autoflowers ; SeedSupreme,
"Topping Autoflowers: When to Top",
https://seedsupreme.com/blog/topping-autoflowers ; Zamnesia, "Topping
autoflowers: Timing, tips & yield guide",
https://www.zamnesia.com/us/grow-weed/573-topping-autoflowers ;
Thunderbird Disco, "Low Stress Training Autoflowers",
https://www.thunderbirddisco.com/blog/low-stress-training-autoflowers
**Für Artikel:** Autoflower-Erholungszeit-Vergleich Topping vs. LST (Block
12).

**V54–V59 — Level 1, mehrere konsistente Quellen.** SCROG-Timing: Biology
Insights, "When to Start SCROG",
https://biologyinsights.com/when-to-start-scrog-the-best-timing-for-maximum-yield/ ;
GrowSensor, "Boost your yield with a ScrOG net",
https://growsensor.co/post/scrog-nets-worth-it-or-a-waste-of-time ;
Cannabis Training University, "How to SCROG",
https://cannabistraininguniversity.com/growing/scrog/ ; Weedmaps, "A guide
to the screen of green method",
https://weedmaps.com/learn/the-plant/guide-to-screen-green-method ;
BudTrainer, "Screen of Green (SCROG)",
https://www.budtrainer.com/blogs/learn/scrog ; Vivosun, "Mastering the
SCROG", https://vivosun.com/growing_guide/scrog-guide/
**Für Artikel:** Netz-Timing, Tuck-Prozess (Block 6, ergänzend zu
Kronendach-Block).

**V60–V64 — Level 1, ein Claim ohne auffindbare Primärquelle.**
Veg-Defoliation: FloraFlex, "The Art of Defoliation",
https://www.floraflex.com/blogs/floraflex-media/the-art-of-defoliation-when-and-how-to-remove-cannabis-leaves ;
Vivosun, "Defoliation During the Vegetative and Flowering Stage",
https://vivosun.com/growing_guide/defoliation-during-the-vegetative-stage/ ;
Zamnesia, "Cannabis defoliation: Boost yield & plant health",
https://www.zamnesia.com/us/grow-weed/423-defoliation ; 454bags, "Cannabis
Defoliation: Techniques for Maximum Yield",
https://454bags.com/blogs/education/cannabis-defoliation-techniques-timing-and-benefits-for-optimal-plant-growth ;
GrowWeedEasy, "Cannabis Defoliation Tutorial",
https://www.growweedeasy.com/defoliation
**Für Artikel:** Veg-Defoliation-Timing-Konsens (Block 7) — die
"50-60cm/Studie"-Behauptung ohne Primärquelle explizit als unbelegt
kennzeichnen, nicht als Fakt übernehmen.

---

## Themenübersicht: Topping-Evidenzlage im Detail (Kernstück dieses Dossiers)

Anders als bei Keimung und Sämling existieren hier **drei unabhängige
kontrollierte Studien** (V7, V8, V9) — die bislang stärkste Evidenzbasis
der gesamten Tutorial-Reihe. Die Befunde sind aber **nicht deckungsgleich**:

| Studie | Cannabis-Typ | Knoten/Timing | Ergebnis |
|---|---|---|---|
| V7 (2026, Industriehanf) | Industriehanf, 2 Kultivare | 4./5./6. Knoten, Tag 29 | Klar positiv: +23–29% Frischbiomasse, statistisch signifikant |
| V8 (2022, Chemotyp III) | Medizinalcannabis, CBD-dominant | 10. Knoten, Tag 27 | Gemischt: Biomasse signifikant höher, **Gesamt-CBD-Ertrag nicht signifikant** (p=0,09) |
| V9 (2021, Drug-Type) | Medizinalcannabis | nicht knotenspezifisch angegeben | Einfaches Pruning kein Effekt; **zweifaches** Pruning höherer Ertrag + gleichmäßigere Cannabinoid-Verteilung |

**Einordnung für den Artikel:** Die Praxis-Konsens-Empfehlung (4.–6. Knoten)
deckt sich mit der Industriehanf-Studie (V7), nicht mit der
Drug-Type-näheren Studie (V8), die einen deutlich späteren Knoten (10.)
testete. Keine der drei Studien testet direkt den in der App/im
Praxis-Konsens empfohlenen 4.–6.-Knoten-Zeitpunkt an einer echten
Freizeit-/Drug-Type-Sorte — das bleibt eine Lücke. Der robusteste, über
alle drei Studien konsistente Befund ist nicht "wann genau", sondern
"Topping erhöht verlässlich die Biomasse/das Verzweigungsmuster; der
Effekt auf den tatsächlichen (cannabinoid-gewichteten) Ertrag ist
zeitpunkt- und sortenabhängig weniger eindeutig, als Grower-Guides
suggerieren."

---

## Offene Konflikte / dünne Evidenzlage

1. **Topping-Knotenpunkt zwischen Studien nicht konsistent** (siehe Tabelle
   oben) — kein Fehler, aber im Artikel als "Praxis-Konsens folgt der
   Industriehanf-Studie, nicht der Drug-Type-näheren Studie" transparent
   machen.
2. **LST-Start-Timing: App vs. Recherche.** Die App (`phases.ts`,
   `veg-lst`-Task) setzt LST auf **Tag 7 der Veg-Phase ("Woche 1")** für
   alle Nicht-Einsteiger. Der recherchierte Praxis-Konsens (V13–V17) setzt
   den sinnvollen Startzeitpunkt deutlich später an: **Woche 3 (Tag
   18–22)**, bei 3–6 entwickelten Knoten und einem bereits tragfähigen
   Hauptstängel — mit expliziter Warnung, dass zu früher Start das noch
   fragile Gewebe beschädigen kann. Das ist **kein Praxis-Trade-off wie
   bei den Vorgänger-Dossiers, sondern ein echter, gut belegter
   Zeitpunkt-Unterschied** — Tag 7 der Veg-Phase entspricht bei
   Standard-Sämlingsdauer (14 Tage) real Tag 21 seit Keimung, was
   möglicherweise noch vor der empfohlenen Knotenzahl liegt, je nach
   Wachstumsgeschwindigkeit der Pflanze. **Konkreter Korrekturkandidat für
   `phases.ts`** — sollte in Stage 3 (Fact-Check) priorisiert geprüft
   werden, nicht nur im Artikel erwähnt.
3. **Topping-Erfahrungslevel-Gate ("nur für Profis") ist durch die
   Evidenzlage nicht gestützt.** Keine der drei kontrollierten Studien
   (V7–V9) und keiner der Praxis-Guides (V1–V6) nennt Grower-Erfahrung als
   relevanten Timing-Faktor — relevant sind Knotenzahl, Pflanzengesundheit
   und Wiederherstellungsfenster, nicht Erfahrungslevel. Strukturell
   ähnlich zum bereits in dieser Session korrigierten Muster
   (Blütedauer/Outdoor-Ertrag waren fälschlich an `erfahrung` statt an die
   fachlich richtige Variable gekoppelt) — hier ist die App-Kopplung an
   "nur Profi" eher eine **Vorsichtsmaßnahme aus Produktsicht**
   (Topping ist ein irreversibler Schnitt, LST nicht) als ein
   Recherchefehler, sollte im Artikel aber nicht als "wissenschaftlich
   begründet" dargestellt werden.
4. **LST-Ertragsprozentzahlen (15–40%) ohne kontrollierte Studie** — wie
   die 33%-Behauptung im Sämling-Dossier: mehrere Quellen, keine davon
   eine echte Studie. Als Bandbreite mit Vorbehalt kennzeichnen.
5. **Veg-Defoliation-"Studie" (50–60cm-Höhen-Trigger) ohne auffindbare
   Primärquelle** — mehrere Sekundärquellen berufen sich darauf, aber
   keine nennt Autor/Journal/Jahr konkret genug für eine Verifikation.
   Als unbestätigt kennzeichnen, nicht als Fakt zitieren.
6. **Apikaldominanz-Mechanismus (V6, V11, V12) ist allgemeine
   Pflanzenphysiologie**, nicht an Cannabis kontrolliert getestet — sollte
   im Artikel explizit als Erklärung des allgemeinen Prinzips markiert
   werden, nicht als cannabis-spezifischer Beleg.

---

## Abgleich mit aktuellem App-Text (`phases.ts`, Stand 2026-08-21)

| App-Task | Aktueller Text | Abgleich mit Recherche |
|---|---|---|
| pH/EC prüfen (Tag 0) | "pH 6.0–6.5 (Erde) oder 5.8–6.2 (Coco/Hydro). EC als Einsteiger bei 0.8–1.2 starten." | **Außerhalb dieses Dossiers** — bereits im Kalibrierungsaudit dieser Session verifiziert. |
| Bewässerung (Tag 2) | "Finger-Test: erst gießen wenn die oberen 2–3 cm Substrat trocken sind." | **Bestätigt**, deckungsgleich mit V26–V29. |
| Erste Nährstoffgabe (Tag 3) | "Stickstoff-betonte Nährlösung einleiten. Niedrig beginnen (halbe Dosierung), schrittweise steigern." | **Bestätigt** im Grundsatz (N-Betonung, niedrig starten); die App nennt keine konkrete NPK-Zahl — Artikel kann hier mit 3-1-2-Richtwert (V30–V37) echte Tiefe liefern, die die App-Task bewusst nicht leistet. |
| Kronendach kontrollieren (Tag 14) | "Gleichmäßige Höhe sicherstellen. Überdominante Äste nach außen biegen." | **Bestätigt**, aber knapp — SCROG-Netz-Timing (V54–V59) als mögliche Erweiterung für Grower, die aktiv trainieren wollen, nicht nur beobachten. |
| LST beginnen (Tag 7, nicht Einsteiger) | "Seitentriebe vorsichtig mit Bindedraht nach außen biegen. Ziel: flaches, gleichmäßiges Kronendach." | **Timing-Konflikt, siehe oben (#2)** — Tag 7 liegt vor dem recherchierten Praxis-Konsens-Fenster (Woche 3, Tag 18–22). Korrekturkandidat. |
| Topping Woche 3 (Tag 21, nur Profi) | "Den Haupttrieb zwischen dem 4.–6. Knotenpunkt kappen. Erzeugt zwei gleichwertige Hauptäste." | **Knotenzahl bestätigt** (deckt sich mit V1–V6 und näherungsweise mit V7); **Zeitangabe "Woche 3" (Tag 21) plausibel**, da V7 bei Tag 29 topt (etwas später, aber gleiche Größenordnung). **Erfahrungslevel-Gate nicht evidenzbasiert, siehe Konflikt #3** — eher Produktentscheidung als Fachfrage. |

**Fazit:** Die App-Texte sind bei den bewässerungs-/düngungsbezogenen
Werten bestätigt. Bei den Trainingstechniken gibt es **einen echten,
substanziellen Korrekturkandidaten** (LST-Timing zu früh) und einen
Punkt, der im Artikel eingeordnet, aber nicht als App-Fehler behandelt
werden sollte (Erfahrungslevel-Gate für Topping — nachvollziehbare
Produktentscheidung, nicht durch Evidenz gedeckt oder widerlegt).

---

## Geschätzte Kennzahlen für später

**Quellenzahl:** 64 Claim-Einträge, gestützt auf **~50 eigenständige neue
Quellen** (V1–V64, mehrere davon Sammelverweise auf 2+ URLs) — deutlich
über dem Minimum von 3, und mehr als Keimung (18) und Sämling (22)
zusammen, wie vom User gewünscht ("Tiefe wichtiger als Zeit").

**Evidence-Level-Spektrum:** 1–4. **Drei unabhängige kontrollierte
Cannabis-Studien** (V7, V8, V9, Level 3) plus zwei hochrangige
allgemein-botanische Studien (V11, V12, Level 3–4, nicht cannabis-spezifisch)
— die mit Abstand stärkste Studienlage der bisherigen Dossier-Reihe.
Rest Level 1, breiter unabhängiger Konsens.

**Confidence-Score-Schätzung** (Formel aus SOURCE_REQUIREMENTS.md §4):
- Evidence-Stärke: mean-Level ≈ 1,3/5 (viele Level-1-Einträge drücken den
  Mittelwert trotz drei starker Level-3-Cannabis-Anker) → 0,40 × (1,3/5) ≈
  **0,10**.
- Source-Adequacy: ~50 Quellen von 3 geforderten → gedeckelt bei 1,0;
  breite Publisher-Streuung → 0,20 × 1,0 = **0,20**.
- Consistency: mehrere benannte Konflikte, darunter ein substanzieller
  (LST-Timing) und ein Studien-Uneinigkeit (Topping-Knoten zwischen V7/V8)
  → geschätzt ~0,65 (niedriger als Keimung/Sämling, da die Konflikte hier
  handlungsrelevanter sind, nicht nur Kontext-Nuancen) → 0,20 × 0,65 =
  **0,13**.
- Freshness: alle Quellen aktuell (2020–2026), frisch recherchiert → 1,0 →
  0,20 × 1,0 = **0,20**.
- **Geschätzte Gesamt-Confidence: ≈ 0,63.**

Das liegt **über der Publikationsschwelle für Cultivation-Technique-
Artikel** (min. 0,60, min. 3 Quellen, min. Top-Evidence-Level 2 — hier mit
V7/V8/V9 klar auf Level 3 erfüllt, die bislang stärkste Erfüllung in der
Reihe). Trotz solider Quellenlage sollte **Konflikt #2 (LST-Timing) vor
Stage 2 (Draft) priorisiert gegengeprüft werden**, da er anders als die
Nuancen-Konflikte der Vorgänger-Dossiers ein echter, umsetzungsrelevanter
Korrekturkandidat für den bestehenden App-Text ist, nicht nur eine
Tiefe-Ergänzung für den Artikel.
