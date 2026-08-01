# SEO Keyword Strategie

---

tags: #wachstum #seo #content #traffic
status: Entwurf
priorität: Tier A
verknüpft: [[02_SEO_Strategie]] [[03_Programmatic_SEO]] [[00_Knowledge_Graph]] [[05_Go_To_Market]] [[01_Cannabis_Wissenssystem]]

---

## Zweck

Dieses Dokument konkretisiert die SEO-Strategie mit spezifischen Keyword-Clustern,
Prioritäten und Content-Anforderungen.

---

## SEO-Strategie in einem Satz

Wir ranken für Fragen, die aktive Grower stellen, und konvertieren sie zu aktiven Nutzern.

---

## Keyword-Cluster (Priorität 1: Diagnose-Intent)

Diese Nutzer haben ein aktives Problem. Höchste Konversionsrate.

| Keyword | Monatliches Volumen (DE) | Schwierigkeit | Konvertiert zu |
|---|---|---|---|
| cannabis gelbe blätter | ~3.000 | Mittel | Diagnose-Feature |
| cannabis blätter braune flecken | ~2.000 | Mittel | Diagnose-Feature |
| cannabis blätter einrollen | ~1.500 | Niedrig | Diagnose-Feature |
| cannabis calciummangel | ~2.500 | Niedrig | Diagnose-Feature |
| cannabis stickstoffmangel | ~2.000 | Niedrig | Diagnose-Feature |
| cannabis magnesium mangel | ~1.800 | Niedrig | Diagnose-Feature |
| cannabis überwässerung symptome | ~1.200 | Niedrig | Diagnose-Feature |
| cannabis wurzelfäule erkennen | ~800 | Niedrig | Diagnose-Feature |
| cannabis schädlinge erkennen | ~2.200 | Mittel | Diagnose-Feature |
| cannabis spinnmilben | ~3.500 | Mittel | Diagnose-Feature |

**Priorität:** Diese Cluster zuerst abdecken. Hohes Volumen, klarer Intent, direkte Konversion.

---

## Keyword-Cluster (Priorität 2: Growing-Wissen)

Nutzer die lernen wollen. Mittlere Konversionsrate, hohes Volumen.

| Cluster | Beispiel-Keywords | Volumen |
|---|---|---|
| Grow-Techniken | "cannabis topping anleitung", "cannabis lst tutorial" | ~5.000 |
| Phasen | "cannabis vegetation dauer", "cannabis blüte einleiten" | ~4.000 |
| Medium | "cannabis in coco anbauen", "cannabis hydroponik anfänger" | ~3.500 |
| Klima | "vpd cannabis", "luftfeuchtigkeit cannabis" | ~2.800 |
| Düngung | "cannabis dünger anfänger", "cannabis ec wert" | ~3.200 |

---

## Keyword-Cluster (Priorität 3: Sorten-Intent)

Enormes Volumen, mittlere Konversionsrate. Basis für Programmatic SEO.

| Typ | Beispiele | Gesamt-Volumen (geschätzt) |
|---|---|---|
| Sorte + anbauen | "gelato anbauen", "white widow anbauen" | ~20.000+ |
| Sorte + info | "amnesia haze blütezeit", "og kush ertrag" | ~30.000+ |
| Sorte + bewertung | "gorilla glue bewertung", "bruce banner erfahrung" | ~10.000+ |

**Programmatic SEO Potenzial:** 500+ Sorten → 500+ automatisch generierte Seiten.
Jede Seite targetiert: "[Sortenname] anbauen", "[Sortenname] Erfahrungen", "[Sortenname] Ertrag"

---

## Keyword-Cluster (Priorität 4: Extrakte)

Langfristig, Post-MVP. Erweitert die Plattform über Growing hinaus.

- "rosin pressen anleitung"
- "bubble hash herstellen"
- "bho extraktion"
- "live resin was ist das"

---

## Content-Prioritäten für MVP-Phase

### Sofort erstellen (vor Launch):

1. **"Cannabis Krankheiten erkennen" – Hub-Seite**
   - Übersicht aller Krankheiten
   - Verlinkung auf Einzelseiten
   - CTA: "Jetzt dein Bild analysieren"

2. **Top 10 Nährstoffmangel-Artikel:**
   - Calciummangel, Stickstoff, Phosphor, Kalium, Magnesium...
   - Jeweils: Symptome, Ursachen, Lösung, Prävention
   - Am Ende: "KI-Diagnose starten" CTA

3. **"Cannabis anbauen Anfänger" – Komplettguide**
   - Von Keimung bis Ernte
   - Ziel: 3.000+ Wörter, Top 3 in DE
   - CTA: "Erstelle jetzt dein Grow-Tagebuch"

---

## SEO-Architektur

```
secretleaf.de/
├── /wissen/                    # Wissenssystem Hub
│   ├── /growing/               # Growing Kategorie
│   │   ├── /cannabis-anbauen-anfaenger/
│   │   ├── /cannabis-topping/
│   │   └── /cannabis-lst/
│   ├── /krankheiten/           # Krankheiten-Hub
│   │   ├── /calciummangel/
│   │   ├── /stickstoffmangel/
│   │   └── /spinnmilben/
│   ├── /naehrstoffe/
│   └── /sorten/                # Programmatic SEO
│       ├── /gelato/
│       ├── /white-widow/
│       └── /[sorte]/
├── /diagnose/                  # Tool Landing Page
└── /grow-tagebuch/             # Feature Landing Page
```

---

## On-Page SEO Standards

Jeder Artikel muss haben:
- [ ] Ziel-Keyword im H1
- [ ] Ziel-Keyword in den ersten 100 Wörtern
- [ ] Meta Title (50–60 Zeichen)
- [ ] Meta Description (150–160 Zeichen)
- [ ] Mindestens 1 interne Verlinkung auf Diagnose-Feature
- [ ] Schema Markup (Article oder FAQ)
- [ ] Bilder mit Alt-Tags
- [ ] Lesezeit < 7 Minuten für Informationsartikel

---

## Tracking und Erfolg

| KPI | Ziel (3 Monate nach Launch) |
|---|---|
| Organische Klicks/Monat | >5.000 |
| Rankt für Diagnose-Keywords Top 10 | >5 Keywords |
| Konversionsrate SEO → Registrierung | >3% |
| MAG aus organischem Traffic | >50 |

---

## Tools

- **Keyword-Recherche:** Ahrefs / Semrush / Ubersuggest
- **Ranking-Tracking:** Google Search Console (kostenlos)
- **On-Page:** Surfer SEO / Frase (für Content-Optimierung)
- **Analytics:** Posthog (Konversionen) + GSC (Rankings)

---

## Offene Fragen

- Sollen Artikel auf Deutsch oder Englisch priorisiert werden?
- Gibt es österreichische/schweizer SEO-Besonderheiten?
- Wann beginnt Programmatic SEO für Sorten? (Datenbankaufbau nötig)

## Verknüpfte Dokumente

[[02_SEO_Strategie]]
[[03_Programmatic_SEO]]
[[00_Knowledge_Graph]]
[[01_Cannabis_Wissenssystem]]
[[05_Go_To_Market]]
[[07_Sorten_Datenbank_Spec]]

## Änderungsverlauf

### V1
Erstversion – Keyword-Cluster und Content-Prioritäten
