# SecretLeaf Master Alignment Report

Stand: 2026-06-01

## Scope
Abgleich gegen:
- PRODUCT.md
- DESIGN_SYSTEM.md
- LOCALIZATION.md
- ARCHITECTURE.md
- DATABASE.md
- AI_SYSTEM.md
- WIKI_ARCHITECTURE.md
- AGENTS.md

## Direkt umgesetzte Fixes (dieser Lauf)

### 1) Design-System / Dark-Mode als Standard
- `apps/web/src/app/globals.css`
- Standard-Token auf Premium-Dark umgestellt (`--bg: #05070a`, `--surface: #0a1115`, `--primary: #22c55e`).
- `.dark` auf denselben Zielzustand harmonisiert, damit Klassenzustand und Default konsistent sind.
- Skeleton-Farbverlauf auf Dark-Default angepasst.

### 2) CTA-Token-Konsistenz
- `apps/web/src/components/ui/CTAButton.tsx`
- Primary-Variant von Hardcodes (`emerald-600/700`) auf Design-Variablen migriert (`var(--primary)`, `var(--primary-dark)`).
- Focus-Ring auf `var(--ring)` umgestellt.

### 3) Lokalisierung (Deutsch) – schnelle Präzisionskorrekturen
- `apps/web/messages/de.json`
- CTA von "Jetzt starten →" auf "Grow starten →" (Verb + Objekt).

- `apps/web/src/app/[locale]/page.tsx`
- Umlaute/Fachsprache korrigiert (u.a. Blüte, Bewässerung, Nächste Aufgabe, Düngen, Übersicht, Aktivität, über, frühzeitig, geprüfter, tägliche, Priorität, Fälligkeit, Wöchentliche).

### 4) Design-System in Diagnose-Flow integriert
- `apps/web/src/components/diagnose/DiagnoseFlow.tsx`
- Light/Neutral-Hardcodes auf semantische Klassen migriert (`bg-card`, `border-border`, `text-foreground`, `text-muted-fg`, `bg-primary/10`).

## Validierung
- Lint (gezielte Dateien): bestanden
- Typecheck (`apps/web`): bestanden

## Verifizierte kritische Rest-Gaps

### A) Datenmodell-Split (kritisch)
- `apps/api/prisma/schema.prisma` nutzt SQLite und ein Marketplace-Domänenmodell (`User/Listing/Purchase/AuditLog`).
- Widerspruch zu Supabase-First und Grow-OS-Domain in DATABASE.md/ARCHITECTURE.md.

### B) Architektur-Hybrid API (hoch)
- Parallelbetrieb von Legacy Fastify (`apps/api`) und Next Route Handlern (`apps/web/src/app/api`).
- Erfordert Zielentscheidung + Migrationsplan.

### C) AI-Diagnose noch deaktiviert (mittel)
- `apps/web/src/app/api/diagnose/route.ts` liefert 501 (Scaffold/TODO).
- Der produktive Diagnosefluss ist regelbasiert (`apps/web/src/components/diagnose/DiagnoseFlow.tsx`).

### D) Wissenssystem-Integration unvollständig (mittel)
- Wiki-Regelsystem vorhanden (`apps/web/src/data/terpira/wikiContextMapping.ts`),
  aber vollständige Graph-/Relationship-Nutzung in allen relevanten Flows ist noch nicht durchgängig nachweisbar.

## Priorisierte nächste Schritte
1. Prisma-Legacy entfernen oder auf Supabase-Domain migrieren; ADR in ARCHITECTURE.md ergänzen.
2. Zielarchitektur fixieren (Next-only oder klarer Bounded Context) und parallel laufende API-Pfade konsolidieren.
3. Diagnose-Strategie entscheiden: echte AI (mit strukturiertem Output + Guardrails) oder offiziell deterministisch dokumentieren.
4. Knowledge-Graph-Nutzung messbar machen (relationship-driven recommendations in Grow- und Diagnose-Context).
5. Zweite Runde Design-Token-Migration: verbleibende Hardcodes in Landing- und Admin-UI entfernen.

## Ergebnisstatus
- Phase 1 Quick Wins: umgesetzt
- Phase 2/3 Teilumsetzung: umgesetzt
- Phase 4-7 (Architektur, DB, AI, Wissen): analysiert und priorisiert, Umsetzung offen
- Phase 8 Abschlussbericht: dieser Report

---

## Update 2026-06-01 (Autonomous Alignment Run 2)

### Direkt umgesetzt

1) Architektur-Entkopplung im Root und CI
- Root-Defaults laufen nun nur auf dem primären Produktpfad `apps/web`.
- Legacy-API ist explizit über eigene Scripts aufrufbar (`legacy:api:*`).
- CI validiert nur den primären Produktpfad.
- Legacy-API-Skripte sind zusätzlich per `LEGACY_API_ENABLED=1` gated.

2) Legacy-Strategie formalisiert
- Verbindliche Legacy-Entscheidung mit Zweck, Migrationsplan und Enddatum in ARCHITECTURE.md ergänzt.
- Legacy-Hinweisdatei für `apps/api` ergänzt.

3) Diagnose-API von 501 auf strukturierte Antwort umgestellt
- `apps/web/src/app/api/diagnose/route.ts` liefert nun erklärbare, strukturierte, regelbasierte Diagnoseantworten.
- Enthält Problem, Ursache, Begründung, Empfehlungen, Confidence-Score, Evidence-Level und Modellangabe.

4) Diagnose-UI Design-System-Angleichung
- `apps/web/src/components/diagnose/DiagnoseResult.tsx` auf semantische Design-Tokens migriert.

### Verbleibende Top-Risiken

- Prisma/SQLite-Schema in `apps/api` existiert weiterhin als technischer Altbestand.
- Wissensgraph-Nutzung ist weiterhin nicht vollständig im gesamten Produktfluss integriert.
- Diagnose-Route ist aktuell regelbasiert, kein produktiver Vision/LLM-Pfad aktiv.

---

## Update 2026-06-01 (Autonomous Alignment Run 3)

### Direkt umgesetzt

1) Knowledge Graph im Grow-Flow aktiviert
- `apps/web/src/components/grow/GrowKnowledgePanel.tsx` integriert das bestehende Regelwerk aus `wikiContextMapping.ts` erstmals in den aktiven Grow-Workflow.
- Grow-Zustand, Log-Lücke, Wasser-Gap, Streak, Phasenübergang und Task-Druck lösen jetzt direkt passende Fachartikel aus.

2) Diagnose mit Studienbeziehungen verbunden
- `apps/web/src/components/diagnose/DiagnoseResult.tsx` zeigt jetzt passende Fachartikel/Studien an.
- Die erste Relationsebene ist produktiv sichtbar, statt nur implizit im Datensatz zu existieren.

3) Tool-Ergebnisse fließen in Grow OS zurück
- `apps/web/src/components/tools/SaveToGrowButton.tsx` ist kein Platzhalter mehr.
- Tool-Resultate können jetzt als `tool_result` ins Grow-Log geschrieben und bei Login nach Supabase synchronisiert werden.

4) Terminologie- und Routing-Konsistenz verbessert
- Tote `/wiki/*`-Links im Grow-Flow wurden auf `/studies/*` korrigiert.
- Sichtbare `Wiki`-Terminologie in Suche, Studienseiten, Status und Assistent wurde auf `Studien`, `Fachartikel` oder `Studien-Assistent` umgestellt.

5) Knowledge-Graph-Lücken dokumentiert
- Neuer Audit: `KNOWLEDGE_GRAPH_AUDIT.md`

### Verbleibende Top-Risiken

- `wiki_relationships` aus DATABASE.md ist weiterhin nicht produktiv im App-Flow nachweisbar.
- Diagnose -> Studien-Verknüpfungen sind aktuell heuristisch, noch nicht taxonomie- oder DB-getrieben.
- Interne Domain-Namen (`wiki` in Search/Knowledge-Datensätzen) sind noch nicht vollständig fachlich konsolidiert.

---

## Update 2026-06-01 (Strategic Alignment Run 4)

### Direkt umgesetzt

1) Konkrete Zielarchitektur für den Knowledge Graph festgeschrieben
- Neuer Zielzustand in `KNOWLEDGE_GRAPH_TARGET_ARCHITECTURE.md`.
- Definiert stabilen `slug`, relationale Kanten, Explainability-Vertrag und den kleinsten produktiven Zwischenzustand.

2) DB-Schema auf relationale Wissensverknüpfungen ausgerichtet
- Neue Migration `202606010012_knowledge_graph_alignment.sql`.
- `studies` erhält den stabilen Schlüssel `slug` sowie Brückenfelder für Summary, Difficulty, Source Count und Confidence Score.
- `wiki_relationships` wird als kanonische Graph-Tabelle eingeführt.

3) Grow- und Diagnose-Verknüpfungen auf expliziten Graph-Layer umgestellt
- Neuer Runtime-Layer `apps/web/src/lib/knowledge/graph.ts`.
- Grow-Empfehlungen und Diagnose-Wissensbezüge werden jetzt aus expliziten Beziehungen statt verteilten Heuristik-Mappings aggregiert.

4) AI-Explainability in produktiven Oberflächen erhöht
- `SmartInsights` und Log-Insights zeigen jetzt Grund, Evidenz, Confidence und erwarteten Nutzen.
- `DiagnoseResult` zeigt jetzt numerische Confidence, Evidence Level und graph-basierte Studienbezüge.
- Diagnose-API liefert `sources` aus den zugehörigen Studienkanten.

5) Grow-OS-Kernbruch im Online-Pfad behoben
- Authentifizierte Grows verloren Pflanzenzustand über Supabase-Rehydration.
- `apps/web/src/lib/grow/db.ts` und `apps/web/src/hooks/useGrowState.ts` laden und synchronisieren Pflanzen jetzt serverseitig korrekt.

6) Diagnose -> Grow-Log Datenkontinuität verbessert
- Gespeicherte Diagnose-Notizen enthalten jetzt Confidence, Evidenz und verknüpfte Studien.

7) Strategische Audits und Reifegradbericht ergänzt
- Neu:
    - `GROW_OS_AUDIT.md`
    - `AI_ALIGNMENT_REPORT.md`
    - `DESIGN_SYSTEM_AUDIT.md`
    - `PRODUCT_MATURITY_REPORT.md`

### Aktuelle Top-Risiken

- `wiki_relationships` ist eingeführt, aber noch nicht als produktiv befüllte DB-Runtime im Frontend aktiv.
- Öffentliche Studienseiten hängen weiterhin primär an statischen Studiendaten.
- Grow -> Diagnose startet weiterhin ohne Pflanzen- oder Grow-Kontext.
- Grow-Overview und Grow-Log verletzen weiterhin Teile des Design Systems durch harte Utility-Farben und hohe visuelle Dichte.
- Diagnose und Empfehlungen besitzen noch keinen geschlossenen Feedback-Loop.

### Validierung

- `npm run lint --workspace @secretleaf/web`: bestanden
- `npm run typecheck --workspace @secretleaf/web`: bestanden
- `npm run build --workspace @secretleaf/web`: bestanden

---

## Update 2026-06-01 (Strategic Alignment Run 4)

### Direkt umgesetzt

1) Knowledge-Graph-Zielarchitektur definiert
- Neues Zielbild in `KNOWLEDGE_GRAPH_TARGET_ARCHITECTURE.md`.
- Klarer Zwischenzustand festgelegt: `studies.slug` + `wiki_relationships` + expliziter Runtime-Graph.

2) DB-Alignment für den Wissensgraphen vorbereitet
- Neue Migration `supabase/migrations/202606010012_knowledge_graph_alignment.sql`.
- Fügt `slug`-Brücke zu `studies` hinzu und führt `wiki_relationships` als kanonische Graph-Tabelle ein.

3) Grow- und Diagnose-Relationen auf expliziten Graph-Layer umgestellt
- Neuer App-Layer in `apps/web/src/lib/knowledge/graph.ts`.
- Grow-Empfehlungen und Diagnose-Wissensbezüge basieren jetzt auf expliziten Beziehungen statt auf verteilten Heuristiken.

4) Explainability sichtbar gemacht
- Grow-Empfehlungen liefern jetzt Grund, Evidenz, Confidence und erwarteten Nutzen.
- Diagnose zeigt numerischen Confidence-Score, Evidenz und relationale Studienbezüge.

5) Grow-OS-Kernbruch im Online-Pfad behoben
- Pflanzen werden im authentifizierten Pfad jetzt aus Supabase mitgeladen.
- Pflanzen-Rename und Pflanzennotizen werden online synchronisiert.

6) Design-System auf Diagnose-Endzustand nachgeschärft
- Harte Statusfarben in `DiagnoseResult` reduziert und näher an semantische Tokens geführt.

### Neue Audits / Berichte

- `GROW_OS_AUDIT.md`
- `AI_ALIGNMENT_REPORT.md`
- `DESIGN_SYSTEM_AUDIT.md`
- `PRODUCT_MATURITY_REPORT.md`

### Verbleibende Top-Risiken

- `wiki_relationships` ist strukturell eingeführt, aber noch nicht die produktiv befüllte DB-Quelle.
- `studies` ist noch nicht die öffentliche Runtime-Quelle für die Studienoberfläche.
- Grow -> Diagnose verliert weiterhin Pflanzenkontext.
- Grow Overview und Grow Log bleiben die größten Design-System-Ausreißer.
- Feedback-Loops für Diagnose und Empfehlungen fehlen weiterhin.
