# Grow OS Audit

Stand: 2026-06-01

Scope:

- Grow
- Pflanzen
- Logs
- Diagnose
- Empfehlungen
- Aufgaben
- Verbesserungen

## Ergebnis

Der Kernworkflow ist funktionsfähig, aber noch nicht vollständig ohne Medienbruch.

Größte direkte Brüche:

1. Der authentifizierte Grow-Pfad verlor Pflanzenzustand über Supabase-Reloads.
2. Diagnose-Ergebnisse wurden im Grow-Log ohne strukturierte Begründung gespeichert.
3. Diagnose startet aus dem Grow-Kontext weiterhin ohne Pflanzen- oder Grow-Vorbelegung.

## Direkt behobene Probleme

### 1. Pflanzen-Sync im Online-Pfad

Status: Behoben

Problem:

- `useGrowState` hydratisierte Supabase-Grows mit `plants: []`.
- Pflanzen-Umbenennungen und Pflanzennotizen wurden im eingeloggten Pfad nicht zuverlässig serverseitig gespiegelt.

Auswirkung:

- Der Workflow Grow -> Pflanzen brach nach Reload oder Gerätewechsel.

Fix:

- Supabase-Grows werden jetzt zusammen mit `plants` geladen.
- `createGrow` und `updateGrow` synchronisieren Pflanzen in `public.plants`.

### 2. Diagnose -> Grow-Log Kontinuität

Status: Behoben

Problem:

- Diagnose speicherte nur eine freie Textnotiz ohne sichtbare Confidence, Evidenz oder Wissensbezug.

Auswirkung:

- Der Übergang Diagnose -> Logs verlor den erklärbaren Kontext.

Fix:

- Gespeicherte Diagnose-Notizen enthalten jetzt:
  - Confidence Score
  - Evidence Level
  - verknüpfte Studien

### 3. Empfehlungen mit Explainability

Status: Behoben

Problem:

- Grow-Empfehlungen waren priorisiert, aber der konkrete Grund blieb im UI zu schwach sichtbar.

Fix:

- Smart Insights und Log-Insights zeigen jetzt:
  - Grund
  - Confidence Score
  - Evidence Level
  - erwarteten Nutzen

## Offene Workflow-Brüche

### A. Grow -> Diagnose verliert Pflanzenkontext

Schweregrad: Hoch

Beobachtung:

- Pflanzenkarten und Schnellzugriff öffnen Diagnose generisch.
- Weder `growId` noch `plantId` werden als Kontext übergeben.

Folge:

- Der Nutzer muss Symptome und Kontext manuell rekonstruieren.

Bewertung:

- Kein Datenverlust, aber ein klarer Medienbruch.

### B. Diagnose bleibt kein First-Class Grow-Ereignis

Schweregrad: Mittel

Beobachtung:

- Diagnose wird weiterhin als `notiz` serialisiert.
- Es existiert kein strukturiertes Diagnose-Log-Format.

Folge:

- Verlauf ist sichtbar, aber nicht systematisch auswertbar.

### C. Empfehlungen -> Aufgaben ist nur teilweise geschlossen

Schweregrad: Mittel

Beobachtung:

- Log-Aktionen können Aufgaben automatisch schließen.
- Tool- und Studien-Aktionen schreiben aber keinen expliziten Outcome zurück.

Folge:

- Der Verbesserungsloop ist für nicht-loggende Aktionen unvollständig.

### D. Active-Grow-Zeiger bleibt lokal

Schweregrad: Niedrig

Beobachtung:

- Der aktive Grow wird weiter lokal verwaltet.

Folge:

- Geräteübergreifend kann die zuletzt aktive Session abweichen.

## Workflow-Bewertung nach Schritt

### 1. Grow

Status: Gut

- Überblick, tägliche Priorität und Grow-Wissen sind sichtbar.
- Hauptschwäche bleibt die visuelle Dichte der Seite.

### 2. Pflanzen

Status: Solide nach Fix

- Pflanzen-Reload und Pflanzen-Notizen sind im Online-Pfad wieder konsistent.
- Diagnose-Kontext pro Pflanze fehlt noch.

### 3. Logs

Status: Gut

- Quick-Add, Auto-Completion und Folgehinweise funktionieren.
- Strukturierte Diagnoseereignisse fehlen.

### 4. Diagnose

Status: Mittel

- Explainability wurde verbessert.
- Kontextübergabe aus dem Grow fehlt.

### 5. Empfehlungen

Status: Gut

- Jetzt explizit begründet und evidenzmarkiert.
- Feedback und Outcome-Tracking fehlen noch.

### 6. Aufgaben

Status: Mittel bis gut

- Log-nahe Aufgaben schließen automatisch.
- Tool- und Studien-basierte Maßnahmen bleiben lose gekoppelt.

### 7. Verbesserungen

Status: Mittel

- Der Nutzer sieht Nutzen und Priorität.
- Das System lernt noch nicht aus bestätigten oder verworfenen Empfehlungen.

## Nächste risikokleine Schritte

1. Diagnose mit `growId` und optional `plantId` starten.
2. Diagnose als strukturierten Log-Typ modellieren statt als reine Notiz.
3. Tool- und Studien-Aktionen mit einem leichten Outcome-Signal in Grow rückführen.# Grow OS Audit

Stand: 2026-06-01

## Scope

Geprüfter Kernworkflow:

1. Grow
2. Pflanzen
3. Logs
4. Diagnose
5. Empfehlungen
6. Aufgaben
7. Verbesserungen

Geprüfte Kernpfade:

- `apps/web/src/app/[locale]/grow/[id]/page.tsx`
- `apps/web/src/app/[locale]/grow/[id]/log/page.tsx`
- `apps/web/src/hooks/useGrowLog.ts`
- `apps/web/src/hooks/useGrowState.ts`
- `apps/web/src/components/diagnose/DiagnoseResult.tsx`
- `apps/web/src/components/SmartInsights.tsx`
- `apps/web/src/lib/grow/db.ts`

## Ergebnis

Der Workflow ist funktional produktfähig, aber noch nicht vollständig geschlossen.

Die größte bereits behobene Unterbrechung war im authentifizierten Pfad zwischen `Grow` und `Pflanzen`:

- Pflanzen wurden aus Supabase nicht in den aktiven Grow zurückgemappt.
- Pflanzen-Umbenennungen und Pflanzennotizen wurden online nicht sauber synchronisiert.

Dieser Bruch wurde in diesem Lauf direkt behoben.

## Direkt umgesetzte Fixes

### 1. Pflanzen-Sync im Online-Pfad repariert

Betroffene Pfade:

- `apps/web/src/lib/grow/db.ts`
- `apps/web/src/hooks/useGrowState.ts`

Umsetzung:

- `getGrows()` lädt jetzt Pflanzen aus `public.plants` und hydriert sie in den aktiven Grow.
- `createGrow()` synchronisiert erzeugte Pflanzen zusätzlich in `public.plants`.
- `updateGrow()` synchronisiert Pflanzen-Änderungen bei Rename/Notizen auch online.

Wirkung:

- Der Schritt `Grow -> Pflanzen` ist für eingeloggte Nutzer nicht mehr inkonsistent.
- Pflanzennamen und Pflanzennotizen gehen nach Reload nicht mehr verloren.

### 2. Diagnose -> Grow-Log Datenfluss angereichert

Betroffener Pfad:

- `apps/web/src/components/diagnose/DiagnoseResult.tsx`

Umsetzung:

- Gespeicherte Diagnose-Notizen enthalten jetzt zusätzlich Confidence, Evidenz und verknüpfte Studien.

Wirkung:

- Der Schritt `Diagnose -> Verbesserungen` verliert weniger Kontext.
- Die Grow-Historie wird nachvollziehbarer.

## Verbleibende Workflow-Brüche

### Hoch: Pflanzenkontext geht auf dem Weg in die Diagnose verloren

Betroffene Pfade:

- `apps/web/src/app/[locale]/grow/[id]/page.tsx`
- `apps/web/src/components/diagnose/DiagnoseResult.tsx`

Befund:

- Plant Cards verlinken auf `/diagnose`, aber ohne `growId`, `plantId` oder letzten Pflanzenkontext.
- Diagnose läuft dadurch außerhalb des aktiven Pflanzenscopes.

Folge:

- `Pflanzen -> Diagnose` ist fachlich unterbrochen.
- Diagnoseergebnisse sind nicht pflanzenspezifisch rückverfolgbar.

### Mittel: Empfehlungen sind handlungsstark, aber nicht als strukturierte Task-Schicht zurückgespeichert

Betroffene Pfade:

- `apps/web/src/components/SmartInsights.tsx`
- `apps/web/src/lib/grow/insights.ts`

Befund:

- Empfehlungen zeigen Grund, Priorität und Nutzen.
- Sie erfüllen teils bestehende Tasks, erzeugen aber keine explizite strukturierte Rückführung in den Plan.

Folge:

- `Empfehlungen -> Aufgaben` ist nur teilweise geschlossen.
- Der Nutzer versteht die Handlung, aber das System lernt daraus noch nicht systematisch.

### Mittel: Diagnose und Tool-Ergebnisse komplettieren keine Aufgaben automatisch

Betroffene Pfade:

- `apps/web/src/hooks/useGrowLog.ts`
- `apps/web/src/components/diagnose/DiagnoseResult.tsx`
- `apps/web/src/components/tools/SaveToGrowButton.tsx`

Befund:

- Auto-Completion existiert nur für `wasser`, `duenger`, `training`.
- Diagnose- und Tool-Resultate landen im Log, aber nicht in einer strukturierten Aufgabenrückkopplung.

Folge:

- `Diagnose -> Aufgaben` und `Tools -> Aufgaben` bleiben unvollständig.

### Niedrig: Verbesserungs-Loop ist sichtbar, aber noch nicht messbar

Betroffene Pfade:

- `apps/web/src/app/[locale]/grow/[id]/page.tsx`
- `apps/web/src/app/[locale]/grow/[id]/log/page.tsx`

Befund:

- Daily Action, Performance Panel, Streak und Post-Log-Insights erzeugen einen motivierenden Verbesserungsloop.
- Es fehlt aber eine explizite Persistenz von "Empfehlung ausgeführt" oder "Diagnose bestätigt".

## Workflow-Bewertung

### Stark

- Grow Overview bündelt Status, Pflanzen, Tasks, Diagnosezugang und Empfehlungen auf einer Hauptfläche.
- Logs haben geringe Reibung durch Quick Add und direkte Inline-Formulare.
- Task-Autocomplete durch Logs ist ein echter Produktivitätsgewinn.
- Diagnose ist nicht mehr isoliert, sondern mit Wissen und Grow-Log verbunden.

### Schwach

- Pflanzenspezifischer Diagnosekontext fehlt.
- Empfehlungen sind noch keine vollwertige Task-Orchestrierung.
- Feedback- und Lernpfad bleibt implizit.

## Priorisierte Folgeschritte

1. Diagnose-Start mit `growId` und `plantId` kontextualisieren.
2. Diagnose- und Tool-Ergebnisse als strukturiertere Grow-Aktion rückführbar machen.
3. Empfehlungen mit einer klaren Statusrückmeldung im Plan verknüpfen.