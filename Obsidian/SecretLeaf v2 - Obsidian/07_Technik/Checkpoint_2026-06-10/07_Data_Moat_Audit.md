---
tags: [technik, audit, checkpoint, data-moat]
status: Aktiv
verknüpft: ["[[00_Uebersicht]]", "[[06_Data_Moat_Strategie]]", "[[01_Datenstrategie]]", "[[02_Daten_Risiken]]"]
---

# Data Moat Audit — SecretLeaf (Stand 10.06.2026)

> Teil des Checkpoints [[00_Uebersicht]]. Vergleich mit dem strategischen Plan: [[06_Data_Moat_Strategie]], [[01_Datenstrategie]].

## Was wird heute tatsächlich gesammelt?

| Datenquelle | Speicherort | Status |
|---|---|---|
| Grow-Stammdaten (Umgebung, Medium, Licht, Erfahrung, Pflanzenanzahl, Fläche, Plan, Status) | localStorage (`secretleaf.grows.v1`) immer; Supabase `grows` nur theoretisch | **Cloud-seitig praktisch leer** (TD-01) |
| Plant-Daten | localStorage; Supabase `plants` theoretisch | **Cloud-seitig praktisch leer** (TD-01) |
| Log Entries (Wasser/Dünger/Training/Notiz/Tool-Ergebnis) | localStorage immer; Supabase `log_entries` **nur für online hinzugefügte Einträge eingeloggter User** (eigener `crypto.randomUUID()`-Pfad) | Teilweise funktionsfähig |
| Harvest-Daten (`HarvestData`: Gramm, Rating, Notiz) | Teil von `Grow.harvest` (jsonb) | Cloud-seitig praktisch leer (gleiche Ursache) |
| Diagnose-Nutzung (welche Kategorie/Ergebnis) | nicht persistiert (außer als Freitext-Notiz, lokal) | **nicht gesammelt** |
| Knowledge-Events (`view`, `scroll_depth`, `search_query`, `tool_launch`, …) | Supabase `knowledge_events` (partitioniert) | funktionsfähig, aber `diagnostic_launch` ungenutzt |
| Studies/Research-Daten | Supabase `studies` via Automation-Pipelines | funktionsfähig (mit Redundanzen, TD-06) |
| User-Feedback zu Studies (`study_feedback`) | Supabase | funktionsfähig |
| Analytics-Events (Plausible: growCreated, logEntryAdded, toolUsed, phaseAdvanced, harvestRecorded, newsletterSignup, wikiArticleOpened) | Plausible (extern, Status der Aktivierung unverifiziert, TD-21) | bedingt aktiv |
| Fehler/Exceptions | console.error only (Sentry inaktiv, TD-20) | **nicht systematisch gesammelt** |
| Newsletter-Signups | console.log only | **nicht gesammelt** (TD-22) |
| Fotos (Pflanzen, Diagnose-Bilder) | nicht implementiert | **nicht gesammelt** (TD-17) |
| Community-Grow-Daten | nicht implementiert | **nicht gesammelt** (TD-18) |

## Kernbefund
Der **wertvollste Datensatz für einen Data Moat — reale, longitudinale Grow-Verläufe eingeloggter User (Plan vs. tatsächlicher Verlauf, Logs, Harvest-Ergebnisse, Korrelation mit Umgebung/Medium/Licht)** — landet aufgrund von TD-01/TD-02 **server-seitig fast nirgends**. Diese Daten existieren zwar im Browser des jeweiligen Users (localStorage), sind also potenziell vorhanden, aber für SecretLeaf als Unternehmen nicht zentral auswertbar, solange der UUID-Bug besteht. Dies ist der mit Abstand größte Data-Moat-Risiko-Faktor — siehe auch [[02_Daten_Risiken]].

## Was fehlt für die geplanten Engines?

### Similarity Engine (ähnliche Grows/User finden)
Benötigt: vollständige, vergleichbare Grow-Profile (Umgebung, Medium, Licht, Erfahrung, Pflanzenanzahl, Fläche) + Verlaufsdaten (Logs, Phasenwechsel-Zeitpunkte) über viele User hinweg in Supabase.
- **Fehlt**: zentrale Speicherung der Grow-Stammdaten (TD-01), Plant-/Phase-Verlaufsdaten, einheitliche Normalisierung (z. B. `licht_leistung` in Watt vs. Lampentyp-Kategorien).
- **Vorhanden**: Datenmodell (Spaltenstruktur in `grows`/`plants`/`log_entries`) ist grundsätzlich geeignet, sobald TD-01 behoben ist.

### Recommendation Engine (Empfehlungen für Tasks/Tools/Artikel)
Teilweise vorhanden über `lib/grow/insights.ts` (statisch, regelbasiert, kein Lernen) und `knowledge_recommend_tools` (Tag-/Kategorie-basiert).
- **Fehlt**: Feedback-Loop — ob ein User eine Empfehlung tatsächlich genutzt hat (außer `knowledge_events`, das aber nicht an Grow-Kontext gekoppelt ist). Keine Verknüpfung zwischen `knowledge_events.user_id` und `grows`/`log_entries` für personalisierte Empfehlungen.

### Prediction Engine (z. B. Ertragsprognose, Probleme vorhersagen)
- `lib/grow/intelligence.ts::getPotentialYield()` ist eine simple Heuristik (30g/Pflanze × Phasenfaktor) — **kein ML, keine Trainingsdaten**.
- **Fehlt**: historische Paare (Plan-Eingaben → tatsächlicher Ertrag aus `harvest`), die als Trainingsdaten für ein echtes Modell dienen könnten — diese Paare entstehen aktuell gar nicht serverseitig (TD-01).
- **Fehlt**: Diagnose-Outcome-Daten (welche Diagnose führte zu welcher Maßnahme/welchem Ergebnis) — Diagnose-Flow ist komplett von der Cloud-Persistenz isoliert (DL-09).

### Outcome Engine (was hat funktioniert, was nicht)
- Benötigt verknüpfte Zeitreihen: Maßnahme (Log Entry) → Reaktion (folgende Logs/Health-Score-Veränderung) → Endergebnis (Harvest).
- **Fehlt fast vollständig**: ohne TD-01-Fix existieren weder Grow- noch Harvest-Daten zentral; selbst die online gespeicherten Log Entries sind ohne zugehörigen Grow-Datensatz (da `grows` leer) schwer auswertbar (FK `log_entries.grow_id` zeigt auf nicht-existente Zeilen, falls `grows`-Insert fehlschlägt aber `log_entries`-Insert für denselben `growId` über den Online-Pfad erfolgreich war — potenzieller orphaned-data-Zustand, da `grows.id` clientseitig generiert und nie in Supabase existiert, aber `log_entries.grow_id` darauf verweist und FK `grow_id → grows(id)` dies eigentlich verhindern müsste; **vermutlich schlägt auch der `log_entries`-Insert mit FK-Verletzung fehl**, wenn der referenzierte `grows.id` nicht existiert — zusätzliche Bestätigung, dass TD-01 die Grow-Datensammlung praktisch komplett blockiert).

## Priorisierte Empfehlungen für den Data Moat (Dokumentation, kein Fix)
1. **TD-01/TD-02 beheben** — Voraussetzung für jede der vier Engines; ohne diesen Fix sammelt SecretLeaf praktisch keine longitudinalen Grow-Daten.
2. **Diagnose-Flow an Cloud-Sync und Analytics anschließen** (DL-09) — liefert Outcome-/Recommendation-Trainingsdaten.
3. **Harvest-Daten als eigenständiges, abfragbares Format** statt `jsonb`-Blob in `grows.harvest` erwägen (erleichtert Aggregation für Prediction Engine) — derzeit nur eine Produktidee, keine akute Maßnahme.
4. **Foto-Daten (TD-17)** sind langfristig für eine Diagnose-/Similarity-Engine wertvoll (visuelle Ähnlichkeit, Krankheitsbilder), aber komplett blockiert auf Storage-Infrastruktur.
5. **Sentry/Monitoring (TD-20)** reaktivieren — ohne Fehler-Tracking bleiben Datenverlust-Bugs wie TD-01 unsichtbar, bis sie (wie hier) manuell auditiert werden.

## Verknüpfte Dokumente

[[00_Uebersicht]]
[[06_Data_Moat_Strategie]]
[[01_Datenstrategie]]
[[02_Daten_Risiken]]
