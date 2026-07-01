# SecretLeaf Engineering Rules

## 1. Zweck

Diese Datei ist das verbindliche Engineering-Playbook fuer Produktentwicklung in SecretLeaf.
Sie priorisiert Produktwirkung, technische Konsistenz und Betriebsstabilitaet.

## 2. Entscheidungsrahmen

Jede Aenderung wird gegen vier Fragen geprueft:
1. Nutzerwert: loest es ein reales Problem im aktuellen Produktfluss?
2. Wirkung: verbessert es Aktivierung, Retention oder Umsatznaehe?
3. Einfachheit: ist es die kleinste robuste Loesung?
4. Skalierbarkeit: bleibt es unter Last und Teamwachstum wartbar?

## 3. Produktprioritaeten

Reihenfolge fuer Entscheidungen:
1. Grow Core und taeglicher Nutzungsloop
2. Retention-Signale und Rueckkehrmechaniken
3. UX-Klarheit und eindeutige Handlungen
4. Monetarisierungsreife

Wenn Prioritaeten kollidieren, gewinnt die hoehere Ebene.

Begriffsregel:
- In Produktdokumenten wird bevorzugt der Begriff Monetarisierungsreife verwendet.

## 4. Architektur- und Scope-Grenzen

- Keine unkontrollierten Neuschreibungen grosser Bereiche
- Bestehende Architektur respektieren, inkrementell verbessern
- Keine neuen Muster ohne begruendeten Bedarf
- Keine Feature-Ausweitung ohne klaren Produktnutzen
- Legacy-Pfade nicht ungeprueft erweitern

## 5. Codequalitaet

Mindeststandards:
- Production-ready Code
- Strikte Typisierung
- Vorhersehbare States und klare Datenfluesse
- Kein duplizierter Kerncode
- Keine stillen Fehlerpfade

Erwartung:
- Fehlerbehandlung explizit
- Logging dort, wo Betrieb davon profitiert
- Fallbacks fuer kritische Userflows

## 6. UX- und Interaktionsregeln

- Pro Screen eine primaere Handlung
- Keine doppelten CTA-Muster fuer denselben Zweck
- Status muss immer eindeutig sein
- Keine UX-Uneinheitlichkeit zwischen Domains

## 7. Internationalisierung

- Keine neuen hartcodierten User-Strings
- Uebersetzungen in beide Sprachdateien aufnehmen
- Kein direkter Import von Message-Dateien in Feature-Code
- Sprachlogik nicht am UI vorbei duplizieren

## 8. Design-Tokens und UI-System

- Semantische Tokens fuer strukturelle UI-Bausteine verwenden
- Keine ad-hoc Farbregeln fuer Seitenstruktur
- Komponenten-Standards einhalten statt neue Stilinseln zu bauen

## 9. Daten und Sicherheit

- Datenownership vor Implementierung klaeren
- Rollen- und Rechtepruefung serverseitig erzwingen
- Keine sensitiven Daten in Logs
- Migrations und RLS-Aenderungen nur ueber versionierte SQL-Dateien

## 10. Automation und Betrieb

- Cron- und Pipeline-Aenderungen muessen beobachtbar sein
- Jeder relevante Job braucht Lauftelemetrie
- Keine produktive Automation ohne Fehler- und Health-Signale

## 11. Monetarisierungs-Guardrail

Jede groessere Funktion muss explizit bewertet werden:
- Erhoeht sie Zahlungsbereitschaft oder Bindung?
- Ist sie in ein Pro- oder Team-Modell ueberfuehrbar?

Features ohne klaren Beitrag werden nachrangig priorisiert.

## 12. Delivery Checklist vor Merge

1. Typecheck und Build erfolgreich
2. Produktwirkung dokumentiert
3. Sicherheits- und Rollenlogik geprueft
4. Betriebsimplikationen beruecksichtigt
5. Doku aktualisiert, falls Architektur oder Betrieb betroffen ist

## 13. Nicht verhandelbar

SecretLeaf ist ein Produktsystem, kein reines Content-Projekt.
Jede technische Entscheidung muss den Produktkern staerken.

## 14. Dokument-Metadaten

Owner: Product Engineering
Status: Active
Last updated: 2026-07-01
Next review: 2026-08-01
