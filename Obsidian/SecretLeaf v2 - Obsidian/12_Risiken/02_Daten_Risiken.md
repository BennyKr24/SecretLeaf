# Daten Risiken

## Zweck

Dieses Dokument definiert Risiken rund um den Data Moat von SecretLeaf.

## Zusammenfassung

Der größte Vermögenswert von SecretLeaf sind Daten.

Deshalb gehören Datenrisiken zu den kritischsten Unternehmensrisiken.

## Risiko 1 – Niedrige Datenqualität

Beschreibung:

Unvollständige oder falsche Eingaben.

Folgen:

- schlechte KI
    
- schlechte Benchmarks
    

Gegenmaßnahme:

Strukturierte Datenerfassung.

---

## Risiko 2 – Zu wenig Daten

Beschreibung:

Zu wenige aktive Grower.

Folgen:

- schwacher Data Moat
    

Gegenmaßnahme:

MAG priorisieren.

---

## Risiko 3 – Schlechte Verknüpfung

Beschreibung:

Daten existieren, sind aber nicht verbunden.

Folgen:

- geringe Nutzbarkeit
    

Gegenmaßnahme:

Knowledge Graph.

---

## Risiko 4 – Dateninseln

Beschreibung:

Informationen liegen getrennt.

Folgen:

- keine Wiederverwendbarkeit
    

Gegenmaßnahme:

Ein zentrales Datenmodell.

---

## Risiko 5 – Grow-Daten erreichen die Datenbank nicht (akut, Stand 10.06.2026)

Beschreibung:

Durch einen UUID-Format-Bug (TD-01/TD-02, siehe [[06_Technical_Checkpoint_2026-06-10]]) werden Grow-, Pflanzen- und Erntedaten eingeloggter User aktuell **nicht** in Supabase gespeichert. Sie existieren nur lokal (localStorage) im jeweiligen Browser.

Folgen:

- Der zentrale Data Moat (longitudinale Grow-Verläufe) ist praktisch leer
- Similarity-, Recommendation-, Prediction- und Outcome-Engines haben keine Trainingsdaten
- Datenverlust bei Browserwechsel/-löschung für alle Nutzer

Gegenmaßnahme:

`generateId()` auf `crypto.randomUUID()` umstellen + Migrationsstrategie für Bestandsdaten (TD-01/TD-02, DL-01). Noch nicht umgesetzt.

## Verknüpfte Dokumente

[[06_Data_Moat_Strategie]]

[[01_Datenstrategie]]

[[00_Knowledge_Graph]]

[[06_Technical_Checkpoint_2026-06-10]]