"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { areaLabel, riskClass, riskLabel, stageLabel, type GrowArea, type PlantStage, type RiskLevel } from "@/lib/terpira/lexicon";

type DefCategory = "makro" | "sekundaer" | "mikro" | "stress";
type Mobility = "mobil" | "immobil" | "gemischt";

type DeficiencyEntry = {
  id: string;
  name: string;
  short: string;
  category: DefCategory;
  risk: RiskLevel;
  mobility: Mobility;
  growArea: GrowArea;
  stage: PlantStage;
  symptoms: string[];
  causes: string[];
  monitoring: string[];
  correction: string[];
  prevention: string[];
};

type SymptomOption = {
  id: string;
  label: string;
  keywords: string[];
};

type CorrectionRow = {
  deficiency: string;
  firstStep: string;
  followUp: string;
  window: string;
  notes: string;
};

type ExternalSource = {
  title: string;
  url: string;
  kind: string;
};

// ── Wiki-Links für Studienbasis ──────────────────────────────────
const wikiLinks: { slug: string; title: string; tag: string; tagColor: string; desc: string }[] = [
  {
    slug: "naehrstoffbedarf-cannabis-lebenszyklus",
    title: "Nährstoffbedarf im Cannabis-Lebenszyklus",
    tag: "Nährstoffe · NPK",
    tagColor: "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    desc: "Phasenweise NPK-, Ca- und Mg-Übersicht für Photo- und Autoflower-Pflanzen in Erde und Coco – basierend auf peer-reviewten Studien.",
  },
  {
    slug: "substrat-vergleich-coco-erde-hydro",
    title: "Substratvergleich: Coco, Erde und Hydro",
    tag: "Substrat · EC · pH",
    tagColor: "border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    desc: "Was Studien über Ertrag, EC-Toleranz und Pflegeaufwand bei den drei Hauptsubstraten sagen – mit praktischen Empfehlungen.",
  },
  {
    slug: "indoor-outdoor-anbau-vergleich",
    title: "Indoor vs. Outdoor: Anbauvergleich Cannabis",
    tag: "Licht · Ertrag · Terpene",
    tagColor: "border-sky-200 dark:border-sky-900/40 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400",
    desc: "Licht, Ertrag, Terpenprofil und Risikofaktoren im direkten Vergleich – was Forschung und Praxis über beide Anbausysteme sagen.",
  },
  {
    slug: "naehrstoffblockaden-und-antagonismen",
    title: "Nährstoffblockaden und Antagonismen",
    tag: "Diagnostik · pH",
    tagColor: "border-violet-200 dark:border-violet-900/40 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400",
    desc: "Warum trotz ausreichender Düngewerte Mangelbilder auftreten können – und wie Blockaden sauber eingeordnet werden.",
  },
  {
    slug: "cannabis-substrat-und-wurzelzone",
    title: "Substrat und Wurzelzone",
    tag: "Substrat · Wurzel",
    tagColor: "border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    desc: "Alles über Pufferwirkung, Wasserhaltekapazität und Wurzelgesundheit – Grundlage für optimale Nährstoffverfügbarkeit.",
  },
  {
    slug: "feminisiert-vs-regular-vs-autoflower",
    title: "Feminisiert, Regular und Autoflower im Vergleich",
    tag: "Genetik · Sortenwahl",
    tagColor: "border-cyan-200 dark:border-cyan-900/40 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400",
    desc: "Wie sich Wachstumsphasen, Nährstoffbedarf und Reaktion auf Stressfaktoren je Saatguttyp unterscheiden.",
  },
];
const lifecycleHubCards = [
  {
    title: "Lebenszyklus und NPK-Bedarf",
    slug: "naehrstoffbedarf-cannabis-lebenszyklus",
    points: [
      "Photoperiodische und autoflowering Sorten getrennt erklärt",
      "Phasenweise Orientierung für N, P, K, Ca und Mg",
      "Mit Studienbasis statt pauschaler Düngeschemata"
    ]
  },
  {
    title: "Substrat und Wurzelraum-Kontext",
    slug: "substrat-vergleich-coco-erde-hydro",
    points: [
      "Erde, Coco und Hydro sauber gegeneinander abgegrenzt",
      "EC-, pH- und Pufferlogik im Vergleich",
      "Hilft bei der Einordnung von Mangel vs. Kulturfehler"
    ]
  },
  {
    title: "Blockaden statt echter Mangel",
    slug: "naehrstoffblockaden-und-antagonismen",
    points: [
      "Warum genug Dünger nicht automatisch genug Verfügbarkeit bedeutet",
      "pH, Salzstress und Antagonismen getrennt betrachtet",
      "Passender Einstieg vor jeder harten Nachdüngung"
    ]
  }
] as const;

const categoryLabel: Record<DefCategory, string> = {
  makro: "Makronährstoffe",
  sekundaer: "Sekundäre Nährstoffe",
  mikro: "Mikronährstoffe",
  stress: "Stress- und Blockadebilder"
};

const mobilityLabel: Record<Mobility, string> = {
  mobil: "Mobil",
  immobil: "Immobil",
  gemischt: "Gemischt"
};

const deficiencyLexicon: DeficiencyEntry[] = [
  {
    id: "n-mangel",
    name: "Stickstoffmangel (N)",
    short: "Untere, ältere Blätter vergilben zuerst und fallen bei anhaltendem Defizit ab.",
    category: "makro",
    risk: "hoch",
    mobility: "mobil",
    growArea: "beides",
    stage: "veg",
    symptoms: [
      "Helle bis gelbe ältere Fächerblätter",
      "Reduziertes Längenwachstum",
      "Frühzeitiger Blattverlust im unteren Drittel"
    ],
    causes: [
      "Unterdosierung im Wachstum",
      "N-Aufnahmeblockade durch pH außerhalb Zielbereich",
      "Stark ausgelaugtes Substrat"
    ],
    monitoring: [
      "EC/pH im Drain protokollieren",
      "Vergleich Alt- vs. Neuwuchs fotografisch festhalten",
      "Wachstumsrate je Woche prüfen"
    ],
    correction: [
      "N-Anteil in kleinen Schritten anheben",
      "pH in den Zielkorridor zurückführen",
      "Nach 3-5 Tagen Neuwuchs statt Altlaub bewerten"
    ],
    prevention: [
      "Fütterungsplan nach Stadium staffeln",
      "Drift im pH früh korrigieren",
      "Wöchentliche EC-Trendkontrolle"
    ]
  },
  {
    id: "p-mangel",
    name: "Phosphormangel (P)",
    short: "Dunkles Laub, verlangsamte Entwicklung und in Kältephasen oft violette Blattstiele.",
    category: "makro",
    risk: "hoch",
    mobility: "mobil",
    growArea: "beides",
    stage: "alle",
    symptoms: [
      "Matt-dunkelgrüne Blätter",
      "Verzögerte Wurzel- und Blütenentwicklung",
      "Teilweise purpurfarbene Blattstiele"
    ],
    causes: [
      "Zu niedrige Wurzeltemperatur",
      "pH-bedingte P-Fixierung",
      "Unpassende PK-Versorgung in der Blüte"
    ],
    monitoring: [
      "Substrattemperatur messen",
      "pH im Medium und Drain vergleichen",
      "Internodien-/Blütenansatz dokumentieren"
    ],
    correction: [
      "Wurzelzone temperieren und stabilisieren",
      "pH-Korrektur priorisieren",
      "Moderate P-Anhebung mit Nachkontrolle"
    ],
    prevention: [
      "Keine kalten Gießzyklen",
      "Konstante Bedingungen im Wurzelraum",
      "Blüteplan mit validierter PK-Staffel"
    ]
  },
  {
    id: "k-mangel",
    name: "Kaliummangel (K)",
    short: "Blattränder werden gelb-braun und nekrotisch, besonders bei hoher Verdunstungslast.",
    category: "makro",
    risk: "kritisch",
    mobility: "mobil",
    growArea: "beides",
    stage: "bluete",
    symptoms: [
      "Randchlorosen an älteren Blättern",
      "Braune, verbrannt wirkende Blattränder",
      "Schwächere Blütenqualität bei Dauerstress"
    ],
    causes: [
      "Unterversorgung im Peak-Bedarf",
      "Antagonismus durch zu viel Ca/Mg/Na",
      "EC-Schwankungen mit Uptake-Stress"
    ],
    monitoring: [
      "Blattrandentwicklung im Zeitverlauf tracken",
      "EC-Eintrag vs. Drain vergleichen",
      "Umweltparameter mit einbeziehen"
    ],
    correction: [
      "K-Anteil gezielt anheben",
      "Nährstoffverhältnisse neu balancieren",
      "Nach 5-7 Tagen auf Stopp der Randnekrose prüfen"
    ],
    prevention: [
      "Blütefutter an Verdunstung koppeln",
      "Abrupte EC-Sprünge vermeiden",
      "Regelmäßig Verhältnischeck der Kationen"
    ]
  },
  {
    id: "ca-mangel",
    name: "Calciummangel (Ca)",
    short: "Neuwuchs zeigt Deformationen und nekrotische Flecken, da Calcium nur begrenzt verlagert wird.",
    category: "sekundaer",
    risk: "hoch",
    mobility: "immobil",
    growArea: "beides",
    stage: "alle",
    symptoms: [
      "Verkrüppelter Neuwuchs",
      "Punktnekrosen an jungen Blättern",
      "Geschwächte Zellstruktur bei Spitzen"
    ],
    causes: [
      "Zu geringe Ca-Verfügbarkeit",
      "Transpirationsstress durch Klima",
      "pH-/Salzstress mit Nährstoffblockade"
    ],
    monitoring: [
      "Neues Wachstum separat bewerten",
      "RLF/VPD auf Extreme prüfen",
      "Ca:Mg-Verhältnis dokumentieren"
    ],
    correction: [
      "Calciumversorgung moderat erhöhen",
      "Klima stabilisieren (VPD vermeiden)",
      "pH-/Salzlage zuerst normalisieren"
    ],
    prevention: [
      "Konstante Wasserqualität nutzen",
      "Ca nicht erst im Mangel nachschieben",
      "Wurzelraum nicht austrocknen lassen"
    ]
  },
  {
    id: "mg-mangel",
    name: "Magnesiummangel (Mg)",
    short: "Interkostale Chlorosen an älteren Blättern bei zunächst grünen Blattadern.",
    category: "sekundaer",
    risk: "mittel",
    mobility: "mobil",
    growArea: "beides",
    stage: "bluete",
    symptoms: [
      "Aufhellungen zwischen Blattadern",
      "Adern bleiben anfangs grün",
      "Fortschreitend rostige Flecken"
    ],
    causes: [
      "Zu wenig Mg im Gießschema",
      "Ca/K-Antagonismus",
      "pH außerhalb optimaler Verfügbarkeit"
    ],
    monitoring: [
      "Altblattmuster in Reihen dokumentieren",
      "Ca:Mg Verhältnis verfolgen",
      "Drain-pH und EC trendbasiert auswerten"
    ],
    correction: [
      "Mg vorsichtig ergänzen",
      "Antagonismen im Futter entschärfen",
      "Neues Blattgewebe als Erfolgskriterium nutzen"
    ],
    prevention: [
      "Ca/Mg-Balance im Basiswasser kennen",
      "Keine extremen PK-Spitzen ohne Gegencheck",
      "Regelmäßige Blattbildkontrolle"
    ]
  },
  {
    id: "s-mangel",
    name: "Schwefelmangel (S)",
    short: "Heller, gleichmäßiger Neuwuchs ähnlich N-Mangel, jedoch eher an jungen Blättern sichtbar.",
    category: "sekundaer",
    risk: "mittel",
    mobility: "immobil",
    growArea: "beides",
    stage: "veg",
    symptoms: [
      "Gleichmäßige Aufhellung junger Blätter",
      "Schlankes, schwächeres Triebwachstum",
      "Verzögerte Grünfärbung"
    ],
    causes: [
      "Unzureichende Sulfatquelle",
      "Zu einseitige Düngermischung",
      "Nährstoffauswaschung im Substrat"
    ],
    monitoring: [
      "Jungtriebfarbe täglich vergleichen",
      "Nährstoffetiketten auf S-Anteil prüfen",
      "Substratwechsel-Intervalle beachten"
    ],
    correction: [
      "Sulfathaltige Nährstoffquelle ergänzen",
      "Fütterungsbalance ohne Überkorrektur anpassen",
      "Neuwuchs nach 4-6 Tagen neu bewerten"
    ],
    prevention: [
      "Vollständige Nährstoffprofile verwenden",
      "Bei RO-Wasser gezielt remineralisieren",
      "Langsame Dosierschritte statt Sprünge"
    ]
  },
  {
    id: "fe-mangel",
    name: "Eisenmangel (Fe)",
    short: "Sehr heller Neuwuchs mit grünen Blattadern, typischerweise bei pH-bedingter Blockade.",
    category: "mikro",
    risk: "hoch",
    mobility: "immobil",
    growArea: "beides",
    stage: "alle",
    symptoms: [
      "Limonengrüner bis gelber Neuwuchs",
      "Adern bleiben lange sichtbar grün",
      "Triebspitzen wirken blass und schwach"
    ],
    causes: [
      "Zu hoher pH im Wurzelraum",
      "Fe-Chelat nicht passend zum pH-Bereich",
      "Root-Stress durch Übernässung"
    ],
    monitoring: [
      "Neues Blattgewebe priorisiert beobachten",
      "pH im Medium engmaschig messen",
      "Wurzelgesundheit visuell prüfen"
    ],
    correction: [
      "pH zuerst in Zielbereich bringen",
      "Geeignete Fe-Chelatform einsetzen",
      "Bewässerungsrhythmus stabilisieren"
    ],
    prevention: [
      "Keine pH-Drift über Tage zulassen",
      "Mikronährstoffe kompatibel wählen",
      "Staunässe konsequent vermeiden"
    ]
  },
  {
    id: "zn-mangel",
    name: "Zinkmangel (Zn)",
    short: "Kleine Blätter, gestauchter Wuchs und Chlorosen im Neuwuchsbereich.",
    category: "mikro",
    risk: "mittel",
    mobility: "immobil",
    growArea: "beides",
    stage: "veg",
    symptoms: [
      "Verkleinerte neue Blätter",
      "Kurze Internodien (Rosetteneffekt)",
      "Mosaikartige Aufhellungen"
    ],
    causes: [
      "Mikro-Unterversorgung",
      "pH-bedingte Verfügbarkeitseinbußen",
      "Substrat mit starker Bindungskapazität"
    ],
    monitoring: [
      "Internodienabstand tracken",
      "Neuwuchsdeformationen fotografisch sichern",
      "Mikroprofil der Lösung prüfen"
    ],
    correction: [
      "Mikroelemente gezielt ergänzen",
      "pH-Korridor eng einhalten",
      "Verbesserung am Neuwuchs abwarten"
    ],
    prevention: [
      "Vollständige Mikroversorgung sicherstellen",
      "Keine einseitige PK-Betonung",
      "Regelmäßige visuelle Frühdiagnose"
    ]
  },
  {
    id: "mn-mangel",
    name: "Manganmangel (Mn)",
    short: "Interkostale Chlorosen plus feine Nekrosepunkte bei gleichzeitig ausbleibender Vitalität.",
    category: "mikro",
    risk: "mittel",
    mobility: "immobil",
    growArea: "beides",
    stage: "alle",
    symptoms: [
      "Aufhellungen zwischen Blattadern",
      "Feine graubraune Punktnekrosen",
      "Trägeres Wachstum"
    ],
    causes: [
      "Hoher pH mit Mangan-Blockade",
      "Unausgewogene Mikronährstoffmischung",
      "Substratstress"
    ],
    monitoring: [
      "Abgrenzung zu Fe-/Mg-Mangel dokumentieren",
      "pH-Verlauf engmaschig prüfen",
      "Neuwuchs über mehrere Tage vergleichen"
    ],
    correction: [
      "Mikroversorgung fein anpassen",
      "pH stabil in Sollzone führen",
      "Überkorrekturen vermeiden"
    ],
    prevention: [
      "Mikroelemente regelmäßig mitführen",
      "Keine abrupten pH-Wechsel",
      "Konstante Bedingungen im Wurzelraum"
    ]
  },
  {
    id: "lockout",
    name: "Nährstoffblockade (Mischbild)",
    short: "Mehrere Mangel-/Überschusssymptome gleichzeitig durch pH- und Salzstress in der Wurzelzone.",
    category: "stress",
    risk: "kritisch",
    mobility: "gemischt",
    growArea: "beides",
    stage: "alle",
    symptoms: [
      "Uneinheitliches Blattbild (gelb, verbrannt, dunkel)",
      "Wachstumsstopp trotz Fütterung",
      "Schnelle Verschlechterung nach jedem Gießen"
    ],
    causes: [
      "pH außerhalb Aufnahmefenster",
      "Salzakkumulation / zu hoher EC",
      "Ungünstige Wechsel zwischen Trocken- und Nässephasen"
    ],
    monitoring: [
      "Drain-EC und Drain-pH bei jedem Zyklus messen",
      "Runoff-Mengen dokumentieren",
      "Symptomfortschritt pro Tag protokollieren"
    ],
    correction: [
      "Wurzelzone zuerst stabilisieren",
      "Schrittweise auf balanciertes Futter zurückführen",
      "Erst Neuwuchs bewerten, nicht Altblätter"
    ],
    prevention: [
      "Regelmäßige Drainanalyse",
      "Keine aggressiven Düngesprünge",
      "Gießrhythmus und Substratluft stabil halten"
    ]
  }
];

const correctionMatrix: CorrectionRow[] = [
  {
    deficiency: "N-Mangel",
    firstStep: "N-Anteil moderat erhöhen",
    followUp: "Neuwuchs nach 3-5 Tagen checken",
    window: "Kurzfristig",
    notes: "Altlaub erholt sich oft nicht vollständig."
  },
  {
    deficiency: "K-Mangel",
    firstStep: "Kationenverhältnis prüfen",
    followUp: "K-Anteil schrittweise anpassen",
    window: "3-7 Tage",
    notes: "Blattrandnekrosen stoppen ist primäres Ziel."
  },
  {
    deficiency: "Ca-/Mg-Thema",
    firstStep: "Ca:Mg im Wasser prüfen",
    followUp: "Klimastress und pH parallel korrigieren",
    window: "4-10 Tage",
    notes: "Neuwuchs ist der belastbare Indikator."
  },
  {
    deficiency: "Fe-/Mn-/Zn-Mangel",
    firstStep: "pH in Verfügbarkeitsfenster führen",
    followUp: "Mikroversorgung feinjustieren",
    window: "3-7 Tage",
    notes: "Mikromängel sind oft die Folge einer Nährstoffblockade."
  },
  {
    deficiency: "Blockade-Mischbild",
    firstStep: "Drainwerte erfassen und stabilisieren",
    followUp: "Fütterung neu kalibrieren",
    window: "1-2 Wochen",
    notes: "Keine harten Gegenkorrekturen in einem Schritt."
  }
];

const first24hChecklist = [
  {
    level: "Rot",
    title: "Messdaten sichern",
    points: [
      "pH, EC, Drain-Menge sofort dokumentieren",
      "Betroffene Pflanzen und Zonen markieren",
      "Kein blindes Nachdüngen ohne Messwerte"
    ]
  },
  {
    level: "Gelb",
    title: "Ursache eingrenzen",
    points: [
      "Mobil vs. immobil im Blattbild unterscheiden",
      "Wasserqualität und Düngercharge prüfen",
      "Klima (VPD/Temperatur) gegen Sollwerte legen"
    ]
  },
  {
    level: "Grün",
    title: "Korrekturplan starten",
    points: [
      "Schrittweise Anpassung definieren",
      "Kontrollpunkte für Tag 3, 7 und 14 setzen",
      "Neuwuchs als Hauptkriterium verwenden"
    ]
  }
];

const externalSources: ExternalSource[] = [
  {
    title: "Essential nutrients for plant growth (FAO)",
    url: "https://www.fao.org/soils-portal/soil-management/soil-fertility/en/",
    kind: "Grundlagen"
  },
  {
    title: "Nutrient deficiencies in plants (University of Minnesota)",
    url: "https://extension.umn.edu/plant-nutrients/understanding-fertilizers-and-plant-nutrients",
    kind: "Praxisleitfaden"
  },
  {
    title: "Plant nutrient disorders (Royal Horticultural Society)",
    url: "https://www.rhs.org.uk/soil-composts-mulches/plant-nutrition",
    kind: "Diagnostik"
  },
  {
    title: "Nutrient management overview (Cornell CALS)",
    url: "https://cals.cornell.edu/cornell-cooperative-extension",
    kind: "Feldpraxis"
  }
];

const protocolDownloads = [
  {
    title: "Protokoll: Makronährstoff-Mängel",
    href: "/terpira/deficiencies/protocols/makro-naehrstoffe.txt"
  },
  {
    title: "Protokoll: Sekundär- und Mikronährstoffe",
    href: "/terpira/deficiencies/protocols/mikro-sekundaer.txt"
  },
  {
    title: "Protokoll: Nährstoffblockade und Wurzelraum-Reset",
    href: "/terpira/deficiencies/protocols/lockout-reset.txt"
  }
];

const symptomOptions: SymptomOption[] = [
  {
    id: "untere-gelb",
    label: "Untere Blätter vergilben",
    keywords: ["älteren", "untere", "vergilben", "mobil"]
  },
  {
    id: "interkostal",
    label: "Interkostale Chlorose",
    keywords: ["zwischen", "blattadern", "interkostal", "chlorose"]
  },
  {
    id: "randnekrose",
    label: "Braune Blattränder",
    keywords: ["blattränder", "rand", "nekrose", "verbrannt"]
  },
  {
    id: "neuwuchs-blass",
    label: "Blasser Neuwuchs",
    keywords: ["neuwuchs", "jung", "blass", "limonengrüner"]
  },
  {
    id: "verkrueppelt",
    label: "Verkrüppelter Wuchs",
    keywords: ["verkrüppelt", "deformation", "gestauchter", "internodien"]
  },
  {
    id: "wachstumsstopp",
    label: "Wachstumsstopp",
    keywords: ["wachstumsstopp", "wachstumsbremse", "träge"]
  },
  {
    id: "mischbild",
    label: "Mischbild (Mangel + Überschuss)",
    keywords: ["mischbild", "lockout", "salz", "drain"]
  }
];

export default function DeficiencyLexiconPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<DefCategory | "alle">("alle");
  const [activeRisk, setActiveRisk] = useState<RiskLevel | "alle">("alle");
  const [activeArea, setActiveArea] = useState<GrowArea | "alle">("alle");
  const [activeStage, setActiveStage] = useState<PlantStage | "alle">("alle");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deficiencyLexicon.filter((entry) => {
      if (activeCategory !== "alle" && entry.category !== activeCategory) return false;
      if (activeRisk !== "alle" && entry.risk !== activeRisk) return false;
      if (activeArea !== "alle" && entry.growArea !== activeArea) return false;
      if (activeStage !== "alle" && entry.stage !== activeStage) return false;
      if (!q) return true;
      const hay = `${entry.name} ${entry.short} ${entry.symptoms.join(" ")} ${entry.causes.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, activeCategory, activeRisk, activeArea, activeStage]);

  const countsByCategory = useMemo(() => {
    const map: Record<DefCategory, number> = {
      makro: 0,
      sekundaer: 0,
      mikro: 0,
      stress: 0
    };
    for (const item of deficiencyLexicon) map[item.category] += 1;
    return map;
  }, []);

  const quickDiagnosis = useMemo(() => {
    if (selectedSymptoms.length === 0) return [] as Array<{ item: DeficiencyEntry; score: number }>;

    const chosen = symptomOptions.filter((option) => selectedSymptoms.includes(option.id));
    const riskWeight: Record<RiskLevel, number> = { niedrig: 0, mittel: 1, hoch: 2, kritisch: 3 };

    return deficiencyLexicon
      .map((item) => {
        const text = `${item.short} ${item.symptoms.join(" ")} ${item.causes.join(" ")} ${item.monitoring.join(" ")}`.toLowerCase();
        let score = riskWeight[item.risk];
        for (const option of chosen) {
          if (option.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
            score += 3;
          }
        }
        return { item, score };
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [selectedSymptoms]);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]
    );
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <Link href={"/studies" as Route} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800">
          ← Zurück zum Wiki
        </Link>

        <div className="mt-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Register</p>
          <h1 className="mt-1 text-4xl font-bold text-foreground">Nährstoffmängel-Lexikon Cannabis</h1>
          <p className="mt-2 max-w-3xl text-sm text-foreground/80">
            Kompakter Überblick über typische Nährstoffmängel und Blockadebilder bei Cannabispflanzen,
            mit Symptomen, Ursachen, Monitoring, Korrektur und Prävention.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-emerald-200 dark:border-emerald-900/40 bg-card px-3 py-1 font-semibold text-emerald-800 dark:text-emerald-400">{deficiencyLexicon.length} Einträge</span>
            <span className="rounded-full border border-cyan-200 dark:border-cyan-900/40 bg-card px-3 py-1 font-semibold text-cyan-800 dark:text-cyan-400">Mit Diagnose-Logik</span>
            <span className="rounded-full border border-border bg-card px-3 py-1 font-semibold text-foreground/80">Filterbar</span>
          </div>
          <p className="mt-3 text-xs text-foreground/80">
            Alle Inhalte sind evidenzbasiert und auf Cannabispflanzen bezogen. Fotos werden ergänzt, sobald verifizierte Cannabis-Symptomfotos mit sauberer Lizenzzuordnung verfügbar sind.
          </p>
        </div>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">Schnellzugriff</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="#filter" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">Filter</a>
            <a href="#lexikon" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">Lexikon</a>
            <a href="#lebenszyklus" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">Nährstoffbedarf-Hub</a>
            <a href="#wiki-artikel" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">Wiki-Artikel</a>
            <a href="#matrix" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">Korrektur-Matrix</a>
            <a href="#ampel" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">24h-Ampel</a>
            <a href="#downloads" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">Downloads</a>
            <a href="#quellen" className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground/80 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400">Quellen</a>
          </div>
        </section>

        <section id="filter" className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm scroll-mt-24">
          <div className="grid gap-3 md:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nährstoff, Symptom, Ursache suchen..."
              className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground/80 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value as DefCategory | "alle")} className="rounded-xl border border-border px-3 py-2 text-sm">
              <option value="alle">Alle Kategorien</option>
              <option value="makro">Makro</option>
              <option value="sekundaer">Sekundär</option>
              <option value="mikro">Mikro</option>
              <option value="stress">Stress und Blockaden</option>
            </select>
            <select value={activeRisk} onChange={(e) => setActiveRisk(e.target.value as RiskLevel | "alle")} className="rounded-xl border border-border px-3 py-2 text-sm">
              <option value="alle">Alle Risiken</option>
              <option value="niedrig">Niedrig</option>
              <option value="mittel">Mittel</option>
              <option value="hoch">Hoch</option>
              <option value="kritisch">Kritisch</option>
            </select>
            <select value={activeArea} onChange={(e) => setActiveArea(e.target.value as GrowArea | "alle")} className="rounded-xl border border-border px-3 py-2 text-sm">
              <option value="alle">Alle Umgebungen</option>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="beides">Indoor + Outdoor</option>
            </select>
            <select value={activeStage} onChange={(e) => setActiveStage(e.target.value as PlantStage | "alle")} className="rounded-xl border border-border px-3 py-2 text-sm">
              <option value="alle">Alle Phasen</option>
              <option value="keimling">Keimling</option>
              <option value="veg">Veg</option>
              <option value="bluete">Blüte</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(countsByCategory).map(([key, count]) => {
              const typedKey = key as DefCategory;
              const active = activeCategory === typedKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(active ? "alle" : typedKey)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${active ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "border-border bg-background text-foreground/80"}`}
                >
                  {categoryLabel[typedKey]} ({count})
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-foreground/80">
            <span className="font-semibold text-foreground">{filtered.length}</span> Treffer im Nährstoffmängel-Lexikon
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50/50 dark:bg-cyan-950/20 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-400">Schnelldiagnose</p>
              <h2 className="text-xl font-bold text-foreground">Symptom-Check in 30 Sekunden</h2>
              <p className="mt-1 text-sm text-foreground/80">Symptome markieren und die wahrscheinlichsten Mangelbilder priorisiert anzeigen lassen.</p>
            </div>
            {selectedSymptoms.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedSymptoms([])}
                className="rounded-lg border border-cyan-300 bg-card px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 dark:bg-cyan-950/40"
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
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
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
              quickDiagnosis.map(({ item, score }) => (
                <article key={`diag-${item.id}`} className="rounded-xl border border-cyan-200 dark:border-cyan-900/40 bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-foreground">{item.name}</p>
                    <span className="rounded-full border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50 dark:bg-cyan-950/30 px-2 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                      Treffer {score}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground/80">{item.short}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${riskClass[item.risk]}`}>
                      {riskLabel[item.risk]}
                    </span>
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-semibold text-foreground/80">
                      {categoryLabel[item.category]}
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
          {filtered.map((entry) => {
            return (
              <article key={entry.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-semibold text-foreground/80">{categoryLabel[entry.category]}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${riskClass[entry.risk]}`}>{riskLabel[entry.risk]}</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{entry.name}</h2>
                  <p className="mt-2 text-sm text-foreground/80">{entry.short}</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <p className="rounded-lg border border-border bg-background px-2 py-1 font-semibold text-foreground/80">Mobilität: {mobilityLabel[entry.mobility]}</p>
                  <p className="rounded-lg border border-border bg-background px-2 py-1 font-semibold text-foreground/80">Umgebung: {areaLabel[entry.growArea]}</p>
                  <p className="rounded-lg border border-border bg-background px-2 py-1 font-semibold text-foreground/80 col-span-2">Phase: {stageLabel[entry.stage]}</p>
                </div>

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
                      <p className="font-semibold text-foreground">Typische Ursachen</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {entry.causes.map((item) => (
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
                      <p className="font-semibold text-foreground">Korrektur</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {entry.correction.map((item) => (
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
                  </div>
                </details>
              </div>
            </article>
            );
          })}
        </section>

        {/* ── Hub statt Dublette ───────────────────────────────── */}
        <section id="lebenszyklus" className="mt-6 rounded-2xl border border-violet-200 dark:border-violet-900/40 bg-violet-50/40 dark:bg-violet-950/40 p-5 shadow-sm scroll-mt-24">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-400">Hub statt Parallelpflege</p>
              <h2 className="mt-1 text-xl font-bold text-foreground">Nährstoffbedarf und Kulturkontext</h2>
              <p className="mt-1 max-w-2xl text-sm text-foreground/80">
                Diese Lexikon-Seite bleibt bei Diagnose, Ursachen und Korrektur. Die phasenweise Nährstofflogik,
                Substratunterschiede und Antagonismen liegen in eigenen Wiki-Artikeln, damit Evidenz nicht an zwei Stellen parallel gepflegt wird.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {lifecycleHubCards.map((card) => (
              <Link
                key={card.slug}
                href={`/studies/${card.slug}` as Route}
                className="group rounded-xl border border-border bg-card p-4 transition hover:border-violet-300 hover:bg-violet-50 dark:bg-violet-950/30"
              >
                <p className="text-sm font-bold text-foreground group-hover:text-violet-900">{card.title}</p>
                <ul className="mt-3 space-y-1 text-xs text-foreground/80">
                  {card.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="font-bold text-violet-500">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-4 inline-flex text-xs font-semibold text-violet-700 dark:text-violet-400 group-hover:underline">Zum Artikel →</span>
              </Link>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-violet-200 dark:border-violet-900/40 bg-card/80 px-4 py-3 text-sm text-foreground/80">
            <strong className="text-foreground">Warum hier nur der Hub?</strong> Lebenszyklus, Substratlogik und Antagonismen werden bereits in eigenen
            Artikeln gepflegt. So bleibt das Lexikon auf Diagnose und Korrektur fokussiert und dieselbe Evidenz wird nicht an zwei Stellen parallel aktualisiert.
          </div>
        </section>

        {/* ── Weiterführende Wiki-Artikel ───────────────────────── */}
        <section id="wiki-artikel" className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm scroll-mt-24">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">Vertiefung · Studienbasis</p>
          <h2 className="mt-1 text-xl font-bold text-foreground">Weiterführende Wiki-Artikel</h2>
          <p className="mt-1 max-w-2xl text-sm text-foreground/80">
            Vertiefende Artikel zu Nährstoffen, Substraten und Anbausystemen mit nachvollziehbarer Studienbasis.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {wikiLinks.map((link) => (
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
          <article id="matrix" className="rounded-2xl border border-border bg-card p-5 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground">Korrektur-Matrix</h2>
            <p className="mt-1 text-sm text-foreground/80">Kompakter Leitfaden von der ersten Maßnahme bis zur Nachkontrolle.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-background text-foreground/80">
                  <tr>
                    <th className="px-3 py-2 text-left">Mangelbild</th>
                    <th className="px-3 py-2 text-left">Erster Schritt</th>
                    <th className="px-3 py-2 text-left">Follow-up</th>
                    <th className="px-3 py-2 text-left">Zeitfenster</th>
                  </tr>
                </thead>
                <tbody>
                  {correctionMatrix.map((row) => (
                    <tr key={`${row.deficiency}-${row.firstStep}`} className="border-t border-border">
                      <td className="px-3 py-2 font-semibold text-foreground">{row.deficiency}</td>
                      <td className="px-3 py-2 text-foreground/80">{row.firstStep}</td>
                      <td className="px-3 py-2 text-foreground/80">{row.followUp}</td>
                      <td className="px-3 py-2 text-foreground/80">{row.window}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article id="ampel" className="rounded-2xl border border-border bg-card p-5 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground">24h-Ampel: Sofortmaßnahmen</h2>
            <p className="mt-1 text-sm text-foreground/80">Was in den ersten 24 Stunden nach Mangelverdacht passieren sollte.</p>
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

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <article id="quellen" className="rounded-2xl border border-border bg-card p-5 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground">Externe Internetquellen</h2>
            <p className="mt-1 text-sm text-foreground/80">Direkte Referenzen für Nährstoffdiagnostik und Management.</p>
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
            <h2 className="text-xl font-bold text-foreground">Protokolle herunterladen</h2>
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
            Keine Nährstoffmängel-Einträge mit den aktuellen Filtern gefunden. Passe Suche oder Filter an.
          </div>
        )}
      </section>
    </main>
  );
}
