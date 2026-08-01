# SecretLeaf Knowledge Graph Target Architecture

Zielarchitektur-Snapshot: 2026-06-01

Hinweis 2026-07-01: Zielarchitektur-Snapshot. Der Grow-Persistenz-Blocker aus Juni ist geschlossen; Event-, Outcome- und Knowledge-Graph-Integration bleiben geplante Folgearbeit.

## Ziel

Die Wissensverknüpfung in SecretLeaf darf nicht mehr aus verteilten Slug-Boosts, Diagnose-Sonderfällen und UI-spezifischen Mappings bestehen.

Zielzustand:

- Ein kanonischer Wissensgraph mit stabilen Schlüsseln
- Explizite Beziehungen statt impliziter Heuristiken
- Einheitliche Nutzung in Grow, Diagnose und Empfehlungen
- Erklärbare Ausgabe mit Confidence, Evidenz und Beziehungsgrund

## Soll-Architektur

### 1. Knotenmodell

Primäre Knotenarten:

- `study`
- `diagnosis_pattern`
- `grow_phase`
- `grow_medium`
- `grow_signal`
- `log_type`
- `task_category`
- `tool`
- `context_rule`

Langfristig werden diese Knoten in `wiki_entries` normalisiert. Bis zur vollständigen Migration bleibt `studies.slug` der stabile Einstiegsschlüssel für user-facing Fachartikel.

### 2. Kantenmodell

Kanonische Tabelle:

- `public.wiki_relationships`

Pflichtfelder:

- `source_slug`
- `source_type`
- `target_slug`
- `target_type`
- `relation_type`
- `weight`
- `confidence_score`
- `evidence_level`
- `explanation`
- `metadata`

### 3. Beziehungstypen

Produktiv benötigt:

- `related`
- `supports_diagnosis`
- `supports_recommendation`
- `supports_context_rule`
- `recommends_tool`
- `maps_task_category`

### 4. Domänenfluss

#### Studien

- User-facing Fachartikel bleiben über `slug` adressierbar.
- `relatedSlugs` aus dem statischen Datensatz werden als explizite `related`-Kanten interpretiert.

#### Diagnose

- Diagnose-Ergebnisse referenzieren nicht mehr nur hart codierte Slug-Listen.
- Stattdessen werden `diagnosis_pattern -> study` und `diagnosis_pattern -> tool` Kanten ausgewertet.

#### Grow

- Grow-Empfehlungen entstehen aus der Aggregation expliziter Kanten von:
  - `grow_phase`
  - `grow_medium`
  - `log_type`
  - `task_category`
  - `context_rule`

- Die Empfehlungsausgabe enthält:
  - Grund
  - Priorität
  - Erwarteter Nutzen
  - Confidence Score
  - Evidence Level

### 5. Explainability-Vertrag

Jede ausgegebene Diagnose oder Empfehlung muss mindestens liefern:

- `reason`
- `confidenceScore`
- `evidenceLevel`
- mindestens eine konkrete Wissensverknüpfung

### 6. Stop-Grenze dieses Laufs

Vollständige Normalisierung auf `wiki_entries` wäre ein größerer Umbau.

Dieser Lauf setzt deshalb den kleinsten produktiven Zwischenzustand um:

- `studies` erhält den stabilen Schlüssel `slug`
- `wiki_relationships` wird als kanonische Graph-Tabelle eingeführt
- Die Runtime nutzt einen expliziten Graph-Layer mit derselben Tabellenform
- Grow und Diagnose werden auf diesen Graph-Layer umgestellt

Damit wird die Heuristik-Schicht durch eine relationale Integrationsschicht ersetzt, ohne die gesamte Studien-Renderpipeline in einem Schritt neu zu bauen.