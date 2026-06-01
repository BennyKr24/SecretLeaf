# SecretLeaf Wiki Architecture

## 1. Zweck

Dieses Dokument definiert die Informationsarchitektur der Wissensflaeche von SecretLeaf.
Ziel ist eine langfristig skalierbare, suchbare und fachlich belastbare Cannabis-Wissensplattform.

---

## 2. Zielbild

Die Wiki-Flaeche soll:
- klare Taxonomie statt lose Artikelansammlung bieten
- Studienwissen in umsetzbare Grow-Entscheidungen uebersetzen
- hohe Wiederauffindbarkeit ueber Suche und Verlinkung sichern

---

## 3. Inhaltsdomaenen

Primare Domaenen:
1. Pflanzenbiologie und Phasen
2. Naehrstoffe und Mangelbilder
3. Schaedlinge und Krankheiten
4. Klima/Licht/VPD
5. Methoden, Prozesse und Best Practices
6. Studien und Evidenz

Jede Domaene braucht:
- Kernseite
- Unterkategorien
- Querverweise
- relevante Studienlinks

---

## 4. Taxonomie-Regeln

Pflichtfelder pro Wissenseintrag:
- title
- slug
- category
- tags
- summary
- source_quality (wo relevant)
- updated_at

Taxonomie-Prinzipien:
- Ein Hauptthema pro Artikel
- Tags als Zuschnitt, nicht als Ersatz fuer Kategorien
- Synonyme in Suche mappen, nicht Kategorien aufblasen

---

## 5. Such- und Navigationsarchitektur

Mindestanforderungen:
- Autocomplete fuer haeufige Fachbegriffe
- Filter nach Kategorie, Relevanz, Qualitaet
- Sichtbare Verwandte-Themen-Links
- Lesefortschritt und Rueckkehrpunkte

KPI-Ziele:
- Niedrigere Search-Abbruchrate
- Hoehere Klicktiefe zu relevanten Detailseiten
- Schnellere Zeit bis verwertbare Antwort

---

## 6. Verknuepfung mit Studies und Grow

Produktregel:
- Wissensseiten duerfen nicht isoliert bleiben.
- Wo moeglich: Bruecken zu Tools, Diagnose und Grow-Log.

Beispiele:
- Mangelartikel -> Naehrstoffrechner
- Klimaartikel -> VPD-Tool
- Studienseite -> konkrete Grow-Interpretation

---

## 7. Qualitaetsgovernance

Review-Pflicht:
- Fachliche Plausibilitaet
- Quellenqualitaet
- Sprachqualitaet de/en
- Konsistente Terminologie

Betriebsregel:
- Veraltete Eintraege markieren und priorisiert ueberarbeiten.

---

## 8. Risiken und Gegenmassnahmen

Risiken:
- Kategorie-Drift bei schnellem Content-Wachstum
- Inkonsistente Begriffe zwischen Wiki und Produktflows
- Suchrelevanz sinkt ohne laufendes Tuning

Gegenmassnahmen:
- Monatliche Taxonomie-Reviews
- Terminologie-Check gegen LOCALIZATION.md
- Suchdatenbasiertes Re-Ranking

---

## 9. Dokument-Metadaten

Owner: Product Engineering
Status: Active
Last updated: 2026-06-01
Next review: 2026-07-01
