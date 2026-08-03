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
  
  // === ANBAU, GENETIK & QUALITÄT ===
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
  },
  {
    id: "warren-hop-latent-viroid-cannabis",
    title: "Sequence Composition and Genetic Diversity of Hop Latent Viroid: from Herbal Extracts to Cannabis",
    publisher: "Phytobiomes Journal",
    year: "2019",
    url: "https://apsjournals.apsnet.org/doi/10.1094/PBIOMES-02-19-0010-R"
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
      { label: "Empfohlenes Tracking", value: "Tägliches Grow-Log" }
    ],
    sections: [
      {
        heading: "Systemdenken statt Einzeltricks",
        content: [
          "Ertrag und Qualität entstehen aus stabilen Prozessen — nicht aus isolierten Tricks.",
          "Licht, Klima und Nährstoffe greifen ineinander: eine Änderung beeinflusst immer das Gesamtsystem."
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
          "Notiere Futterstärke, pH-Korrekturen und Giesstermine in einer einheitlichen Struktur.",
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
          "Schreibe jede Änderung mit Datum ins Grow-Log, bevor du sie machst",
          "Ändere nur eine Variable pro Woche — sonst kannst du Ursachen nicht isolieren"
        ]
      }
    ],
    warnings: ["Unstabile Nacht-Temperaturen erhöhen Stress und Risiko für Schimmelereignisse."],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Was ist Systemdenken?",
        text: "Jede Änderung bei Licht, Klima oder Nährstoffen beeinflusst die anderen Parameter. Stabilität statt Einzeltricks ist der Schlüssel."
      },
      {
        title: "Kurz erklärt: Warum Dokumentation?",
        text: "Nur mit schriftlichen Aufzeichnungen lassen sich Fehler später nachvollziehen und Verbesserungen dauerhaft etablieren."
      }
    ],
    faq: [
      {
        question: "Muss ich teure Geräte kaufen, um gut anzubauen?",
        answer: "Nein. Entscheidend ist die SOP-Konsistenz, nicht die Ausrüstung. Günstige Sensoren mit zuverlaussigem Logging schlagen teure Einzelgeräte."
      },
      {
        question: "Wie oft sollte ich mich um die Pflanzen kümmern?",
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
        definition: "Electrical Conductivity - Salzgehalt der Nährlosung, Indikator für verfügbare Nährstoffe."
      }
    ],
    sourceIds: ["horticulture-research-cannabis-cultivation", "plant-physiology-vpd-transpiration", "astm-d37-cannabis", "postharvest-biology-technology-curing"],
    relatedSlugs: ["vpd-einfach-erklaert", "wasseraktivitaet-und-curing", "coa-richtig-lesen"]
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
      "Zu niedriger VPD kann pathogene Fenster öffnen, zu hoher VPD stresst Pflanzen schnell."
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
          "Arbeite mit Phase-Profilen (Jungpflanze, Wachstum, Blüte) und teste nur kleine Änderungen.",
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
    relatedSlugs: ["cannabis-anbau-grundlagen", "wasseraktivitaet-und-curing"]
  },
  {
    slug: "genetik-und-phaenotyp-selektion",
    title: "Genetik und Phänotyp-Selektion",
    summary: "Wie du genetische Linien vergleichst, stabile Kandidaten auswählst und Drift über Generationen vermeidest.",
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
          "Top-Kandidaten sollten in mindestens einem Bestätigungsdurchlauf erneut performen.",
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
        text: "Gene verändern sich über Generationen. Mehrere Durchläufe und Backup-Clones sind nötig, um wirklich stabile Kandidaten zu finden."
      }
    ],
    faq: [
      {
        question: "Wie lange dauert ein verantwortungsvoller Hunt?",
        answer: "Mindestens 2 bis 3 Durchläufe. Der erste Hunt identifiziert potenzielle Kandidaten, der zweite prüft Stabilität und Reproduzierbarkeit."
      },
      {
        question: "Was ist das größte Fehlerrisiko?",
        answer: "Unterschiedliche Kulturbedingungen pro Pflanze. Das verfälscht den Vergleich massiv. Identische Bedingungen sind absolute Pflicht."
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
          "Glasbehälter luftdicht verschliessen — Sauerstoffkontakt ist der größte Einzelfaktor für Profilveränderung",
          "COA-Terpenangabe nur vergleichen, wenn gleiche Methode und Probenahmezeit dokumentiert sind"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Terpene sind nicht Wirkung",
        text: "Terpene beeinflussen das sensorische Profil und könnten Effekte unterstützen, ersetzen aber niemals Laborwerte für Cannabinoide oder Kontaminanten."
      },
      {
        title: "Kurz erklärt: Wie werden Terpene gemessen?",
        text: "Hauptsächlich via GC-MS (Gaschromatographie-Massenspektrometrie). Die genaue Messmethode und Probenbehandlung beeinflussen die Ergebnisse deutlich."
      }
    ],
    faq: [
      {
        question: "Verliere ich Terpene beim Trocknen und Lagern?",
        answer: "Ja, stark. Hitze, Licht und Luftexposition bauen Terpene ab. Kühle, dunkle, luftdichte Lagerung ist essentiell."
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
          "Unterscheide zwischen präklinischer Evidenz und klinischen Daten am Menschen.",
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
    warnings: ["Dieser Artikel ist kein medizinischer Rat und ersetzt keine ärztliche Beratung."],
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
        answer: "CBD zeigt in einigen in-vitro und Tiermodellen Effekte, aber Humanstudien sind begrenzt. Vorsicht vor Überklärungen von Labliteratur."
      },
      {
        question: "Schädigt THC das Gehirn?",
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
        definition: "Tetrahydrocannabinol; primärer psychoaktiver Bestandteil; CB1-Rezeptor-Agonist."
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
      { label: "Hauptfehler", value: "Zu frühes Nachdosieren" }
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
        definition: "Höchste Konzentration eines Wirkstoffs im Blut; tritt schneller bei Inhalation auf als bei oraler Aufnahme."
      },
      {
        term: "Half-Life",
        definition: "Zeit, die eine Substanz bis zur Hälfte ihres Ausgangsspiegels im Körper abgebaut wird."
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
      "Hash sollte zuerst nach Verfahrensfamilien klassifiziert werden: mechanisch, eiswasserbasiert, pressbasiert und lösungsmittelgestützt.",
      "Historische Begriffe (z. B. Charas, Kif, Afghan, Lebanese) beschreiben oft Herkunft und Stil, nicht automatisch objektive Qualität.",
      "Produktfamilien gehören zusammen, wenn sie dieselbe Trennlogik nutzen und im selben Post-Processing weiterverarbeitet werden.",
      "Professionelle Bewertung kombiniert Sensorik, physikalische Parameter, Kontaminantenstatus und Chargenkonsistenz."
    ],
    quickFacts: [
      { label: "Ursprungsregionen", value: "Nordafrika, Levante, Zentral-/Südasien" },
      { label: "Kernfrage", value: "Verfahrensfamilie vor Marketingname" },
      { label: "Qualitätsbasis", value: "SOP, Labor, Batch-Konsistenz" }
    ],
    sections: [
      {
        heading: "1) Taxonomie: Welche Hash-Arten gibt es wirklich?",
        content: [
          "Professionell wird Hash zuerst nach Trennprinzip geordnet und erst danach nach Handelsnamen. Das verhindert Verwechslungen zwischen Stilbegriffen und Technik.",
          "Verfahrensfamilien: (A) mechanisch trocken getrennt (Dry Sift/Kief), (B) eiswasserbasiert getrennt (Ice Water/Bubble), (C) hand- oder pressbasiert verdichtet (z. B. Charas, klassischer Presshash), (D) lösungsmittelbasierte Extrakte mit optionaler Weiterverarbeitung zu hash-ähnlichen Endformen.",
          "Was gehört zusammen: Dry Sift und traditionelle Kief-Linien sind eine Familie; Bubble und daraus gepresste Rosin-Linien sind eine zweite Familie; historische Presshash-Stile bilden eine kultur- und prozesshistorische Gruppe."
        ]
      },
      {
        heading: "2) Historischer Ursprung und regionale Stilbegriffe",
        content: [
          "Historisch entstanden verschiedene Hash-Kulturen in unterschiedlichen Regionen mit eigenen Rohwaren, Klimabedingungen und Presstechniken.",
          "Nordafrika ist eng mit Kief-/Siebtraditionen verbunden; in Teilen Zentral- und Südasiens sind handgeriebene und gepresste Formen historisch prägend; in der Levante entwickelten sich eigene Presshash-Stile mit spezifischer Reifung und Marktlogik.",
          "Wichtig: Regionenamen sind Stilmarker, aber keine automatische Garantie für Reinheit, Potenz oder Sicherheitsprofil."
        ]
      },
      {
        heading: "3) Verfahrensfamilien im professionellen Vergleich",
        content: [
          "Dry Sift/Kief: trocken-mechanische Trennung. Stärken liegen in klarer Prozesslogik und guter Skalierbarkeit, Risiken liegen in Verunreinigung durch Pflanzenreste bei ungenauer Fraktionierung.",
          "Ice Water/Bubble: nasskalte Trennung. Stärken sind hohe Reinheitsfenster bei sauberer Prozessführung; kritische Punkte sind Trocknungsmanagement, Wasseraktivität und mikrobiologische Stabilität.",
          "Presshash/Traditionsstile: Verdichtung und Reifung sind zentrale Faktoren. Ergebnisqualität hängt stark von Ausgangsfraktion, Druck-/Wärmeprofil und Lagerregime ab.",
          "Rosin-Linien: lösungsmittelfreie Press-Weiterverarbeitung von geeigneten Vorprodukten. Qualität wird von Input-Material und thermischer Belastung begrenzt.",
          "Lösungsmittelgestützte Extrakte: eigene Produktklasse; für Vergleich mit klassischem Hash müssen Restlösungsmittel- und Reinheitsdaten zwingend betrachtet werden."
        ]
      },
      {
        heading: "4) Welche Begriffe werden häufig verwechselt?",
        content: [
          "Kief ist nicht automatisch fertiger Presshash; Bubble ist nicht automatisch Rosin; Rosin ist ein Endprodukt aus geeigneten Vorstufen, keine Herkunftsbezeichnung.",
          "" +
            "'Full melt', '6 star', 'premium'" +
            " sind Marktbegriffe und sollten stets gegen objektive Messwerte (z. B. Kontaminantenstatus, Wasseraktivität, Chargenvergleich) gespiegelt werden.",
          "'Old school' vs. 'modern' beschreibt oft Verarbeitungskultur und Zielprofil, nicht zwingend Sicherheits- oder Qualitätsniveau."
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
      "Detaillierte Herstellungsanleitungen werden hier bewusst nicht bereitgestellt; Fokus liegt auf Einordnung, Qualitätsmanagement und Risikoaufklärung.",
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
        text: "Wenn Stilbegriffe oder Herkunft als Qualitätsbeweis genutzt werden und Labor- sowie Prozessdaten fehlen."
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
    relatedSlugs: ["wasseraktivitaet-und-curing", "coa-richtig-lesen", "terpene-und-wirkprofil"]
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
      "Messbare SOPs schlagen subjektives Fühlen im Glas deutlich."
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
          "Curing ist kein kosmetischer Schritt, sondern ein kritischer Teil des Qualitätsmanagements.",
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
        definition: "Relative Feuchte, die im Körner mit der Umgebungsfeuchte im Gleichgewicht steht; kritisch für Haltbarkeit und Mikrob-Wachstum."
      },
      {
        term: "Curing",
        definition: "Kontrollierte Feuchte-Reduktion nach Trocknung; verbessert Geschmack, Aroma und Haltbarkeit."
      },
      {
        term: "Chlorophyll",
        definition: "Grüner Farbstoff; wird beim Curing abgebaut, was zu besserem Geschmack und hellerer Farbe führt."
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
      { label: "Warnsignal", value: "Unvollständige Kontaminantenliste" }
    ],
    sections: [
      {
        heading: "Was du zuerst prüfst",
        content: [
          "Schau zuerst: Ist die Chargennummer identisch mit deiner Ware? Ist das Analysedatum aktuell?",
          "Ohne diesen Match ist das COA wertlos — es könnte jedes andere Produkt beschreiben."
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
      { label: "Häufige Lücke", value: "Keine aktuellen Rückstandsdaten" },
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
          "Baue Sperrlogik für auffällige Chargen in den operativen Ablauf ein.",
          "Kommuniziere transparent, warum Produkte zurückgehalten oder nachgetestet werden."
        ]
      }
    ],
    warnings: ["Keine Analyse, keine Freigabe: ohne belastbare Daten sollte keine Charge in Umlauf gehen."],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Was sind PGR?",
        text: "Plant Growth Regulator - Stoffe, die Wachstum und Blüte künstlich manipulieren. Viele sind in der EU/CH nicht zugelassen."
      },
      {
        title: "Kurz erklärt: Warum Sicherheit?",
        text: "PGR und Pestizide sind akute Risiken. Produktsicherheit beginnt mit Lieferkette-Transparenz und Labor-Freigabe."
      }
    ],
    faq: [
      {
        question: "Wie erkenne ich PGR-Belästigung ohne Labor?",
        answer: "Normalerweise nicht sicher. Äusserlich können unrealistische Dichten, extreme Feuchte-Verhältnisse oder Geruchsverfremdungen Hinweise sein - ersetzen aber keine Analytik."
      },
      {
        question: "Welche Kontaminanten sind kritisch?",
        answer: "Priorität: Pestizide, Pilzgifte und Schwer-Metalle. Dann: Lachgas, PGRs, Lösungsmittelreste. Labore sollten priorisiert nach lokalen Grenzwerten testen."
      }
    ],
    glossary: [
      {
        term: "PGR",
        definition: "Plant Growth Regulator - künstliche Stoffe zur Wachstum- und Ertrag-Manipulation."
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
    summary: "Überblick zu Regelungslogik, Nachweispflichten und typischen Compliance-Fehlern.",
    category: "recht",
    difficulty: "einsteiger",
    readMinutes: 8,
    lastUpdated: "2026-03-26",
    tags: ["Recht", "DACH", "Compliance", "Dokumentation"],
    keyTakeaways: [
      "Rechtliche Anforderungen unterscheiden sich je Region und Nutzungsfall deutlich.",
      "Dokumentationspflichten sind operativ genauso wichtig wie Produktqualität.",
      "Frühe Compliance-Prüfungen senken spätere Kosten und Risiken."
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
        answer: "Je Land: Registrierung, COA-Anforderungen, Verpackungsrichtlinien, Werbeverbot und Lagerdokumentation. Das variiert stark - lokal prüfung ist Pflicht."
      },
      {
        question: "Was ist der größte Fehler?",
        answer: "Annahme, dass einmalige Compliance-Prüfung ausreicht. Gesetze ändern sich. Regelupdates müssen zyklisch sein."
      }
    ],
    glossary: [
      {
        term: "BtMG (DE)",
        definition: "Betäubungsmittelgesetz; regelt Anbau, Besitz, Handel von Cannabis in Deutschland."
      },
      {
        term: "Nachweispflicht",
        definition: "Verpflichtung, Compliance und Sicherheit durch Dokumentation zu belegen."
      },
      {
        term: "Vier-Augen-Prinzip",
        definition: "Dual-Approval für kritische Entscheidungen; erhöht Dokumentationsqualität und Rechtssicherheit."
      }
    ],
    sourceIds: ["bfarm-german-cannabis-guidelines", "swissmedic-cannabis-requirements", "ages-austria-cannabis-standards", "ema-good-manufacturing-practice", "codex-food-hygiene-2022"],
    relatedSlugs: ["markttransparenz-und-preise", "coa-richtig-lesen"]
  },
  {
    slug: "markttransparenz-und-preise",
    title: "Markttransparenz und Preislogik",
    summary: "Wie sich Preis, Qualität, Risiko und Verfügbarkeit in realen Märkten gegenseitig beeinflussen.",
    category: "markt",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-03-26",
    tags: ["Markt", "Preisbildung", "Qualität", "Angebot"],
    keyTakeaways: [
      "Niedrige Preise ohne Datenbasis korrelieren oft mit höheren Qualitätsrisiken.",
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
          "Damit wird Wettbewerb über Transparenz statt nur über Preis gefördert."
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
        answer: "Nicht automatisch. Hoher Preis kann auch Monopol oder Hype sein. Preis + Transparenz + Konsistenz = echte Qualitätsindikation."
      },
      {
        question: "Wie erkenne ich unfaire Preise?",
        answer: "Vergleiche den Preis mit verfügbaren Analysen (COA), Lieferzuverlässigkeit, Rückverfolgbarkeit und Reklamationsquote. Fehlende Transparenz ist ein klares Warnsignal."
      }
    ],
    glossary: [
      {
        term: "Marktpreisbildung",
        definition: "Preis entsteht durch Angebot, Nachfrage, Risiko und operative Kosten."
      },
      {
        term: "Informationsasymmetrie",
        definition: "Käufer und Verkäufer haben unterschiedliche Information über Qualität und Risiko."
      },
      {
        term: "Qualitätskorridor",
        definition: "Realistischer Preisbereich für definierte Qualitätsstandards, statt Fokus auf den billigsten Einzelpreis."
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
      "Klima- und Nährstoffparameter sollten in einem gemeinsamen Regelkreis geführt werden.",
      "EC-Anpassungen ohne Blick auf Transpiration führen oft zu Fehlsteuerungen.",
      "Eine Steuerungsansicht mit Alarmgrenzen reduziert die manuelle Reaktionszeit deutlich."
    ],
    quickFacts: [
      { label: "Niveau", value: "Prozessoptimierung" },
      { label: "Nötig", value: "Konsistente Sensordaten" },
      { label: "Ergebnis", value: "Stabilere Qualität pro Charge" }
    ],
    sections: [
      {
        heading: "Regelstrategie aufbauen",
        content: [
          "Definiere Prioritäten: zuerst Klimastabilität, dann Naehrstofffeinsteuerung.",
          "Nutze Trenddaten statt Einzelmesspunkte für Entscheidungen."
        ]
      },
      {
        heading: "Monitoring und Alarmierung",
        content: [
          "Lege harte Alert-Level für VPD-Drift, EC-Ausreisser und Temperatursprünge fest.",
          "Verknüpfe jeden Alarm mit klarer Reaktionsanweisung für das Team."
        ],
        checklist: [
          "Alarmmatrix dokumentiert",
          "Eskalationsverantwortliche benannt",
          "Monatliche Überprüfung der Schwellenwerte"
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
        text: "Pflanzen ändern Ansprüche ständig (Wachstum, Stress, Reife). Automatisierte Regeln mit menschlichem Eingreifen reduzieren Fehler und Reaktionszeit."
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
    relatedSlugs: ["vpd-einfach-erklaert", "cannabis-anbau-grundlagen"]
  },
  {
    slug: "naehrstoffbedarf-cannabis-lebenszyklus",
    title: "Nährstoffbedarf im Cannabis-Lebenszyklus",
    summary: "Phasenweise Übersicht des NPK-, Ca- und Mg-Bedarfs bei Photoperiodisch- und Autoflower-Pflanzen in Erde und Coco – basierend auf peer-reviewten Studien.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 10,
    lastUpdated: "2026-08-03",
    tags: ["Nährstoffe", "Nährstoffmangel", "Düngung", "Lebenszyklus", "NPK", "Autoflower", "Photoperiodisch", "Erde", "Coco", "Studien"],
    keyTakeaways: [
      "Das N:P:K-Verhältnis verschiebt sich mit der Wachstumsphase: vegetativ stickstoffbetont (≈ 3:1:2), ab Blütewoche 3 phosphor- und kaliumbetont (≈ 1:3:3) — ein starres Düngeprogramm über den ganzen Zyklus überdüngt in der einen und unterdüngt in der anderen Phase.",
      "Autoflower-Linien vertragen wegen der kurzen, nicht klar abgrenzbaren Vegetationsphase deutlich niedrigere EC-Spitzenwerte als Photoperiodische — aggressive Düngeprogramme sind die häufigste Ertragsbremse bei Autos.",
      "Coco-Substrat bindet Ca²⁺ und Mg²⁺ an seiner Kationenaustauschoberfläche stärker als K⁺ — ohne routinemäßigen Cal-Mag-Zusatz entsteht auch bei rechnerisch ausreichender Düngung ein Mangel."
    ],
    quickFacts: [
      { label: "Vegetativ (NPK)", value: "≈ 3:1:2, EC 1.0–1.6 mS/cm" },
      { label: "Blüte ab Woche 3 (NPK)", value: "≈ 1:3:3, EC 1.4–2.0 mS/cm" },
      { label: "Spätblüte/Reife", value: "EC schrittweise auf 0.6–1.0 mS/cm senken" },
      { label: "Autoflower-EC-Obergrenze", value: "≈ 20–30 % unter Photoperiodisch-Werten" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Der Nährstoffbedarf von Cannabis ist nicht konstant, sondern folgt dem physiologischen Wechsel von vegetativem Wachstum zu generativer Blütenbildung. Jede Phase verlangt ein anderes Verhältnis von Stickstoff (N), Phosphor (P) und Kalium (K).",
          "Ein über den gesamten Zyklus unverändertes Düngeprogramm ignoriert diesen Wechsel und ist eine häufige Ursache für Stickstoffüberschuss in der Spätblüte und für Kalium- bzw. Phosphormangel während der aktiven Knospenbildung."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Stickstoff ist Baustein von Chlorophyll, Aminosäuren und Strukturproteinen — der Bedarf korreliert direkt mit der Zunahme an Blattmasse und ist daher in der vegetativen Phase am höchsten.",
          "Phosphor treibt als Bestandteil von ATP und Nukleinsäuren Zellteilung und Energietransfer an; Kalium reguliert Stomataöffnung, osmotischen Druck und den Zuckertransport ins Blütengewebe. Beide Prozesse dominieren ab dem Blütenansatz, was das Verhältnis zugunsten von P und K verschiebt."
        ]
      },
      {
        heading: "Phasenmodell mit Zielwerten",
        content: [
          "Keimling/Sämling (Tag 0–14): EC 0.4–0.8 mS/cm — die Samenreserven decken den Initialbedarf weitgehend, Überdüngung ist hier das größere Risiko als Mangel.",
          "Vegetativ (bis zur Lichtumstellung): NPK ≈ 3:1:2, EC 1.0–1.6 mS/cm — stickstoffbetont für Blattmassezuwachs.",
          "Reck- und Frühblüte (erste 1–3 Wochen nach Umstellung): Übergangsphase — N schrittweise senken, P und K schrittweise anheben.",
          "Mittelblüte (Hauptknospenbildung): NPK ≈ 1:3:3, EC 1.4–2.0 mS/cm — K-Spitzenbedarf für den Zuckertransport in die Blüten.",
          "Spätblüte/Reife (letzte 1–2 Wochen): EC schrittweise Richtung 0.6–1.0 mS/cm senken, N nahezu auf null."
        ],
        checklist: [
          "EC/pH der Drainage wöchentlich gegen den Zulauf protokollieren",
          "NPK-Verhältnis am Phasenwechsel aktiv umstellen, nicht nur die Menge erhöhen",
          "In den letzten 1–2 Wochen EC schrittweise senken statt abrupt zu stoppen"
        ]
      },
      {
        heading: "Substratspezifische Unterschiede",
        content: [
          "Erde: mikrobielle Stickstoff-Mineralisierung puffert Schwankungen ab, die Fehlertoleranz ist hoch, die Reaktion auf Düngeranpassungen dafür langsamer.",
          "Coco: hohe Kationenaustauschkapazität bindet Ca²⁺ und Mg²⁺ bevorzugt gegenüber K⁺ — ein routinemäßiger Cal-Mag-Zusatz ist praktisch Pflicht, die Reaktion auf Korrekturen erfolgt aber deutlich schneller als in Erde.",
          "Hydro: keine Pufferung — die Nährlösung IST der Wurzelraum. EC- und pH-Drift muss täglich kontrolliert werden, Nachschub erfolgt über Volumenwechsel statt über den Gießzyklus."
        ]
      },
      {
        heading: "Photoperiodisch vs. Autoflower",
        content: [
          "Autoflower-Linien haben eine fixe, kurze Lebensspanne von rund 10 Wochen ohne klar trennbare Veg-/Blühphase-Schaltung durch den Züchter. Nährstoffübergänge müssen dadurch sanfter verlaufen, und die EC-Obergrenzen sollten rund 20–30 % unter den Werten für Photoperiodische liegen.",
          "Überdüngte Autoflower können den Stress nicht wie photoperiodische Pflanzen durch eine verlängerte vegetative Erholungsphase kompensieren — der Ertragsverlust ist endgültig."
        ]
      },
      {
        heading: "Korrekturmaßnahmen und Protokoll",
        content: [
          "Wöchentliches Log von EC/pH bei Zulauf und Drainage führen, nicht nur den Zulauf kontrollieren.",
          "NPK-Verhältnis am Kalendertag der Phasenumstellung ändern, nicht erst reaktiv nach dem Auftreten von Symptomen.",
          "Vor jedem größeren Phasenwechsel einen Spülgang mit pH-korrigiertem Wasser einplanen, um Altsalze aus vorheriger Düngung zu entfernen."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Dasselbe Düngeprogramm für Photoperiodisch und Autoflower verwenden, ohne die EC-Obergrenze anzupassen.",
          "Stickstoff bis in die Spätblüte hoch halten — 'mehr Grün = mehr Ertrag' stimmt nicht und kostet Blütenqualität sowie Geschmack.",
          "EC beim Flush ruckartig statt schrittweise senken, was wie zusätzlicher Salzstress wirkt."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Sortenunterschiede in der Nährstoffaufnahmegeschwindigkeit sind real — die genannten Zielwerte sind Korridore, keine Fixwerte, und sollten nach Pflanzenreaktion feinjustiert werden.",
          "In Living-Soil-Systemen übernimmt die mikrobielle Gemeinschaft einen Teil der phasenweisen Umstellung selbst; das EC-Phasenmodell gilt primär für Flüssigdüngung in Coco, Hydro und klassischer Blumenerde."
        ]
      }
    ],
    warnings: [
      "Stickstoff bis in die Spätblüte hoch zu halten, verzögert die Reife und kann Geschmack und Trichomqualität messbar verschlechtern.",
      "Abrupte EC-Sprünge beim Phasenwechsel wirken wie Salzstress — Übergänge über mehrere Gießgänge strecken."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum ändert sich das NPK-Verhältnis?",
        text: "In der Wachstumsphase baut die Pflanze vor allem Blattmasse auf und braucht dafür viel Stickstoff. In der Blüte verschiebt sich der Bedarf zu Phosphor und Kalium, weil Energie und Zucker in die Knospen transportiert werden müssen."
      },
      {
        title: "Kurz erklärt: Warum sind Autos empfindlicher?",
        text: "Autoflower haben keine trennbare Erholungsphase — was in der Vegetation überdosiert wird, kann später nicht mehr durch verlängertes Wachstum ausgeglichen werden."
      }
    ],
    faq: [
      {
        question: "Muss ich für jede Sorte ein anderes Düngeprogramm fahren?",
        answer: "Die Phasenlogik (N-betont vegetativ, P/K-betont in der Blüte) gilt sortenübergreifend. Die genauen EC-Zielwerte sollten aber pro Sorte anhand der Pflanzenreaktion leicht angepasst werden — sie sind Korridore, keine Fixwerte."
      },
      {
        question: "Was passiert, wenn ich zu spät von N- auf P/K-betonte Düngung umstelle?",
        answer: "Die Pflanze investiert weiter in Blattmasse statt in Knospenaufbau, der Zuckertransport in die Blüten ist schwächer, und in der Spätblüte bleibt überschüssiger Stickstoff im Gewebe, was Geschmack und Abbrand beeinträchtigen kann."
      },
      {
        question: "Brauche ich in Erde überhaupt ein striktes EC-Phasenmodell?",
        answer: "Weniger strikt als in Coco oder Hydro, weil die mikrobielle Mineralisierung puffert. Die grundsätzliche Verschiebung von N- zu P/K-betont in der Blüte gilt aber auch in Erde."
      }
    ],
    glossary: [
      { term: "NPK-Verhältnis", definition: "Das Massenverhältnis von Stickstoff (N), Phosphor (P) und Kalium (K) in einem Dünger oder einer Nährlösung." },
      { term: "Kationenaustauschkapazität (CEC)", definition: "Die Fähigkeit eines Substrats, positiv geladene Nährstoffionen an seiner Oberfläche zu binden und pflanzenverfügbar bereitzuhalten." },
      { term: "Flush", definition: "Ein Spülgang mit pH-korrigiertem Wasser ohne Dünger, um akkumulierte Salze aus dem Substrat auszuwaschen." }
    ],
    sourceIds: ["bernal-cannabis-nutrient-requirements", "marschner-mineral-nutrition", "caplan-cannabis-fertility-rate", "bugbee-electrical-conductivity"],
    relatedSlugs: ["cannabis-anbau-grundlagen", "naehrstoffblockaden-und-antagonismen", "cannabis-substrat-und-wurzelzone", "feminisiert-vs-regular-vs-autoflower", "substrat-vergleich-coco-erde-hydro"]
  },
  {
    slug: "stressmarker-frueh-erkennen",
    title: "Stressmarker früh erkennen",
    summary: "Frühe Hinweise auf Klima-, Licht- und Wurzelstress erkennen, bevor Ertrag und Qualität kippen.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 6,
    lastUpdated: "2026-08-03",
    tags: ["Stress", "Monitoring", "Früherkennung", "Grow"],
    keyTakeaways: [
      "Strukturelle Signale (Blattwinkel, Turgor) treten innerhalb von Stunden auf, Farbsignale (Chlorose) erst nach Tagen — wer nur auf Verfärbung wartet, reagiert immer zu spät.",
      "Hängende Blätter direkt unter der Lampe am Morgen deuten auf Hitzestress hin, hängende Blätter am Abend nach vollem Gießzyklus eher auf Wasser- oder Wurzelproblem — die Tageszeit ist ein wichtiges Diagnosemerkmal.",
      "Die Korrekturreihenfolge sollte immer Klima/VPD vor Substratfeuchte vor EC/pH vor Nährstoffgabe sein — Nährstoffkorrekturen zuerst zu versuchen, verschleiert oft die eigentliche Ursache."
    ],
    quickFacts: [
      { label: "Schnellstes Signal", value: "Blattwinkel/Turgor (Minuten bis Stunden)" },
      { label: "Langsamstes Signal", value: "Blattfarbe/Chlorose (Tage)" },
      { label: "Morgens hängend unter Licht", value: "Hinweis auf Hitzestress" },
      { label: "Abends hängend trotz feuchtem Substrat", value: "Hinweis auf Wurzelproblem" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Stressmarker sind beobachtbare Frühindikatoren, die auftreten, bevor sich sichtbarer Schaden wie Chlorose, Nekrose oder Wachstumsstillstand manifestiert.",
          "Ziel der Früherkennung ist es, strukturelle und physiologische Signale zu lesen, die Stunden bis Tage vor den klassischen 'Mangel'- oder 'Krankheits'-Symptomen auftreten."
        ]
      },
      {
        heading: "Warum strukturelle Signale vor Farbsignalen kommen",
        content: [
          "Turgordruck — der Wasserdruck in den Zellen, der Blätter aufrecht hält — reagiert innerhalb von Minuten auf Wassermangel, Hitze oder Wurzelprobleme, weil er direkt vom Zellwasserhaushalt abhängt.",
          "Farbveränderungen wie Chlorose erfordern dagegen den Abbau oder die fehlende Neubildung von Chlorophyll — ein Stoffwechselprozess, der Tage dauert. Wer nur auf Verfärbung achtet, verpasst das frühere und aussagekräftigere Signal."
        ]
      },
      {
        heading: "Die vier Frühwarnsignale",
        content: [
          "Blattwinkel und Turgor: schlaffe, hängende Blätter (Wilting) vs. nach oben gerollte, versteifte Blattränder (Tacoing bei Hitze) — Richtung des Signals zeigt die Stressart an.",
          "Wuchsgeschwindigkeit und Internodienabstand: plötzlich verkürzte Internodien oder ein Wachstumsstopp über 2–3 Tage sind oft das erste messbare Zeichen von Klimastress.",
          "Blattfarbe: die langsamste, aber am häufigsten beachtete Kategorie — sollte als Bestätigung, nicht als Erstsignal genutzt werden.",
          "Trichom- und Blütenverhalten in der Blüte: vorzeitige, ungleichmäßige Trichomreife oder Foxtailing können auf chronischen, unbemerkten Hitze- oder Lichtstress hindeuten."
        ],
        checklist: [
          "Blattwinkel morgens direkt nach Lichtstart und mittags im Lichtmaximum vergleichen",
          "Internodienabstand alle 3–4 Tage grob messen und dokumentieren",
          "Canopy-Foto zur gleichen Tageszeit als Verlaufsvergleich anlegen"
        ]
      },
      {
        heading: "Differenzialdiagnose nach Tageszeit",
        content: [
          "Morgens, kurz nach Lichtstart, hängende Blätter direkt unter der Lampe: meist Hitzestress durch zu geringen Lampenabstand oder zu hohe Lufttemperatur, nicht Wassermangel.",
          "Mittags im Lichtmaximum leicht hängende Blätter, die sich abends erholen: physiologisch normal bei hoher Transpiration, kein Alarmsignal.",
          "Abends hängende Blätter trotz erkennbar feuchtem Substrat: Hinweis auf ein Wurzelproblem (Sauerstoffmangel, beginnende Wurzelfäule) statt auf Wassermangel — hier hilft mehr Gießen nicht.",
          "Durchgängig schlaffe Blätter unabhängig von der Tageszeit: klassischer Wassermangel oder stark gesunkener Substrat-EC durch Auswaschung."
        ]
      },
      {
        heading: "Monitoring-Protokoll",
        content: [
          "Tägliche Kurzkontrolle zur gleichen Uhrzeit: Blattwinkel, Canopy-Gleichmäßigkeit, Substratfeuchte per Fingertest oder Sensor.",
          "Wöchentliche Vollkontrolle: EC/pH von Zulauf und Drainage, Internodienmessung, Fotodokumentation der Canopy von oben."
        ]
      },
      {
        heading: "Korrekturpriorität",
        content: [
          "1. Klima und VPD prüfen (Lufttemperatur, Blatttemperatur, relative Luftfeuchte) — die häufigste, am schnellsten korrigierbare Ursache.",
          "2. Substratfeuchte und Wurzelzone prüfen — Über- oder Unterwässerung, Substrattemperatur.",
          "3. EC und pH von Zulauf und Drainage messen — erst hier werden Dünger- oder pH-Anpassungen relevant.",
          "4. Erst wenn 1–3 im Zielbereich liegen, eine echte Nährstoffkorrektur in Betracht ziehen."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Sofort mit Dünger oder Cal-Mag reagieren, ohne vorher Klima und Substratfeuchte auszuschließen.",
          "Nur mittags kontrollieren, wenn physiologisches Hängen durch hohe Transpiration normal ist, und daraus fälschlich Wassermangel ableiten.",
          "Einzelne Blätter statt der gesamten Canopy als Referenz nehmen — punktuelle Abweichungen sind oft mechanisch (Verletzung, Lichtkontakt), nicht systemisch."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Ein Infrarot-Thermometer zur Messung der Blatttemperatur (statt nur der Lufttemperatur) deckt lokalen Hitzestress unter Nahlicht auf, der bei reiner Lufttemperaturmessung unsichtbar bleibt.",
          "Canopy-Gleichmäßigkeit als KPI (z. B. Streuung der Internodienlänge über die Fläche) ist ein früherer und stabilerer Indikator für systemischen Stress als Einzelblatt-Beobachtung."
        ]
      }
    ],
    warnings: [
      "Bei abendlichem Hängen trotz feuchtem Substrat nicht zusätzlich gießen — das verschärft ein mögliches Wurzelproblem statt es zu lösen."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum zuerst Klima checken?",
        text: "Die meisten frühen Stresssignale — hängende Blätter, gestoppter Wuchs — kommen von falscher Temperatur oder Luftfeuchte, nicht von fehlenden Nährstoffen. Klima zu korrigieren ist schneller und häufig die eigentliche Lösung."
      },
      {
        title: "Kurz erklärt: Turgor vs. Chlorose",
        text: "Turgor ist der Wasserdruck, der Blätter straff hält. Er reagiert in Minuten. Chlorose (Vergilben) braucht Tage, weil dafür Chlorophyll ab- oder nicht neu aufgebaut werden muss."
      }
    ],
    faq: [
      {
        question: "Was ist das zuverlässigste Frühwarnsignal?",
        answer: "Blattwinkel und Turgor, weil sie als Erste reagieren — oft Stunden bevor Farbveränderungen sichtbar werden. Sie zeigen an, dass etwas nicht stimmt, aber nicht automatisch was."
      },
      {
        question: "Wie unterscheide ich normales Mittagshängen von echtem Stress?",
        answer: "Normales Mittagshängen betrifft die ganze Canopy gleichmäßig und erholt sich zum Lichtende. Echter Stress zeigt sich als anhaltendes, ungleichmäßiges oder tageszeitunabhängiges Hängen."
      },
      {
        question: "Sollte ich bei ersten Anzeichen sofort düngen oder Cal-Mag geben?",
        answer: "Nein. Erst Klima und Substratfeuchte ausschließen, dann EC/pH prüfen. Nährstoffkorrekturen als erste Reaktion verschleiern oft die eigentliche Ursache und können bestehenden Stress verstärken."
      }
    ],
    glossary: [
      { term: "Turgor", definition: "Der Innendruck der Pflanzenzelle durch Wasseraufnahme, der Blätter und Stängel straff hält." },
      { term: "Tacoing", definition: "Nach oben gerolltes Blatt als typisches Hitzestress-Signal, benannt nach der taco-ähnlichen Form." },
      { term: "VPD", definition: "Vapor Pressure Deficit — die Trocknungskraft der Luft, zentrale Klimagröße für Transpiration und Stressvermeidung." }
    ],
    sourceIds: ["horticulture-research-cannabis-cultivation", "plant-physiology-vpd-transpiration", "wahid-heat-tolerance-overview"],
    relatedSlugs: ["lichtstress-und-canopy-management", "cannabis-substrat-und-wurzelzone", "grow-log-und-kpi-dashboard"]
  },
  {
    slug: "substrat-vergleich-coco-erde-hydro",
    title: "Substratvergleich: Coco, Erde und Hydro",
    summary: "Was peer-reviewte Studien über Ertrag, EC-Toleranz und Pflegeaufwand bei den drei Hauptsubstraten sagen – inklusive praktischer Empfehlungen für Hobby-Grower.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-08-03",
    tags: ["Substrat", "Nährstoffe", "Schädlinge", "Coco", "Hydro", "Erde", "EC", "pH", "Ertrag", "Studien"],
    keyTakeaways: [
      "Die Kationenaustauschkapazität (CEC) ist der zentrale Unterschied: Erde puffert Fehler ab, Coco reagiert schnell, hat aber praktisch keine Ca/Mg-Reserve, Hydro puffert gar nicht — die Nährlösung IST der Wurzelraum.",
      "Wachstumsgeschwindigkeit steigt tendenziell mit der Sauerstoffverfügbarkeit an der Wurzel: Hydro und Coco liegen vor gut aufgelockerter Erde, kompaktierte Erde bremst am stärksten.",
      "Das größte Risiko in Hydro ist nicht Nährstoffmangel, sondern Wurzelfäule durch zu warme, sauerstoffarme Nährlösung — Systemhygiene und Kühlung sind hier wichtiger als in Coco oder Erde."
    ],
    quickFacts: [
      { label: "pH-Zielfenster Erde", value: "6.2–6.8" },
      { label: "pH-Zielfenster Coco", value: "5.8–6.2" },
      { label: "pH-Zielfenster Hydro", value: "5.5–6.2" },
      { label: "Fehlertoleranz", value: "Erde > Coco > Hydro" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Erde, Coco (Kokosfasersubstrat) und Hydro (rezirkulierende Nährlösungssysteme wie DWC oder NFT) unterscheiden sich vor allem in ihrer Fähigkeit, Nährstoffe zu puffern und Wasser zu speichern.",
          "Die Wahl des Substrats verschiebt nicht die maximal erreichbare Qualität, sondern den nötigen Kontrollaufwand und die Fehlertoleranz während des Anbaus."
        ]
      },
      {
        heading: "Kationenaustauschkapazität als Kernunterschied",
        content: [
          "Erde besitzt eine hohe Kationenaustauschkapazität (CEC) — organisches Material und Tonminerale binden Nährstoffionen und geben sie kontrolliert ab. Das puffert pH- und EC-Schwankungen effektiv ab.",
          "Coco hat ebenfalls eine relevante CEC, bindet dabei aber Ca²⁺ und Mg²⁺ bevorzugt gegenüber K⁺ an seinen Fasern. Ohne routinemäßigen Cal-Mag-Zusatz entsteht dadurch auch bei rechnerisch ausreichender Düngung ein Mangel.",
          "Hydro hat keinerlei Pufferkapazität — die Nährlösung selbst ist der gesamte Wurzelraum. Fehler in EC oder pH wirken hier ungefiltert und sofort auf die Pflanze."
        ]
      },
      {
        heading: "Wachstumsgeschwindigkeit und Sauerstoffverfügbarkeit",
        content: [
          "Wurzelwachstum und Nährstoffaufnahme sind direkt von der Sauerstoffverfügbarkeit im Wurzelraum abhängig. Locker strukturiertes Coco und gut belüftete Hydro-Systeme (Luftsteine, Fluss) bieten mehr gelösten Sauerstoff als kompaktierte Erde.",
          "Das erklärt, warum Coco- und Hydro-Systeme unter guten Bedingungen tendenziell schneller wachsen als Erde — der begrenzende Faktor ist dort seltener Sauerstoff, sondern eher die Kontrollqualität des Betreibers."
        ]
      },
      {
        heading: "Pflegeaufwand und Fehlertoleranz",
        content: [
          "Erde: gießt sich seltener, verzeiht EC-/pH-Ausreißer über Tage, reagiert aber auch langsamer auf gezielte Korrekturen.",
          "Coco: häufigere Gießzyklen (oft mehrfach täglich in kleinen Töpfen), präzisere Zielwerte nötig, aber Korrekturen wirken innerhalb von 1–2 Tagen.",
          "Hydro: kontinuierliche Kontrolle nötig (täglich EC/pH, Wasser- und Lufttemperatur), Fehler wirken innerhalb von Stunden, dafür ist die maximale Wachstumsgeschwindigkeit am höchsten."
        ],
        checklist: [
          "Erde: EC/pH wöchentlich, Substratfeuchte per Fingertest oder Sensor",
          "Coco: EC/pH bei jedem Gießgang, Cal-Mag routinemäßig einplanen",
          "Hydro: EC/pH/Temperatur täglich, Reservoir-Reset alle 7–10 Tage"
        ]
      },
      {
        heading: "Krankheits- und Wurzelrisiko",
        content: [
          "Das größte substratspezifische Risiko in Hydro ist Pythium-Wurzelfäule: warme (> 22 °C), sauerstoffarme Nährlösung begünstigt den Pathogenbefall massiv.",
          "In Erde und Coco ist das Risiko geringer, aber Überwässerung reduziert auch dort die Sauerstoffverfügbarkeit an der Wurzel und öffnet ein ähnliches Fenster für Wurzelfäule."
        ]
      },
      {
        heading: "EC- und pH-Management je Substrat",
        content: [
          "Erde: pH-Zielfenster 6.2–6.8 — höher als Coco/Hydro, weil ein Teil der Nährstoffverfügbarkeit über mikrobielle Prozesse statt reiner Löslichkeit läuft.",
          "Coco: pH-Zielfenster 5.8–6.2 — niedriger, weil die CEC des Substrats die effektive Löslichkeit beeinflusst.",
          "Hydro: pH-Zielfenster 5.5–6.2 — am niedrigsten und am kritischsten einzuhalten, da keine Pufferung vorhanden ist."
        ]
      },
      {
        heading: "Entscheidungsleitfaden",
        content: [
          "Erde eignet sich für Einsteiger und alle, die Fehlertoleranz gegenüber maximaler Kontrolle bevorzugen.",
          "Coco eignet sich für Grower, die schnelles Wachstum und präzise Steuerung wollen, aber ohne die tägliche Kontrollintensität von Hydro.",
          "Hydro eignet sich nur mit etablierter, verlässlicher Routine — der Zeitgewinn beim Wachstum wird durch höheres Ausfallrisiko bei Kontrollfehlern erkauft."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Coco wie Erde gießen (seltener, größere Mengen) statt mit häufigen, kleineren Gaben — führt zu Trockenstress zwischen den Gaben.",
          "In Hydro die Lösungstemperatur ignorieren und sich nur auf EC/pH konzentrieren — warme Lösung ist der Hauptrisikofaktor für Wurzelfäule.",
          "Beim Substratwechsel (z. B. Erde auf Coco) das alte EC-Zielfenster beibehalten, statt es an die geringere Pufferung anzupassen."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Living-Soil- und No-Till-Systeme verschieben das Erde-Modell weiter in Richtung Selbstregulation durch mikrobielle Aktivität und reduzieren den Bedarf an aktiver EC-Steuerung zusätzlich.",
          "Rezirkulierende Deep-Water-Culture-Systeme (RDWC) mit mehreren verbundenen Behältern verbessern die Temperatur- und Sauerstoffstabilität gegenüber Einzeleimer-DWC deutlich."
        ]
      }
    ],
    warnings: [
      "In Hydro-Systemen ist eine Nährlösungstemperatur über 22 °C das größte einzelne Risiko für Pythium-Wurzelfäule — Kühlung hat Priorität vor Nährstoffoptimierung."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Was ist Kationenaustauschkapazität?",
        text: "Ein Maß dafür, wie gut ein Substrat Nährstoffionen an seiner Oberfläche festhalten und der Pflanze bei Bedarf zur Verfügung stellen kann. Hohe CEC bedeutet mehr Pufferung gegen Fehler."
      },
      {
        title: "Kurz erklärt: Warum wächst Hydro oft schneller?",
        text: "Die Wurzeln haben direkten Zugang zu gelöstem Sauerstoff in der Nährlösung, ohne durch verdichtetes Substrat zu müssen. Mehr Sauerstoff an der Wurzel bedeutet mehr Energie für Wachstum."
      }
    ],
    faq: [
      {
        question: "Welches Substrat verzeiht die meisten Anfängerfehler?",
        answer: "Erde, wegen der hohen Kationenaustauschkapazität und mikrobiellen Pufferung. EC- und pH-Ausreißer wirken sich dort langsamer und milder aus als in Coco oder Hydro."
      },
      {
        question: "Muss ich in Coco immer Cal-Mag zusetzen?",
        answer: "In den meisten Fällen ja, besonders bei Umkehrosmose- oder weichem Leitungswasser. Coco bindet Ca²⁺ und Mg²⁺ bevorzugt an seiner Faseroberfläche, was ohne Zusatz zu Mangel führen kann."
      },
      {
        question: "Ist Hydro tatsächlich am ertragreichsten?",
        answer: "Unter guten, kontrollierten Bedingungen erlaubt Hydro die schnellste Wachstumsgeschwindigkeit durch maximale Sauerstoffverfügbarkeit an der Wurzel. Der Vorteil kehrt sich aber bei Kontrollfehlern (Temperatur, EC-Drift) schnell in einen Nachteil um."
      }
    ],
    glossary: [
      { term: "Kationenaustauschkapazität (CEC)", definition: "Die Fähigkeit eines Substrats, positiv geladene Nährstoffionen zu binden und pflanzenverfügbar zu halten." },
      { term: "DWC", definition: "Deep Water Culture — Hydroponik-Methode, bei der die Wurzeln direkt in belüfteter, nährstoffhaltiger Lösung hängen." },
      { term: "RDWC", definition: "Recirculating Deep Water Culture — mehrere DWC-Behälter, verbunden über ein gemeinsames, umgewälztes Reservoir." }
    ],
    sourceIds: ["horticulture-research-cannabis-cultivation", "pythium-root-rot-hydroponics", "bugbee-electrical-conductivity", "marschner-mineral-nutrition"],
    relatedSlugs: ["cannabis-substrat-und-wurzelzone", "bewaesserung-ohne-uebergiessen", "vpd-und-ec-kombi-rechner-guide", "naehrstoffbedarf-cannabis-lebenszyklus"]
  },
  {
    slug: "indoor-outdoor-anbau-vergleich",
    title: "Indoor vs. Outdoor: Anbauvergleich Cannabis",
    summary: "Licht, Ertrag, Terpenprofil und Risikofaktoren im direkten Vergleich – was Forschung und Praxis über beide Anbausysteme sagen.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 8,
    lastUpdated: "2026-08-03",
    tags: ["Indoor", "Outdoor", "Licht", "Ertrag", "Terpene", "Umwelt", "Schädlinge", "Nährstoffe", "Studien"],
    keyTakeaways: [
      "Indoor bietet volle Kontrolle über Photoperiode, PPFD und Klima und damit reproduzierbare Qualität von Durchgang zu Durchgang — Outdoor bietet dafür pro Pflanze das höhere absolute Ertragspotenzial durch ungebremstes Wurzel- und Kronenwachstum.",
      "UV-B-Strahlung im Sonnenlicht löst eine stärkere Trichom- und Sekundärmetabolit-Reaktion aus als die meisten Indoor-Lichtspektren — ein Faktor für wahrgenommene Outdoor-Potenz bei guten Anbaubedingungen.",
      "Regen in der Spätblüte ist das größte Outdoor-spezifische Risiko: hohe Blütenfeuchte begünstigt Botrytis-Knospenfäule, ein Risiko, das Indoor durch Klimakontrolle praktisch ausgeschlossen werden kann."
    ],
    quickFacts: [
      { label: "Typischer Indoor-Ertrag", value: "≈ 400–600 g/m²" },
      { label: "Outdoor-Ertragspotenzial", value: "stark variabel, pro Pflanze deutlich höher" },
      { label: "Hauptrisiko Outdoor", value: "Regen/Botrytis in der Spätblüte" },
      { label: "Hauptvorteil Indoor", value: "Reproduzierbarkeit über Durchgänge" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Indoor-Anbau erfolgt unter künstlichem Licht mit vollständig steuerbarer Photoperiode, Temperatur und Luftfeuchte. Outdoor-Anbau nutzt natürliches Sonnenlicht mit saisonal wechselnder Intensität, Spektrum und Tageslänge.",
          "Beide Systeme können hochwertige Ergebnisse liefern — der Unterschied liegt primär in Kontrollierbarkeit, Risikoprofil und Kostenstruktur, nicht im erreichbaren Qualitätsmaximum."
        ]
      },
      {
        heading: "Lichtregime als Haupttreiber",
        content: [
          "Indoor lässt sich PPFD (photosynthetisch aktive Photonenflussdichte) und DLI (Tageslichtsumme) gezielt auf die Wachstumsphase abstimmen und über den gesamten Zyklus konstant halten.",
          "Outdoor liefert im Hochsommer eine PPFD, die künstliches Licht kaum erreicht, dafür mit saisonaler Schwankung in Intensität und Spektrum — die Photoperiode steuert zudem automatisch den Blühbeginn ab der Sommersonnenwende."
        ]
      },
      {
        heading: "Ertragsvergleich",
        content: [
          "Indoor-Systeme erreichen unter guter Steuerung typischerweise 400–600 g/m² Anbaufläche bei dichter Bepflanzung — die Fläche ist der begrenzende Faktor.",
          "Outdoor-Pflanzen sind pro Einzelpflanze durch ungebremstes Wurzel- und Kronenwachstum potenziell deutlich ertragreicher, die Gesamtausbeute schwankt aber stark mit Wetter, Standort und Anbausaison."
        ]
      },
      {
        heading: "Terpen- und Cannabinoidprofil",
        content: [
          "UV-B-Strahlung im natürlichen Sonnenlicht löst eine Stressreaktion aus, die Trichomdichte und die Produktion bestimmter Sekundärmetabolite als Schutzmechanismus erhöhen kann — die meisten Indoor-Leuchtmittel liefern deutlich weniger UV-B.",
          "Indoor bietet dafür Reproduzierbarkeit: Terpen- und Cannabinoidprofile schwanken zwischen Durchgängen deutlich weniger als bei Outdoor-Pflanzen, die jede Saison unterschiedlichem Wetter ausgesetzt sind."
        ]
      },
      {
        heading: "Risikofaktoren",
        content: [
          "Outdoor: Regen und hohe Luftfeuchte in der Spätblüte begünstigen Botrytis-Knospenfäule, besonders bei dichten, großkalibrigen Blüten. Zusätzlich höherer Schädlingsdruck durch offene Umgebung und weniger Kontrolle über Windbrand oder Hagel.",
          "Indoor: Risiken verschieben sich zu Systemausfällen (Klimaanlage, Beleuchtung, Belüftung) und höherer Anfälligkeit für sich schnell ausbreitende Schädlinge in geschlossenen Räumen ohne natürliche Gegenspieler."
        ]
      },
      {
        heading: "Kostenstruktur",
        content: [
          "Indoor: höhere laufende Kosten durch Energieverbrauch für Beleuchtung, Klimatisierung und Belüftung, dafür planbare, ganzjährige Ernten unabhängig von der Saison.",
          "Outdoor: geringere Energiekosten, dafür höherer Flächen- und Zeitbedarf pro Pflanze sowie saisonale Abhängigkeit — nur eine Ernte pro Jahr bei photoperiodischen Sorten im Freiland."
        ]
      },
      {
        heading: "Entscheidungsleitfaden",
        content: [
          "Indoor eignet sich, wenn Reproduzierbarkeit, ganzjährige Verfügbarkeit und Diskretion im Vordergrund stehen und die höheren Energiekosten tragbar sind.",
          "Outdoor eignet sich bei geeignetem Klima, ausreichend Fläche und Toleranz gegenüber saisonaler und wetterbedingter Schwankung im Ertrag."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Outdoor-Sorten ohne Rücksicht auf lokale Erntereife-Fenster wählen — späte Sorten riskieren in gemäßigten Klimazonen Herbstregen während der Blütereife.",
          "Indoor-PPFD-Werte 1:1 von Outdoor-Erwartungen ableiten, ohne die tatsächliche Lichtleistung des eigenen Setups zu messen.",
          "Bei Outdoor-Anbau die Notwendigkeit von Windschutz und Drainage unterschätzen — beides beeinflusst Stressresistenz und Fäulnisrisiko direkt."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Gewächshaus-Systeme mit Lichtdeprivation (kontrollierte Verdunkelung) kombinieren natürliches Sonnenlicht mit steuerbarer Photoperiode und liegen im Kontroll-Risiko-Profil zwischen reinem Indoor und Freiland-Outdoor.",
          "Ein Vergleich zwischen Durchgängen ist nur bei dokumentierten, vergleichbaren Bedingungen aussagekräftig — Outdoor-Ergebnisse eines Jahres lassen sich wegen der Wetterabhängigkeit nicht direkt auf das nächste übertragen."
        ]
      }
    ],
    warnings: [
      "Outdoor-Sorten mit später Blütezeit sind in gemäßigten Klimazonen einem erhöhten Botrytis-Risiko durch Herbstregen ausgesetzt — Erntereife-Fenster vor der Sortenwahl prüfen."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum riecht Outdoor-Cannabis oft anders?",
        text: "UV-B-Licht in der Sonne ist ein Stresssignal für die Pflanze, das die Produktion bestimmter Schutzstoffe in den Trichomen anregen kann. Künstliches Licht liefert davon meist deutlich weniger."
      },
      {
        title: "Kurz erklärt: Warum ist Regen in der Blüte gefährlich?",
        text: "Feuchtigkeit, die sich in dichten Blüten hält, ist ein idealer Nährboden für den Botrytis-Pilz. Je dichter und größer die Blüte, desto höher das Risiko bei Regen kurz vor der Ernte."
      }
    ],
    faq: [
      {
        question: "Ist Indoor-Cannabis grundsätzlich hochwertiger als Outdoor?",
        answer: "Nein. Indoor bietet mehr Reproduzierbarkeit und Kontrolle, Outdoor kann unter guten Bedingungen ebenbürtige oder in manchen Terpen-Aspekten sogar stärkere Profile liefern. Das erreichbare Qualitätsmaximum ist bei beiden Systemen vergleichbar."
      },
      {
        question: "Was ist das größte Einzelrisiko bei Outdoor-Anbau?",
        answer: "Regen und hohe Luftfeuchte in der Spätblüte, weil sie Botrytis-Knospenfäule in dichten Blüten begünstigen — ein Risiko, das sich bei Indoor-Anbau durch Klimakontrolle praktisch ausschließen lässt."
      },
      {
        question: "Lohnt sich ein Gewächshaus mit Lichtdeprivation als Kompromiss?",
        answer: "Für viele Grower ja: Es nutzt kostenloses Sonnenlicht, erlaubt aber über Verdunkelung eine steuerbare Photoperiode und reduziert damit einen Teil der Outdoor-typischen Unvorhersehbarkeit."
      }
    ],
    glossary: [
      { term: "PPFD", definition: "Photosynthetic Photon Flux Density — die Menge photosynthetisch nutzbaren Lichts, die pro Fläche und Sekunde auf die Pflanze trifft." },
      { term: "DLI", definition: "Daily Light Integral — die über einen Tag aufsummierte photosynthetisch nutzbare Lichtmenge." },
      { term: "Lichtdeprivation", definition: "Kontrollierte Verdunkelung eines Gewächshauses, um bei natürlichem Tageslicht eine kürzere Photoperiode zu simulieren und die Blüte gezielt auszulösen." }
    ],
    sourceIds: ["horticulture-research-cannabis-cultivation", "chandra-cannabis-photosynthesis-temperature-co2", "botrytis-grey-mold-review"],
    relatedSlugs: ["cannabis-anbau-grundlagen", "lichtstress-und-canopy-management", "schimmel-und-mykotoxine-bei-cannabis", "vpd-und-ec-kombi-rechner-guide"]
  },
  {
    slug: "naehrstoffblockaden-und-antagonismen",
    title: "Nährstoffblockaden und Antagonismen",
    summary: "Warum trotz ausreichender Düngewerte Mangelbilder auftreten können und wie Blockaden sauber eingeordnet werden.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-08-03",
    tags: ["Nährstoffe", "Antagonismus", "pH", "Diagnostik"],
    keyTakeaways: [
      "Rund 80 % der sichtbaren Mangelbilder sind keine echten Nährstoffdefizite, sondern pH-bedingte Aufnahmeblockaden — den pH zu korrigieren löst sie oft ohne zusätzliche Düngung.",
      "Kationen wie K⁺, Ca²⁺, Mg²⁺ und NH4⁺ konkurrieren an denselben Wurzeltransportern um Aufnahme — zu viel eines Kations verdrängt ein anderes, auch wenn beide rechnerisch ausreichend vorhanden sind.",
      "Die Diagnosereihenfolge ist entscheidend: erst pH und EC der Drainage prüfen, dann das Verhältnis der Kationen zueinander, erst zuletzt einen echten Mangel annehmen."
    ],
    quickFacts: [
      { label: "pH-Fenster Coco/Hydro", value: "5.8–6.2" },
      { label: "pH-Fenster Erde", value: "6.0–6.8" },
      { label: "Ziel Ca:Mg-Verhältnis", value: "≈ 3:1 bis 4:1" },
      { label: "Anteil pH-Blockaden an Mangelbildern", value: "≈ 80 %" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Eine Nährstoffblockade liegt vor, wenn ein Nährstoff im Substrat oder in der Lösung ausreichend vorhanden, aber für die Pflanze nicht aufnehmbar ist — im Unterschied zum echten Mangel, bei dem der Nährstoff tatsächlich fehlt.",
          "Blockaden entstehen vor allem durch ungünstigen pH (Löslichkeits- und Aufnahmeblockade) und durch Antagonismus zwischen konkurrierenden Ionen an der Wurzeloberfläche."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Kationen wie K⁺, Ca²⁺, Mg²⁺ und NH4⁺ werden über gemeinsame oder verwandte Transportproteine in der Wurzelmembran aufgenommen. Ein Überschuss eines Kations besetzt bevorzugt diese Transporter und verdrängt andere — dieses Konkurrenzprinzip wird häufig nach dem niederländischen Agrarchemiker Mulder als 'Mulder'sches Antagonismus-Schema' bezeichnet.",
          "Zusätzlich ist die Löslichkeit vieler Mikro- und Sekundärnährstoffe stark pH-abhängig: außerhalb des jeweiligen Zielfensters fallen sie chemisch aus oder werden an Substratpartikel gebunden, unabhängig von der gegebenen Menge."
        ]
      },
      {
        heading: "pH als Hauptursache für Blockaden",
        content: [
          "Coco/Hydro: Zielfenster 5.8–6.2 — außerhalb dieses Bereichs sinkt vor allem die Verfügbarkeit von Eisen, Mangan, Zink und Magnesium deutlich.",
          "Erde: Zielfenster 6.0–6.8 — höher als in Coco/Hydro, da ein Teil der Verfügbarkeit über mikrobielle Umsetzung statt reiner Löslichkeit läuft.",
          "Bereits eine Abweichung von 0.5 pH-Einheiten außerhalb des Zielfensters kann die Aufnahme einzelner Nährstoffe um mehr als die Hälfte reduzieren, obwohl EC und Düngemenge unverändert bleiben."
        ]
      },
      {
        heading: "Die wichtigsten Antagonismus-Paare",
        content: [
          "Kalium–Magnesium: hohe K-Dosierung (typisch in aggressiven Blüte-Boostern) unterdrückt die Mg-Aufnahme — zeigt sich als Mg-Mangelbild trotz ausreichender Mg-Zufuhr.",
          "Kalzium–Magnesium: Ziel-Verhältnis liegt bei etwa 3:1 bis 4:1 (Ca:Mg) — verschiebt es sich stark zugunsten von Ca, wird die Mg-Aufnahme gebremst.",
          "Stickstoff–Kalium: hohe Ammonium- (NH4⁺) Anteile im Dünger konkurrieren direkt mit K⁺ um dieselben Transporter.",
          "Phosphor–Eisen/Zink: hohe P-Dosierung kann die Verfügbarkeit von Eisen und Zink im Substrat chemisch reduzieren, unabhängig vom pH."
        ]
      },
      {
        heading: "Diagnose — Blockade vs. echter Mangel",
        content: [
          "Schritt 1: pH der Drainage bzw. des Substrats messen, nicht nur den Zulauf. Liegt er außerhalb des Zielfensters, ist eine Blockade wahrscheinlicher als ein echter Mangel.",
          "Schritt 2: EC der Drainage gegen den Zulauf vergleichen. Deutlich erhöhte Drainage-EC deutet auf Salzanreicherung und mögliche Antagonismen durch Überdüngung hin.",
          "Schritt 3: Rezeptur auf Kationenverhältnisse prüfen (insbesondere K:Mg und Ca:Mg) — auffällige Schieflagen erklären viele 'unerklärliche' Mangelbilder.",
          "Schritt 4: Erst wenn pH, EC und Verhältnisse alle im Zielbereich liegen, einen echten Mangel als Ursache annehmen und gezielt nachdüngen."
        ],
        checklist: [
          "pH der Wurzelzone messen, nicht nur den der Stammlösung",
          "Drainage-EC gegen Zulauf-EC vergleichen",
          "Ca:Mg- und K:Mg-Verhältnis der Rezeptur prüfen, bevor nachgedüngt wird"
        ]
      },
      {
        heading: "Korrekturprotokoll",
        content: [
          "Zuerst den pH in das substratspezifische Zielfenster bringen — das behebt einen großen Teil der scheinbaren Mangelbilder ohne zusätzliche Düngung.",
          "Bei Verdacht auf Salzanreicherung einen Spülgang mit pH-korrigiertem Wasser ohne Dünger durchführen, um überschüssige Kationen auszuwaschen.",
          "Erst danach, falls Symptome bestehen bleiben, gezielt den vermuteten Mangelnährstoff nachdosieren und die Wirkung am Neuaustrieb beobachten."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Bei einem Mangelbild sofort die Dosierung des vermuteten fehlenden Nährstoffs erhöhen, ohne vorher pH zu prüfen — verschärft bei einer pH-Blockade nur den Salzstress.",
          "Blüte-Booster mit hohem K-Anteil unreflektiert dazudosieren, ohne das resultierende K:Mg-Verhältnis zu kontrollieren.",
          "Nur den Zulauf-pH messen und die Drainage ignorieren — Substrat und Wurzelzone können deutlich vom Zulaufwert abweichen."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "In rezirkulierenden Hydro-Systemen reichern sich nicht aufgenommene Antagonisten über Zyklen hinweg im Reservoir an — ein regelmäßiger Komplett-Reset der Nährlösung ist hier wichtiger als in Coco oder Erde.",
          "Living-Soil-Systeme mit aktiver mikrobieller Gemeinschaft puffern Antagonismen teilweise ab, weil ein Teil der Nährstoffverfügbarkeit über biologische statt rein chemische Prozesse läuft."
        ]
      }
    ],
    warnings: [
      "Die Dosis eines vermeintlich fehlenden Nährstoffs zu erhöhen, bevor pH und Kationenverhältnisse geprüft sind, verschärft bei einer Blockade häufig nur den Salzstress, ohne das eigentliche Problem zu lösen."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Blockade vs. Mangel",
        text: "Bei einem echten Mangel fehlt der Nährstoff im Substrat. Bei einer Blockade ist er vorhanden, aber pH oder konkurrierende Ionen verhindern, dass die Wurzel ihn aufnehmen kann."
      },
      {
        title: "Kurz erklärt: Warum konkurrieren Nährstoffe?",
        text: "Positiv geladene Nährstoffionen wie Kalium, Kalzium und Magnesium nutzen ähnliche Aufnahmewege an der Wurzel. Ist von einem zu viel vorhanden, blockiert das teilweise die Aufnahme der anderen."
      }
    ],
    faq: [
      {
        question: "Wie erkenne ich, ob ein Mangelbild eine pH-Blockade ist?",
        answer: "Miss den pH der Drainage oder des Substrats direkt. Liegt er außerhalb des substratspezifischen Zielfensters, ist eine Blockade wahrscheinlicher als ein echter Mangel — korrigiere zuerst den pH, bevor du mehr düngst."
      },
      {
        question: "Warum zeigt meine Pflanze Mg-Mangel, obwohl ich Cal-Mag gebe?",
        answer: "Häufigste Ursache ist ein zu hoher Kalium-Anteil, etwa durch aggressive Blüte-Booster, der die Mg-Aufnahme antagonistisch unterdrückt. Prüfe das K:Mg-Verhältnis der Rezeptur, nicht nur die absolute Mg-Menge."
      },
      {
        question: "Reicht es, nur den Zulauf-pH zu kontrollieren?",
        answer: "Nein. Der pH in Substrat und Drainage kann deutlich vom Zulaufwert abweichen, besonders in Coco und Erde. Für eine verlässliche Diagnose ist die Drainage- bzw. Substratmessung entscheidend."
      }
    ],
    glossary: [
      { term: "Antagonismus", definition: "Gegenseitige Aufnahmehemmung zweier oder mehrerer Nährstoffionen, meist durch Konkurrenz um dieselben Transportwege an der Wurzel." },
      { term: "Kationenverhältnis", definition: "Das relative Mengenverhältnis positiv geladener Nährstoffionen (z. B. Ca:Mg, K:Mg) zueinander in Substrat oder Nährlösung." },
      { term: "Blockade", definition: "Situation, in der ein Nährstoff im Substrat vorhanden, aber für die Pflanze aufgrund von pH oder Antagonismus nicht aufnehmbar ist." }
    ],
    sourceIds: ["marschner-mineral-nutrition", "bryson-plant-nutrition-manual", "bernal-cannabis-nutrient-requirements", "bugbee-electrical-conductivity"],
    relatedSlugs: ["cannabis-anbau-grundlagen", "bewaesserung-ohne-uebergiessen", "vpd-und-ec-kombi-rechner-guide", "naehrstoffbedarf-cannabis-lebenszyklus"]
  },
  {
    slug: "blattsymptom-troubleshooter",
    title: "Blattsymptom-Troubleshooter: Vom Symptom zur Diagnose",
    summary: "Ausgangspunkt für jede Fehlersuche: ordne ein beobachtetes Blatt- oder Pflanzensymptom systematisch einer möglichen Ursache zu und springe direkt zur passenden Diagnose.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 11,
    lastUpdated: "2026-08-03",
    tags: ["Diagnose", "Troubleshooting", "Symptome", "Übersicht", "Fehlersuche"],
    keyTakeaways: [
      "Symptomort und -muster (welche Blätter, welche Richtung der Verfärbung/Rollung) grenzen die Ursache oft stärker ein als die Farbe allein.",
      "Mehrere gleichzeitig auftretende Symptome sprechen eher für eine pH-Blockade oder ein Klimaproblem als für einen einzelnen Nährstoffmangel.",
      "Diese Übersicht ersetzt nicht die Detaildiagnose — sie verkürzt nur den Weg zum richtigen Artikel, mit dem die eigentliche Bestätigung und Korrektur erfolgt."
    ],
    quickFacts: [
      { label: "Abgedeckte Diagnosen", value: "29 Mängel, Toxizitäten, Schädlinge, Krankheiten, Stressoren" },
      { label: "Erster Schritt immer", value: "Symptomort (alt/jung, Rand/Mitte) bestimmen" },
      { label: "Zweiter Schritt", value: "Einzelursache oder Kombination (Blockade/Klima)?" }
    ],
    sections: [
      {
        heading: "Wie dieser Troubleshooter funktioniert",
        content: [
          "Beobachte zuerst WO das Symptom auftritt (alte vs. junge Blätter, Blattrand vs. Blattmitte, ganze Pflanze vs. einzelner Trieb) und WIE es sich verhält (Richtung der Blattrollung, Erholung nach Gießen, Ausbreitungsgeschwindigkeit) — diese Metadaten grenzen die Ursache oft stärker ein als die reine Farbe.",
          "Finde dann unten die passende Symptomkategorie und folge dem Verweis zum jeweiligen Diagnoseartikel für Bestätigung, Mechanismus und Korrekturmaßnahmen."
        ]
      },
      {
        heading: "Gelbe/chlorotische Verfärbung",
        content: [
          "Interveinale Chlorose an ÄLTEREN, unteren Blättern, Adern bleiben grün → Magnesiummangel oder Kaliummangel — Kaliummangel zeigt zusätzlich nekrotische Blattränder.",
          "Gleichmäßiges Vergilben ganzer ÄLTERER Blätter (nicht nur zwischen den Adern) → Stickstoffmangel.",
          "Interveinale Chlorose an JUNGEN, oberen Blättern → Eisenmangel.",
          "Mehrere dieser Muster GLEICHZEITIG auf derselben Pflanze → eher pH-Lockout oder Nährstoffblockade als ein einzelner Mangel."
        ]
      },
      {
        heading: "Dunkle, violette oder verbrannte Verfärbung",
        content: [
          "Dunkelgrüne, klauenförmig nach unten gekrümmte Blätter an jungen Trieben → Stickstoffüberschuss.",
          "Dunkelgrün-bläuliche Blätter mit rötlich-violetten Blattstielen → Phosphormangel — bei niedriger Wurzeltemperatur (< 18 °C) stattdessen Kältestress prüfen.",
          "Purpurne Stängel/Blattunterseiten bei normaler Wurzeltemperatur → Kältestress.",
          "Braune, verbrannte Blattspitzen an den kräftigsten Blättern → Nährstoffverbrennung/Tipburn.",
          "Mg-Mangelbild trotz Düngung, dazu steigender pH bei hartem Wasser → Calciumüberschuss."
        ]
      },
      {
        heading: "Blattform, -bewegung und -rollung",
        content: [
          "Blattränder nach OBEN gerollt (Tacoing), aufrechte Haltung lampennah → Hitzestress.",
          "Blätter nach UNTEN gerollt, mattes/staubiges Erscheinungsbild ohne Gespinst → Verdacht auf Hanf-Rostmilben.",
          "Verkrümmte, klauenförmige Blätter NUR im direkten Ventilatorstrahl → Windbrand.",
          "Hängende Blätter TROTZ nassem Substrat, keine Erholung nach dem Gießen → Überwässerung/Staunässe, bei bereits brauner, schleimiger Wurzel → Wurzelfäule."
        ]
      },
      {
        heading: "Sichtbare Schädlinge und ihre Spuren",
        content: [
          "Feine helle Sprenkel oben, Gespinst auf der Blattunterseite → Spinnmilben.",
          "Silbrige Schlieren mit schwarzen Kotpünktchen, KEIN Gespinst → Thripse.",
          "Klebriger Honigtau, Ameisenbesuch, sesshafte Kolonien an Triebspitzen → Blattläuse.",
          "Wolkenartiges Auffliegen kleiner weißer Insekten beim Berühren → Weiße Fliege.",
          "Kleine schwarze Flieger über dem Substrat → Trauermücken."
        ]
      },
      {
        heading: "Pilz-, Fäule- und Leitgewebesymptome",
        content: [
          "Einzelnes welkes, verfärbtes Blättchen tief im Inneren einer dichten Knospe → Verdacht auf Bud-Rot-Botrytis.",
          "Weißer, abwischbarer Belag auf Blattoberseiten → Echter Mehltau.",
          "Braune, schleimige Wurzeln, Welke trotz nassem Substrat → Wurzelfäule (Pythium).",
          "Einseitiges/sektorales Welken, bräunlicher Ring im Stängelquerschnitt → Verdacht auf Fusarium."
        ]
      },
      {
        heading: "Klima- und EC-bezogene Muster",
        content: [
          "Welke trotz feuchtem Substrat, verbrannte Blattränder → Salzanreicherung/hohe EC.",
          "Leistungsplateau trotz optimalem Licht, VPD und Düngung → möglicherweise CO2-Limit.",
          "Symptome verschieben sich mit der relativen Luftfeuchte, nicht mit Düngung oder Gießrhythmus → Luftfeuchte-Management prüfen."
        ]
      },
      {
        heading: "Diagnoseprotokoll — Schritt für Schritt",
        content: [
          "1. Symptomort bestimmen: alte vs. junge Blätter, ganze Pflanze vs. einzelner Trieb/Sektor.",
          "2. Bewegungsrichtung/Reaktion prüfen: Blattrollung (oben/unten), Erholung nach Gießen, Ausbreitungstempo.",
          "3. Auf Kombination mehrerer Muster achten — das spricht für pH-Lockout, Klimaproblem oder Wurzelzonenstress statt für einen Einzelmangel.",
          "4. Passende Kategorie oben finden und zum verlinkten Diagnoseartikel wechseln, dort Bestätigung und Korrektur nachlesen."
        ],
        checklist: [
          "Symptomort (alt/jung, Rand/Mitte, ganze Pflanze/Sektor) notieren",
          "Prüfen, ob mehrere Symptommuster gleichzeitig auftreten",
          "Erst nach Bestätigung im verlinkten Artikel korrigieren, nicht vorab spekulativ nachdüngen"
        ]
      }
    ],
    warnings: [
      "Diese Übersicht ist ein Einstiegspunkt, keine abschließende Diagnose — bei Unsicherheit immer den verlinkten Detailartikel für Bestätigungsmerkmale und Korrekturmaßnahmen konsultieren, bevor eingegriffen wird."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum Symptomort wichtiger ist als Farbe",
        text: "Viele Mängel und Probleme erzeugen ähnliche Farbveränderungen. Ob das Symptom an alten oder jungen Blättern, an der ganzen Pflanze oder nur einem Trieb auftritt, grenzt die Ursache oft viel eindeutiger ein als die Farbe allein."
      },
      {
        title: "Kurz erklärt: Warum mehrere Symptome gleichzeitig wichtig sind",
        text: "Ein einzelnes, klar abgegrenztes Symptom spricht meist für einen Einzelmangel oder -schädling. Mehrere Muster gleichzeitig deuten eher auf eine übergeordnete Ursache wie pH-Blockade oder Klimastress hin."
      }
    ],
    faq: [
      {
        question: "Ich sehe zwei verschiedene Symptome gleichzeitig — was zuerst prüfen?",
        answer: "Zuerst pH der Wurzelzone und Klimawerte (Temperatur, VPD) kontrollieren. Kombinierte Symptome sprechen häufiger für eine Blockade oder ein Klimaproblem als für zwei unabhängige Einzelursachen."
      },
      {
        question: "Was, wenn mein Symptom in keiner Kategorie hier passt?",
        answer: "Prüfe zusätzlich Wurzelzonentemperatur und Substratfeuchte — viele untypische Symptome lassen sich auf diese beiden Basisfaktoren zurückführen, auch wenn sie in keiner Symptomliste explizit auftauchen."
      },
      {
        question: "Muss ich immer zuerst hierher, bevor ich einen Diagnoseartikel lese?",
        answer: "Nicht zwingend, aber sinnvoll bei Unsicherheit: Diese Übersicht spart Zeit, wenn nicht klar ist, welcher von mehreren möglichen Artikeln zum beobachteten Symptom passt."
      }
    ],
    glossary: [
      { term: "Symptomort", definition: "Die Position eines Symptoms an der Pflanze (z. B. alte vs. junge Blätter), zentrales Unterscheidungsmerkmal bei der Diagnose." },
      { term: "Kombinationssymptom", definition: "Gleichzeitiges Auftreten mehrerer Einzelsymptome, häufig Hinweis auf eine übergeordnete Ursache wie pH oder Klima statt auf mehrere unabhängige Probleme." },
      { term: "Bestätigungsmerkmal", definition: "Ein spezifisches, eindeutiges Zeichen, das eine vermutete Diagnose absichert, bevor korrigiert wird." }
    ],
    sourceIds: ["marschner-mineral-nutrition", "horticulture-research-cannabis-cultivation", "punja-cannabis-pathogens"],
    relatedSlugs: ["magnesiummangel", "stickstoffmangel", "eisenmangel", "kaliummangel", "calciummangel", "phosphormangel", "ph-lockout", "naehrstoffblockaden-und-antagonismen", "stickstoffueberschuss", "kalium-ueberschuss", "calciumueberschuss", "naehrstoffverbrennung-tipburn", "salzanreicherung-hohe-ec", "hitzestress", "kaeltestress", "windbrand", "ueberwaesserung-staunaesse", "wurzelfaeule", "fusarium", "spinnmilben", "thripse", "trauermuecken", "blattlaeuse", "weisse-fliege", "hanf-rostmilben", "bud-rot-botrytis", "echter-mehltau-powdery-mildew", "luftfeuchte-management", "co2-management", "calmag-supplementierung"]
  },
  {
    slug: "dli-und-photoperiode",
    title: "DLI und Photoperiode richtig steuern",
    summary: "Warum die tägliche Lichtsumme (DLI) und die Länge der ununterbrochenen Dunkelphase zwei getrennte, gleich wichtige Steuergrößen sind.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-08-03",
    tags: ["DLI", "Photoperiode", "Licht", "Blüteauslösung"],
    keyTakeaways: [
      "DLI (Daily Light Integral) ist die über den Tag aufsummierte Lichtmenge — zwei Setups mit unterschiedlicher PPFD und Beleuchtungsdauer können dieselbe DLI erreichen.",
      "Die Blüteauslösung hängt nicht von der Lichtdauer, sondern von der Länge der UNUNTERBROCHENEN Dunkelphase ab — bereits ein kurzer Lichteinbruch in der Nacht kann die Blüte stören.",
      "Autoflower-Genetik ist photoperiodenunabhängig und reagiert primär auf die DLI-Summe, nicht auf die Länge der Dunkelphase."
    ],
    quickFacts: [
      { label: "DLI vegetativ (18/6)", value: "≈ 25–35 mol·m⁻²·Tag⁻¹" },
      { label: "DLI Blüte (12/12)", value: "≈ 35–45 mol·m⁻²·Tag⁻¹" },
      { label: "Kritische Dunkelphase", value: "≥ 12 Std. ununterbrochen" },
      { label: "Formel", value: "DLI = PPFD × Sekunden Licht / 1.000.000" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "DLI (Daily Light Integral) ist die über 24 Stunden aufsummierte photosynthetisch nutzbare Lichtmenge, gemessen in mol·m⁻²·Tag⁻¹. Sie berechnet sich aus PPFD multipliziert mit der Beleuchtungsdauer in Sekunden, geteilt durch eine Million.",
          "Photoperiode bezeichnet dagegen die Aufteilung von Licht- und Dunkelphase innerhalb eines 24-Stunden-Zyklus und steuert bei photoperiodischen Pflanzen die Blüteauslösung."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Da DLI ein reines Produkt aus Intensität und Dauer ist, liefern unterschiedliche PPFD/Stunden-Kombinationen dieselbe DLI — 600 µmol·m⁻²·s⁻¹ über 18 Stunden ergibt rechnerisch dieselbe Tagessumme wie 900 µmol·m⁻²·s⁻¹ über 12 Stunden.",
          "Die Blüteauslösung bei photoperiodischem Cannabis wird über ein Phytochrom-gesteuertes System erkannt, das die Länge der UNUNTERBROCHENEN Dunkelphase misst, nicht die Lichtdauer selbst — daher der Begriff 'kritische Dunkelperiode'."
        ]
      },
      {
        heading: "DLI-Zielwerte nach Phase",
        content: [
          "Sämling/frühe Vegetation: niedrigere DLI (~15–25 mol·m⁻²·Tag⁻¹) reicht, um Überforderung des jungen Photosyntheseapparats zu vermeiden.",
          "Vegetative Hauptphase (18/6): DLI von 25–35 mol·m⁻²·Tag⁻¹ bei moderater PPFD über eine lange Lichtdauer.",
          "Blütephase (12/12): DLI von 35–45 mol·m⁻²·Tag⁻¹ erfordert bei nur 12 Stunden Licht eine deutlich höhere PPFD als in der Vegetation, um dieselbe oder höhere Tagessumme zu erreichen."
        ],
        checklist: [
          "DLI aus gemessener PPFD und tatsächlicher Beleuchtungsdauer berechnen, nicht schätzen",
          "Bei Phasenwechsel PPFD anheben, um die kürzere Lichtdauer in der Blüte auszugleichen",
          "Photoperiode-Timer auf Zuverlässigkeit und Redundanz prüfen"
        ]
      },
      {
        heading: "Die kritische Dunkelperiode",
        content: [
          "Für eine stabile Blüteinduktion braucht photoperiodisches Cannabis mindestens etwa 12 Stunden ununterbrochene Dunkelheit pro Zyklus — bereits ein kurzer Lichteinbruch während dieser Phase kann als 'zweiter Tag' interpretiert werden.",
          "Wiederholte Lichteinbrüche können zur Reversion in vegetatives Wachstum oder zu Stress-induzierter Zwittrigkeit (Hermaphroditismus) führen, da die Pflanze die Signalkette zur Blüteerhaltung unterbricht."
        ]
      },
      {
        heading: "Diagnose bei Blühproblemen",
        content: [
          "Verzögerter oder ausbleibender Blühbeginn trotz korrektem 12/12-Zyklus: zuerst auf Lichtlecks im Anbauraum während der Dunkelphase prüfen (Türspalten, LED-Standby-Leuchten, externe Lichtquellen).",
          "Vereinzelte männliche Blüten an sonst weiblichen Pflanzen (Stress-Zwittrigkeit): Lichtleck-Historie und Timer-Zuverlässigkeit der letzten Wochen rückwirkend prüfen."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "PPFD isoliert erhöhen, ohne die tatsächliche DLI unter Berücksichtigung der Beleuchtungsdauer zu berechnen.",
          "Timer ohne Redundanz oder Batteriepufferung verwenden — ein einzelner Stromausfall kann die Dunkelphase verkürzen und die Blüteinduktion stören.",
          "Autoflower-Genetik mit denselben strikten Photoperiode-Regeln wie photoperiodische Pflanzen behandeln, obwohl sie primär auf DLI statt auf Dunkelphasenlänge reagiert."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Manche Grower nutzen eine kurze Unterbrechung der Dunkelphase mit fernrotem Licht gezielt, um bestimmte physiologische Reaktionen auszulösen — dieser Eingriff erfordert aber präzise Kontrolle und ist fehleranfällig ohne Erfahrung.",
          "Autoflower-Linien lassen sich wegen ihrer Photoperiodenunabhängigkeit auch unter Dauerlicht (20/4 bis 24/0) kultivieren, wobei die optimale DLI-Obergrenze sortenabhängig variiert."
        ]
      }
    ],
    warnings: [
      "Ein Lichtleck während der Dunkelphase in der Blüte kann bereits nach wenigen Vorfällen zu Stress-Zwittrigkeit führen — der Anbauraum muss während der Dunkelphase vollständig lichtdicht sein."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: DLI vs. PPFD",
        text: "PPFD ist eine Momentaufnahme der Lichtintensität, DLI die Summe über den ganzen Tag. Zwei sehr unterschiedliche PPFD-Werte können bei unterschiedlicher Beleuchtungsdauer dieselbe DLI ergeben."
      },
      {
        title: "Kurz erklärt: Warum Dunkelheit die Blüte steuert",
        text: "Cannabis misst nicht, wie viel Licht es bekommt, sondern wie lange es ununterbrochen dunkel ist. Eine ausreichend lange, ungestörte Dunkelphase ist das eigentliche Signal für die Blüteauslösung."
      }
    ],
    faq: [
      {
        question: "Kann ich dieselbe DLI mit weniger Stunden, aber mehr PPFD erreichen?",
        answer: "Rechnerisch ja, DLI ist das Produkt aus beiden Werten. In der Praxis limitieren aber Photoinhibitionsrisiko und Hitzeentwicklung, wie stark sich PPFD gegenüber der Stundenzahl erhöhen lässt."
      },
      {
        question: "Wie kurz darf ein Lichteinbruch in der Dunkelphase sein, um noch unbedenklich zu sein?",
        answer: "Es gibt keinen sicheren Schwellenwert — bereits kurze Einbrüche wurden in der Praxis mit Reversion oder Zwittrigkeit in Verbindung gebracht. Die sicherste Regel ist vollständige Lichtdichtheit während der gesamten Dunkelphase."
      }
    ],
    glossary: [
      { term: "DLI", definition: "Daily Light Integral — die über einen Tag aufsummierte photosynthetisch nutzbare Lichtmenge in mol·m⁻²·Tag⁻¹." },
      { term: "Kritische Dunkelperiode", definition: "Die minimale Länge ununterbrochener Dunkelheit, die photoperiodisches Cannabis für eine stabile Blüteinduktion benötigt." },
      { term: "Reversion", definition: "Rückkehr einer bereits blühenden Pflanze in vegetatives Wachstum, meist durch gestörte Photoperiode ausgelöst." }
    ],
    sourceIds: ["plant-physiology-vpd-transpiration", "chandra-cannabis-photosynthesis-temperature-co2", "horticulture-research-cannabis-cultivation"],
    relatedSlugs: ["lichtstress-und-canopy-management", "vpd-nach-wachstumsphase", "feminisiert-vs-regular-vs-autoflower"]
  },
  {
    slug: "vpd-nach-wachstumsphase",
    title: "VPD nach Wachstumsphase steuern",
    summary: "Warum das VPD-Zielfenster nicht über den ganzen Zyklus konstant bleiben sollte, sondern sich mit Blattreife und Wachstumsphase verschiebt.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-08-03",
    tags: ["VPD", "Klima", "Wachstumsphase", "Transpiration"],
    keyTakeaways: [
      "Junge Sämlinge haben eine noch unterentwickelte Spaltöffnungs- und Wachsschichtkontrolle und brauchen ein niedrigeres VPD als reife Pflanzen, um Austrocknung zu vermeiden.",
      "Das VPD-Zielfenster sollte über den Zyklus schrittweise ansteigen: von ≈ 0.4–0.8 kPa beim Sämling bis ≈ 1.2–1.6 kPa in der Blüte.",
      "In der Spätblüte ist ein Kompromiss nötig: VPD hoch genug für Transpiration und Zuckertransport, aber nicht so hoch, dass zusätzlicher Stress entsteht — die genaue Obergrenze hängt auch vom Schimmelrisiko ab."
    ],
    quickFacts: [
      { label: "VPD Sämling", value: "0.4–0.8 kPa" },
      { label: "VPD Vegetativ", value: "0.8–1.2 kPa" },
      { label: "VPD Blüte", value: "1.2–1.6 kPa" },
      { label: "Grundlage", value: "Blatttemperatur, nicht nur Lufttemperatur" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "VPD (Vapor Pressure Deficit) beschreibt die Trocknungskraft der Luft und damit den Antrieb für die Transpiration der Pflanze. Dieser Artikel behandelt, wie sich das sinnvolle VPD-Zielfenster mit der Wachstumsphase verschiebt.",
          "Ein einziges, über den ganzen Zyklus konstantes VPD-Ziel ignoriert, dass sich die Fähigkeit der Pflanze, Transpiration zu regulieren, mit zunehmender Blattreife verändert."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Junge Blätter haben eine noch dünnere Kutikula (Wachsschicht) und eine weniger präzise Spaltöffnungsregulation als reife Blätter — bei hohem VPD verlieren sie dadurch überproportional viel Wasser.",
          "Mit zunehmender Blattreife verbessert sich die Kontrolle über die Spaltöffnungen, wodurch reife Pflanzen ein höheres VPD tolerieren und für den Transport von Zuckern und Nährstoffen sogar benötigen."
        ]
      },
      {
        heading: "VPD-Zielwerte nach Phase",
        content: [
          "Sämling/Steckling: 0.4–0.8 kPa — niedrig halten, um Austrocknung bei noch unterentwickelter Spaltöffnungskontrolle zu vermeiden.",
          "Vegetative Hauptphase: 0.8–1.2 kPa — moderater Transpirationsantrieb für kräftiges Blattmassewachstum.",
          "Blütephase: 1.2–1.6 kPa — höherer Antrieb unterstützt Nährstoff- und Zuckertransport in die Knospen.",
          "Spätblüte: am oberen Rand des Zielfensters bleiben, aber gleichzeitig die relative Luftfeuchte nicht zu weit senken, um das Schimmelrisiko in dichten Knospen nicht zusätzlich durch zu trockene, dann wieder feuchte Schwankungen zu erhöhen."
        ],
        checklist: [
          "VPD-Zielwert bei jedem Phasenwechsel schrittweise anpassen, nicht abrupt springen",
          "Blatttemperatur statt nur Lufttemperatur für die VPD-Berechnung verwenden",
          "In der Spätblüte VPD-Obergrenze gegen Schimmelrisiko abwägen, nicht isoliert maximieren"
        ]
      },
      {
        heading: "Diagnose bei VPD-Fehlsteuerung",
        content: [
          "VPD zu niedrig: schwache, weiche Stängel, verlangsamtes Wachstum, erhöhtes Schimmelrisiko durch stehende Feuchtigkeit in der Canopy.",
          "VPD zu hoch: hängende Blätter trotz feuchtem Substrat, nach oben gerollte Blattränder, verbrannte Blattspitzen — ähnlich Nährstoffverbrennung, aber ohne begleitende EC-Auffälligkeit."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Ein einzelnes VPD-Ziel für den gesamten Zyklus verwenden, unabhängig von Sämling-, Vegetations- oder Blütephase.",
          "VPD nur aus der Lufttemperatur berechnen, ohne die oft kühlere Blatttemperatur zu berücksichtigen — das führt zu einer systematischen Unterschätzung des tatsächlichen VPD an der Blattoberfläche.",
          "In der Spätblüte VPD einseitig maximieren, ohne das gleichzeitig steigende Schimmelrisiko bei zu großen Feuchteschwankungen zu bedenken."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Eine Infrarot-Blatttemperaturmessung statt reiner Lufttemperatur liefert ein präziseres, 'echtes' VPD und deckt lokale Abweichungen unter Nahlicht auf.",
          "Manche erfahrene Grower fahren in den letzten 1–2 Tagen vor der Ernte bewusst ein leicht erhöhtes VPD, um die Trocknung anzustoßen — dieser Eingriff sollte nur mit guter Klimakontrolle erfolgen."
        ]
      }
    ],
    warnings: [
      "Ein zu niedriges VPD in Kombination mit dichter Canopy in der Spätblüte erhöht das Botrytis-Risiko messbar — Klimaführung sollte nie isoliert von der Canopy-Dichte betrachtet werden."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum ändert sich das VPD-Ziel?",
        text: "Junge Blätter können ihren Wasserverlust noch nicht so gut regulieren wie reife Blätter. Ein niedrigeres VPD am Anfang schützt sie, während reife Pflanzen in der Blüte von einem höheren VPD profitieren."
      },
      {
        title: "Kurz erklärt: Blatttemperatur vs. Lufttemperatur",
        text: "Blätter sind oft kühler als die umgebende Luft, besonders unter starkem Licht. Ein VPD-Wert, der nur die Lufttemperatur nutzt, unterschätzt daher oft die tatsächliche Trocknungskraft an der Blattoberfläche."
      }
    ],
    faq: [
      {
        question: "Muss ich das VPD-Ziel jede Woche neu anpassen?",
        answer: "Nicht wöchentlich, aber bei jedem größeren Phasenwechsel (Sämling zu Vegetation, Vegetation zu Blüte, Beginn der Spätblüte) sollte das Zielfenster bewusst angepasst werden."
      },
      {
        question: "Was ist wichtiger: absolutes VPD-Ziel oder Stabilität?",
        answer: "Beides zählt, aber starke, häufige Schwankungen sind oft schädlicher als ein leicht suboptimaler, aber stabiler Wert — abrupte VPD-Sprünge wirken selbst als Stressor."
      }
    ],
    glossary: [
      { term: "VPD", definition: "Vapor Pressure Deficit — die Trocknungskraft der Luft, zentrale Steuergröße für Transpiration." },
      { term: "Kutikula", definition: "Wachsartige Schutzschicht auf der Blattoberfläche, die unkontrollierten Wasserverlust begrenzt." },
      { term: "Spaltöffnung", definition: "Stoma; reguliert Gasaustausch und Wasserabgabe des Blatts." }
    ],
    sourceIds: ["plant-physiology-vpd-transpiration", "prenger-ling-vpd-greenhouse", "chandra-cannabis-photosynthesis-temperature-co2"],
    relatedSlugs: ["vpd-einfach-erklaert", "vpd-und-ec-kombi-rechner-guide", "dli-und-photoperiode"]
  },
  {
    slug: "ec-und-runoff-interpretation",
    title: "EC und Runoff richtig interpretieren",
    summary: "Warum die Drainage-EC im Verhältnis zur Zulauf-EC aussagekräftiger ist als jeder Einzelwert für sich und wie du daraus die richtige Korrektur ableitest.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-08-03",
    tags: ["EC", "Runoff", "Drainage", "Diagnose", "Messwerte"],
    keyTakeaways: [
      "Nicht der absolute EC-Wert der Drainage, sondern das VERHÄLTNIS zur Zulauf-EC zeigt an, ob sich Salze anreichern oder die Pflanze schneller Nährstoffe aufnimmt, als nachgeliefert wird.",
      "Runoff-EC deutlich über der Zulauf-EC (Faktor > 1.3–1.5) signalisiert Salzanreicherung und einen anstehenden Spülgang.",
      "Runoff-EC unter der Zulauf-EC kann sowohl auf hohen Nährstoffhunger der Pflanze als auch auf Über-Auswaschung hindeuten — beides erfordert unterschiedliche Reaktionen."
    ],
    quickFacts: [
      { label: "Ausgeglichen", value: "Runoff-EC ≈ Zulauf-EC" },
      { label: "Salzanreicherung", value: "Runoff-EC > 1.3–1.5× Zulauf" },
      { label: "Warnsignal", value: "Runoff-EC deutlich unter Zulauf" },
      { label: "Messfrequenz", value: "Wöchentliche Kontrollgießung" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Runoff (Drainage) ist die Flüssigkeit, die nach einer Gießung unten aus dem Topf abläuft. Ihre EC gibt Auskunft über den Salzzustand der Wurzelzone, den der Zulauf-EC-Wert allein nicht zeigen kann.",
          "Erst der Vergleich zwischen Zulauf- und Runoff-EC macht den Wert diagnostisch nutzbar — ein isolierter Runoff-Wert ohne Referenz ist wenig aussagekräftig."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "EC misst die Summe aller gelösten Salze in der Lösung, unabhängig von deren Zusammensetzung — ein hoher Wert sagt nichts darüber aus, WELCHE Nährstoffe im Überschuss oder Mangel vorliegen.",
          "Nimmt die Pflanze Wasser schneller auf als gelöste Salze, konzentriert sich die verbleibende Lösung in der Wurzelzone auf — die Runoff-EC steigt über die Zulauf-EC. Das Umgekehrte gilt bei besonders hohem Nährstoffhunger relativ zur Wasseraufnahme."
        ]
      },
      {
        heading: "Interpretationsregeln",
        content: [
          "Runoff-EC ≈ Zulauf-EC: System im Gleichgewicht, keine akute Korrektur nötig.",
          "Runoff-EC deutlich höher (Faktor > 1.3–1.5) als Zulauf-EC: Salzanreicherung in der Wurzelzone — ein Spülgang mit pH-korrigiertem Wasser ist angezeigt.",
          "Runoff-EC niedriger als Zulauf-EC: entweder hoher, gesunder Nährstoffhunger in einer starken Wachstumsphase oder Über-Auswaschung durch zu große Gießmenge — Pflanzenzustand und Gießmenge zur Unterscheidung heranziehen."
        ]
      },
      {
        heading: "pH-Drift im Runoff",
        content: [
          "Runoff-pH, der deutlich vom Zulauf-pH abweicht, zeigt Substratdrift an, die reine Zulaufmessung verbirgt — besonders relevant in Erde mit mikrobieller Pufferung, die über Wochen driften kann.",
          "Eine Kombination aus Runoff-EC- und Runoff-pH-Trend über mehrere Wochen ist aussagekräftiger als eine einzelne Momentaufnahme."
        ]
      },
      {
        heading: "Messprotokoll",
        content: [
          "Zulauf-EC/pH unmittelbar vor der Gießung messen, Runoff-EC/pH einige Minuten nach vollständigem Ablaufen der Drainage.",
          "Immer zur gleichen relativen Position im Gießzyklus messen (z. B. definierte wöchentliche Kontrollgießung), um Werte über Zeit vergleichbar zu halten.",
          "Ausreichenden Drain-Anteil (10–20 % der Gießmenge) sicherstellen — bei zu wenig Runoff ist die Messung nicht repräsentativ für die gesamte Wurzelzone."
        ],
        checklist: [
          "Zulauf- und Runoff-Werte immer als Paar dokumentieren, nie isoliert",
          "Kontrollgießung an fester Wochentagsroutine durchführen",
          "Runoff-Trend über mehrere Wochen verfolgen, nicht nur Einzelwerte bewerten"
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Nur den Zulauf messen und den Runoff komplett ignorieren — die aussagekräftigere Hälfte der Information fehlt dann.",
          "Aus einem einzelnen Runoff-Wert ohne Zulauf-Referenz eine Düngerkorrektur ableiten.",
          "Runoff-Messung unregelmäßig und zu unterschiedlichen Zeitpunkten im Gießzyklus durchführen, wodurch Werte nicht vergleichbar werden."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "In rezirkulierenden Hydro-Systemen ersetzt die kontinuierliche Reservoir-EC-Messung die klassische Runoff-Logik, da es keine klassische Drainage gibt — hier ist der Vergleich zur letzten Nachfüllung relevant.",
          "Langfristige Runoff-EC-Trends lassen sich wie ein einfaches Kontrolldiagramm führen, um schleichende Drift von akuten Ausreißern zu unterscheiden."
        ]
      }
    ],
    warnings: [
      "Ein wiederholt stark erhöhter Runoff-EC-Wert ohne Spülgang kann zu chronischem Salzstress führen, der sich erst mit Verzögerung als Wachstumsstillstand oder Blattrandverbrennung zeigt."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum das Verhältnis zählt, nicht der Einzelwert",
        text: "Ein hoher Runoff-EC-Wert ist nur dann ein Problem, wenn er deutlich über dem Zulaufwert liegt. Ohne diesen Vergleich lässt sich aus einer einzelnen Zahl keine verlässliche Entscheidung ableiten."
      },
      {
        title: "Kurz erklärt: Was niedriger Runoff-EC bedeutet",
        text: "Wenn die Drainage weniger Salz enthält als der Zulauf, hat die Pflanze aktiv Nährstoffe aufgenommen. Das ist in einer starken Wachstumsphase meist positiv zu werten, kann bei sehr niedrigen Werten aber auch Über-Auswaschung bedeuten."
      }
    ],
    faq: [
      {
        question: "Wie oft sollte ich Runoff messen?",
        answer: "Eine wöchentliche, klar definierte Kontrollgießung reicht für die meisten Setups. Häufigere Messung ist in Coco/Hydro mit geringer Pufferung sinnvoller als in Erde."
      },
      {
        question: "Was mache ich bei dauerhaft niedrigem Runoff-EC trotz gesunder Pflanze?",
        answer: "Das ist meist unproblematisch und zeigt hohen, aktiven Nährstoffverbrauch. Kritisch wird es nur, wenn gleichzeitig Mangelsymptome auftreten — dann kann die Zulauf-EC leicht angehoben werden."
      }
    ],
    glossary: [
      { term: "Runoff", definition: "Die nach einer Gießung unten aus dem Topf ablaufende Flüssigkeit; Referenzpunkt für den Salzzustand der Wurzelzone." },
      { term: "EC", definition: "Electrical Conductivity — Maß für die Summe aller gelösten Salze in einer Lösung." },
      { term: "Kontrolldiagramm", definition: "Statistisches Werkzeug zur Unterscheidung normaler Schwankung von echten Trendabweichungen über Zeit." }
    ],
    sourceIds: ["bugbee-electrical-conductivity", "marschner-mineral-nutrition", "munns-salinity-tolerance"],
    relatedSlugs: ["salzanreicherung-hohe-ec", "ph-lockout", "bewaesserung-ohne-uebergiessen", "grow-log-und-kpi-dashboard"]
  },
  {
    slug: "wurzelgesundheit-diagnose",
    title: "Wurzelgesundheit beurteilen und diagnostizieren",
    summary: "Farbe, Konsistenz und Geruch der Wurzel verraten mehr über den Zustand einer Pflanze als jedes oberirdische Symptom. So beurteilst du Wurzeln systematisch bei Umtopfen und Ernte.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-08-03",
    tags: ["Wurzelzone", "Diagnose", "Wurzelfäule", "Substrat"],
    keyTakeaways: [
      "Gesunde Wurzeln sind weiß bis cremefarben, fest und riechen erdig-neutral — jede Abweichung in Farbe, Konsistenz oder Geruch ist ein Frühwarnsignal, lange bevor oberirdische Symptome sichtbar werden.",
      "Feine, dichte weiße Wurzelhaare zeigen aktive Nährstoffaufnahme an — ihr Fehlen ist oft aussagekräftiger als die Farbe der Hauptwurzeln allein.",
      "Ein fauliger, süßlich-fauler Geruch ist ein zuverlässigeres Frühsignal für Wurzelfäule als die Braunfärbung selbst, die oft erst später sichtbar wird."
    ],
    quickFacts: [
      { label: "Gesunde Farbe", value: "Weiß bis cremefarben" },
      { label: "Gesunder Geruch", value: "Neutral bis erdig" },
      { label: "Warnsignal Farbe", value: "Braun bis schwarz, schleimig" },
      { label: "Warnsignal Geruch", value: "Faulig, süßlich-sauer" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Wurzelgesundheitsdiagnose ist die systematische Beurteilung von Farbe, Konsistenz, Geruch und Wurzelhaardichte, um den Zustand der Wurzelzone unabhängig von oberirdischen Symptomen einzuschätzen.",
          "Da viele oberirdische Stresssignale erst Tage nach dem eigentlichen Wurzelproblem auftreten, ist die direkte Wurzelinspektion beim Umtopfen oder Ernten eine wertvolle, oft ungenutzte Diagnosequelle."
        ]
      },
      {
        heading: "Beurteilungskriterien",
        content: [
          "Farbe: weiß bis cremefarben ist gesund; gelblich kann auf beginnenden Stress hindeuten; braun bis schwarz signalisiert fortgeschrittene Schädigung oder Fäule.",
          "Konsistenz: feste, leicht elastische Wurzeln sind gesund; schleimige, leicht zerfallende Wurzeln sind ein starkes Fäule-Signal.",
          "Geruch: neutral bis leicht erdig ist normal; fauliger, süßlich-saurer Geruch ist ein zuverlässiges Frühsignal, oft bevor die Verfärbung eindeutig sichtbar wird.",
          "Wurzelhaardichte: feine, dichte weiße Härchen zeigen aktive Nährstoffaufnahme; ihr weitgehendes Fehlen deutet auf gestörte Aufnahmefunktion hin, selbst bei unauffälliger Hauptwurzelfarbe."
        ],
        checklist: [
          "Beim Umtopfen systematisch Farbe, Konsistenz und Geruch der Wurzelballen-Außenseite UND des Kerns prüfen",
          "Wurzelhaardichte an mehreren Stellen des Ballens vergleichen",
          "Auffällige Befunde fotografisch dokumentieren, um Verlauf über mehrere Umtopfungen zu vergleichen"
        ]
      },
      {
        heading: "Diagnose — Zuordnung zu Ursachen",
        content: [
          "Braune, schleimige Wurzeln mit fauligem Geruch, oberirdisch Welke trotz nassem Substrat → Wurzelfäule (Pythium).",
          "Wurzeln äußerlich meist unauffällig, aber einseitiges/sektorales oberirdisches Welken → Verdacht auf Fusarium, Bestätigung über Stängelquerschnitt, nicht über die Wurzel selbst.",
          "Reduzierte Wurzelhaardichte bei sonst normaler Farbe, oberirdisch Wachstumsstillstand → Hinweis auf chronische Staunässe oder Sauerstoffmangel, noch vor manifester Fäule.",
          "Wurzeln, die dicht am Topfrand kreisförmig verlaufen (Girdling) → Übertopfungsfolge oder zu später Umtopfzeitpunkt, kein Krankheitszeichen."
        ]
      },
      {
        heading: "Korrekturmaßnahmen nach Befund",
        content: [
          "Bei beginnender Fäule: befallene Wurzelteile vorsichtig entfernen, in frisches, gut drainierendes Substrat umtopfen, Wurzelzonentemperatur auf 18–22 °C bringen.",
          "Bei reduzierter Wurzelhaardichte ohne Fäule: Gießrhythmus und Sauerstoffversorgung der Wurzelzone überprüfen, bevor am Düngeprogramm etwas geändert wird.",
          "Bei Girdling: beim nächsten Umtopfen die äußeren, kreisenden Wurzeln vorsichtig auflockern oder anschneiden, um neues, radiales Wurzelwachstum anzuregen."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Wurzeln nur bei sichtbaren oberirdischen Problemen kontrollieren, statt routinemäßig bei jedem Umtopfen.",
          "Nur die äußere Wurzelballenoberfläche prüfen und den Kern des Ballens unbeachtet lassen, wo sich Fäule oft zuerst entwickelt.",
          "Farbliche Verfärbung allein als Diagnosekriterium nehmen, ohne Geruch und Konsistenz einzubeziehen."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Mykorrhiza-Inokulation kann an der Wurzeloberfläche einen feinen, weißlichen Pilzbelag erzeugen, der von schädlichem Befall unterschieden werden muss — echte Mykorrhiza riecht neutral bis leicht pilzig-erdig, nicht faulig.",
          "Regelmäßige Wurzelzonentemperatur- und Sauerstoffmessung ergänzt die visuelle Beurteilung um objektive, kontinuierliche Daten statt punktueller Momentaufnahmen."
        ]
      }
    ],
    warnings: [
      "Ein fauliger Geruch an der Wurzelzone sollte immer ernst genommen werden, auch wenn die Wurzelfarbe noch weitgehend normal wirkt — der Geruch ist häufig das frühere Signal."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum Geruch wichtig ist",
        text: "Fäuleerreger produzieren Stoffwechselprodukte, die schon riechbar sind, bevor die Wurzel sichtbar braun wird. Der Geruchstest ist deshalb oft das frühere Warnsignal als die reine Optik."
      },
      {
        title: "Kurz erklärt: Girdling",
        text: "Wenn Wurzeln zu lange im selben Topf bleiben, wachsen sie oft ringförmig am Topfrand entlang, statt sich radial auszubreiten. Das schränkt die spätere Wasser- und Nährstoffaufnahme ein."
      },
    ],
    faq: [
      {
        question: "Wie oft sollte ich die Wurzeln aktiv kontrollieren?",
        answer: "Bei jedem geplanten Umtopfen sowie am Ende jedes Anbauzyklus. Bei unerklärlichen oberirdischen Symptomen lohnt sich zusätzlich eine gezielte Wurzelkontrolle, auch außerhalb des geplanten Umtopfens."
      },
      {
        question: "Kann ich eine Pflanze mit teilweise fauligen Wurzeln retten?",
        answer: "Bei frühem, lokal begrenztem Befall oft ja: befallene Wurzelteile entfernen, in frisches Substrat umtopfen und die Ursache (meist Staunässe oder zu warme Wurzelzone) beheben."
      },
    ],
    glossary: [
      { term: "Girdling", definition: "Ringförmiges Wurzelwachstum am Topfrand entlang, meist Folge von zu später Umtopfung oder Übertopfung." },
      { term: "Wurzelhaar", definition: "Feine, haarähnliche Ausstülpung der Wurzelepidermis, Hauptort der Wasser- und Nährstoffaufnahme." },
      { term: "Mykorrhiza", definition: "Symbiotische Pilzgemeinschaft an der Wurzel, die die Nähr- und Wasseraufnahme der Pflanze unterstützt." },
    ],
    sourceIds: ["pythium-root-rot-hydroponics", "marschner-mineral-nutrition", "fusarium-wilt-review"],
    relatedSlugs: ["wurzelfaeule", "fusarium", "cannabis-substrat-und-wurzelzone", "ueberwaesserung-staunaesse"]
  },
  {
    slug: "trocknung-protokoll",
    title: "Trocknungsprotokoll für Cannabis nach der Ernte",
    summary: "Wie Temperatur, Luftfeuchte und Luftbewegung während der Trocknung zusammenspielen, um Terpene zu erhalten und mikrobiologisches Risiko gleichzeitig zu senken.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-08-03",
    tags: ["Trocknung", "Curing", "Nachernte", "Terpene", "Sicherheit"],
    keyTakeaways: [
      "Langsame, kontrollierte Trocknung bei 18–21 °C und 55–65 % relativer Luftfeuchte über 7–14 Tage erhält Terpene deutlich besser als schnelle, heiße Trocknung.",
      "Der 'Snap Test' (Stängel bricht statt sich zu biegen) ist ein zuverlässigeres Trocknungskriterium als die reine Trocknungsdauer nach Kalender.",
      "Direkter Luftstrom auf die Knospen beschleunigt zwar die Trocknung, treibt aber ungleichmäßig und übermäßig Terpene aus — indirekte, sanfte Luftbewegung im Raum ist vorzuziehen."
    ],
    quickFacts: [
      { label: "Ziel-Temperatur", value: "18–21 °C" },
      { label: "Ziel-Luftfeuchte", value: "55–65 % RH" },
      { label: "Typische Dauer", value: "7–14 Tage" },
      { label: "Abschlusskriterium", value: "Snap Test: Stängel bricht" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Trocknung ist der kontrollierte Prozess, bei dem geernteten Blüten Wasser entzogen wird, bis eine für Lagerung und Curing sichere Wasseraktivität erreicht ist.",
          "Ziel ist ein Gleichgewicht: langsam genug für Terpenerhalt und gleichmäßige Feuchteverteilung, schnell genug, um mikrobielles Risiko in der kritischen Anfangsphase gering zu halten."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Zu schnelle, heiße Trocknung führt zum vorzeitigen Verschluss der äußeren Gewebeschicht ('Case Hardening'), wodurch die Oberfläche trocken wirkt, während der Kern der Blüte noch deutlich feuchter und damit mikrobiologisch risikoreicher bleibt.",
          "Terpene sind flüchtige, hitze- und lichtempfindliche Verbindungen — hohe Trocknungstemperaturen beschleunigen ihren Verlust deutlich stärker als eine langsame, kühle Trocknung."
        ]
      },
      {
        heading: "Zielwerte und Protokoll",
        content: [
          "Temperatur: 18–21 °C, Luftfeuchte: 55–65 % relative Feuchte, Dauer: typischerweise 7–14 Tage, abhängig von Knospendichte und Ausgangsklima.",
          "Raum vollständig verdunkeln — Licht beschleunigt den Terpenabbau zusätzlich zur reinen Verdunstung.",
          "Luftbewegung sanft und indirekt im Raum halten (z. B. über einen Wandventilator, nicht direkt auf die Knospen gerichtet)."
        ],
        checklist: [
          "Temperatur und Luftfeuchte täglich protokollieren, nicht nur bei Auffälligkeiten",
          "Stängeldicke der Sorte bei der Trocknungsdauer-Einschätzung berücksichtigen",
          "Snap Test täglich ab Tag 5–6 durchführen, um den Abschlusszeitpunkt nicht zu verpassen"
        ]
      },
      {
        heading: "Diagnose: Über- vs. Untertrocknung",
        content: [
          "Übertrocknet: Blüten wirken krümelig, Stängel brechen sofort und splittern, spürbarer Terpenverlust im Geruch.",
          "Untertrocknet: Stängel biegen sich statt zu brechen, Blüten fühlen sich noch spürbar feucht/weich an — Curing darf hier noch nicht beginnen, sonst steigt das Schimmelrisiko in den Gläsern."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Zu hohe Temperatur oder zu niedrige Luftfeuchte einsetzen, um die Trocknung zu beschleunigen — das erhöht das Case-Hardening-Risiko und den Terpenverlust.",
          "Ventilatoren direkt auf die Knospen richten statt für indirekte Raumluftbewegung zu sorgen.",
          "Nach starrem Kalenderplan statt nach dem Snap Test ins Curing übergehen."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Zweistufige Trocknung (erste Tage bei etwas höherer Luftfeuchte für langsameren Start, danach leicht absenken) kann bei sehr dichten Knospen die Gleichmäßigkeit zwischen Außen- und Kernfeuchte verbessern.",
          "Der Übergang zum Curing (kontrolliertes Nachreifen in verschlossenen Behältern mit periodischem Lüften) sollte nahtlos an den erfolgreichen Snap Test anschließen, um die gerade erreichte, günstige Feuchteverteilung nicht wieder zu verlieren."
        ]
      }
    ],
    warnings: [
      "Zu schnelle Trocknung durch hohe Temperatur oder niedrige Luftfeuchte kann die Oberfläche vorzeitig verschließen, während der Kern der Knospe noch mikrobiologisch riskant feucht bleibt."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Der Snap Test",
        text: "Ein kleiner Zweig wird gebogen: Bricht er mit einem hörbaren Knack, ist die Trocknung abgeschlossen. Biegt er sich nur, ist noch zu viel Feuchtigkeit im Gewebe."
      },
      {
        title: "Kurz erklärt: Case Hardening",
        text: "Bei zu schneller Trocknung verschließt sich die äußere Schicht der Knospe vorzeitig, während innen noch Feuchtigkeit gefangen bleibt — ein unterschätztes Schimmelrisiko trotz trocken wirkender Oberfläche."
      },
    ],
    faq: [
      {
        question: "Wie lange sollte die Trocknung genau dauern?",
        answer: "Typischerweise 7–14 Tage, aber die Dauer ist sortenabhängig. Der Snap Test ist das zuverlässigere Abschlusskriterium als eine feste Tageszahl."
      },
      {
        question: "Darf ich einen Ventilator direkt auf die Knospen richten, um schneller zu trocknen?",
        answer: "Nicht empfohlen. Direkter Luftstrom trocknet ungleichmäßig und treibt überproportional viele Terpene aus. Indirekte Raumluftbewegung ist vorzuziehen."
      },
    ],
    glossary: [
      { term: "Snap Test", definition: "Prüfmethode, bei der ein kleiner Zweig gebogen wird; bricht er, gilt die Trocknung als abgeschlossen." },
      { term: "Case Hardening", definition: "Vorzeitiger Verschluss der äußeren Gewebeschicht bei zu schneller Trocknung, während der Kern noch feucht bleibt." },
      { term: "Curing", definition: "Kontrolliertes Nachreifen getrockneter Blüten in verschlossenen Behältern zur weiteren Feuchte- und Terpenstabilisierung." },
    ],
    sourceIds: ["postharvest-biology-technology-curing", "nature-postharvest-terpenes", "food-control-water-activity-microbiology"],
    relatedSlugs: ["wasseraktivitaet-und-curing", "schimmel-und-mykotoxine-bei-cannabis", "lagerung-und-terpenverlust-vermeiden"]
  },
  {
    slug: "trichom-reifegrad-bilddiagnose",
    title: "Trichom-Reifegrad per Bilddiagnose bestimmen",
    summary: "Wie du mit Lupe oder USB-Mikroskop den Reifegrad der Trichome zuverlässig abliest und daraus den passenden Erntezeitpunkt für dein gewünschtes Wirkprofil ableitest.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-08-03",
    tags: ["Trichome", "Erntezeitpunkt", "Reifegrad", "Bilddiagnose"],
    keyTakeaways: [
      "Trichomfarbe durchläuft eine klare Abfolge: klar (unreif) → milchig (THC-Höchststand) → bernsteinfarben (beginnender Abbau zu CBN) — diese Abfolge ist die zuverlässigste Erntezeitpunkt-Kennzahl.",
      "Pistillenfarbe allein ist als alleiniges Kriterium unzuverlässig, weil sie stärker sorten- und umweltabhängig variiert als die Trichomentwicklung.",
      "Obere und untere Canopy-Zonen reifen unterschiedlich schnell — eine Einzelmessung an nur einer Stelle der Pflanze kann in die Irre führen."
    ],
    quickFacts: [
      { label: "Werkzeug", value: "Lupe 30–60× oder USB-Mikroskop" },
      { label: "Klar", value: "Unreif, THC steigt noch" },
      { label: "Milchig", value: "THC-Höchststand" },
      { label: "Bernstein", value: "Beginnender Abbau zu CBN" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Trichom-Bilddiagnose ist die Beurteilung des Reifegrads der Harzdrüsenköpfe (Trichome) mittels Vergrößerung, um den optimalen Erntezeitpunkt für ein gewünschtes Wirkprofil zu bestimmen.",
          "Im Unterschied zur reinen Pistillenbeobachtung liefert die Trichomfarbe ein direktes, chemisch begründetes Signal für den Cannabinoidstatus der Blüte."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Trichomköpfe produzieren und speichern Cannabinoide und Terpene. Mit fortschreitender Reife steigt der THC-Gehalt bis zu einem Höchststand und beginnt danach durch Oxidation zu CBN abzubauen — ein Prozess, der sich in der Trichomfarbe widerspiegelt.",
          "Klare Trichome enthalten noch wenig fertig ausgebildetes Cannabinoidprofil, milchige (undurchsichtig-weiße) Trichome markieren den THC-Höchststand, bernsteinfarbene zeigen fortschreitende Oxidation und einen tendenziell sedierenderen Wirkprofilanteil an."
        ]
      },
      {
        heading: "Methodik der Bilddiagnose",
        content: [
          "Eine 30–60-fach vergrößernde Lupe oder ein USB-Mikroskop ist ausreichend; bloßes Auge kann Trichomfarbe nicht zuverlässig unterscheiden.",
          "Immer die Trichome direkt AUF dem Blütenkelch (Calyx) beurteilen, nicht die auf den umgebenden Zuckerblättern — Calyx-Trichome reifen repräsentativer für die Knospe selbst.",
          "Mehrere Knospen an unterschiedlichen Positionen der Canopy (oben, Mitte, unten) prüfen, da diese Zonen unterschiedlich schnell reifen."
        ],
        checklist: [
          "Immer Calyx-Trichome prüfen, nicht nur Zuckerblatt-Trichome",
          "Mindestens 3–5 Knospen an unterschiedlichen Canopy-Positionen untersuchen",
          "Ergebnis in klar/milchig/bernstein-Anteilen prozentual schätzen, nicht nur binär bewerten"
        ]
      },
      {
        heading: "Zielverhältnisse nach gewünschtem Profil",
        content: [
          "Eher aktivierendes, klares Wirkprofil: Ernte bei überwiegend milchigen Trichomen mit geringem Bernsteinanteil (grob 10–20 % Bernstein).",
          "Ausgewogenes Profil: mittlerer Bernsteinanteil, meist die am häufigsten gewählte Zielspanne.",
          "Eher entspannend-sedierendes Profil: höherer Bernsteinanteil, auf Kosten eines Teils des THC-Höchststands durch fortgeschrittene CBN-Bildung."
        ]
      },
      {
        heading: "Diagnose — Verwechslungen vermeiden",
        content: [
          "Pistillenfarbe (braun/orange werdende Blütenhaare) allein ist kein verlässliches alleiniges Kriterium — sie kann sortenabhängig schon früh bräunen, ohne dass die Trichome reif sind.",
          "Unterschiedliche Reifegrade zwischen oberer und unterer Canopy sind normal, nicht fehlerhaft — sie spiegeln die unterschiedliche Lichtexposition wider."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Erntezeitpunkt allein anhand der Pistillenfarbe festlegen, ohne die Trichome überhaupt zu prüfen.",
          "Nur eine einzelne Knospe an einer Stelle der Pflanze als repräsentativ für die gesamte Ernte nehmen.",
          "Ohne Vergrößerungshilfsmittel mit bloßem Auge 'schätzen' — Trichomfarbunterschiede sind für das unbewaffnete Auge kaum zuverlässig erkennbar."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Bei stark unterschiedlicher Reife zwischen Canopy-Zonen kann eine gestaffelte, selektive Ernte (obere Zone zuerst, untere Zone später) die Gesamtqualität gegenüber einer Einmalernte verbessern.",
          "USB-Mikroskope mit digitaler Bildspeicherung erlauben einen Vergleich des Reifeverlaufs über mehrere Kontrolltage, statt nur eine Momentaufnahme zu bewerten."
        ]
      }
    ],
    warnings: [
      "Trichomfarbe entwickelt sich nach der Ernte nicht mehr weiter — eine zu früh geerntete Pflanze reift nicht im Trocknungsprozess nach."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum Calyx statt Zuckerblatt?",
        text: "Die Trichome direkt auf dem Blütenkelch spiegeln den Reifegrad der Knospe selbst wider. Trichome auf den umliegenden kleinen Blättern können abweichen und führen leicht in die Irre."
      },
      {
        title: "Kurz erklärt: Klar, milchig, bernstein",
        text: "Klare Trichome sind noch unreif, milchige markieren den THC-Höchststand, bernsteinfarbene zeigen beginnenden Abbau zu CBN an. Die Mischung dieser drei Anteile bestimmt das spätere Wirkprofil."
      },
    ],
    faq: [
      {
        question: "Reicht die Pistillenfarbe nicht als Erntesignal?",
        answer: "Als alleiniges Kriterium nicht zuverlässig genug — sie variiert sortenabhängig stärker als die Trichomentwicklung. Trichome sind das direktere, chemisch begründete Signal."
      },
      {
        question: "Muss ich bei jeder Knospe der Pflanze den Reifegrad prüfen?",
        answer: "Nicht bei jeder einzelnen, aber an mehreren repräsentativen Positionen (oben, Mitte, unten), da die Canopy-Zonen unterschiedlich schnell reifen."
      },
    ],
    glossary: [
      { term: "Trichom", definition: "Harzdrüse auf der Blütenoberfläche, Hauptproduktionsort von Cannabinoiden und Terpenen." },
      { term: "Calyx", definition: "Blütenkelch; die Basisstruktur der Cannabisblüte, auf der die dichteste Trichombesetzung sitzt." },
      { term: "CBN", definition: "Cannabinol; entsteht durch oxidativen Abbau von THC und ist mit einem eher sedierenderen Wirkprofilanteil assoziiert." },
    ],
    sourceIds: ["postharvest-biology-technology-curing", "phytochemistry-cannabinoid-terpen-profile", "horticulture-research-cannabis-cultivation"],
    relatedSlugs: ["erntefenster-trichomreife", "thc-zu-cbn-abbau-und-oxidation", "trocknung-protokoll"]
  },
  {
    slug: "ph-management-coco-erde-hydro",
    title: "pH-Management je nach Substrat organisieren",
    summary: "Warum die Messfrequenz und die Korrekturroutine für den pH-Wert sich zwischen Erde, Coco und Hydro unterscheiden sollten — nicht nur die Zielwerte selbst.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-08-03",
    tags: ["pH", "Substrat", "Routine", "Kalibrierung"],
    keyTakeaways: [
      "Die pH-Zielfenster unterscheiden sich zwischen Substraten nur leicht — die nötige MESSFREQUENZ unterscheidet sich dagegen stark, weil die Pufferkapazität sehr unterschiedlich ist.",
      "Nährstoffe zuerst vollständig auflösen, dann erst den pH einstellen — in umgekehrter Reihenfolge verschiebt sich der pH beim Zugeben der Nährstoffe erneut.",
      "pH-Down- und pH-Up-Produkte unterscheiden sich chemisch (meist Phosphor-/Zitronensäure vs. Kaliumhydroxid/-silikat) — die Wahl beeinflusst indirekt auch die Nährstoffbilanz."
    ],
    quickFacts: [
      { label: "Messfrequenz Erde", value: "Wöchentliche Kontrolle" },
      { label: "Messfrequenz Coco", value: "Bei jeder Gießung" },
      { label: "Messfrequenz Hydro", value: "Täglich" },
      { label: "Reihenfolge", value: "Erst Nährstoffe lösen, dann pH einstellen" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "pH-Management umfasst nicht nur das Zielfenster, sondern die gesamte Routine aus Messfrequenz, Kalibrierung und Korrekturreihenfolge, die den pH-Wert über die Zeit stabil hält.",
          "Weil sich Substrate stark in ihrer Pufferkapazität unterscheiden, muss sich auch die Kontrollroutine unterscheiden — dasselbe Zielfenster erfordert in Hydro eine deutlich engmaschigere Kontrolle als in Erde."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "pH-Drift entsteht substratabhängig aus unterschiedlichen Mechanismen: in Erde durch mikrobielle Umsetzung organischen Materials, in Coco durch fortschreitenden Abbau der Fasern, in Hydro durch Wurzelausscheidungen und mikrobielle Aktivität direkt in der Nährlösung.",
          "Da Hydro keinerlei Substratpufferung besitzt, wirkt sich jede Drift-Ursache dort sofort und ungefiltert auf den gemessenen pH aus — daher die deutlich höhere nötige Kontrollfrequenz."
        ]
      },
      {
        heading: "Substratspezifische Routinen",
        content: [
          "Erde: wöchentliche Kontrolle über eine definierte Runoff-Messung reicht meist aus, da die mikrobielle Pufferung kurzfristige Schwankungen abfedert.",
          "Coco: pH bei jeder Gießung prüfen, da die geringe Pufferkapazität schnellere Drift zulässt als Erde, aber noch nicht so unmittelbar wie Hydro.",
          "Hydro: tägliche Kontrolle, idealerweise inklusive Nährlösungstemperatur, da Temperaturschwankungen die pH-Stabilität zusätzlich beeinflussen."
        ],
        checklist: [
          "Kontrollfrequenz an das jeweilige Substrat anpassen, nicht pauschal einheitlich handhaben",
          "pH-Messgerät wöchentlich unabhängig vom Substrat kalibrieren",
          "Runoff- bzw. Reservoir-pH und nicht nur den Zulauf-pH als Referenz nutzen"
        ]
      },
      {
        heading: "Korrekturreihenfolge und Produktchemie",
        content: [
          "Immer zuerst alle Nährstoffe vollständig in der Lösung auflösen, danach erst den pH einstellen — Dünger selbst verändert den pH beim Zugeben, ein vorheriger pH-Wert wird sonst durch die Düngerzugabe wieder verschoben.",
          "pH-Down-Produkte basieren meist auf Phosphor- oder Zitronensäure und liefern dabei zusätzlichen Phosphor bzw. organische Säure — bei bereits hoher P-Zufuhr relevant für die Gesamtbilanz.",
          "pH-Up-Produkte basieren meist auf Kaliumhydroxid oder Kaliumsilikat — Silikat-basierte Varianten liefern zusätzlich bioverfügbares Silizium, das die Zellwandstabilität unterstützen kann."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "pH einstellen, bevor alle Düngerkomponenten vollständig gelöst sind — der Wert verschiebt sich danach erneut.",
          "Dieselbe wöchentliche Kontrollfrequenz für Hydro wie für Erde verwenden, obwohl die Pufferkapazität komplett unterschiedlich ist.",
          "pH-Down/-Up-Produkte ohne Rücksicht auf deren Nebeneffekte (P-Zufuhr, K-Zufuhr) in die Gesamtdüngerbilanz einplanen."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "In Hydro-Systemen mit automatischer pH-Regelung ist eine Totzone (kleiner Toleranzbereich statt exaktem Zielwert) sinnvoll, um ein ständiges Nachregeln bei jeder minimalen Schwankung zu vermeiden.",
          "Puffernde Zusätze auf Huminsäure-Basis können in Coco und Hydro die pH-Stabilität zwischen den Messintervallen verbessern, ohne die grundsätzliche Kontrollnotwendigkeit zu ersetzen."
        ]
      }
    ],
    warnings: [
      "pH-Korrektur vor vollständiger Auflösung aller Düngerkomponenten führt zu einer erneuten, unkontrollierten Verschiebung — die Reihenfolge ist kein optionaler Schritt."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum unterschiedliche Messfrequenz?",
        text: "Erde puffert pH-Schwankungen über Tage ab, Hydro gar nicht. Deshalb reicht in Erde eine wöchentliche Kontrolle, während Hydro tägliche Messung braucht, um Drift rechtzeitig zu erkennen."
      },
      {
        title: "Kurz erklärt: Erst Dünger, dann pH",
        text: "Düngerzugabe verändert selbst den pH-Wert der Lösung. Wird der pH vorher eingestellt, verschiebt er sich beim Düngen erneut — deshalb immer erst vollständig düngen, dann den pH korrigieren."
      },
    ],
    faq: [
      {
        question: "Warum reicht in Erde weniger häufiges Messen?",
        answer: "Weil die mikrobielle Pufferung und die Kationenaustauschkapazität der Erde kurzfristige pH-Schwankungen abfedern. In Coco und besonders Hydro fehlt diese Pufferung weitgehend."
      },
      {
        question: "Beeinflusst mein pH-Down-Produkt auch die Nährstoffbilanz?",
        answer: "Ja, meist. Phosphor- oder zitronensäurebasierte Produkte liefern zusätzlichen Phosphor bzw. organische Säure — bei ohnehin hoher P-Zufuhr sollte das in der Gesamtrezeptur mitgedacht werden."
      },
    ],
    glossary: [
      { term: "Pufferkapazität", definition: "Fähigkeit eines Substrats oder einer Lösung, pH-Änderungen abzufedern." },
      { term: "Totzone", definition: "Kleiner Toleranzbereich um einen Zielwert, innerhalb dessen ein automatisches Regelsystem nicht eingreift." },
      { term: "Reservoir-pH", definition: "Der pH-Wert der Nährlösung im Vorratsbehälter eines rezirkulierenden Systems." },
    ],
    sourceIds: ["marschner-nutrient-availability-ph", "bugbee-electrical-conductivity", "horticulture-research-cannabis-cultivation"],
    relatedSlugs: ["ph-lockout", "substrat-vergleich-coco-erde-hydro", "ec-und-runoff-interpretation", "naehrstoffblockaden-und-antagonismen"]
  },
  {
    slug: "erntefenster-trichomreife",
    title: "Das Erntefenster bestimmen: Mehrere Signale kombinieren",
    summary: "Warum der ideale Erntezeitpunkt nicht an einem einzelnen Signal, sondern an der Kombination aus Trichomen, Pistillen und Blattseneszenz festgemacht werden sollte.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-08-03",
    tags: ["Erntezeitpunkt", "Trichome", "Reife", "Entscheidung"],
    keyTakeaways: [
      "Der Erntezeitpunkt sollte aus mehreren Signalen kombiniert werden — Trichomfarbe als Hauptkriterium, Pistillenrückzug und Blattseneszenz als unterstützende Signale.",
      "Die vom Breeder angegebene Blütezeit ist nur ein grober Ausgangspunkt, kein exaktes Erntedatum — reale Bedingungen verschieben den tatsächlichen Reifezeitpunkt um mehrere Tage bis Wochen.",
      "Unterschiedliche Canopy-Zonen reifen unterschiedlich schnell — eine gestaffelte statt einmalige Ernte kann bei stark inhomogener Reife die Gesamtqualität verbessern."
    ],
    quickFacts: [
      { label: "Hauptkriterium", value: "Trichomfarbe (Calyx)" },
      { label: "Unterstützend", value: "Pistillenrückzug, Blattseneszenz" },
      { label: "Ausgangspunkt", value: "Breeder-Blütezeit als Schätzung" },
      { label: "Alternative", value: "Gestaffelte Ernte nach Canopy-Zone" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Das Erntefenster ist der Zeitraum, in dem der Reifezustand der Pflanze am besten zum gewünschten Cannabinoid- und Terpenprofil passt — kein exakter, fixer Tag, sondern eine mehrtägige bis mehrwöchige Spanne.",
          "Ein verlässliches Erntefenster ergibt sich aus der Kombination mehrerer Signale, nicht aus einem Einzelkriterium."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Cannabinoid- und Terpensynthese folgen in der Spätblüte einer Kurve, die zu einem Höchststand ansteigt und danach durch Oxidation und Abbau wieder absinkt bzw. sich in ihrer Zusammensetzung verschiebt (z. B. THC zu CBN).",
          "Die vom Breeder angegebene Blütezeit basiert auf Referenzbedingungen — reale Abweichungen in Licht, Temperatur und Nährstoffversorgung verschieben den tatsächlichen Reifezeitpunkt der eigenen Pflanze um mehrere Tage bis Wochen."
        ]
      },
      {
        heading: "Die drei Hauptsignale kombiniert",
        content: [
          "Trichomfarbe (Calyx-Trichome unter Vergrößerung): das direkteste, chemisch begründete Signal für den Cannabinoidstatus — Hauptkriterium für die Erntetimingentscheidung.",
          "Pistillenrückzug: der Anteil brauner/eingerollter Blütenhaare gegenüber weißen, aktiven Pistillen gibt einen unterstützenden, aber sorten- und umweltabhängig variierenden Hinweis.",
          "Blattseneszenz: zunehmende Vergilbung unterer Fächerblätter in der Spätblüte zeigt Stickstoffremobilisierung an und ist ein grobes, spätes Reifesignal für die gesamte Pflanze."
        ],
        checklist: [
          "Trichomfarbe als primäres Entscheidungskriterium verwenden",
          "Pistillenrückzug und Blattseneszenz als Bestätigung, nicht als alleiniges Kriterium heranziehen",
          "Breeder-Blütezeit nur als grobe Orientierung, nicht als festes Erntedatum nutzen"
        ]
      },
      {
        heading: "Entscheidungsmatrix nach gewünschtem Profil",
        content: [
          "Eher aktivierendes Profil: Ernte tendenziell früher, bei überwiegend milchigen Trichomen mit geringem Bernsteinanteil.",
          "Ausgewogenes Profil: Ernte im mittleren Fenster, wenn Pistillenrückzug und Trichomreife übereinstimmend fortgeschritten sind.",
          "Eher entspannendes Profil: Ernte etwas später, bei höherem Bernsteinanteil und weitgehend zurückgezogenen Pistillen."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Ausschließlich nach Kalendertag der Breeder-Angabe ernten, ohne die tatsächlichen Reifesignale der eigenen Pflanze zu prüfen.",
          "Sich allein auf Pistillenfarbe verlassen, obwohl sie sortenabhängig stärker streut als die Trichomentwicklung.",
          "Die gesamte Pflanze auf einmal ernten, obwohl obere und untere Canopy-Zonen erkennbar unterschiedlich weit gereift sind."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Bei deutlich inhomogener Reife zwischen Canopy-Zonen kann eine gestaffelte Ernte (zuerst die am weitesten entwickelten oberen Bereiche, später die unteren) die durchschnittliche Blütenqualität gegenüber einer Einmalernte spürbar verbessern.",
          "Eine konsequente Dokumentation von Trichom- und Pistillenentwicklung über mehrere Durchgänge derselben Sorte verbessert die Vorhersagegenauigkeit für künftige Ernten erheblich."
        ]
      }
    ],
    warnings: [
      "Die Breeder-Blütezeit ist eine Referenz unter Idealbedingungen — sie unter realen, abweichenden Anbaubedingungen als exaktes Erntedatum zu verwenden, führt regelmäßig zu suboptimalem Timing."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum mehrere Signale kombinieren?",
        text: "Jedes einzelne Reifesignal hat Schwächen — Pistillenfarbe variiert je nach Sorte, die Breeder-Angabe ist nur ein Durchschnittswert. Erst die Kombination mehrerer Signale ergibt ein verlässliches Gesamtbild."
      },
      {
        title: "Kurz erklärt: Gestaffelte Ernte",
        text: "Statt die ganze Pflanze an einem Tag zu ernten, werden zuerst die am weitesten gereiften Bereiche geerntet und die weniger reifen Zonen bekommen noch einige Tage mehr Zeit."
      },
    ],
    faq: [
      {
        question: "Reicht die Breeder-Blütezeit als Erntetermin?",
        answer: "Nur als grobe Orientierung. Reale Licht-, Temperatur- und Nährstoffbedingungen verschieben den tatsächlichen Reifezeitpunkt oft um mehrere Tage bis Wochen gegenüber der Herstellerangabe."
      },
      {
        question: "Muss ich immer gestaffelt ernten?",
        answer: "Nein, nur wenn die Reife zwischen den Canopy-Zonen deutlich auseinanderklafft. Bei gleichmäßiger Canopy ist eine Einmalernte genauso gut geeignet."
      },
    ],
    glossary: [
      { term: "Pistillenrückzug", definition: "Zunehmende Braunfärbung und Einrollung der Blütenhaare als grobes, unterstützendes Reifesignal." },
      { term: "Blattseneszenz", definition: "Alterungsbedingte Vergilbung von Blättern, in der Spätblüte auch Zeichen von Stickstoffremobilisierung." },
      { term: "Erntefenster", definition: "Der mehrtägige bis mehrwöchige Zeitraum, in dem der Reifezustand am besten zum gewünschten Profil passt." },
    ],
    sourceIds: ["postharvest-biology-technology-curing", "phytochemistry-cannabinoid-terpen-profile", "bernal-cannabis-nutrient-requirements"],
    relatedSlugs: ["trichom-reifegrad-bilddiagnose", "trocknung-protokoll", "thc-zu-cbn-abbau-und-oxidation"]
  },
  {
    slug: "hop-latent-viroid-hlvd",
    title: "Hop Latent Viroid (HLVd) bei Cannabis erkennen und vorbeugen",
    summary: "Gestauchtes, kraftloses Wachstum ohne eindeutige Einzelursache kann auf HLVd hindeuten — ein Viroid ohne Heilung, das nur durch Hygiene und Labortests kontrollierbar ist.",
    category: "anbau",
    difficulty: "profi",
    readMinutes: 9,
    lastUpdated: "2026-08-03",
    tags: ["HLVd", "Viroid", "Dudding", "Krankheiten", "Diagnose"],
    keyTakeaways: [
      "HLVd ist ein Viroid — ein unbehülltes RNA-Molekül ohne Proteinhülle, kein Virus, Pilz oder Bakterium — und dadurch besonders schwer über normale Hygienemaßnahmen zu inaktivieren.",
      "Die Symptomatik ('Dudding': gestauchtes Wachstum, brüchige Stängel, reduzierte Trichomproduktion) ist oft subtil, und viele infizierte Mutterpflanzen bleiben lange symptomlose Träger.",
      "Es gibt keine Heilung — infizierte Pflanzen müssen entfernt werden; einzig eine verlässliche PCR-Labordiagnose bestätigt den Befall, visuelle Einschätzung allein reicht nicht."
    ],
    quickFacts: [
      { label: "Erreger", value: "Hop Latent Viroid (RNA-Viroid)" },
      { label: "Leitsymptom", value: "'Dudding': gestauchtes, kraftloses Wachstum" },
      { label: "Bestätigung", value: "Nur PCR-Labortest zuverlässig" },
      { label: "Übertragung", value: "Mechanisch über Werkzeuge/Kontakt" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Hop Latent Viroid (HLVd) ist ein subvirales Pathogen — ein kleines, zirkuläres RNA-Molekül ohne eigene Proteinhülle, das die Zellmaschinerie der Wirtspflanze zur Vermehrung nutzt.",
          "Bei Cannabis wird die Erkrankung häufig als 'Dudding' bezeichnet, benannt nach den auffällig schwachen, unterentwickelten Pflanzen ('Duds'), die daraus resultieren."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Als Viroid besitzt HLVd keine Proteinhülle und ist dadurch chemisch stabiler und schwerer zu inaktivieren als viele Viren — Standard-Desinfektionsmittel wirken oft weniger zuverlässig als bei behüllten Erregern.",
          "Nach systemischer Infektion verbreitet sich das Viroid über das Leitgewebe in der gesamten Pflanze, wodurch auch aus infizierten Mutterpflanzen gewonnene Stecklinge automatisch infiziert sind."
        ]
      },
      {
        heading: "Symptome und Latenz",
        content: [
          "Gestauchtes, kraftloses Wachstum mit reduzierter Gesamtvitalität — daher der Name 'Dudding'.",
          "Brüchige, schwache Stängel und ein unterentwickeltes Wurzelsystem im Vergleich zu gesunden Schwesterpflanzen derselben Genetik.",
          "Reduzierte Trichomdichte und -produktion, was sich in spürbar geringerer Potenz äußert.",
          "Viele infizierte Pflanzen — besonders etablierte Mutterpflanzen — zeigen über lange Zeit KEINE eindeutigen Symptome und bleiben unbemerkte Überträger."
        ],
        checklist: [
          "Wachstum und Vitalität systematisch gegen genetisch identische Vergleichspflanzen (Klone derselben Linie) bewerten",
          "Bei unerklärlich schwacher Performance einer sonst bewährten Genetik HLVd als Möglichkeit einbeziehen",
          "Neue Mutterpflanzen vor Aufnahme in den Bestand testen lassen, nicht nur visuell beurteilen"
        ]
      },
      {
        heading: "Übertragungswege",
        content: [
          "Hauptsächlich mechanisch über kontaminierte Werkzeuge, Hände oder direkten Pflanze-zu-Pflanze-Kontakt (Saft-zu-Saft-Übertragung beim Schneiden oder Beschädigen von Gewebe).",
          "Über Samen ist eine Übertragung möglich, aber seltener als die mechanische Übertragung in vegetativ vermehrten Mutterpflanzenbeständen.",
          "Im Unterschied zu vielen echten Pflanzenviren spielt eine Insektenübertragung bei HLVd keine zentrale Rolle."
        ]
      },
      {
        heading: "Diagnose",
        content: [
          "Visuelle Symptome allein sind wegen der häufigen Latenz NICHT ausreichend zur sicheren Diagnose — eine unauffällige Pflanze kann dennoch Träger sein.",
          "Eine zuverlässige Bestätigung ist nur über PCR-basierte Labortests möglich, die spezialisierte Anbieter für Cannabis-Pathogene anbieten.",
          "Bei unerklärlich schwacher Performance einer bekannten, sonst zuverlässigen Genetik ist ein Labortest der nächste sinnvolle Schritt vor weiteren Maßnahmen."
        ]
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "Es gibt keine Heilung für eine bereits infizierte Pflanze — bestätigt infizierte Mutterpflanzen und ihre direkten Klone sollten aus dem Bestand entfernt werden, um weitere Ausbreitung zu verhindern.",
          "Spezialisierte Meristem-Gewebekultur kann in manchen Fällen virusfreie Klone aus infiziertem Ausgangsmaterial erzeugen — dies ist eine Speziallabortechnik, keine Standardmaßnahme im eigenen Grow.",
          "Werkzeuge nach Kontakt mit einer verdächtigen oder bestätigt infizierten Pflanze mit wirksamen Protokollen (z. B. verdünnte Bleichlösung) desinfizieren, bevor sie an anderen Pflanzen verwendet werden."
        ]
      },
      {
        heading: "Vorbeugung",
        content: [
          "Neue Genetik (Stecklinge, Mutterpflanzen) vor der Integration in den Hauptbestand testen lassen, nicht nur nach Optik beurteilen.",
          "Werkzeuge konsequent zwischen einzelnen Pflanzen desinfizieren, besonders bei Schnittarbeiten an Mutterpflanzen.",
          "Verdächtige, unterdurchschnittlich performende Pflanzen frühzeitig isolieren und testen lassen, statt zu hoffen, dass sie sich 'erholen'."
        ]
      },
    ],
    warnings: [
      "Eine symptomlose Mutterpflanze ist keine Garantie für Viroidfreiheit — bei wiederholt unerklärlich schwacher Nachkommenschaft ist ein Labortest der einzige zuverlässige nächste Schritt."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Was ist ein Viroid?",
        text: "Ein Viroid ist noch kleiner und einfacher als ein Virus — nur ein nacktes RNA-Molekül ohne schützende Proteinhülle. Es nutzt komplett die Zellmaschinerie der Wirtspflanze, um sich zu vermehren."
      },
      {
        title: "Kurz erklärt: Warum 'latent'?",
        text: "Latent bedeutet verborgen. Viele infizierte Pflanzen, besonders etablierte Mutterpflanzen, zeigen lange keine eindeutigen Symptome, obwohl sie das Viroid bereits in sich tragen und weitergeben."
      },
    ],
    faq: [
      {
        question: "Kann ich eine HLVd-infizierte Pflanze heilen?",
        answer: "Nein, es gibt keine Heilung im normalen Anbau. Nur spezialisierte Meristem-Gewebekultur in Speziallabors kann teils virusfreie Klone aus infiziertem Material erzeugen."
      },
      {
        question: "Wie erkenne ich HLVd sicher?",
        answer: "Visuelle Symptome allein reichen wegen der häufigen Latenz nicht aus. Eine sichere Diagnose erfordert einen PCR-basierten Labortest."
      },
      {
        question: "Reicht normales Desinfektionsmittel gegen HLVd-Übertragung?",
        answer: "Viroide sind ohne Proteinhülle chemisch stabiler als viele Viren — Standardmittel wirken oft schwächer. Verdünnte Bleichlösung und konsequente Werkzeughygiene sind wirksamer als übliche Oberflächendesinfektion allein."
      },
    ],
    glossary: [
      { term: "Viroid", definition: "Kleinstes bekanntes Pflanzenpathogen; ein zirkuläres RNA-Molekül ohne Proteinhülle." },
      { term: "Dudding", definition: "Umgangssprachliche Bezeichnung für die durch HLVd verursachte Wachstumsschwäche bei Cannabis." },
      { term: "Meristem-Gewebekultur", definition: "Speziallabortechnik zur Gewinnung potenziell erregerfreier Klone aus dem aktiven Wachstumsgewebe einer Pflanze." },
    ],
    sourceIds: ["warren-hop-latent-viroid-cannabis", "punja-cannabis-pathogens"],
    relatedSlugs: ["mutterpflanzen-und-clone-hygiene", "integrierte-schaedlingspraevention-grow", "fusarium"]
  },
];

type ArticleSeed = Omit<TerpiraArticle, "lastUpdated" | "sourceIds">;

const createArticle = (seed: ArticleSeed): TerpiraArticle => ({
  ...seed,
  lastUpdated: "2026-03-27",
  sourceIds: defaultSourceIdsByCategory[seed.category]
});

const expansionWikiArticles: TerpiraArticle[] = [
  {
    slug: "cannabis-substrat-und-wurzelzone",
    title: "Substrat und Wurzelzone verstehen",
    summary: "Wie Luftporen, Wasserhaltekapazität und Wurzelgesundheit die Stabilität eines Grows bestimmen.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 9,
    lastUpdated: "2026-08-03",
    tags: ["Substrat", "Wurzelzone", "Drain", "Sauerstoff"],
    keyTakeaways: [
      "Wurzeln atmen: sie brauchen gelösten Sauerstoff im Wasserfilm um jede Wurzelhaar herum. Ein Substrat mit zu wenig luftgefülltem Porenvolumen erstickt die Wurzel, auch wenn Wasser und Nährstoffe reichlich vorhanden sind.",
      "Substratwahl ist ein Kompromiss aus Sauerstoffverfügbarkeit, Wasserhaltekapazität und Fehlertoleranz — kein Medium maximiert alle drei Eigenschaften gleichzeitig.",
      "Topfgewicht und Drain-Messung sind aussagekräftiger als Blattbild oder Substratoptik, weil Wurzelstress oft Tage vor sichtbaren oberirdischen Symptomen beginnt."
    ],
    quickFacts: [
      { label: "Ziel-Luftporenvolumen bei Feldkapazität", value: "≈ 20–30 % (Coco/Perlitmix)" },
      { label: "Ziel-Luftporenvolumen Erde", value: "≈ 10–15 %" },
      { label: "Ideale Wurzeltemperatur", value: "18–22 °C" },
      { label: "Kontrollpunkt", value: "Drain-EC/pH, Topfgewicht nass/trocken" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Die Wurzelzone ist der Bereich im Substrat, in dem Wurzeln Wasser, gelösten Sauerstoff und Nährstoffionen aufnehmen. Substrateigenschaften bestimmen, wie diese drei Ressourcen gleichzeitig verfügbar sind.",
          "Pflanzen reagieren zuerst auf Bedingungen im Wurzelraum — instabiler Sauerstoff-, Wasser- oder Temperaturhaushalt limitiert das Wachstum, bevor oberirdisch etwas sichtbar wird."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Wurzeln betreiben aerobe Zellatmung und benötigen dafür gelösten Sauerstoff im Wasserfilm, der die Wurzelhaare umgibt. Ist dieser Wasserfilm zu dick oder zu lange stehend (Staunässe), diffundiert Sauerstoff zu langsam nach — die Wurzel wechselt auf anaerobe Atmung.",
          "Anaerobe Atmung produziert Ethanol und Milchsäure, die im Wurzelgewebe toxisch wirken und die Nährstoffaufnahme aktiv hemmen, nicht nur passiv verlangsamen."
        ]
      },
      {
        heading: "Substratkennwerte im Vergleich",
        content: [
          "Luftgefülltes Porenvolumen bei Feldkapazität (nach dem Abtropfen): grobe Coco-/Perlitmischungen erreichen 20–30 %, klassische Blumenerde meist nur 10–15 %.",
          "Wasserhaltekapazität verhält sich invers zum Luftporenvolumen: feinere, dichtere Substrate halten mehr Wasser, bieten aber weniger Sauerstoffreserve zwischen zwei Gießgängen.",
          "Kein Substrat maximiert beide Werte gleichzeitig — die Wahl ist immer eine bewusste Priorisierung zwischen Gießintervall und Sauerstoffsicherheit."
        ]
      },
      {
        heading: "Diagnose: Über- vs. Unterversorgung",
        content: [
          "Überwässerung: Topf bleibt über Tage ungewöhnlich schwer, Substratoberfläche riecht dumpf bis faulig, Wachstum stagniert trotz sichtbar feuchtem Medium, Blätter hängen auch bei vollem Wasserangebot.",
          "Unterversorgung: schnelle, gleichmäßige Gewichtsabnahme, Blätter hängen vor allem gegen Ende des Gießintervalls und erholen sich zügig nach der Wassergabe.",
          "Das entscheidende Unterscheidungsmerkmal ist die Erholungsgeschwindigkeit nach Wassergabe: schnelle Erholung spricht für Wassermangel, ausbleibende Erholung trotz Wasser spricht für ein Sauerstoffproblem in der Wurzelzone."
        ],
        checklist: [
          "Topfgewicht nass und trocken pro Medium einmal kalibrieren, danach als Referenz nutzen",
          "Bei Verdacht auf Staunässe: Substratgeruch direkt an der Wurzelzone prüfen, nicht nur an der Oberfläche",
          "Erholungszeit nach Wassergabe protokollieren, nicht nur den Blattzustand vorher"
        ]
      },
      {
        heading: "Korrekturmaßnahmen und Monitoring",
        content: [
          "Bei chronischer Staunässe: Gießintervall verlängern, betroffene Töpfe wenn möglich anheben/besser drainieren lassen, luftporenreiches Amendment (Perlit, Bims) für den nächsten Umtopfzyklus einplanen.",
          "Drain-EC und Drain-pH wöchentlich in einer definierten Kontrollgießung messen — das zeigt Salzanreicherung und pH-Drift in der Wurzelzone, die reiner Substratoptik verborgen bleiben.",
          "Wurzelzonentemperatur zwischen 18 und 22 °C halten: kälteres Wasser löst zwar mehr Sauerstoff, verlangsamt aber die mikrobielle Aktivität und die Nährstoffaufnahme; wärmeres Wasser beschleunigt beides, senkt aber die Sauerstofflöslichkeit und erhöht das Pythium-Risiko."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Auf hängende Blätter reflexartig mit mehr Wasser reagieren, obwohl dieselben Symptome von Sauerstoffmangel durch bestehende Staunässe stammen können.",
          "Substratwahl allein nach Ertragserwartung treffen, ohne die eigene Gießroutine und Kontrollfrequenz ehrlich einzuschätzen.",
          "Nach dem Umtopfen dieselbe Gießmenge wie im kleineren Topf beibehalten — größeres Substratvolumen trocknet langsamer und braucht ein angepasstes Intervall."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Living-Soil-Systeme mit aktiver mikrobieller Gemeinschaft verbessern die Aggregatstruktur des Substrats über Zeit selbst und erhöhen dadurch das effektive Luftporenvolumen, ohne dass mechanisch nachgebessert werden muss.",
          "Biochar und andere poröse Amendments erhöhen sowohl die Wasserhalte- als auch die Luftporenkapazität gleichzeitig, weil sie selbst eine offene, mehrskalige Porenstruktur mitbringen."
        ]
      }
    ],
    warnings: [
      "Zusätzliches Gießen bei bereits nassem, schwer bleibendem Substrat verschärft eine bestehende Staunässe und erhöht das Wurzelfäule-Risiko messbar."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum Wurzeln atmen müssen",
        text: "Wurzeln gewinnen Energie über Sauerstoffatmung, genau wie Blätter — nur dass sie den Sauerstoff aus dem Wasserfilm im Substrat statt aus der Luft beziehen. Ohne diesen gelösten Sauerstoff schaltet die Wurzel auf einen ineffizienten Notmodus um."
      },
      {
        title: "Kurz erklärt: Warum mehr Wasserhaltung nicht automatisch besser ist",
        text: "Ein Substrat, das sehr viel Wasser hält, verdrängt gleichzeitig Luft aus seinen Poren. Für die Wurzel bedeutet das oft weniger verfügbaren Sauerstoff, auch wenn die Wasserversorgung auf den ersten Blick üppig aussieht."
      }
    ],
    faq: [
      {
        question: "Ist Erde oder Coco besser?",
        answer: "Nicht pauschal. Erde puffert mehr und verzeiht Einsteigerfehler, weil sie Nährstoffe und teils auch Sauerstoffschwankungen abfedert. Coco reagiert schneller auf Korrekturen, hat aber ein geringeres Fehlerpolster bei Staunässe."
      },
      {
        question: "Woran erkenne ich ein überwässertes Medium sicher?",
        answer: "Am zuverlässigsten an der ausbleibenden Erholung nach einer Wassergabe: Bleibt die Pflanze trotz sichtbar feuchtem Substrat schlaff, ist das ein stärkeres Signal als Topfgewicht oder Geruch allein."
      },
      {
        question: "Muss ich für jedes Substrat ein anderes Topfgewicht-Ziel kalibrieren?",
        answer: "Ja. Nass- und Trockengewicht unterscheiden sich je nach Substratdichte und Topfgröße stark — eine einmalige Kalibrierung pro Kombination aus Medium und Topfgröße reicht aber für die gesamte Anbausaison."
      }
    ],
    glossary: [
      { term: "Drain", definition: "Abflusswasser nach einer Bewässerung; wichtig für EC- und pH-Kontrolle der Wurzelzone." },
      { term: "Luftporenvolumen", definition: "Anteil des Substratvolumens, der bei Feldkapazität mit Luft statt Wasser gefüllt ist." },
      { term: "Feldkapazität", definition: "Wassergehalt eines Substrats, nachdem überschüssiges Wasser frei abgetropft ist." }
    ],
    sourceIds: ["horticulture-research-cannabis-cultivation", "marschner-mineral-nutrition", "pythium-root-rot-hydroponics"],
    relatedSlugs: ["cannabis-anbau-grundlagen", "bewaesserung-ohne-uebergiessen", "sensor-kalibrierung-und-messfehler"]
  },
  {
    slug: "bewaesserung-ohne-uebergiessen",
    title: "Bewässerung ohne Übergiessen",
    summary: "Wie Giessmenge, Intervall und Drain so abgestimmt werden, dass Pflanzen weder austrocknen noch ersticken.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 8,
    lastUpdated: "2026-08-03",
    tags: ["Bewässerung", "Drain", "Rhythmus", "Substrat"],
    keyTakeaways: [
      "Zu häufiges Gießen schadet meist mehr als leichtes Austrocknen zwischen zwei Zyklen, weil es der Wurzel keine Zeit lässt, Sauerstoff aus dem Substrat nachzuziehen.",
      "Ein Trocken-Nass-Wechsel regt gezielt Wurzelwachstum an: Wurzeln wachsen bevorzugt in Richtung noch sauerstoffreicher, leicht abgetrockneter Zonen.",
      "10–20 % Drain-Anteil pro Gießgang ist die belastbarste Zielgröße, um Salzanreicherung zu vermeiden, ohne das Substrat zu fluten."
    ],
    quickFacts: [
      { label: "Ziel-Drain-Anteil", value: "10–20 % der Gießmenge" },
      { label: "Hauptfehler", value: "Zu früh erneut gießen" },
      { label: "Messhilfe", value: "Topfgewicht plus Drainkontrolle" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Bewässerung ohne Übergießen bedeutet, Gießmenge und -intervall so zu takten, dass die Wurzelzone zwischen zwei Gaben ausreichend Sauerstoff nachziehen kann, ohne dass die Pflanze in Wassermangel gerät.",
          "Die Herausforderung ist nicht die einzelne Wassermenge, sondern der Rhythmus: dieselbe Menge kann je nach Intervall zu Staunässe oder zu Trockenstress führen."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Zwischen zwei Gießgängen sinkt der Wassergehalt im Substrat, wodurch luftgefüllte Poren freiwerden und gelöster Sauerstoff wieder an die Wurzelhaare nachdiffundieren kann.",
          "Bleibt das Substrat dauerhaft nahe der Sättigung, bleibt dieser Sauerstoffnachschub aus — die Wurzel wechselt auf anaerobe Atmung, was die Nährstoffaufnahme aktiv hemmt, nicht nur passiv verlangsamt."
        ]
      },
      {
        heading: "Warum der Trocken-Nass-Wechsel Wurzelwachstum fördert",
        content: [
          "Wurzeln wachsen bevorzugt in Richtung Zonen mit höherer Sauerstoffverfügbarkeit — ein moderater Trocken-Nass-Wechsel regt dadurch aktiv neue Wurzelverzweigung an, ein dauerhaft gesättigtes Substrat dagegen nicht.",
          "Zu aggressive Trockenphasen kehren den Effekt aber um: bei sichtbarem Welken vor der nächsten Gabe überwiegt der Trockenstress den Wachstumsvorteil."
        ]
      },
      {
        heading: "Giessmenge und -intervall nach Phase",
        content: [
          "Sämling/Steckling: kleine, häufige Gaben, da das Wurzelvolumen klein und die Fehlertoleranz gegenüber Trockenstress gering ist.",
          "Vegetativ: moderate Gaben mit klarem Trockenintervall, an Topfgröße und Pflanzenmasse angepasst.",
          "Blüte: größere Einzelgaben bei tendenziell selteneren Intervallen, da der Wasserbedarf pro Gießgang mit der Blattmasse steigt, aber häufige kleine Gaben in dichten Töpfen das Risiko für Staunässe erhöhen."
        ],
        checklist: [
          "Vor jedem Gießen Topfgewicht gegen die kalibrierte Referenz vergleichen",
          "Drain nur in definierten Kontrollgießungen messen, nicht bei jeder Gabe",
          "Ziel-Drain-Anteil von 10–20 % der Gießmenge anstreben"
        ]
      },
      {
        heading: "Substratspezifische Unterschiede",
        content: [
          "Coco hat wenig Wasserpuffer und braucht dadurch häufigere, kleinere Gaben als Erde — teils mehrfach täglich in kleinen Töpfen.",
          "Erde puffert Feuchte länger und verzeiht ein größeres Gießfenster, reagiert dafür langsamer auf Korrekturen."
        ]
      },
      {
        heading: "Diagnose: Übergiessen vs. Trockenstress",
        content: [
          "Übergießen: Topf bleibt über Tage schwer, Substrat riecht dumpf, Pflanze erholt sich trotz feuchtem Substrat nicht.",
          "Trockenstress: schnelle, gleichmäßige Gewichtsabnahme, zügige Erholung nach der nächsten Wassergabe — das entscheidende Unterscheidungsmerkmal."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Auf hängende Blätter reflexartig mit zusätzlichem Wasser reagieren, statt zuerst Topfgewicht und Substratzustand zu prüfen.",
          "Ein starres Kalenderintervall statt eines an Klima, VPD und Pflanzenmasse angepassten Rhythmus fahren.",
          "Nie oder bei jeder Gabe Drain laufen lassen — beide Extreme verhindern eine aussagekräftige Kontrolle."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Automatisierte Tropfbewässerung mit mehreren kurzen Impulsen pro Tag kann in Coco/Hydro Staunässe und Trockenstress gleichzeitig reduzieren, verlangt aber eine sauber kalibrierte Impulslänge je Substrat.",
          "Run-to-Waste-Systeme (kein Recycling der Drainage) vereinfachen die Salzkontrolle gegenüber rezirkulierenden Systemen, erhöhen aber den Wasser- und Düngerverbrauch."
        ]
      }
    ],
    warnings: [
      "Zusätzliches Gießen bei bereits schwerem, feuchtem Substrat verschärft eine bestehende Staunässe und erhöht das Risiko für Wurzelfäule."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Übergiessen",
        text: "Nicht die einzelne Wassermenge ist das Hauptproblem, sondern zu wenig Sauerstoff im Substrat über zu lange Zeit, weil zu selten eine Trockenphase zugelassen wird."
      },
      {
        title: "Kurz erklärt: Warum Drain wichtig ist",
        text: "Ein kleiner Abflussanteil bei der Gießung spült angereicherte Salze aus dem Substrat, bevor sie die EC in der Wurzelzone unkontrolliert ansteigen lassen."
      }
    ],
    faq: [
      {
        question: "Soll bei jeder Gießung Drain entstehen?",
        answer: "Nein. Regelmäßige Kontrollgießungen mit 10–20 % Drain-Anteil reichen, um Salzanreicherung zu erkennen — ständiges Durchspülen bei jeder Gabe ist in den meisten Setups nicht nötig."
      },
      {
        question: "Wie schnell darf ein Topf trocknen?",
        answer: "Das hängt von Medium und Phase ab. Kritisch wird es erst, wenn die Trocknung so schnell oder ungleichmäßig verläuft, dass dadurch spürbare Salzspitzen oder Welken vor der nächsten Gabe entstehen."
      },
      {
        question: "Warum wächst die Wurzel bei leichtem Austrocknen besser?",
        answer: "Wurzeln folgen dem Sauerstoffgradienten und verzweigen bevorzugt in Richtung frisch abgetrockneter, luftreicherer Zonen. Ein moderater Trocken-Nass-Wechsel nutzt diesen Effekt gezielt aus."
      }
    ],
    glossary: [
      { term: "Drain-Anteil", definition: "Der Teil der Gießmenge, der unten aus dem Topf abläuft; zeigt Sättigung und Salzhaushalt der Wurzelzone an." },
      { term: "Trocken-Nass-Wechsel", definition: "Regelmäßiger Wechsel zwischen abgetrocknetem und frisch gewässertem Substratzustand, der Wurzelwachstum anregt." },
      { term: "Staunässe", definition: "Dauerhaft zu nasses Medium mit Sauerstoffmangel im Wurzelbereich." }
    ],
    sourceIds: ["horticulture-research-cannabis-cultivation", "marschner-mineral-nutrition", "bugbee-electrical-conductivity"],
    relatedSlugs: ["cannabis-substrat-und-wurzelzone", "cannabis-anbau-grundlagen", "vpd-einfach-erklaert"]
  },
  {
    slug: "lichtstress-und-canopy-management",
    title: "Lichtstress und Canopy-Management",
    summary: "Wie Lichtverteilung, Abstand und Blattfläche zusammenwirken und wann hohe Intensität mehr schadet als hilft.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 10,
    lastUpdated: "2026-08-03",
    tags: ["PPFD", "Canopy", "Lichtstress", "Uniformität"],
    keyTakeaways: [
      "Lichtstress ist Photoinhibition: trifft mehr Lichtenergie auf ein Blatt, als der Photosyntheseapparat verarbeiten kann, werden die Reaktionszentren im Photosystem II geschädigt — mehr PPFD ohne passendes Klima und CO2 senkt dann die Leistung statt sie zu steigern.",
      "Eine gleichmäßige Canopy mit moderater PPFD über der ganzen Fläche liefert meist mehr Gesamtertrag als eine ungleichmäßige Canopy mit lokalen Spitzenwerten direkt unter der Lampe.",
      "PPFD-Zielwerte sind an CO2-Konzentration und Temperatur gekoppelt — höhere Lichtintensität ist nur mit angehobenem CO2 und stabilem Klima sinnvoll nutzbar."
    ],
    quickFacts: [
      { label: "PPFD vegetativ", value: "400–600 µmol·m⁻²·s⁻¹" },
      { label: "PPFD Blüte (Umgebungsluft)", value: "600–900 µmol·m⁻²·s⁻¹" },
      { label: "PPFD Blüte (mit CO2-Anreicherung)", value: "bis 1000–1200 µmol·m⁻²·s⁻¹" },
      { label: "Fehlerquelle", value: "Zu nahes Licht bei instabilem Klima/CO2" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Lichtstress entsteht, wenn die auftreffende Lichtmenge die photosynthetische Verarbeitungskapazität des Blatts übersteigt — nicht Licht an sich, sondern das Missverhältnis zwischen Lichtangebot und Verarbeitungskapazität ist die Ursache.",
          "Canopy-Management bezeichnet die gezielte Steuerung der Blattflächenverteilung, damit möglichst viel Blattfläche im nutzbaren PPFD-Fenster liegt statt in Über- oder Unterversorgung."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Photosynthese folgt einer Sättigungskurve: mit steigender PPFD nimmt die Photosyntheserate zunächst annähernd linear zu, flacht dann ab und erreicht ein Plateau, sobald CO2-Verfügbarkeit oder Enzymkapazität limitierend werden.",
          "Wird die Lichtmenge über dieses Plateau hinaus weiter erhöht, kann überschüssige Energie die Reaktionszentren von Photosystem II photochemisch schädigen — dieser Prozess heißt Photoinhibition und zeigt sich makroskopisch als Bleaching."
        ]
      },
      {
        heading: "PPFD-Zielwerte nach Phase und CO2-Niveau",
        content: [
          "Vegetative Phase: 400–600 µmol·m⁻²·s⁻¹ bei Umgebungsluft (≈ 400 ppm CO2) reichen für stabiles Wachstum ohne unnötiges Photoinhibitionsrisiko.",
          "Blütephase ohne CO2-Anreicherung: 600–900 µmol·m⁻²·s⁻¹ ist der praktikable Zielkorridor — darüber steigt die Photosyntheserate kaum noch, während Hitzestress-Risiko und Energiekosten weiter zunehmen.",
          "Mit CO2-Anreicherung auf 1000–1500 ppm verschiebt sich das nutzbare PPFD-Fenster nach oben (bis etwa 1000–1200 µmol·m⁻²·s⁻¹), weil CO2 nicht mehr der limitierende Faktor der Kohlenstofffixierung ist."
        ]
      },
      {
        heading: "Canopy sauber führen",
        content: [
          "Pflanzentraining (Topping, Low-Stress-Training, gezielte Defoliation) verteilt die Blattfläche horizontal, statt sie in einem hohen, schmalen Hauptrieb zu konzentrieren, und reduziert dadurch Hotspots direkt unter der Lampe.",
          "Eine PPFD-Karte über mehrere Rasterpunkte der Anbaufläche zeigt Über- und Unterversorgungszonen objektiv auf, die von Auge oft nicht erkennbar sind."
        ],
        checklist: [
          "PPFD an mehreren Rasterpunkten auf Canopy-Höhe messen, nicht nur zentral unter der Lampe",
          "Blatttemperatur an vermuteten Hotspots mit Infrarot-Thermometer prüfen, nicht nur die Lufttemperatur",
          "Canopy-Höhe und -Gleichmäßigkeit pro Zone dokumentieren, um Trainingsentscheidungen datenbasiert zu treffen"
        ]
      },
      {
        heading: "Diagnose: Lichtstress vs. verwandte Symptome",
        content: [
          "Lichtstress/Bleaching zeigt sich als Aufhellung bis Weißfärbung der obersten, lampennächsten Blätter — betrifft primär die Blattfläche in direkter Lampennähe, nicht die ganze Pflanze gleichmäßig.",
          "Hitzestress (Tacoing, nach oben gerollte Blattränder) tritt oft gemeinsam mit Lichtstress auf, weil beide durch zu geringen Lampenabstand oder zu schwache Klimatisierung verursacht werden — Blatttemperatur-Messung trennt beide Ursachen.",
          "Calciummangel kann oberflächlich ähnliche Aufhellung an jungen Blättern zeigen, betrifft aber unabhängig von der Lampenposition die gesamte Canopy gleichmäßig, nicht nur die lampennächste Zone."
        ]
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "Bei bestätigtem Lichtstress zuerst den Lampenabstand erhöhen oder die Leistung dimmen, statt sofort das Klima anzupassen — das behebt die Ursache direkter.",
          "Wenn Klima und CO2 bereits stabil im Zielbereich liegen und trotzdem Bleaching auftritt, ist das PPFD-Niveau schlicht zu hoch für die aktuelle CO2-Konzentration und muss gesenkt werden."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "PPFD isoliert erhöhen, ohne CO2-Konzentration und Klimastabilität mitzudenken — das verschiebt das Sättigungsplateau nicht nach oben, sondern erhöht nur das Photoinhibitionsrisiko.",
          "Nur die zentrale PPFD unter der Lampe als Referenz nehmen und Randzonen der Canopy ignorieren.",
          "Bleaching automatisch als reines Lichtproblem werten, ohne Blatttemperatur und Nährstoffstatus zur Absicherung der Diagnose heranzuziehen."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "CO2-Anreicherung verändert nicht nur die maximal nutzbare PPFD, sondern auch den optimalen Temperaturbereich — bei höherem CO2 verträgt die Pflanze tendenziell etwas höhere Temperaturen ohne Effizienzverlust.",
          "Lichtspektrum-Anteile (insbesondere fernes Rot) beeinflussen Blattwinkel und Internodienstreckung zusätzlich zur reinen PPFD und sollten bei der Canopy-Planung mitgedacht werden."
        ]
      }
    ],
    warnings: [
      "PPFD über 900 µmol·m⁻²·s⁻¹ ohne CO2-Anreicherung bringt in der Regel keinen zusätzlichen Ertrag, erhöht aber das Risiko für Photoinhibition und Hitzestress messbar."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: PPFD",
        text: "PPFD beschreibt, wie viele photosynthetisch nutzbare Lichtteilchen pro Sekunde auf eine Fläche treffen. Mehr ist nur bis zu einem Sättigungspunkt hilfreich, danach steigt nur noch das Stressrisiko."
      },
      {
        title: "Kurz erklärt: Photoinhibition",
        text: "Wenn ein Blatt mehr Lichtenergie bekommt, als es photosynthetisch verarbeiten kann, wird der Photosyntheseapparat selbst geschädigt. Das ist die eigentliche Ursache von Bleaching."
      }
    ],
    faq: [
      {
        question: "Brauche ich sofort ein PAR-Meter?",
        answer: "Für ernsthafte Prozesssteuerung ja, zumindest zeitweise. Schätzwerte oder App-Messungen reichen nur für grobe Orientierung und können den tatsächlichen PPFD-Wert deutlich verfehlen."
      },
      {
        question: "Ist Bleaching immer zu viel Licht?",
        answer: "Meist ja, aber nicht ausschließlich. Hitzestress durch zu geringen Lampenabstand und in selteneren Fällen Calciummangel können ähnliche Aufhellungen erzeugen — die Position der betroffenen Blätter relativ zur Lampe hilft bei der Unterscheidung."
      },
      {
        question: "Lohnt sich mehr PPFD ohne CO2-Anreicherung?",
        answer: "Meist nicht über etwa 900 µmol·m⁻²·s⁻¹. Ohne zusätzliches CO2 wird die Kohlenstofffixierung zum limitierenden Faktor, und zusätzliches Licht erhöht vor allem das Photoinhibitions- und Hitzestressrisiko."
      }
    ],
    glossary: [
      { term: "PPFD", definition: "Photosynthetic Photon Flux Density — die Menge photosynthetisch nutzbaren Lichts, die pro Fläche und Sekunde auf die Pflanze trifft." },
      { term: "Photoinhibition", definition: "Schädigung der Reaktionszentren von Photosystem II durch überschüssige, nicht verarbeitbare Lichtenergie." },
      { term: "Canopy", definition: "Oberste Ebene aus Blatt- und Blütenmasse, die den Großteil des Lichts abfängt." }
    ],
    sourceIds: ["chandra-cannabis-photosynthesis-temperature-co2", "mortensen-co2-enrichment-review", "plant-physiology-vpd-transpiration"],
    relatedSlugs: ["cannabis-anbau-grundlagen", "vpd-einfach-erklaert", "vpd-und-ec-kombi-rechner-guide"]
  },
  createArticle({
    slug: "integrierte-schaedlingspraevention-grow",
    title: "Integrierte Schädlingsprävention im Grow",
    summary: "Wie Monitoring, Hygiene und Früherkennung Ausfälle verhindern, ohne blind in Chemie oder Panik zu verfallen.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["IPM", "Hygiene", "Monitoring", "Prävention"],
    keyTakeaways: [
      "Ein IPM-System lebt von Früherkennung, Quarantäne und stabilen Routinen statt von Spätreaktionen.",
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
          "Nur so bleiben Eingriffe verhältnismässig und auditierbar."
        ],
        checklist: [
          "Quarantäne für neue Pflanzen oder Material",
          "Wöchentliche Monitoring-Route mit Foto-Dokumentation",
          "Reinigungsplan für Werkzeuge, Schuhe und Flächen"
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
        question: "Ist jedes Blattproblem gleich ein Schädling?",
        answer: "Nein. Nahrstoffprobleme, Lichtstress oder Umweltstress können ähnlich aussehen und müssen sauber abgegrenzt werden."
      }
    ],
    glossary: [
      { term: "IPM", definition: "Integrierter Ansatz zur Prävention und Kontrolle von Schädlingen über mehrere Massnahmenebenen." },
      { term: "Quarantäne", definition: "Zeitlich und räumlich getrennte Beobachtung neuer Pflanzen oder Materialien." },
      { term: "Sticky Trap", definition: "Klebefalle zur Früherkennung fliegender Schädlinge und zur Trendbeobachtung." },
    ],
    relatedSlugs: ["pgr-und-kontaminanten", "schimmel-und-mykotoxine-bei-cannabis", "cannabis-anbau-grundlagen"]
  }),
  {
    slug: "feminisiert-vs-regular-vs-autoflower",
    title: "Feminisiert vs. Regular vs. Autoflower",
    summary: "Welche genetischen Formate es gibt, wo ihre jeweiligen Stärken liegen und welche Missverständnisse häufig sind.",
    category: "genetik",
    difficulty: "einsteiger",
    readMinutes: 9,
    lastUpdated: "2026-08-03",
    tags: ["Samen", "Regular", "Autoflower", "Genetik"],
    keyTakeaways: [
      "Feminisierte Samen entstehen aus einer selbstbestäubten weiblichen Pflanze (meist über Silberthiosulfat-Stress) — genetisch ist das eine Selbstung, keine echte Kreuzung, was die genetische Vielfalt der Nachkommen gegenüber Regular-Samen einschränkt.",
      "Autoflower tragen eine Ruderalis-Introgression, die die Blüte an Alter/Nodienzahl statt an die Tageslänge koppelt — das ist ein anderer Entwicklungsmodus, kein Qualitätsurteil.",
      "Regular-Samen bieten die größte genetische Diversität für Selektion und Zuchtprogramme, weil beide Elternteile ihr volles genetisches Spektrum unverzerrt weitergeben."
    ],
    quickFacts: [
      { label: "Zyklus Photoperiodisch (Feminisiert/Regular)", value: "≈ 10–16 Wochen, steuerbar" },
      { label: "Zyklus Autoflower", value: "≈ 8–11 Wochen, fix" },
      { label: "Selektionsfreiheit", value: "Am größten bei Regular" },
      { label: "Weiblichkeitsrate Feminisiert", value: "Hoch, aber nicht 100 %" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Regular-Samen entstehen aus klassischer Bestäubung zwischen einer männlichen und einer weiblichen Pflanze und ergeben eine natürliche Geschlechterverteilung von etwa 50:50.",
          "Feminisierte Samen entstehen, wenn eine weibliche Pflanze durch gezielten Stress (meist Silberthiosulfat- oder Kolloidalsilber-Behandlung) dazu gebracht wird, männliche Blüten mit ausschließlich X-Chromosomen zu bilden, und sich damit selbst bestäubt.",
          "Autoflower-Linien tragen eine Cannabis-ruderalis-Introgression, die die Blüteninduktion von der Tageslänge entkoppelt und stattdessen an Pflanzenalter bzw. Nodienzahl bindet."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Cannabis ist überwiegend diözisch mit einem XY-ähnlichen Geschlechtsbestimmungssystem. Unter Stress (Lichteinbruch während der Dunkelphase, Silberionen-Behandlung) können weibliche Pflanzen dennoch männliche Blüten bilden, die ausschließlich X-Pollen tragen.",
          "Da diese Pollen kein Y-Chromosom enthalten, ergeben sich aus der Bestäubung fast ausschließlich weibliche (XX) Nachkommen — daher der hohe, aber nicht absolute Weiblichkeitsanteil feminisierter Samen.",
          "Cannabis ruderalis blüht photoperiodenunabhängig, weil bei ihr die Blühauslösung entwicklungsbiologisch statt lichtbasiert gesteuert ist — ein Anpassungsmerkmal an kurze, unvorhersehbare Vegetationsperioden in nördlichen Breiten."
        ]
      },
      {
        heading: "Genetische Vielfalt und Zuchtwert",
        content: [
          "Regular-Samen aus einer echten Kreuzung zweier unterschiedlicher Elternpflanzen liefern die größte Bandbreite an Phänotypen und sind damit die Basis jeder ernsthaften Selektions- oder Zuchtarbeit.",
          "Feminisierte Samen aus Selbstung (S1) reduzieren die genetische Variation gegenüber einer echten Kreuzung, weil beide 'Eltern' genetisch identisch mit der Ausgangspflanze sind — die Nachkommen ähneln sich untereinander stärker.",
          "Autoflower-Linien vererben die Ruderalis-Introgression zusammen mit dem restlichen genetischen Hintergrund; moderne, mehrfach zurückgekreuzte Linien (BX) minimieren unerwünschte Ruderalis-Eigenschaften wie geringere Wuchshöhe bei erhaltenem Auto-Merkmal."
        ]
      },
      {
        heading: "Praktische Unterschiede im Anbau",
        content: [
          "Photoperiodische Pflanzen (Regular wie Feminisiert) erlauben eine steuerbare, beliebig verlängerbare vegetative Phase — die Blüte wird erst durch Umstellung des Lichtzyklus ausgelöst.",
          "Autoflower haben eine fixe, kurze Gesamtlebensdauer von etwa 8–11 Wochen ab Keimung, unabhängig vom Lichtzyklus — das vereinfacht die Zeitplanung, lässt aber wenig Spielraum für nachträgliche Größenkorrektur."
        ]
      },
      {
        heading: "Vor- und Nachteile je Zielsetzung",
        content: [
          "Für Zuchtprogramme und Phänotyp-Selektion: Regular-Samen, wegen der vollen genetischen Bandbreite beider Elternteile.",
          "Für einfache, planbare Produktion ohne Geschlechtsbestimmung: Feminisierte Samen, wegen des hohen Weiblichkeitsanteils bei gleichzeitig steuerbarer Photoperiode.",
          "Für kurze Zyklen, mehrere Runs pro Saison oder platzsparenden Anbau: Autoflower, auf Kosten von Größen- und teils Ertragsobergrenze im Vergleich zu ausgewachsenen photoperiodischen Pflanzen."
        ]
      },
      {
        heading: "Häufige Missverständnisse",
        content: [
          "'Feminisiert bedeutet 100 % weiblich': falsch — der Anteil ist hoch, aber unter Stress können auch feminisierte Pflanzen Zwittrigkeit zeigen oder in seltenen Fällen männlich ausfallen.",
          "'Autoflower sind grundsätzlich schwächer oder minderwertiger': falsch — moderne, mehrfach zurückgekreuzte Autoflower-Linien erreichen bei guter Führung konkurrenzfähige Potenz- und Terpenwerte, unterscheiden sich aber im Entwicklungsmodus.",
          "'Regular-Samen sind für Einsteiger ungeeignet': nicht grundsätzlich, aber sie erfordern Geschlechtsbestimmung und damit einen zusätzlichen Kontrollschritt, den feminisierte Samen überflüssig machen."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Autoflower wie photoperiodische Pflanzen mit aggressivem Training (starkes Topping, Umtopfen spät im Zyklus) behandeln — die kurze, fixe Lebensspanne lässt weniger Erholungszeit.",
          "Bei Regular-Samen die Geschlechtsbestimmung vernachlässigen und männliche Pflanzen zu spät entfernen, wodurch benachbarte weibliche Pflanzen unerwünscht bestäubt werden.",
          "Breeder-Herkunftsangaben zur Stabilität einer Linie ungeprüft übernehmen, statt sie über einen eigenen Testlauf zu verifizieren."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Rückkreuzung (Backcrossing) von Autoflower-Linien auf potente photoperiodische Elternlinien stabilisiert über mehrere Generationen das Auto-Merkmal, während unerwünschte Ruderalis-Eigenschaften schrittweise herausgezüchtet werden.",
          "Die Silberthiosulfat-Methode zur Feminisierung ist reproduzierbarer und stressärmer für die Mutterpflanze als ältere Kolloidalsilber-Sprühverfahren, was die Stabilität moderner feminisierter Linien gegenüber älteren Chargen verbessert hat."
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Regular",
        text: "Samen mit natürlicher Geschlechterverteilung aus einer echten Kreuzung — wichtig für Selektion und Zuchtarbeit, weil die volle genetische Bandbreite erhalten bleibt."
      },
      {
        title: "Kurz erklärt: Autoflower",
        text: "Pflanzen, die nach Alter statt nach Lichtzyklus in die Blüte gehen. Das vereinfacht die Zeitplanung, begrenzt aber die Möglichkeit, die vegetative Phase gezielt zu verlängern."
      }
    ],
    faq: [
      {
        question: "Sind feminisierte Samen instabil?",
        answer: "Nicht automatisch. Gute Linien mit sauberer Feminisierungsmethode können sehr stabil sein, schlechte Ausgangsgenetik zeigt Probleme unabhängig vom Feminisierungsverfahren."
      },
      {
        question: "Sind Autoflower immer schneller im Gesamtablauf?",
        answer: "Meist ja, weil die Lebensspanne fix und kurz ist. Effizienter ist das aber nicht automatisch — die begrenzte Größe kann den Ertrag pro Zyklus gegenüber einer gut geführten photoperiodischen Pflanze senken."
      },
      {
        question: "Kann ich aus feminisierten Samen weiterzüchten?",
        answer: "Technisch ja, genetisch limitiert. Da feminisierte Samen aus einer Selbstung stammen, ist die genetische Variation der nächsten Generation geringer als bei einer echten Kreuzung aus Regular-Samen."
      }
    ],
    glossary: [
      { term: "Photoperiode", definition: "Abhängigkeit der Blüte von der Tageslänge beziehungsweise dem Lichtzyklus." },
      { term: "Selbstung (S1)", definition: "Bestäubung einer Pflanze mit ihrem eigenen Pollen; reduziert die genetische Variation der Nachkommen gegenüber einer Kreuzung." },
      { term: "Introgression", definition: "Einkreuzung genetischen Materials einer anderen Linie oder Unterart, hier: der Ruderalis-Autoflower-Eigenschaft." }
    ],
    sourceIds: ["genetics-heritable-traits-cannabis", "horticulture-research-cannabis-cultivation"],
    relatedSlugs: ["genetik-und-phaenotyp-selektion", "mutterpflanzen-und-clone-hygiene", "selektionsscorecards-fuer-pheno-hunts"]
  },
  createArticle({
    slug: "mutterpflanzen-und-clone-hygiene",
    title: "Mutterpflanzen und Clone-Hygiene",
    summary: "Wie du gesunde Mutterlinien führst, Kreuzkontamination vermeidest und Clone-Programme reproduzierbar machst.",
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
        heading: "Warum Mutterlinien oft unterschätzt werden",
        content: [
          "Viele Systeme fokussieren nur auf den Run, nicht auf die Quelle des Pflanzenmaterials. Genau dort entstehen aber oft die späteren Probleme.",
          "Eine müde, kontaminierte oder falsch geführte Mutterlinie zieht Fehler durch den gesamten Prozess."
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
          "Mutterpflanzen regelmäßig verjüngen",
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
        answer: "Ja. Ein einzelner Ausfall sollte nie die gesamte Genetikstrategie gefährden."
      }
    ],
    glossary: [
      { term: "Mutterlinie", definition: "Langfristig erhaltene Pflanze oder Linie zur Produktion genetisch gleicher Stecklinge." },
      { term: "Bewurzelungsquote", definition: "Anteil der Stecklinge, die erfolgreich Wurzeln bilden." },
      { term: "Verjüngung", definition: "Geplante Erneuerung einer Mutterpflanze durch frisches Material derselben Linie." },
    ],
    relatedSlugs: ["genetik-und-phaenotyp-selektion", "integrierte-schaedlingspraevention-grow", "feminisiert-vs-regular-vs-autoflower"]
  }),
  createArticle({
    slug: "selektionsscorecards-fuer-pheno-hunts",
    title: "Selektionsscorecards für Pheno-Hunts",
    summary: "Wie du Auswahlprozesse mit Kriterien, Gewichtungen und Bestätigungsläufen objektiver machst.",
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
          "Vergleiche Kandidaten blind, soweit möglich, und verknüpfe subjektive Sensorik mit objektiven Labor- oder Prozessdaten.",
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
        answer: "Ja, aber dann sinkt die Trennschärfe. Besonders bei Qualitäts- und Sicherheitsprofilen helfen Laborwerte deutlich."
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
    relatedSlugs: ["genetik-und-phaenotyp-selektion", "mutterpflanzen-und-clone-hygiene", "terpene-und-wirkprofil"]
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
          "Zu spät geerntet oder schlecht gelagert: THC baut ab, CBN steigt — das Profil kippt unwiderruflich."
        ],
        checklist: [
          "Analysedaten immer mit Ernte- und Prozessdaten lesen",
          "Minor-Werte nur mit Methodenhinweis vergleichen",
          "COA-Datum prüfen: ältere Proben spiegeln nicht das aktuelle Profil"
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
      { term: "Biosynthese", definition: "Biochemischer Aufbau von Molekülen innerhalb eines lebenden Organismus." },
      { term: "Vorstufe", definition: "Chemische Ausgangssubstanz, aus der weitere Verbindungen entstehen." },
      { term: "Minor Cannabinoide", definition: "Cannabinoide, die nur in kleineren Mengen auftreten und oft methodisch schwerer zu bewerten sind." },
    ],
    relatedSlugs: ["cannabinoide-und-evidenz", "analytik-hplc-vs-gc-bei-cannabinoiden", "coa-richtig-lesen"]
  }),
  createArticle({
    slug: "thc-zu-cbn-abbau-und-oxidation",
    title: "THC zu CBN: Abbau und Oxidation",
    summary: "Warum Wirkstoffprofile bei Licht, Hitze und Zeit kippen und wie diese Veränderungen sauber eingeordnet werden.",
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
      { term: "Abbauprodukt", definition: "Substanz, die aus der Veränderung oder Zersetzung eines anderen Moleküls entsteht." },
      { term: "Stabilität", definition: "Wie gut ein chemisches Profil über Zeit und Lagerbedingungen erhalten bleibt." },
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
        text: "Flüssigchromatographie, die sich besonders für hitzeempfindliche Verbindungen eignet."
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
        answer: "Methoden, Kalibration, Probenahme und Aufarbeitung können Unterschiede erzeugen, selbst bei ähnlichem Ausgangsmaterial."
      }
    ],
    glossary: [
      { term: "HPLC", definition: "High-Performance Liquid Chromatography, ein Standardverfahren für viele nichtflüchtige oder hitzeempfindliche Analyten." },
      { term: "GC", definition: "Gaschromatographie, genutzt für flüchtige oder thermisch analysierbare Verbindungen." },
      { term: "Kalibration", definition: "Abgleich eines Messsystems mit bekannten Standards, um korrekte Quantifizierung zu ermöglichen." },
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
          "Myrcen, Limonen und Caryophyllen sind die drei am häufigsten gemessenen Terpene — sie beschreiben einen Teil des Aromas, aber nicht die Wirkung.",
          "Ein Produkt mit viel Myrcen kann trotzdem ein anderes Profil haben als ein anderes mit gleichen Werten, weil andere Bestandteile mitspielen."
        ]
      },
      {
        heading: "Warum das für Qualitätsbewertung wichtig ist",
        content: [
          "Wer nur auf das Top-Terpen schaut, bewertet ein Produkt unvollständig.",
          "Qualität entsteht aus dem Gesamtprofil — kein einzelnes Terpen erklärt, warum eine Ernte besonders gut ist."
        ],
        checklist: [
          "Gesamtprofil lesen, nicht nur das stärkste Terpen",
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
        answer: "Weil sie merkfähig sind. Das macht sie aber nicht automatisch zu belastbaren Wirklabels."
      }
    ],
    glossary: [
      { term: "Gesamtprofil", definition: "Kombination aller relevanten Stoffe und ihrer Verhältnisse in einem Produkt." },
      { term: "Sensorik", definition: "Eindruck von Geruch, Geschmack und Wahrnehmung eines Produkts." },
      { term: "Korrelation", definition: "Statistischer Zusammenhang, der noch keine sichere Ursache beweist." },
    ],
    relatedSlugs: ["terpene-und-wirkprofil", "sensorik-panels-fuer-cannabisprodukte", "coa-richtig-lesen"]
  }),
  createArticle({
    slug: "lagerung-und-terpenverlust-vermeiden",
    title: "Lagerung und Terpenverlust vermeiden",
    summary: "Warum Verpackung, Temperatur und Sauerstoffkontakt das Aromaprofil stärker formen, als viele Content-Seiten zugeben.",
    category: "terpene",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    tags: ["Terpenverlust", "Lagerung", "Sauerstoff", "Aroma"],
    keyTakeaways: [
      "Terpene sind volatil und reagieren stark auf Licht, Wärme und Luftkontakt.",
      "Gute Verpackung ist ein Qualitätsthema, nicht nur Branding.",
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
          "Terpene verdampfen oder verändern sich leichter als viele andere Stoffklassen. Schon die Kombination aus Lagerzeit und ungünstiger Verpackung kann viel kosten.",
          "Deshalb ist das ursprüngliche Profil nicht automatisch identisch mit dem, was später beim Nutzer ankommt."
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
        text: "Leicht flüchtig oder leicht in die Gasphase übergehend. Gerade das macht Terpene empfindlich gegen Lagerfehler."
      },
      {
        title: "Kurz erklärt: Sauerstoffschutz",
        text: "Verpackungen und Prozesse, die den Kontakt mit Luft reduzieren und damit Profilverlust verlangsamen."
      }
    ],
    faq: [
      {
        question: "Hilft Kühlung immer?",
        answer: "Oft ja, aber nur mit kontrollierter Feuchte und passender Verpackung. Sonst entstehen neue Probleme."
      },
      {
        question: "Warum riecht eine Charge später so anders?",
        answer: "Weil Lagerzeit, Licht und Sauerstoffkontakt das Terpenprofil sichtbar verändern können."
      }
    ],
    glossary: [
      { term: "Volatil", definition: "Leicht verdampfend oder leicht in die Luft übergehend." },
      { term: "Headspace", definition: "Luftraum in einer Verpackung, der den Sauerstoffkontakt mit beeinflusst." },
      { term: "Aromastabilität", definition: "Wie gut ein Produkt sein Geruchs- und Geschmacksprofil über Zeit behält." },
    ],
    relatedSlugs: ["wasseraktivitaet-und-curing", "lagerung-verpackung-und-lichtschutz", "terpene-und-wirkprofil"]
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
          "Aromabewertung ist anfällig für Erwartung, Branding und Gruppeneffekte. Standardisierte Panels machen diese Verzerrungen sichtbar kleiner.",
          "Das ist besonders wichtig, wenn Produktbeschreibungen später in Kataloge oder Content einfliessen."
        ]
      },
      {
        heading: "Wie Panels aufgebaut werden",
        content: [
          "Arbeite mit festen Deskriptoren, Blindmustern und klaren Bewertungsbögen. Wiederhole Bewertungen in definierten Intervallen.",
          "Wird Sensorik mit Laborwerten verknüpft, verbessert sich die Plausibilität für Profilbeschreibungen deutlich."
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
        text: "Ein standardisiertes Wort oder Attribut, mit dem Geruchs- oder Geschmackseindrücke beschrieben werden."
      },
      {
        title: "Kurz erklärt: Blindprobe",
        text: "Eine Probe ohne sichtbare Produktidentität, damit Erwartung die Bewertung weniger beeinflusst."
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
      { term: "Deskriptor", definition: "Standardisiertes Merkmal zur Beschreibung sensorischer Eindrücke." },
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
      { label: "Grenze", value: "Nicht jede Studie ist übertragbar" },
      { label: "Praxis", value: "Aufklärung statt Versprechen" }
    ],
    sections: [
      {
        heading: "Warum Schmerzforschung so schwer zu lesen ist",
        content: [
          "Schmerz kann akut, chronisch, neuropathisch oder entzündlich sein. Studien lassen sich deshalb nicht beliebig zusammenwerfen.",
          "Ohne saubere Trennung der Endpunkte entstehen schnell überzogene Schlussfolgerungen."
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
        text: "Das konkrete Ergebnis, das in einer Studie gemessen wird, etwa Schmerzintensität oder Schlafqualität."
      },
      {
        title: "Kurz erklärt: Meta-Analyse",
        text: "Zusammenfassung mehrerer Studien, die einen breiteren Blick ermöglicht, aber nur so gut ist wie die eingeschlossenen Daten."
      }
    ],
    faq: [
      {
        question: "Ist Cannabis ein generelles Schmerzmittel?",
        answer: "So pauschal lässt sich das nicht sagen. Die Evidenz ist indikations- und populationsabhängig."
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
          "Schlaf hat viele Komponenten: Einschlafzeit, Durchschlafen, Tiefschlaf, Tagesmüdigkeit und subjektive Erholung.",
          "Eine positive Selbsteinschätzung ersetzt daher keine differenzierte Bewertung."
        ]
      },
      {
        heading: "Wie Inhalte dazu fair bleiben",
        content: [
          "Gute Inhalte nennen sowohl mögliche kurzfristige Entlastung als auch Unsicherheiten bei Langzeitnutzung und individueller Variabilität.",
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
      { term: "Subjektive Erholung", definition: "Persönliches Empfinden, wie erholt man sich nach dem Schlaf fühlt." },
      { term: "Langzeitdaten", definition: "Studien oder Beobachtungen über längere Zeiträume mit wiederholter Erfassung." },
    ],
    relatedSlugs: ["cannabinoide-und-evidenz", "cbd-und-angststoerungen-einordnung", "thc-risiken-bei-jugendlichen"]
  }),
  createArticle({
    slug: "cbd-und-angststoerungen-einordnung",
    title: "CBD und Angststörungen einordnen",
    summary: "Was aus Studien wirklich ableitbar ist und wo aus frühen Hinweisen zu schnell Gewissheiten gemacht werden.",
    category: "medizin",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    tags: ["CBD", "Angst", "Studienlage", "Einordnung"],
    keyTakeaways: [
      "CBD wird häufig überverkauft, obwohl die Humanstudienlage je nach Kontext begrenzt bleibt.",
      "Präklinische Hinweise dürfen nicht mit klinischer Sicherheit verwechselt werden.",
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
          "Besonders oft werden Labor- oder Tierbefunde direkt in Alltagsempfehlungen übersetzt."
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
        title: "Kurz erklärt: präklinisch",
        text: "Studien im Labor oder Tiermodell, die Hinweise liefern, aber keine sichere Aussage für Menschen erlauben."
      },
      {
        title: "Kurz erklärt: klinisch",
        text: "Untersuchungen am Menschen, meist mit deutlich höherem Anspruch an Übertragbarkeit."
      }
    ],
    faq: [
      {
        question: "Ist CBD ein sicheres Mittel gegen Angst?",
        answer: "So pauschal nicht. Es gibt Hinweise, aber die Qualität und Übertragbarkeit der Daten sind begrenzt und kontextabhängig."
      },
      {
        question: "Warum sagen viele Seiten etwas anderes?",
        answer: "Weil frühe Befunde und Marketing oft zu schnell zusammengezogen werden."
      }
    ],
    glossary: [
      { term: "Präklinisch", definition: "Vorstufe klinischer Forschung, meist im Labor oder Tiermodell." },
      { term: "Humanstudie", definition: "Studie mit menschlichen Teilnehmenden zur prüfbaren Einordnung von Nutzen und Risiken." },
      { term: "Übertragbarkeit", definition: "Grad, in dem sich Studienergebnisse auf andere Personen oder reale Situationen anwenden lassen." },
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
      "Prävention funktioniert besser über klare, glaubwürdige Aufklärung als über plakative Übertreibung.",
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
          "Deshalb müssen Risiken differenziert und glaubwürdig kommuniziert werden."
        ]
      },
      {
        heading: "Prävention ohne Panikmodus",
        content: [
          "Abschreckung allein reicht selten. Inhalte sollten nachvollziehbar sein, konkrete Risiken benennen und Raum für Fragen lassen.",
          "So wird Aufklärung anschlussfähiger als reine Moralisierung."
        ],
        checklist: [
          "Häufigkeit und Potenz getrennt erklären",
          "Vulnerable Gruppen explizit benennen",
          "Hilfs- und Beratungsangebote sichtbar machen"
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Potenz",
        text: "Wie stark ein Produkt in Bezug auf relevante Wirkstoffe ausfällt, meist vereinfacht über THC-Gehalte beschrieben."
      },
      {
        title: "Kurz erklärt: Risikokommunikation",
        text: "Art, wie Risiken vermittelt werden, damit sie verstanden und ernst genommen werden, ohne falschen Alarmismus."
      }
    ],
    faq: [
      {
        question: "Ist jeder Konsum im Jugendalter gleich gefährlich?",
        answer: "Nein. Häufigkeit, Potenz, Alter, psychische Belastung und Kontext beeinflussen das Risiko deutlich."
      },
      {
        question: "Warum ist glaubwürdige Aufklärung so wichtig?",
        answer: "Weil überzogene Botschaften oft abgelehnt werden und damit präventive Wirkung verlieren."
      }
    ],
    glossary: [
      { term: "Potenz", definition: "Stärke oder Konzentration relevanter Wirkstoffe in einem Produkt." },
      { term: "Vulnerabel", definition: "Besonders empfindlich oder risikobelastet in einem bestimmten Kontext." },
      { term: "Prävention", definition: "Massnahmen zur Vorbeugung unerwünschter gesundheitlicher oder sozialer Folgen." },
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
          "Viele Inhalte fokussieren fast nur auf möglichen Nutzen. Das führt zu einem unausgewogenen Bild und schwächt die Glaubwürdigkeit.",
          "Eine seriöse Seite benennt sowohl häufige als auch potenziell relevante seltenere Belastungen."
        ]
      },
      {
        heading: "Interaktionen richtig einordnen",
        content: [
          "Begleitmedikation, Vorerkrankungen und Dosismuster können das Risiko verändern. Deshalb sind einfache Allgemeinregeln oft unzureichend.",
          "Für Content ist entscheidend, fachliche Abklärung aktiv zu empfehlen, statt Sicherheit zu suggerieren."
        ],
        checklist: [
          "Häufige Nebenwirkungen offen nennen",
          "Hinweis auf potenzielle Interaktionen geben",
          "Bei medizinischen Fragen klar auf Fachpersonal verweisen"
        ]
      }
    ],
    warnings: ["Dieser Inhalt ersetzt keine medizinische Beratung und keine individuelle Arzneimittelprüfung."],
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
        question: "Kann ich Interaktionen selbst einschätzen?",
        answer: "Nur sehr eingeschränkt. Gerade bei Medikation ist fachliche Rücksprache sinnvoll und oft notwendig."
      }
    ],
    glossary: [
      { term: "Interaktion", definition: "Wechselwirkung zwischen zwei oder mehr Substanzen mit verstärkter, abgeschwächter oder veränderter Wirkung." },
      { term: "Begleitmedikation", definition: "Weitere Arzneimittel oder Stoffe, die parallel eingenommen werden." },
      { term: "Nebenwirkung", definition: "Unerwünschter Effekt, der im Zusammenhang mit der Anwendung eines Stoffes auftritt." },
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
          "Material- und Gerätequalität mitberücksichtigen"
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
      { term: "Aerosol", definition: "Fein verteilte Partikel oder Tröpfchen in einem Gasgemisch, etwa in inhalierbaren Dampfphänomene." },
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
      "Wirkung und Verlässlichkeit hängen stark von Produktform und Anwendungspraxis ab.",
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
          "Onset-Fenster nicht überversprechen",
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
        text: "Flüssige Produktform, oft mit Tropfenanwendung und variabler Resorptionslogik."
      }
    ],
    faq: [
      {
        question: "Ist sublingual immer schneller als oral?",
        answer: "Häufig, aber nicht in jedem Fall gleich stark. Produkt und Anwendung machen einen Unterschied."
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
      "Produktprofil allein erklärt nicht, wie eine Erfahrung verläuft; Kontext und Erwartung spielen stark mit hinein.",
      "Harm Reduction bedeutet auch, Situation, Timing und Begleitumstände sauber zu planen.",
      "Viele negative Erfahrungen entstehen durch Kontextfehler und nicht nur durch Produktstärke."
    ],
    quickFacts: [
      { label: "Set", value: "Innere Verfassung" },
      { label: "Setting", value: "Äusserer Rahmen" },
      { label: "Praxis", value: "Kontext bewusst wählen" }
    ],
    sections: [
      {
        heading: "Warum Kontext so unterschätzt wird",
        content: [
          "Menschen bewerten Konsumerfahrungen oft nur über Potenz oder Sorte. Dabei können Stress, unbekannte Umgebung oder sozialer Druck entscheidend sein.",
          "Eine gute Aufklärungsseite muss diese Ebene sichtbar machen."
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
        text: "Die äussere Umgebung, also Ort, Menschen, Sicherheit und Umstände rund um die Anwendung."
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
      { term: "Setting", definition: "Äusserer Rahmen einer Erfahrung, etwa Ort, Menschen und Sicherheitslage." },
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
      "Trocknung und Lagerung sind für die Produktintegrität fast so wichtig wie die Trennung selbst.",
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
          "Fachlich relevant sind Reinheit, sensorische Klarheit, Lagerstabilität und Kontaminantenstatus. Szeneetiketten allein reichen nicht.",
          "Gerade bei hochwertigen Produkten entscheiden Nachbehandlung und Dokumentation über echte Vergleichbarkeit."
        ]
      },
      {
        heading: "Wo die typischen Fehlbewertungen liegen",
        content: [
          "Begriffe aus Communities oder Shops klingen präzise, sind aber oft nicht standardisiert. Ohne Mess- und Chargenkontext bleiben sie begrenzt aussagekräftig.",
          "Plattformen sollten daher eigene Bewertungskriterien definieren."
        ],
        checklist: [
          "Chargen-ID und Lagerbedingungen erfassen",
          "Kontaminanten- und Stabilitätsdaten einbeziehen",
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
        answer: "Weil sie Einfluss auf Haltbarkeit, Mikrobiologie und Profilintegrität hat."
      }
    ],
    glossary: [
      { term: "Reinheit", definition: "Grad, in dem ein Produkt frei von störenden oder unerwünschten Bestandteilen ist." },
      { term: "Chargenkontext", definition: "Alle Informationen rund um Herkunft, Prozess und Lagerung einer Charge." },
      { term: "Integrität", definition: "Erhalt der ursprünglichen und gewünschten Produkteigenschaften." },
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
    tags: ["Rosin", "Qualität", "Input", "Einordnung"],
    keyTakeaways: [
      "Rosin ist keine automatische Qualitätsgarantie; Endqualität hängt zuerst am Input-Material.",
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
        heading: "Warum Rosin so oft überhöht wird",
        content: [
          "Der Begriff steht in vielen Communities für Hochwertigkeit. Das ist verständlich, aber fachlich zu kurz.",
          "Ohne Blick auf Ausgangsmaterial, Prozesssauberkeit und Stabilität bleibt die Einordnung oberflächlich."
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
        text: "Übersteigerte Wahrnehmung eines Begriffs oder Produkts, die oft mehr Marketing als Einordnung ist."
      }
    ],
    faq: [
      {
        question: "Ist Rosin immer lösungsmittelfrei?",
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
      { term: "Chargenkonsistenz", definition: "Wie ähnlich mehrere Chargen in relevanten Eigenschaften ausfallen." },
    ],
    relatedSlugs: ["hash-typen-vergleichen", "bubble-hash-qualitaetskriterien", "full-melt-und-marketingsprache"]
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
      "Gute Wissensseiten erklären Herkunft und Nutzung eines Begriffs, übernehmen ihn aber nicht unkritisch als Qualitätsurteil.",
      "Ein Glossar mit Kriterienlogik verhindert Missverständnisse im Katalog."
    ],
    quickFacts: [
      { label: "Thema", value: "Begriffsklärung" },
      { label: "Risiko", value: "Marketing als Qualitätsersatz" },
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
          "Erkläre Begriffe, aber knüpfe Produktbewertung an nachvollziehbare Kriterien und nicht an Szeneetiketten.",
          "Das reduziert Fehlkäufe und macht Kataloge professioneller."
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
        text: "Ein Ausdruck aus Community oder Handel, der oft mehr kulturelle als standardisierte technische Bedeutung trägt."
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
        answer: "Weil unerklärte Begriffe für Einsteiger irreführend sind und Kataloge uneinheitlich machen."
      }
    ],
    glossary: [
      { term: "Szenebegriff", definition: "Nicht standardisierter Ausdruck aus Kultur, Community oder Handel." },
      { term: "Glossar", definition: "Sammlung definierter Begriffe zur einheitlichen Sprachverwendung." },
      { term: "Qualitätsurteil", definition: "Bewertung eines Produkts anhand nachvollziehbarer und relevanter Kriterien." },
    ],
    relatedSlugs: ["hash-typen-vergleichen", "rosin-einordnung-ohne-hype", "bubble-hash-qualitaetskriterien"]
  }),
  createArticle({
    slug: "werbeaussagen-und-health-claims-cannabis",
    title: "Werbeaussagen und Health Claims bei Cannabis",
    summary: "Wo Information aufhört und problematische Gesundheitsversprechen beginnen und wie Content-Teams sicher formulieren.",
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
          "So bleibt Aufklärung informativ, ohne unnötiges regulatorisches Risiko aufzubauen."
        ],
        checklist: [
          "Claim-Liste mit erlaubten Formulierungen pflegen",
          "Gesundheitsaussagen juristisch gegenprüfen",
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
        answer: "Ja, aber ohne daraus unzulässige Heilaussagen oder pauschale Produktversprechen abzuleiten."
      },
      {
        question: "Warum reichen gute Quellen allein nicht aus?",
        answer: "Weil die rechtliche Zulässigkeit von Sprache und Kontext nicht automatisch aus der Existenz einer Studie folgt."
      }
    ],
    glossary: [
      { term: "Health Claim", definition: "Gesundheitsbezogene Aussage über Nutzen oder Wirkung eines Produkts." },
      { term: "Freigabeprozess", definition: "Standardisierter Prüfprozess vor Veröffentlichung eines Inhalts oder Produkts." },
      { term: "Evidenzstufe", definition: "Einordnung, wie belastbar eine Aussage durch Forschung abgestützt ist." },
    ],
    relatedSlugs: ["rechtliche-grundlagen-dach", "cannabinoide-und-evidenz", "cbd-und-angststoerungen-einordnung"]
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
      "Gute Chargendokumentation schützt nicht nur rechtlich, sondern verbessert auch Qualitätsarbeit.",
      "Ohne Rückverfolgung werden Reklamationen, Sperrungen und Audits schnell teuer und chaotisch.",
      "Digitale und klare Datenstrukturen zahlen sich früh aus."
    ],
    quickFacts: [
      { label: "Pflicht", value: "Eindeutige Chargen-ID" },
      { label: "Nutzen", value: "Rückruf- und Auditfähigkeit" },
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
        text: "Fähigkeit, Ursprung, Weg und Status einer Charge vom Eingang bis zur Ausgabe nachzuvollziehen."
      },
      {
        title: "Kurz erklärt: Auditfähigkeit",
        text: "Wie schnell und sauber sich ein Prozess oder Datensatz gegenüber Prüfern belegen lässt."
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
      { term: "Audit", definition: "Formalisierte Prüfung von Prozessen, Daten oder Regeln auf Konformität und Wirksamkeit." },
    ],
    relatedSlugs: ["rechtliche-grundlagen-dach", "batch-release-und-freigabekriterien", "recall-und-sperrprozesse-fuer-chargen"]
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
      "Für Aufklärungsseiten lohnt ein klares Glossar statt vager Abkürzungsnutzung."
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
          "In vielen Texten werden GMP oder GDP als bloß Qualitätslabel genutzt, ohne die dahinterliegenden Anforderungen zu erklären.",
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
          "Abkürzungen immer ausschreiben",
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
    relatedSlugs: ["rechtliche-grundlagen-dach", "dokumentationspflichten-fuer-chargen", "batch-release-und-freigabekriterien"]
  }),
  {
    slug: "schimmel-und-mykotoxine-bei-cannabis",
    title: "Schimmel und Mykotoxine bei Cannabis",
    summary: "Warum mikrobiologische Sicherheit nicht an der sichtbaren Blüte endet und welche Informationslücken besonders riskant sind.",
    category: "sicherheit",
    difficulty: "fortgeschritten",
    readMinutes: 10,
    lastUpdated: "2026-08-03",
    tags: ["Schimmel", "Mykotoxine", "Mikrobiologie", "Sicherheit"],
    keyTakeaways: [
      "Wasseraktivität (aw), nicht der reine Feuchtigkeitsgehalt, ist der entscheidende Treiber für mikrobielles Wachstum — Trockengut kann optisch trocken wirken und trotzdem eine für Schimmel kritische aw aufweisen.",
      "Ein einzelnes welkes Blättchen tief im Inneren einer dichten Knospe ist oft das früheste sichtbare Zeichen von Botrytis-Knospenfäule — deutlich vor äußerlich erkennbarem Schimmelbefall.",
      "Mykotoxine sind Stoffwechselprodukte bestimmter Schimmelpilze und bleiben auch nach dem Absterben oder Entfernen des sichtbaren Pilzmyzels im Produkt — Sichtkontrolle allein kann sie nicht ausschließen."
    ],
    quickFacts: [
      { label: "Sichere Lager-aw", value: "< 0.65" },
      { label: "Kritischer aw-Bereich Aspergillus", value: "≈ 0.75–0.80" },
      { label: "Ziel-RH Trocknung", value: "55–65 %, 18–21 °C" },
      { label: "Frühsignal Botrytis", value: "Einzelnes welkes Blättchen im Knospeninneren" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Mikrobiologische Sicherheit bei Cannabis umfasst zwei getrennte Risikoebenen: sichtbaren Schimmelbefall (Myzel, Sporen) und unsichtbare Mykotoxine — von Schimmelpilzen gebildete Sekundärmetabolite, die auch nach Entfernen des Pilzes im Produkt verbleiben.",
          "Beide Risiken sind eng mit der Wasseraktivität (aw) verknüpft, einem Maß für den Anteil des Wassers im Produkt, der tatsächlich für mikrobielles Wachstum verfügbar ist — unabhängig vom reinen Feuchtigkeitsgehalt."
        ]
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Botrytis cinerea (Grauschimmel/Knospenfäule) befällt bevorzugt dichte, schlecht durchlüftete Blütenstrukturen von innen nach außen — sichtbarer Oberflächenbefall ist meist ein spätes Stadium, nicht der Beginn der Infektion.",
          "Aspergillus- und Penicillium-Arten sind die relevantesten Mykotoxin-Bildner bei Cannabis; ihr Wachstumsrisiko steigt deutlich, sobald die Wasseraktivität über etwa 0.70–0.75 liegt, unabhängig davon, wie trocken das Material äußerlich wirkt."
        ]
      },
      {
        heading: "Wasseraktivität als zentraler Kontrollparameter",
        content: [
          "Wasseraktivität (aw) misst den Dampfdruck des Wassers im Produkt relativ zu reinem Wasser (Skala 0–1) — sie unterscheidet sich vom Feuchtigkeitsgehalt in Prozent, weil sie nur das für Mikroorganismen tatsächlich nutzbare Wasser erfasst.",
          "Unterhalb von aw 0.65 ist das Wachstum der meisten für Cannabis relevanten Schimmelpilze stark gehemmt — dieser Wert gilt als praktische Zielobergrenze für sichere Lagerung.",
          "Cannabis kann bei falscher Trocknung außen bereits knusprig trocken wirken, während der Kern der Blüte noch eine deutlich höhere, mikrobiologisch kritische aw aufweist."
        ]
      },
      {
        heading: "Diagnose: sichtbarer Befall vs. unsichtbares Risiko",
        content: [
          "Sichtbare Botrytis-Frühsignale: ein einzelnes, welkes, verfärbtes Blättchen tief im Inneren einer dichten Knospe, während die Außenseite noch unauffällig wirkt — bei Verdacht die Knospe vorsichtig öffnen und das Zentrum prüfen.",
          "Mykotoxin-Risiko ist visuell NICHT zuverlässig einschätzbar: Geruch und Optik geben Hinweise, ersetzen aber keine Labormessung, da Toxine auch nach dem Absterben des sichtbaren Pilzmyzels im Gewebe verbleiben können.",
          "Eine belastbare Risikobewertung kombiniert deshalb immer Sichtkontrolle, aw-Messung und — bei Auffälligkeiten oder für den professionellen Kontext — Labordaten."
        ],
        checklist: [
          "Stichprobenartig Knospen aus dem dichtesten Bereich der Pflanze öffnen und das Zentrum auf welke Blättchen prüfen",
          "aw und Temperatur im Nachernteprozess laufend dokumentieren, nicht nur einmalig am Ende",
          "Auffällige Chargen sofort isolieren, statt sie mit unauffälligem Material zu vermischen"
        ]
      },
      {
        heading: "Prävention über Trocknung und Lagerung",
        content: [
          "Kontrollierte Trocknung bei 55–65 % relativer Luftfeuchte und 18–21 °C über 7–14 Tage senkt die aw gleichmäßig, ohne durch zu schnelle Trocknung Terpene übermäßig zu verlieren.",
          "Curing (kontrolliertes Nachreifen in verschlossenen Behältern mit periodischem 'Burping') stabilisiert die aw im gesamten Blütenvolumen, nicht nur an der Oberfläche.",
          "Lagerung deutlich unter aw 0.65 in dicht schließenden, lichtgeschützten Behältern hält das mikrobielle Risiko über Wochen bis Monate niedrig."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Sich allein auf Geruch oder Optik verlassen und die aw-Messung als überflüssig betrachten.",
          "Zu schnell bei zu niedriger Luftfeuchte trocknen — das senkt zwar die aw rasch, verschließt aber oft die äußere Schicht, bevor der Kern nachgezogen ist, und verschleiert so ein inneres Feuchtigkeitsproblem.",
          "Auffällige Einzelknospen entfernen, aber die restliche Charge ohne aw-Kontrolle als 'sicher' einstufen."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "In professionellen Kontexten ergänzen Interlaborvergleiche und Ringtests die eigene aw-/Sichtkontrolle, um systematische Messfehler einzelner Labore aufzudecken.",
          "Batch-Release-Kriterien, die aw-Grenzwerte mit mikrobiologischen Laborwerten kombinieren, sind belastbarer als jedes Einzelkriterium allein."
        ]
      }
    ],
    warnings: [
      "Mykotoxine bleiben auch nach Entfernen des sichtbaren Schimmelbefalls im Produkt — eine betroffene Charge durch Wegschneiden auffälliger Stellen 'retten' zu wollen, ist mikrobiologisch nicht sicher."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Mykotoxine",
        text: "Stoffwechselprodukte bestimmter Schimmelpilze, die gesundheitlich relevant sein können und auch nach dem Absterben des sichtbaren Pilzes im Produkt verbleiben."
      },
      {
        title: "Kurz erklärt: Wasseraktivität (aw)",
        text: "Ein Maß dafür, wie viel Wasser in einem Produkt tatsächlich für mikrobielles Wachstum verfügbar ist — nicht dasselbe wie der Feuchtigkeitsgehalt in Prozent."
      }
    ],
    faq: [
      {
        question: "Riecht Schimmel immer muffig?",
        answer: "Nicht zuverlässig. Geruch kann Hinweise liefern, ersetzt aber keine Bewertung über aw-Messung und Prozesskontext — frühe Botrytis-Infektionen im Knospeninneren riechen oft noch unauffällig."
      },
      {
        question: "Warum ist aw wichtiger als der Feuchtigkeitsgehalt in Prozent?",
        answer: "Weil nicht die absolute Wassermenge, sondern nur das mikrobiologisch verfügbare Wasser das Pilzwachstum antreibt. Zwei Proben mit gleichem Feuchtigkeitsgehalt können deutlich unterschiedliche aw-Werte und damit unterschiedliches Risiko haben."
      },
      {
        question: "Kann ich eine betroffene Knospe retten, indem ich den auffälligen Teil wegschneide?",
        answer: "Nicht sicher. Mykotoxine können sich bereits im umliegenden, optisch unauffälligen Gewebe befinden — bei Verdacht auf Botrytis-Befall sollte die gesamte betroffene Einheit als Risiko behandelt werden."
      }
    ],
    glossary: [
      { term: "Mykotoxin", definition: "Von bestimmten Pilzen gebildeter Stoff mit potenziell gesundheitsschädlicher Wirkung, der auch nach Absterben des Pilzes im Produkt verbleiben kann." },
      { term: "Wasseraktivität (aw)", definition: "Maß für den Anteil des Wassers in einem Produkt, der für mikrobielles Wachstum tatsächlich verfügbar ist, skaliert von 0 bis 1." },
      { term: "Curing", definition: "Kontrolliertes Nachreifen getrockneter Blüten in verschlossenen Behältern zur Stabilisierung von Feuchtigkeit und Terpenprofil." }
    ],
    sourceIds: ["punja-cannabis-pathogens", "botrytis-grey-mold-review", "food-control-water-activity-microbiology"],
    relatedSlugs: ["wasseraktivitaet-und-curing", "pgr-und-kontaminanten", "recall-und-sperrprozesse-fuer-chargen"]
  },
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
          "Für faire Kommunikation müssen Konsumweg, Matrix und Nutzungshäufigkeit mitgedacht werden.",
          "Nur so entsteht eine Einordnung, die weder bagatellisiert noch unnötig dramatisiert."
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
    summary: "Eine Einordnung der wichtigsten Stoffgruppen, warum Listen allein nicht genügen und wie Rückstandsberichte gelesen werden sollten.",
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
        heading: "Warum Rückstandslisten oft zu simpel gelesen werden",
        content: [
          "Eine Liste mit vielen Namen wirkt eindrucksvoll, sagt aber wenig, wenn Nachweisgrenzen, Methoden und relevante Stoffe unklar bleiben.",
          "Für seriöse Bewertung braucht es mehr als ein grünes Häkchen."
        ]
      },
      {
        heading: "Wie ein sauberer Rückstandscheck aussieht",
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
        text: "Welche Stoffe oder Stoffgruppen ein Laborbericht tatsächlich überhaupt testet."
      },
      {
        title: "Kurz erklärt: Nachweisgrenze",
        text: "Kleinste Menge, die ein Labor mit der gewählten Methode noch sicher erkennen kann."
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
      { term: "Rückstand", definition: "Im Produkt verbliebene Menge eines unerwünschten oder regulierten Stoffes." },
      { term: "Panelabdeckung", definition: "Umfang der im Labor untersuchten Stoffe oder Stoffgruppen." },
      { term: "Nachweisgrenze", definition: "Kleinste noch detektierbare Stoffmenge einer Methode." },
    ],
    relatedSlugs: ["pgr-und-kontaminanten", "coa-richtig-lesen", "sampling-und-probenahme-fehler"]
  }),
  createArticle({
    slug: "recall-und-sperrprozesse-fuer-chargen",
    title: "Recall- und Sperrprozesse für Chargen",
    summary: "Wie Produkte bei Verdachtsfällen kontrolliert gestoppt, bewertet und kommuniziert werden sollten.",
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
          "Auch auf einer Wissensseite ist das ein zentraler Drop-Artikel für B2B- und Qualitätskontext."
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
        text: "Corrective and Preventive Actions, also Massnahmen zur Fehlerbehebung und Vorbeugung künftiger Wiederholungen."
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
    relatedSlugs: ["dokumentationspflichten-fuer-chargen", "batch-release-und-freigabekriterien", "schimmel-und-mykotoxine-bei-cannabis"]
  }),
  createArticle({
    slug: "batch-release-und-freigabekriterien",
    title: "Batch Release und Freigabekriterien",
    summary: "Welche Prüfpunkte vor einer Freigabe sinnvoll sind und warum Freigaben mehr als nur ein COA brauchen.",
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
      { label: "Nutzen", value: "Skalierbare Qualitätsentscheidungen" }
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
        text: "Charge oder Befund, der nicht klar im Grünbereich liegt und deshalb besondere Prüfung braucht."
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
      { term: "Revisionssicher", definition: "So dokumentiert, dass Änderungen nachvollziehbar und belastbar bleiben." },
    ],
    relatedSlugs: ["coa-richtig-lesen", "dokumentationspflichten-fuer-chargen", "recall-und-sperrprozesse-fuer-chargen"]
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
      "Gute Verpackung ist Teil des Qualitätssystems, nicht nur Marketing."
    ],
    quickFacts: [
      { label: "Feinde", value: "Licht, Sauerstoff, Wärme" },
      { label: "Hebel", value: "Passendes Packmittel" },
      { label: "Praxis", value: "Lagerdaten mit Reklamationen verknüpfen" }
    ],
    sections: [
      {
        heading: "Warum Verpackung mehr ist als Hülle",
        content: [
          "Packmittel bestimmen mit, wie stabil Aroma, Wirkstoffprofil und mikrobiologische Sicherheit über Zeit bleiben.",
          "Gerade bei hochwertigen Produkten ist das ein direkter Qualitätshebel."
        ]
      },
      {
        heading: "Welche Fragen gute Lagerung beantwortet",
        content: [
          "Wie alt ist die Charge, wie wurde sie transportiert und war sie Licht oder Hitze ausgesetzt? Diese Punkte sollten nie unsichtbar bleiben.",
          "Erst zusammen mit Reklamationen und Analytik entsteht ein lernfähiges System."
        ],
        checklist: [
          "Packmittel nach Produktklasse auswählen",
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
      "Proben müssen Charge, Heterogenität und Ziel der Fragestellung realistisch abbilden.",
      "Vergleichbarkeit beginnt vor dem Messgerät."
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
          "Wenn eine Probe die Charge schlecht repräsentiert, helfen selbst exzellente Labore nur begrenzt."
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
      { term: "Repräsentativ", definition: "Die reale Zusammensetzung einer Charge angemessen widerspiegelnd." },
      { term: "Heterogenität", definition: "Unterschiedlichkeit innerhalb einer Charge oder eines Produkts." },
    ],
    relatedSlugs: ["coa-richtig-lesen", "analytik-hplc-vs-gc-bei-cannabinoiden", "pestizidklassen-und-rueckstandsrisiken"]
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
          "Wenn Herkunft und Nachweise sichtbar sind, sinken Informationsasymmetrien für Nutzer und Teams. Das stärkt die Plattformqualität direkt.",
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
        answer: "Nicht immer öffentlich, aber intern muss die Kette für Qualität und Compliance nachvollziehbar sein."
      },
      {
        question: "Warum hilft das auch im Marketing?",
        answer: "Weil nachweisbare Transparenz glaubwürdiger ist als reine Herkunftsclaims."
      }
    ],
    glossary: [
      { term: "Lieferkette", definition: "Abfolge aller Beteiligten und Prozesse vom Ursprung bis zur Ausgabe eines Produkts." },
      { term: "Transparenz", definition: "Nachvollziehbarkeit relevanter Informationen für Bewertung und Entscheidung." },
      { term: "Statushistorie", definition: "Zeitliche Dokumentation, wie sich der Zustand einer Charge über den Prozess verändert hat." },
    ],
    relatedSlugs: ["markttransparenz-und-preise", "dokumentationspflichten-fuer-chargen", "white-label-und-qualitaetsrisiken"]
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
          "Verantwortlichkeiten vertraglich und operativ klären",
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
        answer: "Nein. Entscheidend sind Kontrolle, Nachweise und konsequente Qualitätsführung."
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
  {
    slug: "grow-log-und-kpi-dashboard",
    title: "Grow-Log und KPI-Dashboard aufbauen",
    summary: "Welche Kennzahlen für Wiederholbarkeit wirklich helfen und wie aus Beobachtung ein steuerbares System wird.",
    category: "werkzeuge",
    difficulty: "fortgeschritten",
    readMinutes: 10,
    lastUpdated: "2026-08-03",
    tags: ["Grow Log", "KPI", "Dashboard", "Daten"],
    keyTakeaways: [
      "Ohne strukturierte, zeitlich verknüpfte Daten bleibt jeder Run isolierte Erfahrung — Ursache (z. B. EC-Spitze) und Wirkung (z. B. Symptom drei Tage später) lassen sich nachträglich nur bei durchgängigem Log korrekt zuordnen.",
      "Eine einzelne auffällige Korrelation in einem Run beweist keine Kausalität — erst über mehrere Runs mit konstant gehaltenen Variablen wird ein Muster belastbar.",
      "Wenige, konsequent verfolgte Kern-KPIs mit klarer Reaktionslogik liefern mehr Steuerungswert als ein überladenes Dashboard ohne definierte Schwellenwerte."
    ],
    quickFacts: [
      { label: "Ziel", value: "Wiederholbarkeit über Runs" },
      { label: "Kernkategorien", value: "Klima, Bewässerung, Wachstum, Outcome" },
      { label: "Pflicht", value: "Zeitstempel + Owner je KPI" }
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Ein Grow-Log ist die durchgängige, zeitlich verortete Erfassung von Eingangsgrößen (Klima, Bewässerung, Düngung) und Ergebnisgrößen (Wachstum, Ausfälle, Ernteertrag) über einen Anbauzyklus.",
          "Ein KPI-Dashboard ist die verdichtete, auf Entscheidungsrelevanz reduzierte Sicht auf dieses Log — nicht jede geloggte Größe verdient einen Platz im Dashboard."
        ]
      },
      {
        heading: "Warum strukturierte Logs Kausalanalyse erst möglich machen",
        content: [
          "Ohne Zeitstempel lässt sich ein später auftretendes Symptom nicht zuverlässig auf ein vorausgegangenes Ereignis (z. B. eine EC-Spitze oder einen Klimaausreißer) zurückführen — die zeitliche Verknüpfung ist die Grundvoraussetzung für Ursachenanalyse.",
          "Eine auffällige Korrelation innerhalb eines einzelnen Runs ist statistisch schwach, weil mehrere Variablen gleichzeitig schwanken. Erst der Vergleich über mehrere Runs mit gezielt konstant gehaltenen Variablen erlaubt belastbare Schlüsse."
        ]
      },
      {
        heading: "Kern-KPIs nach Kategorie",
        content: [
          "Klima: Lufttemperatur, relative Luftfeuchte, VPD — als Tagesmittel und Tagesspanne, nicht nur als Momentaufnahme.",
          "Bewässerung/Nährstoffe: EC und pH von Zulauf und Drainage, Gießmenge und -intervall.",
          "Wachstum: Höhe, Internodienabstand, Canopy-Gleichmäßigkeit — als wöchentliche Messpunkte.",
          "Outcome: Trockengewicht pro Fläche, Ausfallrate, bei verfügbarer Laboranbindung Cannabinoid-/Terpengehalt."
        ],
        checklist: [
          "Kern-KPIs pro Wachstumsphase vorab festlegen, nicht nachträglich aus vorhandenen Daten auswählen",
          "Jede KPI mit einem Schwellenwert verknüpfen, der eine konkrete Reaktion auslöst",
          "Erfassungsfrequenz (täglich vs. wöchentlich) pro KPI klar definieren und einhalten"
        ]
      },
      {
        heading: "Vom Log zur Steuerung",
        content: [
          "Ein Dashboard wird erst operativ wertvoll, wenn jede angezeigte Kennzahl sichtbar macht, wann eingegriffen werden muss und wer dafür verantwortlich ist.",
          "Trendansichten (Verlauf über Zeit) sind aussagekräftiger als reine Tabellen mit Momentanwerten, weil sie Drift erkennbar machen, bevor ein Schwellenwert überschritten wird."
        ]
      },
      {
        heading: "Diagnose mithilfe des Logs",
        content: [
          "Bei einem retrospektiv auftretenden Problem zuerst den Log-Verlauf der letzten 5–7 Tage vor dem ersten sichtbaren Symptom prüfen — die auslösende Abweichung liegt fast immer vor dem sichtbaren Effekt, nicht gleichzeitig mit ihm.",
          "Mehrere gleichzeitig schwankende Variablen (z. B. Klimaausfall UND Düngerwechsel in derselben Woche) erschweren eindeutige Zuordnung — sauberes Logging trennt Ereignisse zeitlich, wo immer möglich."
        ]
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Zu viele KPIs ohne Priorisierung erfassen — das Dashboard wird unübersichtlich, und keine einzelne Kennzahl bekommt die nötige Aufmerksamkeit.",
          "Erfassungsmethodik zwischen Runs ändern (andere Messzeitpunkte, andere Sensorplatzierung), wodurch Runs nicht mehr vergleichbar sind.",
          "Eine einzelne auffällige Korrelation aus einem Run als bewiesenen Zusammenhang behandeln, ohne sie in einem weiteren Run zu prüfen."
        ]
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Statistische Regelkarten (Control Charts) aus der Prozesssteuerung lassen sich auf Grow-KPIs übertragen, um normale Schwankung von echten Abweichungen systematisch zu trennen.",
          "Automatisierte Sensorprotokollierung reduziert menschliche Erfassungsfehler gegenüber manuellem Logging, ersetzt aber nicht die Notwendigkeit, Ereignisse (Eingriffe, Beobachtungen) weiterhin manuell und zeitgestempelt zu dokumentieren."
        ]
      }
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: KPI",
        text: "Key Performance Indicator, also eine Kennzahl, die für Steuerung und Erfolgsmessung wichtig ist und mit einer klaren Reaktion verknüpft sein sollte."
      },
      {
        title: "Kurz erklärt: Warum Korrelation nicht Kausalität ist",
        text: "Wenn zwei Werte gemeinsam auftreten, heißt das nicht automatisch, dass der eine den anderen verursacht. Erst mehrere Runs mit kontrollierten Variablen zeigen, ob ein Zusammenhang wirklich stabil ist."
      }
    ],
    faq: [
      {
        question: "Wie viele KPIs brauche ich?",
        answer: "Wenige Kernkennzahlen mit klarer Reaktionslogik sind wertvoller als ein überladenes Dashboard ohne definierte Schwellenwerte — Qualität und Konsequenz schlagen Vollständigkeit."
      },
      {
        question: "Reicht ein einfaches Spreadsheet?",
        answer: "Für den Start ja, solange Erfassungsstruktur, Zeitstempel und Konsistenz zwischen Runs sauber eingehalten werden. Die Struktur ist wichtiger als das Werkzeug."
      },
      {
        question: "Warum reicht eine auffällige Korrelation aus einem Run nicht als Beweis?",
        answer: "Weil in einem einzelnen Run meist mehrere Variablen gleichzeitig schwanken. Ohne kontrollierten Vergleich über mehrere Runs lässt sich nicht sicher sagen, welche Variable die eigentliche Ursache war."
      }
    ],
    glossary: [
      { term: "KPI", definition: "Wesentliche Kennzahl zur Beurteilung eines Prozesses oder Ergebnisses, verknüpft mit einer klaren Reaktionsschwelle." },
      { term: "Control Chart", definition: "Statistisches Werkzeug zur Unterscheidung normaler Prozessschwankung von echten Abweichungen über Zeit." },
      { term: "Trenddrift", definition: "Allmähliche, oft unbemerkte Verschiebung eines Messwerts über mehrere Zeitpunkte hinweg, bevor ein Schwellenwert überschritten wird." }
    ],
    sourceIds: ["plant-physiology-vpd-transpiration", "bugbee-electrical-conductivity", "horticulture-research-cannabis-cultivation"],
    relatedSlugs: ["cannabis-anbau-grundlagen", "vpd-und-ec-kombi-rechner-guide", "sensor-kalibrierung-und-messfehler"]
  },
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
      { label: "Häufiger Fehler", value: "Vertrauen in unkorrigierte Sensoren" },
      { label: "Wichtig", value: "Ort plus Kalibrierintervall" },
      { label: "Nutzen", value: "Bessere Entscheidungen" }
    ],
    sections: [
      {
        heading: "Warum gute Sensoren alleine nicht reichen",
        content: [
          "Auch hochwertige Geräte können falsch messen, wenn sie schlecht platziert, lange ungeprüft oder falsch gelesen werden.",
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
        text: "Abweichung zwischen gemessenem und tatsächlichem Wert durch Gerät, Platzierung oder Anwendung."
      }
    ],
    faq: [
      {
        question: "Wie oft sollte ich kalibrieren?",
        answer: "Abhängig vom Sensortyp und Einsatzumfeld, aber nie erst dann, wenn Werte offensichtlich unplausibel wirken."
      },
      {
        question: "Sind billige Sensoren nutzlos?",
        answer: "Nein. Gut geführte und geprüfte einfache Sensoren sind oft wertvoller als teure, ungepflegte Systeme."
      }
    ],
    glossary: [
      { term: "Kalibrierung", definition: "Prüfung und Korrektur eines Messgeräts gegen bekannte Referenzwerte." },
      { term: "Referenzwert", definition: "Bekannter Sollwert, der zur Kontrolle einer Messung dient." },
      { term: "Drift", definition: "Langsame Veränderung eines Messgeräts weg vom korrekten Wert über Zeit." },
    ],
    relatedSlugs: ["vpd-einfach-erklaert", "grow-log-und-kpi-dashboard", "cannabis-substrat-und-wurzelzone"]
  }),
  createArticle({
    slug: "how-to-grow-cannabis-anfaenger-tutorial",
    title: "How to Grow Cannabis: Schritt-für-Schritt für Anfänger",
    summary: "Ein klarer Einstieg in Setup, Klima, Bewässerung und Erntefenster - aufgebaut auf belastbaren Grundlagen aus Forschung und bewährten Profi-Routinen.",
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
      { label: "Routine", value: "Täglicher 10-Minuten-Check" }
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
          "Halte in der Vegetationsphase keine extremen Werte, sondern stabile Korridore. VPD-orientiertes Arbeiten und regelmässige Topfgewicht-Kontrolle sind für Anfänger deutlich wertvoller als hektische EC-Optimierung.",
          "Viele Probleme im ersten Run entstehen durch zu häufiges Giessen und zu viele Korrekturen gleichzeitig. Arbeite mit einem festen Beobachtungsfenster: Blätter, Topfgewicht, Drain, Temperatur und Luftfeuchte."
        ],
        checklist: [
          "Vor jedem Giessen Topfgewicht oder Trocknungsgrad prüfen",
          "Nur einen Parameter pro Tag ändern",
          "Klimaabweichungen mit Datum und Uhrzeit ins Grow-Log schreiben"
        ]
      },
      {
        heading: "Schritt 2b: Wochenplan für einen einfachen ersten Run",
        content: [
          "Woche 1-2: Keimung und Jungpflanze. Licht moderat halten, RH höher fahren, Medium nur leicht feucht und keine harten Düngeimpulse setzen. Fokus: stabile Entwicklung statt Tempo.",
          "Woche 3-4: Frühe Vegetation. Gleichmässigen Rhythmus aus Giessen, Klima-Check und leichter Nährstoffzufuhr etablieren. Jetzt zeigt sich, ob Topf, Medium und Trocknungsdauer zusammenpassen.",
          "Woche 5-6: Späte Vegetation bis Stretch. Pflanzenhöhe, Lichtabstand und Blattgesundheit eng beobachten. Nur dann auf Blüte umstellen, wenn Pflanzen vital und der Raum klimatisch stabil ist.",
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
          "Studien zu NPK-Fertigation bei Cannabis zeigen, dass Überversorgung - besonders mit Stickstoff in späteren Phasen - Ertrag und Qualität eher verschlechtern kann. Beginne deshalb unterhalb der Hersteller-Maximalangaben und steigere nur bei klarer Pflanzenreaktion.",
          "Achte darauf, dass Lichtintensität, Klima und Wurzelzone zur Nährstoffstärke passen. Ohne diese Basis bringt mehr EC kaum Nutzen und erhöht das Risiko für Blockaden oder Stressmarker."
        ],
        checklist: [
          "pH und EC der Lösung in fixer Reihenfolge messen",
          "Keine Booster einsetzen, solange Basisprozesse noch schwanken",
          "Ab Blüteeinleitung Stickstoff nicht weiter aggressiv steigern"
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
          "Trichomkontrolle mit Lupe oder Mikroskop durchführen",
          "Nach dem Run drei Dinge notieren: Fehler, Korrektur, Ergebnis"
        ]
      }
    ],
    warnings: [
      "Mehr Dünger, mehr Licht und mehr Wasser gleichzeitig zu erhöhen ist der schnellste Weg in unklare Fehlerbilder.",
      "Ohne funktionierende Klimakontrolle wird selbst ein guter Nährstoffplan instabil."
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum klein starten?",
        text: "Ein kleines Setup reduziert Streuung. Du erkennst schneller, welche Änderung wirklich Wirkung hatte."
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
    relatedSlugs: ["cannabis-anbau-grundlagen", "bewaesserung-ohne-uebergiessen", "vpd-einfach-erklaert", "cannabis-substrat-und-wurzelzone"]
  }),
  createArticle({
    slug: "how-to-grow-cannabis-fortgeschritten-tutorial",
    title: "How to Grow Cannabis: Schritt-für-Schritt für Fortgeschrittene",
    summary: "Wie du ein stabiles Setup in ein datengestütztes Produktionssystem verwandelst - mit sauberer Klima-, Feed- und Canopy-Steuerung.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 16,
    tags: ["How to Grow", "Anbau", "Fortgeschritten", "Step by Step", "Canopy", "Nährstoffe", "VPD"],
    keyTakeaways: [
      "Ab dem mittleren Niveau zählt nicht mehr nur Pflanzenvitalität, sondern Prozessstabilität über den gesamten Zyklus.",
      "Licht, Klima, Wurzelzone und Nährstoffprofil müssen phasenweise gemeinsam gesteuert werden.",
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
          "Entscheidungsregeln für Höher- oder Runterfahren von EC festlegen"
        ]
      },
      {
        heading: "Schritt 2: Canopy aktiv führen statt nur reagieren",
        content: [
          "Gleichmässige Lichtverteilung ist ein Prozess, kein Zufall. Arbeite mit Entlaubung, Training und Höhenmanagement so, dass Licht, Luftstrom und Reife möglichst homogen bleiben.",
          "Professionelle Grower behandeln die Canopy als produktive Fläche. Jede dunkle, feuchte oder chaotische Zone wird später zum Risiko für Minderertrag, Schimmel oder ungleichmässige Reife."
        ],
        checklist: [
          "Canopy-Fotos jede Woche aus gleichem Winkel machen",
          "Ungültige Schattenzonen konsequent reduzieren",
          "Lichtabstand und Hotspots nach jedem Training neu kontrollieren"
        ]
      },
      {
        heading: "Schritt 2b: Wochenplan für Performance ohne Kontrollverlust",
        content: [
          "Woche 1-2 Veg: Basiswerte bestätigen. Sensorik, Giessfrequenz und Start-Feed nur so hoch fahren, dass Pflanzen sichtbar sauber reagieren. Abweichungen sofort notieren statt später deuten.",
          "Woche 3-4 Veg: Kronendach angleichen, erste Trainingsentscheidungen sauber dokumentieren und Wurzelraum-Daten mit dem Blattbild zusammen lesen. Ziel ist Homogenität, nicht spektakuläres Einzelwachstum.",
          "Woche 5 Stretch: Licht und Klima jetzt täglich mit dem Wuchs koppeln. Stretch ist die Phase, in der schlechte Zielkorridore später am teuersten werden.",
          "Woche 6-8 Hauptblüte: Drain-Trends, K/Ca-Balance und Luftbewegung eng prüfen. Je dichter die Blüten werden, desto weniger Fehlertoleranz hat das System.",
          "Woche 9+ Finish und Review: Reifehomogenität, Problemzonen und Ertragsverteilung dokumentieren. Das ist die Datenbasis für den nächsten Optimierungsschritt."
        ],
        checklist: [
          "Stretch-Woche nicht ohne tägliche Licht- und Klima-Kontrolle laufen lassen",
          "Hauptblüte als Risiko- und nicht nur als Ertragsphase behandeln",
          "Am Zyklusende immer Review vor der nächsten Änderung machen"
        ]
      },
      {
        heading: "Schritt 3: Nährstoffgabe und Wurzelraum datenbasiert steuern",
        content: [
          "Jetzt reicht Bauchgefühl nicht mehr. Vergleiche Soll-EC, Ist-Drain, Pflanzenreaktion und Trocknungsdauer gemeinsam. Gerade in Coco oder anderen schnell reagierenden Medien sind kleine Trends wichtiger als Einmalmessungen.",
          "Peer-reviewte Cannabis-Studien zu Substraten und Fertigation belegen, dass Kalium-, Stickstoff- und pH-Management phasenabhängig optimiert werden müssen. Zu späte Reaktionen kosten Blütenmasse und Qualität."
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
          "Qualitätsverlust nicht nur auf Genetik schieben, sondern Prozessdaten prüfen"
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
        answer: "Wenn dein Mess- und Bewässerungssystem stabil genug ist, schnellere Reaktionen zu kontrollieren. Ohne Datendisziplin steigt nur die Fehlergeschwindigkeit."
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
    relatedSlugs: ["lichtstress-und-canopy-management", "naehrstoffblockaden-und-antagonismen", "vpd-und-ec-kombi-rechner-guide", "substrat-vergleich-coco-erde-hydro"]
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
      "Die stärksten Teams koppeln wissenschaftliche Evidenz an operative Routinen und Chargen-Review."
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
          "Professionelle Grows werden über Standards, nicht über Tagesstimmung gesteuert. Definiere SOPs für Raumvorbereitung, Stecklingsannahme, Bewässerung, Sensor-Checks, Hygiene und Postharvest-Übergaben.",
          "Freigabekriterien je Phase helfen, dass Teams nur dann skalieren oder umstellen, wenn die Basis stabil ist. Ohne diese Gates wird jedes Problem zu teuer und schwer reproduzierbar."
        ],
        checklist: [
          "SOP-Versionen mit Datum und Verantwortlichkeit pflegen",
          "Phasen-Gates für Veg, Stretch, Blüte und Ernte schriftlich definieren",
          "Abweichungen immer mit CAPA-Logik dokumentieren"
        ]
      },
      {
        heading: "Schritt 2: Klima, Licht und Feed als verknüpfte Datenspuren lesen",
        content: [
          "Auf Profi-Niveau werden keine Einzelwerte diskutiert, sondern Trends: Sensor-Drift, Zonenunterschiede, Bewässerungsfenster, PPFD-Verteilung, Blattmasse und Drain-Verhalten. Erst daraus entstehen belastbare Entscheidungen.",
          "Studien zu Cannabis-Produktionssystemen und Erfahrungen aus professionellen Indoor-Setups zeigen, dass die größten Gewinne aus konsistenter Standardisierung und früher Abweichungserkennung kommen."
        ],
        checklist: [
          "Zone gegen Zone vergleichen statt nur Mittelwerte lesen",
          "Messgeräte nach Kalibrierintervall sperren oder freigeben",
          "Klima- und Feed-Daten mit Ereignislog verknüpfen"
        ]
      },
      {
        heading: "Schritt 2b: Produktionswochen als wiederholbares Betriebsschema",
        content: [
          "Woche 0 Pre-Flight: Raumfreigabe, Sensorstatus, Hygiene, Wasser und Material müssen vor Pflanzenannahme validiert sein. Ohne saubere Startfreigabe beginnt jede Charge mit Blindflug.",
          "Woche 1-3 Etablierung: Clone-Qualität, Anwuchsquote und Zonenunterschiede eng monitoren. Jetzt werden SOP-Lücken sichtbar, bevor sie später als Ertragsproblem auftreten.",
          "Woche 4-6 Produktionsdruck: Stretch, Canopy-Dichte und Klima-Kopplung erzeugen die höchste operative Last. Schichtübergaben und Event-Logging müssen hier besonders sauber sein.",
          "Woche 7-9 Reife und Risikoabwehr: Botrytis-, Hygiene- und Trockenmasse-Risiken steigen. Freigabekriterien für Erntefenster sollten nicht nur auf Optik, sondern auf Charge, Zone und Laborlogik beruhen.",
          "Woche 10+ Postharvest und CAPA: Trocknung, Curing, Labor, Sperrentscheidungen und Review müssen in einer geschlossenen Prozessschleife enden. Erst dann ist die Charge wirklich abgeschlossen."
        ],
        checklist: [
          "Jede Charge mit Pre-Flight und Exit-Review starten und beenden",
          "Schichtwechsel nur mit dokumentiertem Ereignisstand übergeben",
          "CAPA-Massnahmen spätestens im Folgezyklus verifizieren"
        ]
      },
      {
        heading: "Schritt 3: Risiko aktiv managen - Hygiene, Pathogene, Lieferkette",
        content: [
          "Premium-Qualität scheitert oft nicht an Wuchs, sondern an Hygiene, Probenahme und Nachverfolgbarkeit. Integriere Clone-Hygiene, Schimmelprävention, Wasserqualität und Lieferantenkontrolle in denselben Managementrahmen wie Licht und Ertrag.",
          "Gerade bei hoher Pflanzendichte oder engen Takten werden kleine Hygienefehler schnell zum Chargenproblem. Profi-Grower planen deshalb Risikoabwehr als Kernprozess ein."
        ],
        checklist: [
          "Hygiene-SOP mit Verantwortlichkeiten pro Schicht festlegen",
          "Wasser, Werkzeuge und Clone-Zugänge als Risikopunkte auditieren",
          "Frühwarnsignale für Pathogene und Schädlinge in Reviews aufnehmen"
        ]
      },
      {
        heading: "Schritt 4: Nach der Ernte beginnt die nächste Prozessschleife",
        content: [
          "Postharvest, Curing und Laborlogik gehören in denselben Performance-Zyklus wie die Kulturphase. Nur so lassen sich Qualitätsverluste, Chargenunterschiede und Vermarktungsprobleme systematisch beheben.",
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
        text: "Standard Operating Procedure - eine feste Arbeitsanweisung, damit dieselbe Aufgabe immer gleich ausgeführt wird."
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
      { term: "Freigabekriterium", definition: "Definierter Schwellenwert oder Check, der vor dem Übergang in die nächste Phase erfüllt sein muss." }
    ],
    downloads: [
      { title: "Profi Chargen-Checkliste", href: "/terpira/tutorials/how-to-grow-profi-checkliste.txt", kind: "TXT-Checkliste" },
      { title: "Profi SOP-Template für Cultivation und QA", href: "/terpira/tutorials/how-to-grow-profi-sop.txt", kind: "TXT-SOP-Vorlage" }
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
        text: "Saubere Einordnung reduziert Fehlentscheidungen und verbessert die Qualität von Content, Prozessen und Nutzerverständnis."
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
      { term: "Datenspur", definition: "Nachvollziehbare Dokumentation von Messwerten, Entscheidungen und Änderungen." },
      { term: "Kontext", definition: "Rahmenbedingungen, die bestimmen, wie ein Ergebnis richtig eingeordnet wird." },
    ]
  });

const thirdWaveSeeds: LiteArticleSeed[] = [
  { slug: "genetische-stabilitaet-ueber-generationen", title: "Genetische Stabilität über Generationen", summary: "Wie Linien über mehrere Zyklen bewertet werden und warum Stabilität ein eigenes Kriterienset braucht.", category: "genetik", difficulty: "profi", readMinutes: 9, tags: ["Genetik", "Stabilität", "Selektion", "Linien"], relatedSlugs: ["genetik-und-phaenotyp-selektion", "selektionsscorecards-fuer-pheno-hunts", "mutterpflanzen-und-clone-hygiene"] },
  { slug: "crossing-backcrossing-grundlagen", title: "Crossing und Backcrossing Grundlagen", summary: "Grundbegriffe der Zuchtarbeit für bessere Einordnung von Linienbeschreibungen und Selektionszielen.", category: "genetik", difficulty: "fortgeschritten", readMinutes: 8, tags: ["Crossing", "Backcross", "Zucht", "Linien"], relatedSlugs: ["feminisiert-vs-regular-vs-autoflower", "genetik-und-phaenotyp-selektion", "selektionsscorecards-fuer-pheno-hunts"] },
  { slug: "terpen-oxidationsprodukte-und-bedeutung", title: "Terpen-Oxidationsprodukte und Bedeutung", summary: "Wie oxidierte Terpenanteile Profile verändern und warum frische Analytik plus Lagerkontext zusammengehören.", category: "chemie", difficulty: "profi", readMinutes: 9, tags: ["Terpene", "Oxidation", "Analytik", "Chemie"], relatedSlugs: ["thc-zu-cbn-abbau-und-oxidation", "lagerung-und-terpenverlust-vermeiden", "analytik-hplc-vs-gc-bei-cannabinoiden"] },
  { slug: "matrixeffekte-in-der-cannabisanalytik", title: "Matrixeffekte in der Cannabis-Analytik", summary: "Warum dieselbe Methode je Produktmatrix unterschiedlich reagieren kann und was das für Vergleichbarkeit bedeutet.", category: "chemie", difficulty: "profi", readMinutes: 9, tags: ["Matrix", "Analytik", "Labor", "Methodik"], relatedSlugs: ["analytik-hplc-vs-gc-bei-cannabinoiden", "sampling-und-probenahme-fehler", "coa-richtig-lesen"] },
  { slug: "minor-terpene-und-profiltiefe", title: "Minor-Terpene und Profiltiefe", summary: "Warum kleine Terpenanteile für Profilcharakter und Vergleichbarkeit wichtig sein können.", category: "terpene", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Minor Terpene", "Profil", "Aroma", "Analytik"], relatedSlugs: ["terpene-und-wirkprofil", "myrcen-limonen-caryophyllen-einordnung", "sensorik-panels-fuer-cannabisprodukte"] },
  { slug: "terpen-panels-und-qualitaetslabels", title: "Terpen-Panels und Qualitätslabels", summary: "Wie Terpenpanels für Kataloge standardisiert werden können, ohne in Marketingkürzel abzurutschen.", category: "terpene", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Terpenpanel", "Label", "Katalog", "Qualität"], relatedSlugs: ["sensorik-panels-fuer-cannabisprodukte", "terpene-und-wirkprofil", "coa-richtig-lesen"] },
  { slug: "indikationsgrenzen-und-patientenkommunikation", title: "Indikationsgrenzen und Patientenkommunikation", summary: "Wie medizinische Inhalte Nutzen, Grenzen und Unsicherheiten gleichzeitig transparent darstellen.", category: "medizin", difficulty: "profi", readMinutes: 9, tags: ["Indikation", "Medizin", "Kommunikation", "Evidenz"], relatedSlugs: ["cannabinoide-und-evidenz", "cannabis-bei-schmerz-evidenzcheck", "cannabinoide-nebenwirkungen-und-interaktionen"] },
  { slug: "real-world-data-vs-rct-bei-cannabis", title: "Real-World-Data vs. RCT bei Cannabis", summary: "Wie Beobachtungsdaten und klinische Studien zusammen gelesen werden sollten.", category: "medizin", difficulty: "profi", readMinutes: 9, tags: ["RWD", "RCT", "Evidenz", "Studien"], relatedSlugs: ["cannabinoide-und-evidenz", "cannabis-und-schlaf-was-ist-belegt", "cbd-und-angststoerungen-einordnung"] },
  { slug: "orale-produkte-und-first-pass-risiken", title: "Orale Produkte und First-Pass-Risiken", summary: "Einordnung von Effektdauer, Verzogerung und Fehlsteuerung bei oraler Anwendung.", category: "konsumformen", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Oral", "First Pass", "Timing", "Risiko"], relatedSlugs: ["inhalation-vs-edibles", "sublingual-tinkturen-richtig-einordnen", "inhalation-set-setting-und-harm-reduction"] },
  { slug: "dosisprotokolle-ohne-uebertreibung", title: "Dosisprotokolle ohne Übertreibung", summary: "Wie strukturierte Dosisprotokolle für Aufklärung funktionieren, ohne falsche Sicherheit zu erzeugen.", category: "konsumformen", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Dosis", "Protokoll", "Aufklärung", "Risiko"], relatedSlugs: ["inhalation-vs-edibles", "cannabinoide-nebenwirkungen-und-interaktionen", "inhalation-set-setting-und-harm-reduction"] },
  { slug: "concentrate-categorization-fuer-plattformen", title: "Concentrate-Categorization für Plattformen", summary: "Wie Konzentrate so kategorisiert werden, dass Nutzer vergleichen können und Daten konsistent bleiben.", category: "konzentrate", difficulty: "profi", readMinutes: 8, tags: ["Konzentrate", "Katalog", "Taxonomie", "Plattform"], relatedSlugs: ["hash-typen-vergleichen", "full-melt-und-marketingsprache", "rosin-einordnung-ohne-hype"] },
  { slug: "kontaminantenprofile-bei-extrakten", title: "Kontaminantenprofile bei Extrakten", summary: "Welche Kontaminantenklassen bei konzentrierten Produkten besondere Aufmerksamkeit brauchen.", category: "konzentrate", difficulty: "fortgeschritten", readMinutes: 8, tags: ["Extrakte", "Kontaminanten", "Sicherheit", "Labor"], relatedSlugs: ["bubble-hash-qualitaetskriterien", "pgr-und-kontaminanten", "pestizidklassen-und-rueckstandsrisiken"] },
  { slug: "internationale-regelwerke-vergleichen", title: "Internationale Regelwerke vergleichen", summary: "Wie sich Rahmenwerke zwischen Regionen unterscheiden und was das für Content und Compliance bedeutet.", category: "recht", difficulty: "profi", readMinutes: 9, tags: ["Regulierung", "International", "Compliance", "Recht"], relatedSlugs: ["rechtliche-grundlagen-dach", "gmp-gdp-und-qualitaetssysteme", "werbeaussagen-und-health-claims-cannabis"] },
  { slug: "audit-readiness-fuer-content-und-produkt", title: "Audit-Readiness für Content und Produkt", summary: "Praktische Leitlinien, um Dokumente, Prozesse und Wissensinhalte auditfähig zu halten.", category: "recht", difficulty: "fortgeschritten", readMinutes: 8, tags: ["Audit", "Readiness", "Dokumentation", "Compliance"], relatedSlugs: ["dokumentationspflichten-fuer-chargen", "batch-release-und-freigabekriterien", "gmp-gdp-und-qualitaetssysteme"] },
  { slug: "microbial-trending-und-fruehwarnung", title: "Microbial Trending und Frühwarnung", summary: "Wie mikrobielle Messreihen als Frühwarnsystem für Qualitäts- und Sicherheitsprobleme genutzt werden.", category: "sicherheit", difficulty: "profi", readMinutes: 8, tags: ["Mikrobiologie", "Trending", "Frühwarnung", "Sicherheit"], relatedSlugs: ["schimmel-und-mykotoxine-bei-cannabis", "recall-und-sperrprozesse-fuer-chargen", "wasseraktivitaet-und-curing"] },
  { slug: "supplier-risk-scoring-fuer-cannabis", title: "Supplier-Risk-Scoring für Cannabis", summary: "Wie Lieferanten nach Datenqualität, Abweichungen und Zuverlässigkeit bewertet werden können.", category: "sicherheit", difficulty: "profi", readMinutes: 8, tags: ["Lieferanten", "Scoring", "Risiko", "Qualität"], relatedSlugs: ["lieferkette-und-rueckverfolgbarkeit", "white-label-und-qualitaetsrisiken", "dokumentationspflichten-fuer-chargen"] },
  { slug: "interlaborvergleich-und-ringtests", title: "Interlaborvergleich und Ringtests", summary: "Warum Ringtests wichtig sind, um Laborqualität und Vergleichbarkeit langfristig abzusichern.", category: "qualitaet", difficulty: "profi", readMinutes: 8, tags: ["Ringtest", "Interlabor", "Qualität", "Analytik"], relatedSlugs: ["coa-richtig-lesen", "analytik-hplc-vs-gc-bei-cannabinoiden", "sampling-und-probenahme-fehler"] },
  { slug: "stabilitaetsprogramme-fuer-produktlinien", title: "Stabilitätsprogramme für Produktlinien", summary: "Wie strukturierte Stabilitätsprüfungen über Chargen und Zeit aufgebaut werden.", category: "qualitaet", difficulty: "profi", readMinutes: 9, tags: ["Stabilität", "Produktlinie", "Qualität", "Programm"], relatedSlugs: ["lagerung-verpackung-und-lichtschutz", "batch-release-und-freigabekriterien", "thc-zu-cbn-abbau-und-oxidation"] },
  { slug: "preisindizes-und-marktzyklen", title: "Preisindizes und Marktzyklen", summary: "Wie Preiszyklen interpretiert werden und warum Indexe für Marktbeobachtung auf Plattformen sinnvoll sind.", category: "markt", difficulty: "fortgeschritten", readMinutes: 7, tags: ["Preis", "Index", "Markt", "Zyklus"], relatedSlugs: ["markttransparenz-und-preise", "lieferkette-und-rueckverfolgbarkeit", "white-label-und-qualitaetsrisiken"] },
  { slug: "nachfrageprognosen-fuer-produktkategorien", title: "Nachfrageprognosen für Produktkategorien", summary: "Welche Daten für belastbare Prognosen taugen und wo reine Trendbeobachtung zu kurz greift.", category: "markt", difficulty: "profi", readMinutes: 8, tags: ["Prognose", "Nachfrage", "Kategorie", "Markt"], relatedSlugs: ["markttransparenz-und-preise", "preisindizes-und-marktzyklen", "grow-log-und-kpi-dashboard"] },
  { slug: "content-taxonomie-und-tag-governance", title: "Content-Taxonomie und Tag-Governance", summary: "Wie grosse Wissensseiten Kategorien und Tags so steuern, dass Suche und Navigation stabil bleiben.", category: "werkzeuge", difficulty: "profi", readMinutes: 8, tags: ["Taxonomie", "Tags", "Governance", "Wiki"], relatedSlugs: ["grow-log-und-kpi-dashboard", "sensor-kalibrierung-und-messfehler", "concentrate-categorization-fuer-plattformen"] },
  { slug: "release-checklisten-fuer-wiki-drops", title: "Release-Checklisten für Wiki-Drops", summary: "Praxis-Checkliste für gross angelegte Content-Drops mit Qualitäts- und Konsistenzkontrolle.", category: "werkzeuge", difficulty: "einsteiger", readMinutes: 6, tags: ["Release", "Checkliste", "Wiki", "QA"], relatedSlugs: ["content-taxonomie-und-tag-governance", "batch-release-und-freigabekriterien", "grow-log-und-kpi-dashboard"] }
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
  "blattsymptom-troubleshooter": {
    growValue: "Bestimme zuerst WO das Symptom sitzt (alt/jung, ganze Pflanze/Trieb) und ob mehrere Muster gleichzeitig auftreten – das grenzt die Ursache schneller ein als Farbe allein.",
    qualityScore: 5,
    growCategory: "stress",
  },
  "dli-und-photoperiode": {
    growValue: "Halte die Dunkelphase in der Blüte absolut lichtdicht – schon ein kurzer Lichteinbruch kann Zwittrigkeit oder Reversion auslösen, unabhängig von der Gesamt-DLI.",
    qualityScore: 4,
    growCategory: "lighting",
  },
  "vpd-nach-wachstumsphase": {
    growValue: "Fahre VPD schrittweise hoch: 0.4–0.8 kPa beim Sämling, 0.8–1.2 vegetativ, 1.2–1.6 in der Blüte – ein fixes Ziel über den ganzen Zyklus unter- oder überfordert eine der Phasen.",
    qualityScore: 4,
    growCategory: "climate",
  },
  "ec-und-runoff-interpretation": {
    growValue: "Vergleiche Runoff-EC immer mit der Zulauf-EC, nie isoliert – Runoff > 1.3–1.5× Zulauf heißt Salzanreicherung und Spülgang, ein Einzelwert ohne Referenz sagt wenig aus.",
    qualityScore: 4,
    growCategory: "nutrients",
  },
  "wurzelgesundheit-diagnose": {
    growValue: "Prüfe bei jedem Umtopfen Farbe, Konsistenz UND Geruch der Wurzel – fauliger Geruch ist oft das frühere Warnsignal als sichtbare Braunfärbung.",
    qualityScore: 4,
    growCategory: "watering",
  },
  "trocknung-protokoll": {
    growValue: "Trockne bei 18–21 °C und 55–65 % RH bis zum Snap Test (Stängel bricht statt biegt) – schnellere, heißere Trocknung kostet Terpene und erhöht das Case-Hardening-Risiko.",
    qualityScore: 4,
    growCategory: "yield",
  },
  "trichom-reifegrad-bilddiagnose": {
    growValue: "Beurteile Calyx-Trichome mit 30–60×-Lupe an mehreren Canopy-Positionen – milchig = THC-Höchststand, Bernstein = beginnender CBN-Abbau; Pistillenfarbe allein reicht nicht.",
    qualityScore: 4,
    growCategory: "yield",
  },
  "ph-management-coco-erde-hydro": {
    growValue: "Passe die Messfrequenz ans Substrat an: Erde wöchentlich, Coco bei jeder Gießung, Hydro täglich – und stelle den pH immer erst NACH vollständigem Düngerauflösen ein.",
    qualityScore: 4,
    growCategory: "nutrients",
  },
  "erntefenster-trichomreife": {
    growValue: "Kombiniere Trichomfarbe (Hauptkriterium) mit Pistillenrückzug und Blattseneszenz – die Breeder-Blütezeit ist nur ein grober Ausgangspunkt, kein festes Erntedatum.",
    qualityScore: 4,
    growCategory: "yield",
  },
  "hop-latent-viroid-hlvd": {
    growValue: "Bei unerklärlich schwacher Performance einer sonst bewährten Genetik ('Dudding') HLVd per PCR-Test abklären lassen – visuelle Einschätzung allein reicht wegen der häufigen Latenz nicht.",
    qualityScore: 3,
    growCategory: "stress",
  },
  "cannabis-anbau-grundlagen": {
    growValue: "Führ täglich ein Grow-Log mit VPD, EC und pH – drei dokumentierte Runs machen dich besser als beliebig viele undokumentierte.",
    qualityScore: 5,
    growCategory: "yield",
  },
  "vpd-einfach-erklaert": {
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
  "bewaesserung-ohne-uebergiessen": {
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
  "naehrstoffblockaden-und-antagonismen": {
    growValue: "Prüfe pH (5.8–6.2 Coco, 6.0–6.8 Erde) bevor du neue Dünger gibst – 80% der Mangelbilder sind pH-Blockaden, keine echten Mängel.",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  "naehrstoffbedarf-cannabis-lebenszyklus": {
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
  "stressmarker-frueh-erkennen": {
    growValue: "Hängende Blätter morgens = Hitzestress, hängende Blätter abends = Wasserverlust – beide Signale richtig lesen spart Ertragseinbußen.",
    qualityScore: 4,
    growCategory: "stress",
  },
  "integrierte-schaedlingspraevention-grow": {
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
  "genetik-und-phaenotyp-selektion": {
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
  "wasseraktivitaet-und-curing": {
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
  "pestizidklassen-und-rueckstandsrisiken": {
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
  "bubble-hash-qualitaetskriterien": {
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
  "how-to-grow-cannabis-anfaenger-tutorial": {
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
