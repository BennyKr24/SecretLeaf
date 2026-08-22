# Fact-Check — Blütephase: Ernährung, Support und der Weg zur Ernte

Stage: 3 — Fact Check · Datum: 2026-08-22 · Reviewer: KI-gestützt (Claude,
zweite Instanz gegenüber dem Draft-Autor derselben Session) · Basis:
`docs/content-factory/drafts/bluetephase-ernaehrung-und-pflege.md` gegen
`docs/content-factory/research/bluete-source-dossier.md`.

**Statusvorbehalt gemäß `ARTICLE_WORKFLOW.md` §7:** Fact-Check ist laut
Rollentabelle *"Partially [AI-assisted] · Mandatory human"*. Diese Prüfung
deckt den KI-leistbaren Teil vollständig ab (Zahlen-Cross-Check, Evidence-
Level-Zuweisung, Confidence-Score-Berechnung, Konflikt-Verifikation).
Das **menschliche Pflicht-Sign-off ist damit nicht ersetzt**, sondern
vorbereitet — Status bleibt `in_review`, nicht `published`, bis ein Mensch
gegenzeichnet.

---

## 1. Zahlen-Cross-Check (Draft → Dossier-Claim)

Jede quantitative Aussage im Draft wurde gegen die Claim→Source-Map des
Stage-1-Dossiers zurückverfolgt. Keine Abweichung, keine Erfindung, keine
Zahl ohne Beleg gefunden.

| Draft-Block | Zahl im Draft | Dossier-Claim # | Quelle | Übereinstimmung |
|---|---|---|---|:---:|
| 1 | 42/49/70 Tage Kernblüte + 14 Tage Spätblüte | — (Cross-Ref `phases.ts`, außerhalb dieses Dossiers) | `BLUETE_TAGE`, Kalibrierungsaudit dieser Session | ✅ verifiziert gegen Code |
| 2, 5, 10 | NPK 1-3-2 → 0-3-3, Umstellung über 2–3 Wochen | 1 | B1–B6 | ✅ |
| 2, 7, 10 | Ca/Mg-Bedarf steigt, Hemmung durch hohes P/K bes. Woche 3–6 | 6 | B11–B14 | ✅ |
| 3, 5, 8 | pH-Ziel 5,8–6,3; 15–20 % Runoff; Coco-Zweistufenstrategie | 8 | B15 | ✅ |
| 3, 5, 8 | Support-Bedarf Woche 4–5, zweite Netzlage 8–12 Zoll über erster | 11 | B25–B29 | ✅ |
| 5, 8, 11 | Defoliation-Fenster 1 (vor/erste 2 Wo. 12/12), Fenster 2 (Tag 21–25), Sperre Tag 1–21 | 9 | B16–B20 | ✅ |
| 5, 8, 11 | Tag-25–28-Grenze, Spätblüte-Defoliation (Wo. 6–7) aktiv abgeraten | 10 | B21–B24 | ✅ |
| 6 | DWC-Gelato-Studie: N 194 mg/L, P 59 mg/L optimal, 144 g/Pflanze; K 60–340 mg/L ohne Ertragswirkung | 2 | B8 | ✅ exakt |
| 6 | Hemp 'Trump': P 25/50/75 mg/L kein Unterschied; Leachate-P 12-fach bei 3-facher P-Erhöhung | 3 | B9 | ✅ exakt |
| 6 | Bulk-PK-Studie: Ertrag 1 von 2 Sorten, THC/Terpene unverändert | 4 | B7 | ✅ |
| 6 | Lichtleck-Studie: n=403, R²=0,016 (1,6 % Varianz erklärt) | 13 | B32 | ✅ exakt |
| 7 | Lockout: Runoff-pH außerhalb 6,0–6,8 (Erde) / 5,5–6,5 (Hydro) | 15 | B33–B36 | ✅ |
| 7 | Ca-Mangel-Symptomatik (Rust-Spot, keine Vergilbung, grüne Adern) | 7 | B40 | ✅ |
| 9, 12 | PPFD 200/400/600 µmol/m²/s, 35 Tage, +36,88 % CBD (600 vs. 200), +248 % CBD-Ertrag (200→400) | 16 | B37 | ✅ exakt |
| 12 | Autoflower: 18/6 Standard, 20/4 und 24/0 gängig, photoperiodenunabhängig | 17 | B38 | ✅ |

**Ergebnis:** 15/15 geprüfte Zahlenaussagen stimmen mit der zitierten
Dossier-Quelle überein. Keine Korrektur, keine Streichung nötig.

---

## 2. Konflikt-Verifikation (Exit-Gate-Kriterium: "Konflikte im Text benannt")

| Konflikt | Im Artikeltext benannt? | Fundstelle | Bewertung |
|---|:---:|---|---|
| P/K-Bloom-Booster: B7/B8/B9 widersprechen dem "mehr P/K = mehr Ertrag+Potenz"-Narrativ | ✅ | Block 6, Absatz 1–2 | Sauber differenziert dargestellt (B7-Ertragseffekt bei 1 von 2 Sorten bleibt erhalten, nicht überglättet) |
| Lichtdichtigkeit/Hermaphroditismus: breiter Konsens (B30) vs. einzige, zu schwache Studie (B32) | ✅ | Block 6, Absatz 3 | Korrekt als "weder bestätigt noch widerlegt" behandelt, nicht als "Mythos entlarvt" — entspricht der expliziten Dossier-Warnung |

Beide vom Dossier als "offene Konflikte" geführten Punkte sind im Fließtext
explizit als Konflikt/Einordnung behandelt, nicht stillschweigend zu einer
Seite hin aufgelöst. Exit-Gate-Kriterium erfüllt.

---

## 3. Evidence-Level-Zuweisung (pro tragender Quelle im Artikel)

| Quellengruppe | Evidence-Level | Tragend für |
|---|:---:|---|
| B1–B6 (NPK-Praxis-Konsens) | 1 | Block 2, 5, 10 — NPK-Übergang |
| B7 (RxGreen, Herstellerstudie) | 2–3 | Block 6, 12 |
| B8 (Frontiers, kontrolliert) | 3–4 | Block 6 — zentraler Gegenbeleg |
| B9 (Frontiers, kontrolliert) | 3 | Block 6 |
| B11–B14 (Ca/Mg-Konsens) | 1 | Block 2, 7, 10 |
| B15 (pH/Runoff-Konsens) | 1 | Block 3, 5, 8 |
| B16–B24 (Defoliation-Konsens) | 1 | Block 5, 8, 11 |
| B25–B29 (Support-Konsens) | 1 | Block 3, 5, 8 |
| B30 (Lichtleck-Konsens, unbelegt) | 1 | Block 6 |
| B32 (SURG-Beobachtungsstudie) | 2 | Block 6 |
| B33–B36 (Lockout-Konsens) | 1 | Block 7 |
| B37 (PMC, kontrolliert) | 3 | Block 9, 12 |
| B38 (Autoflower-Konsens) | 1 | Block 12 |
| B40 (Ca-Symptom-Konsens) | 1 | Block 7 |

**`meta.evidence_level` = 1** bestätigt (schwächste tragende Quelle, nicht
Durchschnitt — `SOURCE_REQUIREMENTS.md` §2). Trotz vier Level-2/3/4-Studien
bleibt der Artikel-Gesamtwert bei 1, weil Block 5/8/10/11 (Defoliation-
Fenster, Support-Timing, NPK-Verhältnis) tragend auf Level-1-Konsens ruhen.
Bereits so im Draft-Front-Matter gesetzt — keine Korrektur nötig.

---

## 4. Confidence-Score — Neuberechnung nach Formel (`SOURCE_REQUIREMENTS.md` §4)

```
confidence_score =
    0.40 × (mean evidence_level ÷ 5)
  + 0.20 × source_adequacy
  + 0.20 × consistency
  + 0.20 × freshness
```

- **Evidence-Stärke:** Mean über die 18 Claim-Einträge des Dossiers (nicht
  über Quellenpakete, um Level-1-Sammelquellen nicht zu über- oder
  untergewichten) ≈ **1,64/5** → 0,40 × (1,64/5) = **0,131**.
  *(Dossier-Erstschätzung lag bei 1,3/5 — die Neuberechnung über die
  tatsächliche Claim-Liste liegt geringfügig höher, da B8/B9/B16/B37 als
  eigene Claims mitgezählt statt unterschätzt wurden.)*
- **Source-Adequacy:** ~45 Quellen vorhanden ÷ 3 gefordert → gedeckelt bei
  1,0; keine Publisher-Monokultur (breite Streuung über Blogs, Herstellerseiten,
  zwei akademische Journals) → kein 0,1-Abzug → **0,20 × 1,0 = 0,20**.
- **Consistency:** Zwei benannte, aber sauber im Text aufgelöste Konflikte
  (Abschnitt 2) bei sonst durchgängiger Übereinstimmung der übrigen 16
  Claims → zwischen "1,0 Übereinstimmung" und "0,6 kleinere Lücken"
  einzuordnen, näher an 0,6 wegen der Substanz der beiden Konflikte →
  **0,20 × 0,7 = 0,14** (Dossier-Schätzung von 0,7 bestätigt).
- **Freshness:** Alle Quellen 2021–2026, `last_review_date` = 2026-08-22,
  Horizont 18 Monate, keine Quelle überfällig → **0,20 × 1,0 = 0,20**.

**Neu berechneter Confidence-Score: 0,131 + 0,20 + 0,14 + 0,20 = 0,67**

Das liegt über der Draft-Schätzung von 0,64 (Stage-1-Schnellschätzung) und
bestätigt komfortabel die Publikationsschwelle für Cultivation-Technique-
Artikel (min. 0,60, min. 3 Quellen ✅, min. Top-Evidence-Level 2 — hier B8
auf Level 3–4 ✅). `meta.confidence_score` im Draft wird von 0,64 auf **0,67**
korrigiert (siehe Abschnitt 6).

---

## 5. Author-Checklist (`SOURCE_REQUIREMENTS.md` §6)

- [x] ≥ 3 Quellen (hier ~45), jede mit URL/DOI.
- [x] Jede numerische Aussage inline zitiert (Abschnitt 1).
- [x] Keine Category-Default-`sourceIds`.
- [x] `meta.evidence_level` = schwächste tragende Quelle (1).
- [x] `meta.confidence_score` berechnet (0,67) und über der Archetyp-Schwelle (0,60).
- [x] Konflikte im Text benannt (Abschnitt 2).
- [x] `meta.last_review_date` (2026-08-22) + `review_horizon_months` (18) gesetzt.
- [x] Extrapolierte (Hemp- statt Drug-Type-) Claims explizit markiert — B9, B37 im Draft klar als Hemp-Kultivar gekennzeichnet (Block 6, 9).

Alle acht Punkte erfüllt.

---

## 6. Exit-Gate-Entscheidung

**Exit-Gate laut `ARTICLE_WORKFLOW.md` §4: "confidence_score meets the
archetype publication gate; zero uncited or contradicted claims."**

✅ **Gate bestanden** (0,67 ≥ 0,60; 0 unbelegte Zahlen; beide Konflikte
explizit im Text behandelt statt verschwiegen).

**Einzige vorgenommene Korrektur:** `meta.confidence_score` im Draft-Front-
Matter von 0,64 auf 0,67 aktualisiert (Neuberechnung Abschnitt 4). Keine
inhaltliche Korrektur am Fließtext nötig — alle 15 geprüften Zahlenaussagen
waren bereits korrekt zitiert.

**Nächster Schritt laut Pipeline:** Stage 4 (Editorial Review, vier
Pflicht-Sign-offs: agronomisch, Quellen, Sprache, Verlinkung) — vollständig
menschliches Gate, siehe `ARTICLE_WORKFLOW.md` §5. Artikel-Status bleibt
`in_review`, nicht `draft` mehr (Stage-3-Gate bestanden), aber auch nicht
`published`.

---

*Ende Fact-Check. Bereit für Stage 4 (Editorial Review, vier menschliche
Pflicht-Sign-offs) gemäß `ARTICLE_WORKFLOW.md` §5.*
