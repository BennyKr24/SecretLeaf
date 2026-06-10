# UPDATE_TEMPLATE.md

Vorlage für alle öffentlich sichtbaren SecretLeaf-Updates.

**Verwendung:**
Kopiere das gewünschte Template, fülle alle Platzhalter aus und entferne leere Sektionen.
Veröffentliche das fertige Update unter `/updates/[slug]`.

---

## Variante A — Standard Update (Regelfall)

Für Features, Verbesserungen, Korrekturen und Datenbank-Erweiterungen.

---

```
---
title: "[Update-Titel]"
slug: "[update-titel-als-url]"
date: "YYYY-MM-DD"
version: "vX.X.X"
category: "Feature | Diagnose | Grow OS | Datenbank | Performance | Fixes | Mobile"
featured: false
---
```

---

# [Update-Titel]

**Version [vX.X.X] — [Datum, ausgeschrieben]**

[Einleitung: 2–4 Sätze. Was wurde verbessert und warum ist das relevant für den Grower?
Kein Marketing-Sprech. Direkt, klar, ehrlich.]

---

## Neu

### [Feature-Name]

[Beschreibung in 2–5 Sätzen. Was kann der Nutzer jetzt tun, was vorher nicht möglich war?]

**Das bringt es:**

- [Konkreter Nutzen 1]
- [Konkreter Nutzen 2]
- [Konkreter Nutzen 3]

---

## Verbessert

### [Bereich oder Komponente]

[Was wurde geändert und warum. Keine technischen Details die den Nutzer nicht interessieren.]

**Vorher / Nachher:**

- Vorher: [Zustand]
- Nachher: [Verbesserter Zustand]

---

## Datenbank

### [Datenquelle oder Bereich]

[Welche Daten wurden ergänzt oder aktualisiert.]

**Neue Inhalte:**

- [X] neue Strains
- [X] neue Symptome
- [X] neue Quellen
- [X] neue Nährstoffprofile

---

## Diagnose

### [Diagnose-Bereich]

[Was wurde an der Diagnose verbessert. Welche Erkrankungen, Mängel oder Schädlinge werden jetzt besser erkannt.]

**Verbesserte Erkennungsrate:**

- [Symptombereich 1]
- [Symptombereich 2]

---

## Performance

[Was wurde schneller, stabiler oder effizienter.]

- [Optimierung 1]
- [Optimierung 2]

---

## Korrekturen

- [Fehler behoben: kurze Beschreibung]
- [Fehler behoben: kurze Beschreibung]

---

## Als Nächstes

Daran arbeiten wir gerade:

- [Feature / Bereich 1]
- [Feature / Bereich 2]
- [Feature / Bereich 3]

---

Feedback und Ideen sind willkommen.

**SecretLeaf Team**

---
---

## Variante B — Major Release (Versionen mit Nummernsprung, z. B. v2.0, v3.0)

Für bedeutende Produkt-Updates, die mehrere Bereiche gleichzeitig verändern.

---

```
---
title: "SecretLeaf [vX.0] — [Release-Name]"
slug: "secretleaf-vX-0-[release-name]"
date: "YYYY-MM-DD"
version: "vX.0.0"
category: "Major Release"
featured: true
---
```

---

# SecretLeaf [vX.0] — [Release-Name]

**[Datum, ausgeschrieben]**

[Einleitung: 3–6 Sätze. Was war der Antrieb für dieses Release? Was ändert sich grundlegend für den Nutzer?
Ehrlich und konkret — nicht übertreiben.]

---

## Was neu ist

### [Kernfeature 1]

[Beschreibung: Was ist das? Warum ist es wichtig?]

### [Kernfeature 2]

[Beschreibung]

### [Kernfeature 3]

[Beschreibung]

### [Kernfeature 4]

[Beschreibung]

---

## Warum dieses Update wichtig ist

[1–3 Absätze. Erkläre den strategischen Nutzen aus Nutzerperspektive.
Was war das Problem? Wie löst das Update es?
Keine Feature-Liste — echten Wert beschreiben.]

---

## Zahlen dieses Releases

- +[X] neue Datensätze
- +[X] neue Strains
- +[X] neue Symptome
- +[X] % schnellere Ladezeiten
- +[X] % genauere Diagnosen

---

## Was als Nächstes kommt

- [Bereich / Feature 1]
- [Bereich / Feature 2]
- [Bereich / Feature 3]

---

Danke, dass ihr SecretLeaf nutzt und mit uns aufbaut.

**SecretLeaf Team**

---
---

## Regeln für alle Updates

### Sprache

- Deutsch. Immer.
- Fachbegriffe aus dem Cannabis-Anbau korrekt verwenden (siehe LOCALIZATION.md)
- Kein Google-Translate-Ton. Kein Marketing-Sprech.
- Direkt und ehrlich. Wie ein erfahrener Grower, nicht wie ein Startup.

### Ton

- Kompetent, nicht überheblich
- Klar, nicht vereinfacht
- Ehrlich über Grenzen und nächste Schritte

### Sektionen

- Leere Sektionen werden entfernt — kein „Keine Änderungen in diesem Bereich"
- Minimum: Einleitung + eine inhaltliche Sektion + Als Nächstes
- Maximum: alle Sektionen befüllt, wenn der Release es rechtfertigt

### Kategorien (Pflichtfeld)

| Wert | Bedeutung |
|---|---|
| `Feature` | Neue Funktion |
| `Diagnose` | Verbesserungen am Diagnose-System |
| `Grow OS` | Änderungen am Grow-Kern (Tracking, Log, Phasen) |
| `Datenbank` | Neue oder aktualisierte Daten |
| `Performance` | Geschwindigkeit, Stabilität, Infrastruktur |
| `Fixes` | Nur Fehlerbehebungen ohne neue Features |
| `Mobile` | Mobile-spezifische Verbesserungen |
| `Major Release` | Versionsnummernsprung (vX.0) |

### featured

- `true`: Wird prominent auf der Updates-Seite hervorgehoben
- `false`: Normaler Listeneintrag
- Maximal **ein** featured Update gleichzeitig sichtbar

---

*Dokument: UPDATE_TEMPLATE.md | Zuletzt aktualisiert: 2026-06-01*
