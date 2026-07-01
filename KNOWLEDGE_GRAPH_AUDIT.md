# SecretLeaf Knowledge Graph Audit

Stand: 2026-06-01

## Scope
Abgleich gegen:
- WIKI_ARCHITECTURE.md
- DATABASE.md
- AI_SYSTEM.md
- aktive Grow-, Diagnose-, Such- und Studien-Flows in apps/web

## Verifizierter Ist-Zustand

### Bereits vorhanden
- Statische Wissensbasis in `apps/web/src/data/terpira/wiki.ts`
- Direkte Artikelbeziehungen über `relatedSlugs`
- Grow-Kontext-Regelwerk in `apps/web/src/data/terpira/wikiContextMapping.ts`
- Grow-Empfehlungen über `apps/web/src/lib/grow/insights.ts`
- Regelbasierte Diagnose mit strukturierter Ausgabe in `apps/web/src/app/api/diagnose/route.ts`

### Vor diesem Lauf fehlende oder gebrochene Relationen
1. Grow -> Knowledge Context
- `resolveActiveRule()` war implementiert, aber im Produktfluss ungenutzt.
- Folge: Grow-Zustand, Log-Lücken, Wasser-Gaps, Phasenwechsel und Health-Score hatten keine direkte Wissensausspielung.

2. Diagnose -> Studien
- Diagnose-Ergebnisse hatten Ursachen, Empfehlungen und Tool-Links, aber keine direkten Fachartikel-/Studienbeziehungen.
- Folge: Diagnose stoppte vor dem Wissensgraphen.

3. Tool -> Grow Log
- Tool-Ergebnisse hatten mit `tool_result` bereits einen Log-Typ, aber der sichtbare CTA `In Grow speichern` war nur ein Platzhalter.
- Folge: Rechenresultate konnten nicht in den Grow-Workflow zurückfließen.

4. Studien-Linking im Grow-Flow
- Grow-Insights und Log-Insights verlinkten teils auf `/wiki/[slug]`, obwohl im aktiven Produktpfad nur `/studies/[slug]` existiert.
- Folge: Wissen war an einzelnen Stellen verknüpft, aber nicht zuverlässig erreichbar.

5. Produktterminologie
- Sichtbare Kernflächen verwendeten weiterhin `Wiki`, obwohl die Produktoberfläche im Primärpfad `Studien` und `Fachartikel` zeigt.
- Folge: Inkonsistente Begriffe zwischen Route, Navigation, Suche und Content-Oberfläche.

## Direkt umgesetzt in diesem Lauf

### 1) Grow -> Knowledge live verdrahtet
- Neue Komponente `apps/web/src/components/grow/GrowKnowledgePanel.tsx`
- Nutzt `resolveActiveRule()` mit realem Grow-Kontext:
  - Log-Abstand
  - Wasser-Abstand
  - Health-Score
  - Streak
  - überfällige Aufgaben
  - Phasenende
- Spielt priorisierte Fachartikel direkt auf der Grow-Übersicht aus.
- Dedupliziert lokal via 48h-Fenster, damit Hinweise nicht dauernd wiederholt werden.

### 2) Diagnose -> Studien verknüpft
- Neue Hilfsdatei `apps/web/src/lib/diagnose/knowledge.ts`
- `DiagnoseResult` zeigt jetzt passende Studien-/Fachartikel für Mangel-, Stress- und Schädlingsfälle an.

### 3) Tool -> Grow Log aktiviert
- `apps/web/src/components/tools/SaveToGrowButton.tsx` schreibt jetzt echte `tool_result`-Einträge ins Grow-Log.
- Bei eingeloggten Nutzern wird zusätzlich nach Supabase synchronisiert.

### 4) Dead Links entfernt
- Grow-Insights und Log-Insights verlinken jetzt korrekt auf `/studies/[slug]`.

### 5) Nutzerseitige Terminologie bereinigt
- Suche, Studienseiten, Statusseite, Grow-Wissenspanel und Assistent nutzen jetzt primär `Studien`, `Fachartikel` oder `Studien-Assistent` statt `Wiki`.

## Verifizierte Rest-Gaps

### A) Kein produktiv genutzter DB-Graph
- DATABASE.md definiert `wiki_relationships` als kanonischen Teil der Knowledge Domain.
- In der aktiven App-Nutzung ist keine produktive Verwendung dieser Tabelle verifiziert.
- Der Graph bleibt aktuell primär statisch in `wiki.ts` und regelbasiert im Frontend.

### B) Diagnose-Relationen sind noch heuristisch
- Die neuen Diagnose -> Studien-Verknüpfungen basieren aktuell auf Resultatfamilien, nicht auf einer zentralen Taxonomie oder DB-Relation.

### C) Interne Such-Typen bleiben historisch
- Die Search-Engine verwendet intern weiterhin den Typ `wiki`.
- Sichtbare Labels wurden bereinigt, aber ein sauberer Domain-Rename auf API- und Datentypebene steht noch aus.

### D) Grow-Knowledge-Memory ist lokal
- Deduplizierung für Grow-Wissenshinweise liegt aktuell in localStorage.
- Es gibt noch keinen serverseitigen Knowledge-Exposure-Status pro Nutzer/Grow.

### E) Knowledge-Type-Modell nicht end-to-end nachgewiesen
- WIKI_ARCHITECTURE.md fordert strukturierte Content-Typen und verpflichtende Beziehungen.
- In der aktiven UI-Nutzung dominieren derzeit `wikiArticles`, `relatedSlugs` und kontextuelle Regeln.
- Ein vollständiger, durch Datenmodell und UI nachweisbarer Graph über `Study`, `Tool`, `Diagnosis Pattern`, `Environment`, `Deficiency`, `Pest` und `Growth Stage` ist noch nicht produktiv sichtbar.

## Priorisierte nächste Schritte
1. `wiki_relationships` produktiv anbinden und die Diagnose-/Grow-Beziehungen aus einer kanonischen Relationstabelle statt aus Heuristiken lesen.
2. Den internen Search-Kind `wiki` fachlich auf `study` oder `knowledge` migrieren, sobald API- und UI-Verträge sauber umgestellt werden können.
3. Knowledge-Exposure und Seen-State serverseitig modellieren, damit Grow-Wissenshinweise team- und geräteübergreifend konsistent werden.
4. Diagnose-Resultate um explizite Entitäten erweitern: `deficiency`, `toxicity`, `pest`, `environment`, `recommended_tools`, `related_studies`.
5. Grow- und Diagnose-Kontext mittelfristig aus Supabase-Tabellen statt aus statischen Frontend-Datensätzen ableiten.

## Ergebnis
- Knowledge Graph ist nicht mehr nur dokumentiert, sondern erstmals sichtbar im Grow- und Diagnose-Produktpfad verdrahtet.
- Die Architektur bleibt jedoch noch hybrid: statische Wissensdaten + heuristische Beziehungen + fehlende DB-Graph-Nutzung.