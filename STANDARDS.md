# SecretLeaf Engineering Standards

## 1. Zweck

Dieses Dokument definiert technische Mindeststandards fuer Code, Architektur, Tests, Sicherheit und Delivery.
Es ergaenzt AI_RULES.md um konkrete Umsetzungsstandards.

---

## 2. Allgemeine Prinzipien

- Kleine, nachvollziehbare Aenderungen vor grossen Rewrite-Wellen
- Klares Ownership pro Modul
- Keine stillen Fehlerpfade
- Produktkritische Logik serverseitig absichern

---

## 3. TypeScript-Standards

Pflicht:
- Strikte Typisierung beibehalten
- Keine unkommentierten any-Workarounds in neuem Code
- Oeffentliche Funktionssignaturen stabil halten oder sauber versionieren

Benennung:
- Domainnamen sprechen Produktsprache
- Keine irrefuehrenden Legacy-Begriffe fuer neue Features

---

## 4. API-Standards

Pflicht je Route:
- klare Input-Validierung
- explizite Fehlerantworten
- Auth-/Rollenpruefung falls notwendig
- beobachtbare Status-/Fehlerlogs

Kontraktregel:
- Breaking Changes nur mit dokumentiertem Migrationspfad.

---

## 5. Datenbank-Standards

- Jede Schemaaenderung ueber versionierte Migration
- RLS fuer nutzerbezogene Daten verpflichtend
- Indizes nur query-getrieben setzen und regelmaessig validieren
- Constraint-Logik bevorzugt in DB, nicht nur in UI

---

## 6. Frontend-Standards

- Komponenten muessen Design-System-konform sein
- Keine hardcodierten User-Strings
- Primaere Aktion pro Screen klar sichtbar
- Lade-, Fehler- und Leerzustaende verpflichtend

---

## 7. Accessibility-Standards

Mindestniveau:
- WCAG AA

Pflicht:
- sichtbarer Fokus
- Keyboard-Navigation fuer interaktive Komponenten
- semantische HTML-Struktur
- kein reiner Farbcode fuer Statusvermittlung

---

## 8. Localization-Standards

- de/en immer gemeinsam pflegen
- Fachbegriffe konsistent gem. LOCALIZATION.md
- Keine maschinellen Resttexte in produktkritischen Bereichen

---

## 9. Observability-Standards

Pflicht fuer produktkritische Flows:
- strukturierte Logs
- zentrale Fehlererfassung
- Health-Endpunkte aktuell halten
- Automation-Laufhistorie schreiben

---

## 10. Test- und Release-Standards

Vor Merge:
1. Typecheck erfolgreich
2. Build erfolgreich
3. Kritische Flows per Smoke-Checks validiert
4. Doku aktualisiert, falls Verhalten/Architektur betroffen

Nach Deploy:
- Health-Pruefung
- Automation-Status pruefen
- Regressionen zeitnah dokumentieren

---

## 11. Dokument-Metadaten

Owner: Product Engineering
Status: Active
Last updated: 2026-06-01
Next review: 2026-07-01
