# Go-to-Market & Beta Strategie

---

tags: #wachstum #gtm #beta #launch
status: Aktiv
priorität: Tier A
verknüpft: [[01_Growth_Engine]] [[08_Growth_Strategie]] [[05_Aktivierungssystem]] [[01_MVP]] [[01_Wettbewerbsanalyse]]

---

## Zweck

Dieses Dokument definiert, wie SecretLeaf seine ersten 100 aktiven Grower gewinnt.
Es beschreibt den Launch-Prozess, die Beta-Strategie und die ersten Wachstumsschritte.

---

## Grundprinzip

Die erste Version von SecretLeaf wird nicht vermarktet.
Sie wird getestet.

Ziel Phase 0: 50–100 Beta-Nutzer, die echte Daten liefern und Feedback geben.
Ziel Phase 1: 500 MAG in den ersten 6 Monaten.

---

## Phase 0 – Closed Beta (vor Launch)

### Ziel
- Produkt testen
- Erste echte Daten sammeln
- Bugs finden
- Aktivierungsfunnel messen

### Zielgruppe Beta
Deutschsprachige Home-Grower die:
- Aktiv anbauen (nicht nur Informationen suchen)
- Bereit sind, Feedback zu geben
- Technik-affin genug für ein Web-Tool

### Beta-Kanäle

**1. Reddit (wichtigster Beta-Kanal)**
- r/germantrees – deutschsprachige Community
- r/microgrowery – internationale Grower-Community
- Ansatz: Ehrlich als Gründer auftreten, nicht als Marketing
- Beispiel-Post: "Ich baue ein KI-Tool für Cannabis-Grower und suche Beta-Tester"

**2. Discord Communities**
- Bestehende deutschsprachige Grower-Discord-Server
- Direkte Ansprache von aktiven Community-Mitgliedern

**3. Grower.ch / German-Cannabis-Foren**
- Direkter Austausch in den größten deutschsprachigen Foren
- Nicht spammen – echten Wert liefern, dann Tool vorstellen

**4. Persönliches Netzwerk**
- Grower die man kennt
- 10–20 persönliche Beta-Nutzer als erster Kern

### Beta-Ablauf

```
1. Waitlist aufbauen (2 Wochen vor Beta)
2. Beta starten mit 25 Nutzern
3. Feedback nach 1 Woche sammeln
4. Kritische Bugs fixen
5. Beta auf 100 Nutzer erweitern
6. Public Launch vorbereiten
```

### Beta-Feedback-System

Nach jeder Diagnose: "War diese Diagnose hilfreich?" (1 Klick)
Nach 7 Tagen: Kurzes In-App-Survey (3 Fragen)
Nach 30 Tagen: Persönliches Interview (5–10 Beta-Nutzer)

**Kritische Beta-Fragen:**
1. Legst du nach der Nutzung mehr Grows an?
2. Was fehlt dir am meisten?
3. Würdest du SecretLeaf einem Grower-Freund empfehlen?
4. Was ist das Erste, das du verbessern würdest?

---

## Phase 1 – Public Launch

### Ziel
500 MAG in den ersten 6 Monaten nach Public Launch.

### Launch-Kanäle

**1. Reddit-Launch (Tag 1)**

Post in r/microgrowery und r/germantrees:
"I built an AI-powered grow journal that diagnoses plant problems from photos [OC]"

Inhalt:
- Was ist SecretLeaf?
- Warum wurde es gebaut?
- Demo-Video (30 Sekunden)
- Kostenloser Zugang

Erwartung: 500–2.000 Upvotes bei gutem Timing → 200–500 Registrierungen

**2. Product Hunt Launch**
- Ankündigung als "AI-powered Cannabis Growing OS"
- Timing: Dienstag oder Mittwoch, 08:00 Uhr PST
- Ziel: Top 5 des Tages → 300–500 Early Adopter

**3. Hacker News – Show HN**
"Show HN: I built an AI plant disease detector specifically for cannabis"
- Technischer Fokus
- Beschreibung des Knowledge Graph und Data Moat-Ansatzes

**4. Instagram / TikTok – Organisch**
Vorher-Nachher-Posts: "KI erkennt Calciummangel in 3 Sekunden"
Demo-Videos die echte Diagnosen zeigen.

---

## SEO-Strategie für Phase 1

Parallel zum Launch-Buzz wird organischer SEO-Traffic aufgebaut.

### Sofort (vor Launch)

Programmatisch erstellte Seiten für häufige Suchanfragen:
- "Cannabis [Krankheit] erkennen" → z.B. "Cannabis Calciummangel erkennen"
- "Cannabis [Symptom] Ursache" → z.B. "gelbe Blätter Cannabis Ursache"
- "Cannabis [Sorte] anbauen" → z.B. "Gelato anbauen"

**Ziel:** 20–30 Seiten vor Launch, die organischen Traffic anziehen.

### 1–3 Monate nach Launch

Vollständiges Krankheits-Wiki:
- Jede Krankheit bekommt eine eigene SEO-optimierte Seite
- Schema Markup für Knowledge Graph (FAQ, HowTo)
- Internal Linking auf Diagnose-Feature

**Traffic-Ziel:** 10.000 organische Besucher/Monat nach 3 Monaten.

---

## Competitive Positioning beim Launch

**Gegen GrowDiaries:**
"GrowDiaries dokumentiert. SecretLeaf denkt mit."
Kernaussage: Wir sind das erste Grow-Tool das dir sagt, was du tun musst.

**Gegen Reddit/Foren:**
"Statt 2 Stunden auf eine Antwort warten: sofortige KI-Diagnose"

**Gegen ChatGPT:**
"ChatGPT kennt nicht deine Grow-Historie. SecretLeaf kennt jeden Tag deines Grows."

---

## Erfolgsmessung Launch

| KPI | Tag 1 | Woche 1 | Monat 1 | Monat 3 |
|---|---|---|---|---|
| Registrierungen | 200 | 500 | 1.000 | 2.500 |
| Grows erstellt | 50 | 200 | 400 | 800 |
| MAG | 50 | 150 | 300 | 500 |
| Diagnosen | 100 | 400 | 800 | 2.000 |
| Premium Conversions | 0 | 5 | 25 | 75 |

---

## Community-Aufbau (parallel)

Kein eigenes Forum im MVP.
Aber: Präsenz in bestehenden Communities aufbauen.

- Wöchentlicher Update-Post in relevanten Reddit-Communities
- Discord-Server für Beta-Nutzer (Feedback + Gemeinschaft)
- Twitter/X für Produkt-Updates und Insights
- Newsletter für warme Leads (Waitlist → Aktivierung)

---

## Launch-Checkliste

Technisch:
- [ ] DSGVO-konforme Datenschutzerklärung
- [ ] Impressum
- [ ] Cookie-Banner
- [ ] Fehlermonitoring aktiv (Sentry)
- [ ] Analytics aktiv (Posthog)
- [ ] E-Mail-System funktioniert (Resend)
- [ ] Bilder werden korrekt gespeichert
- [ ] Diagnose-System getestet mit echten Bildern

Marketing:
- [ ] Landing Page mit klarem Value Proposition
- [ ] Demo-Video (30–60 Sekunden)
- [ ] Reddit-Post vorbereitet
- [ ] Product Hunt-Profil erstellt
- [ ] 5–10 Seeding-Nutzer bereit für Tag 1 (Upvotes/Kommentare)

---

## Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Gegenmaßnahme |
|---|---|---|---|
| Zu wenig Registrierungen | Mittel | Hoch | Mehrere Launch-Kanäle gleichzeitig |
| Hoher Churn nach Tag 7 | Hoch | Hoch | Onboarding verbessern, E-Mail-Sequenz |
| KI-Diagnosen ungenau | Mittel | Sehr hoch | Beta-Phase zur Kalibrierung nutzen |
| Reddit-Post floppt | Mittel | Mittel | Backup: Product Hunt + HN gleichzeitig |
| Kosten explodieren (KI-API) | Niedrig | Mittel | Rate Limiting + Diagnose-Limit Free-Tier |

---

## Offene Fragen

- Soll der Launch auf Deutsch oder Englisch erfolgen?
- Brauchen wir einen Influencer-Deal für den Launch?
- Soll es ein Grounding Event geben (z.B. Live-Demo)?
- Wie gehen wir mit der rechtlichen Unsicherheit (Cannabis-Content) bei Product Hunt um?

## Verknüpfte Dokumente

[[01_Growth_Engine]]
[[08_Growth_Strategie]]
[[05_Aktivierungssystem]]
[[01_MVP_Feature_Liste]]
[[04_Rechtliche_Risiken]]
[[06_Pricing_Strategie]]
[[07_Referral_System]]

## Änderungsverlauf

### V1
Erstversion
