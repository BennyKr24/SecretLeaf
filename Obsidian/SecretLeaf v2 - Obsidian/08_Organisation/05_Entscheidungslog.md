# Entscheidungslog

---

tags: #organisation #entscheidungen #history
status: Aktiv
verknüpft: [[01_Produktentscheidungen]] [[02_FrameNetwork]] [[04_Verworfene_Ideen]]

---

## Zweck

Alle wichtigen strategischen und technischen Entscheidungen werden hier dokumentiert.
Ziel: Keine Entscheidung wird zweimal diskutiert.

---

## Format

Jeder Eintrag enthält:
- **Datum**
- **Entscheidung** (Was wurde entschieden)
- **Kontext** (Warum war die Entscheidung nötig)
- **Begründung** (Warum diese Wahl)
- **Alternativen** (Was wurde verworfen)
- **Status** (Aktiv / Überholt / Revidiert)

---

## Entscheidungen

---

### E001 – North Star Metric: MAG statt DAU

**Datum:** MVP-Phase

**Entscheidung:**
Monthly Active Growers (MAG) ist die primäre Erfolgskennzahl.
Nicht Daily Active Users (DAU) oder Seitenaufrufe.

**Kontext:**
Welche Kennzahl soll das gesamte Unternehmen leiten?

**Begründung:**
Ein aktiver Grower erzeugt Daten. Ein passiver Besucher nicht.
MAG koppelt Nutzerwert direkt an Unternehmenswert.

**Alternativen:**
- DAU: Zu flüchtig, keine Datentiefe
- Seitenaufrufe: Vanity Metric
- Registrierungen: Kein Aktivitätsnachweis

**Status:** Aktiv

---

### E002 – Tech Stack: Next.js + Supabase

**Datum:** MVP-Phase

**Entscheidung:**
Frontend: Next.js 14 (App Router)
Backend/DB: Supabase (PostgreSQL + Auth + Storage)

**Kontext:**
Welcher Tech Stack ermöglicht schnellste MVP-Entwicklung bei langfristiger Skalierbarkeit?

**Begründung:**
- Next.js: SSR für SEO, Vercel-Deployment, großes Ökosystem
- Supabase: PostgreSQL (SQL für Data Moat), Auth inkludiert, Storage inkludiert, kein eigener Server

**Alternativen:**
- Firebase: Kein SQL, erschwerter Data Moat
- Eigener Server: Zu viel DevOps-Overhead
- SvelteKit: Kleineres Ökosystem, weniger KI-Tooling

**Status:** Aktiv

---

### E003 – KI: OpenAI für Bilder, Claude für Text

**Datum:** MVP-Phase

**Entscheidung:**
GPT-4o Vision für Bilddiagnosen.
Anthropic Claude für Textempfehlungen und Wissensfragen.

**Kontext:**
Welche KI-APIs werden für welche Aufgaben eingesetzt?

**Begründung:**
- GPT-4o Vision: Beste Bildanalyse-Qualität für botanische Symptome
- Claude: Stärkere Reasoning-Qualität für komplexe Empfehlungen

**Alternativen:**
- Nur OpenAI: Höherer Lock-in, Claude ist für Texte besser
- Nur Claude: Claude Vision ist schwächer bei Bilddiagnosen
- Eigenes Modell: Zu früh, braucht proprietäre Trainingsdaten

**Status:** Aktiv

---

### E004 – Kein Forum im MVP

**Datum:** MVP-Phase

**Entscheidung:**
Kein Community-Forum im MVP.

**Kontext:**
Community-Features wurden diskutiert.

**Begründung:**
Community ohne kritische Masse ist leer und wirkt negativ.
Daten ohne Struktur helfen dem Data Moat nicht.
Ressourcen werden für Core-Product benötigt.

**Alternativen:**
- Forum sofort: Leere Foren schrecken ab
- Discord-Integration: Mögliche Post-MVP-Option

**Status:** Aktiv

---

### E005 – Freemium statt Paywall

**Datum:** MVP-Phase

**Entscheidung:**
Freemium-Modell: Core-Features kostenlos, Premium als Upgrade.

**Kontext:**
Welches Geschäftsmodell maximiert MAG und Data Moat?

**Begründung:**
- Mehr Nutzer = mehr Daten = besserer Data Moat
- Vertrauen aufbauen bevor monetarisiert wird
- Premium soll durch echten Mehrwert, nicht Einschränkungen konvertieren

**Alternativen:**
- Komplett kostenlos: Kein Umsatz
- Sofortige Paywall: Zu früh, verhindert Data Moat Aufbau
- Reine Werbefinanzierung: Widerspricht Produktphilosophie

**Status:** Aktiv

---

## Offene Entscheidungen

- [ ] E006: Welche OAuth Provider beim Launch? (Google / Apple / Discord)
- [ ] E007: Launch-Sprache Deutsch oder Englisch?
- [ ] E008: Mobile App – React Native oder PWA zuerst?
- [ ] E009: Pricing – 9,99 EUR oder 12,99 EUR für Premium?
- [ ] E010: Soll `apps/api` (Fastify-Marketplace) archiviert/entfernt oder reaktiviert werden? Vermutete Altlast eines früheren Pivots, siehe [[06_Technical_Checkpoint_2026-06-10]] (DL-02/TD-03/TD-04).

---

### E0xx (Pending) – Fix-Reihenfolge nach Audit vom 10.06.2026

**Datum:** 10.06.2026

**Kontext:**
Vollständiges Repository-Audit hat den kritischen UUID-Bug (TD-01/TD-02) als Ursache dafür identifiziert, dass Grow-Daten nicht in Supabase gespeichert werden. Vollständige Findings in [[06_Technical_Checkpoint_2026-06-10]] und `CHECKPOINT_2026-06-10/`.

**Status:** Noch keine Entscheidung — Fix-Plan erst nach Bestätigung durch Founder/Team, gemäß Auftrag "erst Analyse, dann Fix-Plan".

