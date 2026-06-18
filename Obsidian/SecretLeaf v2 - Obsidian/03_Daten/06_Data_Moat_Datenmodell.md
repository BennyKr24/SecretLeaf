---
tags: [daten, data-moat, datenmodell, design]
status: Entwurf
verknüpft: ["[[06_Data_Moat_Strategie]]", "[[01_Datenstrategie]]", "[[02_Grow_Zyklus]]", "[[04_Diagnosedaten]]", "[[05_Erntedaten]]", "[[07_Technik/Checkpoint_2026-06-10/02_Datenmodell]]", "[[07_Technik/Checkpoint_2026-06-10/07_Data_Moat_Audit]]"]
---

# Data-Moat-Datenmodell — Ziel, Similarity, Outcome, Event-System

> **Zweck dieses Dokuments**: Schließt die in [[07_Technik/Checkpoint_2026-06-10/07_Data_Moat_Audit]] und [[08_Organisation/07_Vault_Audit_2026-06-10]] identifizierten Data-Moat-Lücken mit konkreten Datenmodellen. **Reine Konzeption — kein Code, keine Migration, kein Fix.** Voraussetzung für die Umsetzung ist die Behebung von TD-01/TD-02 (UUID-Bug, [[06_Technical_Checkpoint_2026-06-10]]).

> Dieses Dokument beantwortet die offenen Fragen aus [[06_Data_Moat_Strategie]] ("Welche Daten sind für Prognosen entscheidend?") und [[02_Grow_Zyklus]] ("Welche Daten sind verpflichtend/optional?").

---

## 0. Kernmodell: Situation → Entscheidung → Ergebnis

Alle vier folgenden Modelle sind Ausprägungen eines einzigen Grundmusters:

```
SITUATION  (Zustand des Grows zu Zeitpunkt T)
    ↓
ENTSCHEIDUNG  (was der Nutzer / die KI vorschlägt oder tut)
    ↓
ERGEBNIS  (messbare Veränderung zu Zeitpunkt T+n)
```

- **Situation** = Schnappschuss aus Grow-Stammdaten + Umweltdaten + Verlaufsdaten + Diagnose zu einem Zeitpunkt.
- **Entscheidung** = Log Entry / Empfehlung / Diagnose-Maßnahme.
- **Ergebnis** = nachfolgende Situation (Health-Score-Veränderung) oder Erntedaten.

Jedes der vier Modelle unten ordnet sich diesem Muster zu. Das Event-System ist der technische Mechanismus, der Situation/Entscheidung/Ergebnis als verknüpfbare Datensätze festhält.

---

## 1. Ziel-Datenmodell

### 1.1 Zweck

Definiert, welche Daten **pro Grow zentral in Supabase** gespeichert werden müssen, damit Similarity-, Outcome- und Prediction-Funktionen überhaupt möglich sind. Baut auf der bestehenden Tabellenstruktur `grows` / `plants` / `log_entries` auf (siehe [[07_Technik/Checkpoint_2026-06-10/02_Datenmodell]]) — erweitert sie um fehlende Felder und Tabellen, ändert aber nichts am bestehenden Schema selbst.

### 1.2 Bestehende Tabellen (Ist-Zustand, vorausgesetzt TD-01 ist behoben)

**`grows`** (Migration 11, vorhanden) — deckt bereits ab:
`umgebung`, `medium`, `licht_typ`, `licht_leistung`, `erfahrung`, `pflanzen_anzahl`, `flaeche`, `start_date`, `current_phase_id`, `status`, `plan` (jsonb), `harvest` (jsonb).

→ **Bewertung**: Spaltenstruktur ist für ein MVP-Zielmodell grundsätzlich ausreichend (siehe auch [[07_Technik/Checkpoint_2026-06-10/07_Data_Moat_Audit]], Abschnitt "Was vorhanden ist"). Die Lücke ist nicht das Schema, sondern dass keine Zeilen ankommen (TD-01) und dass zwei Bereiche fehlen: **Sorte/Genetik** und **strukturierte Erntedaten**.

**`plants`** (vorhanden) — minimal (`name`, `notes`). Reicht für Einzelpflanzen-Tracking, aber ohne Sorten-Verknüpfung.

**`log_entries`** (vorhanden) — `entry_type` (Freitext) + `data` (jsonb). Flexibel genug für Verlaufsdaten, aber ohne CHECK-Constraint auf `entry_type` nicht auswertbar für Benchmarks (siehe DB-Issue in [[07_Technik/Checkpoint_2026-06-10/02_Datenmodell]]).

### 1.3 Fehlende Felder in `grows` (Ergänzungsvorschlag, konzeptionell)

| Feld | Typ | Zweck | Bezug |
|---|---|---|---|
| `strain_id` | uuid, FK → `strains` (neu, s.u.) | Verknüpfung zur Sortendatenbank — von [[02_Grow_Zyklus]] als Stammdatum gefordert ("Sorte: Verknüpfung zur Sortendatenbank"), aktuell in `grows` nicht vorhanden | [[05_Sorten]] |
| `topfgroesse_liter` | numeric, nullable | Topfgröße — Teil der "Grow-Daten" laut [[01_Datenstrategie]] (Sorte/Medium/Topfgröße/Beleuchtung/Anbaudaten), fehlt aktuell vollständig in `grows` | [[01_Datenstrategie]] |
| `lichtzyklus` | text (z. B. `"18/6"`, `"12/12"`) | Teil der Umweltdaten-Kategorie ("Lichtzyklen"), aktuell nirgends strukturiert erfasst | [[01_Datenstrategie]] |
| `ended_at` | timestamptz, nullable | Tatsächliches Ende des Grows (für Growdauer-Berechnung, siehe [[05_Erntedaten]] "Growdauer") | [[05_Erntedaten]] |
| `abbruch_grund` | text, nullable | Für "abgebrochene Grows" — offene Frage aus [[02_Grow_Zyklus]] ("Wie wird ein abgebrochener Grow behandelt?") | [[02_Grow_Zyklus]] |

### 1.4 Neue Tabelle: `strains` (Sortendatenbank)

Aktuell laut Vault-Recherche keine eigene Sorten-Tabelle im Ist-Schema dokumentiert, obwohl [[02_Grow_Zyklus]] und [[01_Datenstrategie]] "Sorte" als Stammdatum bzw. erste Position der Grow-Daten nennen.

| Feld | Typ | Zweck |
|---|---|---|
| `id` | uuid PK | — |
| `name` | text | Sortenname |
| `genetik_typ` | text (Indica/Sativa/Hybrid/Autoflower) | für Similarity-Vergleich |
| `thc_range` / `cbd_range` | numeric/numeric | für Erwartungswert-Vergleiche |
| `bluetezeit_tage_avg` | int | Referenzwert für Prognose (vs. tatsächliche `ended_at - phase5_start`) |
| `breeder` | text, nullable | optional |
| `created_at` | timestamptz | — |

> Diese Tabelle ist eine Voraussetzung für Similarity- und Prediction-Vergleiche "pro Sorte" (siehe Abschnitt 2 und [[07_Technik/Checkpoint_2026-06-10/07_Data_Moat_Audit]], "Similarity Engine").

### 1.5 Neue Tabelle: `harvests` (statt `grows.harvest` jsonb)

[[07_Technik/Checkpoint_2026-06-10/07_Data_Moat_Audit]] empfiehlt bereits unter Punkt 3: "Harvest-Daten als eigenständiges, abfragbares Format statt jsonb-Blob in `grows.harvest`". [[05_Erntedaten]] definiert die benötigten Datenelemente (Quantitativ/Qualitativ/Prozess/Bewertung).

| Feld | Typ | Quelle in [[05_Erntedaten]] |
|---|---|---|
| `id` | uuid PK | — |
| `grow_id` | uuid FK → `grows`, CASCADE | — |
| `user_id` | uuid FK → `auth.users`, CASCADE | RLS analog `grows_owner` |
| `ertrag_gramm` | numeric | "Ertrag" (quantitativ) |
| `trockengewicht_gramm` | numeric | "Trockengewicht" |
| `growdauer_tage` | int | "Growdauer" (auch redundant aus `start_date`/`ended_at` ableitbar — hier materialisiert für schnelle Aggregation) |
| `qualitaet_rating` | int (1–5 oder 1–10) | "Qualität" |
| `harz_rating` | int, nullable | "Harzbildung" |
| `aroma_tags` | text[] / jsonb | "Aroma" |
| `besonderheiten` | text, nullable | "Besonderheiten" |
| `erntezeitpunkt` | date | "Erntezeitpunkt" (Prozessdaten) |
| `trocknung_tage` | int, nullable | "Trocknung" |
| `curing_tage` | int, nullable | "Curing" |
| `nutzerzufriedenheit` | int (1–5) | "Nutzerzufriedenheit" (Bewertungsdaten) |
| `zielerreichung` | text/enum (erreicht/teilweise/nicht erreicht) | "Zielerreichung" |
| `probleme_notizen` | text, nullable | "Probleme" |
| `created_at` | timestamptz | — |

> RLS analog zu `grows_owner`: `harvests_owner` (`auth.uid() = user_id`).

### 1.6 Pflicht- vs. optionale Felder (beantwortet offene Frage aus [[02_Grow_Zyklus]])

**Pflicht bei Grow-Erstellung** (für Similarity-Vergleich notwendig): `umgebung`, `medium`, `licht_typ`, `licht_leistung`, `pflanzen_anzahl`, `start_date`, `strain_id` (falls bekannt — sonst `"unbekannt"` als Fallback-Sorte).

**Optional, aber stark empfohlen** (für Prediction-Qualität): `flaeche`, `topfgroesse_liter`, `lichtzyklus`, `erfahrung`.

**Pflicht bei Grow-Abschluss** (für Outcome-Modell, Abschnitt 3): mindestens `ertrag_gramm` ODER `zielerreichung` in `harvests` — siehe [[05_Erntedaten]] "Welche Ertragsdaten sind verpflichtend?".

---

## 2. Similarity-Datenmodell

### 2.1 Zweck

[[07_Technik/Checkpoint_2026-06-10/07_Data_Moat_Audit]] benennt als Lücke: "einheitliche Normalisierung (z. B. `licht_leistung` in Watt vs. Lampentyp-Kategorien)". Dieses Modell definiert, **welche Attribute normalisiert vorliegen müssen**, damit zwei Grows algorithmisch verglichen werden können.

### 2.2 Vergleichsdimensionen ("Grow-Profil-Vektor")

Pro Grow wird ein normalisiertes Profil abgeleitet — keine neue Tabelle nötig, sondern eine **View oder berechnete Spalten** auf Basis von `grows`:

| Dimension | Quelle | Normalisierung |
|---|---|---|
| Umgebung | `grows.umgebung` | bereits kategorisch (`indoor`/`outdoor`/...) — ok |
| Medium | `grows.medium` | bereits kategorisch (`erde`/`hydro`/...) — ok, aber **CHECK-Constraint fehlt** (siehe DB-Issue in [[07_Technik/Checkpoint_2026-06-10/02_Datenmodell]]) → Risiko für Freitext-Drift, das Similarity-Vergleiche unbrauchbar macht |
| Licht | `grows.licht_typ` + `grows.licht_leistung` | **Kernlücke laut Audit**: `licht_leistung` ist `int` (vermutlich Watt), aber ohne Einheit/Constraint dokumentiert. Empfehlung: explizite Einheit (`licht_leistung_watt`) + abgeleitete Kennzahl `watt_pro_pflanze = licht_leistung / pflanzen_anzahl` für fairen Vergleich unterschiedlich großer Grows |
| Fläche/Dichte | `grows.flaeche` + `pflanzen_anzahl` | abgeleitete Kennzahl `pflanzen_pro_qm` |
| Sorte/Genetik | `grows.strain_id` → `strains.genetik_typ` | kategorisch (Indica/Sativa/Hybrid/Autoflower) — ermöglicht Vergleich "ähnliche Genetik, unterschiedliches Setup" |
| Erfahrung | `grows.erfahrung` | bereits kategorisch |
| Phasenverlauf (Timing) | abgeleitet aus `log_entries` (Phasenwechsel-Events, siehe Abschnitt 4) | Differenz zwischen geplantem (`grows.plan` jsonb) und tatsächlichem Phasenwechsel-Zeitpunkt pro Phase |
| Pflegehäufigkeit | abgeleitet aus `log_entries` | Anzahl Log Entries pro `entry_type` pro Woche (z. B. Gießfrequenz) — Vergleich von Pflegeintensität |
| Topfgröße | `grows.topfgroesse_liter` (neu, Abschnitt 1.3) | numerisch direkt vergleichbar |

### 2.3 Was fehlt konkret (Antwort auf "Welche Daten fehlen?")

1. **`strains`-Tabelle** (existiert nicht) — ohne sie ist "ähnliche Sorte" nicht maschinell vergleichbar, nur als Freitext.
2. **CHECK-Constraints / kontrollierte Vokabulare** für `medium`, `licht_typ`, `umgebung`, `erfahrung` — sonst führt Freitext-Drift (z. B. "LED" vs. "led" vs. "LED-Vollspektrum") zu falschen Ähnlichkeitsclustern.
3. **Phasenwechsel-Zeitstempel** — aktuell ist `current_phase_id` nur der *aktuelle* Stand, frühere Phasenwechsel werden nicht historisiert (außer indirekt über `log_entries`, falls diese als Event geloggt werden — siehe Abschnitt 4.3).
4. **`topfgroesse_liter`, `lichtzyklus`** (Abschnitt 1.3).
5. **Einheit für `licht_leistung`** — Watt muss explizit dokumentiert/erzwungen werden, da Lampentyp-Kategorien sonst nicht vergleichbar sind.

### 2.4 Similarity-Score (konzeptionell, kein Algorithmus-Detail)

Ein Similarity-Score zwischen zwei Grows ist eine gewichtete Distanzfunktion über die normalisierten Dimensionen aus 2.2. Voraussetzung: **mindestens N abgeschlossene Grows mit vollständigem Profil + `harvests`-Eintrag** pro Vergleichsgruppe — sonst keine sinnvolle Referenzmenge. Dies ist der Grund, warum Similarity Engine und Outcome-Modell (Abschnitt 3) voneinander abhängen: Ähnlichkeit ohne Ergebnis ist nutzlos ("ähnlich, aber wozu?").

---

## 3. Outcome-Datenmodell

### 3.1 Zweck

Formalisiert das in [[07_Technik/Checkpoint_2026-06-10/07_Data_Moat_Audit]] als "fehlt fast vollständig" markierte Outcome-Modell: **Maßnahme (Log Entry) → Reaktion → Endergebnis (Harvest)**. Dies ist exakt das in Abschnitt 0 beschriebene Kernmodell Situation → Entscheidung → Ergebnis, angewendet auf den gesamten Grow-Verlauf.

### 3.2 Drei Ebenen von Outcomes

**Ebene 1 — Grow-Outcome (langfristig)**
`grows` (Situation: Setup) → gesamter Verlauf via `log_entries` (Entscheidungen) → `harvests` (Ergebnis, Abschnitt 1.5).
→ Beantwortet: "Welches Setup führt zu welchem Ertrag/welcher Qualität?"

**Ebene 2 — Diagnose-Outcome (mittelfristig)**
Diagnose (Situation: Symptom + Wahrscheinlichkeiten, siehe [[04_Diagnosedaten]]) → Empfehlung (Entscheidung) → Folge-Log-Entries / Health-Score-Veränderung (Ergebnis: "verbessert"/"unverändert"/"verschlechtert", siehe [[04_Diagnosedaten]] "Ergebnisdaten").
→ **Aktuell laut [[07_Technik/Checkpoint_2026-06-10/07_Data_Moat_Audit]] komplett isoliert** (DL-09: "Diagnose-Flow umgeht Sync & Analytics").

**Ebene 3 — Empfehlungs-Outcome (kurzfristig)**
Empfehlung aus `lib/grow/insights.ts` oder `knowledge_recommend_tools` (Entscheidung) → wurde sie umgesetzt? (`knowledge_events`, Abschnitt 4) → Ergebnis sichtbar in nachfolgenden Log Entries.
→ Aktuell laut Audit nicht verknüpft: "Keine Verknüpfung zwischen `knowledge_events.user_id` und `grows`/`log_entries`".

### 3.3 Neue Tabelle: `diagnoses` (für Ebene 2)

[[04_Diagnosedaten]] definiert die Struktur (Symptom → Ursache → Wahrscheinlichkeiten → Empfehlung → Feedback → Ergebnis), aber laut [[06_Technical_Checkpoint_2026-06-10]] (TD-17/TD-19) existiert dafür aktuell **nur ein TypeScript-Typ ohne Backend** (HTTP 501 Stub).

| Feld | Typ | Bezug zu [[04_Diagnosedaten]] |
|---|---|---|
| `id` | uuid PK | — |
| `grow_id` | uuid FK → `grows`, CASCADE | verknüpft Diagnose mit Grow-Kontext (aktuell fehlend laut Audit) |
| `plant_id` | uuid FK → `plants`, nullable | falls pflanzenspezifisch |
| `user_id` | uuid FK → `auth.users`, CASCADE | RLS |
| `symptome` | jsonb | "Symptomdaten" (Blattfarbe, Verformungen, Flecken, Wachstumsprobleme) |
| `bilder_refs` | jsonb/text[], nullable | Verknüpfung zu Bilddaten (sobald TD-17 gelöst), siehe [[03_Bilddaten]] |
| `ursachen_wahrscheinlichkeiten` | jsonb | "Wahrscheinlichkeiten" (z. B. `{"stickstoffmangel": 0.62, ...}`) |
| `empfehlung` | jsonb | "Empfehlungsdaten" (Maßnahmen, Dosierungen, Prioritäten) |
| `nutzer_feedback` | text/enum (bestätigt/korrigiert), nullable | "Feedback" |
| `ergebnis` | enum (verbessert/unveraendert/verschlechtert), nullable, **nachträglich befüllt** | "Ergebnisdaten" |
| `ergebnis_bewertet_am` | timestamptz, nullable | Zeitpunkt der Ergebnis-Erfassung (z. B. nach 7 Tagen Follow-up) |
| `created_at` | timestamptz | — |

> RLS analog `grows_owner`. Das Feld `ergebnis` wird **zeitversetzt** befüllt (Diagnose-Lernschleife laut [[04_Diagnosedaten]]: "Problem → Diagnose → Empfehlung → Anwendung → Ergebnis → Verbesserte Diagnose") — dies ist der Kern der "Diagnose-Lernschleife" und erfordert ein Follow-up-Mechanismus (z. B. Erinnerung nach X Tagen, siehe Event-System Abschnitt 4.4).

### 3.4 Verknüpfungslogik (FK-Kette für Outcome-Abfragen)

```
grows (Situation: Setup)
  ├─→ log_entries (Entscheidungen über Zeit, mit logged_at)
  ├─→ diagnoses (Situation+Entscheidung auf Pflanzenebene, neu)
  │     └─→ ergebnis (Ergebnis, nachträglich)
  └─→ harvests (Endergebnis, neu)
```

Alle vier Tabellen tragen `grow_id` (bzw. `diagnoses` zusätzlich `plant_id`). Diese durchgängige FK-Kette ist die Mindestvoraussetzung, um die in [[07_Technik/Checkpoint_2026-06-10/07_Data_Moat_Audit]] genannten "historischen Paare (Plan-Eingaben → tatsächlicher Ertrag)" für die Prediction Engine zu erzeugen.

### 3.5 Was für Prediction notwendig ist (zusammengefasst)

Aus den obigen Modellen ergibt sich die Mindest-Datenmenge für ein einfaches Prognosemodell (z. B. Ertragsprognose):

1. **Pro Grow**: vollständiges Setup-Profil (`grows` + `strains` + `topfgroesse_liter`/`lichtzyklus`, Abschnitt 1).
2. **Pro Grow**: tatsächlicher Verlauf (`log_entries` mit kontrolliertem `entry_type`-Vokabular, Phasenwechsel-Zeitstempel).
3. **Pro Grow**: `harvests`-Eintrag mit mindestens `ertrag_gramm`, `growdauer_tage`, `qualitaet_rating`.
4. **Pro Diagnose** (optional, verbessert Genauigkeit): `diagnoses` mit befülltem `ergebnis`.
5. **Mindestmenge**: eine ausreichende Zahl abgeschlossener Grows pro Sorten-/Setup-Cluster (Similarity-Gruppe, Abschnitt 2), bevor ein Modell pro Cluster trainiert werden kann — bei sehr wenigen Daten zunächst nur globale Heuristik (wie heute `getPotentialYield()`), nicht ML.

---

## 4. Event-System

### 4.1 Zweck

[[06_Technical_Checkpoint_2026-06-10]] dokumentiert mit `knowledge_events` bereits eine funktionierende, partitionierte Event-Tabelle (Mig14, RANGE auf `created_at`, composite PK `(id, created_at)`). [[07_Technik/Checkpoint_2026-06-10/07_Data_Moat_Audit]] stellt fest: "`diagnostic_launch` ungenutzt" und "keine Verknüpfung zwischen `knowledge_events.user_id` und `grows`/`log_entries`". Dieses Modell erweitert `knowledge_events` konzeptionell um Grow-Kontext-Events, **ohne die bestehende Tabelle umzubauen** — entweder durch zusätzliche `event_type`-Werte + optionales `metadata.grow_id`-Feld, oder durch eine neue parallele, ebenfalls partitionierte Tabelle `grow_events` (Entscheidung offen, siehe 4.5).

### 4.2 Event-Kategorien (Mapping auf Situation/Entscheidung/Ergebnis)

| Event-Typ | Phase im Kernmodell | Beispiel | Heutiger Status |
|---|---|---|---|
| `grow_created` | Situation (Start) | Neuer Grow mit Setup-Profil | Analytics-Event `growCreated` existiert (Plausible), aber nicht mit `grows.id` verknüpft solange TD-01 besteht |
| `phase_changed` | Situation (Update) | Phasenwechsel `vegetation` → `bluete` mit Zeitstempel | Analytics-Event `phaseAdvanced` existiert, aber nicht historisiert in `log_entries`/`grows` |
| `log_entry_added` | Entscheidung | Gießen, Düngen, Training, Notiz | `log_entries` (Migration 11), funktioniert teilweise (nur online + eingeloggt) |
| `recommendation_shown` | Entscheidung (Vorschlag) | Empfehlung aus `lib/grow/insights.ts` angezeigt | nicht erfasst |
| `recommendation_applied` | Entscheidung (Umsetzung) | Nutzer markiert Empfehlung als umgesetzt | nicht erfasst — **zentrale Lücke für Recommendation Engine** |
| `diagnosis_created` | Situation+Entscheidung | Diagnose erstellt (Symptom → Empfehlung) | nur als TS-Typ, kein Backend (TD-19); `diagnostic_launch` in `knowledge_events` ungenutzt |
| `diagnosis_outcome_recorded` | Ergebnis (zeitversetzt) | Follow-up: "Empfehlung X führte zu Y" | nicht erfasst — **zentrale Lücke für Outcome Engine** |
| `harvest_recorded` | Ergebnis (Abschluss) | `harvests`-Eintrag erstellt | Analytics-Event `harvestRecorded` existiert, aber Daten landen nur in `grows.harvest` jsonb, cloud-seitig praktisch leer (TD-01) |
| `grow_abandoned` | Ergebnis (Abbruch) | Grow ohne Ernte beendet (`abbruch_grund`, Abschnitt 1.3) | nicht erfasst — beantwortet offene Frage aus [[02_Grow_Zyklus]] |

### 4.3 Phasenwechsel-Historie (löst Lücke aus Abschnitt 2.3, Punkt 3)

Da `grows.current_phase_id` nur den aktuellen Stand hält, wird jeder Phasenwechsel als `phase_changed`-Event mit `grow_id`, `from_phase`, `to_phase`, `occurred_at` erfasst. Daraus lässt sich für jeden abgeschlossenen Grow die **tatsächliche Dauer pro Phase** rekonstruieren — Voraussetzung für:
- Vergleich Plan (`grows.plan` jsonb) vs. Ist (Similarity-Modell, Abschnitt 2.2)
- Prognose "wie lange dauert Phase X bei Sorte Y typischerweise" (Prediction)

### 4.4 Follow-up-Events für Outcome-Erfassung (löst Abschnitt 3.3)

Damit `diagnoses.ergebnis` und `diagnosis_outcome_recorded` befüllt werden, braucht es einen Auslöser nach Zeitablauf (z. B. "7 Tage nach Diagnose: Frage Nutzer nach Ergebnis"). Dies ist konzeptionell ein **geplantes Event** (vergleichbar mit der bestehenden täglichen `knowledge_events_maintenance`-Pipeline aus [[07_Technik/Checkpoint_2026-06-10/02_Datenmodell]]) — kein neuer Tabellentyp, sondern ein zusätzlicher Scheduled Job, der offene Diagnosen mit `ergebnis IS NULL` und `created_at < now() - interval '7 days'` identifiziert und einen Reminder/Event auslöst.

### 4.5 Offene Designentscheidung: Erweiterung von `knowledge_events` vs. neue Tabelle `grow_events`

Zwei Optionen, **bewusst nicht entschieden** (Aufgabe für Team/Architektur-Review):

- **Option A**: `knowledge_events` erweitern um `grow_id`-Spalte (nullable FK) + neue `event_type`-Werte aus 4.2. Vorteil: ein einziges Event-System, bestehende Partitionierungs-/Wartungsinfrastruktur ([[07_Technik/Checkpoint_2026-06-10/02_Datenmodell]] Funktionen `knowledge_events_ensure_partition`, `knowledge_events_drop_old`) wird wiederverwendet. Nachteil: `knowledge_events` ist laut RLS aktuell "SELECT: nur Staff" — Nutzer bräuchten ggf. Zugriff auf eigene Grow-Events.
- **Option B**: neue, separate partitionierte Tabelle `grow_events` mit eigener RLS (`auth.uid() = user_id`, analog `log_entries_owner`). Vorteil: saubere Trennung Analytics (Staff-only) vs. Nutzer-eigene Grow-Historie. Nachteil: zwei parallele Event-Infrastrukturen.

> Empfehlung dieses Dokuments: **Option B**, da `log_entries` bereits ein nutzersichtbares, RLS-geschütztes Verlaufsmodell etabliert — `grow_events` wäre die konsequente Erweiterung davon um nicht-manuelle (system-generierte) Ereignisse, während `log_entries` für manuelle Nutzereinträge bleibt. Dies ist jedoch eine Architekturentscheidung, kein Fakt — vor Umsetzung im Team klären (vgl. [[05_Decision_Log]]).

---

## 5. Zusammenfassung: Was fehlt — Gesamtübersicht

| Kategorie | Fehlt | Modell-Abschnitt |
|---|---|---|
| Tabelle `strains` | komplett neu | 1.4, 2.3 |
| Tabelle `harvests` | komplett neu (statt `grows.harvest` jsonb) | 1.5, 3.3 |
| Tabelle `diagnoses` | komplett neu (nur TS-Typ vorhanden) | 3.3 |
| Event-Erweiterung (`grow_events` oder `knowledge_events`+`grow_id`) | komplett neu | 4 |
| `grows.strain_id`, `topfgroesse_liter`, `lichtzyklus`, `ended_at`, `abbruch_grund` | neue Spalten | 1.3 |
| CHECK-Constraints / kontrollierte Vokabulare (`medium`, `licht_typ`, `umgebung`, `erfahrung`, `entry_type`) | fehlt | 2.3 |
| Phasenwechsel-Historie | fehlt (nur aktueller Stand) | 4.3 |
| Diagnose-Outcome-Follow-up-Mechanismus | fehlt | 4.4 |
| **Voraussetzung für alles**: TD-01/TD-02-Fix (UUID-Bug) | ungelöst | siehe [[06_Technical_Checkpoint_2026-06-10]] |

---

## Verknüpfte Dokumente

[[06_Data_Moat_Strategie]]
[[01_Datenstrategie]]
[[02_Grow_Zyklus]]
[[04_Diagnosedaten]]
[[05_Erntedaten]]
[[03_Bilddaten]]
[[07_Technik/Checkpoint_2026-06-10/02_Datenmodell]]
[[07_Technik/Checkpoint_2026-06-10/07_Data_Moat_Audit]]
[[06_Technical_Checkpoint_2026-06-10]]
[[08_Organisation/07_Vault_Audit_2026-06-10]]

## Änderungsverlauf

### V1 (10.06.2026)
Erstversion — Data-Moat-Datenmodell (Ziel-, Similarity-, Outcome-Datenmodell, Event-System), basierend auf bestehender SecretLeaf-Dokumentation. Reine Konzeption, kein Code geändert.
