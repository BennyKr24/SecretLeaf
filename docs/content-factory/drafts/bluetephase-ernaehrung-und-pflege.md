# Draft — Blütephase: Ernährung, Support und der Weg zur Ernte

Stage: 2 — Draft · Datum: 2026-08-22 · Basis: `docs/content-factory/research/bluete-source-dossier.md` (~45 Quellen B1–B40, vier kontrollierte/beobachtende Cannabis-relevante Studien B7/B8/B9/B32, eine peer-reviewte PPFD-Studie B37)

> Zitierformat: `(B#)` verweist auf die Quellen im Stage-1-Blüte-Dossier. Jede Zahlenangabe ist dort mit Titel, Publisher, Jahr, URL/DOI und Evidence-Level hinterlegt. EC-, VPD-, PPFD-Zielbereiche und die genetikabhängige Blütedauer (Indica 42/Hybrid 49/Sativa 70 Tage Kernblüte + 14 Tage Spätblüte) wurden bereits im Kalibrierungsaudit dieser Session verifiziert (siehe `TODO.md`, `lib/grow/phases.ts`, `lib/tools/vpd.ts`, `lib/tools/lighting.ts`, `nutrients.ts`) und werden hier nur referenziert, nicht neu belegt.

**Hybridcharakter:** Wie Sämling und Veg ist auch die Blütephase überwiegend prozedural (Lichtumstellung, Nährstoffwechsel, Defoliation, Support als Methoden), enthält aber diagnostische Elemente: den Nährstoffsperre-Check über Runoff, die Ca/Mg-Mangel-Differenzierung und die ehrliche Einordnung der Lichtdichtigkeits-/Hermaphroditismus-Vorsichtsmaßnahme. Block 6 und 7 sind entsprechend diagnostisch aufgebaut.

---

## Front matter

```yaml
slug: bluetephase-ernaehrung-und-pflege
title: "Blütephase: Ernährung, Support und der Weg zur Ernte"
summary: "Wie die Umstellung von N auf P/K in der Blüte richtig getimt wird, was die Studienlage zum P/K-Bloom-Booster-Narrativ wirklich hergibt, und wie eine Pflanze strukturell und ernährungsseitig durch Stretch, Knospenbildung und Reifung geführt wird."
category: anbau
difficulty: intermediate
entity_type: HowTo
language: de
meta:
  evidence_level: 1
  confidence_score: 0.67
  last_review_date: 2026-08-22
  review_horizon_months: 18
relations:
  - { type: prerequisite, to: vegetationsphase-training-und-pflege }
  - { type: see_also,     to: fuetterungsplan-nach-phase }
  - { type: see_also,     to: lichtspektrum-und-bluete }
  - { type: see_also,     to: defoliation-entlauben }
  - { type: see_also,     to: bud-rot-botrytis }
tool_links:
  - { kind: calculator, slug: naehrstoff-rechner, label: "Nährstoff-Rechner", href: "/tools/naehrstoff-rechner" }
  - { kind: calculator, slug: vpd,               label: "VPD-Rechner",       href: "/tools/vpd" }
  - { kind: calculator, slug: licht-rechner,     label: "Licht-Rechner",     href: "/tools/licht-rechner" }
```

**Hinweis zu `evidence_level: 1` trotz vier kontrollierter/beobachtender Cannabis-relevanter Studien:** Dieses Dossier hat die zweitstärkste Studienlage der bisherigen Reihe nach Veg — zwei akademisch rigorose kontrollierte Studien zu NPK-Optimierung (B8, B9), eine industriefinanzierte kontrollierte Studie zu PK-Zusatzprodukten (B7) und eine Beobachtungsstudie zu Lichtdichtigkeit/Hermaphroditismus (B32), dazu eine peer-reviewte PPFD-Intensitätsstudie (B37). Trotzdem bleibt der Artikel-Gesamtwert bei Level 1, weil mehrere praktisch zentrale Aussagen — NPK-Übergangsverhältnis, Defoliation-Zeitfenster, Stützsystem-Timing — ausschließlich auf Praxis-Konsens beruhen, und `meta.evidence_level` per Definition der **schwächsten tragenden Quelle** folgt (`SOURCE_REQUIREMENTS.md` §2), nicht dem Durchschnitt. `confidence_score = 0.67` liegt trotzdem über der 0.60-Schwelle für Technique-Artikel.

**Stage-3-Fact-Check (2026-08-22, KI-gestützt) bestanden:** Alle 15 geprüften Zahlenaussagen stimmen mit den zitierten Dossier-Quellen überein, beide Konflikte (P/K-Bloom-Booster, Lichtdichtigkeit/Hermaphroditismus) sind im Fließtext benannt statt verschwiegen, `confidence_score` wurde von der Stage-1-Schnellschätzung (0,64) auf den formelbasierten Wert 0,67 korrigiert. Details, Claim-für-Claim-Verifikation und die vier ausstehenden menschlichen Sign-offs (Stage 4): `docs/content-factory/fact-checks/bluetephase-ernaehrung-und-pflege-fact-check.md`. Artikel-Status: `in_review`, nicht `published`.

---

## 1. `definition`

Die Blütephase beginnt mit der Umstellung auf einen 12/12-Lichtzyklus (photoperiodisch) bzw. genetisch fixiert (Autoflower) und endet mit der Ernte. Dieser Artikel behandelt die **Kernblüte** — Lichtumstellung bis zum Einsetzen der Reifung — nicht die separat geführte Spätblüte/Flush-Phase. SecretLeafs Grow-OS setzt die Kernblütendauer genetikabhängig auf 42 Tage (Indica), 49 Tage (Hybrid) bzw. 70 Tage (Sativa), jeweils zzgl. 14 Tage Spätblüte — diese Werte wurden bereits im Rahmen des Kalibrierungsaudits dieser Session recherchiert und bestätigt (`lib/grow/phases.ts`, siehe `TODO.md`) und sind nicht Gegenstand dieses Artikels. Ziel der Phase ist die kontrollierte Umlenkung der pflanzlichen Ressourcen von vegetativem Wachstum auf Knospenbildung — ernährungsseitig, strukturell (Support) und lichttechnisch (Dichtigkeit, Intensität).

## 2. `scientific_background`

Der Nährstoffwechsel N→P/K in der Blüte folgt einem physiologischen Grundmuster: Phosphor ist zentral für den Energietransfer (ATP) bei Zellteilung und Knospenbildung, Kalium reguliert den Zuckertransport und den osmotischen Druck in den sich entwickelnden Blüten, während der Stickstoffbedarf mit dem Rückgang des vegetativen Blattwachstums sinkt. Der verbreitete Praxis-Konsens setzt dafür ein NPK-Verhältnis von ca. 1-3-2 in früher/mittlerer Blüte, graduell weiter Richtung 0-3-3 in später Blüte, mit dem Übergang über die ersten 2–3 Wochen statt eines abrupten Wechsels (B1–B6). **Was die Studienlage zu diesem Muster tatsächlich hergibt, ist differenzierter** — siehe Block 6, der zentrale Befund dieses Dossiers.

Parallel dazu steigt der Calcium- und Magnesiumbedarf in der Blüte an: Ca ist am Protein- und Energiestoffwechsel beteiligt, Mg erhöht die P-Mobilität in der Pflanze. Hochdosierte P/K-Blütedünger können die Ca/Mg-Aufnahme hemmen, besonders früh in der Blüte (Woche 3–6) (B11–B14) — ein Interaktionseffekt, der die reine NPK-Betrachtung ergänzt (Block 7, 10).

## 3. `plant_physiology`

In den ersten ein bis drei Wochen nach der Lichtumstellung setzt der aus der Veg-Phase bekannte "Stretch" ein (ausführlich im Veg-Dossier behandelt, hier nur als Kontext: 2–3× Höhenwachstum, sortenabhängig). Der Stretch hat eine direkte Konsequenz für die Nährstoffversorgung: Der Wasserverbrauch steigt sprunghaft an, was den Substrat-pH in der Wurzelzone verschieben kann (Ziel-pH 5,8–6,3 je nach Medium). Als Gegenmaßnahme wird bis zu 15–20 % Runoff beim Gießen empfohlen, um Salzaufbau und pH-Drift zu vermeiden; in Coco dagegen zunächst kleine Gaben ohne Runoff, um in den ersten 1–2 Tagen die Substrat-EC aufzubauen, danach gezielt höhere Runoff-EC anstreben, um den Stretch zu bremsen (B15).

Strukturell wird die Pflanze in der weiteren Blüte zunehmend kopflastig: Knospen gewinnen an Gewicht, Äste können ohne Unterstützung abknicken — typischerweise ab Woche 4–5 relevant (B25–B29, Block 5, 8).

## 4. `symptoms` → Ziel & Indikationen

Ziel dieser Phase ist die kontrollierte Versorgung der Pflanze durch Stretch, Knospenaufbau und Reifevorbereitung, ohne Nährstoffstress, Lichtlecks oder strukturelle Schäden. Ausgangspunkt ist eine gesunde, etablierte Pflanze am Ende der Veg-Phase (siehe `vegetationsphase-training-und-pflege`) mit stabilem, nicht mehr fragilem Kronendach. Nicht geeignet für aggressive Trainingseingriffe: Pflanzen mit akutem Nährstoffmangel, Schädlingsbefall oder sichtbarem Stress sollten vor der Lichtumstellung stabilisiert werden, da die Blütephase selbst durch Stretch und Umstellung bereits eine physiologische Belastung darstellt.

## 5. `causes` → Methode Schritt-für-Schritt

**Lichtumstellung (Tag 0)**
1. Für photoperiodische Pflanzen auf 12/12 umstellen; Autoflower benötigen keine Umstellung (Block 12).
2. Lichtdichtigkeit des Grow-Raums prüfen — Vorsichtsmaßnahme, deren Kausalität zu Hermaphroditismus wissenschaftlich dünn belegt ist (siehe Block 6, Konflikt).

**Nährstoffumstellung (ab Tag 3)**
1. Graduell über 2–3 Wochen von vegetativem NPK auf ca. 1-3-2 (früh/mittel Blüte) umstellen, spät Blüte weiter Richtung 0-3-3 (B1–B6).
2. EC langsam auf den bereits verifizierten Blüte-Zielwert steigern (`naehrstoffbedarf`-Cross-Reference, Block 9).

**pH-Monitoring Woche 1 (ab Tag 7)**
1. Ablauf-EC und Runoff-pH täglich messen, insbesondere während des Stretch-bedingten Wasserverbrauchsanstiegs.
2. Bei Drift außerhalb 5,8–6,3: Runoff-Strategie aus Block 3/8 anwenden.

**Defoliation (zwei Fenster, B16–B24)**
1. Fenster 1 — kurz vor bis in den ersten 2 Wochen 12/12: untere, nicht-produktive Triebe entfernen, Energie nach oben lenken.
2. Fenster 2 — Woche 3–4 (Tag 21–25): große, blütenlichtblockierende Fächerblätter entfernen, max. 20–30 % der Blattmasse.
3. **Nicht während des aktiven Stretch (Tag 1–21) defoliieren.**
4. Nach Tag 25–28 nur noch sanitäre Entfernung (gelbe/tote/schimmlige Blätter) — echte Spätblüte-Defoliation (Woche 6–7) wird von mehreren Quellen aktiv abgeraten (Block 6, 11).

**Stützsysteme (Woche 4–6, B25–B29)**
1. Trellis-Netting idealerweise bereits spät-vegetativ/früh-blühend installieren, vor dem Stretch.
2. Zweite Netzlage 8–12 Zoll über der ersten während der Blüte für zusätzliche Stützung schwerer Kolas.
3. Alternativ Jo-Jo-Seile oder Bambusstäbe, sobald Blüten sichtbar schwer genug werden (Woche 4–5).

## 6. `diagnosis` → Erfolgsbewertung

**Der P/K-Bloom-Booster-Konflikt — Kernstück dieses Dossiers:** Drei unabhängige kontrollierte Studien widersprechen dem verbreiteten "mehr P/K-Zusatzprodukt = mehr Ertrag und Potenz"-Marketing-Narrativ. Eine rigorose DWC-Studie an Gelato-Klonen (central-composite Design, ≥5 Wiederholungen/Behandlung) fand die optimale Konzentration für maximalen Ertrag (144 g/Pflanze) bei N 194 mg/L, P 59 mg/L — **Kalium zeigte im getesteten Bereich 60–340 mg/L keine Ertragswirkung**, kommerzielle Empfehlungen von 300–400 mg/L K wurden von den Autoren als "wahrscheinlich exzessiv" eingeordnet; keine Cannabinoid-Wirkung durch NPK-Variation gefunden (B8). Eine zweite, unabhängige Growth-Chamber-Studie an einem Hemp-Kultivar testete Root-Zone-P bei 25/50/75 mg/L und fand **keinen signifikanten Unterschied** in Ertrag oder Cannabinoid-Konzentration zwischen den Stufen — Leachate-P stieg dagegen 12-fach bei nur 3-facher Erhöhung des P-Inputs, überschüssiges P wird schlicht ausgewaschen, nicht genutzt (B9). Eine dritte, industriefinanzierte Studie an zwei Kultivaren fand für ein PK-Zusatzprodukt einen Ertragseffekt bei einer von zwei Sorten, **aber keine statistischen Unterschiede bei THC-% oder Gesamtterpenen** (B7).

Für die Praxis heißt das: Moderate P-Werte (~25–60 mg/L) sind bereits ausreichend, K zeigt in der stärksten verfügbaren Studie gar keinen Ertragseffekt, und keine der drei Studien fand eine Cannabinoid-Steigerung durch mehr P/K. Die bereits im Nährstoff-Rechner hinterlegten EC-Zielwerte sind damit der verlässlichere Hebel als teure Zusatzprodukte — ohne dass B7 (industriefinanziert, aber durch zwei unabhängige akademische Studien gestützt) als Herstellerbashing missverstanden werden sollte.

**Lichtdichtigkeit/Hermaphroditismus — Vorsicht bleibt sinnvoll, ist aber nicht streng bewiesen:** Der verbreitete Grower-Konsens, jede minimale Lichteinstrahlung während der Dunkelphase löse Zwitterbildung aus (B30), wird durch die einzige auffindbare Studie zu diesem Thema **nicht bestätigt, aber auch nicht widerlegt**. Eine Beobachtungsstudie (n=403 Pflanzen, Indoor) nutzte die Distanz zur Raumtür als Proxy für Dunkelphasen-Lichtexposition und fand keinen praktisch relevanten Zusammenhang mit der Hermaphroditismus-Rate (R²=0,016 — das Modell erklärt nur 1,6 % der Varianz; statistisch signifikant, aber die Effektgröße ist vernachlässigbar). Die Autoren selbst räumen ein, dass die tatsächlichen Lichtintensitäten in der Studie vermutlich zu niedrig waren, um "very-low-fluence"-Reaktionen sauber zu testen (B32). Praktische Konsequenz: Die Vorsichtsmaßnahme bleibt sinnvoll, da der potenzielle Schaden (verlorene Ernte durch Samenbildung) hoch und die Kosten der Prävention niedrig sind — aber die Kausalität sollte nicht als wissenschaftlich bewiesen dargestellt werden.

## 7. `corrective_actions`

**Nährstoffsperre (Lockout):** Symptome ähneln Mangelerscheinungen — Vergilbung, Blattrand-Verbrennung, gebogene Ränder, gestauchtes Wachstum, reduzierte Blütenentwicklung. Ursache ist Salzansammlung in der Wurzelzone, die Nährstoffaufnahme trotz ausreichender/überschüssiger Düngung blockiert. Diagnose über Runoff-pH (außerhalb 6,0–6,8 Erde/5,5–6,5 Hydro) und Runoff-EC, nicht über bloße Symptomoptik (B33–B36).

**Calcium-Mangel:** Rostfarbene, unregelmäßige Flecken auf jungen Blättern, Blattränder rollen sich ein, keine Vergilbung, grüne Adern bleiben erhalten — Unterscheidungsmerkmal zu Magnesiummangel. Rust-Spot-Erscheinungen auf jungen Blüte-Blättern werden häufig mit Kaliummangel oder generellem "Blüte-Stress" verwechselt. Ursache ist oft nicht reiner Nährstoffmangel, sondern falscher pH, hohe EC, Überwässerung oder Wurzelschaden, die den Ca-Transport blockieren — korrekte Diagnose erfordert deshalb erst den pH-/EC-Runoff-Check aus Block 6/7, bevor Ca-Präparate zugesetzt werden (B40).

## 8. `preventive_measures`

**Runoff-Strategie:** Bis zu 15–20 % Runoff beim Gießen in Erde/Hydro, um Salzaufbau und Wurzelzonen-pH-Drift präventiv zu vermeiden; in Coco die zweistufige Strategie aus Block 3 (erst EC-Aufbau ohne Runoff, dann gezielter Runoff) fahren.

**Defoliation-Timing einhalten:** Die Sperrzeit während des aktiven Stretch (Tag 1–21) und die Tag-25–28-Grenze für die letzte substanzielle Defoliation (Block 5) verhindern, dass die Pflanze Blattmasse verliert, die sie für die finale Reifung noch braucht.

**Support vor Bedarf installieren:** Trellis-Netting vor dem Stretch statt erst reaktiv in Woche 5 aufstellen — ein flaches, gut gestütztes Kronendach lässt sich kaum noch nachträglich erzwingen, wenn Knospen bereits schwer sind.

## 9. `environmental_factors`

VPD- (1,0–1,5 kPa), PPFD-Zielbereich (600–1000 µmol/m²/s) und EC-Zielwerte für die Blütephase wurden bereits im Kalibrierungsaudit dieser Session recherchiert und in `lib/tools/vpd.ts`, `lib/tools/lighting.ts` bzw. `nutrients.ts` verankert (siehe `TODO.md`) — **N/A für dieses Dossier**, um Doppelarbeit zu vermeiden. Neu und nicht bereits verifiziert ist die **PPFD-Progression innerhalb der Blüte**: Eine kontrollierte Studie an einem Hemp-Kultivar in vertikalen Anbausystemen testete PPFD 200/400/600 µmol/m²/s über 35 Tage Blüte — CBDAS-Genexpression und Gesamt-CBD stiegen linear im gesamten Bereich, +36,88 % Gesamt-CBD bei 600 vs. 200 µmol/m²/s, CBD-Ertrag/Pflanze +248 % von 200→400 µmol/m²/s; die Autoren vermuten weiteren Nutzen oberhalb 600 µmol/m²/s als unerforscht (B37). Die Studie ist an einem Hemp-, nicht Drug-Type-Kultivar durchgeführt — eine Extrapolation, aber die Richtung ist konsistent mit dem bereits verifizierten 600–1000-µmol-Zielbereich und liefert diesem erstmals einen konkreten Wirkmechanismus statt nur eines Praxis-Richtwerts.

## 10. `nutrient_interactions`

Praxis-Richtwert für den NPK-Übergang: ca. 1-3-2 früh/mittel Blüte, graduell weiter Richtung 0-3-3 spät Blüte, Umstellung über die ersten 2–3 Wochen statt abrupt (B1–B6, Block 2, 5) — differenzierter eingeordnet durch die Studienlage aus Block 6 (K ohne nachgewiesene Ertragswirkung im moderaten Bereich). Ca/Mg-Bedarf steigt parallel an; hochdosierte P/K-Düngung kann die Ca/Mg-Aufnahme hemmen, besonders Woche 3–6 (B11–B14, Block 2, 7) — bei Ca-Mangel-Symptomen deshalb nicht reflexhaft nachdüngen, sondern erst Runoff-pH/EC prüfen (Block 7). Die konkreten EC-Zielwerte sind bereits im Kalibrierungsaudit dieser Session in `nutrients.ts` verankert und über SecretLeafs Nährstoff-Rechner abrufbar — hier nur als Cross-Reference, nicht neu bewertet.

## 11. `common_mistakes`

- **P/K-Bloom-Booster als garantierten Ertrags-/Potenz-Hebel behandeln** — die stärkste verfügbare Studienlage zeigt für Kalium im moderaten bis hohen Bereich keine Ertragswirkung und für keines der drei Studien eine Cannabinoid-Steigerung (Block 6).
- **Jede minimale Lichteinstrahlung als bewiesene Hermaphroditismus-Ursache behandeln** — die einzige auffindbare Studie ist zu schwach für eine klare Antwort; Vorsicht bleibt sinnvoll, sollte aber nicht als "wissenschaftlich bewiesen" kommuniziert werden (Block 6).
- **Während des aktiven Stretch (Tag 1–21) defoliieren** — die Pflanze braucht die Blattmasse in dieser Phase für den Höhen-/Strukturaufbau (Block 5).
- **Späte, aggressive Defoliation (Woche 6–7) mit der gut belegten Mid-Flower-Defoliation (Tag 21–25) verwechseln** — mehrere Quellen raten von Ersterer aktiv ab, da die Pflanze die Blattmasse für die finale Reifung nicht mehr ersetzen kann (Block 5).
- **Ca-Mangel-Symptome ungeprüft nachdüngen, statt erst Runoff-pH/EC zu checken** — viele Ca-Symptome sind Wurzelzonen-, nicht Dosierungsprobleme (Block 7).
- **Stützsysteme erst installieren, wenn Äste bereits abknicken** — Trellis-Netting vor dem Stretch aufbauen ist deutlich wirksamer als reaktives Nachrüsten (Block 8).

## 12. `advanced_considerations`

**Autoflower-Blüte:** Der Übergang ist genetisch fixiert, nicht photoperiodenausgelöst — der Lichtzyklus kann während der gesamten Autoflower-Lebensspanne unverändert bleiben (18/6 als verbreiteter Standard, 20/4 und 24/0 ebenfalls gängig). Es besteht keine Notwendigkeit einer Lichtumstellung wie bei photoperiodischen Pflanzen, und die in Block 5 beschriebene Tag-0-Umstellung entfällt entsprechend (B38).

**PPFD oberhalb 600 µmol/m²/s:** Die einzige Studie zur PPFD-Progression innerhalb der Blüte (B37) hat den Bereich nur bis 600 µmol/m²/s getestet; ob der lineare CBD-Zuwachs darüber hinaus anhält, ist unerforscht. SecretLeafs verifizierter Zielbereich (600–1000 µmol/m²/s) liegt damit teilweise oberhalb der direkt getesteten Spanne.

**Interessenkonflikt-Transparenz bei B7:** Die einzige Studie mit einem gemessenen Ertragseffekt für ein PK-Zusatzprodukt ist herstellerfinanziert. Das Ergebnis wird durch zwei unabhängige akademische Studien (B8, B9) in der Gesamtrichtung gestützt, mindert aber nicht das grundsätzliche Interessenkonflikt-Risiko — im Artikel transparent als Industriestudie kennzeichnen, nicht als neutrale Bestätigung.

## 13. `related_topics`

- **Vorbedingung:** `vegetationsphase-training-und-pflege` — die Veg-Phase, endet dort, wo dieser Artikel beginnt.
- **Vertiefend:** `fuetterungsplan-nach-phase` (Backlog #20, Nährstoffseite über den gesamten Zyklus), `lichtspektrum-und-bluete` (Backlog #56, Spektrum-Deep-Dive), `defoliation-entlauben` (Backlog #75, phasenübergreifende Defoliation-Technik).
- **Diagnostisch angrenzend:** `bud-rot-botrytis` — bereits in `wiki.ts` vorhanden, relevant sobald das Kronendach durch Stützsysteme/Defoliation dichter wird.
- **Weiterführend:** Spätblüte-/Erntefenster-Tutorial (noch nicht recherchiert/gedraftet — nächste Phase in der Reihe).
- **Werkzeuge:** Nährstoff-Rechner für die EC-Eskalation aus Block 10; VPD-Rechner für das Blüte-Zielfenster; Licht-Rechner für PPFD-Zielbereich und die Progression aus Block 9.

## 14. `references`

| # | Titel | Publisher / Autor | Jahr | URL/DOI | Evidence-Level | Kontext im Artikel |
|---|---|---|---|---|:---:|---|
| B1–B6 | NPK-Blüte-Richtwert-Guides (cannabis.net, Zamnesia, Hey Abby, HowToGrowMarijuana, Veriheal, Autoseeds, Azarius, Thunderbird Disco, MSNL Seeds) | diverse | — | siehe Dossier | 1 | Praxis-Konsens 1-3-2→0-3-3 (Block 2, 5, 10) |
| B7 | Bulk PK Booster Cannabis Research Study | RX Green Technologies | — | https://www.rxgreentechnologies.com/rxgt_trials/bulk-trial/ | 2–3 (Herstellerstudie) | PK-Zusatz: Ertrag ja, Potenz/Terpene nein (Block 6, 12) |
| B8 | Optimisation of Nitrogen, Phosphorus, and Potassium for Soilless Production of Cannabis sativa in the Flowering Stage Using Response Surface Analysis | *Frontiers in Plant Science* | 2021 | https://pmc.ncbi.nlm.nih.gov/articles/PMC8635921/ | 3–4 | Kern-Gegenbeleg P/K-Booster-Narrativ, K ohne Ertragswirkung (Block 6) |
| B9 | Sustainable Cannabis Nutrition: Elevated root-zone phosphorus significantly increases leachate P and does not improve yield or quality | *Frontiers in Plant Science* | 2022 | https://pmc.ncbi.nlm.nih.gov/articles/PMC9724152/ | 3 | Bestätigt B8 unabhängig — P wird ausgewaschen, nicht genutzt (Block 6) |
| B10 | Bloom boosters: BS or Necessity? | Rollitup (Forum) | — | https://www.rollitup.org/t/bloom-boosters-bs-or-necessity.1022555/ | 1 | Praxis-Meinungsspektrum als Kontrastfolie (Block 6) |
| B11–B14 | Ca/Mg-Bedarf-Blüte-Guides (Herb.co, Greenhouse Grower, MJ Seeds Canada, RQS) | diverse | — | siehe Dossier | 1 | Ca/Mg-Bedarfsanstieg, Interaktion mit P/K (Block 2, 10) |
| B15 | Cannabis Flowering Stage / pH-Guides (Athena Agriculture, Grow Sensor, SEED BANK, Alchimia) | diverse | — | siehe Dossier | 1 | pH-Drift-Mechanismus, Runoff-Strategie (Block 3, 5, 8) |
| B16–B20 | Defoliation-Timing-Guides (Biology Insights, Vivosun, GrowWeedEasy, BudTrainer, 2FastBuds) | diverse | — | siehe Dossier | 1 | Zwei-Fenster-Modell, Stretch-Sperrzeit (Block 5, 11) |
| B21–B24 | Späte-Defoliation-Guides (Hypno Seeds, Grow Sensor, GrowWeedEasy, Seeds Genetics Co, Sativa University) | diverse | — | siehe Dossier | 1 | Tag-25–28-Grenze, "Schedule 2.0"-Einordnung (Block 5, 11) |
| B25–B29 | Stützsystem-Guides (Sensi Seeds, Kannabia, Weedmaps, RQS, 454bags) | diverse | — | siehe Dossier | 1 | Stützsystem-Vergleich, Installations-Timing (Block 5, 8) |
| B30 | Light-Leak-Konsens-Guides (Hey Abby, StratCann, Perfect Gardens) | diverse | — | siehe Dossier | 1 | Praxis-Konsens Lichtleck-Vorsicht (Block 6) |
| B32 | Investigating the Effects of Dark Period Light Exposure on Sex Expression In Female *Cannabis sativa* | *SURG Journal*, University of Guelph | — | https://journal.lib.uoguelph.ca/index.php/surg/article/view/7697 | 2 | Relativiert Lichtleck-Hermaphroditismus-Konsens, ohne ihn zu widerlegen (Block 6) |
| B33–B36 | Nährstoffsperre-Guides (Atami, Athena Agriculture, Atlas Scientific, RQS) | diverse | — | siehe Dossier | 1 | Lockout-Symptomatik, Diagnose über Runoff (Block 7) |
| B37 | High light intensity enhances cannabinoid biosynthesis through concerted gene expression in hemp (*Cannabis sativa*) flowers | — | — | https://pmc.ncbi.nlm.nih.gov/articles/PMC12583074/ | 3 | PPFD-Progression, konkreter Wirkmechanismus (Block 9, 12) |
| B38 | Autoflower-Blüte-Guides (ILGM, 2FastBuds, CannaConnection) | diverse | — | siehe Dossier | 1 | Photoperioden-Unabhängigkeit (Block 12) |
| B40 | Ca-Mangel-Symptomatik-Guides (Zamnesia, GrowWeedEasy, Grow With Jane) | diverse | — | siehe Dossier | 1 | Rust-Spot-Symptomatik, Abgrenzung zu Mg-Mangel (Block 7) |

*(Vollständige URL-Liste je Kürzel: siehe `docs/content-factory/research/bluete-source-dossier.md`, Quellenregister.)*

## 15. `faq`

**Bringen PK-Bloom-Booster wirklich mehr Ertrag und Potenz?**
Differenzierter, als das Marketing suggeriert: Die stärkste verfügbare Studie fand für Kalium im getesteten Bereich (60–340 mg/L) keine Ertragswirkung, und keine der drei kontrollierten Studien fand eine Cannabinoid-Steigerung durch mehr P/K. Ein Ertragseffekt zeigte sich nur bei einer von zwei Sorten in der industriefinanzierten Studie — bei unveränderter Potenz (Block 6).

**Ist jeder Lichtspalt während der Dunkelphase wirklich gefährlich?**
Der weitverbreitete Konsens ist durch die einzige auffindbare Studie weder bestätigt noch widerlegt — die Studie war zu schwach angelegt für eine klare Antwort. Die Vorsichtsmaßnahme bleibt trotzdem sinnvoll, weil der potenzielle Schaden hoch und die Kosten der Prävention niedrig sind (Block 6).

**Wann sollte ich in der Blüte defoliieren?**
Zwei Fenster: kurz vor bis in den ersten 2 Wochen 12/12 (untere, nicht-produktive Triebe) und Woche 3–4/Tag 21–25 (blütenlichtblockierende Fächerblätter). Nicht während des aktiven Stretch (Tag 1–21), nach Tag 25–28 nur noch sanitär (Block 5).

**Wann brauche ich Stützstäbe oder ein Trellis-Netz?**
Bedarf entsteht typischerweise ab Woche 4–5, wenn Blüten sichtbar schwer werden. Trellis-Netting idealerweise schon vor dem Stretch installieren statt erst reaktiv in Woche 5 (Block 5, 8).

**Meine Blätter zeigen rostfarbene Flecken — Ca-Mangel nachdüngen?**
Erst Runoff-pH und -EC prüfen. Viele Ca-Symptome entstehen durch falschen pH, hohe EC oder Wurzelschaden, nicht durch reinen Nährstoffmangel — Nachdüngen ohne diesen Check behebt die eigentliche Ursache nicht (Block 7).

## 16. `expert_tips`

Der größte, am häufigsten falsch eingeschätzte Hebel dieser Phase ist nicht die Wahl des teuersten PK-Zusatzprodukts, sondern die **Kombination aus moderater, verifizierter EC-Führung und rechtzeitiger struktureller Vorbereitung**: Die stärkste verfügbare Studienlage zeigt, dass moderate P-Werte bereits ausreichen und zusätzliches P/K weder Ertrag noch Potenz zuverlässig steigert — das Budget für Bloom-Booster ist in Trellis-Netting, das vor dem Stretch statt reaktiv in Woche 5 installiert wird, meist besser investiert. Wer stattdessen auf teure Zusatzprodukte setzt und Support erst nachrüstet, wenn Äste bereits abknicken, optimiert am falschen Hebel.

---

*Ende Draft. Stage 3 (Fact-Check) bestanden — siehe `docs/content-factory/fact-checks/bluetephase-ernaehrung-und-pflege-fact-check.md`. Bereit für Stage 4 (Editorial Review, vier menschliche Pflicht-Sign-offs) gemäß `ARTICLE_WORKFLOW.md` §5.*
