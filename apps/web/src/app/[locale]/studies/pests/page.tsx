"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import { areaLabel, riskClass, riskLabel, stageLabel, type GrowArea, type PlantStage, type RiskLevel } from "@/lib/terpira/lexicon";

type PestCategory = "saugend" | "blattfresser" | "substrat" | "wurzel";

type PestEntry = {
  id: string;
  name: string;
  latinName: string;
  category: PestCategory;
  risk: RiskLevel;
  growArea: GrowArea;
  stage: PlantStage;
  images: string[];
  short: string;
  /** Körpergröße Adulte in mm */
  sizeMm?: string;
  /** Lebenszyklus Ei→Adult in Tagen (bei Optimaltemp.) */
  lifecycleDays?: string;
  /** Optimale Vermehrungsbedingungen */
  optimalConditions?: string;
  /** Wirtschaftliche Schadensschwelle / Action Level */
  actionThreshold?: string;
  symptoms: string[];
  monitoring: string[];
  prevention: string[];
  treatmentBio: string[];
  treatmentIntegrated: string[];
};

type SymptomOption = {
  id: string;
  label: string;
  keywords: string[];
};

type BeneficialRow = {
  pest: string;
  beneficial: string;
  targetStage: string;
  deploymentWindow: string;
  notes: string;
};

type ExternalSource = {
  title: string;
  url: string;
  kind: string;
};

const categoryLabel: Record<PestCategory, string> = {
  saugend: "Saugende Schädlinge",
  blattfresser: "Blatt-/Blütenfresser",
  substrat: "Substrat-Schädlinge",
  wurzel: "Wurzel-Schädlinge"
};


const pestLexicon: PestEntry[] = [
  {
    id: "spinnmilben",
    name: "Spinnmilben",
    latinName: "Tetranychus urticae (Koch, 1836)",
    category: "saugend",
    risk: "kritisch",
    growArea: "beides",
    stage: "veg",
    images: ["/terpira/pests/spider-mites.jpg"],
    sizeMm: "0,3–0,5 mm (Adulte, weiblich)",
    lifecycleDays: "7–14 Tage (Ei → Adult bei 25 °C)",
    optimalConditions: "Temp. > 27 °C, RLF < 40 %, trockene Warmluft",
    actionThreshold: "≥ 5 Adulte / Blatt oder sichtbare Gespinste an > 10 % der Pflanzen",
    short: "Feinste Gespinste und helle Saugpunkte auf Blattoberseiten, exponentielle Ausbreitung bei trockener Warmluft. Populationsverdopplung alle 3–5 Tage unter Optimalbedingungen.",
    symptoms: [
      "Punktförmige Aufhellungen auf oberen Blattflächen",
      "Feine Gespinste an Blattunterseiten und Triebspitzen",
      "Schneller Vitalitätsverlust bei hoher Temperatur"
    ],
    monitoring: [
      "Wöchentlich 60x-Lupe an Blattunterseiten",
      "Frühwarnkarten nahe Umluft und typischen Wärmeinseln",
      "Befallskarte je Zone dokumentieren"
    ],
    prevention: [
      "Klimaschwankungen vermeiden (zu heiß/trocken)",
      "Neue Pflanzen 10-14 Tage quarantänisieren",
      "Regelmäßige Blattunterseiten-Checks"
    ],
    treatmentBio: [
      "Raubmilben (Phytoseiulus persimilis) früh ausbringen",
      "Kaliseife- oder Pflanzenölpräparate im Intervall",
      "Befallene Fächerblätter selektiv entfernen"
    ],
    treatmentIntegrated: [
      "Blockweise Zonenbehandlung statt Einzelpflanzen",
      "Sprühfolge 2-3 Zyklen im Abstand von 3-5 Tagen",
      "Nachbehandlung mit Nützlingsaufbau stabilisieren"
    ]
  },
  {
    id: "thripse",
    name: "Thripse (Kalifornischer Blütenthrips)",
    latinName: "Frankliniella occidentalis (Pergande, 1895)",
    category: "saugend",
    risk: "hoch",
    growArea: "beides",
    stage: "alle",
    images: ["/terpira/pests/thrips.jpg"],
    sizeMm: "1,0–1,7 mm (Adulte)",
    lifecycleDays: "14–20 Tage (Ei → Adult bei 25 °C)",
    optimalConditions: "20–30 °C, moderate RLF 50–70 %, Puppenstadien im Substrat",
    actionThreshold: "≥ 5 Adulte / Blauleimtafel / Woche oder sichtbare Silberflecken",
    short: "Silbrig glänzende Fraßflächen und schwarze Kotpunkte (Faeces). Sehr mobil, Virusvektor (TSWV), Puppenstadien im Substrat erschweren Bekämpfung.",
    symptoms: [
      "Silbrige Schabspuren entlang Blattadern",
      "Kleine schwarze Kotpunkte auf Blattunterseiten",
      "Verkrüppeltes Neuwachstum bei starkem Befall"
    ],
    monitoring: [
      "Blaue Leimtafeln in Kronenhöhe",
      "Zweimal pro Woche Blattunterseiten prüfen",
      "Befallsschwerpunkte an Einlass und Laufwegen kontrollieren"
    ],
    prevention: [
      "Saubere Kleidung/Tools zwischen Zonen",
      "Netz- und Schleusenhygiene am Eingang",
      "Luftbewegung ohne direkte Trockenstress-Zonen"
    ],
    treatmentBio: [
      "Raubmilben (Amblyseius swirskii, cucumeris)",
      "Nematoden gegen Puppenstadien im Substrat",
      "Milde Kontaktmittel in Rotationsstrategie"
    ],
    treatmentIntegrated: [
      "Befallsdruck über 2 Lebenszyklen durchbrechen",
      "Kombination aus Blatt- und Substratmaßnahmen",
      "Nachkontrolle 7 und 14 Tage nach Erstbehandlung"
    ]
  },
  {
    id: "blattlaeuse",
    name: "Blattläuse",
    latinName: "Myzus persicae / Macrosiphum euphorbiae",
    category: "saugend",
    risk: "mittel",
    growArea: "beides",
    stage: "veg",
    images: ["/terpira/pests/aphids.jpg"],
    sizeMm: "1,5–3,0 mm (wingless Adulte)",
    lifecycleDays: "7–10 Tage je Generation (parthenogenetisch, bis 12 Nymphen/Tag)",
    optimalConditions: "15–25 °C, hoher N-Gehalt im Pflanzengewebe, geschützte Standorte",
    actionThreshold: "≥ 1 Kolonie (> 20 Individuen) / Pflanze oder Honigtau sichtbar",
    short: "Kolonien an Triebspitzen mit Honigtau-Ausscheidung und sekundärem Rußtau-Risiko. Parthenogenetische Vermehrung ermöglicht schnellen Populationsaufbau.",
    symptoms: [
      "Koloniebildung an Triebspitzen und Blattstielen",
      "Klebriger Honigtau auf Blättern",
      "Gekräuselte junge Blätter"
    ],
    monitoring: [
      "Visuelle Triebspitzen-Kontrolle",
      "Ameisenaktivität als indirekten Hinweis werten",
      "Honigtau-Belag dokumentieren"
    ],
    prevention: [
      "Lückenlose Hygiene im Mutterpflanzenbereich",
      "Stickstoffüberschuss vermeiden",
      "Frischmaterial nur nach Quarantäne integrieren"
    ],
    treatmentBio: [
      "Florfliegenlarven und Marienkäfer einsetzen",
      "Kaliseife lokal auf Kolonien",
      "Befallene Triebteile rückschneiden"
    ],
    treatmentIntegrated: [
      "Nützlingsbesatz über 2-3 Wochen stabil halten",
      "Nachbehandlung auf versteckte Kolonien",
      "Honigtauflächen reinigen"
    ]
  },
  {
    id: "weisse-fliegen",
    name: "Weiße Fliegen (Gewächshausmottenschildlaus)",
    latinName: "Trialeurodes vaporariorum (Westwood, 1856)",
    category: "saugend",
    risk: "hoch",
    growArea: "beides",
    stage: "alle",
    images: ["/terpira/pests/whiteflies.jpg"],
    sizeMm: "1,0–1,5 mm (Adulte), Larven 0,3–0,7 mm (sessil)",
    lifecycleDays: "21–30 Tage (Ei → Adult bei 22 °C)",
    optimalConditions: "20–28 °C, RLF 60–80 %, dichtes Blattwerk",
    actionThreshold: "≥ 10 Adulte / Gelbtafel / Woche oder Larvenplatten auf > 5 % der Blätter",
    short: "Aufgewirbelte weiße Adulte bei Pflanzenbewegung. Sessile Larvenstadien an Blattunterseiten saugen Phloem. Hohe Honigtau-Produktion mit Rußtau-Folge.",
    symptoms: [
      "Flugschwarm bei Berührung der Pflanze",
      "Larvenplatten auf Blattunterseiten",
      "Rußtau-Risiko durch Honigtau"
    ],
    monitoring: [
      "Gelbtafeln in Vegetations- und Blütezone",
      "Larvenstadien unter Lupe unterscheiden",
      "Befallsklassen pro Tisch erfassen"
    ],
    prevention: [
      "Einlasshygiene und Insektenschutznetze",
      "Befallsfreie Jungpflanzen sicherstellen",
      "Dichte Luftzirkulation im Kronendach"
    ],
    treatmentBio: [
      "Encarsia formosa parasitische Wespen",
      "Milde Öle/Seifen in Blattunterseitenrichtung",
      "Häufige mechanische Blattreduktion"
    ],
    treatmentIntegrated: [
      "Kombination aus Nützlingen und Leimtafeln",
      "Intervallbehandlungen auf Eier/Larven abstimmen",
      "Honigtau-Management gegen Sekundärpilze"
    ]
  },
  {
    id: "schmierlaeuse",
    name: "Schmierläuse (Wollläuse)",
    latinName: "Planococcus citri / Pseudococcus longispinus",
    category: "saugend",
    risk: "hoch",
    growArea: "beides",
    stage: "alle",
    images: ["/terpira/pests/mealybugs.jpg"],
    sizeMm: "2,0–5,0 mm (Adulte weiblich, mit Wachsmantel)",
    lifecycleDays: "30–50 Tage (Ei → Adult bei 25 °C)",
    optimalConditions: "22–30 °C, geschützte Nischen, hohe N-Düngung",
    actionThreshold: "Jede sichtbare Kolonie → sofortige Maßnahme (null Toleranz in Blütephase)",
    short: "Wachsbedeckte Kolonien in Blattachseln und Stammknoten. Honigtau-Produktion fördert Rußtau. Wachsschicht erschwert Kontaktmittel-Penetration.",
    symptoms: [
      "Weiße, watteartige Nester an Knoten und Blattstielen",
      "Klebrige Beläge (Honigtau) auf Blättern",
      "Wachstumsdepression und verkrümmte Triebspitzen"
    ],
    monitoring: [
      "Blattachseln und Stammnahe Zonen mit Lupe prüfen",
      "Klebrige Befallsschwerpunkte je Pflanze markieren",
      "Ameisenaktivität als Indikator dokumentieren"
    ],
    prevention: [
      "Quarantäne für neue Pflanzen und Stecklinge",
      "Regelmäßige Hygiene in schwer einsehbaren Knoten",
      "Überdüngung und Stressspitzen vermeiden"
    ],
    treatmentBio: [
      "Lokales Entfernen starker Kolonien",
      "Kaliseife oder geeignete Ölpräparate punktuell",
      "Nützlinge wie Cryptolaemus bei frühem Befall"
    ],
    treatmentIntegrated: [
      "Befallsherde zonenweise behandeln",
      "Wiederholung im 5-7-Tage-Intervall",
      "Nachkontrolle über mindestens 3 Wochen"
    ]
  },
  {
    id: "zikaden",
    name: "Zikaden (Blattzikaden)",
    latinName: "Empoasca spp. / Cicadellidae",
    category: "saugend",
    risk: "mittel",
    growArea: "beides",
    stage: "veg",
    images: ["/terpira/pests/leafhoppers.jpg"],
    sizeMm: "2–4 mm (Adulte), keilförmig, grünlich",
    lifecycleDays: "20–35 Tage (Ei → Adult)",
    optimalConditions: "Warme Tage (> 22 °C), Eintrag über Zuluft oder Outdoor-Kontakt",
    actionThreshold: "≥ 3 Adulte / Gelbtafel / Woche oder punktförmige Chlorosen an > 10 % Blättern",
    short: "Sehr mobile Sauger mit charakteristischen punktförmigen Chlorosen (Hopper Burn). Potenzielle Vektoren für Phytoplasmen und Pflanzenviren.",
    symptoms: [
      "Feine, helle Punktierungen auf Blattoberseiten",
      "Unruhige, springende Insekten bei Berührung",
      "Uneinheitliches Blattbild in Hotspot-Zonen"
    ],
    monitoring: [
      "Gelbtafeln in Kronenhöhe",
      "Ränder und Eintragszonen engmaschig prüfen",
      "Symptomkarten je Reihe führen"
    ],
    prevention: [
      "Eintragsmanagement über Schleusen/Netze",
      "Unkrautdruck um Kulturflächen reduzieren",
      "Luftführung ohne Stresszonen optimieren"
    ],
    treatmentBio: [
      "Frühzeitige mechanische Reduktion lokaler Befallsschwerpunkte",
      "Biologische Kontaktmaßnahmen in Rotation",
      "Nützlingsfenster stabil halten"
    ],
    treatmentIntegrated: [
      "Intervallbehandlung nach Populationsdruck",
      "Befallsquellen außerhalb der Kultur beseitigen",
      "Nachkontrolle nach 7 und 14 Tagen"
    ]
  },
  {
    id: "trauermuecken",
    name: "Trauermücken",
    latinName: "Bradysia spp. (Sciaridae)",
    category: "substrat",
    risk: "mittel",
    growArea: "indoor",
    stage: "keimling",
    images: ["/terpira/pests/fungus-gnats-real.jpg"],
    sizeMm: "Adulte 2–4 mm (fliegend), Larven 5–8 mm (glasig-weiß, schwarzer Kopf)",
    lifecycleDays: "21–28 Tage (Ei → Adult bei 22 °C)",
    optimalConditions: "Dauernasse Substratoberfläche, Temp. 18–25 °C, hoher Organikanteil",
    actionThreshold: "≥ 20 Adulte / Gelbtafel / Woche oder sichtbare Larven im oberen Substratbereich",
    short: "Adulte Mücken (Lästlinge) sind kaum direkt schädlich. Larven fressen an Feinwurzeln und Wurzelhaaren, was v.a. Keimlinge und Jungpflanzen stark schwächt. Sekundärinfektionen (Pythium, Fusarium) werden gefördert.",
    symptoms: [
      "Kleine schwarze Flieger über dem Substrat",
      "Langsames Wachstum bei Jungpflanzen",
      "Feine Wurzelverletzungen und Staunässespuren"
    ],
    monitoring: [
      "Gelbtafeln auf Topfkante",
      "Substratoberfläche auf Larven prüfen",
      "Bewässerungsfrequenz protokollieren"
    ],
    prevention: [
      "Substratoberfläche antrocknen lassen",
      "Keine dauerhafte Staunässe",
      "Töpfe und Drains regelmäßig reinigen"
    ],
    treatmentBio: [
      "Nematoden (Steinernema feltiae)",
      "BTI-Produkte im Gießwasser",
      "Sand-/Mineraldeckschicht auf Substrat"
    ],
    treatmentIntegrated: [
      "Gießregime korrigieren + Nematoden",
      "Leimtafeln zur adulten Reduktion",
      "Substratwechsel bei massivem Dauerdruck"
    ]
  },
  {
    id: "wurzellaeuse",
    name: "Wurzelläuse (Cannabis Root Aphid)",
    latinName: "Rhopalosiphum rufiabdominale / Pemphigus spp.",
    category: "wurzel",
    risk: "kritisch",
    growArea: "indoor",
    stage: "veg",
    images: ["/terpira/pests/root-aphids-real.jpg"],
    sizeMm: "1,0–2,5 mm (wachsig-weiß, leicht mit Perlite verwechselbar)",
    lifecycleDays: "14–21 Tage je Generation (asexuell, 30–60 Nymphen/Weibchen)",
    optimalConditions: "Warmes Substrat > 22 °C, stehende Feuchtigkeit, organische Substrate",
    actionThreshold: "Jeder Nachweis → sofortige Isolierung (Null-Toleranz, da unterirdisch schwer kontrollierbar)",
    short: "Versteckter Wurzelbefall, der klassische Mangelsymptome mimiert: Welken, Chlorosen, Wachstumsstopp trotz korrekter Düngung. Wachsige Kolonien an Feinwurzeln und Topfwänden. Extrem schwer zu eliminieren.",
    symptoms: [
      "Mangelbild trotz korrekter Düngung",
      "Schwacher Wurzelballen, geringes Wurzelweiß",
      "Kein Erholungseffekt nach Fütterungsanpassung"
    ],
    monitoring: [
      "Wurzelkontrolle bei Verdachtsfällen",
      "Substrat-/Drain-Proben mikroskopisch prüfen",
      "Vergleich vitaler vs. schwacher Pflanzen"
    ],
    prevention: [
      "Sauberes, geprüftes Substrat verwenden",
      "Mutterraum und Propagation strikt trennen",
      "Keine unkontrollierten Pflanzentransfers"
    ],
    treatmentBio: [
      "Nematoden und mikrobielles Wurzelmanagement",
      "Substratreduktion in stark betroffenen Bereichen",
      "Wurzeldruck durch Klima stabilisieren"
    ],
    treatmentIntegrated: [
      "Befallene Chargen isolieren",
      "Systematische Sanierung der Bewässerungslinien",
      "Nachsorge mit engmaschigem Root-Monitoring"
    ]
  },
  {
    id: "raupen",
    name: "Raupen (Eulenfalter / Hanfzünsler)",
    latinName: "Helicoverpa armigera / Ostrinia nubilalis (Lepidoptera)",
    category: "blattfresser",
    risk: "hoch",
    growArea: "outdoor",
    stage: "bluete",
    images: ["/terpira/pests/caterpillars.jpg"],
    sizeMm: "10–40 mm (Larven, artabhängig), Eier 0,5 mm (halbkugelig)",
    lifecycleDays: "25–40 Tage (Ei → Puppe), 1–3 Generationen/Jahr",
    optimalConditions: "Warme Sommernächte > 18 °C, Falterzuflug ab Dämmerung, dichte Blütenstände",
    actionThreshold: "≥ 1 Kotkrümel oder Fraßspur / Blütenstand → sofortige Inspektion + BT-Behandlung",
    short: "Starke Fraß- und Bohrschäden in Blütenständen. Kotkrümel begünstigen Botrytis cinerea (Grauschimmel) als Sekundärpathogen. Nachtaktive Falter legen Eier direkt an Blüten.",
    symptoms: [
      "Große Fraßlöcher in Blättern",
      "Kotkrümel in Blütenständen",
      "Lokaler Blütentod durch Einbohren"
    ],
    monitoring: [
      "Tägliche Blütenkontrolle in Outdoor-Phasen",
      "Frass und Kot früh markieren",
      "Nachtkontrolle bei hohem Falterdruck"
    ],
    prevention: [
      "Insektenschutznetze früh in der Saison",
      "Lichtfallen außerhalb Anbaufläche",
      "Regelmäßiges Entlauben dichter Zonen"
    ],
    treatmentBio: [
      "Bacillus thuringiensis (BT) zielgerichtet",
      "Mechanisches Absammeln",
      "Präventivbehandlung vor kritischer Blüte"
    ],
    treatmentIntegrated: [
      "BT-Programm nach Wetterfenster planen",
      "Befallene Buds sofort entfernen",
      "Botrytis-Nachsorge in betroffenen Bereichen"
    ]
  },
  {
    id: "minierfliegen",
    name: "Minierfliegen",
    latinName: "Liriomyza trifolii / L. huidobrensis (Agromyzidae)",
    category: "blattfresser",
    risk: "mittel",
    growArea: "beides",
    stage: "veg",
    images: ["/terpira/pests/leaf-miners-real.jpg"],
    sizeMm: "Adulte 1,5–2,5 mm (schwarz-gelb), Larven 2–3 mm in Blattmesophyll",
    lifecycleDays: "17–25 Tage (Ei → Adult bei 25 °C)",
    optimalConditions: "20–30 °C, eingeschleppte Adulte über Zuluft oder Pflanzenmaterial",
    actionThreshold: "≥ 3 aktive Minen / Pflanze oder > 15 % Blattfläche geschädigt",
    short: "Charakteristische serpentinenartige Minen im Blattmesophyll reduzieren Photosyntheseleistung um 15–40 % pro befallenes Blatt. Einstichstellen der Adulten dienen als Eintrittspforten für Pathogene.",
    symptoms: [
      "Weiße, serpentinenartige Fraßgänge",
      "Punktförmige Einstichstellen",
      "Verringertes Blattflächenwachstum"
    ],
    monitoring: [
      "Blattkontrolle auf neue Tunnel",
      "Gelbtafeln gegen adulte Fliegen",
      "Befallsverlauf pro Zone kartieren"
    ],
    prevention: [
      "Frühe Entdeckung in Jungpflanzenphase",
      "Lüftungsöffnungen mit Insektenschutz",
      "Beschädigte Blätter zeitnah entfernen"
    ],
    treatmentBio: [
      "Nützlinge (Diglyphus isaea)",
      "Lokales Entfernen stark befallener Blätter",
      "Intervallkontrolle auf Neuschlupf"
    ],
    treatmentIntegrated: [
      "Nützlinge + Hygiene kombiniert einsetzen",
      "Rotationsprinzip für Kontaktmittel",
      "Nachkontrolle über mindestens 2 Wochen"
    ]
  },
  // === NEU: BREITMILBEN (häufig übersehen!) ===
  {
    id: "breitmilben",
    name: "Breitmilben (Broad Mites)",
    latinName: "Polyphagotarsonemus latus (Banks, 1904)",
    category: "saugend",
    risk: "kritisch",
    growArea: "indoor",
    stage: "veg",
    images: ["/terpira/pests/broad-mites.jpg"],
    sizeMm: "0,1–0,2 mm (mit bloßem Auge NICHT sichtbar, Mikroskop ab 60× nötig)",
    lifecycleDays: "5–7 Tage (Ei → Adult bei 25 °C, extrem schnell)",
    optimalConditions: "Temp. 20–30 °C, RLF > 60 %, geschützte Triebspitzen und Blütenansätze",
    actionThreshold: "Jeder Verdacht (verkrüppelte Triebspitzen) → sofortige Mikroskopkontrolle + Behandlung",
    short: "Mikroskopisch kleine Milben (0,2 mm), die mit ihrer toxischen Speichelinjizierung massives Verkrüppeln junger Triebe verursachen. Wird häufig als Nährstoffmangel, Herbizidschaden oder Genetikfehler fehldiagnostiziert. Eine der am häufigsten übersehenen Schädlinge im Cannabis-Anbau.",
    symptoms: [
      "Verkrüppelte, glasig-glänzende Triebspitzen (Epinastie)",
      "Blattränder rollen sich nach unten, werden ledrig und spröde",
      "Neuwachstum wirkt verdickt, verdreht, ‚aufgeblasen'",
      "Scheinbar nährstoffbedingte Wachstumsstörung, reagiert nicht auf Düngung",
      "Blütenansätze verformen sich, ‚popcorn buds' ohne Trichome"
    ],
    monitoring: [
      "Mikroskop ab 60× an Triebspitzen (Adulte und glänzende Eier auf Blattunterseite)",
      "Vergleich gesunder vs. verdächtiger Triebe unter gleichen Bedingungen",
      "Ausschlussdiagnose: Normaler pH/EC, kein Herbizidkontakt → Breitmilbenverdacht"
    ],
    prevention: [
      "Strikte Quarantäne aller Neuzugänge (min. 14 Tage) mit Mikroskop-Check",
      "Mutterpflanzen regelmäßig auf Triebspitzenanomalien prüfen",
      "Klimaführung optimieren: RLF-Schwankungen > 80 % vermeiden"
    ],
    treatmentBio: [
      "Raubmilben Amblyseius andersoni oder A. californicus (breites Beutespektrum)",
      "Neem-Azadirachtin-Präparate nach Herstellervorgabe, 3× im 5-Tage-Intervall",
      "Kaliseife-Sprühung als Kontaktmittel auf Triebspitzen und junge Blätter"
    ],
    treatmentIntegrated: [
      "Befallene Triebspitzen sofort entfernen und entsorgen (nicht kompostieren)",
      "Ablufttemperatur kurzzeitig > 33 °C senkt Milbenfertilität (Hitzeschock-Methode)",
      "3 Behandlungszyklen im 5-Tage-Abstand, um alle Lebensstadien zu erfassen",
      "Nachkontrolle unter Mikroskop an Tag 7, 14 und 21 nach letzter Behandlung"
    ]
  },

  // === NEU: ROSTMILBEN (Cannabis-spezifisch) ===
  {
    id: "rostmilben",
    name: "Hanfrostmilbe (Hemp Russet Mite)",
    latinName: "Aculops cannabicola (Farkas, 1960)",
    category: "saugend",
    risk: "kritisch",
    growArea: "beides",
    stage: "alle",
    images: ["/terpira/pests/russet-mites.jpg"],
    sizeMm: "0,15–0,20 mm (nur unter Mikroskop sichtbar, wurmförmig)",
    lifecycleDays: "21–30 Tage je Generation bei 25 °C",
    optimalConditions: "Temp. 22–30 °C, trockenes Klima, besiedelt Trichomzonen",
    actionThreshold: "Bronzefärbung an Basalblättern → Befall oft schon fortgeschritten. Prävention entscheidend.",
    short: "Cannabis-spezifischer Eriophyid-Milbe (nur 0,2 mm). Besiedelt bevorzugt Trichomzonen und zerstört Harzdrüsen. Aufwärtswanderung von unten nach oben, oft erst bei massivem Befall der Blüten bemerkt.",
    symptoms: [
      "Gelblich-bronzene Verfärbung der unteren Blätter (Aufwärtsprogression)",
      "Blattränder rollen sich nach oben, Blätter wirken glänzend/ölig",
      "Trichome werden zerstört: Blüten ohne Harz, flache/braune Drüsenköpfe",
      "Gesamte Pflanze wirkt ‚ausgetrocknet' trotz normaler Bewässerung",
      "Schwerer Befall: Kompletter Blattverlust von unten nach oben"
    ],
    monitoring: [
      "30-60× Handmikroskop: Wurmförmige Milben (4 Beine, kein Spinngewebe) an Blattstielen und Trichombasen",
      "UV-Taschenlampe: Beschädigte Trichome fluoreszieren anders als gesunde",
      "Basalblätter monatlich auf Bronzefärbung kontrollieren, besonders in der Blütephase"
    ],
    prevention: [
      "Quarantäne und Mikroskop-Screening jeder Neupflanze (Stiel und Blattunterseite)",
      "Separate Kleidung/Handschuhe pro Raum (Milben haften an Textilien)",
      "Mutterpflanzen-Bestand regelmäßig rotieren und Altstöcke entsorgen"
    ],
    treatmentBio: [
      "Schwefelbasierte Kontaktmittel in Vegetationsphase (vor Blüte!), 2× im Wochenintervall",
      "Neemöl-Sprühung wöchentlich in Veg, Mindestabstand 3 Wochen vor Ernte",
      "Raubmilben Amblyseius andersoni als Dauerbesatz präventiv"
    ],
    treatmentIntegrated: [
      "Befallene Pflanzen isolieren, befallene untere Blattschichten komplett entlauben",
      "Sprühen von unten nach oben (Milben wandern aufwärts)",
      "Befallene Blütenbestände bei starkem Befall nicht erntefähig – Totalverlust vermeiden durch Frühintervention",
      "Post-Harvest: Raum komplett reinigen, 48h > 35 °C oder Ozon-Behandlung"
    ]
  },

  // === NEU: SCHILDLÄUSE ===
  {
    id: "schildlaeuse",
    name: "Schildläuse",
    latinName: "Coccidae / Diaspididae",
    category: "saugend",
    risk: "mittel",
    growArea: "indoor",
    stage: "alle",
    images: ["/terpira/pests/scale-insects.jpg"],
    sizeMm: "1–6 mm (flach-oval, sessil, braun/schwarz Schild)",
    lifecycleDays: "30–60 Tage (artabhängig)",
    optimalConditions: "Warme, geschützte Standorte, trockene Bedingungen, verholzte Stängel",
    actionThreshold: "≥ 5 sessile Schilder / Stängelabschnitt (30 cm)",
    short: "Sessile Sauger mit festem Schutzschild auf Stängeln und Blattstielen. Oft spät entdeckt, da immobil und gut getarnt. Honigtau-Produktion und Schwächung der Pflanze.",
    symptoms: [
      "Braune, ovale, erhabene Krusten an Stängeln und Blattstielen",
      "Klebrige Honigtau-Flecken unter befallenen Bereichen",
      "Lokale Wachstumsdepression, Gelbfärbung benachbarter Blätter",
      "Schwer abkratzbare ‚Punkte' (nicht mit Substratpartikeln verwechseln)"
    ],
    monitoring: [
      "Stängel und Verzweigungspunkte visuell inspizieren (alle 2 Wochen)",
      "Honigtau-Streifen auf benachbarten Blättern als Frühindikator",
      "Leichtes Abkratzen verdächtiger ‚Punkte' → weicher Körper darunter = Schildlaus"
    ],
    prevention: [
      "Quarantäne-Prüfung an Stängeln bei Neuzugängen",
      "Regelmäßige Stängelinspektion v.a. an Mutterpflanzen und Langzeitkulturen",
      "Übermäßige Stickstoffdüngung vermeiden (weichzelliges Gewebe wird bevorzugt)"
    ],
    treatmentBio: [
      "Mechanisches Entfernen per Pinzette oder Zahnbürste + Isopropanol (70 %)",
      "Nützlinge: Marienkäfer (Chilocorus spp.) oder Schlupfwespen (Metaphycus spp.)",
      "Ölpräparate (Rapsöl 2 %) im Intervall, um Crawler-Stadien zu treffen"
    ],
    treatmentIntegrated: [
      "Starke Herde: Betroffene Triebabschnitte zurückschneiden und entsorgen",
      "Crawler-Wanderphase abpassen (einziges mobiles Stadium, 1–2× pro Generation)",
      "Nachkontrolle 14 und 28 Tage nach Behandlung auf Rekolonisation"
    ]
  },

  // === NEU: SPRINGSCHWÄNZE (Differentialdiagnose) ===
  {
    id: "springschwaenze",
    name: "Springschwänze (Collembola)",
    latinName: "Collembola (diverse Gattungen)",
    category: "substrat",
    risk: "niedrig",
    growArea: "indoor",
    stage: "alle",
    images: ["/terpira/pests/springtails.jpg"],
    sizeMm: "0,5–3 mm (weiß bis grau, springen bei Störung)",
    lifecycleDays: "14–21 Tage je Generation",
    optimalConditions: "Feuchtes Substrat, hoher Organikanteil, Temp. 15–25 °C",
    actionThreshold: "In der Regel harmlos – kein Eingriff nötig. Nur bei Massenbefall an Sämlingen relevant.",
    short: "Kleine, springende Substratbewohner, die meist organisches Material und Pilze fressen. Werden oft fälschlich als Schädlinge behandelt, sind aber Nützlinge im Bodenökosystem. Nur bei extremem Massenbefall und Keimlingen relevant.",
    symptoms: [
      "Kleine weiße/graue Tiere springen bei Substratberührung weg",
      "Fraßspuren an feinen Wurzelhaaren bei Massenbefall (selten)",
      "In der Regel keine sichtbaren Pflanzenschäden"
    ],
    monitoring: [
      "Substratoberfläche beobachten nach Gießen",
      "Bei Verdacht: Feuchtes Tuch über Substrat legen und nach 24h kontrollieren",
      "Nicht mit Trauermücken-Larven oder Wurzelläusen verwechseln"
    ],
    prevention: [
      "Substratfeuchte nach Bedarf regulieren, nicht dauerhaft nass",
      "Vermeidung übermäßiger organischer Auflagen (Mulch, Kompost) auf der Oberfläche"
    ],
    treatmentBio: [
      "Meist kein Eingriff nötig – sind Teil eines gesunden Bodenlebens",
      "Bei Massenbefall: Substratoberfläche abtrocknen lassen",
      "Kein Gift einsetzen – eher Klima/Gießregime anpassen"
    ],
    treatmentIntegrated: [
      "Gießfrequenz reduzieren, Drainage verbessern",
      "Nur bei nachweislichem Wurzelschaden an jungen Sämlingen: Nematoden (Steinernema) als Ultima Ratio"
    ]
  },

  // === NEU: PFLANZENNEMATODEN (Wurzelgallennematoden) ===
  {
    id: "wurzelnematoden",
    name: "Wurzelgallennematoden",
    latinName: "Meloidogyne spp. (M. incognita, M. javanica)",
    category: "wurzel",
    risk: "hoch",
    growArea: "beides",
    stage: "veg",
    images: ["/terpira/pests/root-knot-nematodes.jpg"],
    sizeMm: "0,5–1,0 mm (Larven, mikroskopisch; Gallen sichtbar)",
    lifecycleDays: "25–35 Tage je Generation bei 25 °C",
    optimalConditions: "Warmes Substrat > 20 °C, sandige/lockere Böden, wiederverwendete Erde",
    actionThreshold: "Sichtbare Gallen an Wurzeln → Befall bestätigt. Prävention entscheidend.",
    short: "Endoparasitische Rundwürmer, die charakteristische Gallen (Knoten) an Wurzeln verursachen. Beeinträchtigte Wasser- und Nährstoffaufnahme führt zu Welke, Chlorosen und Kümmerwuchs. Bodenmüdigkeit bei wiederholtem Anbau.",
    symptoms: [
      "Unregelmäßige Verdickungen (Gallen) an Feinwurzeln und Hauptwurzeln",
      "Welke trotz ausreichender Bewässerung",
      "Chlorosen und ungleichmäßiges Wachstum im Bestand",
      "Wurzelsystem braun, knotig, reduzierte Seitenwurzelbildung"
    ],
    monitoring: [
      "Wurzelkontrolle bei Umtopfen oder Verdacht (Gallen mit Lupe bestätigen)",
      "Bodenproben-Analyse bei wiederverwendeten Substraten",
      "Schwache Pflanzen trotz guter Düngung als Warnsignal"
    ],
    prevention: [
      "Nur frisches, steriles Substrat verwenden – gebrauchte Erde nie ohne Sterilisation wiederverwenden",
      "Zugekaufte Stecklinge und Jungpflanzen: Wurzeln auf Gallen kontrollieren",
      "Antagonistische Pilze (Paecilomyces lilacinus) präventiv einsetzen"
    ],
    treatmentBio: [
      "Nützliche Nematoden (Steinernema, Heterorhabditis) sind NICHT gegen Meloidogyne wirksam – keine Verwechslung!",
      "Biologische Bodenentseuchung: Kreuzblütler-Gründüngung (Biofumigation mit Senf/Ölrettich)",
      "Pilzpräparate mit Purpureocillium lilacinum gegen Nematoden-Eier"
    ],
    treatmentIntegrated: [
      "Befallenes Substrat komplett entsorgen (nicht im Garten verwenden)",
      "Solarisation bei Outdoor: Folie auf nassem Boden für 4–6 Wochen",
      "Resistente Genetik bevorzugen bei bekanntem Nematoden-Standort",
      "Fruchtfolge bei wiederholtem Outdoor-Anbau: Cannabis-Freie Rotation alle 2 Zyklen"
    ]
  },

  // === NEU: ERDFLÖHE (Outdoor) ===
  {
    id: "erdfloehe",
    name: "Erdflöhe (Hanferdfloh)",
    latinName: "Psylliodes attenuatus (Koch, 1803) / Phyllotreta spp.",
    category: "blattfresser",
    risk: "mittel",
    growArea: "outdoor",
    stage: "veg",
    images: ["/terpira/pests/flea-beetles.jpg"],
    sizeMm: "1,5–3,0 mm (metallisch-grün/blau/schwarz, kräftige Hinterbeine)",
    lifecycleDays: "30–45 Tage (Ei → Adult), 1–2 Generationen/Jahr",
    optimalConditions: "Warme, trockene Tage (> 20 °C), Outdoor-Direktkultur, lockerer Boden",
    actionThreshold: "≥ 20 % Blattfläche mit Lochfraß oder > 5 Käfer/Pflanze bei Jungpflanzen",
    short: "Kleine, springende Blattkäfer mit charakteristischem Lochfraß (‚Schrotschuss-Muster'). Psylliodes attenuatus ist wirtsspezifisch auf Hanf. Hauptschaden an Keimlingen und Jungpflanzen, etablierte Pflanzen tolerieren mäßigen Befall.",
    symptoms: [
      "Rundliche Löcher (1–3 mm) im ‚Schrotschuss-Muster' auf Blättern",
      "Skelettfraß an Keimblattern und ersten echten Blättern kann Totalausfall verursachen",
      "Käfer springen bei Annäherung sofort weg (diagnostisch)",
      "Larven im Boden können an Wurzeln fressen (sekundär)"
    ],
    monitoring: [
      "Visuelle Kontrolle junger Pflanzen, besonders ersten 4 Wochen nach Auspflanzung",
      "Leimtafeln auf Bodenhöhe (gelb/weiß) zum Populationsmonitoring",
      "Morgens oder bei Kühle prüfen (Käfer weniger sprungaktiv)"
    ],
    prevention: [
      "Direktsaat-Keimlinge mit Vlies oder Kulturschutznetz abdecken (< 0,8 mm Maschenweite)",
      "Jungpflanzen indoor vorziehen und erst als kräftige Pflanzen auspflanzen",
      "Mulch: Feuchter Bodenmulch reduziert Käfer-Aktivität"
    ],
    treatmentBio: [
      "Neem-basierte Spritzungen (Azadirachtin) als Fraßhemmer bei starkem Befall",
      "Spinosad als Bio-Spritzung zugelassen in vielen EU-Ländern für Käfer",
      "Nützlings-Nematoden (Steinernema carpocapsae) gegen Larven im Boden"
    ],
    treatmentIntegrated: [
      "Kulturschutznetze sind die effektivste Maßnahme (mechanische Barriere)",
      "Trockenstress vermeiden (gestresste Pflanzen werden stärker befallen)",
      "Fangpflanzen (Senf) am Feldrand können Käfer ablenken",
      "Kräftige Pflanzen tolerieren 20–30 % Fraß ohne signifikanten Ertragsverlust"
    ]
  },

  // === NEU: SCHNECKEN (Outdoor) ===
  {
    id: "schnecken",
    name: "Nacktschnecken",
    latinName: "Arion vulgaris / Deroceras reticulatum (Gastropoda)",
    category: "blattfresser",
    risk: "hoch",
    growArea: "outdoor",
    stage: "keimling",
    images: ["/terpira/pests/slugs.jpg"],
    sizeMm: "20–120 mm (artabhängig), Eier 2–3 mm (kugelrund, transparent)",
    lifecycleDays: "30–40 Tage (Ei → fressaktiv), bis 400 Eier/Tier/Jahr",
    optimalConditions: "Feucht, 10–20 °C, Nachtaktivität, Regenphasen",
    actionThreshold: "Jeder sichtbare Fraßschaden an Keimlingen → sofort handeln",
    short: "Nachtaktive Weichtiere mit massivem Fraßpotenzial, besonders an Keimlingen und Jungpflanzen. Können eine Jungpflanze in einer Nacht komplett vernichten. Schleimspuren als diagnostisches Merkmal.",
    symptoms: [
      "Große, unregelmäßige Fraßlöcher an Blatträndern und -flächen",
      "Keimlinge und junge Blätter über Nacht komplett abgefressen",
      "Silbrig-glänzende Schleimspuren auf Blättern, Substrat und Töpfen",
      "Kotkrümel (dunkel, kegelförmig) nahe Fraßstellen"
    ],
    monitoring: [
      "Abendliche/nächtliche Kontrolle mit Taschenlampe (Hauptaktivität 22–04 Uhr)",
      "Bierfallen: Becher bodenbündig eingraben (Monitoring, nicht Bekämpfung)",
      "Schleimspuren morgens auf Substrat und Pflanze prüfen"
    ],
    prevention: [
      "Schneckenzaun um Anbaufläche (Kupferband oder Spezialzaun)",
      "Substratoberfläche trocken halten, kein Mulch direkt am Stängel",
      "Umfeld aufräumen: Verstecke (Bretter, Steine, Laub) entfernen",
      "Pflanzen in erhöhte Gefäße oder auf Kupferfolie-Untersetzer stellen"
    ],
    treatmentBio: [
      "Eisen-III-Phosphat-Schneckenkorn (biologisch abbaubar, unbedenklich für Igel/Vögel)",
      "Nematoden Phasmarhabditis hermaphrodita als Gießmittel bei > 5 °C Bodentemp.",
      "Mechanisches Absammeln abends (konsequent, über 2–3 Wochen)"
    ],
    treatmentIntegrated: [
      "Kupferband um Töpfe/Hochbeete (Kupfer = Kontaktbarriere für Schnecken)",
      "Förderung natürlicher Fressfeinde: Igel, Laufkäfer, Blindschleichen, Enten",
      "Kombination aus Barrieren + Schneckenkorn + Absammeln für optimale Wirkung",
      "Kein Metaldehyd verwenden (giftig für Haustiere und Nützlinge)"
    ]
  },

  // === NEU: GALLMÜCKEN ===
  {
    id: "gallmuecken",
    name: "Gallmücken (Blattgallmücke)",
    latinName: "Contarinia spp. / Dasineura spp. (Cecidomyiidae)",
    category: "blattfresser",
    risk: "mittel",
    growArea: "outdoor",
    stage: "veg",
    images: ["/terpira/pests/gall-midges.jpg"],
    sizeMm: "Adulte 1–3 mm (zierliche Mücken), Larven 2–3 mm (orange-rot)",
    lifecycleDays: "14–21 Tage je Generation",
    optimalConditions: "Feuchte Bedingungen, Temperatur 15–25 °C, dichter Bestand",
    actionThreshold: "≥ 5 % der Blätter/Triebe mit Gallenbildung",
    short: "Winzige Mücken, deren Larven in Pflanzenge webe Gallen (knotenartige Wucherungen) induzieren. Beeinträchtigen Photosynthese und Nährstofftransport lokal. In Cannabis eher selten, aber zunehmend bei Outdoor-Kulturen.",
    symptoms: [
      "Kleine, knotenartige Wucherungen (Gallen) an Blättern, Stielen oder Triebspitzen",
      "Verdrehte oder eingerollte Blattbereiche mit orangenen Larven im Inneren",
      "Lokale Wachstumsdepression, verkrüppelte Triebspitzen"
    ],
    monitoring: [
      "Blätter und Triebe auf ungewöhnliche Verdickungen/Verformungen prüfen",
      "Gallen vorsichtig öffnen → orange/rote Larven bestätigen Gallmücken",
      "Gelbtafeln gegen adulte Mücken"
    ],
    prevention: [
      "Gute Belüftung des Bestands",
      "Befallene Pflanzenteile frühzeitig entfernen und entsorgen",
      "Unkrautmanagement am Feldrand (Alternativwirte reduzieren)"
    ],
    treatmentBio: [
      "Befallene Triebe/Blätter abschneiden und vernichten (Larven in Gallen)",
      "Nützlinge: Diverse Gallmücken-Parasitoide (Platygaster, Torymus spp.)",
      "Neem-basierte Mittel gegen adulte Mücken zur Eiablage-Hemmung"
    ],
    treatmentIntegrated: [
      "Mechanische Entfernung befallener Pflanzenteile ist effektivste Maßnahme",
      "Bei schwerem Befall: Bestand ausdünnen für bessere Luftzirkulation",
      "Nachkontrolle 2–3 Wochen nach Entfernung auf Neubefall"
    ]
  }
];

const beneficialMatrix: BeneficialRow[] = [
  {
    pest: "Spinnmilben",
    beneficial: "Phytoseiulus persimilis",
    targetStage: "Eier + mobile Stadien",
    deploymentWindow: "Frühphase bis mittlerer Befall",
    notes: "Bei hoher Luftfeuchte und engmaschigem Monitoring besonders wirksam."
  },
  {
    pest: "Thripse",
    beneficial: "Amblyseius swirskii / cucumeris",
    targetStage: "Larven",
    deploymentWindow: "Präventiv und bei ersten Symptomen",
    notes: "Kombinierbar mit Nematoden gegen Substratstadien."
  },
  {
    pest: "Weiße Fliegen",
    beneficial: "Encarsia formosa",
    targetStage: "Larven/Puppen",
    deploymentWindow: "Stabiler Indoor-Zyklus",
    notes: "Regelmäßige Ausbringung über mehrere Wochen erforderlich."
  },
  {
    pest: "Blattläuse",
    beneficial: "Florfliegenlarven / Marienkäfer",
    targetStage: "Kolonien an Trieben",
    deploymentWindow: "Früh bis mittel",
    notes: "Mechanisches Entfernen stark befallener Triebe beschleunigt Wirkung."
  },
  {
    pest: "Trauermücken",
    beneficial: "Steinernema feltiae",
    targetStage: "Larven im Substrat",
    deploymentWindow: "Bei steigender Fliegerzahl",
    notes: "Mit angepasstes Gießregime kombinieren, sonst Reinfektion."
  },
  {
    pest: "Minierfliegen",
    beneficial: "Diglyphus isaea",
    targetStage: "Larven in Blattminen",
    deploymentWindow: "Früher Befall",
    notes: "Befallene Blätter parallel entfernen und dokumentieren."
  },
  {
    pest: "Breitmilben",
    beneficial: "Amblyseius andersoni / A. californicus",
    targetStage: "Alle mobilen Stadien",
    deploymentWindow: "Präventiv ab Veg-Phase und bei Verdacht",
    notes: "Breitmilben sind < 0,2 mm – visuelle Kontrolle unter Mikroskop nötig."
  },
  {
    pest: "Rostmilben",
    beneficial: "Amblyseius andersoni (Dauerbesatz)",
    targetStage: "Adulte + Nymphen",
    deploymentWindow: "Präventiv, dauerhaft in Risikokulturen",
    notes: "Schwefel-basierte Mittel in Veg ergänzen. Rostmilben wandern aufwärts."
  },
  {
    pest: "Wurzelläuse",
    beneficial: "Steinernema feltiae + Beauveria bassiana",
    targetStage: "Larven/Nymphen im Substrat",
    deploymentWindow: "Bei erstem Nachweis, Substratapplikation",
    notes: "Isolierung befallener Pflanzen essenziell. Schwer kontrollierbar, Prävention vorrangig."
  },
  {
    pest: "Raupen / Hanfzünsler",
    beneficial: "Trichogramma spp. (Ei-Parasitoide)",
    targetStage: "Eier (vor Larvenentwicklung)",
    deploymentWindow: "Präventiv in Blütephase bei Falterdruck",
    notes: "Kombinieren mit BT-Spritzung für maximale Wirkung."
  },
  {
    pest: "Schnecken",
    beneficial: "Phasmarhabditis hermaphrodita (Nematoden)",
    targetStage: "Jungschnecken im Boden",
    deploymentWindow: "Ab 5 °C Bodentemperatur, feucht ausbringen",
    notes: "Eisen-III-Phosphat-Schneckenkorn als Ergänzung."
  },
  {
    pest: "Erdflöhe",
    beneficial: "Steinernema carpocapsae (Nematoden)",
    targetStage: "Larven im Boden",
    deploymentWindow: "Vor/während Hauptflugzeit",
    notes: "Kulturschutznetze zusätzlich als mechanische Barriere."
  }
];

const first24hChecklist = [
  {
    level: "Rot",
    title: "Sofort isolieren",
    points: [
      "Befallene Zonen und Werkzeuge trennen",
      "Stark befallene Pflanzenteile entfernen",
                      "Befallsschwerpunkte markieren und die Fotodokumentation starten"
    ]
  },
  {
    level: "Gelb",
    title: "Befallsdruck messen",
    points: [
      "Lupe/Leimtafeln einsetzen und Befallsklasse definieren",
      "Klimadaten (Temp/RLF) gegen Sollwerte prüfen",
      "Eintragsquelle (Material, Kleidung, Zuluft) identifizieren"
    ]
  },
  {
    level: "Grün",
    title: "IPM-Plan starten",
    points: [
      "Nützlings- oder Maßnahmen-Programm je Schädling auswählen",
      "Intervalltermine für 7, 14 und 21 Tage setzen",
      "Erfolgskriterien vorab definieren"
    ]
  }
];

const externalSources: ExternalSource[] = [
  {
    title: "Integrated pest management - Wikipedia",
    url: "https://en.wikipedia.org/wiki/Integrated_pest_management",
    kind: "Grundlagen"
  },
  {
    title: "Integrated Pest Management (IPM) Principles | US EPA",
    url: "https://www.epa.gov/safepestcontrol/integrated-pest-management-ipm-principles",
    kind: "Behörden-Leitfaden"
  },
  {
    title: "Tetranychus urticae - Wikipedia",
    url: "https://en.wikipedia.org/wiki/Tetranychus_urticae",
    kind: "Artprofil"
  },
  {
    title: "Western flower thrips - Wikipedia",
    url: "https://en.wikipedia.org/wiki/Frankliniella_occidentalis",
    kind: "Artprofil"
  },
  {
    title: "Broad mite (Polyphagotarsonemus latus) - Wikipedia",
    url: "https://en.wikipedia.org/wiki/Polyphagotarsonemus_latus",
    kind: "Artprofil"
  },
  {
    title: "Hemp russet mite (Aculops cannabicola) - CABI",
    url: "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.109039",
    kind: "Artprofil"
  },
  {
    title: "Root-knot nematode (Meloidogyne) - Wikipedia",
    url: "https://en.wikipedia.org/wiki/Meloidogyne",
    kind: "Artprofil"
  },
  {
    title: "Cannabis pest management review – McPartland (2018)",
    url: "https://doi.org/10.1079/9781786394835.0000",
    kind: "Fachbuch"
  },
  {
    title: "IPM for Cannabis – Oregon State University Extension",
    url: "https://extension.oregonstate.edu/crop-production/cannabis",
    kind: "Behörden-Leitfaden"
  }
];

const protocolDownloads = [
  {
    title: "IPM-Protokoll: Saugende Schädlinge",
    href: "/terpira/pests/protocols/ipm-saugende-schaedlinge.txt"
  },
  {
    title: "IPM-Protokoll: Substrat- und Wurzel-Schädlinge",
    href: "/terpira/pests/protocols/ipm-substrat-wurzel.txt"
  },
  {
    title: "IPM-Protokoll: Blatt- und Blütenfresser",
    href: "/terpira/pests/protocols/ipm-blatt-bluetenfresser.txt"
  }
];

const symptomOptions: SymptomOption[] = [
  {
    id: "silbrige-flecken",
    label: "Silbrige Flecken/Schabspuren",
    keywords: ["silbrig", "schab", "fraßgänge", "aufhellungen"]
  },
  {
    id: "gespinste",
    label: "Feine Gespinste sichtbar",
    keywords: ["gespinste"]
  },
  {
    id: "schwarze-punkte",
    label: "Schwarze Punkte/Kot",
    keywords: ["kotpunkte", "kotkrümel", "schwarze"]
  },
  {
    id: "flieger",
    label: "Kleine Flieger beim Bewegen",
    keywords: ["flieger", "flug", "gelbtafeln"]
  },
  {
    id: "wurzelprobleme",
    label: "Wurzel-/Substratprobleme",
    keywords: ["wurzel", "substrat", "staunässe", "wurzelballen"]
  },
  {
    id: "frassloecher",
    label: "Fraßlöcher / Blattverlust",
    keywords: ["fraßlöcher", "fraß", "blatt"]
  },
  {
    id: "honigtau",
    label: "Klebriger Honigtau",
    keywords: ["honigtau", "klebrig"]
  },
  {
    id: "verkrueppelt",
    label: "Verkrüppelte / verdrehte Triebspitzen",
    keywords: ["verkrüppel", "triebspitzen", "verdreht", "epinastie", "glasig"]
  },
  {
    id: "bronze",
    label: "Bronzefärbung / glänzende Blätter",
    keywords: ["bronze", "glänz", "ölig", "rostmilb", "trichom"]
  },
  {
    id: "gallen",
    label: "Gallen / Knoten an Wurzeln oder Blättern",
    keywords: ["gallen", "knoten", "verdickung", "wucherung", "nematod"]
  },
  {
    id: "schleimspuren",
    label: "Schleimspuren / Nachtfraß",
    keywords: ["schleim", "schneck", "nachtfraß", "nacht"]
  },
  {
    id: "lochfrass",
    label: "Schrotschuss-Lochfraß",
    keywords: ["loch", "schrotschuss", "erdfloh", "rund"]
  }
];

export default function PestLexiconPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PestCategory | "alle">("alle");
  const [activeRisk, setActiveRisk] = useState<RiskLevel | "alle">("alle");
  const [activeArea, setActiveArea] = useState<GrowArea | "alle">("alle");
  const [activeStage, setActiveStage] = useState<PlantStage | "alle">("alle");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<{ title: string; images: string[]; index: number } | null>(null);
  // Lags one step behind `lightbox`: keeps the last-open payload around while
  // `lightbox` is null so the dialog can stay mounted and play its exit
  // transition instead of the image vanishing instantly on close. Adjusted
  // during render (React's documented pattern for deriving state from a prop/
  // state change) rather than in a useEffect, which would fire the
  // set-state-in-effect rule for a synchronous setState.
  const [prevLightbox, setPrevLightbox] = useState(lightbox);
  const [displayLightbox, setDisplayLightbox] = useState<{ title: string; images: string[]; index: number } | null>(null);
  if (lightbox !== prevLightbox) {
    setPrevLightbox(lightbox);
    if (lightbox) setDisplayLightbox(lightbox);
  }
  const lightboxOpen = lightbox !== null;

  const openLightbox = (title: string, images: string[], index: number) => {
    setLightbox({ title, images, index });
  };

  const moveLightbox = (direction: -1 | 1) => {
    setLightbox((prev) => {
      if (!prev) return prev;
      const length = prev.images.length;
      const nextIndex = (prev.index + direction + length) % length;
      return { ...prev, index: nextIndex };
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pestLexicon.filter((entry) => {
      if (activeCategory !== "alle" && entry.category !== activeCategory) return false;
      if (activeRisk !== "alle" && entry.risk !== activeRisk) return false;
      if (activeArea !== "alle" && entry.growArea !== activeArea) return false;
      if (activeStage !== "alle" && entry.stage !== activeStage) return false;
      if (!q) return true;
      const hay = `${entry.name} ${entry.latinName} ${entry.short} ${entry.symptoms.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, activeCategory, activeRisk, activeArea, activeStage]);

  const countsByCategory = useMemo(() => {
    const map: Record<PestCategory, number> = {
      saugend: 0,
      blattfresser: 0,
      substrat: 0,
      wurzel: 0
    };
    for (const item of pestLexicon) {
      map[item.category] += 1;
    }
    return map;
  }, []);

  const quickDiagnosis = useMemo(() => {
    if (selectedSymptoms.length === 0) return [] as Array<{ pest: PestEntry; score: number }>;

    const chosen = symptomOptions.filter((option) => selectedSymptoms.includes(option.id));
    const riskWeight: Record<RiskLevel, number> = { niedrig: 0, mittel: 1, hoch: 2, kritisch: 3 };

    const matches = pestLexicon
      .map((pest) => {
        const text = `${pest.short} ${pest.symptoms.join(" ")} ${pest.monitoring.join(" ")}`.toLowerCase();
        let score = 0;
        for (const option of chosen) {
          if (option.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
            score += 3;
          }
        }
        score += riskWeight[pest.risk];
        return { pest, score };
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return matches;
  }, [selectedSymptoms]);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]
    );
  };

  const lightboxCurrentSrc = displayLightbox ? displayLightbox.images[displayLightbox.index] ?? displayLightbox.images[0] ?? null : null;

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <Link href={"/studies" as Route} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800">
          ← Zurück zu Studien
        </Link>

        <div className="mt-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Register</p>
          <h1 className="mt-1 text-4xl font-bold text-foreground">Schädlings-Lexikon Cannabis</h1>
          <p className="mt-2 max-w-3xl text-sm text-foreground/80">
            Kompakter Überblick über häufige Schädlinge an Cannabispflanzen, mit Symptomen, Monitoring,
            Prävention und integrierten Gegenmaßnahmen. Sortiert nach Schädlingsart, Risiko und Anbauumgebung.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-emerald-200 dark:border-emerald-900/40 bg-card px-3 py-1 font-semibold text-emerald-800 dark:text-emerald-400">{pestLexicon.length} Einträge</span>
            <span className="rounded-full border border-cyan-200 dark:border-cyan-900/40 bg-card px-3 py-1 font-semibold text-cyan-800 dark:text-cyan-400">Mit Bildmaterial</span>
            <span className="rounded-full border border-border bg-card px-3 py-1 font-semibold text-foreground/80">Filterbar</span>
          </div>
          <p className="mt-3 text-xs text-foreground/80">
            Bildmaterial aus frei lizenzierten Referenzfotos (Wikimedia Commons), je Eintrag eindeutig zugeordnet.
            Bildnachweise:
            <a href="/terpira/pests/ATTRIBUTION.md" target="_blank" rel="noreferrer" className="ml-1 font-semibold text-emerald-700 dark:text-emerald-400 underline">
              Attribution ansehen
            </a>
          </p>
        </div>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">Schnellzugriff</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="#filter" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">Filter</a>
            <a href="#lexikon" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">Lexikon</a>
            <a href="#Nützlinge" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">Nützlings-Matrix</a>
            <a href="#ampel" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">24h-Ampel</a>
            <a href="#downloads" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">Downloads</a>
            <a href="#quellen" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">Quellen</a>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <article className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 p-4">
              <p className="text-sm font-bold text-emerald-900">Modus 1: Schnellhilfe</p>
              <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-400">Bei akutem Befall direkt mit 24h-Ampel und Protokollen starten.</p>
              <div className="mt-2 flex gap-2 text-xs">
                <a href="#ampel" className="rounded-full border border-emerald-300 bg-card px-2.5 py-1 font-semibold text-emerald-700 dark:text-emerald-400">Zur Ampel</a>
                <a href="#downloads" className="rounded-full border border-emerald-300 bg-card px-2.5 py-1 font-semibold text-emerald-700 dark:text-emerald-400">Zu Protokollen</a>
              </div>
            </article>
            <article className="rounded-xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50 dark:bg-cyan-950/30 p-4">
              <p className="text-sm font-bold text-cyan-900">Modus 2: Analyse</p>
              <p className="mt-1 text-xs text-cyan-800 dark:text-cyan-400">Symptome filtern und Arten sauber eingrenzen.</p>
              <div className="mt-2 flex gap-2 text-xs">
                <a href="#filter" className="rounded-full border border-cyan-300 bg-card px-2.5 py-1 font-semibold text-cyan-700 dark:text-cyan-400">Zu Filtern</a>
                <a href="#lexikon" className="rounded-full border border-cyan-300 bg-card px-2.5 py-1 font-semibold text-cyan-700 dark:text-cyan-400">Zu Einträgen</a>
              </div>
            </article>
            <article className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 p-4">
              <p className="text-sm font-bold text-amber-900">Modus 3: Prävention</p>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-400">Nützlingsstrategie und Referenzen für belastbare Standardabläufe nutzen.</p>
              <div className="mt-2 flex gap-2 text-xs">
                <a href="#Nützlinge" className="rounded-full border border-amber-300 bg-card px-2.5 py-1 font-semibold text-amber-700 dark:text-amber-400">Zur Matrix</a>
                <a href="#quellen" className="rounded-full border border-amber-300 bg-card px-2.5 py-1 font-semibold text-amber-700 dark:text-amber-400">Zu Quellen</a>
              </div>
            </article>
          </div>
        </section>

        <section id="filter" className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm scroll-mt-24">
          <div className="grid gap-3 md:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Schädlingsname, Symptom oder Lateinname suchen..."
              className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground/80 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <Dropdown value={activeCategory} onChange={(v) => setActiveCategory(v as PestCategory | "alle")}>
              <DropdownOption value="alle">Alle Arten</DropdownOption>
              <DropdownOption value="saugend">Saugende</DropdownOption>
              <DropdownOption value="blattfresser">Blatt-/Blütenfresser</DropdownOption>
              <DropdownOption value="substrat">Substrat</DropdownOption>
              <DropdownOption value="wurzel">Wurzel</DropdownOption>
            </Dropdown>
            <Dropdown value={activeRisk} onChange={(v) => setActiveRisk(v as RiskLevel | "alle")}>
              <DropdownOption value="alle">Alle Risiken</DropdownOption>
              <DropdownOption value="niedrig">Niedrig</DropdownOption>
              <DropdownOption value="mittel">Mittel</DropdownOption>
              <DropdownOption value="hoch">Hoch</DropdownOption>
              <DropdownOption value="kritisch">Kritisch</DropdownOption>
            </Dropdown>
            <Dropdown value={activeArea} onChange={(v) => setActiveArea(v as GrowArea | "alle")}>
              <DropdownOption value="alle">Alle Umgebungen</DropdownOption>
              <DropdownOption value="indoor">Indoor</DropdownOption>
              <DropdownOption value="outdoor">Outdoor</DropdownOption>
              <DropdownOption value="beides">Indoor + Outdoor</DropdownOption>
            </Dropdown>
            <Dropdown value={activeStage} onChange={(v) => setActiveStage(v as PlantStage | "alle")}>
              <DropdownOption value="alle">Alle Phasen</DropdownOption>
              <DropdownOption value="keimling">Keimling</DropdownOption>
              <DropdownOption value="veg">Veg</DropdownOption>
              <DropdownOption value="bluete">Blüte</DropdownOption>
            </Dropdown>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(countsByCategory).map(([key, count]) => {
              const typedKey = key as PestCategory;
              const active = activeCategory === typedKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(active ? "alle" : typedKey)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-[border-color,background-color,color,transform] duration-150 active:scale-[0.97] ${active ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "border-border bg-background text-foreground/80"}`}
                >
                  {categoryLabel[typedKey]} ({count})
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-foreground/80">
            <span className="font-semibold text-foreground">{filtered.length}</span> Treffer im Schädlings-Lexikon
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50/50 dark:bg-cyan-950/50 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-400">Schnelldiagnose</p>
              <h2 className="text-xl font-bold text-foreground">Symptom-Check in 30 Sekunden</h2>
              <p className="mt-1 text-sm text-foreground/80">Symptome markieren und die wahrscheinlichsten Schädlinge priorisiert anzeigen lassen.</p>
            </div>
            {selectedSymptoms.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedSymptoms([])}
                className="rounded-lg border border-cyan-300 bg-card px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400 transition-[background-color,transform] duration-150 hover:bg-cyan-100 dark:bg-cyan-950/40 active:scale-[0.97]"
              >
                Auswahl zurücksetzen
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {symptomOptions.map((option) => {
              const active = selectedSymptoms.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleSymptom(option.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-[border-color,background-color,color,transform] duration-150 active:scale-[0.97] ${
                    active
                      ? "border-cyan-300 bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-400"
                      : "border-border bg-card text-foreground/80 hover:border-cyan-300"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {quickDiagnosis.length > 0 ? (
              quickDiagnosis.map(({ pest, score }) => (
                <article key={`diag-${pest.id}`} className="rounded-xl border border-cyan-200 dark:border-cyan-900/40 bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-foreground">{pest.name}</p>
                    <span className="rounded-full border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50 dark:bg-cyan-950/30 px-2 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                      Treffer {score}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-fg">{pest.latinName}</p>
                  <p className="mt-2 text-sm text-foreground/80">{pest.short}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${riskClass[pest.risk]}`}>
                      {riskLabel[pest.risk]}
                    </span>
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-semibold text-foreground/80">
                      {categoryLabel[pest.category]}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-foreground/80">Keine Diagnose aktiv. Wähle mindestens ein Symptom aus.</p>
            )}
          </div>
        </section>

        <section id="lexikon" className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3 scroll-mt-24">
          {filtered.map((entry) => (
            <article key={entry.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="grid h-48 grid-cols-3 gap-1 bg-background p-1">
                {entry.images.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => openLightbox(entry.name, entry.images, index)}
                    className="group relative overflow-hidden rounded-md transition-transform duration-150 active:scale-[0.97]"
                  >
                    <Image
                      src={src}
                      alt={`${entry.name} Foto ${index + 1}`}
                      width={320}
                      height={210}
                      className="h-full w-full object-cover transition-transform duration-200 [@media(hover:hover)]:group-hover:scale-[1.04]"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/45 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                      Vergrößern
                    </span>
                  </button>
                ))}
              </div>
              <div className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-semibold text-foreground/80">{categoryLabel[entry.category]}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${riskClass[entry.risk]}`}>{riskLabel[entry.risk]}</span>
                  <span className="rounded-full border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50 dark:bg-cyan-950/30 px-2 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400">{entry.images.length} Fotos</span>
                </div>
                <h2 className="text-xl font-bold text-foreground">{entry.name}</h2>
                <p className="text-xs italic text-muted-fg">{entry.latinName}</p>
                <p className="mt-2 text-sm text-foreground/80">{entry.short}</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <p className="rounded-lg border border-border bg-background px-2 py-1 font-semibold text-foreground/80">Umgebung: {areaLabel[entry.growArea]}</p>
                  <p className="rounded-lg border border-border bg-background px-2 py-1 font-semibold text-foreground/80">Phase: {stageLabel[entry.stage]}</p>
                </div>

                {/* Professioneller Steckbrief */}
                {(entry.sizeMm ?? entry.lifecycleDays ?? entry.optimalConditions ?? entry.actionThreshold) && (
                  <div className="mt-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/50 p-3 text-xs text-foreground/80 space-y-1">
                    {entry.sizeMm && <p><span className="font-semibold text-foreground">Größe:</span> {entry.sizeMm}</p>}
                    {entry.lifecycleDays && <p><span className="font-semibold text-foreground">Lebenszyklus:</span> {entry.lifecycleDays}</p>}
                    {entry.optimalConditions && <p><span className="font-semibold text-foreground">Optimalbedingungen:</span> {entry.optimalConditions}</p>}
                    {entry.actionThreshold && <p><span className="font-semibold text-foreground">Schadensschwelle:</span> {entry.actionThreshold}</p>}
                  </div>
                )}

                <details className="mt-3 rounded-xl border border-border bg-background p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground">Vollprofil öffnen</summary>
                  <div className="mt-3 space-y-3 text-sm text-foreground/80">
                    <div>
                      <p className="font-semibold text-foreground">Symptome</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {entry.symptoms.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Monitoring</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {entry.monitoring.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Prävention</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {entry.prevention.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Biologische Maßnahmen</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {entry.treatmentBio.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Integrierte Strategie</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {entry.treatmentIntegrated.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <article id="Nützlinge" className="rounded-2xl border border-border bg-card p-5 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground">Nützlinge pro Schädling</h2>
            <p className="mt-1 text-sm text-foreground/80">Schnellmatrix für Auswahl und Ausbringungszeitpunkt.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-background text-foreground/80">
                  <tr>
                    <th className="px-3 py-2 text-left">Schädling</th>
                    <th className="px-3 py-2 text-left">Nützling</th>
                    <th className="px-3 py-2 text-left">Zielstadium</th>
                    <th className="px-3 py-2 text-left">Einsatzfenster</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficialMatrix.map((row) => (
                    <tr key={`${row.pest}-${row.beneficial}`} className="border-t border-border">
                      <td className="px-3 py-2 font-semibold text-foreground">{row.pest}</td>
                      <td className="px-3 py-2 text-foreground/80">{row.beneficial}</td>
                      <td className="px-3 py-2 text-foreground/80">{row.targetStage}</td>
                      <td className="px-3 py-2 text-foreground/80">{row.deploymentWindow}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article id="ampel" className="rounded-2xl border border-border bg-card p-5 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground">24h-Ampel: Sofortmaßnahmen</h2>
            <p className="mt-1 text-sm text-foreground/80">Was in den ersten 24 Stunden nach Befallsfund passieren sollte.</p>
            <div className="mt-3 space-y-3">
              {first24hChecklist.map((item) => (
                <section key={item.level} className="rounded-xl border border-border bg-background p-3">
                  <p className="text-sm font-bold text-foreground">{item.level}: {item.title}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-foreground/80">
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </article>
        </section>

        {/* ── Weiterführende Wiki-Artikel ─────────────────────── */}
        <section id="wiki-artikel" className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm scroll-mt-24">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">Vertiefung · Hintergrundartikel</p>
          <h2 className="mt-1 text-xl font-bold text-foreground">Weiterführende Fachartikel</h2>
          <p className="mt-1 max-w-2xl text-sm text-foreground/80">
            Hintergrundartikel zu Prävention, Hygiene und Umweltfaktoren im professionellen Schädlingsmanagement.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {([
              { slug: "integrierte-schaedlingspraevention-grow", title: "Integrierte Schädlingsprävention im Grow", tag: "IPM · Prävention", tagColor: "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400", desc: "Systematischer Ansatz zur Vorbeugung statt Bekämpfung – Monitoring, Schwellenwerte und Nützlingseinsatz." },
              { slug: "mutterpflanzen-und-clone-hygiene", title: "Mutterpflanzen und Clone-Hygiene", tag: "Hygiene · Klone", tagColor: "border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400", desc: "Wie Schädlinge und Pathogene über Klone eingeschleppt werden – und wie konsequente Hygiene das verhindert." },
              { slug: "schimmel-und-mykotoxine-bei-cannabis", title: "Schimmel und Mykotoxine bei Cannabis", tag: "Schimmel · Sicherheit", tagColor: "border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400", desc: "Botrytis, Aspergillus und Co.: Erkennungsmerkmale, Risikofaktoren und Maßnahmen bei Pilzbefall." },
              { slug: "cannabis-substrat-und-wurzelzone", title: "Substrat und Wurzelzone", tag: "Substrat · Wurzel", tagColor: "border-sky-200 dark:border-sky-900/40 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400", desc: "Wie Substratfeuchte und Wurzelgesundheit Schädlingsdruck und Pathogenbefall direkt beeinflussen." },
            ] as { slug: string; title: string; tag: string; tagColor: string; desc: string }[]).map((link) => (
              <Link
                key={link.slug}
                href={`/studies/${link.slug}` as Route}
                className="group flex flex-col gap-1.5 rounded-xl border border-border bg-background p-4 transition hover:border-emerald-300 hover:bg-emerald-50 dark:bg-emerald-950/30"
              >
                <span className={`self-start rounded-full border px-2 py-0.5 text-[10px] font-semibold ${link.tagColor}`}>
                  {link.tag}
                </span>
                <p className="text-sm font-bold text-foreground group-hover:text-emerald-800 dark:text-emerald-400 leading-snug">{link.title}</p>
                <p className="text-xs text-foreground/80 leading-relaxed">{link.desc}</p>
                <span className="mt-auto text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">Artikel lesen →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <article id="quellen" className="rounded-2xl border border-border bg-card p-5 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground">Externe Internetquellen</h2>
            <p className="mt-1 text-sm text-foreground/80">Direkte Referenzen für vertiefende IPM- und Artenrecherche.</p>
            <div className="mt-3 space-y-2">
              {externalSources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-border bg-background px-3 py-2 hover:border-emerald-300 hover:bg-emerald-50 dark:bg-emerald-950/30"
                >
                  <p className="text-sm font-semibold text-foreground">{source.title}</p>
                  <p className="text-xs text-muted-fg">Typ: {source.kind}</p>
                </a>
              ))}
            </div>
          </article>

          <article id="downloads" className="rounded-2xl border border-border bg-card p-5 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground">IPM-Protokolle herunterladen</h2>
            <p className="mt-1 text-sm text-foreground/80">Sofort einsetzbare Text-Protokolle für Teams und Grow-Räume.</p>
            <div className="mt-3 space-y-2">
              {protocolDownloads.map((file) => (
                <a
                  key={file.href}
                  href={file.href}
                  download
                  className="block rounded-lg border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50 dark:bg-cyan-950/30 px-3 py-2 hover:border-cyan-300 hover:bg-cyan-100"
                >
                  <p className="text-sm font-semibold text-cyan-900">{file.title}</p>
                  <p className="text-xs text-cyan-700 dark:text-cyan-400">TXT-Download</p>
                </a>
              ))}
            </div>
          </article>
        </section>

        {filtered.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-background p-8 text-center text-sm text-foreground/80">
            Keine Schädlings-Einträge mit den aktuellen Filtern gefunden. Passe Suche oder Filter an.
          </div>
        )}

        {/* Always mounted + class-toggled instead of `{lightbox && (...)}` so the
            image lightbox can play an entrance/exit transition (previously it had
            none — the dialog just popped in/out instantly). `displayLightbox`
            lags one render behind `lightbox` so the last-open photo stays on
            screen while the exit transition fades/scales it out. A modal-surface
            treatment isn't right here — this should show the image, not an
            opaque card — so only the backdrop dims and the panel itself
            fades/scales, centered by default. */}
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity duration-300 ${
            lightboxOpen ? "opacity-100" : "pointer-events-none invisible opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-hidden={!lightboxOpen}
          onClick={() => setLightbox(null)}
        >
          <div
            className={`w-full max-w-5xl transition-[opacity,transform] duration-300 ${
              lightboxOpen ? "scale-100 opacity-100" : "scale-96 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">
                {displayLightbox?.title} - Foto {(displayLightbox?.index ?? 0) + 1} / {displayLightbox?.images.length ?? 0}
              </p>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="rounded-lg border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-white/20 active:scale-[0.97]"
              >
                Schließen
              </button>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-white/20 bg-black">
              {lightboxCurrentSrc && (
                <Image
                  src={lightboxCurrentSrc}
                  alt={`${displayLightbox?.title ?? ""} Foto ${(displayLightbox?.index ?? 0) + 1}`}
                  width={1800}
                  height={1200}
                  className="h-auto max-h-[80vh] w-full object-contain"
                />
              )}
              {displayLightbox && displayLightbox.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => moveLightbox(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/45 px-3 py-2 text-sm font-bold text-white transition-[background-color,transform] duration-150 hover:bg-black/60 active:scale-90"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLightbox(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/45 px-3 py-2 text-sm font-bold text-white transition-[background-color,transform] duration-150 hover:bg-black/60 active:scale-90"
                  >
                    →
                  </button>
                </>
              )}
            </div>
            {displayLightbox && displayLightbox.images.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {displayLightbox.images.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => setLightbox((prev) => (prev ? { ...prev, index: idx } : prev))}
                    className={`overflow-hidden rounded-md border transition-[border-color,transform] duration-150 active:scale-[0.97] ${idx === displayLightbox.index ? "border-cyan-300" : "border-white/30"}`}
                  >
                    <Image src={src} alt={`${displayLightbox.title} Vorschau ${idx + 1}`} width={100} height={70} className="h-14 w-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
