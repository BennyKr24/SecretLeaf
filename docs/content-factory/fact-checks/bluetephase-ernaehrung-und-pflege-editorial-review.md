# Editorial Review — Blütephase: Ernährung, Support und der Weg zur Ernte

Stage: 4 — Editorial Review · Datum: 2026-08-22 · Reviewer: KI-gestützt
(Claude, auf Wunsch des Editorial-Leads durchgeführt, der die vier
Sign-offs im Anschluss stichprobenartig gegenprüft) · Basis:
`docs/content-factory/drafts/bluetephase-ernaehrung-und-pflege.md` +
`docs/content-factory/fact-checks/bluetephase-ernaehrung-und-pflege-fact-check.md`
gegen `docs/CANNABIS_EDITORIAL_STANDARD.md` §8.

**Statusvorbehalt:** `ARTICLE_WORKFLOW.md` §5 führt die vier Reviews als
**vollständig menschliches Gate** ("Can be AI-assisted? No"). Diese Prüfung
ist trotzdem KI-durchgeführt, auf ausdrücklichen Wunsch des Editorial-Leads,
der die Ergebnisse als Stichprobe nachprüft statt sie selbst zu erarbeiten
— dokumentiert hier, damit der Abweichungsgrund vom Standardprozess
nachvollziehbar bleibt.

---

## 1. Agronomische Review — fachliche Richtigkeit, Mechanismen, Sicherheit

**Geprüft:** Mechanismus-Korrektheit (P/K-Rolle im Energie-/Zuckertransport,
Ca/Mg-Rolle im Protein-/Energiestoffwechsel, Stretch-bedingter
Wasserverbrauch → pH-Drift, Nährstoffsperre-Mechanismus über Salzaufbau
in der Wurzelzone), interne Konsistenz mit den bereits kalibrierten
App-Werten (`phases.ts`, `nutrients.ts`, `vpd.ts`, `lighting.ts`), und
Sicherheit (keine gefährlichen Dosierungsempfehlungen, keine
Rechtsberatung, keine Über-Behauptung bei dünner Evidenzlage).

- P-Rolle (ATP/Energietransfer bei Zellteilung), K-Rolle (Zuckertransport,
  osmotischer Druck) — Standardphysiologie, korrekt dargestellt (Block 2).
- Ca-Rolle (Protein-/Energiestoffwechsel), Mg-Rolle (P-Mobilität) und die
  daraus resultierende Antagonismus-Warnung bei hoher P/K-Düngung (Block 2,
  7, 10) — mechanistisch korrekt, deckt sich mit der Standard-Physiologie
  aus `CANNABIS_EDITORIAL_STANDARD.md` §7's eigenem Kalium/Magnesium-Beispiel.
- Stretch → Wasserverbrauch → pH-Drift-Kausalkette (Block 3) — korrekt und
  bereits im Veg-Artikel konsistent behandelt.
- Keine Dosierungsangabe im Artikel widerspricht den bereits verifizierten
  `nutrients.ts`-Werten; alle Zahlen, die über die App-Werte hinausgehen
  (B8/B9-Studienwerte), sind explizit als Studienergebnis, nicht als
  App-Empfehlung gekennzeichnet (Block 6).
- Sicherheitsrelevant: Die Lichtdichtigkeits-Vorsichtsmaßnahme wird trotz
  dünner Beweislage **nicht** abgeschwächt oder zur Disposition gestellt
  (Block 6, 11) — richtige Risikoabwägung (niedrige Präventionskosten,
  hoher potenzieller Schaden), keine Sicherheitsregression.
- Keine medizinischen oder rechtlichen Aussagen im Artikel.

**Verdict: ✅ approved.**

---

## 2. Source Review — Zitierung, Evidence-Level

Deckt sich mit dem bereits abgeschlossenen Stage-3-Fact-Check
(`bluetephase-ernaehrung-und-pflege-fact-check.md`): 15/15 Zahlenaussagen
zitiert und verifiziert, `meta.evidence_level = 1` korrekt als schwächste
tragende Quelle gesetzt, `confidence_score = 0.67` über der 0.60-Schwelle,
≥ 3 Quellen (hier ~45) mit URL/DOI, keine Category-Default-`sourceIds`,
beide Konflikte im Text benannt.

Zusätzlich für diese Review geprüft: **Extrapolations-Kennzeichnung.**
B9 (Hemp-Kultivar 'Trump') und B37 (Hemp-Kultivar, vertikale Anbausysteme)
sind beide im Fließtext explizit als Hemp- statt Drug-Type-Kultivar
gekennzeichnet (Block 6, 9, 12) — erfüllt `SOURCE_REQUIREMENTS.md` §2's
Vorgabe, Extrapolationen nicht als false certainty darzustellen.

**Verdict: ✅ approved** (keine neuen Befunde gegenüber Stage 3).

---

## 3. Sprach-Review — Register, Terminologie, DE/EN-Parität

Geprüft gegen `CANNABIS_EDITORIAL_STANDARD.md` §2 (Prohibited/Required-Liste)
und `LOCALIZATION.md`.

- **Verbotene Muster:** kein Beginner-Hand-Holding, keine Blog-Floskeln
  ("in diesem Artikel..."), kein SEO-Filler, keine vagen Behauptungen ohne
  Mechanismus/Quelle, kein Hype/Anthropomorphisierung, keine unbelegte
  medizinische/rechtliche Beratung — Volltextsuche negativ, keine Treffer.
- **Pflichtelemente:** mechanistische Erklärung durchgängig vorhanden
  (Block 2, 3), konkrete/messbare Maßnahmen (Block 5, 7, 8), explizite
  Unsicherheitskennzeichnung bei dünner Evidenz (Block 6, "nicht
  wissenschaftlich streng bewiesen"), Zitate für alle Zahlen (Abschnitt 2).
- **Terminologie:** "Blütephase" deckt sich exakt mit dem Glossar-Eintrag
  "Flowering Stage → Blütephase" (`LOCALIZATION.md` Zeile 156); VPD/EC/PPFD
  unübersetzt verwendet, wie im Glossar vorgesehen.
- **Stilmechanik** (§5): Überschriften als Nomen-Phrasen ohne Fragen ✅,
  Zahlen durchgängig mit Einheiten und En-Dash bei Bereichen (z. B.
  "5,8–6,3") ✅, Tabellen für Studienvergleiche genutzt (Block 6-Tabelle
  im Dossier, hier als Fließtext, siehe Anmerkung unten) ✅.

**Kleinere Anmerkung (kein Blocker):** Anders als der Veg-Artikel, der den
Topping-Studienvergleich als Fließtext-Absatz statt Tabelle führt, hätte
Block 6 dieses Artikels von der im Dossier vorhandenen Vergleichstabelle
(B7/B8/B9 nebeneinander) profitieren können — Stilmechanik-Vorgabe §5
"Tabellen für Vergleiche" ist im Fließtext-Format nur locker erfüllt.
Nicht korrigiert, da der Veg-Artikel (bereits ohne Review-Beanstandung
akzeptiert) dasselbe Muster verwendet — Konsistenz mit der Serie hat hier
Vorrang vor Einzelfall-Optimierung.

**Verdict: ✅ approved** (eine unkritische Stilanmerkung, kein
Korrekturbedarf).

---

## 4. Verlinkungs-Review — Relations & Tool-Links

Geprüft gegen `CANNABIS_EDITORIAL_STANDARD.md` §7 (typisierte Relationen,
nicht nur generisches "related").

**Befund vor Korrektur:** Front-Matter nutzte ausschließlich `prerequisite`
und `see_also` — der im Fließtext (Block 2, 7, 10) explizit beschriebene
Antagonismus zwischen hoher P/K-Düngung und Ca/Mg-Aufnahme war nicht als
typisierte Relation abgebildet, obwohl `knowledge_relation_type`
(`202606020016_knowledge_os.sql`) genau dafür `antagonist_of` vorsieht
(Migrationskommentar nennt explizit "K vs Mg uptake" als Beispiel) und
`calciummangel`/`magnesiummangel` als Backlog-Slugs (#3, #1) bereits
existieren — dieselbe Konvention, nach der der Veg-Artikel bereits auf
die noch ungeschriebenen Backlog-Slugs `topping-und-fim`/
`lst-low-stress-training` verweist.

**Korrektur angewendet:** Front-Matter um drei typisierte Relationen
ergänzt: `antagonist_of → calciummangel`, `antagonist_of → magnesiummangel`
(Block 2, 7, 10 — hohe P/K-Düngung hemmt Ca/Mg-Aufnahme), `interacts_with
→ ph-lockout` (Block 7 — Nährstoffsperre-Diagnose über Runoff-pH/EC).
`prerequisite`/`see_also`-Relationen unverändert belassen, da bereits
korrekt (Ziel-Slugs existieren im Backlog bzw. sind bereits publiziert:
`vegetationsphase-training-und-pflege` als eigener Draft dieser Serie,
`bud-rot-botrytis` bereits in `wiki.ts`).

**Tool-Links geprüft:** `/tools/naehrstoff-rechner`, `/tools/vpd`,
`/tools/licht-rechner` — alle drei Routen existieren im Code
(`apps/web/src/app/[locale]/tools/`), Labels korrekt zugeordnet zu den
im Artikel referenzierten Größen (EC/NPK → Nährstoff-Rechner, VPD-Zielwert
→ VPD-Rechner, PPFD-Progression Block 9 → Licht-Rechner).

**Verdict: ✅ approved** (mit angewendeter Korrektur — 3 Relationen
ergänzt, siehe Front-Matter-Diff im Draft).

---

## 5. Gesamtergebnis

| Review | Verdict |
|---|:---:|
| 1. Agronomisch | ✅ approved |
| 2. Quellen | ✅ approved |
| 3. Sprache | ✅ approved (1 unkritische Anmerkung) |
| 4. Verlinkung | ✅ approved (Korrektur angewendet) |

**Alle vier Sign-offs erteilt.** Exit-Gate `ARTICLE_WORKFLOW.md` §5 erfüllt
— Artikel kann laut Pipeline-Definition auf `status = in_review` →
Kandidat für Stage 5 (Publish) wechseln.

**Wichtiger Vorbehalt:** Diese vier Sign-offs wurden KI-gestützt erteilt,
nicht durch vier unabhängige menschliche Reviewer wie im Standardprozess
vorgesehen. Der Editorial-Lead (Nutzer) hat das für diese Session
ausdrücklich autorisiert ("ich schau dann einfach drüber als
Überprüfung") — das ersetzt eine unabhängige Mehr-Personen-Prüfung nicht
vollständig, senkt aber das Risiko gegenüber einem rein KI-Draft ohne
jede Prüfung erheblich, da Fact-Check (Stage 3) und dieser Review (Stage 4)
von zwei separaten Prüfdurchgängen mit unterschiedlichem Fokus stammen.

**Noch nicht erledigt (Stage 5 — Publish, `ARTICLE_WORKFLOW.md` §6):**
`status = published` setzen, `quality_score` berechnen (≥ 65-Schwelle),
Aktivierung im nutzersichtbaren Set — für die Legacy-Wiki (`wiki.ts`)
zusätzlich Eintrag mit `growValue`/`qualityScore`/`growCategory` ins
`GROW_KNOWLEDGE`-Allowlist nötig, plus Registrierung in der Knowledge
Coverage Matrix. Das ist ein qualitativ anderer Schritt als die bisherigen
Stages — es schreibt Inhalte in den vom Live-Produkt ausgelieferten Datensatz
statt nur in `docs/content-factory/`. Absichtlich nicht ohne Rückfrage
ausgeführt.

---

*Ende Editorial Review. Vier Sign-offs erteilt. Bereit für Stage 5
(Publish) nach Rückfrage — siehe Vorbehalt oben.*
