// ── Diagnose-System: Entscheidungsbaum ─────────────────────────────────────

import { Leaf, Sprout, Thermometer, Bug, type LucideIcon } from "lucide-react";

export type DiagnoseToolLink = {
  slug: string;
  label: string;
};

export type Confidence = "high" | "medium" | "low";

export type DiagnoseResult = {
  id: string;
  title: string;
  icon: string;
  confidence: Confidence;
  reasoning: string;
  cause: string;
  explanation: string;
  steps: string[];
  toolLinks: DiagnoseToolLink[];
  logNote: string;
};

export type DiagnoseOption = {
  label: string;
  nextNodeId?: string;
  resultId?: string;
};

export type DiagnoseNode = {
  id: string;
  question: string;
  hint?: string;
  options: DiagnoseOption[];
};

export type DiagnoseCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  startNodeId: string;
};

// ── Ergebnisse ──────────────────────────────────────────────────────────────

export const diagnoseResults: Record<string, DiagnoseResult> = {
  // Nährstoffmängel
  "n-mangel": {
    id: "n-mangel",
    title: "Stickstoffmangel (N)",
    icon: "🟡",
    confidence: "high",
    reasoning:
      "Gleichmäßige Vergilbung alter Blätter von unten nach oben ist das Lehrbuchbild für N-Mobilisierung – einer der eindeutigsten Mängel überhaupt.",
    cause: "Unterdosierung oder pH-bedingte Aufnahmeblockade.",
    explanation:
      "Ältere, untere Blätter vergilben zuerst – Stickstoff wird aus dem Altgewebe mobilisiert und in den Neuwuchs verlagert.",
    steps: [
      "pH im Wurzelraum prüfen (Ziel: 5,8–6,5 Erde / 5,5–6,1 Coco)",
      "N-Anteil im Futter schrittweise erhöhen",
      "Nach 3–5 Tagen Neuwuchs (nicht Altblätter) bewerten",
    ],
    toolLinks: [{ slug: "naehrstoff-rechner", label: "Nährstoff-Rechner" }],
    logNote:
      "Stickstoffmangel festgestellt – ältere Blätter vergilben. pH geprüft, N-Gabe angepasst.",
  },
  "p-mangel": {
    id: "p-mangel",
    title: "Phosphormangel (P)",
    icon: "🟣",
    confidence: "medium",
    reasoning:
      "Dunkles Laub mit Violetttönen deutet auf P-Blockade hin – ähnliche Symptome treten auch bei Kältestress auf, daher mittlere Sicherheit.",
    cause: "Zu niedrige Wurzeltemperatur oder pH außerhalb Zielbereich.",
    explanation:
      "P wird bei kühlem Substrat oder falschem pH blockiert. Violette Blattstiele und matt-dunkelgrüne Blätter sind typisch.",
    steps: [
      "Substrattemperatur überprüfen (min. 18 °C)",
      "pH korrigieren",
      "Moderate P-Anhebung + Nachkontrolle nach 5 Tagen",
    ],
    toolLinks: [{ slug: "naehrstoff-rechner", label: "Nährstoff-Rechner" }],
    logNote:
      "Phosphormangel-Verdacht – dunkles Laub, evtl. violette Stiele. Wurzelzone temperiert + pH angepasst.",
  },
  "k-mangel": {
    id: "k-mangel",
    title: "Kaliummangel (K)",
    icon: "🔴",
    confidence: "high",
    reasoning:
      "Randnekrosen an alten Blättern (nicht Spitze, nicht Mitte) sind ein starkes Kalium-Signal – besonders charakteristisch in der Blüte.",
    cause: "Unterversorgung im Peak-Bedarf oder Antagonismus durch Ca/Mg.",
    explanation:
      "Braune, nekrotische Blattränder an mittleren bis älteren Blättern. Tritt typischerweise in der Blüte auf.",
    steps: [
      "K-Anteil gezielt anheben",
      "Ca/Mg-Verhältnis prüfen und ausbalancieren",
      "Nach 5–7 Tagen auf Stopp der Randnekrose prüfen",
    ],
    toolLinks: [{ slug: "naehrstoff-rechner", label: "Nährstoff-Rechner" }],
    logNote:
      "Kaliummangel-Verdacht – nekrotische Blattränder. K erhöht, Nährstoffverhältnisse neu balanciert.",
  },
  "ca-mangel": {
    id: "ca-mangel",
    title: "Calciummangel (Ca)",
    icon: "🟤",
    confidence: "medium",
    reasoning:
      "Deformierter Neuwuchs passt zu Ca-Immobilität, aber hohes VPD und pH-Fehler sehen ähnlich aus – Klimawerte sollten gegengeprüft werden.",
    cause: "Zu geringe Ca-Verfügbarkeit oder hohes VPD mit Transpirationsstress.",
    explanation:
      "Calcium ist immobil – Neuwuchs zeigt sich deformiert oder mit kleinen Nekroseflecken.",
    steps: [
      "Cal/Mag-Gabe moderat erhöhen",
      "VPD / RLF stabilisieren",
      "pH und EC in Zielbereich bringen",
    ],
    toolLinks: [{ slug: "vpd", label: "VPD-Rechner" }],
    logNote: "Calciummangel-Verdacht – verkrüppelter Neuwuchs. Cal/Mag angepasst, Klima gecheckt.",
  },
  "mg-mangel": {
    id: "mg-mangel",
    title: "Magnesiummangel (Mg)",
    icon: "🍋",
    confidence: "high",
    reasoning:
      "Interkostale Chlorosen mit grünen Adern an alten Blättern – dieses Muster ist nahezu unverwechselbar für Mg-Mangel.",
    cause: "Zu wenig Mg oder Ca/K-Antagonismus.",
    explanation:
      "Interkostale Chlorosen an älteren Blättern – die Blattadern bleiben grün, der Bereich dazwischen wird gelb.",
    steps: [
      "Mg ergänzen (z. B. Bittersalz 1–2 g/L)",
      "Ca:Mg-Verhältnis prüfen",
      "pH-Korridor einhalten (6,0–6,5)",
    ],
    toolLinks: [{ slug: "naehrstoff-rechner", label: "Nährstoff-Rechner" }],
    logNote:
      "Magnesiummangel-Verdacht – Chlorosen zwischen Blattadern. Mg ergänzt, Ca:Mg-Verhältnis angepasst.",
  },
  "fe-mangel": {
    id: "fe-mangel",
    title: "Eisenmangel (Fe)",
    icon: "💛",
    confidence: "high",
    reasoning:
      "Limonengrüner Neuwuchs mit noch erkennbaren grünen Adern ist spezifisch für Fe – fast ausnahmslos eine pH-Drift-Folge.",
    cause: "Meist pH-bedingte Blockade (pH > 7,0) oder nasse Wurzelzone.",
    explanation:
      "Sehr heller, limonengrüner Neuwuchs mit noch erkennbaren Blattadern – Eisen ist immobil.",
    steps: [
      "pH zuerst in Zielbereich senken",
      "Geeignete Fe-Chelatform einsetzen",
      "Bewässerungsrhythmus stabilisieren (keine Staunässe)",
    ],
    toolLinks: [{ slug: "naehrstoff-rechner", label: "Nährstoff-Rechner" }],
    logNote:
      "Eisenmangel-Verdacht – heller Neuwuchs, Adern noch grün. pH gesenkt, Fe-Chelat zugegeben.",
  },
  "lockout": {
    id: "lockout",
    title: "Nährstoffblockade",
    icon: "⚠️",
    confidence: "medium",
    reasoning:
      "Mehrere Mangelsymptome gleichzeitig ohne klare Richtung und keine Reaktion auf Nachfüttern – EC und pH im Drain sollten das bestätigen.",
    cause: "pH-Drift oder Salzakkumulation blockiert mehrere Nährstoffe gleichzeitig.",
    explanation:
      "Uneinheitliches Blattbild mit Mischsymptomen (gelb + verbrannt + dunkel) trotz Düngung ist ein klassisches Lockout-Zeichen.",
    steps: [
      "Drain-pH und Drain-EC messen",
      "Wurzelzone mit pH-korrigiertem Wasser (ggf. leicht erhöhter EC) spülen",
      "Schrittweise auf balanciertes Futter zurückführen",
    ],
    toolLinks: [{ slug: "naehrstoff-rechner", label: "Nährstoff-Rechner" }],
    logNote:
      "Nährstoffblockade-Verdacht – Mischsymptome trotz Düngung. Drain-Werte gemessen, Spülgang durchgeführt.",
  },
  "uebersalzung": {
    id: "uebersalzung",
    title: "Übersalzung / Nutrient Burn",
    icon: "🔥",
    confidence: "high",
    reasoning:
      "Tipping (braune Spitzen bei sonst gesunden Blättern ohne Mangelbild) ist das eindeutigste Nutrient-Burn-Zeichen – selten etwas anderes.",
    cause: "Zu hohe EC im Root-Zone verursacht osmotischen Stress.",
    explanation:
      "Braun-nekrotische Blattspitzen (Tipping) an gesunden Pflanzen ohne sonstiges Mangelbild ist das Hauptzeichen.",
    steps: [
      "EC im Drain messen – wenn > 3,5 EC: Spülgang",
      "Nächste Gabe auf 50 % reduzieren",
      "Drain-Verhältnis erhöhen (20–30 % Runoff)",
    ],
    toolLinks: [{ slug: "naehrstoff-rechner", label: "Nährstoff-Rechner" }],
    logNote:
      "Nutrient Burn erkannt – braune Blattspitzen. EC gesenkt, Spülgang durchgeführt.",
  },
  // Klimaprobleme
  "hitzestress": {
    id: "hitzestress",
    title: "Hitzestress",
    icon: "🌡️",
    confidence: "high",
    reasoning:
      "Tacoing (nach oben rollende Blätter) ist die direkte pflanzliche Schutzreaktion gegen Überhitzung – ein sehr zuverlässiges Zeichen.",
    cause: "Temperaturen dauerhaft über 30 °C führen zu Zellschäden und Terpenverlust.",
    explanation:
      "Blätter rollen sich nach oben (tacoing), Spitzen verbrennen – die Pflanze versucht Verdunstungsfläche zu reduzieren.",
    steps: [
      "Lampenabstand erhöhen / Lichtleistung drosseln",
      "Abluft und Zuluft optimieren",
      "Ziel-Canopy-Temperatur: 22–26 °C",
    ],
    toolLinks: [
      { slug: "vpd", label: "VPD-Rechner" },
      { slug: "abluft-rechner", label: "Abluft-Rechner" },
    ],
    logNote:
      "Hitzestress – Blätter rollen hoch (tacoing). Lampenabstand korrigiert, Belüftung optimiert.",
  },
  "kaeltestress": {
    id: "kaeltestress",
    title: "Kältestress",
    icon: "🧊",
    confidence: "medium",
    reasoning:
      "Violette Anthocyan-Einlagerung + langsames Wachstum bei bekannt kühlem Substrat passen gut zusammen – P-Blockade sieht aber ähnlich aus.",
    cause: "Substrattemperatur unter 15 °C hemmt Nährstoffaufnahme und Enzymaktivität.",
    explanation:
      "Langsames Wachstum, violette Töne (Anthocyan-Einlagerung) und schlechte Wasseraufnahme.",
    steps: [
      "Substrattemperatur messen (min. 18 °C)",
      "Raumtemperatur in der Nachtabsenkung prüfen (> 17 °C)",
      "Topf ggf. isolieren / Heizmatte nutzen",
    ],
    toolLinks: [],
    logNote: "Kältestress erkannt – violette Töne, langsames Wachstum. Substrattemperatur angehoben.",
  },
  "vpd-hoch": {
    id: "vpd-hoch",
    title: "Hohes VPD / Trockenstress",
    icon: "💨",
    confidence: "medium",
    reasoning:
      "Trockenstress durch hohes VPD erklärt Stomata-Reaktion und sekundäre Ca-Probleme – VPD-Messung bestätigt die Diagnose.",
    cause: "Zu niedrige Luftfeuchtigkeit + hohe Temperatur = hoher Sättigungsdefizit-Druck.",
    explanation:
      "Die Pflanze schließt Stomata und verlangsamt Photosynthese, um Wasser zu sparen. Calciumaufnahme leidet.",
    steps: [
      "VPD-Ziel: 0,8–1,2 kPa in Veg / 1,0–1,5 kPa in Blüte",
      "Luftbefeuchter einsetzen oder Temp. senken",
      "Nächste Gabe früher einplanen",
    ],
    toolLinks: [{ slug: "vpd", label: "VPD-Rechner" }],
    logNote:
      "Hohes VPD festgestellt – trockene Luft. Befeuchter aktiviert, Soll-VPD eingestellt.",
  },
  "ueberwaesserung": {
    id: "ueberwaesserung",
    title: "Überwässerung / Wurzelstress",
    icon: "💧",
    confidence: "medium",
    reasoning:
      "Welken trotz feuchtem Substrat ist das Überwässerungs-Paradox – Wurzelkrankheiten scheiden als Alternative nicht aus.",
    cause: "Dauernasse Substratoberfläche ohne Trockenphase erstickt die Wurzelzone.",
    explanation:
      "Welke trotz nassem Substrat, dunkle Flecken und langsames Wachstum – klassische Überwässerungszeichen.",
    steps: [
      "Bewässerungsfrequenz reduzieren",
      "Topf vor Gabe auf Gewicht prüfen (leicht + trocken)",
      "Drainage kontrollieren",
    ],
    toolLinks: [],
    logNote:
      "Überwässerung-Verdacht – welk trotz nassem Substrat. Gießintervall erhöht, Drainage geprüft.",
  },
  // Schädlinge
  "spinnmilben": {
    id: "spinnmilben",
    title: "Spinnmilben",
    icon: "🕷️",
    confidence: "high",
    reasoning:
      "Feine Gespinste auf der Blattunterseite kombiniert mit hellen Saugpunkten oben sind ein eindeutiges Spinnmilben-Zeichen.",
    cause: "Trockene Warmluft (> 27 °C, < 40 % RLF) begünstigt exponentielle Ausbreitung.",
    explanation:
      "Feine Gespinste und helle Saugpunkte auf Blattoberseiten. Populationsverdopplung alle 3–5 Tage.",
    steps: [
      "Raubmilben (Phytoseiulus persimilis) sofort ausbringen",
      "Kaliseife / Pflanzenöl im 3x Intervall (je 3 Tage)",
      "Feuchte erhöhen + Lampe kühler fahren",
    ],
    toolLinks: [{ slug: "vpd", label: "VPD-Rechner" }],
    logNote:
      "Spinnmilbenbefall festgestellt – Gespinste + Punkte auf Blättern. Raubmilben eingesetzt, behandelt.",
  },
  "trauermuecken": {
    id: "trauermuecken",
    title: "Trauermücken",
    icon: "🦟",
    confidence: "high",
    reasoning:
      "Schwarze Flieger direkt über nassem Substrat passen kaum zu etwas anderem – Trauermückenbefall ist sehr klar erkennbar.",
    cause: "Dauernasse Substratoberfläche und hoher Organikanteil bieten ideale Eiablagefläche.",
    explanation:
      "Adulte fliegen harmlos, aber Larven fressen Feinwurzeln und fördern Pythium / Fusarium.",
    steps: [
      "Substratoberfläche antrocknen lassen",
      "Nematoden (Steinernema feltiae) ins Gießwasser",
      "BTI-Produkte + Gelbleimtafeln auf Topfkante",
    ],
    toolLinks: [],
    logNote:
      "Trauermückenbefall – Flieger über Substrat. Gießintervall erhöht, BTI + Nematoden eingesetzt.",
  },
  "thripse": {
    id: "thripse",
    title: "Thripse",
    icon: "🪲",
    confidence: "high",
    reasoning:
      "Silbrige Schabspuren (kein Gespinst) mit schwarzen Kotpunkten auf Blattunterseiten sind thrips-spezifisch – Verwechslungsgefahr gering.",
    cause: "Einschleppung über Kleidung oder Frischpflanzen, Puppenstadien im Substrat.",
    explanation:
      "Silbrige Schabspuren + schwarze Kotpunkte. Virusvektor (TSWV) – Frühintervention ist kritisch.",
    steps: [
      "Raubmilben (Amblyseius swirskii) einsetzen",
      "Nematoden gegen Puppenstadien im Substrat",
      "2–3 Behandlungszyklen im 5-Tage-Abstand",
    ],
    toolLinks: [],
    logNote:
      "Thripbefall – silbrige Fraßspuren + Kotpunkte. Raubmilben + Nematoden eingesetzt.",
  },
  "blattlaeuse": {
    id: "blattlaeuse",
    title: "Blattläuse",
    icon: "🐛",
    confidence: "high",
    reasoning:
      "Sichtbare Kolonien an Triebspitzen mit klebriger Honigtau-Ausscheidung sind Blattläuse – kaum Verwechslungsmöglichkeit.",
    cause: "Koloniebildung an N-reichen Triebspitzen, schnelle parthenogenetische Vermehrung.",
    explanation:
      "Grüne oder schwarze Kolonien an Triebspitzen mit klebriger Honigtau-Ausscheidung.",
    steps: [
      "Befallene Triebteile rückschneiden",
      "Kaliseife lokal auf Kolonien",
      "Florfliegenlarven oder Marienkäfer einsetzen",
    ],
    toolLinks: [],
    logNote:
      "Blattlausbefall an Triebspitzen. Kolonien entfernt, Kaliseife aufgetragen, Nützlinge eingesetzt.",
  },
  "botrytis": {
    id: "botrytis",
    title: "Botrytis (Grauschimmel)",
    icon: "🍄",
    confidence: "high",
    reasoning:
      "Grau-staubiger Rasen in Blütenständen ist Botrytis cinerea – das Muster ist unverwechselbar und erfordert sofortiges Handeln.",
    cause: "Hohe Luftfeuchtigkeit + dichte Blütenstände + mangelnde Luftzirkulation.",
    explanation:
      "Grauer, staubiger Schimmelrasen in Blütenständen. Einzelner Bud fault = sofort handeln.",
    steps: [
      "Befallene Stellen sofort mit desinfizierten Werkzeugen großzügig entfernen",
      "RLF unter 50 % in der Blüte halten",
      "Luftzirkulation direkt an den Buds verbessern",
    ],
    toolLinks: [{ slug: "vpd", label: "VPD-Rechner" }],
    logNote:
      "Botrytis-Befall erkannt – Grauschimmel in Blüten. Befall entfernt, Belüftung und RLF korrigiert.",
  },
  "breitmilben": {
    id: "breitmilben",
    title: "Breitmilben",
    icon: "🔬",
    confidence: "medium",
    reasoning:
      "Verkrüppelte Triebspitzen ohne jede Reaktion auf Düngungsanpassung deuten auf Milben hin – Mikroskopkontrolle ist zur Bestätigung nötig.",
    cause: "Winzige Milben (0,2 mm), toxischer Speichel verkrüppelt Triebspitzen.",
    explanation:
      "Glasig-glänzende, verdrehte Triebspitzen die NICHT auf Düngung reagieren. Nur unter 60× Lupe sichtbar.",
    steps: [
      "Mikroskop-Check an Triebspitze (Eier auf Blattunterseite)",
      "Neem-Azadirachtin 3× im 5-Tage-Abstand",
      "Raubmilben Amblyseius andersoni als Dauerbesatz",
    ],
    toolLinks: [],
    logNote:
      "Breitmilben-Verdacht – verkrüppelte Triebspitzen. Mikroskop genutzt, Neem-Behandlung gestartet.",
  },
};

// ── Entscheidungsknoten ─────────────────────────────────────────────────────

export const diagnoseNodes: Record<string, DiagnoseNode> = {
  // ── Kategorie: Blätter ──────────────────────────────────────────────────
  "blaetter-start": {
    id: "blaetter-start",
    question: "Wo zeigen sich die Symptome hauptsächlich?",
    options: [
      { label: "Ältere / untere Blätter", nextNodeId: "blaetter-alt" },
      { label: "Neuer Triebwuchs / Blattspitzen", nextNodeId: "blaetter-neu" },
      { label: "Gesamte Pflanze gleichmäßig", nextNodeId: "blaetter-gesamt" },
    ],
  },
  "blaetter-alt": {
    id: "blaetter-alt",
    question: "Wie sehen die alten Blätter aus?",
    hint: "Mobiler Mangel wandert stets von alt nach neu.",
    options: [
      { label: "Gleichmäßig gelb, abfallend", resultId: "n-mangel" },
      { label: "Blattränder braun + nekrotisch", resultId: "k-mangel" },
      { label: "Chlorose zwischen Blattadern (Adern noch grün)", resultId: "mg-mangel" },
    ],
  },
  "blaetter-neu": {
    id: "blaetter-neu",
    question: "Wie sieht der Neuwuchs aus?",
    hint: "Immobile Nährstoffe zeigen sich immer am neuen Gewebe.",
    options: [
      { label: "Limonengrün / sehr hell, Adern sichtbar grün", resultId: "fe-mangel" },
      { label: "Deformiert, Nekrosen an Blattspitzen", resultId: "ca-mangel" },
      { label: "Verkrüppelt, glasig-glänzend, nicht auf Dünger reaktiv", resultId: "breitmilben" },
    ],
  },
  "blaetter-gesamt": {
    id: "blaetter-gesamt",
    question: "Was beschreibt das Gesamtbild am besten?",
    options: [
      { label: "Braune Blattspitzen (Tipping) bei sonst gesunden Blättern", resultId: "uebersalzung" },
      { label: "Chaotisches Mischbild – gelb, verbrannt, dunkel gleichzeitig", resultId: "lockout" },
      { label: "Violette Töne, langsames Wachstum", nextNodeId: "blaetter-violett" },
      { label: "Dummeldunkle Blätter, keine Verbesserung nach Düngung", resultId: "p-mangel" },
    ],
  },
  "blaetter-violett": {
    id: "blaetter-violett",
    question: "Ist das Substrat gerade kalt oder selten?",
    options: [
      { label: "Substrat ist kalt (< 18 °C) oder Nachtabsenkung extrem", resultId: "kaeltestress" },
      { label: "Temperatur passt – eher P-Blockade möglich", resultId: "p-mangel" },
    ],
  },

  // ── Kategorie: Wachstum / Roots ─────────────────────────────────────────
  "wachstum-start": {
    id: "wachstum-start",
    question: "Was fällt am meisten auf?",
    options: [
      { label: "Pflanze welkt trotz nassem Substrat", nextNodeId: "wachstum-welk" },
      { label: "Wachstum ist stark gebremst ohne Mangelsymptome", nextNodeId: "wachstum-langsam" },
      { label: "Schnell welkend nach Gabe – erholt sich kaum", resultId: "ueberwaesserung" },
    ],
  },
  "wachstum-welk": {
    id: "wachstum-welk",
    question: "Welche weiteren Anzeichen gibt es?",
    options: [
      { label: "Feine Flieger über dem Substrat", resultId: "trauermuecken" },
      { label: "Mangelbild obwohl Nährstoffe korrekt sind", resultId: "wurzellaeuse" },
      { label: "Substrat ist zu nass, kein Austrocknen", resultId: "ueberwaesserung" },
    ],
  },
  "wachstum-langsam": {
    id: "wachstum-langsam",
    question: "Wie ist die Umgebungstemperatur?",
    options: [
      { label: "Zu heiß (> 30 °C)", resultId: "hitzestress" },
      { label: "Zu kalt (< 18 °C am Substrat)", resultId: "kaeltestress" },
      { label: "Temperatur passt – eher Blockade / pH-Problem", resultId: "lockout" },
    ],
  },

  // ── Kategorie: Klima ────────────────────────────────────────────────────
  "klima-start": {
    id: "klima-start",
    question: "Was ist das auffälligste Klimaproblem?",
    options: [
      { label: "Zu heiß – Blätter rollen nach oben (tacoing)", resultId: "hitzestress" },
      { label: "Zu kalt – violette Töne, langsames Wachstum", resultId: "kaeltestress" },
      { label: "Luft zu trocken – Blätter wirken gestresst", nextNodeId: "klima-trocken" },
      { label: "Zu hohe Luftfeuchtigkeit / Schimmelgefahr", nextNodeId: "klima-nass" },
    ],
  },
  "klima-trocken": {
    id: "klima-trocken",
    question: "Welche Symptome zeigt die Pflanze?",
    options: [
      { label: "Blätter rollen leicht, Ca-Mangel-Zeichen", resultId: "vpd-hoch" },
      { label: "Blätter welken am Aprikosenmittag – Stomata-Stress", resultId: "hitzestress" },
    ],
  },
  "klima-nass": {
    id: "klima-nass",
    question: "Gibt es bereits sichtbare Schimmelzeichen?",
    options: [
      { label: "Ja – grauer Staub / Rasen in Blütenständen", resultId: "botrytis" },
      { label: "Noch nicht sichtbar – hohe RLF präventiv senken", resultId: "vpd-hoch" },
    ],
  },

  // ── Kategorie: Schädlinge ───────────────────────────────────────────────
  "schaedlinge-start": {
    id: "schaedlinge-start",
    question: "Was hast du beobachtet?",
    options: [
      { label: "Feine Gespinste und helle Punkte auf Blättern", resultId: "spinnmilben" },
      { label: "Silbrige Schabspuren + schwarze Kotpunkte", resultId: "thripse" },
      { label: "Kolonien an Triebspitzen, klebrige Blätter", resultId: "blattlaeuse" },
      { label: "Kleine schwarze Flieger über dem Substrat", resultId: "trauermuecken" },
      { label: "Grauer oder brauner Schimmelrasen in Buds", resultId: "botrytis" },
      { label: "Verkrüppelte Triebspitzen, nicht auf Dünger reaktiv", nextNodeId: "schaedlinge-mikroskopisch" },
    ],
  },
  "schaedlinge-mikroskopisch": {
    id: "schaedlinge-mikroskopisch",
    question: "Kannst du unter 60× Lupe etwas an den Triebspitzen erkennen?",
    hint: "Breitmilben und Rostmilben sind mit bloßem Auge nicht sichtbar.",
    options: [
      { label: "Kleine bewegliche Punkte + glänzende Eier auf Blattunterseite", resultId: "breitmilben" },
      { label: "Bronzefärbung von unten nach oben, Pflanze wirkt ausgetrocknet", resultId: "rostmilben" },
      { label: "Nichts erkennbar – eher Nährstoffproblem", nextNodeId: "blaetter-neu" },
    ],
  },
};

diagnoseResults["wurzellaeuse"] = {
  id: "wurzellaeuse",
  title: "Wurzelläuse (Cannabis Root Aphid)",
  icon: "🪲",
  confidence: "low",
  reasoning:
    "Mangelbild ohne jede Reaktion auf Nährstoff- oder pH-Anpassung kann viele Ursachen haben – Wurzelläuse sind selten, aber schwer erkennbar.",
  cause: "Versteckter Wurzelbefall, fast unmöglich zu erkennen ohne Topf entfernen.",
  explanation:
    "Klassische Mangelsymptome ohne Reaktion auf Düngung oder pH-Korrektur. Wachsige Kolonien an Feinwurzeln.",
  steps: [
    "Topf nehmen und Wurzeln + Topfwände auf wachsige Punkte prüfen",
    "Substrat wechseln und Topf reinigen",
    "Systemische Maßnahmen + engmaschiges Root-Monitoring",
  ],
  toolLinks: [],
  logNote:
    "Wurzelläuse-Verdacht – Mangelbild ohne Reaktion auf Düngung. Wurzeln kontrolliert, Maßnahmen eingeleitet.",
};

diagnoseResults["rostmilben"] = {
  id: "rostmilben",
  title: "Hanfrostmilbe (Hemp Russet Mite)",
  icon: "🟤",
  confidence: "medium",
  reasoning:
    "Bronzefärbung von unten nach oben kombiniert mit beschädigten Trichomen passt zu Rostmilben – Mikroskop-Check bestätigt.",
  cause: "Cannabis-spezifische Milbe, besiedelt Trichomzonen und destroiert Harzdrüsen.",
  explanation:
    "Bronzefärbung schreitet von unten nach oben fort. Trichome werden zerstört – Harzproduktion fällt aus.",
  steps: [
    "30–60× Mikroskop: Wurmförmige Milben an Blattstielen und Trichombasen",
    "Schwefel-/Neem-Präparat wöchentlich in der Veg-Phase",
    "Raubmilben Amblyseius andersoni als Dauerbesatz",
  ],
  toolLinks: [],
  logNote:
    "Rostmilben-Verdacht – Bronzefärbung, Trichome beschädigt. Mikroskopkontrolle + Behandlung gestartet.",
};

// ── Kategorien ──────────────────────────────────────────────────────────────

export const diagnoseCategories: DiagnoseCategory[] = [
  {
    id: "blaetter",
    label: "Blätter",
    icon: Leaf,
    startNodeId: "blaetter-start",
  },
  {
    id: "wachstum",
    label: "Wachstum & Wurzeln",
    icon: Sprout,
    startNodeId: "wachstum-start",
  },
  {
    id: "klima",
    label: "Klima & Umgebung",
    icon: Thermometer,
    startNodeId: "klima-start",
  },
  {
    id: "schaedlinge",
    label: "Schädlinge",
    icon: Bug,
    startNodeId: "schaedlinge-start",
  },
];
