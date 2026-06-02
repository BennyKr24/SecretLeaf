# Knowledge Coverage KPI

> **North-Star-Metrik des Wissenssystems.** Statt „Wie viele Artikel haben wir?“
> misst diese KPI „Wie viel des diagnostisch relevanten Wissensraums ist
> handbook-grade abgedeckt?“

## 1. Definition

```
Coverage%(Domäne) = handbook-grade Artikel der Domäne / Zieldatensatz der Domäne
```

- **handbook-grade** = veröffentlicht (in `wikiArticles`, d. h. in der
  `GROW_KNOWLEDGE`-Allowlist) **und** `qualityScore >= 4`.
- Die Zielwerte je Domäne stammen aus der
  [Knowledge Coverage Matrix](./KNOWLEDGE_COVERAGE_MATRIX.md).

Die KPI ist **live berechnet**, nicht handgepflegt:
[`apps/web/src/lib/terpira/coverage.ts`](../apps/web/src/lib/terpira/coverage.ts)
→ `computeKnowledgeCoverage()`.

## 2. Diagnostischer Kern

Der **diagnostische Kern** = Nährstoffmängel + Krankheiten + Schädlinge
(Zieldatensatz 36). Er ist die wichtigste Teilmetrik, weil er den Wert der
Diagnose-, Rechner- und AI-Infrastruktur freischaltet. Ziel: **≥ 80 %**.

## 3. Scorecard – Vorher / Nachher (Phase 18)

| Domäne                     | Ziel | Vorher | Nachher Phase 18 |
| -------------------------- | ---- | ------ | ---------------- |
| Nährstoffmängel            | 12   | 0 %    | **42 %** (5/12)  |
| Toxizitäten / Überschüsse  | 6    | 0 %    | 0 %              |
| Krankheiten                | 12   | 0 %    | **25 %** (3/12)  |
| Schädlinge                 | 12   | 0 %    | **25 %** (3/12)  |
| Umwelt- & Klimastress      | 12   | 8 %    | 8 %              |
| Anbautechnik               | 16   | 13 %   | 13 %             |
| Ernte & Nachernte          | 8    | 13 %   | 13 %             |
| Genetik & Vermehrung       | 8    | 0 %    | 0 %              |
| Chemie & Analytik          | 8    | 0 %    | 0 %              |
| **Diagnostischer Kern**    | 36   | **0 %**| **31 %** (11/36) |

> Werte über `computeKnowledgeCoverage()` reproduzierbar. Phase 18 hebt den
> diagnostischen Kern erstmals messbar von 0 % auf 31 %.

## 4. Status-Schwellen

| Status      | Coverage% |
| ----------- | --------- |
| kritisch    | < 25 %    |
| im-aufbau   | 25–49 %   |
| solide      | 50–79 %   |
| stark       | ≥ 80 %    |

## 5. Nutzung im Code

```ts
import { computeKnowledgeCoverage } from "@/lib/terpira/coverage";

const report = computeKnowledgeCoverage();
report.diagnosticCore.coveragePct; // z. B. 31
report.domains.find((d) => d.id === "pests")?.coveragePct; // 25
```

`missingSlugs` je Domäne listet die kanonischen Slugs, die noch nicht
handbook-grade veröffentlicht sind — direkt als Backlog-Steuerung verwendbar.

## 6. Zielkorridor

- Diagnostischer Kern **≥ 80 %**
- Keine Domäne dauerhaft unter **50 %**

Jede neue Produktionswelle (siehe
[Content Production Engine](./CONTENT_PRODUCTION_ENGINE.md)) wird an dieser KPI
gemessen, nicht an der reinen Artikelanzahl.
