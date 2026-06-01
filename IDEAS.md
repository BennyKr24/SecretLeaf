# SecretLeaf Portfolio Backlog

## 1. Zweck

Dieses Dokument ist kein Sammelbecken fuer lose Ideen.
Es ist ein priorisiertes Portfolio mit klarer Bewertungslogik und Entscheidungsstatus.

Bewertungsskala:
- Impact: 1 bis 5
- Effort: 1 bis 5
- Confidence: 1 bis 5
- Priority Score: (Impact * Confidence) / Effort

Status:
- Planned
- Discovery
- Parked
- Rejected
- Done

---

## 2. Top Prioritaeten (naechste 90 Tage)

| Initiative | Bereich | Impact | Effort | Confidence | Score | Status | Warum jetzt |
|---|---|---:|---:|---:|---:|---|---|
| Stripe Checkout plus Entitlements | Monetarisierung | 5 | 3 | 4 | 6.7 | Planned | Ohne Umsatz kein valides Produktmodell |
| Pro Value Loop im Grow OS | Produkt | 5 | 3 | 4 | 6.7 | Planned | Zahlungsgrund muss operativ erlebbar sein |
| Sentry produktiv aktivieren | Zuverlaessigkeit | 4 | 1 | 5 | 20.0 | Planned | Schnellster Hebel fuer Incident-Transparenz |
| Analytics Funnel Baseline | Wachstum | 5 | 2 | 4 | 10.0 | Planned | Entscheidungen aktuell ohne belastbare Nutzungsdaten |
| Diagnose zu Log nahtlos verankern | Retention | 4 | 1 | 5 | 20.0 | Planned | Kurzer Aufwand mit direktem Loop-Effekt |

---

## 3. Produkt und Grow

| Initiative | Impact | Effort | Confidence | Score | Status | Abhaengigkeiten |
|---|---:|---:|---:|---:|---|---|
| Grow History mit Vergleichsansicht | 4 | 2 | 4 | 8.0 | Discovery | Stabiler Grow-Cloud-Pfad |
| Plant Notes vollstaendig im UI | 3 | 1 | 5 | 15.0 | Planned | Keine |
| Harvest Daten strukturiert erfassen | 4 | 2 | 4 | 8.0 | Discovery | History und Reporting |
| Auto-Phasenwechsel Empfehlung | 3 | 1 | 4 | 12.0 | Planned | Planlogik stabil |
| Tool-Ergebnisse im Plant-Kontext | 3 | 2 | 3 | 4.5 | Parked | UX-Validierung notwendig |

---

## 4. KI und Wissen

| Initiative | Impact | Effort | Confidence | Score | Status | Abhaengigkeiten |
|---|---:|---:|---:|---:|---|---|
| AI-Diagnose produktionsreif | 4 | 3 | 3 | 4.0 | Discovery | Billing, Rate Limits, Safety-Rails |
| Engine Scoring kontinuierlich kalibrieren | 4 | 2 | 4 | 8.0 | Planned | Analytics und Review-Daten |
| AI Translation Layer fuer dynamische Inhalte | 3 | 3 | 3 | 3.0 | Parked | i18n-Basis und Kostenmodell |
| Studies Quality Workflow mit SLA | 4 | 2 | 4 | 8.0 | Planned | Admin-Betriebskapazitaet |

---

## 5. Wachstum und Lifecycle

| Initiative | Impact | Effort | Confidence | Score | Status | Abhaengigkeiten |
|---|---:|---:|---:|---:|---|---|
| Newsletter Backend mit Segmenten | 3 | 2 | 4 | 6.0 | Planned | Provider-Entscheid |
| Referral Mechanik | 4 | 3 | 3 | 4.0 | Parked | Klare Activation-Kriterien |
| Push Notifications (Web) | 3 | 3 | 3 | 3.0 | Parked | Consent und Lifecycle-Design |
| Programmatic SEO fuer Studiencluster | 4 | 3 | 3 | 4.0 | Discovery | IA und Content Governance |

---

## 6. Plattform und Betrieb

| Initiative | Impact | Effort | Confidence | Score | Status | Abhaengigkeiten |
|---|---:|---:|---:|---:|---|---|
| Legacy API Scope reduzieren | 5 | 3 | 4 | 6.7 | Planned | Architekturentscheid |
| End-to-End Smoke Suite fuer kritische Flows | 4 | 3 | 4 | 5.3 | Discovery | Stabiler Test-Harness |
| Incident Playbook Automatisierung | 3 | 2 | 4 | 6.0 | Planned | Sentry und Alerting live |
| Backup and Restore Drill Prozess | 4 | 2 | 5 | 10.0 | Planned | Ops-Terminierung |

---

## 7. Monetarisierungsoptionen

Bewertungskriterien:
- Time to revenue
- Umsetzbarkeit
- Brutto-Margenpotenzial

| Modell | Time to Revenue | Umsetzbarkeit | Margin Potenzial | Status |
|---|---|---|---|---|
| Pro Abo fuer Grow Execution | Kurz | Hoch | Hoch | Planned |
| Team Plan fuer kollaborative Grows | Mittel | Mittel | Hoch | Discovery |
| Affiliate Layer fuer Tools und Inputs | Kurz | Hoch | Mittel | Discovery |
| Lifetime Deal | Kurz | Hoch | Niedrig bis Mittel | Parked |

---

## 8. Geparkt und Verworfen

Parked:
- Public Grow Profiles (kein prioritaerer Umsatzhebel)
- Onboarding Tour in voller Tiefe (erst nach Funnel-Basis)
- Vollstaendige mobile App (zu frueh)

Rejected:
- Feature-Buendel ohne klare KPI-Verantwortung
- Neue Produktflaechen ohne direkten Bezug zu Grow Core oder Revenue-Pfad

---

## 9. Governance

Regeln fuer neue Eintraege:
1. Jede Idee braucht Problemstatement und Zielmetrik
2. Jede Idee bekommt Impact, Effort, Confidence
3. Ohne Owner kein Planned-Status
4. Parked nach 90 Tagen ohne Fortschritt erneut bewerten

Review-Rhythmus:
- Woechentlich: Top Prioritaeten und Blocker
- Monatlich: Re-Priorisierung des gesamten Portfolios

## 10. Dokument-Metadaten

Owner: Product Engineering
Status: Active
Last updated: 2026-06-01
Next review: 2026-07-01
