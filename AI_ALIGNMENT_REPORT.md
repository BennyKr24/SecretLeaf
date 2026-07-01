# AI Alignment Report

Audit-Snapshot: 2026-06-01

Hinweis 2026-07-01: Historischer AI-Alignment-Snapshot. Aktuelle offene AI-/Diagnose-Backlog-Punkte sind nicht als Produktionsfehler des Grow-Kernflows zu lesen.

Referenz:

- AI_SYSTEM.md

## Ergebnis

Der AI-Layer ist jetzt deutlich näher an der Produktvorgabe, aber noch nicht vollständig geschlossen.

## Umgesetzte Angleichungen

### 1. Diagnose liefert jetzt sichtbar strukturierte Evidenz

Erreicht:

- `confidenceScore`
- `evidenceLevel`
- graph-basierte Studienbezüge
- strukturierte API-Sources aus Wissensverknüpfungen

Bewertung:

- Die Diagnose ist nicht mehr nur Text und erfüllt den Kern von Abschnitt 7 und 8 aus AI_SYSTEM.md.

### 2. Empfehlungen sind jetzt nachvollziehbar statt nur priorisiert

Erreicht:

- Grund
- Priorität
- erwarteter Nutzen
- Confidence Score
- Evidence Level

Bewertung:

- Der Recommendation-Layer erfüllt jetzt den Kern von Abschnitt 9 deutlich besser.

### 3. Explainability kommt aus expliziten Beziehungen

Erreicht:

- Grow und Diagnose greifen auf denselben expliziten Graph-Layer zu.
- Quellenbezug ist nicht mehr nur implizit über Slug-Boosts oder grobe Kategorien.

Bewertung:

- Das reduziert Black-Box-Verhalten messbar.

## Verbleibende Abweichungen

### A. Feedback Loop fehlt weiterhin

Schweregrad: Hoch

- Es gibt noch kein explizites Signal für:
  - Empfehlung geholfen / nicht geholfen
  - Diagnose bestätigt / verworfen

Konsequenz:

- Abschnitt 5 und 12 bleiben nur teilweise erfüllt.

### B. Confidence ist noch nicht kalibriert

Schweregrad: Mittel

- Scores sind aktuell regel- und relationsbasiert.
- Es gibt keine Outcome-Kalibrierung gegen reale Nutzungsverläufe.

### C. Wissensquellen sind noch app-seeded

Schweregrad: Mittel

- Die Runtime nutzt einen expliziten Graph-Layer, aber noch keine produktiv befüllte relationale Supabase-Quelle.

### D. Diagnose ist noch nicht Grow-kontextsensitiv genug

Schweregrad: Mittel

- Grow- und Pflanzenkontext fließen beim Start der Diagnose nicht sauber mit.

## Fazit

SecretLeaf erfüllt jetzt den wichtigsten AI-Produktanspruch besser:

- Kontext
- Erklärung
- Handlung

Nicht erfüllt bleibt der Lernkreis:

- Outcome messen
- Feedback auswerten
- Scores nachschärfen

## Priorisierte nächste Schritte

1. Feedback-Signal für Diagnose und Empfehlungen einführen.
2. `wiki_relationships` produktiv befüllen und als Runtime-Quelle verwenden.
3. Diagnose mit Grow- und Pflanzenkontext starten.
4. Confidence gegen reale Folgeereignisse im Grow-Log kalibrieren.# AI Alignment Report

Audit-Snapshot: 2026-06-01

## Referenz

Abgleich gegen `AI_SYSTEM.md`.

## Wichtigste Abweichungen vor diesem Lauf

1. Grow-Empfehlungen waren heuristisch und erklärten weder Grund noch Evidenz sauber.
2. Diagnose zeigte zwar qualitative Sicherheit, aber keinen sichtbaren numerischen Confidence-Score.
3. Diagnosequellen und Studienbeziehungen waren nicht über einen expliziten Graph-Layer vereinheitlicht.
4. Feedback-Loops waren nicht vorhanden.

## Direkt umgesetzte Angleichungen

### 1. Recommendation System auf explizite Relationen umgestellt

Betroffene Pfade:

- `apps/web/src/lib/knowledge/graph.ts`
- `apps/web/src/lib/grow/insights.ts`
- `apps/web/src/components/SmartInsights.tsx`
- `apps/web/src/app/[locale]/grow/[id]/log/page.tsx`

Umsetzung:

- Grow-Empfehlungen entstehen jetzt primär aus expliziten Relationen statt aus verteilten Slug-Boosts.
- Jede Empfehlung liefert jetzt:
  - `reason`
  - `priority`
  - `expectedBenefit`
  - `confidenceScore`
  - `evidenceLevel`

Bewertung gegen `AI_SYSTEM.md`:

- `Recommendation System`: deutlich näher am Soll.
- `Explainability Principle`: erfüllt im UI sichtbar.

### 2. Diagnose-Evidenz mit demselben Wissensgraphen verbunden

Betroffene Pfade:

- `apps/web/src/lib/diagnose/knowledge.ts`
- `apps/web/src/components/diagnose/DiagnoseResult.tsx`
- `apps/web/src/app/api/diagnose/route.ts`

Umsetzung:

- Diagnose verknüpft relevante Studien jetzt über einen expliziten Graph-Layer.
- Diagnose-API liefert ihre `sources` aus dieser Relationsebene.
- UI zeigt `confidenceScore` und `evidenceLevel` sichtbar an.

Bewertung gegen `AI_SYSTEM.md`:

- `Diagnosis System`: strukturiert und erklärbar.
- `Diagnosis Confidence`: sichtbar umgesetzt.

### 3. Diagnose wird im Grow-Verlauf nachvollziehbarer gespeichert

Betroffener Pfad:

- `apps/web/src/components/diagnose/DiagnoseResult.tsx`

Umsetzung:

- Beim Speichern ins Grow-Log werden Confidence, Evidenz und verknüpfte Studien mitgeschrieben.

Wirkung:

- Die AI-Unterstützung verschwindet nicht mehr als bloßer Freitext im Verlauf.

## Verbleibende AI-Gaps

### Hoch: Feedback-Loop fehlt weiterhin

Befund:

- Es gibt kein produktives Signal wie "Diagnose hilfreich", "Empfehlung umgesetzt" oder "Empfehlung falsch".

Folge:

- `engine-adapt` und zukünftige Lernlogik haben im Produktpfad noch kein sauberes Nutzerfeedback.

### Mittel: Wissensgraph ist app-seitig explizit, aber noch nicht DB-produktiv gespeist

Befund:

- Die Runtime arbeitet jetzt mit einem expliziten Relationmodell.
- Die eigentliche DB-Quelle `wiki_relationships` ist eingeführt, aber noch nicht mit Produktionsdaten befüllt.

Folge:

- AI-Alignment ist strukturell besser, aber noch nicht vollständig datenbankbasiert.

### Mittel: Recommendation-Ausführung bleibt UI-zentriert

Befund:

- Empfehlungen liefern bessere Erklärungen.
- Es fehlt noch eine persistente Ergebnisrückmeldung pro Empfehlung.

## AI-Reifeeinschätzung

- Diagnose: gut verbessert
- Empfehlungen: klar verbessert
- Explainability: produktiv sichtbar
- Feedback Loop: unzureichend

## Priorisierte Folgeschritte

1. Feedback-Signal für Diagnose und Empfehlungen produktiv erfassen.
2. `wiki_relationships` aus der App-Relationsebene in den DB-Produktionspfad überführen.
3. Empfehlungen mit Umsetzungsstatus oder Outcome im Grow-Verlauf verknüpfen.