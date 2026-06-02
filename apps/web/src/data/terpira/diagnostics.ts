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
};
