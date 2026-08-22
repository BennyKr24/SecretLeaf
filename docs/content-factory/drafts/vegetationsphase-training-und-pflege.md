# Draft — Vegetationsphase: Training, Kronendach und der Weg zur Blüte

Stage: 2 — Draft · Datum: 2026-08-21 · Basis: `docs/content-factory/research/veg-source-dossier.md` (~50 Quellen V1–V64, drei kontrollierte Cannabis-Studien V7/V8/V9, zwei allgemein-botanische Grundlagenstudien V11/V12)

> Zitierformat: `(V#)` verweist auf die Quellen im Stage-1-Veg-Dossier. Jede Zahlenangabe ist dort mit Titel, Publisher, Jahr, URL/DOI und Evidence-Level hinterlegt. EC-, pH-, PPFD/DLI- und Phasendauer-Werte wurden bereits im Kalibrierungsaudit dieser Session verifiziert (siehe `TODO.md`) und werden hier nur referenziert, nicht neu belegt.

**Hybridcharakter:** Wie die Sämlingsphase ist auch Veg prozedural (Training als Methode) UND diagnostisch (Nährstoffmangel, Wurzelraum-Restriktion). Block 6, 7 und 11 sind entsprechend diagnostisch aufgebaut.

---

## Front matter

```yaml
slug: vegetationsphase-training-und-pflege
title: "Vegetationsphase: Training, Kronendach und der Weg zur Blüte"
summary: "Wie Topping, FIM und LST in der Vegetationsphase richtig getimt werden, was die Studienlage zu Ertragswirkung wirklich hergibt, und wie eine Pflanze strukturell auf die Blüte vorbereitet wird."
category: anbau
difficulty: intermediate
entity_type: HowTo
language: de
meta:
  evidence_level: 1
  confidence_score: 0.63
  last_review_date: 2026-08-21
  review_horizon_months: 18
relations:
  - { type: prerequisite, to: keimung-und-anzucht }
  - { type: see_also,     to: topping-und-fim }
  - { type: see_also,     to: lst-low-stress-training }
tool_links:
  - { kind: calculator, slug: ertrags-schaetzer, label: "Ertrags-Schätzer", href: "/tools/ertrags-schaetzer" }
  - { kind: calculator, slug: naehrstoff-rechner, label: "Nährstoff-Rechner", href: "/tools/naehrstoff-rechner" }
```

**Hinweis zu `evidence_level: 1` trotz drei kontrollierter Cannabis-Studien:** Dieses Dossier hat die mit Abstand stärkste Studienlage der bisherigen Reihe — drei unabhängige kontrollierte Topping/Pruning-Studien an Cannabis (V7, V8, V9) plus zwei hochrangige Grundlagenstudien zur Apikaldominanz (V11, V12, PNAS/Nature Scientific Reports). Trotzdem bleibt der Artikel-Gesamtwert bei Level 1, weil mehrere praktisch zentrale Aussagen — NPK-Richtwert, LST-Ertragsprozentzahlen, SCROG-Timing — ausschließlich auf Praxis-Konsens beruhen, und `meta.evidence_level` per Definition der **schwächsten tragenden Quelle** folgt (`SOURCE_REQUIREMENTS.md` §2), nicht dem Durchschnitt. `confidence_score = 0.63` liegt trotzdem über der 0.60-Schwelle für Technique-Artikel.

---

## 1. `definition`

Die Vegetationsphase ist der Abschnitt zwischen dem Ende der Sämlingsphase (3–4 Sätze echter Blätter) und der Umstellung auf einen 12/12-Lichtzyklus zur Blüteeinleitung. Ziel ist nicht reines Größenwachstum, sondern der Aufbau der strukturellen Basis, die später den Ertrag trägt: Wurzelmasse, Verzweigungsmuster und ein möglichst gleichmäßiges Kronendach, das Licht effizient auf viele statt wenige Blütenstandorte verteilt. SecretLeafs Grow-OS setzt die Standarddauer auf 28 Tage (Erde/Coco), 21 Tage (Hydro, schnellere Nährstoffverfügbarkeit) bzw. 56 Tage (Outdoor, photoperiodenabhängig) — diese Werte wurden bereits im Rahmen des Kalibrierungsaudits dieser Session recherchiert und bestätigt (`lib/grow/phases.ts`, siehe `TODO.md`) und sind nicht Gegenstand dieses Artikels.

## 2. `scientific_background`

Cannabis wächst wie die meisten Pflanzen mit einer dominanten Haupttriebspitze, die seitliche Knospen unterdrückt — apikale Dominanz. Der klassische Erklärungsmechanismus ist auxin-vermittelt: Die Triebspitze produziert Auxin, das seitliche Knospen in der Ruhephase hält. Neuere Grundlagenforschung an Modellpflanzen zeigt ein präziseres Bild: Nicht der Auxin-Entzug allein, sondern die **Zuckernachfrage** der Triebspitze ist der initiale Auslöser dafür, ob eine seitliche Knospe austreibt — Auxin reguliert diesen Prozess nachgelagert über den Zuckerfluss zur Knospe (V11, *PNAS*). Eine zweite Studie zeigt zusätzlich einen aktiven Auxin-Fluss-Wettbewerb zwischen mehreren freigesetzten Seitenknospen, der bestimmt, welche sich zum dominanten neuen Trieb entwickelt (V12, *Scientific Reports*). **Beide Studien sind nicht cannabis-spezifisch** — der Mechanismus ist botanisch allgemeingültig und in mehreren Modellorganismen repliziert, aber nie kontrolliert an Cannabis getestet.

Wird die Triebspitze durch Topping entfernt, bricht die Unterdrückung ab: Die höchsten verbleibenden Seitenknospen entwickeln sich zu neuen, annähernd gleichwertigen Haupttrieben. Dass dieser Mechanismus bei Cannabis tatsächlich zu mehr Biomasse und Verzweigung führt, ist inzwischen direkt belegt — drei unabhängige kontrollierte Studien haben Topping/Pruning an Cannabis getestet (V7, V8, V9, Details in Block 6). Sie sind sich einig, dass Topping die Verzweigungsstruktur verändert; uneinig sind sie sich darin, wie verlässlich sich das in mehr *Ertrag* übersetzt.

## 3. `plant_physiology`

Nach dem Kappen (Topping) übernehmen typischerweise zwei der obersten Seitenknospen die Rolle der ehemaligen Haupttriebspitze und wachsen zu annähernd gleichwertigen Kronen heran — die Pflanze wechselt von einer dominanten Spitze zu einer geteilten Struktur. Bei FIM (partieller Schnitt, siehe Block 5) bleibt mehr Meristemgewebe erhalten, wodurch häufig 3–4 statt 2 neue Wachstumspunkte entstehen (V2, V10) — der Mechanismus ist derselbe, nur unvollständiger ausgeführt, was die höhere Anzahl, aber auch geringere Vorhersagbarkeit der resultierenden Struktur erklärt.

Ein zweiter, planungsrelevanter physiologischer Vorgang fällt an das Ende der Veg-Phase: Nach der Umstellung auf 12/12 setzt der "Stretch" ein — Pflanzen verdoppeln, teils verdreifachen ihre Höhe in den ersten zwei bis drei Wochen der Blühphase, bevor das Höhenwachstum sich zugunsten der Blütenbildung verlangsamt. Sativa-dominante Sorten strecken deutlich stärker (bis 250 % der Veg-Höhe) als Indica-dominante (V21–V24). Das ist keine Veg-Phase-Technik im engeren Sinne, aber eine direkte Konsequenz der hier aufgebauten Pflanzengröße und deshalb Teil der Trainingsplanung (Block 6).

## 4. `symptoms` → Ziel & Indikationen

Training (Topping, FIM, LST) setzt eine gesunde, etablierte Pflanze ohne aktive Stress- oder Krankheitssymptome voraus. Nicht geeignet: Pflanzen direkt nach dem Sämling-Übergang, die noch keine stabile Wurzelmasse aufgebaut haben (siehe `keimung-und-anzucht`), sowie Pflanzen mit akutem Nährstoffmangel, Schädlingsbefall oder sichtbarem Stress — zusätzlicher mechanischer Stress verzögert hier die Erholung statt sie zu fördern. Ein guter Startpunkt ist eine Pflanze mit kräftigem, aufrechtem Wachstum und mindestens 3–4 entwickelten Knotenpunkten.

## 5. `causes` → Methode Schritt-für-Schritt

**Topping**
1. Haupttrieb am 4.–6. Knotenpunkt kappen (V1–V6, Praxis-Konsens; deckt sich näherungsweise mit der Industriehanf-Studie V7, siehe Block 6 für die vollständige Einordnung).
2. Sauberes Werkzeug verwenden, glatter Schnitt oberhalb des gewählten Knotens.
3. Erholungszeit einplanen, bevor weitere Trainingsschritte folgen (siehe Block 8, Werkzeughygiene).

**FIM** ("Fuck I Missed")
1. Statt des vollständigen Kappens nur die obersten ca. 75 % des neuen Wachstumspunkts entfernen, sodass etwas Meristemgewebe erhalten bleibt.
2. Ergebnis ist weniger vorhersehbar als Topping (3–4 statt 2 neue Haupttriebe), dafür geringerer struktureller Einzelstress, da der Haupttrieb nicht vollständig gekappt wird (V2, V10).

**LST (Low Stress Training)**
1. Start bei 3–6 entwickelten Knoten mit bereits tragfähigem, nicht mehr fragilem Hauptstängel — in SecretLeafs Grow-Plan entspricht das Tag 18 der Veg-Phase; dieser Wert deckt sich mit dem recherchierten Praxis-Konsens (Woche 3, Tag 18–22, V13–V17).
2. Seitentriebe vorsichtig mit Bindedraht, Tomatenclips oder Stoffstreifen nach außen biegen, bis ein flaches, gleichmäßiges Kronendach entsteht.
3. Wiederholt anwendbar, während die Pflanze weiterwächst — im Gegensatz zu Topping/FIM kein einmaliger, irreversibler Schnitt.

**SCROG-Netz** (optionale Ergänzung zum reinen Kronendach-Beobachten)
1. Netz früh bis mittig in der Veg-Phase installieren, bei 4–6 Knoten bzw. ca. 25–30 cm Höhe (V54–V59).
2. Aktives Einflechten ("Tucken") beginnt, sobald die höchsten Triebe 50–60 % der Netzhöhe erreicht haben bzw. rund 5 cm durchs Netz gewachsen sind.
3. Zu spät aufgestellt lässt sich ein flaches Kronendach kaum noch nachträglich erzwingen — Netz-Timing ist entsprechend zeitkritischer als reine LST.

## 6. `diagnosis` → Erfolgsbewertung

**Was die Studienlage zu Topping wirklich zeigt — differenziert, nicht vereinfacht:** Drei unabhängige kontrollierte Studien haben Topping/Pruning an Cannabis getestet, mit uneinheitlichem Ergebnis. Eine Studie an zwei Industriehanf-Kultivaren toppte am 4./5./6. Knoten und maß eine statistisch signifikante Frischbiomasse-Zunahme von 23–29 % gegenüber ungetoppten Kontrollpflanzen (V7). Eine zweite Studie an Chemotyp-III-Medizinalcannabis — deutlich näher an Freizeit-/Medizinsorten als Industriehanf — toppte dagegen erst am 10. Knoten und fand zwar ebenfalls signifikant mehr Blüten- und Blattbiomasse, aber **keinen statistisch signifikanten Unterschied im Gesamt-CBD-Ertrag** (Konzentration × Masse, p = 0,09), weil die Cannabinoid-Konzentration je nach Höhenposition der Blüte unterschiedlich ausfiel (V8). Eine dritte Studie an Drug-Type-Medizinalcannabis fand bei einmaligem Pruning gar keinen signifikanten Ertragseffekt — erst zweifaches Pruning erhöhte sowohl den Ertrag als auch die Gleichmäßigkeit der Cannabinoid-Verteilung über die Pflanze (V9).

Für die Praxis heißt das: Der verbreitete Praxis-Konsens-Zeitpunkt (4.–6. Knoten) folgt der Industriehanf-Studie, nicht der näher an Freizeitsorten liegenden Chemotyp-III-Studie, die einen späteren Knoten testete. Keine der drei Studien hat den in Grower-Guides üblichen Zeitpunkt direkt an einer echten Freizeit-/Drug-Type-Sorte überprüft — diese Lücke besteht weiterhin. Der über alle drei Studien konsistente Befund ist nicht "Topping bringt X Gramm mehr", sondern robuster und vorsichtiger formuliert: **Topping verändert Biomasse und Verzweigungsstruktur verlässlich; der Effekt auf den tatsächlichen, cannabinoid-gewichteten Gesamtertrag ist zeitpunkt- und sortenabhängig weniger eindeutig, als viele Grower-Guides suggerieren.**

**Stretch-Planung für die Deckenhöhe:** Da Pflanzen nach der Blüteumstellung ihre Höhe verdoppeln bis verdreifachen (Block 3), sollte die Umstellung erfolgen, wenn die Pflanze etwa 50 % (nach anderer Quelle: ein Drittel) der maximal verfügbaren Deckenhöhe erreicht hat (V21, V25) — das ist der praktische Umrechnungsschritt von der Trainingsentscheidung zur eigentlichen Phasenlänge.

## 7. `corrective_actions`

**Wurzelraum-Restriktion (root-bound):** Wurzeln sichtbar an den Drainagelöchern, stagnierendes Wachstum, teils Blattverfärbung als indirekte Folge (nicht direkt Nährstoffmangel, sondern Wurzelraum-Ursache) — umtopfen in einen größeren Topf, sobald erkennbar (V45–V49, Timing siehe Block 8).

**Stickstoffmangel:** Beginnt an unteren, älteren Blättern (Stickstoff ist mobil, die Pflanze verlagert es zu neuem Wachstum), fortschreitende Chlorose von der Blattspitze nach innen, bei Fortschreiten Wachstumsstauchung (V38–V44) — Düngung mit stickstoffbetonter Lösung korrigieren, dabei die bereits im Nährstoff-Rechner hinterlegten EC-Zielwerte für Veg beachten.

**Zu frühes/zu spätes Training:** Ein zu früh getoppter oder per LST gebogener Trieb an noch fragilem Gewebe kann brechen oder abknicken — betroffene Triebe lassen sich in vielen Fällen mit Pflanzband stabilisieren und wachsen weiter, solange die Leitbahnen nicht vollständig durchtrennt sind.

## 8. `preventive_measures`

**Umtopf-Timing:** Idealerweise 2–4 Wochen nach der Keimung, während der laufenden Veg-Phase; letztes Umtopfen spätestens 2 Wochen vor der Blüteumstellung, danach lässt sich zusätzliches Wurzelwachstum nicht mehr in Ertrag ummünzen (V45, V46).

**Werkzeughygiene:** Saubere, scharfe Klingen für Topping/FIM-Schnitte reduzieren Infektionsrisiko an der Schnittstelle — derselbe Grundsatz wie bei der mechanischen Handhabung in der Keimungsphase.

**Trainingsreihenfolge:** LST ab Tag 18 (3–6 Knoten) beginnen, Topping am 4.–6. Knoten anschließend — beide Techniken lassen sich kombinieren, LST als kontinuierlicher, wiederholbarer Prozess, Topping als punktuelle, irreversible Entscheidung.

## 9. `environmental_factors`

PPFD- (400–600 µmol/m²/s), DLI- (20–40 mol/m²/Tag) und EC-Zielwerte für die Veg-Phase wurden bereits im Kalibrierungsaudit dieser Session recherchiert und in `lib/tools/lighting.ts` bzw. `lib/tools/nutrients.ts` verankert (siehe `TODO.md`) — **N/A für dieses Dossier**, um Doppelarbeit zu vermeiden. Relevant für die Trainingsplanung ist an dieser Stelle nur die praktische Konsequenz aus Block 6: Wachsender Lichtabstand muss mit dem Höhenwachstum der Pflanze mitgeführt werden, insbesondere nach Topping, wenn die Pflanze in die Breite statt in die Höhe wächst und sich die Lichtverteilung über das neue, breitere Kronendach ändert.

## 10. `nutrient_interactions`

Praxis-Richtwert für das NPK-Verhältnis in der Veg-Phase liegt bei etwa 3-1-2, mit Varianten zwischen 3-1-1 und 4-2-1 je nach Quelle (V30–V37) — deutlich stickstoffbetonter als in der Blütephase, aber **ohne einheitliche Präzisionszahl in der Literatur**; als Bandbreite, nicht als exakter Zielwert zu verstehen. Die konkrete EC-Eskalation (früh Veg niedriger, spät Veg höher) ist bereits im Kalibrierungsaudit dieser Session in `nutrients.ts` verankert und über SecretLeafs Nährstoff-Rechner abrufbar — hier nur als Cross-Reference, nicht neu bewertet. Nährstoffverbrennungs-Warnsignale: dunkelgrüne Blätter mit verbrannten, später eingerollten Spitzen (V25).

## 11. `common_mistakes`

- **Training zu früh** (fragiles Gewebe, Bruchrisiko) **oder zu spät** (verholzter Stängel, geringere Formbarkeit bei LST) — Zeitfenster aus Block 5 einhalten.
- **LST-Ertragserwartung von 20–40 % als gesicherten Fakt behandeln** — diese Zahlen stammen ausschließlich aus Praxis-Konsens und aggregierten Grow-Journal-Daten, keine kontrollierte Studie belegt eine konkrete Prozentzahl (V18–V20). Realistische Erwartung: strukturelle Verbesserung des Kronendachs, kein garantierter Ertrags-Multiplikator.
- **Stickstoffmangel mit anderen Ursachen verwechseln** — die zeitliche/räumliche Signatur (untere Blätter zuerst, fortschreitende Chlorose) ist der entscheidende Unterscheidungspunkt (Block 7).
- **Umtopf-Fenster verpassen** — sowohl zu spät (root-bound-Wachstumsstauchung) als auch zu kurz vor der Blüteumstellung (ungenutztes Wurzelwachstum).
- **Veg-Defoliation ungeprüft als "studienbelegt" übernehmen:** Eine verbreitete Behauptung (Entlauben bei 50–60 cm Pflanzenhöhe verbessere untere Blütendichte und Cannabinoidproduktion) wird von mehreren Sekundärquellen zitiert, aber keine nennt eine auffindbare Primärquelle (V60–V64) — als unbestätigt behandeln, nicht als Fakt zitieren. Breiter Konsens ohne diesen Vorbehalt: nicht vor Woche 5, nur gezielt überlappende/beschädigte Blätter entfernen, junge Pflanzen brauchen die Blattmasse für Struktur- und Wurzelaufbau.

## 12. `advanced_considerations`

**Autoflower-Training:** Topping-Erholung dauert 3–7 Tage (bis 10 bei Stress), LST dagegen zeigt Erholungssignale bereits nach 24–48 Stunden. Bei kurzzyklischen Autoflowern (7–9 Wochen Samen bis Ernte) besteht durch die längere Topping-Erholungszeit ein reales Stauchungsrisiko im Gesamtzyklus — viele erfahrene Grower reservieren Topping bei Autos nur für kräftige Pflanzen in stabiler Umgebung und setzen primär auf LST, das keinen vergleichbaren Zeitverlust erzeugt (V50–V53).

**Das Erfahrungslevel-Gate für Topping ("nur für Profis") ist eine Produktentscheidung, keine Fachvorgabe:** Weder die drei kontrollierten Studien (V7–V9) noch die Praxis-Guides (V1–V6) nennen Grower-Erfahrung als relevanten Timing- oder Erfolgsfaktor — entscheidend sind Knotenzahl, Pflanzengesundheit und ein ausreichendes Erholungsfenster. Die Beschränkung auf erfahrene Grower ist nachvollziehbar, weil Topping ein irreversibler Schnitt ist (anders als LST), aber sie sollte nicht als wissenschaftlich begründete Empfehlung missverstanden werden.

## 13. `related_topics`

- **Vorbedingung:** `keimung-und-anzucht` — die Sämlingsphase, endet dort, wo dieser Artikel beginnt.
- **Vertiefend:** `topping-und-fim` (Backlog #43) und `lst-low-stress-training` (Backlog #44) — eigene Deep-Dive-Artikel mit mehr Methodenvarianten und Edge-Cases, als ein Phasenartikel leisten kann.
- **Weiterführend:** Blütephase-Tutorial (noch nicht recherchiert/gedraftet — nächste Phase in der Reihe).
- **Werkzeuge:** SecretLeafs Ertrags-Schätzer (`/tools/ertrags-schaetzer`) zur Einordnung, wie Substrat-/Genetik-/Dichtefaktoren den Ertrag neben dem Training beeinflussen; Nährstoff-Rechner (`/tools/naehrstoff-rechner`) für die EC-Eskalation aus Block 10.

## 14. `references`

| # | Titel | Publisher / Autor | Jahr | URL/DOI | Evidence-Level | Kontext im Artikel |
|---|---|---|---|---|:---:|---|
| V1–V6 | Topping/FIM-Timing-Guides (ILGM, Treecarezone, ScienceInsights, BudTrainer, Dutch Passion, Modern Farms) | diverse | — | siehe Dossier | 1 | Praxis-Konsens-Timing (Block 5) |
| V7 | Morphological, physiological, and biochemical responses of two industrial hemp cultivars to different levels of topping | *Journal of Cannabis Research* | 2026 | https://pmc.ncbi.nlm.nih.gov/articles/PMC13101382/ | 3–4 | Kontrollierte Topping-Studie, Industriehanf (Block 2, 6) |
| V8 | Impact of Harvest Time and Pruning Technique on Total CBD Concentration and Yield of Medicinal Cannabis | *Plants* (MDPI), Univ. Hohenheim | 2022 | https://www.mdpi.com/2223-7747/11/1/140 | 3 | Kontrollierte Studie, Chemotyp-III-Medizinalcannabis (Block 6) |
| V9 | Plant architecture manipulation increases cannabinoid standardization in 'drug-type' medical cannabis | Danziger & Bernstein, *Industrial Crops and Products* 164 | 2021 | https://www.sciencedirect.com/science/article/abs/pii/S0926669021002922 | 3 | Einzel- vs. Mehrfach-Pruning (Block 6) |
| V10 | Topping vs FIMing Cannabis: Which Training Cut Wins? | Azarius | — | https://www.azarius.com/wiki/cultivation/cannabis/topping-vs-fiming-cannabis | 1 | FIM-Mechanismus (Block 3, 5) |
| V11 | Sugar demand, not auxin, is the initial regulator of apical dominance | *PNAS* | — | https://www.pnas.org/doi/10.1073/pnas.1322045111 | 3–4 (nicht cannabis-spezifisch) | Apikaldominanz-Mechanismus (Block 2) |
| V12 | Auxin flow-mediated competition between axillary buds to restore apical dominance | *Scientific Reports* (Nature) | — | https://www.nature.com/articles/srep35955 | 3–4 (nicht cannabis-spezifisch) | Auxin-Fluss-Mechanismus (Block 2) |
| V13–V17 | LST-Timing-Guides (Zamnesia, Weedmaps, Royal King Seeds, RQS, Hey Abby) | diverse | — | siehe Dossier | 1 | LST-Start-Fenster Woche 3 (Block 5) |
| V18–V20 | LST-Ertragsprozentzahlen (unbestätigt) | CropKing, North Penn Now, u.a. | — | siehe Dossier | 1, unbestätigt | LST-%-Angaben als Vorbehalt (Block 11) |
| V21–V25 | Stretch-/Höhenregel-Guides | Homegrown Cannabis Co, ILGM, RQS, Clonetohome, Lighthouse Genetics | — | siehe Dossier | 1 | Stretch-Faustregel (Block 3, 6) |
| V30–V37 | NPK-Veg-Richtwert-Guides | Veriheal, Crop King, Azarius, u.a. | — | siehe Dossier | 1 | NPK 3-1-2-Richtwert (Block 10) |
| V38–V44 | Stickstoffmangel-Symptom-Guides | Zamnesia, GrowWeedEasy, ILGM, u.a. | — | siehe Dossier | 1 | N-Mangel-Diagnose (Block 7) |
| V45–V49 | Umtopf-/Root-bound-Guides | 2FastBuds, NuggMD, RQS, PlantCareToday, GrowWeedEasy | — | siehe Dossier | 1 | Root-bound-Erkennung, Umtopf-Timing (Block 7, 8) |
| V50–V53 | Autoflower-Training-Guides | ILGM, SeedSupreme, Zamnesia, Thunderbird Disco | — | siehe Dossier | 1 | Autoflower-Erholungszeit (Block 12) |
| V54–V59 | SCROG-Timing-Guides | Biology Insights, GrowSensor, CTU, Weedmaps, BudTrainer, Vivosun | — | siehe Dossier | 1 | Netz-Timing (Block 5) |
| V60–V64 | Veg-Defoliation-Guides (ein Claim ohne Primärquelle) | FloraFlex, Vivosun, Zamnesia, 454bags, GrowWeedEasy | — | siehe Dossier | 1, teils unbelegt | Defoliation-Timing mit Vorbehalt (Block 11) |

*(Vollständige URL-Liste je Kürzel: siehe `docs/content-factory/research/veg-source-dossier.md`, Quellenregister.)*

## 15. `faq`

**Topping oder LST — was zuerst?**
Beides lässt sich kombinieren, in der Praxis meist LST ab Tag 18 (3–6 Knoten) beginnend, Topping am 4.–6. Knoten anschließend. LST ist wiederholbar und reversibel in der Wirkung, Topping ein einmaliger, irreversibler Schnitt (Block 5, 8).

**Stimmt es, dass LST 20–40 % mehr Ertrag bringt?**
Diese Zahl ist unbestätigt — sie stammt aus Praxis-Konsens, keine kontrollierte Studie belegt eine konkrete Prozentzahl. LST verbessert nachweislich die Lichtverteilung über ein flaches Kronendach, ein garantierter Ertrags-Multiplikator lässt sich daraus nicht ableiten (Block 11).

**Bringt Topping wirklich mehr Ertrag?**
Differenzierter, als viele Guides suggerieren: Drei kontrollierte Studien zeigen zuverlässig mehr Biomasse/Verzweigung, aber uneinheitliche Effekte auf den tatsächlichen Cannabinoid-gewichteten Gesamtertrag — eine Studie fand hier keinen signifikanten Unterschied (Block 6).

**Warum ist Topping in der App nur für Fortgeschrittene freigegeben?**
Weil es ein irreversibler Schnitt ist — eine nachvollziehbare Vorsichtsmaßnahme, aber keine durch die Studienlage vorgeschriebene Regel. Keine der drei kontrollierten Studien nennt Grower-Erfahrung als Erfolgsfaktor (Block 12).

**Wann sollte ich zum letzten Mal umtopfen?**
Spätestens 2 Wochen vor der Blüteumstellung — danach lässt sich zusätzliches Wurzelwachstum nicht mehr in Ertrag ummünzen (Block 8).

**Wie hoch darf meine Pflanze in der Veg-Phase maximal werden?**
Etwa 50 % (nach anderer Quelle ein Drittel) der verfügbaren Deckenhöhe, da sie sich nach der Blüteumstellung durch den Stretch nochmal deutlich streckt — bei Sativa-dominanten Sorten stärker als bei Indica (Block 3, 6).

## 16. `expert_tips`

Der größte, am häufigsten falsch eingeschätzte Hebel dieser Phase ist nicht die Wahl zwischen Topping und LST, sondern ihre **Reihenfolge und Kombination mit der Stretch-Planung**: LST früh im Fenster (Tag 18) beginnen, um das Kronendach kontinuierlich flach zu halten, Topping am 4.–6. Knoten als punktuelle Ergänzung setzen — und die Blüteumstellung so timen, dass die Pflanze bei etwa der Hälfte der verfügbaren Deckenhöhe steht, nicht erst wenn sie bereits an die Decke stößt. Wer diese drei Elemente isoliert statt zusammen plant, endet regelmäßig entweder mit einem zu ungleichmäßigen Kronendach oder einer Pflanze, die den Stretch nicht mehr in nutzbarer Höhe unterbringt.

---

*Ende Draft. Bereit für Stage 3 (Fact-Check, menschliches Pflicht-Gate) gemäß `ARTICLE_WORKFLOW.md` §4.*
