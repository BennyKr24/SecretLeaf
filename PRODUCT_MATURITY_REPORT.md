# Product Maturity Report

Audit-Snapshot: 2026-06-01

Hinweis 2026-07-01: Historischer Reifegrad-Snapshot. Aktueller Stand zu Grow-Persistenz, Observability und offenen Punkten steht in README.md und DEPLOYMENT.md.

## Reifegrade

### 1. Produktreifegrad

76 %

Begründung:

- Kernworkflow ist nutzbar und zusammenhängend.
- Grow, Logs, Diagnose, Empfehlungen und Studien greifen sichtbar ineinander.
- Es fehlen aber noch einige strukturelle Schließungen im Daten- und Feedbackkreis.

### 2. Architekturreifegrad

74 %

Begründung:

- Next.js-Webpfad ist der klare Primärpfad.
- Legacy-Fastify ist isoliert.
- Der Knowledge Graph hat jetzt Zielarchitektur und relationales Schema.
- Vollständig produktive DB-Nutzung des Wissensgraphen fehlt noch.

### 3. Designreifegrad

67 %

Begründung:

- Landing, Diagnose und Terminologie sind deutlich besser.
- Grow-Overview und Grow-Log weichen noch spürbar vom Premium- und Calm-Interface-Ziel ab.

### 4. AI-Reifegrad

69 %

Begründung:

- Diagnose und Empfehlungen sind jetzt erklärbarer.
- Confidence und Evidenz sind sichtbar.
- Feedback-Loop und Kalibrierung fehlen.

### 5. Wissenssystem-Reifegrad

71 %

Begründung:

- Es gibt jetzt Zielarchitektur, Migration und explizite Relations-Runtime.
- Grow und Diagnose sind angebunden.
- Die relationale DB-Quelle ist noch nicht produktiv befüllt.

## Größte verbleibende Risiken

1. `wiki_relationships` ist eingeführt, aber noch nicht als produktiv befüllte Runtime-Quelle etabliert.
2. Öffentliche Studienseiten sind weiter primär statisch und noch nicht auf DB-Slugs und DB-Beziehungen umgestellt.
3. Grow -> Diagnose startet ohne Pflanzen- und Grow-Kontext.
4. Diagnose und Empfehlungen haben noch keinen geschlossenen Feedback-Loop.
5. Grow-UI ist funktional stark, aber gestalterisch noch zu dashboard-lastig.
6. Diagnose wird im Verlauf noch als Notiz serialisiert statt als strukturierte Entität.

## Top-10 Prioritäten

1. `studies.slug` produktiv backfillen und `wiki_relationships` befüllen.
2. Öffentliche Studies-Runtime von statischem Datensatz auf relationale Quelle migrieren.
3. Diagnose mit `growId` und `plantId` kontextsensitiv starten.
4. Diagnose als strukturierten Grow-Event-Typ modellieren.
5. Feedback-Signal für Empfehlungen und Diagnosen einführen.
6. Grow Overview vollständig auf semantische Design-Tokens migrieren.
7. Grow Log visuell beruhigen und Badge-/Statussystem vereinheitlichen.
8. Confidence-Werte anhand realer Folgeereignisse kalibrieren.
9. Automatisierte Prüfungen für harte Farb-Utilities auf Kernrouten ergänzen.
10. Automatisierte Prüfungen für Graph-Vollständigkeit und fehlende Studienbeziehungen ergänzen.# Product Maturity Report

Audit-Snapshot: 2026-06-01

## Reifegrade

### 1. Produktreifegrad

82 %

Begründung:

- Der Kernnutzen ist end-to-end benutzbar.
- Grow, Logs, Diagnose, Empfehlungen und Wissen greifen sichtbar ineinander.
- Die größten Risiken liegen nicht mehr in Totalausfällen, sondern in Architektur- und Systemtiefe.

### 2. Architekturreifegrad

76 %

Begründung:

- Web-Primärpfad ist klarer als zuvor.
- Knowledge-Graph-Zielarchitektur ist definiert.
- Der DB-Zielzustand ist noch nicht vollständig produktiv umgesetzt.

### 3. Designreifegrad

68 %

Begründung:

- Mehrere zentrale Komponenten nutzen bereits semantische Tokens.
- Die wichtigsten Grow-Flächen bleiben jedoch visuell inkonsistent und zu hardcode-lastig.

### 4. AI-Reifegrad

74 %

Begründung:

- Diagnose und Empfehlungen sind jetzt deutlich erklärbarer.
- Confidence, Evidenz und Gründe sind sichtbar.
- Feedback-Loops fehlen noch.

### 5. Wissenssystem-Reifegrad

78 %

Begründung:

- Es gibt jetzt eine explizite Zielarchitektur und einen produktiven App-Graph-Layer.
- Die Datenbank ist strukturell vorbereitet.
- Die endgültige DB-betriebene Wissensquelle fehlt noch.

## Größte verbleibende Risiken

1. `wiki_relationships` ist eingeführt, aber noch nicht als produktive Datenquelle befüllt.
2. `studies` ist noch nicht die echte öffentliche Runtime-Quelle für die Studienoberfläche.
3. Grow -> Diagnose verliert weiterhin Pflanzenkontext.
4. Grow Overview und Grow Log verletzen das Design-System noch an zentralen Stellen.
5. Feedback-Loop für Diagnose und Empfehlungen fehlt.
6. Grow-Domänenmodell in `DATABASE.md` und reale Tabellen sind noch nicht vollständig deckungsgleich.

## Top-10 Prioritäten

1. Knowledge-Graph-Migration produktiv anwenden und `wiki_relationships` befüllen.
2. Öffentliche Studies-Runtime von statischem Datensatz auf die relationale Zielarchitektur umstellen.
3. Diagnose mit `growId` und `plantId` kontextualisieren.
4. Grow Overview vollständig auf semantische Design-Tokens migrieren.
5. Grow Log vollständig auf semantische Design-Tokens migrieren.
6. Feedback-Signal für Diagnose und Empfehlungen erfassen.
7. Empfehlungsausführung als strukturierten Outcome im Grow-Verlauf abbilden.
8. Grow-Datenmodell gegen `DATABASE.md` harmonisieren.
9. Admin-/Studies-API auf `slug` und Wissensgraph-Realität erweitern.
10. Legacy-API endgültig aus dem aktiven Systempfad entfernen.

## Kurzfazit

SecretLeaf ist auf einem belastbaren Produktniveau, aber noch nicht auf finalem Systemniveau.

Die größten offenen Themen sind jetzt keine Feature-Lücken mehr, sondern letzte Architektur-, Daten- und Design-Widersprüche.