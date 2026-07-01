# Onboarding Flow

---

tags: #produkt #ux #aktivierung #flow
status: Entwurf
priorität: Tier S
verknüpft: [[02_User_Flows]] [[05_Aktivierungssystem]] [[01_Grow_Tagebuch_Spec]] [[02_Dashboard_Spec]] [[01_User_Personas]]

---

## Zweck

Dieses Dokument definiert den Onboarding-Prozess von SecretLeaf.
Onboarding ist der kritischste Moment der gesamten Nutzerreise.
Ein schlechtes Onboarding bedeutet: Nutzer kommt, sieht nichts, geht nie wieder.

## Kernprinzip

Onboarding endet nicht nach der Registrierung.
Onboarding endet beim ersten Aha-Moment.

**Aha-Moment:** Nutzer erhält eine hilfreiche Diagnose für seine Pflanze.

---

## Aktivierungs-Definition

Ein Nutzer ist aktiviert, wenn er **innerhalb von 10 Minuten nach Registrierung**:

1. Einen Grow erstellt hat
2. Ein Bild hochgeladen hat
3. Eine Diagnose erhalten hat

Jeder Schritt der diesen Pfad verlängert, ist ein Problem.

---

## Onboarding-Flow (Step by Step)

### Schritt 0: Landing Page

**Ziel:** Nutzer versteht in 5 Sekunden was SecretLeaf ist.

**Hero-Aussage:**
> "Dein persönlicher KI-Berater für Cannabis-Grows.
> Erkenne Probleme sofort. Dokumentiere alles. Werde besser."

**CTA:** "Kostenlos starten" (kein "Mehr erfahren" als primärer CTA)

**Social Proof:** "Bereits von X Growern genutzt"

---

### Schritt 1: Registrierung

**Felder (minimal):**
- E-Mail
- Passwort

**Optional später:** Name, Land

**Prinzip:** Kein Formular das länger als 20 Sekunden dauert.

**Nach Registrierung:** Direkte Weiterleitung zum Onboarding-Wizard. Kein leeres Dashboard.

---

### Schritt 2: Onboarding-Wizard (3 Schritte)

**Fortschrittsanzeige:** Schritt 1 von 3 (damit Nutzer weiß, es hört auf)

#### Wizard Schritt 1: "Bist du gerade am Anbauen?"

```
[Ja, ich habe gerade einen aktiven Grow]
[Nein, ich plane meinen ersten Grow]
[Ich möchte mich zuerst informieren]
```

**Routing:**
- "Ja" → Direkt zu "Grow erstellen"
- "Nein" → Vereinfachter Flow + Wissenssystem zeigen
- "Informieren" → Wissenssystem, sanftere Onboarding-Variante

---

#### Wizard Schritt 2: "Erzähl mir von deinem Grow"

Minimales Formular:

```
Grow-Name:        [Mein erster Grow]
Sorte:            [z.B. Gelato]
Medium:           [Erde] [Coco] [Hydro]
Indoor/Outdoor:   [Indoor] [Outdoor]
Startdatum:       [Heute] [Datum wählen]
```

**CTA:** "Grow erstellen →"

**Hinweis unter dem Button:** "Du kannst alles später noch ändern."

---

#### Wizard Schritt 3: "Lade dein erstes Bild hoch"

```
[Kamera Icon]
Lade ein Foto deiner Pflanze hoch.
Wir analysieren es sofort mit KI.

[Datei auswählen] oder [Foto aufnehmen]

(Optional: Beschreibung hinzufügen)
```

**Skip-Möglichkeit:** "Noch kein Foto? Überspringen →" (immer sichtbar)

---

### Schritt 3: Diagnose-Ergebnis

Nach dem Bild-Upload: Sofortige Diagnose.

```
Analyse läuft... (Loading Animation, ~3–5 Sekunden)
```

**Ergebnis-Screen:**

```
✅ Analyse abgeschlossen

Wahrscheinlichste Ursache:
Calcium-Mangel (87% Konfidenz)

Was du jetzt tun kannst:
→ CalMag-Lösung zugeben (2ml/L)
→ pH auf 6.2–6.5 überprüfen
→ In 5 Tagen erneut Bild hochladen

[In meinem Grow speichern] [Neue Diagnose]
```

**Dieser Moment ist der Aha-Moment.**

---

### Schritt 4: Dashboard (nach Onboarding)

Nach dem ersten Aha-Moment: Dashboard zeigen.

```
Willkommen bei SecretLeaf! 🌱

Dein Grow ist erstellt.
Deine erste Diagnose ist gespeichert.

Was als Nächstes:
→ Füge täglich Einträge hinzu
→ Lade regelmäßig Bilder hoch
→ Dein Dashboard wächst mit

[Dashboard öffnen]
```

---

## Kritische Metriken

| Metrik | Ziel |
|---|---|
| Schritt 1 → Schritt 2 Conversion | >70% |
| Schritt 2 → Grow erstellt | >60% |
| Grow erstellt → Bild hochgeladen | >50% |
| Bild hochgeladen → Diagnose erhalten | >90% |
| **Gesamt-Aktivierungsrate** | **>30%** |

**Industry Benchmark:** 20–40% Aktivierungsrate für Tool-Apps.
**Unser Ziel:** 30%+ durch maximale Reibungslosigkeit.

---

## Onboarding E-Mail-Sequenz

### E-Mail 1 (sofort): Welcome

```
Betreff: Willkommen bei SecretLeaf 🌿

Dein Konto ist bereit.
Lade dein erstes Bild hoch und erhalte sofort eine KI-Diagnose.

[Jetzt starten]
```

### E-Mail 2 (nach 24h, wenn kein Grow erstellt):

```
Betreff: Hast du schon einen aktiven Grow?

Noch kein Grow erstellt? Kein Problem.
Es dauert weniger als 60 Sekunden.

[Ersten Grow erstellen]
```

### E-Mail 3 (nach 7 Tagen, wenn keine Diagnose):

```
Betreff: Wie geht es deinen Pflanzen?

Unser KI-System kann dir in Sekunden sagen,
ob deine Pflanze gesund ist.

Lade einfach ein Foto hoch.

[Diagnose starten]
```

---

## Onboarding-Variante: Kein aktiver Grow

Für Nutzer die "Nein" oder "Informieren" wählen:

1. Wissenssystem zeigen ("Lies: Cannabis anbauen Anfänger-Guide")
2. Rechner anbieten (VPD, Dünger)
3. Nach 3 Tagen: E-Mail "Bist du bereit für deinen ersten Grow?"

Diese Nutzer konvertieren langsamer, aber konvertieren.

---

## Häufige Onboarding-Fehler (vermeiden)

- ❌ Zu viele Pflichtfelder im Registrierungsformular
- ❌ Nutzer landet nach Registrierung auf leerem Dashboard ohne Guidance
- ❌ Kein sofortiger Mehrwert in den ersten 5 Minuten
- ❌ Komplexe Tutorials statt sofortiger Aktion
- ❌ Kein Skip-Button bei optionalen Schritten
- ❌ Loading ohne Fortschrittsanzeige bei der Diagnose

---

## A/B Test Ideen

- **Test 1:** Mit vs. ohne Onboarding-Wizard
- **Test 2:** "Bild hochladen" sofort vs. zuerst Grow erstellen
- **Test 3:** Sofortige Diagnose vs. "Demo-Diagnose" ohne Bild

## Verknüpfte Dokumente

[[02_User_Flows]]
[[05_Aktivierungssystem]]
[[01_Grow_Tagebuch_Spec]]
[[02_Dashboard_Spec]]
[[01_User_Personas]]
[[06_MVP_Launch_Checklist]]

## Änderungsverlauf

### V1
Erstversion
