# Draft — Sämlingspflege: Licht, Bewässerung und der Übergang zur Vegetationsphase

Stage: 2 — Draft · Datum: 2026-08-21 · Basis: `docs/content-factory/research/saemling-source-dossier.md` (22 neue Quellen S1–S27, plus wiederverwendet Q14/S20, Kontext-Quelle S28)

> Zitierformat: `(S#)` verweist auf die Quellen im Stage-1-Sämling-Dossier. `(S20/Q14)` markiert die aus dem Keimungs-Dossier wiederverwendete Quelle. Jede Zahlenangabe ist im Dossier mit Titel, Publisher, Jahr, URL und Evidence-Level hinterlegt.

**Hybridcharakter dieses Artikels:** Die Sämlingsphase ist prozedural (Licht/Bewässerung/Abhärtung als Methode) UND diagnostisch (sie ist die anfälligste Phase für Damping-off, Übergießen, Lichtstress, Nährstoffverbrennung). Blöcke 6, 7 und 11 sind bewusst stärker diagnostisch aufgebaut (Symptom → Ursache → Korrektur) statt rein prozedural — das Dossier empfiehlt das explizit, statt den Hybridcharakter zu verstecken.

---

## Front matter

```yaml
slug: keimung-und-anzucht
title: "Sämlingspflege: Licht, Bewässerung und der Übergang zur Vegetationsphase"
summary: "Wie ein Cannabis-Sämling von den Keimblättern bis zum vegetativen Wachstum sicher durch die anfälligste Phase des Grows geführt wird — Licht- und Feuchtigkeitsprogression, Fehlerbild-Diagnose und der richtige Zeitpunkt für den Phasenübergang."
category: anbau
difficulty: foundational
entity_type: HowTo
language: de
meta:
  evidence_level: 1
  confidence_score: 0.63
  last_review_date: 2026-08-21
  review_horizon_months: 18
relations:
  - { type: prerequisite, to: samenkeimung-troubleshooting }
  - { type: see_also,     to: cannabis-anbau-grundlagen }
tool_links:
  - { kind: reference, slug: vpd, label: "VPD-Rechner", href: "/tools/vpd" }
```

**Hinweis zu `evidence_level: 1` und der Evidenzlage generell:** Anders als beim Keimungs-Artikel existiert für die Sämlingsphase **keine kontrollierte Cannabis-Studie**, die PPFD-, RH- oder Temperatur-Zielwerte direkt misst. Die einzige verfügbare peer-reviewte Lichtstudie (S28, Rodriguez-Morrison et al. 2021) untersucht ausschließlich die Blütephase und wird in diesem Artikel bewusst **nicht** als Zahlenbeleg für die Sämlingsphase verwendet — nur als Kontext in Block 12. Die quantitativen Kernaussagen dieses Artikels beruhen auf breitem, unabhängigem Praxis-Konsens (Level 1) plus einer Extension-Quelle zur allgemeinen Abhärtungsphysiologie (S18, Level 1–2, nicht cannabis-spezifisch). Das ist offen kommuniziert statt kaschiert — `confidence_score = 0.63` liegt trotzdem über der 0.60-Schwelle für Technique-Artikel, weil Quellenzahl, -streuung und -aktualität die fehlende Studienlage teilweise auffangen.

---

## 1. `definition`

Die Sämlingsphase beginnt mit dem Einpflanzen des Keimlings (Pfahlwurzel 1–2 cm, siehe `samenkeimung-troubleshooting`) und endet mit dem Übergang in die Vegetationsphase, wenn die Pflanze 3–4 Sätze echter, gezackter Blätter trägt und sichtbar beschleunigt wächst (S2). Ziel der Phase ist kein bestimmtes Kalenderdatum, sondern ein Sämling mit intaktem, gut entwickeltem Wurzelsystem, der den Übergang ohne Wachstumsstauchung übersteht. SecretLeafs Grow-OS modelliert die Phase mit einer Standarddauer von 14 Tagen (`saemling` in `PHASE_ORDER`, `lib/grow/phases.ts`) — laut Recherche der untere Rand der üblichen 2–4-Wochen-Spanne (S1, S3), ein plausibler Startwert, aber kein starrer Fixpunkt (siehe Block 6).

## 2. `scientific_background`

In den ersten 10–14 Tagen investiert die Pflanze primär in Wurzelwachstum; sichtbares oberirdisches Wachstum bleibt entsprechend langsam — kein Fehlerzeichen, sondern eine physiologische Priorität zugunsten der Wasser-/Nährstoffaufnahmefähigkeit (S12). Das erklärt, warum Sämlinge in dieser Phase optisch kaum wachsen, obwohl unter der Erde bereits die Grundlage für das spätere vegetative Wachstum gelegt wird.

Der spätere Übergang von der Feuchtigkeitsglocke zur offenen Raumluft folgt dem allgemeinen pflanzenphysiologischen Prinzip des Abhärtens (Hardening-off): schrittweise Exposition gegenüber niedrigerer Luftfeuchte und mechanischer Belastung verdickt die Blatt-Kutikula und erhöht den Trockenmasseanteil des Gewebes, was die Widerstandsfähigkeit gegen Umweltstress erhöht — ein 7–14-tägiger Prozess in der allgemeinen Gartenbau-Literatur (S18). **Diese Quelle ist nicht cannabis-spezifisch** — der Mechanismus ist botanisch allgemeingültig, wurde aber nie kontrolliert an Cannabis getestet; die Übertragung ist plausibel, aber eine Extrapolation.

Zur Lichtreaktion von Cannabis existiert eine kontrollierte, peer-reviewte Studie (S28) — sie zeigt, dass Ertrag und Photosynthese-Effizienz mit steigender PPFD nichtlinear und stark phasenabhängig reagieren. Die Studie untersucht jedoch ausschließlich die Blütephase (120–1.800 µmol/m²/s) und liefert **keine verwertbaren Zahlen für die Sämlingsphase** — sie dient hier nur als Beleg dafür, dass Cannabis' Lichtreaktion grundsätzlich phasenspezifisch ist, nicht als Quelle für die unten genannten PPFD-Werte.

## 3. `plant_physiology`

Die beiden Keimblätter (Kotyledonen) sind glatt und rundlich und dienen als Nährstoffreserve aus dem Samen selbst — sie sind botanisch kein "echtes" Blatt. Echte Blätter erscheinen danach mit charakteristischer Zackung und steigender Fingerzahl (1 → 3 → 5 → 7 Finger je Blatt) (S1). Vergilben die Kotyledonen, **nachdem** die ersten echten Blätter bereits erschienen sind, ist das normal — die Reserve ist aufgebraucht, die Pflanze versorgt sich jetzt selbst über Photosynthese und Wurzelaufnahme. Vergilben sie dagegen früh oder auffällig stark, **bevor** echte Blätter erschienen sind, spricht das für Übergießen, Nährstoffverbrennung durch zu frühe/starke Düngung oder Wurzelprobleme (S4, S5) — die zeitliche Einordnung ist der entscheidende Unterschied zwischen normalem Vorgang und Warnsignal.

## 4. `symptoms` → Ziel & Indikationen

Die Phase beginnt automatisch mit dem Einpflanzen des Keimlings — kein separater Startzeitpunkt zu wählen. Ein gesunder Start zeigt sich durch: aufrechtes Hypokotyl, symmetrisch entfaltete Kotyledonen, keine sichtbare Verfärbung außer der oben beschriebenen späten Kotyledonen-Vergilbung. Abweichungen direkt nach dem Einpflanzen (umgeknicktes Hypokotyl, aufgerissene oder fehlende Kotyledonen) deuten meist auf mechanische Beschädigung beim Umsetzen aus der vorherigen Keimmethode hin (siehe `samenkeimung-troubleshooting`, Block 7).

## 5. `causes` → Methode Schritt-für-Schritt

**Licht**
1. Photoperiode 18/6 als Standard für photoperiodische Sämlinge; 24/0 ist bei Autoflowern üblich, bei photoperiodischen Pflanzen dagegen ein Stressrisiko ohne belegten Wachstumsvorteil (S10, S11). Eine Einzelquelle behauptet 33 % schnelleres Wachstum unter 24/0 — **das ist eine unbestätigte Einzelmeinung, kein Konsens**, und sollte nicht als Entscheidungsgrundlage dienen (S11).
2. PPFD-Ziel: 100–200 µmol/m²/s in den ersten 7 Tagen, Steigerung auf 200–300 µmol/m²/s in Woche 2 (S6, S7, S8). Unter 100 µmol/m²/s steigt das Streckungsrisiko (Block 11), über 300 µmol/m²/s das Lichtstressrisiko.
3. Lichtquelle in ausreichendem Abstand halten, um punktuelle Überhitzung zu vermeiden (siehe Block 9, Temperatur).

**Bewässerung**
1. In einem Ring von ca. 3 cm um den Stamm gießen, nicht direkt am Stängel — das lenkt das Wurzelwachstum nach außen und vermeidet Staunässe direkt am Stamm, die Stängelfäule begünstigen kann (S12, S13).
2. Substrat zwischen den Gaben antrocknen lassen (Finger- oder Sichttest); Ziel ist feucht, nicht durchnässt — die jungen Wurzeln brauchen sowohl Wasser als auch Sauerstoff (S13, S14).

**Feuchtigkeitsglocke abhärten**
1. Haube aufgesetzt lassen bis zum Erscheinen der ersten echten Blätter, üblicherweise Tag 7–14 (S15, S16, S17).
2. Danach **schrittweise** statt abrupt entfernen: am ersten Tag 2–3 Stunden offen lassen, danach täglich um 1–2 Stunden steigern über 3–5 Tage (S16). Ein abruptes Entfernen setzt den Sämling einem plötzlichen Feuchtigkeitsabfall aus, den das noch unterentwickelte Wurzelsystem schwerer kompensieren kann.

## 6. `diagnosis` → Erfolgsbewertung (diagnostisch)

**Feuchtigkeits-Zielwert ist keine einzelne Zahl, sondern eine Stufe:** Frühe Sämlingsphase (Tag 0–7, unter der Haube) 75–80 % RH; mittlere Phase (Tag 8–14) 65–75 %; späte, haubenfreie Phase (Tag 15–21) 60–70 % (S19). Für die reine Damping-off-Prävention in derselben späten Zeitspanne wird dagegen ein niedrigerer Wert von 40–50 % RH genannt (S20/Q14) — das ist **kein Widerspruch zwischen den Quellen**, sondern zwei unterschiedliche Zielsetzungen für denselben Zeitraum: 60–70 % ist der allgemeine Wachstums-Komfortbereich, 40–50 % die engere Zielspanne, wenn Damping-off-Risiko im konkreten Setup bereits ein Thema ist (z. B. bei schlechter Luftzirkulation). SecretLeafs App-Task nennt vereinfachend einen flachen Wert von 60–70 % für die gesamte Phase — das trifft die mittlere Phase gut, ist für die frühe Phase eher zu niedrig und für die risikobehaftete späte Phase eher zu hoch angesetzt. Der VPD-Rechner (`/tools/vpd`) erlaubt die feinere, temperaturgekoppelte Steuerung, die eine einzelne RH-Prozentzahl nicht abbilden kann.

**Übergang in die Vegetationsphase**, konkrete statt kalendarische Kriterien: 3–4 Sätze echter Blätter, sichtbare Wurzeln an den Drainagelöchern des Anzuchttopfs, spürbar beschleunigtes tägliches Wachstum (S2, S26). Der 14-Tage-Standardwert der App ist ein plausibler Startpunkt, aber real variabel — verzögertes Umtopfen bei bereits wurzelverfilzten ("root-bound") Sämlingen kann das Wachstum stauchen und einen längeren Erholungsprozess erzwingen (S26).

## 7. `corrective_actions` (diagnostisch)

**Streckung/Etiolation** (dünner, blasser, überlanger Stängel): Hauptursache ist unzureichendes oder zu weit entferntes Licht — Lichtquelle näher bringen bzw. PPFD in den Zielbereich anheben. Weitere Faktoren: zu hohe Temperatur, Übernässung, ungeeignete Nährstoffversorgung, zu dichte Bepflanzung (S9, S23). Bereits gestreckte Sämlinge lassen sich nicht zurückbilden, aber durch sofortige Lichtkorrektur stabilisieren, bevor der dünne Stängel bricht.

**Beginnende Umkippkrankheit (Damping-off)** in dieser Sub-Phase: gleiches Bild wie im Keimungs-Artikel beschrieben (wässrig-brauner Stängelansatz, umknickender Sämling) — befallene Pflanzen sind meist nicht zu retten, Fokus liegt auf Isolation und sofortiger RH-/Bewässerungskorrektur für die übrigen Sämlinge.

**Nährstoffverbrennung** (dunkelgrüne Blätter mit verbrannten, später eingerollten Spitzen, S25): sofort auf reines, pH-korrigiertes Wasser umstellen, um überschüssige Salze auszuspülen, bevor erneut (deutlich schwächer) gedüngt wird.

## 8. `preventive_measures`

Temperaturstabilität ist der wirksamste Einzelhebel gegen mehrere Fehlerbilder gleichzeitig (Streckung, Damping-off, Stress) — Schwankungen vermeiden, nicht nur Zielwerte einhalten. Dome-Timing korrekt einhalten (Block 5) beugt sowohl zu hoher Dauerfeuchte (Damping-off-Risiko bei zu langer Nutzung) als auch zu abruptem Trockenstress (bei zu früher, abrupter Entfernung) vor. Werkzeug- und Substrathygiene reduzieren das Einschleppen von Pilzsporen. Nährlösung erst nach den ersten echten Blättern und deutlich verdünnt einsetzen (Block 10), um Verbrennung vorzubeugen statt sie nachträglich zu korrigieren.

## 9. `environmental_factors`

**Temperatur:** Tag 21–25 °C, Nacht 18–21 °C, mit einer Nacht-Tag-Differenz von ca. 3–5 °C (S21, S22). Eine Einzelquelle nennt im Damping-off-Präventionskontext einen deutlich weiteren Bereich bis 29 °C (S20/Q14) — das ist vermutlich eine Belastungs-/Toleranzobergrenze, nicht der eigentliche Zielbereich, und sollte nicht mit dem engeren 21–25 °C-Zielkorridor verwechselt werden. Stabilität ist wichtiger als das exakte Erreichen eines Punktwerts.

**Luftfeuchtigkeit:** siehe die vollständige Stufenprogression in Block 6 — der zentrale Punkt dieses Artikels gegenüber der knappen App-Task-Beschreibung.

**Licht/Dunkelheit:** 18/6-Photoperiode als Standard (Block 5); die Dunkelphase hat in dieser Phase weiterhin eine physiologische Erholungsfunktion, analog zur Keimungsphase.

## 10. `nutrient_interactions`

Ob überhaupt gedüngt werden muss, hängt vom Substrat ab: gut vorgedüngte Erde-/Living-Soil-Mischungen versorgen Sämlinge häufig bis in Woche 3–4 der späteren Vegetationsphase ohne Zusatzdüngung. Inerte Medien (Coco, Hydro) enthalten dagegen keine Nährstoffreserve und brauchen bereits ab Ende Woche 1 eine stark verdünnte Nährlösung (S24). Nach Erscheinen der ersten echten Blätter gilt allgemein ein Einstieg bei ca. 25 % der später üblichen Grundstärke als Faustregel (S24, S25) — deutlich unter der Dosierung späterer Wachstumsphasen, da die kleine Wurzelmasse noch keine hohe Salzkonzentration verträgt. Warnsignale für zu frühe/zu starke Düngung: dunkelgrüne Blätter mit verbrannten, später eingerollten Spitzen (S25, siehe auch Block 7).

## 11. `common_mistakes` (diagnostisch)

- **Zu wenig oder zu weit entferntes Licht** → Streckung/Etiolation (S9, S23).
- **Feuchtigkeitsglocke zu lange oder abrupt entfernt** → entweder erhöhtes Damping-off-Risiko (zu lange) oder Trockenstress (zu abrupt) (S17).
- **Zu frühe oder zu starke Düngung**, besonders in inerten Medien → Nährstoffverbrennung (S24, S25).
- **Übergießen** → Staunässe, erhöhtes Damping-off-Risiko, verzögerte Wurzelentwicklung, da Sauerstoffmangel im Substrat die Wurzelatmung hemmt (S13, S14).
- **Kotyledonen-Vergilbung als generelles Alarmsignal fehlinterpretiert**, obwohl sie nach Erscheinen der echten Blätter normal ist (Block 3) — führt zu unnötiger, teils schädlicher Über-Intervention (zusätzliche Düngung, verändertes Gießverhalten).
- **RH konstant hochhalten über die gesamte Phase**, statt sie schrittweise abzusenken (Block 6) — erhöht das Damping-off-Risiko genau in der Phase, in der die Pflanze zunehmend eigenständig reguliert.

## 12. `advanced_considerations`

Autoflower-Sämlinge benötigen keinen strikten Lichtplan — sowohl 18 als auch 24 Stunden Licht funktionieren, da der Übergang in die Vegetationsphase genetisch fixiert ist und nicht photoperiodisch ausgelöst wird (S27). Umtopfen sollte bei Autoflowern nach Möglichkeit ganz vermieden werden (direkt im Endtopf keimen/anziehen), da der kompakte, zeitlich begrenzte Zyklus wenig Erholungspuffer für Transplantationsstress lässt; ist ein Umtopfen unumgänglich, sollte es nur in den ersten 7–10 Tagen stattfinden (S27). Die Sämlingsphase wird bei Autoflowern entsprechend oft kürzer angegeben (10–14 Tage) als bei photoperiodischen Sorten (2–4 Wochen) — konsistent mit dem insgesamt kompakteren Lebenszyklus (S27 vs. S1/S2/S3).

Zur generellen Lichtreaktion von Cannabis: Eine kontrollierte Studie (S28) zeigt für die Blütephase einen nichtlinearen, phasenabhängigen Zusammenhang zwischen PPFD und Ertrag/Photosynthese ohne erkennbaren Sättigungspunkt bis 1.800 µmol/m²/s. Das legt nahe, dass Lichtreaktion bei Cannabis generell stark phasenspezifisch ist — ein Hinweis darauf, dass auch die Sämlingsphase eigene, von späteren Phasen abweichende Optima hat, auch wenn keine entsprechende kontrollierte Studie für diese frühe Phase existiert.

## 13. `related_topics`

- **Vorbedingung:** `samenkeimung-troubleshooting` — die vorausgehende Keimungsphase, endet exakt dort, wo dieser Artikel beginnt (Einpflanzen des Keimlings).
- **Grundlagen:** `cannabis-anbau-grundlagen`.
- **Weiterführend:** Vegetationsphase-Tutorial (noch nicht recherchiert/gedraftet — nächste Phase in der Reihe).
- **Werkzeug:** SecretLeafs VPD-Rechner (`/tools/vpd`) für die in Block 6/9 beschriebene RH-/Temperatur-Feinsteuerung.

## 14. `references`

| # | Titel | Publisher / Autor | Jahr | URL/DOI | Evidence-Level | Kontext im Artikel |
|---|---|---|---|---|:---:|---|
| S1 | Cannabis Seedling Stage: A Complete Grow Guide / Life Cycle Of Marijuana Plants | SeedsHereNow / ILGM | — | https://seedsherenow.com/cannabis-seedling-stage/ ; https://ilgm.com/resources/guides/the-cannabis-life-cycle-in-weeks | 1 | Kotyledonen-Definition, Phasendauer (Block 1, 3) |
| S2 | Cannabis Seedling Stages: Week-by-Week Guide | Cannabis-Seeds.org | — | https://www.cannabis-seeds.org/blog/cannabis-seedling-stages-week-by-week-guide/ | 1 | Phasengrenze, Übergangskriterien (Block 1, 6) |
| S3 | Cannabis Growth Stages Breakdown | Dutch Passion | — | https://dutch-passion.us/blog/post/cannabis-growth-stages-breakdown | 1 | Phasendauer-Bestätigung (Block 1) |
| S4 | How to Help Yellow Cannabis Seedlings | GrowWeedEasy | — | https://www.growweedeasy.com/how-to-help-yellow-cannabis-seedlings | 1 | Kotyledonen-Vergilbung (Block 3) |
| S5 | Cotyledon yellowing — Praxisbeobachtungen | ILGM Forum / THCFarmer | — | https://ilgmforum.com/t/seedling-only-5-days-old-and-cotyledon-leaves-are-already-yellowing/88012 | 1 | Frühe/abnormale Vergilbung (Block 3) |
| S6 | Optimizing PPFD Levels for Cannabis Seedlings Growth / Understanding PPFD for Cannabis Seedlings | Blimburn Seeds / Lotus Nutrients | — | https://blimburnseeds.com/blog/tips-and-tricks/ppfd-levels-for-cannabis-seedlings/ ; https://lotusnutrients.com/blogs/news/ppfd-for-cannabis-seedlings | 1 | PPFD-Zielbereich (Block 5) |
| S7 | How much PPFD is required during the seedling... | FastGrowStore | — | https://fastgrowstore.eu/blogs/led-knowledge/how-much-ppfd-is-needed-throughout-seedling-vegetative-and-flowering-stages | 1 | PPFD-Progression (Block 5) |
| S8 | PPFD Light Intensity Cannabis Growth Stages | PlanaCan | — | https://planacan.io/ppfd-light-intensity-cannabis-growth-stages/ | 1 | PPFD-Bestätigung (Block 5) |
| S9 | Light stress in cannabis seedlings explained / Cannabis Seedlings Stretching | Cannoptikum | — | https://cannoptikum.com/en/blog/factors-in-cannabis-cultivation/light-stress-seedlings ; https://cannoptikum.com/en/blog/factors-in-cannabis-cultivation/seedlings-stretching | 1 | Lichtstress, Streckung (Block 11) |
| S10 | Best Light Schedule for Cannabis Growth | Blimburn Seeds | — | https://blimburnseeds.com/blog/tips-and-tricks/best-light-schedule-for-cannabis/ | 1 | 18/6-Standard (Block 5) |
| S11 | 18/6 vs 20/4 vs 24/0 / The Importance of the Dark Cycle | Rollitup Forum / RQS | — | https://www.rollitup.org/t/your-opinion-on-18-6-vs-20-4-vs-24-0.824006/ ; https://www.royalqueenseeds.com/blog-the-importance-of-the-dark-cycle-in-cannabis-cultivation-n906 | 1 | 24/0-Stressrisiko; 33%-Behauptung als unbestätigter Einzelbeleg (Block 5) |
| S12 | Cannabis Seedling Care: Light, Watering, and Early Feeding / Watering Cannabis Seedlings | Zamnesia / Premium Cultivars | — | https://www.zamnesia.com/us/grow-weed/287-seedling-phase-cannabis ; https://premiumcultivars.com/blogs/grow/watering-cannabis-seedlings-day-by-day-schedule | 1 | Ring-Bewässerung, Wurzelpriorität (Block 2, 5) |
| S13 | Mastering The Cannabis Seedling Stage In Just 3 Steps | RQS | — | https://www.royalqueenseeds.com/blog-rookie-guide-3-steps-to-master-the-seedling-stage-n239 | 1 | Bewässerungsintervall (Block 5) |
| S14 | Seedling Phase in Cannabis: Grow Healthy Cannabis Seedlings | Sensi Seeds | — | https://sensiseeds.com/en/blog/best-conditions-for-seedlings/ | 1 | Substrat-Trocknungstest (Block 5) |
| S15 | Humidity Domes for Seedlings / When to Take Humidity Dome off Seedlings | Pacific Seed Bank / My Backyard Grow | — | https://www.pacificseedbank.com/growing-marijuana/humidity-domes-for-seedlings/ ; https://mybackyardgrow.com/when-to-take-humidity-dome-off-seedlings/ | 1 | Dome-Entfernungs-Timing (Block 5) |
| S16 | Humidity Domes for Seedlings: A Grower's Guide | Grower's Choice Seeds | — | https://www.growerschoiceseeds.us/cannabis-seed-blog/growing-cannabis/humidity-domes-for-seedlings/ | 1 | Abhärtungs-Zeitplan (Block 5) |
| S17 | How Long to Keep Seedlings in Humidity Dome? | Howgarden.blog | — | https://howgarden.blog/seedlings-humidity-dome-duration | 1 | Dome-Dauer, Damping-off-Verknüpfung (Block 5, 8) |
| S18 | Hardening Off Vegetable Seedlings for the Home Garden | University of Maryland Extension | 2026 (Update) | https://extension.umd.edu/resource/hardening-vegetable-seedlings-home-garden | 1–2 (Extension, nicht cannabis-spezifisch) | Abhärtungsphysiologie (Block 2) |
| S19 | Cannabis Seedling Humidity: Ideal Levels for Seedlings, Veg & Flowering | GrowerIQ | 2026 (Update) | https://groweriq.ca/2023/08/18/what-is-the-ideal-humidity-for-cannabis-at-each-stage-of-growth/ | 1 | RH-Stufenprogression (Block 6) |
| S20/Q14 | How to Prevent Damping Off When Growing Weed | RQS | — | https://www.royalqueenseeds.com/us/blog-how-to-spot-and-prevent-damping-off-n773 | 1 | Damping-off-RH-Zielwert (Block 6, 9) — wiederverwendet aus dem Keimungs-Dossier |
| S21 | Optimal Temperature for Growing Cannabis | Blimburn Seeds | — | https://blimburnseeds.com/blog/tips-and-tricks/temperature-for-growing-cannabis/ | 1 | Tag-/Nachttemperatur (Block 9) |
| S22 | Cannabis Temperature Tutorial | GrowWeedEasy | — | https://www.growweedeasy.com/temperature | 1 | Temperatur-Differential (Block 9) |
| S23 | Cannabis stretching / How to Control and Prevent Stretching | CannaConnection / RQS | — | https://www.cannaconnection.com/blog/1109-how-to-avoid-stretching-plants ; https://www.royalqueenseeds.com/blog-how-to-control-stretching-reigning-in-cannabis-growth-spurts-n487 | 1 | Streckungsursachen (Block 11) |
| S24 | When to Start Giving Seedlings Nutrients | Reefertilizer | — | https://reefertilizer.com/blog/when-should-you-start-feeding-your-cannabis-plants-fertilizer/ | 1 | Substratabhängiger Düngestart (Block 10) |
| S25 | How to Fix Cannabis Nutrient Burn | GrowWeedEasy | — | https://www.growweedeasy.com/cannabis-plant-problems/nutrient-burn | 1 | Verbrennungssymptome (Block 7, 10, 11) |
| S26 | When to Transplant Cannabis Seedlings / When to Transplant Weed Seedlings | Pacific Seed Bank / Left Handed Cigs | — | https://www.pacificseedbank.com/growing-marijuana/when-to-transplant-cannabis-seedlings/ ; https://lefthandedcigs.com/when-to-transplant-weed-seedlings/ | 1 | Root-bound, Übergangskriterien (Block 6) |
| S27 | How to grow autoflowers during the seedling stage | Autoseeds | — | https://www.autoseeds.com/en/growing-autoflowers-during-the-seedling-stage/ | 1 | Autoflower-Nuancen (Block 12) |
| S28 | Cannabis Yield, Potency, and Leaf Photosynthesis Respond Differently to Increasing Light Levels in an Indoor Environment | Rodriguez-Morrison, V. et al., *Frontiers in Plant Science*, Univ. of Guelph | 2021 | https://pmc.ncbi.nlm.nih.gov/articles/PMC8144505/ | 3 (Studie), nicht nutzbar als Sämling-Zahlenquelle | Kontext: phasenabhängige Lichtreaktion (Block 2, 12) — NICHT als PPFD-Beleg für Sämlinge |

## 15. `faq`

**Warum vergilben die untersten Blätter (Kotyledonen) meines Sämlings?**
Normal, sobald echte Blätter bereits erschienen sind — die Kotyledonen haben ihre Reserve aufgebraucht. Vergilben sie vorher oder sehr stark, deutet das eher auf Übergießen oder Nährstoffprobleme (Block 3).

**Muss ich in dieser Phase schon düngen?**
Kommt auf das Substrat an: vorgedüngte Erde meist nicht, Coco/Hydro ab Ende Woche 1 mit stark verdünnter Lösung (ca. 25 % Grundstärke). Zu früh/zu stark führt zu Verbrennung (Block 10).

**Wie schnell muss ich die Feuchtigkeitsglocke entfernen?**
Nicht abrupt — nach Erscheinen der ersten echten Blätter (Tag 7–14) schrittweise über 3–5 Tage abhärten, beginnend mit 2–3 Stunden offener Luft (Block 5).

**Warum streckt sich mein Sämling so stark?**
Meist zu wenig oder zu weit entferntes Licht. Auch Hitze, Übernässung und zu dichte Bepflanzung tragen dazu bei (Block 11).

**Woran erkenne ich, dass die Sämlingsphase vorbei ist?**
An 3–4 Sätzen echter Blätter und sichtbaren Wurzeln an den Drainagelöchern, nicht an einem festen Kalendertag — 14 Tage ist nur ein typischer Richtwert (Block 6).

**Welcher Feuchtigkeitswert gilt jetzt eigentlich — 60–70 % oder 40–50 %?**
Beide, je nach Kontext: 60–70 % ist der allgemeine Wachstumskomfort für die spätere Sämlingsphase, 40–50 % die engere Zielspanne, wenn Damping-off-Risiko im eigenen Setup bereits ein Thema ist (Block 6).

## 16. `expert_tips`

Der größte, am wenigsten genutzte Hebel dieser Phase ist die **RH-Stufenprogression statt eines Flachwerts**: 75–80 % in der ersten Woche unter der Haube, dann schrittweise absenken auf 60–70 % zur Phasenmitte, und — sobald Luftzirkulation oder Substrat-Feuchtemanagement im eigenen Setup unsicher sind — bewusst weiter auf 40–50 % zur Vermeidung von Damping-off in der späten, haubenfreien Phase. Eine konstant hochgehaltene Feuchte "auf Nummer sicher" ist genau umgekehrt riskant: Sie erhöht das Pilzrisiko in der Phase, in der die Pflanze ohnehin beginnt, eigenständig zu regulieren. In Kombination mit der graduellen statt abrupten Dome-Entfernung (Block 5) lässt sich der Übergang aus der Keimkammer-Feuchte in die offene Raumluft ohne den doppelten Stressimpuls (Feuchtigkeitsabfall + mechanischer Kontakt) bewältigen, der die häufigste Ursache für einen Rückschlag genau an diesem Übergangspunkt ist.

---

*Ende Draft. Bereit für Stage 3 (Fact-Check, menschliches Pflicht-Gate) gemäß `ARTICLE_WORKFLOW.md` §4.*
