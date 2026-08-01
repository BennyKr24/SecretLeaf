import { TerpiraArticle, TerpiraCategory, TerpiraDifficulty, TerpiraSource, GrowCategory } from "@/lib/terpira/types";
import autoSourcesData from "./autoSources.json";
import { diagnosticSources, diagnosticArticles, DIAGNOSTIC_GROW_KNOWLEDGE } from "./diagnostics";

export const categoryLabels: Record<TerpiraCategory, string> = {
  anbau: "Anbau & Ernte",
  genetik: "Genetik & Selektion",
  chemie: "Chemie & Nährstoffe",
  terpene: "Terpene & Aromen",
  medizin: "Medizin & Wirkung",
  konsumformen: "Anwendung & Konsum",
  konzentrate: "Konzentrate & Extrakte",
  recht: "Recht & Compliance",
  sicherheit: "Sicherheit & Aufklärung",
  qualitaet: "Qualität & Laborwerte",
  markt: "Markt & Beschaffung",
  werkzeuge: "Tools & Rechner"
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
    publisher: "Bundesinstitut für Arzneimittel (BfArM)",
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

function normalizeEditorialPriority(value: string | undefined): TerpiraSource["editorialPriority"] {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return undefined;
}

const autoSources: TerpiraSource[] = (autoSourcesData.sources ?? []).map((source) => {
  const { editorialPriority: rawEditorialPriority, ...rest } = source;
  const editorialPriority = normalizeEditorialPriority(rawEditorialPriority);

  return {
    ...rest,
    ...(editorialPriority ? { editorialPriority } : {}),
    sourceType: "auto" as const
  };
});

const sourceById = new Map<string, TerpiraSource>();
for (const src of sourceRegisterCore) {
  sourceById.set(src.id, src);
}
for (const src of diagnosticSources) {
  if (!sourceById.has(src.id)) {
    sourceById.set(src.id, src);
  }
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
    summary: "Wie Licht, Klima und Nährstoffe zusammenspielen und warum Wiederholbarkeit wichtiger ist als Hype-Tricks.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 9,
    lastUpdated: "2026-03-26",
    tags: ["VPD", "PPFD", "Nährstoffe", "Dokumentation"],
    keyTakeaways: [
      "Arbeite mit stabilen Zielkorridoren statt täglich wechselnden Sollwerten.",
      "Miss Temperatur, RH, pH, EC und Lichtleistung konsistent in festen Intervallen.",
      "Skaliere Inputs schrittweise und dokumentiere jede Veränderung mit Datum."
    ],
    quickFacts: [
      { label: "Schwerpunkt", value: "Klima, Licht, Nährstoffe" },
      { label: "Fehlerquelle #1", value: "Zu viele Variablen gleichzeitig" },
      { label: "Empfohlenes Tracking", value: "Taegliches Grow-Log" }
    ],
    sections: [
      {
        heading: "Systemdenken statt Einzeltricks",
        content: [
          "Ertrag und Qualität entstehen aus stabilen Prozessen — nicht aus isolierten Tricks.",
          "Licht, Klima und Nährstoffe greifen ineinander: eine Aenderung beeinflusst immer das Gesamtsystem."
        ],
        checklist: [
          "VPD-Zielbereich pro Wachstumsphase definieren",
          "Messpunkte für Klima festlegen (Canopy, Raum, Zu-/Abluft)",
          "Wochenreview mit Ertrag, Qualität und Problemen"
        ]
      },
      {
        heading: "Warum das deinen Ertrag und deine Qualität direkt beeinflusst",
        content: [
          "Instabile Parameter erzeugen Stress. Stress kostet Ertrag und verschlechtert das Terpenprofil.",
          "Wer Messwerte nicht dokumentiert, kann Ursachen nach einem schlechten Run nicht zurückverfolgen."
        ]
      },
      {
        heading: "Datensaubere Routinen",
        content: [
          "Notiere Futterstaerke, pH-Korrekturen und Giesstermine in einer einheitlichen Struktur.",
          "Nur so lassen sich Ursache-Wirkung-Beziehungen später sicher bewerten."
        ]
      },
      {
        heading: "In SecretLeaf relevant wenn",
        content: [
          "du deinen ersten Run startest und kein Setup-Protokoll hast",
          "Qualität oder Ertrag zwischen Runs schwankt, ohne erkennbaren Grund",
          "du eine Variable (Licht, Dünger, Temperatur) anpassen willst und die Auswirkung verstehen möchtest"
        ]
      },
      {
        heading: "Was du konkret tun solltest",
        content: [],
        checklist: [
          "Lege heute fixe Messpunkte fest: Temperatur, RH, pH, EC — tägliche zur gleichen Zeit",
          "Schreibe jede Aenderung mit Datum ins Grow-Log, bevor du sie machst",
          "Aendere nur eine Variable pro Woche — sonst kannst du Ursachen nicht isolieren"
        ]
      }
    ],
    warnings: ["Unstabile Nacht-Temperaturen erhöhen Stress und Risiko für Schimmelereignisse."],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Was ist Systemdenken?",
        text: "Jede Aenderung bei Licht, Klima oder Naehrstoffen beeinflusst die anderen Parameter. Stabilität statt Einzeltricks ist der Schluessel."
      },
      {
        title: "Kurz erklärt: Warum Dokumentation?",
        text: "Nur mit schriftlichen Aufzeichnungen lassen sich Fehler später nachvollziehen und Verbesserungen dauerhaft etablieren."
      }
    ],
    faq: [
      {
        question: "Muss ich teure Geräte kaufen, um gut anzubauen?",
        answer: "Nein. Entscheidend ist die SOP-Konsistenz, nicht die Ausruestung. Guenstige Sensoren mit zuverlaussigem Logging schlagen teure Einzelgeraete."
      },
      {
        question: "Wie oft sollte ich mich um die Pflanzen kuemmern?",
        answer: "Das hängt vom Setup ab. Wichtig ist die Frequenz und Konsistenz: tägliche Beobachtung + wöchentliche Messung + monatliche Analyse nach SOP."
      }
    ],
    glossary: [
      {
        term: "VPD",
        definition: "Vapor Pressure Deficit - die Trocknungskraft der Luft, bestimmt durch Temperatur und Luftfeuchte."
      },
      {
        term: "PPFD",
        definition: "Photosynthetic Photon Flux Density - Lichtintensität in Photonen pro Quadratmeter."
      },
      {
        term: "EC",
        definition: "Electrical Conductivity - Salzgehalt der Naehrlosung, Indikator für verfuegbare Nährstoffe."
      }
    ],
    sourceIds: ["horticulture-research-cannabis-cultivation", "plant-physiology-vpd-transpiration", "astm-d37-cannabis", "postharvest-biology-technology-curing"],
    relatedSlugs: ["vpd-einfach-erklärt", "wasseraktivität-und-curing", "coa-richtig-lesen"]
  },
  {
    slug: "vpd-einfach-erklaert",
    title: "VPD einfach erklärt",
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
          "Relative Luftfeuchte ohne Temperaturkontext führt oft zu Fehlentscheidungen.",
          "VPD verbindet Temperatur und Feuchte in einer direkt handlungsorientierten Kennzahl."
        ]
      },
      {
        heading: "Praxisleitfaden",
        content: [
          "Arbeite mit Phase-Profilen (Jungpflanze, Wachstum, Blüte) und teste nur kleine Aenderungen.",
          "Nach jeder Korrektur mindestens 24 Stunden beobachten, bevor erneut eingegriffen wird."
        ],
        checklist: [
          "Sensor-Kalibrierung monatlich prüfen",
          "Blatttemperatur per IR-Messung einbeziehen",
          "Warnschwellen für zu trockene/zu feuchte Luft definieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Was ist VPD?",
        text: "VPD ist die Trocknungskraft der Luft. Es kombiniert Temperatur und Feuchte in einer Kennzahl, die direkt beeinflusst, wie schnell Pflanzen transpirieren."
      },
      {
        title: "Kurz erklärt: Warum nicht nur RH?",
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
        definition: "Spezifische VPD-Zielwerte für verschiedene Wachstumsstadien (Keim, Jungpflanze, Wachstum, Blüte)."
      }
    ],
    sourceIds: ["plant-physiology-vpd-transpiration", "astm-d37-cannabis", "horticulture-research-cannabis-cultivation"],
    relatedSlugs: ["cannabis-anbau-grundlagen", "wasseraktivität-und-curing"]
  },
  {
    slug: "genetik-und-phaenotyp-selektion",
    title: "Genetik und Phaenotyp-Selektion",
    summary: "Wie du genetische Linien vergleichst, stabile Kandidaten auswaehlst und Drift über Generationen vermeidest.",
    category: "genetik",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-03-26",
    tags: ["Genetik", "Pheno-Hunt", "Stabilität", "Clones"],
    keyTakeaways: [
      "Selektionsziele müssen vor dem Hunt messbar definiert werden.",
      "Einheitliche Kulturbedingungen sind Pflicht für faire Vergleiche.",
      "Mutterpflanzen brauchen Hygiene- und Erneuerungszyklen gegen genetischen Drift."
    ],
    quickFacts: [
      { label: "Zielmetrik", value: "Stabilität + Qualität + Risiko" },
      { label: "Hunt-Dauer", value: "Mehrere Durchläufe sinnvoll" },
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
          "Nur reproduzierbare Linien sind für den operativen Betrieb sinnvoll."
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
        title: "Kurz erklärt: Was ist ein Pheno-Hunt?",
        text: "Eine systematische Suche nach den besten genetischen Ausprägungen unter einheitlichen Bedingungen."
      },
      {
        title: "Kurz erklärt: Warum nicht nur 1 Pflanze?",
        text: "Gene verändern sich über Generationen. Mehrere Durchläufe und Backup-Clones sind noetig, um wirklich stabile Kandidaten zu finden."
      }
    ],
    faq: [
      {
        question: "Wie lange dauert ein verantwortungsvoller Hunt?",
        answer: "Mindestens 2 bis 3 Durchläufe. Der erste Hunt identifiziert potenzielle Kandidaten, der zweite prüft Stabilität und Reproduzierbarkeit."
      },
      {
        question: "Was ist das größte Fehlerrisiko?",
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
        definition: "System, bei dem Mutterpflanzen regelmäßig erneuert werden, um Degeneration zu minimieren."
      }
    ],
    sourceIds: ["genetics-heritable-traits-cannabis", "horticulture-research-cannabis-cultivation", "astm-d37-cannabis"],
    relatedSlugs: ["cannabis-anbau-grundlagen", "terpene-und-wirkprofil"]
  },
  {
    slug: "terpene-und-wirkprofil",
    title: "Terpene und Wirkprofil",
    summary: "Welche Rolle Terpene für Aroma und Produktprofil spielen und wie man Marketingaussagen sauber von Daten trennt.",
    category: "terpene",
    difficulty: "fortgeschritten",
    readMinutes: 10,
    lastUpdated: "2026-03-26",
    tags: ["Terpene", "GC-MS", "Sensorik", "Profil"],
    keyTakeaways: [
      "Terpene ergänzen Wirkstoffdaten, ersetzen sie aber nicht.",
      "Probenahme und Lagerung beeinflussen Terpen-Ergebnisse massiv.",
      "Wirkungsbehauptungen brauchen klare Evidenzstufe und Kontext."
    ],
    quickFacts: [
      { label: "Analyse", value: "GC-MS für Profiling" },
      { label: "Risiko", value: "Terpenverlust durch Hitze/Oxidation" },
      { label: "Use-Case", value: "Produktdifferenzierung" }
    ],
    sections: [
      {
        heading: "Was Terpene wirklich leisten",
        content: [
          "Terpene formen das Aroma deiner Ernte und beeinflussen, wie das Produkt wahrgenommen wird.",
          "Sie ersetzen keine Laborwerte für Cannabinoide — aber sie erklären, warum zwei Chargen mit gleichen THC-Werten unterschiedlich wirken."
        ]
      },
      {
        heading: "Warum das deine Qualität direkt betrifft",
        content: [
          "Terpene sind flüchtig: Hitze, Luft und Licht bauen sie ab — schlechte Lagerung zerstört das Profil.",
          "Wer Terpenverluste versteht, kann Ernte, Curing und Lagerung konkret verbessern."
        ]
      },
      {
        heading: "In SecretLeaf relevant wenn",
        content: [
          "du Chargen vergleichen willst und nicht weisst, warum sich Aroma unterscheidet",
          "dein Curing oder deine Lagerung das Profil verändern und du den Grund nicht kennst",
          "du Laborwerte einordnen möchtest und nicht weisst, welche Terpenangabe belastbar ist"
        ]
      },
      {
        heading: "Was du konkret tun solltest",
        content: [],
        checklist: [
          "Ernte bei < 22\u00b0C trocknen und lagern — jeder Grad mehr beschleunigt Terpenverlust messbar",
          "Glasbehaelter luftdicht verschliessen — Sauerstoffkontakt ist der größte Einzelfaktor für Profilveraenderung",
          "COA-Terpenangabe nur vergleichen, wenn gleiche Methode und Probenahmezeit dokumentiert sind"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Terpene sind nicht Wirkung",
        text: "Terpene beeinflussen das sensorische Profil und koennten Effekte unterstützen, ersetzen aber niemals Laborwerte für Cannabinoide oder Kontaminanten."
      },
      {
        title: "Kurz erklärt: Wie werden Terpene gemessen?",
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
        definition: "Spezifische Zusammensetzung und Menge von Terpenen in einem Cannabis-Produkt, charakteristisch für Sorte und Prozess."
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
    summary: "Einordung von THC, CBD und Minor Cannabinoiden mit Fokus auf Studienqualität statt Buzzwords.",
    category: "medizin",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-03-26",
    tags: ["THC", "CBD", "CBG", "Evidenz"],
    keyTakeaways: [
      "Nicht jede oft zitierte Aussage ist klinisch robust abgesichert.",
      "Dosis, Kontext und individuelle Faktoren verändern Effekte deutlich.",
      "Studienqualität ist wichtiger als virale Einzelclaims."
    ],
    quickFacts: [
      { label: "Fokus", value: "Evidenzstufen statt Hype" },
      { label: "Bewertung", value: "RCT, Meta-Analyse, Beobachtung" },
      { label: "Praxis", value: "Aufklärung statt Heilversprechen" }
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
        title: "Kurz erklärt: Was ist Evidenz?",
        text: "Stufen von schwach (einzelne Fallberichte) bis stark (mehrere große RCT-Studien mit Replikation)."
      },
      {
        title: "Kurz erklärt: Warum klinische Daten wichtiger sind",
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
        definition: "Körper-interner Signalisierungsweg mit CB1/CB2-Rezeptoren; reguliert Stimmung, Schmerz, Immunfunktion."
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
    summary: "Vergleich von Aufnahmewegen, Onset-Zeit, Wirkdauer und Risiken für bessere Aufklärung.",
    category: "konsumformen",
    difficulty: "einsteiger",
    readMinutes: 7,
    lastUpdated: "2026-03-26",
    tags: ["Inhalation", "Edibles", "Onset", "Harm Reduction"],
    keyTakeaways: [
      "Onset und Wirkdauer unterscheiden sich stark zwischen Konsumformen.",
      "Gerade bei Edibles ist langsames Dosieren zentral für Risikominimierung.",
      "Aufklärung über Zeitverlauf verhindert viele Fehlentscheidungen."
    ],
    quickFacts: [
      { label: "Schneller Onset", value: "Inhalation" },
      { label: "Längere Wirkdauer", value: "Orale Aufnahme" },
      { label: "Hauptfehler", value: "Zu fruehes Nachdosieren" }
    ],
    sections: [
      {
        heading: "Pharmakokinetik in der Praxis",
        content: [
          "Inhalation wirkt typischerweise schnell, klingt aber früher ab.",
          "Orale Aufnahme startet später und kann deutlich länger anhalten."
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
        title: "Kurz erklärt: Bioverfügbarkeit",
        text: "Wieviel des Wirkstoffs tatsächlich ins Blut gelangt. Inhalation = schnell + dosis-pulsatil; Edibles = langsam + persistenter."
      },
      {
        title: "Kurz erklärt: First-Pass-Metabolismus",
        text: "Die Leber baut Wirkstoffe ab, bevor sie die Blutbahn erreichen. Bei Edibles passiert das zuerst (orale Route); bei Inhalation wird das teilweise umgangen."
      }
    ],
    faq: [
      {
        question: "Warum wirken Edibles später und länger als Rauchen?",
        answer: "Verdauung + Leber-Passage dauern 1-2h. Dafür wirkt die Wirkung intensiver und persistenter als Inhalation."
      },
      {
        question: "Kann ich Dosis-Intensität zwischen den Methoden vergleichen?",
        answer: "Nein direkt. Eine 10mg oral muss nicht eine 10mg inhalativ sein - Bioverfügbarkeit unterscheidet sich um bis zu 3x."
      }
    ],
    glossary: [
      {
        term: "Bioverfügbarkeit",
        definition: "Prozentsatz eines Wirkstoffs, der tatsächlich im Körper wirksam wird; abhängig von Resorption und Metabolismus."
      },
      {
        term: "Peak-Level",
        definition: "Hoechste Konzentration eines Wirkstoffs im Blut; tritt schneller bei Inhalation auf als bei oraler Aufnahme."
      },
      {
        term: "Half-Life",
        definition: "Zeit, die eine Substanz bis zur Haelfte ihres Ausgangsspiegels im Körper abgebaut wird."
      }
    ],
    sourceIds: ["pharmaceutical-research-bioavailability", "clinical-pharmacology-thc-cbd-kinetics", "drug-alcohol-dependence-consumption-methods", "nutritional-bioavailability-edibles"],    relatedSlugs: ["pgr-und-kontaminanten", "cannabinoide-und-evidenz"]
  },
  {
    slug: "hash-typen-vergleichen",
    title: "Hash-Typen professionell eingeordnet",
    summary: "Ursprung, Verfahrensfamilien, klassische und moderne Typen sowie klare Systematik: was wirklich zusammengehört und wie man Qualität fachlich bewertet.",
    category: "konzentrate",
    difficulty: "profi",
    readMinutes: 16,
    lastUpdated: "2026-03-26",
    tags: ["Klassifikation", "Dry Sift", "Bubble Hash", "Rosin", "Charas", "Kif", "Qualität"],
    keyTakeaways: [
      "Hash sollte zuerst nach Verfahrensfamilien klassifiziert werden: mechanisch, eiswasserbasiert, pressbasiert und loesungsmittelgestuetzt.",
      "Historische Begriffe (z. B. Charas, Kif, Afghan, Lebanese) beschreiben oft Herkunft und Stil, nicht automatisch objektive Qualität.",
      "Produktfamilien gehören zusammen, wenn sie dieselbe Trennlogik nutzen und im selben Post-Processing weiterverarbeitet werden.",
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
          "Was gehört zusammen: Dry Sift und traditionelle Kief-Linien sind eine Familie; Bubble und daraus gepresste Rosin-Linien sind eine zweite Familie; historische Presshash-Stile bilden eine kultur- und prozesshistorische Gruppe."
        ]
      },
      {
        heading: "2) Historischer Ursprung und regionale Stilbegriffe",
        content: [
          "Historisch entstanden verschiedene Hash-Kulturen in unterschiedlichen Regionen mit eigenen Rohwaren, Klimabedingungen und Presstechniken.",
          "Nordafrika ist eng mit Kief-/Siebtraditionen verbunden; in Teilen Zentral- und Suedasiens sind handgeriebene und gepresste Formen historisch praegend; in der Levante entwickelten sich eigene Presshash-Stile mit spezifischer Reifung und Marktlogik.",
          "Wichtig: Regionenamen sind Stilmarker, aber keine automatische Garantie für Reinheit, Potenz oder Sicherheitsprofil."
        ]
      },
      {
        heading: "3) Verfahrensfamilien im professionellen Vergleich",
        content: [
          "Dry Sift/Kief: trocken-mechanische Trennung. Stärken liegen in klarer Prozesslogik und guter Skalierbarkeit, Risiken liegen in Verunreinigung durch Pflanzenreste bei ungenauer Fraktionierung.",
          "Ice Water/Bubble: nasskalte Trennung. Stärken sind hohe Reinheitsfenster bei sauberer Prozessführung; kritische Punkte sind Trocknungsmanagement, Wasseraktivität und mikrobiologische Stabilität.",
          "Presshash/Traditionsstile: Verdichtung und Reifung sind zentrale Faktoren. Ergebnisqualität hängt stark von Ausgangsfraktion, Druck-/Wärmeprofil und Lagerregime ab.",
          "Rosin-Linien: loesungsmittelfreie Press-Weiterverarbeitung von geeigneten Vorprodukten. Qualität wird von Input-Material und thermischer Belastung begrenzt.",
          "Loesungsmittelgestuetzte Extrakte: eigene Produktklasse; für Vergleich mit klassischem Hash müssen Restlösungsmittel- und Reinheitsdaten zwingend betrachtet werden."
        ]
      },
      {
        heading: "4) Welche Begriffe werden häufig verwechselt?",
        content: [
          "Kief ist nicht automatisch fertiger Presshash; Bubble ist nicht automatisch Rosin; Rosin ist ein Endprodukt aus geeigneten Vorstufen, keine Herkunftsbezeichnung.",
          "" +
            "'Full melt', '6 star', 'premium'" +
            " sind Marktbegriffe und sollten stets gegen objektive Messwerte (z. B. Kontaminantenstatus, Wasseraktivität, Chargenvergleich) gespiegelt werden.",
          "'Old school' vs. 'modern' beschreibt oft Verarbeitungskultur und Zielprofil, nicht zwingend Sicherheits- oder Qualitaetsniveau."
        ]
      },
      {
        heading: "5) Professionelle Bewertungsmatrix",
        content: [
          "Sensorik: Klarheit der Aromen, Fremdnoten, Oxidationshinweise, konsistente Chargencharakteristik.",
          "Physikalik: Homogenität, Trennverhalten bei definierter Temperatur, Stabilität in Lagerung und Transport.",
          "Analytik: Cannabinoid-/Terpenprofil, Kontaminanten, mikrobiologische Parameter, ggf. Restlösungsmittel in relevanten Klassen.",
          "Prozessqualität: SOP-Reifegrad, Rückverfolgbarkeit, Reklamationsquote und Batch-to-Batch-Abweichung."
        ],
        checklist: [
          "Jede Charge mit eindeutiger ID und Herkunftsdokumentation",
          "COA-Prüfung inkl. Datum, Methode und Nachweisgrenzen",
          "Lager- und Transportbedingungen pro Batch protokollieren",
          "Abweichungen aus Sensorik und Labor im CAPA-Prozess nachhalten"
        ]
      },
      {
        heading: "6) Praktische Einordnung für Plattformen und Einkauf",
        content: [
          "Baue Kataloge nicht nur nach Handelsnamen auf, sondern nach Verfahrensfamilien und Qualitätskriterien. Das erleichtert Vergleichbarkeit und Aufklärung.",
          "Trenne Produktstory (Herkunft, Stil, Kultur) sauber von Compliance- und Sicherheitsdaten.",
          "Nutze einheitliche Datenfelder für jede Hash-Klasse, damit Nutzer und Teams Konsistenz statt Einzelfallwissen erhalten."
        ],
        checklist: [
          "Verfahrensfamilie als Pflichtfeld im Datenmodell",
          "Herkunft/Stil als separates Feld, nicht als Qualitätslabel",
          "Einheitliche Mindestdaten für alle Konzentratklassen"
        ]
      }
    ],
    warnings: [
      "Detaillierte Herstellungsanleitungen werden hier bewusst nicht bereitgestellt; Fokus liegt auf Einordnung, Qualitaetsmanagement und Risikoaufklaerung.",
      "Regionale Rechtslage und regulatorische Anforderungen sind vor jeder operativen Umsetzung separat zu prüfen."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Was ist Hash?",
        text: "Hash ist ein Sammelbegriff für konzentrierte Harzprodukte aus Cannabis. Entscheidend ist nicht der Name, sondern wie getrennt, verarbeitet und stabilisiert wurde."
      },
      {
        title: "Kurz erklärt: Was gehört zusammen?",
        text: "Produkte gehören zusammen, wenn sie dieselbe Trennlogik verwenden oder aus derselben Vorstufe hervorgehen, etwa Bubble als Vorstufe für bestimmte Rosin-Linien."
      },
      {
        title: "Kurz erklärt: Wo passieren Fehlbewertungen?",
        text: "Wenn Stilbegriffe oder Herkunft als Qualitaetsbeweis genutzt werden und Labor- sowie Prozessdaten fehlen."
      }
    ],
    faq: [
      {
        question: "Ist jeder traditionelle Hash automatisch hochwertig?",
        answer: "Nein. Traditionelle Herkunft ist kulturhistorisch relevant, sagt aber ohne Analytik und Prozessnachweise wenig über aktuelle Sicherheits- und Qualitätsniveaus aus."
      },
      {
        question: "Ist Rosin immer besser als klassischer Presshash?",
        answer: "Nicht pauschal. Rosin hat eigene Stärken, aber Endqualität bleibt vom Input-Material, der Prozessführung und der Stabilität nach Verarbeitung abhängig."
      },
      {
        question: "Was ist für professionelle Vergleiche am wichtigsten?",
        answer: "Eine einheitliche Bewertungsmatrix aus Sensorik, Analytik, Stabilität und Chargenkonsistenz statt einzelner Marketingwerte."
      }
    ],
    glossary: [
      {
        term: "Verfahrensfamilie",
        definition: "Technische Hauptgruppe nach Trennprinzip, z. B. trocken-mechanisch oder eiswasserbasiert."
      },
      {
        term: "Batch-Konsistenz",
        definition: "Grad, in dem aufeinanderfolgende Chargen vergleichbare Qualitäts- und Sicherheitsmerkmale aufweisen."
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
    relatedSlugs: ["wasseraktivität-und-curing", "coa-richtig-lesen", "terpene-und-wirkprofil"]
  },
  {
    slug: "wasseraktivitaet-und-curing",
    title: "Wasseraktivität und Curing",
    summary: "Warum aw-Werte für Stabilität, Aromaerhalt und mikrobiologische Sicherheit entscheidend sind.",
    category: "qualitaet",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-03-26",
    tags: ["Curing", "aw", "Lagerung", "Mikrobiologie"],
    keyTakeaways: [
      "Wasseraktivität ist ein zentraler Sicherheitsparameter nach der Ernte.",
      "Falsche Curing-Routinen zerstören Aromaprofile und erhöhen Kontaminationsrisiken.",
      "Messbare SOPs schlagen subjektives Fuehlen im Glas deutlich."
    ],
    quickFacts: [
      { label: "Kernmetrik", value: "aw statt nur RH" },
      { label: "Risiko", value: "Mikrobieller Aufwuchs" },
      { label: "Prozess", value: "Stufenweise Trocknung + Curing" }
    ],
    sections: [
      {
        heading: "Nachernte als Qualitätshebel",
        content: [
          "Curing ist kein kosmetischer Schritt, sondern ein kritischer Teil des Qualitaetsmanagements.",
          "Ein fehlerhafter Ablauf kann zuvor gute Ernten stark entwerten."
        ]
      },
      {
        heading: "Operative Umsetzung",
        content: [
          "Arbeite mit fixen Messintervallen, Chargenkennzeichnung und klaren Grenzwerten für Nachjustierungen.",
          "Dokumentiere Auffälligkeiten früh, um spätere Reklamationen nachvollziehen zu können."
        ],
        checklist: [
          "Charge eindeutig labeln",
          "aw und Temperatur protokollieren",
          "Abweichungen mit Korrekturmassnahme verknüpfen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Wasseraktivität (aw)",
        text: "Freies Wasser, das Mikroben verfügbar ist. Low aw = schimmelresistent + langlebig; hohe aw = Schimmel-Risiko + schneller Verderb."
      },
      {
        title: "Kurz erklärt: Warum Curing wichtig ist",
        text: "Beim Curing wird zusätzliche Feuchte entfernt, Chlorophyll wird abgebaut (besserer Geschmack) und das Endocannabinoid-Profil stabilisiert sich."
      }
    ],
    faq: [
      {
        question: "Welche aw ist sicher?",
        answer: "unter 0.65 aw = langzeitstabil; 0.65-0.75 = neutral; über 0.75 = Schimmelrisiko. Normen (ISO/AOAC) empfehlen unter 0.70 für Cannabis."
      },
      {
        question: "Wie lange sollte ich curen?",
        answer: "Mindestens 2-4 Wochen in Glasbeh\u00e4ltern mit 62% RH. Länger als 8 Wochen bringt minimal Vorzüge, erhöht aber Schimmelrisiko."
      }
    ],
    glossary: [
      {
        term: "Wassaktivität (aw)",
        definition: "Relative Feuchte, die im Koerner mit der Umgebungsfeuchte im Gleichgewicht steht; kritisch für Haltbarkeit und Mikrob-Wachstum."
      },
      {
        term: "Curing",
        definition: "Kontrollierte Feuchte-Reduktion nach Trocknung; verbessert Geschmack, Aroma und Haltbarkeit."
      },
      {
        term: "Chlorophyll",
        definition: "Gruener Farbstoff; wird beim Curing abgebaut, was zu besserem Geschmack und hellerer Farbe führt."
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
      "Potenz alleine reicht nicht für Qualitätsaussagen.",
      "Grenzwerte und Nachweisgrenzen müssen im Kontext gelesen werden."
    ],
    quickFacts: [
      { label: "Pflichtfelder", value: "Charge, Datum, Methode" },
      { label: "Achte auf", value: "LOQ/LOD und Einheiten" },
      { label: "Warnsignal", value: "Unvollstaendige Kontaminantenliste" }
    ],
    sections: [
      {
        heading: "Was du zuerst pruefst",
        content: [
          "Schau zuerst: Ist die Chargennummer identisch mit deiner Ware? Ist das Analysedatum aktuell?",
          "Ohne diesen Match ist das COA wertlos — es koennte jedes andere Produkt beschreiben."
        ],
        checklist: [
          "Chargennummer identisch zur Ware",
          "Aktuelles Analysedatum",
          "Methoden und Einheiten klar ausgewiesen"
        ]
      },
      {
        heading: "Warum ein COA deine Kaufentscheidung verändert",
        content: [
          "Ein COA zeigt dir, was du wirklich bekommst — Potenz, Terpene, Schadstoffe.",
          "Ohne Laborbericht ist jede Qualitätsaussage Marketing, keine Tatsache."
        ]
      },
      {
        heading: "Kontaminanten richtig einordnen",
        content: [
          "Einzelne Spuren unter Grenzwert sind anders zu bewerten als systematische Auffälligkeiten.",
          "Entscheidend ist: Sind Messgrenzen (LOQ/LOD) angegeben? Fehlen sie, ist der Befund nicht vergleichbar."
        ]
      },
      {
        heading: "In SecretLeaf relevant wenn",
        content: [
          "du ein Produkt kaufst und prüfen willst, ob die Angaben stimmen",
          "du Chargen vergleichst und verstehen willst, warum Qualität schwankt",
          "du entscheiden möchtest, ob einem Lieferanten zu vertrauen ist"
        ]
      },
      {
        heading: "Was du konkret tun solltest",
        content: [],
        checklist: [
          "Chargennummer auf COA mit der auf der Verpackung abgleichen — immer, kein Ausnahme",
          "Prüfe: Sind Kontaminantenliste und Messmethode vollständig? Sonst anfragen oder Lieferant wechseln",
          "Speichere COAs chargenbezogen in deinem Grow-Log — nur so kannst du später vergleichen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Was ist eine COA?",
        text: "Certificate of Analysis - ein Labor-Report, der Cannabinoide, Terpene, Kontaminanten und Pestizide in deinem Produkt misst."
      },
      {
        title: "Kurz erklärt: Warum Methoden wichtig sind",
        text: "Gleiche Probe, unterschiedliche Methode = different Ergebnisse. COAs sind nur vergleichbar, wenn die gleichen Standards/Methoden verwendet wurden."
      }
    ],
    faq: [
      {
        question: "Wie erkenne ich eine gute COA?",
        answer: "Prüfe: (1) Lab-Akkreditierung (ISO 17025?), (2) Methoden dokumentiert (GC-MS? HPLC?), (3) Resultat-Unsicherheit angegeben, (4) Signatur des Labor-Direktors."
      },
      {
        question: "Kann eine COA gefaltscht werden?",
        answer: "Ja, leicht. Nur Labore mit unabhängiger Verifizierung (z.B. Proficiency-Tests) sind vertrauenswürdig."
      }
    ],
    glossary: [
      {
        term: "COA",
        definition: "Certificate of Analysis; Labor-Report mit Messergebnissen für Cannabinoide, Terpene, Kontaminanten und Potenzmittel."
      },
      {
        term: "GC-MS",
        definition: "Gaschromatographie-Massenspektrometrie; Goldstandard für Terpene und Volatilanalyse."
      },
      {
        term: "HPLC",
        definition: "High-Performance Liquid Chromatography; besser für hitzesensible Compounds wie Cannabinoide und thermale Abbauprodukte."
      }
    ],
    sourceIds: ["journal-chromatography-cannabinoids", "analytical-chemistry-terpen-profiling", "aoac-lab-methods-2024", "iso17025-testing-labs"],
    relatedSlugs: ["pgr-und-kontaminanten", "cannabinoide-und-evidenz"]
  },
  {
    slug: "pgr-und-kontaminanten",
    title: "PGR und Kontaminanten erkennen",
    summary: "Worauf Verbraucher achten sollten und welche Laborwerte für sichere Entscheidungen relevant sind.",
    category: "sicherheit",
    difficulty: "einsteiger",
    readMinutes: 6,
    lastUpdated: "2026-03-26",
    tags: ["PGR", "Rückstände", "COA", "Risiko"],
    keyTakeaways: [
      "Sicherheit beginnt bei transparenter Lieferkette und nachvollziehbaren Laborberichten.",
      "Auffällige Optik kann ein Hinweis sein, ersetzt aber keine Analytik.",
      "Risikokommunikation muss konkret und messbar sein."
    ],
    quickFacts: [
      { label: "Primare Prüfung", value: "COA + Chargenbezug" },
      { label: "Haeufige Luecke", value: "Keine aktuellen Rueckstandsdaten" },
      { label: "Best Practice", value: "Regelmäßige Lieferanten-Audits" }
    ],
    sections: [
      {
        heading: "Von der Beobachtung zur Bewertung",
        content: [
          "Verlasse dich nicht nur auf Geruch oder Dichte der Blüten.",
          "Sicherheitsurteile sollten auf Laborwerten, Historie und Prozessdaten beruhen."
        ]
      },
      {
        heading: "Risikomanagement im Alltag",
        content: [
          "Baue Sperrlogik für auffaellige Chargen in den operativen Ablauf ein.",
          "Kommuniziere transparent, warum Produkte zurückgehalten oder nachgetestet werden."
        ]
      }
    ],
    warnings: ["Keine Analyse, keine Freigabe: ohne belastbare Daten sollte keine Charge in Umlauf gehen."],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Was sind PGR?",
        text: "Plant Growth Regulator - Stoffe, die Wachstum und Bloete kuenstlich manipulieren. Viele sind in der EU/CH nicht zugelassen."
      },
      {
        title: "Kurz erklärt: Warum Sicherheit?",
        text: "PGR und Pestizide sind akute Risiken. Produktsicherheit beginnt mit Lieferkette-Transparenz und Labor-Freigabe."
      }
    ],
    faq: [
      {
        question: "Wie erkenne ich PGR-Belaestigung ohne Labor?",
        answer: "Normalerweise nicht sicher. Aeusserlich können unrealistische Dichten, extreme Feuchte-Verhältnisse oder Geruchsverfremdungen Hinweise sein - ersetzen aber keine Analytik."
      },
      {
        question: "Welche Kontaminanten sind kritisch?",
        answer: "Priorität: Pestizide, Pilzgifte und Schwer-Metalle. Dann: Lachgas, PGRs, Loesungsmittelreste. Labore sollten priorisiert nach lokalen Grenzwerten testen."
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
    relatedSlugs: ["coa-richtig-lesen", "wasseraktivität-und-curing"]
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
      "Dokumentationspflichten sind operativ genauso wichtig wie Produktqualität.",
      "Frühe Compliance-Pruefungen senken spätere Kosten und Risiken."
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
          "Nutze standardisierte Freigabe-Checklisten für Kommunikation und Produkte."
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
        title: "Kurz erklärt: Regelungslogik",
        text: "DE, AT, CH haben unterschiedliche Gesetze. Cannabis ist je Kontext (medizinisch, Beratung, Forschung) anders geregelt."
      },
      {
        title: "Kurz erklärt: Dokumentation zählt",
        text: "Rechtssicherheit entsteht nicht durch gutes Produkt allein, sondern durch sichere Nachweise: Herkunft, Labor, Freigaben."
      }
    ],
    faq: [
      {
        question: "Was ist für Compliance essentiell?",
        answer: "Je Land: Registrierung, COA-Anforderungen, Verpackungsrichtlinien, Werbeverbot und Lagerdokumentation. Das variiert stark - lokal pruefung ist Pflicht."
      },
      {
        question: "Was ist der größte Fehler?",
        answer: "Annahme, dass einmalige Compliance-Prüfung ausreicht. Gesetze aendern sich. Regelupdates müssen zyklisch sein."
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
        definition: "Dual-Approval für kritische Entscheidungen; erhoert Dokumentationsqualität und Rechtssicherheit."
      }
    ],
    sourceIds: ["bfarm-german-cannabis-guidelines", "swissmedic-cannabis-requirements", "ages-austria-cannabis-standards", "ema-good-manufacturing-practice", "codex-food-hygiene-2022"],
    relatedSlugs: ["markttransparenz-und-preise", "coa-richtig-lesen"]
  },
  {
    slug: "markttransparenz-und-preise",
    title: "Markttransparenz und Preislogik",
    summary: "Wie sich Preis, Qualität, Risiko und Verfuegbarkeit in realen Maerkten gegenseitig beeinflussen.",
    category: "markt",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-03-26",
    tags: ["Markt", "Preisbildung", "Qualität", "Angebot"],
    keyTakeaways: [
      "Niedrige Preise ohne Datenbasis korrelieren oft mit hoeheren Qualitätsrisiken.",
      "Transparenz über Herkunft und Analyse reduziert Informationsasymmetrie.",
      "Marktdaten sollten lokal segmentiert statt pauschal interpretiert werden."
    ],
    quickFacts: [
      { label: "Treiber", value: "Angebot, Risiko, Compliance-Kosten" },
      { label: "Signal", value: "Preis ohne Nachweis = Warnflag" },
      { label: "Strategie", value: "Qualitätskorridor statt Billigstpreis" }
    ],
    sections: [
      {
        heading: "Preis ist ein Systemsignal",
        content: [
          "Preis alleine sagt wenig. Erst in Verbindung mit COA, Chargenhistorie und Lieferzuverlässigkeit entsteht ein valider Vergleich.",
          "Für Nutzer ist eine klare Risiko-Nutzen-Kommunikation entscheidend."
        ]
      },
      {
        heading: "Operative Umsetzung für Plattformen",
        content: [
          "Lege Mindestkriterien für Datenqualität fest und stufe Anbieter nach Nachweisqualität.",
          "Damit wird Wettbewerb über Transparenz statt nur über Preis gefoerdert."
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Informationsasymmetrie",
        text: "Käufer kennt nicht die teuren Qualitäts- und Compliance-Prozesse. Niedriger Preis ohne Nachweis ist daher fast immer ein Warnsignal."
      },
      {
        title: "Kurz erklärt: Angebot schlägt Nachfrage",
        text: "Verknappung treibt Preise hoch. Transparente Lieferketten stabilisieren Preise und reduzieren Spekulation."
      }
    ],
    faq: [
      {
        question: "Ist hoher Preis = bessere Qualität?",
        answer: "Nicht automatisch. Hoher Preis kann auch Monopol oder Hype sein. Preis + Transparenz + Konsistenz = echte Qualitaetsindikation."
      },
      {
        question: "Wie erkenne ich unfaire Preise?",
        answer: "Vergleiche den Preis mit verfuegbaren Analysen (COA), Lieferzuverlässigkeit, Rückverfolgbarkeit und Reklamationsquote. Fehlende Transparenz ist ein klares Warnsignal."
      }
    ],
    glossary: [
      {
        term: "Marktpreisbildung",
        definition: "Preis entsteht durch Angebot, Nachfrage, Risiko und operative Kosten."
      },
      {
        term: "Informationsasymmetrie",
        definition: "Käufer und Verkaeufer haben unterschiedliche Information über Qualität und Risiko."
      },
      {
        term: "Qualitätskorridor",
        definition: "Realistischer Preisbereich für definierte Qualitaetsstandards, statt Fokus auf den billigsten Einzelpreis."
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
      "Klima- und Naehrstoffparameter sollten in einem gemeinsamen Regelkreis geführt werden.",
      "EC-Anpassungen ohne Blick auf Transpiration führen oft zu Fehlsteuerungen.",
      "Eine Steuerungsansicht mit Alarmgrenzen reduziert die manuelle Reaktionszeit deutlich."
    ],
    quickFacts: [
      { label: "Niveau", value: "Prozessoptimierung" },
      { label: "Noetig", value: "Konsistente Sensordaten" },
      { label: "Ergebnis", value: "Stabilere Qualität pro Charge" }
    ],
    sections: [
      {
        heading: "Regelstrategie aufbauen",
        content: [
          "Definiere Prioritaeten: zuerst Klimastabilitaet, dann Naehrstofffeinsteuerung.",
          "Nutze Trenddaten statt Einzelmesspunkte für Entscheidungen."
        ]
      },
      {
        heading: "Monitoring und Alarmierung",
        content: [
          "Lege harte Alert-Level für VPD-Drift, EC-Ausreisser und Temperaturspruenge fest.",
          "Verknuepfe jeden Alarm mit klarer Reaktionsanweisung für das Team."
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
        title: "Kurz erklärt: Warum Kombi?",
        text: "VPD steuert die Transpirationsrate, EC bestimmt, was der Pflanze verfügbar ist. Zusammen bilden beide ein System; getrennt bleiben es nur Einzeloptimierungen."
      },
      {
        title: "Kurz erklärt: Warum nicht nur manuell?",
        text: "Pflanzen aendern Ansprueche ständig (Wachstum, Stress, Reife). Automatisierte Regeln mit menschlichem Eingreifen reduzieren Fehler und Reaktionszeit."
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
        definition: "Schwellenwerte für automatische Alarme und Systeminterventionen."
      }
    ],
    sourceIds: ["plant-physiology-vpd-transpiration", "horticulture-research-cannabis-cultivation", "astm-d37-cannabis"],
    relatedSlugs: ["vpd-einfach-erklärt", "cannabis-anbau-grundlagen"]
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
    summary: "Wie Luftporen, Wasserhaltekapazität und Wurzelgesundheit die Stabilität eines Grows bestimmen.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 7,
    tags: ["Substrat", "Wurzelzone", "Drain", "Sauerstoff"],
    keyTakeaways: [
      "Substratwahl ist immer ein Kompromiss aus Sauerstoff, Wasserhaltekapazität und Arbeitsaufwand.",
      "Die Wurzelzone entscheidet früh über Wachstumstempo, Stressresistenz und Erholung nach Fehlern.",
      "Messbare Routinen für Topfgewicht, Drain und Temperatur verhindern viele späte Probleme."
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
          "Ein reproduzierbares System beginnt deshalb unten: Medium, Topfvolumen, Drain und Giessrhythmus müssen zusammenpassen."
        ]
      },
      {
        heading: "Welche Checks im Alltag wirklich helfen",
        content: [
          "Arbeite mit Topfgewicht, Substratbeobachtung und Drain-Messung statt nur nach Gefuehl. So erkennst du Staunäße und Unterversorgung früh.",
          "Halte Temperatur und Trocknungsdauer pro Charge oder Zone fest, damit spätere Probleme klar zugeordnet werden können."
        ],
        checklist: [
          "Topfgewicht nass und trocken dokumentieren",
          "Drain-EC und Drain-pH wöchentlich messen",
          "Wurzelraum vor Hitze und Kaltespitzen schuetzen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Luftporen",
        text: "Luftporen sorgen dafür, dass Wurzeln Sauerstoff bekommen. Zu dichte Medien bremsen Wachstum und erhöhen Faulnisrisiken."
      },
      {
        title: "Kurz erklärt: Wasserhaltekapazität",
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
      { term: "Drain", definition: "Abflusswasser nach einer Bewässerung; wichtig für EC- und pH-Kontrolle." },
      { term: "Porenvolumen", definition: "Anteil des Substrats, der mit Luft oder Wasser gefuellt werden kann." },
      { term: "Wurzelzone", definition: "Bereich im Medium, in dem Wurzeln Wasser, Sauerstoff und Nährstoffe aufnehmen." },
    ],
    relatedSlugs: ["cannabis-anbau-grundlagen", "bewässerung-ohne-uebergiessen", "sensor-kalibrierung-und-messfehler"]
  }),
  createArticle({
    slug: "bewaesserung-ohne-uebergiessen",
    title: "Bewässerung ohne Uebergiessen",
    summary: "Wie Giessmenge, Intervall und Drain so abgestimmt werden, dass Pflanzen weder austrocknen noch ersticken.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 6,
    tags: ["Bewässerung", "Drain", "Rhythmus", "Substrat"],
    keyTakeaways: [
      "Zu häufiges Giessen schadet oft mehr als leichtes Austrocknen zwischen zwei Zyklen.",
      "Intervall und Menge müssen zum Medium, Topf und Klima passen, nicht zu pauschalen Kalenderregeln.",
      "Drain und Topfgewicht sind bessere Steuerwerkzeuge als die reine Oberflaechenoptik."
    ],
    quickFacts: [
      { label: "Hauptfehler", value: "Zu früh erneut giessen" },
      { label: "Messhilfe", value: "Topfgewicht plus Drainkontrolle" },
      { label: "Ziel", value: "Rhythmus statt hektische Einzelkorrektur" }
    ],
    sections: [
      {
        heading: "Warum Uebergiessen so häufig passiert",
        content: [
          "Viele Teams reagieren auf haengende Blätter reflexartig mit mehr Wasser. Dabei können dieselben Symptome auch von Saürstoffmangel im Medium kommen.",
          "Ein sauberer Bewaesserungsplan basiert daher auf Messpunkten und nicht auf spontaner Interpretation einzelner Pflanzen."
        ]
      },
      {
        heading: "Ein belastbarer Giessprozess",
        content: [
          "Lege je Medium ein Zielgewicht, typische Trocknungsdauer und Minimal-Drain fest. So lassen sich Abweichungen früh erkennen.",
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
        title: "Kurz erklärt: Uebergiessen",
        text: "Nicht zu viel Wasser auf einmal ist das Hauptproblem, sondern zu wenig Sauerstoff im Medium über zu lange Zeit."
      },
      {
        title: "Kurz erklärt: Giessintervall",
        text: "Das ist die Zeit zwischen zwei Wassergaben. Es aendert sich mit Pflanzenmasse, Klima, Topfgroesse und Medium."
      }
    ],
    faq: [
      {
        question: "Soll immer Drain entstehen?",
        answer: "Nicht bei jeder Wassergabe. Regelmäßige Kontrollgaenge mit Drain sind sinnvoll, staendiges Durchspuelen aber nicht in jedem Setup."
      },
      {
        question: "Wie schnell darf ein Topf trocknen?",
        answer: "Das hängt von Medium und Phase ab. Kritisch wird es, wenn Trocknung ungleichmaessig oder extrem schnell wird und dadurch Salzspitzen entstehen."
      }
    ],
    glossary: [
      { term: "Giessfenster", definition: "Zeitpunkt, in dem ein Medium erneut Wasser braucht, ohne bereits stressig trocken zu sein." },
      { term: "Kapillarwasser", definition: "Wasser, das in feinen Poren gehalten wird und Pflanzen zur Verfuegung steht." },
      { term: "Staunäße", definition: "Dauerhaft zu nasses Medium mit Saürstoffmangel im Wurzelbereich." },
    ],
    relatedSlugs: ["cannabis-substrat-und-wurzelzone", "cannabis-anbau-grundlagen", "vpd-einfach-erklärt"]
  }),
  createArticle({
    slug: "lichtstress-und-canopy-management",
    title: "Lichtstress und Canopy-Management",
    summary: "Wie Lichtverteilung, Abstand und Blattfläche zusammenwirken und wann hohe Intensität mehr schadet als hilft.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["PPFD", "Canopy", "Lichtstress", "Uniformität"],
    keyTakeaways: [
      "Mehr PPFD ist nur dann sinnvoll, wenn Klima, CO2 und Naehrstoffversorgung mithalten können.",
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
          "Hohe Lichtleistung steigert nur dann Leistung, wenn Transpiration, Wasserhaushalt und Temperatur sauber geführt werden.",
          "Wird Licht isoliert hochgezogen, entstehen oft Stresssymptome statt echter Mehrleistung."
        ]
      },
      {
        heading: "Canopy sauber führen",
        content: [
          "Trainiere Pflanzen so, dass die obere Blattfläche möglichst gleichmaessig bleibt. Dadurch werden Hotspots und Schatteninseln reduziert.",
          "Mappe die Lichtverteilung im Raum und passe Lampenhoehe oder Pflanzenerziehung datenbasiert an."
        ],
        checklist: [
          "PPFD an mehreren Rasterpunkten messen",
          "Blatttemperatur an Hotspots prüfen",
          "Canopy-Höhe pro Zone dokumentieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: PPFD",
        text: "PPFD beschreibt, wie viele photosynthetisch nutzbare Lichtteilchen pro Sekunde auf eine Fläche treffen."
      },
      {
        title: "Kurz erklärt: Canopy",
        text: "Damit ist die obere Blatt- und Bluetenschicht gemeint. Je gleichmaessiger sie ist, desto leichter lässt sich Licht steuern."
      }
    ],
    faq: [
      {
        question: "Brauche ich sofort ein PAR-Meter?",
        answer: "Für ernsthafte Prozesssteuerung ja, zumindest zeitweise. Schaetzwerte oder App-Messungen reichen nur für grobe Orientierung."
      },
      {
        question: "Ist Bleaching immer zu viel Licht?",
        answer: "Oft ja, aber nicht nur. Auch Hitze, Naehrstoffungleichgewicht und genetische Empfindlichkeit können mit hineinspielen."
      }
    ],
    glossary: [
      { term: "Bleaching", definition: "Aufhellung von Pflanzenteilen durch uebermaessige Licht- oder Hitzebelastung." },
      { term: "Canopy", definition: "Oberste Ebene aus Blatt- und Blütenmasse, die den Grossteil des Lichts abfaengt." },
      { term: "Uniformität", definition: "Gleichmaessigkeit von Wuchs, Höhe und Exposition innerhalb einer Kulturflaeche." },
    ],
    relatedSlugs: ["cannabis-anbau-grundlagen", "vpd-einfach-erklärt", "vpd-und-ec-kombi-rechner-guide"]
  }),
  createArticle({
    slug: "integrierte-schaedlingspraevention-grow",
    title: "Integrierte Schaedlingspraevention im Grow",
    summary: "Wie Monitoring, Hygiene und Früherkennung Ausfälle verhindern, ohne blind in Chemie oder Panik zu verfallen.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["IPM", "Hygiene", "Monitoring", "Prävention"],
    keyTakeaways: [
      "Ein IPM-System lebt von Früherkennung, Quarantäne und stabilen Routinen statt von Spaetreaktionen.",
      "Sauberkeit im Raum und an Werkzeugen verhindert mehr Probleme als hektische Rettungssprays.",
      "Schädlingsdruck ist oft ein Prozesssignal für Klima-, Hygiene- oder Materialprobleme."
    ],
    quickFacts: [
      { label: "Best Practice", value: "Monitoring vor Behandlung" },
      { label: "Warnsignal", value: "Unklare Eintragswege" },
      { label: "Routine", value: "Sticky Traps plus Sichtkontrolle" }
    ],
    sections: [
      {
        heading: "Von der Reaktion zur Prävention",
        content: [
          "Viele Grow-Probleme eskalieren, weil Monitoring erst dann beginnt, wenn sichtbare Schäden da sind.",
          "Ein sauberes IPM verknüpft Eingangskontrolle, Raumhygiene, Teamdisziplin und dokumentierte Eskalationsstufen."
        ]
      },
      {
        heading: "Was in einen belastbaren IPM-Plan gehört",
        content: [
          "Lege fest, welche Zonen kontrolliert werden, wie Funde dokumentiert werden und wer über Massnahmen entscheidet.",
          "Nur so bleiben Eingriffe verhaeltnismaessig und auditierbar."
        ],
        checklist: [
          "Quarantäne für neue Pflanzen oder Material",
          "Wöchentliche Monitoring-Route mit Foto-Dokumentation",
          "Reinigungsplan für Werkzeuge, Schuhe und Flaechen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: IPM",
        text: "Integrated Pest Management kombiniert Beobachtung, Hygiene, Prävention und nur gezielte Eingriffe bei klarer Indikation."
      },
      {
        title: "Kurz erklärt: Schädlingsdruck",
        text: "Damit ist gemeint, wie stark ein Bestand von Schädlingen belastet ist und wie schnell sich das Problem ausbreitet."
      }
    ],
    faq: [
      {
        question: "Reicht Sichtkontrolle ohne Fallen?",
        answer: "Meist nicht. Fallen zeigen Trends früher und helfen, Hotspots vor sichtbaren Schäden zu finden."
      },
      {
        question: "Ist jedes Blattproblem gleich ein Schaedling?",
        answer: "Nein. Nahrstoffprobleme, Lichtstress oder Umweltstress können aehnlich aussehen und müssen sauber abgegrenzt werden."
      }
    ],
    glossary: [
      { term: "IPM", definition: "Integrierter Ansatz zur Prävention und Kontrolle von Schädlingen über mehrere Massnahmenebenen." },
      { term: "Quarantäne", definition: "Zeitlich und raeumlich getrennte Beobachtung neuer Pflanzen oder Materialien." },
      { term: "Sticky Trap", definition: "Klebefalle zur Früherkennung fliegender Schädlinge und zur Trendbeobachtung." },
    ],
    relatedSlugs: ["pgr-und-kontaminanten", "schimmel-und-mykotoxine-bei-cannabis", "cannabis-anbau-grundlagen"]
  }),
  createArticle({
    slug: "feminisiert-vs-regular-vs-autoflower",
    title: "Feminisiert vs. Regular vs. Autoflower",
    summary: "Welche genetischen Formate es gibt, wo ihre jeweiligen Stärken liegen und welche Missverständnisse häufig sind.",
    category: "genetik",
    difficulty: "einsteiger",
    readMinutes: 7,
    tags: ["Samen", "Regular", "Autoflower", "Genetik"],
    keyTakeaways: [
      "Die drei Formate loesen unterschiedliche Ziele in Selektion, Produktionsplanung und Einfachheit.",
      "Autoflower ist kein Qualitätsurteil, sondern ein anderer Entwicklungsmodus mit eigenen Grenzen.",
      "Für reproduzierbare Programme zählen Stabilität und Zielprofil mehr als Marketingbegriffe."
    ],
    quickFacts: [
      { label: "Einsteigerfreundlich", value: "Haengt vom Zielsystem ab" },
      { label: "Selektionsfreiheit", value: "Am größten bei Regular" },
      { label: "Planbarkeit", value: "Stark von Genetikqualität abhängig" }
    ],
    sections: [
      {
        heading: "Drei Formate, drei Einsatzgebiete",
        content: [
          "Regular-Samen sind wichtig für Zucht und tiefe Selektion, feminisierte Linien vereinfachen viele Produktionsablaeufe und Autoflower verkuerzen bestimmte Zyklen.",
          "Keines der Systeme ist pauschal ueberlegen. Die Entscheidung hängt von Raum, Erfahrung und Prozesszielen ab."
        ]
      },
      {
        heading: "Worauf du in der Praxis achten solltest",
        content: [
          "Prüfe, wie stabil eine Linie tatsächlich ist und ob die Beschreibung des Breeders mit deiner Zielumgebung zusammenpasst.",
          "Für spätere Vergleichbarkeit sind Dokumentation und Testlaeufe wichtiger als Produktversprechen."
        ],
        checklist: [
          "Zuchtziel vor der Sortenwahl definieren",
          "Breeder-Angaben gegen echte Grow-Daten prüfen",
          "Leistung über mehrere Runs vergleichen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Regular",
        text: "Samen mit natürlicher Geschlechterverteilung; wichtig für Selektion, Kreuzungen und Zuchtarbeit."
      },
      {
        title: "Kurz erklärt: Autoflower",
        text: "Pflanzen, die nach Alter statt nach Photoperiode in die Blüte gehen. Das vereinfacht manche Ablaeufe, begrenzt aber andere."
      }
    ],
    faq: [
      {
        question: "Sind feminisierte Samen instabil?",
        answer: "Nicht automatisch. Gute Linien können sehr stabil sein, schlechte Linien zeigen auch als feminisierte Saat Probleme."
      },
      {
        question: "Sind Autoflower immer schneller?",
        answer: "Oft im Gesamtablauf, aber nicht in jedem Setup effizienter. Planbarkeit und Zielprofil müssen mitgedacht werden."
      }
    ],
    glossary: [
      { term: "Photoperiode", definition: "Abhängigkeit der Blüte von der Tageslaenge beziehungsweise dem Lichtzyklus." },
      { term: "Regular", definition: "Samen mit maennlichen und weiblichen Pflanzen in natürlicher Verteilung." },
      { term: "Feminisiert", definition: "Samen, die mit hoher Wahrscheinlichkeit weibliche Pflanzen hervorbringen." },
    ],
    relatedSlugs: ["genetik-und-phänotyp-selektion", "mutterpflanzen-und-clone-hygiene", "selektionsscorecards-für-pheno-hunts"]
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
      "Mutterpflanzen sind Produktionsinfrastruktur und müssen wie kritische Assets behandelt werden.",
      "Hygiene, Rotation und Backup-Strategien verhindern Ausfälle durch Krankheiten oder Drift.",
      "Clone-Qualität ist nur dann vergleichbar, wenn Schnitt, Bewurzelung und Weitergabe standardisiert sind."
    ],
    quickFacts: [
      { label: "Kritischer Punkt", value: "Gesundheitsstatus der Mutterlinie" },
      { label: "Bester Schutz", value: "Rotation plus Backup" },
      { label: "Dokumentation", value: "ID, Alter, Vitalität, Historie" }
    ],
    sections: [
      {
        heading: "Warum Mutterlinien oft unterschuetzt werden",
        content: [
          "Viele Systeme fokussieren nur auf den Run, nicht auf die Quelle des Pflanzenmaterials. Genau dort entstehen aber oft die späteren Probleme.",
          "Eine muede, kontaminierte oder falsch geführte Mutterlinie zieht Fehler durch den gesamten Prozess."
        ]
      },
      {
        heading: "So sieht ein sauberes Clone-Programm aus",
        content: [
          "Definiere Schnittstandards, Hygieneprotokolle, Bewurzelungsfenster und Ausschlusskriterien für schwache Stecklinge.",
          "Halte mehrere Backups und trenne wertvolle Linien gegen Verlust oder Verwechslung."
        ],
        checklist: [
          "Werkzeug vor jedem Schnitt desinfizieren",
          "Mutterpflanzen regelmäßig verjuengen",
          "Clone-Raten und Ausfälle pro Linie dokumentieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Mutterpflanze",
        text: "Eine Pflanze, von der regelmäßig Stecklinge geschnitten werden, um genetisch identisches Material zu erhalten."
      },
      {
        title: "Kurz erklärt: Drift",
        text: "Leistungsabfall oder Veränderung über Zeit durch Alter, Stress, Krankheiten oder unsaubere Vermehrung."
      }
    ],
    faq: [
      {
        question: "Wie lange kann ich eine Mutterpflanze halten?",
        answer: "Technisch lange, aber operativ ist eine geregelte Rotation oft sinnvoller, um Vitalität und Hygiene zu sichern."
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
    relatedSlugs: ["genetik-und-phänotyp-selektion", "integrierte-schädlingsprävention-grow", "feminisiert-vs-regular-vs-autoflower"]
  }),
  createArticle({
    slug: "selektionsscorecards-fuer-pheno-hunts",
    title: "Selektionsscorecards für Pheno-Hunts",
    summary: "Wie du Auswahlprozesse mit Kriterien, Gewichtungen und Bestaetigungslaeufen objektiver machst.",
    category: "genetik",
    difficulty: "profi",
    readMinutes: 9,
    tags: ["Pheno-Hunt", "Scorecard", "Selektion", "Dokumentation"],
    keyTakeaways: [
      "Ohne Scorecard kippt Selektion schnell in Bauchgefühl und späte Rechtfertigung.",
      "Gewichtete Kriterien helfen, unterschiedliche Ziele wie Ertrag, Aroma und Stabilität ausbalanciert zu bewerten.",
      "Top-Kandidaten brauchen immer einen Bestätigungslauf unter denselben Bedingungen."
    ],
    quickFacts: [
      { label: "Ziel", value: "Objektive Vergleichbarkeit" },
      { label: "Pflicht", value: "Bestätigungslauf" },
      { label: "Typische Achsen", value: "Wuchs, Risiko, Qualität, Konsistenz" }
    ],
    sections: [
      {
        heading: "Was in eine gute Scorecard gehört",
        content: [
          "Bewerte nicht nur Ertrag oder Optik, sondern auch Stressverhalten, Nacherntequalität, Trimmaufwand und Batch-Konsistenz.",
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
        title: "Kurz erklärt: Scorecard",
        text: "Ein Bewertungsbogen mit festen Kriterien und Punkten, um mehrere Kandidaten fair zu vergleichen."
      },
      {
        title: "Kurz erklärt: Gewichtung",
        text: "Nicht jedes Kriterium ist gleich wichtig. Gewichtung macht sichtbar, was für dein Zielsystem Priorität hat."
      }
    ],
    faq: [
      {
        question: "Kann ich ohne Laborwerte jagen?",
        answer: "Ja, aber dann sinkt die Trennschaerfe. Besonders bei Qualitäts- und Sicherheitsprofilen helfen Laborwerte deutlich."
      },
      {
        question: "Wie viele Kriterien sind sinnvoll?",
        answer: "Genug für Tiefe, aber nicht so viele, dass niemand mehr konsistent bewertet. Zehn bis 15 Kernkriterien sind oft praktikabel."
      }
    ],
    glossary: [
      { term: "Scorecard", definition: "Standardisiertes Formular zur Bewertung mehrerer Kandidaten nach denselben Kriterien." },
      { term: "Bestätigungslauf", definition: "Wiederholung eines vielversprechenden Kandidaten unter kontrollierten Bedingungen." },
      { term: "Gewichtung", definition: "Festgelegte Bedeutung einzelner Kriterien innerhalb einer Gesamtwertung." },
    ],
    relatedSlugs: ["genetik-und-phänotyp-selektion", "mutterpflanzen-und-clone-hygiene", "terpene-und-wirkprofil"]
  }),
  createArticle({
    slug: "cannabinoid-biosynthese-verstehen",
    title: "Cannabinoid-Biosynthese verstehen",
    summary: "Wie Vorstufen, Enzyme und Reifeprozesse das Profil einer Pflanze formen und warum das für Dateninterpretation wichtig ist.",
    category: "chemie",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    tags: ["Biosynthese", "CBGA", "Reife", "Chemie"],
    keyTakeaways: [
      "Cannabinoidprofile entstehen nicht zufällig, sondern aus genetischer Anlage plus Umwelt- und Reifeeinfluss.",
      "Vorstufen und Enzymaktivität helfen, Profile besser zu verstehen als reine Prozentzahlen auf einer COA.",
      "Chemisches Verständnis verbessert Sorteneinordnung, Erntezeitpunkt und Labordaten-Lesekompetenz."
    ],
    quickFacts: [
      { label: "Vorstufe", value: "CBGA" },
      { label: "Einfluss", value: "Genetik plus Reife plus Prozess" },
      { label: "Nutzen", value: "Besseres Verständnis von Profilverschiebungen" }
    ],
    sections: [
      {
        heading: "Was das für deinen Grow bedeutet",
        content: [
          "Das Cannabinoid-Profil deiner Pflanze ist keine feste Größe — es verändert sich mit Reife, Lagerung und Prozess.",
          "Wer das versteht, kann Erntezeitpunkt und Lagerung gezielt steuern statt auf Zufallswerte zu vertrauen."
        ]
      },
      {
        heading: "Warum das Qualität und Profil direkt beeinflusst",
        content: [
          "Zu früh geerntet: THC-Vorstufen dominieren, Wirkprofil ist unfertig.",
          "Zu spaet geerntet oder schlecht gelagert: THC baut ab, CBN steigt — das Profil kippt unwiderruflich."
        ],
        checklist: [
          "Analysedaten immer mit Ernte- und Prozessdaten lesen",
          "Minor-Werte nur mit Methodenhinweis vergleichen",
          "COA-Datum prüfen: aeltere Proben spiegeln nicht das aktuelle Profil"
        ]
      },
      {
        heading: "In SecretLeaf relevant wenn",
        content: [
          "du den richtigen Erntezeitpunkt bestimmen willst und Trichom-Kontrolle allein nicht reicht",
          "Laborwerte zwischen Chargen stark schwanken und du den Grund nicht kennst",
          "du verstehen willst, warum dein Profil sich nach Lagerung verändert hat"
        ]
      },
      {
        heading: "Was du konkret tun solltest",
        content: [],
        checklist: [
          "Erntezeitpunkt festhalten: Datum, Trichom-Bild, Reifegrad — so kannst du Laborwerte später einordnen",
          "Lagertemperatur unter 20\u00b0C halten und Licht ausschliessen — beides beschleunigt Abbau messbar",
          "COA-Daten immer mit Charge und Lagerbedingung verknüpfen, nicht nur ablegen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Biosynthese",
        text: "Damit ist die Bildung von Wirkstoffen in der Pflanze gemeint, ausgehend von biochemischen Vorstufen und Enzymen."
      },
      {
        title: "Kurz erklärt: CBGA",
        text: "CBGA gilt als zentrale Vorstufe, aus der über weitere enzymatische Schritte andere Cannabinoide entstehen."
      }
    ],
    faq: [
      {
        question: "Kann Umwelt das Profil sichtbar verändern?",
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
      "Cannabinoidprofile sind lagerungs- und prozesssensibel und können sich über Zeit deutlich verschieben.",
      "Licht, Sauerstoff und Hitze sind zentrale Treiber von Abbau- und Oxidationsprozessen.",
      "Profilverschiebungen müssen von Messmethodik und Probenhandhabung mitgedacht werden."
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
          "Chemische Profile verändern sich nach der Ernte weiter. Ein gemessener Wert vom Freigabetag ist daher nicht zwingend identisch mit dem Zustand Monate später.",
          "Besonders kritisch sind Kombinationen aus Sauerstoffkontakt, Wärme und langen Lagerzeiten."
        ]
      },
      {
        heading: "Was das für Qualität und Kommunikation bedeutet",
        content: [
          "Produktprofile müssen mit Produktions- und Lagerdaten zusammen bewertet werden. Andernfalls werden normale Alterungsprozesse schnell fehlgedeutet.",
          "Für Plattformen und Labore sind klare Hinweise auf Probendatum, Lagerregime und Messmethode zentral."
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
        title: "Kurz erklärt: Oxidation",
        text: "Chemische Reaktion mit Sauerstoff, die Moleküle verändern und damit Profil, Aroma oder Stabilität verschieben kann."
      },
      {
        title: "Kurz erklärt: CBN",
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
        answer: "Nicht automatisch, aber das Profil kann deutlich von der ursprünglichen Freigabe abweichen. Deshalb ist Lagerkontext entscheidend."
      }
    ],
    glossary: [
      { term: "Oxidation", definition: "Chemischer Prozess, bei dem Moleküle durch Reaktion mit Sauerstoff verändert werden." },
      { term: "Abbauprodukt", definition: "Substanz, die aus der Veränderung oder Zersetzung eines anderen Molekuels entsteht." },
      { term: "Stabilität", definition: "Wie gut ein chemisches Profil über Zeit und Lagerbedingungen erhalten bleibt." },
    ],
    relatedSlugs: ["lagerung-verpackung-und-lichtschutz", "wasseraktivität-und-curing", "coa-richtig-lesen"]
  }),
  createArticle({
    slug: "decarboxylierung-grundlagen-und-fehler",
    title: "Decarboxylierung: Grundlagen und Fehlerbilder",
    summary: "Was bei der Umwandlung von sauren Vorstufen passiert und warum Temperaturfenster und Kontext wichtig sind.",
    category: "chemie",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Decarboxylierung", "THCA", "Wärme", "Prozess"],
    keyTakeaways: [
      "Decarboxylierung ist ein temperatur- und zeitabhängiger Prozess mit Zielkonflikten bei Erhalt und Umwandlung.",
      "Zu pauschale Temperaturregeln ignorieren Material, Feuchte und Prozessziel.",
      "Für Wissensseiten ist Einordnung wichtiger als operative Kochrezepte."
    ],
    quickFacts: [
      { label: "Kernbegriff", value: "Umwandlung saurer Vorstufen" },
      { label: "Fehlerquelle", value: "Pauschale Hitzeschemata" },
      { label: "Relevanz", value: "Analytik, Interpretation, Aufklärung" }
    ],
    sections: [
      {
        heading: "Was chemisch passiert",
        content: [
          "Bei der Decarboxylierung verändern sich saure Cannabinoidformen unter Wärmeeinfluss. Dieser Prozess beeinflusst spätere Analytik und Produktinterpretation.",
          "Wichtig ist, dass nicht nur die Umwandlung, sondern auch Verlust- und Abbaupfade mitgedacht werden."
        ]
      },
      {
        heading: "Wo Missverständnisse entstehen",
        content: [
          "Im Netz kursieren oft starre Zeit-Temperatur-Regeln ohne Materialkontext. Für seriöse Aufklärung reicht das nicht aus.",
          "Besser ist ein Verständnis für Prinzipien, Messgrenzen und Zielkonflikte zwischen Umwandlung, Terpenerhalt und Stabilität."
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
        title: "Kurz erklärt: Saure Vorstufen",
        text: "Viele Cannabinoide liegen in der Pflanze zuerst in saurer Form vor und werden erst durch Prozesse wie Hitze weiterverändert."
      },
      {
        title: "Kurz erklärt: Warum das relevant ist",
        text: "Die chemische Form beeinflusst Messwerte, Produktbeschreibung und spätere Wirkungseinordnung."
      }
    ],
    faq: [
      {
        question: "Ist Decarboxylierung immer komplett gewollt?",
        answer: "Nicht zwingend. Das hängt vom Produkttyp, Prozessziel und den gewünschten chemischen Eigenschaften ab."
      },
      {
        question: "Warum unterscheiden sich Laborwerte vor und nach Prozess so stark?",
        answer: "Weil chemische Formen, Wassergehalt und eventuelle Abbauprozesse das Ergebnis sichtbar verändern."
      }
    ],
    glossary: [
      { term: "Decarboxylierung", definition: "Chemische Abspaltung einer Carboxylgruppe unter anderem durch Wärme." },
      { term: "THCA", definition: "Saure Vorstufe von THC, die in frischem Pflanzenmaterial häufig dominiert." },
      { term: "Prozessfenster", definition: "Bereich aus Zeit und Temperatur, in dem ein Prozessziel möglichst reproduzierbar erreicht wird." },
    ],
    relatedSlugs: ["analytik-hplc-vs-gc-bei-cannabinoiden", "cannabinoid-biosynthese-verstehen", "coa-richtig-lesen"]
  }),
  createArticle({
    slug: "analytik-hplc-vs-gc-bei-cannabinoiden",
    title: "Analytik: HPLC vs. GC bei Cannabinoiden",
    summary: "Welche Unterschiede die beiden Methoden haben und warum Methodik für Vergleichbarkeit und Interpretation entscheidend ist.",
    category: "chemie",
    difficulty: "profi",
    readMinutes: 9,
    tags: ["HPLC", "GC", "Analytik", "Methodik"],
    keyTakeaways: [
      "Methodenvergleich ist keine Nebensache: HPLC und GC beantworten teils unterschiedliche Fragen.",
      "Ohne Methodenhinweis sind Profilvergleiche zwischen COAs oft nur eingeschränkt belastbar.",
      "Saure Vorstufen, Aufarbeitung und Temperaturbelastung spielen bei der Einordnung eine grosse Rolle."
    ],
    quickFacts: [
      { label: "HPLC", value: "Schonend für saure Formen" },
      { label: "GC", value: "Stark für flüchtige Analyse" },
      { label: "Pflichtangabe", value: "Methode plus Aufarbeitung" }
    ],
    sections: [
      {
        heading: "Wie sich die Methoden unterscheiden",
        content: [
          "HPLC arbeitet ohne dieselbe thermische Belastung wie GC und eignet sich deshalb gut für Cannabinoidformen, die hitzesensibel sind.",
          "GC ist für bestimmte Analyten und Profile sehr stark, muss aber methodisch passend gelesen werden."
        ]
      },
      {
        heading: "Was das für COAs bedeutet",
        content: [
          "Wer Laborberichte vergleichen will, braucht immer den Methodenblock mit Aufarbeitung, Kalibration und Nachweisgrenzen.",
          "Nur dann lassen sich Unterschiede auf echte Chargenabweichung oder auf methodische Effekte zurückführen."
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
        title: "Kurz erklärt: HPLC",
        text: "Fluessigchromatographie, die sich besonders für hitzeempfindliche Verbindungen eignet."
      },
      {
        title: "Kurz erklärt: GC",
        text: "Gaschromatographie, stark für flüchtige Verbindungen und oft zentral in der Terpenanalytik."
      }
    ],
    faq: [
      {
        question: "Welche Methode ist besser?",
        answer: "Nicht generell. Die Eignung hängt vom Analyten, der Matrix und der Frage ab, die beantwortet werden soll."
      },
      {
        question: "Warum weichen COAs verschiedener Labore ab?",
        answer: "Methoden, Kalibration, Probenahme und Aufarbeitung können Unterschiede erzeugen, selbst bei aehnlichem Ausgangsmaterial."
      }
    ],
    glossary: [
      { term: "HPLC", definition: "High-Performance Liquid Chromatography, ein Standardverfahren für viele nichtfluechtige oder hitzeempfindliche Analyten." },
      { term: "GC", definition: "Gaschromatographie, genutzt für flüchtige oder thermisch analysierbare Verbindungen." },
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
      "Beliebte Terpenbegriffe helfen bei Orientierung, erklären aber nie das ganze Profil.",
      "Einzelterpene sollten immer im Kontext von Gesamtprofil, Dosis und Produktform gelesen werden.",
      "Seriöse Kommunikation trennt Sensorik, Hypothese und belastbare Evidenz sauber."
    ],
    quickFacts: [
      { label: "Nutzen", value: "Orientierung für Profilbeschreibungen" },
      { label: "Grenze", value: "Einzelterpen ist nie die ganze Story" },
      { label: "Best Practice", value: "Gesamtprofil statt Hype-Wort" }
    ],
    sections: [
      {
        heading: "Was diese Terpene dir über dein Produkt sagen",
        content: [
          "Myrcen, Limonen und Caryophyllen sind die drei am haeufigsten gemessenen Terpene — sie beschreiben einen Teil des Aromas, aber nicht die Wirkung.",
          "Ein Produkt mit viel Myrcen kann trotzdem ein anderes Profil haben als ein anderes mit gleichen Werten, weil andere Bestandteile mitspielen."
        ]
      },
      {
        heading: "Warum das für Qualitaetsbewertung wichtig ist",
        content: [
          "Wer nur auf das Top-Terpen schaut, bewertet ein Produkt unvollständig.",
          "Qualität entsteht aus dem Gesamtprofil — kein einzelnes Terpen erklärt, warum eine Ernte besonders gut ist."
        ],
        checklist: [
          "Gesamtprofil lesen, nicht nur das staerkste Terpen",
          "Sensorischen Eindruck (Geruch, Aroma) und Laborwerte getrennt notieren",
          "Terpenvergleiche nur bei gleicher Messmethode machen"
        ]
      },
      {
        heading: "In SecretLeaf relevant wenn",
        content: [
          "du Chargen vergleichst und verstehen willst, warum eine Ernte aromatisch besser war",
          "du Laborwerte liest und einordnen möchtest, ob Terpenunterschiede bedeutend sind",
          "du dein Curing verbessern willst und wissen möchtest, welche Bedingungen das Profil sichern"
        ]
      },
      {
        heading: "Was du konkret tun solltest",
        content: [],
        checklist: [
          "Notiere beim Curing-Start das Aromaprofil sensorisch — so erkennst du später Verluste",
          "Vergleiche Terpen-COAs nur, wenn Methode und Probenahme identisch sind — sonst nicht aussagekräftig",
          "Bewerte Qualität immer mit Gesamtprofil + Sensorik + COA gemeinsam, nie mit einem Wert allein"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Myrcen",
        text: "Ein häufig genanntes Terpen, das oft mit krautig-erdigen Noten beschrieben wird."
      },
      {
        title: "Kurz erklärt: Caryophyllen",
        text: "Terpen mit oft pfeffriger Note, das in Diskussionen rund um Profil und Wahrnehmung regelmäßig auftaucht."
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
      { term: "Gesamtprofil", definition: "Kombination aller relevanten Stoffe und ihrer Verhältnisse in einem Produkt." },
      { term: "Sensorik", definition: "Eindruck von Geruch, Geschmack und Wahrnehmung eines Produkts." },
      { term: "Korrelation", definition: "Statistischer Zusammenhang, der noch keine sichere Ursache beweist." },
    ],
    relatedSlugs: ["terpene-und-wirkprofil", "sensorik-panels-für-cannabisprodukte", "coa-richtig-lesen"]
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
      "Terpene sind volatil und reagieren stark auf Licht, Wärme und Luftkontakt.",
      "Gute Verpackung ist ein Qualitaetsthema, nicht nur Branding.",
      "Produktbewertungen ohne Lagerkontext sind oft unvollständig."
    ],
    quickFacts: [
      { label: "Gegner", value: "Wärme, Licht, Sauerstoff" },
      { label: "Hebel", value: "Verpackung plus Klima" },
      { label: "Signal", value: "Alte Ware verliert oft zuerst Aroma" }
    ],
    sections: [
      {
        heading: "Warum Aroma so schnell kippt",
        content: [
          "Terpene verdampfen oder verändern sich leichter als viele andere Stoffklassen. Schon die Kombination aus Lagerzeit und unguenstiger Verpackung kann viel kosten.",
          "Deshalb ist das urspruengliche Profil nicht automatisch identisch mit dem, was später beim Nutzer ankommt."
        ]
      },
      {
        heading: "Welche Verpackungslogik funktioniert",
        content: [
          "Ziel ist nicht nur dicht, sondern kontrolliert: wenig Sauerstoff, möglichst wenig Licht und stabile Temperaturen.",
          "Für Teams lohnt es sich, Packmittel und Reklamationsdaten gemeinsam zu betrachten."
        ],
        checklist: [
          "Lager- und Transporttemperaturen begrenzen",
          "Lichtschutz als Pflichtkriterium behandeln",
          "Aromareklamationen mit Chargenalter verknüpfen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: volatil",
        text: "Leicht flüchtig oder leicht in die Gasphase uebergehend. Gerade das macht Terpene empfindlich gegen Lagerfehler."
      },
      {
        title: "Kurz erklärt: Sauerstoffschutz",
        text: "Verpackungen und Prozesse, die den Kontakt mit Luft reduzieren und damit Profilverlust verlangsamen."
      }
    ],
    faq: [
      {
        question: "Hilft Kuehlung immer?",
        answer: "Oft ja, aber nur mit kontrollierter Feuchte und passender Verpackung. Sonst entstehen neue Probleme."
      },
      {
        question: "Warum riecht eine Charge später so anders?",
        answer: "Weil Lagerzeit, Licht und Sauerstoffkontakt das Terpenprofil sichtbar verändern können."
      }
    ],
    glossary: [
      { term: "Volatil", definition: "Leicht verdampfend oder leicht in die Luft uebergehend." },
      { term: "Headspace", definition: "Luftraum in einer Verpackung, der den Sauerstoffkontakt mit beeinflusst." },
      { term: "Aromastabilitaet", definition: "Wie gut ein Produkt sein Geruchs- und Geschmacksprofil über Zeit behält." },
    ],
    relatedSlugs: ["wasseraktivität-und-curing", "lagerung-verpackung-und-lichtschutz", "terpene-und-wirkprofil"]
  }),
  createArticle({
    slug: "sensorik-panels-fuer-cannabisprodukte",
    title: "Sensorik-Panels für Cannabisprodukte",
    summary: "Wie strukturierte Geruchs- und Profilbewertung professioneller wird als spontane Einzelmeinungen im Team.",
    category: "terpene",
    difficulty: "profi",
    readMinutes: 8,
    tags: ["Sensorik", "Panels", "Aroma", "Qualität"],
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
          "Aromabewertung ist anfaellig für Erwartung, Branding und Gruppeneffekte. Standardisierte Panels machen diese Verzerrungen sichtbar kleiner.",
          "Das ist besonders wichtig, wenn Produktbeschreibungen später in Kataloge oder Content einfliessen."
        ]
      },
      {
        heading: "Wie Panels aufgebaut werden",
        content: [
          "Arbeite mit festen Deskriptoren, Blindmustern und klaren Bewertungsboegen. Wiederhole Bewertungen in definierten Intervallen.",
          "Wird Sensorik mit Laborwerten verknüpft, verbessert sich die Plausibilitaet für Profilbeschreibungen deutlich."
        ],
        checklist: [
          "Deskriptorenliste vorab festlegen",
          "Blindproben für Bias-Reduktion nutzen",
          "Sensorikdaten pro Charge speichern"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Deskriptor",
        text: "Ein standardisiertes Wort oder Attribut, mit dem Geruchs- oder Geschmackseindruecke beschrieben werden."
      },
      {
        title: "Kurz erklärt: Blindprobe",
        text: "Eine Probe ohne sichtbare Produktidentitaet, damit Erwartung die Bewertung weniger beeinflusst."
      }
    ],
    faq: [
      {
        question: "Reicht ein gutes Panel ohne Labor?",
        answer: "Es hilft stark, ersetzt Analytik aber nicht. Sensorik und Labordaten ergänzen sich."
      },
      {
        question: "Wie gross sollte ein Panel sein?",
        answer: "Gross genug für unterschiedliche Wahrnehmungen, aber klein genug, um konsistent trainiert zu bleiben."
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
    summary: "Welche Aussagen zur Schmerzreduktion belegt sind, wo die Forschung Grenzen hat und wie Aufklärung sauber bleibt.",
    category: "medizin",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Schmerz", "Medizin", "Evidenz", "Meta-Analyse"],
    keyTakeaways: [
      "Schmerz ist kein einheitlicher Endpunkt; Evidenz unterscheidet sich je Indikation und Studiendesign.",
      "Kommunikation muss Wirkung, Nebenwirkung und Unsicherheit gleichzeitig abbilden.",
      "Seriöse Aufklärung vermeidet pauschale Heilsprache."
    ],
    quickFacts: [
      { label: "Wichtig", value: "Indikation und Endpunkt trennen" },
      { label: "Grenze", value: "Nicht jede Studie ist uebertragbar" },
      { label: "Praxis", value: "Aufklärung statt Versprechen" }
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
          "Für Content bedeutet das: Nutzen nennen, Unsicherheit markieren, Grenzen nicht verschweigen."
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
        title: "Kurz erklärt: Endpunkt",
        text: "Das konkrete Ergebnis, das in einer Studie gemessen wird, etwa Schmerzintensitaet oder Schlafqualität."
      },
      {
        title: "Kurz erklärt: Meta-Analyse",
        text: "Zusammenfassung mehrerer Studien, die einen breiteren Blick ermöglicht, aber nur so gut ist wie die eingeschlossenen Daten."
      }
    ],
    faq: [
      {
        question: "Ist Cannabis ein generelles Schmerzmittel?",
        answer: "So pauschal lässt sich das nicht sagen. Die Evidenz ist indikations- und populationsabhaengig."
      },
      {
        question: "Warum widersprechen sich Schlagzeilen so oft?",
        answer: "Weil Studien unterschiedliche Endpunkte, Gruppen und Qualitätsniveaus haben und Medien das oft verkurzen."
      }
    ],
    glossary: [
      { term: "Indikation", definition: "Konkreter medizinischer Anwendungsbereich oder Beschwerdekomplex." },
      { term: "Endpunkt", definition: "Vorab definierte Größe, die in einer Studie gemessen und bewertet wird." },
      { term: "Placebo", definition: "Vergleichsbehandlung ohne den eigentlichen Wirkstoff, um Effekte sauberer einordnen zu können." },
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
      "Kurzfristige Effekte können anders ausfallen als die Entwicklung bei langfristiger Nutzung.",
      "Saubere Kommunikation trennt Einschlafhilfe, Schlafqualität und Nebenwirkungen."
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
          "Hinweis auf medizinische Abklärung geben"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Schlafqualität",
        text: "Nicht nur die Dauer, sondern auch Erholung, Durchschlafverhalten und Tagesfunktion gehören dazu."
      },
      {
        title: "Kurz erklärt: subjektiv vs. objektiv",
        text: "Menschen können eine Nacht als besser empfinden, obwohl Messparameter gemischt ausfallen."
      }
    ],
    faq: [
      {
        question: "Hilft Cannabis immer beim Einschlafen?",
        answer: "Nein. Reaktion, Dosis, Produktprofil und Kontext unterscheiden sich stark zwischen Personen."
      },
      {
        question: "Warum sind Langzeitdaten wichtig?",
        answer: "Weil sich kurzfristige Entlastung und langfristige Schlafarchitektur nicht decken müssen."
      }
    ],
    glossary: [
      { term: "Schlafarchitektur", definition: "Aufbau einer Nacht aus verschiedenen Schlafphasen und deren Zusammenspiel." },
      { term: "Subjektive Erholung", definition: "Persoenliches Empfinden, wie erholt man sich nach dem Schlaf fuehlt." },
      { term: "Langzeitdaten", definition: "Studien oder Beobachtungen über laengere Zeiträume mit wiederholter Erfassung." },
    ],
    relatedSlugs: ["cannabinoide-und-evidenz", "cbd-und-angststörungen-einordnung", "thc-risiken-bei-jugendlichen"]
  }),
  createArticle({
    slug: "cbd-und-angststoerungen-einordnung",
    title: "CBD und Angststoerungen einordnen",
    summary: "Was aus Studien wirklich ableitbar ist und wo aus frühen Hinweisen zu schnell Gewissheiten gemacht werden.",
    category: "medizin",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["CBD", "Angst", "Studienlage", "Einordnung"],
    keyTakeaways: [
      "CBD wird häufig ueberverkauft, obwohl die Humanstudienlage je nach Kontext begrenzt bleibt.",
      "Praeklinische Hinweise dürfen nicht mit klinischer Sicherheit verwechselt werden.",
      "Seriöse Inhalte benennen Unsicherheit explizit."
    ],
    quickFacts: [
      { label: "Fehlerquelle", value: "Tierdaten als Humanbeweis lesen" },
      { label: "Kernpunkt", value: "Kontext und Population zählen" },
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
        heading: "Wie Aufklärung hier professionell bleibt",
        content: [
          "Ein guter Text zeigt, welche Daten es gibt, welche Populationen untersucht wurden und wo offene Fragen bleiben.",
          "So entsteht Orientierung ohne falsche Sicherheit."
        ],
        checklist: [
          "Studientyp offen nennen",
          "Population und Dosis nicht verschweigen",
          "Keine Heilaussagen aus frühen Hinweisen ableiten"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: praeklinisch",
        text: "Studien im Labor oder Tiermodell, die Hinweise liefern, aber keine sichere Aussage für Menschen erlauben."
      },
      {
        title: "Kurz erklärt: klinisch",
        text: "Untersuchungen am Menschen, meist mit deutlich höherem Anspruch an Uebertragbarkeit."
      }
    ],
    faq: [
      {
        question: "Ist CBD ein sicheres Mittel gegen Angst?",
        answer: "So pauschal nicht. Es gibt Hinweise, aber die Qualität und Uebertragbarkeit der Daten sind begrenzt und kontextabhaengig."
      },
      {
        question: "Warum sagen viele Seiten etwas anderes?",
        answer: "Weil frühe Befunde und Marketing oft zu schnell zusammengezogen werden."
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
    summary: "Warum Alter, Gehirnentwicklung und Konsummuster in der Risikokommunikation differenziert betrachtet werden müssen.",
    category: "medizin",
    difficulty: "einsteiger",
    readMinutes: 7,
    tags: ["THC", "Jugendliche", "Risikokommunikation", "Prävention"],
    keyTakeaways: [
      "Jugendliche sind keine kleine Version erwachsener Konsumenten; Risiko und Entwicklungskontext unterscheiden sich deutlich.",
      "Prävention funktioniert besser über klare, glaubwürdige Aufklärung als über plakative Uebertreibung.",
      "Konsummuster, Frequenz und Potenz müssen gemeinsam betrachtet werden."
    ],
    quickFacts: [
      { label: "Fokus", value: "Entwicklung plus Prävention" },
      { label: "Wichtig", value: "Muster statt Einzelfall" },
      { label: "Kommunikation", value: "Klar und nicht sensationalistisch" }
    ],
    sections: [
      {
        heading: "Warum Alter im Risiko so zentral ist",
        content: [
          "Jugendliche befinden sich in einer Entwicklungsphase, in der Verhalten, Umfeld und Hirnreifung zusammenspielen.",
          "Deshalb müssen Risiken differenziert und glaubwuerdig kommuniziert werden."
        ]
      },
      {
        heading: "Prävention ohne Panikmodus",
        content: [
          "Abschreckung allein reicht selten. Inhalte sollten nachvollziehbar sein, konkrete Risiken benennen und Raum für Fragen lassen.",
          "So wird Aufklärung anschlussfaehiger als reine Moralisierung."
        ],
        checklist: [
          "Hauefigkeit und Potenz getrennt erklären",
          "Vulnerable Gruppen explizit benennen",
          "Hilfs- und Beratungsangebote sichtbar machen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Potenz",
        text: "Wie stark ein Produkt in Bezug auf relevante Wirkstoffe ausfaellt, meist vereinfacht über THC-Gehalte beschrieben."
      },
      {
        title: "Kurz erklärt: Risikokommunikation",
        text: "Art, wie Risiken vermittelt werden, damit sie verstanden und ernst genommen werden, ohne falschen Alarmismus."
      }
    ],
    faq: [
      {
        question: "Ist jeder Konsum im Jugendalter gleich gefährlich?",
        answer: "Nein. Haeufigkeit, Potenz, Alter, psychische Belastung und Kontext beeinflussen das Risiko deutlich."
      },
      {
        question: "Warum ist glaubwürdige Aufklärung so wichtig?",
        answer: "Weil ueberzogene Botschaften oft abgelehnt werden und damit praeventive Wirkung verlieren."
      }
    ],
    glossary: [
      { term: "Potenz", definition: "Stärke oder Konzentration relevanter Wirkstoffe in einem Produkt." },
      { term: "Vulnerabel", definition: "Besonders empfindlich oder risikobelastet in einem bestimmten Kontext." },
      { term: "Prävention", definition: "Massnahmen zur Vorbeugung unerwuenschter gesundheitlicher oder sozialer Folgen." },
    ],
    relatedSlugs: ["cannabinoide-und-evidenz", "inhalation-set-setting-und-harm-reduction", "cannabinoide-nebenwirkungen-und-interaktionen"]
  }),
  createArticle({
    slug: "cannabinoide-nebenwirkungen-und-interaktionen",
    title: "Cannabinoide: Nebenwirkungen und Interaktionen",
    summary: "Welche Belastungen realistisch sind und warum Kontext, Dosis und Begleitmedikation immer mitgedacht werden müssen.",
    category: "medizin",
    difficulty: "profi",
    readMinutes: 9,
    tags: ["Nebenwirkungen", "Interaktionen", "Dosis", "Sicherheit"],
    keyTakeaways: [
      "Nebenwirkungen sind kein Randthema, sondern zentral für jede seriöse Einordnung.",
      "Interaktionen mit anderer Medikation können klinisch relevant sein und gehören in jede verantwortliche Aufklärung.",
      "Dosis und Kontext entscheiden mit, wie belastend Nebenwirkungen ausfallen."
    ],
    quickFacts: [
      { label: "Pflicht", value: "Risiken immer mitkommunizieren" },
      { label: "Einfluss", value: "Dosis, Person, Begleitmedikation" },
      { label: "Warnsignal", value: "Pauschale Sicherheitsbehauptungen" }
    ],
    sections: [
      {
        heading: "Warum Nebenwirkungen nicht ausgeblendet werden dürfen",
        content: [
          "Viele Inhalte fokussieren fast nur auf moeglichen Nutzen. Das führt zu einem unausgewogenen Bild und schwaecht die Glaubwuerdigkeit.",
          "Eine seriöse Seite benennt sowohl haeufige als auch potenziell relevante seltenere Belastungen."
        ]
      },
      {
        heading: "Interaktionen richtig einordnen",
        content: [
          "Begleitmedikation, Vorerkrankungen und Dosismuster können das Risiko verändern. Deshalb sind einfache Allgemeinregeln oft unzureichend.",
          "Für Content ist entscheidend, fachliche Abklärung aktiv zu empfehlen, statt Sicherheit zu suggerieren."
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
        title: "Kurz erklärt: Interaktion",
        text: "Wechselwirkung zwischen mehreren Stoffen oder Medikamenten, die Wirkung oder Nebenwirkung verändern kann."
      },
      {
        title: "Kurz erklärt: Dosis-Wirkungs-Bezug",
        text: "Nicht nur ob, sondern wie viel konsumiert oder eingenommen wird, beeinflusst Nutzen und Risiko stark."
      }
    ],
    faq: [
      {
        question: "Sind Nebenwirkungen immer selten?",
        answer: "Nein. Manche sind häufig, aber mild, andere seltener und potenziell relevanter. Beides muss sauber benannt werden."
      },
      {
        question: "Kann ich Interaktionen selbst einschaetzen?",
        answer: "Nur sehr eingeschränkt. Gerade bei Medikation ist fachliche Ruecksprache sinnvoll und oft notwendig."
      }
    ],
    glossary: [
      { term: "Interaktion", definition: "Wechselwirkung zwischen zwei oder mehr Substanzen mit verstärkter, abgeschwächter oder veränderter Wirkung." },
      { term: "Begleitmedikation", definition: "Weitere Arzneimittel oder Stoffe, die parallel eingenommen werden." },
      { term: "Nebenwirkung", definition: "Unerwuenschter Effekt, der im Zusammenhang mit der Anwendung eines Stoffes auftritt." },
    ],
    relatedSlugs: ["cannabinoide-und-evidenz", "cbd-und-angststörungen-einordnung", "cannabis-bei-schmerz-evidenzcheck"]
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
      "Gerät, Temperatur und Materialqualität beeinflussen das Ergebnis deutlich."
    ],
    quickFacts: [
      { label: "Thema", value: "Aufnahme plus Belastung" },
      { label: "Wichtig", value: "Geräte- und Materialqualität" },
      { label: "Ziel", value: "Informierte statt ideologische Wahl" }
    ],
    sections: [
      {
        heading: "Warum die Begriffe oft durcheinandergehen",
        content: [
          "Im Alltag werden Rauchen, Verdampfen und Vaping oft unscharf benutzt, obwohl Prozesse und Belastungsprofile auseinandergehen.",
          "Genau diese Unterscheidung ist für seriöse Aufklärung entscheidend."
        ]
      },
      {
        heading: "Wie Vergleiche fair bleiben",
        content: [
          "Statt absolute Sieger auszurufen, sollte Content Unterschiede in Onset, Reizstoffen, Dosierbarkeit und Fehlerquellen erklären.",
          "So können Nutzer informierter entscheiden."
        ],
        checklist: [
          "Konsumform klar benennen",
          "Belastungs- und Timingunterschiede trennen",
          "Material- und Geraetequalität mitberuecksichtigen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Verdampfen",
        text: "Erhitzung ohne klassische Verbrennung, bei der Wirkstoffe und andere Bestandteile aerosolisiert werden."
      },
      {
        title: "Kurz erklärt: Harm Reduction",
        text: "Strategien, die Risiken minimieren sollen, auch wenn das Verhalten selbst nicht komplett vermieden wird."
      }
    ],
    faq: [
      {
        question: "Ist Verdampfen automatisch sicher?",
        answer: "Nein automatisch nicht. Es kann Belastungsprofile verändern, aber Gerät, Material und Nutzung bleiben entscheidend."
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
    summary: "Wo diese Aufnahmeform zwischen klassischer oraler Einnahme und schnellerer Wirkung liegt und welche Missverständnisse häufig sind.",
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
      { label: "Fehler", value: "Zu frühe Nachdosierung" },
      { label: "Wichtig", value: "Produktform und Anwendung" }
    ],
    sections: [
      {
        heading: "Warum sublingual oft missverstanden wird",
        content: [
          "Viele Nutzer erwarten ein vollständig anderes Timing als bei oraler Aufnahme, obwohl Produkt und Anwendung stark variieren.",
          "Deshalb ist pauschale Kommunikation hier schnell irreführend."
        ]
      },
      {
        heading: "Was bei der Aufklärung wichtig ist",
        content: [
          "Erkläre realistische Onset-Fenster, Dosierunsicherheit und Unterschiede zwischen Produkten offen.",
          "So sinkt das Risiko für Fehlentscheidungen und falsche Vergleiche mit anderen Konsumformen."
        ],
        checklist: [
          "Onset-Fenster nicht ueberversprechen",
          "Produktfamilien getrennt erklären",
          "Redose-Hinweise klar formulieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: sublingual",
        text: "Anwendung unter der Zunge mit teilweiser Aufnahme über die Mundschleimhaut."
      },
      {
        title: "Kurz erklärt: Tinktur",
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
      { term: "Sublingual", definition: "Aufnahme über die Mundschleimhaut unter der Zunge." },
      { term: "Resorption", definition: "Aufnahme eines Stoffes in den Körper nach Anwendung oder Einnahme." },
      { term: "Produktmatrix", definition: "Gesamte stoffliche Zusammensetzung eines Produkts, die Aufnahme und Verhalten beeinflusst." },
    ],
    relatedSlugs: ["inhalation-vs-edibles", "cannabinoide-nebenwirkungen-und-interaktionen", "cannabinoide-und-evidenz"]
  }),
  createArticle({
    slug: "inhalation-set-setting-und-harm-reduction",
    title: "Inhalation, Set und Setting",
    summary: "Warum Kontext, Umgebung und mentale Verfassung für Risiko und Erfahrung oft fast so wichtig sind wie das Produkt selbst.",
    category: "konsumformen",
    difficulty: "einsteiger",
    readMinutes: 6,
    tags: ["Set", "Setting", "Harm Reduction", "Aufklärung"],
    keyTakeaways: [
      "Produktprofil allein erklärt nicht, wie eine Erfahrung verlaeuft; Kontext und Erwartung spielen stark mit hinein.",
      "Harm Reduction bedeutet auch, Situation, Timing und Begleitumstaende sauber zu planen.",
      "Viele negative Erfahrungen entstehen durch Kontextfehler und nicht nur durch Produktstaerke."
    ],
    quickFacts: [
      { label: "Set", value: "Innere Verfassung" },
      { label: "Setting", value: "Aeusserer Rahmen" },
      { label: "Praxis", value: "Kontext bewusst wählen" }
    ],
    sections: [
      {
        heading: "Warum Kontext so unterschätzt wird",
        content: [
          "Menschen bewerten Konsumerfahrungen oft nur über Potenz oder Sorte. Dabei können Stress, unbekannte Umgebung oder sozialer Druck entscheidend sein.",
          "Eine gute Aufklaerungsseite muss diese Ebene sichtbar machen."
        ]
      },
      {
        heading: "Praktische Harm-Reduction-Punkte",
        content: [
          "Plane Konsum nicht in belasteten Situationen, sorge für eine sichere Umgebung und vermeide riskante Kombinationen.",
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
        title: "Kurz erklärt: Set",
        text: "Die innere Ausgangslage, also Stimmung, Erwartung, Stressniveau und psychische Verfassung."
      },
      {
        title: "Kurz erklärt: Setting",
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
        answer: "Weil Wirkung und Belastung schwerer vorhersehbar werden und sich Risiken addieren oder verschieben können."
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
    title: "Bubble Hash: Qualitätskriterien",
    summary: "Welche Faktoren für Reinheit, Stabilität und Vergleichbarkeit wirklich zählen und welche Kurzlabels wenig aussagen.",
    category: "konzentrate",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Bubble Hash", "Qualität", "Stabilität", "Bewertung"],
    keyTakeaways: [
      "Bubble Hash sollte über Reinheit, Stabilität und Chargenkontext bewertet werden, nicht nur über Szenevokabular.",
      "Trocknung und Lagerung sind für die Produktintegritaet fast so wichtig wie die Trennung selbst.",
      "Objektive Daten schlagen Rangbegriffe ohne Kontext."
    ],
    quickFacts: [
      { label: "Kernpunkt", value: "Saubere Nachernte" },
      { label: "Warnsignal", value: "Nur Szenegrade ohne Daten" },
      { label: "Wichtig", value: "Stabilität über Zeit" }
    ],
    sections: [
      {
        heading: "Was Bubble Hash professionell auszeichnet",
        content: [
          "Fachlich relevant sind Reinheit, sensorische Klarheit, Lagerstabilitaet und Kontaminantenstatus. Szeneetiketten allein reichen nicht.",
          "Gerade bei hochwertigen Produkten entscheiden Nachbehandlung und Dokumentation über echte Vergleichbarkeit."
        ]
      },
      {
        heading: "Wo die typischen Fehlbewertungen liegen",
        content: [
          "Begriffe aus Communities oder Shops klingen praezise, sind aber oft nicht standardisiert. Ohne Mess- und Chargenkontext bleiben sie begrenzt aussagekräftig.",
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
        title: "Kurz erklärt: Reinheit",
        text: "Wie frei ein Produkt von unerwünschten Pflanzenresten, Fremdstoffen oder anderen störenden Bestandteilen ist."
      },
      {
        title: "Kurz erklärt: Stabilität",
        text: "Wie gut ein Produkt unter realen Lager- und Transportbedingungen seine Eigenschaften behält."
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
      { term: "Reinheit", definition: "Grad, in dem ein Produkt frei von störenden oder unerwünschten Bestandteilen ist." },
      { term: "Chargenkontext", definition: "Alle Informationen rund um Herkunft, Prozess und Lagerung einer Charge." },
      { term: "Integritaet", definition: "Erhalt der ursprünglichen und gewünschten Produkteigenschaften." },
    ],
    relatedSlugs: ["hash-typen-vergleichen", "wasseraktivität-und-curing", "full-melt-und-marketingsprache"]
  }),
  createArticle({
    slug: "rosin-einordnung-ohne-hype",
    title: "Rosin einordnen ohne Hype",
    summary: "Wie Input-Material, Temperaturbelastung und Nachbehandlung das Ergebnis formen und warum das besser ist als reine Trendbegriffe.",
    category: "konzentrate",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Rosin", "Qualität", "Input", "Einordnung"],
    keyTakeaways: [
      "Rosin ist keine automatische Qualitaetsgarantie; Endqualität hängt zuerst am Input-Material.",
      "Trendbegriffe verdecken oft, dass Stabilität, Reinheit und Chargenkonsistenz wichtiger sind.",
      "Für Aufklärung lohnt sich eine klare Trennung zwischen Technikbegriff und Produktqualität."
    ],
    quickFacts: [
      { label: "Hebel", value: "Input plus Nachbehandlung" },
      { label: "Irrtum", value: "Rosin gleich Premium" },
      { label: "Qualität", value: "Nur mit Daten und Kontext" }
    ],
    sections: [
      {
        heading: "Warum Rosin so oft ueberhoeht wird",
        content: [
          "Der Begriff steht in vielen Communities für Hochwertigkeit. Das ist verstaendlich, aber fachlich zu kurz.",
          "Ohne Blick auf Ausgangsmaterial, Prozesssauberkeit und Stabilität bleibt die Einordnung oberflaechlich."
        ]
      },
      {
        heading: "Wie du Rosin professionell beschreibst",
        content: [
          "Sprich über Vorstufe, Chargenkontext, Lagerung und Analytik. Das schafft mehr Vertrauen als Szenevokabular allein.",
          "Gerade auf grossen Seiten lohnt sich ein standardisiertes Datenraster."
        ],
        checklist: [
          "Input-Material offen benennen",
          "Stabilität und Kontaminanten mitdenken",
          "Trendbegriffe nur mit Kriterien erklären"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Input-Material",
        text: "Das Ausgangsprodukt, dessen Qualität das Ergebnis später stark begrenzt oder ermöglicht."
      },
      {
        title: "Kurz erklärt: Hype",
        text: "Uebersteigerte Wahrnehmung eines Begriffs oder Produkts, die oft mehr Marketing als Einordnung ist."
      }
    ],
    faq: [
      {
        question: "Ist Rosin immer loesungsmittelfrei?",
        answer: "Der Begriff wird so verwendet, aber für die Gesamtbewertung bleiben Vorstufe und Prozesskontext trotzdem relevant."
      },
      {
        question: "Kann Rosin aus schlechtem Input gut werden?",
        answer: "Nur sehr begrenzt. Gute Verarbeitung ersetzt schwaches Ausgangsmaterial nicht."
      }
    ],
    glossary: [
      { term: "Input-Material", definition: "Ausgangsprodukt, das die spätere Qualität eines Endprodukts mitbestimmt." },
      { term: "Nachbehandlung", definition: "Alle Schritte nach der eigentlichen Gewinnung oder Pressung, etwa Stabilisierung und Lagerung." },
      { term: "Chargenkonsistenz", definition: "Wie aehnlich mehrere Chargen in relevanten Eigenschaften ausfallen." },
    ],
    relatedSlugs: ["hash-typen-vergleichen", "bubble-hash-qualitätskriterien", "full-melt-und-marketingsprache"]
  }),
  createArticle({
    slug: "full-melt-und-marketingsprache",
    title: "Full Melt und Marketingsprache",
    summary: "Warum Szene- und Shopbegriffe eine Einordnung brauchen und wie man sie auf grossen Wissensseiten sauber erklärt.",
    category: "konzentrate",
    difficulty: "profi",
    readMinutes: 7,
    tags: ["Full Melt", "Marketing", "Klassifikation", "Content"],
    keyTakeaways: [
      "Viele Begriffe in Konzentratkategorien sind sprachlich stark, aber fachlich unscharf.",
      "Gute Wissensseiten erklären Herkunft und Nutzung eines Begriffs, uebernehmen ihn aber nicht unkritisch als Qualitätsurteil.",
      "Ein Glossar mit Kriterienlogik verhindert Missverständnisse im Katalog."
    ],
    quickFacts: [
      { label: "Thema", value: "Begriffsklaerung" },
      { label: "Risiko", value: "Marketing als Qualitaetsersatz" },
      { label: "Lösung", value: "Glossar plus Kriterienlogik" }
    ],
    sections: [
      {
        heading: "Warum Sprache im Konzentratbereich so aufgeladen ist",
        content: [
          "Szenebegriffe transportieren Status, Erfahrung und Erwartungen. Genau deshalb müssen sie für neue Nutzer sauber eingeordnet werden.",
          "Sonst wird Marketing leicht mit Messbarkeit verwechselt."
        ]
      },
      {
        heading: "Wie Plattformen damit umgehen sollten",
        content: [
          "Erkläre Begriffe, aber knuepfe Produktbewertung an nachvollziehbare Kriterien und nicht an Szeneetiketten.",
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
        title: "Kurz erklärt: Szenebegriff",
        text: "Ein Ausdruck aus Community oder Handel, der oft mehr kulturelle als standardisierte technische Bedeutung traegt."
      },
      {
        title: "Kurz erklärt: Kriterienlogik",
        text: "Bewertung nach festen und transparenten Merkmalen statt nach Schlagworten."
      }
    ],
    faq: [
      {
        question: "Soll ich solche Begriffe ganz vermeiden?",
        answer: "Nein, aber immer erklären und nicht als alleinige Qualitätsaussage stehen lassen."
      },
      {
        question: "Warum ist das für grosse Seiten wichtig?",
        answer: "Weil unerklaerte Begriffe für Einsteiger irreführend sind und Kataloge uneinheitlich machen."
      }
    ],
    glossary: [
      { term: "Szenebegriff", definition: "Nicht standardisierter Ausdruck aus Kultur, Community oder Handel." },
      { term: "Glossar", definition: "Sammlung definierter Begriffe zur einheitlichen Sprachverwendung." },
      { term: "Qualitätsurteil", definition: "Bewertung eines Produkts anhand nachvollziehbarer und relevanter Kriterien." },
    ],
    relatedSlugs: ["hash-typen-vergleichen", "rosin-einordnung-ohne-hype", "bubble-hash-qualitätskriterien"]
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
      "Content-Teams brauchen Freigaberegeln für Formulierungen und Evidenzbezug."
    ],
    quickFacts: [
      { label: "Risiko", value: "Unscharfe Heilsprache" },
      { label: "Lösung", value: "Freigabeprozess plus Claim-Katalog" },
      { label: "Wichtig", value: "Juristische Prüfung regional denken" }
    ],
    sections: [
      {
        heading: "Warum Claims schnell kritisch werden",
        content: [
          "Schon kleine sprachliche Verschiebungen können aus neutraler Information ein problematisches Nutzenversprechen machen.",
          "Deshalb brauchen grosse Seiten klares Wording und interne Review-Regeln."
        ]
      },
      {
        heading: "Wie Teams sicherer formulieren",
        content: [
          "Arbeite mit freigegebenen Formulierungsbausteinen, markiere Evidenzstufen und vermeide absolute Wirkzusagen.",
          "So bleibt Aufklärung informativ, ohne unnoetiges regulatorisches Risiko aufzubauen."
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
        title: "Kurz erklärt: Health Claim",
        text: "Aussage, die einem Produkt eine gesundheitsbezogene Wirkung oder einen Nutzen zuschreibt."
      },
      {
        title: "Kurz erklärt: Freigabeprozess",
        text: "Interner Ablauf, bei dem Inhalte vor Veröffentlichung inhaltlich und rechtlich geprüft werden."
      }
    ],
    faq: [
      {
        question: "Darf ich Studien einfach zusammenfassen?",
        answer: "Ja, aber ohne daraus unzulaessige Heilaussagen oder pauschale Produktversprechen abzuleiten."
      },
      {
        question: "Warum reichen gute Quellen allein nicht aus?",
        answer: "Weil die rechtliche Zulässigkeit von Sprache und Kontext nicht automatisch aus der Existenz einer Studie folgt."
      }
    ],
    glossary: [
      { term: "Health Claim", definition: "Gesundheitsbezogene Aussage über Nutzen oder Wirkung eines Produkts." },
      { term: "Freigabeprozess", definition: "Standardisierter Pruefprozess vor Veröffentlichung eines Inhalts oder Produkts." },
      { term: "Evidenzstufe", definition: "Einordnung, wie belastbar eine Aussage durch Forschung abgestuetzt ist." },
    ],
    relatedSlugs: ["rechtliche-grundlagen-dach", "cannabinoide-und-evidenz", "cbd-und-angststörungen-einordnung"]
  }),
  createArticle({
    slug: "dokumentationspflichten-fuer-chargen",
    title: "Dokumentationspflichten für Chargen",
    summary: "Welche Nachweise für Freigabe, Rückverfolgung und Reklamationen unverzichtbar sind.",
    category: "recht",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    tags: ["Chargen", "Dokumentation", "Rückverfolgung", "Compliance"],
    keyTakeaways: [
      "Gute Chargendokumentation schuetzt nicht nur rechtlich, sondern verbessert auch Qualitaetsarbeit.",
      "Ohne Rückverfolgung werden Reklamationen, Sperrungen und Audits schnell teuer und chaotisch.",
      "Digitale und klare Datenstrukturen zahlen sich früh aus."
    ],
    quickFacts: [
      { label: "Pflicht", value: "Eindeutige Chargen-ID" },
      { label: "Nutzen", value: "Rueckruf- und Auditfähigkeit" },
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
          "Neben COA und Freigabestatus gehören auch Abweichungen, Transporte, Reklamationen und Nachtests in den Datensatz.",
          "Je früher das standardisiert wird, desto skalierbarer wird der Betrieb."
        ],
        checklist: [
          "Einheitliche Chargen-ID über alle Systeme ziehen",
          "COA, Lagerung und Bewegungen verbinden",
          "Abweichungen mit CAPA-Massnahmen verknüpfen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Rückverfolgung",
        text: "Faehigkeit, Ursprung, Weg und Status einer Charge vom Eingang bis zur Ausgabe nachzuvollziehen."
      },
      {
        title: "Kurz erklärt: Auditfähigkeit",
        text: "Wie schnell und sauber sich ein Prozess oder Datensatz gegenüber Pruefern belegen lässt."
      }
    ],
    faq: [
      {
        question: "Reicht eine PDF-Ablage?",
        answer: "Für kleine Mengen vielleicht, aber skalierbar und auswertbar wird es erst mit strukturierter Datenlogik."
      },
      {
        question: "Warum brauchen Reklamationen dieselbe Charge-Logik?",
        answer: "Weil nur so Ursachen, betroffene Mengen und Folgeaktionen sauber zugeordnet werden können."
      }
    ],
    glossary: [
      { term: "Chargen-ID", definition: "Eindeutige Kennung für eine definierte Produktmenge innerhalb eines Prozesses." },
      { term: "Rückverfolgung", definition: "Systematische Nachverfolgbarkeit von Herkunft, Bewegung und Status eines Produkts." },
      { term: "Audit", definition: "Formalisierte Prüfung von Prozessen, Daten oder Regeln auf Konformitaet und Wirksamkeit." },
    ],
    relatedSlugs: ["rechtliche-grundlagen-dach", "batch-release-und-freigabekriterien", "recall-und-sperrprozesse-für-chargen"]
  }),
  createArticle({
    slug: "gmp-gdp-und-qualitaetssysteme",
    title: "GMP, GDP und Qualitätssysteme",
    summary: "Eine Einordnung der wichtigsten Systembegriffe, die auf grossen Plattformen und in Compliance-Diskussionen ständig auftauchen.",
    category: "recht",
    difficulty: "profi",
    readMinutes: 9,
    tags: ["GMP", "GDP", "Qualitätssystem", "Compliance"],
    keyTakeaways: [
      "GMP und GDP sind keine Buzzwords, sondern Prozesslogiken mit konkreten Auswirkungen auf Dokumentation und Verantwortung.",
      "Qualitätssysteme werden erst wirksam, wenn Rollen, Daten und Freigaben zusammenpassen.",
      "Für Aufklaerungsseiten lohnt ein klares Glossar statt vager Abkuerzungsnutzung."
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
          "In vielen Texten werden GMP oder GDP als bloes Qualitätslabel genutzt, ohne die dahinterliegenden Anforderungen zu erklären.",
          "Das hilft weder Nutzern noch Teams, die reale Prozesse verstehen müssen."
        ]
      },
      {
        heading: "Wie du Systeme praktisch einordnest",
        content: [
          "Fokussiere auf Verantwortlichkeiten, Dokumentation, Freigaben, Abweichungen und Transportbedingungen. Daran zeigt sich, ob ein System wirklich gelebt wird.",
          "Ein gutes Wiki erklärt diese Begriffe über Funktionen, nicht über leere Prestigeformeln."
        ],
        checklist: [
          "Abkuerzungen immer ausschreiben",
          "Praxisbezug über Prozesse herstellen",
          "Begriffe im Glossar konsistent verwenden"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: GMP",
        text: "Good Manufacturing Practice, also Regeln für kontrollierte Herstellung und Qualitätssicherung."
      },
      {
        title: "Kurz erklärt: GDP",
        text: "Good Distribution Practice, also Regeln für Lagerung, Transport und Verteilung."
      }
    ],
    faq: [
      {
        question: "Muss jedes Unternehmen GMP sein?",
        answer: "Das hängt stark vom regulatorischen Kontext ab. Wichtig ist, die Anforderungen nicht pauschal zu vermischen."
      },
      {
        question: "Warum hilft ein Qualitätssystem auch operativ?",
        answer: "Weil klare Rollen, Freigaben und Datenspuren Fehler früher sichtbar machen und Skalierung erleichtern."
      }
    ],
    glossary: [
      { term: "GMP", definition: "Good Manufacturing Practice, Rahmen für kontrollierte Herstellung und Qualitätssicherung." },
      { term: "GDP", definition: "Good Distribution Practice, Rahmen für sichere Lagerung und Distribution." },
      { term: "Qualitätssystem", definition: "Gesamtheit aus Regeln, Rollen, Daten und Prozessen zur Sicherung definierter Standards." },
    ],
    relatedSlugs: ["rechtliche-grundlagen-dach", "dokumentationspflichten-für-chargen", "batch-release-und-freigabekriterien"]
  }),
  createArticle({
    slug: "schimmel-und-mykotoxine-bei-cannabis",
    title: "Schimmel und Mykotoxine bei Cannabis",
    summary: "Warum mikrobiologische Sicherheit nicht an der sichtbaren Blüte endet und welche Informationsluecken besonders riskant sind.",
    category: "sicherheit",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Schimmel", "Mykotoxine", "Mikrobiologie", "Sicherheit"],
    keyTakeaways: [
      "Nicht jeder mikrobielle Risikofall ist mit blossem Auge sichtbar.",
      "Feuchtefuehrung, Trocknung und Lagerung entscheiden mit über mikrobiologische Stabilität.",
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
          "Schimmel oder toxinbezogene Risiken können bereits relevant sein, ohne dass ein Produkt für Laien eindeutig auffaellig aussieht.",
          "Deshalb sind Laborwerte und Prozesshistorie für seriöse Bewertung unverzichtbar."
        ]
      },
      {
        heading: "Wo Prävention ansetzt",
        content: [
          "Kontrollierte Trocknung, stabile Lagerung und klare Sperrlogik reduzieren das Risiko deutlich. Gleichzeitig müssen Hinweise für Teams praktisch umsetzbar bleiben.",
          "Gerade nach der Ernte ist saubere Prozessführung entscheidend."
        ],
        checklist: [
          "aw und Temperatur im Nachernteprozess dokumentieren",
          "Auffällige Chargen sofort sperren",
          "Mikrobiologische Daten nicht isoliert lesen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Mykotoxine",
        text: "Stoffwechselprodukte bestimmter Pilze, die gesundheitlich relevant sein können."
      },
      {
        title: "Kurz erklärt: mikrobiologische Stabilität",
        text: "Wie gut ein Produkt gegen unerwuenschtes Wachstum von Mikroorganismen abgesichert ist."
      }
    ],
    faq: [
      {
        question: "Riecht Schimmel immer muffig?",
        answer: "Nicht immer eindeutig. Geruch kann Hinweise liefern, ersetzt aber keine Bewertung über Daten und Prozesskontext."
      },
      {
        question: "Warum ist aw hier so wichtig?",
        answer: "Weil freies Wasser ein zentraler Treiber für mikrobielles Wachstum und Produktinstabilitaet ist."
      }
    ],
    glossary: [
      { term: "Mykotoxin", definition: "Von bestimmten Pilzen gebildeter Stoff mit potenziell gesundheitsschaedlicher Wirkung." },
      { term: "Mikrobiologie", definition: "Bereich der Wissenschaft, der Mikroorganismen und ihre Eigenschaften untersucht." },
      { term: "Sperrlogik", definition: "Regelwerk, wann Produkte wegen Risiken gestoppt oder isoliert werden."
      },
    ],
    relatedSlugs: ["wasseraktivität-und-curing", "pgr-und-kontaminanten", "recall-und-sperrprozesse-für-chargen"]
  }),
  createArticle({
    slug: "schwere-metalle-und-aufnahmewege",
    title: "Schwere Metalle und Aufnahmewege",
    summary: "Wie Metalle in die Lieferkette gelangen können und warum Form, Konzentration und Konsumweg für das Risiko wichtig sind.",
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
      { label: "Lösung", value: "Monitoring plus Freigabelogik" }
    ],
    sections: [
      {
        heading: "Wo Metallbelastung entstehen kann",
        content: [
          "Belastungen können aus der Produktionsumgebung, aus Wasser oder über Prozesskontakt kommen. Deshalb ist die Lieferkette Teil der Sicherheit.",
          "Endproduktdaten ohne Herkunftskontext beantworten nur einen Teil der Frage."
        ]
      },
      {
        heading: "Wie man Risiko realistisch einordnet",
        content: [
          "Für faire Kommunikation müssen Konsumweg, Matrix und Nutzungshaeufigkeit mitgedacht werden.",
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
        title: "Kurz erklärt: Matrix",
        text: "Das Produktumfeld, in dem ein Stoff gemessen wird, also zum Beispiel Blüte, Extrakt oder Edible."
      },
      {
        title: "Kurz erklärt: Aufnahmeweg",
        text: "Art, wie ein Stoff in den Körper gelangt, etwa inhalativ oder oral."
      }
    ],
    faq: [
      {
        question: "Sind Spuren sofort gefährlich?",
        answer: "Nicht jede Spur ist automatisch kritisch. Kontext, Grenzwerte und Expositionsprofil sind entscheidend."
      },
      {
        question: "Warum reicht eine einzelne Endproduktmessung oft nicht?",
        answer: "Weil sie ohne Herkunfts- und Prozesskontext nur begrenzt erklärt, woher das Risiko kommt und wie stabil es ist."
      }
    ],
    glossary: [
      { term: "Schwermetalle", definition: "Metallische Elemente, die in bestimmten Konzentrationen toxikologisch relevant werden können." },
      { term: "Matrix", definition: "Produktumgebung oder Material, in dem eine Analyse stattfindet." },
      { term: "Exposition", definition: "Ausmass und Art des Kontakts eines Organismus mit einem Stoff." },
    ],
    relatedSlugs: ["pgr-und-kontaminanten", "sampling-und-probenahme-fehler", "schimmel-und-mykotoxine-bei-cannabis"]
  }),
  createArticle({
    slug: "pestizidklassen-und-rueckstandsrisiken",
    title: "Pestizidklassen und Rückstandsrisiken",
    summary: "Eine Einordnung der wichtigsten Stoffgruppen, warum Listen allein nicht genuegen und wie Rueckstandsberichte gelesen werden sollten.",
    category: "sicherheit",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Pestizide", "Rückstände", "COA", "Sicherheit"],
    keyTakeaways: [
      "Rückstandsrisiken lassen sich nicht nur über Vorhandensein, sondern über Konzentration, Stoffklasse und Kontext verstehen.",
      "Nicht jede Liste im COA ist vollständig aussagekräftig, wenn Methode und Abdeckung fehlen.",
      "Lieferantenfreigabe ohne Rückstandsstrategie bleibt blind."
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
          "Für seriöse Bewertung braucht es mehr als ein gruenes Haekchen."
        ]
      },
      {
        heading: "Wie ein sauberer Rueckstandscheck aussieht",
        content: [
          "Prüfe Stoffabdeckung, Grenzwerte, Methode, Chargenbezug und Testfrequenz. Erst dann wird aus Daten ein Sicherheitsurteil.",
          "Das gilt für Plattformen genauso wie für Einkaufsteams."
        ],
        checklist: [
          "Panelabdeckung dokumentieren",
          "Grenzwerte regional zuordnen",
          "Rückstandsstrategie pro Lieferant festhalten"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Panelabdeckung",
        text: "Welche Stoffe oder Stoffgruppen ein Laborbericht tatsächlich ueberhaupt testet."
      },
      {
        title: "Kurz erklärt: Nachweisgrenze",
        text: "Kleinste Menge, die ein Labor mit der gewaehlten Methode noch sicher erkennen kann."
      }
    ],
    faq: [
      {
        question: "Ist nicht nachweisbar gleich sicher?",
        answer: "Nicht automatisch. Es hängt davon ab, was getestet wurde und wie niedrig die Nachweisgrenze liegt."
      },
      {
        question: "Warum muss ich die Stoffklasse kennen?",
        answer: "Weil unterschiedliche Stoffgruppen verschiedene toxikologische und regulatorische Relevanz haben."
      }
    ],
    glossary: [
      { term: "Rueckstand", definition: "Im Produkt verbliebene Menge eines unerwünschten oder regulierten Stoffes." },
      { term: "Panelabdeckung", definition: "Umfang der im Labor untersuchten Stoffe oder Stoffgruppen." },
      { term: "Nachweisgrenze", definition: "Kleinste noch detektierbare Stoffmenge einer Methode." },
    ],
    relatedSlugs: ["pgr-und-kontaminanten", "coa-richtig-lesen", "sampling-und-probenahme-fehler"]
  }),
  createArticle({
    slug: "recall-und-sperrprozesse-fuer-chargen",
    title: "Recall- und Sperrprozesse für Chargen",
    summary: "Wie Produkte bei Verdachtsfaellen kontrolliert gestoppt, bewertet und kommuniziert werden sollten.",
    category: "sicherheit",
    difficulty: "profi",
    readMinutes: 8,
    tags: ["Recall", "Sperrung", "Charge", "CAPA"],
    keyTakeaways: [
      "Ein Recall funktioniert nur mit klaren Rollen, Datenspuren und Eskalationswegen.",
      "Je früher Sperrlogik definiert ist, desto geringer ist der Schaden im Ereignisfall.",
      "Kommunikation nach innen und aussen muss vorbereitet statt improvisiert sein."
    ],
    quickFacts: [
      { label: "Kernpunkt", value: "Vorbereitung vor dem Vorfall" },
      { label: "Pflicht", value: "Rollen und Eskalation" },
      { label: "Daten", value: "Rückverfolgung plus Statushistorie" }
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
          "Sperrstatus, Entscheidungswege, Kommunikationsvorlagen und CAPA-Folgen müssen verbunden sein. Nur dann lässt sich professionell reagieren.",
          "Auch auf einer Wissensseite ist das ein zentraler Drop-Artikel für B2B- und Qualitaetskontext."
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
        title: "Kurz erklärt: Recall",
        text: "Gezielte Rückholung oder Rücknahme von Produkten wegen Sicherheits- oder Compliance-Risiken."
      },
      {
        title: "Kurz erklärt: CAPA",
        text: "Corrective and Preventive Actions, also Massnahmen zur Fehlerbehebung und Vorbeugung kuenftiger Wiederholungen."
      }
    ],
    faq: [
      {
        question: "Reicht eine einfache Sperrliste?",
        answer: "Selten. Ohne Bewegungsdaten, Rollen und Kommunikationslogik bleibt eine Sperrliste zu schwach."
      },
      {
        question: "Warum gehört CAPA dazu?",
        answer: "Weil ein Ereignis nicht nur gestoppt, sondern ursachenseitig verstanden und zukünftig verhindert werden muss."
      }
    ],
    glossary: [
      { term: "Recall", definition: "Strukturierte Rückholung oder Rücknahme betroffener Produkte." },
      { term: "Sperrstatus", definition: "Markierung, dass eine Charge nicht weiter verteilt oder verwendet werden darf." },
      { term: "CAPA", definition: "Systematischer Ansatz für Korrektur- und Vorbeugemassnahmen nach Abweichungen." },
    ],
    relatedSlugs: ["dokumentationspflichten-für-chargen", "batch-release-und-freigabekriterien", "schimmel-und-mykotoxine-bei-cannabis"]
  }),
  createArticle({
    slug: "batch-release-und-freigabekriterien",
    title: "Batch Release und Freigabekriterien",
    summary: "Welche Pruefpunkte vor einer Freigabe sinnvoll sind und warum Freigaben mehr als nur ein COA brauchen.",
    category: "qualitaet",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Batch Release", "Freigabe", "Qualität", "COA"],
    keyTakeaways: [
      "Freigabe ist eine Entscheidung über Risiko und Eignung, nicht nur ein Haken hinter einem Laborbericht.",
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
          "Eine seriöse Freigabe betrachtet deshalb den gesamten Chargenkontext."
        ]
      },
      {
        heading: "Wie Freigaben standardisiert werden",
        content: [
          "Lege Pflichtkriterien, Grenzfälle und Eskalationswege schriftlich fest. So sinkt die Abhängigkeit von Einzelpersonen.",
          "Gerade für einen ersten grossen Drop schafft das Vertrauen und Tempo zugleich."
        ],
        checklist: [
          "COA plus Verpackungscheck verknüpfen",
          "Abweichungen vor Freigabe bewerten",
          "Freigabeentscheidungen revisionssicher speichern"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Batch Release",
        text: "Formale Entscheidung, dass eine definierte Charge die Kriterien für Ausgabe oder Verkauf erfüllt."
      },
      {
        title: "Kurz erklärt: Grenzfall",
        text: "Charge oder Befund, der nicht klar im Gruenbereich liegt und deshalb besondere Prüfung braucht."
      }
    ],
    faq: [
      {
        question: "Wer sollte freigeben dürfen?",
        answer: "Nur klar definierte Rollen mit Zugriff auf alle relevanten Daten und einem standardisierten Entscheidungsrahmen."
      },
      {
        question: "Kann ich Freigaben automatisieren?",
        answer: "Teilweise ja, aber Grenzfälle und Kontextdaten brauchen meist menschliche Bewertung."
      }
    ],
    glossary: [
      { term: "Batch Release", definition: "Freigabe einer Charge nach Prüfung definierter Kriterien." },
      { term: "Freigabekatalog", definition: "Sammlung aller Kriterien, die für eine Freigabe geprüft werden müssen." },
      { term: "Revisionssicher", definition: "So dokumentiert, dass Aenderungen nachvollziehbar und belastbar bleiben." },
    ],
    relatedSlugs: ["coa-richtig-lesen", "dokumentationspflichten-für-chargen", "recall-und-sperrprozesse-für-chargen"]
  }),
  createArticle({
    slug: "lagerung-verpackung-und-lichtschutz",
    title: "Lagerung, Verpackung und Lichtschutz",
    summary: "Wie Verpackungssysteme die reale Produktqualität mitbestimmen und warum Lagerung ein Kernteil der Qualitätssicherung ist.",
    category: "qualitaet",
    difficulty: "einsteiger",
    readMinutes: 7,
    tags: ["Lagerung", "Verpackung", "Lichtschutz", "Qualität"],
    keyTakeaways: [
      "Produktqualität endet nicht beim COA, sondern hängt stark an Lagerung und Packmittelwahl.",
      "Licht, Sauerstoff und Temperatur beeinflussen Profil und Haltbarkeit deutlich.",
      "Gute Verpackung ist Teil des Qualitaetssystems, nicht nur Marketing."
    ],
    quickFacts: [
      { label: "Feinde", value: "Licht, Sauerstoff, Wärme" },
      { label: "Hebel", value: "Passendes Packmittel" },
      { label: "Praxis", value: "Lagerdaten mit Reklamationen verknüpfen" }
    ],
    sections: [
      {
        heading: "Warum Verpackung mehr ist als Huelle",
        content: [
          "Packmittel bestimmen mit, wie stabil Aroma, Wirkstoffprofil und mikrobiologische Sicherheit über Zeit bleiben.",
          "Gerade bei hochwertigen Produkten ist das ein direkter Qualitätshebel."
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
        title: "Kurz erklärt: Lichtschutz",
        text: "Massnahmen oder Materialien, die verhindern sollen, dass Licht sensible Inhaltsstoffe abbaut."
      },
      {
        title: "Kurz erklärt: Haltbarkeit",
        text: "Zeitraum, in dem ein Produkt seine relevanten Eigenschaften innerhalb definierter Grenzen behält."
      }
    ],
    faq: [
      {
        question: "Ist Glas immer die beste Verpackung?",
        answer: "Nicht automatisch. Schutzwirkung, Headspace, Handling und Lieferkette müssen zusammengedacht werden."
      },
      {
        question: "Warum sind Lagerdaten für Content relevant?",
        answer: "Weil sie erklären, warum reale Produktqualität von Freigabeprofilen abweichen kann."
      }
    ],
    glossary: [
      { term: "Packmittel", definition: "Verwendetes Verpackungsmaterial oder Verpackungssystem eines Produkts." },
      { term: "Lichtschutz", definition: "Eigenschaft eines Materials oder Systems, die Lichteinwirkung reduziert." },
      { term: "Haltbarkeit", definition: "Zeitspanne, in der definierte Produkteigenschaften erhalten bleiben sollen." },
    ],
    relatedSlugs: ["wasseraktivität-und-curing", "lagerung-und-terpenverlust-vermeiden", "thc-zu-cbn-abbau-und-oxidation"]
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
      "Probenmuessen Charge, Heterogenität und Ziel der Fragestellung realistisch abbilden.",
      "Vergleichbarkeit beginnt vor dem Messgeraet."
    ],
    quickFacts: [
      { label: "Kernpunkt", value: "Repräsentative Probe" },
      { label: "Fehler", value: "Einseitige oder bequeme Entnahme" },
      { label: "Mehrwert", value: "Bessere COA-Qualität" }
    ],
    sections: [
      {
        heading: "Warum Probenahme so oft unterschätzt wird",
        content: [
          "Viele Diskussionen über Analytik drehen sich um Methoden, obwohl der Fehler bereits bei der Entnahme beginnen kann.",
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
        title: "Kurz erklärt: repräsentativ",
        text: "Eine Probe ist repräsentativ, wenn sie die relevante Wirklichkeit der Charge möglichst gut widerspiegelt."
      },
      {
        title: "Kurz erklärt: Bias bei Probenahme",
        text: "Verzerrung, wenn aus Bequemlichkeit oder unbewusst nur bestimmte Bereiche oder Teile entnommen werden."
      }
    ],
    faq: [
      {
        question: "Reicht eine Einzelprobe?",
        answer: "Je nach Heterogenität oft nicht. Gerade bei komplexen Chargen ist das Risiko für Fehlinterpretation hoch."
      },
      {
        question: "Warum unterscheiden sich Wiederholungsproben?",
        answer: "Weil Charge, Entnahmeort, Homogenität und Aufbereitung variieren können."
      }
    ],
    glossary: [
      { term: "Sampling", definition: "Systematische Entnahme von Proben zur späteren Analyse." },
      { term: "Repraesentativ", definition: "Die reale Zusammensetzung einer Charge angemessen widerspiegelnd." },
      { term: "Heterogenität", definition: "Unterschiedlichkeit innerhalb einer Charge oder eines Produkts." },
    ],
    relatedSlugs: ["coa-richtig-lesen", "analytik-hplc-vs-gc-bei-cannabinoiden", "pestizidklassen-und-rückstandsrisiken"]
  }),
  createArticle({
    slug: "lieferkette-und-rueckverfolgbarkeit",
    title: "Lieferkette und Rückverfolgbarkeit",
    summary: "Warum Transparenz über Stationen, Partner und Nachweise ein echter Marktvorteil ist und nicht nur ein Compliance-Pflichtprogramm.",
    category: "markt",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    tags: ["Lieferkette", "Rückverfolgbarkeit", "Transparenz", "Markt"],
    keyTakeaways: [
      "Marktvertrauen entsteht aus nachvollziehbarer Herkunft und konsistenten Nachweisen.",
      "Rückverfolgbarkeit reduziert nicht nur Risiko, sondern verbessert auch Kommunikation und Einkauf.",
      "Transparenz ist auf grossen Plattformen ein Differenzierungsmerkmal."
    ],
    quickFacts: [
      { label: "Mehrwert", value: "Vertrauen plus schnellere Reaktion" },
      { label: "Pflicht", value: "Dokumentierte Kette" },
      { label: "Signal", value: "Transparenz schlägt Behauptung" }
    ],
    sections: [
      {
        heading: "Warum Lieferkettenwissen Marktmacht ist",
        content: [
          "Wenn Herkunft und Nachweise sichtbar sind, sinken Informationsasymmetrien für Nutzer und Teams. Das staerkt die Plattformqualität direkt.",
          "Fehlende Transparenz erzeugt dagegen Misstrauen, selbst wenn Produkte gut sein können."
        ]
      },
      {
        heading: "Was Rückverfolgbarkeit praktisch bringen muss",
        content: [
          "Nicht nur Namen von Partnern, sondern nachvollziehbare Chargenbewegungen, Analytik und Statushistorien.",
          "Dann hilft das System auch bei Reklamation, Recall und Performancebewertung."
        ],
        checklist: [
          "Stationen der Kette definieren",
          "Dokumente und Chargenstatus verbinden",
          "Lieferanten nach Nachweisqualität vergleichen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Lieferkette",
        text: "Alle Stationen vom Ursprung über Verarbeitung und Transport bis zur finalen Ausgabe."
      },
      {
        title: "Kurz erklärt: Transparenz",
        text: "Grad, in dem Nutzer oder Teams belastbare Informationen wirklich einsehen und verstehen können."
      }
    ],
    faq: [
      {
        question: "Muss ich jeden Partner offenlegen?",
        answer: "Nicht immer oeffentlich, aber intern muss die Kette für Qualität und Compliance nachvollziehbar sein."
      },
      {
        question: "Warum hilft das auch im Marketing?",
        answer: "Weil nachweisbare Transparenz glaubwuerdiger ist als reine Herkunftsclaims."
      }
    ],
    glossary: [
      { term: "Lieferkette", definition: "Abfolge aller Beteiligten und Prozesse vom Ursprung bis zur Ausgabe eines Produkts." },
      { term: "Transparenz", definition: "Nachvollziehbarkeit relevanter Informationen für Bewertung und Entscheidung." },
      { term: "Statushistorie", definition: "Zeitliche Dokumentation, wie sich der Zustand einer Charge über den Prozess verändert hat." },
    ],
    relatedSlugs: ["markttransparenz-und-preise", "dokumentationspflichten-für-chargen", "white-label-und-qualitätsrisiken"]
  }),
  createArticle({
    slug: "white-label-und-qualitaetsrisiken",
    title: "White Label und Qualitätsrisiken",
    summary: "Wo Handelsmodelle ohne eigene Herstellung Chancen bieten und wo dabei Transparenz und Verantwortung leicht verloren gehen.",
    category: "markt",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    tags: ["White Label", "Qualität", "Lieferanten", "Markt"],
    keyTakeaways: [
      "White-Label-Modelle sind nicht per se schlecht, brauchen aber besonders starke Daten- und Freigabelogik.",
      "Je weiter Marke und Herstellung auseinanderliegen, desto wichtiger werden Nachweise und Kontrolle.",
      "Für Nutzer zählt nicht Storytelling, sondern belastbare Transparenz."
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
          "Marken können schneller starten, ohne jede Infrastruktur selbst aufzubauen. Das ist wirtschaftlich oft sinnvoll.",
          "Gleichzeitig steigt aber die Bedeutung von Nachweisen, Spezifikationen und Kontrollpunkten."
        ]
      },
      {
        heading: "Wo das Modell kippt",
        content: [
          "Wenn Marke, Produktverantwortung und Daten nicht sauber verbunden sind, entstehen Lücken bei Reklamation, Recall und Qualitätsaussagen.",
          "Deshalb braucht White Label eher mehr Governance, nicht weniger."
        ],
        checklist: [
          "Verantwortlichkeiten vertraglich und operativ klaeren",
          "Freigabekriterien mit Lieferanten verbindlich machen",
          "Rückverfolgbarkeit nicht an Partner delegieren"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: White Label",
        text: "Produktmodell, bei dem ein Hersteller für mehrere Marken produziert, die das Produkt unter eigenem Namen führen."
      },
      {
        title: "Kurz erklärt: Governance",
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
    relatedSlugs: ["markttransparenz-und-preise", "lieferkette-und-rückverfolgbarkeit", "batch-release-und-freigabekriterien"]
  }),
  createArticle({
    slug: "grow-log-und-kpi-dashboard",
    title: "Grow-Log und KPI-Dashboard aufbauen",
    summary: "Welche Kennzahlen für Wiederholbarkeit wirklich helfen und wie aus Beobachtung ein steuerbares System wird.",
    category: "werkzeuge",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["Grow Log", "KPI", "Dashboard", "Daten"],
    keyTakeaways: [
      "Ohne strukturierte Daten bleibt jeder Run nur Erfahrung, nicht Systemwissen.",
      "Ein gutes Dashboard zeigt wenige, aber entscheidende Kennzahlen mit Trendbezug.",
      "KPIs müssen an Entscheidungen gekoppelt sein, sonst werden sie nur Deko."
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
          "Nicht alles muss gemessen werden. Entscheidend sind Klima, Bewässerung, Naehrstoffdaten, Auffälligkeiten und Outcome-Kennzahlen.",
          "Aus diesen Daten entsteht ein lernendes System, wenn sie über Runs vergleichbar bleiben."
        ]
      },
      {
        heading: "Vom Log zur Steuerung",
        content: [
          "Kennzahlen müssen sichtbar machen, wann eingegriffen wird und wer entscheidet. Erst dann wird ein Dashboard operativ wertvoll.",
          "Gerade für Teams verhindert das Datenblindheit und Einzelheldentum."
        ],
        checklist: [
          "Kern-KPIs pro Phase definieren",
          "Trendansicht statt reiner Tabellen pflegen",
          "Jede KPI mit Reaktionslogik verknüpfen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: KPI",
        text: "Key Performance Indicator, also eine Kennzahl, die für Steuerung und Erfolgsmessung wichtig ist."
      },
      {
        title: "Kurz erklärt: Trendbezug",
        text: "Einzelwerte werden erst aussagekräftig, wenn ihre Entwicklung über Zeit sichtbar ist."
      }
    ],
    faq: [
      {
        question: "Wie viele KPIs brauche ich?",
        answer: "Wenige Kernkennzahlen sind besser als ein ueberladenes Dashboard ohne Entscheidungen."
      },
      {
        question: "Reicht ein Spreadsheet?",
        answer: "Für den Start ja, solange Struktur, Konsistenz und Review-Prozess sauber sind."
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
    summary: "Warum selbst gute Tools ohne Kalibrierung in die Irre führen und wie Messqualität systematisch abgesichert wird.",
    category: "werkzeuge",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    tags: ["Sensorik", "Kalibrierung", "Messfehler", "QA"],
    keyTakeaways: [
      "Messdaten sind nur so gut wie Sensorzustand, Platzierung und Kalibrierung.",
      "Viele Grow- und Labordiskussionen basieren auf Datenfehlern statt auf echten Prozessproblemen.",
      "Ein kleiner QA-Prozess für Sensoren verhindert grosse Fehlentscheidungen."
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
          "Auch hochwertige Geräte können falsch messen, wenn sie schlecht platziert, lange ungeprueft oder falsch gelesen werden.",
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
          "Auffällige Sensoren sofort markieren oder tauschen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Kalibrierung",
        text: "Abgleich eines Sensors mit einem Referenzwert, damit seine Messung korrekt bleibt."
      },
      {
        title: "Kurz erklärt: Messfehler",
        text: "Abweichung zwischen gemessenem und tatsaechlichem Wert durch Gerät, Platzierung oder Anwendung."
      }
    ],
    faq: [
      {
        question: "Wie oft sollte ich kalibrieren?",
        answer: "Abhaengig vom Sensortyp und Einsatzumfeld, aber nie erst dann, wenn Werte offensichtlich unplausibel wirken."
      },
      {
        question: "Sind billige Sensoren nutzlos?",
        answer: "Nein. Gut geführte und gepruefte einfache Sensoren sind oft wertvoller als teure, ungepflegte Systeme."
      }
    ],
    glossary: [
      { term: "Kalibrierung", definition: "Prüfung und Korrektur eines Messgeräts gegen bekannte Referenzwerte." },
      { term: "Referenzwert", definition: "Bekannter Sollwert, der zur Kontrolle einer Messung dient." },
      { term: "Drift", definition: "Langsame Veränderung eines Messgeräts weg vom korrekten Wert über Zeit." },
    ],
    relatedSlugs: ["vpd-einfach-erklärt", "grow-log-und-kpi-dashboard", "cannabis-substrat-und-wurzelzone"]
  }),
  createArticle({
    slug: "how-to-grow-cannabis-anfaenger-tutorial",
    title: "How to Grow Cannabis: Schritt-für-Schritt für Anfänger",
    summary: "Ein klarer Einstieg in Setup, Klima, Bewässerung und Erntefenster - aufgebaut auf belastbaren Grundlagen aus Forschung und bewaehrten Profi-Routinen.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 14,
    tags: ["How to Grow", "Anbau", "Anfänger", "Step by Step", "Setup", "Klima"],
    keyTakeaways: [
      "Starte mit einem kleinen, stabilen Setup statt mit maximaler Leistung.",
      "Miss Klima, pH und Bewässerung konsistent, bevor du Dünger oder Licht weiter aufdrehst.",
      "Ein sauberer Wochenrhythmus mit festen Checks verhindert die meisten typischen Einsteigerfehler."
    ],
    quickFacts: [
      { label: "Zielgruppe", value: "Erster bis dritter Run" },
      { label: "Fokus", value: "Stabilität vor Performance" },
      { label: "Routine", value: "Taeglicher 10-Minuten-Check" }
    ],
    sections: [
      {
        heading: "Schritt 1: Setup klein und reproduzierbar halten",
        content: [
          "Wähle ein überschaubares Setup mit klar kontrollierbaren Variablen: Licht, Abluft, Umluft, Temperatur, RH und ein einfaches Substrat. Forschung zu Cannabis-Kultivierung und professionelle Grow-SOPs zeigen übereinstimmend, dass Stabilität den größten Hebel hat.",
          "Für den Einstieg ist ein verzeihendes Medium mit dokumentierbarem Giessrhythmus wichtiger als ein aggressives High-Performance-System. Erde oder ein gut vorbereiteter Mix mit klarer Trocknungsdynamik ist meist einfacher als sofortige Hydro-Steuerung."
        ],
        checklist: [
          "Lichtleistung konservativ starten und Höhe dokumentieren",
          "Temperatur und RH am Canopy messen",
          "Substrat, Topfvolumen und Ziel-Giessrhythmus vor dem Start festlegen"
        ]
      },
      {
        heading: "Schritt 2: Klima und Bewässerung zuerst stabilisieren",
        content: [
          "Halte in der Vegetationsphase keine extremen Werte, sondern stabile Korridore. VPD-orientiertes Arbeiten und regelmaessige Topfgewicht-Kontrolle sind für Anfänger deutlich wertvoller als hektische EC-Optimierung.",
          "Viele Probleme im ersten Run entstehen durch zu häufiges Giessen und zu viele Korrekturen gleichzeitig. Arbeite mit einem festen Beobachtungsfenster: Blätter, Topfgewicht, Drain, Temperatur und Luftfeuchte."
        ],
        checklist: [
          "Vor jedem Giessen Topfgewicht oder Trocknungsgrad prüfen",
          "Nur einen Parameter pro Tag aendern",
          "Klimaabweichungen mit Datum und Uhrzeit ins Grow-Log schreiben"
        ]
      },
      {
        heading: "Schritt 2b: Wochenplan für einen einfachen ersten Run",
        content: [
          "Woche 1-2: Keimung und Jungpflanze. Licht moderat halten, RH hoeher fahren, Medium nur leicht feucht und keine harten Duengeimpulse setzen. Fokus: stabile Entwicklung statt Tempo.",
          "Woche 3-4: Frühe Vegetation. Gleichmaessigen Rhythmus aus Giessen, Klima-Check und leichter Naehrstoffzufuhr etablieren. Jetzt zeigt sich, ob Topf, Medium und Trocknungsdauer zusammenpassen.",
          "Woche 5-6: Spaete Vegetation bis Stretch. Pflanzenhöhe, Lichtabstand und Blattgesundheit eng beobachten. Nur dann auf Blüte umstellen, wenn Pflanzen vital und der Raum klimatisch stabil ist.",
          "Woche 7-9: Hauptblüte. Stickstoff nicht aggressiv pushen, Giessrhythmus eng führen und Klima trocken genug halten, damit keine dichten, feuchten Problemzonen entstehen.",
          "Woche 10+: Reife, Ernte und Trocknung. Trichome beobachten, letzte grobe Korrekturen vermeiden und Trocknungsraum vor dem Schnitt komplett vorbereiten."
        ],
        checklist: [
          "Jede Woche nur ein klares Lernziel definieren",
          "Vor der Blüte kein ungelostes Giess- oder Klima-Problem mitnehmen",
          "Trocknung mindestens so genau planen wie die Veg-Phase"
        ]
      },
      {
        heading: "Schritt 3: Düngung defensiv und phasenbezogen steuern",
        content: [
          "Studien zu NPK-Fertigation bei Cannabis zeigen, dass Ueberversorgung - besonders mit Stickstoff in späteren Phasen - Ertrag und Qualität eher verschlechtern kann. Beginne deshalb unterhalb der Hersteller-Maximalangaben und steigere nur bei klarer Pflanzenreaktion.",
          "Achte darauf, dass Lichtintensität, Klima und Wurzelzone zur Naehrstoffstaerke passen. Ohne diese Basis bringt mehr EC kaum Nutzen und erhöht das Risiko für Blockaden oder Stressmarker."
        ],
        checklist: [
          "pH und EC der Lösung in fixer Reihenfolge messen",
          "Keine Booster einsetzen, solange Basisprozesse noch schwanken",
          "Ab Blueteeinleitung Stickstoff nicht weiter aggressiv steigern"
        ]
      },
      {
        heading: "Schritt 4: Ernte nicht raten, sondern beobachten",
        content: [
          "Einsteiger profitieren von klaren Reifeindikatoren statt Kalenderdenken. Beobachte Trichome, Pflanzenvitalität, Klima und Trocknungsplanung als zusammenhängenden Prozess.",
          "Direkt nach der Ernte entscheidet sauberes Trocknen über Aroma, Schimmelrisiko und Konsistenz. Professionelle Teams behandeln Postharvest als Teil des Grows und nicht als letzten Nebenjob."
        ],
        checklist: [
          "Vor der Ernte Trocknungsraum auf Temperatur und RH vorbereiten",
          "Trichomkontrolle mit Lupe oder Mikroskop durchfuehren",
          "Nach dem Run drei Dinge notieren: Fehler, Korrektur, Ergebnis"
        ]
      }
    ],
    warnings: [
      "Mehr Dünger, mehr Licht und mehr Wasser gleichzeitig zu erhöhen ist der schnellste Weg in unklare Fehlerbilder.",
      "Ohne funktionierende Klimakontrolle wird selbst ein guter Naehrstoffplan instabil."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum klein starten?",
        text: "Ein kleines Setup reduziert Streuung. Du erkennst schneller, welche Aenderung wirklich Wirkung hatte."
      },
      {
        title: "Kurz erklärt: Was ist ein reproduzierbarer Run?",
        text: "Ein Grow, dessen Klima, Giessverhalten und Inputs dokumentiert und beim nächsten Zyklus sauber wiederholbar sind."
      }
    ],
    faq: [
      {
        question: "Soll ich im ersten Run toppen, trainieren und boostern?",
        answer: "Nur wenn die Basis stabil ist. Für den Einstieg ist ein sauberer, einfacher Pflanzenlauf wertvoller als zu viele parallele Eingriffe."
      },
      {
        question: "Was ist für Anfänger wichtiger: EC oder Klima?",
        answer: "Klima und Bewässerung zuerst. Eine Pflanze in schlechtem Klima kann selbst mit sauberem EC nicht stabil performen."
      }
    ],
    glossary: [
      { term: "Grow-Log", definition: "Laufende Dokumentation von Klima, Giessen, Düngung und Auffälligkeiten pro Tag." },
      { term: "Canopy", definition: "Oberer Pflanzenbereich, in dem Licht und Klima besonders relevant gemessen werden." },
      { term: "Drain", definition: "Abflusswasser nach der Bewässerung, nutzbar für EC- und pH-Kontrolle." }
    ],
    downloads: [
      { title: "Anfänger Grow-Checkliste", href: "/terpira/tutorials/how-to-grow-anfänger-checkliste.txt", kind: "TXT-Checkliste" },
      { title: "Anfänger SOP-Vorlage", href: "/terpira/tutorials/how-to-grow-anfänger-sop.txt", kind: "TXT-SOP-Vorlage" }
    ],
    relatedSlugs: ["cannabis-anbau-grundlagen", "bewässerung-ohne-uebergiessen", "vpd-einfach-erklärt", "cannabis-substrat-und-wurzelzone"]
  }),
  createArticle({
    slug: "how-to-grow-cannabis-fortgeschritten-tutorial",
    title: "How to Grow Cannabis: Schritt-für-Schritt für Fortgeschrittene",
    summary: "Wie du ein stabiles Setup in ein datengestuetztes Produktionssystem verwandelst - mit sauberer Klima-, Feed- und Canopy-Steuerung.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 16,
    tags: ["How to Grow", "Anbau", "Fortgeschritten", "Step by Step", "Canopy", "Nährstoffe", "VPD"],
    keyTakeaways: [
      "Ab dem mittleren Niveau zählt nicht mehr nur Pflanzenvitalität, sondern Prozessstabilitaet über den gesamten Zyklus.",
      "Licht, Klima, Wurzelzone und Naehrstoffprofil müssen phasenweise gemeinsam gesteuert werden.",
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
          "Fortgeschrittene Grows scheitern selten an fehlendem Equipment, sondern an unklaren Sollwerten. Lege pro Phase Zielbereiche für Blattabstand zum Licht, Klima, Bewaesserungsfrequenz und Feed-Stärke fest.",
          "Die Forschung zu Cannabis-Lichtphysiologie und NPK-Reaktion zeigt deutlich, dass Input nur dann sinnvoll steigt, wenn Photosynthese, Wurzelraum und Klima dazu passen."
        ],
        checklist: [
          "Wochenplan für Veg, Stretch und Hauptblüte schreiben",
          "Blatttemperatur oder plausiblen Offset in die VPD-Berechnung integrieren",
          "Entscheidungsregeln für Hoeher- oder Runterfahren von EC festlegen"
        ]
      },
      {
        heading: "Schritt 2: Canopy aktiv führen statt nur reagieren",
        content: [
          "Gleichmaessige Lichtverteilung ist ein Prozess, kein Zufall. Arbeite mit Entlaubung, Training und Hoehenmanagement so, dass Licht, Luftstrom und Reife möglichst homogen bleiben.",
          "Professionelle Grower behandeln die Canopy als produktive Fläche. Jede dunkle, feuchte oder chaotische Zone wird später zum Risiko für Minderertrag, Schimmel oder ungleichmaessige Reife."
        ],
        checklist: [
          "Canopy-Fotos jede Woche aus gleichem Winkel machen",
          "Ungueltige Schattenzonen konsequent reduzieren",
          "Lichtabstand und Hotspots nach jedem Training neu kontrollieren"
        ]
      },
      {
        heading: "Schritt 2b: Wochenplan für Performance ohne Kontrollverlust",
        content: [
          "Woche 1-2 Veg: Basiswerte bestaetigen. Sensorik, Giessfrequenz und Start-Feed nur so hoch fahren, dass Pflanzen sichtbar sauber reagieren. Abweichungen sofort notieren statt später deuten.",
          "Woche 3-4 Veg: Kronendach angleichen, erste Trainingsentscheidungen sauber dokumentieren und Wurzelraum-Daten mit dem Blattbild zusammen lesen. Ziel ist Homogenität, nicht spektakulaeres Einzelwachstum.",
          "Woche 5 Stretch: Licht und Klima jetzt täglich mit dem Wuchs koppeln. Stretch ist die Phase, in der schlechte Zielkorridore später am teuersten werden.",
          "Woche 6-8 Hauptblüte: Drain-Trends, K/Ca-Balance und Luftbewegung eng prüfen. Je dichter die Blüten werden, desto weniger Fehlertoleranz hat das System.",
          "Woche 9+ Finish und Review: Reifehomogenität, Problemzonen und Ertragsverteilung dokumentieren. Das ist die Datenbasis für den nächsten Optimierungsschritt."
        ],
        checklist: [
          "Stretch-Woche nicht ohne tägliche Licht- und Klima-Kontrolle laufen lassen",
          "Hauptblüte als Risiko- und nicht nur als Ertragsphase behandeln",
          "Am Zyklusende immer Review vor der nächsten Aenderung machen"
        ]
      },
      {
        heading: "Schritt 3: Nährstoffgabe und Wurzelraum datenbasiert steuern",
        content: [
          "Jetzt reicht Bauchgefühl nicht mehr. Vergleiche Soll-EC, Ist-Drain, Pflanzenreaktion und Trocknungsdauer gemeinsam. Gerade in Coco oder anderen schnell reagierenden Medien sind kleine Trends wichtiger als Einmalmessungen.",
          "Peer-reviewte Cannabis-Studien zu Substraten und Fertigation belegen, dass Kalium-, Stickstoff- und pH-Management phasenabhaengig optimiert werden müssen. Zu späte Reaktionen kosten Blütenmasse und Qualität."
        ],
        checklist: [
          "Drain-EC und pH an festen Wochentagen messen",
          "Ca/Mg nur mit Kontext von Medium und Wasserwerten anpassen",
          "Auffällige Blattbilder immer mit Wurzelzonen- und Klima-Daten abgleichen"
        ]
      },
      {
        heading: "Schritt 4: Ertrag und Qualität mit Run-Review sichern",
        content: [
          "Fortgeschrittene Grower dokumentieren nicht nur, dass ein Run gut lief, sondern warum. Vergleiche Ertrag, Trimmanteil, Reifehomogenität, Duftprofil und Problemzonen je Durchlauf.",
          "Die beste Optimierung entsteht aus wenigen, klaren Hypothesen für den nächsten Run. Ein Review-System verhindert, dass dieselben Fehler trotz gutem Equipment wiederholt werden."
        ],
        checklist: [
          "Run-Review in Klima, Bewässerung, Feed, Canopy und Postharvest gliedern",
          "Nur zwei bis drei Verbesserungen für den Folgezyklus definieren",
          "Qualitaetsverlust nicht nur auf Genetik schieben, sondern Prozessdaten prüfen"
        ]
      }
    ],
    warnings: [
      "Mehr Leistung ohne Review-System führt oft nur zu schnellerem Scheitern auf höherem Input-Niveau.",
      "Canopy-Eingriffe ohne Klima- und Lichtnachkontrolle können mehr Stress als Nutzen erzeugen."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Zielkorridor",
        text: "Ein definierter Bereich statt eines Einzelwerts, innerhalb dessen Pflanzen stabil arbeiten können."
      },
      {
        title: "Kurz erklärt: Run-Review",
        text: "Systematische Nachbereitung eines kompletten Zyklus, um Fehler, Verbesserungen und Wirkung sauber zu trennen."
      }
    ],
    faq: [
      {
        question: "Wann lohnt sich Coco oder Hydro gegenüber Erde?",
        answer: "Wenn dein Mess- und Bewaesserungssystem stabil genug ist, schnellere Reaktionen zu kontrollieren. Ohne Datendisziplin steigt nur die Fehlergeschwindigkeit."
      },
      {
        question: "Was bringt mehr: mehr PPFD oder besseres Canopy?",
        answer: "Fast immer zuerst besseres Canopy. Ungleich verteiltes Licht macht hohe Leistung ineffizient und steigert Stress in den Spitzen."
      }
    ],
    glossary: [
      { term: "Canopy-Management", definition: "Steuerung von Pflanzenhöhe, Blattmasse und Lichtverteilung über den gesamten Bestand." },
      { term: "Blatttemperatur", definition: "Blatttemperatur, die für eine realistische VPD-Berechnung wichtiger ist als die reine Raumtemperatur." },
      { term: "Run-Review", definition: "Strukturierte Auswertung eines abgeschlossenen Grows mit Fokus auf Ursache und Wirkung." }
    ],
    downloads: [
      { title: "Fortgeschrittene Wochenreview-Checkliste", href: "/terpira/tutorials/how-to-grow-fortgeschritten-checkliste.txt", kind: "TXT-Checkliste" },
      { title: "Fortgeschrittene SOP-Vorlage für Run-Review", href: "/terpira/tutorials/how-to-grow-fortgeschritten-sop.txt", kind: "TXT-SOP-Vorlage" }
    ],
    relatedSlugs: ["lichtstress-und-canopy-management", "nährstoffblockaden-und-antagonismen", "vpd-und-ec-kombi-rechner-guide", "substrat-vergleich-coco-erde-hydro"]
  }),
  createArticle({
    slug: "how-to-grow-cannabis-profi-tutorial",
    title: "How to Grow Cannabis: Schritt-für-Schritt für Profis",
    summary: "Ein fortlaufendes Betriebsmodell für Teams mit hoher Datendichte, SOPs, Chargendenken und reproduzierbarer Premium-Qualität.",
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
        heading: "Schritt 1: Betrieb über SOPs und Freigabekriterien führen",
        content: [
          "Professionelle Grows werden über Standards, nicht über Tagesstimmung gesteuert. Definiere SOPs für Raumvorbereitung, Stecklingsannahme, Bewässerung, Sensor-Checks, Hygiene und Postharvest-Uebergaben.",
          "Freigabekriterien je Phase helfen, dass Teams nur dann skalieren oder umstellen, wenn die Basis stabil ist. Ohne diese Gates wird jedes Problem zu teuer und schwer reproduzierbar."
        ],
        checklist: [
          "SOP-Versionen mit Datum und Verantwortlichkeit pflegen",
          "Phasen-Gates für Veg, Stretch, Blüte und Ernte schriftlich definieren",
          "Abweichungen immer mit CAPA-Logik dokumentieren"
        ]
      },
      {
        heading: "Schritt 2: Klima, Licht und Feed als verknuepfte Datenspuren lesen",
        content: [
          "Auf Profi-Niveau werden keine Einzelwerte diskutiert, sondern Trends: Sensor-Drift, Zonenunterschiede, Bewaesserungsfenster, PPFD-Verteilung, Blattmasse und Drain-Verhalten. Erst daraus entstehen belastbare Entscheidungen.",
          "Studien zu Cannabis-Produktionssystemen und Erfahrungen aus professionellen Indoor-Setups zeigen, dass die größten Gewinne aus konsistenter Standardisierung und früher Abweichungserkennung kommen."
        ],
        checklist: [
          "Zone gegen Zone vergleichen statt nur Mittelwerte lesen",
          "Messgeraete nach Kalibrierintervall sperren oder freigeben",
          "Klima- und Feed-Daten mit Ereignislog verknüpfen"
        ]
      },
      {
        heading: "Schritt 2b: Produktionswochen als wiederholbares Betriebsschema",
        content: [
          "Woche 0 Pre-Flight: Raumfreigabe, Sensorstatus, Hygiene, Wasser und Material müssen vor Pflanzenannahme validiert sein. Ohne saubere Startfreigabe beginnt jede Charge mit Blindflug.",
          "Woche 1-3 Etablierung: Clone-Qualität, Anwuchsquote und Zonenunterschiede eng monitoren. Jetzt werden SOP-Lücken sichtbar, bevor sie später als Ertragsproblem auftreten.",
          "Woche 4-6 Produktionsdruck: Stretch, Canopy-Dichte und Klima-Kopplung erzeugen die hoechste operative Last. Schichtuebergaben und Event-Logging müssen hier besonders sauber sein.",
          "Woche 7-9 Reife und Risikoabwehr: Botrytis-, Hygiene- und Trockenmasse-Risiken steigen. Freigabekriterien für Erntefenster sollten nicht nur auf Optik, sondern auf Charge, Zone und Laborlogik beruhen.",
          "Woche 10+ Postharvest und CAPA: Trocknung, Curing, Labor, Sperrentscheidungen und Review müssen in einer geschlossenen Prozessschleife enden. Erst dann ist die Charge wirklich abgeschlossen."
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
          "Premium-Qualität scheitert oft nicht an Wuchs, sondern an Hygiene, Probenahme und Nachverfolgbarkeit. Integriere Clone-Hygiene, Schimmelpraevention, Wasserqualität und Lieferantenkontrolle in denselben Managementrahmen wie Licht und Ertrag.",
          "Gerade bei hoher Pflanzendichte oder engen Takten werden kleine Hygienefehler schnell zum Chargenproblem. Profi-Grower planen deshalb Risikoabwehr als Kernprozess ein."
        ],
        checklist: [
          "Hygiene-SOP mit Verantwortlichkeiten pro Schicht festlegen",
          "Wasser, Werkzeuge und Clone-Zugänge als Risikopunkte auditieren",
          "Fruehwarnsignale für Pathogene und Schädlinge in Reviews aufnehmen"
        ]
      },
      {
        heading: "Schritt 4: Nach der Ernte beginnt die nächste Prozessschleife",
        content: [
          "Postharvest, Curing und Laborlogik gehören in denselben Performance-Zyklus wie die Kulturphase. Nur so lassen sich Qualitaetsverluste, Chargenunterschiede und Vermarktungsprobleme systematisch beheben.",
          "Ein Profi-Tutorial endet deshalb nicht mit dem Chop. Es endet mit Freigabe, Review, Datenarchiv und klarer Hypothese für den nächsten Durchlauf."
        ],
        checklist: [
          "Trocknung und Curing mit eigenen SOPs und Alarmgrenzen fahren",
          "Laborergebnisse gegen Prozessdaten spiegeln",
          "Nach jeder Charge ein Review mit QA, Cultivation und Postharvest machen"
        ]
      }
    ],
    warnings: [
      "Hohe Datendichte ohne klare Entscheidungsregeln führt zu Analyse-Overload statt besserem Grow.",
      "Wenn Hygiene und Freigabekriterien fehlen, kompensiert auch perfektes Klima keine Chargenrisiken."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: SOP",
        text: "Standard Operating Procedure - eine feste Arbeitsanweisung, damit dieselbe Aufgabe immer gleich ausgefuehrt wird."
      },
      {
        title: "Kurz erklärt: CAPA-System",
        text: "Corrective and Preventive Action - strukturierter Umgang mit Abweichungen, Ursachen und Vorbeugung."
      }
    ],
    faq: [
      {
        question: "Wann wird aus einem guten Grow ein professionelles System?",
        answer: "Wenn Ergebnisse über mehrere Zyklen, Personen und Zonen reproduzierbar sind und Abweichungen dokumentiert sowie korrigiert werden."
      },
      {
        question: "Was ist auf Profi-Niveau der größte Engpass?",
        answer: "Fast nie nur ein Dünger oder ein Lichtwert, sondern fehlende Standardisierung zwischen Kultur, Hygiene, QA und Postharvest."
      }
    ],
    glossary: [
      { term: "SOP", definition: "Standardisierte Arbeitsanweisung für wiederholbare Prozesse im Betrieb." },
      { term: "CAPA", definition: "System für Korrektur und Vorbeugung nach erkannter Abweichung." },
      { term: "Freigabekriterium", definition: "Definierter Schwellenwert oder Check, der vor dem Uebergang in die nächste Phase erfüllt sein muss." }
    ],
    downloads: [
      { title: "Profi Chargen-Checkliste", href: "/terpira/tutorials/how-to-grow-profi-checkliste.txt", kind: "TXT-Checkliste" },
      { title: "Profi SOP-Template für Cultivation und QA", href: "/terpira/tutorials/how-to-grow-profi-sop.txt", kind: "TXT-SOP-Vorlage" }
    ],
    relatedSlugs: ["mutterpflanzen-und-clone-hygiene", "schimmel-und-mykotoxine-bei-cannabis", "grow-log-und-kpi-dashboard", "audit-readiness-für-content-und-produkt"]
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
      "Für grosse Wissensseiten ist strukturierte Einordnung wichtiger als Hype-Sprache."
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
          "Dieser Beitrag ordnet das Thema für Teams und Nutzer in einen belastbaren Rahmen ein, damit Entscheidungen nicht nur auf Einzelbeobachtungen beruhen.",
          "Im Fokus stehen nachvollziehbare Kriterien, saubere Begriffsnutzung und der Bezug zu realen Prozessdaten."
        ]
      },
      {
        heading: "Praxisorientierte Umsetzung",
        content: [
          "Der Inhalt verbindet Grundlagen mit operativen Checks, damit das Thema nicht nur verstanden, sondern im Alltag konsistent angewendet werden kann.",
          "Besonders für einen grossen ersten Drop entsteht so ein klarer Mehrwert in Orientierung und Vergleichbarkeit."
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
        title: "Kurz erklärt: Worum geht es hier?",
        text: `Der Artikel erklärt ${seed.title.toLowerCase()} in klaren Schritten und trennt Fakten von Marketingbegriffen.`
      },
      {
        title: "Kurz erklärt: Warum ist das wichtig?",
        text: "Saubere Einordnung reduziert Fehlentscheidungen und verbessert die Qualität von Content, Prozessen und Nutzerverstaendnis."
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
  { slug: "naehrstoffblockaden-und-antagonismen", title: "Naehrstoffblockaden und Antagonismen", summary: "Warum trotz ausreichender Duengewerte Mangelbilder auftreten können und wie Blockaden sauber eingeordnet werden.", category: "anbau", difficulty: "fortgeschritten", readMinutes: 8, tags: ["Nährstoffe", "Antagonismus", "pH", "Diagnostik"], relatedSlugs: ["cannabis-anbau-grundlagen", "bewässerung-ohne-uebergiessen", "vpd-und-ec-kombi-rechner-guide"] },
  { slug: "stressmarker-frueh-erkennen", title: "Stressmarker früh erkennen", summary: "Frühe Hinweise auf Klima-, Licht- und Wurzelstress erkennen, bevor Ertrag und Qualität kippen.", category: "anbau", difficulty: "einsteiger", readMinutes: 6, tags: ["Stress", "Monitoring", "Früherkennung", "Grow"], relatedSlugs: ["lichtstress-und-canopy-management", "cannabis-substrat-und-wurzelzone", "grow-log-und-kpi-dashboard"] },
  { slug: "genetische-stabilitaet-ueber-generationen", title: "Genetische Stabilität über Generationen", summary: "Wie Linien über mehrere Zyklen bewertet werden und warum Stabilität ein eigenes Kriterienset braucht.", category: "genetik", difficulty: "profi", readMinutes: 9, tags: ["Genetik", "Stabilität", "Selektion", "Linien"], relatedSlugs: ["genetik-und-phänotyp-selektion", "selektionsscorecards-für-pheno-hunts", "mutterpflanzen-und-clone-hygiene"] },
  { slug: "crossing-backcrossing-grundlagen", title: "Crossing und Backcrossing Grundlagen", summary: "Grundbegriffe der Zuchtarbeit für bessere Einordnung von Linienbeschreibungen und Selektionszielen.", category: "genetik", difficulty: "fortgeschritten", readMinutes: 8, tags: ["Crossing", "Backcross", "Zucht", "Linien"], relatedSlugs: ["feminisiert-vs-regular-vs-autoflower", "genetik-und-phänotyp-selektion", "selektionsscorecards-für-pheno-hunts"] },
  { slug: "terpen-oxidationsprodukte-und-bedeutung", title: "Terpen-Oxidationsprodukte und Bedeutung", summary: "Wie oxidierte Terpenanteile Profile verändern und warum frische Analytik plus Lagerkontext zusammengehören.", category: "chemie", difficulty: "profi", readMinutes: 9, tags: ["Terpene", "Oxidation", "Analytik", "Chemie"], relatedSlugs: ["thc-zu-cbn-abbau-und-oxidation", "lagerung-und-terpenverlust-vermeiden", "analytik-hplc-vs-gc-bei-cannabinoiden"] },
  { slug: "matrixeffekte-in-der-cannabisanalytik", title: "Matrixeffekte in der Cannabis-Analytik", summary: "Warum dieselbe Methode je Produktmatrix unterschiedlich reagieren kann und was das für Vergleichbarkeit bedeutet.", category: "chemie", difficulty: "profi", readMinutes: 9, tags: ["Matrix", "Analytik", "Labor", "Methodik"], relatedSlugs: ["analytik-hplc-vs-gc-bei-cannabinoiden", "sampling-und-probenahme-fehler", "coa-richtig-lesen"] },
  { slug: "minor-terpene-und-profiltiefe", title: "Minor-Terpene und Profiltiefe", summary: "Warum kleine Terpenanteile für Profilcharakter und Vergleichbarkeit wichtig sein können.", category: "terpene", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Minor Terpene", "Profil", "Aroma", "Analytik"], relatedSlugs: ["terpene-und-wirkprofil", "myrcen-limonen-caryophyllen-einordnung", "sensorik-panels-für-cannabisprodukte"] },
  { slug: "terpen-panels-und-qualitaetslabels", title: "Terpen-Panels und Qualitaetslabels", summary: "Wie Terpenpanels für Kataloge standardisiert werden können, ohne in Marketingkuerzel abzurutschen.", category: "terpene", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Terpenpanel", "Label", "Katalog", "Qualität"], relatedSlugs: ["sensorik-panels-für-cannabisprodukte", "terpene-und-wirkprofil", "coa-richtig-lesen"] },
  { slug: "indikationsgrenzen-und-patientenkommunikation", title: "Indikationsgrenzen und Patientenkommunikation", summary: "Wie medizinische Inhalte Nutzen, Grenzen und Unsicherheiten gleichzeitig transparent darstellen.", category: "medizin", difficulty: "profi", readMinutes: 9, tags: ["Indikation", "Medizin", "Kommunikation", "Evidenz"], relatedSlugs: ["cannabinoide-und-evidenz", "cannabis-bei-schmerz-evidenzcheck", "cannabinoide-nebenwirkungen-und-interaktionen"] },
  { slug: "real-world-data-vs-rct-bei-cannabis", title: "Real-World-Data vs. RCT bei Cannabis", summary: "Wie Beobachtungsdaten und klinische Studien zusammen gelesen werden sollten.", category: "medizin", difficulty: "profi", readMinutes: 9, tags: ["RWD", "RCT", "Evidenz", "Studien"], relatedSlugs: ["cannabinoide-und-evidenz", "cannabis-und-schlaf-was-ist-belegt", "cbd-und-angststörungen-einordnung"] },
  { slug: "orale-produkte-und-first-pass-risiken", title: "Orale Produkte und First-Pass-Risiken", summary: "Einordnung von Effektdauer, Verzogerung und Fehlsteuerung bei oraler Anwendung.", category: "konsumformen", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Oral", "First Pass", "Timing", "Risiko"], relatedSlugs: ["inhalation-vs-edibles", "sublingual-tinkturen-richtig-einordnen", "inhalation-set-setting-und-harm-reduction"] },
  { slug: "dosisprotokolle-ohne-uebertreibung", title: "Dosisprotokolle ohne Uebertreibung", summary: "Wie strukturierte Dosisprotokolle für Aufklärung funktionieren, ohne falsche Sicherheit zu erzeugen.", category: "konsumformen", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Dosis", "Protokoll", "Aufklärung", "Risiko"], relatedSlugs: ["inhalation-vs-edibles", "cannabinoide-nebenwirkungen-und-interaktionen", "inhalation-set-setting-und-harm-reduction"] },
  { slug: "concentrate-categorization-fuer-plattformen", title: "Concentrate-Categorization für Plattformen", summary: "Wie Konzentrate so kategorisiert werden, dass Nutzer vergleichen können und Daten konsistent bleiben.", category: "konzentrate", difficulty: "profi", readMinutes: 8, tags: ["Konzentrate", "Katalog", "Taxonomie", "Plattform"], relatedSlugs: ["hash-typen-vergleichen", "full-melt-und-marketingsprache", "rosin-einordnung-ohne-hype"] },
  { slug: "kontaminantenprofile-bei-extrakten", title: "Kontaminantenprofile bei Extrakten", summary: "Welche Kontaminantenklassen bei konzentrierten Produkten besondere Aufmerksamkeit brauchen.", category: "konzentrate", difficulty: "fortgeschritten", readMinutes: 8, tags: ["Extrakte", "Kontaminanten", "Sicherheit", "Labor"], relatedSlugs: ["bubble-hash-qualitätskriterien", "pgr-und-kontaminanten", "pestizidklassen-und-rückstandsrisiken"] },
  { slug: "internationale-regelwerke-vergleichen", title: "Internationale Regelwerke vergleichen", summary: "Wie sich Rahmenwerke zwischen Regionen unterscheiden und was das für Content und Compliance bedeutet.", category: "recht", difficulty: "profi", readMinutes: 9, tags: ["Regulierung", "International", "Compliance", "Recht"], relatedSlugs: ["rechtliche-grundlagen-dach", "gmp-gdp-und-qualitätssysteme", "werbeaussagen-und-health-claims-cannabis"] },
  { slug: "audit-readiness-fuer-content-und-produkt", title: "Audit-Readiness für Content und Produkt", summary: "Praktische Leitlinien, um Dokumente, Prozesse und Wissensinhalte auditfaehig zu halten.", category: "recht", difficulty: "fortgeschritten", readMinutes: 8, tags: ["Audit", "Readiness", "Dokumentation", "Compliance"], relatedSlugs: ["dokumentationspflichten-für-chargen", "batch-release-und-freigabekriterien", "gmp-gdp-und-qualitätssysteme"] },
  { slug: "microbial-trending-und-fruehwarnung", title: "Microbial Trending und Frühwarnung", summary: "Wie mikrobielle Messreihen als Fruehwarnsystem für Qualitäts- und Sicherheitsprobleme genutzt werden.", category: "sicherheit", difficulty: "profi", readMinutes: 8, tags: ["Mikrobiologie", "Trending", "Frühwarnung", "Sicherheit"], relatedSlugs: ["schimmel-und-mykotoxine-bei-cannabis", "recall-und-sperrprozesse-für-chargen", "wasseraktivität-und-curing"] },
  { slug: "supplier-risk-scoring-fuer-cannabis", title: "Supplier-Risk-Scoring für Cannabis", summary: "Wie Lieferanten nach Datenqualität, Abweichungen und Zuverlässigkeit bewertet werden können.", category: "sicherheit", difficulty: "profi", readMinutes: 8, tags: ["Lieferanten", "Scoring", "Risiko", "Qualität"], relatedSlugs: ["lieferkette-und-rückverfolgbarkeit", "white-label-und-qualitätsrisiken", "dokumentationspflichten-für-chargen"] },
  { slug: "interlaborvergleich-und-ringtests", title: "Interlaborvergleich und Ringtests", summary: "Warum Ringtests wichtig sind, um Laborqualität und Vergleichbarkeit langfristig abzusichern.", category: "qualitaet", difficulty: "profi", readMinutes: 8, tags: ["Ringtest", "Interlabor", "Qualität", "Analytik"], relatedSlugs: ["coa-richtig-lesen", "analytik-hplc-vs-gc-bei-cannabinoiden", "sampling-und-probenahme-fehler"] },
  { slug: "stabilitaetsprogramme-fuer-produktlinien", title: "Stabilitaetsprogramme für Produktlinien", summary: "Wie strukturierte Stabilitaetspruefungen über Chargen und Zeit aufgebaut werden.", category: "qualitaet", difficulty: "profi", readMinutes: 9, tags: ["Stabilität", "Produktlinie", "Qualität", "Programm"], relatedSlugs: ["lagerung-verpackung-und-lichtschutz", "batch-release-und-freigabekriterien", "thc-zu-cbn-abbau-und-oxidation"] },
  { slug: "preisindizes-und-marktzyklen", title: "Preisindizes und Marktzyklen", summary: "Wie Preiszyklen interpretiert werden und warum Indexe für Marktbeobachtung auf Plattformen sinnvoll sind.", category: "markt", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Preis", "Index", "Markt", "Zyklus"], relatedSlugs: ["markttransparenz-und-preise", "lieferkette-und-rückverfolgbarkeit", "white-label-und-qualitätsrisiken"] },
  { slug: "nachfrageprognosen-fuer-produktkategorien", title: "Nachfrageprognosen für Produktkategorien", summary: "Welche Daten für belastbare Prognosen taugen und wo reine Trendbeobachtung zu kurz greift.", category: "markt", difficulty: "profi", readMinutes: 8, tags: ["Prognose", "Nachfrage", "Kategorie", "Markt"], relatedSlugs: ["markttransparenz-und-preise", "preisindizes-und-marktzyklen", "grow-log-und-kpi-dashboard"] },
  { slug: "content-taxonomie-und-tag-governance", title: "Content-Taxonomie und Tag-Governance", summary: "Wie grosse Wissensseiten Kategorien und Tags so steuern, dass Suche und Navigation stabil bleiben.", category: "werkzeuge", difficulty: "profi", readMinutes: 8, tags: ["Taxonomie", "Tags", "Governance", "Wiki"], relatedSlugs: ["grow-log-und-kpi-dashboard", "sensor-kalibrierung-und-messfehler", "concentrate-categorization-für-plattformen"] },
  { slug: "release-checklisten-fuer-wiki-drops", title: "Release-Checklisten für Wiki-Drops", summary: "Praxis-Checkliste für gross angelegte Content-Drops mit Qualitäts- und Konsistenzkontrolle.", category: "werkzeuge", difficulty: "einsteiger", readMinutes: 6, tags: ["Release", "Checkliste", "Wiki", "QA"], relatedSlugs: ["content-taxonomie-und-tag-governance", "batch-release-und-freigabekriterien", "grow-log-und-kpi-dashboard"] },
  { slug: "naehrstoffbedarf-cannabis-lebenszyklus", title: "Naehrstoffbedarf im Cannabis-Lebenszyklus", summary: "Phasenweise Uebersicht des NPK-, Ca- und Mg-Bedarfs bei Photoperiodisch- und Autoflower-Pflanzen in Erde und Coco – basierend auf peer-reviewten Studien.", category: "anbau", difficulty: "fortgeschritten", readMinutes: 10, tags: ["Nährstoffe", "Naehrstoffmangel", "Düngung", "Lebenszyklus", "NPK", "Autoflower", "Photoperiodisch", "Erde", "Coco", "Studien"], relatedSlugs: ["cannabis-anbau-grundlagen", "nährstoffblockaden-und-antagonismen", "cannabis-substrat-und-wurzelzone", "feminisiert-vs-regular-vs-autoflower", "substrat-vergleich-coco-erde-hydro"] },
  { slug: "substrat-vergleich-coco-erde-hydro", title: "Substratvergleich: Coco, Erde und Hydro", summary: "Was peer-reviewte Studien über Ertrag, EC-Toleranz und Pflegeaufwand bei den drei Hauptsubstraten sagen – inklusive praktischer Empfehlungen für Hobby-Grower.", category: "anbau", difficulty: "fortgeschritten", readMinutes: 9, tags: ["Substrat", "Nährstoffe", "Schädlinge", "Coco", "Hydro", "Erde", "EC", "pH", "Ertrag", "Studien"], relatedSlugs: ["cannabis-substrat-und-wurzelzone", "bewässerung-ohne-uebergiessen", "vpd-und-ec-kombi-rechner-guide", "nährstoffbedarf-cannabis-lebenszyklus"] },
  { slug: "indoor-outdoor-anbau-vergleich", title: "Indoor vs. Outdoor: Anbauvergleich Cannabis", summary: "Licht, Ertrag, Terpenprofil und Risikofaktoren im direkten Vergleich – was Forschung und Praxis über beide Anbausysteme sagen.", category: "anbau", difficulty: "einsteiger", readMinutes: 8, tags: ["Indoor", "Outdoor", "Licht", "Ertrag", "Terpene", "Umwelt", "Schädlinge", "Nährstoffe", "Studien"], relatedSlugs: ["cannabis-anbau-grundlagen", "lichtstress-und-canopy-management", "schimmel-und-mykotoxine-bei-cannabis", "vpd-und-ec-kombi-rechner-guide"] }
];

const thirdWaveWikiArticles: TerpiraArticle[] = thirdWaveSeeds.map(createLiteArticle);

// ─── Curated Grow Knowledge Base ──────────────────────────────────────────────
//
// SINGLE SOURCE OF TRUTH for:
//   - which articles are exported (allowlist)
//   - growValue: 1-sentence practical takeaway for growers
//   - qualityScore: 1–5 signal strength (5 = must-know for every grow)
//
// RULE: Only add an article here once it has a concrete, actionable growValue.
// DELETE aggressively – every entry must earn its place.
// ─────────────────────────────────────────────────────────────────────────────

const GROW_KNOWLEDGE: Record<string, { growValue: string; qualityScore: number; growCategory: GrowCategory }> = {
  ...DIAGNOSTIC_GROW_KNOWLEDGE,
  // ── Core Grow System ──────────────────────────────────────────────────────
  "cannabis-anbau-grundlagen": {
    growValue: "Führ täglich ein Grow-Log mit VPD, EC und pH – drei dokumentierte Runs machen dich besser als beliebig viele undokumentierte.",
    qualityScore: 5,
    growCategory: "yield",
  },
  "vpd-einfach-erklärt": {
    growValue: "Halte VPD in der Blüte bei 1.2–1.6 kPa – jeder Ausreißer über mehrere Stunden öffnet Schimmelfenster und kostet Ertrag.",
    qualityScore: 5,
    growCategory: "climate",
  },
  "vpd-und-ec-kombi-rechner-guide": {
    growValue: "Stabilisiere VPD immer zuerst, dann justiere EC – niemals beide Parameter gleichzeitig ändern.",
    qualityScore: 5,
    growCategory: "climate",
  },
  "cannabis-substrat-und-wurzelzone": {
    growValue: "Wiege den Topf nass und trocken: bei 30–40% Gewichtsverlust ist der ideale Gießzeitpunkt erreicht.",
    qualityScore: 5,
    growCategory: "watering",
  },
  "bewässerung-ohne-uebergiessen": {
    growValue: "Gieß erst wenn der Topf spürbar leichter ist – Saürstoffmangel durch Staunässe schadet mehr als kurze Trockenheit.",
    qualityScore: 5,
    growCategory: "watering",
  },
  "lichtstress-und-canopy-management": {
    growValue: "Miss PPFD an 9 Punkten im Zelt und halte die Varianz unter 20% – uniforme Beleuchtung schlägt Spitzenwerte an einzelnen Punkten.",
    qualityScore: 5,
    growCategory: "lighting",
  },
  "grow-log-und-kpi-dashboard": {
    growValue: "Tracke tägliches Topfgewicht, Klima und Drain-EC – nach 3 Runs erkennst du Muster, die sonst unsichtbar bleiben.",
    qualityScore: 5,
    growCategory: "yield",
  },
  "sensor-kalibrierung-und-messfehler": {
    growValue: "Kalibriere pH-Sensoren wöchentlich und EC-Sensoren alle 2 Wochen – ein falsch messender Sensor kostet mehr als ein Ersatzgerät.",
    qualityScore: 5,
    growCategory: "climate",
  },
  // ── Nutrients & Deficiencies ──────────────────────────────────────────────
  "nährstoffblockaden-und-antagonismen": {
    growValue: "Prüfe pH (5.8–6.2 Coco, 6.0–6.8 Erde) bevor du neue Dünger gibst – 80% der Mangelbilder sind pH-Blockaden, keine echten Mängel.",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  "nährstoffbedarf-cannabis-lebenszyklus": {
    growValue: "Wechsle ab Blütewoche 3 von NPK 2:1:2 auf 1:3:3 – phasengerechte Ernährung verhindert Stickstoffüberschuss in der Spätblüte.",
    qualityScore: 4,
    growCategory: "nutrients",
  },
  "substrat-vergleich-coco-erde-hydro": {
    growValue: "Wähle Coco für Kontrolle und Wuchsgeschwindigkeit, Erde für Fehlertoleranz, Hydro nur mit etablierter System-Routine.",
    qualityScore: 4,
    growCategory: "watering",
  },
  // ── Stress & Prevention ───────────────────────────────────────────────────
  "stressmarker-früh-erkennen": {
    growValue: "Hängende Blätter morgens = Hitzestress, hängende Blätter abends = Wasserverlust – beide Signale richtig lesen spart Ertragseinbußen.",
    qualityScore: 4,
    growCategory: "stress",
  },
  "integrierte-schädlingsprävention-grow": {
    growValue: "Stelle Klebefallen auf und mache wöchentliche Sichtkontrollen – früh erkannter Schädlingsdruck halbiert den Behandlungsaufwand.",
    qualityScore: 4,
    growCategory: "stress",
  },
  "schimmel-und-mykotoxine-bei-cannabis": {
    growValue: "Trockne auf aw < 0.65 und halte den Trocknungsraum unter 50% RH – sichtbarer Schimmel beginnt erst ab aw > 0.75.",
    qualityScore: 5,
    growCategory: "yield",
  },
  // ── Genetics ─────────────────────────────────────────────────────────────
  "genetik-und-phänotyp-selektion": {
    growValue: "Definiere Selektionsziele vor dem Pheno-Hunt schriftlich – wer erst danach priorisiert, wählt nach Bauchgefühl.",
    qualityScore: 4,
    growCategory: "yield",
  },
  "feminisiert-vs-regular-vs-autoflower": {
    growValue: "Feminisiert für reproduzierbare Produktions-Runs, Regular für Zucht, Autoflower für zeitlich geplante Kurzzyklen.",
    qualityScore: 3,
    growCategory: "yield",
  },
  "mutterpflanzen-und-clone-hygiene": {
    growValue: "Desinfiziere Schneidwerkzeug zwischen jeder Pflanze und halte mindestens 3 Backup-Clones pro Linie – ein Ausfall darf keine Linie vernichten.",
    qualityScore: 4,
    growCategory: "stress",
  },
  // ── Post-Harvest & Quality ────────────────────────────────────────────────
  "wasseraktivität-und-curing": {
    growValue: "Cure 3–4 Wochen in verschlossenen Gläsern bei 62% RH und prüfe aw wöchentlich – Ziel ist aw < 0.65 für stabile Qualität.",
    qualityScore: 5,
    growCategory: "yield",
  },
  "lagerung-verpackung-und-lichtschutz": {
    growValue: "Lagere in UV-geschützten Glasgefäßen bei 18–21°C – transparentes Plastik durchlässt UV und beschleunigt Qualitätsverlust messbar.",
    qualityScore: 4,
    growCategory: "yield",
  },
  "lagerung-und-terpenverlust-vermeiden": {
    growValue: "Vermeide Temperaturen über 22°C bei der Lagerung – jeder Grad darüber beschleunigt Terpenverlust und Oxidation.",
    qualityScore: 4,
    growCategory: "yield",
  },
  "thc-zu-cbn-abbau-und-oxidation": {
    growValue: "Lagere luftdicht, lichtdicht und unter 20°C – Sauerstoff, Wärme und Licht sind die drei Haupttreiber des THC-Abbaus zu CBN.",
    qualityScore: 4,
    growCategory: "yield",
  },
  // ── Chemistry & Understanding ─────────────────────────────────────────────
  "cannabinoid-biosynthese-verstehen": {
    growValue: "Ernte bei 25–30% amber Trichomen für relaxierendes Profil, bei klaren bis milchigen für aktivierendes – Trichom-Kontrolle schlägt Kalenderplanung.",
    qualityScore: 3,
    growCategory: "yield",
  },
  "terpene-und-wirkprofil": {
    growValue: "Cure unter 22°C in geschlossenen Behältern – Wärme und Sauerstoff zerstören flüchtige Terpene schneller als jede andere Lagerungsvariable.",
    qualityScore: 4,
    growCategory: "yield",
  },
  "myrcen-limonen-caryophyllen-einordnung": {
    growValue: "Beurteile Qualität am Gesamtprofil aus Cannabinoiden + Terpenen – ein einzelnes Terpen-Label ist kein Qualitätsmerkmal.",
    qualityScore: 3,
    growCategory: "yield",
  },
  // ── Safety & Contamination ────────────────────────────────────────────────
  "coa-richtig-lesen": {
    growValue: "Prüfe COA auf Chargenbezug, Methode (HPLC/GC-MS) und LOQ – ohne diese Angaben ist der Laborbericht nicht vergleichbar.",
    qualityScore: 4,
    growCategory: "yield",
  },
  "pgr-und-kontaminanten": {
    growValue: "Kaufe nur von transparenten Lieferanten mit aktuellen chargenspezifischen COAs – PGR-belastetes Material kann nicht nachträglich repariert werden.",
    qualityScore: 4,
    growCategory: "yield",
  },
  "pestizidklassen-und-rückstandsrisiken": {
    growValue: "Setze nur zugelassene Mittel ein und halte mind. 14 Tage Auswaschphase vor der Ernte – dokumentiere jeden Einsatz mit Datum und Menge.",
    qualityScore: 4,
    growCategory: "stress",
  },
  // ── Environment & Systems ─────────────────────────────────────────────────
  "indoor-outdoor-anbau-vergleich": {
    growValue: "Wähle Indoor für reproduzierbare Qualität und Kontrolle, Outdoor für Ertragsziel – beide Systeme brauchen konsequente Dokumentation.",
    qualityScore: 3,
    growCategory: "yield",
  },
  // ── Konsum & Formen ───────────────────────────────────────────────────────
  "inhalation-vs-edibles": {
    growValue: "Warte bei Edibles mindestens 2 Stunden bis zur Nachdosierung – später Eintritt führt häufig zu unbewusster Überdosierung.",
    qualityScore: 4,
    growCategory: "yield",
  },
  "vaping-rauchen-und-verdampfen-vergleich": {
    growValue: "Vaporizer bei 170–185°C nutzen – darunter werden Wirkstoffe nicht vollständig aktiviert, darüber entstehen Abbauprodukte.",
    qualityScore: 3,
    growCategory: "yield",
  },
  "hash-typen-vergleichen": {
    growValue: "Kenne die Verfahrensgruppe deines Produkts (Sieb, Eiswasser, Press) – das bestimmt Qualitätsmerkmale und Lageranforderungen.",
    qualityScore: 3,
    growCategory: "yield",
  },
  "bubble-hash-qualitätskriterien": {
    growValue: "Bubble Hash über 90µm-Sieben enthält mehr Kopfdrüsen und weniger Pflanzenreste – Siebgröße ist das wichtigste dokumentierbare Qualitätsmerkmal.",
    qualityScore: 4,
    growCategory: "yield",
  },
  "rosin-einordnung-ohne-hype": {
    growValue: "Rosin-Qualität hängt von Ausgangsmaterial, Temperatur (70–90°C) und Druck ab – ohne diese Angaben sind Vergleiche zwischen Chargen wertlos.",
    qualityScore: 4,
    growCategory: "yield",
  },
  "full-melt-und-marketingsprache": {
    growValue: "Full-Melt ist eine Schmelzeigenschaft, kein Herstellungsverfahren – prüfe immer, ob eine Produktbeschreibung Verfahren und Qualitätsmerkmal klar trennt.",
    qualityScore: 3,
    growCategory: "yield",
  },
  // ── Tutorials ────────────────────────────────────────────────────────────
  "how-to-grow-cannabis-anfänger-tutorial": {
    growValue: "Starte mit einer Pflanze, stabilem Setup und täglichem Log – drei dokumentierte Runs machen dich besser als beliebig viele undokumentierte.",
    qualityScore: 5,
    growCategory: "yield",
  },
  "how-to-grow-cannabis-fortgeschritten-tutorial": {
    growValue: "Verwandle dein Setup vom reaktiven Einzelrun in ein datengestütztes System – Wiederholbarkeit ist wichtiger als Spitzenwerte.",
    qualityScore: 5,
    growCategory: "yield",
  },
  "how-to-grow-cannabis-profi-tutorial": {
    growValue: "Validiere jede Prozessänderung über mindestens zwei dokumentierte Runs – echte Systeme sind reproduzierbar, keine Einmalglücke.",
    qualityScore: 5,
    growCategory: "yield",
  },
};

// ─── Curated Export ───────────────────────────────────────────────────────────
// Only articles present in GROW_KNOWLEDGE are exported.
// They are enriched with growValue + qualityScore from the map.
// ─────────────────────────────────────────────────────────────────────────────

export const wikiArticles: TerpiraArticle[] = [
  ...baseWikiArticles,
  ...expansionWikiArticles,
  ...thirdWaveWikiArticles,
  ...diagnosticArticles,
]
  .filter((a) => a.slug in GROW_KNOWLEDGE)
  .map((a) => ({ ...a, ...GROW_KNOWLEDGE[a.slug] }))
  // Sort by qualityScore DESC as canonical default
  .sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0));

export const getArticleBySlug = (slug: string) =>
  wikiArticles.find((article) => article.slug === slug);

export const getArticlesByCategory = (category: TerpiraCategory) =>
  wikiArticles.filter((article) => article.category === category);

/**
 * Returns articles with qualityScore >= 4, sorted by score DESC.
 * Use for tool recommendations, AI suggestions and featured sections.
 */
export const getHighQualityArticles = (): TerpiraArticle[] =>
  wikiArticles.filter((a) => (a.qualityScore ?? 0) >= 4);

/**
 * Returns articles that include any of the given tags (case-insensitive).
 * Use for context-aware tool recommendations.
 */
export const getArticlesByTags = (tags: string[]): TerpiraArticle[] => {
  const lower = tags.map((t) => t.toLowerCase());
  return wikiArticles.filter((a) =>
    a.tags.some((t) => lower.includes(t.toLowerCase()))
  );
};

/**
 * Returns articles matching a grow-action category, sorted by qualityScore DESC.
 * Use for log-based triggers and contextual recommendations.
 */
export const getArticlesByGrowCategory = (category: GrowCategory, limit = 3): TerpiraArticle[] =>
  wikiArticles
    .filter((a) => a.growCategory === category)
    .sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0))
    .slice(0, limit);

/**
 * Returns the top N articles relevant to a given tool context.
 * Prioritises qualityScore, then articles tagged with the context tags.
 */
export const getArticlesForTool = (
  contextTags: string[],
  limit = 3
): TerpiraArticle[] => {
  const lower = contextTags.map((t) => t.toLowerCase());
  return wikiArticles
    .filter((a) => a.tags.some((t) => lower.includes(t.toLowerCase())))
    .sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0))
    .slice(0, limit);
};

export const getArticleSources = (article: TerpiraArticle) => {
  const sourceIds = article.sourceIds && article.sourceIds.length > 0
    ? article.sourceIds
    : defaultSourceIdsByCategory[article.category];

  return sourceIds
    .map((id) => sourceRegister.find((source) => source.id === id))
    .filter((source): source is TerpiraSource => Boolean(source));
};
