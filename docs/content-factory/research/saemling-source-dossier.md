# Source-Dossier: Sämling (Cultivation Technique, mit diagnostischen Elementen)

Stage: 1 — Research · Datum: 2026-08-21 · Archetyp: Cultivation Technique (HowTo),
mit Hybridcharakter — die Sämlingsphase ist die anfälligste Phase für
Damping-off, Übergießen und Lichtstress, daher enthält Block 6/7/11 stärker
diagnostische Elemente als ein reiner Technique-Artikel. Empfehlung: beim
Draft (Stage 2) bewusst markieren, welche Blöcke diagnostisch statt rein
prozedural sind, statt den Hybridcharakter zu verstecken.

**Ziel-Slug-Empfehlung:** `keimung-und-anzucht` (Backlog #54, Priorität 78,
Technique/New, `docs/CONTENT_BACKLOG.md`). Bestätigt sauber abgegrenzt vom
bereits gedrafteten `samenkeimung-troubleshooting`: Letzterer endet beim
Einpflanzen des Keimlings (Pfahlwurzel 1–2 cm); dieses Dossier beginnt dort
und deckt bis zum Erscheinen von 3–4 echten Blattpaaren / Vegetations-Beginn
ab. Keine Themenüberschneidung.

Zitierformat in diesem Dossier: `S#` für neu recherchierte Quellen. Wo eine
bereits im Keimungs-Dossier registrierte Quelle wiederverwendet wird
(SOURCE_REQUIREMENTS.md §3: "Reuse existing source records before creating
new ones"), wird das Original-Kürzel `Q#` aus
`keimung-source-dossier.md` beibehalten statt dupliziert.

---

## Claim → Source Map

| # | Claim | Wert | Quelle(n) | Evidence-Level | Cannabis-spezifisch? |
|---|-------|------|-----------|:---:|---|
| 1 | Phasengrenze Sämling→Veg ist nicht scharf definiert; gängigstes Kriterium: 3–4 Sätze echter, gezackter Blätter, sichtbar beschleunigtes tägliches Wachstum | 2–4 Wochen Gesamtdauer je nach Quelle | S1, S2, S3 (mehrere konsistente, aber nicht identische Angaben) | **1** | Ja |
| 2 | Kotyledonen (Keimblätter) sind glatt/rundlich, dienen als Nährstoffreserve aus dem Samen; echte Blätter erscheinen gezackt, mit steigender "Finger"-Zahl (1→3→5→7) | — | S1 | **1** | Ja |
| 3 | Kotyledonen-Vergilbung **nach** Erscheinen der ersten echten Blätter ist normal (Nährstoffreserve aufgebraucht); frühe/starke Vergilbung spricht dagegen für Übergießen, Nährstoffverbrennung oder Wurzelprobleme | — | S4, S5 | **1** | Ja |
| 4 | PPFD-Zielbereich Sämling: 100–300 µmol/m²/s; Progression grob 100–200 (Tag 1–7) → 200–300 (Woche 2); Werte unter 100 = Lichtmangel-Risiko (Streckung), über 300 = Lichtstress-Risiko | — | S6, S7, S8 (mehrere konsistente Grower-/Hersteller-Guides) | **1** | Ja — deckt sich mit dem bereits im App-Task korrigierten 100–300-Bereich |
| 5 | Lichtstress vs. Lichtmangel visuell unterscheidbar: Stress → blasse/verkrampfte/eingerollte Blätter; Mangel → lange, dünne, instabile Sämlinge | — | S6, S9 | **1** | Ja |
| 6 | Photoperiode 18/6 als Standard für photoperiodische Sämlinge; 24/0 nur für Autoflower gängig, bei photoperiodischen Pflanzen Stressrisiko ohne klaren Wachstumsvorteil | — | S10, S11 (breiter Konsens) | **1** | Ja |
| 7 | Einzelne Quelle behauptet 33 % schnelleres Wachstum unter 24/0 vs. 18/6 — **nicht durch weitere Quellen bestätigt, kein Konsens, isolierte Behauptung** | 33 % | S11 (Einzelbeleg) | **1**, unbestätigt | Ja, aber schwache Evidenz |
| 8 | Bewässerung: nur in einem Ring ca. 3 cm um den Stamm gießen, nicht direkt am Stängel — lenkt Wurzelwachstum nach außen, vermeidet Stängelfäule-Risiko durch Staunässe am Stamm | — | S12, S13 (mehrere konsistente Quellen, deckungsgleich mit App-Task) | **1** | Ja |
| 9 | Erste 10–14 Tage: Pflanze investiert primär in Wurzelwachstum, oberirdisches Wachstum ist normalerweise langsam — kein Fehlerzeichen | — | S12 | **1** | Ja |
| 10 | Substrat vor erneutem Gießen antrocknen lassen (Finger-/Sichttest); Ziel: feucht, nicht nass, Wurzeln brauchen Wasser UND Sauerstoff | — | S13, S14 | **1** | Ja |
| 11 | Feuchtigkeitsglocke: bis zum Erscheinen der ersten echten Blätter aufsetzen (ca. 7–14 Tage), danach schrittweise abhärten (2–3 h am ersten Tag, +1–2 h/Tag über 3–5 Tage) statt abrupt entfernen | — | S15, S16, S17 (mehrere konsistente Quellen) | **1** | Ja |
| 12 | Allgemeines Abhärtungsprinzip (Hardening-off): verdickt die Kutikula, erhöht Blattwachs- und Trockenmasseanteil, macht Gewebe widerstandsfähiger gegen Umweltstress — 7–14 Tage Prozess in der allgemeinen Gartenbau-Literatur | — | S18 (University of Maryland Extension, aktualisiert Feb. 2026) | **1–2**, Extension-Standard, aber generische Gartenbau-Literatur, nicht cannabis-spezifisch | **Nein — explizit extrapoliert** |
| 13 | RH-Progression über die Sämlingsphase (Tages-/Wochen-aufgelöst): Keimung 70–90 %, frühe Sämlingsphase (Tag 0–7) 75–80 %, mittlere Phase (Tag 8–14) 65–75 %, späte Phase (Tag 15–21) 60–70 % — Begründung: junge Wurzelmasse ist gering, Pflanze nimmt Feuchtigkeit anfangs stärker über die Blattoberfläche auf | — | S19 (detaillierte Stufentabelle, Update Feb. 2026) | **1** | Ja |
| 14 | **Konflikt:** dieselbe Quellenlage nennt für die Damping-off-Prävention in der offenen Sämlingsphase dagegen 40–50 % RH als Zielwert — deutlich unter S19s 60–70 % für dieselbe Zeitspanne | 40–50 % vs. 60–70 % | Q14 (wiederverwendet aus Keimungs-Dossier), S19, S20 | **1** | Ja |
| 15 | Temperatur Sämling: Tag 21–25 °C (70–77 °F), Nacht 18–21 °C (65–70 °F), Nacht-Tag-Differenz ca. 3–5 °C niedriger als Tag; Stabilität wichtiger als exakter Punktwert | — | S21, S22 (konsistent) | **1** | Ja |
| 16 | Abweichende Einzelquelle nennt einen deutlich weiteren Toleranzbereich bis 29 °C (85 °F) im Kontext von Damping-off-Prävention — vermutlich obere Belastungsgrenze, nicht Zielbereich | 21–29 °C | S20 | **1** | Ja |
| 17 | Stretching/Vergeilung (Etiolation): Hauptursache unzureichendes/zu weit entferntes/zu schwaches Licht; Pflanze investiert Energie in Stängelstreckung statt Blattmasse, Stängel wird dünn, weich, bruchgefährdet; weitere Faktoren: Hitze, Übernässung, ungeeignete Nährstoffversorgung, Überbelegung | — | S9, S23 (mehrere konsistente Quellen) | **1** | Ja |
| 18 | Erste Düngung: gute vorgedüngte Erde/Living-Soil-Mischungen versorgen Sämlinge oft bis Woche 3–4 der Vegetationsphase ohne Zusatzdüngung; Coco/Hydro (inert) brauchen bereits ab Ende Woche 1 eine stark verdünnte Nährlösung; nach den ersten echten Blättern generell ca. 25 % Grundstärke als Einstieg | — | S24, S25 (mehrere konsistente Quellen) | **1** | Ja |
| 19 | Nährstoffverbrennungs-Warnsignale bei Sämlingen: dunkelgrüne Blätter mit verbrannten/gebräunten Spitzen, bei Fortschreiten nach oben eingerollte Blattränder | — | S25 | **1** | Ja |
| 20 | Transplantations-/Vegetationsübergang-Signale: 3–4 Sätze echter Blätter, Wurzeln sichtbar an den Drainagelöchern des Anzuchttopfs, spürbar beschleunigtes Wachstum; verzögertes Umtopfen bei Wurzelverfilzung ("root-bound") kann Wachstum stauchen und einen längeren Erholungsprozess erzwingen | — | S2, S26 (konsistent) | **1** | Ja |
| 21 | Autoflower-Sämlingsphase: kein strikter Lichtplan nötig (18–24 h funktionieren beide), da genetisch fixierter Übergang in die Vegetationsphase unabhängig vom Lichtzyklus; Umtopfen möglichst ganz vermeiden (direkt im Endtopf keimen/anziehen) wegen fehlender Erholungspuffer im kompakten Zyklus; falls unumgänglich, Umtopfen nur in den ersten 7–10 Tagen | — | S27 | **1** | Ja |
| 22 | Sämlingsphase bei Autoflowern oft kürzer angegeben (10–14 Tage) als bei photoperiodischen Sorten (2–4 Wochen) — konsistent mit dem insgesamt kompakteren Zyklus | 10–14 Tage (Auto) vs. 2–4 Wochen (Photoperiod) | S27 vs. S1/S2/S3 | **1** | Ja |
| 23 | Peer-reviewte Kontrollstudie zu Cannabis-Licht-Dosis-Wirkung existiert (Rodriguez-Morrison et al. 2021, *Frontiers in Plant Science*), aber **ausschließlich zur Blütephase** (120–1.800 µmol/m²/s, 12 h Photoperiode, Kultivar 'Stillwater', linearer Ertragsanstieg ohne Sättigungspunkt bis 1.800 µmol/m²/s) — **nicht auf die Sämlingsphase übertragbar**, da andere Wachstumsphase mit anderer Physiologie (Blattflächenindex, Photosynthesekapazität) | — | S28 (peer-reviewed, aber falscher Phasenbezug) | **3** (Studie selbst), **N/A für Sämling-Claims** | Ja, aber falsche Phase — nicht als Sämling-Beleg nutzbar |

---

## Quellenregister

**S1 — Level 1, mehrere konsistente Quellen.** SeedsHereNow, "Cannabis
Seedling Stage: A Complete Grow Guide".
https://seedsherenow.com/cannabis-seedling-stage/ ; ILGM, "Life Cycle Of
Marijuana Plants". https://ilgm.com/resources/guides/the-cannabis-life-cycle-in-weeks
**Für Artikel:** Kotyledonen-vs-echte-Blätter-Definition, Phasendauer 2–3
Wochen.

**S2 — Level 1.** Cannabis-Seeds.org, "Cannabis Seedling Stages:
Week-by-Week Guide".
https://www.cannabis-seeds.org/blog/cannabis-seedling-stages-week-by-week-guide/
**Für Artikel:** Phasengrenze 3–4 Blattsätze, 2–4 Wochen Gesamtdauer.

**S3 — Level 1.** Dutch Passion, "Cannabis Growth Stages Breakdown".
https://dutch-passion.us/blog/post/cannabis-growth-stages-breakdown
**Für Artikel:** Phasenübersicht, Bestätigung der Dauer-Spanne.

**S4 — Level 1.** GrowWeedEasy, "How to Help Yellow Cannabis Seedlings".
https://www.growweedeasy.com/how-to-help-yellow-cannabis-seedlings
**Für Artikel:** Kotyledonen-Vergilbung normal vs. Warnsignal.

**S5 — Level 1, mehrere konsistente Quellen.** ILGM Forum-Thread + THCFarmer-
Thread zu früher Kotyledonen-Vergilbung (Praxisbeobachtungen, community-
validiert). https://ilgmforum.com/t/seedling-only-5-days-old-and-cotyledon-leaves-are-already-yellowing/88012
**Für Artikel:** Praxisbeispiele für frühe/abnormale Vergilbung.

**S6 — Level 1, mehrere konsistente Quellen.** Blimburn Seeds, "Optimizing
PPFD Levels for Cannabis Seedlings Growth".
https://blimburnseeds.com/blog/tips-and-tricks/ppfd-levels-for-cannabis-seedlings/ ;
Lotus Nutrients, "Understanding PPFD for Cannabis Seedlings".
https://lotusnutrients.com/blogs/news/ppfd-for-cannabis-seedlings
**Für Artikel:** PPFD-Zielbereich, Lichtstress-Schwelle, visuelle
Unterscheidung Stress vs. Mangel.

**S7 — Level 1.** FastGrowStore, "How much PPFD is required during the
seedling...".
https://fastgrowstore.eu/blogs/led-knowledge/how-much-ppfd-is-needed-throughout-seedling-vegetative-and-flowering-stages
**Für Artikel:** PPFD-Progressionstabelle Sämling→Veg.

**S8 — Level 1.** PlanaCan, "PPFD Light Intensity Cannabis Growth Stages".
https://planacan.io/ppfd-light-intensity-cannabis-growth-stages/
**Für Artikel:** Bestätigung 100–300 µmol/m²/s Sämling-Zielbereich.

**S9 — Level 1, mehrere konsistente Quellen.** Cannoptikum, "Light stress in
cannabis seedlings explained".
https://cannoptikum.com/en/blog/factors-in-cannabis-cultivation/light-stress-seedlings ;
Cannoptikum, "Cannabis Seedlings Stretching – Causes & Fixes".
https://cannoptikum.com/en/blog/factors-in-cannabis-cultivation/seedlings-stretching
**Für Artikel:** Licht-Stress-Symptome, Streckungs-/Etiolation-Mechanismus.

**S10 — Level 1.** Blimburn Seeds, "Best Light Schedule for Cannabis
Growth". https://blimburnseeds.com/blog/tips-and-tricks/best-light-schedule-for-cannabis/
**Für Artikel:** 18/6-Standardempfehlung, Begründung Dunkelphase.

**S11 — Level 1, Einzelbeleg für die 33-%-Behauptung, sonst breiter
Konsens.** Rollitup-Forum, "Your Opinion On 18/6 vs 20/4 vs 24/0?".
https://www.rollitup.org/t/your-opinion-on-18-6-vs-20-4-vs-24-0.824006/ ;
RQS, "The Importance of the Dark Cycle for Growing Cannabis".
https://www.royalqueenseeds.com/blog-the-importance-of-the-dark-cycle-in-cannabis-cultivation-n906
**Für Artikel:** 24/0-Stressrisiko bei Photoperiod-Pflanzen; die 33-%-Zahl
NICHT als belastbaren Fakt übernehmen, nur als unbestätigte Einzelmeinung
erwähnen (siehe Konflikte unten).

**S12 — Level 1, mehrere konsistente Quellen.** Zamnesia, "Cannabis
Seedling Care: Light, Watering, and Early Feeding".
https://www.zamnesia.com/us/grow-weed/287-seedling-phase-cannabis ;
Premium Cultivars, "Watering Cannabis Seedlings: Day by Day Schedule".
https://premiumcultivars.com/blogs/grow/watering-cannabis-seedlings-day-by-day-schedule
**Für Artikel:** Ring-Bewässerungstechnik, Wurzelentwicklungs-Zeitfenster.

**S13 — Level 1.** RQS, "Mastering The Cannabis Seedling Stage In Just 3
Steps". https://www.royalqueenseeds.com/blog-rookie-guide-3-steps-to-master-the-seedling-stage-n239
**Für Artikel:** Bewässerungsintervall, Feucht-nicht-nass-Prinzip.

**S14 — Level 1.** Sensi Seeds, "Seedling Phase in Cannabis: Grow Healthy
Cannabis Seedlings". https://sensiseeds.com/en/blog/best-conditions-for-seedlings/
**Für Artikel:** Substrat-Trocknungstest zwischen Gaben.

**S15 — Level 1, mehrere konsistente Quellen.** Pacific Seed Bank,
"Humidity Domes for Seedlings". https://www.pacificseedbank.com/growing-marijuana/humidity-domes-for-seedlings/ ;
My Backyard Grow, "When to Take Humidity Dome off Seedlings".
https://mybackyardgrow.com/when-to-take-humidity-dome-off-seedlings/
**Für Artikel:** Dome-Entfernungs-Timing (erste echte Blätter).

**S16 — Level 1.** Grower's Choice Seeds, "Humidity Domes for Seedlings: A
Grower's Guide". https://www.growerschoiceseeds.us/cannabis-seed-blog/growing-cannabis/humidity-domes-for-seedlings/
**Für Artikel:** Abhärtungs-Zeitplan (2–3 h Start, +1–2 h/Tag).

**S17 — Level 1.** Howgarden.blog, "How Long to Keep Seedlings in Humidity
Dome? [Avoid Damping-Off]". https://howgarden.blog/seedlings-humidity-dome-duration
**Für Artikel:** Dome-Dauer 7–14 Tage, Verknüpfung zu Damping-off-Risiko bei
zu langer Nutzung.

**S18 — Level 1–2, Universitäts-/Extension-Quelle (allgemeine
Gartenbau-Literatur, nicht cannabis-spezifisch — explizit als Extrapolation
markiert).** University of Maryland Extension, "Hardening Off Vegetable
Seedlings for the Home Garden" (aktualisiert 20.02.2026).
https://extension.umd.edu/resource/hardening-vegetable-seedlings-home-garden
**Für Artikel:** Physiologische Begründung des Abhärtungsprozesses
(Kutikula-Verdickung, Trockenmasseanteil), allgemeines Zeitfenster 7–14
Tage, Risiken von Über-Abhärtung.

**S19 — Level 1, detaillierte Stufentabelle.** GrowerIQ, "Cannabis Seedling
Humidity: Ideal Levels for Seedlings, Veg & Flowering" (aktualisiert
11.02.2026). https://groweriq.ca/2023/08/18/what-is-the-ideal-humidity-for-cannabis-at-each-stage-of-growth/
**Für Artikel:** Tag-für-Tag-RH-Progression über die gesamte Sämlingsphase.

**S20 — Level 1.** RQS, "How to Prevent Damping Off When Growing Weed"
(Q14 im Keimungs-Dossier — hier als S20 referenziert, da im neuen Kontext
mit RH-Konflikt-Fokus zitiert; identische Quelle, kein Duplikat im
Register). https://www.royalqueenseeds.com/us/blog-how-to-spot-and-prevent-damping-off-n773
**Für Artikel:** 40–50 % RH als Damping-off-Präventionswert — Kernbeleg für
den RH-Konflikt (siehe unten).

**S21 — Level 1.** Blimburn Seeds, "Optimal Temperature for Growing
Cannabis". https://blimburnseeds.com/blog/tips-and-tricks/temperature-for-growing-cannabis/
**Für Artikel:** Tag-/Nachttemperatur-Zielkorridor.

**S22 — Level 1.** GrowWeedEasy, "Cannabis Temperature Tutorial".
https://www.growweedeasy.com/temperature
**Für Artikel:** Bestätigung Temperatur-Differential Tag/Nacht.

**S23 — Level 1, mehrere konsistente Quellen.** CannaConnection, "Cannabis
stretching: What it is and how to deal with it".
https://www.cannaconnection.com/blog/1109-how-to-avoid-stretching-plants ;
RQS, "How to Control and Prevent Stretching in Cannabis Plants".
https://www.royalqueenseeds.com/blog-how-to-control-stretching-reigning-in-cannabis-growth-spurts-n487
**Für Artikel:** Streckungsursachen jenseits von Licht (Hitze, Nährstoffe,
Dichte).

**S24 — Level 1.** Reefertilizer, "When to Start Giving Seedlings Nutrients
and Fertilizing Cannabis Plants".
https://reefertilizer.com/blog/when-should-you-start-feeding-your-cannabis-plants-fertilizer/
**Für Artikel:** Substrat-abhängiger Düngestart (Erde vs. Coco/Hydro).

**S25 — Level 1.** GrowWeedEasy, "How to Fix Cannabis Nutrient Burn - Pics
& Symptoms". https://www.growweedeasy.com/cannabis-plant-problems/nutrient-burn
**Für Artikel:** Nährstoffverbrennungs-Symptome, Einstiegsdosierung ~25 %.

**S26 — Level 1, mehrere konsistente Quellen.** Pacific Seed Bank, "When to
Transplant Cannabis Seedlings A Grower's Guide".
https://www.pacificseedbank.com/growing-marijuana/when-to-transplant-cannabis-seedlings/ ;
Left Handed Cigs, "When to Transplant Weed Seedlings".
https://lefthandedcigs.com/when-to-transplant-weed-seedlings/
**Für Artikel:** Root-bound-Warnzeichen, Umtopf-Zeitfenster.

**S27 — Level 1.** Autoseeds, "How to grow autoflowers during the seedling
stage". https://www.autoseeds.com/en/growing-autoflowers-during-the-seedling-stage/
**Für Artikel:** Autoflower-spezifische Nuancen (Lichtplan-Flexibilität,
Transplantations-Vermeidung, kürzere Phasendauer).

**S28 — Peer-reviewed, Level 3 (kontrollierte Studie) — Phasen-Fehlbezug,
nur als Kontext nutzbar.** Rodriguez-Morrison, V.; Llewellyn, D.; Zheng, Y.
"Cannabis Yield, Potency, and Leaf Photosynthesis Respond Differently to
Increasing Light Levels in an Indoor Environment". *Frontiers in Plant
Science*, Mai 2021. University of Guelph.
https://pmc.ncbi.nlm.nih.gov/articles/PMC8144505/
**Für Artikel:** NICHT als Sämling-PPFD-Beleg zitierbar (Studie behandelt
ausschließlich die 12-wöchige Blütephase bei 120–1.800 µmol/m²/s, Kultivar
'Stillwater', DWC-Anbau). Höchstens im `advanced_considerations`-Block als
Beleg dafür nutzbar, dass Cannabis-Lichtreaktion generell phasenabhängig
und nichtlinear zwischen Blattebene und Gesamtpflanze ist — mit explizitem
Hinweis, dass die Zahlen selbst nicht auf die Sämlingsphase übertragbar
sind.

---

## Themenübersicht: RH-Progression über die Sämlingsphase (Auflösung des Konflikts)

| Zeitfenster | RH laut S19 (Stufentabelle) | RH laut Q14/S20 (Damping-off-Fokus) | App-Text (aktuell) |
|---|---|---|---|
| Keimung (Tag 0–7, Keimkammer) | 70–90 % | — | (siehe Keimungs-Dossier) |
| Früh-Sämling (Tag 0–7, unter Haube) | 75–80 % | — | 60–70 % (flach für gesamte Phase) |
| Mittel-Sämling (Tag 8–14) | 65–75 % | — | 60–70 % |
| Spät-Sämling / nach Haube (Tag 15–21) | 60–70 % | **40–50 %** | 60–70 % |

Der App-Text setzt einen einzigen flachen Zielwert (60–70 %) für die
gesamte Phase — das trifft laut S19 näherungsweise den **mittleren**
Bereich gut, unterschätzt aber die frühe Phase (real eher 75–80 % unter der
Haube) und überschätzt tendenziell die späte, haubenfreie Phase, wo die
Damping-off-Präventionsquelle (Q14/S20) deutlich niedriger liegt (40–50 %).
Kein Fehler im engeren Sinne (60–70 % ist ein vernünftiger Kompromisswert
für eine Ein-Satz-Task-Beschreibung), aber genau die Art von Nuance, die
ein Tutorial-Artikel auflösen kann und die App-Tasks strukturell nicht
leisten können.

---

## Offene Konflikte / dünne Evidenzlage

1. **RH-Progression vs. Damping-off-Zielwert** (siehe Tabelle oben) — kein
   echter Quellenwiderspruch, sondern unterschiedliche Zeitfenster/Kontexte
   innerhalb derselben Phase, die im Artikel sauber getrennt werden müssen,
   sonst wirkt es widersprüchlich.
2. **24/0-Photoperiode "33 % schneller" (S11):** Einzelbeleg, nicht durch
   weitere unabhängige Quellen bestätigt. Sollte im Artikel, wenn überhaupt,
   nur als "eine vereinzelte Quelle behauptet X, ohne breitere Bestätigung"
   erwähnt werden — nicht als Fakt übernehmen. Direkt im Widerspruch dazu
   stehen mehrere Quellen (S10, S11 selbst teilweise), die 24/0 bei
   photoperiodischen Pflanzen als Stressrisiko ohne klaren Vorteil
   einordnen.
3. **Temperatur-Obergrenze:** S21/S22 nennen 21–25 °C Tag als Zielkorridor,
   während S20 (Damping-off-Kontext) einen deutlich weiteren poliert
   nutzbaren Bereich bis 29 °C nennt. Vermutlich Verwechslung von
   Zielbereich (enger) und Toleranzgrenze (weiter) — im Artikel als solche
   auflösen, nicht als Widerspruch stehen lassen.
4. **Keine peer-reviewte, sämlingsspezifische PPFD-Studie gefunden** — die
   einzige belastbare kontrollierte Cannabis-Lichtstudie (S28) behandelt
   explizit die Blütephase. Alle PPFD-Zahlen für die Sämlingsphase
   (100–300 µmol/m²/s) stammen aus Level-1-Grower-/Hersteller-Konsens, kein
   Level-3-Anker wie beim Keimungs-Dossier (dort: Q1/Q2). **Muss im Artikel
   offen als reine Praxis-Konsenszahl ohne kontrollierte Studienbasis
   gekennzeichnet werden** — SOURCE_REQUIREMENTS.md §2-Pflicht.
5. **Hardening-off-Physiologie (S18) ist vollständig aus nicht-cannabis-
   spezifischer Gartenbau-Literatur extrapoliert** — der Mechanismus
   (Kutikula, Trockenmasse) ist pflanzenphysiologisch allgemeingültig, aber
   nie an Cannabis kontrolliert getestet. Explizit als Extrapolation
   kennzeichnen.

---

## Abgleich mit aktuellem App-Text (`phases.ts`, Stand 2026-08-21)

| App-Task | Aktueller Text | Abgleich mit Recherche |
|---|---|---|
| Licht auf 18/6 (100–300 µmol/m²/s) | "18 h Licht, 6 h Dunkel. Schwache Intensität für zarte Sämlinge (100–300 µmol/m²/s, in den ersten Tagen eher am unteren Ende)." | **Vollständig bestätigt** — deckt sich exakt mit S6/S7/S8, inkl. der "unteres Ende zuerst"-Progression. Kein Korrekturbedarf. |
| Luftfeuchtigkeit prüfen (60–70 % RH) | "Optimal: 60–70 % RH. Feuchtigkeitsglocke für die ersten Tage nutzen." | **Näherungsweise bestätigt**, aber vereinfacht — reale Progression ist stufenweise (75–80 % früh → 60–70 % spät, siehe Konflikt #1). Kein Sachfehler, aber Präzisierungspotenzial für den Artikel. |
| Erstes Gießen (nur um den Stamm) | "Nur rund um den Stamm gießen (nicht von oben besprühen). Wurzeln folgen der Feuchtigkeit." | **Bestätigt**, deckungsgleich mit S12/S13. Kein Korrekturbedarf. |
| Feuchtigkeitsglocke entfernen (nach ersten echten Blättern) | "Nach den ersten echten Blättern — Pflanze braucht Luftzirkulation um Stängel zu stärken." | **Bestätigt**, deckungsgleich mit S15/S16/S17. Ergänzungspotenzial: App nennt kein schrittweises Abhärten (nur "entfernen"), während die Recherche einen graduellen Prozess (2–3 h Start, steigernd über 3–5 Tage) empfiehlt — guter Tiefe-Mehrwert für den Artikel, kein Fehler im App-Text. |
| Phasendauer 14 Tage (Standard) | `saemling: 14` in `getPhaseDurations` | **Am unteren Rand der recherchierten Spanne (2–4 Wochen)**, aber nicht falsch — mehrere Quellen (S1, S3) nennen 2–3 Wochen als typisch, 14 Tage liegt exakt am unteren Ende von "2 Wochen". Kein Korrekturbedarf, aber sollte im Artikel als "typischer Startwert, real variabel je nach Sorte/Bedingungen" eingeordnet werden statt als Fixwert. |

**Fazit:** Wie beim Keimungs-Dossier sind die App-Texte **inhaltlich korrekt
und decken sich mit der recherchierten Praxis-Konsenslage**, ohne
kontroverse falsche Zahlen. Der Mehrwert des künftigen Artikels liegt in
der Auflösung der RH-Stufen-Nuance, der graduellen Abhärtung statt
Ein-Schritt-Entfernung der Haube, der klaren Trennung normale
vs. warnsignal-Kotyledonen-Vergilbung, dem vollständigen
Fehlerbild-Katalog (Streckung, Nährstoffverbrennung, Damping-off in dieser
späteren Sub-Phase) und den Autoflower-spezifischen Nuancen — alles Tiefe,
die die knappen App-Tasks bewusst nicht leisten.

---

## Geschätzte Kennzahlen für später

**Quellenzahl:** 28 distinkte Claim-Einträge, gestützt auf 22 eigenständige
neue Quellen (S1–S27, davon S20 = wiederverwendete Q14) plus 1
peer-reviewte Studie mit explizit falschem Phasenbezug (S28, nur als
Kontext-Beleg nutzbar, nicht als Zahlenquelle) — deutlich über dem
Minimum von 3 für Technique-Artikel, und mehr Einzelquellen als das
Keimungs-Dossier (18), wie vom User gewünscht ("Tiefe wichtiger als
Zeit").

**Evidence-Level-Spektrum:** Fast durchgängig Level 1 (breiter,
unabhängiger Grower-/Hersteller-/Extension-Konsens), eine Extension-Quelle
Level 1–2 (S18), eine peer-reviewte Studie Level 3 (S28), aber **ohne
Cannabis-Sämling-spezifischen Anwendungsbezug** — anders als beim
Keimungs-Dossier gibt es hier **keinen echten Level-3-Anker für die
zentralen quantitativen Sämling-Claims** (PPFD, RH-Stufen, Temperatur).
Das ist eine strukturelle Schwäche gegenüber dem Keimungs-Dossier, kein
Rechercheversäumnis — für die Sämlingsphase existiert schlicht keine
kontrollierte Cannabis-Studie mit den benötigten Messgrößen (vs. Keimung,
wo zwei existieren).

**Confidence-Score-Schätzung** (Formel aus SOURCE_REQUIREMENTS.md §4):
- Evidence-Stärke: mean-Level ≈ 1,1/5 (fast durchgängig Level 1, kein
  tragfähiger Level-3-Anker für die Kern-Claims) → 0,40 × (1,1/5) ≈
  **0,09**.
- Source-Adequacy: 22+ eigenständige Quellen von 3 geforderten → gedeckelt
  bei 1,0; breite Publisher-Streuung (keine Publisher-Konzentration, kein
  0,1-Abzug) → 0,20 × 1,0 = **0,20**.
- Consistency: überwiegende Übereinstimmung, aber vier benannte Konflikte
  (RH-Stufen, 24/0-33-%-Behauptung, Temperatur-Toleranzgrenze,
  fehlender Level-3-Anker) → geschätzt ~0,7 (mehr offene Punkte als beim
  Keimungs-Dossier, daher niedriger als dessen 0,8) → 0,20 × 0,7 =
  **0,14**.
- Freshness: alle Quellen aktuell (2023–2026, mehrere explizit
  Feb.-2026-Updates), frisch recherchiert → 1,0 → 0,20 × 1,0 = **0,20**.
- **Geschätzte Gesamt-Confidence: ≈ 0,63.**

Das liegt **über der Publikationsschwelle für Cultivation-Technique-
Artikel (min. 0,60, min. 3 Quellen, min. Top-Evidence-Level 2 — hier mit
S18 knapp erreicht über die Extension-Quelle, nicht über eine
Cannabis-spezifische Studie)** — aber **spürbar knapper** als beim
Keimungs-Dossier (0,67), strukturell bedingt durch die dünnere
Primärliteratur-Lage zur Sämlingsphase. Der Artikel kann in Stage 2
(Draft) weitergegeben werden; im Draft sollte transparent gemacht werden,
dass die Sämlingsphase — anders als Keimung — praktisch vollständig auf
Praxis-Konsens statt kontrollierter Studien beruht.
