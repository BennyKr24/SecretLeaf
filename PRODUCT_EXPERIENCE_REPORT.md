# PRODUCT_EXPERIENCE_REPORT.md

**Version:** 1.0  
**Datum:** 1. Juni 2026  
**Autor:** Product + UX Audit (AI-assisted)  
**Status:** Aktiv — Grundlage für Q3/Q4 2026 Roadmap

---

## EXECUTIVE SUMMARY

SecretLeaf hat eine solide technische Basis und eine klare Produktvision.  
Der Grow OS Kern ist funktionsfähig. Das Design-System ist konsistent.  
Die Lücke zwischen Vision und erlebter Nutzererfahrung ist jedoch noch erheblich.

**Das zentrale Problem:** SecretLeaf fühlt sich noch zu oft wie eine Sammlung von Features an — nicht wie ein einheitliches Operating System. Die Übergänge zwischen den Kern-Workflows sind rissig. Retention-Mechanismen sind schwach. Das Upgrade-Angebot ist unklar.

---

## REIFEGRAD-ÜBERSICHT

| Dimension | Score | Trend |
|---|---|---|
| **Produktreifegrad** | 62 / 100 | ↗ |
| **Designreifegrad** | 71 / 100 | ↗ |
| **UX-Reifegrad** | 54 / 100 | → |
| **Retention-Reifegrad** | 38 / 100 | → |
| **Monetization-Reifegrad** | 29 / 100 | ↘ |
| **Wettbewerbsreifegrad** | 47 / 100 | → |

**Gesamtreifegrad: 50 / 100**

---

## PHASE 1 — PRODUCT EXPERIENCE AUDIT

### Auditierte Routen

| Route | Klarheit | Primäre Aktion klar? | Unnötige Komplexität | Nächster Schritt klar? | Score |
|---|---|---|---|---|---|
| `/` (Homepage) | ✅ Hoch | ✅ „Start Grow" | ⚠️ Trust-Section überfrachtet | ⚠️ Unklar nach Scroll | 72 |
| `/start` (Setup Wizard) | ✅ Hoch | ✅ Step-by-Step | ✅ Minimal | ✅ Klar | 84 |
| `/dashboard/user` | ⚠️ Mittel | ❌ Drei konkurrierende Sektionen | ❌ Wiki, Grow, Interests gemischt | ⚠️ Unklar | 46 |
| `/grow/[id]` | ✅ Hoch | ✅ „+ Log" + Tasks | ⚠️ Performance Panel Datendichte | ✅ Klar | 73 |
| `/grow/[id]/log` | ✅ Hoch | ✅ Quick-Add Bar dominant | ✅ Minimal | ✅ Klar | 81 |
| `/diagnose` | ✅ Mittel | ✅ Kategorie wählen | ✅ Schlank | ⚠️ Nach Diagnose unklar | 65 |
| `/tools` | ⚠️ Mittel | ⚠️ Mehrere CTAs | ⚠️ Tool-Liste zu lang | ⚠️ Schwach verknüpft mit Grow | 55 |
| `/studies` | ⚠️ Mittel | ❌ Kein klarer Einstieg | ❌ Zu viele Optionen | ❌ Kein nächster Schritt | 42 |
| `/profile` | ✅ Hoch | ✅ Name speichern | ✅ Minimal | ❌ Kein Upgrade-CTA | 58 |
| `/grow/history` | ✅ Mittel | ⚠️ Nur Ansicht, kein CTA | ✅ Minimal | ❌ Kein „Neuer Grow" Hinweis | 54 |

### Kritische Findings

**F1 — Dashboard ist kein Product-Dashboard, sondern ein Wiki-Dashboard**  
Der wichtigste Screen für eingeloggte Nutzer zeigt als erstes Reading Streaks, Bookmarks und Artikel-Empfehlungen. Der aktive Grow ist vergraben unter einer Hero-Section. Das widerspricht PRODUCT.md Tier 1 (Grow OS) direkt. Ein Nutzer ohne aktiven Grow sieht kein prominentes „Grow starten"-CTA — nur Wiki-Content.

**F2 — `/studies` hat kein Job-to-be-done**  
Der Nutzer landet auf einer Seite mit Hub, Kategorien, Pest-DB, Deficiency-DB, Sources. Es fehlt ein klarer Einstiegspunkt: „Was willst du erreichen?" Die Seite fühlt sich wie ein Archiv an.

**F3 — Nach Diagnose gibt es keine klare Weiterleitung**  
`DiagnoseResult` zeigt das Ergebnis korrekt. Aber: Was tut der Nutzer danach? Der „Im Grow-Log speichern" Button ist gut — aber es fehlt der nächste Schritt: „Jetzt behandeln → Empfehlung ansehen → Tool öffnen → Log-Eintrag erstellen". Die Handlungskette bricht ab.

**F4 — Navigation fehlt auf Mobile**  
Die primäre Navigation ist `hidden md:flex`. Auf Mobile gibt es nur Logo + Search + UserMenu. Weder „Start Grow" noch „Dashboard" noch „Diagnose" sind mobil direkt erreichbar. Die primäre Zielgruppe (Home Grower mit Smartphone) hat keine Navigation.

**F5 — `/profile` ist ein Admin-Formular, keine Produkt-Seite**  
Das Profil zeigt: Avatar (deaktiviert), Name, E-Mail (read-only), Plan (Text). Es fehlt: Upgrade-Flow, Grow-Übersicht, Account-Value-Proposition. Ein FREE-Nutzer sieht seinen Plan als grauen Text ohne Handlungsimpuls.

---

## PHASE 2 — GROW OS WORKFLOW AUDIT

### Vollständige Journey

```
Einstieg
  └─ Homepage: /  → CTA „Start Grow" → /start
  
Grow erstellen
  └─ /start: GrowSetupWizard (4 Schritte)
     ✅ Name + Umgebung
     ✅ Medium + Licht
     ✅ Erfahrung + Pflanzen
     ✅ Summary + Erstellen
     → Redirect nach /grow/[id]

Aktiver Grow
  └─ /grow/[id]: Übersicht
     ✅ GrowStatusHeader mit Score
     ✅ PhaseTimeline
     ✅ TaskItem (Overdue + Upcoming)
     ✅ PlantCard mit Schnellzugriff
     ✅ GrowPerformancePanel (PRO)
     ✅ Schnellzugriff (Log / Tools / Diagnose)

Loggen
  └─ /grow/[id]/log: Log-Seite
     ✅ QuickAddBar (Wasser/Dünger/Training/Notiz)
     ✅ Timeline (nach Tag gruppiert)
     ✅ StreakBadge
     ✅ SavedBanner + DailyCompletionBanner

Diagnose
  └─ /diagnose?growId=X&plantId=Y
     ✅ growId/plantId werden übergeben
     ✅ DiagnoseFlow (Kategorien → Symptome → Ergebnis)
     ✅ DiagnoseResult mit „Im Grow-Log speichern"
     ❌ Kein Schritt zurück zum Grow nach Speichern

Empfehlung
  └─ DiagnoseResult zeigt:
     ✅ Confidence-Badge
     ✅ Behandlungsschritte
     ✅ Wiki-Artikel-Verknüpfung
     ❌ Keine direkte Link-Kette: Ergebnis → Tool → Log

Verbesserung
  └─ GrowPerformancePanel (PRO):
     ✅ trendColor / optScore / weeklyLossRate
     ❌ Kein Vergleich zu vorigen Grows
     ❌ Kein konkreter nächster Schritt aus dem Panel heraus
```

### Medienbrüche und Reibungspunkte

| Bruchstelle | Severity | Beschreibung |
|---|---|---|
| **Diagnose → Grow zurück** | Hoch | Nach „Im Grow-Log speichern" kein automatischer Redirect. Nutzer ist lost. |
| **Dashboard → aktiver Grow** | Hoch | Grow ist tief in der Dashboard-Seite. Beim ersten Einloggen findet ein neuer Nutzer seinen Grow kaum. |
| **Log → Plant-spezifischer Log** | Mittel | Beim Klick auf „+ Log" in PlantCard wird die Log-Seite mit `?plant=X` geöffnet. Aber die QuickAdd-Bar zeigt noch „Gesamter Grow" — der Plant-Filter muss manuell gesetzt werden. Er müsste vorselektiert sein. |
| **Tool-Ergebnis → Grow** | Mittel | Tools (VPD, EC, etc.) haben `SaveToGrowButton` — aber es ist unklar wie der Nutzer dorthin kommt. Kein „Jetzt in Grow verwenden"-Link auf der Grow-Seite. |
| **Start → Onboarding** | Niedrig | Nach Grow-Erstellung kein Onboarding-Hinweis (erster Log, erste Pflanze benennen). |
| **Geschichte → Neuer Grow** | Niedrig | `/grow/history` zeigt abgeschlossene Grows, aber kein „Neuen Grow starten"-CTA. |

### Unnötige Klicks

- 3 Klicks um einen Wasser-Log für eine spezifische Pflanze zu erstellen: Grow-Seite → Log → Plant-Filter setzen → Wasser → Speichern (= 5 Schritte statt 3)
- 4 Klicks um Diagnose direkt aus dem Dashboard zu starten (kein CTA sichtbar)

---

## PHASE 3 — RETENTION AUDIT

### Frage 1: Warum morgen zurückkommen?

**Vorhandene Mechanismen:**
- ✅ StreakBadge (Grow-Log-Streak)
- ✅ DailyCompletionBanner
- ✅ SavedBanner mit Reward-Message
- ✅ hasTodayEntry Status im Dashboard
- ✅ Overdue Task Warnung (Dashboard + Grow-Seite)
- ✅ Overdue-Banner im Dashboard

**Fehlende Mechanismen:**
- ❌ Keine Push- oder E-Mail-Benachrichtigungen (kein Reminder-System)
- ❌ Kein „Streak brechen" Warning beim App-Verlassen
- ❌ Kein tägliches Highlight: „Heute ist Tag X deiner Blüte — kritischer Moment"
- ❌ Keine kontextuelle Erinnerung basierend auf Grow-Phase

**Bewertung:** Der Nutzer hat visuelles Feedback nach dem Logging. Aber ohne aktive Benachrichtigungen hat das Produkt keinen Pull-Mechanismus. Retention basiert ausschließlich auf intrinsischer Motivation.

### Frage 2: Warum in einer Woche zurückkommen?

**Vorhandene Mechanismen:**
- ✅ WeeklyValueBlocks (Komponente existiert)
- ✅ Reading-Streak im Dashboard
- ⚠️ GrowPerformancePanel zeigt Trend (aber nur PRO)

**Fehlende Mechanismen:**
- ❌ Kein wöchentlicher Grow-Report (E-Mail oder in-App)
- ❌ Kein „Diese Woche war besser/schlechter als letzte Woche"
- ❌ Kein Milestone-System (Tag 21, Blüte gestartet, etc.)
- ❌ Keine Wachstums-Fotodokumentation (visueller Progress fehlt)

**Bewertung:** Nach einer Woche Nicht-Nutzung gibt es keinen aktiven Anlass zurückzukehren. Das Produkt wartet, statt zu holen.

### Frage 3: Warum dauerhaft dokumentieren?

**Vorhandene Mechanismen:**
- ✅ GrowPerformancePanel: Ertragsverlust-Berechnung (PRO)
- ✅ Streak-Badge: Motivation durch Streak-Aufbau
- ✅ HarvestSection: Ernte-Rating und Notizen
- ✅ Grow-History: Vergleich vergangener Grows

**Fehlende Mechanismen:**
- ❌ Kein Vergleich zwischen Grows: „Dein letzter Grow: 45g, dieser Grow: aktuell auf Kurs für 60g"
- ❌ Kein akkumulierter Wert: „Du hast 147 Tage Grow-Daten gesammelt"
- ❌ Kein Insight aus historischen Daten: „Deine Indoor-Grows laufen 20% besser als Outdoor"
- ❌ Keine Exportfunktion für Grow-Daten
- ❌ Kein Datenwert für den Nutzer sichtbar gemacht

**Bewertung:** Der Nutzer spürt keinen akkumulierten Wert durch dauerhaftes Dokumentieren. Das „Warum soll ich das machen?" fehlt nach Woche 1.

### Retention Score-Karte

| Zeitraum | Mechanismus vorhanden? | Pull-Stärke | Score |
|---|---|---|---|
| Tag 1 | Streak + Reward | Mittel | 55 |
| Tag 7 | Nur Streak | Schwach | 35 |
| Monat 1 | Harvest-Dokumentation | Schwach | 30 |
| Dauerhaft | History-Vergleich (rudimentär) | Sehr schwach | 22 |

---

## PHASE 4 — MONETIZATION AUDIT

### Vergleich mit PRODUCT.md

PRODUCT.md nennt: Conversion, MRR, ARPU, Churn als Business Metrics.  
Das Produkt enthält: FREE / PRO / TEAM Plan-Struktur (in Supabase-Rollen definiert).

### Aktueller Monetization-Status

| Bereich | Status | Monetization-Potenzial |
|---|---|---|
| GrowPerformancePanel (PRO) | ✅ Gate aktiv | Hoch — direkter ROI-Beweis |
| ProInsightGate | ✅ Gate aktiv | Hoch — Teaser-UX vorhanden |
| Diagnose | ❌ Komplett frei | Mittel — könnte History/Tiefe PRO sein |
| Tools | ❌ Komplett frei | Mittel — erweiterte Tool-Features denkbar |
| Studien/Wiki | ❌ Komplett frei | Niedrig — informationeller Wert |
| Warnungen/Reminders | ❌ Nicht vorhanden | Sehr hoch — Kern-PRO-Feature |
| Grow-Analyse (Cross-Grow) | ❌ Nicht vorhanden | Sehr hoch |
| Export | ❌ Nicht vorhanden | Mittel |

### Was FREE-Nutzern gehören sollte (strategisch)

- ✅ 1 aktiver Grow (Kernwert)
- ✅ Basis-Logging (Wasser, Dünger, Training, Notiz)
- ✅ Diagnose (Basis: 3 Kategorien frei)
- ✅ Tools (alle Basis-Tools frei)
- ✅ Studien/Wiki (immer frei — Vertrauen)

### Was PRO-Nutzern gehören sollte (strategisch)

- ✅ GrowPerformancePanel (bereits PRO)
- ❌ Unbegrenzte Grows (aktuell: keine Beschränkung für FREE)
- ❌ Diagnose-History (Verlauf vergangener Diagnosen)
- ❌ Wöchentlicher Grow-Report (E-Mail/in-App)
- ❌ Cross-Grow-Analyse (Vergleich historischer Daten)
- ❌ Export (CSV, PDF)
- ❌ Erweiterte Pflanzen-Tracking-Features
- ❌ Push-Benachrichtigungen / Erinnerungen
- ❌ Unbegrenzte Pflanzen pro Grow

### Kritisches Gap

**Es gibt keinen Upgrade-CTA.** Nirgends im Produkt wird einem FREE-Nutzer aktiv erklärt, was PRO kostet, was PRO kann und wie er upgradet. Das Profil zeigt nur „Free" als grauen Text. Es gibt keinen Pricing-Screen, keinen Upgrade-Button, keinen Conversion-Funnel.

Das Produkt hat eine Monetization-Struktur (Rollen) aber keine Monetization-UX.

### Monetization-Potenzial-Karte

| Feature | Potenzial | Aufwand | Priorität |
|---|---|---|---|
| Upgrade-Seite + CTA | Sehr hoch | Niedrig | P0 |
| Erinnerungen/Reminders (PRO) | Sehr hoch | Mittel | P1 |
| Cross-Grow-Analyse (PRO) | Hoch | Mittel | P1 |
| Diagnose-History (PRO) | Mittel | Niedrig | P2 |
| Export (PRO) | Mittel | Mittel | P2 |
| Unlimited Grows Gate (FREE: 3) | Hoch | Niedrig | P1 |

---

## PHASE 5 — DESIGN REVIEW

### Bewertungskriterien (je 0–100)

| Route | Premium-Wirkung | Klarheit | Fokus | Konsistenz | Gesamt |
|---|---|---|---|---|---|
| **Homepage** `/` | 82 | 74 | 68 | 76 | **75** |
| **Setup** `/start` | 78 | 92 | 95 | 80 | **86** |
| **Dashboard** `/dashboard/user` | 52 | 44 | 35 | 55 | **47** |
| **Grow** `/grow/[id]` | 79 | 82 | 76 | 85 | **81** |
| **Grow Log** `/grow/[id]/log` | 77 | 88 | 84 | 86 | **84** |
| **Diagnose** `/diagnose` | 70 | 78 | 80 | 72 | **75** |
| **Tools Hub** `/tools` | 65 | 62 | 58 | 70 | **64** |
| **Studies Hub** `/studies` | 58 | 45 | 40 | 65 | **52** |
| **Profil** `/profile` | 60 | 72 | 70 | 60 | **66** |
| **Grow History** `/grow/history` | 62 | 70 | 68 | 72 | **68** |

**Durchschnitt: 70 / 100**

### Stärken

- `grow/[id]` und `grow/[id]/log` sind die stärksten Screens: klare Hierarchie, semantische Token-Nutzung, gute Informationsdichte
- Setup-Wizard ist exzellent: Schritt-für-Schritt, klar, fast keine Ablenkung
- GrowPerformancePanel hat echte Premium-Wirkung durch den Blur-Teaser-Effekt
- StreakBadge und DailyCompletionBanner sind emotionale Touchpoints, die sich richtig anfühlen

### Schwächen

**Dashboard ist der schwächste Screen:**
- Mischt drei verschiedene Produkt-Kontexte: Grow OS + Wiki + Lernplattform
- Hell/dunkel-Modus-Inkonsistenz: Dashboard-Header nutzt Light-Mode-Klassen (`bg-white`, `text-slate-900`, `border-emerald-100`) während Grow-Seiten vollständig auf semantische Tokens migriert sind
- MetricCard zeigt Reading-Streak und Activity Score — nicht Grow-relevante Metriken
- Der wichtigste CTA (Grow öffnen) ist nicht der erste sichtbare CTA

**Studies Hub:**
- Keine differenzierte Informationshierarchie
- Keine personalisierten Einstiegspunkte für aktiven Grow-Kontext
- Fühlt sich wie eine Bibliothek an, nicht wie ein integrierter Produkt-Bestandteil

**Navigation:**
- Mobile Navigation fehlt komplett (kein Bottom-Nav, kein Hamburger-Menü)
- NavigationBar nutzt noch `text-emerald-700`, `bg-white`, `border-slate-100` — nicht migriert auf semantische Tokens

---

## PHASE 6 — COMPETITIVE REVIEW

### Vergleichsmatrix

| Dimension | SecretLeaf | Grow with Jane | Grow Diaries | Notion | Linear |
|---|---|---|---|---|---|
| **Grow-Tracking** | ✅ Strukturiert | ✅ Stark | ✅ Community-fokussiert | ⚠️ Generisch | ❌ |
| **Diagnose** | ✅ Einzigartig | ❌ | ❌ | ❌ | ❌ |
| **Wissen/Studien** | ✅ Kuratiert | ❌ | ⚠️ Community-Posts | ❌ | ❌ |
| **Design-Qualität** | ✅ Premium | ⚠️ Okay | ⚠️ Veraltet | ✅ Exzellent | ✅ Exzellent |
| **Mobile UX** | ❌ Schwach | ✅ Native App | ⚠️ Okay | ✅ Stark | ✅ Stark |
| **Retention** | ⚠️ Rudimentär | ✅ Reminders | ✅ Community | ✅ Compound Value | ✅ Workflow-Lock-in |
| **Monetization** | ❌ Unklar | ✅ €4.99/Monat | ✅ Freemium | ✅ $10/Monat | ✅ $8/Monat |
| **Onboarding** | ✅ Wizard | ✅ App-Guided | ⚠️ Einfach | ⚠️ Leer | ✅ Project-First |
| **KI/Automatisierung** | ✅ Diagnose | ❌ | ❌ | ✅ AI-Features | ✅ AI-Features |
| **Offline-Nutzung** | ❌ | ✅ | ⚠️ | ✅ | ✅ |

### Wettbewerbsvorteile (einzigartig)

1. **Diagnose-System mit Wissensbasis-Verknüpfung** — kein direkter Wettbewerber kombiniert interaktive Diagnose + kuratierte Studien + Grow-Log-Integration
2. **Yield-Impact-Kalkulation (PRO)** — der quantitative Ertragsverlust-Nachweis ist im Markt einzigartig
3. **Evidence-basiertes Wissenssystem** — Quellen-Registry, Confidence-Scores, fingerprinting der Studien — weit über Community-Posts der Konkurrenz
4. **Grow-Phase-intelligentes Task-System** — automatische Aufgaben basierend auf Wachstumsphase

### Wettbewerbsnachteile (kritisch)

1. **Keine native Mobile App** — Grow with Jane hat eine App; SecretLeaf ist PWA ohne Bottom-Navigation
2. **Kein Community-Layer** — Grow Diaries lebt von User-generated Content und Social Features
3. **Kein klarer Preis / kein sichtbarer Upgrade-Pfad** — Monetization-UX fehlt komplett
4. **Keine Erinnerungen** — Grow with Jane schickt Erinnerungen; SecretLeaf hat keinen Push/E-Mail-Kanal
5. **Zu breite Navigation** — Grow with Jane und Linear sind focused; SecretLeaf bietet Tools, Wiki, Diagnose, Grow gleichzeitig ohne klare Hierarchie im UI

### Warum sollte ein Nutzer SecretLeaf wählen?

**Heute (gültige Antwort):**  
Wenn du strukturierter Grower bist, der Diagnosen stellen, Ertrag optimieren und auf evidenzbasiertes Wissen zugreifen möchte — und kein Community-Produkt suchst.

**Fehlender Vorteil:**  
SecretLeaf hat noch keinen Network-Effect, keinen Community-Pull, keinen Lock-in durch akkumulierte Daten (sichtbar für den Nutzer). Das Produkt schafft Wert, aber macht diesen Wert nicht sichtbar genug.

---

## TOP-20 PRIORITÄTEN — Q3/Q4 2026

Priorisierung nach: Nutzerwert × Umsatzpotenzial × Aufwand

### P0 — Sofortmaßnahmen (max. 2 Wochen)

**#1 — Mobile Navigation hinzufügen**  
Problem: NavigationBar zeigt auf Mobile nichts außer Logo + Search.  
Lösung: Bottom Navigation Bar mit 4 Items: Dashboard / Grow / Diagnose / Profil.  
Impact: Primäre Nutzerzielgruppe (Mobile Grower) verliert keine Orientierung mehr.

**#2 — Upgrade-Seite erstellen**  
Problem: Es gibt keinen Weg für einen FREE-Nutzer, PRO zu kaufen.  
Lösung: `/upgrade` oder `/pricing` Seite + CTA im Profil + CTA im ProInsightGate.  
Impact: Monetization-Funnel existiert erstmals.

**#3 — Dashboard-Hierarchie korrigieren**  
Problem: Dashboard zeigt Wiki-Content priorisiert über Grow-OS-Kern.  
Lösung: Grow-Sektion ist erster sichtbarer Block. Wiki-Empfehlungen werden sekundär.  
Impact: Der wichtigste Screen spiegelt PRODUCT.md Tier 1 wider.

**#4 — Post-Diagnose Handlungskette**  
Problem: Nach Diagnose kein nächster Schritt.  
Lösung: DiagnoseResult erhält einen „Zurück zum Grow" Button + „Log-Eintrag ansehen" Link nach dem Speichern.  
Impact: Workflow-Kontinuität wiederhergestellt.

### P1 — Mittelfristig (1–2 Monate)

**#5 — Plant-Filter Vorauswahl im Log**  
Problem: `?plant=X` öffnet Log, aber Plant-Filter ist nicht vorselektiert.  
Lösung: `initPlant` als Default für `selectedPlantId` in QuickAddBar bereits gesetzt (aktuell nur initialisiert, aber nicht an QuickAddBar übergeben).  
Impact: 2 Klicks weniger im häufigsten Workflow.

**#6 — Grow-Erinnerungen (E-Mail/Browser)**  
Problem: Keine Pull-Mechanismen für tägliche Nutzung.  
Lösung: Opt-in E-Mail-Reminder: „Du hast heute noch nicht geloggt" + Phase-Milestone-Notifications.  
Impact: Höchste Retention-Hebelwirkung.

**#7 — Tägliche Phase-Awareness im Grow**  
Problem: Nutzer weiß nicht, warum heute wichtig ist.  
Lösung: Auf `/grow/[id]` kontextuellen Tageshinweis: „Tag 21 — Blüte beginnt. Wichtigste Maßnahmen heute: [...]"  
Impact: Tägliche Relevanz des Grows erhöht.

**#8 — FREE-Nutzer Grow-Limit einführen**  
Problem: Kein Anreiz für Upgrade.  
Lösung: FREE: 3 aktive Grows. PRO: Unbegrenzt. Mit klarem UI-Gate.  
Impact: Natürlicher Upgrade-Trigger für aktive Nutzer.

**#9 — Grow-History Cross-Analyse (rudimentär)**  
Problem: Nutzer sieht keinen akkumulierten Wert seiner Daten.  
Lösung: In Grow-History: Durchschnittsertrag, beste Phase, beste Sorte — als simple Statistik-Karte.  
Impact: Sichtbarer Daten-Compound-Effekt.

**#10 — NavigationBar auf semantische Tokens migrieren**  
Problem: Letzte verbleibende Kernkomponente mit `bg-white`, `border-slate-100`.  
Lösung: Gleiche Token-Migration wie grow/[id] und grow/[id]/log.  
Impact: Vollständige Design-Konsistenz.

### P2 — Strukturverbesserungen (2–3 Monate)

**#11 — Studies Hub redesignen: Job-to-be-done First**  
Problem: `/studies` ist ein Archiv ohne Einstieg.  
Lösung: Drei klare Einstiege: „Problem lösen" / „Tiefer verstehen" / „Aktuelles lesen".  
Impact: Informationsarchitektur wird nutzbar.

**#12 — Dashboard-Metriken auf Grow fokussieren**  
Problem: MetricCards zeigen Reading-Streak, kein Grow-relevant.  
Lösung: Aktive Grow-Tage, Streak, letzte Aktivität, Warnungen.  
Impact: Dashboard spiegelt North Star Metric wider.

**#13 — Profil-Seite: Upgrade-Flow integrieren**  
Problem: Profil ist ein leeres Admin-Formular.  
Lösung: Plan-Section mit Feature-Vergleich, Upgrade-Button, aktuellem Nutzen.  
Impact: Conversion-Touchpoint am höchsten Intent-Punkt.

**#14 — Tool-Ergebnis → Grow verknüpfen**  
Problem: Tools existieren isoliert vom Grow-Kontext.  
Lösung: Tool-Seite: „In aktiven Grow speichern" Button als primäre CTA (nicht nur `SaveToGrowButton` auf dem Result-Screen).  
Impact: Tier 3 (Tools) stärkt Tier 1 (Grow OS) direkt.

**#15 — Diagnose-History (PRO)**  
Problem: Diagnose-Ergebnisse verschwinden nach dem Log.  
Lösung: In Grow-Log: Diagnose-Einträge speziell hervorgehoben mit Icons.  
Impact: Sichtbarer Wert der Diagnose-Nutzung im Zeitverlauf.

### P3 — Langfristig (3–6 Monate)

**#16 — Bottom Navigation Mobile (PWA-Optimierung)**  
Dedizierter Mobile-Bottom-Nav + PWA-Manifest + Add-to-Homescreen Prompt.

**#17 — Grow-Fotodokumentation**  
Nutzer kann Fotos pro Plant und Tag hochladen. Einfachste Form von visueller Dokumentation. Extrem hoher Retention-Wert.

**#18 — Wöchentlicher Grow-Report (in-App)**  
Jeden Montag: „Dein Grow-Bericht: Was war gut, was braucht Aufmerksamkeit?"

**#19 — Export (PRO)**  
CSV-Export aller Log-Einträge. PDF-Grow-Bericht. Nutzerdaten gehören dem Nutzer — Trust-Mechanismus.

**#20 — Erstnutzer-Onboarding-Sequenz**  
Nach erstem Grow erstellen: Geführtes Onboarding: Erste Pflanze benennen → erster Log → Diagnose entdecken. 3-Schritte-Checklist die nach Abschluss verschwindet.

---

## WETTBEWERBSVORTEILE — ZUSAMMENFASSUNG

| Vorteil | Stärke heute | Potenzial |
|---|---|---|
| Evidenzbasierte Diagnose | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Yield-Impact-Kalkulation | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Kuratiertes Wissenssystem | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Phase-intelligente Tasks | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Design-Qualität | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Mobile UX | ⭐⭐ | ⭐⭐⭐⭐ |
| Retention-Mechanismen | ⭐⭐ | ⭐⭐⭐⭐ |
| Monetization-Klarheit | ⭐ | ⭐⭐⭐⭐⭐ |

---

## FINALE BEWERTUNG

### Was SecretLeaf gut macht

- Grow OS Kern ist funktionsfähig und differenziert
- Diagnose + Wissensbasis-Verknüpfung ist markteinzigartig
- Design-Qualität der Kern-Screens (grow/[id], log) ist Premium-Level
- Setup-Wizard ist klarer Onboarding-Gewinner
- Yield-Impact-Berechnung schafft echten, messbaren Nutzerwert

### Was SecretLeaf jetzt braucht

1. **Monetization-UX** — ohne Conversion-Funnel ist alles andere nachrangig
2. **Mobile Navigation** — der primäre Use Case (Grower im Zelt) ist mobil
3. **Dashboard-Fokus** — der wichtigste Screen muss Grow-First sein
4. **Retention-Mechanismen** — Erinnerungen und akkumulierter Datenwert
5. **Post-Diagnose Workflow** — die Handlungskette darf nicht abreißen

### Nächste 3 Monate in einem Satz

> Baue den Monetization-Funnel, fixe die Mobile-Navigation, bring das Dashboard auf Grow-First, und füge genau einen Pull-Mechanismus für tägliches Logging hinzu.

---

*Erstellt: 1. Juni 2026 | Nächste Review: 1. September 2026*
