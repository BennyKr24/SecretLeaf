# Draft — Samenkeimung: Methode, Timing, Erfolgskontrolle

Stage: 2 — Draft · Datum: 2026-08-21 · Basis: `docs/content-factory/research/keimung-source-dossier.md` (18 Quellen, Q1–Q18)

> Zitierformat: `(Q#)` verweist auf die nummerierten Quellen im Stage-1-Dossier. Jede Zahlenangabe in diesem Draft ist dort mit Titel, Publisher, Jahr, URL/DOI und Evidence-Level (1–5) hinterlegt.

---

## Front matter

```yaml
slug: samenkeimung-troubleshooting
title: "Samenkeimung: Methode, Timing, Erfolgskontrolle"
summary: "Wie ein Cannabis-Samen zuverlässig zum Keimen gebracht wird — Methodenvergleich, wissenschaftlich gestützte Temperatur-/Zeitfenster und die häufigsten Fehlerbilder, inklusive Entmystifizierung des Schwimm-/Sinktests."
category: anbau
difficulty: foundational
entity_type: HowTo
language: de
meta:
  evidence_level: 1
  confidence_score: 0.67
  last_review_date: 2026-08-21
  review_horizon_months: 18
relations:
  - { type: prerequisite, to: cannabis-anbau-grundlagen }
  - { type: see_also,     to: keimung-und-anzucht }
tool_links:
  - { kind: reference, slug: vpd, label: "VPD-Rechner", href: "/tools/vpd" }
```

**Hinweis zu `evidence_level: 1`:** Zwei der 18 Quellen (Q1, Q2) sind kontrollierte, peer-reviewte Studien mit Evidence-Level 3 und tragen die zentralen Temperatur-/RH-Kernaussagen. Der Artikel-Gesamtwert folgt aber der Regel aus `SOURCE_REQUIREMENTS.md` §2 — er entspricht der **schwächsten tragenden Quelle**, nicht dem Durchschnitt oder der stärksten. Da mehrere praktisch wichtige Aussagen (Methodenvergleich, Umsetz-Zeitpunkt, Fehlerbilder) nur auf Level-1-Züchter-/Grower-Konsens beruhen, bleibt der Artikel bei Level 1 — bei `confidence_score = 0.67` trotzdem deutlich über der Publikationsschwelle (0.60) für Technique-Artikel.

---

## 1. `definition`

Keimung ist der Übergang vom ruhenden Samen zum lebensfähigen Sämling: Wasseraufnahme (Imbibition), Aktivierung des ruhenden Embryos, Durchbruch der Pfahlwurzel (Radicula) durch die Samenschale und — nach dem Einpflanzen — das Erscheinen und Entfalten der beiden Keimblätter (Kotyledonen). Ziel der Phase ist nicht "ein aufgeplatzter Samen", sondern ein Sämling mit intakter, unbeschädigter Pfahlwurzel, der ohne Verzögerung in die Sämlingsphase übergeht. In SecretLeafs Grow-OS ist Keimung als eigene, standardmäßig 7-tägige Phase modelliert (`keimung` in `PHASE_ORDER`, `lib/grow/phases.ts`); dieser Artikel liefert die Tiefe, die die knappen In-App-Tasks bewusst nicht leisten.

## 2. `scientific_background`

Die belastbarste verfügbare Datenquelle ist ein thermisches Kardinaltemperatur-Modell aus einer kontrollierten Studie an zwei Industriehanf-Kultivaren ('Georgina', 'Victoria'): Temperaturoptimum 29,6 °C, Basistemperatur (unterhalb derer keine Keimung stattfindet) 3,4 °C, Obergrenze 42,6 °C (Q1). Der in der Praxis empfohlene, deutlich engere Zielkorridor liegt bei 20–27 °C bzw. weiter gefasst 19–30 °C (Q7, Q8) — er liegt komfortabel innerhalb der wissenschaftlich ermittelten Grenzen, ohne sie auszureizen.

Bei kühlen Temperaturen sinkt die Keimrate messbar: 63,5 % bei 8 °C, 67,9 % bei 10 °C, 78,4 % bei 12 °C, jeweils über 14 Tage an drei Wild-Ökotypen gemessen (Q2). Mechanistisch spielt zusätzlich eine Rolle, dass Cannabis-Samen negativ photoblastisch sind — Dunkelheit begünstigt die Keimung, Licht ist nicht erforderlich und kann sie sogar hemmen (Q15).

**Wichtiger Vorbehalt:** Q1 und Q2 arbeiten mit Industriehanf- bzw. Wildtyp-/Landrassen-Ökotypen von *Cannabis sativa*, nicht mit kommerziellen Drug-Type-Hybridsorten. Botanisch dieselbe Art, aber keine kontrollierte Studie zur Keimphysiologie moderner Zuchtgenetik wurde gefunden. Die Zahlen sind eine Extrapolation — die *Richtung* der Empfehlung (moderate Wärme, keine Extreme) ist branchenweit über praktisch alle Quellentypen hinweg konsistent bestätigt, sollte aber nicht als exakte Drug-Type-Messung missverstanden werden. Der Photoblastismus-Mechanismus (Q15) ist ebenfalls aus allgemeiner Samenphysiologie-Literatur extrapoliert, nicht Cannabis-spezifisch kontrolliert getestet.

## 3. `plant_physiology`

Der Ablauf: Imbibition (Wasseraufnahme durch die Samenschale) startet den Stoffwechsel im ruhenden Embryo. Bei der Papiertuch-Methode wird dieser Schritt durch Einweichen in Wasser vorgezogen — Standard 12–24 h, harte Obergrenze 24–32 h, darüber steigt das Risiko von Fäulnis durch Sauerstoffmangel, da der Embryo im Wasser nicht ausreichend atmen kann (Q11). Anschließend durchbricht die Pfahlwurzel (Radicula) die aufgesprungene Samenschale, sichtbar als weißer Wurzelfaden. Zeitrahmen bis dahin: 24–72 h bei der Papiertuch-Methode, vereinzelt bis zu einer Woche (Q3, Q10); bei Direktsaat ins Substrat 3–7 Tage, da der Vorgang unsichtbar im Medium abläuft (Q10). Nach dem Einpflanzen (bei einer Pfahlwurzellänge von 1–2 cm, siehe Block 6) folgt das Aufrichten des Hypokotyls und das Entfalten der beiden Keimblätter — der sichtbare Übergang in die Sämlingsphase.

## 4. `symptoms` → Ziel & Indikationen

Vor dem Start optisch prüfen: dunkle Farbe, harte Schale und sichtbare "Tigerstreifen"/Marmorierung sprechen für einen reifen, keimfähigen Samen; helle, grünliche oder weiche Samen sind meist unreif, mit nach mehreren übereinstimmenden Quellen unter 20 % liegender Keimrate (Q6). Diese optische Vorabprüfung ist der verlässlichere erste Filter — **nicht** der verbreitete Schwimm-/Sinktest (vollständige Einordnung in Block 11).

Kein eigentliches Startzeitpunkt-Problem — Keimung beginnt unmittelbar nach dem Einweichen bzw. Einpflanzen. Aussortieren sollte man dagegen: sichtbar beschädigte Samen (gerissene Schale, Schimmelspuren) und sehr alte, falsch gelagerte Samen, da hier die Erfolgswahrscheinlichkeit von vornherein gering ist.

## 5. `causes` → Methode Schritt-für-Schritt

Vier Methoden stehen zur Wahl (Q3, Q4, Q10, Q16):

**A. Papiertuch-Methode** (SecretLeafs Standardmethode im Grow-Plan)
1. Samen 12–24 h in 20–25 °C warmem Wasser (Zimmertemperatur) einweichen. Oberhalb von ca. 29 °C steigt das Hitzeschockrisiko für den Embryo deutlich (Q9). Harte Obergrenze 24–32 h wegen Fäulnisrisiko (Q11) — eine einzelne, konservativere Quelle nennt bereits 12 h als Grenze; im Zweifel die kürzere Zeit wählen.
2. Feuchtes, nicht tropfnasses Küchenpapier zwischen zwei Tellern vorbereiten, Samen mittig platzieren.
3. Bei 24–28 °C, dunkel und warm halten — liegt mittig im wissenschaftlich gestützten 19–30 °C-Korridor (Q1).
4. Täglich prüfen, Papier feucht halten, ohne es zu durchnässen.
5. Nach 24–72 h (vereinzelt bis 7 Tage) erscheint die Pfahlwurzel.

**B. Direktsaat ins Substrat**
1. Samen optional 12–24 h vorher einweichen (beschleunigt den Start).
2. Direkt 1–1,5 cm tief ins feuchte Endsubstrat setzen.
3. Substrat feucht, nicht nass halten.
4. Nach 3–7 Tagen erscheint der Sämling an der Oberfläche.

Eine Quelle bezeichnet Direktsaat explizit als die *sicherere* Methode, weil die Substrattemperatur stabiler bleibt als in einem offen liegenden Papiertuch und kein Umsetzstress entsteht (Q10) — ein echter Trade-off gegenüber der Papiertuch-Methode (Kontrolle und sichtbarer Umsetz-Zeitpunkt vs. Stabilität), keine der beiden Methoden ist pauschal überlegen.

**C. Jiffy-/Torfquelltabletten**
1. Tablette in Wasser quellen lassen.
2. pH der Tablette auf 5,5–6,0 einstellen (Q16) — unkorrigiert kann bereits in der Keimphase eine Nährstoffsperre entstehen.
3. Eingeweichten oder trockenen Samen mittig einsetzen.
4. Wie Direktsaat weiterbehandeln.

**D. Steinwolle** (Hydro-/Coco-Setups)
1. Würfel vorquellen: Ausgangs-pH liegt bei ca. 8,0, vorquellen auf pH 5,2, pendelt sich danach auf 6,3–6,5 ein (Q16).
2. Danach mit pH-5,8-Wasser weitergießen.
3. Samen in die vorgeformte Vertiefung setzen.

Die höchste Einsteiger-Fehlerquote liegt hier im übersprungenen pH-Vorquellschritt.

## 6. `diagnosis` → Erfolgsbewertung

Normale Zeitfenster: Pfahlwurzel-Erscheinen nach 24–72 h (Papiertuch) bzw. 3–7 Tage unsichtbar im Medium (Direktsaat/Jiffy/Steinwolle). Umsetzzeitpunkt bei der Papiertuch-Methode: Pfahlwurzellänge 1–2 cm (Q4). Zu früh umgesetzt (unter ca. 0,5 cm) erhöht das Abbruchrisiko durch mechanische Belastung; zu spät (deutlich über 2–3 cm, beginnende Verzweigung oder Vertrocknung an der Luft) erschwert das schadensfreie Einsetzen. Warnsignal: keine sichtbare Aktivität nach 7–10 Tagen bei intakt aussehendem Samen spricht für gescheiterte Keimung — Ursachen sind meist zu kaltes Substrat/Wasser, zu altes Saatgut oder, seltener, falsche Einpflanztiefe bei Direktsaat.

## 7. `corrective_actions`

**Zu lange eingeweicht (> 32 h) ohne sichtbaren Fortschritt:** auf Fäulnisgeruch oder Weichwerden prüfen, im Zweifel verwerfen und mit frischem Samen neu starten — ein überweichter Samen keimt in der Praxis selten noch zuverlässig.

**Erste Anzeichen von Umkippkrankheit (Damping-off)** — dünner, wässrig-brauner Stängelansatz direkt über dem Substrat, umknickender Sämling: befallene Sämlinge sind meist nicht zu retten (Q12, Q13). Fokus liegt auf sofortiger Isolation befallener Töpfe und Korrektur von Übernässung/Luftzirkulation für die übrigen Sämlinge.

**Mechanische Beschädigung beim Umsetzen** (abgebrochene Wurzelspitze): der Samen kann in vielen Fällen dennoch weiterwachsen, solange ein Teil der Pfahlwurzel intakt bleibt — nicht automatisch verwerfen, aber engmaschig beobachten.

## 8. `preventive_measures`

Werkzeughygiene (Pinzette, Teller) vor Kontakt mit dem Samen, um Pilzsporen-Übertrag zu vermeiden. Temperaturkontrolle ist der wichtigste Einzelhebel: Wasser-/Substrattemperatur konsequent im 20–28 °C-Korridor halten (Block 2), mit Thermometer statt Schätzung. Damping-off-Prävention läuft primär über Wassermanagement: keine stehende Nässe, ausreichende Luftzirkulation, Substrat zwischen den Gaben leicht antrocknen lassen (Q12, Q13, Q18). Keimschale/-tüte nicht in direktem Sonnenlicht oder auf Heizkörpern platzieren — das erzeugt Temperaturspitzen statt der gewünschten stabilen Wärme.

## 9. `environmental_factors`

Zwei unterschiedliche RH-Zielwerte gelten für zwei unterschiedliche Kontexte, die im Grower-Alltag leicht verwechselt werden. In der **geschlossenen Keimkammer/-tüte** (Papiertuch-Methode oder frisch gesäter Jiffy/Steinwolle unter Haube) liegt der optimale RH-Bereich bei 65–70 %; eine kontrollierte Studie dokumentiert bei 20 °C/65 % RH eine Keimrate von 93,3 % (Q1). Sobald der Sämling sichtbar ist und in die **offene Sämlingsphase** übergeht, sinkt der empfohlene RH-Zielwert auf 40–50 %, um das mit anhaltend hoher Feuchte in offener Umgebung steigende Damping-off-Risiko zu senken (Q14). Das ist kein Widerspruch zwischen den Quellen, sondern zwei verschiedene Phasen mit unterschiedlichem Zielwert — wird das im Grow-Alltag vermischt, wirkt die Anweisung scheinbar widersprüchlich. Für die Feinsteuerung ab der Sämlingsphase eignet sich SecretLeafs VPD-Rechner (`/tools/vpd`), der Temperatur und RH phasenspezifisch zusammenführt.

Licht: Während der eigentlichen Keimung (vor Erscheinen der Kotyledonen) ist Dunkelheit vorteilhaft (Block 2); erst nach dem Einpflanzen und Erscheinen der Keimblätter wird eine Lichtquelle relevant.

## 10. `nutrient_interactions`

**N/A für die Kernkeimung** — der Samen zehrt in dieser Phase von seinen eigenen Reserven, Düngung ist nicht nötig und bei zu hoher Ausgangs-EC sogar riskant für die empfindliche Pfahlwurzel. Die einzige nährstoffnahe Stellschraube in dieser Phase ist die pH-Einstellung des Keimmediums bei Jiffy-/Torfquelltabletten (5,5–6,0) und Steinwolle (Vorquellen auf 5,2, Nachgießen mit 5,8) — siehe Block 5, Methoden C/D. Das ist strenggenommen keine Düngungsfrage, sondern Verfügbarkeits-/Sperr-Vermeidung für die erste Wurzelaufnahme direkt nach der Keimung.

## 11. `common_mistakes`

- **Zu heißes Einweichwasser** (> 29 °C) — Hitzeschockrisiko für den Embryo (Q9).
- **Zu lange eingeweicht** (> 24–32 h) — Fäulnis-/Sauerstoffmangelrisiko (Q11).
- **Lichteinfall während der Dunkelphase** — kein akuter Schaden, aber suboptimale Bedingungen gegen den photoblastischen Mechanismus (Q15).
- **Der Schwimm-/Sinktest als Vorab-Viabilitätstest** ist ein weit verbreiteter Mythos: Frische, wasserreiche Samen sinken tendenziell eher, alte, hohle Samen schwimmen eher — aber schwimmende Samen keimen nachweislich trotzdem zuverlässig. Mehrere unabhängige, kritische Quellen kommen übereinstimmend zu diesem Schluss (Q5); der Test ist kein belastbarer Vorhersage-Indikator. Davon zu unterscheiden ist der harmlose Nebeneffekt, dass ein bereits aufgeplatzter, keimender Samen während des Einweichens von selbst absinkt — das ist lediglich ein Begleitsymptom der laufenden Keimung, kein Vorab-Test.
- **Übernässung nach dem Einpflanzen** — bräunliche, schleimige Wurzelspitzen und fauliger Geruch sind frühe Wurzelfäule-Warnzeichen (Q18).
- **Mechanische Beschädigung der Pfahlwurzel beim Umsetzen** — mit den Fingern statt einer sauberen Pinzette hantieren, oder falsche Ausrichtung (die Wurzelspitze muss nach unten zeigen).

## 12. `advanced_considerations`

Autoflower-Samen keimen biologisch identisch zu photoperiodischen Sorten — es gibt keinen eigenen Keimmechanismus. Praktisch relevant ist ein anderer Punkt: Autoflower-Sämlinge gelten als empfindlicher gegenüber Verzögerungen und Stress in der Keim-/frühen Sämlingsphase, da ihr kompakter, lichtunabhängiger Zyklus wenig Puffer für Rückschläge lässt — ein verzögerter oder gestresster Start wirkt sich über die gesamte, kürzere Lebensspanne stärker aus als bei photoperiodischen Sorten (Q17). Diese Einschätzung stammt aus Züchter-Praxisquellen, nicht aus kontrollierten Vergleichsstudien, und wird entsprechend als Level-1-Konsens geführt, nicht als belegte Kausalität.

## 13. `related_topics`

- **Vorbedingung:** `cannabis-anbau-grundlagen` (Grundlagenartikel).
- **Weiterführend:** `keimung-und-anzucht` (Backlog #54, Priorität 78) — behandelt die direkt anschließende Sämlingsphase; eigenes Stage-1-Dossier folgt separat.
- **Werkzeug:** SecretLeafs VPD-Rechner (`/tools/vpd`) für die RH-/Temperatur-Feinsteuerung ab der Sämlingsphase (Block 9).

## 14. `references`

| Q# | Titel | Publisher / Autor | Jahr | URL/DOI | Evidence-Level | Kontext im Artikel |
|---|---|---|---|---|:---:|---|
| Q1 | Temperature Limits for Seed Germination in Industrial Hemp (*Cannabis sativa* L.) | *Agriculture* (MDPI), Bd. 2(4), Art. 29 | 2022 | https://www.mdpi.com/2673-7655/2/4/29 | 3 | Kardinaltemperaturen, RH-Optimalpunkt (Block 2, 9) |
| Q2 | Influence of Temperature on *Cannabis sativa* Seed Germination: Insights from Lusikisiki Ecotypes, Eastern Cape | Dumani, A. et al., *Asian Journal of Crop Science* 16(1), 6–21 | 2024 | DOI 10.3923/ajcs.2024.6.21 | 3 | Keimrateneinbruch bei Kälte (Block 2) |
| Q3 | How to Germinate Cannabis Seeds in Paper Towels | ILGM | — | https://ilgm.com/resources/guides/how-to-germinate-cannabis-seeds-in-paper-towels | 1 | Papiertuch-Methode, Zeitrahmen (Block 3, 5) |
| Q4 | How Long Should a Taproot Develop Before Planting? | Greenpoint Seeds | — | https://greenpointseeds.com/growing-tips/how-long-should-a-taproot-develop-before-planting/ | 1 | Umsetz-Zeitpunkt (Block 5, 6) |
| Q5 | Cannabis seed float test: useful or myth, explained | Cannoptikum | — | https://cannoptikum.com/en/blog/cannabis-care-processing/cannabis-seed-float-test | 1–2 | Schwimm-/Sinktest-Mythos (Block 11) |
| Q6 | What do good cannabis seeds look like? | GrowWeedEasy | — | https://www.growweedeasy.com/what-do-cannabis-seeds-look-like | 1 | Optische Samenqualität (Block 4) |
| Q7 | Germinating Cannabis Seeds: Temperature and Humidity Considerations | FloraFlex | — | https://www.floraflex.com/blogs/floraflex-media/germinating-cannabis-seeds-temperature-and-humidity-considerations | 1 | Praxis-Temperaturkorridor (Block 2, 5) |
| Q8 | The Complete Guide To Germinating Cannabis Seeds | Royal Queen Seeds | — | https://www.royalqueenseeds.com/content/45-germinating | 1 | Methodenübersicht (Block 2, 5) |
| Q9 | Cannabis Heat Stress: How to Avoid and Treat It | Sensi Seeds | — | https://sensiseeds.com/en/blog/cannabis-heat-stress-how-to-avoid-and-treat-it/ | 1 | Hitzeschock-Schwelle (Block 5, 11) |
| Q10 | How to Germinate Cannabis Seeds (2026 Guide) | BudTrainer | 2026 | https://www.budtrainer.com/blogs/learn/how-to-germinate-cannabis-seeds | 1 | Methodenvergleich Papiertuch vs. Direktsaat (Block 3, 5) |
| Q11 | How Long To Soak Cannabis Seeds? | Gardeningfly | — | https://gardeningfly.com/seeds/how-long-to-soak-cannabis-seeds/ | 1 | Einweichdauer-Grenzwerte (Block 3, 5, 11) |
| Q12 | My Cannabis is Damping Off! What Should I Do? | Herbies Seeds | — | https://herbiesheadshop.com/blog/damping-off-in-cannabis-treatment-and-prevention | 1 | Damping-off-Ursachen (Block 7, 8) |
| Q13 | Hemp (*Cannabis sativa*) — Damping-off | Pacific Northwest Pest Management Handbooks | — | https://pnwhandbooks.org/plantdisease/host-disease/hemp-cannabis-sativa-damping | 1–2 | Erregerarten, autoritative Extension-Quelle (Block 7, 8) |
| Q14 | How to Prevent Damping Off When Growing Weed | Royal Queen Seeds | — | https://www.royalqueenseeds.com/us/blog-how-to-spot-and-prevent-damping-off-n773 | 1 | RH-Zielwert frühe Sämlingsphase (Block 9) |
| Q15 | Light Requirements and Photoblastic Responses | PlantPropagation.org | — | https://plantpropagation.org/light-requirements-and-photoblastic-responses/ | 1–2 | Photoblastismus-Mechanismus (Block 2, 9) |
| Q16 | Jiffy or peat pellet — all the information / Germinating on Rockwool substrate | Pevgrow / Dutchfem Seeds | — | https://pevgrow.com/blog/en/jiffy-in-cannabis-crops-all-the-information/ ; https://www.dutchfem.com/germinating-on-hydro-substrate/ | 1 | Jiffy-/Steinwolle-pH (Block 5, 10) |
| Q17 | Autoflowering Seed Germination Guide | Neptune Seed Bank / Royal King Seeds | — | https://royalkingseeds.us/blog/autoflowering-seed-germination-guide | 1 | Autoflower-Nuancen (Block 12) |
| Q18 | Overwatering Cannabis: Prevention, Diagnosis, and Solutions | Kind Seed Co | — | https://kindseed.com/overwatering-cannabis-prevention-diagnosis-and-solutions/ | 1 | Wurzelfäule-Erkennung (Block 7, 11) |

## 15. `faq`

**Ist der Schwimm-/Sinktest zuverlässig, um vorab zu prüfen, ob ein Samen keimt?**
Nein. Mehrere unabhängige Quellen widerlegen ihn übereinstimmend als Vorhersage-Indikator — schwimmende Samen keimen nachweislich trotzdem zuverlässig (Block 11).

**Wie lange darf ich einen Samen maximal einweichen?**
Standard sind 12–24 h, harte Obergrenze 24–32 h. Danach steigt das Fäulnisrisiko durch Sauerstoffmangel deutlich (Block 3, 5).

**Was, wenn nach 7–10 Tagen noch nichts passiert ist?**
Das spricht für eine gescheiterte Keimung. Samen auf Fäulnis/Verfall prüfen und im Zweifel mit frischem Saatgut neu starten (Block 6, 7).

**Papiertuch oder Direktsaat — was ist wirklich besser?**
Kein klarer Sieger, sondern ein Trade-off: Papiertuch bietet Sichtkontrolle und einen erkennbaren Umsetz-Zeitpunkt, Direktsaat bietet mehr Temperaturstabilität und keinen Umsetzstress (Block 5).

**Muss ich beim Einpflanzen schon düngen?**
Nein — der Samen zehrt von eigenen Reserven. Relevant ist höchstens die pH-Einstellung bei Jiffy-/Steinwolle-Medium (Block 10).

**Sind Autoflower-Samen bei der Keimung anders zu behandeln?**
Biologisch nicht, aber sie gelten als empfindlicher gegenüber Verzögerungen — ein holpriger Start kostet bei der kürzeren, lichtunabhängigen Lebensspanne relativ mehr (Block 12).

## 16. `expert_tips`

Die Papiertuch-vs.-Direktsaat-Entscheidung ist der am meisten unterschätzte Timing-Hebel dieser Phase: Papiertuch gibt Kontrolle und einen sichtbaren Umsetz-Zeitpunkt, aber jede zusätzliche Handhabung — insbesondere das Umsetzen selbst — ist ein Risikopunkt für die fragile Pfahlwurzel. Wer bereits zuverlässig stabile Zimmertemperatur (20–25 °C) halten kann, gewinnt mit Direktsaat tendenziell mehr an Stabilität, als er durch die fehlende Sichtkontrolle verliert. Die zweite, oft übersehene Stellschraube: den RH-Zielwert nach dem Sichtbarwerden des Sämlings aktiv von 65–70 % auf 40–50 % senken (Block 9) — wer die hohe Keimkammer-Feuchte einfach beibehält, erhöht unnötig das Damping-off-Risiko genau in der empfindlichsten Phase.

---

*Ende Draft. Bereit für Stage 3 (Fact-Check, menschliches Pflicht-Gate) gemäß `ARTICLE_WORKFLOW.md` §4.*
