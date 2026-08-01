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

## Risiko 5 – Grow-Daten erreichen die Datenbank nicht (geschlossen, Stand 01.07.2026)

Beschreibung:

Durch einen UUID-/Session-/Redirect-Fehler (TD-01/TD-02, siehe [[06_Technical_Checkpoint_2026-06-10]]) wurden Grow-, Pflanzen- und Erntedaten eingeloggter User nicht zuverlässig in Supabase gespeichert. Dieser akute Datenverlustpfad wurde am 01.07.2026 geschlossen; aktueller Nachweis siehe [[Checkpoint_2026-07-01_Persistence_Recovery]].

Folgen:

- Der zentrale Data Moat kann jetzt Grow-Verläufe aufnehmen
- Similarity-, Recommendation-, Prediction- und Outcome-Engines benötigen weiterhin strukturierte Events, Harvest-Daten und Outcome-Follow-ups
- Datenverlust bei Browserwechsel/-löschung ist für bestätigte, eingeloggte Nutzer im Kernflow nicht mehr der bekannte Standardfehler

Gegenmaßnahme / Status:

Supabase Session als Auth-Single-Source, serverseitige Persistenz vor Navigation, kein lokaler Phantom-Grow im authentifizierten Pfad, Log-Sync nach Supabase. Status: umgesetzt und runtime-verifiziert am 01.07.2026.

## Verknüpfte Dokumente

[[06_Data_Moat_Strategie]]
[[Checkpoint_2026-07-01_Persistence_Recovery]]

[[01_Datenstrategie]]

[[00_Knowledge_Graph]]

[[06_Technical_Checkpoint_2026-06-10]]