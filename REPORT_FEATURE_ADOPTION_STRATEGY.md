# REPORT: Feature Adoption Strategy
**Stand:** 1. Juni 2026  
**North-Star-Metrik:** MAG — Monthly Active Growers  
**Scope:** Analytics-Architektur, KPI-Framework, Messplan, Dashboard-Konzept, Roadmap

---

## Executive Summary

SecretLeaf verfügt über eine funktionsfähige Analytics-Basis (Plausible, type-safe Events), aber die Messung von Feature-Adoption ist strukturell unvollständig. Von 12 definierten Kern-Events in `analytics.ts` werden **4 aktiv gefeuert** — 8 sind im Code definiert, aber nirgendwo aufgerufen. Der Weg vom Update-Lesen zur tatsächlichen Feature-Nutzung ist aktuell **nicht messbar**.

**Der kritischste blinde Fleck:** `growCreated` ist das einzige Lifecycle-Event für den Kern-Workflow. Was danach passiert — wie oft Nutzer loggen, welche Phase sie erreichen, wann sie aufhören — ist vollständig unsichtbar.

---

## 1. North-Star-Metrik: MAG

**MAG = Monthly Active Growers**  
Definition: Nutzer mit mindestens einem `log_entry_added`-Event in den letzten 30 Tagen.

**Warum MAG statt MAU:**  
MAU (Monthly Active Users) misst Logins und Seitenaufrufe — Lese-Verhalten. MAG misst aktive Nutzung des Kern-Produkts. Ein Nutzer, der täglich Articles liest, aber nie einen Grow anlegt, liefert für SecretLeaf keinen Produktwert und zahlt nicht. MAG ist direkt korreliert mit Retention, Monetarisierung und Produktwert.

**MAG-Formel:**
```
MAG = COUNT(DISTINCT user_id WHERE log_entry_added IN letzten 30 Tagen)
```

**Sub-Metriken zur MAG-Diagnose:**

| Metrik | Formel | Signal |
|---|---|---|
| Grow Activation Rate | `grow_created / neue_registrierungen` | Onboarding-Effektivität |
| MAG / MAU | Verhältnis | Anteil aktiver Nutzer am Gesamt-Traffic |
| Log-Streak-Durschnitt | `log_entries / aktive_grows` | Engagement-Tiefe |
| Phase-Completion Rate | `Grows die Phase 3+ erreichen / alle Grows` | Langzeit-Retention |

---

## 2. Aktueller Event-Stand: Bestandsaufnahme

### 2.1 Definierte Events (in `analytics.ts`)

| Event | Parameter | Status |
|---|---|---|
| `grow_created` | `umgebung`, `medium` | ✅ Aktiv — `GrowSetupWizard.tsx` |
| `log_entry_added` | `type` | ✅ Aktiv — `grow/[id]/log/page.tsx` |
| `tool_used` | `tool` | ⚠️ Definiert, **nirgendwo aufgerufen** |
| `phase_advanced` | `from`, `to` | ⚠️ Definiert, **nirgendwo aufgerufen** |
| `harvest_recorded` | — | ⚠️ Definiert, **nirgendwo aufgerufen** |
| `newsletter_signup` | — | ✅ Aktiv — `NewsletterSignup.tsx` + `UpdateNewsletterBlock` |
| `wiki_article_opened` | `slug` | ⚠️ Definiert, **nirgendwo aufgerufen** |
| `update_viewed` | `slug`, `category`, `version`, `featured` | ✅ Aktiv — `[slug]/client.tsx` |
| `update_cta_clicked` | `slug`, `target`, `category` | ✅ Aktiv — `[slug]/client.tsx` |
| `update_category_viewed` | `category` | ✅ Aktiv — `updates/client.tsx` |

**Aktivierungsquote: 5/10 Events aktiv (50%)**

### 2.2 Events, die fehlen (nicht definiert, nicht gefeuert)

| Fehlendes Event | Wo | Warum kritisch |
|---|---|---|
| `diagnose_started` | `DiagnoseFlow.tsx` | Nutzung des Kern-Features nicht messbar |
| `diagnose_completed` | `DiagnoseFlow.tsx` | Completion Rate unbekannt |
| `diagnose_saved_to_grow` | `DiagnoseResult.tsx` (handleAddToGrow) | Feature-Adoption Diagnose→Log unmessbar |
| `search_performed` | `SearchBar.tsx` | Suche-Nutzung nicht messbar |
| `search_result_clicked` | Search-Ergebnisse | Suche-Qualität nicht messbar |
| `grow_task_completed` | Grow Task UI | Task-Completion Rate unbekannt |
| `grow_deleted` | Grow-Verwaltung | Churn-Signal fehlt |
| `upgrade_cta_clicked` | Überall wo Paywall | Monetarisierungs-Funnel unbekannt |
| `onboarding_step_completed` | `GrowSetupWizard.tsx` | Onboarding-Abbrüche nicht messbar |
| `fertilizer_viewed` | Dünger-Katalog | Katalog-Adoption unbekannt |
| `study_bookmarked` | Wiki-Artikel | Content-Engagement unbekannt |
| `profile_plan_shown` | `profile/page.tsx` | Upgrade-Intent-Signal fehlt |

---

## 3. KPI-Framework

### 3.1 Update-KPIs

| KPI | Berechnung | Zielwert (Orientierung) |
|---|---|---|
| **Update View Rate** | `update_viewed / gesamt_seitenaufrufe` | Steigt nach Nav-Integration (P1-A) |
| **CTA Click Rate** | `update_cta_clicked / update_viewed` | > 15% ist stark |
| **Newsletter Conversion Rate** | `newsletter_signup_from_update / update_viewed` | > 3% ist gut |
| **Category Distribution** | `update_category_viewed` pro Kategorie | Zeigt, welche Themen interessieren |
| **Featured CTR** | `cta_clicked WHERE featured=true / viewed WHERE featured=true` | Vergleich mit non-featured |

**Segmentierung empfohlen:**
- Angemeldete vs. anonyme Nutzer
- Featured vs. non-featured Updates
- Mobile vs. Desktop

### 3.2 Feature-Adoption-KPIs

| KPI | Berechnung | Signal |
|---|---|---|
| **Feature Activation Rate** | `erste Nutzung / onboarding_completed` | % der Nutzer, die Feature je genutzt haben |
| **Time To First Use (TTFU)** | `erster event - grow_created` in Tagen | Wie schnell erreichen Nutzer den Wert? |
| **D7 Retention** | Nutzer die 7 Tage nach Aktivierung erneut nutzen | Stärkstes Retention-Signal |
| **D30 Retention** | Nutzer die 30 Tage nach Aktivierung erneut nutzen | Langzeit-Retention |
| **Feature Depth Score** | `log_entries / aktive_grows` pro Nutzer | Nutzungstiefe vs. oberflächliche Nutzung |
| **Diagnose→Log Conversion** | `diagnose_saved_to_grow / diagnose_completed` | Ende-zu-Ende Feature-Adoption |

### 3.3 Retention-KPIs

| KPI | Berechnung | Signal |
|---|---|---|
| **7-Day Log Streak** | Nutzer mit log_entry_added an 7 aufeinanderfolgenden Tagen | Hardcore-Engagement |
| **Phase Progression** | Nutzer die Phase veg, bluete, ernte erreichen | Long-form Retention |
| **Churn Predictor** | Tage ohne `log_entry_added` bei aktiven Grows | Reakivierungs-Trigger |
| **Newsletter→Return Rate** | Seitenaufrufe nach Newsletter-Send | Newsletter-Wirksamkeit |

### 3.4 Monetarisierungs-KPIs

| KPI | Berechnung | Signal |
|---|---|---|
| **Upgrade CTA Exposure** | Nutzer die Paywall-Elemente gesehen haben | Funnel-Einstieg |
| **Upgrade CTA Click Rate** | `upgrade_cta_clicked / upgrade_cta_exposed` | Konversions-Druck |
| **Free→Pro Conversion** | `pro_plan / total_registrierungen` | Kernmetrik Monetarisierung |
| **Feature-to-Upgrade Path** | Welches Feature unmittelbar vor Upgrade genutzt wurde | Welches Feature konvertiert? |

---

## 4. Conversion-Funnel: Update → Feature-Nutzung

### 4.1 Vollständiger Mess-Pfad

```
┌─────────────────────────────────────────────────────────────────────┐
│  AKQUISITION                                                         │
│  Seitenaufruf /updates          → pageview (Plausible built-in)     │
│  Kategorie-Filter               → update_category_viewed ✅          │
│                                                                      │
│  AWARENESS                                                           │
│  Update-Detailseite geöffnet    → update_viewed ✅                   │
│  Featured Update gelesen        → update_viewed { featured: true }  │
│                                                                      │
│  INTENT                                                              │
│  CTA geklickt                   → update_cta_clicked ✅              │
│  Newsletter eingetragen         → newsletter_signup ✅               │
│                                                                      │
│  AKTIVIERUNG                                                         │
│  Feature-Seite geöffnet         → pageview (Plausible built-in)     │
│  Feature aktiv genutzt          → [fehlendes Feature-Event] ❌       │
│                                                                      │
│  RETENTION                                                           │
│  Feature 7 Tage später genutzt  → [keine Retention-Events] ❌        │
│  Grow-Phase erreicht            → phase_advanced ⚠️ (def., ≠ aktiv)  │
│  Ernte                          → harvest_recorded ⚠️ (def., ≠ aktiv)│
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Messbare Funnel-Stufen heute vs. Ziel

| Stufe | Heute | Ziel |
|---|---|---|
| Seitenaufruf | ✅ Plausible | ✅ |
| Update gelesen | ✅ `update_viewed` | ✅ |
| CTA geklickt | ✅ `update_cta_clicked` | ✅ |
| Feature aufgerufen | ⚠️ Nur via Plausible-Pageview, keine Feature-Segmentierung | Events pro Feature |
| Feature aktiv genutzt | ❌ Nicht messbar | Events mit Aktion |
| Retention D7 | ❌ Nicht messbar | Events mit Timestamp-Analyse |
| Conversion Free→Pro | ❌ Nicht messbar | `upgrade_cta_clicked` + Plan-Änderung |

**Aktuell messbarer Funnel: Stufe 1–3 (Awareness + Intent)**  
**Fehlend: Stufe 4–6 (Adoption + Retention + Monetarisierung)**

---

## 5. Features — Priorisierung nach Mess-Wert

### Kriterien-Matrix (1–5)

| Feature | Nutzerwert | Datengewinn | Monetarisierung | Retention | Gesamt |
|---|---|---|---|---|---|
| **Diagnose** | 5 | 5 | 4 | 4 | **18** |
| **Log System** | 5 | 5 | 3 | 5 | **18** |
| **Grow OS Setup** | 5 | 4 | 4 | 5 | **18** |
| **Volltextsuche** | 4 | 4 | 2 | 3 | **13** |
| **Wiki / Studies** | 3 | 4 | 2 | 2 | **11** |
| **Tools / Rechner** | 3 | 3 | 3 | 2 | **11** |
| **Dünger-Katalog** | 3 | 3 | 2 | 2 | **10** |

**Ergebnis:** Diagnose, Log System und Grow Setup sind gleichwertig kritisch — alle drei definieren den Kern-Nutzer. Messung dieser drei Features hat höchste Priorität.

### Feature-spezifische Events (Priorisiert)

#### Diagnose (Priorität 1)
```
diagnose_started         { category, grow_context: bool }
diagnose_step_completed  { step: 1–N, category }
diagnose_completed       { result_id, confidence, category }
diagnose_saved_to_grow   { result_id, grow_id, plant_id? }
```
**Warum kritisch:** Die Diagnose ist die stärkste Demo des Produkt-Wertversprechens. Completion Rate + Save Rate zeigen, ob Nutzer den Wert wirklich erleben. Ohne diese Events ist die Diagnose-Adoption unsichtbar.

#### Log System (Priorität 1)
```
log_entry_added          { type } ← bereits aktiv ✅
log_streak_milestone     { days: 3 | 7 | 14 | 30 }
grow_task_completed      { category, was_overdue: bool }
```
**Warum kritisch:** `log_entry_added` ist bereits aktiv — der Milestone-Event fehlt aber als Retention-Indicator. Task-Completion zeigt, ob Nutzer den strukturierten Workflow nutzen.

#### Grow Setup & Lifecycle (Priorität 1)
```
grow_created             { umgebung, medium } ← bereits aktiv ✅
onboarding_step_completed { step: 1–4 }
grow_phase_advanced      { from, to } ← definiert, nicht aktiv
harvest_recorded         { grow_id } ← definiert, nicht aktiv
grow_deleted             { phase_reached, duration_days }
```
**Warum kritisch:** Onboarding-Abbrüche sind unsichtbar. Phasen-Progression zeigt Long-term Retention. `grow_deleted` ist das wichtigste Churn-Signal überhaupt.

---

## 6. Dashboard-Konzept: Internes Analytics-Dashboard

### Architektur-Empfehlung

Plausible-Daten allein reichen nicht für ein vollständiges Feature-Adoption-Dashboard. Plausible ist privacy-first und speichert keine User-IDs — Cohort-Analysen (D7/D30 Retention) sind damit nicht möglich.

**Empfohlene Architektur:**

```
Plausible (öffentliches Tracking)
  → Event-Stream: update_viewed, update_cta_clicked, pageviews

Supabase (authentifizierte Nutzer)
  → Tabellen: grows, log_entries, diagnose_results
  → SQL-Queries für: MAG, Phase Progression, Feature Adoption

Internes Dashboard
  → Kombiniert beide Quellen
  → Technologie: Next.js Admin-Route + Supabase Direct Queries
```

---

### 6.1 Dashboard-Abschnitt: Updates

**Ziel:** Verstehen, welche Updates gelesen werden und zu Feature-Nutzung führen.

| Widget | Datenquelle | Visualisierung |
|---|---|---|
| Update Views (7d / 30d) | Plausible `update_viewed` | Trend-Line |
| Top 5 Updates nach Views | Plausible `update_viewed { slug }` | Bar Chart |
| CTA Click Rate pro Update | `update_cta_clicked / update_viewed` | Table mit Rate |
| Newsletter Signups via Update | `newsletter_signup` aus Update-Seiten | Counter |
| Category Performance | `update_category_viewed` | Donut Chart |
| Featured vs. Regular CTR | Segmentiert nach `featured` | Vergleichs-Bars |

---

### 6.2 Dashboard-Abschnitt: Features

**Ziel:** Feature-Adoption und Time To First Use messen.

| Widget | Datenquelle | Visualisierung |
|---|---|---|
| MAG (Monthly Active Growers) | Supabase `log_entries` COUNT DISTINCT | Hero-Metrik, Trend |
| Diagnose Completion Rate | `diagnose_completed / diagnose_started` | Gauge |
| Diagnose→Log Save Rate | `diagnose_saved_to_grow / diagnose_completed` | Gauge |
| Log Entries pro Tag | Supabase `log_entries` GROUP BY DATE | Area Chart |
| Aktive Grows nach Phase | Supabase `grows GROUP BY current_phase_id` | Stacked Bar |
| TTFU — Time To First Log | `first log_entry - grow_created` in Tagen | Histogram |
| Tool Usage | Plausible `tool_used { tool }` | Bar Chart |

---

### 6.3 Dashboard-Abschnitt: Conversion

**Ziel:** Den Funnel von Update → Feature → Upgrade verstehen.

```
Funnel-Visualisierung:

[Update gelesen]   → N
      ↓  CTA Click Rate %
[Feature aufgerufen] → n1
      ↓  Aktivierungs-Rate %
[Feature genutzt]  → n2
      ↓  D7 Retention %
[7d später erneut] → n3
      ↓  Upgrade Rate %
[Pro-Nutzer]       → n4
```

| Widget | Datenquelle | Visualisierung |
|---|---|---|
| Funnel (oben) | Plausible + Supabase | Sankey / Step-Chart |
| CTA-Ziel Performance | `update_cta_clicked { target }` GROUP BY | Table |
| Conversion-Pfad vor Upgrade | Events unmittelbar vor Plan-Upgrade | Flow-Chart |

---

### 6.4 Dashboard-Abschnitt: Retention

**Ziel:** Erkennen, wann Nutzer abspringen und was sie hält.

| Widget | Datenquelle | Visualisierung |
|---|---|---|
| D7 Retention | Supabase Cohort-Query | Retention-Grid |
| D30 Retention | Supabase Cohort-Query | Retention-Grid |
| Log-Streak-Distribution | `log_streak_milestone` Verteilung | Histogram |
| Phase Progression Funnel | `grow_phase_advanced` Events | Step-Down Chart |
| Churn-Risiko (no log > 7d) | Supabase: aktive Grows ohne Log-Entry | Counter + Liste |
| Newsletter Öffnungsrate | (externer Anbieter) | Trend |

---

### 6.5 Dashboard-Abschnitt: Premium

**Ziel:** Monetarisierungs-Funnel und Upgrade-Trigger verstehen.

| Widget | Datenquelle | Visualisierung |
|---|---|---|
| Free vs. Pro Nutzer | Supabase `profiles GROUP BY plan` | Donut |
| Upgrade CTA Exposures | `upgrade_cta_clicked` Impressions | Counter |
| Upgrade CTA Click Rate | `upgrade_cta_clicked / exposures` | Gauge |
| Umsatz-Tracking | (Stripe / Zahlungsanbieter) | Trend |
| Feature-Nutzung vor Upgrade | Event-Analyse vor Plan-Upgrade | Top-List |
| Pro-Feature-Adoption | Events von Pro-Nutzern vs. Free | Vergleich |

---

## 7. P0 / P1 / P2 Roadmap

### P0 — Blockiert Kernmessung (ohne diese ist MAG nicht vollständig)

---

#### P0-1: `tool_used`, `phase_advanced`, `harvest_recorded`, `wiki_article_opened` aktivieren
**Problem:** 4 Events sind definiert aber nirgendwo aufgerufen.  
**Lösung:** Call-Sites in den entsprechenden Komponenten ergänzen:
- `tool_used` → `ToolLayout.tsx` oder die jeweiligen Tool-Pages
- `phase_advanced` → Komponente, die den Phase-Wechsel auslöst
- `harvest_recorded` → Harvest-Aktion in `grow/[id]/page.tsx`
- `wiki_article_opened` → `studies/[slug]/page.tsx` (Client-Wrapper)

**Aufwand:** Klein (Call-Sites ergänzen)  
**Impact:** Bestehende Events die nichts kosten, sofort nutzbar machen

---

#### P0-2: Diagnose-Events implementieren
**Problem:** Die meistgenutzten Features sind unsichtbar.  
**Lösung:**
```ts
// In DiagnoseFlow.tsx:
Analytics.diagnoseStarted(category, hasGrowContext)
Analytics.diagnoseCompleted(result.id, result.confidence, category)

// In DiagnoseResult.tsx (handleAddToGrow):
Analytics.diagnoseSavedToGrow(result.id, resolvedGrowId, plantId ?? null)
```
**Neue Events in `analytics.ts`:**
```ts
diagnoseStarted: (category: string, growContext: boolean) =>
  track('diagnose_started', { category, grow_context: growContext }),

diagnoseCompleted: (resultId: string, confidence: string, category: string) =>
  track('diagnose_completed', { result_id: resultId, confidence, category }),

diagnoseSavedToGrow: (resultId: string, growId: string, plantId: string | null) =>
  track('diagnose_saved_to_grow', { result_id: resultId, grow_id: growId, plant_id: plantId ?? 'none' }),
```
**Aufwand:** Klein  
**Impact:** End-to-End-Diagnose-Funnel messbar — das wichtigste fehlende Segment

---

#### P0-3: Onboarding-Events im `GrowSetupWizard`
**Problem:** Abbrüche im Setup-Prozess sind unsichtbar. Es ist unklar ob Nutzer Schritt 1, 2 oder 4 abbrechen.  
**Lösung:**
```ts
onboardingStepCompleted: (step: number, totalSteps: number) =>
  track('onboarding_step_completed', { step, total_steps: totalSteps }),
```
**Aufwand:** Klein (Hooks in `GrowSetupWizard.tsx`)  
**Impact:** Onboarding-Optimierung basierend auf Abbruch-Daten

---

### P1 — Wichtig für vollständiges Retention- und Monetarisierungsbild

---

#### P1-1: Log-Streak-Milestones
```ts
logStreakMilestone: (days: 3 | 7 | 14 | 30) =>
  track('log_streak_milestone', { days }),
```
Implementierung: In `useGrowLog.ts` oder `grow/[id]/log/page.tsx` nach dem Speichern — Streak aus Supabase-Daten berechnen, bei Milestone tracken.

**Impact:** Retention-Gamification messbar. Zeigt, ob Streak-System tatsächlich funktioniert.

---

#### P1-2: `grow_task_completed` + `grow_deleted`
Wichtigste fehlende Lifecycle-Events.
- `grow_task_completed` → nach Task-Abschluss-Interaktion
- `grow_deleted` → nach Bestätigung der Lösch-Aktion, mit `{ phase_reached, duration_days }`

`grow_deleted` ist ein kritisches **Churn-Signal** — ohne es ist nicht erkennbar, in welcher Phase Nutzer aufgeben.

**Impact:** Phase-Progression-Funnel schließbar

---

#### P1-3: `upgrade_cta_clicked` an allen Paywall-Punkten
Überall wo ein Upgrade-Hinweis existiert (profil/page.tsx, zukünftige Pro-Feature-Gates):
```ts
upgradeCtaClicked: (source: string) =>
  track('upgrade_cta_clicked', { source }),
```
**Impact:** Monetarisierungs-Funnel beginnt messbar zu werden

---

#### P1-4: Supabase-basierte MAG-Query einrichten
Plausible ist für User-basierte Cohort-Analyse nicht ausreichend. Eine interne Supabase-View für MAG:
```sql
CREATE VIEW monthly_active_growers AS
SELECT 
  COUNT(DISTINCT user_id) AS mag,
  DATE_TRUNC('month', created_at) AS month
FROM log_entries
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY month;
```
**Impact:** North-Star-Metrik MAG erstmals messbar

---

#### P1-5: `search_performed` + `search_result_clicked`
Die Volltextsuche ist ein starkes Feature — aber ihre Nutzung ist unsichtbar.
```ts
searchPerformed: (query: string, resultCount: number) =>
  track('search_performed', { query, result_count: resultCount }),

searchResultClicked: (slug: string, position: number) =>
  track('search_result_clicked', { slug, position }),
```
**Impact:** Suche-Qualität und -Adoption messbar

---

### P2 — Langfristige Analytics-Reife

---

#### P2-1: Internes Analytics-Dashboard (Next.js Admin-Route)
Route `/admin/analytics` — geschützt durch `ADMIN`-Rolle (bereits in Supabase vorhanden). Kombiniert Plausible-API und Supabase-Queries.

**Meilensteine:**
1. Plausible-API-Key → Serverside Queries
2. Supabase Admin-Queries (MAG, Phase Progression, Churn)
3. Dashboard UI mit den 5 Abschnitten aus Kapitel 6

---

#### P2-2: Retention-Cohort-Analyse
Wöchentliche Cohort-Tabelle: Welche Registrierungs-Kohorte hat wie viele MAGs nach 7/14/30 Tagen?

**Technologie:** Supabase SQL-View + einmaliger Export als CSV / oder internes Dashboard.

---

#### P2-3: Feature-Adoption-Score
Ein interner Score pro Nutzer:
```
Score = gewichtete Summe der genutzten Features:
  grow_created (+10)
  log_entry_added × min(50, count) (+1 pro Entry)
  diagnose_completed (+5 pro Nutzung)
  phase_advanced (+10 pro Phase)
  harvest_recorded (+25)
```
Nutzbar für: Segmentierung in Newsletter, In-App-Messages, Churn-Prävention.

---

#### P2-4: A/B-Test-Infrastruktur für CTAs
Verschiedene CTA-Texte in `updates.json` → gemessen via `update_cta_clicked`. Einfachste Form ohne eigenes A/B-Framework: zwei Update-Versionen mit unterschiedlichen CTAs + Vergleich der Click Rates.

---

#### P2-5: Automatisiertes Churn-Alert
Supabase Scheduled Function (Edge Function): täglich prüfen ob aktive Grows > 7 Tage kein Log-Entry hatten → Flag in Datenbank setzen → Trigger für Re-Engagement-E-Mail.

---

## 8. Event-Implementierungs-Übersicht

### Sofort umzusetzende Events (Bestandscode aktivieren)

| Event | Datei | Aufwand |
|---|---|---|
| `tool_used` | Tool-Pages oder `ToolLayout.tsx` | 15 min |
| `phase_advanced` | Grow-Phase-Wechsel-Komponente | 30 min |
| `harvest_recorded` | `grow/[id]/page.tsx` Harvest-Aktion | 15 min |
| `wiki_article_opened` | `studies/[slug]/page.tsx` Client-Wrapper | 30 min |

### Neue Events (definieren + aktivieren)

| Event | Neue Definition | Call-Site | Aufwand |
|---|---|---|---|
| `diagnose_started` | `analytics.ts` | `DiagnoseFlow.tsx` | 30 min |
| `diagnose_completed` | `analytics.ts` | `DiagnoseFlow.tsx` | 30 min |
| `diagnose_saved_to_grow` | `analytics.ts` | `DiagnoseResult.tsx` | 15 min |
| `onboarding_step_completed` | `analytics.ts` | `GrowSetupWizard.tsx` | 45 min |
| `log_streak_milestone` | `analytics.ts` | `useGrowLog.ts` / Log-Page | 45 min |
| `grow_task_completed` | `analytics.ts` | Task-Komponente | 30 min |
| `grow_deleted` | `analytics.ts` | Grow-Delete-Handler | 30 min |
| `upgrade_cta_clicked` | `analytics.ts` | Profile/Paywall-Gates | 30 min |
| `search_performed` | `analytics.ts` | `SearchBar.tsx` | 30 min |
| `search_result_clicked` | `analytics.ts` | Search-Ergebnisse | 30 min |

**Gesamtaufwand P0-Aktivierungen: ~2h**  
**Gesamtaufwand P0+P1 Events: ~5h**

---

## 9. Fazit

Das Analytics-System ist architektonisch korrekt aufgebaut — Plausible-Wrapper, type-safe Events, saubere Abstraktion. Die Investition in `analytics.ts` zahlt sich jetzt aus, weil neue Events trivial hinzufügbar sind.

Das Problem ist nicht die Infrastruktur. Das Problem ist **Lücken im Activation Layer**:

1. **50% der definierten Events sind inaktiv.** Sie wurden definiert aber nie in die entsprechenden Komponenten integriert. Das ist die günstigste Optimierung überhaupt.

2. **Der wichtigste Funnel ist unsichtbar.** Diagnose-Start → Diagnose-Ergebnis → Log-Eintrag. Dieser Weg beschreibt den Kern-Produktwert von SecretLeaf — und ist komplett nicht messbar.

3. **MAG als North-Star benötigt Supabase-Queries.** Plausible allein reicht für User-basierte Retention-Analyse nicht aus. Die Kombination aus Plausible (anonyme Events) + Supabase (Auth-gebundene Daten) ist die richtige Architektur.

**Erste Maßnahme mit höchstem ROI:** Die 4 inaktiven Events aktivieren + 3 Diagnose-Events in `DiagnoseFlow.tsx` und `DiagnoseResult.tsx` ergänzen. Aufwand < 2h. Ergebnis: Der kritischste Funnel ist vollständig messbar.
