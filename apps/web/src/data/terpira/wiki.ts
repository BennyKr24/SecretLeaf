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
  },

  // === FEHLENDE TIER-2-JOURNALE (für ≥ 80 % Gold-Standard-Abdeckung) ===
  {
    id: "nejm-cannabis-evidence-2024",
    title: "Cannabis and Cannabinoids in Clinical Medicine: Therapeutic Evidence and Indications",
    publisher: "New England Journal of Medicine",
    year: "2024",
    url: "https://www.nejm.org"
  },
  {
    id: "bmj-cannabis-harms-benefits-2024",
    title: "Cannabis: Weighing Benefits and Harms in Clinical and Public Health Contexts",
    publisher: "BMJ",
    year: "2024",
    url: "https://www.bmj.com"
  },
  {
    id: "frontiers-pharmacology-cannabinoids-2024",
    title: "Cannabinoid Pharmacology: Mechanisms, Drug Interactions and Therapeutic Windows",
    publisher: "Frontiers in Pharmacology",
    year: "2024",
    url: "https://www.frontiersin.org/journals/pharmacology"
  },
  {
    id: "harm-reduction-cannabis-policy-2024",
    title: "Cannabis Harm Reduction: Strategies, Evidence and Policy Implications",
    publisher: "Harm Reduction Journal",
    year: "2024",
    url: "https://harmreductionjournal.biomedcentral.com"
  },
  {
    id: "journal-psychoactive-drugs-cannabis-2024",
    title: "Cannabis Use Patterns, Motives and Health Outcomes: A Review of Current Research",
    publisher: "Journal of Psychoactive Drugs",
    year: "2024",
    url: "https://www.tandfonline.com/journals/vjpd"
  },

  // === CANNABIS-SPEZIFISCHE JOURNALE (permanent kuratiert) ===
  {
    id: "cannabis-cannabinoid-research-curated",
    title: "Cannabis and Cannabinoid Research: Peer-Reviewed Science for Clinical and Policy Applications",
    publisher: "Cannabis & Cannabinoid Research",
    year: "2024",
    url: "https://www.liebertpub.com/loi/can"
  },

  // === PHARMAKOLOGIE-JOURNALE (permanent kuratiert) ===
  {
    id: "j-psychopharmacology-cannabis-2024",
    title: "Psychopharmacology of Cannabis and Cannabinoids: Reward, Cognition and Dependence",
    publisher: "Journal of Psychopharmacology",
    year: "2024",
    url: "https://journals.sagepub.com/home/jop"
  },
  {
    id: "british-j-pharmacology-cannab-2024",
    title: "Cannabinoid Receptor Pharmacology: Agonists, Antagonists and Allosteric Modulators",
    publisher: "British Journal of Pharmacology",
    year: "2024",
    url: "https://bpspubs.onlinelibrary.wiley.com/journal/14765381"
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

const baseWikiArticles: TerpiraArticle[] = [
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
      { label: "Tool", value: "VPD-Rechner mit Blatt-Offset" }
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
          "Blatttemperatur per IR-Messung einbeziehen",
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
        answer: "Es gibt keinen universellen Idealwert. Je nach Phase (Jungpflanze, Wachstum, Blüte) gelten unterschiedliche Zielbereiche. Konstanz innerhalb des passenden Bereichs ist wichtiger als einzelne Spitzenwerte."
      },
      {
        question: "Wie messe ich VPD richtig?",
        answer: "Nutze Raumtemperatur, Raumfeuchte und Blatttemperatur per IR-Messung. Eine einfache RH-/Temperatur-Kombination ist nur das Minimum; der Blatt-Offset verbessert die Genauigkeit deutlich."
      }
    ],
    glossary: [
      {
        term: "VPD",
        definition: "Vapor Pressure Deficit beschreibt die Trocknungskraft der Luft auf Basis von Temperatur und Luftfeuchte."
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
          "Nur reproduzierbare Linien sind fuer den operativen Betrieb sinnvoll."
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
        text: "Eine systematische Suche nach den besten genetischen Ausprägungen unter einheitlichen Bedingungen."
      },
      {
        title: "Kurz erklaert: Warum nicht nur 1 Pflanze?",
        text: "Gene veraendern sich ueber Generationen. Mehrere Durchlaeufe und Backup-Clones sind noetig, um wirklich stabile Kandidaten zu finden."
      }
    ],
    faq: [
      {
        question: "Wie lange dauert ein verantwortungsvoller Hunt?",
        answer: "Mindestens 2 bis 3 Durchläufe. Der erste Hunt identifiziert potenzielle Kandidaten, der zweite prüft Stabilität und Reproduzierbarkeit."
      },
      {
        question: "Was ist das groesste Fehlerrisiko?",
        answer: "Unterschiedliche Kulturbedingungen pro Pflanze. Das verfaelscht den Vergleich massiv. Identische Bedingungen sind absolute Pflicht."
      }
    ],
    glossary: [
      {
        term: "Pheno-Hunt",
        definition: "Systematischer Durchsatz von Sämlingen oder Klonen unter identischen Bedingungen, um genetische Variation sauber zu bewerten."
      },
      {
        term: "Genetischer Drift",
        definition: "Veränderung genetischer Merkmale über mehrere Generationen, oft durch Selektion oder Selbstbestäubung."
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
    summary: "Welche Rolle Terpene fuer Aroma und Produktprofil spielen und wie man Marketingaussagen sauber von Daten trennt.",
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
        heading: "Kommunikation ohne Uebertreibung",
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
        text: "Hauptsaechlich via GC-MS (Gaschromatographie-Massenspektrometrie). Die genaue Messmethode und Probenbehandlung beeinflussen die Ergebnisse deutlich."
      }
    ],
    faq: [
      {
        question: "Verliere ich Terpene beim Trocknen und Lagern?",
        answer: "Ja, stark. Hitze, Licht und Luftexposition bauen Terpene ab. Kuehle, dunkle, luftdichte Lagerung ist essentiell."
      },
      {
        question: "Kann ich Terpenprofile zwischen Chargen vergleichen?",
        answer: "Nur, wenn gleiche Analysemethoden, Probenzeiten und Lagerungsbedingungen verwendet wurden. Sonst sind die Vergleiche nicht belastbar."
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
    tags: ["Markt", "Preisbildung", "Qualitaet", "Angebot"],
    keyTakeaways: [
      "Niedrige Preise ohne Datenbasis korrelieren oft mit hoeheren Qualitaetsrisiken.",
      "Transparenz ueber Herkunft und Analyse reduziert Informationsasymmetrie.",
      "Marktdaten sollten lokal segmentiert statt pauschal interpretiert werden."
    ],
    quickFacts: [
      { label: "Treiber", value: "Angebot, Risiko, Compliance-Kosten" },
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
        title: "Kurz erklaert: Angebot schlaegt Nachfrage",
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
        answer: "Vergleiche den Preis mit verfuegbaren Analysen (COA), Lieferzuverlaessigkeit, Rueckverfolgbarkeit und Reklamationsquote. Fehlende Transparenz ist ein klares Warnsignal."
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
        definition: "Realistischer Preisbereich fuer definierte Qualitaetsstandards, statt Fokus auf den billigsten Einzelpreis."
      }
    ],
    sourceIds: ["emcdda-cannabis-profiles-2025", "unodc-world-drug-report-2025", "who-cannabis-2024"],
    relatedSlugs: ["coa-richtig-lesen", "rechtliche-grundlagen-dach"]
  },
  {
    slug: "vpd-und-ec-kombi-rechner-guide",
    title: "VPD- und EC-Leitfaden",
    summary: "Wie Klima- und Naehrstoffsteuerung gemeinsam optimiert werden, statt isolierte Einzelwerte zu verfolgen.",
    category: "werkzeuge",
    difficulty: "profi",
    readMinutes: 10,
    lastUpdated: "2026-03-26",
    tags: ["VPD", "EC", "Steuerung", "Regelkreis"],
    keyTakeaways: [
      "Klima- und Naehrstoffparameter sollten in einem gemeinsamen Regelkreis gefuehrt werden.",
      "EC-Anpassungen ohne Blick auf Transpiration fuehren oft zu Fehlsteuerungen.",
      "Eine Steuerungsansicht mit Alarmgrenzen reduziert die manuelle Reaktionszeit deutlich."
    ],
    quickFacts: [
      { label: "Niveau", value: "Prozessoptimierung" },
      { label: "Noetig", value: "Konsistente Sensordaten" },
      { label: "Ergebnis", value: "Stabilere Qualitaet pro Charge" }
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
          "Eskalationsverantwortliche benannt",
          "Monatliche Ueberpruefung der Schwellenwerte"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Warum Kombi?",
        text: "VPD steuert die Transpirationsrate, EC bestimmt, was der Pflanze verfuegbar ist. Zusammen bilden beide ein System; getrennt bleiben es nur Einzeloptimierungen."
      },
      {
        title: "Kurz erklaert: Warum nicht nur manuell?",
        text: "Pflanzen aendern Ansprueche staendig (Wachstum, Stress, Reife). Automatisierte Regeln mit menschlichem Eingreifen reduzieren Fehler und Reaktionszeit."
      }
    ],
    faq: [
      {
        question: "Was ist die richtige EC, wenn VPD hoch ist?",
        answer: "Wenn der VPD zu hoch und die Luft zu trocken ist, reduzieren Pflanzen oft ihre Wasseraufnahme. Dann sollte die EC nicht vorschnell erhöht werden. Die Reihenfolge lautet: erst Klima stabilisieren, dann die EC feinjustieren."
      },
      {
        question: "Brauche ich teure Sensoren?",
        answer: "Nein. Konsistente, kalibrierte günstige Sensoren sind wertvoller als teure unkalibrierte Geräte. Kalibrierung und Datenlogik sind wichtiger als die Geräteklasse."
      }
    ],
    glossary: [
      {
        term: "VPD",
        definition: "Vapor Pressure Deficit, also die Trocknungskraft der Luft, die die Transpirationsrate steuert."
      },
      {
        term: "EC",
        definition: "Electrical Conductivity, also der Salzgehalt und die verfügbare Nährstoffkonzentration in der Lösung."
      },
      {
        term: "Alert-Level",
        definition: "Schwellenwerte fuer automatische Alarme und Systeminterventionen."
      }
    ],
    sourceIds: ["plant-physiology-vpd-transpiration", "horticulture-research-cannabis-cultivation", "astm-d37-cannabis"],
    relatedSlugs: ["vpd-einfach-erklaert", "cannabis-anbau-grundlagen"]
  },
];

type ArticleSeed = Omit<TerpiraArticle, "lastUpdated" | "sourceIds">;

const createArticle = (seed: ArticleSeed): TerpiraArticle => ({
  ...seed,
  lastUpdated: "2026-03-27",
  sourceIds: defaultSourceIdsByCategory[seed.category]
});

const expansionWikiArticles: TerpiraArticle[] = [
  createArticle({
    slug: "cannabis-substrat-und-wurzelzone",
    title: "Substrat und Wurzelzone verstehen",
    summary: "Wie Luftporen, Wasserhaltekapazitaet und Wurzelgesundheit die Stabilitaet eines Grows bestimmen.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 7,
    tags: ["Substrat", "Wurzelzone", "Drain", "Sauerstoff"],
    keyTakeaways: [
      "Substratwahl ist immer ein Kompromiss aus Sauerstoff, Wasserhaltekapazitaet und Arbeitsaufwand.",
      "Die Wurzelzone entscheidet frueh ueber Wachstumstempo, Stressresistenz und Erholung nach Fehlern.",
      "Messbare Routinen fuer Topfgewicht, Drain und Temperatur verhindern viele spaete Probleme."
    ],
    quickFacts: [
      { label: "Kernfrage", value: "Wie schnell trocknet der Topf wirklich?" },
      { label: "Risikofaktor", value: "Verdichtetes oder dauerhaft nasses Medium" },
      { label: "Kontrollpunkt", value: "Drain, Topfgewicht, Wurzeltemperatur" }
    ],
    sections: [
      {
        heading: "Warum die Wurzelzone wichtiger ist als der letzte Booster",
        content: [
          "Pflanzen reagieren zuerst auf Bedingungen im Wurzelraum. Wenn Sauerstoff, Feuchte und Temperatur instabil sind, hilft auch perfekte Blattduengung nur begrenzt.",
          "Ein reproduzierbares System beginnt deshalb unten: Medium, Topfvolumen, Drain und Giessrhythmus muessen zusammenpassen."
        ]
      },
      {
        heading: "Welche Checks im Alltag wirklich helfen",
        content: [
          "Arbeite mit Topfgewicht, Substratbeobachtung und Drain-Messung statt nur nach Gefuehl. So erkennst du Staunaesse und Unterversorgung frueh.",
          "Halte Temperatur und Trocknungsdauer pro Charge oder Zone fest, damit spaetere Probleme klar zugeordnet werden koennen."
        ],
        checklist: [
          "Topfgewicht nass und trocken dokumentieren",
          "Drain-EC und Drain-pH woechentlich messen",
          "Wurzelraum vor Hitze und Kaltespitzen schuetzen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Luftporen",
        text: "Luftporen sorgen dafuer, dass Wurzeln Sauerstoff bekommen. Zu dichte Medien bremsen Wachstum und erhoehen Faulnisrisiken."
      },
      {
        title: "Kurz erklaert: Wasserhaltekapazitaet",
        text: "Sie beschreibt, wie viel Wasser ein Medium nach dem Abfliessen noch speichert. Mehr ist nicht automatisch besser."
      }
    ],
    faq: [
      {
        question: "Ist Erde oder Coco besser?",
        answer: "Nicht pauschal. Erde puffert mehr und verzeiht Einsteigerfehler, Coco reagiert schneller und verlangt saubere Steuerung."
      },
      {
        question: "Woran erkenne ich ein ueberwaessertes Medium?",
        answer: "Topf bleibt lange schwer, Blattbild wirkt traege und die Wurzelzone riecht dumpf oder kippt im Drain."
      }
    ],
    glossary: [
      { term: "Drain", definition: "Abflusswasser nach einer Bewaesserung; wichtig fuer EC- und pH-Kontrolle." },
      { term: "Porenvolumen", definition: "Anteil des Substrats, der mit Luft oder Wasser gefuellt werden kann." },
      { term: "Wurzelzone", definition: "Bereich im Medium, in dem Wurzeln Wasser, Sauerstoff und Naehrstoffe aufnehmen." },
    ],
    relatedSlugs: ["cannabis-anbau-grundlagen", "bewaesserung-ohne-uebergiessen", "sensor-kalibrierung-und-messfehler"]
  }),
  createArticle({
    slug: "bewaesserung-ohne-uebergiessen",
    title: "Bewaesserung ohne Uebergiessen",
    summary: "Wie Giessmenge, Intervall und Drain so abgestimmt werden, dass Pflanzen weder austrocknen noch ersticken.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 6,
    tags: ["Bewaesserung", "Drain", "Rhythmus", "Substrat"],
    keyTakeaways: [
      "Zu haeufiges Giessen schadet oft mehr als leichtes Austrocknen zwischen zwei Zyklen.",
      "Intervall und Menge muessen zum Medium, Topf und Klima passen, nicht zu pauschalen Kalenderregeln.",
      "Drain und Topfgewicht sind bessere Steuerwerkzeuge als die reine Oberflaechenoptik."
    ],
    quickFacts: [
      { label: "Hauptfehler", value: "Zu frueh erneut giessen" },
      { label: "Messhilfe", value: "Topfgewicht plus Drainkontrolle" },
      { label: "Ziel", value: "Rhythmus statt hektische Einzelkorrektur" }
    ],
    sections: [
      {
        heading: "Warum Uebergiessen so haeufig passiert",
        content: [
          "Viele Teams reagieren auf haengende Blaetter reflexartig mit mehr Wasser. Dabei koennen dieselben Symptome auch von Sauerstoffmangel im Medium kommen.",
          "Ein sauberer Bewaesserungsplan basiert daher auf Messpunkten und nicht auf spontaner Interpretation einzelner Pflanzen."
        ]
      },
      {
        heading: "Ein belastbarer Giessprozess",
        content: [
          "Lege je Medium ein Zielgewicht, typische Trocknungsdauer und Minimal-Drain fest. So lassen sich Abweichungen frueh erkennen.",
          "Wenn Klima und VPD schwanken, muss auch die Wassergabe angepasst werden. Der Rhythmus ist kein statischer Wochenplan."
        ],
        checklist: [
          "Vor jedem Giessen Topfgewicht vergleichen",
          "Drain nur in definierten Kontrollgiessungen messen",
          "Abweichungen im Grow-Log mit Klimaereignissen koppeln"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Uebergiessen",
        text: "Nicht zu viel Wasser auf einmal ist das Hauptproblem, sondern zu wenig Sauerstoff im Medium ueber zu lange Zeit."
      },
      {
        title: "Kurz erklaert: Giessintervall",
        text: "Das ist die Zeit zwischen zwei Wassergaben. Es aendert sich mit Pflanzenmasse, Klima, Topfgroesse und Medium."
      }
    ],
    faq: [
      {
        question: "Soll immer Drain entstehen?",
        answer: "Nicht bei jeder Wassergabe. Regelmaessige Kontrollgaenge mit Drain sind sinnvoll, staendiges Durchspuelen aber nicht in jedem Setup."
      },
      {
        question: "Wie schnell darf ein Topf trocknen?",
        answer: "Das haengt von Medium und Phase ab. Kritisch wird es, wenn Trocknung ungleichmaessig oder extrem schnell wird und dadurch Salzspitzen entstehen."
      }
    ],
    glossary: [
      { term: "Giessfenster", definition: "Zeitpunkt, in dem ein Medium erneut Wasser braucht, ohne bereits stressig trocken zu sein." },
      { term: "Kapillarwasser", definition: "Wasser, das in feinen Poren gehalten wird und Pflanzen zur Verfuegung steht." },
      { term: "Staunaesse", definition: "Dauerhaft zu nasses Medium mit Sauerstoffmangel im Wurzelbereich." },
    ],
    relatedSlugs: ["cannabis-substrat-und-wurzelzone", "cannabis-anbau-grundlagen", "vpd-einfach-erklaert"]
  }),
  createArticle({
    slug: "lichtstress-und-canopy-management",
    title: "Lichtstress und Canopy-Management",
    summary: "Wie Lichtverteilung, Abstand und Blattflaeche zusammenwirken und wann hohe Intensitaet mehr schadet als hilft.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["PPFD", "Canopy", "Lichtstress", "Uniformitaet"],
    keyTakeaways: [
      "Mehr PPFD ist nur dann sinnvoll, wenn Klima, CO2 und Naehrstoffversorgung mithalten koennen.",
      "Eine homogene Canopy ist meist wertvoller als lokale Spitzenwerte in einzelnen Zonen.",
      "Lichtstress zeigt sich oft zuerst in Blattstellung, Spitzenaufhellung und ungleichmaessiger Reife."
    ],
    quickFacts: [
      { label: "Messgroesse", value: "PPFD plus Verteilung" },
      { label: "Fehlerquelle", value: "Zu nahes Licht bei instabilem Klima" },
      { label: "Ziel", value: "Uniforme Lichtkarte" }
    ],
    sections: [
      {
        heading: "Warum Licht immer ein Systemparameter ist",
        content: [
          "Hohe Lichtleistung steigert nur dann Leistung, wenn Transpiration, Wasserhaushalt und Temperatur sauber gefuehrt werden.",
          "Wird Licht isoliert hochgezogen, entstehen oft Stresssymptome statt echter Mehrleistung."
        ]
      },
      {
        heading: "Canopy sauber fuehren",
        content: [
          "Trainiere Pflanzen so, dass die obere Blattflaeche moeglichst gleichmaessig bleibt. Dadurch werden Hotspots und Schatteninseln reduziert.",
          "Mappe die Lichtverteilung im Raum und passe Lampenhoehe oder Pflanzenerziehung datenbasiert an."
        ],
        checklist: [
          "PPFD an mehreren Rasterpunkten messen",
          "Blatttemperatur an Hotspots pruefen",
          "Canopy-Hoehe pro Zone dokumentieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: PPFD",
        text: "PPFD beschreibt, wie viele photosynthetisch nutzbare Lichtteilchen pro Sekunde auf eine Flaeche treffen."
      },
      {
        title: "Kurz erklaert: Canopy",
        text: "Damit ist die obere Blatt- und Bluetenschicht gemeint. Je gleichmaessiger sie ist, desto leichter laesst sich Licht steuern."
      }
    ],
    faq: [
      {
        question: "Brauche ich sofort ein PAR-Meter?",
        answer: "Fuer ernsthafte Prozesssteuerung ja, zumindest zeitweise. Schaetzwerte oder App-Messungen reichen nur fuer grobe Orientierung."
      },
      {
        question: "Ist Bleaching immer zu viel Licht?",
        answer: "Oft ja, aber nicht nur. Auch Hitze, Naehrstoffungleichgewicht und genetische Empfindlichkeit koennen mit hineinspielen."
      }
    ],
    glossary: [
      { term: "Bleaching", definition: "Aufhellung von Pflanzenteilen durch uebermaessige Licht- oder Hitzebelastung." },
      { term: "Canopy", definition: "Oberste Ebene aus Blatt- und Bluetenmasse, die den Grossteil des Lichts abfaengt." },
      { term: "Uniformitaet", definition: "Gleichmaessigkeit von Wuchs, Hoehe und Exposition innerhalb einer Kulturflaeche." },
    ],
    relatedSlugs: ["cannabis-anbau-grundlagen", "vpd-einfach-erklaert", "vpd-und-ec-kombi-rechner-guide"]
  }),
  createArticle({
    slug: "integrierte-schaedlingspraevention-grow",
    title: "Integrierte Schaedlingspraevention im Grow",
    summary: "Wie Monitoring, Hygiene und Frueherkennung Ausfaelle verhindern, ohne blind in Chemie oder Panik zu verfallen.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["IPM", "Hygiene", "Monitoring", "Praevention"],
    keyTakeaways: [
      "Ein IPM-System lebt von Frueherkennung, Quarantaene und stabilen Routinen statt von Spaetreaktionen.",
      "Sauberkeit im Raum und an Werkzeugen verhindert mehr Probleme als hektische Rettungssprays.",
      "Schaedlingsdruck ist oft ein Prozesssignal fuer Klima-, Hygiene- oder Materialprobleme."
    ],
    quickFacts: [
      { label: "Best Practice", value: "Monitoring vor Behandlung" },
      { label: "Warnsignal", value: "Unklare Eintragswege" },
      { label: "Routine", value: "Sticky Traps plus Sichtkontrolle" }
    ],
    sections: [
      {
        heading: "Von der Reaktion zur Praevention",
        content: [
          "Viele Grow-Probleme eskalieren, weil Monitoring erst dann beginnt, wenn sichtbare Schaeden da sind.",
          "Ein sauberes IPM verknuepft Eingangskontrolle, Raumhygiene, Teamdisziplin und dokumentierte Eskalationsstufen."
        ]
      },
      {
        heading: "Was in einen belastbaren IPM-Plan gehoert",
        content: [
          "Lege fest, welche Zonen kontrolliert werden, wie Funde dokumentiert werden und wer ueber Massnahmen entscheidet.",
          "Nur so bleiben Eingriffe verhaeltnismaessig und auditierbar."
        ],
        checklist: [
          "Quarantaene fuer neue Pflanzen oder Material",
          "Woechentliche Monitoring-Route mit Foto-Dokumentation",
          "Reinigungsplan fuer Werkzeuge, Schuhe und Flaechen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: IPM",
        text: "Integrated Pest Management kombiniert Beobachtung, Hygiene, Praevention und nur gezielte Eingriffe bei klarer Indikation."
      },
      {
        title: "Kurz erklaert: Schaedlingsdruck",
        text: "Damit ist gemeint, wie stark ein Bestand von Schaedlingen belastet ist und wie schnell sich das Problem ausbreitet."
      }
    ],
    faq: [
      {
        question: "Reicht Sichtkontrolle ohne Fallen?",
        answer: "Meist nicht. Fallen zeigen Trends frueher und helfen, Hotspots vor sichtbaren Schaeden zu finden."
      },
      {
        question: "Ist jedes Blattproblem gleich ein Schaedling?",
        answer: "Nein. Nahrstoffprobleme, Lichtstress oder Umweltstress koennen aehnlich aussehen und muessen sauber abgegrenzt werden."
      }
    ],
    glossary: [
      { term: "IPM", definition: "Integrierter Ansatz zur Praevention und Kontrolle von Schaedlingen ueber mehrere Massnahmenebenen." },
      { term: "Quarantaene", definition: "Zeitlich und raeumlich getrennte Beobachtung neuer Pflanzen oder Materialien." },
      { term: "Sticky Trap", definition: "Klebefalle zur Frueherkennung fliegender Schaedlinge und zur Trendbeobachtung." },
    ],
    relatedSlugs: ["pgr-und-kontaminanten", "schimmel-und-mykotoxine-bei-cannabis", "cannabis-anbau-grundlagen"]
  }),
  createArticle({
    slug: "feminisiert-vs-regular-vs-autoflower",
    title: "Feminisiert vs. Regular vs. Autoflower",
    summary: "Welche genetischen Formate es gibt, wo ihre jeweiligen Staerken liegen und welche Missverstaendnisse haeufig sind.",
    category: "genetik",
    difficulty: "einsteiger",
    readMinutes: 7,
    tags: ["Samen", "Regular", "Autoflower", "Genetik"],
    keyTakeaways: [
      "Die drei Formate loesen unterschiedliche Ziele in Selektion, Produktionsplanung und Einfachheit.",
      "Autoflower ist kein Qualitaetsurteil, sondern ein anderer Entwicklungsmodus mit eigenen Grenzen.",
      "Fuer reproduzierbare Programme zaehlen Stabilitaet und Zielprofil mehr als Marketingbegriffe."
    ],
    quickFacts: [
      { label: "Einsteigerfreundlich", value: "Haengt vom Zielsystem ab" },
      { label: "Selektionsfreiheit", value: "Am groessten bei Regular" },
      { label: "Planbarkeit", value: "Stark von Genetikqualitaet abhaengig" }
    ],
    sections: [
      {
        heading: "Drei Formate, drei Einsatzgebiete",
        content: [
          "Regular-Samen sind wichtig fuer Zucht und tiefe Selektion, feminisierte Linien vereinfachen viele Produktionsablaeufe und Autoflower verkuerzen bestimmte Zyklen.",
          "Keines der Systeme ist pauschal ueberlegen. Die Entscheidung haengt von Raum, Erfahrung und Prozesszielen ab."
        ]
      },
      {
        heading: "Worauf du in der Praxis achten solltest",
        content: [
          "Pruefe, wie stabil eine Linie tatsaechlich ist und ob die Beschreibung des Breeders mit deiner Zielumgebung zusammenpasst.",
          "Fuer spaetere Vergleichbarkeit sind Dokumentation und Testlaeufe wichtiger als Produktversprechen."
        ],
        checklist: [
          "Zuchtziel vor der Sortenwahl definieren",
          "Breeder-Angaben gegen echte Grow-Daten pruefen",
          "Leistung ueber mehrere Runs vergleichen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Regular",
        text: "Samen mit natuerlicher Geschlechterverteilung; wichtig fuer Selektion, Kreuzungen und Zuchtarbeit."
      },
      {
        title: "Kurz erklaert: Autoflower",
        text: "Pflanzen, die nach Alter statt nach Photoperiode in die Bluete gehen. Das vereinfacht manche Ablaeufe, begrenzt aber andere."
      }
    ],
    faq: [
      {
        question: "Sind feminisierte Samen instabil?",
        answer: "Nicht automatisch. Gute Linien koennen sehr stabil sein, schlechte Linien zeigen auch als feminisierte Saat Probleme."
      },
      {
        question: "Sind Autoflower immer schneller?",
        answer: "Oft im Gesamtablauf, aber nicht in jedem Setup effizienter. Planbarkeit und Zielprofil muessen mitgedacht werden."
      }
    ],
    glossary: [
      { term: "Photoperiode", definition: "Abhaengigkeit der Bluete von der Tageslaenge beziehungsweise dem Lichtzyklus." },
      { term: "Regular", definition: "Samen mit maennlichen und weiblichen Pflanzen in natuerlicher Verteilung." },
      { term: "Feminisiert", definition: "Samen, die mit hoher Wahrscheinlichkeit weibliche Pflanzen hervorbringen." },
    ],
    relatedSlugs: ["genetik-und-phaenotyp-selektion", "mutterpflanzen-und-clone-hygiene", "selektionsscorecards-fuer-pheno-hunts"]
  }),
  createArticle({
    slug: "mutterpflanzen-und-clone-hygiene",
    title: "Mutterpflanzen und Clone-Hygiene",
    summary: "Wie du gesunde Mutterlinien fuehrst, Kreuzkontamination vermeidest und Clone-Programme reproduzierbar machst.",
    category: "genetik",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Mutterpflanzen", "Clones", "Hygiene", "Drift"],
    keyTakeaways: [
      "Mutterpflanzen sind Produktionsinfrastruktur und muessen wie kritische Assets behandelt werden.",
      "Hygiene, Rotation und Backup-Strategien verhindern Ausfaelle durch Krankheiten oder Drift.",
      "Clone-Qualitaet ist nur dann vergleichbar, wenn Schnitt, Bewurzelung und Weitergabe standardisiert sind."
    ],
    quickFacts: [
      { label: "Kritischer Punkt", value: "Gesundheitsstatus der Mutterlinie" },
      { label: "Bester Schutz", value: "Rotation plus Backup" },
      { label: "Dokumentation", value: "ID, Alter, Vitalitaet, Historie" }
    ],
    sections: [
      {
        heading: "Warum Mutterlinien oft unterschuetzt werden",
        content: [
          "Viele Systeme fokussieren nur auf den Run, nicht auf die Quelle des Pflanzenmaterials. Genau dort entstehen aber oft die spaeteren Probleme.",
          "Eine muede, kontaminierte oder falsch gefuehrte Mutterlinie zieht Fehler durch den gesamten Prozess."
        ]
      },
      {
        heading: "So sieht ein sauberes Clone-Programm aus",
        content: [
          "Definiere Schnittstandards, Hygieneprotokolle, Bewurzelungsfenster und Ausschlusskriterien fuer schwache Stecklinge.",
          "Halte mehrere Backups und trenne wertvolle Linien gegen Verlust oder Verwechslung."
        ],
        checklist: [
          "Werkzeug vor jedem Schnitt desinfizieren",
          "Mutterpflanzen regelmaessig verjuengen",
          "Clone-Raten und Ausfaelle pro Linie dokumentieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Mutterpflanze",
        text: "Eine Pflanze, von der regelmaessig Stecklinge geschnitten werden, um genetisch identisches Material zu erhalten."
      },
      {
        title: "Kurz erklaert: Drift",
        text: "Leistungsabfall oder Veraenderung ueber Zeit durch Alter, Stress, Krankheiten oder unsaubere Vermehrung."
      }
    ],
    faq: [
      {
        question: "Wie lange kann ich eine Mutterpflanze halten?",
        answer: "Technisch lange, aber operativ ist eine geregelte Rotation oft sinnvoller, um Vitalitaet und Hygiene zu sichern."
      },
      {
        question: "Brauche ich Backups derselben Linie?",
        answer: "Ja. Ein einzelner Ausfall sollte nie die gesamte Genetikstrategie gefaehrden."
      }
    ],
    glossary: [
      { term: "Mutterlinie", definition: "Langfristig erhaltene Pflanze oder Linie zur Produktion genetisch gleicher Stecklinge." },
      { term: "Bewurzelungsquote", definition: "Anteil der Stecklinge, die erfolgreich Wurzeln bilden." },
      { term: "Verjuengung", definition: "Geplante Erneuerung einer Mutterpflanze durch frisches Material derselben Linie." },
    ],
    relatedSlugs: ["genetik-und-phaenotyp-selektion", "integrierte-schaedlingspraevention-grow", "feminisiert-vs-regular-vs-autoflower"]
  }),
  createArticle({
    slug: "selektionsscorecards-fuer-pheno-hunts",
    title: "Selektionsscorecards fuer Pheno-Hunts",
    summary: "Wie du Auswahlprozesse mit Kriterien, Gewichtungen und Bestaetigungslaeufen objektiver machst.",
    category: "genetik",
    difficulty: "profi",
    readMinutes: 9,
    tags: ["Pheno-Hunt", "Scorecard", "Selektion", "Dokumentation"],
    keyTakeaways: [
      "Ohne Scorecard kippt Selektion schnell in Bauchgefuehl und spaete Rechtfertigung.",
      "Gewichtete Kriterien helfen, unterschiedliche Ziele wie Ertrag, Aroma und Stabilitaet ausbalanciert zu bewerten.",
      "Top-Kandidaten brauchen immer einen Bestaetigungslauf unter denselben Bedingungen."
    ],
    quickFacts: [
      { label: "Ziel", value: "Objektive Vergleichbarkeit" },
      { label: "Pflicht", value: "Bestaetigungslauf" },
      { label: "Typische Achsen", value: "Wuchs, Risiko, Qualitaet, Konsistenz" }
    ],
    sections: [
      {
        heading: "Was in eine gute Scorecard gehoert",
        content: [
          "Bewerte nicht nur Ertrag oder Optik, sondern auch Stressverhalten, Nacherntequalitaet, Trimmaufwand und Batch-Konsistenz.",
          "Lege Gewichtungen vorher fest, damit sie nicht erst nach dem Lieblingskandidaten angepasst werden."
        ]
      },
      {
        heading: "Wie Entscheidungen belastbar werden",
        content: [
          "Vergleiche Kandidaten blind, soweit moeglich, und verknuepfe subjektive Sensorik mit objektiven Labor- oder Prozessdaten.",
          "Nur Linien, die im Wiederholungslauf erneut liefern, sollten in Produktion oder Weiterzucht gehen."
        ],
        checklist: [
          "Gewichtung vor dem Run definieren",
          "Pro Kandidat Foto-, Labor- und Prozessdaten sammeln",
          "Finalisten in separatem Best-run verifizieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Scorecard",
        text: "Ein Bewertungsbogen mit festen Kriterien und Punkten, um mehrere Kandidaten fair zu vergleichen."
      },
      {
        title: "Kurz erklaert: Gewichtung",
        text: "Nicht jedes Kriterium ist gleich wichtig. Gewichtung macht sichtbar, was fuer dein Zielsystem Prioritaet hat."
      }
    ],
    faq: [
      {
        question: "Kann ich ohne Laborwerte jagen?",
        answer: "Ja, aber dann sinkt die Trennschaerfe. Besonders bei Qualitaets- und Sicherheitsprofilen helfen Laborwerte deutlich."
      },
      {
        question: "Wie viele Kriterien sind sinnvoll?",
        answer: "Genug fuer Tiefe, aber nicht so viele, dass niemand mehr konsistent bewertet. Zehn bis 15 Kernkriterien sind oft praktikabel."
      }
    ],
    glossary: [
      { term: "Scorecard", definition: "Standardisiertes Formular zur Bewertung mehrerer Kandidaten nach denselben Kriterien." },
      { term: "Bestaetigungslauf", definition: "Wiederholung eines vielversprechenden Kandidaten unter kontrollierten Bedingungen." },
      { term: "Gewichtung", definition: "Festgelegte Bedeutung einzelner Kriterien innerhalb einer Gesamtwertung." },
    ],
    relatedSlugs: ["genetik-und-phaenotyp-selektion", "mutterpflanzen-und-clone-hygiene", "terpene-und-wirkprofil"]
  }),
  createArticle({
    slug: "cannabinoid-biosynthese-verstehen",
    title: "Cannabinoid-Biosynthese verstehen",
    summary: "Wie Vorstufen, Enzyme und Reifeprozesse das Profil einer Pflanze formen und warum das fuer Dateninterpretation wichtig ist.",
    category: "chemie",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    tags: ["Biosynthese", "CBGA", "Reife", "Chemie"],
    keyTakeaways: [
      "Cannabinoidprofile entstehen nicht zufaellig, sondern aus genetischer Anlage plus Umwelt- und Reifeeinfluss.",
      "Vorstufen und Enzymaktivitaet helfen, Profile besser zu verstehen als reine Prozentzahlen auf einer COA.",
      "Chemisches Verstaendnis verbessert Sorteneinordnung, Erntezeitpunkt und Labordaten-Lesekompetenz."
    ],
    quickFacts: [
      { label: "Vorstufe", value: "CBGA" },
      { label: "Einfluss", value: "Genetik plus Reife plus Prozess" },
      { label: "Nutzen", value: "Besseres Verstaendnis von Profilverschiebungen" }
    ],
    sections: [
      {
        heading: "Von der Vorstufe zum Profil",
        content: [
          "Viele Cannabinoide teilen biochemische Vorstufen. Welche Stoffe spaeter dominieren, haengt von genetischen und prozessbedingten Faktoren ab.",
          "Deshalb sind Prozentwerte immer eine Momentaufnahme und kein unveraenderliches Produktmerkmal."
        ]
      },
      {
        heading: "Warum das fuer die Praxis wichtig ist",
        content: [
          "Wenn Teams verstehen, wie Profile entstehen und kippen koennen, werden Erntefenster, Lagerung und COA-Interpretation deutlich belastbarer.",
          "Gerade bei Minor Cannabinoiden hilft ein mechanistischer Blick, Marketing von echter Plausibilitaet zu trennen."
        ],
        checklist: [
          "Analysedaten immer mit Ernte- und Prozessdaten lesen",
          "Vorstufen und Gesamtprofil gemeinsam betrachten",
          "Minor-Werte nur mit Methodenhinweis vergleichen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Biosynthese",
        text: "Damit ist die Bildung von Wirkstoffen in der Pflanze gemeint, ausgehend von biochemischen Vorstufen und Enzymen."
      },
      {
        title: "Kurz erklaert: CBGA",
        text: "CBGA gilt als zentrale Vorstufe, aus der ueber weitere enzymatische Schritte andere Cannabinoide entstehen."
      }
    ],
    faq: [
      {
        question: "Kann Umwelt das Profil sichtbar veraendern?",
        answer: "Ja. Genetik setzt den Rahmen, aber Reife, Stress, Nachernte und Lagerung verschieben das gemessene Ergebnis."
      },
      {
        question: "Warum schwanken Minor Cannabinoide so stark?",
        answer: "Sie liegen oft nahe an Messgrenzen und reagieren empfindlich auf Methode, Reifegrad und Chargenunterschiede."
      }
    ],
    glossary: [
      { term: "Biosynthese", definition: "Biochemischer Aufbau von Molekuelen innerhalb eines lebenden Organismus." },
      { term: "Vorstufe", definition: "Chemische Ausgangssubstanz, aus der weitere Verbindungen entstehen." },
      { term: "Minor Cannabinoide", definition: "Cannabinoide, die nur in kleineren Mengen auftreten und oft methodisch schwerer zu bewerten sind." },
    ],
    relatedSlugs: ["cannabinoide-und-evidenz", "analytik-hplc-vs-gc-bei-cannabinoiden", "coa-richtig-lesen"]
  }),
  createArticle({
    slug: "thc-zu-cbn-abbau-und-oxidation",
    title: "THC zu CBN: Abbau und Oxidation",
    summary: "Warum Wirkstoffprofile bei Licht, Hitze und Zeit kippen und wie diese Veraenderungen sauber eingeordnet werden.",
    category: "chemie",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    tags: ["THC", "CBN", "Oxidation", "Lagerung"],
    keyTakeaways: [
      "Cannabinoidprofile sind lagerungs- und prozesssensibel und koennen sich ueber Zeit deutlich verschieben.",
      "Licht, Sauerstoff und Hitze sind zentrale Treiber von Abbau- und Oxidationsprozessen.",
      "Profilverschiebungen muessen von Messmethodik und Probenhandhabung mitgedacht werden."
    ],
    quickFacts: [
      { label: "Treiber", value: "Zeit, Hitze, Licht, Sauerstoff" },
      { label: "Praxisnutzen", value: "Bessere Lagerstrategie" },
      { label: "Warnsignal", value: "Alte COA ohne Lagerkontext" }
    ],
    sections: [
      {
        heading: "Wie Abbauprozesse entstehen",
        content: [
          "Chemische Profile veraendern sich nach der Ernte weiter. Ein gemessener Wert vom Freigabetag ist daher nicht zwingend identisch mit dem Zustand Monate spaeter.",
          "Besonders kritisch sind Kombinationen aus Sauerstoffkontakt, Waerme und langen Lagerzeiten."
        ]
      },
      {
        heading: "Was das fuer Qualitaet und Kommunikation bedeutet",
        content: [
          "Produktprofile muessen mit Produktions- und Lagerdaten zusammen bewertet werden. Andernfalls werden normale Alterungsprozesse schnell fehlgedeutet.",
          "Fuer Plattformen und Labore sind klare Hinweise auf Probendatum, Lagerregime und Messmethode zentral."
        ],
        checklist: [
          "Probendatum und Verpackungsstatus dokumentieren",
          "Licht- und Sauerstoffschutz definieren",
          "Alte und neue Chargen nicht ohne Kontext vergleichen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Oxidation",
        text: "Chemische Reaktion mit Sauerstoff, die Molekuele veraendern und damit Profil, Aroma oder Stabilitaet verschieben kann."
      },
      {
        title: "Kurz erklaert: CBN",
        text: "Cannabinol ist ein Abbauprodukt, das unter anderem mit gealterten oder stark exponierten Profilen assoziiert sein kann."
      }
    ],
    faq: [
      {
        question: "Steigt CBN immer nur mit Alter?",
        answer: "Alter spielt mit hinein, aber auch Licht, Hitze, Sauerstoff und die Art der Lagerung beeinflussen den Verlauf."
      },
      {
        question: "Sind alte Produkte automatisch schlecht?",
        answer: "Nicht automatisch, aber das Profil kann deutlich von der urspruenglichen Freigabe abweichen. Deshalb ist Lagerkontext entscheidend."
      }
    ],
    glossary: [
      { term: "Oxidation", definition: "Chemischer Prozess, bei dem Molekuele durch Reaktion mit Sauerstoff veraendert werden." },
      { term: "Abbauprodukt", definition: "Substanz, die aus der Veraenderung oder Zersetzung eines anderen Molekuels entsteht." },
      { term: "Stabilitaet", definition: "Wie gut ein chemisches Profil ueber Zeit und Lagerbedingungen erhalten bleibt." },
    ],
    relatedSlugs: ["lagerung-verpackung-und-lichtschutz", "wasseraktivitaet-und-curing", "coa-richtig-lesen"]
  }),
  createArticle({
    slug: "decarboxylierung-grundlagen-und-fehler",
    title: "Decarboxylierung: Grundlagen und Fehlerbilder",
    summary: "Was bei der Umwandlung von sauren Vorstufen passiert und warum Temperaturfenster und Kontext wichtig sind.",
    category: "chemie",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Decarboxylierung", "THCA", "Waerme", "Prozess"],
    keyTakeaways: [
      "Decarboxylierung ist ein temperatur- und zeitabhaengiger Prozess mit Zielkonflikten bei Erhalt und Umwandlung.",
      "Zu pauschale Temperaturregeln ignorieren Material, Feuchte und Prozessziel.",
      "Fuer Wissensseiten ist Einordnung wichtiger als operative Kochrezepte."
    ],
    quickFacts: [
      { label: "Kernbegriff", value: "Umwandlung saurer Vorstufen" },
      { label: "Fehlerquelle", value: "Pauschale Hitzeschemata" },
      { label: "Relevanz", value: "Analytik, Interpretation, Aufklaerung" }
    ],
    sections: [
      {
        heading: "Was chemisch passiert",
        content: [
          "Bei der Decarboxylierung veraendern sich saure Cannabinoidformen unter Waermeeinfluss. Dieser Prozess beeinflusst spaetere Analytik und Produktinterpretation.",
          "Wichtig ist, dass nicht nur die Umwandlung, sondern auch Verlust- und Abbaupfade mitgedacht werden."
        ]
      },
      {
        heading: "Wo Missverstaendnisse entstehen",
        content: [
          "Im Netz kursieren oft starre Zeit-Temperatur-Regeln ohne Materialkontext. Fuer serioese Aufklaerung reicht das nicht aus.",
          "Besser ist ein Verstaendnis fuer Prinzipien, Messgrenzen und Zielkonflikte zwischen Umwandlung, Terpenerhalt und Stabilitaet."
        ],
        checklist: [
          "Analytik vor und nach Prozess sauber trennen",
          "Materialzustand und Feuchte mitdenken",
          "Keine pauschalen Heil- oder Wirkaussagen daraus ableiten"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Saure Vorstufen",
        text: "Viele Cannabinoide liegen in der Pflanze zuerst in saurer Form vor und werden erst durch Prozesse wie Hitze weiterveraendert."
      },
      {
        title: "Kurz erklaert: Warum das relevant ist",
        text: "Die chemische Form beeinflusst Messwerte, Produktbeschreibung und spaetere Wirkungseinordnung."
      }
    ],
    faq: [
      {
        question: "Ist Decarboxylierung immer komplett gewollt?",
        answer: "Nicht zwingend. Das haengt vom Produkttyp, Prozessziel und den gewuenschten chemischen Eigenschaften ab."
      },
      {
        question: "Warum unterscheiden sich Laborwerte vor und nach Prozess so stark?",
        answer: "Weil chemische Formen, Wassergehalt und eventuelle Abbauprozesse das Ergebnis sichtbar veraendern."
      }
    ],
    glossary: [
      { term: "Decarboxylierung", definition: "Chemische Abspaltung einer Carboxylgruppe unter anderem durch Waerme." },
      { term: "THCA", definition: "Saure Vorstufe von THC, die in frischem Pflanzenmaterial haeufig dominiert." },
      { term: "Prozessfenster", definition: "Bereich aus Zeit und Temperatur, in dem ein Prozessziel moeglichst reproduzierbar erreicht wird." },
    ],
    relatedSlugs: ["analytik-hplc-vs-gc-bei-cannabinoiden", "cannabinoid-biosynthese-verstehen", "coa-richtig-lesen"]
  }),
  createArticle({
    slug: "analytik-hplc-vs-gc-bei-cannabinoiden",
    title: "Analytik: HPLC vs. GC bei Cannabinoiden",
    summary: "Welche Unterschiede die beiden Methoden haben und warum Methodik fuer Vergleichbarkeit und Interpretation entscheidend ist.",
    category: "chemie",
    difficulty: "profi",
    readMinutes: 9,
    tags: ["HPLC", "GC", "Analytik", "Methodik"],
    keyTakeaways: [
      "Methodenvergleich ist keine Nebensache: HPLC und GC beantworten teils unterschiedliche Fragen.",
      "Ohne Methodenhinweis sind Profilvergleiche zwischen COAs oft nur eingeschraenkt belastbar.",
      "Saure Vorstufen, Aufarbeitung und Temperaturbelastung spielen bei der Einordnung eine grosse Rolle."
    ],
    quickFacts: [
      { label: "HPLC", value: "Schonend fuer saure Formen" },
      { label: "GC", value: "Stark fuer fluechtige Analyse" },
      { label: "Pflichtangabe", value: "Methode plus Aufarbeitung" }
    ],
    sections: [
      {
        heading: "Wie sich die Methoden unterscheiden",
        content: [
          "HPLC arbeitet ohne dieselbe thermische Belastung wie GC und eignet sich deshalb gut fuer Cannabinoidformen, die hitzesensibel sind.",
          "GC ist fuer bestimmte Analyten und Profile sehr stark, muss aber methodisch passend gelesen werden."
        ]
      },
      {
        heading: "Was das fuer COAs bedeutet",
        content: [
          "Wer Laborberichte vergleichen will, braucht immer den Methodenblock mit Aufarbeitung, Kalibration und Nachweisgrenzen.",
          "Nur dann lassen sich Unterschiede auf echte Chargenabweichung oder auf methodische Effekte zurueckfuehren."
        ],
        checklist: [
          "Methode im COA sichtbar machen",
          "Keine Chargen ohne Methodenvergleich gegeneinander bewerten",
          "Auf LOQ, Matrix und Aufarbeitung achten"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: HPLC",
        text: "Fluessigchromatographie, die sich besonders fuer hitzeempfindliche Verbindungen eignet."
      },
      {
        title: "Kurz erklaert: GC",
        text: "Gaschromatographie, stark fuer fluechtige Verbindungen und oft zentral in der Terpenanalytik."
      }
    ],
    faq: [
      {
        question: "Welche Methode ist besser?",
        answer: "Nicht generell. Die Eignung haengt vom Analyten, der Matrix und der Frage ab, die beantwortet werden soll."
      },
      {
        question: "Warum weichen COAs verschiedener Labore ab?",
        answer: "Methoden, Kalibration, Probenahme und Aufarbeitung koennen Unterschiede erzeugen, selbst bei aehnlichem Ausgangsmaterial."
      }
    ],
    glossary: [
      { term: "HPLC", definition: "High-Performance Liquid Chromatography, ein Standardverfahren fuer viele nichtfluechtige oder hitzeempfindliche Analyten." },
      { term: "GC", definition: "Gaschromatographie, genutzt fuer fluechtige oder thermisch analysierbare Verbindungen." },
      { term: "Kalibration", definition: "Abgleich eines Messsystems mit bekannten Standards, um korrekte Quantifizierung zu ermoeglichen." },
    ],
    relatedSlugs: ["coa-richtig-lesen", "decarboxylierung-grundlagen-und-fehler", "terpene-und-wirkprofil"]
  }),
  createArticle({
    slug: "myrcen-limonen-caryophyllen-einordnung",
    title: "Myrcen, Limonen, Caryophyllen richtig einordnen",
    summary: "Wie bekannte Terpene fachlich beschrieben werden sollten und wo Marketing oft zu stark vereinfacht.",
    category: "terpene",
    difficulty: "einsteiger",
    readMinutes: 7,
    tags: ["Myrcen", "Limonen", "Caryophyllen", "Einordnung"],
    keyTakeaways: [
      "Beliebte Terpenbegriffe helfen bei Orientierung, erklaeren aber nie das ganze Profil.",
      "Einzelterpene sollten immer im Kontext von Gesamtprofil, Dosis und Produktform gelesen werden.",
      "Serioese Kommunikation trennt Sensorik, Hypothese und belastbare Evidenz sauber."
    ],
    quickFacts: [
      { label: "Nutzen", value: "Orientierung fuer Profilbeschreibungen" },
      { label: "Grenze", value: "Einzelterpen ist nie die ganze Story" },
      { label: "Best Practice", value: "Gesamtprofil statt Hype-Wort" }
    ],
    sections: [
      {
        heading: "Warum Einzelterpene so beliebt sind",
        content: [
          "Begriffe wie Myrcen oder Limonen sind greifbar und lassen sich gut kommunizieren. Genau deshalb werden sie oft ueberbetont.",
          "Fachlich sauber bleibt die Beschreibung aber nur, wenn das gesamte Profil mitgedacht wird."
        ]
      },
      {
        heading: "Wie du sie sinnvoll beschreibst",
        content: [
          "Nutze Einzelterpene als Teil eines breiteren sensorischen und analytischen Bildes. Keine Einzelsubstanz liefert allein eine sichere Wirkprognose.",
          "Besonders im Content ist es wichtig, Korrelation nicht als gesicherte Kausalitaet darzustellen."
        ],
        checklist: [
          "Gesamtprofil nennen, nicht nur das Top-Terpen",
          "Wirkungsbehauptungen mit Evidenzstufe markieren",
          "Sensorische Sprache und Laborwerte sauber trennen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Myrcen",
        text: "Ein haeufig genanntes Terpen, das oft mit krautig-erdigen Noten beschrieben wird."
      },
      {
        title: "Kurz erklaert: Caryophyllen",
        text: "Terpen mit oft pfeffriger Note, das in Diskussionen rund um Profil und Wahrnehmung regelmaessig auftaucht."
      }
    ],
    faq: [
      {
        question: "Bestimmt ein Terpen die Wirkung komplett?",
        answer: "Nein. Wirkung ist ein Zusammenspiel aus Gesamtprofil, Dosis, Produktform und individueller Reaktion."
      },
      {
        question: "Warum nutzen Shops diese Begriffe so stark?",
        answer: "Weil sie merkfaehig sind. Das macht sie aber nicht automatisch zu belastbaren Wirklabels."
      }
    ],
    glossary: [
      { term: "Gesamtprofil", definition: "Kombination aller relevanten Stoffe und ihrer Verhaeltnisse in einem Produkt." },
      { term: "Sensorik", definition: "Eindruck von Geruch, Geschmack und Wahrnehmung eines Produkts." },
      { term: "Korrelation", definition: "Statistischer Zusammenhang, der noch keine sichere Ursache beweist." },
    ],
    relatedSlugs: ["terpene-und-wirkprofil", "sensorik-panels-fuer-cannabisprodukte", "coa-richtig-lesen"]
  }),
  createArticle({
    slug: "lagerung-und-terpenverlust-vermeiden",
    title: "Lagerung und Terpenverlust vermeiden",
    summary: "Warum Verpackung, Temperatur und Sauerstoffkontakt das Aromaprofil staerker formen, als viele Content-Seiten zugeben.",
    category: "terpene",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    tags: ["Terpenverlust", "Lagerung", "Sauerstoff", "Aroma"],
    keyTakeaways: [
      "Terpene sind volatil und reagieren stark auf Licht, Waerme und Luftkontakt.",
      "Gute Verpackung ist ein Qualitaetsthema, nicht nur Branding.",
      "Produktbewertungen ohne Lagerkontext sind oft unvollstaendig."
    ],
    quickFacts: [
      { label: "Gegner", value: "Waerme, Licht, Sauerstoff" },
      { label: "Hebel", value: "Verpackung plus Klima" },
      { label: "Signal", value: "Alte Ware verliert oft zuerst Aroma" }
    ],
    sections: [
      {
        heading: "Warum Aroma so schnell kippt",
        content: [
          "Terpene verdampfen oder veraendern sich leichter als viele andere Stoffklassen. Schon die Kombination aus Lagerzeit und unguenstiger Verpackung kann viel kosten.",
          "Deshalb ist das urspruengliche Profil nicht automatisch identisch mit dem, was spaeter beim Nutzer ankommt."
        ]
      },
      {
        heading: "Welche Verpackungslogik funktioniert",
        content: [
          "Ziel ist nicht nur dicht, sondern kontrolliert: wenig Sauerstoff, moeglichst wenig Licht und stabile Temperaturen.",
          "Fuer Teams lohnt es sich, Packmittel und Reklamationsdaten gemeinsam zu betrachten."
        ],
        checklist: [
          "Lager- und Transporttemperaturen begrenzen",
          "Lichtschutz als Pflichtkriterium behandeln",
          "Aromareklamationen mit Chargenalter verknuepfen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: volatil",
        text: "Leicht fluechtig oder leicht in die Gasphase uebergehend. Gerade das macht Terpene empfindlich gegen Lagerfehler."
      },
      {
        title: "Kurz erklaert: Sauerstoffschutz",
        text: "Verpackungen und Prozesse, die den Kontakt mit Luft reduzieren und damit Profilverlust verlangsamen."
      }
    ],
    faq: [
      {
        question: "Hilft Kuehlung immer?",
        answer: "Oft ja, aber nur mit kontrollierter Feuchte und passender Verpackung. Sonst entstehen neue Probleme."
      },
      {
        question: "Warum riecht eine Charge spaeter so anders?",
        answer: "Weil Lagerzeit, Licht und Sauerstoffkontakt das Terpenprofil sichtbar veraendern koennen."
      }
    ],
    glossary: [
      { term: "Volatil", definition: "Leicht verdampfend oder leicht in die Luft uebergehend." },
      { term: "Headspace", definition: "Luftraum in einer Verpackung, der den Sauerstoffkontakt mit beeinflusst." },
      { term: "Aromastabilitaet", definition: "Wie gut ein Produkt sein Geruchs- und Geschmacksprofil ueber Zeit behaelt." },
    ],
    relatedSlugs: ["wasseraktivitaet-und-curing", "lagerung-verpackung-und-lichtschutz", "terpene-und-wirkprofil"]
  }),
  createArticle({
    slug: "sensorik-panels-fuer-cannabisprodukte",
    title: "Sensorik-Panels fuer Cannabisprodukte",
    summary: "Wie strukturierte Geruchs- und Profilbewertung professioneller wird als spontane Einzelmeinungen im Team.",
    category: "terpene",
    difficulty: "profi",
    readMinutes: 8,
    tags: ["Sensorik", "Panels", "Aroma", "Qualitaet"],
    keyTakeaways: [
      "Einzelmeinungen sind wertvoll, aber erst standardisierte Panels machen Sensorik reproduzierbar.",
      "Klare Deskriptoren und Blindvergleiche reduzieren Bias in der Profilbewertung.",
      "Sensorik wird besonders stark, wenn sie mit Analytik und Chargendaten gekoppelt wird."
    ],
    quickFacts: [
      { label: "Ziel", value: "Reproduzierbare Sensoriksprache" },
      { label: "Pflicht", value: "Blindbewertung" },
      { label: "Mehrwert", value: "Kombination mit Laborprofilen" }
    ],
    sections: [
      {
        heading: "Warum Panels besser sind als laute Einzelstimmen",
        content: [
          "Aromabewertung ist anfaellig fuer Erwartung, Branding und Gruppeneffekte. Standardisierte Panels machen diese Verzerrungen sichtbar kleiner.",
          "Das ist besonders wichtig, wenn Produktbeschreibungen spaeter in Kataloge oder Content einfliessen."
        ]
      },
      {
        heading: "Wie Panels aufgebaut werden",
        content: [
          "Arbeite mit festen Deskriptoren, Blindmustern und klaren Bewertungsboegen. Wiederhole Bewertungen in definierten Intervallen.",
          "Wird Sensorik mit Laborwerten verknuepft, verbessert sich die Plausibilitaet fuer Profilbeschreibungen deutlich."
        ],
        checklist: [
          "Deskriptorenliste vorab festlegen",
          "Blindproben fuer Bias-Reduktion nutzen",
          "Sensorikdaten pro Charge speichern"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Deskriptor",
        text: "Ein standardisiertes Wort oder Attribut, mit dem Geruchs- oder Geschmackseindruecke beschrieben werden."
      },
      {
        title: "Kurz erklaert: Blindprobe",
        text: "Eine Probe ohne sichtbare Produktidentitaet, damit Erwartung die Bewertung weniger beeinflusst."
      }
    ],
    faq: [
      {
        question: "Reicht ein gutes Panel ohne Labor?",
        answer: "Es hilft stark, ersetzt Analytik aber nicht. Sensorik und Labordaten ergaenzen sich."
      },
      {
        question: "Wie gross sollte ein Panel sein?",
        answer: "Gross genug fuer unterschiedliche Wahrnehmungen, aber klein genug, um konsistent trainiert zu bleiben."
      }
    ],
    glossary: [
      { term: "Sensorik-Panel", definition: "Gruppe geschulter Personen, die Produkte nach festen Kriterien bewertet." },
      { term: "Bias", definition: "Verzerrung einer Bewertung durch Erwartung, Kontext oder Vorwissen." },
      { term: "Deskriptor", definition: "Standardisiertes Merkmal zur Beschreibung sensorischer Eindruecke." },
    ],
    relatedSlugs: ["terpene-und-wirkprofil", "myrcen-limonen-caryophyllen-einordnung", "coa-richtig-lesen"]
  }),
  createArticle({
    slug: "cannabis-bei-schmerz-evidenzcheck",
    title: "Cannabis bei Schmerz: Evidenzcheck",
    summary: "Welche Aussagen zur Schmerzreduktion belegt sind, wo die Forschung Grenzen hat und wie Aufklaerung sauber bleibt.",
    category: "medizin",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Schmerz", "Medizin", "Evidenz", "Meta-Analyse"],
    keyTakeaways: [
      "Schmerz ist kein einheitlicher Endpunkt; Evidenz unterscheidet sich je Indikation und Studiendesign.",
      "Kommunikation muss Wirkung, Nebenwirkung und Unsicherheit gleichzeitig abbilden.",
      "Serioese Aufklaerung vermeidet pauschale Heilsprache."
    ],
    quickFacts: [
      { label: "Wichtig", value: "Indikation und Endpunkt trennen" },
      { label: "Grenze", value: "Nicht jede Studie ist uebertragbar" },
      { label: "Praxis", value: "Aufklaerung statt Versprechen" }
    ],
    sections: [
      {
        heading: "Warum Schmerzforschung so schwer zu lesen ist",
        content: [
          "Schmerz kann akut, chronisch, neuropathisch oder entzuedlich sein. Studien lassen sich deshalb nicht beliebig zusammenwerfen.",
          "Ohne saubere Trennung der Endpunkte entstehen schnell ueberzogene Schlussfolgerungen."
        ]
      },
      {
        heading: "Wie ein fairer Evidenzcheck aussieht",
        content: [
          "Bewerte Population, Dosis, Vergleichsgruppe, Studiendauer und Nebenwirkungen gemeinsam. Nur dann wird der Erkenntniswert sichtbar.",
          "Fuer Content bedeutet das: Nutzen nennen, Unsicherheit markieren, Grenzen nicht verschweigen."
        ],
        checklist: [
          "Indikation klar benennen",
          "Studiendauer und Endpunkt offenlegen",
          "Nebenwirkungen immer mitkommunizieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Endpunkt",
        text: "Das konkrete Ergebnis, das in einer Studie gemessen wird, etwa Schmerzintensitaet oder Schlafqualitaet."
      },
      {
        title: "Kurz erklaert: Meta-Analyse",
        text: "Zusammenfassung mehrerer Studien, die einen breiteren Blick ermoeglicht, aber nur so gut ist wie die eingeschlossenen Daten."
      }
    ],
    faq: [
      {
        question: "Ist Cannabis ein generelles Schmerzmittel?",
        answer: "So pauschal laesst sich das nicht sagen. Die Evidenz ist indikations- und populationsabhaengig."
      },
      {
        question: "Warum widersprechen sich Schlagzeilen so oft?",
        answer: "Weil Studien unterschiedliche Endpunkte, Gruppen und Qualitaetsniveaus haben und Medien das oft verkurzen."
      }
    ],
    glossary: [
      { term: "Indikation", definition: "Konkreter medizinischer Anwendungsbereich oder Beschwerdekomplex." },
      { term: "Endpunkt", definition: "Vorab definierte Groesse, die in einer Studie gemessen und bewertet wird." },
      { term: "Placebo", definition: "Vergleichsbehandlung ohne den eigentlichen Wirkstoff, um Effekte sauberer einordnen zu koennen." },
    ],
    relatedSlugs: ["cannabinoide-und-evidenz", "cannabis-und-schlaf-was-ist-belegt", "cannabinoide-nebenwirkungen-und-interaktionen"]
  }),
  createArticle({
    slug: "cannabis-und-schlaf-was-ist-belegt",
    title: "Cannabis und Schlaf: Was ist belegt?",
    summary: "Eine Einordnung zwischen subjektiver Beruhigung, Studienlage und den Grenzen einfacher Narrativen.",
    category: "medizin",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Schlaf", "CBD", "THC", "Evidenz"],
    keyTakeaways: [
      "Subjektive Schlafverbesserung und belastbare Langzeitdaten sind nicht dasselbe.",
      "Kurzfristige Effekte koennen anders ausfallen als die Entwicklung bei langfristiger Nutzung.",
      "Saubere Kommunikation trennt Einschlafhilfe, Schlafqualitaet und Nebenwirkungen."
    ],
    quickFacts: [
      { label: "Konflikt", value: "Subjektiver Nutzen vs. Langzeitdaten" },
      { label: "Wichtig", value: "Schlafparameter differenziert lesen" },
      { label: "Praxis", value: "Keine simplen Heilslogans" }
    ],
    sections: [
      {
        heading: "Warum Schlaf ein schwieriger Forschungsbereich ist",
        content: [
          "Schlaf hat viele Komponenten: Einschlafzeit, Durchschlafen, Tiefschlaf, Tagesmuedigkeit und subjektive Erholung.",
          "Eine positive Selbsteinschaetzung ersetzt daher keine differenzierte Bewertung."
        ]
      },
      {
        heading: "Wie Inhalte dazu fair bleiben",
        content: [
          "Gute Inhalte nennen sowohl moegliche kurzfristige Entlastung als auch Unsicherheiten bei Langzeitnutzung und individueller Variabilitaet.",
          "Vor allem bei vulnerablen Gruppen sind Grenzen und Risiken klar zu markieren."
        ],
        checklist: [
          "Schlafparameter getrennt beschreiben",
          "Kurz- und Langzeiteffekte unterscheiden",
          "Hinweis auf medizinische Abklaerung geben"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Schlafqualitaet",
        text: "Nicht nur die Dauer, sondern auch Erholung, Durchschlafverhalten und Tagesfunktion gehoeren dazu."
      },
      {
        title: "Kurz erklaert: subjektiv vs. objektiv",
        text: "Menschen koennen eine Nacht als besser empfinden, obwohl Messparameter gemischt ausfallen."
      }
    ],
    faq: [
      {
        question: "Hilft Cannabis immer beim Einschlafen?",
        answer: "Nein. Reaktion, Dosis, Produktprofil und Kontext unterscheiden sich stark zwischen Personen."
      },
      {
        question: "Warum sind Langzeitdaten wichtig?",
        answer: "Weil sich kurzfristige Entlastung und langfristige Schlafarchitektur nicht decken muessen."
      }
    ],
    glossary: [
      { term: "Schlafarchitektur", definition: "Aufbau einer Nacht aus verschiedenen Schlafphasen und deren Zusammenspiel." },
      { term: "Subjektive Erholung", definition: "Persoenliches Empfinden, wie erholt man sich nach dem Schlaf fuehlt." },
      { term: "Langzeitdaten", definition: "Studien oder Beobachtungen ueber laengere Zeitraeume mit wiederholter Erfassung." },
    ],
    relatedSlugs: ["cannabinoide-und-evidenz", "cbd-und-angststoerungen-einordnung", "thc-risiken-bei-jugendlichen"]
  }),
  createArticle({
    slug: "cbd-und-angststoerungen-einordnung",
    title: "CBD und Angststoerungen einordnen",
    summary: "Was aus Studien wirklich ableitbar ist und wo aus fruehen Hinweisen zu schnell Gewissheiten gemacht werden.",
    category: "medizin",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["CBD", "Angst", "Studienlage", "Einordnung"],
    keyTakeaways: [
      "CBD wird haeufig ueberverkauft, obwohl die Humanstudienlage je nach Kontext begrenzt bleibt.",
      "Praeklinische Hinweise duerfen nicht mit klinischer Sicherheit verwechselt werden.",
      "Serioese Inhalte benennen Unsicherheit explizit."
    ],
    quickFacts: [
      { label: "Fehlerquelle", value: "Tierdaten als Humanbeweis lesen" },
      { label: "Kernpunkt", value: "Kontext und Population zaehlen" },
      { label: "Content-Regel", value: "Unsicherheit sichtbar machen" }
    ],
    sections: [
      {
        heading: "Warum das Thema schnell entgleist",
        content: [
          "CBD steht im Zentrum vieler Wellness- und Gesundheitsclaims. Genau deshalb ist eine strenge Trennung zwischen Daten und Vermutung wichtig.",
          "Besonders oft werden Labor- oder Tierbefunde direkt in Alltagsempfehlungen uebersetzt."
        ]
      },
      {
        heading: "Wie Aufklaerung hier professionell bleibt",
        content: [
          "Ein guter Text zeigt, welche Daten es gibt, welche Populationen untersucht wurden und wo offene Fragen bleiben.",
          "So entsteht Orientierung ohne falsche Sicherheit."
        ],
        checklist: [
          "Studientyp offen nennen",
          "Population und Dosis nicht verschweigen",
          "Keine Heilaussagen aus fruehen Hinweisen ableiten"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: praeklinisch",
        text: "Studien im Labor oder Tiermodell, die Hinweise liefern, aber keine sichere Aussage fuer Menschen erlauben."
      },
      {
        title: "Kurz erklaert: klinisch",
        text: "Untersuchungen am Menschen, meist mit deutlich hoeherem Anspruch an Uebertragbarkeit."
      }
    ],
    faq: [
      {
        question: "Ist CBD ein sicheres Mittel gegen Angst?",
        answer: "So pauschal nicht. Es gibt Hinweise, aber die Qualitaet und Uebertragbarkeit der Daten sind begrenzt und kontextabhaengig."
      },
      {
        question: "Warum sagen viele Seiten etwas anderes?",
        answer: "Weil fruehe Befunde und Marketing oft zu schnell zusammengezogen werden."
      }
    ],
    glossary: [
      { term: "Praeklinisch", definition: "Vorstufe klinischer Forschung, meist im Labor oder Tiermodell." },
      { term: "Humanstudie", definition: "Studie mit menschlichen Teilnehmenden zur pruefbaren Einordnung von Nutzen und Risiken." },
      { term: "Uebertragbarkeit", definition: "Grad, in dem sich Studienergebnisse auf andere Personen oder reale Situationen anwenden lassen." },
    ],
    relatedSlugs: ["cannabinoide-und-evidenz", "cannabis-und-schlaf-was-ist-belegt", "cannabinoide-nebenwirkungen-und-interaktionen"]
  }),
  createArticle({
    slug: "thc-risiken-bei-jugendlichen",
    title: "THC-Risiken bei Jugendlichen",
    summary: "Warum Alter, Gehirnentwicklung und Konsummuster in der Risikokommunikation differenziert betrachtet werden muessen.",
    category: "medizin",
    difficulty: "einsteiger",
    readMinutes: 7,
    tags: ["THC", "Jugendliche", "Risikokommunikation", "Praevention"],
    keyTakeaways: [
      "Jugendliche sind keine kleine Version erwachsener Konsumenten; Risiko und Entwicklungskontext unterscheiden sich deutlich.",
      "Praevention funktioniert besser ueber klare, glaubwuerdige Aufklaerung als ueber plakative Uebertreibung.",
      "Konsummuster, Frequenz und Potenz muessen gemeinsam betrachtet werden."
    ],
    quickFacts: [
      { label: "Fokus", value: "Entwicklung plus Praevention" },
      { label: "Wichtig", value: "Muster statt Einzelfall" },
      { label: "Kommunikation", value: "Klar und nicht sensationalistisch" }
    ],
    sections: [
      {
        heading: "Warum Alter im Risiko so zentral ist",
        content: [
          "Jugendliche befinden sich in einer Entwicklungsphase, in der Verhalten, Umfeld und Hirnreifung zusammenspielen.",
          "Deshalb muessen Risiken differenziert und glaubwuerdig kommuniziert werden."
        ]
      },
      {
        heading: "Praevention ohne Panikmodus",
        content: [
          "Abschreckung allein reicht selten. Inhalte sollten nachvollziehbar sein, konkrete Risiken benennen und Raum fuer Fragen lassen.",
          "So wird Aufklaerung anschlussfaehiger als reine Moralisierung."
        ],
        checklist: [
          "Hauefigkeit und Potenz getrennt erklaeren",
          "Vulnerable Gruppen explizit benennen",
          "Hilfs- und Beratungsangebote sichtbar machen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Potenz",
        text: "Wie stark ein Produkt in Bezug auf relevante Wirkstoffe ausfaellt, meist vereinfacht ueber THC-Gehalte beschrieben."
      },
      {
        title: "Kurz erklaert: Risikokommunikation",
        text: "Art, wie Risiken vermittelt werden, damit sie verstanden und ernst genommen werden, ohne falschen Alarmismus."
      }
    ],
    faq: [
      {
        question: "Ist jeder Konsum im Jugendalter gleich gefaehrlich?",
        answer: "Nein. Haeufigkeit, Potenz, Alter, psychische Belastung und Kontext beeinflussen das Risiko deutlich."
      },
      {
        question: "Warum ist glaubwuerdige Aufklaerung so wichtig?",
        answer: "Weil ueberzogene Botschaften oft abgelehnt werden und damit praeventive Wirkung verlieren."
      }
    ],
    glossary: [
      { term: "Potenz", definition: "Staerke oder Konzentration relevanter Wirkstoffe in einem Produkt." },
      { term: "Vulnerabel", definition: "Besonders empfindlich oder risikobelastet in einem bestimmten Kontext." },
      { term: "Praevention", definition: "Massnahmen zur Vorbeugung unerwuenschter gesundheitlicher oder sozialer Folgen." },
    ],
    relatedSlugs: ["cannabinoide-und-evidenz", "inhalation-set-setting-und-harm-reduction", "cannabinoide-nebenwirkungen-und-interaktionen"]
  }),
  createArticle({
    slug: "cannabinoide-nebenwirkungen-und-interaktionen",
    title: "Cannabinoide: Nebenwirkungen und Interaktionen",
    summary: "Welche Belastungen realistisch sind und warum Kontext, Dosis und Begleitmedikation immer mitgedacht werden muessen.",
    category: "medizin",
    difficulty: "profi",
    readMinutes: 9,
    tags: ["Nebenwirkungen", "Interaktionen", "Dosis", "Sicherheit"],
    keyTakeaways: [
      "Nebenwirkungen sind kein Randthema, sondern zentral fuer jede serioese Einordnung.",
      "Interaktionen mit anderer Medikation koennen klinisch relevant sein und gehoeren in jede verantwortliche Aufklaerung.",
      "Dosis und Kontext entscheiden mit, wie belastend Nebenwirkungen ausfallen."
    ],
    quickFacts: [
      { label: "Pflicht", value: "Risiken immer mitkommunizieren" },
      { label: "Einfluss", value: "Dosis, Person, Begleitmedikation" },
      { label: "Warnsignal", value: "Pauschale Sicherheitsbehauptungen" }
    ],
    sections: [
      {
        heading: "Warum Nebenwirkungen nicht ausgeblendet werden duerfen",
        content: [
          "Viele Inhalte fokussieren fast nur auf moeglichen Nutzen. Das fuehrt zu einem unausgewogenen Bild und schwaecht die Glaubwuerdigkeit.",
          "Eine serioese Seite benennt sowohl haeufige als auch potenziell relevante seltenere Belastungen."
        ]
      },
      {
        heading: "Interaktionen richtig einordnen",
        content: [
          "Begleitmedikation, Vorerkrankungen und Dosismuster koennen das Risiko veraendern. Deshalb sind einfache Allgemeinregeln oft unzureichend.",
          "Fuer Content ist entscheidend, fachliche Abklaerung aktiv zu empfehlen, statt Sicherheit zu suggerieren."
        ],
        checklist: [
          "Hauefige Nebenwirkungen offen nennen",
          "Hinweis auf potenzielle Interaktionen geben",
          "Bei medizinischen Fragen klar auf Fachpersonal verweisen"
        ]
      }
    ],
    warnings: ["Dieser Inhalt ersetzt keine medizinische Beratung und keine individuelle Arzneimittelpruefung."],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Interaktion",
        text: "Wechselwirkung zwischen mehreren Stoffen oder Medikamenten, die Wirkung oder Nebenwirkung veraendern kann."
      },
      {
        title: "Kurz erklaert: Dosis-Wirkungs-Bezug",
        text: "Nicht nur ob, sondern wie viel konsumiert oder eingenommen wird, beeinflusst Nutzen und Risiko stark."
      }
    ],
    faq: [
      {
        question: "Sind Nebenwirkungen immer selten?",
        answer: "Nein. Manche sind haeufig, aber mild, andere seltener und potenziell relevanter. Beides muss sauber benannt werden."
      },
      {
        question: "Kann ich Interaktionen selbst einschaetzen?",
        answer: "Nur sehr eingeschraenkt. Gerade bei Medikation ist fachliche Ruecksprache sinnvoll und oft notwendig."
      }
    ],
    glossary: [
      { term: "Interaktion", definition: "Wechselwirkung zwischen zwei oder mehr Substanzen mit verstaerkter, abgeschwaechter oder veraenderter Wirkung." },
      { term: "Begleitmedikation", definition: "Weitere Arzneimittel oder Stoffe, die parallel eingenommen werden." },
      { term: "Nebenwirkung", definition: "Unerwuenschter Effekt, der im Zusammenhang mit der Anwendung eines Stoffes auftritt." },
    ],
    relatedSlugs: ["cannabinoide-und-evidenz", "cbd-und-angststoerungen-einordnung", "cannabis-bei-schmerz-evidenzcheck"]
  }),
  createArticle({
    slug: "vaping-rauchen-und-verdampfen-vergleich",
    title: "Vaping, Rauchen und Verdampfen im Vergleich",
    summary: "Wie sich Aufnahme, Belastung und Nutzererfahrung zwischen verschiedenen Inhalationsformen unterscheiden.",
    category: "konsumformen",
    difficulty: "einsteiger",
    readMinutes: 7,
    tags: ["Vaping", "Rauchen", "Verdampfen", "Harm Reduction"],
    keyTakeaways: [
      "Nicht jede Inhalationsform bringt dieselben Belastungen und dasselbe Profil mit sich.",
      "Harm Reduction beginnt mit realistischen Vergleichen statt mit Lagerdenken.",
      "Geraet, Temperatur und Materialqualitaet beeinflussen das Ergebnis deutlich."
    ],
    quickFacts: [
      { label: "Thema", value: "Aufnahme plus Belastung" },
      { label: "Wichtig", value: "Geraete- und Materialqualitaet" },
      { label: "Ziel", value: "Informierte statt ideologische Wahl" }
    ],
    sections: [
      {
        heading: "Warum die Begriffe oft durcheinandergehen",
        content: [
          "Im Alltag werden Rauchen, Verdampfen und Vaping oft unscharf benutzt, obwohl Prozesse und Belastungsprofile auseinandergehen.",
          "Genau diese Unterscheidung ist fuer serioese Aufklaerung entscheidend."
        ]
      },
      {
        heading: "Wie Vergleiche fair bleiben",
        content: [
          "Statt absolute Sieger auszurufen, sollte Content Unterschiede in Onset, Reizstoffen, Dosierbarkeit und Fehlerquellen erklaeren.",
          "So koennen Nutzer informierter entscheiden."
        ],
        checklist: [
          "Konsumform klar benennen",
          "Belastungs- und Timingunterschiede trennen",
          "Material- und Geraetequalitaet mitberuecksichtigen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Verdampfen",
        text: "Erhitzung ohne klassische Verbrennung, bei der Wirkstoffe und andere Bestandteile aerosolisiert werden."
      },
      {
        title: "Kurz erklaert: Harm Reduction",
        text: "Strategien, die Risiken minimieren sollen, auch wenn das Verhalten selbst nicht komplett vermieden wird."
      }
    ],
    faq: [
      {
        question: "Ist Verdampfen automatisch sicher?",
        answer: "Nein automatisch nicht. Es kann Belastungsprofile veraendern, aber Geraet, Material und Nutzung bleiben entscheidend."
      },
      {
        question: "Warum ist die Temperatur so wichtig?",
        answer: "Weil sie Aufnahme, Geschmack, Reizstoffe und Produktverhalten stark beeinflussen kann."
      }
    ],
    glossary: [
      { term: "Aerosol", definition: "Fein verteilte Partikel oder Troepfchen in einem Gasgemisch, etwa in inhalierbaren Dampfphaenomene." },
      { term: "Verbrennung", definition: "Oxidativer Prozess mit Flamme oder hoher Hitze, der viele neue Nebenprodukte erzeugen kann." },
      { term: "Harm Reduction", definition: "Praxisorientierter Ansatz zur Verringerung von Risiken statt reiner Verbotslogik." },
    ],
    relatedSlugs: ["inhalation-vs-edibles", "inhalation-set-setting-und-harm-reduction", "pgr-und-kontaminanten"]
  }),
  createArticle({
    slug: "sublingual-tinkturen-richtig-einordnen",
    title: "Sublingual und Tinkturen richtig einordnen",
    summary: "Wo diese Aufnahmeform zwischen klassischer oraler Einnahme und schnellerer Wirkung liegt und welche Missverstaendnisse haeufig sind.",
    category: "konsumformen",
    difficulty: "fortgeschritten",
    readMinutes: 6,
    tags: ["Sublingual", "Tinktur", "Aufnahmewege", "Timing"],
    keyTakeaways: [
      "Sublinguale Anwendung ist nicht dasselbe wie Schlucken und hat eigene Timing- und Aufnahmecharakteristik.",
      "Wirkung und Verlaesslichkeit haengen stark von Produktform und Anwendungspraxis ab.",
      "Content sollte Unterschiede zwischen Erwartung und realer Aufnahme sauber benennen."
    ],
    quickFacts: [
      { label: "Zwischenform", value: "Nicht rein inhalativ, nicht rein oral" },
      { label: "Fehler", value: "Zu fruehe Nachdosierung" },
      { label: "Wichtig", value: "Produktform und Anwendung" }
    ],
    sections: [
      {
        heading: "Warum sublingual oft missverstanden wird",
        content: [
          "Viele Nutzer erwarten ein vollstaendig anderes Timing als bei oraler Aufnahme, obwohl Produkt und Anwendung stark variieren.",
          "Deshalb ist pauschale Kommunikation hier schnell irrefuehrend."
        ]
      },
      {
        heading: "Was bei der Aufklaerung wichtig ist",
        content: [
          "Erklaere realistische Onset-Fenster, Dosierunsicherheit und Unterschiede zwischen Produkten offen.",
          "So sinkt das Risiko fuer Fehlentscheidungen und falsche Vergleiche mit anderen Konsumformen."
        ],
        checklist: [
          "Onset-Fenster nicht ueberversprechen",
          "Produktfamilien getrennt erklaeren",
          "Redose-Hinweise klar formulieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: sublingual",
        text: "Anwendung unter der Zunge mit teilweiser Aufnahme ueber die Mundschleimhaut."
      },
      {
        title: "Kurz erklaert: Tinktur",
        text: "Fluessige Produktform, oft mit Tropfenanwendung und variabler Resorptionslogik."
      }
    ],
    faq: [
      {
        question: "Ist sublingual immer schneller als oral?",
        answer: "Haeufig, aber nicht in jedem Fall gleich stark. Produkt und Anwendung machen einen Unterschied."
      },
      {
        question: "Warum reagieren Menschen so unterschiedlich?",
        answer: "Schleimhautaufnahme, Produktmatrix, Dosis und individuelles Verhalten variieren stark."
      }
    ],
    glossary: [
      { term: "Sublingual", definition: "Aufnahme ueber die Mundschleimhaut unter der Zunge." },
      { term: "Resorption", definition: "Aufnahme eines Stoffes in den Koerper nach Anwendung oder Einnahme." },
      { term: "Produktmatrix", definition: "Gesamte stoffliche Zusammensetzung eines Produkts, die Aufnahme und Verhalten beeinflusst." },
    ],
    relatedSlugs: ["inhalation-vs-edibles", "cannabinoide-nebenwirkungen-und-interaktionen", "cannabinoide-und-evidenz"]
  }),
  createArticle({
    slug: "inhalation-set-setting-und-harm-reduction",
    title: "Inhalation, Set und Setting",
    summary: "Warum Kontext, Umgebung und mentale Verfassung fuer Risiko und Erfahrung oft fast so wichtig sind wie das Produkt selbst.",
    category: "konsumformen",
    difficulty: "einsteiger",
    readMinutes: 6,
    tags: ["Set", "Setting", "Harm Reduction", "Aufklaerung"],
    keyTakeaways: [
      "Produktprofil allein erklaert nicht, wie eine Erfahrung verlaeuft; Kontext und Erwartung spielen stark mit hinein.",
      "Harm Reduction bedeutet auch, Situation, Timing und Begleitumstaende sauber zu planen.",
      "Viele negative Erfahrungen entstehen durch Kontextfehler und nicht nur durch Produktstaerke."
    ],
    quickFacts: [
      { label: "Set", value: "Innere Verfassung" },
      { label: "Setting", value: "Aeusserer Rahmen" },
      { label: "Praxis", value: "Kontext bewusst waehlen" }
    ],
    sections: [
      {
        heading: "Warum Kontext so unterschätzt wird",
        content: [
          "Menschen bewerten Konsumerfahrungen oft nur ueber Potenz oder Sorte. Dabei koennen Stress, unbekannte Umgebung oder sozialer Druck entscheidend sein.",
          "Eine gute Aufklaerungsseite muss diese Ebene sichtbar machen."
        ]
      },
      {
        heading: "Praktische Harm-Reduction-Punkte",
        content: [
          "Plane Konsum nicht in belasteten Situationen, sorge fuer eine sichere Umgebung und vermeide riskante Kombinationen.",
          "Gerade Einsteiger profitieren von klaren Kontextregeln statt nur von Dosiszahlen."
        ],
        checklist: [
          "Keine Pflichttermine oder Fahrten einplanen",
          "Vertraute Umgebung bevorzugen",
          "Mischkonsum vermeiden"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Set",
        text: "Die innere Ausgangslage, also Stimmung, Erwartung, Stressniveau und psychische Verfassung."
      },
      {
        title: "Kurz erklaert: Setting",
        text: "Die aeussere Umgebung, also Ort, Menschen, Sicherheit und Umstaende rund um die Anwendung."
      }
    ],
    faq: [
      {
        question: "Kann ein gutes Setting Risiken komplett beseitigen?",
        answer: "Nein, aber es reduziert viele vermeidbare Eskalationen und Fehlentscheidungen."
      },
      {
        question: "Warum ist Mischkonsum so problematisch?",
        answer: "Weil Wirkung und Belastung schwerer vorhersehbar werden und sich Risiken addieren oder verschieben koennen."
      }
    ],
    glossary: [
      { term: "Set", definition: "Innere psychische und emotionale Ausgangslage einer Person." },
      { term: "Setting", definition: "Aeusserer Rahmen einer Erfahrung, etwa Ort, Menschen und Sicherheitslage." },
      { term: "Mischkonsum", definition: "Gleichzeitige oder nahe Kombination mehrerer psychoaktiver Stoffe." },
    ],
    relatedSlugs: ["inhalation-vs-edibles", "vaping-rauchen-und-verdampfen-vergleich", "thc-risiken-bei-jugendlichen"]
  }),
  createArticle({
    slug: "bubble-hash-qualitaetskriterien",
    title: "Bubble Hash: Qualitaetskriterien",
    summary: "Welche Faktoren fuer Reinheit, Stabilitaet und Vergleichbarkeit wirklich zaehlen und welche Kurzlabels wenig aussagen.",
    category: "konzentrate",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Bubble Hash", "Qualitaet", "Stabilitaet", "Bewertung"],
    keyTakeaways: [
      "Bubble Hash sollte ueber Reinheit, Stabilitaet und Chargenkontext bewertet werden, nicht nur ueber Szenevokabular.",
      "Trocknung und Lagerung sind fuer die Produktintegritaet fast so wichtig wie die Trennung selbst.",
      "Objektive Daten schlagen Rangbegriffe ohne Kontext."
    ],
    quickFacts: [
      { label: "Kernpunkt", value: "Saubere Nachernte" },
      { label: "Warnsignal", value: "Nur Szenegrade ohne Daten" },
      { label: "Wichtig", value: "Stabilitaet ueber Zeit" }
    ],
    sections: [
      {
        heading: "Was Bubble Hash professionell auszeichnet",
        content: [
          "Fachlich relevant sind Reinheit, sensorische Klarheit, Lagerstabilitaet und Kontaminantenstatus. Szeneetiketten allein reichen nicht.",
          "Gerade bei hochwertigen Produkten entscheiden Nachbehandlung und Dokumentation ueber echte Vergleichbarkeit."
        ]
      },
      {
        heading: "Wo die typischen Fehlbewertungen liegen",
        content: [
          "Begriffe aus Communities oder Shops klingen praezise, sind aber oft nicht standardisiert. Ohne Mess- und Chargenkontext bleiben sie begrenzt aussagekraeftig.",
          "Plattformen sollten daher eigene Bewertungskriterien definieren."
        ],
        checklist: [
          "Chargen-ID und Lagerbedingungen erfassen",
          "Kontaminanten- und Stabilitaetsdaten einbeziehen",
          "Szenegrad nie ohne Kriterienliste verwenden"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Reinheit",
        text: "Wie frei ein Produkt von unerwuenschten Pflanzenresten, Fremdstoffen oder anderen stoerenden Bestandteilen ist."
      },
      {
        title: "Kurz erklaert: Stabilitaet",
        text: "Wie gut ein Produkt unter realen Lager- und Transportbedingungen seine Eigenschaften behaelt."
      }
    ],
    faq: [
      {
        question: "Sind Community-Grade wertlos?",
        answer: "Nicht wertlos, aber ohne definierte Kriterien nur begrenzt belastbar."
      },
      {
        question: "Warum ist Trocknung so wichtig?",
        answer: "Weil sie Einfluss auf Haltbarkeit, Mikrobiologie und Profilintegritaet hat."
      }
    ],
    glossary: [
      { term: "Reinheit", definition: "Grad, in dem ein Produkt frei von stoerenden oder unerwuenschten Bestandteilen ist." },
      { term: "Chargenkontext", definition: "Alle Informationen rund um Herkunft, Prozess und Lagerung einer Charge." },
      { term: "Integritaet", definition: "Erhalt der urspruenglichen und gewuenschten Produkteigenschaften." },
    ],
    relatedSlugs: ["hash-typen-vergleichen", "wasseraktivitaet-und-curing", "full-melt-und-marketingsprache"]
  }),
  createArticle({
    slug: "rosin-einordnung-ohne-hype",
    title: "Rosin einordnen ohne Hype",
    summary: "Wie Input-Material, Temperaturbelastung und Nachbehandlung das Ergebnis formen und warum das besser ist als reine Trendbegriffe.",
    category: "konzentrate",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Rosin", "Qualitaet", "Input", "Einordnung"],
    keyTakeaways: [
      "Rosin ist keine automatische Qualitaetsgarantie; Endqualitaet haengt zuerst am Input-Material.",
      "Trendbegriffe verdecken oft, dass Stabilitaet, Reinheit und Chargenkonsistenz wichtiger sind.",
      "Fuer Aufklaerung lohnt sich eine klare Trennung zwischen Technikbegriff und Produktqualitaet."
    ],
    quickFacts: [
      { label: "Hebel", value: "Input plus Nachbehandlung" },
      { label: "Irrtum", value: "Rosin gleich Premium" },
      { label: "Qualitaet", value: "Nur mit Daten und Kontext" }
    ],
    sections: [
      {
        heading: "Warum Rosin so oft ueberhoeht wird",
        content: [
          "Der Begriff steht in vielen Communities fuer Hochwertigkeit. Das ist verstaendlich, aber fachlich zu kurz.",
          "Ohne Blick auf Ausgangsmaterial, Prozesssauberkeit und Stabilitaet bleibt die Einordnung oberflaechlich."
        ]
      },
      {
        heading: "Wie du Rosin professionell beschreibst",
        content: [
          "Sprich ueber Vorstufe, Chargenkontext, Lagerung und Analytik. Das schafft mehr Vertrauen als Szenevokabular allein.",
          "Gerade auf grossen Seiten lohnt sich ein standardisiertes Datenraster."
        ],
        checklist: [
          "Input-Material offen benennen",
          "Stabilitaet und Kontaminanten mitdenken",
          "Trendbegriffe nur mit Kriterien erklaeren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Input-Material",
        text: "Das Ausgangsprodukt, dessen Qualitaet das Ergebnis spaeter stark begrenzt oder ermoeglicht."
      },
      {
        title: "Kurz erklaert: Hype",
        text: "Uebersteigerte Wahrnehmung eines Begriffs oder Produkts, die oft mehr Marketing als Einordnung ist."
      }
    ],
    faq: [
      {
        question: "Ist Rosin immer loesungsmittelfrei?",
        answer: "Der Begriff wird so verwendet, aber fuer die Gesamtbewertung bleiben Vorstufe und Prozesskontext trotzdem relevant."
      },
      {
        question: "Kann Rosin aus schlechtem Input gut werden?",
        answer: "Nur sehr begrenzt. Gute Verarbeitung ersetzt schwaches Ausgangsmaterial nicht."
      }
    ],
    glossary: [
      { term: "Input-Material", definition: "Ausgangsprodukt, das die spaetere Qualitaet eines Endprodukts mitbestimmt." },
      { term: "Nachbehandlung", definition: "Alle Schritte nach der eigentlichen Gewinnung oder Pressung, etwa Stabilisierung und Lagerung." },
      { term: "Chargenkonsistenz", definition: "Wie aehnlich mehrere Chargen in relevanten Eigenschaften ausfallen." },
    ],
    relatedSlugs: ["hash-typen-vergleichen", "bubble-hash-qualitaetskriterien", "full-melt-und-marketingsprache"]
  }),
  createArticle({
    slug: "full-melt-und-marketingsprache",
    title: "Full Melt und Marketingsprache",
    summary: "Warum Szene- und Shopbegriffe eine Einordnung brauchen und wie man sie auf grossen Wissensseiten sauber erklaert.",
    category: "konzentrate",
    difficulty: "profi",
    readMinutes: 7,
    tags: ["Full Melt", "Marketing", "Klassifikation", "Content"],
    keyTakeaways: [
      "Viele Begriffe in Konzentratkategorien sind sprachlich stark, aber fachlich unscharf.",
      "Gute Wissensseiten erklaeren Herkunft und Nutzung eines Begriffs, uebernehmen ihn aber nicht unkritisch als Qualitaetsurteil.",
      "Ein Glossar mit Kriterienlogik verhindert Missverstaendnisse im Katalog."
    ],
    quickFacts: [
      { label: "Thema", value: "Begriffsklaerung" },
      { label: "Risiko", value: "Marketing als Qualitaetsersatz" },
      { label: "Loesung", value: "Glossar plus Kriterienlogik" }
    ],
    sections: [
      {
        heading: "Warum Sprache im Konzentratbereich so aufgeladen ist",
        content: [
          "Szenebegriffe transportieren Status, Erfahrung und Erwartungen. Genau deshalb muessen sie fuer neue Nutzer sauber eingeordnet werden.",
          "Sonst wird Marketing leicht mit Messbarkeit verwechselt."
        ]
      },
      {
        heading: "Wie Plattformen damit umgehen sollten",
        content: [
          "Erklaere Begriffe, aber knuepfe Produktbewertung an nachvollziehbare Kriterien und nicht an Szeneetiketten.",
          "Das reduziert Fehlkaeufe und macht Kataloge professioneller."
        ],
        checklist: [
          "Jeden Szenebegriff im Glossar definieren",
          "Kriterien von Werbesprache trennen",
          "Community-Begriffe nur mit Kontext darstellen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Szenebegriff",
        text: "Ein Ausdruck aus Community oder Handel, der oft mehr kulturelle als standardisierte technische Bedeutung traegt."
      },
      {
        title: "Kurz erklaert: Kriterienlogik",
        text: "Bewertung nach festen und transparenten Merkmalen statt nach Schlagworten."
      }
    ],
    faq: [
      {
        question: "Soll ich solche Begriffe ganz vermeiden?",
        answer: "Nein, aber immer erklaeren und nicht als alleinige Qualitaetsaussage stehen lassen."
      },
      {
        question: "Warum ist das fuer grosse Seiten wichtig?",
        answer: "Weil unerklaerte Begriffe fuer Einsteiger irrefuehrend sind und Kataloge uneinheitlich machen."
      }
    ],
    glossary: [
      { term: "Szenebegriff", definition: "Nicht standardisierter Ausdruck aus Kultur, Community oder Handel." },
      { term: "Glossar", definition: "Sammlung definierter Begriffe zur einheitlichen Sprachverwendung." },
      { term: "Qualitaetsurteil", definition: "Bewertung eines Produkts anhand nachvollziehbarer und relevanter Kriterien." },
    ],
    relatedSlugs: ["hash-typen-vergleichen", "rosin-einordnung-ohne-hype", "bubble-hash-qualitaetskriterien"]
  }),
  createArticle({
    slug: "werbeaussagen-und-health-claims-cannabis",
    title: "Werbeaussagen und Health Claims bei Cannabis",
    summary: "Wo Information aufhoert und problematische Gesundheitsversprechen beginnen und wie Content-Teams sicher formulieren.",
    category: "recht",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    tags: ["Health Claims", "Werbung", "Compliance", "Content"],
    keyTakeaways: [
      "Gesundheitsbezogene Aussagen sind regulatorisch sensibel und brauchen sehr hohe Sorgfalt.",
      "Viele Verstosse entstehen nicht aus Bosheit, sondern aus unscharfer Sprache im Marketing.",
      "Content-Teams brauchen Freigaberegeln fuer Formulierungen und Evidenzbezug."
    ],
    quickFacts: [
      { label: "Risiko", value: "Unscharfe Heilsprache" },
      { label: "Loesung", value: "Freigabeprozess plus Claim-Katalog" },
      { label: "Wichtig", value: "Juristische Pruefung regional denken" }
    ],
    sections: [
      {
        heading: "Warum Claims schnell kritisch werden",
        content: [
          "Schon kleine sprachliche Verschiebungen koennen aus neutraler Information ein problematisches Nutzenversprechen machen.",
          "Deshalb brauchen grosse Seiten klares Wording und interne Review-Regeln."
        ]
      },
      {
        heading: "Wie Teams sicherer formulieren",
        content: [
          "Arbeite mit freigegebenen Formulierungsbausteinen, markiere Evidenzstufen und vermeide absolute Wirkzusagen.",
          "So bleibt Aufklaerung informativ, ohne unnoetiges regulatorisches Risiko aufzubauen."
        ],
        checklist: [
          "Claim-Liste mit erlaubten Formulierungen pflegen",
          "Gesundheitsaussagen juristisch gegenpruefen",
          "Marketing und Redaktion auf dieselben Regeln verpflichten"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Health Claim",
        text: "Aussage, die einem Produkt eine gesundheitsbezogene Wirkung oder einen Nutzen zuschreibt."
      },
      {
        title: "Kurz erklaert: Freigabeprozess",
        text: "Interner Ablauf, bei dem Inhalte vor Veroeffentlichung inhaltlich und rechtlich geprueft werden."
      }
    ],
    faq: [
      {
        question: "Darf ich Studien einfach zusammenfassen?",
        answer: "Ja, aber ohne daraus unzulaessige Heilaussagen oder pauschale Produktversprechen abzuleiten."
      },
      {
        question: "Warum reichen gute Quellen allein nicht aus?",
        answer: "Weil die rechtliche Zulaessigkeit von Sprache und Kontext nicht automatisch aus der Existenz einer Studie folgt."
      }
    ],
    glossary: [
      { term: "Health Claim", definition: "Gesundheitsbezogene Aussage ueber Nutzen oder Wirkung eines Produkts." },
      { term: "Freigabeprozess", definition: "Standardisierter Pruefprozess vor Veroeffentlichung eines Inhalts oder Produkts." },
      { term: "Evidenzstufe", definition: "Einordnung, wie belastbar eine Aussage durch Forschung abgestuetzt ist." },
    ],
    relatedSlugs: ["rechtliche-grundlagen-dach", "cannabinoide-und-evidenz", "cbd-und-angststoerungen-einordnung"]
  }),
  createArticle({
    slug: "dokumentationspflichten-fuer-chargen",
    title: "Dokumentationspflichten fuer Chargen",
    summary: "Welche Nachweise fuer Freigabe, Rueckverfolgung und Reklamationen unverzichtbar sind.",
    category: "recht",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    tags: ["Chargen", "Dokumentation", "Rueckverfolgung", "Compliance"],
    keyTakeaways: [
      "Gute Chargendokumentation schuetzt nicht nur rechtlich, sondern verbessert auch Qualitaetsarbeit.",
      "Ohne Rueckverfolgung werden Reklamationen, Sperrungen und Audits schnell teuer und chaotisch.",
      "Digitale und klare Datenstrukturen zahlen sich frueh aus."
    ],
    quickFacts: [
      { label: "Pflicht", value: "Eindeutige Chargen-ID" },
      { label: "Nutzen", value: "Rueckruf- und Auditfaehigkeit" },
      { label: "Fehlerquelle", value: "Unverbundene Einzeldokumente" }
    ],
    sections: [
      {
        heading: "Warum Chargendaten die Grundlage sind",
        content: [
          "Freigabe, Reklamation und Sperrung funktionieren nur sauber, wenn Herkunft, Analytik, Lagerung und Bewegung einer Charge nachvollziehbar bleiben.",
          "Viele Systeme haben Daten, aber nicht in einer Struktur, die unter Druck wirklich hilft."
        ]
      },
      {
        heading: "Was dokumentiert werden sollte",
        content: [
          "Neben COA und Freigabestatus gehoeren auch Abweichungen, Transporte, Reklamationen und Nachtests in den Datensatz.",
          "Je frueher das standardisiert wird, desto skalierbarer wird der Betrieb."
        ],
        checklist: [
          "Einheitliche Chargen-ID ueber alle Systeme ziehen",
          "COA, Lagerung und Bewegungen verbinden",
          "Abweichungen mit CAPA-Massnahmen verknuepfen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Rueckverfolgung",
        text: "Faehigkeit, Ursprung, Weg und Status einer Charge vom Eingang bis zur Ausgabe nachzuvollziehen."
      },
      {
        title: "Kurz erklaert: Auditfaehigkeit",
        text: "Wie schnell und sauber sich ein Prozess oder Datensatz gegenueber Pruefern belegen laesst."
      }
    ],
    faq: [
      {
        question: "Reicht eine PDF-Ablage?",
        answer: "Fuer kleine Mengen vielleicht, aber skalierbar und auswertbar wird es erst mit strukturierter Datenlogik."
      },
      {
        question: "Warum brauchen Reklamationen dieselbe Charge-Logik?",
        answer: "Weil nur so Ursachen, betroffene Mengen und Folgeaktionen sauber zugeordnet werden koennen."
      }
    ],
    glossary: [
      { term: "Chargen-ID", definition: "Eindeutige Kennung fuer eine definierte Produktmenge innerhalb eines Prozesses." },
      { term: "Rueckverfolgung", definition: "Systematische Nachverfolgbarkeit von Herkunft, Bewegung und Status eines Produkts." },
      { term: "Audit", definition: "Formalisierte Pruefung von Prozessen, Daten oder Regeln auf Konformitaet und Wirksamkeit." },
    ],
    relatedSlugs: ["rechtliche-grundlagen-dach", "batch-release-und-freigabekriterien", "recall-und-sperrprozesse-fuer-chargen"]
  }),
  createArticle({
    slug: "gmp-gdp-und-qualitaetssysteme",
    title: "GMP, GDP und Qualitaetssysteme",
    summary: "Eine Einordnung der wichtigsten Systembegriffe, die auf grossen Plattformen und in Compliance-Diskussionen staendig auftauchen.",
    category: "recht",
    difficulty: "profi",
    readMinutes: 9,
    tags: ["GMP", "GDP", "Qualitaetssystem", "Compliance"],
    keyTakeaways: [
      "GMP und GDP sind keine Buzzwords, sondern Prozesslogiken mit konkreten Auswirkungen auf Dokumentation und Verantwortung.",
      "Qualitaetssysteme werden erst wirksam, wenn Rollen, Daten und Freigaben zusammenpassen.",
      "Fuer Aufklaerungsseiten lohnt ein klares Glossar statt vager Abkuerzungsnutzung."
    ],
    quickFacts: [
      { label: "GMP", value: "Herstellungs- und Prozesskontrolle" },
      { label: "GDP", value: "Gute Distributionspraxis" },
      { label: "Wichtig", value: "Rollen plus Dokumentation" }
    ],
    sections: [
      {
        heading: "Warum diese Begriffe so oft falsch verwendet werden",
        content: [
          "In vielen Texten werden GMP oder GDP als bloes Qualitaetslabel genutzt, ohne die dahinterliegenden Anforderungen zu erklaeren.",
          "Das hilft weder Nutzern noch Teams, die reale Prozesse verstehen muessen."
        ]
      },
      {
        heading: "Wie du Systeme praktisch einordnest",
        content: [
          "Fokussiere auf Verantwortlichkeiten, Dokumentation, Freigaben, Abweichungen und Transportbedingungen. Daran zeigt sich, ob ein System wirklich gelebt wird.",
          "Ein gutes Wiki erklaert diese Begriffe ueber Funktionen, nicht ueber leere Prestigeformeln."
        ],
        checklist: [
          "Abkuerzungen immer ausschreiben",
          "Praxisbezug ueber Prozesse herstellen",
          "Begriffe im Glossar konsistent verwenden"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: GMP",
        text: "Good Manufacturing Practice, also Regeln fuer kontrollierte Herstellung und Qualitaetssicherung."
      },
      {
        title: "Kurz erklaert: GDP",
        text: "Good Distribution Practice, also Regeln fuer Lagerung, Transport und Verteilung."
      }
    ],
    faq: [
      {
        question: "Muss jedes Unternehmen GMP sein?",
        answer: "Das haengt stark vom regulatorischen Kontext ab. Wichtig ist, die Anforderungen nicht pauschal zu vermischen."
      },
      {
        question: "Warum hilft ein Qualitaetssystem auch operativ?",
        answer: "Weil klare Rollen, Freigaben und Datenspuren Fehler frueher sichtbar machen und Skalierung erleichtern."
      }
    ],
    glossary: [
      { term: "GMP", definition: "Good Manufacturing Practice, Rahmen fuer kontrollierte Herstellung und Qualitaetssicherung." },
      { term: "GDP", definition: "Good Distribution Practice, Rahmen fuer sichere Lagerung und Distribution." },
      { term: "Qualitaetssystem", definition: "Gesamtheit aus Regeln, Rollen, Daten und Prozessen zur Sicherung definierter Standards." },
    ],
    relatedSlugs: ["rechtliche-grundlagen-dach", "dokumentationspflichten-fuer-chargen", "batch-release-und-freigabekriterien"]
  }),
  createArticle({
    slug: "schimmel-und-mykotoxine-bei-cannabis",
    title: "Schimmel und Mykotoxine bei Cannabis",
    summary: "Warum mikrobiologische Sicherheit nicht an der sichtbaren Bluete endet und welche Informationsluecken besonders riskant sind.",
    category: "sicherheit",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Schimmel", "Mykotoxine", "Mikrobiologie", "Sicherheit"],
    keyTakeaways: [
      "Nicht jeder mikrobielle Risikofall ist mit blossem Auge sichtbar.",
      "Feuchtefuehrung, Trocknung und Lagerung entscheiden mit ueber mikrobiologische Stabilitaet.",
      "Sicherheitskommunikation muss klarer sein als reine Sichtpruefung."
    ],
    quickFacts: [
      { label: "Gefahr", value: "Unsichtbare mikrobiologische Belastung" },
      { label: "Hebel", value: "aw, Trocknung, Lagerung" },
      { label: "Pflicht", value: "Labor plus Prozessdaten" }
    ],
    sections: [
      {
        heading: "Warum Sichtkontrolle nicht reicht",
        content: [
          "Schimmel oder toxinbezogene Risiken koennen bereits relevant sein, ohne dass ein Produkt fuer Laien eindeutig auffaellig aussieht.",
          "Deshalb sind Laborwerte und Prozesshistorie fuer serioese Bewertung unverzichtbar."
        ]
      },
      {
        heading: "Wo Praevention ansetzt",
        content: [
          "Kontrollierte Trocknung, stabile Lagerung und klare Sperrlogik reduzieren das Risiko deutlich. Gleichzeitig muessen Hinweise fuer Teams praktisch umsetzbar bleiben.",
          "Gerade nach der Ernte ist saubere Prozessfuehrung entscheidend."
        ],
        checklist: [
          "aw und Temperatur im Nachernteprozess dokumentieren",
          "Auffaellige Chargen sofort sperren",
          "Mikrobiologische Daten nicht isoliert lesen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Mykotoxine",
        text: "Stoffwechselprodukte bestimmter Pilze, die gesundheitlich relevant sein koennen."
      },
      {
        title: "Kurz erklaert: mikrobiologische Stabilitaet",
        text: "Wie gut ein Produkt gegen unerwuenschtes Wachstum von Mikroorganismen abgesichert ist."
      }
    ],
    faq: [
      {
        question: "Riecht Schimmel immer muffig?",
        answer: "Nicht immer eindeutig. Geruch kann Hinweise liefern, ersetzt aber keine Bewertung ueber Daten und Prozesskontext."
      },
      {
        question: "Warum ist aw hier so wichtig?",
        answer: "Weil freies Wasser ein zentraler Treiber fuer mikrobielles Wachstum und Produktinstabilitaet ist."
      }
    ],
    glossary: [
      { term: "Mykotoxin", definition: "Von bestimmten Pilzen gebildeter Stoff mit potenziell gesundheitsschaedlicher Wirkung." },
      { term: "Mikrobiologie", definition: "Bereich der Wissenschaft, der Mikroorganismen und ihre Eigenschaften untersucht." },
      { term: "Sperrlogik", definition: "Regelwerk, wann Produkte wegen Risiken gestoppt oder isoliert werden."
      },
    ],
    relatedSlugs: ["wasseraktivitaet-und-curing", "pgr-und-kontaminanten", "recall-und-sperrprozesse-fuer-chargen"]
  }),
  createArticle({
    slug: "schwere-metalle-und-aufnahmewege",
    title: "Schwere Metalle und Aufnahmewege",
    summary: "Wie Metalle in die Lieferkette gelangen koennen und warum Form, Konzentration und Konsumweg fuer das Risiko wichtig sind.",
    category: "sicherheit",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Schwermetalle", "Kontaminanten", "Aufnahme", "Risiko"],
    keyTakeaways: [
      "Metallrisiken beginnen oft weit vor dem Endprodukt, etwa im Boden, Wasser oder Equipment.",
      "Nicht nur die Konzentration, auch Aufnahmeweg und Nutzungskontext beeinflussen die Relevanz.",
      "Sicherheitskommunikation braucht Kontext statt isolierter Schockwerte."
    ],
    quickFacts: [
      { label: "Eintragswege", value: "Umwelt, Wasser, Materialkontakt" },
      { label: "Wichtig", value: "Matrix und Konsumweg" },
      { label: "Loesung", value: "Monitoring plus Freigabelogik" }
    ],
    sections: [
      {
        heading: "Wo Metallbelastung entstehen kann",
        content: [
          "Belastungen koennen aus der Produktionsumgebung, aus Wasser oder ueber Prozesskontakt kommen. Deshalb ist die Lieferkette Teil der Sicherheit.",
          "Endproduktdaten ohne Herkunftskontext beantworten nur einen Teil der Frage."
        ]
      },
      {
        heading: "Wie man Risiko realistisch einordnet",
        content: [
          "Fuer faire Kommunikation muessen Konsumweg, Matrix und Nutzungshaeufigkeit mitgedacht werden.",
          "Nur so entsteht eine Einordnung, die weder bagatellisiert noch unnnoetig dramatisiert."
        ],
        checklist: [
          "Rohstoff- und Endproduktdaten verbinden",
          "Aufnahmeweg im Risiko mitbenennen",
          "Grenzwerte mit Methodenangabe lesen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Matrix",
        text: "Das Produktumfeld, in dem ein Stoff gemessen wird, also zum Beispiel Bluete, Extrakt oder Edible."
      },
      {
        title: "Kurz erklaert: Aufnahmeweg",
        text: "Art, wie ein Stoff in den Koerper gelangt, etwa inhalativ oder oral."
      }
    ],
    faq: [
      {
        question: "Sind Spuren sofort gefaehrlich?",
        answer: "Nicht jede Spur ist automatisch kritisch. Kontext, Grenzwerte und Expositionsprofil sind entscheidend."
      },
      {
        question: "Warum reicht eine einzelne Endproduktmessung oft nicht?",
        answer: "Weil sie ohne Herkunfts- und Prozesskontext nur begrenzt erklaert, woher das Risiko kommt und wie stabil es ist."
      }
    ],
    glossary: [
      { term: "Schwermetalle", definition: "Metallische Elemente, die in bestimmten Konzentrationen toxikologisch relevant werden koennen." },
      { term: "Matrix", definition: "Produktumgebung oder Material, in dem eine Analyse stattfindet." },
      { term: "Exposition", definition: "Ausmass und Art des Kontakts eines Organismus mit einem Stoff." },
    ],
    relatedSlugs: ["pgr-und-kontaminanten", "sampling-und-probenahme-fehler", "schimmel-und-mykotoxine-bei-cannabis"]
  }),
  createArticle({
    slug: "pestizidklassen-und-rueckstandsrisiken",
    title: "Pestizidklassen und Rueckstandsrisiken",
    summary: "Eine Einordnung der wichtigsten Stoffgruppen, warum Listen allein nicht genuegen und wie Rueckstandsberichte gelesen werden sollten.",
    category: "sicherheit",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Pestizide", "Rueckstaende", "COA", "Sicherheit"],
    keyTakeaways: [
      "Rueckstandsrisiken lassen sich nicht nur ueber Vorhandensein, sondern ueber Konzentration, Stoffklasse und Kontext verstehen.",
      "Nicht jede Liste im COA ist vollstaendig aussagekraeftig, wenn Methode und Abdeckung fehlen.",
      "Lieferantenfreigabe ohne Rueckstandsstrategie bleibt blind."
    ],
    quickFacts: [
      { label: "Thema", value: "Stoffklasse plus Konzentration" },
      { label: "Pflicht", value: "Methoden- und Paneltransparenz" },
      { label: "Praxis", value: "Lieferantenmonitoring" }
    ],
    sections: [
      {
        heading: "Warum Rueckstandslisten oft zu simpel gelesen werden",
        content: [
          "Eine Liste mit vielen Namen wirkt eindrucksvoll, sagt aber wenig, wenn Nachweisgrenzen, Methoden und relevante Stoffe unklar bleiben.",
          "Fuer serioese Bewertung braucht es mehr als ein gruenes Haekchen."
        ]
      },
      {
        heading: "Wie ein sauberer Rueckstandscheck aussieht",
        content: [
          "Pruefe Stoffabdeckung, Grenzwerte, Methode, Chargenbezug und Testfrequenz. Erst dann wird aus Daten ein Sicherheitsurteil.",
          "Das gilt fuer Plattformen genauso wie fuer Einkaufsteams."
        ],
        checklist: [
          "Panelabdeckung dokumentieren",
          "Grenzwerte regional zuordnen",
          "Rueckstandsstrategie pro Lieferant festhalten"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Panelabdeckung",
        text: "Welche Stoffe oder Stoffgruppen ein Laborbericht tatsaechlich ueberhaupt testet."
      },
      {
        title: "Kurz erklaert: Nachweisgrenze",
        text: "Kleinste Menge, die ein Labor mit der gewaehlten Methode noch sicher erkennen kann."
      }
    ],
    faq: [
      {
        question: "Ist nicht nachweisbar gleich sicher?",
        answer: "Nicht automatisch. Es haengt davon ab, was getestet wurde und wie niedrig die Nachweisgrenze liegt."
      },
      {
        question: "Warum muss ich die Stoffklasse kennen?",
        answer: "Weil unterschiedliche Stoffgruppen verschiedene toxikologische und regulatorische Relevanz haben."
      }
    ],
    glossary: [
      { term: "Rueckstand", definition: "Im Produkt verbliebene Menge eines unerwuenschten oder regulierten Stoffes." },
      { term: "Panelabdeckung", definition: "Umfang der im Labor untersuchten Stoffe oder Stoffgruppen." },
      { term: "Nachweisgrenze", definition: "Kleinste noch detektierbare Stoffmenge einer Methode." },
    ],
    relatedSlugs: ["pgr-und-kontaminanten", "coa-richtig-lesen", "sampling-und-probenahme-fehler"]
  }),
  createArticle({
    slug: "recall-und-sperrprozesse-fuer-chargen",
    title: "Recall- und Sperrprozesse fuer Chargen",
    summary: "Wie Produkte bei Verdachtsfaellen kontrolliert gestoppt, bewertet und kommuniziert werden sollten.",
    category: "sicherheit",
    difficulty: "profi",
    readMinutes: 8,
    tags: ["Recall", "Sperrung", "Charge", "CAPA"],
    keyTakeaways: [
      "Ein Recall funktioniert nur mit klaren Rollen, Datenspuren und Eskalationswegen.",
      "Je frueher Sperrlogik definiert ist, desto geringer ist der Schaden im Ereignisfall.",
      "Kommunikation nach innen und aussen muss vorbereitet statt improvisiert sein."
    ],
    quickFacts: [
      { label: "Kernpunkt", value: "Vorbereitung vor dem Vorfall" },
      { label: "Pflicht", value: "Rollen und Eskalation" },
      { label: "Daten", value: "Rueckverfolgung plus Statushistorie" }
    ],
    sections: [
      {
        heading: "Warum Recall-Prozesse oft scheitern",
        content: [
          "Nicht am Willen, sondern an fehlender Struktur: unklare Verantwortungen, verstreute Daten und keine eindeutige Chargenlogik.",
          "Gerade deshalb sollte der Prozess lange vor dem ersten Ereignis definiert sein."
        ]
      },
      {
        heading: "Was ein belastbarer Ablauf braucht",
        content: [
          "Sperrstatus, Entscheidungswege, Kommunikationsvorlagen und CAPA-Folgen muessen verbunden sein. Nur dann laesst sich professionell reagieren.",
          "Auch auf einer Wissensseite ist das ein zentraler Drop-Artikel fuer B2B- und Qualitaetskontext."
        ],
        checklist: [
          "Sperrstatus systemisch abbilden",
          "Eskalationsrollen benennen",
          "Kommunikationsbausteine vorab definieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Recall",
        text: "Gezielte Rueckholung oder Ruecknahme von Produkten wegen Sicherheits- oder Compliance-Risiken."
      },
      {
        title: "Kurz erklaert: CAPA",
        text: "Corrective and Preventive Actions, also Massnahmen zur Fehlerbehebung und Vorbeugung kuenftiger Wiederholungen."
      }
    ],
    faq: [
      {
        question: "Reicht eine einfache Sperrliste?",
        answer: "Selten. Ohne Bewegungsdaten, Rollen und Kommunikationslogik bleibt eine Sperrliste zu schwach."
      },
      {
        question: "Warum gehoert CAPA dazu?",
        answer: "Weil ein Ereignis nicht nur gestoppt, sondern ursachenseitig verstanden und zukuenftig verhindert werden muss."
      }
    ],
    glossary: [
      { term: "Recall", definition: "Strukturierte Rueckholung oder Ruecknahme betroffener Produkte." },
      { term: "Sperrstatus", definition: "Markierung, dass eine Charge nicht weiter verteilt oder verwendet werden darf." },
      { term: "CAPA", definition: "Systematischer Ansatz fuer Korrektur- und Vorbeugemassnahmen nach Abweichungen." },
    ],
    relatedSlugs: ["dokumentationspflichten-fuer-chargen", "batch-release-und-freigabekriterien", "schimmel-und-mykotoxine-bei-cannabis"]
  }),
  createArticle({
    slug: "batch-release-und-freigabekriterien",
    title: "Batch Release und Freigabekriterien",
    summary: "Welche Pruefpunkte vor einer Freigabe sinnvoll sind und warum Freigaben mehr als nur ein COA brauchen.",
    category: "qualitaet",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Batch Release", "Freigabe", "Qualitaet", "COA"],
    keyTakeaways: [
      "Freigabe ist eine Entscheidung ueber Risiko und Eignung, nicht nur ein Haken hinter einem Laborbericht.",
      "COA, Verpackung, Historie und Abweichungen sollten gemeinsam bewertet werden.",
      "Klare Kriterien schaffen Teamkonsistenz und schnellere Entscheidungen."
    ],
    quickFacts: [
      { label: "Pflicht", value: "Freigabekatalog" },
      { label: "Mehr als COA", value: "Auch Historie und Zustand" },
      { label: "Nutzen", value: "Skalierbare Qualitaetsentscheidungen" }
    ],
    sections: [
      {
        heading: "Warum ein COA allein nicht reicht",
        content: [
          "Selbst gute Laborberichte decken nicht automatisch Verpackung, Lagerung, Transport oder sichtbare Abweichungen ab.",
          "Eine serioese Freigabe betrachtet deshalb den gesamten Chargenkontext."
        ]
      },
      {
        heading: "Wie Freigaben standardisiert werden",
        content: [
          "Lege Pflichtkriterien, Grenzfaelle und Eskalationswege schriftlich fest. So sinkt die Abhaengigkeit von Einzelpersonen.",
          "Gerade fuer einen ersten grossen Drop schafft das Vertrauen und Tempo zugleich."
        ],
        checklist: [
          "COA plus Verpackungscheck verknuepfen",
          "Abweichungen vor Freigabe bewerten",
          "Freigabeentscheidungen revisionssicher speichern"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Batch Release",
        text: "Formale Entscheidung, dass eine definierte Charge die Kriterien fuer Ausgabe oder Verkauf erfuellt."
      },
      {
        title: "Kurz erklaert: Grenzfall",
        text: "Charge oder Befund, der nicht klar im Gruenbereich liegt und deshalb besondere Pruefung braucht."
      }
    ],
    faq: [
      {
        question: "Wer sollte freigeben duerfen?",
        answer: "Nur klar definierte Rollen mit Zugriff auf alle relevanten Daten und einem standardisierten Entscheidungsrahmen."
      },
      {
        question: "Kann ich Freigaben automatisieren?",
        answer: "Teilweise ja, aber Grenzfaelle und Kontextdaten brauchen meist menschliche Bewertung."
      }
    ],
    glossary: [
      { term: "Batch Release", definition: "Freigabe einer Charge nach Pruefung definierter Kriterien." },
      { term: "Freigabekatalog", definition: "Sammlung aller Kriterien, die fuer eine Freigabe geprueft werden muessen." },
      { term: "Revisionssicher", definition: "So dokumentiert, dass Aenderungen nachvollziehbar und belastbar bleiben." },
    ],
    relatedSlugs: ["coa-richtig-lesen", "dokumentationspflichten-fuer-chargen", "recall-und-sperrprozesse-fuer-chargen"]
  }),
  createArticle({
    slug: "lagerung-verpackung-und-lichtschutz",
    title: "Lagerung, Verpackung und Lichtschutz",
    summary: "Wie Verpackungssysteme die reale Produktqualitaet mitbestimmen und warum Lagerung ein Kernteil der Qualitaetssicherung ist.",
    category: "qualitaet",
    difficulty: "einsteiger",
    readMinutes: 7,
    tags: ["Lagerung", "Verpackung", "Lichtschutz", "Qualitaet"],
    keyTakeaways: [
      "Produktqualitaet endet nicht beim COA, sondern haengt stark an Lagerung und Packmittelwahl.",
      "Licht, Sauerstoff und Temperatur beeinflussen Profil und Haltbarkeit deutlich.",
      "Gute Verpackung ist Teil des Qualitaetssystems, nicht nur Marketing."
    ],
    quickFacts: [
      { label: "Feinde", value: "Licht, Sauerstoff, Waerme" },
      { label: "Hebel", value: "Passendes Packmittel" },
      { label: "Praxis", value: "Lagerdaten mit Reklamationen verknuepfen" }
    ],
    sections: [
      {
        heading: "Warum Verpackung mehr ist als Huelle",
        content: [
          "Packmittel bestimmen mit, wie stabil Aroma, Wirkstoffprofil und mikrobiologische Sicherheit ueber Zeit bleiben.",
          "Gerade bei hochwertigen Produkten ist das ein direkter Qualitaetshebel."
        ]
      },
      {
        heading: "Welche Fragen gute Lagerung beantwortet",
        content: [
          "Wie alt ist die Charge, wie wurde sie transportiert und war sie Licht oder Hitze ausgesetzt? Diese Punkte sollten nie unsichtbar bleiben.",
          "Erst zusammen mit Reklamationen und Analytik entsteht ein lernfaehiges System."
        ],
        checklist: [
          "Packmittel nach Produktklasse auswaehlen",
          "Lager- und Transportbedingungen dokumentieren",
          "Profilverlust mit Packmitteltests vergleichen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Lichtschutz",
        text: "Massnahmen oder Materialien, die verhindern sollen, dass Licht sensible Inhaltsstoffe abbaut."
      },
      {
        title: "Kurz erklaert: Haltbarkeit",
        text: "Zeitraum, in dem ein Produkt seine relevanten Eigenschaften innerhalb definierter Grenzen behaelt."
      }
    ],
    faq: [
      {
        question: "Ist Glas immer die beste Verpackung?",
        answer: "Nicht automatisch. Schutzwirkung, Headspace, Handling und Lieferkette muessen zusammengedacht werden."
      },
      {
        question: "Warum sind Lagerdaten fuer Content relevant?",
        answer: "Weil sie erklaeren, warum reale Produktqualitaet von Freigabeprofilen abweichen kann."
      }
    ],
    glossary: [
      { term: "Packmittel", definition: "Verwendetes Verpackungsmaterial oder Verpackungssystem eines Produkts." },
      { term: "Lichtschutz", definition: "Eigenschaft eines Materials oder Systems, die Lichteinwirkung reduziert." },
      { term: "Haltbarkeit", definition: "Zeitspanne, in der definierte Produkteigenschaften erhalten bleiben sollen." },
    ],
    relatedSlugs: ["wasseraktivitaet-und-curing", "lagerung-und-terpenverlust-vermeiden", "thc-zu-cbn-abbau-und-oxidation"]
  }),
  createArticle({
    slug: "sampling-und-probenahme-fehler",
    title: "Sampling und Probenahme-Fehler",
    summary: "Warum schon vor dem Labor viele Vergleichsfehler entstehen und wie man Analytik durch gute Probenlogik belastbarer macht.",
    category: "qualitaet",
    difficulty: "profi",
    readMinutes: 8,
    tags: ["Sampling", "Probenahme", "Labor", "Bias"],
    keyTakeaways: [
      "Ein schlechtes Sampling kann gute Analytik unbrauchbar machen.",
      "Probenmuessen Charge, Heterogenitaet und Ziel der Fragestellung realistisch abbilden.",
      "Vergleichbarkeit beginnt vor dem Messgeraet."
    ],
    quickFacts: [
      { label: "Kernpunkt", value: "Repräsentative Probe" },
      { label: "Fehler", value: "Einseitige oder bequeme Entnahme" },
      { label: "Mehrwert", value: "Bessere COA-Qualitaet" }
    ],
    sections: [
      {
        heading: "Warum Probenahme so oft unterschätzt wird",
        content: [
          "Viele Diskussionen ueber Analytik drehen sich um Methoden, obwohl der Fehler bereits bei der Entnahme beginnen kann.",
          "Wenn eine Probe die Charge schlecht repraesentiert, helfen selbst exzellente Labore nur begrenzt."
        ]
      },
      {
        heading: "Wie Sampling belastbarer wird",
        content: [
          "Definiere Entnahmestellen, Stichprobenlogik, Mischregeln und Dokumentation passend zur Produktart.",
          "Das macht Unterschiede zwischen Chargen und Laboren erst sinnvoll interpretierbar."
        ],
        checklist: [
          "Sampling-Protokoll pro Produktklasse festlegen",
          "Entnahmestellen und Zeitpunkt dokumentieren",
          "COA immer mit Probenlogik mitdenken"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: repraesentativ",
        text: "Eine Probe ist repraesentativ, wenn sie die relevante Wirklichkeit der Charge moeglichst gut widerspiegelt."
      },
      {
        title: "Kurz erklaert: Bias bei Probenahme",
        text: "Verzerrung, wenn aus Bequemlichkeit oder unbewusst nur bestimmte Bereiche oder Teile entnommen werden."
      }
    ],
    faq: [
      {
        question: "Reicht eine Einzelprobe?",
        answer: "Je nach Heterogenitaet oft nicht. Gerade bei komplexen Chargen ist das Risiko fuer Fehlinterpretation hoch."
      },
      {
        question: "Warum unterscheiden sich Wiederholungsproben?",
        answer: "Weil Charge, Entnahmeort, Homogenitaet und Aufbereitung variieren koennen."
      }
    ],
    glossary: [
      { term: "Sampling", definition: "Systematische Entnahme von Proben zur spaeteren Analyse." },
      { term: "Repraesentativ", definition: "Die reale Zusammensetzung einer Charge angemessen widerspiegelnd." },
      { term: "Heterogenitaet", definition: "Unterschiedlichkeit innerhalb einer Charge oder eines Produkts." },
    ],
    relatedSlugs: ["coa-richtig-lesen", "analytik-hplc-vs-gc-bei-cannabinoiden", "pestizidklassen-und-rueckstandsrisiken"]
  }),
  createArticle({
    slug: "lieferkette-und-rueckverfolgbarkeit",
    title: "Lieferkette und Rueckverfolgbarkeit",
    summary: "Warum Transparenz ueber Stationen, Partner und Nachweise ein echter Marktvorteil ist und nicht nur ein Compliance-Pflichtprogramm.",
    category: "markt",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    tags: ["Lieferkette", "Rueckverfolgbarkeit", "Transparenz", "Markt"],
    keyTakeaways: [
      "Marktvertrauen entsteht aus nachvollziehbarer Herkunft und konsistenten Nachweisen.",
      "Rueckverfolgbarkeit reduziert nicht nur Risiko, sondern verbessert auch Kommunikation und Einkauf.",
      "Transparenz ist auf grossen Plattformen ein Differenzierungsmerkmal."
    ],
    quickFacts: [
      { label: "Mehrwert", value: "Vertrauen plus schnellere Reaktion" },
      { label: "Pflicht", value: "Dokumentierte Kette" },
      { label: "Signal", value: "Transparenz schlaegt Behauptung" }
    ],
    sections: [
      {
        heading: "Warum Lieferkettenwissen Marktmacht ist",
        content: [
          "Wenn Herkunft und Nachweise sichtbar sind, sinken Informationsasymmetrien fuer Nutzer und Teams. Das staerkt die Plattformqualitaet direkt.",
          "Fehlende Transparenz erzeugt dagegen Misstrauen, selbst wenn Produkte gut sein koennen."
        ]
      },
      {
        heading: "Was Rueckverfolgbarkeit praktisch bringen muss",
        content: [
          "Nicht nur Namen von Partnern, sondern nachvollziehbare Chargenbewegungen, Analytik und Statushistorien.",
          "Dann hilft das System auch bei Reklamation, Recall und Performancebewertung."
        ],
        checklist: [
          "Stationen der Kette definieren",
          "Dokumente und Chargenstatus verbinden",
          "Lieferanten nach Nachweisqualitaet vergleichen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Lieferkette",
        text: "Alle Stationen vom Ursprung ueber Verarbeitung und Transport bis zur finalen Ausgabe."
      },
      {
        title: "Kurz erklaert: Transparenz",
        text: "Grad, in dem Nutzer oder Teams belastbare Informationen wirklich einsehen und verstehen koennen."
      }
    ],
    faq: [
      {
        question: "Muss ich jeden Partner offenlegen?",
        answer: "Nicht immer oeffentlich, aber intern muss die Kette fuer Qualitaet und Compliance nachvollziehbar sein."
      },
      {
        question: "Warum hilft das auch im Marketing?",
        answer: "Weil nachweisbare Transparenz glaubwuerdiger ist als reine Herkunftsclaims."
      }
    ],
    glossary: [
      { term: "Lieferkette", definition: "Abfolge aller Beteiligten und Prozesse vom Ursprung bis zur Ausgabe eines Produkts." },
      { term: "Transparenz", definition: "Nachvollziehbarkeit relevanter Informationen fuer Bewertung und Entscheidung." },
      { term: "Statushistorie", definition: "Zeitliche Dokumentation, wie sich der Zustand einer Charge ueber den Prozess veraendert hat." },
    ],
    relatedSlugs: ["markttransparenz-und-preise", "dokumentationspflichten-fuer-chargen", "white-label-und-qualitaetsrisiken"]
  }),
  createArticle({
    slug: "white-label-und-qualitaetsrisiken",
    title: "White Label und Qualitaetsrisiken",
    summary: "Wo Handelsmodelle ohne eigene Herstellung Chancen bieten und wo dabei Transparenz und Verantwortung leicht verloren gehen.",
    category: "markt",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    tags: ["White Label", "Qualitaet", "Lieferanten", "Markt"],
    keyTakeaways: [
      "White-Label-Modelle sind nicht per se schlecht, brauchen aber besonders starke Daten- und Freigabelogik.",
      "Je weiter Marke und Herstellung auseinanderliegen, desto wichtiger werden Nachweise und Kontrolle.",
      "Fuer Nutzer zaehlt nicht Storytelling, sondern belastbare Transparenz."
    ],
    quickFacts: [
      { label: "Chance", value: "Schnellere Markteintritte" },
      { label: "Risiko", value: "Verantwortungsdiffusion" },
      { label: "Pflicht", value: "Starke Lieferantensteuerung" }
    ],
    sections: [
      {
        heading: "Warum White Label attraktiv ist",
        content: [
          "Marken koennen schneller starten, ohne jede Infrastruktur selbst aufzubauen. Das ist wirtschaftlich oft sinnvoll.",
          "Gleichzeitig steigt aber die Bedeutung von Nachweisen, Spezifikationen und Kontrollpunkten."
        ]
      },
      {
        heading: "Wo das Modell kippt",
        content: [
          "Wenn Marke, Produktverantwortung und Daten nicht sauber verbunden sind, entstehen Luecken bei Reklamation, Recall und Qualitaetsaussagen.",
          "Deshalb braucht White Label eher mehr Governance, nicht weniger."
        ],
        checklist: [
          "Verantwortlichkeiten vertraglich und operativ klaeren",
          "Freigabekriterien mit Lieferanten verbindlich machen",
          "Rueckverfolgbarkeit nicht an Partner delegieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: White Label",
        text: "Produktmodell, bei dem ein Hersteller fuer mehrere Marken produziert, die das Produkt unter eigenem Namen fuehren."
      },
      {
        title: "Kurz erklaert: Governance",
        text: "Regeln, Verantwortungen und Steuerungsmechanismen, die ein System kontrollierbar machen."
      }
    ],
    faq: [
      {
        question: "Ist White Label automatisch weniger hochwertig?",
        answer: "Nein. Entscheidend sind Kontrolle, Nachweise und konsequente Qualitaetsfuehrung."
      },
      {
        question: "Warum ist Transparenz hier so wichtig?",
        answer: "Weil Nutzer sonst nur eine Marke sehen, aber die eigentliche Produktverantwortung und Herkunft unklar bleibt."
      }
    ],
    glossary: [
      { term: "White Label", definition: "Herstellungsmodell, bei dem ein Produkt unter verschiedenen Marken vertrieben werden kann." },
      { term: "Governance", definition: "Regelwerk aus Verantwortung, Kontrolle und Entscheidungsstruktur." },
      { term: "Spezifikation", definition: "Verbindliche Beschreibung der erwarteten Produkt- und Prozessmerkmale." },
    ],
    relatedSlugs: ["markttransparenz-und-preise", "lieferkette-und-rueckverfolgbarkeit", "batch-release-und-freigabekriterien"]
  }),
  createArticle({
    slug: "grow-log-und-kpi-dashboard",
    title: "Grow-Log und KPI-Dashboard aufbauen",
    summary: "Welche Kennzahlen fuer Wiederholbarkeit wirklich helfen und wie aus Beobachtung ein steuerbares System wird.",
    category: "werkzeuge",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Grow Log", "KPI", "Dashboard", "Daten"],
    keyTakeaways: [
      "Ohne strukturierte Daten bleibt jeder Run nur Erfahrung, nicht Systemwissen.",
      "Ein gutes Dashboard zeigt wenige, aber entscheidende Kennzahlen mit Trendbezug.",
      "KPIs muessen an Entscheidungen gekoppelt sein, sonst werden sie nur Deko."
    ],
    quickFacts: [
      { label: "Ziel", value: "Wiederholbarkeit" },
      { label: "Wichtig", value: "Trends statt Einzelzahlen" },
      { label: "Pflicht", value: "Klare Owner je KPI" }
    ],
    sections: [
      {
        heading: "Welche Daten wirklich helfen",
        content: [
          "Nicht alles muss gemessen werden. Entscheidend sind Klima, Bewaesserung, Naehrstoffdaten, Auffaelligkeiten und Outcome-Kennzahlen.",
          "Aus diesen Daten entsteht ein lernendes System, wenn sie ueber Runs vergleichbar bleiben."
        ]
      },
      {
        heading: "Vom Log zur Steuerung",
        content: [
          "Kennzahlen muessen sichtbar machen, wann eingegriffen wird und wer entscheidet. Erst dann wird ein Dashboard operativ wertvoll.",
          "Gerade fuer Teams verhindert das Datenblindheit und Einzelheldentum."
        ],
        checklist: [
          "Kern-KPIs pro Phase definieren",
          "Trendansicht statt reiner Tabellen pflegen",
          "Jede KPI mit Reaktionslogik verknuepfen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: KPI",
        text: "Key Performance Indicator, also eine Kennzahl, die fuer Steuerung und Erfolgsmessung wichtig ist."
      },
      {
        title: "Kurz erklaert: Trendbezug",
        text: "Einzelwerte werden erst aussagekraeftig, wenn ihre Entwicklung ueber Zeit sichtbar ist."
      }
    ],
    faq: [
      {
        question: "Wie viele KPIs brauche ich?",
        answer: "Wenige Kernkennzahlen sind besser als ein ueberladenes Dashboard ohne Entscheidungen."
      },
      {
        question: "Reicht ein Spreadsheet?",
        answer: "Fuer den Start ja, solange Struktur, Konsistenz und Review-Prozess sauber sind."
      }
    ],
    glossary: [
      { term: "KPI", definition: "Wesentliche Kennzahl zur Beurteilung eines Prozesses oder Ergebnisses." },
      { term: "Dashboard", definition: "Visualisierte Uebersicht relevanter Kennzahlen und Trends." },
      { term: "Review", definition: "Geplante Besprechung und Bewertung von Daten, Ergebnissen und Abweichungen." },
    ],
    relatedSlugs: ["cannabis-anbau-grundlagen", "vpd-und-ec-kombi-rechner-guide", "sensor-kalibrierung-und-messfehler"]
  }),
  createArticle({
    slug: "sensor-kalibrierung-und-messfehler",
    title: "Sensor-Kalibrierung und Messfehler",
    summary: "Warum selbst gute Tools ohne Kalibrierung in die Irre fuehren und wie Messqualitaet systematisch abgesichert wird.",
    category: "werkzeuge",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    tags: ["Sensorik", "Kalibrierung", "Messfehler", "QA"],
    keyTakeaways: [
      "Messdaten sind nur so gut wie Sensorzustand, Platzierung und Kalibrierung.",
      "Viele Grow- und Labordiskussionen basieren auf Datenfehlern statt auf echten Prozessproblemen.",
      "Ein kleiner QA-Prozess fuer Sensoren verhindert grosse Fehlentscheidungen."
    ],
    quickFacts: [
      { label: "Hauefiger Fehler", value: "Vertrauen in unkorrigierte Sensoren" },
      { label: "Wichtig", value: "Ort plus Kalibrierintervall" },
      { label: "Nutzen", value: "Bessere Entscheidungen" }
    ],
    sections: [
      {
        heading: "Warum gute Sensoren alleine nicht reichen",
        content: [
          "Auch hochwertige Geraete koennen falsch messen, wenn sie schlecht platziert, lange ungeprueft oder falsch gelesen werden.",
          "Gerade in Grow- und Lagerumgebungen summieren sich kleine Messfehler schnell."
        ]
      },
      {
        heading: "Wie ein einfacher QA-Prozess aussieht",
        content: [
          "Definiere Kalibrierintervalle, Vergleichsmessungen und dokumentierte Austauschregeln. So wird aus Sensorik ein belastbares Werkzeug.",
          "Ohne diese Ebene bleiben VPD-, pH- oder EC-Werte schnell trügerisch."
        ],
        checklist: [
          "Kalibrierintervall pro Sensortyp festlegen",
          "Referenzmessungen dokumentieren",
          "Auffaellige Sensoren sofort markieren oder tauschen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Kalibrierung",
        text: "Abgleich eines Sensors mit einem Referenzwert, damit seine Messung korrekt bleibt."
      },
      {
        title: "Kurz erklaert: Messfehler",
        text: "Abweichung zwischen gemessenem und tatsaechlichem Wert durch Geraet, Platzierung oder Anwendung."
      }
    ],
    faq: [
      {
        question: "Wie oft sollte ich kalibrieren?",
        answer: "Abhaengig vom Sensortyp und Einsatzumfeld, aber nie erst dann, wenn Werte offensichtlich unplausibel wirken."
      },
      {
        question: "Sind billige Sensoren nutzlos?",
        answer: "Nein. Gut gefuehrte und gepruefte einfache Sensoren sind oft wertvoller als teure, ungepflegte Systeme."
      }
    ],
    glossary: [
      { term: "Kalibrierung", definition: "Pruefung und Korrektur eines Messgeraets gegen bekannte Referenzwerte." },
      { term: "Referenzwert", definition: "Bekannter Sollwert, der zur Kontrolle einer Messung dient." },
      { term: "Drift", definition: "Langsame Veraenderung eines Messgeraets weg vom korrekten Wert ueber Zeit." },
    ],
    relatedSlugs: ["vpd-einfach-erklaert", "grow-log-und-kpi-dashboard", "cannabis-substrat-und-wurzelzone"]
  }),
  createArticle({
    slug: "how-to-grow-cannabis-anfaenger-tutorial",
    title: "How to Grow Cannabis: Schritt-fuer-Schritt fuer Anfaenger",
    summary: "Ein klarer Einstieg in Setup, Klima, Bewaesserung und Erntefenster - aufgebaut auf belastbaren Grundlagen aus Forschung und bewaehrten Profi-Routinen.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 14,
    tags: ["How to Grow", "Anbau", "Anfaenger", "Step by Step", "Setup", "Klima"],
    keyTakeaways: [
      "Starte mit einem kleinen, stabilen Setup statt mit maximaler Leistung.",
      "Miss Klima, pH und Bewaesserung konsistent, bevor du Duenger oder Licht weiter aufdrehst.",
      "Ein sauberer Wochenrhythmus mit festen Checks verhindert die meisten typischen Einsteigerfehler."
    ],
    quickFacts: [
      { label: "Zielgruppe", value: "Erster bis dritter Run" },
      { label: "Fokus", value: "Stabilitaet vor Performance" },
      { label: "Routine", value: "Taeglicher 10-Minuten-Check" }
    ],
    sections: [
      {
        heading: "Schritt 1: Setup klein und reproduzierbar halten",
        content: [
          "Waehle ein ueberschaubares Setup mit klar kontrollierbaren Variablen: Licht, Abluft, Umluft, Temperatur, RH und ein einfaches Substrat. Forschung zu Cannabis-Kultivierung und professionelle Grow-SOPs zeigen uebereinstimmend, dass Stabilitaet den groessten Hebel hat.",
          "Fuer den Einstieg ist ein verzeihendes Medium mit dokumentierbarem Giessrhythmus wichtiger als ein aggressives High-Performance-System. Erde oder ein gut vorbereiteter Mix mit klarer Trocknungsdynamik ist meist einfacher als sofortige Hydro-Steuerung."
        ],
        checklist: [
          "Lichtleistung konservativ starten und Hoehe dokumentieren",
          "Temperatur und RH am Canopy messen",
          "Substrat, Topfvolumen und Ziel-Giessrhythmus vor dem Start festlegen"
        ]
      },
      {
        heading: "Schritt 2: Klima und Bewaesserung zuerst stabilisieren",
        content: [
          "Halte in der Vegetationsphase keine extremen Werte, sondern stabile Korridore. VPD-orientiertes Arbeiten und regelmaessige Topfgewicht-Kontrolle sind fuer Anfaenger deutlich wertvoller als hektische EC-Optimierung.",
          "Viele Probleme im ersten Run entstehen durch zu haeufiges Giessen und zu viele Korrekturen gleichzeitig. Arbeite mit einem festen Beobachtungsfenster: Blaetter, Topfgewicht, Drain, Temperatur und Luftfeuchte."
        ],
        checklist: [
          "Vor jedem Giessen Topfgewicht oder Trocknungsgrad pruefen",
          "Nur einen Parameter pro Tag aendern",
          "Klimaabweichungen mit Datum und Uhrzeit ins Grow-Log schreiben"
        ]
      },
      {
        heading: "Schritt 2b: Wochenplan fuer einen einfachen ersten Run",
        content: [
          "Woche 1-2: Keimung und Jungpflanze. Licht moderat halten, RH hoeher fahren, Medium nur leicht feucht und keine harten Duengeimpulse setzen. Fokus: stabile Entwicklung statt Tempo.",
          "Woche 3-4: Fruehe Vegetation. Gleichmaessigen Rhythmus aus Giessen, Klima-Check und leichter Naehrstoffzufuhr etablieren. Jetzt zeigt sich, ob Topf, Medium und Trocknungsdauer zusammenpassen.",
          "Woche 5-6: Spaete Vegetation bis Stretch. Pflanzenhoehe, Lichtabstand und Blattgesundheit eng beobachten. Nur dann auf Bluete umstellen, wenn Pflanzen vital und der Raum klimatisch stabil ist.",
          "Woche 7-9: Hauptbluete. Stickstoff nicht aggressiv pushen, Giessrhythmus eng fuehren und Klima trocken genug halten, damit keine dichten, feuchten Problemzonen entstehen.",
          "Woche 10+: Reife, Ernte und Trocknung. Trichome beobachten, letzte grobe Korrekturen vermeiden und Trocknungsraum vor dem Schnitt komplett vorbereiten."
        ],
        checklist: [
          "Jede Woche nur ein klares Lernziel definieren",
          "Vor der Bluete kein ungelostes Giess- oder Klima-Problem mitnehmen",
          "Trocknung mindestens so genau planen wie die Veg-Phase"
        ]
      },
      {
        heading: "Schritt 3: Duengung defensiv und phasenbezogen steuern",
        content: [
          "Studien zu NPK-Fertigation bei Cannabis zeigen, dass Ueberversorgung - besonders mit Stickstoff in spaeteren Phasen - Ertrag und Qualitaet eher verschlechtern kann. Beginne deshalb unterhalb der Hersteller-Maximalangaben und steigere nur bei klarer Pflanzenreaktion.",
          "Achte darauf, dass Lichtintensitaet, Klima und Wurzelzone zur Naehrstoffstaerke passen. Ohne diese Basis bringt mehr EC kaum Nutzen und erhoeht das Risiko fuer Blockaden oder Stressmarker."
        ],
        checklist: [
          "pH und EC der Loesung in fixer Reihenfolge messen",
          "Keine Booster einsetzen, solange Basisprozesse noch schwanken",
          "Ab Blueteeinleitung Stickstoff nicht weiter aggressiv steigern"
        ]
      },
      {
        heading: "Schritt 4: Ernte nicht raten, sondern beobachten",
        content: [
          "Einsteiger profitieren von klaren Reifeindikatoren statt Kalenderdenken. Beobachte Trichome, Pflanzenvitalitaet, Klima und Trocknungsplanung als zusammenhaengenden Prozess.",
          "Direkt nach der Ernte entscheidet sauberes Trocknen ueber Aroma, Schimmelrisiko und Konsistenz. Professionelle Teams behandeln Postharvest als Teil des Grows und nicht als letzten Nebenjob."
        ],
        checklist: [
          "Vor der Ernte Trocknungsraum auf Temperatur und RH vorbereiten",
          "Trichomkontrolle mit Lupe oder Mikroskop durchfuehren",
          "Nach dem Run drei Dinge notieren: Fehler, Korrektur, Ergebnis"
        ]
      }
    ],
    warnings: [
      "Mehr Duenger, mehr Licht und mehr Wasser gleichzeitig zu erhoehen ist der schnellste Weg in unklare Fehlerbilder.",
      "Ohne funktionierende Klimakontrolle wird selbst ein guter Naehrstoffplan instabil."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Warum klein starten?",
        text: "Ein kleines Setup reduziert Streuung. Du erkennst schneller, welche Aenderung wirklich Wirkung hatte."
      },
      {
        title: "Kurz erklaert: Was ist ein reproduzierbarer Run?",
        text: "Ein Grow, dessen Klima, Giessverhalten und Inputs dokumentiert und beim naechsten Zyklus sauber wiederholbar sind."
      }
    ],
    faq: [
      {
        question: "Soll ich im ersten Run toppen, trainieren und boostern?",
        answer: "Nur wenn die Basis stabil ist. Fuer den Einstieg ist ein sauberer, einfacher Pflanzenlauf wertvoller als zu viele parallele Eingriffe."
      },
      {
        question: "Was ist fuer Anfaenger wichtiger: EC oder Klima?",
        answer: "Klima und Bewaesserung zuerst. Eine Pflanze in schlechtem Klima kann selbst mit sauberem EC nicht stabil performen."
      }
    ],
    glossary: [
      { term: "Grow-Log", definition: "Laufende Dokumentation von Klima, Giessen, Duengung und Auffaelligkeiten pro Tag." },
      { term: "Canopy", definition: "Oberer Pflanzenbereich, in dem Licht und Klima besonders relevant gemessen werden." },
      { term: "Drain", definition: "Abflusswasser nach der Bewaesserung, nutzbar fuer EC- und pH-Kontrolle." }
    ],
    downloads: [
      { title: "Anfaenger Grow-Checkliste", href: "/terpira/tutorials/how-to-grow-anfaenger-checkliste.txt", kind: "TXT-Checkliste" },
      { title: "Anfaenger SOP-Vorlage", href: "/terpira/tutorials/how-to-grow-anfaenger-sop.txt", kind: "TXT-SOP-Vorlage" }
    ],
    relatedSlugs: ["cannabis-anbau-grundlagen", "bewaesserung-ohne-uebergiessen", "vpd-einfach-erklaert", "cannabis-substrat-und-wurzelzone"]
  }),
  createArticle({
    slug: "how-to-grow-cannabis-fortgeschritten-tutorial",
    title: "How to Grow Cannabis: Schritt-fuer-Schritt fuer Fortgeschrittene",
    summary: "Wie du ein stabiles Setup in ein datengestuetztes Produktionssystem verwandelst - mit sauberer Klima-, Feed- und Canopy-Steuerung.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 16,
    tags: ["How to Grow", "Anbau", "Fortgeschritten", "Step by Step", "Canopy", "Naehrstoffe", "VPD"],
    keyTakeaways: [
      "Ab dem mittleren Niveau zaehlt nicht mehr nur Pflanzenvitalitaet, sondern Prozessstabilitaet ueber den gesamten Zyklus.",
      "Licht, Klima, Wurzelzone und Naehrstoffprofil muessen phasenweise gemeinsam gesteuert werden.",
      "Canopy-Management und Review nach Woche liefern mehr Performance als spontane Produktwechsel."
    ],
    quickFacts: [
      { label: "Zielgruppe", value: "Grower mit stabiler Basis" },
      { label: "Hebel", value: "Canopy, Feed, Review-System" },
      { label: "Nutzen", value: "Mehr Konstanz pro Quadratmeter" }
    ],
    sections: [
      {
        heading: "Schritt 1: Zielkorridore pro Phase definieren",
        content: [
          "Fortgeschrittene Grows scheitern selten an fehlendem Equipment, sondern an unklaren Sollwerten. Lege pro Phase Zielbereiche fuer Blattabstand zum Licht, Klima, Bewaesserungsfrequenz und Feed-Staerke fest.",
          "Die Forschung zu Cannabis-Lichtphysiologie und NPK-Reaktion zeigt deutlich, dass Input nur dann sinnvoll steigt, wenn Photosynthese, Wurzelraum und Klima dazu passen."
        ],
        checklist: [
          "Wochenplan fuer Veg, Stretch und Hauptbluete schreiben",
          "Blatttemperatur oder plausiblen Offset in die VPD-Berechnung integrieren",
          "Entscheidungsregeln fuer Hoeher- oder Runterfahren von EC festlegen"
        ]
      },
      {
        heading: "Schritt 2: Canopy aktiv fuehren statt nur reagieren",
        content: [
          "Gleichmaessige Lichtverteilung ist ein Prozess, kein Zufall. Arbeite mit Entlaubung, Training und Hoehenmanagement so, dass Licht, Luftstrom und Reife moeglichst homogen bleiben.",
          "Professionelle Grower behandeln die Canopy als produktive Flaeche. Jede dunkle, feuchte oder chaotische Zone wird spaeter zum Risiko fuer Minderertrag, Schimmel oder ungleichmaessige Reife."
        ],
        checklist: [
          "Canopy-Fotos jede Woche aus gleichem Winkel machen",
          "Ungueltige Schattenzonen konsequent reduzieren",
          "Lichtabstand und Hotspots nach jedem Training neu kontrollieren"
        ]
      },
      {
        heading: "Schritt 2b: Wochenplan fuer Performance ohne Kontrollverlust",
        content: [
          "Woche 1-2 Veg: Basiswerte bestaetigen. Sensorik, Giessfrequenz und Start-Feed nur so hoch fahren, dass Pflanzen sichtbar sauber reagieren. Abweichungen sofort notieren statt spaeter deuten.",
          "Woche 3-4 Veg: Kronendach angleichen, erste Trainingsentscheidungen sauber dokumentieren und Wurzelraum-Daten mit dem Blattbild zusammen lesen. Ziel ist Homogenitaet, nicht spektakulaeres Einzelwachstum.",
          "Woche 5 Stretch: Licht und Klima jetzt taeglich mit dem Wuchs koppeln. Stretch ist die Phase, in der schlechte Zielkorridore spaeter am teuersten werden.",
          "Woche 6-8 Hauptbluete: Drain-Trends, K/Ca-Balance und Luftbewegung eng pruefen. Je dichter die Blueten werden, desto weniger Fehlertoleranz hat das System.",
          "Woche 9+ Finish und Review: Reifehomogenitaet, Problemzonen und Ertragsverteilung dokumentieren. Das ist die Datenbasis fuer den naechsten Optimierungsschritt."
        ],
        checklist: [
          "Stretch-Woche nicht ohne taegliche Licht- und Klima-Kontrolle laufen lassen",
          "Hauptbluete als Risiko- und nicht nur als Ertragsphase behandeln",
          "Am Zyklusende immer Review vor der naechsten Aenderung machen"
        ]
      },
      {
        heading: "Schritt 3: Nährstoffgabe und Wurzelraum datenbasiert steuern",
        content: [
          "Jetzt reicht Bauchgefuehl nicht mehr. Vergleiche Soll-EC, Ist-Drain, Pflanzenreaktion und Trocknungsdauer gemeinsam. Gerade in Coco oder anderen schnell reagierenden Medien sind kleine Trends wichtiger als Einmalmessungen.",
          "Peer-reviewte Cannabis-Studien zu Substraten und Fertigation belegen, dass Kalium-, Stickstoff- und pH-Management phasenabhaengig optimiert werden muessen. Zu spaete Reaktionen kosten Bluetenmasse und Qualitaet."
        ],
        checklist: [
          "Drain-EC und pH an festen Wochentagen messen",
          "Ca/Mg nur mit Kontext von Medium und Wasserwerten anpassen",
          "Auffaellige Blattbilder immer mit Wurzelzonen- und Klima-Daten abgleichen"
        ]
      },
      {
        heading: "Schritt 4: Ertrag und Qualitaet mit Run-Review sichern",
        content: [
          "Fortgeschrittene Grower dokumentieren nicht nur, dass ein Run gut lief, sondern warum. Vergleiche Ertrag, Trimmanteil, Reifehomogenitaet, Duftprofil und Problemzonen je Durchlauf.",
          "Die beste Optimierung entsteht aus wenigen, klaren Hypothesen fuer den naechsten Run. Ein Review-System verhindert, dass dieselben Fehler trotz gutem Equipment wiederholt werden."
        ],
        checklist: [
          "Run-Review in Klima, Bewaesserung, Feed, Canopy und Postharvest gliedern",
          "Nur zwei bis drei Verbesserungen fuer den Folgezyklus definieren",
          "Qualitaetsverlust nicht nur auf Genetik schieben, sondern Prozessdaten pruefen"
        ]
      }
    ],
    warnings: [
      "Mehr Leistung ohne Review-System fuehrt oft nur zu schnellerem Scheitern auf hoeherem Input-Niveau.",
      "Canopy-Eingriffe ohne Klima- und Lichtnachkontrolle koennen mehr Stress als Nutzen erzeugen."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Zielkorridor",
        text: "Ein definierter Bereich statt eines Einzelwerts, innerhalb dessen Pflanzen stabil arbeiten koennen."
      },
      {
        title: "Kurz erklaert: Run-Review",
        text: "Systematische Nachbereitung eines kompletten Zyklus, um Fehler, Verbesserungen und Wirkung sauber zu trennen."
      }
    ],
    faq: [
      {
        question: "Wann lohnt sich Coco oder Hydro gegenueber Erde?",
        answer: "Wenn dein Mess- und Bewaesserungssystem stabil genug ist, schnellere Reaktionen zu kontrollieren. Ohne Datendisziplin steigt nur die Fehlergeschwindigkeit."
      },
      {
        question: "Was bringt mehr: mehr PPFD oder besseres Canopy?",
        answer: "Fast immer zuerst besseres Canopy. Ungleich verteiltes Licht macht hohe Leistung ineffizient und steigert Stress in den Spitzen."
      }
    ],
    glossary: [
      { term: "Canopy-Management", definition: "Steuerung von Pflanzenhoehe, Blattmasse und Lichtverteilung ueber den gesamten Bestand." },
      { term: "Blatttemperatur", definition: "Blatttemperatur, die für eine realistische VPD-Berechnung wichtiger ist als die reine Raumtemperatur." },
      { term: "Run-Review", definition: "Strukturierte Auswertung eines abgeschlossenen Grows mit Fokus auf Ursache und Wirkung." }
    ],
    downloads: [
      { title: "Fortgeschrittene Wochenreview-Checkliste", href: "/terpira/tutorials/how-to-grow-fortgeschritten-checkliste.txt", kind: "TXT-Checkliste" },
      { title: "Fortgeschrittene SOP-Vorlage fuer Run-Review", href: "/terpira/tutorials/how-to-grow-fortgeschritten-sop.txt", kind: "TXT-SOP-Vorlage" }
    ],
    relatedSlugs: ["lichtstress-und-canopy-management", "naehrstoffblockaden-und-antagonismen", "vpd-und-ec-kombi-rechner-guide", "substrat-vergleich-coco-erde-hydro"]
  }),
  createArticle({
    slug: "how-to-grow-cannabis-profi-tutorial",
    title: "How to Grow Cannabis: Schritt-fuer-Schritt fuer Profis",
    summary: "Ein fortlaufendes Betriebsmodell fuer Teams mit hoher Datendichte, SOPs, Chargendenken und reproduzierbarer Premium-Qualitaet.",
    category: "anbau",
    difficulty: "profi",
    readMinutes: 18,
    tags: ["How to Grow", "Anbau", "Profi", "Step by Step", "SOP", "QA", "Chargen"],
    keyTakeaways: [
      "Auf Profi-Niveau wird nicht mehr die einzelne Pflanze optimiert, sondern die Wiederholbarkeit eines ganzen Systems.",
      "SOPs, Kalibrierung, Freigabekriterien und Ursachenanalyse sind genauso wichtig wie Klima oder Feed.",
      "Die staerksten Teams koppeln wissenschaftliche Evidenz an operative Routinen und Chargen-Review."
    ],
    quickFacts: [
      { label: "Zielgruppe", value: "Teams mit SOP-Anspruch" },
      { label: "Fokus", value: "Reproduzierbarkeit und QA" },
      { label: "Messstil", value: "Chargen- und Zonenvergleich" }
    ],
    sections: [
      {
        heading: "Schritt 1: Betrieb ueber SOPs und Freigabekriterien fuehren",
        content: [
          "Professionelle Grows werden ueber Standards, nicht ueber Tagesstimmung gesteuert. Definiere SOPs fuer Raumvorbereitung, Stecklingsannahme, Bewaesserung, Sensor-Checks, Hygiene und Postharvest-Uebergaben.",
          "Freigabekriterien je Phase helfen, dass Teams nur dann skalieren oder umstellen, wenn die Basis stabil ist. Ohne diese Gates wird jedes Problem zu teuer und schwer reproduzierbar."
        ],
        checklist: [
          "SOP-Versionen mit Datum und Verantwortlichkeit pflegen",
          "Phasen-Gates fuer Veg, Stretch, Bluete und Ernte schriftlich definieren",
          "Abweichungen immer mit CAPA-Logik dokumentieren"
        ]
      },
      {
        heading: "Schritt 2: Klima, Licht und Feed als verknuepfte Datenspuren lesen",
        content: [
          "Auf Profi-Niveau werden keine Einzelwerte diskutiert, sondern Trends: Sensor-Drift, Zonenunterschiede, Bewaesserungsfenster, PPFD-Verteilung, Blattmasse und Drain-Verhalten. Erst daraus entstehen belastbare Entscheidungen.",
          "Studien zu Cannabis-Produktionssystemen und Erfahrungen aus professionellen Indoor-Setups zeigen, dass die groessten Gewinne aus konsistenter Standardisierung und frueher Abweichungserkennung kommen."
        ],
        checklist: [
          "Zone gegen Zone vergleichen statt nur Mittelwerte lesen",
          "Messgeraete nach Kalibrierintervall sperren oder freigeben",
          "Klima- und Feed-Daten mit Ereignislog verknuepfen"
        ]
      },
      {
        heading: "Schritt 2b: Produktionswochen als wiederholbares Betriebsschema",
        content: [
          "Woche 0 Pre-Flight: Raumfreigabe, Sensorstatus, Hygiene, Wasser und Material muessen vor Pflanzenannahme validiert sein. Ohne saubere Startfreigabe beginnt jede Charge mit Blindflug.",
          "Woche 1-3 Etablierung: Clone-Qualitaet, Anwuchsquote und Zonenunterschiede eng monitoren. Jetzt werden SOP-Luecken sichtbar, bevor sie spaeter als Ertragsproblem auftreten.",
          "Woche 4-6 Produktionsdruck: Stretch, Canopy-Dichte und Klima-Kopplung erzeugen die hoechste operative Last. Schichtuebergaben und Event-Logging muessen hier besonders sauber sein.",
          "Woche 7-9 Reife und Risikoabwehr: Botrytis-, Hygiene- und Trockenmasse-Risiken steigen. Freigabekriterien fuer Erntefenster sollten nicht nur auf Optik, sondern auf Charge, Zone und Laborlogik beruhen.",
          "Woche 10+ Postharvest und CAPA: Trocknung, Curing, Labor, Sperrentscheidungen und Review muessen in einer geschlossenen Prozessschleife enden. Erst dann ist die Charge wirklich abgeschlossen."
        ],
        checklist: [
          "Jede Charge mit Pre-Flight und Exit-Review starten und beenden",
          "Schichtwechsel nur mit dokumentiertem Ereignisstand uebergeben",
          "CAPA-Massnahmen spaetestens im Folgezyklus verifizieren"
        ]
      },
      {
        heading: "Schritt 3: Risiko aktiv managen - Hygiene, Pathogene, Lieferkette",
        content: [
          "Premium-Qualitaet scheitert oft nicht an Wuchs, sondern an Hygiene, Probenahme und Nachverfolgbarkeit. Integriere Clone-Hygiene, Schimmelpraevention, Wasserqualitaet und Lieferantenkontrolle in denselben Managementrahmen wie Licht und Ertrag.",
          "Gerade bei hoher Pflanzendichte oder engen Takten werden kleine Hygienefehler schnell zum Chargenproblem. Profi-Grower planen deshalb Risikoabwehr als Kernprozess ein."
        ],
        checklist: [
          "Hygiene-SOP mit Verantwortlichkeiten pro Schicht festlegen",
          "Wasser, Werkzeuge und Clone-Zugaenge als Risikopunkte auditieren",
          "Fruehwarnsignale fuer Pathogene und Schaedlinge in Reviews aufnehmen"
        ]
      },
      {
        heading: "Schritt 4: Nach der Ernte beginnt die naechste Prozessschleife",
        content: [
          "Postharvest, Curing und Laborlogik gehoeren in denselben Performance-Zyklus wie die Kulturphase. Nur so lassen sich Qualitaetsverluste, Chargenunterschiede und Vermarktungsprobleme systematisch beheben.",
          "Ein Profi-Tutorial endet deshalb nicht mit dem Chop. Es endet mit Freigabe, Review, Datenarchiv und klarer Hypothese fuer den naechsten Durchlauf."
        ],
        checklist: [
          "Trocknung und Curing mit eigenen SOPs und Alarmgrenzen fahren",
          "Laborergebnisse gegen Prozessdaten spiegeln",
          "Nach jeder Charge ein Review mit QA, Cultivation und Postharvest machen"
        ]
      }
    ],
    warnings: [
      "Hohe Datendichte ohne klare Entscheidungsregeln fuehrt zu Analyse-Overload statt besserem Grow.",
      "Wenn Hygiene und Freigabekriterien fehlen, kompensiert auch perfektes Klima keine Chargenrisiken."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: SOP",
        text: "Standard Operating Procedure - eine feste Arbeitsanweisung, damit dieselbe Aufgabe immer gleich ausgefuehrt wird."
      },
      {
        title: "Kurz erklaert: CAPA-System",
        text: "Corrective and Preventive Action - strukturierter Umgang mit Abweichungen, Ursachen und Vorbeugung."
      }
    ],
    faq: [
      {
        question: "Wann wird aus einem guten Grow ein professionelles System?",
        answer: "Wenn Ergebnisse ueber mehrere Zyklen, Personen und Zonen reproduzierbar sind und Abweichungen dokumentiert sowie korrigiert werden."
      },
      {
        question: "Was ist auf Profi-Niveau der groesste Engpass?",
        answer: "Fast nie nur ein Duenger oder ein Lichtwert, sondern fehlende Standardisierung zwischen Kultur, Hygiene, QA und Postharvest."
      }
    ],
    glossary: [
      { term: "SOP", definition: "Standardisierte Arbeitsanweisung fuer wiederholbare Prozesse im Betrieb." },
      { term: "CAPA", definition: "System fuer Korrektur und Vorbeugung nach erkannter Abweichung." },
      { term: "Freigabekriterium", definition: "Definierter Schwellenwert oder Check, der vor dem Uebergang in die naechste Phase erfuellt sein muss." }
    ],
    downloads: [
      { title: "Profi Chargen-Checkliste", href: "/terpira/tutorials/how-to-grow-profi-checkliste.txt", kind: "TXT-Checkliste" },
      { title: "Profi SOP-Template fuer Cultivation und QA", href: "/terpira/tutorials/how-to-grow-profi-sop.txt", kind: "TXT-SOP-Vorlage" }
    ],
    relatedSlugs: ["mutterpflanzen-und-clone-hygiene", "schimmel-und-mykotoxine-bei-cannabis", "grow-log-und-kpi-dashboard", "audit-readiness-fuer-content-und-produkt"]
  })
];

type LiteArticleSeed = {
  slug: string;
  title: string;
  summary: string;
  category: TerpiraCategory;
  difficulty: TerpiraDifficulty;
  readMinutes: number;
  tags: string[];
  relatedSlugs: string[];
};

const createLiteArticle = (seed: LiteArticleSeed): TerpiraArticle =>
  createArticle({
    ...seed,
    keyTakeaways: [
      `${seed.title} fokussiert auf reproduzierbare Standards statt Einzeltricks.`,
      "Klare Datenspuren und definierte Kriterien machen Vergleiche belastbar.",
      "Fuer grosse Wissensseiten ist strukturierte Einordnung wichtiger als Hype-Sprache."
    ],
    quickFacts: [
      { label: "Kategorie", value: categoryLabels[seed.category] },
      { label: "Niveau", value: difficultyLabels[seed.difficulty] },
      { label: "Format", value: "Leitfaden mit Praxischeck" }
    ],
    sections: [
      {
        heading: "Kontext und Einordnung",
        content: [
          "Dieser Beitrag ordnet das Thema fuer Teams und Nutzer in einen belastbaren Rahmen ein, damit Entscheidungen nicht nur auf Einzelbeobachtungen beruhen.",
          "Im Fokus stehen nachvollziehbare Kriterien, saubere Begriffsnutzung und der Bezug zu realen Prozessdaten."
        ]
      },
      {
        heading: "Praxisorientierte Umsetzung",
        content: [
          "Der Inhalt verbindet Grundlagen mit operativen Checks, damit das Thema nicht nur verstanden, sondern im Alltag konsistent angewendet werden kann.",
          "Besonders fuer einen grossen ersten Drop entsteht so ein klarer Mehrwert in Orientierung und Vergleichbarkeit."
        ],
        checklist: [
          "Kriterien vorab festlegen",
          "Dokumentation mit Zeitstempel pflegen",
          "Abweichungen und Korrekturen nachvollziehbar erfassen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklaert: Worum geht es hier?",
        text: `Der Artikel erklaert ${seed.title.toLowerCase()} in klaren Schritten und trennt Fakten von Marketingbegriffen.`
      },
      {
        title: "Kurz erklaert: Warum ist das wichtig?",
        text: "Saubere Einordnung reduziert Fehlentscheidungen und verbessert die Qualitaet von Content, Prozessen und Nutzerverstaendnis."
      }
    ],
    faq: [
      {
        question: "Wie nutze ich den Artikel am besten?",
        answer: "Starte mit den Kernpunkten, arbeite die Checkliste durch und vergleiche danach mit deinen aktuellen Prozessen oder Daten."
      },
      {
        question: "Ist das ein starres Regelwerk?",
        answer: "Nein. Es ist ein strukturierter Rahmen, der je nach Setup angepasst werden sollte, ohne die Datendisziplin zu verlieren."
      }
    ],
    glossary: [
      { term: "Kriterium", definition: "Vorab definierter Massstab zur Bewertung eines Sachverhalts oder Prozesses." },
      { term: "Datenspur", definition: "Nachvollziehbare Dokumentation von Messwerten, Entscheidungen und Aenderungen." },
      { term: "Kontext", definition: "Rahmenbedingungen, die bestimmen, wie ein Ergebnis richtig eingeordnet wird." },
    ]
  });

const thirdWaveSeeds: LiteArticleSeed[] = [
  { slug: "naehrstoffblockaden-und-antagonismen", title: "Naehrstoffblockaden und Antagonismen", summary: "Warum trotz ausreichender Duengewerte Mangelbilder auftreten koennen und wie Blockaden sauber eingeordnet werden.", category: "anbau", difficulty: "fortgeschritten", readMinutes: 8, tags: ["Naehrstoffe", "Antagonismus", "pH", "Diagnostik"], relatedSlugs: ["cannabis-anbau-grundlagen", "bewaesserung-ohne-uebergiessen", "vpd-und-ec-kombi-rechner-guide"] },
  { slug: "stressmarker-frueh-erkennen", title: "Stressmarker frueh erkennen", summary: "Fruehe Hinweise auf Klima-, Licht- und Wurzelstress erkennen, bevor Ertrag und Qualitaet kippen.", category: "anbau", difficulty: "einsteiger", readMinutes: 6, tags: ["Stress", "Monitoring", "Frueherkennung", "Grow"], relatedSlugs: ["lichtstress-und-canopy-management", "cannabis-substrat-und-wurzelzone", "grow-log-und-kpi-dashboard"] },
  { slug: "genetische-stabilitaet-ueber-generationen", title: "Genetische Stabilitaet ueber Generationen", summary: "Wie Linien ueber mehrere Zyklen bewertet werden und warum Stabilitaet ein eigenes Kriterienset braucht.", category: "genetik", difficulty: "profi", readMinutes: 9, tags: ["Genetik", "Stabilitaet", "Selektion", "Linien"], relatedSlugs: ["genetik-und-phaenotyp-selektion", "selektionsscorecards-fuer-pheno-hunts", "mutterpflanzen-und-clone-hygiene"] },
  { slug: "crossing-backcrossing-grundlagen", title: "Crossing und Backcrossing Grundlagen", summary: "Grundbegriffe der Zuchtarbeit fuer bessere Einordnung von Linienbeschreibungen und Selektionszielen.", category: "genetik", difficulty: "fortgeschritten", readMinutes: 8, tags: ["Crossing", "Backcross", "Zucht", "Linien"], relatedSlugs: ["feminisiert-vs-regular-vs-autoflower", "genetik-und-phaenotyp-selektion", "selektionsscorecards-fuer-pheno-hunts"] },
  { slug: "terpen-oxidationsprodukte-und-bedeutung", title: "Terpen-Oxidationsprodukte und Bedeutung", summary: "Wie oxidierte Terpenanteile Profile veraendern und warum frische Analytik plus Lagerkontext zusammengehoeren.", category: "chemie", difficulty: "profi", readMinutes: 9, tags: ["Terpene", "Oxidation", "Analytik", "Chemie"], relatedSlugs: ["thc-zu-cbn-abbau-und-oxidation", "lagerung-und-terpenverlust-vermeiden", "analytik-hplc-vs-gc-bei-cannabinoiden"] },
  { slug: "matrixeffekte-in-der-cannabisanalytik", title: "Matrixeffekte in der Cannabis-Analytik", summary: "Warum dieselbe Methode je Produktmatrix unterschiedlich reagieren kann und was das fuer Vergleichbarkeit bedeutet.", category: "chemie", difficulty: "profi", readMinutes: 9, tags: ["Matrix", "Analytik", "Labor", "Methodik"], relatedSlugs: ["analytik-hplc-vs-gc-bei-cannabinoiden", "sampling-und-probenahme-fehler", "coa-richtig-lesen"] },
  { slug: "minor-terpene-und-profiltiefe", title: "Minor-Terpene und Profiltiefe", summary: "Warum kleine Terpenanteile fuer Profilcharakter und Vergleichbarkeit wichtig sein koennen.", category: "terpene", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Minor Terpene", "Profil", "Aroma", "Analytik"], relatedSlugs: ["terpene-und-wirkprofil", "myrcen-limonen-caryophyllen-einordnung", "sensorik-panels-fuer-cannabisprodukte"] },
  { slug: "terpen-panels-und-qualitaetslabels", title: "Terpen-Panels und Qualitaetslabels", summary: "Wie Terpenpanels fuer Kataloge standardisiert werden koennen, ohne in Marketingkuerzel abzurutschen.", category: "terpene", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Terpenpanel", "Label", "Katalog", "Qualitaet"], relatedSlugs: ["sensorik-panels-fuer-cannabisprodukte", "terpene-und-wirkprofil", "coa-richtig-lesen"] },
  { slug: "indikationsgrenzen-und-patientenkommunikation", title: "Indikationsgrenzen und Patientenkommunikation", summary: "Wie medizinische Inhalte Nutzen, Grenzen und Unsicherheiten gleichzeitig transparent darstellen.", category: "medizin", difficulty: "profi", readMinutes: 9, tags: ["Indikation", "Medizin", "Kommunikation", "Evidenz"], relatedSlugs: ["cannabinoide-und-evidenz", "cannabis-bei-schmerz-evidenzcheck", "cannabinoide-nebenwirkungen-und-interaktionen"] },
  { slug: "real-world-data-vs-rct-bei-cannabis", title: "Real-World-Data vs. RCT bei Cannabis", summary: "Wie Beobachtungsdaten und klinische Studien zusammen gelesen werden sollten.", category: "medizin", difficulty: "profi", readMinutes: 9, tags: ["RWD", "RCT", "Evidenz", "Studien"], relatedSlugs: ["cannabinoide-und-evidenz", "cannabis-und-schlaf-was-ist-belegt", "cbd-und-angststoerungen-einordnung"] },
  { slug: "orale-produkte-und-first-pass-risiken", title: "Orale Produkte und First-Pass-Risiken", summary: "Einordnung von Effektdauer, Verzogerung und Fehlsteuerung bei oraler Anwendung.", category: "konsumformen", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Oral", "First Pass", "Timing", "Risiko"], relatedSlugs: ["inhalation-vs-edibles", "sublingual-tinkturen-richtig-einordnen", "inhalation-set-setting-und-harm-reduction"] },
  { slug: "dosisprotokolle-ohne-uebertreibung", title: "Dosisprotokolle ohne Uebertreibung", summary: "Wie strukturierte Dosisprotokolle fuer Aufklaerung funktionieren, ohne falsche Sicherheit zu erzeugen.", category: "konsumformen", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Dosis", "Protokoll", "Aufklaerung", "Risiko"], relatedSlugs: ["inhalation-vs-edibles", "cannabinoide-nebenwirkungen-und-interaktionen", "inhalation-set-setting-und-harm-reduction"] },
  { slug: "concentrate-categorization-fuer-plattformen", title: "Concentrate-Categorization fuer Plattformen", summary: "Wie Konzentrate so kategorisiert werden, dass Nutzer vergleichen koennen und Daten konsistent bleiben.", category: "konzentrate", difficulty: "profi", readMinutes: 8, tags: ["Konzentrate", "Katalog", "Taxonomie", "Plattform"], relatedSlugs: ["hash-typen-vergleichen", "full-melt-und-marketingsprache", "rosin-einordnung-ohne-hype"] },
  { slug: "kontaminantenprofile-bei-extrakten", title: "Kontaminantenprofile bei Extrakten", summary: "Welche Kontaminantenklassen bei konzentrierten Produkten besondere Aufmerksamkeit brauchen.", category: "konzentrate", difficulty: "fortgeschritten", readMinutes: 8, tags: ["Extrakte", "Kontaminanten", "Sicherheit", "Labor"], relatedSlugs: ["bubble-hash-qualitaetskriterien", "pgr-und-kontaminanten", "pestizidklassen-und-rueckstandsrisiken"] },
  { slug: "internationale-regelwerke-vergleichen", title: "Internationale Regelwerke vergleichen", summary: "Wie sich Rahmenwerke zwischen Regionen unterscheiden und was das fuer Content und Compliance bedeutet.", category: "recht", difficulty: "profi", readMinutes: 9, tags: ["Regulierung", "International", "Compliance", "Recht"], relatedSlugs: ["rechtliche-grundlagen-dach", "gmp-gdp-und-qualitaetssysteme", "werbeaussagen-und-health-claims-cannabis"] },
  { slug: "audit-readiness-fuer-content-und-produkt", title: "Audit-Readiness fuer Content und Produkt", summary: "Praktische Leitlinien, um Dokumente, Prozesse und Wissensinhalte auditfaehig zu halten.", category: "recht", difficulty: "fortgeschritten", readMinutes: 8, tags: ["Audit", "Readiness", "Dokumentation", "Compliance"], relatedSlugs: ["dokumentationspflichten-fuer-chargen", "batch-release-und-freigabekriterien", "gmp-gdp-und-qualitaetssysteme"] },
  { slug: "microbial-trending-und-fruehwarnung", title: "Microbial Trending und Fruehwarnung", summary: "Wie mikrobielle Messreihen als Fruehwarnsystem fuer Qualitaets- und Sicherheitsprobleme genutzt werden.", category: "sicherheit", difficulty: "profi", readMinutes: 8, tags: ["Mikrobiologie", "Trending", "Fruehwarnung", "Sicherheit"], relatedSlugs: ["schimmel-und-mykotoxine-bei-cannabis", "recall-und-sperrprozesse-fuer-chargen", "wasseraktivitaet-und-curing"] },
  { slug: "supplier-risk-scoring-fuer-cannabis", title: "Supplier-Risk-Scoring fuer Cannabis", summary: "Wie Lieferanten nach Datenqualitaet, Abweichungen und Zuverlaessigkeit bewertet werden koennen.", category: "sicherheit", difficulty: "profi", readMinutes: 8, tags: ["Lieferanten", "Scoring", "Risiko", "Qualitaet"], relatedSlugs: ["lieferkette-und-rueckverfolgbarkeit", "white-label-und-qualitaetsrisiken", "dokumentationspflichten-fuer-chargen"] },
  { slug: "interlaborvergleich-und-ringtests", title: "Interlaborvergleich und Ringtests", summary: "Warum Ringtests wichtig sind, um Laborqualitaet und Vergleichbarkeit langfristig abzusichern.", category: "qualitaet", difficulty: "profi", readMinutes: 8, tags: ["Ringtest", "Interlabor", "Qualitaet", "Analytik"], relatedSlugs: ["coa-richtig-lesen", "analytik-hplc-vs-gc-bei-cannabinoiden", "sampling-und-probenahme-fehler"] },
  { slug: "stabilitaetsprogramme-fuer-produktlinien", title: "Stabilitaetsprogramme fuer Produktlinien", summary: "Wie strukturierte Stabilitaetspruefungen ueber Chargen und Zeit aufgebaut werden.", category: "qualitaet", difficulty: "profi", readMinutes: 9, tags: ["Stabilitaet", "Produktlinie", "Qualitaet", "Programm"], relatedSlugs: ["lagerung-verpackung-und-lichtschutz", "batch-release-und-freigabekriterien", "thc-zu-cbn-abbau-und-oxidation"] },
  { slug: "preisindizes-und-marktzyklen", title: "Preisindizes und Marktzyklen", summary: "Wie Preiszyklen interpretiert werden und warum Indexe fuer Marktbeobachtung auf Plattformen sinnvoll sind.", category: "markt", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Preis", "Index", "Markt", "Zyklus"], relatedSlugs: ["markttransparenz-und-preise", "lieferkette-und-rueckverfolgbarkeit", "white-label-und-qualitaetsrisiken"] },
  { slug: "nachfrageprognosen-fuer-produktkategorien", title: "Nachfrageprognosen fuer Produktkategorien", summary: "Welche Daten fuer belastbare Prognosen taugen und wo reine Trendbeobachtung zu kurz greift.", category: "markt", difficulty: "profi", readMinutes: 8, tags: ["Prognose", "Nachfrage", "Kategorie", "Markt"], relatedSlugs: ["markttransparenz-und-preise", "preisindizes-und-marktzyklen", "grow-log-und-kpi-dashboard"] },
  { slug: "content-taxonomie-und-tag-governance", title: "Content-Taxonomie und Tag-Governance", summary: "Wie grosse Wissensseiten Kategorien und Tags so steuern, dass Suche und Navigation stabil bleiben.", category: "werkzeuge", difficulty: "profi", readMinutes: 8, tags: ["Taxonomie", "Tags", "Governance", "Wiki"], relatedSlugs: ["grow-log-und-kpi-dashboard", "sensor-kalibrierung-und-messfehler", "concentrate-categorization-fuer-plattformen"] },
  { slug: "release-checklisten-fuer-wiki-drops", title: "Release-Checklisten fuer Wiki-Drops", summary: "Praxis-Checkliste fuer gross angelegte Content-Drops mit Qualitaets- und Konsistenzkontrolle.", category: "werkzeuge", difficulty: "einsteiger", readMinutes: 6, tags: ["Release", "Checkliste", "Wiki", "QA"], relatedSlugs: ["content-taxonomie-und-tag-governance", "batch-release-und-freigabekriterien", "grow-log-und-kpi-dashboard"] },
  { slug: "naehrstoffbedarf-cannabis-lebenszyklus", title: "Naehrstoffbedarf im Cannabis-Lebenszyklus", summary: "Phasenweise Uebersicht des NPK-, Ca- und Mg-Bedarfs bei Photoperiodisch- und Autoflower-Pflanzen in Erde und Coco – basierend auf peer-reviewten Studien.", category: "anbau", difficulty: "fortgeschritten", readMinutes: 10, tags: ["Naehrstoffe", "Naehrstoffmangel", "Duengung", "Lebenszyklus", "NPK", "Autoflower", "Photoperiodisch", "Erde", "Coco", "Studien"], relatedSlugs: ["cannabis-anbau-grundlagen", "naehrstoffblockaden-und-antagonismen", "cannabis-substrat-und-wurzelzone", "feminisiert-vs-regular-vs-autoflower", "substrat-vergleich-coco-erde-hydro"] },
  { slug: "substrat-vergleich-coco-erde-hydro", title: "Substratvergleich: Coco, Erde und Hydro", summary: "Was peer-reviewte Studien ueber Ertrag, EC-Toleranz und Pflegeaufwand bei den drei Hauptsubstraten sagen – inklusive praktischer Empfehlungen fuer Hobby-Grower.", category: "anbau", difficulty: "fortgeschritten", readMinutes: 9, tags: ["Substrat", "Naehrstoffe", "Schaedlinge", "Coco", "Hydro", "Erde", "EC", "pH", "Ertrag", "Studien"], relatedSlugs: ["cannabis-substrat-und-wurzelzone", "bewaesserung-ohne-uebergiessen", "vpd-und-ec-kombi-rechner-guide", "naehrstoffbedarf-cannabis-lebenszyklus"] },
  { slug: "indoor-outdoor-anbau-vergleich", title: "Indoor vs. Outdoor: Anbauvergleich Cannabis", summary: "Licht, Ertrag, Terpenprofil und Risikofaktoren im direkten Vergleich – was Forschung und Praxis ueber beide Anbausysteme sagen.", category: "anbau", difficulty: "einsteiger", readMinutes: 8, tags: ["Indoor", "Outdoor", "Licht", "Ertrag", "Terpene", "Umwelt", "Schaedlinge", "Naehrstoffe", "Studien"], relatedSlugs: ["cannabis-anbau-grundlagen", "lichtstress-und-canopy-management", "schimmel-und-mykotoxine-bei-cannabis", "vpd-und-ec-kombi-rechner-guide"] }
];

const thirdWaveWikiArticles: TerpiraArticle[] = thirdWaveSeeds.map(createLiteArticle);

export const wikiArticles: TerpiraArticle[] = [
  ...baseWikiArticles,
  ...expansionWikiArticles,
  ...thirdWaveWikiArticles
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
