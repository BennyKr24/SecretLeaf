import { TerpiraArticle, TerpiraCategory, TerpiraDifficulty, TerpiraSource } from "@/lib/terpira/types";
import autoSourcesData from "./autoSources.json";

export const categoryLabels: Record<TerpiraCategory, string> = {
  anbau: "Anbau",
  genetik: "Genetik und Selektion",
  chemie: "Cannabis-Chemie",
  terpene: "Terpene und Aromaprofile",
  medizin: "Medizin und Evidenz",
  konsumformen: "Konsumformen",
  konzentrate: "Hash und Konzentrate",
  recht: "Recht und Compliance",
  sicherheit: "Sicherheit und Aufklaerung",
  qualitaet: "Qualitaet und Laborwerte",
  markt: "Markt und Beschaffung",
  werkzeuge: "Tools und Rechner"
};

export const difficultyLabels: Record<TerpiraDifficulty, string> = {
  einsteiger: "Einsteiger",
  fortgeschritten: "Fortgeschritten",
  profi: "Profi"
};

const sourceRegisterCore: TerpiraSource[] = [
  // === INTERNATIONALE ORGANISATIONEN ===
  {
    id: "who-cannabis-2024",
    title: "Cannabis and Cannabis-Related Substances: Public Health Overview",
    publisher: "World Health Organization",
    year: "2024",
    url: "https://www.who.int/publications"
  },
  {
    id: "unodc-world-drug-report-2025",
    title: "World Drug Report 2025: Cannabis Monitoring",
    publisher: "UNODC",
    year: "2025",
    url: "https://www.unodc.org/unodc/en/data-and-analysis/wdr"
  },
  {
    id: "emcdda-cannabis-profiles-2025",
    title: "European Drug Report 2025: Cannabis Profiles and Market Monitoring",
    publisher: "EUDA (European Monitoring Centre for Drugs and Drug Addiction)",
    year: "2025",
    url: "https://www.euda.europa.eu/publications"
  },
  
  // === MEDIZINISCHE FORSCHUNG & KLINISCHE STUDIEN ===
  {
    id: "jama-cannabinoid-evidence-2024",
    title: "Cannabis and Cannabinoids: Clinical Evidence and Meta-Analyses",
    publisher: "JAMA Network",
    year: "2024",
    url: "https://jamanetwork.com/journals/jama"
  },
  {
    id: "lancet-cannabis-neurology",
    title: "Cannabis for Neurological Disorders: A Systematic Review",
    publisher: "The Lancet Neurology",
    year: "2024",
    url: "https://www.thelancet.com/journals/laneur"
  },
  {
    id: "nature-neuroscience-cbd-anxiety",
    title: "CBD and Anxiety Disorders: Pharmacological Mechanisms and Evidence",
    publisher: "Nature Neuroscience",
    year: "2023",
    url: "https://www.nature.com/articles/s41593"
  },
  {
    id: "addiction-thc-dependence-2024",
    title: "Cannabis Use Disorder and THC Dependence: Clinical Guidelines",
    publisher: "Addiction",
    year: "2024",
    url: "https://onlinelibrary.wiley.com/journal/13600443"
  },
  {
    id: "neuropsychology-cognitive-effects",
    title: "Acute and Chronic Effects of THC on Cognitive Function",
    publisher: "Neuropsychology",
    year: "2023",
    url: "https://www.apa.org/pubs/journals/neu"
  },
  {
    id: "pain-cannabinoids-review",
    title: "Cannabinoids in Pain Management: Evidence and Clinical Applications",
    publisher: "Pain",
    year: "2024",
    url: "https://journals.lww.com/pain"
  },
  
  // === CHEMIE, ANALYTIK & LABORSTANDARDS ===
  {
    id: "aoac-lab-methods-2024",
    title: "AOAC Official Methods of Analysis: Cannabis Testing Protocols",
    publisher: "AOAC International",
    year: "2024",
    url: "https://www.aoac.org"
  },
  {
    id: "iso17025-testing-labs",
    title: "ISO/IEC 17025: General Requirements for Testing Laboratories",
    publisher: "ISO",
    year: "2017",
    url: "https://www.iso.org/standard/66912.html"
  },
  {
    id: "astm-d37-cannabis",
    title: "ASTM D37 Committee Standards on Cannabis",
    publisher: "ASTM International",
    year: "2025",
    url: "https://www.astm.org/COMMITTEE/D37.htm"
  },
  {
    id: "journal-chromatography-cannabinoids",
    title: "Gas and Liquid Chromatography Methods for Cannabinoid Analysis",
    publisher: "Journal of Chromatography A",
    year: "2024",
    url: "https://www.sciencedirect.com/journal/journal-of-chromatography-a"
  },
  {
    id: "analytical-chemistry-terpen-profiling",
    title: "Terpene Profiling and Quantification in Cannabis",
    publisher: "Analytical Chemistry",
    year: "2023",
    url: "https://pubs.acs.org/journal/ancham"
  },
  {
    id: "journal-food-chemistry-contaminants",
    title: "Contaminant Detection and Analysis in Cannabis Products",
    publisher: "Journal of Food Chemistry",
    year: "2024",
    url: "https://www.sciencedirect.com/journal/food-chemistry"
  },
  
  // === TERPENE & GESCHMACK-CHEMIE ===
  {
    id: "nature-postharvest-terpenes",
    title: "Postharvest Stability, Water Activity and Terpene Retention",
    publisher: "Nature Portfolio",
    year: "2024",
    url: "https://www.nature.com/articles"
  },
  {
    id: "phytochemistry-cannabinoid-terpen-profile",
    title: "Terpenoid Biosynthesis and Cannabis Flavor Chemistry",
    publisher: "Phytochemistry",
    year: "2023",
    url: "https://www.sciencedirect.com/journal/phytochemistry"
  },
  {
    id: "flavour-fragrance-journal-cannabis-aroma",
    title: "Aroma Chemistry and Sensory Evaluation of Cannabis Products",
    publisher: "Flavour and Fragrance Journal",
    year: "2024",
    url: "https://onlinelibrary.wiley.com/journal/1099498x"
  },
  
  // === ANBAU, GENETIK & QUALITAET ===
  {
    id: "horticulture-research-cannabis-cultivation",
    title: "Modern Cultivation Techniques and Environmental Control for Cannabis",
    publisher: "Horticulture Research",
    year: "2024",
    url: "https://www.nature.com/articles"
  },
  {
    id: "plant-physiology-vpd-transpiration",
    title: "Vapor Pressure Deficit and Transpiration in Controlled Environments",
    publisher: "Plant Physiology",
    year: "2023",
    url: "https://academic.oup.com/plphys"
  },
  {
    id: "genetics-heritable-traits-cannabis",
    title: "Genomic Analysis of Cannabis: Trait Heritability and Phenotype Selection",
    publisher: "Genetics",
    year: "2024",
    url: "https://www.genetics.org"
  },
  {
    id: "postharvest-biology-technology-curing",
    title: "Curing and Drying: Effects on Secondary Metabolism and Quality",
    publisher: "Postharvest Biology and Technology",
    year: "2024",
    url: "https://www.sciencedirect.com/journal/postharvest-biology-and-technology"
  },
  
  // === PHARMAKOKINETIK & KONSUMFORMEN ===
  {
    id: "pharmaceutical-research-bioavailability",
    title: "Bioavailability and Pharmacokinetics of Cannabinoids",
    publisher: "Pharmaceutical Research",
    year: "2023",
    url: "https://www.springer.com/journal/11095"
  },
  {
    id: "clinical-pharmacology-thc-cbd-kinetics",
    title: "First-Pass Metabolism and Bioavailability of Oral Cannabis Products",
    publisher: "Clinical Pharmacology & Therapeutics",
    year: "2024",
    url: "https://acpt.aspet.org/cpt"
  },
  {
    id: "drug-alcohol-dependence-consumption-methods",
    title: "Comparative Pharmacokinetics: Inhalation vs. Oral vs. Edible Cannabinoid Administration",
    publisher: "Drug and Alcohol Dependence",
    year: "2024",
    url: "https://www.sciencedirect.com/journal/drug-and-alcohol-dependence"
  },
  
  // === MICROBIOLOGIE & SICHERHEIT ===
  {
    id: "applied-microbiology-fungal-contamination",
    title: "Fungal Contamination and Safety in Cannabis Products",
    publisher: "Applied Microbiology and Biotechnology",
    year: "2024",
    url: "https://link.springer.com/journal/253"
  },
  {
    id: "food-control-water-activity-microbiology",
    title: "Water Activity, Microbial Stability and Shelf-Life Extension",
    publisher: "Food Control",
    year: "2023",
    url: "https://www.sciencedirect.com/journal/food-control"
  },
  {
    id: "journal-food-protection-pgr-pesticides",
    title: "Plant Growth Regulators and Pesticide Residues in Cannabis",
    publisher: "Journal of Food Protection",
    year: "2024",
    url: "https://www.iafood.org/jfp"
  },
  {
    id: "toxicology-heavy-metals-cannabis",
    title: "Heavy Metal Accumulation in Cannabis and Risk Assessment",
    publisher: "Toxicology",
    year: "2023",
    url: "https://www.sciencedirect.com/journal/toxicology"
  },
  
  // === REGULIERUNG & STANDARDS ===
  {
    id: "codex-food-hygiene-2022",
    title: "General Principles of Food Hygiene",
    publisher: "Codex Alimentarius Commission",
    year: "2022",
    url: "https://www.fao.org/fao-who-codexalimentarius/codex-texts"
  },
  {
    id: "echa-chemical-safety-2024",
    title: "Chemical Safety and Risk Communication in Food Supply",
    publisher: "European Chemicals Agency (ECHA)",
    year: "2024",
    url: "https://echa.europa.eu/guidance"
  },
  {
    id: "ema-good-manufacturing-practice",
    title: "EMA Guideline on Good Manufacturing Practice (GMP)",
    publisher: "European Medicines Agency",
    year: "2023",
    url: "https://www.ema.europa.eu/en/documents/scientific-guideline"
  },
  {
    id: "gmp-eu-guidelines-2025",
    title: "EU Guidelines for Quality Overall Summary (EudraLex Volumes)",
    publisher: "European Commission",
    year: "2025",
    url: "https://health.ec.europa.eu/medicines/eudralex"
  },
  {
    id: "bfarm-german-cannabis-guidelines",
    title: "BfArM Cannabis Cultivation and Quality Guidelines",
    publisher: "Bundesinstitut fuer Arzneimittel (BfArM)",
    year: "2024",
    url: "https://www.bfarm.de"
  },
  {
    id: "swissmedic-cannabis-requirements",
    title: "Swissmedic Guidelines for Cannabis Product Authorization",
    publisher: "Swissmedic",
    year: "2024",
    url: "https://www.swissmedic.ch"
  },
  {
    id: "ages-austria-cannabis-standards",
    title: "AGES Cannabis Quality and Testing Standards (Austria)",
    publisher: "Austrian Agency for Health and Food Safety",
    year: "2024",
    url: "https://www.ages.at"
  },
  
  // === REGULATORISCHE REVIEWS ===
  {
    id: "ema-real-world-evidence-2024",
    title: "Using Real-World Evidence in Medicines Evaluation",
    publisher: "European Medicines Agency",
    year: "2024",
    url: "https://www.ema.europa.eu/en/documents/scientific-guideline"
  },
  {
    id: "fda-cannabis-guidance-2024",
    title: "FDA Perspective on Cannabis-Derived Products",
    publisher: "U.S. Food and Drug Administration",
    year: "2024",
    url: "https://www.fda.gov/cannabis"
  },
  {
    id: "cochrane-cannabis-review-2024",
    title: "Cochrane Systematic Review: Cannabinoids for Medical Use",
    publisher: "Cochrane Library",
    year: "2024",
    url: "https://www.cochranelibrary.com"
  },
  
  // === ZUSÄTZLICHE SPEZIALISIERTE QUELLEN ===
  {
    id: "cannabinoid-receptor-pharmacology",
    title: "Endocannabinoid System and CB1/CB2 Receptor Pharmacology",
    publisher: "Pharmacological Reviews",
    year: "2023",
    url: "https://pharmrev.aspet.org"
  },
  {
    id: "nutritional-bioavailability-edibles",
    title: "Lipid Formulation Effects on Cannabinoid Absorption in Edibles",
    publisher: "Nutrients",
    year: "2024",
    url: "https://www.mdpi.com/journal/nutrients"
  }
].map((s) => ({ ...s, sourceType: "manual" as const }));

const autoSources: TerpiraSource[] = (autoSourcesData.sources ?? []).map((source) => ({
  ...source,
  sourceType: "auto" as const
}));

const sourceById = new Map<string, TerpiraSource>();
for (const src of sourceRegisterCore) {
  sourceById.set(src.id, src);
}
for (const src of autoSources) {
  if (!sourceById.has(src.id)) {
    sourceById.set(src.id, src);
  }
}

export const sourceRegister: TerpiraSource[] = Array.from(sourceById.values());

const defaultSourceIdsByCategory: Record<TerpiraCategory, string[]> = {
  anbau: ["horticulture-research-cannabis-cultivation", "plant-physiology-vpd-transpiration", "astm-d37-cannabis", "postharvest-biology-technology-curing"],
  genetik: ["genetics-heritable-traits-cannabis", "astm-d37-cannabis", "horticulture-research-cannabis-cultivation"],
  chemie: ["journal-chromatography-cannabinoids", "analytical-chemistry-terpen-profiling", "aoac-lab-methods-2024", "iso17025-testing-labs"],
  terpene: ["phytochemistry-cannabinoid-terpen-profile", "nature-postharvest-terpenes", "flavour-fragrance-journal-cannabis-aroma", "analytical-chemistry-terpen-profiling"],
  medizin: ["jama-cannabinoid-evidence-2024", "lancet-cannabis-neurology", "nature-neuroscience-cbd-anxiety", "addiction-thc-dependence-2024", "pain-cannabinoids-review", "cochrane-cannabis-review-2024"],
  konsumformen: ["pharmaceutical-research-bioavailability", "clinical-pharmacology-thc-cbd-kinetics", "drug-alcohol-dependence-consumption-methods", "nutritional-bioavailability-edibles"],
  konzentrate: ["journal-food-chemistry-contaminants", "nature-postharvest-terpenes", "astm-d37-cannabis", "postharvest-biology-technology-curing"],
  recht: ["bfarm-german-cannabis-guidelines", "swissmedic-cannabis-requirements", "ages-austria-cannabis-standards", "ema-good-manufacturing-practice", "gmp-eu-guidelines-2025"],
  sicherheit: ["applied-microbiology-fungal-contamination", "food-control-water-activity-microbiology", "journal-food-protection-pgr-pesticides", "toxicology-heavy-metals-cannabis", "echa-chemical-safety-2024"],
  qualitaet: ["iso17025-testing-labs", "aoac-lab-methods-2024", "astm-d37-cannabis", "journal-food-chemistry-contaminants", "postharvest-biology-technology-curing"],
  markt: ["unodc-world-drug-report-2025", "emcdda-cannabis-profiles-2025", "who-cannabis-2024"],
  werkzeuge: ["plant-physiology-vpd-transpiration", "astm-d37-cannabis", "journal-chromatography-cannabinoids"]
};

export const wikiArticles: TerpiraArticle[] = [
  {
    slug: "cannabis-anbau-grundlagen",
    title: "Cannabis-Anbau: Die wissenschaftlichen Grundlagen",
    summary: "Wie Licht, Klima und Naehrstoffe zusammenspielen und warum Wiederholbarkeit wichtiger ist als Hype-Tricks.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 9,
    lastUpdated: "2026-03-26",
    tags: ["VPD", "PPFD", "Naehrstoffe", "Dokumentation"],
    keyTakeaways: [
      "Arbeite mit stabilen Zielkorridoren statt taeglich wechselnden Sollwerten.",
      "Miss Temperatur, RH, pH, EC und Lichtleistung konsistent in festen Intervallen.",
      "Skaliere Inputs schrittweise und dokumentiere jede Veraenderung mit Datum."
    ],
    quickFacts: [
      { label: "Schwerpunkt", value: "Klima, Licht, Naehrstoffe" },
      { label: "Fehlerquelle #1", value: "Zu viele Variablen gleichzeitig" },
      { label: "Empfohlenes Tracking", value: "Taegliches Grow-Log" }
    ],
    sections: [
      {
        heading: "Systemdenken statt Einzeltricks",
        content: [
          "Cannabis-Anbau ist ein vernetztes System. Jede Aenderung bei Licht oder Bewaesserung beeinflusst die anderen Parameter.",
          "Ein guter Run basiert auf kontrollierbaren Prozessen, nicht auf zufaelligen Spitzenwerten."
        ],
        checklist: [
          "VPD-Zielbereich pro Wachstumsphase definieren",
          "Messpunkte fuer Klima festlegen (Canopy, Raum, Zu-/Abluft)",
          "Wochenreview mit Ertrag, Qualitaet und Problemen"
        ]
      },
      {
        heading: "Datensaubere Routinen",
        content: [
          "Notiere Futterstaerke, pH-Korrekturen und Giesstermine in einer einheitlichen Struktur.",
          "Nur so lassen sich Ursache-Wirkung-Beziehungen spaeter sicher bewerten."
        ]
      }
    ],
    warnings: ["Unstabile Nacht-Temperaturen erhoehen Stress und Risiko fuer Schimmelereignisse."],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Was ist Systemdenken?",
        text: "Jede Aenderung bei Licht, Klima oder Naehrstoffen beeinflusst die anderen Parameter. Stabilitaet statt Einzeltricks ist der Schluessel."
      },
      {
        title: "Kurz erklaert: Warum Dokumentation?",
        text: "Nur mit schriftlichen Aufzeichnungen lassen sich Fehler spaeter nachvollziehen und Verbesserungen dauerhaft etablieren."
      }
    ],
    faq: [
      {
        question: "Muss ich teure Geraete kaufen, um gut anzubauen?",
        answer: "Nein. Entscheidend ist die SOP-Konsistenz, nicht die Ausruestung. Guenstige Sensoren mit zuverlaussigem Logging schlagen teure Einzelgeraete."
      },
      {
        question: "Wie oft sollte ich mich um die Pflanzen kuemmern?",
        answer: "Das haengt vom Setup ab. Wichtig ist die Frequenz und Konsistenz: taegliche Beobachtung + woechtliche Messung + monatliche Analyse nach SOP."
      }
    ],
    glossary: [
      {
        term: "VPD",
        definition: "Vapor Pressure Deficit - die Trocknungskraft der Luft, bestimmt durch Temperatur und Luftfeuchte."
      },
      {
        term: "PPFD",
        definition: "Photosynthetic Photon Flux Density - Lichtintensitaet in Photonen pro Quadratmeter."
      },
      {
        term: "EC",
        definition: "Electrical Conductivity - Salzgehalt der Naehrlosung, Indikator fuer verfuegbare Naehrstoffe."
      }
    ],
    sourceIds: ["horticulture-research-cannabis-cultivation", "plant-physiology-vpd-transpiration", "astm-d37-cannabis", "postharvest-biology-technology-curing"],
    relatedSlugs: ["vpd-einfach-erklaert", "wasseraktivitaet-und-curing", "coa-richtig-lesen"]
  },
  {
    slug: "vpd-einfach-erklaert",
    title: "VPD einfach erklaert",
    summary: "Was das Dampfdruckdefizit bedeutet und wie es Wachstum, Transpiration und Schimmelrisiko steuert.",
    category: "werkzeuge",
    difficulty: "einsteiger",
    readMinutes: 6,
    lastUpdated: "2026-03-26",
    tags: ["VPD", "Klima", "Transpiration", "Schimmel"],
    keyTakeaways: [
      "VPD ist die Trocknungskraft der Luft und sollte in Phase-zentrierten Bereichen gesteuert werden.",
      "Blatttemperatur verschiebt den effektiven VPD stark und darf nicht ignoriert werden.",
      "Zu niedriger VPD kann pathogene Fenster oeffnen, zu hoher VPD stresst Pflanzen schnell."
    ],
    quickFacts: [
      { label: "Messbasis", value: "Raumtemp + RH + Blatttemp" },
      { label: "Typischer Fehler", value: "Nur Raumwert ohne Blattkorrektur" },
      { label: "Tool", value: "VPD-Rechner mit Leaf Offset" }
    ],
    sections: [
      {
        heading: "Warum VPD praktischer als RH allein ist",
        content: [
          "Relative Luftfeuchte ohne Temperaturkontext fuehrt oft zu Fehlentscheidungen.",
          "VPD verbindet Temperatur und Feuchte in einer direkt handlungsorientierten Kennzahl."
        ]
      },
      {
        heading: "Praxisleitfaden",
        content: [
          "Arbeite mit Phase-Profilen (Jungpflanze, Wachstum, Bluete) und teste nur kleine Aenderungen.",
          "Nach jeder Korrektur mindestens 24 Stunden beobachten, bevor erneut eingegriffen wird."
        ],
        checklist: [
          "Sensor-Kalibrierung monatlich pruefen",
          "Leaf-Temp via IR-Messung einbeziehen",
          "Warnschwellen fuer zu trockene/zu feuchte Luft definieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Was ist VPD?",
        text: "VPD ist die Trocknungskraft der Luft. Es kombiniert Temperatur und Feuchte in einer Kennzahl, die direkt beeinflusst, wie schnell Pflanzen transpirieren."
      },
      {
        title: "Kurz erklaert: Warum nicht nur RH?",
        text: "Relative Luftfeuchte ohne Temperaturkontext ist irreführend. Eine 70% RH bei 20°C ist anders als 70% bei 26°C - VPD zeigt den echten Unterschied."
      }
    ],
    faq: [
      {
        question: "Gibt es einen Ideal-VPD?",
        answer: "Nein universellen Idealwert. Je Phase (Jungpflanze, Wachstum, Blüte) are different target ranges. Konsistenza innerhalb dem Bereich ist wichtiger als einzelne Spitzenwerte."
      },
      {
        question: "Wie messe ich VPD richtig?",
        answer: "Nutze Raumtemperatur + Raumfeuchte + Blatttemperatur (IR-Messer). Eine einfache RH/Temp-Kombination ist das Minimum; Leaf-Offset verbessert die Genauigkeit deutlich."
      }
    ],
    glossary: [
      {
        term: "VPD",
        definition: "Vapor Pressure Deficit - describes the drying force of air based on temperature and humidity."
      },
      {
        term: "Blatttemperatur - Offset",
        definition: "Temperaturunterschied zwischen Blatt und Raumluft; wird durch Transpiration und Strahlung beeinflusst."
      },
      {
        term: "Phase-Profil",
        definition: "Spezifische VPD-Zielwerte fuer verschiedene Wachstumsstadien (Keim, Jungpflanze, Wachstum, Bluete)."
      }
    ],
    sourceIds: ["plant-physiology-vpd-transpiration", "astm-d37-cannabis", "horticulture-research-cannabis-cultivation"],
    relatedSlugs: ["cannabis-anbau-grundlagen", "wasseraktivitaet-und-curing"]
  },
  {
    slug: "genetik-und-phaenotyp-selektion",
    title: "Genetik und Phaenotyp-Selektion",
    summary: "Wie du genetische Linien vergleichst, stabile Kandidaten auswaehlst und Drift ueber Generationen vermeidest.",
    category: "genetik",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-03-26",
    tags: ["Genetik", "Pheno-Hunt", "Stabilitaet", "Clones"],
    keyTakeaways: [
      "Selektionsziele muessen vor dem Hunt messbar definiert werden.",
      "Einheitliche Kulturbedingungen sind Pflicht fuer faire Vergleiche.",
      "Mutterpflanzen brauchen Hygiene- und Erneuerungszyklen gegen genetischen Drift."
    ],
    quickFacts: [
      { label: "Zielmetrik", value: "Stabilitaet + Qualitaet + Risiko" },
      { label: "Hunt-Dauer", value: "Mehrere Durchlaeufe sinnvoll" },
      { label: "Dokumentation", value: "ID, Fotos, Laborwerte, Sensorik" }
    ],
    sections: [
      {
        heading: "Vorbereitung eines belastbaren Hunts",
        content: [
          "Lege harte Kriterien fest: Morphologie, Stressresistenz, Aroma, Ertrag und Nachernteverhalten.",
          "Nimm vorab Ausschlussregeln auf, damit Entscheidungen nicht nach Sympathie fallen."
        ]
      },
      {
        heading: "Auswahl und Verifizierung",
        content: [
          "Top-Kandidaten sollten in mindestens einem Bestaetigungsdurchlauf erneut performen.",
          "Nur reproduzierbare Linien sind fuer den operativen Scale sinnvoll."
        ],
        checklist: [
          "Blindvergleich der Kandidaten",
          "Labordaten mit Sensorik korrelieren",
          "Mutterlinien rotieren und Backup-Clone halten"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Was ist ein Pheno-Hunt?",
        text: "Eine systematische Suche nach den besten genetischen Durchsaetzungen unter einheitlichen Bedingungen."
      },
      {
        title: "Kurz erklaert: Warum nicht nur 1 Pflanze?",
        text: "Gene veraendern sich ueber Generationen. Mehrere Durchlaeufe und Backup-Clones sind noetig, um wirklich stabile Kandidaten zu finden."
      }
    ],
    faq: [
      {
        question: "Wie lange dauert ein verantwortungsvoller Hunt?",
        answer: "Minimum 2-3 Cycles. Der erste Hunt findet potentielle Kandidaten, der zweite verifiziert Stabilit­aet und Reproduzierbarkeit."
      },
      {
        question: "Was ist das groesste Fehlerrisiko?",
        answer: "Unterschiedliche Kulturbedingungen pro Pflanze. Das verfaelscht den Vergleich massiv. Identische Bedingungen sind absolute Pflicht."
      }
    ],
    glossary: [
      {
        term: "Pheno-Hunt",
        definition: "Systematischer Durchsatz von Saemlingen oder Klonen unter identischen Bedingungen, um genetische Variation zu explorev."
      },
      {
        term: "Genetischer Drift",
        definition: "Veraenderung von genetischen Merkm­alen ueber mehrere Generationen, oft durch Selektion oder Selbstbestaetbung."
      }      
,
      {
        term: "Clone-Rotation",
        definition: "System, bei dem Mutterpflanzen regelmaessig erneuert werden, um Degeneration zu minimieren."
      }
    ],
    sourceIds: ["genetics-heritable-traits-cannabis", "horticulture-research-cannabis-cultivation", "astm-d37-cannabis"],
    relatedSlugs: ["cannabis-anbau-grundlagen", "terpene-und-wirkprofil"]
  },
  {
    slug: "terpene-und-wirkprofil",
    title: "Terpene und Wirkprofil",
    summary: "Welche Rolle Terpene fuer Aroma und Produktprofil spielen und wie man Marketingclaims sauber von Daten trennt.",
    category: "terpene",
    difficulty: "fortgeschritten",
    readMinutes: 10,
    lastUpdated: "2026-03-26",
    tags: ["Terpene", "GC-MS", "Sensorik", "Profil"],
    keyTakeaways: [
      "Terpene ergaenzen Wirkstoffdaten, ersetzen sie aber nicht.",
      "Probenahme und Lagerung beeinflussen Terpen-Ergebnisse massiv.",
      "Wirkungsbehauptungen brauchen klare Evidenzstufe und Kontext."
    ],
    quickFacts: [
      { label: "Analyse", value: "GC-MS fuer Profiling" },
      { label: "Risiko", value: "Terpenverlust durch Hitze/Oxidation" },
      { label: "Use-Case", value: "Produktdifferenzierung" }
    ],
    sections: [
      {
        heading: "Von Aroma zu Datenmodell",
        content: [
          "Terpenprofile sollten als wiederholbare Datensaetze mit Charge, Datum und Methode gespeichert werden.",
          "Nur so lassen sich Produktionsaenderungen gegen spaetere Qualitaetsabweichungen mappen."
        ]
      },
      {
        heading: "Kommunikation ohne Overclaim",
        content: [
          "Formuliere Effekte als Wahrscheinlichkeiten und nicht als garantierte Wirkungen.",
          "Kombiniere Laborwerte mit Nutzerfeedback, aber trenne subjektive und objektive Befunde strikt."
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Terpene sind nicht Wirkung",
        text: "Terpene beeinflussen das sensorische Profil und koennten Effekte unterstützen, ersetzen aber niemals Laborwerte fuer Cannabinoide oder Kontaminanten."
      },
      {
        title: "Kurz erklaert: Wie werden Terpene gemessen?",
        text: "Hauptsaechlich via GC-MS (Gaschromatographie-Massenspektrometrie). Die genaue Messmethode und Probenbehandlung beeinflussen-Ergebnisse deutlich."
      }
    ],
    faq: [
      {
        question: "Verliere ich Terpene beim Trocknen und Lagern?",
        answer: "Ja, stark. Hitze, Licht und Luftexposition bauen Terpene ab. Kuehle, dunkle, luftdichte Lagerung ist essentiell."
      },
      {
        question: "Kann ich Terpenprofile zwischen Chargen vergleichen?",
        answer: "Nur, wenn gleiche Analyse methoden, Probenzeiten und Lagerungsbedingungen verwendet wurden. Sonst sind die Vergleiche nicht belastbar."
      }
    ],
    glossary: [
      {
        term: "GC-MS",
        definition: "Gaschromatographie-Massenspektrometrie; Standardverfahren zur Identifikation und Quantifizierung von Terpenen."
      },
      {
        term: "Terpen-Profil",
        definition: "Spezifische Zusammensetzung und Menge von Terpenen in einem Cannabis-Produkt, charakteristisch fuer Sorte und Prozess."
      },
      {
        term: "Entourage-Effekt",
        definition: "Hypothese, dass Cannabinoide und Terpene zusammen stärker wirken als isoliert; wissenschaftlich noch begrenzt belegt."
      }
    ],
    sourceIds: ["phytochemistry-cannabinoid-terpen-profile", "nature-postharvest-terpenes", "flavour-fragrance-journal-cannabis-aroma", "analytical-chemistry-terpen-profiling"],
    relatedSlugs: ["coa-richtig-lesen", "hash-typen-vergleichen"]
  },
  {
    slug: "cannabinoide-und-evidenz",
    title: "Cannabinoide und Evidenzlagen",
    summary: "Einordung von THC, CBD und Minor Cannabinoiden mit Fokus auf Studienqualitaet statt Buzzwords.",
    category: "medizin",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-03-26",
    tags: ["THC", "CBD", "CBG", "Evidenz"],
    keyTakeaways: [
      "Nicht jede oft zitierte Aussage ist klinisch robust abgesichert.",
      "Dosis, Kontext und individuelle Faktoren veraendern Effekte deutlich.",
      "Studienqualitaet ist wichtiger als virale Einzelclaims."
    ],
    quickFacts: [
      { label: "Fokus", value: "Evidenzstufen statt Hype" },
      { label: "Bewertung", value: "RCT, Meta-Analyse, Beobachtung" },
      { label: "Praxis", value: "Aufklaerung statt Heilversprechen" }
    ],
    sections: [
      {
        heading: "Evidenz lesen lernen",
        content: [
          "Unterscheide zwischen praeklinischer Evidenz und klinischen Daten am Menschen.",
          "Bewerte immer Endpunkte, Studiendauer, Population und Nebenwirkungen."
        ]
      },
      {
        heading: "Verantwortungsvolle Kommunikation",
        content: [
          "Nutze neutrale Sprache, kennzeichne Unsicherheiten und verweise auf fachliche Beratung.",
          "Vermeide pauschale Heilversprechen bei komplexen Krankheitsbildern."
        ]
      }
    ],
    warnings: ["Dieser Artikel ist kein medizinischer Rat und ersetzt keine aerztliche Beratung."],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Was ist Evidenz?",
        text: "Stufen von schwach (einzelne Fallberichte) bis stark (mehrere große RCT-Studien mit Replikation)."
      },
      {
        title: "Kurz erklaert: Warum klinische Daten wichtiger sind",
        text: "Laborversuche und Tiermodelle sind Hinweise, ersetzen aber nie klinische Studien beim Menschen."
      }
    ],
    faq: [
      {
        question: "Ist CBD wirklich ein Hormon-Regulator?",
        answer: "CBD zeigt in einigen in-vitro und Tiermodellen Effekte, aber Humanstudien sind begrenzt. Vorsicht vor Ueberklaerungen von Labliteratur."
      },
      {
        question: "Schaedigt THC das Gehirn?",
        answer: "Chronischer hoher THC-Konsum in der Adoleszenz hat Assoziationen mit kognitiven Effekten. Erwachsenenkonsum bleibt im Forschungsgrenzbereich."
      }
    ],
    glossary: [
      {
        term: "Endocannabinoid-System",
        definition: "Koerper-interner Signalisierungsweg mit CB1/CB2-Rezeptoren; reguliert Stimmung, Schmerz, Immunfunktion."
      },
      {
        term: "THC",
        definition: "Tetrahydrocannabinol; primaerer psychoaktiver Bestandteil; CB1-Rezeptor-Agonist."
      },
      {
        term: "CBD",
        definition: "Cannabidiol; nicht-psychoaktiv; moduliert CB1/CB2; Fokus vieler medizinischer Forschungen."
      }
    ],
    sourceIds: ["jama-cannabinoid-evidence-2024", "lancet-cannabis-neurology", "nature-neuroscience-cbd-anxiety", "addiction-thc-dependence-2024", "cochrane-cannabis-review-2024"],
    relatedSlugs: ["coa-richtig-lesen", "pgr-und-kontaminanten"]
  },
  {
    slug: "inhalation-vs-edibles",
    title: "Inhalation vs. Edibles: Wirkung und Timing",
    summary: "Vergleich von Aufnahmewegen, Onset-Zeit, Wirkdauer und Risiken fuer bessere Aufklaerung.",
    category: "konsumformen",
    difficulty: "einsteiger",
    readMinutes: 7,
    lastUpdated: "2026-03-26",
    tags: ["Inhalation", "Edibles", "Onset", "Harm Reduction"],
    keyTakeaways: [
      "Onset und Wirkdauer unterscheiden sich stark zwischen Konsumformen.",
      "Gerade bei Edibles ist langsames Dosieren zentral fuer Risikominimierung.",
      "Aufklaerung ueber Zeitverlauf verhindert viele Fehlentscheidungen."
    ],
    quickFacts: [
      { label: "Schneller Onset", value: "Inhalation" },
      { label: "Laengere Wirkdauer", value: "Orale Aufnahme" },
      { label: "Hauptfehler", value: "Zu fruehes Nachdosieren" }
    ],
    sections: [
      {
        heading: "Pharmakokinetik in der Praxis",
        content: [
          "Inhalation wirkt typischerweise schnell, klingt aber frueher ab.",
          "Orale Aufnahme startet spaeter und kann deutlich laenger anhalten."
        ]
      },
      {
        heading: "Sicherheitsprinzipien",
        content: [
          "Setze klare Wartefenster vor Nachdosierung und kombiniere nicht mit Alkohol.",
          "Plane Konsum nur in stabilen Umgebungen ohne unmittelbare Pflichten."
        ],
        checklist: [
          "Niedrig starten",
          "Wartezeit vor Redose einhalten",
          "Keine Teilnahme am Strassenverkehr"
        ]
      }
    ],    simpleExplainers: [
      {
        title: "Kurz erklaert: Bioverfuegbarkeit",
        text: "Wieviel des Wirkstoffs tatsaechlich ins Blut gelangt. Inhalation = schnell + dosis-pulsatil; Edibles = langsam + persistenter."
      },
      {
        title: "Kurz erklaert: First-Pass-Metabolismus",
        text: "Die Leber baut Wirkstoffe ab, bevor sie die Blutbahn erreichen. Bei Edibles passiert das zuerst (orale Route); bei Inhalation wird das teilweise umgangen."
      }
    ],
    faq: [
      {
        question: "Warum wirken Edibles spaeter und laenger als Rauchen?",
        answer: "Verdauung + Leber-Passage dauern 1-2h. Dafuer wirkt die Wirkung intensiver und persistenter als Inhalation."
      },
      {
        question: "Kann ich Dosis-Intensitaet zwischen den Methoden vergleichen?",
        answer: "Nein direkt. Eine 10mg oral muss nicht eine 10mg inhalativ sein - Bioverfuegbarkeit unterscheidet sich um bis zu 3x."
      }
    ],
    glossary: [
      {
        term: "Bioverfuegbarkeit",
        definition: "Prozentsatz eines Wirkstoffs, der tatsaechlich im Koerper wirksam wird; abhaengig von Resorption und Metabolismus."
      },
      {
        term: "Peak-Level",
        definition: "Hoechste Konzentration eines Wirkstoffs im Blut; tritt schneller bei Inhalation auf als bei oraler Aufnahme."
      },
      {
        term: "Half-Life",
        definition: "Zeit, die eine Substanz bis zur Haelfte ihres Ausgangsspiegels im Koerper abgebaut wird."
      }
    ],
    sourceIds: ["pharmaceutical-research-bioavailability", "clinical-pharmacology-thc-cbd-kinetics", "drug-alcohol-dependence-consumption-methods", "nutritional-bioavailability-edibles"],    relatedSlugs: ["pgr-und-kontaminanten", "cannabinoide-und-evidenz"]
  },
  {
    slug: "hash-typen-vergleichen",
    title: "Hash-Typen professionell eingeordnet",
    summary: "Ursprung, Verfahrensfamilien, klassische und moderne Typen sowie klare Systematik: was wirklich zusammengehoert und wie man Qualitaet fachlich bewertet.",
    category: "konzentrate",
    difficulty: "profi",
    readMinutes: 16,
    lastUpdated: "2026-03-26",
    tags: ["Klassifikation", "Dry Sift", "Bubble Hash", "Rosin", "Charas", "Kif", "Qualitaet"],
    keyTakeaways: [
      "Hash sollte zuerst nach Verfahrensfamilien klassifiziert werden: mechanisch, eiswasserbasiert, pressbasiert und loesungsmittelgestuetzt.",
      "Historische Begriffe (z. B. Charas, Kif, Afghan, Lebanese) beschreiben oft Herkunft und Stil, nicht automatisch objektive Qualitaet.",
      "Produktfamilien gehoeren zusammen, wenn sie dieselbe Trennlogik nutzen und im selben Post-Processing weiterverarbeitet werden.",
      "Professionelle Bewertung kombiniert Sensorik, physikalische Parameter, Kontaminantenstatus und Chargenkonsistenz."
    ],
    quickFacts: [
      { label: "Ursprungsregionen", value: "Nordafrika, Levante, Zentral-/Suedasien" },
      { label: "Kernfrage", value: "Verfahrensfamilie vor Marketingname" },
      { label: "Qualitaetsbasis", value: "SOP, Labor, Batch-Konsistenz" }
    ],
    sections: [
      {
        heading: "1) Taxonomie: Welche Hash-Arten gibt es wirklich?",
        content: [
          "Professionell wird Hash zuerst nach Trennprinzip geordnet und erst danach nach Handelsnamen. Das verhindert Verwechslungen zwischen Stilbegriffen und Technik.",
          "Verfahrensfamilien: (A) mechanisch trocken getrennt (Dry Sift/Kief), (B) eiswasserbasiert getrennt (Ice Water/Bubble), (C) hand- oder pressbasiert verdichtet (z. B. Charas, klassischer Presshash), (D) loesungsmittelbasierte Extrakte mit optionaler Weiterverarbeitung zu hash-aehnlichen Endformen.",
          "Was gehoert zusammen: Dry Sift und traditionelle Kief-Linien sind eine Familie; Bubble und daraus gepresste Rosin-Linien sind eine zweite Familie; historische Presshash-Stile bilden eine kultur- und prozesshistorische Gruppe."
        ]
      },
      {
        heading: "2) Historischer Ursprung und regionale Stilbegriffe",
        content: [
          "Historisch entstanden verschiedene Hash-Kulturen in unterschiedlichen Regionen mit eigenen Rohwaren, Klimabedingungen und Presstechniken.",
          "Nordafrika ist eng mit Kief-/Siebtraditionen verbunden; in Teilen Zentral- und Suedasiens sind handgeriebene und gepresste Formen historisch praegend; in der Levante entwickelten sich eigene Presshash-Stile mit spezifischer Reifung und Marktlogik.",
          "Wichtig: Regionenamen sind Stilmarker, aber keine automatische Garantie fuer Reinheit, Potenz oder Sicherheitsprofil."
        ]
      },
      {
        heading: "3) Verfahrensfamilien im professionellen Vergleich",
        content: [
          "Dry Sift/Kief: trocken-mechanische Trennung. Staerken liegen in klarer Prozesslogik und guter Skalierbarkeit, Risiken liegen in Verunreinigung durch Pflanzenreste bei ungenauer Fraktionierung.",
          "Ice Water/Bubble: nasskalte Trennung. Staerken sind hohe Reinheitsfenster bei sauberer Prozessfuehrung; kritische Punkte sind Trocknungsmanagement, Wasseraktivitaet und mikrobiologische Stabilitaet.",
          "Presshash/Traditionsstile: Verdichtung und Reifung sind zentrale Faktoren. Ergebnisqualitaet haengt stark von Ausgangsfraktion, Druck-/Waermeprofil und Lagerregime ab.",
          "Rosin-Linien: loesungsmittelfreie Press-Weiterverarbeitung von geeigneten Vorprodukten. Qualitaet wird von Input-Material und thermischer Belastung begrenzt.",
          "Loesungsmittelgestuetzte Extrakte: eigene Produktklasse; fuer Vergleich mit klassischem Hash muessen Restloesungsmittel- und Reinheitsdaten zwingend betrachtet werden."
        ]
      },
      {
        heading: "4) Welche Begriffe werden haeufig verwechselt?",
        content: [
          "Kief ist nicht automatisch fertiger Presshash; Bubble ist nicht automatisch Rosin; Rosin ist ein Endprodukt aus geeigneten Vorstufen, keine Herkunftsbezeichnung.",
          "" +
            "'Full melt', '6 star', 'premium'" +
            " sind Marktbegriffe und sollten stets gegen objektive Messwerte (z. B. Kontaminantenstatus, Wasseraktivitaet, Chargenvergleich) gespiegelt werden.",
          "'Old school' vs. 'modern' beschreibt oft Verarbeitungskultur und Zielprofil, nicht zwingend Sicherheits- oder Qualitaetsniveau."
        ]
      },
      {
        heading: "5) Professionelle Bewertungsmatrix",
        content: [
          "Sensorik: Klarheit der Aromen, Fremdnoten, Oxidationshinweise, konsistente Chargencharakteristik.",
          "Physikalik: Homogenitaet, Trennverhalten bei definierter Temperatur, Stabilitaet in Lagerung und Transport.",
          "Analytik: Cannabinoid-/Terpenprofil, Kontaminanten, mikrobiologische Parameter, ggf. Restloesungsmittel in relevanten Klassen.",
          "Prozessqualitaet: SOP-Reifegrad, Rueckverfolgbarkeit, Reklamationsquote und Batch-to-Batch-Abweichung."
        ],
        checklist: [
          "Jede Charge mit eindeutiger ID und Herkunftsdokumentation",
          "COA-Pruefung inkl. Datum, Methode und Nachweisgrenzen",
          "Lager- und Transportbedingungen pro Batch protokollieren",
          "Abweichungen aus Sensorik und Labor im CAPA-Prozess nachhalten"
        ]
      },
      {
        heading: "6) Praktische Einordnung fuer Plattformen und Einkauf",
        content: [
          "Baue Kataloge nicht nur nach Handelsnamen auf, sondern nach Verfahrensfamilien und Qualitaetskriterien. Das erleichtert Vergleichbarkeit und Aufklaerung.",
          "Trenne Produktstory (Herkunft, Stil, Kultur) sauber von Compliance- und Sicherheitsdaten.",
          "Nutze einheitliche Datenfelder fuer jede Hash-Klasse, damit Nutzer und Teams Konsistenz statt Einzelfallwissen erhalten."
        ],
        checklist: [
          "Verfahrensfamilie als Pflichtfeld im Datenmodell",
          "Herkunft/Stil als separates Feld, nicht als Qualitaetslabel",
          "Einheitliche Mindestdaten fuer alle Konzentratklassen"
        ]
      }
    ],
    warnings: [
      "Detaillierte Herstellungsanleitungen werden hier bewusst nicht bereitgestellt; Fokus liegt auf Einordnung, Qualitaetsmanagement und Risikoaufklaerung.",
      "Regionale Rechtslage und regulatorische Anforderungen sind vor jeder operativen Umsetzung separat zu pruefen."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Was ist Hash?",
        text: "Hash ist ein Sammelbegriff fuer konzentrierte Harzprodukte aus Cannabis. Entscheidend ist nicht der Name, sondern wie getrennt, verarbeitet und stabilisiert wurde."
      },
      {
        title: "Kurz erklaert: Was gehoert zusammen?",
        text: "Produkte gehoeren zusammen, wenn sie dieselbe Trennlogik verwenden oder aus derselben Vorstufe hervorgehen, etwa Bubble als Vorstufe fuer bestimmte Rosin-Linien."
      },
      {
        title: "Kurz erklaert: Wo passieren Fehlbewertungen?",
        text: "Wenn Stilbegriffe oder Herkunft als Qualitaetsbeweis genutzt werden und Labor- sowie Prozessdaten fehlen."
      }
    ],
    faq: [
      {
        question: "Ist jeder traditionelle Hash automatisch hochwertig?",
        answer: "Nein. Traditionelle Herkunft ist kulturhistorisch relevant, sagt aber ohne Analytik und Prozessnachweise wenig ueber aktuelle Sicherheits- und Qualitaetsniveaus aus."
      },
      {
        question: "Ist Rosin immer besser als klassischer Presshash?",
        answer: "Nicht pauschal. Rosin hat eigene Staerken, aber Endqualitaet bleibt vom Input-Material, der Prozessfuehrung und der Stabilitaet nach Verarbeitung abhaengig."
      },
      {
        question: "Was ist fuer professionelle Vergleiche am wichtigsten?",
        answer: "Eine einheitliche Bewertungsmatrix aus Sensorik, Analytik, Stabilitaet und Chargenkonsistenz statt einzelner Marketingwerte."
      }
    ],
    glossary: [
      {
        term: "Verfahrensfamilie",
        definition: "Technische Hauptgruppe nach Trennprinzip, z. B. trocken-mechanisch oder eiswasserbasiert."
      },
      {
        term: "Batch-Konsistenz",
        definition: "Grad, in dem aufeinanderfolgende Chargen vergleichbare Qualitaets- und Sicherheitsmerkmale aufweisen."
      },
      {
        term: "Post-Processing",
        definition: "Nachgelagerte Verarbeitungsschritte wie Pressen, Stabilisieren oder Reifung nach der initialen Trennung."
      }
    ],
    sourceIds: [
      "emcdda-cannabis-profiles-2025",
      "astm-cannabis-committee-d37",
      "aoac-lab-methods",
      "iso17025",
      "nature-postharvest-cannabis"
    ],
    relatedSlugs: ["wasseraktivitaet-und-curing", "coa-richtig-lesen", "terpene-und-wirkprofil"]
  },
  {
    slug: "wasseraktivitaet-und-curing",
    title: "Wasseraktivitaet und Curing",
    summary: "Warum aw-Werte fuer Stabilitaet, Aromaerhalt und mikrobiologische Sicherheit entscheidend sind.",
    category: "qualitaet",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-03-26",
    tags: ["Curing", "aw", "Lagerung", "Mikrobiologie"],
    keyTakeaways: [
      "Wasseraktivitaet ist ein zentraler Sicherheitsparameter nach der Ernte.",
      "Falsche Curing-Routinen zerstoeren Aromaprofile und erhoehen Kontaminationsrisiken.",
      "Messbare SOPs schlagen subjektives Fuehlen im Glas deutlich."
    ],
    quickFacts: [
      { label: "Kernmetrik", value: "aw statt nur RH" },
      { label: "Risiko", value: "Mikrobieller Aufwuchs" },
      { label: "Prozess", value: "Stufenweise Trocknung + Curing" }
    ],
    sections: [
      {
        heading: "Nachernte als Qualitaetshebel",
        content: [
          "Curing ist kein kosmetischer Schritt, sondern ein kritischer Teil des Qualitaetsmanagements.",
          "Ein fehlerhafter Ablauf kann zuvor gute Ernten stark entwerten."
        ]
      },
      {
        heading: "Operative Umsetzung",
        content: [
          "Arbeite mit fixen Messintervallen, Chargenkennzeichnung und klaren Grenzwerten fuer Nachjustierungen.",
          "Dokumentiere Auffaelligkeiten frueh, um spaetere Reklamationen nachvollziehen zu koennen."
        ],
        checklist: [
          "Charge eindeutig labeln",
          "aw und Temperatur protokollieren",
          "Abweichungen mit Korrekturmassnahme verknuepfen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Wassektivitaet (aw)",
        text: "Freies Wasser, das Mikroben verfuegbar ist. Low aw = schimmelresistent + langlebig; hohe aw = Schimmel-Risiko + schneller Verderb."
      },
      {
        title: "Kurz erklaert: Warum Curing wichtig ist",
        text: "Beim Curing wird zusaetzliche Feuchte entfernt, Chlorophyll wird abgebaut (besserer Geschmack) und das Endocannabinoid-Profil stabilisiert sich."
      }
    ],
    faq: [
      {
        question: "Welche aw ist sicher?",
        answer: "unter 0.65 aw = langzeitstabil; 0.65-0.75 = neutral; ueber 0.75 = Schimmelrisiko. Normen (ISO/AOAC) empfehlen unter 0.70 fuer Cannabis."
      },
      {
        question: "Wie lange sollte ich curen?",
        answer: "Mindestens 2-4 Wochen in Glasbeh\u00e4ltern mit 62% RH. Laenger als 8 Wochen bringt minimal Vorzuege, erhoeht aber Schimmelrisiko."
      }
    ],
    glossary: [
      {
        term: "Wassaktivitaet (aw)",
        definition: "Relative Feuchte, die im Koerner mit der Umgebungsfeuchte im Gleichgewicht steht; kritisch fuer Haltbarkeit und Mikrob-Wachstum."
      },
      {
        term: "Curing",
        definition: "Kontrollierte Feuchte-Reduktion nach Trocknung; verbessert Geschmack, Aroma und Haltbarkeit."
      },
      {
        term: "Chlorophyll",
        definition: "Gruener Farbstoff; wird beim Curing abgebaut, was zu besserem Geschmack und hellerer Farbe fuehrt."
      }
    ],
    sourceIds: ["food-control-water-activity-microbiology", "postharvest-biology-technology-curing", "applied-microbiology-fungal-contamination"],
    relatedSlugs: ["hash-typen-vergleichen", "coa-richtig-lesen", "pgr-und-kontaminanten"]
  },
  {
    slug: "coa-richtig-lesen",
    title: "COA richtig lesen",
    summary: "So interpretierst du Laborberichte zu Potenz, Terpenen und Kontaminanten ohne in Marketingfallen zu tappen.",
    category: "qualitaet",
    difficulty: "einsteiger",
    readMinutes: 7,
    lastUpdated: "2026-03-26",
    tags: ["COA", "Labor", "Kontaminanten", "Grenzwerte"],
    keyTakeaways: [
      "Ein gutes COA ist chargenspezifisch, aktuell und methodisch nachvollziehbar.",
      "Potenz alleine reicht nicht fuer Qualitaetsaussagen.",
      "Grenzwerte und Nachweisgrenzen muessen im Kontext gelesen werden."
    ],
    quickFacts: [
      { label: "Pflichtfelder", value: "Charge, Datum, Methode" },
      { label: "Achte auf", value: "LOQ/LOD und Einheiten" },
      { label: "Warnsignal", value: "Unvollstaendige Kontaminantenliste" }
    ],
    sections: [
      {
        heading: "COA-Basischeck",
        content: [
          "Pruefe zuerst Identitaet der Probe und Laborakkreditierung.",
          "Ohne diese Basis ist die restliche Interpretation unsicher."
        ],
        checklist: [
          "Chargennummer identisch zur Ware",
          "Aktuelles Analysedatum",
          "Methoden und Einheiten klar ausgewiesen"
        ]
      },
      {
        heading: "Kontaminanten richtig einordnen",
        content: [
          "Rueckstaende muessen gegen lokale Grenzwerte und Messunsicherheit bewertet werden.",
          "Einzelne unkritische Werte sind anders zu lesen als systematische Auffaelligkeiten."
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Was ist eine COA?",
        text: "Certificate of Analysis - ein Labor-Report, der Cannabinoide, Terpene, Kontaminanten und Pestizide in deinem Produkt misst."
      },
      {
        title: "Kurz erklaert: Warum Methoden wichtig sind",
        text: "Gleiche Probe, unterschiedliche Methode = different Ergebnisse. COAs sind nur vergleichbar, wenn die gleichen Standards/Methoden verwendet wurden."
      }
    ],
    faq: [
      {
        question: "Wie erkenne ich eine gute COA?",
        answer: "Pruefe: (1) Lab-Akkreditierung (ISO 17025?), (2) Methoden dokumentiert (GC-MS? HPLC?), (3) Resultat-Unsicherheit angegeben, (4) Signatur des Labor-Direktors."
      },
      {
        question: "Kann eine COA gefaltscht werden?",
        answer: "Ja, leicht. Nur Labore mit unabhaengiger Verifizierung (z.B. Proficiency-Tests) sind vertrauenswuerdig."
      }
    ],
    glossary: [
      {
        term: "COA",
        definition: "Certificate of Analysis; Labor-Report mit Messergebnissen fuer Cannabinoide, Terpene, Kontaminanten und Potenzmittel."
      },
      {
        term: "GC-MS",
        definition: "Gaschromatographie-Massenspektrometrie; Goldstandard fuer Terpene und Volatilanalyse."
      },
      {
        term: "HPLC",
        definition: "High-Performance Liquid Chromatography; besser fuer hitzesensible Compounds wie Cannabinoide und thermale Abbauprodukte."
      }
    ],
    sourceIds: ["journal-chromatography-cannabinoids", "analytical-chemistry-terpen-profiling", "aoac-lab-methods-2024", "iso17025-testing-labs"],
    relatedSlugs: ["pgr-und-kontaminanten", "cannabinoide-und-evidenz"]
  },
  {
    slug: "pgr-und-kontaminanten",
    title: "PGR und Kontaminanten erkennen",
    summary: "Worauf Verbraucher achten sollten und welche Laborwerte fuer sichere Entscheidungen relevant sind.",
    category: "sicherheit",
    difficulty: "einsteiger",
    readMinutes: 6,
    lastUpdated: "2026-03-26",
    tags: ["PGR", "Rueckstaende", "COA", "Risiko"],
    keyTakeaways: [
      "Sicherheit beginnt bei transparenter Lieferkette und nachvollziehbaren Laborberichten.",
      "Auffaellige Optik kann ein Hinweis sein, ersetzt aber keine Analytik.",
      "Risikokommunikation muss konkret und messbar sein."
    ],
    quickFacts: [
      { label: "Primare Pruefung", value: "COA + Chargenbezug" },
      { label: "Haeufige Luecke", value: "Keine aktuellen Rueckstandsdaten" },
      { label: "Best Practice", value: "Regelmaessige Lieferanten-Audits" }
    ],
    sections: [
      {
        heading: "Von der Beobachtung zur Bewertung",
        content: [
          "Verlasse dich nicht nur auf Geruch oder Dichte der Blueten.",
          "Sicherheitsurteile sollten auf Laborwerten, Historie und Prozessdaten beruhen."
        ]
      },
      {
        heading: "Risikomanagement im Alltag",
        content: [
          "Baue Sperrlogik fuer auffaellige Chargen in den operativen Ablauf ein.",
          "Kommuniziere transparent, warum Produkte zurueckgehalten oder nachgetestet werden."
        ]
      }
    ],
    warnings: ["Keine Analyse, keine Freigabe: ohne belastbare Daten sollte keine Charge in Umlauf gehen."],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Was sind PGR?",
        text: "Plant Growth Regulator - Stoffe, die Wachstum und Bloete kuenstlich manipulieren. Viele sind in der EU/CH nicht zugelassen."
      },
      {
        title: "Kurz erklaert: Warum Sicherheit?",
        text: "PGR und Pestizide sind akute Risiken. Produktsicherheit beginnt mit Lieferkette-Transparenz und Labor-Freigabe."
      }
    ],
    faq: [
      {
        question: "Wie erkenne ich PGR-Belaestigung ohne Labor?",
        answer: "Normalerweise nicht sicher. Aeusserlich koennen unrealistische Dichten, extreme Feuchte-Verhaeltnisse oder Geruchsverfremdungen Hinweise sein - ersetzen aber keine Analytik."
      },
      {
        question: "Welche Kontaminanten sind kritisch?",
        answer: "Prioritaet: Pestizide, Pilzgifte und Schwer-Metalle. Dann: Lachgas, PGRs, Loesungsmittelreste. Labore sollten priorisiert nach lokalen Grenzwerten testen."
      }
    ],
    glossary: [
      {
        term: "PGR",
        definition: "Plant Growth Regulator - kuenstliche Stoffe zur Wachstum- und Ertrag-Manipulation."
      },
      {
        term: "Pestizid-Klassen",
        definition: "Insektizide, Fungizide, Herbizide und weitere - je Region unterschiedlich reguliert."
      },
      {
        term: "Nachweisgrenzen",
        definition: "Untere Erkennungsschwelle eines Labors; LOQ = Quantifizierungsgrenze, LOD = Nachweisgrenze."
      }
    ],
    sourceIds: ["applied-microbiology-fungal-contamination", "food-control-water-activity-microbiology", "journal-food-protection-pgr-pesticides", "toxicology-heavy-metals-cannabis"],
    relatedSlugs: ["coa-richtig-lesen", "wasseraktivitaet-und-curing"]
  },
  {
    slug: "rechtliche-grundlagen-dach",
    title: "Rechtliche Grundlagen im DACH-Raum",
    summary: "Ueberblick zu Regelungslogik, Nachweispflichten und typischen Compliance-Fehlern.",
    category: "recht",
    difficulty: "einsteiger",
    readMinutes: 8,
    lastUpdated: "2026-03-26",
    tags: ["Recht", "DACH", "Compliance", "Dokumentation"],
    keyTakeaways: [
      "Rechtliche Anforderungen unterscheiden sich je Region und Nutzungsfall deutlich.",
      "Dokumentationspflichten sind operativ genauso wichtig wie Produktqualitaet.",
      "Fruehe Compliance-Pruefungen senken spaetere Kosten und Risiken."
    ],
    quickFacts: [
      { label: "Kernprinzip", value: "Regional differenziert arbeiten" },
      { label: "Risiko", value: "Fehlende Nachweise" },
      { label: "Empfehlung", value: "Regelupdate-Routine etablieren" }
    ],
    sections: [
      {
        heading: "Compliance als Prozess",
        content: [
          "Rechtssicherheit ist kein einmaliges Projekt, sondern ein laufender Anpassungsprozess.",
          "Halte Verantwortlichkeiten, Fristen und Eskalationswege schriftlich fest."
        ]
      },
      {
        heading: "Typische Fehler vermeiden",
        content: [
          "Viele Probleme entstehen durch uneinheitliche Dokumentation und unklare Rollen.",
          "Nutze standardisierte Freigabe-Checklisten fuer Kommunikation und Produkte."
        ],
        checklist: [
          "Monatliches Regelmonitoring",
          "Freigabeprozess mit Vier-Augen-Prinzip",
          "Archivierung relevanter Nachweise"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Regelungslogik",
        text: "DE, AT, CH haben unterschiedliche Gesetze. Cannabis ist je Kontext (medizinisch, Beratung, Forschung) anders geregelt."
      },
      {
        title: "Kurz erklaert: Dokumentation zaehlt",
        text: "Rechtssicherheit entsteht nicht durch gutes Produkt allein, sondern durch sichere Nachweise: Herkunft, Labor, Freigaben."
      }
    ],
    faq: [
      {
        question: "Was ist fuer Compliance essentiell?",
        answer: "Je Land: Registrierung, COA-Anforderungen, Verpackungsrichtlinien, Werbeverbot und Lagerdokumentation. Das variiert stark - lokal pruefung ist Pflicht."
      },
      {
        question: "Was ist der groesste Fehler?",
        answer: "Annahme, dass einmalige Compliance-Pruefung ausreicht. Gesetze aendern sich. Regelupdates muessen zyklisch sein."
      }
    ],
    glossary: [
      {
        term: "BtMG (DE)",
        definition: "Bestaetubungsmittelgesetz; regelt Anbau, Besitz, Handel von Cannabis in Deutschland."
      },
      {
        term: "Nachweispflicht",
        definition: "Verpflichtung, Compliance und Sicherheit durch Dokumentation zu belegen."
      },
      {
        term: "Vier-Augen-Prinzip",
        definition: "Dual-Approval fuer kritische Entscheidungen; erhoert Dokumentationsqualitaet und Rechtssicherheit."
      }
    ],
    sourceIds: ["bfarm-german-cannabis-guidelines", "swissmedic-cannabis-requirements", "ages-austria-cannabis-standards", "ema-good-manufacturing-practice", "codex-food-hygiene-2022"],
    relatedSlugs: ["markttransparenz-und-preise", "coa-richtig-lesen"]
  },
  {
    slug: "markttransparenz-und-preise",
    title: "Markttransparenz und Preislogik",
    summary: "Wie sich Preis, Qualitaet, Risiko und Verfuegbarkeit in realen Maerkten gegenseitig beeinflussen.",
    category: "markt",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-03-26",
    tags: ["Markt", "Preisbildung", "Qualitaet", "Supply"],
    keyTakeaways: [
      "Niedrige Preise ohne Datenbasis korrelieren oft mit hoeheren Qualitaetsrisiken.",
      "Transparenz ueber Herkunft und Analyse reduziert Informationsasymmetrie.",
      "Marktdaten sollten lokal segmentiert statt pauschal interpretiert werden."
    ],
    quickFacts: [
      { label: "Treiber", value: "Supply, Risiko, Compliance-Kosten" },
      { label: "Signal", value: "Preis ohne Nachweis = Warnflag" },
      { label: "Strategie", value: "Qualitaetskorridor statt Billigstpreis" }
    ],
    sections: [
      {
        heading: "Preis ist ein Systemsignal",
        content: [
          "Preis alleine sagt wenig. Erst in Verbindung mit COA, Chargenhistorie und Lieferzuverlaessigkeit entsteht ein valider Vergleich.",
          "Fuer Nutzer ist eine klare Risiko-Nutzen-Kommunikation entscheidend."
        ]
      },
      {
        heading: "Operative Umsetzung fuer Plattformen",
        content: [
          "Lege Mindestkriterien fuer Datenqualitaet fest und stufe Anbieter nach Nachweisqualitaet.",
          "Damit wird Wettbewerb ueber Transparenz statt nur ueber Preis gefoerdert."
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Informationsasymmetrie",
        text: "Kaeufer kennt nicht die teuren Qualitaets- und Compliance-Prozesse. Niedriger Preis ohne Nachweis ist daher fast immer ein Warnsignal."
      },
      {
        title: "Kurz erklaert: Supply schlaegt Demand",
        text: "Verknappung treibt Preise hoch. Transparente Lieferketten stabilisieren Preise und reduzieren Spekulation."
      }
    ],
    faq: [
      {
        question: "Ist hoher Preis = bessere Qualitaet?",
        answer: "Nicht automatisch. Hoher Preis kann auch Monopol oder Hype sein. Preis + Transparenz + Konsistenz = echte Qualitaetsindikation."
      },
      {
        question: "Wie erkenne ich unfaire Preise?",
        answer: "Vergleiche Preis mit: verfuegbare Analyse (COA), Lieferrantz, Rueckverfolgbarkeit und Reklamationsquote von anderen Zellen. Isolation = Lack of Trust."
      }
    ],
    glossary: [
      {
        term: "Marktpreisbildung",
        definition: "Preis entsteht durch Angebot, Nachfrage, Risiko und operative Kosten."
      },
      {
        term: "Informationsasymmetrie",
        definition: "Kaeufer und Verkaeufer haben unterschiedliche Information ueber Qualitaet und Risiko."
      },
      {
        term: "Qualitaetskorridor",
        definition: "Bereich von idealem unterbunden- bis obergebuenden Preis fuer definierte Qualitaetsstandards."
      }
    ],
    sourceIds: ["emcdda-cannabis-profiles-2025", "unodc-world-drug-report-2025", "who-cannabis-2024"],
    relatedSlugs: ["coa-richtig-lesen", "rechtliche-grundlagen-dach"]
  },
  {
    slug: "vpd-und-ec-kombi-rechner-guide",
    title: "VPD- und EC-Kombi-Guide",
    summary: "Wie Klima- und Naehrstoffsteuerung gemeinsam optimiert werden, statt isolierte Einzelwerte zu verfolgen.",
    category: "werkzeuge",
    difficulty: "profi",
    readMinutes: 10,
    lastUpdated: "2026-03-26",
    tags: ["VPD", "EC", "Steuerung", "Regelkreis"],
    keyTakeaways: [
      "Klima- und Naehrstoffparameter sollten in einem gemeinsamen Regelkreis gefuehrt werden.",
      "EC-Anpassungen ohne Blick auf Transpiration fuehren oft zu Fehlsteuerungen.",
      "Ein Dashboard mit Alarmgrenzen reduziert manuelle Reaktionszeit deutlich."
    ],
    quickFacts: [
      { label: "Niveau", value: "Prozessoptimierung" },
      { label: "Noetig", value: "Konsistente Sensordaten" },
      { label: "Outcome", value: "Stabilere Qualitaet pro Charge" }
    ],
    sections: [
      {
        heading: "Regelstrategie aufbauen",
        content: [
          "Definiere Prioritaeten: zuerst Klimastabilitaet, dann Naehrstofffeinsteuerung.",
          "Nutze Trenddaten statt Einzelmesspunkte fuer Entscheidungen."
        ]
      },
      {
        heading: "Monitoring und Alarmierung",
        content: [
          "Lege harte Alert-Level fuer VPD-Drift, EC-Ausreisser und Temperaturspruenge fest.",
          "Verknuepfe jeden Alarm mit klarer Reaktionsanweisung fuer das Team."
        ],
        checklist: [
          "Alarmmatrix dokumentiert",
          "Escalation Owner benannt",
          "Monatlicher Review der Schwellenwerte"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Warum Kombi?",
        text: "VPD steuert die Transpirationsrate, EC bestimmt, was die Pflanze verfuegbar hat. Together sind sie ein System, getrennt nur Einzeloptimierungen."
      },
      {
        title: "Kurz erklaert: Warum nicht nur manuell?",
        text: "Pflanzen aendern Ansprueche staendig (Wachstum, Stress, Reife). Automatisierte Regeln mit menschlichem Overlay reduzieren Fehler und Reaktionszeit."
      }
    ],
    faq: [
      {
        question: "Was ist die richtige EC, wenn VPD hoch ist?",
        answer: "Wenn VPD sehr trockne ist, reduzieren oft ihre Wasser-Aufnahme. Dann ist EC wichtig, um Viskositaet zu erhalten, nicht zu erhoehen. Logik: erst VPD, dann EC tuning."
      },
      {
        question: "Brauche ich teure Sensoren?",
        answer: "Nein. Konsistente billige Sensoren schlagen teure unbkalibrierte. Kalibrierung und Datenlogik sind wichtiger als Geraeteklasse."
      }
    ],
    glossary: [
      {
        term: "VPD\",",
        definition: "Vapor Pressure Deficit - Trocknungskraft, die Transpirationrate steuert."
      },
      {
        term: "EC\",",
        definition: "Electrical Conductivity - Salzgehalt und verfuegbare Naehrstoffe in der Losung."
      },
      {
        term: "Alert-Level\",",
        definition: "Schwellenwerte fuer automatische Alarme und Systeminterventionen."
      }
    ],
    sourceIds: ["plant-physiology-vpd-transpiration", "horticulture-research-cannabis-cultivation", "astm-d37-cannabis"],
    relatedSlugs: ["vpd-einfach-erklaert", "cannabis-anbau-grundlagen"]
  },
];

export const getArticleBySlug = (slug: string) =>
  wikiArticles.find((article) => article.slug === slug);

export const getArticlesByCategory = (category: TerpiraCategory) =>
  wikiArticles.filter((article) => article.category === category);

export const getArticleSources = (article: TerpiraArticle) => {
  const sourceIds = article.sourceIds && article.sourceIds.length > 0
    ? article.sourceIds
    : defaultSourceIdsByCategory[article.category];

  return sourceIds
    .map((id) => sourceRegister.find((source) => source.id === id))
    .filter((source): source is TerpiraSource => Boolean(source));
};
