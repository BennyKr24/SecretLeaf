// ─────────────────────────────────────────────────────────────────────────────
// Phase 18 – Content Production Engine
// ─────────────────────────────────────────────────────────────────────────────
// Elite-Diagnoseartikel ("handbook grade"), erzeugt nach dem 16-Block-Schema des
// Cannabis Editorial Standard (docs/CANNABIS_EDITORIAL_STANDARD.md) und den
// Archetyp-Vorlagen in docs/content-factory/templates/.
//
// Register: mechanismus-first, quantifiziert (pH, EC, °C, %RH, VPD, PPFD), ohne
// Blog-Filler. Jeder Artikel ist diagnose-, rechner-, AI- und tool-tauglich.
//
// Wave 1: Nährstoffmängel  – magnesiummangel, stickstoffmangel, calciummangel,
//                            kaliummangel, eisenmangel
// Wave 2: Schädlinge        – spinnmilben, thripse, trauermuecken
// Wave 3: Krankheiten       – bud-rot-botrytis, echter-mehltau-powdery-mildew,
//                            wurzelfaeule
// Wave 4: Toxizitäten        – stickstoffueberschuss, kalium-ueberschuss,
//   / Überschüsse (Phase 19)   calciumueberschuss, salzanreicherung-hohe-ec,
//                            naehrstoffverbrennung-tipburn
// Wave 5: Umwelt- &          – hitzestress, kaeltestress, windbrand,
//   Klimastress (Phase 20)     luftfeuchte-management, co2-management
//
// Veröffentlichung läuft über die GROW_KNOWLEDGE-Allowlist in wiki.ts; die
// passenden Einträge liefert DIAGNOSTIC_GROW_KNOWLEDGE am Dateiende.
// ─────────────────────────────────────────────────────────────────────────────

import { TerpiraArticle, TerpiraSource, GrowCategory } from "@/lib/terpira/types";

// ─── Quellen-Register (Agronomie, Pflanzenpathologie, Entomologie) ───────────
export const diagnosticSources: TerpiraSource[] = [
  {
    id: "marschner-mineral-nutrition",
    title: "Marschner's Mineral Nutrition of Higher Plants",
    publisher: "Academic Press",
    year: "2012",
    url: "https://www.sciencedirect.com/book/9780123849052/marschners-mineral-nutrition-of-higher-plants",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["Nährstoffe", "Pflanzenphysiologie", "Mangel"],
  },
  {
    id: "bernal-cannabis-nutrient-requirements",
    title: "Photosynthetic Response of Cannabis to Nutrient and Light Intensity",
    publisher: "Frontiers in Plant Science",
    year: "2020",
    url: "https://www.frontiersin.org/articles/10.3389/fpls.2020.00699/full",
    sourceType: "manual",
    evidenceLevel: 4,
    tags: ["Cannabis", "Nährstoffe", "Düngung"],
  },
  {
    id: "bryson-plant-nutrition-manual",
    title: "Plant Nutrition Manual",
    publisher: "CRC Press",
    year: "2014",
    url: "https://www.taylorfrancis.com/books/mono/10.1201/b16005/plant-nutrition-manual",
    sourceType: "manual",
    evidenceLevel: 4,
    tags: ["Nährstoffe", "Diagnose", "Blattanalyse"],
  },
  {
    id: "punja-cannabis-pathogens",
    title: "Pathogens and Molds Affecting Production and Quality of Cannabis sativa",
    publisher: "Frontiers in Plant Science",
    year: "2019",
    url: "https://www.frontiersin.org/articles/10.3389/fpls.2019.01120/full",
    sourceType: "manual",
    evidenceLevel: 4,
    tags: ["Cannabis", "Krankheiten", "Pathogene"],
  },
  {
    id: "scott-punja-powdery-mildew",
    title: "Powdery Mildew (Golovinomyces ambrosiae) on Cannabis sativa",
    publisher: "Plant Disease",
    year: "2021",
    url: "https://apsjournals.apsnet.org/doi/10.1094/PDIS-09-20-1972-RE",
    sourceType: "manual",
    evidenceLevel: 4,
    tags: ["Mehltau", "Krankheiten", "Cannabis"],
  },
  {
    id: "botrytis-grey-mold-review",
    title: "Botrytis cinerea: The Cause of Grey Mould Disease",
    publisher: "Molecular Plant Pathology",
    year: "2007",
    url: "https://bsppjournals.onlinelibrary.wiley.com/doi/10.1111/j.1364-3703.2007.00417.x",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["Botrytis", "Schimmel", "Krankheiten"],
  },
  {
    id: "pythium-root-rot-hydroponics",
    title: "Pythium Root Rot in Hydroponic and Soilless Systems",
    publisher: "Annual Review of Phytopathology",
    year: "2017",
    url: "https://www.annualreviews.org/doi/10.1146/annurev-phyto-080516-035409",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["Wurzelfäule", "Pythium", "Hydroponik"],
  },
  {
    id: "tetranychus-twospotted-mite",
    title: "Biology and Management of the Twospotted Spider Mite (Tetranychus urticae)",
    publisher: "Annual Review of Entomology",
    year: "2013",
    url: "https://www.annualreviews.org/doi/10.1146/annurev-ento-120710-100600",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["Spinnmilben", "Schädlinge", "IPM"],
  },
  {
    id: "thrips-frankliniella-management",
    title: "Thrips (Thysanoptera) Biology, Ecology and Integrated Management",
    publisher: "Annual Review of Entomology",
    year: "2005",
    url: "https://www.annualreviews.org/doi/10.1146/annurev.ento.50.071803.130318",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["Thripse", "Schädlinge", "IPM"],
  },
  {
    id: "fungus-gnats-bradysia-management",
    title: "Fungus Gnats (Bradysia spp.) as Pests of Container-Grown Plants",
    publisher: "Journal of Integrated Pest Management",
    year: "2015",
    url: "https://academic.oup.com/jipm/article/6/1/16/2936344",
    sourceType: "manual",
    evidenceLevel: 4,
    tags: ["Trauermücken", "Schädlinge", "Substrat"],
  },
  {
    id: "ipm-cannabis-arthropods",
    title: "Integrated Pest Management of Arthropod Pests on Cannabis",
    publisher: "Insects (MDPI)",
    year: "2020",
    url: "https://www.mdpi.com/2075-4450/11/5/300",
    sourceType: "manual",
    evidenceLevel: 4,
    tags: ["IPM", "Schädlinge", "Cannabis"],
  },
  {
    id: "munns-salinity-tolerance",
    title: "Mechanisms of Salinity Tolerance",
    publisher: "Annual Review of Plant Biology",
    year: "2008",
    url: "https://www.annualreviews.org/doi/10.1146/annurev.arplant.59.032607.092911",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["Salzstress", "EC", "Osmotischer Stress"],
  },
  {
    id: "caplan-cannabis-fertility-rate",
    title: "Optimal Rate of Organic Fertilizer during the Flowering Stage of Cannabis",
    publisher: "HortScience",
    year: "2017",
    url: "https://journals.ashs.org/hortsci/view/journals/hortsci/52/12/article-p1796.xml",
    sourceType: "manual",
    evidenceLevel: 4,
    tags: ["Düngung", "Überdüngung", "Cannabis"],
  },
  {
    id: "bugbee-electrical-conductivity",
    title: "Nutrient Management in Recirculating Hydroponic Culture",
    publisher: "Utah State University / Acta Horticulturae",
    year: "2004",
    url: "https://www.actahort.org/books/648/648_12.htm",
    sourceType: "manual",
    evidenceLevel: 4,
    tags: ["EC", "Hydroponik", "Nährlösung"],
  },
  // ── Umwelt- & Klimastress (Phase 20) ──────────────────────────────────────
  {
    id: "chandra-cannabis-photosynthesis-temperature-co2",
    title:
      "Photosynthetic response of Cannabis sativa L. to variations in PPFD, temperature and CO2 conditions",
    publisher: "Physiology and Molecular Biology of Plants",
    year: "2008",
    url: "https://link.springer.com/article/10.1007/s12298-008-0027-x",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["Cannabis", "Temperatur", "CO2", "Photosynthese"],
  },
  {
    id: "prenger-ling-vpd-greenhouse",
    title: "Greenhouse Condensation Control: Understanding and Using VPD",
    publisher: "Ohio State University Extension (AEX-804)",
    year: "2000",
    url: "https://ohioline.osu.edu/factsheet/aex-804",
    sourceType: "manual",
    evidenceLevel: 4,
    tags: ["VPD", "Klima", "Luftfeuchte", "Transpiration"],
  },
  {
    id: "wahid-heat-tolerance-overview",
    title: "Heat tolerance in plants: An overview",
    publisher: "Environmental and Experimental Botany",
    year: "2007",
    url: "https://www.sciencedirect.com/science/article/abs/pii/S0098847207000020",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["Hitzestress", "Stressphysiologie", "Temperatur"],
  },
  {
    id: "theocharis-low-temperature-plants",
    title: "Physiological and molecular changes in plants grown at low temperatures",
    publisher: "Planta",
    year: "2012",
    url: "https://link.springer.com/article/10.1007/s00425-012-1641-y",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["Kältestress", "Stressphysiologie", "Temperatur"],
  },
  {
    id: "mortensen-co2-enrichment-review",
    title: "Review: CO2 enrichment in greenhouses. Crop responses",
    publisher: "Scientia Horticulturae",
    year: "1987",
    url: "https://www.sciencedirect.com/science/article/abs/pii/0304423887900128",
    sourceType: "manual",
    evidenceLevel: 4,
    tags: ["CO2", "Photosynthese", "Klima"],
  },
  // ── Wave 6 – Blockaden, Wurzelstress & erweiterte Schädlinge (Phase 21) ────
  {
    id: "marschner-nutrient-availability-ph",
    title: "Mineral Nutrition of Higher Plants — Availability of Nutrients in Soils (pH-Dependence)",
    publisher: "Academic Press",
    year: "2012",
    url: "https://www.sciencedirect.com/book/9780123849052/marschners-mineral-nutrition-of-higher-plants",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["pH", "Löslichkeit", "Nährstoffe", "Lockout"],
  },
  {
    id: "drew-root-response-waterlogging",
    title: "Oxygen Deficiency and Root Metabolism: Injury and Acclimation Under Hypoxia and Anoxia",
    publisher: "Annual Review of Plant Physiology and Plant Molecular Biology",
    year: "1997",
    url: "https://www.annualreviews.org/doi/10.1146/annurev.arplant.48.1.223",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["Staunässe", "Wurzelatmung", "Sauerstoffmangel"],
  },
  {
    id: "blackman-eastop-aphids",
    title: "Aphids on the World's Herbaceous Plants and Shrubs",
    publisher: "Wiley",
    year: "2006",
    url: "https://onlinelibrary.wiley.com/doi/book/10.1002/9780470754091",
    sourceType: "manual",
    evidenceLevel: 4,
    tags: ["Blattläuse", "Schädlinge", "Biologie"],
  },
  {
    id: "byrne-bellows-whitefly-biology",
    title: "Whitefly Biology",
    publisher: "Annual Review of Entomology",
    year: "1991",
    url: "https://www.annualreviews.org/doi/10.1146/annurev.en.36.010191.001255",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["Weiße Fliege", "Schädlinge", "Biologie"],
  },
  {
    id: "lindquist-eriophyoid-mites",
    title: "Eriophyoid Mites: Their Biology, Natural Enemies and Control",
    publisher: "Elsevier",
    year: "1996",
    url: "https://www.sciencedirect.com/bookseries/world-crop-pests/vol/6",
    sourceType: "manual",
    evidenceLevel: 4,
    tags: ["Rostmilben", "Eriophyidae", "Schädlinge"],
  },
  {
    id: "fusarium-wilt-review",
    title: "Fusarium Wilt Diseases: Biology, Diagnosis and Management",
    publisher: "Annual Review of Phytopathology",
    year: "2003",
    url: "https://www.annualreviews.org/doi/10.1146/annurev.phyto.41.052002.095919",
    sourceType: "manual",
    evidenceLevel: 5,
    tags: ["Fusarium", "Krankheiten", "Wurzelfäule"],
  },
];

// ─── Elite-Diagnoseartikel ───────────────────────────────────────────────────
export const diagnosticArticles: TerpiraArticle[] = [
  // ===========================================================================
  // WAVE 1 – NÄHRSTOFFMÄNGEL
  // ===========================================================================
  {
    slug: "magnesiummangel",
    title: "Magnesiummangel bei Cannabis erkennen und beheben",
    summary:
      "Interveinale Chlorose an älteren Blättern ist das Leitsymptom. So unterscheidest du echten Mangel von pH-bedingter Blockade und korrigierst gezielt über Substrat-pH und Mg-Zufuhr.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 10,
    lastUpdated: "2026-06-02",
    tags: ["Magnesium", "Chlorose", "pH", "Nährstoffmangel", "Diagnose"],
    keyTakeaways: [
      "Magnesium ist mobil: Mangel zeigt sich zuerst an den ÄLTEREN, unteren Blättern als interveinale Chlorose bei grün bleibenden Blattadern.",
      "Häufigste Ursache ist nicht zu wenig Mg, sondern eine pH-bedingte Blockade — Wurzelzonen-pH unter 5.8 (Hydro/Coco) bzw. unter 6.0 (Erde) sperrt Mg.",
      "Korrigiere zuerst den pH-Korridor, dann ergänze Mg über Bittersalz (MgSO4) 1–2 g/L als Wurzelgabe; Blattspray nur als Notmaßnahme.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Interveinale Chlorose, ältere Blätter zuerst" },
      { label: "Mobilität", value: "Mobil (Verlagerung in junge Blätter)" },
      { label: "pH-Fenster Mg (Coco/Hydro)", value: "5.8–6.2" },
      { label: "pH-Fenster Mg (Erde)", value: "6.2–6.8" },
      { label: "Schnellkorrektur", value: "MgSO4 1–2 g/L Wurzelgabe" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Magnesiummangel ist eine Unterversorgung mit pflanzenverfügbarem Mg²⁺ im Gewebe. Magnesium ist das Zentralatom des Chlorophyllmoleküls — ohne Mg kein funktionsfähiger Photosyntheseapparat.",
          "Cannabis zeigt Mg-Mangel besonders in der schnellen Streck- und frühen Blütephase, wenn der Bedarf steigt und konkurrierende Kationen (K⁺, Ca²⁺, NH4⁺) die Aufnahme antagonisieren.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Mg²⁺ bindet im Chlorophyll a/b und aktiviert über 300 Enzyme, darunter die RuBisCO-Aktivase und ATP-abhängige Kinasen. Fehlt Mg, bricht die CO₂-Fixierung ein und reaktive Sauerstoffspezies schädigen das Mesophyll.",
          "Weil Mg phloemmobil ist, baut die Pflanze es aus älteren Blättern ab und verlagert es in die Wuchsspitzen — daher beginnt die Chlorose immer unten.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Mobilität",
        content: [
          "Mobile Nährstoffe (N, P, K, Mg) wandern bei Mangel von alt nach jung. Das ist das wichtigste Unterscheidungsmerkmal: Mg- und N-Mangel starten unten, Ca-, Fe- und S-Mangel starten oben.",
          "Bei Mg bleiben die Blattadern auffällig grün, während das Gewebe dazwischen aufhellt — ein 'Fischgräten'-Muster, das später in rostbraune nekrotische Flecken übergeht.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1 (leicht): Mattes Hellgrün zwischen den Adern an den untersten 2–3 Blattetagen, Adern bleiben sattgrün.",
          "Stadium 2 (mittel): Deutliche gelbe Felder zwischen den Adern, Blattränder beginnen sich nach oben zu wölben; die Chlorose wandert eine Etage höher.",
          "Stadium 3 (schwer): Rostbraune bis purpurne nekrotische Flecken, Blätter werden brüchig und fallen ab; in der Blüte sinkt das Knospengewicht messbar.",
        ],
        checklist: [
          "Untere Blattetagen auf interveinale Aufhellung prüfen",
          "Adern: bleiben sie grün? → Hinweis auf Mg, nicht N",
          "Nekrose-Flecken rostbraun? → fortgeschrittenes Stadium",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. pH-Blockade (häufigste Ursache): Substrat-/Lösungs-pH unter 5.8 (Coco/Hydro) bzw. 6.0 (Erde) reduziert die Mg-Aufnahme drastisch, obwohl genug Mg vorhanden ist.",
          "2. Kationen-Antagonismus: Zu hohe K- oder Ca-Dosierung verdrängt Mg an den Wurzelaufnahmestellen.",
          "3. Echte Unterversorgung: RO-/Weichwasser ohne Mg-Zusatz, einseitige Dünger ohne Mg-Anteil.",
          "4. Auswaschung: Überwässerung in Coco/Hydro spült das leicht lösliche Mg aus der Wurzelzone.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Sitzt die Chlorose an alten oder jungen Blättern? Alt → Mg oder N wahrscheinlich.",
          "Schritt 2: Bleiben die Adern grün (interveinal)? Ja → Mg. Nein, gleichmäßig blass → eher N.",
          "Schritt 3: Miss den Wurzelzonen-pH (Drainagewasser/Substrat). Liegt er unter dem Mg-Fenster → primär pH-Blockade, nicht Dosierung erhöhen.",
          "Schritt 4: Prüfe die EC. Sehr hohe EC mit viel K/Ca → Antagonismus; spüle und stelle das Verhältnis neu ein.",
        ],
        checklist: [
          "pH der Wurzelzone messen (nicht nur den der Stammlösung)",
          "EC der Drainage gegen Zulauf vergleichen",
          "K:Mg- und Ca:Mg-Verhältnis der Rezeptur prüfen",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. pH zuerst in den Zielkorridor bringen: Coco/Hydro 5.8–6.2, Erde 6.2–6.8. Oft löst das den 'Mangel' ohne Mehrdüngung.",
          "2. Mg über die Wurzel ergänzen: Bittersalz (MgSO4·7H₂O) 1–2 g/L in die Nährlösung, EC danach kontrollieren.",
          "3. Notfall-Blattspray: 20 g/L MgSO4 fein vernebeln, nicht in voller Beleuchtung — wirkt schnell auf bestehende Blätter, ersetzt aber keine Wurzelversorgung.",
          "4. Antagonismus entschärfen: K- und Ca-Anteil senken, bis das Ca:Mg-Verhältnis bei etwa 3:1 bis 4:1 liegt.",
        ],
        checklist: [
          "pH korrigieren BEVOR Mg erhöht wird",
          "MgSO4 1–2 g/L, EC nachmessen",
          "Bereits chlorotische Blätter ergrünen nicht mehr — neue Triebe beobachten",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Verwende Cal-Mag-Zusätze konsequent bei RO-/Weichwasser; ziele auf 50–70 mg/L Mg in der fertigen Lösung.",
          "Halte das pH-Management stabil: tägliche Drainage-pH-Messung statt nur Zulaufkontrolle.",
          "Skaliere K in der Blüte nicht aggressiv hoch, ohne Mg proportional mitzuführen.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Niedrige Wurzeltemperaturen (< 18 °C) bremsen die Mg-Aufnahme zusätzlich — ein vermeintlicher Mangel kann ein Temperaturproblem sein.",
          "Hohe Transpiration (niedriges VPD-Management, starke PPFD) erhöht den Mg-Durchsatz; bei knapper Versorgung tritt der Mangel dann zuerst auf.",
          "Ca, K und Mg konkurrieren um dieselben Transporter — das Verhältnis ist wichtiger als die Einzeldosis.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Mg-Dosis erhöhen, ohne den pH zu prüfen — verschärft bei pH-Blockade nur den Salzstress.",
          "Erwartung, dass gelbe Blätter wieder grün werden — sie tun es nicht; bewerte den Erfolg an neuen Blättern.",
          "Blattspray als Dauerlösung statt Wurzelkorrektur.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "In rezirkulierenden Hydro-Systemen reichern sich Antagonisten an; ein periodischer Reset der Reservoirlösung hält das Ca:Mg-Verhältnis stabil.",
          "Eine Blattanalyse (Trockenmasse) gibt Sicherheit: Mg-Gehalte unter ~0.2 % der Trockenmasse gelten als defizitär.",
        ],
      },
    ],
    warnings: [
      "Erhöhe niemals die Mg-Dosis, bevor der Wurzelzonen-pH im Zielfenster liegt — bei pH-Blockade führt das nur zu Salzstress.",
      "Bereits nekrotische Blätter sind verloren; entferne stark befallene Blätter, um Pilzdruck in der Blüte zu senken.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum unten zuerst?",
        text: "Magnesium ist beweglich. Bei Knappheit zieht die Pflanze es aus alten Blättern ab und schickt es nach oben — deshalb vergilben zuerst die unteren Blätter.",
      },
      {
        title: "Kurz erklärt: pH vor Dünger",
        text: "Oft ist genug Magnesium da, aber der pH ist zu niedrig und blockiert die Aufnahme. Erst pH richten, dann erst über mehr Mg nachdenken.",
      },
    ],
    faq: [
      {
        question: "Woran erkenne ich Mg-Mangel sicher gegenüber Stickstoffmangel?",
        answer:
          "Bei Mg bleiben die Blattadern grün, während das Gewebe dazwischen aufhellt (interveinal). Bei N-Mangel vergilbt das ganze Blatt gleichmäßig von der Spitze her. Beide starten an alten Blättern.",
      },
      {
        question: "Wie schnell wirkt eine Mg-Korrektur?",
        answer:
          "Neue Triebe zeigen innerhalb von 5–10 Tagen Besserung. Bereits chlorotische Blätter ergrünen nicht wieder — beurteile den Erfolg ausschließlich am Neuaustrieb.",
      },
      {
        question: "Brauche ich bei Leitungswasser einen Cal-Mag-Zusatz?",
        answer:
          "Meist nicht — hartes Leitungswasser enthält oft schon ausreichend Mg und Ca. Bei RO-/Weichwasser ist ein Cal-Mag-Zusatz dagegen praktisch Pflicht.",
      },
    ],
    glossary: [
      { term: "Interveinale Chlorose", definition: "Aufhellung des Blattgewebes zwischen den Blattadern, während die Adern grün bleiben." },
      { term: "Phloemmobil", definition: "Ein Nährstoff, den die Pflanze im Phloem von alten in junge Organe verlagern kann." },
      { term: "Kationen-Antagonismus", definition: "Gegenseitige Aufnahmehemmung positiv geladener Nährstoffionen (z. B. K⁺, Ca²⁺, Mg²⁺) an der Wurzel." },
    ],
    sourceIds: ["marschner-mineral-nutrition", "bryson-plant-nutrition-manual", "bernal-cannabis-nutrient-requirements"],
    relatedSlugs: ["naehrstoffblockaden-und-antagonismen", "calciummangel", "stickstoffmangel", "naehrstoffbedarf-cannabis-lebenszyklus"],
  },
  {
    slug: "stickstoffmangel",
    title: "Stickstoffmangel bei Cannabis erkennen und beheben",
    summary:
      "Gleichmäßiges Vergilben der unteren Blätter ist das Leitsymptom. So trennst du echten N-Mangel von der natürlichen Seneszenz in der Spätblüte und dosierst phasengerecht nach.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-06-02",
    tags: ["Stickstoff", "Chlorose", "Vegetationsphase", "Nährstoffmangel", "Diagnose"],
    keyTakeaways: [
      "Stickstoff ist hochmobil: Mangel zeigt sich als gleichmäßiges Vergilben der ÄLTESTEN Blätter, das von unten nach oben wandert.",
      "Anders als Mg bleibt bei N kein grünes Adernmuster — das ganze Blatt blasst gleichmäßig aus.",
      "In der Spätblüte ist leichtes Vergilben gewollt (Fade); echter Mangel ist nur in Vegetation und Frühblüte ein Problem.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Gleichmäßige Chlorose, älteste Blätter zuerst" },
      { label: "Mobilität", value: "Sehr mobil" },
      { label: "Bedarf hoch in", value: "Vegetation & Streckung" },
      { label: "Bedarf niedrig in", value: "Spätblüte (Fade gewollt)" },
      { label: "Schnellkorrektur", value: "N-betonter Dünger, EC schrittweise +0.2–0.4" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Stickstoffmangel ist die Unterversorgung mit pflanzenverfügbarem Nitrat (NO3⁻) und Ammonium (NH4⁺). N ist Baustein von Aminosäuren, Proteinen, Chlorophyll und Nukleinsäuren — der mengenmäßig wichtigste Makronährstoff im vegetativen Wachstum.",
          "In der Vegetation und frühen Blüte ist N-Mangel ein echter Defekt; in der Spätblüte ist abnehmender N-Gehalt dagegen physiologisch normal und sogar erwünscht.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "N ist zentraler Bestandteil des Chlorophylls und aller Enzyme. Bei Mangel baut die Pflanze Protein und Chlorophyll in alten Blättern ab, um junges Wachstum zu versorgen.",
          "Die Stickstoffaufnahme erfolgt überwiegend als Nitrat; ein zu hoher Ammoniumanteil bei niedrigem pH kann ihrerseits Toxizität und Wurzelschäden verursachen.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Mobilität",
        content: [
          "N gehört zu den mobilsten Nährstoffen. Die Pflanze opfert konsequent die ältesten Blätter zuerst — die Chlorose wandert wie eine Welle von unten nach oben.",
          "Im Gegensatz zu Mg (interveinal, Adern grün) blasst bei N das gesamte Blattgewebe gleichmäßig aus, oft beginnend an der Blattspitze.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1 (leicht): Mattgrün der untersten Blätter, Wuchs verlangsamt sich, Internodien werden kürzer.",
          "Stadium 2 (mittel): Klar gelbe untere Blätter, die Vergilbung steigt mehrere Etagen hoch; Stängel können sich rötlich-purpur färben.",
          "Stadium 3 (schwer): Untere Blätter sterben ab und fallen, die gesamte Pflanze wirkt blassgrün, Blütenansatz und Ertrag brechen ein.",
        ],
        checklist: [
          "Beginnt das Vergilben an den ältesten Blättern?",
          "Ist es gleichmäßig (nicht interveinal)?",
          "In welcher Phase steht die Pflanze? (Spätblüte = evtl. normal)",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Unterdüngung: Zu niedrige EC für die Phase, ausgewaschenes Substrat oder erschöpfte vorgedüngte Erde nach 3–4 Wochen.",
          "2. pH-Blockade: Stark abweichender Wurzel-pH außerhalb 5.8–6.2 (Coco/Hydro) bzw. 6.0–6.8 (Erde) reduziert die N-Aufnahme.",
          "3. Auswaschung: Häufiges Überwässern spült Nitrat aus der Wurzelzone.",
          "4. Wurzelprobleme: Geschädigte oder kalte Wurzeln nehmen N schlecht auf.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Phase prüfen. Letzte 1–2 Wochen vor Ernte → leichtes Vergilben ist Fade, keine Korrektur nötig.",
          "Schritt 2: Sitzt die Chlorose an den ältesten Blättern und ist gleichmäßig? Ja → N wahrscheinlich.",
          "Schritt 3: EC der Zufuhr und Drainage messen. Niedrige EC → Unterdüngung; passende EC → pH oder Wurzelproblem prüfen.",
          "Schritt 4: Wurzel-pH messen und in den Zielkorridor bringen, bevor die Dosis erhöht wird.",
        ],
        checklist: [
          "Phase bestimmen (Fade vs. Mangel)",
          "EC Zulauf/Drainage vergleichen",
          "Wurzel-pH messen",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. EC phasengerecht anheben: In Vegetation in Schritten von +0.2–0.4 mS/cm, bis der Neuaustrieb sattgrün nachzieht.",
          "2. N-betonten Dünger verwenden (höherer N-Anteil im NPK), nicht einseitig Blütedünger in der Vegetation.",
          "3. pH zuerst korrigieren, falls außerhalb des Fensters — sonst bleibt N trotz Düngung blockiert.",
          "4. In erschöpfter Erde nachdüngen oder umtopfen statt nur Wassermenge zu erhöhen.",
        ],
        checklist: [
          "EC schrittweise erhöhen, nicht sprunghaft",
          "Neuaustrieb als Erfolgsmaß beobachten",
          "In Spätblüte NICHT gegensteuern",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Plane die EC-Kurve entlang des Lebenszyklus: niedrig im Sämling, Maximum in später Vegetation/Streckung, abnehmend zur Ernte.",
          "Vorgedüngte Erden tragen meist nur 3–4 Wochen; plane den Übergang zur Flüssigdüngung rechtzeitig.",
          "Stabiles pH-Management verhindert Pseudo-Mängel.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Hohe Lichtintensität (PPFD) steigert den N-Bedarf; bei starkem Licht ohne ausreichende N-Versorgung tritt Mangel schneller auf.",
          "Ein Überschuss an N verzögert dagegen die Blüte, fördert weiches, schimmelanfälliges Gewebe und unterdrückt die Aufnahme von K.",
          "Kalte Wurzeln (< 18 °C) bremsen die Nitrataufnahme unabhängig von der Dosis.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Fade in der Spätblüte mit Mangel verwechseln und kurz vor der Ernte überdüngen.",
          "Dosis erhöhen, ohne den pH zu prüfen.",
          "N in der Blüte überdosieren — verschlechtert Aroma und erhöht Schimmelrisiko.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Ein gezielter, kontrollierter N-Entzug in der letzten Blütewoche ('Flush'/Fade) kann Aroma und Verbrennung verbessern — das ist gewollte Seneszenz, kein Defekt.",
          "Blattanalysen unter ~2 % N der Trockenmasse in Vegetation deuten auf Unterversorgung hin.",
        ],
      },
    ],
    warnings: [
      "In der Spätblüte ist leichtes Vergilben der unteren Blätter normal — gegensteuern verzögert die Reife und verschlechtert das Aroma.",
      "Überschüssiger Stickstoff in der Blüte macht Knospen weich und schimmelanfällig.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Mangel oder Fade?",
        text: "Vergilben in Vegetation/Frühblüte = echter Mangel, nachdüngen. Vergilben in den letzten 1–2 Wochen vor der Ernte = normaler Fade, nichts tun.",
      },
      {
        title: "Kurz erklärt: N vs. Mg",
        text: "Stickstoff vergilbt das ganze Blatt gleichmäßig. Magnesium lässt die Adern grün und hellt nur dazwischen auf.",
      },
    ],
    faq: [
      {
        question: "Mein Cannabis vergilbt unten in Woche 7 der Blüte — ist das schlimm?",
        answer:
          "Meist nicht. In der Spätblüte zieht die Pflanze Stickstoff aus alten Blättern ab; ein langsamer Fade ist normal und sogar erwünscht. Nur ein rasanter, früher Mangel ist ein Problem.",
      },
      {
        question: "Wie schnell wirkt Nachdüngen?",
        answer:
          "Der Neuaustrieb wird innerhalb von 4–7 Tagen wieder sattgrün. Bereits vergilbte alte Blätter erholen sich nicht mehr.",
      },
    ],
    glossary: [
      { term: "Fade", definition: "Das gewollte, langsame Vergilben der Blätter in der Spätblüte durch natürlichen Nährstoffabbau." },
      { term: "Seneszenz", definition: "Biologischer Alterungs- und Abbauprozess von Pflanzenorganen." },
      { term: "EC", definition: "Elektrische Leitfähigkeit der Nährlösung als Maß für die gelöste Salz-/Nährstoffmenge." },
    ],
    sourceIds: ["marschner-mineral-nutrition", "bernal-cannabis-nutrient-requirements", "bryson-plant-nutrition-manual"],
    relatedSlugs: ["naehrstoffbedarf-cannabis-lebenszyklus", "magnesiummangel", "kaliummangel", "naehrstoffblockaden-und-antagonismen"],
  },
  {
    slug: "calciummangel",
    title: "Calciummangel bei Cannabis erkennen und beheben",
    summary:
      "Verkrüppelte, fleckige neue Triebe und braune Blattränder verraten Ca-Mangel. So erkennst du, dass das Problem fast immer in pH und Wasserqualität liegt — nicht in der Ca-Dosis.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-06-02",
    tags: ["Calcium", "Cal-Mag", "pH", "Nährstoffmangel", "Diagnose"],
    keyTakeaways: [
      "Calcium ist IMMOBIL: Mangel zeigt sich zuerst an den JUNGEN, oberen Blättern und Wuchsspitzen — genau umgekehrt zu N und Mg.",
      "Typisch sind kleine braune/rostige Flecken, verkrüppelte neue Triebe und hakenförmig verformte junge Blätter.",
      "Hauptursache ist RO-/Weichwasser ohne Cal-Mag oder ein pH außerhalb 6.2–6.8 (Erde) bzw. 5.8–6.2 (Coco/Hydro).",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Fleckige, verkrüppelte JUNGE Triebe" },
      { label: "Mobilität", value: "Immobil (oben zuerst)" },
      { label: "Risikowasser", value: "RO/Weich, < 40 mg/L Ca" },
      { label: "Ziel-Ca (Lösung)", value: "ca. 120–180 mg/L" },
      { label: "Schnellkorrektur", value: "Cal-Mag-Zusatz + pH richten" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Calciummangel ist die Unterversorgung mit Ca²⁺. Calcium stabilisiert Zellwände (Calciumpektat) und steuert Signalprozesse — es ist für jedes neue Gewebe unverzichtbar.",
          "Weil Ca mit dem Transpirationsstrom transportiert wird und nicht rückverlagerbar ist, treffen Mängel zuerst die jüngsten, am wenigsten transpirierenden Organe.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Ca²⁺ vernetzt Pektine der Mittellamelle und hält Zellwände stabil. Fehlt Ca, kollabieren neu gebildete Zellen — daher die verkrüppelten, fleckigen jungen Blätter.",
          "Ca ist außerdem Second Messenger für Stressantworten; Mangel schwächt die Abwehr gegen Pathogene und physiologischen Stress.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Mobilität",
        content: [
          "Ca wird ausschließlich xylem-aufwärts mit dem Wasserstrom transportiert und kann nicht aus alten Blättern in junge umverteilt werden — es ist immobil.",
          "Deshalb ist die Lokalisation (oben/jung) das entscheidende Diagnosemerkmal, das Ca von den mobilen Nährstoffen (N, Mg, K) trennt.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1: Kleine, unregelmäßige rostbraune Sprenkel auf jungen Blättern, leicht eingerollte oder hakenförmige Blattspitzen.",
          "Stadium 2: Verformte, verkrüppelte Neutriebe, abgestorbene Wuchsspitzen, schwache Stängel.",
          "Stadium 3 (Blüte): 'Bud Rot'-Anfälligkeit steigt, einzelne Blüten bleiben unterentwickelt; in Frucht/Knospe treten nekrotische Stellen auf.",
        ],
        checklist: [
          "Sitzen Symptome oben/jung? → Hinweis auf Ca (oder Fe/B)",
          "Verkrüppelte/hakenförmige Neutriebe?",
          "Wasserquelle: RO/Weichwasser ohne Cal-Mag?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Weiches/RO-Wasser ohne Cal-Mag — die mit Abstand häufigste Ursache in Coco/Hydro.",
          "2. pH-Blockade: pH unter dem Ca-Fenster (Erde < 6.2, Coco/Hydro < 5.8) sperrt die Aufnahme.",
          "3. Niedrige Transpiration: hohe Luftfeuchte/niedriges VPD reduziert den Wasserstrom und damit den Ca-Transport in junge Blätter.",
          "4. Antagonismus: Übermäßiges K oder NH4⁺ verdrängt Ca an der Wurzel.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Lokalisation prüfen. Symptome oben/jung → Ca, Fe oder B; unten/alt → eher N/Mg/K.",
          "Schritt 2: Verkrüppelte Neutriebe + braune Sprenkel → Ca wahrscheinlich (Fe wäre interveinal-chlorotisch ohne Verkrüppelung).",
          "Schritt 3: Wasseranalyse/Quelle prüfen. RO/Weichwasser ohne Zusatz → Ca-Unterversorgung sehr wahrscheinlich.",
          "Schritt 4: pH und VPD prüfen — beide beeinflussen die Ca-Versorgung stark.",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. Cal-Mag-Zusatz einsetzen: Ziel ca. 120–180 mg/L Ca in der fertigen Lösung; bei RO-Wasser von Beginn an dosieren.",
          "2. pH in den Korridor bringen (Erde 6.2–6.8, Coco/Hydro 5.8–6.2).",
          "3. VPD optimieren: ausreichende, aber nicht extreme Transpiration sichert den Ca-Transport in die Spitzen.",
          "4. K- und Ammoniumüberschuss reduzieren, um Antagonismus zu entschärfen.",
        ],
        checklist: [
          "Cal-Mag bei RO/Weichwasser dauerhaft einplanen",
          "pH richten",
          "VPD nicht zu niedrig fahren",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Bei RO- oder sehr weichem Leitungswasser ist Cal-Mag Standard, nicht Notfallmaßnahme.",
          "Halte VPD im Zielbereich, damit der Transpirationsstrom Ca verlässlich in die Wuchsspitzen trägt.",
          "Vermeide aggressive K-Boosts in der Blüte ohne Ca-Begleitung.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Ca-Transport hängt direkt an der Transpiration: zu hohe Luftfeuchte (sehr niedriges VPD) kann selbst bei ausreichender Ca-Dosis zu lokalem Mangel in jungen Blättern führen.",
          "Ca, Mg und K konkurrieren; ein Ca:Mg-Verhältnis um 3:1 bis 4:1 ist ein robuster Richtwert.",
          "Ca-Mangel erhöht die Anfälligkeit für Botrytis (Bud Rot), weil schwache Zellwände leichter penetriert werden.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "RO-Wasser ohne Cal-Mag verwenden und dann am Dünger 'herumdoktern'.",
          "Symptome an jungen Blättern fälschlich als Stickstoffmangel behandeln.",
          "VPD/Klima ignorieren, obwohl die Transpiration die eigentliche Stellschraube ist.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Lokaler Ca-Mangel in der Knospe (trotz guter Lösung) ist fast immer ein Transpirations-/Klimaproblem, kein Dosierungsproblem.",
          "Blattanalysen unter ~1.5 % Ca der Trockenmasse gelten als grenzwertig.",
        ],
      },
    ],
    warnings: [
      "Calciummangel schwächt Zellwände und erhöht das Risiko für Bud Rot — in der Blüte besonders kritisch.",
      "Mehr Ca ohne pH-/Klimakorrektur löst das Problem nicht, wenn die Ursache Transpiration oder pH ist.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum oben zuerst?",
        text: "Calcium kann nicht in der Pflanze umziehen. Es fließt nur mit dem Wasser nach oben. Bei Knappheit fehlt es deshalb zuerst den jüngsten Blättern.",
      },
      {
        title: "Kurz erklärt: RO-Wasser",
        text: "Umkehrosmose-Wasser enthält fast kein Calcium. Wer es nutzt, muss Cal-Mag von Anfang an zugeben.",
      },
    ],
    faq: [
      {
        question: "Ich nutze RO-Wasser und habe fleckige neue Blätter — was tun?",
        answer:
          "Das ist ein klassischer Cal-Mag-Mangel. Dosiere einen Cal-Mag-Zusatz auf ca. 120–180 mg/L Ca und prüfe den pH. Symptome an neuen Trieben bessern sich beim Neuaustrieb.",
      },
      {
        question: "Kann zu hohe Luftfeuchte Calciummangel auslösen?",
        answer:
          "Ja. Bei sehr niedrigem VPD transpiriert die Pflanze kaum, und Calcium gelangt nicht in die jungen Blätter — obwohl die Nährlösung genug enthält.",
      },
    ],
    glossary: [
      { term: "Immobil", definition: "Ein Nährstoff, den die Pflanze nicht aus alten in junge Organe umverteilen kann." },
      { term: "Transpirationsstrom", definition: "Der durch Verdunstung getriebene Wasserfluss von der Wurzel in die Blätter, der Calcium mittransportiert." },
      { term: "Cal-Mag", definition: "Zusatzdünger mit Calcium und Magnesium, vor allem für weiches/RO-Wasser." },
    ],
    sourceIds: ["marschner-mineral-nutrition", "bryson-plant-nutrition-manual", "bernal-cannabis-nutrient-requirements"],
    relatedSlugs: ["magnesiummangel", "naehrstoffblockaden-und-antagonismen", "bud-rot-botrytis", "vpd-einfach-erklaert"],
  },
  {
    slug: "kaliummangel",
    title: "Kaliummangel bei Cannabis erkennen und beheben",
    summary:
      "Verbrannte, nekrotische Blattränder an älteren Blättern bei sonst grüner Blattfläche sind das Leitsymptom. So unterscheidest du K-Mangel von Salzverbrennung (Nährstoff-Burn).",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-06-02",
    tags: ["Kalium", "Blattrand", "Nekrose", "Nährstoffmangel", "Diagnose"],
    keyTakeaways: [
      "Kalium ist mobil: Mangel beginnt an älteren Blättern mit verbrannten, nach oben gerollten und nekrotischen RÄNDERN, während die Blattmitte länger grün bleibt.",
      "Verwechslungsgefahr mit Nährstoff-Burn (zu hohe EC) — beim K-Mangel ist die EC eher niedrig, beim Burn hoch.",
      "Korrigiere über phasengerechte K-Zufuhr (Blütedünger) und prüfe pH sowie Antagonismus durch zu viel Ca/Mg.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Verbrannte Blattränder, ältere Blätter" },
      { label: "Mobilität", value: "Mobil (unten zuerst)" },
      { label: "Hauptverwechslung", value: "Nährstoff-Burn (hohe EC)" },
      { label: "pH-Fenster K", value: "6.0–6.8 (Erde), 5.8–6.2 (Coco/Hydro)" },
      { label: "Bedarf hoch in", value: "Blüte (Knospenfüllung)" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Kaliummangel ist die Unterversorgung mit K⁺. Kalium reguliert den osmotischen Druck, die Spaltöffnungen (Stomata) und den Transport von Zuckern — entscheidend für Wasserhaushalt und Knospenfüllung.",
          "Der K-Bedarf steigt in der Blüte stark an, weil Kalium den Assimilattransport in die Blüten steuert.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "K⁺ ist das häufigste Kation im Cytoplasma und steuert den Turgor der Schließzellen. Bei Mangel schließen Stomata schlecht, die Wassernutzung wird ineffizient und die Ränder vertrocknen.",
          "Kalium aktiviert zahlreiche Enzyme der Zuckersynthese; fehlt es, sinken Ertrag und Knospendichte.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Mobilität",
        content: [
          "K ist phloemmobil und wird aus alten Blättern abgezogen. Der Mangel startet an den Rändern älterer Blätter, weil dort die Versorgung als erstes abreißt.",
          "Typisch ist die Reihenfolge: Randchlorose → braune, 'verbrannte' Ränder → nach oben gerollte, nekrotische Blattränder, während die Blattmitte noch grün ist.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1: Blassgelbe Ränder und Spitzen älterer Blätter, leichtes Aufwärtsrollen.",
          "Stadium 2: Braune, trockene 'verbrannt' wirkende Ränder mit rostigen Flecken, Blattmitte bleibt grün.",
          "Stadium 3: Großflächige Randnekrose, schwache Stängel, lockere Knospen, erhöhte Anfälligkeit für Schädlinge.",
        ],
        checklist: [
          "Ränder verbrannt, Mitte grün? → K-Mangel typisch",
          "Ältere Blätter zuerst betroffen?",
          "EC eher niedrig (kein Burn)?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Unterversorgung in der Blüte: zu wenig K-betonter Dünger trotz hohem Blütebedarf.",
          "2. Antagonismus: Überschuss an Ca²⁺, Mg²⁺ oder Na⁺ verdrängt K an der Wurzel.",
          "3. pH-Blockade außerhalb des K-Fensters.",
          "4. Auswaschung in Coco/Hydro durch Überwässerung.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Lokalisation. Ränder älterer Blätter verbrannt, Mitte grün → K-Mangel-Muster.",
          "Schritt 2: EC messen. Niedrig → Unterversorgung (K-Mangel); hoch → eher Nährstoff-Burn statt Mangel.",
          "Schritt 3: Rezeptur prüfen — viel Ca/Mg ohne genügend K → Antagonismus.",
          "Schritt 4: pH kontrollieren und in den Korridor bringen.",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. K-betonten Blütedünger phasengerecht einsetzen; EC in kleinen Schritten anheben.",
          "2. Antagonismus reduzieren: Ca/Mg nicht überdosieren, Verhältnis prüfen.",
          "3. pH in den Korridor bringen (Erde 6.0–6.8, Coco/Hydro 5.8–6.2).",
          "4. Bei Auswaschung Bewässerungsfrequenz und -menge anpassen.",
        ],
        checklist: [
          "EC prüfen, um Mangel von Burn zu trennen",
          "Ca:K- und Mg:K-Verhältnis kontrollieren",
          "Neuaustrieb beobachten",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Folge der EC-/NPK-Kurve für die Blüte mit ausreichendem K-Anteil.",
          "Vermeide pauschale Cal-Mag-Überdosierung, die K verdrängt.",
          "Halte das Bewässerungsregime so, dass kein ständiges Auswaschen erfolgt.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Hohe Natriumlast (salziges Leitungswasser) konkurriert direkt mit K und kann Mangel auslösen.",
          "Lichtstress und Hitze erhöhen den K-Bedarf, weil Stomata-Regulation und Wassernutzung stärker gefordert sind.",
          "Zu viel K wiederum unterdrückt die Mg- und Ca-Aufnahme — das Verhältnis ist entscheidend.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "K-Mangel mit Nährstoff-Burn verwechseln und die Düngung senken, obwohl sie erhöht werden müsste (oder umgekehrt).",
          "Cal-Mag dauerhaft überdosieren und damit K verdrängen.",
          "Nur die Ränder betrachten, ohne EC und pH zu messen.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "In der mittleren bis späten Blüte ist ein moderater K-Schwerpunkt sinnvoll, aber Überdosierung 'verbrennt' ebenfalls die Ränder (Salzstress) — das Symptom kann von beiden Seiten kommen.",
          "Blattgehalte unter ~1.5 % K der Trockenmasse gelten als defizitär.",
        ],
      },
    ],
    warnings: [
      "K-Mangel und Nährstoff-Burn sehen an den Rändern ähnlich aus — ohne EC-Messung riskierst du, in die falsche Richtung zu korrigieren.",
      "Aggressive K-Booster können selbst Randverbrennungen durch Salzstress verursachen.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Rand verbrannt, Mitte grün",
        text: "Das ist das klassische Kalium-Muster an alten Blättern. Bei Stickstoffmangel vergilbt dagegen das ganze Blatt.",
      },
      {
        title: "Kurz erklärt: Mangel oder Burn?",
        text: "Niedrige EC und verbrannte Ränder = Mangel. Hohe EC und verbrannte Spitzen/Ränder = Überdüngung (Burn). Immer die EC messen.",
      },
    ],
    faq: [
      {
        question: "Wie unterscheide ich Kaliummangel von Überdüngung?",
        answer:
          "Miss die EC. Bei niedriger EC und Rand-Nekrose an alten Blättern ist es Mangel. Bei hoher EC und verbrannten Spitzen ist es Nährstoff-Burn. Das Symptombild allein reicht nicht.",
      },
      {
        question: "Warum tritt K-Mangel oft erst in der Blüte auf?",
        answer:
          "Weil der Kaliumbedarf für die Knospenfüllung stark ansteigt. Eine Düngung, die in der Vegetation reichte, kann in der Blüte zu knapp werden.",
      },
    ],
    glossary: [
      { term: "Nekrose", definition: "Absterben von Gewebe, sichtbar als braune, trockene Bereiche." },
      { term: "Nährstoff-Burn", definition: "Verbrennungsschäden durch zu hohe Salz-/Düngerkonzentration (hohe EC)." },
      { term: "Turgor", definition: "Der durch Wasser erzeugte Innendruck der Zellen, mitgesteuert durch Kalium." },
    ],
    sourceIds: ["marschner-mineral-nutrition", "bryson-plant-nutrition-manual", "bernal-cannabis-nutrient-requirements"],
    relatedSlugs: ["stickstoffmangel", "naehrstoffblockaden-und-antagonismen", "naehrstoffbedarf-cannabis-lebenszyklus", "magnesiummangel"],
  },
  {
    slug: "eisenmangel",
    title: "Eisenmangel bei Cannabis erkennen und beheben",
    summary:
      "Leuchtend gelbe junge Blätter mit scharf abgegrenzten grünen Adern sind das Leitsymptom. Fast immer ist nicht zu wenig Eisen, sondern ein zu hoher pH die wahre Ursache.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-06-02",
    tags: ["Eisen", "Chlorose", "pH", "Nährstoffmangel", "Diagnose"],
    keyTakeaways: [
      "Eisen ist immobil: Mangel zeigt sich an den JÜNGSTEN Blättern als leuchtend gelbe interveinale Chlorose mit scharf grünen Adern.",
      "Die mit Abstand häufigste Ursache ist ein zu HOHER Wurzel-pH (> 6.5 Coco/Hydro, > 7.0 Erde), der Eisen ausfällt — nicht echte Knappheit.",
      "Korrigiere primär den pH nach unten; Fe-Chelat (DTPA/EDDHA) hilft nur, wenn der pH zuvor gerichtet ist.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Leuchtgelbe junge Blätter, grüne Adern" },
      { label: "Mobilität", value: "Immobil (oben/jung zuerst)" },
      { label: "Hauptursache", value: "pH zu HOCH" },
      { label: "Ziel-pH (Coco/Hydro)", value: "5.8–6.2" },
      { label: "Chelat-Wahl", value: "EDDHA bei hohem pH, DTPA mittel" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Eisenmangel ist die fehlende Verfügbarkeit von Fe für die Chlorophyllsynthese. Fast immer handelt es sich um eine pH-induzierte Blockade, nicht um eine echte Unterversorgung.",
          "Das Symptombild ähnelt Mg-Mangel — der entscheidende Unterschied ist die Lokalisation: Fe trifft die JUNGEN Blätter oben, Mg die alten unten.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Fe ist Cofaktor der Chlorophyllsynthese und vieler Redoxenzyme. Bei hohem pH fällt Eisen als unlösliches Fe(III)-Hydroxid aus und wird für die Wurzel unverfügbar.",
          "Chelate halten Eisen löslich: EDDHA bleibt bis pH ~9 stabil, DTPA bis ~7.5, EDTA nur bis ~6.5 — die Chelatwahl muss zum pH passen.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Mobilität",
        content: [
          "Fe ist immobil und kann nicht rückverlagert werden; deshalb erscheint Mangel an den jüngsten Blättern, die laufend neues Chlorophyll bilden müssen.",
          "Charakteristisch ist die sehr helle, fast neongelbe interveinale Chlorose mit messerscharf grün bleibenden Adern.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1: Leichte Aufhellung der jüngsten Blätter, Adern deutlich grün abgesetzt.",
          "Stadium 2: Junge Blätter leuchtend gelb, fast weiß zwischen den Adern; Wuchs verlangsamt.",
          "Stadium 3: Neue Blätter bleiben klein und bleich, Spitzen können nekrotisch werden.",
        ],
        checklist: [
          "Sitzt die Chlorose an den JÜNGSTEN Blättern?",
          "Sind die Adern scharf grün?",
          "Ist der Wurzel-pH zu hoch?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. pH zu hoch (Hauptursache): Wurzel-pH > 6.5 (Coco/Hydro) bzw. > 7.0 (Erde) fällt Eisen aus.",
          "2. Überwässerung/kalte, nasse Wurzeln: schlechte Sauerstoffversorgung reduziert die Fe-Aufnahme.",
          "3. Antagonismus: sehr hohe P-, Mn- oder Zn-Gehalte hemmen Eisen.",
          "4. Echte Knappheit: nur in stark ausgewaschenen, eisenarmen Substraten.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Lokalisation. Junge Blätter betroffen → Fe (oder Ca/B). Alte Blätter → Mg.",
          "Schritt 2: Adern scharf grün, Gewebe neongelb → Fe-typisch.",
          "Schritt 3: Wurzel-pH messen. Zu hoch → pH-induzierte Fe-Blockade, primär pH senken.",
          "Schritt 4: Wurzelzone auf Staunässe prüfen; nasse, kalte Wurzeln verschärfen Fe-Mangel.",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. pH senken in den Zielkorridor (Coco/Hydro 5.8–6.2, Erde 6.2–6.8) — meist verschwindet der 'Mangel' allein dadurch.",
          "2. Fe-Chelat passend zum pH wählen: bei hartnäckig hohem pH EDDHA, sonst DTPA.",
          "3. Wurzelzone belüften: Überwässerung beenden, Substrat zwischen den Gaben abtrocknen lassen.",
          "4. Phosphor-/Mikronährstoff-Überschüsse zurückfahren.",
        ],
        checklist: [
          "pH zuerst senken",
          "Chelat zum pH passend wählen",
          "Staunässe beseitigen",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Halte den Wurzel-pH stabil im unteren Korridor; in Coco/Hydro ist das die wichtigste Maßnahme gegen Fe-Mangel.",
          "Vermeide dauernasse Substrate und sorge für Sauerstoff an den Wurzeln.",
          "Verwende ausgewogene Mikronährstoffe statt einseitiger P-Booster.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Niedrige Wurzeltemperaturen und Staunässe verschärfen Fe-Mangel deutlich.",
          "Hohe Phosphatgaben (PK-Booster in der Blüte) können Eisen ausfällen und Mangel provozieren.",
          "Fe-, Mn- und Zn-Aufnahme sind eng gekoppelt; ein Ungleichgewicht in einem Mikronährstoff stört die anderen.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Fe-Mangel mit Mg-Mangel verwechseln (Lokalisation prüfen!) und das falsche Element dosieren.",
          "Mehr Eisen geben, ohne den zu hohen pH zu senken — das Eisen fällt sofort wieder aus.",
          "PK-Booster in der Blüte überdosieren und damit Eisen blockieren.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "EDDHA-Chelat ist tiefrot und färbt die Lösung; das ist normal und zeigt die hohe pH-Stabilität dieses Chelats.",
          "Wenn trotz korrektem pH und Chelat der Mangel bleibt, ist meist die Wurzelgesundheit (Pythium, Staunässe) das eigentliche Problem.",
        ],
      },
    ],
    warnings: [
      "Eisenmangel ist fast immer ein pH-Problem — wer nur mehr Eisen gibt, ohne den pH zu senken, behandelt das Symptom statt der Ursache.",
      "Anhaltender Fe-Mangel trotz korrekter Nährlösung deutet auf kranke oder erstickte Wurzeln hin.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Eisen vs. Magnesium",
        text: "Beide machen gelbe Blätter mit grünen Adern. Eisen trifft die JUNGEN oberen Blätter, Magnesium die ALTEN unteren. Die Lage entscheidet.",
      },
      {
        title: "Kurz erklärt: pH zu hoch",
        text: "Ist der Wurzel-pH zu hoch, fällt Eisen aus und ist nicht mehr aufnehmbar. Erst den pH senken, dann erst über Eisen nachdenken.",
      },
    ],
    faq: [
      {
        question: "Meine neuen Blätter sind neongelb mit grünen Adern — Eisen oder Magnesium?",
        answer:
          "Sitzt es an den jüngsten oberen Blättern, ist es Eisen. An den unteren alten Blättern ist es Magnesium. Bei Eisen ist fast immer der pH zu hoch.",
      },
      {
        question: "Welches Eisen-Chelat soll ich nehmen?",
        answer:
          "Richte dich nach dem pH: Bei hartnäckig hohem pH EDDHA (stabil bis ~9), im mittleren Bereich DTPA. EDTA ist nur bis pH ~6.5 zuverlässig.",
      },
    ],
    glossary: [
      { term: "Chelat", definition: "Organischer Komplexbildner, der Metallionen wie Eisen löslich und pflanzenverfügbar hält." },
      { term: "EDDHA", definition: "Sehr pH-stabiles Eisenchelat (bis pH ~9), tiefrot gefärbt." },
      { term: "pH-induzierte Blockade", definition: "Nährstoff ist vorhanden, aber durch ungünstigen pH chemisch nicht aufnehmbar." },
    ],
    sourceIds: ["marschner-mineral-nutrition", "bryson-plant-nutrition-manual", "bernal-cannabis-nutrient-requirements"],
    relatedSlugs: ["magnesiummangel", "naehrstoffblockaden-und-antagonismen", "wurzelfaeule", "calciummangel"],
  },
  // ===========================================================================
  // WAVE 2 – SCHÄDLINGE
  // ===========================================================================
  {
    slug: "spinnmilben",
    title: "Spinnmilben bei Cannabis erkennen und bekämpfen",
    summary:
      "Feine Sprenkel auf der Blattoberseite und Gespinste auf der Unterseite verraten Spinnmilben. So erkennst du den Befall früh und stoppst die explosive Vermehrung mit gestaffeltem IPM.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 10,
    lastUpdated: "2026-06-02",
    tags: ["Spinnmilben", "Schädlinge", "IPM", "Tetranychus", "Diagnose"],
    keyTakeaways: [
      "Leitsymptom sind winzige helle Sprenkel (Stippling) auf der Blattoberseite; auf der Unterseite sitzen die Milben mit feinen Gespinsten.",
      "Bei 27–30 °C und niedriger Luftfeuchte verdoppelt sich die Population in Tagen — Früherkennung mit Lupe ist entscheidend.",
      "Bekämpfe gestaffelt: Klima ändern (kühler, feuchter), mechanisch reduzieren, Raubmilben einsetzen, bei Bedarf Wirkstoffe rotieren — niemals in der Spätblüte sprühen.",
    ],
    quickFacts: [
      { label: "Erreger", value: "Tetranychus urticae u. a." },
      { label: "Leitsymptom", value: "Stippling oben, Gespinst unten" },
      { label: "Risikoklima", value: "Warm (27–30 °C), trocken" },
      { label: "Generationszeit", value: "Bei Hitze ~5–7 Tage" },
      { label: "Nützling", value: "Phytoseiulus persimilis" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Spinnmilben sind keine Insekten, sondern Spinnentiere (< 0.5 mm). Sie saugen Zellinhalt aus, wodurch die typischen hellen Punkte entstehen.",
          "Cannabis ist besonders anfällig in warmen, trockenen Indoor-Setups; ein unbemerkter Anfangsbefall kann eine ganze Ernte gefährden.",
        ],
      },
      {
        heading: "Biologie und Lebenszyklus",
        content: [
          "Aus Eiern schlüpfen Larven, dann Nymphen, dann adulte Milben; bei 30 °C dauert ein Zyklus nur ~5–7 Tage, bei 20 °C deutlich länger.",
          "Ein einzelnes Weibchen legt über hundert Eier. Diese exponentielle Vermehrung erklärt, warum ein scheinbar kleiner Befall binnen einer Woche eskaliert.",
        ],
      },
      {
        heading: "Schadbild und Symptome nach Schweregrad",
        content: [
          "Stadium 1: Vereinzelte helle Sprenkel auf Blattoberseiten, mit der Lupe einzelne bewegliche Punkte auf der Unterseite.",
          "Stadium 2: Flächiges Stippling, Blätter wirken bronzefarben/silbrig, erste feine Gespinste in Blattachseln.",
          "Stadium 3: Dichte Gespinste über Blättern und Knospen, Blattfall, drastischer Vitalitätsverlust; Knospen werden unverkäuflich.",
        ],
        checklist: [
          "Blattunterseiten mit Lupe (20–60×) absuchen",
          "Weißes Papier unter geschüttelte Blätter halten — wandernde Punkte?",
          "Gespinste an Trieben und Blattachseln?",
        ],
      },
      {
        heading: "Diagnose — Abgrenzung",
        content: [
          "Stippling + Gespinst auf der Unterseite → Spinnmilben (nicht Thripse: deren Schaden ist silbrig-streifig mit schwarzen Kotpünktchen, ohne Gespinst).",
          "Nährstoffsprenkel sind statisch und folgen oft einem Mangelmuster; Milbenschaden breitet sich aktiv aus und zeigt bewegliche Tiere.",
          "Lupe ist Pflicht: Eier (runde, perlige Kugeln) und bewegliche Milben auf der Unterseite bestätigen die Diagnose.",
        ],
      },
      {
        heading: "Bekämpfung — gestaffeltes IPM",
        content: [
          "1. Sofort isolieren: befallene Pflanzen trennen, Hygiene verschärfen (Kleidung, Werkzeuge).",
          "2. Klima umstellen: Spinnmilben hassen kühlere, feuchtere Luft — Temperatur senken, Luftfeuchte anheben.",
          "3. Mechanisch reduzieren: stark befallene Blätter entfernen, abduschen/absprühen der Unterseiten.",
          "4. Biologisch: Raubmilben (Phytoseiulus persimilis, Amblyseius) ausbringen, solange die Population noch nicht explodiert ist.",
          "5. Wirkstoffe nur in Vegetation/Frühblüte und im Rotationsprinzip — Resistenzen entstehen schnell bei Monotherapie.",
        ],
        checklist: [
          "Befallene Pflanzen isolieren",
          "Klima auf milbenfeindlich umstellen",
          "Raubmilben früh einsetzen",
          "Wirkstoffe rotieren, nie in Spätblüte",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Neue Pflanzen/Stecklinge konsequent in Quarantäne (mind. 1 Woche) und mit Lupe kontrollieren.",
          "Klima nicht dauerhaft heiß und trocken fahren; stabile Luftfeuchte erschwert die Vermehrung.",
          "Regelmäßiges Scouting der Blattunterseiten zur Routine machen — wöchentlich, mit Lupe.",
        ],
      },
      {
        heading: "Umweltfaktoren und Wechselwirkungen",
        content: [
          "Hohe Temperatur und niedriges VPD/trockene Luft beschleunigen die Vermehrung enorm — Klimakontrolle ist die wirksamste Dauerprävention.",
          "Stress (Trockenheit, Nährstoffmangel) macht Pflanzen attraktiver und anfälliger für Befall.",
          "In der Blüte erhöhen abgestorbene, vermilbte Blätter zugleich das Schimmelrisiko (Botrytis).",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Erst handeln, wenn Gespinste sichtbar sind — dann ist die Population bereits explodiert.",
          "Nur ein Mittel wiederholt einsetzen → schnelle Resistenz.",
          "Blattoberseiten besprühen, aber die Unterseiten (wo die Milben sitzen) auslassen.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Eine vorbeugende Etablierung von Raubmilben ('Bank') in der Vegetation ist deutlich wirksamer als kurative Einsätze bei starkem Befall.",
          "Resistenzmanagement: Wirkstoffklassen (IRAC-Gruppen) bewusst rotieren und nie zwei aufeinanderfolgende Generationen mit demselben Wirkmechanismus behandeln.",
        ],
      },
    ],
    warnings: [
      "Niemals in der Spätblüte auf die Knospen sprühen — Rückstände und Feuchtigkeit ruinieren die Ernte und fördern Botrytis.",
      "Spinnmilben entwickeln schnell Resistenzen; eine Monotherapie macht den Befall langfristig schlimmer.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum Lupe?",
        text: "Spinnmilben sind kleiner als ein halber Millimeter. Ohne Lupe siehst du erst den Schaden — und dann ist es oft schon spät. Wöchentliches Absuchen der Blattunterseiten lohnt sich.",
      },
      {
        title: "Kurz erklärt: Klima als Waffe",
        text: "Milben lieben heiß und trocken. Kühlere, feuchtere Luft bremst ihre Vermehrung spürbar — das ist die einfachste Dauerprävention.",
      },
    ],
    faq: [
      {
        question: "Wie unterscheide ich Spinnmilben von Thripsen?",
        answer:
          "Spinnmilben hinterlassen punktförmiges Stippling und feine Gespinste auf der Blattunterseite. Thripse erzeugen silbrige Schlieren/Streifen mit kleinen schwarzen Kotpunkten und KEIN Gespinst.",
      },
      {
        question: "Kann ich in der Blüte noch etwas tun?",
        answer:
          "In der Frühblüte ja (Raubmilben, Klima, mechanisch). In der Spätblüte darfst du nicht mehr auf die Knospen sprühen — dann hilft nur Klimakontrolle, Nützlinge und das Entfernen stark befallener Blätter.",
      },
    ],
    glossary: [
      { term: "Stippling", definition: "Punktförmige helle Sprenkelung der Blattoberseite durch Saugschäden." },
      { term: "IPM", definition: "Integriertes Pflanzenschutz-Management: Kombination aus Vorbeugung, Monitoring, Nützlingen und gezielten Wirkstoffen." },
      { term: "Raubmilbe", definition: "Nützliche Milbe (z. B. Phytoseiulus persimilis), die Spinnmilben frisst." },
    ],
    sourceIds: ["tetranychus-twospotted-mite", "ipm-cannabis-arthropods", "punja-cannabis-pathogens"],
    relatedSlugs: ["integrierte-schaedlingspraevention-grow", "thripse", "trauermuecken", "bud-rot-botrytis"],
  },
  {
    slug: "thripse",
    title: "Thripse bei Cannabis erkennen und bekämpfen",
    summary:
      "Silbrige Schlieren mit schwarzen Kotpünktchen sind das Leitsymptom. So unterscheidest du Thripse von Spinnmilben und bekämpfst die fliegenden Larven mit Blautafeln und Nützlingen.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-06-02",
    tags: ["Thripse", "Schädlinge", "IPM", "Frankliniella", "Diagnose"],
    keyTakeaways: [
      "Leitsymptom sind silbrig glänzende, streifige Saugstellen mit winzigen schwarzen Kotpünktchen — KEIN Gespinst (Unterschied zu Spinnmilben).",
      "Thripse durchlaufen ein Bodenstadium (Puppe im Substrat), weshalb reine Blattbehandlung oft scheitert.",
      "Kombiniere Blautafeln (Monitoring/Fang), Raubmilben (Amblyseius) und Nematoden gegen die Bodenstadien.",
    ],
    quickFacts: [
      { label: "Erreger", value: "Frankliniella/Thrips spp." },
      { label: "Leitsymptom", value: "Silbrige Streifen + schwarze Kotpunkte" },
      { label: "Fangfarbe", value: "Blautafeln" },
      { label: "Versteckter Lebensabschnitt", value: "Puppe im Substrat" },
      { label: "Nützlinge", value: "Amblyseius, Nematoden" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Thripse sind schlanke, 1–2 mm lange Insekten, die mit raspelnd-saugendem Mundwerkzeug Zellinhalt entnehmen. Larven sind blassgelb, Adulte dunkler und flugfähig.",
          "Sie sind nicht nur Saugschädling, sondern können auch Viren übertragen — frühe Kontrolle ist deshalb doppelt wichtig.",
        ],
      },
      {
        heading: "Biologie und Lebenszyklus",
        content: [
          "Der Zyklus läuft Ei → zwei Larvenstadien (am Blatt) → zwei Puppenstadien (meist im Substrat) → Adult. Das Bodenstadium ist der Grund, warum reine Blattsprays die Population nicht ausrotten.",
          "Bei Wärme dauert ein Zyklus etwa 2–3 Wochen; durchgehende Generationen überlappen sich.",
        ],
      },
      {
        heading: "Schadbild und Symptome nach Schweregrad",
        content: [
          "Stadium 1: Einzelne silbrig-glänzende Flecken/Schlieren, vereinzelte schwarze Kotpünktchen.",
          "Stadium 2: Streifige silbrig-bronzene Saugflächen, deformierte neue Blätter, fliegende Adulte beim Stören sichtbar.",
          "Stadium 3: Großflächige Verbräunung, Wachstumsstörungen, in der Blüte Schäden an Blütenblättern und Qualitätsverlust.",
        ],
        checklist: [
          "Silbrige Streifen statt punktförmigem Stippling?",
          "Schwarze Kotpünktchen vorhanden?",
          "Blautafeln aufgehängt und kontrolliert?",
        ],
      },
      {
        heading: "Diagnose — Abgrenzung",
        content: [
          "Silbrig-streifige Flächen + schwarze Kotpunkte, KEIN Gespinst → Thripse (Spinnmilben: punktförmiges Stippling MIT Gespinst).",
          "Blautafeln fangen adulte Thripse und bestätigen den Befall; Gelbtafeln fangen eher Trauermücken/Weiße Fliege.",
          "Beim Anstoßen der Pflanze fliegen Adulte kurz auf — ein guter Schnelltest.",
        ],
      },
      {
        heading: "Bekämpfung — gestaffeltes IPM",
        content: [
          "1. Monitoring/Fang: Blautafeln dicht über dem Canopy aufhängen, um Adulte zu fangen und die Befallsstärke zu messen.",
          "2. Bodenstadien angreifen: Raubmilben (Amblyseius/Stratiolaelaps) auf das Substrat, ggf. entomopathogene Nematoden gegen Puppen.",
          "3. Blattlarven reduzieren: Nützlinge auf den Blättern etablieren; mechanisch stark befallene Blätter entfernen.",
          "4. Wirkstoffe rotieren und nur in Vegetation/Frühblüte; Bodenstadium beachten, sonst Wiederbefall.",
        ],
        checklist: [
          "Blautafeln zum Monitoring",
          "Nützlinge für Blatt UND Boden",
          "Stark befallene Blätter entfernen",
          "Wirkstoffe rotieren, nicht in Spätblüte",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Quarantäne für neue Pflanzen und Substrate; Thripse kommen oft mit Stecklingen oder Erde herein.",
          "Blautafeln dauerhaft als Frühwarnsystem im Raum belassen.",
          "Insektenschutz an Zu-/Abluft, um Zuflug zu begrenzen.",
        ],
      },
      {
        heading: "Umweltfaktoren und Wechselwirkungen",
        content: [
          "Warmes, trockenes Klima begünstigt Thripse; stabile Luftfeuchte und moderate Temperaturen verlangsamen sie.",
          "Offene Lüftung ohne Filter erleichtert den Zuflug von außen.",
          "Thripsschäden öffnen Eintrittspforten für Pathogene und können Viren übertragen.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Nur die Blätter behandeln und das Substrat-Puppenstadium ignorieren → ständiger Wiederbefall.",
          "Gelbtafeln statt Blautafeln verwenden (geringere Fangrate für Thripse).",
          "Zu spät eingreifen, wenn schon Adulte schwärmen.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Eine Kombination aus Blatt-Nützlingen (Amblyseius) und Boden-Nützlingen (Stratiolaelaps + Nematoden) deckt alle Lebensstadien ab und ist nachhaltiger als jede Spritzfolge.",
          "Bei Verdacht auf Virusübertragung sollten symptomatische Pflanzen entfernt statt nur behandelt werden.",
        ],
      },
    ],
    warnings: [
      "Thripse verpuppen sich im Substrat — wer nur Blätter behandelt, bekämpft nie die ganze Population.",
      "In der Spätblüte keine Sprays auf die Knospen; setze auf Nützlinge und Fang.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Thripse vs. Spinnmilben",
        text: "Thripse hinterlassen silbrige Streifen mit schwarzen Kotpunkten und KEIN Gespinst. Spinnmilben machen feine Punkte (Stippling) und spinnen Gespinste.",
      },
      {
        title: "Kurz erklärt: Boden nicht vergessen",
        text: "Ein Teil der Thripse lebt als Puppe im Substrat. Deshalb gehört zur Bekämpfung immer auch eine Behandlung des Bodens, nicht nur der Blätter.",
      },
    ],
    faq: [
      {
        question: "Warum kommen die Thripse trotz Behandlung immer wieder?",
        answer:
          "Weil sich die Puppen im Substrat verstecken. Wenn du nur die Blätter behandelt hast, schlüpft die nächste Generation aus dem Boden. Setze zusätzlich Bodennützlinge/Nematoden ein.",
      },
      {
        question: "Welche Klebetafeln soll ich nehmen?",
        answer:
          "Blautafeln fangen Thripse am besten. Gelbtafeln eignen sich eher für Trauermücken und Weiße Fliege.",
      },
    ],
    glossary: [
      { term: "Larvenstadium", definition: "Frühe, blassgelbe Entwicklungsstufe der Thripse am Blatt." },
      { term: "Entomopathogene Nematoden", definition: "Nützliche Fadenwürmer, die Schädlingsstadien im Boden parasitieren." },
      { term: "Blautafel", definition: "Blaue Klebefalle, die adulte Thripse besonders gut anlockt." },
    ],
    sourceIds: ["thrips-frankliniella-management", "ipm-cannabis-arthropods", "punja-cannabis-pathogens"],
    relatedSlugs: ["integrierte-schaedlingspraevention-grow", "spinnmilben", "trauermuecken", "bewaesserung-ohne-uebergiessen"],
  },
  {
    slug: "trauermuecken",
    title: "Trauermücken bei Cannabis erkennen und bekämpfen",
    summary:
      "Kleine schwarze Fliegen über dem Substrat und glänzende Larven in feuchter Erde sind die Leitsymptome. So bekämpfst du sie an der Wurzel des Problems: über das Gießregime.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 8,
    lastUpdated: "2026-06-02",
    tags: ["Trauermücken", "Schädlinge", "Substrat", "Überwässerung", "Diagnose"],
    keyTakeaways: [
      "Leitsymptom sind kleine schwarze Mücken, die über der Substratoberfläche schwirren; ihre Larven fressen feine Wurzeln in dauerfeuchter Erde.",
      "Die wahre Ursache ist fast immer ein zu nasses Substrat — die wirksamste Bekämpfung ist trockeneres Gießregime.",
      "Kombiniere Antrocknen der Oberfläche, Gelbtafeln, Bacillus thuringiensis israelensis (Bti) und Nematoden gegen die Larven.",
    ],
    quickFacts: [
      { label: "Erreger", value: "Bradysia spp." },
      { label: "Leitsymptom", value: "Schwarze Mücken über dem Substrat" },
      { label: "Wahre Ursache", value: "Dauerfeuchtes Substrat" },
      { label: "Fangfarbe", value: "Gelbtafeln" },
      { label: "Biomittel", value: "Bti, Steinernema-Nematoden" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Trauermücken sind kleine (2–4 mm) dunkle Fliegen. Die adulten Tiere sind vor allem lästig; den eigentlichen Schaden richten die Larven an, die Feinwurzeln und organisches Material in feuchter Erde fressen.",
          "Geschädigte Wurzeln öffnen Eintrittspforten für Pythium und andere Wurzelpathogene — der harmlose Lästling kann so zum Türöffner für Wurzelfäule werden.",
        ],
      },
      {
        heading: "Biologie und Lebenszyklus",
        content: [
          "Eier und Larven entwickeln sich in den oberen, feuchten Substratschichten; Larven sind durchscheinend mit schwarzer Kopfkapsel. Der Zyklus dauert je nach Temperatur ~3–4 Wochen.",
          "Feuchtigkeit und organische Substanz an der Oberfläche sind die Brutbedingungen — trockene Oberfläche unterbricht den Zyklus.",
        ],
      },
      {
        heading: "Schadbild und Symptome nach Schweregrad",
        content: [
          "Stadium 1: Wenige Mücken beim Gießen oder Stören sichtbar, keine Pflanzensymptome.",
          "Stadium 2: Viele Adulte, Sämlinge/Stecklinge kümmern, weil Feinwurzeln gefressen werden.",
          "Stadium 3: Starker Larvenbefall, Wachstumsstillstand, sekundäre Wurzelfäule durch beschädigte Wurzeln.",
        ],
        checklist: [
          "Mücken über der Erde beim Stören?",
          "Glänzende Larven in den oberen Substratschichten?",
          "Substrat dauerhaft nass?",
        ],
      },
      {
        heading: "Diagnose — Abgrenzung",
        content: [
          "Schwarze Mücken am Substrat + Larven in der Oberfläche → Trauermücken. (Fruchtfliegen schwirren eher um reife Früchte/Abfall, nicht ums Substrat.)",
          "Gelbtafeln flach über der Erde fangen Adulte und zeigen die Befallsstärke.",
          "Eine Kartoffelscheibe auf das Substrat legen: Larven sammeln sich darunter und bestätigen den Befall.",
        ],
      },
      {
        heading: "Bekämpfung — gestaffeltes IPM",
        content: [
          "1. Gießregime trockener fahren: obere 2–3 cm zwischen den Gaben abtrocknen lassen — das ist die wirksamste Einzelmaßnahme.",
          "2. Gelbtafeln auslegen, um Adulte zu fangen und die Eiablage zu reduzieren.",
          "3. Larven biologisch bekämpfen: Bacillus thuringiensis israelensis (Bti) oder Steinernema-Nematoden ins Gießwasser.",
          "4. Oberfläche abdecken (Sand/Perlite-Schicht), um Eiablage und Schlupf zu erschweren.",
        ],
        checklist: [
          "Substratoberfläche antrocknen lassen",
          "Gelbtafeln auslegen",
          "Bti/Nematoden gegen Larven",
          "Oberfläche mineralisch abdecken",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Nicht überwässern: Bewässerung an den realen Bedarf anpassen, Staunässe vermeiden.",
          "Frische Erde/Substrat bei Befallsverdacht kontrollieren; vorbeugend eine Trockenschicht oben halten.",
          "Gute Drainage und Töpfe ohne stehendes Wasser im Untersetzer.",
        ],
      },
      {
        heading: "Umweltfaktoren und Wechselwirkungen",
        content: [
          "Dauerfeuchte und schlechte Belüftung des Substrats sind die zentralen Treiber — Klima und Gießregime hängen direkt zusammen.",
          "Trauermückenlarven und Pythium begünstigen sich gegenseitig: beschädigte Wurzeln werden leichter infiziert.",
          "Warme Temperaturen verkürzen den Lebenszyklus und beschleunigen den Befall.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Nur die adulten Mücken bekämpfen (Tafeln/Spray) und die nasse Ursache ignorieren.",
          "Weiter im alten, zu nassen Rhythmus gießen.",
          "Den Zusammenhang mit Wurzelfäule unterschätzen.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Bottom-Feeding oder seltenere, dafür durchdringende Gaben halten die Oberfläche trocken und unterbrechen den Larvenzyklus nachhaltig.",
          "Bei wiederkehrendem Befall lohnt die dauerhafte Etablierung von Bodenraubmilben (Stratiolaelaps), die auch Thripspuppen mitfressen.",
        ],
      },
    ],
    warnings: [
      "Trauermücken sind ein Symptom für zu nasses Substrat — wer nur die Fliegen bekämpft, behandelt nicht die Ursache.",
      "Larvenfraß an Feinwurzeln kann Pythium-Wurzelfäule den Weg bahnen.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Gießen ist die Lösung",
        text: "Trauermücken brauchen nasse Erde. Lässt du die obere Substratschicht zwischen den Gaben abtrocknen, entziehst du den Larven die Lebensgrundlage.",
      },
      {
        title: "Kurz erklärt: Larven sind das Problem",
        text: "Die fliegenden Mücken nerven nur. Schaden machen die Larven, die im feuchten Substrat Wurzeln fressen — deshalb muss die Bekämpfung in den Boden.",
      },
    ],
    faq: [
      {
        question: "Wie werde ich Trauermücken dauerhaft los?",
        answer:
          "Reduziere die Substratfeuchte: obere 2–3 cm zwischen den Gaben abtrocknen lassen, Gelbtafeln gegen Adulte, Bti oder Nematoden gegen Larven. Ohne trockeneres Gießen kommen sie immer wieder.",
      },
      {
        question: "Sind Trauermücken wirklich gefährlich?",
        answer:
          "Für große, gesunde Pflanzen sind sie meist nur lästig. Für Sämlinge und Stecklinge sind die wurzelfressenden Larven gefährlich, und sie können Wurzelfäule begünstigen.",
      },
    ],
    glossary: [
      { term: "Bti", definition: "Bacillus thuringiensis israelensis – ein biologisches Mittel, das Mückenlarven gezielt abtötet." },
      { term: "Bottom-Feeding", definition: "Bewässerung von unten, sodass die Substratoberfläche trocken bleibt." },
      { term: "Steinernema", definition: "Gattung entomopathogener Nematoden gegen Bodenschädlinge." },
    ],
    sourceIds: ["fungus-gnats-bradysia-management", "ipm-cannabis-arthropods", "pythium-root-rot-hydroponics"],
    relatedSlugs: ["bewaesserung-ohne-uebergiessen", "wurzelfaeule", "spinnmilben", "thripse"],
  },
  // ===========================================================================
  // WAVE 3 – KRANKHEITEN
  // ===========================================================================
  {
    slug: "bud-rot-botrytis",
    title: "Bud Rot (Botrytis) bei Cannabis erkennen und verhindern",
    summary:
      "Graue, watteartige Fäule im Knospeninneren bei welken Einzelblättchen ist das Alarmsignal. Bud Rot ist nicht heilbar — diese Klimastrategie verhindert sie, bevor sie ausbricht.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 10,
    lastUpdated: "2026-06-02",
    tags: ["Bud Rot", "Botrytis", "Schimmel", "Blüte", "Diagnose"],
    keyTakeaways: [
      "Botrytis cinerea startet im Inneren dichter Knospen — erstes Zeichen sind einzelne welke, vertrocknete Blättchen mitten in einer gesunden Blüte.",
      "Befallene Knospen sind verloren und gesundheitsgefährdend; es gibt keine Heilung, nur Entfernen und Prävention.",
      "Der Haupthebel ist das Klima: relative Luftfeuchte in der Spätblüte unter ~50 %, Temperaturstürze vermeiden, Luftbewegung sichern.",
    ],
    quickFacts: [
      { label: "Erreger", value: "Botrytis cinerea" },
      { label: "Erstsymptom", value: "Welkes Einzelblättchen in der Knospe" },
      { label: "Risiko-RH (Blüte)", value: "> 55–60 %" },
      { label: "Ziel-RH Spätblüte", value: "40–50 %" },
      { label: "Heilbar?", value: "Nein — nur entfernen & vorbeugen" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Bud Rot (Grauschimmel) wird vom Pilz Botrytis cinerea verursacht. Er befällt bevorzugt dichte, feuchte Blüten und zersetzt sie von innen.",
          "Befallenes Material darf nicht konsumiert werden; die Sporen sind gesundheitlich bedenklich. Deshalb ist Prävention die einzige sinnvolle Strategie.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund / Erregerbiologie",
        content: [
          "Botrytis ist ein nekrotropher Pilz: er tötet Gewebe und lebt vom toten Material. Sporen sind nahezu allgegenwärtig und keimen bei Feuchtigkeit auf verletztem oder geschwächtem Gewebe.",
          "Dichte Knospen halten im Inneren Feuchtigkeit fest und bieten ein ideales Mikroklima — deshalb beginnt die Fäule im Kern, nicht außen.",
        ],
      },
      {
        heading: "Schadbild und Symptome nach Schweregrad",
        content: [
          "Stadium 1: Ein einzelnes welkes, vertrocknetes Zuckerblättchen mitten in einer sonst gesunden Knospe — das wichtigste Frühwarnzeichen.",
          "Stadium 2: Beim Öffnen der Knospe graubraunes, watteartiges Myzel und braun-matschiges Innengewebe.",
          "Stadium 3: Knospe zerfällt, graue Sporenmasse stäubt aus, Ausbreitung auf benachbarte Blüten.",
        ],
        checklist: [
          "Welke Einzelblättchen in dichten Knospen suchen",
          "Verdächtige Knospe vorsichtig öffnen — grau/braun innen?",
          "Tägliche Sichtkontrolle in feuchten Phasen",
        ],
      },
      {
        heading: "Diagnose — Abgrenzung",
        content: [
          "Graues, watteartiges Myzel im Knospeninneren → Botrytis (Bud Rot).",
          "Weißer, mehliger Belag AUF Blättern/Knospen ist dagegen Echter Mehltau, nicht Botrytis.",
          "Ein einzelnes welkes Blättchen in einer prallen Knospe ist fast pathognomonisch für beginnende Bud Rot — sofort die Knospe prüfen.",
        ],
      },
      {
        heading: "Bekämpfung / Sofortmaßnahmen",
        content: [
          "1. Befallene Knospe großzügig entfernen (mit Rand ins gesunde Gewebe), in einen Beutel — nicht im Raum aufschneiden, um Sporen nicht zu verteilen.",
          "2. Werkzeuge und Hände desinfizieren, um keine Sporen zu verschleppen.",
          "3. Raumklima sofort entfeuchten und Luftbewegung erhöhen.",
          "4. Bei starkem Befall kurz vor Ernte: ggf. früher ernten, um Restmaterial zu retten.",
        ],
        checklist: [
          "Befallenes Material isoliert entfernen",
          "Werkzeuge desinfizieren",
          "RH senken, Luftbewegung erhöhen",
        ],
      },
      {
        heading: "Vorbeugung (der eigentliche Hebel)",
        content: [
          "Halte die relative Luftfeuchte in der Spätblüte bei 40–50 % und vermeide nächtliche Feuchtespitzen.",
          "Sorge für gleichmäßige Luftbewegung durch das Canopy; stehende, feuchte Luft in dichten Blüten ist der Hauptrisikofaktor.",
          "Entlaube/entdichte stark, damit Knospen abtrocknen können (Defoliation in der Blüte), und vermeide Temperaturstürze, die Kondensation erzeugen.",
        ],
        checklist: [
          "Spätblüte-RH 40–50 % halten",
          "Luftbewegung im Canopy sichern",
          "Dichte Blütenzonen auslichten",
          "Temperaturstürze (Kondensation) vermeiden",
        ],
      },
      {
        heading: "Umweltfaktoren und Wechselwirkungen",
        content: [
          "Hohe Luftfeuchte (> 55–60 %) und große Tag-Nacht-Temperaturdifferenzen führen zu Kondensation an den Knospen — das Kernrisiko für Botrytis.",
          "Dichte Sorten und Überdüngung mit Stickstoff (weiches Gewebe) erhöhen die Anfälligkeit.",
          "Vorgeschädigtes Gewebe (Schädlingsfraß, mechanische Schäden) bietet Botrytis Eintrittspforten — IPM und Schimmelprävention hängen zusammen.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Befallene Knospen im Raum aufschneiden und so Sporen verteilen.",
          "RH nur tagsüber kontrollieren, aber die feuchten Nächte ignorieren.",
          "Auf 'Heilung' hoffen — befallenes Gewebe ist verloren.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Genetik zählt: luftige, weniger dichte Phänotypen sind in feuchten Klimazonen klar im Vorteil.",
          "Eine kontrollierte Trocknungs-/Ernteplanung bei Wetterumschwüngen (z. B. im Outdoor-Herbst) reduziert das Botrytis-Risiko erheblich.",
        ],
      },
    ],
    warnings: [
      "Von Botrytis befallene Knospen niemals konsumieren — die Sporen sind gesundheitsschädlich.",
      "Befallene Blüten nicht im Growraum aufschneiden; das verteilt Sporen auf gesunde Pflanzen.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Das erste Zeichen",
        text: "Ein einzelnes, welkes kleines Blättchen mitten in einer prallen, sonst grünen Knospe ist das wichtigste Frühwarnsignal für Bud Rot. Öffne die Knospe sofort vorsichtig.",
      },
      {
        title: "Kurz erklärt: Klima schlägt Spray",
        text: "Gegen Bud Rot gibt es keine zuverlässige Heilung. Die wirksamste 'Behandlung' ist trockene, bewegte Luft in der Blüte — Prävention statt Reparatur.",
      },
    ],
    faq: [
      {
        question: "Kann ich eine Knospe mit Bud Rot retten?",
        answer:
          "Nein. Befallenes Gewebe ist verloren und gesundheitsgefährdend. Entferne die Knospe großzügig bis ins gesunde Gewebe und konzentriere dich darauf, den Rest durch Klimakontrolle zu schützen.",
      },
      {
        question: "Bei welcher Luftfeuchte wird es kritisch?",
        answer:
          "In der Blüte steigt das Risiko ab etwa 55–60 % relativer Luftfeuchte deutlich. Ziel in der Spätblüte sind 40–50 %, ohne nächtliche Feuchtespitzen.",
      },
    ],
    glossary: [
      { term: "Nekrotroph", definition: "Lebensweise eines Pilzes, der Gewebe abtötet und vom toten Material lebt." },
      { term: "Myzel", definition: "Das fädige Geflecht eines Pilzes, bei Botrytis grau und watteartig." },
      { term: "Kondensation", definition: "Wasserausfall an Oberflächen, wenn warme feuchte Luft auf kühle Knospen trifft." },
    ],
    sourceIds: ["botrytis-grey-mold-review", "punja-cannabis-pathogens", "scott-punja-powdery-mildew"],
    relatedSlugs: ["schimmel-und-mykotoxine-bei-cannabis", "echter-mehltau-powdery-mildew", "vpd-einfach-erklaert", "calciummangel"],
  },
  {
    slug: "echter-mehltau-powdery-mildew",
    title: "Echter Mehltau bei Cannabis erkennen und bekämpfen",
    summary:
      "Weiße, mehlige Flecken auf der Blattoberseite sind das Leitsymptom. Anders als die meisten Pilze braucht Mehltau keine Nässe — diese Klima- und Hygienestrategie stoppt ihn.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-06-02",
    tags: ["Echter Mehltau", "Powdery Mildew", "Schimmel", "Klima", "Diagnose"],
    keyTakeaways: [
      "Leitsymptom sind abwischbare, weiße, mehlige Flecken auf der BlattOBERSEITE — anfangs kreisrund, später flächig.",
      "Echter Mehltau braucht KEINE Blattnässe, sondern hohe Luftfeuchte und schlechte Luftbewegung; er ist hoch ansteckend über Sporen.",
      "Bekämpfe über Klima (RH senken, Luft bewegen), strikte Hygiene/Quarantäne und frühzeitiges Entfernen befallener Blätter; keine Sprays auf erntenahe Knospen.",
    ],
    quickFacts: [
      { label: "Erreger", value: "Golovinomyces ambrosiae" },
      { label: "Leitsymptom", value: "Weißer, mehliger Belag (abwischbar)" },
      { label: "Sitzt auf", value: "Blattoberseite" },
      { label: "Braucht Nässe?", value: "Nein, aber hohe RH" },
      { label: "Ansteckung", value: "Sehr hoch (Sporenflug)" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Echter Mehltau ist ein obligat biotropher Pilz, der auf lebendem Cannabisgewebe wächst und einen weißen, mehligen Belag bildet.",
          "Er ist eine der häufigsten und am schnellsten verbreiteten Cannabis-Krankheiten und kann ganze Räume befallen, wenn Hygiene und Klima nicht stimmen.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund / Erregerbiologie",
        content: [
          "Im Gegensatz zu den meisten Pilzen keimen Mehltausporen auch ohne freies Wasser; hohe relative Luftfeuchte genügt. Das macht ihn in vielen Setups schwer kontrollierbar.",
          "Der Pilz entzieht lebenden Zellen Nährstoffe über Haustorien und schwächt so Photosynthese und Vitalität.",
        ],
      },
      {
        heading: "Schadbild und Symptome nach Schweregrad",
        content: [
          "Stadium 1: Einzelne kleine, kreisrunde weiße Pulverflecken auf Blattoberseiten, leicht abwischbar.",
          "Stadium 2: Flecken verschmelzen zu flächigem weißem Belag, Blätter vergilben darunter.",
          "Stadium 3: Befall auf Stängel und Knospen, Wachstumsstörungen, Qualitäts- und Ertragsverlust; befallene Knospen sind unverkäuflich.",
        ],
        checklist: [
          "Weiße mehlige Flecken auf Blattoberseiten?",
          "Lassen sie sich abwischen?",
          "Breiten sie sich kreisförmig aus?",
        ],
      },
      {
        heading: "Diagnose — Abgrenzung",
        content: [
          "Weißer, mehliger, abwischbarer Belag AUF Blättern → Echter Mehltau.",
          "Graues, watteartiges Myzel IM Knospeninneren ist dagegen Botrytis (Bud Rot), nicht Mehltau.",
          "Weiße Sprenkel, die sich NICHT abwischen lassen und punktförmig sind, deuten eher auf Schädlingsschaden (Spinnmilben) als auf Mehltau.",
        ],
      },
      {
        heading: "Bekämpfung / Sofortmaßnahmen",
        content: [
          "1. Befallene Blätter vorsichtig entfernen (in Beutel), ohne Sporen aufzuwirbeln; Hände/Werkzeuge desinfizieren.",
          "2. Klima sofort anpassen: relative Luftfeuchte senken, Luftbewegung und Frischluft erhöhen.",
          "3. Pflanzen ausdünnen, damit Licht und Luft an alle Blätter kommen.",
          "4. In der Vegetation/Frühblüte zugelassene Kontaktmittel im Rotationsprinzip; keine Sprays auf erntenahe Knospen.",
        ],
        checklist: [
          "Befallene Blätter isoliert entfernen",
          "RH senken, Luft bewegen",
          "Bestand auslichten",
          "Hygiene strikt einhalten",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Quarantäne für alle neuen Pflanzen/Stecklinge — Mehltau wird häufig eingeschleppt.",
          "Relative Luftfeuchte moderat halten und für konstante Luftbewegung sorgen.",
          "Ausreichende Pflanzabstände und Entlaubung, damit kein feuchtes Mikroklima im Bestand entsteht.",
        ],
      },
      {
        heading: "Umweltfaktoren und Wechselwirkungen",
        content: [
          "Hohe Luftfeuchte kombiniert mit stehender Luft ist der Hauptauslöser; gute Zirkulation ist die wirksamste Dauerprävention.",
          "Dichte Bestände und große Tag-Nacht-Temperaturschwankungen begünstigen den Befall.",
          "Mehltaugeschwächte Pflanzen sind anfälliger für Folgepathogene wie Botrytis.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Befallene Blätter im Raum schütteln/abreißen und so Sporen verteilen.",
          "Nur einzelne Blätter entfernen, aber Klima und Hygiene nicht ändern.",
          "Erntenahe Knospen besprühen und damit Qualität und Konsumsicherheit gefährden.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Manche Genetiken sind deutlich mehltauresistenter; in Problemräumen lohnt die Sortenwahl mehr als jede Spritzfolge.",
          "Da der Pilz auf lebendem Gewebe sitzt, ist konsequente Raumhygiene zwischen den Zyklen (Reinigung, Sporenentfernung) entscheidend gegen Wiederbefall.",
        ],
      },
    ],
    warnings: [
      "Erntenahe Knospen nicht mit Fungiziden besprühen — Rückstände gefährden Qualität und Konsumsicherheit.",
      "Echter Mehltau ist hoch ansteckend; ohne Quarantäne und Hygiene befällt er schnell den ganzen Raum.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Mehltau vs. Bud Rot",
        text: "Mehltau ist ein weißer, mehliger Belag AUF den Blättern. Bud Rot (Botrytis) ist graue Fäule IM Inneren der Knospe. Zwei verschiedene Pilze mit verschiedenen Strategien.",
      },
      {
        title: "Kurz erklärt: Kein Wasser nötig",
        text: "Anders als die meisten Pilze braucht Mehltau keine nassen Blätter. Hohe Luftfeuchte und stehende Luft reichen ihm — deshalb hilft Luftbewegung so gut.",
      },
    ],
    faq: [
      {
        question: "Wie unterscheide ich Mehltau von Bud Rot?",
        answer:
          "Mehltau ist ein weißer, mehliger, abwischbarer Belag auf der Blattoberfläche. Bud Rot ist graue, watteartige Fäule im Inneren der Knospe. Behandlung und Prognose unterscheiden sich.",
      },
      {
        question: "Kann ich befallene Pflanzen noch retten?",
        answer:
          "Frühen Befall kannst du durch Entfernen befallener Blätter, Klimakontrolle und Hygiene eindämmen. Stark befallene Knospen sind verloren. Wichtig ist, die Ausbreitung über Sporen zu stoppen.",
      },
    ],
    glossary: [
      { term: "Biotroph", definition: "Lebensweise eines Pilzes, der nur auf lebendem Gewebe wächst." },
      { term: "Haustorium", definition: "Saugorgan, mit dem der Pilz Nährstoffe aus lebenden Zellen entzieht." },
      { term: "Sporenflug", definition: "Verbreitung von Pilzsporen über die Luft, Hauptweg der Mehltau-Ausbreitung." },
    ],
    sourceIds: ["scott-punja-powdery-mildew", "punja-cannabis-pathogens", "botrytis-grey-mold-review"],
    relatedSlugs: ["schimmel-und-mykotoxine-bei-cannabis", "bud-rot-botrytis", "vpd-einfach-erklaert", "integrierte-schaedlingspraevention-grow"],
  },
  {
    slug: "wurzelfaeule",
    title: "Wurzelfäule (Pythium) bei Cannabis erkennen und beheben",
    summary:
      "Braune, schleimige Wurzeln und welke Pflanzen trotz feuchten Substrats sind die Leitsymptome. So unterscheidest du Wurzelfäule von Trockenstress und rettest die Wurzelzone.",
    category: "anbau",
    difficulty: "profi",
    readMinutes: 10,
    lastUpdated: "2026-06-02",
    tags: ["Wurzelfäule", "Pythium", "Hydroponik", "Sauerstoff", "Diagnose"],
    keyTakeaways: [
      "Leitsymptome sind braune, matschig-schleimige Wurzeln (statt weiß-fest) und welke Pflanzen TROTZ nassem Substrat.",
      "Die Ursache ist fast immer Sauerstoffmangel an den Wurzeln durch Überwässerung, warme Nährlösung oder Staunässe.",
      "Rette die Wurzelzone über Sauerstoff (kühlere Lösung < 20 °C, mehr Belüftung), trockenere Gaben und ggf. Wurzelreinigung — befallenes Wurzelgewebe wächst nicht nach.",
    ],
    quickFacts: [
      { label: "Erreger", value: "Pythium spp. (u. a.)" },
      { label: "Leitsymptom", value: "Braune, schleimige Wurzeln" },
      { label: "Schlüsselparadox", value: "Welk trotz nassem Substrat" },
      { label: "Hauptursache", value: "Sauerstoffmangel / Überwässerung" },
      { label: "Ziel-Lösungstemp.", value: "< 20 °C (Hydro)" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Wurzelfäule wird meist durch Pythium (eierpilzartiger Oomycet) ausgelöst, der geschwächte, sauerstoffarme Wurzeln besiedelt und zersetzt.",
          "Pythium ist ein Schwächeparasit: gesunde, gut durchlüftete Wurzeln wehren ihn ab; erst Sauerstoffmangel oder Wurzelschäden öffnen ihm die Tür.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund / Erregerbiologie",
        content: [
          "Pythium bildet bewegliche Zoosporen, die in warmem, stehendem Wasser aktiv zur Wurzel schwimmen. Warme Nährlösung (> 22 °C) und niedriger Sauerstoff sind ideale Bedingungen.",
          "Befallene Wurzeln verlieren ihre äußere Rinde ('Sleeving'): die weiße Spitze löst sich, ein brauner, schleimiger Kern bleibt.",
        ],
      },
      {
        heading: "Schadbild und Symptome nach Schweregrad",
        content: [
          "Stadium 1: Wurzelspitzen verfärben sich beige/braun, leichter Geruch, Pflanze wirkt morgens schon schlaff.",
          "Stadium 2: Braune, schleimige Wurzeln mit fauligem Geruch, Welke trotz feuchtem Substrat, Blätter vergilben/welken oberseits.",
          "Stadium 3: Großflächige Wurzelnekrose, Stagnation, Kollaps der Pflanze; in Hydro breitet sich der Befall über das Reservoir aus.",
        ],
        checklist: [
          "Wurzeln weiß-fest oder braun-schleimig?",
          "Welkt die Pflanze trotz nassem Substrat?",
          "Fauliger Geruch an Wurzeln/Reservoir?",
        ],
      },
      {
        heading: "Diagnose — Abgrenzung",
        content: [
          "Welke + nasses Substrat + braune, schleimige Wurzeln → Wurzelfäule (Pythium).",
          "Welke + trockenes Substrat + weiße, feste Wurzeln → Trockenstress, nicht Fäule (gegenteilige Maßnahme!).",
          "Der Geruch ist ein starker Indikator: gesunde Wurzeln riechen erdig-neutral, faulende stinken modrig.",
        ],
      },
      {
        heading: "Bekämpfung / Sofortmaßnahmen",
        content: [
          "1. Bewässerung stoppen/reduzieren und Substrat abtrocknen lassen; Staunässe sofort beseitigen.",
          "2. Sauerstoff erhöhen: Nährlösung kühlen (< 20 °C), Belüftung/Luftsteine verstärken, Reservoir reinigen.",
          "3. In Hydro: Reservoir komplett wechseln, System reinigen; faulige Wurzeln vorsichtig entfernen.",
          "4. Nützliche Mikroorganismen (z. B. Trichoderma, Bacillus) zur Wiederbesiedlung der Wurzelzone einsetzen.",
        ],
        checklist: [
          "Überwässerung stoppen, Substrat abtrocknen",
          "Lösung kühlen und belüften",
          "Reservoir/System reinigen",
          "Nützliche Mikroben einbringen",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Nicht überwässern: Gaben an Bedarf und Abtrocknung koppeln; gute Drainage sicherstellen.",
          "Nährlösung kühl halten (< 20 °C) und kräftig belüften — Sauerstoff ist die beste Pythium-Bremse.",
          "Hygiene: saubere Systeme, Reservoirs abdunkeln (gegen Algen), Trauermücken kontrollieren (Larven schädigen Wurzeln).",
        ],
      },
      {
        heading: "Umweltfaktoren und Wechselwirkungen",
        content: [
          "Warme, stagnierende, sauerstoffarme Nährlösung ist der zentrale Risikofaktor — Temperatur und Belüftung sind die wichtigsten Stellschrauben.",
          "Trauermückenlarven und mechanische Wurzelschäden bahnen Pythium den Weg.",
          "Eisen- und andere Mikronährstoffmängel, die trotz korrekter Lösung bestehen bleiben, sind oft Folge kranker Wurzeln, nicht der Düngung.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Welke fälschlich als Trockenheit deuten und MEHR gießen — das verschärft Pythium massiv.",
          "Warme Nährlösung im Sommer ignorieren.",
          "Befallene Wurzeln nur 'behandeln', ohne die Sauerstoff-/Wasserursache zu beheben.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Eine etablierte Population nützlicher Mikroorganismen in der Wurzelzone wirkt prophylaktisch und konkurriert Pythium aktiv aus.",
          "In rezirkulierenden Systemen sind Lösungstemperatur-Monitoring und Reservoir-Hygiene die wirksamsten Dauermaßnahmen; bereits abgestorbenes Wurzelgewebe regeneriert nicht.",
        ],
      },
    ],
    warnings: [
      "Welke bedeutet NICHT automatisch Wassermangel — bei Wurzelfäule ist mehr Gießen der schlimmste Fehler.",
      "Faulendes Wurzelgewebe wächst nicht nach; rette die verbleibenden gesunden Wurzeln durch Sauerstoff und Hygiene.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Welk trotz nass",
        text: "Wenn die Pflanze schlapp ist, obwohl das Substrat feucht ist, sind oft die Wurzeln faul und können kein Wasser mehr aufnehmen. Dann hilft nur Sauerstoff und Abtrocknen, nicht mehr Wasser.",
      },
      {
        title: "Kurz erklärt: Sauerstoff schlägt Pythium",
        text: "Pythium liebt warmes, sauerstoffarmes Wasser. Kühle, gut belüftete Nährlösung ist die beste Vorbeugung gegen Wurzelfäule.",
      },
    ],
    faq: [
      {
        question: "Meine Pflanze hängt, obwohl die Erde nass ist — was ist los?",
        answer:
          "Das ist ein klassisches Wurzelfäule-Zeichen: faule Wurzeln können trotz Feuchtigkeit kein Wasser aufnehmen. Gieße NICHT mehr, sondern lass abtrocknen, sorge für Sauerstoff und prüfe die Wurzeln.",
      },
      {
        question: "Wie verhindere ich Wurzelfäule in Hydro?",
        answer:
          "Halte die Nährlösung unter 20 °C, belüfte kräftig, halte das Reservoir sauber und dunkel und vermeide Staunässe. Nützliche Mikroorganismen stabilisieren die Wurzelzone zusätzlich.",
      },
    ],
    glossary: [
      { term: "Oomycet", definition: "Eierpilzartiger Organismus (z. B. Pythium), kein echter Pilz, aber pilzähnliche Lebensweise." },
      { term: "Zoospore", definition: "Bewegliche Sporenform, die in Wasser aktiv zur Wurzel schwimmt." },
      { term: "Sleeving", definition: "Ablösung der äußeren Wurzelrinde, sodass nur ein brauner Strang übrig bleibt." },
    ],
    sourceIds: ["pythium-root-rot-hydroponics", "punja-cannabis-pathogens", "fungus-gnats-bradysia-management"],
    relatedSlugs: ["bewaesserung-ohne-uebergiessen", "trauermuecken", "eisenmangel", "schimmel-und-mykotoxine-bei-cannabis"],
  },
  // ===========================================================================
  // WAVE 4 – TOXIZITÄTEN / ÜBERSCHÜSSE (Phase 19)
  // ===========================================================================
  // Diagnose funktioniert nur, wenn neben dem Mangel auch der Überschuss als
  // eigenständige Entität abgebildet ist. Diese Welle hebt die Domäne
  // "Toxizitäten / Überschüsse" (Coverage Matrix §4) erstmals über 0 %.
  {
    slug: "stickstoffueberschuss",
    title: "Stickstoffüberschuss bei Cannabis erkennen und beheben",
    summary:
      "Dunkelgrüne, klauenförmig nach unten gebogene Blätter ('The Claw') sind das Leitsymptom. So unterscheidest du echte N-Toxizität von Überwässerung und drosselst die Stickstoffzufuhr gezielt.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-06-02",
    tags: ["Stickstoff", "Überschuss", "Toxizität", "The Claw", "Diagnose"],
    keyTakeaways: [
      "N-Überschuss zeigt sich als sattes Dunkelgrün mit glänzenden, ledrigen Blättern und nach unten gebogenen Spitzen ('Krallen' / The Claw).",
      "Anders als ein Mangel beginnt die Toxizität an den jungen, kräftig wachsenden Blättern und betrifft das Wachstum insgesamt, nicht nur alte Etagen.",
      "Korrektur heißt: EC senken, mit pH-korrektem Wasser spülen und in der Blüte den N-Anteil drosseln — zu viel N verzögert die Blüte und mindert Aroma.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Dunkelgrün + klauenförmige Blätter (The Claw)" },
      { label: "Betroffen zuerst", value: "Junge, kräftige Blätter & Triebspitzen" },
      { label: "Häufige Ursache", value: "Überdüngung / zu N-betonte Blütephase" },
      { label: "Schnellkorrektur", value: "Spülen, EC −0.3 bis −0.5, N drosseln" },
      { label: "Risiko Blüte", value: "Verzögerte Reife, grasiges Aroma" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Stickstoffüberschuss (N-Toxizität) ist eine Überversorgung mit pflanzenverfügbarem Stickstoff (vor allem NO3⁻ und NH4⁺), die das vegetative Wachstum überstimuliert und die generative Entwicklung stört.",
          "In der Vegetation ist ein leichter N-Überschuss meist kosmetisch; in der Blüte wird er zum echten Ertrags- und Qualitätsproblem, weil die Pflanze in der Streckung 'hängt' statt Blüten anzusetzen.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Überschüssiges Nitrat wird in der Pflanze gespeichert und treibt die Chlorophyll- und Proteinsynthese an — daher das dunkle, fast blaugrüne Laub.",
          "Ein hoher Ammoniumanteil verschärft das Bild: NH4⁺ stört den Kationenhaushalt (Ca, K, Mg), senkt den Rhizosphären-pH und kann direkte Wurzelschäden verursachen.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Erscheinungsbild",
        content: [
          "Weil die Toxizität das aktive Wachstum betrifft, sind die jüngsten, kräftigsten Blätter am auffälligsten — sie wirken überdick, ledrig und glänzend.",
          "Die klassische 'Kralle' (The Claw) entsteht, wenn die Blattspitzen nach unten krümmen, während die Blattmitte noch flach ist; bei fortgeschrittener Toxizität rollt sich das ganze Blatt ein.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1 (leicht): Auffällig dunkelgrünes, glänzendes Laub, Blattspitzen leicht nach unten gebogen.",
          "Stadium 2 (mittel): Deutliche Krallenbildung, ledrige Blätter, in der Blüte verzögerter Knospenansatz und gestauchte, dichte Triebspitzen.",
          "Stadium 3 (schwer): Verbrannte Blattspitzen (überlagerter Nährstoff-Burn), eingerollte Blätter, brüchiges Gewebe und sinkende Blütenqualität.",
        ],
        checklist: [
          "Ist das Laub auffällig dunkel statt frischgrün?",
          "Krümmen sich die Blattspitzen nach unten (Kralle)?",
          "Sind die JUNGEN Blätter am stärksten betroffen?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Überdüngung: Zu hohe N-Dosis oder zu kurzes Gießintervall, sodass sich N im Substrat anreichert.",
          "2. Falsche Phasenrezeptur: Vegetationsdünger (hoher N-Anteil) zu lange in die Blüte gefahren.",
          "3. Organische Akkumulation: Stark vorgedüngte Erde oder Übermaß an organischen N-Quellen, die kontinuierlich mineralisieren.",
          "4. Niedriger Wasserdurchsatz: Wenig Drainage, sodass Salze und N nicht ausgewaschen werden.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Sind die jungen Blätter dunkelgrün und klauenförmig? Ja → N-Überschuss wahrscheinlich; Mangel sähe blass aus.",
          "Schritt 2: Hängen die Blätter schlaff trotz korrekter Feuchte? Trenne von Überwässerung — bei N-Toxizität ist das Laub fest und ledrig, nicht welk-weich.",
          "Schritt 3: Miss die EC der Drainage gegen den Zulauf. Drainage-EC deutlich höher → Salz-/N-Anreicherung.",
          "Schritt 4: Prüfe Düngerrezeptur und Phase. N-betonter Dünger in der Blüte → Rezeptur umstellen.",
        ],
        checklist: [
          "Drainage-EC gegen Zulauf-EC vergleichen",
          "Düngerrezeptur auf N:P:K und Phase prüfen",
          "Junge vs. alte Blätter gegenüberstellen",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. Spülen: Mit pH-korrektem Wasser (Coco/Hydro 5.8–6.2, Erde 6.2–6.8) das 1.5–3-fache Topfvolumen durchspülen, bis die Drainage-EC sinkt.",
          "2. EC senken: Die N-betonte Düngung pausieren bzw. die Gesamt-EC um 0.3–0.5 reduzieren und neu hochtasten.",
          "3. Phasengerecht umstellen: In der Blüte auf P/K-betonte Rezeptur wechseln, N nur als Erhaltungsgabe.",
          "4. Wasserregime korrigieren: Ausreichend Drainage (10–20 %) sicherstellen, damit Salze nicht akkumulieren.",
        ],
        checklist: [
          "Mit pH-korrektem Wasser spülen, Drainage-EC kontrollieren",
          "Gesamt-EC schrittweise senken, nicht abrupt nullen",
          "Blüterezeptur N-arm, P/K-betont fahren",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Dosiere nach EC-Zielwerten der Phase statt nach Gefühl; tägliche Drainage-EC-Kontrolle deckt Anreicherung früh auf.",
          "Trenne Vegetations- und Blütedünger sauber und reduziere N rechtzeitig zum Blütebeginn.",
          "Halte ein konstantes Drainagefenster, damit sich keine Salze im Wurzelraum stauen.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Hoher NH4⁺-Anteil bei niedrigem pH verschärft die Toxizität und antagonisiert Ca, K und Mg — scheinbare Mängel können Folge von N-Überschuss sein.",
          "Warme, feuchte Bedingungen mit weichem, überdüngtem Gewebe begünstigen Botrytis und Mehltau; N-Toxizität ist damit auch ein indirektes Krankheitsrisiko.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Die Krallenbildung als Wassermangel fehldeuten und noch mehr gießen oder düngen.",
          "N in der Blüte zu spät reduzieren — das Aroma wird grasig und die Reife verzögert sich.",
          "Bei sichtbarem Burn die EC abrupt auf null fahren und damit Stressschocks auslösen.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Eine Blattanalyse kann N-Gehalte über dem phasentypischen Optimum bestätigen, bevor man rein optisch korrigiert.",
          "In rezirkulierenden Systemen reichert sich Nitrat an; ein periodischer Reservoir-Reset hält die N-Last und EC stabil.",
        ],
      },
    ],
    warnings: [
      "Spüle bei N-Toxizität nur mit pH-korrektem Wasser — falscher pH verschärft sonst zusätzlich eine Blockade.",
      "Reduziere die EC schrittweise; ein abrupter Nährstoffentzug stresst die Pflanze und kann die Blüte zusätzlich bremsen.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum die Kralle?",
        text: "Zu viel Stickstoff lässt die Blätter überschnell und überdick wachsen. Die Spitzen können nicht mithalten und biegen sich nach unten — wie eine Kralle.",
      },
      {
        title: "Kurz erklärt: Dunkelgrün ist nicht gut",
        text: "Sehr dunkles, glänzendes Laub wirkt gesund, ist aber oft ein Zeichen für zu viel Stickstoff. Frisches Hellgrün ist das eigentliche Ziel.",
      },
    ],
    faq: [
      {
        question: "Ist dunkelgrünes Laub nicht ein gutes Zeichen?",
        answer:
          "Nur bis zu einem Punkt. Sattes, aber frisches Grün ist gesund; sehr dunkles, glänzend-ledriges Laub mit gebogenen Spitzen deutet dagegen auf Stickstoffüberschuss hin.",
      },
      {
        question: "Wie unterscheide ich N-Überschuss von Überwässerung?",
        answer:
          "Bei N-Toxizität sind die Blätter fest, ledrig und krallenförmig; bei Überwässerung hängen sie weich und schlaff. Ein EC-Vergleich von Zulauf und Drainage gibt zusätzliche Sicherheit.",
      },
      {
        question: "Erholen sich verkrallte Blätter wieder?",
        answer:
          "Leicht betroffene Blätter strecken sich nach der Korrektur teils wieder; stark verkrallte oder verbrannte Blätter bleiben geschädigt. Beurteile den Erfolg am Neuaustrieb.",
      },
    ],
    glossary: [
      { term: "The Claw", definition: "Klauenförmiges Abwärtskrümmen der Blätter, typisches Zeichen für Stickstoffüberschuss." },
      { term: "Nitrat (NO3⁻)", definition: "Hauptaufnahmeform von Stickstoff; reichert sich bei Überdüngung im Gewebe an." },
      { term: "EC", definition: "Elektrische Leitfähigkeit der Nährlösung/Drainage als Maß für die Salz- und Nährstoffkonzentration." },
    ],
    sourceIds: ["marschner-mineral-nutrition", "bernal-cannabis-nutrient-requirements", "caplan-cannabis-fertility-rate"],
    relatedSlugs: ["stickstoffmangel", "naehrstoffverbrennung-tipburn", "salzanreicherung-hohe-ec", "naehrstoffbedarf-cannabis-lebenszyklus"],
  },
  {
    slug: "kalium-ueberschuss",
    title: "Kaliumüberschuss bei Cannabis erkennen und beheben",
    summary:
      "Kaliumüberschuss ist selten direkt toxisch, blockiert aber über Kationen-Antagonismus die Aufnahme von Mg, Ca und N. So erkennst du die ausgelösten Sekundärmängel und stellst das Verhältnis neu ein.",
    category: "anbau",
    difficulty: "profi",
    readMinutes: 9,
    lastUpdated: "2026-06-02",
    tags: ["Kalium", "Überschuss", "Antagonismus", "Toxizität", "Diagnose"],
    keyTakeaways: [
      "Kaliumüberschuss wirkt fast nie direkt toxisch, sondern indirekt: zu viel K⁺ verdrängt Mg²⁺, Ca²⁺ und teils NH4⁺ an den Wurzeltransportern.",
      "Das Leitbild ist daher ein 'induzierter Magnesium- oder Calciummangel' trotz ausreichender Versorgung mit diesen Nährstoffen.",
      "Korrektur heißt nicht 'mehr Mg/Ca', sondern das Ionenverhältnis senken: K drosseln, spülen und Ca:Mg:K neu ausbalancieren.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Mg-/Ca-Mangelbild trotz Zufuhr" },
      { label: "Wirkmechanismus", value: "Kationen-Antagonismus (K verdrängt Mg/Ca)" },
      { label: "Zielverhältnis", value: "Ca:Mg:K grob 3:1:3 bis 4:1:3" },
      { label: "Schnellkorrektur", value: "K-Anteil senken, spülen, neu balancieren" },
      { label: "Risiko", value: "Fehldiagnose als reiner Mg-/Ca-Mangel" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Kaliumüberschuss bezeichnet ein Überangebot an K⁺ in der Wurzelzone, das selten direkte Verbrennungen, aber häufig Aufnahmestörungen anderer Kationen verursacht.",
          "Weil Cannabis in der Blüte K-betont gedüngt wird, ist ein versehentlicher K-Überschuss in dieser Phase besonders häufig.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "K⁺, Ca²⁺ und Mg²⁺ konkurrieren um dieselben Aufnahme-Transporter an der Wurzelmembran. Ein Überschuss eines Kations senkt die Aufnahme der anderen.",
          "K hat dabei eine besonders starke Verdrängungswirkung gegenüber Mg und Ca — deshalb erzeugt K-Überschuss bevorzugt Mg- und Ca-Mangelbilder.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Erscheinungsbild",
        content: [
          "Da Mg phloemmobil ist, erscheint der induzierte Mangel zuerst als interveinale Chlorose an den unteren Blättern — optisch identisch mit einem echten Mg-Mangel.",
          "Wird zusätzlich Ca verdrängt (immobil), zeigen sich verkrüppelte, fleckige junge Triebe; das Mischbild macht die Diagnose anspruchsvoll.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1 (leicht): Beginnende interveinale Aufhellung unten trotz dosierter Mg-Gabe, leicht erhöhte EC.",
          "Stadium 2 (mittel): Deutliches Mg-Mangelbild plus erste Ca-Symptome (fleckige junge Blätter), obwohl beide Nährstoffe in der Rezeptur enthalten sind.",
          "Stadium 3 (schwer): Kombinierte Mg-/Ca-Defizite, nekrotische Flecken, gehemmtes Wachstum und in der Blüte verminderte Knospenfestigkeit.",
        ],
        checklist: [
          "Tritt ein Mg-/Ca-Mangel auf, OBWOHL dosiert wird?",
          "Ist die Rezeptur in der Blüte stark K-betont?",
          "Ist die Gesamt-EC eher hoch?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. K-betonte Blüterezeptur überdosiert: 'Bloom-Booster' und PK-Zusätze stapeln sich.",
          "2. Falsches Ca:Mg:K-Verhältnis: K relativ zu Ca/Mg zu hoch eingestellt.",
          "3. Salzanreicherung: Wenig Drainage, K akkumuliert im Substrat.",
          "4. Wasserchemie: Bereits K-reiches Ausgangswasser plus voller Düngerdosis.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Liegt ein Mg-/Ca-Mangelbild vor, obwohl beide dosiert werden? Ja → Antagonismus durch K-Überschuss in Betracht ziehen.",
          "Schritt 2: Prüfe die Rezeptur auf das Ca:Mg:K-Verhältnis und auf gestapelte PK-/Bloom-Zusätze.",
          "Schritt 3: Miss EC der Drainage. Hohe EC + K-betonte Rezeptur → Überschuss wahrscheinlich.",
          "Schritt 4: Schließe pH-Blockade aus (Wurzelzonen-pH messen), bevor du das Verhältnis korrigierst.",
        ],
        checklist: [
          "Ca:Mg:K-Verhältnis der Rezeptur berechnen",
          "PK-/Bloom-Zusätze auf Überlagerung prüfen",
          "Wurzelzonen-pH zum Ausschluss einer Blockade messen",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. K-Last senken: PK-Booster reduzieren oder aussetzen, Gesamt-EC um 0.2–0.4 zurücknehmen.",
          "2. Spülen: Mit pH-korrektem Wasser durchspülen, um angereichertes K auszuwaschen.",
          "3. Verhältnis neu setzen: Ca:Mg:K so balancieren, dass Mg/Ca nicht mehr verdrängt werden (Ca:Mg etwa 3:1 bis 4:1, K nicht über den Phasenbedarf).",
          "4. Nicht blind Mg/Ca hochfahren: Mehr Mg/Ca bei bestehendem K-Überschuss erhöht nur die Gesamt-EC, ohne die Konkurrenz zu lösen.",
        ],
        checklist: [
          "K/PK-Zusätze drosseln, EC senken",
          "Spülen statt Mg/Ca blind erhöhen",
          "Ca:Mg:K-Verhältnis dokumentieren und neu einstellen",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Dosiere PK-Booster bewusst und zeitlich begrenzt statt dauerhaft 'auf Maximum'.",
          "Führe eine Rezepturtabelle mit Ca:Mg:K-Verhältnis, nicht nur Einzeldosen.",
          "Halte ein konstantes Drainagefenster, damit K nicht akkumuliert.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Hohe Transpiration (niedriges VPD-Management, starke PPFD) erhöht den Massenfluss und verschärft den Antagonismus bei knappem Mg.",
          "Kühle Wurzelzonen bremsen die Mg-Aufnahme zusätzlich — K-Überschuss und Temperaturstress können sich überlagern.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Den induzierten Mg-Mangel mit immer mehr Mg bekämpfen, statt K zu senken.",
          "PK-Booster als Dauergabe statt als kurzes Fenster einsetzen.",
          "Den Wurzelzonen-pH übersehen und Antagonismus mit pH-Blockade verwechseln.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Eine Blattanalyse mit hohem K und gleichzeitig niedrigem Mg/Ca bestätigt den Antagonismus eindeutig.",
          "In rezirkulierenden Systemen verschiebt sich das Ionenverhältnis über die Zeit; ein Reservoir-Reset stabilisiert Ca:Mg:K.",
        ],
      },
    ],
    warnings: [
      "Erhöhe bei einem durch K ausgelösten Mangel nicht einfach Mg oder Ca — das steigert nur die EC und löst die Konkurrenz nicht.",
      "Schließe immer eine pH-Blockade aus, bevor du das Ionenverhältnis korrigierst.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Verdrängung an der Tür",
        text: "Kalium, Calcium und Magnesium nutzen dieselbe 'Tür' in die Wurzel. Steht zu viel Kalium an, drängelt es sich vor — Magnesium und Calcium kommen nicht durch.",
      },
      {
        title: "Kurz erklärt: Verhältnis statt Menge",
        text: "Nicht die einzelne Dosis entscheidet, sondern das Verhältnis. Zu viel Kalium erzeugt einen Mangel, obwohl Magnesium eigentlich genug da ist.",
      },
    ],
    faq: [
      {
        question: "Ist Kaliumüberschuss direkt giftig für die Pflanze?",
        answer:
          "Selten. Das Problem ist meist indirekt: zu viel Kalium blockiert die Aufnahme von Magnesium und Calcium und erzeugt so deren Mangelbilder.",
      },
      {
        question: "Warum hilft mehr Magnesium nicht?",
        answer:
          "Weil das Verhältnis, nicht die Menge das Problem ist. Solange Kalium dominiert, verdrängt es Magnesium weiter. Erst Kalium senken, dann balanciert sich die Aufnahme.",
      },
      {
        question: "Wann tritt K-Überschuss am ehesten auf?",
        answer:
          "In der Blüte, wenn K-betonte PK-Booster überdosiert oder gestapelt werden. Dosiere sie zeitlich begrenzt und überwache die EC.",
      },
    ],
    glossary: [
      { term: "Kationen-Antagonismus", definition: "Gegenseitige Aufnahmehemmung positiv geladener Ionen (K⁺, Ca²⁺, Mg²⁺) an der Wurzel." },
      { term: "Induzierter Mangel", definition: "Ein Mangelbild, das nicht durch fehlende Zufuhr, sondern durch Verdrängung eines anderen Ions entsteht." },
      { term: "PK-Booster", definition: "Phosphor-/Kalium-betonter Zusatz für die Blüte, häufige Quelle von K-Überschuss." },
    ],
    sourceIds: ["marschner-mineral-nutrition", "bryson-plant-nutrition-manual", "bernal-cannabis-nutrient-requirements"],
    relatedSlugs: ["kaliummangel", "magnesiummangel", "calciummangel", "naehrstoffbedarf-cannabis-lebenszyklus"],
  },
  {
    slug: "calciumueberschuss",
    title: "Calciumüberschuss bei Cannabis erkennen und beheben",
    summary:
      "Zu viel Calcium ist selten direkt giftig, hebt aber den pH an und verdrängt Magnesium und Kalium. So erkennst du den hartwasser- bzw. überdosierten Cal-Mag-Fall und korrigierst Verhältnis und pH.",
    category: "anbau",
    difficulty: "profi",
    readMinutes: 8,
    lastUpdated: "2026-06-02",
    tags: ["Calcium", "Überschuss", "Antagonismus", "pH", "Diagnose"],
    keyTakeaways: [
      "Calciumüberschuss wirkt überwiegend indirekt: hoher Ca-Anteil verdrängt Mg und K und hebt tendenziell den Wurzelzonen-pH.",
      "Typisch ist ein Mg-Mangelbild plus mögliche K-Symptome bei hartem Leitungswasser oder überdosiertem Cal-Mag.",
      "Korrektur heißt: Ca-Zugabe drosseln, bei hartem Wasser teilweise auf RO-Wasser wechseln und pH sowie Ca:Mg neu einstellen.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Mg-/K-Mangelbild + tendenziell hoher pH" },
      { label: "Wirkmechanismus", value: "Verdrängung von Mg/K, pH-Anhebung" },
      { label: "Häufige Ursache", value: "Hartes Wasser + zusätzlicher Cal-Mag" },
      { label: "Zielverhältnis", value: "Ca:Mg etwa 3:1 bis 4:1" },
      { label: "Schnellkorrektur", value: "Ca drosseln, RO beimischen, pH richten" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Calciumüberschuss ist ein Überangebot an Ca²⁺ in der Wurzelzone. Direkte Toxizität ist selten; das Problem entsteht über Antagonismus und pH-Verschiebung.",
          "Besonders häufig bei hartem Leitungswasser, dem zusätzlich ein Cal-Mag-Produkt zugesetzt wird, obwohl der Ca-Bedarf längst gedeckt ist.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Ca²⁺ konkurriert mit Mg²⁺ und K⁺ um die Wurzelaufnahme; ein Überschuss senkt deren Verfügbarkeit.",
          "Calciumreiches (hartes) Wasser ist oft mit Bicarbonaten gepuffert und treibt den pH nach oben, was zusätzlich Mikronährstoffe wie Fe und Mn blockiert.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Erscheinungsbild",
        content: [
          "Das sichtbare Bild ist meist ein induzierter Mg-Mangel: interveinale Chlorose an unteren Blättern, obwohl Mg dosiert wird.",
          "Steigt der pH stark, kommen Mikronährstoffsymptome (z. B. Eisenmangel an jungen Blättern) hinzu — ein Mischbild, das leicht fehlinterpretiert wird.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1 (leicht): Leichte interveinale Aufhellung unten trotz Mg-Gabe, Drainage-pH am oberen Rand.",
          "Stadium 2 (mittel): Klares Mg-Mangelbild plus beginnende Mikronährstoffsymptome an jungen Blättern (pH-bedingt).",
          "Stadium 3 (schwer): Kombinierte Mg-/Fe-Symptome, stagnierendes Wachstum, mögliche Salzkrusten auf dem Substrat.",
        ],
        checklist: [
          "Hartes Leitungswasser + zusätzlicher Cal-Mag im Einsatz?",
          "Mg-Mangel trotz Dosierung?",
          "Liegt der Wurzelzonen-pH am oberen Rand oder darüber?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Hartes Wasser + Cal-Mag: Ca wird doppelt zugeführt.",
          "2. Überdosierter Cal-Mag bei ohnehin Ca-reicher Basisdüngung.",
          "3. pH-Drift nach oben durch bicarbonatreiches Wasser.",
          "4. Salzanreicherung bei zu geringer Drainage.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Liegt ein Mg-Mangelbild trotz Dosierung vor? Ja → Antagonismus prüfen.",
          "Schritt 2: Ist das Ausgangswasser hart (hohe Carbonathärte/EC schon vor Düngung)? Ja → Ca-Quelle identifiziert.",
          "Schritt 3: Miss den Wurzelzonen-pH. Hoch → pH-bedingte Mikronährstoffblockade mitbeteiligt.",
          "Schritt 4: Prüfe, ob zusätzlich Cal-Mag dosiert wird, obwohl der Ca-Bedarf bereits gedeckt ist.",
        ],
        checklist: [
          "Wasserhärte/EC des Ausgangswassers prüfen",
          "Cal-Mag-Dosis gegen Wasserchemie abgleichen",
          "Wurzelzonen-pH messen",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. Ca-Zufuhr drosseln: Cal-Mag bei hartem Wasser reduzieren oder weglassen.",
          "2. RO beimischen: Hartes Leitungswasser teilweise durch Umkehrosmose-Wasser ersetzen, um Ca und Carbonate zu senken.",
          "3. pH korrigieren: In den Zielkorridor bringen (Coco/Hydro 5.8–6.2, Erde 6.2–6.8), um Mikronährstoffe freizuschalten.",
          "4. Verhältnis setzen: Ca:Mg auf etwa 3:1 bis 4:1 bringen, Mg nicht blind hochfahren.",
        ],
        checklist: [
          "Cal-Mag bei hartem Wasser reduzieren",
          "RO-Anteil erhöhen, EC neu einstellen",
          "pH in den Zielkorridor bringen",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Miss die Härte/EC deines Ausgangswassers, bevor du Cal-Mag dosierst — hartes Wasser braucht oft keinen Ca-Zusatz.",
          "Dosiere Ca anhand des Zielwerts in der fertigen Lösung statt pauschal nach Produktempfehlung.",
          "Überwache den Drainage-pH, um eine schleichende Anhebung früh zu erkennen.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Ein erhöhter pH durch Ca/Bicarbonat blockiert Fe, Mn und weitere Mikronährstoffe — der Calciumüberschuss tarnt sich dann als Mikronährstoffmangel.",
          "Sehr niedriges VPD-Management mit geringer Transpiration kann die Ca-Verteilung verschlechtern und Mischbilder erzeugen.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Bei hartem Wasser zusätzlich Cal-Mag geben und damit Ca doppelt zuführen.",
          "Den induzierten Mg-Mangel mit mehr Mg statt weniger Ca bekämpfen.",
          "Den steigenden pH übersehen und die Mikronährstoffsymptome als echten Mangel düngen.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Eine Wasseranalyse (Ca, Mg, Carbonathärte) ist die sauberste Grundlage, um die nötige Cal-Mag-Dosis zu bestimmen.",
          "In Coco wird Ca teils gepuffert/abgegeben; das verändert die effektive Ca-Last und sollte einkalkuliert werden.",
        ],
      },
    ],
    warnings: [
      "Gib bei hartem Leitungswasser nicht reflexartig Cal-Mag dazu — prüfe zuerst die Wasserhärte.",
      "Korrigiere den pH mit, sonst bleibt die durch Calcium ausgelöste Mikronährstoffblockade bestehen.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Doppelt hält nicht besser",
        text: "Hartes Wasser bringt oft schon viel Calcium mit. Wer dann noch Cal-Mag dazugibt, überlädt die Pflanze und blockiert Magnesium.",
      },
      {
        title: "Kurz erklärt: Calcium hebt den pH",
        text: "Calciumreiches Wasser ist meist 'hart' und drückt den pH nach oben. Dadurch werden Spurenelemente wie Eisen blockiert — es sieht dann aus wie ein Eisenmangel.",
      },
    ],
    faq: [
      {
        question: "Brauche ich bei hartem Leitungswasser überhaupt Cal-Mag?",
        answer:
          "Meist nicht. Hartes Wasser enthält schon viel Calcium und Magnesium. Ein zusätzlicher Cal-Mag kann dann einen Überschuss und einen induzierten Mg-Mangel auslösen.",
      },
      {
        question: "Warum sieht Calciumüberschuss wie ein Magnesiummangel aus?",
        answer:
          "Weil zu viel Calcium die Magnesiumaufnahme verdrängt. Die Pflanze zeigt die typische interveinale Chlorose, obwohl Magnesium eigentlich dosiert wird.",
      },
      {
        question: "Wie senke ich den Calciumgehalt im Wasser?",
        answer:
          "Mische Umkehrosmose-Wasser bei, um Calcium und Carbonate zu verdünnen, und reduziere oder streiche zusätzliche Cal-Mag-Gaben.",
      },
    ],
    glossary: [
      { term: "Carbonathärte", definition: "Anteil an Bicarbonaten im Wasser, der den pH puffert und nach oben treibt." },
      { term: "Cal-Mag", definition: "Calcium-Magnesium-Zusatz; bei hartem Wasser oft überflüssig und Quelle von Ca-Überschuss." },
      { term: "Umkehrosmose (RO)", definition: "Filterverfahren, das Salze und Härtebildner aus dem Wasser entfernt." },
    ],
    sourceIds: ["marschner-mineral-nutrition", "bryson-plant-nutrition-manual", "bernal-cannabis-nutrient-requirements"],
    relatedSlugs: ["calciummangel", "magnesiummangel", "eisenmangel", "kalium-ueberschuss"],
  },
  {
    slug: "salzanreicherung-hohe-ec",
    title: "Salzstress und hohe EC bei Cannabis erkennen und beheben",
    summary:
      "Eine zu hohe Salzkonzentration im Wurzelraum erzeugt osmotischen Stress: Die Pflanze welkt trotz Feuchte und verbrennt an den Blatträndern. So misst du die EC richtig und spülst gezielt aus.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-06-02",
    tags: ["Salzstress", "EC", "Überdüngung", "Osmotischer Stress", "Diagnose"],
    keyTakeaways: [
      "Salzstress entsteht, wenn die EC im Wurzelraum so hoch ist, dass die Pflanze osmotisch kein Wasser mehr ziehen kann — sie welkt trotz nasser Wurzeln.",
      "Das Drainagewasser ist der entscheidende Messpunkt: eine Drainage-EC deutlich über dem Zulauf zeigt Salzanreicherung an.",
      "Korrektur ist mechanisch: mit pH-korrektem Wasser spülen, bis die Drainage-EC fällt, danach die Düngung niedriger neu aufbauen.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Welke + verbrannte Blattränder trotz Feuchte" },
      { label: "Messpunkt", value: "Drainage-EC vs. Zulauf-EC" },
      { label: "Mechanismus", value: "Osmotischer Stress, Wasseraufnahme blockiert" },
      { label: "Schnellkorrektur", value: "Spülen mit pH-korrektem Wasser" },
      { label: "Prävention", value: "10–20 % Drainage je Gabe" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Salzstress (hohe EC) ist die Folge einer zu hohen Gesamtkonzentration gelöster Salze im Wurzelraum, unabhängig davon, welches Einzelnährstoffion dominiert.",
          "Er ist die gemeinsame Endstrecke vieler Überdüngungsfälle: Egal ob N, K oder Cal-Mag überdosiert wurden — der osmotische Effekt ist ähnlich.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Wasser folgt dem osmotischen Gradienten. Ist die Salzkonzentration außen (Substrat) höher als in der Wurzel, kehrt sich der Fluss um — die Pflanze kann kein Wasser aufnehmen oder verliert es sogar.",
          "Hohe EC schädigt zudem die Feinwurzeln und Wurzelhaare, was die Aufnahme dauerhaft verschlechtert und Sekundärsymptome auslöst.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Erscheinungsbild",
        content: [
          "Das paradoxe Leitbild: Die Pflanze welkt, obwohl das Substrat feucht ist — ein osmotischer, kein hydraulischer Wassermangel.",
          "Hinzu kommen verbrannte, trockene Blattränder und -spitzen (Tipburn), weil die Salzlast das Randgewebe zuerst schädigt.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1 (leicht): Blattränder leicht eingetrocknet, Wuchs verlangsamt, Drainage-EC über Zielwert.",
          "Stadium 2 (mittel): Deutlicher Tipburn, schlaffes Laub trotz Feuchte, dunkleres Gewebe; teils Salzkrusten auf dem Substrat.",
          "Stadium 3 (schwer): Großflächige Randnekrosen, kollabierende Wurzelfunktion, starker Wuchsstopp und in der Blüte Ertragsverlust.",
        ],
        checklist: [
          "Welkt die Pflanze TROTZ feuchter Wurzeln?",
          "Sind Blattränder/-spitzen verbrannt?",
          "Liegt die Drainage-EC über dem Zulauf?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Überdüngung: Zu hohe Dosis oder zu kurzes Intervall ohne Auswaschung.",
          "2. Zu wenig Drainage: Ohne Überschusswasser reichern sich Salze an.",
          "3. Antrocknen zwischen den Gaben: Beim Abtrocknen steigt die EC im Restwasser stark an.",
          "4. Salzreiches Ausgangswasser plus volle Düngerdosis.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Welkt die Pflanze trotz Feuchte? Ja → osmotischen Stress (hohe EC) prüfen, nicht mehr gießen aus Reflex.",
          "Schritt 2: Miss die EC der Drainage und vergleiche mit dem Zulauf. Drainage deutlich höher → Salzanreicherung bestätigt.",
          "Schritt 3: Prüfe das Drainagevolumen je Gabe. Zu wenig → Salze stauen sich.",
          "Schritt 4: Schließe Wurzelfäule aus (Welke trotz Feuchte ist auch dort ein Zeichen) — prüfe Wurzelfarbe und -geruch.",
        ],
        checklist: [
          "Drainage-EC und Zulauf-EC mit kalibriertem Messgerät erfassen",
          "Drainageanteil je Gabe schätzen",
          "Wurzeln zur Abgrenzung gegen Fäule inspizieren",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. Spülen: Mit pH-korrektem Wasser (Coco/Hydro 5.8–6.2, Erde 6.2–6.8) das 1.5–3-fache Topfvolumen durchspülen, bis die Drainage-EC in den Zielbereich fällt.",
          "2. Düngung niedriger neu aufbauen: Nach dem Spülen mit reduzierter EC starten und schrittweise hochtasten.",
          "3. Drainage erhöhen: Künftig 10–20 % Überschusswasser je Gabe einplanen.",
          "4. Intervall anpassen: Substrat nicht extrem austrocknen lassen, um EC-Spitzen zu vermeiden.",
        ],
        checklist: [
          "Mit pH-korrektem Wasser spülen, Drainage-EC kontrollieren",
          "Nach dem Spülen mit niedriger EC neu starten",
          "Drainagefenster dauerhaft auf 10–20 % einstellen",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Dünge nach EC-Zielwerten der Phase und kontrolliere die Drainage-EC regelmäßig.",
          "Plane bei jeder Gabe genug Überschusswasser ein, damit Salze ausgewaschen werden.",
          "Kalibriere das EC-Messgerät regelmäßig — Fehlmessungen führen zu schleichender Überdüngung.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Hohe Temperaturen und niedrige Luftfeuchte (hoher VPD) steigern die Transpiration und damit die Salzaufnahme — Salzstress tritt dann schneller auf.",
          "Hohe EC verstärkt scheinbare Einzelnährstoffmängel, weil die osmotische Bremse die Gesamtaufnahme drosselt.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Die Welke als Wassermangel deuten und noch mehr gießen — das verschärft den osmotischen Stress.",
          "Nur den Zulauf, nie die Drainage messen und so die Anreicherung übersehen.",
          "Nach dem Spülen sofort wieder mit voller Düngerdosis starten.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "In rezirkulierenden Hydro-Systemen steigt die EC durch Wasserverdunstung; regelmäßiges Nachfüllen mit reinem Wasser hält sie stabil.",
          "Die Substrat-EC (1:2- oder Pour-Through-Methode) gibt ein präziseres Bild als die reine Zulaufmessung.",
        ],
      },
    ],
    warnings: [
      "Gieße bei Welke trotz Feuchte NICHT zusätzlich — das ist osmotischer Stress, kein Wassermangel.",
      "Spüle nur mit pH-korrektem Wasser; falscher pH löst beim Spülen zusätzliche Blockaden aus.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum Welke trotz nasser Erde?",
        text: "Ist zu viel Salz im Wasser, kann die Wurzel kein Wasser mehr aufnehmen — egal wie nass es ist. Die Pflanze 'verdurstet' im Nassen.",
      },
      {
        title: "Kurz erklärt: Drainage misst die Wahrheit",
        text: "Nicht der Zulauf zählt, sondern das, was unten herausläuft. Eine hohe Drainage-EC zeigt, dass sich Salze im Topf gestaut haben.",
      },
    ],
    faq: [
      {
        question: "Was ist ein guter EC-Wert für Cannabis?",
        answer:
          "Das hängt von Phase und Substrat ab, aber das Prinzip ist wichtiger als der Einzelwert: Vergleiche immer Drainage- und Zulauf-EC. Liegt die Drainage deutlich höher, reichern sich Salze an — unabhängig vom Absolutwert.",
      },
      {
        question: "Wie unterscheide ich Salzstress von Wurzelfäule?",
        answer:
          "Beide zeigen Welke trotz Feuchte. Bei Salzstress sind die Wurzeln hell und fest und die Drainage-EC hoch; bei Wurzelfäule sind die Wurzeln braun, schleimig und riechen faulig.",
      },
      {
        question: "Wie viel Wasser brauche ich zum Spülen?",
        answer:
          "Etwa das 1.5- bis 3-fache Topfvolumen mit pH-korrektem Wasser, bis die Drainage-EC in den Zielbereich fällt. Danach mit reduzierter Düngung neu aufbauen.",
      },
    ],
    glossary: [
      { term: "EC", definition: "Elektrische Leitfähigkeit als Maß für die Gesamtsalzkonzentration der Lösung." },
      { term: "Osmotischer Stress", definition: "Wassermangel durch zu hohe Salzkonzentration außerhalb der Wurzel, trotz feuchtem Substrat." },
      { term: "Tipburn", definition: "Verbrennung der Blattränder und -spitzen durch Salz-/Nährstoffüberlast." },
    ],
    sourceIds: ["munns-salinity-tolerance", "bugbee-electrical-conductivity", "marschner-mineral-nutrition"],
    relatedSlugs: ["naehrstoffverbrennung-tipburn", "stickstoffueberschuss", "wurzelfaeule", "bewaesserung-ohne-uebergiessen"],
  },
  {
    slug: "naehrstoffverbrennung-tipburn",
    title: "Überdüngung und Nährstoffverbrennung (Nutrient Burn) erkennen und beheben",
    summary:
      "Verbrannte, braune Blattspitzen, die sich nach innen fressen, sind das Leitsymptom der Überdüngung. So grenzt du Nutrient-Burn von Mangel und Lichtstress ab und korrigierst die Dosis.",
    category: "anbau",
    difficulty: "einsteiger",
    readMinutes: 8,
    lastUpdated: "2026-06-02",
    tags: ["Überdüngung", "Nutrient Burn", "Tipburn", "EC", "Diagnose"],
    keyTakeaways: [
      "Nährstoffverbrennung zeigt sich als gleichmäßig braune, vertrocknete BlattSPITZEN, die sich bei anhaltender Überlast nach innen ausbreiten.",
      "Es ist das früheste, häufigste Überdosierungssymptom — meist eine Folge zu hoher EC und damit eng mit Salzstress verwandt.",
      "Korrektur ist einfach: Dosis senken, mit pH-korrektem Wasser spülen und die EC danach phasengerecht niedriger neu aufbauen.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Braune, verbrannte Blattspitzen" },
      { label: "Ausbreitung", value: "Von der Spitze nach innen" },
      { label: "Häufige Ursache", value: "Zu hohe Düngerdosis / EC" },
      { label: "Schnellkorrektur", value: "EC senken, spülen" },
      { label: "Verwandt mit", value: "Salzstress / hohe EC" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Nährstoffverbrennung (Nutrient Burn, Tipburn) ist die sichtbare Folge einer Überdüngung: Die Salz-/Nährstofflast schädigt zuerst das empfindlichste Gewebe — die Blattspitzen.",
          "Sie ist oft das erste Warnzeichen, bevor sich daraus ein ausgewachsener Salzstress mit Welke und Randnekrosen entwickelt.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Die Blattspitzen sind die Endpunkte des Transpirationsstroms; dort akkumulieren überschüssige Salze am stärksten und verbrennen das Gewebe.",
          "Weil der Effekt von der Gesamtsalzlast getrieben wird, ist Nutrient-Burn meist ein EC-Problem, kein Einzelnährstoffdefekt.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Erscheinungsbild",
        content: [
          "Typisch sind gleichmäßig goldgelb bis braun verfärbte, trockene Blattspitzen, oft mit leicht nach oben 'verbranntem' Rand.",
          "Bei anhaltender Überdüngung wandert die Nekrose von der Spitze keilförmig ins Blatt; gesundes Gewebe und totes Gewebe sind scharf abgegrenzt.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1 (leicht): Nur die äußersten Blattspitzen sind goldbraun und trocken, vor allem an den kräftigsten oberen Blättern.",
          "Stadium 2 (mittel): Die Verbrennung greift entlang der Ränder weiter, Blattspitzen wirken 'verbrannt' und gekräuselt.",
          "Stadium 3 (schwer): Großflächige Randnekrosen, Übergang in Salzstress mit Welke und Wuchsstopp.",
        ],
        checklist: [
          "Sind nur die SPITZEN betroffen (nicht das ganze Blatt)?",
          "Sind die kräftigsten/obersten Blätter zuerst betroffen?",
          "Liegt die EC über dem Phasen-Zielwert?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Zu hohe Düngerdosis: EC über dem Phasenbedarf.",
          "2. Gestapelte Zusätze: Basisdünger plus mehrere Booster ohne EC-Kontrolle.",
          "3. Zu wenig Drainage: Salze reichern sich an und erhöhen die effektive Dosis.",
          "4. Empfindliche Genetik/Phase: Sämlinge und Stecklinge verbrennen schon bei moderater EC.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Sind nur die Blattspitzen braun und trocken, das übrige Blatt grün? Ja → Nutrient-Burn wahrscheinlich.",
          "Schritt 2: Sind die kräftigsten, am stärksten transpirierenden Blätter betroffen? Das spricht für Überdüngung, nicht für Mangel (der unten/blass beginnt).",
          "Schritt 3: Miss die EC von Zulauf und Drainage. Über Zielwert → Dosis zu hoch.",
          "Schritt 4: Grenze Lichtstress ab: Lichtverbrennung sitzt direkt unter der Lampe an den obersten Blattflächen, nicht nur an den Spitzen.",
        ],
        checklist: [
          "Spitzen- vs. Ganzblattschaden unterscheiden",
          "EC von Zulauf und Drainage messen",
          "Abstand zur Lampe / PPFD zur Abgrenzung prüfen",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. Dosis senken: Die EC um 0.2–0.4 reduzieren bzw. eine Gabe mit reinem, pH-korrektem Wasser einschieben.",
          "2. Spülen bei stärkerem Befall: Mit pH-korrektem Wasser durchspülen, bis die Drainage-EC sinkt.",
          "3. Neu aufbauen: Mit niedriger EC starten und schrittweise an den Phasenbedarf herantasten.",
          "4. Drainage sichern: 10–20 % Überschusswasser je Gabe, damit sich nichts staut.",
        ],
        checklist: [
          "EC schrittweise senken",
          "Bei stärkerem Befall mit pH-korrektem Wasser spülen",
          "Verbrannte Blattspitzen ergrünen nicht — am Neuaustrieb messen",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Starte neue Pflanzen mit niedriger EC und steigere langsam — 'weniger ist mehr' verhindert die meisten Burns.",
          "Kontrolliere die EC bei jeder gestapelten Zusatzgabe, statt Produkte blind zu kombinieren.",
          "Beobachte Sämlinge und Stecklinge besonders: Sie verbrennen früher als ausgewachsene Pflanzen.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Hoher VPD und starke PPFD erhöhen die Transpiration und damit den Salztransport in die Spitzen — bei knapper Klimaführung verbrennt die Pflanze früher.",
          "Anhaltender Nutrient-Burn geht in osmotischen Salzstress über; beide Themen gehören diagnostisch zusammen.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Verbrannte Spitzen für einen Nährstoffmangel halten und die Dosis weiter erhöhen.",
          "Lichtverbrennung mit Nutrient-Burn verwechseln und am falschen Hebel drehen.",
          "Erwarten, dass die braunen Spitzen wieder grün werden — sie bleiben geschädigt.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Bei wiederkehrendem Burn lohnt eine Substrat-EC-Messung (Pour-Through), um die effektive Wurzelraumlast statt nur den Zulauf zu sehen.",
          "Empfindliche Sorten profitieren von dauerhaft niedrigeren EC-Zielwerten; passe die Rezeptur genotypspezifisch an.",
        ],
      },
    ],
    warnings: [
      "Erhöhe bei verbrannten Spitzen niemals die Dosis — das ist Überdüngung, kein Mangel.",
      "Verbranntes Gewebe regeneriert nicht; bewerte den Erfolg ausschließlich an neuen Blättern.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum die Spitzen zuerst?",
        text: "An den Blattspitzen endet der Wasserstrom. Dort sammelt sich überschüssiges Salz und verbrennt das Gewebe — deshalb werden zuerst die Spitzen braun.",
      },
      {
        title: "Kurz erklärt: Weniger ist mehr",
        text: "Die meisten Verbrennungen kommen von zu viel Dünger. Lieber niedrig dosieren und langsam steigern, als 'auf Verdacht' viel geben.",
      },
    ],
    faq: [
      {
        question: "Werden die verbrannten Blattspitzen wieder grün?",
        answer:
          "Nein. Abgestorbenes Gewebe regeneriert nicht. Wichtig ist, dass keine neuen Blätter mehr verbrennen — beurteile den Erfolg am Neuaustrieb.",
      },
      {
        question: "Wie unterscheide ich Nutrient-Burn von Lichtverbrennung?",
        answer:
          "Nutrient-Burn beginnt an den Blattspitzen und ist EC-getrieben. Lichtverbrennung sitzt an den obersten, lampennächsten Blattflächen und bessert sich mit größerem Lampenabstand.",
      },
      {
        question: "Muss ich bei leichten verbrannten Spitzen sofort spülen?",
        answer:
          "Bei nur leicht betroffenen Spitzen reicht meist eine reduzierte EC oder eine Gabe reines, pH-korrektes Wasser. Erst bei stärkerem Befall ist ein vollständiges Spülen nötig.",
      },
    ],
    glossary: [
      { term: "Nutrient Burn", definition: "Verbrennung des Blattgewebes durch zu hohe Nährstoff-/Salzdosis, beginnend an den Spitzen." },
      { term: "Tipburn", definition: "Speziell die Verbrennung der Blattspitzen als Frühzeichen der Überdüngung." },
      { term: "Pour-Through", definition: "Messmethode, bei der die EC/der pH des durchlaufenden Wassers den Wurzelraum abbildet." },
    ],
    sourceIds: ["caplan-cannabis-fertility-rate", "bugbee-electrical-conductivity", "marschner-mineral-nutrition"],
    relatedSlugs: ["salzanreicherung-hohe-ec", "stickstoffueberschuss", "kaliummangel", "bewaesserung-ohne-uebergiessen"],
  },
  // ===========================================================================
  // WAVE 5 – UMWELT- & KLIMASTRESS (Phase 20)
  // ===========================================================================
  {
    slug: "hitzestress",
    title: "Hitzestress bei Cannabis erkennen und beheben",
    summary:
      "Nach oben gerollte Blattränder (Tacoing), aufrechte 'Beten'-Haltung und randständige Verbrennungen sind die Leitsymptome. So unterscheidest du Hitzestress von echtem Nährstoffmangel und korrigierst über Blatttemperatur, VPD und Luftbewegung.",
    category: "anbau",
    difficulty: "profi",
    readMinutes: 8,
    lastUpdated: "2026-06-02",
    tags: ["Hitzestress", "Temperatur", "VPD", "Klima", "Diagnose"],
    keyTakeaways: [
      "Hitzestress entsteht, wenn die Blatttemperatur dauerhaft über den optimalen Korridor (~24–28 °C Blatt) steigt und die Transpiration die Kühlung nicht mehr leisten kann.",
      "Leitbild ist das nach oben gerollte Blatt (Tacoing) plus aufrechte Blatthaltung — nicht zu verwechseln mit dem nach unten gerollten 'Claw' eines N-Überschusses.",
      "Korrektur heißt: Lufttemperatur und Strahlungslast senken, VPD ins Fenster bringen und Luftbewegung erhöhen — nicht 'mehr düngen'.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Tacoing (Blattränder nach oben), aufrechte Haltung" },
      { label: "Wirkmechanismus", value: "Blatttemperatur > Optimum, Stomata schließen" },
      { label: "Zielkorridor", value: "Lufttemp. 24–28 °C, VPD 1.0–1.5 kPa" },
      { label: "Schnellkorrektur", value: "Strahlungslast/Temp senken, Luft bewegen" },
      { label: "Risiko", value: "Fehldiagnose als Nährstoffmangel/-überschuss" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Hitzestress bezeichnet die Schädigung von Stoffwechsel und Gewebe, wenn die Blatttemperatur dauerhaft über den physiologischen Optimalbereich steigt.",
          "Entscheidend ist die Blatt-, nicht die Lufttemperatur: Unter starker LED-/HPS-Strahlung kann das Blatt mehrere Grad wärmer sein als die Raumluft.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Oberhalb des Temperaturoptimums sinkt die Netto-Photosynthese, weil die Photorespiration steigt und Enzyme (u. a. Rubisco-Aktivase) an Effizienz verlieren.",
          "Steigt die Verdunstungsanforderung (hohes VPD) über die Wassernachlieferung, schließen die Stomata — die Verdunstungskühlung bricht weg und das Blatt heizt weiter auf.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Erscheinungsbild",
        content: [
          "Das Blatt rollt die Ränder nach oben ein (Tacoing), um die bestrahlte Fläche zu verkleinern, und richtet sich auf ('Beten') — beides sind aktive Schutzreaktionen.",
          "Unter der Lampe zeigen sich zuerst die obersten, lampennächsten Blätter; bei anhaltender Last folgen randständige, blasse bis nekrotische Verbrennungen.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1 (leicht): Leichtes Aufstellen der Blätter, beginnendes Tacoing an den lampennächsten Spitzen, abends Erholung.",
          "Stadium 2 (mittel): Dauerhaftes Tacoing, blasse Ränder, gebleichte Stellen direkt unter der Lampe, gehemmtes Streckungswachstum.",
          "Stadium 3 (schwer): Randnekrosen, ausgebleichte 'Foxtails' in der Blüte, lockere Knospen und Aroma-/Ertragsverlust.",
        ],
        checklist: [
          "Rollen die Blattränder nach OBEN (nicht unten)?",
          "Sind nur die lampennächsten Blätter betroffen?",
          "Bessert sich das Bild in der kühleren Nachtphase?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Lampe zu nah / PPFD zu hoch: Strahlungslast übersteigt die Kühlkapazität des Blatts.",
          "2. Zu hohe Lufttemperatur: Schwache Abluft/Zuluft, heißer Außenraum, Sommerbetrieb.",
          "3. Zu hohes VPD: Trockene, heiße Luft erzwingt Stomataschluss trotz feuchtem Substrat.",
          "4. Schwache Luftbewegung: Hitzenester über dem Canopy ohne Umluft.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Rollen die Ränder nach oben (Tacoing) und stehen die Blätter aufrecht? Ja → Hitze/VPD statt Nährstoff prüfen.",
          "Schritt 2: Sind nur die lampennächsten/obersten Blätter betroffen? Ja → Strahlungs-/Temperaturlast wahrscheinlich.",
          "Schritt 3: Miss Lufttemperatur und VPD am Canopy. Temp > 30 °C oder VPD > 1.6 kPa → Hitzestress bestätigt.",
          "Schritt 4: Schließe Wurzelprobleme aus (feuchtes Substrat, aber Welke) — Trockenstress kann ähnlich aussehen.",
        ],
        checklist: [
          "Lufttemperatur am Canopy messen (Ziel 24–28 °C)",
          "VPD am Canopy berechnen (Ziel 1.0–1.5 kPa)",
          "Lampenabstand/PPFD gegen Herstellerempfehlung prüfen",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. Strahlungslast senken: Lampe höher hängen oder dimmen, bis das Tacoing nachlässt.",
          "2. Temperatur regeln: Abluft erhöhen, kühlere Zuluft, Lichtphase in die kühleren Stunden legen.",
          "3. VPD ins Fenster bringen: Bei zu hohem VPD die relative Luftfeuchte anheben, damit die Stomata wieder öffnen.",
          "4. Luft bewegen: Umluft so einstellen, dass der Canopy gleichmäßig umströmt wird, ohne Windbrand zu erzeugen.",
        ],
        checklist: [
          "Lampe dimmen/höher hängen, Reaktion über 2–3 Tage beobachten",
          "Abluft/Zuluft auf Zielklima einstellen",
          "VPD über RH statt über Temperatur allein korrigieren",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Lege einen Klimakorridor fest (Temp 24–28 °C, VPD 1.0–1.5 kPa) und überwache ihn am Canopy, nicht an der Zeltwand.",
          "Plane Sommer-Hitzewellen ein: Lichtphase nachts, stärkere Abluft, ggf. Klimatisierung.",
          "Erhöhe PPFD schrittweise und beobachte das Blattverhalten, statt sofort auf Maximum zu fahren.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Hitze + hohes VPD verschärfen den Wasserbedarf und können einen sekundären Calciummangel (transpirationsabhängig) auslösen.",
          "Dauerhaft hohe Temperaturen begünstigen zudem Spinnmilben, die warm-trockene Bedingungen lieben.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Tacoing (nach oben) mit dem 'Claw' eines N-Überschusses (nach unten) verwechseln und falsch reagieren.",
          "Nur die Temperatur senken, aber das hohe VPD übersehen — die Stomata bleiben geschlossen.",
          "Gegen die vermeintliche 'Verbrennung' düngen, obwohl es Strahlungs-/Hitzestress ist.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Ein Infrarot-Thermometer auf das Blatt zeigt die echte Blatttemperatur und entlarvt Hitzenester, die der Raumsensor nicht sieht.",
          "In CO2-angereicherten Räumen liegt das Temperaturoptimum etwas höher — Hitze und CO2-Strategie müssen zusammen geplant werden.",
        ],
      },
    ],
    warnings: [
      "Erhöhe bei Tacoing nicht die Düngung — du verschärfst die Salzlast, ohne die Hitze zu lösen.",
      "Senke VPD nicht durch Übernässen des Substrats; korrigiere die Luftfeuchte, nicht die Gießmenge.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Das Blatt macht einen Taco",
        text: "Ist es der Pflanze zu heiß, rollt sie die Blattränder nach oben wie eine Taco-Schale, um sich vor der Lampe zu schützen.",
      },
      {
        title: "Kurz erklärt: Schwitzen funktioniert nur mit offenem Fenster",
        text: "Pflanzen kühlen sich durch Verdunsten über die Blattporen. Ist die Luft zu trocken und heiß, schließen die Poren — und das Blatt wird noch wärmer.",
      },
    ],
    faq: [
      {
        question: "Wie unterscheide ich Hitzestress von einem Nährstoffproblem?",
        answer:
          "Hitzestress rollt die Blattränder nach OBEN und betrifft zuerst die lampennächsten Blätter. Nährstoffprobleme zeigen typische Farbmuster (Chlorose) und folgen der Mobilität des Nährstoffs, nicht der Lampennähe.",
      },
      {
        question: "Reicht es, die Lampe höher zu hängen?",
        answer:
          "Oft ja, wenn die Strahlungslast die Ursache ist. Bleibt das Tacoing, sind meist Lufttemperatur oder VPD zu hoch — dann zusätzlich Abluft und Luftfeuchte regeln.",
      },
      {
        question: "Welche Blatttemperatur ist ideal?",
        answer:
          "Grob 24–28 °C am Blatt. Miss mit einem Infrarot-Thermometer direkt am Canopy, da das Blatt unter starker Lampe wärmer ist als die Raumluft.",
      },
    ],
    glossary: [
      { term: "Tacoing", definition: "Nach oben eingerollte Blattränder als Hitzeschutzreaktion (Form einer Taco-Schale)." },
      { term: "VPD", definition: "Dampfdruckdefizit; Maß für die 'Trockenheit' der Luft, das die Transpiration und damit die Blattkühlung steuert." },
      { term: "Blatttemperatur", definition: "Die tatsächliche Temperatur der Blattoberfläche, oft höher als die Raumluft unter Strahlung." },
    ],
    sourceIds: ["chandra-cannabis-photosynthesis-temperature-co2", "wahid-heat-tolerance-overview", "prenger-ling-vpd-greenhouse"],
    relatedSlugs: ["kaeltestress", "vpd-einfach-erklaert", "stickstoffueberschuss", "lichtstress-und-canopy-management"],
  },
  {
    slug: "kaeltestress",
    title: "Kältestress bei Cannabis erkennen und beheben",
    summary:
      "Violett-purpurne Stängel und Blattunterseiten, langsames Wachstum und nach unten gewölbte Blätter sind die Leitsymptome. So trennst du Kältestress von echtem Phosphormangel und stabilisierst Luft- und vor allem Wurzeltemperatur.",
    category: "anbau",
    difficulty: "profi",
    readMinutes: 8,
    lastUpdated: "2026-06-02",
    tags: ["Kältestress", "Temperatur", "Wurzelzone", "Klima", "Diagnose"],
    keyTakeaways: [
      "Kältestress bremst Enzymaktivität, Wurzelaufnahme und Transpiration; oft ist die Wurzelzonentemperatur (< 18 °C) das eigentliche Problem, nicht die Luft.",
      "Typisch sind purpurne Verfärbungen (Anthocyane) an Stängeln/Blattunterseiten plus stark verlangsamtes Wachstum — leicht mit P-Mangel zu verwechseln.",
      "Korrektur heißt: Substrat- und Lufttemperatur anheben, Nachtabsenkung begrenzen und Gießwasser nicht eiskalt verabreichen.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Purpurne Stängel/Blattunterseiten, langsames Wachstum" },
      { label: "Wirkmechanismus", value: "Enzym- & Wurzelaktivität sinken bei Kälte" },
      { label: "Zielkorridor", value: "Luft 20–26 °C, Wurzelzone 18–22 °C" },
      { label: "Schnellkorrektur", value: "Wurzelzone/Luft wärmen, Nachtabsenkung < 8 °C" },
      { label: "Risiko", value: "Fehldiagnose als Phosphormangel" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Kältestress entsteht, wenn Luft- oder Wurzelzonentemperatur unter den physiologischen Optimalbereich fallen und Stoffwechsel sowie Nährstoffaufnahme verlangsamen.",
          "Besonders die Wurzeltemperatur ist entscheidend: Kalte Wurzeln nehmen Wasser und Nährstoffe (v. a. P) schlecht auf, selbst wenn die Luft akzeptabel ist.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Niedrige Temperaturen senken die Aktivität temperaturabhängiger Enzyme und die Membranfluidität; Transport- und Aufnahmeprozesse in der Wurzel werden gebremst.",
          "Als Stressantwort lagert die Pflanze Anthocyane ein — die purpurnen Pigmente, die kältegestresste Stängel und Blattunterseiten typisch verfärben.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Erscheinungsbild",
        content: [
          "Blätter wölben sich oft nach unten und wirken steif; das Wachstum stagniert, weil Zellteilung und -streckung temperaturlimitiert sind.",
          "Die purpurne Färbung beginnt an Stielen und Blattadern der Unterseite — bei kühlen Nächten breitet sie sich auf größere Blattflächen aus.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1 (leicht): Leicht purpurne Stängel, etwas langsameres Wachstum, morgens kühles Substrat.",
          "Stadium 2 (mittel): Deutliche Anthocyan-Färbung, nach unten gewölbte Blätter, sichtbar gehemmte Streckung und Nährstoffaufnahme.",
          "Stadium 3 (schwer): Wachstumsstillstand, Blattschäden bei Frostnähe, Wurzelfäule-Risiko durch kalte, zu nasse Wurzelzone.",
        ],
        checklist: [
          "Sind Stängel/Blattunterseiten purpurn verfärbt?",
          "Ist die Substrat-/Wurzeltemperatur < 18 °C?",
          "Ist die Nacht-/Tag-Differenz größer als ~8–10 °C?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Kalte Wurzelzone: Töpfe auf kaltem Boden, Zelt im ungeheizten Raum, kaltes Gießwasser.",
          "2. Zu starke Nachtabsenkung: Lampe aus + kalter Raum erzeugt einen Kälteschock.",
          "3. Zugluft/Kaltluft: Direkte kalte Zuluft auf die Pflanzen.",
          "4. Genetische Veranlagung: Manche Sorten färben kältebedingt stärker purpurn als andere.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Purpurne Stängel/Blattunterseiten plus langsames Wachstum? Ja → Kälte vor P-Mangel prüfen.",
          "Schritt 2: Miss die Substrat-/Wurzeltemperatur. < 18 °C → Kältestress wahrscheinlich.",
          "Schritt 3: Prüfe die Nachtabsenkung. Tag-Nacht-Differenz > 8–10 °C → Kälteschock möglich.",
          "Schritt 4: Schließe echten P-Mangel aus (pH/EC, gleichmäßige Versorgung) — purpurne Genetik ist kein Mangel.",
        ],
        checklist: [
          "Wurzelzonentemperatur messen (Ziel 18–22 °C)",
          "Tag-/Nacht-Temperaturdifferenz protokollieren",
          "Sorte auf genetische Purpurfärbung prüfen",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. Wurzelzone wärmen: Heizmatte unter die Töpfe, Töpfe vom kalten Boden isolieren.",
          "2. Lufttemperatur stabilisieren: Heizung/Umluft so regeln, dass die Nachtabsenkung unter ~8 °C bleibt.",
          "3. Gießwasser temperieren: Auf Raumtemperatur (ca. 20 °C) bringen, nie eiskalt gießen.",
          "4. Zugluft eliminieren: Kalte Zuluft vorwärmen oder umlenken, damit kein Kaltstrahl auf die Pflanzen trifft.",
        ],
        checklist: [
          "Heizmatte/Isolierung für die Wurzelzone einsetzen",
          "Nachtabsenkung auf < 8 °C begrenzen",
          "Gießwasser auf ~20 °C vortemperieren",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Überwache neben der Luft- gezielt die Wurzelzonentemperatur — sie ist der unterschätzte Hebel.",
          "Plane die Lichtphase so, dass die kälteste Raumphase nicht mit der Dunkelphase zusammenfällt.",
          "Isoliere Töpfe grundsätzlich vom kalten Untergrund (Platte, Untersetzer, Abstandshalter).",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Kalte, nasse Wurzelzonen begünstigen Pythium/Wurzelfäule, weil die Sauerstoffaufnahme sinkt und Pathogene profitieren.",
          "Kälte bremst die Magnesium- und Phosphataufnahme — ein scheinbarer Mangel ist häufig nur ein Temperaturproblem.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Purpurne Stängel reflexartig als P-Mangel mit mehr Phosphor zu 'behandeln'.",
          "Nur die Luft heizen, aber die kalte Wurzelzone (Boden, Gießwasser) übersehen.",
          "Eiskaltes Wasser direkt aus der Leitung geben und damit die Wurzeln schocken.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Eine moderate Nachtabsenkung (5–8 °C) kann Internodien kürzen und Farben fördern — der Grat zwischen gewolltem Effekt und Stress ist schmal.",
          "Bei rein genetisch purpurnen Sorten bleibt das Wachstum normal; Kältestress dagegen geht immer mit Wachstumshemmung einher.",
        ],
      },
    ],
    warnings: [
      "Behandle purpurne Verfärbung nicht automatisch als Phosphormangel — prüfe zuerst die Temperatur.",
      "Vermeide kalte, dauerhaft nasse Wurzelzonen: Sie sind ein direkter Wegbereiter für Wurzelfäule.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Kalte Füße bremsen alles",
        text: "Sind die Wurzeln zu kalt, arbeitet die Pflanze wie in Zeitlupe — sie trinkt und frisst kaum noch, selbst wenn oben alles passt.",
      },
      {
        title: "Kurz erklärt: Lila ist nicht immer Mangel",
        text: "Bei Kälte bildet die Pflanze lila Farbstoffe als Schutz. Das sieht aus wie Phosphormangel, ist aber oft nur die niedrige Temperatur.",
      },
    ],
    faq: [
      {
        question: "Ist die purpurne Färbung gefährlich?",
        answer:
          "Die Farbe selbst nicht. Problematisch ist die Ursache: Geht sie mit gehemmtem Wachstum einher, liegt Kältestress vor und sollte korrigiert werden. Rein genetische Purpurfärbung ohne Wachstumsstopp ist unbedenklich.",
      },
      {
        question: "Luft- oder Wurzeltemperatur — was zählt mehr?",
        answer:
          "Häufig die Wurzeltemperatur. Kalte Wurzeln (< 18 °C) bremsen Aufnahme und Wachstum, auch wenn die Luft in Ordnung ist. Miss daher gezielt im Substrat.",
      },
      {
        question: "Wie warm sollte das Gießwasser sein?",
        answer:
          "Etwa Raumtemperatur, rund 20 °C. Eiskaltes Wasser schockt die Wurzeln und verstärkt den Kältestress.",
      },
    ],
    glossary: [
      { term: "Anthocyane", definition: "Purpurne Pflanzenpigmente, die u. a. als Kälte-Stressantwort eingelagert werden." },
      { term: "Wurzelzonentemperatur", definition: "Temperatur im Substrat/an der Wurzel; steuert Wasser- und Nährstoffaufnahme stark." },
      { term: "Nachtabsenkung", definition: "Temperaturabfall in der Dunkelphase; zu groß wird sie zum Kältestress." },
    ],
    sourceIds: ["theocharis-low-temperature-plants", "chandra-cannabis-photosynthesis-temperature-co2", "pythium-root-rot-hydroponics"],
    relatedSlugs: ["hitzestress", "wurzelfaeule", "magnesiummangel", "vpd-einfach-erklaert"],
  },
  {
    slug: "windbrand",
    title: "Windbrand bei Cannabis erkennen und beheben",
    summary:
      "Verkrümmte, klauenartig nach unten gebogene Blätter direkt im Luftstrom eines Ventilators — ohne Schädlinge und ohne Farbmuster eines Mangels. So erkennst du Windbrand und stellst die Luftbewegung richtig ein.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 7,
    lastUpdated: "2026-06-02",
    tags: ["Windbrand", "Luftbewegung", "Klima", "VPD", "Diagnose"],
    keyTakeaways: [
      "Windbrand ist mechanisch-klimatischer Stress durch zu starke, dauerhafte Direktanströmung — nicht durch Nährstoffe oder Schädlinge.",
      "Leitbild ist lokal begrenzter Schaden genau dort, wo der Luftstrom auftrifft: verkrümmte, nach unten gebogene Blätter, oft mit dunkler 'Klaue'.",
      "Korrektur heißt: Ventilator nicht direkt auf den Canopy richten, sondern für sanfte, indirekte Umluft sorgen, die die Blätter nur leicht wiegt.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Verkrümmte 'Klauen' nur im direkten Luftstrom" },
      { label: "Wirkmechanismus", value: "Dauer-Direktanströmung + lokale Austrocknung" },
      { label: "Zielbild", value: "Blätter wiegen sich leicht, kein Dauerdruck" },
      { label: "Schnellkorrektur", value: "Ventilator umlenken/abschwächen" },
      { label: "Risiko", value: "Fehldiagnose als N-Überschuss oder Schädling" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Windbrand bezeichnet die Schädigung von Blättern durch zu starke, dauerhaft auf dieselbe Stelle gerichtete Luftbewegung.",
          "Er ist primär mechanisch-klimatisch: Der Dauerwind belastet das Gewebe und trocknet die angeströmten Blätter lokal stärker aus.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Konstante starke Anströmung erhöht lokal die Transpiration und den mechanischen Reiz; die betroffenen Blätter verlieren mehr Wasser, als die Pflanze dort nachliefert.",
          "Die Folge ist eine lokale Überlagerung aus mechanischem Stress und kleinräumig erhöhtem VPD — beschränkt auf die Trefferzone des Luftstroms.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Erscheinungsbild",
        content: [
          "Betroffene Blätter krümmen und verdrehen sich, biegen sich nach unten und können eine dunkle, klauenartige Form annehmen.",
          "Charakteristisch ist die scharfe räumliche Begrenzung: Nur die direkt angeströmten Blätter sind betroffen, der Rest der Pflanze bleibt unauffällig.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1 (leicht): Leichtes Verdrehen und Nach-unten-Biegen einzelner Blätter im Luftstrom.",
          "Stadium 2 (mittel): Deutliche 'Klauen' und Verkrümmungen, lederartige Blattstruktur in der Trefferzone.",
          "Stadium 3 (schwer): Vertrocknete Blattränder/-spitzen lokal, Wachstumsbeeinträchtigung der angeströmten Triebe.",
        ],
        checklist: [
          "Sind nur Blätter im direkten Ventilatorstrom betroffen?",
          "Fehlen Schädlinge (Lupe!) und typische Mangel-Farbmuster?",
          "Verschwindet das Bild nach Umlenken des Lüfters bei Neuwuchs?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Ventilator direkt und dauerhaft auf den Canopy gerichtet.",
          "2. Zu starke Umluft für die Zeltgröße/Pflanzenzahl.",
          "3. Feststehender Lüfter ohne Schwenkfunktion, der immer dieselbe Stelle trifft.",
          "4. Pflanzen zu nah an der Abluft-/Zuluftöffnung mit konzentriertem Luftstrom.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Sind die Schäden räumlich exakt dort, wo der Luftstrom auftrifft? Ja → Windbrand wahrscheinlich.",
          "Schritt 2: Schädlinge mit der Lupe ausschließen (keine Milben/Thripse/Kot).",
          "Schritt 3: Mangel-/Überschuss-Muster ausschließen (keine systemische Chlorose, kein flächiges Bild).",
          "Schritt 4: Lüfter umlenken und Neuwuchs beobachten — bleibt der Neuwuchs gesund, war es Windbrand.",
        ],
        checklist: [
          "Trefferzone des Luftstroms mit Schadensbild abgleichen",
          "Blattunterseiten mit Lupe auf Schädlinge prüfen",
          "Neuwuchs nach Lüfterkorrektur kontrollieren",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. Luftstrom umlenken: Ventilator nicht auf, sondern über/unter dem Canopy oder gegen eine Wand richten, um indirekte Umluft zu erzeugen.",
          "2. Intensität senken: Drehzahl reduzieren oder Abstand vergrößern, bis sich die Blätter nur noch sanft wiegen.",
          "3. Schwenkbetrieb nutzen: Oszillierende Lüfter verteilen die Last, statt eine Stelle dauerhaft zu treffen.",
          "4. Geschädigte Blätter belassen: Sie regenerieren nicht, schaden aber nicht — entscheidend ist gesunder Neuwuchs.",
        ],
        checklist: [
          "Ventilator auf indirekte Umluft umstellen",
          "Drehzahl/Abstand bis zum 'sanften Wiegen' anpassen",
          "Oszillation aktivieren, wenn vorhanden",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Ziel ist eine gleichmäßige, sanfte Luftbewegung im ganzen Zelt — die Blätter sollen sich leicht bewegen, nicht im Dauerwind flattern.",
          "Positioniere Lüfter so, dass die Luft zirkuliert (an Wänden entlang), statt frontal auf Pflanzen zu blasen.",
          "Passe die Luftbewegung beim Höhenwachstum regelmäßig an, damit kein Trieb in den Dauerstrahl wächst.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Gute, sanfte Luftbewegung ist erwünscht: Sie stärkt die Stängel und beugt Schimmel/Mehltau vor — nur der Dauer-Direktstrahl ist schädlich.",
          "Bei ohnehin hohem VPD verstärkt der Direktwind die lokale Austrocknung; Klima und Luftbewegung sollten zusammen betrachtet werden.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Windbrand als N-Überschuss ('Claw') fehldeuten und die Düngung umstellen.",
          "Den Lüfter weiter direkt laufen lassen, weil 'viel Wind' pauschal als gut gilt.",
          "Geschädigte Blätter panisch entfernen, statt einfach die Luftführung zu korrigieren.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Etwas Bewegung ('thigmomorphogenese') kräftigt die Stiele — das Ziel ist Stimulation, nicht Dauerstress.",
          "In großen Zelten ist eine gleichmäßige, vielfach gebrochene Luftströmung besser als wenige starke Punktquellen.",
        ],
      },
    ],
    warnings: [
      "Verwechsle Windbrand nicht mit einem Stickstoffüberschuss — beim Windbrand ist der Schaden streng auf den Luftstrom begrenzt.",
      "Schalte die Umluft nicht komplett ab: Stehende, feuchte Luft fördert Schimmel und Mehltau.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Dauerföhn aufs Blatt",
        text: "Bläst ein Ventilator ständig auf dieselbe Stelle, ist das wie ein Dauerföhn — die Blätter dort verkrümmen und trocknen aus, der Rest bleibt gesund.",
      },
      {
        title: "Kurz erklärt: Wiegen ja, flattern nein",
        text: "Richtig eingestellte Luft lässt die Blätter sanft wiegen. Flattern sie dauerhaft im Strahl, ist der Wind zu stark.",
      },
    ],
    faq: [
      {
        question: "Wie unterscheide ich Windbrand von einem Nährstoffüberschuss?",
        answer:
          "Windbrand ist räumlich eng auf die Trefferzone des Luftstroms begrenzt und hat keine systemischen Farbmuster. Ein N-Überschuss ('Claw') tritt flächiger und unabhängig vom Ventilator auf.",
      },
      {
        question: "Soll ich die geschädigten Blätter abschneiden?",
        answer:
          "Nicht nötig. Sie regenerieren zwar nicht, schaden aber nicht. Wichtiger ist, die Luftführung zu korrigieren, damit der Neuwuchs gesund bleibt.",
      },
      {
        question: "Wie viel Luftbewegung ist richtig?",
        answer:
          "So viel, dass sich die Blätter sanft wiegen. Indirekte, zirkulierende Umluft im ganzen Zelt ist besser als ein starker Strahl auf einzelne Pflanzen.",
      },
    ],
    glossary: [
      { term: "Windbrand", definition: "Blattschaden durch zu starke, dauerhaft direkte Luftanströmung." },
      { term: "Umluft", definition: "Im Raum zirkulierende Luftbewegung zur gleichmäßigen Klimatisierung." },
      { term: "Thigmomorphogenese", definition: "Wachstumsanpassung (z. B. kräftigere Stiele) als Reaktion auf mechanische Reize wie Wind." },
    ],
    sourceIds: ["prenger-ling-vpd-greenhouse", "ipm-cannabis-arthropods"],
    relatedSlugs: ["hitzestress", "vpd-einfach-erklaert", "stickstoffueberschuss", "lichtstress-und-canopy-management"],
  },
  {
    slug: "luftfeuchte-management",
    title: "Luftfeuchte-Probleme bei Cannabis: zu hoch und zu niedrig diagnostizieren",
    summary:
      "Zu hohe RH öffnet Schimmel- und Mehltaufenster, zu niedrige RH erzwingt Stomataschluss und transpirationsbedingte Mängel. So liest du die relative Luftfeuchte über das VPD-Fenster der jeweiligen Phase und korrigierst gezielt.",
    category: "anbau",
    difficulty: "profi",
    readMinutes: 9,
    lastUpdated: "2026-06-02",
    tags: ["Luftfeuchte", "RH", "VPD", "Klima", "Diagnose"],
    keyTakeaways: [
      "Relative Luftfeuchte (RH) ist nur im Zusammenspiel mit der Temperatur sinnvoll — gesteuert wird letztlich das VPD, nicht die RH-Zahl allein.",
      "Zu hohe RH (niedriges VPD) bremst die Transpiration und öffnet Schimmel-/Mehltaufenster; zu niedrige RH (hohes VPD) erzwingt Stomataschluss und transpirationsbedingte Mängel.",
      "Korrektur richtet sich nach Phase: Sämling/Veg eher feuchter, späte Blüte deutlich trockener — immer über das VPD-Zielfenster, nicht über Bauchgefühl.",
    ],
    quickFacts: [
      { label: "Leitgröße", value: "VPD statt RH allein (Temp + RH zusammen)" },
      { label: "Zu hoch (Risiko)", value: "Schimmel/Botrytis/Mehltau, langsame Transpiration" },
      { label: "Zu niedrig (Risiko)", value: "Stomataschluss, Ca-/Welkesymptome" },
      { label: "VPD-Korridor", value: "Veg ~0.8–1.1, Blüte ~1.2–1.5 kPa" },
      { label: "Schnellkorrektur", value: "Be-/Entfeuchter + Luftbewegung, phasengerecht" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Luftfeuchte-Probleme umfassen sowohl zu hohe als auch zu niedrige relative Luftfeuchte (RH) und sind eine der häufigsten Ursachen für scheinbare 'Nährstoffprobleme'.",
          "Die RH-Zahl allein sagt wenig: Erst zusammen mit der Temperatur ergibt sie das VPD, das die Transpiration und damit Wasser- und Nährstofftransport steuert.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Das VPD beschreibt, wie viel Wasserdampf die Luft noch aufnehmen kann. Niedriges VPD (feucht) bremst die Verdunstung, hohes VPD (trocken) treibt sie an.",
          "Bei zu niedrigem VPD stockt der Transpirationsstrom — Calcium (rein transpirationsgetrieben) wird schlecht verteilt. Bei zu hohem VPD schließen die Stomata, Photosynthese und Aufnahme sinken.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Erscheinungsbild",
        content: [
          "Zu feucht: schlaffe, langsam wachsende Pflanzen, Kondens-/Schimmelgefahr, ideale Bedingungen für Botrytis und Echten Mehltau.",
          "Zu trocken: nach oben gerollte/krause Blätter, schnelle Austrocknung des Substrats, Ca-Mangel- und Welkebilder trotz ausreichender Versorgung.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Zu hoch – leicht: träges Wachstum, Substrat trocknet kaum ab; mittel: erste Mehltau-/Schimmelnester; schwer: Bud Rot in dichten Knospen.",
          "Zu niedrig – leicht: leicht aufgerollte Blätter, schneller Gießbedarf; mittel: Ca-Mangelbilder, Spitzenwelke; schwer: Stomataschluss, deutliche Wachstumshemmung.",
          "Mischfälle: Schwankende RH (Tag/Nacht) erzeugt abwechselnd beide Bilder und macht die Diagnose unübersichtlich.",
        ],
        checklist: [
          "Wie hoch ist die RH UND die Temperatur am Canopy?",
          "Liegt das resultierende VPD im Phasenfenster?",
          "Gibt es Schimmel-/Mehltauzeichen (zu feucht) oder Welke/Roll (zu trocken)?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Falsches Phasen-Setpoint: Späte Blüte zu feucht oder Sämlinge/Stecklinge zu trocken geführt.",
          "2. Schwache Klimakontrolle: Kein Be-/Entfeuchter, RH folgt dem Außenklima.",
          "3. Tag/Nacht-Schwankung: RH steigt nachts (Lampe aus) stark an — Schimmelfenster.",
          "4. Transpirationslast: Volles Zelt erhöht die RH, leeres/junges Zelt senkt sie.",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Miss RH UND Temperatur am Canopy und berechne das VPD.",
          "Schritt 2: VPD zu niedrig (z. B. < 0.8 kPa in der Blüte)? → 'zu feucht'-Pfad: Schimmel-/Mehltau-Risiko prüfen.",
          "Schritt 3: VPD zu hoch (z. B. > 1.6 kPa)? → 'zu trocken'-Pfad: Roll-/Welke-/Ca-Bilder prüfen.",
          "Schritt 4: Prüfe die Tag/Nacht-Differenz — nächtliche RH-Spitzen sind ein eigener Risikofall.",
        ],
        checklist: [
          "VPD aus RH + Temperatur berechnen (VPD-Rechner)",
          "Phasenfenster für VPD festlegen (Veg vs. Blüte)",
          "Nacht-RH separat protokollieren",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. Zu feucht: Entfeuchter einsetzen, Abluft erhöhen, Bestand auslichten, Nacht-RH gezielt senken (späte Blüte 40–50 %).",
          "2. Zu trocken: Befeuchter einsetzen, Abluft drosseln, RH anheben (Sämling/Veg höher); junge Pflanzen brauchen mehr Feuchte.",
          "3. Immer über VPD steuern: RH und Temperatur gemeinsam einstellen, statt nur an einer Schraube zu drehen.",
          "4. Luftbewegung sichern: Sanfte Umluft beugt feuchten Mikroklimata vor, ohne Windbrand zu erzeugen.",
        ],
        checklist: [
          "Be-/Entfeuchter phasengerecht einsetzen",
          "Nacht-RH in der späten Blüte auf 40–50 % drücken",
          "VPD als Zielgröße führen, nicht die nackte RH-Zahl",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Lege pro Phase ein VPD-Zielfenster fest (Veg feuchter, Blüte trockener) und überwache es am Canopy.",
          "Plane die nächtliche RH-Spitze ein: Entfeuchtung/Umluft müssen auch in der Dunkelphase greifen.",
          "Passe Be-/Entfeuchtung an die Belegung an — ein voll werdendes Zelt verschiebt die RH nach oben.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "Zu niedriges VPD ist der wichtigste Wegbereiter für Botrytis (Bud Rot) und Echten Mehltau — beide brauchen feuchte, stehende Luft.",
          "Zu hohes VPD erzeugt transpirationsbedingte Calciummangel- und Welkebilder, die fälschlich als Düngungsfehler gedeutet werden.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Nur die RH-Zahl ansteuern und die Temperatur ignorieren — das VPD bleibt unkontrolliert.",
          "Die nächtliche RH-Spitze in der späten Blüte übersehen und so Bud Rot riskieren.",
          "Bei trockenheitsbedingtem Ca-Mangel mehr Cal-Mag geben, statt die Luftfeuchte/VPD zu korrigieren.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "Sämlinge/Stecklinge mit kleiner Wurzelmasse brauchen hohe RH (niedriges VPD), um nicht zu welken — hier ist 'zu feucht' phasengerecht.",
          "In der späten Blüte ist konsequent niedrige RH die billigste Schimmelprävention; sie schlägt jedes Fungizid.",
        ],
      },
    ],
    warnings: [
      "Steuere nie die RH-Zahl isoliert — ohne die Temperatur ist sie für die Pflanze bedeutungslos. Führe das VPD.",
      "Halte die Luftfeuchte in der späten Blüte niedrig (40–50 %): Nächtliche RH-Spitzen sind die häufigste Bud-Rot-Ursache.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Wie voll ist der Luft-Schwamm?",
        text: "Luft ist wie ein Schwamm für Wasser. Ist er fast voll (hohe Feuchte), kann die Pflanze kaum noch 'schwitzen'. Ist er sehr trocken, saugt er der Pflanze zu schnell Wasser ab.",
      },
      {
        title: "Kurz erklärt: Jung feucht, alt trocken",
        text: "Junge Pflanzen mögen es feuchter, späte Blüten brauchen es trocken. So vermeidest du Schimmel, ohne junge Pflanzen austrocknen zu lassen.",
      },
    ],
    faq: [
      {
        question: "Warum reicht die RH-Zahl allein nicht?",
        answer:
          "Weil dieselbe RH bei unterschiedlichen Temperaturen ein völlig anderes VPD ergibt. Entscheidend für Transpiration und Schimmelrisiko ist das VPD aus Temperatur und RH zusammen.",
      },
      {
        question: "Welche RH ist in der Blüte ideal?",
        answer:
          "Eher trocken: In der späten Blüte 40–50 %, um Bud Rot und Mehltau vorzubeugen. Junge Pflanzen vertragen und brauchen deutlich mehr Feuchte.",
      },
      {
        question: "Meine Pflanze welkt trotz feuchtem Substrat — was ist los?",
        answer:
          "Häufig ist die Luft zu trocken (hohes VPD): Die Stomata schließen und die Wasserverteilung stockt. Prüfe das VPD und hebe die RH an, statt mehr zu gießen.",
      },
    ],
    glossary: [
      { term: "Relative Luftfeuchte (RH)", definition: "Anteil des aktuellen Wasserdampfs an der maximal möglichen Menge bei gegebener Temperatur." },
      { term: "VPD", definition: "Dampfdruckdefizit; kombiniert Temperatur und RH zur eigentlichen Steuergröße für Transpiration." },
      { term: "Setpoint", definition: "Zielwert, auf den die Klimasteuerung (z. B. RH/VPD) geregelt wird." },
    ],
    sourceIds: ["prenger-ling-vpd-greenhouse", "punja-cannabis-pathogens", "botrytis-grey-mold-review"],
    relatedSlugs: ["vpd-einfach-erklaert", "bud-rot-botrytis", "echter-mehltau-powdery-mildew", "calciummangel"],
  },
  {
    slug: "co2-management",
    title: "CO₂-Mangel und -Überschuss bei Cannabis erkennen und steuern",
    summary:
      "Unter starker Beleuchtung wird CO₂ zum limitierenden Faktor: Stagnierende Photosynthese trotz optimalem Licht, Klima und Dünger deutet auf CO₂-Mangel. So erkennst du das Limit und setzt Anreicherung sicher und sinnvoll ein.",
    category: "anbau",
    difficulty: "profi",
    readMinutes: 8,
    lastUpdated: "2026-06-02",
    tags: ["CO2", "Photosynthese", "Klima", "Lichtsättigung", "Diagnose"],
    keyTakeaways: [
      "CO₂ wird erst bei hohem Licht zum Engpass: Stagniert die Leistung trotz optimalem PPFD, Klima und Dünger, ist oft CO₂ der limitierende Faktor.",
      "CO₂-Mangel hat kein eindeutiges Einzelsymptom — er ist ein Ausschluss- und Leistungsbefund: 'alles passt, aber es geht nicht schneller voran'.",
      "Anreicherung lohnt nur bei hohem Licht und dichtem Setup und erfordert höhere Zieltemperaturen sowie strikte Sicherheits-/Mess-Disziplin.",
    ],
    quickFacts: [
      { label: "Leitbefund", value: "Leistungsplateau trotz optimalem Licht/Klima/Dünger" },
      { label: "Wirkmechanismus", value: "CO₂ limitiert Photosynthese bei Lichtsättigung" },
      { label: "Umgebung", value: "~400 ppm normal; Anreicherung 800–1200 ppm" },
      { label: "Voraussetzung", value: "Hohes PPFD + höhere Zieltemperatur (28–30 °C)" },
      { label: "Risiko", value: "CO₂ ist erstickend — Mess-/Sicherheitspflicht" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "CO₂-Management betrifft sowohl den Mangel (limitierende CO₂-Versorgung bei hohem Licht) als auch den unsachgemäßen Überschuss bei der Anreicherung.",
          "In einem dicht belegten, gut beleuchteten Zelt kann die CO₂-Konzentration unter den Außenwert fallen, wenn der Luftwechsel zu gering ist — dann limitiert CO₂ die Photosynthese.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Photosynthese braucht Licht UND CO₂. Bei niedrigem Licht limitiert das Licht; bei hohem Licht (Lichtsättigung) wird CO₂ zum begrenzenden Substrat.",
          "Erhöhtes CO₂ verschiebt das Temperaturoptimum nach oben: Mit Anreicherung profitiert die Pflanze von höheren Temperaturen (etwa 28–30 °C), die ohne CO₂ schon Hitzestress wären.",
        ],
      },
      {
        heading: "Pflanzenphysiologie und Erscheinungsbild",
        content: [
          "CO₂-Mangel zeigt kein klassisches Blattsymptom — er äußert sich als ausbleibender Leistungszuwachs: Wachstum und Ertrag bleiben hinter dem Potenzial zurück, obwohl alle anderen Faktoren stimmen.",
          "CO₂-Überschuss/Anreicherung ohne Begleitanpassung führt indirekt zu Problemen: zu niedrige Temperatur verschenkt den Effekt, zu hohe Konzentration ist eine Gefahr für Menschen.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1 (Verdacht): Leistung plateaut trotz optimalem PPFD, VPD und Düngung — kein Mangelbild erkennbar.",
          "Stadium 2 (bestätigt): CO₂-Messung im dichten Zelt liegt deutlich unter 400 ppm in der Lichtphase.",
          "Überschuss/Fehleinsatz: Anreicherung bei zu niedriger Temperatur (kein Mehrertrag) oder gefährlich hohe ppm ohne Belüftung/Sicherheit.",
        ],
        checklist: [
          "Sind Licht (PPFD), VPD und Dünger nachweislich im Optimum?",
          "Liegt die gemessene CO₂-Konzentration in der Lichtphase unter ~400 ppm?",
          "Wäre überhaupt genug Licht da, damit CO₂ zum Limit wird?",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Zu geringer Luftwechsel in dicht belegtem, hell beleuchtetem Zelt: CO₂ wird schneller verbraucht als nachgeliefert.",
          "2. Geschlossener Raum ohne Frischluft, nur Umluft.",
          "3. Hohes Licht ohne CO₂-Strategie: Lichtpotenzial kann ohne CO₂ nicht ausgeschöpft werden.",
          "4. Fehlerhafte Anreicherung: zu wenig (wirkungslos) oder zu viel/ungeregelt (gefährlich).",
        ],
      },
      {
        heading: "Diagnose — Regelbasierter Entscheidungsbaum",
        content: [
          "Schritt 1: Sind Licht, Klima (VPD/Temperatur) und Düngung nachweislich optimal und es geht trotzdem nicht voran? → CO₂ als Limit in Betracht ziehen.",
          "Schritt 2: Miss die CO₂-Konzentration in der Lichtphase. Deutlich < 400 ppm → CO₂-Mangel bestätigt.",
          "Schritt 3: Prüfe, ob genug Licht (hohes PPFD) vorhanden ist — bei schwachem Licht bringt CO₂ nichts.",
          "Schritt 4: Vor Anreicherung Temperaturstrategie und Sicherheit (Sensor, Belüftung, Alarm) klären.",
        ],
        checklist: [
          "CO₂-Konzentration in der Lichtphase messen",
          "PPFD-Niveau gegen Lichtsättigung prüfen",
          "Sicherheits-/Mess-Setup für Anreicherung verifizieren",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. Erst lüften: In den meisten Zelten löst ausreichender Luftwechsel den CO₂-Mangel bereits, ohne aktive Anreicherung.",
          "2. Anreicherung nur bei hohem Licht: 800–1200 ppm sinnvoll, wenn PPFD hoch und das Setup dicht und steuerbar ist.",
          "3. Temperatur mitziehen: Mit CO₂ die Zieltemperatur auf ~28–30 °C anheben, sonst verpufft der Effekt.",
          "4. Sicherheit zuerst: CO₂-Sensor/-Regler, Belüftungskonzept und Alarm — CO₂ ist in hoher Konzentration erstickend.",
        ],
        checklist: [
          "Luftwechsel erhöhen, bevor angereichert wird",
          "Anreicherung an hohes PPFD koppeln",
          "Temperatur-Setpoint mit CO₂ anheben",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Sorge für ausreichenden Frischluftaustausch passend zur Pflanzenmasse und Lichtleistung.",
          "Treffe die CO₂-Entscheidung bewusst: Ohne hohes Licht ist Anreicherung Geldverschwendung und Risiko.",
          "Wenn angereichert wird, behandle CO₂ wie ein technisches System mit Sensor, Regelung und Sicherheitskonzept.",
        ],
      },
      {
        heading: "Umwelt- und Nährstoffwechselwirkungen",
        content: [
          "CO₂-Anreicherung erhöht Photosyntheserate und Wasser-/Nährstoffbedarf — EC und Bewässerung müssen mitskaliert werden.",
          "Höhere Zieltemperaturen unter CO₂ verschieben das VPD-Fenster; Klima, Licht und CO₂ bilden ein gekoppeltes System.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "CO₂ anreichern, obwohl das Licht zu schwach ist — ohne Lichtsättigung bringt CO₂ keinen Mehrertrag.",
          "Mit CO₂ die Temperatur nicht anheben und so den Effekt verschenken.",
          "CO₂ ohne Sensor/Regelung und Sicherheitskonzept einsetzen — gefährlich für Menschen.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "CO₂ lohnt typischerweise erst in versiegelten, stark beleuchteten Räumen mit aktiver Klimatisierung — im einfachen Abluftzelt selten.",
          "Eine CO₂-Bilanz (Verbrauch vs. Nachlieferung) hilft, den Luftwechsel statt teurer Anreicherung als erste Lösung zu erkennen.",
        ],
      },
    ],
    warnings: [
      "CO₂ ist in hoher Konzentration erstickend: Setze Anreicherung nur mit Sensor, Regelung und Sicherheitskonzept ein.",
      "Reichere CO₂ nicht bei schwachem Licht an — ohne Lichtsättigung entsteht kein Mehrertrag, nur Kosten und Risiko.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Zwei Zutaten fürs Wachstum",
        text: "Die Pflanze braucht Licht UND CO₂. Ist das Licht stark, aber CO₂ knapp, ist es wie ein voller Motor mit zu wenig Luft — er dreht nicht hoch.",
      },
      {
        title: "Kurz erklärt: Mehr CO₂ nur mit mehr Wärme",
        text: "Extra CO₂ wirkt nur, wenn es auch wärmer ist. Ohne höhere Temperatur verpufft der Effekt — und ohne starkes Licht bringt CO₂ gar nichts.",
      },
    ],
    faq: [
      {
        question: "Woran erkenne ich CO₂-Mangel?",
        answer:
          "Nicht an einem Blattsymptom, sondern am Leistungsplateau: Licht, VPD und Dünger sind optimal, aber es geht nicht schneller voran. Eine CO₂-Messung unter ~400 ppm in der Lichtphase bestätigt den Verdacht.",
      },
      {
        question: "Brauche ich eine CO₂-Anlage?",
        answer:
          "Meist nicht. Ausreichender Luftwechsel hält CO₂ nahe dem Außenwert. Aktive Anreicherung lohnt nur bei hohem Licht in dichten, versiegelten Setups.",
      },
      {
        question: "Welche CO₂-Werte sind sinnvoll?",
        answer:
          "Umgebungsluft liegt bei ~400 ppm. Bei sinnvoller Anreicherung mit hohem Licht sind 800–1200 ppm üblich — immer mit Sensor, Regelung und Sicherheitsvorkehrungen.",
      },
    ],
    glossary: [
      { term: "ppm", definition: "Parts per million; Maßeinheit der CO₂-Konzentration in der Luft (~400 ppm Außenluft)." },
      { term: "Lichtsättigung", definition: "Punkt, ab dem mehr Licht keine Mehrleistung bringt, weil CO₂ zum Limit wird." },
      { term: "CO₂-Anreicherung", definition: "Gezielte Erhöhung der CO₂-Konzentration zur Steigerung der Photosynthese bei hohem Licht." },
    ],
    sourceIds: ["chandra-cannabis-photosynthesis-temperature-co2", "mortensen-co2-enrichment-review", "prenger-ling-vpd-greenhouse"],
    relatedSlugs: ["hitzestress", "vpd-einfach-erklaert", "lichtstress-und-canopy-management", "vpd-und-ec-kombi-rechner-guide"],
  },
  // ===========================================================================
  // WAVE 6 – BLOCKADEN, WURZELSTRESS & ERWEITERTE SCHÄDLINGE (PHASE 21)
  // ===========================================================================
  {
    slug: "ph-lockout",
    title: "pH-Lockout bei Cannabis erkennen und beheben",
    summary:
      "Mehrere scheinbar unabhängige Mangelsymptome gleichzeitig sind das Leitsignal für pH-Lockout, nicht für einen echten Nährstoffmangel. So erkennst du die Blockade und korrigierst sie, ohne blind nachzudüngen.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-08-03",
    tags: ["pH", "Lockout", "Blockade", "Diagnose", "Nährstoffe"],
    keyTakeaways: [
      "pH-Lockout zeigt sich fast immer als KOMBINATION mehrerer Mangelbilder gleichzeitig (z. B. Fe-, Mn- und Mg-Symptome parallel) — ein einzelnes, isoliertes Mangelbild spricht eher für echten Einzelmangel.",
      "Die häufigste Ursache für 'unerklärlichen' Lockout ist nicht das Substrat, sondern ein unkalibriertes oder verschmutztes pH-Messgerät — das zuerst prüfen, bevor am Dünger geschraubt wird.",
      "pH-Korrekturen schrittweise über mehrere Gießgänge vornehmen (max. 0.3–0.5 Einheiten pro Tag) — ein abrupter Sprung wirkt selbst wie ein Stressor auf die Wurzel."
    ],
    quickFacts: [
      { label: "pH-Fenster Coco/Hydro", value: "5.8–6.2" },
      { label: "pH-Fenster Erde", value: "6.0–6.8" },
      { label: "Leitsymptom", value: "Mehrere Mangelbilder gleichzeitig" },
      { label: "Häufigste Fehlerquelle", value: "Unkalibriertes pH-Messgerät" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "pH-Lockout ist ein Zustand, in dem Nährstoffe im Substrat oder in der Nährlösung chemisch vorhanden, aber aufgrund eines ungünstigen pH-Werts nicht in pflanzenverfügbarer Form gelöst oder aufnehmbar sind.",
          "Im Unterschied zu einem einzelnen Nährstoffmangel betrifft Lockout meist mehrere Nährstoffe gleichzeitig, weil die Löslichkeit verschiedenster Ionen im selben pH-Bereich einbricht.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Die Löslichkeit von Mikronährstoffen wie Eisen, Mangan, Zink und Kupfer sinkt bei steigendem pH drastisch, weil sie oberhalb von etwa pH 6.5–7 zu unlöslichen Hydroxiden ausfallen.",
          "Phosphor bildet bei hohem pH unlösliche Calciumphosphate und bei niedrigem pH unlösliche Eisen-/Aluminiumphosphate — sein nutzbares Fenster ist dadurch besonders schmal und mittig.",
          "Weil mehrere dieser Löslichkeitskurven im selben pH-Bereich kippen, äußert sich ein pH-Fehler fast nie als isolierter Einzelmangel, sondern als Kombination mehrerer Symptome.",
        ],
      },
      {
        heading: "Symptome nach Muster",
        content: [
          "Kombiniertes Mangelbild: interveinale Chlorose an jungen UND alten Blättern gleichzeitig, teils mit unterschiedlichen Mustern auf derselben Pflanze.",
          "Wachstumsstillstand trotz augenscheinlich korrekter Düngerkonzentration und regelmäßiger Fütterung.",
          "Symptome, die trotz erhöhter Nährstoffgabe nicht besser, sondern durch die zusätzliche Salzlast eher schlechter werden.",
        ],
        checklist: [
          "Prüfen, ob mehr als ein Mangelmuster gleichzeitig sichtbar ist",
          "pH-Messgerät vor jeder weiteren Maßnahme kalibrieren",
          "Substrat-/Drainage-pH direkt messen, nicht nur den Zulauf",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Unkalibriertes oder verschmutztes pH-Messgerät: die mit Abstand häufigste Ursache für vermeintlich 'unerklärlichen' Lockout — die angezeigten Werte stimmen schlicht nicht.",
          "2. Hartes Leitungswasser ohne Anpassung: hoher Karbonatgehalt puffert den pH nach oben und treibt ihn über Zeit aus dem Zielfenster.",
          "3. Kalkablagerungen in Bewässerungsleitungen und -düsen, die lokal den pH der abgegebenen Lösung verändern.",
          "4. Organisches Substratmaterial, das über Wochen mikrobiell abgebaut wird und den pH schrittweise driften lässt.",
        ],
      },
      {
        heading: "Diagnose — Vorgehen",
        content: [
          "Schritt 1: pH-Messgerät mit frischer Kalibrierlösung prüfen — ein driftendes Gerät ist die wahrscheinlichste Fehlerquelle, bevor überhaupt am Substrat gemessen wird.",
          "Schritt 2: Substrat- bzw. Drainage-pH direkt messen, nicht nur den Zulauf-pH der Nährlösung.",
          "Schritt 3: Prüfen, ob mehrere Mangelsymptome gleichzeitig auftreten — das unterscheidet Lockout von einem echten Einzelmangel.",
          "Schritt 4: Erst wenn der pH nachweislich im Zielfenster liegt und die Symptome bestehen bleiben, einen echten Nährstoffmangel in Betracht ziehen.",
        ],
        checklist: [
          "Kalibrierlösung frisch und nicht abgelaufen verwenden",
          "Substrat-pH an mehreren Stellen im Topf messen",
          "Symptommuster auf Mehrfachbefall statt Einzelmangel prüfen",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "pH schrittweise in das substratspezifische Zielfenster bringen: Coco/Hydro 5.8–6.2, Erde 6.0–6.8, maximal 0.3–0.5 Einheiten Änderung pro Gießgang.",
          "Nach der pH-Korrektur einen Spülgang mit pH-korrigiertem Wasser einplanen, um bereits ausgefallene, jetzt wieder gelöste Salze auszuwaschen.",
          "Erst nach bestätigter pH-Stabilität über mehrere Tage gezielt nachdüngen, falls einzelne Symptome bestehen bleiben.",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "pH-Messgerät wöchentlich kalibrieren, unabhängig davon, ob Probleme sichtbar sind.",
          "Bei hartem Leitungswasser eine Wasseraufbereitung (Umkehrosmose oder gezielte Säurezugabe) fest in die Routine einplanen.",
          "Drainage-pH regelmäßig gegen den Zulauf-pH gegenprüfen, um Substratdrift früh zu erkennen.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Bei Symptomen sofort mehr oder anderen Dünger geben, ohne vorher das Messgerät zu kalibrieren.",
          "pH in einem einzigen großen Schritt korrigieren, statt ihn über mehrere Gießgänge zu strecken.",
          "Nur den Zulauf-pH kontrollieren und die Drainage ignorieren, obwohl sich beide deutlich unterscheiden können.",
        ],
      },
    ],
    warnings: [
      "Eine abrupte pH-Korrektur um mehr als eine Einheit auf einmal wirkt selbst wie ein Stressereignis auf die Wurzel und kann bestehende Symptome kurzfristig verschlimmern.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum mehrere Mängel gleichzeitig?",
        text: "Viele Nährstoffe werden im selben pH-Bereich schwerer löslich. Kippt der pH aus dem Fenster, sind meist mehrere Nährstoffe gleichzeitig betroffen — nicht nur einer.",
      },
      {
        title: "Kurz erklärt: Warum zuerst das Messgerät prüfen?",
        text: "Ein leicht verschmutzter oder unkalibrierter pH-Sensor zeigt oft plausible, aber falsche Werte an. Bevor am Dünger geschraubt wird, lohnt sich der Griff zur Kalibrierlösung.",
      },
    ],
    faq: [
      {
        question: "Wie unterscheide ich pH-Lockout von einem echten Mangel?",
        answer:
          "Lockout zeigt meist mehrere Mangelmuster gleichzeitig und bessert sich nicht durch zusätzliche Düngung. Ein echter Einzelmangel zeigt ein isoliertes, klar zuordenbares Symptommuster.",
      },
      {
        question: "Wie schnell darf ich den pH ändern?",
        answer:
          "Maximal 0.3–0.5 Einheiten pro Gießgang. Größere Sprünge wirken selbst als Stressor und können die Symptome kurzfristig verschlimmern, statt sie zu lösen.",
      },
    ],
    glossary: [
      { term: "Lockout", definition: "Zustand, in dem ein Nährstoff im Substrat vorhanden, aber aufgrund von pH oder Antagonismus nicht pflanzenverfügbar ist." },
      { term: "Kalibrierlösung", definition: "Referenzlösung mit bekanntem pH-Wert zur Überprüfung und Justierung eines pH-Messgeräts." },
      { term: "Löslichkeitskurve", definition: "Grafische Darstellung, wie die Verfügbarkeit eines Nährstoffs vom pH-Wert abhängt." },
    ],
    sourceIds: ["marschner-nutrient-availability-ph", "bryson-plant-nutrition-manual", "bugbee-electrical-conductivity"],
    relatedSlugs: ["naehrstoffblockaden-und-antagonismen", "magnesiummangel", "eisenmangel", "sensor-kalibrierung-und-messfehler"],
  },
  {
    slug: "ueberwaesserung-staunaesse",
    title: "Überwässerung und Staunässe bei Cannabis erkennen und beheben",
    summary:
      "Hängende Blätter trotz nassem Substrat und ausbleibende Erholung nach dem Gießen sind die Leitsymptome. So trennst du Staunässe von Trockenstress und rettest die Wurzelzone rechtzeitig.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-08-03",
    tags: ["Staunässe", "Überwässerung", "Wurzelzone", "Diagnose", "Sauerstoff"],
    keyTakeaways: [
      "Das zuverlässigste Unterscheidungsmerkmal zu Trockenstress ist die Erholungszeit nach dem Gießen: bei Staunässe bleibt die Pflanze trotz feuchtem Substrat schlaff, bei Trockenstress erholt sie sich zügig.",
      "Anaerobe Wurzelatmung produziert Ethanol und Milchsäure, die die Wurzel direkt schädigen — nicht nur der fehlende Sauerstoff selbst ist das Problem.",
      "Übertopfung (zu großer Topf für die vorhandene Wurzelmasse) ist eine unterschätzte Ursache: das überschüssige Substratvolumen bleibt lokal um die kleine Wurzel herum zu lange nass.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Hängende Blätter trotz nassem Substrat" },
      { label: "Unterscheidungsmerkmal", value: "Keine Erholung nach Wassergabe" },
      { label: "Ideale Wurzeltemperatur", value: "18–22 °C" },
      { label: "Risikofaktor", value: "Übertopfung, schlechte Drainage" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Staunässe ist ein Zustand, in dem das Substrat über einen längeren Zeitraum nahe der vollständigen Wassersättigung bleibt und dadurch zu wenig Sauerstoff für die Wurzelatmung verfügbar ist.",
          "Im Gegensatz zu einer einzelnen Überwässerung ist Staunässe ein anhaltender Zustand, der sich meist über wiederholtes, zu häufiges Gießen oder schlechte Drainage aufbaut.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Wurzeln benötigen gelösten Sauerstoff für die aerobe Zellatmung. Ist der Wasserfilm um die Wurzelhaare zu dick oder zu lange stehend, sinkt die Sauerstoffdiffusion drastisch.",
          "Unter Sauerstoffmangel wechselt die Wurzel auf anaerobe Gärung und produziert Ethanol und Milchsäure — beide Stoffe wirken im Wurzelgewebe toxisch und schädigen die Zellmembranen aktiv, nicht nur passiv durch fehlende Energie.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1: Wachstum verlangsamt sich sichtbar, obwohl Substrat konstant feucht wirkt; Blätter zeigen leichtes, tageszeitunabhängiges Hängen.",
          "Stadium 2: Untere Blätter vergilben (N-Mangel-ähnlich, weil die geschädigte Wurzel Stickstoff nicht mehr effizient aufnimmt), Substratoberfläche riecht dumpf.",
          "Stadium 3: Wurzeln werden braun und schleimig (Übergang zu Wurzelfäule), Pflanze erholt sich auch nach Gießstopp nicht mehr von selbst.",
        ],
        checklist: [
          "Topfgewicht über mehrere Tage beobachten, nicht nur einmalig",
          "Substratgeruch direkt an der Wurzelzone prüfen",
          "Erholung der Blätter 2–4 Stunden nach der letzten Wassergabe kontrollieren",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. Zu häufiges Gießen ohne Rücksicht auf die tatsächliche Trocknungsdauer des Substrats.",
          "2. Schlechte Drainage: verdichtetes Substrat, fehlende oder zu kleine Abzugslöcher, Untersetzer mit stehendem Wasser.",
          "3. Übertopfung: ein für die aktuelle Wurzelmasse zu großer Topf hält in den wurzelfernen Zonen über Tage Feuchtigkeit, die lokal in die Wurzelzone zurückdiffundiert.",
          "4. Zu warme, stehende Nährlösung in Hydro-Systemen — warmes Wasser löst weniger Sauerstoff als kühles.",
        ],
      },
      {
        heading: "Diagnose — Staunässe vs. Trockenstress",
        content: [
          "Schritt 1: Topfgewicht prüfen — ungewöhnlich schwer über mehrere Tage spricht für Staunässe, schnelle Gewichtsabnahme für Trockenstress.",
          "Schritt 2: 2–4 Stunden nach der letzten Wassergabe die Blätter erneut prüfen. Erholung spricht für Trockenstress, ausbleibende Erholung für ein Sauerstoffproblem.",
          "Schritt 3: Substratgeruch direkt an der Wurzelzone prüfen — dumpfer, fauliger Geruch bestätigt Staunässe.",
        ],
        checklist: [
          "Topfgewicht als objektives Kriterium nutzen, nicht nur die Blattoptik",
          "Erholungszeit nach Wassergabe systematisch dokumentieren",
          "Bei Verdacht die obersten 2–3 cm Substrat vorsichtig anheben und Geruch/Farbe direkt an der Wurzel prüfen",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "Gießen sofort stoppen und dem Substrat Zeit zum Abtrocknen geben, bevor erneut gewässert wird.",
          "Bei starker, anhaltender Staunässe: vorsichtig umtopfen in trockeneres Substrat, dabei die Wurzelzone auf braune, schleimige Stellen prüfen (Übergang zu Wurzelfäule).",
          "Wurzelzonentemperatur auf 18–22 °C bringen — kühlere, aber nicht kalte Temperaturen erhöhen die Sauerstofflöslichkeit, ohne die mikrobielle Aktivität zu stark zu bremsen.",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Topfgröße an die tatsächliche Wurzelmasse anpassen, nicht an die erwartete Endgröße der Pflanze — schrittweises Umtopfen vermeidet Übertopfung.",
          "Ausreichende Drainagelöcher und ein luftporenreiches Substrat von Anfang an sicherstellen.",
          "Gießrhythmus an die gemessene Trocknungsdauer koppeln, nicht an einen starren Kalenderplan.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Auf hängende Blätter reflexartig mit zusätzlichem Gießen reagieren, obwohl das Substrat bereits gesättigt ist.",
          "Junge Pflanzen direkt in sehr große Endtöpfe setzen, ohne die Übertopfungsgefahr zu bedenken.",
          "Nur die Substratoberfläche auf Trockenheit prüfen, während die tiefere Wurzelzone noch gesättigt ist.",
        ],
      },
    ],
    warnings: [
      "Anhaltende Staunässe öffnet ein direktes Zeitfenster für Pythium-Wurzelfäule — je länger der Sauerstoffmangel besteht, desto höher das Infektionsrisiko.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum hängen die Blätter trotz nassem Substrat?",
        text: "Die Wurzel braucht Sauerstoff, nicht nur Wasser. Ist das Substrat zu lange gesättigt, erstickt die Wurzel funktionell und kann kein Wasser mehr in die Blätter transportieren, obwohl davon genug vorhanden wäre."
      },
      {
        title: "Kurz erklärt: Übertopfung",
        text: "Ein zu großer Topf für eine kleine Wurzel bedeutet, dass viel Substrat weit von der Wurzel entfernt lange feucht bleibt. Diese Feuchtigkeit wandert langsam zurück zur Wurzelzone und verlängert die Sättigungsphase unnötig."
      },
    ],
    faq: [
      {
        question: "Wie unterscheide ich Staunässe sicher von Trockenstress?",
        answer:
          "Am zuverlässigsten über die Erholung nach einer Wassergabe: Bleibt die Pflanze trotz feuchtem Substrat schlaff, ist es Staunässe. Erholt sie sich zügig, war es Trockenstress.",
      },
      {
        question: "Hilft es, den Topf anzuheben oder zu schütteln, um Staunässe zu lösen?",
        answer:
          "Kurzfristig kaum. Wirksamer ist es, das Gießen zu pausieren, für bessere Drainage zu sorgen und bei starkem Befall die Wurzelzone auf beginnende Fäule zu kontrollieren.",
      },
    ],
    glossary: [
      { term: "Anaerobe Atmung", definition: "Energiegewinnung ohne Sauerstoff, bei Pflanzenwurzeln mit toxischen Nebenprodukten wie Ethanol und Milchsäure verbunden." },
      { term: "Übertopfung", definition: "Ein für die vorhandene Wurzelmasse zu großer Topf, der lokal übermäßig lange feucht bleibt." },
      { term: "Drainage", definition: "Fähigkeit eines Systems, überschüssiges Wasser abzuleiten und Staunässe zu vermeiden." },
    ],
    sourceIds: ["drew-root-response-waterlogging", "pythium-root-rot-hydroponics", "marschner-mineral-nutrition"],
    relatedSlugs: ["wurzelfaeule", "cannabis-substrat-und-wurzelzone", "bewaesserung-ohne-uebergiessen"],
  },
  {
    slug: "blattlaeuse",
    title: "Blattläuse bei Cannabis erkennen und bekämpfen",
    summary:
      "Weiche, oft grüne Insekten in Kolonien an Triebspitzen sowie klebriger Honigtau verraten Blattlausbefall. So erkennst du die Symbiose mit Ameisen und stoppst die Vermehrung frühzeitig.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-08-03",
    tags: ["Blattläuse", "Schädlinge", "IPM", "Aphididae", "Diagnose"],
    keyTakeaways: [
      "Blattläuse vermehren sich parthenogenetisch — Weibchen gebären lebende Junge ohne Befruchtung, was die Population unter guten Bedingungen explosionsartig wachsen lässt.",
      "Klebriger, glänzender Honigtau auf Blättern ist ein Leitsymptom und Nährboden für Rußtaupilz — er ist oft auffälliger als die Läuse selbst.",
      "Ameisen 'melken' Blattläuse aktiv nach Honigtau und verteidigen sie gegen Nützlinge — ein Ameisenproblem ohne Blattlausbekämpfung zu lösen, ist meist wirkungslos.",
    ],
    quickFacts: [
      { label: "Erreger", value: "Aphididae (versch. Arten)" },
      { label: "Leitsymptom", value: "Kolonien an Triebspitzen, Honigtau" },
      { label: "Vermehrung", value: "Parthenogenetisch, sehr schnell" },
      { label: "Symbiose", value: "Oft mit Ameisen" },
      { label: "Nützling", value: "Marienkäfer, Florfliegen, Aphidius spp." },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Blattläuse sind kleine, weichkörperige Insekten, die mit ihrem Saugrüssel Phloemsaft aus jungen Trieben und Blattunterseiten entziehen.",
          "Sie treten meist zuerst an den zartesten, nährstoffreichsten Pflanzenteilen auf — Triebspitzen und junge Blätter.",
        ],
      },
      {
        heading: "Biologie und Lebenszyklus",
        content: [
          "Blattlaus-Weibchen können sich parthenogenetisch fortpflanzen, also ohne Befruchtung lebende Junge gebären — das ermöglicht eine sehr schnelle Populationszunahme unter günstigen Bedingungen.",
          "Bei Überbevölkerung oder Stress bilden sich geflügelte Formen, die neue Pflanzen oder Räume besiedeln und den Befall räumlich ausbreiten.",
        ],
      },
      {
        heading: "Schadbild und Symptome nach Schweregrad",
        content: [
          "Stadium 1: Vereinzelte Kolonien an Triebspitzen und jungen Blattunterseiten, mit bloßem Auge sichtbar.",
          "Stadium 2: Klebriger Honigtau auf Blattoberflächen, oft begleitet von auffälligem Ameisenbesuch.",
          "Stadium 3: Rußtaupilz siedelt sich auf dem Honigtau an (schwarzer Belag), Blätter und Triebspitzen verkrüppeln durch den Saugschaden.",
        ],
        checklist: [
          "Triebspitzen und Blattunterseiten auf Kolonien absuchen",
          "Klebrige, glänzende Stellen auf Blättern prüfen",
          "Ameisenaktivität am Pflanzenstamm als Frühwarnsignal werten",
        ],
      },
      {
        heading: "Diagnose — Abgrenzung",
        content: [
          "Blattläuse sind mit bloßem Auge als kleine, oft grüne bis schwarze Insekten sichtbar — im Unterschied zu Spinnmilben, die eine Lupe erfordern.",
          "Klebriger Honigtau plus Ameisenbesuch ist ein starkes Unterscheidungsmerkmal gegenüber anderen Saugschädlingen ohne diese Symbiose.",
          "Rußtaupilz auf den Blättern ist ein Sekundärsymptom des Honigtaus, kein eigenständiger Pilzbefall — die Ursache ist der Blattlausbefall selbst.",
        ],
      },
      {
        heading: "Bekämpfung — gestaffeltes IPM",
        content: [
          "1. Mechanisch reduzieren: Kolonien mit einem kräftigen Wasserstrahl abspülen oder befallene Triebspitzen entfernen.",
          "2. Ameisenwege unterbrechen, da Ameisen Blattläuse aktiv vor Fressfeinden schützen und ihre Bekämpfung sonst behindern.",
          "3. Biologisch: Marienkäfer, Florfliegenlarven oder die Schlupfwespe Aphidius spp. gezielt einsetzen, solange die Population noch überschaubar ist.",
          "4. Neemöl in der vegetativen Phase als Kontaktmittel, niemals auf Knospen in der Blüte.",
        ],
        checklist: [
          "Ameisenstraßen am Stamm identifizieren und unterbrechen",
          "Nützlinge einsetzen, bevor die Population explodiert",
          "Kontrolle nach 5–7 Tagen wiederholen, um Wiederbefall zu erkennen",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Neue Pflanzen konsequent in Quarantäne auf Blattläuse und Ameisenbesuch prüfen, bevor sie in den Hauptbestand kommen.",
          "Gelbe Klebefallen erfassen geflügelte Formen frühzeitig, bevor sich neue Kolonien etablieren.",
          "Übermäßige Stickstoffdüngung vermeiden — stickstoffreiches, weiches Gewebe ist für Blattläuse besonders attraktiv.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Nur die sichtbaren Ameisen bekämpfen, ohne die eigentliche Blattlauskolonie zu behandeln — das Problem kehrt zurück.",
          "Erst bei sichtbarem Rußtaupilz reagieren, wenn die Kolonie bereits groß ist.",
          "Neemöl oder andere Kontaktmittel in der Blüte auf die Knospen sprühen.",
        ],
      },
    ],
    warnings: [
      "Manche Blattlausarten übertragen Pflanzenviren beim Saugvorgang — ein früher, konsequenter Eingriff reduziert nicht nur den Saugschaden, sondern auch dieses Risiko.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum vermehren sich Blattläuse so schnell?",
        text: "Weibchen können sich ohne Befruchtung fortpflanzen und bringen direkt lebende Junge zur Welt. Das überspringt den Zeitaufwand für Eiablage und Schlupf und beschleunigt die Vermehrung erheblich.",
      },
      {
        title: "Kurz erklärt: Die Ameisen-Blattlaus-Symbiose",
        text: "Blattläuse scheiden zuckerhaltigen Honigtau aus. Ameisen sammeln diesen und beschützen die Läuse im Gegenzug vor Fressfeinden wie Marienkäfern — ein Ameisenproblem zeigt daher oft einen versteckten Blattlausbefall an.",
      },
    ],
    faq: [
      {
        question: "Sind viele Ameisen an der Pflanze ein sicheres Zeichen für Blattläuse?",
        answer:
          "Ein starkes Indiz, ja. Ameisen suchen gezielt Honigtau-Quellen auf — auffällige Ameisenaktivität am Stamm oder an Trieben lohnt eine gezielte Kontrolle auf Blattlauskolonien.",
      },
      {
        question: "Reicht Abspülen mit Wasser als alleinige Maßnahme?",
        answer:
          "Bei leichtem Befall oft ja, kurativ. Bei stärkerem Befall oder wiederkehrenden Kolonien sollte zusätzlich biologisch (Nützlinge) oder mit Neemöl außerhalb der Blüte nachgearbeitet werden.",
      },
    ],
    glossary: [
      { term: "Honigtau", definition: "Zuckerhaltige, klebrige Ausscheidung von Blattläusen, Nährboden für Rußtaupilz." },
      { term: "Parthenogenese", definition: "Fortpflanzung ohne Befruchtung; ermöglicht Blattläusen sehr schnelle Populationszunahme." },
      { term: "Rußtaupilz", definition: "Schwarzer Pilzbelag, der sich sekundär auf Honigtau ansiedelt, ohne die Pflanze direkt zu infizieren." },
    ],
    sourceIds: ["blackman-eastop-aphids", "ipm-cannabis-arthropods", "punja-cannabis-pathogens"],
    relatedSlugs: ["integrierte-schaedlingspraevention-grow", "weisse-fliege", "spinnmilben", "trauermuecken"],
  },
  {
    slug: "weisse-fliege",
    title: "Weiße Fliege bei Cannabis erkennen und bekämpfen",
    summary:
      "Kleine weiße Insekten, die beim Berühren der Pflanze wolkenartig auffliegen, sind das Leitsymptom. So erkennst du den Befall früh und verhinderst die Ausbreitung über Honigtau und Rußtaupilz.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-08-03",
    tags: ["Weiße Fliege", "Schädlinge", "IPM", "Diagnose"],
    keyTakeaways: [
      "Das eindeutigste Diagnosemerkmal ist das wolkenartige Auffliegen kleiner weißer Insekten beim Berühren oder Schütteln der Pflanze.",
      "Wie Blattläuse scheiden Weiße Fliegen Honigtau aus, der Rußtaupilz begünstigt — beide Schädlinge werden dadurch leicht verwechselt, unterscheiden sich aber im Flugverhalten deutlich.",
      "Gelbe Klebefallen sind für Weiße Fliegen besonders wirksam zur Früherkennung, weil adulte Tiere aktiv fliegen und sich davon anziehen lassen.",
    ],
    quickFacts: [
      { label: "Erreger", value: "Trialeurodes vaporariorum u. a." },
      { label: "Leitsymptom", value: "Wolkenartiges Auffliegen beim Berühren" },
      { label: "Fundort", value: "Blattunterseiten" },
      { label: "Nützling", value: "Encarsia formosa (Schlupfwespe)" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Weiße Fliegen sind kleine, mottenähnliche Insekten mit weiß bestäubten Flügeln, die sich bevorzugt an Blattunterseiten aufhalten und dort Phloemsaft saugen.",
          "Sie treten oft in wärmeren, geschützten Indoor-Umgebungen mit stabilem Klima auf, in denen sich Populationen ungestört aufbauen können.",
        ],
      },
      {
        heading: "Biologie und Lebenszyklus",
        content: [
          "Adulte Weiße Fliegen legen Eier auf Blattunterseiten ab; daraus schlüpfen Nymphen, die sich unbeweglich festsetzen und dort mehrere Larvenstadien durchlaufen, bevor sie zu geflügelten Adulten werden.",
          "Bei warmen Temperaturen verkürzt sich der Zyklus deutlich, wodurch sich mehrere überlappende Generationen gleichzeitig auf einer Pflanze befinden können.",
        ],
      },
      {
        heading: "Schadbild und Symptome nach Schweregrad",
        content: [
          "Stadium 1: Vereinzelte Tiere fliegen beim Berühren der Pflanze kurz auf und setzen sich wieder auf die Blattunterseite.",
          "Stadium 2: Deutliches, wolkenartiges Auffliegen mehrerer Dutzend Tiere, klebriger Honigtau auf den unteren Blattlagen.",
          "Stadium 3: Flächiger Rußtaupilzbelag, sichtbare Vergilbung und vorzeitiger Blattfall durch anhaltenden Saugschaden.",
        ],
        checklist: [
          "Pflanze sanft schütteln und auf auffliegende weiße Insekten achten",
          "Blattunterseiten auf sesshafte Nymphen (kleine, ovale, halbtransparente Punkte) prüfen",
          "Gelbe Klebefallen in Canopy-Höhe positionieren",
        ],
      },
      {
        heading: "Diagnose — Abgrenzung",
        content: [
          "Das wolkenartige Auffliegen beim Berühren unterscheidet Weiße Fliegen eindeutig von Blattläusen, die sesshaft bleiben.",
          "Sesshafte Nymphenstadien auf der Blattunterseite ähneln oberflächlich Schildläusen, sind aber deutlich kleiner und halbtransparent statt hart-schildförmig.",
          "Honigtau und Rußtaupilz treten bei beiden Schädlingen auf und sind daher kein Unterscheidungsmerkmal — das Flugverhalten ist der zuverlässigere Indikator.",
        ],
      },
      {
        heading: "Bekämpfung — gestaffeltes IPM",
        content: [
          "1. Gelbe Klebefallen in Canopy-Nähe aufhängen, um adulte Tiere kontinuierlich abzufangen und die Population zu überwachen.",
          "2. Stark befallene untere Blätter entfernen, um den Ausgangspunkt für Neubefall zu reduzieren.",
          "3. Biologisch: die parasitoide Schlupfwespe Encarsia formosa früh einsetzen, solange die Population noch moderat ist.",
          "4. Insektizidseife oder Neemöl gezielt auf Blattunterseiten in der Vegetation, nie in der Spätblüte auf Knospen.",
        ],
        checklist: [
          "Gelbe Klebefallen wöchentlich auswerten und Trend dokumentieren",
          "Encarsia formosa vor Erreichen einer starken Population einsetzen",
          "Behandlungen konsequent auf die Blattunterseiten richten",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Neue Pflanzen vor der Integration in den Hauptbestand auf Nymphen und adulte Tiere kontrollieren.",
          "Stabile, nicht zu warme Klimaführung erschwert die schnelle Generationsfolge der Weißen Fliege.",
          "Gelbe Klebefallen dauerhaft als Frühwarnsystem im Raum belassen, nicht nur bei akutem Verdacht.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Nur die adulten, fliegenden Tiere bekämpfen und die sesshaften Nymphenstadien auf der Blattunterseite übersehen.",
          "Erst bei sichtbarem Rußtaupilz reagieren, statt schon beim ersten Auffliegen einzugreifen.",
          "Klebefallen zu weit von der Canopy entfernt platzieren, wodurch sie kaum Tiere fangen.",
        ],
      },
    ],
    warnings: [
      "Weiße Fliegen können in geschützten Indoor-Klimazonen ganzjährig überdauern — eine einmalige Behandlung ohne Nachkontrolle reicht bei etablierter Population meist nicht aus.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum fliegen sie wolkenartig auf?",
        text: "Weiße Fliegen sitzen bevorzugt dicht gedrängt auf der Blattunterseite. Bei Erschütterung fliegen viele Tiere gleichzeitig kurz auf, bevor sie sich wieder niederlassen — ein sehr charakteristisches Erkennungsmerkmal."
      },
      {
        title: "Kurz erklärt: Warum gelbe Klebefallen?",
        text: "Adulte Weiße Fliegen werden von der Farbe Gelb angezogen. Klebefallen in dieser Farbe fangen sie zuverlässig ab und zeigen frühzeitig, wie stark der Befall bereits ist."
      },
    ],
    faq: [
      {
        question: "Wie unterscheide ich Weiße Fliegen sicher von Blattläusen?",
        answer:
          "Am zuverlässigsten über das Flugverhalten: Weiße Fliegen fliegen beim Berühren der Pflanze wolkenartig auf, Blattläuse bleiben sesshaft sitzen.",
      },
      {
        question: "Reichen gelbe Klebefallen als alleinige Bekämpfung?",
        answer:
          "Nein, sie sind primär ein Monitoring- und Reduktionswerkzeug für adulte Tiere. Sesshafte Nymphenstadien auf der Blattunterseite müssen zusätzlich mechanisch oder biologisch bekämpft werden.",
      },
    ],
    glossary: [
      { term: "Nymphe", definition: "Unbewegliches Larvenstadium der Weißen Fliege, das an der Blattunterseite festsitzt." },
      { term: "Klebefalle", definition: "Farbige, klebrige Tafel zur Überwachung und Reduktion fliegender Schädlinge." },
      { term: "Parasitoid", definition: "Organismus (hier: Schlupfwespe), der seine Eier in oder an einen Wirt legt und diesen dabei tötet." },
    ],
    sourceIds: ["byrne-bellows-whitefly-biology", "ipm-cannabis-arthropods", "punja-cannabis-pathogens"],
    relatedSlugs: ["integrierte-schaedlingspraevention-grow", "blattlaeuse", "spinnmilben", "bud-rot-botrytis"],
  },
  {
    slug: "phosphormangel",
    title: "Phosphormangel bei Cannabis erkennen und beheben",
    summary:
      "Dunkelgrüne bis bläuliche Blätter mit rötlich-violetten Blattstielen und verlangsamtem Wachstum sind die Leitsymptome. So unterscheidest du echten P-Mangel von Kältestress und korrigierst gezielt über pH und Phosphorzufuhr.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 9,
    lastUpdated: "2026-08-03",
    tags: ["Phosphor", "Nährstoffmangel", "pH", "Diagnose"],
    keyTakeaways: [
      "Phosphor ist mobil: Mangel zeigt sich zuerst an älteren, unteren Blättern, die sich dunkelgrün bis bläulich verfärben und teils rötlich-violette Blattstiele zeigen.",
      "Die häufigste Ursache ist wie bei Magnesium eine pH-bedingte Blockade — Phosphor hat ein besonders schmales Löslichkeitsfenster und fällt sowohl bei zu hohem als auch bei zu niedrigem pH aus.",
      "P-Mangel und Kältestress sehen sich symptomatisch sehr ähnlich (violette Verfärbung) — die Wurzelzonentemperatur ist das entscheidende Unterscheidungsmerkmal.",
    ],
    quickFacts: [
      { label: "Leitsymptom", value: "Dunkelgrün-bläuliche Blätter, violette Stiele" },
      { label: "Mobilität", value: "Mobil (Verlagerung in junge Blätter)" },
      { label: "pH-Fenster P (Coco/Hydro)", value: "5.8–6.2" },
      { label: "pH-Fenster P (Erde)", value: "6.0–6.5" },
      { label: "Verwechslungsgefahr", value: "Kältestress" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Phosphormangel ist eine Unterversorgung mit pflanzenverfügbarem Phosphat. Phosphor ist zentraler Bestandteil von ATP, Nukleinsäuren und Zellmembranen und damit für Energietransfer und Zellteilung essenziell.",
          "Cannabis zeigt P-Mangel besonders in der frühen Wurzelentwicklung und in der Blüte, wenn der Bedarf für Zellteilung und Energietransfer in die Knospen steigt.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Phosphat ist Bestandteil von ATP (Adenosintriphosphat), dem zentralen Energieträger jeder Zelle, sowie von DNA und RNA — ohne ausreichend P bricht die Energieversorgung für Wachstum und Zellteilung ein.",
          "Phosphor ist phloemmobil und wird bei Mangel aus älteren Blättern in aktive Wachstumszonen verlagert, weshalb die Symptome zuerst unten auftreten.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1: Blätter wirken ungewöhnlich dunkelgrün bis leicht bläulich, Wachstum verlangsamt sich merklich.",
          "Stadium 2: Blattstiele und teils Stängel verfärben sich rötlich-violett, ältere Blätter beginnen sich einzurollen.",
          "Stadium 3: Braune bis violette nekrotische Flecken auf älteren Blättern, deutlich reduzierte Blüten-/Wurzelentwicklung.",
        ],
        checklist: [
          "Blattfarbe auf ungewöhnliches Dunkelgrün/Blau prüfen",
          "Blattstiele auf violette Verfärbung untersuchen",
          "Wurzelzonentemperatur parallel messen, um Kältestress auszuschließen",
        ],
      },
      {
        heading: "Ursachen — nach Häufigkeit geordnet",
        content: [
          "1. pH-Blockade: Phosphor hat ein besonders schmales Löslichkeitsfenster und fällt sowohl bei hohem pH (Calciumphosphate) als auch bei niedrigem pH (Eisen-/Aluminiumphosphate) aus.",
          "2. Niedrige Wurzelzonentemperatur: unter etwa 18 °C sinkt die P-Aufnahme drastisch, auch wenn genug P im Substrat vorhanden ist.",
          "3. Echte Unterversorgung: einseitige Dünger ohne ausreichenden P-Anteil, besonders in frühen Wachstumsphasen.",
          "4. Antagonismus durch übermäßige Zink- oder Eisendüngung, die die P-Aufnahme zusätzlich hemmen kann.",
        ],
      },
      {
        heading: "Diagnose — Abgrenzung von Kältestress",
        content: [
          "Schritt 1: Wurzelzonentemperatur messen. Liegt sie unter 18 °C, ist Kältestress wahrscheinlicher als echter P-Mangel, auch bei ähnlicher violetter Verfärbung.",
          "Schritt 2: pH der Wurzelzone prüfen. Liegt er außerhalb des P-Zielfensters, primär den pH korrigieren, bevor mehr gedüngt wird.",
          "Schritt 3: Wachstumsgeschwindigkeit beobachten — reine Kälte verlangsamt das Wachstum reversibel, echter P-Mangel zeigt zusätzlich die charakteristische Dunkelgrün-/Blaufärbung.",
        ],
        checklist: [
          "Wurzelzonentemperatur mit Substratsonde messen, nicht nur die Lufttemperatur",
          "pH der Wurzelzone im Zielfenster 5.8–6.5 sicherstellen",
          "Symptomverlauf nach Temperaturkorrektur beobachten, bevor zusätzlich gedüngt wird",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "1. pH zuerst in den Zielkorridor bringen: Coco/Hydro 5.8–6.2, Erde 6.0–6.5.",
          "2. Wurzelzonentemperatur auf mindestens 18–20 °C anheben, bevor die P-Dosierung erhöht wird.",
          "3. Bei bestätigtem echtem Mangel gezielt phosphorbetonten Dünger nachgeben und die Wirkung am Neuaustrieb beobachten.",
        ],
        checklist: [
          "pH korrigieren, bevor die P-Dosis erhöht wird",
          "Wurzelzonentemperatur auf mindestens 18 °C anheben",
          "Neuaustrieb statt bestehender Blätter zur Erfolgskontrolle nutzen",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "In der frühen Wachstums- und Wurzelphase auf ausreichenden P-Anteil im Düngeprogramm achten.",
          "Wurzelzonentemperatur konstant im Zielbereich halten, besonders bei kühlen Umgebungsbedingungen.",
          "pH regelmäßig kontrollieren, da das P-Löslichkeitsfenster enger ist als bei den meisten anderen Makronährstoffen.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Violette Verfärbung automatisch als P-Mangel werten, ohne die Wurzelzonentemperatur zu prüfen.",
          "P-Dosis erhöhen, ohne vorher den pH zu kontrollieren, obwohl Phosphor ein besonders pH-empfindliches Löslichkeitsfenster hat.",
          "Erwarten, dass bereits verfärbte alte Blätter sich zurückbilden — Erfolg zeigt sich nur am Neuaustrieb.",
        ],
      },
    ],
    warnings: [
      "Zu hohe Phosphordosierung als 'Sicherheitsmaßnahme' kann die Aufnahme von Zink und Eisen antagonistisch hemmen und neue Mangelbilder auslösen.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum violette Blattstiele?",
        text: "Bei Phosphormangel reichern sich bestimmte Pigmente (Anthocyane) in den Blattstielen an. Dasselbe passiert bei Kälte — deshalb ist die Wurzelzonentemperatur so wichtig für die richtige Diagnose."
      },
      {
        title: "Kurz erklärt: Enges Löslichkeitsfenster",
        text: "Phosphor fällt sowohl bei zu hohem als auch bei zu niedrigem pH chemisch aus und wird unlöslich. Sein nutzbares pH-Fenster ist dadurch enger als das der meisten anderen Nährstoffe."
      },
    ],
    faq: [
      {
        question: "Wie unterscheide ich P-Mangel sicher von Kältestress?",
        answer:
          "Über die Wurzelzonentemperatur: Liegt sie unter 18 °C, ist Kältestress wahrscheinlicher. Bei normaler Wurzeltemperatur und trotzdem bestehender Verfärbung ist echter P-Mangel oder eine pH-Blockade wahrscheinlicher.",
      },
      {
        question: "Wie schnell wirkt eine P-Korrektur?",
        answer:
          "Neue Triebe zeigen innerhalb von 7–10 Tagen Besserung. Bereits verfärbte alte Blätter bilden sich nicht zurück — bewerte den Erfolg am Neuaustrieb.",
      },
    ],
    glossary: [
      { term: "ATP", definition: "Adenosintriphosphat, der zentrale Energieträger jeder Zelle, mit Phosphat als Kernbestandteil." },
      { term: "Anthocyane", definition: "Pflanzenpigmente, die violette bis rötliche Färbung verursachen, u. a. bei Nährstoffmangel oder Kältestress." },
      { term: "Löslichkeitsfenster", definition: "Der pH-Bereich, in dem ein Nährstoff in pflanzenverfügbarer, gelöster Form vorliegt." },
    ],
    sourceIds: ["marschner-nutrient-availability-ph", "bryson-plant-nutrition-manual", "bernal-cannabis-nutrient-requirements"],
    relatedSlugs: ["naehrstoffblockaden-und-antagonismen", "kaeltestress", "magnesiummangel", "naehrstoffbedarf-cannabis-lebenszyklus"],
  },
  {
    slug: "hanf-rostmilben",
    title: "Hanf-Rostmilben bei Cannabis erkennen und bekämpfen",
    summary:
      "Vergilbte, nach unten gerollte Blätter und ein mattes, staubiges Erscheinungsbild der oberen Canopy verraten Rostmilbenbefall. So erkennst du die winzigen Schädlinge, bevor der Befall irreversibel wird.",
    category: "anbau",
    difficulty: "profi",
    readMinutes: 9,
    lastUpdated: "2026-08-03",
    tags: ["Rostmilben", "Eriophyidae", "Schädlinge", "Diagnose"],
    keyTakeaways: [
      "Hanf-Rostmilben sind mit bloßem Auge praktisch unsichtbar (< 0.2 mm) — der Befall wird meist erst am Schadbild (nach unten gerollte, vergilbte Blätter) erkannt, wenn er bereits fortgeschritten ist.",
      "Im Gegensatz zu Spinnmilben hinterlassen Rostmilben kein Gespinst — das mattierte, 'rostige' Blattbild ist das wichtigste Unterscheidungsmerkmal.",
      "Wegen der extremen Kleinheit und schnellen Vermehrung ist konsequente Quarantäne neuer Pflanzen die wirksamste Einzelmaßnahme gegen Rostmilbenbefall.",
    ],
    quickFacts: [
      { label: "Erreger", value: "Aculops cannabicola" },
      { label: "Größe", value: "< 0.2 mm, mit Lupe kaum sichtbar" },
      { label: "Leitsymptom", value: "Nach unten gerollte, matte Blätter" },
      { label: "Kein Gespinst", value: "Unterscheidung zu Spinnmilben" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Hanf-Rostmilben (Aculops cannabicola) sind hochspezialisierte, wurmförmige Milben aus der Familie der Eriophyidae, die ausschließlich an Cannabis vorkommen und deutlich kleiner als Spinnmilben sind.",
          "Wegen ihrer extremen Kleinheit bleibt ein Befall oft lange unentdeckt, bis das charakteristische Schadbild an der oberen Canopy sichtbar wird.",
        ],
      },
      {
        heading: "Biologie und Lebenszyklus",
        content: [
          "Rostmilben besiedeln bevorzugt junge, sich entwickelnde Blätter und Blütenstrukturen in der oberen Canopy, wo sie durch Saugschäden Zellstruktur und Wachstum stören.",
          "Der Lebenszyklus ist bei warmen Temperaturen sehr kurz, wodurch sich Populationen unbemerkt schnell aufbauen können, bevor Symptome eindeutig sichtbar werden.",
        ],
      },
      {
        heading: "Schadbild und Symptome nach Schweregrad",
        content: [
          "Stadium 1: Leicht mattes, staubig wirkendes Erscheinungsbild der obersten, jüngsten Blätter, ohne eindeutige Einzelsymptome.",
          "Stadium 2: Blätter rollen sich nach unten (umgekehrt zu Hitzestress-Tacoing), vergilben und wirken brüchig-trocken.",
          "Stadium 3: Wachstumsstillstand der Triebspitzen, verkrüppelte Neubildung, in der Blüte reduzierte und unregelmäßige Knospenentwicklung.",
        ],
        checklist: [
          "Obere Canopy auf mattes, staubiges Erscheinungsbild prüfen, bevor klare Einzelsymptome sichtbar sind",
          "Blätter auf Abwärtsrollung statt Aufwärtsrollung (Tacoing) kontrollieren",
          "Bei Verdacht mit starker Lupe (≥ 30×) die Blattunterseite der jüngsten Blätter prüfen",
        ],
      },
      {
        heading: "Diagnose — Abgrenzung",
        content: [
          "Fehlendes Gespinst unterscheidet Rostmilbenbefall von Spinnmilben, bei denen feine Fäden an Trieben und Blattachseln sichtbar sind.",
          "Die Abwärtsrollung der Blätter unterscheidet sich von der Aufwärtsrollung (Tacoing) bei Hitzestress — die Richtung der Blattrollung ist ein wichtiges Diagnosemerkmal.",
          "Wegen der extremen Kleinheit ist eine sichere Bestätigung oft nur über professionelle Vergrößerung oder Laboranalyse möglich — bei begründetem Verdacht vorsorglich behandeln, statt auf visuelle Bestätigung zu warten.",
        ],
      },
      {
        heading: "Bekämpfung — gestaffeltes IPM",
        content: [
          "1. Sofortige Isolierung befallener Pflanzen, da Rostmilben sich über Kontakt und Luftbewegung leicht ausbreiten.",
          "2. Stark befallene obere Triebe und Blätter konsequent entfernen und sicher entsorgen.",
          "3. Biologisch: Raubmilben mit Erfahrung im Eriophyidae-Befall einsetzen, sobald verfügbar.",
          "4. Wirkstoffe nur in Vegetation/Frühblüte im Rotationsprinzip, nie auf Knospen in der Spätblüte.",
        ],
        checklist: [
          "Befallene Pflanzen sofort räumlich isolieren",
          "Stark betroffene Triebspitzen konsequent entfernen",
          "Wirkstoffe rotieren, um Resistenzbildung zu vermeiden",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Neue Pflanzen und Stecklinge mindestens eine Woche in strikter Quarantäne mit Lupenkontrolle halten — die wirksamste Einzelmaßnahme angesichts der schweren Erkennbarkeit.",
          "Werkzeuge und Hände zwischen Pflanzen konsequent desinfizieren, da Rostmilben leicht mechanisch übertragen werden.",
          "Regelmäßiges, systematisches Scouting der jüngsten Blätter zur Routine machen, auch ohne akuten Verdacht.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Auf ein Gespinst als Bestätigungskriterium warten — Rostmilben produzieren keines, wodurch die Diagnose sonst zu spät kommt.",
          "Symptome vorschnell als Nährstoffproblem oder Hitzestress abtun, ohne die Blattrollrichtung zu prüfen.",
          "Neue Pflanzen ohne Quarantäne direkt in den Hauptbestand integrieren.",
        ],
      },
    ],
    warnings: [
      "Wegen der extremen Kleinheit von Hanf-Rostmilben ist der sichtbare Schaden oft schon fortgeschritten, wenn er eindeutig erkennbar wird — bei begründetem Verdacht lieber vorsorglich isolieren als abzuwarten.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum so schwer zu erkennen?",
        text: "Hanf-Rostmilben sind kleiner als ein Fünftel Millimeter — selbst mit einer normalen Lupe kaum sichtbar. Meist wird der Befall erst am charakteristischen Schadbild an den Blättern erkannt."
      },
      {
        title: "Kurz erklärt: Blattrollrichtung als Hinweis",
        text: "Nach unten gerollte Blätter deuten eher auf Rostmilben hin, nach oben gerollte eher auf Hitzestress. Diese Richtung ist ein einfacher, aber wichtiger erster Diagnosehinweis."
      },
    ],
    faq: [
      {
        question: "Kann ich Hanf-Rostmilben mit bloßem Auge sehen?",
        answer:
          "Praktisch nicht. Sie sind kleiner als 0.2 mm und selbst mit normaler Lupe kaum zu erkennen — die Diagnose stützt sich meist auf das charakteristische Schadbild statt auf direkte Sichtung.",
      },
      {
        question: "Reicht Quarantäne wirklich als Hauptmaßnahme?",
        answer:
          "Sie ist die wirksamste Einzelmaßnahme, weil Neubefall meist über zugekaufte Pflanzen oder Stecklinge eingeschleppt wird. Konsequente Quarantäne mit Lupenkontrolle verhindert die meisten Fälle von vornherein.",
      },
    ],
    glossary: [
      { term: "Eriophyidae", definition: "Familie extrem kleiner, wurmförmiger Milben, zu denen die Hanf-Rostmilbe gehört." },
      { term: "Quarantäne", definition: "Zeitlich und räumlich getrennte Beobachtung neuer Pflanzen, bevor sie in den Hauptbestand integriert werden." },
      { term: "Scouting", definition: "Systematische, routinemäßige Kontrolle von Pflanzen auf frühe Schädlings- oder Krankheitszeichen." },
    ],
    sourceIds: ["lindquist-eriophyoid-mites", "ipm-cannabis-arthropods", "tetranychus-twospotted-mite"],
    relatedSlugs: ["integrierte-schaedlingspraevention-grow", "spinnmilben", "hitzestress", "kaeltestress"],
  },
  {
    slug: "fusarium",
    title: "Fusarium bei Cannabis erkennen und beheben",
    summary:
      "Plötzliches, einseitiges Welken trotz feuchtem Substrat und bräunlich verfärbtes Leitgewebe im Stängelquerschnitt sind die Leitsymptome. So unterscheidest du Fusarium von Wurzelfäule und begrenzt den Schaden.",
    category: "anbau",
    difficulty: "profi",
    readMinutes: 9,
    lastUpdated: "2026-08-03",
    tags: ["Fusarium", "Krankheiten", "Wurzelfäule", "Diagnose"],
    keyTakeaways: [
      "Fusarium befällt das Leitgewebe (Xylem) und verursacht dadurch oft ein einseitiges oder sektorales Welken einzelner Triebe, während der Rest der Pflanze zunächst unauffällig bleibt.",
      "Ein bräunlich-rötlich verfärbter Ring im Stängelquerschnitt (Leitgewebeverfärbung) ist das zuverlässigste Bestätigungsmerkmal gegenüber Pythium-Wurzelfäule.",
      "Fusarium-Sporen können jahrelang im Substrat oder in Anbauflächen überdauern — befallenes Substrat sollte nicht wiederverwendet werden.",
    ],
    quickFacts: [
      { label: "Erreger", value: "Fusarium spp." },
      { label: "Leitsymptom", value: "Einseitiges Welken, Leitgewebeverfärbung" },
      { label: "Bestätigung", value: "Bräunlicher Ring im Stängelquerschnitt" },
      { label: "Überdauerung", value: "Jahrelang im Substrat möglich" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Fusarium ist eine bodenbürtige Pilzgattung, die über die Wurzel in das Leitgewebe (Xylem) der Pflanze eindringt und dessen Wassertransportfunktion blockiert.",
          "Im Unterschied zu Pythium-Wurzelfäule, die primär die Wurzel selbst zersetzt, greift Fusarium gezielt das Leitgewebe an und verursacht dadurch charakteristisches, oft asymmetrisches Welken.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Fusarium-Pilze besiedeln das Xylemgewebe und lösen sowohl eine mechanische Verstopfung der Wasserleitbahnen als auch eine Abwehrreaktion der Pflanze aus, die die Leitbahnen zusätzlich verengt.",
          "Da einzelne Xylemstränge oft nur Teile der Pflanze versorgen, kann der Befall zunächst sektoral oder einseitig auftreten, bevor er sich systemisch ausbreitet.",
        ],
      },
      {
        heading: "Symptome nach Schweregrad",
        content: [
          "Stadium 1: Einzelne untere Blätter oder ein Seitentrieb welken trotz erkennbar feuchtem Substrat, während der Rest der Pflanze unauffällig bleibt.",
          "Stadium 2: Welken breitet sich auf weitere Triebe aus, betroffene Blätter vergilben und fallen ab, teils einseitig stärker als auf der anderen Pflanzenseite.",
          "Stadium 3: Systemischer Befall mit Welken der gesamten Pflanze, im Stängelquerschnitt zeigt sich ein deutlicher bräunlich-rötlicher Ring im Leitgewebe.",
        ],
        checklist: [
          "Welkemuster auf Einseitigkeit/Sektoralität prüfen, nicht nur Gesamtzustand bewerten",
          "Substratfeuchte parallel kontrollieren, um Wassermangel als Ursache auszuschließen",
          "Bei Verdacht einen kleinen Stängelquerschnitt auf Leitgewebeverfärbung prüfen",
        ],
      },
      {
        heading: "Diagnose — Abgrenzung von Pythium-Wurzelfäule",
        content: [
          "Fusarium: oft einseitiges/sektorales Welken, Wurzeln bleiben äußerlich meist intakt, Bestätigung über bräunlichen Ring im Stängelquerschnitt.",
          "Pythium-Wurzelfäule: gleichmäßigeres Welken der ganzen Pflanze, Wurzeln werden braun und schleimig, kein charakteristischer Leitgewebering im Stängel.",
          "Bei Unsicherheit einen Stängel knapp über dem Substrat durchschneiden und auf Verfärbung im Querschnitt prüfen — das ist das zuverlässigste Feldmerkmal.",
        ],
      },
      {
        heading: "Korrekturmaßnahmen",
        content: [
          "Es gibt keine wirksame Heilung eines systemisch befallenen Xylems — stark betroffene Pflanzen isolieren und in fortgeschrittenen Fällen entfernen, um Ausbreitung zu verhindern.",
          "Bei frühem, lokalem Befall betroffene Triebe konsequent entfernen und die Pflanze unter reduziertem Stress (stabiles Klima, moderate Düngung) weiterführen.",
          "Substrat und Anbaugefäße einer befallenen Pflanze nicht wiederverwenden — Fusarium-Sporen überdauern lange im Material.",
        ],
      },
      {
        heading: "Vorbeugung",
        content: [
          "Neues, unbelastetes Substrat für jeden Durchgang verwenden, besonders nach einem bestätigten Fusarium-Fall.",
          "Werkzeuge zwischen Pflanzen konsequent desinfizieren, da Fusarium mechanisch übertragen werden kann.",
          "Wurzelstress durch Staunässe oder extreme Temperaturschwankungen vermeiden — geschwächte Wurzeln sind anfälliger für den Erstbefall.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Einseitiges Welken vorschnell als Gießfehler oder Nährstoffproblem interpretieren, ohne den Stängelquerschnitt zu prüfen.",
          "Substrat einer befallenen Pflanze für den nächsten Durchgang wiederverwenden.",
          "Bei ersten Anzeichen abwarten, statt frühzeitig betroffene Triebe zu entfernen und zu isolieren.",
        ],
      },
    ],
    warnings: [
      "Substrat und Anbaugefäße aus einem bestätigten Fusarium-Fall sollten nicht für neue Pflanzen wiederverwendet werden — die Sporen können über Jahre im Material überdauern.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum einseitiges Welken?",
        text: "Fusarium verstopft einzelne Wasserleitbahnen im Stängel. Da nicht alle Leitbahnen gleichzeitig betroffen sind, kann zunächst nur eine Seite oder ein Trieb der Pflanze welken, während der Rest normal aussieht."
      },
      {
        title: "Kurz erklärt: Der Stängeltest",
        text: "Ein Schnitt durch den unteren Stängel zeigt bei Fusarium-Befall oft einen bräunlich-rötlichen Ring im Leitgewebe. Das ist das zuverlässigste einfache Merkmal zur Bestätigung."
      },
    ],
    faq: [
      {
        question: "Kann ich eine Fusarium-befallene Pflanze retten?",
        answer:
          "Bei frühem, lokalem Befall kann das Entfernen betroffener Triebe helfen. Bei systemischem Befall des gesamten Leitgewebes gibt es keine wirksame Heilung — die Pflanze sollte isoliert und in fortgeschrittenen Fällen entfernt werden."
      },
      {
        question: "Wie unterscheide ich Fusarium sicher von Pythium-Wurzelfäule?",
        answer:
          "Über einen Stängelquerschnitt: ein bräunlicher Ring im Leitgewebe spricht für Fusarium. Bei Pythium sind stattdessen die Wurzeln selbst braun und schleimig, das Leitgewebe im Stängel bleibt meist unauffällig."
      },
    ],
    glossary: [
      { term: "Xylem", definition: "Leitgewebe der Pflanze, das Wasser und gelöste Mineralien von der Wurzel in die oberirdischen Teile transportiert." },
      { term: "Sektorales Welken", definition: "Welken, das nur einen Teil oder eine Seite der Pflanze betrifft, weil nicht alle Leitbahnen gleichzeitig blockiert sind." },
      { term: "Bodenbürtig", definition: "Ein Krankheitserreger, der im Substrat überdauert und über die Wurzel in die Pflanze eindringt." },
    ],
    sourceIds: ["fusarium-wilt-review", "punja-cannabis-pathogens", "pythium-root-rot-hydroponics"],
    relatedSlugs: ["wurzelfaeule", "cannabis-substrat-und-wurzelzone", "bud-rot-botrytis"],
  },
  {
    slug: "calmag-supplementierung",
    title: "Cal-Mag-Supplementierung bei Cannabis richtig einsetzen",
    summary:
      "Nicht jedes Setup braucht Cal-Mag — aber bei Umkehrosmose- oder Coco-Substrat ist ein Zusatz fast immer nötig. So erkennst du den echten Bedarf und dosierst korrekt, statt pauschal zu supplementieren.",
    category: "anbau",
    difficulty: "fortgeschritten",
    readMinutes: 8,
    lastUpdated: "2026-08-03",
    tags: ["Cal-Mag", "Calcium", "Magnesium", "Wasserqualität", "Diagnose"],
    keyTakeaways: [
      "Der Bedarf an Cal-Mag hängt primär von der Wasserquelle ab: Umkehrosmose- und Weichwasser enthalten praktisch kein Ca/Mg, hartes Leitungswasser oft schon ausreichend.",
      "Coco-Substrat bindet Ca²⁺ und Mg²⁺ bevorzugt an seiner Kationenaustauschoberfläche gegenüber K⁺ — ein routinemäßiger Cal-Mag-Zusatz ist dort auch bei ausreichender Wasserquelle oft sinnvoll.",
      "Pauschale, unnötige Cal-Mag-Gabe bei bereits hartem Wasser kann das Ca:Mg-Verhältnis verschieben und selbst einen Antagonismus auslösen."
    ],
    quickFacts: [
      { label: "Ziel-Mg in Lösung", value: "50–70 mg/L" },
      { label: "Ziel Ca:Mg-Verhältnis", value: "≈ 3:1 bis 4:1" },
      { label: "Braucht meist Cal-Mag", value: "RO-Wasser, Coco-Substrat" },
      { label: "Braucht meist kein Cal-Mag", value: "Hartes Leitungswasser" },
    ],
    sections: [
      {
        heading: "Definition und Einordnung",
        content: [
          "Cal-Mag-Supplementierung bezeichnet die gezielte Ergänzung von Calcium und Magnesium zur Nährlösung, meist als Reaktion auf eine Wasserquelle oder ein Substrat, das diese Ionen nicht ausreichend bereitstellt.",
          "Der tatsächliche Bedarf ist stark wasserquellen- und substratabhängig — pauschale Cal-Mag-Gabe ohne diese Einordnung führt teils zu unnötiger Überdosierung.",
        ],
      },
      {
        heading: "Wissenschaftlicher Hintergrund",
        content: [
          "Umkehrosmose-Wasser entfernt praktisch alle gelösten Mineralien, einschließlich Ca²⁺ und Mg²⁺ — ohne Zusatz fehlt der Pflanze eine zentrale Ionenquelle für Zellwandstabilität (Ca) und Chlorophyllsynthese (Mg).",
          "Coco-Substrat besitzt eine relevante Kationenaustauschkapazität, bindet dabei aber Ca²⁺ und Mg²⁺ bevorzugt gegenüber K⁺ an seinen Fasern — das reduziert die effektiv pflanzenverfügbare Menge, selbst wenn genug Ca/Mg zugeführt wurde.",
        ],
      },
      {
        heading: "Wann Cal-Mag wirklich nötig ist",
        content: [
          "Umkehrosmose- oder destilliertes Wasser: Cal-Mag-Zusatz ist praktisch Pflicht, da diese Wasserquellen kein nennenswertes Ca/Mg enthalten.",
          "Coco-Substrat: routinemäßiger Zusatz ist auch bei mittelhartem Wasser meist sinnvoll, wegen der bevorzugten Bindung von Ca/Mg an der Substratoberfläche.",
          "Hartes Leitungswasser in Erde: Cal-Mag ist meist NICHT nötig, da das Wasser bereits ausreichend Ca/Mg mitbringt — zusätzliche Gabe kann das Verhältnis unnötig verschieben.",
        ],
        checklist: [
          "Wasserquelle (RO, Leitungswasser, Brunnenwasser) und deren Härte kennen, bevor supplementiert wird",
          "Substrat (Coco vs. Erde) bei der Bedarfsentscheidung mitdenken",
          "Ca:Mg-Verhältnis der Gesamtrezeptur prüfen, nicht nur die absolute Menge",
        ],
      },
      {
        heading: "Diagnose: Cal-Mag-Bedarf erkennen",
        content: [
          "Frühzeichen für unzureichende Ca/Mg-Versorgung: interveinale Chlorose an älteren Blättern (Mg) oder Wachstumsdeformationen an jungen Trieben (Ca) trotz augenscheinlich vollständigem Düngeprogramm.",
          "Bei RO-Wasser oder Coco-Substrat ohne bisherigen Cal-Mag-Zusatz sind diese Symptome ein starker Hinweis auf echten strukturellen Mangel, nicht auf eine Blockade.",
        ],
      },
      {
        heading: "Dosierung und Korrektur",
        content: [
          "Zielwert für Magnesium in der fertigen Nährlösung: etwa 50–70 mg/L, abgestimmt auf die übrige Düngerrezeptur.",
          "Ca:Mg-Verhältnis auf etwa 3:1 bis 4:1 einstellen — ein starkes Ungleichgewicht in beide Richtungen kann die Aufnahme des jeweils anderen Ions hemmen.",
          "Nach dem Zusatz die Gesamt-EC neu kontrollieren, da Cal-Mag-Produkte die Leitfähigkeit der Lösung mit erhöhen.",
        ],
      },
      {
        heading: "Häufige Fehler",
        content: [
          "Cal-Mag pauschal bei jedem Setup zusetzen, auch bei bereits hartem Leitungswasser mit ausreichend Ca/Mg.",
          "Cal-Mag als Reaktion auf jedes Mangelbild geben, ohne vorher pH und Kationenverhältnisse zu prüfen — viele scheinbare Mg-Mängel sind pH-Blockaden, keine echten Defizite.",
          "Bei Coco-Substrat gar keinen Cal-Mag-Zusatz einplanen, weil das Wasser 'eigentlich hart genug' erscheint, ohne die substratbedingte Bindung zu berücksichtigen.",
        ],
      },
      {
        heading: "Fortgeschrittene Überlegungen",
        content: [
          "In rezirkulierenden Hydro-Systemen kann sich das Ca:Mg-Verhältnis über mehrere Zyklen verschieben, wenn ein Ion schneller aufgenommen wird als das andere — periodische Kontrolle und Reservoir-Reset gleichen das aus.",
          "Manche Cal-Mag-Produkte enthalten zusätzlich Eisen oder andere Mikronährstoffe — die Gesamtrezeptur sollte darauf abgestimmt werden, um Doppeldosierungen zu vermeiden.",
        ],
      },
    ],
    warnings: [
      "Cal-Mag-Zusatz bei bereits hartem Leitungswasser ohne vorherige Wasseranalyse kann das Ca:Mg-Verhältnis unnötig verschieben und einen neuen Antagonismus auslösen.",
    ],
    simpleExplainers: [
      {
        title: "Kurz erklärt: Warum RO-Wasser Cal-Mag braucht",
        text: "Umkehrosmose entfernt fast alle gelösten Mineralien aus dem Wasser, auch Calcium und Magnesium. Ohne Zusatz fehlen der Pflanze diese Bausteine komplett, unabhängig vom übrigen Dünger."
      },
      {
        title: "Kurz erklärt: Warum Coco anders reagiert",
        text: "Coco-Fasern binden Calcium und Magnesium an ihrer Oberfläche besonders stark. Auch wenn genug davon zugeführt wird, kommt weniger bei der Wurzel an als in anderen Substraten."
      },
    ],
    faq: [
      {
        question: "Brauche ich bei Leitungswasser überhaupt Cal-Mag?",
        answer:
          "Meist nicht, wenn das Wasser mittelhart bis hart ist — es enthält dann bereits ausreichend Ca/Mg. Eine einfache Wasserhärte-Prüfung schafft hier Klarheit, bevor pauschal zugesetzt wird.",
      },
      {
        question: "Kann zu viel Cal-Mag schaden?",
        answer:
          "Ja. Ein zu stark verschobenes Ca:Mg-Verhältnis kann die Aufnahme des jeweils anderen Ions hemmen und zusätzlich die Gesamt-EC unnötig erhöhen.",
      },
      {
        question: "Warum brauche ich in Coco Cal-Mag, obwohl mein Wasser hart ist?",
        answer:
          "Weil Coco-Substrat Calcium und Magnesium an seiner Faseroberfläche bindet und dadurch weniger davon tatsächlich an der Wurzel ankommt, selbst wenn das Ausgangswasser ausreichend Ca/Mg enthält.",
      },
    ],
    glossary: [
      { term: "Cal-Mag", definition: "Handelsübliches Zusatzprodukt zur gezielten Ergänzung von Calcium und Magnesium in der Nährlösung." },
      { term: "Umkehrosmose (RO)", definition: "Wasseraufbereitungsverfahren, das nahezu alle gelösten Mineralien aus dem Wasser entfernt." },
      { term: "Wasserhärte", definition: "Maß für den Gehalt an gelösten Calcium- und Magnesiumionen im Wasser." },
    ],
    sourceIds: ["marschner-mineral-nutrition", "bryson-plant-nutrition-manual", "bugbee-electrical-conductivity"],
    relatedSlugs: ["magnesiummangel", "calciummangel", "naehrstoffblockaden-und-antagonismen", "substrat-vergleich-coco-erde-hydro"],
  },
];

// ─── Allowlist-Anreicherung (Publikation via GROW_KNOWLEDGE in wiki.ts) ──────
export const DIAGNOSTIC_GROW_KNOWLEDGE: Record<
  string,
  { growValue: string; qualityScore: number; growCategory: GrowCategory }
> = {
  magnesiummangel: {
    growValue:
      "Bei interveinaler Chlorose an unteren Blättern zuerst den Wurzelzonen-pH ins Mg-Fenster bringen (Coco/Hydro 5.8–6.2, Erde 6.2–6.8), dann MgSO4 1–2 g/L geben.",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  stickstoffmangel: {
    growValue:
      "Gleichmäßiges Vergilben alter Blätter in Vegetation/Frühblüte = nachdüngen (EC +0.2–0.4); in der Spätblüte ist es Fade — dann NICHT gegensteuern.",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  calciummangel: {
    growValue:
      "Fleckige, verkrüppelte JUNGE Triebe bei RO-/Weichwasser heißen Cal-Mag auf 120–180 mg/L Ca dosieren, pH richten und VPD nicht zu niedrig fahren.",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  kaliummangel: {
    growValue:
      "Verbrannte Ränder an alten Blättern bei grüner Mitte = K-Mangel; erst per EC von Nährstoff-Burn abgrenzen, dann K-betont düngen und Ca/Mg nicht überdosieren.",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  eisenmangel: {
    growValue:
      "Neongelbe junge Blätter mit grünen Adern sind fast immer pH-bedingt — Wurzel-pH senken (Coco/Hydro 5.8–6.2), Chelat zum pH wählen (EDDHA bei hohem pH).",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  spinnmilben: {
    growValue:
      "Stippling oben + Gespinst unten = Spinnmilben; Klima auf kühler/feuchter stellen, Raubmilben früh einsetzen, Wirkstoffe rotieren, nie in der Spätblüte sprühen.",
    qualityScore: 5,
    growCategory: "stress",
  },
  thripse: {
    growValue:
      "Silbrige Streifen + schwarze Kotpunkte = Thripse; Blautafeln zum Monitoring und Nützlinge für Blatt UND Substrat einsetzen — das Boden-Puppenstadium nie vergessen.",
    qualityScore: 5,
    growCategory: "stress",
  },
  trauermuecken: {
    growValue:
      "Schwarze Mücken über dem Substrat = zu nasse Erde; obere 2–3 cm zwischen den Gaben abtrocknen lassen, Gelbtafeln gegen Adulte, Bti/Nematoden gegen Larven.",
    qualityScore: 4,
    growCategory: "stress",
  },
  "bud-rot-botrytis": {
    growValue:
      "Ein welkes Einzelblättchen in der Knospe ist das Bud-Rot-Frühwarnsignal; Spätblüte-RH auf 40–50 % halten, Luft bewegen, befallene Knospen isoliert entfernen — keine Heilung.",
    qualityScore: 5,
    growCategory: "yield",
  },
  "echter-mehltau-powdery-mildew": {
    growValue:
      "Weißer, abwischbarer Belag auf Blattoberseiten = Echter Mehltau; RH senken, Luft bewegen, Bestand auslichten und strikt Quarantäne halten — erntenahe Knospen nicht sprühen.",
    qualityScore: 5,
    growCategory: "yield",
  },
  wurzelfaeule: {
    growValue:
      "Welk TROTZ nassem Substrat + braune, schleimige Wurzeln = Pythium; nicht mehr gießen, Lösung kühlen (< 20 °C) und belüften, System reinigen, Nützlinge einbringen.",
    qualityScore: 5,
    growCategory: "watering",
  },
  // ─── Wave 4 – Toxizitäten / Überschüsse (Phase 19) ─────────────────────────
  stickstoffueberschuss: {
    growValue:
      "Dunkelgrüne, klauenförmige Blätter (The Claw) an JUNGEN Trieben = N-Überschuss; mit pH-korrektem Wasser spülen, EC senken und in der Blüte den Stickstoff drosseln.",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  "kalium-ueberschuss": {
    growValue:
      "Mg-/Ca-Mangelbild TROTZ Dosierung = Kalium-Antagonismus; nicht mehr Mg/Ca geben, sondern K/PK-Booster drosseln, spülen und Ca:Mg:K neu balancieren.",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  calciumueberschuss: {
    growValue:
      "Mg-Mangelbild + steigender pH bei hartem Wasser = Calciumüberschuss; Cal-Mag reduzieren, RO-Wasser beimischen, pH richten und Ca:Mg auf ~3:1 bis 4:1 einstellen.",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  "salzanreicherung-hohe-ec": {
    growValue:
      "Welke TROTZ feuchtem Substrat + verbrannte Blattränder = Salzstress; Drainage-EC gegen Zulauf prüfen, mit pH-korrektem Wasser spülen und niedriger neu aufdüngen.",
    qualityScore: 5,
    growCategory: "watering",
  },
  "naehrstoffverbrennung-tipburn": {
    growValue:
      "Braune, verbrannte Blattspitzen an den kräftigsten Blättern = Überdüngung; EC senken bzw. spülen und niedrig neu aufbauen — verbrannte Spitzen ergrünen nicht.",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  // ─── Wave 5 – Umwelt- & Klimastress (Phase 20) ─────────────────────────────
  hitzestress: {
    growValue:
      "Blattränder nach OBEN gerollt (Tacoing) + aufrechte Haltung an den lampennächsten Blättern = Hitze; Lampe dimmen/höher hängen, Lufttemp. auf 24–28 °C und VPD auf 1.0–1.5 kPa bringen — nicht düngen.",
    qualityScore: 5,
    growCategory: "climate",
  },
  kaeltestress: {
    growValue:
      "Purpurne Stängel/Blattunterseiten + langsames Wachstum = Kälte, kein P-Mangel; Wurzelzone auf 18–22 °C wärmen, Nachtabsenkung < 8 °C halten und Gießwasser auf ~20 °C temperieren.",
    qualityScore: 5,
    growCategory: "climate",
  },
  windbrand: {
    growValue:
      "Verkrümmte 'Klauen' NUR im direkten Ventilatorstrahl, ohne Schädlinge/Mangelmuster = Windbrand; Lüfter auf indirekte, sanfte Umluft umstellen, bei der sich die Blätter nur leicht wiegen.",
    qualityScore: 4,
    growCategory: "climate",
  },
  "luftfeuchte-management": {
    growValue:
      "Steuere VPD, nicht die nackte RH-Zahl: Veg ~0.8–1.1, Blüte ~1.2–1.5 kPa; in der späten Blüte RH auf 40–50 % drücken (auch nachts), um Bud Rot und Mehltau zu vermeiden.",
    qualityScore: 5,
    growCategory: "climate",
  },
  "co2-management": {
    growValue:
      "Leistungsplateau TROTZ optimalem Licht/VPD/Dünger = CO₂-Limit; zuerst Luftwechsel erhöhen, Anreicherung (800–1200 ppm) nur bei hohem PPFD + 28–30 °C und mit Sensor/Sicherheit.",
    qualityScore: 5,
    growCategory: "climate",
  },
  "ph-lockout": {
    growValue:
      "Mehrere Mangelbilder gleichzeitig = meist pH-Lockout, kein Einzelmangel; zuerst das pH-Messgerät kalibrieren, dann pH schrittweise (max. 0.3–0.5/Tag) ins Zielfenster bringen, bevor mehr gedüngt wird.",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  "ueberwaesserung-staunaesse": {
    growValue:
      "Hängende Blätter OHNE Erholung nach dem Gießen = Staunässe, nicht Wassermangel; Gießen stoppen, Substrat abtrocknen lassen und Topfgröße auf die tatsächliche Wurzelmasse prüfen.",
    qualityScore: 5,
    growCategory: "watering",
  },
  blattlaeuse: {
    growValue:
      "Honigtau + Ameisenbesuch = Blattlaus-Symbiose; Ameisenwege unterbrechen UND die Kolonie direkt bekämpfen (abspülen, Nützlinge), sonst kehrt der Befall trotz Ameisenbekämpfung zurück.",
    qualityScore: 4,
    growCategory: "stress",
  },
  "weisse-fliege": {
    growValue:
      "Wolkenartiges Auffliegen beim Berühren = Weiße Fliege, nicht Blattlaus; gelbe Klebefallen in Canopy-Höhe früh aufhängen und Encarsia formosa einsetzen, bevor die Population groß wird.",
    qualityScore: 4,
    growCategory: "stress",
  },
  phosphormangel: {
    growValue:
      "Dunkelgrün-bläuliche Blätter + violette Stiele: erst Wurzelzonentemperatur prüfen (< 18 °C = eher Kälte), dann pH (5.8–6.5) korrigieren, bevor mehr Phosphor gegeben wird.",
    qualityScore: 5,
    growCategory: "nutrients",
  },
  "hanf-rostmilben": {
    growValue:
      "Nach UNTEN gerollte, matte Blätter ohne Gespinst = Verdacht auf Rostmilben; da sie kaum sichtbar sind, neue Pflanzen konsequent 1 Woche in Quarantäne mit Lupenkontrolle halten.",
    qualityScore: 4,
    growCategory: "stress",
  },
  fusarium: {
    growValue:
      "Einseitiges Welken trotz feuchtem Substrat = Verdacht auf Fusarium; Stängelquerschnitt auf bräunlichen Leitgewebering prüfen und befallenes Substrat danach nicht wiederverwenden.",
    qualityScore: 4,
    growCategory: "stress",
  },
  "calmag-supplementierung": {
    growValue:
      "Cal-Mag ist bei RO-Wasser und in Coco meist Pflicht, bei hartem Leitungswasser in Erde meist unnötig; Ziel-Mg 50–70 mg/L und Ca:Mg ~3:1 bis 4:1 einstellen, nicht pauschal zusetzen.",
    qualityScore: 4,
    growCategory: "nutrients",
  },
};
